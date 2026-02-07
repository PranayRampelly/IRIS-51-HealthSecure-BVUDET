import express from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import { 
  searchPatients,
  getPatientById,
  getPatientPolicies,
  getPatientHealthSummary,
  uploadPatientDocument,
  getPatientActivity,
  searchPatientsByPolicy,
  getPatientStatistics
} from '../controllers/insurancePatientController.js';
import { uploadSingle } from '../middleware/upload.js';

const router = express.Router();

// All routes require authentication and insurance role
router.use(auth);
router.use(requireRole(['insurance', 'admin']));

// Search patients with dynamic filters
router.get('/search', searchPatients);

// Get patient statistics
router.get('/statistics', getPatientStatistics);

// Get patient by ID with full details
router.get('/:patientId', getPatientById);

// Get patient's insurance policies
router.get('/:patientId/policies', getPatientPolicies);

// Get patient's health summary
router.get('/:patientId/health-summary', getPatientHealthSummary);

// Get patient's recent activity
router.get('/:patientId/activity', getPatientActivity);

// Search patients by insurance policy number
router.get('/policy/:policyNumber', searchPatientsByPolicy);

// Upload patient document to Cloudinary
router.post('/:patientId/documents', uploadSingle, uploadPatientDocument);

export default router;


