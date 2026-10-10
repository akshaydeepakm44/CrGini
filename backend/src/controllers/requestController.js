import {
  createRequest as createRequestInDB,
  findRequestById,
  listRequests,
  updateRequest,
  updateRequestStatus as updateRequestStatusInDB,
  countRequests,
} from '../repositories/requestRepository.js';

import {
  createPayment,
  countPayments,
} from '../repositories/paymentRepository.js';

import {
  createMessage,
  findMessagesByRequestId,
  markRequestMessagesRead,
  getUnreadMessageCountForUser,
} from '../repositories/messageRepository.js';

import {
  createNotification,
  markNotificationAsRead,
} from '../repositories/notificationRepository.js';

import {
  createActivityLog,
  findActivityLogsByRequestId,
} from '../repositories/activityLogRepository.js';

import {
  findUserById,
  findActiveSpecialists,
} from '../repositories/userRepository.js';

import {
  hasServiceTypeAccess,
  resolveRequest,
} from '../utils/ticketHelpers.js';

import {
  sendRequestCreatedEmail,
  sendTicketAssignedEmail,
  sendWorkStartedEmail,
  sendTicketProgressEmail,
  sendTicketCompletedEmail,
} from '../services/emailService.js';

import { query } from '../config/postgres.js';

const isAdmin = (u) => Boolean(u && (u.role === 'ADMIN' || u.role === 'SUPER_ADMIN'));

// Helper to generate unique Ticket ID with atomic max query
export const generateTicketId = async () => {
  const allResult = await query(`
    SELECT COALESCE(MAX(CAST(SUBSTRING(ticket_id FROM 4) AS INTEGER)), 1000) AS max_num 
    FROM requests 
    WHERE ticket_id ~ '^[A-Z]+-[0-9]+$'
  `);
  const maxNum = Number(allResult.rows[0]?.max_num || 1000);
  return `CG-${maxNum + 1}`;
};

