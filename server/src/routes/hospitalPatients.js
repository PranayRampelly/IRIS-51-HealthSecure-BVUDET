import express from 'express';
import {
  getHospitalPatients,
  getPatientDetails,
  addPatient,
  updatePatient,
  updatePatientStatus,
  addProgressNote,
  addVitalSigns,
  dischargePatient,
  getPatientAnalytics,
  exportPatientData,
  getHospitalDepartments,
  getHospitalDoctors,
  deletePatient
} from '../controllers/hospitalPatientController.js';
import { auth } from '../middleware/auth.js';
import { hospitalAuth } from '../middleware/hospitalAuth.js';

const router = express.Router();

// All routes require authentication and hospital role
router.use(auth);
router.use(hospitalAuth);

// Patient Management Routes
router.route('/')
  .get(getHospitalPatients)           // GET /api/hospital/patients - Get all patients
  .post(addPatient);                  // POST /api/hospital/patients - Add new patient

router.route('/:id')
  .get(getPatientDetails)             // GET /api/hospital/patients/:id - Get patient details
  .put(updatePatient)                 // PUT /api/hospital/patients/:id - Update patient
  .delete(deletePatient);             // DELETE /api/hospital/patients/:id - Delete patient

// Patient Status Management
router.patch('/:id/status', updatePatientStatus);  // PATCH /api/hospital/patients/:id/status - Update status

// Patient Care Routes
router.post('/:id/notes', addProgressNote);        // POST /api/hospital/patients/:id/notes - Add progress note
router.post('/:id/vitals', addVitalSigns);         // POST /api/hospital/patients/:id/vitals - Add vital signs
router.post('/:id/discharge', dischargePatient);    // POST /api/hospital/patients/:id/discharge - Discharge patient

// Analytics and Reports
router.get('/analytics', getPatientAnalytics);      // GET /api/hospital/patients/analytics - Get analytics
router.get('/export', exportPatientData);           // GET /api/hospital/patients/export - Export data

// Supporting Data Routes
router.get('/departments', getHospitalDepartments); // GET /api/hospital/patients/departments - Get departments
router.get('/doctors', getHospitalDoctors);         // GET /api/hospital/patients/doctors - Get doctors

export default router; 