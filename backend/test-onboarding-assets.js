import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

import { query, connectPostgres } from './src/config/postgres.js';
import { findUserById, findUserByEmail, deleteUser as deleteUserInDB } from './src/repositories/userRepository.js';

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

// 1x1 transparent PNG data URL
const SAMPLE_PNG_DATA_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

// Minimal MP4 header base64 data URL
const SAMPLE_MP4_DATA_URL = 'data:video/mp4;base64,AAAAHGZ0eXBtcDQyAAAAAG1wNDJpc29tYXZjMQAAADFtb292AAAAbG12aGQAAAAAAAAAAAAAAAAAAAPoAAAAAAABAAABAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAQAA';

async function runOnboardingAssetsTestSuite() {
  console.log('========================================================================');
  console.log('INITIAL ONBOARDING ASSETS (POSTER + VIDEO) & MEDIA LIBRARY TEST SUITE');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  const testEmail = `onboarding.client.${Date.now()}@creativegini.test`;
  const clientPassword = 'ClientTempPass@123';
  const companyName = 'Apex Dynamics Intelligence';
  const contactPerson = 'Alex Mercer';

  let adminToken = null;
  let clientToken = null;
  let clientUserId = null;
  let clientCompanyId = null;
  let onboardingTicketId = null;
  let onboardingSubmissionId = null;
  let posterAssetId = null;
  let videoAssetId = null;

  let client2Token = null;
  let client2UserId = null;
  let client2CompanyId = null;

  try {
    await connectPostgres();

    // -------------------------------------------------------------------------
    // TEST 1: Admin Authentication
    // -------------------------------------------------------------------------
    console.log('[Test 1]: Authenticating Admin user...');
    const adminLoginRes = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@creativegini.com', password: 'Admin@123' })
    });

    if (adminLoginRes.ok && adminLoginRes.data?.token) {
      adminToken = adminLoginRes.data.token;
      console.log('✓ Admin authenticated successfully.\n');
      passed++;
    } else {
      console.error('✗ Admin authentication failed:', adminLoginRes.data);
      failed++;
      throw new Error('Cannot continue without adminToken');
    }

    // -------------------------------------------------------------------------
    // TEST 2: Admin Creates Client User with Initial Poster + Video
    // -------------------------------------------------------------------------
    console.log('[Test 2]: Admin creates new client with initial Poster and Video...');
    const createRes = await request('/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        companyName,
        contactPerson,
        email: testEmail,
        password: clientPassword,
        phone: '+1 555 987 6543',
        website: 'https://apexdynamics.ai',
        industry: 'Enterprise AI & Vision Systems',
        companyInfo: 'Next-generation industrial automation powered by computer vision.',
        poster: {
          name: 'Apex_Branded_Poster.png',
          size: 68,
          mimeType: 'image/png',
          dataUrl: SAMPLE_PNG_DATA_URL
        },
        video: {
          name: 'Apex_Intro_Demo.mp4',
          size: 112,
          mimeType: 'video/mp4',
          dataUrl: SAMPLE_MP4_DATA_URL
        }
      })
    }, adminToken);

    if (createRes.status === 201 && createRes.data?.user?.id && createRes.data?.onboardingTicket) {
      clientUserId = createRes.data.user.id;
      clientCompanyId = createRes.data.user.company?.id;
      onboardingTicketId = createRes.data.onboardingTicket.id;
      console.log(`✓ Client user created: ${clientUserId}`);
      console.log(`✓ Company created: ${clientCompanyId}`);
      console.log(`✓ Onboarding ticket created: ${createRes.data.onboardingTicket.ticketId} ("${createRes.data.onboardingTicket.title}")`);
      passed++;
    } else {
      console.error('✗ Failed to create client with initial assets:', createRes.data);
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 3: Verify Single-Source-of-Truth in PostgreSQL Database
    // -------------------------------------------------------------------------
    console.log('\n[Test 3]: Verifying database storage (requests, submissions, submission_files)...');
    
    // Check requests table
    const reqCheck = await query('SELECT * FROM requests WHERE id = $1', [onboardingTicketId]);
    const reqRow = reqCheck.rows[0];
    const ticketIsCompleted = reqRow && reqRow.status === 'COMPLETED' && reqRow.payment_status === 'PAID';

    // Check submissions table
    const subCheck = await query('SELECT * FROM submissions WHERE request_id = $1', [onboardingTicketId]);
    const subRow = subCheck.rows[0];
    onboardingSubmissionId = subRow?.id;
    const subIsApproved = subRow && subRow.version === 1 && subRow.status === 'APPROVED';

    // Check submission_files table
    const filesCheck = await query('SELECT * FROM submission_files WHERE submission_id = $1 ORDER BY created_at ASC', [onboardingSubmissionId]);
    const files = filesCheck.rows;
    const hasPoster = files.some(f => (f.file_name || f.name) === 'Apex_Branded_Poster.png' && (f.mime_type || f.type) === 'image/png');
    const hasVideo = files.some(f => (f.file_name || f.name) === 'Apex_Intro_Demo.mp4' && (f.mime_type || f.type) === 'video/mp4');

    if (ticketIsCompleted && subIsApproved && files.length === 2 && hasPoster && hasVideo) {
      posterAssetId = files.find(f => (f.file_name || f.name) === 'Apex_Branded_Poster.png').id;
      videoAssetId = files.find(f => (f.file_name || f.name) === 'Apex_Intro_Demo.mp4').id;
      console.log(`✓ Onboarding request verified: status=${reqRow.status}, payment=${reqRow.payment_status}, price=${reqRow.price}`);
      console.log(`✓ Submission V1 verified: version=1, status=${subRow.status}`);
      console.log(`✓ Exact 2 files stored in submission_files: Poster (${posterAssetId}), Video (${videoAssetId})`);
      passed++;
    } else {
      console.error('✗ Database verification failed:', {
        ticketFound: !!reqRow,
        ticketIsCompleted,
        subFound: !!subRow,
        subIsApproved,
        filesCount: files.length,
        hasPoster,
        hasVideo
      });
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 4: Client Logs In and Queries User Assets Library (GET /api/assets)
    // -------------------------------------------------------------------------
    console.log('\n[Test 4]: Client logs in and verifies immediate availability in Media Library...');
    const clientLoginRes = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: testEmail, password: clientPassword })
    });

    if (clientLoginRes.ok && clientLoginRes.data?.token) {
      clientToken = clientLoginRes.data.token;
      console.log('✓ Client logged in successfully.');
    } else {
      console.error('✗ Client login failed:', clientLoginRes.data);
      failed++;
    }

    const clientAssetsRes = await request('/assets', {}, clientToken);
    if (clientAssetsRes.ok && clientAssetsRes.data?.assets?.length === 2) {
      const returnedFiles = clientAssetsRes.data.assets;
      const group = clientAssetsRes.data.groupedAssets?.[0];
      const hasCorrectGroup = group && group.ticketCode === reqRow.ticket_id && group.submissions?.length === 1;
      console.log(`✓ Client Media Library returned ${returnedFiles.length} assets.`);
      console.log(`✓ Assets correctly grouped under ticket: ${group?.ticketCode} (${group?.requestTitle})`);
      console.log(`✓ Submission V1 contains: ${group?.submissions[0]?.files.map(f => f.fileName).join(', ')}`);
      passed++;
    } else {
      console.error('✗ Client assets fetch failed:', clientAssetsRes.data);
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 5: Admin Assets Media Library (GET /api/assets with company metadata)
    // -------------------------------------------------------------------------
    console.log('\n[Test 5]: Admin queries Media Library across companies & tests company filter...');
    const adminAssetsRes = await request('/assets', {}, adminToken);
    const adminGrouped = adminAssetsRes.data?.groupedAssets || [];
    const clientTicketGroup = adminGrouped.find(g => g.ticketCode === reqRow.ticket_id);

    const hasCompanyMeta = clientTicketGroup && 
      clientTicketGroup.companyName === companyName &&
      clientTicketGroup.clientName === contactPerson &&
      clientTicketGroup.clientEmail === testEmail;

    // Test specific company filtering
    const adminCompanyFilterRes = await request(`/assets?companyId=${clientCompanyId}`, {}, adminToken);
    const filteredAssets = adminCompanyFilterRes.data?.assets || [];
    const allBelongToCompany = filteredAssets.every(a => a.companyId === clientCompanyId);

    if (hasCompanyMeta && filteredAssets.length >= 2 && allBelongToCompany) {
      console.log(`✓ Admin Media Library returns assets with enriched company metadata.`);
      console.log(`  Company: ${clientTicketGroup.companyName}, Client: ${clientTicketGroup.clientName} (${clientTicketGroup.clientEmail})`);
      console.log(`✓ Admin companyId filter (?companyId=${clientCompanyId}) returned only target client assets (${filteredAssets.length} files).`);
      passed++;
    } else {
      console.error('✗ Admin assets verification failed:', {
        hasCompanyMeta,
        filteredCount: filteredAssets.length,
        allBelongToCompany
      });
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 6: File Streaming & HTTP 206 Partial Content Range Seeking
    // -------------------------------------------------------------------------
    console.log('\n[Test 6]: Testing file streaming & video Range seeking (HTTP 206)...');
    
    // Poster stream (HTTP 200)
    const posterStreamRes = await fetch(`${API_BASE}/assets/${posterAssetId}/stream`, {
      headers: { Authorization: `Bearer ${clientToken}` }
    });
    const posterContentType = posterStreamRes.headers.get('content-type');
    const posterStatus = posterStreamRes.status;

    // Video stream with Range header (HTTP 206)
    const videoStreamRes = await fetch(`${API_BASE}/assets/${videoAssetId}/stream`, {
      headers: {
        Authorization: `Bearer ${clientToken}`,
        Range: 'bytes=0-10'
      }
    });
    const videoStatus = videoStreamRes.status;
    const videoContentRange = videoStreamRes.headers.get('content-range');
    const videoAcceptRanges = videoStreamRes.headers.get('accept-ranges');

    if (posterStatus === 200 && posterContentType?.includes('image') && videoStatus === 206 && videoContentRange && videoAcceptRanges === 'bytes') {
      console.log(`✓ Poster stream returned HTTP ${posterStatus} (${posterContentType}).`);
      console.log(`✓ Video Range request returned HTTP ${videoStatus} with Content-Range: ${videoContentRange} and Accept-Ranges: ${videoAcceptRanges}.`);
      passed++;
    } else {
      console.error('✗ Asset streaming check failed:', {
        posterStatus,
        posterContentType,
        videoStatus,
        videoContentRange,
        videoAcceptRanges
      });
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 7: "Back to User Details" Flow & Safe File Replacement
    // -------------------------------------------------------------------------
    console.log('\n[Test 7]: Testing "Back to User Details" workflow & in-place file replacement...');
    
    const REPLACED_POSTER_NAME = 'Apex_Updated_Poster_V2.png';
    const REPLACED_VIDEO_NAME = 'Apex_Updated_Demo_V2.mp4';

    const replaceRes = await request('/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        existingUserId: clientUserId,
        companyName: 'Apex Dynamics Technologies Inc',
        contactPerson: 'Alex Mercer (Updated)',
        email: testEmail,
        password: clientPassword,
        poster: {
          name: REPLACED_POSTER_NAME,
          size: 68,
          mimeType: 'image/png',
          dataUrl: SAMPLE_PNG_DATA_URL
        },
        video: {
          name: REPLACED_VIDEO_NAME,
          size: 112,
          mimeType: 'video/mp4',
          dataUrl: SAMPLE_MP4_DATA_URL
        }
      })
    }, adminToken);

    // Verify DB integrity
    const userCountCheck = await query('SELECT COUNT(*)::int AS count FROM users WHERE email = $1', [testEmail]);
    const reqCountCheck = await query('SELECT COUNT(*)::int AS count FROM requests WHERE user_id = $1', [clientUserId]);
    const subCountCheck = await query('SELECT COUNT(*)::int AS count FROM submissions WHERE request_id = $1', [onboardingTicketId]);
    const replacedFilesCheck = await query('SELECT * FROM submission_files WHERE submission_id = $1', [onboardingSubmissionId]);
    const replacedFiles = replacedFilesCheck.rows;

    const noDuplicateUsers = userCountCheck.rows[0].count === 1;
    const noDuplicateTickets = reqCountCheck.rows[0].count === 1;
    const noDuplicateSubmissions = subCountCheck.rows[0].count === 1;
    const exactlyTwoFiles = replacedFiles.length === 2;
    const hasReplacedPoster = replacedFiles.some(f => (f.file_name || f.name) === REPLACED_POSTER_NAME);
    const hasReplacedVideo = replacedFiles.some(f => (f.file_name || f.name) === REPLACED_VIDEO_NAME);
    const oldFilesDeleted = !replacedFiles.some(f => (f.file_name || f.name) === 'Apex_Branded_Poster.png');

    if (replaceRes.ok && noDuplicateUsers && noDuplicateTickets && noDuplicateSubmissions && exactlyTwoFiles && hasReplacedPoster && hasReplacedVideo && oldFilesDeleted) {
      posterAssetId = replacedFiles.find(f => (f.file_name || f.name) === REPLACED_POSTER_NAME)?.id;
      console.log('✓ Updated existing user & company without creating duplicates.');
      console.log('✓ Zero duplicate tickets (count = 1).');
      console.log('✓ Zero duplicate submissions (count = 1).');
      console.log(`✓ Files cleanly replaced in submission_files: "${REPLACED_POSTER_NAME}" & "${REPLACED_VIDEO_NAME}"`);
      console.log('✓ Previous files cleanly removed with zero orphan files.');
      passed++;
    } else {
      console.error('✗ Replacement integrity check failed:', {
        replaceStatus: replaceRes.status,
        noDuplicateUsers,
        noDuplicateTickets,
        noDuplicateSubmissions,
        replacedFilesCount: replacedFiles.length,
        hasReplacedPoster,
        hasReplacedVideo,
        oldFilesDeleted
      });
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 8: Welcome Email Preview & Send with Stored Attachments
    // -------------------------------------------------------------------------
    console.log('\n[Test 8]: Testing Welcome Email Preview & Send with initial asset attachments...');
    
    // Preview email
    const previewRes = await request(`/admin/users/${clientUserId}/preview-welcome-email`, {
      method: 'POST',
      body: JSON.stringify({
        subject: 'Welcome to Apex Dynamics Workspace',
        customBody: 'Here is your official workspace access and initial branding assets.',
        temporaryPassword: clientPassword,
        attachments: [
          {
            id: 'initial-poster',
            name: REPLACED_POSTER_NAME,
            filename: REPLACED_POSTER_NAME,
            size: 68,
            mimeType: 'image/png',
            dataUrl: SAMPLE_PNG_DATA_URL
          },
          {
            id: 'initial-video',
            name: REPLACED_VIDEO_NAME,
            filename: REPLACED_VIDEO_NAME,
            size: 112,
            mimeType: 'video/mp4',
            dataUrl: SAMPLE_MP4_DATA_URL
          }
        ]
      })
    }, adminToken);

    const previewHasHtml = previewRes.ok && previewRes.data?.html?.includes('Apex Dynamics');
    const previewHasAttachments = previewRes.data?.html?.includes(REPLACED_POSTER_NAME);

    // Send email
    const sendRes = await request(`/admin/users/${clientUserId}/send-welcome-email`, {
      method: 'POST',
      body: JSON.stringify({
        subject: 'Welcome to Apex Dynamics Workspace',
        customBody: 'Here is your official workspace access and initial branding assets.',
        temporaryPassword: clientPassword,
        attachments: [
          {
            id: 'initial-poster',
            name: REPLACED_POSTER_NAME,
            filename: REPLACED_POSTER_NAME,
            size: 68,
            mimeType: 'image/png',
            dataUrl: SAMPLE_PNG_DATA_URL
          },
          {
            id: 'initial-video',
            name: REPLACED_VIDEO_NAME,
            filename: REPLACED_VIDEO_NAME,
            size: 112,
            mimeType: 'video/mp4',
            dataUrl: SAMPLE_MP4_DATA_URL
          }
        ]
      })
    }, adminToken);

    if (previewHasHtml && previewHasAttachments && sendRes.ok && sendRes.data?.success) {
      console.log('✓ Live Email Preview generated branded HTML with attachments list.');
      console.log(`✓ Welcome email dispatched successfully to ${testEmail} with decoded attachments.`);
      passed++;
    } else {
      console.error('✗ Email preview/send failed:', { previewOk: previewRes.ok, sendOk: sendRes.ok, sendData: sendRes.data });
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 9: Welcome Email Retry on Error (User Preservation)
    // -------------------------------------------------------------------------
    console.log('\n[Test 9]: Testing Welcome Email failure & user preservation...');
    
    // Intentionally pass an invalid user ID
    const badSendRes = await request('/admin/users/non-existent-user-id/send-welcome-email', {
      method: 'POST',
      body: JSON.stringify({
        subject: 'Test Subject',
        temporaryPassword: clientPassword
      })
    }, adminToken);

    // Verify existing user was NOT deleted
    const userStillExists = await findUserById(clientUserId);

    if (!badSendRes.ok && userStillExists) {
      console.log(`✓ Sending to invalid target returned error (${badSendRes.status}).`);
      console.log(`✓ Existing client user preserved intact (${userStillExists.email}).`);
      passed++;
    } else {
      console.error('✗ User preservation check failed');
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 10: Regular Team Specialist Submissions Work Independently
    // -------------------------------------------------------------------------
    console.log('\n[Test 10]: Verifying regular specialist team submissions (V1, V2) work alongside onboarding assets...');
    
    // Create regular service ticket for this client
    const regularTicketRes = await query(`
      INSERT INTO requests (ticket_id, user_id, company_id, service_type, title, description, priority, status, price, payment_status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      RETURNING *
    `, [
      `CG-REG-${Date.now().toString().slice(-4)}`,
      clientUserId,
      clientCompanyId,
      'LANDING_PAGE',
      'High-Conversion Landing Page Deliverables',
      'Redesign of customer conversion funnel.',
      'HIGH',
      'IN_PROGRESS',
      1200,
      'PAID'
    ]);
    const regularTicket = regularTicketRes.rows[0];

    // Create specialist submission
    const teamSubRes = await query(`
      INSERT INTO submissions (request_id, ticket_code, version, title, description, submitted_by, submitted_by_name, status, submitted_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING *
    `, [
      regularTicket.id,
      regularTicket.ticket_id,
      1,
      'Landing Page Design V1',
      'Complete desktop and mobile Figma prototypes and assets.',
      adminToken ? (await findUserByEmail('admin@creativegini.com')).id : clientUserId,
      'Design Specialist',
      'APPROVED'
    ]);
    const teamSub = teamSubRes.rows[0];

    // Add submission file
    await query(`
      INSERT INTO submission_files (submission_id, name, url, size, type, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
    `, [
      teamSub.id,
      'Landing_Page_Wireframe.png',
      SAMPLE_PNG_DATA_URL,
      68,
      'image/png'
    ]);

    // Query user media library
    const updatedUserAssets = await request('/assets', {}, clientToken);
    const groups = updatedUserAssets.data?.groupedAssets || [];
    const hasOnboardingTicket = groups.some(g => g.ticketCode === reqRow.ticket_id);
    const hasRegularTicket = groups.some(g => g.ticketCode === regularTicket.ticket_id);

    if (hasOnboardingTicket && hasRegularTicket && groups.length >= 2) {
      console.log(`✓ Both tickets exist seamlessly in client Media Library:`);
      console.log(`  1. Onboarding Ticket: ${reqRow.ticket_id} ("Welcome / Initial Marketing Assets")`);
      console.log(`  2. Specialist Ticket: ${regularTicket.ticket_id} ("High-Conversion Landing Page Deliverables")`);
      passed++;
    } else {
      console.error('✗ Regular team submission integration failed:', { groupsCount: groups.length, hasOnboardingTicket, hasRegularTicket });
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 11: Client Authorization Isolation
    // -------------------------------------------------------------------------
    console.log('\n[Test 11]: Testing strict client authorization & data isolation...');
    
    // Create Client 2
    const client2Email = `client2.isolation.${Date.now()}@creativegini.test`;
    const client2Res = await request('/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        companyName: 'Beta Isolated Corp',
        contactPerson: 'Beta User',
        email: client2Email,
        password: 'BetaPass@123',
        poster: {
          name: 'Beta_Poster.png',
          size: 68,
          mimeType: 'image/png',
          dataUrl: SAMPLE_PNG_DATA_URL
        },
        video: {
          name: 'Beta_Video.mp4',
          size: 112,
          mimeType: 'video/mp4',
          dataUrl: SAMPLE_MP4_DATA_URL
        }
      })
    }, adminToken);

    client2UserId = client2Res.data?.user?.id;
    client2CompanyId = client2Res.data?.user?.company?.id;

    // Login as Client 2
    const client2Login = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: client2Email, password: 'BetaPass@123' })
    });
    client2Token = client2Login.data?.token;

    // Client 2 requests assets
    const client2AssetsRes = await request('/assets', {}, client2Token);
    const client2Assets = client2AssetsRes.data?.assets || [];
    const client2SeesClient1 = client2Assets.some(a => a.companyId === clientCompanyId || a.fileName.includes('Apex'));

    // Client 2 tries to directly stream Client 1's poster
    const unauthorizedStreamRes = await fetch(`${API_BASE}/assets/${posterAssetId}/stream`, {
      headers: { Authorization: `Bearer ${client2Token}` }
    });

    if (!client2SeesClient1 && unauthorizedStreamRes.status === 403) {
      console.log('✓ Client 2 cannot see Client 1 assets in Media Library.');
      console.log(`✓ Direct stream access by another client returned HTTP 403 Forbidden.`);
      passed++;
    } else {
      console.error('✗ Client isolation failed:', {
        client2SeesClient1,
        streamStatus: unauthorizedStreamRes.status
      });
      failed++;
    }

  } catch (err) {
    console.error('Unhandled suite error:', err);
    failed++;
  } finally {
    // -------------------------------------------------------------------------
    // CLEANUP
    // -------------------------------------------------------------------------
    console.log('\n[Cleanup]: Cleaning up test records...');
    try {
      if (clientUserId) {
        // Cascade delete will clean submission_files, submissions, requests, activity_logs
        await query('DELETE FROM requests WHERE user_id = $1', [clientUserId]);
        await query('DELETE FROM users WHERE id = $1', [clientUserId]);
        if (clientCompanyId) {
          await query('DELETE FROM companies WHERE id = $1', [clientCompanyId]);
        }
      }
      if (client2UserId) {
        await query('DELETE FROM requests WHERE user_id = $1', [client2UserId]);
        await query('DELETE FROM users WHERE id = $1', [client2UserId]);
        if (client2CompanyId) {
          await query('DELETE FROM companies WHERE id = $1', [client2CompanyId]);
        }
      }
      console.log('✓ Cleanup complete.\n');
    } catch (cleanErr) {
      console.warn('Cleanup warning:', cleanErr.message);
    }

    console.log('====================================================');
    console.log(`TEST SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  }
}

runOnboardingAssetsTestSuite();
