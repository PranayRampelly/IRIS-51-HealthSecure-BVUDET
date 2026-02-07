import express from 'express';
import { auth } from '../middleware/auth.js';
import ActivityLog from '../models/ActivityLog.js';
import realtimeService from '../services/realtimeService.js';

const router = express.Router();

// Get recent activities for a health record
router.get('/record/:recordId', auth, async (req, res) => {
  try {
    const activities = await ActivityLog.getRecentActivities(req.params.recordId);
    res.json(activities);
  } catch (error) {
    console.error('Error fetching record activities:', error);
    res.status(500).json({ message: 'Error fetching activities' });
  }
});

// Get user activity summary
router.get('/user/summary', auth, async (req, res) => {
  try {
    const startDate = req.query.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default 30 days
    const endDate = req.query.endDate || new Date();
    
    const summary = await ActivityLog.getUserActivitySummary(req.user._id, startDate, endDate);
    res.json(summary);
  } catch (error) {
    console.error('Error fetching user activity summary:', error);
    res.status(500).json({ message: 'Error fetching activity summary' });
  }
});

// Get real-time status
router.get('/realtime/status', auth, (req, res) => {
  const status = {
    connected: realtimeService.isUserConnected(req.user._id),
    activeRooms: realtimeService.getUserRooms(req.user._id),
    lastActivity: realtimeService.getLastActivity(req.user._id)
  };
  res.json(status);
});

// Subscribe to record updates
router.post('/realtime/subscribe/:recordId', auth, (req, res) => {
  try {
    const { recordId } = req.params;
    realtimeService.joinRoom(`record_${recordId}`, realtimeService.clients.get(req.user._id));
    res.json({ message: 'Subscribed to record updates' });
  } catch (error) {
    console.error('Error subscribing to record updates:', error);
    res.status(500).json({ message: 'Error subscribing to updates' });
  }
});

// Unsubscribe from record updates
router.post('/realtime/unsubscribe/:recordId', auth, (req, res) => {
  try {
    const { recordId } = req.params;
    realtimeService.leaveRoom(`record_${recordId}`, realtimeService.clients.get(req.user._id));
    res.json({ message: 'Unsubscribed from record updates' });
  } catch (error) {
    console.error('Error unsubscribing from record updates:', error);
    res.status(500).json({ message: 'Error unsubscribing from updates' });
  }
});

export default router; 