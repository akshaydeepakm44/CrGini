/**
 * Mail Template Service
 *
 * Provides high-converting outreach email generation for prospect showcases.
 * Structured with a pluggable provider interface so deterministic logic
 * can easily be augmented or swapped with an LLM engine in the future.
 */

const DEFAULT_SENDER = {
  name: 'Akshay Deepak',
  title: 'Lead Research Manager',
  email: 'campaign@dizitalgini.com',
  company: 'DiziGini',
  website: 'www.dizigini.com',
};

/**
 * Deterministic mail template generator.
 * Matches the proven format from LeadShowcasesPage.
 */
export function generateOutreachMailTemplate({
  companyName,
  lead = {},
  showcaseSlug,
  baseUrl = '',
  sender = {},
} = {}) {
  const cleanCompanyName = (companyName || 'your company').trim();
  const recipientName = (lead.name || 'there').trim();
  const recipientEmail = (lead.email || '').trim();
  const publicSlug = (showcaseSlug || '').trim();
  const showcaseUrl = publicSlug ? `${baseUrl}/samples/${publicSlug}` : '';

  const effectiveSender = {
    name: sender.name || DEFAULT_SENDER.name,
    title: sender.title || DEFAULT_SENDER.title,
    email: sender.email || DEFAULT_SENDER.email,
    company: sender.company || DEFAULT_SENDER.company,
    website: sender.website || DEFAULT_SENDER.website,
  };

  // 3 high-converting subject line variations
  const subjects = [
    `Bespoke Market Intelligence & Growth Blueprint for ${cleanCompanyName}`,
    `Tailored Sales Intelligence & Lead Dossier for ${cleanCompanyName}`,
    `Strategic Growth & Competitive Briefing: ${cleanCompanyName}`,
  ];
  const primarySubject = subjects[0];

  // Plain Text Body (matches manual dashboard format)
  const bodyText = `Subject: ${primarySubject}

Hi ${recipientName},

Our research specialists at DiziGini have put together a dedicated intelligence showcase specifically for ${cleanCompanyName}.

We analyzed your current market position, prepared a deep-dive Company Study, mapped key high-fit prospect accounts with strategic fit analyses, and formulated an actionable outreach proposal:

👉 Explore Your Interactive Showcase: ${showcaseUrl}

Key deliverables included inside your showcase:
• Company Study: Market positioning and strategic growth levers
• High-Impact Leads: Vetted stakeholders with tailored "Why Suits Best" analysis
• Lead Deep Dives: Individual trigger events and recommended approach angles
• Pitch Deck: Turnkey presentation proposal tailored for your brand

Feel free to inspect the sample data. Whenever you are ready to unlock direct contact details and scale with our specialist team, click "More Leads" on the dashboard.

Regards,
${effectiveSender.name}
${effectiveSender.title}
${effectiveSender.email}
${effectiveSender.website}

Powered by DATAI2I

Thanks for your time. If you'd like to discuss this, just reply to this email.`;

  // HTML Body
  const bodyHtml = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
  <p style="font-size: 16px; margin-bottom: 16px;">Hi <strong>${recipientName}</strong>,</p>
  
  <p style="font-size: 15px; margin-bottom: 16px;">
    Our research specialists at <strong>DiziGini</strong> have put together a dedicated intelligence showcase specifically for <strong>${cleanCompanyName}</strong>.
  </p>
  
  <p style="font-size: 15px; margin-bottom: 20px;">
    We analyzed your current market position, prepared a deep-dive Company Study, mapped key high-fit prospect accounts with strategic fit analyses, and formulated an actionable outreach proposal:
  </p>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="${showcaseUrl}" style="background-color: #6366f1; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.2);">
      👉 Explore Interactive Showcase
    </a>
  </div>
  
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin-bottom: 24px;">
    <h4 style="margin: 0 0 10px 0; color: #0f172a; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Key Deliverables Included:</h4>
    <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 14px;">
      <li style="margin-bottom: 6px;"><strong>Company Study:</strong> Market positioning and strategic growth levers</li>
      <li style="margin-bottom: 6px;"><strong>High-Impact Leads:</strong> Vetted stakeholders with tailored "Why Suits Best" analysis</li>
      <li style="margin-bottom: 6px;"><strong>Lead Deep Dives:</strong> Individual trigger events and recommended approach angles</li>
      <li><strong>Pitch Deck:</strong> Turnkey presentation proposal tailored for your brand</li>
    </ul>
  </div>
  
  <p style="font-size: 14px; color: #64748b; margin-bottom: 24px;">
    Feel free to inspect the sample data. Whenever you are ready to unlock direct contact details and scale with our specialist team, reply to this email or click "More Leads" on the dashboard.
  </p>
  
  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
  
  <div style="font-size: 14px; color: #334155;">
    <strong>${effectiveSender.name}</strong><br />
    <span style="color: #64748b;">${effectiveSender.title}</span><br />
    <a href="mailto:${effectiveSender.email}" style="color: #6366f1; text-decoration: none;">${effectiveSender.email}</a> &bull; <a href="https://${effectiveSender.website}" style="color: #6366f1; text-decoration: none;">${effectiveSender.website}</a>
  </div>
</div>`;

  // Precomputed short compose links (bonus utility for operators)
  const encodedTo = encodeURIComponent(recipientEmail);
  const encodedSub = encodeURIComponent(primarySubject);
  const encodedBody = encodeURIComponent(bodyText);

  const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodedTo}&su=${encodedSub}&body=${encodedBody}`;
  const outlookComposeUrl = `https://outlook.office.com/mail/deeplink/compose?to=${encodedTo}&subject=${encodedSub}&body=${encodedBody}`;

  return {
    subject: primarySubject,
    subjects,
    bodyText,
    bodyHtml,
    showcaseUrl,
    recipientEmail,
    senderEmail: effectiveSender.email,
    gmailComposeUrl,
    outlookComposeUrl,
  };
}

