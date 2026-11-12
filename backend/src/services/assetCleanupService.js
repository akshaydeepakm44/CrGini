import { getPool } from '../config/postgres.js';
import { deleteFile } from './storageService.js';

// Dedicated 32-bit signed integer key for PostgreSQL advisory lock
export const ASSET_CLEANUP_ADVISORY_LOCK_KEY = 982347101;
const ADVISORY_LOCK_KEY = ASSET_CLEANUP_ADVISORY_LOCK_KEY;

let cleanupTimer = null;

/**
 * Execute a single asset cleanup pass using a dedicated PostgreSQL connection and advisory lock.
 *
 * Safe for multi-instance deployments: the session-level advisory lock is bound strictly
 * to the dedicated pool connection. Only the instance holding this lock will perform file
 * deletion and row cleanup. Concurrent runners will skip immediately.
 *
 * @returns {Promise<{ acquired: boolean, cleanedCount: number }>}
 */
export async function runAssetCleanup() {
  const pool = getPool();
  const client = await pool.connect();

  try {
    // Attempt to acquire session-level advisory lock non-blockingly on this dedicated connection
    const lockRes = await client.query('SELECT pg_try_advisory_lock($1) AS acquired', [ADVISORY_LOCK_KEY]);
    const acquired = Boolean(lockRes.rows[0]?.acquired);

    if (!acquired) {
      return { acquired: false, cleanedCount: 0 };
    }

    try {
      // Find all expired STAGED assets. Excludes CLAIMED assets regardless of expiration!
      const expiredRes = await client.query(
        `SELECT id, asset_key, client_id
         FROM integration_assets
         WHERE status = 'STAGED' AND expires_at < NOW()`
      );

      let cleanedCount = 0;

      for (const row of expiredRes.rows) {
        try {
          const uuid = row.asset_key.replace(/^dzg_ast_/, '');
          const objectKey = `temp/${row.client_id}/${uuid}.pdf`;
          await deleteFile(objectKey);
        } catch (fileErr) {
          console.warn(`[AssetCleanup] Failed to delete file for asset ${row.asset_key}:`, fileErr.message);
        }

        await client.query('DELETE FROM integration_assets WHERE id = $1', [row.id]);
        cleanedCount++;
      }

      return { acquired: true, cleanedCount };
    } finally {
      try {
        await client.query('SELECT pg_advisory_unlock($1)', [ADVISORY_LOCK_KEY]);
      } catch (unlockErr) {
        console.warn('[AssetCleanup] Failed to release advisory lock:', unlockErr.message);
      }
    }
  } finally {
    client.release();
  }
}

/**
 * Start the in-process background cleanup timer.
 *
 * @param {number} [intervalMs=3600000] - Interval between passes (default: 1 hour)
 */
export function startAssetCleanupJob(intervalMs = 3600000) {
  if (cleanupTimer) return;

  const effectiveInterval = parseInt(
    process.env.ASSET_CLEANUP_INTERVAL_MS || String(intervalMs),
    10
  );

  cleanupTimer = setInterval(async () => {
    try {
      await runAssetCleanup();
    } catch (err) {
      console.error('[AssetCleanupJob] Error during scheduled cleanup:', err.message);
    }
  }, effectiveInterval);

  if (cleanupTimer.unref) {
    cleanupTimer.unref();
  }
}

/**
 * Stop the in-process background cleanup timer.
 */
export function stopAssetCleanupJob() {
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
    cleanupTimer = null;
  }
}

