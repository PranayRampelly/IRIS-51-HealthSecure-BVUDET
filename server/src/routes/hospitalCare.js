import express from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import {
  getHospitalPatientRecords,
  createHospitalPatientRecord,
  getHospitalDischarges,
  createHospitalDischargePlan,
  approveHospitalDischarge,
  completeHospitalDischarge,
  getHospitalPatientTracking,
  updateHospitalPatientTracking
} from '../controllers/hospitalCareController.js';

const router = express.Router();

// Add logging middleware to debug route matching - this runs for ALL routes in this router
router.use((req, res, next) => {
  console.log(`[hospitalCareRoutes] ${req.method} ${req.path} - Middleware called`);
  console.log(`[hospitalCareRoutes] Full URL: ${req.method} ${req.originalUrl || req.url}`);
  next();
});

// Use same middleware pattern as hospitalRoutes for consistency
router.use(auth);
router.use(requireRole(['hospital']));

router.get('/patient-records', getHospitalPatientRecords);
router.post('/patient-records', createHospitalPatientRecord);

// Test route to verify router is working
router.get('/discharges/test', (req, res) => {
  res.json({ message: 'Discharges route is working', user: req.user?._id });
});

router.get('/discharges', getHospitalDischarges);
router.post('/discharges', (req, res, next) => {
  console.log('[hospitalCareRoutes] POST /discharges handler called');
  console.log('Request body keys:', Object.keys(req.body || {}));
  next();
}, createHospitalDischargePlan);
router.put('/discharges/:id/approve', approveHospitalDischarge);
router.put('/discharges/:id/complete', completeHospitalDischarge);

router.get('/patient-tracking', getHospitalPatientTracking);
router.put('/patient-tracking/:patientId', updateHospitalPatientTracking);

export default router;

