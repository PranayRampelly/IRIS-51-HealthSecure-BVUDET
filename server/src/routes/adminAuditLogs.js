import express from 'express';
import {
  getAllAuditLogs,
  getAuditLogStats,
  getAuditLogById,
  getUserActivity,
  createAuditLog,
  updateAuditLog,
  addAttachment,
  removeAttachment,
  exportAuditLogs,
  getAuditLogSuggestions,
  bulkAuditLogOperations,
  deleteAuditLog
} from '../controllers/auditLogController.js';
import { auth } from '../middleware/auth.js';
import { uploadCloud } from '../middleware/cloudinary.js';

const router = express.Router();

// Admin authorization middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  next();
};

// Apply auth and admin middleware to all routes
router.use(auth, requireAdmin);

// Get audit log statistics
router.get('/stats', getAuditLogStats);

// Get audit log suggestions for search
router.get('/suggestions', getAuditLogSuggestions);

// Export audit logs
router.get('/export', exportAuditLogs);

// Get all audit logs with filtering and pagination
router.get('/', getAllAuditLogs);

// Get single audit log by ID
router.get('/:id', getAuditLogById);

// Get user activity
router.get('/user/:userId', getUserActivity);

// Create new audit log
router.post('/', createAuditLog);

// Bulk operations on audit logs
router.post('/bulk', bulkAuditLogOperations);

// Update audit log
router.put('/:id', updateAuditLog);

// Add attachment to audit log
router.post('/:id/attachments', uploadCloud.single('attachment'), addAttachment);

// Remove attachment from audit log
router.delete('/:id/attachments/:attachmentId', removeAttachment);

// Delete audit log (soft delete)
router.delete('/:id', deleteAuditLog);

export default router; 