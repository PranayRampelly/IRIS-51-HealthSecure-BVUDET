import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  // Payment identification
  paymentId: {
    type: String,
    required: true,
    unique: true
  },
  razorpayOrderId: {
    type: String,
    required: function() {
      return this.paymentMethod === 'online';
    }
  },
  razorpayPaymentId: {
    type: String,
    required: function() {
      return this.paymentMethod === 'online' && this.status === 'completed';
    }
  },
  
  // Appointment reference (optional for temporary appointments)
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: false // Make it optional to allow temporary IDs
  },
  // Store complete appointment data for temporary appointments
  appointmentData: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Payment details
  amount: {
    type: Number,
    required: true
  },
  baseAmount: {
    type: Number,
    required: true,
    default: function() {
      return this.amount; // Default to amount if not specified
    }
  },
  convenienceFee: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  consultationType: {
    type: String,
    enum: ['online', 'in-person'],
    required: true
  },
  
  // Payment status
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  
  // Payment method
  paymentMethod: {
    type: String,
    enum: ['online', 'offline'],
    required: true
  },
  
  // Offline payment specific fields
  offlinePayment: {
    receiptNumber: {
      type: String,
      unique: true,
      sparse: true
    },
    paymentToken: {
      type: String,
      unique: true,
      sparse: true
    },
    paymentDate: Date,
    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    paymentProof: {
      type: String // URL to uploaded receipt/image
    }
  },
  
  // Razorpay response data
  razorpayData: {
    order: Object,
    payment: Object,
    signature: String
  },
  
  // Error information
  errorCode: String,
  errorDescription: String,
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  
  // Audit trail
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for performance
paymentSchema.index({ appointment: 1 });
paymentSchema.index({ patient: 1 });
paymentSchema.index({ status: 1 });
// Note: Do not add explicit indexes for fields already marked `unique: true`
// to avoid duplicate index warnings in Mongoose. Unique fields:
// - paymentId (auto-generated)
// - offlinePayment.receiptNumber
// - offlinePayment.paymentToken

// Generate payment ID before validation so the required validator passes
paymentSchema.pre('validate', function(next) {
  if (this.isNew && !this.paymentId) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.paymentId = `PAY-${year}${month}${day}-${random}`;
  }
  next();
});

// Generate offline payment receipt number
paymentSchema.methods.generateOfflineReceipt = function() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  // Initialize offlinePayment if it doesn't exist
  if (!this.offlinePayment) {
    this.offlinePayment = {};
  }
  
  this.offlinePayment.receiptNumber = `RCP-${year}${month}${day}-${random}`;
  return this.offlinePayment.receiptNumber;
};

// Generate offline payment token
paymentSchema.methods.generatePaymentToken = function() {
  // Initialize offlinePayment if it doesn't exist
  if (!this.offlinePayment) {
    this.offlinePayment = {};
  }
  
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
  this.offlinePayment.paymentToken = token;
  return token;
};

// Update payment status
paymentSchema.methods.updateStatus = function(newStatus, additionalData = {}) {
  this.status = newStatus;
  if (newStatus === 'completed') {
    this.completedAt = new Date();
  }
  
  // Update additional fields if provided
  Object.keys(additionalData).forEach(key => {
    if (this.schema.paths[key]) {
      this[key] = additionalData[key];
    }
  });
  
  return this.save();
};

// Virtual for payment summary
paymentSchema.virtual('paymentSummary').get(function() {
  return {
    paymentId: this.paymentId,
    amount: this.amount,
    currency: this.currency,
    status: this.status,
    consultationType: this.consultationType,
    paymentMethod: this.paymentMethod,
    receiptNumber: this.offlinePayment?.receiptNumber,
    paymentToken: this.offlinePayment?.paymentToken
  };
});

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
