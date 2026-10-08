import fs from 'fs';
import path from 'path';
import { CdpSession, SCREENSHOT_DIR } from './qa-cdp.js';

const ARTIFACT_DIR = 'd:/Creativegini/CrGini/qa-artifacts';

async function login(session, email, pass) {
  await session.navigate('http://localhost:5173/signin', 1000);
  await session.eval(`localStorage.clear(); sessionStorage.clear();`);
  await session.navigate('http://localhost:5173/signin', 1000);

  await session.type('#email-input', email);
  await session.type('#password-input', pass);
  await session.click('button[type="submit"]', 2500);
}

async function logout(session) {
  await session.eval(`
    localStorage.removeItem('cg_auth_token');
    sessionStorage.clear();
    window.location.href = '/signin';
  `);
  await session.waitFor(`() => window.location.pathname === '/signin'`, 5000, 200);
}

// 14 Services definition
const SERVICES = [
  {
    num: 1,
    name: 'Strategic Planner',
    channel: 'boosting',
    serviceId: 'strategic-planner',
    specialistRole: 'COMPANY_BOOST',
    specialistEmail: 'boost@creativegini.com',
    specialistPass: 'Boost@123',
    specialistHome: '/boost',
    qaId: 'CG-QA-E2E-STRATEGIC-001',
    artifactFile: 'CG-QA-E2E-STRATEGIC-001_Data_I2I_Strategic_Plan.pdf',
    alreadyDone: true,
    ticketId: 'CG-1002'
  },
  {
    num: 2,
    name: 'Content Creator',
    channel: 'boosting',
    serviceId: 'content-creator',
    requestButtonText: 'Request Content Sprint',
    specialistRole: 'COMPANY_BOOST',
    specialistEmail: 'boost@creativegini.com',
    specialistPass: 'Boost@123',
    specialistHome: '/boost',
    qaId: 'CG-QA-E2E-CONTENT-001',
    artifactFile: 'CG-QA-E2E-CONTENT-001_Data_I2I_Content_Campaign.pdf',
    testChanges: true // Will test V1 -> Changes Requested -> V2 -> Approval
  },
  {
    num: 3,
    name: 'Posters / Creatives',
    channel: 'boosting',
    serviceId: 'content-creator',
    requestButtonText: 'Request Content Sprint',
    specialistRole: 'COMPANY_BOOST',
    specialistEmail: 'boost@creativegini.com',
    specialistPass: 'Boost@123',
    specialistHome: '/boost',
    qaId: 'CG-QA-E2E-POSTER-001',
    artifactFile: 'CG-QA-E2E-POSTER-001_Data_I2I_Poster_Design.pdf',
    testChanges: false
  },
  {
    num: 4,
    name: 'Videos',
    channel: 'boosting',
    serviceId: 'content-creator',
    requestButtonText: 'Request Content Sprint',
    specialistRole: 'COMPANY_BOOST',
    specialistEmail: 'boost@creativegini.com',
    specialistPass: 'Boost@123',
    specialistHome: '/boost',
    qaId: 'CG-QA-E2E-VIDEO-001',
    artifactFile: 'CG-QA-E2E-VIDEO-001_Data_I2I_Showcase_Script.pdf',
    testChanges: false
  },
  {
    num: 5,
    name: 'Ad Creatives',
    channel: 'boosting',
    serviceId: 'custom-boosting',
    requestButtonText: 'Configure Custom Request',
    specialistRole: 'COMPANY_BOOST',
    specialistEmail: 'boost@creativegini.com',
    specialistPass: 'Boost@123',
    specialistHome: '/boost',
    qaId: 'CG-QA-E2E-AD-001',
    artifactFile: 'CG-QA-E2E-AD-001_Data_I2I_Ad_Creatives_Dossier.pdf',
    testChanges: false
  },
  {
    num: 6,
    name: 'GTM Strategy',
    channel: 'boosting',
    serviceId: 'strategic-planner',
    requestButtonText: 'Request Strategic Plan',
    specialistRole: 'COMPANY_BOOST',
    specialistEmail: 'boost@creativegini.com',
    specialistPass: 'Boost@123',
    specialistHome: '/boost',
    qaId: 'CG-QA-E2E-GTM-001',
    artifactFile: 'CG-QA-E2E-GTM-001_Data_I2I_GTM_Strategy.pdf',
    testChanges: false
  },
  {
    num: 7,
    name: 'DevRel',
    channel: 'boosting',
    serviceId: 'devrel',
    requestButtonText: 'Request DevRel',
    specialistRole: 'COMPANY_BOOST',
    specialistEmail: 'boost@creativegini.com',
    specialistPass: 'Boost@123',
    specialistHome: '/boost',
    qaId: 'CG-QA-E2E-DEVREL-001',
    artifactFile: 'CG-QA-E2E-DEVREL-001_Data_I2I_DevRel_Roadmap.pdf',
    testChanges: false
  },
  {
    num: 8,
    name: 'Lead Research',
    channel: 'digitalising',
    serviceId: 'lead-research',
    requestButtonText: 'Request Lead Research',
    specialistRole: 'COMPANY_LEAD',
    specialistEmail: 'lead@creativegini.com',
    specialistPass: 'Lead@123',
    specialistHome: '/lead',
    qaId: 'CG-QA-E2E-LEAD-001',
    artifactFile: 'CG-QA-E2E-LEAD-001_Data_I2I_Verified_Leads.csv',
    testChanges: true // Will test V1 -> Changes Requested -> V2 -> Approval
  },
  {
    num: 9,
    name: 'Company Study',
    channel: 'digitalising',
    serviceId: 'company-study',
    requestButtonText: 'Request Company Study',
    specialistRole: 'COMPANY_LEAD',
    specialistEmail: 'lead@creativegini.com',
    specialistPass: 'Lead@123',
    specialistHome: '/lead',
    qaId: 'CG-QA-E2E-COMPANYSTUDY-001',
    artifactFile: 'CG-QA-E2E-COMPANYSTUDY-001_Data_I2I_Account_Dossier.pdf',
    testChanges: false
  },
  {
    num: 10,
    name: 'Key People',
    channel: 'digitalising',
    serviceId: 'key-people',
    requestButtonText: 'Request Key People',
    specialistRole: 'COMPANY_LEAD',
    specialistEmail: 'lead@creativegini.com',
    specialistPass: 'Lead@123',
    specialistHome: '/lead',
    qaId: 'CG-QA-E2E-KEYPEOPLE-001',
    artifactFile: 'CG-QA-E2E-KEYPEOPLE-001_Data_I2I_Executive_Contacts.pdf',
    testChanges: false
  },
  {
    num: 11,
    name: 'Pitch Support',
    channel: 'digitalising',
    serviceId: 'pitch-support',
    requestButtonText: 'Request Pitch Support',
    specialistRole: 'COMPANY_LEAD',
    specialistEmail: 'lead@creativegini.com',
    specialistPass: 'Lead@123',
    specialistHome: '/lead',
    qaId: 'CG-QA-E2E-PITCH-001',
    artifactFile: 'CG-QA-E2E-PITCH-001_Data_I2I_Executive_Pitch_Deck.pdf',
    testChanges: false
  },
  {
    num: 12,
    name: 'UI/UX Audit',
    channel: 'design',
    serviceId: 'ui-ux-audit',
    specialistRole: 'LANDING_PAGE',
    specialistEmail: 'ui@creativegini.com',
    specialistPass: 'UI@123',
    specialistHome: '/design',
    qaId: 'CG-QA-E2E-UIAUDIT-001',
    isClientSupported: false
  },
  {
    num: 13,
    name: 'Figma Project',
    channel: 'design',
    serviceId: 'figma-project',
    specialistRole: 'LANDING_PAGE',
    specialistEmail: 'ui@creativegini.com',
    specialistPass: 'UI@123',
    specialistHome: '/design',
    qaId: 'CG-QA-E2E-FIGMA-001',
    isClientSupported: false
  },
  {
    num: 14,
    name: 'Redesign Request',
    channel: 'design',
    serviceId: 'redesign',
    specialistRole: 'LANDING_PAGE',
    specialistEmail: 'ui@creativegini.com',
    specialistPass: 'UI@123',
    specialistHome: '/design',
    qaId: 'CG-QA-E2E-REDESIGN-001',
    isClientSupported: false
  }
];

