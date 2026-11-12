import {
  findSampleBySlug,
  findSampleById,
  findAllSamples,
  createSampleShowcase,
  updateSampleShowcase,
} from '../repositories/sampleRepository.js';
import { query } from '../config/postgres.js';
import {
  uploadFile,
  isDataUrl,
} from './storageService.js';
import { isMockDummyLead, invalidateShowcaseCache } from '../controllers/sampleController.js';

/**
 * Sanitizes an input string into a valid URL slug
 */
export const cleanSlug = (input) => {
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
 * Resolves a slug, handling collisions according to flow rules
 */
export const resolveSlugCollision = async (baseSlug, { allowIncrement = true, existingId = null } = {}) => {
  let effectiveSlug = cleanSlug(baseSlug);
  if (!effectiveSlug) {
    effectiveSlug = `showcase-${Date.now()}`;
  }

  const existing = await findSampleBySlug(effectiveSlug, false);
  if (existing && (!existingId || String(existing.id) !== String(existingId))) {
    if (!allowIncrement) {
      const err = new Error(`Slug '${effectiveSlug}' is already in use by an existing showcase.`);
      err.code = 'SLUG_CONFLICT';
      err.status = 409;
      throw err;
    }
    let counter = 2;
    while (await findSampleBySlug(`${effectiveSlug}-${counter}`, false)) {
      counter++;
    }
    effectiveSlug = `${effectiveSlug}-${counter}`;
  }

  return effectiveSlug;
};

/**
 * Offloads inlined base64 PDF payloads in leads array to storage service
 */
export const processLeadsPayload = async (leads, slug, existingLeads = []) => {
  if (!Array.isArray(leads) || leads.length === 0) return [];
  const processed = [];

  for (let idx = 0; idx < leads.length; idx++) {
    const l = { ...leads[idx] };
    const leadId = l.id || `lead-${Date.now()}-${idx + 1}`;
    l.id = leadId;

    const existingLead = (existingLeads || []).find(
      (el) => String(el.id) === String(leadId) || (el.name && l.name && String(el.name).toLowerCase() === String(l.name).toLowerCase())
    );

    if (!l.logoAssetKey && existingLead?.logoAssetKey) {
      l.logoAssetKey = existingLead.logoAssetKey;
    }
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
        console.error(`[prospectService.processLeadsPayload] Failed to upload leadStudyPdf for ${l.name}:`, err.message);
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
        console.error(`[prospectService.processLeadsPayload] Failed to upload pitchDeckPdf for ${l.name}:`, err.message);
      }
    }

    if (l.pitchDeck?.streamUrl && isDataUrl(l.pitchDeck.streamUrl)) {
      l.pitchDeck.streamUrl = `/api/samples/${slug}/leads/${leadId}/pitch-deck`;
    }
    if (l.pitchDeck?.downloadUrl && isDataUrl(l.pitchDeck.downloadUrl)) {
      l.pitchDeck.downloadUrl = `/api/samples/${slug}/leads/${leadId}/pitch-deck?download=true`;
    }

    const rawLogoDataUrl = (l.logo && isDataUrl(l.logo))
      ? l.logo
      : ((l.companyLogo && isDataUrl(l.companyLogo))
      ? l.companyLogo
      : ((l.logoUrl && isDataUrl(l.logoUrl)) ? l.logoUrl : null));

    if (rawLogoDataUrl) {
      try {
        const uploadRes = await uploadFile({
          dataUrl: rawLogoDataUrl,
          originalName: `${slug}_lead_${leadId}_logo.png`,
          mimeType: 'image/png',
          prefix: `public-samples/${slug}/leads/${leadId}/logo`,
        });
        l.logoAssetKey = uploadRes.objectKey;
        l.logo = `/api/samples/${slug}/leads/${leadId}/logo`;
        l.companyLogo = l.logo;
        l.logoUrl = l.logo;
      } catch (err) {
        console.error(`[prospectService.processLeadsPayload] Failed to upload logo for ${l.name}:`, err.message);
      }
    } else if (l.logoAssetKey && (!l.logo || l.logo.startsWith('data:'))) {
      l.logo = `/api/samples/${slug}/leads/${leadId}/logo`;
      l.companyLogo = l.logo;
      l.logoUrl = l.logo;
    }

    processed.push(l);
  }

  return processed;
};

/**
 * Resolves the primary company logo
 */
