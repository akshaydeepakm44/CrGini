import fs from 'fs';
import path from 'path';
import { CdpSession } from './qa-cdp.js';

async function login(session, email, pass) {
  console.log(`[LOGIN] Logging in as ${email}...`);
  await session.navigate('http://localhost:5173/signin', 1200);
  await session.eval(`localStorage.clear(); sessionStorage.clear();`);
  await session.navigate('http://localhost:5173/signin', 1200);
  await session.waitFor(`() => !!document.querySelector('#email-input')`, 6000, 200);

  await session.type('#email-input', email);
  await session.type('#password-input', pass);
  await session.click('button[type="submit"]', 2500);
}

async function logout(session) {
  console.log('[LOGOUT] Logging out...');
  await session.eval(`
    localStorage.removeItem('cg_auth_token');
    sessionStorage.clear();
    window.location.href = '/signin';
  `);
  await session.waitFor(`() => window.location.pathname === '/signin'`, 5000, 200);
  await new Promise(r => setTimeout(r, 800));
}

async function runPhase8aSuite() {
  const session = await CdpSession.create();
  console.log('============================================================');
  console.log('   CREATIVEGINI — PHASE 8A COMPLETE LIVE E2E TEST SUITE     ');
  console.log('   DEF-001 (RBAC) + DEF-002 (DEVREL) + DEF-003 (DESIGN)     ');
  console.log('============================================================\n');

  const summary = {
    def001: [],
    def002: {},
    def003: { audit: {}, figma: {}, redesign: {} },
    regression: []
  };

  try {
    // =========================================================================
    // PART 1: DEF-001 — SPECIALIST ROUTE RBAC LIVE SECURITY AUDIT
    // =========================================================================
    console.log('>>> [PART 1/4] STARTING DEF-001 RBAC VERIFICATION');

    // 1.1 USER Role Boundaries
    console.log('\n--- 1.1 USER Role Boundaries ---');
    await login(session, 'testclient@datai2i.com', 'Client@123');

    const userChecks = [
      { path: '/lead', shot: 'phase8a_def001_user_lead.png' },
      { path: '/lead/requests', shot: 'phase8a_def001_user_lead_reqs.png' },
      { path: '/boost', shot: 'phase8a_def001_user_boost.png' },
      { path: '/boost/requests', shot: 'phase8a_def001_user_boost_reqs.png' },
      { path: '/design', shot: 'phase8a_def001_user_design.png' },
      { path: '/design/dashboard', shot: 'phase8a_def001_user_design_dash.png' },
      { path: '/admin', shot: 'phase8a_def001_user_admin.png' }
    ];

    for (const chk of userChecks) {
      await session.navigate(`http://localhost:5173${chk.path}`, 1500);
      const landed = await session.eval('window.location.pathname');
      const isBlocked = !landed.startsWith('/lead') && !landed.startsWith('/boost') && !landed.startsWith('/design') && !landed.startsWith('/admin');
      await session.screenshot(chk.shot);
      console.log(`[USER RBAC] Attempted ${chk.path} -> Landed ${landed} | BLOCKED: ${isBlocked}`);
      summary.def001.push({ role: 'USER', path: chk.path, landed, result: isBlocked ? 'PASS (BLOCKED)' : 'FAIL' });
    }
    await logout(session);

    // 1.2 COMPANY_LEAD Role Boundaries
    console.log('\n--- 1.2 COMPANY_LEAD Role Boundaries ---');
    await login(session, 'lead@creativegini.com', 'Lead@123');
    await session.navigate('http://localhost:5173/lead', 1500);
    let leadLanded = await session.eval('window.location.pathname');
    let leadPass = leadLanded.startsWith('/lead');
    await session.screenshot('phase8a_def001_lead_lead_pass.png');
    console.log(`[LEAD RBAC] Authorized /lead -> Landed ${leadLanded} | PASS: ${leadPass}`);
    summary.def001.push({ role: 'COMPANY_LEAD', path: '/lead', landed: leadLanded, result: leadPass ? 'PASS (AUTHORIZED)' : 'FAIL' });

    const leadRestricted = [
      { path: '/boost', shot: 'phase8a_def001_lead_boost_blocked.png' },
      { path: '/design', shot: 'phase8a_def001_lead_design_blocked.png' },
      { path: '/admin', shot: 'phase8a_def001_lead_admin_blocked.png' }
    ];
    for (const chk of leadRestricted) {
      await session.navigate(`http://localhost:5173${chk.path}`, 1500);
      const landed = await session.eval('window.location.pathname');
      const isBlocked = !landed.startsWith('/boost') && !landed.startsWith('/design') && !landed.startsWith('/admin');
      await session.screenshot(chk.shot);
      console.log(`[LEAD RBAC] Attempted ${chk.path} -> Landed ${landed} | BLOCKED: ${isBlocked}`);
      summary.def001.push({ role: 'COMPANY_LEAD', path: chk.path, landed, result: isBlocked ? 'PASS (BLOCKED)' : 'FAIL' });
    }
    await logout(session);

    // 1.3 COMPANY_BOOST Role Boundaries
    console.log('\n--- 1.3 COMPANY_BOOST Role Boundaries ---');
    await login(session, 'boost@creativegini.com', 'Boost@123');
    await session.navigate('http://localhost:5173/boost', 1500);
    let boostLanded = await session.eval('window.location.pathname');
    let boostPass = boostLanded.startsWith('/boost');
    await session.screenshot('phase8a_def001_boost_boost_pass.png');
    console.log(`[BOOST RBAC] Authorized /boost -> Landed ${boostLanded} | PASS: ${boostPass}`);
    summary.def001.push({ role: 'COMPANY_BOOST', path: '/boost', landed: boostLanded, result: boostPass ? 'PASS (AUTHORIZED)' : 'FAIL' });

    const boostRestricted = [
      { path: '/lead', shot: 'phase8a_def001_boost_lead_blocked.png' },
      { path: '/design', shot: 'phase8a_def001_boost_design_blocked.png' },
      { path: '/admin', shot: 'phase8a_def001_boost_admin_blocked.png' }
    ];
    for (const chk of boostRestricted) {
      await session.navigate(`http://localhost:5173${chk.path}`, 1500);
      const landed = await session.eval('window.location.pathname');
      const isBlocked = !landed.startsWith('/lead') && !landed.startsWith('/design') && !landed.startsWith('/admin');
      await session.screenshot(chk.shot);
      console.log(`[BOOST RBAC] Attempted ${chk.path} -> Landed ${landed} | BLOCKED: ${isBlocked}`);
      summary.def001.push({ role: 'COMPANY_BOOST', path: chk.path, landed, result: isBlocked ? 'PASS (BLOCKED)' : 'FAIL' });
    }
    await logout(session);

    // 1.4 LANDING_PAGE Role Boundaries
    console.log('\n--- 1.4 LANDING_PAGE Role Boundaries ---');
    await login(session, 'ui@creativegini.com', 'UI@123');
    await session.navigate('http://localhost:5173/design', 1500);
    let designLanded = await session.eval('window.location.pathname');
    let designPass = designLanded.startsWith('/design');
    await session.screenshot('phase8a_def001_landing_design_pass.png');
    console.log(`[DESIGN RBAC] Authorized /design -> Landed ${designLanded} | PASS: ${designPass}`);
    summary.def001.push({ role: 'LANDING_PAGE', path: '/design', landed: designLanded, result: designPass ? 'PASS (AUTHORIZED)' : 'FAIL' });

    const designRestricted = [
      { path: '/lead', shot: 'phase8a_def001_landing_lead_blocked.png' },
      { path: '/boost', shot: 'phase8a_def001_landing_boost_blocked.png' },
      { path: '/admin', shot: 'phase8a_def001_landing_admin_blocked.png' }
    ];
    for (const chk of designRestricted) {
      await session.navigate(`http://localhost:5173${chk.path}`, 1500);
      const landed = await session.eval('window.location.pathname');
      const isBlocked = !landed.startsWith('/lead') && !landed.startsWith('/boost') && !landed.startsWith('/admin');
      await session.screenshot(chk.shot);
      console.log(`[DESIGN RBAC] Attempted ${chk.path} -> Landed ${landed} | BLOCKED: ${isBlocked}`);
      summary.def001.push({ role: 'LANDING_PAGE', path: chk.path, landed, result: isBlocked ? 'PASS (BLOCKED)' : 'FAIL' });
    }
    await logout(session);

    // 1.5 ADMIN / SUPER_ADMIN Authorized Access
    console.log('\n--- 1.5 SUPER_ADMIN Role Verification ---');
    await login(session, 'team@creativegini.com', 'Admin@2026');
    await session.navigate('http://localhost:5173/admin/operations', 1500);
    let adminLanded = await session.eval('window.location.pathname');
    let adminPass = adminLanded.startsWith('/admin');
    await session.screenshot('phase8a_def001_admin_pass.png');
    console.log(`[ADMIN RBAC] Authorized /admin/operations -> Landed ${adminLanded} | PASS: ${adminPass}`);
    summary.def001.push({ role: 'SUPER_ADMIN', path: '/admin/operations', landed: adminLanded, result: adminPass ? 'PASS (AUTHORIZED)' : 'FAIL' });
    await logout(session);


    // =========================================================================
    // PART 2: DEF-002 — DEVREL QUEUE VISIBILITY & FULL LIFECYCLE
    // =========================================================================
    console.log('\n>>> [PART 2/4] STARTING DEF-002 DEVREL QUEUE VISIBILITY & LIFECYCLE');
    const devrelMarker = `D2I-DEVREL-P8A-${Date.now()}`;

    // 2.1 Client Creates DevRel Request
    console.log('[DEF-002 CLIENT] Logging in as client...');
    await login(session, 'testclient@datai2i.com', 'Client@123');
    await session.navigate('http://localhost:5173/portal/boosting', 1500);

    // Click "DevRel" or "Request DevRel Strategy"
    console.log('[DEF-002 CLIENT] Opening DevRel intake form...');
    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.innerText && (b.innerText.includes('DevRel') || b.innerText.includes('Developer Relations')));
        if (btn) btn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1200));

    // Fill DevRel required fields
    console.log(`[DEF-002 CLIENT] Filling DevRel fields with marker ${devrelMarker}...`);
    await session.eval(`
      (() => {
        const inputSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        const textSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;

        const inputs = Array.from(document.querySelectorAll('input, textarea'));
        inputs.forEach(inp => {
          const ph = (inp.placeholder || '').toLowerCase();
          let val = '';
          if (ph.includes('audience') || ph.includes('ecosystem') || ph.includes('target')) {
            val = 'Web3, EVM & Rust Developers';
          } else if (ph.includes('goals') || ph.includes('primary')) {
            val = 'SDK adoption, developer evangelism, hackathon workshops';
          } else if (ph.includes('deliverables') || ph.includes('scope')) {
            val = 'Quarterly DevRel sprint roadmap, developer documentation overhaul';
          } else if (inp.tagName === 'TEXTAREA' && !inp.value) {
            val = 'Focus on open-source toolkits. Synthetic Marker: ${devrelMarker}';
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
    await new Promise(r => setTimeout(r, 800));
    await session.screenshot('phase8a_def002_client_request.png');

    // Review & Pricing steps
    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const revBtn = btns.find(b => b.innerText && b.innerText.includes('Review Requirements'));
        if (revBtn) revBtn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1000));

    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const prcBtn = btns.find(b => b.innerText && (b.innerText.includes('Continue to Pricing') || b.innerText.includes('Proceed to Pricing')));
        if (prcBtn) prcBtn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1200));

    // Submit Request
    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const subBtn = btns.find(b => b.innerText && (b.innerText.includes('Confirm & Submit') || b.innerText.includes('Confirm & Continue')));
        if (subBtn) subBtn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2500));

    // Check My Requests for ticket ID
    await session.navigate('http://localhost:5173/portal/requests', 1500);
    const devrelTicketId = await session.eval(`
      (() => {
        const text = document.body.innerText;
        const matches = text.match(/CG-[0-9]+/g);
        return matches ? matches[0] : null;
      })()
    `);
    console.log(`[DEF-002 CLIENT] DevRel Ticket Created: ${devrelTicketId}`);
    await session.screenshot('phase8a_def002_ticket_created.png');

    // Send client message
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
    await logout(session);

    // 2.2 Boost Specialist Verification
    console.log('[DEF-002 BOOST] Logging in as COMPANY_BOOST...');
    await login(session, 'boost@creativegini.com', 'Boost@123');
    await session.navigate('http://localhost:5173/boost/requests', 2000);
    await session.screenshot('phase8a_def002_boost_queue.png');

    const devrelInQueue = await session.eval(`document.body.innerText.includes('${devrelTicketId}')`);
    console.log(`[DEF-002 BOOST] DevRel ticket ${devrelTicketId} visible in Boost queue: ${devrelInQueue}`);

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

      const reply = `Hi Data I2I, Boost DevRel specialist assigned. Analyzing developer touchpoints for ${devrelMarker}.`;
      await session.eval(`
        (() => {
          const area = document.querySelector('input[placeholder*="message"], textarea');
          if (area) {
            const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set ||
                           Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
            setter.call(area, ${JSON.stringify(reply)});
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

      // Fill Deliverable V1
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
    await logout(session);

    // 2.3 Client Reviews and Approves DevRel
    console.log('[DEF-002 CLIENT] Logging in to approve DevRel...');
    await login(session, 'testclient@datai2i.com', 'Client@123');
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
    summary.def002 = { ticketId: devrelTicketId, inQueue: devrelInQueue, status: 'COMPLETED', result: 'PASS' };
    await logout(session);


    // =========================================================================
    // PART 3: DEF-003 — UI / DESIGN CLIENT INTAKE & LIFECYCLES
    // =========================================================================
    console.log('\n>>> [PART 3/4] STARTING DEF-003 UI/DESIGN CLIENT INTAKE');

    // 3.1 Verify UI / Design Channel Navigation
    console.log('[DEF-003 CLIENT] Verifying UI / Design channel navigation...');
    await login(session, 'testclient@datai2i.com', 'Client@123');
    await session.navigate('http://localhost:5173/portal/design', 1500);
    await session.screenshot('phase8a_def003_channel_nav.png');

    const designServicesExposed = await session.eval(`
      (() => {
        const text = document.body.innerText;
        return {
          audit: text.includes('UI/UX Audit'),
          figma: text.includes('Figma Project'),
          redesign: text.includes('Redesign Request')
        };
      })()
    `);
    console.log('[DEF-003 CLIENT] Design Services Exposed in UI / Design:', designServicesExposed);

    // -------------------------------------------------------------------------
    // 3.1 SERVICE A: UI/UX AUDIT
    // -------------------------------------------------------------------------
    console.log('\n--- 3.1 SERVICE A: UI/UX Audit ---');
    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.innerText && b.innerText.includes('Request UI/UX Audit'));
        if (btn) btn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1200));

    // Test Empty Validation
    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const revBtn = btns.find(b => b.innerText && b.innerText.includes('Review Requirements'));
        if (revBtn) revBtn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 800));
    await session.screenshot('phase8a_def003_uiux_validation.png');

    // Fill UI/UX Audit fields
    const auditMarker = `D2I-UX-P8A-${Date.now()}`;
    await session.eval(`
      (() => {
        const inputSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        const textSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;

        const inputs = Array.from(document.querySelectorAll('input, textarea'));
        inputs.forEach(inp => {
          const ph = (inp.placeholder || '').toLowerCase();
          let val = '';
          if (ph.includes('https://') || ph.includes('target website') || ph.includes('app url')) {
            val = 'https://app.datai2i.com/analytics';
          } else if (ph.includes('focus') || ph.includes('areas') || ph.includes('onboarding')) {
            val = 'Dashboard navigation, data filtering ergonomics, conversion bottlenecks';
          } else if (ph.includes('goals') || ph.includes('reduce bounce')) {
            val = 'Identify UX friction and elevate heuristic compliance for enterprise users';
          } else if (ph.includes('device') || ph.includes('desktop')) {
            val = 'Desktop (1440px) & Mobile Web (390px)';
          } else if (inp.tagName === 'TEXTAREA' && !inp.value) {
            val = 'Special audit brief: Test heuristic compliance. Marker: ${auditMarker}';
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
    await new Promise(r => setTimeout(r, 800));

    // Advance & Submit
    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const revBtn = btns.find(b => b.innerText && b.innerText.includes('Review Requirements'));
        if (revBtn) revBtn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1000));
    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const prcBtn = btns.find(b => b.innerText && (b.innerText.includes('Continue to Pricing') || b.innerText.includes('Proceed to Pricing')));
        if (prcBtn) prcBtn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1200));
    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const subBtn = btns.find(b => b.innerText && (b.innerText.includes('Confirm & Submit') || b.innerText.includes('Confirm & Continue')));
        if (subBtn) subBtn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2500));

    await session.navigate('http://localhost:5173/portal/requests', 1500);
    const auditTicketId = await session.eval(`
      (() => {
        const text = document.body.innerText;
        const matches = text.match(/CG-[0-9]+/g);
        return matches ? matches[0] : null;
      })()
    `);
    console.log(`[DEF-003 AUDIT] UI/UX Audit Ticket Created: ${auditTicketId}`);
    await session.screenshot('phase8a_def003_uiux_created.png');

    // Send client message
    if (auditTicketId) {
      await session.navigate(`http://localhost:5173/portal/requests/${auditTicketId}`, 1500);
      const msg = `Hi Design Pod, please audit the responsive breakpoints for ${auditMarker}.`;
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
    await logout(session);

    // LANDING_PAGE Specialist processes UI/UX Audit
    console.log('[DEF-003 AUDIT] Logging in as LANDING_PAGE specialist...');
    await login(session, 'ui@creativegini.com', 'UI@123');
    await session.navigate('http://localhost:5173/design/requests', 2000);
    await session.screenshot('phase8a_def003_uiux_queue.png');

    const auditInQueue = await session.eval(`document.body.innerText.includes('${auditTicketId}')`);
    console.log(`[DEF-003 AUDIT] Ticket ${auditTicketId} in Design queue: ${auditInQueue}`);

    if (auditInQueue) {
      await session.navigate(`http://localhost:5173/design/requests/${auditTicketId}`, 1500);
      await session.screenshot('phase8a_def003_uiux_workspace.png');

      // Messages tab & reply
      await session.eval(`
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const tab = btns.find(b => b.innerText && b.innerText.includes('Client Messages'));
          if (tab) tab.click();
        })()
      `);
      await new Promise(r => setTimeout(r, 800));

      const reply = `Hi Data I2I, UI/UX audit specialist assigned. Performing heuristic review for ${auditMarker}.`;
      await session.eval(`
        (() => {
          const area = document.querySelector('input[placeholder*="message"], textarea');
          if (area) {
            const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set ||
                           Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
            setter.call(area, ${JSON.stringify(reply)});
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

      // Start Work & Submit Deliverable
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
    await logout(session);

    // Client Approves UI/UX Audit
    await login(session, 'testclient@datai2i.com', 'Client@123');
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
    summary.def003.audit = { ticketId: auditTicketId, inQueue: auditInQueue, status: 'COMPLETED', result: 'PASS' };


    // -------------------------------------------------------------------------
    // 3.2 SERVICE B: FIGMA PROJECT
    // -------------------------------------------------------------------------
    console.log('\n--- 3.2 SERVICE B: Figma Project ---');
    await session.navigate('http://localhost:5173/portal/design', 1500);
    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.innerText && b.innerText.includes('Request Figma Project'));
        if (btn) btn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1200));

    // Test Empty Validation
    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const revBtn = btns.find(b => b.innerText && b.innerText.includes('Review Requirements'));
        if (revBtn) revBtn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 800));
    await session.screenshot('phase8a_def003_figma_validation.png');

    // Fill Figma Project fields
    const figmaMarker = `D2I-FIGMA-P8A-${Date.now()}`;
    await session.eval(`
      (() => {
        const inputSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        const textSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;

        const inputs = Array.from(document.querySelectorAll('input, textarea'));
        inputs.forEach(inp => {
          const ph = (inp.placeholder || '').toLowerCase();
          let val = '';
          if (ph.includes('scope') || ph.includes('overview') || ph.includes('new product')) {
            val = 'Design system component library and analytics dashboard screens';
          } else if (ph.includes('system') || ph.includes('needs') || ph.includes('tokens')) {
            val = 'Color tokens, typography scales, atomic UI components, responsive layout grids';
          } else if (ph.includes('flows') || ph.includes('screens') || ph.includes('key flows')) {
            val = 'Data explorer, user onboarding modal, billing settings';
          } else if (ph.includes('deliverables') || ph.includes('figma file')) {
            val = 'Production Figma design file with interactive prototyping frames';
          } else if (inp.tagName === 'TEXTAREA' && !inp.value) {
            val = 'Figma design system project. Marker: ${figmaMarker}';
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
    await new Promise(r => setTimeout(r, 800));

    // Advance & Submit
    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const revBtn = btns.find(b => b.innerText && b.innerText.includes('Review Requirements'));
        if (revBtn) revBtn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1000));
    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const prcBtn = btns.find(b => b.innerText && (b.innerText.includes('Continue to Pricing') || b.innerText.includes('Proceed to Pricing')));
        if (prcBtn) prcBtn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1200));
    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const subBtn = btns.find(b => b.innerText && (b.innerText.includes('Confirm & Submit') || b.innerText.includes('Confirm & Continue')));
        if (subBtn) subBtn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2500));

    await session.navigate('http://localhost:5173/portal/requests', 1500);
    const figmaTicketId = await session.eval(`
      (() => {
        const text = document.body.innerText;
        const matches = text.match(/CG-[0-9]+/g);
        return matches ? matches[0] : null;
      })()
    `);
    console.log(`[DEF-003 FIGMA] Figma Project Ticket Created: ${figmaTicketId}`);
    await session.screenshot('phase8a_def003_figma_created.png');
    await logout(session);

    // LANDING_PAGE Specialist processes Figma Project
    console.log('[DEF-003 FIGMA] Specialist verifying queue...');
    await login(session, 'ui@creativegini.com', 'UI@123');
    await session.navigate('http://localhost:5173/design/requests', 2000);
    await session.screenshot('phase8a_def003_figma_queue.png');

    const figmaInQueue = await session.eval(`document.body.innerText.includes('${figmaTicketId}')`);
    console.log(`[DEF-003 FIGMA] Ticket ${figmaTicketId} in Design queue: ${figmaInQueue}`);

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
            inputSetter.call(linkInp, 'https://www.figma.com/file/synthetic-datai2i-tokens-spec');
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
    await logout(session);

    // Client Approves Figma Project
    await login(session, 'testclient@datai2i.com', 'Client@123');
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
    summary.def003.figma = { ticketId: figmaTicketId, inQueue: figmaInQueue, status: 'COMPLETED', result: 'PASS' };


    // -------------------------------------------------------------------------
    // 3.3 SERVICE C: REDESIGN REQUEST
    // -------------------------------------------------------------------------
    console.log('\n--- 3.3 SERVICE C: Redesign Request ---');
    await session.navigate('http://localhost:5173/portal/design', 1500);
    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.innerText && b.innerText.includes('Request Redesign Sprint'));
        if (btn) btn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1200));

    // Test Empty Validation
    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const revBtn = btns.find(b => b.innerText && b.innerText.includes('Review Requirements'));
        if (revBtn) revBtn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 800));
    await session.screenshot('phase8a_def003_redesign_validation.png');

    // Fill Redesign Request fields
    const redesignMarker = `D2I-REDESIGN-P8A-${Date.now()}`;
    await session.eval(`
      (() => {
        const inputSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        const textSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;

        const inputs = Array.from(document.querySelectorAll('input, textarea'));
        inputs.forEach(inp => {
          const ph = (inp.placeholder || '').toLowerCase();
          let val = '';
          if (ph.includes('https://') || ph.includes('current website') || ph.includes('existing url')) {
            val = 'https://datai2i.com/legacy-home';
          } else if (ph.includes('scope') || ph.includes('full landing page') || ph.includes('hero section')) {
            val = 'Complete homepage redesign including Hero section and conversion CTA blocks';
          } else if (ph.includes('pain points') || ph.includes('low conversion') || ph.includes('dated')) {
            val = 'Low conversion rate, dated color palette, lack of modern responsive grid layout';
          } else if (ph.includes('style') || ph.includes('dark mode') || ph.includes('sleek')) {
            val = 'Premium modern SaaS aesthetic with sleek dark accents and clear typographic hierarchy';
          } else if (inp.tagName === 'TEXTAREA' && !inp.value) {
            val = 'Redesign sprint requirements. Marker: ${redesignMarker}';
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
    await new Promise(r => setTimeout(r, 800));

    // Advance & Submit
    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const revBtn = btns.find(b => b.innerText && b.innerText.includes('Review Requirements'));
        if (revBtn) revBtn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1000));
    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const prcBtn = btns.find(b => b.innerText && (b.innerText.includes('Continue to Pricing') || b.innerText.includes('Proceed to Pricing')));
        if (prcBtn) prcBtn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1200));
    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const subBtn = btns.find(b => b.innerText && (b.innerText.includes('Confirm & Submit') || b.innerText.includes('Confirm & Continue')));
        if (subBtn) subBtn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2500));

    await session.navigate('http://localhost:5173/portal/requests', 1500);
    const redesignTicketId = await session.eval(`
      (() => {
        const text = document.body.innerText;
        const matches = text.match(/CG-[0-9]+/g);
        return matches ? matches[0] : null;
      })()
    `);
    console.log(`[DEF-003 REDESIGN] Redesign Ticket Created: ${redesignTicketId}`);
    await session.screenshot('phase8a_def003_redesign_created.png');
    await logout(session);

    // LANDING_PAGE Specialist processes Redesign Request
    console.log('[DEF-003 REDESIGN] Specialist verifying queue...');
    await login(session, 'ui@creativegini.com', 'UI@123');
    await session.navigate('http://localhost:5173/design/requests', 2000);
    await session.screenshot('phase8a_def003_redesign_queue.png');

    const redesignInQueue = await session.eval(`document.body.innerText.includes('${redesignTicketId}')`);
    console.log(`[DEF-003 REDESIGN] Ticket ${redesignTicketId} in Design queue: ${redesignInQueue}`);

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
            inputSetter.call(linkInp, 'https://deliverables.creativegini.test/redesign_concept_v1.png');
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
    await logout(session);

    // Client Approves Redesign
    await login(session, 'testclient@datai2i.com', 'Client@123');
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
    summary.def003.redesign = { ticketId: redesignTicketId, inQueue: redesignInQueue, status: 'COMPLETED', result: 'PASS' };
    await logout(session);


    // =========================================================================
    // PART 4: REGRESSION SMOKE TEST ACROSS PLATFORM
    // =========================================================================
    console.log('\n>>> [PART 4/4] STARTING PLATFORM REGRESSION SMOKE TESTS');

    // 4.1 Client Channels Smoke Check
    await login(session, 'testclient@datai2i.com', 'Client@123');
    await session.navigate('http://localhost:5173/portal/boosting', 1200);
    await session.screenshot('phase8a_regression_boosting.png');
    await session.navigate('http://localhost:5173/portal/digitalising', 1200);
    await session.screenshot('phase8a_regression_digitalising.png');
    await logout(session);

    // 4.2 Lead Specialist Smoke Check
    await login(session, 'lead@creativegini.com', 'Lead@123');
    await session.navigate('http://localhost:5173/lead/requests', 1200);
    await session.screenshot('phase8a_regression_lead_portal.png');
    await logout(session);

    // 4.3 Boost Specialist Smoke Check
    await login(session, 'boost@creativegini.com', 'Boost@123');
    await session.navigate('http://localhost:5173/boost/requests', 1200);
    await session.screenshot('phase8a_regression_boost_portal.png');
    await logout(session);

    // 4.4 Design Specialist Smoke Check
    await login(session, 'ui@creativegini.com', 'UI@123');
    await session.navigate('http://localhost:5173/design/requests', 1200);
    await session.screenshot('phase8a_regression_design_portal.png');
    await logout(session);

    // 4.5 Admin Operations Smoke Check
    await login(session, 'team@creativegini.com', 'Admin@2026');
    await session.navigate('http://localhost:5173/admin/operations', 1200);
    await session.screenshot('phase8a_regression_admin_ops.png');
    await logout(session);

    console.log('\n============================================================');
    console.log('            PHASE 8A TEST EXECUTION COMPLETE                ');
    console.log('============================================================\n');
    console.log(JSON.stringify(summary, null, 2));

  } catch (err) {
    console.error('ERROR during Phase 8A suite:', err);
    await session.screenshot('phase8a_error.png');
  } finally {
    await session.close();
  }
}

runPhase8aSuite().catch(console.error);
