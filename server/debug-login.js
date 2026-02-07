import mongoose from 'mongoose';
import User from './src/models/User.js';
import bcrypt from 'bcryptjs';

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthsecure', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const debugLogin = async () => {
  try {
    console.log('🔍 Debugging login process...');
    
    const email = 'admin@healthsecure.com';
    const password = 'AdminPass123!';
    
    // Step 1: Find user by email
    console.log('\n1. Finding user by email:', email);
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    console.log('✅ User found:', user.email, user.role);
    
    // Step 2: Check if user is active
    console.log('\n2. Checking if user is active');
    console.log('isActive:', user.isActive);
    if (!user.isActive) {
      console.log('❌ User is not active');
      return;
    }
    console.log('✅ User is active');
    
    // Step 3: Check password
    console.log('\n3. Checking password');
    console.log('Password hash:', user.password.substring(0, 20) + '...');
    const isMatch = await user.comparePassword(password);
    console.log('Password match:', isMatch);
    if (!isMatch) {
      console.log('❌ Password does not match');
      return;
    }
    console.log('✅ Password matches');
    
    // Step 4: Check 2FA
    console.log('\n4. Checking 2FA');
    console.log('twoFactorEnabled:', user.twoFactorEnabled);
    if (user.twoFactorEnabled) {
      console.log('❌ 2FA is enabled, would require additional verification');
      return;
    }
    console.log('✅ 2FA is not enabled');
    
    console.log('\n🎉 All login checks passed!');
    
  } catch (error) {
    console.error('❌ Error during debug:', error);
  } finally {
    mongoose.connection.close();
  }
};

debugLogin(); 