process.env.NODE_ENV = 'test';

import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import jwt from 'jsonwebtoken';
import { query, connectPostgres, getPool } from '../../src/config/postgres.js';
import { findSampleBySlug, ensureSampleTable } from '../../src/repositories/sampleRepository.js';
import { getPrimaryJwtSecret } from '../../src/middleware/auth.js';
import sampleRoutes from '../../src/routes/sampleRoutes.js';

// Load real server.js dynamically after NODE_ENV=test is set
const { app: realServerApp } = await import('../../src/server.js');

const restoreEnv = (key, val) => {
  if (val === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = val;
  }
};

test('Phase 0 Security & Status Validation Suite', async (t) => {
  await connectPostgres();
  await ensureSampleTable();

  const testDraftSlug = `test-draft-${Date.now()}`;
  const testPublishedSlug = `test-published-${Date.now()}`;
  const testLeadId = `lead-${Date.now()}`;

  // 1. Seed test DRAFT showcase with lead
  const draftRes = await query(
    `INSERT INTO public_sample_showcases (
       slug, title, company_name, status, description, leads, pitch_deck, company_study, is_demo
     ) VALUES ($1, $2, $3, 'DRAFT', 'Draft description', $4, $5, $6, false)
     RETURNING id`,
    [
      testDraftSlug,
      'Test Draft Showcase',
      'Draft Corp',
      JSON.stringify([{ id: testLeadId, name: 'Draft Lead', role: 'CTO' }]),
      JSON.stringify({ assetKey: 'test-pitch-key' }),
      JSON.stringify({ pdfAssetKey: 'test-study-key' }),
    ]
  );
  const draftId = draftRes.rows[0].id;

  // 2. Seed test PUBLISHED showcase (non-demo)
  const pubRes = await query(
    `INSERT INTO public_sample_showcases (
       slug, title, company_name, status, description, is_demo
     ) VALUES ($1, $2, $3, 'PUBLISHED', 'Published description', false)
     RETURNING id`,
    [testPublishedSlug, 'Test Published Showcase', 'Published Corp']
  );
  const pubId = pubRes.rows[0].id;

  // 3. Seed a temporary test user with role 'USER'
  const testUserEmail = `test.user.${Date.now()}@securitytest.com`;
  const userRes = await query(
    `INSERT INTO users (name, email, password, role)
     VALUES ('Test Normal User', $1, 'placeholder_hash', 'USER')
     RETURNING id`,
    [testUserEmail]
  );
  const testUserId = userRes.rows[0].id;

  // 4. Seed a temporary test user with role 'ADMIN'
  const testAdminEmail = `test.admin.${Date.now()}@securitytest.com`;
  const adminRes = await query(
    `INSERT INTO users (name, email, password, role)
     VALUES ('Test Admin User', $1, 'placeholder_hash', 'ADMIN')
     RETURNING id`,
    [testAdminEmail]
  );
  const testAdminId = adminRes.rows[0].id;

  const jwtSecret = getPrimaryJwtSecret();
  const userToken = jwt.sign({ id: testUserId, email: testUserEmail, role: 'USER' }, jwtSecret, { expiresIn: '1h' });
  const adminToken = jwt.sign({ id: testAdminId, email: testAdminEmail, role: 'ADMIN' }, jwtSecret, { expiresIn: '1h' });

  // 5. Spin up lightweight in-process Express HTTP server for HTTP-level route testing
  const app = express();
  app.use(express.json());
  app.use('/api/samples', sampleRoutes);
  // 404 handler matching server.js (verifies unmounted /storage returns 404)
  app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
  });

  let server;
  let baseUrl;

  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });

  t.after(async () => {
    try {
      if (server) {
        if (typeof server.closeAllConnections === 'function') server.closeAllConnections();
        await new Promise((res) => server.close(res));
      }
      await query(`DELETE FROM public_sample_showcases WHERE id IN ($1, $2)`, [draftId, pubId]);
      await query(`DELETE FROM users WHERE id IN ($1, $2)`, [testUserId, testAdminId]);
      await getPool().end();
    } catch (_) {}
    setTimeout(() => process.exit(0), 50);
  });

  // --- REPOSITORY TESTS ---
  await t.test('Repository: findSampleBySlug with onlyPublished=true returns null for DRAFT showcases', async () => {
    const result = await findSampleBySlug(testDraftSlug, true);
    assert.equal(result, null, 'Draft showcase must NOT be returned when onlyPublished=true');
  });

  await t.test('Repository: findSampleBySlug with onlyPublished=false returns DRAFT showcase', async () => {
    const result = await findSampleBySlug(testDraftSlug, false);
    assert.ok(result, 'Draft showcase should be returned when onlyPublished=false');
    assert.equal(result.slug, testDraftSlug);
    assert.equal(result.status, 'DRAFT');
  });

  await t.test('Repository: findSampleBySlug with onlyPublished=true returns PUBLISHED showcase', async () => {
    const result = await findSampleBySlug(testPublishedSlug, true);
    assert.ok(result, 'Published showcase must be returned when onlyPublished=true');
    assert.equal(result.slug, testPublishedSlug);
    assert.equal(result.status, 'PUBLISHED');
  });

  // --- AUTH MIDDLEWARE TESTS (Mandatory Attack & Token Security Tests) ---
  await t.test('Auth: Unauthenticated request to sample management endpoint receives 401', async () => {
    const res = await fetch(`${baseUrl}/api/samples/manage`);
    assert.equal(res.status, 401, 'Unauthenticated request must receive 401');
    const json = await res.json();
    assert.equal(json.success, false);
    assert.equal(json.message, 'Access denied. No authentication token provided.');
  });

  await t.test('Auth: Forged token (wrong signature with admin payload) receives 401', async () => {
    const forgedToken = jwt.sign(
      { id: testAdminId, email: testAdminEmail, role: 'ADMIN' },
      'attacker_invalid_secret_key_999',
      { expiresIn: '1h' }
    );
    const res = await fetch(`${baseUrl}/api/samples/manage`, {
      headers: { Authorization: `Bearer ${forgedToken}` },
    });
    assert.equal(res.status, 401, 'Forged token must receive 401');
    const json = await res.json();
    assert.equal(json.success, false);
    assert.match(json.message, /invalid|expired|token/i);
  });

  await t.test('Auth: alg:none token (unsigned with admin payload) receives 401', async () => {
    const headerNone = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
    const payloadNone = Buffer.from(
      JSON.stringify({ id: testAdminId, email: testAdminEmail, role: 'ADMIN' })
    ).toString('base64url');
    const algNoneToken = `${headerNone}.${payloadNone}.`;

    const res = await fetch(`${baseUrl}/api/samples/manage`, {
      headers: { Authorization: `Bearer ${algNoneToken}` },
    });
    assert.equal(res.status, 401, 'alg:none token must receive 401');
    const json = await res.json();
    assert.equal(json.success, false);
  });

  await t.test('Auth: Expired token receives 401', async () => {
    const expiredToken = jwt.sign(
      { id: testAdminId, email: testAdminEmail, role: 'ADMIN' },
      jwtSecret,
      { expiresIn: -3600 }
    );
    const res = await fetch(`${baseUrl}/api/samples/manage`, {
      headers: { Authorization: `Bearer ${expiredToken}` },
    });
    assert.equal(res.status, 401, 'Expired token must receive 401');
    const json = await res.json();
    assert.equal(json.success, false);
  });

  await t.test('Auth: Authenticated user with role USER receives 403 Forbidden on management endpoint', async () => {
    const res = await fetch(`${baseUrl}/api/samples/manage`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.equal(res.status, 403, 'User role token must receive 403 Forbidden');
    const json = await res.json();
    assert.equal(json.success, false);
    assert.match(json.message, /Forbidden.*Role 'USER'/i);
  });

  await t.test('Auth: Authenticated user with role ADMIN is authorized (200 OK)', async () => {
    const res = await fetch(`${baseUrl}/api/samples/manage`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(res.status, 200, 'Admin token must receive 200 OK');
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(Array.isArray(json.samples));
  });

  await t.test('Auth: Dev-secret signed token returns 401 when NODE_ENV is set outside dev/test', async () => {
    const savedNodeEnv = process.env.NODE_ENV;
    const savedSecret = process.env.JWT_SECRET;
    try {
      // Simulate production environment in a cross-platform (Windows-safe) manner
      process.env.NODE_ENV = 'production';
      process.env.JWT_SECRET = 'strict_prod_jwt_secret_999988887777';

      const devSecretToken = jwt.sign(
        { id: testAdminId, email: testAdminEmail, role: 'ADMIN' },
        'dizigini_dev_jwt_secret_key_only',
        { expiresIn: '1h' }
      );

      const res = await fetch(`${baseUrl}/api/samples/manage`, {
        headers: { Authorization: `Bearer ${devSecretToken}` },
      });
      assert.equal(res.status, 401, 'Dev secret token must be rejected outside dev/test');
      const json = await res.json();
      assert.equal(json.success, false);
      assert.match(json.message, /invalid or expired/i);
    } finally {
      restoreEnv('NODE_ENV', savedNodeEnv);
      restoreEnv('JWT_SECRET', savedSecret);
    }
  });

  await t.test('Auth: Startup guard / getPrimaryJwtSecret throws outside dev/test when JWT_SECRET is unset', () => {
    const savedNodeEnv = process.env.NODE_ENV;
    const savedSecret = process.env.JWT_SECRET;
    try {
      process.env.NODE_ENV = 'production';
      delete process.env.JWT_SECRET;
      assert.throws(
        () => getPrimaryJwtSecret(),
        /FATAL: JWT_SECRET environment variable is missing and NODE_ENV is not explicitly "development" or "test"/
      );

      delete process.env.NODE_ENV; // unset NODE_ENV
      assert.throws(
        () => getPrimaryJwtSecret(),
        /FATAL: JWT_SECRET environment variable is missing and NODE_ENV is not explicitly "development" or "test"/
      );
    } finally {
      restoreEnv('NODE_ENV', savedNodeEnv);
      restoreEnv('JWT_SECRET', savedSecret);
    }
  });

  await t.test('Auth: JWT_SECRET length < 32 throws outside dev/test', () => {
    const savedNodeEnv = process.env.NODE_ENV;
    const savedSecret = process.env.JWT_SECRET;
    try {
      process.env.NODE_ENV = 'production';
      process.env.JWT_SECRET = 'short_secret_only_20_chars';
      assert.throws(
        () => getPrimaryJwtSecret(),
        /FATAL: JWT_SECRET must be at least 32 characters long in production/
      );
    } finally {
      restoreEnv('NODE_ENV', savedNodeEnv);
      restoreEnv('JWT_SECRET', savedSecret);
    }
  });

  await t.test('Storage: Real server.js mounts NO static handler on /storage and returns 404', async () => {
    // 1. Structural Layer Assertion on real server app
    const hasStorageStaticLayer = realServerApp._router.stack.some(
      (layer) => layer.regexp && layer.regexp.toString().includes('storage')
    );
    assert.equal(
      hasStorageStaticLayer,
      false,
      'server.js must NOT mount any static middleware on /storage (fails against previous server.js which mounted express.static on /storage)'
    );

    // 2. Real App HTTP Execution: Start ephemeral listener with real server.js app
    const realHttpServer = realServerApp.listen(0);
    const realPort = realHttpServer.address().port;
    try {
      const res = await fetch(`http://127.0.0.1:${realPort}/storage/buckets/dizigini-assets/public-samples/${testDraftSlug}/company-study/test.pdf`);
      assert.equal(res.status, 404, 'Real server app must return 404 for /storage requests');
      const json = await res.json();
      assert.equal(json.success, false);
      assert.match(json.message, /Route \/storage\/.* not found/i);
    } finally {
      if (typeof realHttpServer.closeAllConnections === 'function') {
        realHttpServer.closeAllConnections();
      }
      await new Promise((resolve) => realHttpServer.close(resolve));
    }
  });

  // --- HTTP-LEVEL PUBLIC ROUTE STATUS GUARDS (ALL 7 ROUTES) ---
  await t.test('Route 1: GET /api/samples/:slug returns 404 for DRAFT and excludes drafts & non-demo from fallback', async () => {
    const res = await fetch(`${baseUrl}/api/samples/${testDraftSlug}`);
    assert.equal(res.status, 404, 'Must return 404 for draft showcase');
    const json = await res.json();
    assert.equal(json.success, false);
    assert.equal(json.requestedSlug, testDraftSlug);

    // Verify 404 body availableShowcases does NOT contain draft or non-demo published showcase
    if (Array.isArray(json.availableShowcases)) {
      const foundDraft = json.availableShowcases.find((s) => s.slug === testDraftSlug);
      assert.equal(foundDraft, undefined, 'Draft slug must NEVER appear in availableShowcases fallback listing');
      const foundNonDemo = json.availableShowcases.find((s) => s.slug === testPublishedSlug);
      assert.equal(foundNonDemo, undefined, 'Non-demo published slug must NEVER appear in availableShowcases fallback listing');
    }
  });

  await t.test('Route 2: GET /api/samples/:slug/company-study-pdf returns 404 for DRAFT', async () => {
    const res = await fetch(`${baseUrl}/api/samples/${testDraftSlug}/company-study-pdf`);
    assert.equal(res.status, 404, 'Draft company study PDF must return 404');
  });

  await t.test('Route 3: GET /api/samples/:slug/pitch-deck returns 404 for DRAFT', async () => {
    const res = await fetch(`${baseUrl}/api/samples/${testDraftSlug}/pitch-deck`);
    assert.equal(res.status, 404, 'Draft pitch deck must return 404');
  });

  await t.test('Route 4: GET /api/samples/:slug/leads/:leadId/pitch-deck returns 404 for DRAFT', async () => {
    const res = await fetch(`${baseUrl}/api/samples/${testDraftSlug}/leads/${testLeadId}/pitch-deck`);
    assert.equal(res.status, 404, 'Draft lead pitch deck must return 404');
  });

  await t.test('Route 5: GET /api/samples/:slug/leads/:leadId/lead-study-pdf returns 404 for DRAFT', async () => {
    const res = await fetch(`${baseUrl}/api/samples/${testDraftSlug}/leads/${testLeadId}/lead-study-pdf`);
    assert.equal(res.status, 404, 'Draft lead study PDF must return 404');
  });

  await t.test('Route 6: GET /api/samples/:slug/logo returns 404 for DRAFT', async () => {
    const res = await fetch(`${baseUrl}/api/samples/${testDraftSlug}/logo`);
    assert.equal(res.status, 404, 'Draft company logo must return 404');
  });

  await t.test('Route 7: GET /api/samples/:slug/leads/:leadId/logo returns 404 for DRAFT', async () => {
    const res = await fetch(`${baseUrl}/api/samples/${testDraftSlug}/leads/${testLeadId}/logo`);
    assert.equal(res.status, 404, 'Draft lead logo must return 404');
  });
});
