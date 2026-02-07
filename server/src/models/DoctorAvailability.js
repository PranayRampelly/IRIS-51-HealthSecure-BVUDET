import mongoose from 'mongoose';

const breakTimeSchema = new mongoose.Schema({
  startTime: {
    type: String,
    required: true,
    default: '12:00'
  },
  endTime: {
    type: String,
    required: true,
    default: '13:00'
  },
  type: {
    type: String,
    enum: ['lunch', 'coffee', 'meeting', 'custom'],
    default: 'lunch'
  },
  description: {
    type: String,
    default: 'Lunch Break'
  }
});

const workingDaySchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    required: true
  },
  isWorking: {
    type: Boolean,
    default: false
  },
  startTime: {
    type: String,
    default: '09:00'
  },
  endTime: {
    type: String,
    default: '17:00'
  },
  breaks: [breakTimeSchema]
});

const doctorAvailabilitySchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  workingDays: [workingDaySchema],
  defaultStartTime: {
    type: String,
    default: '09:00'
  },
  defaultEndTime: {
    type: String,
    default: '17:00'
  },
  appointmentDuration: {
    type: Number,
    default: 30,
    min: 15,
    max: 120
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastOnlineAt: {
    type: Date,
    default: Date.now
  },
  autoSave: {
    type: Boolean,
    default: true
  },
  realTimeUpdates: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['available', 'unavailable', 'busy', 'away'],
    default: 'unavailable'
  },
  currentStatus: {
    isWorkingToday: {
      type: Boolean,
      default: false
    },
    isWithinWorkingHours: {
      type: Boolean,
      default: false
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  settings: {
    allowSameDayBookings: {
      type: Boolean,
      default: true
    },
    maxAdvanceBookingDays: {
      type: Number,
      default: 30
    },
    bufferTimeBetweenAppointments: {
      type: Number,
      default: 5
    },
    emergencySlotDuration: {
      type: Number,
      default: 15
    }
  },
  analytics: {
    totalWorkingHours: {
      type: Number,
      default: 0
    },
    totalSlotsPerDay: {
      type: Number,
      default: 0
    },
    weeklyAvailability: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
doctorAvailabilitySchema.index({ isOnline: 1 });
doctorAvailabilitySchema.index({ status: 1 });

// Pre-save middleware to calculate analytics
doctorAvailabilitySchema.pre('save', function(next) {
  this.calculateAnalytics();
  next();
});

// Instance methods
doctorAvailabilitySchema.methods.calculateAnalytics = function() {
  const workingDays = this.workingDays.filter(day => day.isWorking);
  this.analytics.weeklyAvailability = workingDays.length;
  
  if (workingDays.length > 0) {
    // Use the first working day's times for calculation, or fall back to defaults
    const firstWorkingDay = workingDays.find(day => day.isWorking) || workingDays[0];
    const startTime = new Date(`2000-01-01T${firstWorkingDay.startTime}`);
    const endTime = new Date(`2000-01-01T${firstWorkingDay.endTime}`);
    const workingHours = (endTime - startTime) / (1000 * 60 * 60);
    
    // Calculate total break time for the day
    const totalBreakTime = firstWorkingDay.breaks.reduce((total, break_) => {
      const breakStart = new Date(`2000-01-01T${break_.startTime}`);
      const breakEnd = new Date(`2000-01-01T${break_.endTime}`);
      return total + (breakEnd - breakStart) / (1000 * 60 * 60);
    }, 0);
    
    const availableHours = workingHours - totalBreakTime;
    this.analytics.totalWorkingHours = availableHours * workingDays.length;
    this.analytics.totalSlotsPerDay = Math.floor(availableHours * 60 / this.appointmentDuration);
  }
};

doctorAvailabilitySchema.methods.updateCurrentStatus = function() {
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  
  const todaySchedule = this.workingDays.find(day => day.day === currentDay);
  this.currentStatus.isWorkingToday = todaySchedule ? todaySchedule.isWorking : false;
  
  if (this.currentStatus.isWorkingToday) {
    const currentTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    this.currentStatus.isWithinWorkingHours = 
      currentTime >= todaySchedule.startTime && currentTime <= todaySchedule.endTime;
  } else {
    this.currentStatus.isWithinWorkingHours = false;
  }
  
  this.currentStatus.lastUpdated = now;
  
  // Update overall status
  if (this.isOnline && this.currentStatus.isWorkingToday && this.currentStatus.isWithinWorkingHours) {
    this.status = 'available';
  } else if (this.isOnline && this.currentStatus.isWorkingToday) {
    this.status = 'away';
  } else {
    this.status = 'unavailable';
  }
};

doctorAvailabilitySchema.methods.getAvailableSlots = function(date) {
  const targetDate = new Date(date);
  const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  
  const daySchedule = this.workingDays.find(day => day.day === dayName);
  if (!daySchedule || !daySchedule.isWorking) {
    return [];
  }
  
  const slots = [];
  const startTime = new Date(`2000-01-01T${daySchedule.startTime}`);
  const endTime = new Date(`2000-01-01T${daySchedule.endTime}`);
  
  let currentTime = new Date(startTime);
  
  while (currentTime < endTime) {
    const slotStart = new Date(currentTime);
    const slotEnd = new Date(currentTime.getTime() + this.appointmentDuration * 60000);
    
    // Check if slot conflicts with any breaks
    const conflictsWithBreak = daySchedule.breaks.some(break_ => {
      const breakStart = new Date(`2000-01-01T${break_.startTime}`);
      const breakEnd = new Date(`2000-01-01T${break_.endTime}`);
      return slotStart < breakEnd && slotEnd > breakStart;
    });
    
    if (!conflictsWithBreak) {
      slots.push({
        startTime: slotStart.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        endTime: slotEnd.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        duration: this.appointmentDuration,
        isAvailable: true
      });
    }
    
    currentTime = new Date(currentTime.getTime() + this.appointmentDuration * 60000);
  }
  
  return slots;
};

// Static methods
doctorAvailabilitySchema.statics.findByDoctorId = function(doctorId) {
  return this.findOne({ doctorId }).populate('doctorId', 'name email role');
};

doctorAvailabilitySchema.statics.updateOnlineStatus = function(doctorId, isOnline) {
  return this.findOneAndUpdate(
    { doctorId },
    { 
      isOnline, 
      lastOnlineAt: new Date(),
      status: isOnline ? 'available' : 'unavailable'
    },
    { new: true }
  );
};

const DoctorAvailability = mongoose.model('DoctorAvailability', doctorAvailabilitySchema);

export default DoctorAvailability;
