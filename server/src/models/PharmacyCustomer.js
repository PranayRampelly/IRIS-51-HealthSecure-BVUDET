import mongoose from 'mongoose';

const pharmacyCustomerSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[\+]?[0-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  alternatePhone: {
    type: String,
    trim: true,
    match: [/^[\+]?[0-9][\d]{0,15}$/, 'Please enter a valid alternate phone number']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    required: [true, 'Gender is required']
  },

  // Address Information
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    pincode: { type: String, trim: true },
    country: { type: String, trim: true, default: 'India' }
  },

  // Medical Information
  medicalInfo: {
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'],
      default: 'unknown'
    },
    allergies: [{
      allergen: { type: String, trim: true },
      severity: { type: String, enum: ['mild', 'moderate', 'severe'], default: 'mild' },
      notes: { type: String, trim: true }
    }],
    chronicConditions: [{
      condition: { type: String, trim: true },
      diagnosisDate: { type: Date },
      notes: { type: String, trim: true }
    }],
    currentMedications: [{
      medication: { type: String, trim: true },
      dosage: { type: String, trim: true },
      frequency: { type: String, trim: true },
      prescribedBy: { type: String, trim: true }
    }]
  },

  // Insurance Information
  insurance: {
    provider: { type: String, trim: true },
    policyNumber: { type: String, trim: true },
    groupNumber: { type: String, trim: true },
    coverageType: { type: String, trim: true },
    expiryDate: { type: Date },
    copayAmount: { type: Number, min: 0 },
    deductible: { type: Number, min: 0 }
  },

  // Emergency Contact
  emergencyContact: {
    name: { type: String, trim: true },
    relationship: { type: String, trim: true },
    phone: { 
      type: String, 
      trim: true,
      match: [/^[\+]?[0-9][\d]{0,15}$/, 'Please enter a valid emergency contact phone number']
    },
    email: { 
      type: String, 
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid emergency contact email']
    }
  },

  // Pharmacy Relationship
  pharmacy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pharmacy',
    required: true
  },

  // Customer Status and Preferences
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'deleted'],
    default: 'active'
  },
  customerType: {
    type: String,
    enum: ['regular', 'premium', 'vip', 'wholesale'],
    default: 'regular'
  },
  preferredLanguage: {
    type: String,
    default: 'english',
    enum: ['english', 'hindi', 'tamil', 'telugu', 'bengali', 'marathi', 'gujarati', 'kannada', 'malayalam', 'punjabi']
  },
  communicationPreferences: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: true },
    phone: { type: Boolean, default: false },
    whatsapp: { type: Boolean, default: false }
  },

  // Profile Image
  profileImage: {
    cloudinaryUrl: { type: String },
    cloudinaryId: { type: String }
  },

  // Documents
  documents: [{
    type: {
      type: String,
      enum: ['id_proof', 'insurance_card', 'prescription', 'medical_report', 'other'],
      required: true
    },
    name: { type: String, required: true },
    cloudinaryUrl: { type: String, required: true },
    cloudinaryId: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    description: { type: String, trim: true }
  }],

  // Order History and Statistics
  orderStats: {
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    lastOrderDate: { type: Date },
    averageOrderValue: { type: Number, default: 0 },
    favoriteCategories: [{ type: String }],
    loyaltyPoints: { type: Number, default: 0 }
  },

  // Payment Information
  paymentMethods: [{
    type: {
      type: String,
      enum: ['credit_card', 'debit_card', 'upi', 'net_banking', 'wallet', 'cash_on_delivery'],
      required: true
    },
    provider: { type: String, trim: true },
    lastFourDigits: { type: String, trim: true },
    expiryDate: { type: String, trim: true },
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
  }],

  // Delivery Preferences
  deliveryPreferences: {
    preferredTimeSlot: { type: String, trim: true },
    deliveryInstructions: { type: String, trim: true },
    deliveryAddress: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true },
      landmark: { type: String, trim: true }
    },
    isSameAsBilling: { type: Boolean, default: true }
  },

  // Notes and Tags
  notes: { type: String, trim: true },
  tags: [{ type: String, trim: true }],

  // Timestamps
  lastLoginDate: { type: Date },
  lastContactDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
pharmacyCustomerSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for full address
pharmacyCustomerSchema.virtual('fullAddress').get(function() {
  if (!this.address) return '';
  const { street, city, state, pincode, country } = this.address;
  return [street, city, state, pincode, country].filter(Boolean).join(', ');
});

// Virtual for age
pharmacyCustomerSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Indexes for better performance
pharmacyCustomerSchema.index({ email: 1 }, { unique: true });
pharmacyCustomerSchema.index({ phone: 1 });
pharmacyCustomerSchema.index({ pharmacy: 1 });
pharmacyCustomerSchema.index({ status: 1 });
pharmacyCustomerSchema.index({ customerType: 1 });
pharmacyCustomerSchema.index({ 'orderStats.lastOrderDate': -1 });
pharmacyCustomerSchema.index({ createdAt: -1 });

// Pre-save middleware
pharmacyCustomerSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Calculate average order value
  if (this.orderStats.totalOrders > 0) {
    this.orderStats.averageOrderValue = this.orderStats.totalSpent / this.orderStats.totalOrders;
  }
  
  next();
});

// Static methods
pharmacyCustomerSchema.statics.findByPharmacy = function(pharmacyId) {
  return this.find({ pharmacy: pharmacyId, status: { $ne: 'deleted' } });
};

pharmacyCustomerSchema.statics.findActiveCustomers = function(pharmacyId) {
  return this.find({ pharmacy: pharmacyId, status: 'active' });
};

pharmacyCustomerSchema.statics.findByCustomerType = function(pharmacyId, customerType) {
  return this.find({ pharmacy: pharmacyId, customerType, status: { $ne: 'deleted' } });
};

pharmacyCustomerSchema.statics.searchCustomers = function(pharmacyId, searchTerm) {
  const regex = new RegExp(searchTerm, 'i');
  return this.find({
    pharmacy: pharmacyId,
    status: { $ne: 'deleted' },
    $or: [
      { firstName: regex },
      { lastName: regex },
      { email: regex },
      { phone: regex },
      { 'address.city': regex },
      { 'address.state': regex }
    ]
  });
};

// Instance methods
pharmacyCustomerSchema.methods.updateOrderStats = function(orderValue) {
  this.orderStats.totalOrders += 1;
  this.orderStats.totalSpent += orderValue;
  this.orderStats.lastOrderDate = new Date();
  this.orderStats.averageOrderValue = this.orderStats.totalSpent / this.orderStats.totalOrders;
  return this.save();
};

pharmacyCustomerSchema.methods.addLoyaltyPoints = function(points) {
  this.orderStats.loyaltyPoints += points;
  return this.save();
};

pharmacyCustomerSchema.methods.addAllergy = function(allergen, severity = 'mild', notes = '') {
  this.medicalInfo.allergies.push({ allergen, severity, notes });
  return this.save();
};

pharmacyCustomerSchema.methods.addChronicCondition = function(condition, diagnosisDate, notes = '') {
  this.medicalInfo.chronicConditions.push({ condition, diagnosisDate, notes });
  return this.save();
};

pharmacyCustomerSchema.methods.addCurrentMedication = function(medication, dosage, frequency, prescribedBy) {
  this.medicalInfo.currentMedications.push({ medication, dosage, frequency, prescribedBy });
  return this.save();
};

const PharmacyCustomer = mongoose.model('PharmacyCustomer', pharmacyCustomerSchema);

export default PharmacyCustomer;