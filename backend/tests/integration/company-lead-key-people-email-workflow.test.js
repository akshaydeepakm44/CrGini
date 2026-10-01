import assert from 'node:assert';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { query, connectPostgres } from '../../src/config/postgres.js';

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}/api`;
const JWT_SECRET = process.env.JWT_SECRET || 'creativegini_jwt_secret_2026_production_key_secure';

const SAMPLE_PDF_BASE64 = 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp/Og0MTGCjEgMCBvYmoKPDwKL1R5cGUgL0NhdGFsb2cKL1BhZ2VzIDIgMCBSCj4+CmVuZG9iagoyIDAgb2JqCjw8Ci9UeXBlIC9QYWdlcwovS2lkcyBbMyAwIFJdCi9Db3VudCAxCj4+CmVuZG9iagozIDAgb2JqCjw8Ci9UeXBlIC9QYWdlCi9QYXJlbnQgMiAwIFIKL01lZGlhQm94IFswIDAgNjEyIDc5Ml0KPj4KZW5kb2JqCnhyZWYKMCA0CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxNSAwMDAwMCBuIAowMDAwMDAwMDY4IDAwMDAwIG4gCjAwMDAwMDAxMjUgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA0Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgoxOTkKJSVFT0YK';

const req = async (endpoint, options = {}, token = null) => {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  let data = null;
  try {
    data = await response.json();
  } catch (e) {
    data = null;
  }
  return { status: response.status, ok: response.ok, data };
};

const asyncTest = async (name, fn) => {
  try {
    await fn();
    console.log(`  [PASS] ${name}`);
  } catch (err) {
    console.error(`  [FAIL] ${name}`);
    console.error(err);
    process.exitCode = 1;
    throw err;
  }
};

async function runTests() {
  console.log('=== Company Lead Key People Email Workflow Tests (14 Requirements) ===\n');

  await connectPostgres();

  // Setup test companies and users
  const timestamp = Date.now();
  const companyAId = (await query(`
    INSERT INTO companies (name, contact_person, email, website, industry)
    VALUES ($1, 'Alice', $2, 'https://testcompany-a.com', 'Fintech')
    RETURNING id
  `, [`Test Company A ${timestamp}`, `alice.${timestamp}@example.com`])).rows[0].id;

  const companyBId = (await query(`
    INSERT INTO companies (name, contact_person, email, website, industry)
    VALUES ($1, 'Bob', $2, 'https://testcompany-b.com', 'Health')
    RETURNING id
  `, [`Test Company B ${timestamp}`, `bob.${timestamp}@example.com`])).rows[0].id;

  const userARes = await query(`
    INSERT INTO users (name, email, password, role, company_id, status)
    VALUES ('Client User A', $1, 'hash', 'USER', $2, 'ACTIVE')
    RETURNING *
  `, [`client.a.${timestamp}@example.com`, companyAId]);
  const userA = userARes.rows[0];

  const userBRes = await query(`
    INSERT INTO users (name, email, password, role, company_id, status)
    VALUES ('Client User B', $1, 'hash', 'USER', $2, 'ACTIVE')
    RETURNING *
  `, [`client.b.${timestamp}@example.com`, companyBId]);
  const userB = userBRes.rows[0];

  const leadUserRes = await query(`
    INSERT INTO users (name, email, password, role, company_lead, status)
    VALUES ('Lead Specialist', $1, 'hash', 'COMPANY_LEAD', true, 'ACTIVE')
    RETURNING *
  `, [`lead.spec.${timestamp}@creativegini.com`]);
  const leadUser = leadUserRes.rows[0];

  const tokenA = jwt.sign({ id: userA.id, email: userA.email, role: 'USER', companyId: companyAId, company_id: companyAId }, JWT_SECRET, { expiresIn: '2h' });
  const tokenB = jwt.sign({ id: userB.id, email: userB.email, role: 'USER', companyId: companyBId, company_id: companyBId }, JWT_SECRET, { expiresIn: '2h' });
  const tokenLead = jwt.sign({ id: leadUser.id, email: leadUser.email, role: 'COMPANY_LEAD', dashboardAccess: { companyLead: true } }, JWT_SECRET, { expiresIn: '2h' });

  let leadRecord = null;

  try {
    // 1. Lead Team adds one email.
    await asyncTest('1. Lead Team adds one email', async () => {
      const res = await req(`/company/${companyAId}/lead-onboarding-assets`, {
        method: 'POST',
        body: JSON.stringify({
          leadIndex: 1,
          companyName: 'Stripe Global',
          website: 'https://stripe.com',
          leadStudy: { name: 'Stripe - Lead Study.pdf', size: 5000, type: 'application/pdf', dataUrl: SAMPLE_PDF_BASE64 },
          keyPeopleEmails: ['patrick@stripe.com']
        })
      }, tokenLead);
      assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}: ${JSON.stringify(res.data)}`);
      assert(res.data?.success, 'Success is true');
      leadRecord = res.data.lead;
      assert.strictEqual(leadRecord.companyName, 'Stripe Global');
      assert.deepStrictEqual(leadRecord.keyPeople.emails, ['patrick@stripe.com']);
      assert.strictEqual(leadRecord.keyPeople.count, 1);
    });

    // 2. Lead Team adds multiple emails.
    await asyncTest('2. Lead Team adds multiple emails', async () => {
      const res = await req(`/company/${companyAId}/lead-onboarding-assets`, {
        method: 'POST',
        body: JSON.stringify({
          leadId: leadRecord.id,
          leadIndex: 1,
          companyName: 'Stripe Global',
          website: 'https://stripe.com',
          keyPeopleEmails: ['patrick@stripe.com', 'john@stripe.com', 'sarah@stripe.com']
        })
      }, tokenLead);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.lead.keyPeople.count, 3);
      assert.deepStrictEqual(res.data.lead.keyPeople.emails, ['patrick@stripe.com', 'john@stripe.com', 'sarah@stripe.com']);
    });

    // 3. Invalid email is rejected.
    await asyncTest('3. Invalid email is rejected with 400', async () => {
      const res = await req(`/company/${companyAId}/lead-onboarding-assets`, {
        method: 'POST',
        body: JSON.stringify({
          leadIndex: 2,
          companyName: 'Acme Corp',
          website: 'https://acme.com',
          keyPeopleEmails: ['not-an-email', 'valid@acme.com']
        })
      }, tokenLead);
      assert.strictEqual(res.status, 400);
      assert.match(res.data?.message || '', /invalid email/i);
    });

    // 4. Duplicate email is rejected.
    await asyncTest('4. Duplicate email is rejected with 400', async () => {
      const res = await req(`/company/${companyAId}/lead-onboarding-assets`, {
        method: 'POST',
        body: JSON.stringify({
          leadIndex: 2,
          companyName: 'Acme Corp',
          website: 'https://acme.com',
          keyPeopleEmails: ['duplicate@acme.com', 'DUPLICATE@ACME.COM']
        })
      }, tokenLead);
      assert.strictEqual(res.status, 400);
      assert.match(res.data?.message || '', /duplicate email/i);
    });

    // 5. Lead Team removes an email.
    await asyncTest('5. Lead Team removes an email by updating keyPeopleEmails', async () => {
      const res = await req(`/company/${companyAId}/lead-onboarding-assets`, {
        method: 'POST',
        body: JSON.stringify({
          leadId: leadRecord.id,
          leadIndex: 1,
          companyName: 'Stripe Global',
          website: 'https://stripe.com',
          keyPeopleEmails: ['patrick@stripe.com', 'sarah@stripe.com'] // john@stripe.com removed
        })
      }, tokenLead);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.lead.keyPeople.count, 2);
      assert.deepStrictEqual(res.data.lead.keyPeople.emails, ['patrick@stripe.com', 'sarah@stripe.com']);
    });

    // 6. Client sees Key People as locked before payment.
    let clientViewLeads = null;
    await asyncTest('6. Client sees Key People as locked before payment', async () => {
      const res = await req('/company/my-company/lead-onboarding-assets', {}, tokenA);
      assert.strictEqual(res.status, 200);
      clientViewLeads = res.data.leads;
      assert.strictEqual(clientViewLeads.length, 1);
      const lead = clientViewLeads[0];
      assert.strictEqual(lead.keyPeople.isLocked, true, 'isLocked must be true for unpaid client');
      assert.strictEqual(lead.keyPeopleUnlocked, false, 'keyPeopleUnlocked must be false');
    });

    // 7. Email is NOT present in the API response before payment.
    await asyncTest('7. Email is NOT present in the API response before payment', async () => {
      const lead = clientViewLeads[0];
      assert.strictEqual(lead.keyPeople.emails, undefined, 'keyPeople.emails must be undefined when locked');
      assert.strictEqual(lead.email, null, 'lead.email must be masked to null when locked');
      assert(!lead.notes.includes('patrick@stripe.com'), 'lead.notes must not expose email when locked');
      assert(!lead.notes.includes('sarah@stripe.com'), 'lead.notes must not expose email when locked');
    });

    // 8. Client pays using the existing Key People payment flow.
    let unlockTicket = null;
    await asyncTest('8. Client pays using existing Key People payment flow ($199)', async () => {
      const initRes = await req('/company/my-company/unlock-key-people', { method: 'POST' }, tokenA);
      assert.strictEqual(initRes.status, 200);
      unlockTicket = initRes.data.request;
      assert(unlockTicket, 'Unlock ticket returned');
      assert.strictEqual(unlockTicket.price, 199, 'Existing price of $199 preserved');

      const payRes = await req(`/requests/${unlockTicket.id || unlockTicket._id}/pay`, {
        method: 'POST',
        body: JSON.stringify({ paymentMethod: 'SIMULATED_CARD' })
      }, tokenA);
      assert.strictEqual(payRes.status, 200);
      assert.strictEqual(payRes.data?.payment?.status, 'PAID');
    });

    // 9. After successful payment, email becomes visible.
    await asyncTest('9. After successful payment, email becomes visible', async () => {
      const res = await req('/company/my-company/lead-onboarding-assets', {}, tokenA);
      assert.strictEqual(res.status, 200);
      const lead = res.data.leads[0];
      assert.strictEqual(lead.keyPeople.isLocked, false);
      assert(Array.isArray(lead.keyPeople.emails));
      assert.deepStrictEqual(lead.keyPeople.emails, ['patrick@stripe.com', 'sarah@stripe.com']);
      assert.strictEqual(lead.email, 'patrick@stripe.com');
    });

    // 10. Unauthorized client cannot access another company's Key People emails.
    await asyncTest('10. Unauthorized client cannot access another company Key People emails (403)', async () => {
      const res = await req(`/company/${companyAId}/lead-onboarding-assets`, {}, tokenB);
      assert.strictEqual(res.status, 403, 'Cross-company lead access must be blocked with 403');
    });

    // 11. Lead Study PDF still works.
    await asyncTest('11. Lead Study PDF still works with MinIO streaming and downloading', async () => {
      const res = await req('/company/my-company/lead-onboarding-assets', {}, tokenA);
      const lead = res.data.leads[0];
      assert(lead.leadStudy?.streamUrl, 'Lead study has streamUrl');
      const streamRes = await req(lead.leadStudy.streamUrl.replace('/api', ''), {}, tokenA);
      assert.strictEqual(streamRes.status, 200, 'Streaming lead study returns 200');
    });

    // 12. Pitch Deck PDF still works.
    await asyncTest('12. Pitch Deck PDF still works', async () => {
      // Add a pitch deck
      const uploadRes = await req(`/company/${companyAId}/lead-onboarding-assets`, {
        method: 'POST',
        body: JSON.stringify({
          leadId: leadRecord.id,
          leadIndex: 1,
          companyName: 'Stripe Global',
          website: 'https://stripe.com',
          pitchDeck: { name: 'Stripe - Pitch Deck.pdf', size: 6000, type: 'application/pdf', dataUrl: SAMPLE_PDF_BASE64 }
        })
      }, tokenLead);
      assert.strictEqual(uploadRes.status, 200);

      const checkRes = await req('/company/my-company/lead-onboarding-assets', {}, tokenA);
      const pitchDeck = checkRes.data.leads[0].pitchDeck;
      assert(pitchDeck?.streamUrl, 'Pitch deck has streamUrl');
      const streamRes = await req(pitchDeck.streamUrl.replace('/api', ''), {}, tokenA);
      assert.strictEqual(streamRes.status, 200);
    });

    // 13. Existing Company Lead functionality still works.
    await asyncTest('13. Existing Company Lead functionality still works (ticket association, slot ordering)', async () => {
      const res = await req('/company/my-company/lead-onboarding-assets', {}, tokenA);
      assert.strictEqual(res.status, 200);
      assert(res.data.ticketId, 'Onboarding ticket ID present');
      assert.strictEqual(res.data.leads[0].slotIndex, 1);
      assert.strictEqual(res.data.isKeyPeoplePaid, true);
    });

    // 14. Existing MinIO functionality remains unchanged.
    await asyncTest('14. Existing MinIO functionality remains unchanged (no MinIO for Key People, MinIO active for PDFs)', async () => {
      // Verify in submission_files that NO key people files were inserted
      const sfRes = await query(`
        SELECT sf.name FROM submission_files sf
        JOIN submissions s ON sf.submission_id = s.id
        JOIN requests r ON s.request_id = r.id
        WHERE r.company_id = $1
      `, [companyAId]);
      const fileNames = sfRes.rows.map(r => r.name);
      assert(fileNames.some(n => n.includes('[Lead Study]')), 'Lead Study exists in submission_files / MinIO');
      assert(fileNames.some(n => n.includes('[Pitch Deck]')), 'Pitch Deck exists in submission_files / MinIO');
      assert(!fileNames.some(n => n.includes('[Key People]')), 'Key People must NOT be in submission_files or MinIO');
    });

    console.log('\nAll 14 integration test requirements PASSED successfully!');
  } finally {
    // Clean up test data
    await query('DELETE FROM company_leads WHERE company_id IN ($1, $2)', [companyAId, companyBId]);
    await query('DELETE FROM submission_files WHERE submission_id IN (SELECT id FROM submissions WHERE request_id IN (SELECT id FROM requests WHERE company_id IN ($1, $2)))', [companyAId, companyBId]);
    await query('DELETE FROM submissions WHERE request_id IN (SELECT id FROM requests WHERE company_id IN ($1, $2))', [companyAId, companyBId]);
    await query('DELETE FROM payments WHERE request_id IN (SELECT id FROM requests WHERE company_id IN ($1, $2))', [companyAId, companyBId]);
    await query('DELETE FROM requests WHERE company_id IN ($1, $2)', [companyAId, companyBId]);
    await query('DELETE FROM users WHERE id IN ($1, $2, $3)', [userA.id, userB.id, leadUser.id]);
    await query('DELETE FROM companies WHERE id IN ($1, $2)', [companyAId, companyBId]);
  }
}

runTests().catch(err => {
  console.error('[Test Execution Error]:', err);
  process.exit(1);
});
