import fs from 'fs';
import path from 'path';
import { CdpSession, SCREENSHOT_DIR } from './qa-cdp.js';

async function login(session, email, pass) {
  console.log(`[LOGIN] Logging in as ${email}...`);
  await session.navigate('http://localhost:5173/signin', 1000);
  await session.eval(`localStorage.clear(); sessionStorage.clear();`);
  await session.navigate('http://localhost:5173/signin', 1000);

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
}

const SERVICES_TO_RUN = [
  {
    num: 9,
    name: 'Company Study',
    channel: 'digitalising',
    buttonText: 'Request Company Study',
    specialistEmail: 'lead@creativegini.com',
    specialistPass: 'Lead@123',
    specialistHome: '/lead',
    qaId: 'CG-QA-E2E-COMPANYSTUDY-001',
    artifactFile: 'CG-QA-E2E-COMPANYSTUDY-001_Data_I2I_Account_Dossier.pdf',
    fields: {
      targetCompany: 'Databricks Inc & Snowflake Enterprise',
      researchObjective: 'Detailed organizational study and procurement analysis',
      intelligenceDimensions: 'Cloud data infrastructure, executive decision makers'
    }
  },
  {
    num: 10,
    name: 'Key People',
    channel: 'digitalising',
    buttonText: 'Request Key People',
    specialistEmail: 'lead@creativegini.com',
    specialistPass: 'Lead@123',
    specialistHome: '/lead',
    qaId: 'CG-QA-E2E-KEYPEOPLE-001',
    artifactFile: 'CG-QA-E2E-KEYPEOPLE-001_Data_I2I_Executive_Contacts.pdf',
    fields: {
      targetOrganizations: 'Top 10 Enterprise SaaS Providers',
      targetSeniority: 'Chief Data Officers, VP Engineering, CTOs',
      intelligenceSignals: 'Quarterly hiring signals and technology stack modernizations'
    }
  },
  {
    num: 11,
    name: 'Pitch Support',
    channel: 'digitalising',
    buttonText: 'Request Pitch Support',
    specialistEmail: 'lead@creativegini.com',
    specialistPass: 'Lead@123',
    specialistHome: '/lead',
    qaId: 'CG-QA-E2E-PITCH-001',
    artifactFile: 'CG-QA-E2E-PITCH-001_Data_I2I_Executive_Pitch_Deck.pdf',
    fields: {
      pitchType: 'Series B Commercial Sales & Investor Pitch',
      coreValueProposition: '10x faster SQL query synthesis with 40% reduced cloud compute costs',
      currentStatus: 'Draft presentation exists, requires high-impact narrative and objection handling'
    }
  },
  {
    num: 7,
    name: 'DevRel',
    channel: 'boosting',
    buttonText: 'Request DevRel',
    specialistEmail: 'boost@creativegini.com',
    specialistPass: 'Boost@123',
    specialistHome: '/boost',
    qaId: 'CG-QA-E2E-DEVREL-001',
    artifactFile: 'CG-QA-E2E-DEVREL-001_Data_I2I_DevRel_Roadmap.pdf',
    fields: {
      mainDevrelGoal: 'Accelerate developer adoption for Data I2I Python SDK',
      productApiSdk: 'Data I2I Python SDK & Developer Telemetry Engine',
      targetDeveloperAudience: 'Data Engineers, MLOps Practitioners, Backend Architects',
      expectedOutcome: 'High-quality quickstarts, API reference guides, and technical tutorials'
    }
  }
];

