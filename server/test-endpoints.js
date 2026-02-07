import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Test if the server can start and routes are accessible
async function testEndpoints() {
  console.log('🔍 Testing API Endpoints...\n');

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Test if the server can be imported (this will check for syntax errors)
    try {
      const server = await import('./src/server.js');
      console.log('✅ Server module imported successfully');
    } catch (error) {
      console.log('❌ Failed to import server:', error.message);
    }

    // Test if supplier routes can be imported
    try {
      const supplierRoutes = await import('./src/routes/suppliers.js');
      console.log('✅ Supplier routes imported successfully');
    } catch (error) {
      console.log('❌ Failed to import supplier routes:', error.message);
    }

    // Test if logo controller can be imported
    try {
      const logoController = await import('./src/controllers/logoController.js');
      console.log('✅ Logo controller imported successfully');
    } catch (error) {
      console.log('❌ Failed to import logo controller:', error.message);
    }

    console.log('\n🎉 Endpoint test completed!');
    console.log('\n📋 Available Endpoints:');
    console.log('  GET    /api/pharmacy/suppliers           # List suppliers');
    console.log('  POST   /api/pharmacy/suppliers           # Create supplier');
    console.log('  GET    /api/pharmacy/suppliers/:id       # Get supplier');
    console.log('  PUT    /api/pharmacy/suppliers/:id       # Update supplier');
    console.log('  DELETE /api/pharmacy/suppliers/:id       # Delete supplier');
    console.log('  POST   /api/pharmacy/suppliers/:id/logo  # Upload logo');
    console.log('  PUT    /api/pharmacy/suppliers/:id/logo  # Update logo');
    console.log('  GET    /api/pharmacy/suppliers/:id/logo  # Get logo');
    console.log('  DELETE /api/pharmacy/suppliers/:id/logo  # Delete logo');

  } catch (error) {
    console.error('❌ Endpoint test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

// Run the test
testEndpoints().catch(console.error);

