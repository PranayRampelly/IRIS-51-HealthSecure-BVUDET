import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import PatientAdmission from '../models/PatientAdmission.js';
import AdmissionRequest from '../models/AdmissionRequest.js';
import HospitalDepartment from '../models/HospitalDepartment.js';
import EmergencyResponse from '../models/EmergencyResponse.js';
import AmbulanceService from '../models/AmbulanceService.js';
import AmbulanceBooking from '../models/AmbulanceBooking.js';
import AmbulanceDriver from '../models/AmbulanceDriver.js';
import Doctor from '../models/Doctor.js';
import Nurse from '../models/Nurse.js';
import StaffSchedule from '../models/StaffSchedule.js';
import StaffTraining from '../models/StaffTraining.js';
import { logAccess } from '../utils/logger.js';
import realtimeService from '../services/realtimeService.js';
import cloudinary from '../utils/cloudinary.js';
import fs from 'fs';

// @desc    Get hospital profile
// @route   GET /api/hospital/profile
// @access  Private (Hospital)
export const getHospitalProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user || user.role !== 'hospital') {
      return res.status(403).json({ message: 'Access denied. Hospital role required.' });
    }

    // Transform the data to match frontend expectations
    const profileData = {
      hospitalName: user.hospitalName || '',
      hospitalType: user.hospitalType || '',
      licenseNumber: user.licenseNumber || '',
      registrationNumber: user.registrationNumber || '',
      establishmentDate: user.establishmentDate ? user.establishmentDate.toISOString().split('T')[0] : '',
      phone: user.phone || '',
      email: user.email || '',
      website: user.website || '',
      emergencyContact: user.emergencyContact || '',
      emergencyPhone: user.emergencyPhone || '',
      ambulancePhone: user.ambulancePhone || '',
      address: {
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        zipCode: user.address?.zipCode || '',
        country: user.address?.country || 'United States'
      },
      description: user.description || '',
      mission: user.mission || '',
      vision: user.vision || '',
      totalBeds: user.totalBeds || 0,
      departments: user.departments || 0,
      staffCount: user.staffCount || 0,
      insuranceAccepted: user.insuranceAccepted || [],
      documents: user.documents || [
        { type: 'license', title: 'Hospital License', file: null, required: true },
        { type: 'registration', title: 'Hospital Registration Certificate', file: null, required: true },
        { type: 'accreditation', title: 'Accreditation Certificate', file: null, required: true },
        { type: 'insurance', title: 'Medical Malpractice Insurance', file: null, required: true },
        { type: 'fire', title: 'Fire Safety Certificate', file: null, required: true },
        { type: 'hygiene', title: 'Hygiene & Sanitation Certificate', file: null, required: true },
        { type: 'quality', title: 'Quality Management Certificate', file: null, required: true },
        { type: 'safety', title: 'Patient Safety Certificate', file: null, required: true },
        { type: 'infection', title: 'Infection Control Certificate', file: null, required: true },
        { type: 'emergency', title: 'Emergency Preparedness Certificate', file: null, required: true },
        { type: 'pharmacy', title: 'Pharmacy License', file: null, required: true },
        { type: 'laboratory', title: 'Laboratory Accreditation', file: null, required: true },
        { type: 'radiology', title: 'Radiology Department License', file: null, required: true },
        { type: 'bloodbank', title: 'Blood Bank License', file: null, required: true },
        { type: 'ambulance', title: 'Ambulance Service License', file: null, required: true },
        { type: 'biohazard', title: 'Biohazard Waste Management', file: null, required: true },
        { type: 'radiation', title: 'Radiation Safety Certificate', file: null, required: true },
        { type: 'cyber', title: 'Cybersecurity Compliance', file: null, required: true },
        { type: 'privacy', title: 'HIPAA Compliance Certificate', file: null, required: true },
        { type: 'disaster', title: 'Disaster Management Plan', file: null, required: true },
        { type: 'staffing', title: 'Staff Credentialing Records', file: null, required: true }
      ],
      profileCompleted: user.profileCompleted || false,
      profileCompletedAt: user.profileCompletedAt ? user.profileCompletedAt.toISOString() : undefined,

      // Additional professional fields
      facilities: user.facilities || [],
      services: user.services || [],
      specialties: user.specialties || [],
      workingDays: user.workingDays || [],
      accreditations: user.accreditations || [],
      certifications: user.certifications || [],
      qualityStandards: user.qualityStandards || [],
      paymentMethods: user.paymentMethods || [],

      // Operating hours
      operatingHours: user.operatingHours || {
        startTime: '08:00',
        endTime: '20:00',
        emergency24x7: true
      },

      // Emergency services
      emergencyServices: user.emergencyServices || {
        traumaCenter: false,
        strokeCenter: false,
        heartCenter: false,
        burnUnit: false,
        neonatalICU: false,
        pediatricICU: false,
        ambulanceService: false,
        helicopterService: false
      },

      // Technology capabilities
      technology: user.technology || {
        mri: false,
        ctScan: false,
        xray: false,
        ultrasound: false,
        endoscopy: false,
        laparoscopy: false,
        roboticSurgery: false,
        telemedicine: false
      },

      // Medical staff breakdown
      medicalStaff: user.medicalStaff || {
        doctors: 0,
        nurses: 0,
        specialists: 0,
        technicians: 0,
        supportStaff: 0
      },

      // Ambulance services
      ambulanceServices: user.ambulanceServices || {
        available: false,
        fleetSize: 0,
        responseTime: '',
        coverageArea: '',
        specialEquipment: []
      },

      profileImage: user.profileImage || '',
      isEmailVerified: user.isEmailVerified || false
    };

    res.json({
      success: true,
      data: profileData
    });

    await logAccess(req.user._id, 'VIEW', 'Hospital', req.user._id, null, req, 'Hospital profile viewed');
  } catch (error) {
    console.error('Get hospital profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update hospital profile
// @route   PUT /api/hospital/profile
// @access  Private (Hospital)
export const updateHospitalProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || user.role !== 'hospital') {
      return res.status(403).json({ message: 'Access denied. Hospital role required.' });
    }

    // Remove sensitive fields that shouldn't be updated
    const forbidden = ['password', 'email', 'role', 'isEmailVerified', 'isActive', '_id', 'patientId'];
    forbidden.forEach(f => delete req.body[f]);

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Hospital profile updated successfully',
      data: updatedUser
    });

    await logAccess(req.user._id, 'UPDATE', 'Hospital', req.user._id, null, req, 'Hospital profile updated');
  } catch (error) {
    console.error('Update hospital profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get hospital dashboard with real-time data
// @route   GET /api/hospital/dashboard
// @access  Private (Hospital)
export const getHospitalDashboard = async (req, res) => {
  try {
    const hospitalId = req.user._id;

    // Get basic hospital info
    const hospital = await User.findById(hospitalId).select('-password');
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    // Get real-time statistics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get appointments for today
    const todayAppointments = await Appointment.find({
      hospital: hospitalId,
      scheduledDate: {
        $gte: today,
        $lt: tomorrow
      }
    }).populate('patient', 'firstName lastName');

    // Get active admissions
    const activeAdmissions = await PatientAdmission.find({
      hospital: hospitalId,
      status: { $in: ['admitted', 'under-observation', 'stable', 'critical', 'improving'] }
    }).populate('patient', 'firstName lastName');

    // Get departments
    const departments = await HospitalDepartment.find({ hospital: hospitalId });

    // Get emergency responses
    const activeEmergencies = await EmergencyResponse.find({
      assignedHospital: hospitalId,
      status: { $in: ['received', 'processing', 'dispatched', 'en-route', 'on-scene', 'transporting'] }
    });

    // Calculate real-time statistics
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const availableBeds = departments.reduce((total, dept) => total + dept.capacity.availableBeds, 0);
    const staffCount = await User.countDocuments({
      role: 'doctor',
      hospital: hospitalId
    });

    // Get connected users count
    const connectedUsers = realtimeService.getConnectedUsersCount();
    const connectedStaff = realtimeService.getHospitalStaff(hospitalId);

    const dashboardData = {
      hospitalInfo: {
        name: hospital.hospitalName || 'General Hospital',
        type: hospital.hospitalType || 'General Hospital',
        licenseNumber: hospital.licenseNumber || 'HOSP-001',
        address: hospital.address || '',
        phone: hospital.phone || ''
      },
      realTimeStats: {
        totalPatients,
        activeAdmissions: activeAdmissions.length,
        availableBeds,
        staffCount,
        todayAppointments: todayAppointments.length,
        emergencyCases: activeEmergencies.length,
        connectedUsers,
        connectedStaff: connectedStaff.length
      },
      departments: departments.map(dept => ({
        id: dept._id,
        name: dept.name,
        status: dept.status,
        capacity: dept.capacity,
        occupancyPercentage: dept.occupancyPercentage,
        currentWaitTime: dept.currentWaitTime
      })),
      recentActivity: [
        ...todayAppointments.slice(0, 5).map(apt => ({
          id: apt._id,
          type: 'appointment',
          patient: `${apt.patient.firstName} ${apt.patient.lastName}`,
          time: apt.scheduledTime,
          status: apt.status,
          department: apt.department
        })),
        ...activeAdmissions.slice(0, 5).map(adm => ({
          id: adm._id,
          type: 'admission',
          patient: `${adm.patient.firstName} ${adm.patient.lastName}`,
          time: adm.admissionTime,
          status: adm.status,
          department: adm.department
        }))
      ],
      activeEmergencies: activeEmergencies.map(emergency => ({
        id: emergency._id,
        emergencyNumber: emergency.emergencyNumber,
        type: emergency.emergencyType,
        priority: emergency.priority,
        status: emergency.status,
        location: emergency.location.address,
        estimatedArrival: emergency.currentLocation ? '15 minutes' : 'Unknown'
      }))
    };

    res.json({
      success: true,
      data: dashboardData
    });

    await logAccess(req.user._id, 'VIEW', 'Hospital', null, null, req, 'Hospital dashboard accessed');
  } catch (error) {
    console.error('Error getting hospital dashboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get hospital staff (doctors and nurses)
// @route   GET /api/hospital/staff
// @access  Private (Hospital)
export const getHospitalStaff = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const hospital = await User.findById(hospitalId);
    if (!hospital || hospital.role !== 'hospital') {
      return res.status(403).json({ success: false, message: 'Access denied. Hospital role required.' });
    }

    const hospitalName = hospital?.hospitalName || hospital?.hospital?.name || hospital?.firstName || 'Hospital';

    // Find doctors associated with this hospital
    const doctorUsers = await User.find({
      role: 'doctor',
      hospital: hospitalName
    }).select('_id').lean();

    const doctorIds = doctorUsers.map(u => u._id);
    const doctors = await Doctor.find({ userId: { $in: doctorIds } })
      .populate('userId', 'firstName lastName email phone department')
      .lean();

    // Find nurses associated with this hospital
    const nurses = await Nurse.find({ hospital: hospitalId })
      .populate('userId', 'firstName lastName email phone')
      .lean();

    // Transform doctors to match frontend format
    const transformedDoctors = doctors.map(doctor => ({
      id: doctor._id,
      _id: doctor._id,
      name: doctor.name || `${doctor.userId?.firstName || ''} ${doctor.userId?.lastName || ''}`.trim(),
      firstName: doctor.userId?.firstName || '',
      lastName: doctor.userId?.lastName || '',
      email: doctor.userId?.email || '',
      phone: doctor.userId?.phone || '',
      department: doctor.userId?.department || doctor.specialization || '',
      specialization: doctor.specialization || '',
      staffType: 'doctor',
      profileImage: doctor.profilePicture || ''
    }));

    // Transform nurses to match frontend format
    const transformedNurses = nurses.map(nurse => ({
      id: nurse._id,
      _id: nurse._id,
      name: `${nurse.firstName} ${nurse.lastName}`,
      firstName: nurse.firstName,
      lastName: nurse.lastName,
      email: nurse.email,
      phone: nurse.phone,
      department: nurse.department,
      specialization: nurse.specialization || '',
      staffType: 'nurse',
      profileImage: nurse.profilePicture || ''
    }));

    // Combine all staff
    const allStaff = [...transformedDoctors, ...transformedNurses];

    res.json({
      success: true,
      staff: allStaff,
      count: allStaff.length
    });

    await logAccess(hospitalId, 'VIEW', 'Hospital', null, null, req, 'Hospital staff list viewed');
  } catch (error) {
    console.error('Get hospital staff error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get hospital profile completion status
// @route   GET /api/hospital/profile-completion
// @access  Private (Hospital)
export const getProfileCompletion = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || user.role !== 'hospital') {
      return res.status(403).json({ message: 'Access denied. Hospital role required.' });
    }

    const isComplete = user.isProfileComplete();
    const missingFields = [];

    if (!user.hospitalName) missingFields.push('hospitalName');
    if (!user.hospitalType) missingFields.push('hospitalType');
    if (!user.licenseNumber) missingFields.push('licenseNumber');
    if (!user.phone) missingFields.push('phone');
    if (!user.location?.city) missingFields.push('location.city');
    if (!user.location?.state) missingFields.push('location.state');

    res.json({
      success: true,
      data: {
        isComplete,
        missingFields,
        completionPercentage: Math.round(((6 - missingFields.length) / 6) * 100)
      }
    });
  } catch (error) {
    console.error('Get profile completion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get hospital appointments with real-time updates
// @route   GET /api/hospital/appointments
// @access  Private (Hospital)
export const getHospitalAppointments = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const { status, department, date, page = 1, limit = 20 } = req.query;

    const query = { hospital: hospitalId };

    if (status) query.status = status;
    if (department) query.department = department;
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      query.scheduledDate = { $gte: startDate, $lt: endDate };
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'firstName lastName phone')
      .populate('doctor', 'firstName lastName specialization')
      .sort({ scheduledDate: 1, scheduledTime: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Appointment.countDocuments(query);

    res.json({
      success: true,
      data: {
        appointments,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Error getting hospital appointments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update appointment status with real-time notification
// @route   PUT /api/hospital/appointments/:id/status
// @access  Private (Hospital)
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const hospitalId = req.user._id;

    const appointment = await Appointment.findOne({
      _id: id,
      hospital: hospitalId
    }).populate('patient doctor');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Update appointment status
    await appointment.updateStatus(status, hospitalId, notes);

    // Send real-time notification to patient
    if (appointment.patient) {
      realtimeService.sendNotification(appointment.patient._id, {
        type: 'appointment_update',
        title: 'Appointment Update',
        message: `Your appointment status has been updated to: ${status}`,
        data: { appointmentId: id, status, notes }
      });
    }

    // Broadcast to appointment room
    realtimeService.broadcastToRoom(`appointment:${id}`, 'appointment:status:updated', {
      appointmentId: id,
      status,
      notes,
      updatedBy: hospitalId,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Appointment status updated successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get hospital patient admissions
// @route   GET /api/hospital/admissions
// @access  Private (Hospital)
export const getHospitalAdmissions = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const { status, department, page = 1, limit = 20 } = req.query;

    const query = { hospital: hospitalId };

    if (status) query.status = status;
    if (department) query.department = department;

    const admissions = await PatientAdmission.find(query)
      .populate('patient', 'firstName lastName phone')
      .populate('admittingDoctor', 'firstName lastName specialization')
      .sort({ admissionDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await PatientAdmission.countDocuments(query);

    res.json({
      success: true,
      data: {
        admissions,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Error getting hospital admissions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new patient admission
// @route   POST /api/hospital/admissions
// @access  Private (Hospital)
export const createPatientAdmission = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const {
      patientId,
      admittingDoctorId,
      admissionType,
      department,
      primaryDiagnosis,
      treatmentPlan,
      room,
      bed
    } = req.body;

    // Validate required fields
    if (!patientId || !admittingDoctorId || !admissionType || !department || !primaryDiagnosis) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const admission = new PatientAdmission({
      patient: patientId,
      hospital: hospitalId,
      admittingDoctor: admittingDoctorId,
      admissionType,
      department,
      primaryDiagnosis,
      treatmentPlan,
      room,
      bed,
      admissionDate: new Date(),
      admissionTime: new Date().toLocaleTimeString(),
      createdBy: hospitalId
    });

    await admission.save();

    // Send real-time notification to patient
    realtimeService.sendNotification(patientId, {
      type: 'admission_created',
      title: 'Hospital Admission',
      message: 'You have been admitted to the hospital',
      data: { admissionId: admission._id, department }
    });

    // Broadcast to hospital room
    realtimeService.broadcastToHospital(hospitalId, 'admission:new', {
      admissionId: admission._id,
      patient: admission.patient,
      department,
      admissionType,
      timestamp: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Patient admission created successfully',
      data: admission
    });
  } catch (error) {
    console.error('Error creating patient admission:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update admission status
// @route   PUT /api/hospital/admissions/:id/status
// @access  Private (Hospital)
export const updateAdmissionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const hospitalId = req.user._id;

    const admission = await PatientAdmission.findOne({
      _id: id,
      hospital: hospitalId
    }).populate('patient');

    if (!admission) {
      return res.status(404).json({ message: 'Admission not found' });
    }

    // Update admission status
    await admission.updateStatus(status, hospitalId, notes);

    // Send real-time notification to patient
    if (admission.patient) {
      realtimeService.sendNotification(admission.patient._id, {
        type: 'admission_update',
        title: 'Admission Update',
        message: `Your admission status has been updated to: ${status}`,
        data: { admissionId: id, status, notes }
      });
    }

    // Broadcast to admission room
    realtimeService.broadcastToRoom(`admission:${id}`, 'admission:status:updated', {
      admissionId: id,
      status,
      notes,
      updatedBy: hospitalId,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Admission status updated successfully',
      data: admission
    });
  } catch (error) {
    console.error('Error updating admission status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get hospital departments
// @route   GET /api/hospital/departments
// @access  Private (Hospital)
export const getHospitalDepartments = async (req, res) => {
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
    console.error('Error getting hospital departments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create hospital department
// @route   POST /api/hospital/departments
// @access  Private (Hospital)
export const createHospitalDepartment = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const {
      name,
      description,
      departmentHeadId,
      capacity,
      operatingHours,
      services
    } = req.body;

    const department = new HospitalDepartment({
      hospital: hospitalId,
      name,
      description,
      departmentHead: departmentHeadId,
      capacity,
      operatingHours,
      services
    });

    await department.save();

    // Broadcast to hospital room
    realtimeService.broadcastToHospital(hospitalId, 'department:created', {
      departmentId: department._id,
      name,
      description,
      timestamp: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department
    });
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update department capacity
// @route   PUT /api/hospital/departments/:id/capacity
// @access  Private (Hospital)
export const updateDepartmentCapacity = async (req, res) => {
  try {
    const { id } = req.params;
    const { capacity } = req.body;
    const hospitalId = req.user._id;

    const department = await HospitalDepartment.findOne({
      _id: id,
      hospital: hospitalId
    });

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Update capacity
    department.capacity = { ...department.capacity, ...capacity };
    await department.save();

    // Broadcast capacity update
    realtimeService.broadcastToHospital(hospitalId, 'department:capacity:updated', {
      departmentId: id,
      capacity: department.capacity,
      updatedBy: hospitalId,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Department capacity updated successfully',
      data: department
    });
  } catch (error) {
    console.error('Error updating department capacity:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get hospital emergency responses
// @route   GET /api/hospital/emergencies
// @access  Private (Hospital)
export const getHospitalEmergencies = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const { status, priority, page = 1, limit = 20 } = req.query;

    const query = { assignedHospital: hospitalId };

    if (status) query.status = status;
    if (priority) query.priority = priority;

    const emergencies = await EmergencyResponse.find(query)
      .populate('patient', 'firstName lastName phone')
      .sort({ callReceivedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await EmergencyResponse.countDocuments(query);

    res.json({
      success: true,
      data: {
        emergencies,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Error getting hospital emergencies:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update emergency response status
// @route   PUT /api/hospital/emergencies/:id/status
// @access  Private (Hospital)
export const updateEmergencyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, location } = req.body;
    const hospitalId = req.user._id;

    const emergency = await EmergencyResponse.findOne({
      _id: id,
      assignedHospital: hospitalId
    }).populate('patient');

    if (!emergency) {
      return res.status(404).json({ message: 'Emergency response not found' });
    }

    // Update emergency status
    await emergency.updateStatus(status, hospitalId, notes, location);

    // Send real-time notification to patient if available
    if (emergency.patient) {
      realtimeService.sendNotification(emergency.patient._id, {
        type: 'emergency_update',
        title: 'Emergency Response Update',
        message: `Emergency response status: ${status}`,
        data: { emergencyId: id, status, notes }
      });
    }

    // Broadcast to emergency room
    realtimeService.broadcastToRoom(`emergency:${id}`, 'emergency:status:updated', {
      emergencyId: id,
      status,
      notes,
      location,
      updatedBy: hospitalId,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Emergency status updated successfully',
      data: emergency
    });
  } catch (error) {
    console.error('Error updating emergency status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get real-time hospital statistics
// @route   GET /api/hospital/stats/realtime
// @access  Private (Hospital)
export const getRealTimeStats = async (req, res) => {
  try {
    const hospitalId = req.user._id;

    // Get connected users
    const connectedUsers = realtimeService.getConnectedUsersCount();
    const connectedStaff = realtimeService.getHospitalStaff(hospitalId);

    // Get active emergencies
    const activeEmergencies = await EmergencyResponse.countDocuments({
      assignedHospital: hospitalId,
      status: { $in: ['received', 'processing', 'dispatched', 'en-route', 'on-scene', 'transporting'] }
    });

    // Get today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = await Appointment.countDocuments({
      hospital: hospitalId,
      scheduledDate: { $gte: today, $lt: tomorrow }
    });

    // Get active admissions
    const activeAdmissions = await PatientAdmission.countDocuments({
      hospital: hospitalId,
      status: { $in: ['admitted', 'under-observation', 'stable', 'critical', 'improving'] }
    });

    res.json({
      success: true,
      data: {
        connectedUsers,
        connectedStaff: connectedStaff.length,
        activeEmergencies,
        todayAppointments,
        activeAdmissions,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Error getting real-time stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get hospital profile completion status
// @route   GET /api/hospital/profile-completion
// @access  Private
export const getHospitalProfileCompletion = async (req, res) => {
  try {
    const hospital = await User.findById(req.user._id);

    if (!hospital || hospital.role !== 'hospital') {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    const requiredFields = [
      'hospitalName', 'hospitalType', 'licenseNumber', 'phone', 'email',
      'address.street', 'address.city', 'address.state', 'address.zipCode',
      'description', 'facilities', 'services', 'totalBeds', 'departments',
      'insuranceAccepted', 'paymentMethods'
    ];

    const missingFields = [];
    let completedFields = 0;
    const totalFields = requiredFields.length;

    requiredFields.forEach(field => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        if (!hospital[parent] || !hospital[parent][child]) {
          missingFields.push(field);
        } else {
          completedFields++;
        }
      } else {
        if (!hospital[field] || (Array.isArray(hospital[field]) && hospital[field].length === 0)) {
          missingFields.push(field);
        } else {
          completedFields++;
        }
      }
    });

    const completionPercentage = Math.round((completedFields / totalFields) * 100);
    const isComplete = completionPercentage >= 90;

    res.json({
      isComplete,
      completionPercentage,
      missingFields,
      totalFields,
      completedFields
    });
  } catch (error) {
    console.error('Error checking hospital profile completion:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Complete hospital profile
// @route   POST /api/hospital/profile/complete
// @access  Private
export const completeHospitalProfile = async (req, res) => {
  try {
    console.log('Profile completion request body:', req.body);
    console.log('User ID:', req.user._id);

    const {
      hospitalName,
      hospitalType,
      licenseNumber,
      registrationNumber,
      establishmentDate,
      phone,
      email,
      website,
      emergencyContact,
      emergencyPhone,
      ambulancePhone,
      address,
      coordinates,
      description,
      mission,
      vision,
      facilities,
      services,
      specialties,
      totalBeds,
      icuBeds,
      emergencyBeds,
      operatingRooms,
      departments,
      staffCount,
      operatingHours,
      workingDays,
      accreditations,
      certifications,
      qualityStandards,
      insuranceAccepted,
      paymentMethods,
      emergencyServices,
      technology,
      medicalStaff,
      ambulanceServices,
      documents
    } = req.body;

    const hospital = await User.findById(req.user._id);

    if (!hospital || hospital.role !== 'hospital') {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    // Transform location data to match User model structure
    let locationData = {};
    if (address && typeof address === 'object') {
      // If address is an object, transform it to the correct structure
      locationData = {
        lat: coordinates?.lat || 0,
        lng: coordinates?.lng || 0,
        city: address.city || '',
        state: address.state || '',
        pincode: address.pincode || address.zipCode || '000000',
        address: `${address.street || ''}, ${address.city || ''}, ${address.state || ''}`.replace(/^,\s*/, '').replace(/,\s*$/, '')
      };
    } else if (coordinates) {
      // If only coordinates are provided
      locationData = {
        lat: coordinates.lat || 0,
        lng: coordinates.lng || 0,
        city: address?.city || '',
        state: address?.state || '',
        pincode: address?.pincode || address?.zipCode || '000000',
        address: address || ''
      };
    }

    // Update hospital profile with all the provided data
    const updatedHospital = await User.findByIdAndUpdate(
      req.user._id,
      {
        hospitalName,
        hospitalType,
        licenseNumber,
        registrationNumber,
        establishmentDate,
        phone,
        email,
        website,
        emergencyContact,
        emergencyPhone,
        ambulancePhone,
        address,
        ...(Object.keys(locationData).length > 0 && { location: locationData }),
        description,
        mission,
        vision,
        facilities,
        services,
        specialties,
        totalBeds,
        icuBeds,
        emergencyBeds,
        operatingRooms,
        departments,
        staffCount,
        operatingHours,
        workingDays,
        accreditations,
        certifications,
        qualityStandards,
        insuranceAccepted,
        paymentMethods,
        emergencyServices,
        technology,
        medicalStaff,
        ambulanceServices,
        documents,
        profileCompleted: true,
        profileCompletedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    console.log('Profile completion result:', updatedHospital);

    // Log the profile completion
    await logAccess(req.user._id, 'hospital', 'profile_completed', {
      hospitalId: req.user._id,
      completionDate: new Date()
    });

    res.json({
      message: 'Hospital profile completed successfully',
      hospital: updatedHospital
    });
  } catch (error) {
    console.error('Error completing hospital profile:', error);
    console.error('Error details:', error.message);
    if (error.name === 'ValidationError') {
      console.error('Validation errors:', error.errors);
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Upload hospital document
// @route   POST /api/hospital/upload-document
// @access  Private
export const uploadHospitalDocument = async (req, res) => {
  try {
    console.log('Upload request body:', req.body);
    console.log('Upload request file:', req.file);

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { type } = req.body;
    const hospital = await User.findById(req.user._id);

    if (!hospital || hospital.role !== 'hospital') {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'hospital-documents',
      resource_type: 'auto',
      public_id: `hospital-${req.user._id}-${type}-${Date.now()}`
    });

    // Update hospital documents
    const documentData = {
      type,
      title: getDocumentTitle(type),
      fileUrl: result.secure_url,
      fileName: req.file.originalname,
      uploadedAt: new Date(),
      verified: false
    };

    // Remove existing document of same type if exists
    const updatedDocuments = hospital.documents.filter(doc => doc.type !== type);
    updatedDocuments.push(documentData);

    await User.findByIdAndUpdate(req.user._id, {
      documents: updatedDocuments
    });

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      message: 'Document uploaded successfully',
      fileUrl: result.secure_url,
      fileName: req.file.originalname
    });
  } catch (error) {
    console.error('Error uploading hospital document:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to get document title
const getDocumentTitle = (type) => {
  const titles = {
    'license': 'Hospital License',
    'registration': 'Hospital Registration Certificate',
    'accreditation': 'Accreditation Certificate',
    'insurance': 'Medical Malpractice Insurance',
    'fire': 'Fire Safety Certificate',
    'hygiene': 'Hygiene & Sanitation Certificate',
    'quality': 'Quality Management Certificate',
    'safety': 'Patient Safety Certificate',
    'infection': 'Infection Control Certificate',
    'emergency': 'Emergency Preparedness Certificate',
    'pharmacy': 'Pharmacy License',
    'laboratory': 'Laboratory Accreditation',
    'radiology': 'Radiology Department License',
    'bloodbank': 'Blood Bank License',
    'ambulance': 'Ambulance Service License',
    'biohazard': 'Biohazard Waste Management',
    'radiation': 'Radiation Safety Certificate',
    'cyber': 'Cybersecurity Compliance',
    'privacy': 'HIPAA Compliance Certificate',
    'disaster': 'Disaster Management Plan',
    'staffing': 'Staff Credentialing Records'
  };
  return titles[type] || 'Document';
};

// @desc    Get hospital admission requests
// @route   GET /api/hospital/admission-requests
// @access  Private (Hospital)
export const getHospitalAdmissionRequests = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const { status, urgency, department } = req.query;

    const query = { hospital: hospitalId };
    if (status) query.status = status;
    if (urgency) query.urgency = urgency;
    if (department) query.department = department;

    const admissionRequests = await AdmissionRequest.find(query)
      .populate('patient', 'firstName lastName email phone')
      .populate('assignedDoctor', 'firstName lastName specialization')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: admissionRequests
    });
  } catch (error) {
    console.error('Error getting hospital admission requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Review admission request
// @route   PUT /api/hospital/admission-requests/:id/review
// @access  Private (Hospital)
export const reviewAdmissionRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user._id;
    const {
      status,
      reviewNotes,
      assignedDoctor,
      assignedRoom,
      assignedBed,
      estimatedAdmissionDate
    } = req.body;

    // Find admission request and ensure it belongs to this hospital
    const admissionRequest = await AdmissionRequest.findOne({
      _id: id,
      hospital: hospitalId
    });
    
    if (!admissionRequest) {
      // Check if request exists but belongs to different hospital
      const existingRequest = await AdmissionRequest.findById(id);
      if (existingRequest) {
        return res.status(403).json({ 
          success: false,
          message: 'Not authorized to review this request',
          details: 'This admission request belongs to a different hospital'
        });
      }
      return res.status(404).json({ success: false, message: 'Admission request not found' });
    }

    // Allow re-review if status is pending, or if trying to change from approved/rejected
    // Only block if status is cancelled
    if (admissionRequest.status === 'cancelled') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot review a cancelled admission request' 
      });
    }
    
    // Warn if trying to review a non-pending request, but allow it
    if (admissionRequest.status !== 'pending') {
      console.warn(`Reviewing non-pending request. Current status: ${admissionRequest.status}, New status: ${status}`);
    }

    // Map status values (in case frontend sends 'approve' instead of 'approved')
    const statusMap = {
      'approve': 'approved',
      'reject': 'rejected',
      'approved': 'approved',
      'rejected': 'rejected'
    };
    const mappedStatus = statusMap[status] || status;

    // Validate status is valid enum value
    const validStatuses = ['pending', 'approved', 'rejected', 'cancelled'];
    if (!validStatuses.includes(mappedStatus)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    // Update admission request
    admissionRequest.status = mappedStatus;
    admissionRequest.reviewNotes = reviewNotes;
    admissionRequest.reviewedBy = hospitalId;
    admissionRequest.reviewedAt = new Date();

    if (mappedStatus === 'approved') {
      if (assignedDoctor) {
        admissionRequest.assignedDoctor = assignedDoctor;
      }
      if (assignedRoom) {
        admissionRequest.assignedRoom = assignedRoom;
      }
      if (assignedBed) {
        admissionRequest.assignedBed = assignedBed;
      }
      if (estimatedAdmissionDate) {
        admissionRequest.estimatedAdmissionDate = new Date(estimatedAdmissionDate);
      }
    }
    
    // Add to status history
    if (!admissionRequest.statusHistory) {
      admissionRequest.statusHistory = [];
    }
    admissionRequest.statusHistory.push({
      status: mappedStatus,
      timestamp: new Date(),
      updatedBy: hospitalId,
      notes: reviewNotes
    });

    await admissionRequest.save();

    // Send notification to patient
    realtimeService.sendNotification(admissionRequest.patient, {
      type: 'admission_request_reviewed',
      title: 'Admission Request Update',
      message: `Your admission request has been ${mappedStatus}`,
      data: {
        requestId: admissionRequest._id,
        requestNumber: admissionRequest.requestNumber,
        status: mappedStatus,
        reviewNotes,
        assignedDoctor,
        assignedRoom,
        assignedBed,
        estimatedAdmissionDate
      }
    });

    // Broadcast to hospital room
    realtimeService.broadcastToHospital(hospitalId, 'admission_request:reviewed', {
      requestId: admissionRequest._id,
      requestNumber: admissionRequest.requestNumber,
      patient: admissionRequest.patient,
      status: mappedStatus,
      timestamp: new Date()
    });

    // Populate the response
    const populatedRequest = await AdmissionRequest.findById(admissionRequest._id)
      .populate('patient', 'firstName lastName email phone')
      .populate('hospital', 'hospitalName')
      .populate('assignedDoctor', 'firstName lastName specialization')
      .lean();

    res.json({
      success: true,
      message: `Admission request ${mappedStatus} successfully`,
      data: populatedRequest
    });
  } catch (error) {
    console.error('Error reviewing admission request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
// ==================== AMBULANCE MANAGEMENT ====================

// @desc    Get hospital ambulance bookings
// @route   GET /api/hospital/ambulance/bookings
// @access  Private (Hospital)
export const getHospitalAmbulanceBookings = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const { status, urgency, page = 1, limit = 20 } = req.query;

    // Find ambulance services belonging to this hospital
    const hospitalServices = await AmbulanceService.find({ hospital: hospitalId });
    const serviceIds = hospitalServices.map(s => s._id);

    const query = { ambulanceService: { $in: serviceIds } };

    if (status) query['status.current'] = status;
    if (urgency) query['emergencyDetails.urgency'] = urgency;

    const bookings = await AmbulanceBooking.find(query)
      .populate('patient', 'firstName lastName phone email')
      .populate('ambulanceService', 'name type vehicleNumber contact')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await AmbulanceBooking.countDocuments(query);

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Error getting hospital ambulance bookings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get ambulance booking details
// @route   GET /api/hospital/ambulance/bookings/:id
// @access  Private (Hospital)
export const getAmbulanceBookingDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user._id;

    const booking = await AmbulanceBooking.findById(id)
      .populate('patient', 'firstName lastName phone email')
      .populate('ambulanceService', 'name type vehicleNumber contact driver equipment');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify the ambulance service belongs to this hospital
    const service = await AmbulanceService.findById(booking.ambulanceService._id);
    if (!service || service.hospital.toString() !== hospitalId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Error getting ambulance booking details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update ambulance booking status
// @route   PUT /api/hospital/ambulance/bookings/:id/status
// @access  Private (Hospital)
export const updateAmbulanceBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    const hospitalId = req.user._id;

    const booking = await AmbulanceBooking.findById(id)
      .populate('ambulanceService');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify the ambulance service belongs to this hospital
    const service = await AmbulanceService.findById(booking.ambulanceService._id);
    if (!service || service.hospital.toString() !== hospitalId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update status
    await booking.updateStatus(status, note);

    // Send real-time notification to patient
    if (booking.patient) {
      realtimeService.sendNotification(booking.patient, {
        type: 'ambulance_status_update',
        title: 'Ambulance Status Update',
        message: `Your ambulance booking status has been updated to: ${status}`,
        data: { bookingId: id, status, note }
      });
    }

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: booking
    });
  } catch (error) {
    console.error('Error updating ambulance booking status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get hospital ambulance services
// @route   GET /api/hospital/ambulance/services
// @access  Private (Hospital)
export const getHospitalAmbulanceServices = async (req, res) => {
  try {
    const hospitalId = req.user._id;

    const services = await AmbulanceService.find({ hospital: hospitalId })
      .populate('assignedDriver', 'firstName lastName phone licenseNumber status')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    console.error('Error getting hospital ambulance services:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create ambulance service (Vehicle)
// @route   POST /api/hospital/ambulance/services
// @access  Private (Hospital)
export const createAmbulanceService = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const {
      name, type, available, contact, vehicleNumber,
      assignedDriver, specifications, maintenance, insurance, performance,
      equipment, baseLocation, currentLocation, responseTime,
      price, capabilities, operatingHours, serviceAreas, certifications
    } = req.body;

    const serviceData = {
      hospital: hospitalId,
      name, type, available, contact, vehicleNumber,
      assignedDriver, specifications, maintenance, insurance, performance,
      equipment, baseLocation, currentLocation, responseTime,
      price, capabilities, operatingHours, serviceAreas, certifications
    };

    const service = new AmbulanceService(serviceData);
    await service.save();

    // If driver is assigned, update driver status
    if (assignedDriver) {
      await AmbulanceDriver.findByIdAndUpdate(assignedDriver, {
        assignedVehicle: service._id,
        status: 'on-duty'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Ambulance vehicle created successfully',
      data: service
    });
  } catch (error) {
    console.error('Error creating ambulance service:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update ambulance service (Vehicle)
// @route   PUT /api/hospital/ambulance/services/:id
// @access  Private (Hospital)
export const updateAmbulanceService = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user._id;
    const { assignedDriver } = req.body;

    const service = await AmbulanceService.findOne({ _id: id, hospital: hospitalId });

    if (!service) {
      return res.status(404).json({ message: 'Ambulance service not found' });
    }

    // Handle driver reassignment
    if (assignedDriver && assignedDriver !== service.assignedDriver?.toString()) {
      // If there was a previous driver, unassign them
      if (service.assignedDriver) {
        await AmbulanceDriver.findByIdAndUpdate(service.assignedDriver, {
          assignedVehicle: null,
          status: 'available'
        });
      }
      // Assign new driver
      await AmbulanceDriver.findByIdAndUpdate(assignedDriver, {
        assignedVehicle: service._id,
        status: 'on-duty'
      });
    } else if (assignedDriver === null && service.assignedDriver) {
      // If driver is being removed
      await AmbulanceDriver.findByIdAndUpdate(service.assignedDriver, {
        assignedVehicle: null,
        status: 'available'
      });
    }

    Object.assign(service, req.body);
    service.updatedAt = new Date();
    await service.save();

    res.json({
      success: true,
      message: 'Ambulance vehicle updated successfully',
      data: service
    });
  } catch (error) {
    console.error('Error updating ambulance service:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete ambulance service
// @route   DELETE /api/hospital/ambulance/services/:id
// @access  Private (Hospital)
export const deleteAmbulanceService = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user._id;

    const service = await AmbulanceService.findOne({ _id: id, hospital: hospitalId });

    if (!service) {
      return res.status(404).json({ message: 'Ambulance service not found' });
    }

    // Check if there are active bookings
    const activeBookings = await AmbulanceBooking.countDocuments({
      ambulanceService: id,
      'status.current': { $in: ['pending', 'confirmed', 'dispatched', 'en_route', 'in_transit'] }
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        message: 'Cannot delete ambulance service with active bookings'
      });
    }

    await AmbulanceService.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Ambulance service deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting ambulance service:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get ambulance statistics
// @route   GET /api/hospital/ambulance/stats
// @access  Private (Hospital)
export const getAmbulanceStats = async (req, res) => {
  try {
    const hospitalId = req.user._id;

    // Get hospital's ambulance services
    const services = await AmbulanceService.find({ hospital: hospitalId });
    const serviceIds = services.map(s => s._id);

    // Get bookings for these services
    const bookings = await AmbulanceBooking.find({
      ambulanceService: { $in: serviceIds }
    });

    const stats = {
      totalServices: services.length,
      availableServices: services.filter(s => s.available && s.status === 'active').length,
      inactiveServices: services.filter(s => !s.available || s.status !== 'active').length,
      totalBookings: bookings.length,
      pendingBookings: bookings.filter(b => b.status.current === 'pending').length,
      confirmedBookings: bookings.filter(b => b.status.current === 'confirmed').length,
      activeBookings: bookings.filter(b => ['dispatched', 'en_route', 'in_transit'].includes(b.status.current)).length,
      completedBookings: bookings.filter(b => b.status.current === 'completed').length,
      cancelledBookings: bookings.filter(b => b.status.current === 'cancelled').length,
      criticalBookings: bookings.filter(b => b.emergencyDetails.urgency === 'critical' && !['completed', 'cancelled'].includes(b.status.current)).length,
      highUrgencyBookings: bookings.filter(b => b.emergencyDetails.urgency === 'high' && !['completed', 'cancelled'].includes(b.status.current)).length,
      revenue: {
        total: bookings.reduce((sum, b) => sum + (b.payment.finalCost || b.payment.estimatedCost || 0), 0),
        pending: bookings.filter(b => b.payment.status === 'pending').reduce((sum, b) => sum + b.payment.estimatedCost, 0),
        collected: bookings.filter(b => b.payment.status === 'paid').reduce((sum, b) => sum + (b.payment.finalCost || b.payment.estimatedCost), 0)
      },
      serviceTypes: {
        basic: services.filter(s => s.type === 'basic').length,
        advanced: services.filter(s => s.type === 'advanced').length,
        cardiac: services.filter(s => s.type === 'cardiac').length,
        neonatal: services.filter(s => s.type === 'neonatal').length,
        trauma: services.filter(s => s.type === 'trauma').length
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting ambulance stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ==================== AMBULANCE DRIVER MANAGEMENT ====================

// @desc    Get hospital ambulance drivers
// @route   GET /api/hospital/ambulance/drivers
// @access  Private (Hospital)
export const getHospitalDrivers = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const { status, search, page = 1, limit = 20 } = req.query;

    const query = { hospital: hospitalId };

    if (status && status !== 'all') query.status = status;

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { licenseNumber: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const drivers = await AmbulanceDriver.find(query)
      .populate('assignedVehicle', 'vehicleNumber type')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await AmbulanceDriver.countDocuments(query);

    res.json({
      success: true,
      data: {
        drivers,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Error getting hospital drivers:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get driver details
// @route   GET /api/hospital/ambulance/drivers/:id
// @access  Private (Hospital)
export const getDriverById = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user._id;

    const driver = await AmbulanceDriver.findOne({ _id: id, hospital: hospitalId })
      .populate('assignedVehicle');

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    res.json({
      success: true,
      data: driver
    });
  } catch (error) {
    console.error('Error getting driver details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new driver
// @route   POST /api/hospital/ambulance/drivers
// @access  Private (Hospital)
export const createDriver = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const { licenseNumber } = req.body;

    // Check if license already exists
    const existingDriver = await AmbulanceDriver.findOne({ licenseNumber });
    if (existingDriver) {
      return res.status(400).json({ message: 'Driver with this license number already exists' });
    }

    const driverData = {
      ...req.body,
      hospital: hospitalId
    };

    const driver = new AmbulanceDriver(driverData);
    await driver.save();

    res.status(201).json({
      success: true,
      message: 'Driver created successfully',
      data: driver
    });
  } catch (error) {
    console.error('Error creating driver:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update driver
// @route   PUT /api/hospital/ambulance/drivers/:id
// @access  Private (Hospital)
export const updateDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user._id;

    const driver = await AmbulanceDriver.findOne({ _id: id, hospital: hospitalId });

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    Object.assign(driver, req.body);
    driver.updatedAt = new Date();
    await driver.save();

    res.json({
      success: true,
      message: 'Driver updated successfully',
      data: driver
    });
  } catch (error) {
    console.error('Error updating driver:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete driver
// @route   DELETE /api/hospital/ambulance/drivers/:id
// @access  Private (Hospital)
export const deleteDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user._id;

    const driver = await AmbulanceDriver.findOne({ _id: id, hospital: hospitalId });

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    // Check if driver is assigned to active vehicle or booking
    if (driver.status === 'on-duty' || driver.assignedVehicle) {
      return res.status(400).json({
        message: 'Cannot delete driver who is on-duty or assigned to a vehicle'
      });
    }

    await AmbulanceDriver.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Driver deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting driver:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update driver status
// @route   PUT /api/hospital/ambulance/drivers/:id/status
// @access  Private (Hospital)
export const updateDriverStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const hospitalId = req.user._id;

    const driver = await AmbulanceDriver.findOne({ _id: id, hospital: hospitalId });

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    await driver.updateStatus(status);

    res.json({
      success: true,
      message: 'Driver status updated successfully',
      data: driver
    });
  } catch (error) {
    console.error('Error updating driver status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get hospital doctors
// @route   GET /api/hospital/doctors
// @access  Private (Hospital)
export const getHospitalDoctors = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const { status, department, search, page = 1, limit = 20 } = req.query;

    // Find doctors associated with this hospital
    const query = {};
    
    // Get hospital name to match with doctor's hospital field
    const hospital = await User.findById(hospitalId);
    if (hospital) {
      // Try to match by hospital name in User model
      const hospitalName = hospital.hospitalName || hospital.hospital?.name || hospital.firstName;
      if (hospitalName) {
        // Find users with role='doctor' that belong to this hospital
        const doctorUsers = await User.find({ 
          role: 'doctor',
          hospital: hospitalName 
        }).select('_id');
        
        if (doctorUsers.length > 0) {
          query.userId = { $in: doctorUsers.map(u => u._id) };
        } else {
          // If no matches, return empty result by using impossible query
          query.userId = { $in: [] };
        }
      } else {
        // If hospital name not found, return all doctors (fallback)
        // This allows the page to still work
      }
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (department) {
      query.specialization = new RegExp(department, 'i');
    }

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { specialization: new RegExp(search, 'i') },
        { registrationNumber: new RegExp(search, 'i') }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const doctors = await Doctor.find(query)
      .populate('userId', 'email phone firstName lastName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await Doctor.countDocuments(query);

    // Transform doctors to match frontend format
    const transformedDoctors = doctors.map(doctor => {
      // Extract firstName and lastName from name or userId
      let firstName = '';
      let lastName = '';
      if (doctor.userId?.firstName && doctor.userId?.lastName) {
        firstName = doctor.userId.firstName;
        lastName = doctor.userId.lastName;
      } else if (doctor.name) {
        const nameParts = doctor.name.split(' ');
        firstName = nameParts[0] || '';
        lastName = nameParts.slice(1).join(' ') || '';
      }

      return {
        id: doctor._id,
        _id: doctor._id,
        firstName: firstName,
        lastName: lastName,
        name: doctor.name || `${firstName} ${lastName}`,
        email: doctor.userId?.email || '',
        phone: doctor.userId?.phone || '',
        employeeId: doctor.registrationNumber,
        specialty: doctor.specialization,
        specialization: doctor.specialization,
        department: '',
        licenseNumber: doctor.registrationNumber,
        registrationNumber: doctor.registrationNumber,
        experience: doctor.experience || 0,
        education: '',
        certifications: '',
        consultationFee: doctor.consultationFees?.inPerson || 0,
        address: '',
        emergencyContact: '',
        notes: doctor.about || '',
        status: doctor.status || 'active',
        profilePicture: doctor.profilePicture || '',
        avatar: doctor.profilePicture || '',
        rating: doctor.rating || { average: 0, count: 0 },
        hireDate: doctor.createdAt
      };
    });

    res.json({
      success: true,
      doctors: transformedDoctors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create doctor
// @route   POST /api/hospital/doctors
// @access  Private (Hospital)
export const createDoctor = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const hospital = await User.findById(hospitalId);
    
    if (!hospital || hospital.role !== 'hospital') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      specialty,
      department,
      licenseNumber,
      experience,
      education,
      certifications,
      consultationFee,
      address,
      emergencyContact,
      notes
    } = req.body;

    // Validate required fields
    if (!firstName || firstName.trim() === '') {
      return res.status(400).json({ success: false, message: 'First name is required' });
    }
    if (!lastName || lastName.trim() === '') {
      return res.status(400).json({ success: false, message: 'Last name is required' });
    }
    if (!email || email.trim() === '') {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    if (!licenseNumber || licenseNumber.trim() === '') {
      return res.status(400).json({ success: false, message: 'License number is required' });
    }
    if (!specialty || specialty.trim() === '') {
      return res.status(400).json({ success: false, message: 'Specialty is required' });
    }

    // Get hospital name
    const hospitalName = hospital?.hospitalName || hospital?.hospital?.name || hospital?.firstName || 'Hospital';

    // Check if user already exists
    let user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      // Create new user for doctor
      // Generate a random password (will be hashed by User model pre-save hook)
      const tempPassword = `Doctor${Math.random().toString(36).slice(-8)}!123`;
      user = new User({
        email: email.trim().toLowerCase(),
        password: tempPassword, // Will be automatically hashed by User model pre-save hook
        role: 'doctor',
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone?.trim() || '',
        licenseNumber: licenseNumber.trim(),
        specialization: specialty.trim(),
        hospital: hospitalName,
        department: department?.trim() || '',
        consultationFees: {
          online: parseInt(consultationFee) || 500,
          inPerson: parseInt(consultationFee) || 500
        },
        isEmailVerified: true, // Hospital-created doctors are pre-verified
        isActive: true
      });
      await user.save();
    } else if (user.role !== 'doctor') {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email exists but is not a doctor' 
      });
    }

    // Check if doctor profile already exists
    const existingDoctor = await Doctor.findOne({ userId: user._id });
    if (existingDoctor) {
      return res.status(400).json({ 
        success: false, 
        message: 'Doctor profile already exists for this user' 
      });
    }

    // Create doctor profile
    const doctor = new Doctor({
      userId: user._id,
      name: `${firstName.trim()} ${lastName.trim()}`,
      specialization: specialty.trim(),
      experience: parseInt(experience) || 0,
      registrationNumber: licenseNumber.trim(),
      consultationFees: {
        online: parseInt(consultationFee) || 500,
        inPerson: parseInt(consultationFee) || 500
      },
      about: notes?.trim() || '',
      status: 'active'
    });

    await doctor.save();

    const doctorResponse = await Doctor.findById(doctor._id)
      .populate('userId', 'email phone firstName lastName')
      .lean();

    res.status(201).json({
      success: true,
      message: 'Doctor created successfully',
      doctor: {
        id: doctorResponse._id,
        _id: doctorResponse._id,
        firstName: doctorResponse.userId?.firstName || firstName,
        lastName: doctorResponse.userId?.lastName || lastName,
        name: doctorResponse.name,
        email: doctorResponse.userId?.email || email,
        phone: doctorResponse.userId?.phone || phone,
        employeeId: doctorResponse.registrationNumber,
        specialty: doctorResponse.specialization,
        specialization: doctorResponse.specialization,
        department: department || '',
        licenseNumber: doctorResponse.registrationNumber,
        registrationNumber: doctorResponse.registrationNumber,
        experience: doctorResponse.experience,
        education: education || '',
        certifications: certifications || '',
        consultationFee: doctorResponse.consultationFees?.inPerson || consultationFee || 0,
        address: address || '',
        emergencyContact: emergencyContact || '',
        notes: doctorResponse.about || notes || '',
        status: doctorResponse.status,
        profilePicture: doctorResponse.profilePicture || '',
        rating: doctorResponse.rating || { average: 0, count: 0 }
      }
    });
  } catch (error) {
    console.error('Error creating doctor:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Update doctor
// @route   PUT /api/hospital/doctors/:id
// @access  Private (Hospital)
export const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user._id;

    const doctor = await Doctor.findById(id).populate('userId');
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Update doctor profile
    if (req.body.specialty) doctor.specialization = req.body.specialty;
    if (req.body.experience) doctor.experience = parseInt(req.body.experience);
    if (req.body.notes) doctor.about = req.body.notes;
    if (req.body.status) doctor.status = req.body.status;
    if (req.body.consultationFee) {
      doctor.consultationFees = {
        online: parseInt(req.body.consultationFee),
        inPerson: parseInt(req.body.consultationFee)
      };
    }

    await doctor.save();

    // Update user if provided
    if (doctor.userId && (req.body.firstName || req.body.lastName || req.body.phone)) {
      const user = await User.findById(doctor.userId);
      if (user) {
        if (req.body.firstName) user.firstName = req.body.firstName;
        if (req.body.lastName) user.lastName = req.body.lastName;
        if (req.body.phone) user.phone = req.body.phone;
        if (req.body.specialty) user.specialization = req.body.specialty;
        await user.save();
      }
    }

    const updatedDoctor = await Doctor.findById(doctor._id)
      .populate('userId', 'email phone firstName lastName')
      .lean();

    res.json({
      success: true,
      message: 'Doctor updated successfully',
      doctor: {
        id: updatedDoctor._id,
        _id: updatedDoctor._id,
        firstName: updatedDoctor.userId?.firstName || '',
        lastName: updatedDoctor.userId?.lastName || '',
        name: updatedDoctor.name,
        email: updatedDoctor.userId?.email || '',
        phone: updatedDoctor.userId?.phone || '',
        employeeId: updatedDoctor.registrationNumber,
        specialty: updatedDoctor.specialization,
        specialization: updatedDoctor.specialization,
        department: req.body.department || '',
        licenseNumber: updatedDoctor.registrationNumber,
        registrationNumber: updatedDoctor.registrationNumber,
        experience: updatedDoctor.experience,
        education: req.body.education || '',
        certifications: req.body.certifications || '',
        consultationFee: updatedDoctor.consultationFees?.inPerson || 0,
        address: req.body.address || '',
        emergencyContact: req.body.emergencyContact || '',
        notes: updatedDoctor.about || req.body.notes || '',
        status: updatedDoctor.status,
        profilePicture: updatedDoctor.profilePicture || '',
        rating: updatedDoctor.rating || { average: 0, count: 0 }
      }
    });
  } catch (error) {
    console.error('Error updating doctor:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete doctor
// @route   DELETE /api/hospital/doctors/:id
// @access  Private (Hospital)
export const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user._id;

    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Soft delete - update status instead of deleting
    doctor.status = 'inactive';
    await doctor.save();

    res.json({
      success: true,
      message: 'Doctor deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get hospital nurses
// @route   GET /api/hospital/nurses
// @access  Private (Hospital)
export const getHospitalNurses = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const { status, department, search, page = 1, limit = 20 } = req.query;

    console.log('Fetching nurses for hospital:', hospitalId);
    const query = { hospital: hospitalId };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (department) {
      query.department = new RegExp(department, 'i');
    }

    if (search) {
      query.$or = [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { employeeId: new RegExp(search, 'i') },
        { licenseNumber: new RegExp(search, 'i') }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    console.log('Nurse query:', JSON.stringify(query, null, 2));
    const nurses = await Nurse.find(query)
      .populate('userId', 'email phone firstName lastName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await Nurse.countDocuments(query);
    console.log(`Found ${nurses.length} nurses out of ${total} total`);

    // Transform nurses to match frontend format
    const transformedNurses = nurses.map(nurse => ({
      id: nurse._id,
      _id: nurse._id,
      firstName: nurse.firstName,
      lastName: nurse.lastName,
      email: nurse.email,
      phone: nurse.phone,
      employeeId: nurse.employeeId,
      unit: nurse.department,
      department: nurse.department,
      licenseNumber: nurse.licenseNumber,
      experience: nurse.experience,
      education: '',
      certifications: '',
      shift: nurse.shift,
      status: nurse.status,
      address: nurse.address?.street || '',
      emergencyContact: nurse.emergencyContact?.name || '',
      specializations: nurse.specialization || '',
      notes: nurse.notes || '',
      profilePicture: nurse.profilePicture || ''
    }));

    res.json({
      success: true,
      nurses: transformedNurses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching nurses:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get hospital staff schedules
// @route   GET /api/hospital/schedules
// @access  Private (Hospital)
export const getHospitalSchedules = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const { startDate, endDate, department, staffType, page = 1, limit = 50 } = req.query;

    const query = { hospital: hospitalId };

    if (startDate || endDate) {
      query.scheduleDate = {};
      if (startDate) query.scheduleDate.$gte = new Date(startDate);
      if (endDate) query.scheduleDate.$lte = new Date(endDate);
    }

    if (department) {
      query.department = new RegExp(department, 'i');
    }

    if (staffType && staffType !== 'all') {
      query.staffType = staffType;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch schedules with proper population based on staffType
    const schedules = await StaffSchedule.find(query)
      .sort({ scheduleDate: 1, startTime: 1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    // Populate staff data based on staffType
    const populatedSchedules = await Promise.all(schedules.map(async (schedule) => {
      let staffData = null;
      if (schedule.staffType === 'doctor') {
        const doctor = await Doctor.findById(schedule.staffId)
          .populate('userId', 'firstName lastName email phone')
          .lean();
        if (doctor) {
          staffData = {
            _id: doctor._id,
            name: doctor.name || `${doctor.userId?.firstName || ''} ${doctor.userId?.lastName || ''}`.trim(),
            firstName: doctor.userId?.firstName,
            lastName: doctor.userId?.lastName,
            email: doctor.userId?.email,
            phone: doctor.userId?.phone
          };
        }
      } else if (schedule.staffType === 'nurse') {
        const nurse = await Nurse.findById(schedule.staffId)
          .populate('userId', 'firstName lastName email phone')
          .lean();
        if (nurse) {
          staffData = {
            _id: nurse._id,
            name: `${nurse.firstName} ${nurse.lastName}`,
            firstName: nurse.firstName,
            lastName: nurse.lastName,
            email: nurse.email,
            phone: nurse.phone
          };
        }
      }
      return { ...schedule, staffId: staffData || schedule.staffId };
    }));

    const total = await StaffSchedule.countDocuments(query);

    // Transform schedules to match frontend format
    const transformedSchedules = populatedSchedules.map(schedule => ({
      id: schedule._id,
      _id: schedule._id,
      staffId: schedule.staffId?._id || schedule.staffId,
      staffName: schedule.staffId?.name || schedule.staffId?.firstName || 'Unknown',
      staffType: schedule.staffType,
      date: schedule.scheduleDate ? new Date(schedule.scheduleDate).toISOString().split('T')[0] : '',
      scheduleDate: schedule.scheduleDate,
      shift: schedule.shift,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      department: schedule.department,
      unit: schedule.department,
      status: schedule.status,
      notes: schedule.notes || ''
    }));

    res.json({
      success: true,
      schedules: transformedSchedules,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get hospital trainings
// @route   GET /api/hospital/trainings
// @access  Private (Hospital)
export const getHospitalTrainings = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const { status, category, trainingType, search, page = 1, limit = 20 } = req.query;

    const query = { hospital: hospitalId };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (trainingType && trainingType !== 'all') {
      query.trainingType = trainingType;
    }

    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const trainings = await StaffTraining.find(query)
      .populate('participants.staffId')
      .sort({ scheduledDate: 1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await StaffTraining.countDocuments(query);

    // Transform trainings to match frontend format
    const transformedTrainings = trainings.map(training => ({
      id: training._id,
      _id: training._id,
      title: training.title,
      description: training.description,
      category: training.category,
      trainingType: training.trainingType,
      instructor: training.instructor?.name || '',
      scheduledDate: training.scheduledDate ? new Date(training.scheduledDate).toISOString().split('T')[0] : '',
      startDate: training.scheduledDate ? new Date(training.scheduledDate).toISOString().split('T')[0] : '',
      endDate: training.scheduledDate ? new Date(training.scheduledDate).toISOString().split('T')[0] : '',
      duration: training.duration?.value || 0,
      durationUnit: training.duration?.unit || 'hours',
      location: training.location,
      venue: training.venue || '',
      maxParticipants: training.maxParticipants || 0,
      participants: training.participants || [],
      status: training.status,
      materials: training.materials?.map(m => m.name).join(', ') || '',
      cost: training.cost || 0,
      createdAt: training.createdAt,
      updatedAt: training.updatedAt
    }));

    res.json({
      success: true,
      trainings: transformedTrainings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching trainings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create nurse
// @route   POST /api/hospital/nurses
// @access  Private (Hospital)
export const createNurse = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const hospital = await User.findById(hospitalId);
    if (!hospital || hospital.role !== 'hospital') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { firstName, lastName, email, phone, licenseNumber, department, unit, shift, specialization, experience, status, address, emergencyContact, notes } = req.body;

    // Validate required fields
    if (!firstName || firstName.trim() === '') {
      return res.status(400).json({ success: false, message: 'First name is required' });
    }
    if (!lastName || lastName.trim() === '') {
      return res.status(400).json({ success: false, message: 'Last name is required' });
    }
    if (!email || email.trim() === '') {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    if (!licenseNumber || licenseNumber.trim() === '') {
      return res.status(400).json({ success: false, message: 'License number is required' });
    }
    // Use unit if provided, otherwise department
    const finalDepartment = (unit && unit.trim()) || (department && department.trim()) || '';
    if (!finalDepartment) {
      return res.status(400).json({ success: false, message: 'Department/Unit is required' });
    }

    // Map shift values (frontend sends 'evening' but schema expects 'day', 'night', 'rotating')
    const shiftMap = {
      'evening': 'night', // Map evening to night shift
      'day': 'day',
      'night': 'night',
      'rotating': 'rotating'
    };
    const mappedShift = shiftMap[shift] || 'day';

    const hospitalName = hospital?.hospitalName || hospital?.hospital?.name || hospital?.firstName || 'Hospital';

    // Create or find User for nurse
    let user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      const tempPassword = `Nurse${Math.random().toString(36).slice(-8)}!123`;
      user = new User({
        email: email.trim().toLowerCase(),
        password: tempPassword,
        role: 'nurse',
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone?.trim() || '',
        licenseNumber: licenseNumber.trim(),
        specialization: specialization?.trim() || '',
        hospital: hospitalName,
        department: finalDepartment,
        isEmailVerified: true,
        isActive: true
      });
      await user.save();
    } else if (user.role !== 'nurse') {
      return res.status(400).json({ success: false, message: 'User with this email exists but is not a nurse' });
    }

    // Check if nurse profile already exists
    const existingNurse = await Nurse.findOne({ userId: user._id });
    if (existingNurse) {
      return res.status(400).json({ success: false, message: 'Nurse profile already exists for this user' });
    }

    const nurseData = {
      userId: user._id,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || '',
      licenseNumber: licenseNumber.trim(),
      department: finalDepartment,
      specialization: specialization?.trim() || '',
      experience: experience ? parseInt(experience) : 0,
      shift: mappedShift,
      status: status || 'active',
      hospital: hospitalId,
      createdBy: hospitalId,
      notes: notes?.trim() || ''
      // employeeId will be auto-generated by pre-save hook
    };

    // Handle address if provided
    if (address) {
      if (typeof address === 'string') {
        // If address is a string, try to parse it or set as city
        nurseData.address = { city: address.trim() };
      } else if (typeof address === 'object') {
        nurseData.address = address;
      }
    }

    // Handle emergency contact if provided
    if (emergencyContact) {
      if (typeof emergencyContact === 'string') {
        nurseData.emergencyContact = { name: emergencyContact.trim() };
      } else if (typeof emergencyContact === 'object') {
        nurseData.emergencyContact = emergencyContact;
      }
    }

    const nurse = new Nurse(nurseData);
    await nurse.save();

    const nurseResponse = await Nurse.findById(nurse._id)
      .populate('userId', 'email phone firstName lastName')
      .lean();

    res.status(201).json({
      success: true,
      message: 'Nurse created successfully',
      nurse: {
        id: nurseResponse._id,
        _id: nurseResponse._id,
        firstName: nurseResponse.firstName,
        lastName: nurseResponse.lastName,
        name: `${nurseResponse.firstName} ${nurseResponse.lastName}`,
        email: nurseResponse.email,
        phone: nurseResponse.phone,
        employeeId: nurseResponse.employeeId,
        department: nurseResponse.department,
        unit: nurseResponse.department, // Map department to unit for frontend
        specialization: nurseResponse.specialization || '',
        licenseNumber: nurseResponse.licenseNumber,
        experience: nurseResponse.experience || 0,
        shift: nurseResponse.shift,
        status: nurseResponse.status || 'active',
        address: nurseResponse.address || {},
        emergencyContact: nurseResponse.emergencyContact || {},
        notes: nurseResponse.notes || '',
        hireDate: nurseResponse.hireDate || nurseResponse.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating nurse:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Update nurse
// @route   PUT /api/hospital/nurses/:id
// @access  Private (Hospital)
export const updateNurse = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user._id;

    const nurse = await Nurse.findOneAndUpdate(
      { _id: id, hospital: hospitalId },
      { ...req.body, updatedBy: hospitalId },
      { new: true, runValidators: true }
    ).populate('userId', 'email').lean();

    if (!nurse) {
      return res.status(404).json({ success: false, message: 'Nurse not found' });
    }

    res.json({
      success: true,
      message: 'Nurse updated successfully',
      nurse: {
        id: nurse._id,
        ...nurse,
        unit: nurse.department
      }
    });
  } catch (error) {
    console.error('Error updating nurse:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete nurse
// @route   DELETE /api/hospital/nurses/:id
// @access  Private (Hospital)
export const deleteNurse = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user._id;

    const nurse = await Nurse.findOneAndDelete({ _id: id, hospital: hospitalId });

    if (!nurse) {
      return res.status(404).json({ success: false, message: 'Nurse not found' });
    }

    res.json({
      success: true,
      message: 'Nurse deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting nurse:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create schedule
// @route   POST /api/hospital/schedules
// @access  Private (Hospital)
export const createSchedule = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const { staffId, date, scheduleDate, shift, startTime, endTime, department, unit, staffType, notes, status } = req.body;

    // Validate required fields
    if (!staffId) {
      return res.status(400).json({ success: false, message: 'Staff ID is required' });
    }
    if (!date && !scheduleDate) {
      return res.status(400).json({ success: false, message: 'Schedule date is required' });
    }
    if (!shift || shift.trim() === '') {
      return res.status(400).json({ success: false, message: 'Shift is required' });
    }
    if (!startTime || startTime.trim() === '') {
      return res.status(400).json({ success: false, message: 'Start time is required' });
    }
    if (!endTime || endTime.trim() === '') {
      return res.status(400).json({ success: false, message: 'End time is required' });
    }
    const finalDepartment = (unit && unit.trim()) || (department && department.trim()) || '';
    if (!finalDepartment) {
      return res.status(400).json({ success: false, message: 'Department/Unit is required' });
    }

    // Determine staffType if not provided
    let determinedStaffType = staffType;
    if (!determinedStaffType) {
      // Check if staffId is a doctor or nurse
      const doctor = await Doctor.findById(staffId);
      const nurse = await Nurse.findById(staffId);
      if (doctor) {
        determinedStaffType = 'doctor';
      } else if (nurse) {
        determinedStaffType = 'nurse';
      } else {
        // Check User model
        const user = await User.findById(staffId);
        if (user) {
          if (user.role === 'doctor') {
            determinedStaffType = 'doctor';
          } else if (user.role === 'nurse') {
            determinedStaffType = 'nurse';
          } else {
            determinedStaffType = 'other';
          }
        } else {
          return res.status(400).json({ success: false, message: 'Invalid staff ID' });
        }
      }
    }

    // Check for scheduling conflicts
    const scheduleDateObj = new Date(scheduleDate || date);
    const conflictQuery = {
      hospital: hospitalId,
      staffId: staffId,
      scheduleDate: {
        $gte: new Date(scheduleDateObj.setHours(0, 0, 0, 0)),
        $lt: new Date(scheduleDateObj.setHours(23, 59, 59, 999))
      },
      status: { $ne: 'cancelled' }
    };
    const existingSchedule = await StaffSchedule.findOne(conflictQuery);
    if (existingSchedule) {
      return res.status(400).json({ 
        success: false, 
        message: 'Staff member already has a schedule for this date' 
      });
    }

    const scheduleData = {
      staffId: staffId,
      hospital: hospitalId,
      scheduleDate: new Date(scheduleDate || date),
      shift: shift.trim(),
      startTime: startTime.trim(),
      endTime: endTime.trim(),
      department: finalDepartment,
      staffType: determinedStaffType,
      status: status || 'scheduled',
      notes: notes?.trim() || '',
      createdBy: hospitalId
    };

    const schedule = new StaffSchedule(scheduleData);
    await schedule.save();

    // Populate staff data based on staffType
    let populatedSchedule;
    if (determinedStaffType === 'doctor') {
      const doctor = await Doctor.findById(staffId).populate('userId', 'firstName lastName email phone').lean();
      populatedSchedule = {
        ...schedule.toObject(),
        staffId: {
          _id: doctor?._id || staffId,
          name: doctor?.name || `${doctor?.userId?.firstName || ''} ${doctor?.userId?.lastName || ''}`.trim(),
          firstName: doctor?.userId?.firstName,
          lastName: doctor?.userId?.lastName
        }
      };
    } else if (determinedStaffType === 'nurse') {
      const nurse = await Nurse.findById(staffId).populate('userId', 'firstName lastName email phone').lean();
      populatedSchedule = {
        ...schedule.toObject(),
        staffId: {
          _id: nurse?._id || staffId,
          name: `${nurse?.firstName || ''} ${nurse?.lastName || ''}`.trim(),
          firstName: nurse?.firstName,
          lastName: nurse?.lastName
        }
      };
    } else {
      populatedSchedule = schedule.toObject();
    }

    res.status(201).json({
      success: true,
      message: 'Schedule created successfully',
      schedule: {
        id: populatedSchedule._id,
        _id: populatedSchedule._id,
        staffId: populatedSchedule.staffId?._id || populatedSchedule.staffId,
        staffName: populatedSchedule.staffId?.name || populatedSchedule.staffId?.firstName || 'Unknown',
        staffType: populatedSchedule.staffType,
        date: populatedSchedule.scheduleDate ? new Date(populatedSchedule.scheduleDate).toISOString().split('T')[0] : '',
        scheduleDate: populatedSchedule.scheduleDate,
        shift: populatedSchedule.shift,
        startTime: populatedSchedule.startTime,
        endTime: populatedSchedule.endTime,
        department: populatedSchedule.department,
        unit: populatedSchedule.department,
        status: populatedSchedule.status,
        notes: populatedSchedule.notes || ''
      }
    });
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Update schedule
// @route   PUT /api/hospital/schedules/:id
// @access  Private (Hospital)
export const updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user._id;

    const updateData = { ...req.body, updatedBy: hospitalId };
    if (req.body.date || req.body.scheduleDate) {
      updateData.scheduleDate = new Date(req.body.scheduleDate || req.body.date);
    }

    const schedule = await StaffSchedule.findOneAndUpdate(
      { _id: id, hospital: hospitalId },
      updateData,
      { new: true, runValidators: true }
    ).populate('staffId').lean();

    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }

    res.json({
      success: true,
      message: 'Schedule updated successfully',
      schedule: {
        id: schedule._id,
        ...schedule,
        staffId: schedule.staffId?._id || schedule.staffId,
        staffName: schedule.staffId?.name || schedule.staffId?.firstName || 'Unknown',
        date: schedule.scheduleDate ? new Date(schedule.scheduleDate).toISOString().split('T')[0] : '',
        unit: schedule.department
      }
    });
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete schedule
// @route   DELETE /api/hospital/schedules/:id
// @access  Private (Hospital)
export const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user._id;

    const schedule = await StaffSchedule.findOneAndDelete({ _id: id, hospital: hospitalId });

    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }

    res.json({
      success: true,
      message: 'Schedule deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create training
// @route   POST /api/hospital/trainings
// @access  Private (Hospital)
export const createTraining = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const { title, scheduledDate, startDate, category, trainingType } = req.body;

    // Validate required fields
    if (!title || title.trim() === '') {
      return res.status(400).json({ success: false, message: 'Training title is required' });
    }
    if (!scheduledDate && !startDate) {
      return res.status(400).json({ success: false, message: 'Training date is required' });
    }
    if (!category || category.trim() === '') {
      return res.status(400).json({ success: false, message: 'Category is required' });
    }

    const trainingData = {
      ...req.body,
      title: title.trim(),
      category: category.trim(),
      trainingType: trainingType?.trim() || 'workshop',
      hospital: hospitalId,
      scheduledDate: new Date(scheduledDate || startDate),
      createdBy: hospitalId
    };

    const training = new StaffTraining(trainingData);
    await training.save();

    const trainingResponse = await StaffTraining.findById(training._id)
      .populate('participants.staffId')
      .lean();

    res.status(201).json({
      success: true,
      message: 'Training created successfully',
      training: {
        id: trainingResponse._id,
        ...trainingResponse,
        title: trainingResponse.title,
        description: trainingResponse.description,
        category: trainingResponse.category,
        trainingType: trainingResponse.trainingType,
        instructor: trainingResponse.instructor?.name || '',
        scheduledDate: trainingResponse.scheduledDate ? new Date(trainingResponse.scheduledDate).toISOString().split('T')[0] : '',
        startDate: trainingResponse.scheduledDate ? new Date(trainingResponse.scheduledDate).toISOString().split('T')[0] : '',
        endDate: trainingResponse.scheduledDate ? new Date(trainingResponse.scheduledDate).toISOString().split('T')[0] : '',
        duration: trainingResponse.duration?.value || 0,
        location: trainingResponse.location,
        venue: trainingResponse.venue || '',
        maxParticipants: trainingResponse.maxParticipants || 0,
        status: trainingResponse.status,
        materials: trainingResponse.materials?.map(m => m.name).join(', ') || '',
        cost: trainingResponse.cost || 0
      }
    });
  } catch (error) {
    console.error('Error creating training:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update training
// @route   PUT /api/hospital/trainings/:id
// @access  Private (Hospital)
export const updateTraining = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user._id;

    const updateData = { ...req.body, updatedBy: hospitalId };
    if (req.body.scheduledDate || req.body.startDate) {
      updateData.scheduledDate = new Date(req.body.scheduledDate || req.body.startDate);
    }

    const training = await StaffTraining.findOneAndUpdate(
      { _id: id, hospital: hospitalId },
      updateData,
      { new: true, runValidators: true }
    ).populate('participants.staffId').lean();

    if (!training) {
      return res.status(404).json({ success: false, message: 'Training not found' });
    }

    res.json({
      success: true,
      message: 'Training updated successfully',
      training: {
        id: training._id,
        ...training,
        instructor: training.instructor?.name || '',
        scheduledDate: training.scheduledDate ? new Date(training.scheduledDate).toISOString().split('T')[0] : '',
        startDate: training.scheduledDate ? new Date(training.scheduledDate).toISOString().split('T')[0] : '',
        endDate: training.scheduledDate ? new Date(training.scheduledDate).toISOString().split('T')[0] : '',
        duration: training.duration?.value || 0,
        materials: training.materials?.map(m => m.name).join(', ') || ''
      }
    });
  } catch (error) {
    console.error('Error updating training:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete training
// @route   DELETE /api/hospital/trainings/:id
// @access  Private (Hospital)
export const deleteTraining = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user._id;

    const training = await StaffTraining.findOneAndDelete({ _id: id, hospital: hospitalId });

    if (!training) {
      return res.status(404).json({ success: false, message: 'Training not found' });
    }

    res.json({
      success: true,
      message: 'Training deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting training:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
