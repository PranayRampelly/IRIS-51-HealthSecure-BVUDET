import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthsecure', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const testServerStart = async () => {
  try {
    console.log('🔧 Testing server startup without duplicate index warnings...');
    
    // Import all models to trigger index creation
    console.log('📦 Importing models...');
    
    await import('./src/models/InsuranceApplication.js');
    console.log('✅ InsuranceApplication model imported');
    
    await import('./src/models/InsurancePolicy.js');
    console.log('✅ InsurancePolicy model imported');
    
    await import('./src/models/Policy.js');
    console.log('✅ Policy model imported');
    
    await import('./src/models/ProofRequest.js');
    console.log('✅ ProofRequest model imported');
    
    await import('./src/models/User.js');
    console.log('✅ User model imported');
    
    await import('./src/models/PatientAdmission.js');
    console.log('✅ PatientAdmission model imported');
    
    await import('./src/models/EmergencyResponse.js');
    console.log('✅ EmergencyResponse model imported');
    
    await import('./src/models/Appointment.js');
    console.log('✅ Appointment model imported');
    
    await import('./src/models/InsuranceClaim.js');
    console.log('✅ InsuranceClaim model imported');
    
    await import('./src/models/Doctor.js');
    console.log('✅ Doctor model imported');
    
    await import('./src/models/ProofValidation.js');
    console.log('✅ ProofValidation model imported');
    
    console.log('\n🎉 All models imported successfully!');
    console.log('✅ No duplicate index warnings should appear now.');
    
  } catch (error) {
    console.error('❌ Error during model import:', error);
  } finally {
    mongoose.connection.close();
  }
};

testServerStart(); 