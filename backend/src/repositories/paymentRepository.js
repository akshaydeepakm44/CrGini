import { query } from '../config/postgres.js';

const mapPayment = (row) => {
  if (!row) return null;

  return {
    _id: row.id,
    id: row.id,

    invoiceNumber: row.invoice_number,
    requestId: row.request_id,
    userId: row.user_id,
    companyId: row.company_id,

    amount: Number(row.amount),
    currency: row.currency,

    status: row.status,
    paymentMethod: row.payment_method,
    transactionId: row.transaction_id,
    paidAt: row.paid_at,

    createdAt: row.created_at,
    updatedAt: row.updated_at,

    user: row.user_name
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
        }
      : undefined,

    request: row.ticket_id
      ? {
          _id: row.request_id,
          ticketId: row.ticket_id,
          title: row.request_title,
          serviceType: row.service_type,
          status: row.request_status,
        }
      : undefined,
  };
};

const paymentSelect = `
  SELECT
    p.id,
    p.invoice_number,
    p.request_id,
    p.user_id,
    p.company_id,
    p.amount,
    p.currency,
    p.status,
    p.payment_method,
    p.transaction_id,
    p.paid_at,
    p.created_at,
    p.updated_at,

    u.name AS user_name,
    u.email AS user_email,

    c.name AS company_name,
    c.email AS company_email,

    r.ticket_id,
    r.title AS request_title,
    r.service_type,
    r.status AS request_status

  FROM payments p

  LEFT JOIN users u
    ON u.id = p.user_id

  LEFT JOIN companies c
    ON c.id = p.company_id

  LEFT JOIN requests r
    ON r.id = p.request_id
`;

export const findPaymentById = async (id) => {
  const result = await query(
    `
    ${paymentSelect}
    WHERE p.id = $1
    LIMIT 1
    `,
    [id]
  );

  return mapPayment(result.rows[0]);
};

export const findPaymentByInvoice = async (
  invoiceNumber
) => {
  const result = await query(
    `
    ${paymentSelect}
    WHERE p.invoice_number = $1
    LIMIT 1
    `,
    [invoiceNumber]
  );

  return mapPayment(result.rows[0]);
};

export const findPaymentByRequestId = async (
  requestId
) => {
  const result = await query(
    `
    ${paymentSelect}
    WHERE p.request_id = $1
    ORDER BY p.created_at DESC
    LIMIT 1
    `,
    [requestId]
  );

  return mapPayment(result.rows[0]);
};

export const findPaymentsByUserId = async (
  userId,
  {
    limit = 100,
    offset = 0,
  } = {}
) => {
  const result = await query(
    `
    ${paymentSelect}
    WHERE p.user_id = $1
    ORDER BY p.created_at DESC
    LIMIT $2
    OFFSET $3
    `,
    [userId, limit, offset]
  );

  return result.rows.map(mapPayment);
};

export const findPaymentsByCompanyId = async (
  companyId,
  {
    limit = 100,
    offset = 0,
  } = {}
) => {
  const result = await query(
    `
    ${paymentSelect}
    WHERE p.company_id = $1
    ORDER BY p.created_at DESC
    LIMIT $2
    OFFSET $3
    `,
    [companyId, limit, offset]
  );

  return result.rows.map(mapPayment);
};

export const listPayments = async ({
  limit = 100,
  offset = 0,
} = {}) => {
  const result = await query(
    `
    ${paymentSelect}
    ORDER BY p.created_at DESC
    LIMIT $1
    OFFSET $2
    `,
    [limit, offset]
  );

  return result.rows.map(mapPayment);
};

export const createPayment = async ({
  invoiceNumber,
  requestId,
  userId,
  companyId,
  amount,
  currency = 'USD',
  status = 'PENDING',
  paymentMethod = 'Stripe Credit / Debit Card',
  transactionId = null,
  paidAt = null,
}) => {
  const result = await query(
    `
    INSERT INTO payments (
      invoice_number,
      request_id,
      user_id,
      company_id,
      amount,
      currency,
      status,
      payment_method,
      transaction_id,
      paid_at
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
      $10
    )
    RETURNING id
    `,
    [
      invoiceNumber,
      requestId,
      userId,
      companyId,
      amount,
      currency,
      status,
      paymentMethod,
      transactionId,
      paidAt,
    ]
  );

  return findPaymentById(result.rows[0].id);
};

export const markPaymentPaid = async (
  id,
  transactionId = null
) => {
  const result = await query(
    `
    UPDATE payments
    SET
      status = 'PAID',
      transaction_id = COALESCE($1, transaction_id),
      paid_at = NOW()
    WHERE id = $2
    RETURNING id
    `,
    [transactionId, id]
  );

  if (!result.rowCount) {
    return null;
  }

  return findPaymentById(id);
};

export const markPaymentFailed = async (
  id,
  transactionId = null
) => {
  const result = await query(
    `
    UPDATE payments
    SET
      status = 'FAILED',
      transaction_id = COALESCE($1, transaction_id)
    WHERE id = $2
    RETURNING id
    `,
    [transactionId, id]
  );

  if (!result.rowCount) {
    return null;
  }

  return findPaymentById(id);
};

export const refundPayment = async (id) => {
  const result = await query(
    `
    UPDATE payments
    SET
      status = 'REFUNDED'
    WHERE id = $1
    RETURNING id
    `,
    [id]
  );

  if (!result.rowCount) {
    return null;
  }

  return findPaymentById(id);
};

export const updatePayment = async (
  id,
  updates = {}
) => {
  const allowedFields = {
    invoiceNumber: 'invoice_number',
    amount: 'amount',
    currency: 'currency',
    status: 'status',
    paymentMethod: 'payment_method',
    transactionId: 'transaction_id',
    paidAt: 'paid_at',
  };

  const setClauses = [];
  const values = [];

  for (const [key, value] of Object.entries(updates)) {
    const column = allowedFields[key];

    if (!column) continue;

    values.push(value);
    setClauses.push(`${column} = $${values.length}`);
  }

  if (!setClauses.length) {
    return findPaymentById(id);
  }

  values.push(id);

  const result = await query(
    `
    UPDATE payments
    SET ${setClauses.join(', ')}
    WHERE id = $${values.length}
    RETURNING id
    `,
    values
  );

  if (!result.rowCount) {
    return null;
  }

  return findPaymentById(id);
};

export const countPayments = async ({
  userId = null,
  companyId = null,
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
    FROM payments
    ${whereClause}
    `,
    values
  );

  return result.rows[0].count;
};

export const deletePayment = async (id) => {
  const result = await query(
    `
    DELETE FROM payments
    WHERE id = $1
    RETURNING id
    `,
    [id]
  );

  return result.rowCount > 0;
};

export default {
  findPaymentById,
  findPaymentByInvoice,
  findPaymentByRequestId,
  findPaymentsByUserId,
  findPaymentsByCompanyId,
  listPayments,
  createPayment,
  markPaymentPaid,
  markPaymentFailed,
  refundPayment,
  updatePayment,
  countPayments,
  deletePayment,
};
