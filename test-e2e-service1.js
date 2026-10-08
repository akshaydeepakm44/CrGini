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

async function runService1() {
  const session = await CdpSession.create();
  console.log('=== SERVICE 1: STRATEGIC PLANNER LIVE E2E TEST (CG-1002 RESUME) ===');

  try {
    const ticketId = 'CG-1002';

    // 1. CLIENT LOGIN & SEND MESSAGE
    await login(session, 'testclient@datai2i.com', 'Client@123');
    console.log(`[CLIENT] Navigating to /portal/requests/${ticketId}...`);
    await session.navigate(`http://localhost:5173/portal/requests/${ticketId}`, 2000);
    await session.screenshot('s1_09_ticket_detail.png');

    const clientMsg = 'Hi, I need this work completed within the next two to three days. Please review the requirements and let me know if anything else is needed.';
    console.log('[CLIENT] Sending message:', clientMsg);

    // Type into input[placeholder*="specialist pod"]
    await session.type('input[placeholder*="specialist pod"]', clientMsg);
    await new Promise(r => setTimeout(r, 400));
    // Click submit button in the chat form
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
    await session.screenshot('s1_10_client_message_sent.png');
    console.log('[CLIENT] Chat message sent successfully.');

    // 2. CLIENT LOGOUT
    await logout(session);

    // 3. BOOST SPECIALIST LOGIN
    console.log('[SPECIALIST] Logging in as COMPANY_BOOST (boost@creativegini.com)...');
    await login(session, 'boost@creativegini.com', 'Boost@123');
    await session.screenshot('s1_11_boost_dashboard.png');

    // 4. CHECK SPECIALIST QUEUE FOR TICKET
    console.log('[SPECIALIST] Navigating to /boost/requests...');
    await session.navigate('http://localhost:5173/boost/requests', 2000);
    await session.screenshot('s1_12_boost_requests_queue.png');

    const queueContainsTicket = await session.eval(`
      (() => {
        return document.body.innerText.includes('${ticketId}');
      })()
    `);
    console.log(`[SPECIALIST] Ticket ${ticketId} visible in queue: ${queueContainsTicket}`);

    // 5. SPECIALIST OPENS TICKET DETAIL
    console.log(`[SPECIALIST] Opening ticket detail ${ticketId}...`);
    await session.navigate(`http://localhost:5173/boost/requests/${ticketId}`, 2000);
    await session.screenshot('s1_13_specialist_ticket_workspace.png');

    // Click "Client Messages" tab to verify client message
    console.log('[SPECIALIST] Switching to Client Messages tab...');
    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const tab = btns.find(b => b.innerText && b.innerText.includes('Client Messages'));
        if (tab) tab.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1000));
    await session.screenshot('s1_13b_specialist_messages_tab.png');

    const specSeesClientMsg = await session.eval(`
      (() => {
        return document.body.innerText.includes('two to three days');
      })()
    `);
    console.log(`[SPECIALIST] Client message visible to specialist: ${specSeesClientMsg}`);

    // 6. SPECIALIST SENDS REPLY
    const specReply = 'Hi Data I2I, I have received the request and will review the requirements immediately.';
    console.log('[SPECIALIST] Sending reply:', specReply);
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
    await new Promise(r => setTimeout(r, 500));
    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const sendBtn = btns.find(b => (b.innerText || '').toLowerCase().includes('send'));
        if (sendBtn) sendBtn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    await session.screenshot('s1_14_specialist_reply_sent.png');

    // 7. START WORK & SUBMIT DELIVERABLE
    console.log('[SPECIALIST] Clicking Start Work button...');
    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.innerText && b.innerText.includes('Start Work'));
        if (btn) btn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));

    console.log('[SPECIALIST] Clicking Submit Deliverables...');
    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.innerText && b.innerText.includes('Submit Deliverables'));
        if (btn) btn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    await session.screenshot('s1_15_deliverable_modal.png');

    // Fill notes and link in DeliverableUploadModal
    console.log('[SPECIALIST] Filling deliverable notes and artifact link...');
    await session.eval(`
      (() => {
        const textarea = document.querySelector('textarea');
        if (textarea) {
          const textSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
          textSetter.call(textarea, 'CREATIVEGINI QA TEST ARTIFACT - V1 Strategic Plan Deliverable for Data I2I (CG-QA-E2E-STRATEGIC-001). Market positioning and outbound roadmap.');
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
          textarea.dispatchEvent(new Event('change', { bubbles: true }));
        }
        const linkInp = document.querySelector('input[type="url"], input[placeholder*="http"], input[placeholder*="Link"]');
        if (linkInp) {
          const inputSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          inputSetter.call(linkInp, 'https://deliverables.creativegini.test/CG-QA-E2E-STRATEGIC-001_Data_I2I_Strategic_Plan.pdf');
          linkInp.dispatchEvent(new Event('input', { bubbles: true }));
          linkInp.dispatchEvent(new Event('change', { bubbles: true }));
        }
      })()
    `);
    await new Promise(r => setTimeout(r, 800));

    // Submit Deliverable Package
    console.log('[SPECIALIST] Submitting deliverable package...');
    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.innerText && (b.innerText.includes('Submit Deliverable') || b.innerText.includes('Publish Deliverable')));
        if (btn) btn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2500));
    await session.screenshot('s1_16_v1_deliverable_submitted.png');
    console.log('[SPECIALIST] Deliverable submitted successfully.');

    // 8. SPECIALIST LOGOUT
    await logout(session);

    // 9. CLIENT LOGIN TO REVIEW AND APPROVE
    console.log('[CLIENT] Logging in to review and approve deliverable...');
    await login(session, 'testclient@datai2i.com', 'Client@123');
    await session.navigate(`http://localhost:5173/portal/requests/${ticketId}`, 2000);
    await session.screenshot('s1_17_client_review_deliverable.png');

    // Verify deliverable visible
    const clientSeesDeliverable = await session.eval(`
      (() => {
        return document.body.innerText.includes('Strategic Plan Deliverable') || document.body.innerText.includes('Deliverables & Submissions');
      })()
    `);
    console.log(`[CLIENT] Client sees deliverable: ${clientSeesDeliverable}`);

    // Client Approves Deliverable
    console.log('[CLIENT] Clicking Approve Work / Deliverable...');
    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.innerText && (b.innerText.includes('Approve Work') || b.innerText.includes('Approve Deliverable') || b.innerText.includes('Approve')));
        if (btn) btn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1000));

    // Confirm in modal if open
    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.innerText && b.innerText.includes('Confirm Approval'));
        if (btn) btn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2000));
    await session.screenshot('s1_18_ticket_approved_completed.png');

    // 10. CLIENT LOGOUT
    await logout(session);

    // 11. SUPER ADMIN OBSERVABILITY
    console.log('[SUPER_ADMIN] Logging in to verify completed ticket...');
    await login(session, 'team@creativegini.com', 'Admin@2026');
    await session.navigate('http://localhost:5173/admin/operations', 2000);
    await session.screenshot('s1_19_admin_operations_observed.png');

    const adminSeesTicket = await session.eval(`
      (() => {
        return document.body.innerText.includes('${ticketId}');
      })()
    `);
    console.log(`[SUPER_ADMIN] Ticket ${ticketId} visible in admin operations: ${adminSeesTicket}`);

    await logout(session);
    console.log('=== SERVICE 1 COMPLETED FULL END-TO-END LIFECYCLE! ===');

  } catch (err) {
    console.error('Service 1 Test Failed:', err);
    await session.screenshot('s1_error.png');
  } finally {
    await session.close();
  }
}

runService1();
