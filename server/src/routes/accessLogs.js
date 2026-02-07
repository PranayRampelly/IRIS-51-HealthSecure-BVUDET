import express from 'express';
import {
  getAccessLogs,
  getAccessLogStats,
  getAllAccessLogs,
  exportAccessLogs,
  bulkDeleteAccessLogs
} from '../controllers/accessLogController.js';
import { auth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// User access logs
router.get('/', auth, getAccessLogs);
router.get('/stats', auth, getAccessLogStats);
router.get('/export', auth, exportAccessLogs);

// Admin access logs (all users)
router.get('/admin', auth, requireAdmin, getAllAccessLogs);
router.delete('/bulk-delete', auth, bulkDeleteAccessLogs);

export default router; 