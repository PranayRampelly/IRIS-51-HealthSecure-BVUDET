// Script to remove the fees field from all doctor documents
import mongoose from 'mongoose';
import User from './src/models/User.js';

// Connect to MongoDB
await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthsecure');

console.log('🧹 Removing Fees Field from Doctor Documents');
console.log('=' .repeat(50));

try {
  // Find all doctors
  const doctors = await User.find({ role: 'doctor' });
  
  console.log(`\n📊 Found ${doctors.length} doctors in database:\n`);
  
  let updatedCount = 0;
  
  for (const doctor of doctors) {
    console.log(`\n👨‍⚕️ Doctor: ${doctor.firstName} ${doctor.lastName}`);
    console.log(`   Current consultationFees:`, {
      online: doctor.consultationFees?.online || 'Not set',
      inPerson: doctor.consultationFees?.inPerson || 'Not set'
    });
    
    if (doctor.fees) {
      console.log(`   ❌ Found fees field:`, doctor.fees);
      
      // Remove the fees field
      await User.findByIdAndUpdate(doctor._id, {
        $unset: { fees: 1 }
      });
      
      console.log(`   ✅ Removed fees field`);
      updatedCount++;
    } else {
      console.log(`   ✅ No fees field found`);
    }
  }
  
  console.log(`\n📝 Summary:`);
  console.log(`   Total doctors: ${doctors.length}`);
  console.log(`   Updated: ${updatedCount}`);
  console.log(`   No changes needed: ${doctors.length - updatedCount}`);
  
  if (updatedCount > 0) {
    console.log(`\n🎯 Expected Results:`);
    console.log(`   - fees field removed from all doctor documents`);
    console.log(`   - Only consultationFees field will be used`);
    console.log(`   - System will be cleaner and more consistent`);
  }
  
} catch (error) {
  console.error('❌ Error removing fees field:', error);
} finally {
  await mongoose.disconnect();
  console.log('\n✅ Database connection closed');
}

