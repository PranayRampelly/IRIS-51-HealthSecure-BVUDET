import mongoose from 'mongoose';

const environmentAlertSchema = new mongoose.Schema({
  alertId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['air_quality', 'temperature', 'humidity', 'pollution', 'weather', 'climate'],
    required: true,
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true,
    index: true,
  },
  region: {
    type: String,
    required: true,
    index: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  coordinates: {
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
  },
  message: {
    type: String,
    required: true,
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  recommendation: {
    type: String,
    required: true,
  },
  affectedPopulation: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['active', 'acknowledged', 'resolved', 'expired'],
    default: 'active',
    index: true,
  },
  acknowledgedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  acknowledgedAt: {
    type: Date,
  },
  resolvedAt: {
    type: Date,
  },
  expiresAt: {
    type: Date,
  },
  source: {
    type: String,
    enum: ['Environment Agent', 'Manual', 'API'],
    default: 'Environment Agent',
  },
  metadata: {
    apiSource: String,
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 80,
    },
  },
}, {
  timestamps: true,
});

// Indexes
environmentAlertSchema.index({ status: 1, severity: 1, createdAt: -1 });
environmentAlertSchema.index({ region: 1, status: 1 });
environmentAlertSchema.index({ type: 1, severity: 1 });
environmentAlertSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const EnvironmentAlert = mongoose.model('EnvironmentAlert', environmentAlertSchema);

export default EnvironmentAlert;

