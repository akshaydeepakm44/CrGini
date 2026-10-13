import http from 'http';
import https from 'https';
import dns from 'dns';
import net from 'net';
import { URL } from 'url';
import { uploadFile, objectExists, deleteFile } from './storageService.js';

/**
 * Check if an IP address belongs to private, loopback, link-local or reserved ranges.
 */
export function isPrivateOrReservedIP(ip) {
  if (!ip || typeof ip !== 'string') return true;

  // IPv4 check
  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map(Number);
    if (parts.length !== 4 || parts.some(n => isNaN(n) || n < 0 || n > 255)) return true;

    // 0.0.0.0/8 (current network)
    if (parts[0] === 0) return true;
    // 10.0.0.0/8 (private)
    if (parts[0] === 10) return true;
    // 127.0.0.0/8 (loopback)
    if (parts[0] === 127) return true;
    // 169.254.0.0/16 (link-local, cloud metadata services e.g. 169.254.169.254)
    if (parts[0] === 169 && parts[1] === 254) return true;
    // 172.16.0.0/12 (private)
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    // 192.168.0.0/16 (private)
    if (parts[0] === 192 && parts[1] === 168) return true;
    // 192.0.2.0/24 (TEST-NET-1)
    if (parts[0] === 192 && parts[1] === 0 && parts[2] === 2) return true;
    // 198.51.100.0/24 (TEST-NET-2)
    if (parts[0] === 198 && parts[1] === 51 && parts[2] === 100) return true;
    // 203.0.113.0/24 (TEST-NET-3)
    if (parts[0] === 203 && parts[1] === 0 && parts[2] === 113) return true;
    // 224.0.0.0/4 (multicast)
    if (parts[0] >= 224 && parts[0] <= 239) return true;
    // 240.0.0.0/4 (reserved)
    if (parts[0] >= 240) return true;
    // 255.255.255.255 (broadcast)
    if (parts[0] === 255 && parts[1] === 255 && parts[2] === 255 && parts[3] === 255) return true;

    return false;
  }

  // IPv6 check
  if (net.isIPv6(ip)) {
    const norm = ip.toLowerCase().trim();
    if (norm === '::1' || norm === '::') return true;

    // IPv4-mapped IPv6 (e.g. ::ffff:127.0.0.1 or ::ffff:7f00:1)
    if (norm.startsWith('::ffff:')) {
      const v4Part = norm.replace('::ffff:', '');
      if (net.isIPv4(v4Part)) return isPrivateOrReservedIP(v4Part);
      return true;
    }

    // fc00::/7 (unique local address)
    if (/^[fF][cCdD]/.test(norm)) return true;
    // fe80::/10 (link-local)
    if (/^[fF][eE][89aAbB]/.test(norm)) return true;
    // 2001:db8::/32 (documentation)
    if (norm.startsWith('2001:db8:') || norm.startsWith('2001:0db8:')) return true;

    return false;
  }

  return true;
}

/**
 * Validate URL and enforce SSRF protections against private/loopback/internal infrastructure.
 */
export async function validateUrlAndCheckSSRF(urlString) {
  if (!urlString || typeof urlString !== 'string') {
    throw new Error('URL must be a non-empty string');
  }

  const trimmed = urlString.trim();
  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch (err) {
    throw new Error(`Invalid URL format: ${trimmed}`);
  }

  // Enforce allowed protocols
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`Forbidden protocol: ${parsed.protocol}. Only http: and https: are allowed.`);
  }

  const hostname = parsed.hostname.toLowerCase();
  if (!hostname) {
    throw new Error('URL missing valid hostname');
  }

  // Block localhost and internal domains
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.lan') ||
    hostname.endsWith('.corp') ||
    hostname.endsWith('.onion')
  ) {
    throw new Error(`Access denied: Destination host ${hostname} is blocked by SSRF policy.`);
  }

  // Check direct IP literal
  if (net.isIP(hostname)) {
    if (isPrivateOrReservedIP(hostname)) {
      throw new Error(`Access denied: IP address ${hostname} belongs to private or reserved range.`);
    }
    return { url: parsed.toString(), hostname, resolvedIp: hostname };
  }

  // Resolve hostname via DNS
  let records;
  try {
    records = await dns.promises.lookup(hostname, { all: true });
  } catch (dnsErr) {
    throw new Error(`DNS resolution failed for hostname ${hostname}: ${dnsErr.message}`);
  }

  if (!records || records.length === 0) {
    throw new Error(`No DNS records found for hostname ${hostname}`);
  }

  // Verify all resolved IPs
  for (const record of records) {
    if (isPrivateOrReservedIP(record.address)) {
      throw new Error(`Access denied: Host ${hostname} resolves to private/reserved IP ${record.address}`);
    }
  }

  return {
    url: parsed.toString(),
    hostname,
    resolvedIp: records[0].address,
  };
}

