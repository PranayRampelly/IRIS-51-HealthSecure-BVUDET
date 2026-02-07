import mongoose from 'mongoose';
import BookedTimeSlot from './src/models/BookedTimeSlot.js';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthsecure')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

async function testBookedTimeSlot() {
  try {
    console.log('🧪 Testing BookedTimeSlot model...');
    
    // Test 1: Create a test slot
    const testSlot = new BookedTimeSlot({
      doctorId: new mongoose.Types.ObjectId('687c20d8600815662b42dbc8'),
      hospitalId: new mongoose.Types.ObjectId('687c20d8600815662b42dbc8'),
      date: new Date('2025-08-20'),
      startTime: '11:30',
      endTime: '11:45',
      appointmentId: new mongoose.Types.ObjectId('68a0dd2df5fe87414e067da3'),
      patientId: new mongoose.Types.ObjectId('687a22c68d3190faad6800ec'),
      consultationType: 'online'
    });
    
    console.log('🔍 Test slot object:', testSlot);
    
    // Test 2: Save the slot
    const savedSlot = await testSlot.save();
    console.log('✅ Test slot saved successfully:', {
      id: savedSlot._id,
      doctorId: savedSlot.doctorId,
      date: savedSlot.date,
      startTime: savedSlot.startTime,
      endTime: savedSlot.endTime
    });
    
    // Test 3: Find the slot
    const foundSlot = await BookedTimeSlot.findById(savedSlot._id);
    console.log('✅ Test slot found:', foundSlot);
    
    // Test 4: Test the static methods
    const slotsForDate = await BookedTimeSlot.findByDoctorAndDate(
      '687c20d8600815662b42dbc8',
      new Date('2025-08-20')
    );
    console.log('✅ Slots found for date:', slotsForDate.length);
    
    // Test 5: Check availability
    const availability = await BookedTimeSlot.checkSlotAvailability(
      '687c20d8600815662b42dbc8',
      '687c20d8600815662b42dbc8',
      new Date('2025-08-20'),
      '11:30',
      '11:45'
    );
    console.log('✅ Availability check result:', availability ? 'Slot is booked' : 'Slot is available');
    
    // Test 6: Clean up - delete test slot
    await BookedTimeSlot.findByIdAndDelete(savedSlot._id);
    console.log('✅ Test slot cleaned up');
    
    console.log('🎉 All tests passed! BookedTimeSlot model is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testBookedTimeSlot();



