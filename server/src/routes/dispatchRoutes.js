import express from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import {
  getDispatchCalls,
  getDispatchOperators,
  createDispatchOperator,
  updateOperatorStatus,
  dispatchAmbulance,
  getDispatchStats
} from '../controllers/dispatchController.js';

const router = express.Router();

// All routes require authentication and hospital role
router.use(auth);
router.use(requireRole(['hospital']));

// Dispatch calls
router.get('/calls', getDispatchCalls);

// Dispatch operators
router.get('/operators', getDispatchOperators);
router.post('/operators', createDispatchOperator);
router.patch('/operators/:id/status', updateOperatorStatus);

// Dispatch actions
router.post('/calls/:callId/dispatch', dispatchAmbulance);

// Statistics
router.get('/stats', getDispatchStats);

export default router;


