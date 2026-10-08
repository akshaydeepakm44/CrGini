import { query } from '../config/postgres.js';

const mapRequest = (row) => {
  if (!row) return null;

  const companyObj = row.company_name
    ? {
        _id: row.company_id,
        id: row.company_id,
        name: row.company_name,
        email: row.company_email,
        website: row.company_website,
        toString() { return String(row.company_id); },
      }
    : null;

  const userObj = row.user_name
    ? {
        _id: row.user_id,
        id: row.user_id,
        name: row.user_name,
        email: row.user_email,
        toString() { return String(row.user_id); },
      }
    : null;

  const assignedUserObj = row.assigned_user_name
    ? {
        _id: row.assigned_to,
        id: row.assigned_to,
        name: row.assigned_user_name,
        email: row.assigned_user_email,
        role: row.assigned_user_role,
        toString() { return String(row.assigned_to); },
      }
    : null;

  return {
    _id: row.id,
    id: row.id,
    ticketId: row.ticket_id,
    userId: userObj || row.user_id,
    companyId: companyObj || row.company_id,
    serviceType: row.service_type,
    title: row.title,
    description: row.description,
    priority: row.priority,
    status: row.status,
    price: Number(row.price),
    paymentStatus: row.payment_status,
    assignedTeam: row.assigned_team,
    assignedTo: assignedUserObj || row.assigned_to,
    dueDate: row.due_date,
    currentSubmissionVersion: row.current_submission_version,
    approvedAt: row.approved_at,
    approvedBy: row.approved_by,
    completedAt: row.completed_at,

    adminOverride: {
      isOverridden: row.admin_override,
      reason: row.admin_override_reason,
      overriddenBy: row.admin_overridden_by,
      overriddenAt: row.admin_overridden_at,
    },

    attachments: row.attachments || [],
    deliverables: row.deliverables || [],
    notes: row.notes,

    createdAt: row.created_at,
    updatedAt: row.updated_at,

    user: userObj || undefined
      ? {
          _id: row.user_id,
          name: row.user_name,
          email: row.user_email,
        }
      : undefined,

    company: row.company_name
      ? {
          _id: row.company_id,
          name: row.company_name,
          email: row.company_email,
          website: row.company_website,
        }
      : undefined,

    assignedUser: row.assigned_user_name
      ? {
          _id: row.assigned_to,
          name: row.assigned_user_name,
          email: row.assigned_user_email,
          role: row.assigned_user_role,
        }
      : undefined,

    messageCount: Number(row.message_count || 0),
    latestMessage: row.latest_message || null,
  };
};

const requestSelect = `
  SELECT
    r.id,
    r.ticket_id,
    r.user_id,
    r.company_id,
    r.service_type,
    r.title,
    r.description,
    r.priority,
    r.status,
    r.price,
    r.payment_status,
    r.assigned_team,
    r.assigned_to,
    r.due_date,
    r.current_submission_version,
    r.approved_at,
    r.approved_by,
    r.completed_at,

    FALSE AS admin_override,
    NULL::text AS admin_override_reason,
    NULL::integer AS admin_overridden_by,
    NULL::timestamptz AS admin_overridden_at,

    r.notes,
    r.created_at,
    r.updated_at,

    u.name AS user_name,
    u.email AS user_email,

    c.name AS company_name,
    c.email AS company_email,
    c.website AS company_website,

    au.name AS assigned_user_name,
    au.email AS assigned_user_email,
    au.role AS assigned_user_role,

    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'name', ra.name,
            'url', ra.url,
            'size', ra.size,
            'type', ra.type
          )
          ORDER BY ra.created_at
        )
        FROM request_attachments ra
        WHERE ra.request_id = r.id
      ),
      '[]'::jsonb
    ) AS attachments,

    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'title', rd.title,
            'url', rd.url,
            'description', rd.description,
            'deliveredAt', rd.delivered_at
          )
          ORDER BY rd.delivered_at
        )
        FROM request_deliverables rd
        WHERE rd.request_id = r.id
      ),
      '[]'::jsonb
    ) AS deliverables,

    COALESCE(
      (
        SELECT COUNT(*)::integer
        FROM messages m
        WHERE m.request_id = r.id
      ),
      0
    ) AS message_count,

    (
      SELECT jsonb_build_object(
        'id', lm.id,
        'senderId', lm.sender_id,
        'senderName', lm.sender_name,
        'senderRole', lm.sender_role,
        'text', lm.text,
        'createdAt', lm.created_at
      )
      FROM messages lm
      WHERE lm.request_id = r.id
      ORDER BY lm.created_at DESC
      LIMIT 1
    ) AS latest_message

  FROM requests r
  LEFT JOIN users u
    ON u.id = r.user_id
  LEFT JOIN companies c
    ON c.id = r.company_id
  LEFT JOIN users au
    ON au.id = r.assigned_to
`;

