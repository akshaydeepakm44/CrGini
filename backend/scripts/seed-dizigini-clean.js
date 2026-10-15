import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { query, connectPostgres } from '../src/config/postgres.js';

dotenv.config();

export const seedDiziginiAccounts = async () => {
  try {
    await connectPostgres();
    console.log('[Seed] Connected to database:', process.env.POSTGRES_DB || 'dizigini_db');

    const salt = await bcrypt.genSalt(10);
    const superAdminHash = await bcrypt.hash('Admin@2026', salt);
    const adminHash = await bcrypt.hash('Admin@123', salt);
    const leadHash = await bcrypt.hash('Lead@123', salt);
    const clientHash = await bcrypt.hash('Client@123', salt);

    // 1. Cleanly provision Data I2I Company Profile
    let compRes = await query(`SELECT id FROM companies WHERE name = 'Data I2I' OR email = 'testclient@datai2i.com' LIMIT 1`);
    let companyId = compRes.rows[0]?.id;
    if (!companyId) {
      const newComp = await query(`
        INSERT INTO companies (name, email, website, contact_person, industry)
        VALUES ('Data I2I', 'testclient@datai2i.com', 'https://datai2i.com', 'Data I2I Client', 'AI & Data Intelligence')
        RETURNING id
      `);
      companyId = newComp.rows[0].id;
    } else {
      await query(`
        UPDATE companies
        SET name = 'Data I2I', website = 'https://datai2i.com', contact_person = 'Data I2I Client', industry = 'AI & Data Intelligence'
        WHERE id = $1
      `, [companyId]);
    }

    // 2. Specific DiziGini Authorized Logins: Super Admin, Admin, Lead Specialist, Client (Data I2I)
    const accounts = [
      {
        name: 'DiziGini Super Admin',
        email: 'team@creativegini.com',
        password: superAdminHash,
        role: 'SUPER_ADMIN',
        lead: true,
        boost: false,
        ui: false,
        phone: '+1 (800) 555-0199',
        companyId: null,
      },
      {
        name: 'DiziGini Admin',
        email: 'admin@creativegini.com',
        password: adminHash,
        role: 'ADMIN',
        lead: true,
        boost: false,
        ui: false,
        phone: '+1 (800) 555-0100',
        companyId: null,
      },
      {
        name: 'Lead Specialist',
        email: 'lead@creativegini.com',
        password: leadHash,
        role: 'COMPANY_LEAD',
        lead: true,
        boost: false,
        ui: false,
        phone: '+1 (800) 555-0101',
        companyId: null,
      },
      {
        name: 'Data I2I Client',
        email: 'testclient@datai2i.com',
        password: clientHash,
        role: 'USER',
        lead: false,
        boost: false,
        ui: false,
        phone: '+1 (555) 019-2834',
        companyId: companyId,
      },
    ];

    for (const acc of accounts) {
      await query(`
        INSERT INTO users (name, email, password, role, company_lead, company_boost, company_ui, company_id, phone, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'ACTIVE')
        ON CONFLICT (email) DO UPDATE SET
          name = EXCLUDED.name,
          password = EXCLUDED.password,
          role = EXCLUDED.role,
          company_lead = EXCLUDED.company_lead,
          company_boost = EXCLUDED.company_boost,
          company_ui = EXCLUDED.company_ui,
          company_id = EXCLUDED.company_id,
          status = 'ACTIVE',
          is_deleted = false
      `, [acc.name, acc.email, acc.password, acc.role, acc.lead, acc.boost, acc.ui, acc.companyId, acc.phone]);
      console.log(`[Seed] Provisioned: ${acc.email} (${acc.role})`);
    }

    // 3. Remove any unused boost or ui accounts from DiziGini database
    await query(`DELETE FROM users WHERE email IN ('boost@creativegini.com', 'ui@creativegini.com')`);
    console.log('[Seed] Removed any extraneous Boost and UI accounts from DiziGini.');

    console.log('✓ DiziGini isolated accounts provisioned successfully.');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
};

seedDiziginiAccounts();
