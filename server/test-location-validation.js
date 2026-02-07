import mongoose from 'mongoose';
import User from './src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function testLocationValidation() {
  try {
    console.log('🔍 Testing location validation in User model...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Test 1: Create user with string address
    console.log('\n📝 Test 1: Creating user with string address...');
    const userWithStringAddress = new User({
      email: 'test1@example.com',
      password: 'password123',
      role: 'doctor',
      firstName: 'Dr. John',
      lastName: 'Doe',
      licenseNumber: 'DOC123',
      specialization: 'Cardiology',
      hospital: 'Test Hospital',
      location: {
        lat: 19.076,
        lng: 72.8777,
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        address: '123 Test Street, Mumbai, Maharashtra' // String address
      }
    });

    await userWithStringAddress.save();
    console.log('✅ User with string address created successfully');

    // Test 2: Create user with object address
    console.log('\n📝 Test 2: Creating user with object address...');
    const userWithObjectAddress = new User({
      email: 'test2@example.com',
      password: 'password123',
      role: 'doctor',
      firstName: 'Dr. Jane',
      lastName: 'Smith',
      licenseNumber: 'DOC456',
      specialization: 'Neurology',
      hospital: 'Test Hospital 2',
      location: {
        lat: 12.9716,
        lng: 77.5946,
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        address: { // Object address
          street: '154/11, Bannerghatta Road',
          area: 'Bannerghatta',
          city: 'Bangalore',
          state: 'Karnataka',
          country: 'India',
          pincode: '560001',
          landmark: 'Near Bannerghatta National Park'
        }
      }
    });

    await userWithObjectAddress.save();
    console.log('✅ User with object address created successfully');

    // Test 3: Create user with mixed address
    console.log('\n📝 Test 3: Creating user with mixed address...');
    const userWithMixedAddress = new User({
      email: 'test3@example.com',
      password: 'password123',
      role: 'doctor',
      firstName: 'Dr. Bob',
      lastName: 'Johnson',
      licenseNumber: 'DOC789',
      specialization: 'Orthopedics',
      hospital: 'Test Hospital 3',
      location: {
        lat: 28.7041,
        lng: 77.1025,
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        address: 'AIIMS, Ansari Nagar, Delhi' // String address
      }
    });

    await userWithMixedAddress.save();
    console.log('✅ User with mixed address created successfully');

    // Verify all users were created
    const totalUsers = await User.countDocuments({ email: { $regex: /^test\d@example\.com$/ } });
    console.log(`\n📊 Total test users created: ${totalUsers}`);

    // Clean up test data
    await User.deleteMany({ email: { $regex: /^test\d@example\.com$/ } });
    console.log('🧹 Test users cleaned up');

    console.log('\n✅ All location validation tests passed!');

  } catch (error) {
    console.error('❌ Location validation test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testLocationValidation();












