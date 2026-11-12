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
  await t.test('1. PORTAL_BASE_URL enforcement: enforced only when ENABLE_INTEGRATION_API=true', async () => {
    const origEnv = process.env.NODE_ENV;
    const origPortal = process.env.PORTAL_BASE_URL;
    const origIntegration = process.env.ENABLE_INTEGRATION_API;

    try {
      process.env.NODE_ENV = 'production';

      // Case A: ENABLE_INTEGRATION_API=true -> Enforces strictly
      process.env.ENABLE_INTEGRATION_API = 'true';

      delete process.env.PORTAL_BASE_URL;
      assert.throws(
        () => getPortalBaseUrl(),
        /FATAL: PORTAL_BASE_URL environment variable is required in production mode when ENABLE_INTEGRATION_API=true/
      );

      process.env.PORTAL_BASE_URL = 'http://dizigini.com';
      assert.throws(
        () => getPortalBaseUrl(),
        /FATAL: PORTAL_BASE_URL must begin with "https:\/\/" in production mode when ENABLE_INTEGRATION_API=true/
      );

      process.env.PORTAL_BASE_URL = 'https://dizigini.com/portal/';
      assert.equal(getPortalBaseUrl(), 'https://dizigini.com/portal');

      // Case B: ENABLE_INTEGRATION_API=false (flag off) -> Warns only, does not throw or halt startup
      process.env.ENABLE_INTEGRATION_API = 'false';
      delete process.env.PORTAL_BASE_URL;
      assert.equal(enforcePortalBaseUrlConfig(), true, 'Startup succeeds when integration API is disabled');
      assert.equal(getPortalBaseUrl(), '', 'Returns empty string without throwing when flag is off');
    } finally {
      if (origEnv === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = origEnv;

      if (origPortal === undefined) delete process.env.PORTAL_BASE_URL;
      else process.env.PORTAL_BASE_URL = origPortal;

      if (origIntegration === undefined) delete process.env.ENABLE_INTEGRATION_API;
      else process.env.ENABLE_INTEGRATION_API = origIntegration;
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
        status: 'DRAFT',
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

      // ReadyToSend flag for draft is false
      assert.equal(template.readyToSend, false);
      assert.match(template.warning, /Showcase is currently in DRAFT status/);

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

  // 3. 2MB limit on every non-multipart content type (both Content-Length and Chunked stream)
  await t.test('3. 2MB limit on every non-multipart content type before auth (Content-Length and Chunked)', async () => {
    // Helper to send chunked stream without Content-Length
    const sendChunked = (contentType, includeApiKey = false) => {
      return new Promise((resolve, reject) => {
        const headers = {
          'Content-Type': contentType,
          'Transfer-Encoding': 'chunked',
        };
        if (includeApiKey) {
          headers['X-API-Key'] = apiKey;
        }

        const req = http.request(
          {
            hostname: '127.0.0.1',
            port: serverPort,
            path: '/api/integration/v1/prospects',
            method: 'POST',
            headers,
          },
          (res) => {
            let body = '';
            res.on('data', (c) => (body += c));
            res.on('end', () => {
              let parsed = {};
              try {
                parsed = JSON.parse(body);
              } catch (_) {}
              resolve({ status: res.statusCode, data: parsed, rawBody: body });
            });
          }
        );
        req.on('error', reject);

        // Send 2.5MB in 512KB chunks
        const chunk = Buffer.alloc(512 * 1024, 'a');
        for (let i = 0; i < 5; i++) {
          req.write(chunk);
        }
        req.end();
      });
    };

    // Test chunked >2MB across urlencoded, text/plain, and json, with and without API key
    const contentTypes = [
      'application/x-www-form-urlencoded',
      'text/plain',
      'application/json',
    ];

    for (const ct of contentTypes) {
      // Without API key -> 413 (must be rejected before auth!)
      const noKeyRes = await sendChunked(ct, false);
      assert.equal(noKeyRes.status, 413, `${ct} chunked without key must return 413`);
      assert.equal(noKeyRes.data.error, 'PAYLOAD_TOO_LARGE');

      // With API key -> 413
      const withKeyRes = await sendChunked(ct, true);
      assert.equal(withKeyRes.status, 413, `${ct} chunked with key must return 413`);
      assert.equal(withKeyRes.data.error, 'PAYLOAD_TOO_LARGE');
    }
  });

  // 4. Draft publicUrl isolation, showcaseStatus, and mailTemplate readyToSend
  await t.test('4. Draft isolation: publicUrl is null until PUBLISHED, showcaseStatus and readyToSend flags accurate', async () => {
    const portalBase = (process.env.PORTAL_BASE_URL || 'http://localhost:5174').replace(/\/+$/, '');

    // A. Batch creation in DRAFT status
    const batchRes = await fetch(`${baseUrl}/api/integration/v1/prospects/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
        'Idempotency-Key': `IDEMP_DRAFT_TEST_${Date.now()}`,
      },
      body: JSON.stringify({
        externalCampaignId: 'CAMP_DRAFT_TEST',
        operatorEmail: 'campaign@dizitalgini.com',
        prospects: [
          {
            companyName: 'Draft Test Company',
            externalProspectId: 'PROSP_DRAFT_1',
            status: 'DRAFT',
            companyStudy: {
              keyObservations: 'Strong enterprise base.',
            },
          },
        ],
      }),
    });
    assert.equal(batchRes.status, 207);
    const batchData = await batchRes.json();
    const batchItem = batchData.results[0];
    assert.equal(batchItem.status, 'CREATED');
    assert.equal(batchItem.showcaseStatus, 'DRAFT', 'showcaseStatus must be DRAFT');
    assert.equal(batchItem.publicUrl, null, 'Draft publicUrl must be null in batch response');
    assert.equal(batchItem.previewUrl, `${portalBase}/api/samples/manage/preview/${batchItem.slug}`);

    // B. Single prospect creation in DRAFT status
    const singleRes = await fetch(`${baseUrl}/api/integration/v1/prospects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
        'Idempotency-Key': `IDEMP_SINGLE_DRAFT_${Date.now()}`,
      },
      body: JSON.stringify({
        externalCampaignId: 'CAMP_SINGLE_DRAFT',
        externalProspectId: 'PROSP_SINGLE_1',
        companyName: 'Single Draft Company',
        status: 'DRAFT',
      }),
    });
    assert.equal(singleRes.status, 201);
    const singleData = await singleRes.json();
    assert.equal(singleData.showcaseStatus, 'DRAFT');
    assert.equal(singleData.publicUrl, null, 'Draft publicUrl must be null in single prospect response');
    assert.equal(singleData.previewUrl, `${portalBase}/api/samples/manage/preview/${singleData.slug}`);

    // C. GET /prospects/:id for draft
    const getProspRes = await fetch(`${baseUrl}/api/integration/v1/prospects/${batchItem.id}`, {
      headers: { 'X-API-Key': apiKey },
    });
    assert.equal(getProspRes.status, 200);
    const getProspData = await getProspRes.json();
    assert.equal(getProspData.showcaseStatus, 'DRAFT');
    assert.equal(getProspData.publicUrl, null, 'Draft publicUrl must be null in GET /prospects/:id');

    // D. GET /batches/:batchId for draft
    const getBatchRes = await fetch(`${baseUrl}/api/integration/v1/batches/${batchData.batchId}`, {
      headers: { 'X-API-Key': apiKey },
    });
    assert.equal(getBatchRes.status, 200);
    const getBatchData = await getBatchRes.json();
    assert.equal(getBatchData.showcases[0].showcaseStatus, 'DRAFT');
    assert.equal(getBatchData.showcases[0].publicUrl, null, 'Draft publicUrl must be null in GET /batches/:id');

    // E. GET /prospects/:id/mail-template for draft
    const mailRes = await fetch(`${baseUrl}/api/integration/v1/prospects/${batchItem.id}/mail-template`, {
      headers: { 'X-API-Key': apiKey },
    });
    assert.equal(mailRes.status, 200);
    const mailData = await mailRes.json();
    assert.equal(mailData.showcaseStatus, 'DRAFT');
    assert.equal(mailData.readyToSend, false, 'readyToSend must be false for draft');
    assert.match(mailData.warning, /Showcase is currently in DRAFT status/);
    assert.equal(mailData.mailTemplate.readyToSend, false);
    assert.match(mailData.mailTemplate.warning, /Showcase is currently in DRAFT status/);

    // F. Publish showcase and verify publicUrl becomes active and readyToSend becomes true
    await query(`UPDATE public_sample_showcases SET status = 'PUBLISHED' WHERE id = $1`, [batchItem.id]);

    const pubProspRes = await fetch(`${baseUrl}/api/integration/v1/prospects/${batchItem.id}`, {
      headers: { 'X-API-Key': apiKey },
    });
    assert.equal(pubProspRes.status, 200);
    const pubProspData = await pubProspRes.json();
    assert.equal(pubProspData.showcaseStatus, 'PUBLISHED');
    assert.equal(pubProspData.publicUrl, `${portalBase}/samples/${batchItem.slug}`);

    const pubMailRes = await fetch(`${baseUrl}/api/integration/v1/prospects/${batchItem.id}/mail-template`, {
      headers: { 'X-API-Key': apiKey },
    });
    assert.equal(pubMailRes.status, 200);
    const pubMailData = await pubMailRes.json();
    assert.equal(pubMailData.showcaseStatus, 'PUBLISHED');
    assert.equal(pubMailData.readyToSend, true, 'readyToSend must be true when published');
    assert.equal(pubMailData.warning, null);
  });

  // 5. Accept both Idempotency-Key and X-Idempotency-Key
  await t.test('5. Accept both Idempotency-Key and X-Idempotency-Key headers', async () => {
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
    assert.equal(data1.results[0].showcaseStatus, 'DRAFT');
    assert.equal(data1.results[0].publicUrl, null);
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
    assert.equal(data2.results[0].showcaseStatus, 'DRAFT');
    assert.equal(data2.results[0].publicUrl, null);
    assert.equal(data2.results[0].previewUrl, `${portalBase}/api/samples/manage/preview/${data2.results[0].slug}`);
  });
});
