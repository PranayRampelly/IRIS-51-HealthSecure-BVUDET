import mongoose from 'mongoose';

const bloodDonorSchema = new mongoose.Schema({
  bloodBankId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  donorId: {
    type: String,
    required: true,
    unique: true
  },
  personalInfo: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    dateOfBirth: {
      type: Date,
      required: true
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: true
    },
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true
    },
    rhFactor: {
      type: String,
      enum: ['Positive', 'Negative'],
      required: true
    },
    weight: {
      type: Number,
      required: true,
      min: 45 // Minimum weight for donation
    },
    height: {
      type: Number,
      required: true
    },
    bmi: {
      type: Number,
      required: true
    }
  },
  contactInfo: {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true
    },
    alternatePhone: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: {
        type: String,
        default: 'India'
      }
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String
    }
  },
  medicalHistory: {
    hasDonatedBefore: {
      type: Boolean,
      default: false
    },
    lastDonationDate: Date,
    totalDonations: {
      type: Number,
      default: 0
    },
    medicalConditions: [{
      condition: String,
      diagnosedDate: Date,
      isControlled: Boolean,
      medications: [String]
    }],
    surgeries: [{
      surgery: String,
      date: Date,
      hospital: String
    }],
    allergies: [{
      allergen: String,
      severity: {
        type: String,
        enum: ['Mild', 'Moderate', 'Severe']
      },
      reaction: String
    }],
    medications: [{
      name: String,
      dosage: String,
      frequency: String,
      startDate: Date,
      endDate: Date,
      isActive: Boolean
    }],
    travelHistory: [{
      country: String,
      visitDate: Date,
      returnDate: Date,
      purpose: String
    }],
    tattoos: [{
      location: String,
      date: Date,
      isSterile: Boolean
    }],
    piercings: [{
      location: String,
      date: Date,
      isSterile: Boolean
    }]
  },
  donationHistory: [{
    donationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodInventory'
    },
    donationDate: {
      type: Date,
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
      required: true
    },
    unit: {
      type: String,
      enum: ['Units', 'Bags', 'Pints', 'Milliliters'],
      default: 'Units'
    },
    collectionMethod: {
      type: String,
      enum: ['Manual', 'Automated', 'Apheresis'],
      required: true
    },
    collectionTime: Number, // in minutes
    hemoglobin: Number,
    bloodPressure: {
      systolic: Number,
      diastolic: Number
    },
    pulse: Number,
    temperature: Number,
    weight: Number,
    phlebotomist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    phlebotomistName: String,
    location: String,
    notes: String,
    complications: [{
      type: String,
      severity: {
        type: String,
        enum: ['Mild', 'Moderate', 'Severe']
      },
      description: String,
      treatment: String
    }],
    deferral: {
      isDeferred: {
        type: Boolean,
        default: false
      },
      reason: String,
      deferralDate: Date,
      deferralEndDate: Date,
      deferralType: {
        type: String,
        enum: ['Temporary', 'Permanent']
      }
    }
  }],
  screeningResults: {
    hiv: {
      tested: { type: Boolean, default: false },
      result: { type: String, enum: ['Negative', 'Positive', 'Inconclusive'] },
      testDate: Date,
      nextTestDate: Date
    },
    hepatitisB: {
      tested: { type: Boolean, default: false },
      result: { type: String, enum: ['Negative', 'Positive', 'Inconclusive'] },
      testDate: Date,
      nextTestDate: Date
    },
    hepatitisC: {
      tested: { type: Boolean, default: false },
      result: { type: String, enum: ['Negative', 'Positive', 'Inconclusive'] },
      testDate: Date,
      nextTestDate: Date
    },
    syphilis: {
      tested: { type: Boolean, default: false },
      result: { type: String, enum: ['Negative', 'Positive', 'Inconclusive'] },
      testDate: Date,
      nextTestDate: Date
    },
    malaria: {
      tested: { type: Boolean, default: false },
      result: { type: String, enum: ['Negative', 'Positive', 'Inconclusive'] },
      testDate: Date,
      nextTestDate: Date
    },
    cmv: {
      tested: { type: Boolean, default: false },
      result: { type: String, enum: ['Negative', 'Positive', 'Inconclusive'] },
      testDate: Date,
      nextTestDate: Date
    },
    bloodGroup: {
      tested: { type: Boolean, default: false },
      result: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
      testDate: Date
    }
  },
  eligibility: {
    isEligible: {
      type: Boolean,
      default: true
    },
    eligibilityDate: {
      type: Date,
      default: Date.now
    },
    nextEligibilityDate: Date,
    deferralReasons: [{
      reason: String,
      deferralDate: Date,
      deferralEndDate: Date,
      deferralType: {
        type: String,
        enum: ['Temporary', 'Permanent']
      },
      notes: String
    }],
    permanentDeferral: {
      isPermanentlyDeferred: {
        type: Boolean,
        default: false
      },
      reason: String,
      deferralDate: Date,
      notes: String
    }
  },
  preferences: {
    preferredDonationType: {
      type: String,
      enum: ['Whole Blood', 'Red Blood Cells', 'Platelets', 'Plasma', 'Cryoprecipitate', 'Granulocytes'],
      default: 'Whole Blood'
    },
    preferredCollectionMethod: {
      type: String,
      enum: ['Manual', 'Automated', 'Apheresis'],
      default: 'Manual'
    },
    preferredLocation: String,
    preferredTime: {
      type: String,
      enum: ['Morning', 'Afternoon', 'Evening', 'Any']
    },
    notificationPreferences: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      phone: { type: Boolean, default: false }
    },
    consentForResearch: {
      type: Boolean,
      default: false
    },
    consentForContact: {
      type: Boolean,
      default: true
    }
  },
  rewards: {
    totalPoints: {
      type: Number,
      default: 0
    },
    pointsHistory: [{
      points: Number,
      reason: String,
      date: {
        type: Date,
        default: Date.now
      }
    }],
    rewardsRedeemed: [{
      reward: String,
      pointsUsed: Number,
      date: {
        type: Date,
        default: Date.now
      }
    }]
  },
  documents: [{
    type: {
      type: String,
      enum: ['ID Proof', 'Address Proof', 'Medical Certificate', 'Consent Form', 'Other']
    },
    title: String,
    fileName: String,
    fileUrl: String,
    uploadDate: {
      type: Date,
      default: Date.now
    },
    expiryDate: Date,
    isVerified: {
      type: Boolean,
      default: false
    }
  }],
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Deferred', 'Permanently Deferred', 'Deceased'],
    default: 'Active'
  },
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
bloodDonorSchema.index({ bloodBankId: 1, 'personalInfo.bloodType': 1 });
bloodDonorSchema.index({ 'personalInfo.email': 1 });
bloodDonorSchema.index({ 'personalInfo.phone': 1 });
bloodDonorSchema.index({ status: 1 });
bloodDonorSchema.index({ 'eligibility.isEligible': 1 });
bloodDonorSchema.index({ 'nextDonation.nextEligibleDate': 1 });

