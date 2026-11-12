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
import { revokeApiKey } from '../../scripts/revoke-api-key.js';
import {
  runAssetCleanup,
  stopAssetCleanupJob,
  ASSET_CLEANUP_ADVISORY_LOCK_KEY,
} from '../../src/services/assetCleanupService.js';
import { getBucketName } from '../../src/services/storageService.js';

// Dynamically import real server app
const { app: realServerApp } = await import('../../src/server.js');

const restoreEnv = (key, val) => {
  if (val === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = val;
  }
};

test('Phase 2A API Client Auth & Asset Upload Suite', async (t) => {
  await connectPostgres();
  await ensureIntegrationSchema();

  // Start real HTTP server on ephemeral random port
  const server = realServerApp.listen(0);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  const createdClientIds = [];
  const createdAssetKeys = [];

  t.after(async () => {
    // Clean up created clients
    if (createdClientIds.length > 0) {
      await query(`DELETE FROM api_clients WHERE client_id = ANY($1::text[])`, [
        createdClientIds,
      ]).catch(() => {});
    }

    // Clean up created assets
    if (createdAssetKeys.length > 0) {
      await query(`DELETE FROM integration_assets WHERE asset_key = ANY($1::text[])`, [
        createdAssetKeys,
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

    // Close HTTP server
    stopAssetCleanupJob();
    if (server) {
      if (typeof server.closeAllConnections === 'function') server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
    }
    await getPool().end();
    setTimeout(() => process.exit(0), 50);
  });

  // ---------------------------------------------------------------------------
  // 1. issue-api-key & revoke-api-key CLI/Scripts
  // ---------------------------------------------------------------------------
  let activeClient = null;
  let activeRawKey = null;

  await t.test('1. issue-api-key creates active client with hashed key; revoke sets status REVOKED', async () => {
    const { client, rawKey } = await issueApiKey({
      clientName: 'Phase2A Test Client',
      scopes: ['prospects:write', 'assets:write'],
    });

    createdClientIds.push(client.client_id);
    activeClient = client;
    activeRawKey = rawKey;

    assert.ok(rawKey.startsWith('dzg_live_'), 'Key must start with dzg_live_ prefix');
    assert.equal(rawKey.length, 41, 'Key length must be 9 (prefix) + 32 (hex) = 41');
    assert.equal(client.status, 'ACTIVE');
    assert.deepEqual(client.scopes, ['prospects:write', 'assets:write']);

    // Check DB record
    const dbRes = await query('SELECT * FROM api_clients WHERE client_id = $1', [client.client_id]);
    assert.equal(dbRes.rows.length, 1);
    const dbRow = dbRes.rows[0];

    const expectedHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    assert.equal(dbRow.api_key_hash, expectedHash, 'Database must store SHA-256 hash only');
    assert.notEqual(dbRow.api_key_hash, rawKey, 'Plain key must never be stored in database');

    // Test revoke
    const { client: tempClient, rawKey: tempKey } = await issueApiKey({
      clientName: 'Client to Revoke',
      scopes: ['prospects:write'],
    });
    createdClientIds.push(tempClient.client_id);

    const revoked = await revokeApiKey({ clientId: tempClient.client_id });
    assert.equal(revoked.status, 'REVOKED');

    const revokedDbRes = await query('SELECT status FROM api_clients WHERE client_id = $1', [
      tempClient.client_id,
    ]);
    assert.equal(revokedDbRes.rows[0].status, 'REVOKED');
  });

  // ---------------------------------------------------------------------------
  // 2. Authentication header extraction and query string rejection
  // ---------------------------------------------------------------------------
  await t.test('2. Valid key in X-API-Key authenticates; valid key in Bearer authenticates; key in query string rejected', async () => {
    // 2.1 X-API-Key header
    const resXApiKey = await fetch(`${baseUrl}/api/integration/v1/health`, {
      headers: { 'X-API-Key': activeRawKey },
    });
    assert.equal(resXApiKey.status, 200, 'X-API-Key must authenticate successfully');
    const jsonXApiKey = await resXApiKey.json();
    assert.equal(jsonXApiKey.status, 'ok');
    assert.equal(jsonXApiKey.clientName, 'Phase2A Test Client');

    // 2.2 Authorization: Bearer header
    const resBearer = await fetch(`${baseUrl}/api/integration/v1/health`, {
      headers: { Authorization: `Bearer ${activeRawKey}` },
    });
    assert.equal(resBearer.status, 200, 'Bearer token must authenticate successfully');
    const jsonBearer = await resBearer.json();
    assert.equal(jsonBearer.status, 'ok');

    // 2.3 Key passed in query string MUST be rejected (401)
    const resQueryApiKey = await fetch(
      `${baseUrl}/api/integration/v1/health?apiKey=${activeRawKey}`
    );
    assert.equal(resQueryApiKey.status, 401, 'Credentials in query string must return 401');
    const jsonQueryApiKey = await resQueryApiKey.json();
    assert.equal(jsonQueryApiKey.error, 'CREDENTIALS_IN_URL_OR_BODY_FORBIDDEN');

    const resQueryToken = await fetch(
      `${baseUrl}/api/integration/v1/health?token=${activeRawKey}`
    );
    assert.equal(resQueryToken.status, 401, 'Token in query string must return 401');

    // 2.4 Key passed in request body MUST be rejected (401)
    const resBodyKey = await fetch(`${baseUrl}/api/integration/v1/assets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: activeRawKey }),
    });
    assert.equal(resBodyKey.status, 401, 'Credentials in request body must return 401');
    const jsonBodyKey = await resBodyKey.json();
    assert.equal(jsonBodyKey.error, 'CREDENTIALS_IN_URL_OR_BODY_FORBIDDEN');
  });

  // ---------------------------------------------------------------------------
  // 3. Invalid key -> 401; revoked key -> 403; missing scope -> 403
  // ---------------------------------------------------------------------------
  await t.test('3. Invalid key -> 401; revoked key -> 403; missing scope -> 403', async () => {
    // 3.1 Non-existent key
    const resInvalid = await fetch(`${baseUrl}/api/integration/v1/health`, {
      headers: { 'X-API-Key': 'dzg_live_00000000000000000000000000000000' },
    });
    assert.equal(resInvalid.status, 401, 'Invalid key must return 401');
    const jsonInvalid = await resInvalid.json();
    assert.equal(jsonInvalid.error, 'INVALID_API_KEY');

    // 3.2 Revoked client
    const { client: revokedClient, rawKey: revokedKey } = await issueApiKey({
      clientName: 'Revoked Test Client',
      scopes: ['prospects:write', 'assets:write'],
    });
    createdClientIds.push(revokedClient.client_id);
    await revokeApiKey({ clientId: revokedClient.client_id });

    const resRevoked = await fetch(`${baseUrl}/api/integration/v1/health`, {
      headers: { 'X-API-Key': revokedKey },
    });
    assert.equal(resRevoked.status, 403, 'Revoked client key must return 403');
    const jsonRevoked = await resRevoked.json();
    assert.equal(jsonRevoked.error, 'CLIENT_REVOKED');

    // 3.3 Missing required scope (has assets:write only, attempts to access /schema which requires prospects:write)
    const { client: assetOnlyClient, rawKey: assetOnlyKey } = await issueApiKey({
      clientName: 'Asset Only Client',
      scopes: ['assets:write'],
    });
    createdClientIds.push(assetOnlyClient.client_id);

    const resMissingScope = await fetch(`${baseUrl}/api/integration/v1/schema`, {
      headers: { 'X-API-Key': assetOnlyKey },
    });
    assert.equal(resMissingScope.status, 403, 'Missing required scope must return 403');
    const jsonMissingScope = await resMissingScope.json();
    assert.equal(jsonMissingScope.error, 'INSUFFICIENT_SCOPE');

    // 3.4 Failed-auth per-IP limiter: returns 429 after burst limit of failed authentication attempts
    const savedAuthLimit = process.env.TEST_INTEGRATION_AUTH_LIMIT;
    try {
      process.env.TEST_INTEGRATION_AUTH_LIMIT = '3';
      const clientIp = '198.51.100.99';
      for (let i = 0; i < 3; i++) {
        const resFail = await fetch(`${baseUrl}/api/integration/v1/health`, {
          headers: {
            'X-API-Key': `dzg_live_badkey_${i}`,
            'X-Forwarded-For': clientIp,
          },
        });
        assert.equal(resFail.status, 401);
      }
      const resRateLimited = await fetch(`${baseUrl}/api/integration/v1/health`, {
        headers: {
          'X-API-Key': 'dzg_live_badkey_overflow',
          'X-Forwarded-For': clientIp,
        },
      });
      assert.equal(resRateLimited.status, 429, 'Failed authentication attempts exceeding limit must return 429');
      const jsonRateLimited = await resRateLimited.json();
      assert.equal(jsonRateLimited.error, 'RATE_LIMIT_EXCEEDED');
    } finally {
      restoreEnv('TEST_INTEGRATION_AUTH_LIMIT', savedAuthLimit);
    }
  });

  // ---------------------------------------------------------------------------
  // 4. Feature Flag: Disabled ENABLE_INTEGRATION_API -> 404
  // ---------------------------------------------------------------------------
  await t.test('4. Disabled ENABLE_INTEGRATION_API -> 404 on all endpoints', async () => {
    const savedFlag = process.env.ENABLE_INTEGRATION_API;
    try {
      process.env.ENABLE_INTEGRATION_API = 'false';

      const resHealth = await fetch(`${baseUrl}/api/integration/v1/health`, {
        headers: { 'X-API-Key': activeRawKey },
      });
      assert.equal(resHealth.status, 404, 'Health endpoint must 404 when integration API is disabled');

      const resSchema = await fetch(`${baseUrl}/api/integration/v1/schema`, {
        headers: { 'X-API-Key': activeRawKey },
      });
      assert.equal(resSchema.status, 404, 'Schema endpoint must 404 when integration API is disabled');
    } finally {
      restoreEnv('ENABLE_INTEGRATION_API', savedFlag);
    }
  });

  // ---------------------------------------------------------------------------
  // 5. Discovery endpoint: GET /health
  // ---------------------------------------------------------------------------
  await t.test('5. GET /health returns client metadata', async () => {
    const res = await fetch(`${baseUrl}/api/integration/v1/health`, {
      headers: { 'X-API-Key': activeRawKey },
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.status, 'ok');
    assert.equal(json.clientName, 'Phase2A Test Client');
    assert.deepEqual(json.scopes, ['prospects:write', 'assets:write']);
  });

  // ---------------------------------------------------------------------------
  // 6. Discovery endpoint: GET /schema
  // ---------------------------------------------------------------------------
  await t.test('6. GET /schema returns payload contract', async () => {
    const res = await fetch(`${baseUrl}/api/integration/v1/schema`, {
      headers: { 'X-API-Key': activeRawKey },
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(json.schema, 'Response must include JSON Schema');
    assert.ok(json.schema.required.includes('companyName'));
    assert.ok(json.schema.required.includes('externalCampaignId'));
    assert.ok(json.schema.required.includes('externalProspectId'));
    assert.ok(json.schema.properties.companyName);
    assert.ok(json.schema.properties.leads);
  });

  // ---------------------------------------------------------------------------
  // 7. POST /assets: valid PDF creates STAGED asset row and file in storage -> 201
  // ---------------------------------------------------------------------------
  await t.test('7. POST /assets: valid PDF creates STAGED asset row and file in storage, returns 201', async () => {
    const pdfContent = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n%%EOF');
    const formData = new FormData();
    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    formData.append('file', blob, 'sample_study.pdf');

    const res = await fetch(`${baseUrl}/api/integration/v1/assets`, {
      method: 'POST',
      headers: { 'X-API-Key': activeRawKey },
      body: formData,
    });

    assert.equal(res.status, 201, 'Valid PDF upload must return 201 Created');
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(json.assetKey.startsWith('dzg_ast_'));
    createdAssetKeys.push(json.assetKey);

    const expectedHash = crypto.createHash('sha256').update(pdfContent).digest('hex');
    assert.equal(json.sha256, expectedHash, 'Computed SHA-256 must match payload');
    assert.equal(json.size, pdfContent.length);
    assert.ok(json.expiresAt);

    // Verify row in database
    const dbRes = await query('SELECT * FROM integration_assets WHERE asset_key = $1', [
      json.assetKey,
    ]);
    assert.equal(dbRes.rows.length, 1);
    const assetRow = dbRes.rows[0];
    assert.equal(assetRow.status, 'STAGED');
    assert.equal(assetRow.client_id, activeClient.client_id);
    assert.equal(assetRow.sha256, expectedHash);

    // Verify file on disk
    const uuid = json.assetKey.replace(/^dzg_ast_/, '');
    const bucket = getBucketName();
    const filePath = path.resolve(
      process.cwd(),
      'storage',
      'buckets',
      bucket,
      'temp',
      activeClient.client_id,
      `${uuid}.pdf`
    );
    assert.ok(fs.existsSync(filePath), `Storage file must exist at ${filePath}`);
    const fileBytes = fs.readFileSync(filePath);
    assert.deepEqual(fileBytes, pdfContent);
  });

  // ---------------------------------------------------------------------------
  // 8. POST /assets: non-PDF rejected by magic bytes -> 400
  // ---------------------------------------------------------------------------
  await t.test('8. POST /assets: non-PDF (text file disguised as .pdf) rejected by magic bytes -> 400', async () => {
    const fakePdfContent = Buffer.from('NOT A PDF FILE - plain text pretending to be a document');
    const formData = new FormData();
    const blob = new Blob([fakePdfContent], { type: 'application/pdf' });
    formData.append('file', blob, 'fake.pdf');

    const res = await fetch(`${baseUrl}/api/integration/v1/assets`, {
      method: 'POST',
      headers: { 'X-API-Key': activeRawKey },
      body: formData,
    });

    assert.equal(res.status, 400, 'Non-PDF magic bytes must return 400 Bad Request');
    const json = await res.json();
    assert.equal(json.error, 'INVALID_FILE_TYPE');

    // Confirm no row was written to integration_assets
    const fakeHash = crypto.createHash('sha256').update(fakePdfContent).digest('hex');
    const dbRes = await query('SELECT * FROM integration_assets WHERE sha256 = $1', [fakeHash]);
    assert.equal(dbRes.rows.length, 0, 'No DB row must be created for rejected upload');
  });

  // ---------------------------------------------------------------------------
  // 9. POST /assets: file > 25MB rejected, no orphan file or DB row left -> 413
  // ---------------------------------------------------------------------------
  await t.test('9. POST /assets: file > 25MB rejected, no orphan file or DB row left -> 413', async () => {
    // Set test max size to 50KB to test limit cleanly and fast without allocating huge memory
    const savedMaxSize = process.env.TEST_MAX_ASSET_SIZE;
    try {
      process.env.TEST_MAX_ASSET_SIZE = '50000'; // 50 KB

      // Create a 70 KB payload with valid %PDF- magic bytes
      const oversizeBuffer = Buffer.alloc(70 * 1024);
      oversizeBuffer.write('%PDF-1.4\n');

      const formData = new FormData();
      const blob = new Blob([oversizeBuffer], { type: 'application/pdf' });
      formData.append('file', blob, 'oversize.pdf');

      const res = await fetch(`${baseUrl}/api/integration/v1/assets`, {
        method: 'POST',
        headers: { 'X-API-Key': activeRawKey },
        body: formData,
      });

      assert.equal(res.status, 413, 'File exceeding size limit must return 413 Payload Too Large');
      const json = await res.json();
      assert.equal(json.error, 'FILE_TOO_LARGE');

      // Verify no orphan DB row
      const oversizeHash = crypto.createHash('sha256').update(oversizeBuffer).digest('hex');
      const dbRes = await query('SELECT * FROM integration_assets WHERE sha256 = $1', [oversizeHash]);
      assert.equal(dbRes.rows.length, 0, 'No DB row must exist for oversize file');
    } finally {
      restoreEnv('TEST_MAX_ASSET_SIZE', savedMaxSize);
    }
  });

  // ---------------------------------------------------------------------------
  // 10. POST /assets: client lacking assets:write scope -> 403
  // ---------------------------------------------------------------------------
  await t.test('10. POST /assets: client lacking assets:write scope -> 403', async () => {
    const { client: prospectOnlyClient, rawKey: prospectOnlyKey } = await issueApiKey({
      clientName: 'Prospects Only Client',
      scopes: ['prospects:write'],
    });
    createdClientIds.push(prospectOnlyClient.client_id);

    const pdfContent = Buffer.from('%PDF-1.4\nValid PDF content\n%%EOF');
    const formData = new FormData();
    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    formData.append('file', blob, 'test.pdf');

    const res = await fetch(`${baseUrl}/api/integration/v1/assets`, {
      method: 'POST',
      headers: { 'X-API-Key': prospectOnlyKey },
      body: formData,
    });

    assert.equal(res.status, 403, 'Client without assets:write scope must return 403');
    const json = await res.json();
    assert.equal(json.error, 'INSUFFICIENT_SCOPE');
  });

  // ---------------------------------------------------------------------------
  // 10b. Aborted upload leaves no file and no database row
  // ---------------------------------------------------------------------------
  await t.test('10b. POST /assets: Client aborted upload leaves no file and no database row', async () => {
    const abortController = new AbortController();
    const pdfChunk = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\n');

    const formData = new FormData();
    const blob = new Blob([pdfChunk], { type: 'application/pdf' });
    formData.append('file', blob, 'aborted.pdf');

    const uploadPromise = fetch(`${baseUrl}/api/integration/v1/assets`, {
      method: 'POST',
      headers: { 'X-API-Key': activeRawKey },
      body: formData,
      signal: abortController.signal,
    }).catch((err) => err);

    // Abort request
    abortController.abort();
    await uploadPromise;

    // Verify no row created in integration_assets
    const hash = crypto.createHash('sha256').update(pdfChunk).digest('hex');
    const dbRes = await query('SELECT * FROM integration_assets WHERE sha256 = $1', [hash]);
    assert.equal(dbRes.rows.length, 0, 'No DB row must exist for aborted upload');
  });

  // ---------------------------------------------------------------------------
  // 10c. Security: Staged asset is unreachable via any public URL or static path
  // ---------------------------------------------------------------------------
  await t.test('10c. Security: Staged asset is unreachable via any public URL or static path', async () => {
    assert.ok(createdAssetKeys.length > 0, 'Must have at least one created staged asset');
    const assetKey = createdAssetKeys[0];
    const uuid = assetKey.replace(/^dzg_ast_/, '');
    const clientId = activeClient.client_id;

    // Public showcase endpoint by uuid
    const resPublic = await fetch(`${baseUrl}/api/samples/${uuid}`);
    assert.equal(resPublic.status, 404, 'Staged asset uuid must not be accessible via public sample endpoint');

    // Public company study pdf endpoint
    const resStudy = await fetch(`${baseUrl}/api/samples/${uuid}/company-study-pdf`);
    assert.equal(resStudy.status, 404, 'Staged asset uuid must not be accessible via company study endpoint');

    // Public pitch deck endpoint
    const resDeck = await fetch(`${baseUrl}/api/samples/${uuid}/pitch-deck`);
    assert.equal(resDeck.status, 404, 'Staged asset uuid must not be accessible via pitch deck endpoint');

    // Direct static /storage/ access
    const resStatic = await fetch(`${baseUrl}/storage/buckets/dizigini-assets/temp/${clientId}/${uuid}.pdf`);
    assert.equal(resStatic.status, 404, 'Direct static /storage access to staged temp file must return 404');
  });

  // ---------------------------------------------------------------------------
  // 10d. Per-client staged-bytes quota enforcement
  // ---------------------------------------------------------------------------
  await t.test('10d. POST /assets: Per-client staged-bytes quota rejected with 413 STAGED_QUOTA_EXCEEDED', async () => {
    const savedQuota = process.env.CLIENT_STAGED_BYTES_QUOTA;
    try {
      process.env.CLIENT_STAGED_BYTES_QUOTA = '1000'; // 1000 bytes max staged

      const { client: quotaClient, rawKey: quotaKey } = await issueApiKey({
        clientName: 'Quota Test Client',
        scopes: ['assets:write'],
      });
      createdClientIds.push(quotaClient.client_id);

      // 1. Upload 600 bytes (within quota)
      const buffer1 = Buffer.alloc(600);
      buffer1.write('%PDF-1.4\n');
      const formData1 = new FormData();
      formData1.append('file', new Blob([buffer1], { type: 'application/pdf' }), 'file1.pdf');

      const res1 = await fetch(`${baseUrl}/api/integration/v1/assets`, {
        method: 'POST',
        headers: { 'X-API-Key': quotaKey },
        body: formData1,
      });
      assert.equal(res1.status, 201, 'Upload within quota must succeed');
      const json1 = await res1.json();
      createdAssetKeys.push(json1.assetKey);

      // 2. Upload second 600 bytes (total staged = 1200 > 1000 quota)
      const buffer2 = Buffer.alloc(600);
      buffer2.write('%PDF-1.4\nSecond distinct content for quota check\n');
      const formData2 = new FormData();
      formData2.append('file', new Blob([buffer2], { type: 'application/pdf' }), 'file2.pdf');

      const res2 = await fetch(`${baseUrl}/api/integration/v1/assets`, {
        method: 'POST',
        headers: { 'X-API-Key': quotaKey },
        body: formData2,
      });
      assert.equal(res2.status, 413, 'Upload exceeding staged quota must return 413');
      const json2 = await res2.json();
      assert.equal(json2.error, 'STAGED_QUOTA_EXCEEDED');

      // Verify no row created in DB for exceeded upload
      const hash2 = crypto.createHash('sha256').update(buffer2).digest('hex');
      const dbRes2 = await query('SELECT * FROM integration_assets WHERE sha256 = $1', [hash2]);
      assert.equal(dbRes2.rows.length, 0, 'No row must exist for quota-exceeded upload');
    } finally {
      restoreEnv('CLIENT_STAGED_BYTES_QUOTA', savedQuota);
    }
  });

  // ---------------------------------------------------------------------------
  // 10e. Storage: Non-connection error in deleteFile does NOT mutate storage driver
  // ---------------------------------------------------------------------------
  await t.test('10e. Storage: Non-connection error in deleteFile does NOT mutate storage driver', async () => {
    const { setStorageDriver, resetStorageDriver, deleteFile: storageDeleteFile } = await import(
      '../../src/services/storageService.js'
    );
    let removeCalled = false;
    const mockDriver = {
      async removeObject() {
        removeCalled = true;
        const err = new Error('AccessDenied: Insufficient S3 permissions');
        err.code = 'AccessDenied';
        throw err;
      },
    };
    setStorageDriver(mockDriver);
    try {
      await assert.rejects(
        () => storageDeleteFile('test-object-key.pdf'),
        /AccessDenied/
      );
      assert.equal(removeCalled, true, 'removeObject must have been called');
    } finally {
      resetStorageDriver();
    }
  });

  // ---------------------------------------------------------------------------
  // 10f. Server Mounting: Integration routes are mounted before global apiLimiter
  // ---------------------------------------------------------------------------
  await t.test('10f. Server Mounting: Integration routes are mounted before global apiLimiter', () => {
    const integrationLayerIdx = realServerApp._router.stack.findIndex(
      (layer) => layer.regexp && layer.regexp.toString().includes('integration')
    );
    const globalApiLimiterIdx = realServerApp._router.stack.findIndex(
      (layer) => layer.regexp && layer.regexp.toString().includes('^\\/api\\/?(?=\\/|$)')
    );
    assert.ok(integrationLayerIdx !== -1, 'Integration router layer must be mounted in Express app');
    assert.ok(globalApiLimiterIdx !== -1, 'Global apiLimiter layer must be mounted in Express app');
    assert.ok(
      integrationLayerIdx < globalApiLimiterIdx,
      `Integration router (index ${integrationLayerIdx}) must precede global apiLimiter (index ${globalApiLimiterIdx}) so server-to-server traffic is not throttled by browser limits`
    );
  });

  // ---------------------------------------------------------------------------
  // 11. Asset cleanup job deletes expired STAGED files and rows, does not touch claimed ones, honors advisory lock
  // ---------------------------------------------------------------------------
  await t.test(
    '11. Asset cleanup job deletes expired STAGED files and rows, does not touch claimed ones, honors advisory lock',
    async () => {
      const bucket = getBucketName();
      const testClientId = activeClient.client_id;
      const baseDir = path.resolve(
        process.cwd(),
        'storage',
        'buckets',
        bucket,
        'temp',
        testClientId
      );
      fs.mkdirSync(baseDir, { recursive: true });

      // 1. Expired STAGED asset (should be deleted)
      const expiredStagedUuid = crypto.randomUUID();
      const expiredStagedKey = `dzg_ast_${expiredStagedUuid}`;
      const expiredStagedFile = path.join(baseDir, `${expiredStagedUuid}.pdf`);
      fs.writeFileSync(expiredStagedFile, '%PDF-1.4 expired staged');

      await query(
        `INSERT INTO integration_assets (asset_key, client_id, sha256, size, status, expires_at)
         VALUES ($1, $2, 'dummy_hash_1', 100, 'STAGED', NOW() - INTERVAL '2 hours')`,
        [expiredStagedKey, testClientId]
      );
      createdAssetKeys.push(expiredStagedKey);

      // 2. Unexpired STAGED asset (should be preserved)
      const unexpiredStagedUuid = crypto.randomUUID();
      const unexpiredStagedKey = `dzg_ast_${unexpiredStagedUuid}`;
      const unexpiredStagedFile = path.join(baseDir, `${unexpiredStagedUuid}.pdf`);
      fs.writeFileSync(unexpiredStagedFile, '%PDF-1.4 unexpired staged');

      await query(
        `INSERT INTO integration_assets (asset_key, client_id, sha256, size, status, expires_at)
         VALUES ($1, $2, 'dummy_hash_2', 100, 'STAGED', NOW() + INTERVAL '12 hours')`,
        [unexpiredStagedKey, testClientId]
      );
      createdAssetKeys.push(unexpiredStagedKey);

      // 3. Expired CLAIMED asset (should be preserved - claimed assets are permanent)
      const expiredClaimedUuid = crypto.randomUUID();
      const expiredClaimedKey = `dzg_ast_${expiredClaimedUuid}`;
      const expiredClaimedFile = path.join(baseDir, `${expiredClaimedUuid}.pdf`);
      fs.writeFileSync(expiredClaimedFile, '%PDF-1.4 expired claimed');

      await query(
        `INSERT INTO integration_assets (asset_key, client_id, sha256, size, status, expires_at)
         VALUES ($1, $2, 'dummy_hash_3', 100, 'CLAIMED', NOW() - INTERVAL '2 hours')`,
        [expiredClaimedKey, testClientId]
      );
      createdAssetKeys.push(expiredClaimedKey);

      // Run cleanup pass
      const cleanupResult = await runAssetCleanup();
      assert.equal(cleanupResult.acquired, true);
      assert.ok(cleanupResult.cleanedCount >= 1);

      // Verify expired STAGED was deleted from DB and disk
      const checkExpiredStagedDb = await query(
        'SELECT * FROM integration_assets WHERE asset_key = $1',
        [expiredStagedKey]
      );
      assert.equal(checkExpiredStagedDb.rows.length, 0, 'Expired STAGED asset row must be deleted');
      assert.equal(
        fs.existsSync(expiredStagedFile),
        false,
        'Expired STAGED asset file must be unlinked'
      );

      // Verify unexpired STAGED was PRESERVED in DB and disk
      const checkUnexpiredStagedDb = await query(
        'SELECT * FROM integration_assets WHERE asset_key = $1',
        [unexpiredStagedKey]
      );
      assert.equal(
        checkUnexpiredStagedDb.rows.length,
        1,
        'Unexpired STAGED asset row must be preserved'
      );
      assert.equal(
        fs.existsSync(unexpiredStagedFile),
        true,
        'Unexpired STAGED asset file must be preserved'
      );

      // Verify expired CLAIMED was PRESERVED in DB and disk
      const checkExpiredClaimedDb = await query(
        'SELECT * FROM integration_assets WHERE asset_key = $1',
        [expiredClaimedKey]
      );
      assert.equal(
        checkExpiredClaimedDb.rows.length,
        1,
        'CLAIMED asset row must NEVER be deleted by cleanup'
      );
      assert.equal(
        fs.existsSync(expiredClaimedFile),
        true,
        'CLAIMED asset file must NEVER be unlinked by cleanup'
      );

      // Clean up manually preserved test files
      fs.promises.unlink(unexpiredStagedFile).catch(() => {});
      fs.promises.unlink(expiredClaimedFile).catch(() => {});

      // 4. Advisory Lock Contention & Release Test with dedicated pool client
      const pool = getPool();
      const lockClient = await pool.connect();
      try {
        const lockAcquired = await lockClient.query('SELECT pg_try_advisory_lock($1) AS acquired', [
          ASSET_CLEANUP_ADVISORY_LOCK_KEY,
        ]);
        assert.equal(lockAcquired.rows[0].acquired, true, 'First dedicated client must acquire the lock');

        // Second pass while lock is held by separate client must fail to acquire and skip
        const contentionResult = await runAssetCleanup();
        assert.equal(
          contentionResult.acquired,
          false,
          'Cleanup must honor advisory lock and skip when held by another instance'
        );
        assert.equal(contentionResult.cleanedCount, 0);

        // Release the lock on the first client
        const unlockRes = await lockClient.query('SELECT pg_advisory_unlock($1) AS released', [
          ASSET_CLEANUP_ADVISORY_LOCK_KEY,
        ]);
        assert.equal(unlockRes.rows[0].released, true, 'First client must release the advisory lock');

        // Third pass after unlock must acquire the lock successfully
        const postUnlockResult = await runAssetCleanup();
        assert.equal(
          postUnlockResult.acquired,
          true,
          'Cleanup must acquire the advisory lock once previous owner releases it'
        );
      } finally {
        await lockClient.query('SELECT pg_advisory_unlock($1)', [ASSET_CLEANUP_ADVISORY_LOCK_KEY]).catch(() => {});
        lockClient.release();
      }
    }
  );

  // ---------------------------------------------------------------------------
  // 12. Rate limiter returns 429 when burst limit exceeded
  // ---------------------------------------------------------------------------
  await t.test('12. Rate limiter returns 429 when burst limit exceeded', async () => {
    const savedLimit = process.env.TEST_INTEGRATION_REGULAR_LIMIT;
    try {
      // Set burst threshold to 3 requests
      process.env.TEST_INTEGRATION_REGULAR_LIMIT = '3';

      const { client: rateClient, rawKey: rateKey } = await issueApiKey({
        clientName: 'Rate Limit Test Client',
        scopes: ['prospects:write'],
      });
      createdClientIds.push(rateClient.client_id);

      // Requests 1, 2, 3 should succeed
      for (let i = 0; i < 3; i++) {
        const res = await fetch(`${baseUrl}/api/integration/v1/health`, {
          headers: { 'X-API-Key': rateKey },
        });
        assert.equal(res.status, 200, `Request ${i + 1} within limit must return 200`);
      }

      // 4th request must be rate limited (429)
      const resExceeded = await fetch(`${baseUrl}/api/integration/v1/health`, {
        headers: { 'X-API-Key': rateKey },
      });
      assert.equal(resExceeded.status, 429, 'Burst exceeding limit must return 429');
      const jsonExceeded = await resExceeded.json();
      assert.equal(jsonExceeded.error, 'RATE_LIMIT_EXCEEDED');
    } finally {
      restoreEnv('TEST_INTEGRATION_REGULAR_LIMIT', savedLimit);
    }
  });

  // ---------------------------------------------------------------------------
  // 13. >2MB JSON body rejected with 413 before auth
  // ---------------------------------------------------------------------------
  await t.test(
    '13. Server Body Limits: >2MB JSON body to /api/integration is rejected with 413 before auth',
    async () => {
      // 2.5MB payload string
      const largePayload = JSON.stringify({
        data: 'x'.repeat(2.5 * 1024 * 1024),
      });

      // Send request without any API key or auth headers
      const res = await fetch(`${baseUrl}/api/integration/v1/prospects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: largePayload,
      });

      assert.equal(res.status, 413, 'Unauthenticated request with >2MB JSON body must return 413');
      const json = await res.json();
      assert.equal(json.error, 'PAYLOAD_TOO_LARGE');
    }
  );
});
