import { query } from '../src/config/postgres.js';

async function cleanBetaDatabase() {
  console.log('================================================================');
  console.log('       STARTING SAFE DATABASE CLEANUP FOR BETA TESTING          ');
  console.log('================================================================\n');

  const tables = [
    'submission_files',
    'submissions',
    'request_deliverables',
    'request_attachments',
    'payments',
    'message_attachments',
    'message_read_by',
    'messages',
    'activity_logs',
    'notifications',
    'password_reset_tokens',
    'requests',
    'company_leads',
    'company_key_people',
    'companies',
    'users'
  ];

  console.log('--- 1. PRE-CLEANUP ROW COUNTS ---');
  for (const t of tables) {
    const res = await query(`SELECT count(*)::int as c FROM "${t}"`);
    console.log(`  ${t.padEnd(25)}: ${res.rows[0].c}`);
  }

  // Verify Super Admin exists before proceeding
  const adminCheck = await query(`
    SELECT id, name, email, role, status FROM users WHERE email = 'team@creativegini.com'
  `);
  if (!adminCheck.rows.length) {
    throw new Error('FATAL: Super Admin "team@creativegini.com" not found! Aborting cleanup.');
  }
  const superAdmin = adminCheck.rows[0];
  console.log(`\n[SAFEGUARD] Super Admin verified: ${superAdmin.email} (${superAdmin.name})`);

  console.log('\n--- 2. EXECUTING SAFE TRANSACTIONAL CLEANUP ---');
  await query('BEGIN');

  try {
    // 1. Leaf child tables
    await query('DELETE FROM submission_files');
    await query('DELETE FROM submissions');
    await query('DELETE FROM request_deliverables');
    await query('DELETE FROM request_attachments');
    await query('DELETE FROM payments');
    await query('DELETE FROM message_attachments');
    await query('DELETE FROM message_read_by');
    await query('DELETE FROM messages');
    await query('DELETE FROM activity_logs');
    await query('DELETE FROM notifications');
    await query('DELETE FROM password_reset_tokens');
    await query('DELETE FROM requests');
    await query('DELETE FROM company_leads');
    await query('DELETE FROM company_key_people');

    // 2. Clear any company reference on super admin
    await query(`UPDATE users SET company_id = NULL WHERE email = 'team@creativegini.com'`);

    // 3. Delete all non-admin users
    const deleteUsersRes = await query(`DELETE FROM users WHERE email != 'team@creativegini.com'`);
    console.log(`[CLEANUP] Deleted ${deleteUsersRes.rowCount} non-superadmin users.`);

    // 4. Delete all old companies
    const deleteCompRes = await query('DELETE FROM companies');
    console.log(`[CLEANUP] Deleted ${deleteCompRes.rowCount} companies.`);

    await query('COMMIT');
    console.log('[CLEANUP] Database transaction successfully committed!');
  } catch (err) {
    await query('ROLLBACK');
    console.error('[CLEANUP ERROR] Transaction rolled back due to error:', err);
    throw err;
  }

  console.log('\n--- 3. POST-CLEANUP ROW COUNTS ---');
  let hasUnexpectedData = false;
  for (const t of tables) {
    const res = await query(`SELECT count(*)::int as c FROM "${t}"`);
    const count = res.rows[0].c;
    console.log(`  ${t.padEnd(25)}: ${count}`);
    if (t === 'users') {
      if (count !== 1) {
        console.error(`ERROR: Expected exactly 1 user in users table, found ${count}!`);
        hasUnexpectedData = true;
      }
    } else {
      if (count !== 0) {
        console.error(`ERROR: Expected 0 rows in ${t}, found ${count}!`);
        hasUnexpectedData = true;
      }
    }
  }

  if (hasUnexpectedData) {
    throw new Error('Database cleanup failed verification! Unexpected records remain.');
  }

  // Confirm remaining user is Super Admin
  const remainingUserRes = await query('SELECT id, name, email, role, status, company_id FROM users');
  console.log('\n--- 4. REMAINING DATABASE USER ---');
  console.table(remainingUserRes.rows);

  const u = remainingUserRes.rows[0];
  if (u.email !== 'team@creativegini.com' || u.role !== 'ADMIN') {
    throw new Error('Remaining user is NOT the Super Admin!');
  }

  console.log('\n================================================================');
  console.log('  CLEAN BETA DATABASE STATE SUCCESSFULLY ESTABLISHED & VERIFIED  ');
  console.log('================================================================\n');
  process.exit(0);
}

cleanBetaDatabase().catch(err => {
  console.error('[FATAL CLEANUP FAILURE]:', err);
  process.exit(1);
});