// Pre-save middleware to calculate age and next donation eligibility
bloodDonorSchema.pre('save', function(next) {
  // Calculate age
  if (this.personalInfo.dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(this.personalInfo.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    this.personalInfo.age = age;
  }

  // Calculate days until next eligible donation
  if (this.nextDonation.nextEligibleDate) {
    const today = new Date();
    const eligibleDate = new Date(this.nextDonation.nextEligibleDate);
    const diffTime = eligibleDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    this.nextDonation.daysUntilEligible = Math.max(0, diffDays);
  }

  next();
});

// Virtual for full name
bloodDonorSchema.virtual('fullName').get(function() {
  return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`;
});

// Virtual for age
bloodDonorSchema.virtual('age').get(function() {
  const today = new Date();
  const birthDate = new Date(this.personalInfo.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Virtual for next donation eligibility
bloodDonorSchema.virtual('canDonate').get(function() {
  if (!this.eligibility.isEligible) return false;
  if (this.eligibility.permanentDeferral.isPermanentlyDeferred) return false;
  
  const today = new Date();
  const lastDonation = this.donationHistory.length > 0 
    ? new Date(Math.max(...this.donationHistory.map(d => new Date(d.donationDate))))
    : null;
  
  if (!lastDonation) return true;
  
  // Different deferral periods for different donation types
  const lastDonationType = this.donationHistory[this.donationHistory.length - 1].componentType;
  let deferralDays = 56; // Default for whole blood
  
  switch (lastDonationType) {
    case 'Whole Blood':
    case 'Red Blood Cells':
      deferralDays = 56;
      break;
    case 'Platelets':
      deferralDays = 7;
      break;
    case 'Plasma':
      deferralDays = 28;
      break;
    case 'Cryoprecipitate':
      deferralDays = 56;
      break;
    case 'Granulocytes':
      deferralDays = 14;
      break;
  }
  
  const nextEligibleDate = new Date(lastDonation);
  nextEligibleDate.setDate(nextEligibleDate.getDate() + deferralDays);
  
  return today >= nextEligibleDate;
});

// Method to calculate BMI
bloodDonorSchema.methods.calculateBMI = function() {
  if (this.personalInfo.weight && this.personalInfo.height) {
    const heightInMeters = this.personalInfo.height / 100;
    return (this.personalInfo.weight / (heightInMeters * heightInMeters)).toFixed(1);
  }
  return null;
};

// Method to add donation
bloodDonorSchema.methods.addDonation = function(donationData) {
  this.donationHistory.push(donationData);
  this.medicalHistory.totalDonations += 1;
  this.medicalHistory.lastDonationDate = donationData.donationDate;
  
  // Add points for donation
  const pointsEarned = donationData.quantity * 10; // 10 points per unit
  this.rewards.totalPoints += pointsEarned;
  this.rewards.pointsHistory.push({
    points: pointsEarned,
    reason: `Blood donation - ${donationData.componentType}`,
    date: new Date()
  });
};

// Method to check eligibility
bloodDonorSchema.methods.checkEligibility = function() {
  const age = this.age;
  const weight = this.personalInfo.weight;
  
  // Basic eligibility criteria
  if (age < 18 || age > 65) {
    return { eligible: false, reason: 'Age requirement not met (18-65 years)' };
  }
  
  if (weight < 45) {
    return { eligible: false, reason: 'Weight requirement not met (minimum 45kg)' };
  }
  
  // Check for permanent deferrals
  if (this.eligibility.permanentDeferral.isPermanentlyDeferred) {
    return { eligible: false, reason: this.eligibility.permanentDeferral.reason };
  }
  
  // Check for temporary deferrals
  const activeDeferrals = this.eligibility.deferralReasons.filter(
    deferral => new Date(deferral.deferralEndDate) > new Date()
  );
  
  if (activeDeferrals.length > 0) {
    return { 
      eligible: false, 
      reason: `Temporarily deferred: ${activeDeferrals[0].reason}`,
      deferralEndDate: activeDeferrals[0].deferralEndDate
    };
  }
  
  return { eligible: true };
};

// Pre-save middleware to calculate BMI
bloodDonorSchema.pre('save', function(next) {
  if (this.personalInfo.weight && this.personalInfo.height) {
    this.personalInfo.bmi = this.calculateBMI();
  }
  next();
});

// Static method to generate donor ID
bloodDonorSchema.statics.generateDonorId = async function(bloodBankId) {
  const count = await this.countDocuments({ bloodBankId });
  const bloodBank = await mongoose.model('User').findById(bloodBankId);
  const bloodBankCode = bloodBank?.bloodBankName?.substring(0, 3).toUpperCase() || 'BBK';
  return `${bloodBankCode}${String(count + 1).padStart(6, '0')}`;
};

// Static method to get eligible donors
bloodDonorSchema.statics.getEligibleDonors = async function(bloodBankId, bloodType = null) {
  const query = {
    bloodBankId,
    status: 'Active',
    'eligibility.isEligible': true,
    'eligibility.permanentDeferral.isPermanentlyDeferred': false
  };
  
  if (bloodType) {
    query['personalInfo.bloodType'] = bloodType;
  }
  
  return await this.find(query).sort({ 'medicalInfo.lastDonationDate': 1 });
};

const BloodDonor = mongoose.model('BloodDonor', bloodDonorSchema);
export default BloodDonor;
