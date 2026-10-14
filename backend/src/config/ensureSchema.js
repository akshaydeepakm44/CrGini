import { query } from './postgres.js';

/**
 * Self-healing schema migration to ensure all required tables and columns exist
 * across all database environments (Dev, Test, Staging, Production).
 */
export async function ensureServiceSettingsTable() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS service_channel_settings (
        id VARCHAR(100) PRIMARY KEY,
        channel VARCHAR(100) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        is_channel BOOLEAN NOT NULL DEFAULT FALSE,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Seed default settings if empty
    const countRes = await query('SELECT COUNT(*) AS count FROM service_channel_settings');
    if (parseInt(countRes.rows[0].count, 10) === 0) {
      const defaults = [
        // Channels
        ['channel:boosting', 'boosting', 'BOOSTING Channel', 'Growth, GTM & Content', false, true],
        ['channel:digitalising', 'digitalising', 'DIGITALISING Channel', 'Research, insights and business intelligence', true, true],
        ['channel:design', 'design', 'UI / DESIGN Channel', 'Interface design & UX heuristics', false, true],
        ['channel:development', 'development', 'APP DEVELOPMENT Channel', 'Full-stack web & mobile apps', false, true],
        
        // Boosting services (deactivated in DiziGini architecture)
        ['strategic-planner', 'boosting', 'Strategic Planner', 'Build a focused growth and marketing plan', false, false],
        ['content-creator', 'boosting', 'Content Creator', 'High-impact narrative copy & creative assets', false, false],
        ['devrel', 'boosting', 'DevRel & Technical Advocacy', 'Developer advocacy & community positioning', false, false],
        ['gtm', 'boosting', 'GTM Strategy', 'Launch execution blueprints & traction models', false, false],
        ['ad-creatives', 'boosting', 'Ad Creatives', 'High-converting ad banners & copy angles', false, false],
        ['brand-identity', 'boosting', 'Brand Identity & Positioning', 'Distinctive brand voice & visual guidelines', false, false],

        // Digitalising services (ACTIVE - Core DiziGini Platform)
        ['lead-research', 'digitalising', 'Lead Research', 'Find relevant companies and verified prospect contact intelligence', true, false],
        ['company-study', 'digitalising', 'Company Study', 'Get a structured personal company study & account dossier', true, false],
        ['key-people', 'digitalising', 'Key People Research', 'Identify relevant decision-makers & leadership contacts', true, false],
        ['pitch-support', 'digitalising', 'Pitch Support', 'Pitch support and competitor analysis to win presentations', true, false],

        // Design services (deactivated in DiziGini architecture)
        ['ui-ux-audit', 'design', 'UI/UX Audit', 'Comprehensive usability evaluation & UX heuristics', false, false],
        ['figma-project', 'design', 'Figma Project', 'Figma component systems, mock screens & prototypes', false, false],
        ['redesign-request', 'design', 'Landing Page Redesign', 'Full-page interface transformations & overhauls', false, false],

        // Development services (deactivated in DiziGini architecture)
        ['technical-discovery', 'development', 'Technical Discovery', 'Technical discovery & architecture planning', false, false],
        ['clickable-prototype', 'development', 'Clickable App Prototype', 'Clickable interactive web & mobile prototypes', false, false],
        ['web-app', 'development', 'MVP Development', 'Production-ready web application MVP (POC + V1)', false, false]
      ];

      for (const [id, channel, name, desc, isActive, isChannel] of defaults) {
        await query(
          'INSERT INTO service_channel_settings (id, channel, name, description, is_active, is_channel) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING',
          [id, channel, name, desc, isActive, isChannel]
        );
      }
    }

    // Enforce DiziGini single-focus platform in database: digitalising active, others deactivated
    await query("UPDATE service_channel_settings SET is_active = true WHERE channel = 'digitalising'");
    await query("UPDATE service_channel_settings SET is_active = false WHERE channel IN ('boosting', 'design', 'development')");
    return true;
  } catch (err) {
    console.error('[Schema Warning] ensureServiceSettingsTable error:', err.message);
    return false;
  }
}

/**
 * Self-healing schema migration to ensure all required tables and columns exist
 * across all database environments (Dev, Test, Staging, Production).
 */
