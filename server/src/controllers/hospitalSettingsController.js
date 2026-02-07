import User from '../models/User.js';
import HospitalDepartment from '../models/HospitalDepartment.js';
import { logAccess } from '../utils/logger.js';

// @desc    Get hospital settings
// @route   GET /api/hospital/settings
// @access  Private (Hospital)
export const getHospitalSettings = async (req, res) => {
  try {
    const hospitalId = req.user._id;

    const hospital = await User.findById(hospitalId).select('-password');

    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    // Get departments
    const departments = await HospitalDepartment.find({ hospital: hospitalId })
      .select('name description departmentHead staff')
      .populate('departmentHead', 'firstName lastName specialization')
      .populate('staff.doctor', 'firstName lastName specialization');

    // Get doctors
    const doctors = await User.find({
      role: 'doctor',
      hospital: hospitalId,
      isActive: true
    }).select('firstName lastName specialization department phone email');

    const settings = {
      hospital: {
        name: hospital.hospitalName,
        type: hospital.hospitalType,
        location: hospital.location,
        phone: hospital.phone,
        email: hospital.email,
        emergencyContact: hospital.emergencyContact,
        rating: hospital.rating,
        isActive: hospital.isActive
      },
      departments: departments,
      doctors: doctors,
      preferences: {
        patientIdFormat: hospital.patientIdFormat || 'PAT-YYYYMMDD-XXX',
        defaultAdmissionType: hospital.defaultAdmissionType || 'elective',
        autoGeneratePatientId: hospital.autoGeneratePatientId !== false,
        requireInsuranceInfo: hospital.requireInsuranceInfo !== false,
        requireEmergencyContact: hospital.requireEmergencyContact !== false,
        enableVitalSignsTracking: hospital.enableVitalSignsTracking !== false,
        enableProgressNotes: hospital.enableProgressNotes !== false,
        enableBillingTracking: hospital.enableBillingTracking !== false,
        enableDischargePlanning: hospital.enableDischargePlanning !== false,
        notificationSettings: hospital.notificationSettings || {
          newPatientAdmission: true,
          patientStatusChange: true,
          criticalPatientAlert: true,
          dischargeNotification: true,
          billingUpdates: true
        }
      }
    };

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error getting hospital settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update hospital settings
// @route   PUT /api/hospital/settings
// @access  Private (Hospital)
export const updateHospitalSettings = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const updateData = req.body;

    const hospital = await User.findById(hospitalId);

    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    // Update hospital information
    if (updateData.hospital) {
      Object.keys(updateData.hospital).forEach(key => {
        if (key !== 'role' && key !== 'password' && key !== '_id') {
          hospital[key] = updateData.hospital[key];
        }
      });
    }

    // Update preferences
    if (updateData.preferences) {
      Object.keys(updateData.preferences).forEach(key => {
        hospital[key] = updateData.preferences[key];
      });
    }

    await hospital.save();

    const updatedHospital = await User.findById(hospitalId).select('-password');

    res.json({
      success: true,
      message: 'Hospital settings updated successfully',
      data: updatedHospital
    });
  } catch (error) {
    console.error('Error updating hospital settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get department settings
// @route   GET /api/hospital/settings/departments
// @access  Private (Hospital)
export const getDepartmentSettings = async (req, res) => {
  try {
    const hospitalId = req.user._id;

    const departments = await HospitalDepartment.find({ hospital: hospitalId })
      .populate('departmentHead', 'firstName lastName specialization')
      .populate('staff.doctor', 'firstName lastName specialization');

    res.json({
      success: true,
      data: departments
    });
  } catch (error) {
    console.error('Error getting department settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update department settings
// @route   PUT /api/hospital/settings/departments/:id
// @access  Private (Hospital)
export const updateDepartmentSettings = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const { id } = req.params;
    const updateData = req.body;

    const department = await HospitalDepartment.findOne({
      _id: id,
      hospital: hospitalId
    });

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Update department information
    Object.keys(updateData).forEach(key => {
      if (key !== '_id' && key !== 'hospital') {
        department[key] = updateData[key];
      }
    });

    await department.save();

    const updatedDepartment = await HospitalDepartment.findById(id)
      .populate('departmentHead', 'firstName lastName specialization')
      .populate('staff.doctor', 'firstName lastName specialization');

    res.json({
      success: true,
      message: 'Department settings updated successfully',
      data: updatedDepartment
    });
  } catch (error) {
    console.error('Error updating department settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get notification settings
// @route   GET /api/hospital/settings/notifications
// @access  Private (Hospital)
export const getNotificationSettings = async (req, res) => {
  try {
    const hospitalId = req.user._id;

    const hospital = await User.findById(hospitalId).select('notificationSettings');

    const notificationSettings = hospital.notificationSettings || {
      newPatientAdmission: true,
      patientStatusChange: true,
      criticalPatientAlert: true,
      dischargeNotification: true,
      billingUpdates: true,
      appointmentReminders: true,
      labResults: true,
      medicationAlerts: true,
      emergencyAlerts: true,
      systemMaintenance: true
    };

    res.json({
      success: true,
      data: notificationSettings
    });
  } catch (error) {
    console.error('Error getting notification settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update notification settings
// @route   PUT /api/hospital/settings/notifications
// @access  Private (Hospital)
export const updateNotificationSettings = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const notificationSettings = req.body;

    const hospital = await User.findById(hospitalId);

    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    hospital.notificationSettings = notificationSettings;
    await hospital.save();

    res.json({
      success: true,
      message: 'Notification settings updated successfully',
      data: notificationSettings
    });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get system preferences
// @route   GET /api/hospital/settings/preferences
// @access  Private (Hospital)
export const getSystemPreferences = async (req, res) => {
  try {
    const hospitalId = req.user._id;

    const hospital = await User.findById(hospitalId);

    const preferences = {
      patientIdFormat: hospital.patientIdFormat || 'PAT-YYYYMMDD-XXX',
      defaultAdmissionType: hospital.defaultAdmissionType || 'elective',
      autoGeneratePatientId: hospital.autoGeneratePatientId !== false,
      requireInsuranceInfo: hospital.requireInsuranceInfo !== false,
      requireEmergencyContact: hospital.requireEmergencyContact !== false,
      enableVitalSignsTracking: hospital.enableVitalSignsTracking !== false,
      enableProgressNotes: hospital.enableProgressNotes !== false,
      enableBillingTracking: hospital.enableBillingTracking !== false,
      enableDischargePlanning: hospital.enableDischargePlanning !== false,
      enableAuditLogging: hospital.enableAuditLogging !== false,
      enableRealTimeNotifications: hospital.enableRealTimeNotifications !== false,
      enableDataExport: hospital.enableDataExport !== false,
      enableAnalytics: hospital.enableAnalytics !== false,
      enableBackup: hospital.enableBackup !== false,
      dataRetentionPeriod: hospital.dataRetentionPeriod || 7, // years
      maxFileUploadSize: hospital.maxFileUploadSize || 10, // MB
      sessionTimeout: hospital.sessionTimeout || 30, // minutes
      passwordPolicy: hospital.passwordPolicy || {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true
      }
    };

    res.json({
      success: true,
      data: preferences
    });
  } catch (error) {
    console.error('Error getting system preferences:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update system preferences
// @route   PUT /api/hospital/settings/preferences
// @access  Private (Hospital)
export const updateSystemPreferences = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const preferences = req.body;

    const hospital = await User.findById(hospitalId);

    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    // Update preferences
    Object.keys(preferences).forEach(key => {
      hospital[key] = preferences[key];
    });

    await hospital.save();

    res.json({
      success: true,
      message: 'System preferences updated successfully',
      data: preferences
    });
  } catch (error) {
    console.error('Error updating system preferences:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get security settings
// @route   GET /api/hospital/settings/security
// @access  Private (Hospital)
export const getSecuritySettings = async (req, res) => {
  try {
    const hospitalId = req.user._id;

    const hospital = await User.findById(hospitalId);

    const securitySettings = {
      twoFactorAuth: hospital.twoFactorAuth || false,
      sessionTimeout: hospital.sessionTimeout || 30,
      maxLoginAttempts: hospital.maxLoginAttempts || 5,
      passwordPolicy: hospital.passwordPolicy || {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true
      },
      ipWhitelist: hospital.ipWhitelist || [],
      auditLogging: hospital.auditLogging !== false,
      dataEncryption: hospital.dataEncryption !== false,
      backupFrequency: hospital.backupFrequency || 'daily',
      dataRetentionPeriod: hospital.dataRetentionPeriod || 7
    };

    res.json({
      success: true,
      data: securitySettings
    });
  } catch (error) {
    console.error('Error getting security settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update security settings
// @route   PUT /api/hospital/settings/security
// @access  Private (Hospital)
export const updateSecuritySettings = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const securitySettings = req.body;

    const hospital = await User.findById(hospitalId);

    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    // Update security settings
    Object.keys(securitySettings).forEach(key => {
      hospital[key] = securitySettings[key];
    });

    await hospital.save();

    res.json({
      success: true,
      message: 'Security settings updated successfully',
      data: securitySettings
    });
  } catch (error) {
    console.error('Error updating security settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 