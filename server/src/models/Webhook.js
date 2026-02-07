import mongoose from 'mongoose';

const webhookSchema = new mongoose.Schema({
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
  url: {
    type: String,
    required: true,
    trim: true,
  },
  secret: {
    type: String,
    required: true,
  },
  events: [{
    type: String,
    enum: ['order.created', 'order.updated', 'inventory.low_stock', 'pharmacy.connected', 'health_index.updated'],
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'failed'],
    default: 'active',
  },
  lastTriggered: {
    type: Date,
  },
  lastResponse: {
    statusCode: Number,
    responseTime: Number,
    error: String,
  },
  successCount: {
    type: Number,
    default: 0,
  },
  failureCount: {
    type: Number,
    default: 0,
  },
  headers: {
    type: Map,
    of: String,
  },
}, {
  timestamps: true,
});

// Indexes
webhookSchema.index({ userId: 1, status: 1 });
webhookSchema.index({ url: 1 });

const Webhook = mongoose.model('Webhook', webhookSchema);
export default Webhook;

