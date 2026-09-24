import { query } from '../src/config/postgres.js';

async function migrate() {
  console.log('[Migration]: Starting company_leads and company_key_people schema update...');

  // 1. Add columns to company_leads
  await query(`
    ALTER TABLE company_leads
    ADD COLUMN IF NOT EXISTS request_id UUID REFERENCES requests(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS ticket_id VARCHAR(50),
    ADD COLUMN IF NOT EXISTS company_website VARCHAR(255),
    ADD COLUMN IF NOT EXISTS company_industry VARCHAR(150),
    ADD COLUMN IF NOT EXISTS company_description TEXT,
    ADD COLUMN IF NOT EXISTS relevance_reason TEXT,
    ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'PENDING',
    ADD COLUMN IF NOT EXISTS verification_details TEXT,
    ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS source_reference TEXT;
  `);

  // 2. Change default status to 'PENDING'
  await query(`
    ALTER TABLE company_leads
    ALTER COLUMN status SET DEFAULT 'PENDING';
  `);

  // 3. Add columns to company_key_people
  await query(`
    ALTER TABLE company_key_people
    ADD COLUMN IF NOT EXISTS lead_id UUID REFERENCES company_leads(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'PENDING',
    ADD COLUMN IF NOT EXISTS source_reference TEXT;
  `);

  // 4. Update existing unverified / sample leads to PENDING
  // Any lead without verification_details or source_reference cannot be legitimately VERIFIED
  const updateResult = await query(`
    UPDATE company_leads
    SET 
      status = 'PENDING',
      verification_status = 'PENDING'
    WHERE verification_details IS NULL OR source_reference IS NULL OR verified_at IS NULL;
  `);
  console.log(`[Migration]: Normalized ${updateResult.rowCount} unverified leads to status = 'PENDING'.`);

  // 5. Verify the new columns
  const cols = await query(`
    SELECT column_name, data_type, column_default
    FROM information_schema.columns
    WHERE table_name = 'company_leads'
    ORDER BY ordinal_position;
  `);
  console.log('[Migration]: Updated company_leads columns:');
  console.table(cols.rows);

  console.log('[Migration]: Schema update completed successfully.');
  process.exit(0);
}

migrate().catch(err => {
  console.error('[Migration Error]:', err);
  process.exit(1);
});
