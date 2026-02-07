import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

// Load environment variables
dotenv.config();

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Test consultation fees
const testConsultationFees = async () => {
  try {
    console.log('🔍 Testing consultation fees in database...');
    
    // Find the specific doctor by email
    const doctor = await User.findOne({ 
      email: 'dummy12318724@gmail.com',
      role: 'doctor'
    });
    
    if (!doctor) {
      console.log('❌ Doctor not found');
      return;
    }
    
    console.log('✅ Doctor found:', {
      _id: doctor._id,
      name: `${doctor.firstName} ${doctor.lastName}`,
      email: doctor.email,
      role: doctor.role,
      consultationFees: doctor.consultationFees,
      hasConsultationFees: !!doctor.consultationFees,
      consultationFeesType: typeof doctor.consultationFees,
      consultationFeesKeys: doctor.consultationFees ? Object.keys(doctor.consultationFees) : 'N/A'
    });
    
    // Check if consultation fees are properly set
    if (doctor.consultationFees) {
      console.log('💰 Consultation fees details:', {
        online: doctor.consultationFees.online,
        inPerson: doctor.consultationFees.inPerson,
        onlineValid: doctor.consultationFees.online > 0,
        inPersonValid: doctor.consultationFees.inPerson > 0
      });
    } else {
      console.log('⚠️ No consultation fees found');
    }
    
    // Test the getConsultationFees method
    try {
      const fees = doctor.getConsultationFees();
      console.log('✅ getConsultationFees method result:', fees);
    } catch (error) {
      console.log('❌ getConsultationFees method error:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error testing consultation fees:', error);
  }
};

// Run the test
const runTest = async () => {
  await connectDB();
  await testConsultationFees();
  await mongoose.disconnect();
  console.log('✅ Test completed');
};

runTest();

