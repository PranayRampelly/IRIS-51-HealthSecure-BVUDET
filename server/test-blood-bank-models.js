import mongoose from 'mongoose';

async function testBloodBankModels() {
  try {
    console.log('🧪 Testing Blood Bank Models Import...');
    
    // Test BloodInventory model
    console.log('📦 Testing BloodInventory model...');
    const BloodInventory = await import('./src/models/BloodInventory.js');
    console.log('✅ BloodInventory model imported successfully');
    
    // Test BloodDonor model
    console.log('👥 Testing BloodDonor model...');
    const BloodDonor = await import('./src/models/BloodDonor.js');
    console.log('✅ BloodDonor model imported successfully');
    
    // Test BloodRequest model
    console.log('📋 Testing BloodRequest model...');
    const BloodRequest = await import('./src/models/BloodRequest.js');
    console.log('✅ BloodRequest model imported successfully');
    
    // Test QualityControl model
    console.log('🔬 Testing QualityControl model...');
    const QualityControl = await import('./src/models/QualityControl.js');
    console.log('✅ QualityControl model imported successfully');
    
    // Test validation utility
    console.log('🔍 Testing validation utility...');
    const { validateObjectId } = await import('./src/utils/validation.js');
    console.log('✅ Validation utility imported successfully');
    
    // Test controllers
    console.log('🎮 Testing controllers...');
    const bloodInventoryController = await import('./src/controllers/bloodInventoryController.js');
    const bloodDonorController = await import('./src/controllers/bloodDonorController.js');
    const bloodRequestController = await import('./src/controllers/bloodRequestController.js');
    const qualityControlController = await import('./src/controllers/qualityControlController.js');
    console.log('✅ All controllers imported successfully');
    
    // Test routes
    console.log('🛣️ Testing routes...');
    const bloodInventoryRoutes = await import('./src/routes/bloodInventory.js');
    const bloodDonorRoutes = await import('./src/routes/bloodDonor.js');
    const bloodRequestRoutes = await import('./src/routes/bloodRequest.js');
    const qualityControlRoutes = await import('./src/routes/qualityControl.js');
    console.log('✅ All routes imported successfully');
    
    console.log('\n🎉 All Blood Bank components imported successfully!');
    console.log('\n📊 Summary:');
    console.log('  • 4 Models: BloodInventory, BloodDonor, BloodRequest, QualityControl');
    console.log('  • 4 Controllers: bloodInventoryController, bloodDonorController, bloodRequestController, qualityControlController');
    console.log('  • 4 Routes: bloodInventory, bloodDonor, bloodRequest, qualityControl');
    console.log('  • 1 Utility: validation.js');
    
  } catch (error) {
    console.error('❌ Error testing Blood Bank models:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the test
testBloodBankModels();
