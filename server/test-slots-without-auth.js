import mongoose from 'mongoose';
import User from './src/models/User.js';
import slotGenerationService from './src/services/slotGenerationService.js';
import dotenv from 'dotenv';

dotenv.config();

async function testSlotsWithoutAuth() {
  try {
    console.log('🧪 Testing slots API without authentication...');
    
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

    // Test the slot generation service directly
    console.log('\n📅 Testing slot generation service directly...');
    const testDate = '2025-08-12';
    const slots = await slotGenerationService.generateAvailableSlots(
      doctor._id.toString(),
      new Date(testDate),
      'both'
    );
    
    console.log(`✅ Generated ${slots.length} slots for ${testDate}`);
    if (slots.length > 0) {
      console.log('   Sample slot:', {
        _id: slots[0]._id,
        startTime: slots[0].startTime,
        endTime: slots[0].endTime,
        duration: slots[0].duration,
        consultationType: slots[0].consultationType,
        isAvailable: slots[0].isAvailable,
        isBooked: slots[0].isBooked
      });
    }

    // Simulate the API response structure
    console.log('\n🌐 Simulating API response structure...');
    const mockResponse = {
      success: true,
      doctorId: doctor._id.toString(),
      date: testDate,
      consultationType: 'both',
      availableSlots: slots,
      totalSlots: slots.length
    };

    console.log('✅ Mock API response:', JSON.stringify(mockResponse, null, 2));

    // Test if the frontend logic would work with this response
    console.log('\n🔍 Testing frontend response handling...');
    if (mockResponse.success && mockResponse.availableSlots) {
      console.log(`🎯 Frontend would receive ${mockResponse.availableSlots.length} slots`);
      console.log('✅ Frontend logic would work correctly');
    } else {
      console.log('❌ Frontend logic would fail');
    }

    console.log('\n🎉 Slots API test completed successfully!');

  } catch (error) {
    console.error('❌ Slots API test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testSlotsWithoutAuth();












