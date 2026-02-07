import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

// Test pharmacy endpoints
async function testPharmacyEndpoints() {
  console.log('🧪 Testing Pharmacy Endpoints...\n');

  try {
    // Test 1: Get profile completion status
    console.log('1. Testing GET /pharmacy/profile-completion');
    try {
      const response = await axios.get(`${BASE_URL}/pharmacy/profile-completion`);
      console.log('✅ Profile completion status:', response.data);
    } catch (error) {
      console.log('❌ Profile completion status error:', error.response?.data || error.message);
    }

    // Test 2: Get pharmacy profile
    console.log('\n2. Testing GET /pharmacy/me');
    try {
      const response = await axios.get(`${BASE_URL}/pharmacy/me`);
      console.log('✅ Pharmacy profile:', response.data);
    } catch (error) {
      console.log('❌ Pharmacy profile error:', error.response?.data || error.message);
    }

    // Test 3: Save profile progress
    console.log('\n3. Testing POST /pharmacy/save-profile-progress');
    try {
      const testData = {
        businessName: 'Test Pharmacy',
        email: 'test@pharmacy.com',
        phone: '+91 9876543210',
        licenseNumber: 'DL-TEST-123',
        pharmacyType: 'Retail',
        totalExperience: '5',
        address: '123 Test Street',
        city: 'Mumbai',
        state: 'Maharashtra'
      };
      
      const response = await axios.post(`${BASE_URL}/pharmacy/save-profile-progress`, testData);
      console.log('✅ Save profile progress:', response.data);
    } catch (error) {
      console.log('❌ Save profile progress error:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the tests
testPharmacyEndpoints();
