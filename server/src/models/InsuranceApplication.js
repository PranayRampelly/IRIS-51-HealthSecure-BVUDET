import mongoose from 'mongoose';

const dependentSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  relationship: { type: String, required: true },
  ssn: { type: String, required: true }
}, { _id: true });

const documentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  originalName: { type: String, required: true },
  type: { type: String, required: true },
  size: { type: Number, required: true },
  url: { type: String, required: true },
  cloudinaryId: { type: String },
  documentType: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
});

const insuranceApplicationSchema = new mongoose.Schema({
  // Application metadata
  applicationNumber: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'pending_documents'],
    default: 'draft'
  },
  
  // Selected policy
  policyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'InsurancePolicy', 
    required: true 
  },
  
  // Applicant information
  applicant: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    ssn: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true }
  },
  
  // Employment information
  employment: {
    employer: { type: String },
    jobTitle: { type: String },
    employmentStatus: { type: String },
    annualIncome: { type: Number }
  },
  
  // Health information
  health: {
    height: { type: String },
    weight: { type: String },
    tobaccoUse: { type: String },
    preExistingConditions: { type: String },
    currentMedications: { type: String },
    familyHistory: { type: String }
  },
  
  // Dependents
  dependents: [dependentSchema],
  
  // Coverage preferences
  coverage: {
    startDate: { type: Date, required: true },
    coverageAmount: { type: Number },
    riders: [{ type: String }]
  },
  
  // Documents
  documents: [documentSchema],
  
  // Application tracking
  submittedAt: { type: Date },
  reviewedAt: { type: Date },
  approvedAt: { type: Date },
  rejectedAt: { type: Date },
  rejectionReason: { type: String },
  
  // User references
  patientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  reviewedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Generate application number
insuranceApplicationSchema.pre('save', async function(next) {
  if (this.isNew && !this.applicationNumber) {
    const count = await this.constructor.countDocuments();
    this.applicationNumber = `APP${Date.now()}${String(count + 1).padStart(4, '0')}`;
  }
  this.updatedAt = new Date();
  next();
});

// Indexes
insuranceApplicationSchema.index({ patientId: 1, status: 1 });
insuranceApplicationSchema.index({ applicationNumber: 1 });
insuranceApplicationSchema.index({ policyId: 1 });
insuranceApplicationSchema.index({ createdAt: -1 });

const InsuranceApplication = mongoose.model('InsuranceApplication', insuranceApplicationSchema);

export default InsuranceApplication; 