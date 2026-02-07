// Test script to verify date handling logic
console.log('🧪 Testing Date Handling Logic');

// Your appointment data
const appointmentData = {
  "_id": "68a181d47627ebc781bd8569",
  "scheduledDate": "2025-08-22T00:00:00.000Z", // August 22nd
  "scheduledTime": "11:15:00",
  "patient": {
    "firstName": "Siddhesh",
    "lastName": "Harwande"
  }
};

console.log('📅 Original appointment date:', appointmentData.scheduledDate);

// Test the old date handling logic (problematic)
function oldDateHandling(requestedDate) {
  console.log('\n🔴 OLD LOGIC (Problematic):');
  const selectedDate = new Date(requestedDate);
  const startOfDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
  const endOfDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 23, 59, 59, 999);
  
  console.log('Requested date:', requestedDate);
  console.log('Selected date:', selectedDate.toISOString());
  console.log('Start of day:', startOfDay.toISOString());
  console.log('End of day:', endOfDay.toISOString());
  
  const appointmentDate = new Date(appointmentData.scheduledDate);
  const isInRange = appointmentDate >= startOfDay && appointmentDate <= endOfDay;
  console.log('Appointment in range:', isInRange);
  
  return isInRange;
}

// Test the new date handling logic (fixed)
function newDateHandling(requestedDate) {
  console.log('\n🟢 NEW LOGIC (Fixed):');
  const selectedDate = new Date(requestedDate + 'T00:00:00.000Z'); // Force UTC
  const startOfDay = new Date(selectedDate);
  const endOfDay = new Date(selectedDate);
  endOfDay.setUTCDate(endOfDay.getUTCDate() + 1); // Next day at 00:00:00 UTC
  
  console.log('Requested date:', requestedDate);
  console.log('Selected date (UTC):', selectedDate.toISOString());
  console.log('Start of day (UTC):', startOfDay.toISOString());
  console.log('End of day (UTC):', endOfDay.toISOString());
  
  const appointmentDate = new Date(appointmentData.scheduledDate);
  const isInRange = appointmentDate >= startOfDay && appointmentDate < endOfDay;
  console.log('Appointment in range:', isInRange);
  
  return isInRange;
}

// Test with August 22nd (should match)
console.log('\n=== TESTING AUGUST 22nd ===');
const result22Old = oldDateHandling('2025-08-22');
const result22New = newDateHandling('2025-08-22');

// Test with August 23rd (should NOT match)
console.log('\n=== TESTING AUGUST 23rd ===');
const result23Old = oldDateHandling('2025-08-23');
const result23New = newDateHandling('2025-08-23');

console.log('\n📊 RESULTS SUMMARY:');
console.log('August 22nd - Old logic:', result22Old, '| New logic:', result22New);
console.log('August 23rd - Old logic:', result23Old, '| New logic:', result23New);

console.log('\n✅ EXPECTED BEHAVIOR:');
console.log('- August 22nd should return TRUE (appointment is on this date)');
console.log('- August 23rd should return FALSE (appointment is NOT on this date)');

console.log('\n🔧 FIX EXPLANATION:');
console.log('The old logic used local timezone date calculations which could cause');
console.log('appointments to appear on the wrong day due to timezone differences.');
console.log('The new logic uses UTC dates consistently to avoid this issue.');
