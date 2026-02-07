import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    unique: true,
    sparse: true // Allows null/undefined values for non-patients
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'hospital', 'insurance', 'researcher', 'admin', 'bloodbank', 'pharmacy', 'bioaura', 'nurse'],
    required: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: function () { return this.role === 'patient'; }
  },
  phone: {
    type: String,
    trim: true
  },

  // Personal Information
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'Prefer not to say']
  },
  maritalStatus: {
    type: String,
    enum: ['Single', 'Married', 'Divorced', 'Widowed', 'Separated']
  },

  // Address Information
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'United States'
    }
  },

  // Doctor specific fields
  licenseNumber: {
    type: String,
    required: function () { return this.role === 'doctor' || this.role === 'hospital' || this.role === 'nurse'; }
  },
  specialization: {
    type: String,
    required: function () { return this.role === 'doctor'; }
  },
  hospital: {
    type: String,
    required: function () { return this.role === 'doctor' || this.role === 'nurse'; }
  },
  department: {
    type: String,
    trim: true
  },
  yearsOfExperience: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    trim: true
  },
  organization: {
    type: String,
    trim: true
  },
  experience: {
    type: Number,
    min: 0
  },

  // Hospital specific fields
  hospitalName: {
    type: String,
    required: function () { return this.role === 'hospital'; },
    trim: true
  },
  hospitalType: {
    type: String,
    required: function () { return this.role === 'hospital'; },
    enum: ['General Hospital', 'Specialty Hospital', 'Teaching Hospital', 'Research Hospital', 'Private Hospital', 'Public Hospital', 'Emergency Hospital', 'Rehabilitation Hospital']
  },
  registrationNumber: {
    type: String,
    trim: true
  },
  establishmentDate: {
    type: Date
  },
  website: {
    type: String,
    trim: true
  },
  emergencyContact: {
    type: String,
    trim: true
  },
  emergencyPhone: {
    type: String,
    trim: true
  },
  ambulancePhone: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  mission: {
    type: String,
    trim: true
  },
  vision: {
    type: String,
    trim: true
  },
  facilities: [{ type: String, trim: true }],
  services: [{ type: String, trim: true }],
  totalBeds: {
    type: Number,
    min: 0
  },
  icuBeds: {
    type: Number,
    min: 0
  },
  emergencyBeds: {
    type: Number,
    min: 0
  },
  operatingRooms: {
    type: Number,
    min: 0
  },
  departments: {
    type: Number,
    min: 0
  },
  staffCount: {
    type: Number,
    min: 0
  },
  operatingHours: {
    startTime: { type: String, default: '08:00' },
    endTime: { type: String, default: '20:00' },
    emergency24x7: { type: Boolean, default: true }
  },
  workingDays: [{ type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] }],
  accreditations: [{ type: String, trim: true }],
  certifications: [{ type: String, trim: true }],
  qualityStandards: [{ type: String, trim: true }],
  insuranceAccepted: [{ type: String, trim: true }],
  paymentMethods: [{ type: String, trim: true }],
  emergencyServices: {
    traumaCenter: { type: Boolean, default: false },
    strokeCenter: { type: Boolean, default: false },
    heartCenter: { type: Boolean, default: false },
    burnUnit: { type: Boolean, default: false },
    neonatalICU: { type: Boolean, default: false },
    pediatricICU: { type: Boolean, default: false },
    ambulanceService: { type: Boolean, default: false },
    helicopterService: { type: Boolean, default: false }
  },
  technology: {
    mri: { type: Boolean, default: false },
    ctScan: { type: Boolean, default: false },
    xray: { type: Boolean, default: false },
    ultrasound: { type: Boolean, default: false },
    endoscopy: { type: Boolean, default: false },
    laparoscopy: { type: Boolean, default: false },
    roboticSurgery: { type: Boolean, default: false },
    telemedicine: { type: Boolean, default: false }
  },
  medicalStaff: {
    doctors: { type: Number, min: 0, default: 0 },
    nurses: { type: Number, min: 0, default: 0 },
    specialists: { type: Number, min: 0, default: 0 },
    technicians: { type: Number, min: 0, default: 0 },
    supportStaff: { type: Number, min: 0, default: 0 }
  },

  // Pharmacy specific fields
  pharmacyName: {
    type: String,
    required: function () { return this.role === 'pharmacy'; },
    trim: true
  },
  pharmacyLicense: {
    type: String,
    required: function () { return this.role === 'pharmacy'; },
    trim: true
  },
  pharmacyType: {
    type: String,
    enum: ['Retail Pharmacy', 'Hospital Pharmacy', 'Online Pharmacy'],
    default: 'Retail Pharmacy'
  },

  // Blood Bank specific fields
  bloodBankName: {
    type: String,
    required: function () { return this.role === 'bloodbank'; },
    trim: true
  },
  bloodBankType: {
    type: String,
    required: function () { return this.role === 'bloodbank'; },
    enum: ['Hospital Blood Bank', 'Standalone Blood Bank', 'Mobile Blood Bank', 'Regional Blood Center', 'National Blood Center']
  },
  bloodBankLicense: {
    type: String,
    required: function () { return this.role === 'bloodbank'; },
    trim: true
  },
  bloodBankRegistration: {
    type: String,
    trim: true
  },
  bloodBankEstablishment: {
    type: Date
  },
  bloodBankWebsite: {
    type: String,
    trim: true
  },
  bloodBankDescription: {
    type: String,
    trim: true
  },
  bloodBankMission: {
    type: String,
    trim: true
  },
  bloodBankVision: {
    type: String,
    trim: true
  },
  bloodBankFacilities: [{ type: String, trim: true }],
  bloodBankServices: [{ type: String, trim: true }],
  bloodBankCapacity: {
    totalUnits: { type: Number, min: 0, default: 0 },
    refrigeratedUnits: { type: Number, min: 0, default: 0 },
    frozenUnits: { type: Number, min: 0, default: 0 },
    plateletUnits: { type: Number, min: 0, default: 0 },
    plasmaUnits: { type: Number, min: 0, default: 0 }
  },
  bloodBankStaff: {
    medicalOfficers: { type: Number, min: 0, default: 0 },
    technicians: { type: Number, min: 0, default: 0 },
    nurses: { type: Number, min: 0, default: 0 },
    supportStaff: { type: Number, min: 0, default: 0 }
  },
  bloodBankOperatingHours: {
    startTime: { type: String, default: '08:00' },
    endTime: { type: String, default: '20:00' },
    emergency24x7: { type: Boolean, default: true }
  },
  bloodBankWorkingDays: [{ type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] }],
  bloodBankAccreditations: [{ type: String, trim: true }],
  bloodBankCertifications: [{ type: String, trim: true }],
  bloodBankQualityStandards: [{ type: String, trim: true }],
  bloodBankTestingCapabilities: {
    bloodGrouping: { type: Boolean, default: true },
    crossMatching: { type: Boolean, default: true },
    infectiousDiseaseTesting: { type: Boolean, default: true },
    compatibilityTesting: { type: Boolean, default: true },
    antibodyScreening: { type: Boolean, default: true },
    dnaTesting: { type: Boolean, default: false },
    rareBloodTypeTesting: { type: Boolean, default: false }
  },
  bloodBankEmergencyServices: {
    emergencyBloodSupply: { type: Boolean, default: true },
    traumaCenterSupport: { type: Boolean, default: true },
    disasterResponse: { type: Boolean, default: true },
    helicopterService: { type: Boolean, default: false }
  },
  bloodBankTechnology: {
    automatedTesting: { type: Boolean, default: false },
    barcodeSystem: { type: Boolean, default: true },
    inventoryManagement: { type: Boolean, default: true },
    qualityControl: { type: Boolean, default: true },
    donorManagement: { type: Boolean, default: true },
    bloodTracking: { type: Boolean, default: true }
  },

  // Ambulance services
  ambulanceServices: {
    available: { type: Boolean, default: false },
    fleetSize: { type: Number, min: 0, default: 0 },
    responseTime: { type: String, trim: true },
    coverageArea: { type: String, trim: true },
    specialEquipment: [{ type: String, trim: true }]
  },
  profileCompleted: {
    type: Boolean,
    default: false
  },
  profileCompletedAt: {
    type: Date
  },
  // Enhanced doctor fields for profile completion
  languages: [{ type: String, trim: true }],
  consultationFees: {
    online: {
      type: Number,
      min: 0,
      required: function () { return this.role === 'doctor'; },
      validate: {
        validator: function (v) {
          if (this.role === 'doctor') {
            return v > 0; // Doctors must have consultation fees > 0
          }
          return true;
        },
        message: 'Doctors must set consultation fees greater than 0'
      }
    },
    inPerson: {
      type: Number,
      min: 0,
      required: function () { return this.role === 'doctor'; },
      validate: {
        validator: function (v) {
          if (this.role === 'doctor') {
            return v > 0; // Doctors must have consultation fees > 0
          }
          return true;
        },
        message: 'Doctors must set consultation fees greater than 0'
      }
    }
  },
  availability: {
    workingDays: [{ type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] }],
    startTime: { type: String, default: '09:00' },
    endTime: { type: String, default: '17:00' },
    appointmentDuration: { type: Number, default: 30 }, // in minutes
    lunchBreakStart: { type: String, default: '12:00' },
    lunchBreakEnd: { type: String, default: '13:00' }
  },
  ratings: {
    average: { type: Number, min: 0, max: 5, default: 0 },
    count: { type: Number, min: 0, default: 0 }
  },
  // New doctor fields
  location: {
    lat: { type: Number },
    lng: { type: Number },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    pincode: { type: String, trim: true },
    address: {
      type: mongoose.Schema.Types.Mixed, // Allow both string and object
      trim: true
    }
  },
  specialties: [{ type: String, trim: true }],
  emergencyAvailable: { type: Boolean, default: false },
  // Documents for verification
  documents: [{
    type: { type: String, enum: ['license', 'certificate', 'degree', 'registration', 'accreditation', 'insurance', 'fire', 'hygiene', 'equipment', 'staff', 'other', 'quality', 'safety', 'infection', 'emergency', 'pharmacy', 'laboratory', 'radiology', 'bloodbank', 'ambulance', 'biohazard', 'radiation', 'cyber', 'privacy', 'disaster', 'staffing'] },
    title: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    verified: { type: Boolean, default: false }
  }],

  // Patient specific fields
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  // Saved doctors (for patients)
  savedDoctors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // Medical Information
  height: {
    type: Number, // in cm
    min: 0
  },
  weight: {
    type: Number, // in kg
    min: 0
  },
  allergies: {
    type: String,
    trim: true
  },
  currentMedications: {
    type: String,
    trim: true
  },
  medicalConditions: {
    type: String,
    trim: true
  },
  surgeries: {
    type: String,
    trim: true
  },

  // Emergency Contacts (Array of contacts)
  emergencyContacts: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    relationship: {
      type: String,
      required: false,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    // Extended fields to match frontend UI
    type: {
      type: String,
      enum: ['emergency', 'doctor', 'family', 'hospital', 'pharmacy', 'insurance'],
      default: 'family'
    },
    notes: { type: String, trim: true },
    address: { type: String, trim: true },
    availability: { type: String, trim: true },
    specialty: { type: String, trim: true },
    isFavorite: { type: Boolean, default: false },
    isEmergency: { type: Boolean, default: false },
    lastContacted: { type: Date },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],

  // Insurance Information
  insurance: {
    provider: {
      type: String,
      trim: true
    },
    policyNumber: {
      type: String,
      trim: true
    },
    groupNumber: {
      type: String,
      trim: true
    },
    primaryHolder: {
      type: String,
      trim: true
    }
  },

  // Communication Preferences
  preferences: {
    preferredLanguage: {
      type: String,
      enum: ['English', 'Spanish', 'French', 'German', 'Chinese'],
      default: 'English'
    },
    preferredContactMethod: {
      type: String,
      enum: ['Email', 'Phone', 'SMS'],
      default: 'Email'
    },
    allowResearchParticipation: {
      type: Boolean,
      default: false
    },
    allowMarketingEmails: {
      type: Boolean,
      default: false
    },
    emergencyNotifications: {
      type: Boolean,
      default: true
    }
  },

  // Profile completion status
  profileComplete: {
    type: Boolean,
    default: false
  },

  // Common fields
  profileImage: {
    url: { type: String, default: null },
    publicId: { type: String, default: null },
    uploadedAt: { type: Date, default: null }
  },
  // Doctor settings fields
  scheduleSettings: {
    workingDays: { type: [String], default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] },
    startTime: { type: String, default: '09:00' },
    endTime: { type: String, default: '17:00' },
    appointmentDuration: { type: String, default: '30' },
    lunchBreakStart: { type: String, default: '12:00' },
    lunchBreakEnd: { type: String, default: '13:00' }
  },
  notificationSettings: {
    newPatientRequests: { type: Boolean, default: true },
    appointmentReminders: { type: Boolean, default: true },
    proofRequests: { type: Boolean, default: true },
    emergencyAlerts: { type: Boolean, default: true },
    weeklyReports: { type: Boolean, default: false }
  },
  privacySettings: {
    profileVisibility: { type: String, enum: ['public', 'private'], default: 'public' },
    allowPatientMessages: { type: Boolean, default: true },
    shareResearchData: { type: Boolean, default: false },
    allowPeerConsultation: { type: Boolean, default: true }
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    default: null
  },
  emailVerificationExpires: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: {
    type: String,
    default: null
  },
  backupCodes: [{
    type: String,
    default: null
  }],
  isFullyActivated: {
    type: Boolean,
    default: false
  },
  mfaEnabled: {
    type: Boolean,
    default: false
  },
  mfaSecret: {
    type: String,
    default: null
  },
  // WebAuthn credentials for biometric authentication
  webauthnCredentials: [
    {
      credentialID: { type: String, required: true },
      publicKey: { type: String, required: true },
      transports: [String],
      counter: { type: Number, default: 0 },
      deviceType: { type: String }, // e.g., 'singleDevice', 'multiDevice'
      backedUp: { type: Boolean },
      credentialDeviceType: { type: String },
      createdAt: { type: Date, default: Date.now }
    }
  ]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Validate consultation fees for doctors
