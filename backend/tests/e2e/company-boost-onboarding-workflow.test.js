import assert from 'assert';
import { query } from '../../src/config/postgres.js';
import { findCompanyById } from '../../src/repositories/companyRepository.js';
import { findUserByEmail } from '../../src/repositories/userRepository.js';

const API_BASE = 'http://localhost:5000/api';

async function run() {
  console.log('================================================================');
  console.log('TEST: Company Boost Onboarding Workflow & Asset Pipeline E2E');
  console.log('================================================================');

  // STEP 1: Authenticate Super Admin
  console.log('\n[Step 1]: Authenticating Super Admin...');
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'team@creativegini.com', password: 'Admin@2026' })
  });
  const loginData = await loginRes.json();
  assert.strictEqual(loginRes.status, 200, 'Admin login status 200');
  assert.ok(loginData.token, 'Admin token received');
  const adminToken = loginData.token;
  console.log('✓ Admin authenticated successfully.');

  // STEP 2: Create a Company Boost Specialist (if not present) and get token
  console.log('\n[Step 2]: Setting up Company Boost Specialist...');
  const boostEmail = 'boost.test.specialist@creativegini.com';
  let boostUser = await findUserByEmail(boostEmail);
  if (!boostUser) {
    const userRes = await query(`
      INSERT INTO users (name, email, password, role, company_boost, status, is_deleted)
      VALUES ('Bhavya Boost', $1, 'Specialist@2026', 'COMPANY_BOOST', true, 'ACTIVE', false)
      RETURNING id, name, email, role
    `, [boostEmail]);
    boostUser = userRes.rows[0];
  }
  // Generate a valid JWT for specialist
  const jwt = (await import('jsonwebtoken')).default;
  const boostToken = jwt.sign(
    { id: boostUser.id, role: boostUser.role || 'COMPANY_BOOST' },
    process.env.JWT_SECRET || 'creativegini_jwt_secret_2026_production_key_secure',
    { expiresIn: '1d' }
  );
  console.log('✓ Specialist token ready.');

  // STEP 3: Create a new Client & Company
  console.log('\n[Step 3]: Admin creating client "Apex Growth Labs"...');
  const clientEmail = `client.boost.${Date.now()}@example.com`;
  const createClientRes = await fetch(`${API_BASE}/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      name: 'Apex Founder',
      email: clientEmail,
      phone: '+1 555-0199',
      companyName: 'Apex Growth Labs',
      website: 'https://apexgrowth.io',
      industry: 'B2B SaaS',
      companyInfo: 'AI-powered pipeline acceleration platform.'
    })
  });
  const clientData = await createClientRes.json();
  assert.strictEqual(createClientRes.status, 201, 'Client created status 201');
  assert.ok(clientData.user, 'Client user object returned');
  const clientId = clientData.user.id || clientData.user._id;
  const companyId = clientData.user.company?._id || clientData.user.company?.id || clientData.user.companyId;
  const tempPassword = clientData.temporaryPassword;
  console.log(`✓ Client created: ID=${clientId}, CompanyID=${companyId}`);

  // Authenticate Client
  const clientLoginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: clientEmail, password: tempPassword })
  });
  const clientLoginData = await clientLoginRes.json();
  assert.strictEqual(clientLoginRes.status, 200, 'Client login successful');
  const clientToken = clientLoginData.token;
  console.log('✓ Client login token verified.');

  // STEP 4: Initial Onboarding Assets Check (Pending)
  console.log('\n[Step 4]: Verifying initial pending onboarding assets for client...');
  const initialAssetsRes = await fetch(`${API_BASE}/company/my-company/onboarding-assets`, {
    headers: { 'Authorization': `Bearer ${clientToken}` }
  });
  assert.strictEqual(initialAssetsRes.status, 200);
  const initialAssetsData = await initialAssetsRes.json();
  assert.strictEqual(initialAssetsData.status.poster, 'Pending');
  assert.strictEqual(initialAssetsData.status.video, 'Pending');
  assert.strictEqual(initialAssetsData.status.strategicPlan, 'Pending');
  assert.strictEqual(initialAssetsData.status.devrelPlan, 'Pending');
  console.log('✓ Initial status correctly reports Pending for all 4 items.');

  // STEP 5: Specialist uploads sample work (PDF, Image, Video, DevRel PDF)
  console.log('\n[Step 5]: Company Boost team uploading all 4 onboarding sample assets...');
  const samplePdfData = 'data:application/pdf;base64,' + Buffer.from('%PDF-1.4 sample strategic roadmap').toString('base64');
  const samplePosterData = 'data:image/png;base64,' + Buffer.from('fake png image bytes for high res poster').toString('base64');
  const sampleVideoData = 'data:video/mp4;base64,' + Buffer.from('fake mp4 video bytes for product demo teaser').toString('base64');
  const sampleDevRelPdfData = 'data:application/pdf;base64,' + Buffer.from('%PDF-1.4 sample devrel strategy').toString('base64');

  const saveAssetsRes = await fetch(`${API_BASE}/company/${companyId}/onboarding-assets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${boostToken}`
    },
    body: JSON.stringify({
      strategicPlan: {
        name: 'Apex_Strategic_Growth_Plan_V1.pdf',
        size: 204800,
        type: 'application/pdf',
        dataUrl: samplePdfData
      },
      poster: {
        name: 'Apex_Branded_Launch_Poster.png',
        size: 512000,
        type: 'image/png',
        dataUrl: samplePosterData
      },
      video: {
        name: 'Apex_Showcase_Demo_Teaser.mp4',
        size: 2097152,
        type: 'video/mp4',
        dataUrl: sampleVideoData
      },
      devrelPlan: {
        name: 'Apex_DevRel_Developer_Framework.pdf',
        size: 153600,
        type: 'application/pdf',
        dataUrl: sampleDevRelPdfData
      }
    })
  });

  assert.strictEqual(saveAssetsRes.status, 200, 'Save assets status 200');
  const saveAssetsContentType = saveAssetsRes.headers.get('content-type');
  assert.ok(saveAssetsContentType.includes('application/json'), 'Response is application/json (NOT HTML)');
  const saveAssetsData = await saveAssetsRes.json();
  assert.strictEqual(saveAssetsData.success, true, 'Save assets response success=true');
  assert.ok(saveAssetsData.ticketId, 'Onboarding ticket ID returned');
  console.log(`✓ Sample assets saved successfully. Ticket: ${saveAssetsData.ticketId}`);

  // STEP 6: Verify Client can fetch and see all 4 assets directly
  console.log('\n[Step 6]: Client fetching onboarding assets from User Dashboard...');
  const clientAssetsRes = await fetch(`${API_BASE}/company/my-company/onboarding-assets`, {
    headers: { 'Authorization': `Bearer ${clientToken}` }
  });
  assert.strictEqual(clientAssetsRes.status, 200);
  const clientAssetsData = await clientAssetsRes.json();
  assert.strictEqual(clientAssetsData.success, true);
  const { assets, status } = clientAssetsData;

  // Verify all 4 assets are present and status is 'Uploaded'
  assert.strictEqual(status.strategicPlan, 'Uploaded');
  assert.strictEqual(status.poster, 'Uploaded');
  assert.strictEqual(status.video, 'Uploaded');
  assert.strictEqual(status.devrelPlan, 'Uploaded');

  assert.ok(assets.strategicPlan && assets.strategicPlan.id, 'Strategic plan asset present with ID');
  assert.ok(assets.poster && assets.poster.id, 'Poster asset present with ID');
  assert.ok(assets.video && assets.video.id, 'Video asset present with ID');
  assert.ok(assets.devrelPlan && assets.devrelPlan.id, 'DevRel plan asset present with ID');

  assert.strictEqual(assets.strategicPlan.name, 'Apex_Strategic_Growth_Plan_V1.pdf');
  assert.strictEqual(assets.poster.name, 'Apex_Branded_Launch_Poster.png');
  assert.strictEqual(assets.video.name, 'Apex_Showcase_Demo_Teaser.mp4');
  assert.strictEqual(assets.devrelPlan.name, 'Apex_DevRel_Developer_Framework.pdf');
  console.log('✓ All 4 assets identified with exact metadata and IDs.');

  // STEP 7: Stream & Download verification with token (tenant-isolated media pipeline)
  console.log('\n[Step 7]: Testing streaming & downloading of all media assets...');

  // A. Image Streaming
  const posterStreamRes = await fetch(`${API_BASE}/assets/${assets.poster.id}/stream?token=${encodeURIComponent(clientToken)}`);
  assert.strictEqual(posterStreamRes.status, 200, 'Poster stream status 200');
  assert.strictEqual(posterStreamRes.headers.get('content-type'), 'image/png', 'Poster MIME image/png');
  console.log('✓ Poster image streaming validated.');

  // B. Video Streaming with HTTP 206 Range seeking
  const videoRangeRes = await fetch(`${API_BASE}/assets/${assets.video.id}/stream?token=${encodeURIComponent(clientToken)}`, {
    headers: { 'Range': 'bytes=0-1023' }
  });
  assert.strictEqual(videoRangeRes.status, 206, 'Video Range request status 206 Partial Content');
  assert.ok(videoRangeRes.headers.get('content-range'), 'Content-Range header present for video seeking');
  assert.strictEqual(videoRangeRes.headers.get('content-type'), 'video/mp4', 'Video MIME video/mp4');
  console.log('✓ Video native streaming with HTTP Range seeking validated.');

  // C. PDF Document Streaming
  const pdfStreamRes = await fetch(`${API_BASE}/assets/${assets.strategicPlan.id}/stream?token=${encodeURIComponent(clientToken)}`);
  assert.strictEqual(pdfStreamRes.status, 200, 'Strategic Plan PDF stream status 200');
  assert.strictEqual(pdfStreamRes.headers.get('content-type'), 'application/pdf', 'PDF MIME application/pdf');
  console.log('✓ Strategic Plan PDF streaming validated.');

  // STEP 8: Idempotent Retry & Replacement Behavior
  console.log('\n[Step 8]: Testing retry & asset replacement without duplication...');
  // Check count of files before retry
  const countBeforeRes = await query(
    'SELECT COUNT(*)::int as count FROM submission_files sf JOIN submissions s ON sf.submission_id = s.id JOIN requests r ON s.request_id = r.id WHERE r.company_id = $1',
    [companyId]
  );
  const countBefore = countBeforeRes.rows[0].count;
  assert.strictEqual(countBefore, 4, 'Exactly 4 files before retry');

  // Replace only the video, keeping other assets untouched (sending existing assets with id and no dataUrl)
  const newVideoData = 'data:video/mp4;base64,' + Buffer.from('replacement video v2 demo').toString('base64');
  const retryRes = await fetch(`${API_BASE}/company/${companyId}/onboarding-assets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${boostToken}`
    },
    body: JSON.stringify({
      strategicPlan: assets.strategicPlan, // existing asset untouched
      poster: assets.poster,               // existing asset untouched
      video: {
        name: 'Apex_Showcase_Demo_V2.mp4',
        size: 3145728,
        type: 'video/mp4',
        dataUrl: newVideoData
      },
      devrelPlan: assets.devrelPlan        // existing asset untouched
    })
  });
  assert.strictEqual(retryRes.status, 200);

  // Check count of files after replacement
  const countAfterRes = await query(
    'SELECT COUNT(*)::int as count FROM submission_files sf JOIN submissions s ON sf.submission_id = s.id JOIN requests r ON s.request_id = r.id WHERE r.company_id = $1',
    [companyId]
  );
  const countAfter = countAfterRes.rows[0].count;
  assert.strictEqual(countAfter, 4, 'Still exactly 4 files after retry (no duplicate files created)');

  // Verify the video was updated
  const updatedAssetsRes = await fetch(`${API_BASE}/company/my-company/onboarding-assets`, {
    headers: { 'Authorization': `Bearer ${clientToken}` }
  });
  const updatedData = await updatedAssetsRes.json();
  assert.strictEqual(updatedData.assets.video.name, 'Apex_Showcase_Demo_V2.mp4');
  console.log('✓ Video replacement succeeded without duplicate records.');

  // STEP 9: Strict Tenant Isolation
  console.log('\n[Step 9]: Verifying tenant isolation across companies...');
  // Create Company B
  const clientBEmail = `client.other.${Date.now()}@example.com`;
  const createClientBRes = await fetch(`${API_BASE}/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      name: 'Other Founder',
      email: clientBEmail,
      companyName: 'Competitor Corp'
    })
  });
  const clientBData = await createClientBRes.json();
  const clientBLoginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: clientBEmail, password: clientBData.temporaryPassword })
  });
  const clientBToken = (await clientBLoginRes.json()).token;

  // Attempt 1: Client B tries to fetch Company A's onboarding assets
  const unauthorizedOnbRes = await fetch(`${API_BASE}/company/${companyId}/onboarding-assets`, {
    headers: { 'Authorization': `Bearer ${clientBToken}` }
  });
  assert.strictEqual(unauthorizedOnbRes.status, 403, 'Unauthorized company rejected with 403 Forbidden');
  console.log('✓ Company B blocked from accessing Company A onboarding assets endpoint.');

  // Attempt 2: Client B tries to stream Company A's video asset
  const unauthorizedStreamRes = await fetch(`${API_BASE}/assets/${updatedData.assets.video.id}/stream?token=${encodeURIComponent(clientBToken)}`);
  assert.strictEqual(unauthorizedStreamRes.status, 403, 'Unauthorized company blocked from streaming asset');
  console.log('✓ Company B blocked from streaming Company A asset (403 Forbidden).');

  // STEP 10: Assets View Integration Check
  console.log('\n[Step 10]: Verifying Assets page integration (Single Source of Truth)...');
  const assetsLibraryRes = await fetch(`${API_BASE}/assets`, {
    headers: { 'Authorization': `Bearer ${clientToken}` }
  });
  assert.strictEqual(assetsLibraryRes.status, 200);
  const assetsLibraryData = await assetsLibraryRes.json();
  assert.strictEqual(assetsLibraryData.success, true);
  assert.ok(assetsLibraryData.count >= 4, 'Assets library lists the 4 onboarding assets');
  console.log(`✓ Assets Library lists ${assetsLibraryData.count} assets for client from the unified database tables.`);

  // Cleanup test client data
  console.log('\n[Step 11]: Cleaning up test records...');
  await query('DELETE FROM requests WHERE company_id IN ($1, $2)', [companyId, clientBData.user.companyId || clientBData.user.company?.id]);
  await query('DELETE FROM users WHERE email IN ($1, $2, $3)', [clientEmail, clientBEmail, boostEmail]);
  await query('DELETE FROM companies WHERE id IN ($1, $2)', [companyId, clientBData.user.companyId || clientBData.user.company?.id]);
  console.log('✓ Test cleanup complete.');

  console.log('\n================================================================');
  console.log('🎉 ALL COMPANY BOOST ONBOARDING WORKFLOW & ASSET TESTS PASSED!');
  console.log('================================================================\n');
  process.exit(0);
}

run().catch((err) => {
  console.error('\n❌ TEST FAILURE:', err);
  process.exit(1);
});
