import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const createPharmacyUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if pharmacy user already exists
    const existingPharmacy = await User.findOne({ email: 'pharmacy@healthsecure.com' });
    if (existingPharmacy) {
      console.log('Pharmacy user already exists:', existingPharmacy._id);
      return existingPharmacy._id;
    }

    // Create pharmacy user
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('pharmacy123', salt);

    const pharmacyUser = new User({
      email: 'pharmacy@healthsecure.com',
      password: hashedPassword,
      role: 'pharmacy',
      firstName: 'HealthSecure',
      lastName: 'Pharmacy',
      phone: '+91-9876543210',
      pharmacyName: 'HealthSecure Pharmacy',
      pharmacyLicense: 'PHAR123456',
      pharmacyType: 'Retail Pharmacy',
      address: {
        street: '123 Health Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        country: 'India'
      },
      isEmailVerified: true,
      isActive: true,
      profileComplete: true
    });

    await pharmacyUser.save();
    console.log('Pharmacy user created:', pharmacyUser._id);
    return pharmacyUser._id;

  } catch (error) {
    console.error('Error creating pharmacy user:', error);
  } finally {
    await mongoose.disconnect();
  }
};

createPharmacyUser();