userSchema.pre('save', function (next) {
  if (this.role === 'doctor' && this.isModified('consultationFees')) {
    // Ensure consultation fees are set and valid for doctors
    if (!this.consultationFees?.online || this.consultationFees.online <= 0) {
      return next(new Error('Doctors must set online consultation fees greater than 0'));
    }
    if (!this.consultationFees?.inPerson || this.consultationFees.inPerson <= 0) {
      return next(new Error('Doctors must set in-person consultation fees greater than 0'));
    }
  }
  next();
});

// Generate patient ID after saving for patient users
userSchema.post('save', async function (doc) {
  // Only set patient ID for patient users who don't have one
  if (doc.role === 'patient' && !doc.patientId) {
    try {
      // Set patient ID to be the same as the user's ObjectId
      doc.patientId = doc._id;
      await doc.save();
      console.log(`Generated patient ID: ${doc.patientId} for user: ${doc.email}`);
    } catch (error) {
      console.error('Error generating patient ID:', error);
    }
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get full name
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Set consultation fees with validation
userSchema.methods.setConsultationFees = function (onlineFee, inPersonFee) {
  if (this.role !== 'doctor') {
    throw new Error('Only doctors can set consultation fees');
  }

  if (!onlineFee || onlineFee <= 0) {
    throw new Error('Online consultation fee must be greater than 0');
  }

  if (!inPersonFee || inPersonFee <= 0) {
    throw new Error('In-person consultation fee must be greater than 0');
  }

  this.consultationFees = {
    online: Math.round(onlineFee),
    inPerson: Math.round(inPersonFee)
  };

  return this;
};

// Get consultation fees with validation
userSchema.methods.getConsultationFees = function () {
  if (this.role !== 'doctor') {
    throw new Error('Only doctors have consultation fees');
  }

  if (!this.consultationFees?.online || !this.consultationFees?.inPerson) {
    throw new Error('Consultation fees not properly set. Please complete your profile.');
  }

  return {
    online: this.consultationFees.online,
    inPerson: this.consultationFees.inPerson
  };
};

// Check if doctor profile is complete
userSchema.methods.isDoctorProfileComplete = function () {
  if (this.role !== 'doctor') return false;

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

  return requiredFields.every(field => {
    const value = field.split('.').reduce((obj, key) => obj?.[key], this);
    return value !== undefined && value !== null && value !== '';
  });
};

// Check if insurance profile is complete
userSchema.methods.isInsuranceProfileComplete = function () {
  if (this.role !== 'insurance') return false;

  const requiredFields = [
    'organization',
    'bio',
    'location.city',
    'location.state'
  ];

  return requiredFields.every(field => {
    const value = field.split('.').reduce((obj, key) => obj?.[key], this);
    return value !== undefined && value !== null && value !== '';
  });
};

// Check if researcher profile is complete
userSchema.methods.isResearcherProfileComplete = function () {
  if (this.role !== 'researcher') return false;

  const requiredFields = [
    'organization',
    'bio',
    'location.city',
    'location.state'
  ];

  return requiredFields.every(field => {
    const value = field.split('.').reduce((obj, key) => obj?.[key], this);
    return value !== undefined && value !== null && value !== '';
  });
};

// Check if hospital profile is complete
userSchema.methods.isHospitalProfileComplete = function () {
  if (this.role !== 'hospital') return false;

  const requiredFields = [
    'hospitalName',
    'hospitalType',
    'licenseNumber',
    'address.city',
    'address.state',
    'phone',
    'emergencyContact'
  ];

  return requiredFields.every(field => {
    const value = field.split('.').reduce((obj, key) => obj?.[key], this);
    return value !== undefined && value !== null && value !== '';
  });
};

// Check if bloodbank profile is complete
userSchema.methods.isBloodBankProfileComplete = function () {
  if (this.role !== 'bloodbank') return false;

  const requiredFields = [
    'bloodBankName',
    'bloodBankType',
    'bloodBankLicense',
    'address.city',
    'address.state',
    'phone',
    'emergencyContact'
  ];

  return requiredFields.every(field => {
    const value = field.split('.').reduce((obj, key) => obj?.[key], this);
    return value !== undefined && value !== null && value !== '';
  });
};

// Check if profile is complete based on role
userSchema.methods.isProfileComplete = function () {
  switch (this.role) {
    case 'doctor':
      return this.isDoctorProfileComplete();
    case 'hospital':
      return this.isHospitalProfileComplete();
    case 'insurance':
      return this.isInsuranceProfileComplete();
    case 'researcher':
      return this.isResearcherProfileComplete();
    case 'bloodbank':
      return this.isBloodBankProfileComplete();
    case 'pharmacy':
      return !!(this.pharmacyName && this.pharmacyLicense && this.address?.city && this.address?.state && this.phone);
    case 'bioaura':
      return !!(this.organization && this.licenseNumber);
    case 'patient':
      return true; // Patients don't have specific profile completion requirements
    case 'admin':
      return true; // Admins don't have specific profile completion requirements
    default:
      return false;
  }
};

// Ensure virtual fields are serialized
userSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.password;
    return ret;
  }
});

const User = mongoose.model('User', userSchema);

export default User; 