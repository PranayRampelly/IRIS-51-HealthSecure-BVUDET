// Test script to verify booked slot detection
console.log('🧪 Testing Booked Slot Detection');

// Your appointment data
const appointmentData = {
  "_id": "68a181d47627ebc781bd8569",
  "patient": {
    "_id": "687a22c68d3190faad6800ec",
    "firstName": "Siddhesh",
    "lastName": "Harwande"
  },
  "doctor": "687c20d8600815662b42dbc8",
  "scheduledDate": "2025-08-22T00:00:00.000Z", // August 22nd
  "scheduledTime": "11:15:00",
  "startTime": "11:15:00",
  "endTime": "11:45",
  "status": "pending"
};

// Mock booked appointments array
const bookedAppointments = [appointmentData];

console.log('📅 Appointment Data:');
console.log('- Date:', appointmentData.scheduledDate);
console.log('- Time:', appointmentData.startTime);
console.log('- Patient:', `${appointmentData.patient.firstName} ${appointmentData.patient.lastName}`);
console.log('- Status:', appointmentData.status);

// Test the new date handling logic
function testDateFiltering(requestedDate) {
  console.log(`\n🔍 Testing date filtering for: ${requestedDate}`);
  
  // New UTC-based date handling
  const selectedDate = new Date(requestedDate + 'T00:00:00.000Z'); // Force UTC
  const startOfDay = new Date(selectedDate);
  const endOfDay = new Date(selectedDate);
  endOfDay.setUTCDate(endOfDay.getUTCDate() + 1); // Next day at 00:00:00 UTC
  
  console.log('- Selected date (UTC):', selectedDate.toISOString());
  console.log('- Start of day (UTC):', startOfDay.toISOString());
  console.log('- End of day (UTC):', endOfDay.toISOString());
  
  // Check if appointment falls within the date range
  const appointmentDate = new Date(appointmentData.scheduledDate);
  const isInRange = appointmentDate >= startOfDay && appointmentDate < endOfDay;
  
  console.log('- Appointment date:', appointmentDate.toISOString());
  console.log('- Is in range:', isInRange);
  
  return isInRange;
}

// Test slot booking detection
function testSlotBooking(timeString) {
  console.log(`\n🔍 Testing slot booking for: ${timeString}`);
  
  // Check if this slot is booked
  const isBooked = bookedAppointments.some(apt => 
    apt.startTime === timeString
  );

  const bookedAppointment = bookedAppointments.find(apt => 
    apt.startTime === timeString
  );

  console.log('- Is booked:', isBooked);
  if (bookedAppointment) {
    console.log('- Booked by:', `${bookedAppointment.patient.firstName} ${bookedAppointment.patient.lastName}`);
    console.log('- Appointment ID:', bookedAppointment._id);
  }
  
  return { isBooked, bookedAppointment };
}

// Test with August 22nd (should find the appointment)
console.log('\n=== TESTING AUGUST 22nd ===');
const foundOn22 = testDateFiltering('2025-08-22');
const slot11_15 = testSlotBooking('11:15');

// Test with August 23rd (should NOT find the appointment)
console.log('\n=== TESTING AUGUST 23rd ===');
const foundOn23 = testDateFiltering('2025-08-23');

console.log('\n📊 RESULTS SUMMARY:');
console.log('August 22nd - Appointment found:', foundOn22);
console.log('August 23rd - Appointment found:', foundOn23);
console.log('11:15 slot - Is booked:', slot11_15.isBooked);

console.log('\n✅ EXPECTED BEHAVIOR:');
console.log('- August 22nd should find the appointment (TRUE)');
console.log('- August 23rd should NOT find the appointment (FALSE)');
console.log('- 11:15 slot should be marked as booked (TRUE)');
console.log('- Time slots should show "Booked by Siddhesh Harwande"');

console.log('\n🔧 FIX EXPLANATION:');
console.log('The new UTC-based date handling ensures appointments appear');
console.log('on the correct date, and the slot booking detection should');
console.log('properly identify and display booked time slots.');
