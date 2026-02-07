import mongoose from 'mongoose';

const PharmacyInventoryItemSchema = new mongoose.Schema({
  pharmacy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sku: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  stock: { type: Number, required: true, default: 0, min: 0 },
  threshold: { type: Number, required: true, default: 10, min: 0 },
  price: { type: Number, required: true, default: 0 },
  // Extended metadata to match patient pharmacy features
  generic: { type: String, trim: true },
  dosage: { type: String, trim: true },
  form: { type: String, trim: true },
  manufacturer: { type: String, trim: true },
  description: { type: String, trim: true },
  category: { type: String, trim: true },
  prescriptionRequired: { type: Boolean, default: false },
  expiryDate: { type: Date },
  storage: { type: String, trim: true },
  dosageInstructions: { type: String, trim: true },
  deliveryTime: { type: String, trim: true },
  genericPrice: { type: Number },
  brandPrice: { type: Number },
  insuranceCovered: { type: Boolean, default: false },
  insurancePrice: { type: Number },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  cloudinaryUrl: { type: String },
  cloudinaryId: { type: String },
}, { timestamps: true });

// Create compound index for pharmacy + sku to ensure SKU is unique per pharmacy
PharmacyInventoryItemSchema.index({ pharmacy: 1, sku: 1 }, { unique: true });

const PharmacyInventoryItem = mongoose.model('PharmacyInventoryItem', PharmacyInventoryItemSchema);
export default PharmacyInventoryItem;