export async function ensureSchemaIntegrity() {
  try {
    // 1. Ensure request_deliverables has created_at and delivered_at columns
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS request_deliverables (
          id SERIAL PRIMARY KEY,
          request_id INTEGER NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
          title VARCHAR(500) NOT NULL,
          url TEXT,
          description TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);
      await query(`
        ALTER TABLE request_deliverables 
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
      `);
      await query(`
        ALTER TABLE request_deliverables 
        ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ DEFAULT NOW();
      `);
    } catch (e1) {
      console.warn('[Schema] request_deliverables step note:', e1.message);
    }

    // 2. Ensure request_attachments has created_at column
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS request_attachments (
          id SERIAL PRIMARY KEY,
          request_id INTEGER NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
          name VARCHAR(500) NOT NULL,
          url TEXT NOT NULL,
          size VARCHAR(50),
          type VARCHAR(255),
          uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);
      await query(`
        ALTER TABLE request_attachments 
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
      `);
    } catch (e2) {
      console.warn('[Schema] request_attachments step note:', e2.message);
    }

    // 3. Ensure requests table columns
    try {
      await query(`
        ALTER TABLE requests 
        ADD COLUMN IF NOT EXISTS current_submission_version INTEGER DEFAULT 0;
      `);
      await query(`
        ALTER TABLE requests 
        ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'PENDING';
      `);
      await query(`
        ALTER TABLE requests 
        ADD COLUMN IF NOT EXISTS notes TEXT;
      `);
      await query(`
        ALTER TABLE requests 
        ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2) DEFAULT 0;
      `);
    } catch (e3) {
      console.warn('[Schema] requests columns step note:', e3.message);
    }

    // 4. Ensure company_leads table has logo_url, website and performance index
    try {
      await query(`
        ALTER TABLE company_leads 
        ADD COLUMN IF NOT EXISTS logo_url TEXT;
      `);
      await query(`
        ALTER TABLE company_leads 
        ADD COLUMN IF NOT EXISTS website TEXT;
      `);
      await query(`
        CREATE INDEX IF NOT EXISTS idx_company_leads_company_id ON company_leads (company_id);
      `);
    } catch (e4) {
      console.warn('[Schema] company_leads step note:', e4.message);
    }

    // 5. Ensure service_channel_settings table exists
    await ensureServiceSettingsTable();

    // 6. Ensure public_sample_inquiries table exists for lead unlock requests
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS public_sample_inquiries (
          id SERIAL PRIMARY KEY,
          slug VARCHAR(255) NOT NULL,
          company_name VARCHAR(255),
          sender_name VARCHAR(255),
          sender_email VARCHAR(255) NOT NULL,
          message TEXT,
          status VARCHAR(50) DEFAULT 'NEW',
          super_admin_notified BOOLEAN DEFAULT FALSE,
          app_email_notified BOOLEAN DEFAULT FALSE,
          sender_notified BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);
      await query(`
        ALTER TABLE public_sample_inquiries 
        ADD COLUMN IF NOT EXISTS super_admin_notified BOOLEAN DEFAULT FALSE;
      `);
      await query(`
        ALTER TABLE public_sample_inquiries 
        ADD COLUMN IF NOT EXISTS app_email_notified BOOLEAN DEFAULT FALSE;
      `);
      await query(`
        ALTER TABLE public_sample_inquiries 
        ADD COLUMN IF NOT EXISTS sender_notified BOOLEAN DEFAULT FALSE;
      `);
      await query(`
        CREATE INDEX IF NOT EXISTS idx_public_sample_inquiries_slug ON public_sample_inquiries (slug);
      `);
      await query(`
        CREATE INDEX IF NOT EXISTS idx_public_sample_inquiries_created_at ON public_sample_inquiries (created_at DESC);
      `);
    } catch (e5) {
      console.warn('[Schema] public_sample_inquiries step note:', e5.message);
    }

    // 7. Ensure default Finkr showcase exists in public_sample_showcases
    try {
      await ensureFinkrShowcase();
    } catch (eFinkr) {
      console.warn('[Schema] ensureFinkrShowcase step note:', eFinkr.message);
    }

    // 8. Ensure public_sample_showcases leads JSONB payloads are optimized (strip multi-megabyte base64 strings)
    try {
      await ensureOptimizedProspectPayloads();
    } catch (e6) {
      console.warn('[Schema] ensureOptimizedProspectPayloads step note:', e6.message);
    }

    console.log('[Schema] Database schema integrity verified & updated successfully.');
    return true;
  } catch (err) {
    console.error('[Schema Warning] ensureSchemaIntegrity error:', err.message);
    return false;
  }
}

