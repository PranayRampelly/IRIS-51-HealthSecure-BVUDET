import mongoose from 'mongoose';

const emergencyAlertSchema = new mongoose.Schema({
  bloodBankId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  alertId: {
    type: String,
    required: true,
    unique: true
  },
  alertType: {
    type: String,
    enum: [
      'Blood Shortage', 'Equipment Failure', 'Power Outage', 'Temperature Alert',
      'Security Breach', 'Natural Disaster', 'Medical Emergency', 'Transportation Issue',
      'Quality Control Failure', 'Staff Shortage', 'System Failure', 'Other'
    ],
    required: true
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Acknowledged', 'In Progress', 'Resolved', 'Escalated', 'Closed'],
    default: 'Active'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    building: String,
    floor: String,
    room: String,
    equipment: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  affectedAreas: [{
    area: String,
    impact: {
      type: String,
      enum: ['None', 'Minor', 'Moderate', 'Major', 'Critical']
    },
    description: String
  }],
  bloodTypes: [{
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    componentType: {
      type: String,
      enum: ['Whole Blood', 'Red Blood Cells', 'Platelets', 'Plasma', 'Cryoprecipitate', 'Granulocytes']
    },
    currentStock: Number,
    requiredStock: Number,
    urgency: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical']
    }
  }],
  equipment: {
    equipmentId: String,
    equipmentName: String,
    equipmentType: String,
    manufacturer: String,
    model: String,
    serialNumber: String,
    lastMaintenance: Date,
    nextMaintenance: Date,
    issue: String,
    impact: String
  },
  environmentalConditions: {
    temperature: {
      current: Number,
      min: Number,
      max: Number,
      unit: {
        type: String,
        enum: ['Celsius', 'Fahrenheit'],
        default: 'Celsius'
      },
      isWithinRange: Boolean
    },
    humidity: {
      current: Number,
      min: Number,
      max: Number,
      unit: {
        type: String,
        default: 'Percentage'
      },
      isWithinRange: Boolean
    },
    power: {
      status: {
        type: String,
        enum: ['Normal', 'Backup', 'Outage', 'Fluctuating']
      },
      backupDuration: Number, // in minutes
      estimatedRestoration: Date
    }
  },
  affectedInventory: [{
    inventoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodInventory'
    },
    bloodType: String,
    componentType: String,
    quantity: Number,
    status: String,
    risk: {
      type: String,
      enum: ['None', 'Low', 'Medium', 'High', 'Critical']
    }
  }],
  affectedRequests: [{
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodRequest'
    },
    urgency: String,
    requiredBy: Date,
    impact: String
  }],
  notifications: {
    internal: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date,
      recipients: [{
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        name: String,
        role: String,
        contactMethod: {
          type: String,
          enum: ['Email', 'SMS', 'Phone', 'Push']
        },
        sentAt: Date,
        deliveredAt: Date,
        status: {
          type: String,
          enum: ['Pending', 'Sent', 'Delivered', 'Failed']
        }
      }]
    },
    external: {
      hospitals: [{
        hospitalId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        hospitalName: String,
        contactPerson: String,
        contactPhone: String,
        contactEmail: String,
        sentAt: Date,
        status: {
          type: String,
          enum: ['Pending', 'Sent', 'Delivered', 'Failed']
        }
      }],
      emergencyServices: [{
        service: String,
        contactPerson: String,
        contactPhone: String,
        sentAt: Date,
        status: {
          type: String,
          enum: ['Pending', 'Sent', 'Delivered', 'Failed']
        }
      }],
      regulatoryBodies: [{
        body: String,
        contactPerson: String,
        contactPhone: String,
        contactEmail: String,
        sentAt: Date,
        status: {
          type: String,
          enum: ['Pending', 'Sent', 'Delivered', 'Failed']
        }
      }]
    }
  },
  response: {
    firstResponder: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      name: String,
      role: String,
      responseTime: Number, // in minutes
      acknowledgedAt: Date
    },
    responseTeam: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      name: String,
      role: String,
      assignedAt: Date,
      arrivedAt: Date,
      status: {
        type: String,
        enum: ['Assigned', 'En Route', 'On Scene', 'Completed']
      }
    }],
    externalSupport: [{
      organization: String,
      contactPerson: String,
      contactPhone: String,
      serviceType: String,
      requestedAt: Date,
      arrivedAt: Date,
      completedAt: Date,
      status: {
        type: String,
        enum: ['Requested', 'En Route', 'On Scene', 'Completed']
      }
    }]
  },
  actions: [{
    action: String,
    description: String,
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    assignedByName: String,
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical']
    },
    dueDate: Date,
    startedAt: Date,
    completedAt: Date,
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed', 'Overdue']
    },
    notes: String,
    attachments: [{
      fileName: String,
      fileUrl: String,
      uploadDate: Date
    }]
  }],
  escalation: {
    isEscalated: {
      type: Boolean,
      default: false
    },
    escalationLevel: {
      type: Number,
      min: 1,
      max: 5,
      default: 1
    },
    escalatedAt: Date,
    escalatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    escalatedByName: String,
    escalationReason: String,
    escalationActions: [String]
  },
  timeline: [{
    event: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    performedByName: String,
    details: String,
    status: String
  }],
  resolution: {
    isResolved: {
      type: Boolean,
      default: false
    },
    resolvedAt: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedByName: String,
    resolutionMethod: String,
    resolutionDetails: String,
    followUpRequired: {
      type: Boolean,
      default: false
    },
    followUpDate: Date,
    followUpActions: [String]
  },
  impact: {
    financial: {
      estimatedCost: Number,
      currency: {
        type: String,
        default: 'INR'
      },
      costBreakdown: [{
        category: String,
        amount: Number,
        description: String
      }]
    },
    operational: {
      downtime: Number, // in minutes
      affectedOperations: [String],
      backupProcedures: [String],
      recoveryTime: Number // in minutes
    },
    patient: {
      affectedPatients: Number,
      delayedProcedures: Number,
      cancelledProcedures: Number,
      patientImpact: String
    }
  },
  lessons: {
    whatWentWrong: [String],
    whatWentWell: [String],
    improvements: [String],
    recommendations: [String],
    trainingNeeds: [String]
  },
  attachments: [{
    type: {
      type: String,
      enum: [
        'Photo', 'Video', 'Document', 'Report', 'Certificate', 'Other'
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
emergencyAlertSchema.index({ bloodBankId: 1, status: 1 });
emergencyAlertSchema.index({ alertType: 1, severity: 1 });
emergencyAlertSchema.index({ createdAt: -1 });
emergencyAlertSchema.index({ 'notifications.internal.sent': 1 });
emergencyAlertSchema.index({ 'escalation.isEscalated': 1 });

// Virtual for duration
emergencyAlertSchema.virtual('duration').get(function() {
  if (!this.createdAt) return null;
  const endTime = this.resolution?.resolvedAt || new Date();
  const startTime = new Date(this.createdAt);
  const diffTime = endTime - startTime;
  const diffMinutes = Math.ceil(diffTime / (1000 * 60));
  return diffMinutes;
});

// Virtual for response time
emergencyAlertSchema.virtual('responseTime').get(function() {
  if (!this.response?.firstResponder?.acknowledgedAt) return null;
  const responseTime = new Date(this.response.firstResponder.acknowledgedAt);
  const alertTime = new Date(this.createdAt);
  const diffTime = responseTime - alertTime;
  const diffMinutes = Math.ceil(diffTime / (1000 * 60));
  return diffMinutes;
});

// Virtual for is overdue
emergencyAlertSchema.virtual('isOverdue').get(function() {
  if (this.status === 'Resolved' || this.status === 'Closed') return false;
  
  const now = new Date();
  const alertTime = new Date(this.createdAt);
  const diffTime = now - alertTime;
  const diffHours = diffTime / (1000 * 60 * 60);
  
  // Critical alerts should be responded to within 15 minutes
  if (this.severity === 'Critical' && diffHours > 0.25) return true;
  
  // High severity alerts should be responded to within 1 hour
  if (this.severity === 'High' && diffHours > 1) return true;
  
  // Medium severity alerts should be responded to within 4 hours
  if (this.severity === 'Medium' && diffHours > 4) return true;
  
  // Low severity alerts should be responded to within 24 hours
  if (this.severity === 'Low' && diffHours > 24) return true;
  
  return false;
});

// Method to add timeline entry
emergencyAlertSchema.methods.addTimelineEntry = function(event, performedBy, performedByName, details = '', status = null) {
  this.timeline.push({
    event,
    timestamp: new Date(),
    performedBy,
    performedByName,
    details,
    status
  });
};

// Method to update status with timeline
emergencyAlertSchema.methods.updateStatus = function(newStatus, performedBy, performedByName, details = '') {
  const previousStatus = this.status;
  this.status = newStatus;
  
  this.addTimelineEntry(
    `Status Updated to ${newStatus}`,
    performedBy,
    performedByName,
    details
  );
  
  this.auditTrail.push({
    action: 'Status Updated',
    performedBy,
    performedByName,
    timestamp: new Date(),
    details: `Status changed from ${previousStatus} to ${newStatus}`,
    previousValue: previousStatus,
    newValue: newStatus
  });
};

// Method to add action
emergencyAlertSchema.methods.addAction = function(action, description, assignedTo, assignedByName, priority = 'Medium', dueDate = null) {
  this.actions.push({
    action,
    description,
    assignedTo,
    assignedByName,
    priority,
    dueDate,
    status: 'Pending'
  });
};

// Method to escalate alert
emergencyAlertSchema.methods.escalate = function(escalatedBy, escalatedByName, reason, actions = []) {
  this.escalation.isEscalated = true;
  this.escalation.escalationLevel += 1;
  this.escalation.escalatedAt = new Date();
  this.escalation.escalatedBy = escalatedBy;
  this.escalation.escalatedByName = escalatedByName;
  this.escalation.escalationReason = reason;
  this.escalation.escalationActions = actions;
  
  this.addTimelineEntry(
    `Alert Escalated to Level ${this.escalation.escalationLevel}`,
    escalatedBy,
    escalatedByName,
    reason
  );
};

// Method to resolve alert
emergencyAlertSchema.methods.resolve = function(resolvedBy, resolvedByName, method, details, followUpRequired = false, followUpDate = null, followUpActions = []) {
  this.resolution.isResolved = true;
  this.resolution.resolvedAt = new Date();
  this.resolution.resolvedBy = resolvedBy;
  this.resolution.resolvedByName = resolvedByName;
  this.resolution.resolutionMethod = method;
  this.resolution.resolutionDetails = details;
  this.resolution.followUpRequired = followUpRequired;
  this.resolution.followUpDate = followUpDate;
  this.resolution.followUpActions = followUpActions;
  
  this.status = 'Resolved';
  
  this.addTimelineEntry(
    'Alert Resolved',
    resolvedBy,
    resolvedByName,
    details
  );
};

// Pre-save middleware to generate alert ID
emergencyAlertSchema.pre('save', async function(next) {
  if (this.isNew && !this.alertId) {
    const count = await this.constructor.countDocuments({ bloodBankId: this.bloodBankId });
    const bloodBank = await mongoose.model('User').findById(this.bloodBankId);
    const bloodBankCode = bloodBank?.bloodBankName?.substring(0, 3).toUpperCase() || 'BBK';
    this.alertId = `${bloodBankCode}ALERT${String(count + 1).padStart(6, '0')}`;
  }
  
  // Auto-escalate if overdue
  if (this.isOverdue && !this.escalation.isEscalated) {
    this.escalation.isEscalated = true;
    this.escalation.escalationLevel = 2;
    this.escalation.escalatedAt = new Date();
    this.escalation.escalationReason = 'Auto-escalated due to overdue response';
  }
  
  next();
});

// Static method to generate alert ID
emergencyAlertSchema.statics.generateAlertId = async function(bloodBankId) {
  const count = await this.countDocuments({ bloodBankId });
  const bloodBank = await mongoose.model('User').findById(bloodBankId);
  const bloodBankCode = bloodBank?.bloodBankName?.substring(0, 3).toUpperCase() || 'BBK';
  return `${bloodBankCode}ALERT${String(count + 1).padStart(6, '0')}`;
};

// Static method to get active alerts
emergencyAlertSchema.statics.getActiveAlerts = async function(bloodBankId) {
  return await this.find({
    bloodBankId,
    status: { $in: ['Active', 'Acknowledged', 'In Progress'] },
    isActive: true
  }).sort({ severity: -1, createdAt: 1 });
};

// Static method to get critical alerts
emergencyAlertSchema.statics.getCriticalAlerts = async function(bloodBankId) {
  return await this.find({
    bloodBankId,
    severity: 'Critical',
    status: { $in: ['Active', 'Acknowledged', 'In Progress'] },
    isActive: true
  }).sort({ createdAt: 1 });
};

// Static method to get alert statistics
emergencyAlertSchema.statics.getAlertStatistics = async function(bloodBankId, startDate = null, endDate = null) {
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
          alertType: '$alertType',
          severity: '$severity',
          status: '$status'
        },
        count: { $sum: 1 },
        avgResponseTime: { $avg: '$response.firstResponder.responseTime' },
        avgResolutionTime: { $avg: '$duration' }
      }
    }
  ]);
};

const EmergencyAlert = mongoose.model('EmergencyAlert', emergencyAlertSchema);
export default EmergencyAlert;
