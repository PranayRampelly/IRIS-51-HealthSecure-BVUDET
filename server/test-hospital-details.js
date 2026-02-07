const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:8080';
const TEST_HOSPITAL_ID = '688fb3b5a1456536fc5d14bd'; // Use the hospital ID from the URL

// Test data
const testUser = {
  email: 'patient@test.com',
  password: 'password123'
};

let authToken = '';

// Helper function to make authenticated requests
const makeAuthenticatedRequest = async (method, url, data = null) => {
  const config = {
    method,
    url: `${BASE_URL}${url}`,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    }
  };
  
  if (data) {
    config.data = data;
  }
  
  return axios(config);
};

// Test functions
const testLogin = async () => {
  console.log('🔐 Testing login...');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, testUser);
    authToken = response.data.token;
    console.log('✅ Login successful');
    return true;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return false;
  }
};

const testGetHospitalDetails = async () => {
  console.log('🏥 Testing get hospital details...');
  try {
    const response = await makeAuthenticatedRequest('GET', `/api/patient/hospitals/${TEST_HOSPITAL_ID}`);
    const hospital = response.data.data;
    
    console.log('✅ Hospital details retrieved successfully');
    console.log(`   Name: ${hospital.name}`);
    console.log(`   Type: ${hospital.type}`);
    console.log(`   Address: ${hospital.address}`);
    console.log(`   Coordinates: ${hospital.coordinates ? `${hospital.coordinates.lat}, ${hospital.coordinates.lng}` : 'Not available'}`);
    console.log(`   Rating: ${hospital.rating}`);
    console.log(`   Real-time data: ${hospital.realTimeData ? 'Available' : 'Not available'}`);
    console.log(`   Specialties: ${hospital.specialties?.length || 0} specialties`);
    console.log(`   Services: ${hospital.services?.length || 0} services`);
    
    return hospital;
  } catch (error) {
    console.error('❌ Get hospital details failed:', error.response?.data || error.message);
    return null;
  }
};

const testGetHospitalDoctors = async () => {
  console.log('👨‍⚕️ Testing get hospital doctors...');
  try {
    const response = await makeAuthenticatedRequest('GET', `/api/patient/hospitals/${TEST_HOSPITAL_ID}/doctors`);
    const doctors = response.data.data.doctors;
    
    console.log('✅ Hospital doctors retrieved successfully');
    console.log(`   Found ${doctors.length} doctors`);
    
    if (doctors.length > 0) {
      const doctor = doctors[0];
      console.log(`   Sample doctor: ${doctor.name} - ${doctor.specialization}`);
      console.log(`   Rating: ${doctor.rating}`);
      console.log(`   Online: ${doctor.realTimeData?.isOnline ? 'Yes' : 'No'}`);
    }
    
    return doctors;
  } catch (error) {
    console.error('❌ Get hospital doctors failed:', error.response?.data || error.message);
    return [];
  }
};

const testSendMessageToHospital = async () => {
  console.log('💬 Testing send message to hospital...');
  try {
    const messageData = {
      message: 'Hello! I have a question about my upcoming appointment.',
      messageType: 'text'
    };
    
    const response = await makeAuthenticatedRequest('POST', `/api/patient/hospitals/${TEST_HOSPITAL_ID}/message`, messageData);
    
    console.log('✅ Message sent successfully');
    console.log(`   Message ID: ${response.data.data.id}`);
    
    return response.data.data;
  } catch (error) {
    console.error('❌ Send message failed:', error.response?.data || error.message);
    return null;
  }
};

const testBookAppointment = async () => {
  console.log('📅 Testing book appointment...');
  try {
    // First get doctors to use one for booking
    const doctorsResponse = await makeAuthenticatedRequest('GET', `/api/patient/hospitals/${TEST_HOSPITAL_ID}/doctors`);
    const doctors = doctorsResponse.data.data.doctors;
    
    if (doctors.length === 0) {
      console.log('⚠️  No doctors available for booking test');
      return null;
    }
    
    const doctor = doctors[0];
    const appointmentData = {
      doctorId: doctor.id,
      appointmentType: 'consultation',
      department: doctor.specialization,
      scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
      scheduledTime: '10:00',
      symptoms: 'General consultation',
      priority: 'normal'
    };
    
    const response = await makeAuthenticatedRequest('POST', `/api/patient/hospitals/${TEST_HOSPITAL_ID}/appointments`, appointmentData);
    
    console.log('✅ Appointment booked successfully');
    console.log(`   Appointment ID: ${response.data.appointment.id}`);
    console.log(`   Doctor: ${doctor.name}`);
    console.log(`   Date: ${appointmentData.scheduledDate}`);
    
    return response.data.appointment;
  } catch (error) {
    console.error('❌ Book appointment failed:', error.response?.data || error.message);
    return null;
  }
};

// Main test runner
const runTests = async () => {
  console.log('🚀 Starting Hospital Details API Tests\n');
  
  // Test login
  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without authentication');
    return;
  }
  
  console.log('');
  
  // Test hospital details
  const hospital = await testGetHospitalDetails();
  if (!hospital) {
    console.log('❌ Cannot proceed without hospital details');
    return;
  }
  
  console.log('');
  
  // Test hospital doctors
  const doctors = await testGetHospitalDoctors();
  
  console.log('');
  
  // Test messaging
  const message = await testSendMessageToHospital();
  
  console.log('');
  
  // Test appointment booking
  const appointment = await testBookAppointment();
  
  console.log('');
  console.log('🎉 All tests completed!');
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log(`   ✅ Hospital Details: ${hospital ? 'PASS' : 'FAIL'}`);
  console.log(`   ✅ Hospital Doctors: ${doctors.length > 0 ? 'PASS' : 'FAIL'}`);
  console.log(`   ✅ Messaging: ${message ? 'PASS' : 'FAIL'}`);
  console.log(`   ✅ Appointment Booking: ${appointment ? 'PASS' : 'FAIL'}`);
};

// Run tests
runTests().catch(console.error); 