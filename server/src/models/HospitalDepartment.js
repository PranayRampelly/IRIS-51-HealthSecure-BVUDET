import mongoose from 'mongoose';

const hospitalDepartmentSchema = new mongoose.Schema({
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  name: {
    type: String,
    required: true,
    enum: ['Emergency', 'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Oncology', 'General Medicine', 'Surgery', 'Radiology', 'Laboratory', 'ICU', 'NICU', 'Psychiatry', 'Dermatology', 'Ophthalmology', 'ENT', 'Gynecology', 'Urology', 'Gastroenterology', 'Endocrinology']
  },
  
  description: {
    type: String,
    required: true
  },
  
  // Department head
  departmentHead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Staff management
  staff: [{
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['head', 'senior', 'junior', 'resident', 'intern'],
      default: 'junior'
    },
    specialization: String,
    availability: {
      type: String,
      enum: ['available', 'busy', 'off-duty', 'on-call'],
      default: 'available'
    },
    schedule: [{
      day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      },
      startTime: String,
      endTime: String,
      isWorking: {
        type: Boolean,
        default: true
      }
    }]
  }],
  
  // Capacity management
  capacity: {
    totalBeds: {
      type: Number,
      required: true,
      min: 0
    },
    availableBeds: {
      type: Number,
      required: true,
      min: 0
    },
    occupiedBeds: {
      type: Number,
      required: true,
      min: 0
    },
    reservedBeds: {
      type: Number,
      required: true,
      min: 0
    }
  },
  
  // Operating hours
  operatingHours: {
    monday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    tuesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    wednesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    thursday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    friday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    saturday: { open: String, close: String, isOpen: { type: Boolean, default: false } },
    sunday: { open: String, close: String, isOpen: { type: Boolean, default: false } }
  },
  
  // Emergency services
  emergencyServices: {
    isEmergencyDepartment: {
      type: Boolean,
      default: false
    },
    hasAmbulanceService: {
      type: Boolean,
      default: false
    },
    hasICU: {
      type: Boolean,
      default: false
    },
    hasOperatingRoom: {
      type: Boolean,
      default: false
    }
  },
  
  // Services offered
  services: [{
    name: String,
    description: String,
    isAvailable: {
      type: Boolean,
      default: true
    },
    cost: Number
  }],
  
  // Equipment and facilities
  equipment: [{
    name: String,
    quantity: Number,
    isFunctional: {
      type: Boolean,
      default: true
    },
    lastMaintenance: Date,
    nextMaintenance: Date
  }],
  
  // Real-time status
  status: {
    type: String,
    enum: ['operational', 'under-maintenance', 'overcrowded', 'closed'],
    default: 'operational'
  },
  
  // Wait times
  currentWaitTime: {
    type: Number, // in minutes
    default: 0
  },
  
  // Statistics
  statistics: {
    totalPatientsToday: {
      type: Number,
      default: 0
    },
    totalAppointmentsToday: {
      type: Number,
      default: 0
    },
    averageWaitTime: {
      type: Number,
      default: 0
    },
    patientSatisfaction: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    }
  },
  
  // Contact information
  contactInfo: {
    phone: String,
    extension: String,
    email: String,
    location: String
  },
  
  // Notes and announcements
  announcements: [{
    title: String,
    message: String,
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  }]
}, {
  timestamps: true
});

// Indexes
hospitalDepartmentSchema.index({ hospital: 1, name: 1 });
hospitalDepartmentSchema.index({ hospital: 1, status: 1 });
hospitalDepartmentSchema.index({ 'staff.doctor': 1 });

// Pre-save middleware to calculate bed occupancy
hospitalDepartmentSchema.pre('save', function(next) {
  if (this.capacity) {
    this.capacity.occupiedBeds = this.capacity.totalBeds - this.capacity.availableBeds - this.capacity.reservedBeds;
  }
  next();
});

// Methods
hospitalDepartmentSchema.methods.updateBedAvailability = function(change, type = 'available') {
  if (type === 'available') {
    this.capacity.availableBeds += change;
  } else if (type === 'occupied') {
    this.capacity.occupiedBeds += change;
  } else if (type === 'reserved') {
    this.capacity.reservedBeds += change;
  }
  
  // Ensure values don't go negative
  this.capacity.availableBeds = Math.max(0, this.capacity.availableBeds);
  this.capacity.occupiedBeds = Math.max(0, this.capacity.occupiedBeds);
  this.capacity.reservedBeds = Math.max(0, this.capacity.reservedBeds);
  
  return this.save();
};

hospitalDepartmentSchema.methods.addStaff = function(doctorId, role, specialization) {
  const existingStaff = this.staff.find(s => s.doctor.toString() === doctorId.toString());
  if (existingStaff) {
    existingStaff.role = role;
    existingStaff.specialization = specialization;
  } else {
    this.staff.push({
      doctor: doctorId,
      role,
      specialization,
      availability: 'available'
    });
  }
  return this.save();
};

hospitalDepartmentSchema.methods.removeStaff = function(doctorId) {
  this.staff = this.staff.filter(s => s.doctor.toString() !== doctorId.toString());
  return this.save();
};

hospitalDepartmentSchema.methods.updateStaffAvailability = function(doctorId, availability) {
  const staff = this.staff.find(s => s.doctor.toString() === doctorId.toString());
  if (staff) {
    staff.availability = availability;
  }
  return this.save();
};

hospitalDepartmentSchema.methods.addAnnouncement = function(title, message, priority = 'normal', expiresAt = null) {
  this.announcements.push({
    title,
    message,
    priority,
    expiresAt
  });
  return this.save();
};

hospitalDepartmentSchema.methods.getActiveAnnouncements = function() {
  const now = new Date();
  return this.announcements.filter(announcement => 
    announcement.isActive && 
    (!announcement.expiresAt || announcement.expiresAt > now)
  );
};

// Virtual for occupancy percentage
hospitalDepartmentSchema.virtual('occupancyPercentage').get(function() {
  if (this.capacity.totalBeds === 0) return 0;
  return Math.round((this.capacity.occupiedBeds / this.capacity.totalBeds) * 100);
});

// Virtual for availability percentage
hospitalDepartmentSchema.virtual('availabilityPercentage').get(function() {
  if (this.capacity.totalBeds === 0) return 0;
  return Math.round((this.capacity.availableBeds / this.capacity.totalBeds) * 100);
});

const HospitalDepartment = mongoose.model('HospitalDepartment', hospitalDepartmentSchema);

export default HospitalDepartment; 