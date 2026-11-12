import crypto from 'node:crypto';
import { query } from '../config/postgres.js';

/**
 * Server-to-Server API Client Authentication Middleware.
 *
 * Extracts API key strictly from `X-API-Key` or `Authorization: Bearer <key>`.
 * Disallows credentials passed in URL query parameters or request body (fails with 401).
 * Authenticates against `api_clients` using SHA-256 hash.
 */
export async function apiClientAuth(req, res, next) {
  try {
    // 1. Strict security check: disallow credentials in query parameters or body
    const credentialKeys = ['apiKey', 'api_key', 'token', 'key', 'access_token'];
    const hasQueryCred = req.query && credentialKeys.some((k) => req.query[k] !== undefined);
    const hasBodyCred =
      req.body &&
      typeof req.body === 'object' &&
      credentialKeys.some((k) => req.body[k] !== undefined);

    if (hasQueryCred || hasBodyCred) {
      return res.status(401).json({
        success: false,
        error: 'CREDENTIALS_IN_URL_OR_BODY_FORBIDDEN',
        message: 'API credentials must not be passed in URL query parameters or request body. Provide via X-API-Key or Authorization header.',
      });
    }

    // 2. Extract key from headers
    let rawKey = req.headers['x-api-key'];
    if (!rawKey && req.headers['authorization']) {
      const authHeader = req.headers['authorization'];
      if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
        rawKey = authHeader.slice(7).trim();
      }
    }

    if (!rawKey || typeof rawKey !== 'string' || !rawKey.trim()) {
      return res.status(401).json({
        success: false,
        error: 'MISSING_API_KEY',
        message: 'API key is required in X-API-Key or Authorization: Bearer header.',
      });
    }

    // 3. Compute SHA-256 hash of provided key
    const keyHash = crypto.createHash('sha256').update(rawKey.trim()).digest('hex');

    // 4. Query client record from PostgreSQL
    const result = await query(
      `SELECT id, client_id, client_name, scopes, status, allow_auto_publish, allowed_sender_emails
       FROM api_clients
       WHERE api_key_hash = $1`,
      [keyHash]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_API_KEY',
        message: 'Invalid API key.',
      });
    }

    const client = result.rows[0];

    // 5. Inactive or revoked client check (403 Forbidden)
    if (client.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        error: 'CLIENT_REVOKED',
        message: 'API client credentials have been revoked or deactivated.',
      });
    }

    // 6. Asynchronously update last_used_at timestamp
    query('UPDATE api_clients SET last_used_at = NOW() WHERE id = $1', [client.id]).catch(() => {});

    // 7. Attach sanitized client context to request
    req.apiClient = {
      id: client.id,
      clientId: client.client_id,
      clientName: client.client_name,
      scopes: Array.isArray(client.scopes) ? client.scopes : [],
      allowAutoPublish: Boolean(client.allow_auto_publish),
      allowedSenderEmails: Array.isArray(client.allowed_sender_emails)
        ? client.allowed_sender_emails
        : [],
    };

    next();
  } catch (err) {
    console.error('[apiClientAuth] Authentication error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'AUTH_INTERNAL_ERROR',
      message: 'Internal server error during API client authentication.',
    });
  }
}

/**
 * Authorization middleware to enforce specific API scopes.
 * Returns 403 Forbidden if client lacks the required scope.
 *
 * @param {string} scope - Required scope name (e.g. 'prospects:write', 'assets:write')
 */
export function requireScope(scope) {
  return (req, res, next) => {
    if (!req.apiClient) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHENTICATED',
        message: 'Authentication required prior to scope authorization.',
      });
    }

    if (!req.apiClient.scopes.includes(scope)) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_SCOPE',
        message: `Forbidden: API client lacks required scope '${scope}'.`,
      });
    }

    next();
  };
}

