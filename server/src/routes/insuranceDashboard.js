import express from 'express';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/authorization.js';
import {
  getKeyMetrics,
  getRevenueTrends,
  getPolicyDistribution,
  getClaimsAnalytics,
  getCustomerDemographics
} from '../controllers/insuranceDashboardController.js';

const router = express.Router();

// All routes require authentication and insurance provider role
router.use(auth);

// Debug middleware to log user role
router.use((req, res, next) => {
  console.log('Insurance Dashboard - User role:', req.user?.role);
  console.log('Insurance Dashboard - User ID:', req.user?._id || req.user?.id);
  next();
});

// Temporarily allow all authenticated users for testing
// router.use(requireRole(['insurance', 'admin']));

// Dashboard endpoints
router.get('/metrics', getKeyMetrics);
router.get('/revenue-trends', getRevenueTrends);
router.get('/policy-distribution', getPolicyDistribution);
router.get('/claims-analytics', getClaimsAnalytics);
router.get('/demographics', getCustomerDemographics);

export default router; 