export const findRequestById = async (id) => {
  const result = await query(
    `
    ${requestSelect}
    WHERE r.id = $1
    LIMIT 1
    `,
    [id]
  );

  return mapRequest(result.rows[0]);
};

export const findRequestByTicketId = async (ticketId) => {
  const result = await query(
    `
    ${requestSelect}
    WHERE r.ticket_id = $1
    LIMIT 1
    `,
    [ticketId]
  );

  return mapRequest(result.rows[0]);
};

export const findRequestsByUserId = async (
  userId,
  {
    limit = 100,
    offset = 0,
  } = {}
) => {
  const result = await query(
    `
    ${requestSelect}
    WHERE r.user_id = $1
    ORDER BY r.created_at DESC
    LIMIT $2
    OFFSET $3
    `,
    [userId, limit, offset]
  );

  return result.rows.map(mapRequest);
};

export const findRequestsByCompanyId = async (
  companyId,
  {
    limit = 100,
    offset = 0,
  } = {}
) => {
  const result = await query(
    `
    ${requestSelect}
    WHERE r.company_id = $1
    ORDER BY r.created_at DESC
    LIMIT $2
    OFFSET $3
    `,
    [companyId, limit, offset]
  );

  return result.rows.map(mapRequest);
};

export const findRequestsByServiceType = async (
  serviceType,
  {
    limit = 100,
    offset = 0,
  } = {}
) => {
  const result = await query(
    `
    ${requestSelect}
    WHERE r.service_type = $1
    ORDER BY r.created_at DESC
    LIMIT $2
    OFFSET $3
    `,
    [serviceType, limit, offset]
  );

  return result.rows.map(mapRequest);
};

export const findRequestsByAssignee = async (
  assignedTo,
  {
    limit = 100,
    offset = 0,
  } = {}
) => {
  const result = await query(
    `
    ${requestSelect}
    WHERE r.assigned_to = $1
    ORDER BY r.created_at DESC
    LIMIT $2
    OFFSET $3
    `,
    [assignedTo, limit, offset]
  );

  return result.rows.map(mapRequest);
};

export const findRequestsByStatus = async (
  status,
  {
    limit = 100,
    offset = 0,
  } = {}
) => {
  const result = await query(
    `
    ${requestSelect}
    WHERE r.status = $1
    ORDER BY r.created_at DESC
    LIMIT $2
    OFFSET $3
    `,
    [status, limit, offset]
  );

  return result.rows.map(mapRequest);
};

export const listRequests = async ({
  userId = null,
  companyId = null,
  serviceType = null,
  serviceTypes = null,
  status = null,
  limit = 100,
  offset = 0,
} = {}) => {
  const conditions = [];
  const values = [];

  if (userId) {
    values.push(userId);
    conditions.push(`r.user_id = $${values.length}`);
  }

  if (companyId) {
    values.push(companyId);
    conditions.push(`r.company_id = $${values.length}`);
  }

  if (serviceType) {
    values.push(serviceType);
    conditions.push(`r.service_type = $${values.length}`);
  }

  if (Array.isArray(serviceTypes) && serviceTypes.length > 0) {
    values.push(serviceTypes);
    conditions.push(`r.service_type = ANY($${values.length})`);
  }

  if (status) {
    values.push(status);
    conditions.push(`r.status = $${values.length}`);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(' AND ')}`
    : '';

  values.push(limit);
  const limitParam = `${values.length}`;
  values.push(offset);
  const offsetParam = `${values.length}`;

  const result = await query(
    `
    ${requestSelect}
    ${whereClause}
    ORDER BY r.created_at DESC
    LIMIT $${limitParam}
    OFFSET $${offsetParam}
    `,
    values
  );

  return result.rows.map(mapRequest);
};

export const countRequests = async ({
  userId = null,
  companyId = null,
  serviceType = null,
  status = null,
} = {}) => {
  const conditions = [];
  const values = [];

  if (userId) {
    values.push(userId);
    conditions.push(`user_id = $${values.length}`);
  }

  if (companyId) {
    values.push(companyId);
    conditions.push(`company_id = $${values.length}`);
  }

  if (serviceType) {
    values.push(serviceType);
    conditions.push(`service_type = $${values.length}`);
  }

  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(' AND ')}`
    : '';

  const result = await query(
    `
    SELECT COUNT(*)::int AS count
    FROM requests
    ${whereClause}
    `,
    values
  );

  return result.rows[0].count;
};

