import { query } from '../config/postgres.js';

const mapMessage = (row) => {
  if (!row) return null;

  return {
    _id: row.id,
    id: row.id,

    requestId: row.request_id,
    ticketId: row.ticket_id,
    ticketCode: row.ticket_code,

    senderId: row.sender_id,
    senderName: row.sender_name,
    senderRole: row.sender_role,

    text: row.text,

    attachments: row.attachments || [],

    readBy: row.read_by || [],

    isInternalNote: row.is_internal_note,

    createdAt: row.created_at,
    updatedAt: row.updated_at,

    sender: row.sender_email
      ? {
          _id: row.sender_id,
          name: row.sender_name,
          email: row.sender_email,
          role: row.sender_role,
        }
      : undefined,
  };
};

const messageSelect = `
  SELECT
    m.id,
    m.request_id,
    r.ticket_id,
    m.sender_id,
    m.sender_name,
    m.sender_role,
    m.text,
    m.is_internal_note,
    m.created_at,
    m.updated_at,

    u.email AS sender_email,

    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'name', ma.name,
            'url', ma.url,
            'size', ma.size
          )
          ORDER BY ma.created_at
        )
        FROM message_attachments ma
        WHERE ma.message_id = m.id
      ),
      '[]'::jsonb
    ) AS attachments,

    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'userId', mrb.user_id,
            'readAt', mrb.read_at
          )
          ORDER BY mrb.read_at
        )
        FROM message_read_by mrb
        WHERE mrb.message_id = m.id
      ),
      '[]'::jsonb
    ) AS read_by

  FROM messages m

  LEFT JOIN requests r
    ON r.id = m.request_id

  LEFT JOIN users u
    ON u.id = m.sender_id
`;

export const findMessageById = async (id) => {
  const result = await query(
    `
    ${messageSelect}
    WHERE m.id = $1
    LIMIT 1
    `,
    [id]
  );

  return mapMessage(result.rows[0]);
};

export const findMessagesByRequestId = async (
  requestId,
  {
    limit = 100,
    offset = 0,
  } = {}
) => {
  const result = await query(
    `
    ${messageSelect}
    WHERE m.request_id = $1
    ORDER BY m.created_at ASC
    LIMIT $2
    OFFSET $3
    `,
    [requestId, limit, offset]
  );

  return result.rows.map(mapMessage);
};

export const findMessagesByTicketId = async (
  ticketId,
  {
    limit = 100,
    offset = 0,
  } = {}
) => {
  const result = await query(
    `
    ${messageSelect}
    WHERE r.ticket_id = $1
    ORDER BY m.created_at ASC
    LIMIT $2
    OFFSET $3
    `,
    [ticketId, limit, offset]
  );

  return result.rows.map(mapMessage);
};

export const createMessage = async ({
  requestId,
  senderId,
  senderName,
  senderRole,
  text,
  isInternalNote = false,
  attachments = [],
}) => {
  if (!requestId) {
    throw new Error('requestId is required.');
  }

  if (!senderId) {
    throw new Error('senderId is required.');
  }

  if (!text || !String(text).trim()) {
    throw new Error('Message text is required.');
  }

  const result = await query(
    `
    INSERT INTO messages (
      request_id,
      sender_id,
      sender_name,
      sender_role,
      text,
      is_internal_note
    )
    VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6
    )
    RETURNING id
    `,
    [
      requestId,
      senderId,
      senderName,
      senderRole,
      String(text).trim(),
      Boolean(isInternalNote),
    ]
  );

  const messageId = result.rows[0].id;

  if (
    Array.isArray(attachments) &&
    attachments.length > 0
  ) {
    for (const attachment of attachments) {
      await addMessageAttachment(
        messageId,
        attachment
      );
    }
  }

  return findMessageById(messageId);
};

export const addMessageAttachment = async (
  messageId,
  {
    name,
    url,
    size = null,
  }
) => {
  const result = await query(
    `
    INSERT INTO message_attachments (
      message_id,
      name,
      url,
      size
    )
    VALUES (
      $1,
      $2,
      $3,
      $4
    )
    RETURNING
      id,
      name,
      url,
      size,
      created_at
    `,
    [
      messageId,
      name,
      url,
      size,
    ]
  );

  return result.rows[0];
};

