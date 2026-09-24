import { query } from '../src/config/postgres.js';

async function main() {
  console.log('====================================================');
  console.log('1. TABLE OWNERSHIP & CONNECTION DIAGNOSTICS');
  console.log('====================================================');
  
  const userRes = await query('SELECT current_user, session_user, current_database();');
  console.log('Connected user:', userRes.rows[0]);

  const ownersRes = await query(`
    SELECT tablename, tableowner 
    FROM pg_tables 
    WHERE schemaname = 'public' 
      AND tablename IN ('company_leads', 'company_key_people', 'companies', 'requests', 'users')
    ORDER BY tablename;
  `);
  console.log('Table Owners:');
  for (const row of ownersRes.rows) {
    console.log(`  - ${row.tablename}: owned by "${row.tableowner}"`);
  }

  console.log('\n====================================================');
  console.log('2. SCHEMA DETAILS (COLUMNS, TYPES, DEFAULTS)');
  console.log('====================================================');
  const targetTables = ['company_leads', 'company_key_people', 'companies', 'requests', 'users'];

  for (const t of targetTables) {
    const cols = await query(`
      SELECT column_name, data_type, udt_name, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_name = $1
      ORDER BY ordinal_position;
    `, [t]);

    console.log(`\n--- TABLE: ${t} (${cols.rows.length} columns) ---`);
    for (const c of cols.rows) {
      console.log(`  ${c.column_name.padEnd(25)} | ${c.data_type.padEnd(25)} | nullable: ${c.is_nullable.padEnd(3)} | default: ${c.column_default || 'NONE'}`);
    }
  }

  console.log('\n====================================================');
  console.log('3. FOREIGN KEYS & CONSTRAINTS');
  console.log('====================================================');
  const fkRes = await query(`
    SELECT
      tc.table_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name,
      tc.constraint_type
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    LEFT JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    WHERE tc.table_schema = 'public'
      AND tc.table_name IN ('company_leads', 'company_key_people', 'companies', 'requests', 'users')
    ORDER BY tc.table_name, tc.constraint_type;
  `);
  console.log('Constraints:');
  for (const c of fkRes.rows) {
    console.log(`  ${c.table_name.padEnd(20)} [${c.column_name}] -> ${c.constraint_type} ${c.foreign_table_name ? `to ${c.foreign_table_name}(${c.foreign_column_name})` : ''}`);
  }

  console.log('\n====================================================');
  console.log('4. EXISTING DATA & STATUS VALUES');
  console.log('====================================================');
  const leadStatuses = await query(`SELECT status, count(*) FROM company_leads GROUP BY status;`);
  console.log('company_leads status values:');
  for (const s of leadStatuses.rows) {
    console.log(`  - status="${s.status}": ${s.count} rows`);
  }

  const allLeads = await query(`SELECT * FROM company_leads;`);
  console.log(`\nTotal company_leads records: ${allLeads.rows.length}`);
  console.log(JSON.stringify(allLeads.rows, null, 2));

  const allKeyPeople = await query(`SELECT * FROM company_key_people;`);
  console.log(`\nTotal company_key_people records: ${allKeyPeople.rows.length}`);
  console.log(JSON.stringify(allKeyPeople.rows, null, 2));

  const requestsSample = await query(`
    SELECT id, ticket_id, user_id, company_id, service_type, title, status, assigned_team, price, payment_status, created_at
    FROM requests
    WHERE service_type = 'COMPANY_LEAD'
    LIMIT 5;
  `);
  console.log(`\nSample COMPANY_LEAD requests (${requestsSample.rows.length} found):`);
  console.log(JSON.stringify(requestsSample.rows, null, 2));

  process.exit(0);
}

main().catch(err => {
  console.error('Error running inspector:', err);
  process.exit(1);
});
