import express from 'express';
import {
  getPublicSampleBySlug,
  streamPublicPitchDeck,
  streamCompanyStudyPdf,
  streamLeadPitchDeck,
  streamLeadStudyPdf,
  getAdminSamples,
  getAdminSampleById,
  createAdminSample,
  updateAdminSample,
  deleteAdminSample,
  uploadCompanyStudyPdf,
  uploadAdminPitchDeck,
  uploadLeadPitchDeck,
  submitPublicInquiry,
  streamCompanyLogo,
  streamLeadLogo,
} from '../controllers/sampleController.js';
import { protect, authorize } from '../middleware/auth.js';
import {
  getAdminIntegrationNotifications,
  markAdminNotificationRead,
  getAdminIntegrationBatches,
  getAdminIntegrationBatchDetail,
  getAdminShowcasePreview,
} from '../controllers/adminIntegrationController.js';

const router = express.Router();

// =========================================================================
// MANAGEMENT ENDPOINTS (Lead Specialist & Admin only)
// Must be defined before parameterized /:slug routes
// =========================================================================
// Strict authentication middleware for sample management: protect() is the only authenticator
const sampleManagementAuth = (req, res, next) => {
  protect(req, res, () => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    if (['COMPANY_LEAD', 'ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      return next();
    }
    return res.status(403).json({
      success: false,
      message: `Forbidden: Role '${req.user.role}' does not have permission to manage sample showcases.`,
    });
  });
};

const manageRouter = express.Router();
manageRouter.use(sampleManagementAuth);

// Helper middleware: restrict integration batch and notification auditing to ADMIN / SUPER_ADMIN
const requireAdminRole = (req, res, next) => {
  if (['ADMIN', 'SUPER_ADMIN'].includes(req.user?.role)) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: `Forbidden: Role '${req.user?.role}' does not have permission to manage integration batches or notifications.`,
  });
};

manageRouter.get('/', getAdminSamples);
manageRouter.post('/', createAdminSample);

// Integration management routes (must be mounted before /:id)
manageRouter.get('/integration/notifications', requireAdminRole, getAdminIntegrationNotifications);
manageRouter.patch('/integration/notifications/:id/read', requireAdminRole, markAdminNotificationRead);
manageRouter.get('/integration/batches', requireAdminRole, getAdminIntegrationBatches);
manageRouter.get('/integration/batches/:batchId', requireAdminRole, getAdminIntegrationBatchDetail);
manageRouter.get('/preview/:slug', getAdminShowcasePreview);

manageRouter.get('/:id', getAdminSampleById);
manageRouter.put('/:id', updateAdminSample);
manageRouter.delete('/:id', deleteAdminSample);
manageRouter.post('/:id/upload-company-study-pdf', uploadCompanyStudyPdf);
manageRouter.post('/:id/upload-pitch-deck', uploadAdminPitchDeck);
manageRouter.post('/:id/leads/:leadId/pitch-deck', uploadLeadPitchDeck);

router.use('/manage', manageRouter);

// =========================================================================
// PUBLIC SAMPLE SHOWCASE ENDPOINTS (No authentication required)
// =========================================================================
router.post('/inquiry', submitPublicInquiry);
router.get('/:slug', getPublicSampleBySlug);
router.post('/:slug/inquiry', submitPublicInquiry);
router.get('/:slug/logo', streamCompanyLogo);
router.get('/:slug/leads/:leadId/logo', streamLeadLogo);
router.get('/:slug/pitch-deck', streamPublicPitchDeck);
router.get('/:slug/company-study-pdf', streamCompanyStudyPdf);
router.get('/:slug/leads/:leadId/pitch-deck', streamLeadPitchDeck);
router.get('/:slug/leads/:leadId/lead-study-pdf', streamLeadStudyPdf);
router.get('/:slug/assets/:assetId', streamPublicPitchDeck);

export default router;
