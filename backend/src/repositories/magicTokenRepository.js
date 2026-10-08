import { query } from '../config/postgres.js';

let tableEnsured = false;
async function ensureMagicTable() {
  if (tableEnsured) return;
  await query(`
    CREATE TABLE IF NOT EXISTS magic_login_tokens (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash VARCHAR(255) NOT NULL UNIQUE,
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      used_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_magic_tokens_hash ON magic_login_tokens(token_hash);
  `);
  tableEnsured = true;
}

export const createMagicToken = async ({ userId, tokenHash, expiresAt }) => {
  await ensureMagicTable();
  const res = await query(`
    INSERT INTO magic_login_tokens (user_id, token_hash, expires_at)
    VALUES ($1, $2, $3)
    RETURNING id, user_id, token_hash, expires_at, used_at, created_at
  `, [userId, tokenHash, expiresAt]);
  return res.rows[0];
};

export const findActiveMagicTokenByHash = async (tokenHash) => {
  await ensureMagicTable();
  const res = await query(`
    SELECT
      m.id,
      m.user_id,
      m.token_hash,
      m.expires_at,
      m.used_at,
      m.created_at,
      u.id AS user_id,
      u.name AS user_name,
      u.email AS user_email,
      u.role AS user_role,
      u.status AS user_status,
      u.company_id,
      u.company_lead,
      u.company_boost,
      u.company_ui
    FROM magic_login_tokens m
    JOIN users u ON u.id = m.user_id
    WHERE m.token_hash = $1
      AND m.used_at IS NULL
      AND m.expires_at > NOW()
      AND u.is_deleted = false
      AND u.status = 'ACTIVE'
    LIMIT 1
  `, [tokenHash]);

  if (!res.rows[0]) return null;
  const row = res.rows[0];
  return {
    id: row.id,
    userId: row.user_id,
    tokenHash: row.token_hash,
    expiresAt: row.expires_at,
    usedAt: row.used_at,
    createdAt: row.created_at,
    user: {
      id: row.user_id,
      _id: row.user_id,
      name: row.user_name,
      email: row.user_email,
      role: row.user_role,
      status: row.user_status,
      companyId: row.company_id,
      companyLead: row.company_lead,
      companyBoost: row.company_boost,
      companyUI: row.company_ui,
    }
  };
};

export const markMagicTokenAsUsed = async (tokenId) => {
  await ensureMagicTable();
  const res = await query(`
    UPDATE magic_login_tokens
    SET used_at = NOW()
    WHERE id = $1
    RETURNING id, used_at
  `, [tokenId]);
  return res.rows[0];
};
