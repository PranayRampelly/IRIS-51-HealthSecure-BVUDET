import express from 'express';
import ProofValidationController from '../controllers/proofValidationController.js';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/authorization.js';
import { handleValidationErrors } from '../middleware/validation.js';
import { sensitiveLimiter, generalLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

// Apply authentication to all routes
router.use(auth);

// Debug middleware to log user role
router.use((req, res, next) => {
  console.log('Proof Validation - User role:', req.user?.role);
  console.log('Proof Validation - User ID:', req.user?._id || req.user?.id);
  next();
});

// Temporarily allow all authenticated users for testing
// router.use(requireRole(['insurance', 'admin']));

// Get all proofs with filtering and pagination
router.get('/proofs', 
  generalLimiter, // 15 minutes, 100 requests
  ProofValidationController.getProofs
);

// Get single proof by ID
router.get('/proofs/:id',
  generalLimiter,
  ProofValidationController.getProofById
);

// Start AI validation process
router.post('/proofs/:id/validate',
  sensitiveLimiter, // 5 minutes, 20 requests
  ProofValidationController.startAIValidation
);

// Manual review decision
router.post('/proofs/:id/review',
  sensitiveLimiter,
  handleValidationErrors,
  ProofValidationController.manualReview
);

// Batch validation
router.post('/batch',
  sensitiveLimiter,
  handleValidationErrors,
  ProofValidationController.batchValidate
);

// Export proofs
router.get('/export',
  sensitiveLimiter,
  handleValidationErrors,
  ProofValidationController.exportProofs
);

// Get validation statistics
router.get('/stats',
  generalLimiter,
  ProofValidationController.getValidationStats
);

// Get blockchain status
router.get('/blockchain-status',
  generalLimiter,
  handleValidationErrors,
  ProofValidationController.getBlockchainStatus
);

export default router; 