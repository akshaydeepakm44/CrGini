process.env.NODE_ENV = 'test';
process.env.ENABLE_INTEGRATION_API = 'true';

import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { connectPostgres, getPool, query } from '../../src/config/postgres.js';
import { ensureIntegrationSchema } from '../../src/config/ensureSchema.js';
import { issueApiKey } from '../../scripts/issue-api-key.js';
import { getBucketName } from '../../src/services/storageService.js';

// Dynamically import real server app
const { app: realServerApp } = await import('../../src/server.js');

test('Phase 2B Single Prospect Create & Idempotency Suite', async (t) => {
  await connectPostgres();
  await ensureIntegrationSchema();

  const server = realServerApp.listen(0);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  const createdClientIds = [];
  const createdAssetKeys = [];
  const createdShowcaseIds = [];
  const createdBatchIds = [];
  const createdAdminUserIds = [];

  // Helper to create a test admin user for notification assertions
  const adminEmail = `test_admin_${Date.now()}@dizigini.com`;
  const adminRes = await query(
    `INSERT INTO users (name, email, password, role)
     VALUES ('Test Admin', $1, 'hashed_pw', 'SUPER_ADMIN')
     RETURNING id`,
    [adminEmail]
  );
  createdAdminUserIds.push(adminRes.rows[0].id);

  // Helper to issue client API key
  const { client: mainClient, rawKey: mainRawKey } = await issueApiKey({
    clientName: 'Phase2B Test Client',
    scopes: ['prospects:write', 'prospects:read', 'assets:write'],
    allowAutoPublish: false,
    allowedSenderEmails: ['authorized@dizitalgini.com'],
  });
  createdClientIds.push(mainClient.client_id);

  // Helper to stage a dummy PDF asset
  const stageTestAsset = async (clientId, rawKey) => {
    const pdfBytes = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\n%%EOF');
    const formData = new FormData();
    formData.append('file', new Blob([pdfBytes], { type: 'application/pdf' }), 'test.pdf');

    const res = await fetch(`${baseUrl}/api/integration/v1/assets`, {
      method: 'POST',
      headers: { 'X-API-Key': rawKey },
      body: formData,
    });
    assert.equal(res.status, 201);
    const json = await res.json();
    createdAssetKeys.push(json.assetKey);
    return json.assetKey;
  };

  t.after(async () => {
    // Clean up created showcases
    if (createdShowcaseIds.length > 0) {
      await query(`DELETE FROM public_sample_showcases WHERE id = ANY($1::int[])`, [
        createdShowcaseIds,
      ]).catch(() => {});
    }

    // Clean up created assets
    if (createdAssetKeys.length > 0) {
      await query(`DELETE FROM integration_assets WHERE asset_key = ANY($1::text[])`, [
        createdAssetKeys,
      ]).catch(() => {});
    }

    // Clean up batches and events
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
    }

    // Clean up idempotency keys
    if (createdClientIds.length > 0) {
      await query(`DELETE FROM integration_idempotency_keys WHERE client_id = ANY($1::text[])`, [
        createdClientIds,
      ]).catch(() => {});
      await query(`DELETE FROM api_clients WHERE client_id = ANY($1::text[])`, [
        createdClientIds,
      ]).catch(() => {});
    }

    // Clean up test admin users & notifications
    if (createdAdminUserIds.length > 0) {
      await query(`DELETE FROM notifications WHERE user_id = ANY($1::int[])`, [
        createdAdminUserIds,
      ]).catch(() => {});
      await query(`DELETE FROM users WHERE id = ANY($1::int[])`, [
        createdAdminUserIds,
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

    if (server) {
      if (typeof server.closeAllConnections === 'function') server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
    }
    await getPool().end();
    setTimeout(() => process.exit(0), 50);
  });

  // ---------------------------------------------------------------------------
  // 1. Idempotency: missing key -> 400
  // ---------------------------------------------------------------------------
  await t.test('1. Idempotency: missing key -> 400', async () => {
    const res = await fetch(`${baseUrl}/api/integration/v1/prospects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': mainRawKey,
      },
      body: JSON.stringify({
        companyName: 'No Idempotency Key Corp',
        externalCampaignId: 'camp-1',
        externalProspectId: 'prospect-1',
        pushedByEmail: 'authorized@dizitalgini.com',
      }),
    });

    assert.equal(res.status, 400);
    const json = await res.json();
    assert.equal(json.error, 'MISSING_IDEMPOTENCY_KEY');
  });

  // ---------------------------------------------------------------------------
  // 2. Valid prospect create returns 201, status is DRAFT, publicUrl is correct format
  // ---------------------------------------------------------------------------
  let createdShowcaseRecord = null;
  const campaignId1 = `camp-${Date.now()}`;
  const prospectId1 = `prosp-${Date.now()}`;
  const idempKey1 = `idemp-${Date.now()}-1`;

  await t.test('2. Valid prospect create returns 201, status is DRAFT, publicUrl is correct format', async () => {
    const res = await fetch(`${baseUrl}/api/integration/v1/prospects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': mainRawKey,
        'Idempotency-Key': idempKey1,
      },
      body: JSON.stringify({
        companyName: 'Alpha Tech Corp',
        externalCampaignId: campaignId1,
        externalProspectId: prospectId1,
        pushedByEmail: 'authorized@dizitalgini.com',
        description: 'Pioneering AI robotics solutions.',
        website: 'https://alphatech.example.com',
        leads: [
          {
            name: 'Sarah Connor',
            title: 'CTO',
            email: 'sarah@alphatech.example.com',
          },
        ],
      }),
    });

    assert.equal(res.status, 201, 'Valid create must return 201 Created');
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(json.id);
    createdShowcaseIds.push(json.id);
    createdShowcaseRecord = json;

    assert.equal(json.status, 'DRAFT', 'Default status must be DRAFT');
    assert.equal(json.showcaseStatus, 'DRAFT');
    assert.equal(json.campaignId, campaignId1);
    assert.equal(json.prospectId, prospectId1);
    const expectedPortalBase = (process.env.PORTAL_BASE_URL || 'http://localhost:5174').replace(/\/+$/, '');
    assert.equal(json.publicUrl, null, 'Draft showcase must have null publicUrl');
    assert.equal(json.previewUrl, `${expectedPortalBase}/api/samples/manage/preview/${json.slug}`);

    // Verify row in database has sourcePlatform DIZITALGINI
    const dbRes = await query('SELECT * FROM public_sample_showcases WHERE id = $1', [json.id]);
    assert.equal(dbRes.rows.length, 1);
    const row = dbRes.rows[0];
    assert.equal(row.source_platform, 'DIZITALGINI');
    assert.equal(row.status, 'DRAFT');
    assert.equal(row.external_campaign_id, campaignId1);
    assert.equal(row.external_prospect_id, prospectId1);
  });

  // ---------------------------------------------------------------------------
  // 3. Idempotency: replay with same body returns cached response with Idempotent-Replay header
  // ---------------------------------------------------------------------------
  await t.test('3. Idempotency: replay with same body returns cached response with Idempotent-Replay header', async () => {
    const res = await fetch(`${baseUrl}/api/integration/v1/prospects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': mainRawKey,
        'Idempotency-Key': idempKey1,
      },
      body: JSON.stringify({
        companyName: 'Alpha Tech Corp',
        externalCampaignId: campaignId1,
        externalProspectId: prospectId1,
        pushedByEmail: 'authorized@dizitalgini.com',
        description: 'Pioneering AI robotics solutions.',
        website: 'https://alphatech.example.com',
        leads: [
          {
            name: 'Sarah Connor',
            title: 'CTO',
            email: 'sarah@alphatech.example.com',
          },
        ],
      }),
    });

    assert.equal(res.status, 201, 'Replay must return original status');
    assert.equal(res.headers.get('idempotent-replay'), 'true', 'Must include Idempotent-Replay: true header');
    const json = await res.json();
    assert.equal(json.id, createdShowcaseRecord.id);
    assert.equal(json.slug, createdShowcaseRecord.slug);
  });

  // ---------------------------------------------------------------------------
  // 4. Idempotency: reuse key with different body -> 409 IDEMPOTENCY_KEY_PAYLOAD_MISMATCH
  // ---------------------------------------------------------------------------
  await t.test('4. Idempotency: reuse key with different body -> 409 IDEMPOTENCY_KEY_PAYLOAD_MISMATCH', async () => {
    const res = await fetch(`${baseUrl}/api/integration/v1/prospects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': mainRawKey,
        'Idempotency-Key': idempKey1,
      },
      body: JSON.stringify({
        companyName: 'Completely Different Payload Corp',
        externalCampaignId: 'different-campaign',
        externalProspectId: 'different-prospect',
        pushedByEmail: 'authorized@dizitalgini.com',
      }),
    });

    assert.equal(res.status, 409, 'Reusing key with different payload must return 409 Conflict');
    const json = await res.json();
    assert.equal(json.error, 'IDEMPOTENCY_KEY_PAYLOAD_MISMATCH');
  });

  // ---------------------------------------------------------------------------
  // 5. Idempotency: concurrent request in progress -> 409 CONCURRENT_REQUEST_IN_PROGRESS
  // ---------------------------------------------------------------------------
  await t.test('5. Idempotency: concurrent request in progress -> 409 CONCURRENT_REQUEST_IN_PROGRESS', async () => {
    const inProgressKey = `idemp-in-progress-${Date.now()}`;
    // Insert dummy in-progress idempotency row
    await query(
      `INSERT INTO integration_idempotency_keys (client_id, idempotency_key, status, body_hash, created_at)
       VALUES ($1, $2, 'IN_PROGRESS', 'dummy_hash', NOW())`,
      [mainClient.client_id, inProgressKey]
    );

    const res = await fetch(`${baseUrl}/api/integration/v1/prospects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': mainRawKey,
        'Idempotency-Key': inProgressKey,
      },
      body: JSON.stringify({
        companyName: 'Concurrent Corp',
        externalCampaignId: 'camp-conc',
        externalProspectId: 'prosp-conc',
        pushedByEmail: 'authorized@dizitalgini.com',
      }),
    });

    assert.equal(res.status, 409, 'Concurrent in-progress request must return 409');
    const json = await res.json();
    assert.equal(json.error, 'CONCURRENT_REQUEST_IN_PROGRESS');
  });

  // ---------------------------------------------------------------------------
  // 6. Dedupe: duplicate (source_platform, external_campaign_id, external_prospect_id) -> 409 DUPLICATE_EXTERNAL_PROSPECT
  // ---------------------------------------------------------------------------
  await t.test('6. Dedupe: duplicate (source_platform, external_campaign_id, external_prospect_id) -> 409 DUPLICATE_EXTERNAL_PROSPECT', async () => {
    // Attempt to create a NEW request (new idempotency key) with identical external campaign & prospect IDs
    const newIdempKey = `idemp-dedupe-${Date.now()}`;
    const res = await fetch(`${baseUrl}/api/integration/v1/prospects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': mainRawKey,
        'Idempotency-Key': newIdempKey,
      },
      body: JSON.stringify({
        companyName: 'Duplicate Attempt Corp',
        externalCampaignId: campaignId1,
        externalProspectId: prospectId1,
        pushedByEmail: 'authorized@dizitalgini.com',
      }),
    });

    assert.equal(res.status, 409, 'Duplicate external campaign + prospect must return 409 Conflict');
    const json = await res.json();
    assert.equal(json.error, 'DUPLICATE_EXTERNAL_PROSPECT');
  });

  // ---------------------------------------------------------------------------
  // 7. Asset claiming: referenced asset becomes CLAIMED, claimed_by set to showcase id
  // ---------------------------------------------------------------------------
  await t.test('7. Asset claiming: referenced asset becomes CLAIMED, claimed_by set to showcase id', async () => {
    const assetKey = await stageTestAsset(mainClient.client_id, mainRawKey);
    const campId = `camp-asset-${Date.now()}`;
    const prospId = `prosp-asset-${Date.now()}`;
    const idempKey = `idemp-asset-${Date.now()}`;

    const res = await fetch(`${baseUrl}/api/integration/v1/prospects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': mainRawKey,
        'Idempotency-Key': idempKey,
      },
      body: JSON.stringify({
        companyName: 'Asset Claiming Corp',
        externalCampaignId: campId,
        externalProspectId: prospId,
        pushedByEmail: 'authorized@dizitalgini.com',
        companyStudy: {
          overview: 'Overview notes',
          pdfAssetKey: assetKey,
        },
      }),
    });

    assert.equal(res.status, 201);
    const json = await res.json();
    createdShowcaseIds.push(json.id);

    // Verify asset status in DB
    const assetDbRes = await query('SELECT status, claimed_by FROM integration_assets WHERE asset_key = $1', [
      assetKey,
    ]);
    assert.equal(assetDbRes.rows.length, 1);
    assert.equal(assetDbRes.rows[0].status, 'CLAIMED', 'Referenced asset must be transitioned to CLAIMED');
    assert.equal(assetDbRes.rows[0].claimed_by, json.id, 'Asset claimed_by must reference showcase id');

    // Verify storage abstraction claim/relocation: permanent file exists, old staging file removed
    const { objectExists } = await import('../../src/services/storageService.js');
    const uuid = assetKey.replace(/^dzg_ast_/, '');
    const oldStagedKey = `temp/${mainClient.client_id}/${uuid}.pdf`;
    const permanentKey = `public-samples/${json.slug}/company-study/${uuid}.pdf`;

    const oldExists = await objectExists(oldStagedKey);
    assert.equal(oldExists, false, 'Staged file must be removed from temporary directory');

    const permExists = await objectExists(permanentKey);
    assert.equal(permExists, true, 'Relocated file must exist in permanent showcase directory');
  });

  // ---------------------------------------------------------------------------
  // 8. Asset security: attempting to claim an asset belonging to a different client_id -> 400
  // ---------------------------------------------------------------------------
  await t.test('8. Asset security: attempting to claim an asset belonging to a different client_id -> 400', async () => {
    // Create second client and stage an asset under client 2
    const { client: otherClient, rawKey: otherRawKey } = await issueApiKey({
      clientName: 'Other Foreign Client',
      scopes: ['assets:write'],
    });
    createdClientIds.push(otherClient.client_id);
    const otherAssetKey = await stageTestAsset(otherClient.client_id, otherRawKey);

    // Client 1 attempts to claim client 2's asset
    const res = await fetch(`${baseUrl}/api/integration/v1/prospects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': mainRawKey,
        'Idempotency-Key': `idemp-theft-${Date.now()}`,
      },
      body: JSON.stringify({
        companyName: 'Cross Tenant Theft Corp',
        externalCampaignId: `camp-theft-${Date.now()}`,
        externalProspectId: `prosp-theft-${Date.now()}`,
        pushedByEmail: 'authorized@dizitalgini.com',
        companyStudy: { pdfAssetKey: otherAssetKey },
      }),
    });

    assert.equal(res.status, 400, 'Attempting to claim foreign asset must return 400 Bad Request');
    const json = await res.json();
    assert.equal(json.error, 'INVALID_ASSET_KEY');
    assert.match(json.message, /does not belong to the authenticated client/i);
  });

  // ---------------------------------------------------------------------------
  // 9. Asset security: attempting to claim an expired/non-existent asset -> 400
  // ---------------------------------------------------------------------------
  await t.test('9. Asset security: attempting to claim an expired/non-existent asset -> 400', async () => {
    const res = await fetch(`${baseUrl}/api/integration/v1/prospects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': mainRawKey,
        'Idempotency-Key': `idemp-nonexist-${Date.now()}`,
      },
      body: JSON.stringify({
        companyName: 'Nonexistent Asset Corp',
        externalCampaignId: `camp-nonexist-${Date.now()}`,
        externalProspectId: `prosp-nonexist-${Date.now()}`,
        pushedByEmail: 'authorized@dizitalgini.com',
        companyStudy: { pdfAssetKey: 'dzg_ast_00000000-0000-0000-0000-000000000000' },
      }),
    });

    assert.equal(res.status, 400);
    const json = await res.json();
    assert.equal(json.error, 'INVALID_ASSET_KEY');
    assert.match(json.message, /does not exist/i);
  });

  // ---------------------------------------------------------------------------
  // 10. Transaction rollback: on failure, assets remain STAGED, no orphan showcase
  // ---------------------------------------------------------------------------
  await t.test('10. Transaction rollback: on failure, assets remain STAGED, no orphan showcase', async () => {
    const assetKey = await stageTestAsset(mainClient.client_id, mainRawKey);

    // Provide duplicate campaign+prospect to force a conflict error on commit
    const res = await fetch(`${baseUrl}/api/integration/v1/prospects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': mainRawKey,
        'Idempotency-Key': `idemp-rollback-${Date.now()}`,
      },
      body: JSON.stringify({
        companyName: 'Rollback Corp',
        externalCampaignId: campaignId1, // already taken by test 2!
        externalProspectId: prospectId1, // already taken by test 2!
        pushedByEmail: 'authorized@dizitalgini.com',
        companyStudy: { pdfAssetKey: assetKey },
      }),
    });

    assert.equal(res.status, 409);

    // Verify asset remains in STAGED status and was NOT claimed
    const assetCheck = await query('SELECT status, claimed_by FROM integration_assets WHERE asset_key = $1', [
      assetKey,
    ]);
    assert.equal(assetCheck.rows[0].status, 'STAGED', 'On rollback, asset must remain STAGED');
    assert.equal(assetCheck.rows[0].claimed_by, null);
  });

  // ---------------------------------------------------------------------------
  // 11. Pushed_by_email validation: rejected if client has allowed_sender_emails and email not in list
  // ---------------------------------------------------------------------------
  await t.test('11. Pushed_by_email validation: rejected if client has allowed_sender_emails and email not in list', async () => {
    const res = await fetch(`${baseUrl}/api/integration/v1/prospects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': mainRawKey,
        'Idempotency-Key': `idemp-unauth-email-${Date.now()}`,
      },
      body: JSON.stringify({
        companyName: 'Unauthorized Email Corp',
        externalCampaignId: `camp-unauth-${Date.now()}`,
        externalProspectId: `prosp-unauth-${Date.now()}`,
        pushedByEmail: 'attacker@evil.com', // Not in mainClient.allowedSenderEmails ('authorized@dizitalgini.com')
      }),
    });

    assert.equal(res.status, 400);
    const json = await res.json();
    assert.equal(json.error, 'SENDER_EMAIL_NOT_ALLOWED');
  });

  // ---------------------------------------------------------------------------
  // 12. Auto-publish: client without allow_auto_publish requesting PUBLISHED is forced to DRAFT; client with allow_auto_publish gets PUBLISHED
  // ---------------------------------------------------------------------------
  await t.test('12. Auto-publish: client without allow_auto_publish requesting PUBLISHED is forced to DRAFT; client with allow_auto_publish gets PUBLISHED', async () => {
    // 12.1 Main client has allowAutoPublish: false -> requesting PUBLISHED is forced to DRAFT
    const resForcedDraft = await fetch(`${baseUrl}/api/integration/v1/prospects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': mainRawKey,
        'Idempotency-Key': `idemp-forced-draft-${Date.now()}`,
      },
      body: JSON.stringify({
        companyName: 'Forced Draft Corp',
        externalCampaignId: `camp-forced-${Date.now()}`,
        externalProspectId: `prosp-forced-${Date.now()}`,
        pushedByEmail: 'authorized@dizitalgini.com',
        status: 'PUBLISHED',
      }),
    });

    assert.equal(resForcedDraft.status, 201);
    const jsonForcedDraft = await resForcedDraft.json();
    createdShowcaseIds.push(jsonForcedDraft.id);
    assert.equal(jsonForcedDraft.status, 'DRAFT', 'Client without allow_auto_publish must be forced to DRAFT');

    // 12.2 Create client with allowAutoPublish: true
    const { client: autoClient, rawKey: autoRawKey } = await issueApiKey({
      clientName: 'Auto Publish Client',
      scopes: ['prospects:write'],
      allowAutoPublish: true,
      allowedSenderEmails: ['auto@dizitalgini.com'],
    });
    createdClientIds.push(autoClient.client_id);

    const resAutoPublished = await fetch(`${baseUrl}/api/integration/v1/prospects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': autoRawKey,
        'Idempotency-Key': `idemp-auto-pub-${Date.now()}`,
      },
      body: JSON.stringify({
        companyName: 'Auto Published Corp',
        externalCampaignId: `camp-auto-${Date.now()}`,
        externalProspectId: `prosp-auto-${Date.now()}`,
        pushedByEmail: 'auto@dizitalgini.com',
        status: 'PUBLISHED',
      }),
    });

    assert.equal(resAutoPublished.status, 201);
    const jsonAutoPublished = await resAutoPublished.json();
    createdShowcaseIds.push(jsonAutoPublished.id);
    assert.equal(jsonAutoPublished.status, 'PUBLISHED', 'Client with allow_auto_publish must produce PUBLISHED showcase');
  });

  // ---------------------------------------------------------------------------
  // 13. GET /prospects/:campaignId/:prospectId returns correct metadata, 404 for unknown
  // ---------------------------------------------------------------------------
  await t.test('13. GET /prospects/:campaignId/:prospectId returns correct metadata, 404 for unknown', async () => {
    // 13.1 Successful lookup of existing prospect from test 2
    const resFound = await fetch(
      `${baseUrl}/api/integration/v1/prospects/${campaignId1}/${prospectId1}`,
      {
        headers: { 'X-API-Key': mainRawKey },
      }
    );
    assert.equal(resFound.status, 200);
    const jsonFound = await resFound.json();
    assert.equal(jsonFound.success, true);
    assert.equal(jsonFound.companyName, 'Alpha Tech Corp');
    assert.equal(jsonFound.status, 'DRAFT');
    assert.equal(jsonFound.publicUrl, null, 'Draft showcases should have null publicUrl');

    // 13.2 Non-existent lookup -> 404
    const resNotFound = await fetch(
      `${baseUrl}/api/integration/v1/prospects/non-existent-camp/non-existent-prosp`,
      {
        headers: { 'X-API-Key': mainRawKey },
      }
    );
    assert.equal(resNotFound.status, 404);
    const jsonNotFound = await resNotFound.json();
    assert.equal(jsonNotFound.error, 'PROSPECT_NOT_FOUND');
  });

  // ---------------------------------------------------------------------------
  // 14. Admin notification row created on successful push
  // ---------------------------------------------------------------------------
  await t.test('14. Admin notification row created on successful push', async () => {
    const notifRes = await query(
      `SELECT * FROM notifications
       WHERE user_id = $1 AND type = 'INTEGRATION_PROSPECT_CREATED'
       ORDER BY id DESC LIMIT 1`,
      [createdAdminUserIds[0]]
    );

    assert.ok(notifRes.rows.length >= 1, 'Admin notification must be recorded in notifications table');
    const notif = notifRes.rows[0];
    assert.match(notif.title, /New prospect pushed from DizitalGini/i);
  });

  // ---------------------------------------------------------------------------
  // 15. Batch record updated with incremented counts
  // ---------------------------------------------------------------------------
  await t.test('15. Batch record updated with incremented counts', async () => {
    const batchId = crypto.randomUUID();
    createdBatchIds.push(batchId);

    // Push first prospect under this batch
    const res1 = await fetch(`${baseUrl}/api/integration/v1/prospects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': mainRawKey,
        'Idempotency-Key': `idemp-batch-1-${Date.now()}`,
      },
      body: JSON.stringify({
        companyName: 'Batch Prospect One Corp',
        externalCampaignId: `camp-batch-${Date.now()}`,
        externalProspectId: `prosp-b1-${Date.now()}`,
        pushedByEmail: 'authorized@dizitalgini.com',
        batchId,
      }),
    });
    assert.equal(res1.status, 201);
    const json1 = await res1.json();
    createdShowcaseIds.push(json1.id);

    // Push second prospect under this batch
    const res2 = await fetch(`${baseUrl}/api/integration/v1/prospects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': mainRawKey,
        'Idempotency-Key': `idemp-batch-2-${Date.now()}`,
      },
      body: JSON.stringify({
        companyName: 'Batch Prospect Two Corp',
        externalCampaignId: `camp-batch-${Date.now()}`,
        externalProspectId: `prosp-b2-${Date.now()}`,
        pushedByEmail: 'authorized@dizitalgini.com',
        batchId,
      }),
    });
    assert.equal(res2.status, 201);
    const json2 = await res2.json();
    createdShowcaseIds.push(json2.id);

    // Verify batch counts in DB
    const batchCheck = await query('SELECT * FROM integration_batches WHERE id = $1', [batchId]);
    assert.equal(batchCheck.rows.length, 1);
    const batch = batchCheck.rows[0];
    assert.equal(batch.total_count, 2, 'Total count must be 2');
    assert.equal(batch.success_count, 2, 'Success count must be 2');
    assert.equal(batch.fail_count, 0, 'Fail count must be 0');
    assert.equal(batch.status, 'IN_PROGRESS');
  });

  // ---------------------------------------------------------------------------
  // 16. Idempotency: IN_PROGRESS rows are released on handler failure
  // ---------------------------------------------------------------------------
  await t.test(
    '16. Idempotency: IN_PROGRESS rows are released on handler failure, allowing safe retry',
    async () => {
      const { apiClientAuth } = await import('../../src/middleware/apiClientAuth.js');
      const { requireIdempotency } = await import('../../src/middleware/idempotency.js');
      const { default: integrationRoutes } = await import('../../src/routes/integrationRoutes.js');

      let shouldFail = true;
      const testKey = `idemp-thrown-${Date.now()}`;

      // Mount temporary test endpoint on integrationRoutes
      integrationRoutes.post(
        '/v1/test-thrown-handler',
        apiClientAuth,
        requireIdempotency,
        (req, res, next) => {
          if (shouldFail) {
            return next(new Error('Simulated internal server handler failure'));
          }
          return res.status(200).json({ success: true, message: 'Recovered after retry' });
        }
      );

      // Attempt 1: Handler throws error -> returns 500
      const resFail = await fetch(`${baseUrl}/api/integration/v1/test-thrown-handler`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': mainRawKey,
          'Idempotency-Key': testKey,
        },
        body: JSON.stringify({ action: 'do_work' }),
      });
      assert.equal(resFail.status, 500, 'Failing handler must return 500');

      // Verify that the IN_PROGRESS row was released/deleted
      let keyRows = [];
      for (let attempt = 0; attempt < 10; attempt++) {
        const keyCheck = await query(
          `SELECT * FROM integration_idempotency_keys WHERE client_id = $1 AND idempotency_key = $2`,
          [mainClient.client_id, testKey]
        );
        keyRows = keyCheck.rows;
        if (keyRows.length === 0) break;
        await new Promise((r) => setTimeout(r, 25));
      }
      assert.equal(
        keyRows.length,
        0,
        'IN_PROGRESS row must be deleted on handler 500 failure so retry is not blocked'
      );

      // Attempt 2: Retry with the same Idempotency-Key succeeds
      shouldFail = false;
      const resRetry = await fetch(`${baseUrl}/api/integration/v1/test-thrown-handler`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': mainRawKey,
          'Idempotency-Key': testKey,
        },
        body: JSON.stringify({ action: 'do_work' }),
      });
      assert.equal(resRetry.status, 200, 'Retry with same idempotency key must succeed');
      const jsonRetry = await resRetry.json();
      assert.equal(jsonRetry.success, true);
    }
  );
});