// Authoritative backend pricing calculation engine
export const calculateServicePrice = ({ serviceType, subService, requirements = {}, selectedServices = [] }) => {
  let basePrice = 799;
  let breakdown = [];
  let serviceLabel = 'Company Boost Sprint';

  if (serviceType === 'COMPANY_LEAD' || serviceType === 'LEAD_RESEARCH') {
    if (subService === 'COMPANY_STUDY') {
      basePrice = 699;
      serviceLabel = 'Digitalising: Company Study Dossier Sprint';
      breakdown.push({ item: 'Account Architecture & Intelligence Mining', amount: 449 });
      breakdown.push({ item: 'Executive Briefing Dossier & Strategic Signals', amount: 250 });
    } else if (subService === 'KEY_PEOPLE') {
      basePrice = 599;
      serviceLabel = 'Digitalising: Key People Research Sprint';
      breakdown.push({ item: 'Executive Mapping & Hierarchy Verification', amount: 399 });
      breakdown.push({ item: 'Direct Channel Contact Signals & Verified Details', amount: 200 });
    } else if (subService === 'PITCH_SUPPORT') {
      basePrice = 799;
      serviceLabel = 'Digitalising: Pitch Support & Narrative Sprint';
      breakdown.push({ item: 'Core Narrative & Objection Engineering', amount: 499 });
      breakdown.push({ item: 'Collateral & Pitch Deck Optimization', amount: 300 });
    } else if (subService === 'CUSTOM') {
      basePrice = 799;
      serviceLabel = 'Digitalising: Custom Research Sprint';
      const count = Array.isArray(selectedServices) && selectedServices.length > 0 ? selectedServices.length : 1;
      breakdown.push({ item: `Custom Intelligence Scope (${count} Service Areas)`, amount: 799 });
    } else {
      basePrice = 499;
      serviceLabel = 'Digitalising: Target Lead Research Sprint';
      const countLabel = requirements.leadsCount ? `${requirements.leadsCount} Target Leads` : '50 Verified Leads';
      breakdown.push({ item: `Prospecting & Profile Discovery (${countLabel})`, amount: 349 });
      breakdown.push({ item: 'Direct Contact & Decision-Maker Verification', amount: 150 });
    }
  } else if (serviceType === 'LANDING_PAGE') {
    if (subService === 'UI_UX_AUDIT') {
      basePrice = 499;
      serviceLabel = 'UI / Design: UI/UX Audit & Usability Sprint';
      breakdown.push({ item: 'Heuristic Evaluation & Usability Diagnostics', amount: 299 });
      breakdown.push({ item: 'Annotated Interface Review & Severity Matrix', amount: 200 });
    } else if (subService === 'FIGMA_PROJECT') {
      basePrice = 599;
      serviceLabel = 'UI / Design: Figma Component System Sprint';
      breakdown.push({ item: 'Design System & Component Token Architecture', amount: 399 });
      breakdown.push({ item: 'Production-Ready Interactive Frames & Layouts', amount: 200 });
    } else if (subService === 'REDESIGN_REQUEST' || subService === 'REDESIGN') {
      basePrice = 599;
      serviceLabel = 'UI / Design: Full Page Redesign Sprint';
      breakdown.push({ item: 'High-Impact Hero & Conversion Layout Architecture', amount: 399 });
      breakdown.push({ item: 'Production Component Specs & Before/After Deck', amount: 200 });
    } else {
      basePrice = 599;
      serviceLabel = 'Landing Page Enhancement Sprint';
      breakdown.push({ item: 'UI/UX Enhancement Sprint', amount: 599 });
    }
  } else if (serviceType === 'COMPANY_BOOST') {
    if (subService === 'STRATEGIC_PLAN') {
      basePrice = 799;
      serviceLabel = 'Company Boost: Strategic Plan Sprint';
      breakdown.push({ item: 'Market & Positioning Architecture', amount: 499 });
      breakdown.push({ item: 'Outbound Playbook & Growth Sequencing', amount: 300 });
    } else if (subService === 'CONTENT') {
      basePrice = 799;
      serviceLabel = 'Company Boost: Content Production Sprint';
      breakdown.push({ item: 'Branded Poster & Visual Creative Assets', amount: 399 });
      breakdown.push({ item: 'High-Definition Product Showcase Video', amount: 400 });
    } else if (subService === 'DEVREL_PLAN' || subService === 'DEVREL') {
      basePrice = 799;
      serviceLabel = 'Company Boost: DevRel Strategy Sprint';
      breakdown.push({ item: 'Developer Ecosystem & Documentation Audit', amount: 499 });
      breakdown.push({ item: 'Technical Community & Outreach Roadmap', amount: 300 });
    } else if (subService === 'GTM_STRATEGY' || subService === 'GTM') {
      basePrice = 799;
      serviceLabel = 'Company Boost: GTM Strategy Sprint';
      breakdown.push({ item: 'GTM Launch Playbook & Channel Distribution Roadmap', amount: 499 });
      breakdown.push({ item: 'GTM Strategy Brochure & Collateral Deck', amount: 300 });
    } else if (subService === 'AD_CREATIVES' || subService === 'ADS' || subService === 'AD_CREATIVE') {
      basePrice = 799;
      serviceLabel = 'Company Boost: Ad Creatives Sprint';
      breakdown.push({ item: 'Multi-Format Visual Ad Creative Pack (1:1, 9:16, 16:9)', amount: 499 });
      breakdown.push({ item: 'Ad Copy Angles & Creative Testing Matrix', amount: 300 });
    } else if (subService === 'CUSTOM') {
      basePrice = 799;
      serviceLabel = 'Company Boost: Custom Scope Sprint';
      const count = Array.isArray(selectedServices) && selectedServices.length > 0 ? selectedServices.length : 1;
      breakdown.push({ item: `Custom Multidisciplinary Scope (${count} Service Areas)`, amount: 799 });
    } else {
      basePrice = 799;
      serviceLabel = 'Company Boost Growth Sprint';
      breakdown.push({ item: 'Standard Growth Operations Sprint', amount: 799 });
    }
  } else if (serviceType === 'APP_DEVELOPMENT' || serviceType === 'DEVELOPMENT') {
    if (subService === 'WEB_APP') {
      basePrice = 1499;
      serviceLabel = 'App Development: Web Application MVP Sprint';
      breakdown.push({ item: 'Full-Stack Architecture & Application Core', amount: 999 });
      breakdown.push({ item: 'Responsive Frontend, State & API Integration', amount: 500 });
    } else if (subService === 'MOBILE_APP') {
      basePrice = 1699;
      serviceLabel = 'App Development: Mobile App Sprint';
      breakdown.push({ item: 'Cross-Platform React Native Architecture', amount: 1199 });
      breakdown.push({ item: 'App Store / Play Store Build Pipeline', amount: 500 });
    } else if (subService === 'API_BACKEND') {
      basePrice = 1299;
      serviceLabel = 'App Development: Scalable API & Backend Sprint';
      breakdown.push({ item: 'Relational Schema, Indexing & Authentication Engine', amount: 799 });
      breakdown.push({ item: 'RESTful API Endpoints & Telemetry Testing', amount: 500 });
    } else {
      basePrice = 1499;
      serviceLabel = 'App Development Sprint';
      breakdown.push({ item: 'Turnkey Software Engineering Sprint', amount: 1499 });
    }
  } else if (serviceType === 'BUNDLE' || serviceType === 'CUSTOM_BUNDLE') {
    basePrice = 1299;
    serviceLabel = 'Specialist Bundle Sprint';
    const count = Array.isArray(selectedServices) && selectedServices.length > 0 ? selectedServices.length : 1;
    breakdown.push({ item: `Selected Multi-Service Bundle (${count} Services Included)`, amount: 1299 });
  }

  return {
    price: basePrice,
    currency: 'USD',
    pricingStatus: 'CONFIGURED',
    serviceLabel,
    breakdown
  };
};

