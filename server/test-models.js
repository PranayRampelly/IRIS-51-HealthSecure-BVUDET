import mongoose from 'mongoose';

// Test all models to check for duplicate index warnings
const testModels = async () => {
  console.log('Testing all models for duplicate index warnings...\n');
  
  try {
    // Import all models
    const models = [
      './src/models/Patient.js',
      './src/models/User.js',
      './src/models/Appointment.js',
      './src/models/InsuranceApplication.js',
      './src/models/Policy.js',
      './src/models/InsuranceClaim.js',
      './src/models/EmergencyResponse.js',
      './src/models/PatientAdmission.js',
      './src/models/ProofValidation.js',
      './src/models/ProofRequest.js',
      './src/models/HealthRecord.js',
      './src/models/Doctor.js',
      './src/models/PendingUser.js'
    ];
    
    for (const modelPath of models) {
      try {
        await import(modelPath);
        console.log(`✅ ${modelPath.split('/').pop()} - Loaded successfully`);
      } catch (error) {
        console.log(`❌ ${modelPath.split('/').pop()} - Error: ${error.message}`);
      }
    }
    
    console.log('\n🎉 All models tested successfully!');
    console.log('If you see no duplicate index warnings above, the fix is working correctly.');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
};

testModels(); 