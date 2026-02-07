import mongoose from 'mongoose';

const proofRequestSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['medical', 'financial', 'identity', 'employment', 'insurance', 'other']
  },
  priority: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'in_progress', 'fulfilled', 'rejected', 'expired'],
    default: 'pending'
  },

  // Request Details
  requestType: {
    type: String,
    required: true,
    enum: ['document', 'verification', 'certification', 'statement', 'other']
  },
  requiredDocuments: [{
    type: String,
    required: true
  }],
  customFields: [{
    name: String,
    type: {
      type: String,
      enum: ['text', 'number', 'date', 'file', 'select']
    },
    required: Boolean,
    options: [String], // For select type
    value: mongoose.Schema.Types.Mixed
  }],

  // Parties Involved
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Insurance Specific Fields
  insurancePolicy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InsurancePolicy'
  },
  claimId: {
    type: String,
    trim: true
  },
  policyNumber: {
    type: String,
    trim: true
  },

  // Timeline
  requestedAt: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  fulfilledAt: {
    type: Date
  },
  expiresAt: {
    type: Date
  },

  // Attachments and Files
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String,
    cloudinaryId: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],

  // Communication
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    isInternal: {
      type: Boolean,
      default: false
    }
  }],

  // Validation and Verification
  validationStatus: {
    type: String,
    enum: ['pending', 'validated', 'failed', 'manual_review'],
    default: 'pending'
  },
  validationDetails: {
    validatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    validatedAt: Date,
    validationNotes: String,
    validationScore: Number
  },

  // Security and Access Control
  accessLevel: {
    type: String,
    enum: ['public', 'restricted', 'confidential', 'secret'],
    default: 'restricted'
  },
  allowedViewers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // Metadata
  tags: [String],
  notes: String,
  internalNotes: String,

  // Audit Trail
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
proofRequestSchema.index({ requester: 1, status: 1 });
proofRequestSchema.index({ provider: 1, status: 1 });
proofRequestSchema.index({ dueDate: 1 });
proofRequestSchema.index({ category: 1, priority: 1 });
proofRequestSchema.index({ insurancePolicy: 1 });
proofRequestSchema.index({ createdAt: -1 });

// Virtual for time remaining
proofRequestSchema.virtual('timeRemaining').get(function() {
  if (!this.dueDate) return null;
  const now = new Date();
  const due = new Date(this.dueDate);
  return Math.max(0, due.getTime() - now.getTime());
});

// Virtual for isOverdue
proofRequestSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate || this.status === 'fulfilled' || this.status === 'rejected') return false;
  return new Date() > this.dueDate;
});

// Pre-save middleware
proofRequestSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'fulfilled') {
    this.fulfilledAt = new Date();
  }
  next();
});

// Static method to get overdue requests
proofRequestSchema.statics.getOverdueRequests = function() {
  return this.find({
    dueDate: { $lt: new Date() },
    status: { $nin: ['fulfilled', 'rejected'] }
  });
};

// Instance method to add message
proofRequestSchema.methods.addMessage = function(senderId, message, isInternal = false) {
  this.messages.push({
    sender: senderId,
    message,
    isInternal,
    timestamp: new Date()
  });
  return this.save();
};

// Instance method to update status
proofRequestSchema.methods.updateStatus = function(newStatus, updatedBy) {
  this.status = newStatus;
  this.updatedBy = updatedBy;
  if (newStatus === 'fulfilled') {
    this.fulfilledAt = new Date();
  }
  return this.save();
};

const ProofRequest = mongoose.model('ProofRequest', proofRequestSchema);

export default ProofRequest; 