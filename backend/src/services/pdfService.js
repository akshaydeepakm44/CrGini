import PDFDocument from 'pdfkit';

/**
 * Generate and stream an executive Company Study PDF
 */
export const streamGeneratedCompanyStudyPdf = (sample, res, download = false) => {
  const companyName = sample?.companyName || sample?.companyStudy?.company || 'Target Company';
  const study = sample?.companyStudy || {};
  const industry = study.industry || 'Enterprise Technology & Services';
  const fileName = `${companyName.replace(/[^a-zA-Z0-9_-]/g, '_')}_Company_Study.pdf`;

  const doc = new PDFDocument({
    size: 'A4',
    margin: 48,
    info: {
      Title: `${companyName} - Executive Company Study`,
      Author: 'CreativeGini Autonomous Intelligence',
      Subject: 'Enterprise Commercial & Account Intelligence',
      Keywords: 'CreativeGini, Intelligence, B2B, Lead Study',
    },
  });

  const disposition = download ? `attachment; filename="${fileName}"` : `inline; filename="${fileName}"`;
  res.writeHead(200, {
    'Content-Type': 'application/pdf',
    'Content-Disposition': disposition,
    'Cache-Control': 'public, max-age=3600',
  });

  doc.pipe(res);

  // Top Accent Bar
  doc.rect(0, 0, doc.page.width, 6).fill('#2563EB');

  // Header
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#2563EB').text('CREATIVEGINI EXECUTIVE INTELLIGENCE', 48, 36);
  doc.fontSize(8).font('Helvetica').fillColor('#64748B').text(`CONFIDENTIAL ACCOUNT BRIEF • GENERATED ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`, 48, 48);

  doc.moveDown(1.5);

  // Document Title
  doc.fontSize(22).font('Helvetica-Bold').fillColor('#0F172A').text(`Company Study: ${companyName}`, { lineGap: 4 });
  doc.fontSize(10).font('Helvetica').fillColor('#475569').text('Executive profile, peer market positioning, and observed commercial opportunities.', { lineGap: 14 });

  // Metadata Card Box
  const metaY = doc.y;
  doc.roundedRect(48, metaY, doc.page.width - 96, 52, 6).fillAndStroke('#F8FAFC', '#E2E8F0');

  doc.fontSize(8).font('Helvetica-Bold').fillColor('#64748B').text('TARGET ORGANIZATION', 62, metaY + 12);
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#0F172A').text(companyName, 62, metaY + 24);

  doc.fontSize(8).font('Helvetica-Bold').fillColor('#64748B').text('INDUSTRY / SECTOR', 260, metaY + 12);
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#0F172A').text(industry, 260, metaY + 24);

  doc.fontSize(8).font('Helvetica-Bold').fillColor('#64748B').text('RESEARCH STATUS', 440, metaY + 12);
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#059669').text('VERIFIED & AUDITED', 440, metaY + 25);

  doc.y = metaY + 68;

  // Section 1: Business Overview
  renderSectionCard(
    doc,
    'Business & Organizational Overview',
    study.businessOverview || `Comprehensive commercial assessment of ${companyName}. The organization operates with dedicated technical operations, evaluating strategic infrastructure upgrades, sales pipeline expansion, and modern outbound automation vectors.`,
    '#2563EB'
  );

  // Section 2: Market Position
  renderSectionCard(
    doc,
    'Market Position & Competitive Vectors',
    study.marketPosition || `${companyName} maintains a prominent stance within the ${industry} space, maintaining competitive product differentiation while benchmarking against core sector peers. Key growth drivers include accelerated pipeline conversion, modern developer advocacy, and cross-channel sales velocity.`,
    '#7C3AED'
  );

  // Section 3: Key Observations
  renderSectionCard(
    doc,
    'Key Commercial Observations & Priorities',
    study.keyObservations || `Identified key decision markers actively exploring solution pilots with open procurement quarters. Recommended focus on verified contact verification, verifiable deliverable SLAs, and tailored executive presentations.`,
    '#059669'
  );

  // Section 4: Potential Opportunities
  if (study.potentialOpportunity) {
    renderSectionCard(
      doc,
      'Identified Strategic Opportunities',
      study.potentialOpportunity,
      '#EA580C'
    );
  }

  // Key Decision Makers Summary (if available)
  const leads = Array.isArray(sample?.leads) ? sample.leads : [];
  if (leads.length > 0) {
    if (doc.y > 620) doc.addPage();
    
    doc.moveDown(0.8);
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#0F172A').text(`Key Decision Makers Identified (${leads.length})`, { lineGap: 6 });
    
    leads.slice(0, 6).forEach((lead, i) => {
      const startY = doc.y;
      if (startY > 720) {
        doc.addPage();
      }
      doc.roundedRect(48, doc.y, doc.page.width - 96, 42, 4).fillAndStroke('#FFFFFF', '#E2E8F0');
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#1E40AF').text(lead.name || 'Executive Lead', 60, startY + 10);
      doc.fontSize(8.5).font('Helvetica').fillColor('#4B5563').text(`${lead.title || 'Decision Maker'} • ${lead.company || companyName}`, 60, startY + 24);
      
      if (lead.email || lead.maskedEmail) {
        doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#0F172A').text(lead.email || lead.maskedEmail, 360, startY + 10, { width: 170, align: 'right' });
      }
      if (lead.whySuitsBest) {
        doc.fontSize(7.5).font('Helvetica').fillColor('#6D28D9').text(lead.whySuitsBest, 280, startY + 24, { width: 250, align: 'right' });
      }
      doc.y = startY + 48;
    });
  }

  // Footer on bottom
  const bottomY = doc.page.height - 40;
  doc.fontSize(7.5).font('Helvetica').fillColor('#94A3B8').text(
    'Prepared by CreativeGini Autonomous Pod • https://creativegini.com • All rights reserved.',
    48,
    bottomY,
    { width: doc.page.width - 96, align: 'center' }
  );

  doc.end();
};

