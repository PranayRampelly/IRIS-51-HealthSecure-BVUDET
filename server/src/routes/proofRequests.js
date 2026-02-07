import express from 'express';
import multer from 'multer';
import { auth, requireRole } from '../middleware/auth.js';
import * as proofRequestController from '../controllers/proofRequestController.js';
import { requirePatient } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Create a new proof request (allow insurance, admin, and doctor)
// Supports multipart/form-data with optional 'file'
router.post(
  '/',
  auth,
  requireRole(['insurance', 'admin', 'doctor']),
  upload.single('file'),
  proofRequestController.createProofRequest
);

// Get all proof requests with filtering
router.get('/', auth, requireRole(['insurance', 'admin']), proofRequestController.getProofRequests);

// Patient-facing endpoints - MUST be before /:id routes to avoid matching 'patient' as an ID
router.get('/patient/pending-count', auth, requirePatient, proofRequestController.getPendingCountForPatient);
router.get('/patient', auth, requirePatient, proofRequestController.getPatientProofRequests);

// Doctor: get own proof requests (requested by the logged-in doctor)
router.get('/doctor', auth, requireRole(['doctor', 'admin', 'insurance']), proofRequestController.getDoctorRequestsForSelf);

// Get proof request by ID - MUST be after specific routes like /patient and /doctor
router.get('/:id', auth, requireRole(['insurance', 'admin']), proofRequestController.getProofRequestById);

// Update proof request
router.put('/:id', auth, requireRole(['insurance', 'admin']), proofRequestController.updateProofRequest);

// Delete proof request
router.delete('/:id', auth, requireRole(['insurance', 'admin']), proofRequestController.deleteProofRequest);

// Update proof request status
router.patch('/:id/status', auth, requireRole(['insurance', 'admin']), proofRequestController.updateStatus);

export default router;