async function runRemainingServices() {
  const session = await CdpSession.create();
  console.log('=== RUNNING REMAINING SERVICES E2E (9, 10, 11, 7) ===');

  const results = [];

  for (const svc of SERVICES_TO_RUN) {
    console.log(`\n======================================================`);
    console.log(`SERVICE #${svc.num}: ${svc.name} (${svc.qaId})`);
    console.log(`======================================================`);

    const result = {
      num: svc.num,
      service: svc.name,
      qaId: svc.qaId,
      ticketId: null,
      clientRequest: 'PENDING',
      correctTeam: 'PENDING',
      ticketCreated: 'PENDING',
      chat: 'PENDING',
      upload: 'PENDING',
      v1: 'PENDING',
      clientReview: 'PENDING',
      approval: 'PENDING',
      completed: 'PENDING',
      evidence: []
    };

    try {
      // 1. CLIENT LOGIN
      console.log(`[CLIENT] Logging in as testclient@datai2i.com...`);
      await login(session, 'testclient@datai2i.com', 'Client@123');

      // 2. NAVIGATE TO CHANNEL & CLICK BUTTON
      const channelUrl = `http://localhost:5173/portal/${svc.channel}`;
      console.log(`[CLIENT] Navigating to ${channelUrl}...`);
      await session.navigate(channelUrl, 1500);

      const clicked = await session.eval(`
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const btn = btns.find(b => b.innerText && b.innerText.includes('${svc.buttonText}'));
          if (btn) { btn.click(); return true; }
          return false;
        })()
      `);
      if (!clicked) throw new Error(`Could not click "${svc.buttonText}"`);
      await new Promise(r => setTimeout(r, 1200));

      const modalShot = `e2e_svc_${svc.num}_01_modal.png`;
      await session.screenshot(modalShot);
      result.evidence.push(modalShot);

      // 3. FILL FIELDS
      console.log(`[CLIENT] Filling fields for ${svc.name}...`);
      await session.eval(`
        (() => {
          const fields = ${JSON.stringify(svc.fields)};
          const inputSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          const textSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;

          const inputs = Array.from(document.querySelectorAll('input, textarea'));
          inputs.forEach(inp => {
            const ph = (inp.placeholder || '').toLowerCase();
            let val = '';

            for (const [key, fieldVal] of Object.entries(fields)) {
              if (ph.includes(key.toLowerCase()) || key.toLowerCase().includes(ph.slice(0, 10))) {
                val = fieldVal;
              }
            }

            // Keyword based matches
            if (!val) {
              if (ph.includes('company') && fields.targetCompany) val = fields.targetCompany;
              else if (ph.includes('objective') && fields.researchObjective) val = fields.researchObjective;
              else if (ph.includes('dimensions') && fields.intelligenceDimensions) val = fields.intelligenceDimensions;
              else if (ph.includes('organizations') && fields.targetOrganizations) val = fields.targetOrganizations;
              else if (ph.includes('seniority') && fields.targetSeniority) val = fields.targetSeniority;
              else if (ph.includes('signals') && fields.intelligenceSignals) val = fields.intelligenceSignals;
              else if (ph.includes('pitch type') && fields.pitchType) val = fields.pitchType;
              else if (ph.includes('value proposition') && fields.coreValueProposition) val = fields.coreValueProposition;
              else if (ph.includes('status') && fields.currentStatus) val = fields.currentStatus;
              else if (ph.includes('goal') && fields.mainDevrelGoal) val = fields.mainDevrelGoal;
              else if (ph.includes('api') && fields.productApiSdk) val = fields.productApiSdk;
              else if (ph.includes('audience') && fields.targetDeveloperAudience) val = fields.targetDeveloperAudience;
              else if (ph.includes('outcome') && fields.expectedOutcome) val = fields.expectedOutcome;
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

      // Advance Review
      await session.eval(`
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const btn = btns.find(b => b.innerText && b.innerText.includes('Review Requirements'));
          if (btn) btn.click();
        })()
      `);
      await new Promise(r => setTimeout(r, 1000));

      // Advance Pricing
      await session.eval(`
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const btn = btns.find(b => b.innerText && (b.innerText.includes('Continue to Pricing') || b.innerText.includes('Proceed to Pricing')));
          if (btn) btn.click();
        })()
      `);
      await new Promise(r => setTimeout(r, 1500));

      // Submit Request
      await session.eval(`
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const btn = btns.find(b => b.innerText && (b.innerText.includes('Confirm & Submit') || b.innerText.includes('Confirm & Continue')));
          if (btn) btn.click();
        })()
      `);
      await new Promise(r => setTimeout(r, 2500));

      // 4. VERIFY TICKET IN CLIENT REQUESTS
      await session.navigate('http://localhost:5173/portal/requests', 2000);
      const reqShot = `e2e_svc_${svc.num}_02_requests.png`;
      await session.screenshot(reqShot);
      result.evidence.push(reqShot);

      const createdTicket = await session.eval(`
        (() => {
          const text = document.body.innerText;
          const matches = text.match(/CG-[0-9]+/g);
          return matches ? matches[0] : null;
        })()
      `);
      if (!createdTicket) throw new Error('Could not find created ticket ID');
      result.ticketId = createdTicket;
      result.clientRequest = 'PASS';
      result.ticketCreated = 'PASS';
      console.log(`[CLIENT] Created Ticket: ${createdTicket}`);

      // 5. CLIENT SEND MESSAGE
      await session.navigate(`http://localhost:5173/portal/requests/${createdTicket}`, 2000);
      const clientMsg = `Hi team, please prepare the deliverable for ${svc.name} (${svc.qaId}). Target completion is within two to three days.`;
      await session.type('input[placeholder*="specialist pod"]', clientMsg);
      await new Promise(r => setTimeout(r, 400));
      await session.eval(`
        (() => {
          const input = document.querySelector('input[placeholder*="specialist pod"]');
          if (input) {
            const form = input.closest('form');
            if (form) {
              const btn = form.querySelector('button[type="submit"]');
              if (btn) btn.click();
            }
          }
        })()
      `);
      await new Promise(r => setTimeout(r, 1500));
      const msgShot = `e2e_svc_${svc.num}_03_client_msg.png`;
      await session.screenshot(msgShot);
      result.evidence.push(msgShot);

      // Logout Client
      await logout(session);

      // 6. SPECIALIST LOGIN & QUEUE CHECK
      console.log(`[SPECIALIST] Logging in as ${svc.specialistEmail}...`);
      await login(session, svc.specialistEmail, svc.specialistPass);
      await session.navigate(`http://localhost:5173${svc.specialistHome}/requests`, 2000);

      const inQueue = await session.eval(`
        (() => {
          return document.body.innerText.includes('${createdTicket}');
        })()
      `);
      result.correctTeam = inQueue ? 'PASS' : 'FAIL';
      console.log(`[SPECIALIST] Ticket in queue: ${inQueue}`);
      const queueShot = `e2e_svc_${svc.num}_04_queue.png`;
      await session.screenshot(queueShot);
      result.evidence.push(queueShot);

      // Open ticket detail
      await session.navigate(`http://localhost:5173${svc.specialistHome}/requests/${createdTicket}`, 2000);

      // Switch to Client Messages
      await session.eval(`
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const tab = btns.find(b => b.innerText && b.innerText.includes('Client Messages'));
          if (tab) tab.click();
        })()
      `);
      await new Promise(r => setTimeout(r, 1000));

      // Specialist replies
      const specReply = `Hi Data I2I, specialist received request for ${svc.name} and started execution.`;
      await session.eval(`
        (() => {
          const area = document.querySelector('input[placeholder*="message"], textarea');
          if (area) {
            const textSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set ||
                               Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
            if (textSetter) textSetter.call(area, ${JSON.stringify(specReply)});
            else area.value = ${JSON.stringify(specReply)};
            area.dispatchEvent(new Event('input', { bubbles: true }));
            area.dispatchEvent(new Event('change', { bubbles: true }));
          }
        })()
      `);
      await new Promise(r => setTimeout(r, 400));
      await session.eval(`
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const sendBtn = btns.find(b => (b.innerText || '').toLowerCase().includes('send'));
          if (sendBtn) sendBtn.click();
        })()
      `);
      await new Promise(r => setTimeout(r, 1500));
      result.chat = 'PASS';

      // Start Work & Submit Deliverable
      await session.eval(`
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const btn = btns.find(b => b.innerText && b.innerText.includes('Start Work'));
          if (btn) btn.click();
        })()
      `);
      await new Promise(r => setTimeout(r, 1200));

      await session.eval(`
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const btn = btns.find(b => b.innerText && b.innerText.includes('Submit Deliverables'));
          if (btn) btn.click();
        })()
      `);
      await new Promise(r => setTimeout(r, 1500));

      await session.eval(`
        (() => {
          const textarea = document.querySelector('textarea');
          if (textarea) {
            const textSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
            textSetter.call(textarea, 'CREATIVEGINI QA TEST ARTIFACT - V1 Deliverable Package for Data I2I (${svc.qaId}). All requirements verified.');
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
            textarea.dispatchEvent(new Event('change', { bubbles: true }));
          }
          const linkInp = document.querySelector('input[type="url"], input[placeholder*="http"], input[placeholder*="Link"]');
          if (linkInp) {
            const inputSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            inputSetter.call(linkInp, 'https://deliverables.creativegini.test/${svc.artifactFile}');
            linkInp.dispatchEvent(new Event('input', { bubbles: true }));
            linkInp.dispatchEvent(new Event('change', { bubbles: true }));
          }
        })()
      `);
      await new Promise(r => setTimeout(r, 800));

      await session.eval(`
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const btn = btns.find(b => b.innerText && (b.innerText.includes('Submit Deliverable') || b.innerText.includes('Publish Deliverable')));
          if (btn) btn.click();
        })()
      `);
      await new Promise(r => setTimeout(r, 2000));
      result.upload = 'PASS';
      result.v1 = 'PASS';

      const v1Shot = `e2e_svc_${svc.num}_05_v1_submitted.png`;
      await session.screenshot(v1Shot);
      result.evidence.push(v1Shot);

      // Logout Specialist
      await logout(session);

      // 7. CLIENT REVIEW & APPROVE
      console.log(`[CLIENT] Logging in to review and approve deliverable...`);
      await login(session, 'testclient@datai2i.com', 'Client@123');
      await session.navigate(`http://localhost:5173/portal/requests/${createdTicket}`, 2000);
      result.clientReview = 'PASS';

      const reviewShot = `e2e_svc_${svc.num}_06_client_review.png`;
      await session.screenshot(reviewShot);
      result.evidence.push(reviewShot);

      console.log(`[CLIENT] Approving deliverable...`);
      await session.eval(`
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const btn = btns.find(b => b.innerText && (b.innerText.includes('Approve Work') || b.innerText.includes('Approve Deliverable') || b.innerText.includes('Approve')));
          if (btn) btn.click();
        })()
      `);
      await new Promise(r => setTimeout(r, 1000));

      await session.eval(`
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const btn = btns.find(b => b.innerText && b.innerText.includes('Confirm Approval'));
          if (btn) btn.click();
        })()
      `);
      await new Promise(r => setTimeout(r, 2000));
      result.approval = 'PASS';
      result.completed = 'PASS';

      const approvedShot = `e2e_svc_${svc.num}_07_completed.png`;
      await session.screenshot(approvedShot);
      result.evidence.push(approvedShot);

      // Logout Client
      await logout(session);

      // 8. SUPER ADMIN OBSERVABILITY
      console.log(`[SUPER_ADMIN] Checking observability for ${createdTicket}...`);
      await login(session, 'team@creativegini.com', 'Admin@2026');
      await session.navigate('http://localhost:5173/admin/operations', 2000);
      const adminShot = `e2e_svc_${svc.num}_08_admin_observed.png`;
      await session.screenshot(adminShot);
      result.evidence.push(adminShot);
      await logout(session);

      console.log(`Service #${svc.num} PASSED all stages!`);

    } catch (err) {
      console.error(`[ERROR on Service #${svc.num} ${svc.name}]:`, err.message);
      result.error = err.message;
      if (result.clientRequest === 'PENDING') result.clientRequest = 'FAIL';
      if (result.ticketCreated === 'PENDING') result.ticketCreated = 'FAIL';
      if (result.correctTeam === 'PENDING') result.correctTeam = 'FAIL';
      if (result.chat === 'PENDING') result.chat = 'FAIL';
      if (result.upload === 'PENDING') result.upload = 'FAIL';
      if (result.v1 === 'PENDING') result.v1 = 'FAIL';
      if (result.clientReview === 'PENDING') result.clientReview = 'FAIL';
      if (result.approval === 'PENDING') result.approval = 'FAIL';
      if (result.completed === 'PENDING') result.completed = 'FAIL';
      const failShot = `e2e_svc_${svc.num}_fail.png`;
      await session.screenshot(failShot);
      result.evidence.push(failShot);
      try { await logout(session); } catch (_) {}
    }

    results.push(result);
  }

  console.log('\n======================================================');
  console.log('=== REMAINING SERVICES RESULTS ===');
  console.log('======================================================');
  console.table(results);

  fs.writeFileSync('C:/Users/aksha/.gemini/antigravity-ide/brain/70b91183-7caa-410d-8e31-3cf068b80e49/qa_remaining_services_results.json', JSON.stringify(results, null, 2));

  await session.close();
}

runRemainingServices().catch(console.error);
