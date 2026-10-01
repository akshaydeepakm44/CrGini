import 'dotenv/config';
import pool, { query } from '../src/config/postgres.js';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

async function performFinalCleanup() {
  console.log('========================================================================');
  console.log('   CREATIVEGINI DATABASE FINAL CLEANUP PROCEDURE (PHASE 19)            ');
  console.log('========================================================================\n');

  // STEP 1: CREATE FULL POSTGRESQL BACKUP
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = '/home/ubuntu/CreativeGiniWeb/backups';
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  const backupPath = path.join(backupDir, `creativegini_qa_backup_${timestamp}.sql`);
  console.log(`[Backup]: Generating full PostgreSQL backup at ${backupPath}...`);

  try {
    execSync(`sudo -u postgres pg_dump -d creativegini -F p -f "${backupPath}"`, { stdio: 'inherit' });
    const stats = fs.statSync(backupPath);
    console.log(`[Backup]: Backup completed successfully. File size: ${stats.size} bytes.\n`);
  } catch (err) {
    console.error('[Backup Error]: Failed to create database backup:', err.message);
    process.exit(1);
  }

  // STEP 2: VERIFY ADMIN USER BEFORE CLEANUP
  console.log('[Verification]: Checking Admin user before cleanup...');
  const adminCheck = await query("SELECT id, name, email, role, status, password FROM users WHERE email = 'team@creativegini.com'");
  if (adminCheck.rows.length !== 1) {
    console.error('[FATAL]: Admin user team@creativegini.com was not found or is duplicate!');
    process.exit(1);
  }
  const originalAdmin = adminCheck.rows[0];
  console.log(`[Admin]: Verified Admin ID: ${originalAdmin.id}, Role: ${originalAdmin.role}, Status: ${originalAdmin.status}`);

  // STEP 3: EXECUTE CLEANUP IN TRANSACTION
  console.log('\n[Transaction]: Starting atomic database cleanup transaction...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Delete child records first to respect FK constraints
    const tablesToClean = [
      'activity_logs',
      'notifications',
      'message_read_by',
      'message_attachments',
      'messages',
      'submission_files',
      'submissions',
      'payments',
      'request_deliverables',
      'request_attachments',
      'requests',
      'company_key_people',
      'company_leads',
      'password_reset_tokens'
    ];

    for (const table of tablesToClean) {
      const res = await client.query(`DELETE FROM ${table}`);
      console.log(`  ✓ Cleared ${res.rowCount} rows from ${table}`);
    }

    // Delete non-admin users
    const usersRes = await client.query("DELETE FROM users WHERE email != 'team@creativegini.com'");
    console.log(`  ✓ Cleared ${usersRes.rowCount} non-admin user rows from users`);

    // Delete companies
    const companiesRes = await client.query('DELETE FROM companies');
    console.log(`  ✓ Cleared ${companiesRes.rowCount} rows from companies`);

    // Ensure Admin company_id is NULL and role is ADMIN, status is ACTIVE
    await client.query("UPDATE users SET company_id = NULL, role = 'ADMIN', status = 'ACTIVE' WHERE email = 'team@creativegini.com'");

    await client.query('COMMIT');
    console.log('\n[Transaction]: Cleanup transaction COMMITTED successfully.\n');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n[FATAL]: Cleanup failed! Transaction ROLLED BACK:', err.message);
    client.release();
    process.exit(1);
  } finally {
    client.release();
  }

  // STEP 4: VERIFY POST-CLEANUP STATE
  console.log('--- FINAL DATABASE COUNTS VERIFICATION ---');
  const verifyTables = [
    'users',
    'companies',
    'company_leads',
    'company_key_people',
    'requests',
    'request_attachments',
    'request_deliverables',
    'payments',
    'submissions',
    'submission_files',
    'messages',
    'message_attachments',
    'message_read_by',
    'notifications',
    'activity_logs',
    'password_reset_tokens'
  ];

  for (const table of verifyTables) {
    const res = await query(`SELECT count(*)::int as count FROM ${table}`);
    const count = res.rows[0].count;
    if (table === 'users') {
      if (count !== 1) {
        console.error(`[FAIL]: users count is ${count}, expected exactly 1!`);
        process.exit(1);
      }
      console.log(`${table.padEnd(25)}: ${count} (EXACTLY 1 PRESERVED ADMIN)`);
    } else {
      if (count !== 0) {
        console.error(`[FAIL]: ${table} count is ${count}, expected 0!`);
        process.exit(1);
      }
      console.log(`${table.padEnd(25)}: ${count}`);
    }
  }

  const postAdmin = await query("SELECT id, name, email, role, status, password FROM users WHERE email = 'team@creativegini.com'");
  const currentAdmin = postAdmin.rows[0];

  console.log('\n--- PRESERVED ADMIN ACCOUNT AUDIT ---');
  console.log(`ID match:       ${currentAdmin.id === originalAdmin.id} (${currentAdmin.id})`);
  console.log(`Password match: ${currentAdmin.password === originalAdmin.password}`);
  console.log(`Role:           ${currentAdmin.role}`);
  console.log(`Status:         ${currentAdmin.status}`);
  console.log(`Email:          ${currentAdmin.email}`);

  console.log('\n========================================================================');
  console.log('   DATABASE CLEANUP SUCCESSFULLY COMPLETED & VERIFIED                   ');
  console.log('========================================================================');
  process.exit(0);
}

performFinalCleanup().catch(err => {
  console.error('[Fatal Error]:', err);
  process.exit(1);
});
