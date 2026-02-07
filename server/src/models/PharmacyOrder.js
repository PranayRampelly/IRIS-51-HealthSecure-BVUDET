import mongoose from 'mongoose';

const PharmacyOrderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  customer: {
    name: { type: String, required: true },
    phone: { type: String },
    address: { type: String },
  },
  items: [
    {
      sku: { type: String, required: true },
      name: { type: String, required: true },
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true, min: 0 },
    },
  ],
  prescriptionCloudinaryUrl: { type: String },
  prescriptionCloudinaryId: { type: String },
  totalAmount: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  placedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// 'orderNumber' already has unique: true; avoid duplicate explicit index

const PharmacyOrder = mongoose.model('PharmacyOrder', PharmacyOrderSchema);
export default PharmacyOrder;


