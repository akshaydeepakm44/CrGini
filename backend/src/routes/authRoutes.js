import express from 'express';
import {
  loginUser,
  getMe,
  forgotPassword,
  verifyResetToken,
  resetPassword,
  changePassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.post('/logout', (req, res) =>
  res.json({ success: true, message: 'Logged out successfully' })
);

// Protected account management routes
router.post('/change-password', protect, changePassword);

// Password recovery routes (Public)
router.post('/forgot-password', forgotPassword);
router.get('/verify-reset-token', verifyResetToken);
router.post('/reset-password', resetPassword);

export default router;


