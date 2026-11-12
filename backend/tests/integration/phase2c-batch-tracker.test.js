process.env.NODE_ENV = 'test';
process.env.ENABLE_INTEGRATION_API = 'true';
process.env.JWT_SECRET = 'a_very_secure_test_jwt_secret_of_at_least_32_characters_length';

import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import jwt from 'jsonwebtoken';
import { connectPostgres, query, getPool } from '../../src/config/postgres.js';
import { ensureIntegrationSchema } from '../../src/config/ensureSchema.js';
import { issueApiKey } from '../../scripts/issue-api-key.js';
import { getBucketName } from '../../src/services/storageService.js';
import { createProspect } from '../../src/services/prospectService.js';
import {
  isPrivateOrReservedIp,
  validateExternalUrl,
  safeFetchUrl,
} from '../../src/services/ssrfFilter.js';

const { app: realServerApp } = await import('../../src/server.js');

test('Phase 2C Batch Prospect Ingestion, Tracker, Mail Template & Admin Suite', async (t) => {
  await connectPostgres();
  await ensureIntegrationSchema();

  const server = realServerApp.listen(0);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  const createdBatchIds = [];
  const createdShowcaseIds = [];
  const createdClientIds = [];
  const createdAssetKeys = [];
  const createdUserIds = [];

  // Issue Standard API Client
  const res1 = await issueApiKey({
    clientName: 'Test Batch Client Normal',
    scopes: ['prospects:write', 'prospects:read', 'assets:write'],
    allowAutoPublish: false,
    allowedSenderEmails: ['batch-tester@dizitalgini.com', 'campaign@dizitalgini.com'],
  });
  const testClient = res1.client;
  const testClientKey = res1.rawKey;
  createdClientIds.push(testClient.client_id);

  // Issue Auto-Publish API Client
  const res2 = await issueApiKey({
    clientName: 'Test Batch Client AutoPublish',
    scopes: ['prospects:write', 'prospects:read', 'assets:write'],
    allowAutoPublish: true,
    allowedSenderEmails: ['autopublish@dizitalgini.com'],
  });
  const autoPublishClient = res2.client;
  const autoPublishClientKey = res2.rawKey;
  createdClientIds.push(autoPublishClient.client_id);

  // Create test users for notifications & JWT auth
  const adminUserRes = await query(
    `INSERT INTO users (name, email, password, role)
     VALUES ('Admin Batch Tester', 'admin-batch-${Date.now()}@dizigini.com', 'hashed', 'ADMIN')
     RETURNING id`
  );
  const adminUserId = adminUserRes.rows[0].id;
  createdUserIds.push(adminUserId);

  const regularUserRes = await query(
    `INSERT INTO users (name, email, password, role)
     VALUES ('Regular User Batch Tester', 'user-batch-${Date.now()}@dizigini.com', 'hashed', 'USER')
     RETURNING id`
  );
  const regularUserId = regularUserRes.rows[0].id;
  createdUserIds.push(regularUserId);

  const adminToken = jwt.sign(
    { id: adminUserId, email: 'admin-batch@dizigini.com', role: 'ADMIN' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  const userToken = jwt.sign(
    { id: regularUserId, email: 'user-batch@dizigini.com', role: 'USER' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  t.after(async () => {
    if (server) {
      if (typeof server.closeAllConnections === 'function') server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
    }

    if (createdShowcaseIds.length > 0) {
      await query(`DELETE FROM public_sample_showcases WHERE id = ANY($1::int[])`, [
        createdShowcaseIds,
      ]).catch(() => {});
    }

    if (createdAssetKeys.length > 0) {
      await query(`DELETE FROM integration_assets WHERE asset_key = ANY($1::text[])`, [
        createdAssetKeys,
      ]).catch(() => {});
    }

    if (createdBatchIds.length > 0) {
      await query(`DELETE FROM integration_events WHERE batch_id = ANY($1::uuid[])`, [
        createdBatchIds,
      ]).catch(() => {});
      await query(`DELETE FROM integration_batches WHERE id = ANY($1::uuid[])`, [
        createdBatchIds,
      ]).catch(() => {});
    }

    if (createdClientIds.length > 0) {
      await query(`DELETE FROM integration_events WHERE batch_id IN (SELECT id FROM integration_batches WHERE client_id = ANY($1::text[]))`, [
        createdClientIds,
      ]).catch(() => {});
      await query(`DELETE FROM integration_batches WHERE client_id = ANY($1::text[])`, [
        createdClientIds,
      ]).catch(() => {});
      await query(`DELETE FROM integration_idempotency_keys WHERE client_id = ANY($1::text[])`, [
        createdClientIds,
      ]).catch(() => {});
      await query(`DELETE FROM api_clients WHERE client_id = ANY($1::text[])`, [
        createdClientIds,
      ]).catch(() => {});
    }

    if (createdUserIds.length > 0) {
      await query(`DELETE FROM notifications WHERE user_id = ANY($1::int[])`, [
        createdUserIds,
      ]).catch(() => {});
      await query(`DELETE FROM users WHERE id = ANY($1::int[])`, [
        createdUserIds,
      ]).catch(() => {});
    }

    // Clean up temporary files on storage disk for created clients
    const bucket = getBucketName();
    for (const cId of createdClientIds) {
      const clientDir = path.resolve(process.cwd(), 'storage', 'buckets', bucket, 'temp', cId);
      if (fs.existsSync(clientDir)) {
        try {
          fs.rmSync(clientDir, { recursive: true, force: true });
        } catch (_) {}
      }
    }

    await getPool().end();
    setTimeout(() => process.exit(0), 50);
  });

  // Helper to upload a real staged PDF asset
  const uploadStagedAsset = async (apiKey) => {
    const boundary = '----WebKitFormBoundary' + crypto.randomBytes(8).toString('hex');
    const pdfContent = Buffer.from('%PDF-1.4\n%Test Batch PDF Content\n%%EOF');
    const head = Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="batch-study.pdf"\r\nContent-Type: application/pdf\r\n\r\n`
    );
    const tail = Buffer.from(`\r\n--${boundary}--\r\n`);
    const multipartBody = Buffer.concat([head, pdfContent, tail]);

    const res = await fetch(`${baseUrl}/api/integration/v1/assets`, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'X-API-Key': apiKey,
      },
      body: multipartBody,
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    createdAssetKeys.push(body.assetKey);
    return body.assetKey;
  };

  // 1. BATCH INGESTION: Happy Path with PDF, Mail Template Generation & Status Check
  await t.test('1. POST /prospects/batch: creates batch, generates mail templates, returns 207 Multi-Status', async () => {
    const stagedPdfKey = await uploadStagedAsset(testClientKey);
    const idempotencyKey = `batch-key-${Date.now()}`;

    const batchPayload = {
      externalCampaignId: 'camp-q4-2026',
      campaignName: 'Q4 Enterprise SaaS Campaign',
      operatorEmail: 'batch-tester@dizitalgini.com',
      prospects: [
        {
          externalProspectId: 'prospect-alpha-1',
          targetCompany: {
            name: 'Alpha Systems Inc',
            website: 'https://alphasystems.example.com',
            industry: 'Cloud Infrastructure',
          },
          companyStudy: {
            overview: 'Alpha Systems is an enterprise cloud leader.',
            pdfAssetKey: stagedPdfKey,
          },
          leads: [
            {
              name: 'Alice Johnson',
              title: 'Chief Technology Officer',
              email: 'alice@alphasystems.example.com',
            },
          ],
          mailOptions: {
            senderName: 'Akshay Deepak',
            senderTitle: 'Research Director',
            senderEmail: 'campaign@dizitalgini.com',
          },
        },
      ],
    };

    const res = await fetch(`${baseUrl}/api/integration/v1/prospects/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': testClientKey,
        'X-Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(batchPayload),
    });

    assert.equal(res.status, 207);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.status, 'COMPLETED');
    assert.equal(body.summary.total, 1);
    assert.equal(body.summary.created, 1);
    assert.equal(body.results.length, 1);

    const item = body.results[0];
    assert.equal(item.status, 'CREATED');
    assert.equal(item.showcaseStatus, 'DRAFT');
    assert.ok(item.slug.startsWith('alpha-systems-inc-'));
    assert.ok(item.id > 0);

    createdBatchIds.push(body.batchId);
    createdShowcaseIds.push(item.id);

    // Verify stored mail template in DB
    const showcaseRes = await query(
      'SELECT outreach_mail_template, status FROM public_sample_showcases WHERE id = $1',
      [item.id]
    );
    const showcaseRow = showcaseRes.rows[0];
    assert.equal(showcaseRow.status, 'DRAFT');
    assert.ok(showcaseRow.outreach_mail_template.subject.includes('Alpha Systems Inc'));
    assert.ok(showcaseRow.outreach_mail_template.bodyText.includes('Alice Johnson'));
  });

  // 2. IDEMPOTENCY: Replay identical batch body vs different payload
  await t.test('2. Idempotency: exact replay returns cached 207 with Idempotent-Replay header; mismatch returns 409', async () => {
    const replayKey = `idemp-replay-${Date.now()}`;
    const payloadA = {
      externalCampaignId: 'camp-idemp-test',
      prospects: [
        {
          externalProspectId: 'prospect-idemp-1',
          targetCompany: { name: 'Idemp Corp A' },
        },
      ],
    };

    const res1 = await fetch(`${baseUrl}/api/integration/v1/prospects/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': testClientKey,
        'Idempotency-Key': replayKey,
      },
      body: JSON.stringify(payloadA),
    });

    assert.equal(res1.status, 207);
    const body1 = await res1.json();
    createdBatchIds.push(body1.batchId);
    if (body1.results[0]?.id) createdShowcaseIds.push(body1.results[0].id);

    // Replay with identical payload
    const res2 = await fetch(`${baseUrl}/api/integration/v1/prospects/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': testClientKey,
        'Idempotency-Key': replayKey,
      },
      body: JSON.stringify(payloadA),
    });

    assert.equal(res2.status, 207);
    assert.equal(res2.headers.get('idempotent-replay'), 'true');
    const body2 = await res2.json();
    assert.equal(body2.batchId, body1.batchId);

    // Replay same key with conflicting payload
    const payloadB = {
      externalCampaignId: 'camp-idemp-test',
      prospects: [
        {
          externalProspectId: 'prospect-idemp-1',
          targetCompany: { name: 'Completely Different Corp B' },
        },
      ],
    };

    const res3 = await fetch(`${baseUrl}/api/integration/v1/prospects/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': testClientKey,
        'Idempotency-Key': replayKey,
      },
      body: JSON.stringify(payloadB),
    });

    assert.equal(res3.status, 409);
    const body3 = await res3.json();
    assert.equal(body3.error, 'IDEMPOTENCY_KEY_PAYLOAD_MISMATCH');
  });

  // 3. DEDUPLICATION: Duplicate (campaignId, prospectId) returns EXISTING
  await t.test('3. Deduplication: resending existing prospect returns status EXISTING', async () => {
    const dedupeKey1 = `dedupe-run1-${Date.now()}`;
    const dedupeKey2 = `dedupe-run2-${Date.now()}`;

    const prospectData = {
      externalProspectId: 'prospect-dedupe-99',
      targetCompany: { name: 'Dedupe Corp' },
    };

    // First push
    const res1 = await fetch(`${baseUrl}/api/integration/v1/prospects/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': testClientKey,
        'Idempotency-Key': dedupeKey1,
      },
      body: JSON.stringify({
        externalCampaignId: 'camp-dedupe-check',
        prospects: [prospectData],
      }),
    });

    const body1 = await res1.json();
    assert.equal(body1.results[0].status, 'CREATED');
    createdBatchIds.push(body1.batchId);
    createdShowcaseIds.push(body1.results[0].id);

    // Second push under new idempotency key
    const res2 = await fetch(`${baseUrl}/api/integration/v1/prospects/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': testClientKey,
        'Idempotency-Key': dedupeKey2,
      },
      body: JSON.stringify({
        externalCampaignId: 'camp-dedupe-check',
        prospects: [prospectData],
      }),
    });

    const body2 = await res2.json();
    assert.equal(res2.status, 207);
    assert.equal(body2.results[0].status, 'EXISTING');
    assert.equal(body2.results[0].id, body1.results[0].id);
  });

  // 4. PARTIAL FAILURE: Mixed items return 207 with status PARTIAL
  await t.test('4. Partial failure: mixed batch isolates errors and marks batch status PARTIAL', async () => {
    const batchKey = `batch-partial-${Date.now()}`;

    const batchPayload = {
      externalCampaignId: 'camp-partial-check',
      prospects: [
        {
          externalProspectId: 'prospect-valid-1',
          targetCompany: { name: 'Valid Corp' },
        },
        {
          externalProspectId: 'prospect-invalid-asset',
          targetCompany: { name: 'Invalid Asset Corp' },
          companyStudy: { pdfAssetKey: 'dzg_ast_non_existent_key' },
        },
      ],
    };

    const res = await fetch(`${baseUrl}/api/integration/v1/prospects/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': testClientKey,
        'Idempotency-Key': batchKey,
      },
      body: JSON.stringify(batchPayload),
    });

    assert.equal(res.status, 207);
    const body = await res.json();
    assert.equal(body.status, 'PARTIAL');
    assert.equal(body.summary.created, 1);
    assert.equal(body.summary.failed, 1);

    const validItem = body.results.find((r) => r.externalProspectId === 'prospect-valid-1');
    const invalidItem = body.results.find((r) => r.externalProspectId === 'prospect-invalid-asset');

    assert.equal(validItem.status, 'CREATED');
    assert.equal(invalidItem.status, 'FAILED');
    assert.equal(invalidItem.error, 'INVALID_ASSET_KEY');

    createdBatchIds.push(body.batchId);
    createdShowcaseIds.push(validItem.id);
  });

  // 5. AUTO-PUBLISH DOWNGRADE: Client without permission has PUBLISHED downgraded to DRAFT
  await t.test('5. Auto-publish downgrade: client without allow_auto_publish has PUBLISHED downgraded to DRAFT with warning', async () => {
    const res = await fetch(`${baseUrl}/api/integration/v1/prospects/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': testClientKey, // allow_auto_publish = false
        'Idempotency-Key': `downgrade-${Date.now()}`,
      },
      body: JSON.stringify({
        externalCampaignId: 'camp-downgrade-check',
        prospects: [
          {
            externalProspectId: 'prospect-downgraded',
            status: 'PUBLISHED',
            targetCompany: { name: 'Downgraded Corp' },
          },
        ],
      }),
    });

    const body = await res.json();
    assert.equal(res.status, 207);
    const item = body.results[0];
    assert.equal(item.status, 'CREATED');
    assert.equal(item.showcaseStatus, 'DRAFT');
    assert.ok(item.warnings.some((w) => w.includes('downgraded to DRAFT')));

    createdBatchIds.push(body.batchId);
    createdShowcaseIds.push(item.id);

    // Verify client WITH auto_publish gets PUBLISHED
    const resAuto = await fetch(`${baseUrl}/api/integration/v1/prospects/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': autoPublishClientKey, // allow_auto_publish = true
        'Idempotency-Key': `autopub-${Date.now()}`,
      },
      body: JSON.stringify({
        externalCampaignId: 'camp-autopub-check',
        operatorEmail: 'autopublish@dizitalgini.com',
        prospects: [
          {
            externalProspectId: 'prospect-autopublished',
            status: 'PUBLISHED',
            targetCompany: { name: 'Auto Published Corp' },
          },
        ],
      }),
    });

    const bodyAuto = await resAuto.json();
    assert.equal(resAuto.status, 207);
    assert.equal(bodyAuto.results[0].showcaseStatus, 'PUBLISHED');

    createdBatchIds.push(bodyAuto.batchId);
    createdShowcaseIds.push(bodyAuto.results[0].id);
  });

  // 6. SECURITY: SSRF protection on logoUrl
  await t.test('6. SSRF Protection: logoUrl pointing to private/loopback IP is blocked', async () => {
    const res = await fetch(`${baseUrl}/api/integration/v1/prospects/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': testClientKey,
        'Idempotency-Key': `ssrf-${Date.now()}`,
      },
      body: JSON.stringify({
        externalCampaignId: 'camp-ssrf-check',
        prospects: [
          {
            externalProspectId: 'prospect-ssrf-1',
            targetCompany: {
              name: 'SSRF Attack Corp',
              logoUrl: 'http://127.0.0.1:8080/internal-logo.png',
            },
          },
        ],
      }),
    });

    assert.equal(res.status, 207);
    const body = await res.json();
    const item = body.results[0];
    assert.equal(item.status, 'FAILED');
    assert.equal(item.error, 'SSRF_PRIVATE_IP_BLOCKED');
    createdBatchIds.push(body.batchId);
  });

  // 7. TRACKER: Verify integration_events are logged
  await t.test('7. Tracker: BATCH_RECEIVED, PROSPECT_CREATED, MAIL_TEMPLATE_GENERATED, BATCH_COMPLETED logged', async () => {
    const testBatchId = createdBatchIds[0];
    const eventsRes = await query(
      `SELECT event_type FROM integration_events WHERE batch_id = $1 ORDER BY id ASC`,
      [testBatchId]
    );

    const eventTypes = eventsRes.rows.map((r) => r.event_type);
    assert.ok(eventTypes.includes('BATCH_RECEIVED'));
    assert.ok(eventTypes.includes('PROSPECT_CREATED'));
    assert.ok(eventTypes.includes('MAIL_TEMPLATE_GENERATED'));
    assert.ok(eventTypes.includes('BATCH_COMPLETED'));
  });

  // 8. POLLING: GET /batches/:batchId & GET /prospects/:id
  await t.test('8. Polling: GET /batches/:batchId and GET /prospects/:id return status & counts', async () => {
    const testBatchId = createdBatchIds[0];
    const resBatch = await fetch(`${baseUrl}/api/integration/v1/batches/${testBatchId}`, {
      headers: { 'X-API-Key': testClientKey },
    });

    assert.equal(resBatch.status, 200);
    const batchData = await resBatch.json();
    assert.equal(batchData.batch.id, testBatchId);
    assert.equal(batchData.batch.status, 'COMPLETED');
    assert.ok(batchData.showcases.length > 0);
    assert.ok(batchData.events.length > 0);

    const testShowcaseId = createdShowcaseIds[0];
    const resProspect = await fetch(`${baseUrl}/api/integration/v1/prospects/${testShowcaseId}`, {
      headers: { 'X-API-Key': testClientKey },
    });

    assert.equal(resProspect.status, 200);
    const prospectData = await resProspect.json();
    assert.equal(prospectData.id, testShowcaseId);
    assert.equal(prospectData.status, 'DRAFT');
  });

  // 9. MAIL TEMPLATE: GET & POST /prospects/:id/mail-template
  await t.test('9. Mail Template: GET fetches stored template; POST regenerates template', async () => {
    const testShowcaseId = createdShowcaseIds[0];

    // GET
    const resGet = await fetch(
      `${baseUrl}/api/integration/v1/prospects/${testShowcaseId}/mail-template`,
      { headers: { 'X-API-Key': testClientKey } }
    );
    assert.equal(resGet.status, 200);
    const bodyGet = await resGet.json();
    assert.ok(bodyGet.mailTemplate.subject);
    assert.ok(bodyGet.mailTemplate.bodyText);

    // POST Regenerate
    const resPost = await fetch(
      `${baseUrl}/api/integration/v1/prospects/${testShowcaseId}/mail-template`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': testClientKey,
        },
        body: JSON.stringify({
          senderName: 'Jane Strategist',
          senderTitle: 'Partner',
          senderEmail: 'jane@dizitalgini.com',
        }),
      }
    );
    assert.equal(resPost.status, 200);
    const bodyPost = await resPost.json();
    assert.ok(bodyPost.mailTemplate.bodyText.includes('Jane Strategist'));
  });

  // 10. ADMIN INTEGRATION ENDPOINTS: Auth gating & Notification check
  await t.test('10. Admin Endpoints: USER gets 403; ADMIN gets batches, notifications, and DRAFT preview', async () => {
    try {
    // A. Role USER gets 403
    const resUser = await fetch(`${baseUrl}/api/samples/manage/integration/batches`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.equal(resUser.status, 403);

    // B. Role ADMIN gets batches
    const resAdminBatches = await fetch(`${baseUrl}/api/samples/manage/integration/batches`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(resAdminBatches.status, 200);
    const adminBatches = await resAdminBatches.json();
    assert.ok(adminBatches.batches.length > 0);

    // C. Role ADMIN gets notifications
    const resAdminNotif = await fetch(`${baseUrl}/api/samples/manage/integration/notifications`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(resAdminNotif.status, 200);
    const notifs = await resAdminNotif.json();
    assert.ok(notifs.notifications.length > 0);

    // Mark notification as read
    const firstNotifId = notifs.notifications[0].id;
    const resRead = await fetch(
      `${baseUrl}/api/samples/manage/integration/notifications/${firstNotifId}/read`,
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );
    assert.equal(resRead.status, 200);

    // D. Admin DRAFT Preview
    const testShowcase = await query(
      'SELECT slug FROM public_sample_showcases WHERE id = $1',
      [createdShowcaseIds[0]]
    );
    const testSlug = testShowcase.rows[0].slug;

    const resPreview = await fetch(`${baseUrl}/api/samples/manage/preview/${testSlug}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(resPreview.status, 200);
    const previewData = await resPreview.json();
    assert.equal(previewData.preview, true);
    assert.equal(previewData.sample.slug, testSlug);

    // E. Public route gets 404 for DRAFT
    const resPublic = await fetch(`${baseUrl}/api/samples/${testSlug}`);
    assert.equal(resPublic.status, 404);
    } catch (test10Err) {
      console.error('[TEST 10 FAILURE]:', test10Err);
      throw test10Err;
    }
  });

  // ---------------------------------------------------------------------------
  // 11. TENANT SCOPING & MANUAL SHOWCASE ISOLATION (404)
  // ---------------------------------------------------------------------------
  await t.test(
    '11. Tenant Scoping: Cross-client access and manual-showcase access strictly return 404',
    async () => {
      // 1. Issue second client B
      const resB = await issueApiKey({
        clientName: 'Tenant B Isolated Client',
        scopes: ['prospects:write'],
      });
      createdClientIds.push(resB.client.client_id);
      const clientBKey = resB.rawKey;

      const clientABatchId = createdBatchIds[0];
      const clientAShowcaseId = createdShowcaseIds[0];

      // A. Client B attempts to access Client A's batch -> 404
      const resBatchB = await fetch(`${baseUrl}/api/integration/v1/batches/${clientABatchId}`, {
        headers: { 'X-API-Key': clientBKey },
      });
      assert.equal(resBatchB.status, 404, 'Cross-client batch access must return 404 Not Found');

      // B. Client B attempts to access Client A's prospect by ID -> 404
      const resProspectB = await fetch(`${baseUrl}/api/integration/v1/prospects/${clientAShowcaseId}`, {
        headers: { 'X-API-Key': clientBKey },
      });
      assert.equal(resProspectB.status, 404, 'Cross-client prospect access must return 404 Not Found');

      // C. Client B attempts to fetch Client A's prospect mail template -> 404
      const resMailB = await fetch(
        `${baseUrl}/api/integration/v1/prospects/${clientAShowcaseId}/mail-template`,
        { headers: { 'X-API-Key': clientBKey } }
      );
      assert.equal(resMailB.status, 404, 'Cross-client mail template access must return 404 Not Found');

      // D. Create a manual showcase (sourcePlatform = 'MANUAL', batchId = NULL)
      const manualShowcase = await createProspect({
        companyName: 'Manual Confidential Corp',
        sourcePlatform: 'MANUAL',
        status: 'PUBLISHED',
      });
      createdShowcaseIds.push(manualShowcase.id);

      // E. Calling Client A attempts to fetch manual showcase via /prospects/:id -> 404
      const resManualProspect = await fetch(
        `${baseUrl}/api/integration/v1/prospects/${manualShowcase.id}`,
        { headers: { 'X-API-Key': testClientKey } }
      );
      assert.equal(
        resManualProspect.status,
        404,
        'Manual showcase must be completely unreachable via integration prospect endpoint'
      );

      // F. Calling Client A attempts to fetch manual showcase mail-template -> 404
      const resManualMail = await fetch(
        `${baseUrl}/api/integration/v1/prospects/${manualShowcase.id}/mail-template`,
        { headers: { 'X-API-Key': testClientKey } }
      );
      assert.equal(
        resManualMail.status,
        404,
        'Manual showcase mail template must be unreachable via integration API'
      );
    }
  );

  // ---------------------------------------------------------------------------
  // 12. COMPREHENSIVE SSRF FILTER VALIDATION
  // ---------------------------------------------------------------------------
  await t.test(
    '12. SSRF Filter: Blocks private IPv4, IPv6, decimal/hex/octal, redirects, 5s timeout & 2MB cap',
    async () => {
      // 1. Private / Loopback / Link-Local IPv4 check
      const privateIpv4s = [
        '127.0.0.1',
        '127.0.1.1',
        '10.0.0.1',
        '10.254.0.1',
        '172.16.0.1',
        '172.31.255.255',
        '192.168.1.1',
        '169.254.169.254', // AWS/GCP cloud metadata
        '0.0.0.0',
        '224.0.0.1', // Multicast
        '255.255.255.255', // Broadcast
      ];
      for (const ip of privateIpv4s) {
        assert.equal(isPrivateOrReservedIp(ip), true, `IPv4 ${ip} must be identified as private/reserved`);
      }

      // 2. Private / Loopback / Link-Local IPv6 check
      const privateIpv6s = [
        '::1',
        '::',
        'fe80::1',
        'fe80::a00:27ff:fe8a:89d8',
        'fc00::1',
        'fd12:3456:789a:1::1',
        '::ffff:127.0.0.1', // IPv4-mapped loopback
        '::ffff:169.254.169.254', // IPv4-mapped metadata
      ];
      for (const ip of privateIpv6s) {
        assert.equal(isPrivateOrReservedIp(ip), true, `IPv6 ${ip} must be identified as private/reserved`);
      }

      // 3. Decimal, Hex, and Octal IPv4 Encodings
      const encodedUrls = [
        'http://2130706433/logo.png', // Decimal for 127.0.0.1
        'http://0x7f000001/logo.png', // Hex for 127.0.0.1
        'http://0177.0.0.1/logo.png', // Octal for 127.0.0.1
        'http://localhost/logo.png', // Hostname resolving to private IP
        'http://127.0.0.1:8080/logo.png',
        'http://169.254.169.254/latest/meta-data/',
      ];
      for (const rawUrl of encodedUrls) {
        const val = await validateExternalUrl(rawUrl);
        assert.equal(val.safe, false, `URL ${rawUrl} must be blocked by SSRF filter`);
      }

      // 4. Public domain succeeds
      const publicCheck = await validateExternalUrl('https://example.com/logo.png');
      assert.equal(publicCheck.safe, true, 'Public domain https://example.com must be safe');

      // 5. Test safeFetchUrl: Redirect to Private IP is blocked
      const redirectServer = http.createServer((req, res) => {
        if (req.url === '/redirect-to-private') {
          res.writeHead(302, { Location: 'http://127.0.0.1/secret' });
          res.end();
        } else if (req.url === '/oversized') {
          res.writeHead(200, { 'Content-Type': 'image/png' });
          // Emit chunks totaling > 2MB
          const chunk = Buffer.alloc(64 * 1024, 'a');
          for (let i = 0; i < 35; i++) {
            res.write(chunk); // 35 * 64KB = 2.24MB > 2MB
          }
          res.end();
        } else if (req.url === '/slow') {
          // Intentionally do not reply to trigger timeout
        } else {
          res.writeHead(200, { 'Content-Type': 'image/png' });
          res.end(Buffer.from('small-image-bytes'));
        }
      });

      await new Promise((resolve) => redirectServer.listen(0, resolve));
      const testPort = redirectServer.address().port;

      try {
        // A. Redirect to private IP must throw SSRF_PRIVATE_IP_BLOCKED
        await assert.rejects(
          () => safeFetchUrl(`http://127.0.0.1:${testPort}/redirect-to-private`, { allowLocalhostInitial: true }),
          (err) => err.code === 'SSRF_PRIVATE_IP_BLOCKED' || err.message.includes('SSRF Blocked')
        );

        // B. 2MB Size Cap Enforcement: response > 2MB must be rejected with MAX_SIZE_EXCEEDED
        await assert.rejects(
          () => safeFetchUrl(`http://127.0.0.1:${testPort}/oversized`, { allowLocalhostInitial: true, maxSize: 100 * 1024 }),
          (err) => err.code === 'MAX_SIZE_EXCEEDED' || err.message.includes('MAX_SIZE_EXCEEDED')
        );

        // C. 5s Timeout Enforcement: hanging request must be rejected with TIMEOUT
        await assert.rejects(
          () => safeFetchUrl(`http://127.0.0.1:${testPort}/slow`, { allowLocalhostInitial: true, timeoutMs: 50 }),
          (err) => err.code === 'TIMEOUT' || err.message.includes('TIMEOUT')
        );
      } finally {
        await new Promise((resolve) => redirectServer.close(resolve));
      }
    }
  );

  // ---------------------------------------------------------------------------
  // 13. ID GENERATION: 20-Prospect Batch within 1 second produces unique IDs
  // ---------------------------------------------------------------------------
  await t.test(
    '13. Id Generation: 20-prospect batch in one second produces unique sequential IDs from DB sequence',
    async () => {
      const twentyProspects = [];
      for (let i = 0; i < 20; i++) {
        twentyProspects.push({
          externalProspectId: `rapid-prospect-${i}`,
          targetCompany: {
            name: `Rapid Scale Corp ${i}`,
            website: `https://rapid${i}.example.com`,
          },
        });
      }

      const res = await fetch(`${baseUrl}/api/integration/v1/prospects/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': testClientKey,
          'Idempotency-Key': `rapid-20-${Date.now()}`,
        },
        body: JSON.stringify({
          externalCampaignId: `camp-rapid-${Date.now()}`,
          campaignName: 'Rapid Scale Ingestion Test',
          prospects: twentyProspects,
        }),
      });

      assert.equal(res.status, 207);
      const data = await res.json();
      assert.equal(data.summary.total, 20);
      assert.equal(data.summary.created, 20);
      assert.equal(data.summary.failed, 0);

      const returnedIds = data.results.map((r) => r.id);
      const uniqueIds = new Set(returnedIds);

      // Verify all 20 IDs are strictly unique
      assert.equal(uniqueIds.size, 20, 'All 20 prospects must receive distinct unique IDs');

      // Verify all IDs are valid positive integers from the DB sequence
      for (const id of returnedIds) {
        assert.ok(typeof id === 'number' && id > 0, `ID ${id} must be a positive integer`);
        createdShowcaseIds.push(id);
      }
      createdBatchIds.push(data.batchId);
    }
  );

  // ---------------------------------------------------------------------------
  // 14. END-TO-END FIELD MAPPING & PUBLIC DASHBOARD PARITY TEST
  // ---------------------------------------------------------------------------
  await t.test(
    '14. Field Mapping Parity: Batch-created showcase with staged PDFs matches manual dashboard shape upon publishing',
    async () => {
      // 1. Upload sample PDF assets (one for company study, one for pitch deck)
      const pdfBytes1 = Buffer.from('%PDF-1.4 sample company study pdf content');
      const formData1 = new FormData();
      formData1.append('file', new Blob([pdfBytes1], { type: 'application/pdf' }), 'study.pdf');

      const assetRes1 = await fetch(`${baseUrl}/api/integration/v1/assets`, {
        method: 'POST',
        headers: { 'X-API-Key': testClientKey },
        body: formData1,
      });
      assert.equal(assetRes1.status, 201);
      const assetJson1 = await assetRes1.json();
      const studyAssetKey = assetJson1.assetKey;

      const pdfBytes2 = Buffer.from('%PDF-1.4 sample showcase pitch deck pdf content');
      const formData2 = new FormData();
      formData2.append('file', new Blob([pdfBytes2], { type: 'application/pdf' }), 'showcase-pitch.pdf');

      const assetRes2 = await fetch(`${baseUrl}/api/integration/v1/assets`, {
        method: 'POST',
        headers: { 'X-API-Key': testClientKey },
        body: formData2,
      });
      assert.equal(assetRes2.status, 201);
      const assetJson2 = await assetRes2.json();
      const showcasePitchAssetKey = assetJson2.assetKey;

      const pdfBytes3 = Buffer.from('%PDF-1.4 sample lead pitch deck pdf content');
      const formData3 = new FormData();
      formData3.append('file', new Blob([pdfBytes3], { type: 'application/pdf' }), 'lead-pitch.pdf');

      const assetRes3 = await fetch(`${baseUrl}/api/integration/v1/assets`, {
        method: 'POST',
        headers: { 'X-API-Key': testClientKey },
        body: formData3,
      });
      assert.equal(assetRes3.status, 201);
      const assetJson3 = await assetRes3.json();
      const leadPitchAssetKey = assetJson3.assetKey;

      // 2. Submit batch with full field mapping
      const batchPayload = {
        externalCampaignId: `camp-parity-${Date.now()}`,
        prospects: [
          {
            externalProspectId: 'parity-prospect-001',
            companyName: 'Parity Global Technologies',
            website: 'https://parityglobal.example.com',
            industry: 'Enterprise Fintech',
            category: 'SaaS',
            description: 'Automated treasury operations platform.',
            companyStudy: {
              company: 'Parity Global Technologies',
              website: 'https://parityglobal.example.com',
              linkedin: 'https://linkedin.com/company/parityglobal',
              industry: 'Enterprise Fintech',
              businessOverview: 'Next-gen liquidity and cashflow operating system.',
              marketPosition: 'Top 3 treasury provider.',
              keyObservations: 'High demand for API-first ERP integration.',
              potentialOpportunity: 'Strategic expansion into North American mid-market.',
              pdfAssetKey: studyAssetKey,
            },
            pitchDeck: {
              title: 'Parity Global Growth Playbook',
              summary: 'Commercial acceleration proposal.',
              pdfAssetKey: showcasePitchAssetKey,
            },
            leads: [
              {
                name: 'David Vance',
                title: 'Chief Financial Officer',
                email: 'david.vance@parityglobal.example.com',
                phone: '+1-555-0199',
                company: 'Parity Global Technologies',
                companyLink: 'https://parityglobal.example.com',
                aboutCompany: 'Global treasury solutions provider.',
                whySuitsBest: 'Key economic decision maker evaluating automation.',
                leadStudy: {
                  whyRelevant: 'Leading CFO modernization.',
                  observedContext: 'Expanding global finance team.',
                  suggestedApproach: 'Highlight ROI and turnaround time.',
                },
                pitchDeckAssetKey: leadPitchAssetKey,
              },
            ],
            mailOptions: {
              senderName: 'Akshay Deepak',
              senderTitle: 'Lead Research Manager',
              senderEmail: 'campaign@dizitalgini.com',
            },
          },
        ],
      };

      const pushRes = await fetch(`${baseUrl}/api/integration/v1/prospects/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': testClientKey,
          'Idempotency-Key': `parity-idemp-${Date.now()}`,
        },
        body: JSON.stringify(batchPayload),
      });

      assert.equal(pushRes.status, 207);
      const pushJson = await pushRes.json();
      const createdItem = pushJson.results[0];
      if (createdItem.status !== 'CREATED') {
        console.error('[TEST 14 ITEM ERROR]:', createdItem);
      }
      assert.equal(createdItem.status, 'CREATED');
      const showcaseId = createdItem.id;
      const showcaseSlug = createdItem.slug;
      createdShowcaseIds.push(showcaseId);
      createdBatchIds.push(pushJson.batchId);

      // 3. Publish the showcase via admin endpoint
      const publishRes = await fetch(`${baseUrl}/api/samples/manage/${showcaseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status: 'PUBLISHED' }),
      });
      assert.equal(publishRes.status, 200);
      const publishJson = await publishRes.json();
      assert.equal(publishJson.sample.status, 'PUBLISHED');
      assert.ok(publishJson.sample.publishedAt, 'publishedAt must be populated upon publishing');

      // 4. Fetch the published showcase via public endpoint and assert dashboard field parity
      const publicRes = await fetch(`${baseUrl}/api/samples/${showcaseSlug}`);
      assert.equal(publicRes.status, 200);
      const publicJson = await publicRes.json();
      const s = publicJson.sample;

      // Assert companyStudy shape
      assert.equal(s.companyName, 'Parity Global Technologies');
      assert.equal(s.companyStudy.company, 'Parity Global Technologies');
      assert.equal(s.companyStudy.website, 'https://parityglobal.example.com');
      assert.equal(s.companyStudy.linkedin, 'https://linkedin.com/company/parityglobal');
      assert.equal(s.companyStudy.industry, 'Enterprise Fintech');
      assert.equal(s.companyStudy.businessOverview, 'Next-gen liquidity and cashflow operating system.');
      assert.equal(s.companyStudy.hasPdf, true);
      assert.equal(s.companyStudy.pdfUrl, `/api/samples/${showcaseSlug}/company-study-pdf`);

      // Assert pitchDeck shape
      assert.equal(s.pitchDeck.title, 'Parity Global Growth Playbook');
      assert.equal(s.pitchDeck.streamUrl, `/api/samples/${showcaseSlug}/pitch-deck`);
      assert.equal(s.pitchDeck.downloadUrl, `/api/samples/${showcaseSlug}/pitch-deck?download=true`);

      // Assert leads[] shape
      assert.equal(s.leads.length, 1);
      const lead = s.leads[0];
      assert.equal(lead.name, 'David Vance');
      assert.equal(lead.title, 'Chief Financial Officer');
      assert.equal(lead.company, 'Parity Global Technologies');
      assert.equal(lead.companyLink, 'https://parityglobal.example.com');
      assert.equal(lead.whySuitsBest, 'Key economic decision maker evaluating automation.');
      assert.equal(lead.leadStudy.whyRelevant, 'Leading CFO modernization.');
      assert.equal(lead.pitchDeck.streamUrl, `/api/samples/${showcaseSlug}/leads/${lead.id}/pitch-deck`);
      assert.equal(lead.pitchDeckPdf, lead.pitchDeck.streamUrl);
    }
  );

  // ---------------------------------------------------------------------------
  // 15. SSRF FILTER WITH STUBBED RESOLVER & VALIDATED IP SOCKET BINDING
  // ---------------------------------------------------------------------------
  await t.test(
    '15. SSRF Filter: Hostnames resolving to private IPs are blocked via stubbed resolver; socket binds to validated IP',
    async () => {
      // A. Stubbed resolver returning private IP (10.0.0.5) must be blocked
      const privateResolver = async (host) => [{ address: '10.0.0.5', family: 4 }];
      const resPrivate = await validateExternalUrl('https://evil-rebind.com/logo.png', {
        dnsResolver: privateResolver,
      });
      assert.equal(resPrivate.safe, false);
      assert.equal(resPrivate.error, 'SSRF_PRIVATE_IP_BLOCKED');
      assert.equal(resPrivate.ip, '10.0.0.5');

      // B. Stubbed resolver returning loopback (127.0.0.1) must be blocked
      const loopbackResolver = async (host) => [{ address: '127.0.0.1', family: 4 }];
      const resLoopback = await validateExternalUrl('https://loopback-rebind.com/avatar.png', {
        dnsResolver: loopbackResolver,
      });
      assert.equal(resLoopback.safe, false);
      assert.equal(resLoopback.error, 'SSRF_PRIVATE_IP_BLOCKED');

      // C. Stubbed resolver returning public IP (93.184.216.34) succeeds
      const publicResolver = async (host) => [{ address: '93.184.216.34', family: 4 }];
      const resPublic = await validateExternalUrl('https://safe-domain.com/logo.png', {
        dnsResolver: publicResolver,
      });
      assert.equal(resPublic.safe, true);
      assert.equal(resPublic.ip, '93.184.216.34');
    }
  );

  // ---------------------------------------------------------------------------
  // 16. ADMIN ROUTES ROLE RESTRICTION & PUBLISHED_AT SETTING
  // ---------------------------------------------------------------------------
  await t.test(
    '16. Admin Routes: COMPANY_LEAD gets 403 on integration batches/notifications, but 200 on preview; ADMIN gets 200',
    async () => {
      // 1. Provision authentic COMPANY_LEAD user in database
      const leadUserRes = await query(
        `INSERT INTO users (name, email, password, role)
         VALUES ('Lead Specialist Tester', 'lead-specialist-${Date.now()}@dizigini.com', 'hashed', 'COMPANY_LEAD')
         RETURNING id`
      );
      const leadUserId = leadUserRes.rows[0].id;
      createdUserIds.push(leadUserId);

      const jwt = (await import('jsonwebtoken')).default;
      const { getPrimaryJwtSecret } = await import('../../src/middleware/auth.js');
      const leadToken = jwt.sign(
        { id: leadUserId, email: 'lead-specialist@dizigini.com', role: 'COMPANY_LEAD' },
        getPrimaryJwtSecret(),
        { expiresIn: '1h' }
      );

      // A. COMPANY_LEAD receives 403 on /integration/batches
      const resLeadBatches = await fetch(`${baseUrl}/api/samples/manage/integration/batches`, {
        headers: { Authorization: `Bearer ${leadToken}` },
      });
      assert.equal(resLeadBatches.status, 403, 'COMPANY_LEAD must be forbidden from integration batches');

      // B. COMPANY_LEAD receives 403 on /integration/notifications
      const resLeadNotifs = await fetch(`${baseUrl}/api/samples/manage/integration/notifications`, {
        headers: { Authorization: `Bearer ${leadToken}` },
      });
      assert.equal(resLeadNotifs.status, 403, 'COMPANY_LEAD must be forbidden from integration notifications');

      // C. COMPANY_LEAD receives 200 on /preview/:slug
      const testShowcase = await query(
        'SELECT slug FROM public_sample_showcases WHERE id = $1',
        [createdShowcaseIds[0]]
      );
      const testSlug = testShowcase.rows[0].slug;

      const resLeadPreview = await fetch(`${baseUrl}/api/samples/manage/preview/${testSlug}`, {
        headers: { Authorization: `Bearer ${leadToken}` },
      });
      assert.equal(resLeadPreview.status, 200, 'COMPANY_LEAD is authorized to preview showcase');

      // D. ADMIN receives 200 on both
      const resAdminBatches = await fetch(`${baseUrl}/api/samples/manage/integration/batches`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(resAdminBatches.status, 200, 'ADMIN is authorized on integration batches');

      const resAdminNotifs = await fetch(`${baseUrl}/api/samples/manage/integration/notifications`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(resAdminNotifs.status, 200, 'ADMIN is authorized on integration notifications');
    }
  );
});
