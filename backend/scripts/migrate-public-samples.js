import { query } from '../src/config/postgres.js';
import { uploadFile } from '../src/services/storageService.js';

export const migratePublicSamples = async () => {
  console.log('[Migration] Ensuring public_sample_showcases table exists...');
  
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

  console.log('[Migration] Seeding Data I2I showcase sample...');

  // Create a clean synthetic PDF buffer for sample pitch deck
  const samplePdfContent = `%PDF-1.4
1 0 obj
<< /Title (Data I2I Enterprise Intelligence Playbook)
   /Author (CreativeGini Specialist Team)
   /Subject (B2B Account Intelligence & Growth Playbook) >>
endobj
2 0 obj
<< /Type /Catalog /Pages 3 0 R >>
endobj
3 0 obj
<< /Type /Pages /Kids [4 0 R] /Count 1 >>
endobj
4 0 obj
<< /Type /Page /Parent 3 0 R /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
5 0 obj
<< /Length 120 >>
stream
BT
/F1 24 Tf
100 700 Td
(CreativeGini Intelligence Showcase: Data I2I Playbook) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f
0000000010 00000 n
0000000140 00000 n
0000000188 00000 n
0000000245 00000 n
0000000329 00000 n
trailer
<< /Size 6 /Root 2 0 R >>
startxref
500
%%EOF`;

  const pdfBuffer = Buffer.from(samplePdfContent, 'utf-8');

  // Upload pitch deck to object storage
  const uploadRes = await uploadFile({
    buffer: pdfBuffer,
    originalName: 'Data_I2I_Enterprise_Growth_Playbook.pdf',
    mimeType: 'application/pdf',
    prefix: 'public-samples/data-i2i',
  });

  const companyStudyData = {
    company: 'Data I2I',
    industry: 'Enterprise Data Analytics & AI Consulting',
    businessOverview: 'Data I2I accelerates digital transformations by architecting unified analytics pipelines, modern data warehouses, and custom AI-driven business decision engines for Fortune 1000 enterprises.',
    marketPosition: 'Strong footprint across mid-market and enterprise fintech and healthtech sectors, competing with boutique data consultancies through rapid POC deployment models.',
    keyObservations: 'High enterprise demand for unified data lineage and governance; client decision-makers are actively consolidating fragmented ETL silos into modern lakehouse architectures.',
    potentialOpportunity: 'Position bespoke AI readiness assessments to CIOs and Heads of Data Engineering navigating enterprise data governance.'
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
      location: 'Boston, MA'
    },
    {
      id: 'sample-lead-2',
      name: 'Marcus Vance',
      title: 'Chief Information Officer',
      company: 'Apex Global Logistics',
      logo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=120&auto=format&fit=crop&q=80',
      shortSummary: 'Spearheads operational tech stack modernization, AI route optimization, and legacy ERP system retirement across 42 logistics hubs.',
      industry: 'Logistics & Supply Chain',
      location: 'Dallas, TX'
    },
    {
      id: 'sample-lead-3',
      name: 'Elena Rostova',
      title: 'Head of Enterprise Analytics & BI',
      company: 'Novalis Health Sciences',
      logo: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=120&auto=format&fit=crop&q=80',
      shortSummary: 'Oversees unified clinical data platforms, HIPAA-compliant predictive models, and self-service BI analytics delivery.',
      industry: 'Healthcare & Life Sciences',
      location: 'San Francisco, CA'
    },
    {
      id: 'sample-lead-4',
      name: 'David Thorne',
      title: 'Director of Customer Insights & Growth',
      company: 'Kinetix Retail Technologies',
      logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=120&auto=format&fit=crop&q=80',
      shortSummary: 'Leads omnichannel customer data integration, predictive lifetime value modeling, and personalization engines.',
      industry: 'Retail & E-Commerce',
      location: 'Chicago, IL'
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
    assetKey: uploadRes.objectKey,
    mimeType: 'application/pdf',
    fileSize: uploadRes.size,
    previewAvailable: true
  };

  await query(`
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
    ON CONFLICT (slug) DO UPDATE
    SET
      title = EXCLUDED.title,
      company_name = EXCLUDED.company_name,
      description = EXCLUDED.description,
      logo_url = EXCLUDED.logo_url,
      status = EXCLUDED.status,
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
    JSON.stringify(pitchDeckData),
  ]);

  console.log('[Migration] Public sample showcase migrated and seeded successfully.');
};

// Execute if run directly
if (process.argv[1]?.endsWith('migrate-public-samples.js')) {
  migratePublicSamples()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Migration Error]:', err);
      process.exit(1);
    });
}
