/**
 * MinIO Storage Service Unit & Mock Suite
 * Tests client initialization, data URL parsing, key generation, and mock S3 operations.
 */

import assert from 'assert';
import { Readable } from 'stream';
import * as storageService from '../../src/services/storageService.js';

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

const createMockPdfDataUrl = (content = 'Unit Test PDF') => {
  const base64 = Buffer.from(content).toString('base64');
  return `data:application/pdf;base64,${base64}`;
};

class MockDriver {
  constructor() {
    this.map = new Map();
  }
  async bucketExists() { return true; }
  async makeBucket() { return true; }
  async putObject(bucket, key, buf, size, meta) {
    this.map.set(key, { buf: Buffer.from(buf), size, meta });
  }
  async statObject(bucket, key) {
    const item = this.map.get(key);
    if (!item) {
      const err = new Error('NotFound');
      err.code = 'NotFound';
      throw err;
    }
    return { size: item.size, metaData: item.meta };
  }
  async getObject(bucket, key) {
    const item = this.map.get(key);
    if (!item) {
      const err = new Error('NotFound');
      err.code = 'NotFound';
      throw err;
    }
    const s = new Readable();
    s.push(item.buf);
    s.push(null);
    return s;
  }
  async getPartialObject(bucket, key, offset, length) {
    const item = this.map.get(key);
    if (!item) {
      const err = new Error('NotFound');
      err.code = 'NotFound';
      throw err;
    }
    const s = new Readable();
    s.push(item.buf.subarray(offset, offset + length));
    s.push(null);
    return s;
  }
  async removeObject(bucket, key) {
    this.map.delete(key);
  }
}

async function run() {
  console.log('========================================================================');
  console.log('            MINIO STORAGE SERVICE UNIT & MOCK TEST SUITE               ');
  console.log('========================================================================\n');

  console.log('--- 1. Client Initialization & Env Guards ---');
  await test('getMinioClient returns null when environment variables are missing', async () => {
    storageService.resetStorageDriver();
    const oldEndpoint = process.env.MINIO_ENDPOINT;
    delete process.env.MINIO_ENDPOINT;
    const client = storageService.getMinioClient();
    assert.strictEqual(client, null, 'Client should be null without MINIO_ENDPOINT');
    if (oldEndpoint) process.env.MINIO_ENDPOINT = oldEndpoint;
  });

  await test('getBucketName returns default dev bucket or configured env', async () => {
    const bucket = storageService.getBucketName();
    assert(bucket && typeof bucket === 'string', 'Bucket name returned');
  });

  console.log('\n--- 2. Data URL Parsing & Buffer Conversion ---');
  await test('parseDataUrl correctly decodes base64 PDF into Buffer', async () => {
    const dataUrl = createMockPdfDataUrl('Sample PDF Document');
    const parsed = storageService.parseDataUrl(dataUrl);
    assert(Buffer.isBuffer(parsed.buffer), 'Expected Buffer');
    assert.strictEqual(parsed.mimeType, 'application/pdf');
    assert.strictEqual(parsed.buffer.toString(), 'Sample PDF Document');
  });

  await test('parseDataUrl detects image/png MIME type', async () => {
    const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
    const parsed = storageService.parseDataUrl(dataUrl);
    assert.strictEqual(parsed.mimeType, 'image/png');
    assert(parsed.size > 0);
  });

  await test('parseDataUrl throws on malformed URL', async () => {
    assert.throws(() => storageService.parseDataUrl('invalid-url'), /Invalid Data URL format/);
    assert.throws(() => storageService.parseDataUrl('data:text/plain,no-base64'), /Invalid Data URL format/);
  });

  console.log('\n--- 3. Object Key Generation & Path Normalization ---');
  await test('generateObjectKey creates prefix/uuid-safeName pattern', async () => {
    const key = storageService.generateObjectKey({
      prefix: 'leads/comp_123',
      originalName: 'My Pitch Deck (Final) 2026.pdf'
    });
    assert(key.startsWith('leads/comp_123/'), `Key must start with prefix, got: ${key}`);
    assert(key.endsWith('.pdf'), `Key must end with .pdf, got: ${key}`);
    assert(!key.includes(' '), 'Spaces must be sanitized to underscores');
    assert(!key.includes('(') && !key.includes(')'), 'Parentheses must be sanitized');
  });

  await test('isMinioObjectKey accurately identifies MinIO object keys vs other URLs', async () => {
    assert.strictEqual(storageService.isMinioObjectKey('leads/c1/9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d-file.pdf'), true);
    assert.strictEqual(storageService.isMinioObjectKey('submissions/s1/uuid-deliverable.png'), true);
    assert.strictEqual(storageService.isMinioObjectKey('onboarding/boost/c1/uuid-poster.png'), true);
    assert.strictEqual(storageService.isMinioObjectKey('data:application/pdf;base64,AAAA'), false);
    assert.strictEqual(storageService.isMinioObjectKey('https://cdn.example.com/asset.pdf'), false);
    assert.strictEqual(storageService.isMinioObjectKey('/uploads/test.pdf'), false);
  });

  console.log('\n--- 4. Mock Driver Upload, Retrieval & Range Streaming ---');
  const mock = new MockDriver();
  storageService.setStorageDriver(mock);

  let uploadedKey = null;
  await test('uploadFile writes buffer to object storage and returns metadata', async () => {
    const dataUrl = createMockPdfDataUrl('Binary content for S3 testing');
    const res = await storageService.uploadFile({
      dataUrl,
      originalName: 'test-dossier.pdf',
      prefix: 'leads/acme',
    });
    assert(res.objectKey.startsWith('leads/acme/'));
    assert.strictEqual(res.mimeType, 'application/pdf');
    uploadedKey = res.objectKey;
    assert(mock.map.has(uploadedKey));
  });

  await test('objectExists returns true for uploaded key', async () => {
    const exists = await storageService.objectExists(uploadedKey);
    assert.strictEqual(exists, true);
  });

  await test('getFileStream retrieves full readable stream', async () => {
    const stream = await storageService.getFileStream(uploadedKey);
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    const str = Buffer.concat(chunks).toString();
    assert.strictEqual(str, 'Binary content for S3 testing');
  });

  await test('getFileStream supports partial range streaming', async () => {
    const stream = await storageService.getFileStream(uploadedKey, { offset: 0, length: 6 });
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    const str = Buffer.concat(chunks).toString();
    assert.strictEqual(str, 'Binary');
  });

  await test('deleteFile removes object from storage', async () => {
    await storageService.deleteFile(uploadedKey);
    const exists = await storageService.objectExists(uploadedKey);
    assert.strictEqual(exists, false);
  });

  storageService.resetStorageDriver();

  console.log('\n========================================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
  console.log('========================================================================\n');

  if (failed > 0) process.exit(1);
  else process.exit(0);
}

run().catch(err => {
  console.error('Test crashed:', err);
  process.exit(1);
});
