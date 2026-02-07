import express from 'express';
import {
  getAmbulanceServices,
  getAmbulanceServiceById,
  createAmbulanceBooking,
  getUserBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  getBookingStats,
  calculateEstimatedCost
} from '../controllers/ambulanceController.js';
import { auth } from '../middleware/auth.js';
import { validateRole } from '../middleware/roleValidation.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/services', getAmbulanceServices);
router.get('/services/:id', getAmbulanceServiceById);
router.post('/calculate-cost', calculateEstimatedCost);

// Protected routes (authentication required)
router.use(auth);

// Patient routes
router.post('/bookings', validateRole(['patient']), createAmbulanceBooking);
router.get('/bookings', validateRole(['patient']), getUserBookings);
router.get('/bookings/stats', validateRole(['patient']), getBookingStats);
router.get('/bookings/:id', validateRole(['patient', 'admin']), getBookingById);
router.put('/bookings/:id/status', validateRole(['admin']), updateBookingStatus);
router.delete('/bookings/:id', validateRole(['patient']), cancelBooking);

export default router;

