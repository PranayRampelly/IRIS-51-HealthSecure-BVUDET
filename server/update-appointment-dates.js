import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthsecure');

// Import the Appointment model
const Appointment = mongoose.model('Appointment', {
  appointmentNumber: String,
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  appointmentType: String,
  department: String,
  scheduledDate: Date,
  scheduledTime: String,
  estimatedDuration: Number,
  consultationType: String,
  status: String,
  priority: String,
  symptoms: [String],
  patientNotes: String,
  followUpRequired: Boolean,
  paymentStatus: String,
  cost: Object,
  notifications: [Object],
  isEmergency: Boolean,
  doctorDetails: Object,
  bookingSource: String,
  emergencyPriority: String,
  preferredLanguage: String,
  termsAccepted: Boolean,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  statusHistory: [Object],
  prescriptions: [Object],
  labReports: [Object],
  createdAt: Date,
  updatedAt: Date
});

async function updateAppointmentDates() {
  try {
    // Find all appointments for the specific doctor
    const doctorId = '687c20d8600815662b42dbc8';
    const appointments = await Appointment.find({ doctor: doctorId });
    
    console.log(`📋 Found ${appointments.length} appointments for doctor ${doctorId}`);
    
    // Update appointments to have future dates
    const futureDates = [
      new Date('2025-08-20T10:00:00.000Z'), // 5 days from now
      new Date('2025-08-22T14:00:00.000Z'), // 7 days from now
      new Date('2025-08-25T09:00:00.000Z'), // 10 days from now
      new Date('2025-08-28T16:00:00.000Z'), // 13 days from now
      new Date('2025-09-01T11:00:00.000Z'), // 17 days from now
      new Date('2025-09-05T15:00:00.000Z'), // 21 days from now
      new Date('2025-09-10T10:00:00.000Z'), // 26 days from now
    ];
    
    for (let i = 0; i < appointments.length && i < futureDates.length; i++) {
      const appointment = appointments[i];
      const newDate = futureDates[i];
      
      console.log(`📅 Updating appointment ${appointment.appointmentNumber}:`);
      console.log(`   Old date: ${appointment.scheduledDate}`);
      console.log(`   New date: ${newDate.toISOString()}`);
      
      appointment.scheduledDate = newDate;
      appointment.updatedAt = new Date();
      
      await appointment.save();
      console.log(`   ✅ Updated successfully`);
    }
    
    console.log('🎉 All appointment dates updated successfully!');
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error updating appointment dates:', error);
    mongoose.connection.close();
  }
}

updateAppointmentDates();
