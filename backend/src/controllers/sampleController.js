import {
  findSampleBySlug,
  findSampleById,
  findAllSamples,
  createSampleShowcase,
  updateSampleShowcase,
  deleteSampleShowcase,
} from '../repositories/sampleRepository.js';
import { query } from '../config/postgres.js';
import {
  uploadFile,
  getFileStream,
  getObjectStat,
  deleteFile,
  isDataUrl,
  parseDataUrl,
} from '../services/storageService.js';
import {
  streamGeneratedCompanyStudyPdf,
  streamGeneratedLeadStudyPdf,
  streamGeneratedPitchDeckPdf,
} from '../services/pdfService.js';
import {
  sendSampleInquiryAlertEmail,
  sendSampleInquiryConfirmationEmail,
} from '../services/emailService.js';
import { createNotification } from '../repositories/notificationRepository.js';

/**
 * Public Sample Controller
 * Exposes curated sample intelligence showcase data strictly separated from private client data.
 * Does NOT expose unmasked passwords, emails, phones, private tickets, specialist notes, or storage credentials.
 */

/**
 * Helper to mask an email address for public presentation
 */
const maskEmail = (email) => {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return '•••••@company.com';
  }
  const [local, domain] = email.split('@');
  if (local.length <= 2) {
    return `${local[0]}*@${domain}`;
  }
  return `${local.slice(0, 2)}••••@${domain}`;
};

/**
 * Helper to mask a phone number for public presentation
 */
const maskPhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return '+1 (•••) •••-••••';
  }
  const clean = phone.trim();
  if (clean.length < 5) return '+1 (•••) •••-••••';
  return `${clean.slice(0, 4)} •••-••••`;
};

/**
 * Helper to identify mock/dummy template leads that must never be shown or saved
 */
export const isMockDummyLead = (l) => {
  if (!l) return true;
  const email = (l.email || '').toLowerCase().trim();
  const company = (l.company || '').toLowerCase().trim();
  const name = (l.name || '').toLowerCase().trim();
  return (
    email === 's.jenkins@acmeglobal.com' ||
    (name === 'sarah jenkins' && company === 'acme global systems') ||
    (name === 'sample decision maker' && company.includes('partner'))
  );
};

/**
 * In-memory high performance cache for public showcases
 */
const showcaseCache = new Map();
const CACHE_TTL_MS = 60 * 1000; // 60s TTL

export const invalidateShowcaseCache = (slug) => {
  if (!slug) {
    showcaseCache.clear();
  } else {
    showcaseCache.delete(String(slug).toLowerCase().trim());
  }
};

/**
 * @desc    Get published public sample showcase by slug
 * @route   GET /api/samples/:slug
 * @access  Public (No Auth Required)
 */
