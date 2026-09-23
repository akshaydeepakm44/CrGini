import { query, connectPostgres } from '../src/config/postgres.js';

export const migratePasswordResetTable = async () => {
  console.log('[Migration] Checking / Creating password_reset_tokens table in PostgreSQL...');
  
  await query(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash VARCHAR(64) NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id
    ON password_reset_tokens(user_id);
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token_hash
    ON password_reset_tokens(token_hash);
  `);

  console.log('[Migration] password_reset_tokens table and indexes verified successfully.');
};

if (process.argv[1]?.endsWith('migrate-password-reset.js')) {
  try {
    await connectPostgres();
    await migratePasswordResetTable();
    process.exit(0);
  } catch (err) {
    console.error('[Migration Error]:', err);
    process.exit(1);
  }
}
