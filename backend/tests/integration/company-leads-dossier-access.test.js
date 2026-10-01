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

async function req(endpoint, options = {}, token = null) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  let data = null;
  const cType = res.headers.get('content-type') || '';
  if (cType.includes('application/json')) {
    data = await res.json().catch(() => null);
  }
  return { status: res.status, ok: res.ok, data, headers: res.headers };
}

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      companyId: user.company_id,
      company_id: user.company_id,
      dashboardAccess: {
        companyBoost: Boolean(user.company_boost),
        companyLead: Boolean(user.company_lead),
        companyUI: Boolean(user.company_ui),
      }
    },
    JWT_SECRET,
    { expiresIn: '2h' }
  );
}

async function runTestSuite() {
  console.log('========================================================================');
  console.log('   COMPANY LEADS 5-COLUMN DOSSIER & KEY PEOPLE ACCESS TEST SUITE');
  console.log('========================================================================\n');

  await connectPostgres();

  const timestamp = Date.now();
  let passed = 0;
  let failed = 0;

  const test = (desc, fn) => {
    try {
      fn();
      console.log(`  [PASS] ${desc}`);
      passed++;
    } catch (err) {
      console.error(`  [FAIL] ${desc}: ${err.message}`);
      failed++;
    }
  };

  const asyncTest = async (desc, fn) => {
    try {
      await fn();
      console.log(`  [PASS] ${desc}`);
      passed++;
    } catch (err) {
      console.error(`  [FAIL] ${desc}: ${err.message}`);
      failed++;
    }
  };

  // 1. Setup Client A and Client B with companies
  console.log('--- SETUP: Provisioning Isolated Test Entities ---');
  const compARes = await query(`
    INSERT INTO companies (name, contact_person, email, website, industry)
    VALUES ($1, $2, $3, $4, $5) RETURNING *
  `, [`Test Client A ${timestamp}`, 'Alice', `alice.${timestamp}@test.com`, 'https://alice-corp.com', 'SaaS']);
  const companyA = compARes.rows[0];

  const compBRes = await query(`
    INSERT INTO companies (name, contact_person, email, website, industry)
    VALUES ($1, $2, $3, $4, $5) RETURNING *
  `, [`Test Client B ${timestamp}`, 'Bob', `bob.${timestamp}@test.com`, 'https://bob-corp.com', 'FinTech']);
  const companyB = compBRes.rows[0];

  const userARes = await query(`
    INSERT INTO users (name, email, password, role, company_id, status)
    VALUES ($1, $2, $3, 'USER', $4, 'ACTIVE') RETURNING *
  `, ['Alice User', `alice.${timestamp}@test.com`, 'hashedpass', companyA.id]);
  const userA = userARes.rows[0];
  const tokenA = createToken(userA);

  const userBRes = await query(`
    INSERT INTO users (name, email, password, role, company_id, status)
    VALUES ($1, $2, $3, 'USER', $4, 'ACTIVE') RETURNING *
  `, ['Bob User', `bob.${timestamp}@test.com`, 'hashedpass', companyB.id]);
  const userB = userBRes.rows[0];
  const tokenB = createToken(userB);

  const adminUserRes = await query(`
    INSERT INTO users (name, email, password, role, company_lead, status)
    VALUES ($1, $2, $3, 'COMPANY_LEAD', true, 'ACTIVE') RETURNING *
  `, ['Lead Specialist', `lead.spec.${timestamp}@creativegini.test`, 'hashedpass']);
  const leadSpecialist = adminUserRes.rows[0];
  const tokenLead = createToken(leadSpecialist);

  console.log('Provisioning completed.\n');

  // --- SECTION 1: LEAD TEAM UPLOAD & VALIDATION ---
  console.log('--- TEST GROUP 1: Lead Team Upload Validation ---');

  await asyncTest('Reject lead submission missing company name with 400', async () => {
    const res = await req(`/company/${companyA.id}/lead-onboarding-assets`, {
      method: 'POST',
      body: JSON.stringify({
        companyName: '',
        website: 'https://prospect.io',
        leadStudy: { name: 'study.pdf', dataUrl: SAMPLE_PDF_BASE64 },
        pitchDeck: { name: 'pitch.pdf', dataUrl: SAMPLE_PDF_BASE64 },
        keyPeople: { name: 'kp.pdf', dataUrl: SAMPLE_PDF_BASE64 }
      })
    }, tokenLead);
    assert.strictEqual(res.status, 400);
  });

  await asyncTest('Reject lead submission with invalid website URL with 400', async () => {
    const res = await req(`/company/${companyA.id}/lead-onboarding-assets`, {
      method: 'POST',
      body: JSON.stringify({
        companyName: 'Prospect Corp',
        website: 'ftp://invalid-url',
        leadStudy: { name: 'study.pdf', dataUrl: SAMPLE_PDF_BASE64 },
        pitchDeck: { name: 'pitch.pdf', dataUrl: SAMPLE_PDF_BASE64 },
        keyPeople: { name: 'kp.pdf', dataUrl: SAMPLE_PDF_BASE64 }
      })
    }, tokenLead);
    assert.strictEqual(res.status, 400);
  });

  await asyncTest('Reject non-PDF document with 400', async () => {
    const res = await req(`/company/${companyA.id}/lead-onboarding-assets`, {
      method: 'POST',
      body: JSON.stringify({
        companyName: 'Prospect Corp',
        website: 'https://prospect.io',
        leadStudy: { name: 'study.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', dataUrl: 'data:text/plain;base64,AAAA' },
        pitchDeck: { name: 'pitch.pdf', dataUrl: SAMPLE_PDF_BASE64 },
        keyPeople: { name: 'kp.pdf', dataUrl: SAMPLE_PDF_BASE64 }
      })
    }, tokenLead);
    assert.strictEqual(res.status, 400);
  });

  await asyncTest('Regular client USER cannot upload lead documents (403 Forbidden)', async () => {
    const res = await req(`/company/${companyA.id}/lead-onboarding-assets`, {
      method: 'POST',
      body: JSON.stringify({
        companyName: 'Hacker Corp',
        website: 'https://hacker.io',
        leadStudy: { name: 'study.pdf', dataUrl: SAMPLE_PDF_BASE64 }
      })
    }, tokenA);
    assert.strictEqual(res.status, 403);
  });

  // --- SECTION 2: SUCCESSFUL SAMPLE LEAD UPLOAD WITH 3 DOCUMENTS ---
  console.log('\n--- TEST GROUP 2: Lead Team Upload 3 Documents per Lead ---');

  let sampleLeadRecord = null;
  await asyncTest('Lead Specialist successfully uploads Lead 01 with Lead Study, Pitch Deck, and Key People Emails', async () => {
    const res = await req(`/company/${companyA.id}/lead-onboarding-assets`, {
      method: 'POST',
      body: JSON.stringify({
        leadIndex: 1,
        companyName: 'Nova Intelligence Inc',
        website: 'https://novaintelligence.ai',
        leadStudy: { name: 'Nova - Lead Study.pdf', size: 10240, type: 'application/pdf', dataUrl: SAMPLE_PDF_BASE64 },
        pitchDeck: { name: 'Nova - Pitch Deck.pdf', size: 12400, type: 'application/pdf', dataUrl: SAMPLE_PDF_BASE64 },
        keyPeopleEmails: ['sarah.connor@novaintelligence.ai', 'john.doe@novaintelligence.ai']
      })
    }, tokenLead);
    assert.strictEqual(res.status, 200);
    assert(res.data?.success, 'Success is true');
    sampleLeadRecord = res.data.lead;
    assert.strictEqual(sampleLeadRecord.companyName, 'Nova Intelligence Inc');
    assert.strictEqual(sampleLeadRecord.keyPeople?.count, 2);
  });

  // --- SECTION 3: REPLACING INDIVIDUAL DOCUMENT ---
  console.log('\n--- TEST GROUP 3: Document Replacement ---');

  await asyncTest('Lead Specialist replaces single document (Pitch Deck) on existing lead', async () => {
    const res = await req(`/company/${companyA.id}/lead-onboarding-assets`, {
      method: 'POST',
      body: JSON.stringify({
        leadId: sampleLeadRecord.id,
        leadIndex: 1,
        companyName: 'Nova Intelligence Inc',
        website: 'https://novaintelligence.ai',
        pitchDeck: { name: 'Nova - Updated Pitch Deck.pdf', size: 15400, type: 'application/pdf', dataUrl: SAMPLE_PDF_BASE64 }
      })
    }, tokenLead);
    assert.strictEqual(res.status, 200);
    assert(res.data?.pitchDeck || res.data?.lead?.pitchDeck, 'Updated pitch deck returned');
  });

  // --- SECTION 4: USER DASHBOARD 5-COLUMN TABLE & ACCESS CONTROL ---
  console.log('\n--- TEST GROUP 4: User Dashboard 5-Column Structure & Access Control ---');

  let clientALeads = null;
  await asyncTest('Client A fetches own company leads and receives 5-column metadata with Key People locked and emails hidden', async () => {
    const res = await req('/company/my-company/lead-onboarding-assets', {}, tokenA);
    assert.strictEqual(res.status, 200);
    assert(Array.isArray(res.data?.leads), 'Leads is an array');
    assert.strictEqual(res.data.leads.length, 1);
    clientALeads = res.data.leads;
    const lead = clientALeads[0];

    // Verify 5 columns
    assert.strictEqual(lead.companyName, 'Nova Intelligence Inc');
    assert.strictEqual(lead.website, 'https://novaintelligence.ai');
    assert(lead.leadStudy && lead.leadStudy.streamUrl, 'Lead Study has streamUrl');
    assert(lead.pitchDeck && lead.pitchDeck.streamUrl, 'Pitch Deck has streamUrl');
    assert(lead.keyPeople, 'Key People object exists');
    assert.strictEqual(lead.keyPeople.isLocked, true, 'Key People is locked before payment');
    assert.strictEqual(lead.keyPeople.emails, undefined, 'Key People emails array must NOT be exposed before payment');
    assert.strictEqual(lead.email, null, 'lead.email must NOT be exposed before payment');
    assert(!lead.notes.includes('sarah.connor@novaintelligence.ai'), 'Emails must not leak in notes before payment');
  });

  await asyncTest('Client A can stream own Lead Study (200 OK)', async () => {
    const lead = clientALeads[0];
    const streamUrl = lead.leadStudy.streamUrl;
    const res = await req(streamUrl.replace('/api', ''), {}, tokenA);
    assert.strictEqual(res.status, 200);
  });

  await asyncTest('Client A can download own Pitch Deck (200 OK)', async () => {
    const lead = clientALeads[0];
    const downloadUrl = lead.pitchDeck.downloadUrl;
    const res = await req(downloadUrl.replace('/api', ''), {}, tokenA);
    assert.strictEqual(res.status, 200);
  });

  // --- SECTION 5: UNLOCK KEY PEOPLE WORKFLOW ---
  console.log('\n--- TEST GROUP 5: Unlock Key People Workflow & Entitlement Activation ---');

  let kpUnlockTicket = null;
  await asyncTest('Client A initiates Key People unlock and receives $199 request ticket', async () => {
    const res = await req('/company/my-company/unlock-key-people', { method: 'POST' }, tokenA);
    assert.strictEqual(res.status, 200);
    assert(res.data?.request, 'Unlock request returned');
    assert.strictEqual(res.data.request.price, 199);
    assert.strictEqual(res.data.request.paymentStatus, 'PENDING');
    kpUnlockTicket = res.data.request;
  });

  await asyncTest('Client A pays for Key People unlock request via /requests/:id/pay', async () => {
    const res = await req(`/requests/${kpUnlockTicket.id || kpUnlockTicket._id}/pay`, {
      method: 'POST',
      body: JSON.stringify({ paymentMethod: 'SIMULATED_CARD' })
    }, tokenA);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data?.payment?.status, 'PAID');
  });

  await asyncTest('After payment, Client A sees Key People as unlocked with email addresses revealed', async () => {
    const res = await req('/company/my-company/lead-onboarding-assets', {}, tokenA);
    assert.strictEqual(res.status, 200);
    const lead = res.data.leads[0];
    assert.strictEqual(lead.keyPeople.isLocked, false);
    assert(Array.isArray(lead.keyPeople.emails), 'Key people emails array is now populated');
    assert.strictEqual(lead.keyPeople.emails.length, 2);
    assert(lead.keyPeople.emails.includes('sarah.connor@novaintelligence.ai'));
    assert(lead.keyPeople.emails.includes('john.doe@novaintelligence.ai'));
    assert.strictEqual(lead.email, 'sarah.connor@novaintelligence.ai');
  });

  // --- SECTION 6: ADDITIONAL PAID LEADS INCLUDE KEY PEOPLE ---
  console.log('\n--- TEST GROUP 6: Additional Paid Leads Automatically Include Key People ---');

  await asyncTest('Lead Specialist uploads additional lead (slot 6 / ADDITIONAL tag) for Client B (who has NOT paid for sample Key People)', async () => {
    // Client B has NOT paid the $199 unlock fee
    const res = await req(`/company/${companyB.id}/lead-onboarding-assets`, {
      method: 'POST',
      body: JSON.stringify({
        leadIndex: 6,
        isAdditional: true,
        companyName: 'Additional Apex Corp',
        website: 'https://apexadditional.com',
        leadStudy: { name: 'Apex - Lead Study.pdf', size: 10240, type: 'application/pdf', dataUrl: SAMPLE_PDF_BASE64 },
        pitchDeck: { name: 'Apex - Pitch Deck.pdf', size: 11000, type: 'application/pdf', dataUrl: SAMPLE_PDF_BASE64 },
        keyPeopleEmails: ['apex.lead@apexadditional.com']
      })
    }, tokenLead);
    assert.strictEqual(res.status, 200);
  });

  await asyncTest('Client B receives additional lead with Key People AUTOMATICALLY UNLOCKED (isLocked: false, emails present)', async () => {
    const res = await req('/company/my-company/lead-onboarding-assets', {}, tokenB);
    assert.strictEqual(res.status, 200);
    const additionalLead = res.data.leads.find(l => l.companyName === 'Additional Apex Corp');
    assert(additionalLead, 'Additional lead found');
    assert.strictEqual(additionalLead.isAdditionalLead, true);
    assert.strictEqual(additionalLead.keyPeople.isLocked, false, 'Additional lead Key People must NOT be locked');
    assert.deepStrictEqual(additionalLead.keyPeople.emails, ['apex.lead@apexadditional.com']);
  });

  // --- SECTION 7: CROSS-TENANT IDOR SECURITY ---
  console.log('\n--- TEST GROUP 7: Cross-Tenant Lead IDOR Security ---');

  await asyncTest('Client B cannot access Client A lead onboarding assets (403 Forbidden)', async () => {
    const res = await req(`/company/${companyA.id}/lead-onboarding-assets`, {}, tokenB);
    assert.strictEqual(res.status, 403);
  });

  await asyncTest('Client B cannot stream Client A lead documents (403 Forbidden)', async () => {
    const leadRes = await req('/company/my-company/lead-onboarding-assets', {}, tokenA);
    const aLeadStudyId = leadRes.data.leads[0].leadStudy.id;
    const res = await req(`/assets/${aLeadStudyId}/stream`, {}, tokenB);
    assert.strictEqual(res.status, 403);
  });

  // --- CLEANUP ---
  console.log('\n--- CLEANUP: Removing Test Entities ---');
  await query('DELETE FROM submission_files WHERE name ILIKE $1', ['%Nova Intelligence%']);
  await query('DELETE FROM submission_files WHERE name ILIKE $1', ['%Additional Apex%']);
  await query('DELETE FROM payments WHERE company_id IN ($1, $2)', [companyA.id, companyB.id]);
  await query('DELETE FROM requests WHERE company_id IN ($1, $2)', [companyA.id, companyB.id]);
  await query('DELETE FROM company_leads WHERE company_id IN ($1, $2)', [companyA.id, companyB.id]);
  await query('DELETE FROM users WHERE company_id IN ($1, $2) OR id = $3', [companyA.id, companyB.id, leadSpecialist.id]);
  await query('DELETE FROM companies WHERE id IN ($1, $2)', [companyA.id, companyB.id]);
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
