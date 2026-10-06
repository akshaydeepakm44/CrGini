import http from 'http';
import jwt from '../backend/node_modules/jsonwebtoken/index.js';
import { query } from '../backend/src/config/postgres.js';

const JWT_SECRET = 'creativegini_jwt_secret_2026_production_key_secure';

let token = '';

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 5005,
        path,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, body: data });
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  const usersRes = await query("SELECT id, email, role FROM users WHERE email = 'akhilkallepalli8@gmail.com' LIMIT 1");
  const user = usersRes.rows[0];
  console.log('Using client user:', user);

  token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  console.log('Testing Leads endpoint...');
  const leadsRes = await makeRequest('/api/company/my-company/lead-onboarding-assets');
  console.log('Lead onboarding assets status:', leadsRes.status);
  
  const leads = leadsRes.body?.leads || leadsRes.body?.sampleLeads || [];
  if (leads.length > 0) {
    console.log(`Found ${leads.length} sample leads:`);
    for (const lead of leads) {
      console.log(`\n========================================`);
      console.log(`- Company: ${lead.companyName || lead.company}`);
      console.log(`  Website: ${lead.website}`);
      console.log(`  Logo: ${lead.logoUrl}`);
      console.log(`  Key People:`, JSON.stringify(lead.keyPeople));
      console.log(`  Lead Study:`, lead.leadStudy);
      console.log(`  Pitch Deck:`, lead.pitchDeck);

      const studyAssetId = lead.leadStudy?.assetId || lead.leadStudy?.id;
      if (studyAssetId) {
        console.log(`  Fetching content for Company Study ${studyAssetId}...`);
        const contentRes = await makeRequest(`/api/assets/${studyAssetId}/content`);
        console.log(`  Content status: ${contentRes.status}, hasContent: ${contentRes.body?.hasContent}`);
        if (contentRes.body?.analysis) {
          console.log(`  Analysis DocType: ${contentRes.body.analysis.documentTypeLabel}`);
          console.log(`  Analysis Sections (${contentRes.body.analysis.sections.length}):`);
          for (const sec of contentRes.body.analysis.sections) {
            console.log(`    * [${sec.title}]`);
            if (sec.content) console.log(`      Content: ${sec.content.substring(0, 100)}...`);
            if (sec.items && sec.items.length > 0) {
              console.log(`      Items (${sec.items.length}):`);
              sec.items.forEach(it => console.log(`        • ${it}`));
            }
          }
        }
      }

      const deckAssetId = lead.pitchDeck?.assetId || lead.pitchDeck?.id;
      if (deckAssetId) {
        console.log(`  Fetching content for Pitch Deck ${deckAssetId}...`);
        const deckRes = await makeRequest(`/api/assets/${deckAssetId}/content`);
        console.log(`  Deck status: ${deckRes.status}, hasContent: ${deckRes.body?.hasContent}`);
        if (deckRes.body?.analysis) {
          console.log(`  Deck DocType: ${deckRes.body.analysis.documentTypeLabel}`);
          console.log(`  Deck Sections (${deckRes.body.analysis.sections.length}):`);
          for (const sec of deckRes.body.analysis.sections) {
            console.log(`    * [${sec.title}]`);
            if (sec.content) console.log(`      Content: ${sec.content.substring(0, 100)}...`);
            if (sec.items && sec.items.length > 0) {
              console.log(`      Items (${sec.items.length}):`);
              sec.items.forEach(it => console.log(`        • ${it}`));
            }
          }
        }
      }
    }
  } else {
    console.log('Lead onboarding response body:', JSON.stringify(leadsRes.body, null, 2));
  }
}

run().catch(console.error);