/**
 * Scans public_sample_showcases table and offloads any heavy inlined base64 PDF payloads
 * to the storage service, replacing them with streaming REST URLs to guarantee fast page loads.
 */
export async function ensureOptimizedProspectPayloads() {
  try {
    const showcasesRes = await query('SELECT id, slug, leads FROM public_sample_showcases');
    const { uploadFile, isDataUrl } = await import('../services/storageService.js');

    for (const row of showcasesRes.rows) {
      let modified = false;
      const leads = row.leads || [];

      for (const lead of leads) {
        const leadId = lead.id || `lead-${Date.now()}`;

        // 1. Offload lead study PDF if inlined as base64
        if (lead.leadStudyPdf && isDataUrl(lead.leadStudyPdf)) {
          try {
            const originalName = lead.leadStudyPdfName || `${(lead.name || 'Lead').replace(/\s+/g, '_')}_Study.pdf`;
            const uploadRes = await uploadFile({
              dataUrl: lead.leadStudyPdf,
              originalName,
              mimeType: 'application/pdf',
              prefix: `public-samples/${row.slug}/leads/${leadId}/lead-study`,
            });
            lead.leadStudyPdfAssetKey = uploadRes.objectKey;
            lead.leadStudyPdf = `/api/samples/${row.slug}/leads/${leadId}/lead-study-pdf`;
            modified = true;
          } catch (err) {
            console.error(`[ensureOptimizedProspectPayloads] Failed to offload leadStudyPdf for ${lead.name}:`, err.message);
          }
        }

        // 2. Offload pitch deck PDF if inlined as base64
        const pitchDataUrl = (lead.pitchDeckPdf && isDataUrl(lead.pitchDeckPdf))
          ? lead.pitchDeckPdf
          : (lead.pitchDeck?.streamUrl && isDataUrl(lead.pitchDeck?.streamUrl))
          ? lead.pitchDeck.streamUrl
          : null;

        if (pitchDataUrl) {
          try {
            const originalName = lead.pitchDeckPdfName || lead.pitchDeck?.fileName || `${(lead.name || 'Lead').replace(/\s+/g, '_')}_Pitch_Deck.pdf`;
            const uploadRes = await uploadFile({
              dataUrl: pitchDataUrl,
              originalName,
              mimeType: 'application/pdf',
              prefix: `public-samples/${row.slug}/leads/${leadId}/pitch-deck`,
            });
            lead.pitchDeckAssetKey = uploadRes.objectKey;
            lead.pitchDeckPdf = `/api/samples/${row.slug}/leads/${leadId}/pitch-deck`;
            if (!lead.pitchDeck) lead.pitchDeck = {};
            lead.pitchDeck.assetKey = uploadRes.objectKey;
            lead.pitchDeck.fileName = originalName;
            lead.pitchDeck.streamUrl = `/api/samples/${row.slug}/leads/${leadId}/pitch-deck`;
            lead.pitchDeck.downloadUrl = `/api/samples/${row.slug}/leads/${leadId}/pitch-deck?download=true`;
            modified = true;
          } catch (err) {
            console.error(`[ensureOptimizedProspectPayloads] Failed to offload pitchDeckPdf for ${lead.name}:`, err.message);
          }
        }

        // Clean redundant large URLs if still lingering
        if (lead.pitchDeck?.streamUrl && isDataUrl(lead.pitchDeck.streamUrl)) {
          lead.pitchDeck.streamUrl = `/api/samples/${row.slug}/leads/${leadId}/pitch-deck`;
          modified = true;
        }
        if (lead.pitchDeck?.downloadUrl && isDataUrl(lead.pitchDeck.downloadUrl)) {
          lead.pitchDeck.downloadUrl = `/api/samples/${row.slug}/leads/${leadId}/pitch-deck?download=true`;
          modified = true;
        }
      }

      if (modified) {
        await query('UPDATE public_sample_showcases SET leads = $1, updated_at = NOW() WHERE id = $2', [JSON.stringify(leads), row.id]);
        console.log(`[Schema] Optimized prospect showcase ID ${row.id} (${row.slug}) leads payload.`);
      }
    }
  } catch (err) {
    console.warn('[Schema] ensureOptimizedProspectPayloads warning:', err.message);
  }
}

