import mongoose from 'mongoose';

const apiKeySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  key: {
    type: String,
    required: true,
    unique: true,
  },
  keyHash: {
    type: String,
    required: true,
  },
  permissions: [{
    type: String,
    enum: ['read', 'write', 'admin'],
  }],
  endpoints: [{
    type: String,
  }],
  rateLimit: {
    type: Number,
    default: 1000, // requests per hour
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'revoked'],
    default: 'active',
  },
  lastUsed: {
    type: Date,
  },
  expiresAt: {
    type: Date,
  },
  usageCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Indexes
apiKeySchema.index({ userId: 1, status: 1 });
apiKeySchema.index({ keyHash: 1 });

const ApiKey = mongoose.model('ApiKey', apiKeySchema);
export default ApiKey;

