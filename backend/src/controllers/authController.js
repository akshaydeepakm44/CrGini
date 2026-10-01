import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

import {
  findUserByEmail,
  findUserById,
  updateUser,
  getEffectiveDashboardAccess,
} from '../repositories/userRepository.js';

import { createActivityLog } from '../repositories/activityLogRepository.js';
import {
  createResetToken,
  findActiveTokenByHash,
  markTokenAsUsed,
  invalidateUserTokens,
} from '../repositories/passwordResetRepository.js';
import { sendPasswordResetEmail } from '../services/emailService.js';

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
      message: 'Unable to sign in at this time. Please try again later.',
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
      message: 'Unable to load user profile. Please try again later.',
    });
  }
};

// ============================================================================
// PASSWORD RECOVERY / FORGOT PASSWORD FLOW
// ============================================================================

const GENERIC_FORGOT_SUCCESS =
  'If an account exists for this email, a password reset link has been sent.';

// In-memory sliding-window rate limiter
// Email limit: Max 5 requests per 15 mins per email address (anti-harassment)
// IP limit: Max 30 requests per 15 mins per IP (office/NAT friendly), 100 for localhost/loopback
const forgotPasswordRateLimits = new Map();
const FORGOT_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const FORGOT_RATE_LIMIT_EMAIL_ATTEMPTS = 5;
const FORGOT_RATE_LIMIT_IP_ATTEMPTS = 30;
const FORGOT_RATE_LIMIT_LOOPBACK_ATTEMPTS = 100;

// Periodically clean up expired rate limit entries
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamps] of forgotPasswordRateLimits.entries()) {
    const valid = timestamps.filter((t) => now - t < FORGOT_RATE_LIMIT_WINDOW_MS);
    if (valid.length === 0) {
      forgotPasswordRateLimits.delete(key);
    } else {
      forgotPasswordRateLimits.set(key, valid);
    }
  }
}, 5 * 60 * 1000).unref?.();

export const clearForgotPasswordRateLimits = () => {
  forgotPasswordRateLimits.clear();
};

const checkAndRecordRateLimit = (ip, email) => {
  const now = Date.now();
  const checks = [];

  const isLoopback =
    !ip ||
    ip === 'unknown' ||
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip === '::ffff:127.0.0.1' ||
    ip === 'localhost';

  if (email) {
    checks.push({
      key: `email:${email}`,
      max: FORGOT_RATE_LIMIT_EMAIL_ATTEMPTS,
    });
  }

  if (ip && ip !== 'unknown') {
    checks.push({
      key: `ip:${ip}`,
      max: isLoopback
        ? FORGOT_RATE_LIMIT_LOOPBACK_ATTEMPTS
        : FORGOT_RATE_LIMIT_IP_ATTEMPTS,
    });
  }

  // Check if any tracked key exceeds threshold
  for (const { key, max } of checks) {
    const history = forgotPasswordRateLimits.get(key) || [];
    const recent = history.filter((t) => now - t < FORGOT_RATE_LIMIT_WINDOW_MS);
    if (recent.length >= max) {
      return true; // Rate limited
    }
  }

  // Record this attempt across all relevant keys
  for (const { key } of checks) {
    const history = forgotPasswordRateLimits.get(key) || [];
    const recent = history.filter((t) => now - t < FORGOT_RATE_LIMIT_WINDOW_MS);
    recent.push(now);
    forgotPasswordRateLimits.set(key, recent);
  }

  return false;
};

