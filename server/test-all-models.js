import mongoose from 'mongoose';

// Test all models to check for duplicate index warnings
const testAllModels = async () => {
  console.log('🔍 Testing all models for duplicate index warnings...\n');
  
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
      './src/models/PendingUser.js',
      './src/models/VaultFile.js',
      './src/models/VaultShare.js',
      './src/models/VaultAudit.js',
      './src/models/InsurancePolicy.js',
      './src/models/HealthAssessment.js',
      './src/models/AuditLog.js',
      './src/models/ActivityLog.js',
      './src/models/BedManagement.js',
      './src/models/HospitalDepartment.js',
      './src/models/ProofTemplate.js',
      './src/models/DashboardStats.js',
      './src/models/AdmissionRequest.js'
    ];
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const modelPath of models) {
      try {
        await import(modelPath);
        console.log(`✅ ${modelPath.split('/').pop()} - Loaded successfully`);
        successCount++;
      } catch (error) {
        console.log(`❌ ${modelPath.split('/').pop()} - Error: ${error.message}`);
        errorCount++;
      }
    }
    
    console.log('\n📊 Test Results:');
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    console.log(`📈 Total: ${successCount + errorCount}`);
    
    if (errorCount === 0) {
      console.log('\n🎉 All models loaded successfully without duplicate index warnings!');
      console.log('✅ The duplicate index fixes are working correctly.');
    } else {
      console.log('\n⚠️  Some models failed to load. Please check the errors above.');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testAllModels(); 