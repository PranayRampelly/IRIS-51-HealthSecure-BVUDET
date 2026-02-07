const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const TEST_DOCTOR_ID = '507f1f77bcf86cd799439011'; // Replace with actual doctor ID

async function testAvailabilitySystem() {
  console.log('🧪 Testing Real-time Doctor Availability System...\n');

  try {
    // Test 1: Get doctor availability
    console.log('1. Testing Get Doctor Availability...');
    const availabilityResponse = await axios.get(`${BASE_URL}/doctor-availability/${TEST_DOCTOR_ID}/status`);
    console.log('✅ Status:', availabilityResponse.data);

    // Test 2: Get available slots for today
    console.log('\n2. Testing Get Available Slots...');
    const today = new Date().toISOString().split('T')[0];
    const slotsResponse = await axios.get(`${BASE_URL}/doctor-availability/${TEST_DOCTOR_ID}/slots/${today}`);
    console.log('✅ Available Slots:', slotsResponse.data);

    // Test 3: Get online doctors
    console.log('\n3. Testing Get Online Doctors...');
    const onlineDoctorsResponse = await axios.get(`${BASE_URL}/doctor-availability/online-doctors`);
    console.log('✅ Online Doctors:', onlineDoctorsResponse.data);

    // Test 4: Check slot availability
    console.log('\n4. Testing Check Slot Availability...');
    const slotCheckResponse = await axios.get(`${BASE_URL}/doctor-availability/${TEST_DOCTOR_ID}/slots/${today}/09:00/check`);
    console.log('✅ Slot Check:', slotCheckResponse.data);

    console.log('\n🎉 All tests passed! The real-time availability system is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testAvailabilitySystem();








