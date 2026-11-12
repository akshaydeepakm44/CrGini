import crypto from 'node:crypto';
import { query } from '../config/postgres.js';
import { createProspect, cleanSlug } from '../services/prospectService.js';
import { relocateStagedAsset } from '../services/prospectRelocationService.js';
import { createNotification } from '../repositories/notificationRepository.js';
import { generateOutreachMailTemplate } from '../services/mailTemplateService.js';
import { validateExternalUrl } from '../services/ssrfFilter.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_BATCH_PROSPECTS = 20;

/**
 * Normalizes input prospect item whether fields are flat or nested under targetCompany/mailOptions.
 */
function normalizeProspectInput(raw) {
  const target = raw.targetCompany || {};
  const mail = raw.mailOptions || {};

  return {
    companyName: target.name || raw.companyName || '',
    website: target.website || raw.website || '',
    industry: target.industry || raw.industry || '',
    category: target.category || raw.category || '',
    slug: target.slug || raw.slug || null,
    title: raw.title || null,
    description: raw.description || '',
    logoUrl: target.logoUrl || raw.logoUrl || null,
    logoAssetKey: raw.logoAssetKey || null,
    externalProspectId: raw.externalProspectId || '',
    status: raw.status || 'DRAFT',
    companyStudy: raw.companyStudy || {},
    leads: Array.isArray(raw.leads) ? raw.leads : [],
    pitchDeck: raw.pitchDeck || {},
    mailOptions: {
      senderName: mail.senderName || '',
      senderTitle: mail.senderTitle || '',
      senderEmail: mail.senderEmail || '',
      targetLeadIndex: typeof mail.targetLeadIndex === 'number' ? mail.targetLeadIndex : 0,
    },
    outreachMailTemplate: raw.outreachMailTemplate || null,
  };
}

/**
 * Validates asset keys ownership and STAGED status for a given client.
 */
async function verifyClientStagedAssets(assetKeys, clientId) {
  for (const aKey of assetKeys) {
    const assetCheck = await query(
      `SELECT id, asset_key, client_id, status, expires_at
       FROM integration_assets
       WHERE asset_key = $1`,
      [aKey]
    );

    if (assetCheck.rows.length === 0) {
      const err = new Error(`Referenced asset key '${aKey}' does not exist.`);
      err.code = 'INVALID_ASSET_KEY';
      err.status = 400;
      throw err;
    }

    const assetRow = assetCheck.rows[0];
    if (assetRow.client_id !== clientId) {
      const err = new Error(`Referenced asset key '${aKey}' does not belong to the authenticated client.`);
      err.code = 'INVALID_ASSET_KEY';
      err.status = 400;
      throw err;
    }

    if (assetRow.status !== 'STAGED') {
      const err = new Error(`Referenced asset key '${aKey}' is not staged (current status: ${assetRow.status}).`);
      err.code = 'INVALID_ASSET_KEY';
      err.status = 400;
      throw err;
    }

    if (new Date(assetRow.expires_at).getTime() < Date.now()) {
      const err = new Error(`Referenced asset key '${aKey}' has expired.`);
      err.code = 'INVALID_ASSET_KEY';
      err.status = 400;
      throw err;
    }
  }
}

/**
 * POST /api/integration/v1/prospects/batch
 * Ingests an array of prospects (up to 20). Returns HTTP 207 Multi-Status.
 */
