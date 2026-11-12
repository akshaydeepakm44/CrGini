import crypto from 'node:crypto';
import { query, connectPostgres, getPool } from '../src/config/postgres.js';
import { ensureIntegrationSchema } from '../src/config/ensureSchema.js';

/**
 * Programmatically issue an API key for a client.
 *
 * @param {Object} options
 * @param {string} options.clientName - Required human-readable name of client
 * @param {string[]|string} [options.scopes] - Scopes array or comma-separated string
 * @param {boolean} [options.allowAutoPublish] - Auto-publish permission
 * @param {string[]|string} [options.allowedSenderEmails] - Allowed sender emails
 * @returns {Promise<{ client: Object, rawKey: string }>}
 */
export async function issueApiKey({
  clientName,
  scopes = ['prospects:write', 'assets:write'],
  allowAutoPublish = false,
  allowedSenderEmails = [],
} = {}) {
  if (!clientName || typeof clientName !== 'string' || !clientName.trim()) {
    throw new Error('clientName is required to issue an API key.');
  }

  const scopesArray = Array.isArray(scopes)
    ? scopes
    : String(scopes)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

  const senderEmailsArray = Array.isArray(allowedSenderEmails)
    ? allowedSenderEmails
    : String(allowedSenderEmails)
        .split(',')
        .map((e) => e.trim())
        .filter(Boolean);

  // Generate dzg_live_<hex32> (32 hex characters = 16 random bytes)
  const hex32 = crypto.randomBytes(16).toString('hex');
  const rawKey = `dzg_live_${hex32}`;

  // Generate SHA-256 hash
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

  // Generate client_id (e.g. client_<hex16>)
  const clientId = `client_${crypto.randomBytes(8).toString('hex')}`;

  const sql = `
    INSERT INTO api_clients (
      client_id,
      client_name,
      api_key_hash,
      scopes,
      status,
      allow_auto_publish,
      allowed_sender_emails
    ) VALUES ($1, $2, $3, $4, 'ACTIVE', $5, $6)
    RETURNING id, client_id, client_name, scopes, status, allow_auto_publish, allowed_sender_emails, created_at;
  `;

  const res = await query(sql, [
    clientId,
    clientName.trim(),
    keyHash,
    scopesArray,
    Boolean(allowAutoPublish),
    senderEmailsArray,
  ]);

  return {
    client: res.rows[0],
    rawKey,
  };
}

// CLI Execution Support
const isDirectExecution =
  process.argv[1] &&
  (process.argv[1].endsWith('issue-api-key.js') ||
    process.argv[1].includes('issue-api-key'));

if (isDirectExecution) {
  (async () => {
    try {
      const args = process.argv.slice(2);
      let clientName = null;
      let scopes = 'prospects:write,assets:write';
      let allowAutoPublish = false;
      let allowedSenderEmails = '';

      for (let i = 0; i < args.length; i++) {
        if (args[i] === '--client-name' && args[i + 1]) {
          clientName = args[i + 1];
          i++;
        } else if (args[i] === '--scopes' && args[i + 1]) {
          scopes = args[i + 1];
          i++;
        } else if (args[i] === '--allow-auto-publish') {
          allowAutoPublish = true;
        } else if (args[i] === '--allowed-sender-emails' && args[i + 1]) {
          allowedSenderEmails = args[i + 1];
          i++;
        }
      }

      if (!clientName) {
        console.error('Error: --client-name is required.');
        console.error('Usage: node backend/scripts/issue-api-key.js --client-name "Client Name" [--scopes "prospects:write,assets:write"]');
        process.exit(1);
      }

      await connectPostgres();
      await ensureIntegrationSchema();

      const { client, rawKey } = await issueApiKey({
        clientName,
        scopes,
        allowAutoPublish,
        allowedSenderEmails,
      });

      console.log('======================================================');
      console.log('           API CLIENT CREATED SUCCESSFULLY            ');
      console.log('======================================================');
      console.log(`Client ID:             ${client.client_id}`);
      console.log(`Client Name:           ${client.client_name}`);
      console.log(`Scopes:                ${client.scopes.join(', ')}`);
      console.log(`Status:                ${client.status}`);
      console.log(`Allow Auto-Publish:    ${client.allow_auto_publish}`);
      console.log('------------------------------------------------------');
      console.log(`Plain API Key:         ${rawKey}`);
      console.log('------------------------------------------------------');
      console.log('IMPORTANT: Store this key securely now. It is hashed');
      console.log('with SHA-256 and will NEVER be displayed again.');
      console.log('======================================================');

      await getPool().end();
      process.exit(0);
    } catch (err) {
      console.error('Fatal error issuing API key:', err.message);
      try {
        await getPool().end();
      } catch (_) {}
      process.exit(1);
    }
  })();
}

