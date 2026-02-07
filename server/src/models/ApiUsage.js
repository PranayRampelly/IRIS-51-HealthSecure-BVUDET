import mongoose from 'mongoose';

const apiUsageSchema = new mongoose.Schema({
  endpoint: {
    type: String,
    required: true,
  },
  method: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  apiKeyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ApiKey',
  },
  responseTime: {
    type: Number,
    required: true,
  },
  statusCode: {
    type: Number,
    required: true,
  },
  success: {
    type: Boolean,
    required: true,
  },
  error: {
    type: String,
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries
apiUsageSchema.index({ endpoint: 1, date: -1 });
apiUsageSchema.index({ userId: 1, date: -1 });
apiUsageSchema.index({ apiKeyId: 1, date: -1 });
apiUsageSchema.index({ date: 1 }, { expireAfterSeconds: 7776000 }); // 90 days TTL

const ApiUsage = mongoose.model('ApiUsage', apiUsageSchema);
export default ApiUsage;

