import crypto from 'node:crypto';
import readline from 'node:readline/promises';
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

async function readKeyFromStdinOrPrompt() {
  if (!process.stdin.isTTY) {
    return new Promise((resolve) => {
      let data = '';
      process.stdin.setEncoding('utf-8');
      process.stdin.on('data', (chunk) => {
        data += chunk;
      });
      process.stdin.on('end', () => resolve(data.trim()));
    });
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const answer = await rl.question('Enter API key to revoke: ');
  rl.close();
  return answer.trim();
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
        } else if (args[i] === '--key') {
          console.error('Security Violation: Passing API keys as command line arguments is forbidden.');
          console.error('Please enter the API key securely via prompt or pipe through stdin.');
          process.exit(1);
        }
      }

      if (!clientId && !keyHash) {
        // Read key from secure prompt or piped stdin
        rawKey = await readKeyFromStdinOrPrompt();
        if (!rawKey) {
          console.error('Error: No API key provided.');
          process.exit(1);
        }
      }

      await connectPostgres();

      const client = await revokeApiKey({ clientId, keyHash, rawKey });

      if (!client) {
        console.error('Error: No matching active API client found to revoke.');
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
