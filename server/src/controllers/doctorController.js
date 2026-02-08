import User from '../models/User.js';
import ProofRequest from '../models/ProofRequest.js';
import Proof from '../models/Proof.js';
import { logAccess } from '../utils/logger.js';

// @desc    Get all patients for a doctor
// @route   GET /api/doctor/patients
// @access  Private (Doctor only)
export const getPatients = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    const query = { role: 'patient' };
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const patients = await User.find(query)
      .select('firstName lastName email dateOfBirth bloodType phone profileImage')
      .sort({ firstName: 1, lastName: 1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await User.countDocuments(query);

    res.json({
      patients,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get patient detail
// @route   GET /api/doctor/patients/:id
// @access  Private (Doctor only)
export const getPatientDetail = async (req, res) => {
  try {
    const patient = await User.findOne({
      _id: req.params.id,
      role: 'patient'
    }).select('-password');

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Get recent proof requests for this patient
    const recentRequests = await ProofRequest.find({
      patientId: req.params.id,
      requesterId: req.user._id
    })
      .sort({ createdAt: -1 })
      .limit(5);

    // Get patient's public proofs
    const publicProofs = await Proof.find({
      patientId: req.params.id,
      isPublic: true,
      status: 'Active'
    })
      .select('title proofType statement createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      patient: {
        ...patient.toObject(),
        avatar: patient.profileImage || null
      },
      recentRequests,
      publicProofs
    });
  } catch (error) {
    console.error('Get patient detail error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Upload prescription for a patient
// @route   POST /api/doctor/prescriptions
// @access  Private (Doctor only)
export const uploadPrescription = async (req, res) => {
  try {
    const { patientId, title, description, medications, instructions, followUpDate } = req.body;

    // Verify patient exists
    let patient;
    if (patientId.match && patientId.match(/^[0-9a-fA-F]{24}$/)) {
      // MongoDB ObjectId
      patient = await User.findOne({ _id: patientId, role: 'patient' });
    } else {
      // Assume email
      patient = await User.findOne({ email: patientId, role: 'patient' });
    }
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Handle file upload (assuming multer middleware is used)
    const fileUrl = req.file?.path || req.body.fileUrl;
    const fileName = req.file?.originalname || req.body.fileName;
    const fileSize = req.file?.size || req.body.fileSize;
    const mimeType = req.file?.mimetype || req.body.mimeType;

    if (!fileUrl || !fileName || !fileSize || !mimeType) {
      return res.status(400).json({ message: 'File information is required' });
    }

    // Create health record for the prescription
    const HealthRecord = (await import('../models/HealthRecord.js')).default;

    const record = await HealthRecord.create({
      patientId: patient._id,
      doctorId: req.user._id,
      type: 'Prescription',
      title,
      description,
      provider: req.user.hospital,
      date: new Date(),
      fileUrl,
      fileName,
      fileSize,
      mimeType,
      metadata: {
        medications: medications || '',
        instructions: instructions || '',
        followUpDate: followUpDate || ''
      }
    });

    // Log access
    await logAccess(req.user._id, 'UPLOAD_RECORD', 'HealthRecord', record._id, patientId, req);

    res.status(201).json({
      message: 'Prescription uploaded successfully',
      record
    });
  } catch (error) {
    console.error('Upload prescription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all prescriptions uploaded by the doctor
// @route   GET /api/doctor/prescriptions
// @access  Private (Doctor only)
export const getDoctorPrescriptions = async (req, res) => {
  try {
    const HealthRecord = (await import('../models/HealthRecord.js')).default;
    const prescriptions = await HealthRecord.find({
      doctorId: req.user._id,
      type: 'Prescription'
    })
      .populate('patientId', 'firstName lastName email profileImage')
      .sort({ date: -1 });
    res.json({ prescriptions });
  } catch (error) {
    console.error('Get doctor prescriptions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get doctor dashboard statistics
// @route   GET /api/doctor/dashboard
// @access  Private (Doctor only)
export const getDoctorDashboard = async (req, res) => {
  try {
    // Get pending proof requests
    const pendingRequests = await ProofRequest.countDocuments({
      requesterId: req.user._id,
      status: 'Pending'
    });

    // Get verified proofs this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const verifiedThisWeek = await ProofRequest.countDocuments({
      requesterId: req.user._id,
      status: 'Approved',
      approvedAt: { $gte: oneWeekAgo }
    });

    // Get total patients
    const totalPatients = await User.countDocuments({ role: 'patient' });

    // Get new patients joined this week
    const newPatientsThisWeek = await User.countDocuments({
      role: 'patient',
      createdAt: { $gte: oneWeekAgo }
    });

    // Get recent activity
    const recentRequests = await ProofRequest.find({
      requesterId: req.user._id
    })
      .populate('patientId', 'firstName lastName email profileImage')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get a list of patients for the dashboard table (limit 8 for preview)
    const patients = await User.find({ role: 'patient' })
      .select('firstName lastName email profileImage createdAt')
      .sort({ createdAt: -1 })
      .limit(8);

    // Get response time (average time from request to response)
    const responseTimeData = await ProofRequest.aggregate([
      {
        $match: {
          requesterId: req.user._id,
          status: { $in: ['Approved', 'Denied'] },
          approvedAt: { $exists: true }
        }
      },
      {
        $project: {
          responseTime: {
            $divide: [
              { $subtract: ['$approvedAt', '$createdAt'] },
              1000 * 60 * 60 // Convert to hours
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgResponseTime: { $avg: '$responseTime' }
        }
      }
    ]);

    const avgResponseTime = responseTimeData.length > 0 ? responseTimeData[0].avgResponseTime : 0;

    // Get recently verified proofs (status: 'Approved')
    const verifiedProofs = await ProofRequest.find({
      requesterId: req.user._id,
      status: 'Approved',
      approvedAt: { $exists: true }
    })
      .populate('patientId', 'firstName lastName')
      .sort({ approvedAt: -1 })
      .limit(5)
      .lean();
    const verifiedProofsMapped = verifiedProofs.map(pr => ({
      id: pr._id,
      patientName: pr.patientId ? `${pr.patientId.firstName} ${pr.patientId.lastName}` : 'Unknown',
      proofType: pr.proofType,
      verificationDate: pr.approvedAt,
      signature: pr.signature || '',
      fileUrl: pr.cloudinaryUrl || ''
    }));

    res.json({
      stats: {
        pendingRequests,
        verifiedThisWeek,
        totalPatients,
        avgResponseTime: Math.round(avgResponseTime * 10) / 10,
        newPatientsThisWeek
      },
      recentRequests,
      patients,
      verifiedProofs: verifiedProofsMapped
    });
  } catch (error) {
    console.error('Get doctor dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Search patients
// @route   GET /api/doctor/search-patients
// @access  Private (Doctor only)
export const searchPatients = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    const patients = await User.find({
      role: 'patient',
      $or: [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    })
      .select('firstName lastName email dateOfBirth')
      .limit(10);

    res.json(patients);
  } catch (error) {
    console.error('Search patients error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get doctor profile/settings
// @route   GET /api/doctor/settings
// @access  Private (Doctor only)
export const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await User.findById(req.user._id).select('-password');
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json({
      ...doctor.toObject(),
      scheduleSettings: doctor.scheduleSettings || {},
      notificationSettings: doctor.notificationSettings || {},
      privacySettings: doctor.privacySettings || {}
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update doctor profile/settings (with optional avatar upload)
// @route   PUT /api/doctor/settings
// @access  Private (Doctor only)
export const updateDoctorProfile = async (req, res) => {
  try {
    console.log('📥 Request body received:', {
      bodyKeys: Object.keys(req.body),
      bodyValues: Object.fromEntries(
        Object.entries(req.body).map(([key, value]) => [
          key,
          typeof value === 'string' && value.length > 100 ? `${value.substring(0, 100)}...` : value
        ])
      ),
      hasFiles: !!req.files,
      hasFile: !!req.file,
      fileKeys: req.files ? Object.keys(req.files) : [],
      fileField: req.file ? req.file.fieldname : null
    });

    const forbidden = ['password', 'email', 'role', 'isEmailVerified', 'isActive', '_id', 'patientId'];
    forbidden.forEach(f => delete req.body[f]);
    let update = { ...req.body };

    // Handle profile image upload
    if (req.files) {
      // Check for either avatar or profileImage field
      const uploadedFile = req.files.avatar?.[0] || req.files.profileImage?.[0];

      if (uploadedFile) {
        try {
          console.log('📁 File received:', {
            fieldname: uploadedFile.fieldname,
            originalname: uploadedFile.originalname,
            mimetype: uploadedFile.mimetype,
            size: uploadedFile.size
          });

          // Import the uploadToCloudinary function
          const { uploadToCloudinary } = await import('../utils/cloudinary.js');

          // Get the current user with profileImage field
          const currentUser = await User.findById(req.user._id).select('profileImage');

          // Delete old image if exists
          if (currentUser && currentUser.profileImage && currentUser.profileImage.publicId) {
            const { deleteFromCloudinary } = await import('../utils/cloudinary.js');
            try {
              await deleteFromCloudinary(currentUser.profileImage.publicId);
              console.log('🗑️ Old profile image deleted from Cloudinary');
            } catch (deleteError) {
              console.warn('⚠️ Failed to delete old image from Cloudinary:', deleteError);
            }
          }

          // Upload new image to Cloudinary
          console.log('☁️ Uploading to Cloudinary...');
          const uploadResult = await uploadToCloudinary(uploadedFile.path, 'user_profiles');
          console.log('✅ Cloudinary upload result:', uploadResult);

          update.profileImage = {
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            uploadedAt: new Date()
          };

          console.log('✅ Profile image data prepared:', update.profileImage);
        } catch (uploadError) {
          console.error('❌ Profile image upload error:', uploadError);
          return res.status(500).json({ message: 'Failed to upload profile image' });
        }
      } else {
        console.log('ℹ️ No valid file found in uploaded files');
      }
    } else if (req.file) {
      // Fallback for single file upload (backward compatibility)
      try {
        console.log('📁 File received (single):', {
          fieldname: req.file.fieldname,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size
        });

        // Import the uploadToCloudinary function
        const { uploadToCloudinary } = await import('../utils/cloudinary.js');

        // Get the current user with profileImage field
        const currentUser = await User.findById(req.user._id).select('profileImage');

        // Delete old image if exists
        if (currentUser && currentUser.profileImage && currentUser.profileImage.publicId) {
          const { deleteFromCloudinary } = await import('../utils/cloudinary.js');
          try {
            await deleteFromCloudinary(currentUser.profileImage.publicId);
            console.log('🗑️ Old profile image deleted from Cloudinary');
          } catch (deleteError) {
            console.warn('⚠️ Failed to delete old image from Cloudinary:', deleteError);
          }
        }

        // Upload new image to Cloudinary
        console.log('☁️ Uploading to Cloudinary...');
        const uploadResult = await uploadToCloudinary(req.file.path, 'user_profiles');
        console.log('✅ Cloudinary upload result:', uploadResult);

        update.profileImage = {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          uploadedAt: new Date()
        };

        console.log('✅ Profile image data prepared:', update.profileImage);
      } catch (uploadError) {
        console.error('❌ Profile image upload error:', uploadError);
        return res.status(500).json({ message: 'Failed to upload profile image' });
      }
    } else {
      console.log('ℹ️ No file uploaded in this request');
    }

    // Explicitly map all profile fields
    const profileFields = [
      'firstName', 'lastName', 'phone', 'specialty', 'specialization', 'licenseNumber', 'hospital', 'department', 'yearsOfExperience', 'bio'
    ];
    profileFields.forEach(field => {
      if (req.body[field] !== undefined) {
        update[field] = req.body[field];
      }
    });

    // specialty/specialization mapping
    if (req.body.specialty && !req.body.specialization) {
      update.specialization = req.body.specialty;
    }

    // Handle nested objects that might come as JSON strings from FormData
    const nestedFields = [
      'location', 'consultationFees', 'availability', 'specialties', 'languages', 'ratings', 'documents',
      'address', 'operatingHours', 'emergencyServices', 'technology', 'medicalStaff', 'ambulanceServices',
      'preferences', 'scheduleSettings', 'notificationSettings', 'privacySettings', 'savedDoctors',
      'backupCodes', 'webauthnCredentials', 'emergencyContacts', 'accreditations', 'certifications',
      'facilities', 'insuranceAccepted', 'paymentMethods', 'qualityStandards', 'services', 'workingDays'
    ];
    nestedFields.forEach(field => {
      if (req.body[field]) {
        try {
          // If it's already an object, use it as is
          if (typeof req.body[field] === 'object') {
            update[field] = req.body[field];
          } else if (typeof req.body[field] === 'string') {
            // If it's a string, try to parse it as JSON
            update[field] = JSON.parse(req.body[field]);
          }
        } catch (parseError) {
          console.warn(`⚠️ Failed to parse ${field} field:`, parseError);
          // If parsing fails, skip this field
        }
      }
    });

    // Parse nested settings if present
    if (req.body.scheduleSettings) {
      try {
        update.scheduleSettings = typeof req.body.scheduleSettings === 'string' ? JSON.parse(req.body.scheduleSettings) : req.body.scheduleSettings;
      } catch (parseError) {
        console.warn('⚠️ Failed to parse scheduleSettings:', parseError);
      }
    }
    if (req.body.notificationSettings) {
      try {
        update.notificationSettings = typeof req.body.notificationSettings === 'string' ? JSON.parse(req.body.notificationSettings) : req.body.notificationSettings;
      } catch (parseError) {
        console.warn('⚠️ Failed to parse notificationSettings:', parseError);
      }
    }
    if (req.body.privacySettings) {
      try {
        update.privacySettings = typeof req.body.privacySettings === 'string' ? JSON.parse(req.body.privacySettings) : req.body.privacySettings;
      } catch (parseError) {
        console.warn('⚠️ Failed to parse privacySettings:', parseError);
      }
    }

    console.log('📝 Final update data:', update);

    const doctor = await User.findByIdAndUpdate(
      req.user._id,
      update,
      { new: true, runValidators: true }
    ).select('-password');

    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    console.log('✅ Doctor profile updated successfully:', {
      id: doctor._id,
      profileImage: doctor.profileImage,
      hasProfileImage: !!doctor.profileImage,
      profileImageType: typeof doctor.profileImage
    });

    res.json({ message: 'Profile updated successfully', doctor });
  } catch (error) {
    console.error('❌ Update doctor profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get nearby doctors (by city/state or lat/lng)
// @route   GET /api/doctors/nearby
// @access  Public/Patient
export const getNearbyDoctors = async (req, res) => {
  try {
    const { city, state, lat, lng, pincode, radius = 5 } = req.query;
    console.log('🔍 Fetching nearby doctors with params:', { city, state, lat, lng, pincode, radius });

    let query = { role: 'doctor', isActive: true };

    // If coordinates are provided, use geospatial search
    if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const radiusKm = parseFloat(radius);

      console.log(`📍 Using geospatial search: lat=${latitude}, lng=${longitude}, radius=${radiusKm}km`);

      // Find doctors within the specified radius
      const doctors = await User.find({
        role: 'doctor',
        isActive: true,
        'location.lat': { $exists: true, $ne: null },
        'location.lng': { $exists: true, $ne: null }
      })
        .select('-password -emailVerificationToken -emailVerificationExpires -twoFactorSecret -backupCodes -mfaSecret')
        .lean();

      // Calculate distances and filter by radius
      const doctorsWithDistance = doctors
        .map(doctor => {
          if (doctor.location?.lat && doctor.location?.lng) {
            const distance = calculateDistance(
              latitude,
              longitude,
              doctor.location.lat,
              doctor.location.lng
            );
            return { ...doctor, distance };
          }
          return { ...doctor, distance: null };
        })
        .filter(doctor => doctor.distance !== null && doctor.distance <= radiusKm)
        .sort((a, b) => a.distance - b.distance);

      console.log(`✅ Found ${doctorsWithDistance.length} doctors within ${radiusKm}km radius`);

      // Transform the data
      const transformedDoctors = doctorsWithDistance.map(doctor => ({
        _id: doctor._id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        profileImage: doctor.profileImage,
        specialization: doctor.specialization,
        yearsOfExperience: doctor.yearsOfExperience || doctor.experience || 0,
        experience: doctor.experience || doctor.yearsOfExperience || 0,
        languages: doctor.languages || ['English'],
        ratings: doctor.ratings || { average: 4.5, count: 0 },
        consultationFees: doctor.consultationFees || { online: 0, inPerson: 0 },
        location: {
          address: doctor.location?.address || doctor.hospital || 'Address not available',
          lat: doctor.location?.lat || 0,
          lng: doctor.location?.lng || 0,
          pincode: doctor.location?.pincode || '000000'
        },
        hospital: doctor.hospital,
        department: doctor.department,
        bio: doctor.bio || `Dr. ${doctor.firstName} ${doctor.lastName} is a ${doctor.specialization || 'medical professional'}.`,
        emergencyAvailable: doctor.emergencyAvailable || false,
        specialties: doctor.specialties || [doctor.specialization || 'General Medicine'],
        licenseNumber: doctor.licenseNumber,
        address: doctor.address,
        profileComplete: doctor.profileComplete,
        isActive: doctor.isActive,
        // Note: availableSlots will be fetched dynamically via /api/slots/:doctorId/:date
        // This ensures real-time availability and prevents double bookings
        availableSlots: [] // Will be populated by frontend when needed
      }));

      return res.json({
        success: true,
        count: transformedDoctors.length,
        doctors: transformedDoctors,
        searchParams: { latitude, longitude, radius: radiusKm },
        searchType: 'geospatial'
      });
    }

    // Fallback to city/state/pincode search
    if (city) query['address.city'] = { $regex: city, $options: 'i' };
    if (state) query['address.state'] = { $regex: state, $options: 'i' };
    if (pincode) query['location.pincode'] = pincode;

    console.log('🏙️ Using city/state/pincode search with query:', query);

    const doctors = await User.find(query)
      .select('-password -emailVerificationToken -emailVerificationExpires -twoFactorSecret -backupCodes -mfaSecret')
      .lean();

    console.log(`✅ Found ${doctors.length} doctors by city/state/pincode`);

    // Debug: Log the first doctor's data structure
    if (doctors.length > 0) {
      console.log('🔍 First doctor data structure:', {
        _id: doctors[0]._id,
        firstName: doctors[0].firstName,
        consultationFees: doctors[0].consultationFees,
        hasConsultationFees: !!doctors[0].consultationFees,
        consultationFeesType: typeof doctors[0].consultationFees,
        consultationFeesKeys: doctors[0].consultationFees ? Object.keys(doctors[0].consultationFees) : 'N/A'
      });
    }

    // Transform the data similar to getAllDoctors
    const transformedDoctors = doctors.map(doctor => ({
      _id: doctor._id,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      profileImage: doctor.profileImage,
      specialization: doctor.specialization,
      yearsOfExperience: doctor.yearsOfExperience || doctor.experience || 0,
      experience: doctor.experience || doctor.yearsOfExperience || 0,
      languages: doctor.languages || ['English'],
      ratings: doctor.ratings || { average: 4.5, count: 0 },
      consultationFees: doctor.consultationFees || { online: 0, inPerson: 0 },
      location: {
        address: doctor.location?.address || doctor.hospital || 'Address not available',
        lat: doctor.location?.lat || 0,
        lng: doctor.location?.lng || 0,
        pincode: doctor.location?.pincode || '000000'
      },
      hospital: doctor.hospital,
      department: doctor.department,
      bio: doctor.bio || `Dr. ${doctor.firstName} ${doctor.lastName} is a ${doctor.specialization || 'medical professional'}.`,
      emergencyAvailable: doctor.emergencyAvailable || false,
      specialties: doctor.specialties || [doctor.specialization || 'General Medicine'],
      licenseNumber: doctor.licenseNumber,
      address: doctor.address,
      profileComplete: doctor.profileComplete,
      isActive: doctor.isActive,
      // Note: availableSlots will be fetched dynamically via /api/slots/:doctorId/:date
      // This ensures real-time availability and prevents double bookings
      availableSlots: [] // Will be populated by frontend when needed
    }));

    // Debug: Log the transformed consultation fees
    if (transformedDoctors.length > 0) {
      console.log('🔍 Transformed consultation fees:', {
        doctorName: `${transformedDoctors[0].firstName} ${transformedDoctors[0].lastName}`,
        consultationFees: transformedDoctors[0].consultationFees,
        hasFees: !!transformedDoctors[0].consultationFees,
        onlineFee: transformedDoctors[0].consultationFees?.online,
        inPersonFee: transformedDoctors[0].consultationFees?.inPerson
      });
    }

    res.json({
      success: true,
      count: transformedDoctors.length,
      doctors: transformedDoctors,
      searchParams: { city, state, pincode },
      searchType: 'city_state_pincode'
    });

  } catch (error) {
    console.error('❌ Error in getNearbyDoctors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nearby doctors',
      error: error.message
    });
  }
};

// Helper function to calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

// @desc    Get all doctors
// @route   GET /api/doctors/all
// @access  Public/Patient
export const getAllDoctors = async (req, res) => {
  try {
    console.log('🔍 Fetching all doctors from database...');

    // Fetch all doctors with comprehensive information
    const doctors = await User.find({ role: 'doctor' })
      .select('-password -emailVerificationToken -emailVerificationExpires -twoFactorSecret -backupCodes -mfaSecret')
      .lean();

    console.log(`✅ Found ${doctors.length} doctors in database`);

    // Transform the data to include all necessary fields
    const transformedDoctors = await Promise.all(doctors.map(async (doctor) => {
      console.log(`👨‍⚕️ Processing doctor: ${doctor.firstName} ${doctor.lastName} - ${doctor.specialization}`);

      // Fetch real availability data for this doctor
      let availabilityData = null;
      let realTimeSlots = [];
      let workingHours = null;

      try {
        // Import DoctorAvailability model
        const { default: DoctorAvailability } = await import('../models/DoctorAvailability.js');

        // Get doctor's availability settings
        const availability = await DoctorAvailability.findOne({ doctorId: doctor._id });

        if (availability) {
          availabilityData = availability;

          // Get today's working status
          const today = new Date();
          const dayName = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
          const todaySchedule = availability.workingDays.find(day => day.day === dayName);

          workingHours = {
            isWorkingToday: todaySchedule?.isWorking || false,
            startTime: todaySchedule?.startTime || availability.defaultStartTime,
            endTime: todaySchedule?.endTime || availability.defaultEndTime,
            appointmentDuration: availability.appointmentDuration,
            workingDays: availability.workingDays.filter(day => day.isWorking).map(day => day.day),
            status: availability.status,
            isOnline: availability.isOnline
          };

          // Generate real available slots for today and tomorrow
          if (todaySchedule?.isWorking) {
            const todaySlots = availability.getAvailableSlots(today);
            const tomorrowSlots = availability.getAvailableSlots(new Date(today.getTime() + 24 * 60 * 60 * 1000));

            // Convert to the format expected by frontend
            realTimeSlots = [
              ...todaySlots.map((slot, index) => ({
                _id: `slot-${doctor._id}-today-${index}`,
                doctorId: doctor._id,
                startTime: new Date(`${today.toISOString().split('T')[0]}T${slot.startTime}`).toISOString(),
                endTime: new Date(`${today.toISOString().split('T')[0]}T${slot.endTime}`).toISOString(),
                isAvailable: slot.isAvailable,
                isBooked: !slot.isAvailable,
                consultationType: 'online', // Default to 'online' for compatibility
                date: today.toISOString().split('T')[0]
              })),
              ...tomorrowSlots.map((slot, index) => ({
                _id: `slot-${doctor._id}-tomorrow-${index}`,
                doctorId: doctor._id,
                startTime: new Date(`${new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}T${slot.startTime}`).toISOString(),
                endTime: new Date(`${new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}T${slot.endTime}`).toISOString(),
                isAvailable: slot.isAvailable,
                isBooked: !slot.isAvailable,
                consultationType: 'online', // Default to 'online' for compatibility
                date: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
              }))
            ];
          }

          console.log(`✅ Found availability data for Dr. ${doctor.firstName}:`, {
            workingDays: workingHours.workingDays,
            todayStatus: workingHours.isWorkingToday,
            slotsCount: realTimeSlots.length
          });
        } else {
          console.log(`⚠️ No availability data found for Dr. ${doctor.firstName}, using defaults`);
          workingHours = {
            isWorkingToday: false,
            startTime: '09:00',
            endTime: '17:00',
            appointmentDuration: 30,
            workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
            status: 'unavailable',
            isOnline: false
          };
        }
      } catch (availabilityError) {
        console.error(`❌ Error fetching availability for Dr. ${doctor.firstName}:`, availabilityError);
        // Use default working hours if availability fetch fails
        workingHours = {
          isWorkingToday: false,
          startTime: '09:00',
          endTime: '17:00',
          appointmentDuration: 30,
          workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          status: 'unavailable',
          isOnline: false
        };
      }

      return {
        _id: doctor._id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        profileImage: doctor.profileImage,
        specialization: doctor.specialization,
        yearsOfExperience: doctor.yearsOfExperience || doctor.experience || 0,
        experience: doctor.experience || doctor.yearsOfExperience || 0,
        languages: doctor.languages || ['English'],
        ratings: doctor.ratings || { average: 4.5, count: 0 },
        consultationFees: doctor.consultationFees || { online: 0, inPerson: 0 },
        location: {
          address: doctor.location?.address || doctor.hospital || 'Address not available',
          lat: doctor.location?.lat || 0,
          lng: doctor.location?.lng || 0,
          pincode: doctor.location?.pincode || '000000'
        },
        hospital: doctor.hospital,
        department: doctor.department,
        bio: doctor.bio || `Dr. ${doctor.firstName} ${doctor.lastName} is a ${doctor.specialization || 'medical professional'}.`,
        emergencyAvailable: doctor.emergencyAvailable || false,
        specialties: doctor.specialties || [doctor.specialization || 'General Medicine'],
        licenseNumber: doctor.licenseNumber,
        address: doctor.address,
        profileComplete: doctor.profileComplete,
        isActive: doctor.isActive,
        // Real availability data from DoctorAvailability model
        availability: workingHours,
        availableSlots: realTimeSlots,
        // Additional availability information
        nextAvailableSlot: realTimeSlots.find(slot => slot.isAvailable)?.startTime || null,
        totalAvailableSlots: realTimeSlots.filter(slot => slot.isAvailable).length,
        workingHoursSummary: workingHours ? `${workingHours.workingDays.join(', ').replace(/\b\w/g, l => l.toUpperCase())} ${workingHours.startTime}-${workingHours.endTime}` : 'Not specified'
      };
    }));

    console.log(`🎯 Successfully transformed ${transformedDoctors.length} doctors with real availability data`);
    console.log('🏥 Sample doctor data:', {
      name: `${transformedDoctors[0]?.firstName} ${transformedDoctors[0]?.lastName}`,
      availability: transformedDoctors[0]?.availability,
      slotsCount: transformedDoctors[0]?.availableSlots?.length
    });

    res.json({
      success: true,
      count: transformedDoctors.length,
      doctors: transformedDoctors
    });
  } catch (error) {
    console.error('❌ Get all doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching doctors',
      error: error.message
    });
  }
};

// @desc    Get emergency-available doctors
// @route   GET /api/doctors/emergency
// @access  Public/Patient
export const getEmergencyDoctors = async (req, res) => {
  try {
    console.log('🚨 Fetching emergency doctors...');

    const doctors = await User.find({ role: 'doctor', emergencyAvailable: true })
      .select('-password -emailVerificationToken -emailVerificationExpires -twoFactorSecret -backupCodes -mfaSecret')
      .lean();

    console.log(`✅ Found ${doctors.length} emergency doctors`);

    // Transform the data similar to getAllDoctors
    const transformedDoctors = doctors.map(doctor => ({
      _id: doctor._id,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      profileImage: doctor.profileImage,
      specialization: doctor.specialization,
      yearsOfExperience: doctor.yearsOfExperience || doctor.experience || 0,
      experience: doctor.experience || doctor.yearsOfExperience || 0,
      languages: doctor.languages || ['English'],
      ratings: doctor.ratings || { average: 4.5, count: 0 },
      consultationFees: doctor.consultationFees || { online: 0, inPerson: 0 },
      location: {
        address: doctor.location?.address || doctor.hospital || 'Address not available',
        lat: doctor.location?.lat || 0,
        lng: doctor.location?.lng || 0,
        pincode: doctor.location?.pincode || '000000'
      },
      hospital: doctor.hospital,
      department: doctor.department,
      bio: doctor.bio || `Dr. ${doctor.firstName} ${doctor.lastName} is a ${doctor.specialization || 'medical professional'} available for emergencies.`,
      emergencyAvailable: doctor.emergencyAvailable || false,
      specialties: doctor.specialties || [doctor.specialization || 'General Medicine'],
      licenseNumber: doctor.licenseNumber,
      address: doctor.address,
      profileComplete: doctor.profileComplete,
      isActive: doctor.isActive,
      availableSlots: [
        {
          _id: `emergency-slot-${doctor._id}-1`,
          doctorId: doctor._id,
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          isAvailable: true,
          isBooked: false,
          consultationType: 'online'
        }
      ]
    }));

    res.json({
      success: true,
      count: transformedDoctors.length,
      doctors: transformedDoctors
    });
  } catch (error) {
    console.error('❌ Get emergency doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching emergency doctors',
      error: error.message
    });
  }
};

// @desc    Get saved doctors for a patient
// @route   GET /api/doctors/saved
// @access  Private (Patient only)
export const getSavedDoctors = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('savedDoctors', 'firstName lastName specialization hospital location profileImage');
    res.json({ savedDoctors: user.savedDoctors });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add a doctor to saved doctors
// @route   POST /api/doctors/saved/:doctorId
// @access  Private (Patient only)
export const addSavedDoctor = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.savedDoctors.includes(req.params.doctorId)) {
      user.savedDoctors.push(req.params.doctorId);
      await user.save();
    }
    res.json({ message: 'Doctor saved', savedDoctors: user.savedDoctors });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove a doctor from saved doctors
// @route   DELETE /api/doctors/saved/:doctorId
// @access  Private (Patient only)
export const removeSavedDoctor = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.savedDoctors = user.savedDoctors.filter(id => id.toString() !== req.params.doctorId);
    await user.save();
    res.json({ message: 'Doctor removed', savedDoctors: user.savedDoctors });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get doctor profile completion status
// @route   GET /api/doctor/profile-completion
// @access  Private (Doctor only)
export const getProfileCompletionStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isComplete = user.isDoctorProfileComplete();
    const completionPercentage = calculateProfileCompletion(user);

    res.json({
      isComplete,
      completionPercentage,
      missingFields: getMissingFields(user)
    });
  } catch (error) {
    console.error('Get profile completion status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Complete doctor profile
// @route   POST /api/doctor/complete-profile
// @access  Private (Doctor only)
export const completeProfile = async (req, res) => {
  try {
    console.log('Complete profile request body:', req.body);

    const {
      // Personal Information
      firstName,
      lastName,
      phone,
      gender,
      dateOfBirth,

      // Professional Information
      licenseNumber,
      specialization,
      hospital,
      department,
      yearsOfExperience,
      bio,

      // Location Information
      location,

      // Consultation Details
      languages,
      consultationFees,
      specialties,

      // Availability
      availability,

      // Emergency Availability
      emergencyAvailable,

      // Documents
      documents
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update ALL profile fields - Personal Information
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (gender) user.gender = gender;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;

    // Professional Information
    if (licenseNumber) user.licenseNumber = licenseNumber;
    if (specialization) user.specialization = specialization;
    if (hospital) user.hospital = hospital;
    if (department) user.department = department;
    if (yearsOfExperience) user.yearsOfExperience = yearsOfExperience;
    if (bio) user.bio = bio;

    // Parse and update complex fields
    if (languages) {
      try {
        // Parse JSON string if it's a string, otherwise use as is
        user.languages = typeof languages === 'string' ? JSON.parse(languages) : languages;
      } catch (error) {
        console.error('Error parsing languages:', error);
        return res.status(400).json({ message: 'Invalid languages format' });
      }
    }
    if (consultationFees) {
      try {
        // Parse JSON string if it's a string, otherwise use as is
        const parsedFees = typeof consultationFees === 'string' ? JSON.parse(consultationFees) : consultationFees;

        // Use the new validation method
        user.setConsultationFees(parsedFees.online, parsedFees.inPerson);
      } catch (error) {
        console.error('Error setting consultation fees:', error);
        return res.status(400).json({
          message: error.message || 'Invalid consultation fees format',
          error: error.message
        });
      }
    }
    if (availability) {
      try {
        // Parse JSON string if it's a string, otherwise use as is
        user.availability = typeof availability === 'string' ? JSON.parse(availability) : availability;
      } catch (error) {
        console.error('Error parsing availability:', error);
        return res.status(400).json({ message: 'Invalid availability format' });
      }
    }
    if (location) {
      try {
        // Parse JSON string if it's a string, otherwise use as is
        const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;

        // Transform location data to match User model structure
        if (parsedLocation && typeof parsedLocation === 'object') {
          user.location = {
            lat: parsedLocation.lat || parsedLocation.latitude || 0,
            lng: parsedLocation.lng || parsedLocation.longitude || 0,
            city: parsedLocation.city || '',
            state: parsedLocation.state || '',
            pincode: parsedLocation.pincode || '000000',
            address: typeof parsedLocation.address === 'string'
              ? parsedLocation.address
              : parsedLocation.address?.street
                ? `${parsedLocation.address.street}, ${parsedLocation.address.city || ''}, ${parsedLocation.address.state || ''}`.replace(/^,\s*/, '').replace(/,\s*$/, '')
                : `${parsedLocation.city || ''}, ${parsedLocation.state || ''}`.replace(/^,\s*/, '').replace(/,\s*$/, '')
          };
        }
      } catch (error) {
        console.error('Error parsing location:', error);
        return res.status(400).json({ message: 'Invalid location format' });
      }
    }
    if (specialties) {
      try {
        // Parse JSON string if it's a string, otherwise use as is
        user.specialties = typeof specialties === 'string' ? JSON.parse(specialties) : specialties;
      } catch (error) {
        console.error('Error parsing specialties:', error);
        return res.status(400).json({ message: 'Invalid specialties format' });
      }
    }
    if (emergencyAvailable !== undefined) {
      // Convert string to boolean if needed
      if (typeof emergencyAvailable === 'string') {
        user.emergencyAvailable = emergencyAvailable.toLowerCase() === 'true';
      } else {
        user.emergencyAvailable = emergencyAvailable;
      }
    }
    if (documents) user.documents = documents;

    // Mark profile as complete
    user.profileComplete = true;

    // Validate the user before saving
    try {
      await user.save();
    } catch (validationError) {
      console.error('Validation error:', validationError);
      return res.status(400).json({
        message: 'Profile validation failed',
        errors: validationError.errors
      });
    }

    console.log('Profile completed successfully for user:', user._id);
    console.log('Updated user data:', {
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth,
      licenseNumber: user.licenseNumber,
      specialization: user.specialization,
      hospital: user.hospital,
      department: user.department,
      yearsOfExperience: user.yearsOfExperience,
      bio: user.bio,
      languages: user.languages,
      consultationFees: user.consultationFees,
      availability: user.availability,
      location: user.location,
      specialties: user.specialties,
      emergencyAvailable: user.emergencyAvailable
    });

    res.json({
      message: 'Profile completed successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profileComplete: user.profileComplete
      }
    });
  } catch (error) {
    console.error('Complete profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to calculate profile completion percentage
function calculateProfileCompletion(user) {
  const requiredFields = [
    'licenseNumber',
    'specialization',
    'hospital',
    'bio',
    'location.city',
    'location.state',
    'consultationFees.online',
    'consultationFees.inPerson',
    'languages',
    'availability.workingDays'
  ];

  let completedFields = 0;
  requiredFields.forEach(field => {
    const value = field.split('.').reduce((obj, key) => obj?.[key], user);
    if (value !== undefined && value !== null && value !== '' &&
      (Array.isArray(value) ? value.length > 0 : true)) {
      completedFields++;
    }
  });

  return Math.round((completedFields / requiredFields.length) * 100);
}

// Helper function to get missing fields
function getMissingFields(user) {
  const requiredFields = [
    { field: 'licenseNumber', label: 'License Number' },
    { field: 'specialization', label: 'Specialization' },
    { field: 'hospital', label: 'Hospital/Clinic' },
    { field: 'bio', label: 'Bio/About' },
    { field: 'location.city', label: 'City' },
    { field: 'location.state', label: 'State' },
    { field: 'consultationFees.online', label: 'Online Consultation Fee' },
    { field: 'consultationFees.inPerson', label: 'In-Person Consultation Fee' },
    { field: 'languages', label: 'Languages Spoken' },
    { field: 'availability.workingDays', label: 'Working Days' }
  ];

  return requiredFields.filter(({ field }) => {
    const value = field.split('.').reduce((obj, key) => obj?.[key], user);
    return value === undefined || value === null || value === '' ||
      (Array.isArray(value) && value.length === 0);
  }).map(({ label }) => label);
}

// @desc    Upload document for doctor profile
// @route   POST /api/doctor/upload-document
// @access  Private (Doctor only)
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { type } = req.body;
    if (!type) {
      return res.status(400).json({ message: 'Document type is required' });
    }

    // Validate document type - match the User model enum values
    // User model expects: ['license', 'certificate', 'degree', 'other']
    const allowedTypes = ['license', 'certificate', 'degree', 'other'];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ message: 'Invalid document type' });
    }

    // Get Cloudinary URL from uploaded file
    const cloudinaryUrl = req.file.path;

    // Update user's documents array
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize documents array if it doesn't exist
    if (!user.documents) {
      user.documents = [];
    }

    // Remove existing document of the same type
    user.documents = user.documents.filter(doc => doc.type !== type);

    // Add new document
    user.documents.push({
      type,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Document`,
      fileName: req.file.originalname,
      fileUrl: cloudinaryUrl, // Use fileUrl as expected by the schema
      uploadedAt: new Date(),
      verified: false
    });

    await user.save();

    console.log(`Document uploaded successfully for user ${user._id}:`, {
      type,
      fileName: req.file.originalname,
      cloudinaryUrl
    });

    res.json({
      message: 'Document uploaded successfully',
      fileUrl: cloudinaryUrl, // Use fileUrl to match the schema
      fileName: req.file.originalname,
      type
    });
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get doctor's real-time availability and slots
// @route   GET /api/doctors/:id/availability
// @access  Public/Patient
export const getDoctorAvailability = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    console.log(`🔍 Fetching availability for doctor ${doctorId} on date: ${date}`);

    // Get doctor details
    const doctor = await User.findById(doctorId).select('-password');
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Get doctor's availability settings
    const { default: DoctorAvailability } = await import('../models/DoctorAvailability.js');
    const availability = await DoctorAvailability.findOne({ doctorId });

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: 'Doctor availability not configured'
      });
    }

    // Get target date (default to today if not specified)
    const targetDate = date ? new Date(date) : new Date();
    const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    // Check if doctor is working on the target date
    const daySchedule = availability.workingDays.find(day => day.day === dayName);
    const isWorkingToday = daySchedule?.isWorking || false;

    // Generate available slots for the target date
    let availableSlots = [];
    if (isWorkingToday) {
      availableSlots = availability.getAvailableSlots(targetDate);
    }

    // Check for existing appointments to mark slots as booked
    const { default: Appointment } = await import('../models/Appointment.js');
    const startOfDay = new Date(targetDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

    const existingAppointments = await Appointment.find({
      doctor: doctorId,
      scheduledDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['pending', 'confirmed', 'in-progress'] }
    }).populate('patient', 'firstName lastName');

    console.log(`🔍 Found ${existingAppointments.length} existing appointments for ${targetDate.toISOString().split('T')[0]}`);

    // Transform slots to include real-time status and check for bookings
    const transformedSlots = availableSlots.map((slot, index) => {
      // Check if this slot is booked
      const isBooked = existingAppointments.some(apt =>
        apt.startTime === slot.startTime || apt.startTime === slot.startTime + ':00'
      );

      const bookedAppointment = existingAppointments.find(apt =>
        apt.startTime === slot.startTime || apt.startTime === slot.startTime + ':00'
      );

      return {
        _id: `slot-${doctorId}-${targetDate.toISOString().split('T')[0]}-${index}`,
        doctorId: doctorId,
        startTime: new Date(`${targetDate.toISOString().split('T')[0]}T${slot.startTime}`).toISOString(),
        endTime: new Date(`${targetDate.toISOString().split('T')[0]}T${slot.endTime}`).toISOString(),
        isAvailable: !isBooked,
        isBooked: isBooked,
        consultationType: 'online', // Default to 'online' since backend only accepts 'online' or 'in-person'
        date: targetDate.toISOString().split('T')[0],
        realTimeStatus: isBooked ? 'unavailable' : 'available',
        bookedBy: bookedAppointment ? `${bookedAppointment.patient.firstName} ${bookedAppointment.patient.lastName}` : null
      };
    });

    // Check current time against working hours
    const now = new Date();
    const currentTime = now.toTimeString().split(' ')[0];
    const isCurrentlyWorking = isWorkingToday &&
      currentTime >= (daySchedule?.startTime || availability.defaultStartTime) &&
      currentTime <= (daySchedule?.endTime || availability.defaultEndTime);

    res.json({
      success: true,
      data: {
        doctor: {
          _id: doctor._id,
          name: `${doctor.firstName} ${doctor.lastName}`,
          specialization: doctor.specialization,
          profilePhoto: doctor.profilePhoto
        },
        availability: {
          isWorkingToday,
          isCurrentlyWorking,
          startTime: daySchedule?.startTime || availability.defaultStartTime,
          endTime: daySchedule?.endTime || availability.defaultEndTime,
          appointmentDuration: availability.appointmentDuration,
          workingDays: availability.workingDays.filter(day => day.isWorking).map(day => day.day),
          consultationTypes: ['online', 'in-person'], // Only valid values that match backend validation
          status: availability.status,
          isOnline: availability.isOnline
        },
        slots: transformedSlots,
        nextAvailableDate: isWorkingToday ? targetDate.toISOString().split('T')[0] : getNextWorkingDay(availability.workingDays)
      }
    });

  } catch (error) {
    console.error('❌ Error fetching doctor availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor availability',
      error: error.message
    });
  }
};

// Helper function to get next working day
const getNextWorkingDay = (workingDays) => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = new Date();

  for (let i = 1; i <= 7; i++) {
    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + i);
    const dayName = days[nextDay.getDay()];

    if (workingDays.includes(dayName)) {
      return nextDay.toISOString().split('T')[0];
    }
  }

  return null;
};

// @desc    Get doctor's patients (from appointments)
// @route   GET /api/doctor/patients
// @access  Private (Doctor only)
export const getDoctorPatients = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { search, status } = req.query;

    console.log(`🔍 Fetching patients for doctor ${doctorId}`);

    // Import Appointment model
    const { default: Appointment } = await import('../models/Appointment.js');

    // Find all appointments for this doctor
    let appointmentQuery = { doctor: doctorId };

    const appointments = await Appointment.find(appointmentQuery)
      .populate('patient', 'firstName lastName email phone profileImage _id dateOfBirth primaryDiagnosis secondaryDiagnosis vitalSigns')
      .sort({ scheduledDate: -1 })
      .lean();

    console.log(`✅ Found ${appointments.length} appointments for doctor`);

    // Get unique patients with their appointment info
    const patientMap = new Map();

    for (const apt of appointments) {
      if (!apt.patient) continue;

      const patientId = apt.patient._id.toString();

      if (!patientMap.has(patientId)) {
        patientMap.set(patientId, {
          _id: apt.patient._id,
          firstName: apt.patient.firstName,
          lastName: apt.patient.lastName,
          email: apt.patient.email,
          phone: apt.patient.phone,
          profileImage: apt.patient.profileImage,
          dateOfBirth: apt.patient.dateOfBirth,
          primaryDiagnosis: apt.patient.primaryDiagnosis,
          secondaryDiagnosis: apt.patient.secondaryDiagnosis,
          latestVitals: apt.patient.vitalSigns && apt.patient.vitalSigns.length > 0
            ? apt.patient.vitalSigns.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]
            : null,
          lastAppointment: apt.scheduledDate,
          totalAppointments: 1,
          status: 'active' // Default status
        });
      } else {
        const existing = patientMap.get(patientId);
        existing.totalAppointments += 1;
        // Keep the most recent appointment date
        if (new Date(apt.scheduledDate) > new Date(existing.lastAppointment)) {
          existing.lastAppointment = apt.scheduledDate;
        }
      }
    }

    let patients = Array.from(patientMap.values());

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      patients = patients.filter(p =>
        p.firstName?.toLowerCase().includes(searchLower) ||
        p.lastName?.toLowerCase().includes(searchLower) ||
        p.email?.toLowerCase().includes(searchLower) ||
        p._id.toString().includes(searchLower)
      );
    }

    // Apply status filter
    if (status && status !== 'all') {
      patients = patients.filter(p => p.status === status);
    }

    // Get last proof for each patient
    for (const patient of patients) {
      try {
        const lastProof = await Proof.findOne({
          patient: patient._id
        })
          .sort({ createdAt: -1 })
          .select('createdAt')
          .lean();

        patient.lastProof = lastProof ? lastProof.createdAt : null;
      } catch (error) {
        console.error(`Error fetching proof for patient ${patient._id}:`, error);
        patient.lastProof = null;
      }
    }

    console.log(`🎯 Returning ${patients.length} unique patients`);

    res.json({
      success: true,
      count: patients.length,
      patients
    });

  } catch (error) {
    console.error('❌ Error fetching doctor patients:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patients',
      error: error.message
    });
  }
};

// @desc    Search for a patient by ID or email (doctor's patients only)
// @route   GET /api/doctor/search-patient
// @access  Private (Doctor only)
export const searchDoctorPatient = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    console.log(`🔍 Searching for patient with query: ${query}`);

    // Import Appointment model
    const { default: Appointment } = await import('../models/Appointment.js');
    const mongoose = await import('mongoose');

    // Search for patient by email or ID
    let searchQuery = {
      role: 'patient',
      $or: [
        { email: query.toLowerCase() }
      ]
    };

    // Add ID search if query is a valid ObjectId
    if (mongoose.default.Types.ObjectId.isValid(query)) {
      searchQuery.$or.push({ _id: query });
    }

    const patient = await User.findOne(searchQuery)
      .select('firstName lastName email phone profileImage _id')
      .lean();

    if (!patient) {
      return res.json({
        success: true,
        found: false,
        message: 'Patient not found'
      });
    }

    console.log(`✅ Found patient: ${patient.firstName} ${patient.lastName}`);

    // Verify this doctor has treated this patient
    const hasAppointment = await Appointment.findOne({
      doctor: doctorId,
      patient: patient._id
    }).lean();

    if (!hasAppointment) {
      return res.json({
        success: true,
        found: false,
        message: 'Patient not found in your records',
        note: 'This patient has not had any appointments with you'
      });
    }

    // Get appointment history count
    const appointmentCount = await Appointment.countDocuments({
      doctor: doctorId,
      patient: patient._id
    });

    console.log(`✅ Patient has ${appointmentCount} appointments with this doctor`);

    res.json({
      success: true,
      found: true,
      patient: {
        _id: patient._id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        phone: patient.phone,
        profileImage: patient.profileImage,
        hasAppointmentHistory: true,
        totalAppointments: appointmentCount
      }
    });

  } catch (error) {
    console.error('❌ Error searching for patient:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search for patient',
      error: error.message
    });
  }
}

// @desc    Get patient health analytics (vitals history)
// @route   GET /api/doctor/patients/:id/analytics
// @access  Private (Doctor only)
export const getPatientHealthAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    // Import Patient model
    const { default: Patient } = await import('../models/Patient.js');

    // 1. First find the user to get their email
    const user = await User.findById(id);
    let patient = null;

    if (user) {
      console.log(`🔍 Resolving patient record for user: ${user.email} (ID: ${id})`);
      // 2. Find patient clinical record by email
      patient = await Patient.findOne({ email: user.email });
    }

    // 3. Fallbacks if user not found or email lookup failed
    if (!patient) {
      console.log(`⚠️ Email lookup failed, trying direct ID lookups for: ${id}`);
      patient = await Patient.findById(id);
      if (!patient) {
        patient = await Patient.findOne({ patientId: id });
      }
    }

    if (!patient) {
      console.error(`❌ Patient analytics error: Patient not found for ID ${id}`);
      return res.status(404).json({
        success: false,
        message: 'Patient clinical record not found'
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
        email: patient.email,
        phone: patient.phone,
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