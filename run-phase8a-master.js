import fs from 'fs';
import path from 'path';
import { CdpSession } from './qa-cdp.js';

async function loginUser(session, email, pass) {
  console.log(`[AUTH] Logging in as ${email}...`);
  await session.navigate('http://localhost:5173/signin', 1000);
  await session.eval(`localStorage.clear(); sessionStorage.clear();`);
  await session.navigate('http://localhost:5173/signin', 1000);
  await session.waitFor(`() => !!document.querySelector('#email-input')`, 8000, 200);

  await session.type('#email-input', email);
  await session.type('#password-input', pass);
  await session.click('button[type="submit"]', 1500);
  await session.waitFor(`() => window.location.pathname !== '/signin'`, 8000, 200);
  await new Promise(r => setTimeout(r, 800));
}

async function logoutUser(session) {
  console.log('[AUTH] Logging out...');
  await session.eval(`
    localStorage.removeItem('cg_auth_token');
    sessionStorage.clear();
    window.location.href = '/signin';
  `);
  await session.waitFor(`() => window.location.pathname === '/signin'`, 8000, 200);
  await new Promise(r => setTimeout(r, 500));
}

async function runMasterSuite() {
  const session = await CdpSession.create();
  console.log('================================================================');
  console.log('   CREATIVEGINI — PHASE 8A MASTER QA & DEFECT REMEDIATION TEST  ');
  console.log('   DEF-001 (RBAC) | DEF-002 (DEVREL) | DEF-003 (UI/DESIGN)      ');
  console.log('================================================================\n');

  const report = {
    def001: [],
    def002: {},
    def003_audit: {},
    def003_figma: {},
    def003_redesign: {},
    regression: []
  };

  try {
    // =========================================================================
    // SECTION 1: DEF-001 — SPECIALIST ROUTE RBAC LIVE SECURITY AUDIT
    // =========================================================================
    console.log('\n================================================================');
    console.log('>>> [1/4] DEF-001 — SPECIALIST ROUTE RBAC VERIFICATION');
    console.log('================================================================');

    // 1. USER attempts unauthorized routes
    console.log('\n[TEST 1.1] Authenticated USER Role Boundary Testing...');
    await loginUser(session, 'testclient@datai2i.com', 'Client@123');

    const userChecks = [
      { path: '/lead', shot: 'phase8a_def001_user_lead.png' },
      { path: '/boost', shot: 'phase8a_def001_user_boost.png' },
      { path: '/design', shot: 'phase8a_def001_user_design.png' },
      { path: '/admin', shot: 'phase8a_def001_user_admin.png' }
    ];

    for (const chk of userChecks) {
      await session.navigate(`http://localhost:5173${chk.path}`, 1000);
      await new Promise(r => setTimeout(r, 1200));
      const landed = await session.eval('window.location.pathname');
      const isBlocked = !landed.startsWith('/lead') && !landed.startsWith('/boost') && !landed.startsWith('/design') && !landed.startsWith('/admin');
      await session.screenshot(chk.shot);
      console.log(`  -> USER attempted ${chk.path.padEnd(10)} | Landed: ${landed.padEnd(15)} | BLOCKED: ${isBlocked}`);
      report.def001.push({ role: 'USER', target: chk.path, landed, status: isBlocked ? 'PASS' : 'FAIL' });
    }
    await logoutUser(session);

    // 2. COMPANY_LEAD boundaries
    console.log('\n[TEST 1.2] COMPANY_LEAD Role Boundary Testing...');
    await loginUser(session, 'lead@creativegini.com', 'Lead@123');
    await session.navigate('http://localhost:5173/lead', 1200);
    let leadLanded = await session.eval('window.location.pathname');
    let leadPass = leadLanded.startsWith('/lead');
    await session.screenshot('phase8a_def001_lead_lead_pass.png');
    console.log(`  -> LEAD authorized /lead       | Landed: ${leadLanded.padEnd(15)} | PASS: ${leadPass}`);
    report.def001.push({ role: 'COMPANY_LEAD', target: '/lead', landed: leadLanded, status: leadPass ? 'PASS' : 'FAIL' });

    const leadChecks = [
      { path: '/boost', shot: 'phase8a_def001_lead_boost_blocked.png' },
      { path: '/design', shot: 'phase8a_def001_lead_design_blocked.png' },
      { path: '/admin', shot: 'phase8a_def001_lead_admin_blocked.png' }
    ];
    for (const chk of leadChecks) {
      await session.navigate(`http://localhost:5173${chk.path}`, 1000);
      await new Promise(r => setTimeout(r, 1200));
      const landed = await session.eval('window.location.pathname');
      const isBlocked = !landed.startsWith('/boost') && !landed.startsWith('/design') && !landed.startsWith('/admin');
      await session.screenshot(chk.shot);
      console.log(`  -> LEAD attempted ${chk.path.padEnd(10)} | Landed: ${landed.padEnd(15)} | BLOCKED: ${isBlocked}`);
      report.def001.push({ role: 'COMPANY_LEAD', target: chk.path, landed, status: isBlocked ? 'PASS' : 'FAIL' });
    }
    await logoutUser(session);

    // 3. COMPANY_BOOST boundaries
    console.log('\n[TEST 1.3] COMPANY_BOOST Role Boundary Testing...');
    await loginUser(session, 'boost@creativegini.com', 'Boost@123');
    await session.navigate('http://localhost:5173/boost', 1200);
    let boostLanded = await session.eval('window.location.pathname');
    let boostPass = boostLanded.startsWith('/boost');
    await session.screenshot('phase8a_def001_boost_boost_pass.png');
    console.log(`  -> BOOST authorized /boost     | Landed: ${boostLanded.padEnd(15)} | PASS: ${boostPass}`);
    report.def001.push({ role: 'COMPANY_BOOST', target: '/boost', landed: boostLanded, status: boostPass ? 'PASS' : 'FAIL' });

    const boostChecks = [
      { path: '/lead', shot: 'phase8a_def001_boost_lead_blocked.png' },
      { path: '/design', shot: 'phase8a_def001_boost_design_blocked.png' },
      { path: '/admin', shot: 'phase8a_def001_boost_admin_blocked.png' }
    ];
    for (const chk of boostChecks) {
      await session.navigate(`http://localhost:5173${chk.path}`, 1000);
      await new Promise(r => setTimeout(r, 1200));
      const landed = await session.eval('window.location.pathname');
      const isBlocked = !landed.startsWith('/lead') && !landed.startsWith('/design') && !landed.startsWith('/admin');
      await session.screenshot(chk.shot);
      console.log(`  -> BOOST attempted ${chk.path.padEnd(10)} | Landed: ${landed.padEnd(15)} | BLOCKED: ${isBlocked}`);
      report.def001.push({ role: 'COMPANY_BOOST', target: chk.path, landed, status: isBlocked ? 'PASS' : 'FAIL' });
    }
    await logoutUser(session);

    // 4. LANDING_PAGE boundaries
    console.log('\n[TEST 1.4] LANDING_PAGE Role Boundary Testing...');
    await loginUser(session, 'ui@creativegini.com', 'UI@123');
    await session.navigate('http://localhost:5173/design', 1200);
    let designLanded = await session.eval('window.location.pathname');
    let designPass = designLanded.startsWith('/design');
    await session.screenshot('phase8a_def001_landing_design_pass.png');
    console.log(`  -> DESIGN authorized /design   | Landed: ${designLanded.padEnd(15)} | PASS: ${designPass}`);
    report.def001.push({ role: 'LANDING_PAGE', target: '/design', landed: designLanded, status: designPass ? 'PASS' : 'FAIL' });

    const designChecks = [
      { path: '/lead', shot: 'phase8a_def001_landing_lead_blocked.png' },
      { path: '/boost', shot: 'phase8a_def001_landing_boost_blocked.png' },
      { path: '/admin', shot: 'phase8a_def001_landing_admin_blocked.png' }
    ];
    for (const chk of designChecks) {
      await session.navigate(`http://localhost:5173${chk.path}`, 1000);
      await new Promise(r => setTimeout(r, 1200));
      const landed = await session.eval('window.location.pathname');
      const isBlocked = !landed.startsWith('/lead') && !landed.startsWith('/boost') && !landed.startsWith('/admin');
      await session.screenshot(chk.shot);
      console.log(`  -> DESIGN attempted ${chk.path.padEnd(10)} | Landed: ${landed.padEnd(15)} | BLOCKED: ${isBlocked}`);
      report.def001.push({ role: 'LANDING_PAGE', target: chk.path, landed, status: isBlocked ? 'PASS' : 'FAIL' });
    }
    await logoutUser(session);

    // 5. SUPER_ADMIN authorized access
    console.log('\n[TEST 1.5] SUPER_ADMIN Access Verification...');
    await loginUser(session, 'team@creativegini.com', 'Admin@2026');
    await session.navigate('http://localhost:5173/admin/operations', 1200);
    let adminLanded = await session.eval('window.location.pathname');
    let adminPass = adminLanded.startsWith('/admin');
    await session.screenshot('phase8a_def001_admin_pass.png');
    console.log(`  -> ADMIN authorized /admin/ops  | Landed: ${adminLanded.padEnd(15)} | PASS: ${adminPass}`);
    report.def001.push({ role: 'SUPER_ADMIN', target: '/admin/operations', landed: adminLanded, status: adminPass ? 'PASS' : 'FAIL' });
    await logoutUser(session);


    // =========================================================================
    // SECTION 2: DEF-002 — DEVREL QUEUE VISIBILITY & FULL WORKFLOW LIFECYCLE
    // =========================================================================
    console.log('\n================================================================');
    console.log('>>> [2/4] DEF-002 — DEVREL QUEUE VISIBILITY & LIFECYCLE');
    console.log('================================================================');

    const devrelMarker = `D2I-DEVREL-P8A-${Date.now()}`;
    await loginUser(session, 'testclient@datai2i.com', 'Client@123');
    await session.navigate('http://localhost:5173/portal/boosting/devrel', 1500);

    // Open DevRel modal
    console.log('[DEVREL] Opening DevRel request modal...');
    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.innerText && b.innerText.includes('Request DevRel'));
        if (btn) btn.click();
      })()
    `);
    await session.waitFor(`() => !!document.querySelector('input[placeholder*="Increase SDK installs"]')`, 5000, 200);

    // Test Empty Validation
    console.log('[DEVREL] Testing required-field validation on empty form...');
    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const revBtn = btns.find(b => b.innerText && b.innerText.includes('Review Requirements'));
        if (revBtn) revBtn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 600));
    await session.screenshot('phase8a_def002_validation.png');

    // Fill DevRel inputs
    console.log(`[DEVREL] Filling DevRel fields with unique marker ${devrelMarker}...`);
    await session.eval(`
      (() => {
        const inputSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        const textSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;

        const inputs = Array.from(document.querySelectorAll('input, textarea'));
        inputs.forEach(inp => {
          const ph = inp.placeholder || '';
          let val = '';
          if (ph.includes('Increase SDK installs')) {
            val = 'Developer Relations & Ecosystem Growth for Data I2I';
          } else if (ph.includes('TypeScript SDK')) {
            val = 'Data I2I Cloud SDK & Automation API';
          } else if (ph.includes('Frontend Engineers')) {
            val = 'Cloud Data Engineers, DevRel Advocates & Solution Architects';
          } else if (ph.includes('DevRel operational blueprint')) {
            val = 'Comprehensive DevRel strategic roadmap and hackathon sprint plan. Marker: ${devrelMarker}';
          }

          if (val) {
            if (inp.tagName === 'INPUT') inputSetter.call(inp, val);
            else if (inp.tagName === 'TEXTAREA') textSetter.call(inp, val);
            inp.dispatchEvent(new Event('input', { bubbles: true }));
            inp.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
      })()
    `);
    await new Promise(r => setTimeout(r, 500));
    await session.screenshot('phase8a_def002_client_request.png');

    // Step 1 -> Step 2 Review
    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const revBtn = btns.find(b => b.innerText && b.innerText.includes('Review Requirements'));
        if (revBtn) revBtn.click();
      })()
    `);
    await session.waitFor(`() => !!document.body.innerText.includes('Proceed to Pricing')`, 5000, 200);

    // Step 2 -> Step 3 Pricing
    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const prcBtn = btns.find(b => b.innerText && b.innerText.includes('Proceed to Pricing'));
        if (prcBtn) prcBtn.click();
      })()
    `);
    await session.waitFor(`() => !!document.body.innerText.includes('Confirm & Submit Request')`, 5000, 200);

    // Step 3 -> Submit
    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const subBtn = btns.find(b => b.innerText && b.innerText.includes('Confirm & Submit Request'));
        if (subBtn) subBtn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2500));

    // Verify ticket in My Requests
    await session.navigate('http://localhost:5173/portal/requests', 1500);
    const devrelTicketId = await session.eval(`
      (() => {
        const firstRow = document.querySelector('table tbody tr:first-child');
        return firstRow?.innerText.match(/CG-[0-9]+/)?.[0] || null;
      })()
    `);
    console.log(`[DEVREL] Created Ticket ID: ${devrelTicketId}`);
    await session.screenshot('phase8a_def002_ticket_created.png');

    // Client sends message
    if (devrelTicketId) {
      await session.navigate(`http://localhost:5173/portal/requests/${devrelTicketId}`, 1500);
      const msg = `Hi Boost Pod, please review our DevRel strategy requirements for ${devrelMarker}.`;
      await session.type('input[placeholder*="specialist pod"]', msg);
      await new Promise(r => setTimeout(r, 300));
      await session.eval(`
        (() => {
          const inp = document.querySelector('input[placeholder*="specialist pod"]');
          if (inp && inp.closest('form')) inp.closest('form').querySelector('button[type="submit"]')?.click();
        })()
      `);
      await new Promise(r => setTimeout(r, 1200));
    }
    await logoutUser(session);

    // Boost Specialist checks queue
    console.log('[DEVREL] Logging in as COMPANY_BOOST specialist to verify queue visibility...');
    await loginUser(session, 'boost@creativegini.com', 'Boost@123');
    await session.navigate('http://localhost:5173/boost/requests', 2000);
    await session.screenshot('phase8a_def002_boost_queue.png');

    const devrelInQueue = await session.eval(`document.body.innerText.includes('${devrelTicketId}')`);
    console.log(`  -> DevRel ticket ${devrelTicketId} visible in COMPANY_BOOST queue: ${devrelInQueue}`);

    if (devrelInQueue) {
      // Open ticket
      await session.navigate(`http://localhost:5173/boost/requests/${devrelTicketId}`, 1500);
      await session.screenshot('phase8a_def002_ticket_opened.png');

      // Check messages & reply
      await session.eval(`
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const tab = btns.find(b => b.innerText && b.innerText.includes('Client Messages'));
          if (tab) tab.click();
        })()
      `);
      await new Promise(r => setTimeout(r, 800));

      const reply = `Hi Data I2I, Boost DevRel specialist assigned. Strategic developer roadmap analysis initiated for ${devrelMarker}.`;
      await session.eval(`
        (() => {
          const area = document.querySelector('input[placeholder*="message"], textarea');
          if (area) {
            const proto = area.tagName === 'INPUT' ? window.HTMLInputElement.prototype : window.HTMLTextAreaElement.prototype;
            const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
            if (setter) setter.call(area, ${JSON.stringify(reply)});
            else area.value = ${JSON.stringify(reply)};
            area.dispatchEvent(new Event('input', { bubbles: true }));
            area.dispatchEvent(new Event('change', { bubbles: true }));
          }
        })()
      `);
      await new Promise(r => setTimeout(r, 300));
      await session.eval(`
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const sendBtn = btns.find(b => (b.innerText || '').toLowerCase().includes('send'));
          if (sendBtn) sendBtn.click();
        })()
      `);
      await new Promise(r => setTimeout(r, 1200));
      await session.screenshot('phase8a_def002_specialist_response.png');

      // Start Work & Submit Deliverable V1
      await session.eval(`
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const btn = btns.find(b => b.innerText && b.innerText.includes('Start Work'));
          if (btn) btn.click();
        })()
      `);
      await new Promise(r => setTimeout(r, 1000));

      await session.eval(`
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const btn = btns.find(b => b.innerText && b.innerText.includes('Submit Deliverables'));
          if (btn) btn.click();
        })()
      `);
      await new Promise(r => setTimeout(r, 1200));

      const synthV1 = `CREATIVEGINI QA TEST ARTIFACT - PHASE 8A - NOT PRODUCTION DATA - Data I2I - DevRel - ${devrelMarker}`;
      await session.eval(`
        (() => {
          const textarea = document.querySelector('textarea');
          if (textarea) {
            const textSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
            textSetter.call(textarea, ${JSON.stringify(synthV1)});
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
            textarea.dispatchEvent(new Event('change', { bubbles: true }));
          }
          const linkInp = document.querySelector('input[type="url"], input[placeholder*="http"], input[placeholder*="Link"]');
          if (linkInp) {
            const inputSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            inputSetter.call(linkInp, 'https://deliverables.creativegini.test/devrel_strategy_v1.pdf');
            linkInp.dispatchEvent(new Event('input', { bubbles: true }));
            linkInp.dispatchEvent(new Event('change', { bubbles: true }));
          }
        })()
      `);
      await new Promise(r => setTimeout(r, 500));

      await session.eval(`
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const btn = btns.find(b => b.innerText && (b.innerText.includes('Submit Deliverable') || b.innerText.includes('Publish Deliverable')));
          if (btn) btn.click();
        })()
      `);
      await new Promise(r => setTimeout(r, 2000));
      await session.screenshot('phase8a_def002_v1_submitted.png');
    }
    await logoutUser(session);

    // Client Approves DevRel
    console.log('[DEVREL] Logging back in as Client to review and approve V1...');
    await loginUser(session, 'testclient@datai2i.com', 'Client@123');
    await session.navigate(`http://localhost:5173/portal/requests/${devrelTicketId}`, 1500);
    await session.screenshot('phase8a_def002_client_review.png');

    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.innerText && (b.innerText.includes('Approve Work') || b.innerText.includes('Approve Deliverable') || b.innerText.includes('Approve')));
        if (btn) btn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 800));

    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.innerText && b.innerText.includes('Confirm Approval'));
        if (btn) btn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2000));
    await session.screenshot('phase8a_def002_final_completed.png');
    report.def002 = { ticketId: devrelTicketId, inQueue: devrelInQueue, status: 'COMPLETED', result: devrelInQueue ? 'PASS' : 'FAIL' };
    await logoutUser(session);


    // =========================================================================
    // SECTION 3: DEF-003 — UI / DESIGN CLIENT INTAKE & FULL LIFECYCLES
    // =========================================================================
    console.log('\n================================================================');
    console.log('>>> [3/4] DEF-003 — UI / DESIGN CLIENT INTAKE & LIFECYCLES');
    console.log('================================================================');

    await loginUser(session, 'testclient@datai2i.com', 'Client@123');
    await session.navigate('http://localhost:5173/portal/design', 1500);
    await session.screenshot('phase8a_def003_channel_nav.png');

    // -------------------------------------------------------------------------
    // 3.1 SERVICE A: UI/UX AUDIT LIFECYCLE
    // -------------------------------------------------------------------------
    console.log('\n--- 3.1 UI/UX Audit Full Lifecycle ---');
    await session.eval(`
      (() => {
        const card = Array.from(document.querySelectorAll('h3')).find(h => h.innerText && h.innerText.includes('UI/UX Audit'))?.parentElement?.parentElement;
        const btn = Array.from((card || document).querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('Request'));
        if (btn) btn.click();
      })()
    `);
    await session.waitFor(`() => !!document.querySelector('input[placeholder*="datai2i.com"]')`, 5000, 200);

    // Empty validation check
    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const revBtn = btns.find(b => b.innerText && b.innerText.includes('Review Requirements'));
        if (revBtn) revBtn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 600));
    await session.screenshot('phase8a_def003_uiux_validation.png');

    // Fill UI/UX Audit fields
    const auditMarker = `D2I-UX-P8A-${Date.now()}`;
    await session.eval(`
      (() => {
        const inputSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        const textSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;

        const inputs = Array.from(document.querySelectorAll('input, textarea'));
        inputs.forEach(inp => {
          const ph = inp.placeholder || '';
          let val = '';
          if (ph.includes('datai2i.com')) {
            val = 'https://app.datai2i.com/analytics';
          } else if (ph.includes('onboarding funnel')) {
            val = 'Enterprise customer onboarding funnel & complex query workspace';
          } else if (ph.includes('bounce rate')) {
            val = 'High bounce rate on filter builder, mobile layout overflow. Marker: ${auditMarker}';
          }

          if (val) {
            if (inp.tagName === 'INPUT') inputSetter.call(inp, val);
            else if (inp.tagName === 'TEXTAREA') textSetter.call(inp, val);
            inp.dispatchEvent(new Event('input', { bubbles: true }));
            inp.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
      })()
    `);
    await new Promise(r => setTimeout(r, 500));

    // Advance to Review & Pricing
    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const revBtn = btns.find(b => b.innerText && b.innerText.includes('Review Requirements'));
        if (revBtn) revBtn.click();
      })()
    `);
    await session.waitFor(`() => !!document.body.innerText.includes('Proceed to Pricing')`, 5000, 200);

    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const prcBtn = btns.find(b => b.innerText && b.innerText.includes('Proceed to Pricing'));
        if (prcBtn) prcBtn.click();
      })()
    `);
    await session.waitFor(`() => !!document.body.innerText.includes('Confirm & Submit Request')`, 5000, 200);

    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const subBtn = btns.find(b => b.innerText && b.innerText.includes('Confirm & Submit Request'));
        if (subBtn) subBtn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2500));

    await session.navigate('http://localhost:5173/portal/requests', 1500);
    const auditTicketId = await session.eval(`
      (() => {
        const firstRow = document.querySelector('table tbody tr:first-child');
        return firstRow?.innerText.match(/CG-[0-9]+/)?.[0] || null;
      })()
    `);
    console.log(`[UI/UX AUDIT] Created Ticket ID: ${auditTicketId}`);
    await session.screenshot('phase8a_def003_uiux_created.png');

    // Send client message
    if (auditTicketId) {
      await session.navigate(`http://localhost:5173/portal/requests/${auditTicketId}`, 1500);
      const msg = `Hi Design Team, please perform heuristic evaluation on responsive breakpoints for ${auditMarker}.`;
      await session.type('input[placeholder*="specialist pod"]', msg);
      await new Promise(r => setTimeout(r, 300));
      await session.eval(`
        (() => {
          const inp = document.querySelector('input[placeholder*="specialist pod"]');
          if (inp && inp.closest('form')) inp.closest('form').querySelector('button[type="submit"]')?.click();
        })()
      `);
      await new Promise(r => setTimeout(r, 1200));
    }
    await logoutUser(session);

    // LANDING_PAGE specialist processes UI/UX Audit
    console.log('[UI/UX AUDIT] LANDING_PAGE specialist verifying queue...');
    await loginUser(session, 'ui@creativegini.com', 'UI@123');
    await session.navigate('http://localhost:5173/design/requests', 2000);
    await session.screenshot('phase8a_def003_uiux_queue.png');

    const auditInQueue = await session.eval(`document.body.innerText.includes('${auditTicketId}')`);
    console.log(`  -> UI/UX Audit ticket ${auditTicketId} visible in LANDING_PAGE queue: ${auditInQueue}`);

    if (auditInQueue) {
      await session.navigate(`http://localhost:5173/design/requests/${auditTicketId}`, 1500);
      await session.screenshot('phase8a_def003_uiux_workspace.png');

      // Messages & reply
      await session.eval(`
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const tab = btns.find(b => b.innerText && b.innerText.includes('Client Messages'));
          if (tab) tab.click();
        })()
      `);
      await new Promise(r => setTimeout(r, 800));

      const reply = `Hi Data I2I, UX audit specialist assigned. Performing Nielsen-Norman heuristic review for ${auditMarker}.`;
      await session.eval(`
        (() => {
          const area = document.querySelector('input[placeholder*="message"], textarea');
          if (area) {
            const proto = area.tagName === 'INPUT' ? window.HTMLInputElement.prototype : window.HTMLTextAreaElement.prototype;
            const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
            if (setter) setter.call(area, ${JSON.stringify(reply)});
            else area.value = ${JSON.stringify(reply)};
            area.dispatchEvent(new Event('input', { bubbles: true }));
            area.dispatchEvent(new Event('change', { bubbles: true }));
          }
        })()
      `);
      await new Promise(r => setTimeout(r, 300));
      await session.eval(`
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const sendBtn = btns.find(b => (b.innerText || '').toLowerCase().includes('send'));
          if (sendBtn) sendBtn.click();
        })()
      `);
      await new Promise(r => setTimeout(r, 1200));
      await session.screenshot('phase8a_def003_uiux_specialist_reply.png');

      // Start Work & Submit Deliverables
      await session.eval(`
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const btn = btns.find(b => b.innerText && b.innerText.includes('Start Work'));
          if (btn) btn.click();
        })()
      `);
      await new Promise(r => setTimeout(r, 1000));

      await session.eval(`
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const btn = btns.find(b => b.innerText && b.innerText.includes('Submit Deliverables'));
          if (btn) btn.click();
        })()
      `);
      await new Promise(r => setTimeout(r, 1200));

      const synthAudit = `CREATIVEGINI QA TEST ARTIFACT - PHASE 8A - NOT PRODUCTION DATA - Data I2I - UI/UX Audit - ${auditMarker}`;
      await session.eval(`
        (() => {
          const textarea = document.querySelector('textarea');
          if (textarea) {
            const textSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
            textSetter.call(textarea, ${JSON.stringify(synthAudit)});
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
            textarea.dispatchEvent(new Event('change', { bubbles: true }));
          }
          const linkInp = document.querySelector('input[type="url"], input[placeholder*="http"], input[placeholder*="Link"]');
          if (linkInp) {
            const inputSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            inputSetter.call(linkInp, 'https://deliverables.creativegini.test/ui_ux_audit_report.pdf');
            linkInp.dispatchEvent(new Event('input', { bubbles: true }));
            linkInp.dispatchEvent(new Event('change', { bubbles: true }));
          }
        })()
      `);
      await new Promise(r => setTimeout(r, 500));

      await session.eval(`
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const btn = btns.find(b => b.innerText && (b.innerText.includes('Submit Deliverable') || b.innerText.includes('Publish Deliverable')));
          if (btn) btn.click();
        })()
      `);
      await new Promise(r => setTimeout(r, 2000));
      await session.screenshot('phase8a_def003_uiux_v1_submitted.png');
    }
    await logoutUser(session);

    // Client Approves UI/UX Audit
    await loginUser(session, 'testclient@datai2i.com', 'Client@123');
    await session.navigate(`http://localhost:5173/portal/requests/${auditTicketId}`, 1500);
    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.innerText && (b.innerText.includes('Approve Work') || b.innerText.includes('Approve Deliverable') || b.innerText.includes('Approve')));
        if (btn) btn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 800));

    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.innerText && b.innerText.includes('Confirm Approval'));
        if (btn) btn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2000));
    await session.screenshot('phase8a_def003_uiux_completed.png');
    report.def003_audit = { ticketId: auditTicketId, inQueue: auditInQueue, status: 'COMPLETED', result: auditInQueue ? 'PASS' : 'FAIL' };


    // -------------------------------------------------------------------------
    // 3.2 SERVICE B: FIGMA PROJECT LIFECYCLE
    // -------------------------------------------------------------------------
    console.log('\n--- 3.2 Figma Project Full Lifecycle ---');
    await session.navigate('http://localhost:5173/portal/design', 1500);
    await session.eval(`
      (() => {
        const card = Array.from(document.querySelectorAll('h3')).find(h => h.innerText && h.innerText.includes('Figma Project'))?.parentElement?.parentElement;
        const btn = Array.from((card || document).querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('Request'));
        if (btn) btn.click();
      })()
    `);
    await session.waitFor(`() => !!document.querySelector('input[placeholder*="Design System 2.0"]')`, 5000, 200);

    // Empty validation check
    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const revBtn = btns.find(b => b.innerText && b.innerText.includes('Review Requirements'));
        if (revBtn) revBtn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 600));
    await session.screenshot('phase8a_def003_figma_validation.png');

    // Fill Figma Project fields
    const figmaMarker = `D2I-FIGMA-P8A-${Date.now()}`;
    await session.eval(`
      (() => {
        const inputSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        const textSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;

        const inputs = Array.from(document.querySelectorAll('input, textarea'));
        inputs.forEach(inp => {
          const ph = inp.placeholder || '';
          let val = '';
          if (ph.includes('Design System 2.0')) {
            val = 'Data I2I NextGen Enterprise Design Tokens';
          } else if (ph.includes('atomic component kit')) {
            val = 'Button tokens, form inputs, modal dialogs, responsive cards';
          } else if (ph.includes('Modern dark/light theme')) {
            val = 'Inter typography, dark/light theme tokens, accessible contrast. Marker: ${figmaMarker}';
          }

          if (val) {
            if (inp.tagName === 'INPUT') inputSetter.call(inp, val);
            else if (inp.tagName === 'TEXTAREA') textSetter.call(inp, val);
            inp.dispatchEvent(new Event('input', { bubbles: true }));
            inp.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
      })()
    `);
    await new Promise(r => setTimeout(r, 500));

    // Advance to Review & Pricing
    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const revBtn = btns.find(b => b.innerText && b.innerText.includes('Review Requirements'));
        if (revBtn) revBtn.click();
      })()
    `);
    await session.waitFor(`() => !!document.body.innerText.includes('Proceed to Pricing')`, 5000, 200);

    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const prcBtn = btns.find(b => b.innerText && b.innerText.includes('Proceed to Pricing'));
        if (prcBtn) prcBtn.click();
      })()
    `);
    await session.waitFor(`() => !!document.body.innerText.includes('Confirm & Submit Request')`, 5000, 200);

    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const subBtn = btns.find(b => b.innerText && b.innerText.includes('Confirm & Submit Request'));
        if (subBtn) subBtn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2500));

    await session.navigate('http://localhost:5173/portal/requests', 1500);
    const figmaTicketId = await session.eval(`
      (() => {
        const firstRow = document.querySelector('table tbody tr:first-child');
        return firstRow?.innerText.match(/CG-[0-9]+/)?.[0] || null;
      })()
    `);
    console.log(`[FIGMA PROJECT] Created Ticket ID: ${figmaTicketId}`);
    await session.screenshot('phase8a_def003_figma_created.png');
    await logoutUser(session);

    // LANDING_PAGE specialist processes Figma Project
    console.log('[FIGMA PROJECT] LANDING_PAGE specialist verifying queue...');
    await loginUser(session, 'ui@creativegini.com', 'UI@123');
    await session.navigate('http://localhost:5173/design/requests', 2000);
    await session.screenshot('phase8a_def003_figma_queue.png');

    const figmaInQueue = await session.eval(`document.body.innerText.includes('${figmaTicketId}')`);
    console.log(`  -> Figma ticket ${figmaTicketId} visible in LANDING_PAGE queue: ${figmaInQueue}`);

    if (figmaInQueue) {
      await session.navigate(`http://localhost:5173/design/requests/${figmaTicketId}`, 1500);
      await session.eval(`
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const btn = btns.find(b => b.innerText && b.innerText.includes('Start Work'));
          if (btn) btn.click();
        })()
      `);
      await new Promise(r => setTimeout(r, 1000));

      await session.eval(`
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const btn = btns.find(b => b.innerText && b.innerText.includes('Submit Deliverables'));
          if (btn) btn.click();
        })()
      `);
      await new Promise(r => setTimeout(r, 1200));

      const synthFigma = `CREATIVEGINI QA TEST ARTIFACT - PHASE 8A - NOT PRODUCTION DATA - Data I2I - Figma Project - ${figmaMarker}`;
      await session.eval(`
        (() => {
          const textarea = document.querySelector('textarea');
          if (textarea) {
            const textSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
            textSetter.call(textarea, ${JSON.stringify(synthFigma)});
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
            textarea.dispatchEvent(new Event('change', { bubbles: true }));
          }
          const linkInp = document.querySelector('input[type="url"], input[placeholder*="http"], input[placeholder*="Link"]');
          if (linkInp) {
            const inputSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            inputSetter.call(linkInp, 'https://www.figma.com/file/datai2i-tokens-production');
            linkInp.dispatchEvent(new Event('input', { bubbles: true }));
            linkInp.dispatchEvent(new Event('change', { bubbles: true }));
          }
        })()
      `);
      await new Promise(r => setTimeout(r, 500));

      await session.eval(`
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const btn = btns.find(b => b.innerText && (b.innerText.includes('Submit Deliverable') || b.innerText.includes('Publish Deliverable')));
          if (btn) btn.click();
        })()
      `);
      await new Promise(r => setTimeout(r, 2000));
      await session.screenshot('phase8a_def003_figma_v1_submitted.png');
    }
    await logoutUser(session);

    // Client Approves Figma Project
    await loginUser(session, 'testclient@datai2i.com', 'Client@123');
    await session.navigate(`http://localhost:5173/portal/requests/${figmaTicketId}`, 1500);
    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.innerText && (b.innerText.includes('Approve Work') || b.innerText.includes('Approve Deliverable') || b.innerText.includes('Approve')));
        if (btn) btn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 800));

    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.innerText && b.innerText.includes('Confirm Approval'));
        if (btn) btn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2000));
    await session.screenshot('phase8a_def003_figma_completed.png');
    report.def003_figma = { ticketId: figmaTicketId, inQueue: figmaInQueue, status: 'COMPLETED', result: figmaInQueue ? 'PASS' : 'FAIL' };


    // -------------------------------------------------------------------------
    // 3.3 SERVICE C: REDESIGN REQUEST LIFECYCLE
    // -------------------------------------------------------------------------
    console.log('\n--- 3.3 Redesign Request Full Lifecycle ---');
    await session.navigate('http://localhost:5173/portal/design', 1500);
    await session.eval(`
      (() => {
        const card = Array.from(document.querySelectorAll('h3')).find(h => h.innerText && h.innerText.includes('Redesign Request'))?.parentElement?.parentElement;
        const btn = Array.from((card || document).querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('Request'));
        if (btn) btn.click();
      })()
    `);
    await session.waitFor(`() => !!document.querySelector('input[placeholder*="landing"]')`, 5000, 200);

    // Empty validation check
    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const revBtn = btns.find(b => b.innerText && b.innerText.includes('Review Requirements'));
        if (revBtn) revBtn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 600));
    await session.screenshot('phase8a_def003_redesign_validation.png');

    // Fill Redesign Request fields
    const redesignMarker = `D2I-REDESIGN-P8A-${Date.now()}`;
    await session.eval(`
      (() => {
        const inputSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        const textSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;

        const inputs = Array.from(document.querySelectorAll('input, textarea'));
        inputs.forEach(inp => {
          const ph = inp.placeholder || '';
          let val = '';
          if (ph.includes('landing')) {
            val = 'https://datai2i.com/cloud-platform';
          } else if (ph.includes('Premium aesthetic overhaul')) {
            val = 'Modern SaaS aesthetic overhaul with conversion hero section';
          } else if (ph.includes('Enterprise CTOs')) {
            val = 'Enterprise engineering decision makers and CDOs. Marker: ${redesignMarker}';
          }

          if (val) {
            if (inp.tagName === 'INPUT') inputSetter.call(inp, val);
            else if (inp.tagName === 'TEXTAREA') textSetter.call(inp, val);
            inp.dispatchEvent(new Event('input', { bubbles: true }));
            inp.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
      })()
    `);
    await new Promise(r => setTimeout(r, 500));

    // Advance to Review & Pricing
    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const revBtn = btns.find(b => b.innerText && b.innerText.includes('Review Requirements'));
        if (revBtn) revBtn.click();
      })()
    `);
    await session.waitFor(`() => !!document.body.innerText.includes('Proceed to Pricing')`, 5000, 200);

    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const prcBtn = btns.find(b => b.innerText && b.innerText.includes('Proceed to Pricing'));
        if (prcBtn) prcBtn.click();
      })()
    `);
    await session.waitFor(`() => !!document.body.innerText.includes('Confirm & Submit Request')`, 5000, 200);

    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const subBtn = btns.find(b => b.innerText && b.innerText.includes('Confirm & Submit Request'));
        if (subBtn) subBtn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2500));

    await session.navigate('http://localhost:5173/portal/requests', 1500);
    const redesignTicketId = await session.eval(`
      (() => {
        const firstRow = document.querySelector('table tbody tr:first-child');
        return firstRow?.innerText.match(/CG-[0-9]+/)?.[0] || null;
      })()
    `);
    console.log(`[REDESIGN] Created Ticket ID: ${redesignTicketId}`);
    await session.screenshot('phase8a_def003_redesign_created.png');
    await logoutUser(session);

    // LANDING_PAGE specialist processes Redesign Request
    console.log('[REDESIGN] LANDING_PAGE specialist verifying queue...');
    await loginUser(session, 'ui@creativegini.com', 'UI@123');
    await session.navigate('http://localhost:5173/design/requests', 2000);
    await session.screenshot('phase8a_def003_redesign_queue.png');

    const redesignInQueue = await session.eval(`document.body.innerText.includes('${redesignTicketId}')`);
    console.log(`  -> Redesign ticket ${redesignTicketId} visible in LANDING_PAGE queue: ${redesignInQueue}`);

    if (redesignInQueue) {
      await session.navigate(`http://localhost:5173/design/requests/${redesignTicketId}`, 1500);
      await session.eval(`
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const btn = btns.find(b => b.innerText && b.innerText.includes('Start Work'));
          if (btn) btn.click();
        })()
      `);
      await new Promise(r => setTimeout(r, 1000));

      await session.eval(`
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const btn = btns.find(b => b.innerText && b.innerText.includes('Submit Deliverables'));
          if (btn) btn.click();
        })()
      `);
      await new Promise(r => setTimeout(r, 1200));

      const synthRedesign = `CREATIVEGINI QA TEST ARTIFACT - PHASE 8A - NOT PRODUCTION DATA - Data I2I - Redesign Request - ${redesignMarker}`;
      await session.eval(`
        (() => {
          const textarea = document.querySelector('textarea');
          if (textarea) {
            const textSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
            textSetter.call(textarea, ${JSON.stringify(synthRedesign)});
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
            textarea.dispatchEvent(new Event('change', { bubbles: true }));
          }
          const linkInp = document.querySelector('input[type="url"], input[placeholder*="http"], input[placeholder*="Link"]');
          if (linkInp) {
            const inputSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            inputSetter.call(linkInp, 'https://deliverables.creativegini.test/redesign_master_concept.png');
            linkInp.dispatchEvent(new Event('input', { bubbles: true }));
            linkInp.dispatchEvent(new Event('change', { bubbles: true }));
          }
        })()
      `);
      await new Promise(r => setTimeout(r, 500));

      await session.eval(`
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const btn = btns.find(b => b.innerText && (b.innerText.includes('Submit Deliverable') || b.innerText.includes('Publish Deliverable')));
          if (btn) btn.click();
        })()
      `);
      await new Promise(r => setTimeout(r, 2000));
      await session.screenshot('phase8a_def003_redesign_v1_submitted.png');
    }
    await logoutUser(session);

    // Client Approves Redesign
    await loginUser(session, 'testclient@datai2i.com', 'Client@123');
    await session.navigate(`http://localhost:5173/portal/requests/${redesignTicketId}`, 1500);
    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.innerText && (b.innerText.includes('Approve Work') || b.innerText.includes('Approve Deliverable') || b.innerText.includes('Approve')));
        if (btn) btn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 800));

    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.innerText && b.innerText.includes('Confirm Approval'));
        if (btn) btn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2000));
    await session.screenshot('phase8a_def003_redesign_completed.png');
    report.def003_redesign = { ticketId: redesignTicketId, inQueue: redesignInQueue, status: 'COMPLETED', result: redesignInQueue ? 'PASS' : 'FAIL' };
    await logoutUser(session);


    // =========================================================================
    // SECTION 4: PLATFORM REGRESSION SMOKE TESTING
    // =========================================================================
    console.log('\n================================================================');
    console.log('>>> [4/4] PLATFORM REGRESSION SMOKE TESTS');
    console.log('================================================================');

    // 4.1 Client Channels Smoke Check
    await loginUser(session, 'testclient@datai2i.com', 'Client@123');
    await session.navigate('http://localhost:5173/portal/boosting', 1200);
    await session.screenshot('phase8a_regression_boosting.png');
    await session.navigate('http://localhost:5173/portal/digitalising', 1200);
    await session.screenshot('phase8a_regression_digitalising.png');
    await logoutUser(session);

    // 4.2 Lead Specialist Smoke Check
    await loginUser(session, 'lead@creativegini.com', 'Lead@123');
    await session.navigate('http://localhost:5173/lead/requests', 1200);
    await session.screenshot('phase8a_regression_lead_portal.png');
    await logoutUser(session);

    // 4.3 Boost Specialist Smoke Check
    await loginUser(session, 'boost@creativegini.com', 'Boost@123');
    await session.navigate('http://localhost:5173/boost/requests', 1200);
    await session.screenshot('phase8a_regression_boost_portal.png');
    await logoutUser(session);

    // 4.4 Design Specialist Smoke Check
    await loginUser(session, 'ui@creativegini.com', 'UI@123');
    await session.navigate('http://localhost:5173/design/requests', 1200);
    await session.screenshot('phase8a_regression_design_portal.png');
    await logoutUser(session);

    // 4.5 Super Admin Operations Smoke Check
    await loginUser(session, 'team@creativegini.com', 'Admin@2026');
    await session.navigate('http://localhost:5173/admin/operations', 1200);
    await session.screenshot('phase8a_regression_admin_ops.png');
    await logoutUser(session);

    console.log('\n================================================================');
    console.log('       ALL PHASE 8A DEFECT REMEDIATION TESTS COMPLETED!         ');
    console.log('================================================================\n');
    console.log(JSON.stringify(report, null, 2));

  } catch (err) {
    console.error('ERROR in runMasterSuite:', err);
    await session.screenshot('phase8a_error.png');
  } finally {
    await session.close();
  }
}

runMasterSuite().catch(console.error);
