/**
 * MinIO Storage Integration & Lifecycle Test Suite
 *
 * Validates:
 * 1. MinIO client initialization & configuration guards
 * 2. Data URL validation and Buffer conversion
 * 3. MinIO object key generation & prefixes
 * 4. Ingesting Data URLs into MinIO object storage
 * 5. PostgreSQL persistence of object keys (NOT base64 data)
 * 6. Authenticated streaming from MinIO (200 OK & 206 Partial Content)
 * 7. Authenticated download with Content-Disposition
 * 8. Safe document replacement (new uploaded, DB updated, old deleted)
 * 9. Missing object 404 handling
 * 10. Backward compatibility with legacy base64 Data URLs
 * 11. Key People authorization (locked/unlocked)
 * 12. Cross-tenant IDOR protection
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';
import jwt from 'jsonwebtoken';
import { Readable } from 'stream';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { query } from '../../src/config/postgres.js';
import * as storageService from '../../src/services/storageService.js';

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://127.0.0.1:${PORT}/api`;
const JWT_SECRET = process.env.JWT_SECRET || 'creativegini_jwt_secret_2026_production_key_secure';

// Helper to generate mock PDF Data URL
const createSamplePdfDataUrl = (text = 'CreativeGini Sample PDF Dossier') => {
  const fakePdfContent = `%PDF-1.4\n%Mock PDF\n${text}\n%%EOF`;
  const base64 = Buffer.from(fakePdfContent, 'utf-8').toString('base64');
  return `data:application/pdf;base64,${base64}`;
};

// HTTP Request Helper
const req = async (endpoint, options = {}, token = null) => {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  const res = await fetch(url, { ...options, headers });
  let data = null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch (e) {
      data = null;
    }
  } else {
    data = await res.text();
  }
  return { status: res.status, headers: res.headers, data, ok: res.ok };
};

// Test Runner Helpers
let passed = 0;
let failed = 0;
const asyncTest = async (name, fn) => {
  try {
    await fn();
    console.log(`  [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${name}: ${err.message}`);
    failed++;
  }
};

/**
 * In-Memory Mock MinIO Storage Driver
 * Simulates MinIO S3 API without external network dependency.
 */
class MockMinioDriver {
  constructor() {
    this.storage = new Map();
  }

  async bucketExists(bucket) {
    return true;
  }

  async makeBucket(bucket, region) {
    return true;
  }

  async putObject(bucket, objectKey, buffer, size, metaData = {}) {
    this.storage.set(`${bucket}:${objectKey}`, {
      buffer: Buffer.from(buffer),
      size: buffer.length,
      metaData,
      lastModified: new Date(),
    });
    return { etag: 'mock-etag-12345' };
  }

  async statObject(bucket, objectKey) {
    const item = this.storage.get(`${bucket}:${objectKey}`);
    if (!item) {
      const err = new Error('Object not found in mock storage');
      err.code = 'NotFound';
      throw err;
    }
    return {
      size: item.size,
      metaData: item.metaData,
      lastModified: item.lastModified,
    };
  }

  async getObject(bucket, objectKey) {
    const item = this.storage.get(`${bucket}:${objectKey}`);
    if (!item) {
      const err = new Error('Object not found in mock storage');
      err.code = 'NotFound';
      throw err;
    }
    const stream = new Readable();
    stream.push(item.buffer);
    stream.push(null);
    return stream;
  }

  async getPartialObject(bucket, objectKey, offset, length) {
    const item = this.storage.get(`${bucket}:${objectKey}`);
    if (!item) {
      const err = new Error('Object not found in mock storage');
      err.code = 'NotFound';
      throw err;
    }
    const chunk = item.buffer.subarray(offset, offset + length);
    const stream = new Readable();
    stream.push(chunk);
    stream.push(null);
    return stream;
  }

  async removeObject(bucket, objectKey) {
    this.storage.delete(`${bucket}:${objectKey}`);
    return true;
  }

