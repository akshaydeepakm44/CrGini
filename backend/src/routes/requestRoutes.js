import express from 'express';
import {
  createRequest,
  calculateRequestPrice,
  getRequests,
  getRequestById,
  updateRequestStatus,
  processPayment,
  getMessages,
  sendMessage,
  assignTicket,
  startWork,
  adminOverride,
  getTicketActivity,
  getUnreadMessagesCount
} from '../controllers/requestController.js';
import {
  createSubmission,
  getSubmissions,
  getSubmissionByVersion,
  approveSubmission,
  requestChanges
} from '../controllers/submissionController.js';
import { protect, optionalProtect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .post(optionalProtect, createRequest)
  .get(protect, getRequests);

router.route('/calculate-price')
  .post(optionalProtect, calculateRequestPrice);

router.route('/messages/unread-count')
  .get(protect, getUnreadMessagesCount);

router.route('/:id')
  .get(protect, getRequestById);

router.route('/:id/status')
  .patch(protect, authorize('ADMIN', 'COMPANY_LEAD', 'COMPANY_BOOST', 'LANDING_PAGE'), updateRequestStatus);

router.route('/:id/assign')
  .post(protect, authorize('ADMIN', 'COMPANY_LEAD', 'COMPANY_BOOST', 'LANDING_PAGE'), assignTicket);

router.route('/:id/start-work')
  .post(protect, authorize('ADMIN', 'COMPANY_LEAD', 'COMPANY_BOOST', 'LANDING_PAGE'), startWork)
  .patch(protect, authorize('ADMIN', 'COMPANY_LEAD', 'COMPANY_BOOST', 'LANDING_PAGE'), startWork);

router.route('/:id/admin-override')
  .post(protect, authorize('ADMIN'), adminOverride);

router.route('/:id/activity')
  .get(protect, getTicketActivity);

router.route('/:id/pay')
  .post(protect, processPayment);

router.route('/:id/messages')
  .get(protect, getMessages)
  .post(protect, sendMessage);

// Work Submissions & Client Review Routes
router.route('/:id/submissions')
  .post(protect, authorize('ADMIN', 'COMPANY_LEAD', 'COMPANY_BOOST', 'LANDING_PAGE'), createSubmission)
  .get(protect, getSubmissions);

router.route('/:id/submissions/version/:version')
  .get(protect, getSubmissionByVersion);

router.route('/:id/submissions/:submissionId/approve')
  .post(protect, approveSubmission);

router.route('/:id/submissions/:submissionId/request-changes')
  .post(protect, requestChanges);

export default router;
