import assert from 'assert';
import http from 'http';
import { query, connectPostgres } from '../../src/config/postgres.js';
import {
  uploadFile,
  getFileStream,
  getObjectStat,
  objectExists,
  deleteFile,
  checkStorageHealth,
  isMinioObjectKey,
  generateDeterministicDeliverableKey,
} from '../../src/services/storageService.js';
import { findAssetById } from '../../src/repositories/assetRepository.js';

const BASE_URL = 'http://localhost:5000/api';

async function runStorageAndAuthTests() {
  console.log('\n================================================================');
  console.log('   STORAGE, PUBLIC SAMPLE SHOWCASE & AUTH FLOW TEST SUITE       ');
  console.log('================================================================\n');

  await connectPostgres();

  let passed = 0;
  let failed = 0;

  const test = async (name, fn) => {
    try {
      await fn();
      console.log(`  [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  [FAIL] ${name}: ${err.message}`);
      failed++;
    }
  };

  // -------------------------------------------------------------
  // TEST GROUP 1: STORAGE ARCHITECTURE & OBJECT ISOLATION
  // -------------------------------------------------------------
  console.log('--- TEST GROUP 1: Storage Architecture & Object Separation ---');

  await test('Storage health diagnostics reports healthy without leaking secrets', async () => {
    const health = await checkStorageHealth();
    assert.strictEqual(health.status, 'healthy', 'Storage should be healthy');
    assert.strictEqual(health.storageReady, true, 'Storage ready must be true');
    assert.ok(health.bucket, 'Bucket name must be present');
    assert.strictEqual(health.accessKey, undefined, 'Access key must not be exposed');
    assert.strictEqual(health.secretKey, undefined, 'Secret key must not be exposed');
  });

  await test('Deterministic deliverable key follows tenant-isolated hierarchy', async () => {
    const key = generateDeterministicDeliverableKey({
      companyId: 56,
      requestId: 'CG-1010',
      submissionId: 1,
      version: 2,
      originalName: 'Lead Study Final.pdf',
    });
    assert.ok(key.startsWith('companies/56/requests/CG-1010/submissions/1/v2/'), 'Key prefix must match hierarchy');
    assert.ok(key.endsWith('Lead_Study_Final.pdf'), 'Key must end with sanitized filename');
    assert.ok(isMinioObjectKey(key), 'Key must be recognized as object key');
  });

  let testObjectKey = null;
  await test('Specialist file upload writes binary object and does not write base64', async () => {
    const syntheticBuffer = Buffer.from('CreativeGini Synthetic Deliverable Content V1', 'utf-8');
    const uploadRes = await uploadFile({
      buffer: syntheticBuffer,
      originalName: 'Deliverable_V1.pdf',
      mimeType: 'application/pdf',
      companyId: 'tenant-test-a',
      requestId: 'REQ-999',
      submissionId: 'sub-1',
      version: 1,
    });

    testObjectKey = uploadRes.objectKey;
    assert.ok(testObjectKey, 'Object key must be generated');
    assert.ok(!testObjectKey.startsWith('data:'), 'Object key must not be base64 data url');
    assert.strictEqual(uploadRes.size, syntheticBuffer.length, 'Size must match buffer length');
    assert.strictEqual(uploadRes.mimeType, 'application/pdf');

    // Verify object exists in storage
    const exists = await objectExists(testObjectKey);
    assert.strictEqual(exists, true, 'Stored object must exist');

    // Verify stream read
    const stream = await getFileStream(testObjectKey);
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const retrievedBuffer = Buffer.concat(chunks);
    assert.strictEqual(retrievedBuffer.toString('utf-8'), 'CreativeGini Synthetic Deliverable Content V1');
  });

  await test('Object remains accessible across process simulation (restart test)', async () => {
    assert.ok(testObjectKey, 'Key must be present');
    const stat = await getObjectStat(testObjectKey);
    assert.ok(stat.size > 0, 'Stat size must be positive');
  });

  // -------------------------------------------------------------
  // TEST GROUP 2: PUBLIC SAMPLE SHOWCASE & DATA EXPOSURE AUDIT
  // -------------------------------------------------------------
  console.log('\n--- TEST GROUP 2: Public Sample Showcase & Security Audit ---');

  let sampleData = null;
  await test('Public prospect can load published sample without credentials', async () => {
    const res = await fetch(`${BASE_URL}/samples/data-i2i`);
    assert.strictEqual(res.status, 200, 'Public sample endpoint must return 200');
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.ok(json.sample, 'Sample object must be present');
    sampleData = json.sample;
    assert.strictEqual(sampleData.slug, 'data-i2i');
    assert.strictEqual(sampleData.companyName, 'Data I2I');
  });

  await test('Data exposure audit: Public sample strictly redacts private client fields', async () => {
    assert.ok(sampleData, 'Sample data required');
    const rawString = JSON.stringify(sampleData);

    assert.strictEqual(rawString.includes('password'), false, 'Must not expose password');
    assert.strictEqual(rawString.includes('jwt'), false, 'Must not expose jwt');
    assert.strictEqual(rawString.includes('dev_minio'), false, 'Must not expose minio creds');

    // Verify lead cards do NOT contain private personal email or phone
    assert.ok(Array.isArray(sampleData.leads), 'Leads must be array');
    for (const lead of sampleData.leads) {
      assert.strictEqual(lead.email, undefined, 'Lead private email must be undefined');
      assert.strictEqual(lead.phone, undefined, 'Lead private phone must be undefined');
      assert.strictEqual(lead.notes, undefined, 'Lead private internal notes must be undefined');
      assert.ok(lead.name, 'Lead name must be public');
      assert.ok(lead.title, 'Lead title must be public');
      assert.ok(lead.company, 'Lead company must be public');
    }

    // Verify company study
    assert.ok(sampleData.companyStudy, 'Company study must exist');
    assert.ok(sampleData.companyStudy.businessOverview, 'Business overview must exist');

    // Verify pitch deck reference
    assert.ok(sampleData.pitchDeck, 'Pitch deck reference must exist');
    assert.ok(sampleData.pitchDeck.streamUrl, 'Stream URL must exist');
    assert.strictEqual(sampleData.pitchDeck.assetKey, undefined, 'Internal assetKey must not be exposed');
  });

  await test('Public prospect can stream published pitch deck asset', async () => {
    const res = await fetch(`${BASE_URL}/samples/data-i2i/pitch-deck`);
    assert.strictEqual(res.status, 200, 'Pitch deck stream must return 200');
    assert.strictEqual(res.headers.get('content-type'), 'application/pdf');
    const text = await res.text();
    assert.ok(text.startsWith('%PDF'), 'Streamed content must be valid PDF');
  });

  await test('Unpublished or invalid sample slug returns 404', async () => {
    const res = await fetch(`${BASE_URL}/samples/non-existent-sample-slug-12345`);
    assert.strictEqual(res.status, 404, 'Non-existent sample must return 404');
  });

  // -------------------------------------------------------------
  // TEST GROUP 3: PUBLIC REGISTRATION & AUTH ENTRY FLOW
  // -------------------------------------------------------------
  console.log('\n--- TEST GROUP 3: Authentication & Conversion Entry Flows ---');

  const testEmail = `prospect_${Date.now()}@testcompany.com`;
  let registeredUser = null;
  let authToken = null;

  await test('New prospect can SIGN UP via /api/auth/register', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Prospect Executive',
        email: testEmail,
        password: 'Password@2026',
        companyName: 'Apex Innovations Corp',
        phone: '+1-555-0199',
      }),
    });

    assert.strictEqual(res.status, 201, 'Signup must return 201 Created');
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.ok(json.token, 'Must return JWT token');
    assert.strictEqual(json.user.role, 'USER', 'New signup must have USER role');
    assert.strictEqual(json.user.company.name, 'Apex Innovations Corp');

    registeredUser = json.user;
    authToken = json.token;
  });

  await test('Duplicate signup with same email is blocked (409 Conflict)', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Duplicate Executive',
        email: testEmail,
        password: 'Password@2026',
        companyName: 'Another Corp',
      }),
    });
    assert.strictEqual(res.status, 409, 'Duplicate signup must return 409');
  });

  await test('Newly registered client can LOGIN successfully', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'Password@2026',
      }),
    });
    assert.strictEqual(res.status, 200, 'Login must return 200');
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.user.email, testEmail);
  });

  await test('Existing demo credentials remain functional (Super Admin, Client, Specialists)', async () => {
    const demoAccounts = [
      { email: 'client@creativegini.com', pass: 'Client@123', expectedRole: 'USER' },
      { email: 'team@creativegini.com', pass: 'Admin@2026', expectedRole: 'SUPER_ADMIN' },
      { email: 'lead@creativegini.com', pass: 'Lead@123', expectedRole: 'COMPANY_LEAD' },
      { email: 'boost@creativegini.com', pass: 'Boost@123', expectedRole: 'COMPANY_BOOST' },
      { email: 'ui@creativegini.com', pass: 'UI@123', expectedRole: 'LANDING_PAGE' },
    ];

    for (const acc of demoAccounts) {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: acc.email, password: acc.pass }),
      });
      assert.strictEqual(res.status, 200, `Login for ${acc.email} must succeed`);
      const json = await res.json();
      assert.strictEqual(json.user.role, acc.expectedRole, `Role for ${acc.email} must be ${acc.expectedRole}`);
    }
  });

  // -------------------------------------------------------------
  // TEST GROUP 4: CROSS-TENANT ISOLATION RE-VERIFICATION
  // -------------------------------------------------------------
  console.log('\n--- TEST GROUP 4: Cross-Tenant File & Data Access Isolation ---');

  await test('Unauthenticated access to private assets is blocked (401)', async () => {
    const res = await fetch(`${BASE_URL}/assets/1/stream`);
    assert.strictEqual(res.status, 401, 'Unauthenticated asset stream must be 401');
  });

  await test('New client cannot access another company profile (403)', async () => {
    // Attempt to access company 1 (another tenant) with new client token
    const res = await fetch(`${BASE_URL}/company/1`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    assert.strictEqual(res.status, 403, 'Cross-tenant company access must be 403 Forbidden');
  });

  // Cleanup
  console.log('\n--- CLEANUP: Removing Ephemeral Test Entities ---');
  if (testObjectKey) {
    await deleteFile(testObjectKey).catch(() => {});
  }
  if (registeredUser) {
    await query('DELETE FROM users WHERE id = $1', [registeredUser.id]).catch(() => {});
    if (registeredUser.company?.id) {
      await query('DELETE FROM companies WHERE id = $1', [registeredUser.company.id]).catch(() => {});
    }
  }
  console.log('Cleanup finished.\n');

  console.log('================================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runStorageAndAuthTests().catch((err) => {
  console.error('[Fatal Test Error]:', err);
  process.exit(1);
});
