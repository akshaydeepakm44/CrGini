import { findAssets, findAssetById } from '../repositories/assetRepository.js';
import { query } from '../config/postgres.js';
import { getFileStream, getObjectStat, isMinioObjectKey, isDataUrl, parseDataUrl } from '../services/storageService.js';
import { extractDocumentText } from '../services/documentExtractor.js';
import fs from 'fs';
import path from 'path';

/**
 * Check if the authenticated user has authorization to access the given asset
 */
const canUserAccessAsset = (user, asset) => {
  if (!user || !asset) return false;
  if (user.role === 'ADMIN') return true;

  if (['COMPANY_LEAD', 'COMPANY_BOOST', 'LANDING_PAGE'].includes(user.role)) {
    const serviceMap = {
      COMPANY_LEAD: ['COMPANY_LEAD'],
      COMPANY_BOOST: ['COMPANY_BOOST'],
      LANDING_PAGE: ['LANDING_PAGE'],
    };
    const allowed = serviceMap[user.role] || [];
    return allowed.includes(asset.serviceType);
  }

  // Client user check
  const userCompanyId = user.companyId || (user.company && (user.company._id || user.company.id));
  const isCompanyMatch = Boolean(userCompanyId && asset.companyId && String(userCompanyId) === String(asset.companyId));
  const isUserMatch = Boolean(asset.userId && String(user._id || user.id) === String(asset.userId));

  return isCompanyMatch || isUserMatch;
};

/**
 * Enforce Key People document protection:
 * - Free/sample leads: requires Key People payment.
 * - Additional leads from paid Request More Leads ticket: automatically included.
 * - Admin and Company Lead specialists: always allowed.
 */
export const checkKeyPeopleEntitlement = async (user, asset) => {
  if (!user || !asset) return false;
  if (['ADMIN', 'COMPANY_LEAD'].includes(user.role)) return true;

  const fileName = asset.fileName || asset.name || '';
  const isKeyPeopleDoc = /\[Key\s*People\]/i.test(fileName) || /Key[-_\s]People/i.test(fileName);
  if (!isKeyPeopleDoc) return true; // not a Key People document

  // If this asset was generated for a paid additional lead sprint (not onboarding sample)
  const isPaidTicket = (asset.paymentStatus === 'PAID' || asset.payment_status === 'PAID') &&
    asset.serviceType === 'COMPANY_LEAD' &&
    asset.ticketCode &&
    !asset.ticketCode.startsWith('CG-LEAD-ONB-');

  if (isPaidTicket) {
    return true;
  }

  // Otherwise, check if user's company has paid for Key People access
  const companyId = asset.companyId || user.companyId || (user.company && (user.company.id || user.company._id));
  if (!companyId) return false;

  const kpRes = await query(`
    SELECT id FROM requests
    WHERE company_id = $1 AND service_type = 'COMPANY_LEAD'
      AND (title ILIKE '%Key People%' OR description ILIKE '%Key People%')
      AND payment_status = 'PAID'
    LIMIT 1
  `, [companyId]);

  return kpRes.rows.length > 0;
};

/**
 * Helper to group flat asset list by Ticket / Request, then by Submission Version
 */
