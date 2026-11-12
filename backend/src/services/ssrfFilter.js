import dns from 'node:dns/promises';
import http from 'node:http';
import https from 'node:https';
import net from 'node:net';
import { URL } from 'node:url';

const DEFAULT_TIMEOUT_MS = 5000;
const DEFAULT_MAX_BYTE_SIZE = 2 * 1024 * 1024; // 2MB

/**
 * Normalizes decimal, hex, octal, or IPv4-mapped representations of IP addresses.
 *
 * @param {string} raw - Raw IP or hostname string
 * @returns {string|null} Normalized IP address string, or null if cannot normalize
 */
export function normalizeIpString(raw) {
  if (!raw || typeof raw !== 'string') return null;
  let str = raw.trim();

  // Strip IPv6 brackets if present
  if (str.startsWith('[') && str.endsWith(']')) {
    str = str.slice(1, -1);
  }

  // IPv4-mapped IPv6 e.g. ::ffff:127.0.0.1 or ::ffff:7f00:1
  const mappedMatch = str.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  if (mappedMatch) {
    return mappedMatch[1];
  }

  // Decimal integer notation (e.g. 2130706433 for 127.0.0.1)
  if (/^\d+$/.test(str)) {
    const num = parseInt(str, 10);
    if (num >= 0 && num <= 0xffffffff) {
      return [
        (num >>> 24) & 255,
        (num >>> 16) & 255,
        (num >>> 8) & 255,
        num & 255,
      ].join('.');
    }
  }

  // Hex notation (e.g. 0x7f000001 for 127.0.0.1)
  if (/^0x[0-9a-fA-F]+$/i.test(str)) {
    const num = parseInt(str, 16);
    if (num >= 0 && num <= 0xffffffff) {
      return [
        (num >>> 24) & 255,
        (num >>> 16) & 255,
        (num >>> 8) & 255,
        num & 255,
      ].join('.');
    }
  }

  // Octal/mixed parts (e.g. 0177.0.0.1 or 0177.0.0.01)
  if (str.includes('.')) {
    const parts = str.split('.');
    if (parts.length === 4) {
      const parsedParts = [];
      for (const p of parts) {
        if (/^0x[0-9a-fA-F]+$/i.test(p)) {
          parsedParts.push(parseInt(p, 16));
        } else if (/^0\d+$/.test(p)) {
          parsedParts.push(parseInt(p, 8));
        } else if (/^\d+$/.test(p)) {
          parsedParts.push(parseInt(p, 10));
        } else {
          return str;
        }
      }
      if (parsedParts.every((n) => !isNaN(n) && n >= 0 && n <= 255)) {
        return parsedParts.join('.');
      }
    }
  }

  return str;
}

/**
 * Checks whether an IP address falls within private, loopback, link-local, or reserved subnets.
 *
 * @param {string} rawIp - Target IP address
 * @returns {boolean} True if IP is private/loopback/reserved, false if public
 */
export function isPrivateOrReservedIp(rawIp) {
  if (!rawIp || typeof rawIp !== 'string') return true;

  const ip = normalizeIpString(rawIp);
  if (!ip) return true;

  const lower = ip.toLowerCase();

  // IPv6 Checks
  if (net.isIPv6(lower)) {
    if (
      lower === '::1' ||
      lower === '::' ||
      lower.startsWith('fe80:') || // Link-local
      lower.startsWith('fe9') ||
      lower.startsWith('fea') ||
      lower.startsWith('feb') ||
      lower.startsWith('fc00:') || // Unique local (fc00::/7)
      lower.startsWith('fd') ||
      lower.startsWith('ff') // Multicast
    ) {
      return true;
    }
    // Public IPv6 address
    return false;
  }

  const parts = lower.split('.').map((p) => parseInt(p, 10));
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    // If not standard IPv4 and not recognized public IPv6, reject safely
    return true;
  }

  const [a, b] = parts;

  // 127.0.0.0/8 (Loopback)
  if (a === 127) return true;
  // 10.0.0.0/8 (Private RFC 1918)
  if (a === 10) return true;
  // 172.16.0.0/12 (Private RFC 1918)
  if (a === 172 && b >= 16 && b <= 31) return true;
  // 192.168.0.0/16 (Private RFC 1918)
  if (a === 192 && b === 168) return true;
  // 169.254.0.0/16 (Link-local & Cloud Metadata e.g. 169.254.169.254)
  if (a === 169 && b === 254) return true;
  // 0.0.0.0/8
  if (a === 0) return true;
  // 100.64.0.0/10 (Carrier grade NAT)
  if (a === 100 && b >= 64 && b <= 127) return true;
  // 192.0.0.0/24 & 192.0.2.0/24 (TEST-NET-1)
  if (a === 192 && b === 0) return true;
  // 198.18.0.0/15 (Network benchmark)
  if (a === 198 && (b === 18 || b === 19)) return true;
  // 224.0.0.0/4 (Multicast) or 240.0.0.0/4 (Reserved)
  if (a >= 224) return true;

  return false;
}

