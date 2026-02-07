import mongoose from 'mongoose';
import User from './src/models/User.js';
import slotGenerationService from './src/services/slotGenerationService.js';
import dotenv from 'dotenv';

dotenv.config();

async function testSlotsAPI() {
  try {
    console.log('🧪 Testing slots API endpoints...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find a doctor to test with
    const doctor = await User.findOne({ role: 'doctor' });
    if (!doctor) {
      console.log('❌ No doctors found in database');
      return;
    }

    console.log(`👨‍⚕️ Testing with doctor: ${doctor.firstName} ${doctor.lastName}`);
    console.log(`   ID: ${doctor._id}`);

    // Test 1: Generate slots for today
    console.log('\n📅 Test 1: Generating slots for today...');
    const today = new Date();
    const todaySlots = await slotGenerationService.generateAvailableSlots(
      doctor._id, 
      today, 
      'both'
    );
    
    console.log(`✅ Generated ${todaySlots.length} slots for today`);
    if (todaySlots.length > 0) {
      console.log('   Sample slot:', {
        startTime: todaySlots[0].startTime,
        endTime: todaySlots[0].endTime,
        duration: todaySlots[0].duration,
        consultationType: todaySlots[0].consultationType
      });
    }

    // Test 2: Generate slots for tomorrow
    console.log('\n📅 Test 2: Generating slots for tomorrow...');
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const tomorrowSlots = await slotGenerationService.generateAvailableSlots(
      doctor._id, 
      tomorrow, 
      'both'
    );
    
    console.log(`✅ Generated ${tomorrowSlots.length} slots for tomorrow`);

    // Test 3: Test the actual API endpoint logic
    console.log('\n🌐 Test 3: Testing API endpoint logic...');
    
    // Simulate the API endpoint logic
    const testDate = '2025-08-13';
    const testDoctorId = doctor._id.toString();
    
    console.log(`   Testing date: ${testDate}`);
    console.log(`   Testing doctor: ${testDoctorId}`);
    
    try {
      const slots = await slotGenerationService.generateAvailableSlots(
        testDoctorId,
        new Date(testDate),
        'both'
      );
      
      console.log(`✅ API endpoint would return ${slots.length} slots`);
      if (slots.length > 0) {
        console.log('   First slot:', {
          startTime: slots[0].startTime,
          endTime: slots[0].endTime,
          consultationType: slots[0].consultationType
        });
      }
    } catch (error) {
      console.error('❌ API endpoint test failed:', error.message);
    }

    console.log('\n🎉 Slots API testing completed!');
    console.log('\n📋 Summary:');
    console.log(`   - Today's slots: ${todaySlots.length}`);
    console.log(`   - Tomorrow's slots: ${tomorrowSlots.length}`);
    console.log(`   - API endpoint test: ${slots ? 'Passed' : 'Failed'}`);

  } catch (error) {
    console.error('❌ Slots API test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testSlotsAPI();












