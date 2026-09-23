import { query } from '../config/postgres.js';

/**
 * Maps a database row from password_reset_tokens into a structured JS object.
 */
const mapToken = (row) => {
  if (!row) return null;

  return {
    id: row.id,
    userId: row.user_id,
    tokenHash: row.token_hash,
    expiresAt: row.expires_at,
    usedAt: row.used_at,
    createdAt: row.created_at,
  };
};

/**
 * Persist a newly generated hashed password reset token.
 *
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} params.tokenHash
 * @param {Date} params.expiresAt
 * @returns {Promise<Object>} The persisted token record
 */
export const createResetToken = async ({ userId, tokenHash, expiresAt }) => {
  const result = await query(
    `
    INSERT INTO password_reset_tokens (
      user_id,
      token_hash,
      expires_at
    )
    VALUES ($1, $2, $3)
    RETURNING
      id,
      user_id,
      token_hash,
      expires_at,
      used_at,
      created_at
    `,
    [userId, tokenHash, expiresAt]
  );

  return mapToken(result.rows[0]);
};

/**
 * Find an active (unused and unexpired) password reset token by its SHA-256 hash.
 * Joins against the users table to ensure the associated user exists and is not deleted.
 *
 * @param {string} tokenHash
 * @returns {Promise<Object|null>}
 */
export const findActiveTokenByHash = async (tokenHash) => {
  const result = await query(
    `
    SELECT
      prt.id,
      prt.user_id,
      prt.token_hash,
      prt.expires_at,
      prt.used_at,
      prt.created_at,
      u.id AS user_account_id,
      u.name AS user_name,
      u.email AS user_email,
      u.status AS user_status,
      u.is_deleted AS user_is_deleted
    FROM password_reset_tokens prt
    INNER JOIN users u ON u.id = prt.user_id
    WHERE prt.token_hash = $1
      AND prt.used_at IS NULL
      AND prt.expires_at > NOW()
      AND u.is_deleted = false
    LIMIT 1
    `,
    [tokenHash]
  );

  if (!result.rows[0]) {
    return null;
  }

  const row = result.rows[0];
  const token = mapToken(row);
  token.user = {
    id: row.user_account_id,
    name: row.user_name,
    email: row.user_email,
    status: row.user_status,
    isDeleted: row.user_is_deleted,
  };

  return token;
};

/**
 * Mark a specific password reset token as used.
 *
 * @param {string} tokenId
 * @returns {Promise<Object|null>}
 */
export const markTokenAsUsed = async (tokenId) => {
  const result = await query(
    `
    UPDATE password_reset_tokens
    SET used_at = NOW()
    WHERE id = $1
    RETURNING
      id,
      user_id,
      token_hash,
      expires_at,
      used_at,
      created_at
    `,
    [tokenId]
  );

  return mapToken(result.rows[0]);
};

/**
 * Invalidate all currently active (unused) reset tokens for a user.
 * Called when a new reset request is generated, or when password reset completes.
 *
 * @param {string} userId
 * @param {string} [excludeTokenId] Optional token ID to preserve (if marking it used separately)
 * @returns {Promise<number>} Count of invalidated tokens
 */
export const invalidateUserTokens = async (userId, excludeTokenId = null) => {
  let sql = `
    UPDATE password_reset_tokens
    SET used_at = NOW()
    WHERE user_id = $1
      AND used_at IS NULL
  `;
  const params = [userId];

  if (excludeTokenId) {
    sql += ` AND id != $2`;
    params.push(excludeTokenId);
  }

  const result = await query(sql, params);
  return result.rowCount || 0;
};
