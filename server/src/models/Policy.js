import mongoose from 'mongoose';

const policySchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  policyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InsurancePolicy',
    required: true
  },
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InsuranceApplication',
    required: true
  },
  policyNumber: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired', 'cancelled'],
    default: 'active'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  premium: {
    amount: {
      type: Number,
      required: true
    },
    frequency: {
      type: String,
      enum: ['monthly', 'quarterly', 'annual'],
      default: 'monthly'
    }
  },
  coverageAmount: {
    type: Number,
    required: true
  },
  deductible: {
    type: Number,
    default: 0
  },
  coinsurance: {
    type: Number,
    default: 0
  },
  copay: {
    type: Number,
    default: 0
  },
  outOfPocketMax: {
    type: Number,
    default: 0
  },
  usedAmount: {
    type: Number,
    default: 0
  },
  remainingAmount: {
    type: Number,
    required: true
  },
  policyName: {
    type: String,
    required: true
  },
  policyType: {
    type: String,
    enum: ['Health', 'Dental', 'Vision', 'Life', 'Disability', 'Auto'],
    required: true
  },
  insuranceCompany: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  documents: [{
    name: String,
    url: String,
    type: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  notes: {
    type: String
  },
  lastPaymentDate: {
    type: Date
  },
  nextPaymentDate: {
    type: Date
  },
  autoRenew: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
policySchema.index({ patientId: 1, status: 1 });
policySchema.index({ policyNumber: 1 });
policySchema.index({ applicationId: 1 });

// Virtual for calculating utilization percentage
policySchema.virtual('utilizationPercentage').get(function() {
  if (this.coverageAmount === 0) return 0;
  return Math.round((this.usedAmount / this.coverageAmount) * 100);
});

// Method to update used amount
policySchema.methods.updateUsedAmount = function(amount) {
  this.usedAmount += amount;
  this.remainingAmount = Math.max(0, this.coverageAmount - this.usedAmount);
  return this.save();
};

// Method to check if policy is active
policySchema.methods.isActive = function() {
  const now = new Date();
  return this.status === 'active' && 
         this.startDate <= now && 
         this.endDate >= now;
};

const Policy = mongoose.model('Policy', policySchema);

export default Policy; 