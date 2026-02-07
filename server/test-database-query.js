import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testDatabaseQuery() {
  console.log('🧪 Testing direct database query for doctors...\n');

  try {
    // Connect to database
    console.log('🔌 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database connected successfully\n');

    // Import User model
    const { default: User } = await import('./src/models/User.js');
    
    // Test 1: Count all doctors
    console.log('1️⃣ Counting all doctors in database...');
    const doctorCount = await User.countDocuments({ role: 'doctor' });
    console.log(`📊 Total doctors found: ${doctorCount}\n`);

    if (doctorCount === 0) {
      console.log('⚠️ No doctors found in database. This might be the issue!');
      return;
    }

    // Test 2: Get all doctors with basic info
    console.log('2️⃣ Fetching all doctors with basic info...');
    const doctors = await User.find({ role: 'doctor' })
      .select('firstName lastName specialization hospital experience yearsOfExperience')
      .lean();
    
    console.log('🏥 Doctors found:');
    doctors.forEach((doctor, index) => {
      console.log(`   ${index + 1}. Dr. ${doctor.firstName} ${doctor.lastName}`);
      console.log(`      Specialization: ${doctor.specialization}`);
      console.log(`      Hospital: ${doctor.hospital}`);
      console.log(`      Experience: ${doctor.experience || doctor.yearsOfExperience || 0} years`);
      console.log('');
    });

    // Test 3: Get one doctor with all fields
    console.log('3️⃣ Fetching one doctor with all fields...');
    const fullDoctor = await User.findOne({ role: 'doctor' })
      .select('-password -emailVerificationToken -emailVerificationExpires -twoFactorSecret -backupCodes -mfaSecret')
      .lean();
    
    if (fullDoctor) {
      console.log('📋 Full doctor data structure:');
      console.log(JSON.stringify(fullDoctor, null, 2));
    }

    console.log('\n🎯 Database query test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database query test failed:', error.message);
    console.error('🔍 Error details:', error);
  } finally {
    // Close database connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the test
testDatabaseQuery();
