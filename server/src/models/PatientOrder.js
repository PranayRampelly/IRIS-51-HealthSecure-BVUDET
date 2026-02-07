import mongoose from 'mongoose';

const PatientOrderSchema = new mongoose.Schema({
  orderNumber: { 
    type: String, 
    required: true, 
    unique: true,
    default: () => {
      const ts = Date.now().toString(36).toUpperCase();
      const rnd = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      return `PO-${ts}-${rnd}`;
    }
  },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'PharmacyInventoryItem', required: true },
      medicineName: { type: String, required: true },
      variant: { type: String, enum: ['generic', 'brand'], required: true },
      quantity: { type: Number, required: true, min: 1 },
      packSize: { type: Number, required: true, min: 1 },
      unitPrice: { type: Number, required: true, min: 0 },
      totalPrice: { type: Number, required: true, min: 0 },
      pharmacy: { type: String, required: true },
      insuranceApplied: { type: Boolean, default: false },
      insurancePrice: { type: Number, min: 0 },
    }
  ],
  deliveryDetails: {
    option: { type: String, enum: ['sameDay', 'standard', 'pickup'], default: 'standard' },
    slot: { type: String },
    address: { type: String, required: true },
    instructions: { type: String },
  },
  paymentDetails: {
    method: { type: String, enum: ['cod', 'online', 'card'], default: 'cod' },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    transactionId: { type: String },
  },
  pricing: {
    subtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, required: true, min: 0 },
    discount: { type: Number, required: true, min: 0 },
    tax: { type: Number, required: true, min: 0 },
    grandTotal: { type: Number, required: true, min: 0 },
    couponCode: { type: String },
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  prescriptionRequired: { type: Boolean, default: false },
  prescriptionUrl: { type: String },
  prescriptionId: { type: String },
  estimatedDelivery: { type: Date },
  deliveredAt: { type: Date },
  placedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Ensure order number exists before validation (in case of manual set to empty)
PatientOrderSchema.pre('validate', function(next) {
  if (!this.orderNumber) {
    const ts = Date.now().toString(36).toUpperCase();
    const rnd = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `PO-${ts}-${rnd}`;
  }
  // Safeguard: if payment method is online, ensure status is completed
  if (this.paymentDetails && this.paymentDetails.method === 'online') {
    this.paymentDetails.status = 'completed';
  }
  next();
});

const PatientOrder = mongoose.model('PatientOrder', PatientOrderSchema);
export default PatientOrder;
