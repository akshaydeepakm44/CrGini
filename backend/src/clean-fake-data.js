import dotenv from 'dotenv';
import { query, connectPostgres } from './config/postgres.js';

dotenv.config();

export async function cleanAllFakeData() {
  console.log('================================================================');
  console.log('CLEANING ALL DEFAULT, FAKE, AND TEST DATA FROM CREATIVEGINI DB');
  console.log('================================================================\n');

  await connectPostgres();

  const officialStaffEmails = [
    'team@creativegini.com',
    'admin@creativegini.com',
    'lead@creativegini.com',
    'boost@creativegini.com',
    'ui@creativegini.com',
    'testclient@datai2i.com'
  ];

  console.log('[1/7] Deleting all activity logs, notifications, and messages...');
  await query('DELETE FROM activity_logs');
  await query('DELETE FROM notifications');
  await query('DELETE FROM message_attachments');
  await query('DELETE FROM message_read_by');
  await query('DELETE FROM messages');

  console.log('[2/7] Deleting all submissions, deliverables, attachments, and payments...');
  await query('DELETE FROM submission_files');
  await query('DELETE FROM submissions');
  await query('DELETE FROM request_deliverables');
  await query('DELETE FROM request_attachments');
  await query('DELETE FROM payments');

  console.log('[3/7] Deleting all synthetic test tickets and requests...');
  await query('DELETE FROM requests');

  console.log('[4/7] Deleting all fake leads and key people...');
  await query('DELETE FROM company_key_people');
  await query('DELETE FROM company_leads');

  console.log('[5/7] Deleting all fake and test companies (preserving Data I2I)...');
  await query('UPDATE users SET company_id = NULL WHERE email NOT IN (\'testclient@datai2i.com\')');
  await query('DELETE FROM companies WHERE name != \'Data I2I\' AND email != \'testclient@datai2i.com\'');

  console.log('[6/7] Removing all fake clients and ephemeral test specialist accounts...');
  const deleteUsersResult = await query(
    `DELETE FROM users WHERE email NOT IN ($1, $2, $3, $4, $5, $6) RETURNING email, role`,
    officialStaffEmails
  );
  console.log(`  ✓ Removed ${deleteUsersResult.rowCount} fake/test user accounts.`);

  console.log('[7/7] Ensuring clean Data I2I client workspace & provisioning...');
  const { ensureDataI2IAccount } = await import('./controllers/authController.js');
  await ensureDataI2IAccount();

  const remainingUsers = await query(
    `SELECT u.id, u.name, u.email, u.role, c.name as company_name, u.status 
     FROM users u 
     LEFT JOIN companies c ON c.id = u.company_id 
     ORDER BY u.id ASC`
  );
  console.log('\nActive Clean Workspace Accounts:');
  console.table(remainingUsers.rows);

  console.log('\n================================================================');
  console.log('CLEANUP COMPLETE: ALL FAKE & SYNTHETIC DATA HAS BEEN REMOVED.');
  console.log('================================================================\n');
}

// Execute if run directly
if (process.argv[1]?.endsWith('clean-fake-data.js')) {
  cleanAllFakeData()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Cleanup failed:', err);
      process.exit(1);
    });
}