/**
 * Transform supported Google Drive links into direct download links.
 */
export function resolveGoogleDriveDirectUrl(urlString) {
  try {
    const parsed = new URL(urlString);
    const host = parsed.hostname.toLowerCase();

    if (host.includes('drive.google.com') || host.includes('docs.google.com')) {
      let fileId = null;

      // Pattern 1: /file/d/{FILE_ID}/view
      const matchFile = parsed.pathname.match(/\/file\/d\/([a-zA-Z0-9_\-]+)/);
      if (matchFile && matchFile[1]) {
        fileId = matchFile[1];
      }

      // Pattern 2: ?id={FILE_ID}
      if (!fileId && parsed.searchParams.has('id')) {
        fileId = parsed.searchParams.get('id');
      }

      if (fileId) {
        return `https://drive.google.com/uc?export=download&id=${encodeURIComponent(fileId)}`;
      }
    }
  } catch (_) {}

  return urlString;
}

/**
 * Detect image format from binary buffer magic bytes.
 */
export function detectImageFormat(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 8) return null;

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4E &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0D &&
    buffer[5] === 0x0A &&
    buffer[6] === 0x1A &&
    buffer[7] === 0x0A
  ) {
    return { mimeType: 'image/png', ext: 'png' };
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return { mimeType: 'image/jpeg', ext: 'jpg' };
  }

  // GIF: GIF87a or GIF89a
  const gifHeader = buffer.subarray(0, 6).toString('ascii');
  if (gifHeader === 'GIF87a' || gifHeader === 'GIF89a') {
    return { mimeType: 'image/gif', ext: 'gif' };
  }

  // WebP: RIFF at 0..3 and WEBP at 8..11
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return { mimeType: 'image/webp', ext: 'webp' };
  }

  // SVG: textual XML with <svg tag
  const textSample = buffer.subarray(0, Math.min(buffer.length, 2048)).toString('utf-8').trim().toLowerCase();
  if (
    textSample.includes('<svg') &&
    !textSample.startsWith('<!doctype html') &&
    !textSample.startsWith('<html')
  ) {
    // Basic sanitization: block dangerous executable vectors in SVG
    if (
      !textSample.includes('<script') &&
      !textSample.includes('javascript:') &&
      !textSample.includes('onload=') &&
      !textSample.includes('onerror=')
    ) {
      return { mimeType: 'image/svg+xml', ext: 'svg' };
    }
  }

  return null;
}

/**
 * Validate image buffer format, size bounds, and reject HTML/script payloads.
 */
export function validateImageBuffer(buffer, maxSizeBytes = 5 * 1024 * 1024) {
  if (!Buffer.isBuffer(buffer)) {
    return { isValid: false, errorCategory: 'NOT_A_BUFFER' };
  }
  if (buffer.length > maxSizeBytes) {
    return { isValid: false, errorCategory: 'FILE_TOO_LARGE' };
  }
  const textSample = buffer.subarray(0, 100).toString('utf-8').trim().toLowerCase();
  if (textSample.startsWith('<!doctype html') || textSample.startsWith('<html')) {
    return { isValid: false, errorCategory: 'NOT_AN_IMAGE' };
  }
  if (textSample.includes('<svg')) {
    const fullText = buffer.toString('utf-8').toLowerCase();
    if (fullText.includes('<script') || fullText.includes('javascript:') || fullText.includes('onload=') || fullText.includes('onerror=')) {
      return { isValid: false, errorCategory: 'UNSAFE_SVG_CONTENT' };
    }
  }
  const detected = detectImageFormat(buffer);
  if (!detected) {
    return { isValid: false, errorCategory: 'NOT_AN_IMAGE' };
  }
  return { isValid: true, ...detected };
}

