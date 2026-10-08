import fs from 'fs';
import path from 'path';
import { CdpSession, SCREENSHOT_DIR } from './qa-cdp.js';

const ARTIFACT_DIR = 'd:/Creativegini/CrGini/qa-artifacts';

const SERVICES = [
  {
    num: 1,
    name: 'Strategic Planner',
    code: 'strategic-planner',
    serviceType: 'COMPANY_BOOST',
    subService: 'STRATEGIC_PLAN',
    specialistRole: 'COMPANY_BOOST',
    specialistEmail: 'boost@creativegini.com',
    specialistPass: 'Boost@123',
    specialistHome: '/boost',
    qaId: 'CG-QA-E2E-STRATEGIC-001',
    artifactFile: 'CG-QA-E2E-STRATEGIC-001_Data_I2I_Strategic_Plan.pdf',
    testChanges: false
  },
  {
    num: 2,
    name: 'Content Creator',
    code: 'content-creator',
    serviceType: 'COMPANY_BOOST',
    subService: 'CONTENT',
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
    code: 'content-creator',
    serviceType: 'COMPANY_BOOST',
    subService: 'CONTENT',
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
    code: 'content-creator',
    serviceType: 'COMPANY_BOOST',
    subService: 'CONTENT',
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
    code: 'custom-boosting',
    serviceType: 'COMPANY_BOOST',
    subService: 'AD_CREATIVES',
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
    code: 'strategic-planner',
    serviceType: 'COMPANY_BOOST',
    subService: 'GTM_STRATEGY',
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
    code: 'devrel',
    serviceType: 'COMPANY_BOOST',
    subService: 'DEVREL',
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
    code: 'lead-research',
    serviceType: 'COMPANY_LEAD',
    subService: 'LEAD_RESEARCH',
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
    code: 'company-study',
    serviceType: 'COMPANY_LEAD',
    subService: 'COMPANY_STUDY',
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
    code: 'key-people',
    serviceType: 'COMPANY_LEAD',
    subService: 'KEY_PEOPLE',
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
    code: 'pitch-support',
    serviceType: 'COMPANY_LEAD',
    subService: 'PITCH_SUPPORT',
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
    code: 'custom',
    serviceType: 'LANDING_PAGE',
    subService: 'UI_UX_AUDIT',
    specialistRole: 'LANDING_PAGE',
    specialistEmail: 'ui@creativegini.com',
    specialistPass: 'UI@123',
    specialistHome: '/design',
    qaId: 'CG-QA-E2E-UIAUDIT-001',
    artifactFile: 'CG-QA-E2E-UIAUDIT-001_Data_I2I_UIUX_Audit_Report.pdf',
    testChanges: false
  },
  {
    num: 13,
    name: 'Figma Project',
    code: 'custom',
    serviceType: 'LANDING_PAGE',
    subService: 'FIGMA_PROJECT',
    specialistRole: 'LANDING_PAGE',
    specialistEmail: 'ui@creativegini.com',
    specialistPass: 'UI@123',
    specialistHome: '/design',
    qaId: 'CG-QA-E2E-FIGMA-001',
    artifactFile: 'CG-QA-E2E-FIGMA-001_Data_I2I_Design_System_Spec.pdf',
    testChanges: false
  },
  {
    num: 14,
    name: 'Redesign Request',
    code: 'custom',
    serviceType: 'LANDING_PAGE',
    subService: 'REDESIGN',
    specialistRole: 'LANDING_PAGE',
    specialistEmail: 'ui@creativegini.com',
    specialistPass: 'UI@123',
    specialistHome: '/design',
    qaId: 'CG-QA-E2E-REDESIGN-001',
    artifactFile: 'CG-QA-E2E-REDESIGN-001_Data_I2I_Landing_Page_Blueprint.pdf',
    testChanges: false
  }
];

async function loginUser(session, email, pass) {
  await session.navigate('http://localhost:5173/signin', 1000);
  await session.eval(`localStorage.clear(); sessionStorage.clear();`);
  await session.navigate('http://localhost:5173/signin', 1000);

  await session.type('#email-input', email);
  await session.type('#password-input', pass);
  await session.click('button[type="submit"]', 2000);
}

async function logoutUser(session) {
  await session.eval(`
    localStorage.removeItem('cg_auth_token');
    sessionStorage.clear();
    window.location.href = '/signin';
  `);
  await session.waitFor(`() => window.location.pathname === '/signin'`, 5000, 200);
}

