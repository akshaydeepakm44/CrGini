import 'dotenv/config';
import { query } from '../src/config/postgres.js';

import bcrypt from 'bcryptjs';

async function main() {
  const hash = await bcrypt.hash('Admin@2026', 10);
  await query(
    `INSERT INTO users (name, email, password, role, status, company_boost, company_lead, company_ui)
     VALUES ('CreativeGini Super Admin', 'team@creativegini.com', $1, 'SUPER_ADMIN', 'ACTIVE', true, true, true)
     ON CONFLICT (email) DO UPDATE SET password = $1, role = 'SUPER_ADMIN', status = 'ACTIVE'`,
    [hash]
  );
  const res = await query("SELECT id, name, email, role, status FROM users WHERE email = 'team@creativegini.com'");
  console.log('--- ADMIN USER VERIFICATION ---');
  console.log(res.rows[0]);
  process.exit(0);
}

main().catch(console.error);
