import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Test authentication and supplier endpoints
async function testAuthAndSuppliers() {
  console.log('🔍 Testing Authentication and Supplier Endpoints...\n');

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Test if we can create a test pharmacy user
    const Pharmacy = (await import('./src/models/Pharmacy.js')).default;
    
    // Check if there are any pharmacies in the database
    const pharmacyCount = await Pharmacy.countDocuments();
    console.log(`📊 Found ${pharmacyCount} pharmacies in database`);

    if (pharmacyCount === 0) {
      console.log('⚠️  No pharmacies found. You need to create a pharmacy account first.');
      console.log('   Please register a pharmacy account through the frontend.');
    } else {
      // Get the first pharmacy
      const pharmacy = await Pharmacy.findOne();
      console.log(`📋 Sample pharmacy: ${pharmacy.name} (${pharmacy.email})`);
    }

    // Test if PharmacySupplier model can be imported
    try {
      const PharmacySupplier = (await import('./src/models/PharmacySupplier.js')).default;
      const supplierCount = await PharmacySupplier.countDocuments();
      console.log(`📊 Found ${supplierCount} suppliers in database`);
    } catch (error) {
      console.log('❌ Failed to import PharmacySupplier model:', error.message);
    }

    console.log('\n🎉 Authentication test completed!');
    console.log('\n💡 If you\'re getting 500 errors, make sure:');
    console.log('   1. You are logged in as a pharmacy user');
    console.log('   2. Your authentication token is valid');
    console.log('   3. The pharmacy account exists in the database');

  } catch (error) {
    console.error('❌ Authentication test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

// Run the test
testAuthAndSuppliers().catch(console.error);

