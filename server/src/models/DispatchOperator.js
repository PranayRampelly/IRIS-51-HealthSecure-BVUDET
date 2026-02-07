import mongoose from 'mongoose';

const dispatchOperatorSchema = new mongoose.Schema({
  operatorId: {
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
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['available', 'busy', 'offline', 'break', 'training'],
    default: 'offline'
  },
  currentCall: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AmbulanceCall'
  },
  callsHandled: {
    type: Number,
    default: 0,
    min: 0
  },
  averageResponseTime: {
    type: Number,
    default: 0,
    min: 0
  },
  totalCalls: {
    type: Number,
    default: 0,
    min: 0
  },
  completedCalls: {
    type: Number,
    default: 0,
    min: 0
  },
  performance: {
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    efficiency: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    lastUpdated: Date
  },
  shift: {
    startTime: Date,
    endTime: Date,
    isActive: {
      type: Boolean,
      default: false
    }
  },
  preferences: {
    maxConcurrentCalls: {
      type: Number,
      default: 1,
      min: 1,
      max: 5
    },
    notificationSettings: {
      sound: {
        type: Boolean,
        default: true
      },
      vibration: {
        type: Boolean,
        default: true
      }
    }
  },
  lastActivity: Date,
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
dispatchOperatorSchema.index({ hospital: 1, status: 1 });
dispatchOperatorSchema.index({ hospital: 1, user: 1 });
dispatchOperatorSchema.index({ status: 1, currentCall: 1 });

// Generate unique operator ID before saving
dispatchOperatorSchema.pre('save', async function(next) {
  if (!this.operatorId) {
    try {
      const count = await mongoose.model('DispatchOperator').countDocuments();
      this.operatorId = `OP-${Date.now()}-${String(count + 1).padStart(4, '0')}`;
    } catch (error) {
      // Fallback if model not registered yet
      this.operatorId = `OP-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    }
  }
  next();
});

const DispatchOperator = mongoose.model('DispatchOperator', dispatchOperatorSchema);

export default DispatchOperator;


