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
      companyBoost: Boolean(row.company_boost),
      companyLead: Boolean(row.company_lead),
      companyUI: Boolean(row.company_ui),
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
      company_boost,
      company_lead,
      company_ui,
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
      company_boost,
      company_lead,
      company_ui,
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
      company_boost,
      company_lead,
      company_ui,
      company_id,
      phone,
      status,
      avatar
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
    )
    ON CONFLICT (email) DO UPDATE
    SET
      name = EXCLUDED.name,
      password = EXCLUDED.password,
      role = EXCLUDED.role,
      company_boost = EXCLUDED.company_boost,
      company_lead = EXCLUDED.company_lead,
      company_ui = EXCLUDED.company_ui,
      company_id = EXCLUDED.company_id,
      phone = EXCLUDED.phone,
      status = EXCLUDED.status,
      avatar = EXCLUDED.avatar,
      is_deleted = false,
      deleted_at = NULL,
      updated_at = NOW()
    RETURNING
      id,
      name,
      email,
      password,
      role,
      company_boost,
      company_lead,
      company_ui,
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
      setClauses.push(`company_boost = $${values.length}`);
    }

    if (updates.dashboardAccess.companyLead !== undefined) {
      values.push(Boolean(updates.dashboardAccess.companyLead));
      setClauses.push(`company_lead = $${values.length}`);
    }

    if (updates.dashboardAccess.companyUI !== undefined) {
      values.push(Boolean(updates.dashboardAccess.companyUI));
      setClauses.push(`company_ui = $${values.length}`);
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
      company_boost,
      company_lead,
      company_ui,
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


export const findActiveSpecialists = async (serviceType) => {
  let condition = "";
  if (serviceType === 'COMPANY_LEAD') {
    condition = "(role = 'COMPANY_LEAD' OR company_lead = true)";
  } else if (serviceType === 'COMPANY_BOOST') {
    condition = "(role = 'COMPANY_BOOST' OR company_boost = true)";
  } else if (serviceType === 'LANDING_PAGE' || serviceType === 'COMPANY_UI') {
    condition = "(role = 'LANDING_PAGE' OR company_ui = true)";
  } else {
    condition = "role = 'ADMIN'";
  }

  const result = await query(
    `
    SELECT *
    FROM users
    WHERE status = 'ACTIVE'
      AND is_deleted = false
      AND ${condition}
    `
  );

  return result.rows.map(mapUser);
};

export const listUsers = async ({
  role = null,
  companyId = null,
  isDeleted = false,
  limit = 100,
  offset = 0,
} = {}) => {
  const conditions = [];
  const values = [];

  if (isDeleted !== null) {
    values.push(isDeleted);
    conditions.push(`u.is_deleted = $${values.length}`);
  }

  if (role) {
    values.push(role);
    conditions.push(`u.role = $${values.length}`);
  }

  if (companyId) {
    values.push(companyId);
    conditions.push(`u.company_id = $${values.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  values.push(limit);
  const limitParam = `${values.length}`;
  values.push(offset);
  const offsetParam = `${values.length}`;

  const result = await query(
    `
    SELECT
      u.*,
      c.name AS company_name,
      c.email AS company_email,
      c.website AS company_website,
      c.industry AS company_industry
    FROM users u
    LEFT JOIN companies c ON c.id = u.company_id
    ${whereClause}
    ORDER BY u.created_at DESC
    LIMIT $${limitParam}
    OFFSET $${offsetParam}
    `,
    values
  );

  return result.rows.map(row => {
    const user = mapUser(row);
    if (row.company_name) {
      user.company = {
        _id: row.company_id,
        id: row.company_id,
        name: row.company_name,
        email: row.company_email,
        website: row.company_website,
        industry: row.company_industry,
        toString() { return String(row.company_id); },
      };
      user.companyId = user.company;
    }
    return user;
  });
};

export default {
  findUserById,
  findUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  getEffectiveDashboardAccess,
  findActiveSpecialists,
  listUsers,
};

