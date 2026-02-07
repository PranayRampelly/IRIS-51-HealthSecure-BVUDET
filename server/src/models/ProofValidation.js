import mongoose from 'mongoose';

// AI Analysis Schema
const aiAnalysisSchema = new mongoose.Schema({
  documentAuthenticity: {
    signatureAnalysis: { type: Number, min: 0, max: 100, default: 0 },
    watermarkVerification: { type: Number, min: 0, max: 100, default: 0 },
    metadataValidation: { type: Number, min: 0, max: 100, default: 0 },
    overallAuthenticity: { type: Number, min: 0, max: 100, default: 0 }
  },
  contentValidation: {
    medicalTerminology: { type: Number, min: 0, max: 100, default: 0 },
    dateConsistency: { type: Number, min: 0, max: 100, default: 0 },
    providerVerification: { type: Number, min: 0, max: 100, default: 0 },
    overallContent: { type: Number, min: 0, max: 100, default: 0 }
  },
  riskAssessment: {
    fraudDetection: { type: Number, min: 0, max: 100, default: 0 },
    patternAnalysis: { type: Number, min: 0, max: 100, default: 0 },
    anomalyDetection: { type: Number, min: 0, max: 100, default: 0 },
    overallRisk: { type: Number, min: 0, max: 100, default: 0 }
  },
  confidence: { type: Number, min: 0, max: 100, default: 0 },
  analysisDate: { type: Date, default: Date.now },
  modelVersion: { type: String, default: '1.0' }
});

// Blockchain Verification Schema
const blockchainVerificationSchema = new mongoose.Schema({
  verified: { type: Boolean, default: false },
  transactionHash: String,
  blockNumber: Number,
  verificationDate: Date,
  network: { type: String, enum: ['ethereum', 'polygon', 'binance'], default: 'ethereum' },
  smartContractAddress: String
});

// Manual Review Schema
const manualReviewSchema = new mongoose.Schema({
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewDate: { type: Date, default: Date.now },
  decision: {
    type: String,
    enum: ['approved', 'rejected', 'flagged', 'pending'],
    required: true
  },
  notes: String,
  riskFactors: [String],
  recommendations: [String]
});