// @desc    Calculate authoritative configured price for service requirements
// @route   POST /api/requests/calculate-price
// @access  Private (USER, ADMIN)
export const calculateRequestPrice = async (req, res) => {
  try {
    const { serviceType = 'COMPANY_BOOST', subService, requirements = {}, selectedServices = [] } = req.body;
    const pricing = calculateServicePrice({ serviceType, subService, requirements, selectedServices });
    return res.json({
      success: true,
      ...pricing
    });
  } catch (error) {
    console.error('Calculate price error:', error);
    return res.status(500).json({ success: false, message: 'Failed to calculate price.' });
  }
};

// @desc    Create a new service request / ticket
// @route   POST /api/requests
// @access  Private (USER)
export const createRequest = async (req, res) => {
  try {
    const { serviceType, subService, title, description, priority, notes, requirements, selectedServices } = req.body;

    if (!serviceType || !title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Service type, title, and description are required.'
      });
    }

    let userId = req.user?.id || req.user?._id;
    let companyId = req.user?.companyId
      ? (req.user.companyId.id || req.user.companyId._id || req.user.companyId)
      : null;

    if (!userId || !companyId) {
      // Look up primary client (preferring Data I2I or first active client)
      const fallbackClient = await query(`
        SELECT u.id as user_id, u.company_id, u.name, u.email
        FROM users u 
        WHERE u.role = 'USER' AND u.status = 'ACTIVE' AND u.company_id IS NOT NULL 
        ORDER BY CASE WHEN u.email = 'testclient@datai2i.com' THEN 0 ELSE 1 END, u.id ASC
        LIMIT 1
      `);
      if (fallbackClient.rows[0]) {
        userId = fallbackClient.rows[0].user_id;
        companyId = fallbackClient.rows[0].company_id;
        if (!req.user || req.user.role !== 'USER') {
          req.user = {
            id: userId,
            name: fallbackClient.rows[0].name,
            email: fallbackClient.rows[0].email,
            role: 'USER',
            companyId
          };
        }
      } else {
        return res.status(400).json({
          success: false,
          message: 'No client profile found to associate this request. Please sign in or register.'
        });
      }
    }

    const teamMap = {
      COMPANY_LEAD: 'Company Lead Team',
      COMPANY_BOOST: 'Company Boost Team',
      LANDING_PAGE: 'Landing Page Enhancement Team',
      APP_DEVELOPMENT: 'App Development Engineering Team',
      DEVELOPMENT: 'App Development Engineering Team',
      BUNDLE: 'Specialist Pod Coordination Team',
      CUSTOM_BUNDLE: 'Specialist Pod Coordination Team'
    };

    // Authoritative backend price calculation:
    // The backend is the sole source of truth for the price.
    // Client-provided price inputs are never trusted to prevent devtools manipulation.
    const pricing = calculateServicePrice({ serviceType, subService, requirements, selectedServices });
    const finalPrice = pricing.price;

    let finalNotes = notes || null;
    if (requirements && typeof requirements === 'object' && Object.keys(requirements).length > 0) {
      finalNotes = JSON.stringify({
        subService,
        requirements,
        selectedServices: selectedServices || [],
        pricing: {
          price: finalPrice,
          currency: pricing.currency,
          status: pricing.pricingStatus,
          breakdown: pricing.breakdown
        },
        submittedAt: new Date().toISOString()
      });
    }

    // Attempt insertion with retry loop in case of race condition / unique collision
    let request = null;
    let attempts = 0;
    let lastInsertError = null;

    while (!request && attempts < 4) {
      attempts++;
      const ticketId = await generateTicketId();
      try {
        request = await createRequestInDB({
          ticketId,
          userId,
          companyId,
          serviceType,
          title,
          description,
          priority: priority || 'MEDIUM',
          price: finalPrice,
          assignedTeam: teamMap[serviceType] || 'CreativeGini Core Team',
          notes: finalNotes,
          status: 'REQUEST_CREATED',
          paymentStatus: 'PAID'
        });
      } catch (insertErr) {
        lastInsertError = insertErr;
        // Postgres error code 23505 = unique_violation (e.g. ticket_id collision)
        if (insertErr.code === '23505' && attempts < 4) {
          console.warn(`[CreateRequest] Ticket ID collision on ${ticketId}, retrying attempt ${attempts}...`);
          continue;
        }
        throw insertErr;
      }
    }

    if (!request) {
      throw lastInsertError || new Error('Failed to generate a unique ticket ID.');
    }

    // Create activity log (guarded)
    try {
      await createActivityLog({
        userId,
        userName: req.user?.name || 'Client User',
        companyId,
        requestId: request.id,
        action: 'REQUEST_CREATED',
        details: `Ticket ${request.ticketId} created for ${serviceType.replace(/_/g, ' ')}.`
      });
    } catch (logErr) {
      console.warn('[CreateRequest] Activity log failed (non-fatal):', logErr.message);
    }

    // Notify user (guarded)
    try {
      await createNotification({
        userId,
        type: 'ASSIGNMENT',
        title: 'Request Ticket Submitted',
        message: `Your request ${request.ticketId} ("${title}") has been received and assigned to the specialist team.`,
        ticketId: request.id,
        ticketCode: request.ticketId
      });
    } catch (notifErr) {
      console.warn('[CreateRequest] Notification failed (non-fatal):', notifErr.message);
    }

    // Safeguard: Trigger Request Created confirmation email to the user
    sendRequestCreatedEmail({
      client: req.user,
      ticket: request
    }).catch(err => console.error('[EMAIL DISPATCH ERROR]:', err.message));

    // If an assigned specialist was assigned during creation, trigger assignment email
    if (request.assignedTo) {
      let specialistUser = request.assignedTo;
      const assignedId = request.assignedTo?.id || request.assignedTo?._id || request.assignedTo;
      if (!specialistUser?.email && assignedId) {
        specialistUser = await findUserById(assignedId).catch(() => null);
      }
      if (specialistUser?.email) {
        sendTicketAssignedEmail({
          specialist: specialistUser,
          ticket: request,
          assignedBy: req.user
        }).catch(err => console.error('[EMAIL DISPATCH ERROR]:', err.message));
      }
    }

    return res.status(201).json({
      success: true,
      request
    });
  } catch (error) {
    console.error('Create request error:', error);
    const isDbConnError = error.code === 'ECONNREFUSED' || error.message?.includes('connection') || error.message?.includes('password authentication');
    return res.status(isDbConnError ? 503 : 500).json({
      success: false,
      message: isDbConnError
        ? 'Database connection is temporarily unavailable. Please verify PostgreSQL service and credentials.'
        : (error.message || 'Failed to create request. Please try again.')
    });
  }
};

