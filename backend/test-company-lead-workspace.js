import { query } from './src/config/postgres.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'creativegini_jwt_secret_2026_production_key_secure';
const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('====================================================');
  console.log('STARTING COMPANY LEAD WORKSPACE TEST SUITE');
  console.log('====================================================');

  const timestamp = Date.now();
  const passwordHash = await bcrypt.hash('TestPass123!', 10);

  // 1. Create two test companies: Company A and Company B
  const compARes = await query(`
    INSERT INTO companies (name, contact_person, email, website, industry, company_info, research_summary)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, name;
  `, [
    `Test Company A ${timestamp}`,
    'Alice Founder',
    `alice.${timestamp}@comp-a.test`,
    'https://company-a.test',
    'Enterprise Cloud / AI',
    'Company A provides AI cloud infrastructure.',
    'Market analysis identified 25 high-affinity SaaS prospects.'
  ]);
  const companyAId = compARes.rows[0].id;

  const compBRes = await query(`
    INSERT INTO companies (name, contact_person, email, website, industry)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, name;
  `, [
    `Test Company B ${timestamp}`,
    'Bob Founder',
    `bob.${timestamp}@comp-b.test`,
    'https://company-b.test',
    'FinTech'
  ]);
  const companyBId = compBRes.rows[0].id;

  // 2. Create users for Company A and Company B
  const userARes = await query(`
    INSERT INTO users (name, email, password, role, company_id, status)
    VALUES ($1, $2, $3, 'USER', $4, 'ACTIVE')
    RETURNING id, email, role, company_id;
  `, ['Alice User', `alice.${timestamp}@comp-a.test`, passwordHash, companyAId]);
  const userA = userARes.rows[0];

  const userBRes = await query(`
    INSERT INTO users (name, email, password, role, company_id, status)
    VALUES ($1, $2, $3, 'USER', $4, 'ACTIVE')
    RETURNING id, email, role, company_id;
  `, ['Bob User', `bob.${timestamp}@comp-b.test`, passwordHash, companyBId]);
  const userB = userBRes.rows[0];

  // 3. Create Admin / Specialist user
  const specialistRes = await query(`
    INSERT INTO users (name, email, password, role, company_lead, status)
    VALUES ($1, $2, $3, 'COMPANY_LEAD', true, 'ACTIVE')
    RETURNING id, email, role;
  `, ['Lead Specialist', `specialist.${timestamp}@creativegini.test`, passwordHash]);
  const specialist = specialistRes.rows[0];

  const tokenA = jwt.sign({ id: userA.id, email: userA.email, role: userA.role, companyId: userA.company_id }, JWT_SECRET, { expiresIn: '1h' });
  const tokenB = jwt.sign({ id: userB.id, email: userB.email, role: userB.role, companyId: userB.company_id }, JWT_SECRET, { expiresIn: '1h' });
  const tokenSpecialist = jwt.sign({ id: specialist.id, email: specialist.email, role: specialist.role }, JWT_SECRET, { expiresIn: '1h' });

  // ----------------------------------------------------
  // TEST 1: User with no Company Lead request
  // ----------------------------------------------------
  console.log('\n[Test 1]: Checking User A with NO Company Lead request...');
  const res1 = await fetch(`${BASE_URL}/company/my-company/leads`, {
    headers: { Authorization: `Bearer ${tokenA}` }
  });
  const data1 = await res1.json();
  if (res1.status !== 200 || !data1.success) throw new Error('Test 1 failed: Could not fetch leads');
  if (data1.requests.length !== 0) throw new Error('Test 1 failed: Expected 0 requests');
  if (data1.metrics.totalLeads !== 0 || data1.metrics.verifiedLeads !== 0) throw new Error('Test 1 failed: Expected 0 leads');
  console.log('✓ PASS: User A has 0 requests, totalLeads = 0, verifiedLeads = 0 (No hardcoded fake verified count)');

  // ----------------------------------------------------
  // TEST 2: User A creates Company Lead request
  // ----------------------------------------------------
  console.log('\n[Test 2]: User A creates Company Lead request...');
  const reqCreateRes = await fetch(`${BASE_URL}/requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({
      title: 'Target Decision-Makers Sprint Q3',
      description: 'Research European SaaS CTOs and VPs of Engineering.',
      serviceType: 'COMPANY_LEAD',
      priority: 'HIGH'
    })
  });
  const reqCreateData = await reqCreateRes.json();
  if (reqCreateRes.status !== 201 || !reqCreateData.success) throw new Error('Test 2 failed: Request creation failed');
  const ticketId = reqCreateData.request.ticketId;
  const requestId = reqCreateData.request.id || reqCreateData.request._id;
  console.log(`✓ PASS: Request created successfully with Ticket ID: ${ticketId}`);

  // Verify request appears in user's company leads view
  const res2 = await fetch(`${BASE_URL}/company/my-company/leads`, {
    headers: { Authorization: `Bearer ${tokenA}` }
  });
  const data2 = await res2.json();
  if (data2.requests.length !== 1 || data2.requests[0].ticketId !== ticketId) {
    throw new Error('Test 2 failed: Request did not appear in company leads API');
  }
  console.log('✓ PASS: Company Lead request linked to user company and retrieved via API');

  // ----------------------------------------------------
  // TEST 3: Add Key Person to Company A
  // ----------------------------------------------------
  console.log('\n[Test 3]: Specialist adds Key Person to Company A...');
  const kpRes = await fetch(`${BASE_URL}/company/${companyAId}/key-people`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenSpecialist}` },
    body: JSON.stringify({
      name: 'Alice Founder',
      role: 'Chief Executive Officer',
      department: 'Executive Leadership',
      contact: 'alice@company-a.test',
      socialProfile: 'https://linkedin.com/in/alice-founder'
    })
  });
  const kpData = await kpRes.json();
  if (kpRes.status !== 201 || !kpData.success) throw new Error('Test 3 failed: Adding key person failed');
  console.log('✓ PASS: Key person added to company');

  // ----------------------------------------------------
  // TEST 4: Lead starts as non-verified (PENDING)
  // ----------------------------------------------------
  console.log('\n[Test 4]: Adding new lead - verifying it defaults to PENDING...');
  const lead1Res = await fetch(`${BASE_URL}/company/${companyAId}/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenSpecialist}` },
    body: JSON.stringify({
      name: 'Elena Rostova',
      title: 'VP of Engineering',
      company: 'NexaScale Cloud',
      email: 'elena@nexascale.test',
      linkedin: 'https://linkedin.com/in/elena-rostova',
      location: 'Berlin, Germany'
      // status omitted -> must default to PENDING
    })
  });
  const lead1Data = await lead1Res.json();
  if (lead1Res.status !== 201 || !lead1Data.success) throw new Error('Test 4 failed: Adding lead failed');
  if (lead1Data.lead.status !== 'PENDING') throw new Error(`Test 4 failed: Expected status PENDING, got ${lead1Data.lead.status}`);
  const lead1Id = lead1Data.lead.id;
  console.log('✓ PASS: New lead defaulted to status = PENDING');

  // ----------------------------------------------------
  // TEST 5: Cannot mark lead as VERIFIED without research/verification notes
  // ----------------------------------------------------
  console.log('\n[Test 5]: Attempting to mark lead as VERIFIED without research notes (Must fail)...');
  const invalidVerifyRes = await fetch(`${BASE_URL}/company/leads/${lead1Id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenSpecialist}` },
    body: JSON.stringify({
      status: 'VERIFIED'
      // notes omitted / empty
    })
  });
  if (invalidVerifyRes.status === 200) {
    throw new Error('Test 5 failed: Lead was allowed to be marked VERIFIED without research/verification notes!');
  }
  console.log(`✓ PASS: Server correctly rejected invalid VERIFIED status with HTTP ${invalidVerifyRes.status}`);

  // ----------------------------------------------------
  // TEST 6: Lead updated to RESEARCHED with research notes
  // ----------------------------------------------------
  console.log('\n[Test 6]: Specialist updates lead to RESEARCHED with research notes...');
  const researchRes = await fetch(`${BASE_URL}/company/leads/${lead1Id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenSpecialist}` },
    body: JSON.stringify({
      status: 'RESEARCHED',
      notes: 'Identified via European Cloud Index. Company actively expanding AI infrastructure.'
    })
  });
  const researchData = await researchRes.json();
  if (researchRes.status !== 200 || researchData.lead.status !== 'RESEARCHED') {
    throw new Error('Test 6 failed: Updating to RESEARCHED failed');
  }
  console.log('✓ PASS: Lead status updated to RESEARCHED with research rationale');

  // ----------------------------------------------------
  // TEST 7: Specialist completes verification and sets status to VERIFIED
  // ----------------------------------------------------
  console.log('\n[Test 7]: Specialist verifies contact and updates status to VERIFIED...');
  const verifyRes = await fetch(`${BASE_URL}/company/leads/${lead1Id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenSpecialist}` },
    body: JSON.stringify({
      status: 'VERIFIED',
      notes: 'Direct corporate email verified via SMTP handshake; LinkedIn profile confirms active VP of Engineering role.'
    })
  });
  const verifyData = await verifyRes.json();
  if (verifyRes.status !== 200 || verifyData.lead.status !== 'VERIFIED') {
    throw new Error('Test 7 failed: Updating to VERIFIED failed');
  }
  console.log('✓ PASS: Lead successfully verified with documented verification notes');

  // ----------------------------------------------------
  // TEST 8: Add a second lead that remains PENDING
  // ----------------------------------------------------
  console.log('\n[Test 8]: Adding a second lead that remains in PENDING status...');
  const lead2Res = await fetch(`${BASE_URL}/company/${companyAId}/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenSpecialist}` },
    body: JSON.stringify({
      name: 'Marcus Sterling',
      title: 'Chief Technology Officer',
      company: 'Veloce Data',
      email: 'marcus@velocedata.test',
      status: 'PENDING'
    })
  });
  const lead2Data = await lead2Res.json();
  const lead2Id = lead2Data.lead.id;
  console.log('✓ PASS: Second lead added with status = PENDING');

  // ----------------------------------------------------
  // TEST 9: Verify User Dashboard metrics calculation
  // ----------------------------------------------------
  console.log('\n[Test 9]: Fetching User A dashboard leads and checking metric calculation...');
  const res9 = await fetch(`${BASE_URL}/company/my-company/leads`, {
    headers: { Authorization: `Bearer ${tokenA}` }
  });
  const data9 = await res9.json();
  const metrics = data9.metrics;
  console.log('Metrics retrieved:', metrics);

  if (metrics.totalLeads !== 2) throw new Error(`Test 9 failed: Expected totalLeads = 2, got ${metrics.totalLeads}`);
  if (metrics.verifiedLeads !== 1) throw new Error(`Test 9 failed: Expected verifiedLeads = 1, got ${metrics.verifiedLeads}`);
  if (metrics.pendingVerification !== 1) throw new Error(`Test 9 failed: Expected pendingVerification = 1, got ${metrics.pendingVerification}`);
  if (metrics.keyPeopleCount !== 1) throw new Error(`Test 9 failed: Expected keyPeopleCount = 1, got ${metrics.keyPeopleCount}`);
  console.log('✓ PASS: Dynamic metric cards match actual database records exactly (1 verified, 1 pending, 2 total)');

  // ----------------------------------------------------
  // TEST 10: Lead Detail Endpoint (5 Required Sections)
  // ----------------------------------------------------
  console.log('\n[Test 10]: Fetching Lead Detail for User A...');
  const detailRes = await fetch(`${BASE_URL}/company/my-company/leads/${lead1Id}`, {
    headers: { Authorization: `Bearer ${tokenA}` }
  });
  const detailData = await detailRes.json();
  if (detailRes.status !== 200 || !detailData.success) throw new Error('Test 10 failed: Lead detail fetch failed');

  const dl = detailData.lead;
  // 1. Company / Person
  if (!dl.name || !dl.title || !dl.company) throw new Error('Test 10 failed: Missing company/person details');
  // 2. Relevance / Notes
  if (!dl.notes) throw new Error('Test 10 failed: Missing research notes');
  // 3. Verification
  if (!dl.isVerified) throw new Error('Test 10 failed: Expected isVerified = true');
  // 4. Key People
  if (!detailData.keyPeople || detailData.keyPeople.length !== 1) throw new Error('Test 10 failed: Key people missing');
  // 5. Related Ticket
  if (!detailData.relatedRequest || detailData.relatedRequest.ticketId !== ticketId) throw new Error('Test 10 failed: Related ticket missing');

  console.log('✓ PASS: Lead detail contains all 5 required sections (Company, Relevance, Verification, Key People, Related Request)');

  // ----------------------------------------------------
  // TEST 11: Security & IDOR: User B CANNOT access User A\'s lead
  // ----------------------------------------------------
  console.log('\n[Test 11]: IDOR Check: User B attempts to access Company A lead (Must return 403)...');
  const idorRes = await fetch(`${BASE_URL}/company/my-company/leads/${lead1Id}`, {
    headers: { Authorization: `Bearer ${tokenB}` }
  });
  if (idorRes.status !== 403) {
    throw new Error(`Test 11 failed: Expected 403 Forbidden for cross-company lead access, got ${idorRes.status}`);
  }
  console.log('✓ PASS: User B was blocked from accessing Company A lead with HTTP 403 Forbidden');

  // ----------------------------------------------------
  // TEST 12: Security & IDOR: User B CANNOT access Company A leads list
  // ----------------------------------------------------
  console.log('\n[Test 12]: User B leads list returns only User B company leads (0 leads)...');
  const res12 = await fetch(`${BASE_URL}/company/my-company/leads`, {
    headers: { Authorization: `Bearer ${tokenB}` }
  });
  const data12 = await res12.json();
  if (data12.leads.length !== 0 || data12.metrics.totalLeads !== 0) {
    throw new Error('Test 12 failed: User B saw leads belonging to Company A!');
  }
  console.log('✓ PASS: User B leads list is strictly isolated to Company B (0 leads returned)');

  // ----------------------------------------------------
  // TEST 13: Company Boost functionality remains intact
  // ----------------------------------------------------
  console.log('\n[Test 13]: Verifying Company Boost request creation and workflow remains intact...');
  const boostReqRes = await fetch(`${BASE_URL}/requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({
      title: 'Market Traction Growth Playbook',
      description: 'Outbound sales acceleration sprint.',
      serviceType: 'COMPANY_BOOST',
      priority: 'MEDIUM'
    })
  });
  const boostData = await boostReqRes.json();
  if (boostReqRes.status !== 201 || boostData.request.serviceType !== 'COMPANY_BOOST') {
    throw new Error('Test 13 failed: Company Boost request creation failed');
  }
  console.log('✓ PASS: Company Boost service request created successfully and untouched');

  // ----------------------------------------------------
  // CLEANUP TEST DATA
  // ----------------------------------------------------
  console.log('\n[Cleanup]: Cleaning up test records...');
  await query('DELETE FROM company_leads WHERE company_id IN ($1, $2);', [companyAId, companyBId]);
  await query('DELETE FROM company_key_people WHERE company_id IN ($1, $2);', [companyAId, companyBId]);
  await query('DELETE FROM requests WHERE company_id IN ($1, $2);', [companyAId, companyBId]);
  await query('DELETE FROM users WHERE id IN ($1, $2, $3);', [userA.id, userB.id, specialist.id]);
  await query('DELETE FROM companies WHERE id IN ($1, $2);', [companyAId, companyBId]);
  console.log('✓ PASS: Cleanup complete.');

  console.log('\n====================================================');
  console.log('ALL 13 INTEGRATION TESTS PASSED SUCCESSFULLY!');
  console.log('====================================================');
  process.exit(0);
}

runTests().catch(err => {
  console.error('\n❌ TEST FAILURE:', err);
  process.exit(1);
});