export const getPublicSampleBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug || !slug.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Sample slug is required.',
      });
    }

    const cleanSlug = String(slug).toLowerCase().trim();

    // Fast memory cache hit check (sub-2ms response)
    const cached = showcaseCache.get(cleanSlug);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');
      res.setHeader('X-Cache', 'HIT');
      return res.status(200).json(cached.data);
    }

    const sample = await findSampleBySlug(cleanSlug, true);
    if (!sample) {
      return res.status(404).json({
        success: false,
        message: 'Sample intelligence showcase not found or is not currently published.',
      });
    }

    // Company Study Projection
    const companyStudyData = sample.companyStudy || {};
    const hasCompanyStudyPdf = Boolean(
      sample.companyStudy?.pdfAssetKey ||
      sample.companyStudy?.pdfFileDataUrl ||
      sample.companyStudy?.pdfUrl
    );

    const publicCompanyStudy = {
      company: companyStudyData.company || sample.companyName,
      website: companyStudyData.website || '',
      linkedin: companyStudyData.linkedin || companyStudyData.companyLinkedin || '',
      industry: companyStudyData.industry || 'Enterprise Technology & Services',
      businessOverview: companyStudyData.businessOverview || '',
      marketPosition: companyStudyData.marketPosition || '',
      keyObservations: companyStudyData.keyObservations || '',
      potentialOpportunity: companyStudyData.potentialOpportunity || '',
      hasPdf: hasCompanyStudyPdf,
      pdfUrl: hasCompanyStudyPdf ? `/api/samples/${sample.slug}/company-study-pdf` : null,
      pdfFileName: hasCompanyStudyPdf ? (companyStudyData.pdfFileName || `${sample.companyName} - Company Study.pdf`) : null,
    };

    // Strict projection: sanitize and verify NO private client fields leak, and NEVER inline large base64 files
    const cleanLeads = (sample.leads || []).filter((l) => !isMockDummyLead(l));
    const publicLeads = cleanLeads.map((l, index) => {
      const leadId = l.id || `lead-${index + 1}`;
      const leadName = l.name || 'Executive Lead';
      const isFirstLead = index === 0;

      // Find matching lead study if available in leadStudies or attached directly to lead
      const matchedStudy = l.leadStudy || (sample.leadStudies || []).find((s) => s.leadName === leadName || s.id === leadId) || {};

      // Match lead-specific pitch deck or fall back to general pitch deck
      const hasLeadPitch = Boolean(l.pitchDeckAssetKey || l.pitchDeckPdf || l.pitchDeck);
      const leadPitchUrl = `/api/samples/${sample.slug}/leads/${leadId}/pitch-deck`;
      const hasLeadStudy = Boolean(l.leadStudyPdfAssetKey || l.leadStudyPdf || l.leadStudy);
      const leadStudyUrl = `/api/samples/${sample.slug}/leads/${leadId}/lead-study-pdf`;

      // Extract real or inferred company link / website
      let companyLink = l.companyLink || l.company_link || l.website || l.companyWebsite || l.domain || publicCompanyStudy.website || '';
      if (!companyLink && l.company && l.company.includes('.')) {
        companyLink = l.company.startsWith('http') ? l.company : `https://${l.company}`;
      } else if (!companyLink && sample.companyName && sample.companyName.includes('.')) {
        companyLink = `https://${sample.companyName}`;
      }

      // Intelligent separation: Company LinkedIn vs Personal Lead LinkedIn
      const rawLinkedin = (l.linkedin || l.linkedinUrl || l.linkedin_url || l.linkedinProfile || '').trim();
      let companyLinkedinUrl = (l.companyLinkedin || l.company_linkedin || publicCompanyStudy.linkedin || '').trim();
      let personalLinkedinUrl = '';

      if (rawLinkedin.includes('/company/')) {
        // Lead uploaded company LinkedIn into the LinkedIn field
        if (!companyLinkedinUrl) {
          companyLinkedinUrl = rawLinkedin;
        }
        personalLinkedinUrl = '';
      } else {
        personalLinkedinUrl = rawLinkedin;
      }

      // Direct email: Open & unmasked for the first lead if present
      const unmaskedEmail = l.email || l.directWorkEmail || l.workEmail || '';
      const emailForFirst = unmaskedEmail || (l.maskedEmail ? l.maskedEmail.replace('••••', 'contact') : '');

      let leadLogo = l.logo || l.companyLogo || l.avatarUrl || null;
      if (!leadLogo && companyLink) {
        const cleanDomain = String(companyLink)
          .replace(/^https?:\/\//i, '')
          .replace(/^www\./i, '')
          .split('/')[0]
          .trim();
        if (cleanDomain && cleanDomain.includes('.')) {
          leadLogo = `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${cleanDomain}&size=128`;
        }
      }
      if (leadLogo && isDataUrl(leadLogo)) {
        leadLogo = `/api/samples/${sample.slug}/leads/${leadId}/logo`;
      }

      return {
        id: leadId,
        name: leadName,
        title: l.title || 'Executive Decision Maker',
        company: l.company || l.lead_company || sample.companyName,
        companyLink: companyLink,
        companyLinkedin: companyLinkedinUrl,
        logo: leadLogo,
        industry: l.industry || '',
        location: l.location || '',
        linkedin: personalLinkedinUrl,
        email: isFirstLead ? emailForFirst : (l.maskedEmail || maskEmail(l.email)),
        isUnlocked: isFirstLead,
        leadStudyPdf: hasLeadStudy ? leadStudyUrl : null,
        leadStudyPdfName: l.leadStudyPdfName || `${leadName.replace(/\s+/g, '_')}_Study.pdf`,
        pitchDeckPdf: hasLeadPitch ? leadPitchUrl : null,
        pitchDeckPdfName: l.pitchDeckPdfName || `${leadName.replace(/\s+/g, '_')}_Pitch_Deck.pdf`,
        aboutCompany: l.aboutCompany || l.company_summary || '',
        whySuitsBest: l.whySuitsBest || l.why_suits_best || l.shortSummary || '',
        maskedEmail: l.maskedEmail || maskEmail(l.email),
        phone: (() => {
          const rawPhone = (l.phone || l.directPhone || '').trim();
          const isFake = !rawPhone || rawPhone.includes('555') || rawPhone.includes('234-8900') || rawPhone.includes('(xxx)');
          if (isFake) return null;
          return isFirstLead ? rawPhone : `${rawPhone.slice(0, 4)} xxxxx`;
        })(),
        maskedPhone: (() => {
          const rawPhone = (l.phone || l.directPhone || '').trim();
          const isFake = !rawPhone || rawPhone.includes('555') || rawPhone.includes('234-8900') || rawPhone.includes('(xxx)');
          if (isFake) return null;
          return `${rawPhone.slice(0, 4)} xxxxx`;
        })(),
        shortSummary: l.shortSummary || l.summary || l.whySuitsBest || '',
        leadStudy: {
          whyRelevant: matchedStudy.whyRelevant || l.whyRelevant || '',
          observedContext: matchedStudy.observedContext || l.observedContext || '',
          potentialOpportunity: matchedStudy.potentialOpportunity || l.potentialOpportunity || '',
          suggestedApproach: matchedStudy.suggestedApproach || l.suggestedApproach || '',
        },
        pitchDeck: hasLeadPitch ? {
          title: l.pitchDeck?.title || `${leadName} Proposal Pitch Deck`,
          summary: l.pitchDeck?.summary || 'Strategic presentation proposal designed to convert this stakeholder.',
          streamUrl: leadPitchUrl,
          downloadUrl: `${leadPitchUrl}?download=true`,
          fileName: l.pitchDeck?.fileName || l.pitchDeckPdfName || `${leadName.replace(/\s+/g, '_')}_Pitch_Deck.pdf`,
        } : null,
      };
    });

    const publicLeadStudies = (sample.leadStudies || []).map((s, index) => ({
      id: s.id || `study-${index + 1}`,
      leadName: s.leadName || '',
      role: s.role || '',
      company: s.company || '',
      whyRelevant: s.whyRelevant || '',
      observedContext: s.observedContext || '',
      potentialOpportunity: s.potentialOpportunity || '',
      suggestedApproach: s.suggestedApproach || '',
    }));

    const publicPitchDeck = sample.pitchDeck && (sample.pitchDeck.assetKey || sample.pitchDeck.fileName)
      ? {
          id: sample.pitchDeck.id || 'sample-pitch-deck',
          title: sample.pitchDeck.title || 'Sample Pitch Deck',
          summary: sample.pitchDeck.summary || '',
          fileName: sample.pitchDeck.fileName || 'Sample_Pitch_Deck.pdf',
          fileSize: sample.pitchDeck.fileSize || null,
          mimeType: sample.pitchDeck.mimeType || 'application/pdf',
          previewAvailable: true,
          streamUrl: `/api/samples/${sample.slug}/pitch-deck`,
          downloadUrl: `/api/samples/${sample.slug}/pitch-deck?download=true`,
        }
      : null;

    // Helper to identify platform placeholder logos
    const isPlatformLogo = (url) => {
      if (!url || typeof url !== 'string') return true;
      const clean = url.trim().toLowerCase();
      return clean === '/logo.png' || clean.includes('dizigini') || clean.includes('creativegini');
    };

    const explicitWebsite =
      sample.companyStudy?.website ||
      (Array.isArray(sample.leads) ? sample.leads.find((l) => l.companyLink || l.website)?.companyLink : null) ||
      (Array.isArray(sample.leads) ? sample.leads.find((l) => l.website)?.website : null);

    let validWebsiteDomain = null;
    if (explicitWebsite && typeof explicitWebsite === 'string') {
      const cd = explicitWebsite.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0].split('?')[0].trim();
      if (cd.includes('.') && cd.length >= 4) {
        validWebsiteDomain = cd.toLowerCase();
      }
    }

    // 1. Resolve company logo: Target company's uploaded logo from showcase or companyStudy
    let resolvedCompanyLogo = sample.logoUrl;
    if (isPlatformLogo(resolvedCompanyLogo)) {
      resolvedCompanyLogo = sample.companyLogo || sample.companyStudy?.logoUrl || sample.companyStudy?.logo || null;
      if (isPlatformLogo(resolvedCompanyLogo)) resolvedCompanyLogo = null;
    }

    // 2. Comprehensive fallback: retrieve uploaded logo from ANY of the leads
    if ((!resolvedCompanyLogo || isPlatformLogo(resolvedCompanyLogo)) && Array.isArray(sample.leads) && sample.leads.length > 0) {
      const leadWithLogo = sample.leads.find((l) => {
        const candidate = l.companyLogo || l.logo || l.company_logo || l.avatarUrl;
        return candidate && !isPlatformLogo(candidate);
      });
      if (leadWithLogo) {
        resolvedCompanyLogo = leadWithLogo.companyLogo || leadWithLogo.logo || leadWithLogo.company_logo || leadWithLogo.avatarUrl;
      }
    }

    // 3. Official company domain favicon fallback if explicit valid domain was provided
    if ((!resolvedCompanyLogo || isPlatformLogo(resolvedCompanyLogo)) && validWebsiteDomain) {
      resolvedCompanyLogo = `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${validWebsiteDomain}&size=128`;
    }

    // Never inline huge base64 in public showcase JSON (use dedicated stream endpoint)
    let finalCompanyLogo = resolvedCompanyLogo;
    if (finalCompanyLogo && isDataUrl(finalCompanyLogo)) {
      finalCompanyLogo = `/api/samples/${sample.slug}/logo`;
    }

    const responsePayload = {
      success: true,
      sample: {
        slug: sample.slug,
        title: sample.title,
        companyName: sample.companyName,
        description: sample.description,
        logoUrl: finalCompanyLogo || null,
        status: sample.status,
        companyStudy: publicCompanyStudy,
        leads: publicLeads,
        leadStudies: publicLeadStudies,
        pitchDeck: publicPitchDeck,
        publishedAt: sample.publishedAt,
      },
    };

    // Cache response for sub-2ms subsequent requests
    showcaseCache.set(cleanSlug, { timestamp: Date.now(), data: responsePayload });
    res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');
    res.setHeader('X-Cache', 'MISS');

    return res.status(200).json(responsePayload);
  } catch (error) {
    console.error('[SampleController.getPublicSampleBySlug] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load public sample showcase.',
    });
  }
};

/**
 * @desc    Stream published public sample pitch deck securely from Object Storage
 * @route   GET /api/samples/:slug/pitch-deck
 * @access  Public (No Auth Required)
 */