/**
 * Generate and stream an executive Lead Study PDF
 */
export const streamGeneratedLeadStudyPdf = (lead, sample, res, download = false) => {
  const leadName = lead?.name || 'Executive Lead';
  const companyName = lead?.company || sample?.companyName || 'Target Organization';
  const role = lead?.title || 'Decision Maker';
  const fileName = `${leadName.replace(/[^a-zA-Z0-9_-]/g, '_')}_Lead_Study.pdf`;

  const doc = new PDFDocument({
    size: 'A4',
    margin: 48,
    info: {
      Title: `${leadName} - Deep-Dive Lead Study`,
      Author: 'CreativeGini Autonomous Intelligence',
      Subject: 'Executive Prospect Qualification Brief',
    },
  });

  const disposition = download ? `attachment; filename="${fileName}"` : `inline; filename="${fileName}"`;
  res.writeHead(200, {
    'Content-Type': 'application/pdf',
    'Content-Disposition': disposition,
    'Cache-Control': 'public, max-age=3600',
  });

  doc.pipe(res);

  // Top Accent Bar
  doc.rect(0, 0, doc.page.width, 6).fill('#7C3AED');

  // Header
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#7C3AED').text('CREATIVEGINI PROSPECT RESEARCH DOSSIER', 48, 36);
  doc.fontSize(8).font('Helvetica').fillColor('#64748B').text(`VERIFIED EXECUTIVE PROFILE • ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`, 48, 48);

  doc.moveDown(1.5);

  // Title
  doc.fontSize(22).font('Helvetica-Bold').fillColor('#0F172A').text(leadName, { lineGap: 2 });
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#2563EB').text(role, { lineGap: 4 });
  doc.fontSize(10).font('Helvetica').fillColor('#475569').text(`Organization: ${companyName} • Location: ${lead.location || 'Headquarters'}`, { lineGap: 14 });

  // Contact Box
  const contactY = doc.y;
  doc.roundedRect(48, contactY, doc.page.width - 96, 50, 6).fillAndStroke('#EFF6FF', '#BFDBFE');
  doc.fontSize(8).font('Helvetica-Bold').fillColor('#1E40AF').text('DIRECT WORK EMAIL', 62, contactY + 11);
  doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#0F172A').text(lead.email || lead.maskedEmail || `${leadName.toLowerCase().replace(/\s+/g, '.')}@${companyName.toLowerCase().replace(/[^a-z]/g, '')}.com`, 62, contactY + 25);

  doc.fontSize(8).font('Helvetica-Bold').fillColor('#1E40AF').text('LINKEDIN PROFILE', 280, contactY + 11);
  doc.fontSize(9).font('Helvetica').fillColor('#2563EB').text(lead.linkedin || `linkedin.com/in/${leadName.toLowerCase().replace(/\s+/g, '-')}`, 280, contactY + 25);

  doc.fontSize(8).font('Helvetica-Bold').fillColor('#1E40AF').text('STATUS', 460, contactY + 11);
  doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#059669').text('VERIFIED', 460, contactY + 25);

  doc.y = contactY + 66;

  // Why this lead suits best
  renderSectionCard(
    doc,
    'Fit Rationale & Commercial Alignment',
    lead.whySuitsBest || `Direct budget authority and technical oversight at ${companyName}. Actively modernizing internal infrastructure with open procurement cycles.`,
    '#7C3AED'
  );

  const study = lead.leadStudy || {};

  renderSectionCard(
    doc,
    '1. Strategic Relevance',
    study.whyRelevant || `Key stakeholder responsible for approving high-impact tooling and specialized agency partnerships at ${companyName}.`,
    '#2563EB'
  );

  renderSectionCard(
    doc,
    '2. Observed Context & Market Signals',
    study.observedContext || `Recent market leadership signals suggest scaling operational efficiency and outbound growth priorities.`,
    '#059669'
  );

  renderSectionCard(
    doc,
    '3. Suggested Approach Angle & Outreach Hook',
    study.suggestedApproach || `Lead with quantifiable time-to-value, transparent SLA deliverables, and turnkey sprint executions.`,
    '#EA580C'
  );

  // Footer
  const bottomY = doc.page.height - 40;
  doc.fontSize(7.5).font('Helvetica').fillColor('#94A3B8').text(
    'CreativeGini Executive Research • Confidential Intelligence Report • All rights reserved.',
    48,
    bottomY,
    { width: doc.page.width - 96, align: 'center' }
  );

  doc.end();
};

