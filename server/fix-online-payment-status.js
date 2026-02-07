import mongoose from 'mongoose';
import dotenv from 'dotenv';
import PatientOrder from './src/models/PatientOrder.js';

dotenv.config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const result = await PatientOrder.updateMany(
      { 'paymentDetails.method': 'online', 'paymentDetails.status': { $ne: 'completed' } },
      { $set: { 'paymentDetails.status': 'completed' } }
    );

    console.log(`Updated ${result.modifiedCount || 0} orders to completed for online payments.`);
  } catch (e) {
    console.error('Error fixing online payment status:', e);
  } finally {
    await mongoose.disconnect();
  }
})();
