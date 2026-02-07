import express from 'express';
import {
  getHospitalSettings,
  updateHospitalSettings,
  getDepartmentSettings,
  updateDepartmentSettings,
  getNotificationSettings,
  updateNotificationSettings,
  getSystemPreferences,
  updateSystemPreferences,
  getSecuritySettings,
  updateSecuritySettings
} from '../controllers/hospitalSettingsController.js';
import { auth } from '../middleware/auth.js';
import { hospitalAuth } from '../middleware/hospitalAuth.js';

const router = express.Router();

// All routes require authentication and hospital role
router.use(auth);
router.use(hospitalAuth);

// General Settings Routes
router.route('/')
  .get(getHospitalSettings)           // GET /api/hospital/settings - Get hospital settings
  .put(updateHospitalSettings);       // PUT /api/hospital/settings - Update hospital settings

// Department Settings Routes
router.route('/departments')
  .get(getDepartmentSettings);        // GET /api/hospital/settings/departments - Get department settings

router.route('/departments/:id')
  .put(updateDepartmentSettings);     // PUT /api/hospital/settings/departments/:id - Update department settings

// Notification Settings Routes
router.route('/notifications')
  .get(getNotificationSettings)       // GET /api/hospital/settings/notifications - Get notification settings
  .put(updateNotificationSettings);   // PUT /api/hospital/settings/notifications - Update notification settings

// System Preferences Routes
router.route('/preferences')
  .get(getSystemPreferences)          // GET /api/hospital/settings/preferences - Get system preferences
  .put(updateSystemPreferences);      // PUT /api/hospital/settings/preferences - Update system preferences

// Security Settings Routes
router.route('/security')
  .get(getSecuritySettings)           // GET /api/hospital/settings/security - Get security settings
  .put(updateSecuritySettings);       // PUT /api/hospital/settings/security - Update security settings

export default router; 