import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';
import http from 'http';
import { query, connectPostgres } from '../../src/config/postgres.js';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const JWT_SECRET = process.env.JWT_SECRET || 'creativegini-jwt-secret-key-2024';

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      companyId: user.company_id,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function run() {
  console.log('=== VERIFYING CLIENT MESSAGES DASHBOARD SYNC ===');
  await connectPostgres();

  // 1. Fetch existing users
  const clientRes = await query("SELECT * FROM users WHERE role = 'USER' LIMIT 1");
  const specialistRes = await query("SELECT * FROM users WHERE role IN ('COMPANY_LEAD', 'COMPANY_BOOST', 'LANDING_PAGE', 'SPECIALIST') LIMIT 1");
  const adminRes = await query("SELECT * FROM users WHERE role = 'SUPER_ADMIN' OR role = 'ADMIN' LIMIT 1");

  assert(clientRes.rows.length > 0, 'Must have at least one client user');
  assert(specialistRes.rows.length > 0, 'Must have at least one specialist user');
  assert(adminRes.rows.length > 0, 'Must have at least one admin user');

  const client = clientRes.rows[0];
  const specialist = specialistRes.rows[0];
  const admin = adminRes.rows[0];

  const clientToken = generateToken(client);
  const specialistToken = generateToken(specialist);
  const adminToken = generateToken(admin);

  // 2. Fetch or create a request owned by client and assigned to specialist
  let reqRes = await query("SELECT * FROM requests WHERE user_id = $1 LIMIT 1", [client.id]);
  let testRequest;
  if (reqRes.rows.length > 0) {
    testRequest = reqRes.rows[0];
  } else {
    const ins = await query(
      `INSERT INTO requests (client_id, company_id, assigned_specialist_id, title, service_type, sub_service, status, priority, ticket_id)
       VALUES ($1, $2, $3, 'Sync Test Request', 'COMPANY_LEAD', 'LEAD_RESEARCH', 'IN_PROGRESS', 'MEDIUM', 'CG-TEST-99')
       RETURNING *`,
      [client.id, client.company_id, specialist.id]
    );
    testRequest = ins.rows[0];
  }

  console.log(`Using Request ID: ${testRequest.id} (${testRequest.ticket_id})`);

  // 3. Post a message as Client
  const testMessageText = `Verification message at ${Date.now()}`;
  const sendRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/requests/${testRequest.id}/messages`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${clientToken}`
    }
  }, { text: testMessageText });

  console.log('Post message status:', sendRes.status);
  assert.strictEqual(sendRes.status, 201, 'Client message should be posted successfully');
  console.log('✓ Client message posted');

  // 4. Verify request telemetry returns messageCount and latestMessage
  const getReqRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/requests/${testRequest.id}`,
    method: 'GET',
    headers: { 'Authorization': `Bearer ${clientToken}` }
  });

  assert.strictEqual(getReqRes.status, 200);
  const reqData = getReqRes.body.request;
  assert(reqData, 'Request must be returned');
  assert(reqData.messageCount >= 1, 'messageCount must be >= 1');
  assert(reqData.latestMessage, 'latestMessage must be present');
  assert.strictEqual(reqData.latestMessage.text, testMessageText, 'latestMessage text must match the posted message');
  assert.strictEqual(reqData.latestMessage.senderName, client.name, 'latestMessage sender must match client');
  console.log('✓ Request telemetry includes messageCount and latestMessage correctly');

  // 5. Verify unread-count endpoint
  const unreadRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/requests/messages/unread-count',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${specialistToken}` }
  });

  assert.strictEqual(unreadRes.status, 200);
  assert(typeof unreadRes.body.unreadCount === 'number');
  console.log(`✓ Unread messages count API works (count: ${unreadRes.body.unreadCount})`);

  // 6. Verify Admin Overview returns recentMessages
  const adminOverviewRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/overview',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });

  assert.strictEqual(adminOverviewRes.status, 200);
  const overviewData = adminOverviewRes.body.data;
  assert(Array.isArray(overviewData.recentMessages), 'recentMessages must be an array');
  const foundMsg = overviewData.recentMessages.find(m => m.text === testMessageText);
  assert(foundMsg, 'Latest client message must appear in admin overview recentMessages');
  console.log('✓ Admin overview contains recent client message');

  console.log('====================================================');
  console.log('ALL CLIENT MESSAGE SYNC CHECKS PASSED SUCCESSFULLY!');
  console.log('====================================================');
  process.exit(0);
}

run().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
