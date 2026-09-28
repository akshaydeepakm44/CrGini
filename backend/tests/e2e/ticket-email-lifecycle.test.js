import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { query, connectPostgres } from '../../src/config/postgres.js';
import bcrypt from 'bcryptjs';
import {
  clearEmailDedupeCache,
  verifySmtpConnection,
  getTicketUrl,
  formatServiceType,
  setTransporter,
  resetTransporter,
  sendWorkApprovedEmail,
  sendRequestCreatedEmail
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
  return { status: res.status, ok: res.ok, data };
}

async function getRemoteEmailHistory(token) {
  const res = await request('/admin/email-history', { method: 'GET' }, token);
  return res.data?.history || [];
}

async function clearRemoteEmailHistory(token) {
  await request('/admin/email-history', { method: 'DELETE' }, token);
}

async function runTicketEmailLifecycleSuite() {
  console.log('================================================================');
  console.log('CREATIVEGINI COMPLETE TICKET EMAIL NOTIFICATION LIFECYCLE TEST');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  const testTimestamp = Date.now();
  const clientEmail = `client.lifecycle.${testTimestamp}@creativegini.test`;
  const specialist1Email = `specialist1.lifecycle.${testTimestamp}@creativegini.test`;
  const specialist2Email = `specialist2.lifecycle.${testTimestamp}@creativegini.test`;
  const clientName = 'Alex Mercer';
  const companyName = `Apex Global Innovations ${testTimestamp}`;
  const specialist1Name = 'Elena Rostova (Lead Specialist)';
  const specialist2Name = 'Marcus Vance (Secondary Specialist)';
  const testPassword = 'Password@2026!';

  let adminToken = null;
  let clientToken = null;
  let specialist1Token = null;
  let specialist2Token = null;

  let clientUserId = null;
  let clientCompanyId = null;
  let specialist1UserId = null;
  let specialist2UserId = null;

  let createdRequestId = null;
  let createdTicketCode = null;
  let v1SubmissionId = null;
  let v2SubmissionId = null;

  try {
    await connectPostgres();

    // ------------------------------------------------------------------------
    // SETUP: Authenticate Admin
    // ------------------------------------------------------------------------
    console.log('[Setup 1]: Authenticating Admin (team@creativegini.com)...');
    const adminLoginRes = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'team@creativegini.com', password: 'Admin@2026' })
    });

    if (!adminLoginRes.ok || !adminLoginRes.data?.token) {
      throw new Error(`Admin login failed: ${adminLoginRes.data?.message || adminLoginRes.status}`);
    }
    adminToken = adminLoginRes.data.token;
    console.log('  ✓ Admin authenticated successfully.\n');

    // Reset dedupe cache & email history for fresh test run
    clearEmailDedupeCache();
    await clearRemoteEmailHistory(adminToken);

    // ------------------------------------------------------------------------
    // STEP 1: Create Client User
    // ------------------------------------------------------------------------
    console.log('[Step 1]: Admin creates client user and company profile...');
    const createClientRes = await request('/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        companyName,
        contactPerson: clientName,
        email: clientEmail,
        phone: '+1 555-0144',
        website: 'https://apexglobal.example.com',
        industry: 'B2B Enterprise Technology',
        location: 'San Francisco, CA',
        plan: 'CUSTOM',
        password: testPassword
      })
    }, adminToken);

    if (!createClientRes.ok || !createClientRes.data?.user) {
      throw new Error(`Failed to create client user: ${createClientRes.data?.message || createClientRes.status}`);
    }
    clientUserId = createClientRes.data.user.id;
    clientCompanyId = createClientRes.data.user.companyId?.id || createClientRes.data.user.companyId;
    console.log(`  ✓ Client created: ${clientEmail} (ID: ${clientUserId})`);

    // Login as Client to obtain token
    const clientLoginRes = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: clientEmail, password: testPassword })
    });
    if (!clientLoginRes.ok || !clientLoginRes.data?.token) {
      throw new Error(`Client login failed: ${clientLoginRes.data?.message || clientLoginRes.status}`);
    }
    clientToken = clientLoginRes.data.token;
    console.log('  ✓ Client logged in successfully and obtained JWT token.\n');
    passed++;

    // ------------------------------------------------------------------------
    // STEP 2: Create Team Member (Specialist 1 & Specialist 2)
    // ------------------------------------------------------------------------
    console.log('[Step 2]: Creating team specialists with COMPANY_LEAD permissions...');
    const hashedSpecPassword = await bcrypt.hash(testPassword, 10);
    
    // Create Specialist 1
    const spec1Create = await query(`
      INSERT INTO users (email, password, name, role, company_lead, company_boost, company_ui, status, created_at, updated_at)
      VALUES ($1, $2, $3, 'COMPANY_LEAD', true, false, false, 'ACTIVE', NOW(), NOW())
      RETURNING id, email, name, role
    `, [
      specialist1Email,
      hashedSpecPassword,
      specialist1Name
    ]);
    specialist1UserId = spec1Create.rows[0].id;

    // Create Specialist 2 for reassignment test
    const spec2Create = await query(`
      INSERT INTO users (email, password, name, role, company_lead, company_boost, company_ui, status, created_at, updated_at)
      VALUES ($1, $2, $3, 'COMPANY_LEAD', true, false, false, 'ACTIVE', NOW(), NOW())
      RETURNING id, email, name, role
    `, [
      specialist2Email,
      hashedSpecPassword,
      specialist2Name
    ]);
    specialist2UserId = spec2Create.rows[0].id;

    // Login as Specialist 1
    const spec1Login = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: specialist1Email, password: testPassword })
    });
    if (!spec1Login.ok || !spec1Login.data?.token) {
      throw new Error(`Specialist 1 login failed: ${spec1Login.data?.message || spec1Login.status}`);
    }
    specialist1Token = spec1Login.data.token;

    // Login as Specialist 2
    const spec2Login = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: specialist2Email, password: testPassword })
    });
    if (!spec2Login.ok || !spec2Login.data?.token) {
      throw new Error(`Specialist 2 login failed: ${spec2Login.data?.message || spec2Login.status}`);
    }
    specialist2Token = spec2Login.data.token;

    console.log(`  ✓ Specialist 1 created & authenticated: ${specialist1Email}`);
    console.log(`  ✓ Specialist 2 created & authenticated: ${specialist2Email}\n`);
    passed++;

    // ------------------------------------------------------------------------
    // STEP 3 & 5: Create Request as User & Verify User Request-Created Email
    // ------------------------------------------------------------------------
    console.log('[Step 3 & 5]: Client creates service request ticket & verifies REQUEST_CREATED email...');
    await clearRemoteEmailHistory(adminToken);

    const createRequestRes = await request('/requests', {
      method: 'POST',
      body: JSON.stringify({
        serviceType: 'COMPANY_LEAD',
        title: 'B2B Enterprise Prospecting & Outreach Sprint',
        description: 'Target 500 VP-level decision makers in North America enterprise SaaS.',
        priority: 'HIGH',
        price: 499
      })
    }, clientToken);

    if (!createRequestRes.ok || !createRequestRes.data?.request) {
      throw new Error(`Failed to create request: ${createRequestRes.data?.message || createRequestRes.status}`);
    }

    const createdReq = createRequestRes.data.request;
    createdRequestId = createdReq.id || createdReq._id;
    createdTicketCode = createdReq.ticketId;
    console.log(`  ✓ Ticket created: ${createdTicketCode} (Status: ${createdReq.status})`);

    // Verify REQUEST_CREATED email event in history
    const history1 = await getRemoteEmailHistory(adminToken);
    const reqCreatedEmail = history1.find(e => e.event === 'REQUEST_CREATED');

    if (!reqCreatedEmail) {
      throw new Error(`REQUEST_CREATED email event was not triggered! Recorded events: ${JSON.stringify(history1.map(e => e.event))}`);
    }

    if (reqCreatedEmail.to !== clientEmail) {
      throw new Error(`REQUEST_CREATED email went to wrong recipient: ${reqCreatedEmail.to}, expected: ${clientEmail}`);
    }

    if (!reqCreatedEmail.subject.includes(createdTicketCode)) {
      throw new Error(`REQUEST_CREATED email subject does not contain ticketId: ${reqCreatedEmail.subject}`);
    }

    console.log(`  ✓ [EMAIL EVENT VERIFIED] REQUEST_CREATED sent to USER: ${reqCreatedEmail.to}`);
    console.log(`    Subject: "${reqCreatedEmail.subject}"`);
    console.log(`    Direct link: ${getTicketUrl(createdTicketCode)}\n`);
    passed++;

    // ------------------------------------------------------------------------
    // STEP 4 & 6: Assign Ticket to Specialist & Verify TICKET_ASSIGNED Email
    // ------------------------------------------------------------------------
    console.log('[Step 4 & 6]: Admin assigns ticket to Specialist 1 & verifies TICKET_ASSIGNED email...');
    await clearRemoteEmailHistory(adminToken);

    const assignRes = await request(`/requests/${createdTicketCode}/assign`, {
      method: 'POST',
      body: JSON.stringify({
        assignedTo: specialist1UserId,
        assignedTeam: 'Company Lead Team',
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString()
      })
    }, adminToken);

    if (!assignRes.ok || !assignRes.data?.request) {
      throw new Error(`Failed to assign ticket: ${assignRes.data?.message || assignRes.status}`);
    }

    const assignedTicket = assignRes.data.request;
    console.log(`  ✓ Ticket assigned to Specialist 1. Status: ${assignedTicket.status}`);

    const history2 = await getRemoteEmailHistory(adminToken);
    const assignedEmail = history2.find(e => e.event === 'TICKET_ASSIGNED');

    if (!assignedEmail) {
      throw new Error(`TICKET_ASSIGNED email was not triggered! Recorded: ${JSON.stringify(history2.map(e => e.event))}`);
    }

    if (assignedEmail.to !== specialist1Email) {
      throw new Error(`TICKET_ASSIGNED email went to wrong recipient: ${assignedEmail.to}, expected: ${specialist1Email}`);
    }

    if (!assignedEmail.subject.includes(createdTicketCode)) {
      throw new Error(`TICKET_ASSIGNED subject missing ticketId: ${assignedEmail.subject}`);
    }

    console.log(`  ✓ [EMAIL EVENT VERIFIED] TICKET_ASSIGNED sent to TEAM MEMBER: ${assignedEmail.to}`);
    console.log(`    Subject: "${assignedEmail.subject}"`);
    console.log(`    Direct link: ${getTicketUrl(createdTicketCode)}\n`);
    passed++;

    // ------------------------------------------------------------------------
    // REASSIGNMENT TEST: Reassign to Specialist 2 & Verify Only New Assignee Notified
    // ------------------------------------------------------------------------
    console.log('[Reassignment Test]: Reassigning ticket to Specialist 2...');
    await clearRemoteEmailHistory(adminToken);

    const reassignRes = await request(`/requests/${createdTicketCode}/assign`, {
      method: 'POST',
      body: JSON.stringify({
        assignedTo: specialist2UserId,
        assignedTeam: 'Company Lead Team'
      })
    }, adminToken);

    if (!reassignRes.ok) {
      throw new Error(`Reassignment failed: ${reassignRes.data?.message}`);
    }

    const historyReassign = await getRemoteEmailHistory(adminToken);
    const reassignEmail = historyReassign.find(e => e.event === 'TICKET_ASSIGNED' && e.to === specialist2Email);
    const oldAssigneeEmail = historyReassign.find(e => e.event === 'TICKET_ASSIGNED' && e.to === specialist1Email);

    if (!reassignEmail) {
      throw new Error('New assignee did not receive TICKET_ASSIGNED email on reassignment');
    }
    if (oldAssigneeEmail) {
      throw new Error('Previous assignee incorrectly received a duplicate assignment email');
    }

    console.log(`  ✓ [REASSIGNMENT VERIFIED] Notified new assignee: ${specialist2Email}`);
    console.log(`  ✓ Old assignee was not sent a duplicate email.\n`);
    passed++;

    // Reassign back to Specialist 1 for the rest of the flow
    clearEmailDedupeCache();
    await request(`/requests/${createdTicketCode}/assign`, {
      method: 'POST',
      body: JSON.stringify({ assignedTo: specialist1UserId, assignedTeam: 'Company Lead Team' })
    }, adminToken);

    // ------------------------------------------------------------------------
    // STEP 7 & 8: Start Work & Verify User WORK_STARTED Email
    // ------------------------------------------------------------------------
    console.log('[Step 7 & 8]: Specialist starts work & verifies WORK_STARTED email to USER...');
    await clearRemoteEmailHistory(adminToken);

    const startWorkRes = await request(`/requests/${createdTicketCode}/start-work`, {
      method: 'POST',
      body: JSON.stringify({})
    }, specialist1Token);

    if (!startWorkRes.ok) {
      throw new Error(`Start work failed: ${startWorkRes.data?.message || startWorkRes.status}`);
    }

    const history3 = await getRemoteEmailHistory(adminToken);
    const workStartedEmail = history3.find(e => e.event === 'WORK_STARTED');

    if (!workStartedEmail) {
      throw new Error(`WORK_STARTED email event not triggered! Recorded: ${JSON.stringify(history3.map(e => e.event))}`);
    }

    if (workStartedEmail.to !== clientEmail) {
      throw new Error(`WORK_STARTED sent to wrong recipient: ${workStartedEmail.to}, expected: ${clientEmail}`);
    }

    console.log(`  ✓ [EMAIL EVENT VERIFIED] WORK_STARTED sent to USER: ${workStartedEmail.to}`);
    console.log(`    Subject: "${workStartedEmail.subject}"`);
    console.log(`    Direct link: ${getTicketUrl(createdTicketCode)}\n`);
    passed++;

    // ------------------------------------------------------------------------
    // STEP 9 & 10: Send Progress Update & Verify User TICKET_PROGRESS Email
    // ------------------------------------------------------------------------
    console.log('[Step 9 & 10]: Specialist sends meaningful progress update & verifies TICKET_PROGRESS email...');
    await clearRemoteEmailHistory(adminToken);

    // 1. Regular chat message - should NOT send an email
    const normalChatRes = await request(`/requests/${createdTicketCode}/messages`, {
      method: 'POST',
      body: JSON.stringify({ text: 'Hello, could you confirm if you have any excluded accounts?' })
    }, specialist1Token);

    if (!normalChatRes.ok) {
      throw new Error(`Failed to send chat message: ${normalChatRes.data?.message}`);
    }

    const chatHistory = await getRemoteEmailHistory(adminToken);
    const unwantedChatEmail = chatHistory.find(e => e.event === 'TICKET_PROGRESS');
    if (unwantedChatEmail) {
      throw new Error('An email was unexpectedly dispatched for a standard conversational chat message!');
    }
    console.log('  ✓ Normal chat message posted without triggering unwanted progress email.');

    // 2. Explicit progress update - MUST send progress email
    const updateText = 'Completed lead enrichment: 500 validated corporate emails and LinkedIn profiles ready.';
    const progressRes = await request(`/requests/${createdTicketCode}/messages`, {
      method: 'POST',
      body: JSON.stringify({ text: updateText, isProgressUpdate: true })
    }, specialist1Token);

    if (!progressRes.ok) {
      throw new Error(`Failed to post progress message: ${progressRes.data?.message}`);
    }

    const history4 = await getRemoteEmailHistory(adminToken);
    const progressEmail = history4.find(e => e.event === 'TICKET_PROGRESS');

    if (!progressEmail) {
      throw new Error(`TICKET_PROGRESS email was not triggered for explicit progress update!`);
    }

    if (progressEmail.to !== clientEmail) {
      throw new Error(`TICKET_PROGRESS went to wrong recipient: ${progressEmail.to}, expected: ${clientEmail}`);
    }

    console.log(`  ✓ [EMAIL EVENT VERIFIED] TICKET_PROGRESS sent to USER: ${progressEmail.to}`);
    console.log(`    Subject: "${progressEmail.subject}"`);
    console.log(`    Direct link: ${getTicketUrl(createdTicketCode, 'chat')}\n`);
    passed++;

    // ------------------------------------------------------------------------
    // STEP 11 & 12: Submit V1 Deliverables & Verify User WORK_SUBMITTED Email
    // ------------------------------------------------------------------------
    console.log('[Step 11 & 12]: Specialist submits V1 deliverables & verifies WORK_SUBMITTED email...');
    await clearRemoteEmailHistory(adminToken);

    const submitV1Res = await request(`/requests/${createdTicketCode}/submissions`, {
      method: 'POST',
      body: JSON.stringify({
        title: 'Initial Prospect Lead Target Database',
        description: 'Complete verified list of 500 Enterprise SaaS decision makers with phone numbers.',
        externalLink: 'https://docs.google.com/spreadsheets/d/test-cg-leads-v1',
        files: [
          { name: 'enterprise-leads-v1.csv', url: 'https://storage.creativegini.com/leads-v1.csv', size: 524288 },
          { name: 'outreach-sequences-v1.pdf', url: 'https://storage.creativegini.com/sequences-v1.pdf', size: 1048576 }
        ]
      })
    }, specialist1Token);

    if (!submitV1Res.ok || !submitV1Res.data?.submission) {
      throw new Error(`Failed to create V1 submission: ${submitV1Res.data?.message || submitV1Res.status}`);
    }

    v1SubmissionId = submitV1Res.data.submission._id || submitV1Res.data.submission.id;
    console.log(`  ✓ Submission V1 recorded (ID: ${v1SubmissionId})`);

    const history5 = await getRemoteEmailHistory(adminToken);
    const workSubmittedEmail = history5.find(e => e.event === 'WORK_SUBMITTED');

    if (!workSubmittedEmail) {
      throw new Error(`WORK_SUBMITTED email was not triggered! Recorded: ${JSON.stringify(history5.map(e => e.event))}`);
    }

    if (workSubmittedEmail.to !== clientEmail) {
      throw new Error(`WORK_SUBMITTED went to wrong recipient: ${workSubmittedEmail.to}, expected: ${clientEmail}`);
    }

    console.log(`  ✓ [EMAIL EVENT VERIFIED] WORK_SUBMITTED (V1) sent to USER: ${workSubmittedEmail.to}`);
    console.log(`    Subject: "${workSubmittedEmail.subject}"`);
    console.log(`    Direct link: ${getTicketUrl(createdTicketCode, 'review')}\n`);
    passed++;

    // ------------------------------------------------------------------------
    // STEP 13 & 14: Request Changes & Verify Team CHANGES_REQUESTED Email
    // ------------------------------------------------------------------------
    console.log('[Step 13 & 14]: Client requests changes & verifies CHANGES_REQUESTED email to specialist...');
    await clearRemoteEmailHistory(adminToken);

    const changeFeedback = 'Please narrow down the titles strictly to VP of Sales and Head of RevOps. Exclude EMEA leads.';
    const requestChangesRes = await request(`/requests/${createdTicketCode}/submissions/${v1SubmissionId}/request-changes`, {
      method: 'POST',
      body: JSON.stringify({ feedback: changeFeedback })
    }, clientToken);

    if (!requestChangesRes.ok) {
      throw new Error(`Request changes failed: ${requestChangesRes.data?.message || requestChangesRes.status}`);
    }

    const history6 = await getRemoteEmailHistory(adminToken);
    const changesEmail = history6.find(e => e.event === 'CHANGES_REQUESTED');

    if (!changesEmail) {
      throw new Error(`CHANGES_REQUESTED email was not triggered! Recorded: ${JSON.stringify(history6.map(e => e.event))}`);
    }

    if (changesEmail.to !== specialist1Email) {
      throw new Error(`CHANGES_REQUESTED went to wrong recipient: ${changesEmail.to}, expected: ${specialist1Email}`);
    }

    if (!changesEmail.subject.includes(createdTicketCode)) {
      throw new Error(`CHANGES_REQUESTED subject missing ticketId: ${changesEmail.subject}`);
    }

    console.log(`  ✓ [EMAIL EVENT VERIFIED] CHANGES_REQUESTED sent to TEAM MEMBER: ${changesEmail.to}`);
    console.log(`    Subject: "${changesEmail.subject}"`);
    console.log(`    Feedback included: "${changeFeedback}"`);
    console.log(`    Direct link: ${getTicketUrl(createdTicketCode, 'review')}\n`);
    passed++;

    // ------------------------------------------------------------------------
    // STEP 15 & 16: Resubmit V2 Deliverables & Verify User WORK_RESUBMITTED Email
    // ------------------------------------------------------------------------
    console.log('[Step 15 & 16]: Specialist resubmits V2 deliverables & verifies WORK_RESUBMITTED email...');
    await clearRemoteEmailHistory(adminToken);

    const submitV2Res = await request(`/requests/${createdTicketCode}/submissions`, {
      method: 'POST',
      body: JSON.stringify({
        title: 'Revised V2 Prospect Database (US VP Sales & RevOps only)',
        description: 'Filtered strictly to US Enterprise VP Sales and RevOps with verified mobile direct dials.',
        externalLink: 'https://docs.google.com/spreadsheets/d/test-cg-leads-v2',
        files: [
          { name: 'enterprise-leads-v2-us-sales.csv', url: 'https://storage.creativegini.com/leads-v2.csv', size: 786432 }
        ]
      })
    }, specialist1Token);

    if (!submitV2Res.ok || !submitV2Res.data?.submission) {
      throw new Error(`Failed to create V2 submission: ${submitV2Res.data?.message || submitV2Res.status}`);
    }

    v2SubmissionId = submitV2Res.data.submission._id || submitV2Res.data.submission.id;
    console.log(`  ✓ Submission V2 recorded (ID: ${v2SubmissionId}, Version: ${submitV2Res.data.submission.version})`);

    const history7 = await getRemoteEmailHistory(adminToken);
    const workResubmittedEmail = history7.find(e => e.event === 'WORK_RESUBMITTED');

    if (!workResubmittedEmail) {
      throw new Error(`WORK_RESUBMITTED email was not triggered! Recorded: ${JSON.stringify(history7.map(e => e.event))}`);
    }

    if (workResubmittedEmail.to !== clientEmail) {
      throw new Error(`WORK_RESUBMITTED went to wrong recipient: ${workResubmittedEmail.to}, expected: ${clientEmail}`);
    }

    console.log(`  ✓ [EMAIL EVENT VERIFIED] WORK_RESUBMITTED (V2) sent to USER: ${workResubmittedEmail.to}`);
    console.log(`    Subject: "${workResubmittedEmail.subject}"`);
    console.log(`    Direct link: ${getTicketUrl(createdTicketCode, 'review')}\n`);
    passed++;

    // ------------------------------------------------------------------------
    // STEP 17 & 18: Approve Work & Verify Team WORK_APPROVED Email
    // ------------------------------------------------------------------------
    console.log('[Step 17 & 18]: Client approves V2 deliverables & verifies WORK_APPROVED email...');
    await clearRemoteEmailHistory(adminToken);

    const approveRes = await request(`/requests/${createdTicketCode}/submissions/${v2SubmissionId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ feedback: 'Deliverables inspected and fully approved. Exceptional work!' })
    }, clientToken);

    if (!approveRes.ok) {
      throw new Error(`Approve submission failed: ${approveRes.data?.message || approveRes.status}`);
    }

    const history8 = await getRemoteEmailHistory(adminToken);
    const workApprovedEmail = history8.find(e => e.event === 'WORK_APPROVED');

    if (!workApprovedEmail) {
      throw new Error(`WORK_APPROVED email was not triggered! Recorded: ${JSON.stringify(history8.map(e => e.event))}`);
    }

    if (workApprovedEmail.to !== specialist1Email) {
      throw new Error(`WORK_APPROVED sent to wrong recipient: ${workApprovedEmail.to}, expected: ${specialist1Email}`);
    }

    console.log(`  ✓ [EMAIL EVENT VERIFIED] WORK_APPROVED sent to TEAM MEMBER: ${workApprovedEmail.to}`);
    console.log(`    Subject: "${workApprovedEmail.subject}"`);
    console.log(`    Direct link: ${getTicketUrl(createdTicketCode)}\n`);
    passed++;

    // ------------------------------------------------------------------------
    // STEP 19 & 20: Ticket Completed & Verify User TICKET_COMPLETED Email
    // ------------------------------------------------------------------------
    console.log('[Step 19 & 20]: Verifying TICKET_COMPLETED email to USER...');
    
    // In approveSubmission, TICKET_COMPLETED is dispatched to client simultaneously with WORK_APPROVED
    const completedEmail = history8.find(e => e.event === 'TICKET_COMPLETED');

    if (!completedEmail) {
      throw new Error(`TICKET_COMPLETED email was not triggered on ticket completion! Recorded: ${JSON.stringify(history8.map(e => e.event))}`);
    }

    if (completedEmail.to !== clientEmail) {
      throw new Error(`TICKET_COMPLETED sent to wrong recipient: ${completedEmail.to}, expected: ${clientEmail}`);
    }

    console.log(`  ✓ [EMAIL EVENT VERIFIED] TICKET_COMPLETED sent to USER: ${completedEmail.to}`);
    console.log(`    Subject: "${completedEmail.subject}"`);
    console.log(`    Direct link: ${getTicketUrl(createdTicketCode)}\n`);
    passed++;

    // ------------------------------------------------------------------------
    // AUTHORIZATION / IDOR PROTECTION TEST
    // ------------------------------------------------------------------------
    console.log('[Security & IDOR Test]: Verifying unauthorized access is rejected...');

    // Create an unrelated second client user
    const unrelatedClientEmail = `unrelated.${testTimestamp}@creativegini.test`;
    let unrelatedUserId = null;
    let unrelatedCompanyId = null;
    const unrelatedClientRes = await request('/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        companyName: 'Unrelated Company Inc',
        contactPerson: 'Intruder',
        email: unrelatedClientEmail,
        password: testPassword
      })
    }, adminToken);

    if (unrelatedClientRes.data?.user) {
      unrelatedUserId = unrelatedClientRes.data.user.id;
      unrelatedCompanyId = unrelatedClientRes.data.user.companyId?.id || unrelatedClientRes.data.user.companyId;
    }

    const unrelatedLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: unrelatedClientEmail, password: testPassword })
    });
    const unrelatedToken = unrelatedLogin.data?.token;

    // Unrelated user tries to view this ticket
    const idorViewRes = await request(`/requests/${createdTicketCode}`, {}, unrelatedToken);
    if (idorViewRes.status === 403 || idorViewRes.status === 404) {
      console.log(`  ✓ IDOR protection verified: Unrelated client rejected with HTTP ${idorViewRes.status}`);
      passed++;
    } else {
      throw new Error(`IDOR vulnerability! Unrelated client accessed ticket with HTTP ${idorViewRes.status}`);
    }

    // Unrelated user tries to view messages
    const idorMsgRes = await request(`/requests/${createdTicketCode}/messages`, {}, unrelatedToken);
    if (idorMsgRes.status === 403) {
      console.log(`  ✓ IDOR message protection verified: HTTP 403 Forbidden`);
      passed++;
    } else {
      throw new Error(`IDOR vulnerability! Unrelated client accessed messages with HTTP ${idorMsgRes.status}`);
    }

    // ------------------------------------------------------------------------
    // DUPLICATE EMAIL PREVENTION TEST
    // ------------------------------------------------------------------------
    console.log('\n[Duplicate Prevention Test]: Verifying in-memory deduplication cache suppresses immediate duplicate...');
    // Call once to populate dedupe cache in this process
    await sendWorkApprovedEmail({
      specialist: { email: specialist1Email },
      ticket: { ticketId: createdTicketCode, serviceType: 'COMPANY_LEAD', title: 'Test Ticket' },
      client: { name: clientName }
    });

    // Call second time immediately - must be suppressed
    const duplicateRes = await sendWorkApprovedEmail({
      specialist: { email: specialist1Email },
      ticket: { ticketId: createdTicketCode, serviceType: 'COMPANY_LEAD', title: 'Test Ticket' },
      client: { name: clientName }
    });

    if (duplicateRes.success && duplicateRes.deduplicated === true) {
      console.log(`  ✓ Duplicate email successfully caught and suppressed: deduplicated: true`);
      passed++;
    } else {
      throw new Error(`Expected deduplicated: true, got: ${JSON.stringify(duplicateRes)}`);
    }

    // ------------------------------------------------------------------------
    // NON-BLOCKING ERROR SAFETY TEST
    // ------------------------------------------------------------------------
    console.log('\n[Error Safety Test]: Verifying email dispatch errors do not crash or block ticket operations...');
    // Missing email or faulty transporter should never throw
    const safeErrorRes = await sendRequestCreatedEmail({
      client: { name: 'User Without Email' }, // empty email
      ticket: { ticketId: 'CG-9999', title: 'Test' }
    });

    if (safeErrorRes.success === false && safeErrorRes.reason === 'invalid_payload') {
      console.log('  ✓ Missing recipient safely handled without throw or credentials leak.');
      passed++;
    } else {
      throw new Error(`Unexpected error handling result: ${JSON.stringify(safeErrorRes)}`);
    }

    // ------------------------------------------------------------------------
    // SMTP DELIVERY DIAGNOSTIC / VERIFICATION
    // ------------------------------------------------------------------------
    console.log('\n================================================================');
    console.log('SMTP CONFIGURATION & DELIVERY VERIFICATION');
    console.log('================================================================');

    const smtpCheck = await verifySmtpConnection();
    console.log('SMTP Verification Result:');
    console.log(`  Host:       ${process.env.EMAIL_HOST || 'smtp.gmail.com'}`);
    console.log(`  Port:       ${process.env.EMAIL_PORT || '587'}`);
    console.log(`  User:       ${process.env.EMAIL_USER || 'team@creativegini.com'}`);
    console.log(`  Sender:     ${process.env.EMAIL_FROM || 'CreativeGini <team@creativegini.com>'}`);
    console.log(`  Configured: ${smtpCheck.configured}`);
    console.log(`  Success:    ${smtpCheck.success}`);
    
    if (smtpCheck.placeholder) {
      console.log(`  Status:     [PLACEHOLDER PASSWORD DETECTED]`);
      console.log(`  Notice:     ${smtpCheck.error}`);
      console.log('  Mode:       All application email events successfully generated and audited.');
      console.log('              Live SMTP delivery is ready to activate once the user replaces');
      console.log('              <GOOGLE_APP_PASSWORD> with their Google Workspace App Password.');
    } else if (smtpCheck.success) {
      console.log(`  Status:     [LIVE SMTP AUTHENTICATED]`);
      console.log(`  Message:    ${smtpCheck.message}`);
    } else {
      console.log(`  Status:     [SMTP AUTHENTICATION FAILED]`);
      console.log(`  Error:      ${smtpCheck.error}`);
    }

    console.log('\n================================================================');
    console.log(`INTEGRATION TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('================================================================\n');

  } catch (err) {
    console.error('\n❌ LIFECYCLE INTEGRATION TEST FAILED:', err.message);
    failed++;
  } finally {
    // Cleanup created test records
    try {
      if (createdTicketCode) {
        await query('DELETE FROM requests WHERE ticket_id = $1', [createdTicketCode]);
      }
      if (clientUserId) {
        await query('DELETE FROM users WHERE id = $1', [clientUserId]);
      }
      if (specialist1UserId) {
        await query('DELETE FROM users WHERE id = $1', [specialist1UserId]);
      }
      if (specialist2UserId) {
        await query('DELETE FROM users WHERE id = $1', [specialist2UserId]);
      }
      if (clientCompanyId) {
        await query('DELETE FROM companies WHERE id = $1', [clientCompanyId]);
      }
      if (unrelatedUserId) {
        await query('DELETE FROM users WHERE id = $1', [unrelatedUserId]);
      }
      if (unrelatedCompanyId) {
        await query('DELETE FROM companies WHERE id = $1', [unrelatedCompanyId]);
      }
    } catch {}

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  }
}

runTicketEmailLifecycleSuite();
