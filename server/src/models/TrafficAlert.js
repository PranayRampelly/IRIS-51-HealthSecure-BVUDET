import mongoose from 'mongoose';

const trafficAlertSchema = new mongoose.Schema({
  alertId: {
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
  location: {
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
    }
  },
  type: {
    type: String,
    enum: ['accident', 'construction', 'congestion', 'weather', 'event', 'other'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  estimatedDelay: {
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
  status: {
    type: String,
    enum: ['active', 'resolved', 'expired'],
    default: 'active'
  },
  affectedRoutes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AmbulanceRoute'
  }],
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: Date,
  expiresAt: Date,
  metadata: {
    source: {
      type: String,
      enum: ['manual', 'api', 'system', 'user_report'],
      default: 'manual'
    },
    externalId: String,
    lastUpdated: Date
  }
}, {
  timestamps: true
});

// Indexes
trafficAlertSchema.index({ hospital: 1, status: 1 });
trafficAlertSchema.index({ hospital: 1, createdAt: -1 });
trafficAlertSchema.index({ 'location.coordinates.lat': 1, 'location.coordinates.lng': 1 });
trafficAlertSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired alerts

// Generate unique alert ID before saving
trafficAlertSchema.pre('save', async function(next) {
  if (!this.alertId) {
    try {
      const count = await mongoose.model('TrafficAlert').countDocuments();
      this.alertId = `ALERT-${Date.now()}-${String(count + 1).padStart(4, '0')}`;
    } catch (error) {
      // Fallback if model not registered yet
      this.alertId = `ALERT-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    }
  }
  next();
});

const TrafficAlert = mongoose.model('TrafficAlert', trafficAlertSchema);

export default TrafficAlert;


