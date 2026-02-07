import mongoose from 'mongoose';
import User from './src/models/User.js';
import PendingUser from './src/models/PendingUser.js';

async function checkAllUsers() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthsecure');
    console.log('Connected to MongoDB');

    const email = 'test.bloodbank@example.com';

    // Check all collections
    console.log('\n🔍 Checking all collections for email:', email);

    // Check User collection
    const user = await User.findOne({ email });
    if (user) {
      console.log('✅ Found in User collection:', user);
    } else {
      console.log('❌ Not found in User collection');
    }

    // Check PendingUser collection
    const pendingUser = await PendingUser.findOne({ email });
    if (pendingUser) {
      console.log('✅ Found in PendingUser collection:', pendingUser);
    } else {
      console.log('❌ Not found in PendingUser collection');
    }

    // List all collections
    console.log('\n📋 All collections in database:');
    const collections = await mongoose.connection.db.listCollections().toArray();
    collections.forEach(collection => {
      console.log('  -', collection.name);
    });

    // Check if there are any users with similar emails
    console.log('\n🔍 Checking for similar emails...');
    const similarUsers = await User.find({ email: { $regex: 'test.bloodbank', $options: 'i' } });
    console.log('Similar users in User collection:', similarUsers.length);
    similarUsers.forEach(user => {
      console.log('  -', user.email, '- Role:', user.role);
    });

    const similarPendingUsers = await PendingUser.find({ email: { $regex: 'test.bloodbank', $options: 'i' } });
    console.log('Similar users in PendingUser collection:', similarPendingUsers.length);
    similarPendingUsers.forEach(user => {
      console.log('  -', user.email, '- Role:', user.role);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

checkAllUsers();
