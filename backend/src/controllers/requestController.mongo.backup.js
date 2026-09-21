import Request from '../models/Request.js';
import Message from '../models/Message.js';
import Payment from '../models/Payment.js';
import ActivityLog from '../models/ActivityLog.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { resolveRequest } from './submissionController.js';

// Helper to generate unique, collision-free Ticket ID
const generateTicketId = async () => {
  const requests = await Request.find({}, 'ticketId').lean();
  let maxNum = 1000;
  for (const r of requests) {
    if (r.ticketId && typeof r.ticketId === 'string' && r.ticketId.startsWith('CG-')) {
      const num = parseInt(r.ticketId.replace('CG-', ''), 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  }
  let nextNum = maxNum + 1;
  while (await Request.exists({ ticketId: `CG-${nextNum}` })) {
    nextNum++;
  }
  return `CG-${nextNum}`;
};

// @desc    Create a new service request / ticket
// @route   POST /api/requests
// @access  Private (USER)
export const createRequest = async (req, res) => {
  try {
    const { serviceType, title, description, priority, price, notes, attachments } = req.body;

    if (!serviceType || !title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Service type, title, and description are required.'
      });
    }

    if (!req.user.companyId) {
      return res.status(400).json({
        success: false,
        message: 'User does not have an associated company profile.'
      });
    }

    // Team assignment based on service
    const teamMap = {
      COMPANY_LEAD: 'Company Lead Team',
      COMPANY_BOOST: 'Company Boost Team',
      LANDING_PAGE: 'Landing Page Enhancement Team'
    };

    let request = null;
    let ticketId = '';
    let attempts = 0;

    while (attempts < 3 && !request) {
      try {
        ticketId = await generateTicketId();
        request = await Request.create({
          ticketId,
          userId: req.user._id,
          companyId: req.user.companyId._id || req.user.companyId,
          serviceType,
          title,
          description,
          priority: priority || 'MEDIUM',
          price: price || (serviceType === 'COMPANY_LEAD' ? 499 : serviceType === 'COMPANY_BOOST' ? 799 : 599),
          assignedTeam: teamMap[serviceType] || 'CreativeGini Core Team',
          notes: notes || '',
          attachments: attachments || [],
          status: 'REQUEST_CREATED',
          paymentStatus: 'PENDING'
        });
      } catch (insertErr) {
        attempts++;
        if (insertErr.code === 11000 && attempts < 3) {
          console.warn(`[Request Controller]: Collision on ${ticketId}, retrying...`);
          continue;
        }
        throw insertErr;
      }
    }

    // Create initial activity log
    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      companyId: req.user.companyId._id || req.user.companyId,
      requestId: request._id,
      action: 'REQUEST_CREATED',
      details: `Ticket ${ticketId} created for ${serviceType.replace('_', ' ')}.`
    });

    // Notify user
    await Notification.create({
      userId: req.user._id,
      type: 'ASSIGNMENT',
      title: 'Request Ticket Created',
      message: `Your request ${ticketId} ("${title}") has been created. Proceed to payment to activate sprint.`,
      ticketId: request._id,
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

export const hasServiceTypeAccess = (user, serviceType) => {
  if (!user) return false;
  if (user.role === 'ADMIN') return true;
  if (user.role === 'USER') return false;

  const normalized = (serviceType || '').toUpperCase().replace('-', '_');

  const access = typeof user.getEffectiveDashboardAccess === 'function'
    ? user.getEffectiveDashboardAccess()
    : user.dashboardAccess || {};

  if (normalized === 'COMPANY_LEAD') return Boolean(access.companyLead ?? user.role === 'COMPANY_LEAD');
  if (normalized === 'COMPANY_BOOST') return Boolean(access.companyBoost ?? user.role === 'COMPANY_BOOST');
  if (normalized === 'LANDING_PAGE' || normalized === 'COMPANY_UI') return Boolean(access.companyUI ?? user.role === 'LANDING_PAGE');

  return false;
};

// @desc    Get all requests filtered by role permissions
// @route   GET /api/requests
// @access  Private
export const getRequests = async (req, res) => {
  try {
    const { role } = req.user;
    let query = {};

    if (role === 'USER') {
      // User can only see their own company requests
      query = { companyId: req.user.companyId };
    } else if (role === 'ADMIN') {
      // ADMIN has query = {}, sees all requests
      query = {};
    } else {
      // Team members see requests for all services they have permissions for
      const access = typeof req.user.getEffectiveDashboardAccess === 'function'
        ? req.user.getEffectiveDashboardAccess()
        : req.user.dashboardAccess || {};

      const allowedServices = [];
      if (access.companyLead) allowedServices.push('COMPANY_LEAD');
      if (access.companyBoost) allowedServices.push('COMPANY_BOOST');
      if (access.companyUI) allowedServices.push('LANDING_PAGE');

      if (allowedServices.length === 0) {
        query = { _id: null }; // No permissions granted, return empty
      } else {
        query = { serviceType: { $in: allowedServices } };
      }
    }

    const requests = await Request.find(query)
      .populate('companyId', 'name contactPerson email website industry')
      .populate('userId', 'name email phone')
      .populate('assignedTo', 'name email phone avatar role')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
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
    const rawRequest = await resolveRequest(req.params.id);
    if (!rawRequest) {
      return res.status(404).json({
        success: false,
        message: 'Request ticket not found'
      });
    }

    const request = await Request.findById(rawRequest._id)
      .populate('companyId')
      .populate('userId', 'name email phone')
      .populate('assignedTo', 'name email phone avatar role');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request ticket not found'
      });
    }

    // Role security check
    const { role } = req.user;
    if (role === 'USER') {
      if (request.companyId._id.toString() !== req.user.companyId._id.toString()) {
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
    return res.status(500).json({
      success: false,
      message: error.message
    });
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

    // Role / permission check
    if (req.user.role !== 'ADMIN' && !hasServiceTypeAccess(req.user, request.serviceType)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    let assignedUser = null;
    if (assignedTo) {
      assignedUser = await User.findById(assignedTo);
      if (!assignedUser) {
        return res.status(400).json({ success: false, message: 'Assigned specialist user not found' });
      }
      request.assignedTo = assignedUser._id;
    }

    if (assignedTeam) {
      request.assignedTeam = assignedTeam;
    }
    if (dueDate) {
      request.dueDate = new Date(dueDate);
    }

    // Move to ASSIGNED if previously created or paid
    if (request.status === 'REQUEST_CREATED' || request.status === 'PAYMENT_COMPLETED') {
      request.status = 'ASSIGNED';
    }

    await request.save();

    // Create notification for assigned person
    if (assignedUser) {
      await Notification.create({
        userId: assignedUser._id,
        type: 'ASSIGNMENT',
        title: 'New ticket assigned',
        message: `Ticket ${request.ticketId}: "${request.title}" has been assigned to you by CreativeGini.`,
        ticketId: request._id,
        ticketCode: request.ticketId
      });
    }

    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      companyId: request.companyId,
      requestId: request._id,
      action: 'TICKET_ASSIGNED',
      details: `Ticket ${request.ticketId} assigned to ${assignedUser ? assignedUser.name : 'Team'} (${request.assignedTeam}).`
    });

    const populatedRequest = await Request.findById(request._id)
      .populate('companyId')
      .populate('userId', 'name email phone')
      .populate('assignedTo', 'name email phone avatar role');

    return res.json({
      success: true,
      message: `Ticket successfully assigned to ${assignedUser ? assignedUser.name : request.assignedTeam}.`,
      request: populatedRequest
    });
  } catch (error) {
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

    request.status = 'IN_PROGRESS';
    await request.save();

    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      companyId: request.companyId,
      requestId: request._id,
      action: 'WORK_STARTED',
      details: `Work started on ${request.ticketId} by ${req.user.name}.`
    });

    return res.json({
      success: true,
      message: 'Work marked IN PROGRESS.',
      request
    });
  } catch (error) {
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

    request.status = 'COMPLETED';
    request.completedAt = new Date();
    request.adminOverride = {
      isOverridden: true,
      reason: reason.trim(),
      overriddenBy: req.user._id,
      overriddenAt: new Date()
    };
    await request.save();

    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      companyId: request.companyId,
      requestId: request._id,
      action: 'ADMIN_OVERRIDE',
      details: `Administrator override performed by ${req.user.name}. Ticket marked COMPLETED. Reason: "${reason.trim()}".`
    });

    return res.json({
      success: true,
      message: 'Administrative completion override recorded.',
      request
    });
  } catch (error) {
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

    const logs = await ActivityLog.find({ requestId: request._id })
      .sort({ createdAt: 1 });

    return res.json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (error) {
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

    // Role / permission check
    if (req.user.role !== 'ADMIN' && !hasServiceTypeAccess(req.user, request.serviceType)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    // GUARD: Do NOT allow internal team to mark COMPLETED directly!
    if (status === 'COMPLETED' && req.user.role !== 'ADMIN') {
      return res.status(400).json({
        success: false,
        message: 'Tickets cannot be directly marked COMPLETED. Please submit your work through the portal for client review.'
      });
    }

    const previousStatus = request.status;
    request.status = status;
    await request.save();

    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      companyId: request.companyId,
      requestId: request._id,
      action: 'STATUS_UPDATE',
      details: `Status changed from ${previousStatus} to ${status}. ${note || ''}`
    });

    return res.json({
      success: true,
      request
    });
  } catch (error) {
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

    request.paymentStatus = 'PAID';
    if (request.status === 'REQUEST_CREATED') {
      // Auto-assign to active specialist for this service type
      const specialist = await User.findOne({ role: request.serviceType, status: 'ACTIVE' });
      if (specialist) {
        request.assignedTo = specialist._id;
        request.status = 'ASSIGNED';

        await Notification.create({
          userId: specialist._id,
          type: 'ASSIGNMENT',
          title: 'New paid ticket assigned',
          message: `Ticket ${request.ticketId}: "${request.title}" has been paid and assigned to you.`,
          ticketId: request._id,
          ticketCode: request.ticketId
        });
      } else {
        request.status = 'PAYMENT_COMPLETED';
      }
    }
    await request.save();

    const invCount = await Payment.countDocuments();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${1000 + invCount + 1}`;

    const payment = await Payment.create({
      invoiceNumber,
      requestId: request._id,
      userId: req.user._id,
      companyId: request.companyId,
      amount: request.price,
      currency: 'USD',
      status: 'PAID',
      paidAt: new Date(),
      paymentMethod: req.body.paymentMethod || 'Stripe Corporate Card'
    });

    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      companyId: request.companyId,
      requestId: request._id,
      action: 'PAYMENT_SUCCESS',
      details: `Payment of $${request.price} completed for ${request.ticketId}. Invoice: ${invoiceNumber}`
    });

    return res.json({
      success: true,
      message: 'Payment completed successfully. Ticket is now active.',
      request,
      payment
    });
  } catch (error) {
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

    // Authorization check
    if (req.user.role === 'USER') {
      if (String(request.userId) !== String(req.user._id)) {
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

    const messages = await Message.find({ requestId: request._id }).sort({ createdAt: 1 });

    // Mark messages as read for this user
    await Message.updateMany(
      {
        requestId: request._id,
        'readBy.userId': { $ne: req.user._id }
      },
      {
        $push: {
          readBy: {
            userId: req.user._id,
            readAt: new Date()
          }
        }
      }
    );

    // Mark in-app message notifications for this ticket and user as read
    await Notification.updateMany(
      {
        userId: req.user._id,
        ticketId: request._id,
        type: 'NEW_MESSAGE',
        isRead: false
      },
      {
        $set: { isRead: true }
      }
    );

    return res.json({
      success: true,
      messages
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Post message to ticket conversation
// @route   POST /api/requests/:id/messages
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { text, attachments } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Message text is required' });
    }

    const request = await resolveRequest(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Authorization check
    if (req.user.role === 'USER') {
      if (String(request.userId) !== String(req.user._id)) {
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

    const message = await Message.create({
      requestId: request._id,
      senderId: req.user._id,
      senderName: req.user.name,
      senderRole: req.user.role,
      text: text.trim(),
      attachments: attachments || [],
      readBy: [{
        userId: req.user._id,
        readAt: new Date()
      }]
    });

    // Create targeted notification for counterparty
    if (req.user.role === 'USER') {
      // Notify assigned specialist or team specialists
      const recipients = [];
      if (request.assignedTo) {
        recipients.push(request.assignedTo);
      } else {
        const key = request.serviceType === 'COMPANY_LEAD'
          ? 'dashboardAccess.companyLead'
          : request.serviceType === 'COMPANY_BOOST'
          ? 'dashboardAccess.companyBoost'
          : 'dashboardAccess.companyUI';
        const specialists = await User.find({ [key]: true, status: 'ACTIVE' }).select('_id');
        recipients.push(...specialists.map(s => s._id));
      }
      for (const recId of recipients) {
        await Notification.create({
          userId: recId,
          type: 'NEW_MESSAGE',
          title: `New message on ${request.ticketId}`,
          message: `${req.user.name} sent a new message on ${request.ticketId}: "${request.title}".`,
          ticketId: request._id,
          ticketCode: request.ticketId
        });
      }
    } else {
      // Internal specialist or Admin replied -> notify the client user
      await Notification.create({
        userId: request.userId,
        type: 'NEW_MESSAGE',
        title: `New message on ${request.ticketId}`,
        message: `${req.user.name} (${request.assignedTeam || 'CreativeGini Team'}) sent a new message on ${request.ticketId}.`,
        ticketId: request._id,
        ticketCode: request.ticketId
      });
    }

    return res.status(201).json({
      success: true,
      message
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
