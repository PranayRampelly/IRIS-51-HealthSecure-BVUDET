import express from 'express';
import {
  getHealthRecords,
  getHealthRecord,
  createHealthRecord,
  updateHealthRecord,
  deleteHealthRecord,
  getHealthRecordStatsEndpoint,
  shareHealthRecord,
  exportHealthRecords,
  getRecordAnalytics,
  downloadHealthRecordFile,
  exportHealthRecordAsPDF
} from '../controllers/healthRecordController.js';
import { auth, requirePatient } from '../middleware/auth.js';
import { validateHealthRecord, validateMongoId } from '../middleware/validation.js';
import { uploadSingle, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

// All routes require authentication and patient role
router.use(auth, requirePatient);

// Main CRUD operations
router.get('/', getHealthRecords);
router.get('/stats', getHealthRecordStatsEndpoint);
router.get('/analytics', getRecordAnalytics);
router.get('/export', exportHealthRecords);
router.get('/export/:id', auth, exportHealthRecordAsPDF);
// Download must be before /:id
router.get('/:id/download', auth, downloadHealthRecordFile);
router.get('/:id', validateMongoId, getHealthRecord);
router.post('/', uploadSingle, handleUploadError, validateHealthRecord, createHealthRecord);
router.put('/:id', validateMongoId, updateHealthRecord);
router.delete('/:id', validateMongoId, deleteHealthRecord);

// Sharing functionality
router.post('/:id/share', validateMongoId, shareHealthRecord);

export default router; 