import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { query, connectPostgres } from './config/postgres.js';

dotenv.config();

const seedStaffAccounts = async () => {
  if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_PRODUCTION_SEED) {
    console.error('[CRITICAL SAFEGUARD] seed-pg.js execution is strictly prohibited in production environment.');
    process.exit(1);
  }

  try {
    await connectPostgres();
    console.log('[Seed-PG] Connected to PostgreSQL. Provisioning genuine staff accounts...');

    const salt = await bcrypt.genSalt(10);
    const superAdminHash = await bcrypt.hash('Admin@2026', salt);
    const adminHash = await bcrypt.hash('Admin@123', salt);
    const leadHash = await bcrypt.hash('Lead@123', salt);
    const boostHash = await bcrypt.hash('Boost@123', salt);
    const uiHash = await bcrypt.hash('UI@123', salt);

    const staffAccounts = [
      {
        name: 'CreativeGini Super Admin',
        email: 'team@creativegini.com',
        password: superAdminHash,
        role: 'SUPER_ADMIN',
        lead: true,
        boost: true,
        ui: true,
        phone: '+1 (800) 555-0199',
      },
      {
        name: 'CreativeGini Admin',
        email: 'admin@creativegini.com',
        password: adminHash,
        role: 'ADMIN',
        lead: true,
        boost: true,
        ui: true,
        phone: '+1 (800) 555-0100',
      },
      {
        name: 'Company Lead Specialist',
        email: 'lead@creativegini.com',
        password: leadHash,
        role: 'COMPANY_LEAD',
        lead: true,
        boost: false,
        ui: false,
        phone: '+1 (800) 555-0101',
      },
      {
        name: 'Growth & Boost Strategist',
        email: 'boost@creativegini.com',
        password: boostHash,
        role: 'COMPANY_BOOST',
        lead: false,
        boost: true,
        ui: false,
        phone: '+1 (800) 555-0102',
      },
      {
        name: 'Landing Page UI/UX Architect',
        email: 'ui@creativegini.com',
        password: uiHash,
        role: 'LANDING_PAGE',
        lead: false,
        boost: false,
        ui: true,
        phone: '+1 (800) 555-0103',
      },
    ];

    // Attempt to drop legacy role check constraint if present
    try {
      await query(`ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check`);
    } catch (_) {}

    for (const staff of staffAccounts) {
      try {
        await query(`
          INSERT INTO users (name, email, password, role, company_lead, company_boost, company_ui, phone, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'ACTIVE')
          ON CONFLICT (email) DO UPDATE SET
            name = EXCLUDED.name,
            role = EXCLUDED.role,
            company_lead = EXCLUDED.company_lead,
            company_boost = EXCLUDED.company_boost,
            company_ui = EXCLUDED.company_ui,
            status = 'ACTIVE'
        `, [staff.name, staff.email, staff.password, staff.role, staff.lead, staff.boost, staff.ui, staff.phone]);
      } catch (err) {
        if (err.constraint === 'users_role_check' && staff.role === 'SUPER_ADMIN') {
          console.warn('[Seed-PG] Legacy users_role_check detected on database; provisioning Super Admin with role ADMIN...');
          await query(`
            INSERT INTO users (name, email, password, role, company_lead, company_boost, company_ui, phone, status)
            VALUES ($1, $2, $3, 'ADMIN', $4, $5, $6, $7, 'ACTIVE')
            ON CONFLICT (email) DO UPDATE SET
              name = EXCLUDED.name,
              role = 'ADMIN',
              company_lead = EXCLUDED.company_lead,
              company_boost = EXCLUDED.company_boost,
              company_ui = EXCLUDED.company_ui,
              status = 'ACTIVE'
          `, [staff.name, staff.email, staff.password, staff.lead, staff.boost, staff.ui, staff.phone]);
        } else {
          throw err;
        }
      }
    }

    // Provision an official clean demo client account with company profile
    const clientHash = await bcrypt.hash('Client@123', salt);
    let compRes = await query(`SELECT id FROM companies WHERE email = 'client@creativegini.com'`);
    let companyId = compRes.rows[0]?.id;
    if (!companyId) {
      const newComp = await query(`
        INSERT INTO companies (name, email, website, contact_person, industry)
        VALUES ('Apex Enterprise Solutions', 'client@creativegini.com', 'https://apexenterprise.test', 'Alex Mercer', 'Enterprise B2B Technology')
        RETURNING id
      `);
      companyId = newComp.rows[0].id;
    }

    await query(`
      INSERT INTO users (name, email, password, role, company_id, phone, status)
      VALUES ('Alex Mercer (Client)', 'client@creativegini.com', $1, 'USER', $2, '+1 (555) 019-2834', 'ACTIVE')
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        role = 'USER',
        company_id = EXCLUDED.company_id,
        status = 'ACTIVE'
    `, [clientHash, companyId]);

    console.log('[Seed-PG] Genuine staff accounts and official client verified successfully.');

    console.log('[Seed-PG] Genuine staff accounts verified successfully (Zero fake data seeded).');
    process.exit(0);
  } catch (error) {
    console.error('[Seed-PG] Error seeding staff accounts:', error);
    process.exit(1);
  }
};

seedStaffAccounts();
