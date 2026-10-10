import { query } from './postgres.js';

/**
 * Self-healing schema migration to ensure all required tables and columns exist
 * across all database environments (Dev, Test, Staging, Production).
 */
export async function ensureSchemaIntegrity() {
  try {
    // 1. Ensure request_deliverables has created_at and delivered_at columns
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

    // 2. Ensure request_attachments has created_at column
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

    // 3. Ensure requests table columns
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

    // 4. Ensure company_leads table has logo_url, website and performance index
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

    console.log('[Schema] Database schema integrity verified & updated successfully.');
    return true;
  } catch (err) {
    console.error('[Schema Warning] ensureSchemaIntegrity error:', err.message);
    return false;
  }
}
