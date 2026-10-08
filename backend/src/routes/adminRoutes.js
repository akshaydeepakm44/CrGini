import express from 'express';
import {
  createClientUser,
  createTeamUser,
  getAllUsers,
  getUserById,
  updateUserHandler,
  resetUserPassword,
  updateUserStatus,
  deleteUserHandler,
  deleteTeamUser,
  getActivityLogs,
  getTeamMembers,
  updateUserPermissions,
  previewWelcomeEmailHandler,
  sendWelcomeEmailHandler,
  getEmailHistoryHandler,
  clearEmailHistoryHandler,
  downloadBulkTemplateHandler,
  bulkValidateClientsHandler,
  bulkCreateClientsHandler
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

import {
  getAdminOverview,
  getAdminOperations,
  getAdminClientsOverview,
  getAdminTeamOverview,
  getAdminDeliverablesOverview,
  getAdminBillingOverview,
  getAdminReportsOverview,
  getAdminPermissionsMatrix,
  updateRolePermissionsMatrix,
  reassignRequestByAdmin,
  changeUserRole,
} from '../controllers/adminController.js';

const router = express.Router();

router.use(protect, authorize('ADMIN'));

// Super Admin Operational Control Center Endpoints
router.get('/overview', getAdminOverview);
router.get('/operations', getAdminOperations);
router.get('/clients-overview', getAdminClientsOverview);
router.get('/team-overview', getAdminTeamOverview);
router.get('/deliverables-overview', getAdminDeliverablesOverview);
router.get('/billing-overview', getAdminBillingOverview);
router.get('/reports-overview', getAdminReportsOverview);
router.get('/permissions-matrix', getAdminPermissionsMatrix);
router.post('/permissions-matrix', updateRolePermissionsMatrix);
router.post('/requests/:id/reassign', reassignRequestByAdmin);
router.patch('/users/:id/role', changeUserRole);

// Existing Admin Management Endpoints
router.get('/users/bulk-template', downloadBulkTemplateHandler);
router.post('/users/bulk-validate', bulkValidateClientsHandler);
router.post('/users/bulk-create', bulkCreateClientsHandler);
router.post('/users', createClientUser);
router.post('/team-members', createTeamUser);
router.get('/users', getAllUsers);
router.get('/team-members', getTeamMembers);
router.delete('/team-members/:id', deleteTeamUser);
router.get('/users/:id', getUserById);
router.patch('/users/:id', updateUserHandler);
router.patch('/users/:id/permissions', updateUserPermissions);
router.post('/users/:id/reset-password', resetUserPassword);
router.post('/users/:id/preview-welcome-email', previewWelcomeEmailHandler);
router.post('/users/:id/send-welcome-email', sendWelcomeEmailHandler);
router.patch('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUserHandler);
import {
  getAdminSamples,
  createAdminSample,
  updateAdminSample,
  deleteAdminSample,
  uploadAdminPitchDeck,
} from '../controllers/sampleController.js';

router.get('/activity-logs', getActivityLogs);
router.get('/email-history', getEmailHistoryHandler);
router.delete('/email-history', clearEmailHistoryHandler);

// Admin Sample Showcase Management Endpoints
router.get('/samples', getAdminSamples);
router.post('/samples', createAdminSample);
router.put('/samples/:id', updateAdminSample);
router.delete('/samples/:id', deleteAdminSample);
router.post('/samples/:id/pitch-deck', uploadAdminPitchDeck);

export default router;
