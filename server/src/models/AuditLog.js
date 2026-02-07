import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  // Basic audit information
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  
  // User information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  userEmail: {
    type: String,
    required: true
  },
  
  userName: {
    type: String,
    required: true
  },
  
  userRole: {
    type: String,
    enum: ['admin', 'doctor', 'patient', 'insurance', 'researcher'],
    required: true
  },
  
  // Action details
  action: {
    type: String,
    required: true,
    enum: [
      // User management
      'user_created', 'user_modified', 'user_suspended', 'user_reactivated', 'user_deleted',
      'user_login', 'user_logout', 'login_failed', 'password_changed', 'profile_updated',
      
      // Authentication & Security
      '2fa_enabled', '2fa_disabled', '2fa_verified', '2fa_failed',
      'session_created', 'session_expired', 'session_revoked',
      'access_denied', 'permission_denied', 'security_alert',
      
      // Health records
      'record_created', 'record_modified', 'record_deleted', 'record_viewed',
      'record_shared', 'record_exported', 'record_imported',
      
      // Proofs and verification
      'proof_created', 'proof_verified', 'proof_rejected', 'proof_shared',
      'proof_requested', 'proof_expired',
      
      // Appointments
      'appointment_created', 'appointment_modified', 'appointment_cancelled',
      'appointment_completed', 'appointment_rescheduled',
      
      // Insurance
      'claim_submitted', 'claim_approved', 'claim_rejected', 'claim_modified',
      'policy_created', 'policy_modified', 'policy_cancelled',
      
      // System operations
      'backup_created', 'backup_restored', 'backup_failed',
      'system_maintenance', 'system_update', 'system_error',
      'data_export', 'data_import', 'data_archived',
      
      // Admin operations
      'settings_modified', 'config_changed', 'admin_action',
      'bulk_operation', 'user_bulk_modified',
      
      // Compliance and audit
      'compliance_check', 'audit_report', 'regulatory_update',
      'data_retention', 'privacy_consent', 'gdpr_request'
    ]
  },
  
  // Target information
  targetType: {
    type: String,
    enum: ['user', 'health_record', 'proof', 'appointment', 'claim', 'policy', 'system', 'settings', 'database'],
    required: true
  },
  
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false // Optional for system-wide actions
  },
  
  targetName: {
    type: String,
    required: false
  },
  
  // Severity and status
  severity: {
    type: String,
    enum: ['info', 'warning', 'high', 'critical'],
    default: 'info',
    required: true
  },
  
  status: {
    type: String,
    enum: ['success', 'failed', 'pending', 'blocked', 'error'],
    default: 'success',
    required: true
  },
  
  // Request information
  ipAddress: {
    type: String,
    required: true
  },
  
  userAgent: {
    type: String,
    required: true
  },
  
  requestMethod: {
    type: String,
    enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    required: true
  },
  
  requestUrl: {
    type: String,
    required: true
  },
  
  requestId: {
    type: String,
    required: true
  },
  
  // Additional details
  details: {
    type: String,
    required: true
  },
  
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // File attachments (for Cloudinary)
  attachments: [{
    url: String,
    publicId: String,
    filename: String,
    mimeType: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Compliance and retention
  retentionPeriod: {
    type: Number, // Days
    default: 2555 // 7 years default
  },
  
  isComplianceRelevant: {
    type: Boolean,
    default: false
  },
  
  complianceTags: [{
    type: String,
    enum: ['hipaa', 'gdpr', 'sox', 'pci', 'iso27001']
  }],
  
  // Audit trail
  previousValues: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  newValues: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Performance metrics
  executionTime: {
    type: Number, // milliseconds
    default: 0
  },
  
  // Related logs
  relatedLogIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AuditLog'
  }],
  
  // Session information
  sessionId: {
    type: String,
    required: false
  },
  
  // Geographic information
  location: {
    country: String,
    region: String,
    city: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  }
}, {
  timestamps: true,
  collection: 'auditLogs'
});

