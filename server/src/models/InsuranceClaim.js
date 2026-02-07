import mongoose from 'mongoose';

const insuranceClaimSchema = new mongoose.Schema({
  // Basic Information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  claimNumber: {
    type: String,
    unique: true,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'pending', 'approved', 'rejected'],
    default: 'draft'
  },
  
  // Personal Information
  personalInfo: {
    firstName: String,
    lastName: String,
    dateOfBirth: Date,
    ssn: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    zipCode: String
  },

  // Employment Information
  employmentInfo: {
    employer: String,
    jobTitle: String,
    employmentStatus: {
      type: String,
      enum: ['full-time', 'part-time', 'self-employed', 'unemployed', 'retired', 'student']
    },
    annualIncome: Number
  },

  // Health Information
  healthInfo: {
    height: Number,
    weight: Number,
    tobaccoUse: {
      type: String,
      enum: ['never', 'former', 'current']
    },
    preExistingConditions: String,
    currentMedications: String,
    familyHistory: String
  },

  // Coverage Information
  coverageInfo: {
    startDate: Date,
    coverageAmount: Number,
    selectedPlan: {
      type: String,
      required: true
    },
    riders: [String]
  },

  // Dependents
  dependents: [{
    firstName: String,
    lastName: String,
    dateOfBirth: Date,
    relationship: {
      type: String,
      enum: ['spouse', 'child', 'stepchild', 'adopted', 'foster', 'domestic-partner']
    },
    ssn: String
  }],

  // Documents
  documents: [{
    name: String,
    type: String,
    cloudinaryId: String,
    cloudinaryUrl: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'verified'],
      default: 'pending'
    }
  }],

  // Review Information
  reviewInfo: {
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    reviewNotes: String,
    approvedAmount: Number
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  submittedAt: Date,

  // Draft Information
  isDraft: {
    type: Boolean,
    default: true
  },
  lastSavedAt: {
    type: Date,
    default: Date.now
  }
});

// Generate unique claim number before saving
insuranceClaimSchema.pre('save', async function(next) {
  if (!this.claimNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.claimNumber = `CLM${year}${month}${random}`;
  }
  this.updatedAt = new Date();
  next();
});

const InsuranceClaim = mongoose.model('InsuranceClaim', insuranceClaimSchema);
export default InsuranceClaim; 