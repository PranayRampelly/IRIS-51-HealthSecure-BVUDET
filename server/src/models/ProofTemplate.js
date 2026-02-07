import mongoose from 'mongoose';

const proofTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  proofType: {
    type: String,
    required: true,
    enum: [
      'medical-certificate',
      'treatment-record',
      'lab-results',
      'prescription',
      'discharge-summary',
      'diagnostic-report',
      'surgery-report',
      'therapy-notes',
      'imaging-results',
      'vaccination-record',
      'allergy-test',
      'specialist-report'
    ]
  },
  defaultUrgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  defaultReason: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['emergency', 'routine', 'preventive', 'specialist', 'surgery', 'therapy'],
    required: true
  },
  defaultPriority: {
    type: Number,
    min: 1,
    max: 4,
    default: 3
  },
  defaultDueDays: {
    type: Number,
    min: 1,
    max: 30,
    default: 7
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  usageCount: {
    type: Number,
    default: 0,
    min: 0
  },
  tags: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastUsed: Date,
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Virtual for usage frequency
proofTemplateSchema.virtual('usageFrequency').get(function() {
  if (!this.createdAt) return 0;
  const now = new Date();
  const created = new Date(this.createdAt);
  const daysSinceCreation = Math.floor((now - created) / (1000 * 60 * 60 * 24));
  return daysSinceCreation > 0 ? (this.usageCount / daysSinceCreation) : 0;
});

// Indexes
proofTemplateSchema.index({ isActive: 1 });
proofTemplateSchema.index({ proofType: 1 });
proofTemplateSchema.index({ category: 1 });
proofTemplateSchema.index({ createdBy: 1 });
proofTemplateSchema.index({ usageCount: -1 });
proofTemplateSchema.index({ createdAt: -1 });

// Pre-save middleware to ensure only one default template per proof type
proofTemplateSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { 
        proofType: this.proofType, 
        _id: { $ne: this._id },
        isDefault: true 
      },
      { isDefault: false }
    );
  }
  next();
});

const ProofTemplate = mongoose.model('ProofTemplate', proofTemplateSchema);

export default ProofTemplate; 