// vault.js
import express from 'express';
import { uploadFile, listFiles, downloadFile, deleteFile, updateTags, uploadVersion, createShare, revokeShare, getAuditLogs, getShares, getShareByLink, bulkDeleteFiles, bulkRevokeShares } from '../controllers/vaultController.js';
import { auth } from '../middleware/auth.js';
import { uploadSingle, handleUploadError } from '../middleware/upload.js';
import dlp from '../middleware/dlp.js';
import virusScan from '../middleware/virusScan.js';
import auditLogger from '../middleware/auditLogger.js';
import { requireRole } from '../middleware/authorization.js';
import { sensitiveLimiter } from '../middleware/rateLimit.js';
import { logUploadedFile } from '../middleware/cloudinary.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for temporary file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Upload file (auth, upload, DLP, virus scan, audit)
router.post(
  '/upload',
  auth,
  upload.single('file'),
  logUploadedFile,
  handleUploadError,
  // dlp, // DLP temporarily disabled for Cloudinary uploads
  virusScan,
  auditLogger('upload'),
  uploadFile
);
// List files (auth, audit)
router.get(
  '/list',
  auth,
  auditLogger('list'),
  listFiles
);
// Download file (auth, audit)
router.get(
  '/download/:fileId',
  auth,
  auditLogger('download'),
  downloadFile
);
// Delete file
router.delete('/:fileId', auth, sensitiveLimiter, requireRole('patient', 'admin'), auditLogger('delete'), deleteFile);
// Bulk delete files
router.delete('/bulk', auth, sensitiveLimiter, requireRole('patient', 'admin'), auditLogger('bulkDelete'), bulkDeleteFiles);
// Update tags/metadata
router.put('/tags/:fileId', auth, sensitiveLimiter, requireRole('patient', 'admin'), auditLogger('updateTags'), updateTags);
// Upload new version
router.post('/version/:fileId', auth, sensitiveLimiter, requireRole('patient', 'admin'), uploadSingle, handleUploadError, dlp, virusScan, auditLogger('uploadVersion'), uploadVersion);
// Create share link
router.post('/share', auth, sensitiveLimiter, requireRole('patient', 'admin'), auditLogger('createShare'), createShare);
// Revoke share
router.post('/share/:shareId/revoke', auth, sensitiveLimiter, requireRole('patient', 'admin'), auditLogger('revokeShare'), revokeShare);
// Bulk revoke shares
router.post('/share/bulk-revoke', auth, sensitiveLimiter, requireRole('patient', 'admin'), auditLogger('bulkRevokeShare'), bulkRevokeShares);
// Get audit logs
router.get('/audit', auth, sensitiveLimiter, requireRole('patient', 'admin'), auditLogger('getAuditLogs'), getAuditLogs);
// Get shares
router.get('/shares', auth, getShares);
// Public endpoint to access a share by link
router.get('/share/:link', getShareByLink);

export default router; 