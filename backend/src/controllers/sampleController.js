import {
  findSampleBySlug,
  findSampleById,
  findAllSamples,
  createSampleShowcase,
  updateSampleShowcase,
  deleteSampleShowcase,
} from '../repositories/sampleRepository.js';
import {
  uploadFile,
  getFileStream,
  getObjectStat,
  deleteFile,
  isDataUrl,
} from '../services/storageService.js';
import {
  streamGeneratedCompanyStudyPdf,
  streamGeneratedLeadStudyPdf,
  streamGeneratedPitchDeckPdf,
} from '../services/pdfService.js';

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

    const sample = await findSampleBySlug(slug.trim(), true);
    if (!sample) {
      return res.status(404).json({
        success: false,
        message: 'Sample intelligence showcase not found or is not currently published.',
      });
    }

    // Company Study Projection
    const companyStudyData = sample.companyStudy || {};
    const publicCompanyStudy = {
      company: companyStudyData.company || sample.companyName,
      industry: companyStudyData.industry || 'Enterprise Technology & Services',
      businessOverview: companyStudyData.businessOverview || '',
      marketPosition: companyStudyData.marketPosition || '',
      keyObservations: companyStudyData.keyObservations || '',
      potentialOpportunity: companyStudyData.potentialOpportunity || '',
      hasPdf: true,
      pdfUrl: `/api/samples/${sample.slug}/company-study-pdf`,
      pdfFileName: companyStudyData.pdfFileName || `${sample.companyName} - Company Study.pdf`,
    };

    // Strict projection: sanitize and verify NO private client fields leak
    const publicLeads = (sample.leads || []).map((l, index) => {
      const leadId = l.id || `lead-${index + 1}`;
      const leadName = l.name || 'Executive Lead';

      // Find matching lead study if available in leadStudies or attached directly to lead
      const matchedStudy = l.leadStudy || (sample.leadStudies || []).find((s) => s.leadName === leadName || s.id === leadId) || {};

      // Match lead-specific pitch deck or fall back to general pitch deck
      const leadPitch = l.pitchDeck || (l.pitchDeckPdf ? {
        title: l.pitchDeckTitle || `${leadName} Proposal Pitch Deck`,
        summary: `Strategic value pitch tailored for ${l.title || 'executive decision makers'}.`,
        fileName: l.pitchDeckPdfName || `${leadName.replace(/\s+/g, '_')}_Pitch_Deck.pdf`,
        streamUrl: l.pitchDeckPdf,
        downloadUrl: l.pitchDeckPdf,
      } : (sample.pitchDeck?.assetKey ? {
        title: `${sample.companyName} Proposal for ${l.company || sample.companyName}`,
        summary: `Strategic value pitch tailored for ${l.title || 'executive decision makers'}.`,
        fileName: sample.pitchDeck.fileName,
        streamUrl: `/api/samples/${sample.slug}/leads/${leadId}/pitch-deck`,
      } : null));

      return {
        id: leadId,
        name: leadName,
        title: l.title || 'Decision Maker',
        company: l.company || l.lead_company || sample.companyName,
        logo: l.logo || null,
        industry: l.industry || '',
        location: l.location || '',
        linkedin: l.linkedin || '',
        leadStudyPdf: l.leadStudyPdf || null,
        leadStudyPdfName: l.leadStudyPdfName || null,
        pitchDeckPdf: l.pitchDeckPdf || null,
        pitchDeckPdfName: l.pitchDeckPdfName || null,
        aboutCompany: l.aboutCompany || l.company_summary || `Leading innovator in ${l.industry || 'the enterprise sector'}.`,
        whySuitsBest: l.whySuitsBest || l.why_suits_best || `Strategic decision maker evaluating modern solutions in ${l.industry || 'their market'}.`,
        maskedEmail: l.maskedEmail || maskEmail(l.email),
        maskedPhone: l.maskedPhone || maskPhone(l.phone),
        shortSummary: l.shortSummary || l.summary || l.whySuitsBest || '',
        leadStudy: {
          whyRelevant: matchedStudy.whyRelevant || l.whyRelevant || 'Key decision maker with immediate budget and modernization authority.',
          observedContext: matchedStudy.observedContext || l.observedContext || 'Currently consolidating operational workflows and modernizing vendor architecture.',
          potentialOpportunity: matchedStudy.potentialOpportunity || l.potentialOpportunity || 'High-probability engagement for specialized outsourced execution.',
          suggestedApproach: matchedStudy.suggestedApproach || l.suggestedApproach || 'Lead with technical proof-of-concept and scalable delivery SLA guarantees.',
        },
        pitchDeck: leadPitch ? {
          title: leadPitch.title || `Tailored Pitch for ${leadName}`,
          summary: leadPitch.summary || 'Strategic presentation proposal designed to convert this stakeholder.',
          streamUrl: leadPitch.streamUrl || (leadPitch.assetKey ? `/api/samples/${sample.slug}/leads/${leadId}/pitch-deck` : (l.pitchDeckPdf || `/api/samples/${sample.slug}/leads/${leadId}/pitch-deck`)),
          downloadUrl: leadPitch.downloadUrl || leadPitch.streamUrl || (leadPitch.assetKey ? `/api/samples/${sample.slug}/leads/${leadId}/pitch-deck?download=true` : (l.pitchDeckPdf || `/api/samples/${sample.slug}/leads/${leadId}/pitch-deck?download=true`)),
          fileName: leadPitch.fileName || l.pitchDeckPdfName || `${leadName.replace(/\s+/g, '_')}_Pitch_Deck.pdf`,
        } : (l.pitchDeckPdf ? {
          title: `${leadName} Proposal Pitch Deck`,
          summary: 'Tailored strategic pitch deck proposal prepared for this executive.',
          streamUrl: l.pitchDeckPdf,
          downloadUrl: l.pitchDeckPdf,
          fileName: l.pitchDeckPdfName || `${leadName.replace(/\s+/g, '_')}_Pitch_Deck.pdf`,
        } : null),
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

    return res.status(200).json({
      success: true,
      sample: {
        slug: sample.slug,
        title: sample.title,
        companyName: sample.companyName,
        description: sample.description,
        logoUrl: sample.logoUrl,
        status: sample.status,
        companyStudy: publicCompanyStudy,
        leads: publicLeads,
        leadStudies: publicLeadStudies,
        pitchDeck: publicPitchDeck,
        publishedAt: sample.publishedAt,
      },
    });
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
        const fileName = (sample.pitchDeck.fileName || 'CreativeGini_Sample_Pitch_Deck.pdf').replace(/["\r\n]/g, '_');
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

    // If PDF assetKey is in MinIO, try streaming it
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
        console.warn('[SampleController.streamCompanyStudyPdf] MinIO stream failed, generating document on the fly:', streamErr?.message);
      }
    }

    // Dynamic on-the-fly generation: Executive Company Study PDF
    return streamGeneratedCompanyStudyPdf(sample, res, download === 'true');
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

    const lead = (sample.leads || []).find((l) => l.id === leadId);

    // If PDF was saved directly as base64 data URL
    if (lead?.pitchDeckPdf && lead.pitchDeckPdf.startsWith('data:application/pdf;base64,')) {
      const base64Data = lead.pitchDeckPdf.replace(/^data:application\/pdf;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const fname = (lead.pitchDeckPdfName || lead.pitchDeck?.fileName || `${lead.name || 'Lead'}_Pitch_Deck.pdf`).replace(/["\r\n]/g, '_');
      const disposition = download === 'true' ? `attachment; filename="${fname}"` : `inline; filename="${fname}"`;
      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': disposition,
        'Content-Length': buffer.length,
        'Cache-Control': 'public, max-age=3600',
      });
      return res.end(buffer);
    }

    let assetKey = lead?.pitchDeck?.assetKey || sample.pitchDeck?.assetKey;
    let fileName = lead?.pitchDeck?.fileName || sample.pitchDeck?.fileName || 'Proposal_Pitch_Deck.pdf';

    if (!assetKey) {
      return res.status(404).json({
        success: false,
        message: 'Pitch deck document for this lead is not currently available.',
      });
    }

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

    const lead = (sample.leads || []).find((l) => l.id === leadId);

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

    // Dynamic generation fallback
    return streamGeneratedLeadStudyPdf(lead || { name: 'Executive Lead' }, sample, res, download === 'true');
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
 * @desc    Get all sample showcases
 * @route   GET /api/samples-manage
 * @access  Private (Lead Specialist & Admin)
 */
export const getAdminSamples = async (req, res) => {
  try {
    const samples = await findAllSamples(true);
    return res.status(200).json({
      success: true,
      count: samples.length,
      samples,
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

    const created = await createSampleShowcase({
      slug: effectiveSlug,
      title: effectiveTitle,
      companyName: companyName.trim(),
      description: description || `Curated account intelligence and sales acceleration brief prepared for ${companyName.trim()}.`,
      logoUrl: logoUrl || '/logo.png',
      status: status || 'PUBLISHED',
      companyStudy: companyStudy || {
        company: companyName.trim(),
        industry: 'Enterprise Technology & Services',
        businessOverview: `Overview for ${companyName.trim()}.`,
        marketPosition: 'Key player in vertical sector.',
        keyObservations: 'Opportunity for strategic acceleration.',
      },
      leads: Array.isArray(leads) ? leads : [],
      leadStudies: Array.isArray(leadStudies) ? leadStudies : [],
      pitchDeck: pitchDeck || {},
    });

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

    const updated = await updateSampleShowcase(id, body);
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
