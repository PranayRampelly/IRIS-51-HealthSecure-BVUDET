import mongoose from 'mongoose';

const PharmacyPrescriptionSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true },
  patient: { type: String, required: true },
  doctor: { type: String, required: true },
  items: [
    {
      name: { type: String, required: true },
      dosage: { type: String },
      quantity: { type: Number, default: 1 },
    },
  ],
  documentCloudinaryUrl: { type: String },
  documentCloudinaryId: { type: String },
  status: { type: String, enum: ['queued', 'verified', 'dispensed', 'cancelled'], default: 'queued' },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

// 'number' already has unique: true; avoid duplicate explicit index

const PharmacyPrescription = mongoose.model('PharmacyPrescription', PharmacyPrescriptionSchema);
export default PharmacyPrescription;


