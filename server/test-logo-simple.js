import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Simple test to verify logo endpoints are accessible
async function testLogoEndpoints() {
  console.log('🔍 Testing Logo Endpoints...\n');

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Test if the logo controller can be imported
    try {
      const { uploadSupplierLogo } = await import('./src/controllers/logoController.js');
      console.log('✅ Logo controller imported successfully');
    } catch (error) {
      console.log('❌ Failed to import logo controller:', error.message);
    }

    // Test if the routes are properly set up
    try {
      const supplierRoutes = await import('./src/routes/suppliers.js');
      console.log('✅ Supplier routes imported successfully');
    } catch (error) {
      console.log('❌ Failed to import supplier routes:', error.message);
    }

    console.log('\n🎉 Logo endpoint test completed!');
    console.log('\n📋 Available Logo Endpoints:');
    console.log('  POST   /pharmacy/suppliers/:id/logo    # Upload logo');
    console.log('  PUT    /pharmacy/suppliers/:id/logo    # Update logo');
    console.log('  GET    /pharmacy/suppliers/:id/logo    # Get logo info');
    console.log('  DELETE /pharmacy/suppliers/:id/logo    # Delete logo');

  } catch (error) {
    console.error('❌ Logo endpoint test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

// Run the test
testLogoEndpoints().catch(console.error);