// @desc    Get all requests filtered by role permissions
// @route   GET /api/requests
// @access  Private
export const getRequests = async (req, res) => {
  try {
    const { role } = req.user;
    let queryParams = {};

    if (role === 'USER') {
      const companyId = req.user.companyId
        ? (req.user.companyId.id || req.user.companyId._id || req.user.companyId)
        : null;
      queryParams = { companyId };
    } else if (isAdmin(req.user)) {
      queryParams = {};
    } else {
      const access = req.user.dashboardAccess || {};
      const allowedServices = [];
      if (access.companyLead) allowedServices.push('COMPANY_LEAD');
      if (access.companyBoost) allowedServices.push('COMPANY_BOOST');
      if (access.companyUI) allowedServices.push('LANDING_PAGE');

      if (allowedServices.length === 0) {
        return res.json({ success: true, count: 0, requests: [] });
      }
      queryParams = { serviceTypes: allowedServices };
    }

    const requests = await listRequests({ ...queryParams, limit: 200 });

    return res.json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    console.error('Get requests error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch requests. Please try again.'
    });
  }
};

// @desc    Get single request by ID with permission checks
// @route   GET /api/requests/:id
// @access  Private
export const getRequestById = async (req, res) => {
  try {
    const request = await resolveRequest(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request ticket not found'
      });
    }

    // Role security check
    const { role } = req.user;
    if (role === 'USER') {
      const userCompanyId = req.user.companyId
        ? String(req.user.companyId.id || req.user.companyId._id || req.user.companyId)
        : null;
      const requestCompanyId = request.companyId
        ? String(request.companyId.id || request.companyId._id || request.companyId)
        : null;
      if (userCompanyId !== requestCompanyId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this ticket'
        });
      }
    } else if (!isAdmin(req.user) && !hasServiceTypeAccess(req.user, request.serviceType)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view tickets outside your permitted dashboards'
      });
    }

    return res.json({
      success: true,
      request
    });
  } catch (error) {
    console.error('Get request by id error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch request details. Please try again.' });
  }
};

