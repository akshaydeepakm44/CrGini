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
  getCompanyUiOnboardingAssets,
  saveCompanyUiOnboardingAssets,
  getCompanyLeadOnboardingAssets,
  saveCompanyLeadOnboardingAssets,
  getOnboardingClients,
  updateCompanyResearchHandler,
  getCompanyLeadsByCompanyId,
} from '../controllers/companyController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Onboarding routes for internal teams (Company Boost, Company Lead, Landing Page)
router.get('/onboarding/clients', protect, authorize('ADMIN', 'COMPANY_BOOST', 'COMPANY_LEAD', 'LANDING_PAGE'), getOnboardingClients);

// Company Boost Onboarding
router.get('/my-company/onboarding-assets', protect, getCompanyOnboardingAssets);
router.get('/:companyId/onboarding-assets', protect, getCompanyOnboardingAssets);
router.post('/:companyId/onboarding-assets', protect, authorize('ADMIN', 'COMPANY_BOOST'), saveCompanyOnboardingAssets);

// Company UI / Landing Page Onboarding
router.get('/my-company/ui-onboarding-assets', protect, getCompanyUiOnboardingAssets);
router.get('/:companyId/ui-onboarding-assets', protect, getCompanyUiOnboardingAssets);
router.post('/:companyId/ui-onboarding-assets', protect, authorize('ADMIN', 'LANDING_PAGE'), saveCompanyUiOnboardingAssets);

// Company Lead Onboarding (First 5 Sample Leads & PDFs)
router.get('/my-company/lead-onboarding-assets', protect, getCompanyLeadOnboardingAssets);
router.get('/:companyId/lead-onboarding-assets', protect, getCompanyLeadOnboardingAssets);
router.post('/:companyId/lead-onboarding-assets', protect, authorize('ADMIN', 'COMPANY_LEAD'), saveCompanyLeadOnboardingAssets);

// User Company Lead routes
router.get('/my-company', protect, getMyCompany);
router.get('/my-company/leads', protect, getMyCompanyLeads);
router.get('/my-company/leads/:id', protect, getMyCompanyLeadDetail);

// Specialist / Admin Lead & Stakeholder management routes
router.get('/:companyId/leads', protect, authorize('ADMIN', 'COMPANY_LEAD'), getCompanyLeadsByCompanyId);
router.post('/:companyId/leads', protect, authorize('ADMIN', 'COMPANY_LEAD'), addLead);
router.patch('/leads/:id', protect, authorize('ADMIN', 'COMPANY_LEAD'), updateLead);
router.delete('/leads/:id', protect, authorize('ADMIN', 'COMPANY_LEAD'), deleteLead);
router.post('/:companyId/key-people', protect, authorize('ADMIN', 'COMPANY_LEAD'), addKeyPersonHandler);
router.delete('/key-people/:id', protect, authorize('ADMIN', 'COMPANY_LEAD'), deleteKeyPersonHandler);
router.patch('/:companyId/research', protect, authorize('ADMIN', 'COMPANY_LEAD'), updateCompanyResearchHandler);
router.put('/:companyId/research', protect, authorize('ADMIN', 'COMPANY_LEAD'), updateCompanyResearchHandler);

// Admin / Specialist company lookup
router.get('/:id', protect, authorize('ADMIN', 'COMPANY_LEAD', 'COMPANY_BOOST', 'LANDING_PAGE'), getCompanyById);

export default router;
