import Submission from '../models/Submission.js';
import Request from '../models/Request.js';
import Notification from '../models/Notification.js';
import ActivityLog from '../models/ActivityLog.js';
import User from '../models/User.js';
import { hasServiceTypeAccess } from './requestController.js';

// @desc    Submit completed or revised work for a ticket
// @route   POST /api/requests/:id/submissions
// @access  Private (Internal Service Teams & Admin)
export const createSubmission = async (req, res) => {
  try {
    const { title, description, files, externalLink, notes } = req.body;
    const requestId = req.params.id;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Submission title is required' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, message: 'Submission description / notes are required' });
    }

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Role / permission check: Admin or assigned team role
    if (req.user.role !== 'ADMIN' && !hasServiceTypeAccess(req.user, request.serviceType)) {
      return res.status(403).json({
        success: false,
        message: 'Only the assigned specialist team or Admin can submit work.'
      });
    }

    // Determine version number
    const previousSubmissionsCount = await Submission.countDocuments({ ticketId: request._id });
    const versionNumber = previousSubmissionsCount + 1;
    const isRevision = versionNumber > 1;

    // Create submission document
    const submission = await Submission.create({
      ticketId: request._id,
      version: versionNumber,
      title: title.trim(),
      description: description.trim(),
      files: files || [],
      externalLink: externalLink ? externalLink.trim() : '',
      notes: notes ? notes.trim() : '',
      submittedBy: req.user._id,
      submittedByName: req.user.name,
      submittedAt: new Date(),
      status: 'PENDING_REVIEW'
    });

    // Update Request status & current submission version
    request.currentSubmissionVersion = versionNumber;
    request.status = isRevision ? 'WORK_RESUBMITTED' : 'WORK_SUBMITTED';
    await request.save();

    // 1. In-app notification to the client user
    await Notification.create({
      userId: request.userId,
      type: isRevision ? 'WORK_RESUBMITTED' : 'WORK_SUBMITTED',
      title: isRevision ? 'Revised work ready for review' : 'Your work is ready for review',
      message: `${req.user.name} (${request.assignedTeam}) has submitted ${isRevision ? `revision v${versionNumber}` : 'version v1'} for ${request.ticketId}: "${request.title}".`,
      ticketId: request._id,
      ticketCode: request.ticketId,
      submissionId: submission._id
    });

    // 2. Activity log entry
    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      companyId: request.companyId,
      requestId: request._id,
      action: isRevision ? 'WORK_RESUBMITTED' : 'WORK_SUBMITTED',
      details: `Submission v${versionNumber} ("${title.trim()}") submitted by ${req.user.name}. Awaiting client review.`
    });

    return res.status(201).json({
      success: true,
      message: `Work submission v${versionNumber} sent to client for review.`,
      submission,
      request
    });
  } catch (error) {
    console.error('Create submission error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all submissions for a ticket
// @route   GET /api/requests/:id/submissions
// @access  Private
export const getSubmissions = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Permission check
    if (req.user.role === 'USER') {
      const userCompId = (req.user.companyId?._id || req.user.companyId)?.toString();
      const reqCompId = (request.companyId?._id || request.companyId)?.toString();
      if (userCompId !== reqCompId) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }
    } else if (req.user.role !== 'ADMIN' && !hasServiceTypeAccess(req.user, request.serviceType)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const submissions = await Submission.find({ ticketId: req.params.id })
      .populate('submittedBy', 'name email role')
      .sort({ version: 1 });

    return res.json({
      success: true,
      count: submissions.length,
      submissions
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Client approves work submission
// @route   POST /api/requests/:id/submissions/:submissionId/approve
// @access  Private (Client User & Admin)
export const approveSubmission = async (req, res) => {
  try {
    const { id: requestId, submissionId } = req.params;

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Verify ownership
    if (req.user.role === 'USER') {
      const userCompId = (req.user.companyId?._id || req.user.companyId)?.toString();
      const reqCompId = (request.companyId?._id || request.companyId)?.toString();
      if (userCompId !== reqCompId) {
        return res.status(403).json({ success: false, message: 'Not authorized to approve this ticket' });
      }
    } else if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Only client or admin can approve work' });
    }

    const submission = await Submission.findOne({ _id: submissionId, ticketId: request._id });
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    if (submission.status === 'APPROVED') {
      return res.status(400).json({ success: false, message: 'This submission has already been approved' });
    }

    // Mark submission approved
    submission.status = 'APPROVED';
    submission.review = {
      reviewedBy: req.user._id,
      reviewerName: req.user.name,
      status: 'APPROVED',
      feedback: req.body.feedback || 'Work inspected and approved.',
      reviewedAt: new Date()
    };
    await submission.save();

    // Mark ticket COMPLETED
    request.status = 'COMPLETED';
    request.approvedAt = new Date();
    request.approvedBy = req.user._id;
    request.completedAt = new Date();
    await request.save();

    // Notify assigned team specialist
    let targetSpecialistId = request.assignedTo;
    if (!targetSpecialistId) {
      const specialist = await User.findOne({ role: request.serviceType, status: 'ACTIVE' });
      if (specialist) {
        targetSpecialistId = specialist._id;
        request.assignedTo = specialist._id;
        await request.save();
      }
    }

    if (targetSpecialistId) {
      await Notification.create({
        userId: targetSpecialistId,
        type: 'WORK_APPROVED',
        title: 'Work approved by client!',
        message: `${req.user.name} approved submission v${submission.version} for ${request.ticketId}. Ticket is now COMPLETED.`,
        ticketId: request._id,
        ticketCode: request.ticketId,
        submissionId: submission._id
      });
    }

    // Activity log entry
    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      companyId: request.companyId,
      requestId: request._id,
      action: 'WORK_APPROVED',
      details: `Submission v${submission.version} approved by ${req.user.name}. Ticket ${request.ticketId} marked COMPLETED.`
    });

    return res.json({
      success: true,
      message: `Submission v${submission.version} successfully approved. Ticket marked COMPLETED.`,
      submission,
      request
    });
  } catch (error) {
    console.error('Approve submission error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Client requests changes on a submission
// @route   POST /api/requests/:id/submissions/:submissionId/request-changes
// @access  Private (Client User & Admin)
export const requestChanges = async (req, res) => {
  try {
    const { id: requestId, submissionId } = req.params;
    const { feedback } = req.body;

    if (!feedback || !feedback.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Feedback is required when requesting changes. Please specify what needs modification.'
      });
    }

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Verify ownership
    if (req.user.role === 'USER') {
      const userCompId = (req.user.companyId?._id || req.user.companyId)?.toString();
      const reqCompId = (request.companyId?._id || request.companyId)?.toString();
      if (userCompId !== reqCompId) {
        return res.status(403).json({ success: false, message: 'Not authorized to request changes on this ticket' });
      }
    } else if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Only client or admin can request changes' });
    }

    const submission = await Submission.findOne({ _id: submissionId, ticketId: request._id });
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    if (submission.status === 'APPROVED') {
      return res.status(400).json({ success: false, message: 'Cannot request changes on an already approved submission' });
    }

    // Update submission
    submission.status = 'CHANGES_REQUESTED';
    submission.review = {
      reviewedBy: req.user._id,
      reviewerName: req.user.name,
      status: 'CHANGES_REQUESTED',
      feedback: feedback.trim(),
      reviewedAt: new Date()
    };
    await submission.save();

    // Update ticket status
    request.status = 'CHANGES_REQUESTED';
    await request.save();

    // Notify assigned team specialist
    let targetSpecialistId = request.assignedTo;
    if (!targetSpecialistId) {
      const specialist = await User.findOne({ role: request.serviceType, status: 'ACTIVE' });
      if (specialist) {
        targetSpecialistId = specialist._id;
        request.assignedTo = specialist._id;
        await request.save();
      }
    }

    if (targetSpecialistId) {
      await Notification.create({
        userId: targetSpecialistId,
        type: 'CHANGES_REQUESTED',
        title: 'Changes requested by client',
        message: `${req.user.name} requested changes on submission v${submission.version} for ${request.ticketId}. Feedback: "${feedback.trim()}"`,
        ticketId: request._id,
        ticketCode: request.ticketId,
        submissionId: submission._id
      });
    }

    // Activity log entry
    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      companyId: request.companyId,
      requestId: request._id,
      action: 'CHANGES_REQUESTED',
      details: `Client requested changes on submission v${submission.version}. Feedback: "${feedback.trim()}"`
    });

    return res.json({
      success: true,
      message: 'Change request submitted. The specialist team has been notified.',
      submission,
      request
    });
  } catch (error) {
    console.error('Request changes error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