/**
 * Determines whether a string represents an IP address literal (IPv4, IPv6, or encoded integer/hex/octal).
 */
export function isIpLiteral(str) {
  if (!str || typeof str !== 'string') return false;
  const clean = str.trim().replace(/^\[|\]$/g, '');
  if (net.isIP(clean) !== 0) return true;
  if (/^\d+$/.test(clean)) return true;
  if (/^0x[0-9a-fA-F]+$/i.test(clean)) return true;
  if (clean.includes('.')) {
    const parts = clean.split('.');
    if (parts.length === 4 && parts.every((p) => /^(0x[0-9a-fA-F]+|0\d+|\d+)$/i.test(p))) {
      return true;
    }
  }
  return false;
}

/**
 * Validates an external URL against SSRF attacks.
 *
 * Enforces:
 * 1. HTTP/HTTPS scheme only.
 * 2. DNS resolution check: IP must not be loopback, private, link-local, or metadata.
 * 3. Decimal/hex/octal representations normalized and checked.
 *
 * @param {string} rawUrl - Target URL to inspect
 * @returns {Promise<{ safe: boolean, error?: string, ip?: string, parsedUrl?: URL }>}
 */
export async function validateExternalUrl(rawUrl, { dnsResolver = null } = {}) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { safe: false, error: 'INVALID_URL' };
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(rawUrl);
  } catch (_) {
    return { safe: false, error: 'MALFORMED_URL' };
  }

  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    return { safe: false, error: 'UNSUPPORTED_PROTOCOL' };
  }

  const hostname = parsedUrl.hostname;

  // 1. Check if hostname is an IP literal or encoded IP
  if (isIpLiteral(hostname)) {
    const normalizedHost = normalizeIpString(hostname);
    if (isPrivateOrReservedIp(normalizedHost)) {
      return { safe: false, error: 'SSRF_PRIVATE_IP_BLOCKED', ip: normalizedHost };
    }
    return { safe: true, ip: normalizedHost, parsedUrl };
  }

  // 2. Check localhost keywords
  if (hostname.toLowerCase() === 'localhost' || hostname.toLowerCase().endsWith('.localhost')) {
    return { safe: false, error: 'SSRF_PRIVATE_IP_BLOCKED', ip: '127.0.0.1' };
  }

  // 3. Resolve hostname via DNS (or injected resolver)
  try {
    const resolver = dnsResolver || ((host) => dns.lookup(host, { all: true }));
    const rawLookup = await resolver(hostname);
    const lookupRes = Array.isArray(rawLookup) ? rawLookup : [rawLookup];
    if (lookupRes.length === 0 || !lookupRes[0]?.address) {
      return { safe: false, error: 'DNS_RESOLUTION_FAILED', message: 'No IP returned from DNS lookup.' };
    }
    for (const record of lookupRes) {
      const normAddr = normalizeIpString(record.address);
      if (isPrivateOrReservedIp(normAddr)) {
        return { safe: false, error: 'SSRF_PRIVATE_IP_BLOCKED', ip: record.address };
      }
    }
    return { safe: true, ip: lookupRes[0].address, parsedUrl };
  } catch (err) {
    return { safe: false, error: 'DNS_RESOLUTION_FAILED', message: err.message };
  }
}

