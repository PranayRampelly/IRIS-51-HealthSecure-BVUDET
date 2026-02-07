import mongoose from 'mongoose';
import PatientOrder from './src/models/PatientOrder.js';
import User from './src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const testActualPharmacy = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const actualPharmacyId = '68a4d15916dc56e7532f42c3'; // From JWT token (corrected)
    
    // Check if this user exists and is a pharmacy
    const pharmacyUser = await User.findById(actualPharmacyId);
    if (pharmacyUser) {
      console.log('Actual pharmacy user found:');
      console.log('- ID:', pharmacyUser._id);
      console.log('- Email:', pharmacyUser.email);
      console.log('- Name:', pharmacyUser.pharmacyName);
      console.log('- Role:', pharmacyUser.role);
    } else {
      console.log('Actual pharmacy user NOT found');
    }
    
    // Test the query for orders
    const orders = await PatientOrder.find({
      'items.pharmacy': actualPharmacyId
    })
    .populate('patientId', 'firstName lastName email phone')
    .sort({ placedAt: -1 });

    console.log(`\nFound ${orders.length} orders for pharmacy ${actualPharmacyId}:`);
    orders.forEach((order, index) => {
      console.log(`\nOrder ${index + 1}:`);
      console.log(`- Order ID: ${order._id}`);
      console.log(`- Order Number: ${order.orderNumber}`);
      console.log(`- Patient: ${order.patientId?.firstName} ${order.patientId?.lastName}`);
      console.log(`- Status: ${order.status}`);
      console.log(`- Items: ${order.items.length}`);
      order.items.forEach((item, itemIndex) => {
        console.log(`  Item ${itemIndex + 1}: ${item.medicineName} (Pharmacy: ${item.pharmacy})`);
      });
    });

  } catch (error) {
    console.error('Error testing actual pharmacy:', error);
  } finally {
    await mongoose.disconnect();
  }
};

testActualPharmacy();
