// Role validation middleware
export const validateRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // Check if user exists and has a role
      if (!req.user || !req.user.role) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Check if user's role is in the allowed roles
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Insufficient permissions.'
        });
      }

      next();
    } catch (error) {
      console.error('Role validation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during role validation'
      });
    }
  };
};

// Admin-only middleware
export const requireAdmin = (req, res, next) => {
  return validateRole(['admin'])(req, res, next);
};

// Patient-only middleware
export const requirePatient = (req, res, next) => {
  return validateRole(['patient'])(req, res, next);
};

// Doctor-only middleware
export const requireDoctor = (req, res, next) => {
  return validateRole(['doctor'])(req, res, next);
};

// Hospital-only middleware
export const requireHospital = (req, res, next) => {
  return validateRole(['hospital'])(req, res, next);
};

