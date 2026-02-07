import mongoose from 'mongoose';
import User from './src/models/User.js';
import slotGenerationService from './src/services/slotGenerationService.js';
import dotenv from 'dotenv';

dotenv.config();

async function testRealTimeSlots() {
  try {
    console.log('🧪 Testing real-time slot generation system...');
    
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
    console.log(`   Specialization: ${doctor.specialization}`);

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
    if (tomorrowSlots.length > 0) {
      console.log('   Sample slot:', {
        startTime: tomorrowSlots[0].startTime,
        endTime: tomorrowSlots[0].endTime,
        duration: tomorrowSlots[0].duration,
        consultationType: tomorrowSlots[0].startTime
      });
    }

    // Test 3: Generate weekly slots
    console.log('\n📅 Test 3: Generating weekly slots...');
    const weeklySlots = await slotGenerationService.generateWeeklySlots(
      doctor._id, 
      today, 
      7
    );
    
    console.log(`✅ Generated weekly slots for ${Object.keys(weeklySlots).length} days`);
    
    // Show summary for each day
    Object.entries(weeklySlots).forEach(([date, data]) => {
      console.log(`   ${date}: ${data.availableSlots} available slots out of ${data.totalSlots} total`);
    });

    // Test 4: Check slot availability
    if (todaySlots.length > 0) {
      console.log('\n🔍 Test 4: Checking slot availability...');
      const sampleSlot = todaySlots[0];
      
      const isAvailable = await slotGenerationService.checkSlotAvailability(
        doctor._id,
        sampleSlot._id,
        sampleSlot.startTime,
        sampleSlot.endTime
      );
      
      console.log(`✅ Slot availability check: ${isAvailable ? 'Available' : 'Not Available'}`);
    }

    // Test 5: Test different consultation types
    console.log('\n🔍 Test 5: Testing different consultation types...');
    
    const onlineSlots = await slotGenerationService.generateAvailableSlots(
      doctor._id, 
      today, 
      'online'
    );
    
    const inPersonSlots = await slotGenerationService.generateAvailableSlots(
      doctor._id, 
      today, 
      'in-person'
    );
    
    console.log(`✅ Online slots: ${onlineSlots.length}`);
    console.log(`✅ In-person slots: ${inPersonSlots.length}`);

    console.log('\n🎉 All real-time slot tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - Today's slots: ${todaySlots.length}`);
    console.log(`   - Tomorrow's slots: ${tomorrowSlots.length}`);
    console.log(`   - Weekly slots generated: ${Object.keys(weeklySlots).length} days`);
    console.log(`   - Online consultation support: ${onlineSlots.length > 0 ? 'Yes' : 'No'}`);
    console.log(`   - In-person consultation support: ${inPersonSlots.length > 0 ? 'Yes' : 'No'}`);

  } catch (error) {
    console.error('❌ Real-time slot test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testRealTimeSlots();












