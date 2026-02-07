import mongoose from 'mongoose';

const ambulanceBookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
    index: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ambulanceService: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AmbulanceService',
    required: true
  },
  patientDetails: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    age: {
      type: String,
      trim: true
    },
    weightKg: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    }
  },
  addresses: {
    pickup: {
      type: String,
      required: true,
      trim: true
    },
    dropoff: {
      type: String,
      required: true,
      trim: true
    }
  },
  emergencyDetails: {
    type: {
      type: String,
      required: true,
      trim: true
    },
    symptoms: {
      type: String,
      trim: true
    },
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    }
  },
  medicalNeeds: {
    oxygen: {
      type: Boolean,
      default: false
    },
    ventilator: {
      type: Boolean,
      default: false
    },
    cardiacMonitor: {
      type: Boolean,
      default: false
    },
    neonatal: {
      type: Boolean,
      default: false
    },
    bariatric: {
      type: Boolean,
      default: false
    },
    isolation: {
      type: Boolean,
      default: false
    },
    wheelchair: {
      type: Boolean,
      default: false
    },
    stretcher: {
      type: Boolean,
      default: true
    }
  },
  scheduling: {
    type: {
      type: String,
      enum: ['immediate', 'scheduled'],
      default: 'immediate'
    },
    scheduledDateTime: {
      type: Date
    },
    estimatedDistance: {
      type: Number,
      min: 0
    }
  },
  options: {
    shareLiveLocation: {
      type: Boolean,
      default: false
    },
    shareSms: {
      type: Boolean,
      default: false
    },
    notifyHospital: {
      type: Boolean,
      default: false
    },
    useInsurance: {
      type: Boolean,
      default: false
    }
  },
  insurance: {
    provider: {
      type: String,
      trim: true
    },
    memberId: {
      type: String,
      trim: true
    }
  },
  payment: {
    method: {
      type: String,
      enum: ['cash', 'card', 'insurance', 'online'],
      default: 'cash'
    },
    estimatedCost: {
      type: Number,
      required: true,
      min: 0
    },
    finalCost: {
      type: Number,
      min: 0
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    }
  },
  status: {
    current: {
      type: String,
      enum: ['pending', 'confirmed', 'dispatched', 'en_route', 'arrived', 'in_transit', 'completed', 'cancelled'],
      default: 'pending'
    },
    history: [{
      status: {
        type: String,
        enum: ['pending', 'confirmed', 'dispatched', 'en_route', 'arrived', 'in_transit', 'completed', 'cancelled']
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      note: {
        type: String,
        trim: true
      }
    }]
  },
  driver: {
    assigned: {
      type: Boolean,
      default: false
    },
    contact: {
      type: String,
      trim: true
    },
    name: {
      type: String,
      trim: true
    },
    vehicleNumber: {
      type: String,
      trim: true
    }
  },
  tracking: {
    currentLocation: {
      lat: Number,
      lng: Number,
      address: String
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
    dropoffTime: {
      type: Date
    }
  },
  notes: {
    patient: {
      type: String,
      trim: true
    },
    driver: {
      type: String,
      trim: true
    },
    admin: {
      type: String,
      trim: true
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
ambulanceBookingSchema.index({ patient: 1, createdAt: -1 });
ambulanceBookingSchema.index({ ambulanceService: 1 });
ambulanceBookingSchema.index({ 'status.current': 1 });
ambulanceBookingSchema.index({ 'emergencyDetails.urgency': 1 });

// Pre-save middleware to generate booking ID
ambulanceBookingSchema.pre('save', function(next) {
  if (!this.bookingId) {
    this.bookingId = `AMB-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  }
  
  // Update status history when status changes
  if (this.isModified('status.current')) {
    this.status.history.push({
      status: this.status.current,
      timestamp: new Date()
    });
  }
  
  next();
});

// Method to update status
ambulanceBookingSchema.methods.updateStatus = function(newStatus, note = '') {
  this.status.current = newStatus;
  this.status.history.push({
    status: newStatus,
    timestamp: new Date(),
    note: note
  });
  return this.save();
};

// Method to calculate estimated arrival time
ambulanceBookingSchema.methods.calculateETA = function() {
  const now = new Date();
  const estimatedMinutes = this.scheduling.estimatedDistance * 2; // Rough estimate: 2 minutes per km
  this.tracking.estimatedArrival = new Date(now.getTime() + estimatedMinutes * 60000);
  return this.save();
};

// Static method to get bookings by status
ambulanceBookingSchema.statics.getByStatus = function(status) {
  return this.find({ 'status.current': status })
    .populate('patient', 'firstName lastName email phone')
    .populate('ambulanceService', 'name type contact vehicleNumber')
    .sort({ createdAt: -1 });
};

// Static method to get urgent bookings
ambulanceBookingSchema.statics.getUrgentBookings = function() {
  return this.find({
    'emergencyDetails.urgency': { $in: ['high', 'critical'] },
    'status.current': { $in: ['pending', 'confirmed', 'dispatched'] }
  })
    .populate('patient', 'firstName lastName phone')
    .populate('ambulanceService', 'name type contact')
    .sort({ 'emergencyDetails.urgency': -1, createdAt: 1 });
};

const AmbulanceBooking = mongoose.model('AmbulanceBooking', ambulanceBookingSchema);

export default AmbulanceBooking;