// Main Proof Validation Schema
const proofValidationSchema = new mongoose.Schema({
  // Basic Information
  proofId: {
    type: String,
    required: true,
    unique: true,
    default: () => `PROOF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  },
  
  // Related Entities
  claimId: {
    type: String,
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Document Information
  documentType: {
    type: String,
    enum: ['medical_certificate', 'treatment_record', 'lab_results', 'prescription', 'billing_statement', 'other'],
    required: true
  },
  documentUrl: {
    type: String,
    required: true
  },
  originalFileName: String,
  fileSize: Number,
  mimeType: String,
  
  // Validation Status
  status: {
    type: String,
    enum: ['pending', 'ai_processing', 'ai_completed', 'manual_review', 'verified', 'flagged', 'rejected'],
    default: 'pending'
  },
  
  // Risk Assessment
  riskScore: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  
  // AI Analysis
  aiAnalysis: aiAnalysisSchema,
  
  // Blockchain Verification
  blockchainVerification: blockchainVerificationSchema,
  
  // Manual Review
  manualReviews: [manualReviewSchema],
  
  // Validation Timeline
  submittedDate: { type: Date, default: Date.now },
  aiProcessedDate: Date,
  verifiedDate: Date,
  rejectedDate: Date,
  
  // Insurance Provider Information
  insuranceProvider: {
    type: String,
    required: true
  },
  validatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Additional Information
  tags: [String],
  notes: String,
  
  // Audit Fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
proofValidationSchema.index({ status: 1, insuranceProvider: 1 });
proofValidationSchema.index({ claimId: 1 });
proofValidationSchema.index({ patientId: 1 });
proofValidationSchema.index({ submittedDate: -1 });
proofValidationSchema.index({ riskScore: 1 });
proofValidationSchema.index({ 'aiAnalysis.confidence': -1 });

// Virtual for overall validation score
proofValidationSchema.virtual('overallScore').get(function() {
  if (!this.aiAnalysis) return 0;
  
  const authenticity = this.aiAnalysis.documentAuthenticity.overallAuthenticity || 0;
  const content = this.aiAnalysis.contentValidation.overallContent || 0;
  const risk = this.aiAnalysis.riskAssessment.overallRisk || 0;
  
  return Math.round((authenticity + content + (100 - risk)) / 3);
});

// Virtual for validation age
proofValidationSchema.virtual('validationAge').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - this.submittedDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware
proofValidationSchema.pre('save', function(next) {
  // Update risk score based on AI analysis
  if (this.aiAnalysis && this.aiAnalysis.overallRisk) {
    const risk = this.aiAnalysis.overallRisk;
    if (risk >= 80) this.riskScore = 'critical';
    else if (risk >= 60) this.riskScore = 'high';
    else if (risk >= 30) this.riskScore = 'medium';
    else this.riskScore = 'low';
  }
  
  // Update status based on AI confidence
  if (this.aiAnalysis && this.aiAnalysis.confidence) {
    if (this.aiAnalysis.confidence >= 90) {
      this.status = 'verified';
      this.verifiedDate = new Date();
    } else if (this.aiAnalysis.confidence >= 70) {
      this.status = 'manual_review';
    } else {
      this.status = 'flagged';
    }
  }
  
  next();
});

// Instance methods
proofValidationSchema.methods.calculateRiskScore = function() {
  if (!this.aiAnalysis) return 'low';
  
  const risk = this.aiAnalysis.overallRisk || 0;
  if (risk >= 80) return 'critical';
  if (risk >= 60) return 'high';
  if (risk >= 30) return 'medium';
  return 'low';
};

proofValidationSchema.methods.getValidationStatus = function() {
  if (this.status === 'verified') return 'verified';
  if (this.status === 'rejected') return 'rejected';
  if (this.status === 'flagged') return 'flagged';
  return 'pending';
};

// Static methods
proofValidationSchema.statics.getValidationStats = async function(insuranceProvider) {
  const stats = await this.aggregate([
    { $match: { insuranceProvider } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgConfidence: { $avg: '$aiAnalysis.confidence' },
        avgRisk: { $avg: '$aiAnalysis.overallRisk' }
      }
    }
  ]);
  
  const formattedStats = {
    pending: { count: 0, avgConfidence: 0, avgRisk: 0 },
    verified: { count: 0, avgConfidence: 0, avgRisk: 0 },
    flagged: { count: 0, avgConfidence: 0, avgRisk: 0 },
    rejected: { count: 0, avgConfidence: 0, avgRisk: 0 }
  };
  
  stats.forEach(stat => {
    const status = stat._id === 'ai_completed' ? 'pending' : stat._id;
    if (formattedStats[status]) {
      formattedStats[status] = {
        count: stat.count,
        avgConfidence: Math.round(stat.avgConfidence || 0),
        avgRisk: Math.round(stat.avgRisk || 0)
      };
    }
  });
  
  return formattedStats;
};

proofValidationSchema.statics.getAIInsights = async function(insuranceProvider) {
  const insights = await this.aggregate([
    { $match: { insuranceProvider, aiAnalysis: { $exists: true } } },
    {
      $group: {
        _id: null,
        avgSignatureAnalysis: { $avg: '$aiAnalysis.documentAuthenticity.signatureAnalysis' },
        avgWatermarkVerification: { $avg: '$aiAnalysis.documentAuthenticity.watermarkVerification' },
        avgMedicalTerminology: { $avg: '$aiAnalysis.contentValidation.medicalTerminology' },
        avgDateConsistency: { $avg: '$aiAnalysis.contentValidation.dateConsistency' },
        avgFraudDetection: { $avg: '$aiAnalysis.riskAssessment.fraudDetection' },
        avgPatternAnalysis: { $avg: '$aiAnalysis.riskAssessment.patternAnalysis' },
        totalProofs: { $sum: 1 }
      }
    }
  ]);
  
  if (insights.length === 0) {
    return {
      documentAuthenticity: { signatureAnalysis: 0, watermarkVerification: 0 },
      contentValidation: { medicalTerminology: 0, dateConsistency: 0 },
      riskAssessment: { fraudDetection: 0, patternAnalysis: 0 },
      totalProofs: 0
    };
  }
  
  const insight = insights[0];
  return {
    documentAuthenticity: {
      signatureAnalysis: Math.round(insight.avgSignatureAnalysis || 0),
      watermarkVerification: Math.round(insight.avgWatermarkVerification || 0)
    },
    contentValidation: {
      medicalTerminology: Math.round(insight.avgMedicalTerminology || 0),
      dateConsistency: Math.round(insight.avgDateConsistency || 0)
    },
    riskAssessment: {
      fraudDetection: Math.round(insight.avgFraudDetection || 0),
      patternAnalysis: Math.round(insight.avgPatternAnalysis || 0)
    },
    totalProofs: insight.totalProofs
  };
};

const ProofValidation = mongoose.model('ProofValidation', proofValidationSchema);

export default ProofValidation; 