import mongoose from 'mongoose';
import { calculateDistance } from '../utils/geoUtils.js';

const workingHoursSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    required: true
  },
  isWorking: {
    type: Boolean,
    default: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  slotDuration: {
    type: Number, // in minutes
    default: 30
  },
  breakTime: {
    start: String,
    end: String
  }
});

const locationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point'
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true,
    validate: {
      validator: function(v) {
        return v.length === 2 && 
               v[0] >= -180 && v[0] <= 180 && // longitude
               v[1] >= -90 && v[1] <= 90;     // latitude
      },
      message: 'Invalid coordinates'
    }
  }
});

const practiceLocationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    street: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function(v) {
          return /^\d{6}$/.test(v); // Indian pincode format
        },
        message: 'Invalid pincode format'
      }
    },
    country: {
      type: String,
      default: 'India',
      trim: true
    }
  },
  location: {
    type: locationSchema,
    required: true
    // Index created at schema level below
  },
  type: {
    type: String,
    enum: ['clinic', 'hospital', 'nursing_home', 'other'],
    required: true
  },
  contactNumber: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^\+?[\d\s-]{10,}$/.test(v);
      },
      message: 'Invalid contact number'
    }
  },
  workingHours: [workingHoursSchema],
  isActive: {
    type: Boolean,
    default: true
  }
});

const doctorSchema = new mongoose.Schema({
  userId: {
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
  specialization: {
    type: String,
    required: true,
    trim: true
  },
  qualifications: [{
    degree: {
      type: String,
      required: true,
      trim: true
    },
    institution: {
      type: String,
      required: true,
      trim: true
    },
    year: {
      type: Number,
      required: true,
      validate: {
        validator: function(v) {
          return v >= 1950 && v <= new Date().getFullYear();
        },
        message: 'Invalid year'
      }
    }
  }],
  experience: {
    type: Number, // in years
    required: true,
    min: 0
  },
  registrationNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  practiceLocations: [practiceLocationSchema],
  consultationFees: {
    online: {
      type: Number,
      required: true,
      min: 0
    },
    inPerson: {
      type: Number,
      required: true,
      min: 0
    }
  },
  languages: [{
    type: String,
    trim: true
  }],
  about: {
    type: String,
    trim: true,
    maxLength: 1000
  },
  profilePicture: {
    type: String,
    trim: true
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  profileCompletion: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  availability: {
    type: Map,
    of: {
      isAvailable: Boolean,
      reason: String
    }
  },
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: true
    }
  },
  settings: {
    autoAcceptAppointments: {
      type: Boolean,
      default: false
    },
    defaultSlotDuration: {
      type: Number,
      default: 30,
      min: 10,
      max: 120
    },
    bufferBetweenSlots: {
      type: Number,
      default: 5,
      min: 0,
      max: 30
    },
    maxPatientsPerDay: {
      type: Number,
      default: 20,
      min: 1
    }
  }
}, {
  timestamps: true
});

// Create indexes for efficient queries
doctorSchema.index({ 'practiceLocations.address.pincode': 1 });
doctorSchema.index({ specialization: 1 });
doctorSchema.index({ 'practiceLocations.location': '2dsphere' });
doctorSchema.index({ status: 1, isVerified: 1 });
doctorSchema.index({ languages: 1 });

// Virtual for full name
doctorSchema.virtual('fullName').get(function() {
  return `Dr. ${this.name}`;
});

// Method to check if doctor is available at a specific time
doctorSchema.methods.isAvailableAt = function(dateTime) {
  const date = new Date(dateTime);
  const day = date.toLocaleLowerCase('en-US', { weekday: 'long' });
  const time = date.toLocaleTimeString('en-US', { hour12: false });

  return this.practiceLocations.some(location => {
    const daySchedule = location.workingHours.find(wh => wh.day === day);
    if (!daySchedule || !daySchedule.isWorking) return false;

    return time >= daySchedule.startTime && time <= daySchedule.endTime;
  });
};

// Method to find nearest practice location
doctorSchema.methods.findNearestLocation = function(latitude, longitude) {
  let nearestLocation = null;
  let minDistance = Infinity;

  this.practiceLocations.forEach(location => {
    const distance = calculateDistance(
      latitude,
      longitude,
      location.location.coordinates[1],
      location.location.coordinates[0]
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearestLocation = {
        ...location.toObject(),
        distance: distance
      };
    }
  });

  return nearestLocation;
};

// Pre-save middleware to update profile completion
doctorSchema.pre('save', function(next) {
  const requiredFields = [
    'name',
    'specialization',
    'qualifications',
    'experience',
    'registrationNumber',
    'practiceLocations',
    'consultationFees',
    'languages',
    'profilePicture'
  ];

  const completedFields = requiredFields.filter(field => {
    const value = this[field];
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return Object.keys(value).length > 0;
    return !!value;
  });

  this.profileCompletion = Math.round((completedFields.length / requiredFields.length) * 100);
  next();
});

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor; 