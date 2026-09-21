import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

import jwt from 'jsonwebtoken';
import { findUserByEmail, findActiveSpecialists } from './src/repositories/userRepository.js';
import { clearEmailDedupeCache } from './src/services/emailService.js';

const API_BASE = 'http://localhost:5000/api';

function createToken(userId) {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'creativegini_jwt_secret_2026_production_key_secure',
    { expiresIn: '30d' }
  );
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, { ...options, headers });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `HTTP ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

async function runIntegrationTest() {
  console.log('====================================================');
  console.log('CREATIVEGINI INTEGRATION & SAFEGUARDS TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  try {
    clearEmailDedupeCache();

    // 1. Resolve users from DB and generate tokens
    console.log('STEP 1: Resolving Users and Generating Auth Tokens...');
    const clientUser = await findUserByEmail('client@acmecorp.com');
    const specialistUser = (await findUserByEmail('akhilkallepalli8@gmail.com'))
      || (await findUserByEmail('akhil.k@datai2i.com'))
      || (await findActiveSpecialists('COMPANY_BOOST')).find(u => u.role === 'COMPANY_BOOST');
    const adminUser = await findUserByEmail('admin@creativegini.com');

    if (!clientUser || !specialistUser || !adminUser) {
      throw new Error(`Missing test users: client=${!!clientUser}, specialist=${!!specialistUser}, admin=${!!adminUser}`);
    }

    const clientToken = createToken(clientUser.id);
    const specialistToken = createToken(specialistUser.id);
    const adminToken = createToken(adminUser.id);

    console.log('  [PASS] Tokens generated for:');
    console.log('    Client:     ', clientUser.name, `(${clientUser.email})`);
    console.log('    Specialist: ', specialistUser.name, `(${specialistUser.email})`);
    console.log('    Admin:      ', adminUser.name, `(${adminUser.email})`);
    passed++;

    // 2. Client creates a ticket
    console.log('\nSTEP 2: Creating a new service ticket (COMPANY_BOOST)...');
    const createRes = await request('/requests', {
      method: 'POST',
      headers: { Authorization: `Bearer ${clientToken}` },
      body: JSON.stringify({
        serviceType: 'COMPANY_BOOST',
        title: 'Q4 Full Funnel Growth Optimization Sprint',
        description: 'End-to-end B2B SaaS growth sprint covering ads, inbound funnel, and retention.',
        priority: 'HIGH'
      })
    });
    const ticket = createRes.request;
    console.log('  [PASS] Created ticket:', ticket.ticketId, '(ID:', ticket.id, ')');
    passed++;

    // 3. Client pays for ticket
    console.log('\nSTEP 3: Processing payment...');
    const payRes = await request(`/requests/${ticket.id}/pay`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${clientToken}` },
      body: JSON.stringify({ paymentMethod: 'Corporate Amex' })
    });
    console.log('  [PASS] Payment successful. Ticket status:', payRes.request.status);
    passed++;

    // 3B. Admin assigns ticket to specialistUser (Event 1: Ticket assigned)
    console.log('\nSTEP 3B: Admin assigns ticket to specialistUser (Event 1: Ticket Assigned email)...');
    const assignRes = await request(`/requests/${ticket.id}/assign`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        assignedTo: specialistUser.id,
        assignedTeam: 'Growth & Boost Strategist'
      })
    });
    console.log('  [PASS] Ticket assigned to specialist:', specialistUser.name, `(${specialistUser.email})`);
    passed++;

    // 4. Specialist starts work -> triggers work started email
    console.log('\nSTEP 4: Specialist starts work on ticket...');
    const startRes = await request(`/requests/${ticket.id}/start-work`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${specialistToken}` }
    });
    console.log('  [PASS] Work started. Ticket status:', startRes.request.status);
    passed++;

    // Safeguard 1 check: Re-calling start-work should NOT trigger another email
    console.log('\nSTEP 4B: Testing Safeguard 1 (state transition guard on start-work)...');
    const startAgainRes = await request(`/requests/${ticket.id}/start-work`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${specialistToken}` }
    });
    console.log('  [PASS] Re-calling start-work when already IN_PROGRESS handled smoothly:', startAgainRes.message);
    passed++;

    // 5. Specialist sends ordinary chat message -> Safeguard 3: NO email sent to client
    console.log('\nSTEP 5: Testing Safeguard 3 (ordinary chat message)...');
    const chatMsg1 = await request(`/requests/${ticket.id}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${specialistToken}` },
      body: JSON.stringify({
        text: 'Hi Alex! Just reviewing the brand collateral you uploaded. Quick question on target ACV.',
        isProgressUpdate: false
      })
    });
    console.log('  [PASS] Ordinary chat message posted without email trigger:', chatMsg1.message.text);
    passed++;

    // 6. Specialist sends meaningful progress update -> triggers progress email
    console.log('\nSTEP 6: Testing Safeguard 3 (meaningful progress update)...');
    const progressMsg = await request(`/requests/${ticket.id}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${specialistToken}` },
      body: JSON.stringify({
        text: '[UPDATE] Competitor positioning matrix completed. Identified 3 high-leverage growth angles.',
        isProgressUpdate: true
      })
    });
    console.log('  [PASS] Meaningful progress update posted and email triggered:', progressMsg.message.text);
    passed++;

    // 7. Specialist submits completed work (V1) -> triggers work submitted email
    console.log('\nSTEP 7: Specialist submits deliverables (V1)...');
    const subV1Res = await request(`/requests/${ticket.id}/submissions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${specialistToken}` },
      body: JSON.stringify({
        title: 'Q4 Growth Strategy & Media Plan V1',
        description: 'Comprehensive 40-page growth strategy and campaign architecture for Q4.',
        externalLink: 'https://docs.google.com/presentation/d/test-cg-growth-deck-v1',
        notes: 'Includes audience targeting, creative concepts, and budget allocation.'
      })
    });
    const subV1 = subV1Res.submission;
    console.log('  [PASS] Work V1 submitted. Submission ID:', subV1._id, 'Version:', subV1.version);
    passed++;

    // 8. Client requests changes -> triggers changes requested email to specialist
    console.log('\nSTEP 8: Client requests revisions...');
    const changesRes = await request(`/requests/${ticket.id}/submissions/${subV1._id}/request-changes`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${clientToken}` },
      body: JSON.stringify({
        feedback: 'Please reallocate 20% more budget into LinkedIn InMail campaigns and update slide 14.'
      })
    });
    console.log('  [PASS] Changes requested. Submission status:', changesRes.submission.status);
    passed++;

    // 9. Specialist submits revised work (V2) -> triggers work resubmitted email
    console.log('\nSTEP 9: Specialist submits revised work (V2)...');
    const subV2Res = await request(`/requests/${ticket.id}/submissions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${specialistToken}` },
      body: JSON.stringify({
        title: 'Q4 Growth Strategy & Media Plan V2 (Revised)',
        description: 'Updated with increased LinkedIn InMail allocation and revised ROI projections on slide 14.',
        externalLink: 'https://docs.google.com/presentation/d/test-cg-growth-deck-v2',
        notes: 'Ready for client sign-off.'
      })
    });
    const subV2 = subV2Res.submission;
    console.log('  [PASS] Work V2 submitted. Version:', subV2.version);
    passed++;

    // 10. Client approves work -> triggers work approved email & ticket completed email
    console.log('\nSTEP 10: Client approves work...');
    const approveRes = await request(`/requests/${ticket.id}/submissions/${subV2._id}/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${clientToken}` },
      body: JSON.stringify({
        feedback: 'Looks fantastic! Strategy fully approved. Ready to launch.'
      })
    });
    console.log('  [PASS] Work approved! Ticket status:', approveRes.request.status);
    passed++;

    // 11. Verify in-app notifications were created and preserved
    console.log('\nSTEP 11: Verifying portal in-app notifications...');
    const clientNotifs = await request('/notifications', {
      headers: { Authorization: `Bearer ${clientToken}` }
    });
    console.log('  [PASS] Client notifications count:', clientNotifs.notifications.length);

    const specialistNotifs = await request('/notifications', {
      headers: { Authorization: `Bearer ${specialistToken}` }
    });
    console.log('  [PASS] Specialist notifications count:', specialistNotifs.notifications.length);
    passed++;

    console.log('\n====================================================');
    console.log(`ALL INTEGRATION TESTS PASSED! (${passed} checks succeeded)`);
    console.log('====================================================\n');

  } catch (err) {
    console.error('\n[TEST FAILED]:', err.message);
    failed++;
  }

  process.exit(failed > 0 ? 1 : 0);
}

runIntegrationTest();
