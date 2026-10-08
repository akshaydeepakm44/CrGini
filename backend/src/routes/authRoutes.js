import express from 'express';
import {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
  verifyResetToken,
  resetPassword,
  changePassword,
  clearForgotPasswordRateLimits,
  requestMagicLink,
  verifyMagicLink,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
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

// Passwordless Magic Link routes (Public / One-Click)
router.post('/magic-link', requestMagicLink);
router.post('/verify-magic-link', verifyMagicLink);

// Development/testing route to clear in-memory rate limits across test suites
if (process.env.NODE_ENV !== 'production') {
  router.post('/reset-rate-limits', (req, res) => {
    clearForgotPasswordRateLimits();
    return res.json({ success: true, message: 'Rate limits cleared' });
  });
}

export default router;


