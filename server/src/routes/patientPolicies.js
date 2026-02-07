import express from 'express';
import { 
  getPatientPolicies, 
  getPolicyById, 
  updatePolicy, 
  getPolicyStatistics,
  createTestPolicy
} from '../controllers/patientPolicyController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication but temporarily remove role restriction
router.use(auth);
// router.use(requireRole(['patient'])); // Temporarily commented out for debugging

// Get patient's policies
router.get('/policies', getPatientPolicies);

// Test endpoint to create sample policy
router.post('/policies/test', createTestPolicy);

// Get policy statistics
router.get('/policies/stats', getPolicyStatistics);

// Get specific policy
router.get('/policies/:policyId', getPolicyById);

// Update policy (limited fields)
router.put('/policies/:policyId', updatePolicy);

export default router; 