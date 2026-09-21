import {
  updateRequest,
} from '../repositories/requestRepository.js';

import {
  createSubmission as createSubmissionRecord,
  findSubmissionById,
  findSubmissionByTicketAndVersion,
  findSubmissionsByTicket,
  getNextSubmissionVersion,
  updateSubmission,
} from '../repositories/submissionRepository.js';

import {
  createNotification,
} from '../repositories/notificationRepository.js';

import {
  createActivityLog,
} from '../repositories/activityLogRepository.js';

import {
  findUserById,
} from '../repositories/userRepository.js';

import {
  hasServiceTypeAccess,
  resolveRequest,
  } from '../utils/ticketHelpers.js';

import {
  sendWorkSubmittedEmail,
  sendChangesRequestedEmail,
  sendWorkResubmittedEmail,
  sendWorkApprovedEmail,
  sendTicketCompletedEmail,
} from '../services/emailService.js';

export {
  hasServiceTypeAccess,
  resolveRequest,
};

/**
 * Resolve a submission by either:
 * - PostgreSQL UUID
 * - version number
 *
 * Always restricts the lookup to the supplied ticket.
 */
const resolveSubmission = async (requestId, submissionIdOrVersion) => {
  if (!requestId || submissionIdOrVersion === undefined || submissionIdOrVersion === null) {
    return null;
  }

  const value = String(submissionIdOrVersion).trim();

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (uuidRegex.test(value)) {
    const submission = await findSubmissionById(value);

    if (submission && String(submission.ticketId) === String(requestId)) {
      return submission;
    }
  }

  const version = Number.parseInt(value, 10);

  if (Number.isInteger(version) && version > 0) {
    return await findSubmissionByTicketAndVersion(requestId, version);
  }

  return null;
};

/**
 * Verify that a user can access the ticket.
 */
const canAccessTicket = (user, request) => {
  if (!user || !request) {
    return false;
  }

  if (user.role === 'ADMIN') {
    return true;
  }

  if (user.role === 'USER') {
    return String(request.userId) === String(user._id || user.id);
  }

  return hasServiceTypeAccess(user, request.serviceType);
};

/**
 * @desc    Submit completed or revised work for a ticket
 * @route   POST /api/requests/:id/submissions
 * @access  Private (Internal Service Teams & Admin)
 */
