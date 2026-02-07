import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './src/models/User.js';

async function testPasswordLogin() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthsecure');
    console.log('Connected to MongoDB');

    const email = 'test.bloodbank@example.com';
    const password = 'TestPass123!';

    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('✅ User found:');
    console.log('  - Email:', user.email);
    console.log('  - Role:', user.role);
    console.log('  - Is Active:', user.isActive);
    console.log('  - Is Email Verified:', user.isEmailVerified);
    console.log('  - Hashed Password:', user.password.substring(0, 20) + '...');

    // Test password comparison using User model method
    console.log('\n🔐 Testing password comparison using User model method...');
    const isPasswordValid = await user.comparePassword(password);
    console.log('Password valid (User method):', isPasswordValid);

    // Test direct bcrypt comparison
    console.log('\n🔐 Testing direct bcrypt comparison...');
    const isPasswordValidDirect = await bcrypt.compare(password, user.password);
    console.log('Password valid (Direct bcrypt):', isPasswordValidDirect);

    // Test role check
    console.log('\n👤 Testing role check...');
    const requestedRole = 'bloodbank';
    const roleMatch = user.role === requestedRole;
    console.log('Role match:', roleMatch);

    // Test all conditions for login
    console.log('\n✅ Testing all login conditions...');
    const conditions = {
      userExists: !!user,
      passwordValid: isPasswordValid,
      roleMatch: roleMatch,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified
    };

    console.log('Login conditions:', conditions);

    const canLogin = Object.values(conditions).every(condition => condition);
    console.log('Can login:', canLogin);

    if (!canLogin) {
      console.log('\n❌ Login failed because:');
      Object.entries(conditions).forEach(([condition, value]) => {
        if (!value) {
          console.log(`  - ${condition}: ${value}`);
        }
      });
    } else {
      console.log('\n✅ All login conditions met!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

testPasswordLogin();
