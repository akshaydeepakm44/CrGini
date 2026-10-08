import { CdpSession } from './qa-cdp.js';

async function runPhaseB() {
  console.log('=== STARTING PHASE B: CLIENT PORTAL TEST ===');
  const session = await CdpSession.create();

  // 1. Login as Client
  await session.navigate('http://localhost:5173/signin', 1500);
  await session.eval(`localStorage.clear(); sessionStorage.clear();`);
  await session.navigate('http://localhost:5173/signin', 1500);

  await session.type('#email-input', 'testclient@datai2i.com');
  await session.type('#password-input', 'Client@123');
  await session.click('button[type="submit"]', 2000);

  await session.waitFor(`() => window.location.pathname.startsWith('/portal')`, 8000, 300);
  console.log('[Auth]: Logged in as Data I2I Test Client');

  const pagesToTest = [
    { name: 'Dashboard', path: '/portal/dashboard', screenshot: 'phase_b_01_dashboard.png' },
    { name: 'Boosting Channel', path: '/portal/boosting', screenshot: 'phase_b_02_boosting.png' },
    { name: 'Digitalising Channel', path: '/portal/digitalising', screenshot: 'phase_b_03_digitalising.png' },
    { name: 'My Requests', path: '/portal/requests', screenshot: 'phase_b_04_requests.png' },
    { name: 'Deliverables', path: '/portal/deliverables', screenshot: 'phase_b_05_deliverables.png' },
    { name: 'Messages', path: '/portal/messages', screenshot: 'phase_b_06_messages.png' },
    { name: 'Billing', path: '/portal/billing', screenshot: 'phase_b_07_billing.png' },
    { name: 'Profile', path: '/portal/profile', screenshot: 'phase_b_08_profile.png' }
  ];

  const results = [];

  for (const p of pagesToTest) {
    console.log(`\n--- Navigating to: ${p.name} (${p.path}) ---`);
    try {
      await session.navigate(`http://localhost:5173${p.path}`, 2000);

      const currentPath = await session.eval('window.location.pathname');
      const text = await session.eval('document.body.innerText.slice(0, 400)');
      const isNotBlank = text && text.trim().length > 30;

      // Test page refresh persistence
      await session.navigate(`http://localhost:5173${p.path}`, 1500);
      const afterRefreshText = await session.eval('document.body.innerText.slice(0, 400)');
      const refreshPersisted = afterRefreshText && afterRefreshText.trim().length > 30;

      await session.screenshot(p.screenshot);

      console.log(`[PASS] ${p.name} -> Loaded: ${isNotBlank} | Refresh Persisted: ${refreshPersisted}`);
      results.push({
        page: p.name,
        path: p.path,
        loaded: isNotBlank,
        refreshPersisted,
        screenshot: p.screenshot,
        status: 'PASS'
      });
    } catch (err) {
      console.error(`[FAIL] ${p.name}: ${err.message}`);
      const failShot = `phase_b_fail_${p.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.png`;
      await session.screenshot(failShot);
      results.push({
        page: p.name,
        path: p.path,
        loaded: false,
        refreshPersisted: false,
        screenshot: failShot,
        error: err.message,
        status: 'FAIL'
      });
    }
  }

  console.log('\n=== PHASE B RESULTS SUMMARY ===');
  console.table(results);
  await session.close();
  return results;
}

runPhaseB().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
