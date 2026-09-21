import mongoose from 'mongoose';
import Submission from '../models/Submission.js';
import Request from '../models/Request.js';
import Notification from '../models/Notification.js';
import ActivityLog from '../models/ActivityLog.js';
import User from '../models/User.js';
import { hasServiceTypeAccess } from './requestController.js';

// Helper to resolve request by either Mongo _id or ticket code (e.g. CG-1001)
export const resolveRequest = async (idOrTicketId) => {
  if (!idOrTicketId) return null;
  if (mongoose.Types.ObjectId.isValid(idOrTicketId)) {
    const byId = await Request.findById(idOrTicketId);
    if (byId) return byId;
  }
  return await Request.findOne({ ticketId: idOrTicketId });
};

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

    const request = await resolveRequest(requestId);
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
      ticketCode: request.ticketId,
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
    request.status = 'CLIENT_REVIEW';
    await request.save();

    // 1. In-app notification to the client user
    await Notification.create({
      userId: request.userId,
      type: isRevision ? 'WORK_RESUBMITTED' : 'WORK_SUBMITTED',
      title: 'Work Submitted for Review',
      message: `Your completed work for ${request.ticketId} is ready for review.`,
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
      details: `${req.user.name} submitted ${isRevision ? `revision V${versionNumber}` : 'work V1'} ("${title.trim()}"). Client notified for review.`
    });

    return res.status(201).json({
      success: true,
      message: `Work submission V${versionNumber} sent to client for review.`,
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
    const request = await resolveRequest(req.params.id);
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

    const submissions = await Submission.find({ ticketId: request._id })
      .populate('submittedBy', 'name email role')
      .sort({ version: -1 });

    return res.json({
      success: true,
      count: submissions.length,
      submissions
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get specific submission version for a ticket
// @route   GET /api/requests/:id/submissions/:version
// @access  Private
export const getSubmissionByVersion = async (req, res) => {
  try {
    const request = await resolveRequest(req.params.id);
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

    const versionNum = parseInt(req.params.version, 10);
    const submission = await Submission.findOne({ ticketId: request._id, version: versionNum })
      .populate('submittedBy', 'name email role');

    if (!submission) {
      return res.status(404).json({ success: false, message: `Submission version ${req.params.version} not found` });
    }

    return res.json({
      success: true,
      submission
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

    const request = await resolveRequest(requestId);
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

    let submission = null;
    if (mongoose.Types.ObjectId.isValid(submissionId)) {
      submission = await Submission.findOne({ _id: submissionId, ticketId: request._id });
    }
    if (!submission) {
      const versionNum = parseInt(submissionId, 10);
      if (!isNaN(versionNum)) {
        submission = await Submission.findOne({ ticketId: request._id, version: versionNum });
      }
    }
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
        message: `Client approved the work for ${request.ticketId}.`,
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
      details: `Client approved the work for ${request.ticketId}. Ticket marked COMPLETED.`
    });

    return res.json({
      success: true,
      message: `Submission V${submission.version} successfully approved. Ticket marked COMPLETED.`,
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

    const request = await resolveRequest(requestId);
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

    let submission = null;
    if (mongoose.Types.ObjectId.isValid(submissionId)) {
      submission = await Submission.findOne({ _id: submissionId, ticketId: request._id });
    }
    if (!submission) {
      const versionNum = parseInt(submissionId, 10);
      if (!isNaN(versionNum)) {
        submission = await Submission.findOne({ ticketId: request._id, version: versionNum });
      }
    }
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
        title: `Changes requested for ${request.ticketId}`,
        message: `Changes requested for ${request.ticketId}. Feedback: "${feedback.trim()}"`,
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
      details: `Client requested changes on submission V${submission.version}. Feedback: "${feedback.trim()}"`
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
