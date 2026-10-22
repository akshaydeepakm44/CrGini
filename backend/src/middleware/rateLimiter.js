import rateLimit from 'express-rate-limit';

/**
 * Production Rate Limiters
 */

// 1. Strict Limiter for Authentication & Sensitive Operations (Brute-force protection)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Generous limit for authentication attempts
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,
  skip: (req) => {
    const ip = req.ip || req.connection?.remoteAddress || '';
    return ip === '127.0.0.1' || ip === '::1' || ip.includes('127.0.0.1') || process.env.NODE_ENV !== 'production';
  },
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
  },
});

// 2. Payment & Checkout Limiter (Anti-flooding & card testing defense)
export const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many payment requests from this IP. Please wait a moment before trying again.',
  },
});

// 3. General Global API Limiter (DDoS & excessive poll mitigation)
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 300, // Generous 300 req/min for normal dashboard polling
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'High request rate detected. Please slow down your requests.',
  },
});
