import test from 'node:test';
import assert from 'node:assert/strict';
import { query, connectPostgres, getPool } from '../../src/config/postgres.js';
import { ensureIntegrationSchema } from '../../src/config/ensureSchema.js';
import {
  cleanSlug,
  resolveSlugCollision,
  createProspect,
  updateProspect,
  processLeadsPayload,
  resolveCompanyLogo,
} from '../../src/services/prospectService.js';
import { findSampleById, findSampleBySlug, createSampleShowcase, updateSampleShowcase } from '../../src/repositories/sampleRepository.js';
import { isMockDummyLead } from '../../src/controllers/sampleController.js';
import { uploadFile, isDataUrl } from '../../src/services/storageService.js';

test('Phase 1 Prospect Service, Slug Handling & Deduplication Suite', async (t) => {
  await connectPostgres();
  await ensureIntegrationSchema();

  const createdIds = [];

  t.after(async () => {
    try {
      if (createdIds.length > 0) {
        await query(
          `DELETE FROM public_sample_showcases WHERE id = ANY($1::int[])`,
          [createdIds]
        );
      }
      await getPool().end();
    } catch (_) {}
  });

  await t.test('cleanSlug sanitizes input strings into valid URL slugs', () => {
    assert.equal(cleanSlug('https://www.Acme-Global.com/overview/'), 'acme-global-com-overview');
    assert.equal(cleanSlug('Siift AI (Strategic OS)'), 'siift-ai-strategic-os');
    assert.equal(cleanSlug('  ---DATA  I2I---  '), 'data-i2i');
    assert.equal(cleanSlug(''), '');
    assert.equal(cleanSlug(null), '');
  });

  await t.test('resolveSlugCollision auto-increments when allowIncrement=true', async () => {
    const testSlug = `collision-test-${Date.now()}`;
    const first = await createProspect({
      companyName: 'Collision Corp',
      slug: testSlug,
      status: 'DRAFT',
    }, { allowSlugIncrement: true });
    createdIds.push(first.id);
    assert.equal(first.slug, testSlug);

    const secondSlug = await resolveSlugCollision(testSlug, { allowIncrement: true });
    assert.equal(secondSlug, `${testSlug}-2`);
  });

  await t.test('resolveSlugCollision throws 409 SLUG_CONFLICT when allowIncrement=false', async () => {
    const testSlug = `conflict-test-${Date.now()}`;
    const first = await createProspect({
      companyName: 'Conflict Corp',
      slug: testSlug,
      status: 'DRAFT',
    }, { allowSlugIncrement: true });
    createdIds.push(first.id);

    await assert.rejects(
      async () => {
        await resolveSlugCollision(testSlug, { allowIncrement: false });
      },
      (err) => {
        assert.equal(err.code, 'SLUG_CONFLICT');
        assert.equal(err.status, 409);
        return true;
      }
    );
  });

  await t.test('createProspect creates a valid showcase with company study and leads', async () => {
    const sampleSlug = `sample-corp-${Date.now()}`;
    const created = await createProspect({
      companyName: 'Sample Corp',
      slug: sampleSlug,
      title: 'Sample Corp Intelligence Brief',
      description: 'Test description for sample corp',
      status: 'PUBLISHED',
      companyStudy: {
        website: 'https://samplecorp.com',
        industry: 'Cloud Infrastructure',
        businessOverview: 'Leading enterprise cloud platform',
        keyObservations: 'Opportunity 1: High cloud spend',
      },
      leads: [
        {
          name: 'Sarah Executive',
          title: 'VP Engineering',
          company: 'Sample Corp',
          email: 'sarah@samplecorp.com',
          whyRelevant: 'Direct buyer for cloud platforms',
        },
      ],
      sourcePlatform: 'TEST_SUITE',
      externalCampaignId: 'cmp_test_101',
      externalProspectId: 'prosp_test_001',
      createdByEmail: 'tester@datai2i.com',
    }, { allowSlugIncrement: true });

    assert.ok(created);
    assert.ok(created.id);
    createdIds.push(created.id);
    assert.equal(created.slug, sampleSlug);
    assert.equal(created.companyName, 'Sample Corp');
    assert.equal(created.status, 'PUBLISHED');
    assert.equal(created.leads.length, 1);
    assert.equal(created.leads[0].name, 'Sarah Executive');
  });

  await t.test('updateProspect updates showcase and merges data correctly', async () => {
    const baseSlug = `update-corp-${Date.now()}`;
    const initial = await createProspect({
      companyName: 'Update Corp Initial',
      slug: baseSlug,
      status: 'DRAFT',
    }, { allowSlugIncrement: true });
    createdIds.push(initial.id);

    const updated = await updateProspect(initial.id, {
      title: 'Updated Title for Corp',
      status: 'PUBLISHED',
      companyStudy: {
        businessOverview: 'Updated business overview content',
      },
    });

    assert.equal(updated.id, initial.id);
    assert.equal(updated.title, 'Updated Title for Corp');
    assert.equal(updated.status, 'PUBLISHED');
    assert.equal(updated.companyStudy.businessOverview, 'Updated business overview content');
  });

  await t.test('Deduplication: UNIQUE constraint blocks duplicate external_campaign_id + external_prospect_id', async () => {
    const campaignId = `cmp_dedupe_${Date.now()}`;
    const prospectId = `prosp_target_01`;

    const first = await createProspect({
      companyName: 'Dedupe Corp 1',
      slug: `dedupe-1-${Date.now()}`,
      sourcePlatform: 'DIZITALGINI',
      externalCampaignId: campaignId,
      externalProspectId: prospectId,
    }, { allowSlugIncrement: true });
    createdIds.push(first.id);

    // Attempting to insert a second showcase with the EXACT same source_platform, externalCampaignId, externalProspectId
    await assert.rejects(
      async () => {
        await query(
          `INSERT INTO public_sample_showcases (
            slug, title, company_name, source_platform, external_campaign_id, external_prospect_id
          ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            `dedupe-2-${Date.now()}`,
            'Duplicate Attempt',
            'Dedupe Corp 2',
            'DIZITALGINI',
            campaignId,
            prospectId,
          ]
        );
      },
      (err) => {
        assert.equal(err.code, '23505', 'PostgreSQL error 23505 unique_violation expected on duplicate external prospect');
        return true;
      }
    );
  });

  await t.test('Multi-company campaign: distinct external_prospect_id under same external_campaign_id succeeds', async () => {
    const campaignId = `cmp_multi_${Date.now()}`;
    const prospectA = `prosp_company_a`;
    const prospectB = `prosp_company_b`;

    const first = await createProspect({
      companyName: 'Multi Corp A',
      slug: `multi-a-${Date.now()}`,
      sourcePlatform: 'DIZITALGINI',
      externalCampaignId: campaignId,
      externalProspectId: prospectA,
    }, { allowSlugIncrement: true });
    createdIds.push(first.id);

    const second = await createProspect({
      companyName: 'Multi Corp B',
      slug: `multi-b-${Date.now()}`,
      sourcePlatform: 'DIZITALGINI',
      externalCampaignId: campaignId,
      externalProspectId: prospectB,
    }, { allowSlugIncrement: true });
    createdIds.push(second.id);

    assert.ok(first.id);
    assert.ok(second.id);
    assert.notEqual(first.id, second.id);
    assert.equal(first.slug.startsWith('multi-a'), true);
    assert.equal(second.slug.startsWith('multi-b'), true);
  });

  await t.test('Integration schema tables exist in PostgreSQL', async () => {
    const tablesRes = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name IN (
        'api_clients', 
        'integration_idempotency_keys', 
        'integration_assets', 
        'integration_batches', 
        'integration_events'
      )
    `);
    const existing = tablesRes.rows.map(r => r.table_name);
    assert.ok(existing.includes('api_clients'), 'api_clients table must exist');
    assert.ok(existing.includes('integration_idempotency_keys'), 'integration_idempotency_keys table must exist');
    assert.ok(existing.includes('integration_assets'), 'integration_assets table must exist');
    assert.ok(existing.includes('integration_batches'), 'integration_batches table must exist');
    assert.ok(existing.includes('integration_events'), 'integration_events table must exist');
  });

  // --- CHARACTERIZATION TESTS (Main branch logic vs Refactored prospectService) ---
  await t.test('Characterization: Baseline vs prospectService produces identical DB structure, strips _token, preserves asset keys', async () => {
    const testPdfDataUrl = 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwgL0xlbmd0aCA1IDAgUiA+PgpzdHJlYW0KQlQgL0YxIDEyIFRmIDcyIDcxMiBUZCAoVGVzdCBQREYpIFRqIEVUCmVuZHN0cmVhbQplbmRvYmoKNSAwIG9iago0NAplbmRvYmoKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFsgMyAwIFIgXSAvQ291bnQgMSA+PgplbmRvYmoKMyAwIG9iago8PCAvVHlwZSAvUGFnZSAvUGFyZW50IDIgMCBSIC9NZWRpYUJveCBbMCAwIDYxMiA3OTJdIC9Db250ZW50cyA0IDAgUiA+PgplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMTgzIDAwMDAwIG4gCjAwMDAwMDAyMzggMDAwMDAgbiAKMDAwMDAwMDI5OCAwMDAwMCBuIAowMDAwMDAwMDIwIDAwMDAwIG4gCjAwMDAwMDAxNjQgMDAwMDAgbiAKdHJhaWxlcgo8PCAvU2l6ZSA2IC9Sb290IDEgMCBSID4+CnN0YXJ0eHJlZgocMzgyCiUlRU9G';

    const testPayload = {
      companyName: 'Characterization Test Corp',
      _token: 'secret_jwt_bearer_token_that_must_never_be_stored',
      companyStudy: {
        company: 'Characterization Test Corp',
        website: 'https://charcorp.test',
        businessOverview: 'Enterprise test overview',
        pdfFileDataUrl: testPdfDataUrl,
        pdfFileName: 'char_test_study.pdf',
      },
      pitchDeck: {
        assetKey: 'char-orig-deck-key-555',
        fileName: 'char_deck.pdf',
        fileSize: 51200,
      },
      leads: [
        {
          id: 'lead-real-101',
          name: 'Real Executive Lead',
          role: 'CTO',
          email: 'cto@charcorp.test',
          pitchDeckAssetKey: 'lead-deck-key-888',
        },
        {
          name: 'Sarah Jenkins',
          email: 's.jenkins@acmeglobal.com',
          company: 'Acme Global Systems',
        },
      ],
    };

    // 1. BASELINE CREATION LOGIC (Original implementation from git main / 508900f)
    const baselineSlug = `char-base-${Date.now()}`;
    let baseCompanyStudy = { ...testPayload.companyStudy };
    if (baseCompanyStudy.pdfFileDataUrl && isDataUrl(baseCompanyStudy.pdfFileDataUrl)) {
      const uploadRes = await uploadFile({
        dataUrl: baseCompanyStudy.pdfFileDataUrl,
        originalName: baseCompanyStudy.pdfFileName || 'study.pdf',
        mimeType: 'application/pdf',
        prefix: `public-samples/${baselineSlug}/company-study`,
      });
      baseCompanyStudy.pdfAssetKey = uploadRes.objectKey;
      baseCompanyStudy.pdfFileName = baseCompanyStudy.pdfFileName || 'study.pdf';
      baseCompanyStudy.pdfFileSize = uploadRes.size;
      baseCompanyStudy.pdfMimeType = uploadRes.mimeType;
      delete baseCompanyStudy.pdfFileDataUrl;
    }
    const cleanBaseLeads = testPayload.leads.filter((l) => !isMockDummyLead(l));
    const processedBaseLeads = await processLeadsPayload(cleanBaseLeads, baselineSlug);
    const baselineRow = await createSampleShowcase({
      slug: baselineSlug,
      title: `${testPayload.companyName} Intelligence & Growth Showcase`,
      companyName: testPayload.companyName,
      description: `Curated account intelligence for ${testPayload.companyName}.`,
      status: 'PUBLISHED',
      companyStudy: baseCompanyStudy,
      leads: processedBaseLeads,
      pitchDeck: testPayload.pitchDeck,
    });
    createdIds.push(baselineRow.id);

    // 2. REFACTORED prospectService CREATION
    const refactoredSlug = `char-refact-${Date.now()}`;
    const refactoredRow = await createProspect({
      ...testPayload,
      slug: refactoredSlug,
    }, { allowSlugIncrement: true });
    createdIds.push(refactoredRow.id);

    // 3. COMPARE CREATED ROWS
    // Both must filter mock dummy lead
    assert.equal(baselineRow.leads.length, 1);
    assert.equal(refactoredRow.leads.length, 1);
    assert.equal(baselineRow.leads[0].name, 'Real Executive Lead');
    assert.equal(refactoredRow.leads[0].name, 'Real Executive Lead');

    // Both must upload base64 PDF and store pdfAssetKey
    assert.ok(baselineRow.companyStudy.pdfAssetKey);
    assert.ok(refactoredRow.companyStudy.pdfAssetKey);
    assert.equal(baselineRow.companyStudy.pdfFileDataUrl, undefined);
    assert.equal(refactoredRow.companyStudy.pdfFileDataUrl, undefined);

    // Both must preserve initial pitchDeck assetKey
    assert.equal(baselineRow.pitchDeck.assetKey, 'char-orig-deck-key-555');
    assert.equal(refactoredRow.pitchDeck.assetKey, 'char-orig-deck-key-555');

    // Check DB row directly to verify _token was NEVER persisted
    const rawCheck = await query(`SELECT * FROM public_sample_showcases WHERE id = $1`, [refactoredRow.id]);
    const rawRow = rawCheck.rows[0];
    const rowString = JSON.stringify(rawRow);
    assert.equal(rowString.includes('secret_jwt_bearer_token'), false, '_token must never be persisted in PostgreSQL');

    // 4. TEST UPDATE LOGIC & ASSET KEY PRESERVATION
    const updatePayload = {
      title: 'Updated Showcase Title',
      _token: 'another_token_attempt',
      companyStudy: {
        businessOverview: 'New Updated Overview',
      },
    };

    // Baseline update
    const updatedBase = await updateSampleShowcase(baselineRow.id, {
      title: updatePayload.title,
      companyStudy: {
        ...(baselineRow.companyStudy || {}),
        ...updatePayload.companyStudy,
      },
      pitchDeck: baselineRow.pitchDeck,
    });

    // Refactored updateProspect
    const updatedRefact = await updateProspect(refactoredRow.id, updatePayload);

    // Both must preserve companyStudy pdfAssetKey from creation
    assert.equal(updatedBase.companyStudy.pdfAssetKey, baselineRow.companyStudy.pdfAssetKey);
    assert.equal(updatedRefact.companyStudy.pdfAssetKey, refactoredRow.companyStudy.pdfAssetKey);

    // Both must preserve pitchDeck assetKey
    assert.equal(updatedBase.pitchDeck.assetKey, 'char-orig-deck-key-555');
    assert.equal(updatedRefact.pitchDeck.assetKey, 'char-orig-deck-key-555');

    // Both must reflect the updated overview
    assert.equal(updatedBase.companyStudy.businessOverview, 'New Updated Overview');
    assert.equal(updatedRefact.companyStudy.businessOverview, 'New Updated Overview');
  });
});
