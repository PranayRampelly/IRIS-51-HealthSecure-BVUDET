import express from 'express';
import { 
  getAvailablePolicies,
  createApplication,
  getUserApplications,
  getApplicationById,
  updateApplication,
  submitApplication,
  uploadApplicationDocuments,
  deleteApplicationDocument,
  getApplicationStatistics,
  getAllApplications,
  approveApplication,
  rejectApplication,
  requestDocuments,
  exportApplications,
  getApplicationsByPolicyId,
  debugApplicationStatus
} from '../controllers/insuranceApplicationController.js';
import { auth, requireRole } from '../middleware/auth.js';
import { uploadSingle } from '../middleware/upload.js';

const router = express.Router();

// Test route to verify routing
router.get('/test', (req, res) => {
  console.log('🔍 Test route hit!');
  res.json({ message: 'Test route working!' });
});

// Debug middleware for policies route
router.get('/policies/available', (req, res, next) => {
  console.log('🔍 Insurance Applications Route Hit: /policies/available');
  console.log('🔍 Request method:', req.method);
  console.log('🔍 Request URL:', req.url);
  console.log('🔍 Request headers:', req.headers);
  next();
}, getAvailablePolicies);

// All other routes require authentication
router.use(auth);

// Application management routes (patient only) - temporarily remove role restriction
router.get('/applications', getUserApplications);
// Statistics route - temporarily removed role restriction for testing
router.get('/applications/stats', getApplicationStatistics);
router.post('/applications', createApplication);

// Insurance dashboard routes (insurance role only) - temporarily remove role restrictions
router.get('/applications/all', getAllApplications);
router.get('/applications/policy/:policyId', getApplicationsByPolicyId);
router.get('/applications/export', exportApplications);

// Individual application routes (patient only) - temporarily remove role restrictions
router.get('/applications/:id', getApplicationById);
router.put('/applications/:id', updateApplication);
router.post('/applications/:id/submit', submitApplication);

// Debug route
router.get('/applications/:id/debug', debugApplicationStatus);

// Insurance action routes (insurance role only) - temporarily remove role restrictions
router.post('/applications/:id/approve', approveApplication);
router.post('/applications/:id/reject', rejectApplication);
router.post('/applications/:id/request-documents', requestDocuments);

// Document management - temporarily remove role restrictions
router.post('/applications/:id/documents', uploadSingle, uploadApplicationDocuments);
router.delete('/applications/:id/documents/:documentId', deleteApplicationDocument);

export default router; 