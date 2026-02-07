import express from 'express';
import {
  updatePatientProfile,
  getPatientProfile,
  getPatientDashboard,
  checkProfileStatus,
  getPatientsList
} from '../controllers/patientController.js';
import ProofRequest from '../models/ProofRequest.js';
import { auth, requirePatient } from '../middleware/auth.js';
import {
  listEmergencyContacts,
  addEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact
} from '../controllers/patientController.js';

const router = express.Router();

// Profile management (patient only)
router.get('/profile', auth, requirePatient, getPatientProfile);
router.put('/profile', auth, requirePatient, updatePatientProfile);
router.get('/profile/status', auth, requirePatient, checkProfileStatus);

// Dashboard data (patient only)
router.get('/dashboard', auth, requirePatient, getPatientDashboard);

// Pending proof-requests count for patient (compat alias)
router.get('/proof-requests/pending-count', auth, requirePatient, async (req, res) => {
  try {
    const count = await ProofRequest.countDocuments({ patientId: req.user._id, status: { $in: ['Pending', 'pending'] } });
    res.json({ success: true, pending: count });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Patients list (insurance only)
router.get('/list', auth, getPatientsList);

// Emergency contacts CRUD (patient only)
router.get('/emergency-contacts', auth, requirePatient, listEmergencyContacts);
router.post('/emergency-contacts', auth, requirePatient, addEmergencyContact);
router.put('/emergency-contacts/:contactId', auth, requirePatient, updateEmergencyContact);
router.delete('/emergency-contacts/:contactId', auth, requirePatient, deleteEmergencyContact);

export default router; 