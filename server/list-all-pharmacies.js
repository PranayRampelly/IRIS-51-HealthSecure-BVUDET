import mongoose from 'mongoose';
import User from './src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const listAllPharmacies = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all pharmacy users
    const pharmacyUsers = await User.find({ role: 'pharmacy' });
    
    console.log(`Found ${pharmacyUsers.length} pharmacy users:`);
    pharmacyUsers.forEach((user, index) => {
      console.log(`\nPharmacy ${index + 1}:`);
      console.log('- ID:', user._id);
      console.log('- ID Length:', user._id.toString().length);
      console.log('- Email:', user.email);
      console.log('- Name:', user.pharmacyName || 'No name');
      console.log('- Active:', user.isActive);
      console.log('- Created:', user.createdAt);
    });

  } catch (error) {
    console.error('Error listing pharmacies:', error);
  } finally {
    await mongoose.disconnect();
  }
};

listAllPharmacies();
