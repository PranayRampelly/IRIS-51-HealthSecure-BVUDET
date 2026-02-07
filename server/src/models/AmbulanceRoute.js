import mongoose from 'mongoose';

const ambulanceRouteSchema = new mongoose.Schema({
  routeId: {
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
  name: {
    type: String,
    required: true,
    trim: true
  },
  startLocation: {
    address: {
      type: String,
      required: true,
      trim: true
    },
    coordinates: {
      lat: {
        type: Number,
        required: true
      },
      lng: {
        type: Number,
        required: true
      }
    },
    name: {
      type: String,
      trim: true
    }
  },
  endLocation: {
    address: {
      type: String,
      required: true,
      trim: true
    },
    coordinates: {
      lat: {
        type: Number,
        required: true
      },
      lng: {
        type: Number,
        required: true
      }
    },
    name: {
      type: String,
      trim: true
    }
  },
  distance: {
    value: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      enum: ['km', 'miles'],
      default: 'km'
    }
  },
  estimatedTime: {
    value: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      enum: ['minutes', 'hours'],
      default: 'minutes'
    }
  },
  actualTime: {
    value: Number,
    unit: {
      type: String,
      enum: ['minutes', 'hours'],
      default: 'minutes'
    }
  },
  trafficLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'planned'],
    default: 'planned'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  assignedDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AmbulanceDriver'
  },
  assignedVehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AmbulanceService'
  },
  relatedCall: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AmbulanceCall'
  },
  relatedTransport: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AmbulanceTransport'
  },
  waypoints: [{
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    order: Number
  }],
  routeOptimization: {
    optimized: {
      type: Boolean,
      default: false
    },
    optimizationCriteria: [{
      type: String,
      enum: ['traffic', 'distance', 'time', 'priority']
    }],
    timeSaved: Number,
    fuelEfficiencyGain: Number,
    optimizedAt: Date
  },
  trafficAlerts: [{
    alertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TrafficAlert'
    },
    impact: {
      type: String,
      enum: ['low', 'medium', 'high']
    }
  }],
  notes: {
    type: String,
    trim: true
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

// Indexes
ambulanceRouteSchema.index({ hospital: 1, status: 1 });
ambulanceRouteSchema.index({ hospital: 1, createdAt: -1 });
ambulanceRouteSchema.index({ 'startLocation.coordinates.lat': 1, 'startLocation.coordinates.lng': 1 });
ambulanceRouteSchema.index({ 'endLocation.coordinates.lat': 1, 'endLocation.coordinates.lng': 1 });

// Generate unique route ID before saving
ambulanceRouteSchema.pre('save', async function(next) {
  if (!this.routeId) {
    try {
      const count = await mongoose.model('AmbulanceRoute').countDocuments();
      this.routeId = `ROUTE-${Date.now()}-${String(count + 1).padStart(4, '0')}`;
    } catch (error) {
      // Fallback if model not registered yet
      this.routeId = `ROUTE-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    }
  }
  next();
});

const AmbulanceRoute = mongoose.model('AmbulanceRoute', ambulanceRouteSchema);

export default AmbulanceRoute;


