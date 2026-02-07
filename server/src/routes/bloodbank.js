import express from 'express';
import multer from 'multer';
import path from 'path';
import { auth } from '../middleware/auth.js';
import { roleCheck } from '../middleware/roleCheck.js';

// Import controllers
import * as bloodInventoryController from '../controllers/bloodInventoryController.js';
import * as bloodDonorController from '../controllers/bloodDonorController.js';
import * as bloodRequestController from '../controllers/bloodRequestController.js';
import * as qualityControlController from '../controllers/qualityControlController.js';
import * as emergencyAlertController from '../controllers/emergencyAlertController.js';
import * as bloodBankReportController from '../controllers/bloodBankReportController.js';
import * as bloodBankDashboardController from '../controllers/bloodBankDashboardController.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images, documents, and PDFs
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image, document, and PDF files are allowed'));
    }
  }
});

// Apply authentication and role check middleware to all routes
router.use(auth);
router.use(roleCheck(['bloodbank']));

// ==================== BLOOD INVENTORY ROUTES ====================

// Get all inventory items
router.get('/inventory', bloodInventoryController.getInventory);

// Get inventory summary
router.get('/inventory/summary', bloodInventoryController.getInventorySummary);

// Get single inventory item
router.get('/inventory/:id', bloodInventoryController.getInventoryItem);

// Create new inventory item
router.post('/inventory', bloodInventoryController.createInventoryItem);

// Update inventory item
router.put('/inventory/:id', bloodInventoryController.updateInventoryItem);

// Update inventory quantity
router.patch('/inventory/:id/quantity', bloodInventoryController.updateInventoryQuantity);

// Delete inventory item
router.delete('/inventory/:id', bloodInventoryController.deleteInventoryItem);

// Upload inventory document
router.post('/inventory/:id/documents', upload.single('document'), bloodInventoryController.uploadInventoryDocument);

// Get inventory alerts
router.get('/inventory/alerts', bloodInventoryController.getInventoryAlerts);

// Add alert to inventory item
router.post('/inventory/:id/alerts', bloodInventoryController.addInventoryAlert);

// Get inventory audit trail
router.get('/inventory/:id/audit-trail', bloodInventoryController.getInventoryAuditTrail);

// Get inventory statistics
router.get('/inventory/statistics', bloodInventoryController.getInventoryStatistics);

// ==================== BLOOD DONOR ROUTES ====================

// Get all donors
router.get('/donors', bloodDonorController.getDonors);

// Get donor summary
router.get('/donors/summary', bloodDonorController.getDonorSummary);

// Get single donor
router.get('/donors/:id', bloodDonorController.getDonor);

// Create new donor
router.post('/donors', bloodDonorController.createDonor);

// Update donor
router.put('/donors/:id', bloodDonorController.updateDonor);

// Delete donor
router.delete('/donors/:id', bloodDonorController.deleteDonor);

// Add donation to donor
router.post('/donors/:id/donations', bloodDonorController.addDonation);

// Upload donor document
router.post('/donors/:id/documents', upload.single('document'), bloodDonorController.uploadDonorDocument);

// Get eligible donors
router.get('/donors/eligible', bloodDonorController.getEligibleDonors);

// Check donor eligibility
router.get('/donors/:id/eligibility', bloodDonorController.checkDonorEligibility);

// Add deferral to donor
router.post('/donors/:id/deferrals', bloodDonorController.addDonorDeferral);

// Remove deferral from donor
router.delete('/donors/:id/deferrals', bloodDonorController.removeDonorDeferral);

// Get donor donation history
router.get('/donors/:id/donations', bloodDonorController.getDonorDonationHistory);

// Get donor statistics
router.get('/donors/statistics', bloodDonorController.getDonorStatistics);

// ==================== BLOOD REQUEST ROUTES ====================

// Get all blood requests
router.get('/requests', bloodRequestController.getBloodRequests);

// Get request summary
router.get('/requests/summary', bloodRequestController.getRequestSummary);

// Get single request
router.get('/requests/:id', bloodRequestController.getBloodRequest);

// Create new request
router.post('/requests', bloodRequestController.createBloodRequest);

// Update request
router.put('/requests/:id', bloodRequestController.updateBloodRequest);

// Delete request
router.delete('/requests/:id', bloodRequestController.deleteBloodRequest);

