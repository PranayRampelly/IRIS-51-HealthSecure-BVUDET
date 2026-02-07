import mongoose from 'mongoose';
import User from './src/models/User.js';
import { generateToken } from './src/utils/jwt.js';

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthsecure', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const testMinimalLogin = async () => {
  try {
    console.log('🔐 Testing minimal login logic...');
    
    const email = 'admin@healthsecure.com';
    const password = 'AdminPass123!';
    
    // Step 1: Find user
    console.log('1. Finding user...');
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    console.log('✅ User found');
    
    // Step 2: Check password
    console.log('2. Checking password...');
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('❌ Password mismatch');
      return;
    }
    console.log('✅ Password matches');
    
    // Step 3: Generate token
    console.log('3. Generating token...');
    const token = generateToken(user._id, user.role);
    console.log('✅ Token generated:', token.substring(0, 20) + '...');
    
    // Step 4: Test token verification
    console.log('4. Testing token verification...');
    const { verifyToken } = await import('./src/utils/jwt.js');
    const decoded = verifyToken(token);
    console.log('✅ Token verified:', decoded);
    
    console.log('\n🎉 All login steps successful!');
    console.log('The issue must be in the API endpoint or middleware');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
};

testMinimalLogin(); 