// @desc    Assign ticket to team member and set due date
// @route   POST /api/requests/:id/assign
// @access  Private (Admin and Service Team Leads)
export const assignTicket = async (req, res) => {
  try {
    const { assignedTo, assignedTeam, dueDate } = req.body;
    const request = await resolveRequest(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    if (!isAdmin(req.user) && !hasServiceTypeAccess(req.user, request.serviceType)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    if (request.status === 'COMPLETED') {
      return res.status(400).json({ success: false, message: 'Cannot reassign a completed ticket.' });
    }
    if (request.status === 'CLIENT_REVIEW' || request.status === 'WORK_SUBMITTED' || request.status === 'WORK_RESUBMITTED') {
      return res.status(400).json({ success: false, message: 'Cannot reassign a ticket that is currently in client review.' });
    }

    let assignedUser = null;
    if (assignedTo) {
      assignedUser = await findUserById(assignedTo);
      if (!assignedUser) {
        return res.status(400).json({ success: false, message: 'Assigned specialist user not found' });
      }
    }

    const prevAssignedId = request.assignedTo?.id || request.assignedTo?._id || request.assignedTo;
    const isNewAssignment = assignedUser && String(prevAssignedId) !== String(assignedUser.id);

    const updates = {};
    if (assignedUser) updates.assignedTo = assignedUser.id;
    if (assignedTeam) updates.assignedTeam = assignedTeam;
    if (dueDate) updates.dueDate = new Date(dueDate);
    if (request.status === 'REQUEST_CREATED' || request.status === 'PAYMENT_COMPLETED') {
      updates.status = 'ASSIGNED';
    }

    const updatedRequest = await updateRequest(request.id, updates);

    if (assignedUser) {
      await createNotification({
        userId: assignedUser.id,
        type: 'ASSIGNMENT',
        title: 'New ticket assigned',
        message: `Ticket ${request.ticketId}: "${request.title}" has been assigned to you by CreativeGini.`,
        ticketId: request.id,
        ticketCode: request.ticketId
      });

      // Safeguard 1: Trigger email ONLY when actually assigned or reassigned to a different user
      if (isNewAssignment) {
        sendTicketAssignedEmail({
          specialist: assignedUser,
          ticket: updatedRequest || request,
          assignedBy: req.user
        }).catch(err => console.error('[EMAIL DISPATCH ERROR]:', err));
      }
    }

    await createActivityLog({
      userId: req.user.id || req.user._id,
      userName: req.user.name,
      companyId: request.companyId?.id || request.companyId,
      requestId: request.id,
      action: 'TICKET_ASSIGNED',
      details: `Ticket ${request.ticketId} assigned to ${assignedUser ? assignedUser.name : 'Team'} (${updatedRequest.assignedTeam}).`
    });

    return res.json({
      success: true,
      message: `Ticket successfully assigned to ${assignedUser ? assignedUser.name : updatedRequest.assignedTeam}.`,
      request: updatedRequest
    });
  } catch (error) {
    console.error('Assign ticket error:', error);
    return res.status(500).json({ success: false, message: 'Failed to assign ticket. Please try again.' });
  }
};

// @desc    Start work on a ticket (set to IN_PROGRESS)
// @route   POST /api/requests/:id/start-work
// @access  Private (Internal teams & Admin)
export const startWork = async (req, res) => {
  try {
    const request = await resolveRequest(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    if (!isAdmin(req.user) && !hasServiceTypeAccess(req.user, request.serviceType)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    if (request.status === 'COMPLETED') {
      return res.status(400).json({ success: false, message: 'Cannot start work on a ticket that has already been completed.' });
    }

    const wasAlreadyInProgress = request.status === 'IN_PROGRESS';
    const updatedRequest = await updateRequest(request.id, { status: 'IN_PROGRESS' });

    await createActivityLog({
      userId: req.user.id || req.user._id,
      userName: req.user.name,
      companyId: request.companyId?.id || request.companyId,
      requestId: request.id,
      action: 'WORK_STARTED',
      details: `Work started on ${request.ticketId} by ${req.user.name}.`
    });

    // Safeguard 1: Trigger email ONLY upon actual state transition to IN_PROGRESS
    if (!wasAlreadyInProgress) {
      let clientUser = request.userId;
      const clientUserId = request.userId?.id || request.userId?._id || request.userId;
      if (!clientUser?.email && clientUserId) {
        clientUser = await findUserById(clientUserId).catch(() => null);
      }
      if (clientUser?.email) {
        sendWorkStartedEmail({
          client: clientUser,
          ticket: updatedRequest || request,
          specialist: req.user
        }).catch(err => console.error('[EMAIL DISPATCH ERROR]:', err));
      }
    }

    return res.json({
      success: true,
      message: 'Work marked IN PROGRESS.',
      request: updatedRequest
    });
  } catch (error) {
    console.error('Start work error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update ticket status. Please try again.' });
  }
};

// @desc    Admin override to complete a ticket in exceptional cases
// @route   POST /api/requests/:id/admin-override
// @access  Private (ADMIN only)
export const adminOverride = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A detailed reason is required for an administrative override.'
      });
    }

    const request = await resolveRequest(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const wasAlreadyCompleted = request.status === 'COMPLETED';

    // Use raw query for admin override fields
    await query(`
      UPDATE requests SET
        status = 'COMPLETED',
        completed_at = NOW(),
        admin_override = true,
        admin_override_reason = $1,
        admin_overridden_by = $2,
        admin_overridden_at = NOW()
      WHERE id = $3
    `, [reason.trim(), req.user.id || req.user._id, request.id]);

    const updatedRequest = await findRequestById(request.id);

    await createActivityLog({
      userId: req.user.id || req.user._id,
      userName: req.user.name,
      companyId: request.companyId?.id || request.companyId,
      requestId: request.id,
      action: 'ADMIN_OVERRIDE',
      details: `Administrator override performed by ${req.user.name}. Ticket marked COMPLETED. Reason: "${reason.trim()}".`
    });

    // Safeguard 1: Trigger completion email ONLY on actual transition to COMPLETED
    if (!wasAlreadyCompleted) {
      let clientUser = request.userId;
      const clientUserId = request.userId?.id || request.userId?._id || request.userId;
      if (!clientUser?.email && clientUserId) {
        clientUser = await findUserById(clientUserId).catch(() => null);
      }
      if (clientUser?.email) {
        sendTicketCompletedEmail({
          client: clientUser,
          ticket: updatedRequest || request,
          completedBy: req.user,
          reason: reason.trim()
        }).catch(err => console.error('[EMAIL DISPATCH ERROR]:', err));
      }
    }

    return res.json({
      success: true,
      message: 'Administrative completion override recorded.',
      request: updatedRequest
    });
  } catch (error) {
    console.error('Admin override error:', error);
    return res.status(500).json({ success: false, message: 'Failed to complete administrative override. Please try again.' });
  }
};