/**
 * Ensures the default Finkr showcase row exists in public_sample_showcases
 * matching the Image 2 briefing presentation.
 */
export async function ensureFinkrShowcase() {
  try {
    const existing = await query("SELECT id FROM public_sample_showcases WHERE slug = 'finkr' LIMIT 1");
    if (existing.rows && existing.rows.length > 0) {
      return;
    }

    const companyStudy = {
      company: 'Finkr',
      industry: 'Fintech & Embedded Financial Infrastructure',
      overviewTitle: 'B2B financial infrastructure for modern businesses',
      businessOverview: 'Finkr provides embedded finance solutions, focusing on seamless payment and banking infrastructure for digital-first companies.',
      marketTitle: 'Growing segment with strong momentum',
      marketPosition: 'Finkr is positioned in the fast-growing embedded finance market, competing with established players like Stripe, Marqeta and Kontent.',
      opportunitiesTitle: 'Expansion in European markets and verticals',
      keyObservations: 'There are opportunities in cross-border payments, new verticals (eCommerce, SaaS) and deeper product integrations with fintech partners.',
      focusTitle: 'Enterprise partnerships and product expansion',
      potentialOpportunity: 'Focus on strategic partnerships and integrated solutions to increase wallet share and enter new markets.',
      hasPdf: true,
      pdfUrl: '/api/samples/finkr/company-study-pdf',
      pdfFileName: 'Finkr - Company Study.pdf',
    };

    const leads = [
      {
        id: 'lead-finkr-1',
        name: 'Wearemarmalade',
        title: 'Key Executive',
        company: 'Finkr',
        whySuitsBest: 'Leads product strategy and growth initiatives. Relevant to your business based on their role, company focus and recent activity.',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=180&auto=format&fit=crop&q=80',
        linkedinUrl: 'https://linkedin.com',
        companyUrl: 'https://finkr.com',
        whyItMatters: [
          'Leads product and platform strategy',
          'Focused on growth and partnerships',
          'Active in embedded finance ecosystem'
        ],
        tags: ['Verified role', 'Public sources'],
        isUnlocked: true,
      },
      {
        id: 'lead-finkr-2',
        name: 'Daniel Carter',
        title: 'Co-Founder & CEO',
        company: 'Finkr',
        tags: ['Founders', 'Product'],
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=180&auto=format&fit=crop&q=80',
        isUnlocked: false,
      },
      {
        id: 'lead-finkr-3',
        name: 'Sophie Martin',
        title: 'Head of Partnerships',
        company: 'Finkr',
        tags: ['Partnerships', 'Growth'],
        avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=180&auto=format&fit=crop&q=80',
        isUnlocked: false,
      },
      {
        id: 'lead-finkr-4',
        name: 'James Ellison',
        title: 'VP Engineering',
        company: 'Finkr',
        tags: ['Engineering', 'Product'],
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=180&auto=format&fit=crop&q=80',
        isUnlocked: false,
      },
      {
        id: 'lead-finkr-5',
        name: 'Priya Nair',
        title: 'Head of Marketing',
        company: 'Finkr',
        tags: ['Marketing', 'Brand'],
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=180&auto=format&fit=crop&q=80',
        isUnlocked: false,
      }
    ];

    await query(
      `
        INSERT INTO public_sample_showcases (
          slug, title, company_name, description, status, company_study, leads, published_at, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), NOW())
      `,
      [
        'finkr',
        'Finkr’s next growth opportunities, explored.',
        'Finkr',
        'Get a tailored view of your market position, key decision-makers, and strategic opportunities — all backed by real-time research and AI-powered insights.',
        'PUBLISHED',
        JSON.stringify(companyStudy),
        JSON.stringify(leads),
      ]
    );
    console.log('[Schema] Seeded default Finkr showcase matching Image 2.');
  } catch (err) {
    console.warn('[Schema] ensureFinkrShowcase notice:', err.message);
  }
}


