import mongoose from 'mongoose';

// Mirror of PatientCart model to match existing import path
const PatientCartItemSchema = new mongoose.Schema({
	patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'PharmacyInventoryItem', required: true },
	variant: { type: String, enum: ['generic', 'brand'], default: 'generic' },
	quantity: { type: Number, required: true, min: 1, default: 1 },
	packSize: { type: Number, required: true, min: 1, default: 10 },
	pharmacy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	insuranceApplied: { type: Boolean, default: false },
	unitPrice: { type: Number, required: true, min: 0 },
	addedAt: { type: Date, default: Date.now },
}, { timestamps: true });

PatientCartItemSchema.index({ patientId: 1, medicineId: 1, variant: 1 }, { unique: true });

const PatientCartItem = mongoose.model('PatientCartItem', PatientCartItemSchema);
export default PatientCartItem;