export const createRequest = async ({
  ticketId,
  userId,
  companyId,
  serviceType,
  title,
  description,
  priority = 'MEDIUM',
  status = 'REQUEST_CREATED',
  price = 299,
  paymentStatus = 'PENDING',
  assignedTeam = 'CreativeGini Core Team',
  assignedTo = null,
  dueDate = null,
  notes = null,
}) => {
  const result = await query(
    `
    INSERT INTO requests (
      ticket_id,
      user_id,
      company_id,
      service_type,
      title,
      description,
      priority,
      status,
      price,
      payment_status,
      assigned_team,
      assigned_to,
      due_date,
      notes
    )
    VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7,
      $8,
      $9,
      $10,
      $11,
      $12,
      $13,
      $14
    )
    RETURNING id
    `,
    [
      ticketId,
      userId,
      companyId,
      serviceType,
      title,
      description,
      priority,
      status,
      price,
      paymentStatus,
      assignedTeam,
      assignedTo,
      dueDate,
      notes,
    ]
  );

  return findRequestById(result.rows[0].id);
};

export const updateRequest = async (
  id,
  updates = {}
) => {
  const allowedFields = {
    ticketId: 'ticket_id',
    userId: 'user_id',
    companyId: 'company_id',
    serviceType: 'service_type',
    title: 'title',
    description: 'description',
    priority: 'priority',
    status: 'status',
    price: 'price',
    paymentStatus: 'payment_status',
    assignedTeam: 'assigned_team',
    assignedTo: 'assigned_to',
    dueDate: 'due_date',
    currentSubmissionVersion:
      'current_submission_version',
    approvedAt: 'approved_at',
    approvedBy: 'approved_by',
    completedAt: 'completed_at',
    notes: 'notes',
  };

  const setClauses = [];
  const values = [];

  for (const [key, value] of Object.entries(updates)) {
    const column = allowedFields[key];

    if (!column) continue;

    values.push(value);
    setClauses.push(`${column} = $${values.length}`);
  }

  if (setClauses.length === 0) {
    return findRequestById(id);
  }

  values.push(id);

  await query(
    `
    UPDATE requests
    SET ${setClauses.join(', ')}
    WHERE id = $${values.length}
    `,
    values
  );

  return findRequestById(id);
};

export const updateRequestStatus = async (
  id,
  status
) => {
  const result = await query(
    `
    UPDATE requests
    SET status = $1
    WHERE id = $2
    RETURNING id
    `,
    [status, id]
  );

  if (!result.rowCount) {
    return null;
  }

  return findRequestById(id);
};

export const assignRequest = async (
  id,
  assignedTo,
  assignedTeam
) => {
  const result = await query(
    `
    UPDATE requests
    SET
      assigned_to = $1,
      assigned_team = $2,
      status = CASE
        WHEN status = 'REQUEST_CREATED'
          THEN 'ASSIGNED'
        WHEN status = 'PAYMENT_COMPLETED'
          THEN 'ASSIGNED'
        ELSE status
      END
    WHERE id = $3
    RETURNING id
    `,
    [
      assignedTo,
      assignedTeam,
      id,
    ]
  );

  if (!result.rowCount) {
    return null;
  }

  return findRequestById(id);
};

export const markPaymentCompleted = async (
  id
) => {
  const result = await query(
    `
    UPDATE requests
    SET
      payment_status = 'PAID',
      status = CASE
        WHEN status = 'REQUEST_CREATED'
          THEN 'PAYMENT_COMPLETED'
        ELSE status
      END
    WHERE id = $1
    RETURNING id
    `,
    [id]
  );

  if (!result.rowCount) {
    return null;
  }

  return findRequestById(id);
};

export const markWorkSubmitted = async (
  id,
  version
) => {
  const result = await query(
    `
    UPDATE requests
    SET
      current_submission_version = $1,
      status = 'CLIENT_REVIEW'
    WHERE id = $2
    RETURNING id
    `,
    [version, id]
  );

  if (!result.rowCount) {
    return null;
  }

  return findRequestById(id);
};