// Update request status
router.patch('/requests/:id/status', bloodRequestController.updateRequestStatus);

// Fulfill request
router.post('/requests/:id/fulfill', bloodRequestController.fulfillRequest);

// Upload request document
router.post('/requests/:id/documents', upload.single('document'), bloodRequestController.uploadRequestDocument);

// Get urgent requests
router.get('/requests/urgent', bloodRequestController.getUrgentRequests);

// Get overdue requests
router.get('/requests/overdue', bloodRequestController.getOverdueRequests);

// Add note to request
router.post('/requests/:id/notes', bloodRequestController.addRequestNote);

// Get request timeline
router.get('/requests/:id/timeline', bloodRequestController.getRequestTimeline);

// Get request statistics
router.get('/requests/statistics', bloodRequestController.getRequestStatistics);

// ==================== QUALITY CONTROL ROUTES ====================

// Get all quality controls
router.get('/quality-control', qualityControlController.getQualityControls);

// Get quality control summary
router.get('/quality-control/summary', qualityControlController.getQualitySummary);

// Get single quality control
router.get('/quality-control/:id', qualityControlController.getQualityControl);

// Create new quality control
router.post('/quality-control', qualityControlController.createQualityControl);

// Update quality control
router.put('/quality-control/:id', qualityControlController.updateQualityControl);

// Delete quality control
router.delete('/quality-control/:id', qualityControlController.deleteQualityControl);

// Update quality control status
router.patch('/quality-control/:id/status', qualityControlController.updateQualityControlStatus);

// Upload quality control document
router.post('/quality-control/:id/documents', upload.single('document'), qualityControlController.uploadQualityControlDocument);

// Add alert to quality control
router.post('/quality-control/:id/alerts', qualityControlController.addQualityControlAlert);

// Add corrective action
router.post('/quality-control/:id/corrective-actions', qualityControlController.addCorrectiveAction);

// Get overdue quality controls
router.get('/quality-control/overdue', qualityControlController.getOverdueQualityControls);

// Get quality controls by status
router.get('/quality-control/status/:status', qualityControlController.getQualityControlsByStatus);

// Get quality control audit trail
router.get('/quality-control/:id/audit-trail', qualityControlController.getQualityControlAuditTrail);

// Get quality control statistics
router.get('/quality-control/statistics', qualityControlController.getQualityControlStatistics);

// ==================== EMERGENCY ALERT ROUTES ====================

// Get all emergency alerts
router.get('/emergency-alerts', emergencyAlertController.getEmergencyAlerts);

// Get emergency alert summary
router.get('/emergency-alerts/summary', emergencyAlertController.getEmergencyAlertSummary);

// Get single emergency alert
router.get('/emergency-alerts/:id', emergencyAlertController.getEmergencyAlert);

// Create new emergency alert
router.post('/emergency-alerts', emergencyAlertController.createEmergencyAlert);

// Update emergency alert
router.put('/emergency-alerts/:id', emergencyAlertController.updateEmergencyAlert);

// Delete emergency alert
router.delete('/emergency-alerts/:id', emergencyAlertController.deleteEmergencyAlert);

// Update emergency alert status
router.patch('/emergency-alerts/:id/status', emergencyAlertController.updateEmergencyAlertStatus);

// Upload emergency alert attachment
router.post('/emergency-alerts/:id/attachments', upload.single('attachment'), emergencyAlertController.uploadEmergencyAlertAttachment);

// Add action to emergency alert
router.post('/emergency-alerts/:id/actions', emergencyAlertController.addEmergencyAlertAction);

// Escalate emergency alert
router.post('/emergency-alerts/:id/escalate', emergencyAlertController.escalateEmergencyAlert);

// Resolve emergency alert
router.post('/emergency-alerts/:id/resolve', emergencyAlertController.resolveEmergencyAlert);

// Get active emergency alerts
router.get('/emergency-alerts/active', emergencyAlertController.getActiveEmergencyAlerts);

// Get critical emergency alerts
router.get('/emergency-alerts/critical', emergencyAlertController.getCriticalEmergencyAlerts);

// Get emergency alert timeline
router.get('/emergency-alerts/:id/timeline', emergencyAlertController.getEmergencyAlertTimeline);

// Get emergency alert statistics
router.get('/emergency-alerts/statistics', emergencyAlertController.getEmergencyAlertStatistics);

// ==================== DASHBOARD ROUTES ====================

