import { query } from '../backend/src/config/postgres.js';

const API_BASE = 'http://127.0.0.1:5005/api';

function makeBuffer(sizeInBytes) {
  const buf = Buffer.alloc(sizeInBytes);
  buf.fill(0x41); // 'A'
  return buf;
}

function toDataUrl(buf, mimeType = 'application/pdf') {
  return `data:${mimeType};base64,${buf.toString('base64')}`;
}

async function runTests() {
  console.log('========================================================================');
  console.log('   LOCAL VALIDATION: SAMPLE LEAD UPLOAD SIZE FIXES');
  console.log('========================================================================');

  // Authenticate as ADMIN
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'team@creativegini.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@2026'
    })
  });
  const loginData = await loginRes.json();
  if (!loginRes.ok || !loginData.token) {
    throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
  }
  const token = loginData.token;
  console.log('✓ Authenticated as ADMIN');

  // Get target client company
  const clientsRes = await fetch(`${API_BASE}/company/onboarding/clients`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const clientsData = await clientsRes.json();
  const targetClient = clientsData.clients?.[0];
  if (!targetClient) {
    throw new Error('No target onboarding client found');
  }
  const targetCompanyId = targetClient.id;
  console.log(`✓ Using target client: ${targetCompanyId} (${targetClient.name || targetClient.company_name})`);

  const initialLeadsRes = await query('SELECT id FROM company_leads WHERE company_id = $1', [targetCompanyId]);
  const initialLeadIds = initialLeadsRes.rows.map(r => r.id);

  const testCases = [
    {
      name: '1. 5 MB Study + 5 MB Pitch Deck',
      expectedStatus: 200,
      studySize: 5 * 1024 * 1024,
      deckSize: 5 * 1024 * 1024,
      expectedMsgSnippet: null
    },
    {
      name: '2. 20 MB Study + 20 MB Pitch Deck',
      expectedStatus: 200,
      studySize: 20 * 1024 * 1024,
      deckSize: 20 * 1024 * 1024,
      expectedMsgSnippet: null
    },
    {
      name: '3. 25 MB Study + 25 MB Pitch Deck',
      expectedStatus: 200,
      studySize: 25 * 1024 * 1024,
      deckSize: 25 * 1024 * 1024,
      expectedMsgSnippet: null
    },
    {
      name: '4. 26 MB Study (Individual File Over Limit)',
      expectedStatus: 413,
      studySize: 26 * 1024 * 1024,
      deckSize: 0,
      expectedMsgSnippet: 'Company Study: File too large. Each file must be 25 MB or smaller.'
    },
    {
      name: '5. Oversized Request Body (> 150 MB)',
      expectedStatus: 413,
      // 120 MB binary inflates to ~160 MB base64 Data URL, which exceeds limit: '150mb'
      studySize: 120 * 1024 * 1024,
      deckSize: 0,
      expectedMsgSnippet: 'Upload payload is too large. Please reduce the combined upload size and try again.'
    }
  ];

  const results = [];

  for (const tc of testCases) {
    console.log(`\n------------------------------------------------------------------------`);
    console.log(`Running: ${tc.name}`);

    let studyDoc = null;
    let deckDoc = null;
    let totalBinary = 0;
    let totalBase64Len = 0;

    if (tc.studySize > 0) {
      const buf = makeBuffer(tc.studySize);
      const dataUrl = toDataUrl(buf, 'application/pdf');
      studyDoc = {
        name: 'test-study.pdf',
        size: tc.studySize,
        type: 'application/pdf',
        dataUrl
      };
      totalBinary += tc.studySize;
      totalBase64Len += dataUrl.length;
    }

    if (tc.deckSize > 0) {
      const buf = makeBuffer(tc.deckSize);
      const dataUrl = toDataUrl(buf, 'application/pdf');
      deckDoc = {
        name: 'test-deck.pdf',
        size: tc.deckSize,
        type: 'application/pdf',
        dataUrl
      };
      totalBinary += tc.deckSize;
      totalBase64Len += dataUrl.length;
    }

    const payload = {
      leadIndex: 1,
      companyName: 'Size Test Corp',
      website: 'https://sizetest.com',
      logo: null,
      leadStudy: studyDoc,
      pitchDeck: deckDoc,
      keyPeople: [{ name: 'Size Tester', email: 'tester@sizetest.com' }],
      keyPeopleEmails: ['tester@sizetest.com']
    };

    const jsonString = JSON.stringify(payload);
    const jsonByteLength = Buffer.byteLength(jsonString, 'utf8');

    console.log(`  Binary Total: ${(totalBinary / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`  Base64 Total: ${(totalBase64Len / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`  JSON Body Size: ${(jsonByteLength / (1024 * 1024)).toFixed(2)} MB`);

    const res = await fetch(`${API_BASE}/company/${targetCompanyId}/lead-onboarding-assets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: jsonString
    });

    const status = res.status;
    const data = await res.json().catch(async () => ({ message: await res.text() }));

    console.log(`  HTTP Status: ${status}`);
    console.log(`  Response Message: ${data?.message || JSON.stringify(data)}`);

    let passed = false;
    if (status === tc.expectedStatus) {
      if (!tc.expectedMsgSnippet || (data?.message && data.message.includes(tc.expectedMsgSnippet))) {
        passed = true;
      }
    }

    console.log(`  Test Result: ${passed ? '✓ PASS' : '✗ FAIL'}`);

    results.push({
      test: tc.name,
      binaryMB: (totalBinary / (1024 * 1024)).toFixed(2),
      jsonMB: (jsonByteLength / (1024 * 1024)).toFixed(2),
      status,
      message: data?.message || '',
      passed
    });
  }

  // Cleanup test leads created in DB
  console.log('\n------------------------------------------------------------------------');
  console.log('Cleaning up test records from database...');
  const currentLeadsRes = await query('SELECT id FROM company_leads WHERE company_id = $1', [targetCompanyId]);
  const newLeadIds = currentLeadsRes.rows.map(r => r.id).filter(id => !initialLeadIds.includes(id));
  if (newLeadIds.length > 0) {
    await query('DELETE FROM company_leads WHERE id = ANY($1)', [newLeadIds]);
    console.log(`✓ Cleaned up ${newLeadIds.length} test records`);
  } else {
    console.log('✓ No new database records needed cleanup');
  }

  console.log('\n========================================================================');
  console.log('FINAL TEST SUMMARY:');
  console.table(results.map(r => ({
    Test: r.test,
    BinaryMB: r.binaryMB,
    JsonMB: r.jsonMB,
    Status: r.status,
    Message: r.message.substring(0, 70),
    Passed: r.passed ? 'PASS' : 'FAIL'
  })));

  const allPassed = results.every(r => r.passed);
  if (!allPassed) {
    console.error('✗ Some tests failed!');
    process.exit(1);
  } else {
    console.log('✓ ALL 5 TESTS PASSED SUCCESSFULLY!');
  }
}

runTests().catch(err => {
  console.error('Fatal error in tests:', err);
  process.exit(1);
});
