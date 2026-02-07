import express from 'express';
import multer from 'multer';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/authorization.js';
import {
  saveDraft,
  submitClaim,
  uploadDocument,
  getClaimById,
  getUserClaims,
  getAllClaims,
  deleteDocument
} from '../controllers/insuranceClaimController.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Get user's claims with pagination and filters (for the authenticated user only)
router.get('/claims', auth, getUserClaims);

// Get claims for dashboards: restricted to admin/insurance; controller adds further role-based filtering
router.get('/claims/all', auth, requireRole('admin', 'insurance'), getAllClaims);

// Get specific claim by ID
router.get('/claims/:claimId', auth, getClaimById);

// Save draft
router.post('/claims/draft', auth, saveDraft);

// Submit claim
router.post('/claims/submit', auth, submitClaim);

// Upload document for a claim
router.post('/claims/:claimId/documents', auth, upload.single('file'), uploadDocument);

// Delete document from a claim
router.delete('/claims/:claimId/documents/:documentId', auth, deleteDocument);

export default router; 