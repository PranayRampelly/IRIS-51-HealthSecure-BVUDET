import mongoose from 'mongoose';
import Appointment from './src/models/Appointment.js';
import Doctor from './src/models/Doctor.js';
import Patient from './src/models/Patient.js';
import User from './src/models/User.js';

async function testAppointmentSystem() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthsecure');
    console.log('Connected to MongoDB');

    console.log('📅 Testing Appointment System...\n');

    // Test 1: Create doctor
    console.log('1. Creating doctor...');
    const newDoctor = new Doctor({
      userId: new mongoose.Types.ObjectId(),
      doctorId: 'DOC-' + Date.now(),
      specialization: 'Cardiology',
      licenseNumber: 'LIC-' + Date.now(),
      experience: 10,
      qualifications: ['MBBS', 'MD Cardiology'],
      hospitalId: new mongoose.Types.ObjectId(),
      departmentId: new mongoose.Types.ObjectId(),
      consultationFee: 1500,
      availability: {
        monday: { start: '09:00', end: '17:00', isAvailable: true },
        tuesday: { start: '09:00', end: '17:00', isAvailable: true },
        wednesday: { start: '09:00', end: '17:00', isAvailable: true },
        thursday: { start: '09:00', end: '17:00', isAvailable: true },
        friday: { start: '09:00', end: '17:00', isAvailable: true },
        saturday: { start: '09:00', end: '13:00', isAvailable: true },
        sunday: { start: '00:00', end: '00:00', isAvailable: false }
      },
      isActive: true
    });

    await newDoctor.save();
    console.log('✅ Doctor created successfully');
    console.log('   - Doctor ID:', newDoctor._id);
    console.log('   - Specialization:', newDoctor.specialization);
    console.log('   - License:', newDoctor.licenseNumber);

    // Test 2: Create patient
    console.log('\n2. Creating patient...');
    const newPatient = new Patient({
      patientId: 'PAT-' + Date.now(),
      personalInfo: {
        firstName: 'Alice',
        lastName: 'Johnson',
        dateOfBirth: new Date('1990-03-20'),
        gender: 'female',
        bloodType: 'A+',
        phone: '+91-9876543210',
        email: 'alice.johnson@example.com',
        address: {
          street: '456 Park Avenue',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          country: 'India'
        }
      },
      emergencyContact: {
        name: 'Bob Johnson',
        relationship: 'Spouse',
        phone: '+91-9876543211',
        email: 'bob.johnson@example.com'
      },
      isActive: true
    });

    await newPatient.save();
    console.log('✅ Patient created successfully');
    console.log('   - Patient ID:', newPatient._id);
    console.log('   - Name:', `${newPatient.personalInfo.firstName} ${newPatient.personalInfo.lastName}`);

    // Test 3: Create appointment
    console.log('\n3. Creating appointment...');
    const appointmentDate = new Date();
    appointmentDate.setDate(appointmentDate.getDate() + 7); // 7 days from now
    appointmentDate.setHours(10, 0, 0, 0); // 10:00 AM

    const newAppointment = new Appointment({
      patientId: newPatient._id,
      doctorId: newDoctor._id,
      hospitalId: new mongoose.Types.ObjectId(),
      appointmentType: 'consultation',
      appointmentDate: appointmentDate,
      duration: 30, // minutes
      status: 'scheduled',
      reason: 'Regular checkup and consultation',
      symptoms: ['Chest pain', 'Shortness of breath'],
      priority: 'normal',
      notes: 'Patient requested morning appointment',
      isActive: true
    });

    await newAppointment.save();
    console.log('✅ Appointment created successfully');
    console.log('   - Appointment ID:', newAppointment._id);
    console.log('   - Date:', newAppointment.appointmentDate);
    console.log('   - Type:', newAppointment.appointmentType);
    console.log('   - Status:', newAppointment.status);

    // Test 4: Create follow-up appointment
    console.log('\n4. Creating follow-up appointment...');
    const followUpDate = new Date();
    followUpDate.setDate(followUpDate.getDate() + 30); // 30 days from now
    followUpDate.setHours(14, 30, 0, 0); // 2:30 PM

    const followUpAppointment = new Appointment({
      patientId: newPatient._id,
      doctorId: newDoctor._id,
      hospitalId: new mongoose.Types.ObjectId(),
      appointmentType: 'follow-up',
      appointmentDate: followUpDate,
      duration: 45,
      status: 'scheduled',
      reason: 'Follow-up after initial consultation',
      priority: 'normal',
      parentAppointmentId: newAppointment._id,
      notes: 'Follow-up appointment to review treatment progress',
      isActive: true
    });

    await followUpAppointment.save();
    console.log('✅ Follow-up appointment created successfully');
    console.log('   - Follow-up ID:', followUpAppointment._id);
    console.log('   - Parent Appointment:', followUpAppointment.parentAppointmentId);

    // Test 5: Update appointment status
    console.log('\n5. Updating appointment status...');
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      newAppointment._id,
      {
        status: 'confirmed',
        confirmedAt: new Date(),
        notes: 'Appointment confirmed by patient'
      },
      { new: true }
    );
    console.log('✅ Appointment status updated to:', updatedAppointment.status);

    // Test 6: Create emergency appointment
    console.log('\n6. Creating emergency appointment...');
    const emergencyAppointment = new Appointment({
      patientId: newPatient._id,
      doctorId: newDoctor._id,
      hospitalId: new mongoose.Types.ObjectId(),
      appointmentType: 'emergency',
      appointmentDate: new Date(),
      duration: 60,
      status: 'scheduled',
      reason: 'Severe chest pain',
      symptoms: ['Severe chest pain', 'Difficulty breathing', 'Nausea'],
      priority: 'high',
      notes: 'Emergency appointment - patient experiencing severe symptoms',
      isActive: true
    });

    await emergencyAppointment.save();
    console.log('✅ Emergency appointment created successfully');
    console.log('   - Emergency ID:', emergencyAppointment._id);
    console.log('   - Priority:', emergencyAppointment.priority);

    // Test 7: Test appointment queries
    console.log('\n7. Testing appointment queries...');
    const scheduledAppointments = await Appointment.find({ status: 'scheduled' });
    console.log(`✅ Found ${scheduledAppointments.length} scheduled appointments`);

    const confirmedAppointments = await Appointment.find({ status: 'confirmed' });
    console.log(`✅ Found ${confirmedAppointments.length} confirmed appointments`);

    const emergencyAppointments = await Appointment.find({ priority: 'high' });
    console.log(`✅ Found ${emergencyAppointments.length} high priority appointments`);

    // Test 8: Test doctor availability
    console.log('\n8. Testing doctor availability...');
    const today = new Date();
    const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'lowercase' });
    const doctorAvailability = newDoctor.availability[dayOfWeek];
    
    console.log('✅ Doctor availability for today:');
    console.log('   - Day:', dayOfWeek);
    console.log('   - Available:', doctorAvailability.isAvailable);
    console.log('   - Hours:', `${doctorAvailability.start} - ${doctorAvailability.end}`);

    // Test 9: Test appointment statistics
    console.log('\n9. Testing appointment statistics...');
    const appointmentStats = await Appointment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgDuration: { $avg: '$duration' }
        }
      }
    ]);
    console.log('✅ Appointment statistics:', appointmentStats);

    // Test 10: Test appointment type statistics
    console.log('\n10. Testing appointment type statistics...');
    const typeStats = await Appointment.aggregate([
      {
        $group: {
          _id: '$appointmentType',
          count: { $sum: 1 },
          totalDuration: { $sum: '$duration' }
        }
      }
    ]);
    console.log('✅ Appointment type statistics:', typeStats);

    // Test 11: Test upcoming appointments
    console.log('\n11. Testing upcoming appointments...');
    const upcomingAppointments = await Appointment.find({
      appointmentDate: { $gte: new Date() },
      status: { $in: ['scheduled', 'confirmed'] }
    }).sort({ appointmentDate: 1 });
    
    console.log(`✅ Found ${upcomingAppointments.length} upcoming appointments`);

    // Test 12: Test appointment conflicts
    console.log('\n12. Testing appointment conflict detection...');
    const conflictCheck = await Appointment.find({
      doctorId: newDoctor._id,
      appointmentDate: {
        $gte: new Date(appointmentDate.getTime() - 30 * 60 * 1000), // 30 minutes before
        $lte: new Date(appointmentDate.getTime() + 30 * 60 * 1000)  // 30 minutes after
      },
      status: { $in: ['scheduled', 'confirmed'] }
    });
    
    console.log(`✅ Found ${conflictCheck.length} potential conflicts for the time slot`);

    // Test 13: Test appointment cancellation
    console.log('\n13. Testing appointment cancellation...');
    const cancelledAppointment = await Appointment.findByIdAndUpdate(
      followUpAppointment._id,
      {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelledBy: new mongoose.Types.ObjectId(),
        cancellationReason: 'Patient requested cancellation',
        notes: 'Appointment cancelled by patient due to schedule conflict'
      },
      { new: true }
    );
    console.log('✅ Appointment cancelled successfully');
    console.log('   - Cancellation Reason:', cancelledAppointment.cancellationReason);

    // Test 14: Test appointment completion
    console.log('\n14. Testing appointment completion...');
    const completedAppointment = await Appointment.findByIdAndUpdate(
      newAppointment._id,
      {
        status: 'completed',
        completedAt: new Date(),
        actualDuration: 35,
        diagnosis: 'Mild chest discomfort, likely stress-related',
        treatment: 'Prescribed stress management techniques and follow-up in 30 days',
        prescription: ['Propranolol 10mg twice daily'],
        nextAppointmentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        notes: 'Patient responded well to consultation'
      },
      { new: true }
    );
    console.log('✅ Appointment completed successfully');
    console.log('   - Diagnosis:', completedAppointment.diagnosis);
    console.log('   - Treatment:', completedAppointment.treatment);

    // Cleanup
    console.log('\n15. Cleaning up test data...');
    await Doctor.findByIdAndDelete(newDoctor._id);
    await Patient.findByIdAndDelete(newPatient._id);
    await Appointment.findByIdAndDelete(newAppointment._id);
    await Appointment.findByIdAndDelete(followUpAppointment._id);
    await Appointment.findByIdAndDelete(emergencyAppointment._id);
    console.log('✅ Test data cleaned up');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

testAppointmentSystem();
