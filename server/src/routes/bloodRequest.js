import express from 'express';
import {
  getRequestSummary,
  getBloodRequests,
  getBloodRequest,
  createBloodRequest,
  updateBloodRequest,
  deleteBloodRequest,
  getUrgentRequests,
  getRequestsByBloodType,
  updateRequestStatus,
  allocateBloodUnits,
  getRequestAnalytics,
  exportRequests
} from '../controllers/bloodRequestController.js';

const router = express.Router();

// Get request summary statistics
router.get('/summary', getRequestSummary);

// Get all blood requests with filtering and pagination
router.get('/', getBloodRequests);

// Get urgent requests
router.get('/urgent', getUrgentRequests);

// Get requests by blood type
router.get('/by-blood-type', getRequestsByBloodType);

// Get request analytics
router.get('/analytics', getRequestAnalytics);

// Export requests
router.get('/export', exportRequests);

// Get specific blood request by ID
router.get('/:requestId', getBloodRequest);

// Create new blood request
router.post('/', createBloodRequest);

// Update blood request
router.put('/:requestId', updateBloodRequest);

// Update request status
router.patch('/:requestId/status', updateRequestStatus);

// Allocate blood units to request
router.post('/:requestId/allocate', allocateBloodUnits);

// Delete blood request
router.delete('/:requestId', deleteBloodRequest);

export default router;