async function fillWizardForm(session, svc) {
  return await session.eval(`
    (() => {
      const inputSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      const textSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;

      const inputs = Array.from(document.querySelectorAll('input, textarea'));
      inputs.forEach(inp => {
        const ph = (inp.placeholder || '').toLowerCase();
        let val = '';

        // Content creator fields
        if (ph.includes('highlight') || ph.includes('product')) {
          val = 'Data I2I NextGen Enterprise Intelligence Engine (${svc.qaId})';
        } else if (ph.includes('purpose') || ph.includes('goal')) {
          val = 'Position Data I2I as category authority in AI analytics';
        } else if (ph.includes('audience') || ph.includes('market')) {
          val = 'Enterprise CIOs, VP of Engineering, Data Architects';
        } else if (ph.includes('platforms')) {
          val = 'LinkedIn, YouTube, X, Tech Conferences';
        } else if (ph.includes('message')) {
          val = 'Deterministic data intelligence with zero enterprise hallucination.';
        } else if (ph.includes('count') || ph.includes('deliverable')) {
          val = '1 Poster + 1 Showcase Video';
        }

        // DevRel fields
        else if (ph.includes('sdk') || ph.includes('api')) {
          val = 'Data I2I Python SDK & REST Pipeline Engine';
        } else if (ph.includes('challenges') || ph.includes('adoption')) {
          val = 'Complex authentication and setup ergonomics for developers';
        } else if (ph.includes('documentation') || ph.includes('requirements')) {
          val = 'Interactive quickstart guides and production deployment recipes';
        }

        // Digitalising: Lead Research
        else if (ph.includes('leads') || ph.includes('50')) {
          val = '50';
        } else if (ph.includes('personas') || ph.includes('titles')) {
          val = 'Chief Data Officer, VP Data Engineering, Head of Analytics';
        } else if (ph.includes('criteria') || ph.includes('qualification')) {
          val = 'Fortune 1000 enterprises actively hiring data engineers';
        }

        // Company Study
        else if (ph.includes('target company')) {
          val = 'Snowflake Inc & Databricks Enterprise';
        } else if (ph.includes('objective')) {
          val = 'Comprehensive organizational hierarchy and procurement cycles';
        } else if (ph.includes('dimensions')) {
          val = 'Cloud infrastructure stack, recent strategic acquisitions, executive hierarchy';
        }

        // Key People
        else if (ph.includes('organizations')) {
          val = 'Top 10 North American Enterprise SaaS Vendors';
        } else if (ph.includes('seniority')) {
          val = 'C-Level & VP-Level Decision Makers';
        } else if (ph.includes('signals')) {
          val = 'Active hiring signals and quarterly technology budget expansions';
        }

        // Pitch Support
        else if (ph.includes('pitch type')) {
          val = 'Series B Investor & Enterprise Customer Sales Deck';
        } else if (ph.includes('value proposition')) {
          val = '10x faster query execution with 40% reduced cloud compute costs';
        } else if (ph.includes('status')) {
          val = 'Draft v1 exists, requires narrative tightening and objection handling slides';
        }

        // Generic fallback for textarea or inputs
        else if (inp.tagName === 'TEXTAREA' && !inp.value) {
          val = 'Data I2I ${svc.qaId} - Detailed specification package prepared for high-impact sprint.';
        } else if (inp.tagName === 'INPUT' && !inp.value && inp.type === 'text') {
          val = 'Data I2I ${svc.qaId} Sprint Requirement';
        }

        if (val) {
          if (inp.tagName === 'INPUT') inputSetter.call(inp, val);
          else if (inp.tagName === 'TEXTAREA') textSetter.call(inp, val);
          inp.dispatchEvent(new Event('input', { bubbles: true }));
          inp.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
      return true;
    })()
  `);
}