const groupAssetsByTicket = (assets) => {
  const ticketMap = new Map();

  for (const asset of assets) {
    const ticketKey = asset.requestId || asset.ticketCode;
    if (!ticketMap.has(ticketKey)) {
      ticketMap.set(ticketKey, {
        requestId: asset.requestId,
        ticketCode: asset.ticketCode,
        requestTitle: asset.requestTitle,
        serviceType: asset.serviceType,
        companyId: asset.companyId,
        companyName: asset.companyName || 'Client Workspace',
        userId: asset.userId,
        clientName: asset.clientName || 'Client User',
        clientEmail: asset.clientEmail || null,
        latestSubmittedAt: asset.submittedAt,
        totalFiles: 0,
        submissionMap: new Map(),
      });
    }

    const group = ticketMap.get(ticketKey);
    group.totalFiles += 1;
    if (new Date(asset.submittedAt) > new Date(group.latestSubmittedAt)) {
      group.latestSubmittedAt = asset.submittedAt;
    }

    const subKey = asset.submissionVersion || 1;
    if (!group.submissionMap.has(subKey)) {
      group.submissionMap.set(subKey, {
        submissionId: asset.submissionId,
        submissionVersion: asset.submissionVersion,
        submissionTitle: asset.submissionTitle,
        submissionStatus: asset.submissionStatus,
        submittedAt: asset.submittedAt,
        files: [],
      });
    }

    group.submissionMap.get(subKey).files.push(asset);
  }

  // Convert maps to sorted arrays
  return Array.from(ticketMap.values()).map(ticket => ({
    requestId: ticket.requestId,
    ticketCode: ticket.ticketCode,
    requestTitle: ticket.requestTitle,
    serviceType: ticket.serviceType,
    companyId: ticket.companyId,
    companyName: ticket.companyName,
    userId: ticket.userId,
    clientName: ticket.clientName,
    clientEmail: ticket.clientEmail,
    latestSubmittedAt: ticket.latestSubmittedAt,
    totalFiles: ticket.totalFiles,
    submissions: Array.from(ticket.submissionMap.values()).sort(
      (a, b) => b.submissionVersion - a.submissionVersion
    ),
  }));
};

/**
 * GET /api/assets
 * List assets for the authenticated user, organized by ticket and submission version
 */
export const getAssets = async (req, res) => {
  try {
    const userCompanyId = req.user.companyId || (req.user.company && (req.user.company._id || req.user.company.id));
    const userId = req.user._id || req.user.id;

    const { search, requestId, type, sort, companyId } = req.query;

    const effectiveCompanyId = req.user.role === 'ADMIN'
      ? (companyId || null)
      : userCompanyId;

    let serviceTypes = [];
    if (['COMPANY_LEAD', 'COMPANY_BOOST', 'LANDING_PAGE'].includes(req.user.role)) {
      serviceTypes = [req.user.role];
    }

    const assets = await findAssets({
      userId,
      companyId: effectiveCompanyId,
      role: req.user.role,
      serviceTypes,
      search,
      requestId,
      type,
      sort,
    });

    const groupedAssets = groupAssetsByTicket(assets);

    return res.status(200).json({
      success: true,
      count: assets.length,
      assets,
      groupedAssets,
    });
  } catch (error) {
    console.error('[AssetController.getAssets] Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to load media assets.',
    });
  }
};

/**
 * GET /api/assets/:id
 * Retrieve metadata for a single asset with strict authorization
 */
export const getAssetById = async (req, res) => {
  try {
    const { id } = req.params;
    const asset = await findAssetById(id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found.',
      });
    }

    if (!canUserAccessAsset(req.user, asset)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to access this asset.',
      });
    }

    if (!(await checkKeyPeopleEntitlement(req.user, asset))) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Key People access requires payment.',
      });
    }

    // Sanitize storage URL for client metadata response
    const { url, ...safeAsset } = asset;

    return res.status(200).json({
      success: true,
      asset: safeAsset,
    });
  } catch (error) {
    console.error('[AssetController.getAssetById] Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve asset metadata.',
    });
  }
};

/**
 * GET /api/assets/:id/stream
 * Stream image or video with HTTP Range request support for seeking
 */
