console.log('🧪 Testing imports...');

async function testImports() {
  try {
    console.log('📦 Testing cloudinary utility...');
    const { uploadToCloudinary, deleteFromCloudinary } = await import('./src/utils/cloudinary.js');
    console.log('✅ Cloudinary utility imported successfully');
    
    console.log('📦 Testing logger...');
    const logger = await import('./src/utils/logger.js');
    console.log('✅ Logger imported successfully');
    
    console.log('📦 Testing ProofRequest model...');
    const ProofRequest = await import('./src/models/ProofRequest.js');
    console.log('✅ ProofRequest model imported successfully');
    
    console.log('📦 Testing ProofTemplate model...');
    const ProofTemplate = await import('./src/models/ProofTemplate.js');
    console.log('✅ ProofTemplate model imported successfully');
    
    console.log('📦 Testing proofRequestController...');
    const proofRequestController = await import('./src/controllers/proofRequestController.js');
    console.log('✅ ProofRequest controller imported successfully');
    
    console.log('📦 Testing proofTemplateController...');
    const proofTemplateController = await import('./src/controllers/proofTemplateController.js');
    console.log('✅ ProofTemplate controller imported successfully');
    
    console.log('📦 Testing authorization middleware...');
    const { authorize } = await import('./src/middleware/authorization.js');
    console.log('✅ Authorization middleware imported successfully');
    
    console.log('📦 Testing proofRequest routes...');
    const proofRequestRoutes = await import('./src/routes/proofRequests.js');
    console.log('✅ ProofRequest routes imported successfully');
    
    console.log('📦 Testing proofTemplate routes...');
    const proofTemplateRoutes = await import('./src/routes/proofTemplates.js');
    console.log('✅ ProofTemplate routes imported successfully');
    
    console.log('\n🎉 All imports successful! The server should start without errors.');
    return true;
  } catch (error) {
    console.error('❌ Import error:', error.message);
    console.error('Stack trace:', error.stack);
    return false;
  }
}

testImports().then(success => {
  if (success) {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  } else {
    console.log('\n❌ Some tests failed!');
    process.exit(1);
  }
}).catch(error => {
  console.error('❌ Test error:', error);
  process.exit(1);
}); 