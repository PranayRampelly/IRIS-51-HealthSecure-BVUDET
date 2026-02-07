import express from 'express';
import { auth } from '../middleware/auth.js';
import { getPatientAnalytics } from '../controllers/analyticsController.js';

const router = express.Router();

// Protected routes (authentication required)
router.use(auth);

// Get patient analytics
router.get('/patient/analytics', getPatientAnalytics);

export default router; 