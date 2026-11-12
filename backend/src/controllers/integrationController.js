import busboy from 'busboy';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { query } from '../config/postgres.js';
import { getBucketName } from '../services/storageService.js';

const MAX_ASSET_SIZE = 25 * 1024 * 1024; // 25MB
const getMaxAssetSize = () =>
  process.env.TEST_MAX_ASSET_SIZE
    ? parseInt(process.env.TEST_MAX_ASSET_SIZE, 10)
    : MAX_ASSET_SIZE;

/**
 * GET /api/integration/v1/health
 * Requires valid API key (no specific scope).
 */
export async function getIntegrationHealth(req, res) {
  return res.status(200).json({
    status: 'ok',
    clientName: req.apiClient.clientName,
    scopes: req.apiClient.scopes,
  });
}

/**
 * GET /api/integration/v1/schema
 * Requires prospects:write scope.
 * Returns JSON Schema describing accepted payload for POST /prospects.
 */
export async function getIntegrationSchema(req, res) {
  const schema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'ProspectPayload',
    type: 'object',
    required: ['companyName', 'externalCampaignId', 'externalProspectId'],
    properties: {
      companyName: {
        type: 'string',
        minLength: 1,
        maxLength: 255,
        description: 'Name of the target prospect company.',
      },
      website: {
        type: 'string',
        format: 'uri',
        description: 'Target company website or domain URL.',
      },
      category: {
        type: 'string',
        maxLength: 100,
        description: 'Service or industry classification category.',
      },
      industry: {
        type: 'string',
        maxLength: 100,
        description: 'Primary industry classification.',
      },
      description: {
        type: 'string',
        maxLength: 5000,
        description: 'Overview description of the target company.',
      },
      logoUrl: {
        type: 'string',
        format: 'uri',
        description: 'Public URL to company logo (must be HTTP/HTTPS).',
      },
      logoAssetKey: {
        type: 'string',
        description: 'Pre-uploaded staged logo asset key (dzg_ast_<uuid>).',
      },
      sourcePlatform: {
        type: 'string',
        enum: ['DIZITALGINI', 'MANUAL'],
        default: 'DIZITALGINI',
      },
      externalCampaignId: {
        type: 'string',
        minLength: 1,
        maxLength: 255,
        description: 'Unique campaign identifier from originating system.',
      },
      externalProspectId: {
        type: 'string',
        minLength: 1,
        maxLength: 255,
        description: 'Unique prospect identifier within the campaign.',
      },
      batchId: {
        type: 'string',
        format: 'uuid',
        description: 'UUID of the push batch.',
      },
      pushedByEmail: {
        type: 'string',
        format: 'email',
        description: 'Email address of the operator pushing the prospect.',
      },
      companyStudy: {
        type: 'object',
        properties: {
          overview: { type: 'string' },
          website: { type: 'string' },
          strengths: { type: 'array', items: { type: 'string' } },
          weaknesses: { type: 'array', items: { type: 'string' } },
          opportunities: { type: 'array', items: { type: 'string' } },
          threats: { type: 'array', items: { type: 'string' } },
          customNotes: { type: 'string' },
          pdfAssetKey: {
            type: 'string',
            description: 'Staged asset key for company study PDF.',
          },
        },
      },
      leads: {
        type: 'array',
        items: {
          type: 'object',
          required: ['name'],
          properties: {
            id: { type: 'string' },
            name: { type: 'string', minLength: 1 },
            title: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            linkedin: { type: 'string', format: 'uri' },
            pitchDeckAssetKey: {
              type: 'string',
              description: 'Staged asset key for customized lead pitch deck PDF.',
            },
            leadStudyPdfAssetKey: {
              type: 'string',
              description: 'Staged asset key for individual lead dossier PDF.',
            },
          },
        },
      },
      outreachMailTemplate: {
        type: 'object',
        properties: {
          subject: { type: 'string' },
          bodyText: { type: 'string' },
          bodyHtml: { type: 'string' },
          recipientEmail: { type: 'string' },
          senderEmail: { type: 'string' },
        },
      },
    },
  };

  return res.status(200).json({
    success: true,
    version: '1.0.0',
    schema,
  });
}

/**
 * POST /api/integration/v1/assets
 * Requires assets:write scope.
 * Accepts multipart/form-data with single PDF file under field name `file`.
 * Max size: 25MB.
 * Validates %PDF- magic bytes, calculates SHA-256 during streaming, stores in temp area,
 * inserts STAGED row into integration_assets.
 */