export const streamAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const asset = await findAssetById(id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found.',
      });
    }

    if (!canUserAccessAsset(req.user, asset)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to access this asset.',
      });
    }

    if (!(await checkKeyPeopleEntitlement(req.user, asset))) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Key People access requires payment.',
      });
    }

    const storageUrl = asset.url;
    const mimeType = asset.mimeType || 'application/octet-stream';

    // Handle Data URL (base64 encoded media)
    if (storageUrl && storageUrl.startsWith('data:')) {
      const matches = storageUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      let buffer;
      let effectiveMime = mimeType;

      if (matches && matches.length === 3) {
        effectiveMime = matches[1] || mimeType;
        buffer = Buffer.from(matches[2], 'base64');
      } else {
        // Fallback split
        const commaIndex = storageUrl.indexOf(',');
        const base64Data = commaIndex !== -1 ? storageUrl.slice(commaIndex + 1) : storageUrl;
        buffer = Buffer.from(base64Data, 'base64');
      }

      const totalSize = buffer.length;
      const range = req.headers.range;

      if (range) {
        // HTTP 206 Range Request handling
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        let end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;
        if (end >= totalSize) {
          end = totalSize - 1;
        }

        if (isNaN(start) || start >= totalSize || start > end) {
          res.setHeader('Content-Range', `bytes */${totalSize}`);
          return res.status(416).send('Requested range not satisfiable');
        }

        const chunk = buffer.subarray(start, end + 1);
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${totalSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunk.length,
          'Content-Type': effectiveMime,
          'Cache-Control': 'private, max-age=86400',
        });
        return res.end(chunk);
      }

      // No range specified: send full buffer with Accept-Ranges
      res.writeHead(200, {
        'Accept-Ranges': 'bytes',
        'Content-Length': totalSize,
        'Content-Type': effectiveMime,
        'Cache-Control': 'private, max-age=86400',
      });
      return res.end(buffer);
    }

    // Handle Local File Path if storageUrl points to disk
    if (storageUrl && (storageUrl.startsWith('/') || storageUrl.startsWith('./') || fs.existsSync(storageUrl))) {
      const filePath = path.resolve(storageUrl);
      if (fs.existsSync(filePath)) {
        const stat = fs.statSync(filePath);
        const totalSize = stat.size;
        const range = req.headers.range;

        if (range) {
          const parts = range.replace(/bytes=/, '').split('-');
          const start = parseInt(parts[0], 10);
          let end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;
          if (end >= totalSize) {
            end = totalSize - 1;
          }

          if (isNaN(start) || start >= totalSize || start > end) {
            res.setHeader('Content-Range', `bytes */${totalSize}`);
            return res.status(416).send('Requested range not satisfiable');
          }

          const stream = fs.createReadStream(filePath, { start, end });
          res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${totalSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': end - start + 1,
            'Content-Type': mimeType,
            'Cache-Control': 'private, max-age=86400',
          });
          return stream.pipe(res);
        }

        res.writeHead(200, {
          'Accept-Ranges': 'bytes',
          'Content-Length': totalSize,
          'Content-Type': mimeType,
          'Cache-Control': 'private, max-age=86400',
        });
        return fs.createReadStream(filePath).pipe(res);
      }
    }

    // Handle MinIO Object Key
    if (storageUrl && (isMinioObjectKey(storageUrl) || (!storageUrl.startsWith('data:') && !storageUrl.startsWith('http') && !fs.existsSync(storageUrl)))) {
      try {
        const stat = await getObjectStat(storageUrl).catch(() => null);
        const totalSize = stat ? stat.size : null;
        const effectiveMime = stat?.metaData?.['content-type'] || mimeType;
        const range = req.headers.range;

        if (range && totalSize !== null) {
          const parts = range.replace(/bytes=/, '').split('-');
          const start = parseInt(parts[0], 10);
          let end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;
          if (end >= totalSize) {
            end = totalSize - 1;
          }

          if (isNaN(start) || start >= totalSize || start > end) {
            res.setHeader('Content-Range', `bytes */${totalSize}`);
            return res.status(416).send('Requested range not satisfiable');
          }

          const chunkLength = end - start + 1;
          const stream = await getFileStream(storageUrl, { offset: start, length: chunkLength });

          res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${totalSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkLength,
            'Content-Type': effectiveMime,
            'Cache-Control': 'private, max-age=86400',
          });
          return stream.pipe(res);
        }

        const stream = await getFileStream(storageUrl);
        const headers = {
          'Accept-Ranges': 'bytes',
          'Content-Type': effectiveMime,
          'Cache-Control': 'private, max-age=86400',
        };
        if (totalSize !== null) {
          headers['Content-Length'] = totalSize;
        }

        res.writeHead(200, headers);
        return stream.pipe(res);
      } catch (minioErr) {
        console.error('[AssetController.streamAsset] MinIO fetch error:', minioErr.message);
        return res.status(404).json({
          success: false,
          message: 'Asset media stream unavailable from object storage.',
        });
      }
    }

    // Default: Content not found
    return res.status(404).json({
      success: false,
      message: 'Asset media stream unavailable.',
    });
  } catch (error) {
    console.error('[AssetController.streamAsset] Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to stream media asset.',
    });
  }
};

/**
 * GET /api/assets/:id/download
 * Download asset with Content-Disposition preserving original filename
 */
