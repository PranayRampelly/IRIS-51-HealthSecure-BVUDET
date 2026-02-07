export function requireOwnership(model, idField = 'id', ownerField = 'patientId') {
  return async (req, res, next) => {
    const resource = await model.findById(req.params[idField]);
    if (!resource || !resource[ownerField] || !resource[ownerField].equals(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
}

// RBAC middleware for Express
const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden: insufficient role' });
  }
  next();
};

// Alias for requireRole to match the import in routes
const authorize = requireRole;

export { requireRole, authorize }; 