import mongoose from 'mongoose';
import Payment from './src/models/Payment.js';
import dotenv from 'dotenv';

dotenv.config();

async function testPaymentCreation() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthsecure');
    console.log('✅ Connected to MongoDB');

    // Test payment creation with temporary appointment ID
    const testPayment = new Payment({
      paymentId: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      patient: new mongoose.Types.ObjectId('687a22c68d3190faad6800ec'),
      doctor: new mongoose.Types.ObjectId('687c20d8600815662b42dbc8'),
      hospital: new mongoose.Types.ObjectId('687c20d8600815662b42dbc8'),
      amount: 840,
      baseAmount: 800,
      convenienceFee: 40,
      currency: 'INR',
      consultationType: 'in-person',
      paymentMethod: 'online',
      razorpayOrderId: `order_${Date.now()}`,
      status: 'pending',
      createdBy: new mongoose.Types.ObjectId('687a22c68d3190faad6800ec'),
      // No appointment field for temporary appointments
      appointmentData: {
        appointmentNumber: `APT-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        patient: new mongoose.Types.ObjectId('687a22c68d3190faad6800ec'),
        doctor: new mongoose.Types.ObjectId('687c20d8600815662b42dbc8'),
        hospital: new mongoose.Types.ObjectId('687c20d8600815662b42dbc8'),
        appointmentType: 'consultation',
        department: 'General Medicine',
        scheduledDate: new Date('2025-08-31'),
        scheduledTime: '18:53:31',
        consultationType: 'in-person',
        symptoms: [],
        doctorNotes: '',
        emergencyContact: { name: '', phone: '', relationship: '' },
        cost: {
          consultationFee: 800,
          convenienceFee: 40,
          additionalCharges: 0,
          totalAmount: 840
        },
        paymentStatus: 'pending',
        status: 'pending',
        createdBy: new mongoose.Types.ObjectId('687a22c68d3190faad6800ec'),
        bookingStep: 1,
        bookingProgress: 25
      }
    });

    console.log('🔍 Testing payment creation with temporary appointment ID');
    
    // Try to save the payment
    const savedPayment = await testPayment.save();
    console.log('✅ Payment created successfully with ID:', savedPayment._id);
    console.log('✅ Appointment field:', savedPayment.appointment);
    console.log('✅ Appointment data stored:', !!savedPayment.appointmentData);

    // Clean up - delete the test payment
    await Payment.findByIdAndDelete(savedPayment._id);
    console.log('✅ Test payment cleaned up');

  } catch (error) {
    console.error('❌ Error testing payment creation:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

testPaymentCreation();

