import express from 'express';
import {
  getQualitySummary,
  getQualityControls,
  getQualityControl,
  createQualityControl,
  updateQualityControl,
  deleteQualityControl,
  addQualityTest,
  quarantineUnit,
  releaseFromQuarantine,
  disposeUnit,
  getFailedTests,
  getExpiringQualityTests,
  getQualityAnalytics,
  getComplianceReport
} from '../controllers/qualityControlController.js';
import { auth } from '../middleware/auth.js';
import { hospitalAuth } from '../middleware/hospitalAuth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(auth);
router.use(hospitalAuth);

// Summary and analytics routes
router.get('/summary/:bloodBankId', getQualitySummary);
router.get('/analytics/:bloodBankId', getQualityAnalytics);
router.get('/compliance/:bloodBankId', getComplianceReport);
router.get('/failed-tests/:bloodBankId', getFailedTests);
router.get('/expiring/:bloodBankId', getExpiringQualityTests);

// CRUD routes for quality control records
router.get('/:bloodBankId', getQualityControls);
router.post('/:bloodBankId', createQualityControl);

// Individual quality control record routes
router.get('/record/:id', getQualityControl);
router.put('/record/:id', updateQualityControl);
router.delete('/record/:id', deleteQualityControl);

// Quality test management
router.post('/record/:id/tests', addQualityTest);

// Unit status management
router.post('/record/:id/quarantine', quarantineUnit);
router.post('/record/:id/release', releaseFromQuarantine);
router.post('/record/:id/dispose', disposeUnit);

export default router;