// Get dashboard statistics
router.get('/dashboard/stats', bloodBankDashboardController.getDashboardStats);

// Get recent activity
router.get('/dashboard/activity', bloodBankDashboardController.getRecentActivity);

// Quick Actions
// Create quick blood request
router.post('/dashboard/quick-request', bloodBankDashboardController.createQuickBloodRequest);

// Register quick donor
router.post('/dashboard/quick-donor', bloodBankDashboardController.registerQuickDonor);

// Initiate quality test
router.post('/dashboard/quick-test', bloodBankDashboardController.initiateQualityTest);

// Generate quick report
router.post('/dashboard/quick-report', bloodBankDashboardController.generateQuickReport);

// ==================== REPORT ROUTES ====================

// Get dashboard overview
router.get('/reports/dashboard', bloodBankReportController.getDashboardOverview);

// Get inventory reports
router.get('/reports/inventory', bloodBankReportController.getInventoryReports);

// Get donor reports
router.get('/reports/donors', bloodBankReportController.getDonorReports);

// Get request reports
router.get('/reports/requests', bloodBankReportController.getRequestReports);

// Get quality control reports
router.get('/reports/quality-control', bloodBankReportController.getQualityControlReports);

// Get emergency alert reports
router.get('/reports/emergency-alerts', bloodBankReportController.getEmergencyAlertReports);

// Get financial reports
router.get('/reports/financial', bloodBankReportController.getFinancialReports);

// Get operational reports
router.get('/reports/operational', bloodBankReportController.getOperationalReports);

// Export reports
router.get('/reports/export/:type', bloodBankReportController.exportReport);

// Generate custom reports
router.post('/reports/custom', bloodBankReportController.generateCustomReport);

// ==================== ANALYTICS ROUTES ====================

// Get analytics overview
router.get('/analytics/overview', bloodBankReportController.getAnalyticsOverview);

// Get inventory analytics
router.get('/analytics/inventory', bloodBankReportController.getInventoryAnalytics);

// Get donor analytics
router.get('/analytics/donors', bloodBankReportController.getDonorAnalytics);

// Get request analytics
router.get('/analytics/requests', bloodBankReportController.getRequestAnalytics);

// Get quality control analytics
router.get('/analytics/quality-control', bloodBankReportController.getQualityControlAnalytics);

// Get emergency alert analytics
router.get('/analytics/emergency-alerts', bloodBankReportController.getEmergencyAlertAnalytics);

// Get trend analysis
router.get('/analytics/trends', bloodBankReportController.getTrendAnalysis);

// Get performance metrics
router.get('/analytics/performance', bloodBankReportController.getPerformanceMetrics);

// ==================== NOTIFICATION ROUTES ====================

// Get notifications
router.get('/notifications', bloodBankReportController.getNotifications);

// Mark notification as read
router.patch('/notifications/:id/read', bloodBankReportController.markNotificationAsRead);

// Mark all notifications as read
router.patch('/notifications/read-all', bloodBankReportController.markAllNotificationsAsRead);

// Get notification settings
router.get('/notifications/settings', bloodBankReportController.getNotificationSettings);

// Update notification settings
router.put('/notifications/settings', bloodBankReportController.updateNotificationSettings);

// ==================== SETTINGS ROUTES ====================

// Get blood bank settings
router.get('/settings', bloodBankReportController.getBloodBankSettings);

// Update blood bank settings
router.put('/settings', bloodBankReportController.updateBloodBankSettings);

// Get user preferences
router.get('/settings/preferences', bloodBankReportController.getUserPreferences);

// Update user preferences
router.put('/settings/preferences', bloodBankReportController.updateUserPreferences);

// ==================== UTILITY ROUTES ====================

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Blood Bank API is running',
    timestamp: new Date().toISOString()
  });
});

// Get API documentation
router.get('/docs', (req, res) => {
  res.json({
    success: true,
    message: 'Blood Bank API Documentation',
    endpoints: {
      inventory: '/api/bloodbank/inventory',
      donors: '/api/bloodbank/donors',
      requests: '/api/bloodbank/requests',
      qualityControl: '/api/bloodbank/quality-control',
      emergencyAlerts: '/api/bloodbank/emergency-alerts',
      reports: '/api/bloodbank/reports',
      analytics: '/api/bloodbank/analytics'
    }
  });
});

export default router;