/**
 * Fetch remote image with SSRF protections, timeout, size limits and redirect validation.
 */
export async function fetchLogoImage(
  rawUrl,
  {
    timeoutMs = 6000,
    maxSizeBytes = 5 * 1024 * 1024, // 5MB
    maxRedirects = 3,
  } = {}
) {
  let currentUrl = resolveGoogleDriveDirectUrl(rawUrl);
  let redirectCount = 0;

  while (redirectCount <= maxRedirects) {
    // 1. SSRF check on current URL
    await validateUrlAndCheckSSRF(currentUrl);

    const parsed = new URL(currentUrl);
    const client = parsed.protocol === 'https:' ? https : http;

    const result = await new Promise((resolve, reject) => {
      let isSettled = false;

      const req = client.get(
        parsed,
        {
          headers: {
            'User-Agent': 'CreativeGini-LogoFetcher/1.0 (+https://creativegini.com)',
            'Accept': 'image/png, image/jpeg, image/webp, image/svg+xml, image/gif, image/*;q=0.8',
          },
          timeout: timeoutMs,
        },
        (res) => {
          // Handle HTTP redirects safely
          if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
            const location = res.headers.location;
            if (!location) {
              isSettled = true;
              return reject(new Error(`HTTP ${res.statusCode} redirect without location header`));
            }
            try {
              const nextUrl = new URL(location, currentUrl).toString();
              isSettled = true;
              return resolve({ isRedirect: true, nextUrl });
            } catch (err) {
              isSettled = true;
              return reject(new Error(`Invalid redirect location: ${location}`));
            }
          }

          if (res.statusCode !== 200) {
            isSettled = true;
            return reject(new Error(`HTTP request failed with status code ${res.statusCode}`));
          }

          // Check Content-Length if provided
          const contentLength = res.headers['content-length'];
          if (contentLength && parseInt(contentLength, 10) > maxSizeBytes) {
            res.destroy();
            isSettled = true;
            return reject(new Error(`Oversized image: Content-Length ${contentLength} exceeds limit of ${maxSizeBytes} bytes`));
          }

          const chunks = [];
          let totalBytes = 0;

          res.on('data', (chunk) => {
            totalBytes += chunk.length;
            if (totalBytes > maxSizeBytes) {
              res.destroy();
              if (!isSettled) {
                isSettled = true;
                reject(new Error(`Image stream exceeded maximum size limit of ${maxSizeBytes} bytes`));
              }
              return;
            }
            chunks.push(chunk);
          });

          res.on('end', () => {
            if (!isSettled) {
              isSettled = true;
              resolve({
                isRedirect: false,
                buffer: Buffer.concat(chunks),
                contentType: res.headers['content-type'],
              });
            }
          });

          res.on('error', (err) => {
            if (!isSettled) {
              isSettled = true;
              reject(err);
            }
          });
        }
      );

      req.on('timeout', () => {
        req.destroy();
        if (!isSettled) {
          isSettled = true;
          reject(new Error(`Connection timed out after ${timeoutMs}ms`));
        }
      });

      req.on('error', (err) => {
        if (!isSettled) {
          isSettled = true;
          reject(err);
        }
      });
    });

    if (result.isRedirect) {
      redirectCount++;
      currentUrl = result.nextUrl;
      continue;
    }

    const { buffer, contentType } = result;

    // Reject HTML payloads (e.g. 404/login pages masquerading with 200 OK)
    const textSample = buffer.subarray(0, 100).toString('utf-8').trim().toLowerCase();
    if (textSample.startsWith('<!doctype html') || textSample.startsWith('<html')) {
      throw new Error('Destination returned an HTML document instead of binary image bytes (login/preview page).');
    }

    // Detect format via magic bytes
    const detected = detectImageFormat(buffer);
    if (!detected) {
      throw new Error(`Unrecognized or unsupported image format. Received Content-Type: ${contentType || 'unknown'}`);
    }

    return {
      buffer,
      mimeType: detected.mimeType,
      ext: detected.ext,
      size: buffer.length,
      finalUrl: currentUrl,
    };
  }

  throw new Error(`Exceeded maximum redirect count of ${maxRedirects}`);
}