export const resolveCompanyLogo = async ({ companyName, slug, companyStudy = {}, logoUrl = null }) => {
  let effectiveLogoUrl = (logoUrl && logoUrl !== '/logo.png') ? String(logoUrl).trim() : null;
  let logoAssetKey = null;

  if (!effectiveLogoUrl && companyStudy.logoUrl && companyStudy.logoUrl !== '/logo.png') {
    effectiveLogoUrl = companyStudy.logoUrl;
  }

  if (!effectiveLogoUrl) {
    let domain = '';
    const explicitWebsite = companyStudy.website || null;
    if (explicitWebsite && typeof explicitWebsite === 'string') {
      domain = explicitWebsite.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0].split('?')[0].trim();
    }
    if (!domain || !domain.includes('.')) {
      if (slug.includes('.')) {
        domain = slug;
      } else if (slug.endsWith('-ai')) {
        domain = `${slug.replace(/-ai$/, '')}.ai`;
      } else if (slug.endsWith('-io')) {
        domain = `${slug.replace(/-io$/, '')}.io`;
      } else if (slug === 'finkr') {
        domain = 'finkr.co.uk';
      } else if (companyName) {
        domain = `${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
      }
    }
    if (domain && domain.includes('.')) {
      effectiveLogoUrl = `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain.toLowerCase()}&size=128`;
    }
  }

  if (effectiveLogoUrl && isDataUrl(effectiveLogoUrl)) {
    try {
      const uploadRes = await uploadFile({
        dataUrl: effectiveLogoUrl,
        originalName: `${slug}_company_logo.png`,
        mimeType: 'image/png',
        prefix: `public-samples/${slug}/logo`,
      });
      logoAssetKey = uploadRes.objectKey;
      effectiveLogoUrl = `/api/samples/${slug}/logo`;
    } catch (uploadErr) {
      console.error('[prospectService.resolveCompanyLogo] Failed to upload company logo:', uploadErr.message);
    }
  }

  return { logoUrl: effectiveLogoUrl, logoAssetKey };
};

/**
 * Core service function to create a new prospect showcase
 */
export const createProspect = async (data = {}, { allowSlugIncrement = true } = {}) => {
  const sanitizedData = { ...data };
  delete sanitizedData._token;
  delete sanitizedData.token;

  const {
    slug,
    title,
    companyName,
    description,
    logoUrl,
    status = 'PUBLISHED',
    companyStudy,
    leads,
    leadStudies,
    pitchDeck,
    sourcePlatform = 'MANUAL',
    externalCampaignId = null,
    externalProspectId = null,
    createdByEmail = null,
    batchId = null,
  } = sanitizedData;

  if (!companyName || !companyName.trim()) {
    const err = new Error('Target company name is required.');
    err.status = 400;
    throw err;
  }

  const baseSlug = cleanSlug(slug) || cleanSlug(companyName) || `showcase-${Date.now()}`;
  const effectiveSlug = await resolveSlugCollision(baseSlug, { allowIncrement: allowSlugIncrement });

  const effectiveTitle = (title && title.trim())
    ? title.trim()
    : `${companyName.trim()} Intelligence & Growth Showcase`;

  let initialCompanyStudy = companyStudy ? { ...companyStudy } : {
    company: companyName.trim(),
    industry: 'Enterprise Technology & Services',
    businessOverview: `Overview for ${companyName.trim()}.`,
    marketPosition: 'Key player in vertical sector.',
    keyObservations: 'Opportunity for strategic acceleration.',
  };

  // Upload company study PDF if provided as Data URL
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
      console.error('[prospectService.createProspect] Failed to upload company study PDF:', uploadErr.message);
    }
  }

  // Upload pitch deck if provided as Data URL
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
      console.error('[prospectService.createProspect] Failed to upload pitch deck:', uploadErr.message);
    }
  }

  const cleanLeadsInput = Array.isArray(leads) ? leads.filter((l) => !isMockDummyLead(l)) : [];
  const processedLeads = await processLeadsPayload(cleanLeadsInput, effectiveSlug);

  const { logoUrl: resolvedLogoUrl, logoAssetKey } = await resolveCompanyLogo({
    companyName: companyName.trim(),
    slug: effectiveSlug,
    companyStudy: initialCompanyStudy,
    logoUrl,
  });

  if (logoAssetKey) {
    initialCompanyStudy.logoAssetKey = logoAssetKey;
  }

  // Insert showcase into PostgreSQL
  const res = await query(
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
      source_platform,
      external_campaign_id,
      external_prospect_id,
      created_by_email,
      batch_id,
      published_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW())
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
      effectiveSlug,
      effectiveTitle,
      companyName.trim(),
      description || `Curated account intelligence and sales acceleration brief prepared for ${companyName.trim()}.`,
      resolvedLogoUrl,
      logoAssetKey,
      status,
      JSON.stringify(initialCompanyStudy),
      JSON.stringify(processedLeads),
      JSON.stringify(Array.isArray(leadStudies) ? leadStudies : []),
      JSON.stringify(initialPitchDeck),
      sourcePlatform,
      externalCampaignId,
      externalProspectId,
      createdByEmail,
      batchId,
    ]
  );

  invalidateShowcaseCache();
  return findSampleById(res.rows[0].id);
};

/**
 * Core service function to update an existing prospect showcase
 */
export const updateProspect = async (id, updates = {}) => {
  const sample = await findSampleById(id);
  if (!sample) {
    const err = new Error('Sample showcase not found.');
    err.status = 404;
    throw err;
  }

  const body = { ...updates };
  delete body._token;
  delete body.token;

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
      console.error('[prospectService.updateProspect] Failed to upload company study PDF:', uploadErr.message);
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
      console.error('[prospectService.updateProspect] Failed to upload pitch deck:', uploadErr.message);
    }
  }

  // 3. Process leads array
  if (Array.isArray(body.leads)) {
    const cleanLeadsInput = body.leads.filter((l) => !isMockDummyLead(l));
    body.leads = await processLeadsPayload(cleanLeadsInput, sample.slug, sample.leads || []);
  }

  // 4. Logo resolution
  if (body.logoUrl && isDataUrl(body.logoUrl)) {
    try {
      const uploadRes = await uploadFile({
        dataUrl: body.logoUrl,
        originalName: `${sample.slug}_company_logo.png`,
        mimeType: 'image/png',
        prefix: `public-samples/${sample.slug}/logo`,
      });
      body.logoAssetKey = uploadRes.objectKey;
      body.logoUrl = `/api/samples/${sample.slug}/logo`;
    } catch (uploadErr) {
      console.error('[prospectService.updateProspect] Failed to upload updated logo:', uploadErr.message);
    }
  }

  const updated = await updateSampleShowcase(id, body);
  invalidateShowcaseCache();
  return updated;
};

