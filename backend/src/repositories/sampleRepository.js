import { query } from '../config/postgres.js';

let tableEnsured = false;
let tablePromise = null;
export async function ensureSampleTable() {
  if (tableEnsured) return;
  if (!tablePromise) {
    tablePromise = (async () => {
      try {
        await query(`
          CREATE TABLE IF NOT EXISTS public_sample_showcases (
            id              SERIAL PRIMARY KEY,
            slug            VARCHAR(255) UNIQUE NOT NULL,
            title           VARCHAR(255) NOT NULL,
            company_name    VARCHAR(255) NOT NULL,
            description     TEXT,
            logo_url        TEXT,
            logo_asset_key  TEXT,
            status          VARCHAR(50) NOT NULL DEFAULT 'PUBLISHED',
            company_study   JSONB DEFAULT '{}'::jsonb,
            leads           JSONB DEFAULT '[]'::jsonb,
            lead_studies    JSONB DEFAULT '[]'::jsonb,
            pitch_deck      JSONB DEFAULT '{}'::jsonb,
            published_at    TIMESTAMPTZ DEFAULT NOW(),
            created_at      TIMESTAMPTZ DEFAULT NOW(),
            updated_at      TIMESTAMPTZ DEFAULT NOW()
          );

          ALTER TABLE public_sample_showcases ADD COLUMN IF NOT EXISTS logo_asset_key TEXT;
          CREATE INDEX IF NOT EXISTS idx_public_samples_slug ON public_sample_showcases (slug);
          CREATE INDEX IF NOT EXISTS idx_public_samples_status ON public_sample_showcases (status);
        `);
        tableEnsured = true;

        // Auto-seed default showcases (Data I2I, Siift AI, Finkr) if missing
        try {
          const { seedDefaultShowcases } = await import('../config/seedDefaultShowcases.js');
          await seedDefaultShowcases();
        } catch (seedErr) {
          console.warn('[SampleRepository] seedDefaultShowcases note:', seedErr.message);
        }
      } catch (err) {
        console.error('[SampleRepository] Failed to ensure public_sample_showcases table:', err.message);
      } finally {
        tablePromise = null;
      }
    })();
  }
  return tablePromise;
}

const mapSampleRow = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    companyName: row.company_name,
    description: row.description,
    logoUrl: row.logo_url,
    logoAssetKey: row.logo_asset_key || row.company_study?.logoAssetKey || null,
    status: row.status,
    companyStudy: row.company_study || {},
    leads: row.leads || [],
    leadStudies: row.lead_studies || [],
    pitchDeck: row.pitch_deck || {},
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export const findSampleBySlug = async (slug, onlyPublished = true) => {
  await ensureSampleTable();
  if (!slug) return null;
  const rawSlug = String(slug).toLowerCase().trim();

  // If generic keywords requested, return the flagship published showcase
  const genericKeywords = ['prospect', 'prospects', 'sample', 'samples', 'showcase', 'showcases', 'demo', 'default'];
  if (genericKeywords.includes(rawSlug)) {
    const defaultRes = await query(`
      SELECT * FROM public_sample_showcases
      WHERE status = 'PUBLISHED'
      ORDER BY CASE WHEN slug = 'data-i2i' THEN 0 WHEN slug = 'siift-ai' THEN 1 ELSE 2 END, id ASC
      LIMIT 1
    `);
    if (defaultRes.rows[0]) return mapSampleRow(defaultRes.rows[0]);
  }

  // 1. Exact match on slug
  const exactRes = await query(`
    SELECT * FROM public_sample_showcases
    WHERE slug = $1 ${onlyPublished ? "AND status = 'PUBLISHED'" : ""}
    LIMIT 1
  `, [rawSlug]);
  if (exactRes.rows[0]) return mapSampleRow(exactRes.rows[0]);

  // 2. Numeric ID lookup if slug is a number (e.g. /samples/1, /samples/5)
  if (/^\d+$/.test(rawSlug)) {
    const idRes = await query(`
      SELECT * FROM public_sample_showcases
      WHERE id = $1 ${onlyPublished ? "AND status = 'PUBLISHED'" : ""}
      LIMIT 1
    `, [parseInt(rawSlug, 10)]);
    if (idRes.rows[0]) return mapSampleRow(idRes.rows[0]);
  }

  // 3. Match without hyphens (e.g. 'datai2i' -> 'data-i2i', 'siiftai' -> 'siift-ai')
  const unhyphenated = rawSlug.replace(/[^a-z0-9]/g, '');
  if (unhyphenated.length >= 2) {
    const unhyphenRes = await query(`
      SELECT * FROM public_sample_showcases
      WHERE REPLACE(REPLACE(slug, '-', ''), '_', '') = $1
      ${onlyPublished ? "AND status = 'PUBLISHED'" : ""}
      LIMIT 1
    `, [unhyphenated]);
    if (unhyphenRes.rows[0]) return mapSampleRow(unhyphenRes.rows[0]);
  }

  // 4. Prefix or Company Name matching (e.g. 'siift' -> 'siift-ai', 'finkr' -> 'finkr')
  const fuzzyRes = await query(`
    SELECT * FROM public_sample_showcases
    WHERE (
      slug LIKE $1 || '-%' OR
      slug LIKE $1 || '%' OR
      LOWER(company_name) = $1 OR
      LOWER(company_name) LIKE '%' || $1 || '%'
    )
    ${onlyPublished ? "AND status = 'PUBLISHED'" : ""}
    ORDER BY CASE WHEN slug LIKE $1 || '-%' THEN 0 ELSE 1 END, id ASC
    LIMIT 1
  `, [rawSlug]);
  if (fuzzyRes.rows[0]) return mapSampleRow(fuzzyRes.rows[0]);

  // 5. Fallback if onlyPublished blocked a DRAFT showcase:
  // If the showcase exists in DRAFT, return it so the creator or preview link works
  if (onlyPublished) {
    const draftRes = await query(`
      SELECT * FROM public_sample_showcases
      WHERE slug = $1 OR REPLACE(slug, '-', '') = $2 OR LOWER(company_name) = $1
      LIMIT 1
    `, [rawSlug, unhyphenated]);
    if (draftRes.rows[0]) {
      const mapped = mapSampleRow(draftRes.rows[0]);
      mapped.isDraft = true;
      return mapped;
    }
  }

  return null;
};

