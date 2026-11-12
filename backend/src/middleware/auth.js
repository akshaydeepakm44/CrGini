import jwt from 'jsonwebtoken';
import {
  findUserById,
  getEffectiveDashboardAccess,
} from '../repositories/userRepository.js';

export const getPrimaryJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: JWT_SECRET environment variable is missing in production.');
    }
    return 'dizigini_dev_jwt_secret_key_only';
  }
  return secret;
};

const getFallbackSecrets = (primarySecret) => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.JWT_SECRET_PREVIOUS ? [process.env.JWT_SECRET_PREVIOUS] : [];
  }
  return ['dizigini_dev_jwt_secret_key_only'].filter((s) => s !== primarySecret);
};

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.headers['x-auth-token']) {
    token = req.headers['x-auth-token'];
  } else if (req.headers['x-access-token']) {
    token = req.headers['x-access-token'];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  } else if (req.body && req.body._token) {
    token = req.body._token;
  } else if (req.body && req.body.token && typeof req.body.token === 'string' && req.body.token.length > 20) {
    token = req.body.token;
  }

  if (token && typeof token === 'string') {
    token = token.trim();
    if (token === 'null' || token === 'undefined' || token === '') {
      token = null;
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.',
    });
  }

  try {
    let decoded;
    const primarySecret = getPrimaryJwtSecret();
    try {
      decoded = jwt.verify(token, primarySecret);
    } catch (primaryErr) {
      // Check fallback secrets in case of environment restart or secret rotation
      const fallbackSecrets = getFallbackSecrets(primarySecret);

      for (const secret of fallbackSecrets) {
        try {
          decoded = jwt.verify(token, secret);
          if (decoded) break;
        } catch (_) {}
      }

      if (!decoded) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired session token. Please sign in again.',
        });
      }
    }

    const user = await findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The account for this token no longer exists.',
      });
    }

    if (
      user.status === 'DISABLED' ||
      user.status === 'SUSPENDED' ||
      user.isDeleted
    ) {
      return res.status(403).json({
        success: false,
        message:
          'Your account has been disabled. Please contact DiziGini support.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('[Auth Middleware Error]:', error.message);

    return res.status(401).json({
      success: false,
      message: 'Token verification failed or expired.',
    });
  }
};

export const optionalProtect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.headers['x-auth-token']) {
    token = req.headers['x-auth-token'];
  } else if (req.headers['x-access-token']) {
    token = req.headers['x-access-token'];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  } else if (req.body && req.body._token) {
    token = req.body._token;
  }

  if (token && typeof token === 'string') {
    token = token.trim();
    if (token === 'null' || token === 'undefined' || token === '') {
      token = null;
    }
  }

  if (!token) {
    return next();
  }

  try {
    let decoded;
    const primarySecret = getPrimaryJwtSecret();
    try {
      decoded = jwt.verify(token, primarySecret);
    } catch (_) {
      const fallbackSecrets = getFallbackSecrets(primarySecret);

      for (const secret of fallbackSecrets) {
        try {
          decoded = jwt.verify(token, secret);
          if (decoded) break;
        } catch (_) {}
      }
    }

    if (decoded?.id) {
      const user = await findUserById(decoded.id);
      if (user && user.status !== 'DISABLED' && user.status !== 'SUSPENDED' && !user.isDeleted) {
        req.user = user;
      }
    }
  } catch (_) {
    // optional, continue
  }
  next();
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authenticated user.',
      });
    }

    // SUPER_ADMIN has platform-wide authority
    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }

    // If ADMIN is authorized, both ADMIN and SUPER_ADMIN have access
    if (roles.includes('ADMIN') && (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN')) {
      return next();
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user?.role}' does not have permission to access this resource.`,
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
        message: 'Access denied. No authenticated user.',
      });
    }

    if (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN') {
      return next();
    }

    const access = getEffectiveDashboardAccess(req.user);

    if (access && access[dashboardKey] === true) {
      return next();
    }

    return res.status(403).json({
      success: false,
      code: 'FORBIDDEN_DASHBOARD_ACCESS',
      message: `Forbidden: You do not have permission to access the ${dashboardKey} dashboard.`,
    });
  };
};
