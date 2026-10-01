import { query } from '../config/postgres.js';

const mapCompany = (row) => {
  if (!row) return null;

  const leads = (row.initial_leads || []).map(l => {
    const pdfMatch = (l.notes || '').match(/\[Lead PDF:\s*([^\]]+)\]/) || (l.notes || '').match(/\[Lead Study:\s*([^\]]+)\]/);
    const pitchMatch = (l.notes || '').match(/\[Pitch Deck:\s*([^\]]+)\]/);
    const kpMatch = (l.notes || '').match(/\[Key People:\s*([^\]]+)\]/);
    const source_reference = pdfMatch ? pdfMatch[1] : null;
    const cleanNotes = (l.notes || '')
      .replace(/\[Lead PDF:\s*[^\]]+\]/g, '')
      .replace(/\[Lead Study:\s*[^\]]+\]/g, '')
      .replace(/\[Pitch Deck:\s*[^\]]+\]/g, '')
      .replace(/\[Key People:\s*[^\]]+\]/g, '')
      .replace(/\[Lead Type:\s*[^\]]+\]/g, '')
      .replace(/\[Ticket:\s*[^\]]+\]/g, '')
      .replace(/\[Website:\s*[^\]]+\]/g, '')
      .trim();
    const websiteMatch = (l.notes || '').match(/\[Website:\s*([^\]]+)\]/);
    const website = (l.linkedin && /^https?:\/\//i.test(l.linkedin)) ? l.linkedin : (websiteMatch ? websiteMatch[1] : (l.linkedin || ''));
    const companyName = l.company || l.lead_company || l.name;
    const assetIdMatch = source_reference ? source_reference.match(/\/api\/assets\/([a-f0-9\-]+)\/stream/i) : null;
    const assetId = assetIdMatch ? assetIdMatch[1] : null;
    const downloadUrl = assetId ? `/api/assets/${assetId}/download` : source_reference;

    const pitchRef = pitchMatch ? pitchMatch[1] : null;
    const pitchAssetMatch = pitchRef ? pitchRef.match(/\/api\/assets\/([a-f0-9\-]+)\/stream/i) : null;
    const pitchAssetId = pitchAssetMatch ? pitchAssetMatch[1] : null;

    const kpRef = kpMatch ? kpMatch[1] : null;
    const kpAssetMatch = kpRef ? kpRef.match(/\/api\/assets\/([a-f0-9\-]+)\/stream/i) : null;
    const kpAssetId = kpAssetMatch ? kpAssetMatch[1] : null;

    const leadStudy = source_reference ? {
      id: assetId,
      assetId,
      streamUrl: source_reference,
      downloadUrl,
      fileName: `${companyName} - Lead Study.pdf`
    } : null;

    const pitchDeck = pitchRef ? {
      id: pitchAssetId,
      assetId: pitchAssetId,
      streamUrl: pitchRef,
      downloadUrl: pitchAssetId ? `/api/assets/${pitchAssetId}/download` : pitchRef,
      fileName: `${companyName} - Pitch Deck.pdf`
    } : null;

    let keyPeople = null;
    if (kpAssetId || (kpRef && (kpRef.includes('/api/assets/') || kpRef.endsWith('.pdf')))) {
      keyPeople = {
        id: kpAssetId,
        assetId: kpAssetId,
        streamUrl: kpRef,
        downloadUrl: kpAssetId ? `/api/assets/${kpAssetId}/download` : kpRef,
        fileName: `${companyName} - Key People.pdf`
      };
    } else if (kpRef) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const emails = kpRef.split(',').map(s => s.trim().toLowerCase()).filter(s => emailRegex.test(s));
      keyPeople = {
        count: emails.length,
        emails
      };
    }

    return {
      ...l,
      companyName,
      website,
      notes: cleanNotes,
      source_reference,
      sourceReference: source_reference,
      leadStudy,
      pitchDeck,
      keyPeople,
      pdf: leadStudy
    };
  });

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
    initialLeads: leads,
    leads: leads,
    initialKeyPeople: row.initial_key_people || [],
    keyPeople: row.initial_key_people || [],
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
            'id', l.id,
            'name', l.name,
            'title', l.title,
            'company', l.lead_company,
            'email', l.email,
            'linkedin', l.linkedin,
            'location', l.location,
            'status', l.status,
            'notes', l.notes,
            'createdAt', l.created_at,
            'updatedAt', l.updated_at
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
            'id', kp.id,
            'name', kp.name,
            'role', kp.role,
            'department', kp.department,
            'contact', kp.contact,
            'socialProfile', kp.social_profile,
            'createdAt', kp.created_at
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
      lead.status || 'PENDING',
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

  return result.rows.map(r => {
    const pdfMatch = (r.notes || '').match(/\[Lead PDF:\s*([^\]]+)\]/);
    const source_reference = pdfMatch ? pdfMatch[1] : null;
    const cleanNotes = (r.notes || '').replace(/\[Lead PDF:\s*[^\]]+\]/g, '').replace(/\[Website:\s*[^\]]+\]/g, '').trim();
    const websiteMatch = (r.notes || '').match(/\[Website:\s*([^\]]+)\]/);
    const website = (r.linkedin && /^https?:\/\//i.test(r.linkedin)) ? r.linkedin : (websiteMatch ? websiteMatch[1] : (r.linkedin || ''));
    const companyName = r.lead_company || r.name;
    const assetIdMatch = source_reference ? source_reference.match(/\/api\/assets\/([a-f0-9\-]+)\/stream/i) : null;
    const assetId = assetIdMatch ? assetIdMatch[1] : null;
    const downloadUrl = assetId ? `/api/assets/${assetId}/download` : source_reference;

    return {
      ...r,
      companyName,
      website,
      notes: cleanNotes,
      source_reference,
      sourceReference: source_reference,
      pdf: source_reference ? {
        id: assetId,
        assetId,
        streamUrl: source_reference,
        downloadUrl,
        fileName: `${companyName} - Company Details.pdf`
      } : null
    };
  });
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

