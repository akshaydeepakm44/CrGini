import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

import { query, connectPostgres } from './src/config/postgres.js';

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

async function runNewUserCreationSuite() {
  console.log('====================================================');
  console.log('NEW ADMIN USER CREATION FLOW TEST SUITE');
  console.log('(No Welcome Email, No Initial Poster/Video)');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const testEmail = `newflow.client.${Date.now()}@creativegini.test`;
  const clientName = 'New Flow Client';
  const companyName = 'New Flow Technologies Inc';
  const tempPassword = 'NewClientPass@123';

  let adminToken = null;
  let userToken = null;
  let createdUserId = null;
  let createdCompanyId = null;

  try {
    await connectPostgres();

    // 1. Admin logs in
    console.log('[Step 1]: Admin logs in...');
    const adminLoginRes = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'team@creativegini.com', password: process.env.EMAIL_PASSWORD || 'Admin@2026' })
    });

    if (adminLoginRes.ok && adminLoginRes.data?.token) {
      adminToken = adminLoginRes.data.token;
      console.log('✓ Admin authenticated successfully.');
      passed++;
    } else {
      console.error('✗ Admin login failed:', adminLoginRes.data);
      failed++;
      return;
    }

    // 2. Admin creates user without poster/video/email
    console.log('\n[Step 2]: Admin creates user with details only (no files, no email step)...');
    const createRes = await request('/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        companyName,
        contactPerson: clientName,
        email: testEmail,
        password: tempPassword,
        phone: '+1 555 432 1098',
        website: 'https://newflow.example.com',
        industry: 'Enterprise Cloud AI',
        companyInfo: 'Next-gen enterprise software solutions'
      })
    }, adminToken);

    if (createRes.status === 201 && createRes.data?.success && createRes.data?.user?.id) {
      createdUserId = createRes.data.user.id;
      createdCompanyId = createRes.data.user.company?.id || createRes.data.user.companyId;
      console.log(`✓ Account created successfully with status 201. User ID: ${createdUserId}, Company ID: ${createdCompanyId}`);
      passed++;
    } else {
      console.error('✗ Failed to create user:', createRes.data);
      failed++;
      return;
    }

    // 3. Verify no welcome email sent in activity logs
    console.log('\n[Step 3]: Verify no welcome email was sent automatically during creation...');
    const emailLogRes = await query(
      `SELECT * FROM activity_logs WHERE action = 'WELCOME_EMAIL_SENT' AND (details ILIKE $1 OR details ILIKE $2)`,
      [`%${testEmail}%`, `%${createdUserId}%`]
    );
    if (emailLogRes.rows.length === 0) {
      console.log('✓ Confirmed: Zero welcome emails sent for newly created user.');
      passed++;
    } else {
      console.error('✗ Unexpected welcome email log found:', emailLogRes.rows);
      failed++;
    }

    // 4. Verify no onboarding ticket created
    console.log('\n[Step 4]: Verify no onboarding ticket was created in requests table...');
    const ticketRes = await query(
      `SELECT * FROM requests WHERE user_id = $1`,
      [createdUserId]
    );
    if (ticketRes.rows.length === 0) {
      console.log('✓ Confirmed: Zero tickets created for user (no "Welcome / Initial Marketing Assets" ticket).');
      passed++;
    } else {
      console.error('✗ Unexpected tickets found for new user:', ticketRes.rows);
      failed++;
    }

    // 5. Verify no onboarding submissions created
    console.log('\n[Step 5]: Verify no onboarding submissions were created...');
    const subRes = await query(
      `SELECT s.* FROM submissions s 
       JOIN requests r ON r.id = s.request_id 
       WHERE r.user_id = $1`,
      [createdUserId]
    );
    if (subRes.rows.length === 0) {
      console.log('✓ Confirmed: Zero submissions created for new user.');
      passed++;
    } else {
      console.error('✗ Unexpected submissions found:', subRes.rows);
      failed++;
    }

    // 6. Verify no submission_files created
    console.log('\n[Step 6]: Verify no submission_files exist for new user...');
    const filesRes = await query(
      `SELECT sf.* FROM submission_files sf
       JOIN submissions s ON s.id = sf.submission_id
       JOIN requests r ON r.id = s.request_id
       WHERE r.user_id = $1`,
      [createdUserId]
    );
    if (filesRes.rows.length === 0) {
      console.log('✓ Confirmed: Zero submission_files exist for new user.');
      passed++;
    } else {
      console.error('✗ Unexpected submission_files found:', filesRes.rows);
      failed++;
    }

    // 7. Login as the newly created user
    console.log('\n[Step 7]: Login as the newly created client user...');
    const userLoginRes = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: testEmail, password: tempPassword })
    });

    if (userLoginRes.ok && userLoginRes.data?.token) {
      userToken = userLoginRes.data.token;
      console.log('✓ Client user logged in successfully with temporary password.');
      passed++;
    } else {
      console.error('✗ Client user login failed:', userLoginRes.data);
      failed++;
      return;
    }

    // 8. Verify user Assets library has 0 items initially
    console.log('\n[Step 8]: Check user Assets library (must be empty initially)...');
    const userAssetsRes = await request('/assets', { method: 'GET' }, userToken);
    if (userAssetsRes.ok && userAssetsRes.data?.success && Array.isArray(userAssetsRes.data.assets)) {
      if (userAssetsRes.data.assets.length === 0) {
        console.log(`✓ Confirmed: User Assets library has 0 assets upon creation.`);
        passed++;
      } else {
        console.error(`✗ Expected 0 assets, found: ${userAssetsRes.data.assets.length}`);
        failed++;
      }
    } else {
      console.error('✗ Failed to fetch user assets:', userAssetsRes.data);
      failed++;
    }

    // 9. Create a normal team ticket and submit completed work to verify Assets library works
    console.log('\n[Step 9]: Create a normal team ticket and submit work (verifying Assets library works as expected)...');
    const ticketCode = `CG-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReqRes = await query(
      `INSERT INTO requests (ticket_id, user_id, company_id, service_type, title, description, priority, status, price, payment_status, created_at, updated_at)
       VALUES ($1, $2, $3, 'COMPANY_BOOST', 'Q4 Brand Growth Deliverables', 'Deliver campaign poster and promo video', 'HIGH', 'IN_PROGRESS', 500, 'PAID', NOW(), NOW())
       RETURNING id, ticket_id`,
      [ticketCode, createdUserId, createdCompanyId]
    );
    const dbTicket = newReqRes.rows[0];
    console.log(`✓ Created regular ticket ${dbTicket.ticket_id} (ID: ${dbTicket.id})`);

    // Submit work on this ticket via admin / team API
    const samplePosterData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    const submitRes = await request(`/requests/${dbTicket.id}/submissions`, {
      method: 'POST',
      body: JSON.stringify({
        title: 'Campaign Deliverables V1',
        description: 'First version of poster and campaign deliverables',
        files: [
          {
            name: 'q4-growth-poster.png',
            url: samplePosterData,
            size: 1024,
            type: 'image/png'
          }
        ]
      })
    }, adminToken);

    if (submitRes.ok && submitRes.data?.success) {
      console.log('✓ Submitted deliverables for regular ticket successfully.');
      passed++;
    } else {
      console.error('✗ Failed to submit deliverables:', submitRes.data);
      failed++;
    }

    // 10. Verify submitted work appears in User Assets
    console.log('\n[Step 10]: Verify submitted deliverables appear in User Assets...');
    const userAssetsAfterSub = await request('/assets', { method: 'GET' }, userToken);
    if (userAssetsAfterSub.ok && userAssetsAfterSub.data?.assets?.length > 0) {
      const asset = userAssetsAfterSub.data.assets.find(a => (a.fileName || a.file_name) === 'q4-growth-poster.png');
      if (asset) {
        console.log(`✓ Verified: File "${asset.fileName || asset.file_name}" appears in User Assets under ticket ${asset.ticketCode || asset.ticket_code}!`);
        passed++;
      } else {
        console.error('✗ File not found in User Assets:', userAssetsAfterSub.data.assets);
        failed++;
      }
    } else {
      console.error('✗ User Assets empty after submission:', userAssetsAfterSub.data);
      failed++;
    }

    // 11. Verify submitted work appears in Admin Assets
    console.log('\n[Step 11]: Verify submitted deliverables appear in Admin Assets...');
    const adminAssetsRes = await request('/assets', { method: 'GET' }, adminToken);
    if (adminAssetsRes.ok && adminAssetsRes.data?.assets?.length > 0) {
      const asset = adminAssetsRes.data.assets.find(a => (a.fileName || a.file_name) === 'q4-growth-poster.png');
      if (asset) {
        console.log(`✓ Verified: File "${asset.fileName || asset.file_name}" appears in Admin Assets with company "${asset.companyName || asset.company_name}"!`);
        passed++;
      } else {
        console.error('✗ File not found in Admin Assets');
        failed++;
      }
    } else {
      console.error('✗ Admin Assets fetch failed:', adminAssetsRes.data);
      failed++;
    }

    // Clean up test records
    console.log('\n[Cleanup]: Cleaning up test records...');
    try {
      await query(`DELETE FROM submission_files WHERE submission_id IN (SELECT id FROM submissions WHERE request_id = $1)`, [dbTicket.id]);
      await query(`DELETE FROM submissions WHERE request_id = $1`, [dbTicket.id]);
      await query(`DELETE FROM requests WHERE user_id = $1`, [createdUserId]);
      await query(`DELETE FROM users WHERE id = $1`, [createdUserId]);
      if (createdCompanyId) {
        await query(`DELETE FROM companies WHERE id = $1`, [createdCompanyId]);
      }
      console.log('✓ Cleanup completed.');
    } catch (cleanErr) {
      console.warn('Cleanup notice:', cleanErr.message);
    }

  } catch (err) {
    console.error('Suite error:', err);
    failed++;
  } finally {
    console.log('\n====================================================');
    console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');
    process.exit(failed > 0 ? 1 : 0);
  }
}

runNewUserCreationSuite();
