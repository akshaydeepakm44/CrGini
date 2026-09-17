import express from 'express';
import { loginUser, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.post('/logout', (req, res) => res.json({ success: true, message: 'Logged out successfully' }));

export default router;
