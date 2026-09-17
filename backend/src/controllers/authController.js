import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import { connectDB } from '../config/db.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'creativegini_secret_2026', {
    expiresIn: '30d'
  });
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.'
      });
    }

    // Check database connection state
    if (mongoose.connection.readyState !== 1) {
      // Trigger on-demand reconnection
      try {
        await connectDB();
      } catch (e) {
        // Handled by connectDB
      }

      if (mongoose.connection.readyState !== 1) {
        const readyStateNames = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
        const stateName = readyStateNames[mongoose.connection.readyState] || 'unknown';
        console.error(`[Auth Error]: MongoDB is ${stateName} (readyState: ${mongoose.connection.readyState}). Query aborted.`);
        return res.status(503).json({
          success: false,
          code: 'DATABASE_UNAVAILABLE',
          message: 'Database is currently unreachable. Please ensure MongoDB is running and your current IP address is whitelisted in MongoDB Atlas Network Access.',
          details: {
            readyState: mongoose.connection.readyState,
            state: stateName
          }
        });
      }
    }

    // Find user with password included
    const user = await User.findOne({ email: email.toLowerCase().trim() }).populate('companyId');

    if (!user) {
      console.warn(`[Auth Warning]: Login attempt for non-existent user "${email.toLowerCase().trim()}".`);
      return res.status(401).json({
        success: false,
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid credentials. User not found.'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.warn(`[Auth Warning]: Incorrect password attempt for user "${email.toLowerCase().trim()}".`);
      return res.status(401).json({
        success: false,
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid credentials. Incorrect password.'
      });
    }

    if (user.isDeleted || user.status === 'DISABLED' || user.status === 'SUSPENDED') {
      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_DISABLED',
        message: 'Your account has been disabled. Please contact CreativeGini support.'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Log activity
    try {
      await ActivityLog.create({
        userId: user._id,
        userName: user.name,
        companyId: user.companyId?._id || null,
        action: 'LOGIN',
        details: `${user.name} (${user.role}) logged in.`
      });
    } catch (logErr) {
      console.warn('[Auth Warning]: Failed to log activity:', logErr.message);
    }

    const token = generateToken(user._id);

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        status: user.status,
        company: user.companyId || null,
        dashboardAccess: typeof user.getEffectiveDashboardAccess === 'function'
          ? user.getEffectiveDashboardAccess()
          : (user.dashboardAccess || { companyBoost: false, companyLead: false, companyUI: false })
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    if (error.name === 'MongooseServerSelectionError' || error.message.includes('SSL routines') || error.message.includes('timed out')) {
      return res.status(503).json({
        success: false,
        code: 'DATABASE_UNAVAILABLE',
        message: 'Database connection failed. Please ensure your IP address is whitelisted in MongoDB Atlas Network Access.',
        error: error.message
      });
    }
    return res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Server error during authentication',
      error: error.message
    });
  }
};

// @desc    Get current logged in user profile & company
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('companyId').select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        status: user.status,
        company: user.companyId || null,
        dashboardAccess: typeof user.getEffectiveDashboardAccess === 'function'
          ? user.getEffectiveDashboardAccess()
          : (user.dashboardAccess || { companyBoost: false, companyLead: false, companyUI: false })
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