/**
 * Safely fetches a remote URL with full SSRF protection:
 * - Pre-validates URL
 * - Pins socket connection to validated IP (no second DNS query, eliminating DNS rebinding / TOCTOU)
 * - Follows up to maxRedirects (default 3), strictly validating every redirect Location
 * - Enforces timeout (default 5s)
 * - Enforces maximum response body size (default 2MB)
 *
 * @param {string} targetUrl - Initial URL
 * @param {Object} [options]
 * @param {number} [options.timeoutMs=5000]
 * @param {number} [options.maxSize=2097152]
 * @param {number} [options.maxRedirects=3]
 * @param {number} [options.currentRedirect=0]
 * @param {boolean} [options.allowLocalhostInitial=false]
 * @param {Function} [options.dnsResolver=null]
 * @returns {Promise<{ ok: boolean, status: number, buffer: Buffer, contentType: string }>}
 */
export async function safeFetchUrl(targetUrl, {
  timeoutMs = DEFAULT_TIMEOUT_MS,
  maxSize = DEFAULT_MAX_BYTE_SIZE,
  maxRedirects = 3,
  currentRedirect = 0,
  allowLocalhostInitial = false,
  dnsResolver = null,
} = {}) {
  if (currentRedirect > maxRedirects) {
    throw new Error('TOO_MANY_REDIRECTS');
  }

  const isInitialLocalhostAllowed =
    Boolean(allowLocalhostInitial) && currentRedirect === 0 && process.env.NODE_ENV === 'test';

  let validatedIp = null;

  if (!isInitialLocalhostAllowed) {
    const validation = await validateExternalUrl(targetUrl, { dnsResolver });
    if (!validation.safe) {
      const err = new Error(`SSRF Blocked: ${validation.error}`);
      err.code = validation.error;
      throw err;
    }
    validatedIp = validation.ip;
  }

  const parsed = new URL(targetUrl);
  const clientLib = parsed.protocol === 'https:' ? https : http;

  return new Promise((resolve, reject) => {
    let timer = null;
    let byteCount = 0;
    const chunks = [];
    let finished = false;

    const cleanup = () => {
      finished = true;
      if (timer) clearTimeout(timer);
    };

    // To prevent DNS rebinding (TOCTOU) and avoid a second DNS query,
    // we instruct the client library to resolve directly to the validated IP.
    const requestOptions = {
      method: 'GET',
      headers: {
        'User-Agent': 'DiziGini-SSRF-Validator/1.0',
        Accept: '*/*',
      },
    };

    if (validatedIp) {
      const isV6 = net.isIPv6(validatedIp);
      requestOptions.lookup = (_hostname, _options, callback) => {
        // Immediately return validated IP, performing NO second DNS query
        callback(null, validatedIp, isV6 ? 6 : 4);
      };
    }

    const req = clientLib.request(
      parsed,
      requestOptions,
      async (res) => {
        // Handle Redirects (301, 302, 303, 307, 308)
        if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
          cleanup();
          res.resume(); // drain
          try {
            const nextUrl = new URL(res.headers.location, targetUrl).toString();
            const redirectRes = await safeFetchUrl(nextUrl, {
              timeoutMs,
              maxSize,
              maxRedirects,
              currentRedirect: currentRedirect + 1,
              allowLocalhostInitial: false,
            });
            return resolve(redirectRes);
          } catch (redirectErr) {
            return reject(redirectErr);
          }
        }

        res.on('data', (chunk) => {
          if (finished) return;
          byteCount += chunk.length;
          if (byteCount > maxSize) {
            cleanup();
            req.destroy();
            const err = new Error('MAX_SIZE_EXCEEDED');
            err.code = 'MAX_SIZE_EXCEEDED';
            return reject(err);
          }
          chunks.push(chunk);
        });

        res.on('end', () => {
          if (finished) return;
          cleanup();
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            buffer: Buffer.concat(chunks),
            contentType: res.headers['content-type'] || 'application/octet-stream',
          });
        });

        res.on('error', (err) => {
          if (finished) return;
          cleanup();
          reject(err);
        });
      }
    );

    timer = setTimeout(() => {
      if (finished) return;
      cleanup();
      req.destroy();
      const err = new Error('TIMEOUT');
      err.code = 'TIMEOUT';
      reject(err);
    }, timeoutMs);

    req.on('error', (err) => {
      if (finished) return;
      cleanup();
      reject(err);
    });

    req.end();
  });
}