/**
 * Full workflow: fetch logo with SSRF protection, validate image format, and store in MinIO.
 */
export async function downloadAndStoreLogo({
  companyId,
  leadId,
  logoUrl,
}) {
  if (!logoUrl || typeof logoUrl !== 'string' || !logoUrl.trim()) {
    return {
      success: false,
      status: 'MISSING_URL',
      message: 'No logo URL provided in row',
    };
  }

  const cleanUrl = logoUrl.trim();

  // Handle base64 Data URL directly if provided
  if (cleanUrl.startsWith('data:image/')) {
    try {
      const commaIdx = cleanUrl.indexOf(',');
      const meta = cleanUrl.slice(0, commaIdx);
      const b64 = cleanUrl.slice(commaIdx + 1);
      const mime = meta.match(/^data:([^;]+)/)?.[1] || 'image/png';
      const buffer = Buffer.from(b64, 'base64');
      const detected = detectImageFormat(buffer);

      if (!detected) {
        return { success: false, status: 'INVALID_IMAGE', message: 'Data URL is not a recognized image' };
      }

      const uploadRes = await uploadFile({
        buffer,
        originalName: `logo.${detected.ext}`,
        mimeType: detected.mimeType,
        prefix: `companies/${companyId}/leads/${leadId}/logos`,
      });

      const exists = await objectExists(uploadRes.objectKey);
      if (!exists) {
        return { success: false, status: 'STORAGE_VERIFICATION_FAILED', message: 'MinIO persistence verification failed' };
      }

      return {
        success: true,
        objectKey: uploadRes.objectKey,
        size: uploadRes.size,
        mimeType: uploadRes.mimeType,
        status: 'STORED_MINIO',
      };
    } catch (dataUrlErr) {
      return { success: false, status: 'INVALID_IMAGE', message: dataUrlErr.message };
    }
  }

  // Fetch remote logo over HTTP/HTTPS
  try {
    const downloaded = await fetchLogoImage(cleanUrl);

    const uploadRes = await uploadFile({
      buffer: downloaded.buffer,
      originalName: `logo.${downloaded.ext}`,
      mimeType: downloaded.mimeType,
      prefix: `companies/${companyId}/leads/${leadId}/logos`,
    });

    const exists = await objectExists(uploadRes.objectKey);
    if (!exists) {
      return {
        success: false,
        status: 'STORAGE_VERIFICATION_FAILED',
        message: 'Object persistence verification in MinIO failed',
      };
    }

    return {
      success: true,
      objectKey: uploadRes.objectKey,
      size: uploadRes.size,
      mimeType: uploadRes.mimeType,
      status: 'STORED_MINIO',
    };
  } catch (err) {
    const msg = err.message || '';
    let errorCategory = 'FETCH_FAILED';

    if (msg.includes('SSRF') || msg.includes('Access denied') || msg.includes('private or reserved') || msg.includes('Forbidden protocol')) {
      errorCategory = 'SSRF_BLOCKED';
    } else if (msg.includes('Invalid URL')) {
      errorCategory = 'INVALID_URL';
    } else if (msg.includes('Oversized image') || msg.includes('maximum size limit')) {
      errorCategory = 'OVERSIZED_IMAGE';
    } else if (msg.includes('HTML') || msg.includes('format')) {
      errorCategory = 'INVALID_IMAGE';
    }

    return {
      success: false,
      status: errorCategory,
      message: msg,
    };
  }
}
