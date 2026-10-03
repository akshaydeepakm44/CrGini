import * as Minio from 'minio';
import crypto from 'crypto';
import path from 'path';

/**
 * MinIO Storage Service
 * Handles object storage operations for CreativeGini deliverables and onboarding assets.
 */

let minioClient = null;
let customStorageDriver = null; // Used for mocking/testing without live MinIO server

/**
 * Get or initialize the MinIO client using environment variables only.
 */
export const getMinioClient = () => {
  if (customStorageDriver) {
    return customStorageDriver;
  }

  if (minioClient) {
    return minioClient;
  }

  const endpoint = process.env.MINIO_ENDPOINT;
  const port = process.env.MINIO_PORT ? parseInt(process.env.MINIO_PORT, 10) : 9000;
  const useSSL = process.env.MINIO_USE_SSL === 'true';
  const accessKey = process.env.MINIO_ACCESS_KEY;
  const secretKey = process.env.MINIO_SECRET_KEY;

  if (!endpoint || !accessKey || !secretKey) {
    return null;
  }

  minioClient = new Minio.Client({
    endPoint: endpoint,
    port,
    useSSL,
    accessKey,
    secretKey,
  });

  return minioClient;
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
};

/**
 * Get the configured bucket name from environment variables.
 */
export const getBucketName = () => {
  return process.env.MINIO_BUCKET || 'creativegini-assets-dev';
};

/**
 * Ensure the target MinIO bucket exists, creating it if necessary.
 */
export const ensureBucketExists = async (bucket = getBucketName()) => {
  const client = getMinioClient();
  if (!client) {
    throw new Error('MinIO client is not configured. Check environment variables.');
  }

  const exists = await client.bucketExists(bucket);
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
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 50);

  const uniqueId = crypto.randomUUID();
  const safeFilename = `${uniqueId}-${base}${ext}`;

  return `${cleanPrefix}/${safeFilename}`;
};

/**
 * Upload a Buffer or Data URL to MinIO and return the object key and metadata.
 */
export const uploadFile = async ({
  buffer,
  dataUrl,
  originalName = 'upload.bin',
  mimeType = null,
  prefix = 'assets',
  bucket = getBucketName(),
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

  const objectKey = generateObjectKey({ prefix, originalName });

  const client = getMinioClient();
  if (!client) {
    if (!process.env.MINIO_ENDPOINT) {
      return {
        objectKey,
        bucket,
        size: fileSize,
        mimeType: effectiveMime,
        originalName,
      };
    }
    throw new Error('MinIO storage client is not available. Please verify environment configuration.');
  }

  const metaData = {
    'Content-Type': effectiveMime,
    'x-amz-meta-original-name': encodeURIComponent(originalName),
  };

  await client.putObject(bucket, objectKey, fileBuffer, fileSize, metaData);

  return {
    objectKey,
    bucket,
    size: fileSize,
    mimeType: effectiveMime,
    originalName,
  };
};

/**
 * Retrieve a readable stream for an object from MinIO.
 */
export const getFileStream = async (objectKey, { bucket = getBucketName(), offset = 0, length = null } = {}) => {
  const client = getMinioClient();
  if (!client) {
    throw new Error('MinIO storage client is not available.');
  }

  if (length !== null && length > 0) {
    return await client.getPartialObject(bucket, objectKey, offset, length);
  }

  return await client.getObject(bucket, objectKey);
};

/**
 * Get object metadata and stat from MinIO.
 */
export const getObjectStat = async (objectKey, bucket = getBucketName()) => {
  const client = getMinioClient();
  if (!client) {
    throw new Error('MinIO storage client is not available.');
  }

  return await client.statObject(bucket, objectKey);
};

/**
 * Check if an object exists in MinIO.
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
 * Delete an object from MinIO.
 */
export const deleteFile = async (objectKey, bucket = getBucketName()) => {
  if (!objectKey) return;
  const client = getMinioClient();
  if (!client) {
    throw new Error('MinIO storage client is not available.');
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
 * Determine if a stored URL field is a MinIO object key rather than a base64 string or HTTP URL.
 */
export const isMinioObjectKey = (url) => {
  if (!url || typeof url !== 'string') return false;
  if (url.startsWith('data:')) return false;
  if (url.startsWith('http://') || url.startsWith('https://')) return false;
  if (url.startsWith('/uploads/')) return false;
  // Standard object key pattern: prefix/uuid-filename.ext
  return /^[a-zA-Z0-9_\-\/]+\/[0-9a-fA-F-]{36}-.+$/.test(url) ||
         /^(submissions|leads|onboarding|assets)\//i.test(url);
};
