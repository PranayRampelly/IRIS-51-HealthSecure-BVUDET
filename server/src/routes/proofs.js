import express from 'express';
import {
  getProofs,
  getProof,
  createProof,
  updateProof,
  revokeProof,
  verifyProof,
  getProofStats,
  createProofForRecord,
  setProofExpiry,
  requestAccess,
  approveAccess,
  denyAccess,
  listAccessRequests,
  downloadWatermarkedProof,
  downloadProof
} from '../controllers/proofController.js';
import { auth, requirePatient } from '../middleware/auth.js';
import { validateProof, validateMongoId } from '../middleware/validation.js';

const router = express.Router();

// Public route for proof verification
router.get('/verify/:signature', verifyProof);

// Protected routes for patients
router.use(auth, requirePatient);

router.get('/', getProofs);
router.get('/stats', getProofStats);
router.get('/:id', validateMongoId, getProof);
router.post('/', validateProof, createProof);
router.post('/record', createProofForRecord);
router.post('/:id/set-expiry', validateMongoId, setProofExpiry);
router.put('/:id', validateMongoId, updateProof);
router.put('/:id/revoke', validateMongoId, revokeProof);

// Proof access approval workflow
router.post('/:id/request-access', validateMongoId, requestAccess);
router.post('/:id/access-requests', validateMongoId, listAccessRequests); // patient lists all requests for a proof
router.post('/access-request/:requestId/approve', approveAccess);
router.post('/access-request/:requestId/deny', denyAccess);
router.post('/:id/download-watermarked', validateMongoId, downloadWatermarkedProof);
// Allow GET as well for clients expecting a GET route
router.get('/:id/download-watermarked', validateMongoId, downloadWatermarkedProof);
router.get('/:id/download', validateMongoId, downloadProof);

export default router; 