export async function createIntegrationProspectBatch(req, res) {
  const clientId = req.apiClient.clientId;
  const payload = req.body || {};

  const {
    externalCampaignId,
    campaignName = '',
    operatorEmail = '',
    prospects = [],
  } = payload;

  if (!externalCampaignId || typeof externalCampaignId !== 'string' || !externalCampaignId.trim()) {
    return res.status(400).json({
      success: false,
      error: 'MISSING_CAMPAIGN_ID',
      message: 'externalCampaignId is required.',
    });
  }

  if (!Array.isArray(prospects) || prospects.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'EMPTY_PROSPECTS_ARRAY',
      message: 'prospects must be a non-empty array of prospect objects.',
    });
  }

  if (prospects.length > MAX_BATCH_PROSPECTS) {
    return res.status(400).json({
      success: false,
      error: 'MAX_BATCH_SIZE_EXCEEDED',
      message: `Batch exceeds maximum size of ${MAX_BATCH_PROSPECTS} prospects per request.`,
    });
  }

  // Validate operator/sender email if client has sender constraints
  const effectiveSenderEmail = operatorEmail ? String(operatorEmail).trim() : 'campaign@dizitalgini.com';
  if (req.apiClient.allowedSenderEmails && req.apiClient.allowedSenderEmails.length > 0) {
    if (!req.apiClient.allowedSenderEmails.includes(effectiveSenderEmail)) {
      return res.status(400).json({
        success: false,
        error: 'SENDER_EMAIL_NOT_ALLOWED',
        message: `Sender email '${effectiveSenderEmail}' is not in the allowed sender emails list for this API client.`,
      });
    }
  }

  const batchId = payload.batchId || crypto.randomUUID();

  // 1. Initialize batch tracking row
  await query(
    `INSERT INTO integration_batches (
      id,
      client_id,
      external_campaign_id,
      pushed_by_email,
      total_count,
      success_count,
      fail_count,
      status
    ) VALUES ($1, $2, $3, $4, $5, 0, 0, 'IN_PROGRESS')
    ON CONFLICT (id) DO UPDATE SET
      total_count = integration_batches.total_count + EXCLUDED.total_count,
      status = 'IN_PROGRESS'`,
    [
      batchId,
      clientId,
      externalCampaignId.trim(),
      effectiveSenderEmail,
      prospects.length,
    ]
  );

  // 2. Log BATCH_RECEIVED event
  await query(
    `INSERT INTO integration_events (batch_id, event_type, payload)
     VALUES ($1, 'BATCH_RECEIVED', $2)`,
    [
      batchId,
      JSON.stringify({
        campaignName,
        externalCampaignId: externalCampaignId.trim(),
        prospectCount: prospects.length,
        operatorEmail: effectiveSenderEmail,
      }),
    ]
  ).catch(() => {});

  const results = [];
  let successCount = 0;
  let failCount = 0;

  // 3. Process each prospect with isolated error boundary
  for (let idx = 0; idx < prospects.length; idx++) {
    const rawProspect = prospects[idx];
    const p = normalizeProspectInput(rawProspect);
    const warnings = [];

    if (!p.companyName || !p.companyName.trim()) {
      failCount++;
      results.push({
        index: idx,
        externalProspectId: p.externalProspectId || `index_${idx}`,
        status: 'FAILED',
        error: 'VALIDATION_ERROR',
        message: 'Target company name is required.',
      });
      continue;
    }

    if (!p.externalProspectId || !p.externalProspectId.trim()) {
      failCount++;
      results.push({
        index: idx,
        externalProspectId: `index_${idx}`,
        status: 'FAILED',
        error: 'VALIDATION_ERROR',
        message: 'externalProspectId is required.',
      });
      continue;
    }

    try {
      // A. SSRF Check on logoUrl
      if (p.logoUrl) {
        const ssrfCheck = await validateExternalUrl(p.logoUrl);
        if (!ssrfCheck.safe) {
          const ssrfErr = new Error(`Logo URL is rejected for security: ${ssrfCheck.error}`);
          ssrfErr.code = ssrfCheck.error;
          ssrfErr.status = 400;
          throw ssrfErr;
        }
      }

      // B. Deduplication Check against existing showcases
      const existingRes = await query(
        `SELECT id, slug, status, company_study, leads
         FROM public_sample_showcases
         WHERE source_platform = 'DIZITALGINI'
           AND external_campaign_id = $1
           AND external_prospect_id = $2`,
        [externalCampaignId.trim(), p.externalProspectId.trim()]
      );

      if (existingRes.rows.length > 0) {
        const existingRow = existingRes.rows[0];
        // Compare payload hash or company name
        const payloadSnapshot = crypto.createHash('sha256').update(JSON.stringify(rawProspect)).digest('hex');
        const existingSnapshot = crypto.createHash('sha256').update(JSON.stringify({
          companyName: p.companyName,
          companyStudy: existingRow.company_study,
        })).digest('hex');

        // Check if identical or conflicting
        if (payloadSnapshot === existingSnapshot || existingRow.slug.startsWith(cleanSlug(p.companyName))) {
          successCount++;
          results.push({
            index: idx,
            externalProspectId: p.externalProspectId.trim(),
            status: 'EXISTING',
            id: existingRow.id,
            slug: existingRow.slug,
            publicUrl: existingRow.status === 'PUBLISHED' ? `/samples/${existingRow.slug}` : null,
          });
          continue;
        } else {
          const conflictErr = new Error(`Prospect '${p.externalProspectId}' already exists under campaign '${externalCampaignId}' with conflicting payload.`);
          conflictErr.code = 'DUPLICATE_EXTERNAL_PROSPECT';
          conflictErr.status = 409;
          throw conflictErr;
        }
      }

      // C. Collect asset keys to claim
      const assetKeysToClaim = [];
      if (p.companyStudy?.pdfAssetKey) assetKeysToClaim.push(p.companyStudy.pdfAssetKey);
      if (p.pitchDeck?.assetKey) assetKeysToClaim.push(p.pitchDeck.assetKey);
      if (p.pitchDeck?.pdfAssetKey) assetKeysToClaim.push(p.pitchDeck.pdfAssetKey);
      if (p.logoAssetKey) assetKeysToClaim.push(p.logoAssetKey);

      for (const lead of p.leads) {
        if (lead.pitchDeckAssetKey) assetKeysToClaim.push(lead.pitchDeckAssetKey);
        if (lead.leadStudyPdfAssetKey) assetKeysToClaim.push(lead.leadStudyPdfAssetKey);
      }

      // D. Verify staged asset keys
      await verifyClientStagedAssets(assetKeysToClaim, clientId);

      // E. Downgrade to DRAFT if client lacks allowAutoPublish
      let effectiveStatus = 'DRAFT';
      if (req.apiClient.allowAutoPublish === true && p.status === 'PUBLISHED') {
        effectiveStatus = 'PUBLISHED';
      } else if (p.status === 'PUBLISHED' && !req.apiClient.allowAutoPublish) {
        effectiveStatus = 'DRAFT';
        warnings.push('PUBLISHED status downgraded to DRAFT (client lacks allow_auto_publish permission).');
      }

      // F. Generate slug with short random suffix to prevent guessing
      let targetSlug;
      if (p.slug && p.slug.trim()) {
        targetSlug = cleanSlug(p.slug.trim());
      } else {
        const base = cleanSlug(p.companyName);
        const randSuffix = crypto.randomBytes(3).toString('hex');
        targetSlug = `${base}-${randSuffix}`;
      }

      // G. Relocate staged assets to permanent paths
      const updatedCompanyStudy = { ...p.companyStudy };
      if (updatedCompanyStudy.pdfAssetKey) {
        const permKey = await relocateStagedAsset({
          clientId,
          assetKey: updatedCompanyStudy.pdfAssetKey,
          targetPrefix: `public-samples/${targetSlug}/company-study`,
        });
        updatedCompanyStudy.pdfAssetKey = permKey;
        updatedCompanyStudy.pdfUrl = `/api/samples/${targetSlug}/company-study-pdf`;
      }

      let updatedLogoAssetKey = p.logoAssetKey;
      if (p.logoAssetKey) {
        updatedLogoAssetKey = await relocateStagedAsset({
          clientId,
          assetKey: p.logoAssetKey,
          targetPrefix: `public-samples/${targetSlug}/logo`,
        });
      }

      const updatedLeads = [];
      for (const lead of p.leads) {
        const leadCopy = { ...lead };
        const leadId = leadCopy.id || `lead-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        leadCopy.id = leadId;

        if (leadCopy.pitchDeckAssetKey) {
          const permPitchKey = await relocateStagedAsset({
            clientId,
            assetKey: leadCopy.pitchDeckAssetKey,
            targetPrefix: `public-samples/${targetSlug}/leads/${leadId}/pitch-deck`,
          });
          leadCopy.pitchDeckAssetKey = permPitchKey;
          leadCopy.pitchDeck = {
            ...(leadCopy.pitchDeck || {}),
            assetKey: permPitchKey,
            streamUrl: `/api/samples/${targetSlug}/leads/${leadId}/pitch-deck`,
            downloadUrl: `/api/samples/${targetSlug}/leads/${leadId}/pitch-deck?download=true`,
          };
        }

        if (leadCopy.leadStudyPdfAssetKey) {
          const permStudyKey = await relocateStagedAsset({
            clientId,
            assetKey: leadCopy.leadStudyPdfAssetKey,
            targetPrefix: `public-samples/${targetSlug}/leads/${leadId}/lead-study`,
          });
          leadCopy.leadStudyPdfAssetKey = permStudyKey;
          leadCopy.leadStudyPdf = `/api/samples/${targetSlug}/leads/${leadId}/lead-study-pdf`;
        }

        updatedLeads.push(leadCopy);
      }

      // H. Generate outreach mail template via mailTemplateService
      const primaryLead = updatedLeads[p.mailOptions.targetLeadIndex] || updatedLeads[0] || {};
      const mailTemplate = generateOutreachMailTemplate({
        companyName: p.companyName.trim(),
        lead: primaryLead,
        showcaseSlug: targetSlug,
        sender: {
          name: p.mailOptions.senderName,
          title: p.mailOptions.senderTitle,
          email: p.mailOptions.senderEmail || effectiveSenderEmail,
        },
      });

      // I. Create showcase in database
      const created = await createProspect({
        slug: targetSlug,
        title: p.title,
        companyName: p.companyName.trim(),
        description: p.description,
        logoUrl: p.logoUrl,
        logoAssetKey: updatedLogoAssetKey,
        status: effectiveStatus,
        companyStudy: updatedCompanyStudy,
        leads: updatedLeads,
        pitchDeck: p.pitchDeck,
        sourcePlatform: 'DIZITALGINI',
        externalCampaignId: externalCampaignId.trim(),
        externalProspectId: p.externalProspectId.trim(),
        createdByEmail: effectiveSenderEmail,
        batchId,
        outreachMailTemplate: mailTemplate,
      }, { allowSlugIncrement: false });

      // J. Mark assets as CLAIMED
      if (assetKeysToClaim.length > 0) {
        await query(
          `UPDATE integration_assets
           SET status = 'CLAIMED',
               claimed_by = $1
           WHERE asset_key = ANY($2::text[])`,
          [created.id, assetKeysToClaim]
        );
      }

      // K. Log events
      await query(
        `INSERT INTO integration_events (batch_id, event_type, payload)
         VALUES ($1, 'PROSPECT_CREATED', $2), ($1, 'MAIL_TEMPLATE_GENERATED', $3)`,
        [
          batchId,
          JSON.stringify({
            showcaseId: created.id,
            slug: created.slug,
            externalProspectId: p.externalProspectId.trim(),
            status: created.status,
          }),
          JSON.stringify({
            showcaseId: created.id,
            subject: mailTemplate.subject,
            recipientEmail: mailTemplate.recipientEmail,
          }),
        ]
      ).catch(() => {});

      successCount++;
      results.push({
        index: idx,
        externalProspectId: p.externalProspectId.trim(),
        status: 'CREATED',
        id: created.id,
        slug: created.slug,
        publicUrl: `/samples/${created.slug}`,
        showcaseStatus: created.status,
        warnings,
      });
    } catch (itemErr) {
      failCount++;
      // Log PROSPECT_FAILED event
      await query(
        `INSERT INTO integration_events (batch_id, event_type, payload)
         VALUES ($1, 'PROSPECT_FAILED', $2)`,
        [
          batchId,
          JSON.stringify({
            externalProspectId: p.externalProspectId || `index_${idx}`,
            error: itemErr.code || 'CREATION_FAILED',
            message: itemErr.message,
          }),
        ]
      ).catch(() => {});

      results.push({
        index: idx,
        externalProspectId: p.externalProspectId || `index_${idx}`,
        status: 'FAILED',
        error: itemErr.code || 'ITEM_CREATION_FAILED',
        message: itemErr.message,
      });
    }
  }

  // 4. Update batch completion state
  const finalBatchStatus = payload.isSinglePush && payload.batchId
    ? 'IN_PROGRESS'
    : (failCount === 0 ? 'COMPLETED' : successCount > 0 ? 'PARTIAL' : 'FAILED');

  await query(
    `UPDATE integration_batches
     SET total_count = CASE WHEN $1 = 'IN_PROGRESS' THEN total_count ELSE CASE WHEN total_count < $2 THEN $2 ELSE total_count END END,
         success_count = integration_batches.success_count + $3,
         fail_count = integration_batches.fail_count + $4,
         status = $1,
         completed_at = CASE WHEN $1 = 'IN_PROGRESS' THEN NULL ELSE NOW() END
     WHERE id = $5`,
    [finalBatchStatus, prospects.length, successCount, failCount, batchId]
  );

  // 5. Log BATCH_COMPLETED event
  await query(
    `INSERT INTO integration_events (batch_id, event_type, payload)
     VALUES ($1, 'BATCH_COMPLETED', $2)`,
    [
      batchId,
      JSON.stringify({
        status: finalBatchStatus,
        total: prospects.length,
        success: successCount,
        failed: failCount,
      }),
    ]
  ).catch(() => {});

  // 6. Create admin in-app notification
  const adminUsersRes = await query("SELECT id FROM users WHERE role IN ('ADMIN', 'SUPER_ADMIN')").catch(() => ({ rows: [] }));
  const notifTitle = `New campaign pushed from DizitalGini: ${campaignName || externalCampaignId}`;
  const notifMsg = `Batch ${batchId.slice(0, 8)}: ${successCount} drafts ready for review (${failCount} failed).`;

  for (const admin of adminUsersRes.rows) {
    await createNotification({
      userId: admin.id,
      type: 'INTEGRATION_BATCH_CREATED',
      title: notifTitle,
      message: notifMsg,
    }).catch(() => {});

    await createNotification({
      userId: admin.id,
      type: 'INTEGRATION_PROSPECT_CREATED',
      title: `New prospect pushed from DizitalGini: ${prospects[0]?.companyName || campaignName || externalCampaignId}`,
      message: `Campaign: ${externalCampaignId} | ${successCount} drafts created`,
    }).catch(() => {});
  }

  // Return HTTP 207 Multi-Status
  return res.status(207).json({
    success: true,
    batchId,
    status: finalBatchStatus,
    summary: {
      total: prospects.length,
      created: results.filter((r) => r.status === 'CREATED').length,
      existing: results.filter((r) => r.status === 'EXISTING').length,
      failed: failCount,
    },
    results,
  });
}

/**
 * Single prospect create (POST /api/integration/v1/prospects).
 * Re-uses batch ingestion internally for 100% parity and safety.
 */
export async function createIntegrationProspect(req, res) {
  const payload = req.body || {};
  const batchId = payload.batchId || crypto.randomUUID();

  // Wrap single prospect into batch format
  const batchReq = {
    ...req,
    body: {
      batchId,
      externalCampaignId: payload.externalCampaignId,
      campaignName: payload.companyName || 'Single Prospect Push',
      operatorEmail: payload.pushedByEmail || '',
      prospects: [payload],
      isSinglePush: true,
    },
  };

  const mockRes = {
    statusCode: 200,
    headers: {},
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      if (this.statusCode === 207 && data.results && data.results.length > 0) {
        const item = data.results[0];
        if (item.status === 'FAILED') {
          const errStatus = item.error === 'DUPLICATE_EXTERNAL_PROSPECT' ? 409 : 400;
          return res.status(errStatus).json({
            success: false,
            error: item.error,
            message: item.message,
          });
        }
        return res.status(201).json({
          success: true,
          id: item.id,
          slug: item.slug,
          publicUrl: item.publicUrl,
          status: item.showcaseStatus,
          campaignId: payload.externalCampaignId,
          prospectId: payload.externalProspectId,
        });
      }
      return res.status(this.statusCode).json(data);
    },
  };

  return createIntegrationProspectBatch(batchReq, mockRes);
}

/**
 * GET /api/integration/v1/batches/:batchId
 * Status polling for a push batch.
 */
export async function getIntegrationBatch(req, res) {
  const { batchId } = req.params;
  const clientId = req.apiClient.clientId;

  try {
    const batchRes = await query(
      `SELECT id, client_id, external_campaign_id, pushed_by_email, total_count, success_count, fail_count, status, created_at, completed_at
       FROM integration_batches
       WHERE id = $1 AND client_id = $2`,
      [batchId, clientId]
    );

    if (batchRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'BATCH_NOT_FOUND',
        message: `Batch '${batchId}' not found.`,
      });
    }

    const batch = batchRes.rows[0];

    const showcasesRes = await query(
      `SELECT id, slug, company_name, status, external_prospect_id, created_at
       FROM public_sample_showcases
       WHERE batch_id = $1
       ORDER BY id ASC`,
      [batchId]
    );

    const eventsRes = await query(
      `SELECT event_type, payload, created_at
       FROM integration_events
       WHERE batch_id = $1
       ORDER BY created_at ASC`,
      [batchId]
    );

    return res.status(200).json({
      success: true,
      batch: {
        id: batch.id,
        externalCampaignId: batch.external_campaign_id,
        status: batch.status,
        counts: {
          total: batch.total_count,
          success: batch.success_count,
          failed: batch.fail_count,
        },
        createdAt: batch.created_at,
        completedAt: batch.completed_at,
      },
      showcases: showcasesRes.rows,
      events: eventsRes.rows,
    });
  } catch (err) {
    console.error('[getIntegrationBatch] Error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to retrieve batch status.',
    });
  }
}

/**
 * GET /api/integration/v1/prospects/:id
 * Lookup prospect status by integer ID, or externalCampaignId/externalProspectId.
 * Scoped strictly to the calling client's batches; manual showcases return 404.
 */
export async function getIntegrationProspect(req, res) {
  const { externalCampaignId, externalProspectId, id } = req.params;
  const clientId = req.apiClient.clientId;

  try {
    let sql;
    let params;

    if (id) {
      sql = `SELECT p.id, p.slug, p.title, p.company_name, p.status, p.view_count, p.created_at, p.updated_at
             FROM public_sample_showcases p
             JOIN integration_batches b ON p.batch_id = b.id
             WHERE b.client_id = $1 AND (p.id::text = $2 OR p.slug = $2)`;
      params = [clientId, id];
    } else {
      sql = `SELECT p.id, p.slug, p.title, p.company_name, p.status, p.view_count, p.created_at, p.updated_at
             FROM public_sample_showcases p
             JOIN integration_batches b ON p.batch_id = b.id
             WHERE b.client_id = $1
               AND p.source_platform = 'DIZITALGINI'
               AND p.external_campaign_id = $2
               AND p.external_prospect_id = $3`;
      params = [clientId, externalCampaignId.trim(), externalProspectId.trim()];
    }

    const dbRes = await query(sql, params);

    if (dbRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'PROSPECT_NOT_FOUND',
        message: 'Prospect not found.',
      });
    }

    const row = dbRes.rows[0];

    return res.status(200).json({
      success: true,
      id: row.id,
      slug: row.slug,
      status: row.status,
      companyName: row.company_name,
      publicUrl: row.status === 'PUBLISHED' ? `/samples/${row.slug}` : null,
      viewCount: row.view_count || 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  } catch (err) {
    console.error('[getIntegrationProspect] Error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to retrieve prospect status.',
    });
  }
}

/**
 * GET /api/integration/v1/prospects/:id/mail-template
 * Returns the outreach mail template stored with a prospect showcase.
 * Scoped strictly to the calling client's batches; manual showcases return 404.
 */
export async function getProspectMailTemplate(req, res) {
  const { id } = req.params;
  const clientId = req.apiClient.clientId;

  try {
    const dbRes = await query(
      `SELECT p.id, p.slug, p.company_name, p.outreach_mail_template
       FROM public_sample_showcases p
       JOIN integration_batches b ON p.batch_id = b.id
       WHERE b.client_id = $1 AND (p.id::text = $2 OR p.slug = $2)`,
      [clientId, id]
    );

    if (dbRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'PROSPECT_NOT_FOUND',
        message: `Prospect '${id}' not found.`,
      });
    }

    const row = dbRes.rows[0];
    return res.status(200).json({
      success: true,
      id: row.id,
      slug: row.slug,
      companyName: row.company_name,
      mailTemplate: row.outreach_mail_template,
    });
  } catch (err) {
    console.error('[getProspectMailTemplate] Error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to fetch mail template.',
    });
  }
}

/**
 * POST /api/integration/v1/prospects/:id/mail-template
 * Regenerates the outreach mail template for a prospect showcase.
 * Scoped strictly to the calling client's batches; manual showcases return 404.
 */
export async function regenerateProspectMailTemplate(req, res) {
  const { id } = req.params;
  const clientId = req.apiClient.clientId;
  const { senderName, senderTitle, senderEmail } = req.body || {};

  try {
    const dbRes = await query(
      `SELECT p.id, p.slug, p.company_name, p.leads
       FROM public_sample_showcases p
       JOIN integration_batches b ON p.batch_id = b.id
       WHERE b.client_id = $1 AND (p.id::text = $2 OR p.slug = $2)`,
      [clientId, id]
    );

    if (dbRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'PROSPECT_NOT_FOUND',
        message: `Prospect '${id}' not found.`,
      });
    }

    const row = dbRes.rows[0];
    const leads = Array.isArray(row.leads) ? row.leads : [];
    const lead = leads[0] || {};

    const freshTemplate = generateOutreachMailTemplate({
      companyName: row.company_name,
      lead,
      showcaseSlug: row.slug,
      sender: {
        name: senderName,
        title: senderTitle,
        email: senderEmail,
      },
    });

    await query(
      `UPDATE public_sample_showcases
       SET outreach_mail_template = $1,
           updated_at = NOW()
       WHERE id = $2`,
      [JSON.stringify(freshTemplate), row.id]
    );

    return res.status(200).json({
      success: true,
      id: row.id,
      slug: row.slug,
      mailTemplate: freshTemplate,
    });
  } catch (err) {
    console.error('[regenerateProspectMailTemplate] Error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to regenerate mail template.',
    });
  }
}