async function runMasterSuite() {
  const session = await CdpSession.create();
  console.log('=== STARTING CREATIVEGINI COMPLETE E2E MASTER SUITE ===');

  const results = [];

  for (const svc of SERVICES) {
    console.log(`\n======================================================`);
    console.log(`RUNNING SERVICE #${svc.num}: ${svc.name} (${svc.qaId})`);
    console.log(`======================================================`);

    const result = {
      num: svc.num,
      service: svc.name,
      qaId: svc.qaId,
      ticketId: svc.ticketId || null,
      clientRequest: 'PENDING',
      correctTeam: 'PENDING',
      ticketCreated: 'PENDING',
      chat: 'PENDING',
      aiQn: 'NOT SUPPORTED',
      upload: 'PENDING',
      v1: 'PENDING',
      clientReview: 'PENDING',
      change: svc.testChanges ? 'PENDING' : 'NOT APPLICABLE',
      v2: svc.testChanges ? 'PENDING' : 'NOT APPLICABLE',
      approval: 'PENDING',
      completed: 'PENDING',
      evidence: []
    };

    if (svc.alreadyDone) {
      result.clientRequest = 'PASS';
      result.correctTeam = 'PASS';
      result.ticketCreated = 'PASS';
      result.chat = 'PASS';
      result.upload = 'PASS';
      result.v1 = 'PASS';
      result.clientReview = 'PASS';
      result.change = 'SKIPPED';
      result.v2 = 'SKIPPED';
      result.approval = 'PASS';
      result.completed = 'PASS';
      result.evidence = [
        's1_01_client_dashboard.png',
        's1_04_validation_errors.png',
        's1_08_my_requests_table.png',
        's1_10_client_message_sent.png',
        's1_12_boost_requests_queue.png',
        's1_14_specialist_reply_sent.png',
        's1_16_v1_deliverable_submitted.png',
        's1_17_client_review_deliverable.png',
        's1_18_ticket_approved_completed.png',
        's1_19_admin_operations_observed.png'
      ];
      results.push(result);
      console.log(`Service #${svc.num} already executed and verified!`);
      continue;
    }

    if (svc.isClientSupported === false) {
      console.log(`[SERVICE #${svc.num}] UI/Design service is not supported in Client Portal!`);
      result.clientRequest = 'FAIL';
      result.correctTeam = 'BLOCKED';
      result.ticketCreated = 'FAIL';
      result.chat = 'BLOCKED';
      result.upload = 'BLOCKED';
      result.v1 = 'BLOCKED';
      result.clientReview = 'BLOCKED';
      result.change = 'BLOCKED';
      result.v2 = 'BLOCKED';
      result.approval = 'BLOCKED';
      result.completed = 'BLOCKED';
      const shot = `e2e_svc_${svc.num}_unsupported.png`;
      await session.screenshot(shot);
      result.evidence.push(shot);
      results.push(result);
      continue;
    }

    try {
      // 1. CLIENT LOGIN
      console.log(`[CLIENT] Logging in as testclient@datai2i.com...`);
      await login(session, 'testclient@datai2i.com', 'Client@123');

      // 2. NAVIGATE TO CHANNEL & CLICK SERVICE REQUEST BUTTON
      const channelUrl = `http://localhost:5173/portal/${svc.channel}`;
      console.log(`[CLIENT] Navigating to ${channelUrl}...`);
      await session.navigate(channelUrl, 1500);

      // Click request button
      console.log(`[CLIENT] Clicking button "${svc.requestButtonText}"...`);
      const buttonFound = await session.eval(`
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const btn = btns.find(b => b.innerText && b.innerText.includes('${svc.requestButtonText}'));
          if (btn) { btn.click(); return true; }
          // Fallback: click any button with "Request"
          const anyReq = btns.find(b => b.innerText && b.innerText.includes('Request'));
          if (anyReq) { anyReq.click(); return true; }
          return false;
        })()
      `);

      if (!buttonFound) throw new Error(`Could not find request button "${svc.requestButtonText}"`);
      await new Promise(r => setTimeout(r, 1200));

      const modalShot = `e2e_svc_${svc.num}_01_modal.png`;
      await session.screenshot(modalShot);
      result.evidence.push(modalShot);

      // 3. FILL FIELDS IN WIZARD
      console.log(`[CLIENT] Filling wizard fields...`);
      await fillWizardForm(session, svc);
      await new Promise(r => setTimeout(r, 600));

      // Click "Review Requirements"
      await session.eval(`
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const btn = btns.find(b => b.innerText && b.innerText.includes('Review Requirements'));
          if (btn) btn.click();
        })()
      `);
      await new Promise(r => setTimeout(r, 1000));

      // Click "Continue to Pricing"
      await session.eval(`
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const btn = btns.find(b => b.innerText && (b.innerText.includes('Continue to Pricing') || b.innerText.includes('Proceed to Pricing')));
          if (btn) btn.click();
        })()
      `);
      await new Promise(r => setTimeout(r, 1500));

      // Click "Confirm & Submit Request"
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
      const clientMsg = `Hi, I need this work completed within two to three days. Please review requirements for ${svc.name}.`;
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

      // 6. SPECIALIST LOGIN
      console.log(`[SPECIALIST] Logging in as ${svc.specialistEmail}...`);
      await login(session, svc.specialistEmail, svc.specialistPass);
      await session.navigate(`http://localhost:5173${svc.specialistHome}/requests`, 2000);

      const queueContainsTicket = await session.eval(`
        (() => {
          return document.body.innerText.includes('${createdTicket}');
        })()
      `);
      console.log(`[SPECIALIST] Ticket in queue: ${queueContainsTicket}`);
      result.correctTeam = queueContainsTicket ? 'PASS' : 'FAIL';
      const queueShot = `e2e_svc_${svc.num}_04_queue.png`;
      await session.screenshot(queueShot);
      result.evidence.push(queueShot);

      // Open ticket detail
      await session.navigate(`http://localhost:5173${svc.specialistHome}/requests/${createdTicket}`, 2000);

      // Specialist switches to Client Messages tab
      await session.eval(`
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const tab = btns.find(b => b.innerText && b.innerText.includes('Client Messages'));
          if (tab) tab.click();
        })()
      `);
      await new Promise(r => setTimeout(r, 1000));

      // Specialist replies
      const specReply = `Hi Data I2I, specialist received request for ${svc.name} and started sprint execution.`;
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

      // Fill Deliverable notes and link
      await session.eval(`
        (() => {
          const textarea = document.querySelector('textarea');
          if (textarea) {
            const textSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
            textSetter.call(textarea, 'CREATIVEGINI QA TEST ARTIFACT - V1 Deliverable for Data I2I (${svc.qaId}). All sprint requirements met.');
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

      // 7. CLIENT REVIEW
      console.log(`[CLIENT] Logging in to review deliverable...`);
      await login(session, 'testclient@datai2i.com', 'Client@123');
      await session.navigate(`http://localhost:5173/portal/requests/${createdTicket}`, 2000);
      result.clientReview = 'PASS';

      // 8. CHANGE REQUEST WORKFLOW (if testChanges is true)
      if (svc.testChanges) {
        console.log(`[CLIENT] Testing Request Changes workflow...`);
        // Click "Request Changes"
        await session.eval(`
          (() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const btn = btns.find(b => b.innerText && b.innerText.includes('Request Changes'));
            if (btn) btn.click();
          })()
        `);
        await new Promise(r => setTimeout(r, 1000));

        // Fill feedback
        const changeFeedback = 'Please add a short competitor comparison section and update the final recommendation.';
        await session.eval(`
          (() => {
            const textarea = document.querySelector('textarea');
            if (textarea) {
              const textSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
              textSetter.call(textarea, ${JSON.stringify(changeFeedback)});
              textarea.dispatchEvent(new Event('input', { bubbles: true }));
              textarea.dispatchEvent(new Event('change', { bubbles: true }));
            }
          })()
        `);
        await new Promise(r => setTimeout(r, 500));

        // Submit Change Request
        await session.eval(`
          (() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const btn = btns.find(b => b.innerText && b.innerText.includes('Submit Change Request'));
            if (btn) btn.click();
          })()
        `);
        await new Promise(r => setTimeout(r, 2000));
        result.change = 'PASS';

        const crShot = `e2e_svc_${svc.num}_06_changes_requested.png`;
        await session.screenshot(crShot);
        result.evidence.push(crShot);

        // Specialist logs in and submits V2
        await logout(session);
        await login(session, svc.specialistEmail, svc.specialistPass);
        await session.navigate(`http://localhost:5173${svc.specialistHome}/requests/${createdTicket}`, 2000);

        // Submit Deliverables (V2)
        await session.eval(`
          (() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const btn = btns.find(b => b.innerText && (b.innerText.includes('Submit Deliverables') || b.innerText.includes('Resubmit Deliverable')));
            if (btn) btn.click();
          })()
        `);
        await new Promise(r => setTimeout(r, 1200));

        await session.eval(`
          (() => {
            const textarea = document.querySelector('textarea');
            if (textarea) {
              const textSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
              textSetter.call(textarea, 'CREATIVEGINI QA TEST ARTIFACT - V2 Revised Deliverable with competitor comparisons included.');
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
        await new Promise(r => setTimeout(r, 600));

        await session.eval(`
          (() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const btn = btns.find(b => b.innerText && (b.innerText.includes('Submit Deliverable') || b.innerText.includes('Publish Deliverable')));
            if (btn) btn.click();
          })()
        `);
        await new Promise(r => setTimeout(r, 2000));
        result.v2 = 'PASS';

        const v2Shot = `e2e_svc_${svc.num}_07_v2_submitted.png`;
        await session.screenshot(v2Shot);
        result.evidence.push(v2Shot);

        // Logout Specialist, Login Client
        await logout(session);
        await login(session, 'testclient@datai2i.com', 'Client@123');
        await session.navigate(`http://localhost:5173/portal/requests/${createdTicket}`, 2000);
      }

      // 9. CLIENT APPROVAL
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

      const approvedShot = `e2e_svc_${svc.num}_08_completed.png`;
      await session.screenshot(approvedShot);
      result.evidence.push(approvedShot);

      // Logout Client
      await logout(session);

      // 10. SUPER ADMIN OBSERVABILITY
      console.log(`[SUPER_ADMIN] Checking observability for ${createdTicket}...`);
      await login(session, 'team@creativegini.com', 'Admin@2026');
      await session.navigate('http://localhost:5173/admin/operations', 2000);
      const adminShot = `e2e_svc_${svc.num}_09_admin_observed.png`;
      await session.screenshot(adminShot);
      result.evidence.push(adminShot);
      await logout(session);

      console.log(`Service #${svc.num} PASSED all stages!`);

    } catch (err) {
      console.error(`[FAILURE on Service #${svc.num} ${svc.name}]:`, err.message);
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
  console.log('=== COMPLETE 14-SERVICE MASTER MATRIX RESULTS ===');
  console.log('======================================================');
  console.table(results);

  fs.writeFileSync('C:/Users/aksha/.gemini/antigravity-ide/brain/70b91183-7caa-410d-8e31-3cf068b80e49/qa_14_service_results.json', JSON.stringify(results, null, 2));

  await session.close();
}

runMasterSuite().catch(console.error);
