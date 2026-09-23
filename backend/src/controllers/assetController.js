import { findAssets, findAssetById, ensureAssetIndexes } from '../repositories/assetRepository.js';
import fs from 'fs';
import path from 'path';

// Run index creation on startup
ensureAssetIndexes().catch(() => {});

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
        const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;

        if (start >= totalSize || end >= totalSize || start > end) {
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
          const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;

          if (start >= totalSize || end >= totalSize || start > end) {
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

    // If external mock URL (e.g. https://creativegini.com/files/...), generate a placeholder SVG or redirect
    if (storageUrl && storageUrl.startsWith('http')) {
      // In development / demo, if the external file is on a public server, we can redirect or pipe
      return res.redirect(storageUrl);
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
