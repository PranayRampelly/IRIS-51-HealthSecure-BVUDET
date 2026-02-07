import User from '../models/User.js';
import HealthRecord from '../models/HealthRecord.js';
import Proof from '../models/Proof.js';
import ProofRequest from '../models/ProofRequest.js';
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