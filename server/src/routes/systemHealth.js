import express from 'express';
import {
  getSystemHealth,
  getSystemMetrics,
  getServiceStatus,
  getDatabaseHealth,
  getSystemAlerts,
  getSecurityStatus,
  getPerformanceData,
  refreshSystemHealth,
  getSystemHealthSummary
} from '../controllers/systemHealthController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Admin authorization middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  next();
};

// Apply auth and admin middleware to all routes
router.use(auth, requireAdmin);

// Main system health endpoint - returns all data
router.get('/', getSystemHealth);

// Individual endpoints for specific data
router.get('/metrics', getSystemMetrics);
router.get('/services', getServiceStatus);
router.get('/database', getDatabaseHealth);
router.get('/alerts', getSystemAlerts);
router.get('/security', getSecurityStatus);
router.get('/performance', getPerformanceData);
router.get('/summary', getSystemHealthSummary);

// Force refresh endpoint
router.post('/refresh', refreshSystemHealth);

export default router; 