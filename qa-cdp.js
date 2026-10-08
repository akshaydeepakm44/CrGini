import fs from 'fs';
import path from 'path';

export const SCREENSHOT_DIR = 'C:/Users/aksha/.gemini/antigravity-ide/brain/70b91183-7caa-410d-8e31-3cf068b80e49/qa-screenshots';

export class CdpSession {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.callbacks = new Map();
  }

  static async create() {
    // 1. Create a new target page or find existing
    const pagesRes = await fetch('http://127.0.0.1:9222/json/list');
    let pages = await pagesRes.json();
    let page = pages.find(p => p.type === 'page');
    if (!page) {
      const newPageRes = await fetch('http://127.0.0.1:9222/json/new?about:blank');
      page = await newPageRes.json();
    }
    const session = new CdpSession(page.webSocketDebuggerUrl);
    await session.init();
    await session.send('Page.enable');
    await session.send('DOM.enable');
    await session.send('Runtime.enable');
    return session;
  }

  init() {
    return new Promise((resolve, reject) => {
      this.ws = new globalThis.WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const { resolve, reject } = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) {
            reject(new Error(msg.error.message || JSON.stringify(msg.error)));
          } else {
            resolve(msg.result);
          }
        }
      };
    });
  }

  send(method, params = {}) {
    const id = this.id++;
    return new Promise((resolve, reject) => {
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async navigate(url, waitMs = 2500) {
    await this.send('Page.navigate', { url });
    await new Promise(r => setTimeout(r, waitMs));
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.text || JSON.stringify(res.exceptionDetails));
    }
    return res.result?.value;
  }

  async click(selector, waitAfter = 1000) {
    const clicked = await this.eval(`
      (() => {
        const el = document.querySelector(${JSON.stringify(selector)});
        if (!el) return false;
        el.scrollIntoView({ behavior: 'instant', block: 'center' });
        el.click();
        return true;
      })()
    `);
    if (!clicked) {
      throw new Error('Element not found to click: ' + selector);
    }
    await new Promise(r => setTimeout(r, waitAfter));
  }

  async type(selector, text, clear = true) {
    await this.eval(`
      (() => {
        const el = document.querySelector(${JSON.stringify(selector)});
        if (!el) throw new Error('Element not found: ' + ${JSON.stringify(selector)});
        el.focus();
        if (${clear}) {
          el.value = '';
          const proto = Object.getPrototypeOf(el);
          const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set || Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
          if (setter) setter.call(el, '');
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }
      })()
    `);
    await this.send('Input.insertText', { text });
    await this.eval(`
      (() => {
        const el = document.querySelector(${JSON.stringify(selector)});
        if (el) {
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }
      })()
    `);
    await new Promise(r => setTimeout(r, 200));
  }

  async screenshot(filename) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const fname = filename.endsWith('.png') ? filename : `${filename}.png`;
    const filePath = path.join(SCREENSHOT_DIR, fname);
    fs.writeFileSync(filePath, Buffer.from(res.data, 'base64'));

    const altDir = path.resolve('d:/Creativegini/CrGini/qa-reports/qa_screenshots');
    if (!fs.existsSync(altDir)) fs.mkdirSync(altDir, { recursive: true });
    fs.writeFileSync(path.join(altDir, fname), Buffer.from(res.data, 'base64'));

    console.log(`[Screenshot Captured]: ${filename} -> ${filePath}`);
    return filePath;
  }

  async waitFor(predicateFnStr, timeout = 10000, interval = 300) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      try {
        const result = await this.eval(`(${predicateFnStr})()`);
        if (result) return result;
      } catch (_) {}
      await new Promise(r => setTimeout(r, interval));
    }
    throw new Error('Timeout waiting for predicate: ' + predicateFnStr);
  }

  async close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}
