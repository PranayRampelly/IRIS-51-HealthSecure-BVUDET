import Patient from '../models/Patient.js';
import User from '../models/User.js';
import HospitalDepartment from '../models/HospitalDepartment.js';
import { logAccess } from '../utils/logger.js';
import realtimeService from '../services/realtimeService.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// @desc    Get all patients for hospital
// @route   GET /api/hospital/patients
// @access  Private (Hospital)
export const getHospitalPatients = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const { 
      page = 1, 
      limit = 10, 
      search, 
      status, 
      department, 
      priority,
      sortBy = 'admissionDate',
      sortOrder = 'desc'
    } = req.query;

    const query = { hospital: hospitalId };

    // Search functionality
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { patientId: { $regex: search, $options: 'i' } },
        { primaryDiagnosis: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Filter by department
    if (department && department !== 'all') {
      query.department = department;
    }

    // Filter by priority
    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const patients = await Patient.find(query)
      .populate('admittingDoctor', 'firstName lastName specialization')
      .populate('createdBy', 'firstName lastName')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Patient.countDocuments(query);

    // Get statistics
    const stats = await Patient.aggregate([
      { $match: { hospital: hospitalId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusStats = {
      total: total,
      active: 0,
      critical: 0,
      discharged: 0,
      pending: 0,
      transferred: 0
    };

    stats.forEach(stat => {
      statusStats[stat._id] = stat.count;
    });

    res.json({
      success: true,
      data: {
        patients,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalPatients: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        },
        stats: statusStats
      }
    });
  } catch (error) {
    console.error('Error getting hospital patients:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single patient details
// @route   GET /api/hospital/patients/:id
// @access  Private (Hospital)
export const getPatientDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user._id;

    const patient = await Patient.findOne({ _id: id, hospital: hospitalId })
      .populate('admittingDoctor', 'firstName lastName specialization')
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json({
      success: true,
      data: patient
    });
  } catch (error) {
    console.error('Error getting patient details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add new patient
// @route   POST /api/hospital/patients
// @access  Private (Hospital)
export const addPatient = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      bloodType,
      phone,
      email,
      address,
      emergencyContacts,
      primaryDiagnosis,
      secondaryDiagnosis,
      allergies,
      department,
      roomNumber,
      bedNumber,
      admissionDate,
      expectedDischargeDate,
      admittingDoctor,
      priority,
      treatmentPlan,
      insurance,
      notes
    } = req.body;

    // Check if patient with same email already exists
    const existingPatient = await Patient.findOne({ 
      email, 
      hospital: hospitalId,
      status: { $ne: 'discharged' }
    });

    if (existingPatient) {
      return res.status(400).json({ 
        message: 'Patient with this email already exists in your hospital' 
      });
    }

    const patient = new Patient({
      firstName,
      lastName,
      dateOfBirth,
      gender,
      bloodType,
      phone,
      email,
      address,
      emergencyContacts,
      primaryDiagnosis,
      secondaryDiagnosis,
      allergies,
      hospital: hospitalId,
      department,
      roomNumber,
      bedNumber,
      admissionDate: admissionDate || new Date(),
      expectedDischargeDate,
      admittingDoctor,
      priority: priority || 'medium',
      treatmentPlan,
      insurance,
      createdBy: hospitalId
    });

    if (notes) {
      patient.progressNotes.push({
        note: notes,
        writtenBy: hospitalId,
        category: 'medical'
      });
    }

    await patient.save();

    // Populate the saved patient
    const populatedPatient = await Patient.findById(patient._id)
      .populate('admittingDoctor', 'firstName lastName specialization')
      .populate('createdBy', 'firstName lastName');

    // Notify relevant staff
    await realtimeService.notifyHospitalStaff(hospitalId, {
      type: 'new_patient',
      patient: populatedPatient,
      message: `New patient ${patient.firstName} ${patient.lastName} admitted`
    });

    res.status(201).json({
      success: true,
      message: 'Patient added successfully',
      data: populatedPatient
    });
  } catch (error) {
    console.error('Error adding patient:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update patient information
// @route   PUT /api/hospital/patients/:id
// @access  Private (Hospital)
export const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user._id;
    const updateData = req.body;

    const patient = await Patient.findOne({ _id: id, hospital: hospitalId });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Update patient data
    Object.keys(updateData).forEach(key => {
      if (key !== 'status' && key !== 'progressNotes' && key !== 'vitalSigns') {
        patient[key] = updateData[key];
      }
    });

    patient.updatedBy = hospitalId;

    await patient.save();

    const updatedPatient = await Patient.findById(id)
      .populate('admittingDoctor', 'firstName lastName specialization')
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');

    res.json({
      success: true,
      message: 'Patient updated successfully',
      data: updatedPatient
    });
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update patient status
// @route   PATCH /api/hospital/patients/:id/status
// @access  Private (Hospital)
export const updatePatientStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user._id;
    const { status, notes } = req.body;

    const patient = await Patient.findOne({ _id: id, hospital: hospitalId });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    await patient.updateStatus(status, hospitalId, notes);

    const updatedPatient = await Patient.findById(id)
      .populate('admittingDoctor', 'firstName lastName specialization')
      .populate('updatedBy', 'firstName lastName');

    // Notify relevant staff about status change
    await realtimeService.notifyHospitalStaff(hospitalId, {
      type: 'patient_status_change',
      patient: updatedPatient,
      message: `Patient ${patient.firstName} ${patient.lastName} status changed to ${status}`
    });

    res.json({
      success: true,
      message: 'Patient status updated successfully',
      data: updatedPatient
    });
  } catch (error) {
    console.error('Error updating patient status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add progress note
// @route   POST /api/hospital/patients/:id/notes
// @access  Private (Hospital)
export const addProgressNote = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user._id;
    const { note, category = 'medical' } = req.body;

    const patient = await Patient.findOne({ _id: id, hospital: hospitalId });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    await patient.addProgressNote(note, hospitalId, category);

    const updatedPatient = await Patient.findById(id)
      .populate('admittingDoctor', 'firstName lastName specialization')
      .populate('updatedBy', 'firstName lastName');

    res.json({
      success: true,
      message: 'Progress note added successfully',
      data: updatedPatient
    });
  } catch (error) {
    console.error('Error adding progress note:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add vital signs
// @route   POST /api/hospital/patients/:id/vitals
// @access  Private (Hospital)
export const addVitalSigns = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user._id;
    const vitals = req.body;

    const patient = await Patient.findOne({ _id: id, hospital: hospitalId });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    await patient.addVitalSigns(vitals, hospitalId);

    const updatedPatient = await Patient.findById(id)
      .populate('admittingDoctor', 'firstName lastName specialization')
      .populate('updatedBy', 'firstName lastName');

    res.json({
      success: true,
      message: 'Vital signs recorded successfully',
      data: updatedPatient
    });
  } catch (error) {
    console.error('Error adding vital signs:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Discharge patient
// @route   POST /api/hospital/patients/:id/discharge
// @access  Private (Hospital)
export const dischargePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user._id;
    const {
      dischargeDate,
      dischargeType,
      followUpAppointment,
      followUpDoctor,
      homeCareInstructions,
      medications,
      restrictions,
      activities,
      notes
    } = req.body;

    const patient = await Patient.findOne({ _id: id, hospital: hospitalId });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    patient.status = 'discharged';
    patient.actualDischargeDate = dischargeDate || new Date();
    patient.dischargePlan = {
      dischargeDate: dischargeDate || new Date(),
      dischargeType,
      followUpAppointment,
      followUpDoctor,
      homeCareInstructions,
      medications,
      restrictions,
      activities
    };
    patient.updatedBy = hospitalId;

    if (notes) {
      patient.progressNotes.push({
        note: notes,
        writtenBy: hospitalId,
        category: 'discharge'
      });
    }

    await patient.save();

    const dischargedPatient = await Patient.findById(id)
      .populate('admittingDoctor', 'firstName lastName specialization')
      .populate('updatedBy', 'firstName lastName');

    // Notify relevant staff about discharge
    await realtimeService.notifyHospitalStaff(hospitalId, {
      type: 'patient_discharged',
      patient: dischargedPatient,
      message: `Patient ${patient.firstName} ${patient.lastName} has been discharged`
    });

    res.json({
      success: true,
      message: 'Patient discharged successfully',
      data: dischargedPatient
    });
  } catch (error) {
    console.error('Error discharging patient:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get patient analytics
// @route   GET /api/hospital/patients/analytics
// @access  Private (Hospital)
export const getPatientAnalytics = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const { period = '30' } = req.query;

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    // Patient status distribution
    const statusDistribution = await Patient.aggregate([
      { $match: { hospital: hospitalId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Department distribution
    const departmentDistribution = await Patient.aggregate([
      { $match: { hospital: hospitalId } },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      }
    ]);

    // Admissions over time
    const admissionsOverTime = await Patient.aggregate([
      { 
        $match: { 
          hospital: hospitalId,
          admissionDate: { $gte: daysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$admissionDate" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Discharges over time
    const dischargesOverTime = await Patient.aggregate([
      { 
        $match: { 
          hospital: hospitalId,
          actualDischargeDate: { $gte: daysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$actualDischargeDate" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Average length of stay
    const avgLengthOfStay = await Patient.aggregate([
      { 
        $match: { 
          hospital: hospitalId,
          actualDischargeDate: { $exists: true }
        }
      },
      {
        $addFields: {
          lengthOfStay: {
            $ceil: {
              $divide: [
                { $subtract: ["$actualDischargeDate", "$admissionDate"] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          avgLengthOfStay: { $avg: "$lengthOfStay" }
        }
      }
    ]);

    // Priority distribution
    const priorityDistribution = await Patient.aggregate([
      { $match: { hospital: hospitalId } },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        statusDistribution,
        departmentDistribution,
        admissionsOverTime,
        dischargesOverTime,
        avgLengthOfStay: avgLengthOfStay[0]?.avgLengthOfStay || 0,
        priorityDistribution
      }
    });
  } catch (error) {
    console.error('Error getting patient analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Export patient data
// @route   GET /api/hospital/patients/export
// @access  Private (Hospital)
export const exportPatientData = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const { format = 'csv', status, department } = req.query;

    const query = { hospital: hospitalId };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (department && department !== 'all') {
      query.department = department;
    }

    const patients = await Patient.find(query)
      .populate('admittingDoctor', 'firstName lastName')
      .populate('createdBy', 'firstName lastName');

    if (format === 'csv') {
      let csvContent = 'Patient ID,First Name,Last Name,Date of Birth,Gender,Phone,Email,Department,Status,Admission Date,Admitting Doctor,Primary Diagnosis\n';
      
      patients.forEach(patient => {
        csvContent += `"${patient.patientId}","${patient.firstName}","${patient.lastName}","${patient.dateOfBirth}","${patient.gender}","${patient.phone}","${patient.email}","${patient.department}","${patient.status}","${patient.admissionDate}","${patient.admittingDoctor?.firstName || ''} ${patient.admittingDoctor?.lastName || ''}","${patient.primaryDiagnosis || ''}"\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=patients_${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csvContent);
    } else {
      res.json({
        success: true,
        data: patients
      });
    }
  } catch (error) {
    console.error('Error exporting patient data:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get departments for hospital
// @route   GET /api/hospital/patients/departments
// @access  Private (Hospital)
export const getHospitalDepartments = async (req, res) => {
  try {
    const hospitalId = req.user._id;

    const departments = await HospitalDepartment.find({ hospital: hospitalId })
      .select('name description departmentHead staff')
      .populate('departmentHead', 'firstName lastName specialization')
      .populate('staff.doctor', 'firstName lastName specialization');

    res.json({
      success: true,
      data: departments
    });
  } catch (error) {
    console.error('Error getting hospital departments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get doctors for hospital
// @route   GET /api/hospital/patients/doctors
// @access  Private (Hospital)
export const getHospitalDoctors = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const { department } = req.query;

    const query = { 
      role: 'doctor', 
      hospital: hospitalId,
      isActive: true 
    };

    if (department) {
      query.department = department;
    }

    const doctors = await User.find(query)
      .select('firstName lastName specialization department phone email')
      .sort({ firstName: 1, lastName: 1 });

    res.json({
      success: true,
      data: doctors
    });
  } catch (error) {
    console.error('Error getting hospital doctors:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete patient (soft delete)
// @route   DELETE /api/hospital/patients/:id
// @access  Private (Hospital)
export const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user._id;

    const patient = await Patient.findOne({ _id: id, hospital: hospitalId });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Soft delete - mark as discharged
    patient.status = 'discharged';
    patient.actualDischargeDate = new Date();
    patient.updatedBy = hospitalId;

    await patient.save();

    res.json({
      success: true,
      message: 'Patient deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 