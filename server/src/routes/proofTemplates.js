import express from 'express';
import {
  createProofTemplate,
  getProofTemplates,
  getProofTemplateById,
  updateProofTemplate,
  deleteProofTemplate,
  setDefaultTemplate,
  getTemplatesByProofType,
  getDefaultTemplates,
  getTemplateUsageStats,
  duplicateTemplate,
  exportTemplates
} from '../controllers/proofTemplateController.js';
import { auth } from '../middleware/auth.js';
import { authorize } from '../middleware/authorization.js';

const router = express.Router();

// Apply authentication to all routes
router.use(auth);

// Template Routes
router.post('/', authorize(['insurance', 'admin']), createProofTemplate);
router.get('/', authorize(['insurance', 'admin', 'doctor']), getProofTemplates);
router.get('/default', authorize(['insurance', 'admin', 'doctor']), getDefaultTemplates);
router.get('/stats', authorize(['insurance', 'admin']), getTemplateUsageStats);
router.get('/export', authorize(['insurance', 'admin']), exportTemplates);
router.get('/type/:proofType', authorize(['insurance', 'admin', 'doctor']), getTemplatesByProofType);
router.get('/:id', authorize(['insurance', 'admin', 'doctor']), getProofTemplateById);
router.put('/:id', authorize(['insurance', 'admin']), updateProofTemplate);
router.delete('/:id', authorize(['insurance', 'admin']), deleteProofTemplate);

// Template Actions
router.put('/:id/set-default', authorize(['insurance', 'admin']), setDefaultTemplate);
router.post('/:id/duplicate', authorize(['insurance', 'admin']), duplicateTemplate);

export default router; 