// @desc    Get ticket activity logs
// @route   GET /api/requests/:id/activity
// @access  Private
export const getTicketActivity = async (req, res) => {
  try {
    const request = await resolveRequest(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Role security check
    const { role } = req.user;
    if (role === 'USER') {
      const userCompanyId = req.user.companyId
        ? String(req.user.companyId.id || req.user.companyId._id || req.user.companyId)
        : null;
      const requestCompanyId = request.companyId
        ? String(request.companyId.id || request.companyId._id || request.companyId)
        : null;
      const userId = req.user.id || req.user._id;
      const requestUserId = String(request.userId?.id || request.userId?._id || request.userId || request.user_id);
      if (userCompanyId !== requestCompanyId && requestUserId !== String(userId)) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view activity for this ticket'
        });
      }
    } else if (!isAdmin(req.user) && !hasServiceTypeAccess(req.user, request.serviceType)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view ticket activity outside your permitted dashboards'
      });
    }

    const logs = await findActivityLogsByRequestId(request.id);

    return res.json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (error) {
    console.error('Get ticket activity error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load ticket activity. Please try again.' });
  }
};

// @desc    Update request status
// @route   PATCH /api/requests/:id/status
// @access  Private (Internal teams & Admin)
export const updateRequestStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const request = await resolveRequest(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    if (!isAdmin(req.user) && !hasServiceTypeAccess(req.user, request.serviceType)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    if (status === 'COMPLETED' && !isAdmin(req.user)) {
      return res.status(400).json({
        success: false,
        message: 'Tickets cannot be directly marked COMPLETED. Please submit your work through the portal for client review.'
      });
    }

    const previousStatus = request.status;

    // Reject transitions from COMPLETED (unless using admin-override endpoint)
    if (previousStatus === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Completed tickets cannot be reopened or changed via status update.'
      });
    }

    // Reject direct completion from early request states
    if ((previousStatus === 'REQUEST_CREATED' || previousStatus === 'PAYMENT_COMPLETED') && status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Invalid status transition: A newly created ticket cannot be marked completed directly without work and review.'
      });
    }

    // Reject reverting from CLIENT_REVIEW to ASSIGNED
    if ((previousStatus === 'CLIENT_REVIEW' || previousStatus === 'WORK_SUBMITTED' || previousStatus === 'WORK_RESUBMITTED') && status === 'ASSIGNED') {
      return res.status(400).json({
        success: false,
        message: 'Invalid status transition: Tickets under client review cannot be reverted to assigned.'
      });
    }

    const updatedRequest = await updateRequest(request.id, { status });

    await createActivityLog({
      userId: req.user.id || req.user._id,
      userName: req.user.name,
      companyId: request.companyId?.id || request.companyId,
      requestId: request.id,
      action: 'STATUS_UPDATE',
      details: `Status changed from ${previousStatus} to ${status}. ${note || ''}`
    });

    // Safeguard 1 & 3: Check state transition and meaningful update
    let clientUser = request.userId;
    const clientUserId = request.userId?.id || request.userId?._id || request.userId;
    if (!clientUser?.email && clientUserId) {
      clientUser = await findUserById(clientUserId).catch(() => null);
    }

    if (status === 'COMPLETED' && previousStatus !== 'COMPLETED') {
      if (clientUser?.email) {
        sendTicketCompletedEmail({
          client: clientUser,
          ticket: updatedRequest || request,
          completedBy: req.user,
          reason: note || undefined
        }).catch(err => console.error('[EMAIL DISPATCH ERROR]:', err));
      }
    } else if (status === 'IN_PROGRESS' && previousStatus !== 'IN_PROGRESS') {
      if (clientUser?.email) {
        sendWorkStartedEmail({
          client: clientUser,
          ticket: updatedRequest || request,
          specialist: req.user
        }).catch(err => console.error('[EMAIL DISPATCH ERROR]:', err));
      }
    } else if (note && note.trim().length > 0 && previousStatus !== status) {
      if (clientUser?.email) {
        sendTicketProgressEmail({
          client: clientUser,
          ticket: updatedRequest || request,
          specialist: req.user,
          updateNote: `Status updated to ${status}: ${note.trim()}`
        }).catch(err => console.error('[EMAIL DISPATCH ERROR]:', err));
      }
    }

    return res.json({
      success: true,
      request: updatedRequest
    });
  } catch (error) {
    console.error('Update request status error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update request status. Please try again.' });
  }
};

