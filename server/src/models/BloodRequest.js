import mongoose from 'mongoose';

const bloodRequestSchema = new mongoose.Schema({
  requestId: {
    type: String,
    required: true,
    unique: true
  },
  bloodBankId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requestingHospital: {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    hospitalName: {
      type: String,
      required: true
    },
    contactPerson: {
      name: String,
      phone: String,
      email: String,
      designation: String
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String
    }
  },
  patientInfo: {
    patientId: String,
    name: {
      type: String,
      required: true
    },
    age: Number,
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other']
    },
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true
    },
    weight: Number,
    diagnosis: String,
    medicalHistory: String,
    allergies: [String],
    currentMedications: [String]
  },
  requestDetails: {
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true
    },
    componentType: {
      type: String,
      enum: ['Whole Blood', 'Red Blood Cells', 'Platelets', 'Plasma', 'Cryoprecipitate', 'Granulocytes'],
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unit: {
      type: String,
      enum: ['Units', 'Bags', 'Pints', 'Milliliters'],
      default: 'Units'
    },
    urgency: {
      type: String,
      enum: ['Routine', 'Urgent', 'Emergency', 'Critical'],
      default: 'Routine'
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium'
    },
    requiredBy: {
      type: Date,
      required: true
    },
    specialRequirements: {
      irradiated: { type: Boolean, default: false },
      leukoreduced: { type: Boolean, default: false },
      cmvNegative: { type: Boolean, default: false },
      washed: { type: Boolean, default: false },
      frozen: { type: Boolean, default: false },
      crossMatched: { type: Boolean, default: false }
    },
    clinicalIndication: {
      type: String,
      enum: [
        'Surgery', 'Trauma', 'Anemia', 'Cancer Treatment', 'Childbirth', 
        'Bleeding Disorder', 'Transplant', 'Emergency', 'Other'
      ],
      required: true
    },
    hemoglobin: Number,
    hematocrit: Number,
    plateletCount: Number,
    coagulationTests: {
      pt: Number,
      inr: Number,
      aptt: Number,
      fibrinogen: Number
    }
  },
  crossMatching: {
    isRequired: {
      type: Boolean,
      default: false
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedDate: Date,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    performedByName: String,
    results: {
      majorCrossMatch: {
        type: String,
        enum: ['Compatible', 'Incompatible', 'Pending']
      },
      minorCrossMatch: {
        type: String,
        enum: ['Compatible', 'Incompatible', 'Pending']
      },
      antibodyScreen: {
        type: String,
        enum: ['Negative', 'Positive', 'Pending']
      },
      notes: String
    }
  },
  status: {
    type: String,
    enum: [
      'Pending', 'Under Review', 'Approved', 'Partially Fulfilled', 
      'Fulfilled', 'Cancelled', 'Rejected', 'Expired'
    ],
    default: 'Pending'
  },
  fulfillment: {
    isFulfilled: {
      type: Boolean,
      default: false
    },
    fulfilledDate: Date,
    fulfilledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    fulfilledByName: String,
    fulfilledQuantity: {
      type: Number,
      default: 0
    },
    inventoryItems: [{
      inventoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BloodInventory'
      },
      quantity: Number,
      issuedDate: Date,
      issuedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }],
    notes: String
  },
  pricing: {
    unitPrice: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'INR'
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Partially Paid', 'Waived'],
      default: 'Pending'
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Card', 'Bank Transfer', 'Insurance', 'Other']
    },
    paymentDate: Date,
    invoiceNumber: String
  },
  transportation: {
    isRequired: {
      type: Boolean,
      default: false
    },
    transportMethod: {
      type: String,
      enum: ['Self Pickup', 'Blood Bank Delivery', 'Courier', 'Ambulance', 'Other']
    },
    deliveryAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String
    },
    contactPerson: {
      name: String,
      phone: String
    },
    deliveryInstructions: String,
    estimatedDeliveryTime: Date,
    actualDeliveryTime: Date,
    transportCost: {
      type: Number,
      default: 0
    }
  },
  documents: [{
    type: {
      type: String,
      enum: [
        'Prescription', 'Lab Reports', 'Cross Match Report', 
        'Patient Consent', 'Insurance Card', 'Other'
      ]
    },
    title: String,
    fileName: String,
    fileUrl: String,
    uploadDate: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  timeline: [{
    action: {
      type: String,
      enum: [
        'Request Created', 'Under Review', 'Approved', 'Rejected', 
        'Cross Match Started', 'Cross Match Completed', 'Inventory Allocated',
        'Partially Fulfilled', 'Fulfilled', 'Delivered', 'Cancelled'
      ],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    performedByName: String,
    notes: String,
    status: String
  }],
  notifications: [{
    type: {
      type: String,
      enum: ['Email', 'SMS', 'Push', 'System']
    },
    recipient: String,
    message: String,
    sentAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Sent', 'Delivered', 'Failed', 'Pending']
    }
  }],
  auditTrail: [{
    action: String,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    performedByName: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: String,
    previousValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed
  }],
  notes: [{
    content: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedByName: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    isInternal: {
      type: Boolean,
      default: false
    }
  }],
  isActive: {
    type: Boolean,
    default: true
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

// Indexes for better query performance
bloodRequestSchema.index({ bloodBankId: 1, status: 1 });
bloodRequestSchema.index({ 'requestDetails.bloodType': 1, 'requestDetails.componentType': 1 });
bloodRequestSchema.index({ 'requestDetails.urgency': 1 });
bloodRequestSchema.index({ 'requestDetails.requiredBy': 1 });
bloodRequestSchema.index({ 'requestingHospital.hospitalId': 1 });

// Virtual for days until required
bloodRequestSchema.virtual('daysUntilRequired').get(function() {
  const today = new Date();
  const requiredDate = new Date(this.requestDetails.requiredBy);
  const diffTime = requiredDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for fulfillment percentage
bloodRequestSchema.virtual('fulfillmentPercentage').get(function() {
  if (this.requestDetails.quantity === 0) return 0;
  return Math.round((this.fulfillment.fulfilledQuantity / this.requestDetails.quantity) * 100);
});

// Virtual for is urgent
bloodRequestSchema.virtual('isUrgent').get(function() {
  return this.requestDetails.urgency === 'Urgent' || 
         this.requestDetails.urgency === 'Emergency' || 
         this.requestDetails.urgency === 'Critical';
});

// Virtual for is overdue
bloodRequestSchema.virtual('isOverdue').get(function() {
  return this.daysUntilRequired < 0 && this.status !== 'Fulfilled' && this.status !== 'Cancelled';
});

// Method to add timeline entry
bloodRequestSchema.methods.addTimelineEntry = function(action, performedBy, performedByName, notes = '', status = null) {
  this.timeline.push({
    action,
    timestamp: new Date(),
    performedBy,
    performedByName,
    notes,
    status
  });
};

// Method to update status with timeline
bloodRequestSchema.methods.updateStatus = function(newStatus, performedBy, performedByName, notes = '') {
  const previousStatus = this.status;
  this.status = newStatus;
  
  this.addTimelineEntry(
    newStatus,
    performedBy,
    performedByName,
    notes
  );
  
  this.auditTrail.push({
    action: 'Status Updated',
    performedBy,
    performedByName,
    timestamp: new Date(),
    details: `Status changed from ${previousStatus} to ${newStatus}`,
    previousValue: previousStatus,
    newValue: newStatus
  });
};

// Method to add note
bloodRequestSchema.methods.addNote = function(content, addedBy, addedByName, isInternal = false) {
  this.notes.push({
    content,
    addedBy,
    addedByName,
    timestamp: new Date(),
    isInternal
  });
};

// Method to fulfill request
bloodRequestSchema.methods.fulfillRequest = function(inventoryItems, fulfilledBy, fulfilledByName, notes = '') {
  const totalFulfilledQuantity = inventoryItems.reduce((sum, item) => sum + item.quantity, 0);
  
  this.fulfillment.isFulfilled = totalFulfilledQuantity >= this.requestDetails.quantity;
  this.fulfillment.fulfilledDate = new Date();
  this.fulfillment.fulfilledBy = fulfilledBy;
  this.fulfillment.fulfilledByName = fulfilledByName;
  this.fulfillment.fulfilledQuantity = totalFulfilledQuantity;
  this.fulfillment.inventoryItems = inventoryItems;
  this.fulfillment.notes = notes;
  
  const newStatus = this.fulfillment.isFulfilled ? 'Fulfilled' : 'Partially Fulfilled';
  this.updateStatus(newStatus, fulfilledBy, fulfilledByName, notes);
};

// Pre-save middleware to generate request ID
bloodRequestSchema.pre('save', async function(next) {
  if (this.isNew && !this.requestId) {
    const count = await this.constructor.countDocuments({ bloodBankId: this.bloodBankId });
    const bloodBank = await mongoose.model('User').findById(this.bloodBankId);
    const bloodBankCode = bloodBank?.bloodBankName?.substring(0, 3).toUpperCase() || 'BBK';
    this.requestId = `${bloodBankCode}REQ${String(count + 1).padStart(6, '0')}`;
  }
  
  // Auto-update status based on required date
  if (this.isOverdue && this.status === 'Pending') {
    this.status = 'Expired';
  }
  
  next();
});

// Static method to generate request ID
bloodRequestSchema.statics.generateRequestId = async function(bloodBankId) {
  const count = await this.countDocuments({ bloodBankId });
  const bloodBank = await mongoose.model('User').findById(bloodBankId);
  const bloodBankCode = bloodBank?.bloodBankName?.substring(0, 3).toUpperCase() || 'BBK';
  return `${bloodBankCode}REQ${String(count + 1).padStart(6, '0')}`;
};

// Static method to get urgent requests
bloodRequestSchema.statics.getUrgentRequests = async function(bloodBankId) {
  return await this.find({
    bloodBankId,
    'requestDetails.urgency': { $in: ['Urgent', 'Emergency', 'Critical'] },
    status: { $in: ['Pending', 'Under Review', 'Approved'] },
    isActive: true
  }).sort({ 'requestDetails.requiredBy': 1 });
};

// Static method to get overdue requests
bloodRequestSchema.statics.getOverdueRequests = async function(bloodBankId) {
  const today = new Date();
  return await this.find({
    bloodBankId,
    'requestDetails.requiredBy': { $lt: today },
    status: { $in: ['Pending', 'Under Review', 'Approved'] },
    isActive: true
  }).sort({ 'requestDetails.requiredBy': 1 });
};

// Static method to get request statistics
bloodRequestSchema.statics.getRequestStatistics = async function(bloodBankId, startDate = null, endDate = null) {
  const matchStage = { bloodBankId, isActive: true };
  
  if (startDate && endDate) {
    matchStage.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  return await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          status: '$status',
          urgency: '$requestDetails.urgency',
          bloodType: '$requestDetails.bloodType'
        },
        count: { $sum: 1 },
        totalQuantity: { $sum: '$requestDetails.quantity' },
        totalFulfilled: { $sum: '$fulfillment.fulfilledQuantity' }
      }
    }
  ]);
};

const BloodRequest = mongoose.model('BloodRequest', bloodRequestSchema);
export default BloodRequest;
