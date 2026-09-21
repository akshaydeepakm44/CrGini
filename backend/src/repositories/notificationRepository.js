import { query } from '../config/postgres.js';

const mapNotification = (row) => {
  if (!row) return null;

  return {
    _id: row.id,
    id: row.id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    message: row.message,
    ticketId: row.ticket_id,
    ticketCode: row.ticket_code,
    submissionId: row.submission_id,
    isRead: row.is_read,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export const createNotification = async ({
  userId,
  type,
  title,
  message,
  ticketId = null,
  ticketCode = null,
  submissionId = null,
  isRead = false,
}) => {
  const result = await query(
    `
      INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        ticket_id,
        ticket_code,
        submission_id,
        is_read
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `,
    [
      userId,
      type,
      title,
      message,
      ticketId,
      ticketCode,
      submissionId,
      isRead,
    ]
  );

  return mapNotification(result.rows[0]);
};

export const findNotificationById = async (id) => {
  const result = await query(
    `
      SELECT *
      FROM notifications
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  );

  return mapNotification(result.rows[0]);
};

export const findNotificationsByUserId = async (
  userId,
  { limit = 100, offset = 0 } = {}
) => {
  const result = await query(
    `
      SELECT *
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `,
    [userId, limit, offset]
  );

  return result.rows.map(mapNotification);
};

export const getUnreadNotificationsByUserId = async (userId) => {
  const result = await query(
    `
      SELECT *
      FROM notifications
      WHERE user_id = $1
        AND is_read = FALSE
      ORDER BY created_at DESC
    `,
    [userId]
  );

  return result.rows.map(mapNotification);
};

export const getUnreadNotificationCount = async (userId) => {
  const result = await query(
    `
      SELECT COUNT(*)::int AS count
      FROM notifications
      WHERE user_id = $1
        AND is_read = FALSE
    `,
    [userId]
  );

  return result.rows[0].count;
};

export const markNotificationAsRead = async (id, userId = null) => {
  const conditions = userId
    ? `WHERE id = $1 AND user_id = $2`
    : `WHERE id = $1`;

  const params = userId ? [id, userId] : [id];

  const result = await query(
    `
      UPDATE notifications
      SET is_read = TRUE,
          updated_at = NOW()
      ${conditions}
      RETURNING *
    `,
    params
  );

  return mapNotification(result.rows[0]);
};

export const markAllNotificationsAsRead = async (userId) => {
  const result = await query(
    `
      UPDATE notifications
      SET is_read = TRUE,
          updated_at = NOW()
      WHERE user_id = $1
        AND is_read = FALSE
      RETURNING *
    `,
    [userId]
  );

  return result.rows.map(mapNotification);
};

export const deleteNotification = async (id, userId = null) => {
  const conditions = userId
    ? `WHERE id = $1 AND user_id = $2`
    : `WHERE id = $1`;

  const params = userId ? [id, userId] : [id];

  const result = await query(
    `
      DELETE FROM notifications
      ${conditions}
      RETURNING id
    `,
    params
  );

  return result.rowCount > 0;
};

export const countNotificationsByUserId = async (userId) => {
  const result = await query(
    `
      SELECT COUNT(*)::int AS count
      FROM notifications
      WHERE user_id = $1
    `,
    [userId]
  );

  return result.rows[0].count;
};
