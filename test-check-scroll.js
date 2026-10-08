import { CdpSession } from './qa-cdp.js';
import fs from 'fs';

async function testScroll() {
  const session = await CdpSession.create();
  
  // 1. Test /boost/messages first since already logged in as Boost
  console.log('Testing /boost/messages...');
  await session.navigate('http://localhost:5173/boost/messages', 2500);
  
  let boostScroll = await session.eval(`
    (() => {
      const main = document.querySelector('main');
      const doc = document.documentElement;
      return {
        url: window.location.href,
        windowHeight: window.innerHeight,
        mainScrollHeight: main ? main.scrollHeight : 0,
        mainClientHeight: main ? main.clientHeight : 0,
        isMainScrollable: main ? main.scrollHeight > main.clientHeight : false,
        docScrollHeight: doc.scrollHeight,
        docClientHeight: doc.clientHeight,
        isDocScrollable: doc.scrollHeight > doc.clientHeight,
      };
    })()
  `);
  console.log('Boost Messages Scroll:', boostScroll);
  let boostShot = await session.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/aksha/.gemini/antigravity-ide/brain/70b91183-7caa-410d-8e31-3cf068b80e49/qa-screenshots/boost_messages_scroll.png', Buffer.from(boostShot.data, 'base64'));

  // 2. Clear localStorage and login as Client to test /portal/messages
  console.log('Logging in as client...');
  await session.eval(`
    localStorage.clear();
    sessionStorage.clear();
  `);
  await session.navigate('http://localhost:5173/signin', 2000);
  await session.eval(`
    (() => {
      const emailInput = document.querySelector('input[type="email"]') || document.querySelector('input[name="email"]');
      const passInput = document.querySelector('input[type="password"]');
      if (emailInput) {
        emailInput.value = 'testclient@datai2i.com';
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (passInput) {
        passInput.value = 'Client@123';
        passInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      const submitBtn = document.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 3000));
  await session.navigate('http://localhost:5173/portal/messages', 2500);

  let clientScroll = await session.eval(`
    (() => {
      const main = document.querySelector('main');
      const doc = document.documentElement;
      const inputs = Array.from(document.querySelectorAll('input'));
      const sendInput = inputs.find(i => i.placeholder && i.placeholder.includes('Type your message'));
      return {
        url: window.location.href,
        windowHeight: window.innerHeight,
        mainScrollHeight: main ? main.scrollHeight : 0,
        mainClientHeight: main ? main.clientHeight : 0,
        isMainScrollable: main ? main.scrollHeight > main.clientHeight : false,
        docScrollHeight: doc.scrollHeight,
        docClientHeight: doc.clientHeight,
        isDocScrollable: doc.scrollHeight > doc.clientHeight,
        inputVisibleInViewport: sendInput ? (sendInput.getBoundingClientRect().bottom <= window.innerHeight) : false,
        inputRect: sendInput ? sendInput.getBoundingClientRect() : null
      };
    })()
  `);
  console.log('Client Messages Scroll:', clientScroll);
  let clientShot = await session.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/aksha/.gemini/antigravity-ide/brain/70b91183-7caa-410d-8e31-3cf068b80e49/qa-screenshots/client_messages_scroll.png', Buffer.from(clientShot.data, 'base64'));
}

testScroll().catch(console.error);