export const requestChanges = async (
  id
) => {
  const result = await query(
    `
    UPDATE requests
    SET status = 'CHANGES_REQUESTED'
    WHERE id = $1
    RETURNING id
    `,
    [id]
  );

  if (!result.rowCount) {
    return null;
  }

  return findRequestById(id);
};

export const resubmitRequest = async (
  id,
  version
) => {
  const result = await query(
    `
    UPDATE requests
    SET
      current_submission_version = $1,
      status = 'CLIENT_REVIEW'
    WHERE id = $2
    RETURNING id
    `,
    [version, id]
  );

  if (!result.rowCount) {
    return null;
  }

  return findRequestById(id);
};

export const approveRequest = async (
  id,
  approvedBy
) => {
  const result = await query(
    `
    UPDATE requests
    SET
      status = 'APPROVED',
      approved_at = NOW(),
      approved_by = $1
    WHERE id = $2
    RETURNING id
    `,
    [approvedBy, id]
  );

  if (!result.rowCount) {
    return null;
  }

  return findRequestById(id);
};

export const completeRequest = async (
  id
) => {
  const result = await query(
    `
    UPDATE requests
    SET
      status = 'COMPLETED',
      completed_at = NOW()
    WHERE id = $1
    RETURNING id
    `,
    [id]
  );

  if (!result.rowCount) {
    return null;
  }

  return findRequestById(id);
};

export const adminOverrideComplete = async (
  id,
  reason,
  overriddenBy
) => {
  const result = await query(
    `
    UPDATE requests
    SET
      status = 'COMPLETED',
      completed_at = NOW(),
      admin_override_is_overridden = true,
      admin_override_reason = $1,
      admin_override_by = $2,
      admin_override_at = NOW()
    WHERE id = $3
    RETURNING id
    `,
    [
      reason,
      overriddenBy,
      id,
    ]
  );

  if (!result.rowCount) {
    return null;
  }

  return findRequestById(id);
};

export const addAttachment = async (
  requestId,
  {
    name,
    url,
    size = null,
    type = null,
  }
) => {
  const result = await query(
    `
    INSERT INTO request_attachments (
      request_id,
      name,
      url,
      size,
      type
    )
    VALUES (
      $1,
      $2,
      $3,
      $4,
      $5
    )
    RETURNING
      id,
      name,
      url,
      size,
      type,
      created_at
    `,
    [
      requestId,
      name,
      url,
      size,
      type,
    ]
  );

  return result.rows[0];
};

export const addDeliverable = async (
  requestId,
  {
    title,
    url,
    description = null,
  }
) => {
  const result = await query(
    `
    INSERT INTO request_deliverables (
      request_id,
      title,
      url,
      description
    )
    VALUES (
      $1,
      $2,
      $3,
      $4
    )
    RETURNING
      id,
      title,
      url,
      description,
      created_at AS delivered_at
    `,
    [
      requestId,
      title,
      url,
      description,
    ]
  );

  return result.rows[0];
};

export const getAttachments = async (
  requestId
) => {
  const result = await query(
    `
    SELECT
      id,
      name,
      url,
      size,
      type,
      created_at
    FROM request_attachments
    WHERE request_id = $1
    ORDER BY created_at ASC
    `,
    [requestId]
  );

  return result.rows;
};

export const getDeliverables = async (
  requestId
) => {
  const result = await query(
    `
    SELECT
      id,
      title,
      url,
      description,
      created_at AS delivered_at
    FROM request_deliverables
    WHERE request_id = $1
    ORDER BY created_at ASC
    `,
    [requestId]
  );

  return result.rows;
};

export const deleteRequest = async (id) => {
  const result = await query(
    `
    DELETE FROM requests
    WHERE id = $1
    RETURNING id
    `,
    [id]
  );

  return result.rowCount > 0;
};

export default {
  findRequestById,
  findRequestByTicketId,
  findRequestsByUserId,
  findRequestsByCompanyId,
  findRequestsByServiceType,
  findRequestsByAssignee,
  findRequestsByStatus,
  listRequests,
  countRequests,
  createRequest,
  updateRequest,
  updateRequestStatus,
  assignRequest,
  markPaymentCompleted,
  markWorkSubmitted,
  requestChanges,
  resubmitRequest,
  approveRequest,
  completeRequest,
  adminOverrideComplete,
  addAttachment,
  addDeliverable,
  getAttachments,
  getDeliverables,
  deleteRequest,
};
