import mongoose from 'mongoose';

const symptomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  severity: { type: Number, min: 1, max: 10, default: 5 },
  duration: { type: String, enum: ['less_than_day', '1_3_days', '4_7_days', '1_2_weeks', '2_4_weeks', 'more_than_month'] },
  category: { type: String, enum: ['general', 'respiratory', 'gastrointestinal', 'neurological', 'musculoskeletal', 'other'] }
});

const healthAssessmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Patient Profile
  patientProfile: {
    age: { type: Number, required: true, min: 0, max: 120 },
    biologicalSex: { type: String, enum: ['male', 'female', 'other'], required: true },
    weight: { type: Number, min: 1, max: 300 },
    height: { type: Number, min: 50, max: 250 },
    bmi: { type: Number }
  },

  // Symptom Information
  primaryConcern: { type: String, required: true },
  symptomDuration: { type: String, enum: ['less_than_day', '1_3_days', '4_7_days', '1_2_weeks', '2_4_weeks', 'more_than_month'] },
  overallSeverity: { type: Number, min: 1, max: 10, required: true },
  symptomOnset: { type: Date },
  symptomProgression: { type: String, enum: ['getting_worse', 'staying_same', 'improving', 'fluctuating'] },
  
  // Selected Symptoms
  symptoms: [symptomSchema],
  
  // Medical History
  medicalHistory: [{
    condition: String,
    diagnosedDate: Date,
    isActive: Boolean
  }],
  
  // Medications
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    startDate: Date
  }],
  
  // Allergies
  allergies: [{
    allergen: String,
    reaction: String,
    severity: { type: String, enum: ['mild', 'moderate', 'severe'] }
  }],
  
  // Family History
  familyHistory: [{
    condition: String,
    relationship: String
  }],
  
  // Lifestyle Factors
  lifestyle: {
    smoking: { type: String, enum: ['non_smoker', 'former_smoker', 'current_smoker'] },
    alcohol: { type: String, enum: ['none', 'occasional', 'moderate', 'heavy'] },
    exercise: { type: String, enum: ['sedentary', 'light', 'moderate', 'active'] },
    diet: { type: String, enum: ['standard', 'vegetarian', 'vegan', 'keto', 'paleo', 'other'] },
    sleepHours: { type: Number, min: 0, max: 24 }
  },

  // Analysis Results
  analysis: {
    predictedConditions: [{
      condition: String,
      probability: Number,
      confidence: Number,
      severity: { type: String, enum: ['low', 'medium', 'high', 'critical'] }
    }],
    riskFactors: [String],
    recommendations: [String],
    urgencyLevel: { type: String, enum: ['low', 'medium', 'high', 'emergency'] },
    nextSteps: [String]
  },

  // Assessment Metadata
  status: { type: String, enum: ['draft', 'completed', 'reviewed'], default: 'draft' },
  assessmentDate: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
  
  // Clinical Notes
  clinicalNotes: String,
  followUpRequired: { type: Boolean, default: false },
  followUpDate: Date,
  
  // Integration with other systems
  relatedAppointments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  }],
  
  relatedHealthRecords: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HealthRecord'
  }]
}, {
  timestamps: true
});

// Calculate BMI
healthAssessmentSchema.pre('save', function(next) {
  if (this.patientProfile.weight && this.patientProfile.height) {
    const heightInMeters = this.patientProfile.height / 100;
    this.patientProfile.bmi = Math.round((this.patientProfile.weight / (heightInMeters * heightInMeters)) * 10) / 10;
  }
  next();
});

// Index for efficient queries
healthAssessmentSchema.index({ userId: 1, assessmentDate: -1 });
healthAssessmentSchema.index({ 'analysis.urgencyLevel': 1 });
healthAssessmentSchema.index({ status: 1 });

const HealthAssessment = mongoose.model('HealthAssessment', healthAssessmentSchema);

export default HealthAssessment; 