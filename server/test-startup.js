import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function testStartup() {
  try {
    console.log('🧪 Testing server startup...');
    
    // Test 1: Basic express app
    const app = express();
    console.log('✅ Express app created');
    
    // Test 2: Import models
    console.log('📦 Importing models...');
    
    try {
      const Appointment = await import('./src/models/Appointment.js');
      console.log('✅ Appointment model imported');
    } catch (error) {
      console.error('❌ Appointment import failed:', error.message);
    }
    
    try {
      const User = await import('./src/models/User.js');
      console.log('✅ User model imported');
    } catch (error) {
      console.error('❌ User import failed:', error.message);
    }
    
    try {
      const BookedTimeSlot = await import('./src/models/BookedTimeSlot.js');
      console.log('✅ BookedTimeSlot model imported');
      console.log('📋 Model name:', BookedTimeSlot.default.modelName);
    } catch (error) {
      console.error('❌ BookedTimeSlot import failed:', error.message);
      console.error('❌ Full error:', error);
    }
    
    // Test 3: Import routes
    console.log('📦 Importing routes...');
    
    try {
      const appointmentRoutes = await import('./src/routes/appointments.js');
      console.log('✅ Appointment routes imported');
    } catch (error) {
      console.error('❌ Appointment routes import failed:', error.message);
      console.error('❌ Full error:', error);
    }
    
    try {
      const timeSlotRoutes = await import('./src/routes/timeSlots.js');
      console.log('✅ Time slot routes imported');
    } catch (error) {
      console.error('❌ Time slot routes import failed:', error.message);
      console.error('❌ Full error:', error);
    }
    
    console.log('🎉 All imports successful!');
    
  } catch (error) {
    console.error('❌ Startup test failed:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
  }
}

testStartup();



