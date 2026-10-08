import { CdpSession } from './qa-cdp.js';

async function login(session, email, pass) {
  await session.navigate('http://localhost:5173/signin', 1500);
  await session.eval(`localStorage.clear(); sessionStorage.clear();`);
  await session.navigate('http://localhost:5173/signin', 1500);
  await session.waitFor(`() => !!document.querySelector('#email-input')`, 6000, 200);

  await session.type('#email-input', email);
  await session.type('#password-input', pass);
  await session.click('button[type="submit"]', 2500);
}

async function testRbacAndIsolation() {
  const session = await CdpSession.create();
  console.log('=== PHASE 15 & 16: RBAC & TENANT ISOLATION SECURITY QA ===');

  const securityResults = [];

  // 1. CLIENT ACCESSING ADMIN & SPECIALIST PORTALS
  console.log('[SECURITY TEST] USER attempting unauthorized portal access...');
  await login(session, 'testclient@datai2i.com', 'Client@123');

  const unauthorizedPaths = [
    { target: '/admin/dashboard', expected: ['/portal', '/signin'] },
    { target: '/admin/operations', expected: ['/portal', '/signin'] },
    { target: '/boost', expected: ['/portal', '/signin'] },
    { target: '/lead', expected: ['/portal', '/signin'] },
    { target: '/design/dashboard', expected: ['/portal', '/signin'] },
  ];

  for (const item of unauthorizedPaths) {
    await session.navigate(`http://localhost:5173${item.target}`, 1500);
    const currentPath = await session.eval('window.location.pathname');
    const blocked = !currentPath.startsWith('/admin') && !currentPath.startsWith('/boost') && !currentPath.startsWith('/lead') && !currentPath.startsWith('/design');
    const shot = `rbac_client_access_${item.target.replace(/\//g, '_')}.png`;
    await session.screenshot(shot);

    console.log(`[RBAC] User attempted ${item.target} -> Landed on ${currentPath} (BLOCKED: ${blocked})`);
    securityResults.push({
      role: 'USER',
      attemptedPath: item.target,
      redirectedPath: currentPath,
      result: blocked ? 'PASS (BLOCKED)' : 'FAIL (UNAUTHORIZED ACCESS)',
      screenshot: shot
    });
  }

  // 2. BOOST SPECIALIST ATTEMPTING ADMIN & LEAD PORTAL ACCESS
  console.log('[SECURITY TEST] COMPANY_BOOST attempting unauthorized portal access...');
  await login(session, 'boost@creativegini.com', 'Boost@123');

  const boostUnauthorized = [
    { target: '/admin/dashboard', expected: ['/boost', '/signin'] },
    { target: '/lead', expected: ['/boost', '/signin'] },
  ];

  for (const item of boostUnauthorized) {
    await session.navigate(`http://localhost:5173${item.target}`, 1500);
    const currentPath = await session.eval('window.location.pathname');
    const blocked = !currentPath.startsWith('/admin') && !currentPath.startsWith('/lead');
    const shot = `rbac_boost_access_${item.target.replace(/\//g, '_')}.png`;
    await session.screenshot(shot);

    console.log(`[RBAC] Boost attempted ${item.target} -> Landed on ${currentPath} (BLOCKED: ${blocked})`);
    securityResults.push({
      role: 'COMPANY_BOOST',
      attemptedPath: item.target,
      redirectedPath: currentPath,
      result: blocked ? 'PASS (BLOCKED)' : 'FAIL (UNAUTHORIZED ACCESS)',
      screenshot: shot
    });
  }

  // 3. LEAD SPECIALIST ATTEMPTING ADMIN & BOOST PORTAL ACCESS
  console.log('[SECURITY TEST] COMPANY_LEAD attempting unauthorized portal access...');
  await login(session, 'lead@creativegini.com', 'Lead@123');

  const leadUnauthorized = [
    { target: '/admin/dashboard', expected: ['/lead', '/signin'] },
    { target: '/boost', expected: ['/lead', '/signin'] },
  ];

  for (const item of leadUnauthorized) {
    await session.navigate(`http://localhost:5173${item.target}`, 1500);
    const currentPath = await session.eval('window.location.pathname');
    const blocked = !currentPath.startsWith('/admin') && !currentPath.startsWith('/boost');
    const shot = `rbac_lead_access_${item.target.replace(/\//g, '_')}.png`;
    await session.screenshot(shot);

    console.log(`[RBAC] Lead attempted ${item.target} -> Landed on ${currentPath} (BLOCKED: ${blocked})`);
    securityResults.push({
      role: 'COMPANY_LEAD',
      attemptedPath: item.target,
      redirectedPath: currentPath,
      result: blocked ? 'PASS (BLOCKED)' : 'FAIL (UNAUTHORIZED ACCESS)',
      screenshot: shot
    });
  }

  console.log('\n=== SECURITY & RBAC ISOLATION SUMMARY ===');
  console.table(securityResults);

  // Logout
  await session.eval(`
    localStorage.removeItem('cg_auth_token');
    sessionStorage.clear();
    window.location.href = '/signin';
  `);

  await session.close();
}

testRbacAndIsolation().catch(console.error);
