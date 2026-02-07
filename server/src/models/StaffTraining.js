import mongoose from 'mongoose';

const staffTrainingSchema = new mongoose.Schema({
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  trainingType: {
    type: String,
    enum: ['mandatory', 'optional', 'certification', 'workshop', 'seminar'],
    default: 'optional'
  },
  category: {
    type: String,
    enum: ['clinical', 'administrative', 'safety', 'technology', 'compliance', 'other'],
    default: 'clinical'
  },
  instructor: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    credentials: String,
    organization: String
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  duration: {
    value: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      enum: ['hours', 'days'],
      default: 'hours'
    }
  },
  location: {
    type: String,
    enum: ['on-site', 'online', 'external'],
    default: 'on-site'
  },
  venue: {
    type: String,
    trim: true
  },
  maxParticipants: {
    type: Number,
    min: 1
  },
  participants: [{
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'participants.staffType'
    },
    staffType: {
      type: String,
      enum: ['doctor', 'nurse', 'technician', 'other'],
      required: true
    },
    status: {
      type: String,
      enum: ['registered', 'attended', 'completed', 'absent', 'cancelled'],
      default: 'registered'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    completedAt: Date,
    certificate: {
      url: String,
      issuedAt: Date
    }
  }],
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled', 'postponed'],
    default: 'scheduled'
  },
  materials: [{
    name: String,
    url: String,
    type: String
  }],
  cost: {
    type: Number,
    default: 0,
    min: 0
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
staffTrainingSchema.index({ hospital: 1, scheduledDate: 1 });
staffTrainingSchema.index({ hospital: 1, status: 1 });
staffTrainingSchema.index({ hospital: 1, trainingType: 1 });

const StaffTraining = mongoose.model('StaffTraining', staffTrainingSchema);

export default StaffTraining;


