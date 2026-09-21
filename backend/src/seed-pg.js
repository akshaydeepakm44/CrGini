import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { query, connectPostgres } from './config/postgres.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectPostgres();
    console.log('[Seed-PG] Connected to PostgreSQL. Clearing existing data...');

    // Clear all tables in dependency order
    await query('DELETE FROM activity_logs');
    await query('DELETE FROM notifications');
    await query('DELETE FROM submission_files');
    await query('DELETE FROM submissions');
    await query('DELETE FROM message_attachments');
    await query('DELETE FROM message_read_by');
    await query('DELETE FROM messages');
    await query('DELETE FROM request_deliverables');
    await query('DELETE FROM request_attachments');
    await query('DELETE FROM payments');
    await query('DELETE FROM requests');
    await query('DELETE FROM company_key_people');
    await query('DELETE FROM company_leads');
    await query('DELETE FROM users');
    await query('DELETE FROM companies');

    console.log('[Seed-PG] All tables cleared. Seeding users...');

    // Hash passwords
    const salt = await bcrypt.genSalt(10);

    const adminHash = await bcrypt.hash('Admin@123', salt);
    const leadHash = await bcrypt.hash('Lead@123', salt);
    const boostHash = await bcrypt.hash('Boost@123', salt);
    const uiHash = await bcrypt.hash('UI@123', salt);
    const clientHash = await bcrypt.hash('Client@123', salt);

    // 1. Create internal users
    const adminRes = await query(`
      INSERT INTO users (name, email, password, role, company_boost, company_lead, company_ui, phone, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `, ['CreativeGini Admin', 'admin@creativegini.com', adminHash, 'ADMIN', true, true, true, '+1 (800) 555-0100', 'ACTIVE']);
    const adminId = adminRes.rows[0].id;

    const leadRes = await query(`
      INSERT INTO users (name, email, password, role, company_boost, company_lead, company_ui, phone, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `, ['Company Lead Specialist', 'lead@creativegini.com', leadHash, 'COMPANY_LEAD', false, true, false, '+1 (800) 555-0101', 'ACTIVE']);
    const leadId = leadRes.rows[0].id;

    const boostRes = await query(`
      INSERT INTO users (name, email, password, role, company_boost, company_lead, company_ui, phone, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `, ['Growth & Boost Strategist', 'boost@creativegini.com', boostHash, 'COMPANY_BOOST', true, false, false, '+1 (800) 555-0102', 'ACTIVE']);
    const boostId = boostRes.rows[0].id;

    await query(`
      INSERT INTO users (name, email, password, role, company_boost, company_lead, company_ui, phone, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, ['Landing Page UI/UX Architect', 'ui@creativegini.com', uiHash, 'LANDING_PAGE', false, false, true, '+1 (800) 555-0103', 'ACTIVE']);

    console.log('[Seed-PG] Internal accounts created. Creating sample company...');

    // 2. Create sample company
    const companyRes = await query(`
      INSERT INTO companies (name, contact_person, email, phone, website, industry, company_info, research_summary, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `, [
      'Acme Cloud AI',
      'Alex Vance',
      'client@acmecorp.com',
      '+1 (555) 234-5678',
      'https://acmecloud.ai',
      'Enterprise SaaS / AI Automation',
      'Acme Cloud AI provides continuous automated intelligence for enterprise data workflows, serving over 150+ mid-market technology companies.',
      'CreativeGini comprehensive pre-market intelligence report: Identified key growth opportunities in European SaaS expansion. Key target titles: CTO, Head of Data, VP Engineering at Series A-C software scaleups.',
      adminId
    ]);
    const companyId = companyRes.rows[0].id;

    // Insert company leads
    await query(`
      INSERT INTO company_leads (company_id, name, title, lead_company, email, linkedin, location, status, notes)
      VALUES
        ($1, 'Sarah Jenkins', 'VP of Data Architecture', 'Snowflake Labs', 'sarah.j@snowflakelabs.io', 'https://linkedin.com/in/sarah-jenkins-data', 'San Francisco, CA', 'Verified', 'High intent: actively modernizing cloud data pipelines.'),
        ($1, 'Marcus Sterling', 'Chief Data Officer', 'Veloce Data', 'marcus@velocedata.com', 'https://linkedin.com/in/marcus-sterling-cdo', 'London, UK', 'Verified', 'Expressed need for automated AI workflow governance.'),
        ($1, 'Elena Rostov', 'Head of Cloud Infrastructure', 'NexaScale Global', 'elena.r@nexascale.de', 'https://linkedin.com/in/elena-rostov-cloud', 'Berlin, Germany', 'Verified', 'Leading European data sovereignty migration.'),
        ($1, 'David Chen', 'VP of Engineering', 'Datacore Solutions', 'dchen@datacoresolutions.com', 'https://linkedin.com/in/david-chen-datacore', 'Austin, TX', 'Verified', 'Evaluating automated workflow intelligence platforms.'),
        ($1, 'Amira Al-Mansoor', 'Director of Big Data', 'CloudSpan Systems', 'amira@cloudspansystems.com', 'https://linkedin.com/in/amira-al-mansoor', 'Dubai, UAE', 'Verified', 'Overseeing multi-region cloud optimization initiatives.')
    `, [companyId]);

    // Insert company key people
    await query(`
      INSERT INTO company_key_people (company_id, name, role, department, contact, social_profile)
      VALUES
        ($1, 'Alex Vance', 'Founder & Chief Executive Officer', 'Executive Leadership', 'alex@acmecloud.ai', 'https://linkedin.com/in/alex-vance-acme'),
        ($1, 'Rachel Thorne', 'Chief Technology Officer', 'Engineering & R&D', 'rachel@acmecloud.ai', 'https://linkedin.com/in/rachel-thorne-tech'),
        ($1, 'Michael Chang', 'VP of Growth & Marketing', 'Go-To-Market', 'michael@acmecloud.ai', 'https://linkedin.com/in/michael-chang-growth')
    `, [companyId]);

    console.log('[Seed-PG] Company created. Creating client user...');

    // 3. Create client user linked to company
    const clientRes = await query(`
      INSERT INTO users (name, email, password, role, company_boost, company_lead, company_ui, company_id, phone, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id
    `, ['Alex Vance', 'client@acmecorp.com', clientHash, 'USER', false, false, false, companyId, '+1 (555) 234-5678', 'ACTIVE']);
    const clientId = clientRes.rows[0].id;

    console.log('[Seed-PG] Client user created. Creating tickets...');

    // 4. Create tickets
    const ticket1Res = await query(`
      INSERT INTO requests (ticket_id, user_id, company_id, service_type, title, description, priority, status, price, payment_status, assigned_team, assigned_to, current_submission_version, due_date, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id
    `, [
      'CG-1024', clientId, companyId, 'COMPANY_LEAD',
      'Need 50 additional leads from European SaaS companies',
      'Expand our prospect database with 50 verified CTOs, VPs of Engineering, and Heads of Cloud from Series A-C SaaS firms based in Germany, UK, and Netherlands.',
      'HIGH', 'WORK_RESUBMITTED', 499, 'PAID', 'Company Lead Team', leadId, 2,
      new Date(Date.now() + 5 * 86400000),
      'CreativeGini lead research sprint commenced.'
    ]);
    const ticket1Id = ticket1Res.rows[0].id;

    const ticket2Res = await query(`
      INSERT INTO requests (ticket_id, user_id, company_id, service_type, title, description, priority, status, price, payment_status, assigned_team, assigned_to, current_submission_version, approved_at, approved_by, completed_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING id
    `, [
      'CG-1018', clientId, companyId, 'COMPANY_BOOST',
      'Enterprise GTM Positioning & Outbound Playbook',
      'Comprehensive audit of our enterprise messaging, value proposition matrix, and high-conversion outbound sequence templates.',
      'MEDIUM', 'COMPLETED', 799, 'PAID', 'Company Boost Team', boostId, 1,
      new Date(Date.now() - 2 * 86400000), clientId, new Date(Date.now() - 2 * 86400000)
    ]);
    const ticket2Id = ticket2Res.rows[0].id;

    await query(`
      INSERT INTO requests (ticket_id, user_id, company_id, service_type, title, description, priority, status, price, payment_status, assigned_team)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
      'CG-1031', clientId, companyId, 'LANDING_PAGE',
      'Interactive Hero Experience & Conversion Audit',
      'Redesign main landing hero with interactive capability calculator, responsive device mockups, and performance optimization.',
      'MEDIUM', 'REQUEST_CREATED', 599, 'PENDING', 'Landing Page Enhancement Team'
    ]);

    console.log('[Seed-PG] Tickets created. Creating submissions...');

    // 5. Create submissions
    const sub1Res = await query(`
      INSERT INTO submissions (request_id, ticket_code, version, title, description, external_link, notes, submitted_by, submitted_by_name, submitted_at, status, reviewed_by, reviewer_name, review_status, review_feedback, reviewed_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING id
    `, [
      ticket1Id, 'CG-1024', 1,
      'European SaaS Prospect Database (Initial 35 Accounts)',
      'Initial sprint batch covering 35 verified VP Data and Head of Cloud engineering prospects across Germany, UK, and Netherlands.',
      'https://docs.google.com/spreadsheets/d/sample-sheet-id/edit',
      'Initial data compilation. Please review target seniority distribution.',
      leadId, 'Company Lead Specialist', new Date(Date.now() - 2 * 86400000),
      'CHANGES_REQUESTED', clientId, 'Alex Vance', 'CHANGES_REQUESTED',
      'Please include verified Chief Technology Officers (CTOs) for each company in addition to VP Data.',
      new Date(Date.now() - 86400000)
    ]);
    const sub1Id = sub1Res.rows[0].id;

    // Add files for sub1
    await query(`
      INSERT INTO submission_files (submission_id, name, url, size, type)
      VALUES
        ($1, 'leads-europe-v1.xlsx', 'https://creativegini.com/files/leads-europe-v1.xlsx', '2.4 MB', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
        ($1, 'research-summary.pdf', 'https://creativegini.com/files/research-summary.pdf', '1.1 MB', 'application/pdf')
    `, [sub1Id]);

    const sub2Res = await query(`
      INSERT INTO submissions (request_id, ticket_code, version, title, description, external_link, notes, submitted_by, submitted_by_name, submitted_at, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id
    `, [
      ticket1Id, 'CG-1024', 2,
      'European SaaS Prospect Database (Revised 50 Leads with CTOs)',
      'Revised sprint deliverables including verified CTOs, VPs of Infrastructure, and Heads of Cloud. 100% verified corporate emails with direct LinkedIn profiles.',
      'https://docs.google.com/spreadsheets/d/sample-sheet-v2/edit',
      'All requested CTO contacts have been researched, verified, and enriched.',
      leadId, 'Company Lead Specialist', new Date(Date.now() - 3600000), 'PENDING_REVIEW'
    ]);
    const sub2Id = sub2Res.rows[0].id;

    await query(`
      INSERT INTO submission_files (submission_id, name, url, size, type)
      VALUES
        ($1, 'leads-europe-v2-ctos.xlsx', 'https://creativegini.com/files/leads-europe-v2-ctos.xlsx', '3.2 MB', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
        ($1, 'research-summary-revised.pdf', 'https://creativegini.com/files/research-summary-revised.pdf', '1.5 MB', 'application/pdf')
    `, [sub2Id]);

    // Submission for ticket2 (approved)
    const sub3Res = await query(`
      INSERT INTO submissions (request_id, ticket_code, version, title, description, external_link, notes, submitted_by, submitted_by_name, submitted_at, status, reviewed_by, reviewer_name, review_status, review_feedback, reviewed_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING id
    `, [
      ticket2Id, 'CG-1018', 1,
      'Enterprise GTM Positioning Strategy & Outreach Sequence Matrix',
      'Full 34-page positioning playbook and multi-channel sequence matrix designed for enterprise AI automation accounts.',
      '', 'Strategy and templates finalized.',
      boostId, 'Growth & Boost Strategist', new Date(Date.now() - 3 * 86400000),
      'APPROVED', clientId, 'Alex Vance', 'APPROVED',
      'Outstanding playbook, messaging matrix is ready for immediate deployment.',
      new Date(Date.now() - 2 * 86400000)
    ]);
    const sub3Id = sub3Res.rows[0].id;

    await query(`
      INSERT INTO submission_files (submission_id, name, url, size, type)
      VALUES ($1, 'gtm-positioning-playbook.pdf', 'https://creativegini.com/files/gtm-positioning-playbook.pdf', '4.8 MB', 'application/pdf')
    `, [sub3Id]);

    // Add deliverable for ticket2
    await query(`
      INSERT INTO request_deliverables (request_id, title, url, description)
      VALUES ($1, 'CreativeGini GTM Playbook (PDF)', '#', 'Complete 34-page positioning strategy and outreach playbook.')
    `, [ticket2Id]);

    console.log('[Seed-PG] Submissions created. Creating notifications...');

    // 6. Create notifications
    await query(`
      INSERT INTO notifications (user_id, type, title, message, ticket_id, ticket_code, submission_id, is_read, created_at)
      VALUES
        ($1, 'WORK_RESUBMITTED', 'Revised work ready for review', 'Company Lead Specialist submitted revision v2 for CG-1024: "Need 50 additional leads from European SaaS companies".', $2, 'CG-1024', $3, false, $4),
        ($1, 'WORK_APPROVED', 'Ticket Completed: CG-1018', 'Your approval for CG-1018 ("Enterprise GTM Positioning & Outbound Playbook") has been finalized. Sprint completed.', $5, 'CG-1018', NULL, true, $6)
    `, [
      clientId,
      ticket1Id, sub2Id, new Date(Date.now() - 3500000),
      ticket2Id, new Date(Date.now() - 2 * 86400000)
    ]);

    await query(`
      INSERT INTO notifications (user_id, type, title, message, ticket_id, ticket_code, submission_id, is_read, created_at)
      VALUES
        ($1, 'CHANGES_REQUESTED', 'Changes requested by client', 'Alex Vance requested changes on submission v1 for CG-1024. Feedback: "Please include verified Chief Technology Officers (CTOs) for each company in addition to VP Data."', $2, 'CG-1024', $3, true, $4),
        ($1, 'ASSIGNMENT', 'New ticket assigned', 'Ticket CG-1024: "Need 50 additional leads from European SaaS companies" has been assigned to you by CreativeGini.', $2, 'CG-1024', NULL, true, $5)
    `, [
      leadId,
      ticket1Id, sub1Id, new Date(Date.now() - 86400000),
      new Date(Date.now() - 3 * 86400000)
    ]);

    console.log('[Seed-PG] Notifications created. Creating messages...');

    // 7. Create messages
    await query(`
      INSERT INTO messages (request_id, sender_id, sender_name, sender_role, text)
      VALUES
        ($1, $2, 'Alex Vance', 'USER', 'I need 50 additional leads from European SaaS companies. Can you focus heavily on Series A through Series C scaleups?'),
        ($1, $3, 'Company Lead Team', 'COMPANY_LEAD', 'We have started the research! Our analysts are curating verified tech leadership profiles across DACH and UK regions.'),
        ($1, $2, 'Alex Vance', 'USER', 'Please include CTOs and VPs of Infrastructure as well.'),
        ($1, $3, 'Company Lead Team', 'COMPANY_LEAD', 'We have added CTOs and Infrastructure VPs to the filter criteria. First batch of 25 leads will be uploaded shortly.')
    `, [ticket1Id, clientId, leadId]);

    console.log('[Seed-PG] Messages created. Creating payments...');

    // 8. Create payments
    await query(`
      INSERT INTO payments (invoice_number, request_id, user_id, company_id, amount, currency, status, payment_method, paid_at)
      VALUES
        ('INV-2026-001', $1, $2, $3, 499, 'USD', 'PAID', 'Corporate Visa Card (**** 4821)', $4),
        ('INV-2026-002', $5, $2, $3, 799, 'USD', 'PAID', 'Corporate Visa Card (**** 4821)', $6)
    `, [
      ticket1Id, clientId, companyId, new Date(Date.now() - 3 * 86400000),
      ticket2Id, new Date(Date.now() - 10 * 86400000)
    ]);

    console.log('[Seed-PG] Payments created. Creating activity logs...');

    // 9. Create activity logs
    await query(`
      INSERT INTO activity_logs (user_id, user_name, company_id, action, details)
      VALUES
        ($1, 'Admin', $2, 'COMPANY_ONBOARDED', 'Acme Cloud AI onboarded with 5 pre-verified leads and 3 key stakeholders.'),
        ($3, 'Alex Vance', $2, 'PAYMENT_COMPLETED', 'Payment of $499 received for ticket CG-1024.'),
        ($4, 'Company Lead Team', $2, 'STATUS_UPDATE', 'Status changed to IN_PROGRESS.')
    `, [adminId, companyId, clientId, leadId]);

    console.log('[Seed-PG] ✅ Database seeded successfully!');
    console.log('');
    console.log('=== DEMO CREDENTIALS ===');
    console.log('Admin:       admin@creativegini.com  / Admin@123');
    console.log('Lead:        lead@creativegini.com   / Lead@123');
    console.log('Boost:       boost@creativegini.com  / Boost@123');
    console.log('UI:          ui@creativegini.com     / UI@123');
    console.log('Client:      client@acmecorp.com     / Client@123');

    process.exit(0);
  } catch (error) {
    console.error('[Seed-PG] Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
