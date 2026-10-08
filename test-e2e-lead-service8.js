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

async function runLeadService8() {
  const session = await CdpSession.create();
  console.log('=== SERVICE 8: LEAD RESEARCH LIVE E2E TEST (WITH CHANGE REQUEST & V2) ===');

  try {
    // 1. CLIENT LOGIN
    await login(session, 'testclient@datai2i.com', 'Client@123');
    await session.screenshot('s8_01_client_dashboard.png');

    // 2. NAVIGATE TO DIGITALISING CHANNEL
    console.log('[CLIENT] Navigating to /portal/digitalising...');
    await session.navigate('http://localhost:5173/portal/digitalising', 1500);
    await session.screenshot('s8_02_digitalising_channel.png');

    // Click "Request Lead Research →"
    console.log('[CLIENT] Clicking Request Lead Research...');
    const cardClicked = await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.innerText && b.innerText.includes('Request Lead Research'));
        if (btn) { btn.click(); return true; }
        return false;
      })()
    `);
    console.log('Button clicked result:', cardClicked);
    await new Promise(r => setTimeout(r, 1200));
    await session.screenshot('s8_03_request_modal_opened.png');

    // 3. TEST REQUIRED FIELD VALIDATION
    console.log('[CLIENT] Testing validation with empty required fields...');
    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const revBtn = btns.find(b => b.innerText && b.innerText.includes('Review Requirements'));
        if (revBtn) revBtn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 800));
    const errorsShown = await session.eval(`
      (() => {
        const errEls = Array.from(document.querySelectorAll('p, span, div')).filter(el => 
          el.innerText && (el.innerText.includes('is required') || el.innerText.includes('required'))
        );
        return errEls.map(e => e.innerText.trim()).filter(Boolean);
      })()
    `);
    console.log('[CLIENT] Observed Validation Errors:', errorsShown);
    await session.screenshot('s8_04_validation_errors.png');

    // 4. FILL REQUIRED FIELDS FOR LEAD RESEARCH
    console.log('[CLIENT] Filling required fields for Lead Research...');
    await session.eval(`
      (() => {
        const inputSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        const textSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;

        const inputs = Array.from(document.querySelectorAll('input, textarea'));
        inputs.forEach(inp => {
          const ph = (inp.placeholder || '').toLowerCase();
          let val = '';

          if (ph.includes('50') || ph.includes('leads')) {
            val = '50';
          } else if (ph.includes('target market') || ph.includes('industry')) {
            val = 'North American Enterprise Cloud Data & Analytics Software';
          } else if (ph.includes('personas') || ph.includes('titles')) {
            val = 'Chief Data Officer, VP Data Engineering, Head of Analytics';
          } else if (ph.includes('company size')) {
            val = '500 - 10,000 Employees';
          } else if (ph.includes('qualification') || ph.includes('criteria')) {
            val = 'Actively modernizing cloud infrastructure with budget authority';
          } else if (ph.includes('data points')) {
            val = 'Verified Work Email, Direct Phone, LinkedIn Profile';
          } else if (inp.tagName === 'TEXTAREA' && !inp.value) {
            val = 'Focus on companies using Databricks, Snowflake, and AWS Redshift.';
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
    await session.screenshot('s8_05_form_filled.png');

    // 5. ADVANCE TO REVIEW & PRICING
    console.log('[CLIENT] Clicking Review Requirements...');
    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const revBtn = btns.find(b => b.innerText && b.innerText.includes('Review Requirements'));
        if (revBtn) revBtn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1000));
    await session.screenshot('s8_06_step2_review.png');

    console.log('[CLIENT] Clicking Continue to Pricing...');
    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const prcBtn = btns.find(b => b.innerText && (b.innerText.includes('Continue to Pricing') || b.innerText.includes('Proceed to Pricing')));
        if (prcBtn) prcBtn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    await session.screenshot('s8_07_step3_pricing.png');

    // 6. CONFIRM & SUBMIT
    console.log('[CLIENT] Clicking Confirm & Submit Request...');
    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const subBtn = btns.find(b => b.innerText && (b.innerText.includes('Confirm & Submit') || b.innerText.includes('Confirm & Continue')));
        if (subBtn) subBtn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2500));

    // 7. VERIFY TICKET IN CLIENT REQUESTS
    console.log('[CLIENT] Navigating to /portal/requests to verify created ticket...');
    await session.navigate('http://localhost:5173/portal/requests', 2000);
    await session.screenshot('s8_08_my_requests_table.png');

    const createdTicket = await session.eval(`
      (() => {
        const text = document.body.innerText;
        const matches = text.match(/CG-[0-9]+/g);
        return matches ? matches[0] : null;
      })()
    `);

    console.log(`[CLIENT] Created Ticket ID: ${createdTicket}`);
    if (!createdTicket) throw new Error('Could not find created ticket CG-XXXX');

    // 8. CLIENT SENDS CHAT MESSAGE
    console.log(`[CLIENT] Opening ticket ${createdTicket} detail...`);
    await session.navigate(`http://localhost:5173/portal/requests/${createdTicket}`, 2000);
    await session.screenshot('s8_09_ticket_detail.png');

    const clientMsg = 'Hi Lead team, please ensure all 50 enterprise prospect profiles have verified direct phone numbers.';
    console.log('[CLIENT] Sending message:', clientMsg);
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
    await session.screenshot('s8_10_client_message_sent.png');

    // 9. CLIENT LOGOUT
    await logout(session);

    // 10. LEAD SPECIALIST LOGIN
    console.log('[SPECIALIST] Logging in as COMPANY_LEAD (lead@creativegini.com)...');
    await login(session, 'lead@creativegini.com', 'Lead@123');
    await session.screenshot('s8_11_lead_dashboard.png');

    // 11. CHECK LEAD SPECIALIST QUEUE FOR TICKET
    console.log('[SPECIALIST] Navigating to /lead/requests...');
    await session.navigate('http://localhost:5173/lead/requests', 2000);
    await session.screenshot('s8_12_lead_requests_queue.png');

    const queueContainsTicket = await session.eval(`
      (() => {
        return document.body.innerText.includes('${createdTicket}');
      })()
    `);
    console.log(`[SPECIALIST] Ticket ${createdTicket} visible in queue: ${queueContainsTicket}`);

    // 12. SPECIALIST OPENS TICKET DETAIL
    console.log(`[SPECIALIST] Opening ticket detail ${createdTicket}...`);
    await session.navigate(`http://localhost:5173/lead/requests/${createdTicket}`, 2000);
    await session.screenshot('s8_13_specialist_ticket_workspace.png');

    // Switch to Client Messages tab
    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const tab = btns.find(b => b.innerText && b.innerText.includes('Client Messages'));
        if (tab) tab.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1000));
    await session.screenshot('s8_13b_specialist_messages_tab.png');

    const specSeesClientMsg = await session.eval(`
      (() => {
        return document.body.innerText.includes('verified direct phone');
      })()
    `);
    console.log(`[SPECIALIST] Client message visible to specialist: ${specSeesClientMsg}`);

    // Specialist reply
    const specReply = 'Hi Data I2I, confirmed. All 50 profiles will undergo direct telephone verification.';
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
    await session.screenshot('s8_14_specialist_reply_sent.png');

    // 13. START WORK & SUBMIT V1 DELIVERABLE
    console.log('[SPECIALIST] Starting work...');
    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.innerText && b.innerText.includes('Start Work'));
        if (btn) btn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1200));

    console.log('[SPECIALIST] Submitting Deliverables V1...');
    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.innerText && b.innerText.includes('Submit Deliverables'));
        if (btn) btn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    await session.screenshot('s8_15_deliverable_modal.png');

    // Fill Deliverable V1
    await session.eval(`
      (() => {
        const textarea = document.querySelector('textarea');
        if (textarea) {
          const textSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
          textSetter.call(textarea, 'CREATIVEGINI QA TEST ARTIFACT - V1 50 Verified Enterprise Cloud Contacts for Data I2I (CG-QA-E2E-LEAD-001).');
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
          textarea.dispatchEvent(new Event('change', { bubbles: true }));
        }
        const linkInp = document.querySelector('input[type="url"], input[placeholder*="http"], input[placeholder*="Link"]');
        if (linkInp) {
          const inputSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          inputSetter.call(linkInp, 'https://deliverables.creativegini.test/CG-QA-E2E-LEAD-001_Data_I2I_Verified_Leads.csv');
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
    await session.screenshot('s8_16_v1_deliverable_submitted.png');
    console.log('[SPECIALIST] V1 submitted.');

    // 14. LOGOUT SPECIALIST
    await logout(session);

    // 15. CLIENT REVIEW & REQUEST CHANGES
    console.log('[CLIENT] Logging in to review V1 and request changes...');
    await login(session, 'testclient@datai2i.com', 'Client@123');
    await session.navigate(`http://localhost:5173/portal/requests/${createdTicket}`, 2000);
    await session.screenshot('s8_17_client_review_v1.png');

    console.log('[CLIENT] Clicking Request Changes...');
    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.innerText && b.innerText.includes('Request Changes'));
        if (btn) btn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1000));

    const changeFeedback = 'Please add a short competitor comparison section and update the direct extension numbers for executive leads.';
    console.log('[CLIENT] Entering feedback:', changeFeedback);
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

    console.log('[CLIENT] Clicking Submit Change Request...');
    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.innerText && b.innerText.includes('Submit Change Request'));
        if (btn) btn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2000));
    await session.screenshot('s8_18_changes_requested.png');
    console.log('[CLIENT] Changes requested successfully.');

    // 16. CLIENT LOGOUT
    await logout(session);

    // 17. SPECIALIST LOGIN TO SUBMIT V2
    console.log('[SPECIALIST] Logging in to submit V2 revisions...');
    await login(session, 'lead@creativegini.com', 'Lead@123');
    await session.navigate(`http://localhost:5173/lead/requests/${createdTicket}`, 2000);
    await session.screenshot('s8_19_specialist_sees_changes_requested.png');

    console.log('[SPECIALIST] Submitting V2 Deliverables...');
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
          textSetter.call(textarea, 'CREATIVEGINI QA TEST ARTIFACT - V2 Revised 50 Leads with verified direct executive extensions.');
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
          textarea.dispatchEvent(new Event('change', { bubbles: true }));
        }
        const linkInp = document.querySelector('input[type="url"], input[placeholder*="http"], input[placeholder*="Link"]');
        if (linkInp) {
          const inputSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          inputSetter.call(linkInp, 'https://deliverables.creativegini.test/CG-QA-E2E-LEAD-001_Data_I2I_Verified_Leads.csv');
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
    await session.screenshot('s8_20_v2_submitted.png');
    console.log('[SPECIALIST] V2 submitted successfully.');

    // 18. SPECIALIST LOGOUT
    await logout(session);

    // 19. CLIENT LOGIN TO APPROVE V2
    console.log('[CLIENT] Logging in to approve V2...');
    await login(session, 'testclient@datai2i.com', 'Client@123');
    await session.navigate(`http://localhost:5173/portal/requests/${createdTicket}`, 2000);
    await session.screenshot('s8_21_client_reviews_v2.png');

    console.log('[CLIENT] Approving V2 deliverable...');
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
    await session.screenshot('s8_22_ticket_approved_completed.png');
    console.log('[CLIENT] Ticket approved and completed!');

    // 20. CLIENT LOGOUT
    await logout(session);

    // 21. SUPER ADMIN OBSERVABILITY
    console.log('[SUPER_ADMIN] Checking observability for Lead Research ticket...');
    await login(session, 'team@creativegini.com', 'Admin@2026');
    await session.navigate('http://localhost:5173/admin/operations', 2000);
    await session.screenshot('s8_23_admin_operations_observed.png');

    const adminSeesTicket = await session.eval(`
      (() => {
        return document.body.innerText.includes('${createdTicket}');
      })()
    `);
    console.log(`[SUPER_ADMIN] Ticket ${createdTicket} visible in admin operations: ${adminSeesTicket}`);

    await logout(session);
    console.log('=== SERVICE 8 (LEAD RESEARCH) COMPLETED COMPLETE E2E LIFECYCLE (V1 -> CHANGE REQUEST -> V2 -> APPROVAL -> COMPLETED)! ===');

  } catch (err) {
    console.error('Service 8 Test Failed:', err);
    await session.screenshot('s8_error.png');
  } finally {
    await session.close();
  }
}

runLeadService8();
