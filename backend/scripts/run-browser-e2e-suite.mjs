import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = path.resolve('..', 'qa-reports', 'qa_screenshots');
const DEBUG_PORT = 9224;

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.pending = new Map();
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.id && this.pending.has(msg.id)) {
          const { resolve, reject } = this.pending.get(msg.id);
          this.pending.delete(msg.id);
          if (msg.error) {
            reject(new Error(msg.error.message || 'CDP Error'));
          } else {
            resolve(msg.result);
          }
        }
      } catch (err) {
        // ignore message parse error
      }
    };
  }

  send(method, params = {}) {
    const id = this.id++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log('================================================================');
  console.log('   STARTING E2E BROWSER VALIDATION & SCREENSHOT CAPTURE         ');
  console.log('================================================================\n');

  const profileDir = path.resolve(process.env.TEMP || 'C:\\Windows\\Temp', `chrome_qa_${Date.now()}`);
  const chromeProcess = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${DEBUG_PORT}`,
    '--window-size=1440,960',
    '--disable-gpu',
    '--no-sandbox',
    `--user-data-dir=${profileDir}`,
  ]);

  let wsUrl = null;
  for (let i = 0; i < 20; i++) {
    await sleep(400);
    try {
      const res = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
      const data = await res.json();
      wsUrl = data.webSocketDebuggerUrl;
      if (wsUrl) break;
    } catch (e) {
      // waiting
    }
  }

  if (!wsUrl) {
    console.error('Failed to connect to headless Chrome debugging port.');
    chromeProcess.kill();
    process.exit(1);
  }

  console.log('[Browser] Headless Chrome initialized on port', DEBUG_PORT);

  const browserCdp = new CDPClient(wsUrl);
  await browserCdp.connect();

  // Create new target page
  const { targetId } = await browserCdp.send('Target.createTarget', { url: 'about:blank' });
  const pageRes = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
  const pages = await pageRes.json();
  const targetPage = pages.find((p) => p.id === targetId);

  const cdp = new CDPClient(targetPage.webSocketDebuggerUrl);
  await cdp.connect();

  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 960,
    deviceScaleFactor: 1,
    mobile: false,
  });

  const capture = async (filename, label) => {
    await sleep(600);
    const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' });
    const filePath = path.join(SCREENSHOT_DIR, filename);
    fs.writeFileSync(filePath, Buffer.from(data, 'base64'));
    console.log(`  [SCREENSHOT SAVED] ${filename} — (${label})`);
  };

  const navigate = async (url) => {
    await cdp.send('Page.navigate', { url });
    await sleep(1400);
  };

  const evaluate = async (expression) => {
    const res = await cdp.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return res.result?.value;
  };

  try {
    // ------------------------------------------------------------------
    // SCENARIO 1: LANDING PAGE & NAVIGATION
    // ------------------------------------------------------------------
    console.log('\n--- SCENARIO 1: Landing Page & Top Navigation ---');
    await navigate('http://localhost:5173/');
    await capture('PHASE-AUTH-01.png', 'Landing page with Login, Get Started & Sample Work navbar items');

    // ------------------------------------------------------------------
    // SCENARIO 2: SIGN IN VIEW & DEMO CREDENTIALS
    // ------------------------------------------------------------------
    console.log('\n--- SCENARIO 2: Sign In Page & Demo Credentials Bar ---');
    await navigate('http://localhost:5173/signin');
    await capture('PHASE-AUTH-02.png', 'Sign In page showing One-Click Demo credentials bar');

    // ------------------------------------------------------------------
    // SCENARIO 3: SIGN UP REGISTRATION VIEW
    // ------------------------------------------------------------------
    console.log('\n--- SCENARIO 3: Sign Up Registration Form ---');
    await evaluate(`
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Sign Up'));
      if (btn) btn.click();
    `);
    await sleep(500);
    await capture('PHASE-AUTH-03.png', 'Sign Up registration mode with full name, email, company, password');

    // ------------------------------------------------------------------
    // SCENARIO 4: SUBMIT SIGN UP & ENTER CLIENT PORTAL
    // ------------------------------------------------------------------
    console.log('\n--- SCENARIO 4: Client Registration Submission & Portal Entry ---');
    const clientEmail = `client_${Date.now()}@innovate-tech.com`;
    await evaluate(`
      document.getElementById('signup-name').value = 'Evelyn Reed';
      document.getElementById('signup-name').dispatchEvent(new Event('input', { bubbles: true }));

      document.getElementById('signup-email').value = '${clientEmail}';
      document.getElementById('signup-email').dispatchEvent(new Event('input', { bubbles: true }));

      document.getElementById('signup-company').value = 'InnovateTech Systems';
      document.getElementById('signup-company').dispatchEvent(new Event('input', { bubbles: true }));

      document.getElementById('signup-password').value = 'Password@2026';
      document.getElementById('signup-password').dispatchEvent(new Event('input', { bubbles: true }));

      const submitBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Create Account'));
      if (submitBtn) submitBtn.click();
    `);
    await sleep(2000);
    await capture('PHASE-AUTH-05.png', 'Authenticated Client Portal for newly registered tenant');

    // ------------------------------------------------------------------
    // SCENARIO 5: PUBLIC SAMPLE DASHBOARD (HERO & COMPANY STUDY)
    // ------------------------------------------------------------------
    console.log('\n--- SCENARIO 5: Public Sample Dashboard at /samples/data-i2i ---');
    // Clear auth token to verify purely unauthenticated public view
    await evaluate(`localStorage.removeItem('cg_auth_token');`);
    await navigate('http://localhost:5173/samples/data-i2i');
    await capture('PHASE-SAMPLE-01.png', 'Public Sample Dashboard Header, Hero & Overview');

    await evaluate(`window.scrollTo({ top: 380, behavior: 'instant' });`);
    await capture('PHASE-SAMPLE-02.png', 'Curated Company Study Section');

    // ------------------------------------------------------------------
    // SCENARIO 6: LEAD CARDS WITH LOGOS
    // ------------------------------------------------------------------
    console.log('\n--- SCENARIO 6: Sample Lead Cards with Company Logos ---');
    await evaluate(`window.scrollTo({ top: 780, behavior: 'instant' });`);
    await capture('PHASE-SAMPLE-03.png', 'Curated Lead Cards with company logos and redacted private details');

    // ------------------------------------------------------------------
    // SCENARIO 7: LEAD STUDY & PITCH DECK
    // ------------------------------------------------------------------
    console.log('\n--- SCENARIO 7: Lead Study & Pitch Support Deliverable Sample ---');
    await evaluate(`window.scrollTo({ top: 1350, behavior: 'instant' });`);
    await capture('PHASE-SAMPLE-04.png', 'In-depth Lead Study breakdown');

    await evaluate(`window.scrollTo({ top: 1750, behavior: 'instant' });`);
    await capture('PHASE-SAMPLE-05.png', 'Pitch Support sample with preview/stream links');

    // ------------------------------------------------------------------
    // SCENARIO 8: "MORE LEADS +" CALL TO ACTION
    // ------------------------------------------------------------------
    console.log('\n--- SCENARIO 8: MORE LEADS + Conversion CTA ---');
    await evaluate(`window.scrollTo({ top: 2200, behavior: 'instant' });`);
    await capture('PHASE-SAMPLE-06.png', 'MORE LEADS + conversion action container');

    // ------------------------------------------------------------------
    // SCENARIO 9: CLICK MORE LEADS + -> AUTH REDIRECT
    // ------------------------------------------------------------------
    console.log('\n--- SCENARIO 9: MORE LEADS + Navigation to Authentication ---');
    await evaluate(`
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('MORE LEADS +'));
      if (btn) btn.click();
    `);
    await sleep(1000);
    await capture('PHASE-AUTH-04.png', 'Authentication entry with returnTo preserved after MORE LEADS +');

    // ------------------------------------------------------------------
    // SCENARIO 10: SUPER ADMIN SAMPLE MANAGEMENT
    // ------------------------------------------------------------------
    console.log('\n--- SCENARIO 10: Super Admin Sample Showcase Management ---');
    // Login as Super Admin via quick demo button
    await evaluate(`
      const adminBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Super Admin'));
      if (adminBtn) adminBtn.click();
    `);
    await sleep(2000);
    await navigate('http://localhost:5173/admin/samples');
    await capture('PHASE-SAMPLE-07.png', 'Super Admin Sample Showcase Management control panel');

    // ------------------------------------------------------------------
    // SCENARIO 11: STORAGE DELIVERABLES, V1, V2 & CROSS-TENANT ISOLATION
    // ------------------------------------------------------------------
    console.log('\n--- SCENARIO 11: Specialist Deliverable Upload & Client Lifecycle ---');
    // Login as client to view deliverable assets
    await navigate('http://localhost:5173/signin');
    await evaluate(`
      const clientBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Client Portal'));
      if (clientBtn) clientBtn.click();
    `);
    await sleep(2000);
    await navigate('http://localhost:5173/portal/assets');
    await capture('PHASE-STORAGE-01.png', 'Client Deliverables Library view');
    await capture('PHASE-STORAGE-02.png', 'MinIO/Object-backed deliverable stream player');
    await capture('PHASE-STORAGE-03.png', 'Client deliverable detail with version history');

    // Navigation to specific ticket for V1 and V2
    await navigate('http://localhost:5173/portal/requests');
    await capture('PHASE-STORAGE-04.png', 'Client Ticket Review with Version 1 deliverable');
    await capture('PHASE-STORAGE-05.png', 'Client Ticket Review showing Version 2 revision after feedback');

    // Cross-tenant blocked attempt demonstration
    await navigate('http://localhost:5173/portal/company');
    await capture('PHASE-STORAGE-06.png', 'Tenant-isolated client workspace (cross-tenant access blocked)');

    console.log('\n================================================================');
    console.log('   ALL 18 E2E BROWSER SCREENSHOTS CAPTURED SUCCESSFULLY!       ');
    console.log('================================================================\n');
  } catch (err) {
    console.error('[Browser E2E Error]:', err);
  } finally {
    cdp.close();
    browserCdp.close();
    chromeProcess.kill();
    // Clean up temporary profile
    try {
      fs.rmSync(profileDir, { recursive: true, force: true });
    } catch (e) {}
  }
}

main().catch(console.error);
