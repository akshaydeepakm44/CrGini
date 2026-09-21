import { query } from '../config/postgres.js';

const mapCompany = (row) => {
  if (!row) return null;

  return {
    _id: row.id,
    id: row.id,
    name: row.name,
    contactPerson: row.contact_person,
    email: row.email,
    phone: row.phone,
    website: row.website,
    industry: row.industry,
    companyInfo: row.company_info,
    researchSummary: row.research_summary,
    initialLeads: row.initial_leads || [],
    initialKeyPeople: row.initial_key_people || [],
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const companySelect = `
  SELECT
    c.id,
    c.name,
    c.contact_person,
    c.email,
    c.phone,
    c.website,
    c.industry,
    c.company_info,
    c.research_summary,
    c.created_by,
    c.created_at,
    c.updated_at,

    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'name', l.name,
            'title', l.title,
            'company', l.lead_company,
            'email', l.email,
            'linkedin', l.linkedin,
            'location', l.location,
            'status', l.status,
            'notes', l.notes
          )
          ORDER BY l.created_at
        )
        FROM company_leads l
        WHERE l.company_id = c.id
      ),
      '[]'::jsonb
    ) AS initial_leads,

    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'name', kp.name,
            'role', kp.role,
            'department', kp.department,
            'contact', kp.contact,
            'socialProfile', kp.social_profile
          )
          ORDER BY kp.created_at
        )
        FROM company_key_people kp
        WHERE kp.company_id = c.id
      ),
      '[]'::jsonb
    ) AS initial_key_people

  FROM companies c
`;

export const findCompanyById = async (id) => {
  const result = await query(
    `
    ${companySelect}
    WHERE c.id = $1
    LIMIT 1
    `,
    [id]
  );

  return mapCompany(result.rows[0]);
};

export const findCompanyByEmail = async (email) => {
  const result = await query(
    `
    ${companySelect}
    WHERE LOWER(c.email) = LOWER($1)
    LIMIT 1
    `,
    [email]
  );

  return mapCompany(result.rows[0]);
};

export const findCompanyByName = async (name) => {
  const result = await query(
    `
    ${companySelect}
    WHERE LOWER(c.name) = LOWER($1)
    LIMIT 1
    `,
    [name]
  );

  return mapCompany(result.rows[0]);
};

export const listCompanies = async ({
  limit = 100,
  offset = 0,
} = {}) => {
  const result = await query(
    `
    ${companySelect}
    ORDER BY c.created_at DESC
    LIMIT $1
    OFFSET $2
    `,
    [limit, offset]
  );

  return result.rows.map(mapCompany);
};

export const countCompanies = async () => {
  const result = await query(
    `
    SELECT COUNT(*)::int AS count
    FROM companies
    `
  );

  return result.rows[0].count;
};

export const createCompany = async ({
  name,
  contactPerson,
  email,
  phone = null,
  website = null,
  industry = 'Technology/SaaS',
  companyInfo = null,
  researchSummary = null,
  initialLeads = [],
  initialKeyPeople = [],
  createdBy = null,
}) => {
  const clientResult = await query(
    `
    INSERT INTO companies (
      name,
      contact_person,
      email,
      phone,
      website,
      industry,
      company_info,
      research_summary,
      created_by
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
      $9
    )
    RETURNING id
    `,
    [
      name,
      contactPerson,
      email?.toLowerCase(),
      phone,
      website,
      industry,
      companyInfo,
      researchSummary,
      createdBy,
    ]
  );

  const companyId = clientResult.rows[0].id;

  if (Array.isArray(initialLeads) && initialLeads.length > 0) {
    for (const lead of initialLeads) {
      await addCompanyLead(companyId, lead);
    }
  }

  if (
    Array.isArray(initialKeyPeople) &&
    initialKeyPeople.length > 0
  ) {
    for (const person of initialKeyPeople) {
      await addKeyPerson(companyId, person);
    }
  }

  return findCompanyById(companyId);
};

export const updateCompany = async (id, updates = {}) => {
  const allowedFields = {
    name: 'name',
    contactPerson: 'contact_person',
    email: 'email',
    phone: 'phone',
    website: 'website',
    industry: 'industry',
    companyInfo: 'company_info',
    researchSummary: 'research_summary',
  };

  const setClauses = [];
  const values = [];

  for (const [key, value] of Object.entries(updates)) {
    const column = allowedFields[key];

    if (!column) continue;

    const finalValue =
      key === 'email' && value
        ? value.toLowerCase()
        : value;

    values.push(finalValue);
    setClauses.push(`${column} = $${values.length}`);
  }

  if (setClauses.length > 0) {
    values.push(id);

    await query(
      `
      UPDATE companies
      SET ${setClauses.join(', ')}
      WHERE id = $${values.length}
      `,
      values
    );
  }

  if (Array.isArray(updates.initialLeads)) {
    await replaceCompanyLeads(id, updates.initialLeads);
  }

  if (Array.isArray(updates.initialKeyPeople)) {
    await replaceKeyPeople(id, updates.initialKeyPeople);
  }

  return findCompanyById(id);
};

export const addCompanyLead = async (
  companyId,
  lead = {}
) => {
  const result = await query(
    `
    INSERT INTO company_leads (
      company_id,
      name,
      title,
      lead_company,
      email,
      linkedin,
      location,
      status,
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
      $9
    )
    RETURNING
      id,
      name,
      title,
      lead_company AS company,
      email,
      linkedin,
      location,
      status,
      notes,
      created_at,
      updated_at
    `,
    [
      companyId,
      lead.name,
      lead.title || null,
      lead.company || lead.lead_company || null,
      lead.email || null,
      lead.linkedin || null,
      lead.location || null,
      lead.status || 'Verified',
      lead.notes || null,
    ]
  );

  return result.rows[0];
};

export const addKeyPerson = async (
  companyId,
  person = {}
) => {
  const result = await query(
    `
    INSERT INTO company_key_people (
      company_id,
      name,
      role,
      department,
      contact,
      social_profile
    )
    VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6
    )
    RETURNING
      id,
      name,
      role,
      department,
      contact,
      social_profile,
      created_at,
      updated_at
    `,
    [
      companyId,
      person.name,
      person.role || null,
      person.department || null,
      person.contact || null,
      person.socialProfile || null,
    ]
  );

  return result.rows[0];
};

export const getCompanyLeads = async (companyId) => {
  const result = await query(
    `
    SELECT
      id,
      name,
      title,
      lead_company AS company,
      email,
      linkedin,
      location,
      status,
      notes,
      created_at,
      updated_at
    FROM company_leads
    WHERE company_id = $1
    ORDER BY created_at ASC
    `,
    [companyId]
  );

  return result.rows;
};

export const getKeyPeople = async (companyId) => {
  const result = await query(
    `
    SELECT
      id,
      name,
      role,
      department,
      contact,
      social_profile,
      created_at,
      updated_at
    FROM company_key_people
    WHERE company_id = $1
    ORDER BY created_at ASC
    `,
    [companyId]
  );

  return result.rows;
};

export const replaceCompanyLeads = async (
  companyId,
  leads = []
) => {
  await query(
    `
    DELETE FROM company_leads
    WHERE company_id = $1
    `,
    [companyId]
  );

  for (const lead of leads) {
    await addCompanyLead(companyId, lead);
  }

  return getCompanyLeads(companyId);
};

export const replaceKeyPeople = async (
  companyId,
  people = []
) => {
  await query(
    `
    DELETE FROM company_key_people
    WHERE company_id = $1
    `,
    [companyId]
  );

  for (const person of people) {
    await addKeyPerson(companyId, person);
  }

  return getKeyPeople(companyId);
};

export const deleteCompany = async (id) => {
  const result = await query(
    `
    DELETE FROM companies
    WHERE id = $1
    RETURNING id
    `,
    [id]
  );

  return result.rowCount > 0;
};

export default {
  findCompanyById,
  findCompanyByEmail,
  findCompanyByName,
  listCompanies,
  countCompanies,
  createCompany,
  updateCompany,
  addCompanyLead,
  addKeyPerson,
  getCompanyLeads,
  getKeyPeople,
  replaceCompanyLeads,
  replaceKeyPeople,
  deleteCompany,
};
