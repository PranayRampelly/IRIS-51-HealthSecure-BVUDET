import express from 'express';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/auth.js';
import {
  getAvailableHospitals,
  getHospitalDetails,
  getHospitalDoctors,
  bookHospitalAppointment,
  getPatientHospitalAppointments,
  cancelHospitalAppointment,
  getPatientHospitalAdmissions,
  requestEmergencyAssistance,
  getPatientEmergencyResponses,
  sendMessageToHospital,
  getHospitalWaitTimes,
  rateHospitalExperience,
  requestHospitalAdmission,
  getPatientAdmissionRequests,
  cancelAdmissionRequest
} from '../controllers/patientHospitalController.js';

const router = express.Router();

// All routes require authentication and patient role
router.use(auth);
router.use(requireRole(['patient']));

// Hospital discovery and information
router.get('/hospitals', getAvailableHospitals);
router.get('/hospitals/:id', getHospitalDetails);
router.get('/hospitals/:id/doctors', getHospitalDoctors);
router.get('/hospitals/:id/wait-times', getHospitalWaitTimes);

// Hospital appointments
router.post('/hospitals/:id/appointments', bookHospitalAppointment);
router.get('/hospital-appointments', getPatientHospitalAppointments);
router.put('/appointments/:id/cancel', cancelHospitalAppointment);

// Hospital admissions
router.get('/hospital-admissions', getPatientHospitalAdmissions);

// Admission requests
router.post('/admission-requests', requestHospitalAdmission);
router.get('/admission-requests', getPatientAdmissionRequests);
router.put('/admission-requests/:id/cancel', cancelAdmissionRequest);

// Emergency assistance
router.post('/emergency-request', requestEmergencyAssistance);
router.get('/emergency-responses', getPatientEmergencyResponses);

// Communication
router.post('/hospitals/:id/message', sendMessageToHospital);

// Ratings and feedback
router.post('/hospitals/:id/rate', rateHospitalExperience);

export default router; 