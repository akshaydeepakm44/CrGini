import { query } from './postgres.js';
import { seedFinkrShowcase } from './seedFinkr.js';

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

    // 6. Ensure payments table has gateway tracking columns
    try {
      await query(`
        ALTER TABLE payments 
        ADD COLUMN IF NOT EXISTS gateway VARCHAR(50) DEFAULT 'MANUAL';
      `);
      await query(`
        ALTER TABLE payments 
        ADD COLUMN IF NOT EXISTS gateway_order_id VARCHAR(255);
      `);
      await query(`
        ALTER TABLE payments 
        ADD COLUMN IF NOT EXISTS gateway_payment_id VARCHAR(255);
      `);
      await query(`
        ALTER TABLE payments 
        ADD COLUMN IF NOT EXISTS gateway_signature VARCHAR(500);
      `);
      await query(`
        ALTER TABLE payments 
        ADD COLUMN IF NOT EXISTS metadata JSONB;
      `);
      await query(`
        CREATE INDEX IF NOT EXISTS idx_payments_gateway_order ON payments (gateway_order_id);
      `);
    } catch (ePay) {
      console.warn('[Schema] payments gateway columns step note:', ePay.message);
    }

    // 7. Comprehensive Performance Indexes to prevent sequential table scans under load
    try {
      await query(`
        -- Requests / Tickets Lookup Indexes
        CREATE INDEX IF NOT EXISTS idx_requests_company_id ON requests(company_id);
        CREATE INDEX IF NOT EXISTS idx_requests_assigned_to ON requests(assigned_to);
        CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
        CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_requests_service_type ON requests(service_type);

        -- Chat & Conversation Lookup Indexes (Optimizes 4s polling)
        CREATE INDEX IF NOT EXISTS idx_messages_request_id ON messages(request_id);
        CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

        -- Submissions & Deliverables
        CREATE INDEX IF NOT EXISTS idx_submissions_request_id ON submissions(request_id);
        CREATE INDEX IF NOT EXISTS idx_submission_files_submission_id ON submission_files(submission_id);
        CREATE INDEX IF NOT EXISTS idx_request_deliverables_request_id ON request_deliverables(request_id);
        CREATE INDEX IF NOT EXISTS idx_request_attachments_request_id ON request_attachments(request_id);

        -- Payments & Invoices Lookup Indexes
        CREATE INDEX IF NOT EXISTS idx_payments_company_id ON payments(company_id);
        CREATE INDEX IF NOT EXISTS idx_payments_request_id ON payments(request_id);
        CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

        -- Notifications Fast Unread Filtering
        CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
      `);
      await query('ALTER TABLE company_key_people ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()');
    } catch (eIdx) {
      console.warn('[Schema] performance indexes step note:', eIdx.message);
    }

    // 7. Ensure public_sample_showcases leads JSONB payloads are optimized (strip multi-megabyte base64 strings)
    try {
      await ensureOptimizedProspectPayloads();
    } catch (e6) {
      console.warn('[Schema] ensureOptimizedProspectPayloads step note:', e6.message);
    }

    // 8. Ensure Finkr authentic dossier showcase is synchronized
    try {
      await seedFinkrShowcase();
    } catch (e7) {
      console.warn('[Schema] Finkr seed note:', e7.message);
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
    await query(`ALTER TABLE public_sample_showcases ADD COLUMN IF NOT EXISTS logo_asset_key TEXT`);
    const showcasesRes = await query('SELECT id, slug, company_name, logo_url, logo_asset_key, company_study, leads FROM public_sample_showcases');
    const { uploadFile, isDataUrl } = await import('../services/storageService.js');

    for (const row of showcasesRes.rows) {
      let rowModified = false;
      let leadsModified = false;
      const leads = row.leads || [];

      // 1. Offload inlined company study PDF if present as base64
      if (row.company_study?.pdfFileDataUrl && isDataUrl(row.company_study.pdfFileDataUrl)) {
        try {
          const originalName = row.company_study.pdfFileName || `${row.company_name || 'Company'}_Study.pdf`;
          const uploadRes = await uploadFile({
            dataUrl: row.company_study.pdfFileDataUrl,
            originalName,
            mimeType: row.company_study.pdfMimeType || 'application/pdf',
            prefix: `public-samples/${row.slug}/company-study`,
          });
          const updatedStudy = {
            ...row.company_study,
            pdfAssetKey: uploadRes.objectKey,
            pdfFileName: originalName,
            pdfFileSize: uploadRes.size,
            pdfMimeType: uploadRes.mimeType,
          };
          delete updatedStudy.pdfFileDataUrl;
          await query('UPDATE public_sample_showcases SET company_study = $1, updated_at = NOW() WHERE id = $2', [JSON.stringify(updatedStudy), row.id]);
        } catch (e) {
          console.error(`[ensureOptimizedProspectPayloads] Failed to offload company_study for ${row.slug}:`, e.message);
        }
      }

      // 2. Offload inlined company logo if present as base64
      if (row.logo_url && isDataUrl(row.logo_url)) {
        try {
          const originalName = `${row.slug}_company_logo.png`;
          const uploadRes = await uploadFile({
            dataUrl: row.logo_url,
            originalName,
            mimeType: 'image/png',
            prefix: `public-samples/${row.slug}/logo`,
          });
          await query('UPDATE public_sample_showcases SET logo_asset_key = $1, logo_url = $2, updated_at = NOW() WHERE id = $3', [
            uploadRes.objectKey,
            `/api/samples/${row.slug}/logo`,
            row.id,
          ]);
          rowModified = true;
        } catch (e) {
          console.error(`[ensureOptimizedProspectPayloads] Failed to offload company logo for ${row.slug}:`, e.message);
        }
      }

      // 3. Resolve authentic company logo if placeholder or missing
      if (!row.logo_url || row.logo_url === '/logo.png') {
        let domain = '';
        if (row.slug === 'siift-ai' || row.slug === 'siift') domain = 'siift.ai';
        else if (row.slug === 'data-i2i') domain = 'data-i2i.com';
        else if (row.slug === 'finkr') domain = 'finkr.co.uk';
        else if (row.company_study?.website && typeof row.company_study.website === 'string') {
          domain = row.company_study.website.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0].split('?')[0].trim();
        } else if (row.company_name && typeof row.company_name === 'string') {
          const cleanName = row.company_name.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (cleanName.length >= 3) domain = `${cleanName}.com`;
        }

        if (domain && domain.includes('.')) {
          const resolvedLogo = `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=128`;
          await query('UPDATE public_sample_showcases SET logo_url = $1, updated_at = NOW() WHERE id = $2', [resolvedLogo, row.id]);
          rowModified = true;
          console.log(`[Schema] Resolved company logo for ${row.slug} -> ${resolvedLogo}`);
        }
      }

      for (const lead of leads) {
        const leadId = lead.id || `lead-${Date.now()}`;

        // Clean out legacy fake phone numbers
        if (lead.phone && (lead.phone.includes('555') || lead.phone.includes('234-8900'))) {
          lead.phone = '';
          leadsModified = true;
        }

        // 4. Offload lead study PDF if inlined as base64
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
            leadsModified = true;
          } catch (err) {
            console.error(`[ensureOptimizedProspectPayloads] Failed to offload leadStudyPdf for ${lead.name}:`, err.message);
          }
        }

        // 5. Offload pitch deck PDF if inlined as base64
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
            leadsModified = true;
          } catch (err) {
            console.error(`[ensureOptimizedProspectPayloads] Failed to offload pitchDeckPdf for ${lead.name}:`, err.message);
          }
        }

        // 6. Offload lead logo if inlined as base64
        const leadLogoDataUrl = (lead.logo && isDataUrl(lead.logo)) ? lead.logo : ((lead.companyLogo && isDataUrl(lead.companyLogo)) ? lead.companyLogo : null);
        if (leadLogoDataUrl) {
          try {
            const originalName = `${row.slug}_lead_${leadId}_logo.png`;
            const uploadRes = await uploadFile({
              dataUrl: leadLogoDataUrl,
              originalName,
              mimeType: 'image/png',
              prefix: `public-samples/${row.slug}/leads/${leadId}/logo`,
            });
            lead.logoAssetKey = uploadRes.objectKey;
            lead.logo = `/api/samples/${row.slug}/leads/${leadId}/logo`;
            lead.companyLogo = lead.logo;
            leadsModified = true;
          } catch (err) {
            console.error(`[ensureOptimizedProspectPayloads] Failed to offload logo for ${lead.name}:`, err.message);
          }
        }

        // Clean redundant large URLs if still lingering
        if (lead.pitchDeck?.streamUrl && isDataUrl(lead.pitchDeck.streamUrl)) {
          lead.pitchDeck.streamUrl = `/api/samples/${row.slug}/leads/${leadId}/pitch-deck`;
          leadsModified = true;
        }
        if (lead.pitchDeck?.downloadUrl && isDataUrl(lead.pitchDeck.downloadUrl)) {
          lead.pitchDeck.downloadUrl = `/api/samples/${row.slug}/leads/${leadId}/pitch-deck?download=true`;
          leadsModified = true;
        }
      }

      if (leadsModified) {
        await query('UPDATE public_sample_showcases SET leads = $1, updated_at = NOW() WHERE id = $2', [JSON.stringify(leads), row.id]);
        console.log(`[Schema] Optimized prospect showcase ID ${row.id} (${row.slug}) leads payload.`);
      }
    }
  } catch (err) {
    console.warn('[Schema] ensureOptimizedProspectPayloads warning:', err.message);
  }
}



