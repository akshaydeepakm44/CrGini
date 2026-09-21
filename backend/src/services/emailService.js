import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * CreativeGini Email Service
 * Handles transactional emails for ticket assignment, progress updates,
 * reviews, approvals, and completions with rich branded HTML templates,
 * non-blocking error handling, and multi-layered duplicate protection.
 */

// In-memory deduplication cache: key -> timestamp (ms)
const emailDedupeCache = new Map();
const DEDUPE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Periodic cleanup of expired cache entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of emailDedupeCache.entries()) {
    if (now - timestamp > DEDUPE_TTL_MS) {
      emailDedupeCache.delete(key);
    }
  }
}, 10 * 60 * 1000).unref?.();

/**
 * Check and record an event key in the deduplication cache.
 * Returns true if the email is a duplicate within the TTL window.
 */
export const isDuplicateEmail = (key) => {
  if (!key) return false;
  const now = Date.now();
  const lastSent = emailDedupeCache.get(key);
  if (lastSent && now - lastSent < DEDUPE_TTL_MS) {
    return true;
  }
  emailDedupeCache.set(key, now);
  return false;
};

/**
 * Clear the deduplication cache (useful for testing).
 */
export const clearEmailDedupeCache = () => {
  emailDedupeCache.clear();
};

/**
 * Get nodemailer transporter or null if not configured.
 */
let transporterInstance = null;

export const getTransporter = () => {
  if (transporterInstance !== null) {
    return transporterInstance;
  }

  const host = process.env.EMAIL_HOST;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;
  const port = parseInt(process.env.EMAIL_PORT || '587', 10);
  const secure = process.env.EMAIL_SECURE === 'true' || port === 465;

  if (host && user && pass) {
    try {
      transporterInstance = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
        tls: {
          rejectUnauthorized: false
        }
      });
      console.log(`[EMAIL SERVICE] Initialized SMTP transporter with host: ${host}:${port}`);
    } catch (err) {
      console.error('[EMAIL SERVICE] Failed to initialize SMTP transporter:', err.message);
      transporterInstance = null;
    }
  } else {
    transporterInstance = null;
  }

  return transporterInstance;
};

/**
 * Verify SMTP connection with current credentials.
 */
export const verifySmtpConnection = async () => {
  const host = process.env.EMAIL_HOST;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;
  const port = parseInt(process.env.EMAIL_PORT || '587', 10);
  const secure = process.env.EMAIL_SECURE === 'true' || port === 465;

  if (!host || !user || !pass) {
    return {
      success: false,
      configured: false,
      error: 'Missing SMTP credentials in backend/.env (EMAIL_HOST, EMAIL_USER, or EMAIL_PASSWORD).'
    };
  }

  try {
    const testTransporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false
      }
    });

    await testTransporter.verify();
    return {
      success: true,
      configured: true,
      message: `Successfully authenticated with SMTP server ${host}:${port} as ${user}`
    };
  } catch (err) {
    return {
      success: false,
      configured: true,
      error: err.message
    };
  }
};

/**
 * Format service type into a human-readable title.
 */
export const formatServiceType = (serviceType) => {
  switch (serviceType) {
    case 'COMPANY_BOOST':
      return 'Company Boost';
    case 'COMPANY_LEAD':
      return 'Company Lead';
    case 'LANDING_PAGE':
    case 'LANDING_PAGE_ENHANCEMENT':
    case 'COMPANY_UI':
      return 'Landing Page Enhancement';
    default:
      return (serviceType || 'Service').replace(/_/g, ' ');
  }
};

/**
 * Generate portal direct URL for a ticket.
 */
export const getTicketUrl = (ticketId, tab = '') => {
  const baseUrl = (process.env.PORTAL_BASE_URL || 'http://localhost:5174').replace(/\/$/, '');
  const tabQuery = tab ? `?tab=${encodeURIComponent(tab)}` : '';
  return `${baseUrl}/ticket/${encodeURIComponent(ticketId)}${tabQuery}`;
};

/**
 * Generate rich responsive HTML email template for CreativeGini.
 */
