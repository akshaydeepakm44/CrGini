import express from 'express';
import {
  getMyCompany,
  getMyCompanyLeads,
  getMyCompanyLeadDetail,
  getCompanyById,
  addLead,
  updateLead,
  deleteLead,
  addKeyPersonHandler,
  deleteKeyPersonHandler,
  getCompanyOnboardingAssets,
  saveCompanyOnboardingAssets,
  getOnboardingClients,
} from '../controllers/companyController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Company Boost Onboarding routes
router.get('/onboarding/clients', protect, authorize('ADMIN', 'COMPANY_BOOST'), getOnboardingClients);
router.get('/my-company/onboarding-assets', protect, getCompanyOnboardingAssets);
router.get('/:companyId/onboarding-assets', protect, getCompanyOnboardingAssets);
router.post('/:companyId/onboarding-assets', protect, authorize('ADMIN', 'COMPANY_BOOST'), saveCompanyOnboardingAssets);

// User Company Lead routes
router.get('/my-company', protect, getMyCompany);
router.get('/my-company/leads', protect, getMyCompanyLeads);
router.get('/my-company/leads/:id', protect, getMyCompanyLeadDetail);

// Specialist / Admin Lead management routes
router.post('/:companyId/leads', protect, authorize('ADMIN', 'COMPANY_LEAD'), addLead);
router.patch('/leads/:id', protect, authorize('ADMIN', 'COMPANY_LEAD'), updateLead);
router.delete('/leads/:id', protect, authorize('ADMIN', 'COMPANY_LEAD'), deleteLead);
router.post('/:companyId/key-people', protect, authorize('ADMIN', 'COMPANY_LEAD'), addKeyPersonHandler);
router.delete('/key-people/:id', protect, authorize('ADMIN', 'COMPANY_LEAD'), deleteKeyPersonHandler);

// Admin / Specialist company lookup
router.get('/:id', protect, authorize('ADMIN', 'COMPANY_LEAD', 'COMPANY_BOOST', 'LANDING_PAGE'), getCompanyById);

export default router;
