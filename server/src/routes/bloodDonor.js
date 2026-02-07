import express from 'express';
import {
  getDonorSummary,
  getDonors,
  getDonor,
  createDonor,
  updateDonor,
  deleteDonor,
  getEligibleDonors,
  checkDonorEligibility,
  getDonorStatistics,
  addDonation,
  uploadDonorDocument,
  addDonorDeferral,
  removeDonorDeferral,
  getDonorDonationHistory
} from '../controllers/bloodDonorController.js';

const router = express.Router();

// Donor summary and statistics
router.get('/summary', getDonorSummary);

// Get all donors with filtering and pagination
router.get('/', getDonors);

// Get eligible donors for specific blood type/location
router.get('/eligible', getEligibleDonors);

// Get donor statistics
router.get('/analytics', getDonorStatistics);

// Individual donor operations
router.get('/:id', getDonor);
router.post('/', createDonor);
router.put('/:id', updateDonor);
router.patch('/:id', updateDonor);
router.delete('/:id', deleteDonor);

// Donor eligibility and deferral
router.patch('/:id/eligibility', checkDonorEligibility);
router.post('/:id/deferral', addDonorDeferral);
router.delete('/:id/deferral', removeDonorDeferral);

// Donor donations
router.post('/:id/donations', addDonation);
router.get('/:id/donations', getDonorDonationHistory);

// Document upload
router.post('/:id/documents', uploadDonorDocument);

export default router;
