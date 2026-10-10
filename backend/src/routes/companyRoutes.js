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
  unlockKeyPeople,
  getOnboardingClients,
  updateCompanyResearchHandler,
  getCompanyLeadsByCompanyId,
  downloadLeadsTemplate,
  previewLeadsImport,
  executeLeadsImport,
  getLeadLogo,
} from '../controllers/companyController.js';
import { protect, optionalProtect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Onboarding routes for internal teams (Company Boost, Company Lead, Landing Page)
router.get('/onboarding/clients', protect, authorize('ADMIN', 'COMPANY_BOOST', 'COMPANY_LEAD', 'LANDING_PAGE'), getOnboardingClients);

// Authorization helper for Company Boost onboarding
const authorizeCompanyBoost = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Access denied. No authenticated user.' });
  }
  if (
    req.user.role === 'ADMIN' ||
    req.user.role === 'COMPANY_BOOST' ||
    req.user.company_boost === true ||
    req.user.companyBoost === true ||
    (req.user.dashboardAccess && req.user.dashboardAccess.companyBoost === true)
  ) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Forbidden: Insufficient privileges for Company Boost onboarding assets.'
  });
};

// Company Boost Onboarding
router.get('/my-company/onboarding-assets', protect, getCompanyOnboardingAssets);
router.get('/:companyId/onboarding-assets', protect, getCompanyOnboardingAssets);
router.post('/:companyId/onboarding-assets', protect, authorizeCompanyBoost, saveCompanyOnboardingAssets);

// Company UI / Landing Page Onboarding
router.get('/my-company/ui-onboarding-assets', protect, getCompanyUiOnboardingAssets);
router.get('/:companyId/ui-onboarding-assets', protect, getCompanyUiOnboardingAssets);
router.post('/:companyId/ui-onboarding-assets', protect, authorize('ADMIN', 'LANDING_PAGE'), saveCompanyUiOnboardingAssets);

// Company Lead Onboarding (First 5 Sample Leads & PDFs)
router.get('/my-company/lead-onboarding-assets', protect, getCompanyLeadOnboardingAssets);
router.get('/:companyId/lead-onboarding-assets', protect, getCompanyLeadOnboardingAssets);
router.post('/:companyId/lead-onboarding-assets', protect, authorize('ADMIN', 'COMPANY_LEAD'), saveCompanyLeadOnboardingAssets);
router.post('/my-company/unlock-key-people', protect, unlockKeyPeople);
router.post('/:companyId/unlock-key-people', protect, unlockKeyPeople);

// User Company Lead routes
router.get('/my-company', protect, getMyCompany);
router.get('/my-company/leads', protect, getMyCompanyLeads);
router.get('/my-company/leads/:id', protect, getMyCompanyLeadDetail);

// Bulk Lead Import & Template routes
router.get('/leads/template', protect, authorize('ADMIN', 'COMPANY_LEAD'), downloadLeadsTemplate);
router.get('/leads/:id/logo', optionalProtect, getLeadLogo);
router.post('/:companyId/leads/import/preview', protect, authorize('ADMIN', 'COMPANY_LEAD'), previewLeadsImport);
router.post('/:companyId/leads/import', protect, authorize('ADMIN', 'COMPANY_LEAD'), executeLeadsImport);

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