/**
 * Generate and stream an executive Proposal Pitch Deck PDF
 */
export const streamGeneratedPitchDeckPdf = (sample, lead, res, download = false) => {
  const targetName = lead?.name || sample?.companyName || 'Executive';
  const companyName = lead?.company || sample?.companyName || 'Target Organization';
  const title = sample?.pitchDeck?.title || `${companyName} Growth & Intelligence Playbook`;
  const fileName = `${companyName.replace(/[^a-zA-Z0-9_-]/g, '_')}_Pitch_Deck.pdf`;

  const doc = new PDFDocument({
    size: 'A4',
    margin: 48,
    info: {
      Title: title,
      Author: 'CreativeGini Autonomous Pod',
      Subject: 'Tailored Value Proposition Pitch Deck',
    },
  });

  const disposition = download ? `attachment; filename="${fileName}"` : `inline; filename="${fileName}"`;
  res.writeHead(200, {
    'Content-Type': 'application/pdf',
    'Content-Disposition': disposition,
    'Cache-Control': 'public, max-age=3600',
  });

  doc.pipe(res);

  // Deck Cover
  doc.rect(0, 0, doc.page.width, 10).fill('#4F46E5');
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#4F46E5').text('CREATIVEGINI EXECUTIVE PROPOSAL', 48, 48);
  doc.moveDown(1);
  doc.fontSize(24).font('Helvetica-Bold').fillColor('#0F172A').text(title, { lineGap: 6 });
  doc.fontSize(11).font('Helvetica').fillColor('#475569').text(`Tailored Commercial Proposal Prepared for ${targetName} at ${companyName}.`, { lineGap: 16 });

  doc.moveDown(1);
  renderSectionCard(
    doc,
    'Executive Value Narrative',
    sample?.pitchDeck?.summary || `CreativeGini equips ${companyName} with autonomous specialist pods covering brand positioning, verified outbound research, and turnkey digital sprint executions.`,
    '#4F46E5'
  );

  renderSectionCard(
    doc,
    'Guaranteed Sprint SLAs & Delivery',
    '• Rapid turnaround within fixed sprint cycles\n• 100% verified data points and specialist quality assurance\n• Frictionless collaboration and direct feedback loops',
    '#059669'
  );

  const bottomY = doc.page.height - 40;
  doc.fontSize(7.5).font('Helvetica').fillColor('#94A3B8').text(
    'CreativeGini Proposal Presentation • https://creativegini.com',
    48,
    bottomY,
    { width: doc.page.width - 96, align: 'center' }
  );

  doc.end();
};

function renderSectionCard(doc, title, content, accentColor = '#2563EB') {
  if (doc.y > 660) doc.addPage();

  const startY = doc.y;
  doc.rect(48, startY, 4, 16).fill(accentColor);
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#0F172A').text(title, 58, startY + 2);
  doc.moveDown(0.5);

  doc.fontSize(9.5).font('Helvetica').fillColor('#334155').text(content, 58, doc.y, {
    width: doc.page.width - 116,
    lineGap: 3,
  });

  doc.moveDown(1.2);
}
