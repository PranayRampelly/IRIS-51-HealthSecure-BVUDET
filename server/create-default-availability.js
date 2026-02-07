import mongoose from 'mongoose';
import DoctorAvailability from './src/models/DoctorAvailability.js';
import User from './src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthsecure');

async function createDefaultAvailability() {
  try {
    console.log('🔍 Creating default doctor availability...');
    
    // Find a doctor user
    const doctor = await User.findOne({ role: 'doctor' });
    if (!doctor) {
      console.log('❌ No doctor found in the database. Please create a doctor user first.');
      return;
    }
    
    console.log(`✅ Found doctor: ${doctor.firstName} ${doctor.lastName} (${doctor._id})`);
    
    // Check if availability already exists
    const existingAvailability = await DoctorAvailability.findOne({ doctorId: doctor._id });
    if (existingAvailability) {
      console.log('✅ Doctor availability already exists');
      return;
    }
    
    // Create default availability
    const defaultWorkingDays = [
      { 
        day: 'monday', 
        isWorking: true, 
        startTime: '09:00', 
        endTime: '17:00', 
        breaks: [{ 
          startTime: '12:00', 
          endTime: '13:00', 
          type: 'lunch', 
          description: 'Lunch Break' 
        }] 
      },
      { 
        day: 'tuesday', 
        isWorking: true, 
        startTime: '09:00', 
        endTime: '17:00', 
        breaks: [{ 
          startTime: '12:00', 
          endTime: '13:00', 
          type: 'lunch', 
          description: 'Lunch Break' 
        }] 
      },
      { 
        day: 'wednesday', 
        isWorking: true, 
        startTime: '09:00', 
        endTime: '17:00', 
        breaks: [{ 
          startTime: '12:00', 
          endTime: '13:00', 
          type: 'lunch', 
          description: 'Lunch Break' 
        }] 
      },
      { 
        day: 'thursday', 
        isWorking: true, 
        startTime: '09:00', 
        endTime: '17:00', 
        breaks: [{ 
          startTime: '12:00', 
          endTime: '13:00', 
          type: 'lunch', 
          description: 'Lunch Break' 
        }] 
      },
      { 
        day: 'friday', 
        isWorking: true, 
        startTime: '09:00', 
        endTime: '17:00', 
        breaks: [{ 
          startTime: '12:00', 
          endTime: '13:00', 
          type: 'lunch', 
          description: 'Lunch Break' 
        }] 
      },
      { 
        day: 'saturday', 
        isWorking: false, 
        startTime: '09:00', 
        endTime: '17:00', 
        breaks: [] 
      },
      { 
        day: 'sunday', 
        isWorking: false, 
        startTime: '09:00', 
        endTime: '17:00', 
        breaks: [] 
      }
    ];

    const availability = new DoctorAvailability({
      doctorId: doctor._id,
      workingDays: defaultWorkingDays,
      defaultStartTime: '09:00',
      defaultEndTime: '17:00',
      appointmentDuration: 30,
      isOnline: false,
      status: 'unavailable'
    });

    await availability.save();
    console.log('✅ Default doctor availability created successfully');
    console.log('📅 Working days: Monday to Friday, 9:00 AM - 5:00 PM');
    console.log('⏰ Appointment duration: 30 minutes');
    console.log('🍽️ Lunch break: 12:00 PM - 1:00 PM');
    
  } catch (error) {
    console.error('❌ Error creating default availability:', error);
  } finally {
    mongoose.disconnect();
  }
}

createDefaultAvailability();
