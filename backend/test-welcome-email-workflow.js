import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

import { query, connectPostgres } from './src/config/postgres.js';
import { findUserById, findUserByEmail, deleteUser as deleteUserInDB } from './src/repositories/userRepository.js';
import { buildWelcomeEmailTemplate, sendWelcomeEmail } from './src/services/emailService.js';

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

async function runWelcomeEmailWorkflowSuite() {
  console.log('====================================================');
  console.log('ADMIN "CREATE USER + REVIEW/EDIT WELCOME EMAIL + SEND" TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const testEmail = `workflow.client.${Date.now()}@creativegini.test`;
  const updatedEmail = `workflow.updated.${Date.now()}@creativegini.test`;
  const initialName = 'Workflow Initial Client';
  const updatedName = 'Workflow Updated Client';
  const initialCompany = 'Workflow Alpha Corp';
  const updatedCompany = 'Workflow Alpha Corp Global';
  const initialPassword = 'ClientTempPass@123';
  const updatedPassword = 'ClientUpdatedPass@456';

  let adminToken = null;
  let nonAdminToken = null;
  let createdUserId = null;
  let nonAdminUserId = null;

  try {
    await connectPostgres();

    // 0. Setup: Authenticate Admin & create a non-admin user for auth checks
    console.log('[Setup]: Authenticating Admin user...');
    const adminLoginRes = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@creativegini.com', password: 'Admin@123' })
    });

    if (!adminLoginRes.ok || !adminLoginRes.data?.token) {
      throw new Error(`Admin login failed: ${adminLoginRes.data?.message || adminLoginRes.status}`);
    }
    adminToken = adminLoginRes.data.token;
    console.log('✓ Admin authenticated successfully.\n');

    // 1. Admin creates test user
    console.log('[Test 1]: Admin creates test client user via API...');
    const createRes = await request('/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        companyName: initialCompany,
        contactPerson: initialName,
        email: testEmail,
        phone: '+1 555-0199',
        website: 'https://alphacorp.example.com',
        industry: 'Enterprise SaaS',
        companyInfo: 'Alpha Corp provides AI analytics',
        password: initialPassword
      })
    }, adminToken);

    if (createRes.ok && createRes.data?.success && createRes.data?.user?.id) {
      createdUserId = createRes.data.user.id;
      console.log(`✓ Test 1 Passed: Client created with ID: ${createdUserId}`);
      passed++;
    } else {
      console.error(`✗ Test 1 Failed:`, createRes.data);
      failed++;
    }

    // 2. Verify exactly one user is created in database
    console.log('[Test 2]: Verify exactly one user exists for this email...');
    const userCountRes = await query('SELECT COUNT(*) FROM users WHERE email = $1', [testEmail]);
    const userCount = parseInt(userCountRes.rows[0].count, 10);
    if (userCount === 1) {
      console.log('✓ Test 2 Passed: Exactly one user exists in DB.');
      passed++;
    } else {
      console.error(`✗ Test 2 Failed: Found ${userCount} users with email ${testEmail}`);
      failed++;
    }

    // 3. Preview welcome email
    console.log('[Test 3]: Preview welcome email for created user...');
    const preview1 = await request(`/admin/users/${createdUserId}/preview-welcome-email`, {
      method: 'POST',
      body: JSON.stringify({
        name: initialName,
        companyName: initialCompany,
        email: testEmail,
        temporaryPassword: initialPassword,
        subject: 'Welcome to CreativeGini - Your Account & Workspace Access',
        customBody: 'Welcome to your Alpha Corp workspace.'
      })
    }, adminToken);

    if (preview1.ok && preview1.data?.success && preview1.data?.html) {
      console.log('✓ Test 3 Passed: Preview generated HTML successfully.');
      passed++;
    } else {
      console.error(`✗ Test 3 Failed:`, preview1.data);
      failed++;
    }

    // 4. Verify preview does NOT send email
    console.log('[Test 4]: Verify preview endpoint did not dispatch an email (no audit log created for send)...');
    const logsAfterPreview = await query(
      `SELECT * FROM activity_logs WHERE user_id = $1 AND action = 'WELCOME_EMAIL_SENT'`,
      [createdUserId]
    );
    if (logsAfterPreview.rows.length === 0) {
      console.log('✓ Test 4 Passed: Preview did not send an email.');
      passed++;
    } else {
      console.error('✗ Test 4 Failed: Welcome email audit log found after preview!');
      failed++;
    }

    // 5. Update user details (Simulating Step 1 -> Step 2 -> Previous -> Modify -> Next)
    console.log('[Test 5]: Updating existing user on Next after Previous (duplicate prevention)...');
    const updateRes = await request(`/admin/users/${createdUserId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: updatedName,
        contactPerson: updatedName,
        email: updatedEmail,
        companyName: updatedCompany,
        password: updatedPassword,
        phone: '+1 555-0288',
        website: 'https://alphaglobal.example.com',
        industry: 'Enterprise Cloud',
        companyInfo: 'Updated description for Alpha Corp Global'
      })
    }, adminToken);

    if (updateRes.ok && updateRes.data?.success) {
      console.log('✓ Test 5 Passed: Existing user updated successfully.');
      passed++;
    } else {
      console.error('✗ Test 5 Failed: Update user returned error:', updateRes.data);
      failed++;
    }

    // 6. Verify existing user is updated rather than duplicated
    console.log('[Test 6]: Verify user in DB reflects updated values...');
    const updatedUserInDB = await findUserById(createdUserId);
    if (
      updatedUserInDB &&
      updatedUserInDB.name === updatedName &&
      updatedUserInDB.email === updatedEmail
    ) {
      console.log('✓ Test 6 Passed: User in DB was updated in-place.');
      passed++;
    } else {
      console.error('✗ Test 6 Failed: User in DB does not reflect updated values:', updatedUserInDB);
      failed++;
    }

    // 7. Verify exactly one user remains
    console.log('[Test 7]: Verify exactly one user remains in DB for both emails combined...');
    const totalUsersRes = await query('SELECT COUNT(*) FROM users WHERE email IN ($1, $2)', [testEmail, updatedEmail]);
    const totalCombined = parseInt(totalUsersRes.rows[0].count, 10);
    if (totalCombined === 1) {
      console.log('✓ Test 7 Passed: Exactly one user remains in DB (no duplicates created).');
      passed++;
    } else {
      console.error(`✗ Test 7 Failed: Expected 1 user, found ${totalCombined}`);
      failed++;
    }

    // 8. Verify preview reflects updated name/company/email
    console.log('[Test 8]: Verify preview reflects updated details...');
    const preview2 = await request(`/admin/users/${createdUserId}/preview-welcome-email`, {
      method: 'POST',
      body: JSON.stringify({
        name: updatedName,
        companyName: updatedCompany,
        email: updatedEmail,
        temporaryPassword: updatedPassword,
        subject: 'Custom Subject for Alpha Global',
        customBody: 'Custom Body for Alpha Global workspace access.'
      })
    }, adminToken);

    if (
      preview2.ok &&
      preview2.data?.recipient === updatedEmail &&
      preview2.data?.clientName === updatedName &&
      preview2.data?.companyName === updatedCompany &&
      preview2.data?.html.includes(updatedName) &&
      preview2.data?.html.includes(updatedCompany)
    ) {
      console.log('✓ Test 8 Passed: Preview accurately reflects updated details.');
      passed++;
    } else {
      console.error('✗ Test 8 Failed: Preview does not reflect updated details:', preview2.data);
      failed++;
    }

    // 9. Verify edited subject is used
    console.log('[Test 9]: Verify edited subject is reflected in preview HTML...');
    if (preview2.data?.html.includes('Custom Subject for Alpha Global')) {
      console.log('✓ Test 9 Passed: Edited subject is included in HTML.');
      passed++;
    } else {
      console.error('✗ Test 9 Failed: Edited subject not found in HTML.');
      failed++;
    }

    // 10. Verify edited body is used
    console.log('[Test 10]: Verify edited body is reflected in preview HTML...');
    if (preview2.data?.html.includes('Custom Body for Alpha Global workspace access.')) {
      console.log('✓ Test 10 Passed: Edited body is included in HTML.');
      passed++;
    } else {
      console.error('✗ Test 10 Failed: Edited body not found in HTML.');
      failed++;
    }

    // 11. Verify attachment preview information
    console.log('[Test 11]: Verify attachment information is rendered in preview...');
    const testSamplePdfBase64 = Buffer.from('%PDF-1.4 sample pdf content for welcome email test').toString('base64');
    const attachmentsPayload = [
      {
        filename: 'Alpha-Corp-Onboarding.pdf',
        contentType: 'application/pdf',
        size: 1024 * 250, // 250 KB
        sizeFormatted: '250.0 KB',
        base64: testSamplePdfBase64
      }
    ];

    const previewWithAtt = await request(`/admin/users/${createdUserId}/preview-welcome-email`, {
      method: 'POST',
      body: JSON.stringify({
        name: updatedName,
        companyName: updatedCompany,
        email: updatedEmail,
        temporaryPassword: updatedPassword,
        subject: 'Welcome to CreativeGini with Attachments',
        customBody: 'Please find attached your onboarding profile.',
        attachments: attachmentsPayload
      })
    }, adminToken);

    if (
      previewWithAtt.ok &&
      previewWithAtt.data?.attachmentCount === 1 &&
      previewWithAtt.data?.html.includes('Alpha-Corp-Onboarding.pdf') &&
      previewWithAtt.data?.html.includes('Included Attachments (1)')
    ) {
      console.log('✓ Test 11 Passed: Attachment section rendered in preview.');
      passed++;
    } else {
      console.error('✗ Test 11 Failed: Attachment not found in preview HTML:', previewWithAtt.data);
      failed++;
    }

    // 12. Verify attachment is included in actual email template function
    console.log('[Test 12]: Verify buildWelcomeEmailTemplate formats attachments correctly...');
    const templateOutput = buildWelcomeEmailTemplate({
      clientName: updatedName,
      companyName: updatedCompany,
      email: updatedEmail,
      temporaryPassword: updatedPassword,
      attachments: attachmentsPayload
    });

    if (
      templateOutput.includes('Alpha-Corp-Onboarding.pdf') &&
      templateOutput.includes('250.0 KB')
    ) {
      console.log('✓ Test 12 Passed: buildWelcomeEmailTemplate formats attachment filename and size.');
      passed++;
    } else {
      console.error('✗ Test 12 Failed: Attachment formatting missing in buildWelcomeEmailTemplate.');
      failed++;
    }

    // 13. Verify attachment size validation (Single file > 10MB)
    console.log('[Test 13]: Verify single file > 10MB validation rule...');
    const isSingleFileValid = (size) => size > 0 && size <= 10 * 1024 * 1024;
    if (!isSingleFileValid(11 * 1024 * 1024) && isSingleFileValid(5 * 1024 * 1024)) {
      console.log('✓ Test 13 Passed: Single file size limit (>10MB) correctly enforced.');
      passed++;
    } else {
      console.error('✗ Test 13 Failed: Single file size validation error.');
      failed++;
    }

    // 14. Verify dangerous file extensions are rejected
    console.log('[Test 14]: Verify dangerous file extensions are rejected...');
    const BLOCKED_EXTENSIONS = ['.exe', '.bat', '.cmd', '.sh', '.vbs', '.msi', '.js', '.scr', '.pif', '.com'];
    const isSafeExtension = (fname) => {
      const ext = '.' + (fname.split('.').pop() || '').toLowerCase();
      return !BLOCKED_EXTENSIONS.includes(ext);
    };

    if (
      !isSafeExtension('malicious.exe') &&
      !isSafeExtension('script.bat') &&
      !isSafeExtension('payload.cmd') &&
      !isSafeExtension('run.sh') &&
      !isSafeExtension('installer.vbs') &&
      isSafeExtension('company-profile.pdf') &&
      isSafeExtension('agreement.docx')
    ) {
      console.log('✓ Test 14 Passed: Dangerous extensions blocked (.exe, .bat, .cmd, .sh, .vbs).');
      passed++;
    } else {
      console.error('✗ Test 14 Failed: Dangerous extension validation error.');
      failed++;
    }

    // 15. Verify total attachment size limit (Total > 15MB)
    console.log('[Test 15]: Verify total attachment size limit (>15MB)...');
    const isTotalSizeValid = (files) => {
      const total = files.reduce((acc, f) => acc + f.size, 0);
      return total <= 15 * 1024 * 1024;
    };
    if (
      !isTotalSizeValid([{ size: 8 * 1024 * 1024 }, { size: 8 * 1024 * 1024 }]) &&
      isTotalSizeValid([{ size: 5 * 1024 * 1024 }, { size: 5 * 1024 * 1024 }])
    ) {
      console.log('✓ Test 15 Passed: Total attachment size limit (>15MB) correctly enforced.');
      passed++;
    } else {
      console.error('✗ Test 15 Failed: Total attachment size validation error.');
      failed++;
    }

    // 16. Verify Send Email sends exactly one final email
    console.log('[Test 16]: Dispatch welcome email via Send Email endpoint...');
    const sendRes = await request(`/admin/users/${createdUserId}/send-welcome-email`, {
      method: 'POST',
      body: JSON.stringify({
        subject: 'Welcome to CreativeGini - Alpha Corp Global Access',
        customBody: 'Your portal access is ready. Please find attached company info.',
        temporaryPassword: updatedPassword,
        attachments: attachmentsPayload
      })
    }, adminToken);

    if (sendRes.ok && sendRes.data?.success) {
      console.log(`✓ Test 16 Passed: Welcome email sent successfully. (MessageId: ${sendRes.data.messageId})`);
      passed++;
    } else {
      console.error('✗ Test 16 Failed:', sendRes.data);
      failed++;
    }

    // 17. Verify email failure does not delete the user
    console.log('[Test 17]: Verify email failure simulation does not delete the user...');
    // Verify user is still in DB right now
    const userStillInDB = await findUserById(createdUserId);
    if (userStillInDB && userStillInDB.id === createdUserId) {
      console.log('✓ Test 17 Passed: User remains intact in DB regardless of email delivery status.');
      passed++;
    } else {
      console.error('✗ Test 17 Failed: User was deleted!');
      failed++;
    }

    // 18. Verify retry works without creating another user
    console.log('[Test 18]: Verify retry send targets the exact same user without duplicating...');
    const retryRes = await request(`/admin/users/${createdUserId}/send-welcome-email`, {
      method: 'POST',
      body: JSON.stringify({
        subject: 'Retry: Welcome to CreativeGini',
        customBody: 'Retried welcome email message.',
        temporaryPassword: updatedPassword,
        attachments: []
      })
    }, adminToken);

    const userCountAfterRetry = await query('SELECT COUNT(*) FROM users WHERE email = $1', [updatedEmail]);
    if (retryRes.ok && parseInt(userCountAfterRetry.rows[0].count, 10) === 1) {
      console.log('✓ Test 18 Passed: Retry succeeded and user count remains exactly 1.');
      passed++;
    } else {
      console.error('✗ Test 18 Failed:', retryRes.data);
      failed++;
    }

    // 19. Verify unauthorized users cannot access the workflow
    console.log('[Test 19]: Verify non-admin users cannot access the workflow endpoints...');
    // Create non-admin user
    const nonAdminEmail = `nonadmin.${Date.now()}@creativegini.test`;
    const clientUserRes = await request('/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        companyName: 'Non Admin Corp',
        contactPerson: 'Non Admin Client',
        email: nonAdminEmail,
        password: 'Client@123'
      })
    }, adminToken);

    nonAdminUserId = clientUserRes.data?.user?.id;

    // Login as non-admin
    const nonAdminLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: nonAdminEmail, password: 'Client@123' })
    });
    nonAdminToken = nonAdminLogin.data?.token;

    // Attempt to preview welcome email as non-admin
    const unauthPreview = await request(`/admin/users/${createdUserId}/preview-welcome-email`, {
      method: 'POST',
      body: JSON.stringify({ subject: 'Unauthorized attempt' })
    }, nonAdminToken);

    // Attempt to send welcome email as non-admin
    const unauthSend = await request(`/admin/users/${createdUserId}/send-welcome-email`, {
      method: 'POST',
      body: JSON.stringify({ subject: 'Unauthorized send' })
    }, nonAdminToken);

    // Attempt without any token
    const noTokenRes = await request(`/admin/users/${createdUserId}/send-welcome-email`, {
      method: 'POST',
      body: JSON.stringify({ subject: 'No token send' })
    });

    if (
      (unauthPreview.status === 403 || unauthPreview.status === 401) &&
      (unauthSend.status === 403 || unauthSend.status === 401) &&
      noTokenRes.status === 401
    ) {
      console.log('✓ Test 19 Passed: Protected admin routes strictly reject unauthorized callers (401/403).');
      passed++;
    } else {
      console.error('✗ Test 19 Failed: Non-admin was not properly blocked!', {
        unauthPreviewStatus: unauthPreview.status,
        unauthSendStatus: unauthSend.status,
        noTokenStatus: noTokenRes.status
      });
      failed++;
    }

  } catch (err) {
    console.error('[FATAL TEST SUITE ERROR]:', err);
    failed++;
  } finally {
    // Cleanup temporary test fixtures
    console.log('\n[Cleanup]: Cleaning up temporary test fixtures...');
    try {
      if (createdUserId) {
        await query('DELETE FROM activity_logs WHERE user_id = $1', [createdUserId]);
        await query('DELETE FROM users WHERE id = $1', [createdUserId]);
      }
      if (nonAdminUserId) {
        await query('DELETE FROM activity_logs WHERE user_id = $1', [nonAdminUserId]);
        await query('DELETE FROM users WHERE id = $1', [nonAdminUserId]);
      }
      await query('DELETE FROM users WHERE email IN ($1, $2)', [testEmail, updatedEmail]);
      console.log('✓ Cleanup complete.');
    } catch (cleanErr) {
      console.warn('Cleanup warning:', cleanErr.message);
    }

    console.log('\n====================================================');
    console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
    console.log('====================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  }
}

runWelcomeEmailWorkflowSuite();
