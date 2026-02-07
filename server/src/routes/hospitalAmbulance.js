import express from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import {
  getAmbulanceCalls,
  getAmbulanceCallById,
  createAmbulanceCall,
  updateAmbulanceCall,
  dispatchAmbulance,
  updateCallStatus,
  uploadDocument,
  deleteDocument,
  getCallStats,
  exportCallsReport
} from '../controllers/ambulanceCallController.js';
import {
  getAmbulanceTransports,
  getAmbulanceTransportById,
  createAmbulanceTransport,
  updateAmbulanceTransport,
  dispatchAmbulanceForTransport,
  updateTransportStatus,
  recordVitalSigns,
  uploadDocument as uploadTransportDocument,
  deleteDocument as deleteTransportDocument,
  getTransportStats,
  exportTransportsReport
} from '../controllers/ambulanceTransportController.js';
import { uploadCloud } from '../middleware/cloudinary.js';

const router = express.Router();

// All routes require authentication and hospital role
router.use(auth);
router.use(requireRole(['hospital']));

// ==================== AMBULANCE CALLS ROUTES ====================

// Get all calls
router.get('/calls', getAmbulanceCalls);

// Get call statistics
router.get('/calls/stats', getCallStats);

// Get single call by ID
router.get('/calls/:id', getAmbulanceCallById);

// Create new call
router.post('/calls', createAmbulanceCall);

// Update call
router.put('/calls/:id', updateAmbulanceCall);

// Dispatch ambulance for call
router.post('/calls/:id/dispatch', dispatchAmbulance);

// Update call status
router.patch('/calls/:id/status', updateCallStatus);

// Upload document for call
router.post('/calls/:id/documents', uploadCloud.single('file'), uploadDocument);

// Delete document from call
router.delete('/calls/:id/documents/:docId', deleteDocument);

// Export calls report
router.get('/calls/export', exportCallsReport);

// ==================== AMBULANCE TRANSPORTS ROUTES ====================

// Get all transports
router.get('/transports', getAmbulanceTransports);

// Get transport statistics
router.get('/transports/stats', getTransportStats);

// Get single transport by ID
router.get('/transports/:id', getAmbulanceTransportById);

// Create new transport
router.post('/transports', createAmbulanceTransport);

// Update transport
router.put('/transports/:id', updateAmbulanceTransport);

// Dispatch ambulance for transport
router.post('/transports/:id/dispatch', dispatchAmbulanceForTransport);

// Update transport status
router.patch('/transports/:id/status', updateTransportStatus);

// Record vital signs
router.post('/transports/:id/vital-signs', recordVitalSigns);

// Upload document for transport
router.post('/transports/:id/documents', uploadCloud.single('file'), uploadTransportDocument);

// Delete document from transport
router.delete('/transports/:id/documents/:docId', deleteTransportDocument);

// Export transports report
router.get('/transports/export', exportTransportsReport);

export default router;


