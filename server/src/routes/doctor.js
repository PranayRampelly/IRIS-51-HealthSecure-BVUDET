import express from 'express';
import {
  getPatients,
  getPatientDetail,
  uploadPrescription,
  getDoctorDashboard,
  searchPatients,
  getDoctorPrescriptions,
  getDoctorProfile,
  updateDoctorProfile,
  getProfileCompletionStatus,
  completeProfile,
  uploadDocument,
  getDoctorPatients,
  searchDoctorPatient,
  getPatientHealthAnalytics
} from '../controllers/doctorController.js';
import { auth, requireDoctor } from '../middleware/auth.js';
import { validateMongoId } from '../middleware/validation.js';
import { uploadSingle, handleUploadError } from '../middleware/upload.js';
import { uploadCloud } from '../middleware/cloudinary.js';

const router = express.Router();

// All routes require authentication and doctor role
router.use(auth, requireDoctor);

router.get('/dashboard', getDoctorDashboard);
router.get('/prescriptions', getDoctorPrescriptions);
router.get('/patients', getPatients);
router.get('/patients/search', searchPatients);
router.get('/patients/:id', validateMongoId, getPatientDetail);
router.post('/prescriptions', uploadCloud.single('file'), handleUploadError, uploadPrescription);
router.get('/settings', getDoctorProfile);
router.put('/settings', uploadCloud.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'profileImage', maxCount: 1 }
]), updateDoctorProfile);
router.get('/profile-completion', getProfileCompletionStatus);
router.post('/complete-profile', uploadCloud.fields([
  { name: 'license', maxCount: 1 },
  { name: 'certificate', maxCount: 5 },
  { name: 'degree', maxCount: 3 }
]), completeProfile);
router.post('/upload-document', uploadCloud.single('file'), handleUploadError, uploadDocument);

// New routes for doctor patient search and proof request
router.get('/my-patients', getDoctorPatients);
router.get('/search-patient', searchDoctorPatient);
router.get('/patients/:id/analytics', getPatientHealthAnalytics);

export default router; 