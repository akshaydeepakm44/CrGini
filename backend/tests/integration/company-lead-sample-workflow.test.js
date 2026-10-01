import assert from 'node:assert';
import { query } from '../../src/config/postgres.js';

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

const SAMPLE_PDF_BASE64 = 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp/Og0MTGCjEgMCBvYmoKPDwKL1R5cGUgL0NhdGFsb2cKL1BhZ2VzIDIgMCBSCj4+CmVuZG9iagoyIDAgb2JqCjw8Ci9UeXBlIC9QYWdlcwovS2lkcyBbMyAwIFJdCi9Db3VudCAxCj4+CmVuZG9iagozIDAgb2JqCjw8Ci9UeXBlIC9QYWdlCi9QYXJlbnQgMiAwIFIKL01lZGlhQm94IFswIDAgNjEyIDc5Ml0KPj4KZW5kb2JqCnhyZWYKMCA0CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxNSAwMDAwMCBuIAowMDAwMDAwMDY4IDAwMDAwIG4gCjAwMDAwMDAxMjUgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA0Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgoxOTkKJSVFT0YK';

async function req(endpoint, options = {}, token = null) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('========================================================================');
  console.log('   COMPANY LEAD SAMPLE WORKFLOW SPECIFIC TEST SUITE');
  console.log('========================================================================');

  const timestamp = Date.now();

  // 1. Admin login
  const adminLogin = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'team@creativegini.com', password: process.env.ADMIN_PASSWORD || 'Admin@2026' })
  });
  assert(adminLogin.ok && adminLogin.data?.token, 'Super admin logged in');
  const adminToken = adminLogin.data.token;

  // 2. Create Client A and Client B
  const clientAEmail = `sample.client.a.${timestamp}@creativegini.test`;
  const createARes = await req('/admin/users', {
    method: 'POST',
    body: JSON.stringify({
      companyName: `Sample Alpha Corp ${timestamp}`,
      contactPerson: 'Alice Alpha',
      email: clientAEmail,
      password: 'ClientAPass@2026',
      industry: 'Technology'
    })
  }, adminToken);
  assert(createARes.ok && createARes.data?.user, 'Client A created');
  const userA = createARes.data.user;
  const companyAId = userA.companyId || userA.company_id || userA.company?.id;

  const clientBEmail = `sample.client.b.${timestamp}@creativegini.test`;
  const createBRes = await req('/admin/users', {
    method: 'POST',
    body: JSON.stringify({
      companyName: `Sample Beta Corp ${timestamp}`,
      contactPerson: 'Bob Beta',
      email: clientBEmail,
      password: 'ClientBPass@2026',
      industry: 'Finance'
    })
  }, adminToken);
  assert(createBRes.ok && createBRes.data?.user, 'Client B created');
  const userB = createBRes.data.user;
  const companyBId = userB.companyId || userB.company_id || userB.company?.id;

  // Log in as Client A and Client B
  const loginARes = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: clientAEmail, password: 'ClientAPass@2026' })
  });
  const clientAToken = loginARes.data.token;

  const loginBRes = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: clientBEmail, password: 'ClientBPass@2026' })
  });
  const clientBToken = loginBRes.data.token;

  console.log('\n[Validation 1]: Submitting sample lead without company name (Must fail 400)...');
  const missingNameRes = await req(`/company/${companyAId}/lead-onboarding-assets`, {
    method: 'POST',
    body: JSON.stringify({
      companyName: '',
      website: 'https://acmecorp.com',
      file: { name: 'acme.pdf', type: 'application/pdf', dataUrl: SAMPLE_PDF_BASE64 }
    })
  }, adminToken);
  assert(missingNameRes.status === 400, `Expected 400 for missing companyName, got ${missingNameRes.status}`);
  console.log('  ✓ Missing company name correctly rejected with 400');

  console.log('\n[Validation 2]: Submitting sample lead with invalid website URL (Must fail 400)...');
  const invalidUrlRes = await req(`/company/${companyAId}/lead-onboarding-assets`, {
    method: 'POST',
    body: JSON.stringify({
      companyName: 'Acme Corp',
      website: 'not-a-valid-url',
      file: { name: 'acme.pdf', type: 'application/pdf', dataUrl: SAMPLE_PDF_BASE64 }
    })
  }, adminToken);
  assert(invalidUrlRes.status === 400, `Expected 400 for invalid URL, got ${invalidUrlRes.status}`);
  console.log('  ✓ Invalid website URL correctly rejected with 400');

  console.log('\n[Validation 3]: Submitting sample lead without PDF document (Must fail 400)...');
  const missingPdfRes = await req(`/company/${companyAId}/lead-onboarding-assets`, {
    method: 'POST',
    body: JSON.stringify({
      companyName: 'Acme Corp',
      website: 'https://acmecorp.com',
      file: null
    })
  }, adminToken);
  assert(missingPdfRes.status === 400, `Expected 400 for missing PDF, got ${missingPdfRes.status}`);
  console.log('  ✓ Missing PDF correctly rejected with 400');

  console.log('\n[Validation 4]: Submitting non-PDF file (e.g. text/plain) (Must fail 400)...');
  const notPdfRes = await req(`/company/${companyAId}/lead-onboarding-assets`, {
    method: 'POST',
    body: JSON.stringify({
      companyName: 'Acme Corp',
      website: 'https://acmecorp.com',
      file: { name: 'notes.txt', type: 'text/plain', dataUrl: 'data:text/plain;base64,aGVsbG8=' }
    })
  }, adminToken);
  assert(notPdfRes.status === 400, `Expected 400 for non-PDF file, got ${notPdfRes.status}`);
  console.log('  ✓ Non-PDF file correctly rejected with 400');

  console.log('\n[Success Case]: Uploading 3 sample leads with valid data & PDFs for Client A...');
  const sampleLeadsToCreate = [
    { companyName: 'Apex Financial Technologies', website: 'https://apexfintech.com' },
    { companyName: 'CyberShield Systems Inc', website: 'https://cybershield.io' },
    { companyName: 'OmniQuant Dynamics', website: 'https://omniquant.ai' }
  ];

  let sampleAssetId = null;

  for (let i = 0; i < sampleLeadsToCreate.length; i++) {
    const sl = sampleLeadsToCreate[i];
    const uploadRes = await req(`/company/${companyAId}/lead-onboarding-assets`, {
      method: 'POST',
      body: JSON.stringify({
        leadIndex: i + 1,
        companyName: sl.companyName,
        website: sl.website,
        file: {
          name: `${sl.companyName.replace(/\s+/g, '_')}_Dossier.pdf`,
          size: 15420,
          type: 'application/pdf',
          dataUrl: SAMPLE_PDF_BASE64
        }
      })
    }, adminToken);
    assert(uploadRes.ok, `Sample lead ${i + 1} (${sl.companyName}) created successfully`);
    assert(uploadRes.data?.file?.streamUrl, 'Response contains streamUrl');
    assert(uploadRes.data?.file?.downloadUrl, 'Response contains downloadUrl');
    if (i === 0) {
      sampleAssetId = uploadRes.data.file.id;
    }
  }
  console.log('  ✓ All 3 sample leads and PDFs created successfully');

  console.log('\n[Client A View]: Verifying Client A gets the 3 sample leads with companyName, website, and pdf...');
  const clientMyCompanyRes = await req('/company/my-company', {}, clientAToken);
  assert(clientMyCompanyRes.ok, 'Client A fetched my-company');
  const leads = clientMyCompanyRes.data?.company?.leads || [];
  assert(leads.length === 3, `Client A sees 3 sample leads, got ${leads.length}`);

  for (let i = 0; i < leads.length; i++) {
    const l = leads[i];
    assert(l.companyName || l.lead_company, `Lead ${i + 1} has companyName`);
    assert(l.website, `Lead ${i + 1} has valid website`);
    assert(l.pdf?.streamUrl, `Lead ${i + 1} has pdf object with streamUrl`);
    assert(l.pdf?.downloadUrl, `Lead ${i + 1} has pdf object with downloadUrl`);
  }
  console.log('  ✓ Client A sees sample leads with accurate companyName, website, and in-portal pdf viewer links');

  console.log('\n[Client A Assets]: Verifying Client A assets library includes the uploaded PDFs...');
  const clientAAssetsRes = await req('/assets', {}, clientAToken);
  assert(clientAAssetsRes.ok, 'Client A fetched assets');
  const assetFiles = (clientAAssetsRes.data?.assets || []).filter(a => (a.ticketCode || '').includes('LEAD') || (a.requestTitle || '').includes('Lead'));
  assert(assetFiles.length === 3, `Client A Assets library contains all 3 PDFs (found: ${assetFiles.length})`);
  console.log('  ✓ Uploaded company lead PDFs are automatically available in Client A Assets library');

  console.log('\n[Tenant Isolation / IDOR]: Verifying Client B cannot access Client A sample lead PDFs...');
  const streamResB = await fetch(`${BASE_URL}/assets/${sampleAssetId}/stream`, {
    headers: { Authorization: `Bearer ${clientBToken}` }
  });
  assert(streamResB.status === 403, `Expected 403 Forbidden for Client B streaming Client A PDF, got: ${streamResB.status}`);

  const downloadResB = await fetch(`${BASE_URL}/assets/${sampleAssetId}/download`, {
    headers: { Authorization: `Bearer ${clientBToken}` }
  });
  assert(downloadResB.status === 403, `Expected 403 Forbidden for Client B downloading Client A PDF, got: ${downloadResB.status}`);
  console.log('  ✓ Cross-tenant IDOR protection verified: Client B cannot stream or download Client A lead PDF');

  console.log('\n[Client B Leads Isolation]: Verifying Client B sees 0 sample leads...');
  const clientBCompanyRes = await req('/company/my-company', {}, clientBToken);
  assert(clientBCompanyRes.ok, 'Client B fetched my-company');
  const bLeads = clientBCompanyRes.data?.company?.leads || [];
  assert(bLeads.length === 0, `Client B sees 0 leads, got ${bLeads.length}`);
  console.log('  ✓ Client B workspace is strictly isolated (0 leads)');

  console.log('\n[Dedicated Lead Onboarding Endpoint]: Testing GET /api/company/my-company/lead-onboarding-assets...');
  const onbResA = await req('/company/my-company/lead-onboarding-assets', {}, clientAToken);
  assert(onbResA.ok, 'Client A can fetch my-company/lead-onboarding-assets');
  assert(onbResA.data?.leads?.length === 3, `Expected 3 leads from onb endpoint, got: ${onbResA.data?.leads?.length}`);
  assert(onbResA.data?.leads[0]?.pdf?.streamUrl, 'Lead contains pdf.streamUrl');
  console.log('  ✓ Dedicated endpoint returns sample leads with PDF metadata');

  console.log('\n========================================================================');
  console.log('ALL COMPANY LEAD SAMPLE WORKFLOW TESTS PASSED (100%)!');
  console.log('========================================================================\n');
}

runTests().catch(err => {
  console.error('[TEST SUITE FAILURE]:', err);
  process.exit(1);
});
