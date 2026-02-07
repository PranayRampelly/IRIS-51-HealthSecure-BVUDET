import mongoose from 'mongoose';

const vitalSignsSchema = new mongoose.Schema({
  bloodPressure: String,
  heartRate: String,
  temperature: String,
  oxygenSaturation: String,
  weight: String
}, { _id: false });

const attachmentSchema = new mongoose.Schema({
  name: String,
  url: String,
  type: String
}, { _id: false });

const hospitalPatientRecordSchema = new mongoose.Schema({
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientId: {
    type: String,
    required: true,
    index: true
  },
  patientObjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  patientName: {
    type: String,
    required: true
  },
  recordType: {
    type: String,
    enum: ['consultation', 'lab_result', 'imaging', 'medication', 'vital_signs', 'procedure', 'other'],
    default: 'consultation'
  },
  department: {
    type: String,
    required: true
  },
  physician: String,
  physicianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  date: {
    type: Date,
    default: Date.now
  },
  diagnosis: String,
  treatment: String,
  medications: String,
  vitalSigns: vitalSignsSchema,
  labResults: String,
  imagingResults: String,
  notes: String,
  attachments: [attachmentSchema],
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active'
  }
}, {
  timestamps: true
});

hospitalPatientRecordSchema.index({ hospitalId: 1, recordType: 1, date: -1 });
hospitalPatientRecordSchema.index({ hospitalId: 1, department: 1 });

const HospitalPatientRecord = mongoose.model('HospitalPatientRecord', hospitalPatientRecordSchema);

export default HospitalPatientRecord;

