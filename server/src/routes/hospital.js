import express from 'express';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/auth.js';
import { uploadSingle } from '../middleware/upload.js';
import {
  getHospitalProfile,
  updateHospitalProfile,
  getHospitalDashboard,
  getHospitalStaff,
  getProfileCompletion,
  getHospitalAppointments,
  updateAppointmentStatus,
  getHospitalAdmissions,
  createPatientAdmission,
  updateAdmissionStatus,
  getHospitalDepartments,
  createHospitalDepartment,
  updateDepartmentCapacity,
  getHospitalEmergencies,
  updateEmergencyStatus,
  getRealTimeStats,
  getHospitalProfileCompletion,
  completeHospitalProfile,
  uploadHospitalDocument,
  getHospitalAdmissionRequests,
  reviewAdmissionRequest,
  getHospitalAmbulanceBookings,
  getAmbulanceBookingDetails,
  updateAmbulanceBookingStatus,
  getHospitalAmbulanceServices,
  createAmbulanceService,
  updateAmbulanceService,
  deleteAmbulanceService,
  getAmbulanceStats,
  getHospitalDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver,
  updateDriverStatus,
  getHospitalDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getHospitalNurses,
  getHospitalSchedules,
  getHospitalTrainings,
  createNurse,
  updateNurse,
  deleteNurse,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  createTraining,
  updateTraining,
  deleteTraining
} from '../controllers/hospitalController.js';

const router = express.Router();

// All routes require authentication and hospital role
router.use(auth);
router.use(requireRole(['hospital']));

// Hospital profile routes
router.get('/profile', getHospitalProfile);
router.put('/profile', updateHospitalProfile);
router.get('/profile-completion', getHospitalProfileCompletion);
router.post('/profile/complete', completeHospitalProfile);
router.post('/upload-document', uploadSingle, uploadHospitalDocument);

// Hospital dashboard routes
router.get('/dashboard', getHospitalDashboard);
router.get('/stats/realtime', getRealTimeStats);

// Hospital staff management
router.get('/staff', getHospitalStaff);

// Hospital appointments management
router.get('/appointments', getHospitalAppointments);
router.put('/appointments/:id/status', updateAppointmentStatus);

// Hospital admissions management
router.get('/admissions', getHospitalAdmissions);
router.post('/admissions', createPatientAdmission);
router.put('/admissions/:id/status', updateAdmissionStatus);

// Hospital departments management
router.get('/departments', getHospitalDepartments);
router.post('/departments', createHospitalDepartment);
router.put('/departments/:id/capacity', updateDepartmentCapacity);

// Hospital emergency responses
router.get('/emergencies', getHospitalEmergencies);
router.put('/emergencies/:id/status', updateEmergencyStatus);

// Hospital admission requests
router.get('/admission-requests', getHospitalAdmissionRequests);
router.put('/admission-requests/:id/review', reviewAdmissionRequest);

// Hospital ambulance management
router.get('/ambulance/bookings', getHospitalAmbulanceBookings);
router.get('/ambulance/bookings/:id', getAmbulanceBookingDetails);
router.put('/ambulance/bookings/:id/status', updateAmbulanceBookingStatus);
router.get('/ambulance/services', getHospitalAmbulanceServices);
router.post('/ambulance/services', createAmbulanceService);
router.put('/ambulance/services/:id', updateAmbulanceService);
router.delete('/ambulance/services/:id', deleteAmbulanceService);
router.get('/ambulance/stats', getAmbulanceStats);

// Hospital ambulance driver management
router.get('/ambulance/drivers', getHospitalDrivers);
router.get('/ambulance/drivers/:id', getDriverById);
router.post('/ambulance/drivers', createDriver);
router.put('/ambulance/drivers/:id', updateDriver);
router.delete('/ambulance/drivers/:id', deleteDriver);
router.put('/ambulance/drivers/:id/status', updateDriverStatus);

// Hospital staff management
router.get('/doctors', getHospitalDoctors);
router.post('/doctors', createDoctor);
router.put('/doctors/:id', updateDoctor);
router.delete('/doctors/:id', deleteDoctor);
router.get('/nurses', getHospitalNurses);
router.post('/nurses', createNurse);
router.put('/nurses/:id', updateNurse);
router.delete('/nurses/:id', deleteNurse);
router.get('/schedules', getHospitalSchedules);
router.post('/schedules', createSchedule);
router.put('/schedules/:id', updateSchedule);
router.delete('/schedules/:id', deleteSchedule);
router.get('/trainings', getHospitalTrainings);
router.post('/trainings', createTraining);
router.put('/trainings/:id', updateTraining);
router.delete('/trainings/:id', deleteTraining);

export default router; 