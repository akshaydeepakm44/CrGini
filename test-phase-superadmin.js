import { CdpSession } from './qa-cdp.js';

async function login(session, email, pass) {
  console.log(`[LOGIN] Logging in as ${email}...`);
  await session.navigate('http://localhost:5173/signin', 1500);
  await session.eval(`localStorage.clear(); sessionStorage.clear();`);
  await session.navigate('http://localhost:5173/signin', 1500);
  await session.waitFor(`() => !!document.querySelector('#email-input')`, 6000, 200);

  await session.type('#email-input', email);
  await session.type('#password-input', pass);
  await session.click('button[type="submit"]', 2500);
  await session.waitFor(`() => window.location.pathname.startsWith('/admin')`, 6000, 200);
}

async function testSuperAdmin() {
  const session = await CdpSession.create();
  console.log('=== PHASE 17 & 18: SUPER ADMIN COMPLETE OBSERVABILITY & NAVIGATION QA ===');

  await login(session, 'team@creativegini.com', 'Admin@2026');

  const pages = [
    { name: 'Dashboard', path: '/admin/dashboard', file: 'admin_01_dashboard.png' },
    { name: 'Operations', path: '/admin/operations', file: 'admin_02_operations.png' },
    { name: 'Clients', path: '/admin/clients', file: 'admin_03_clients.png' },
    { name: 'Team', path: '/admin/team', file: 'admin_04_team.png' },
    { name: 'Roles', path: '/admin/roles', file: 'admin_05_roles.png' },
    { name: 'Permissions', path: '/admin/permissions', file: 'admin_06_permissions.png' },
    { name: 'Services', path: '/admin/services', file: 'admin_07_services.png' },
    { name: 'Deliverables', path: '/admin/deliverables', file: 'admin_08_deliverables.png' },
    { name: 'Billing', path: '/admin/billing', file: 'admin_09_billing.png' },
    { name: 'Messages', path: '/admin/messages', file: 'admin_10_messages.png' },
    { name: 'Reports', path: '/admin/reports', file: 'admin_11_reports.png' },
    { name: 'Audit', path: '/admin/audit', file: 'admin_12_audit.png' },
    { name: 'Security', path: '/admin/security', file: 'admin_13_security.png' },
    { name: 'Settings', path: '/admin/settings', file: 'admin_14_settings.png' },
  ];

  const pageResults = [];

  for (const p of pages) {
    console.log(`Testing Super Admin page: ${p.name} (${p.path})...`);
    await session.navigate(`http://localhost:5173${p.path}`, 1500);

    const info = await session.eval(`
      (() => {
        const text = document.body.innerText.trim();
        const isBlank = text.length < 50;
        const hasCrash = text.includes('Something went wrong') || text.includes('Cannot read properties');
        const header = document.querySelector('h1, h2, h3')?.innerText || 'No Header';
        const tables = document.querySelectorAll('table').length;
        const cards = document.querySelectorAll('.card, div[style*="border-radius"]').length;

        return {
          title: document.title,
          url: window.location.pathname,
          header,
          isBlank,
          hasCrash,
          tables,
          cards,
          textSample: text.slice(0, 150)
        };
      })()
    `);

    await session.screenshot(p.file);
    const pass = !info.isBlank && !info.hasCrash;
    console.log(`[${pass ? 'PASS' : 'FAIL'}] ${p.name}: Header="${info.header}", Tables=${info.tables}, Cards=${info.cards}`);
    pageResults.push({
      page: p.name,
      path: p.path,
      status: pass ? 'PASS' : 'FAIL',
      header: info.header,
      screenshot: p.file
    });
  }

  console.log('\n=== SUPER ADMIN PAGES SUMMARY ===');
  console.table(pageResults);

  // Logout
  await session.eval(`
    localStorage.removeItem('cg_auth_token');
    sessionStorage.clear();
    window.location.href = '/signin';
  `);

  await session.close();
}

testSuperAdmin().catch(console.error);
