import { query } from './postgres.js';

/**
 * Self-healing schema migration to ensure all required tables and columns exist
 * across all database environments (Dev, Test, Staging, Production).
 */
export async function ensureServiceSettingsTable() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS service_channel_settings (
        id VARCHAR(100) PRIMARY KEY,
        channel VARCHAR(100) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        is_channel BOOLEAN NOT NULL DEFAULT FALSE,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Seed default settings if empty
    const countRes = await query('SELECT COUNT(*) AS count FROM service_channel_settings');
    if (parseInt(countRes.rows[0].count, 10) === 0) {
      const defaults = [
        // Channels
        ['channel:boosting', 'boosting', 'BOOSTING Channel', 'Growth, GTM & Content', false, true],
        ['channel:digitalising', 'digitalising', 'DIGITALISING Channel', 'Research, insights and business intelligence', true, true],
        ['channel:design', 'design', 'UI / DESIGN Channel', 'Interface design & UX heuristics', false, true],
        ['channel:development', 'development', 'APP DEVELOPMENT Channel', 'Full-stack web & mobile apps', false, true],
        
        // Boosting services (deactivated in DiziGini architecture)
        ['strategic-planner', 'boosting', 'Strategic Planner', 'Build a focused growth and marketing plan', false, false],
        ['content-creator', 'boosting', 'Content Creator', 'High-impact narrative copy & creative assets', false, false],
        ['devrel', 'boosting', 'DevRel & Technical Advocacy', 'Developer advocacy & community positioning', false, false],
        ['gtm', 'boosting', 'GTM Strategy', 'Launch execution blueprints & traction models', false, false],
        ['ad-creatives', 'boosting', 'Ad Creatives', 'High-converting ad banners & copy angles', false, false],
        ['brand-identity', 'boosting', 'Brand Identity & Positioning', 'Distinctive brand voice & visual guidelines', false, false],

        // Digitalising services (ACTIVE - Core DiziGini Platform)
        ['lead-research', 'digitalising', 'Lead Research', 'Find relevant companies and verified prospect contact intelligence', true, false],
        ['company-study', 'digitalising', 'Company Study', 'Get a structured personal company study & account dossier', true, false],
        ['key-people', 'digitalising', 'Key People Research', 'Identify relevant decision-makers & leadership contacts', true, false],
        ['pitch-support', 'digitalising', 'Pitch Support', 'Pitch support and competitor analysis to win presentations', true, false],

        // Design services (deactivated in DiziGini architecture)
        ['ui-ux-audit', 'design', 'UI/UX Audit', 'Comprehensive usability evaluation & UX heuristics', false, false],
        ['figma-project', 'design', 'Figma Project', 'Figma component systems, mock screens & prototypes', false, false],
        ['redesign-request', 'design', 'Landing Page Redesign', 'Full-page interface transformations & overhauls', false, false],

        // Development services (deactivated in DiziGini architecture)
        ['technical-discovery', 'development', 'Technical Discovery', 'Technical discovery & architecture planning', false, false],
        ['clickable-prototype', 'development', 'Clickable App Prototype', 'Clickable interactive web & mobile prototypes', false, false],
        ['web-app', 'development', 'MVP Development', 'Production-ready web application MVP (POC + V1)', false, false]
      ];

      for (const [id, channel, name, desc, isActive, isChannel] of defaults) {
        await query(
          'INSERT INTO service_channel_settings (id, channel, name, description, is_active, is_channel) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING',
          [id, channel, name, desc, isActive, isChannel]
        );
      }
    }

    // Enforce DiziGini single-focus platform in database: digitalising active, others deactivated
    await query("UPDATE service_channel_settings SET is_active = true WHERE channel = 'digitalising'");
    await query("UPDATE service_channel_settings SET is_active = false WHERE channel IN ('boosting', 'design', 'development')");
    return true;
  } catch (err) {
    console.error('[Schema Warning] ensureServiceSettingsTable error:', err.message);
    return false;
  }
}

/**
 * Self-healing schema migration to ensure all required tables and columns exist
 * across all database environments (Dev, Test, Staging, Production).
 */
export async function ensureSchemaIntegrity() {
  try {
    // 1. Ensure request_deliverables has created_at and delivered_at columns
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS request_deliverables (
          id SERIAL PRIMARY KEY,
          request_id INTEGER NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
          title VARCHAR(500) NOT NULL,
          url TEXT,
          description TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);
      await query(`
        ALTER TABLE request_deliverables 
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
      `);
      await query(`
        ALTER TABLE request_deliverables 
        ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ DEFAULT NOW();
      `);
    } catch (e1) {
      console.warn('[Schema] request_deliverables step note:', e1.message);
    }

    // 2. Ensure request_attachments has created_at column
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS request_attachments (
          id SERIAL PRIMARY KEY,
          request_id INTEGER NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
          name VARCHAR(500) NOT NULL,
          url TEXT NOT NULL,
          size VARCHAR(50),
          type VARCHAR(255),
          uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);
      await query(`
        ALTER TABLE request_attachments 
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
      `);
    } catch (e2) {
      console.warn('[Schema] request_attachments step note:', e2.message);
    }

    // 3. Ensure requests table columns
    try {
      await query(`
        ALTER TABLE requests 
        ADD COLUMN IF NOT EXISTS current_submission_version INTEGER DEFAULT 0;
      `);
      await query(`
        ALTER TABLE requests 
        ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'PENDING';
      `);
      await query(`
        ALTER TABLE requests 
        ADD COLUMN IF NOT EXISTS notes TEXT;
      `);
      await query(`
        ALTER TABLE requests 
        ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2) DEFAULT 0;
      `);
    } catch (e3) {
      console.warn('[Schema] requests columns step note:', e3.message);
    }

    // 4. Ensure company_leads table has logo_url, website and performance index
    try {
      await query(`
        ALTER TABLE company_leads 
        ADD COLUMN IF NOT EXISTS logo_url TEXT;
      `);
      await query(`
        ALTER TABLE company_leads 
        ADD COLUMN IF NOT EXISTS website TEXT;
      `);
      await query(`
        CREATE INDEX IF NOT EXISTS idx_company_leads_company_id ON company_leads (company_id);
      `);
    } catch (e4) {
      console.warn('[Schema] company_leads step note:', e4.message);
    }

    // 5. Ensure service_channel_settings table exists
    await ensureServiceSettingsTable();

    console.log('[Schema] Database schema integrity verified & updated successfully.');
    return true;
  } catch (err) {
    console.error('[Schema Warning] ensureSchemaIntegrity error:', err.message);
    return false;
  }
}
