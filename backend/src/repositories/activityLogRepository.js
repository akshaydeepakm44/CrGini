import { query } from '../config/postgres.js';

const mapActivityLog = (row) => {
  if (!row) return null;

  return {
    _id: row.id,
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    companyId: row.company_id,
    requestId: row.request_id,
    action: row.action,
    details: row.details,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export const createActivityLog = async ({
  userId = null,
  userName = 'System',
  companyId = null,
  requestId = null,
  action,
  details = '',
}) => {
  const result = await query(
    `
      INSERT INTO activity_logs (
        user_id,
        user_name,
        company_id,
        request_id,
        action,
        details
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
    [
      userId,
      userName || 'System',
      companyId,
      requestId,
      action,
      details,
    ]
  );

  return mapActivityLog(result.rows[0]);
};

export const findActivityLogsByUserId = async (userId) => {
  const result = await query(
    `
      SELECT *
      FROM activity_logs
      WHERE user_id = $1
      ORDER BY created_at DESC
    `,
    [userId]
  );

  return result.rows.map(mapActivityLog);
};

export const findActivityLogsByCompanyId = async (companyId) => {
  const result = await query(
    `
      SELECT *
      FROM activity_logs
      WHERE company_id = $1
      ORDER BY created_at DESC
    `,
    [companyId]
  );

  return result.rows.map(mapActivityLog);
};

export const findActivityLogsByRequestId = async (requestId) => {
  const result = await query(
    `
      SELECT *
      FROM activity_logs
      WHERE request_id = $1
      ORDER BY created_at ASC
    `,
    [requestId]
  );

  return result.rows.map(mapActivityLog);
};

export const listActivityLogs = async ({
  limit = 100,
  offset = 0,
} = {}) => {
  const result = await query(
    `
      SELECT *
      FROM activity_logs
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `,
    [limit, offset]
  );

  return result.rows.map(mapActivityLog);
};

export const countActivityLogs = async () => {
  const result = await query(
    `
      SELECT COUNT(*)::int AS count
      FROM activity_logs
    `
  );

  return result.rows[0].count;
};

export const deleteActivityLog = async (id) => {
  const result = await query(
    `
      DELETE FROM activity_logs
      WHERE id = $1
      RETURNING id
    `,
    [id]
  );

  return result.rowCount > 0;
};
