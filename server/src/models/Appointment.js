import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  // Basic appointment info
  appointmentNumber: {
    type: String,
    required: true,
    unique: true
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
  
  // Appointment details
  appointmentType: {
    type: String,
    enum: ['consultation', 'emergency', 'follow-up', 'surgery', 'lab-test', 'imaging', 'therapy'],
    required: true
  },
  department: {
    type: String,
    required: true,
    enum: ['Emergency', 'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Oncology', 'General Medicine', 'Surgery', 'Radiology', 'Laboratory', 'Dermatology', 'Dermatologist', 'General']
  },
  
  // Scheduling
  scheduledDate: {
    type: Date,
    required: true
  },
  scheduledTime: {
    type: String,
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
  estimatedDuration: {
    type: Number, // in minutes
    default: 30
  },
  
  // Consultation type (online or in-person)
  consultationType: {
    type: String,
    enum: ['online', 'in-person'],
    required: true,
    default: 'online'
  },
  
  // Real-time status tracking
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show', 'rescheduled'],
    default: 'pending'
  },
  statusHistory: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }],
  
  // Hospital-specific fields
  room: {
    type: String,
    required: false
  },
  bed: {
    type: String,
    required: false
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent', 'emergency'],
    default: 'normal'
  },
  
  // Patient information
  patientVitals: {
    bloodPressure: String,
    heartRate: String,
    temperature: String,
    weight: String,
    height: String,
    oxygenSaturation: String
  },
  
  // Medical information
  symptoms: [String],
  diagnosis: String,
  treatmentPlan: String,
  prescriptions: [{
    medication: String,
    dosage: String,
    frequency: String,
    duration: String,
    instructions: String
  }],
  
  // Notes and communication
  doctorNotes: String,
  patientNotes: String,
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: Date,
  
  // Payment and insurance
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'partial', 'waived', 'insurance-pending'],
    default: 'pending'
  },
  insuranceInfo: {
    provider: String,
    policyNumber: String,
    coverage: Number,
    deductible: Number
  },
  cost: {
    consultationFee: Number,
    originalConsultationFee: Number, // Store original fee for display purposes
    convenienceFee: Number, // New field for in-person consultation convenience fee
    additionalCharges: Number,
    totalAmount: Number
  },
  
  // Real-time tracking
  checkInTime: Date,
  checkOutTime: Date,
  actualDuration: Number, // in minutes
  waitTime: Number, // in minutes
  
  // Communication
  notifications: [{
    type: String,
    sentAt: {
      type: Date,
      default: Date.now
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read'],
      default: 'sent'
    }
  }],
  
  // Emergency information
  isEmergency: {
    type: Boolean,
    default: false
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  
  // Comprehensive appointment details
  patientDetails: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    dateOfBirth: Date,
    gender: String,
    bloodGroup: String,
    address: String
  },
  doctorDetails: {
    firstName: String,
    lastName: String,
    specialization: String,
    experience: Number,
    qualifications: [String],
    languages: [String],
    profileImage: String
  },
  hospitalDetails: {
    hospitalName: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
    phone: String
  },
  insurance: {
    policyNumber: String,
    groupNumber: String,
    memberId: String,
    provider: String,
    coverageType: String,
    validUntil: Date
  },
  bookingSource: {
    type: String,
    default: 'web'
  },
  deviceInfo: String,
  emergencyPriority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent', 'emergency'],
    default: 'normal'
  },
  consultationNotes: String,
  labReports: [{
    name: String,
    url: String,
    uploadedAt: Date
  }],
  feedback: {
    rating: Number,
    comment: String,
    submittedAt: Date
  },
  cancellationReason: String,
  cancellationDate: Date,
  rescheduledFrom: Date,
  rescheduledTo: Date,
  videoCallDetails: {
    platform: String,
    roomId: String,
    password: String,
    maxParticipants: Number,
    recordingEnabled: Boolean
  },
  preferredLanguage: {
    type: String,
    default: 'english'
  },
  termsAccepted: {
    type: Boolean,
    default: false
  },
  
  // Audit trail
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for performance
appointmentSchema.index({ patient: 1, scheduledDate: 1 });
appointmentSchema.index({ hospital: 1, status: 1 });
appointmentSchema.index({ doctor: 1, scheduledDate: 1 });
appointmentSchema.index({ status: 1, scheduledDate: 1 });

// Add BookedTimeSlot functionality directly to Appointment model
appointmentSchema.index({ doctor: 1, scheduledDate: 1, startTime: 1, endTime: 1 }, { unique: true });
appointmentSchema.index({ doctor: 1, hospital: 1, scheduledDate: 1, startTime: 1, endTime: 1 });

// Pre-save middleware to update status history
appointmentSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      updatedBy: this.updatedBy || this.createdBy
    });
  }
  this.updatedAt = new Date();
  next();
});

// Generate appointment number before validation, so the required validator passes
appointmentSchema.pre('validate', function(next) {
  if (this.isNew && !this.appointmentNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.appointmentNumber = `APT-${year}${month}${day}-${random}`;
  }
  next();
});

// Virtual for full patient name
appointmentSchema.virtual('patientFullName').get(function() {
  return `${this.patient?.firstName || ''} ${this.patient?.lastName || ''}`.trim();
});

// Virtual for full doctor name
appointmentSchema.virtual('doctorFullName').get(function() {
  return `${this.doctor?.firstName || ''} ${this.doctor?.lastName || ''}`.trim();
});

// Virtual for hospital name
appointmentSchema.virtual('hospitalName').get(function() {
  return this.hospital?.hospitalName || '';
});

// Methods
appointmentSchema.methods.updateStatus = function(newStatus, updatedBy, notes = '') {
  this.status = newStatus;
  this.updatedBy = updatedBy;
  if (notes) {
    this.statusHistory.push({
      status: newStatus,
      timestamp: new Date(),
      updatedBy: updatedBy,
      notes: notes
    });
  }
  return this.save();
};

appointmentSchema.methods.addNotification = function(type, recipient, message) {
  this.notifications.push({
    type,
    recipient,
    message,
    sentAt: new Date()
  });
  return this.save();
};

appointmentSchema.methods.calculateWaitTime = function() {
  if (this.checkInTime && this.status === 'in-progress') {
    const now = new Date();
    this.waitTime = Math.floor((now - this.checkInTime) / (1000 * 60)); // minutes
  }
  return this.waitTime || 0;
};

// Static methods for slot availability checking
appointmentSchema.statics.checkSlotAvailability = function(doctorId, hospitalId, date, startTime, endTime) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.findOne({
    doctor: doctorId,
    hospital: hospitalId,
    scheduledDate: { $gte: startOfDay, $lte: endOfDay },
    startTime: startTime,
    endTime: endTime,
    status: { $in: ['pending', 'confirmed', 'in-progress'] }
  });
};

appointmentSchema.statics.findByDoctorAndDate = function(doctorId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.find({
    doctor: doctorId,
    scheduledDate: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ['pending', 'confirmed', 'in-progress'] }
  }).populate('patient', 'firstName lastName email phone');
};

appointmentSchema.statics.getAvailableSlots = function(doctorId, date, appointmentDuration = 30) {
  // This will be implemented to work with DoctorAvailability
  // to generate available slots excluding booked ones
  return [];
};

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment; 