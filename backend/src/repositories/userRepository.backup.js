import { query } from '../config/postgres.js';

const mapUser = (row) => {
  if (!row) return null;

  return {
    _id: row.id,
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    role: row.role,
    dashboardAccess: {
      companyBoost: row.dashboard_company_boost,
      companyLead: row.dashboard_company_lead,
      companyUI: row.dashboard_company_ui,
    },
    companyId: row.company_id,
    phone: row.phone,
    status: row.status,
    isDeleted: row.is_deleted,
    deletedAt: row.deleted_at,
    avatar: row.avatar,
    lastLogin: row.last_login,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export const findUserById = async (id, options = {}) => {
  const passwordColumn = options.includePassword
    ? ', password'
    : '';

  const result = await query(
    `
    SELECT
      id,
      name,
      email
      ${passwordColumn},
      role,
      dashboard_company_boost,
      dashboard_company_lead,
      dashboard_company_ui,
      company_id,
      phone,
      status,
      is_deleted,
      deleted_at,
      avatar,
      last_login,
      created_at,
      updated_at
    FROM users
    WHERE id = $1
      AND is_deleted = false
    LIMIT 1
    `,
    [id]
  );

  return mapUser(result.rows[0]);
};

export const findUserByEmail = async (email, options = {}) => {
  const passwordColumn = options.includePassword
    ? ', password'
    : '';

  const result = await query(
    `
    SELECT
      id,
      name,
      email
      ${passwordColumn},
      role,
      dashboard_company_boost,
      dashboard_company_lead,
      dashboard_company_ui,
      company_id,
      phone,
      status,
      is_deleted,
      deleted_at,
      avatar,
      last_login,
      created_at,
      updated_at
    FROM users
    WHERE LOWER(email) = LOWER($1)
      AND is_deleted = false
    LIMIT 1
    `,
    [email]
  );

  return mapUser(result.rows[0]);
};

export const createUser = async ({
  name,
  email,
  password,
  role = 'USER',
  dashboardAccess = {},
  companyId = null,
  phone = null,
  status = 'ACTIVE',
  avatar = null,
}) => {
  const result = await query(
    `
    INSERT INTO users (
      name,
      email,
      password,
      role,
      dashboard_company_boost,
      dashboard_company_lead,
      dashboard_company_ui,
      company_id,
      phone,
      status,
      avatar
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
    )
    RETURNING
      id,
      name,
      email,
      password,
      role,
      dashboard_company_boost,
      dashboard_company_lead,
      dashboard_company_ui,
      company_id,
      phone,
      status,
      is_deleted,
      deleted_at,
      avatar,
      last_login,
      created_at,
      updated_at
    `,
    [
      name,
      email.toLowerCase(),
      password,
      role,
      Boolean(dashboardAccess.companyBoost),
      Boolean(dashboardAccess.companyLead),
      Boolean(dashboardAccess.companyUI),
      companyId,
      phone,
      status,
      avatar,
    ]
  );

  return mapUser(result.rows[0]);
};

export const updateUser = async (id, updates = {}) => {
  const allowedFields = {
    name: 'name',
    email: 'email',
    password: 'password',
    role: 'role',
    companyId: 'company_id',
    phone: 'phone',
    status: 'status',
    avatar: 'avatar',
    lastLogin: 'last_login',
    isDeleted: 'is_deleted',
    deletedAt: 'deleted_at',
  };

  const setClauses = [];
  const values = [];

  for (const [key, value] of Object.entries(updates)) {
    const column = allowedFields[key];

    if (!column) continue;

    values.push(key === 'email' && value ? value.toLowerCase() : value);
    setClauses.push(`${column} = $${values.length}`);
  }

  if (updates.dashboardAccess) {
    if (updates.dashboardAccess.companyBoost !== undefined) {
      values.push(Boolean(updates.dashboardAccess.companyBoost));
      setClauses.push(`dashboard_company_boost = $${values.length}`);
    }

    if (updates.dashboardAccess.companyLead !== undefined) {
      values.push(Boolean(updates.dashboardAccess.companyLead));
      setClauses.push(`dashboard_company_lead = $${values.length}`);
    }

    if (updates.dashboardAccess.companyUI !== undefined) {
      values.push(Boolean(updates.dashboardAccess.companyUI));
      setClauses.push(`dashboard_company_ui = $${values.length}`);
    }
  }

  if (!setClauses.length) {
    return findUserById(id, { includePassword: true });
  }

  values.push(id);

  const result = await query(
    `
    UPDATE users
    SET ${setClauses.join(', ')}
    WHERE id = $${values.length}
      AND is_deleted = false
    RETURNING
      id,
      name,
      email,
      password,
      role,
      dashboard_company_boost,
      dashboard_company_lead,
      dashboard_company_ui,
      company_id,
      phone,
      status,
      is_deleted,
      deleted_at,
      avatar,
      last_login,
      created_at,
      updated_at
    `,
    values
  );

  return mapUser(result.rows[0]);
};

export const deleteUser = async (id) => {
  const result = await query(
    `
    UPDATE users
    SET
      is_deleted = true,
      deleted_at = NOW(),
      status = 'DISABLED'
    WHERE id = $1
      AND is_deleted = false
    RETURNING id
    `,
    [id]
  );

  return result.rowCount > 0;
};

export const getEffectiveDashboardAccess = (user) => {
  if (!user) {
    return {
      companyBoost: false,
      companyLead: false,
      companyUI: false,
    };
  }

  if (user.role === 'ADMIN') {
    return {
      companyBoost: true,
      companyLead: true,
      companyUI: true,
    };
  }

  if (user.role === 'USER') {
    return {
      companyBoost: false,
      companyLead: false,
      companyUI: false,
    };
  }

  return {
    companyBoost: Boolean(user.dashboardAccess?.companyBoost),
    companyLead: Boolean(user.dashboardAccess?.companyLead),
    companyUI: Boolean(user.dashboardAccess?.companyUI),
  };
};

export default {
  findUserById,
  findUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  getEffectiveDashboardAccess,
};