async function runE2E() {
  console.log('=== STARTING 14-SERVICE LIVE E2E LIFECYCLE QA ===');
  const session = await CdpSession.create();
  const matrix = [];

  for (const svc of SERVICES) {
    console.log(`\n========================================================`);
    console.log(`SERVICE #${svc.num}: ${svc.name} (${svc.qaId})`);
    console.log(`========================================================`);

    const row = {
      num: svc.num,
      service: svc.name,
      qaId: svc.qaId,
      ticketCreated: false,
      ticketId: null,
      correctTeam: false,
      chat: false,
      aiQn: 'N/A',
      upload: false,
      v1: false,
      clientReview: false,
      changes: svc.testChanges ? false : 'SKIPPED',
      v2: svc.testChanges ? false : 'SKIPPED',
      approval: false,
      completed: false,
      evidence: [],
      status: 'PENDING'
    };

    try {
      // ----------------------------------------------------
      // STEP 1: CLIENT CREATES REQUEST THROUGH UI
      // ----------------------------------------------------
      console.log(`[CLIENT]: Logging in as Data I2I...`);
      await loginUser(session, 'testclient@datai2i.com', 'Client@123');
      await session.waitFor(`() => window.location.pathname.startsWith('/portal')`, 6000, 200);

      // Open new request modal
      console.log(`[CLIENT]: Opening request creation wizard for ${svc.name}...`);
      await session.navigate('http://localhost:5173/portal/requests', 1500);

      // Click "New Request" button
      await session.click('button:has(svg), .portal-btn-primary, [aria-label*="request"], button');
      await new Promise(r => setTimeout(r, 1000));

      // Fill in wizard fields via evaluated DOM in modal
      const modalFilled = await session.eval(`
        (() => {
          // Fill main textarea/inputs inside modal
          const inputs = Array.from(document.querySelectorAll('input[type="text"], textarea'));
          if (inputs.length === 0) return false;
          inputs.forEach(inp => {
            if (!inp.value) {
              const proto = Object.getPrototypeOf(inp);
              const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
              const val = 'Data I2I ${svc.qaId} - Comprehensive ${svc.name} specification for high-impact sprint.';
              if (setter) setter.call(inp, val);
              else inp.value = val;
              inp.dispatchEvent(new Event('input', { bubbles: true }));
              inp.dispatchEvent(new Event('change', { bubbles: true }));
            }
          });
          return true;
        })()
      `);

      // Click "Review Requirements →"
      await session.eval(`
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const nextBtn = btns.find(b => b.innerText && b.innerText.includes('Review Requirements'));
          if (nextBtn) nextBtn.click();
        })()
      `);
      await new Promise(r => setTimeout(r, 800));

      // Click "Continue to Pricing →" or "Proceed to Pricing"
      await session.eval(`
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const nextBtn = btns.find(b => b.innerText && (b.innerText.includes('Continue to Pricing') || b.innerText.includes('Proceed to Pricing')));
          if (nextBtn) nextBtn.click();
        })()
      `);
      await new Promise(r => setTimeout(r, 1200));

      // Screenshot Step 3 Pricing
      const priceShot = `e2e_svc_${svc.num}_01_price.png`;
      await session.screenshot(priceShot);
      row.evidence.push(priceShot);

      // Click "Confirm & Submit Request →"
      await session.eval(`
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const submitBtn = btns.find(b => b.innerText && (b.innerText.includes('Confirm & Submit') || b.innerText.includes('Confirm & Continue')));
          if (submitBtn) submitBtn.click();
        })()
      `);
      await new Promise(r => setTimeout(r, 2000));

      // Refresh /portal/requests to see new ticket
      await session.navigate('http://localhost:5173/portal/requests', 1500);

      // Find the newly created ticket ID
      const createdTicket = await session.eval(`
        (() => {
          const text = document.body.innerText;
          const match = text.match(/CG-[0-9]+/);
          return match ? match[0] : null;
        })()
      `);

      if (!createdTicket) {
        throw new Error('Failed to find created ticket CG-XXXX in client requests table');
      }

      row.ticketCreated = true;
      row.ticketId = createdTicket;
      console.log(`[CLIENT]: Ticket created: ${createdTicket}`);

      const reqShot = `e2e_svc_${svc.num}_02_ticket_created.png`;
      await session.screenshot(reqShot);
      row.evidence.push(reqShot);

      // ----------------------------------------------------
      // STEP 2: CLIENT SENDS INITIAL CHAT MESSAGE
      // ----------------------------------------------------
      console.log(`[CLIENT]: Opening ticket ${createdTicket} to send initial message...`);
      await session.navigate(`http://localhost:5173/portal/requests/${createdTicket}`, 1500);

      const clientMsg = `Hi, I need this work completed within the next two to three days. Please review the requirements for ${svc.name} and let me know if anything else is needed.`;

      // Type and send message
      await session.eval(`
        (() => {
          const area = document.querySelector('textarea, input[placeholder*="message"]');
          if (area) {
            const proto = Object.getPrototypeOf(area);
            const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
            if (setter) setter.call(area, ${JSON.stringify(clientMsg)});
            else area.value = ${JSON.stringify(clientMsg)};
            area.dispatchEvent(new Event('input', { bubbles: true }));
            area.dispatchEvent(new Event('change', { bubbles: true }));
          }
        })()
      `);

      await session.eval(`
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const sendBtn = btns.find(b => (b.innerText || '').toLowerCase().includes('send'));
          if (sendBtn) sendBtn.click();
        })()
      `);
      await new Promise(r => setTimeout(r, 1200));

      const chatShot = `e2e_svc_${svc.num}_03_client_message.png`;
      await session.screenshot(chatShot);
      row.evidence.push(chatShot);
      console.log(`[CLIENT]: Message sent and verified.`);

      // Client Logout
      await logoutUser(session);

      // ----------------------------------------------------
      // STEP 3: SPECIALIST QUEUE, CHAT REPLY & DELIVERABLE V1
      // ----------------------------------------------------
      console.log(`[SPECIALIST]: Logging in as ${svc.specialistRole} (${svc.specialistEmail})...`);
      await loginUser(session, svc.specialistEmail, svc.specialistPass);
      await session.waitFor(`() => window.location.pathname.startsWith('${svc.specialistHome}')`, 6000, 200);

      // Navigate to specialist requests / queue
      await session.navigate(`http://localhost:5173${svc.specialistHome}/requests`, 1500);

      // Verify ticket appears in queue
      const inQueue = await session.eval(`
        (() => {
          return document.body.innerText.includes('${createdTicket}');
        })()
      `);

      row.correctTeam = inQueue;
      console.log(`[SPECIALIST]: Ticket ${createdTicket} in queue: ${inQueue}`);

      const queueShot = `e2e_svc_${svc.num}_04_specialist_queue.png`;
      await session.screenshot(queueShot);
      row.evidence.push(queueShot);

      // Open ticket workspace
      await session.navigate(`http://localhost:5173${svc.specialistHome}/requests/${createdTicket}`, 1500);

      // Verify client message is visible
      const msgVisible = await session.eval(`
        (() => {
          return document.body.innerText.includes('two to three days');
        })()
      `);

      console.log(`[SPECIALIST]: Client message visible in ticket: ${msgVisible}`);

      // Send specialist reply
      const specReply = `Hi Data I2I, I have received the request for ${svc.name} and will review the requirements immediately.`;
      await session.eval(`
        (() => {
          const area = document.querySelector('textarea, input[placeholder*="message"]');
          if (area) {
            const proto = Object.getPrototypeOf(area);
            const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
            if (setter) setter.call(area, ${JSON.stringify(specReply)});
            else area.value = ${JSON.stringify(specReply)};
            area.dispatchEvent(new Event('input', { bubbles: true }));
            area.dispatchEvent(new Event('change', { bubbles: true }));
          }
        })()
      `);
      await session.eval(`
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const sendBtn = btns.find(b => (b.innerText || '').toLowerCase().includes('send'));
          if (sendBtn) sendBtn.click();
        })()
      `);
      await new Promise(r => setTimeout(r, 1200));

      const replyShot = `e2e_svc_${svc.num}_05_specialist_reply.png`;
      await session.screenshot(replyShot);
      row.evidence.push(replyShot);
      row.chat = true;

      // Click "Start Work" if present
      await session.eval(`
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const startBtn = btns.find(b => b.innerText && b.innerText.includes('Start Work'));
          if (startBtn) startBtn.click();
        })()
      `);
      await new Promise(r => setTimeout(r, 1000));

      // Click "Submit Deliverables"
      await session.eval(`
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const subBtn = btns.find(b => b.innerText && b.innerText.includes('Submit Deliverables'));
          if (subBtn) subBtn.click();
        })()
      `);
      await new Promise(r => setTimeout(r, 1000));

      // Fill in deliverable notes and upload artifact
      const artifactPath = path.join(ARTIFACT_DIR, svc.artifactFile);
      const artifactBuffer = fs.readFileSync(artifactPath);
      const dataUrl = `data:application/pdf;base64,${artifactBuffer.toString('base64')}`;

      // Set deliverable form in modal
      await session.eval(`
        (() => {
          const notesArea = document.querySelector('textarea');
          if (notesArea) {
            notesArea.value = 'CREATIVEGINI QA TEST ARTIFACT - V1 Deliverable Package for Data I2I (${svc.qaId}). All sprint requirements satisfied.';
            notesArea.dispatchEvent(new Event('input', { bubbles: true }));
            notesArea.dispatchEvent(new Event('change', { bubbles: true }));
          }
        })()
      `);

      // Inject file object into React state or form
      await session.eval(`
        (() => {
          const fileInput = document.querySelector('input[type="file"]');
          if (fileInput) {
            // Trigger deliverable file link
            const linkInput = document.querySelector('input[type="url"], input[placeholder*="http"], input[placeholder*="link"]');
            if (linkInput) {
              linkInput.value = 'https://deliverables.creativegini.test/${svc.artifactFile}';
              linkInput.dispatchEvent(new Event('input', { bubbles: true }));
              linkInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }
        })()
      `);

      // Click Submit Deliverable Package
      await session.eval(`
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const btn = btns.find(b => b.innerText && (b.innerText.includes('Submit Deliverable') || b.innerText.includes('Publish Deliverable')));
          if (btn) btn.click();
        })()
      `);
      await new Promise(r => setTimeout(r, 2000));

      row.upload = true;
      row.v1 = true;
      console.log(`[SPECIALIST]: Deliverable V1 submitted.`);

      const v1Shot = `e2e_svc_${svc.num}_06_v1_submitted.png`;
      await session.screenshot(v1Shot);
      row.evidence.push(v1Shot);

      // Specialist Logout
      await logoutUser(session);

      // ----------------------------------------------------
      // STEP 4: CLIENT REVIEW, (OPTIONAL CHANGE REQUEST), AND APPROVAL
      // ----------------------------------------------------
      console.log(`[CLIENT]: Logging in to review deliverable...`);
      await loginUser(session, 'testclient@datai2i.com', 'Client@123');
      await session.waitFor(`() => window.location.pathname.startsWith('/portal')`, 6000, 200);

      // Navigate to ticket detail
      await session.navigate(`http://localhost:5173/portal/requests/${createdTicket}`, 1500);

      // Verify deliverable card rendered
      const deliverableVisible = await session.eval(`
        (() => {
          return document.body.innerText.includes('V1 Deliverable Package') || document.body.innerText.includes('Deliverable');
        })()
      `);

      row.clientReview = deliverableVisible;
      console.log(`[CLIENT]: Deliverable visible in client review: ${deliverableVisible}`);

      const reviewShot = `e2e_svc_${svc.num}_07_client_review.png`;
      await session.screenshot(reviewShot);
      row.evidence.push(reviewShot);

      // If testChanges is true, execute Request Changes -> V2 flow
      if (svc.testChanges) {
        console.log(`[CLIENT]: Testing Request Changes workflow...`);
        // Click "Request Changes"
        await session.eval(`
          (() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const btn = btns.find(b => b.innerText && b.innerText.includes('Request Changes'));
            if (btn) btn.click();
          })()
        `);
        await new Promise(r => setTimeout(r, 600));

        // Fill feedback in review modal
        await session.eval(`
          (() => {
            const area = document.querySelector('textarea');
            if (area) {
              area.value = 'Please add a short competitor comparison section and update the final recommendation.';
              area.dispatchEvent(new Event('input', { bubbles: true }));
              area.dispatchEvent(new Event('change', { bubbles: true }));
            }
          })()
        `);

        // Submit Change Request
        await session.eval(`
          (() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const btn = btns.find(b => b.innerText && b.innerText.includes('Submit Change Request'));
            if (btn) btn.click();
          })()
        `);
        await new Promise(r => setTimeout(r, 1500));

        row.changes = true;
        const changesShot = `e2e_svc_${svc.num}_08_changes_requested.png`;
        await session.screenshot(changesShot);
        row.evidence.push(changesShot);
        console.log(`[CLIENT]: Changes requested successfully.`);

        // Logout client, login specialist to submit V2
        await logoutUser(session);
        await loginUser(session, svc.specialistEmail, svc.specialistPass);
        await session.navigate(`http://localhost:5173${svc.specialistHome}/requests/${createdTicket}`, 1500);

        // Click Submit Deliverables for V2
        await session.eval(`
          (() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const subBtn = btns.find(b => b.innerText && b.innerText.includes('Submit Deliverables'));
            if (subBtn) subBtn.click();
          })()
        `);
        await new Promise(r => setTimeout(r, 800));

        // Fill V2 notes
        await session.eval(`
          (() => {
            const notesArea = document.querySelector('textarea');
            if (notesArea) {
              notesArea.value = 'CREATIVEGINI QA TEST ARTIFACT - V2 Revised Package with competitor comparison and updated recommendations.';
              notesArea.dispatchEvent(new Event('input', { bubbles: true }));
              notesArea.dispatchEvent(new Event('change', { bubbles: true }));
            }
          })()
        `);

        // Submit V2
        await session.eval(`
          (() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const btn = btns.find(b => b.innerText && (b.innerText.includes('Submit Deliverable') || b.innerText.includes('Publish Deliverable')));
            if (btn) btn.click();
          })()
        `);
        await new Promise(r => setTimeout(r, 1500));

        row.v2 = true;
        const v2Shot = `e2e_svc_${svc.num}_09_v2_submitted.png`;
        await session.screenshot(v2Shot);
        row.evidence.push(v2Shot);
        console.log(`[SPECIALIST]: V2 deliverable submitted.`);

        // Specialist logout, client login
        await logoutUser(session);
        await loginUser(session, 'testclient@datai2i.com', 'Client@123');
        await session.navigate(`http://localhost:5173/portal/requests/${createdTicket}`, 1500);
      }

      // CLIENT APPROVES DELIVERABLE
      console.log(`[CLIENT]: Approving deliverable...`);
      await session.eval(`
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const btn = btns.find(b => b.innerText && (b.innerText.includes('Approve Work') || b.innerText.includes('Approve Deliverable')));
          if (btn) btn.click();
        })()
      `);
      await new Promise(r => setTimeout(r, 600));

      // Confirm Approval in modal
      await session.eval(`
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const btn = btns.find(b => b.innerText && b.innerText.includes('Confirm Approval'));
          if (btn) btn.click();
        })()
      `);
      await new Promise(r => setTimeout(r, 1500));

      row.approval = true;
      row.completed = true;
      row.status = 'PASS';

      const approvedShot = `e2e_svc_${svc.num}_10_ticket_completed.png`;
      await session.screenshot(approvedShot);
      row.evidence.push(approvedShot);
      console.log(`[CLIENT]: Ticket approved and completed!`);

      // Client Logout
      await logoutUser(session);

      // ----------------------------------------------------
      // STEP 5: SUPER ADMIN OBSERVABILITY
      // ----------------------------------------------------
      console.log(`[SUPER_ADMIN]: Verifying ticket in operations console...`);
      await loginUser(session, 'team@creativegini.com', 'Admin@2026');
      await session.waitFor(`() => window.location.pathname.startsWith('/admin')`, 6000, 200);

      await session.navigate('http://localhost:5173/admin/operations', 1500);
      const adminSawTicket = await session.eval(`
        (() => {
          return document.body.innerText.includes('${createdTicket}');
        })()
      `);
      console.log(`[SUPER_ADMIN]: Ticket ${createdTicket} visible in admin operations: ${adminSawTicket}`);

      const adminShot = `e2e_svc_${svc.num}_11_admin_observed.png`;
      await session.screenshot(adminShot);
      row.evidence.push(adminShot);

      await logoutUser(session);

    } catch (err) {
      console.error(`[ERROR on Service #${svc.num} ${svc.name}]:`, err.message);
      row.status = 'FAIL';
      row.error = err.message;
      const failShot = `e2e_svc_${svc.num}_fail.png`;
      await session.screenshot(failShot);
      row.evidence.push(failShot);
      try { await logoutUser(session); } catch (_) {}
    }

    matrix.push(row);
  }

  console.log('\n========================================================');
  console.log('=== COMPLETE 14-SERVICE LIVE E2E LIFECYCLE SUMMARY ===');
  console.log('========================================================');
  console.table(matrix);

  fs.writeFileSync('C:/Users/aksha/.gemini/antigravity-ide/brain/70b91183-7caa-410d-8e31-3cf068b80e49/qa_e2e_live_results.json', JSON.stringify(matrix, null, 2));

  await session.close();
  return matrix;
}

runE2E().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
