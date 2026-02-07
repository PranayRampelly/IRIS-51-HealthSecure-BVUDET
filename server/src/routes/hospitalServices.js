import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  getHospitalDirectory,
  getHospitalDetails,
  getBedAvailability,
  findDoctors,
  getHospitalAppointments,
  bookHospitalAppointment,
  updateAppointmentStatus
} from '../controllers/hospitalServicesController.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

// Hospital Directory Routes
router.get('/directory', getHospitalDirectory);
router.get('/hospital/:id', getHospitalDetails);

// Bed Availability Routes
router.get('/bed-availability', getBedAvailability);

// Doctor Discovery Routes
router.get('/find-doctors', findDoctors);

// Hospital Appointments Routes
router.get('/appointments', getHospitalAppointments);
router.post('/appointments', bookHospitalAppointment);
router.put('/appointments/:id/status', updateAppointmentStatus);

export default router; 