export async function uploadIntegrationAsset(req, res) {
  const contentType = req.headers['content-type'] || '';
  if (!contentType.includes('multipart/form-data')) {
    return res.status(400).json({
      success: false,
      error: 'INVALID_CONTENT_TYPE',
      message: 'Asset upload must be multipart/form-data.',
    });
  }

  const effectiveMaxSize = getMaxAssetSize();
  let bb;
  try {
    bb = busboy({
      headers: req.headers,
      limits: {
        fileSize: effectiveMaxSize,
        files: 1,
      },
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: 'MULTIPART_PARSER_ERROR',
      message: err.message,
    });
  }

  const clientId = req.apiClient.clientId;
  const uuid = crypto.randomUUID();
  const bucket = getBucketName();
  const targetDir = path.resolve(
    process.cwd(),
    'storage',
    'buckets',
    bucket,
    'temp',
    clientId
  );
  const targetPath = path.join(targetDir, `${uuid}.pdf`);
  const metaPath = `${targetPath}.meta.json`;

  let fileEncountered = false;
  let fileError = null; // { status, error, message }
  let bytesReceived = 0;
  let writeStream = null;
  let hasher = crypto.createHash('sha256');
  let firstChunkInspected = false;
  let responseSent = false;

  const safeCleanup = async () => {
    try {
      if (writeStream && !writeStream.destroyed) {
        writeStream.destroy();
      }
      if (fs.existsSync(targetPath)) {
        await fs.promises.unlink(targetPath).catch(() => {});
      }
      if (fs.existsSync(metaPath)) {
        await fs.promises.unlink(metaPath).catch(() => {});
      }
    } catch (_) {}
  };

  const sendErrorOnce = async (status, error, message) => {
    if (responseSent) return;
    responseSent = true;
    await safeCleanup();
    return res.status(status).json({
      success: false,
      error,
      message,
    });
  };

  bb.on('file', (fieldname, fileStream, info) => {
    if (fieldname !== 'file') {
      fileStream.resume(); // drain unexpected fields
      fileError = {
        status: 400,
        error: 'INVALID_FIELD_NAME',
        message: 'File must be uploaded under field name "file".',
      };
      return;
    }

    if (fileEncountered) {
      fileStream.resume(); // only one file permitted
      fileError = {
        status: 400,
        error: 'MULTIPLE_FILES_FORBIDDEN',
        message: 'Only a single file may be uploaded per request.',
      };
      return;
    }

    fileEncountered = true;

    try {
      fs.mkdirSync(targetDir, { recursive: true });
      writeStream = fs.createWriteStream(targetPath);
    } catch (fsErr) {
      fileStream.resume();
      fileError = {
        status: 500,
        error: 'STORAGE_INIT_ERROR',
        message: fsErr.message,
      };
      return;
    }

    fileStream.on('data', (chunk) => {
      if (fileError) return;

      // 1. Magic bytes check on first chunk: %PDF- (0x25, 0x50, 0x44, 0x46, 0x2d)
      if (!firstChunkInspected) {
        firstChunkInspected = true;
        const magic = chunk.subarray(0, 5).toString('ascii');
        if (magic !== '%PDF-') {
          fileError = {
            status: 400,
            error: 'INVALID_FILE_TYPE',
            message: 'Only application/pdf files are accepted. Invalid magic bytes.',
          };
          fileStream.destroy();
          return;
        }
      }

      bytesReceived += chunk.length;

      // 2. Size limit check
      if (bytesReceived > effectiveMaxSize) {
        fileError = {
          status: 413,
          error: 'FILE_TOO_LARGE',
          message: 'File size exceeds maximum allowed limit of 25MB.',
        };
        fileStream.destroy();
        return;
      }

      hasher.update(chunk);
      writeStream.write(chunk);
    });

    fileStream.on('limit', () => {
      fileError = {
        status: 413,
        error: 'FILE_TOO_LARGE',
        message: 'File size exceeds maximum allowed limit of 25MB.',
      };
      if (writeStream) writeStream.destroy();
    });

    fileStream.on('error', (err) => {
      if (!fileError) {
        fileError = {
          status: 400,
          error: 'STREAM_ERROR',
          message: err.message,
        };
      }
    });

    fileStream.on('end', () => {
      if (writeStream && !writeStream.destroyed) {
        writeStream.end();
      }
    });
  });

  req.on('aborted', async () => {
    await safeCleanup();
  });

  bb.on('error', async (err) => {
    await sendErrorOnce(400, 'MULTIPART_ERROR', err.message);
  });

  bb.on('finish', async () => {
    if (responseSent) return;

    if (!fileEncountered) {
      return sendErrorOnce(
        400,
        'NO_FILE_PROVIDED',
        'No file provided under field name "file".'
      );
    }

    if (fileError) {
      return sendErrorOnce(fileError.status, fileError.error, fileError.message);
    }

    if (bytesReceived === 0) {
      return sendErrorOnce(
        400,
        'EMPTY_FILE',
        'Uploaded file is empty (0 bytes).'
      );
    }

    // Wait for writeStream to finish flushing to disk
    if (writeStream && !writeStream.writableEnded) {
      await new Promise((resolve) => writeStream.on('finish', resolve));
    }

    try {
      // Persist metadata sidecar
      const metaPayload = {
        size: bytesReceived,
        metaData: {
          'content-type': 'application/pdf',
          'client-id': clientId,
        },
        lastModified: new Date().toISOString(),
      };
      await fs.promises.writeFile(metaPath, JSON.stringify(metaPayload, null, 2), 'utf-8');

      const assetKey = `dzg_ast_${uuid}`;
      const sha256Hex = hasher.digest('hex');

      const dbRes = await query(
        `INSERT INTO integration_assets (
          asset_key,
          client_id,
          sha256,
          size,
          mime_type,
          status,
          expires_at
        ) VALUES ($1, $2, $3, $4, 'application/pdf', 'STAGED', NOW() + INTERVAL '24 hours')
        RETURNING asset_key, sha256, size, expires_at;`,
        [assetKey, clientId, sha256Hex, bytesReceived]
      );

      const assetRow = dbRes.rows[0];
      responseSent = true;

      return res.status(201).json({
        success: true,
        assetKey: assetRow.asset_key,
        sha256: assetRow.sha256,
        size: Number(assetRow.size),
        expiresAt: assetRow.expires_at,
      });
    } catch (dbErr) {
      await safeCleanup();
      return sendErrorOnce(
        500,
        'DATABASE_ERROR',
        `Failed to register staged asset: ${dbErr.message}`
      );
    }
  });

  req.pipe(bb);
}
