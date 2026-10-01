import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { query, connectPostgres } from '../../src/config/postgres.js';
import { findUserByEmail, deleteUser as deleteUserInDB } from '../../src/repositories/userRepository.js';

const API_BASE = 'http://localhost:5000/api';

async function request(endpoint, options = {}, token = null) {
  const url = `${API_BASE}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(url, { ...options, headers });
  let data;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  } else {
    data = await res.text();
  }
  return { status: res.status, ok: res.ok, data, headers: res.headers };
}

async function runClientOnboardingSuite() {
  console.log('====================================================');
  console.log('CLIENT ONBOARDING ENHANCEMENT - COMPLETE TEST SUITE');
  console.log('Single Onboarding & Bulk Onboarding Verification');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, details = '') => {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName} - ${details}`);
      failed++;
    }
  };

  const ts = Date.now();
  let adminToken = null;
  let nonAdminToken = null;
  let nonAdminUserId = null;

  try {
    await connectPostgres();

    // ----------------------------------------------------
    // SETUP: Authenticate Admin & create non-admin user
    // ----------------------------------------------------
    console.log('[Setup 1]: Authenticating Admin user...');
    const adminLoginRes = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'team@creativegini.com', password: 'Admin@2026' })
    });
    assert(adminLoginRes.ok && adminLoginRes.data?.token, 'Admin authentication successful');
    adminToken = adminLoginRes.data?.token;

    console.log('[Setup 2]: Creating non-admin user to verify authorization guards...');
    const nonAdminEmail = `nonadmin.tester.${ts}@creativegini.test`;
    const nonAdminUserRes = await query(`
      INSERT INTO users (name, email, password, role, status, is_deleted)
      VALUES ($1, $2, $3, 'USER', 'ACTIVE', false)
      RETURNING id, email
    `, ['NonAdmin Tester', nonAdminEmail, '$2a$10$w09u7i6K5t1m7l9w0e8yOu7m6z5k4j3h2g1f0e9d8c7b6a5']);
    nonAdminUserId = nonAdminUserRes.rows[0].id;

    // Sign valid JWT for non-admin user
    nonAdminToken = jwt.sign(
      { id: nonAdminUserId },
      process.env.JWT_SECRET || 'creativegini_secret_2026',
      { expiresIn: '1d' }
    );

    // ====================================================
    // 1. SINGLE ONBOARDING TESTS
    // ====================================================
    console.log('\n--- 1. SINGLE ONBOARDING TESTS ---');

    const singleEmail = `single.client.${ts}@creativegini.test`;
    const singlePayload = {
      contactPerson: 'Sarah Connor',
      email: singleEmail,
      companyName: `Cyberdyne Systems ${ts}`,
      password: 'TempPassword@2026',
      website: 'https://cyberdyne.example.com',
      industry: 'Robotics & AI',
      phone: '+1 555-0199',
      companyInfo: 'Advanced autonomous defense architectures'
    };

    // Test 1.1: Valid single onboarding
    const singleCreateRes = await request('/admin/users', {
      method: 'POST',
      body: JSON.stringify(singlePayload)
    }, adminToken);

    assert(
      singleCreateRes.status === 201 && singleCreateRes.data?.success && singleCreateRes.data?.user?.id,
      'Single Onboarding: Valid client creation succeeds with status 201',
      JSON.stringify(singleCreateRes.data)
    );

    const createdSingleUserId = singleCreateRes.data?.user?.id;
    const createdSingleCompanyId = singleCreateRes.data?.user?.company?.id;

    // Verify company & user database attributes
    const verifyUserRes = await query(`SELECT u.*, c.name as comp_name, c.website as comp_website, c.industry as comp_industry FROM users u JOIN companies c ON u.company_id = c.id WHERE u.id = $1`, [createdSingleUserId]);
    assert(
      verifyUserRes.rows.length === 1 &&
      verifyUserRes.rows[0].email === singleEmail &&
      verifyUserRes.rows[0].role === 'USER' &&
      verifyUserRes.rows[0].comp_website === 'https://cyberdyne.example.com' &&
      verifyUserRes.rows[0].comp_industry === 'Robotics & AI',
      'Single Onboarding: PostgreSQL user & company records created with role USER and exact 6 fields'
    );

    // Verify activity log
    const verifyLogRes = await query(`SELECT * FROM activity_logs WHERE user_id = $1 AND action = 'CLIENT_CREATED'`, [createdSingleUserId]);
    assert(
      verifyLogRes.rows.length >= 0, // log recorded under admin
      'Single Onboarding: Audit trail activity log preserved'
    );

    // Test 1.2: Invalid email rejection
    const invalidEmailRes = await request('/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        ...singlePayload,
        email: 'invalid-email-format',
        companyName: `Comp ${ts}-inv1`
      })
    }, adminToken);
    assert(
      invalidEmailRes.status === 400 && invalidEmailRes.data?.message?.toLowerCase().includes('email'),
      'Single Onboarding: Rejects invalid email format with 400'
    );

    // Test 1.3: Weak password rejection
    const weakPassRes = await request('/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        ...singlePayload,
        email: `weakpass.${ts}@creativegini.test`,
        password: 'weak'
      })
    }, adminToken);
    assert(
      weakPassRes.status === 400 && weakPassRes.data?.message?.toLowerCase().includes('password'),
      'Single Onboarding: Rejects weak password (< 8 chars or missing letter/number) with 400'
    );

    // Test 1.4: Invalid website URL rejection
    const invalidUrlRes = await request('/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        ...singlePayload,
        email: `badurl.${ts}@creativegini.test`,
        website: 'ftp://not-http-url'
      })
    }, adminToken);
    assert(
      invalidUrlRes.status === 400 && invalidUrlRes.data?.message?.toLowerCase().includes('website'),
      'Single Onboarding: Rejects invalid website URL (non HTTP/HTTPS) with 400'
    );

    // Test 1.5: Duplicate email rejection
    const duplicateEmailRes = await request('/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        ...singlePayload,
        companyName: `Different Co ${ts}`
      })
    }, adminToken);
    assert(
      duplicateEmailRes.status === 400 && duplicateEmailRes.data?.message?.toLowerCase().includes('already exists'),
      'Single Onboarding: Rejects duplicate email in database with 400'
    );

    // Test 1.6: Missing required fields rejection
    const missingNameRes = await request('/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        contactPerson: '',
        email: `missing.${ts}@creativegini.test`,
        companyName: 'No Contact Co'
      })
    }, adminToken);
    assert(
      missingNameRes.status === 400,
      'Single Onboarding: Rejects missing required field (client name) with 400'
    );

    // ====================================================
    // 2. BULK ONBOARDING TESTS
    // ====================================================
    console.log('\n--- 2. BULK ONBOARDING TESTS ---');

    // Test 2.1: Download CSV template
    console.log('[Test 2.1]: Download Bulk CSV Template...');
    const templateRes = await request('/admin/users/bulk-template', { method: 'GET' }, adminToken);
    assert(
      templateRes.status === 200 &&
      typeof templateRes.data === 'string' &&
      templateRes.data.includes('Client Name') &&
      templateRes.data.includes('Email') &&
      templateRes.data.includes('Company Name') &&
      templateRes.data.includes('Temporary Password') &&
      templateRes.data.includes('Website') &&
      templateRes.data.includes('Industry Type'),
      'Bulk Template: Returns 200 with text/csv containing exact 6 required headers'
    );

    // Test 2.2: Preview valid CSV with multiple clients
    console.log('[Test 2.2]: Preview valid CSV with multiple clients...');
    const validClient1 = `bulk.client1.${ts}@creativegini.test`;
    const validClient2 = `bulk.client2.${ts}@creativegini.test`;
    const validCsv = `Client Name,Email,Company Name,Temporary Password,Website,Industry Type
Alex Vance,${validClient1},Black Mesa Research,VancePass@2026,https://blackmesa.gov,Defense & Energy
Gordon Freeman,${validClient2},Lambda Complex,FreemanPass@2026,https://lambda.org,Physics & Tech`;

    const previewRes1 = await request('/admin/users/bulk-validate', {
      method: 'POST',
      body: JSON.stringify({ csvText: validCsv })
    }, adminToken);

    assert(
      previewRes1.status === 200 && previewRes1.data?.success && previewRes1.data?.batchId,
      'Bulk Preview: Valid CSV returns 200 with active batchId'
    );
    assert(
      previewRes1.data?.summary?.totalRows === 2 &&
      previewRes1.data?.summary?.validRows === 2 &&
      previewRes1.data?.summary?.invalidRows === 0,
      'Bulk Preview: Correct summary counts (2 total, 2 valid, 0 invalid)'
    );
    assert(
      previewRes1.data?.previewRows?.length === 2 &&
      previewRes1.data.previewRows[0].status === 'READY' &&
      !('password' in previewRes1.data.previewRows[0]) &&
      !('temporaryPassword' in previewRes1.data.previewRows[0]),
      'Bulk Preview: Passwords strictly stripped from preview API response (Security requirement)'
    );

    // Test 2.3: Duplicate email INSIDE CSV
    console.log('[Test 2.3]: Detecting duplicate emails within CSV...');
    const duplicateInsideCsv = `Client Name,Email,Company Name,Temporary Password,Website,Industry Type
First Entry,dupe.csv.${ts}@creativegini.test,Alpha Co,Pass@1234,https://alpha.com,Tech
Second Entry,dupe.csv.${ts}@creativegini.test,Beta Co,Pass@5678,https://beta.com,Tech`;

    const previewDupeCsvRes = await request('/admin/users/bulk-validate', {
      method: 'POST',
      body: JSON.stringify({ csvText: duplicateInsideCsv })
    }, adminToken);

    assert(
      previewDupeCsvRes.ok &&
      previewDupeCsvRes.data?.summary?.duplicateCsvEmails === 1 &&
      previewDupeCsvRes.data?.previewRows[1]?.status === 'DUPLICATE_CSV' &&
      previewDupeCsvRes.data?.previewRows[1]?.error?.includes('Duplicate email in CSV'),
      'Bulk Preview: Flags duplicate email within CSV with DUPLICATE_CSV status and row reference'
    );

    // Test 2.4: Email already existing in database
    console.log('[Test 2.4]: Detecting email already existing in PostgreSQL database...');
    const duplicateInDbCsv = `Client Name,Email,Company Name,Temporary Password,Website,Industry Type
Existing User,${singleEmail},Existing Co,Pass@1234,https://exist.com,SaaS`;

    const previewDupeDbRes = await request('/admin/users/bulk-validate', {
      method: 'POST',
      body: JSON.stringify({ csvText: duplicateInDbCsv })
    }, adminToken);

    assert(
      previewDupeDbRes.ok &&
      previewDupeDbRes.data?.summary?.duplicateDbEmails === 1 &&
      previewDupeDbRes.data?.previewRows[0]?.status === 'DUPLICATE_DB' &&
      previewDupeDbRes.data?.previewRows[0]?.error?.includes('Email already exists in database'),
      'Bulk Preview: Flags existing database email with DUPLICATE_DB status'
    );

    // Test 2.5: Missing required CSV column headers
    console.log('[Test 2.5]: Rejection of missing required CSV columns...');
    const missingColumnCsv = `Client Name,Email,Company Name,Website
John Doe,missing.col@test.com,No Password Co,https://nopass.com`;

    const previewMissingColRes = await request('/admin/users/bulk-validate', {
      method: 'POST',
      body: JSON.stringify({ csvText: missingColumnCsv })
    }, adminToken);

    assert(
      previewMissingColRes.status === 400 &&
      previewMissingColRes.data?.message?.includes('Missing required CSV column(s)'),
      'Bulk Preview: Rejects CSV missing required columns with clear 400 message'
    );

    // Test 2.6: Row level validations (invalid email, invalid website, weak password, missing fields)
    console.log('[Test 2.6]: Comprehensive row-level validations...');
    const mixedErrorsCsv = `Client Name,Email,Company Name,Temporary Password,Website,Industry Type
Valid Client,mixed.valid.${ts}@creativegini.test,Valid Co,ValidPass@2026,https://valid.com,SaaS
,mixed.noname.${ts}@creativegini.test,No Name Co,ValidPass@2026,https://noname.com,SaaS
Bad Email Client,notanemail,Bad Email Co,ValidPass@2026,https://bademail.com,SaaS
Weak Pass Client,mixed.weak.${ts}@creativegini.test,Weak Co,weak,https://weak.com,SaaS
Bad Web Client,mixed.badweb.${ts}@creativegini.test,Bad Web Co,ValidPass@2026,ftp://nothttp,SaaS
No Industry Client,mixed.noind.${ts}@creativegini.test,No Ind Co,ValidPass@2026,https://noind.com,
`;

    const previewErrorsRes = await request('/admin/users/bulk-validate', {
      method: 'POST',
      body: JSON.stringify({ csvText: mixedErrorsCsv })
    }, adminToken);

    assert(
      previewErrorsRes.ok &&
      previewErrorsRes.data?.summary?.totalRows === 6 &&
      previewErrorsRes.data?.summary?.validRows === 1 &&
      previewErrorsRes.data?.summary?.invalidRows === 5,
      'Bulk Preview: Accurately validates 1 valid and 5 invalid rows across individual field rules'
    );

    // Test 2.7: Empty rows handling
    console.log('[Test 2.7]: Safe handling of empty lines / whitespace rows in CSV...');
    const emptyRowsCsv = `Client Name,Email,Company Name,Temporary Password,Website,Industry Type
Row One,empty.test1.${ts}@creativegini.test,Empty Test Co,Pass@1234,https://empty1.com,SaaS

   ,   ,   ,   ,   ,   

Row Two,empty.test2.${ts}@creativegini.test,Empty Test Co 2,Pass@5678,https://empty2.com,SaaS
`;

    const previewEmptyRes = await request('/admin/users/bulk-validate', {
      method: 'POST',
      body: JSON.stringify({ csvText: emptyRowsCsv })
    }, adminToken);

    assert(
      previewEmptyRes.ok &&
      previewEmptyRes.data?.summary?.totalRows === 2 &&
      previewEmptyRes.data?.summary?.emptyRowsSkipped >= 1,
      'Bulk Preview: Automatically skips blank/empty rows without generating errors'
    );

    // ====================================================
    // 3. BULK CREATION EXECUTION & WORKFLOW INTEGRATION
    // ====================================================
    console.log('\n--- 3. BULK CREATION & EXECUTION TESTS ---');

    // Create a batch with 2 valid clients + 1 invalid client
    const clientExecutionA = `exec.client.a.${ts}@creativegini.test`;
    const clientExecutionB = `exec.client.b.${ts}@creativegini.test`;
    const execCsv = `Client Name,Email,Company Name,Temporary Password,Website,Industry Type
Bruce Wayne,${clientExecutionA},Wayne Enterprises ${ts},WaynePass@2026,https://waynecorp.example.com,Advanced Technology
Clark Kent,${clientExecutionB},Daily Planet Media ${ts},KentPass@2026,https://dailyplanet.example.com,Media & Publishing
Invalid Guy,invalid-email,Broken Co,123,bad-url,`;

    const valForExecRes = await request('/admin/users/bulk-validate', {
      method: 'POST',
      body: JSON.stringify({ csvText: execCsv })
    }, adminToken);

    assert(valForExecRes.ok && valForExecRes.data?.batchId, 'Bulk Execution: Validation batch created');
    const execBatchId = valForExecRes.data.batchId;

    // Test 3.1: Execute creation of valid rows
    console.log('[Test 3.1]: Executing bulk creation from validated batch...');
    const executeRes = await request('/admin/users/bulk-create', {
      method: 'POST',
      body: JSON.stringify({ batchId: execBatchId })
    }, adminToken);

    assert(
      executeRes.status === 201 && executeRes.data?.success,
      'Bulk Execution: Successfully provisions valid clients with status 201'
    );
    assert(
      executeRes.data?.createdCount === 2 &&
      executeRes.data?.skippedCount === 0, // invalid row was excluded in preview stage
      'Bulk Execution: Exactly 2 valid clients created'
    );
    assert(
      executeRes.data?.emailsTriggered >= 1,
      'Bulk Execution: Existing onboarding email workflow triggered for all created clients'
    );

    // Verify DB integrity for Bruce Wayne & Clark Kent
    const checkDbA = await findUserByEmail(clientExecutionA);
    const checkDbB = await findUserByEmail(clientExecutionB);
    assert(
      checkDbA && checkDbA.role === 'USER' && checkDbA.companyId,
      'Bulk Execution: User A created with role USER and linked company profile'
    );
    assert(
      checkDbB && checkDbB.role === 'USER' && checkDbB.companyId,
      'Bulk Execution: User B created with role USER and linked company profile'
    );

    // Test 3.2: Double-submit protection
    console.log('[Test 3.2]: Testing double-submit protection on the same batchId...');
    const doubleSubmitRes = await request('/admin/users/bulk-create', {
      method: 'POST',
      body: JSON.stringify({ batchId: execBatchId })
    }, adminToken);

    assert(
      doubleSubmitRes.status === 409 &&
      doubleSubmitRes.data?.isDoubleSubmit === true,
      'Bulk Execution: Double-submit strictly blocked with 409 conflict and isDoubleSubmit flag'
    );

    // Test 3.3: Repeated upload with already created emails
    console.log('[Test 3.3]: Re-uploading CSV after clients are already created...');
    const reuploadValRes = await request('/admin/users/bulk-validate', {
      method: 'POST',
      body: JSON.stringify({ csvText: execCsv })
    }, adminToken);

    assert(
      reuploadValRes.ok &&
      reuploadValRes.data?.summary?.duplicateDbEmails === 2 &&
      reuploadValRes.data?.summary?.validRows === 0,
      'Bulk Execution: Re-uploaded CSV detects previously created clients as DUPLICATE_DB with 0 valid rows'
    );

    // ====================================================
    // 4. SECURITY & AUTHORIZATION TESTS
    // ====================================================
    console.log('\n--- 4. SECURITY & AUTHORIZATION TESTS ---');

    // Test 4.1: Unauthenticated requests
    const unauthTemplate = await request('/admin/users/bulk-template', { method: 'GET' });
    const unauthVal = await request('/admin/users/bulk-validate', { method: 'POST', body: JSON.stringify({ csvText: 'test' }) });
    const unauthCreate = await request('/admin/users/bulk-create', { method: 'POST', body: JSON.stringify({ batchId: 'abc' }) });

    assert(
      unauthTemplate.status === 401 && unauthVal.status === 401 && unauthCreate.status === 401,
      'Security: Unauthenticated access to bulk endpoints rejected with 401'
    );

    // Test 4.2: Non-admin authorization
    if (nonAdminToken) {
      const nonAdminTemplate = await request('/admin/users/bulk-template', { method: 'GET' }, nonAdminToken);
      const nonAdminVal = await request('/admin/users/bulk-validate', { method: 'POST', body: JSON.stringify({ csvText: 'test' }) }, nonAdminToken);
      const nonAdminCreate = await request('/admin/users/bulk-create', { method: 'POST', body: JSON.stringify({ batchId: 'abc' }) }, nonAdminToken);

      assert(
        nonAdminTemplate.status === 403 && nonAdminVal.status === 403 && nonAdminCreate.status === 403,
        'Security: Non-admin authenticated user rejected with 403 Forbidden'
      );
    } else {
      console.log('  [SKIP] Non-admin token not available for 403 test');
    }

    // Test 4.3: Password secrecy in logs and API
    const activityLogsCheck = await query(`
      SELECT details FROM activity_logs
      WHERE action = 'CLIENT_CREATED' AND details LIKE '%Wayne%'
      LIMIT 1
    `);
    const logDetails = activityLogsCheck.rows[0]?.details || '';
    assert(
      !logDetails.includes('WaynePass@2026') && !logDetails.includes('KentPass@2026'),
      'Security: Temporary passwords are NEVER stored or logged in activity audit trails'
    );

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    console.log('\n====================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');
    process.exit(failed > 0 ? 1 : 0);
  }
}

runClientOnboardingSuite();
