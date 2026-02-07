import express from 'express';
import { appointmentService } from '../services/appointmentService';
// import { authenticate, authorize } from '../../middleware/auth';

const router = express.Router();

// Book appointment
router.post('/book', /*authenticate, authorize('patient'),*/ appointmentService.bookAppointment);
// List appointments
router.get('/', /*authenticate, authorize(['patient', 'doctor', 'admin']),*/ appointmentService.listAppointments);
// Get appointment detail
router.get('/:id', /*authenticate, authorize(['patient', 'doctor', 'admin']),*/ appointmentService.getAppointment);
// Update appointment (reschedule/cancel)
router.patch('/:id', /*authenticate, authorize(['patient', 'doctor', 'admin']),*/ appointmentService.updateAppointment);
// Delete appointment
router.delete('/:id', /*authenticate, authorize(['admin']),*/ appointmentService.deleteAppointment);

export default router; 