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
} from '../controllers/sampleController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// =========================================================================
// MANAGEMENT ENDPOINTS (Lead Specialist & Admin only)
// Must be defined before parameterized /:slug routes
// =========================================================================
const manageRouter = express.Router();
manageRouter.use(protect, authorize('COMPANY_LEAD', 'ADMIN', 'SUPER_ADMIN'));

manageRouter.get('/', getAdminSamples);
manageRouter.post('/', createAdminSample);
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
router.get('/:slug', getPublicSampleBySlug);
router.get('/:slug/pitch-deck', streamPublicPitchDeck);
router.get('/:slug/company-study-pdf', streamCompanyStudyPdf);
router.get('/:slug/leads/:leadId/pitch-deck', streamLeadPitchDeck);
router.get('/:slug/leads/:leadId/lead-study-pdf', streamLeadStudyPdf);
router.get('/:slug/assets/:assetId', streamPublicPitchDeck);

export default router;
