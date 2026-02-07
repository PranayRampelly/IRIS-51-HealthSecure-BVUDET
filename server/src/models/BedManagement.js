import mongoose from 'mongoose';

const bedSchema = new mongoose.Schema({
  bedNumber: {
    type: String,
    required: true
  },
  
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HospitalDepartment',
    required: true
  },
  
  roomNumber: {
    type: String,
    required: true
  },
  
  floor: {
    type: Number,
    required: true
  },
  
  wing: {
    type: String,
    required: true
  },
  
  bedType: {
    type: String,
    enum: ['general', 'semi-private', 'private', 'icu', 'nicu', 'emergency', 'isolation'],
    default: 'general'
  },
  
  status: {
    type: String,
    enum: ['available', 'occupied', 'reserved', 'maintenance', 'cleaning', 'out-of-service'],
    default: 'available'
  },
  
  currentPatient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  admission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PatientAdmission'
  },
  
  // Bed specifications
  specifications: {
    isElectric: {
      type: Boolean,
      default: false
    },
    hasMonitoring: {
      type: Boolean,
      default: false
    },
    hasVentilator: {
      type: Boolean,
      default: false
    },
    hasOxygen: {
      type: Boolean,
      default: true
    },
    hasCallButton: {
      type: Boolean,
      default: true
    },
    hasTV: {
      type: Boolean,
      default: false
    },
    hasWiFi: {
      type: Boolean,
      default: true
    },
    isWheelchairAccessible: {
      type: Boolean,
      default: true
    }
  },
  
  // Pricing
  pricing: {
    dailyRate: {
      type: Number,
      required: true
    },
    insuranceAccepted: [{
      type: String
    }],
    selfPayDiscount: {
      type: Number,
      default: 0
    }
  },
  
  // Maintenance and cleaning
  maintenance: {
    lastCleaned: {
      type: Date,
      default: Date.now
    },
    nextCleaning: {
      type: Date
    },
    lastMaintenance: {
      type: Date
    },
    nextMaintenance: {
      type: Date
    },
    maintenanceNotes: String
  },
  
  // Occupancy history
  occupancyHistory: [{
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    admission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PatientAdmission'
    },
    checkIn: {
      type: Date,
      required: true
    },
    checkOut: {
      type: Date
    },
    duration: Number, // in hours
    reason: String
  }],
  
  // Real-time status updates
  statusUpdates: [{
    status: {
      type: String,
      enum: ['available', 'occupied', 'reserved', 'maintenance', 'cleaning', 'out-of-service']
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Notes and special instructions
  notes: String,
  specialInstructions: String,
  
  // Location coordinates for mapping
  coordinates: {
    x: Number,
    y: Number,
    floor: Number
  }
}, {
  timestamps: true
});

// Indexes
bedSchema.index({ hospital: 1, department: 1 });
bedSchema.index({ hospital: 1, status: 1 });
bedSchema.index({ hospital: 1, bedType: 1 });
bedSchema.index({ currentPatient: 1 });
bedSchema.index({ 'specifications.isElectric': 1 });
bedSchema.index({ 'specifications.hasMonitoring': 1 });

// Pre-save middleware
bedSchema.pre('save', function(next) {
  // Update status update history
  if (this.isModified('status')) {
    this.statusUpdates.push({
      status: this.status,
      updatedBy: this.currentPatient || null,
      timestamp: new Date()
    });
  }
  
  // Calculate occupancy duration
  if (this.isModified('currentPatient') && this.currentPatient) {
    const lastOccupancy = this.occupancyHistory[this.occupancyHistory.length - 1];
    if (lastOccupancy && !lastOccupancy.checkOut) {
      const duration = Math.floor((new Date() - lastOccupancy.checkIn) / (1000 * 60 * 60));
      lastOccupancy.duration = duration;
    }
  }
  
  next();
});

// Methods
bedSchema.methods.assignPatient = function(patientId, admissionId, reason = '') {
  this.currentPatient = patientId;
  this.admission = admissionId;
  this.status = 'occupied';
  
  this.occupancyHistory.push({
    patient: patientId,
    admission: admissionId,
    checkIn: new Date(),
    reason
  });
  
  return this.save();
};

bedSchema.methods.dischargePatient = function() {
  if (this.occupancyHistory.length > 0) {
    const lastOccupancy = this.occupancyHistory[this.occupancyHistory.length - 1];
    if (!lastOccupancy.checkOut) {
      lastOccupancy.checkOut = new Date();
      const duration = Math.floor((lastOccupancy.checkOut - lastOccupancy.checkIn) / (1000 * 60 * 60));
      lastOccupancy.duration = duration;
    }
  }
  
  this.currentPatient = null;
  this.admission = null;
  this.status = 'cleaning';
  
  return this.save();
};

bedSchema.methods.reserveBed = function(reservedBy, reason = '') {
  this.status = 'reserved';
  this.statusUpdates.push({
    status: 'reserved',
    updatedBy: reservedBy,
    reason,
    timestamp: new Date()
  });
  
  return this.save();
};

bedSchema.methods.markAvailable = function(updatedBy) {
  this.status = 'available';
  this.statusUpdates.push({
    status: 'available',
    updatedBy,
    timestamp: new Date()
  });
  
  return this.save();
};

bedSchema.methods.startMaintenance = function(updatedBy, notes = '') {
  this.status = 'maintenance';
  this.maintenance.maintenanceNotes = notes;
  this.maintenance.lastMaintenance = new Date();
  
  this.statusUpdates.push({
    status: 'maintenance',
    updatedBy,
    reason: notes,
    timestamp: new Date()
  });
  
  return this.save();
};

// Virtual for current occupancy duration
bedSchema.virtual('currentOccupancyDuration').get(function() {
  if (this.currentPatient && this.occupancyHistory.length > 0) {
    const lastOccupancy = this.occupancyHistory[this.occupancyHistory.length - 1];
    if (!lastOccupancy.checkOut) {
      return Math.floor((new Date() - lastOccupancy.checkIn) / (1000 * 60 * 60));
    }
  }
  return 0;
});

// Virtual for bed availability status
bedSchema.virtual('isAvailable').get(function() {
  return this.status === 'available';
});

// Virtual for bed type display
bedSchema.virtual('bedTypeDisplay').get(function() {
  const typeMap = {
    'general': 'General Ward',
    'semi-private': 'Semi-Private',
    'private': 'Private Room',
    'icu': 'ICU',
    'nicu': 'NICU',
    'emergency': 'Emergency',
    'isolation': 'Isolation'
  };
  return typeMap[this.bedType] || this.bedType;
});

const BedManagement = mongoose.model('BedManagement', bedSchema);

export default BedManagement; 