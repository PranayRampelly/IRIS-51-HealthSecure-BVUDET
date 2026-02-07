import mongoose from 'mongoose';
import PatientOrder from './src/models/PatientOrder.js';
import User from './src/models/User.js';
import PharmacyInventoryItem from './src/models/PharmacyInventoryItem.js';
import dotenv from 'dotenv';

dotenv.config();

const testPharmacyOrders = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const pharmacyId = '68a7441bd3e6a75f76e88955';
    
    // Test the query that the API uses
    const orders = await PatientOrder.find({
      'items.pharmacy': pharmacyId
    })
    .populate('patientId', 'firstName lastName email phone')
    .populate('items.medicineId', 'name generic dosage form manufacturer cloudinaryUrl')
    .sort({ placedAt: -1 });

    console.log(`Found ${orders.length} orders for pharmacy ${pharmacyId}:`);
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
    console.error('Error testing pharmacy orders:', error);
  } finally {
    await mongoose.disconnect();
  }
};

testPharmacyOrders();
