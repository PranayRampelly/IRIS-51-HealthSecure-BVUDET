import mongoose from 'mongoose';
import User from './src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function fixLocationData() {
  try {
    console.log('🔧 Fixing existing location data in User model...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find users with malformed location.address (object instead of string)
    const usersWithObjectAddress = await User.find({
      'location.address': { $type: 'object' }
    });

    console.log(`📊 Found ${usersWithObjectAddress.length} users with object addresses`);

    if (usersWithObjectAddress.length === 0) {
      console.log('✅ No users with malformed location data found');
      return;
    }

    // Fix each user's location data
    let fixedCount = 0;
    for (const user of usersWithObjectAddress) {
      try {
        const location = user.location;
        
        if (location && location.address && typeof location.address === 'object') {
          // Convert object address to string
          const addressObj = location.address;
          const addressString = [
            addressObj.street,
            addressObj.area,
            addressObj.city,
            addressObj.state,
            addressObj.country,
            addressObj.pincode
          ].filter(Boolean).join(', ');

          // Update the user's location data
          await User.updateOne(
            { _id: user._id },
            {
              $set: {
                'location.address': addressString,
                // Also ensure other location fields are properly set
                'location.city': location.city || addressObj.city || '',
                'location.state': location.state || addressObj.state || '',
                'location.pincode': location.pincode || addressObj.pincode || '000000',
                'location.lat': location.lat || addressObj.coordinates?.lat || 0,
                'location.lng': location.lng || addressObj.coordinates?.lng || 0
              }
            }
          );

          console.log(`✅ Fixed location data for user: ${user.email || user.firstName} ${user.lastName}`);
          fixedCount++;
        }
      } catch (error) {
        console.error(`❌ Error fixing user ${user._id}:`, error.message);
      }
    }

    console.log(`\n📊 Location data fix completed!`);
    console.log(`✅ Fixed ${fixedCount} out of ${usersWithObjectAddress.length} users`);

    // Verify the fix
    const remainingUsersWithObjectAddress = await User.find({
      'location.address': { $type: 'object' }
    });

    if (remainingUsersWithObjectAddress.length === 0) {
      console.log('✅ All location data has been successfully fixed!');
    } else {
      console.log(`⚠️  ${remainingUsersWithObjectAddress.length} users still have object addresses`);
    }

  } catch (error) {
    console.error('❌ Error fixing location data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

fixLocationData();












