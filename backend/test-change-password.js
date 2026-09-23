import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

import { query, connectPostgres } from './src/config/postgres.js';
import { createUser, findUserByEmail } from './src/repositories/userRepository.js';

const API_BASE = 'http://localhost:5000/api';

async function request(endpoint, options = {}, token = null) {
  const url = `${API_BASE}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(url, { ...options, headers });
  const data = await res.json();
  return { status: res.status, ok: res.ok, data };
}

async function runChangePasswordSuite() {
  console.log('====================================================');
  console.log('CREATIVEGINI AUTHENTICATED CHANGE PASSWORD SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const testUserEmail = `test.changepw.${Date.now()}@creativegini.test`;
  const victimUserEmail = `victim.user.${Date.now()}@creativegini.test`;
  const initialPassword = 'InitialTempPass@2026';
  const updatedPassword = 'MyNewSecurePass@2026';
  let testUserId = null;
  let victimUserId = null;
  let userToken = null;

  try {
    await connectPostgres();

    // Setup 1: Create dedicated temporary test user
    console.log('[Setup]: Creating temporary test user...');
    const salt = await bcrypt.genSalt(10);
    const hashedInitial = await bcrypt.hash(initialPassword, salt);

    const created = await createUser({
      name: 'Change Password Test User',
      email: testUserEmail,
      password: hashedInitial,
      role: 'USER',
      status: 'ACTIVE'
    });
    testUserId = created.id;

    // Setup 2: Create a second user to test privilege escalation / ID spoofing prevention
    const createdVictim = await createUser({
      name: 'Victim User',
      email: victimUserEmail,
      password: hashedInitial,
      role: 'USER',
      status: 'ACTIVE'
    });
    victimUserId = createdVictim.id;

    console.log(`[Setup]: Test user: ${testUserEmail} (ID: ${testUserId})`);
    console.log(`[Setup]: Victim user: ${victimUserEmail} (ID: ${victimUserId})\n`);

    // Log in test user to get valid JWT token
    const loginRes = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: testUserEmail, password: initialPassword })
    });

    if (loginRes.status === 200 && loginRes.data.token) {
      userToken = loginRes.data.token;
      console.log('  ✓ Test user authenticated successfully with initial credentials');
      passed++;
    } else {
      throw new Error(`Initial login failed: ${JSON.stringify(loginRes)}`);
    }

    // TEST 1: Incorrect current password should be rejected
    console.log('\nTEST 1: Incorrect current password rejected...');
    const res1 = await request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({
        currentPassword: 'WrongPassword@999',
        newPassword: updatedPassword
      })
    }, userToken);

    if (res1.status === 400 && res1.data.message === 'Current password is incorrect.') {
      console.log('  ✓ Incorrect current password rejected with 400');
      passed++;
    } else {
      console.error('  ✗ Unexpected response for wrong current password:', res1);
      failed++;
    }

    // TEST 2: Weak new passwords should be rejected
    console.log('\nTEST 2: Weak new password validation...');
    
    // 2a. Shorter than 8 chars
    const res2a = await request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword: initialPassword, newPassword: 'abc1' })
    }, userToken);

    // 2b. Missing numbers
    const res2b = await request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword: initialPassword, newPassword: 'onlyletterslong' })
    }, userToken);

    // 2c. Missing letters
    const res2c = await request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword: initialPassword, newPassword: '1234567890123' })
    }, userToken);

    if (res2a.status === 400 && res2b.status === 400 && res2c.status === 400) {
      console.log('  ✓ Passwords shorter than 8 chars, missing letters, or missing numbers rejected');
      passed++;
    } else {
      console.error('  ✗ Weak password validation failed:', { res2a, res2b, res2c });
      failed++;
    }

    // TEST 3: New password equals current password should be rejected
    console.log('\nTEST 3: New password equals current password rejected...');
    const res3 = await request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({
        currentPassword: initialPassword,
        newPassword: initialPassword
      })
    }, userToken);

    if (res3.status === 400 && res3.data.message === 'New password must be different from your current password.') {
      console.log('  ✓ Same password rejected with 400');
      passed++;
    } else {
      console.error('  ✗ Same password rejection failed:', res3);
      failed++;
    }

    // TEST 4: Attempt to change another user's password by supplying victim userId in payload
    console.log('\nTEST 4: User ID spoofing attempt in payload...');
    const res4 = await request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({
        userId: victimUserId, // Spoof attempt
        currentPassword: initialPassword,
        newPassword: updatedPassword
      })
    }, userToken);

    // Should succeed for the authenticated user, BUT victim's password MUST remain unchanged
    if (res4.status === 200 && res4.data.success) {
      // Verify victim user's password was NOT changed
      const victimCheck = await findUserByEmail(victimUserEmail, { includePassword: true });
      const victimStillOld = await bcrypt.compare(initialPassword, victimCheck.password);
      if (victimStillOld) {
        console.log('  ✓ Backend safely used req.user.id; victim password was NOT altered');
        passed++;
      } else {
        console.error('  ✗ Critical: Victim password was altered by spoofed payload!');
        failed++;
      }
    } else {
      console.error('  ✗ Request failed unexpectedly:', res4);
      failed++;
    }

    // TEST 5: Login with new password succeeds
    console.log('\nTEST 5: Login with new password succeeds...');
    const res5 = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: testUserEmail, password: updatedPassword })
    });

    if (res5.status === 200 && res5.data.success && res5.data.token) {
      console.log('  ✓ Logged in successfully with newly changed password');
      passed++;
    } else {
      console.error('  ✗ Login with new password failed:', res5);
      failed++;
    }

    // TEST 6: Login with old password fails
    console.log('\nTEST 6: Login with old password fails...');
    const res6 = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: testUserEmail, password: initialPassword })
    });

    if (res6.status === 401 && !res6.data.success) {
      console.log('  ✓ Old password correctly rejected with 401');
      passed++;
    } else {
      console.error('  ✗ Old password was unexpectedly accepted:', res6);
      failed++;
    }

    // TEST 7: Unauthenticated request rejected
    console.log('\nTEST 7: Unauthenticated request rejected...');
    const res7 = await request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({
        currentPassword: updatedPassword,
        newPassword: 'AnotherPassword@2026'
      })
    }, null); // No token

    if (res7.status === 401) {
      console.log('  ✓ Unauthenticated request rejected with 401');
      passed++;
    } else {
      console.error('  ✗ Unauthenticated request was not rejected:', res7);
      failed++;
    }

    // TEST 8: Verify Forgot Password flow still works concurrently
    console.log('\nTEST 8: Verify Forgot Password flow still works...');
    const res8 = await request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: testUserEmail })
    });

    if (res8.status === 200 && res8.data.success) {
      console.log('  ✓ Forgot password endpoint works normally');
      passed++;
    } else {
      console.error('  ✗ Forgot password endpoint failed:', res8);
      failed++;
    }

    // TEST 9: Verify Admin login is completely intact
    console.log('\nTEST 9: Verify Admin account login is intact...');
    const res9 = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@creativegini.com', password: 'Admin@123' })
    });

    if (res9.status === 200 && res9.data.success && res9.data.user?.role === 'ADMIN') {
      console.log('  ✓ Admin login verified with role ADMIN');
      passed++;
    } else {
      console.error('  ✗ Admin login check failed:', res9);
      failed++;
    }

  } catch (err) {
    console.error('[TEST SUITE ERROR]:', err);
    failed++;
  } finally {
    // Clean up temporary test users
    console.log('\n[Cleanup]: Cleaning up temporary test users...');
    try {
      if (testUserId) {
        await query('DELETE FROM password_reset_tokens WHERE user_id = $1', [testUserId]);
        await query('DELETE FROM activity_logs WHERE user_id = $1', [testUserId]);
        await query('DELETE FROM users WHERE id = $1', [testUserId]);
      }
      if (victimUserId) {
        await query('DELETE FROM password_reset_tokens WHERE user_id = $1', [victimUserId]);
        await query('DELETE FROM activity_logs WHERE user_id = $1', [victimUserId]);
        await query('DELETE FROM users WHERE id = $1', [victimUserId]);
      }
      console.log('[Cleanup]: Temporary test data removed cleanly.');
    } catch (cleanErr) {
      console.warn('[Cleanup Warning]:', cleanErr.message);
    }

    console.log('\n====================================================');
    console.log(`TEST SUITE FINISHED: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    process.exit(failed > 0 ? 1 : 0);
  }
}

runChangePasswordSuite();
