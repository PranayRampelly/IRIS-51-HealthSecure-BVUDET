import express from 'express';
import { auth } from '../middleware/auth.js';
import * as dashboardController from '../controllers/dashboardController.js';

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

// Get all dashboard statistics
router.get('/stats', dashboardController.getDashboardStats);

// Get system health metrics
router.get('/system-health', dashboardController.getSystemHealth);

// Get user statistics
router.get('/user-stats', dashboardController.getUserStats);

// Get activity metrics
router.get('/activity-metrics', dashboardController.getActivityMetrics);

// Get security metrics
router.get('/security-metrics', dashboardController.getSecurityMetrics);

// Get compliance metrics
router.get('/compliance-metrics', dashboardController.getComplianceMetrics);

// Get storage metrics
router.get('/storage-metrics', dashboardController.getStorageMetrics);

// Get time-based metrics
router.get('/time-metrics', dashboardController.getTimeBasedMetrics);

// Get geographical distribution
router.get('/geo-distribution', dashboardController.getGeographicalDistribution);

// Get real-time metrics
router.get('/realtime', dashboardController.getSystemHealth);

// Get system health
router.get('/health', dashboardController.getSystemHealth);

// Export dashboard data
router.get('/export', dashboardController.getDashboardStats);

// Get category-specific stats
router.get('/stats/:category', async (req, res) => {
  const { category } = req.params;
  
  try {
    switch (category) {
      case 'users':
        return dashboardController.getUserStats(req, res);
      case 'activity':
        return dashboardController.getActivityMetrics(req, res);
      case 'system':
        return dashboardController.getSystemHealth(req, res);
      case 'security':
        return dashboardController.getSecurityMetrics(req, res);
      case 'performance':
        return dashboardController.getPerformanceMetrics(req, res);
      case 'compliance':
        return dashboardController.getComplianceMetrics(req, res);
      case 'storage':
        return dashboardController.getStorageMetrics(req, res);
      case 'audit':
        return dashboardController.getAuditMetrics(req, res);
      case 'time':
        return dashboardController.getTimeBasedMetrics(req, res);
      case 'geographical':
        return dashboardController.getGeographicalDistribution(req, res);
      default:
        return res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    console.error(`Error getting ${category} stats:`, error);
    res.status(500).json({ message: `Error fetching ${category} statistics` });
  }
});

export default router; 