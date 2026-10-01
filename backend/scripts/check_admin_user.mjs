import 'dotenv/config';
import { query } from '../src/config/postgres.js';

async function main() {
  const res = await query("SELECT id, name, email, role, status FROM users WHERE email = 'team@creativegini.com'");
  console.log('--- ADMIN USER VERIFICATION ---');
  console.log(res.rows[0]);
  process.exit(0);
}

main().catch(console.error);
