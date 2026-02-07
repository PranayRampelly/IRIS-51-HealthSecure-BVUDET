import mongoose from 'mongoose';
import User from './src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const testPharmacyLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the pharmacy user
    const pharmacyUser = await User.findOne({ 
      email: 'pharmacy@healthsecure.com',
      role: 'pharmacy'
    });

    if (pharmacyUser) {
      console.log('Pharmacy user found:');
      console.log('- ID:', pharmacyUser._id);
      console.log('- Email:', pharmacyUser.email);
      console.log('- Name:', pharmacyUser.pharmacyName);
      console.log('- Role:', pharmacyUser.role);
      console.log('- Active:', pharmacyUser.isActive);
    } else {
      console.log('Pharmacy user not found!');
    }

  } catch (error) {
    console.error('Error testing pharmacy login:', error);
  } finally {
    await mongoose.disconnect();
  }
};

testPharmacyLogin();