// @desc    Simulate/Process request payment
// @route   POST /api/requests/:id/pay
// @access  Private (USER, ADMIN)
export const processPayment = async (req, res) => {
  try {
    const request = await resolveRequest(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Role & Tenant Security: Only client owner or admin can pay
    if (req.user.role === 'USER') {
      const userCompanyId = req.user.companyId
        ? String(req.user.companyId.id || req.user.companyId._id || req.user.companyId)
        : null;
      const requestCompanyId = request.companyId
        ? String(request.companyId.id || request.companyId._id || request.companyId)
        : null;
      const userId = String(req.user.id || req.user._id);
      const requestUserId = String(request.userId?.id || request.userId?._id || request.userId || request.user_id);
      if (userCompanyId !== requestCompanyId && requestUserId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to process payment for this ticket.'
        });
      }
    } else if (!isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Only clients or administrators can process ticket payments.'
      });
    }

    // Duplicate payment prevention
    if (request.paymentStatus === 'PAID') {
      return res.status(400).json({
        success: false,
        message: 'This ticket has already been paid.'
      });
    }

    const updates = { paymentStatus: 'PAID' };
    let specialist = null;

    if (request.status === 'REQUEST_CREATED') {
      // Auto-assign to active specialist for this service type
      const specialists = await findActiveSpecialists(request.serviceType);
      specialist = specialists[0] || null;

      if (specialist) {
        updates.assignedTo = specialist.id;
        updates.status = 'ASSIGNED';

        await createNotification({
          userId: specialist.id,
          type: 'ASSIGNMENT',
          title: 'New paid ticket assigned',
          message: `Ticket ${request.ticketId}: "${request.title}" has been paid and assigned to you.`,
          ticketId: request.id,
          ticketCode: request.ticketId
        });

        // Safeguard 1: Trigger assignment email on state transition to ASSIGNED
        sendTicketAssignedEmail({
          specialist,
          ticket: { ...request, ...updates },
          assignedBy: { name: 'Automated Sprint Assignment' }
        }).catch(err => console.error('[EMAIL DISPATCH ERROR]:', err));
      } else {
        updates.status = 'PAYMENT_COMPLETED';
      }
    }

    const updatedRequest = await updateRequest(request.id, updates);

    // Generate invoice number
    const paymentCount = await countPayments();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${1000 + paymentCount + 1}`;

    const payment = await createPayment({
      invoiceNumber,
      requestId: request.id,
      userId: req.user.id || req.user._id,
      companyId: request.companyId?.id || request.companyId,
      amount: request.price,
      currency: 'USD',
      status: 'PAID',
      paidAt: new Date(),
      paymentMethod: req.body.paymentMethod || 'Stripe Corporate Card'
    });

    await createActivityLog({
      userId: req.user.id || req.user._id,
      userName: req.user.name,
      companyId: request.companyId?.id || request.companyId,
      requestId: request.id,
      action: 'PAYMENT_SUCCESS',
      details: `Payment of $${request.price} completed for ${request.ticketId}. Invoice: ${invoiceNumber}`
    });

    return res.json({
      success: true,
      message: 'Payment completed successfully. Ticket is now active.',
      request: updatedRequest,
      payment
    });
  } catch (error) {
    console.error('Process payment error:', error);
    return res.status(500).json({ success: false, message: 'Failed to process payment. Please try again.' });
  }
};

// @desc    Get ticket conversation messages
// @route   GET /api/requests/:id/messages
// @access  Private
export const getMessages = async (req, res) => {
  try {
    const request = await resolveRequest(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const userId = req.user.id || req.user._id;

    // Authorization check
    if (req.user.role === 'USER') {
      const requestUserId = String(request.userId?.id || request.userId?._id || request.userId);
      if (requestUserId !== String(userId)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view conversations for your own tickets.'
        });
      }
    } else if (!isAdmin(req.user) && !hasServiceTypeAccess(req.user, request.serviceType)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: You do not have permission to access conversations for ${request.serviceType}.`
      });
    }

    const messages = await findMessagesByRequestId(request.id);

    // Mark messages as read for this user
    await markRequestMessagesRead(request.id, userId).catch(() => {});

    // Mark message notifications as read
    await query(`
      UPDATE notifications
      SET is_read = true
      WHERE user_id = $1
        AND ticket_id = $2
        AND type = 'NEW_MESSAGE'
        AND is_read = false
    `, [userId, request.id]);

    return res.json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Get messages error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load messages. Please try again.' });
  }
};

