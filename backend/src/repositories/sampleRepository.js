import { query } from '../config/postgres.js';

let tableEnsured = false;
export async function ensureSampleTable() {
  if (tableEnsured) return;
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS public_sample_showcases (
        id              SERIAL PRIMARY KEY,
        slug            VARCHAR(255) UNIQUE NOT NULL,
        title           VARCHAR(255) NOT NULL,
        company_name    VARCHAR(255) NOT NULL,
        description     TEXT,
        logo_url        TEXT,
        status          VARCHAR(50) NOT NULL DEFAULT 'PUBLISHED',
        company_study   JSONB DEFAULT '{}'::jsonb,
        leads           JSONB DEFAULT '[]'::jsonb,
        lead_studies    JSONB DEFAULT '[]'::jsonb,
        pitch_deck      JSONB DEFAULT '{}'::jsonb,
        published_at    TIMESTAMPTZ DEFAULT NOW(),
        created_at      TIMESTAMPTZ DEFAULT NOW(),
        updated_at      TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_public_samples_slug ON public_sample_showcases (slug);
      CREATE INDEX IF NOT EXISTS idx_public_samples_status ON public_sample_showcases (status);
    `);

    // Ensure default flagship sample exists so prospect showcase is NEVER empty
    const checkRes = await query(`SELECT id FROM public_sample_showcases WHERE LOWER(TRIM(slug)) = 'data-i2i' LIMIT 1`);
    if (checkRes.rows.length === 0) {
      await seedDefaultSample();
    }

    tableEnsured = true;
  } catch (err) {
    console.error('[SampleRepository] Failed to ensure public_sample_showcases table:', err.message);
  }
}

export async function seedDefaultSample() {
  try {
    const companyStudyData = {
      company: 'Data I2I',
      industry: 'Enterprise Data Analytics & AI Consulting',
      businessOverview: 'Data I2I accelerates digital transformations by architecting unified analytics pipelines, modern data warehouses, and custom AI-driven business decision engines for Fortune 1000 enterprises.',
      marketPosition: 'Strong footprint across mid-market and enterprise fintech and healthtech sectors, competing with boutique data consultancies through rapid POC deployment models.',
      keyObservations: '1. High enterprise demand for unified data lineage and governance.\n2. Client decision-makers are actively consolidating fragmented ETL silos into modern lakehouse architectures.\n3. Executive leadership prioritizes demonstrable ROI within 90 days.',
      potentialOpportunity: 'Position bespoke AI readiness assessments to CIOs and Heads of Data Engineering navigating enterprise data governance.',
      hasPdf: true,
      pdfFileName: 'Data_I2I_Enterprise_Growth_Playbook.pdf'
    };

    const leadsData = [
      {
        id: 'sample-lead-1',
        name: 'Sarah Jenkins',
        title: 'VP of Data Engineering & Cloud Architecture',
        company: 'Meridian Financial Systems',
        logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
        shortSummary: 'Directs cloud infrastructure, enterprise warehouse migrations, and real-time transaction processing for North American banking operations.',
        industry: 'Fintech & Banking',
        location: 'Boston, MA',
        email: 'sarah.jenkins@meridianfin.com',
        phone: '+1 (617) 555-0182',
        whySuitsBest: 'Leading active cloud migration to Snowflake and expanding data governance requirements.',
        keyInitiatives: 'Enterprise Lakehouse Consolidation, Real-Time Compliance Streaming, Cloud Cost Optimization'
      },
      {
        id: 'sample-lead-2',
        name: 'Marcus Vance',
        title: 'Chief Information Officer',
        company: 'Apex Global Logistics',
        logo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=120&auto=format&fit=crop&q=80',
        shortSummary: 'Spearheads operational tech stack modernization, AI route optimization, and legacy ERP system retirement across 42 logistics hubs.',
        industry: 'Logistics & Supply Chain',
        location: 'Dallas, TX',
        email: 'marcus.vance@apexlogistics.com',
        phone: '+1 (214) 555-0149',
        whySuitsBest: 'Retiring legacy ERP data pipelines in favor of unified analytics pipelines across logistics nodes.'
      },
      {
        id: 'sample-lead-3',
        name: 'Elena Rostova',
        title: 'Head of Enterprise Analytics & BI',
        company: 'Novalis Health Sciences',
        logo: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=120&auto=format&fit=crop&q=80',
        shortSummary: 'Oversees unified clinical data platforms, HIPAA-compliant predictive models, and self-service BI analytics delivery.',
        industry: 'Healthcare & Life Sciences',
        location: 'San Francisco, CA',
        email: 'elena.rostova@novalishealth.org',
        phone: '+1 (415) 555-0177',
        whySuitsBest: 'Spearheading clinical data governance and compliance reporting infrastructure overhaul.'
      },
      {
        id: 'sample-lead-4',
        name: 'David Thorne',
        title: 'Director of Customer Insights & Growth',
        company: 'Kinetix Retail Technologies',
        logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=120&auto=format&fit=crop&q=80',
        shortSummary: 'Leads omnichannel customer data integration, predictive lifetime value modeling, and personalization engines.',
        industry: 'Retail & E-Commerce',
        location: 'Chicago, IL',
        email: 'david.thorne@kinetixretail.com',
        phone: '+1 (312) 555-0193',
        whySuitsBest: 'Building unified 360-degree customer identity resolution across physical and digital storefronts.'
      },
      {
        id: 'sample-lead-5',
        name: 'Priya Patel',
        title: 'VP of Technology & Architecture',
        company: 'AuraPay Financial Networks',
        logo: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=120&auto=format&fit=crop&q=80',
        shortSummary: 'Drives architecture standardization and security auditing across distributed cross-border payment gateways.',
        industry: 'Financial Infrastructure',
        location: 'New York, NY',
        email: 'priya.patel@aurapay.net',
        phone: '+1 (212) 555-0164',
        whySuitsBest: 'Evaluating architecture modernization partners to handle high-frequency payment reconciliation.'
      }
    ];

    const leadStudiesData = [
      {
        id: 'study-1',
        leadName: 'Sarah Jenkins',
        role: 'VP of Data Engineering & Cloud Architecture',
        company: 'Meridian Financial Systems',
        whyRelevant: 'Meridian recently initiated a 3-year cloud modernization sprint and is actively vetting specialized data architecture implementation partners.',
        observedContext: 'Currently reconciling dual legacy Teradata and Snowflake deployments across regional bank subsidiaries, resulting in cross-functional reporting bottlenecks.',
        potentialOpportunity: 'Propose a structured 6-week Data Architecture Review to audit pipelines, reduce query latency by 40%, and automate compliance monitoring.',
        suggestedApproach: 'Lead with peer financial case studies demonstrating automated compliance governance and zero-downtime warehouse cutovers.'
      }
    ];

    const pitchDeckData = {
      id: 'sample-pitch-deck-1',
      title: 'Data I2I Enterprise Intelligence & Growth Playbook',
      summary: 'Executive pitch deck showcasing tailored market positioning, ROI frameworks, technical architecture blueprints, and 90-day execution milestones.',
      fileName: 'Data_I2I_Enterprise_Growth_Playbook.pdf',
      previewAvailable: true
    };

    await query(`
      INSERT INTO public_sample_showcases (
        slug, title, company_name, description, logo_url, status,
        company_study, leads, lead_studies, pitch_deck, published_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      ON CONFLICT (slug) DO UPDATE
      SET
        title = EXCLUDED.title,
        company_name = EXCLUDED.company_name,
        description = EXCLUDED.description,
        status = 'PUBLISHED',
        company_study = EXCLUDED.company_study,
        leads = EXCLUDED.leads,
        lead_studies = EXCLUDED.lead_studies,
        pitch_deck = EXCLUDED.pitch_deck,
        updated_at = NOW();
    `, [
      'data-i2i',
      'Data I2I Intelligence & Growth Showcase',
      'Data I2I',
      'Curated B2B account intelligence, qualified decision-makers, verified market observations, and customized presentation architecture prepared by CreativeGini specialist teams.',
      '/logo.png',
      'PUBLISHED',
      JSON.stringify(companyStudyData),
      JSON.stringify(leadsData),
      JSON.stringify(leadStudiesData),
      JSON.stringify(pitchDeckData)
    ]);
    console.log('[SampleRepository] Default data-i2i showcase ensured successfully.');
  } catch (err) {
    console.error('[SampleRepository] Failed to seed default sample showcase:', err.message);
  }
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
  const cleanSlug = String(slug).toLowerCase().trim();

  // 1. Primary lookup: Case-insensitive match on slug
  const conditions = ['LOWER(TRIM(slug)) = $1'];
  const params = [cleanSlug];

  if (onlyPublished) {
    conditions.push("UPPER(TRIM(status)) = 'PUBLISHED'");
  }

  const sql = `
    SELECT
      id, slug, title, company_name, description, logo_url, status,
      company_study, leads, lead_studies, pitch_deck, published_at, created_at, updated_at
    FROM public_sample_showcases
    WHERE ${conditions.join(' AND ')}
    LIMIT 1
  `;

  let result = await query(sql, params);

  // 2. Fallback: match by numeric ID if slug is a number
  if (result.rows.length === 0 && !isNaN(cleanSlug) && Number(cleanSlug) > 0) {
    const idSql = `
      SELECT
        id, slug, title, company_name, description, logo_url, status,
        company_study, leads, lead_studies, pitch_deck, published_at, created_at, updated_at
      FROM public_sample_showcases
      WHERE id = $1
      ${onlyPublished ? "AND UPPER(TRIM(status)) = 'PUBLISHED'" : ''}
      LIMIT 1
    `;
    result = await query(idSql, [Number(cleanSlug)]);
  }

  // 3. Fallback: If onlyPublished filtered it out, check if draft exists (allows specialists/admins to preview)
  if (result.rows.length === 0 && onlyPublished) {
    const draftSql = `
      SELECT
        id, slug, title, company_name, description, logo_url, status,
        company_study, leads, lead_studies, pitch_deck, published_at, created_at, updated_at
      FROM public_sample_showcases
      WHERE LOWER(TRIM(slug)) = $1
      LIMIT 1
    `;
    const draftRes = await query(draftSql, [cleanSlug]);
    if (draftRes.rows.length > 0) {
      return mapSampleRow(draftRes.rows[0]);
    }
  }

  // 4. Fallback: If 'data-i2i' was requested and missing, seed it on-demand
  if (result.rows.length === 0 && (cleanSlug === 'data-i2i' || cleanSlug === 'default')) {
    await seedDefaultSample();
    const reRes = await query(
      `SELECT * FROM public_sample_showcases WHERE LOWER(TRIM(slug)) = 'data-i2i' LIMIT 1`
    );
    if (reRes.rows.length > 0) {
      return mapSampleRow(reRes.rows[0]);
    }
  }

  // 5. Ultimate Fallback: Return first available published showcase if specific slug is missing
  if (result.rows.length === 0) {
    const anyPublished = await query(
      `SELECT * FROM public_sample_showcases WHERE UPPER(TRIM(status)) = 'PUBLISHED' ORDER BY id ASC LIMIT 1`
    );
    if (anyPublished.rows.length > 0) {
      console.log(`[SampleRepository] Slug "${cleanSlug}" not found, gracefully falling back to "${anyPublished.rows[0].slug}"`);
      return mapSampleRow(anyPublished.rows[0]);
    }
  }

  return mapSampleRow(result.rows[0]);
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
  logoUrl = '/logo.png',
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
      status,
      company_study,
      leads,
      lead_studies,
      pitch_deck,
      published_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
    RETURNING id
    `,
    [
      slug.toLowerCase().trim(),
      title.trim(),
      companyName.trim(),
      description,
      logoUrl,
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
    companyName: 'company_name',
    description: 'description',
    logoUrl: 'logo_url',
    status: 'status',
    companyStudy: 'company_study',
    leads: 'leads',
    leadStudies: 'lead_studies',
    pitchDeck: 'pitch_deck',
  };

  const setClauses = [];
  const values = [];

  for (const [key, val] of Object.entries(updates)) {
    const col = allowed[key];
    if (col) {
      values.push(typeof val === 'object' && val !== null ? JSON.stringify(val) : val);
      setClauses.push(`${col} = $${values.length}`);
    }
  }

  if (setClauses.length === 0) return findSampleById(id);

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
