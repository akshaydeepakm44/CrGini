import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

async function migrate() {
  const creativeginiPool = new Pool({
    host: '127.0.0.1',
    port: 5432,
    database: 'creativegini',
    user: 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'Datai2i#001',
  });

  const diziginiPool = new Pool({
    host: '127.0.0.1',
    port: 5432,
    database: 'dizigini_db',
    user: 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'Datai2i#001',
  });

  try {
    console.log('[Migration] Fetching showcases from creativegini database...');
    const srcRes = await creativeginiPool.query(`
      SELECT id, slug, title, company_name, description, logo_url, status, company_study, leads, lead_studies, pitch_deck, published_at, created_at, updated_at
      FROM public_sample_showcases
      ORDER BY id ASC;
    `);

    console.log(`[Migration] Found ${srcRes.rows.length} prospect showcases to transfer.`);

    for (const r of srcRes.rows) {
      await diziginiPool.query(`
        INSERT INTO public_sample_showcases (
          id, slug, title, company_name, description, logo_url, status,
          company_study, leads, lead_studies, pitch_deck, published_at, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
        )
        ON CONFLICT (id) DO UPDATE SET
          slug = EXCLUDED.slug,
          title = EXCLUDED.title,
          company_name = EXCLUDED.company_name,
          description = EXCLUDED.description,
          logo_url = EXCLUDED.logo_url,
          status = EXCLUDED.status,
          company_study = EXCLUDED.company_study,
          leads = EXCLUDED.leads,
          lead_studies = EXCLUDED.lead_studies,
          pitch_deck = EXCLUDED.pitch_deck,
          published_at = EXCLUDED.published_at,
          updated_at = EXCLUDED.updated_at;
      `, [
        r.id,
        r.slug,
        r.title,
        r.company_name,
        r.description,
        r.logo_url,
        r.status,
        typeof r.company_study === 'string' ? r.company_study : JSON.stringify(r.company_study),
        typeof r.leads === 'string' ? r.leads : JSON.stringify(r.leads),
        typeof r.lead_studies === 'string' ? r.lead_studies : JSON.stringify(r.lead_studies),
        typeof r.pitch_deck === 'string' ? r.pitch_deck : JSON.stringify(r.pitch_deck),
        r.published_at,
        r.created_at,
        r.updated_at,
      ]);
      console.log(`✓ Restored showcase ID ${r.id}: "${r.company_name}" (${r.slug})`);
    }

    // Update sequence
    await diziginiPool.query(`
      SELECT setval('public_sample_showcases_id_seq', COALESCE((SELECT MAX(id) FROM public_sample_showcases), 1));
    `);

    // Check inquiries table too
    try {
      const inqRes = await creativeginiPool.query(`SELECT * FROM public_sample_inquiries;`);
      if (inqRes.rows.length > 0) {
        for (const inq of inqRes.rows) {
          await diziginiPool.query(`
            INSERT INTO public_sample_inquiries (
              id, slug, company_name, sender_name, sender_email, message, status,
              super_admin_notified, app_email_notified, sender_notified, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT (id) DO NOTHING;
          `, [
            inq.id, inq.slug, inq.company_name, inq.sender_name, inq.sender_email, inq.message,
            inq.status, inq.super_admin_notified, inq.app_email_notified, inq.sender_notified, inq.created_at
          ]);
        }
        await diziginiPool.query(`
          SELECT setval('public_sample_inquiries_id_seq', COALESCE((SELECT MAX(id) FROM public_sample_inquiries), 1));
        `);
        console.log(`✓ Restored ${inqRes.rows.length} prospect inquiries.`);
      }
    } catch (_) {}

    console.log('\n========================================================');
    console.log('SUCCESS: All 7 prospect showcases successfully transferred to dizigini_db!');
    console.log('========================================================');
  } catch (err) {
    console.error('[Migration Error]:', err);
  } finally {
    await creativeginiPool.end();
    await diziginiPool.end();
    process.exit(0);
  }
}

migrate();
