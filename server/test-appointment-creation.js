import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthsecure')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection failed:', err));

// Import models
import Appointment from './src/models/Appointment.js';
import Payment from './src/models/Payment.js';
import User from './src/models/User.js';

async function testAppointmentCreation() {
  try {
    console.log('🔍 Testing appointment creation flow...');
    
    // Find a test user (patient)
    const patient = await User.findOne({ role: 'patient' });
    if (!patient) {
      console.log('❌ No patient found. Please create a test patient first.');
      return;
    }
    console.log('✅ Found patient:', patient.firstName, patient.lastName);
    
    // Find a test doctor
    const doctor = await User.findOne({ role: 'doctor' });
    if (!doctor) {
      console.log('❌ No doctor found. Please create a test doctor first.');
      return;
    }
    console.log('✅ Found doctor:', doctor.firstName, doctor.lastName);
    
    // Find a test hospital
    const hospital = await User.findOne({ role: 'hospital' });
    if (!hospital) {
      console.log('❌ No hospital found. Please create a test hospital first.');
      return;
    }
    console.log('✅ Found hospital:', hospital.hospitalName || hospital.firstName);
    
    // Create test appointment data
    const appointmentData = {
      appointmentNumber: `APT-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      patient: patient._id,
      doctor: doctor._id,
      hospital: hospital._id,
      appointmentType: 'consultation',
      department: 'General Medicine',
      scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      scheduledTime: '10:00',
      consultationType: 'in-person',
      symptoms: ['Fever', 'Cough'],
      doctorNotes: 'Test appointment',
      emergencyContact: {
        name: 'Emergency Contact',
        phone: '+91-9876543210',
        relationship: 'Family'
      },
      cost: {
        consultationFee: 800,
        originalConsultationFee: 800,
        convenienceFee: 40,
        additionalCharges: 0,
        totalAmount: 40
      },
      paymentStatus: 'pending',
      status: 'pending',
      createdBy: patient._id,
      bookingStep: 4,
      bookingProgress: 100
    };
    
    console.log('🔍 Test appointment data:', appointmentData);
    
    // Try to create the appointment
    const appointment = new Appointment(appointmentData);
    await appointment.save();
    
    console.log('✅ Appointment created successfully!');
    console.log('📋 Appointment ID:', appointment._id);
    console.log('📋 Appointment Number:', appointment.appointmentNumber);
    console.log('📋 Status:', appointment.status);
    console.log('📋 Payment Status:', appointment.paymentStatus);
    
    // Clean up - delete the test appointment
    await Appointment.findByIdAndDelete(appointment._id);
    console.log('🧹 Test appointment cleaned up');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('❌ Error details:', error.message);
    
    if (error.errors) {
      console.error('❌ Validation errors:');
      Object.keys(error.errors).forEach(key => {
        console.error(`  - ${key}: ${error.errors[key].message}`);
      });
    }
  } finally {
    mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the test
testAppointmentCreation();
