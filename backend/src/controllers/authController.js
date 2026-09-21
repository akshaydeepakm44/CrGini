import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import {
  findUserByEmail,
  findUserById,
  updateUser,
  getEffectiveDashboardAccess,
} from '../repositories/userRepository.js';

import { createActivityLog } from '../repositories/activityLogRepository.js';

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'creativegini_secret_2026',
    {
      expiresIn: '30d',
    }
  );
};

const buildUserResponse = (user) => ({
  id: user._id || user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  status: user.status,
  company: user.company || null,
  dashboardAccess: getEffectiveDashboardAccess(user),
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await findUserByEmail(normalizedEmail, {
      includePassword: true,
    });

    if (!user) {
      console.warn(
        `[Auth Warning]: Login attempt for non-existent user "${normalizedEmail}".`
      );

      return res.status(401).json({
        success: false,
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid credentials. User not found.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.warn(
        `[Auth Warning]: Incorrect password attempt for user "${normalizedEmail}".`
      );

      return res.status(401).json({
        success: false,
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid credentials. Incorrect password.',
      });
    }

    if (
      user.isDeleted ||
      user.status === 'DISABLED' ||
      user.status === 'SUSPENDED'
    ) {
      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_DISABLED',
        message:
          'Your account has been disabled. Please contact CreativeGini support.',
      });
    }

    const userId = user._id || user.id;

    await updateUser(userId, {
      lastLogin: new Date(),
    });

    try {
      await createActivityLog({
        userId,
        userName: user.name,
        companyId: user.companyId || user.company?._id || null,
        action: 'LOGIN',
        details: `${user.name} (${user.role}) logged in.`,
      });
    } catch (logErr) {
      console.warn(
        '[Auth Warning]: Failed to log activity:',
        logErr.message
      );
    }

    const token = generateToken(userId);

    return res.json({
      success: true,
      token,
      user: buildUserResponse(user),
    });
  } catch (error) {
    console.error('Login error:', error);

    return res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Server error during authentication',
      error: error.message,
    });
  }
};

// @desc    Get current logged in user profile & company
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authenticated user not found.',
      });
    }

    const user = await findUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.json({
      success: true,
      user: buildUserResponse(user),
    });
  } catch (error) {
    console.error('Get current user error:', error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
