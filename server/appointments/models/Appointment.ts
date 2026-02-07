import mongoose from 'mongoose';

const AppointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  time: { type: Date, required: true },
  type: { type: String, enum: ['in-person', 'video'], required: true },
  status: { type: String, enum: ['booked', 'cancelled', 'completed'], default: 'booked' },
  encryptedNotes: { type: String },
  encryptedDocuments: [{ type: String }],
  consent: { type: Object, required: true },
  audit: [{ type: Object }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('Appointment', AppointmentSchema); 