// @desc    Initiate password reset (Forgot Password)
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  const startTime = Date.now();

  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    const clientIp =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.ip ||
      req.connection?.remoteAddress ||
      'unknown';

    if (checkAndRecordRateLimit(clientIp, normalizedEmail)) {
      console.warn(
        `[Auth Warning]: Rate limit exceeded on forgot-password for IP: ${clientIp}`
      );
      return res.status(429).json({
        success: false,
        message:
          'Too many password reset requests. Please wait 15 minutes before trying again.',
      });
    }

    // Look up user account
    const user = await findUserByEmail(normalizedEmail);

    if (user && !user.isDeleted && user.status === 'ACTIVE') {
      const userId = user._id || user.id;

      // 1. Invalidate any existing active reset tokens for this user
      await invalidateUserTokens(userId);

      // 2. Generate 256-bit cryptographically secure token
      const rawToken = crypto.randomBytes(32).toString('hex');

      // 3. Compute SHA-256 hash for database storage
      const tokenHash = crypto
        .createHash('sha256')
        .update(rawToken)
        .digest('hex');

      // 4. Token expiration: 60 minutes from now
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      // 5. Store hash in PostgreSQL
      await createResetToken({
        userId,
        tokenHash,
        expiresAt,
      });

      // 6. Build reset URL using configured portal base URL or request origin
      let portalBase = (
        process.env.PORTAL_BASE_URL || 'http://localhost:5174'
      ).replace(/\/$/, '');

      const originHeader = req.headers.origin || req.headers.referer;
      if (originHeader) {
        try {
          const parsed = new URL(originHeader);
          const originBase = `${parsed.protocol}//${parsed.host}`;
          const allowedOrigins = (process.env.CLIENT_URL || '')
            .split(',')
            .map((u) => u.trim().replace(/\/$/, ''))
            .filter(Boolean);
          if (
            allowedOrigins.includes(originBase) ||
            parsed.hostname === 'localhost' ||
            parsed.hostname === '127.0.0.1' ||
            allowedOrigins.some((ao) => {
              try {
                return new URL(ao).hostname === parsed.hostname;
              } catch (_) {
                return false;
              }
            })
          ) {
            portalBase = originBase;
          }
        } catch (_) {}
      }

      const resetUrl = `${portalBase}/reset-password?token=${encodeURIComponent(rawToken)}`;
      console.log(`[Auth Info]: Password recovery email generated for user ID: ${userId}`);

      // 7. Dispatch branded recovery email (async non-blocking)
      try {
        await sendPasswordResetEmail({
          to: user.email,
          name: user.name,
          resetUrl,
          expiresMinutes: 60,
        });
      } catch (emailErr) {
        console.error(
          '[Auth Error]: Failed to send password reset email:',
          emailErr.message
        );
      }

      // 8. Log activity audit trail (never log tokens or passwords)
      try {
        await createActivityLog({
          userId,
          userName: user.name,
          companyId: user.companyId || null,
          action: 'PASSWORD_RESET_REQUESTED',
          details: `Password recovery requested for ${user.email}. Security reset link generated.`,
        });
      } catch (logErr) {
        console.warn(
          '[Auth Warning]: Failed to log password reset activity:',
          logErr.message
        );
      }
    } else {
      console.log(
        `[Auth Info]: Forgot password request processed for non-existent or inactive user.`
      );
    }

    // 9. Timing consistency: ensure uniform response latency (min ~200ms) to prevent user enumeration via timing
    const elapsed = Date.now() - startTime;
    const TARGET_MIN_MS = 200;
    if (elapsed < TARGET_MIN_MS) {
      await new Promise((resolve) => setTimeout(resolve, TARGET_MIN_MS - elapsed));
    }

    // 10. ALWAYS return identical generic success message
    return res.status(200).json({
      success: true,
      message: GENERIC_FORGOT_SUCCESS,
    });
  } catch (error) {
    console.error('Forgot password error:', error.message);

    // Timing consistency even on internal error before returning generic response
    const elapsed = Date.now() - startTime;
    if (elapsed < 200) {
      await new Promise((resolve) => setTimeout(resolve, 200 - elapsed));
    }

    return res.status(200).json({
      success: true,
      message: GENERIC_FORGOT_SUCCESS,
    });
  }
};

// @desc    Verify password reset token validity
// @route   GET /api/auth/verify-reset-token
// @access  Public
export const verifyResetToken = async (req, res) => {
  try {
    const rawToken = req.query.token || req.body?.token;

    if (!rawToken || typeof rawToken !== 'string' || !rawToken.trim()) {
      return res.status(400).json({
        success: false,
        valid: false,
        message:
          'This password reset link is invalid or has expired. Please request a new one.',
      });
    }

    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken.trim())
      .digest('hex');

    const tokenRecord = await findActiveTokenByHash(tokenHash);

    if (!tokenRecord) {
      return res.status(400).json({
        success: false,
        valid: false,
        message:
          'This password reset link is invalid or has expired. Please request a new one.',
      });
    }

    return res.status(200).json({
      success: true,
      valid: true,
    });
  } catch (error) {
    console.error('Verify reset token error:', error.message);
    return res.status(500).json({
      success: false,
      valid: false,
      message:
        'Unable to verify password reset link at this time. Please try again later.',
    });
  }
};

