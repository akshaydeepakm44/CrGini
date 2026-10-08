import { query } from '../config/postgres.js';
import { uploadFile, deleteFile, isDataUrl, isMinioObjectKey } from '../services/storageService.js';

/**
 * Ensure performance indexes exist for fast asset joins.
 */
export const ensureAssetIndexes = async () => {
  try {
    await query(`
      CREATE INDEX IF NOT EXISTS idx_submission_files_sub_id ON submission_files (submission_id);
      CREATE INDEX IF NOT EXISTS idx_submissions_req_id ON submissions (request_id);
    `);
  } catch (err) {
    console.warn('[AssetRepository] Note on ensuring indexes:', err.message);
  }
};

/**
 * Map raw database row to clean asset object
 */
const mapAssetRow = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    assetId: row.id,
    fileName: row.file_name,
    mimeType: row.mime_type || 'application/octet-stream',
    fileSize: row.file_size || 'Unknown',
    url: row.storage_url || null,
    storageUrl: row.storage_url || null,
    storageReference: row.storage_url ? (row.storage_url.startsWith('data:') ? 'Inline data' : row.storage_url) : null,
    createdAt: row.created_at,
    submissionId: row.submission_id,
    submissionVersion: row.submission_version || 1,
    submissionTitle: row.submission_title || `Submission V${row.submission_version || 1}`,
    submissionStatus: row.submission_status,
    submittedAt: row.submitted_at,
    requestId: row.request_id,
    ticketCode: row.ticket_code,
    requestTitle: row.request_title,
    serviceType: row.service_type,
    userId: row.user_id,
    companyId: row.company_id,
    companyName: row.company_name || 'Client Workspace',
    clientName: row.client_name || 'Client User',
    clientEmail: row.client_email || null,
    paymentStatus: row.payment_status || null,
  };
};

/**
 * Find assets accessible by a user/company with filtering and sorting
 */
