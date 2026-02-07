import mongoose from 'mongoose';

const emergencyResponseSchema = new mongoose.Schema({
  // Emergency call info
  emergencyNumber: {
    type: String,
    required: true,
    unique: true
  },
  caller: {
    name: String,
    phone: String,
    relationship: String
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Emergency details
  emergencyType: {
    type: String,
    enum: ['medical', 'trauma', 'cardiac', 'respiratory', 'neurological', 'pediatric', 'obstetric', 'psychiatric', 'overdose', 'accident'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent', 'emergency'],
    default: 'normal'
  },
  severity: {
    type: String,
    enum: ['minor', 'moderate', 'severe', 'critical', 'life-threatening'],
    default: 'moderate'
  },
  
  // Location information
  location: {
    address: {
      type: String,
      required: true
    },
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    landmarks: String,
    accessNotes: String
  },
  
  // Emergency description
  symptoms: [String],
  description: {
    type: String,
    required: true
  },
  additionalInfo: String,
  
  // Response tracking
  status: {
    type: String,
    enum: ['received', 'processing', 'dispatched', 'en-route', 'on-scene', 'transporting', 'arrived', 'completed', 'cancelled'],
    default: 'received'
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
    notes: String,
    location: {
      latitude: Number,
      longitude: Number
    }
  }],
  
  // Timing
  callReceivedAt: {
    type: Date,
    required: true
  },
  dispatchTime: Date,
  enRouteTime: Date,
  onSceneTime: Date,
  transportStartTime: Date,
  arrivalTime: Date,
  completionTime: Date,
  
  // Response times
  responseTime: Number, // in minutes
  transportTime: Number, // in minutes
  totalTime: Number, // in minutes
  
  // Hospital assignment
  assignedHospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedDepartment: String,
  
  // Ambulance assignment
  assignedAmbulance: {
    ambulanceId: String,
    vehicleNumber: String,
    crew: [{
      name: String,
      role: {
        type: String,
        enum: ['driver', 'paramedic', 'emt', 'nurse', 'doctor']
      },
      phone: String
    }]
  },
  
  // Real-time tracking
  currentLocation: {
    latitude: Number,
    longitude: Number,
    timestamp: {
      type: Date,
      default: Date.now
    },
    speed: Number,
    heading: Number
  },
  
  // Patient information
  patientInfo: {
    name: String,
    age: Number,
    gender: String,
    weight: Number,
    allergies: [String],
    medications: [String],
    medicalHistory: String,
    vitalSigns: {
      bloodPressure: String,
      heartRate: String,
      temperature: String,
      respiratoryRate: String,
      oxygenSaturation: String,
      consciousness: String
    }
  },
  
  // Treatment provided
  treatmentProvided: [{
    treatment: String,
    time: {
      type: Date,
      default: Date.now
    },
    providedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }],
  
  // Communication
  communications: [{
    type: {
      type: String,
      enum: ['call', 'text', 'radio', 'hospital-communication']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    from: String,
    to: String,
    message: String,
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read'],
      default: 'sent'
    }
  }],
  
  // Hospital capacity check
  hospitalCapacity: {
    emergencyBeds: Number,
    icuBeds: Number,
    traumaBeds: Number,
    waitTime: Number,
    status: {
      type: String,
      enum: ['available', 'limited', 'full', 'overflow'],
      default: 'available'
    }
  },
  
  // Outcome
  outcome: {
    type: String,
    enum: ['transported', 'treated-on-scene', 'refused-transport', 'deceased', 'other'],
    default: 'transported'
  },
  outcomeNotes: String,
  
  // Follow-up
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpAppointment: Date,
  followUpNotes: String,
  
  // Quality metrics
  qualityMetrics: {
    responseTimeTarget: Number, // in minutes
    responseTimeActual: Number, // in minutes
    transportTimeTarget: Number, // in minutes
    transportTimeActual: Number, // in minutes
    patientSatisfaction: {
      type: Number,
      min: 1,
      max: 5
    },
    clinicalOutcome: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor']
    }
  },
  
  // Audit trail
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
emergencyResponseSchema.index({ status: 1, callReceivedAt: 1 });
emergencyResponseSchema.index({ assignedHospital: 1, status: 1 });
emergencyResponseSchema.index({ priority: 1, status: 1 });
emergencyResponseSchema.index({ 'location.coordinates': '2dsphere' });

// Pre-save middleware
emergencyResponseSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      updatedBy: this.updatedBy || this.createdBy
    });
  }
  next();
});

// Generate emergency number
emergencyResponseSchema.pre('save', function(next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.emergencyNumber = `EMG-${year}${month}${day}-${random}`;
  }
  next();
});

// Methods
emergencyResponseSchema.methods.updateStatus = function(newStatus, updatedBy, notes = '', location = null) {
  this.status = newStatus;
  this.updatedBy = updatedBy;
  
  const statusUpdate = {
    status: newStatus,
    timestamp: new Date(),
    updatedBy: updatedBy
  };
  
  if (notes) statusUpdate.notes = notes;
  if (location) statusUpdate.location = location;
  
  this.statusHistory.push(statusUpdate);
  
  // Update timing based on status
  switch (newStatus) {
    case 'dispatched':
      this.dispatchTime = new Date();
      break;
    case 'en-route':
      this.enRouteTime = new Date();
      break;
    case 'on-scene':
      this.onSceneTime = new Date();
      break;
    case 'transporting':
      this.transportStartTime = new Date();
      break;
    case 'arrived':
      this.arrivalTime = new Date();
      break;
    case 'completed':
      this.completionTime = new Date();
      break;
  }
  
  return this.save();
};

emergencyResponseSchema.methods.updateLocation = function(latitude, longitude, speed = null, heading = null) {
  this.currentLocation = {
    latitude,
    longitude,
    timestamp: new Date(),
    speed,
    heading
  };
  return this.save();
};

emergencyResponseSchema.methods.addCommunication = function(type, from, to, message) {
  this.communications.push({
    type,
    from,
    to,
    message
  });
  return this.save();
};

emergencyResponseSchema.methods.addTreatment = function(treatment, providedBy, notes = '') {
  this.treatmentProvided.push({
    treatment,
    providedBy,
    notes
  });
  return this.save();
};

emergencyResponseSchema.methods.calculateResponseTime = function() {
  if (this.onSceneTime && this.callReceivedAt) {
    this.responseTime = Math.floor((this.onSceneTime - this.callReceivedAt) / (1000 * 60));
  }
  return this.responseTime || 0;
};

emergencyResponseSchema.methods.calculateTransportTime = function() {
  if (this.arrivalTime && this.transportStartTime) {
    this.transportTime = Math.floor((this.arrivalTime - this.transportStartTime) / (1000 * 60));
  }
  return this.transportTime || 0;
};

emergencyResponseSchema.methods.calculateTotalTime = function() {
  if (this.completionTime && this.callReceivedAt) {
    this.totalTime = Math.floor((this.completionTime - this.callReceivedAt) / (1000 * 60));
  }
  return this.totalTime || 0;
};

// Virtual for hospital name
emergencyResponseSchema.virtual('hospitalName').get(function() {
  return this.assignedHospital?.hospitalName || '';
});

// Virtual for patient full name
emergencyResponseSchema.virtual('patientFullName').get(function() {
  return this.patient?.firstName && this.patient?.lastName 
    ? `${this.patient.firstName} ${this.patient.lastName}`
    : this.patientInfo?.name || '';
});

const EmergencyResponse = mongoose.model('EmergencyResponse', emergencyResponseSchema);

export default EmergencyResponse; 