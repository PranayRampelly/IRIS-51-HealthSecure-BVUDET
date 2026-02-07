/**
 * Role Check Middleware
 * Validates that the authenticated user has one of the allowed roles
 */

/**
 * Check if user has one of the allowed roles
 * @param {Array<string>} allowedRoles - Array of role names that are allowed to access the route
 * @returns {Function} Express middleware function
 */
export const roleCheck = (allowedRoles) => {
    return (req, res, next) => {
        try {
            // Check if user exists and has been authenticated
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required. Please log in to access this resource.'
                });
            }

            // Check if user has a role assigned
            if (!req.user.role) {
                return res.status(403).json({
                    success: false,
                    message: 'User role not found. Please contact administrator.'
                });
            }

            // Normalize role to lowercase for comparison
            const userRole = req.user.role.toLowerCase();
            const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase());

            // Check if user's role is in the allowed roles list
            if (!normalizedAllowedRoles.includes(userRole)) {
                return res.status(403).json({
                    success: false,
                    message: `Access denied. This resource requires one of the following roles: ${allowedRoles.join(', ')}`,
                    userRole: req.user.role,
                    requiredRoles: allowedRoles
                });
            }

            // User has required role, proceed to next middleware
            next();
        } catch (error) {
            console.error('Role check error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error during role validation',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    };
};

/**
 * Middleware to check if user is an admin
 */
export const requireAdmin = roleCheck(['admin']);

/**
 * Middleware to check if user is a patient
 */
export const requirePatient = roleCheck(['patient']);

/**
 * Middleware to check if user is a doctor
 */
export const requireDoctor = roleCheck(['doctor']);

/**
 * Middleware to check if user is a hospital
 */
export const requireHospital = roleCheck(['hospital']);

/**
 * Middleware to check if user is blood bank staff
 */
export const requireBloodBank = roleCheck(['bloodbank']);

/**
 * Middleware to allow multiple roles
 */
export const requireAnyRole = (...roles) => roleCheck(roles);

export default roleCheck;
