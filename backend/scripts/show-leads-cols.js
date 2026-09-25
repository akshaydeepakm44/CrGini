import { query } from '../src/config/postgres.js';

async function main() {
  const res = await query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'company_leads'
    ORDER BY ordinal_position;
  `);
  console.log('company_leads columns:');
  console.table(res.rows);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
