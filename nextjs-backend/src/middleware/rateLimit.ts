import rateLimit from 'express-rate-limit';

// Rate limiter for auth endpoints
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: {
    error: 'Too many login attempts, please try again after 15 minutes',
    code: 'TOO_MANY_ATTEMPTS'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiter
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests, please try again later',
    code: 'TOO_MANY_REQUESTS'
  },
  standardHeaders: true,
  legacyHeaders: false,
});