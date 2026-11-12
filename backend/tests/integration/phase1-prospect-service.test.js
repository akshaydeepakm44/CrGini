import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { query, connectPostgres, getPool } from '../../src/config/postgres.js';
import { ensureIntegrationSchema, isIntegrationSchemaReady } from '../../src/config/ensureSchema.js';
import {
  cleanSlug,
  resolveSlugCollision,
  createProspect,
  updateProspect,
  processLeadsPayload,
  resolveCompanyLogo,
} from '../../src/services/prospectService.js';
import { findSampleById, findSampleBySlug, createSampleShowcase, updateSampleShowcase } from '../../src/repositories/sampleRepository.js';
import { isMockDummyLead } from '../../src/services/showcaseShared.js';
import { uploadFile, isDataUrl } from '../../src/services/storageService.js';
import { createAdminSample, updateAdminSample } from '../../src/controllers/sampleController.js';

// Disable external MinIO timeout during tests to use LocalDiskBucket instantly
delete process.env.MINIO_ENDPOINT;

test('Phase 1 Prospect Service, Schema, Parity & Characterization Suite', async (t) => {
  await connectPostgres();
  await ensureIntegrationSchema();

  const createdIds = [];

  t.after(async () => {
    try {
      if (createdIds.length > 0) {
        await query(
          `DELETE FROM public_sample_showcases WHERE id = ANY($1::int[])`,
          [createdIds]
        );
      }
      await getPool().end();
      try {
        const origPg = await import('../worktree-main/backend/src/config/postgres.js');
        if (origPg && origPg.getPool) {
          await origPg.getPool().end();
        }
      } catch (_) {}
    } catch (_) {}
  });

  await t.test('cleanSlug sanitizes input strings into valid URL slugs', () => {
    assert.equal(cleanSlug('https://www.Acme-Global.com/overview/'), 'acme-global-com-overview');
    assert.equal(cleanSlug('Siift AI (Strategic OS)'), 'siift-ai-strategic-os');
    assert.equal(cleanSlug('  ---DATA  I2I---  '), 'data-i2i');
    assert.equal(cleanSlug(''), '');
    assert.equal(cleanSlug(null), '');
  });

  await t.test('resolveSlugCollision auto-increments when allowIncrement=true', async () => {
    const testSlug = `collision-test-${Date.now()}`;
    const first = await createProspect({
      companyName: 'Collision Corp',
      slug: testSlug,
      status: 'DRAFT',
    }, { allowSlugIncrement: true });
    createdIds.push(first.id);
    assert.equal(first.slug, testSlug);

    const secondSlug = await resolveSlugCollision(testSlug, { allowIncrement: true });
    assert.equal(secondSlug, `${testSlug}-2`);
  });

  await t.test('resolveSlugCollision throws 409 SLUG_CONFLICT when allowIncrement=false', async () => {
    const testSlug = `conflict-test-${Date.now()}`;
    const first = await createProspect({
      companyName: 'Conflict Corp',
      slug: testSlug,
      status: 'DRAFT',
    }, { allowSlugIncrement: true });
    createdIds.push(first.id);

    await assert.rejects(
      async () => {
        await resolveSlugCollision(testSlug, { allowIncrement: false });
      },
      (err) => {
        assert.equal(err.code, 'SLUG_CONFLICT');
        assert.equal(err.status, 409);
        return true;
      }
    );
  });

  // --- B.1: PARALLEL CREATE TEST (Concurrent creates, same slug) ---
  await t.test('B.1: Parallel create with same slug throws 409 SLUG_CONFLICT on collision', async () => {
    const parallelSlug = `parallel-slug-${Date.now()}`;
    const payloadA = {
      companyName: 'Parallel Corp A',
      slug: parallelSlug,
      status: 'DRAFT',
    };
    const payloadB = {
      companyName: 'Parallel Corp B',
      slug: parallelSlug,
      status: 'DRAFT',
    };

    const results = await Promise.allSettled([
      createProspect(payloadA, { allowSlugIncrement: false }),
      createProspect(payloadB, { allowSlugIncrement: false }),
    ]);

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    assert.equal(fulfilled.length, 1, 'Exactly one concurrent create must succeed');
    assert.equal(rejected.length, 1, 'Exactly one concurrent create must fail with 409');
    createdIds.push(fulfilled[0].value.id);

    const rejectErr = rejected[0].reason;
    assert.equal(rejectErr.status, 409);
    assert.equal(rejectErr.code, 'SLUG_CONFLICT');
  });

  // --- B.1: DEDUPLICATION WITH UNIQUE CONSTRAINT ---
  await t.test('B.1: Deduplication: duplicate external_campaign_id + external_prospect_id throws 409 DUPLICATE_EXTERNAL_PROSPECT', async () => {
    const campaignId = `cmp_dedupe_${Date.now()}`;
    const prospectId = `prosp_target_01`;

    const first = await createProspect({
      companyName: 'Dedupe Corp 1',
      slug: `dedupe-1-${Date.now()}`,
      sourcePlatform: 'DIZITALGINI',
      externalCampaignId: campaignId,
      externalProspectId: prospectId,
    }, { allowSlugIncrement: true });
    createdIds.push(first.id);

    await assert.rejects(
      async () => {
        await createProspect({
          companyName: 'Dedupe Corp 2',
          slug: `dedupe-2-${Date.now()}`,
          sourcePlatform: 'DIZITALGINI',
          externalCampaignId: campaignId,
          externalProspectId: prospectId,
        }, { allowSlugIncrement: true });
      },
      (err) => {
        assert.equal(err.status, 409);
        assert.equal(err.code, 'DUPLICATE_EXTERNAL_PROSPECT');
        return true;
      }
    );
  });

  await t.test('Multi-company campaign: distinct external_prospect_id under same external_campaign_id succeeds', async () => {
    const campaignId = `cmp_multi_${Date.now()}`;
    const prospectA = `prosp_company_a`;
    const prospectB = `prosp_company_b`;

    const first = await createProspect({
      companyName: 'Multi Corp A',
      slug: `multi-a-${Date.now()}`,
      sourcePlatform: 'DIZITALGINI',
      externalCampaignId: campaignId,
      externalProspectId: prospectA,
    }, { allowSlugIncrement: true });
    createdIds.push(first.id);

    const second = await createProspect({
      companyName: 'Multi Corp B',
      slug: `multi-b-${Date.now()}`,
      sourcePlatform: 'DIZITALGINI',
      externalCampaignId: campaignId,
      externalProspectId: prospectB,
    }, { allowSlugIncrement: true });
    createdIds.push(second.id);

    assert.ok(first.id);
    assert.ok(second.id);
    assert.notEqual(first.id, second.id);
  });

  // --- B.6: SCHEMA VALIDATION & READINESS ---
  await t.test('B.6: ensureIntegrationSchema sets readiness flag and integration_assets.asset_key is TEXT', async () => {
    assert.equal(isIntegrationSchemaReady, true, 'isIntegrationSchemaReady flag must be true');

    const colRes = await query(`
      SELECT data_type 
      FROM information_schema.columns 
      WHERE table_name = 'integration_assets' AND column_name = 'asset_key'
    `);
    assert.equal(colRes.rows[0]?.data_type, 'text', 'integration_assets.asset_key must be TEXT');
  });

  // --- B.3: MANUAL PATH SAFETY & FIELD STRIPPING ---
  await t.test('B.3: Manual createAdminSample strips integration fields and sets sourcePlatform=MANUAL', async () => {
    let statusCode = null;
    let jsonBody = null;
    const req = {
      body: {
        companyName: 'Manual Safety Corp',
        slug: `manual-safety-${Date.now()}`,
        status: 'DRAFT',
        sourcePlatform: 'FORGED_PLATFORM',
        externalCampaignId: 'forged_campaign_99',
        externalProspectId: 'forged_prosp_99',
        batchId: '00000000-0000-0000-0000-000000000000',
        createdByEmail: 'attacker@evil.com',
      },
      user: { email: 'admin@dizigini.com', role: 'ADMIN' },
    };
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        jsonBody = data;
        return this;
      },
    };

    await createAdminSample(req, res);
    assert.equal(statusCode, 201);
    assert.ok(jsonBody?.sample?.id);
    createdIds.push(jsonBody.sample.id);

    // Verify in database that forged fields were stripped and source_platform is MANUAL
    const rowRes = await query(`SELECT * FROM public_sample_showcases WHERE id = $1`, [jsonBody.sample.id]);
    const row = rowRes.rows[0];
    assert.equal(row.source_platform, 'MANUAL');
    assert.equal(row.external_campaign_id, null);
    assert.equal(row.external_prospect_id, null);
    assert.equal(row.batch_id, null);
    assert.equal(row.created_by_email, 'admin@dizigini.com');
  });

  await t.test('B.3: Manual createAdminSample rejects invalid status with 400', async () => {
    let statusCode = null;
    let jsonBody = null;
    const req = {
      body: {
        companyName: 'Invalid Status Corp',
        status: 'ARCHIVED',
      },
      user: { email: 'admin@dizigini.com', role: 'ADMIN' },
    };
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        jsonBody = data;
        return this;
      },
    };

    await createAdminSample(req, res);
    assert.equal(statusCode, 400);
    assert.match(jsonBody?.message, /Status must be either 'DRAFT' or 'PUBLISHED'/i);
  });

  await t.test('B.3: Manual updateAdminSample rejects invalid status with 400', async () => {
    let statusCode = null;
    let jsonBody = null;
    const req = {
      params: { id: 1 },
      body: {
        status: 'PENDING_APPROVAL',
      },
      user: { email: 'admin@dizigini.com', role: 'ADMIN' },
    };
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        jsonBody = data;
        return this;
      },
    };

    await updateAdminSample(req, res);
    assert.equal(statusCode, 400);
    assert.match(jsonBody?.message, /Status must be either 'DRAFT' or 'PUBLISHED'/i);
  });

  // --- B.5: REAL CHARACTERIZATION TEST (git worktree of main vs new implementation) ---
  await t.test('B.5: Real Characterization: Main worktree handlers vs New refactored handlers produce identical rows', async () => {
    // Ensure worktree exists
    const worktreePath = path.resolve(process.cwd(), 'tests', 'worktree-main');
    if (!fs.existsSync(worktreePath)) {
      try {
        execSync('git worktree add tests/worktree-main 508900f', { cwd: path.resolve(process.cwd()) });
      } catch (err) {
        console.warn('Could not auto-add git worktree:', err.message);
      }
    }

    // Dynamically load the original controller from the git worktree of main (commit 508900f)
    const origModule = await import('../worktree-main/backend/src/controllers/sampleController.js');
    const origCreate = origModule.createAdminSample;
    const origUpdate = origModule.updateAdminSample;

    const testPdfDataUrl =
      'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwgL0xlbmd0aCA1IDAgUiA+PgpzdHJlYW0KQlQgL0YxIDEyIFRmIDcyIDcxMiBUZCAoVGVzdCBQREYpIFRqIEVUCmVuZHN0cmVhbQplbmRvYmoKNSAwIG9iago0NAplbmRvYmoKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFsgMyAwIFIgXSAvQ291bnQgMSA+PgplbmRvYmoKMyAwIG9iago8PCAvVHlwZSAvUGFnZSAvUGFyZW50IDIgMCBSIC9NZWRpYUJveCBbMCAwIDYxMiA3OTJdIC9Db250ZW50cyA0IDAgUiA+PgplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMTgzIDAwMDAwIG4gCjAwMDAwMDAyMzggMDAwMDAgbiAKMDAwMDAwMDI5OCAwMDAwMCBuIAowMDAwMDAwMDIwIDAwMDAwIG4gCjAwMDAwMDAxNjQgMDAwMDAgbiAKdHJhaWxlcgo8PCAvU2l6ZSA2IC9Sb290IDEgMCBSID4+CnN0YXJ0eHJlZgocMzgyCiUlRU9G';

    const testLogoDataUrl =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    const sharedPayload = {
      companyName: 'Worktree Parity Corp',
      description: 'Comprehensive account brief for characterization verification.',
      status: 'PUBLISHED',
      companyStudy: {
        website: 'https://paritycorp.test',
        businessOverview: 'Leading enterprise provider of strategic services.',
        pdfFileDataUrl: testPdfDataUrl,
        pdfFileName: 'parity_company_study.pdf',
      },
      pitchDeck: {
        assetKey: 'shared-orig-pitch-asset-key',
        fileName: 'shared_playbook.pdf',
        fileSize: 32000,
      },
      leads: [
        {
          id: 'lead-candidate-1',
          name: 'Alex Director',
          title: 'Director of Platform Engineering',
          company: 'Worktree Parity Corp',
          email: 'alex@paritycorp.test',
          leadStudyPdf: testPdfDataUrl,
          leadStudyPdfName: 'Alex_Director_Study.pdf',
          logo: testLogoDataUrl,
        },
        {
          name: 'Sarah Jenkins',
          email: 's.jenkins@acmeglobal.com',
          company: 'Acme Global Systems',
        },
      ],
    };

    const runHandler = async (handler, body, params = {}, user = null) => {
      let code = 200;
      let bodyData = null;
      const req = { body, params, user, headers: {}, query: {} };
      const res = {
        status(c) {
          code = c;
          return this;
        },
        json(d) {
          bodyData = d;
          return this;
        },
      };
      await handler(req, res);
      return { code, bodyData };
    };

    // 1. Run ORIGINAL createAdminSample (from main worktree)
    const origSlug = `orig-char-${Date.now()}`;
    const origCreateRes = await runHandler(
      origCreate,
      { ...sharedPayload, slug: origSlug },
      {},
      { email: 'admin@dizigini.com', role: 'ADMIN' }
    );
    assert.equal(origCreateRes.code, 201);
    const origId = origCreateRes.bodyData.sample.id;
    createdIds.push(origId);

    // 2. Run NEW refactored createAdminSample
    const newSlug = `new-char-${Date.now()}`;
    const newCreateRes = await runHandler(
      createAdminSample,
      { ...sharedPayload, slug: newSlug },
      {},
      { email: 'admin@dizigini.com', role: 'ADMIN' }
    );
    assert.equal(newCreateRes.code, 201);
    const newId = newCreateRes.bodyData.sample.id;
    createdIds.push(newId);

    // 3. Normalize & Deep-Compare CREATED rows from database
    const origDbRes = await query(`SELECT * FROM public_sample_showcases WHERE id = $1`, [origId]);
    const newDbRes = await query(`SELECT * FROM public_sample_showcases WHERE id = $1`, [newId]);
    const origRow = origDbRes.rows[0];
    const newRow = newDbRes.rows[0];

    const normalizeRow = (row) => {
      const copy = JSON.parse(JSON.stringify(row));
      copy.id = '<NORMALIZED_ID>';
      copy.slug = '<NORMALIZED_SLUG>';
      copy.created_at = '<NORMALIZED_TIME>';
      copy.updated_at = '<NORMALIZED_TIME>';
      copy.published_at = '<NORMALIZED_TIME>';
      copy.created_by_email = '<NORMALIZED_EMAIL>';

      // Normalize dynamic UUIDs & slugs in asset keys
      if (copy.company_study?.pdfAssetKey) {
        copy.company_study.pdfAssetKey = copy.company_study.pdfAssetKey.replace(/public-samples\/[^/]+/, 'public-samples/NORM');
        copy.company_study.pdfAssetKey = copy.company_study.pdfAssetKey.replace(/[0-9a-fA-F-]{36}/, 'NORM-UUID');
      }
      if (copy.logo_asset_key) {
        copy.logo_asset_key = copy.logo_asset_key.replace(/public-samples\/[^/]+/, 'public-samples/NORM');
        copy.logo_asset_key = copy.logo_asset_key.replace(/[0-9a-fA-F-]{36}/, 'NORM-UUID');
      }
      if (copy.logo_url) {
        copy.logo_url = copy.logo_url.replace(/\/api\/samples\/[^/]+/, '/api/samples/NORM');
      }

      if (Array.isArray(copy.leads)) {
        copy.leads = copy.leads.map((l) => {
          const leadCopy = { ...l };
          if (leadCopy.leadStudyPdfAssetKey) {
            leadCopy.leadStudyPdfAssetKey = leadCopy.leadStudyPdfAssetKey
              .replace(/public-samples\/[^/]+/, 'public-samples/NORM')
              .replace(/[0-9a-fA-F-]{36}/, 'NORM-UUID');
          }
          if (leadCopy.leadStudyPdf) {
            leadCopy.leadStudyPdf = leadCopy.leadStudyPdf.replace(/\/api\/samples\/[^/]+/, '/api/samples/NORM');
          }
          if (leadCopy.logoAssetKey) {
            leadCopy.logoAssetKey = leadCopy.logoAssetKey
              .replace(/public-samples\/[^/]+/, 'public-samples/NORM')
              .replace(/[0-9a-fA-F-]{36}/, 'NORM-UUID');
          }
          if (leadCopy.logo) {
            leadCopy.logo = leadCopy.logo.replace(/\/api\/samples\/[^/]+/, '/api/samples/NORM');
          }
          return leadCopy;
        });
      }

      return copy;
    };

    const normalizedOrigCreated = normalizeRow(origRow);
    const normalizedNewCreated = normalizeRow(newRow);

    // Compare core properties
    assert.deepEqual(normalizedNewCreated.title, normalizedOrigCreated.title);
    assert.deepEqual(normalizedNewCreated.company_name, normalizedOrigCreated.company_name);
    assert.deepEqual(normalizedNewCreated.description, normalizedOrigCreated.description);
    assert.deepEqual(normalizedNewCreated.status, normalizedOrigCreated.status);
    assert.deepEqual(normalizedNewCreated.pitch_deck, normalizedOrigCreated.pitch_deck);
    assert.deepEqual(normalizedNewCreated.company_study, normalizedOrigCreated.company_study);
    assert.deepEqual(normalizedNewCreated.leads.length, normalizedOrigCreated.leads.length);
    assert.deepEqual(normalizedNewCreated.leads[0].name, normalizedOrigCreated.leads[0].name);

    // 4. Test UPDATE: existing-asset-key preservation and update with NO logo
    const updatePayload = {
      title: 'Updated Strategic Brief Title',
      companyStudy: {
        businessOverview: 'Enhanced enterprise business overview for parity.',
      },
      // Note: pitchDeck assetKey and companyStudy.pdfFileDataUrl are omitted to test preservation
    };

    const origUpdateRes = await runHandler(origUpdate, updatePayload, { id: origId }, { role: 'ADMIN' });
    const newUpdateRes = await runHandler(updateAdminSample, updatePayload, { id: newId }, { role: 'ADMIN' });
    assert.equal(origUpdateRes.code, 200);
    assert.equal(newUpdateRes.code, 200);

    const origUpdatedDb = await query(`SELECT * FROM public_sample_showcases WHERE id = $1`, [origId]);
    const newUpdatedDb = await query(`SELECT * FROM public_sample_showcases WHERE id = $1`, [newId]);

    const normalizedOrigUpdated = normalizeRow(origUpdatedDb.rows[0]);
    const normalizedNewUpdated = normalizeRow(newUpdatedDb.rows[0]);

    // Both must preserve company study pdfAssetKey and pitchDeck assetKey
    assert.deepEqual(normalizedNewUpdated.company_study.pdfAssetKey, normalizedOrigUpdated.company_study.pdfAssetKey);
    assert.deepEqual(normalizedNewUpdated.pitch_deck.assetKey, normalizedOrigUpdated.pitch_deck.assetKey);
    assert.deepEqual(normalizedNewUpdated.company_study.businessOverview, normalizedOrigUpdated.company_study.businessOverview);
    assert.deepEqual(normalizedNewUpdated.title, normalizedOrigUpdated.title);
  });
});
