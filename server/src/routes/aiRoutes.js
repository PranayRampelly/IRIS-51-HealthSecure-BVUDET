import express from 'express';
import {
  sendMessage,
  getHealthInsights,
  clearChatHistory,
  getAIStats,
  checkAIHealth,
  getHealthTips,
  getChatHistory
} from '../controllers/aiController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/health', checkAIHealth);
router.get('/tips', getHealthTips);

// Protected routes - apply auth middleware individually
router.post('/chat', auth, sendMessage);
router.get('/chat/history', auth, getChatHistory);
router.delete('/chat/history', auth, clearChatHistory);
router.get('/insights', auth, getHealthInsights);
router.get('/stats', auth, getAIStats);

export default router;