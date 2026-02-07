import mongoose from 'mongoose';
import PatientCartItem from './src/models/PatientCartItem.js';
import dotenv from 'dotenv';

dotenv.config();

const clearOldCartItems = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find and delete cart items with string pharmacy values
    const result = await PatientCartItem.deleteMany({
      pharmacy: { $type: "string" }
    });

    console.log(`Deleted ${result.deletedCount} old cart items with string pharmacy values`);

  } catch (error) {
    console.error('Error clearing old cart items:', error);
  } finally {
    await mongoose.disconnect();
  }
};

clearOldCartItems();
