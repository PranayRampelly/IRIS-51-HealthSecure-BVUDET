import { spawn } from 'child_process';
import path from 'path';

console.log('🧪 Testing server startup...');

// Test importing the main modules
async function testImports() {
  try {
    console.log('📦 Testing imports...');
    
    // Test cloudinary utility
    const { uploadToCloudinary, deleteFromCloudinary } = await import('./src/utils/cloudinary.js');
    console.log('✅ Cloudinary utility imported successfully');
    
    // Test logger
    const logger = await import('./src/utils/logger.js');
    console.log('✅ Logger imported successfully');
    
    // Test models
    const ProofRequest = await import('./src/models/ProofRequest.js');
    console.log('✅ ProofRequest model imported successfully');
    
    const ProofTemplate = await import('./src/models/ProofTemplate.js');
    console.log('✅ ProofTemplate model imported successfully');
    
    // Test controllers
    const proofRequestController = await import('./src/controllers/proofRequestController.js');
    console.log('✅ ProofRequest controller imported successfully');
    
    const proofTemplateController = await import('./src/controllers/proofTemplateController.js');
    console.log('✅ ProofTemplate controller imported successfully');
    
    // Test routes
    const proofRequestRoutes = await import('./src/routes/proofRequests.js');
    console.log('✅ ProofRequest routes imported successfully');
    
    const proofTemplateRoutes = await import('./src/routes/proofTemplates.js');
    console.log('✅ ProofTemplate routes imported successfully');
    
    // Test middleware
    const { authorize } = await import('./src/middleware/authorization.js');
    console.log('✅ Authorization middleware imported successfully');
    
    console.log('🎉 All imports successful!');
    return true;
  } catch (error) {
    console.error('❌ Import error:', error.message);
    console.error('Stack trace:', error.stack);
    return false;
  }
}

// Test server startup
async function testServerStartup() {
  return new Promise((resolve) => {
    console.log('🚀 Testing server startup...');
    
    const server = spawn('node', ['src/server.js'], {
      cwd: process.cwd(),
      stdio: 'pipe',
      env: { ...process.env, NODE_ENV: 'test' }
    });
    
    let output = '';
    let errorOutput = '';
    
    server.stdout.on('data', (data) => {
      output += data.toString();
      console.log('📤 Server output:', data.toString());
    });
    
    server.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.log('📤 Server error:', data.toString());
    });
    
    server.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Server started successfully');
        resolve(true);
      } else {
        console.log('❌ Server failed to start');
        console.log('Error output:', errorOutput);
        resolve(false);
      }
    });
    
    // Kill server after 5 seconds
    setTimeout(() => {
      server.kill();
    }, 5000);
  });
}

// Run tests
async function runTests() {
  console.log('🚀 Starting server tests...\n');
  
  const importTest = await testImports();
  const serverTest = await testServerStartup();
  
  console.log('\n📊 Test Results:');
  console.log(`✅ Imports: ${importTest ? 'PASSED' : 'FAILED'}`);
  console.log(`✅ Server Startup: ${serverTest ? 'PASSED' : 'FAILED'}`);
  
  if (importTest && serverTest) {
    console.log('\n🎉 All tests passed! The server is ready to run.');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the errors above.');
    process.exit(1);
  }
}

runTests().catch(console.error); 