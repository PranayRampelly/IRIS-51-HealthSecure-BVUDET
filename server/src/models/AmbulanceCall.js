import mongoose from 'mongoose';

const ambulanceCallSchema = new mongoose.Schema({
  callId: {
    type: String,
    unique: true,
    required: true
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  caller: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    relationship: {
      type: String,
      trim: true
    },
    location: {
      address: {
        type: String,
        required: true,
        trim: true
      },
      coordinates: {
        lat: Number,
        lng: Number
      }
    }
  },
  patient: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    age: {
      type: Number
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other']
    },
    condition: {
      type: String,
      required: true,
      trim: true
    },
    symptoms: {
      type: String,
      trim: true
    },
    medicalHistory: {
      type: String,
      trim: true
    },
    currentMedications: {
      type: String,
      trim: true
    }
  },
  emergencyDetails: {
    type: {
      type: String,
      enum: ['medical', 'trauma', 'cardiac', 'respiratory', 'neurological', 'pediatric', 'obstetric', 'psychiatric', 'other'],
      required: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
      required: true
    },
    estimatedSeverity: {
      type: String,
      enum: ['mild', 'moderate', 'severe', 'critical'],
      default: 'moderate'
    },
    description: {
      type: String,
      trim: true
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
    enRouteAt: {
      type: Date
    },
    arrivedAt: {
      type: Date
    }
  },
  destination: {
    type: {
      type: String,
      enum: ['hospital', 'clinic', 'home', 'other'],
      default: 'hospital'
    },
    name: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  status: {
    type: String,
    enum: ['pending', 'dispatched', 'en_route', 'arrived', 'in_transit', 'completed', 'cancelled'],
    default: 'pending',
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
    }
  },
  vitalSigns: {
    bloodPressure: {
      systolic: Number,
      diastolic: Number
    },
    heartRate: Number,
    respiratoryRate: Number,
    temperature: Number,
    oxygenSaturation: Number,
    glucose: Number,
    gcs: Number, // Glasgow Coma Scale
    recordedAt: Date
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
      enum: ['incident_report', 'medical_record', 'photo', 'video', 'other']
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
  notes: {
    type: String,
    trim: true
  },
  outcome: {
    type: String,
    enum: ['stable', 'improved', 'critical', 'deceased', 'transferred'],
    trim: true
  },
  handover: {
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    receivedAt: {
      type: Date
    },
    handoverNotes: {
      type: String,
      trim: true
    }
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
ambulanceCallSchema.index({ hospital: 1, status: 1 });
ambulanceCallSchema.index({ hospital: 1, createdAt: -1 });
ambulanceCallSchema.index({ 'emergencyDetails.priority': 1, status: 1 });
// callId already has unique: true which creates an index, so no need for duplicate

// Generate unique call ID before saving
ambulanceCallSchema.pre('save', async function(next) {
  if (!this.callId) {
    const count = await mongoose.model('AmbulanceCall').countDocuments();
    this.callId = `CALL-${Date.now()}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Add status to timeline when status changes
ambulanceCallSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.timeline.push({
      status: this.status,
      timestamp: new Date(),
      updatedBy: this.updatedBy || this.createdBy
    });
  }
  next();
});

const AmbulanceCall = mongoose.model('AmbulanceCall', ambulanceCallSchema);

export default AmbulanceCall;