export const createSubmission = async (req, res) => {
  try {
    const {
      title,
      description,
      files,
      externalLink,
      notes,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Submission title is required',
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Submission description / notes are required',
      });
    }

    const request = await resolveRequest(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    if (
      req.user.role !== 'ADMIN' &&
      !hasServiceTypeAccess(req.user, request.serviceType)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Only the assigned specialist team or Admin can submit work.',
      });
    }

    const versionNumber = await getNextSubmissionVersion(request._id);
    const isRevision = versionNumber > 1;

    const submission = await createSubmissionRecord({
      ticketId: request._id,
      ticketCode: request.ticketId,
      version: versionNumber,
      title: title.trim(),
      description: description.trim(),
      externalLink: externalLink ? externalLink.trim() : '',
      notes: notes ? notes.trim() : '',
      submittedBy: req.user._id,
      submittedByName: req.user.name,
      submittedAt: new Date(),
      status: 'PENDING_REVIEW',
    });

    // Store submission files through the repository.
    if (Array.isArray(files) && files.length > 0) {
      for (const file of files) {
        if (!file) continue;

        await import('../repositories/submissionRepository.js').then(
          ({ addSubmissionFile }) =>
            addSubmissionFile(submission._id, file)
        );
      }
    }

    // Move ticket to client review.
    const updatedRequest = await updateRequest(request._id, {
      currentSubmissionVersion: versionNumber,
      status: 'CLIENT_REVIEW',
    });

    const notificationType = isRevision
      ? 'WORK_RESUBMITTED'
      : 'WORK_SUBMITTED';

    const clientUserId = request.userId?.id || request.userId?._id || request.userId;
    const companyId = request.companyId?.id || request.companyId?._id || request.companyId;

    await createNotification({
      userId: clientUserId,
      type: notificationType,
      title: 'Work Submitted for Review',
      message: `Your completed work for ${request.ticketId} is ready for review.`,
      ticketId: request._id,
      ticketCode: request.ticketId,
      submissionId: submission._id,
    });

    await createActivityLog({
      userId: req.user._id,
      userName: req.user.name,
      companyId,
      requestId: request._id,
      action: notificationType,
      details: `${req.user.name} submitted ${
        isRevision ? `revision V${versionNumber}` : 'work V1'
      } ("${title.trim()}"). Client notified for review.`,
    });

    // Safeguard 1: Trigger email to client for work review
    let clientUser = request.userId;
    if (!clientUser?.email && clientUserId) {
      clientUser = await findUserById(clientUserId).catch(() => null);
    }

    if (clientUser?.email) {
      if (isRevision) {
        sendWorkResubmittedEmail({
          client: clientUser,
          ticket: updatedRequest || request,
          submission,
          specialist: req.user
        }).catch(err => console.error('[EMAIL DISPATCH ERROR]:', err));
      } else {
        sendWorkSubmittedEmail({
          client: clientUser,
          ticket: updatedRequest || request,
          submission,
          specialist: req.user
        }).catch(err => console.error('[EMAIL DISPATCH ERROR]:', err));
      }
    }

    return res.status(201).json({
      success: true,
      message: `Work submission V${versionNumber} sent to client for review.`,
      submission,
      request: updatedRequest || request,
    });
  } catch (error) {
    console.error('Create submission error:', error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get all submissions for a ticket
 * @route   GET /api/requests/:id/submissions
 * @access  Private
 */
export const getSubmissions = async (req, res) => {
  try {
    const request = await resolveRequest(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    if (!canAccessTicket(req.user, request)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
      });
    }

    const submissions = await findSubmissionsByTicket(request._id);

    return res.json({
      success: true,
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    console.error('Get submissions error:', error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get specific submission version for a ticket
 * @route   GET /api/requests/:id/submissions/:version
 * @access  Private
 */
export const getSubmissionByVersion = async (req, res) => {
  try {
    const request = await resolveRequest(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    if (!canAccessTicket(req.user, request)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
      });
    }

    const versionNum = Number.parseInt(req.params.version, 10);

    if (!Number.isInteger(versionNum) || versionNum < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid submission version',
      });
    }

    const submission = await findSubmissionByTicketAndVersion(
      request._id,
      versionNum
    );

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: `Submission version ${req.params.version} not found`,
      });
    }

    return res.json({
      success: true,
      submission,
    });
  } catch (error) {
    console.error('Get submission version error:', error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Client approves work submission
 * @route   POST /api/requests/:id/submissions/:submissionId/approve
 * @access  Private (Client User & Admin)
 */
export const approveSubmission = async (req, res) => {
  try {
    const {
      id: requestId,
      submissionId,
    } = req.params;

    const request = await resolveRequest(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    if (req.user.role === 'USER') {
      if (
        String(request.userId) !==
        String(req.user._id || req.user.id)
      ) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to approve this ticket',
        });
      }
    } else if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only client or admin can approve work',
      });
    }

    const submission = await resolveSubmission(
      request._id,
      submissionId
    );

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found',
      });
    }

    if (submission.status === 'APPROVED') {
      return res.status(400).json({
        success: false,
        message: 'This submission has already been approved',
      });
    }

    const now = new Date();

    const approvedSubmission = await updateSubmission(
      submission._id,
      {
        status: 'APPROVED',
        review: {
          reviewedBy: req.user._id,
          reviewerName: req.user.name,
          status: 'APPROVED',
          feedback:
            req.body.feedback ||
            'Work inspected and approved.',
          reviewedAt: now,
        },
      }
    );

    const updatedRequest = await updateRequest(
      request._id,
      {
        status: 'COMPLETED',
        approvedAt: now,
        approvedBy: req.user._id,
        completedAt: now,
      }
    );

    const assignedSpecialistId = request.assignedTo?.id || request.assignedTo?._id || request.assignedTo;
    const companyId = request.companyId?.id || request.companyId?._id || request.companyId;

    if (assignedSpecialistId) {
      await createNotification({
        userId: assignedSpecialistId,
        type: 'WORK_APPROVED',
        title: 'Work approved by client!',
        message: `Client approved the work for ${request.ticketId}.`,
        ticketId: request._id,
        ticketCode: request.ticketId,
        submissionId: submission._id,
      });
    }

    await createActivityLog({
      userId: req.user._id,
      userName: req.user.name,
      companyId,
      requestId: request._id,
      action: 'WORK_APPROVED',
      details: `Client approved the work for ${request.ticketId}. Ticket marked COMPLETED.`,
    });

    // Safeguard 1: Trigger Work Approved email to specialist
    if (request.assignedTo) {
      let specialistUser = null;
      const assignedId = request.assignedTo?.id || request.assignedTo?._id || request.assignedTo;
      if (request.assignedTo?.email) {
        specialistUser = request.assignedTo;
      } else if (assignedId) {
        specialistUser = await findUserById(assignedId).catch(() => null);
      }

      if (specialistUser?.email) {
        sendWorkApprovedEmail({
          specialist: specialistUser,
          ticket: updatedRequest || request,
          client: req.user
        }).catch(err => console.error('[EMAIL DISPATCH ERROR]:', err));
      }
    }

    // Safeguard 1: Ticket marked COMPLETED -> send completion email to client
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
        reason: req.body.feedback || 'Client reviewed and approved all submitted sprint deliverables.'
      }).catch(err => console.error('[EMAIL DISPATCH ERROR]:', err));
    }

    return res.json({
      success: true,
      message: `Submission V${submission.version} successfully approved. Ticket marked COMPLETED.`,
      submission: approvedSubmission || submission,
      request: updatedRequest || request,
    });
  } catch (error) {
    console.error('Approve submission error:', error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Client requests changes on a submission
 * @route   POST /api/requests/:id/submissions/:submissionId/request-changes
 * @access  Private (Client User & Admin)
 */
export const requestChanges = async (req, res) => {
  try {
    const {
      id: requestId,
      submissionId,
    } = req.params;

    const { feedback } = req.body;

    if (!feedback || !feedback.trim()) {
      return res.status(400).json({
        success: false,
        message:
          'Feedback is required when requesting changes. Please specify what needs modification.',
      });
    }

    const request = await resolveRequest(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    if (req.user.role === 'USER') {
      if (
        String(request.userId) !==
        String(req.user._id || req.user.id)
      ) {
        return res.status(403).json({
          success: false,
          message:
            'Not authorized to request changes on this ticket',
        });
      }
    } else if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message:
          'Only client or admin can request changes',
      });
    }

    const submission = await resolveSubmission(
      request._id,
      submissionId
    );

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found',
      });
    }

    if (submission.status === 'APPROVED') {
      return res.status(400).json({
        success: false,
        message:
          'Cannot request changes on an already approved submission',
      });
    }

    const wasAlreadyChangesRequested = submission.status === 'CHANGES_REQUESTED' || request.status === 'CHANGES_REQUESTED';

    const now = new Date();

    const updatedSubmission = await updateSubmission(
      submission._id,
      {
        status: 'CHANGES_REQUESTED',
        review: {
          reviewedBy: req.user._id,
          reviewerName: req.user.name,
          status: 'CHANGES_REQUESTED',
          feedback: feedback.trim(),
          reviewedAt: now,
        },
      }
    );

    const updatedRequest = await updateRequest(
      request._id,
      {
        status: 'CHANGES_REQUESTED',
      }
    );

    const assignedSpecialistId = request.assignedTo?.id || request.assignedTo?._id || request.assignedTo;
    const companyId = request.companyId?.id || request.companyId?._id || request.companyId;

    if (assignedSpecialistId) {
      await createNotification({
        userId: assignedSpecialistId,
        type: 'CHANGES_REQUESTED',
        title: `Changes requested for ${request.ticketId}`,
        message: `Changes requested for ${request.ticketId}. Feedback: "${feedback.trim()}"`,
        ticketId: request._id,
        ticketCode: request.ticketId,
        submissionId: submission._id,
      });
    }

    await createActivityLog({
      userId: req.user._id,
      userName: req.user.name,
      companyId,
      requestId: request._id,
      action: 'CHANGES_REQUESTED',
      details: `Client requested changes on submission V${submission.version}. Feedback: "${feedback.trim()}"`,
    });

    // Safeguard 1: Trigger Changes Requested email to specialist
    if (!wasAlreadyChangesRequested && request.assignedTo) {
      let specialistUser = null;
      const assignedId = request.assignedTo?.id || request.assignedTo?._id || request.assignedTo;
      if (request.assignedTo?.email) {
        specialistUser = request.assignedTo;
      } else if (assignedId) {
        specialistUser = await findUserById(assignedId).catch(() => null);
      }

      if (specialistUser?.email) {
        sendChangesRequestedEmail({
          specialist: specialistUser,
          ticket: updatedRequest || request,
          feedback: feedback.trim(),
          client: req.user
        }).catch(err => console.error('[EMAIL DISPATCH ERROR]:', err));
      }
    }

    return res.json({
      success: true,
      message:
        'Change request submitted. The specialist team has been notified.',
      submission: updatedSubmission || submission,
      request: updatedRequest || request,
    });
  } catch (error) {
    console.error('Request changes error:', error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
