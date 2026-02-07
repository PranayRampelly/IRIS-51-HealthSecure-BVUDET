import axios from 'axios';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODdjMjBkODYwMDgxNTY2MmI0MmRiYzgiLCJyb2xlIjoiZG9jdG9yIiwiaWF0IjoxNzU1NDA3OTkyLCJleHAiOjE3NTYwMTI3OTJ9.lqabt1LweWVkv0F0dUmKcAjcZz_NUuBEKb0jJhVQCfo';

async function testDoctorSchedule() {
  try {
    console.log('🔍 Testing doctor schedule endpoint...');
    
    const response = await axios.get('http://localhost:5000/api/doctor/schedule/time-slots/2025-08-22', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Response received:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
    // Check if booked slots are marked correctly
    if (response.data.success && response.data.slots) {
      const bookedSlots = response.data.slots.filter(slot => !slot.available);
      console.log(`\n🔍 Found ${bookedSlots.length} booked slots:`);
      bookedSlots.forEach(slot => {
        console.log(`- ${slot.time}: Booked by ${slot.bookedBy || 'Unknown'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testDoctorSchedule();
