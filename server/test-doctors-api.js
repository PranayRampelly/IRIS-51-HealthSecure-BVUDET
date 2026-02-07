import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function testDoctorsAPI() {
  console.log('🧪 Testing Doctors API endpoints...\n');

  try {
    // Test 1: Get all doctors
    console.log('1️⃣ Testing GET /api/doctors/all');
    const allDoctorsResponse = await axios.get(`${BASE_URL}/doctors/all`);
    console.log('✅ Status:', allDoctorsResponse.status);
    console.log('📊 Response:', {
      success: allDoctorsResponse.data.success,
      count: allDoctorsResponse.data.count,
      doctorsCount: allDoctorsResponse.data.doctors?.length || 0
    });
    
    if (allDoctorsResponse.data.doctors && allDoctorsResponse.data.doctors.length > 0) {
      console.log('🏥 First doctor sample:', {
        id: allDoctorsResponse.data.doctors[0]._id,
        name: `${allDoctorsResponse.data.doctors[0].firstName} ${allDoctorsResponse.data.doctors[0].lastName}`,
        specialization: allDoctorsResponse.data.doctors[0].specialization,
        hospital: allDoctorsResponse.data.doctors[0].hospital
      });
    }
    console.log('');

    // Test 2: Get nearby doctors
    console.log('2️⃣ Testing GET /api/doctors/nearby');
    const nearbyDoctorsResponse = await axios.get(`${BASE_URL}/doctors/nearby`);
    console.log('✅ Status:', nearbyDoctorsResponse.status);
    console.log('📊 Response:', {
      success: nearbyDoctorsResponse.data.success,
      count: nearbyDoctorsResponse.data.count,
      doctorsCount: nearbyDoctorsResponse.data.doctors?.length || 0
    });
    console.log('');

    // Test 3: Get emergency doctors
    console.log('3️⃣ Testing GET /api/doctors/emergency');
    const emergencyDoctorsResponse = await axios.get(`${BASE_URL}/doctors/emergency`);
    console.log('✅ Status:', emergencyDoctorsResponse.status);
    console.log('📊 Response:', {
      success: emergencyDoctorsResponse.data.success,
      count: emergencyDoctorsResponse.data.count,
      doctorsCount: emergencyDoctorsResponse.data.doctors?.length || 0
    });
    console.log('');

    console.log('🎯 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('📊 Error response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }
  }
}

// Run the test
testDoctorsAPI();