export const findAssets = async ({
  userId,
  companyId,
  role = 'USER',
  serviceTypes = [],
  search = '',
  requestId = '',
  type = 'all',
  sort = 'newest',
} = {}) => {
  const params = [];
  const conditions = [];

  // Authorization filter
  if (role === 'ADMIN') {
    // Admin has access to all assets, but can optionally filter by companyId
    if (companyId && companyId.trim() && companyId !== 'ALL') {
      params.push(companyId.trim());
      conditions.push(`r.company_id::text = $${params.length}`);
    }
  } else if (['COMPANY_LEAD', 'COMPANY_BOOST', 'LANDING_PAGE'].includes(role)) {
    // Team specialist has access to assets matching their service types
    if (serviceTypes.length > 0) {
      params.push(serviceTypes);
      conditions.push(`r.service_type = ANY($${params.length})`);
    }
  } else {
    // Standard client user: strictly must belong to their company or user ID
    if (companyId && userId) {
      params.push(companyId);
      params.push(userId);
      conditions.push(`(r.company_id = $${params.length - 1} OR r.user_id = $${params.length})`);
    } else if (companyId) {
      params.push(companyId);
      conditions.push(`r.company_id = $${params.length}`);
    } else if (userId) {
      params.push(userId);
      conditions.push(`r.user_id = $${params.length}`);
    } else {
      return [];
    }
  }

  // Request ID or Ticket Code filter
  if (requestId && requestId.trim()) {
    params.push(requestId.trim());
    conditions.push(`(r.id::text = $${params.length} OR r.ticket_id ILIKE $${params.length})`);
  }

  // Search filter (searches file name, ticket code, request title, submission title, company name, client name)
  if (search && search.trim()) {
    params.push(`%${search.trim()}%`);
    conditions.push(`(
      sf.name ILIKE $${params.length} OR
      r.ticket_id ILIKE $${params.length} OR
      r.title ILIKE $${params.length} OR
      s.title ILIKE $${params.length} OR
      c.name ILIKE $${params.length} OR
      u.name ILIKE $${params.length}
    )`);
  }

  // File type category filter
  const normalizedType = (type || 'all').toLowerCase();
  if (normalizedType === 'images' || normalizedType === 'image') {
    conditions.push(`(
      sf.type ILIKE 'image/%' OR
      sf.name ILIKE '%.png' OR
      sf.name ILIKE '%.jpg' OR
      sf.name ILIKE '%.jpeg' OR
      sf.name ILIKE '%.webp' OR
      sf.name ILIKE '%.gif' OR
      sf.name ILIKE '%.svg'
    )`);
  } else if (normalizedType === 'videos' || normalizedType === 'video') {
    conditions.push(`(
      sf.type ILIKE 'video/%' OR
      sf.name ILIKE '%.mp4' OR
      sf.name ILIKE '%.mov' OR
      sf.name ILIKE '%.webm' OR
      sf.name ILIKE '%.mkv'
    )`);
  } else if (normalizedType === 'documents' || normalizedType === 'document') {
    conditions.push(`(
      (sf.type NOT ILIKE 'image/%' AND sf.type NOT ILIKE 'video/%') OR
      sf.type IS NULL
    )`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Sort order
  const orderClause = sort === 'oldest'
    ? 'ORDER BY s.submitted_at ASC, sf.created_at ASC'
    : 'ORDER BY s.submitted_at DESC, sf.created_at DESC';

  const sql = `
    SELECT
      sf.id,
      sf.name AS file_name,
      sf.url AS storage_url,
      sf.size AS file_size,
      sf.type AS mime_type,
      sf.created_at,
      s.id AS submission_id,
      s.version AS submission_version,
      s.title AS submission_title,
      s.status AS submission_status,
      s.submitted_at,
      r.id AS request_id,
      r.ticket_id AS ticket_code,
      r.title AS request_title,
      r.service_type,
      r.user_id,
      r.company_id,
      r.payment_status,
      c.name AS company_name,
      u.name AS client_name,
      u.email AS client_email
    FROM submission_files sf
    JOIN submissions s ON s.id = sf.submission_id
    JOIN requests r ON r.id = s.request_id
    LEFT JOIN companies c ON c.id = r.company_id
    LEFT JOIN users u ON u.id = r.user_id
    ${whereClause}
    ${orderClause}
  `;

  const result = await query(sql, params);
  return result.rows.map(mapAssetRow);
};

/**
 * Find single asset by ID with storage reference for streaming/downloading
 */
export const findAssetById = async (assetId) => {
  if (!assetId) return null;

  const sql = `
    SELECT
      sf.id,
      sf.name AS file_name,
      sf.url AS storage_url,
      sf.size AS file_size,
      sf.type AS mime_type,
      sf.created_at,
      s.id AS submission_id,
      s.version AS submission_version,
      s.title AS submission_title,
      s.status AS submission_status,
      s.submitted_at,
      r.id AS request_id,
      r.ticket_id AS ticket_code,
      r.title AS request_title,
      r.service_type,
      r.user_id,
      r.company_id,
      r.payment_status,
      c.name AS company_name,
      u.name AS client_name,
      u.email AS client_email
    FROM submission_files sf
    JOIN submissions s ON s.id = sf.submission_id
    JOIN requests r ON r.id = s.request_id
    LEFT JOIN companies c ON c.id = r.company_id
    LEFT JOIN users u ON u.id = r.user_id
    WHERE sf.id = $1
    LIMIT 1
  `;

  const result = await query(sql, [assetId]);
  if (!result.rows || result.rows.length === 0) return null;

  return mapAssetRow(result.rows[0]);
};

/**
 * Find onboarding ticket for a given user (if already created)
 */
export const findOnboardingTicketByUserId = async (userId) => {
  if (!userId) return null;

  const res = await query(`
    SELECT r.*, s.id AS submission_id
    FROM requests r
    LEFT JOIN submissions s ON s.request_id = r.id AND s.version = 1
    WHERE r.user_id = $1 AND (r.title ILIKE '%Welcome%' OR r.title ILIKE '%Initial Marketing Assets%')
    ORDER BY r.created_at DESC
    LIMIT 1
  `, [userId]);

  return res.rows[0] || null;
};

/**
 * Replace all submission files for a given submission cleanly without duplicates or orphans
 */
export const replaceSubmissionFiles = async (submissionId, files = []) => {
  if (!submissionId) return [];

  // Query previous files for cleanup
  const oldFilesRes = await query(`SELECT id, url FROM submission_files WHERE submission_id = $1`, [submissionId]);
  const oldObjectKeys = oldFilesRes.rows
    .map(r => r.url)
    .filter(u => isMinioObjectKey(u));

  // Remove previous files from database
  await query(`DELETE FROM submission_files WHERE submission_id = $1`, [submissionId]);

  const inserted = [];
  for (const file of files) {
    if (!file) continue;
    const fileName = file.name || file.fileName;
    let fileUrl = file.url || file.dataUrl;
    if (!fileName || !fileUrl) continue;

    if (isDataUrl(fileUrl)) {
      try {
        const uploadRes = await uploadFile({
          dataUrl: fileUrl,
          originalName: fileName,
          mimeType: file.type || file.mimeType,
          prefix: `submissions/${submissionId}`,
        });
        fileUrl = uploadRes.objectKey;
      } catch (uploadErr) {
        console.error('[replaceSubmissionFiles] MinIO upload error, falling back:', uploadErr.message);
      }
    }

    const res = await query(`
      INSERT INTO submission_files (
        submission_id,
        name,
        url,
        size,
        type
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, url, size, type, created_at
    `, [
      submissionId,
      fileName,
      fileUrl,
      file.size || null,
      file.type || file.mimeType || null
    ]);

    inserted.push(res.rows[0]);
  }

  // Safely delete old MinIO objects
  for (const oldKey of oldObjectKeys) {
    if (!inserted.some(ins => ins.url === oldKey)) {
      deleteFile(oldKey).catch(err => console.warn('[MinIO cleanup error]:', err.message));
    }
  }

  return inserted;
};