export const findLeadById = async (leadId) => {
  const result = await query(
    `
    SELECT
      l.id,
      l.company_id,
      l.name,
      l.title,
      l.lead_company AS company,
      l.email,
      l.linkedin,
      l.location,
      l.status,
      l.notes,
      l.created_at,
      l.updated_at,
      c.name AS target_company_name,
      c.industry AS target_company_industry,
      c.website AS target_company_website,
      c.company_info AS target_company_info,
      c.research_summary AS company_research_summary
    FROM company_leads l
    JOIN companies c ON c.id = l.company_id
    WHERE l.id = $1
    `,
    [leadId]
  );
  return result.rows[0] || null;
};

export const updateCompanyLead = async (leadId, updates = {}) => {
  const allowed = {
    name: 'name',
    title: 'title',
    company: 'lead_company',
    lead_company: 'lead_company',
    email: 'email',
    linkedin: 'linkedin',
    location: 'location',
    status: 'status',
    notes: 'notes'
  };

  const setClauses = [];
  const values = [];
  let paramIdx = 1;

  for (const [key, val] of Object.entries(updates)) {
    if (allowed[key] !== undefined && val !== undefined) {
      setClauses.push(`${allowed[key]} = $${paramIdx}`);
      values.push(val);
      paramIdx++;
    }
  }

  if (setClauses.length === 0) return findLeadById(leadId);

  setClauses.push(`updated_at = NOW()`);
  values.push(leadId);

  const sql = `
    UPDATE company_leads
    SET ${setClauses.join(', ')}
    WHERE id = $${paramIdx}
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
  `;

  const result = await query(sql, values);
  return result.rows[0] || null;
};

export const deleteCompanyLead = async (leadId) => {
  const result = await query(
    `DELETE FROM company_leads WHERE id = $1 RETURNING id`,
    [leadId]
  );
  return result.rowCount > 0;
};

export const deleteKeyPerson = async (personId) => {
  const result = await query(
    `DELETE FROM company_key_people WHERE id = $1 RETURNING id`,
    [personId]
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
  findLeadById,
  updateCompanyLead,
  deleteCompanyLead,
  deleteKeyPerson,
};