// @desc    Get total unread messages count for current user
// @route   GET /api/requests/messages/unread-count
// @access  Private
export const getUnreadMessagesCount = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const count = await getUnreadMessageCountForUser(userId);
    return res.json({
      success: true,
      unreadCount: count || 0
    });
  } catch (error) {
    console.error('Get unread messages count error:', error);
    return res.status(500).json({ success: false, message: 'Failed to count unread messages.' });
  }
};

// @desc    Post message to ticket conversation
// @route   POST /api/requests/:id/messages
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const request = await resolveRequest(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const userId = req.user.id || req.user._id;

    if (req.user.role === 'USER') {
      const requestUserId = String(request.userId?.id || request.userId?._id || request.userId);
      if (requestUserId !== String(userId)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only post messages to your own tickets.'
        });
      }
    } else if (!isAdmin(req.user) && !hasServiceTypeAccess(req.user, request.serviceType)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: You do not have permission to post messages to ${request.serviceType}.`
      });
    }

    const rawText = req.body.text || req.body.message;
    const isProgressUpdate = Boolean(req.body.isProgressUpdate);
    if (!rawText || !rawText.trim()) {
      return res.status(400).json({ success: false, message: 'Message text is required' });
    }
    const text = rawText.trim();

    const message = await createMessage({
      requestId: request.id,
      senderId: userId,
      senderName: req.user.name,
      senderRole: req.user.role,
      text: text.trim()
    });

    // Notify counterparty
    if (req.user.role === 'USER') {
      // Notify assigned specialist or team specialists
      const recipients = [];
      if (request.assignedTo) {
        const assignedId = request.assignedTo?.id || request.assignedTo?._id || request.assignedTo;
        if (assignedId) recipients.push(String(assignedId));
      }

      if (recipients.length === 0) {
        // Find specialists with access
        const specialists = await findActiveSpecialists(request.serviceType);
        recipients.push(...specialists.map(s => String(s.id)));
      }

      for (const recId of recipients) {
        await createNotification({
          userId: recId,
          type: 'NEW_MESSAGE',
          title: `New message on ${request.ticketId}`,
          message: `${req.user.name} sent a new message on ${request.ticketId}: "${request.title}".`,
          ticketId: request.id,
          ticketCode: request.ticketId
        });

        // Dispatch SMTP email notification to lead/specialist
        findUserById(recId).then(specialistUser => {
          if (specialistUser?.email) {
            sendTicketProgressEmail({
              client: specialistUser,
              ticket: request,
              specialist: req.user,
              updateText: `New client message from ${req.user.name}: "${text}"`
            }).catch(e => console.error('[SMTP NOTIF ERROR]:', e));
          }
        }).catch(() => {});
      }
    } else {
      // Internal specialist or Admin replied -> notify the client user
      const clientUserId = request.userId?.id || request.userId?._id || request.userId;
      if (clientUserId) {
        await createNotification({
          userId: String(clientUserId),
          type: 'NEW_MESSAGE',
          title: `New message on ${request.ticketId}`,
          message: `${req.user.name} (${request.assignedTeam || 'CreativeGini Team'}) sent a new message on ${request.ticketId}.`,
          ticketId: request.id,
          ticketCode: request.ticketId
        });

        // Safeguard 3: Only email client if this message is an explicit progress update or prefixed with progress tags
        const trimmedText = text.trim();
        const hasProgressPrefix = /^(\[update\]|\[progress\]|update:|progress:)/i.test(trimmedText);
        const isMeaningfulUpdate = Boolean(isProgressUpdate || hasProgressPrefix);

        if (isMeaningfulUpdate) {
          let clientUser = request.userId;
          if (!clientUser?.email) {
            clientUser = await findUserById(clientUserId).catch(() => null);
          }
          if (clientUser?.email) {
            sendTicketProgressEmail({
              client: clientUser,
              ticket: request,
              specialist: req.user,
              updateText: trimmedText
            }).catch(err => console.error('[EMAIL DISPATCH ERROR]:', err));
          }
        }
      }
    }

    return res.status(201).json({
      success: true,
      message
    });
  } catch (error) {
    console.error('Send message error:', error);
    return res.status(500).json({ success: false, message: 'Failed to send message. Please try again.' });
  }
};
