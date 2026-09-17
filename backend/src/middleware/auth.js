import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'creativegini_secret_2026');
    const user = await User.findById(decoded.id).populate('companyId').select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The account for this token no longer exists.'
      });
    }

    if (user.status === 'DISABLED' || user.status === 'SUSPENDED') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been disabled. Please contact CreativeGini support.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token verification failed or expired.'
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user?.role}' does not have permission to access this resource.`
      });
    }
    next();
  };
};

export const authorizeDashboard = (dashboardKey) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authenticated user.'
      });
    }

    // Super Admin bypasses all dashboard permission checks
    if (req.user.role === 'ADMIN') {
      return next();
    }

    const access = typeof req.user.getEffectiveDashboardAccess === 'function'
      ? req.user.getEffectiveDashboardAccess()
      : req.user.dashboardAccess || {};

    if (access && access[dashboardKey] === true) {
      return next();
    }

    return res.status(403).json({
      success: false,
      code: 'FORBIDDEN_DASHBOARD_ACCESS',
      message: `Forbidden: You do not have permission to access the ${dashboardKey} dashboard.`
    });
  };
};

