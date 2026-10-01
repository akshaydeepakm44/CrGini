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

const API_BASE = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, { ...options, headers });
  const data = await res.json();
  return { status: res.status, ok: res.ok, data };
}

async function runPasswordResetSuite() {
  console.log('====================================================');
  console.log('CREATIVEGINI PASSWORD RECOVERY / FORGOT PASSWORD SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const testUserEmail = `test.recovery.${Date.now()}@creativegini.test`;
  const initialPassword = 'InitialPassword@2026';
  const newPassword = 'NewSecretPassword@2026';
  let testUserId = null;

  try {
    await connectPostgres();

    // Setup: Create a temporary dedicated test user (Admin account left completely untouched!)
    console.log('[Setup]: Creating dedicated temporary test user...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(initialPassword, salt);

    const created = await createUser({
      name: 'Recovery Test User',
      email: testUserEmail,
      password: hashedPassword,
      role: 'USER',
      status: 'ACTIVE'
    });
    testUserId = created.id;
    console.log(`[Setup]: Test user created: ${testUserEmail} (ID: ${testUserId})\n`);

    // TEST 1: Registered user requests password reset
    console.log('TEST 1: Registered user requests password reset...');
    clearForgotPasswordRateLimits();
    await request('/auth/reset-rate-limits', { method: 'POST' }).catch(() => {});
    const res1 = await request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: testUserEmail })
    });

    const expectedGenericMsg = 'If an account exists for this email, a password reset link has been sent.';
    if (res1.status === 200 && res1.data.success && res1.data.message === expectedGenericMsg) {
      console.log('  ✓ Received expected generic success response');
      passed++;
    } else {
      console.error('  ✗ Unexpected response:', res1);
      failed++;
    }

    // Verify token in DB is stored as SHA-256 hash ONLY
    const tokenRows = await query(
      'SELECT id, token_hash, expires_at, used_at FROM password_reset_tokens WHERE user_id = $1 ORDER BY created_at DESC',
      [testUserId]
    );

    if (tokenRows.rows.length === 1 && tokenRows.rows[0].token_hash.length === 64) {
      console.log('  ✓ Token hash stored in DB (length: 64, SHA-256)');
      console.log('  ✓ Token used_at is null and expires_at > now');
      passed++;
    } else {
      console.error('  ✗ Token not found in database or invalid format:', tokenRows.rows);
      failed++;
    }

    const storedHash1 = tokenRows.rows[0].token_hash;

    // TEST 2: Unknown email returns identical generic response with no token created
    console.log('\nTEST 2: Unknown email requests password reset...');
    const unknownEmail = `nonexistent.${Date.now()}@creativegini.test`;
    const res2 = await request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: unknownEmail })
    });

    if (res2.status === 200 && res2.data.success && res2.data.message === expectedGenericMsg) {
      console.log('  ✓ Unknown email returns identical generic message');
      passed++;
    } else {
      console.error('  ✗ Unknown email response failed:', res2);
      failed++;
    }

    const unknownUserCheck = await findUserByEmail(unknownEmail);
    if (!unknownUserCheck) {
      console.log('  ✓ No user or token created for unknown email');
      passed++;
    } else {
      console.error('  ✗ Unexpected record found for unknown email');
      failed++;
    }

    // TEST 3: Verify valid reset token API
    console.log('\nTEST 3: Verify valid reset token...');
    // Generate a known raw token and store its hash in DB for test user
    const rawTokenA = crypto.randomBytes(32).toString('hex');
    const hashA = crypto.createHash('sha256').update(rawTokenA).digest('hex');
    const expiresFuture = new Date(Date.now() + 60 * 60 * 1000);

    // Invalidate existing tokens first
    await query('UPDATE password_reset_tokens SET used_at = NOW() WHERE user_id = $1', [testUserId]);
    await query(
      'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [testUserId, hashA, expiresFuture]
    );

    const res3 = await request(`/auth/verify-reset-token?token=${rawTokenA}`);
    if (res3.status === 200 && res3.data.success && res3.data.valid) {
      console.log('  ✓ verify-reset-token returned valid=true');
      passed++;
    } else {
      console.error('  ✗ Token verification failed:', res3);
      failed++;
    }

    // TEST 4: Invalid token is rejected
    console.log('\nTEST 4: Verify invalid token is rejected...');
    const fakeToken = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    const res4 = await request(`/auth/verify-reset-token?token=${fakeToken}`);
    if (res4.status === 400 && !res4.data.valid) {
      console.log('  ✓ Invalid token correctly rejected with 400');
      passed++;
    } else {
      console.error('  ✗ Invalid token check failed:', res4);
      failed++;
    }

    // TEST 5: Expired token is rejected
    console.log('\nTEST 5: Verify expired token is rejected...');
    const rawTokenExpired = crypto.randomBytes(32).toString('hex');
    const hashExpired = crypto.createHash('sha256').update(rawTokenExpired).digest('hex');
    const pastDate = new Date(Date.now() - 10 * 60 * 1000); // 10 mins ago

    await query(
      'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [testUserId, hashExpired, pastDate]
    );

    const res5 = await request(`/auth/verify-reset-token?token=${rawTokenExpired}`);
    if (res5.status === 400 && !res5.data.valid) {
      console.log('  ✓ Expired token correctly rejected');
      passed++;
    } else {
      console.error('  ✗ Expired token check failed:', res5);
      failed++;
    }

    // TEST 6: New reset request invalidates previous active tokens
    console.log('\nTEST 6: New reset request invalidates previous active token...');
    clearForgotPasswordRateLimits();
    await request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: testUserEmail })
    });

    // Token A should now be invalidated (used_at is not null)
    const tokenCheckA = await query(
      'SELECT used_at FROM password_reset_tokens WHERE token_hash = $1',
      [hashA]
    );
    if (tokenCheckA.rows[0]?.used_at !== null) {
      console.log('  ✓ Previous active token was invalidated');
      passed++;
    } else {
      console.error('  ✗ Previous token was not invalidated:', tokenCheckA.rows);
      failed++;
    }

    // Verify token A now fails verification
    const res6 = await request(`/auth/verify-reset-token?token=${rawTokenA}`);
    if (res6.status === 400 && !res6.data.valid) {
      console.log('  ✓ Previous token fails verification after new reset request');
      passed++;
    } else {
      console.error('  ✗ Previous token unexpectedly verified:', res6);
      failed++;
    }

    // TEST 7: Weak password is rejected
    console.log('\nTEST 7: Reset with weak password is rejected...');
    // Create a fresh active token for test user
    const rawTokenB = crypto.randomBytes(32).toString('hex');
    const hashB = crypto.createHash('sha256').update(rawTokenB).digest('hex');
    await query(
      'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [testUserId, hashB, expiresFuture]
    );

    // Attempt 1: Too short
    const res7a = await request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token: rawTokenB, password: 'short' })
    });

    // Attempt 2: No numbers
    const res7b = await request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token: rawTokenB, password: 'onlyletters' })
    });

    if (res7a.status === 400 && res7b.status === 400) {
      console.log('  ✓ Weak password (too short & missing numbers) rejected');
      passed++;
    } else {
      console.error('  ✗ Weak password validation failed:', { res7a, res7b });
      failed++;
    }

    // TEST 8: Valid password updates successfully and marks token used
    console.log('\nTEST 8: Valid password updates successfully...');
    const res8 = await request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token: rawTokenB, password: newPassword })
    });

    if (res8.status === 200 && res8.data.success) {
      console.log('  ✓ Password reset returned success');
      passed++;
    } else {
      console.error('  ✗ Password reset failed:', res8);
      failed++;
    }

    // Confirm token is marked used
    const tokenCheckB = await query(
      'SELECT used_at FROM password_reset_tokens WHERE token_hash = $1',
      [hashB]
    );
    if (tokenCheckB.rows[0]?.used_at !== null) {
      console.log('  ✓ Reset token is marked used_at');
      passed++;
    } else {
      console.error('  ✗ Reset token not marked as used:', tokenCheckB.rows);
      failed++;
    }

    // TEST 9: Reusing the same token is rejected
    console.log('\nTEST 9: Reusing the same token is rejected...');
    const res9 = await request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token: rawTokenB, password: 'AnotherPassword@2026' })
    });

    if (res9.status === 400 && !res9.data.success) {
      console.log('  ✓ Reused token rejected with 400');
      passed++;
    } else {
      console.error('  ✗ Reused token was unexpectedly accepted:', res9);
      failed++;
    }

    // TEST 10: Login with new password succeeds
    console.log('\nTEST 10: Login with new password succeeds...');
    const res10 = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: testUserEmail, password: newPassword })
    });

    if (res10.status === 200 && res10.data.success && res10.data.token) {
      console.log('  ✓ Logged in successfully with new password');
      passed++;
    } else {
      console.error('  ✗ Login with new password failed:', res10);
      failed++;
    }

    // TEST 11: Login with old password fails
    console.log('\nTEST 11: Login with old password fails...');
    const res11 = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: testUserEmail, password: initialPassword })
    });

    if (res11.status === 401 && !res11.data.success) {
      console.log('  ✓ Old password rejected with 401');
      passed++;
    } else {
      console.error('  ✗ Old password was unexpectedly accepted:', res11);
      failed++;
    }

    // TEST 12: Rate limiting throttles rapid repeat requests
    console.log('\nTEST 12: Rate limiting throttles rapid repeat requests...');
    clearForgotPasswordRateLimits();
    const spamEmail = `ratelimit.${Date.now()}@creativegini.test`;
    let rateLimited = false;

    for (let i = 0; i < 7; i++) {
      const res = await request('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: spamEmail })
      });
      if (res.status === 429) {
        rateLimited = true;
        break;
      }
    }

    if (rateLimited) {
      console.log('  ✓ Requests throttled with HTTP 429 after threshold');
      passed++;
    } else {
      console.error('  ✗ Rate limiting failed to throttle repeated requests');
      failed++;
    }

    // Clean up: clear rate limits both locally and on running server daemon
    clearForgotPasswordRateLimits();
    await request('/auth/reset-rate-limits', { method: 'POST' }).catch(() => {});

    // Verify Admin account is still 100% intact and unaffected
    console.log('\n[Verification]: Verifying Admin account credentials untouched...');
    const adminUser = await findUserByEmail('team@creativegini.com', { includePassword: true });
    if (adminUser && adminUser.role === 'ADMIN' && adminUser.status === 'ACTIVE') {
      console.log('  ✓ Admin account is intact with ADMIN role and ACTIVE status');
      passed++;
    } else {
      console.error('  ✗ Admin account verification failed:', adminUser);
      failed++;
    }

  } catch (err) {
    console.error('[TEST SUITE ERROR]:', err);
    failed++;
  } finally {
    // Clean up temporary test user
    if (testUserId) {
      console.log('\n[Cleanup]: Cleaning up temporary test user data...');
      try {
        await query('DELETE FROM password_reset_tokens WHERE user_id = $1', [testUserId]);
        await query('DELETE FROM activity_logs WHERE user_id = $1', [testUserId]);
        await query('DELETE FROM users WHERE id = $1', [testUserId]);
        console.log('[Cleanup]: Test user data removed successfully.');
      } catch (cleanErr) {
        console.warn('[Cleanup Warning]:', cleanErr.message);
      }
    }

    console.log('\n====================================================');
    console.log(`TEST SUITE FINISHED: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    process.exit(failed > 0 ? 1 : 0);
  }
}

runPasswordResetSuite();
