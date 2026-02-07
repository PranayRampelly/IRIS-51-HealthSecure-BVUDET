import mongoose from 'mongoose';

const admissionRequestSchema = new mongoose.Schema({
  // Request identification
  requestNumber: {
    type: String,
    unique: true
  },

  // Patient information
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Hospital information
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Admission details
  admissionType: {
    type: String,
    enum: ['emergency', 'elective', 'transfer', 'day-care'],
    required: true
  },
  department: {
    type: String,
    required: true
  },

  // Medical information
  primaryDiagnosis: {
    type: String,
    required: true
  },
  secondaryDiagnosis: String,
  symptoms: [String],
  allergies: [String],
  currentMedications: [String],

  // Urgency and timing
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  expectedStay: {
    type: Number,
    required: true,
    min: 1
  },
  preferredAdmissionDate: Date,

  // Room and bed preferences
  roomPreference: {
    type: String,
    enum: ['general', 'semi-private', 'private', 'icu'],
    default: 'general'
  },
  specialRequirements: String,

  // Insurance information
  insuranceProvider: String,
  policyNumber: String,

  // Emergency contact
  emergencyContact: {
    name: {
      type: String,
      required: true
    },
    relationship: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    email: String
  },

  // Additional information
  notes: String,

  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }],

  // Review information
  reviewNotes: String,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,

  // Assignment information (after approval)
  assignedDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedRoom: String,
  assignedBed: String,
  estimatedAdmissionDate: Date,

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Generate request number
admissionRequestSchema.pre('save', async function (next) {
  if (this.isNew && !this.requestNumber) {
    // Generate a unique request number using timestamp and random component
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.requestNumber = `AR${timestamp}${random}`;
  }
  this.updatedAt = new Date();
  next();
});

// Add status to history when status changes
admissionRequestSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      updatedBy: this.reviewedBy || this.patient
    });
  }
  next();
});

const AdmissionRequest = mongoose.model('AdmissionRequest', admissionRequestSchema);

export default AdmissionRequest; 