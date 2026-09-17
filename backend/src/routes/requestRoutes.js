import express from 'express';
import {
  createRequest,
  getRequests,
  getRequestById,
  updateRequestStatus,
  processPayment,
  getMessages,
  sendMessage,
  assignTicket,
  startWork,
  adminOverride,
  getTicketActivity
} from '../controllers/requestController.js';
import {
  createSubmission,
  getSubmissions,
  approveSubmission,
  requestChanges
} from '../controllers/submissionController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .post(protect, createRequest)
  .get(protect, getRequests);

router.route('/:id')
  .get(protect, getRequestById);

router.route('/:id/status')
  .patch(protect, authorize('ADMIN', 'COMPANY_LEAD', 'COMPANY_BOOST', 'LANDING_PAGE'), updateRequestStatus);

router.route('/:id/assign')
  .post(protect, authorize('ADMIN', 'COMPANY_LEAD', 'COMPANY_BOOST', 'LANDING_PAGE'), assignTicket);

router.route('/:id/start-work')
  .post(protect, authorize('ADMIN', 'COMPANY_LEAD', 'COMPANY_BOOST', 'LANDING_PAGE'), startWork);

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

router.route('/:id/submissions/:submissionId/approve')
  .post(protect, approveSubmission);

router.route('/:id/submissions/:submissionId/request-changes')
  .post(protect, requestChanges);

export default router;
