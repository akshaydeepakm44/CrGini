import crypto from 'node:crypto';
import { query } from '../config/postgres.js';

const IDEMPOTENCY_KEY_REGEX = /^[A-Za-z0-9_-]{1,128}$/;

/**
 * Server-to-Server Idempotency Middleware.
 *
 * Guarantees safe retry of mutating integration endpoints (POST).
 * Prevents duplicate prospect creation, maps payload changes to 409 Conflict,
 * and caches response status/body for identical replays.
 */
export async function requireIdempotency(req, res, next) {
  if (req.method !== 'POST') {
    return next();
  }

  const rawKey = req.headers['idempotency-key'] || req.headers['x-idempotency-key'];

  if (!rawKey || typeof rawKey !== 'string' || !rawKey.trim()) {
    return res.status(400).json({
      success: false,
      error: 'MISSING_IDEMPOTENCY_KEY',
      message: 'Idempotency-Key (or X-Idempotency-Key) header is required for mutating integration endpoints.',
    });
  }

  const idempotencyKey = rawKey.trim();

  if (!IDEMPOTENCY_KEY_REGEX.test(idempotencyKey)) {
    return res.status(400).json({
      success: false,
      error: 'INVALID_IDEMPOTENCY_KEY',
      message: 'Idempotency-Key header must be 1-128 characters containing only alphanumeric characters, dashes, and underscores.',
    });
  }

  const clientId = req.apiClient?.clientId;
  if (!clientId) {
    return res.status(401).json({
      success: false,
      error: 'UNAUTHENTICATED',
      message: 'API client authentication required before idempotency processing.',
    });
  }

  // Canonical SHA-256 hash of the request body
  const bodyHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(req.body || {}))
    .digest('hex');

  try {
    // 1. Check existing idempotency key record
    const existingRes = await query(
      `SELECT client_id, idempotency_key, status, body_hash, response_status, response_body, created_at
       FROM integration_idempotency_keys
       WHERE client_id = $1 AND idempotency_key = $2`,
      [clientId, idempotencyKey]
    );

    if (existingRes.rows.length > 0) {
      const record = existingRes.rows[0];

      // Case A: Completed request
      if (record.status === 'COMPLETED') {
        if (record.body_hash === bodyHash) {
          res.set('Idempotent-Replay', 'true');
          return res.status(record.response_status).json(record.response_body);
        } else {
          return res.status(409).json({
            success: false,
            error: 'IDEMPOTENCY_KEY_PAYLOAD_MISMATCH',
            message: 'Idempotency key was previously executed with a different request payload.',
          });
        }
      }

      // Case B: In-progress request
      if (record.status === 'IN_PROGRESS') {
        const createdAt = new Date(record.created_at).getTime();
        const twoMinutesAgo = Date.now() - 2 * 60 * 1000;

        if (createdAt < twoMinutesAgo) {
          // Timeout occurred on previous attempt; allow retry by taking over the in-progress row
          await query(
            `UPDATE integration_idempotency_keys
             SET body_hash = $1, created_at = NOW()
             WHERE client_id = $2 AND idempotency_key = $3`,
            [bodyHash, clientId, idempotencyKey]
          );
        } else {
          return res.status(409).json({
            success: false,
            error: 'CONCURRENT_REQUEST_IN_PROGRESS',
            message: 'A request with this idempotency key is currently in progress. Please retry shortly.',
          });
        }
      }
    } else {
      // Case C: New idempotency key -> register IN_PROGRESS
      await query(
        `INSERT INTO integration_idempotency_keys (
          client_id,
          idempotency_key,
          status,
          body_hash,
          expires_at
        ) VALUES ($1, $2, 'IN_PROGRESS', $3, NOW() + INTERVAL '24 HOURS')`,
        [clientId, idempotencyKey, bodyHash]
      );
    }

    // 2. Intercept response to capture final status and body
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);

    let capturedBody = null;

    res.json = (body) => {
      capturedBody = body;
      return originalJson(body);
    };

    res.send = (body) => {
      if (!capturedBody) {
        try {
          capturedBody = typeof body === 'string' ? JSON.parse(body) : body;
        } catch (_) {
          capturedBody = body;
        }
      }
      return originalSend(body);
    };

    res.on('close', async () => {
      if (!res.writableEnded) {
        try {
          await query(
            `DELETE FROM integration_idempotency_keys
             WHERE client_id = $1 AND idempotency_key = $2 AND status = 'IN_PROGRESS'`,
            [clientId, idempotencyKey]
          );
        } catch (_) {}
      }
    });

    res.on('finish', async () => {
      try {
        if (res.statusCode < 500) {
          await query(
            `UPDATE integration_idempotency_keys
             SET status = 'COMPLETED',
                 response_status = $1,
                 response_body = $2
             WHERE client_id = $3 AND idempotency_key = $4`,
            [res.statusCode, JSON.stringify(capturedBody || {}), clientId, idempotencyKey]
          );
        } else {
          // On server failure (5xx), delete the row so the client can safely retry
          await query(
            `DELETE FROM integration_idempotency_keys
             WHERE client_id = $1 AND idempotency_key = $2`,
            [clientId, idempotencyKey]
          );
        }
      } catch (saveErr) {
        console.error('[requireIdempotency] Failed to record response state:', saveErr.message);
      }
    });

    next();
  } catch (err) {
    console.error('[requireIdempotency] Error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'IDEMPOTENCY_INTERNAL_ERROR',
      message: 'Failed to process idempotency lock.',
    });
  }
}
