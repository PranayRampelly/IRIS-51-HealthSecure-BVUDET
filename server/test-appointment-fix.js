import mongoose from 'mongoose';
import Appointment from './src/models/Appointment.js';
import dotenv from 'dotenv';

dotenv.config();

async function testAppointmentCreation() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthsecure');
    console.log('✅ Connected to MongoDB');

    // Test appointment creation with correct status
    const testAppointment = new Appointment({
      appointmentNumber: `APT-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      patient: new mongoose.Types.ObjectId('687a22c68d3190faad6800ec'),
      doctor: new mongoose.Types.ObjectId('687a1525e18ff9caeda3a54a'),
      hospital: new mongoose.Types.ObjectId('687a1525e18ff9caeda3a54a'),
      appointmentType: 'consultation',
      department: 'Neurology',
      scheduledDate: new Date('2025-08-28'),
      scheduledTime: '18:43:20',
      consultationType: 'in-person',
      symptoms: [],
      doctorNotes: '',
      emergencyContact: { name: '', phone: '', relationship: '' },
      cost: {
        consultationFee: 500,
        convenienceFee: 25,
        additionalCharges: 0,
        totalAmount: 525
      },
      paymentStatus: 'pending',
      status: 'pending', // This should now work
      createdBy: new mongoose.Types.ObjectId('687a22c68d3190faad6800ec'),
      bookingStep: 1,
      bookingProgress: 25
    });

    console.log('🔍 Testing appointment creation with status:', testAppointment.status);
    
    // Try to save the appointment
    const savedAppointment = await testAppointment.save();
    console.log('✅ Appointment created successfully with ID:', savedAppointment._id);
    console.log('✅ Status:', savedAppointment.status);
    console.log('✅ Payment Status:', savedAppointment.paymentStatus);

    // Clean up - delete the test appointment
    await Appointment.findByIdAndDelete(savedAppointment._id);
    console.log('✅ Test appointment cleaned up');

  } catch (error) {
    console.error('❌ Error testing appointment creation:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

testAppointmentCreation();

