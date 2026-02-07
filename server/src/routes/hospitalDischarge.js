import express from 'express';
import {
    getDischarges,
    getDischargeById,
    createDischargePlan,
    updateDischargePlan,
    approveDischarge,
    completeDischarge,
    cancelDischarge,
    getDischargeStats,
} from '../controllers/hospitalDischargeController.js';
import { auth } from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';

const router = express.Router();

// All routes require authentication and hospital role
router.use(auth);
router.use(roleCheck(['hospital']));

// Statistics endpoint (before :id routes to avoid conflicts)
router.get('/stats', getDischargeStats);

// CRUD operations
router.get('/', getDischarges);
router.get('/:id', getDischargeById);
router.post('/', createDischargePlan);
router.put('/:id', updateDischargePlan);

// Status change operations (support both POST and PUT for compatibility)
router.post('/:id/approve', approveDischarge);
router.put('/:id/approve', approveDischarge);
router.post('/:id/complete', completeDischarge);
router.put('/:id/complete', completeDischarge);
router.post('/:id/cancel', cancelDischarge);

export default router;
