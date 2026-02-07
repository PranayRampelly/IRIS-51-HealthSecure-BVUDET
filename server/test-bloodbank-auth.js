import mongoose from 'mongoose';
import User from './src/models/User.js';
import PendingUser from './src/models/PendingUser.js';

async function testBloodBankAuth() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthsecure');
    console.log('Connected to MongoDB');

    // Test 1: Check if bloodbank role is in User model enum
    const userSchema = User.schema;
    const roleField = userSchema.path('role');
    console.log('Available roles in User model:', roleField.enumValues);
    
    if (roleField.enumValues.includes('bloodbank')) {
      console.log('✅ Bloodbank role is available in User model');
    } else {
      console.log('❌ Bloodbank role is NOT available in User model');
    }

    // Test 2: Check if bloodbank-specific fields exist
    const bloodBankFields = [
      'bloodBankName',
      'bloodBankType', 
      'bloodBankLicense',
      'bloodBankRegistration',
      'bloodBankCapacity',
      'bloodBankStaff',
      'bloodBankOperatingHours',
      'bloodBankTestingCapabilities',
      'bloodBankEmergencyServices',
      'bloodBankTechnology'
    ];

    console.log('\nChecking bloodbank-specific fields:');
    bloodBankFields.forEach(field => {
      if (userSchema.path(field)) {
        console.log(`✅ ${field} field exists`);
      } else {
        console.log(`❌ ${field} field is missing`);
      }
    });

    // Test 3: Check if bloodbank profile completion method exists
    const user = new User();
    if (typeof user.isBloodBankProfileComplete === 'function') {
      console.log('\n✅ isBloodBankProfileComplete method exists');
    } else {
      console.log('\n❌ isBloodBankProfileComplete method is missing');
    }

    // Test 4: Check if bloodbank is included in isProfileComplete method
    const testUser = new User({
      email: 'test@bloodbank.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'BloodBank',
      role: 'bloodbank'
    });

    console.log('\nTesting profile completion methods:');
    console.log('isProfileComplete for bloodbank:', testUser.isProfileComplete());
    console.log('isBloodBankProfileComplete:', testUser.isBloodBankProfileComplete());

    // Test 5: Check PendingUser model
    const pendingUserSchema = PendingUser.schema;
    const pendingRoleField = pendingUserSchema.path('role');
    console.log('\nAvailable roles in PendingUser model:', pendingRoleField.enumValues);
    
    if (pendingRoleField.enumValues.includes('bloodbank')) {
      console.log('✅ Bloodbank role is available in PendingUser model');
    } else {
      console.log('❌ Bloodbank role is NOT available in PendingUser model');
    }

    // Test 6: Check bloodbank fields in PendingUser
    const pendingBloodBankFields = ['bloodBankName', 'bloodBankType', 'bloodBankLicense'];
    console.log('\nChecking bloodbank fields in PendingUser:');
    pendingBloodBankFields.forEach(field => {
      if (pendingUserSchema.path(field)) {
        console.log(`✅ ${field} field exists in PendingUser`);
      } else {
        console.log(`❌ ${field} field is missing in PendingUser`);
      }
    });

    console.log('\n🎉 Bloodbank authentication tests completed!');

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testBloodBankAuth();
