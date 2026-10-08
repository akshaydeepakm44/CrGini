import { CdpSession } from './qa-cdp.js';

async function runPhaseA() {
  console.log('=== RUNNING PHASE A: BASIC PLATFORM LOGIN TEST ===');
  const session = await CdpSession.create();

  const rolesToTest = [
    {
      role: 'USER',
      label: 'Client (Data I2I)',
      email: 'testclient@datai2i.com',
      password: 'Client@123',
      expectedPath: '/portal',
      screenshotName: 'phase_a_01_client.png'
    },
    {
      role: 'COMPANY_LEAD',
      label: 'Company Lead Specialist',
      email: 'lead@creativegini.com',
      password: 'Lead@123',
      expectedPath: '/lead',
      screenshotName: 'phase_a_02_lead.png'
    },
    {
      role: 'COMPANY_BOOST',
      label: 'Growth & Boost Strategist',
      email: 'boost@creativegini.com',
      password: 'Boost@123',
      expectedPath: '/boost',
      screenshotName: 'phase_a_03_boost.png'
    },
    {
      role: 'LANDING_PAGE',
      label: 'UI/UX Architect',
      email: 'ui@creativegini.com',
      password: 'UI@123',
      expectedPath: '/design',
      screenshotName: 'phase_a_04_ui.png'
    },
    {
      role: 'ADMIN',
      label: 'CreativeGini Admin',
      email: 'admin@creativegini.com',
      password: 'Admin@123',
      expectedPath: '/admin',
      screenshotName: 'phase_a_05_admin.png'
    },
    {
      role: 'SUPER_ADMIN',
      label: 'CreativeGini Super Admin',
      email: 'team@creativegini.com',
      password: 'Admin@2026',
      expectedPath: '/admin',
      screenshotName: 'phase_a_06_superadmin.png'
    }
  ];

  const results = [];

  for (const r of rolesToTest) {
    console.log(`\n--- Testing Role: ${r.role} (${r.label}) ---`);
    try {
      // 1. Navigate to signin with clean storage
      await session.navigate('http://localhost:5173/signin', 1500);
      await session.eval(`localStorage.clear(); sessionStorage.clear();`);
      await session.navigate('http://localhost:5173/signin', 1500);

      // 2. Type credentials using native CDP insertText
      await session.type('#email-input', r.email);
      await session.type('#password-input', r.password);

      // 3. Submit
      await session.click('button[type="submit"]', 2000);

      // 4. Wait for redirection to expected path
      await session.waitFor(`() => window.location.pathname.startsWith('${r.expectedPath}')`, 8000, 300);

      const currentPath = await session.eval('window.location.pathname');
      const bodyText = await session.eval('document.body.innerText.slice(0, 300)');
      const isNotBlank = bodyText && bodyText.trim().length > 20;

      // 5. Capture screenshot
      await session.screenshot(r.screenshotName);

      // 6. Logout cleanly
      await session.eval(`
        (() => {
          localStorage.removeItem('cg_auth_token');
          sessionStorage.clear();
          window.location.href = '/signin';
        })()
      `);
      await session.waitFor(`() => window.location.pathname === '/signin'`, 5000, 300);

      console.log(`[PASS] ${r.role} -> ${currentPath} | Rendered: ${isNotBlank} | Screenshot: ${r.screenshotName}`);
      results.push({
        role: r.role,
        label: r.label,
        email: r.email,
        expectedPath: r.expectedPath,
        actualPath: currentPath,
        loginSuccess: true,
        rendered: isNotBlank,
        logoutSuccess: true,
        screenshot: r.screenshotName,
        status: 'PASS'
      });
    } catch (err) {
      console.error(`[FAIL] ${r.role}: ${err.message}`);
      const failShot = `phase_a_fail_${r.role.toLowerCase()}.png`;
      await session.screenshot(failShot);
      results.push({
        role: r.role,
        label: r.label,
        email: r.email,
        expectedPath: r.expectedPath,
        actualPath: 'ERROR',
        loginSuccess: false,
        rendered: false,
        logoutSuccess: false,
        screenshot: failShot,
        error: err.message,
        status: 'FAIL'
      });
    }
  }

  console.log('\n=== PHASE A RESULTS SUMMARY ===');
  console.table(results);
  await session.close();
  return results;
}

runPhaseA().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
