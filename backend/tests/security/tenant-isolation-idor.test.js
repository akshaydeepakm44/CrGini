import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query, connectPostgres } from '../../src/config/postgres.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const API_BASE = 'http://localhost:5000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'creativegini_secret_2026';

function generateToken(user) {
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

async function apiFetch(endpoint, token, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };
  const res = await fetch(url, { ...options, headers });
  let data;
  try {
    data = await res.json();
  } catch (err) {
    data = { rawText: 'Non-JSON response' };
  }
  return { status: res.status, ok: res.ok, data };
}

async function runTenantIsolationSuite() {
  console.log('================================================================');
  console.log('    CREATIVEGINI COMPLETE TENANT ISOLATION & IDOR TEST SUITE    ');
  console.log('================================================================\n');

  await connectPostgres();

  let passed = 0;
  let failed = 0;

  function assert(name, condition, details = '') {
    if (condition) {
      console.log(`  [PASS] ${name}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${name} ${details ? `(${details})` : ''}`);
      failed++;
    }
  }

  const salt = await bcrypt.genSalt(6);
  const passwordHash = await bcrypt.hash('TestTenantPass@123', salt);

  let compAId, compBId, userAId, userBId, leadSpecialistId, ticketBId, subBId, fileBId;
  let leadBId, notifBId, newTicketBId, completedTicketBId;
  let tokenA, tokenB, tokenLead, tokenAdmin;

  try {
    console.log('--- SETUP: Provisioning Isolated Test Entities ---');

    const ts = Date.now();
    // 1. Create Company A and User A
    const compARes = await query(`
      INSERT INTO companies (name, contact_person, email, industry, company_info)
      VALUES ($1, 'Alice Alpha', $2, 'FinTech', 'Alpha Financial SaaS')
      RETURNING id
    `, [`Tenant Alpha Corp ${ts}`, `alpha.${ts}@tenant-a.com`]);
    compAId = compARes.rows[0].id;

    const userARes = await query(`
      INSERT INTO users (name, email, password, role, company_id, status)
      VALUES ('Alice Alpha', $1, $2, 'USER', $3, 'ACTIVE')
      RETURNING id, name, email, role, company_id, company_boost, company_lead, company_ui
    `, [`alice.${ts}@tenant-a.com`, passwordHash, compAId]);
    userAId = userARes.rows[0].id;
    tokenA = generateToken(userARes.rows[0]);

    // 2. Create Company B and User B
    const compBRes = await query(`
      INSERT INTO companies (name, contact_person, email, industry, company_info)
      VALUES ($1, 'Bob Beta', $2, 'HealthTech', 'Beta Health Systems')
      RETURNING id
    `, [`Tenant Beta Corp ${ts}`, `beta.${ts}@tenant-b.com`]);
    compBId = compBRes.rows[0].id;

    const userBRes = await query(`
      INSERT INTO users (name, email, password, role, company_id, status)
      VALUES ('Bob Beta', $1, $2, 'USER', $3, 'ACTIVE')
      RETURNING id, name, email, role, company_id, company_boost, company_lead, company_ui
    `, [`bob.${ts}@tenant-b.com`, passwordHash, compBId]);
    userBId = userBRes.rows[0].id;
    tokenB = generateToken(userBRes.rows[0]);

    // 3. Create Company Lead Specialist
    const leadSpecRes = await query(`
      INSERT INTO users (name, email, password, role, company_lead, status)
      VALUES ('Leo Lead', $1, $2, 'COMPANY_LEAD', true, 'ACTIVE')
      RETURNING id, name, email, role, company_id, company_boost, company_lead, company_ui
    `, [`leo.specialist.${ts}@creativegini-tenant-test.com`, passwordHash]);
    leadSpecialistId = leadSpecRes.rows[0].id;
    tokenLead = generateToken(leadSpecRes.rows[0]);

    // 4. Create Ticket and Assets for Company B
    const ticketCodeB = `CG-TST-${ts.toString().slice(-4)}`;
    const ticketBRes = await query(`
      INSERT INTO requests (ticket_id, user_id, company_id, service_type, title, description, status, price, payment_status)
      VALUES ($1, $2, $3, 'COMPANY_BOOST', 'Beta Growth Sprint', 'Confidential sprint strategy for Beta', 'WORK_SUBMITTED', 499, 'PAID')
      RETURNING id, ticket_id
    `, [ticketCodeB, userBId, compBId]);
    ticketBId = ticketBRes.rows[0].id;

    const subBRes = await query(`
      INSERT INTO submissions (request_id, ticket_code, version, title, description, status, notes)
      VALUES ($1, $2, 1, 'Beta Sprint Strategy V1', 'Deliverables description for Beta', 'PENDING_REVIEW', 'V1 Strategy Deliverables for Beta')
      RETURNING id
    `, [ticketBId, ticketCodeB]);
    subBId = subBRes.rows[0].id;

    const fileBRes = await query(`
      INSERT INTO submission_files (submission_id, name, url, size, type)
      VALUES ($1, '[Strategic Plan] Beta_Secret_Strategy.pdf', 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrCg==', '12 KB', 'application/pdf')
      RETURNING id
    `, [subBId]);
    fileBId = fileBRes.rows[0].id;

    // Create a message in Company B ticket
    await query(`
      INSERT INTO messages (request_id, sender_id, sender_name, sender_role, text, is_internal_note)
      VALUES ($1, $2, 'Bob Beta', 'USER', 'Confidential communication for Beta Corp', false)
    `, [ticketBId, userBId]);

    // 5. Create Lead for Company B
    const leadBRes = await query(`
      INSERT INTO company_leads (company_id, name, title, lead_company, email, status, notes)
      VALUES ($1, 'Beta Target Lead', 'VP of Security', 'SecureCloud', 'vp@securecloud.io', 'VERIFIED', 'Verified enterprise lead')
      RETURNING id
    `, [compBId]);
    leadBId = leadBRes.rows[0].id;

    // 6. Create Notification for User B
    const notifBRes = await query(`
      INSERT INTO notifications (user_id, type, title, message, ticket_id)
      VALUES ($1, 'ASSIGNMENT', 'Beta Ticket Assigned', 'Notification for User B only', $2)
      RETURNING id
    `, [userBId, ticketBId]);
    notifBId = notifBRes.rows[0].id;

    // 7. Create New Unpaid Ticket for Company B (REQUEST_CREATED)
    const newTicketCodeB = `CG-NEW-${ts.toString().slice(-4)}`;
    const newTicketBRes = await query(`
      INSERT INTO requests (ticket_id, user_id, company_id, service_type, title, description, status, price, payment_status)
      VALUES ($1, $2, $3, 'COMPANY_BOOST', 'Beta New Sprint', 'Unpaid new sprint', 'REQUEST_CREATED', 499, 'PENDING')
      RETURNING id
    `, [newTicketCodeB, userBId, compBId]);
    newTicketBId = newTicketBRes.rows[0].id;

    // 8. Create Completed Ticket for Company B
    const compTicketCodeB = `CG-CMP-${ts.toString().slice(-4)}`;
    const completedTicketBRes = await query(`
      INSERT INTO requests (ticket_id, user_id, company_id, service_type, title, description, status, price, payment_status, completed_at)
      VALUES ($1, $2, $3, 'COMPANY_BOOST', 'Beta Completed Sprint', 'Completed sprint', 'COMPLETED', 499, 'PAID', NOW())
      RETURNING id
    `, [compTicketCodeB, userBId, compBId]);
    completedTicketBId = completedTicketBRes.rows[0].id;

    // 9. Fetch Admin Token
    const adminRes = await query(`SELECT id, name, email, role, company_id, company_boost, company_lead, company_ui FROM users WHERE role = 'ADMIN' LIMIT 1`);
    tokenAdmin = generateToken(adminRes.rows[0]);

    console.log('Entities provisioned successfully.\n');

    console.log('--- TEST GROUP 1: Client A vs Client B Company Isolation ---');
    // Test 1: User A gets own company info
    const myCompRes = await apiFetch('/company/my-company', tokenA);
    assert('User A gets own company profile (Company A)', myCompRes.status === 200 && myCompRes.data.company.id === compAId);

    // Test 2: User A attempts direct company lookup (requires Admin / Specialist)
    const directCompRes = await apiFetch(`/company/${compBId}`, tokenA);
    assert('User A cannot fetch Company B directly via /company/:id (403 Forbidden)', directCompRes.status === 403);

    // Test 3: User A attempts to view Company B Onboarding Assets
    const onbBRes = await apiFetch(`/company/${compBId}/onboarding-assets`, tokenA);
    assert('User A cannot view Company B Onboarding Assets (403 Forbidden)', onbBRes.status === 403);

    // Test 4: User A attempts to view Company B UI Onboarding Assets
    const uiOnbBRes = await apiFetch(`/company/${compBId}/ui-onboarding-assets`, tokenA);
    assert('User A cannot view Company B UI Onboarding Assets (403 Forbidden)', uiOnbBRes.status === 403);

    // Test 5: User A attempts to view Company B Lead Onboarding Assets
    const leadOnbBRes = await apiFetch(`/company/${compBId}/lead-onboarding-assets`, tokenA);
    assert('User A cannot view Company B Lead Onboarding Assets (403 Forbidden)', leadOnbBRes.status === 403);

    console.log('\n--- TEST GROUP 2: Client A vs Client B Leads & Key People IDOR ---');
    // Test 6: User A attempts to view Company B leads
    const leadsBRes = await apiFetch(`/company/${compBId}/leads`, tokenA);
    assert('User A cannot access Company B leads (403 Forbidden)', leadsBRes.status === 403);

    // Test 7: User A attempts to insert lead into Company B
    const addLeadRes = await apiFetch(`/company/${compBId}/leads`, tokenA, {
      method: 'POST',
      body: JSON.stringify({ name: 'Hacker Lead', email: 'hacker@evil.com' })
    });
    assert('User A cannot add leads to Company B (403 Forbidden)', addLeadRes.status === 403);

    // Test 8: User A attempts to add key person to Company B
    const addKpRes = await apiFetch(`/company/${compBId}/key-people`, tokenA, {
      method: 'POST',
      body: JSON.stringify({ name: 'Hacker Person', role: 'Infiltrator' })
    });
    assert('User A cannot add key people to Company B (403 Forbidden)', addKpRes.status === 403);

    // Test 8b: User A attempts to fetch Company B lead detail (IDOR)
    const leadDetailRes = await apiFetch(`/company/my-company/leads/${leadBId}`, tokenA);
    assert('User A cannot view Company B lead details (403/404 Forbidden)', leadDetailRes.status === 403 || leadDetailRes.status === 404);

    console.log('\n--- TEST GROUP 3: Tickets, Messages & Conversations IDOR ---');
    // Test 9: User A attempts to view Client B ticket
    const ticketRes = await apiFetch(`/requests/${ticketBId}`, tokenA);
    assert('User A cannot view Client B ticket details (403 Forbidden)', ticketRes.status === 403);

    // Test 10: User A attempts to view Client B conversation messages
    const msgRes = await apiFetch(`/requests/${ticketBId}/messages`, tokenA);
    assert('User A cannot view Client B conversation messages (403 Forbidden)', msgRes.status === 403);

    // Test 11: User A attempts to post message to Client B conversation
    const postMsgRes = await apiFetch(`/requests/${ticketBId}/messages`, tokenA, {
      method: 'POST',
      body: JSON.stringify({ message: 'Unauthorized injection' })
    });
    assert('User A cannot send messages to Client B ticket (403/404 Forbidden)', postMsgRes.status === 403 || postMsgRes.status === 404);

    // Test 12: User A attempts to view Client B ticket activity timeline
    const actRes = await apiFetch(`/requests/${ticketBId}/activity`, tokenA);
    assert('User A cannot view Client B ticket activity (403 Forbidden)', actRes.status === 403);

    // Test 12b: User A attempts to mark User B notification as read (IDOR)
    const notifReadRes = await apiFetch(`/notifications/${notifBId}/read`, tokenA, { method: 'PATCH' });
    assert('User A cannot mark User B notification as read (404/403 Forbidden)', notifReadRes.status === 404 || notifReadRes.status === 403);

    console.log('\n--- TEST GROUP 4: Submissions, Approvals & Workflows IDOR ---');
    // Test 13: User A attempts to approve Client B submission
    const approveRes = await apiFetch(`/requests/${ticketBId}/submissions/${subBId}/approve`, tokenA, {
      method: 'POST',
      body: JSON.stringify({ feedback: 'Malicious approval' })
    });
    assert('User A cannot approve Client B submission (403 Forbidden)', approveRes.status === 403);

    // Test 14: User A attempts to request changes on Client B submission
    const reqChangesRes = await apiFetch(`/requests/${ticketBId}/submissions/${subBId}/request-changes`, tokenA, {
      method: 'POST',
      body: JSON.stringify({ feedback: 'Malicious change request' })
    });
    assert('User A cannot request changes on Client B submission (403 Forbidden)', reqChangesRes.status === 403);

    // Test 14b: User A attempts to fetch Client B submission by version (IDOR)
    const subVerRes = await apiFetch(`/requests/${ticketBId}/submissions/version/1`, tokenA);
    assert('User A cannot view Client B submission version (403 Forbidden)', subVerRes.status === 403);

    // Test 14c: User A attempts to process payment on Client B ticket (IDOR)
    const unauthPayRes = await apiFetch(`/requests/${ticketBId}/pay`, tokenA, {
      method: 'POST',
      body: JSON.stringify({ paymentMethod: 'Stripe Card' })
    });
    assert('User A cannot pay for Client B ticket (403 Forbidden)', unauthPayRes.status === 403);

    // Test 14d: Duplicate payment prevention on already paid ticket
    const dupPayRes = await apiFetch(`/requests/${ticketBId}/pay`, tokenB, {
      method: 'POST',
      body: JSON.stringify({ paymentMethod: 'Stripe Card' })
    });
    assert('Duplicate payment on already paid ticket is blocked (400 Bad Request)', dupPayRes.status === 400);

    console.log('\n--- TEST GROUP 5: Assets Library & Media Streaming IDOR ---');
    // Test 15: User A attempts to fetch asset metadata of Client B
    const assetMetaRes = await apiFetch(`/assets/${fileBId}`, tokenA);
    assert('User A cannot fetch Client B asset metadata (403 Forbidden)', assetMetaRes.status === 403);

    // Test 16: User A attempts to stream Client B media
    const streamRes = await apiFetch(`/assets/${fileBId}/stream`, tokenA);
    assert('User A cannot stream Client B asset media (403 Forbidden)', streamRes.status === 403);

    // Test 17: User A attempts to download Client B asset
    const dlRes = await apiFetch(`/assets/${fileBId}/download`, tokenA);
    assert('User A cannot download Client B asset (403 Forbidden)', dlRes.status === 403);

    // Test 18: Client B (the owner) CAN stream their own asset
    const validStreamRes = await apiFetch(`/assets/${fileBId}/stream`, tokenB);
    assert('Client B (owner) can stream their own asset (200 OK)', validStreamRes.status === 200);

    // Test 19: Unauthenticated request cannot access assets
    const unauthStream = await apiFetch(`/assets/${fileBId}/stream`, null);
    assert('Unauthenticated request to asset stream is blocked (401 Unauthorized)', unauthStream.status === 401);

    console.log('\n--- TEST GROUP 6: Role Permissions & Admin Route Protection ---');
    // Test 20: User A attempts to access Admin user list
    const adminUsersRes = await apiFetch('/admin/users', tokenA);
    assert('User A cannot access Admin User Management (403 Forbidden)', adminUsersRes.status === 403);

    // Test 21: User A attempts to access Admin activity logs
    const adminLogsRes = await apiFetch('/admin/activity-logs', tokenA);
    assert('User A cannot access Admin Activity Logs (403 Forbidden)', adminLogsRes.status === 403);

    // Test 22: Specialist COMPANY_LEAD cannot access Company Boost onboarding assets
    const leadBoostOnb = await apiFetch(`/company/${compBId}/onboarding-assets`, tokenLead, {
      method: 'POST',
      body: JSON.stringify({ poster: { name: 'Unauthorized.png' } })
    });
    assert('COMPANY_LEAD specialist cannot modify Company Boost onboarding assets (403 Forbidden)', leadBoostOnb.status === 403);

    console.log('\n--- TEST GROUP 7: Lifecycle State Transitions & Validation ---');
    // Test 23: Direct completion on newly created ticket is rejected
    const invalidCompRes = await apiFetch(`/requests/${newTicketBId}/status`, tokenAdmin, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'COMPLETED' })
    });
    assert('Direct completion on REQUEST_CREATED ticket fails (400 Bad Request)', invalidCompRes.status === 400);

    // Test 24: Reverting ticket under client review to ASSIGNED is rejected
    const invalidRevertRes = await apiFetch(`/requests/${ticketBId}/status`, tokenAdmin, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'ASSIGNED' })
    });
    assert('Reverting CLIENT_REVIEW ticket to ASSIGNED fails (400 Bad Request)', invalidRevertRes.status === 400);

    // Test 25: Reopening completed ticket via status update is rejected
    const invalidReopenRes = await apiFetch(`/requests/${completedTicketBId}/status`, tokenAdmin, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'IN_PROGRESS' })
    });
    assert('Reopening COMPLETED ticket via status update fails (400 Bad Request)', invalidReopenRes.status === 400);

    // Test 26: Starting work on completed ticket is rejected
    const invalidStartWorkRes = await apiFetch(`/requests/${completedTicketBId}/start-work`, tokenAdmin, {
      method: 'POST'
    });
    assert('Starting work on COMPLETED ticket fails (400 Bad Request)', invalidStartWorkRes.status === 400);

  } finally {
    console.log('\n--- CLEANUP: Removing Ephemeral Test Entities ---');
    if (fileBId) await query('DELETE FROM submission_files WHERE id = $1', [fileBId]);
    if (subBId) await query('DELETE FROM submissions WHERE id = $1', [subBId]);
    const reqIds = [ticketBId, newTicketBId, completedTicketBId].filter(Boolean);
    if (reqIds.length > 0) {
      await query('DELETE FROM payments WHERE request_id = ANY($1)', [reqIds]);
      await query('DELETE FROM messages WHERE request_id = ANY($1)', [reqIds]);
      await query('DELETE FROM activity_logs WHERE request_id = ANY($1)', [reqIds]);
      await query('DELETE FROM notifications WHERE ticket_id = ANY($1)', [reqIds]);
      await query('DELETE FROM requests WHERE id = ANY($1)', [reqIds]);
    }
    if (notifBId) await query('DELETE FROM notifications WHERE id = $1', [notifBId]);
    if (leadBId) await query('DELETE FROM company_leads WHERE id = $1', [leadBId]);
    if (compAId || compBId) {
      const cIds = [compAId, compBId].filter(Boolean);
      await query('DELETE FROM activity_logs WHERE company_id = ANY($1)', [cIds]);
      await query('DELETE FROM company_leads WHERE company_id = ANY($1)', [cIds]);
      await query('DELETE FROM company_key_people WHERE company_id = ANY($1)', [cIds]);
    }
    if (userAId) await query('DELETE FROM users WHERE id = $1', [userAId]);
    if (userBId) await query('DELETE FROM users WHERE id = $1', [userBId]);
    if (leadSpecialistId) await query('DELETE FROM users WHERE id = $1', [leadSpecialistId]);
    if (compAId) await query('DELETE FROM companies WHERE id = $1', [compAId]);
    if (compBId) await query('DELETE FROM companies WHERE id = $1', [compBId]);
    console.log('Cleanup finished.\n');
  }

  console.log('================================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTenantIsolationSuite().catch(err => {
  console.error('[FATAL SUITE ERROR]:', err);
  process.exit(1);
});
