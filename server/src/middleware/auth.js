import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const auth = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      console.log('Auth middleware: No token provided');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error('CRITICAL: JWT_SECRET is not configured in environment variables');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by ID from token
    const userId = decoded.userId || decoded.id;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      console.log('Auth middleware: User not found for token');
      return res.status(401).json({ message: 'Token is not valid - user not found' });
    }

    if (!user.isActive) {
      console.log('Auth middleware: User account is deactivated');
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Attach user to request object
    req.user = user.toObject ? user.toObject() : user;

    // Always attach patientId as ObjectId if user is a patient
    if (user.role === 'patient') {
      req.user.patientId = user.patientId || user._id;
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);

    // Provide specific error messages for different JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token format' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    }

    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Role-based authorization middleware
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      console.error('requireRole: No user found on request');
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      console.log(`requireRole: Access denied for role ${req.user.role}, required: ${roles.join(', ')}`);
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }

    next();
  };
};

// Convenience role middleware
export const requirePatient = requireRole(['patient']);
export const requireDoctor = requireRole(['doctor']);
export const requireAdmin = requireRole(['admin']);
export const requireHospital = requireRole(['hospital']);
export const requirePharmacy = requireRole(['pharmacy']);
export const requireBloodBank = requireRole(['bloodbank']);
export const requireInsurance = requireRole(['insurance']);
export const requireResearcher = requireRole(['researcher']);
export const requireBioAura = requireRole(['bioaura']);
