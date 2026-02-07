import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const fixPharmacyPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the pharmacy user
    const pharmacyUser = await User.findOne({ 
      email: 'pharmacy@healthsecure.com',
      role: 'pharmacy'
    });

    if (!pharmacyUser) {
      console.log('Pharmacy user not found');
      return;
    }

    console.log('Found pharmacy user:', pharmacyUser.email);
    console.log('Current password hash:', pharmacyUser.password);

    // Hash the password manually with the same salt rounds as the pre-save hook
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash('pharmacy123', saltRounds);
    
    console.log('New password hash:', hashedPassword);

    // Update the password using findOneAndUpdate to bypass pre-save hook
    const updatedUser = await User.findOneAndUpdate(
      { email: 'pharmacy@healthsecure.com', role: 'pharmacy' },
      { password: hashedPassword },
      { new: true }
    );

    console.log('Password updated successfully');
    console.log('Updated password hash:', updatedUser.password);

    // Test the password
    const isMatch = await bcrypt.compare('pharmacy123', updatedUser.password);
    console.log('Password verification test:', isMatch ? 'PASSED' : 'FAILED');

    if (isMatch) {
      console.log('✅ Pharmacy login should now work with:');
      console.log('   Email: pharmacy@healthsecure.com');
      console.log('   Password: pharmacy123');
    }

  } catch (error) {
    console.error('Error fixing pharmacy password:', error);
  } finally {
    await mongoose.disconnect();
  }
};

fixPharmacyPassword();
