import * as Minio from 'minio';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { Readable } from 'stream';

/**
 * MinIO Storage Service
 * Handles object storage operations for CreativeGini deliverables, public samples, and onboarding assets.
 * Supports production MinIO / S3 as primary driver, with an automatic Local Disk Bucket driver
 * for local development and offline environments, ensuring PostgreSQL stores ONLY metadata
 * and large binary files are NEVER inappropriately stored as huge base64 strings in PostgreSQL.
 */

let minioClient = null;
let customStorageDriver = null; // Used for mocking/testing
let isMinioReachable = null; // Cache connectivity check
let localDiskDriverInstance = null;

/**
 * Local Disk Bucket Driver
 * Emulates the MinIO Client S3 interface by storing objects as binary files on disk.
 */
class LocalDiskStorageDriver {
  constructor(baseDir = path.resolve(process.cwd(), 'storage', 'buckets')) {
    this.baseDir = baseDir;
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  _resolveSafePath(bucket, objectKey) {
    const cleanBucket = String(bucket).replace(/[^a-zA-Z0-9_\-\.]/g, '_');
    const safeKeyParts = String(objectKey)
      .replace(/\\/g, '/')
      .split('/')
      .filter((part) => part && part !== '.' && part !== '..');

    const bucketDir = path.join(this.baseDir, cleanBucket);
    const targetPath = path.join(bucketDir, ...safeKeyParts);

    // Guard against directory traversal attacks
    if (!targetPath.startsWith(this.baseDir)) {
      throw new Error('Access denied: Path traversal attempt detected');
    }

    return { bucketDir, targetPath };
  }

  async bucketExists(bucket) {
    const bucketDir = path.join(this.baseDir, String(bucket).replace(/[^a-zA-Z0-9_\-\.]/g, '_'));
    return fs.existsSync(bucketDir);
  }

  async makeBucket(bucket, region) {
    const bucketDir = path.join(this.baseDir, String(bucket).replace(/[^a-zA-Z0-9_\-\.]/g, '_'));
    if (!fs.existsSync(bucketDir)) {
      fs.mkdirSync(bucketDir, { recursive: true });
    }
  }

  async putObject(bucket, objectKey, streamOrBuffer, size, metaData = {}) {
    const { targetPath } = this._resolveSafePath(bucket, objectKey);
    const targetDir = path.dirname(targetPath);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    if (Buffer.isBuffer(streamOrBuffer)) {
      await fs.promises.writeFile(targetPath, streamOrBuffer);
    } else if (streamOrBuffer instanceof Readable) {
      const writeStream = fs.createWriteStream(targetPath);
      await new Promise((resolve, reject) => {
        streamOrBuffer.pipe(writeStream);
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });
    } else {
      throw new Error('Invalid payload: must be Buffer or Readable stream');
    }

    // Persist metadata sidecar
    const metaPath = `${targetPath}.meta.json`;
    const metaPayload = {
      size: fs.statSync(targetPath).size,
      metaData: metaData || {},
      lastModified: new Date().toISOString(),
    };
    await fs.promises.writeFile(metaPath, JSON.stringify(metaPayload, null, 2), 'utf-8');

    return { etag: crypto.createHash('md5').update(objectKey).digest('hex'), versionId: null };
  }

  async getObject(bucket, objectKey) {
    const { targetPath } = this._resolveSafePath(bucket, objectKey);
    if (!fs.existsSync(targetPath)) {
      const err = new Error(`Object ${objectKey} not found in bucket ${bucket}`);
      err.code = 'NotFound';
      throw err;
    }
    return fs.createReadStream(targetPath);
  }

  async getPartialObject(bucket, objectKey, offset, length) {
    const { targetPath } = this._resolveSafePath(bucket, objectKey);
    if (!fs.existsSync(targetPath)) {
      const err = new Error(`Object ${objectKey} not found in bucket ${bucket}`);
      err.code = 'NotFound';
      throw err;
    }
    const end = length !== null && length > 0 ? offset + length - 1 : undefined;
    return fs.createReadStream(targetPath, { start: offset, end });
  }

  async statObject(bucket, objectKey) {
    const { targetPath } = this._resolveSafePath(bucket, objectKey);
    if (!fs.existsSync(targetPath)) {
      const err = new Error(`Object ${objectKey} not found in bucket ${bucket}`);
      err.code = 'NotFound';
      throw err;
    }

    const stat = await fs.promises.stat(targetPath);
    const metaPath = `${targetPath}.meta.json`;
    let metaData = {};
    if (fs.existsSync(metaPath)) {
      try {
        const metaContent = await fs.promises.readFile(metaPath, 'utf-8');
        const parsed = JSON.parse(metaContent);
        metaData = parsed.metaData || {};
      } catch (e) {
        // ignore malformed sidecar
      }
    }

    return {
      size: stat.size,
      metaData,
      lastModified: stat.mtime,
      etag: crypto.createHash('md5').update(objectKey).digest('hex'),
    };
  }

  async removeObject(bucket, objectKey) {
    const { targetPath } = this._resolveSafePath(bucket, objectKey);
    if (fs.existsSync(targetPath)) {
      await fs.promises.unlink(targetPath).catch(() => {});
    }
    const metaPath = `${targetPath}.meta.json`;
    if (fs.existsSync(metaPath)) {
      await fs.promises.unlink(metaPath).catch(() => {});
    }
  }
}

/**
 * Get or initialize the storage client.
 * Prioritizes live MinIO client if reachable; falls back cleanly to LocalDiskStorageDriver.
 */
export const getMinioClient = () => {
  if (customStorageDriver) {
    return customStorageDriver;
  }

  // If MinIO client was previously created and marked reachable, use it
  if (minioClient && isMinioReachable === true) {
    return minioClient;
  }

  // Check if MinIO configuration is present
  const endpoint = process.env.MINIO_ENDPOINT;
  const port = process.env.MINIO_PORT ? parseInt(process.env.MINIO_PORT, 10) : 9000;
  const useSSL = process.env.MINIO_USE_SSL === 'true';
  const accessKey = process.env.MINIO_ACCESS_KEY;
  const secretKey = process.env.MINIO_SECRET_KEY;

  if (endpoint && accessKey && secretKey && isMinioReachable !== false) {
    if (!minioClient) {
      minioClient = new Minio.Client({
        endPoint: endpoint,
        port,
        useSSL,
        accessKey,
        secretKey,
      });
    }
    return minioClient;
  }

  // Use local disk storage driver
  if (!localDiskDriverInstance) {
    localDiskDriverInstance = new LocalDiskStorageDriver();
  }
  return localDiskDriverInstance;
};

/**
 * Perform a storage health check and determine active driver.
 */
export const checkStorageHealth = async () => {
  const bucket = getBucketName();
  try {
    const client = getMinioClient();
    if (!client) {
      return { status: 'unhealthy', message: 'No storage driver initialized' };
    }

    let exists = false;
    try {
      exists = await client.bucketExists(bucket);
    } catch (netErr) {
      // If MinIO network call failed (e.g. ECONNREFUSED in dev)
      if (client instanceof Minio.Client) {
        isMinioReachable = false;
        minioClient = null;
        localDiskDriverInstance = new LocalDiskStorageDriver();
        exists = await localDiskDriverInstance.bucketExists(bucket);
      } else {
        throw netErr;
      }
    }

    if (!exists) {
      await client.makeBucket(bucket, 'us-east-1');
    }

    const isMinio = !(client instanceof LocalDiskStorageDriver);
    return {
      status: 'healthy',
      driver: isMinio ? 'MinIO S3' : 'LocalDiskBucket',
      bucket,
      storageReady: true,
    };
  } catch (err) {
    return {
      status: 'degraded',
      message: err.message,
      bucket,
      storageReady: false,
    };
  }
};

/**
 * Set a mock/custom storage driver for testing without external infrastructure.
 */
export const setStorageDriver = (driver) => {
  customStorageDriver = driver;
};

/**
 * Reset storage driver to default.
 */
export const resetStorageDriver = () => {
  customStorageDriver = null;
  minioClient = null;
  isMinioReachable = null;
  localDiskDriverInstance = null;
};

/**
 * Get the configured bucket name from environment variables.
 */
export const getBucketName = () => {
  return process.env.MINIO_BUCKET || 'creativegini-assets';
};

/**
 * Ensure the target MinIO bucket exists, creating it if necessary.
 */
export const ensureBucketExists = async (bucket = getBucketName()) => {
  const client = getMinioClient();
  if (!client) {
    throw new Error('Storage client is not configured.');
  }

  let exists = false;
  try {
    exists = await client.bucketExists(bucket);
  } catch (err) {
    if (client instanceof Minio.Client) {
      // MinIO daemon unreachable; switch to local disk bucket
      isMinioReachable = false;
      const fallback = getMinioClient();
      exists = await fallback.bucketExists(bucket);
      if (!exists) {
        await fallback.makeBucket(bucket, 'us-east-1');
      }
      return;
    }
    throw err;
  }

  if (!exists) {
    await client.makeBucket(bucket, 'us-east-1');
  }
};

/**
 * Check if a string is a base64 Data URL.
 */
export const isDataUrl = (str) => {
  if (typeof str !== 'string') return false;
  return str.startsWith('data:') && str.includes(';base64,');
};

/**
 * Parse a Data URL into a Buffer and its detected MIME type.
 */
export const parseDataUrl = (dataUrl) => {
  if (!isDataUrl(dataUrl)) {
    throw new Error('Invalid Data URL format. Expected data:[mime];base64,[data]');
  }

  const commaIndex = dataUrl.indexOf(',');
  const meta = dataUrl.slice(0, commaIndex);
  const base64Data = dataUrl.slice(commaIndex + 1);

  const mimeMatch = meta.match(/^data:([^;]+)/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
  const buffer = Buffer.from(base64Data, 'base64');

  return { buffer, mimeType, size: buffer.length };
};

/**
 * Generate a safe, collision-resistant object key with structured prefixes.
 * Format: {prefix}/{uuid}-{safeFilename}
 */
export const generateObjectKey = ({ prefix = 'assets', originalName = 'file' }) => {
  const cleanPrefix = String(prefix).replace(/^\/+|\/+$/g, '');
  const ext = path.extname(originalName) || '';
  const base = path.basename(originalName, ext)
    .replace(/[^a-zA-Z0-9_\-\.]/g, '_')
    .slice(0, 50);

  const uniqueId = crypto.randomUUID();
  const safeFilename = `${uniqueId}-${base}${ext}`;

  return `${cleanPrefix}/${safeFilename}`;
};

/**
 * Generate a deterministic, tenant-isolated object key for specialist deliverables.
 * Format: companies/{companyId}/requests/{requestId}/submissions/{submissionId}/v{version}/{uuid}-{safeFilename}
 */
export const generateDeterministicDeliverableKey = ({
  companyId = 'general',
  requestId = 'general',
  submissionId = '1',
  version = 1,
  originalName = 'deliverable.pdf',
}) => {
  const cleanCompanyId = String(companyId).replace(/[^a-zA-Z0-9_\-]/g, '_');
  const cleanRequestId = String(requestId).replace(/[^a-zA-Z0-9_\-]/g, '_');
  const cleanSubId = String(submissionId).replace(/[^a-zA-Z0-9_\-]/g, '_');
  const cleanVersion = `v${Number(version) || 1}`;

  const prefix = `companies/${cleanCompanyId}/requests/${cleanRequestId}/submissions/${cleanSubId}/${cleanVersion}`;
  return generateObjectKey({ prefix, originalName });
};

/**
 * Upload a Buffer or Data URL to Object Storage and return the object key and metadata.
 */
export const uploadFile = async ({
  buffer,
  dataUrl,
  originalName = 'upload.bin',
  mimeType = null,
  prefix = 'assets',
  bucket = getBucketName(),
  companyId = null,
  requestId = null,
  submissionId = null,
  version = null,
}) => {
  let fileBuffer = buffer;
  let effectiveMime = mimeType;
  let fileSize = 0;

  if (dataUrl) {
    const parsed = parseDataUrl(dataUrl);
    fileBuffer = parsed.buffer;
    effectiveMime = mimeType || parsed.mimeType;
  }

  if (!Buffer.isBuffer(fileBuffer)) {
    throw new Error('File payload must be a Buffer or valid base64 Data URL.');
  }

  fileSize = fileBuffer.length;
  effectiveMime = effectiveMime || 'application/octet-stream';

  // Determine key structure: use deterministic deliverable key if company & request are provided
  let objectKey;
  if (companyId && (requestId || submissionId)) {
    objectKey = generateDeterministicDeliverableKey({
      companyId,
      requestId,
      submissionId,
      version: version || 1,
      originalName,
    });
  } else {
    objectKey = generateObjectKey({ prefix, originalName });
  }

  let client = getMinioClient();
  if (!client) {
    throw new Error('Storage client is not available.');
  }

  const metaData = {
    'content-type': effectiveMime,
    'x-amz-meta-original-name': encodeURIComponent(originalName),
  };

  try {
    await client.putObject(bucket, objectKey, fileBuffer, fileSize, metaData);
  } catch (err) {
    // If MinIO client had connection failure, seamlessly fall back to local disk driver
    if (client instanceof Minio.Client) {
      console.warn('[StorageService] MinIO network call failed, falling back to LocalDiskBucket:', err.message);
      isMinioReachable = false;
      minioClient = null;
      client = getMinioClient();
      await client.putObject(bucket, objectKey, fileBuffer, fileSize, metaData);
    } else {
      throw err;
    }
  }

  return {
    objectKey,
    bucket,
    size: fileSize,
    mimeType: effectiveMime,
    originalName,
  };
};

/**
 * Retrieve a readable stream for an object from Object Storage.
 */
export const getFileStream = async (objectKey, { bucket = getBucketName(), offset = 0, length = null } = {}) => {
  let client = getMinioClient();
  if (!client) {
    throw new Error('Storage client is not available.');
  }

  try {
    if (length !== null && length > 0) {
      return await client.getPartialObject(bucket, objectKey, offset, length);
    }
    return await client.getObject(bucket, objectKey);
  } catch (err) {
    if (client instanceof Minio.Client) {
      isMinioReachable = false;
      minioClient = null;
      client = getMinioClient();
      if (length !== null && length > 0) {
        return await client.getPartialObject(bucket, objectKey, offset, length);
      }
      return await client.getObject(bucket, objectKey);
    }
    throw err;
  }
};

/**
 * Get object metadata and stat from Object Storage.
 */
export const getObjectStat = async (objectKey, bucket = getBucketName()) => {
  let client = getMinioClient();
  if (!client) {
    throw new Error('Storage client is not available.');
  }

  try {
    return await client.statObject(bucket, objectKey);
  } catch (err) {
    if (client instanceof Minio.Client) {
      isMinioReachable = false;
      minioClient = null;
      client = getMinioClient();
      return await client.statObject(bucket, objectKey);
    }
    throw err;
  }
};

/**
 * Check if an object exists in Object Storage.
 */
export const objectExists = async (objectKey, bucket = getBucketName()) => {
  try {
    await getObjectStat(objectKey, bucket);
    return true;
  } catch (err) {
    if (err.code === 'NotFound' || err.message?.includes('Not Found') || err.message?.includes('NoSuchKey')) {
      return false;
    }
    throw err;
  }
};

/**
 * Delete an object from Object Storage.
 */
export const deleteFile = async (objectKey, bucket = getBucketName()) => {
  if (!objectKey) return;
  const client = getMinioClient();
  if (!client) {
    throw new Error('Storage client is not available.');
  }

  try {
    await client.removeObject(bucket, objectKey);
  } catch (err) {
    // If the object is already gone, treat as successful deletion
    if (err.code === 'NotFound' || err.message?.includes('NoSuchKey')) {
      return;
    }
    throw err;
  }
};

/**
 * Determine if a stored URL field is an Object Storage key rather than a base64 string or HTTP URL.
 */
export const isMinioObjectKey = (url) => {
  if (!url || typeof url !== 'string') return false;
  if (url.startsWith('data:')) return false;
  if (url.startsWith('http://') || url.startsWith('https://')) return false;
  if (url.startsWith('/uploads/')) return false;
  // Standard object key patterns
  return /^[a-zA-Z0-9_\-\/]+\/[0-9a-fA-F-]{36}-.+$/.test(url) ||
         /^(companies|submissions|leads|onboarding|assets|public-samples)\//i.test(url);
};
