import mongoose from 'mongoose';

const patientAdmissionSchema = new mongoose.Schema({
  // Basic admission info
  admissionNumber: {
    type: String,
    required: true,
    unique: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  admittingDoctor: {
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
  
  // Timing
  admissionDate: {
    type: Date,
    required: true
  },
  admissionTime: {
    type: String,
    required: true
  },
  expectedDischargeDate: Date,
  actualDischargeDate: Date,
  
  // Status tracking
  status: {
    type: String,
    enum: ['admitted', 'under-observation', 'stable', 'critical', 'improving', 'ready-for-discharge', 'discharged', 'transferred'],
    default: 'admitted'
  },
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
  
  // Room and bed assignment
  room: {
    roomNumber: String,
    roomType: {
      type: String,
      enum: ['general', 'semi-private', 'private', 'icu', 'nicu', 'isolation'],
      default: 'general'
    },
    floor: String,
    wing: String
  },
  bed: {
    bedNumber: String,
    bedType: {
      type: String,
      enum: ['regular', 'icu', 'ventilator', 'isolation'],
      default: 'regular'
    }
  },
  
  // Medical information
  primaryDiagnosis: {
    type: String,
    required: true
  },
  secondaryDiagnosis: [String],
  symptoms: [String],
  allergies: [String],
  currentMedications: [{
    medication: String,
    dosage: String,
    frequency: String,
    route: String,
    startDate: Date,
    endDate: Date,
    prescribedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Treatment plan
  treatmentPlan: {
    type: String,
    required: true
  },
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
  
  // Vital signs tracking
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
  
  // Lab tests and imaging
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
  
  // Progress notes
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
  
  // Real-time tracking info
  tracking: {
    currentLocation: {
      type: String,
      default: 'ward'
    },
    status: {
      type: String,
      enum: ['active', 'critical', 'stable', 'transferred', 'discharged'],
      default: 'active'
    },
    department: String,
    roomNumber: String,
    bedNumber: String,
    assignedNurse: String,
    assignedDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    lastSeen: {
      type: Date,
      default: Date.now
    },
    notes: String,
    vitalSigns: {
      heartRate: String,
      bloodPressure: String,
      temperature: String,
      oxygenSaturation: String
    }
  },
  
  // Discharge planning
  dischargePlan: {
    dischargeDate: Date,
    dischargeType: {
      type: String,
      enum: ['home', 'rehabilitation', 'nursing-home', 'transfer', 'hospice'],
      default: 'home'
    },
    destination: {
      type: String,
      enum: ['home', 'rehabilitation', 'nursing_home', 'transfer', 'hospice', 'other'],
      default: 'home'
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'completed', 'cancelled'],
      default: 'pending'
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
    activities: [String],
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,
    completedAt: Date,
    notes: String
  },
  
  // Insurance and billing
  insurance: {
    provider: String,
    policyNumber: String,
    groupNumber: String,
    coverage: Number,
    deductible: Number,
    copay: Number
  },
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
  
  // Emergency contacts
  emergencyContacts: [{
    name: String,
    relationship: String,
    phone: String,
    email: String,
    address: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  
  // Consent and legal
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
  
  // Audit trail
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
patientAdmissionSchema.index({ patient: 1, admissionDate: 1 });
patientAdmissionSchema.index({ hospital: 1, status: 1 });
patientAdmissionSchema.index({ admittingDoctor: 1, admissionDate: 1 });
patientAdmissionSchema.index({ status: 1, admissionDate: 1 });

// Pre-save middleware
patientAdmissionSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      updatedBy: this.updatedBy || this.createdBy
    });
  }
  this.updatedAt = new Date();
  next();
});

// Generate admission number
patientAdmissionSchema.pre('save', function(next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.admissionNumber = `ADM-${year}${month}${day}-${random}`;
  }
  next();
});

// Methods
patientAdmissionSchema.methods.updateStatus = function(newStatus, updatedBy, notes = '') {
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

patientAdmissionSchema.methods.addProgressNote = function(note, writtenBy, category = 'medical') {
  this.progressNotes.push({
    note,
    writtenBy,
    category
  });
  return this.save();
};

patientAdmissionSchema.methods.addVitalSigns = function(vitals, recordedBy) {
  this.vitalSigns.push({
    ...vitals,
    recordedBy
  });
  return this.save();
};

patientAdmissionSchema.methods.calculateLengthOfStay = function() {
  const dischargeDate = this.actualDischargeDate || new Date();
  const admissionDate = this.admissionDate;
  const diffTime = Math.abs(dischargeDate - admissionDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

patientAdmissionSchema.methods.calculateTotalCharges = function() {
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
patientAdmissionSchema.virtual('patientFullName').get(function() {
  return `${this.patient?.firstName || ''} ${this.patient?.lastName || ''}`.trim();
});

// Virtual for doctor full name
patientAdmissionSchema.virtual('doctorFullName').get(function() {
  return `${this.admittingDoctor?.firstName || ''} ${this.admittingDoctor?.lastName || ''}`.trim();
});

// Virtual for hospital name
patientAdmissionSchema.virtual('hospitalName').get(function() {
  return this.hospital?.hospitalName || '';
});

const PatientAdmission = mongoose.model('PatientAdmission', patientAdmissionSchema);

export default PatientAdmission; 