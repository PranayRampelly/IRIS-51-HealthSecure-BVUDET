import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Middleware
import { auth } from '../middleware/auth.js';
import { validateClaimData } from '../middleware/validation.js';
import { generalLimiter, strictLimiter } from '../middleware/rateLimiter.js';
import auditLogger from '../middleware/auditLogger.js';

// Controllers
import {
  createPatientClaim,
  updatePatientClaim,
  submitClaim,
  uploadDocuments,
  removeDocument,
  getPatientClaimById,
  getUserClaims,
  getClaimStats,
  deleteClaim,
  trackClaim,
  exportClaim
} from '../controllers/insuranceClaimController.js';

const router = express.Router();

// Configure multer for file uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/claims');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow only specific file types
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, images, and Word documents are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Maximum 10 files per upload
  }
});

// Public routes (no authentication required)
router.get('/track/:trackingNumber', trackClaim);

// Protected routes (authentication required)
router.use(auth);

// Create new claim (draft)
router.post('/', 
  generalLimiter,
  auditLogger('CREATE_CLAIM'),
  createPatientClaim
);

// Get all claims for authenticated user
router.get('/', 
  getUserClaims
);

// Get claim statistics
router.get('/stats', 
  getClaimStats
);

// Get specific claim by ID
router.get('/:claimId', 
  getPatientClaimById
);

// Update claim (step by step)
router.put('/:claimId', 
  auditLogger('UPDATE_CLAIM'),
  updatePatientClaim
);

// Submit claim (final submission)
router.post('/:claimId/submit', 
  strictLimiter,
  auditLogger('SUBMIT_CLAIM'),
  submitClaim
);

// Upload documents for claim
router.post('/:claimId/documents', 
  upload.array('documents', 10),
  auditLogger('UPLOAD_DOCUMENTS'),
  uploadDocuments
);

// Remove document from claim
router.delete('/:claimId/documents/:documentId', 
  auditLogger('REMOVE_DOCUMENT'),
  removeDocument
);

// Export claim as PDF
router.get('/:claimId/export', 
  exportClaim
);

// Delete claim (only draft claims)
router.delete('/:claimId', 
  auditLogger('DELETE_CLAIM'),
  deleteClaim
);

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum file size is 10MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 10 files allowed per upload.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field.'
      });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
});

export default router; 