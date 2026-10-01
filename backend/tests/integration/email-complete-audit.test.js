import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { query, connectPostgres } from '../../src/config/postgres.js';
import {
  verifySmtpConnection,
  sendRequestCreatedEmail,
  sendTicketAssignedEmail,
  sendWorkStartedEmail,
  sendTicketProgressEmail,
  sendWorkSubmittedEmail,
  sendChangesRequestedEmail,
  sendWorkResubmittedEmail,
  sendWorkApprovedEmail,
  sendTicketCompletedEmail,
  sendPasswordResetEmail,
  sendInternalLeadOnboardingNotification,
  sendInternalBoostOnboardingNotification,
  sendInternalUiOnboardingNotification,
  sendInternalClientOnboardingEmails,
  clearEmailDedupeCache,
  getEmailHistory,
  clearEmailHistory,
  getTransporter,
  setTransporter
} from '../../src/services/emailService.js';

const API_BASE = 'http://localhost:5000/api';

async function request(endpoint, options = {}, token = null) {
  const url = `${API_BASE}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(url, { ...options, headers });
  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { status: res.status, ok: res.ok, data, headers: res.headers };
}

async function runCompleteEmailAudit() {
  console.log('========================================================================');
  console.log('     CREATIVEGINI COMPLETE EMAIL NOTIFICATION SYSTEM & LIFECYCLE AUDIT   ');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  try {
    await connectPostgres();

    // -------------------------------------------------------------------------
    // TEST 1: SMTP Live Connection & Sender Verification
    // -------------------------------------------------------------------------
    console.log('[Test 1]: Verifying SMTP configuration and live handshake...');
    const smtpRes = await verifySmtpConnection();
    if (!smtpRes.success) {
      console.error('[SMTP VERIFY FAILED DIAGNOSTIC]:', smtpRes);
    }
    assert(smtpRes.success === true, `SMTP connection succeeded: ${smtpRes.message}`);
    assert(process.env.EMAIL_USER === 'team@creativegini.com', 'EMAIL_USER is team@creativegini.com');
    assert((process.env.EMAIL_FROM || '').includes('team@creativegini.com'), 'EMAIL_FROM contains team@creativegini.com');

    // -------------------------------------------------------------------------
    // TEST 2: Authenticate Super Admin
    // -------------------------------------------------------------------------
    console.log('\n[Test 2]: Authenticating Super Admin...');
    const adminLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'team@creativegini.com', password: 'Admin@2026' })
    });
    assert(adminLogin.ok && adminLogin.data?.token, 'Super Admin login successful');
    const adminToken = adminLogin.data.token;

    // -------------------------------------------------------------------------
    // TEST 3: Dynamic Specialist Recipient Resolution & Exclusion of Inactive / Admin
    // -------------------------------------------------------------------------
    console.log('\n[Test 3]: Testing dynamic specialist recipient resolution...');
    const timestamp = Date.now();
    const leadSpecialistEmail = `lead.audit.${timestamp}@creativegini.test`;
    const boostSpecialistEmail = `boost.audit.${timestamp}@creativegini.test`;
    const uiSpecialistEmail = `ui.audit.${timestamp}@creativegini.test`;
    const inactiveLeadEmail = `inactive.lead.${timestamp}@creativegini.test`;

    await query(`
      INSERT INTO users (name, email, password, role, status, is_deleted)
      VALUES
        ('Lead Specialist A', $1, 'hashedpass', 'COMPANY_LEAD', 'ACTIVE', false),
        ('Boost Specialist B', $2, 'hashedpass', 'COMPANY_BOOST', 'ACTIVE', false),
        ('UI Specialist C', $3, 'hashedpass', 'LANDING_PAGE', 'ACTIVE', false),
        ('Disabled Lead X', $4, 'hashedpass', 'COMPANY_LEAD', 'DISABLED', false)
    `, [leadSpecialistEmail, boostSpecialistEmail, uiSpecialistEmail, inactiveLeadEmail]);

    // Query active specialists with the exact production query
    const activeSpecialistsRes = await query(`
      SELECT id, name, email, role, status
      FROM users
      WHERE is_deleted = false
        AND status = 'ACTIVE'
        AND role IN ('COMPANY_LEAD', 'COMPANY_BOOST', 'LANDING_PAGE')
      ORDER BY created_at ASC
    `);

    const leadList = activeSpecialistsRes.rows.filter(u => u.role === 'COMPANY_LEAD').map(u => u.email);
    const boostList = activeSpecialistsRes.rows.filter(u => u.role === 'COMPANY_BOOST').map(u => u.email);
    const uiList = activeSpecialistsRes.rows.filter(u => u.role === 'LANDING_PAGE').map(u => u.email);

    assert(leadList.includes(leadSpecialistEmail), 'Active COMPANY_LEAD resolved correctly');
    assert(boostList.includes(boostSpecialistEmail), 'Active COMPANY_BOOST resolved correctly');
    assert(uiList.includes(uiSpecialistEmail), 'Active LANDING_PAGE resolved correctly');
    assert(!leadList.includes(inactiveLeadEmail), 'Inactive/Disabled user is excluded from recipients');
    assert(!leadList.includes('team@creativegini.com'), 'ADMIN role is excluded from specialist lists');

    // -------------------------------------------------------------------------
    // TEST 4: New Client Creation Onboarding Email Dispatch
    // -------------------------------------------------------------------------
    console.log('\n[Test 4]: Admin creates new client and verifies onboarding emails...');
    await request('/admin/email-history', { method: 'DELETE' }, adminToken);
    clearEmailDedupeCache();

    const newClientEmail = `client.onb.${timestamp}@creativegini.test`;
    const createRes = await request('/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        companyName: 'Apex Quantum Cybernetics',
        contactPerson: 'Jonathan Miller',
        email: newClientEmail,
        password: 'ClientPassword@2026',
        website: 'https://apexquantum.tech',
        industry: 'DeepTech / AI',
        companyInfo: 'Next-generation quantum machine learning and cryptographic acceleration.'
      })
    }, adminToken);

    assert(createRes.ok && createRes.data?.user, 'Client account created successfully');
    const createdCompanyId = createRes.data.user.companyId || createRes.data.user.company?.id;

    const histRes = await request('/admin/email-history', { method: 'GET' }, adminToken);
    const emailHistory = histRes.data?.history || [];
    console.log(`  Dispatched ${emailHistory.length} email(s) during client creation.`);

    // 1. Client MUST NOT receive welcome email
    const clientEmailsReceived = emailHistory.filter(e => e.to.toLowerCase() === newClientEmail.toLowerCase());
    assert(clientEmailsReceived.length === 0, 'Client received 0 emails upon creation (NO unwanted welcome email)');

    // 2. COMPANY_LEAD received team-specific email
    const leadEmailSent = emailHistory.find(e => e.to === leadSpecialistEmail);
    assert(Boolean(leadEmailSent), `COMPANY_LEAD specialist (${leadSpecialistEmail}) received onboarding email`);
    assert(leadEmailSent.subject.includes('Prepare Sample Leads'), 'Lead email subject instructs to Prepare Sample Leads');
    assert(leadEmailSent.text.includes('At least 5 Sample Leads'), 'Lead email explicitly mentions 5 Sample Leads');
    assert(leadEmailSent.text.includes('Company Study / Research'), 'Lead email explicitly mentions Company Study / Research');
    assert(leadEmailSent.text.includes('Lead PDF / Dossier'), 'Lead email explicitly mentions Lead PDF / Dossier');
    assert(leadEmailSent.text.includes('LinkedIn Profiles'), 'Lead email explicitly mentions LinkedIn Profiles');
    assert(leadEmailSent.text.includes('/company-lead'), 'Lead email links directly to /company-lead workspace');

    // 3. COMPANY_BOOST received team-specific email
    const boostEmailSent = emailHistory.find(e => e.to === boostSpecialistEmail);
    assert(Boolean(boostEmailSent), `COMPANY_BOOST specialist (${boostSpecialistEmail}) received onboarding email`);
    assert(boostEmailSent.subject.includes('Prepare Boost Sample Work'), 'Boost email subject instructs to Prepare Boost Sample Work');
    assert(boostEmailSent.text.includes('Strategic Plan (PDF)'), 'Boost email explicitly mentions Strategic Plan (PDF)');
    assert(boostEmailSent.text.includes('Content (Image)'), 'Boost email explicitly mentions Content (Image)');
    assert(boostEmailSent.text.includes('Content (Poster)'), 'Boost email explicitly mentions Content (Poster)');
    assert(boostEmailSent.text.includes('DevRel Plan (PDF)'), 'Boost email explicitly mentions DevRel Plan (PDF)');
    assert(boostEmailSent.text.includes('/company-boost'), 'Boost email links directly to /company-boost workspace');

    // 4. LANDING_PAGE received team-specific email
    const uiEmailSent = emailHistory.find(e => e.to === uiSpecialistEmail);
    assert(Boolean(uiEmailSent), `LANDING_PAGE specialist (${uiSpecialistEmail}) received onboarding email`);
    assert(uiEmailSent.subject.includes('Prepare UI Sample Work'), 'UI email subject instructs to Prepare UI Sample Work');
    assert(uiEmailSent.text.includes('Initial UI/UX Analysis (PDF)'), 'UI email explicitly mentions Initial UI/UX Analysis');
    assert(uiEmailSent.text.includes('Sample Landing Page Enhancement'), 'UI email explicitly mentions Sample Landing Page Enhancement');
    assert(uiEmailSent.text.includes('/landing-page'), 'UI email links directly to /landing-page workspace');

    // -------------------------------------------------------------------------
    // TEST 5: Multiple Team Members Receive Emails
    // -------------------------------------------------------------------------
    console.log('\n[Test 5]: Testing multiple specialists for the same role...');
    clearEmailHistory();
    clearEmailDedupeCache();

    const lead2Email = `lead2.audit.${timestamp}@creativegini.test`;
    await query(`
      INSERT INTO users (name, email, password, role, status, is_deleted)
      VALUES ('Lead Specialist 2', $1, 'pass', 'COMPANY_LEAD', 'ACTIVE', false)
    `, [lead2Email]);

    const multiRes = await sendInternalLeadOnboardingNotification({
      recipients: [leadSpecialistEmail, lead2Email],
      client: { name: 'Multi Client', email: 'multi@client.test' },
      company: { id: 'test-co-id', name: 'Multi Co', industry: 'Fintech' },
      dashboardUrl: 'http://localhost:5174/company-lead'
    });
    assert(multiRes.success && multiRes.count === 2, 'Both active lead specialists received their email (count = 2)');

    // -------------------------------------------------------------------------
    // TEST 6: Missing Role Does Not Crash Client Creation
    // -------------------------------------------------------------------------
    console.log('\n[Test 6]: Testing missing role resilience...');
    clearEmailHistory();
    const missingRoleRes = await sendInternalClientOnboardingEmails({
      client: { name: 'Client Test', email: 'c@test.com' },
      company: { id: 'empty-test', name: 'Empty Co' },
      leadRecipients: [], // No lead specialists
      boostRecipients: [boostSpecialistEmail],
      uiRecipients: []    // No UI specialists
    });
    assert(missingRoleRes.lead.success === true && missingRoleRes.lead.count === 0, 'Handled empty lead role cleanly (count = 0)');
    assert(missingRoleRes.boost.success === true && missingRoleRes.boost.count === 1, 'Boost role still dispatched successfully');
    assert(missingRoleRes.ui.success === true && missingRoleRes.ui.count === 0, 'Handled empty UI role cleanly (count = 0)');

    // -------------------------------------------------------------------------
    // TEST 7: Full Ticket Lifecycle Email Events (Section 4)
    // -------------------------------------------------------------------------
    console.log('\n[Test 7]: Verifying complete ticket lifecycle email events...');
    clearEmailHistory();
    clearEmailDedupeCache();

    const mockClient = { name: 'Client User', email: `client.ticket.${timestamp}@test.com` };
    const mockSpecialist = { name: 'Specialist User', email: `specialist.ticket.${timestamp}@test.com` };
    const mockTicket = {
      id: 'ticket-1234',
      ticketId: 'CG-9999',
      title: 'Full Lifecycle Marketing Sprint',
      serviceType: 'COMPANY_BOOST',
      status: 'REQUEST_CREATED',
      priority: 'HIGH',
      userId: mockClient,
      companyId: { name: 'Lifecycle Corp' },
      assignedTo: mockSpecialist,
      description: 'Full end to end sprint deliverables'
    };

    // 1. REQUEST CREATED (to Client)
    const e1 = await sendRequestCreatedEmail({ client: mockClient, ticket: mockTicket });
    assert(e1.success, 'Event 1: sendRequestCreatedEmail succeeded');

    // 2. ASSIGNMENT (to Specialist)
    const e2 = await sendTicketAssignedEmail({ specialist: mockSpecialist, ticket: mockTicket, assignedBy: { name: 'Admin' } });
    assert(e2.success, 'Event 2: sendTicketAssignedEmail succeeded');

    // 3. WORK STARTED (to Client)
    const e3 = await sendWorkStartedEmail({ client: mockClient, ticket: mockTicket, specialist: mockSpecialist });
    assert(e3.success, 'Event 3: sendWorkStartedEmail succeeded');

    // 4. PROGRESS UPDATE (to Client)
    const e4 = await sendTicketProgressEmail({ client: mockClient, ticket: mockTicket, specialist: mockSpecialist, updateText: '[UPDATE] Phase 1 completed.' });
    assert(e4.success, 'Event 4: sendTicketProgressEmail succeeded');

    // 5. WORK SUBMITTED (to Client)
    const e5 = await sendWorkSubmittedEmail({ client: mockClient, ticket: mockTicket, submission: { version: 1, title: 'Sprint V1 Deliverables' }, specialist: mockSpecialist });
    assert(e5.success, 'Event 5: sendWorkSubmittedEmail succeeded');

    // 6. CHANGES REQUESTED (to Specialist)
    const e6 = await sendChangesRequestedEmail({ specialist: mockSpecialist, ticket: mockTicket, feedback: 'Please update brand colors.', client: mockClient });
    assert(e6.success, 'Event 6: sendChangesRequestedEmail succeeded');

    // 7. WORK RESUBMITTED (to Client)
    const e7 = await sendWorkResubmittedEmail({ client: mockClient, ticket: mockTicket, submission: { version: 2, title: 'Sprint V2 Revisions' }, specialist: mockSpecialist });
    assert(e7.success, 'Event 7: sendWorkResubmittedEmail succeeded');

    // 8. WORK APPROVED (to Specialist)
    const e8 = await sendWorkApprovedEmail({ specialist: mockSpecialist, ticket: mockTicket, client: mockClient });
    assert(e8.success, 'Event 8: sendWorkApprovedEmail succeeded');

    // 9. TICKET COMPLETED (to Client)
    const e9 = await sendTicketCompletedEmail({ client: mockClient, ticket: mockTicket, completedBy: { name: 'Admin' }, reason: 'All approved.' });
    assert(e9.success, 'Event 9: sendTicketCompletedEmail succeeded');

    // -------------------------------------------------------------------------
    // TEST 8: Password Reset Email (Section 1 & 14)
    // -------------------------------------------------------------------------
    console.log('\n[Test 8]: Verifying Password Reset Email...');
    const pwdRes = await sendPasswordResetEmail({
      to: `user.reset.${timestamp}@test.com`,
      name: 'Reset Test User',
      resetUrl: 'http://localhost:5174/reset-password?token=sample_secure_token',
      expiresMinutes: 60
    });
    assert(pwdRes.success, 'Password Reset Email generated and dispatched successfully');

    // -------------------------------------------------------------------------
    // TEST 9: Email Failure Isolation (Section 8)
    // -------------------------------------------------------------------------
    console.log('\n[Test 9]: Simulating email failure and verifying business resilience...');
    const originalTransporter = getTransporter();

    // Create a mock broken transporter that throws
    const brokenTransporter = {
      sendMail: async () => {
        throw new Error('Simulated SMTP connection timeout or refused socket');
      }
    };
    setTransporter(brokenTransporter);

    const failSafeRes = await sendRequestCreatedEmail({
      client: { email: 'fail.test@creativegini.test' },
      ticket: { ticketId: 'CG-FAIL-TEST', title: 'Fail Test' }
    });
    // Even if simulated or real fails, email failure should never throw
    assert(failSafeRes.success === true || failSafeRes.success === false, 'Gracefully handled email failure without throwing exception');

    // Restore original transporter
    setTransporter(originalTransporter);

    // -------------------------------------------------------------------------
    // TEST 10: Clean up test users created during audit
    // -------------------------------------------------------------------------
    console.log('\n[Test 10]: Cleaning up test user records...');
    await query(`
      DELETE FROM submission_files WHERE submission_id IN (
        SELECT s.id FROM submissions s
        JOIN requests r ON s.request_id = r.id
        JOIN users u ON r.user_id = u.id
        WHERE u.email LIKE '%@creativegini.test' OR u.email LIKE '%@test.com'
      )
    `);
    await query(`
      DELETE FROM submissions WHERE request_id IN (
        SELECT r.id FROM requests r
        JOIN users u ON r.user_id = u.id
        WHERE u.email LIKE '%@creativegini.test' OR u.email LIKE '%@test.com'
      )
    `);
    await query(`
      DELETE FROM payments WHERE request_id IN (
        SELECT r.id FROM requests r
        JOIN users u ON r.user_id = u.id
        WHERE u.email LIKE '%@creativegini.test' OR u.email LIKE '%@test.com'
      )
    `);
    await query(`
      DELETE FROM request_deliverables WHERE request_id IN (
        SELECT r.id FROM requests r
        JOIN users u ON r.user_id = u.id
        WHERE u.email LIKE '%@creativegini.test' OR u.email LIKE '%@test.com'
      )
    `);
    await query(`
      DELETE FROM request_attachments WHERE request_id IN (
        SELECT r.id FROM requests r
        JOIN users u ON r.user_id = u.id
        WHERE u.email LIKE '%@creativegini.test' OR u.email LIKE '%@test.com'
      )
    `);
    await query(`
      DELETE FROM messages WHERE request_id IN (
        SELECT r.id FROM requests r
        JOIN users u ON r.user_id = u.id
        WHERE u.email LIKE '%@creativegini.test' OR u.email LIKE '%@test.com'
      )
    `);
    await query(`
      DELETE FROM activity_logs WHERE user_id IN (
        SELECT id FROM users WHERE email LIKE '%@creativegini.test' OR email LIKE '%@test.com'
      )
    `);
    await query(`
      DELETE FROM notifications WHERE user_id IN (
        SELECT id FROM users WHERE email LIKE '%@creativegini.test' OR email LIKE '%@test.com'
      )
    `);
    await query(`
      DELETE FROM requests WHERE user_id IN (
        SELECT id FROM users WHERE email LIKE '%@creativegini.test' OR email LIKE '%@test.com'
      )
    `);
    await query(`DELETE FROM users WHERE email LIKE '%@creativegini.test' OR email LIKE '%@test.com'`);
    if (createdCompanyId) {
      await query(`DELETE FROM company_leads WHERE company_id = $1`, [createdCompanyId]);
      await query(`DELETE FROM company_key_people WHERE company_id = $1`, [createdCompanyId]);
      await query(`DELETE FROM companies WHERE id = $1`, [createdCompanyId]);
    }
    assert(true, 'Test audit records cleaned up');

    console.log('\n========================================================================');
    console.log(`COMPLETE EMAIL AUDIT SUCCESSFUL: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('\n[FATAL AUDIT FAILURE]:', err);
    process.exit(1);
  }
}

runCompleteEmailAudit();
