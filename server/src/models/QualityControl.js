import mongoose from 'mongoose';

const qualityControlSchema = new mongoose.Schema({
  bloodBankId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  controlId: {
    type: String,
    required: true,
    unique: true
  },
  inventoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BloodInventory',
    required: true
  },
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BloodDonor',
    required: true
  },
  controlType: {
    type: String,
    enum: [
      'Pre-Donation Screening', 'Post-Donation Testing', 'Component Quality Check',
      'Storage Quality Check', 'Transport Quality Check', 'Cross-Matching',
      'Compatibility Testing', 'Sterility Testing', 'Potency Testing'
    ],
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Passed', 'Failed', 'Rejected', 'Retest Required'],
    default: 'Pending'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  startedDate: Date,
  completedDate: Date,
  dueDate: Date,
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedByName: String,
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  performedByName: String,
  equipment: {
    name: String,
    model: String,
    serialNumber: String,
    calibrationDate: Date,
    nextCalibrationDate: Date,
    isCalibrated: {
      type: Boolean,
      default: true
    }
  },
  reagents: [{
    name: String,
    lotNumber: String,
    expiryDate: Date,
    manufacturer: String,
    isExpired: {
      type: Boolean,
      default: false
    }
  }],
  testParameters: {
    temperature: {
      required: {
        min: Number,
        max: Number,
        unit: {
          type: String,
          enum: ['Celsius', 'Fahrenheit'],
          default: 'Celsius'
        }
      },
      actual: Number,
      isWithinRange: Boolean
    },
    humidity: {
      required: {
        min: Number,
        max: Number,
        unit: {
          type: String,
          default: 'Percentage'
        }
      },
      actual: Number,
      isWithinRange: Boolean
    },
    ph: {
      required: {
        min: Number,
        max: Number
      },
      actual: Number,
      isWithinRange: Boolean
    },
    hemoglobin: {
      required: {
        min: Number,
        max: Number,
        unit: {
          type: String,
          default: 'g/dL'
        }
      },
      actual: Number,
      isWithinRange: Boolean
    },
    hematocrit: {
      required: {
        min: Number,
        max: Number,
        unit: {
          type: String,
          default: 'Percentage'
        }
      },
      actual: Number,
      isWithinRange: Boolean
    },
    plateletCount: {
      required: {
        min: Number,
        max: Number,
        unit: {
          type: String,
          default: 'x10^9/L'
        }
      },
      actual: Number,
      isWithinRange: Boolean
    },
    whiteBloodCellCount: {
      required: {
        min: Number,
        max: Number,
        unit: {
          type: String,
          default: 'x10^9/L'
        }
      },
      actual: Number,
      isWithinRange: Boolean
    }
  },
  infectiousDiseaseTests: {
    hiv: {
      testMethod: String,
      result: {
        type: String,
        enum: ['Negative', 'Positive', 'Inconclusive', 'Pending']
      },
      testDate: Date,
      performedBy: String,
      notes: String
    },
    hepatitisB: {
      testMethod: String,
      result: {
        type: String,
        enum: ['Negative', 'Positive', 'Inconclusive', 'Pending']
      },
      testDate: Date,
      performedBy: String,
      notes: String
    },
    hepatitisC: {
      testMethod: String,
      result: {
        type: String,
        enum: ['Negative', 'Positive', 'Inconclusive', 'Pending']
      },
      testDate: Date,
      performedBy: String,
      notes: String
    },
    syphilis: {
      testMethod: String,
      result: {
        type: String,
        enum: ['Negative', 'Positive', 'Inconclusive', 'Pending']
      },
      testDate: Date,
      performedBy: String,
      notes: String
    },
    malaria: {
      testMethod: String,
      result: {
        type: String,
        enum: ['Negative', 'Positive', 'Inconclusive', 'Pending']
      },
      testDate: Date,
      performedBy: String,
      notes: String
    },
    cmv: {
      testMethod: String,
      result: {
        type: String,
        enum: ['Negative', 'Positive', 'Inconclusive', 'Pending']
      },
      testDate: Date,
      performedBy: String,
      notes: String
    }
  },
  bloodGrouping: {
    aboGroup: {
      type: String,
      enum: ['A', 'B', 'AB', 'O', 'Pending']
    },
    rhFactor: {
      type: String,
      enum: ['Positive', 'Negative', 'Pending']
    },
    testMethod: String,
    testDate: Date,
    performedBy: String,
    notes: String
  },
  compatibilityTesting: {
    majorCrossMatch: {
      result: {
        type: String,
        enum: ['Compatible', 'Incompatible', 'Pending']
      },
      testDate: Date,
      performedBy: String,
      notes: String
    },
    minorCrossMatch: {
      result: {
        type: String,
        enum: ['Compatible', 'Incompatible', 'Pending']
      },
      testDate: Date,
      performedBy: String,
      notes: String
    },
    antibodyScreen: {
      result: {
        type: String,
        enum: ['Negative', 'Positive', 'Pending']
      },
      testDate: Date,
      performedBy: String,
      notes: String
    }
  },
  sterilityTesting: {
    isSterile: {
      type: Boolean,
      default: false
    },
    testMethod: String,
    testDate: Date,
    performedBy: String,
    incubationPeriod: Number, // in hours
    notes: String
  },
  visualInspection: {
    color: {
      type: String,
      enum: ['Normal', 'Abnormal', 'Pending']
    },
    clarity: {
      type: String,
      enum: ['Clear', 'Cloudy', 'Turbid', 'Pending']
    },
    volume: {
      required: Number,
      actual: Number,
      unit: {
        type: String,
        default: 'ml'
      },
      isWithinRange: Boolean
    },
    inspectionDate: Date,
    performedBy: String,
    notes: String
  },
  qualityIndicators: {
    hemolysis: {
      type: String,
      enum: ['None', 'Mild', 'Moderate', 'Severe', 'Pending']
    },
    lipemia: {
      type: String,
      enum: ['None', 'Mild', 'Moderate', 'Severe', 'Pending']
    },
    clots: {
      type: String,
      enum: ['None', 'Present', 'Pending']
    },
    assessmentDate: Date,
    performedBy: String,
    notes: String
  },
  results: {
    overallResult: {
      type: String,
      enum: ['Pass', 'Fail', 'Conditional Pass', 'Pending'],
      default: 'Pending'
    },
    passCriteria: [String],
    failCriteria: [String],
    conditionalCriteria: [String],
    notes: String,
    recommendations: [String]
  },
  correctiveActions: [{
    action: String,
    description: String,
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    assignedByName: String,
    dueDate: Date,
    completedDate: Date,
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed', 'Overdue'],
      default: 'Pending'
    },
    notes: String
  }],
  retesting: {
    isRequired: {
      type: Boolean,
      default: false
    },
    reason: String,
    scheduledDate: Date,
    completedDate: Date,
    originalControlId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QualityControl'
    }
  },
  documentation: [{
    type: {
      type: String,
      enum: [
        'Test Results', 'Equipment Calibration', 'Reagent Certificate',
        'Quality Control Chart', 'Corrective Action Report', 'Other'
      ]
    },
    title: String,
    fileName: String,
    fileUrl: String,
    uploadDate: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  alerts: [{
    type: {
      type: String,
      enum: ['Equipment Calibration', 'Reagent Expiry', 'Test Failure', 'Retest Required', 'Other']
    },
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium'
    },
    message: String,
    isActive: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    resolvedAt: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  auditTrail: [{
    action: String,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    performedByName: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: String,
    previousValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed
  }],
  compliance: {
    regulatoryStandards: [{
      standard: String,
      version: String,
      compliance: {
        type: String,
        enum: ['Compliant', 'Non-Compliant', 'Pending Review']
      },
      auditDate: Date,
      notes: String
    }],
    internalProcedures: [{
      procedure: String,
      version: String,
      followed: {
        type: Boolean,
        default: true
      },
      deviation: String,
      notes: String
    }]
  },
  isActive: {
    type: Boolean,
    default: true
  },
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

// Indexes for better query performance
qualityControlSchema.index({ bloodBankId: 1, status: 1 });
qualityControlSchema.index({ inventoryId: 1 });
qualityControlSchema.index({ controlType: 1 });
qualityControlSchema.index({ scheduledDate: 1 });
qualityControlSchema.index({ dueDate: 1 });
qualityControlSchema.index({ 'alerts.isActive': 1 });

// Virtual for days until due
qualityControlSchema.virtual('daysUntilDue').get(function() {
  if (!this.dueDate) return null;
  const today = new Date();
  const due = new Date(this.dueDate);
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for is overdue
qualityControlSchema.virtual('isOverdue').get(function() {
  return this.daysUntilDue < 0 && this.status !== 'Passed' && this.status !== 'Completed';
});

// Virtual for duration
qualityControlSchema.virtual('duration').get(function() {
  if (!this.startedDate || !this.completedDate) return null;
  const start = new Date(this.startedDate);
  const end = new Date(this.completedDate);
  const diffTime = end - start;
  const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
  return diffHours;
});

// Method to add alert
qualityControlSchema.methods.addAlert = function(type, message, severity = 'Medium') {
  this.alerts.push({
    type,
    message,
    severity,
    isActive: true,
    createdAt: new Date()
  });
};

// Method to resolve alert
qualityControlSchema.methods.resolveAlert = function(alertIndex, resolvedBy) {
  if (this.alerts[alertIndex]) {
    this.alerts[alertIndex].isActive = false;
    this.alerts[alertIndex].resolvedAt = new Date();
    this.alerts[alertIndex].resolvedBy = resolvedBy;
  }
};

// Method to add audit trail entry
qualityControlSchema.methods.addAuditTrail = function(action, performedBy, performedByName, details, previousValue = null, newValue = null) {
  this.auditTrail.push({
    action,
    performedBy,
    performedByName,
    timestamp: new Date(),
    details,
    previousValue,
    newValue
  });
};

// Method to update status with audit trail
qualityControlSchema.methods.updateStatus = function(newStatus, performedBy, performedByName, notes = '') {
  const previousStatus = this.status;
  this.status = newStatus;
  
  if (newStatus === 'In Progress' && !this.startedDate) {
    this.startedDate = new Date();
  }
  
  if (['Passed', 'Failed', 'Rejected'].includes(newStatus) && !this.completedDate) {
    this.completedDate = new Date();
  }
  
  this.addAuditTrail(
    'Status Updated',
    performedBy,
    performedByName,
    `Status changed from ${previousStatus} to ${newStatus}. ${notes}`,
    previousStatus,
    newStatus
  );
};

// Method to add corrective action
qualityControlSchema.methods.addCorrectiveAction = function(action, description, assignedTo, assignedByName, dueDate) {
  this.correctiveActions.push({
    action,
    description,
    assignedTo,
    assignedByName,
    dueDate,
    status: 'Pending'
  });
};

// Pre-save middleware to generate control ID
qualityControlSchema.pre('save', async function(next) {
  if (this.isNew && !this.controlId) {
    const count = await this.constructor.countDocuments({ bloodBankId: this.bloodBankId });
    const bloodBank = await mongoose.model('User').findById(this.bloodBankId);
    const bloodBankCode = bloodBank?.bloodBankName?.substring(0, 3).toUpperCase() || 'BBK';
    this.controlId = `${bloodBankCode}QC${String(count + 1).padStart(6, '0')}`;
  }
  
  // Auto-update status based on due date
  if (this.isOverdue && this.status === 'Pending') {
    this.status = 'Overdue';
  }
  
  next();
});

// Static method to generate control ID
qualityControlSchema.statics.generateControlId = async function(bloodBankId) {
  const count = await this.countDocuments({ bloodBankId });
  const bloodBank = await mongoose.model('User').findById(bloodBankId);
  const bloodBankCode = bloodBank?.bloodBankName?.substring(0, 3).toUpperCase() || 'BBK';
  return `${bloodBankCode}QC${String(count + 1).padStart(6, '0')}`;
};

// Static method to get overdue controls
qualityControlSchema.statics.getOverdueControls = async function(bloodBankId) {
  const today = new Date();
  return await this.find({
    bloodBankId,
    dueDate: { $lt: today },
    status: { $in: ['Pending', 'In Progress'] },
    isActive: true
  }).sort({ dueDate: 1 });
};

// Static method to get controls by status
qualityControlSchema.statics.getControlsByStatus = async function(bloodBankId, status) {
  return await this.find({
    bloodBankId,
    status,
    isActive: true
  }).sort({ scheduledDate: 1 });
};

// Static method to get quality control statistics
qualityControlSchema.statics.getQualityControlStatistics = async function(bloodBankId, startDate = null, endDate = null) {
  const matchStage = { bloodBankId, isActive: true };
  
  if (startDate && endDate) {
    matchStage.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  return await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          status: '$status',
          controlType: '$controlType'
        },
        count: { $sum: 1 },
        passedCount: {
          $sum: { $cond: [{ $eq: ['$results.overallResult', 'Pass'] }, 1, 0] }
        },
        failedCount: {
          $sum: { $cond: [{ $eq: ['$results.overallResult', 'Fail'] }, 1, 0] }
        }
      }
    }
  ]);
};

const QualityControl = mongoose.model('QualityControl', qualityControlSchema);
export default QualityControl;