// @desc    Complete password reset with new password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || typeof token !== 'string' || !token.trim()) {
      return res.status(400).json({
        success: false,
        message:
          'This password reset link is invalid or has expired. Please request a new one.',
      });
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a new password.',
      });
    }

    // Password requirements: min 8 characters, at least 1 letter and 1 number
    if (
      password.length < 8 ||
      !/[a-zA-Z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Password must be at least 8 characters long and contain at least one letter and one number.',
      });
    }

    // Hash token to query active token record
    const tokenHash = crypto
      .createHash('sha256')
      .update(token.trim())
      .digest('hex');

    const tokenRecord = await findActiveTokenByHash(tokenHash);

    if (!tokenRecord) {
      return res.status(400).json({
        success: false,
        message:
          'This password reset link is invalid or has expired. Please request a new one.',
      });
    }

    const userId = tokenRecord.userId;
    const user = await findUserById(userId);

    if (!user || user.isDeleted || user.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message:
          'Unable to reset password. User account is inactive or not found.',
      });
    }

    // 1. Hash new password using project bcrypt mechanism
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 2. Update user's password in PostgreSQL
    await updateUser(userId, {
      password: hashedPassword,
    });

    // 3. Mark the reset token as used
    await markTokenAsUsed(tokenRecord.id);

    // 4. Invalidate any other active reset tokens for that user
    await invalidateUserTokens(userId, tokenRecord.id);

    // 5. Log audit trail
    try {
      await createActivityLog({
        userId,
        userName: user.name,
        companyId: user.companyId || null,
        action: 'PASSWORD_RESET_COMPLETED',
        details: `Password successfully updated via recovery link for ${user.email}.`,
      });
    } catch (logErr) {
      console.warn(
        '[Auth Warning]: Failed to log password reset completion:',
        logErr.message
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Your password has been updated successfully.',
    });
  } catch (error) {
    console.error('Reset password error:', error.message);
    return res.status(500).json({
      success: false,
      message:
        'Unable to reset your password at this time. Please try again later.',
    });
  }
};

// @desc    Change password for authenticated logged-in user
// @route   POST /api/auth/change-password
// @access  Private (Requires valid session/JWT)
export const changePassword = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to change password.',
      });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || typeof currentPassword !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Current password is required.',
      });
    }

    if (!newPassword || typeof newPassword !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'New password is required.',
      });
    }

    // Retrieve user record including current password hash
    const user = await findUserById(userId, { includePassword: true });

    if (!user || user.isDeleted || user.status === 'DISABLED' || user.status === 'SUSPENDED') {
      return res.status(404).json({
        success: false,
        message: 'User account not found or deactivated.',
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    // Validate new password rules: min 8 characters, at least 1 letter, at least 1 number
    if (
      newPassword.length < 8 ||
      !/[a-zA-Z]/.test(newPassword) ||
      !/[0-9]/.test(newPassword)
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Password must be at least 8 characters and contain both letters and numbers.',
      });
    }

    // Ensure new password is not the same as current password
    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from your current password.',
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password in database
    await updateUser(userId, {
      password: hashedPassword,
    });

    // Invalidate any active password reset tokens for this user
    await invalidateUserTokens(userId);

    // Audit log
    try {
      await createActivityLog({
        userId,
        userName: user.name,
        companyId: user.companyId || null,
        action: 'PASSWORD_CHANGED',
        details: `User ${user.email} successfully updated their account password.`,
      });
    } catch (logErr) {
      console.warn('[Auth Warning]: Failed to log password change activity:', logErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Your password has been changed successfully.',
    });
  } catch (error) {
    console.error('Change password error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Unable to change your password right now. Please try again.',
    });
  }
};


