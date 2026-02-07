import rateLimit from 'express-rate-limit';

// Helper function to get client IP
const getClientIp = (req) => {
  return req.realIp || 'unknown';
};

// Create rate limiter with custom store
const createRateLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Rate limit exceeded for IP:', req.realIp);
        return next();
      }
      res.status(429).json({ error: 'Too many requests, please try again later.' });
    },
    skip: (req) => process.env.NODE_ENV === 'development', // Skip in development
    keyGenerator: getClientIp
  };

  return rateLimit({
    ...defaultOptions,
    ...options,
    // Ensure these properties are always set
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getClientIp
  });
};

// Export different rate limiters
export const generalLimiter = createRateLimiter();

export const strictLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10 // 10 requests per hour
});

export const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 requests per 15 minutes
});

export const authLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 attempts per hour
  message: { error: 'Too many login attempts, please try again later.' }
}); 