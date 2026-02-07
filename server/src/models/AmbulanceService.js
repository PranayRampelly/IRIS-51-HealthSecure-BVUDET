import mongoose from 'mongoose';

const ambulanceServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['basic', 'advanced', 'cardiac', 'neonatal', 'trauma', 'critical-care', 'bariatric'],
    required: true
  },
  available: {
    type: Boolean,
    default: true
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contact: {
    type: String,
    required: true,
    trim: true
  },
  vehicleNumber: {
    type: String,
    required: true,
    trim: true
  },
  assignedDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AmbulanceDriver'
  },
  specifications: {
    make: { type: String, trim: true },
    model: { type: String, trim: true },
    year: Number,
    engine: String,
    transmission: String,
    fuelType: String
  },
  maintenance: {
    totalCost: { type: Number, default: 0 },
    lastService: Date,
    nextService: Date,
    serviceHistory: [{
      date: Date,
      type: String,
      cost: Number,
      description: String
    }]
  },
  insurance: {
    policyNumber: String,
    expiryDate: Date,
    coverage: String
  },
  performance: {
    mileage: { type: Number, default: 0 },
    fuelLevel: { type: Number, default: 100 },
    engineStatus: {
      type: String,
      enum: ['good', 'warning', 'critical'],
      default: 'good'
    },
    fuelEfficiency: Number
  },
  equipment: [{
    type: String,
    trim: true
  }],
  insuranceCovered: {
    type: Boolean,
    default: false
  },
  baseLocation: {
    type: String,
    required: true,
    trim: true
  },
  currentLocation: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    },
    address: {
      type: String,
      trim: true
    }
  },
  responseTime: {
    type: String,
    required: true,
    trim: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviews: {
    type: Number,
    default: 0
  },
  price: {
    base: {
      type: Number,
      required: true,
      min: 0
    },
    perKm: {
      type: Number,
      required: true,
      min: 0
    },
    emergency: {
      type: Number,
      required: true,
      min: 0
    }
  },
  capabilities: {
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
  operatingHours: {
    start: {
      type: String,
      default: '00:00'
    },
    end: {
      type: String,
      default: '23:59'
    }
  },
  serviceAreas: [{
    type: String,
    trim: true
  }],
  certifications: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
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
ambulanceServiceSchema.index({ type: 1, available: 1 });
ambulanceServiceSchema.index({ 'currentLocation.lat': 1, 'currentLocation.lng': 1 });
ambulanceServiceSchema.index({ status: 1 });
ambulanceServiceSchema.index({ rating: -1 });
ambulanceServiceSchema.index({ hospital: 1 });

// Virtual for estimated ETA
ambulanceServiceSchema.virtual('eta').get(function () {
  const responseTime = this.responseTime;
  if (responseTime.includes('-')) {
    return responseTime;
  }
  return `${responseTime} minutes`;
});

// Method to check if service is available at given time
ambulanceServiceSchema.methods.isAvailableAt = function (time) {
  if (!this.available || this.status !== 'active') {
    return false;
  }

  const currentTime = new Date();
  const startTime = new Date();
  const endTime = new Date();

  const [startHour, startMin] = this.operatingHours.start.split(':');
  const [endHour, endMin] = this.operatingHours.end.split(':');

  startTime.setHours(parseInt(startHour), parseInt(startMin), 0);
  endTime.setHours(parseInt(endHour), parseInt(endMin), 0);

  return currentTime >= startTime && currentTime <= endTime;
};

// Method to calculate estimated cost
ambulanceServiceSchema.methods.calculateCost = function (distance, urgency = 'medium', needs = {}) {
  let baseCost = this.price.base;
  let distanceCost = this.price.perKm * distance;
  let emergencySurcharge = urgency === 'critical' ? this.price.emergency : 0;

  // Add surcharges for medical needs
  let needsSurcharge = 0;
  if (needs.oxygen) needsSurcharge += 40;
  if (needs.ventilator) needsSurcharge += 90;
  if (needs.cardiacMonitor) needsSurcharge += 35;
  if (needs.neonatal) needsSurcharge += 60;
  if (needs.bariatric) needsSurcharge += 50;

  // Urgency multiplier
  let urgencyMultiplier = 1;
  switch (urgency) {
    case 'critical': urgencyMultiplier = 1.4; break;
    case 'high': urgencyMultiplier = 1.2; break;
    case 'medium': urgencyMultiplier = 1.0; break;
    case 'low': urgencyMultiplier = 0.9; break;
  }

  return Math.round((baseCost + distanceCost + emergencySurcharge + needsSurcharge) * urgencyMultiplier);
};

const AmbulanceService = mongoose.model('AmbulanceService', ambulanceServiceSchema);

export default AmbulanceService;

