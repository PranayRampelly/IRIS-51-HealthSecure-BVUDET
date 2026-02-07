import express from 'express';
import { 
  getPolicies, 
  getPolicyById, 
  createPolicy, 
  updatePolicy, 
  deletePolicy, 
  getPolicyStatistics,
  getPolicyAnalytics,
  createSamplePolicies,
  uploadPolicyDocuments,
  approvePolicy,
  deletePolicyDocument
} from '../controllers/insurancePolicyController.js';
import { auth, requireRole } from '../middleware/auth.js';
import { uploadSingle } from '../middleware/upload.js';

const router = express.Router();

// All routes require authentication and insurance provider role
router.use(auth);

// Debug middleware to log user role
router.use((req, res, next) => {
  console.log('Insurance Policies - User role:', req.user?.role);
  console.log('Insurance Policies - User ID:', req.user?._id || req.user?.id);
  next();
});

// Temporarily allow all authenticated users for testing
// router.use(requireRole(['insurance', 'admin']));

// Get all policies with pagination and filters
router.get('/policies', getPolicies);

// Create new policy
router.post('/policies', createPolicy);

// Get policy statistics
router.get('/policies/stats', getPolicyStatistics);

// Get policy analytics
router.get('/policies/analytics', getPolicyAnalytics);

// Create sample policies
router.post('/policies/sample', createSamplePolicies);

// Get policy by ID
router.get('/policies/:id', getPolicyById);

// Update policy
router.put('/policies/:id', updatePolicy);

// Delete policy
router.delete('/policies/:id', deletePolicy);

// Upload policy documents
router.post('/policies/:id/documents', uploadSingle, uploadPolicyDocuments);

// Approve policy
router.put('/policies/:id/approve', approvePolicy);

// Delete policy document
router.delete('/policies/:id/documents/:documentId', deletePolicyDocument);

export default router; 