import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

// Test doctor login to get token
async function testDoctorLogin() {
  try {
    console.log('🔐 Testing doctor login...');
    
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'doctor@healthsecure.com',
      password: 'password123'
    });
    
    if (loginResponse.data.success) {
      console.log('✅ Doctor login successful');
      return loginResponse.data.token;
    } else {
      console.log('❌ Doctor login failed:', loginResponse.data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Doctor login error:', error.response?.data || error.message);
    return null;
  }
}

// Test getting doctor appointments
async function testGetDoctorAppointments(token) {
  try {
    console.log('📋 Testing get doctor appointments...');
    
    const response = await axios.get(`${BASE_URL}/appointments/doctor`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        status: 'all',
        consultationType: 'all',
        page: 1,
        limit: 10
      }
    });
    
    if (response.data.success) {
      console.log('✅ Get doctor appointments successful');
      console.log('📊 Statistics:', response.data.data.statistics);
      console.log('📄 Appointments count:', response.data.data.appointments.length);
      console.log('📄 Pagination:', response.data.data.pagination);
      
      if (response.data.data.appointments.length > 0) {
        console.log('📋 Sample appointment:', {
          id: response.data.data.appointments[0]._id,
          appointmentNumber: response.data.data.appointments[0].appointmentNumber,
          patientName: response.data.data.appointments[0].patientName,
          status: response.data.data.appointments[0].status,
          consultationType: response.data.data.appointments[0].consultationType
        });
      }
    } else {
      console.log('❌ Get doctor appointments failed:', response.data.message);
    }
  } catch (error) {
    console.error('❌ Get doctor appointments error:', error.response?.data || error.message);
  }
}

// Test getting doctor statistics
async function testGetDoctorStatistics(token) {
  try {
    console.log('📊 Testing get doctor statistics...');
    
    const response = await axios.get(`${BASE_URL}/appointments/doctor/statistics`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.data.success) {
      console.log('✅ Get doctor statistics successful');
      console.log('📊 Overview:', response.data.data.overview);
      console.log('📈 Monthly trends count:', response.data.data.monthlyTrends.length);
      console.log('📊 Completion rate:', response.data.data.completionRate + '%');
    } else {
      console.log('❌ Get doctor statistics failed:', response.data.message);
    }
  } catch (error) {
    console.error('❌ Get doctor statistics error:', error.response?.data || error.message);
  }
}

// Test updating appointment status
async function testUpdateAppointmentStatus(token) {
  try {
    console.log('🔄 Testing update appointment status...');
    
    // First get appointments to find one to update
    const appointmentsResponse = await axios.get(`${BASE_URL}/appointments/doctor`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (appointmentsResponse.data.success && appointmentsResponse.data.data.appointments.length > 0) {
      const appointmentId = appointmentsResponse.data.data.appointments[0]._id;
      
      const response = await axios.put(`${BASE_URL}/appointments/${appointmentId}/status`, {
        status: 'confirmed',
        notes: 'Test status update from backend'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        console.log('✅ Update appointment status successful');
        console.log('📝 Updated appointment:', response.data.data.appointmentNumber);
      } else {
        console.log('❌ Update appointment status failed:', response.data.message);
      }
    } else {
      console.log('⚠️ No appointments found to test status update');
    }
  } catch (error) {
    console.error('❌ Update appointment status error:', error.response?.data || error.message);
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting doctor appointments backend tests...\n');
  
  // Test doctor login
  const token = await testDoctorLogin();
  
  if (!token) {
    console.log('❌ Cannot proceed without authentication token');
    return;
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test getting appointments
  await testGetDoctorAppointments(token);
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test getting statistics
  await testGetDoctorStatistics(token);
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test updating appointment status
  await testUpdateAppointmentStatus(token);
  
  console.log('\n' + '='.repeat(50) + '\n');
  console.log('✅ All tests completed!');
}

// Run the tests
runTests().catch(console.error);