export const downloadAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const asset = await findAssetById(id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found.',
      });
    }

    if (!canUserAccessAsset(req.user, asset)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to download this asset.',
      });
    }

    if (!(await checkKeyPeopleEntitlement(req.user, asset))) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Key People access requires payment.',
      });
    }

    const safeFilename = (asset.fileName || 'asset-file').replace(/["\r\n]/g, '_');
    const mimeType = asset.mimeType || 'application/octet-stream';
    const storageUrl = asset.url;

    // Handle Data URL
    if (storageUrl && storageUrl.startsWith('data:')) {
      const commaIndex = storageUrl.indexOf(',');
      const base64Data = commaIndex !== -1 ? storageUrl.slice(commaIndex + 1) : storageUrl;
      const buffer = Buffer.from(base64Data, 'base64');

      res.writeHead(200, {
        'Content-Type': mimeType,
        'Content-Length': buffer.length,
        'Content-Disposition': `attachment; filename="${safeFilename}"`,
        'Cache-Control': 'no-cache',
      });
      return res.end(buffer);
    }

    // Handle local file
    if (storageUrl && fs.existsSync(storageUrl)) {
      return res.download(storageUrl, safeFilename);
    }

    // Handle external URL
    if (storageUrl && storageUrl.startsWith('http')) {
      return res.redirect(storageUrl);
    }

    // Handle MinIO Object Key
    if (storageUrl && (isMinioObjectKey(storageUrl) || (!storageUrl.startsWith('data:') && !storageUrl.startsWith('http') && !fs.existsSync(storageUrl)))) {
      try {
        const stat = await getObjectStat(storageUrl).catch(() => null);
        const effectiveMime = stat?.metaData?.['content-type'] || mimeType;
        const stream = await getFileStream(storageUrl);

        const headers = {
          'Content-Type': effectiveMime,
          'Content-Disposition': `attachment; filename="${safeFilename}"`,
          'Cache-Control': 'no-cache',
        };
        if (stat?.size) {
          headers['Content-Length'] = stat.size;
        }

        res.writeHead(200, headers);
        return stream.pipe(res);
      } catch (minioErr) {
        console.error('[AssetController.downloadAsset] MinIO download error:', minioErr.message);
        return res.status(404).json({
          success: false,
          message: 'Asset file not available for download from object storage.',
        });
      }
    }

    return res.status(404).json({
      success: false,
      message: 'Asset file not available for download.',
    });
  } catch (error) {
    console.error('[AssetController.downloadAsset] Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to download asset.',
    });
  }
};

// @desc    Extract and return readable text content for a document asset (PDF, DOC, DOCX)
// @route   GET /api/assets/:id/content
// @access  Private
export const getAssetContent = async (req, res) => {
  try {
    const asset = await findAssetById(req.params.id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found',
      });
    }

    if (!canUserAccessAsset(req.user, asset)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have permission to access this asset.',
      });
    }

    const hasKpAccess = await checkKeyPeopleEntitlement(req.user, asset);
    if (!hasKpAccess) {
      return res.status(403).json({
        success: false,
        message: 'Key People intelligence document is locked. Payment required.',
        isLocked: true,
      });
    }

    const storageUrl = asset.url || asset.storageUrl;
    let buffer = null;

    if (isDataUrl(storageUrl)) {
      const parsed = parseDataUrl(storageUrl);
      buffer = parsed.buffer;
    } else if (storageUrl && fs.existsSync(storageUrl)) {
      buffer = fs.readFileSync(storageUrl);
    } else if (storageUrl && (isMinioObjectKey(storageUrl) || (!storageUrl.startsWith('data:') && !storageUrl.startsWith('http')))) {
      const stream = await getFileStream(storageUrl);
      const chunks = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      buffer = Buffer.concat(chunks);
    }

    let content = null;
    if (buffer) {
      content = extractDocumentText(buffer, asset.mimeType, asset.fileName);
    }

    return res.json({
      success: true,
      assetId: asset.id,
      fileName: asset.fileName,
      mimeType: asset.mimeType,
      content,
      hasContent: Boolean(content && content.trim().length > 0),
    });
  } catch (error) {
    console.error('[AssetController.getAssetContent] Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to extract asset content.',
    });
  }
};

