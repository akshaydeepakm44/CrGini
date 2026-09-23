import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import User from './models/User.js';
import Company from './models/Company.js';
import Request from './models/Request.js';
import Message from './models/Message.js';
import Payment from './models/Payment.js';
import ActivityLog from './models/ActivityLog.js';
import Submission from './models/Submission.js';
import Notification from './models/Notification.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();
    console.log('[Seed] Connected to database. Clearing existing demo collections...');

    await Promise.all([
      User.deleteMany({}),
      Company.deleteMany({}),
      Request.deleteMany({}),
      Message.deleteMany({}),
      Payment.deleteMany({}),
      ActivityLog.deleteMany({}),
      Submission.deleteMany({}),
      Notification.deleteMany({})
    ]);

    console.log('[Seed] Database cleared. Seeding internal CreativeGini team accounts...');

    // 1. Seed Internal Accounts
    const adminUser = await User.create({
      name: 'CreativeGini Admin',
      email: 'admin@creativegini.com',
      password: 'Admin@123',
      role: 'ADMIN',
      dashboardAccess: { companyBoost: true, companyLead: true, companyUI: true },
      phone: '+1 (800) 555-0100',
      status: 'ACTIVE'
    });

    const leadUser = await User.create({
      name: 'Company Lead Specialist',
      email: 'lead@creativegini.com',
      password: 'Lead@123',
      role: 'COMPANY_LEAD',
      dashboardAccess: { companyBoost: false, companyLead: true, companyUI: false },
      phone: '+1 (800) 555-0101',
      status: 'ACTIVE'
    });

    const boostUser = await User.create({
      name: 'Growth & Boost Strategist',
      email: 'boost@creativegini.com',
      password: 'Boost@123',
      role: 'COMPANY_BOOST',
      dashboardAccess: { companyBoost: true, companyLead: false, companyUI: false },
      phone: '+1 (800) 555-0102',
      status: 'ACTIVE'
    });

    const uiUser = await User.create({
      name: 'Landing Page UI/UX Architect',
      email: 'ui@creativegini.com',
      password: 'UI@123',
      role: 'LANDING_PAGE',
      dashboardAccess: { companyBoost: false, companyLead: false, companyUI: true },
      phone: '+1 (800) 555-0103',
      status: 'ACTIVE'
    });

    console.log('[Seed] Internal accounts seeded.');

    // 2. Seed Sample Client Company & Pre-researched Information
    console.log('[Seed] Creating sample client company & pre-researched data...');

    const sampleCompany = await Company.create({
      name: 'Acme Cloud AI',
      contactPerson: 'Alex Vance',
      email: 'client@acmecorp.com',
      phone: '+1 (555) 234-5678',
      website: 'https://acmecloud.ai',
      industry: 'Enterprise SaaS / AI Automation',
      companyInfo: 'Acme Cloud AI provides continuous automated intelligence for enterprise data workflows, serving over 150+ mid-market technology companies.',
      researchSummary: 'CreativeGini comprehensive pre-market intelligence report: Identified key growth opportunities in European SaaS expansion. Key target titles: CTO, Head of Data, VP Engineering at Series A-C software scaleups.',
      initialLeads: [
        {
          name: 'Sarah Jenkins',
          title: 'VP of Data Architecture',
          company: 'Snowflake Labs',
          email: 'sarah.j@snowflakelabs.io',
          linkedin: 'https://linkedin.com/in/sarah-jenkins-data',
          location: 'San Francisco, CA',
          status: 'Verified',
          notes: 'High intent: actively modernizing cloud data pipelines.'
        },
        {
          name: 'Marcus Sterling',
          title: 'Chief Data Officer',
          company: 'Veloce Data',
          email: 'marcus@velocedata.com',
          linkedin: 'https://linkedin.com/in/marcus-sterling-cdo',
          location: 'London, UK',
          status: 'Verified',
          notes: 'Expressed need for automated AI workflow governance.'
        },
        {
          name: 'Elena Rostov',
          title: 'Head of Cloud Infrastructure',
          company: 'NexaScale Global',
          email: 'elena.r@nexascale.de',
          linkedin: 'https://linkedin.com/in/elena-rostov-cloud',
          location: 'Berlin, Germany',
          status: 'Verified',
          notes: 'Leading European data sovereignty migration.'
        },
        {
          name: 'David Chen',
          title: 'VP of Engineering',
          company: 'Datacore Solutions',
          email: 'dchen@datacoresolutions.com',
          linkedin: 'https://linkedin.com/in/david-chen-datacore',
          location: 'Austin, TX',
          status: 'Verified',
          notes: 'Evaluating automated workflow intelligence platforms.'
        },
        {
          name: 'Amira Al-Mansoor',
          title: 'Director of Big Data',
          company: 'CloudSpan Systems',
          email: 'amira@cloudspansystems.com',
          linkedin: 'https://linkedin.com/in/amira-al-mansoor',
          location: 'Dubai, UAE',
          status: 'Verified',
          notes: 'Overseeing multi-region cloud optimization initiatives.'
        }
      ],
      initialKeyPeople: [
        {
          name: 'Alex Vance',
          role: 'Founder & Chief Executive Officer',
          department: 'Executive Leadership',
          contact: 'alex@acmecloud.ai',
          socialProfile: 'https://linkedin.com/in/alex-vance-acme'
        },
        {
          name: 'Rachel Thorne',
          role: 'Chief Technology Officer',
          department: 'Engineering & R&D',
          contact: 'rachel@acmecloud.ai',
          socialProfile: 'https://linkedin.com/in/rachel-thorne-tech'
        },
        {
          name: 'Michael Chang',
          role: 'VP of Growth & Marketing',
          department: 'Go-To-Market',
          contact: 'michael@acmecloud.ai',
          socialProfile: 'https://linkedin.com/in/michael-chang-growth'
        }
      ],
      createdBy: adminUser._id
    });

    // 3. Create Sample Client User
    const clientUser = await User.create({
      name: 'Alex Vance',
      email: 'client@acmecorp.com',
      password: 'Client@123',
      role: 'USER',
      dashboardAccess: { companyBoost: false, companyLead: false, companyUI: false },
      companyId: sampleCompany._id,
      phone: '+1 (555) 234-5678',
      status: 'ACTIVE'
    });

    console.log('[Seed] Sample client account created: client@acmecorp.com / Client@123');

    // 4. Create Initial Sample Tickets
    const ticket1 = await Request.create({
      ticketId: 'CG-1024',
      userId: clientUser._id,
      companyId: sampleCompany._id,
      serviceType: 'COMPANY_LEAD',
      title: 'Need 50 additional leads from European SaaS companies',
      description: 'Expand our prospect database with 50 verified CTOs, VPs of Engineering, and Heads of Cloud from Series A-C SaaS firms based in Germany, UK, and Netherlands.',
      priority: 'HIGH',
      status: 'WORK_RESUBMITTED',
      price: 499,
      paymentStatus: 'PAID',
      assignedTeam: 'Company Lead Team',
      assignedTo: leadUser._id,
      currentSubmissionVersion: 2,
      dueDate: new Date(Date.now() + 5 * 86400000),
      notes: 'CreativeGini lead research sprint commenced.'
    });

    const ticket2 = await Request.create({
      ticketId: 'CG-1018',
      userId: clientUser._id,
      companyId: sampleCompany._id,
      serviceType: 'COMPANY_BOOST',
      title: 'Enterprise GTM Positioning & Outbound Playbook',
      description: 'Comprehensive audit of our enterprise messaging, value proposition matrix, and high-conversion outbound sequence templates.',
      priority: 'MEDIUM',
      status: 'COMPLETED',
      price: 799,
      paymentStatus: 'PAID',
      assignedTeam: 'Company Boost Team',
      assignedTo: boostUser._id,
      currentSubmissionVersion: 1,
      approvedAt: new Date(Date.now() - 2 * 86400000),
      approvedBy: clientUser._id,
      completedAt: new Date(Date.now() - 2 * 86400000),
      deliverables: [{
        title: 'CreativeGini GTM Playbook (PDF)',
        url: '#',
        description: 'Complete 34-page positioning strategy and outreach playbook.'
      }]
    });

    const ticket3 = await Request.create({
      ticketId: 'CG-1031',
      userId: clientUser._id,
      companyId: sampleCompany._id,
      serviceType: 'LANDING_PAGE',
      title: 'Interactive Hero Experience & Conversion Audit',
      description: 'Redesign main landing hero with interactive capability calculator, responsive device mockups, and performance optimization.',
      priority: 'MEDIUM',
      status: 'REQUEST_CREATED',
      price: 599,
      paymentStatus: 'PENDING',
      assignedTeam: 'Landing Page Enhancement Team'
    });

    // 4b. Create Submissions for CG-1024 (v1 with changes requested, v2 awaiting review)
    const sub1 = await Submission.create({
      ticketId: ticket1._id,
      version: 1,
      title: 'European SaaS Prospect Database (Initial 35 Accounts)',
      description: 'Initial sprint batch covering 35 verified VP Data and Head of Cloud engineering prospects across Germany, UK, and Netherlands.',
      files: [
        {
          name: 'leads-europe-v1.xlsx',
          url: 'https://creativegini.com/files/leads-europe-v1.xlsx',
          size: '2.4 MB',
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        },
        {
          name: 'research-summary.pdf',
          url: 'https://creativegini.com/files/research-summary.pdf',
          size: '1.1 MB',
          type: 'application/pdf'
        }
      ],
      externalLink: 'https://docs.google.com/spreadsheets/d/sample-sheet-id/edit',
      notes: 'Initial data compilation. Please review target seniority distribution.',
      submittedBy: leadUser._id,
      submittedByName: 'Company Lead Specialist',
      submittedAt: new Date(Date.now() - 2 * 86400000),
      status: 'CHANGES_REQUESTED',
      review: {
        reviewedBy: clientUser._id,
        reviewerName: 'Alex Vance',
        status: 'CHANGES_REQUESTED',
        feedback: 'Please include verified Chief Technology Officers (CTOs) for each company in addition to VP Data.',
        reviewedAt: new Date(Date.now() - 86400000)
      }
    });

    const sub2 = await Submission.create({
      ticketId: ticket1._id,
      version: 2,
      title: 'European SaaS Prospect Database (Revised 50 Leads with CTOs)',
      description: 'Revised sprint deliverables including verified CTOs, VPs of Infrastructure, and Heads of Cloud. 100% verified corporate emails with direct LinkedIn profiles.',
      files: [
        {
          name: 'leads-europe-v2-ctos.xlsx',
          url: 'https://creativegini.com/files/leads-europe-v2-ctos.xlsx',
          size: '3.2 MB',
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        },
        {
          name: 'research-summary-revised.pdf',
          url: 'https://creativegini.com/files/research-summary-revised.pdf',
          size: '1.5 MB',
          type: 'application/pdf'
        }
      ],
      externalLink: 'https://docs.google.com/spreadsheets/d/sample-sheet-v2/edit',
      notes: 'All requested CTO contacts have been researched, verified, and enriched.',
      submittedBy: leadUser._id,
      submittedByName: 'Company Lead Specialist',
      submittedAt: new Date(Date.now() - 3600000),
      status: 'PENDING_REVIEW'
    });

    // Submission for ticket2 (approved)
    await Submission.create({
      ticketId: ticket2._id,
      version: 1,
      title: 'Enterprise GTM Positioning Strategy & Outreach Sequence Matrix',
      description: 'Full 34-page positioning playbook and multi-channel sequence matrix designed for enterprise AI automation accounts.',
      files: [
        {
          name: 'gtm-positioning-playbook.pdf',
          url: 'https://creativegini.com/files/gtm-positioning-playbook.pdf',
          size: '4.8 MB',
          type: 'application/pdf'
        }
      ],
      externalLink: '',
      notes: 'Strategy and templates finalized.',
      submittedBy: boostUser._id,
      submittedByName: 'Growth & Boost Strategist',
      submittedAt: new Date(Date.now() - 3 * 86400000),
      status: 'APPROVED',
      review: {
        reviewedBy: clientUser._id,
        reviewerName: 'Alex Vance',
        status: 'APPROVED',
        feedback: 'Outstanding playbook, messaging matrix is ready for immediate deployment.',
        reviewedAt: new Date(Date.now() - 2 * 86400000)
      }
    });

    // 4c. Create In-App Notifications
    await Notification.create([
      {
        userId: clientUser._id,
        type: 'WORK_RESUBMITTED',
        title: 'Revised work ready for review',
        message: 'Company Lead Specialist submitted revision v2 for CG-1024: "Need 50 additional leads from European SaaS companies".',
        ticketId: ticket1._id,
        ticketCode: 'CG-1024',
        submissionId: sub2._id,
        isRead: false,
        createdAt: new Date(Date.now() - 3500000)
      },
      {
        userId: clientUser._id,
        type: 'WORK_APPROVED',
        title: 'Ticket Completed: CG-1018',
        message: 'Your approval for CG-1018 ("Enterprise GTM Positioning & Outbound Playbook") has been finalized. Sprint completed.',
        ticketId: ticket2._id,
        ticketCode: 'CG-1018',
        isRead: true,
        createdAt: new Date(Date.now() - 2 * 86400000)
      },
      {
        userId: leadUser._id,
        type: 'CHANGES_REQUESTED',
        title: 'Changes requested by client',
        message: 'Alex Vance requested changes on submission v1 for CG-1024. Feedback: "Please include verified Chief Technology Officers (CTOs) for each company in addition to VP Data."',
        ticketId: ticket1._id,
        ticketCode: 'CG-1024',
        submissionId: sub1._id,
        isRead: true,
        createdAt: new Date(Date.now() - 86400000)
      },
      {
        userId: leadUser._id,
        type: 'ASSIGNMENT',
        title: 'New ticket assigned',
        message: 'Ticket CG-1024: "Need 50 additional leads from European SaaS companies" has been assigned to you by CreativeGini.',
        ticketId: ticket1._id,
        ticketCode: 'CG-1024',
        isRead: true,
        createdAt: new Date(Date.now() - 3 * 86400000)
      }
    ]);

    // 5. Create Sample Request Conversation for CG-1024
    await Message.create([
      {
        requestId: ticket1._id,
        senderId: clientUser._id,
        senderName: 'Alex Vance',
        senderRole: 'USER',
        text: 'I need 50 additional leads from European SaaS companies. Can you focus heavily on Series A through Series C scaleups?'
      },
      {
        requestId: ticket1._id,
        senderId: leadUser._id,
        senderName: 'Company Lead Team',
        senderRole: 'COMPANY_LEAD',
        text: 'We have started the research! Our analysts are curating verified tech leadership profiles across DACH and UK regions.'
      },
      {
        requestId: ticket1._id,
        senderId: clientUser._id,
        senderName: 'Alex Vance',
        senderRole: 'USER',
        text: 'Please include CTOs and VPs of Infrastructure as well.'
      },
      {
        requestId: ticket1._id,
        senderId: leadUser._id,
        senderName: 'Company Lead Team',
        senderRole: 'COMPANY_LEAD',
        text: 'We have added CTOs and Infrastructure VPs to the filter criteria. First batch of 25 leads will be uploaded shortly.'
      }
    ]);

    // 6. Create Initial Invoices / Payments
    await Payment.create([
      {
        invoiceNumber: 'INV-2026-001',
        requestId: ticket1._id,
        userId: clientUser._id,
        companyId: sampleCompany._id,
        amount: 499,
        currency: 'USD',
        status: 'PAID',
        paymentMethod: 'Corporate Visa Card (**** 4821)',
        paidAt: new Date(Date.now() - 3 * 86400000)
      },
      {
        invoiceNumber: 'INV-2026-002',
        requestId: ticket2._id,
        userId: clientUser._id,
        companyId: sampleCompany._id,
        amount: 799,
        currency: 'USD',
        status: 'PAID',
        paymentMethod: 'Corporate Visa Card (**** 4821)',
        paidAt: new Date(Date.now() - 10 * 86400000)
      }
    ]);

    // 7. Activity Logs
    await ActivityLog.create([
      {
        userId: adminUser._id,
        userName: 'Admin',
        companyId: sampleCompany._id,
        action: 'COMPANY_ONBOARDED',
        details: 'Acme Cloud AI onboarded with 5 pre-verified leads and 3 key stakeholders.'
      },
      {
        userId: clientUser._id,
        userName: 'Alex Vance',
        companyId: sampleCompany._id,
        requestId: ticket1._id,
        action: 'PAYMENT_COMPLETED',
        details: 'Payment of $499 received for ticket CG-1024.'
      },
      {
        userId: leadUser._id,
        userName: 'Company Lead Team',
        companyId: sampleCompany._id,
        requestId: ticket1._id,
        action: 'STATUS_UPDATE',
        details: 'Status changed to IN_PROGRESS.'
      }
    ]);

    console.log('[Seed] Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
