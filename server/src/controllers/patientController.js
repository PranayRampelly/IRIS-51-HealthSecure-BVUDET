import User from '../models/User.js';
import HealthRecord from '../models/HealthRecord.js';
import Proof from '../models/Proof.js';
import ProofRequest from '../models/ProofRequest.js';
import Patient from '../models/Patient.js';
import { logAccess } from '../utils/logger.js';

// @desc    Update patient profile
// @route   PUT /api/patient/profile
// @access  Private (Patient only)
export const updatePatientProfile = async (req, res) => {
  try {
    // Remove sensitive fields that shouldn't be updated
    const forbidden = ['password', 'email', 'role', 'isEmailVerified', 'isActive', '_id', 'patientId'];
    forbidden.forEach(f => delete req.body[f]);
    const user = await User.findByIdAndUpdate(
      req.user._id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get patient profile
// @route   GET /api/patient/profile
// @access  Private (Patient only)
export const getPatientProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user); // Return all fields except password
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get patient dashboard data
// @route   GET /api/patient/dashboard
// @access  Private (Patient only)
export const getPatientDashboard = async (req, res) => {
  try {
    // Get recent health records
    const recentRecords = await HealthRecord.find({ patientId: req.user._id })
      .sort({ date: -1 })
      .limit(5);

    // Get pending proof requests
    const pendingRequests = await ProofRequest.find({
      patientId: req.user._id,
      status: 'Pending'
    })
      .populate('requesterId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get recent proofs
    const recentProofs = await Proof.find({ patientId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    // Get statistics
    const totalRecords = await HealthRecord.countDocuments({ patientId: req.user._id });
    const totalProofs = await Proof.countDocuments({ patientId: req.user._id });
    const pendingRequestsCount = await ProofRequest.countDocuments({
      patientId: req.user._id,
      status: 'Pending'
    });

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivity = await ProofRequest.find({
      patientId: req.user._id,
      createdAt: { $gte: sevenDaysAgo }
    })
      .populate('requesterId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      recentRecords,
      pendingRequests,
      recentProofs,
      statistics: {
        totalRecords,
        totalProofs,
        pendingRequests: pendingRequestsCount
      },
      recentActivity
    });
  } catch (error) {
    console.error('Get patient dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Check if patient profile is complete
// @route   GET /api/patient/profile/status
// @access  Private (Patient only)
export const checkProfileStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('firstName lastName email phone dateOfBirth emergencyContacts profileComplete');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if essential fields are filled
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth'];
    const hasRequiredFields = requiredFields.every(field => user[field]);

    // Check if emergency contacts exist
    const hasEmergencyContacts = user.emergencyContacts &&
      user.emergencyContacts.length > 0 &&
      user.emergencyContacts.some(contact => contact.name && contact.phone);

    const isComplete = hasRequiredFields && hasEmergencyContacts;

    res.json({
      isComplete,
      hasRequiredFields,
      hasEmergencyContacts,
      missingFields: !hasRequiredFields ? requiredFields.filter(field => !user[field]) : [],
      hasEmergencyContacts: hasEmergencyContacts
    });
  } catch (error) {
    console.error('Check profile status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get patients list (for insurance users)
// @route   GET /api/patient/list
// @access  Private (Insurance only)
export const getPatientsList = async (req, res) => {
  try {
    // Only allow insurance users to access this endpoint
    if (req.user.role !== 'insurance') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { search, limit = 50 } = req.query;

    let query = { role: 'patient' };

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const patients = await User.find(query)
      .select('firstName lastName email dateOfBirth phone _id')
      .limit(parseInt(limit))
      .sort({ firstName: 1, lastName: 1 });

    res.json({
      patients,
      count: patients.length
    });

    await logAccess(req.user._id, 'VIEW', 'User', null, null, req, 'Viewed patients list');
  } catch (error) {
    console.error('Get patients list error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// --- Emergency Contacts CRUD ---
// @desc    List emergency contacts for logged-in patient
// @route   GET /api/patient/emergency-contacts
// @access  Private (Patient)
export const listEmergencyContacts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('emergencyContacts');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ contacts: user.emergencyContacts || [] });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add a new emergency contact
// @route   POST /api/patient/emergency-contacts
// @access  Private (Patient)
export const addEmergencyContact = async (req, res) => {
  try {
    const contact = req.body || {};
    // Ensure primary uniqueness
    if (contact.isPrimary) {
      await User.updateOne({ _id: req.user._id }, { $set: { 'emergencyContacts.$[].isPrimary': false } });
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { emergencyContacts: contact } },
      { new: true, runValidators: true }
    ).select('emergencyContacts');
    res.status(201).json({ contacts: user.emergencyContacts });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Update an emergency contact by subdocument id
// @route   PUT /api/patient/emergency-contacts/:contactId
// @access  Private (Patient)
export const updateEmergencyContact = async (req, res) => {
  try {
    const { contactId } = req.params;
    const updates = req.body || {};
    if (updates.isPrimary) {
      await User.updateOne({ _id: req.user._id }, { $set: { 'emergencyContacts.$[].isPrimary': false } });
    }
    const user = await User.findOneAndUpdate(
      { _id: req.user._id, 'emergencyContacts._id': contactId },
      { $set: Object.fromEntries(Object.entries(updates).map(([k, v]) => [`emergencyContacts.$.${k}`, v])) },
      { new: true, runValidators: true }
    ).select('emergencyContacts');
    if (!user) return res.status(404).json({ message: 'Contact not found' });
    res.json({ contacts: user.emergencyContacts });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Delete an emergency contact
// @route   DELETE /api/patient/emergency-contacts/:contactId
// @access  Private (Patient)
export const deleteEmergencyContact = async (req, res) => {
  try {
    const { contactId } = req.params;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { emergencyContacts: { _id: contactId } } },
      { new: true }
    ).select('emergencyContacts');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ contacts: user.emergencyContacts });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get current patient's health analytics
// @route   GET /api/patient/analytics
// @access  Private (Patient only)
export const getPatientHealthAnalytics = async (req, res) => {
  try {
    // Find patient clinical record by user email
    const patient = await Patient.findOne({ email: req.user.email });

    if (!patient) {
      return res.json({
        success: true,
        analytics: [],
        conditions: [],
        message: 'No clinical record found for this patient'
      });
    }

    // Process vital signs for charts
    const vitalSigns = patient.vitalSigns || [];

    // Sort by timestamp ascending
    vitalSigns.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const analyticsData = vitalSigns.map(vital => {
      // Parse blood pressure
      let bp = { systolic: null, diastolic: null };
      if (vital.bloodPressure && vital.bloodPressure.includes('/')) {
        const [sys, dia] = vital.bloodPressure.split('/').map(n => parseInt(n.trim()));
        bp = { systolic: sys, diastolic: dia };
      }

      return {
        date: vital.timestamp,
        timestamp: new Date(vital.timestamp).getTime(),
        bloodPressure: vital.bloodPressure,
        systolic: bp.systolic,
        diastolic: bp.diastolic,
        heartRate: parseInt(vital.heartRate) || null,
        temperature: parseFloat(vital.temperature) || null,
        weight: parseFloat(vital.weight) || null,
        oxygenSaturation: parseInt(vital.oxygenSaturation) || null,
        glucose: vital.bloodGlucose?.value || null,
        glucoseType: vital.bloodGlucose?.type || null,
        hba1c: vital.hba1c || null,
        peakFlow: vital.peakFlow || null,
        ldl: vital.cholesterol?.ldl || null,
        hdl: vital.cholesterol?.hdl || null,
        triglycerides: vital.cholesterol?.triglycerides || null
      };
    });

    res.json({
      success: true,
      patient: {
        id: patient._id,
        patientId: patient.patientId,
        firstName: patient.firstName,
        lastName: patient.lastName,
        monitoredConditions: patient.monitoredConditions || []
      },
      analytics: analyticsData
    });

  } catch (error) {
    console.error('❌ Error fetching patient analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient analytics',
      error: error.message
    });
  }
};

// @desc    Add vital signs for logged-in patient
// @route   POST /api/patient/vitals
// @access  Private (Patient only)
export const addPatientVitalSigns = async (req, res) => {
  try {
    const {
      bloodPressure, heartRate, temperature, weight, oxygenSaturation, height,
      bloodGlucose, hba1c, cholesterol, peakFlow
    } = req.body;

    let patient = await Patient.findOne({ email: req.user.email });

    // If no patient clinical record exists, create a minimal one
    if (!patient) {
      console.log('🔍 Creating new patient record for:', req.user.email);
      patient = new Patient({
        email: req.user.email,
        firstName: req.user.firstName || 'Unknown',
        lastName: req.user.lastName || 'Patient',
        phone: req.user.phone || 'N/A',
        dateOfBirth: req.user.dateOfBirth || new Date('1990-01-01'),
        gender: req.user.gender || 'Other',
        hospital: req.user._id, // Self-managed for now
        department: 'Self Tracking',
        admissionDate: new Date(),
        status: 'active',
        priority: 'medium',
        createdBy: req.user._id
      });
    }

    const newVital = {
      timestamp: new Date(),
      bloodPressure,
      heartRate: String(heartRate || ''),
      temperature: String(temperature || ''),
      weight: String(weight || ''),
      oxygenSaturation: String(oxygenSaturation || ''),
      height: String(height || patient.height || ''),
      bloodGlucose: bloodGlucose || null,
      hba1c: hba1c || null,
      cholesterol: cholesterol || null,
      peakFlow: peakFlow || null,
      recordedBy: req.user._id
    };

    if (!patient.vitalSigns) patient.vitalSigns = [];
    patient.vitalSigns.push(newVital);

    await patient.save();

    // Emit real-time update via Socket.io
    if (global.io) {
      const room = `patient-${patient._id}`;
      console.log(`📡 Emitting vitals-updated to room: ${room}`);
      global.io.to(room).emit('vitals-updated', {
        success: true,
        patientId: patient._id,
        vitals: newVital
      });
    }

    res.status(201).json({
      success: true,
      message: 'Vital signs recorded successfully',
      vitals: newVital
    });
  } catch (error) {
    console.error('❌ Error in addPatientVitalSigns:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to record vital signs',
      error: error.message
    });
  }
};