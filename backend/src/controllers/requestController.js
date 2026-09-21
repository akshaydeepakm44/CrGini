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
  sendTicketAssignedEmail,
  sendWorkStartedEmail,
  sendTicketProgressEmail,
  sendTicketCompletedEmail,
} from '../services/emailService.js';

import { query } from '../config/postgres.js';

// Re-export for submissionController which imports from here
export { hasServiceTypeAccess, resolveRequest };

// Helper to generate unique Ticket ID
const generateTicketId = async () => {
  const result = await query(`
    SELECT ticket_id FROM requests
    WHERE ticket_id LIKE 'CG-%'
    ORDER BY created_at DESC
    LIMIT 1
  `);
  let maxNum = 1000;
  if (result.rows[0]) {
    const num = parseInt(result.rows[0].ticket_id.replace('CG-', ''), 10);
    if (!isNaN(num) && num > maxNum) maxNum = num;
  }
  // Check for highest ticket number overall
  const allResult = await query(`SELECT MAX(CAST(SUBSTRING(ticket_id FROM 4) AS INTEGER)) FROM requests WHERE ticket_id LIKE 'CG-%'`);
  if (allResult.rows[0].max && allResult.rows[0].max > maxNum) {
    maxNum = allResult.rows[0].max;
  }
  return `CG-${maxNum + 1}`;
};

// @desc    Create a new service request / ticket
// @route   POST /api/requests
// @access  Private (USER)
export const createRequest = async (req, res) => {
  try {
    const { serviceType, title, description, priority, price, notes } = req.body;

    if (!serviceType || !title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Service type, title, and description are required.'
      });
    }

    const userId = req.user.id || req.user._id;
    const companyId = req.user.companyId
      ? (req.user.companyId.id || req.user.companyId._id || req.user.companyId)
      : null;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'User does not have an associated company profile.'
      });
    }

    const teamMap = {
      COMPANY_LEAD: 'Company Lead Team',
      COMPANY_BOOST: 'Company Boost Team',
      LANDING_PAGE: 'Landing Page Enhancement Team'
    };

    const defaultPrice = serviceType === 'COMPANY_LEAD' ? 499
      : serviceType === 'COMPANY_BOOST' ? 799
      : 599;

    const ticketId = await generateTicketId();

    const request = await createRequestInDB({
      ticketId,
      userId,
      companyId,
      serviceType,
      title,
      description,
      priority: priority || 'MEDIUM',
      price: price || defaultPrice,
      assignedTeam: teamMap[serviceType] || 'CreativeGini Core Team',
      notes: notes || null,
      status: 'REQUEST_CREATED',
      paymentStatus: 'PENDING'
    });

    // Create activity log
    await createActivityLog({
      userId,
      userName: req.user.name,
      companyId,
      requestId: request.id,
      action: 'REQUEST_CREATED',
      details: `Ticket ${ticketId} created for ${serviceType.replace(/_/g, ' ')}.`
    });

    // Notify user
    await createNotification({
      userId,
      type: 'ASSIGNMENT',
      title: 'Request Ticket Created',
      message: `Your request ${ticketId} ("${title}") has been created. Proceed to payment to activate sprint.`,
      ticketId: request.id,
      ticketCode: ticketId
    });

    return res.status(201).json({
      success: true,
      request
    });
  } catch (error) {
    console.error('Create request error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create request',
      error: error.message
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
    } else if (role === 'ADMIN') {
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
      message: 'Failed to fetch requests',
      error: error.message
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
    } else if (role !== 'ADMIN' && !hasServiceTypeAccess(req.user, request.serviceType)) {
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
    return res.status(500).json({ success: false, message: error.message });
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

    if (req.user.role !== 'ADMIN' && !hasServiceTypeAccess(req.user, request.serviceType)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
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
    return res.status(500).json({ success: false, message: error.message });
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

    if (req.user.role !== 'ADMIN' && !hasServiceTypeAccess(req.user, request.serviceType)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
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
    return res.status(500).json({ success: false, message: error.message });
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
    return res.status(500).json({ success: false, message: error.message });
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

    const logs = await findActivityLogsByRequestId(request.id);

    return res.json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (error) {
    console.error('Get ticket activity error:', error);
    return res.status(500).json({ success: false, message: error.message });
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

    if (req.user.role !== 'ADMIN' && !hasServiceTypeAccess(req.user, request.serviceType)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    if (status === 'COMPLETED' && req.user.role !== 'ADMIN') {
      return res.status(400).json({
        success: false,
        message: 'Tickets cannot be directly marked COMPLETED. Please submit your work through the portal for client review.'
      });
    }

    const previousStatus = request.status;
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
    return res.status(500).json({ success: false, message: error.message });
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
    return res.status(500).json({ success: false, message: error.message });
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
    } else if (req.user.role !== 'ADMIN' && !hasServiceTypeAccess(req.user, request.serviceType)) {
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
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Post message to ticket conversation
// @route   POST /api/requests/:id/messages
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { text, isProgressUpdate } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Message text is required' });
    }

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
    } else if (req.user.role !== 'ADMIN' && !hasServiceTypeAccess(req.user, request.serviceType)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: You do not have permission to post messages to ${request.serviceType}.`
      });
    }

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
    return res.status(500).json({ success: false, message: error.message });
  }
};
