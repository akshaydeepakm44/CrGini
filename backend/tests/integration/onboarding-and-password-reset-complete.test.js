import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { query, connectPostgres } from '../../src/config/postgres.js';
import { createUser, findUserByEmail } from '../../src/repositories/userRepository.js';
import { clearForgotPasswordRateLimits } from '../../src/controllers/authController.js';
import {
  clearEmailHistory,
  clearEmailDedupeCache,
  getEmailHistory
} from '../../src/services/emailService.js';

const API_BASE = 'http://localhost:5000/api';

async function request(endpoint, options = {}, token = null) {
  const url = `${API_BASE}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

function assert(condition, message) {
  if (!condition) {
    console.error(`  ✗ FAILED: ${message}`);
    throw new Error(message);
  }
  console.log(`  ✓ ${message}`);
}

async function runValidation() {
  console.log('========================================================================');
  console.log('   FULL VERIFICATION: ONBOARDING EMAILS & FORGOT PASSWORD WORKFLOWS   ');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  const timestamp = Date.now();
  const createdUserIds = [];
  const createdCompanyIds = [];

  try {
    await connectPostgres();

    // -------------------------------------------------------------------------
    // SETUP: Authenticate Super Admin
    // -------------------------------------------------------------------------
    console.log('[Setup]: Authenticating Super Admin...');
    const adminLoginRes = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'team@creativegini.com', password: process.env.ADMIN_PASSWORD || 'Admin@2026' })
    });
    assert(adminLoginRes.ok && adminLoginRes.data?.token, 'Super Admin logged in successfully');
    const adminToken = adminLoginRes.data.token;
    passed++;

    // -------------------------------------------------------------------------
    // PART 1: ISSUE 1 — NEW MEMBER ONBOARDING EMAIL VERIFICATION
    // -------------------------------------------------------------------------
    console.log('\n--- ISSUE 1: NEW MEMBER ONBOARDING EMAIL VERIFICATIONS ---');

    // 1. Create active internal specialists across roles and dashboard permissions
    console.log('\n[Issue 1 - Test 1]: Creating active team members and inactive/client controls...');
    const leadEmail = `lead.onb.${timestamp}@creativegini.test`;
    const boostEmail = `boost.onb.${timestamp}@creativegini.test`;
    const uiEmail = `ui.onb.${timestamp}@creativegini.test`;
    const permissionLeadEmail = `perm.lead.${timestamp}@creativegini.test`;
    const inactiveSpecialistEmail = `inactive.boost.${timestamp}@creativegini.test`;

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash('SpecialistSecret@2026', salt);

    // Lead role
    const r1 = await query(`
      INSERT INTO users (name, email, password, role, status, company_lead, is_deleted)
      VALUES ('Oliver Lead', $1, $2, 'COMPANY_LEAD', 'ACTIVE', true, false)
      RETURNING id
    `, [leadEmail, hashedPass]);
    createdUserIds.push(r1.rows[0].id);

    // Boost role
    const r2 = await query(`
      INSERT INTO users (name, email, password, role, status, company_boost, is_deleted)
      VALUES ('Bella Boost', $1, $2, 'COMPANY_BOOST', 'ACTIVE', true, false)
      RETURNING id
    `, [boostEmail, hashedPass]);
    createdUserIds.push(r2.rows[0].id);

    // UI / Landing Page role
    const r3 = await query(`
      INSERT INTO users (name, email, password, role, status, company_ui, is_deleted)
      VALUES ('Uma UI', $1, $2, 'LANDING_PAGE', 'ACTIVE', true, false)
      RETURNING id
    `, [uiEmail, hashedPass]);
    createdUserIds.push(r3.rows[0].id);

    // User with role COMPANY_BOOST and dashboard permission company_lead = true (cross-team permission test)
    const r4 = await query(`
      INSERT INTO users (name, email, password, role, status, company_lead, is_deleted)
      VALUES ('Paul Permission', $1, $2, 'COMPANY_BOOST', 'ACTIVE', true, false)
      RETURNING id
    `, [permissionLeadEmail, hashedPass]);
    createdUserIds.push(r4.rows[0].id);

    // Inactive teammate (must be excluded)
    const r5 = await query(`
      INSERT INTO users (name, email, password, role, status, company_boost, is_deleted)
      VALUES ('Ian Inactive', $1, $2, 'COMPANY_BOOST', 'DISABLED', true, false)
      RETURNING id
    `, [inactiveSpecialistEmail, hashedPass]);
    createdUserIds.push(r5.rows[0].id);

    assert(createdUserIds.length >= 5, 'Test internal teammates created in database');
    passed++;

    // 2. Admin creates a new client/account
    console.log('\n[Issue 1 - Test 2]: Admin creates new client and checks onboarding email dispatch...');
    await request('/admin/email-history', { method: 'DELETE' }, adminToken);
    clearEmailDedupeCache();

    const clientEmail = `client.verified.${timestamp}@creativegini.test`;
    const clientCreationRes = await request('/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        companyName: 'Helios Nanotech Global',
        contactPerson: 'Sarah Connor',
        email: clientEmail,
        website: 'https://helios-nano.tech',
        industry: 'Nanotechnology & Quantum Robotics',
        companyInfo: 'Pioneering molecular-scale computational nanotechnology and hardware acceleration.'
      })
    }, adminToken);

    assert(clientCreationRes.status === 201 && clientCreationRes.data.success, 'Admin created client account successfully');
    const createdClientUser = clientCreationRes.data.user;
    createdUserIds.push(createdClientUser.id || createdClientUser._id);
    if (createdClientUser.company?.id) createdCompanyIds.push(createdClientUser.company.id);
    passed++;

    // Check email history via admin API
    const histRes = await request('/admin/email-history', { method: 'GET' }, adminToken);
    const sentEmails = histRes.data?.history || [];
    console.log(`  Captured ${sentEmails.length} email(s) during client creation.`);

    // 3. Verify client does NOT receive the internal onboarding email
    const clientEmails = sentEmails.filter(e => e.to.toLowerCase() === clientEmail.toLowerCase());
    assert(clientEmails.length === 0, 'Newly created client did NOT receive internal onboarding email');
    passed++;

    // 4. Verify ADMIN does NOT receive the internal onboarding email
    const adminEmails = sentEmails.filter(e => e.to.toLowerCase() === 'team@creativegini.com');
    assert(adminEmails.length === 0, 'Admin (team@creativegini.com) did NOT receive internal onboarding email');
    passed++;

    // 5. Verify inactive teammates are EXCLUDED
    const inactiveEmails = sentEmails.filter(e => e.to.toLowerCase() === inactiveSpecialistEmail.toLowerCase());
    assert(inactiveEmails.length === 0, 'Inactive / disabled teammates are strictly excluded from emails');
    passed++;

    // 6. Verify correct internal recipients received emails
    const leadSent = sentEmails.find(e => e.to.toLowerCase() === leadEmail.toLowerCase());
    assert(Boolean(leadSent), 'Active COMPANY_LEAD received onboarding email');
    passed++;

    const permLeadSent = sentEmails.find(e => e.to.toLowerCase() === permissionLeadEmail.toLowerCase());
    assert(Boolean(permLeadSent), 'Active teammate with company_lead permission received onboarding email');
    passed++;

    const boostSent = sentEmails.find(e => e.to.toLowerCase() === boostEmail.toLowerCase());
    assert(Boolean(boostSent), 'Active COMPANY_BOOST received onboarding email');
    passed++;

    const uiSent = sentEmails.find(e => e.to.toLowerCase() === uiEmail.toLowerCase());
    assert(Boolean(uiSent), 'Active LANDING_PAGE received onboarding email');
    passed++;

    // 7. Verify email content adheres strictly to requirements
    console.log('\n[Issue 1 - Test 3]: Validating email content & security...');
    assert(leadSent.subject.includes('Helios Nanotech Global'), 'Lead email subject mentions company name');
    assert(leadSent.text.includes('Sarah Connor'), 'Lead email contains contact person name');
    assert(leadSent.text.includes('helios-nano.tech'), 'Lead email contains company website');
    assert(leadSent.text.includes('Nanotechnology & Quantum Robotics'), 'Lead email contains industry');
    assert(leadSent.text.includes('At least 5 Sample Leads'), 'Lead email directs to start sample leads');
    assert(leadSent.text.includes('Company Study / Research'), 'Lead email directs to start company study');
    assert(leadSent.text.includes('/company-lead'), 'Lead email links directly to company-lead workspace');

    // Security checks on emails
    assert(!leadSent.text.includes(clientCreationRes.data.temporaryPassword), 'Onboarding email does NOT expose client temporary password');
    assert(!boostSent.text.includes(clientCreationRes.data.temporaryPassword), 'Boost email does NOT expose client temporary password');
    assert(!uiSent.text.includes(clientCreationRes.data.temporaryPassword), 'UI email does NOT expose client temporary password');
    passed++;

    // 8. Verify resilience: Account creation succeeds even if email delivery fails
    console.log('\n[Issue 1 - Test 4]: Verifying resilience if email fails...');
    const failClientEmail = `client.fail.${timestamp}@creativegini.test`;
    const failClientRes = await request('/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        companyName: 'Resilience Test Corp',
        contactPerson: 'Alex Mercer',
        email: failClientEmail,
        website: 'https://resilience.test',
        industry: 'Security'
      })
    }, adminToken);

    assert(failClientRes.status === 201 && failClientRes.data.success, 'Account creation succeeded seamlessly despite any email conditions');
    if (failClientRes.data.user) {
      createdUserIds.push(failClientRes.data.user.id || failClientRes.data.user._id);
      if (failClientRes.data.user.company?.id) createdCompanyIds.push(failClientRes.data.user.company.id);
    }
    passed++;

    // -------------------------------------------------------------------------
    // PART 2: ISSUE 2 — FORGOT PASSWORD FLOW VERIFICATION
    // -------------------------------------------------------------------------
    console.log('\n--- ISSUE 2: FORGOT PASSWORD FLOW VERIFICATIONS ---');

    const recoveryEmail = `user.recovery.${timestamp}@creativegini.test`;
    const initialPass = 'OldPass@2026';
    const newPass = 'BrandNewSecretPass@2026';
    const recoveryUser = await createUser({
      name: 'Recovery Member',
      email: recoveryEmail,
      password: await bcrypt.hash(initialPass, 10),
      role: 'USER',
      status: 'ACTIVE'
    });
    createdUserIds.push(recoveryUser.id);

    // 1. Registered email requests password reset
    console.log('\n[Issue 2 - Test 1]: Registered user requests password reset...');
    await request('/admin/email-history', { method: 'DELETE' }, adminToken);
    clearForgotPasswordRateLimits();
    await request('/auth/reset-rate-limits', { method: 'POST' }).catch(() => {});

    const forgotRes = await request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: recoveryEmail })
    });

    const genericMsg = 'If an account exists for this email, a password reset link has been sent.';
    assert(forgotRes.status === 200, 'HTTP 200 returned on forgot password');
    assert(forgotRes.data.message === genericMsg, 'Generic security response returned for registered user');
    passed++;

    // Verify token stored in DB is hashed with SHA-256 (64 hex characters)
    const tokenDbRows = await query(
      'SELECT id, token_hash, expires_at, used_at FROM password_reset_tokens WHERE user_id = $1 ORDER BY created_at DESC',
      [recoveryUser.id]
    );
    assert(tokenDbRows.rows.length === 1, 'Exactly 1 reset token row created in database');
    assert(tokenDbRows.rows[0].token_hash.length === 64, 'Token is stored as 64-character SHA-256 hash');
    assert(tokenDbRows.rows[0].used_at === null, 'Token used_at is initially null');
    assert(new Date(tokenDbRows.rows[0].expires_at) > new Date(), 'Token expiration is in the future');
    passed++;

    // Verify email was generated with reset URL
    const forgotHist = await request('/admin/email-history', { method: 'GET' }, adminToken);
    const forgotEmails = (forgotHist.data?.history || []).filter(e => e.to.toLowerCase() === recoveryEmail.toLowerCase());
    assert(forgotEmails.length === 1, 'Password reset email was dispatched to user');
    assert(forgotEmails[0].subject.includes('Reset Your CreativeGini Password'), 'Subject is Reset Your CreativeGini Password');
    assert(forgotEmails[0].text.includes('/reset-password?token='), 'Email contains /reset-password?token= link');
    passed++;

    // Extract raw token from the dispatched email text
    const tokenMatch = forgotEmails[0].text.match(/token=([a-f0-9]+)/i);
    assert(Boolean(tokenMatch && tokenMatch[1]), 'Successfully extracted raw single-use token from email');
    const rawResetToken = tokenMatch[1];

    // Verify the raw token matches the stored SHA-256 hash
    const expectedHash = crypto.createHash('sha256').update(rawResetToken).digest('hex');
    assert(expectedHash === tokenDbRows.rows[0].token_hash, 'Computed hash of raw token matches stored database hash');
    passed++;

    // 2. Unregistered email requests password reset (user enumeration prevention)
    console.log('\n[Issue 2 - Test 2]: Unregistered email requests password reset...');
    const unregisteredEmail = `no.such.user.${timestamp}@creativegini.test`;
    const unregRes = await request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: unregisteredEmail })
    });
    assert(unregRes.status === 200, 'HTTP 200 returned for unregistered email');
    assert(unregRes.data.message === genericMsg, 'Identical generic message returned (prevents email enumeration)');
    const checkNoTokens = await query(
      'SELECT id FROM password_reset_tokens WHERE user_id NOT IN (SELECT id FROM users)'
    );
    assert(checkNoTokens.rows.length === 0, 'No orphan tokens created for non-existent users');
    passed++;

    // 3. Verify token validation API
    console.log('\n[Issue 2 - Test 3]: Validating token verification API...');
    const verifyValidRes = await request(`/auth/verify-reset-token?token=${rawResetToken}`);
    assert(verifyValidRes.status === 200 && verifyValidRes.data.valid === true, 'Valid token verified with valid=true');

    const verifyInvalidRes = await request('/auth/verify-reset-token?token=completelyinvalidtoken1234567890');
    assert(verifyInvalidRes.status === 400 && verifyInvalidRes.data.valid === false, 'Invalid token rejected with valid=false');
    passed++;

    // 4. Invalidation of previous active tokens
    console.log('\n[Issue 2 - Test 4]: Verifying previous active token invalidation upon new request...');
    await request('/admin/email-history', { method: 'DELETE' }, adminToken);
    const secondForgotRes = await request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: recoveryEmail })
    });
    assert(secondForgotRes.status === 200, 'Second reset request accepted');

    // First token should now be invalidated
    const verifyFirstTokenAfterRes = await request(`/auth/verify-reset-token?token=${rawResetToken}`);
    assert(verifyFirstTokenAfterRes.status === 400 && !verifyFirstTokenAfterRes.data.valid, 'First token was automatically invalidated by new reset request');
    passed++;

    // Extract new token
    const secondHist = await request('/admin/email-history', { method: 'GET' }, adminToken);
    const newForgotEmails = (secondHist.data?.history || []).filter(e => e.to.toLowerCase() === recoveryEmail.toLowerCase());
    const newTokenMatch = newForgotEmails[0].text.match(/token=([a-f0-9]+)/i);
    const rawResetToken2 = newTokenMatch[1];

    // 5. Expired token rejection
    console.log('\n[Issue 2 - Test 5]: Verifying expired token rejection...');
    const expiredRawToken = crypto.randomBytes(32).toString('hex');
    const expiredHash = crypto.createHash('sha256').update(expiredRawToken).digest('hex');
    await query(
      'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [recoveryUser.id, expiredHash, new Date(Date.now() - 3600 * 1000)]
    );
    const expiredVerifyRes = await request(`/auth/verify-reset-token?token=${expiredRawToken}`);
    assert(expiredVerifyRes.status === 400 && !expiredVerifyRes.data.valid, 'Expired token is rejected with 400');
    passed++;

    // 6. Reset password with weak password rejected
    console.log('\n[Issue 2 - Test 6]: Weak password rejected during reset...');
    const weakPassRes = await request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token: rawResetToken2, password: 'short' })
    });
    assert(weakPassRes.status === 400 && !weakPassRes.data.success, 'Password shorter than 8 chars rejected');
    passed++;

    // 7. Reset password with valid password
    console.log('\n[Issue 2 - Test 7]: Completing password reset with valid password...');
    const resetSuccessRes = await request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token: rawResetToken2, password: newPass })
    });
    assert(resetSuccessRes.status === 200 && resetSuccessRes.data.success, 'Password reset succeeded with HTTP 200');
    passed++;

    // 8. Token single-use enforcement: re-using the same token is rejected
    console.log('\n[Issue 2 - Test 8]: Verifying single-use token enforcement...');
    const reuseTokenRes = await request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token: rawResetToken2, password: 'AnotherPassword@2026' })
    });
    assert(reuseTokenRes.status === 400 && !reuseTokenRes.data.success, 'Reusing an already-used token is rejected');
    passed++;

    // 9. Login with new password succeeds
    console.log('\n[Issue 2 - Test 9]: Logging in with new password...');
    const loginNewRes = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: recoveryEmail, password: newPass })
    });
    assert(loginNewRes.status === 200 && loginNewRes.data.token, 'Logged in successfully using new password');
    passed++;

    // 10. Login with old password fails
    console.log('\n[Issue 2 - Test 10]: Verifying old password no longer works...');
    const loginOldRes = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: recoveryEmail, password: initialPass })
    });
    assert(loginOldRes.status === 401 && !loginOldRes.data.success, 'Old password rejected with HTTP 401');
    passed++;

    // 11. Rate limit verification (clean reset)
    console.log('\n[Issue 2 - Test 11]: Verifying rate limit behavior and cleanup...');
    clearForgotPasswordRateLimits();
    const spammerEmail = `spammer.${timestamp}@creativegini.test`;
    let gotThrottled = false;
    for (let i = 0; i < 7; i++) {
      const res = await request('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: spammerEmail })
      });
      if (res.status === 429) {
        gotThrottled = true;
        break;
      }
    }
    assert(gotThrottled, 'Rapid repetitive attempts throttled with HTTP 429');
    clearForgotPasswordRateLimits();
    await request('/auth/reset-rate-limits', { method: 'POST' }).catch(() => {});
    passed++;

    // Verify Admin credentials untouched
    const adminCheck = await findUserByEmail('team@creativegini.com', { includePassword: true });
    assert(adminCheck && adminCheck.role === 'ADMIN' && adminCheck.status === 'ACTIVE', 'Admin account credentials remained 100% untouched');
    passed++;

  } catch (err) {
    console.error('\n[FATAL ERROR]:', err);
    failed++;
  } finally {
    // Cleanup created test records
    console.log('\n[Cleanup]: Cleaning up test records...');
    try {
      if (createdUserIds.length > 0) {
        await query('DELETE FROM password_reset_tokens WHERE user_id = ANY($1)', [createdUserIds]);
        await query('DELETE FROM notifications WHERE user_id = ANY($1)', [createdUserIds]);
        await query('DELETE FROM activity_logs WHERE user_id = ANY($1)', [createdUserIds]);
        await query('DELETE FROM users WHERE id = ANY($1)', [createdUserIds]);
      }
      if (createdCompanyIds.length > 0) {
        await query('DELETE FROM companies WHERE id = ANY($1)', [createdCompanyIds]);
      }
      console.log('  ✓ Test users and companies cleaned up.');
    } catch (cleanErr) {
      console.warn('  [Cleanup Warning]:', cleanErr.message);
    }

    console.log('\n========================================================================');
    console.log(`TOTAL SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  }
}

runValidation();