export const getMessageAttachments = async (
  messageId
) => {
  const result = await query(
    `
    SELECT
      id,
      name,
      url,
      size,
      created_at
    FROM message_attachments
    WHERE message_id = $1
    ORDER BY created_at ASC
    `,
    [messageId]
  );

  return result.rows;
};

export const markMessageRead = async (
  messageId,
  userId
) => {
  const result = await query(
    `
    INSERT INTO message_read_by (
      message_id,
      user_id,
      read_at
    )
    VALUES (
      $1,
      $2,
      NOW()
    )
    ON CONFLICT (
      message_id,
      user_id
    )
    DO UPDATE SET
      read_at = NOW()
    RETURNING
      message_id,
      user_id,
      read_at
    `,
    [
      messageId,
      userId,
    ]
  );

  return result.rows[0];
};

export const markRequestMessagesRead = async (
  requestId,
  userId
) => {
  const result = await query(
    `
    INSERT INTO message_read_by (
      message_id,
      user_id,
      read_at
    )
    SELECT
      m.id,
      $2,
      NOW()
    FROM messages m
    WHERE m.request_id = $1

    ON CONFLICT (
      message_id,
      user_id
    )
    DO UPDATE SET
      read_at = NOW()

    RETURNING
      message_id,
      user_id,
      read_at
    `,
    [
      requestId,
      userId,
    ]
  );

  return result.rows;
};

export const getUnreadMessagesForUser = async (
  requestId,
  userId
) => {
  const result = await query(
    `
    SELECT
      COUNT(*)::int AS count
    FROM messages m
    WHERE m.request_id = $1
      AND m.sender_id <> $2
      AND NOT EXISTS (
        SELECT 1
        FROM message_read_by mrb
        WHERE mrb.message_id = m.id
          AND mrb.user_id = $2
      )
    `,
    [
      requestId,
      userId,
    ]
  );

  return result.rows[0].count;
};

export const getUnreadMessageCountForUser = async (
  userId
) => {
  const result = await query(
    `
    SELECT
      COUNT(*)::int AS count
    FROM messages m

    INNER JOIN requests r
      ON r.id = m.request_id

    WHERE m.sender_id <> $1
      AND NOT EXISTS (
        SELECT 1
        FROM message_read_by mrb
        WHERE mrb.message_id = m.id
          AND mrb.user_id = $1
      )
    `,
    [userId]
  );

  return result.rows[0].count;
};

export const countMessagesByRequest = async (
  requestId
) => {
  const result = await query(
    `
    SELECT COUNT(*)::int AS count
    FROM messages
    WHERE request_id = $1
    `,
    [requestId]
  );

  return result.rows[0].count;
};

export const updateMessage = async (
  id,
  updates = {}
) => {
  const allowedFields = {
    text: 'text',
    isInternalNote: 'is_internal_note',
  };

  const setClauses = [];
  const values = [];

  for (const [key, value] of Object.entries(updates)) {
    const column = allowedFields[key];

    if (!column) continue;

    values.push(
      key === 'text'
        ? String(value).trim()
        : value
    );

    setClauses.push(
      `${column} = $${values.length}`
    );
  }

  if (!setClauses.length) {
    return findMessageById(id);
  }

  values.push(id);

  const result = await query(
    `
    UPDATE messages
    SET ${setClauses.join(', ')}
    WHERE id = $${values.length}
    RETURNING id
    `,
    values
  );

  if (!result.rowCount) {
    return null;
  }

  return findMessageById(id);
};

export const deleteMessage = async (id) => {
  const result = await query(
    `
    DELETE FROM messages
    WHERE id = $1
    RETURNING id
    `,
    [id]
  );

  return result.rowCount > 0;
};

export default {
  findMessageById,
  findMessagesByRequestId,
  findMessagesByTicketId,
  createMessage,
  addMessageAttachment,
  getMessageAttachments,
  markMessageRead,
  markRequestMessagesRead,
  getUnreadMessagesForUser,
  getUnreadMessageCountForUser,
  countMessagesByRequest,
  updateMessage,
  deleteMessage,
};
