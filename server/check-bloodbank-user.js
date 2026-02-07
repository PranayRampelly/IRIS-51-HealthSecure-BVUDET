import mongoose from 'mongoose';
import User from './src/models/User.js';
import PendingUser from './src/models/PendingUser.js';

async function checkBloodBankUser() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthsecure');
    console.log('Connected to MongoDB');

    const email = 'test.bloodbank@example.com';

    // Check in PendingUser collection
    console.log('\n🔍 Checking PendingUser collection...');
    const pendingUser = await PendingUser.findOne({ email });
    if (pendingUser) {
      console.log('✅ Found in PendingUser collection:');
      console.log('  - Email:', pendingUser.email);
      console.log('  - Role:', pendingUser.role);
      console.log('  - Verification Token:', pendingUser.verificationToken ? 'Present' : 'Missing');
      console.log('  - Verification Expires:', pendingUser.verificationExpires);
      console.log('  - Created At:', pendingUser.createdAt);
    } else {
      console.log('❌ Not found in PendingUser collection');
    }

    // Check in User collection
    console.log('\n🔍 Checking User collection...');
    const user = await User.findOne({ email });
    if (user) {
      console.log('✅ Found in User collection:');
      console.log('  - Email:', user.email);
      console.log('  - Role:', user.role);
      console.log('  - Is Active:', user.isActive);
      console.log('  - Is Email Verified:', user.isEmailVerified);
      console.log('  - Profile Complete:', user.profileComplete);
      console.log('  - Created At:', user.createdAt);
    } else {
      console.log('❌ Not found in User collection');
    }

    // Check all bloodbank users
    console.log('\n🔍 Checking all bloodbank users...');
    const allBloodBankUsers = await User.find({ role: 'bloodbank' });
    console.log(`Found ${allBloodBankUsers.length} bloodbank users in User collection:`);
    allBloodBankUsers.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.email} - Verified: ${user.isEmailVerified} - Active: ${user.isActive}`);
    });

    const allPendingBloodBankUsers = await PendingUser.find({ role: 'bloodbank' });
    console.log(`Found ${allPendingBloodBankUsers.length} bloodbank users in PendingUser collection:`);
    allPendingBloodBankUsers.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.email} - Created: ${user.createdAt}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

checkBloodBankUser();
