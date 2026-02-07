import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  // Basic Information
  patientId: {
    type: String,
    required: true,
    unique: true
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
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    default: null
  },
  
  // Contact Information
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  
  // Emergency Contacts
  emergencyContacts: [{
    name: String,
    relationship: String,
    phone: String,
    email: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  
  // Medical Information
  primaryDiagnosis: String,
  secondaryDiagnosis: [String],
  allergies: [String],
  currentMedications: [{
    medication: String,
    dosage: String,
    frequency: String,
    startDate: Date,
    endDate: Date,
    prescribedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Hospital Information
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  department: {
    type: String,
    required: true
  },
  roomNumber: String,
  bedNumber: String,
  
  // Admission Information
  admissionDate: {
    type: Date,
    required: true
  },
  expectedDischargeDate: Date,
  actualDischargeDate: Date,
  admittingDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Status and Priority
  status: {
    type: String,
    enum: ['active', 'critical', 'discharged', 'pending', 'transferred'],
    default: 'active'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Vital Signs
  vitalSigns: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    bloodPressure: String,
    heartRate: String,
    temperature: String,
    respiratoryRate: String,
    oxygenSaturation: String,
    weight: String,
    height: String,
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Treatment Plan
  treatmentPlan: String,
  procedures: [{
    name: String,
    date: Date,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String,
    status: {
      type: String,
      enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
      default: 'scheduled'
    }
  }],
  
  // Lab Tests and Imaging
  labTests: [{
    testName: String,
    orderedDate: Date,
    performedDate: Date,
    results: String,
    status: {
      type: String,
      enum: ['ordered', 'in-progress', 'completed', 'cancelled'],
      default: 'ordered'
    },
    orderedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  imaging: [{
    type: String,
    orderedDate: Date,
    performedDate: Date,
    results: String,
    status: {
      type: String,
      enum: ['ordered', 'in-progress', 'completed', 'cancelled'],
      default: 'ordered'
    },
    orderedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Progress Notes
  progressNotes: [{
    date: {
      type: Date,
      default: Date.now
    },
    note: String,
    writtenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    category: {
      type: String,
      enum: ['nursing', 'medical', 'consultation', 'discharge'],
      default: 'medical'
    }
  }],
  
  // Insurance Information
  insurance: {
    provider: String,
    policyNumber: String,
    groupNumber: String,
    coverage: Number,
    deductible: Number,
    copay: Number
  },
  
  // Billing Information
  billing: {
    roomCharges: Number,
    medicationCharges: Number,
    procedureCharges: Number,
    labCharges: Number,
    imagingCharges: Number,
    totalCharges: Number,
    insuranceCoverage: Number,
    patientResponsibility: Number,
    paymentStatus: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'insurance-pending'],
      default: 'pending'
    }
  },
  
  // Discharge Planning
  dischargePlan: {
    dischargeDate: Date,
    dischargeType: {
      type: String,
      enum: ['home', 'rehabilitation', 'nursing-home', 'transfer', 'hospice'],
      default: 'home'
    },
    followUpAppointment: Date,
    followUpDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    homeCareInstructions: String,
    medications: [{
      medication: String,
      dosage: String,
      frequency: String,
      duration: String,
      instructions: String
    }],
    restrictions: [String],
    activities: [String]
  },
  
  // Consent and Legal
  consents: [{
    type: String,
    date: {
      type: Date,
      default: Date.now
    },
    signedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    witness: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Status History
  statusHistory: [{
    status: String,
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
  
  // Audit Information
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
  timestamps: true
});

// Indexes
patientSchema.index({ hospital: 1, status: 1 });
patientSchema.index({ department: 1, status: 1 });
patientSchema.index({ admittingDoctor: 1, admissionDate: 1 });

// Pre-save middleware
patientSchema.pre('save', function(next) {
  if (this.isNew) {
    // Generate patient ID
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.patientId = `PAT-${year}${month}${day}-${random}`;
  }
  
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      updatedBy: this.updatedBy || this.createdBy
    });
  }
  next();
});

// Methods
patientSchema.methods.updateStatus = function(newStatus, updatedBy, notes = '') {
  this.status = newStatus;
  this.updatedBy = updatedBy;
  if (notes) {
    this.statusHistory.push({
      status: newStatus,
      timestamp: new Date(),
      updatedBy: updatedBy,
      notes: notes
    });
  }
  return this.save();
};

patientSchema.methods.addProgressNote = function(note, writtenBy, category = 'medical') {
  this.progressNotes.push({
    note,
    writtenBy,
    category
  });
  return this.save();
};

patientSchema.methods.addVitalSigns = function(vitals, recordedBy) {
  this.vitalSigns.push({
    ...vitals,
    recordedBy
  });
  return this.save();
};

patientSchema.methods.calculateLengthOfStay = function() {
  const dischargeDate = this.actualDischargeDate || new Date();
  const admissionDate = this.admissionDate;
  const diffTime = Math.abs(dischargeDate - admissionDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

patientSchema.methods.calculateTotalCharges = function() {
  const total = (this.billing.roomCharges || 0) +
                (this.billing.medicationCharges || 0) +
                (this.billing.procedureCharges || 0) +
                (this.billing.labCharges || 0) +
                (this.billing.imagingCharges || 0);
  
  this.billing.totalCharges = total;
  this.billing.patientResponsibility = total - (this.billing.insuranceCoverage || 0);
  
  return this.save();
};

// Virtual for patient full name
patientSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for age
patientSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

const Patient = mongoose.model('Patient', patientSchema);

export default Patient; 