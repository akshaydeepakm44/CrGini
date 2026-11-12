import rateLimit from 'express-rate-limit';

/**
 * Integration API Rate Limiters (Server-to-Server)
 */

// 1. Regular Integration Endpoints Limiter (60 req/min per api_client)
export const regularIntegrationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: () => {
    if (process.env.TEST_INTEGRATION_REGULAR_LIMIT) {
      return parseInt(process.env.TEST_INTEGRATION_REGULAR_LIMIT, 10);
    }
    return 60;
  },
  keyGenerator: (req) => {
    if (req.apiClient && req.apiClient.clientId) {
      return `client:${req.apiClient.clientId}`;
    }
    return req.ip || req.connection?.remoteAddress || 'unknown';
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Rate limit exceeded: maximum 60 requests per minute allowed for integration endpoints.',
    });
  },
});

// 2. Asset Upload Limiter (10 uploads/min per api_client)
export const assetUploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: () => {
    if (process.env.TEST_INTEGRATION_ASSET_LIMIT) {
      return parseInt(process.env.TEST_INTEGRATION_ASSET_LIMIT, 10);
    }
    return 10;
  },
  keyGenerator: (req) => {
    if (req.apiClient && req.apiClient.clientId) {
      return `client:asset:${req.apiClient.clientId}`;
    }
    return req.ip || req.connection?.remoteAddress || 'unknown';
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Asset upload rate limit exceeded: maximum 10 uploads per minute allowed.',
    });
  },
});

// 3. Failed Auth Limiter (10 failed attempts / 15 minutes per IP)
export const failedAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: () => {
    if (process.env.TEST_INTEGRATION_AUTH_LIMIT) {
      return parseInt(process.env.TEST_INTEGRATION_AUTH_LIMIT, 10);
    }
    return 10;
  },
  skipSuccessfulRequests: true, // Only failed auth requests count against limit
  // Only authentication failures (HTTP 401) count towards the brute-force limit
  requestWasSuccessful: (req, res) => res.statusCode !== 401,
  keyGenerator: (req) => {
    return req.headers['x-test-ip'] || req.ip || req.connection?.remoteAddress || 'unknown';
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many failed authentication attempts. Please try again after 15 minutes.',
    });
  },
});

