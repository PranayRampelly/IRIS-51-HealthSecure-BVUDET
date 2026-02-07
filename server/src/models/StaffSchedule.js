import mongoose from 'mongoose';

const staffScheduleSchema = new mongoose.Schema({
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'staffType'
  },
  staffType: {
    type: String,
    enum: ['doctor', 'nurse', 'technician', 'other'],
    required: true
  },
  scheduleDate: {
    type: Date,
    required: true
  },
  shift: {
    type: String,
    enum: ['day', 'night', 'evening', 'on-call'],
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'cancelled', 'completed'],
    default: 'scheduled'
  },
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
staffScheduleSchema.index({ hospital: 1, scheduleDate: 1 });
staffScheduleSchema.index({ hospital: 1, staffId: 1, scheduleDate: 1 });
staffScheduleSchema.index({ hospital: 1, department: 1 });

const StaffSchedule = mongoose.model('StaffSchedule', staffScheduleSchema);

export default StaffSchedule;


