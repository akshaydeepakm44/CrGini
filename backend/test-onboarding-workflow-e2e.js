import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

import { query, connectPostgres } from './src/config/postgres.js';

const API_BASE = 'http://localhost:5000/api';

async function request(endpoint, options = {}, token = null) {
  const url = `${API_BASE}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(url, { ...options, headers });
  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { status: res.status, ok: res.ok, data, headers: res.headers };
}

// 1x1 transparent PNG data URL
const SAMPLE_PNG_DATA = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

// Minimal PDF base64 data URL
const SAMPLE_PDF_DATA = 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp/Og0MTGCjEgMCBvYmoKPDwgL1R5cGUgL0NhdGFsb2cgL1BhZ2VzIDIgMCBSID4+CmVuZG9iagoyIDAgb2JqCjw8IC9UeXBlIC9QYWdlcyAvS2lkcyBbMyAwIFJdIC9Db3VudCAxID4+CmVuZG9iagozIDAgb2JqCjw8IC9UeXBlIC9QYWdlIC9QYXJlbnQgMiAwIFIgPj4KZW5kb2JqCnRyYWlsZXIKPDwgL1Jvb3QgMSAwIFIgPj4KJSVFT0YK';

async function runWorkflowTestSuite() {
  console.log('========================================================================');
  console.log('   NEW CLIENT ONBOARDING -> SAMPLE WORK COMPLETE WORKFLOW TEST SUITE   ');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  try {
    await connectPostgres();

    // -------------------------------------------------------------------------
    // STEP 0: Authenticate Admin
    // -------------------------------------------------------------------------
    console.log('[Step 0]: Authenticating Super Admin (team@creativegini.com)...');
    const adminLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'team@creativegini.com', password: 'Admin@2026' })
    });
    assert(adminLogin.ok && adminLogin.data?.token, 'Super Admin login successful');
    const adminToken = adminLogin.data.token;

    // -------------------------------------------------------------------------
    // STEP 1: Admin Creates / Onboards a NEW CLIENT (Client A)
    // -------------------------------------------------------------------------
    console.log('\n[Step 1]: Admin creates new client (Client A: Quantum Pulse Inc)...');
    const clientAEmail = `client.a.${Date.now()}@creativegini.test`;
    const clientAPassword = 'ClientAPass@2026';
    const createClientRes = await request('/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        companyName: 'Quantum Pulse Inc',
        contactPerson: 'David Vance',
        email: clientAEmail,
        password: clientAPassword,
        phone: '+1 555 123 4567',
        website: 'https://quantumpulse.io',
        industry: 'Quantum Computing SaaS',
        companyInfo: 'High-speed quantum algorithm acceleration for finance and logistics.'
      })
    }, adminToken);

    assert(createClientRes.ok && createClientRes.data?.user, 'Client A account created successfully');
    const clientAUser = createClientRes.data.user;
    const clientACompanyId = clientAUser.companyId || clientAUser.company_id || clientAUser.company?.id;
    console.log(`  Client A ID: ${clientAUser.id}, Company ID: ${clientACompanyId}`);

    // Authenticate as Client A
    const clientALogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: clientAEmail, password: clientAPassword })
    });
    assert(clientALogin.ok && clientALogin.data?.token, 'Client A authenticated successfully');
    const clientAToken = clientALogin.data.token;

    // -------------------------------------------------------------------------
    // STEP 2: Verify NO Fake Data automatically created
    // -------------------------------------------------------------------------
    console.log('\n[Step 2]: Verifying zero fake data in Client A database records...');
    const leadsCountRes = await query('SELECT count(*)::int as c FROM company_leads WHERE company_id = $1', [clientACompanyId]);
    assert(leadsCountRes.rows[0].c === 0, 'No fake leads exist in client database (count = 0)');

    const kpCountRes = await query('SELECT count(*)::int as c FROM company_key_people WHERE company_id = $1', [clientACompanyId]);
    assert(kpCountRes.rows[0].c === 0, 'No fake key people exist in client database (count = 0)');

    const clientAssetsRes = await request('/assets', {}, clientAToken);
    assert(clientAssetsRes.ok && (clientAssetsRes.data?.assets || []).length === 0, 'No fake sample assets in client assets library (count = 0)');

    // -------------------------------------------------------------------------
    // STEPS 3, 4, 5: Verify new client visible in internal team workspaces
    // -------------------------------------------------------------------------
    console.log('\n[Steps 3-5]: Verifying Client A appears in internal team onboarding workspaces...');
    const onboardingClientsRes = await request('/companies/onboarding/clients', {}, adminToken);
    const clientsList = onboardingClientsRes.data?.clients || (Array.isArray(onboardingClientsRes.data) ? onboardingClientsRes.data : []);
    assert(onboardingClientsRes.ok && Array.isArray(clientsList), 'GET /api/companies/onboarding/clients succeeded');
    
    const clientInList = clientsList.find(c => c.id === clientACompanyId);
    assert(Boolean(clientInList), 'Client A appears in onboarding client list');
    assert(clientInList.name === 'Quantum Pulse Inc', 'Client company name matches');
    assert(clientInList.onboardingStatus?.allPrepared === false, 'Company Boost status shows pending');
    assert(clientInList.leadOnboardingStatus?.allPrepared === false, 'Company Lead status shows pending');
    assert(clientInList.uiOnboardingStatus?.allPrepared === false, 'Company UI status shows pending');

    // -------------------------------------------------------------------------
    // STEP 7: Company Lead Submits: First 5 Leads, Key People, and Lead PDFs
    // -------------------------------------------------------------------------
    console.log('\n[Step 7]: Company Lead adds 5 sample leads, key people, and uploads lead PDFs...');
    
    // Save Company Study / Research
    const researchRes = await request(`/companies/${clientACompanyId}/research`, {
      method: 'PUT',
      body: JSON.stringify({ researchSummary: 'Quantum Pulse operates in quantum algorithm acceleration. Primary buyers are Head of Quantum, CTO, and VP Engineering.' })
    }, adminToken);
    assert(researchRes.ok, 'Company Lead research/study saved successfully');

    // Add 2 Key People
    await request(`/companies/${clientACompanyId}/key-people`, {
      method: 'POST',
      body: JSON.stringify({ name: 'Dr. Elena Rostova', role: 'Chief Scientific Officer', contact: 'elena@quantumpulse.io', socialProfile: 'https://linkedin.com/in/elena-rostova' })
    }, adminToken);
    await request(`/companies/${clientACompanyId}/key-people`, {
      method: 'POST',
      body: JSON.stringify({ name: 'Marcus Sterling', role: 'Head of Quantum Infrastructure', contact: 'marcus@quantumpulse.io', socialProfile: 'https://linkedin.com/in/marcus-sterling' })
    }, adminToken);

    // Add 5 Sample Leads
    const sampleLeadsData = [
      { name: 'Dr. Aris Thorne', title: 'VP of Advanced Computing', company: 'Global Financial Labs', email: 'aris@gflabs.com', location: 'New York, NY', linkedin: 'https://linkedin.com/in/aris-thorne', status: 'VERIFIED', notes: 'Verified via corporate directory' },
      { name: 'Sarah Lin', title: 'Chief Technology Officer', company: 'Apex Algorithmic', email: 'sarah.lin@apexalgo.com', location: 'San Francisco, CA', linkedin: 'https://linkedin.com/in/sarah-lin', status: 'VERIFIED', notes: 'Active CTO, verified contact' },
      { name: 'Michael Chen', title: 'Director of Machine Learning', company: 'OmniQuant Systems', email: 'mchen@omniquant.io', location: 'Boston, MA', linkedin: 'https://linkedin.com/in/mchen-quant', status: 'VERIFIED', notes: 'Verified via corporate domain' },
      { name: 'Jessica Taylor', title: 'Head of Quantitative Strategy', company: 'Citadel Edge Capital', email: 'jtaylor@citadeledge.com', location: 'Chicago, IL', linkedin: 'https://linkedin.com/in/jtaylor-edge', status: 'VERIFIED', notes: 'Corporate email validated' },
      { name: 'Robert Vance', title: 'VP of High Performance Computing', company: 'Tensor Dynamics', email: 'rvance@tensordynamics.ai', location: 'Austin, TX', linkedin: 'https://linkedin.com/in/rvance-hpc', status: 'VERIFIED', notes: 'Verified contact profile' }
    ];

    const createdLeadIds = [];
    for (const l of sampleLeadsData) {
      const addLeadRes = await request(`/companies/${clientACompanyId}/leads`, {
        method: 'POST',
        body: JSON.stringify(l)
      }, adminToken);
      assert(addLeadRes.ok && addLeadRes.data?.lead, `Sample Lead added: ${l.name}`);
      createdLeadIds.push(addLeadRes.data.lead.id);
    }

    // Upload Lead PDF for each of the 5 leads
    console.log('  Uploading Lead Dossier PDFs for all 5 sample leads...');
    for (let i = 0; i < createdLeadIds.length; i++) {
      const leadId = createdLeadIds[i];
      const leadName = sampleLeadsData[i].name;
      const pdfUploadRes = await request(`/companies/${clientACompanyId}/lead-onboarding-assets`, {
        method: 'POST',
        body: JSON.stringify({
          leadId,
          leadIndex: i + 1,
          leadName,
          file: {
            name: `Lead_0${i + 1}_${leadName.replace(/\\s+/g, '_')}_Dossier.pdf`,
            size: 2048,
            type: 'application/pdf',
            dataUrl: SAMPLE_PDF_DATA
          }
        })
      }, adminToken);
      assert(pdfUploadRes.ok && (pdfUploadRes.data?.fileUrl || pdfUploadRes.data?.file?.streamUrl), `Lead PDF uploaded for Lead 0${i + 1}: ${leadName}`);
    }

    // -------------------------------------------------------------------------
    // STEPS 8, 9, 10: Verify Client A can see 5 leads, PDF links, and Assets
    // -------------------------------------------------------------------------
    console.log('\n[Steps 8-10]: Verifying Client A sees 5 leads with associated PDFs and in Assets...');
    const clientCompanyRes = await request('/companies/my-company', {}, clientAToken);
    assert(clientCompanyRes.ok && clientCompanyRes.data?.company, 'Client A can fetch company workspace');
    const clientLeadsList = clientCompanyRes.data.company.leads || [];
    assert(clientLeadsList.length === 5, `Client A sees exactly 5 leads (found: ${clientLeadsList.length})`);
    
    // Check that each lead has source_reference / PDF
    for (let i = 0; i < clientLeadsList.length; i++) {
      const l = clientLeadsList[i];
      assert(Boolean(l.source_reference || l.sourceReference), `Lead ${i + 1} (${l.name}) has associated PDF document link`);
    }

    // Check Assets
    const clientAssetsAfterLeads = await request('/assets', {}, clientAToken);
    assert(clientAssetsAfterLeads.ok, 'Client A fetched assets library');
    const leadAssetFiles = (clientAssetsAfterLeads.data?.assets || []).filter(a => (a.ticketCode || a.requestId || '').includes('LEAD') || (a.requestTitle || '').includes('Lead'));
    assert(leadAssetFiles.length === 5, `Client A Assets library contains all 5 Lead PDFs (found: ${leadAssetFiles.length})`);

    // -------------------------------------------------------------------------
    // STEP 11, 12: Company Boost Submits: Strategic Plan, Poster, Image, DevRel Plan
    // -------------------------------------------------------------------------
    console.log('\n[Steps 11-12]: Company Boost uploads sample work and verifies in Client A Assets...');
    const boostUploadRes = await request(`/companies/${clientACompanyId}/onboarding-assets`, {
      method: 'POST',
      body: JSON.stringify({
        strategicPlan: {
          name: 'Quantum_Pulse_Strategic_Plan.pdf',
          size: 1048576,
          type: 'application/pdf',
          dataUrl: SAMPLE_PDF_DATA
        },
        poster: {
          name: 'Quantum_Pulse_Brand_Poster.png',
          size: 524288,
          type: 'image/png',
          dataUrl: SAMPLE_PNG_DATA
        },
        video: {
          name: 'Quantum_Pulse_Content_Image.png',
          size: 612000,
          type: 'image/png',
          dataUrl: SAMPLE_PNG_DATA
        },
        devrelPlan: {
          name: 'Quantum_Pulse_DevRel_Architecture.pdf',
          size: 2097152,
          type: 'application/pdf',
          dataUrl: SAMPLE_PDF_DATA
        }
      })
    }, adminToken);
    assert(boostUploadRes.ok, 'Company Boost sample assets saved successfully');

    // Verify Boost files in Client Assets
    const clientAssetsAfterBoost = await request('/assets', {}, clientAToken);
    const boostFiles = (clientAssetsAfterBoost.data?.assets || []).filter(a => (a.ticketCode || '').includes('BOOST') || (a.requestTitle || '').includes('Boost'));
    assert(boostFiles.length >= 4, `All 4 Company Boost files appear in Client A Assets (found: ${boostFiles.length})`);

    // -------------------------------------------------------------------------
    // STEPS 13, 14: Company UI Submits: UI/UX Analysis, Sample Landing Page
    // -------------------------------------------------------------------------
    console.log('\n[Steps 13-14]: Company UI uploads sample work and verifies in Client A Assets...');
    const uiUploadRes = await request(`/companies/${clientACompanyId}/ui-onboarding-assets`, {
      method: 'POST',
      body: JSON.stringify({
        uiAnalysis: {
          name: 'Quantum_Pulse_UI_UX_Analysis.pdf',
          size: 1572864,
          type: 'application/pdf',
          dataUrl: SAMPLE_PDF_DATA
        },
        landingPageEnhancement: {
          name: 'Quantum_Pulse_Landing_Page_Concept.png',
          size: 2048000,
          type: 'image/png',
          dataUrl: SAMPLE_PNG_DATA
        }
      })
    }, adminToken);
    assert(uiUploadRes.ok, 'Company UI sample assets saved successfully');

    // Verify UI files in Client Assets
    const clientAssetsAfterUI = await request('/assets', {}, clientAToken);
    const uiFiles = (clientAssetsAfterUI.data?.assets || []).filter(a => (a.ticketCode || '').includes('UI') || (a.requestTitle || '').includes('Landing Page'));
    assert(uiFiles.length >= 2, `Company UI sample files appear in Client A Assets (found: ${uiFiles.length})`);

    // -------------------------------------------------------------------------
    // STEPS 15, 16, 17: Request Additional Leads (Existing Paid Ticket Workflow)
    // -------------------------------------------------------------------------
    console.log('\n[Steps 15-17]: Client requests additional leads through paid ticket system...');
    // Create lead request (50 leads @ $7/lead = $350)
    const paidTicketRes = await request('/requests', {
      method: 'POST',
      body: JSON.stringify({
        serviceType: 'COMPANY_LEAD',
        title: 'Q4 Enterprise Quantum Banking Leads Expansion (50 Leads)',
        description: 'Targeting Tier-1 investment bank quantitative risk directors.',
        priority: 'HIGH',
        industry: 'Fintech & Investment Banking',
        targetRoles: 'Chief Risk Officer, Head of Quantitative Analytics',
        targetLocations: 'New York, London, Singapore',
        leadsCount: 50
      })
    }, clientAToken);
    assert(paidTicketRes.ok && paidTicketRes.data?.request, 'Paid lead request ticket created successfully');
    const paidTicket = paidTicketRes.data.request;
    assert(paidTicket.price === 499, `Pricing calculated correctly ($499 for 50 leads, got: $${paidTicket.price})`);
    assert(paidTicket.paymentStatus === 'PENDING', 'Initial ticket payment status is PENDING');
    assert(paidTicket.ticketId.startsWith('CG-'), `Ticket ID follows standard format: ${paidTicket.ticketId}`);

    // Client completes payment via Stripe checkout
    const payRes = await request(`/requests/${paidTicket._id}/pay`, {
      method: 'POST',
      body: JSON.stringify({ paymentMethod: 'Stripe Corporate Card' })
    }, clientAToken);
    assert(payRes.ok && payRes.data?.payment?.status === 'PAID', 'Ticket marked as PAID through checkout');

    // Internal team starts work on the ticket
    const startWorkRes = await request(`/requests/${paidTicket._id}/start-work`, { method: 'POST' }, adminToken);
    assert(startWorkRes.ok, 'Internal team transitioned ticket to IN_PROGRESS');

    // -------------------------------------------------------------------------
    // STEP 19: Strict Multi-Tenant Isolation (Client B cannot see Client A data)
    // -------------------------------------------------------------------------
    console.log('\n[Step 19]: Testing cross-client tenant isolation (Client B vs Client A)...');
    const clientBEmail = `client.b.${Date.now()}@creativegini.test`;
    const createClientBRes = await request('/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        companyName: 'CyberGuard Shield Ltd',
        contactPerson: 'Rachel Green',
        email: clientBEmail,
        password: 'ClientBPass@2026',
        industry: 'Cybersecurity'
      })
    }, adminToken);
    assert(createClientBRes.ok, 'Client B created successfully');

    const clientBLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: clientBEmail, password: 'ClientBPass@2026' })
    });
    assert(clientBLogin.ok, 'Client B logged in successfully');
    const clientBToken = clientBLogin.data.token;

    // Client B fetches company leads
    const clientBCompanyRes = await request('/companies/my-company', {}, clientBToken);
    const clientBLeads = clientBCompanyRes.data?.company?.leads || [];
    assert(clientBLeads.length === 0, 'Client B sees 0 leads (cannot see Client A leads)');

    // Client B fetches assets
    const clientBAssetsRes = await request('/assets', {}, clientBToken);
    assert((clientBAssetsRes.data?.assets || []).length === 0, 'Client B sees 0 assets (cannot see Client A assets)');

    // -------------------------------------------------------------------------
    // STEP 20: Authorization & File Access Security
    // -------------------------------------------------------------------------
    console.log('\n[Step 20]: Testing unauthorized file access...');
    const firstClientAAssetId = clientAssetsAfterUI.data.assets[0].id;
    const unauthorizedDownloadRes = await request(`/assets/${firstClientAAssetId}/download`, {}, clientBToken);
    assert(!unauthorizedDownloadRes.ok || unauthorizedDownloadRes.status === 403 || unauthorizedDownloadRes.status === 404, 'Client B is blocked with 403/404 from downloading Client A asset');

    console.log('\n========================================================================');
    console.log(`WORKFLOW TEST SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('\n[FATAL TEST FAILURE]:', err.message);
    process.exit(1);
  }
}

runWorkflowTestSuite();
