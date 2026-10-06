import { query } from '../backend/src/config/postgres.js';

async function main() {
  const t1 = await query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'company_leads'");
  console.log('company_leads columns:', t1.rows);

  const t2 = await query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'submission_files'");
  console.log('submission_files columns:', t2.rows);

  const t3 = await query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'companies'");
  console.log('companies columns:', t3.rows);

  const sampleLead = await query("SELECT * FROM company_leads LIMIT 2");
  console.log('Sample company_leads rows:', sampleLead.rows);

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
