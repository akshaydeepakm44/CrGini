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
  sendWelcomeEmailHandler
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, authorize('ADMIN'));

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
router.get('/activity-logs', getActivityLogs);

export default router;
