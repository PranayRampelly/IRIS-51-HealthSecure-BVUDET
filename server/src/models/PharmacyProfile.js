import mongoose from 'mongoose';

const PharmacyProfileSchema = new mongoose.Schema({
  // Basic Information
  firstName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  email: { type: String, trim: true, required: true },
  phone: { type: String, trim: true },
  avatarCloudinaryUrl: { type: String },
  avatarCloudinaryId: { type: String },

  // Business Information
  businessName: { type: String, trim: true, required: true },
  licenseNumber: { type: String, trim: true, required: true },
  gstNumber: { type: String, trim: true },
  panNumber: { type: String, trim: true },
  pharmacyType: { type: String, enum: ['Retail', 'Hospital', 'Chain', 'Online', 'Compounding', 'Specialty', 'retail', 'hospital', 'clinical', 'compounding', 'online', 'chain', 'independent'], default: 'Retail' },
  establishmentYear: { type: Number },
  businessHours: { type: String, trim: true },
  description: { type: String, trim: true },
  specialties: [{ type: String, trim: true }],
  certifications: [{ type: String, trim: true }],

  // Location & Contact
  address: { type: String, trim: true, required: true },
  city: { type: String, trim: true, required: true },
  state: { type: String, trim: true, required: true },
  pincode: { type: String, trim: true },
  country: { type: String, trim: true, default: 'India' },
  latitude: { type: Number },
  longitude: { type: Number },
  website: { type: String, trim: true },
  emergencyContact: { type: String, trim: true },

  // Services & Delivery
  homeDelivery: { type: Boolean, default: false },
  deliveryRadius: { type: Number, default: 5 }, // in km
  deliveryCharges: { type: Number, default: 0 },
  freeDeliveryThreshold: { type: Number, default: 0 },
  acceptCOD: { type: Boolean, default: true },
  acceptOnlinePayment: { type: Boolean, default: true },
  prescriptionServices: { type: Boolean, default: true },
  consultationServices: { type: Boolean, default: false },
  emergencyServices: { type: Boolean, default: false },
  services: [{ type: String, trim: true }],

  // Payment & Settings
  orderUpdates: { type: Boolean, default: true },
  emailNotifications: { type: Boolean, default: true },
  smsNotifications: { type: Boolean, default: true },
  autoReorder: { type: Boolean, default: false },
  lowStockThreshold: { type: Number, default: 10 },
  taxRate: { type: Number, default: 18 }, // GST percentage

  // Documents
  documents: {
    license: {
      url: { type: String },
      publicId: { type: String },
      uploadedAt: { type: Date }
    },
    gst: {
      url: { type: String },
      publicId: { type: String },
      uploadedAt: { type: Date }
    },
    pan: {
      url: { type: String },
      publicId: { type: String },
      uploadedAt: { type: Date }
    },
    other: [{
      name: { type: String, trim: true },
      url: { type: String },
      publicId: { type: String },
      uploadedAt: { type: Date }
    }]
  },

  // Profile Completion Status
  profileCompleted: { type: Boolean, default: false },
  completionPercentage: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

// Index for faster queries
PharmacyProfileSchema.index({ email: 1 });
PharmacyProfileSchema.index({ businessName: 1 });
PharmacyProfileSchema.index({ licenseNumber: 1 });

const PharmacyProfile = mongoose.model('PharmacyProfile', PharmacyProfileSchema);
export default PharmacyProfile;


