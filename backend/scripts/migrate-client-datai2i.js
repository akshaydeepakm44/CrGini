import { query, connectPostgres } from '../src/config/postgres.js';

async function migrate() {
  await connectPostgres();
  
  // Ensure Data I2I company exists
  let compRes = await query(`SELECT id FROM companies WHERE name = 'Data I2I' OR email = 'testclient@datai2i.com' LIMIT 1`);
  let dataI2ICompanyId = compRes.rows[0]?.id;
  
  if (!dataI2ICompanyId) {
    const newComp = await query(`
      INSERT INTO companies (name, email, website, contact_person, industry)
      VALUES ('Data I2I', 'testclient@datai2i.com', 'https://datai2i.com', 'Data I2I Client', 'AI & Data Intelligence')
      RETURNING id
    `);
    dataI2ICompanyId = newComp.rows[0].id;
  } else {
    await query(`
      UPDATE companies
      SET name = 'Data I2I', website = 'https://datai2i.com', contact_person = 'Data I2I Client', industry = 'AI & Data Intelligence'
      WHERE id = $1
    `, [dataI2ICompanyId]);
  }

  // Update testclient@datai2i.com
  await query(`
    UPDATE users
    SET name = 'Data I2I Client', company_id = $1, status = 'ACTIVE'
    WHERE email = 'testclient@datai2i.com'
  `, [dataI2ICompanyId]);

  // Update client@creativegini.com (Alex Mercer legacy account) to also be Data I2I
  await query(`
    UPDATE users
    SET name = 'Data I2I Client', company_id = $1, status = 'ACTIVE'
    WHERE email = 'client@creativegini.com'
  `, [dataI2ICompanyId]);

  // Update company 53 (Apex Enterprise Solutions) if it exists
  await query(`
    UPDATE companies
    SET name = 'Data I2I', contact_person = 'Data I2I Client'
    WHERE email = 'client@creativegini.com'
  `);

  console.log('[Migration] Successfully updated client accounts and companies to Data I2I (Company ID: ' + dataI2ICompanyId + ')');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('[Migration Error]:', err);
  process.exit(1);
});