// Indexes for optimal query performance
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ severity: 1, timestamp: -1 });
auditLogSchema.index({ targetType: 1, targetId: 1, timestamp: -1 });
auditLogSchema.index({ ipAddress: 1, timestamp: -1 });
auditLogSchema.index({ status: 1, timestamp: -1 });
auditLogSchema.index({ 'metadata.requestId': 1 });
auditLogSchema.index({ isComplianceRelevant: 1, timestamp: -1 });
auditLogSchema.index({ complianceTags: 1, timestamp: -1 });

// Compound indexes for common queries
auditLogSchema.index({ userId: 1, action: 1, timestamp: -1 });
auditLogSchema.index({ severity: 1, status: 1, timestamp: -1 });
auditLogSchema.index({ targetType: 1, action: 1, timestamp: -1 });

// TTL index for automatic cleanup (optional)
// auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2555 * 24 * 60 * 60 }); // 7 years

// Static methods for common queries
auditLogSchema.statics.getUserActivity = async function(userId, options = {}) {
  const {
    startDate,
    endDate,
    actions = [],
    severity = [],
    limit = 100,
    skip = 0
  } = options;

  const query = { userId };
  
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = new Date(startDate);
    if (endDate) query.timestamp.$lte = new Date(endDate);
  }
  
  if (actions.length > 0) {
    query.action = { $in: actions };
  }
  
  if (severity.length > 0) {
    query.severity = { $in: severity };
  }

  return this.find(query)
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

auditLogSchema.statics.getSystemStats = async function(startDate, endDate) {
  const matchStage = {
    timestamp: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  };

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalEvents: { $sum: 1 },
        criticalEvents: { $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] } },
        highEvents: { $sum: { $cond: [{ $eq: ['$severity', 'high'] }, 1, 0] } },
        warningEvents: { $sum: { $cond: [{ $eq: ['$severity', 'warning'] }, 1, 0] } },
        failedEvents: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
        blockedEvents: { $sum: { $cond: [{ $eq: ['$status', 'blocked'] }, 1, 0] } }
      }
    }
  ]);
};

auditLogSchema.statics.getActionStats = async function(startDate, endDate) {
  const matchStage = {
    timestamp: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  };

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 },
        successCount: { $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] } },
        failedCount: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
        avgExecutionTime: { $avg: '$executionTime' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

auditLogSchema.statics.getUserStats = async function(startDate, endDate) {
  const matchStage = {
    timestamp: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  };

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$userId',
        userName: { $first: '$userName' },
        userEmail: { $first: '$userEmail' },
        userRole: { $first: '$userRole' },
        totalActions: { $sum: 1 },
        criticalActions: { $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] } },
        failedActions: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
        lastActivity: { $max: '$timestamp' }
      }
    },
    { $sort: { totalActions: -1 } }
  ]);
};

auditLogSchema.statics.getSecurityAlerts = async function(startDate, endDate) {
  const matchStage = {
    timestamp: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    },
    $or: [
      { severity: { $in: ['high', 'critical'] } },
      { action: { $in: ['access_denied', 'login_failed', 'security_alert'] } },
      { status: { $in: ['failed', 'blocked'] } }
    ]
  };

  return this.find(matchStage)
    .sort({ timestamp: -1 })
    .limit(100)
    .lean();
};

// Instance method to add attachment
auditLogSchema.methods.addAttachment = function(attachment) {
  this.attachments.push(attachment);
  return this.save();
};

// Instance method to mark as compliance relevant
auditLogSchema.methods.markComplianceRelevant = function(tags = []) {
  this.isComplianceRelevant = true;
  this.complianceTags = [...new Set([...this.complianceTags, ...tags])];
  return this.save();
};

// Pre-save middleware to set default values
auditLogSchema.pre('save', function(next) {
  // Set retention period based on severity
  if (this.severity === 'critical') {
    this.retentionPeriod = 3650; // 10 years
  } else if (this.severity === 'high') {
    this.retentionPeriod = 2555; // 7 years
  } else {
    this.retentionPeriod = 1825; // 5 years
  }
  
  next();
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog; 