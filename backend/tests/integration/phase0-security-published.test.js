import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import jwt from 'jsonwebtoken';
import { query, connectPostgres, getPool } from '../../src/config/postgres.js';
import { findSampleBySlug, ensureSampleTable } from '../../src/repositories/sampleRepository.js';
import sampleRoutes from '../../src/routes/sampleRoutes.js';

test('Phase 0 Security & Status Validation Suite', async (t) => {
  await connectPostgres();
  await ensureSampleTable();

  const testDraftSlug = `test-draft-${Date.now()}`;
  const testPublishedSlug = `test-published-${Date.now()}`;
  const testLeadId = `lead-${Date.now()}`;

  // 1. Seed test DRAFT showcase with lead
  const draftRes = await query(
    `INSERT INTO public_sample_showcases (
       slug, title, company_name, status, description, leads, pitch_deck, company_study
     ) VALUES ($1, $2, $3, 'DRAFT', 'Draft description', $4, $5, $6)
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

  // 2. Seed test PUBLISHED showcase
  const pubRes = await query(
    `INSERT INTO public_sample_showcases (
       slug, title, company_name, status, description
     ) VALUES ($1, $2, $3, 'PUBLISHED', 'Published description')
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

  const jwtSecret = process.env.JWT_SECRET || 'dizigini_secure_jwt_secret_key_2026';
  const userToken = jwt.sign({ id: testUserId, email: testUserEmail, role: 'USER' }, jwtSecret, { expiresIn: '1h' });
  const adminToken = jwt.sign({ id: testAdminId, email: testAdminEmail, role: 'ADMIN' }, jwtSecret, { expiresIn: '1h' });

  // 5. Spin up lightweight in-process Express HTTP server for HTTP-level route testing
  const app = express();
  app.use(express.json());
  app.use('/api/samples', sampleRoutes);

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
        await new Promise((res) => server.close(res));
      }
      await query(`DELETE FROM public_sample_showcases WHERE id IN ($1, $2)`, [draftId, pubId]);
      await query(`DELETE FROM users WHERE id IN ($1, $2)`, [testUserId, testAdminId]);
      await getPool().end();
    } catch (_) {}
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

  // --- AUTH MIDDLEWARE TESTS ---
  await t.test('Auth: Unauthenticated request to sample management endpoint receives 401', async () => {
    const res = await fetch(`${baseUrl}/api/samples/manage`);
    assert.equal(res.status, 401, 'Unauthenticated request must receive 401');
    const json = await res.json();
    assert.equal(json.success, false);
    assert.equal(json.message, 'Access denied. No authentication token provided.');
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

  // --- HTTP-LEVEL PUBLIC ROUTE STATUS GUARDS (ALL 7 ROUTES) ---
  await t.test('Route 1: GET /api/samples/:slug returns 404 for DRAFT and excludes drafts from availableShowcases', async () => {
    const res = await fetch(`${baseUrl}/api/samples/${testDraftSlug}`);
    assert.equal(res.status, 404, 'Must return 404 for draft showcase');
    const json = await res.json();
    assert.equal(json.success, false);
    assert.equal(json.requestedSlug, testDraftSlug);

    // Verify 404 body availableShowcases does NOT contain this draft or any non-PUBLISHED showcase
    if (Array.isArray(json.availableShowcases)) {
      const foundDraft = json.availableShowcases.find((s) => s.slug === testDraftSlug);
      assert.equal(foundDraft, undefined, 'Draft slug must NEVER appear in availableShowcases fallback listing');
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
