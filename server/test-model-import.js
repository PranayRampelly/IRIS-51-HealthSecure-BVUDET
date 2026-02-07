import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function testModelImport() {
  try {
    console.log('🧪 Testing BookedTimeSlot model import...');
    
    // Test 1: Try to import the model
    const BookedTimeSlot = await import('./src/models/BookedTimeSlot.js');
    console.log('✅ BookedTimeSlot model imported successfully');
    console.log('📋 Model:', BookedTimeSlot.default);
    
    // Test 2: Check if it's a mongoose model
    if (BookedTimeSlot.default && BookedTimeSlot.default.modelName) {
      console.log('✅ Model name:', BookedTimeSlot.default.modelName);
    } else {
      console.log('❌ Not a valid mongoose model');
    }
    
    // Test 3: Check schema
    if (BookedTimeSlot.default && BookedTimeSlot.default.schema) {
      console.log('✅ Schema exists');
      console.log('📋 Schema fields:', Object.keys(BookedTimeSlot.default.schema.paths));
    } else {
      console.log('❌ No schema found');
    }
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
  }
}

testModelImport();



