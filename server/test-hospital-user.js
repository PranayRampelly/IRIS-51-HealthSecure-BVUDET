import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

async function testHospitalUser() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find hospital users
    const hospitalUsers = await User.find({ role: 'hospital' });
    console.log(`\n📊 Found ${hospitalUsers.length} hospital users:`);

    hospitalUsers.forEach((user, index) => {
      console.log(`\n🏥 Hospital ${index + 1}:`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Hospital Name: ${user.hospitalName || 'Not set'}`);
      console.log(`   Profile Completed: ${user.profileCompleted || false}`);
      console.log(`   Profile Completed At: ${user.profileCompletedAt || 'Not set'}`);
      console.log(`   Email Verified: ${user.isEmailVerified || false}`);
      console.log(`   Registration Number: ${user.registrationNumber || 'Not set'}`);
      console.log(`   License Number: ${user.licenseNumber || 'Not set'}`);
      console.log(`   Hospital Type: ${user.hospitalType || 'Not set'}`);
      console.log(`   Total Beds: ${user.totalBeds || 'Not set'}`);
      console.log(`   Departments: ${user.departments || 'Not set'}`);
      console.log(`   Staff Count: ${user.staffCount || 'Not set'}`);
      console.log(`   Phone: ${user.phone || 'Not set'}`);
      console.log(`   Address: ${user.address ? JSON.stringify(user.address) : 'Not set'}`);
      console.log(`   Emergency Contact: ${user.emergencyContact || 'Not set'}`);
      console.log(`   Profile Complete (method): ${user.isProfileComplete()}`);
      console.log(`   Hospital Profile Complete (method): ${user.isHospitalProfileComplete()}`);
    });

    // Check specific user
    const specificUser = await User.findOne({ email: 'siddheshharwande8@gmail.com' });
    if (specificUser) {
      console.log(`\n🎯 Specific User Details:`);
      console.log(`   Email: ${specificUser.email}`);
      console.log(`   Role: ${specificUser.role}`);
      console.log(`   Profile Completed: ${specificUser.profileCompleted || false}`);
      console.log(`   Email Verified: ${specificUser.isEmailVerified || false}`);
      console.log(`   Hospital Name: ${specificUser.hospitalName || 'Not set'}`);
      console.log(`   License Number: ${specificUser.licenseNumber || 'Not set'}`);
      console.log(`   Password Hash: ${specificUser.password ? 'Set' : 'Not set'}`);
    } else {
      console.log('\n❌ User with email siddheshharwande8@gmail.com not found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testHospitalUser(); 