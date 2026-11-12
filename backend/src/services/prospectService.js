import {
  findSampleBySlug,
  findSampleById,
  findAllSamples,
  createSampleShowcase,
  updateSampleShowcase,
} from '../repositories/sampleRepository.js';
import { uploadFile, isDataUrl } from './storageService.js';
import { cleanSlug, isMockDummyLead, invalidateShowcaseCache } from './showcaseShared.js';

export { cleanSlug };

/**
 * Resolves slug collisions according to policy:
 * - When allowIncrement is true (manual dashboard path): appends -2, -3...
 * - When allowIncrement is false (integration/server-to-server path): throws 409 SLUG_CONFLICT
 */
export const resolveSlugCollision = async (baseSlug, { allowIncrement = true } = {}) => {
  const clean = cleanSlug(baseSlug);
  if (!clean) {
    const err = new Error('Slug must contain valid alphanumeric characters.');
    err.status = 400;
    err.code = 'INVALID_SLUG';
    throw err;
  }

  const existing = await findSampleBySlug(clean, false);
  if (!existing) {
    return clean;
  }

  if (!allowIncrement) {
    const err = new Error(`Slug '${clean}' is already taken.`);
    err.status = 409;
    err.code = 'SLUG_CONFLICT';
    throw err;
  }

  let counter = 2;
  while (await findSampleBySlug(`${clean}-${counter}`, false)) {
    counter++;
  }
  return `${clean}-${counter}`;
};

/**
 * Offloads base64 PDF payloads in leads array to object storage, preserving existing asset keys
 */
export const processLeadsPayload = async (leads, slug, existingLeads = []) => {
  if (!Array.isArray(leads) || leads.length === 0) return [];
  const processed = [];

  for (let idx = 0; idx < leads.length; idx++) {
    const l = { ...leads[idx] };
    const leadId = l.id || `lead-${Date.now()}-${idx + 1}`;
    l.id = leadId;

    const existingLead = (existingLeads || []).find(
      (el) =>
        String(el.id) === String(leadId) ||
        (el.name && l.name && String(el.name).toLowerCase() === String(l.name).toLowerCase())
    );

    // Preserve existing asset keys & phone if client didn't supply replacement
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
        l.pitchDeck.streamUrl = `/api/samples/${slug}/leads/${leadId}/pitch-deck`;
        l.pitchDeck.fileName = originalName;
        l.pitchDeck.fileSize = uploadRes.size;
        l.pitchDeck.mimeType = uploadRes.mimeType;
      } catch (err) {
        console.error(`[prospectService.processLeadsPayload] Failed to upload pitchDeck for ${l.name}:`, err.message);
      }
    }

    // Offload individual lead company logos if provided as base64 data URLs
    const leadLogoCandidate = l.logo || l.companyLogo || l.logoUrl || l.company_logo || l.avatarUrl || null;
    if (leadLogoCandidate && isDataUrl(leadLogoCandidate)) {
      try {
        const originalName = `${leadId}_lead_logo.png`;
        const uploadRes = await uploadFile({
          dataUrl: leadLogoCandidate,
          originalName,
          mimeType: 'image/png',
          prefix: `public-samples/${slug}/leads/${leadId}/logo`,
        });
        l.logoAssetKey = uploadRes.objectKey;
        l.logo = `/api/samples/${slug}/leads/${leadId}/logo`;
        delete l.companyLogo;
        delete l.avatarUrl;
      } catch (err) {
        console.error(`[prospectService.processLeadsPayload] Failed to upload lead logo for ${l.name}:`, err.message);
      }
    }

    processed.push(l);
  }

  return processed;
};

