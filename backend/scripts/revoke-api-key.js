import crypto from 'node:crypto';
import { query, connectPostgres, getPool } from '../src/config/postgres.js';

/**
 * Programmatically revoke an API key for a client.
 *
 * @param {Object} options
 * @param {string} [options.clientId] - Client ID string
 * @param {string} [options.keyHash] - SHA-256 hash of API key
 * @param {string} [options.rawKey] - Plain API key to be hashed
 * @returns {Promise<Object>} The updated client record
 */
export async function revokeApiKey({ clientId, keyHash, rawKey } = {}) {
  let effectiveHash = keyHash || null;
  if (!effectiveHash && rawKey) {
    effectiveHash = crypto.createHash('sha256').update(rawKey.trim()).digest('hex');
  }

  if (!clientId && !effectiveHash) {
    throw new Error('Either clientId, keyHash, or rawKey must be provided to revoke an API key.');
  }

  const res = await query(
    `UPDATE api_clients
     SET status = 'REVOKED'
     WHERE ($1::VARCHAR IS NOT NULL AND client_id = $1)
        OR ($2::VARCHAR IS NOT NULL AND api_key_hash = $2)
     RETURNING id, client_id, client_name, scopes, status, created_at;`,
    [clientId || null, effectiveHash || null]
  );

  if (res.rows.length === 0) {
    return null;
  }

  return res.rows[0];
}

// CLI Execution Support
const isDirectExecution =
  process.argv[1] &&
  (process.argv[1].endsWith('revoke-api-key.js') ||
    process.argv[1].includes('revoke-api-key'));

if (isDirectExecution) {
  (async () => {
    try {
      const args = process.argv.slice(2);
      let clientId = null;
      let keyHash = null;
      let rawKey = null;

      for (let i = 0; i < args.length; i++) {
        if (args[i] === '--client-id' && args[i + 1]) {
          clientId = args[i + 1];
          i++;
        } else if (args[i] === '--key-hash' && args[i + 1]) {
          keyHash = args[i + 1];
          i++;
        } else if (args[i] === '--key' && args[i + 1]) {
          rawKey = args[i + 1];
          i++;
        }
      }

      if (!clientId && !keyHash && !rawKey) {
        console.error('Error: specify --client-id, --key-hash, or --key');
        console.error('Usage: node backend/scripts/revoke-api-key.js --client-id "client_xxx"');
        process.exit(1);
      }

      await connectPostgres();

      const client = await revokeApiKey({ clientId, keyHash, rawKey });

      if (!client) {
        console.error('Error: No matching API client found to revoke.');
        await getPool().end();
        process.exit(1);
      }

      console.log('======================================================');
      console.log('           API CLIENT REVOKED SUCCESSFULLY            ');
      console.log('======================================================');
      console.log(`Client ID:   ${client.client_id}`);
      console.log(`Client Name: ${client.client_name}`);
      console.log(`Status:      ${client.status}`);
      console.log('======================================================');

      await getPool().end();
      process.exit(0);
    } catch (err) {
      console.error('Fatal error revoking API key:', err.message);
      try {
        await getPool().end();
      } catch (_) {}
      process.exit(1);
    }
  })();
}
