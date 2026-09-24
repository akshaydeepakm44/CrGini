import { query } from '../src/config/postgres.js';

async function main() {
  console.log('[Normalize]: Updating sample leads with name LIKE \'%Sample%\' to PENDING...');
  const res = await query(`
    UPDATE company_leads
    SET status = 'PENDING'
    WHERE name ILIKE '%Sample%' OR notes IS NULL;
  `);
  console.log(`[Normalize]: Updated ${res.rowCount} rows to status = 'PENDING'.`);

  const check = await query(`SELECT id, name, status, notes FROM company_leads;`);
  console.table(check.rows);
  process.exit(0);
}

main().catch(err => {
  console.error('[Normalize Error]:', err);
  process.exit(1);
});