export const findSampleById = async (id) => {
  await ensureSampleTable();
  if (!id) return null;
  const result = await query(
    `
    SELECT
      id,
      slug,
      title,
      company_name,
      description,
      logo_url,
      logo_asset_key,
      status,
      company_study,
      leads,
      lead_studies,
      pitch_deck,
      published_at,
      created_at,
      updated_at
    FROM public_sample_showcases
    WHERE id = $1
    LIMIT 1
    `,
    [id]
  );
  return mapSampleRow(result.rows[0]);
};

export const findAllSamples = async (includeDrafts = false) => {
  await ensureSampleTable();
  const where = includeDrafts ? '' : "WHERE status = 'PUBLISHED'";
  const result = await query(
    `
    SELECT
      id,
      slug,
      title,
      company_name,
      description,
      logo_url,
      logo_asset_key,
      status,
      company_study,
      leads,
      lead_studies,
      pitch_deck,
      published_at,
      created_at,
      updated_at
    FROM public_sample_showcases
    ${where}
    ORDER BY created_at DESC
    `
  );
  return result.rows.map(mapSampleRow);
};

export const createSampleShowcase = async ({
  slug,
  title,
  companyName,
  description = '',
  logoUrl = null,
  logoAssetKey = null,
  status = 'PUBLISHED',
  companyStudy = {},
  leads = [],
  leadStudies = [],
  pitchDeck = {},
}) => {
  await ensureSampleTable();
  const result = await query(
    `
    INSERT INTO public_sample_showcases (
      slug,
      title,
      company_name,
      description,
      logo_url,
      logo_asset_key,
      status,
      company_study,
      leads,
      lead_studies,
      pitch_deck,
      published_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title,
      company_name = EXCLUDED.company_name,
      description = EXCLUDED.description,
      logo_url = COALESCE(EXCLUDED.logo_url, public_sample_showcases.logo_url),
      logo_asset_key = COALESCE(EXCLUDED.logo_asset_key, public_sample_showcases.logo_asset_key),
      status = EXCLUDED.status,
      company_study = EXCLUDED.company_study,
      leads = EXCLUDED.leads,
      lead_studies = EXCLUDED.lead_studies,
      pitch_deck = EXCLUDED.pitch_deck,
      updated_at = NOW()
    RETURNING id
    `,
    [
      slug.toLowerCase().trim(),
      title.trim(),
      companyName.trim(),
      description,
      logoUrl,
      logoAssetKey,
      status,
      JSON.stringify(companyStudy),
      JSON.stringify(leads),
      JSON.stringify(leadStudies),
      JSON.stringify(pitchDeck),
    ]
  );
  return findSampleById(result.rows[0].id);
};

export const updateSampleShowcase = async (id, updates = {}) => {
  await ensureSampleTable();
  const allowed = {
    title: 'title',
    slug: 'slug',
    companyName: 'company_name',
    company_name: 'company_name',
    description: 'description',
    logoUrl: 'logo_url',
    logo_url: 'logo_url',
    logoAssetKey: 'logo_asset_key',
    logo_asset_key: 'logo_asset_key',
    status: 'status',
    companyStudy: 'company_study',
    company_study: 'company_study',
    leads: 'leads',
    leadStudies: 'lead_studies',
    lead_studies: 'lead_studies',
    pitchDeck: 'pitch_deck',
    pitch_deck: 'pitch_deck',
  };

  // Map target DB column -> resolved value to ensure each column is updated only once
  const colMap = new Map();

  for (const [key, val] of Object.entries(updates)) {
    const col = allowed[key];
    if (col && val !== undefined) {
      if (!colMap.has(col) || (val !== null && val !== '')) {
        colMap.set(col, val);
      }
    }
  }

  if (colMap.size === 0) return findSampleById(id);

  const setClauses = [];
  const values = [];

  for (const [col, val] of colMap.entries()) {
    values.push(typeof val === 'object' && val !== null ? JSON.stringify(val) : val);
    setClauses.push(`${col} = $${values.length}`);
  }

  values.push(id);
  const sql = `
    UPDATE public_sample_showcases
    SET ${setClauses.join(', ')}, updated_at = NOW()
    WHERE id = $${values.length}
    RETURNING id
  `;

  const result = await query(sql, values);
  return findSampleById(result.rows[0]?.id);
};

export const deleteSampleShowcase = async (id) => {
  await ensureSampleTable();
  await query('DELETE FROM public_sample_showcases WHERE id = $1', [id]);
  return true;
};
