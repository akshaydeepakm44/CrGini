import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { query, connectPostgres } from '../../src/config/postgres.js';
import bcrypt from 'bcryptjs';

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

async function runMultiServiceLifecycleSuite() {
  console.log('================================================================');
  console.log('PHASE 8: MULTI-SERVICE END-TO-END BUSINESS LIFECYCLE TEST');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  const timestamp = Date.now();
  const testPassword = 'Password@2026!';
  const hashedPassword = await bcrypt.hash(testPassword, 10);

  // Connect DB
  await connectPostgres();

  console.log('[Setup 1]: Authenticating Super Admin...');
  const adminLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'team@creativegini.com', password: 'Admin@2026' })
  });
  assert(adminLogin.ok && adminLogin.data?.token, 'Super Admin authenticated successfully');
  const adminToken = adminLogin.data.token;

  console.log('\n[Setup 2]: Creating Client A, Client B, and Specialists for each service...');
  // Create Company A & Client A
  const compARes = await query(
    `INSERT INTO companies (name, email, website) VALUES ($1, $2, $3) RETURNING id`,
    [`Alpha Corp ${timestamp}`, `client.a.${timestamp}@test.com`, 'https://alphacorp.test']
  );
  const companyAId = compARes.rows[0].id;
  const userARes = await query(
    `INSERT INTO users (name, email, password, role, company_id, status) VALUES ($1, $2, $3, 'USER', $4, 'ACTIVE') RETURNING id`,
    ['Alice Alpha', `client.a.${timestamp}@test.com`, hashedPassword, companyAId]
  );
  const userAId = userARes.rows[0].id;

  // Create Company B & Client B (for IDOR & Tenant Isolation tests)
  const compBRes = await query(
    `INSERT INTO companies (name, email, website) VALUES ($1, $2, $3) RETURNING id`,
    [`Beta Inc ${timestamp}`, `client.b.${timestamp}@test.com`, 'https://betainc.test']
  );
  const companyBId = compBRes.rows[0].id;
  const userBRes = await query(
    `INSERT INTO users (name, email, password, role, company_id, status) VALUES ($1, $2, $3, 'USER', $4, 'ACTIVE') RETURNING id`,
    ['Bob Beta', `client.b.${timestamp}@test.com`, hashedPassword, companyBId]
  );
  const userBId = userBRes.rows[0].id;

  // Create Specialists:
  // 1. Lead Specialist (COMPANY_LEAD)
  const leadSpecRes = await query(
    `INSERT INTO users (name, email, password, role, company_lead, status) VALUES ($1, $2, $3, 'COMPANY_LEAD', true, 'ACTIVE') RETURNING id`,
    ['Laura Lead', `specialist.lead.${timestamp}@creativegini.test`, hashedPassword]
  );
  const leadSpecId = leadSpecRes.rows[0].id;

  // 2. Boost Specialist (COMPANY_BOOST)
  const boostSpecRes = await query(
    `INSERT INTO users (name, email, password, role, company_boost, status) VALUES ($1, $2, $3, 'COMPANY_BOOST', true, 'ACTIVE') RETURNING id`,
    ['Brian Boost', `specialist.boost.${timestamp}@creativegini.test`, hashedPassword]
  );
  const boostSpecId = boostSpecRes.rows[0].id;

  // 3. UI/Design Specialist (LANDING_PAGE)
  const uiSpecRes = await query(
    `INSERT INTO users (name, email, password, role, company_ui, status) VALUES ($1, $2, $3, 'LANDING_PAGE', true, 'ACTIVE') RETURNING id`,
    ['Uma UI', `specialist.ui.${timestamp}@creativegini.test`, hashedPassword]
  );
  const uiSpecId = uiSpecRes.rows[0].id;

  // Log all in to get tokens
  const clientALogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: `client.a.${timestamp}@test.com`, password: testPassword })
  });
  const clientAToken = clientALogin.data.token;

  const clientBLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: `client.b.${timestamp}@test.com`, password: testPassword })
  });
  const clientBToken = clientBLogin.data.token;

  const leadSpecLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: `specialist.lead.${timestamp}@creativegini.test`, password: testPassword })
  });
  const leadSpecToken = leadSpecLogin.data.token;

  const boostSpecLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: `specialist.boost.${timestamp}@creativegini.test`, password: testPassword })
  });
  const boostSpecToken = boostSpecLogin.data.token;

  const uiSpecLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: `specialist.ui.${timestamp}@creativegini.test`, password: testPassword })
  });
  const uiSpecToken = uiSpecLogin.data.token;

  assert(clientAToken && clientBToken && leadSpecToken && boostSpecToken && uiSpecToken, 'All client and specialist accounts logged in and authenticated');

  // =========================================================================
  // WORKFLOW TEST 1: LEAD SERVICE COMPLETE LIFECYCLE (Lead Research)
  // =========================================================================
  console.log('\n=================================================================');
  console.log('[Workflow 1]: Lead Research Complete Specialist Lifecycle');
  console.log('=================================================================');

  // Step 1: Client creates Lead Research request
  const createLeadReq = await request('/requests', {
    method: 'POST',
    body: JSON.stringify({
      serviceType: 'COMPANY_LEAD',
      subService: 'COMPANY_STUDY',
      title: 'Global Fintech Expansion Lead Intelligence',
      description: 'Need verified enterprise contacts for UK & US digital banking CTOs.',
      priority: 'HIGH',
      requirements: { industry: 'Fintech', geography: 'UK/US', targetCount: 25 }
    })
  }, clientAToken);
  assert(createLeadReq.ok && createLeadReq.data?.request?.ticketId, `Lead request created with Ticket ID: ${createLeadReq.data?.request?.ticketId}`);
  const leadTicket = createLeadReq.data.request;
  const leadTicketId = leadTicket._id || leadTicket.id;

  // Step 2: Payment Simulation (Client pays)
  const payLeadReq = await request(`/requests/${leadTicketId}/pay`, {
    method: 'POST',
    body: JSON.stringify({ paymentMethod: 'Corporate Visa *8821' })
  }, clientAToken);
  assert(payLeadReq.ok && payLeadReq.data?.payment?.status === 'PAID', `Lead ticket payment simulated and processed (Invoice: ${payLeadReq.data?.payment?.invoiceNumber})`);

  // Step 3: Admin assigns to Lead Specialist
  const assignLead = await request(`/requests/${leadTicketId}/assign`, {
    method: 'POST',
    body: JSON.stringify({
      assignedTo: leadSpecId,
      assignedTeam: 'Company Lead Team',
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString()
    })
  }, adminToken);
  assert(assignLead.ok && assignLead.data?.request?.status === 'ASSIGNED', 'Lead ticket assigned to Laura Lead (Status: ASSIGNED)');

  // Step 4: Specialist starts work
  const startLeadWork = await request(`/requests/${leadTicketId}/start-work`, {
    method: 'POST'
  }, leadSpecToken);
  assert(startLeadWork.ok && startLeadWork.data?.request?.status === 'IN_PROGRESS', 'Lead Specialist started manual research (Status: IN_PROGRESS)');

  // Step 5: Specialist chats with Client
  const specialistLeadMsg = await request(`/requests/${leadTicketId}/messages`, {
    method: 'POST',
    body: JSON.stringify({
      message: 'Hello Alice, we have begun manual research on your UK/US digital banking target list.'
    })
  }, leadSpecToken);
  assert(specialistLeadMsg.ok, 'Specialist sent clarification chat message to Client');

  const clientLeadReply = await request(`/requests/${leadTicketId}/messages`, {
    method: 'POST',
    body: JSON.stringify({
      message: 'Excellent. Please prioritize Tier-1 challenger banks first.'
    })
  }, clientAToken);
  assert(clientLeadReply.ok, 'Client replied to Specialist in ticket chat');

  // Verify messages count
  const leadChatHistory = await request(`/requests/${leadTicketId}/messages`, { method: 'GET' }, clientAToken);
  assert(leadChatHistory.data?.messages?.length >= 2, `Conversation history stored correctly (${leadChatHistory.data?.messages?.length} messages)`);

  // Step 6: Specialist uploads Deliverable V1
  const submitV1 = await request(`/requests/${leadTicketId}/submissions`, {
    method: 'POST',
    body: JSON.stringify({
      title: 'Initial 25 Verified Fintech CTO Dossiers',
      description: 'Completed manual research containing verified direct emails and LinkedIn dossiers.',
      files: [
        { name: 'Fintech_CTO_Dossier_v1.pdf', type: 'application/pdf', size: 1048576, url: 'https://storage.creativegini.com/submissions/fintech_v1.pdf' }
      ],
      notes: 'Please review lead qualification notes on column 4.'
    })
  }, leadSpecToken);
  assert(submitV1.ok && submitV1.data?.submission?.version === 1, 'Deliverable V1 submitted for client review (Version: 1)');

  // Verify ticket status transitioned to CLIENT_REVIEW
  const leadCheckV1 = await request(`/requests/${leadTicketId}`, { method: 'GET' }, clientAToken);
  assert(leadCheckV1.data?.request?.status === 'CLIENT_REVIEW', 'Ticket status transitioned automatically to CLIENT_REVIEW');

  // Step 7: Client reviews V1 and requests changes
  const changeReq = await request(`/requests/${leadTicketId}/submissions/${submitV1.data.submission._id || submitV1.data.submission.id}/request-changes`, {
    method: 'POST',
    body: JSON.stringify({
      feedback: 'Great initial list. Please filter out companies under 50 employees and add 5 more US enterprise candidates.'
    })
  }, clientAToken);
  assert(changeReq.ok && changeReq.data?.request?.status === 'CHANGES_REQUESTED', 'Client requested changes with feedback (Status: CHANGES_REQUESTED)');

  // Step 8: Specialist prepares and uploads revised Deliverable V2
  const submitV2 = await request(`/requests/${leadTicketId}/submissions`, {
    method: 'POST',
    body: JSON.stringify({
      title: 'Revised 30 Verified Enterprise Fintech CTO Dossiers',
      description: 'Filtered out smaller startups and added 5 Tier-1 US enterprise banking contacts.',
      files: [
        { name: 'Fintech_CTO_Dossier_v2_Final.pdf', type: 'application/pdf', size: 1204857, url: 'https://storage.creativegini.com/submissions/fintech_v2.pdf' }
      ],
      notes: 'All 30 candidates meet your strict >50 headcount requirement.'
    })
  }, leadSpecToken);
  assert(submitV2.ok && submitV2.data?.submission?.version === 2, 'Revised Deliverable V2 submitted by specialist (Version: 2)');

  // Step 9: Client reviews V2 and approves
  const approveV2 = await request(`/requests/${leadTicketId}/submissions/${submitV2.data.submission._id || submitV2.data.submission.id}/approve`, {
    method: 'POST',
    body: JSON.stringify({
      feedback: 'Perfect delivery! All contacts verified and exactly on target.'
    })
  }, clientAToken);
  assert(approveV2.ok && approveV2.data?.request?.status === 'COMPLETED', 'Client approved V2 deliverable. Ticket transitioned to COMPLETED!');

  // Verify submissions history has both V1 and V2
  const submissionsHistory = await request(`/requests/${leadTicketId}/submissions`, { method: 'GET' }, clientAToken);
  assert(submissionsHistory.data?.submissions?.length === 2, `Complete version history preserved (Versions: ${submissionsHistory.data?.submissions?.map(s => `V${s.version}`).join(', ')})`);

  // =========================================================================
  // WORKFLOW TEST 2: BOOST SERVICE COMPLETE LIFECYCLE (Strategic Plan / Content)
  // =========================================================================
  console.log('\n=================================================================');
  console.log('[Workflow 2]: Company Boost Complete Specialist Lifecycle');
  console.log('=================================================================');

  const createBoostReq = await request('/requests', {
    method: 'POST',
    body: JSON.stringify({
      serviceType: 'COMPANY_BOOST',
      subService: 'GTM_STRATEGY',
      title: 'Q1 Go-To-Market Narrative & Content Deck',
      description: 'Comprehensive positioning strategy and social content pillars for SaaS product launch.',
      priority: 'MEDIUM',
      requirements: { targetAudience: 'B2B Procurement Leaders', launchDate: '2026-11-01' }
    })
  }, clientAToken);
  assert(createBoostReq.ok, `Boost request created with Ticket ID: ${createBoostReq.data?.request?.ticketId}`);
  const boostTicketId = createBoostReq.data.request._id || createBoostReq.data.request.id;

  // Pay
  await request(`/requests/${boostTicketId}/pay`, { method: 'POST', body: JSON.stringify({}) }, clientAToken);

  // Assign to Brian Boost
  const assignBoost = await request(`/requests/${boostTicketId}/assign`, {
    method: 'POST',
    body: JSON.stringify({ assignedTo: boostSpecId, assignedTeam: 'Company Boost Team' })
  }, adminToken);
  assert(assignBoost.ok && assignBoost.data?.request?.status === 'ASSIGNED', 'Boost ticket assigned to Brian Boost');

  // Start work
  await request(`/requests/${boostTicketId}/start-work`, { method: 'POST' }, boostSpecToken);

  // Submit V1
  const boostV1 = await request(`/requests/${boostTicketId}/submissions`, {
    method: 'POST',
    body: JSON.stringify({
      title: 'GTM Playbook & 10 Ad Creative Copies',
      description: 'Strategic market map and multi-channel campaign copies.',
      files: [{ name: 'GTM_Playbook_v1.pdf', url: 'https://storage.creativegini.com/gtm_v1.pdf' }]
    })
  }, boostSpecToken);
  assert(boostV1.ok, 'Boost Deliverable V1 submitted');

  // Client approves V1 directly
  const approveBoost = await request(`/requests/${boostTicketId}/submissions/${boostV1.data.submission._id || boostV1.data.submission.id}/approve`, {
    method: 'POST',
    body: JSON.stringify({ feedback: 'Looks fantastic, ready for execution!' })
  }, clientAToken);
  assert(approveBoost.ok && approveBoost.data?.request?.status === 'COMPLETED', 'Boost ticket approved directly and COMPLETED');

  // =========================================================================
  // WORKFLOW TEST 3: UI/DESIGN SERVICE COMPLETE LIFECYCLE (UI/UX Audit)
  // =========================================================================
  console.log('\n=================================================================');
  console.log('[Workflow 3]: UI/Design Service Complete Specialist Lifecycle');
  console.log('=================================================================');

  const createUiReq = await request('/requests', {
    method: 'POST',
    body: JSON.stringify({
      serviceType: 'LANDING_PAGE',
      subService: 'AUDIT',
      title: 'Checkout Flow UI/UX Heuristic Audit',
      description: 'Friction audit for SaaS multi-tiered checkout and onboarding flow.',
      priority: 'HIGH',
      requirements: { websiteUrl: 'https://alphacorp.test/checkout' }
    })
  }, clientAToken);
  assert(createUiReq.ok, `Design request created with Ticket ID: ${createUiReq.data?.request?.ticketId}`);
  const uiTicketId = createUiReq.data.request._id || createUiReq.data.request.id;

  // Pay
  await request(`/requests/${uiTicketId}/pay`, { method: 'POST', body: JSON.stringify({}) }, clientAToken);

  // Assign to Uma UI
  const assignUi = await request(`/requests/${uiTicketId}/assign`, {
    method: 'POST',
    body: JSON.stringify({ assignedTo: uiSpecId, assignedTeam: 'Landing Page Enhancement Team' })
  }, adminToken);
  assert(assignUi.ok, 'UI/Design ticket assigned to Uma UI');

  // Start work
  await request(`/requests/${uiTicketId}/start-work`, { method: 'POST' }, uiSpecToken);

  // Specialist submits V1 with Figma link & deliverable document
  const uiV1 = await request(`/requests/${uiTicketId}/submissions`, {
    method: 'POST',
    body: JSON.stringify({
      title: 'Heuristic UI/UX Audit & Figma Wireframe Redesign',
      description: 'Full heuristic scorecard and high-fidelity prototype wireframes.',
      externalLink: 'https://www.figma.com/design/test-sample-project/AlphaCheckout',
      files: [{ name: 'UI_Audit_Scorecard.pdf', url: 'https://storage.creativegini.com/ui_audit.pdf' }]
    })
  }, uiSpecToken);
  assert(uiV1.ok, 'UI/Design deliverable V1 submitted with external Figma prototype URL');

  // Client requests change
  const changeUi = await request(`/requests/${uiTicketId}/submissions/${uiV1.data.submission._id || uiV1.data.submission.id}/request-changes`, {
    method: 'POST',
    body: JSON.stringify({ feedback: 'Please update modal drawer on frame 3 to have clearer pricing tiers.' })
  }, clientAToken);
  assert(changeUi.ok && changeUi.data?.request?.status === 'CHANGES_REQUESTED', 'UI change requested');

  // Specialist submits V2
  const uiV2 = await request(`/requests/${uiTicketId}/submissions`, {
    method: 'POST',
    body: JSON.stringify({
      title: 'Updated UI/UX Audit & Refined Figma Prototype (V2)',
      description: 'Modal drawer pricing tiers revised per feedback.',
      externalLink: 'https://www.figma.com/design/test-sample-project/AlphaCheckout_v2',
      files: [{ name: 'UI_Audit_Scorecard_v2.pdf', url: 'https://storage.creativegini.com/ui_audit_v2.pdf' }]
    })
  }, uiSpecToken);
  assert(uiV2.ok && uiV2.data?.submission?.version === 2, 'UI Deliverable V2 submitted');

  // Client approves V2
  const approveUi = await request(`/requests/${uiTicketId}/submissions/${uiV2.data.submission._id || uiV2.data.submission.id}/approve`, {
    method: 'POST',
    body: JSON.stringify({ feedback: 'Drawer is perfect now!' })
  }, clientAToken);
  assert(approveUi.ok && approveUi.data?.request?.status === 'COMPLETED', 'UI/Design ticket approved and COMPLETED');

  // =========================================================================
  // NEGATIVE TESTING & TENANT ISOLATION (Client B vs Client A)
  // =========================================================================
  console.log('\n=================================================================');
  console.log('[Negative & Security Tests]: IDOR & Tenant Isolation Validation');
  console.log('=================================================================');

  // 1. Client B cannot view Client A Lead Ticket
  const idorTicket = await request(`/requests/${leadTicketId}`, { method: 'GET' }, clientBToken);
  assert(idorTicket.status === 403, 'Client B blocked with 403 from viewing Client A ticket');

  // 2. Client B cannot view Client A Submissions
  const idorSubmissions = await request(`/requests/${leadTicketId}/submissions`, { method: 'GET' }, clientBToken);
  assert(idorSubmissions.status === 403, 'Client B blocked with 403 from viewing Client A submissions');

  // 3. Client B cannot approve Client A Deliverable
  const idorApprove = await request(`/requests/${leadTicketId}/submissions/${submitV2.data.submission._id || submitV2.data.submission.id}/approve`, {
    method: 'POST',
    body: JSON.stringify({ feedback: 'Malicious approval attempt' })
  }, clientBToken);
  assert(idorApprove.status === 403, 'Client B blocked with 403 from approving Client A deliverable');

  // 4. Client B cannot send chat messages to Client A ticket
  const idorMsg = await request(`/requests/${leadTicketId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ message: 'Hello from unauthorized tenant' })
  }, clientBToken);
  assert(idorMsg.status === 403, 'Client B blocked with 403 from sending messages to Client A ticket');

  // 5. Specialist Cross-Service Authorization Check:
  // Lead Specialist cannot submit work to Boost ticket
  const crossSpecSubmit = await request(`/requests/${boostTicketId}/submissions`, {
    method: 'POST',
    body: JSON.stringify({ title: 'Unauthorized submission', description: 'desc' })
  }, leadSpecToken);
  assert(crossSpecSubmit.status === 403 || crossSpecSubmit.status === 400, 'Cross-specialist unauthorized work submission blocked (403/400)');

  // 6. State Machine Integrity:
  // Cannot re-submit on already completed ticket
  const completedResubmit = await request(`/requests/${leadTicketId}/submissions`, {
    method: 'POST',
    body: JSON.stringify({ title: 'Late submission', description: 'desc' })
  }, leadSpecToken);
  assert(completedResubmit.status === 400, 'Submitting work on already COMPLETED ticket safely blocked with 400 Bad Request');

  // Clean up test data
  console.log('\n[Cleanup]: Cleaning up temporary test records...');
  try {
    await query(`DELETE FROM messages WHERE request_id IN ($1, $2, $3)`, [leadTicketId, boostTicketId, uiTicketId]);
    await query(`DELETE FROM submission_files WHERE submission_id IN (SELECT id FROM submissions WHERE ticket_id IN ($1, $2, $3))`, [leadTicketId, boostTicketId, uiTicketId]);
    await query(`DELETE FROM submissions WHERE ticket_id IN ($1, $2, $3)`, [leadTicketId, boostTicketId, uiTicketId]);
    await query(`DELETE FROM payments WHERE request_id IN ($1, $2, $3)`, [leadTicketId, boostTicketId, uiTicketId]);
    await query(`DELETE FROM activity_logs WHERE request_id IN ($1, $2, $3)`, [leadTicketId, boostTicketId, uiTicketId]);
    await query(`DELETE FROM notifications WHERE ticket_id IN ($1, $2, $3)`, [leadTicketId, boostTicketId, uiTicketId]);
    await query(`DELETE FROM requests WHERE id IN ($1, $2, $3)`, [leadTicketId, boostTicketId, uiTicketId]);
    await query(`DELETE FROM users WHERE id IN ($1, $2, $3, $4, $5)`, [userAId, userBId, leadSpecId, boostSpecId, uiSpecId]);
    await query(`DELETE FROM companies WHERE id IN ($1, $2)`, [companyAId, companyBId]);
    console.log('  ✓ Ephemeral test records removed cleanly.');
  } catch (cleanErr) {
    console.warn('  (Cleanup note):', cleanErr.message);
  }

  console.log('\n=================================================================');
  console.log(`MULTI-SERVICE LIFECYCLE TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('=================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runMultiServiceLifecycleSuite().catch(err => {
  console.error('Test suite uncaught error:', err);
  process.exit(1);
});