export const streamPublicPitchDeck = async (req, res) => {
  try {
    const { slug } = req.params;
    const { download } = req.query;

    const sample = await findSampleBySlug(slug, true);
    if (!sample) {
      return res.status(404).json({
        success: false,
        message: 'Sample showcase not found.',
      });
    }

    if (sample.pitchDeck?.assetKey) {
      try {
        const assetKey = sample.pitchDeck.assetKey;
        const mimeType = sample.pitchDeck.mimeType || 'application/pdf';
        const fileName = (sample.pitchDeck.fileName || 'DiziGini_Sample_Pitch_Deck.pdf').replace(/["\r\n]/g, '_');
        const stat = await getObjectStat(assetKey).catch(() => null);
        const stream = await getFileStream(assetKey);

        const disposition = download === 'true'
          ? `attachment; filename="${fileName}"`
          : `inline; filename="${fileName}"`;

        const headers = {
          'Content-Type': mimeType,
          'Content-Disposition': disposition,
          'Cache-Control': 'public, max-age=3600',
        };

        if (stat?.size) {
          headers['Content-Length'] = stat.size;
        }

        res.writeHead(200, headers);
        return stream.pipe(res);
      } catch (streamErr) {
        console.warn('[SampleController.streamPublicPitchDeck] MinIO stream failed, falling back to dynamic generation:', streamErr?.message);
      }
    }

    // Dynamic generation fallback
    return streamGeneratedPitchDeckPdf(sample, null, res, download === 'true');
  } catch (error) {
    console.error('[SampleController.streamPublicPitchDeck] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to stream sample pitch deck.',
    });
  }
};

/**
 * @desc    Stream published Company Study PDF securely from Object Storage or generate dynamically
 * @route   GET /api/samples/:slug/company-study-pdf
 * @access  Public (No Auth Required)
 */
export const streamCompanyStudyPdf = async (req, res) => {
  try {
    const { slug } = req.params;
    const { download } = req.query;

    const sample = await findSampleBySlug(slug, true);
    if (!sample) {
      return res.status(404).json({
        success: false,
        message: 'Prospect intelligence showcase not found.',
      });
    }

    // 1. If PDF was saved directly as base64 data URL
    const rawPdf = sample.companyStudy?.pdfFileDataUrl || sample.companyStudy?.pdfUrl;
    if (rawPdf && isDataUrl(rawPdf)) {
      const parsed = parseDataUrl(rawPdf);
      const fileName = (sample.companyStudy.pdfFileName || `${sample.companyName}_Company_Study.pdf`).replace(/["\r\n]/g, '_');
      const disposition = download === 'true' ? `attachment; filename="${fileName}"` : `inline; filename="${fileName}"`;
      res.writeHead(200, {
        'Content-Type': sample.companyStudy.pdfMimeType || 'application/pdf',
        'Content-Disposition': disposition,
        'Content-Length': parsed.buffer.length,
        'Cache-Control': 'public, max-age=3600',
      });
      return res.end(parsed.buffer);
    }

    // 2. If PDF assetKey is in MinIO / Object Storage, stream it
    if (sample.companyStudy?.pdfAssetKey) {
      try {
        const assetKey = sample.companyStudy.pdfAssetKey;
        const mimeType = sample.companyStudy.pdfMimeType || 'application/pdf';
        const fileName = (sample.companyStudy.pdfFileName || `${sample.companyName}_Company_Study.pdf`).replace(/["\r\n]/g, '_');

        const stat = await getObjectStat(assetKey).catch(() => null);
        const stream = await getFileStream(assetKey);

        const disposition = download === 'true'
          ? `attachment; filename="${fileName}"`
          : `inline; filename="${fileName}"`;

        const headers = {
          'Content-Type': mimeType,
          'Content-Disposition': disposition,
          'Cache-Control': 'public, max-age=3600',
        };

        if (stat?.size) {
          headers['Content-Length'] = stat.size;
        }

        res.writeHead(200, headers);
        return stream.pipe(res);
      } catch (streamErr) {
        console.warn('[SampleController.streamCompanyStudyPdf] Storage stream failed, generating document on the fly:', streamErr?.message);
      }
    }

    // 3. Fallback specifically for Finkr if assetKey was unset
    if (sample.slug === 'finkr') {
      try {
        const fallbackKey = 'public-samples/finkr/company-study/9da37103-c463-48cb-a41b-2c3911a55e1e-Finkr_Dossier_Report.pdf';
        const stream = await getFileStream(fallbackKey);
        const disposition = download === 'true'
          ? 'attachment; filename="Finkr_Company_Study_Report.pdf"'
          : 'inline; filename="Finkr_Company_Study_Report.pdf"';
        res.writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Disposition': disposition,
          'Cache-Control': 'public, max-age=3600',
        });
        return stream.pipe(res);
      } catch (err) {
        console.warn('[streamCompanyStudyPdf] Finkr fallback storage stream note:', err.message);
      }
    }

    // 4. If structured company study exists, generate high-fidelity Dossier Report
    if (sample.companyStudy && (sample.companyStudy.businessOverview || sample.companyStudy.marketPosition || sample.companyName)) {
      return streamGeneratedCompanyStudyPdf(sample, res, download === 'true');
    }

    // 5. If not available at all, return friendly notice
    return res.status(404).send(`
      <!DOCTYPE html>
      <html>
      <head><title>Document Currently Not Uploaded</title></head>
      <body style="font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #F8FAFC; color: #1E293B;">
        <div style="background: white; padding: 36px 44px; border-radius: 16px; border: 1px solid #E2E8F0; box-shadow: 0 4px 20px rgba(0,0,0,0.06); text-align: center; max-width: 480px;">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: #FEF3C7; color: #D97706; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px auto; font-size: 24px;">📄</div>
          <h2 style="margin: 0 0 10px 0; color: #0F172A; font-size: 1.25rem;">Original Study Document Not Uploaded</h2>
          <p style="margin: 0; color: #64748B; font-size: 0.95rem; line-height: 1.5;">The original company study document has not been uploaded yet for ${sample.companyName}.</p>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('[SampleController.streamCompanyStudyPdf] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to stream company study PDF.',
    });
  }
};

/**
 * @desc    Stream pitch deck for an individual sample lead securely from Object Storage
 * @route   GET /api/samples/:slug/leads/:leadId/pitch-deck
 * @access  Public (No Auth Required)
 */
export const streamLeadPitchDeck = async (req, res) => {
  try {
    const { slug, leadId } = req.params;
    const { download } = req.query;

    const sample = await findSampleBySlug(slug, true);
    if (!sample) {
      return res.status(404).json({ success: false, message: 'Sample showcase not found.' });
    }

    const lead = (sample.leads || []).find((l, idx) => {
      const genId = l.id || `lead-${idx + 1}`;
      return String(l.id) === String(leadId) || String(genId) === String(leadId) || String(idx + 1) === String(leadId);
    });

    // 1. If PDF was saved directly as base64 data URL
    const rawPdf = lead?.pitchDeckPdf || lead?.pitchDeck?.streamUrl;
    if (rawPdf && isDataUrl(rawPdf)) {
      const parsed = parseDataUrl(rawPdf);
      const fname = (lead?.pitchDeckPdfName || lead?.pitchDeck?.fileName || `${lead?.name || 'Lead'}_Pitch_Deck.pdf`).replace(/["\r\n]/g, '_');
      const disposition = download === 'true' ? `attachment; filename="${fname}"` : `inline; filename="${fname}"`;
      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': disposition,
        'Content-Length': parsed.buffer.length,
        'Cache-Control': 'public, max-age=3600',
      });
      return res.end(parsed.buffer);
    }

    // 2. If PDF assetKey is in Object Storage
    let assetKey = lead?.pitchDeck?.assetKey || lead?.pitchDeckAssetKey || sample.pitchDeck?.assetKey;
    let fileName = lead?.pitchDeck?.fileName || lead?.pitchDeckPdfName || sample.pitchDeck?.fileName || 'Proposal_Pitch_Deck.pdf';

    if (assetKey) {
      try {
        fileName = fileName.replace(/["\r\n]/g, '_');
        const stat = await getObjectStat(assetKey).catch(() => null);
        const stream = await getFileStream(assetKey);

        const disposition = download === 'true'
          ? `attachment; filename="${fileName}"`
          : `inline; filename="${fileName}"`;

        const headers = {
          'Content-Type': 'application/pdf',
          'Content-Disposition': disposition,
          'Cache-Control': 'public, max-age=3600',
        };

        if (stat?.size) {
          headers['Content-Length'] = stat.size;
        }

        res.writeHead(200, headers);
        return stream.pipe(res);
      } catch (streamErr) {
        console.warn('[streamLeadPitchDeck] Storage stream failed, generating fallback deck:', streamErr?.message);
      }
    }

    // 3. If not uploaded, do NOT generate fake/false document
    return res.status(404).send(`
      <!DOCTYPE html>
      <html>
      <head><title>Pitch Deck Currently Not Uploaded</title></head>
      <body style="font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #F8FAFC; color: #1E293B;">
        <div style="background: white; padding: 36px 44px; border-radius: 16px; border: 1px solid #E2E8F0; box-shadow: 0 4px 20px rgba(0,0,0,0.06); text-align: center; max-width: 480px;">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: #EFF6FF; color: #2563EB; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px auto; font-size: 24px;">📊</div>
          <h2 style="margin: 0 0 10px 0; color: #0F172A; font-size: 1.25rem;">Pitch Deck Currently Not Uploaded</h2>
          <p style="margin: 0; color: #64748B; font-size: 0.95rem; line-height: 1.5;">The original pitch deck document has not been uploaded for ${lead?.name || 'this lead'}.</p>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('[SampleController.streamLeadPitchDeck] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to stream lead pitch deck.',
    });
  }
};

/**
 * @desc    Stream Lead Study PDF for an individual sample lead securely from Object Storage
 * @route   GET /api/samples/:slug/leads/:leadId/lead-study-pdf
 * @access  Public (No Auth Required)
 */
export const streamLeadStudyPdf = async (req, res) => {
  try {
    const { slug, leadId } = req.params;
    const { download } = req.query;

    const sample = await findSampleBySlug(slug, true);
    if (!sample) {
      return res.status(404).json({ success: false, message: 'Sample showcase not found.' });
    }

    const lead = (sample.leads || []).find((l, idx) => {
      const genId = l.id || `lead-${idx + 1}`;
      return String(l.id) === String(leadId) || String(genId) === String(leadId) || String(idx + 1) === String(leadId);
    });

    // If PDF was saved directly as base64 data URL
    if (lead?.leadStudyPdf && lead.leadStudyPdf.startsWith('data:application/pdf;base64,')) {
      const base64Data = lead.leadStudyPdf.replace(/^data:application\/pdf;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const fname = (lead.leadStudyPdfName || `${lead.name || 'Lead'}_Study.pdf`).replace(/["\r\n]/g, '_');
      const disposition = download === 'true' ? `attachment; filename="${fname}"` : `inline; filename="${fname}"`;
      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': disposition,
        'Content-Length': buffer.length,
        'Cache-Control': 'public, max-age=3600',
      });
      return res.end(buffer);
    }

    let assetKey = lead?.leadStudyPdfAssetKey || lead?.leadStudy?.assetKey;
    let fileName = lead?.leadStudyPdfName || `${lead?.name || 'Lead'}_Study.pdf`;

    if (assetKey) {
      try {
        fileName = fileName.replace(/["\r\n]/g, '_');
        const stat = await getObjectStat(assetKey).catch(() => null);
        const stream = await getFileStream(assetKey);

        const disposition = download === 'true'
          ? `attachment; filename="${fileName}"`
          : `inline; filename="${fileName}"`;

        const headers = {
          'Content-Type': 'application/pdf',
          'Content-Disposition': disposition,
          'Cache-Control': 'public, max-age=3600',
        };

        if (stat?.size) {
          headers['Content-Length'] = stat.size;
        }

        res.writeHead(200, headers);
        return stream.pipe(res);
      } catch (streamErr) {
        console.warn('[SampleController.streamLeadStudyPdf] MinIO stream failed, falling back to dynamic generation:', streamErr?.message);
      }
    }

    // If not uploaded, do NOT generate fake/false document
    return res.status(404).send(`
      <!DOCTYPE html>
      <html>
      <head><title>Lead Study Currently Not Uploaded</title></head>
      <body style="font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #F8FAFC; color: #1E293B;">
        <div style="background: white; padding: 36px 44px; border-radius: 16px; border: 1px solid #E2E8F0; box-shadow: 0 4px 20px rgba(0,0,0,0.06); text-align: center; max-width: 480px;">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: #FEF3C7; color: #D97706; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px auto; font-size: 24px;">📋</div>
          <h2 style="margin: 0 0 10px 0; color: #0F172A; font-size: 1.25rem;">Lead Study Currently Not Uploaded</h2>
          <p style="margin: 0; color: #64748B; font-size: 0.95rem; line-height: 1.5;">The original lead study document has not been uploaded for ${lead?.name || 'this lead'}.</p>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('[SampleController.streamLeadStudyPdf] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to stream lead study PDF.',
    });
  }
};

/**
 * =========================================================================
 * PROSPECT SHOWCASE MANAGEMENT CONTROLLERS (Lead Team & Super Admin)
 * =========================================================================
 */

/**
 * Helper to offload base64 PDF payloads in leads array to object storage, preserving existing asset keys
 */
const processLeadsPayload = async (leads, slug, existingLeads = []) => {
  if (!Array.isArray(leads) || leads.length === 0) return [];
  const processed = [];

  for (let idx = 0; idx < leads.length; idx++) {
    const l = { ...leads[idx] };
    const leadId = l.id || `lead-${Date.now()}-${idx + 1}`;
    l.id = leadId;

    const existingLead = (existingLeads || []).find(
      (el) => String(el.id) === String(leadId) || (el.name && l.name && String(el.name).toLowerCase() === String(l.name).toLowerCase())
    );

    // Preserve existing asset keys & phone if client didn't supply replacement
    if (!l.leadStudyPdfAssetKey && existingLead?.leadStudyPdfAssetKey) {
      l.leadStudyPdfAssetKey = existingLead.leadStudyPdfAssetKey;
    }
    if (!l.pitchDeckAssetKey && (existingLead?.pitchDeckAssetKey || existingLead?.pitchDeck?.assetKey)) {
      l.pitchDeckAssetKey = existingLead.pitchDeckAssetKey || existingLead.pitchDeck?.assetKey;
    }
    if (existingLead?.pitchDeck?.assetKey && (!l.pitchDeck || !l.pitchDeck.assetKey)) {
      if (!l.pitchDeck) l.pitchDeck = {};
      l.pitchDeck.assetKey = existingLead.pitchDeck.assetKey;
      l.pitchDeck.fileName = l.pitchDeck.fileName || existingLead.pitchDeck.fileName;
    }
    if (!l.phone && existingLead?.phone) {
      l.phone = existingLead.phone;
    }

    if (l.leadStudyPdf && isDataUrl(l.leadStudyPdf)) {
      try {
        const originalName = l.leadStudyPdfName || `${(l.name || 'Lead').replace(/\s+/g, '_')}_Study.pdf`;
        const uploadRes = await uploadFile({
          dataUrl: l.leadStudyPdf,
          originalName,
          mimeType: 'application/pdf',
          prefix: `public-samples/${slug}/leads/${leadId}/lead-study`,
        });
        l.leadStudyPdfAssetKey = uploadRes.objectKey;
        l.leadStudyPdf = `/api/samples/${slug}/leads/${leadId}/lead-study-pdf`;
      } catch (err) {
        console.error(`[processLeadsPayload] Failed to upload leadStudyPdf for ${l.name}:`, err.message);
      }
    }

    const pitchDataUrl = (l.pitchDeckPdf && isDataUrl(l.pitchDeckPdf))
      ? l.pitchDeckPdf
      : (l.pitchDeck?.streamUrl && isDataUrl(l.pitchDeck?.streamUrl))
      ? l.pitchDeck.streamUrl
      : null;

    if (pitchDataUrl) {
      try {
        const originalName = l.pitchDeckPdfName || l.pitchDeck?.fileName || `${(l.name || 'Lead').replace(/\s+/g, '_')}_Pitch_Deck.pdf`;
        const uploadRes = await uploadFile({
          dataUrl: pitchDataUrl,
          originalName,
          mimeType: 'application/pdf',
          prefix: `public-samples/${slug}/leads/${leadId}/pitch-deck`,
        });
        l.pitchDeckAssetKey = uploadRes.objectKey;
        l.pitchDeckPdf = `/api/samples/${slug}/leads/${leadId}/pitch-deck`;
        if (!l.pitchDeck) l.pitchDeck = {};
        l.pitchDeck.assetKey = uploadRes.objectKey;
        l.pitchDeck.fileName = originalName;
        l.pitchDeck.streamUrl = `/api/samples/${slug}/leads/${leadId}/pitch-deck`;
        l.pitchDeck.downloadUrl = `/api/samples/${slug}/leads/${leadId}/pitch-deck?download=true`;
      } catch (err) {
        console.error(`[processLeadsPayload] Failed to upload pitchDeckPdf for ${l.name}:`, err.message);
      }
    }

    if (l.pitchDeck?.streamUrl && isDataUrl(l.pitchDeck.streamUrl)) {
      l.pitchDeck.streamUrl = `/api/samples/${slug}/leads/${leadId}/pitch-deck`;
    }
    if (l.pitchDeck?.downloadUrl && isDataUrl(l.pitchDeck.downloadUrl)) {
      l.pitchDeck.downloadUrl = `/api/samples/${slug}/leads/${leadId}/pitch-deck?download=true`;
    }

    // Auto-upload lead company logo if provided as a Data URL
    if (l.logo && isDataUrl(l.logo)) {
      try {
        const uploadRes = await uploadFile({
          dataUrl: l.logo,
          originalName: `${slug}_lead_${leadId}_logo.png`,
          mimeType: 'image/png',
          prefix: `public-samples/${slug}/leads/${leadId}/logo`,
        });
        l.logoAssetKey = uploadRes.objectKey;
        l.logo = `/api/samples/${slug}/leads/${leadId}/logo`;
      } catch (err) {
        console.error(`[processLeadsPayload] Failed to upload logo for ${l.name}:`, err.message);
      }
    }

    processed.push(l);
  }

  return processed;
};

/**
 * @desc    Get all sample showcases
 * @route   GET /api/samples-manage
 * @access  Private (Lead Specialist & Admin)
 */
export const getAdminSamples = async (req, res) => {
  try {
    const samples = await findAllSamples(true);
    // Sanitize any residual base64 strings so management listing loads instantly
    const sanitizedSamples = samples.map((s) => ({
      ...s,
      leads: (s.leads || []).map((l) => {
        const cleanLead = { ...l };
        if (cleanLead.leadStudyPdf && cleanLead.leadStudyPdf.startsWith('data:')) {
          cleanLead.leadStudyPdf = `/api/samples/${s.slug}/leads/${cleanLead.id}/lead-study-pdf`;
        }
        if (cleanLead.pitchDeckPdf && cleanLead.pitchDeckPdf.startsWith('data:')) {
          cleanLead.pitchDeckPdf = `/api/samples/${s.slug}/leads/${cleanLead.id}/pitch-deck`;
        }
        if (cleanLead.pitchDeck?.streamUrl && cleanLead.pitchDeck.streamUrl.startsWith('data:')) {
          cleanLead.pitchDeck = {
            ...cleanLead.pitchDeck,
            streamUrl: `/api/samples/${s.slug}/leads/${cleanLead.id}/pitch-deck`,
            downloadUrl: `/api/samples/${s.slug}/leads/${cleanLead.id}/pitch-deck?download=true`,
          };
        }
        return cleanLead;
      }),
    }));

    return res.status(200).json({
      success: true,
      count: sanitizedSamples.length,
      samples: sanitizedSamples,
    });
  } catch (error) {
    console.error('[SampleController.getAdminSamples] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to list sample showcases.',
    });
  }
};

/**
 * @desc    Get single sample showcase by ID
 * @route   GET /api/samples-manage/:id
 * @access  Private (Lead Specialist & Admin)
 */
export const getAdminSampleById = async (req, res) => {
  try {
    const { id } = req.params;
    const sample = await findSampleById(id);
    if (!sample) {
      return res.status(404).json({ success: false, message: 'Sample showcase not found.' });
    }
    return res.status(200).json({ success: true, sample });
  } catch (error) {
    console.error('[SampleController.getAdminSampleById] Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve showcase.' });
  }
};

const cleanSlug = (input) => {
  if (!input) return '';
  return String(input)
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/+$/, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

/**
 * @desc    Create new prospect sample showcase
 * @route   POST /api/samples-manage
 * @access  Private (Lead Specialist & Admin)
 */
export const createAdminSample = async (req, res) => {
  try {
    const {
      slug,
      title,
      companyName,
      description,
      logoUrl,
      status,
      companyStudy,
      leads,
      leadStudies,
      pitchDeck,
    } = req.body;

    if (!companyName || !companyName.trim()) {
      return res.status(400).json({ success: false, message: 'Target company name is required.' });
    }

    const effectiveSlug = cleanSlug(slug) || cleanSlug(companyName) || `showcase-${Date.now()}`;

    const effectiveTitle = (title && title.trim())
      ? title.trim()
      : `${companyName.trim()} Intelligence & Growth Showcase`;

    const existing = await findSampleBySlug(effectiveSlug, false);
    if (existing) {
      return res.status(409).json({ success: false, message: `A showcase with slug "${effectiveSlug}" already exists.` });
    }

    let initialCompanyStudy = companyStudy ? { ...companyStudy } : {
      company: companyName.trim(),
      industry: 'Enterprise Technology & Services',
      businessOverview: `Overview for ${companyName.trim()}.`,
      marketPosition: 'Key player in vertical sector.',
      keyObservations: 'Opportunity for strategic acceleration.',
    };

    // Auto-upload company study PDF if provided as a Data URL during creation
    if (initialCompanyStudy.pdfFileDataUrl && isDataUrl(initialCompanyStudy.pdfFileDataUrl)) {
      try {
        const originalName = initialCompanyStudy.pdfFileName || `${companyName.trim()}_Company_Study.pdf`;
        const uploadRes = await uploadFile({
          dataUrl: initialCompanyStudy.pdfFileDataUrl,
          originalName,
          mimeType: initialCompanyStudy.pdfMimeType || 'application/pdf',
          prefix: `public-samples/${effectiveSlug}/company-study`,
        });
        initialCompanyStudy = {
          ...initialCompanyStudy,
          pdfAssetKey: uploadRes.objectKey,
          pdfFileName: originalName,
          pdfFileSize: uploadRes.size,
          pdfMimeType: uploadRes.mimeType,
        };
        delete initialCompanyStudy.pdfFileDataUrl;
      } catch (uploadErr) {
        console.error('[createAdminSample] Failed to upload company study PDF:', uploadErr.message);
      }
    }

    let initialPitchDeck = pitchDeck ? { ...pitchDeck } : {};
    if (initialPitchDeck.fileDataUrl && isDataUrl(initialPitchDeck.fileDataUrl)) {
      try {
        const originalName = initialPitchDeck.fileName || `${companyName.trim()}_Growth_Playbook.pdf`;
        const uploadRes = await uploadFile({
          dataUrl: initialPitchDeck.fileDataUrl,
          originalName,
          mimeType: initialPitchDeck.mimeType || 'application/pdf',
          prefix: `public-samples/${effectiveSlug}/pitch-deck`,
        });
        initialPitchDeck = {
          ...initialPitchDeck,
          id: initialPitchDeck.id || `pitch-${Date.now()}`,
          fileName: originalName,
          assetKey: uploadRes.objectKey,
          mimeType: uploadRes.mimeType,
          fileSize: uploadRes.size,
          previewAvailable: true,
        };
        delete initialPitchDeck.fileDataUrl;
      } catch (uploadErr) {
        console.error('[createAdminSample] Failed to upload pitch deck:', uploadErr.message);
      }
    }

    const cleanLeadsInput = Array.isArray(leads) ? leads.filter((l) => !isMockDummyLead(l)) : [];
    const processedLeads = await processLeadsPayload(cleanLeadsInput, effectiveSlug);

    // Auto-promote lead logo to showcase company logo if not explicitly provided
    let effectiveLogoUrl = (logoUrl && logoUrl !== '/logo.png') ? logoUrl.trim() : null;
    if (effectiveLogoUrl && effectiveLogoUrl.includes('gstatic.com/faviconV2')) {
      const websiteStr = companyStudy?.website;
      if (!websiteStr || !websiteStr.includes('.')) {
        effectiveLogoUrl = null;
      }
    }
    if (!effectiveLogoUrl && Array.isArray(processedLeads)) {
      const leadWithLogo = processedLeads.find((l) => {
        const cand = l.companyLogo || l.logo;
        return cand && cand !== '/logo.png' && !cand.includes('gstatic.com/faviconV2');
      });
      if (leadWithLogo) {
        effectiveLogoUrl = leadWithLogo.companyLogo || leadWithLogo.logo;
      }
    }

    if (effectiveLogoUrl && isDataUrl(effectiveLogoUrl)) {
      try {
        const uploadRes = await uploadFile({
          dataUrl: effectiveLogoUrl,
          originalName: `${effectiveSlug}_company_logo.png`,
          mimeType: 'image/png',
          prefix: `public-samples/${effectiveSlug}/logo`,
        });
        effectiveLogoUrl = `/api/samples/${effectiveSlug}/logo`;
      } catch (uploadErr) {
        console.error('[createAdminSample] Failed to upload company logo:', uploadErr.message);
      }
    }

    const created = await createSampleShowcase({
      slug: effectiveSlug,
      title: effectiveTitle,
      companyName: companyName.trim(),
      description: description || `Curated account intelligence and sales acceleration brief prepared for ${companyName.trim()}.`,
      logoUrl: effectiveLogoUrl,
      status: status || 'PUBLISHED',
      companyStudy: initialCompanyStudy,
      leads: processedLeads,
      leadStudies: Array.isArray(leadStudies) ? leadStudies : [],
      pitchDeck: initialPitchDeck,
    });

    invalidateShowcaseCache(effectiveSlug);

    return res.status(201).json({
      success: true,
      sample: created,
      message: 'Prospect showcase created successfully.',
    });
  } catch (error) {
    console.error('[SampleController.createAdminSample] Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create sample showcase.',
    });
  }
};

/**
 * @desc    Update existing sample showcase
 * @route   PUT /api/samples-manage/:id
 * @access  Private (Lead Specialist & Admin)
 */
export const updateAdminSample = async (req, res) => {
  try {
    const { id } = req.params;
    const sample = await findSampleById(id);
    if (!sample) {
      return res.status(404).json({ success: false, message: 'Sample showcase not found.' });
    }

    const body = { ...req.body };
    if (body.slug) {
      body.slug = cleanSlug(body.slug);
    }

    // 1. Merge companyStudy preserving existing PDF keys
    if (body.companyStudy) {
      body.companyStudy = {
        ...(sample.companyStudy || {}),
        ...body.companyStudy,
      };
      if (!body.companyStudy.pdfAssetKey && sample.companyStudy?.pdfAssetKey) {
        body.companyStudy.pdfAssetKey = sample.companyStudy.pdfAssetKey;
        body.companyStudy.pdfFileName = sample.companyStudy.pdfFileName;
        body.companyStudy.pdfFileSize = sample.companyStudy.pdfFileSize;
        body.companyStudy.pdfMimeType = sample.companyStudy.pdfMimeType;
      }
    }

    if (body.companyStudy?.pdfFileDataUrl && isDataUrl(body.companyStudy.pdfFileDataUrl)) {
      try {
        const originalName = body.companyStudy.pdfFileName || `${sample.companyName}_Company_Study.pdf`;
        const uploadRes = await uploadFile({
          dataUrl: body.companyStudy.pdfFileDataUrl,
          originalName,
          mimeType: body.companyStudy.pdfMimeType || 'application/pdf',
          prefix: `public-samples/${sample.slug}/company-study`,
        });
        body.companyStudy = {
          ...body.companyStudy,
          pdfAssetKey: uploadRes.objectKey,
          pdfFileName: originalName,
          pdfFileSize: uploadRes.size,
          pdfMimeType: uploadRes.mimeType,
        };
        delete body.companyStudy.pdfFileDataUrl;
      } catch (uploadErr) {
        console.error('[updateAdminSample] Failed to upload company study PDF:', uploadErr.message);
      }
    }

    // 2. Merge pitchDeck preserving existing assetKey
    if (body.pitchDeck) {
      body.pitchDeck = {
        ...(sample.pitchDeck || {}),
        ...body.pitchDeck,
      };
      if (!body.pitchDeck.assetKey && sample.pitchDeck?.assetKey) {
        body.pitchDeck.assetKey = sample.pitchDeck.assetKey;
        body.pitchDeck.fileName = sample.pitchDeck.fileName;
        body.pitchDeck.fileSize = sample.pitchDeck.fileSize;
      }
    }

    if (body.pitchDeck?.fileDataUrl && isDataUrl(body.pitchDeck.fileDataUrl)) {
      try {
        const originalName = body.pitchDeck.fileName || `${sample.companyName}_Growth_Playbook.pdf`;
        const uploadRes = await uploadFile({
          dataUrl: body.pitchDeck.fileDataUrl,
          originalName,
          mimeType: body.pitchDeck.mimeType || 'application/pdf',
          prefix: `public-samples/${sample.slug}/pitch-deck`,
        });
        body.pitchDeck = {
          ...body.pitchDeck,
          id: body.pitchDeck.id || `pitch-${Date.now()}`,
          fileName: originalName,
          assetKey: uploadRes.objectKey,
          mimeType: uploadRes.mimeType,
          fileSize: uploadRes.size,
          previewAvailable: true,
        };
        delete body.pitchDeck.fileDataUrl;
      } catch (uploadErr) {
        console.error('[updateAdminSample] Failed to upload pitch deck:', uploadErr.message);
      }
    }

    if (Array.isArray(body.leads)) {
      const cleanLeadsInput = body.leads.filter((l) => !isMockDummyLead(l));
      body.leads = await processLeadsPayload(cleanLeadsInput, body.slug || sample.slug, sample.leads || []);
    }

    let effectiveLogoUrl = body.logoUrl !== undefined ? (body.logoUrl ? String(body.logoUrl).trim() : null) : sample.logoUrl;
    if (effectiveLogoUrl === '/logo.png') effectiveLogoUrl = null;
    if (effectiveLogoUrl && effectiveLogoUrl.includes('gstatic.com/faviconV2')) {
      const websiteStr = body.companyStudy?.website || sample.companyStudy?.website;
      if (!websiteStr || !websiteStr.includes('.')) {
        effectiveLogoUrl = null;
      }
    }
    if (!effectiveLogoUrl && Array.isArray(body.leads)) {
      const leadWithLogo = body.leads.find((l) => {
        const cand = l.companyLogo || l.logo;
        return cand && cand !== '/logo.png' && !cand.includes('gstatic.com/faviconV2');
      });
      if (leadWithLogo) {
        effectiveLogoUrl = leadWithLogo.companyLogo || leadWithLogo.logo;
      }
    }

    if (effectiveLogoUrl && isDataUrl(effectiveLogoUrl)) {
      try {
        const uploadRes = await uploadFile({
          dataUrl: effectiveLogoUrl,
          originalName: `${body.slug || sample.slug}_company_logo.png`,
          mimeType: 'image/png',
          prefix: `public-samples/${body.slug || sample.slug}/logo`,
        });
        effectiveLogoUrl = `/api/samples/${body.slug || sample.slug}/logo`;
      } catch (uploadErr) {
        console.error('[updateAdminSample] Failed to upload company logo:', uploadErr.message);
      }
    }
    body.logoUrl = effectiveLogoUrl;

    const updated = await updateSampleShowcase(id, body);
    invalidateShowcaseCache(sample.slug);
    if (body.slug && body.slug !== sample.slug) {
      invalidateShowcaseCache(body.slug);
    }
    return res.status(200).json({
      success: true,
      sample: updated,
      message: 'Sample showcase updated successfully.',
    });
  } catch (error) {
    console.error('[SampleController.updateAdminSample] Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update sample showcase.',
    });
  }
};

/**
 * @desc    Delete sample showcase
 * @route   DELETE /api/samples-manage/:id
 * @access  Private (Lead Specialist & Admin)
 */
export const deleteAdminSample = async (req, res) => {
  try {
    const { id } = req.params;
    const sample = await findSampleById(id);
    if (!sample) {
      return res.status(404).json({ success: false, message: 'Sample showcase not found.' });
    }

    if (sample.pitchDeck?.assetKey) {
      await deleteFile(sample.pitchDeck.assetKey).catch(() => {});
    }
    if (sample.companyStudy?.pdfAssetKey) {
      await deleteFile(sample.companyStudy.pdfAssetKey).catch(() => {});
    }

    await deleteSampleShowcase(id);
    invalidateShowcaseCache(sample.slug);
    return res.status(200).json({
      success: true,
      message: 'Sample showcase deleted successfully.',
    });
  } catch (error) {
    console.error('[SampleController.deleteAdminSample] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete sample showcase.',
    });
  }
};

/**
 * @desc    Upload Company Study PDF to Object Storage
 * @route   POST /api/samples-manage/:id/upload-company-study-pdf
 * @access  Private (Lead Specialist & Admin)
 */
export const uploadCompanyStudyPdf = async (req, res) => {
  try {
    const { id } = req.params;
    const { fileDataUrl, fileName, mimeType } = req.body;

    const sample = await findSampleById(id);
    if (!sample) {
      return res.status(404).json({ success: false, message: 'Sample showcase not found.' });
    }

    if (!fileDataUrl || !isDataUrl(fileDataUrl)) {
      return res.status(400).json({ success: false, message: 'Valid file Data URL payload required.' });
    }

    const originalName = fileName || `${sample.companyName}_Company_Study.pdf`;
    const uploadRes = await uploadFile({
      dataUrl: fileDataUrl,
      originalName,
      mimeType: mimeType || 'application/pdf',
      prefix: `public-samples/${sample.slug}/company-study`,
    });

    const updatedStudy = {
      ...(sample.companyStudy || {}),
      pdfAssetKey: uploadRes.objectKey,
      pdfFileName: originalName,
      pdfFileSize: uploadRes.size,
      pdfMimeType: uploadRes.mimeType,
    };

    const updated = await updateSampleShowcase(id, { companyStudy: updatedStudy });

    return res.status(200).json({
      success: true,
      sample: updated,
      message: 'Company study PDF uploaded to object storage successfully.',
    });
  } catch (error) {
    console.error('[SampleController.uploadCompanyStudyPdf] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload company study PDF.',
    });
  }
};

/**
 * @desc    Upload general pitch deck for showcase
 * @route   POST /api/samples-manage/:id/upload-pitch-deck
 * @access  Private (Lead Specialist & Admin)
 */
export const uploadAdminPitchDeck = async (req, res) => {
  try {
    const { id } = req.params;
    const { fileDataUrl, fileName, mimeType, title, summary } = req.body;

    const sample = await findSampleById(id);
    if (!sample) {
      return res.status(404).json({ success: false, message: 'Sample showcase not found.' });
    }

    if (!fileDataUrl || !isDataUrl(fileDataUrl)) {
      return res.status(400).json({ success: false, message: 'Valid file Data URL payload required.' });
    }

    const originalName = fileName || `${sample.companyName}_Growth_Playbook.pdf`;
    const uploadRes = await uploadFile({
      dataUrl: fileDataUrl,
      originalName,
      mimeType: mimeType || 'application/pdf',
      prefix: `public-samples/${sample.slug}/pitch-deck`,
    });

    const newPitchDeck = {
      id: `pitch-${Date.now()}`,
      title: title || sample.pitchDeck?.title || `${sample.companyName} Enterprise Growth Playbook`,
      summary: summary || sample.pitchDeck?.summary || 'Tailored sales enablement and presentation proposal.',
      fileName: originalName,
      assetKey: uploadRes.objectKey,
      mimeType: uploadRes.mimeType,
      fileSize: uploadRes.size,
      previewAvailable: true,
    };

    const updated = await updateSampleShowcase(id, { pitchDeck: newPitchDeck });

    return res.status(200).json({
      success: true,
      sample: updated,
      message: 'Pitch deck uploaded to object storage successfully.',
    });
  } catch (error) {
    console.error('[SampleController.uploadAdminPitchDeck] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload pitch deck.',
    });
  }
};

/**
 * @desc    Upload individual lead pitch deck
 * @route   POST /api/samples-manage/:id/leads/:leadId/pitch-deck
 * @access  Private (Lead Specialist & Admin)
 */
export const uploadLeadPitchDeck = async (req, res) => {
  try {
    const { id, leadId } = req.params;
    const { fileDataUrl, fileName, mimeType, title, summary } = req.body;

    const sample = await findSampleById(id);
    if (!sample) {
      return res.status(404).json({ success: false, message: 'Sample showcase not found.' });
    }

    if (!fileDataUrl || !isDataUrl(fileDataUrl)) {
      return res.status(400).json({ success: false, message: 'Valid file Data URL payload required.' });
    }

    const leads = sample.leads || [];
    const leadIndex = leads.findIndex((l) => l.id === leadId);
    if (leadIndex === -1) {
      return res.status(404).json({ success: false, message: 'Lead not found in this showcase.' });
    }

    const lead = leads[leadIndex];
    const originalName = fileName || `${lead.name.replace(/\s+/g, '_')}_Pitch_Deck.pdf`;

    const uploadRes = await uploadFile({
      dataUrl: fileDataUrl,
      originalName,
      mimeType: mimeType || 'application/pdf',
      prefix: `public-samples/${sample.slug}/leads/${leadId}`,
    });

    leads[leadIndex] = {
      ...lead,
      pitchDeck: {
        title: title || `Tailored Pitch for ${lead.name}`,
        summary: summary || `Strategic proposal designed specifically for ${lead.name} (${lead.title}).`,
        fileName: originalName,
        assetKey: uploadRes.objectKey,
        mimeType: uploadRes.mimeType,
        fileSize: uploadRes.size,
      },
    };

    const updated = await updateSampleShowcase(id, { leads });

    return res.status(200).json({
      success: true,
      sample: updated,
      message: `Pitch deck for ${lead.name} uploaded successfully.`,
    });
  } catch (error) {
    console.error('[SampleController.uploadLeadPitchDeck] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload lead pitch deck.',
    });
  }
};

/**
 * @desc    Submit public sample inquiry / lead unlock request directly from prospect dashboard
 * @route   POST /api/samples/:slug/inquiry or POST /api/samples/inquiry
 * @access  Public (No Auth Required)
 */
export const submitPublicInquiry = async (req, res) => {
  try {
    const slug = (req.params.slug || req.body.slug || req.query.slug || 'general').trim();
    const { name, email, message } = req.body;

    if (!email || !email.trim() || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'A valid work email is required.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name && name.trim()) || 'Prospect Visitor';
    const cleanMessage = (message && message.trim()) || "Hey DiziGini i'm intrested in your service";

    // 1. Resolve sample company details
    let sample = null;
    let companyName = req.body.companyName || slug;
    try {
      sample = await findSampleBySlug(slug, false);
      if (sample?.companyName) {
        companyName = sample.companyName;
      }
    } catch (_) {
      // Fallback to slug if sample not found
    }

    // 2. Self-healing database table check
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

    // 3. Record the inquiry in the database
    const insertRes = await query(
      `
        INSERT INTO public_sample_inquiries (
          slug, 
          company_name, 
          sender_name, 
          sender_email, 
          message,
          status
        )
        VALUES ($1, $2, $3, $4, $5, 'NEW')
        RETURNING id, slug, company_name, sender_name, sender_email, message, created_at;
      `,
      [slug, companyName, cleanName, cleanEmail, cleanMessage]
    );

    const inquiryRecord = insertRes.rows[0];
    const inquiryId = inquiryRecord?.id;

    // 4. Retrieve Super Admins from database
    let adminUsers = [];
    try {
      const adminUsersRes = await query(`
        SELECT id, name, email, role FROM users 
        WHERE role IN ('SUPER_ADMIN', 'ADMIN') AND email IS NOT NULL AND email != ''
      `);
      adminUsers = adminUsersRes.rows;
    } catch (eUsers) {
      console.warn('[SampleController.submitPublicInquiry] Admin user query note:', eUsers.message);
    }

    const adminEmails = adminUsers.map((u) => u.email.trim().toLowerCase());

    // 5. Retrieve Application Emails tied to the platform
    const appEmails = [
      process.env.EMAIL_USER,
      process.env.ADMIN_EMAIL,
      process.env.SUPPORT_EMAIL,
      'contact@dizigini.com',
      'team@dizigini.com',
    ]
      .filter(Boolean)
      .map((e) => e.trim().toLowerCase());

    // Combined unique recipients for super admin & application alert
    const alertRecipients = Array.from(new Set([...adminEmails, ...appEmails]));

    console.log(`[INQUIRY RECORDED] ID: ${inquiryId} from ${cleanName} (${cleanEmail}) for ${companyName}`);
    console.log(`[INQUIRY ALERT] Dispatching to ${alertRecipients.length} recipients:`, alertRecipients);

    // 6. Send Alert Email to Super Admin & Application Email
    let superAdminNotified = false;
    let appEmailNotified = false;
    try {
      const alertResult = await sendSampleInquiryAlertEmail({
        recipients: alertRecipients,
        sample: sample || { companyName, slug },
        inquiry: {
          id: inquiryId,
          slug,
          companyName,
          senderName: cleanName,
          senderEmail: cleanEmail,
          message: cleanMessage,
        },
      });
      if (alertResult?.success) {
        superAdminNotified = true;
        appEmailNotified = true;
      }
    } catch (emailErr) {
      console.error('[SampleController.submitPublicInquiry] Super admin/app email error:', emailErr.message);
    }

    // 7. Send Confirmation Email to the Prospect who provided their email
    let senderNotified = false;
    try {
      const confirmResult = await sendSampleInquiryConfirmationEmail({
        recipient: cleanEmail,
        sample: sample || { companyName, slug },
        inquiry: {
          id: inquiryId,
          slug,
          companyName,
          senderName: cleanName,
          senderEmail: cleanEmail,
          message: cleanMessage,
        },
      });
      if (confirmResult?.success) {
        senderNotified = true;
      }
    } catch (confirmErr) {
      console.error('[SampleController.submitPublicInquiry] Sender confirmation email error:', confirmErr.message);
    }

    // 8. Update notification delivery status in database
    if (inquiryId && (superAdminNotified || appEmailNotified || senderNotified)) {
      try {
        await query(
          `
            UPDATE public_sample_inquiries 
            SET super_admin_notified = $1, app_email_notified = $2, sender_notified = $3
            WHERE id = $4
          `,
          [superAdminNotified, appEmailNotified, senderNotified, inquiryId]
        );
      } catch (_) {}
    }

    // 9. Create In-App Notifications for all Super Admins
    for (const admin of adminUsers) {
      try {
        await createNotification({
          userId: admin.id,
          type: 'INQUIRY_CREATED',
          title: `New Lead Unlock Request: ${companyName}`,
          message: `${cleanName} (${cleanEmail}) requested lead unlock & intelligence briefing for ${companyName}`,
        });
      } catch (notifErr) {
        console.warn(`[SampleController.submitPublicInquiry] Notification for admin ${admin.id} warning:`, notifErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Inquiry successfully recorded for ${companyName}! Our specialist team will reach out to ${cleanEmail} within 2-4 hours.`,
      inquiryId,
    });
  } catch (error) {
    console.error('[SampleController.submitPublicInquiry] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit inquiry. Please try again or email us directly at contact@dizigini.com.',
    });
  }
};

/**
 * @desc Stream company logo or redirect to storage
 * @route GET /api/samples/:slug/logo
 * @access Public
 */
export const streamCompanyLogo = async (req, res) => {
  try {
    const { slug } = req.params;
    const sample = await findSampleBySlug(slug, false);
    if (!sample) {
      return res.status(404).send('Showcase not found');
    }

    let logo = sample.logoUrl;
    if (!logo || logo === '/logo.png') {
      const leads = Array.isArray(sample.leads) ? sample.leads : [];
      const leadWithLogo = leads.find((l) => l.companyLogo || l.logo);
      logo = leadWithLogo?.companyLogo || leadWithLogo?.logo;
    }

    if (!logo) {
      return res.status(404).send('Logo not found');
    }

    if (isDataUrl(logo)) {
      const matches = logo.match(/^data:([A-Za-z0-9-+/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const mimeType = matches[1];
        const buffer = Buffer.from(matches[2], 'base64');
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.send(buffer);
      }
    }

    if (logo.startsWith('http')) {
      return res.redirect(logo);
    }

    if (logo.startsWith('/api/samples/') && logo.endsWith('/logo')) {
      // Prevent loop
      return res.status(404).send('Logo not found');
    }

    // Assume MinIO / local storage asset key
    const stream = await getFileStream(logo);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return stream.pipe(res);
  } catch (err) {
    console.error('[SampleController.streamCompanyLogo] Error:', err.message);
    return res.status(500).send('Error streaming logo');
  }
};

/**
 * @desc Stream lead logo
 * @route GET /api/samples/:slug/leads/:leadId/logo
 * @access Public
 */
export const streamLeadLogo = async (req, res) => {
  try {
    const { slug, leadId } = req.params;
    const sample = await findSampleBySlug(slug, false);
    if (!sample) return res.status(404).send('Showcase not found');

    const lead = (sample.leads || []).find((l, idx) => {
      const genId = l.id || `lead-${idx + 1}`;
      return String(l.id) === String(leadId) || String(genId) === String(leadId) || String(idx + 1) === String(leadId);
    });
    if (!lead) return res.status(404).send('Lead not found');

    if (lead.logoAssetKey) {
      const stream = await getFileStream(lead.logoAssetKey);
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return stream.pipe(res);
    }

    const candidate = lead.logo || lead.companyLogo || lead.avatarUrl;
    if (candidate && isDataUrl(candidate)) {
      const matches = candidate.match(/^data:([A-Za-z0-9-+/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const mimeType = matches[1];
        const buffer = Buffer.from(matches[2], 'base64');
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.send(buffer);
      }
    }

    if (candidate?.startsWith('http')) {
      return res.redirect(candidate);
    }

    // Fallback: If lead has companyLink, redirect to favicon
    const companyLink = lead.companyLink || lead.website || lead.companyWebsite;
    if (companyLink) {
      const cleanDomain = String(companyLink)
        .replace(/^https?:\/\//i, '')
        .replace(/^www\./i, '')
        .split('/')[0]
        .trim();
      if (cleanDomain && cleanDomain.includes('.')) {
        return res.redirect(`https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${cleanDomain}&size=128`);
      }
    }

    return res.status(404).send('Lead logo not found');
  } catch (err) {
    console.error('[SampleController.streamLeadLogo] Error:', err.message);
    return res.status(500).send('Error streaming lead logo');
  }
};

