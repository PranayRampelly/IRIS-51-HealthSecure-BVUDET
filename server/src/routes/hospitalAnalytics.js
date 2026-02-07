import express from 'express';
import {
  getHospitalAnalytics,
  getDepartmentAnalytics,
  getDoctorAnalytics,
  getRevenueAnalytics
} from '../controllers/hospitalAnalyticsController.js';
import { auth } from '../middleware/auth.js';
import { hospitalAuth } from '../middleware/hospitalAuth.js';

const router = express.Router();

// All routes require authentication and hospital role
router.use(auth);
router.use(hospitalAuth);

// Analytics Routes
router.get('/', getHospitalAnalytics);                    // GET /api/hospital/analytics - Get comprehensive analytics
router.get('/departments/:departmentId', getDepartmentAnalytics);  // GET /api/hospital/analytics/departments/:id - Department analytics
router.get('/doctors/:doctorId', getDoctorAnalytics);    // GET /api/hospital/analytics/doctors/:id - Doctor analytics
router.get('/revenue', getRevenueAnalytics);             // GET /api/hospital/analytics/revenue - Revenue analytics

export default router; 