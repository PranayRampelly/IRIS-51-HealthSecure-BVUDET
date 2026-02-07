import mongoose from 'mongoose';

const bloodInventorySchema = new mongoose.Schema({
  bloodBankId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
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
    min: 0
  },
  unit: {
    type: String,
    enum: ['Units', 'Bags', 'Pints', 'Milliliters'],
    default: 'Units'
  },
  donor: {
    donorId: {
      type: String,
      required: true,
      index: true
    },
    name: String,
    age: Number,
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other']
    },
    bloodGroup: String,
    contactNumber: String
  },
  collectionDetails: {
    date: {
      type: Date,
      required: true
    },
    location: String,
    phlebotomist: String,
    collectionMethod: {
      type: String,
      enum: ['Manual', 'Automated', 'Apheresis']
    },
    collectionTime: Number, // in minutes
    notes: String
  },
  processing: {
    date: {
      type: Date,
      required: true
    },
    processingMethod: {
      type: String,
      enum: ['Centrifugation', 'Filtration', 'Manual', 'Automated']
    },
    processingTime: Number, // in minutes
    technician: String,
    equipment: String,
    qualityChecks: [{
      checkType: String,
      result: {
        type: String,
        enum: ['pass', 'fail', 'pending']
      },
      notes: String,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }]
  },
  qualityTests: [{
    testType: {
      type: String,
      enum: ['HIV', 'Hepatitis B', 'Hepatitis C', 'Syphilis', 'Malaria', 'Blood Group', 'Rh Factor', 'Other']
    },
    result: {
      type: String,
      enum: ['pass', 'fail', 'inconclusive', 'pending']
    },
    testDate: {
      type: Date,
      default: Date.now
    },
    technician: String,
    notes: String
  }],
  storage: {
    location: {
      type: String,
      required: true
    },
    temperature: {
      type: Number,
      required: true
    },
    humidity: Number,
    storageDate: {
      type: Date,
      default: Date.now
    },
    storageConditions: {
      type: String,
      enum: ['Refrigerated', 'Frozen', 'Room Temperature', 'Special']
    }
  },
  status: {
    type: String,
    enum: ['Available', 'Reserved', 'Expired', 'Quarantined', 'In Testing', 'Discarded'],
    default: 'Available'
  },
  collectionDate: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BloodDonor',
    required: true
  },
  donorName: {
    type: String,
    required: true
  },
  donorBloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true
  },
  collectionMethod: {
    type: String,
    enum: ['Voluntary', 'Replacement', 'Directed', 'Autologous'],
    default: 'Voluntary'
  },
  testingStatus: {
    hiv: { type: Boolean, default: false },
    hepatitisB: { type: Boolean, default: false },
    hepatitisC: { type: Boolean, default: false },
    syphilis: { type: Boolean, default: false },
    malaria: { type: Boolean, default: false },
    cmv: { type: Boolean, default: false },
    allTestsPassed: { type: Boolean, default: false }
  },
  storageLocation: {
    refrigerator: {
      type: String,
      enum: ['Refrigerator 1', 'Refrigerator 2', 'Refrigerator 3', 'Freezer 1', 'Freezer 2'],
      required: true
    },
    shelf: String,
    position: String
  },
  temperature: {
    current: Number,
    min: Number,
    max: Number,
    unit: {
      type: String,
      enum: ['Celsius', 'Fahrenheit'],
      default: 'Celsius'
    }
  },
  qualityIndicators: {
    hemoglobin: Number,
    hematocrit: Number,
    plateletCount: Number,
    whiteBloodCellCount: Number,
    ph: Number,
    glucose: Number,
    potassium: Number,
    sodium: Number
  },
  specialRequirements: {
    irradiated: { type: Boolean, default: false },
    leukoreduced: { type: Boolean, default: false },
    cmvNegative: { type: Boolean, default: false },
    washed: { type: Boolean, default: false },
    frozen: { type: Boolean, default: false }
  },
  cost: {
    amount: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  notes: String,
  alerts: [{
    type: {
      type: String,
      enum: ['Expiry', 'Low Stock', 'Temperature', 'Quality', 'Testing'],
      required: true
    },
    message: String,
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  auditTrail: [{
    action: {
      type: String,
      enum: ['Created', 'Updated', 'Reserved', 'Issued', 'Discarded', 'Tested', 'Moved'],
      required: true
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    performedByName: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: String,
    previousQuantity: Number,
    newQuantity: Number
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
bloodInventorySchema.index({ bloodBankId: 1, bloodType: 1, status: 1 });
bloodInventorySchema.index({ expiryDate: 1 });
bloodInventorySchema.index({ collectionDate: 1 });
bloodInventorySchema.index({ 'alerts.isActive': 1 });

// Virtual for days until expiry
bloodInventorySchema.virtual('daysUntilExpiry').get(function() {
  const today = new Date();
  const expiry = new Date(this.expiryDate);
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for age of blood
bloodInventorySchema.virtual('ageInDays').get(function() {
  const today = new Date();
  const collection = new Date(this.collectionDate);
  const diffTime = today - collection;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Method to check if blood is expiring soon
bloodInventorySchema.methods.isExpiringSoon = function(days = 7) {
  return this.daysUntilExpiry <= days && this.daysUntilExpiry > 0;
};

// Method to check if blood is expired
bloodInventorySchema.methods.isExpired = function() {
  return this.daysUntilExpiry < 0;
};

// Method to add alert
bloodInventorySchema.methods.addAlert = function(type, message, severity = 'Medium') {
  this.alerts.push({
    type,
    message,
    severity,
    isActive: true,
    createdAt: new Date()
  });
};

// Method to update quantity with audit trail
bloodInventorySchema.methods.updateQuantity = function(newQuantity, action, performedBy, performedByName, details) {
  const previousQuantity = this.quantity;
  this.quantity = newQuantity;
  
  this.auditTrail.push({
    action,
    performedBy,
    performedByName,
    timestamp: new Date(),
    details,
    previousQuantity,
    newQuantity
  });
};

// Pre-save middleware to update status based on quantity
bloodInventorySchema.pre('save', function(next) {
  if (this.quantity <= 0) {
    this.status = 'Discarded';
  } else if (this.isExpired()) {
    this.status = 'Expired';
  }
  next();
});

// Static method to get inventory summary
bloodInventorySchema.statics.getInventorySummary = async function(bloodBankId) {
  return await this.aggregate([
    { $match: { bloodBankId: new mongoose.Types.ObjectId(bloodBankId), isActive: true } },
    {
      $group: {
        _id: {
          bloodType: '$bloodType',
          componentType: '$componentType',
          status: '$status'
        },
        totalQuantity: { $sum: '$quantity' },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: {
          bloodType: '$_id.bloodType',
          componentType: '$_id.componentType'
        },
        statuses: {
          $push: {
            status: '$_id.status',
            quantity: '$totalQuantity',
            count: '$count'
          }
        }
      }
    }
  ]);
};

// Static method to get expiring inventory
bloodInventorySchema.statics.getExpiringInventory = async function(bloodBankId, days = 7) {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + days);
  
  return await this.find({
    bloodBankId,
    expiryDate: { $lte: expiryDate, $gt: new Date() },
    status: { $in: ['Available', 'Reserved'] },
    isActive: true
  }).sort({ expiryDate: 1 });
};

const BloodInventory = mongoose.model('BloodInventory', bloodInventorySchema);
export default BloodInventory;
