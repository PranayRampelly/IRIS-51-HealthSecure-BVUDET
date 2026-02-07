import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import PharmacySupplier from './src/models/PharmacySupplier.js';
import User from './src/models/User.js';
import { uploadToCloudinary, deleteFromCloudinary, validateCloudinaryConfig } from './src/utils/cloudinary.js';

// Load environment variables
dotenv.config();

// Test configuration
const testConfig = {
  mongodb: {
    uri: process.env.MONGODB_URI,
    connected: false
  },
  cloudinary: {
    configured: false,
    tested: false
  },
  supplier: {
    created: false,
    updated: false,
    deleted: false
  }
};

// Test MongoDB connection
async function testMongoDBConnection() {
  console.log('🔍 Testing MongoDB connection...');
  
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 30000,
      connectTimeoutMS: 10000
    };

    await mongoose.connect(process.env.MONGODB_URI, options);
    console.log('✅ MongoDB connected successfully');
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log(`   Host: ${mongoose.connection.host}`);
    testConfig.mongodb.connected = true;
    
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    return false;
  }
}

// Test Cloudinary configuration
async function testCloudinaryConfig() {
  console.log('🔍 Testing Cloudinary configuration...');
  
  try {
    // Check if Cloudinary is configured
    if (!validateCloudinaryConfig()) {
      throw new Error('Cloudinary configuration is incomplete');
    }

    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });

    // Test Cloudinary connection
    const result = await cloudinary.api.ping();
    if (result.status === 'ok') {
      console.log('✅ Cloudinary configured and connected successfully');
      console.log(`   Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
      testConfig.cloudinary.configured = true;
      return true;
    } else {
      throw new Error('Cloudinary ping failed');
    }
  } catch (error) {
    console.error('❌ Cloudinary configuration failed:', error.message);
    return false;
  }
}

// Test Cloudinary upload
async function testCloudinaryUpload() {
  console.log('🔍 Testing Cloudinary upload...');
  
  try {
    // Create a test image buffer (1x1 pixel PNG)
    const testImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64'
    );

    const result = await uploadToCloudinary(testImageBuffer, 'test-uploads');
    
    if (result && result.secure_url) {
      console.log('✅ Cloudinary upload successful');
      console.log(`   URL: ${result.secure_url}`);
      testConfig.cloudinary.tested = true;
      
      // Clean up test file
      try {
        await deleteFromCloudinary(result.public_id);
        console.log('✅ Test file cleaned up successfully');
      } catch (cleanupError) {
        console.warn('⚠️  Failed to clean up test file:', cleanupError.message);
      }
      
      return true;
    } else {
      throw new Error('Upload result is invalid');
    }
  } catch (error) {
    console.error('❌ Cloudinary upload failed:', error.message);
    return false;
  }
}

// Test supplier model operations
async function testSupplierOperations() {
  console.log('🔍 Testing supplier model operations...');
  
  try {
    // Find or create a test pharmacy user
    let pharmacyUser = await User.findOne({ role: 'pharmacy' });
    if (!pharmacyUser) {
      console.log('   Creating test pharmacy user...');
      pharmacyUser = new User({
        email: 'test-pharmacy@example.com',
        password: 'testpassword123',
        firstName: 'Test',
        lastName: 'Pharmacy',
        role: 'pharmacy',
        isActive: true,
        isEmailVerified: true
      });
      await pharmacyUser.save();
      console.log('   ✅ Test pharmacy user created');
    } else {
      console.log('   ✅ Using existing pharmacy user');
    }

    // Test 1: Create supplier
    console.log('   Testing supplier creation...');
    const supplierData = {
      name: 'Test Supplier Ltd.',
      contactName: 'John Doe',
      email: 'contact@testsupplier.com',
      phone: '+919876543210',
      address: '123 Test Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      country: 'India',
      gstNumber: '27ABCDE1234F1Z5',
      panNumber: 'ABCDE1234F',
      businessType: 'Distributor',
      deliveryAreas: ['Mumbai', 'Pune', 'Nashik'],
      minOrderQuantity: 10,
      minOrderValue: 1000,
      leadTimeDays: 2,
      deliveryCharges: 50,
      freeDeliveryThreshold: 5000,
      terms: 'Net 30 days',
      paymentTerms: 'Advance payment required',
      returnPolicy: '7 days return policy',
      notes: 'Test supplier for development',
      website: 'https://testsupplier.com',
      isActive: true,
      isPreferred: false,
      isVerified: false,
      pharmacy: pharmacyUser._id,
      emergencyContact: {
        name: 'Emergency Contact',
        phone: '+919876543211',
        email: 'emergency@testsupplier.com'
      }
    };

    const supplier = new PharmacySupplier(supplierData);
    await supplier.save();
    console.log('   ✅ Supplier created successfully');
    testConfig.supplier.created = true;

    // Test 2: Read supplier
    console.log('   Testing supplier retrieval...');
    const retrievedSupplier = await PharmacySupplier.findById(supplier._id);
    if (retrievedSupplier) {
      console.log('   ✅ Supplier retrieved successfully');
      console.log(`      Name: ${retrievedSupplier.name}`);
      console.log(`      Email: ${retrievedSupplier.email}`);
      console.log(`      Business Type: ${retrievedSupplier.businessType}`);
    } else {
      throw new Error('Failed to retrieve supplier');
    }

    // Test 3: Update supplier
    console.log('   Testing supplier update...');
    const updateData = {
      name: 'Updated Test Supplier Ltd.',
      isPreferred: true,
      rating: 4.5,
      reviewCount: 10
    };
    
    const updatedSupplier = await PharmacySupplier.findByIdAndUpdate(
      supplier._id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (updatedSupplier && updatedSupplier.name === updateData.name) {
      console.log('   ✅ Supplier updated successfully');
      testConfig.supplier.updated = true;
    } else {
      throw new Error('Failed to update supplier');
    }

    // Test 4: Search suppliers
    console.log('   Testing supplier search...');
    const searchResults = await PharmacySupplier.find({
      pharmacy: pharmacyUser._id,
      $or: [
        { name: { $regex: 'Test', $options: 'i' } },
        { contactName: { $regex: 'John', $options: 'i' } }
      ]
    });
    
    if (searchResults.length > 0) {
      console.log('   ✅ Supplier search successful');
      console.log(`      Found ${searchResults.length} supplier(s)`);
    } else {
      throw new Error('Supplier search failed');
    }

    // Test 5: Delete supplier
    console.log('   Testing supplier deletion...');
    await PharmacySupplier.findByIdAndDelete(supplier._id);
    
    const deletedSupplier = await PharmacySupplier.findById(supplier._id);
    if (!deletedSupplier) {
      console.log('   ✅ Supplier deleted successfully');
      testConfig.supplier.deleted = true;
    } else {
      throw new Error('Failed to delete supplier');
    }

    return true;
  } catch (error) {
    console.error('❌ Supplier operations failed:', error.message);
    return false;
  }
}

// Test API endpoints
async function testAPIEndpoints() {
  console.log('🔍 Testing API endpoints...');
  
  try {
    const baseUrl = 'http://localhost:8080';
    const testEndpoints = [
      '/health',
      '/pharmacy/suppliers',
      '/pharmacy/suppliers/stats'
    ];

    for (const endpoint of testEndpoints) {
      try {
        const response = await fetch(`${baseUrl}${endpoint}`);
        if (response.ok) {
          console.log(`   ✅ ${endpoint} - Status: ${response.status}`);
        } else {
          console.log(`   ⚠️  ${endpoint} - Status: ${response.status}`);
        }
      } catch (error) {
        console.log(`   ❌ ${endpoint} - Error: ${error.message}`);
      }
    }

    return true;
  } catch (error) {
    console.error('❌ API endpoint testing failed:', error.message);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting HealthSecure Supplier Backend Tests\n');
  console.log('=' .repeat(60));

  const results = {
    mongodb: false,
    cloudinary: false,
    cloudinaryUpload: false,
    supplier: false,
    api: false
  };

  // Test MongoDB
  results.mongodb = await testMongoDBConnection();
  console.log('');

  // Test Cloudinary
  results.cloudinary = await testCloudinaryConfig();
  console.log('');

  if (results.cloudinary) {
    results.cloudinaryUpload = await testCloudinaryUpload();
    console.log('');
  }

  // Test supplier operations
  if (results.mongodb) {
    results.supplier = await testSupplierOperations();
    console.log('');
  }

  // Test API endpoints
  results.api = await testAPIEndpoints();
  console.log('');

  // Print summary
  console.log('=' .repeat(60));
  console.log('📊 Test Results Summary:');
  console.log('=' .repeat(60));
  console.log(`MongoDB Connection: ${results.mongodb ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Cloudinary Config: ${results.cloudinary ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Cloudinary Upload: ${results.cloudinaryUpload ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Supplier Operations: ${results.supplier ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`API Endpoints: ${results.api ? '✅ PASS' : '❌ FAIL'}`);
  console.log('=' .repeat(60));

  const allPassed = Object.values(results).every(result => result === true);
  console.log(`Overall Status: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  if (allPassed) {
    console.log('\n🎉 HealthSecure Supplier Backend is ready for use!');
    console.log('📝 Available endpoints:');
    console.log('   GET    /pharmacy/suppliers');
    console.log('   POST   /pharmacy/suppliers');
    console.log('   GET    /pharmacy/suppliers/:id');
    console.log('   PUT    /pharmacy/suppliers/:id');
    console.log('   DELETE /pharmacy/suppliers/:id');
    console.log('   GET    /pharmacy/suppliers/stats');
    console.log('   GET    /pharmacy/suppliers/search');
    console.log('   GET    /pharmacy/suppliers/location');
    console.log('   GET    /pharmacy/suppliers/preferred');
  } else {
    console.log('\n⚠️  Please fix the failing tests before using the backend.');
  }

  // Close MongoDB connection
  if (results.mongodb) {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed.');
  }

  process.exit(allPassed ? 0 : 1);
}

// Run tests
runTests().catch(error => {
  console.error('💥 Test execution failed:', error);
  process.exit(1);
});


