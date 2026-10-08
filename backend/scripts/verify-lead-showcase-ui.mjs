import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = path.resolve('..', 'qa-reports', 'qa_screenshots');
const DEBUG_PORT = 9225;

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
        console.error('WS parse error:', err);
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

  async close() {
    if (this.ws) this.ws.close();
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  console.log('[E2E-UI] Launching headless Chrome on port ' + DEBUG_PORT + '...');
  const chromeProc = spawn(CHROME_PATH, [
    `--remote-debugging-port=${DEBUG_PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-extensions',
    '--window-size=1440,960',
    '--user-data-dir=' + path.resolve('..', '.chrome-temp-' + Date.now()),
  ]);

  await sleep(1500);

  try {
    const versionRes = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
    const versionData = await versionRes.json();
    const wsUrl = versionData.webSocketDebuggerUrl;

    const cdp = new CDPClient(wsUrl);
    await cdp.connect();
    console.log('[E2E-UI] Connected to Chrome via CDP');

    await cdp.send('Target.setDiscoverTargets', { discover: true });
    const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });

    async function sendSession(method, params = {}) {
      return cdp.send('Target.sendMessageToTarget', {
        sessionId,
        message: JSON.stringify({ id: cdp.id++, method, params }),
      });
    }

    // Direct page CDP wrapper
    const targetsRes = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
    const targets = await targetsRes.json();
    const pageTarget = targets.find((t) => t.type === 'page');
    const pageCdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await pageCdp.connect();

    await pageCdp.send('Page.enable');
    await pageCdp.send('DOM.enable');
    await pageCdp.send('Runtime.enable');
    await pageCdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 960,
      deviceScaleFactor: 1,
      mobile: false,
    });

    // Helper to capture screenshot
    async function screenshot(name) {
      const { data } = await pageCdp.send('Page.captureScreenshot', { format: 'png' });
      const filePath = path.join(SCREENSHOT_DIR, `${name}.png`);
      fs.writeFileSync(filePath, Buffer.from(data, 'base64'));
      console.log(`[E2E-UI] Screenshot saved: ${name}.png`);
    }

    // 1. Authenticate as Lead Specialist
    console.log('[E2E-UI] Step 1: Authenticating as Lead Specialist via API...');
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'lead@creativegini.com', password: 'Lead@123' }),
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('[E2E-UI] Authenticated. Token received:', Boolean(token));

    // Navigate to origin first to allow localStorage access
    await pageCdp.send('Page.navigate', { url: 'http://localhost:5173/' });
    await sleep(1500);

    // Set token in localStorage
    await pageCdp.send('Runtime.evaluate', {
      expression: `localStorage.setItem('cg_auth_token', '${token}');`,
    });
    await sleep(500);

    // 2. Visit Lead Showcases Page
    console.log('[E2E-UI] Step 2: Navigating to /lead/showcases...');
    await pageCdp.send('Page.navigate', { url: 'http://localhost:5173/lead/showcases' });
    await sleep(3000);
    await screenshot('19_lead_showcases_studio');

    // 3. Visit Public Sample Showcase (data-i2i)
    console.log('[E2E-UI] Step 3: Navigating to public sample showcase /samples/data-i2i...');
    await pageCdp.send('Page.navigate', { url: 'http://localhost:5173/samples/data-i2i' });
    await sleep(3000);

    // Scroll down to show Row View Leads
    await pageCdp.send('Runtime.evaluate', {
      expression: `window.scrollTo({ top: 620, behavior: 'instant' });`
    });
    await sleep(1000);
    await screenshot('20_public_sample_row_view');

    // 4. Click first lead row to open Lead Dossier Card Modal
    console.log('[E2E-UI] Step 4: Clicking lead row to open Lead Dossier Card modal...');
    const clickedInspect = await pageCdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const spans = Array.from(document.querySelectorAll('span'));
          const inspectSpan = spans.find(s => s.textContent && s.textContent.includes('Inspect Card'));
          if (inspectSpan) {
            // Click the span and also trigger on the parent container
            inspectSpan.click();
            let parent = inspectSpan.parentElement;
            while (parent && !parent.onclick && parent.tagName !== 'BODY') {
              parent.click();
              parent = parent.parentElement;
            }
            return true;
          }
          return false;
        })()
      `,
      returnByValue: true,
    });
    console.log('[E2E-UI] Clicked Inspect Card:', clickedInspect.result?.value);
    await sleep(2000);
    await screenshot('21_lead_dossier_card_modal');

    console.log('[E2E-UI] All screenshots captured successfully in qa-reports/qa_screenshots/!');

    await pageCdp.close();
    await cdp.close();
  } finally {
    chromeProc.kill('SIGKILL');
  }
}

main().catch((err) => {
  console.error('[E2E-UI] Error:', err);
  process.exit(1);
});
