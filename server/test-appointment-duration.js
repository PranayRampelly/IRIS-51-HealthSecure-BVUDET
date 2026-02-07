// Test script to verify appointment duration handling
console.log('🧪 Testing Appointment Duration Logic');

// Mock doctor availability data
const doctorAvailability = {
  doctorId: '687c20d8600815662b42dbc8',
  appointmentDuration: 15, // Doctor has set 15 minutes
  workingDays: [
    {
      day: 'monday',
      isWorking: true,
      startTime: '09:00',
      endTime: '17:00'
    }
  ]
};

// Mock appointment booking request
const bookingRequest = {
  doctorId: '687c20d8600815662b42dbc8',
  scheduledTime: '11:15:00',
  estimatedDuration: null // Not provided by frontend
};

console.log('📅 Doctor Availability Settings:');
console.log('- Appointment Duration:', doctorAvailability.appointmentDuration, 'minutes');

console.log('\n🔍 Booking Request:');
console.log('- Scheduled Time:', bookingRequest.scheduledTime);
console.log('- Estimated Duration (from frontend):', bookingRequest.estimatedDuration);

// Simulate the new logic
function calculateAppointmentDuration(doctorId, requestedDuration) {
  // Get doctor's availability (in real code, this would be a database query)
  const availability = doctorAvailability; // Mock data
  
  const doctorAppointmentDuration = availability?.appointmentDuration || 30;
  const finalDuration = requestedDuration || doctorAppointmentDuration;
  
  console.log('\n🔄 Duration Calculation:');
  console.log('- Doctor\'s setting:', doctorAppointmentDuration, 'minutes');
  console.log('- Requested duration:', requestedDuration || 'Not provided');
  console.log('- Final duration used:', finalDuration, 'minutes');
  
  return finalDuration;
}

// Test the duration calculation
const finalDuration = calculateAppointmentDuration(bookingRequest.doctorId, bookingRequest.estimatedDuration);

// Calculate end time
function calculateEndTime(startTime, duration) {
  const [hours, minutes] = startTime.split(':').map(Number);
  const startDate = new Date(2000, 0, 1, hours, minutes);
  const endDate = new Date(startDate.getTime() + duration * 60000);
  return endDate.toTimeString().slice(0, 5);
}

const endTime = calculateEndTime(bookingRequest.scheduledTime, finalDuration);

console.log('\n⏰ Time Slot Calculation:');
console.log('- Start Time:', bookingRequest.scheduledTime);
console.log('- Duration:', finalDuration, 'minutes');
console.log('- End Time:', endTime);

console.log('\n✅ EXPECTED BEHAVIOR:');
console.log('- Doctor has set 15-minute appointments');
console.log('- Frontend doesn\'t specify duration');
console.log('- System should use doctor\'s 15-minute setting');
console.log('- Appointment should end at 11:30 (11:15 + 15 minutes)');

console.log('\n🔧 FIX EXPLANATION:');
console.log('The system now dynamically uses the doctor\'s appointment duration');
console.log('from their availability settings instead of hardcoding 30 minutes.');
console.log('This ensures consistency between time slots and actual appointments.');
