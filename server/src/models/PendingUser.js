import mongoose from 'mongoose';

const pendingUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    required: true,
    enum: ['patient', 'doctor', 'hospital', 'insurance', 'researcher', 'admin', 'bloodbank', 'pharmacy', 'bioaura']
  },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: Date,
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  licenseNumber: String,
  organization: String,
  specialization: String,
  hospital: String,
  experience: Number,
  // Hospital specific fields
  hospitalName: String,
  hospitalType: String,
  // Blood Bank specific fields
  bloodBankName: String,
  bloodBankType: String,
  bloodBankLicense: String,
  // Pharmacy specific
  pharmacyName: String,
  pharmacyLicense: String,
  pharmacyType: String,
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }, // For patient users
  bloodType: String,
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  profileImage: String,
  verificationToken: { type: String, required: true, unique: true },
  verificationExpires: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

const PendingUser = mongoose.model('PendingUser', pendingUserSchema);
export default PendingUser; 