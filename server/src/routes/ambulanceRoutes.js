import express from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import {
  getAmbulanceRoutes,
  getAmbulanceRouteById,
  createAmbulanceRoute,
  updateAmbulanceRoute,
  deleteAmbulanceRoute,
  optimizeRoutes,
  getRouteStats,
  getTrafficAlerts,
  createTrafficAlert
} from '../controllers/ambulanceRouteController.js';

const router = express.Router();

// All routes require authentication and hospital role
router.use(auth);
router.use(requireRole(['hospital']));

// Route management
router.get('/', getAmbulanceRoutes);
router.get('/stats', getRouteStats);
router.post('/optimize', optimizeRoutes);
router.get('/traffic-alerts', getTrafficAlerts);
router.post('/traffic-alerts', createTrafficAlert);
router.post('/', createAmbulanceRoute);
router.get('/:id', getAmbulanceRouteById);
router.put('/:id', updateAmbulanceRoute);
router.delete('/:id', deleteAmbulanceRoute);

export default router;

