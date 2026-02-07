import express from 'express';
import { 
  getNearbyDoctors, 
  getAllDoctors, 
  getEmergencyDoctors, 
  getSavedDoctors, 
  addSavedDoctor, 
  removeSavedDoctor,
  getDoctorAvailability 
} from '../controllers/doctorController.js';
import { auth, requirePatient } from '../middleware/auth.js';

const router = express.Router();

// Doctor availability endpoint (must come before general routes to avoid conflicts)
router.get('/:doctorId/availability', getDoctorAvailability);

// Real endpoints
router.get('/nearby', getNearbyDoctors);
router.get('/all', getAllDoctors);
router.get('/emergency', getEmergencyDoctors);

// Saved doctors endpoints (patient-authenticated)
router.get('/saved', auth, requirePatient, getSavedDoctors);
router.post('/saved/:doctorId', auth, requirePatient, addSavedDoctor);
router.delete('/saved/:doctorId', auth, requirePatient, removeSavedDoctor);

export default router; 