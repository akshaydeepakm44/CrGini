import express from 'express';
import { getMyCompany, getCompanyById } from '../controllers/companyController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/my-company', protect, getMyCompany);
router.get('/:id', protect, authorize('ADMIN', 'COMPANY_LEAD', 'COMPANY_BOOST', 'LANDING_PAGE'), getCompanyById);

export default router;
