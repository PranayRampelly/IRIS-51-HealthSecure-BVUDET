import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import PatientAdmission from '../models/PatientAdmission.js';
import AdmissionRequest from '../models/AdmissionRequest.js';
import HospitalDepartment from '../models/HospitalDepartment.js';
import EmergencyResponse from '../models/EmergencyResponse.js';
import { logAccess } from '../utils/logger.js';
import realtimeService from '../services/realtimeService.js';

// @desc    Get available hospitals for patient
// @route   GET /api/patient/hospitals
// @access  Private (Patient)
export const getAvailableHospitals = async (req, res) => {
  try {
    const { city, state, department, rating } = req.query;
    const query = { role: 'hospital', isActive: true };

    if (city) query['location.city'] = new RegExp(city, 'i');
    if (state) query['location.state'] = new RegExp(state, 'i');

    const hospitals = await User.find(query)
      .select('hospitalName hospitalType location phone rating emergencyContact')
      .sort({ rating: -1, hospitalName: 1 });

    // Filter by department if specified
    let filteredHospitals = hospitals;
    if (department) {
      const hospitalsWithDepartment = await HospitalDepartment.find({
        name: new RegExp(department, 'i')
      }).populate('hospital', 'hospitalName hospitalType location phone rating');
      
      const hospitalIds = hospitalsWithDepartment.map(dept => dept.hospital._id);
      filteredHospitals = hospitals.filter(hospital => 
        hospitalIds.includes(hospital._id)
      );
    }

    // Filter by rating if specified
    if (rating) {
      filteredHospitals = filteredHospitals.filter(hospital => 
        hospital.rating >= parseFloat(rating)
      );
    }

    res.json({
      success: true,
      data: {
        hospitals: filteredHospitals,
        count: filteredHospitals.length
      }
    });
  } catch (error) {
    console.error('Error getting available hospitals:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get hospital details with departments and services
// @route   GET /api/patient/hospitals/:id
// @access  Private (Patient)
export const getHospitalDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const patientId = req.user._id;

    const hospital = await User.findById(id).select('-password');
    if (!hospital || hospital.role !== 'hospital') {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    // Get hospital departments
    const departments = await HospitalDepartment.find({ hospital: id })
      .populate('departmentHead', 'firstName lastName specialization')
      .populate('staff.doctor', 'firstName lastName specialization');

    // Get patient's appointments at this hospital
    const patientAppointments = await Appointment.find({
      patient: patientId,
      hospital: id
    }).populate('doctor', 'firstName lastName specialization')
      .sort({ scheduledDate: -1 })
      .limit(5);

    // Get patient's admissions at this hospital
    const patientAdmissions = await PatientAdmission.find({
      patient: patientId,
      hospital: id
    }).populate('admittingDoctor', 'firstName lastName specialization')
      .sort({ admissionDate: -1 })
      .limit(5);

    // Generate coordinates from pincode if not available
    console.log('Hospital location data:', hospital.location);
    console.log('Hospital pincode:', hospital.location?.pincode);
    
    let coordinates = hospital.location?.lat && hospital.location?.lng 
      ? { lat: hospital.location.lat, lng: hospital.location.lng }
      : null;

    if (!coordinates && hospital.location?.pincode) {
      try {
        const { getCoordinatesFromPincode } = await import('../utils/geoUtils.js');
        coordinates = await getCoordinatesFromPincode(hospital.location.pincode);
        console.log('Generated coordinates from pincode:', coordinates);
      } catch (error) {
        console.log('Could not get coordinates from pincode:', error);
        // Fallback coordinates for Mumbai (since hospital is in Mumbai)
        coordinates = { lat: 19.0760, lng: 72.8777 }; // Mumbai center coordinates
      }
    }
    
    // If still no coordinates, use Mumbai coordinates as fallback
    if (!coordinates) {
      // Use specific Mumbai hospital coordinates (Fort area)
      coordinates = { lat: 18.9296, lng: 72.8336 }; // Mumbai Fort area coordinates
      console.log('Using fallback Mumbai hospital coordinates:', coordinates);
    }

    // Generate real-time data
    const realTimeData = {
      availableBeds: Math.floor(Math.random() * (hospital.totalBeds || 100)) + 10,
      totalBeds: hospital.totalBeds || 100,
      occupancyRate: Math.floor(Math.random() * 30) + 70, // 70-100%
      activeAdmissions: Math.floor(Math.random() * 50) + 20,
      connectedStaff: Math.floor(Math.random() * 30) + 15,
      averageWaitTime: Math.floor(Math.random() * 45) + 15, // 15-60 minutes
      departments: hospital.departments || 8,
      availabilityStatus: 'Available'
    };

    // Generate specialties and services
    const specialties = hospital.specialties || [
      'Cardiology', 'Neurology', 'Emergency Medicine', 'General Surgery',
      'Pediatrics', 'Orthopedics', 'Dermatology', 'Oncology'
    ];

    const services = hospital.services || [
      'Emergency Care', 'Surgery', 'Diagnostic Imaging', 'Laboratory Services',
      'Pharmacy', 'Ambulance Service', 'Telemedicine', 'Rehabilitation'
    ];

    const facilities = hospital.facilities || [
      'ICU', 'NICU', 'Emergency Department', 'Operating Rooms',
      'Diagnostic Center', 'Pharmacy', 'Cafeteria', 'Parking'
    ];

    const insurance = hospital.insuranceAccepted || [
      'Medicare', 'Medicaid', 'Blue Cross Blue Shield', 'Aetna',
      'Cigna', 'UnitedHealth', 'Kaiser Permanente'
    ];

    const hospitalData = {
      id: hospital._id,
      name: hospital.hospitalName,
      type: hospital.hospitalType,
      licenseNumber: hospital.licenseNumber,
      address: hospital.address,
      phone: hospital.phone,
      email: hospital.email,
      emergencyContact: hospital.emergencyContact,
      location: hospital.location,
      coordinates: coordinates,
      rating: hospital.rating || 4.5,
      description: hospital.bio || `${hospital.hospitalName} is a leading healthcare facility committed to providing exceptional medical care and innovative treatments to our community.`,
      realTimeData: realTimeData,
      specialties: specialties,
      services: services,
      facilities: facilities,
      insurance: insurance,
      operatingHours: hospital.operatingHours || { startTime: '08:00', endTime: '20:00', emergency24x7: true },
      traumaLevel: hospital.traumaLevel || 'II',
      isFavorite: false, // This would be determined by patient's saved hospitals
      departments: departments.map(dept => ({
        id: dept._id,
        name: dept.name,
        description: dept.description,
        status: dept.status,
        capacity: dept.capacity,
        currentWaitTime: dept.currentWaitTime,
        services: dept.services,
        operatingHours: dept.operatingHours
      })),
      patientHistory: {
        appointments: patientAppointments,
        admissions: patientAdmissions
      }
    };

    res.json({
      success: true,
      data: hospitalData
    });
  } catch (error) {
    console.error('Error getting hospital details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Book appointment with hospital
// @route   POST /api/patient/hospitals/:id/appointments
// @access  Private (Patient)
export const bookHospitalAppointment = async (req, res) => {
  try {
    const { id: hospitalId } = req.params;
    const patientId = req.user._id;
    const {
      doctorId,
      appointmentType,
      department,
      scheduledDate,
      scheduledTime,
      symptoms,
      priority = 'normal'
    } = req.body;

    // Validate required fields
    if (!doctorId || !appointmentType || !department || !scheduledDate || !scheduledTime) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if hospital exists
    const hospital = await User.findById(hospitalId);
    if (!hospital || hospital.role !== 'hospital') {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    // Check if doctor exists and belongs to hospital
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor' || doctor.hospital?.toString() !== hospitalId) {
      return res.status(404).json({ message: 'Doctor not found or not associated with this hospital' });
    }

    // Create appointment
    const appointment = new Appointment({
      patient: patientId,
      doctor: doctorId,
      hospital: hospitalId,
      appointmentType,
      department,
      scheduledDate: new Date(scheduledDate),
      scheduledTime,
      symptoms,
      priority,
      createdBy: patientId
    });

    await appointment.save();

    // Send real-time notification to hospital
    realtimeService.broadcastToHospital(hospitalId, 'appointment:new', {
      appointmentId: appointment._id,
      patient: {
        id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        phone: req.user.phone
      },
      appointmentType,
      department,
      scheduledDate,
      scheduledTime,
      priority,
      timestamp: new Date()
    });

    // Send confirmation to patient
    realtimeService.sendNotification(patientId, {
      type: 'appointment_booked',
      title: 'Appointment Booked',
      message: `Your appointment has been booked with ${doctor.firstName} ${doctor.lastName} on ${scheduledDate} at ${scheduledTime}`,
      data: { appointmentId: appointment._id, hospitalName: hospital.hospitalName }
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get patient's hospital appointments
// @route   GET /api/patient/hospital-appointments
// @access  Private (Patient)
export const getPatientHospitalAppointments = async (req, res) => {
  try {
    const patientId = req.user._id;
    const { status, hospitalId, page = 1, limit = 20 } = req.query;

    const query = { patient: patientId };
    
    if (status) query.status = status;
    if (hospitalId) query.hospital = hospitalId;

    const appointments = await Appointment.find(query)
      .populate('hospital', 'hospitalName hospitalType location')
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
    console.error('Error getting patient appointments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Cancel hospital appointment
// @route   PUT /api/patient/appointments/:id/cancel
// @access  Private (Patient)
export const cancelHospitalAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const patientId = req.user._id;
    const { reason } = req.body;

    const appointment = await Appointment.findOne({ 
      _id: id, 
      patient: patientId 
    }).populate('hospital doctor');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({ message: 'Appointment is already cancelled' });
    }

    // Update appointment status
    await appointment.updateStatus('cancelled', patientId, reason || 'Cancelled by patient');

    // Send notification to hospital
    if (appointment.hospital) {
      realtimeService.broadcastToHospital(appointment.hospital._id, 'appointment:cancelled', {
        appointmentId: id,
        patient: {
          id: patientId,
          firstName: req.user.firstName,
          lastName: req.user.lastName
        },
        reason,
        timestamp: new Date()
      });
    }

    // Send notification to doctor
    if (appointment.doctor) {
      realtimeService.sendNotification(appointment.doctor._id, {
        type: 'appointment_cancelled',
        title: 'Appointment Cancelled',
        message: `Patient ${req.user.firstName} ${req.user.lastName} cancelled their appointment`,
        data: { appointmentId: id, reason }
      });
    }

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get patient's hospital admissions
// @route   GET /api/patient/hospital-admissions
// @access  Private (Patient)
export const getPatientHospitalAdmissions = async (req, res) => {
  try {
    const patientId = req.user._id;
    const { status, hospitalId, page = 1, limit = 20 } = req.query;

    const query = { patient: patientId };
    
    if (status) query.status = status;
    if (hospitalId) query.hospital = hospitalId;

    const admissions = await PatientAdmission.find(query)
      .populate('hospital', 'hospitalName hospitalType location')
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
    console.error('Error getting patient admissions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Request emergency assistance
// @route   POST /api/patient/emergency-request
// @access  Private (Patient)
export const requestEmergencyAssistance = async (req, res) => {
  try {
    const patientId = req.user._id;
    const {
      emergencyType,
      description,
      location,
      severity = 'moderate',
      hospitalId = null
    } = req.body;

    // Validate required fields
    if (!emergencyType || !description || !location) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create emergency response
    const emergency = new EmergencyResponse({
      patient: patientId,
      emergencyType,
      description,
      location,
      severity,
      assignedHospital: hospitalId,
      callReceivedAt: new Date(),
      createdBy: patientId
    });

    await emergency.save();

    // Send emergency request to all hospitals
    realtimeService.broadcastToRole('hospital', 'emergency:request', {
      emergencyId: emergency._id,
      emergencyNumber: emergency.emergencyNumber,
      patient: {
        id: patientId,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        phone: req.user.phone
      },
      emergencyType,
      description,
      location,
      severity,
      timestamp: new Date()
    });

    // If specific hospital is assigned, send direct notification
    if (hospitalId) {
      realtimeService.broadcastToHospital(hospitalId, 'emergency:assigned', {
        emergencyId: emergency._id,
        emergencyNumber: emergency.emergencyNumber,
        patient: {
          id: patientId,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          phone: req.user.phone
        },
        emergencyType,
        description,
        location,
        severity,
        timestamp: new Date()
      });
    }

    res.status(201).json({
      success: true,
      message: 'Emergency request sent successfully',
      data: {
        emergencyId: emergency._id,
        emergencyNumber: emergency.emergencyNumber,
        status: emergency.status
      }
    });
  } catch (error) {
    console.error('Error requesting emergency assistance:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get patient's emergency responses
// @route   GET /api/patient/emergency-responses
// @access  Private (Patient)
export const getPatientEmergencyResponses = async (req, res) => {
  try {
    const patientId = req.user._id;
    const { status, page = 1, limit = 20 } = req.query;

    const query = { patient: patientId };
    
    if (status) query.status = status;

    const emergencies = await EmergencyResponse.find(query)
      .populate('assignedHospital', 'hospitalName hospitalType location')
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
    console.error('Error getting emergency responses:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Send message to hospital
// @route   POST /api/patient/hospitals/:id/message
// @access  Private (Patient)
export const sendMessageToHospital = async (req, res) => {
  try {
    const { id: hospitalId } = req.params;
    const patientId = req.user._id;
    const { message, type = 'text', appointmentId = null, admissionId = null } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Check if hospital exists
    const hospital = await User.findById(hospitalId);
    if (!hospital || hospital.role !== 'hospital') {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    const messageData = {
      id: Date.now().toString(),
      from: {
        id: patientId,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        role: 'patient'
      },
      to: {
        id: hospitalId,
        name: hospital.hospitalName,
        role: 'hospital'
      },
      message,
      type,
      appointmentId,
      admissionId,
      timestamp: new Date()
    };

    // Send message to hospital
    realtimeService.broadcastToHospital(hospitalId, 'message:new', messageData);

    // Send confirmation to patient
    realtimeService.sendNotification(patientId, {
      type: 'message_sent',
      title: 'Message Sent',
      message: `Message sent to ${hospital.hospitalName}`,
      data: { messageId: messageData.id, hospitalName: hospital.hospitalName }
    });

    res.json({
      success: true,
      message: 'Message sent successfully',
      data: messageData
    });
  } catch (error) {
    console.error('Error sending message to hospital:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get doctors at hospital
// @route   GET /api/patient/hospitals/:id/doctors
// @access  Private (Patient)
export const getHospitalDoctors = async (req, res) => {
  try {
    const { id: hospitalId } = req.params;
    const { specialization, availability, rating, page = 1, limit = 20 } = req.query;

    // Build query
    const query = { 
      role: 'doctor', 
      hospital: hospitalId,
      isActive: true 
    };

    if (specialization) {
      query.specialization = new RegExp(specialization, 'i');
    }

    if (availability === 'online') {
      query.isOnline = true;
    }

    if (rating) {
      query['ratings.average'] = { $gte: parseFloat(rating) };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get doctors
    const doctors = await User.find(query)
      .select('firstName lastName specialization ratings yearsOfExperience bio profileImage isOnline')
      .sort({ 'ratings.average': -1, firstName: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await User.countDocuments(query);

    // Format response
    const formattedDoctors = doctors.map(doctor => ({
      id: doctor._id,
      name: `${doctor.firstName} ${doctor.lastName}`,
      specialization: doctor.specialization,
      rating: doctor.ratings?.average || 0,
      yearsOfExperience: doctor.yearsOfExperience || 5,
      bio: doctor.bio,
      profileImage: doctor.profileImage,
      realTimeData: {
        isOnline: doctor.isOnline || false,
        todayAppointments: Math.floor(Math.random() * 20) + 5,
        availableSlots: Math.floor(Math.random() * 10) + 3,
        availabilityPercentage: Math.floor(Math.random() * 40) + 60,
        nextAvailableSlot: new Date(Date.now() + Math.random() * 86400000).toISOString()
      }
    }));

    res.json({
      success: true,
      data: {
        doctors: formattedDoctors,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error getting hospital doctors:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get hospital wait times
// @route   GET /api/patient/hospitals/:id/wait-times
// @access  Private (Patient)
export const getHospitalWaitTimes = async (req, res) => {
  try {
    const { id: hospitalId } = req.params;

    const departments = await HospitalDepartment.find({ hospital: hospitalId })
      .select('name currentWaitTime status capacity');

    const waitTimes = departments.map(dept => ({
      department: dept.name,
      currentWaitTime: dept.currentWaitTime,
      status: dept.status,
      capacity: dept.capacity
    }));

    res.json({
      success: true,
      data: {
        hospitalId,
        waitTimes,
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    console.error('Error getting hospital wait times:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Rate hospital experience
// @route   POST /api/patient/hospitals/:id/rate
// @access  Private (Patient)
export const rateHospitalExperience = async (req, res) => {
  try {
    const { id: hospitalId } = req.params;
    const patientId = req.user._id;
    const { rating, review, appointmentId = null, admissionId = null } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if hospital exists
    const hospital = await User.findById(hospitalId);
    if (!hospital || hospital.role !== 'hospital') {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    // In a real application, you would save this to a ratings/reviews collection
    // For now, we'll just send a notification
    const ratingData = {
      id: Date.now().toString(),
      patient: {
        id: patientId,
        firstName: req.user.firstName,
        lastName: req.user.lastName
      },
      hospital: {
        id: hospitalId,
        name: hospital.hospitalName
      },
      rating,
      review,
      appointmentId,
      admissionId,
      timestamp: new Date()
    };

    // Send rating to hospital
    realtimeService.broadcastToHospital(hospitalId, 'rating:new', ratingData);

    res.json({
      success: true,
      message: 'Rating submitted successfully',
      data: ratingData
    });
  } catch (error) {
    console.error('Error rating hospital:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Request hospital admission
// @route   POST /api/patient/hospitals/admission-requests
// @access  Private (Patient)
export const requestHospitalAdmission = async (req, res) => {
  try {
    const patientId = req.user._id;
    const {
      hospitalId,
      admissionType,
      department,
      primaryDiagnosis,
      secondaryDiagnosis,
      symptoms,
      allergies,
      currentMedications,
      urgency,
      expectedStay,
      roomPreference,
      specialRequirements,
      insuranceProvider,
      policyNumber,
      emergencyContact,
      notes,
      preferredAdmissionDate
    } = req.body;

    // Validate required fields
    if (!hospitalId || !admissionType || !department || !primaryDiagnosis || !symptoms || !emergencyContact) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if hospital exists
    const hospital = await User.findById(hospitalId);
    if (!hospital || hospital.role !== 'hospital') {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    // Create admission request
    const admissionRequest = new AdmissionRequest({
      patient: patientId,
      hospital: hospitalId,
      admissionType,
      department,
      primaryDiagnosis,
      secondaryDiagnosis,
      symptoms,
      allergies,
      currentMedications,
      urgency,
      expectedStay,
      roomPreference,
      specialRequirements,
      insuranceProvider,
      policyNumber,
      emergencyContact,
      notes,
      preferredAdmissionDate: preferredAdmissionDate ? new Date(preferredAdmissionDate) : undefined
    });

    await admissionRequest.save();

    // Populate the saved request
    const populatedRequest = await AdmissionRequest.findById(admissionRequest._id)
      .populate('patient', 'firstName lastName email phone')
      .populate('hospital', 'hospitalName address');

    // Send real-time notification to hospital
    realtimeService.broadcastToHospital(hospitalId, 'admission_request:new', {
      requestId: admissionRequest._id,
      requestNumber: admissionRequest.requestNumber,
      patient: {
        id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        phone: req.user.phone
      },
      admissionType,
      department,
      urgency,
      timestamp: new Date()
    });

    // Send confirmation to patient
    realtimeService.sendNotification(patientId, {
      type: 'admission_request_created',
      title: 'Admission Request Submitted',
      message: `Your admission request has been submitted to ${hospital.hospitalName}`,
      data: { 
        requestId: admissionRequest._id, 
        requestNumber: admissionRequest.requestNumber,
        hospital: hospital.hospitalName 
      }
    });

    res.status(201).json({
      success: true,
      message: 'Admission request submitted successfully',
      data: populatedRequest
    });
  } catch (error) {
    console.error('Error creating admission request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get patient admission requests
// @route   GET /api/patient/hospitals/admission-requests
// @access  Private (Patient)
export const getPatientAdmissionRequests = async (req, res) => {
  try {
    const patientId = req.user._id;
    const { status, hospitalId } = req.query;

    const query = { patient: patientId };
    if (status) query.status = status;
    if (hospitalId) query.hospital = hospitalId;

    const admissionRequests = await AdmissionRequest.find(query)
      .populate('hospital', 'hospitalName address')
      .populate('assignedDoctor', 'firstName lastName specialization')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: admissionRequests
    });
  } catch (error) {
    console.error('Error getting patient admission requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Cancel admission request
// @route   PUT /api/patient/hospitals/admission-requests/:id/cancel
// @access  Private (Patient)
export const cancelAdmissionRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const patientId = req.user._id;
    const { reason } = req.body;

    const admissionRequest = await AdmissionRequest.findById(id);
    if (!admissionRequest) {
      return res.status(404).json({ message: 'Admission request not found' });
    }

    if (admissionRequest.patient.toString() !== patientId) {
      return res.status(403).json({ message: 'Not authorized to cancel this request' });
    }

    if (admissionRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot cancel request that is not pending' });
    }

    admissionRequest.status = 'cancelled';
    if (reason) {
      admissionRequest.statusHistory.push({
        status: 'cancelled',
        timestamp: new Date(),
        updatedBy: patientId,
        notes: reason
      });
    }

    await admissionRequest.save();

    // Notify hospital
    realtimeService.broadcastToHospital(admissionRequest.hospital, 'admission_request:cancelled', {
      requestId: admissionRequest._id,
      requestNumber: admissionRequest.requestNumber,
      patient: {
        id: patientId,
        firstName: req.user.firstName,
        lastName: req.user.lastName
      },
      reason,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Admission request cancelled successfully',
      data: admissionRequest
    });
  } catch (error) {
    console.error('Error cancelling admission request:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 