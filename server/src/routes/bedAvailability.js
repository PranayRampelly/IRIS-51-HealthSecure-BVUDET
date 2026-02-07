import express from 'express';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/auth.js';
import {
  getBedAvailability,
  getHospitalBedDetails,
  bookBed,
  getPatientBedBookings,
  cancelBedBooking
} from '../controllers/bedAvailabilityController.js';

const router = express.Router();

// All routes require authentication and patient role
router.use(auth);
router.use(requireRole(['patient']));

// Bed availability search and discovery
router.get('/', getBedAvailability);
router.get('/hospital/:hospitalId', getHospitalBedDetails);

// Bed booking management
router.post('/:bedId/book', bookBed);
router.get('/bookings', getPatientBedBookings);
router.put('/bookings/:bookingId/cancel', cancelBedBooking);

export default router;

