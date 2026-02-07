import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const hospitalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId || decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }
    
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Check if user has hospital role
    if (user.role !== 'hospital') {
      return res.status(403).json({ message: 'Access denied. Hospital role required.' });
    }

    req.user = user.toObject ? user.toObject() : user;
    next();
  } catch (error) {
    console.error('Hospital auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export const requireHospital = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (req.user.role !== 'hospital') {
    return res.status(403).json({ message: 'Access denied. Hospital role required.' });
  }

  next();
}; 