/**
 * Resolves or auto-discovers company logo URL and offloads Data URLs to object storage
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
    outreachMailTemplate = {},
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

  // Upload company study PDF if provided as a Data URL during creation
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

  // Upload pitch deck if provided as a Data URL during creation
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

  const created = await createSampleShowcase({
    slug: effectiveSlug,
    title: effectiveTitle,
    companyName: companyName.trim(),
    description: description || `Curated account intelligence and sales acceleration brief prepared for ${companyName.trim()}.`,
    logoUrl: resolvedLogoUrl,
    logoAssetKey,
    status,
    companyStudy: initialCompanyStudy,
    leads: processedLeads,
    leadStudies: Array.isArray(leadStudies) ? leadStudies : [],
    pitchDeck: initialPitchDeck,
    sourcePlatform,
    externalCampaignId,
    externalProspectId,
    createdByEmail,
    batchId,
    outreachMailTemplate,
  });

  invalidateShowcaseCache();
  return created;
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

  // 3. Process leads array with full leadStudies sync
  if (Array.isArray(body.leads)) {
    const cleanLeadsInput = body.leads.filter((l) => !isMockDummyLead(l));
    body.leads = await processLeadsPayload(cleanLeadsInput, body.slug || sample.slug, sample.leads || []);
    body.leadStudies = body.leads.map((l, index) => ({
      id: l.leadStudy?.id || `study-${index + 1}`,
      leadName: l.name || '',
      role: l.title || '',
      company: l.company || body.companyName || sample.companyName || '',
      whyRelevant: l.leadStudy?.whyRelevant || l.whyRelevant || '',
      observedContext: l.leadStudy?.observedContext || l.observedContext || '',
      potentialOpportunity: l.leadStudy?.potentialOpportunity || l.potentialOpportunity || '',
      suggestedApproach: l.leadStudy?.suggestedApproach || l.suggestedApproach || '',
    }));
  }

  // 4. Update logo with complete fallback parity
  let logoAssetKey = sample.logoAssetKey || sample.logo_asset_key || sample.companyStudy?.logoAssetKey || null;
  let effectiveLogoUrl = body.logoUrl !== undefined ? (body.logoUrl ? String(body.logoUrl).trim() : null) : sample.logoUrl;
  if (effectiveLogoUrl === '/logo.png') effectiveLogoUrl = null;

  if (!effectiveLogoUrl && body.companyStudy?.logoUrl && body.companyStudy.logoUrl !== '/logo.png') {
    effectiveLogoUrl = body.companyStudy.logoUrl;
  }

  if (!effectiveLogoUrl) {
    let domain = '';
    const targetSlug = body.slug || sample.slug || '';
    // ONLY check target company's explicit website (NEVER borrow from leads)
    const explicitWebsite = body.companyStudy?.website || sample.companyStudy?.website;
    if (explicitWebsite && typeof explicitWebsite === 'string') {
      domain = explicitWebsite.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0].split('?')[0].trim();
    }
    if (!domain || !domain.includes('.')) {
      if (targetSlug.includes('.')) {
        domain = targetSlug;
      } else if (targetSlug.endsWith('-ai')) {
        domain = `${targetSlug.replace(/-ai$/, '')}.ai`;
      } else if (targetSlug.endsWith('-io')) {
        domain = `${targetSlug.replace(/-io$/, '')}.io`;
      } else if (targetSlug === 'finkr') {
        domain = 'finkr.co.uk';
      } else if (body.companyName || sample.companyName) {
        domain = `${(body.companyName || sample.companyName).toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
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
        originalName: `${body.slug || sample.slug}_company_logo.png`,
        mimeType: 'image/png',
        prefix: `public-samples/${body.slug || sample.slug}/logo`,
      });
      logoAssetKey = uploadRes.objectKey;
      effectiveLogoUrl = `/api/samples/${body.slug || sample.slug}/logo`;
    } catch (uploadErr) {
      console.error('[prospectService.updateProspect] Failed to upload company logo:', uploadErr.message);
    }
  }

  body.logoUrl = effectiveLogoUrl;
  delete body.logo_url;
  if (logoAssetKey) {
    body.logoAssetKey = logoAssetKey;
    delete body.logo_asset_key;
    if (body.companyStudy) {
      body.companyStudy.logoAssetKey = logoAssetKey;
    }
  }

  const updated = await updateSampleShowcase(id, body);
  invalidateShowcaseCache();
  return updated;
};
