import mongoose from 'mongoose';

const ambulanceTransportSchema = new mongoose.Schema({
  transportId: {
    type: String,
    unique: true,
    required: false // Auto-generated in pre-save hook
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  patient: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    patientId: {
      type: String,
      trim: true
    },
    age: {
      type: Number
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other']
    },
    weight: {
      type: Number
    },
    diagnosis: {
      type: String,
      trim: true
    },
    condition: {
      type: String,
      enum: ['stable', 'critical', 'unstable', 'ventilated', 'monitored'],
      default: 'stable'
    },
    medicalHistory: {
      type: String,
      trim: true
    },
    currentMedications: {
      type: String,
      trim: true
    },
    allergies: {
      type: String,
      trim: true
    }
  },
  transportType: {
    type: String,
    enum: ['inter_facility', 'discharge', 'appointment', 'emergency_transfer', 'specialist_referral', 'rehabilitation', 'other', 'emergency', 'scheduled', 'transfer', 'return'],
    required: true
  },
  origin: {
    type: {
      type: String,
      enum: ['hospital', 'clinic', 'home', 'other_facility'],
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    coordinates: {
      lat: Number,
      lng: Number
    },
    contact: {
      name: String,
      phone: String
    }
  },
  destination: {
    type: {
      type: String,
      enum: ['hospital', 'clinic', 'home', 'rehabilitation', 'other_facility'],
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    coordinates: {
      lat: Number,
      lng: Number
    },
    contact: {
      name: String,
      phone: String,
      department: String
    }
  },
  scheduling: {
    type: {
      type: String,
      enum: ['scheduled', 'urgent', 'emergency'],
      default: 'scheduled'
    },
    scheduledDateTime: {
      type: Date,
      required: true
    },
    estimatedDuration: {
      type: Number, // in minutes
      default: 30
    },
    actualDuration: {
      type: Number // in minutes
    }
  },
  dispatch: {
    ambulanceService: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AmbulanceService'
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AmbulanceDriver'
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AmbulanceService'
    },
    dispatchedAt: {
      type: Date
    },
    estimatedArrival: {
      type: Date
    },
    actualArrival: {
      type: Date
    },
    pickupTime: {
      type: Date
    },
    departureTime: {
      type: Date
    },
    arrivalTime: {
      type: Date
    }
  },
  medicalRequirements: {
    oxygen: {
      required: {
        type: Boolean,
        default: false
      },
      flowRate: String,
      concentration: String
    },
    ventilator: {
      required: {
        type: Boolean,
        default: false
      },
      settings: String
    },
    cardiacMonitor: {
      type: Boolean,
      default: false
    },
    ivAccess: {
      type: Boolean,
      default: false
    },
    medicationPump: {
      type: Boolean,
      default: false
    },
    isolation: {
      type: Boolean,
      default: false
    },
    specialEquipment: [{
      type: String,
      trim: true
    }]
  },
  medicalTeam: {
    paramedic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    nurse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respiratoryTherapist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  vitalSigns: {
    preTransport: {
      bloodPressure: {
        systolic: Number,
        diastolic: Number
      },
      heartRate: Number,
      respiratoryRate: Number,
      temperature: Number,
      oxygenSaturation: Number,
      recordedAt: Date
    },
    duringTransport: [{
      bloodPressure: {
        systolic: Number,
        diastolic: Number
      },
      heartRate: Number,
      respiratoryRate: Number,
      temperature: Number,
      oxygenSaturation: Number,
      recordedAt: {
        type: Date,
        default: Date.now
      }
    }],
    postTransport: {
      bloodPressure: {
        systolic: Number,
        diastolic: Number
      },
      heartRate: Number,
      respiratoryRate: Number,
      temperature: Number,
      oxygenSaturation: Number,
      recordedAt: Date
    }
  },
  interventions: [{
    type: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    performedAt: {
      type: Date,
      default: Date.now
    },
    outcome: {
      type: String,
      trim: true
    }
  }],
  medications: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    dosage: {
      type: String,
      trim: true
    },
    route: {
      type: String,
      enum: ['oral', 'iv', 'im', 'subcutaneous', 'inhalation', 'topical']
    },
    administeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    administeredAt: {
      type: Date,
      default: Date.now
    }
  }],
  documents: [{
    type: {
      type: String,
      enum: ['transfer_form', 'medical_record', 'consent_form', 'photo', 'video', 'other']
    },
    name: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    cloudinaryId: {
      type: String
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['scheduled', 'dispatched', 'en_route', 'arrived', 'loading', 'in_transit', 'completed', 'cancelled'],
    default: 'scheduled',
    index: true
  },
  timeline: [{
    status: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: {
      type: String,
      trim: true
    }
  }],
  handover: {
    originHandover: {
      receivedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      receivedAt: Date,
      notes: String
    },
    destinationHandover: {
      receivedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      receivedAt: Date,
      notes: String
    }
  },
  notes: {
    type: String,
    trim: true
  },
  outcome: {
    type: String,
    enum: ['successful', 'complications', 'delayed', 'cancelled'],
    trim: true
  },
  billing: {
    estimatedCost: {
      type: Number,
      default: 0
    },
    finalCost: {
      type: Number,
      default: 0
    },
    distance: {
      type: Number, // in kilometers
      default: 0
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'insurance', 'online']
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    insurance: {
      provider: String,
      memberId: String,
      claimNumber: String
    }
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
ambulanceTransportSchema.index({ hospital: 1, status: 1 });
ambulanceTransportSchema.index({ hospital: 1, createdAt: -1 });
ambulanceTransportSchema.index({ 'scheduling.scheduledDateTime': 1 });
// transportId already has unique: true which creates an index, so no need for duplicate

// Generate unique transport ID before saving
ambulanceTransportSchema.pre('save', async function(next) {
  if (!this.transportId) {
    try {
      const count = await mongoose.model('AmbulanceTransport').countDocuments();
      this.transportId = `TRANS-${Date.now()}-${String(count + 1).padStart(4, '0')}`;
    } catch (error) {
      // Fallback if model not registered yet
      this.transportId = `TRANS-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    }
  }
  next();
});

// Add status to timeline when status changes
ambulanceTransportSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.timeline.push({
      status: this.status,
      timestamp: new Date(),
      updatedBy: this.updatedBy || this.createdBy
    });
  }
  next();
});

const AmbulanceTransport = mongoose.model('AmbulanceTransport', ambulanceTransportSchema);

export default AmbulanceTransport;


