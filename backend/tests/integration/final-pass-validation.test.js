process.env.NODE_ENV = 'test';
process.env.ENABLE_INTEGRATION_API = 'true';
process.env.PORTAL_BASE_URL = 'http://localhost:5174';

import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {
  getPortalBaseUrl,
  enforcePortalBaseUrlConfig,
  buildAbsolutePortalUrl,
} from '../../src/config/portalConfig.js';
import {
  generateOutreachMailTemplate,
  extractFirstSentences,
} from '../../src/services/mailTemplateService.js';
import { query, getPool, connectPostgres } from '../../src/config/postgres.js';
import { issueApiKey } from '../../scripts/issue-api-key.js';

const { app } = await import('../../src/server.js');

test('Final Pass Validation Suite: Absolute URLs, Non-Multipart 2MB Cap, Dual Idempotency & Mail Context', async (t) => {
  await connectPostgres();

  const server = app.listen(0);
  const serverPort = server.address().port;
  const baseUrl = `http://127.0.0.1:${serverPort}`;

  const issued = await issueApiKey({
    clientName: 'FINAL_PASS_TEST_CLIENT',
    scopes: ['prospects:write', 'assets:write'],
    allowedSenderEmails: ['campaign@dizitalgini.com'],
  });
  const apiClient = issued.client;
  const apiKey = issued.rawKey;

  t.after(async () => {
    if (server) {
      if (typeof server.closeAllConnections === 'function') server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
    }
    if (apiClient?.client_id) {
      await query(`DELETE FROM integration_events WHERE batch_id IN (SELECT id FROM integration_batches WHERE client_id = $1)`, [apiClient.client_id]);
      await query(`DELETE FROM public_sample_showcases WHERE batch_id IN (SELECT id FROM integration_batches WHERE client_id = $1)`, [apiClient.client_id]);
      await query(`DELETE FROM integration_batches WHERE client_id = $1`, [apiClient.client_id]);
      await query(`DELETE FROM integration_assets WHERE client_id = $1`, [apiClient.client_id]);
      await query(`DELETE FROM integration_idempotency_keys WHERE client_id = $1`, [apiClient.client_id]);
      await query(`DELETE FROM api_clients WHERE client_id = $1`, [apiClient.client_id]);
    }
    await getPool().end();
    setTimeout(() => process.exit(0), 50);
  });

  // 1. PORTAL_BASE_URL enforcement in production mode
  await t.test('1. PORTAL_BASE_URL enforcement in production mode', async () => {
    const origEnv = process.env.NODE_ENV;
    const origPortal = process.env.PORTAL_BASE_URL;

    try {
      process.env.NODE_ENV = 'production';

      // Unset in production -> throws error
      delete process.env.PORTAL_BASE_URL;
      assert.throws(
        () => getPortalBaseUrl(),
        /FATAL: PORTAL_BASE_URL environment variable is required in production mode/
      );

      // Insecure http:// in production -> throws error
      process.env.PORTAL_BASE_URL = 'http://dizigini.com';
      assert.throws(
        () => getPortalBaseUrl(),
        /FATAL: PORTAL_BASE_URL must begin with "https:\/\/" in production mode/
      );

      // Valid https:// in production -> succeeds and strips trailing slash
      process.env.PORTAL_BASE_URL = 'https://dizigini.com/portal/';
      assert.equal(getPortalBaseUrl(), 'https://dizigini.com/portal');
    } finally {
      if (origEnv === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = origEnv;

      if (origPortal === undefined) delete process.env.PORTAL_BASE_URL;
      else process.env.PORTAL_BASE_URL = origPortal;
    }
  });

  // 2. Absolute URLs built from PORTAL_BASE_URL in mailTemplateService
  await t.test('2. Absolute URLs and strategic highlights in mailTemplateService', async () => {
    const customPortal = 'https://portal.dizigini.com';
    const origPortal = process.env.PORTAL_BASE_URL;
    process.env.PORTAL_BASE_URL = customPortal;

    try {
      const template = generateOutreachMailTemplate({
        companyName: 'Acme Test Corp',
        showcaseSlug: 'acme-test-corp-12345',
        lead: { name: 'Alice Smith', email: 'alice@acme.example.com' },
        keyObservations: 'First sentence of observation. Second sentence here! Third sentence should be omitted.',
        potentialOpportunity: 'Expand EMEA channel partners.',
        whyRelevant: 'Head of regional expansion.',
      });

      assert.equal(
        template.showcaseUrl,
        'https://portal.dizigini.com/samples/acme-test-corp-12345'
      );
      assert.match(
        template.bodyText,
        /👉 Explore Your Interactive Showcase: https:\/\/portal\.dizigini\.com\/samples\/acme-test-corp-12345/
      );
      assert.match(
        template.bodyHtml,
        /<a href="https:\/\/portal\.dizigini\.com\/samples\/acme-test-corp-12345"/
      );

      // Strategic context included
      assert.match(template.bodyText, /• Key Strategic Observation: First sentence of observation\. Second sentence here!/);
      assert.doesNotMatch(template.bodyText, /Third sentence should be omitted/);
      assert.match(template.bodyText, /• Recommended Growth Focus: Expand EMEA channel partners\./);
      assert.match(template.bodyText, /• Strategic Alignment for Alice Smith: Head of regional expansion\./);

      assert.match(template.bodyHtml, /First sentence of observation\. Second sentence here!/);
      assert.match(template.bodyHtml, /Expand EMEA channel partners\./);
      assert.match(template.bodyHtml, /Head of regional expansion\./);

      // Boundary checks for sentence extraction
      assert.equal(extractFirstSentences('', 2), '');
      assert.equal(extractFirstSentences('Single sentence here.', 2), 'Single sentence here.');
      assert.equal(
        extractFirstSentences('Sentence one? Sentence two! Sentence three.', 2),
        'Sentence one? Sentence two!'
      );
    } finally {
      if (origPortal === undefined) delete process.env.PORTAL_BASE_URL;
      else process.env.PORTAL_BASE_URL = origPortal;
    }
  });

  // 3. 2MB limit on every non-multipart content type before auth
  await t.test('3. 2MB limit on every non-multipart content type before auth', async () => {
    const largeBuffer = Buffer.alloc(2.5 * 1024 * 1024, 'X'); // 2.5MB

    // urlencoded > 2MB rejected with 413 before auth
    const urlencodedRes = await fetch(`${baseUrl}/api/integration/v1/prospects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': String(largeBuffer.length),
      },
      body: largeBuffer,
    });
    assert.equal(urlencodedRes.status, 413, 'urlencoded > 2MB must return 413');
    const urlencodedJson = await urlencodedRes.json();
    assert.equal(urlencodedJson.error, 'PAYLOAD_TOO_LARGE');

    // text/plain > 2MB rejected with 413 before auth
    const textRes = await fetch(`${baseUrl}/api/integration/v1/prospects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'Content-Length': String(largeBuffer.length),
      },
      body: largeBuffer,
    });
    assert.equal(textRes.status, 413, 'text/plain > 2MB must return 413');
    const textJson = await textRes.json();
    assert.equal(textJson.error, 'PAYLOAD_TOO_LARGE');

    // application/octet-stream > 2MB rejected with 413 before auth
    const octetRes = await fetch(`${baseUrl}/api/integration/v1/prospects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Length': String(largeBuffer.length),
      },
      body: largeBuffer,
    });
    assert.equal(octetRes.status, 413, 'octet-stream > 2MB must return 413');
    const octetJson = await octetRes.json();
    assert.equal(octetJson.error, 'PAYLOAD_TOO_LARGE');

    // application/json > 2MB rejected with 413 before auth
    const jsonRes = await fetch(`${baseUrl}/api/integration/v1/prospects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': String(largeBuffer.length),
      },
      body: largeBuffer,
    });
    assert.equal(jsonRes.status, 413, 'application/json > 2MB must return 413');
    const jsonParsed = await jsonRes.json();
    assert.equal(jsonParsed.error, 'PAYLOAD_TOO_LARGE');
  });

  // 4. Accept both Idempotency-Key and X-Idempotency-Key
  await t.test('4. Accept both Idempotency-Key and X-Idempotency-Key headers', async () => {
    const portalBase = (process.env.PORTAL_BASE_URL || 'http://localhost:5174').replace(/\/+$/, '');

    // Primary header: Idempotency-Key
    const res1 = await fetch(`${baseUrl}/api/integration/v1/prospects/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
        'Idempotency-Key': 'FINAL_PASS_IDEMP_PRIMARY',
      },
      body: JSON.stringify({
        externalCampaignId: 'CAMP_FINAL_1',
        operatorEmail: 'campaign@dizitalgini.com',
        prospects: [
          {
            companyName: 'Final Pass Primary Co',
            externalProspectId: 'PROSP_FINAL_1',
            companyStudy: {
              keyObservations: 'Initial key observation. Additional details.',
              potentialOpportunity: 'Strategic integration roadmap.',
            },
          },
        ],
      }),
    });
    assert.equal(res1.status, 207);
    const data1 = await res1.json();
    assert.equal(data1.results[0].status, 'CREATED');
    assert.equal(data1.results[0].publicUrl, `${portalBase}/samples/${data1.results[0].slug}`);
    assert.equal(data1.results[0].previewUrl, `${portalBase}/api/samples/manage/preview/${data1.results[0].slug}`);

    // Alternative alias: X-Idempotency-Key
    const res2 = await fetch(`${baseUrl}/api/integration/v1/prospects/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
        'X-Idempotency-Key': 'FINAL_PASS_IDEMP_ALIAS',
      },
      body: JSON.stringify({
        externalCampaignId: 'CAMP_FINAL_2',
        operatorEmail: 'campaign@dizitalgini.com',
        prospects: [
          {
            companyName: 'Final Pass Alias Co',
            externalProspectId: 'PROSP_FINAL_2',
          },
        ],
      }),
    });
    assert.equal(res2.status, 207);
    const data2 = await res2.json();
    assert.equal(data2.results[0].status, 'CREATED');
    assert.equal(data2.results[0].publicUrl, `${portalBase}/samples/${data2.results[0].slug}`);
    assert.equal(data2.results[0].previewUrl, `${portalBase}/api/samples/manage/preview/${data2.results[0].slug}`);

    // GET /prospects/:id returns absolute previewUrl
    const prospId = data1.results[0].id;
    const getRes = await fetch(`${baseUrl}/api/integration/v1/prospects/${prospId}`, {
      headers: { 'X-API-Key': apiKey },
    });
    assert.equal(getRes.status, 200);
    const getData = await getRes.json();
    assert.equal(getData.publicUrl, null);
    assert.equal(getData.previewUrl, `${portalBase}/api/samples/manage/preview/${getData.slug}`);
  });
});
