import mongoose from 'mongoose';

const PharmacySettingsSchema = new mongoose.Schema({
  pharmacyName: { type: String, default: '' },
  description: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  operatingHours: { type: String, default: '' },
  deliverySameDay: { type: Boolean, default: false },
  deliveryNextDay: { type: Boolean, default: true },
  minOrderAmount: { type: Number, default: 0 },
  taxPercent: { type: Number, default: 0 },
  enableNotifications: { type: Boolean, default: true },
  lowStockAlertThreshold: { type: Number, default: 10 },
  logoCloudinaryUrl: { type: String },
  logoCloudinaryId: { type: String },
  bannerCloudinaryUrl: { type: String },
  bannerCloudinaryId: { type: String },
}, { timestamps: true });

const PharmacySettings = mongoose.model('PharmacySettings', PharmacySettingsSchema);
export default PharmacySettings;


