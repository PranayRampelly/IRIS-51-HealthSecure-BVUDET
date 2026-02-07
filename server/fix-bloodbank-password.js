import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './src/models/User.js';

async function fixBloodBankPassword() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthsecure');
    console.log('Connected to MongoDB');

    const email = 'test.bloodbank@example.com';
    const newPassword = 'TestPass123!';

    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('✅ User found:', user.email);

    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    console.log('🔐 New hashed password:', hashedPassword.substring(0, 20) + '...');

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    console.log('✅ Password updated successfully!');

    // Test the new password
    console.log('\n🧪 Testing new password...');
    const isPasswordValid = await bcrypt.compare(newPassword, user.password);
    console.log('Password valid:', isPasswordValid);

    if (isPasswordValid) {
      console.log('✅ Password is working correctly!');
    } else {
      console.log('❌ Password still not working');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

fixBloodBankPassword();
