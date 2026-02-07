import mongoose from 'mongoose';

const PharmacySupplierSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  contactName: { type: String, trim: true },
  email: { type: String, trim: true },
  phone: { type: String, trim: true },
  address: { type: String, trim: true },
  deliveryAreas: { type: [String], default: [] },
  minOrderQuantity: { type: Number, default: 0 },
  leadTimeDays: { type: Number, default: 0 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  terms: { type: String, trim: true },
  notes: { type: String, trim: true },
  isPreferred: { type: Boolean, default: false },
  cloudinaryUrl: { type: String },
  cloudinaryId: { type: String },
}, { timestamps: true });

PharmacySupplierSchema.index({ name: 1 }, { unique: false });

const PharmacySupplier = mongoose.model('PharmacySupplier', PharmacySupplierSchema);
export default PharmacySupplier;