  has(bucket, objectKey) {
    return this.storage.has(`${bucket}:${objectKey}`);
  }

  clear() {
    this.storage.clear();
  }
}

async function runTestSuite() {
  console.log('========================================================================');
  console.log('       MINIO OBJECT STORAGE ARCHITECTURE & LIFECYCLE TEST SUITE        ');
  console.log('========================================================================\n');

  // Install Mock Storage Driver for the test process
  const mockDriver = new MockMinioDriver();
  storageService.setStorageDriver(mockDriver);

  // --- SECTION 1: STORAGE SERVICE UNIT TESTS ---
  console.log('--- TEST GROUP 1: MinIO Storage Service Core Utilities ---');

  await asyncTest('parseDataUrl correctly extracts buffer, size, and MIME type', async () => {
    const dataUrl = createSamplePdfDataUrl('Hello MinIO');
    const parsed = storageService.parseDataUrl(dataUrl);
    assert(Buffer.isBuffer(parsed.buffer), 'Expected a Buffer');
    assert.strictEqual(parsed.mimeType, 'application/pdf');
    assert(parsed.size > 0, 'Buffer size > 0');
  });

  await asyncTest('parseDataUrl throws clear error on invalid Data URL', async () => {
    assert.throws(() => {
      storageService.parseDataUrl('http://example.com/not-a-data-url');
    }, /Invalid Data URL format/);
  });

  await asyncTest('generateObjectKey creates safe, collision-resistant path with prefix', async () => {
    const key = storageService.generateObjectKey({
      prefix: 'leads/company-123',
      originalName: 'Acme ../Pitch Deck #1.pdf',
    });
    assert(key.startsWith('leads/company-123/'), 'Key starts with prefix');
    assert(key.endsWith('.pdf'), 'Key preserves file extension');
    assert(!key.includes('..'), 'Directory traversal characters stripped');
    assert(!key.includes('#'), 'Special characters sanitized');
  });

  await asyncTest('isMinioObjectKey distinguishes object keys from Data URLs and HTTP URLs', async () => {
    assert.strictEqual(storageService.isMinioObjectKey('leads/123/456-test.pdf'), true);
    assert.strictEqual(storageService.isMinioObjectKey('submissions/sub-1/uuid-doc.pdf'), true);
    assert.strictEqual(storageService.isMinioObjectKey('data:application/pdf;base64,AAAA'), false);
    assert.strictEqual(storageService.isMinioObjectKey('https://s3.amazonaws.com/test.pdf'), false);
    assert.strictEqual(storageService.isMinioObjectKey('/uploads/deliverable.pdf'), false);
  });

  await asyncTest('uploadFile stores buffer in mock MinIO and returns object metadata', async () => {
    const dataUrl = createSamplePdfDataUrl('Test MinIO Object Upload');
    const uploadRes = await storageService.uploadFile({
      dataUrl,
      originalName: 'test-upload.pdf',
      prefix: 'unit-tests',
    });
    assert(uploadRes.objectKey.startsWith('unit-tests/'), 'Object key has prefix');
    assert.strictEqual(uploadRes.mimeType, 'application/pdf');
    assert(uploadRes.size > 0, 'Size > 0');
    assert(mockDriver.has(uploadRes.bucket, uploadRes.objectKey), 'Object stored in MinIO driver');
  });

  await asyncTest('objectExists and getFileStream return stored object contents', async () => {
    const dataUrl = createSamplePdfDataUrl('Readable Stream Content');
    const uploadRes = await storageService.uploadFile({
      dataUrl,
      originalName: 'readable.pdf',
      prefix: 'unit-tests',
    });

    const exists = await storageService.objectExists(uploadRes.objectKey);
    assert.strictEqual(exists, true, 'Object exists');

    const stream = await storageService.getFileStream(uploadRes.objectKey);
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const content = Buffer.concat(chunks).toString('utf-8');
    assert(content.includes('Readable Stream Content'), 'Stream content matches uploaded payload');
  });

  await asyncTest('deleteFile removes object from storage', async () => {
    const dataUrl = createSamplePdfDataUrl('To be deleted');
    const uploadRes = await storageService.uploadFile({
      dataUrl,
      originalName: 'delete-me.pdf',
      prefix: 'unit-tests',
    });
    assert.strictEqual(await storageService.objectExists(uploadRes.objectKey), true);

    await storageService.deleteFile(uploadRes.objectKey);
    assert.strictEqual(await storageService.objectExists(uploadRes.objectKey), false);
  });

  // --- SECTION 2: END-TO-END UPLOAD & POSTGRESQL PERSISTENCE ---
  console.log('\n--- TEST GROUP 2: Onboarding Dossier Upload & Database Key Storage ---');

  // Setup test users & companies
  const ts = Date.now();
  const compRes = await query(`
    INSERT INTO companies (name, email, website, industry)
    VALUES ($1, $2, $3, $4) RETURNING *
  `, [`MinIO Corp ${ts}`, `minio-${ts}@test.com`, 'https://miniocorp.example.com', 'Cloud Infrastructure']);
  const testCompany = compRes.rows[0];

  const userRes = await query(`
    INSERT INTO users (name, email, password, role, company_id)
    VALUES ($1, $2, 'TestPass@123', 'USER', $3) RETURNING *
  `, [`Client User ${ts}`, `client-${ts}@test.com`, testCompany.id]);
  const clientUser = userRes.rows[0];

  const leadUserRes = await query(`
    INSERT INTO users (name, email, password, role)
    VALUES ($1, $2, 'LeadPass@123', 'COMPANY_LEAD') RETURNING *
  `, [`Lead Spec ${ts}`, `lead-${ts}@creativegini.test`]);
  const leadSpecialist = leadUserRes.rows[0];

  const tokenClient = jwt.sign({ id: clientUser.id, role: clientUser.role, companyId: testCompany.id }, JWT_SECRET, { expiresIn: '1h' });
  const tokenLead = jwt.sign({ id: leadSpecialist.id, role: leadSpecialist.role }, JWT_SECRET, { expiresIn: '1h' });

  const leadStudyDataUrl = createSamplePdfDataUrl('MinIO Lead Study Dossier');
  const pitchDeckDataUrl = createSamplePdfDataUrl('MinIO Pitch Deck Presentation');
  const keyPeopleDataUrl = createSamplePdfDataUrl('MinIO Key People Executive Directory');

  let uploadedFileRecords = [];

  await asyncTest('Lead Specialist uploads lead dossier with 3 PDFs via existing Data URL API', async () => {
    const res = await req(`/company/${testCompany.id}/lead-onboarding-assets`, {
      method: 'POST',
      body: JSON.stringify({
        leadIndex: 1,
        companyName: 'CloudScale AI',
        website: 'https://cloudscale.ai',
        leadStudy: { name: 'CloudScale - Lead Study.pdf', size: 10240, type: 'application/pdf', dataUrl: leadStudyDataUrl },
        pitchDeck: { name: 'CloudScale - Pitch Deck.pdf', size: 11000, type: 'application/pdf', dataUrl: pitchDeckDataUrl },
        keyPeople: { name: 'CloudScale - Key People.pdf', size: 9000, type: 'application/pdf', dataUrl: keyPeopleDataUrl },
      })
    }, tokenLead);

    assert.strictEqual(res.status, 200, `Expected 200 OK, got ${res.status}`);
    assert(res.data?.success, 'Upload successful');
  });

  await asyncTest('CRITICAL REQUIREMENT: PostgreSQL stores ONLY MinIO object keys (NOT base64 data)', async () => {
    const dbFiles = await query(`
      SELECT sf.id, sf.name, sf.url, sf.size, sf.type
      FROM submission_files sf
      JOIN submissions s ON sf.submission_id = s.id
      JOIN requests r ON s.request_id = r.id
      WHERE r.company_id = $1
    `, [testCompany.id]);

    assert(dbFiles.rows.length >= 3, `Expected at least 3 submission_files, found ${dbFiles.rows.length}`);
    uploadedFileRecords = dbFiles.rows;

    for (const file of dbFiles.rows) {
      assert(file.url, 'File url column must not be empty');
      assert(!file.url.startsWith('data:'), `CRITICAL: Column contains base64 Data URL instead of MinIO key! url: ${file.url.slice(0, 30)}...`);
      assert(storageService.isMinioObjectKey(file.url), `Expected valid MinIO object key, got: ${file.url}`);
      assert(file.url.startsWith('leads/'), `Expected object key to start with "leads/", got: ${file.url}`);
      // Verify object actually exists in object storage
      assert(mockDriver.has(storageService.getBucketName(), file.url), `Object key ${file.url} must exist in MinIO storage`);
    }
  });

  // --- SECTION 3: AUTHENTICATED STREAMING & DOWNLOADING ---
  console.log('\n--- TEST GROUP 3: Authenticated Streaming & Downloading from MinIO ---');

  const studyFile = uploadedFileRecords.find(f => f.name.includes('Lead Study'));
  const pitchFile = uploadedFileRecords.find(f => f.name.includes('Pitch Deck'));
  const kpFile = uploadedFileRecords.find(f => f.name.includes('Key People'));

  await asyncTest('Client can stream own Lead Study from MinIO (200 OK)', async () => {
    const res = await req(`/assets/${studyFile.id}/stream`, {}, tokenClient);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers.get('content-type'), 'application/pdf');
    assert.strictEqual(res.headers.get('accept-ranges'), 'bytes');
    assert(res.data.includes('MinIO Lead Study Dossier'), 'Piped content matches stored object');
  });

  await asyncTest('HTTP 206 Partial Content range request seeking supported on MinIO stream', async () => {
    const res = await req(`/assets/${studyFile.id}/stream`, {
      headers: { Range: 'bytes=0-15' }
    }, tokenClient);
    assert.strictEqual(res.status, 206, `Expected 206 Partial Content, got ${res.status}`);
    assert(res.headers.get('content-range')?.startsWith('bytes 0-15/'), 'Content-Range header returned');
  });

  await asyncTest('Client can download Pitch Deck with original filename in Content-Disposition', async () => {
    const res = await req(`/assets/${pitchFile.id}/download`, {}, tokenClient);
    assert.strictEqual(res.status, 200);
    const disposition = res.headers.get('content-disposition') || '';
    assert(disposition.includes('attachment; filename='), `Expected Content-Disposition attachment, got: ${disposition}`);
    assert(res.data.includes('MinIO Pitch Deck Presentation'), 'Downloaded content matches stored object');
  });

  // --- SECTION 4: KEY PEOPLE PAYMENT ENTITLEMENT ---
  console.log('\n--- TEST GROUP 4: Key People Entitlement via MinIO ---');

  await asyncTest('Direct streaming of locked sample Key People document returns 403 Forbidden', async () => {
    const res = await req(`/assets/${kpFile.id}/stream`, {}, tokenClient);
    assert.strictEqual(res.status, 403, `Expected 403 Forbidden for locked Key People, got ${res.status}`);
  });

  await asyncTest('Direct download of locked sample Key People document returns 403 Forbidden', async () => {
    const res = await req(`/assets/${kpFile.id}/download`, {}, tokenClient);
    assert.strictEqual(res.status, 403, `Expected 403 Forbidden for locked Key People, got ${res.status}`);
  });

  await asyncTest('After Key People $199 unlock payment, document streams successfully from MinIO', async () => {
    // Initiate unlock ticket
    const unlockRes = await req('/company/my-company/unlock-key-people', { method: 'POST' }, tokenClient);
    assert.strictEqual(unlockRes.status, 200);
    const ticketId = unlockRes.data?.request?.id;

    // Simulate payment
    const payRes = await req(`/requests/${ticketId}/pay`, {
      method: 'POST',
      body: JSON.stringify({ paymentMethod: 'SIMULATED_CARD' })
    }, tokenClient);
    assert.strictEqual(payRes.status, 200);

    // Stream unlocked Key People
    const streamRes = await req(`/assets/${kpFile.id}/stream`, {}, tokenClient);
    assert.strictEqual(streamRes.status, 200, `Expected 200 OK after payment, got ${streamRes.status}`);
    assert(streamRes.data.includes('MinIO Key People Executive Directory'), 'Unlocked Key People dossier streams correctly');
  });

  // --- SECTION 5: SAFE DOCUMENT REPLACEMENT ---
  console.log('\n--- TEST GROUP 5: Safe Document Replacement in MinIO ---');

  await asyncTest('Replacing Pitch Deck uploads new MinIO object and deletes old object safely', async () => {
    const oldPitchKey = pitchFile.url;
    assert(mockDriver.has(storageService.getBucketName(), oldPitchKey), 'Old pitch deck exists in storage');

    const newPitchDataUrl = createSamplePdfDataUrl('REPLACED New Pitch Deck Version 2');
    const replaceRes = await req(`/company/${testCompany.id}/lead-onboarding-assets`, {
      method: 'POST',
      body: JSON.stringify({
        leadIndex: 1,
        companyName: 'CloudScale AI',
        website: 'https://cloudscale.ai',
        pitchDeck: { name: 'CloudScale - Pitch Deck V2.pdf', size: 12000, type: 'application/pdf', dataUrl: newPitchDataUrl }
      })
    }, tokenLead);
    assert.strictEqual(replaceRes.status, 200);

    // Query new file record from database
    const newDbRes = await query(`
      SELECT sf.id, sf.name, sf.url
      FROM submission_files sf
      JOIN submissions s ON sf.submission_id = s.id
      JOIN requests r ON s.request_id = r.id
      WHERE r.company_id = $1 AND sf.name ILIKE '%Pitch Deck%'
    `, [testCompany.id]);

    const newPitchFile = newDbRes.rows[0];
    assert(newPitchFile, 'New pitch deck record exists');
    assert.notStrictEqual(newPitchFile.url, oldPitchKey, 'Object key must be updated to new UUID path');
    assert(mockDriver.has(storageService.getBucketName(), newPitchFile.url), 'New pitch deck exists in MinIO storage');
    assert(!mockDriver.has(storageService.getBucketName(), oldPitchKey), 'Old pitch deck object safely deleted from MinIO storage');

    // Verify client streams the new content
    const streamRes = await req(`/assets/${newPitchFile.id}/stream`, {}, tokenClient);
    assert.strictEqual(streamRes.status, 200);
    assert(streamRes.data.includes('REPLACED New Pitch Deck Version 2'), 'Stream returns the replaced content');
  });

  // --- SECTION 6: BACKWARD COMPATIBILITY WITH BASE64 DATA URLS ---
  console.log('\n--- TEST GROUP 6: Backward Compatibility with Legacy Base64 Records ---');

  let legacyAssetId = null;
  await asyncTest('Legacy database record storing raw base64 Data URL continues to stream and download', async () => {
    // Insert an old legacy record with inline base64 URL directly into submission_files
    const legacyDataUrl = createSamplePdfDataUrl('LEGACY Base64 Content 2025');
    const subRes = await query(`
      SELECT s.id FROM submissions s
      JOIN requests r ON s.request_id = r.id
      WHERE r.company_id = $1 LIMIT 1
    `, [testCompany.id]);
    const subId = subRes.rows[0].id;

    const insRes = await query(`
      INSERT INTO submission_files (submission_id, name, url, size, type, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING id
    `, [subId, 'Legacy Report.pdf', legacyDataUrl, '15.2 KB', 'application/pdf']);
    legacyAssetId = insRes.rows[0].id;

    // Stream legacy record
    const streamRes = await req(`/assets/${legacyAssetId}/stream`, {}, tokenClient);
    assert.strictEqual(streamRes.status, 200, `Expected 200 OK for legacy base64 stream, got ${streamRes.status}`);
    assert(streamRes.data.includes('LEGACY Base64 Content 2025'), 'Legacy content streamed correctly');

    // Download legacy record
    const dlRes = await req(`/assets/${legacyAssetId}/download`, {}, tokenClient);
    assert.strictEqual(dlRes.status, 200, `Expected 200 OK for legacy base64 download, got ${dlRes.status}`);
    assert(dlRes.data.includes('LEGACY Base64 Content 2025'), 'Legacy content downloaded correctly');
  });

  // --- SECTION 7: CROSS-TENANT ISOLATION & SECURITY ---
  console.log('\n--- TEST GROUP 7: Cross-Tenant Protection & Security ---');

  // Create Tenant B
  const compBRes = await query(`
    INSERT INTO companies (name, email, website, industry)
    VALUES ($1, $2, $3, $4) RETURNING *
  `, [`Tenant B Corp ${ts}`, `tenantb-${ts}@test.com`, 'https://tenantb.com', 'Finance']);
  const companyB = compBRes.rows[0];

  const userBRes = await query(`
    INSERT INTO users (name, email, password, role, company_id)
    VALUES ($1, $2, 'Pass@123', 'USER', $3) RETURNING *
  `, [`User B ${ts}`, `userb-${ts}@test.com`, companyB.id]);
  const userB = userBRes.rows[0];
  const tokenB = jwt.sign({ id: userB.id, role: userB.role, companyId: companyB.id }, JWT_SECRET, { expiresIn: '1h' });

  await asyncTest('Tenant B cannot stream Tenant A MinIO asset (403 Forbidden)', async () => {
    const res = await req(`/assets/${studyFile.id}/stream`, {}, tokenB);
    assert.strictEqual(res.status, 403, `Expected 403 Forbidden for cross-tenant access, got ${res.status}`);
  });

  await asyncTest('Tenant B cannot download Tenant A MinIO asset (403 Forbidden)', async () => {
    const res = await req(`/assets/${studyFile.id}/download`, {}, tokenB);
    assert.strictEqual(res.status, 403, `Expected 403 Forbidden for cross-tenant download, got ${res.status}`);
  });

  await asyncTest('Unauthenticated user cannot stream or download MinIO asset (401 Unauthorized)', async () => {
    const streamRes = await req(`/assets/${studyFile.id}/stream`);
    assert.strictEqual(streamRes.status, 401);
    const dlRes = await req(`/assets/${studyFile.id}/download`);
    assert.strictEqual(dlRes.status, 401);
  });

  // --- CLEANUP ---
  console.log('\n--- CLEANUP: Removing Test Entities ---');
  await query('DELETE FROM submission_files WHERE name ILIKE $1 OR name ILIKE $2', [`%CloudScale%`, `%Legacy Report%`]);
  await query('DELETE FROM payments WHERE company_id IN ($1, $2)', [testCompany.id, companyB.id]);
  await query('DELETE FROM requests WHERE company_id IN ($1, $2)', [testCompany.id, companyB.id]);
  await query('DELETE FROM company_leads WHERE company_id IN ($1, $2)', [testCompany.id, companyB.id]);
  await query('DELETE FROM users WHERE company_id IN ($1, $2) OR id = $3', [testCompany.id, companyB.id, leadSpecialist.id]);
  await query('DELETE FROM companies WHERE id IN ($1, $2)', [testCompany.id, companyB.id]);
  mockDriver.clear();
  console.log('Cleanup finished.\n');

  console.log('========================================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
  console.log('========================================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestSuite().catch(err => {
  console.error('[TEST SUITE CRASHED]:', err);
  process.exit(1);
});
