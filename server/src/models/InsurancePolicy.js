import mongoose from 'mongoose';

const policyDocumentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  cloudinaryId: String,
  documentType: {
    type: String,
    enum: ['policy_document', 'terms_conditions', 'coverage_details', 'claim_procedures', 'network_providers', 'other'],
    default: 'policy_document'
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'expired'],
    default: 'active'
  }
});

const networkProviderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Hospital', 'Clinic', 'Laboratory', 'Pharmacy', 'Other'],
    required: true
  },
  location: {
    address: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  contact: {
    phone: String,
    email: String,
    website: String
  }
});

const coverageServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  coveragePercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  limits: String,
  waitingPeriod: Number
});

const coverageDetailsSchema = new mongoose.Schema({
  services: [coverageServiceSchema],
  exclusions: [String],
  networkType: {
    type: String,
    enum: ['PPO', 'HMO', 'EPO', 'POS', 'HDHP', 'Other'],
    default: 'PPO'
  }
});

const eligibilityCriteriaSchema = new mongoose.Schema({
  minAge: {
    type: Number,
    default: 0,
    min: 0
  },
  maxAge: {
    type: Number,
    default: 100,
    min: 0
  },
  preExistingConditions: {
    type: Boolean,
    default: false
  },
  waitingPeriod: {
    type: Number,
    default: 0,
    min: 0
  },
  requiredDocuments: [String]
});

const premiumSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  frequency: {
    type: String,
    enum: ['monthly', 'quarterly', 'semi-annual', 'annual'],
    default: 'monthly'
  },
  nextDueDate: Date
});

const insurancePolicySchema = new mongoose.Schema({
  policyNumber: {
    type: String,
    required: true
  },
  policyName: {
    type: String,
    required: true
  },
  policyType: {
    type: String,
    enum: ['Health', 'Dental', 'Vision', 'Life', 'Disability', 'Travel', 'Critical Illness', 'Accident', 'Auto'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  coverageAmount: {
    type: Number,
    required: true,
    min: 0
  },
  deductible: {
    type: Number,
    required: true,
    min: 0
  },
  coinsurance: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  copay: {
    type: Number,
    required: true,
    min: 0
  },
  outOfPocketMax: {
    type: Number,
    required: true,
    min: 0
  },
  premium: {
    type: premiumSchema,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  renewalDate: Date,
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive', 'expired', 'cancelled', 'pending_approval'],
    default: 'active'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  availableForNewEnrollments: {
    type: Boolean,
    default: true
  },
  eligibilityCriteria: {
    type: eligibilityCriteriaSchema,
    default: () => ({})
  },
  coverageDetails: {
    type: coverageDetailsSchema,
    default: () => ({})
  },
  networkProviders: [networkProviderSchema],
  documents: [policyDocumentSchema],
  tags: [String],
  notes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalDate: Date,
  enrollmentCount: {
    type: Number,
    default: 0,
    min: 0
  },
  claimCount: {
    type: Number,
    default: 0,
    min: 0
  },
  averageClaimAmount: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Virtual for policy age
insurancePolicySchema.virtual('policyAge').get(function() {
  if (!this.createdAt) return 0;
  const now = new Date();
  const created = new Date(this.createdAt);
  return Math.floor((now - created) / (1000 * 60 * 60 * 24));
});

// Virtual for remaining days
insurancePolicySchema.virtual('remainingDays').get(function() {
  if (!this.endDate) return null;
  const now = new Date();
  const end = new Date(this.endDate);
  const diff = end - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Virtual for utilization rate
insurancePolicySchema.virtual('utilizationRate').get(function() {
  if (this.enrollmentCount === 0) return 0;
  return (this.claimCount / this.enrollmentCount) * 100;
});

// Indexes
insurancePolicySchema.index({ status: 1 });
insurancePolicySchema.index({ policyType: 1 });
insurancePolicySchema.index({ createdBy: 1 });
insurancePolicySchema.index({ createdAt: -1 });

// Pre-save middleware to generate policy number if not provided
insurancePolicySchema.pre('save', function(next) {
  if (!this.policyNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.policyNumber = `POL${year}${month}${random}`;
  }
  next();
});

const InsurancePolicy = mongoose.model('InsurancePolicy', insurancePolicySchema);

export default InsurancePolicy; 