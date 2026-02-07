import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthsecure');

// Import the Appointment model
const Appointment = mongoose.model('Appointment', {
  appointmentNumber: String,
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  appointmentType: String,
  department: String,
  scheduledDate: Date,
  scheduledTime: String,
  estimatedDuration: Number,
  consultationType: String,
  status: String,
  priority: String,
  symptoms: [String],
  patientNotes: String,
  followUpRequired: Boolean,
  paymentStatus: String,
  cost: Object,
  notifications: [Object],
  isEmergency: Boolean,
  doctorDetails: Object,
  bookingSource: String,
  emergencyPriority: String,
  preferredLanguage: String,
  termsAccepted: Boolean,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  statusHistory: [Object],
  prescriptions: [Object],
  labReports: [Object],
  createdAt: Date,
  updatedAt: Date
});

async function createTestAppointment() {
  try {
    // Create a test appointment with a future date
    const testAppointment = new Appointment({
      appointmentNumber: 'APT-TEST-001',
      patient: '687a22c68d3190faad6800ec', // Use the patient ID from your sample
      doctor: '687c20d8600815662b42dbc8', // Use the doctor ID from your sample
      hospital: '689f2167130aa5203a325de8', // Use the hospital ID from your sample
      appointmentType: 'consultation',
      department: 'General Medicine',
      scheduledDate: new Date('2025-12-25T10:00:00.000Z'), // Future date
      scheduledTime: '10:00',
      estimatedDuration: 30,
      consultationType: 'in-person',
      status: 'confirmed',
      priority: 'normal',
      symptoms: ['Test symptom 1', 'Test symptom 2'],
      patientNotes: 'Test appointment for frontend testing',
      followUpRequired: false,
      paymentStatus: 'paid',
      cost: {
        consultationFee: 500,
        additionalCharges: 0,
        totalAmount: 500
      },
      notifications: [],
      isEmergency: false,
      doctorDetails: {},
      bookingSource: 'web',
      emergencyPriority: 'normal',
      preferredLanguage: 'english',
      termsAccepted: true,
      createdBy: '687c20d8600815662b42dbc8',
      statusHistory: [{
        status: 'confirmed',
        timestamp: new Date(),
        updatedBy: '687c20d8600815662b42dbc8',
        notes: 'Test appointment created'
      }],
      prescriptions: [],
      labReports: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await testAppointment.save();
    console.log('✅ Test appointment created successfully:', testAppointment._id);
    console.log('📅 Scheduled for:', testAppointment.scheduledDate);
    console.log('🔍 Status:', testAppointment.status);
    
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error creating test appointment:', error);
    mongoose.connection.close();
  }
}

createTestAppointment();