const buildHtmlTemplate = ({
  preheader,
  headerBadge,
  title,
  subtitle,
  ticketCode,
  serviceName,
  statusLabel,
  statusColor = '#00E5FF',
  details = [],
  highlightBox = null,
  actionText = 'Open Ticket',
  actionUrl,
  note = null
}) => {
  const portalUrl = actionUrl || (process.env.PORTAL_BASE_URL || 'http://localhost:5174');

  const detailsRows = details.map(({ label, value }) => `
    <tr>
      <td style="padding: 9px 0; font-size: 13px; color: #94A3B8; font-weight: 500; width: 38%; vertical-align: top;">
        ${label}
      </td>
      <td style="padding: 9px 0; font-size: 13px; color: #F1F5F9; font-weight: 600; vertical-align: top;">
        ${value}
      </td>
    </tr>
  `).join('');

  const highlightHtml = highlightBox ? `
    <div style="margin: 20px 0; padding: 16px 18px; background: rgba(14, 27, 46, 0.85); border-left: 3px solid ${highlightBox.color || '#00E5FF'}; border-radius: 6px;">
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: ${highlightBox.color || '#00E5FF'}; font-weight: 700; margin-bottom: 6px;">
        ${highlightBox.title}
      </div>
      <div style="font-size: 14px; line-height: 1.6; color: #CBD5E1;">
        ${highlightBox.content}
      </div>
    </div>
  ` : '';

  const noteHtml = note ? `
    <div style="margin: 16px 0; font-size: 13px; line-height: 1.5; color: #94A3B8; font-style: italic;">
      ${note}
    </div>
  ` : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #060B13; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    table { border-collapse: collapse; }
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; padding: 12px !important; }
      .email-card { padding: 24px 18px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #060B13; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <!-- Preheader text for inbox preview -->
  <div style="display: none; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: #060B13;">
    ${preheader || title}
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #060B13; min-height: 100vh; padding: 32px 12px;">
    <tr>
      <td align="center" style="vertical-align: top;">
        
        <table class="email-container" width="560" cellpadding="0" cellspacing="0" border="0" style="width: 560px; max-width: 560px; text-align: left;">
          
          <!-- BRAND HEADER -->
          <tr>
            <td style="padding: 0 0 20px 0; text-align: center;">
              <a href="${portalUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
                <span style="font-size: 20px; font-weight: 800; letter-spacing: 2px; color: #FFFFFF;">
                  CREATIVE<span style="color: #00E5FF;">GINI</span>
                </span>
                <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 2.5px; color: #64748B; margin-top: 3px; font-weight: 600;">
                  Growth Operations Portal
                </div>
              </a>
            </td>
          </tr>

          <!-- MAIN CARD -->
          <tr>
            <td>
              <table class="email-card" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #0B1321; border: 1px solid rgba(0, 229, 255, 0.15); border-radius: 12px; padding: 32px 28px; box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);">
                
                <!-- BADGE & TICKET -->
                <tr>
                  <td>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td>
                          ${headerBadge ? `
                            <span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: ${statusColor}; background: rgba(0, 229, 255, 0.08); border: 1px solid ${statusColor}40; border-radius: 4px;">
                              ${headerBadge}
                            </span>
                          ` : ''}
                        </td>
                        <td align="right" style="text-align: right;">
                          <span style="font-size: 13px; font-family: monospace; font-weight: 700; color: #00E5FF; letter-spacing: 0.5px;">
                            ${ticketCode || ''}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- TITLE & SUBTITLE -->
                <tr>
                  <td style="padding: 20px 0 10px 0;">
                    <h1 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700; line-height: 1.3; color: #F8FAFC;">
                      ${title}
                    </h1>
                    <p style="margin: 0; font-size: 14px; line-height: 1.55; color: #94A3B8;">
                      ${subtitle}
                    </p>
                  </td>
                </tr>

                <!-- HIGHLIGHT BOX -->
                ${highlightHtml ? `<tr><td>${highlightHtml}</td></tr>` : ''}

                <!-- DETAILS GRID -->
                ${details.length > 0 ? `
                  <tr>
                    <td style="padding: 16px 0 20px 0;">
                      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 1px solid rgba(148, 163, 184, 0.12); border-bottom: 1px solid rgba(148, 163, 184, 0.12); margin: 8px 0;">
                        ${detailsRows}
                      </table>
                    </td>
                  </tr>
                ` : ''}

                ${noteHtml ? `<tr><td>${noteHtml}</td></tr>` : ''}

                <!-- CALL TO ACTION BUTTON -->
                <tr>
                  <td style="padding: 22px 0 10px 0; text-align: center;">
                    <a href="${portalUrl}" target="_blank" style="display: inline-block; padding: 13px 32px; background: #00E5FF; color: #040810; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 6px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(0, 229, 255, 0.3);">
                      ${actionText} &rarr;
                    </a>
                  </td>
                </tr>

                <!-- DIRECT LINK FALLBACK -->
                <tr>
                  <td style="padding: 16px 0 0 0; text-align: center;">
                    <span style="font-size: 11px; color: #64748B;">
                      Link not working? Paste this URL in your browser:<br>
                      <a href="${portalUrl}" style="color: #00E5FF; text-decoration: underline; word-break: break-all;">${portalUrl}</a>
                    </span>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding: 24px 12px 12px 12px; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #64748B;">
                CreativeGini &middot; Performance Marketing & Digital Growth Engine
              </p>
              <p style="margin: 0; font-size: 11px; color: #475569;">
                This is an automated notification from the CreativeGini client portal. Please do not reply directly to this email.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

/**
 * Generic dispatcher that handles transporter delivery, simulation fallback,
 * and error isolation. Never throws; always returns a result object.
 */
const sendEmail = async ({ to, subject, html, text, event, dedupeKey }) => {
  if (!to || !to.trim()) {
    console.warn(`[EMAIL WARNING] Skipped ${event} email: recipient address is empty.`);
    return { success: false, reason: 'missing_recipient' };
  }

  // Secondary layer: in-memory deduplication check
  if (dedupeKey && isDuplicateEmail(dedupeKey)) {
    console.log(`[EMAIL DEDUPE] Suppressed duplicate email for key: ${dedupeKey}`);
    return { success: true, deduplicated: true };
  }

  const from = process.env.EMAIL_FROM || 'CreativeGini <akhil.k@datai2i.com>';
  const transporter = getTransporter();

  // If SMTP is not configured, run in development/simulation mode
  if (!transporter) {
    console.log(`[EMAIL SIMULATION] [${event}]`);
    console.log(`  To:      ${to}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  From:    ${from}`);
    return {
      success: true,
      simulated: true,
      to,
      subject,
      event
    };
  }

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text: text || subject,
      html
    });

    console.log(`[EMAIL SENT] [${event}] to ${to} (MessageId: ${info.messageId})`);
    return {
      success: true,
      messageId: info.messageId,
      to,
      subject,
      event
    };
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send ${event} email to ${to}:`, error.message);
    return {
      success: false,
      error: error.message,
      to,
      subject,
      event
    };
  }
};

// ============================================================================
// 1. NEW TICKET ASSIGNMENT EMAIL (Sent to specialist)
// ============================================================================
export const sendTicketAssignedEmail = async ({ specialist, ticket, assignedBy }) => {
  try {
    if (!specialist?.email || !ticket?.ticketId) return { success: false, reason: 'invalid_payload' };

    const serviceName = formatServiceType(ticket.serviceType);
    const dedupeKey = `TICKET_ASSIGNED:${ticket.ticketId}:${specialist.email}`;
    const actionUrl = getTicketUrl(ticket.ticketId);

    const clientName = ticket.userId?.name || 'Client';
    const companyName = ticket.companyId?.name || '';
    const clientDisplay = companyName ? `${clientName} (${companyName})` : clientName;

    const subject = `New Ticket Assigned: ${ticket.ticketId} - ${ticket.title}`;
    const subtitle = `You have been assigned to lead the work on ticket ${ticket.ticketId}. Please review the scope and start work.`;

    const html = buildHtmlTemplate({
      preheader: `New ticket assigned: ${ticket.ticketId} - ${ticket.title}`,
      headerBadge: 'Ticket Assigned',
      statusColor: '#00E5FF',
      ticketCode: ticket.ticketId,
      serviceName,
      title: 'New Ticket Assigned to You',
      subtitle,
      details: [
        { label: 'Ticket ID', value: ticket.ticketId },
        { label: 'Service', value: serviceName },
        { label: 'Client', value: clientDisplay },
        { label: 'Priority', value: ticket.priority || 'MEDIUM' },
        { label: 'Assigned By', value: assignedBy?.name || 'System / Admin' },
        { label: 'Due Date', value: ticket.dueDate ? new Date(ticket.dueDate).toLocaleDateString() : 'Standard Sprint' }
      ],
      highlightBox: ticket.description ? {
        title: 'Project Scope / Brief',
        content: ticket.description,
        color: '#00E5FF'
      } : null,
      actionText: 'Open Ticket',
      actionUrl
    });

    const text = `New Ticket Assigned: ${ticket.ticketId}\n\nTitle: ${ticket.title}\nService: ${serviceName}\nClient: ${clientDisplay}\nAssigned By: ${assignedBy?.name || 'CreativeGini'}\n\nView Ticket: ${actionUrl}`;

    return await sendEmail({
      to: specialist.email,
      subject,
      html,
      text,
      event: 'TICKET_ASSIGNED',
      dedupeKey
    });
  } catch (err) {
    console.error('[EMAIL ERROR] sendTicketAssignedEmail:', err);
    return { success: false, error: err.message };
  }
};

// ============================================================================
// 2. WORK STARTED EMAIL (Sent to client)
// ============================================================================
export const sendWorkStartedEmail = async ({ client, ticket, specialist }) => {
  try {
    if (!client?.email || !ticket?.ticketId) return { success: false, reason: 'invalid_payload' };

    const serviceName = formatServiceType(ticket.serviceType);
    const dedupeKey = `WORK_STARTED:${ticket.ticketId}:${client.email}`;
    const actionUrl = getTicketUrl(ticket.ticketId);

    const specialistName = specialist?.name || ticket.assignedTo?.name || 'CreativeGini Specialist';
    const teamName = ticket.assignedTeam || `${serviceName} Team`;

    const subject = `Work Started: ${ticket.ticketId} - ${ticket.title}`;
    const subtitle = `Great news! Work has officially started on your ${serviceName} request.`;

    const html = buildHtmlTemplate({
      preheader: `Work started on ${ticket.ticketId}: ${ticket.title}`,
      headerBadge: 'In Progress',
      statusColor: '#00E5FF',
      ticketCode: ticket.ticketId,
      serviceName,
      title: 'Work Has Begun on Your Request',
      subtitle,
      details: [
        { label: 'Ticket ID', value: ticket.ticketId },
        { label: 'Service', value: serviceName },
        { label: 'Assigned Specialist', value: `${specialistName} (${teamName})` },
        { label: 'Status', value: 'IN PROGRESS' },
        { label: 'Started At', value: new Date().toLocaleString() }
      ],
      highlightBox: {
        title: 'What Happens Next?',
        content: 'Our team is actively executing your sprint requirements. You can track progress and communicate with your specialist directly through the portal.',
        color: '#00E5FF'
      },
      actionText: 'Open Ticket',
      actionUrl
    });

    const text = `Work Started: ${ticket.ticketId}\n\nTitle: ${ticket.title}\nService: ${serviceName}\nSpecialist: ${specialistName}\nStatus: IN PROGRESS\n\nTrack progress: ${actionUrl}`;

    return await sendEmail({
      to: client.email,
      subject,
      html,
      text,
      event: 'WORK_STARTED',
      dedupeKey
    });
  } catch (err) {
    console.error('[EMAIL ERROR] sendWorkStartedEmail:', err);
    return { success: false, error: err.message };
  }
};

// ============================================================================
// 3. TICKET PROGRESS / PORTAL UPDATE EMAIL (Sent to client)
// ============================================================================
export const sendTicketProgressEmail = async ({ client, ticket, specialist, updateText, updateNote }) => {
  try {
    if (!client?.email || !ticket?.ticketId) return { success: false, reason: 'invalid_payload' };

    const serviceName = formatServiceType(ticket.serviceType);
    const content = (updateText || updateNote || '').trim();
    // Unique key incorporating content hash or snippet to allow distinct progress updates
    const contentHash = content.slice(0, 30).replace(/\s+/g, '_');
    const dedupeKey = `TICKET_PROGRESS:${ticket.ticketId}:${client.email}:${contentHash}`;
    const actionUrl = getTicketUrl(ticket.ticketId, 'chat');

    const specialistName = specialist?.name || 'CreativeGini Specialist';

    const subject = `Ticket Update: ${ticket.ticketId} - ${ticket.title}`;
    const subtitle = `A new progress update has been posted to your ticket by ${specialistName}.`;

    const html = buildHtmlTemplate({
      preheader: `Update on ${ticket.ticketId}: ${content.slice(0, 80)}`,
      headerBadge: 'Progress Update',
      statusColor: '#38BDF8',
      ticketCode: ticket.ticketId,
      serviceName,
      title: 'Progress Update on Your Ticket',
      subtitle,
      details: [
        { label: 'Ticket ID', value: ticket.ticketId },
        { label: 'Service', value: serviceName },
        { label: 'Updated By', value: specialistName },
        { label: 'Updated At', value: new Date().toLocaleString() }
      ],
      highlightBox: {
        title: 'Specialist Note',
        content,
        color: '#38BDF8'
      },
      actionText: 'Open Ticket',
      actionUrl
    });

    const text = `Ticket Update: ${ticket.ticketId}\n\nTitle: ${ticket.title}\nUpdated By: ${specialistName}\nUpdate:\n${content}\n\nView ticket: ${actionUrl}`;

    return await sendEmail({
      to: client.email,
      subject,
      html,
      text,
      event: 'TICKET_PROGRESS',
      dedupeKey
    });
  } catch (err) {
    console.error('[EMAIL ERROR] sendTicketProgressEmail:', err);
    return { success: false, error: err.message };
  }
};

// ============================================================================
// 4. WORK SUBMITTED EMAIL (Sent to client for V1)
// ============================================================================
export const sendWorkSubmittedEmail = async ({ client, ticket, submission, specialist }) => {
  try {
    if (!client?.email || !ticket?.ticketId) return { success: false, reason: 'invalid_payload' };

    const serviceName = formatServiceType(ticket.serviceType);
    const dedupeKey = `WORK_SUBMITTED:${ticket.ticketId}:${submission?.version || 1}:${client.email}`;
    const actionUrl = getTicketUrl(ticket.ticketId, 'review');

    const specialistName = specialist?.name || 'CreativeGini Specialist';

    const subject = `Action Required: Work Submitted for ${ticket.ticketId}`;
    const subtitle = `Your completed deliverables for ticket ${ticket.ticketId} are now ready for your review and approval.`;

    const deliverableDetails = [
      { label: 'Ticket ID', value: ticket.ticketId },
      { label: 'Service', value: serviceName },
      { label: 'Deliverable Title', value: submission?.title || ticket.title },
      { label: 'Submission Version', value: `Version ${submission?.version || 1}` },
      { label: 'Submitted By', value: specialistName }
    ];

    if (submission?.externalLink) {
      deliverableDetails.push({
        label: 'External Assets',
        value: `<a href="${submission.externalLink}" target="_blank" style="color: #00E5FF; text-decoration: underline;">Open Deliverables &rarr;</a>`
      });
    }

    const html = buildHtmlTemplate({
      preheader: `Work ready for review on ${ticket.ticketId}`,
      headerBadge: 'Ready for Review',
      statusColor: '#A855F7',
      ticketCode: ticket.ticketId,
      serviceName,
      title: 'Your Work is Ready for Review',
      subtitle,
      details: deliverableDetails,
      highlightBox: submission?.description ? {
        title: 'Deliverable Summary & Notes',
        content: submission.description,
        color: '#A855F7'
      } : null,
      actionText: 'Open Ticket',
      actionUrl,
      note: 'Please inspect the deliverables. You can either approve the work to complete the ticket or request revisions directly in the portal.'
    });

    const text = `Work Submitted: ${ticket.ticketId}\n\nTitle: ${ticket.title}\nVersion: V${submission?.version || 1}\nSubmitted By: ${specialistName}\n\nPlease review and approve: ${actionUrl}`;

    return await sendEmail({
      to: client.email,
      subject,
      html,
      text,
      event: 'WORK_SUBMITTED',
      dedupeKey
    });
  } catch (err) {
    console.error('[EMAIL ERROR] sendWorkSubmittedEmail:', err);
    return { success: false, error: err.message };
  }
};

// ============================================================================
// 5. CHANGES REQUESTED EMAIL (Sent to specialist)
// ============================================================================
export const sendChangesRequestedEmail = async ({ specialist, ticket, feedback, client }) => {
  try {
    if (!specialist?.email || !ticket?.ticketId) return { success: false, reason: 'invalid_payload' };

    const serviceName = formatServiceType(ticket.serviceType);
    const dedupeKey = `CHANGES_REQUESTED:${ticket.ticketId}:${specialist.email}`;
    const actionUrl = getTicketUrl(ticket.ticketId, 'review');

    const clientName = client?.name || ticket.userId?.name || 'Client';

    const subject = `Changes Requested: ${ticket.ticketId} - ${ticket.title}`;
    const subtitle = `${clientName} has reviewed the submission and requested revisions.`;

    const html = buildHtmlTemplate({
      preheader: `Changes requested on ${ticket.ticketId}: ${feedback?.slice(0, 80)}`,
      headerBadge: 'Changes Requested',
      statusColor: '#F59E0B',
      ticketCode: ticket.ticketId,
      serviceName,
      title: 'Client Requested Changes',
      subtitle,
      details: [
        { label: 'Ticket ID', value: ticket.ticketId },
        { label: 'Service', value: serviceName },
        { label: 'Client', value: clientName },
        { label: 'Status', value: 'CHANGES REQUESTED' },
        { label: 'Requested At', value: new Date().toLocaleString() }
      ],
      highlightBox: {
        title: 'Client Revision Feedback',
        content: feedback || 'Please review the requested changes in the client portal.',
        color: '#F59E0B'
      },
      actionText: 'Open Ticket',
      actionUrl,
      note: 'Please make the requested adjustments and submit a new revision (V2+) through the portal once completed.'
    });

    const text = `Changes Requested: ${ticket.ticketId}\n\nTitle: ${ticket.title}\nClient: ${clientName}\nFeedback:\n${feedback}\n\nView details: ${actionUrl}`;

    return await sendEmail({
      to: specialist.email,
      subject,
      html,
      text,
      event: 'CHANGES_REQUESTED',
      dedupeKey
    });
  } catch (err) {
    console.error('[EMAIL ERROR] sendChangesRequestedEmail:', err);
    return { success: false, error: err.message };
  }
};

// ============================================================================
// 6. WORK RESUBMITTED EMAIL (Sent to client for V > 1)
// ============================================================================
export const sendWorkResubmittedEmail = async ({ client, ticket, submission, specialist }) => {
  try {
    if (!client?.email || !ticket?.ticketId) return { success: false, reason: 'invalid_payload' };

    const serviceName = formatServiceType(ticket.serviceType);
    const version = submission?.version || 2;
    const dedupeKey = `WORK_RESUBMITTED:${ticket.ticketId}:${version}:${client.email}`;
    const actionUrl = getTicketUrl(ticket.ticketId, 'review');

    const specialistName = specialist?.name || 'CreativeGini Specialist';

    const subject = `Revised Work Submitted: ${ticket.ticketId} (V${version})`;
    const subtitle = `The specialist has addressed your revision feedback and submitted a revised version (V${version}) for your review.`;

    const deliverableDetails = [
      { label: 'Ticket ID', value: ticket.ticketId },
      { label: 'Service', value: serviceName },
      { label: 'Submission Version', value: `Version ${version}` },
      { label: 'Revised By', value: specialistName },
      { label: 'Resubmitted At', value: new Date().toLocaleString() }
    ];

    if (submission?.externalLink) {
      deliverableDetails.push({
        label: 'Revised Assets',
        value: `<a href="${submission.externalLink}" target="_blank" style="color: #00E5FF; text-decoration: underline;">Open Revised Deliverables &rarr;</a>`
      });
    }

    const html = buildHtmlTemplate({
      preheader: `Revised work V${version} submitted on ${ticket.ticketId}`,
      headerBadge: `Revision V${version}`,
      statusColor: '#00E5FF',
      ticketCode: ticket.ticketId,
      serviceName,
      title: `Revised Work Submitted (V${version})`,
      subtitle,
      details: deliverableDetails,
      highlightBox: submission?.description ? {
        title: 'Revision Summary & Notes',
        content: submission.description,
        color: '#00E5FF'
      } : null,
      actionText: 'Open Ticket',
      actionUrl,
      note: 'Please review the updated deliverables. If everything meets your requirements, click "Approve Work" to finalize the ticket.'
    });

    const text = `Revised Work Submitted: ${ticket.ticketId} (V${version})\n\nTitle: ${ticket.title}\nRevised By: ${specialistName}\n\nReview revised work: ${actionUrl}`;

    return await sendEmail({
      to: client.email,
      subject,
      html,
      text,
      event: 'WORK_RESUBMITTED',
      dedupeKey
    });
  } catch (err) {
    console.error('[EMAIL ERROR] sendWorkResubmittedEmail:', err);
    return { success: false, error: err.message };
  }
};

// ============================================================================
// 7. WORK APPROVED EMAIL (Sent to specialist)
// ============================================================================
export const sendWorkApprovedEmail = async ({ specialist, ticket, client }) => {
  try {
    if (!specialist?.email || !ticket?.ticketId) return { success: false, reason: 'invalid_payload' };

    const serviceName = formatServiceType(ticket.serviceType);
    const dedupeKey = `WORK_APPROVED:${ticket.ticketId}:${specialist.email}`;
    const actionUrl = getTicketUrl(ticket.ticketId);

    const clientName = client?.name || ticket.userId?.name || 'Client';

    const subject = `Work Approved: ${ticket.ticketId} - ${ticket.title}`;
    const subtitle = `Congratulations! ${clientName} has approved the deliverables for ticket ${ticket.ticketId}.`;

    const html = buildHtmlTemplate({
      preheader: `Work approved on ${ticket.ticketId} by ${clientName}`,
      headerBadge: 'Work Approved',
      statusColor: '#10B981',
      ticketCode: ticket.ticketId,
      serviceName,
      title: 'Client Approved Your Work',
      subtitle,
      details: [
        { label: 'Ticket ID', value: ticket.ticketId },
        { label: 'Service', value: serviceName },
        { label: 'Approved By', value: clientName },
        { label: 'Approved At', value: new Date().toLocaleString() },
        { label: 'Ticket Status', value: 'COMPLETED' }
      ],
      highlightBox: {
        title: 'Sprint Finalized',
        content: `Great job delivering this sprint! The client has signed off on the work and the ticket has been successfully marked as COMPLETED.`,
        color: '#10B981'
      },
      actionText: 'Open Ticket',
      actionUrl
    });

    const text = `Work Approved: ${ticket.ticketId}\n\nTitle: ${ticket.title}\nApproved By: ${clientName}\nStatus: COMPLETED\n\nView ticket: ${actionUrl}`;

    return await sendEmail({
      to: specialist.email,
      subject,
      html,
      text,
      event: 'WORK_APPROVED',
      dedupeKey
    });
  } catch (err) {
    console.error('[EMAIL ERROR] sendWorkApprovedEmail:', err);
    return { success: false, error: err.message };
  }
};

// ============================================================================
// 8. TICKET COMPLETED EMAIL (Sent to client)
// ============================================================================
export const sendTicketCompletedEmail = async ({ client, ticket, completedBy, reason }) => {
  try {
    if (!client?.email || !ticket?.ticketId) return { success: false, reason: 'invalid_payload' };

    const serviceName = formatServiceType(ticket.serviceType);
    const dedupeKey = `TICKET_COMPLETED:${ticket.ticketId}:${client.email}`;
    const actionUrl = getTicketUrl(ticket.ticketId);

    const subject = `Ticket Completed: ${ticket.ticketId} - ${ticket.title}`;
    const subtitle = `Your request ${ticket.ticketId} has been successfully completed. Thank you for partnering with CreativeGini!`;

    const details = [
      { label: 'Ticket ID', value: ticket.ticketId },
      { label: 'Service', value: serviceName },
      { label: 'Status', value: 'COMPLETED' },
      { label: 'Completed At', value: new Date().toLocaleString() }
    ];

    if (completedBy) {
      details.push({ label: 'Closed By', value: completedBy.name || 'CreativeGini Team' });
    }

    const html = buildHtmlTemplate({
      preheader: `Ticket completed: ${ticket.ticketId} - ${ticket.title}`,
      headerBadge: 'Completed',
      statusColor: '#10B981',
      ticketCode: ticket.ticketId,
      serviceName,
      title: 'Ticket Successfully Completed',
      subtitle,
      details,
      highlightBox: reason ? {
        title: 'Completion Note',
        content: reason,
        color: '#10B981'
      } : {
        title: 'Sprint Complete',
        content: 'All deliverables have been finalized. You can access all project files, conversations, and audit history anytime in your client portal.',
        color: '#10B981'
      },
      actionText: 'Open Ticket',
      actionUrl
    });

    const text = `Ticket Completed: ${ticket.ticketId}\n\nTitle: ${ticket.title}\nService: ${serviceName}\nStatus: COMPLETED\n\nAccess portal: ${actionUrl}`;

    return await sendEmail({
      to: client.email,
      subject,
      html,
      text,
      event: 'TICKET_COMPLETED',
      dedupeKey
    });
  } catch (err) {
    console.error('[EMAIL ERROR] sendTicketCompletedEmail:', err);
    return { success: false, error: err.message };
  }
};
