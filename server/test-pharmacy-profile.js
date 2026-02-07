import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

// Test pharmacy profile completion endpoints
async function testPharmacyProfileEndpoints() {
  console.log('🧪 Testing Pharmacy Profile Completion Endpoints...\n');

  try {
    // Test 1: Get profile completion status (should work without auth for testing)
    console.log('1. Testing GET /api/pharmacy/profile-completion');
    try {
      const response = await axios.get(`${BASE_URL}/api/pharmacy/profile-completion`);
      console.log('✅ Profile completion status:', response.data);
    } catch (error) {
      console.log('❌ Profile completion status error:', error.response?.data || error.message);
    }

    // Test 2: Get pharmacy profile
    console.log('\n2. Testing GET /api/pharmacy/me');
    try {
      const response = await axios.get(`${BASE_URL}/api/pharmacy/me`);
      console.log('✅ Pharmacy profile:', response.data);
    } catch (error) {
      console.log('❌ Pharmacy profile error:', error.response?.data || error.message);
    }

    // Test 3: Save profile progress
    console.log('\n3. Testing POST /api/pharmacy/save-profile-progress');
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
      
      const response = await axios.post(`${BASE_URL}/api/pharmacy/save-profile-progress`, testData);
      console.log('✅ Save profile progress:', response.data);
    } catch (error) {
      console.log('❌ Save profile progress error:', error.response?.data || error.message);
    }

    // Test 4: Complete profile
    console.log('\n4. Testing POST /api/pharmacy/complete-profile');
    try {
      const testData = {
        businessName: 'Complete Test Pharmacy',
        email: 'complete@pharmacy.com',
        phone: '+91 9876543210',
        licenseNumber: 'DL-COMPLETE-123',
        pharmacyType: 'Retail',
        totalExperience: '10',
        address: '456 Complete Street',
        city: 'Delhi',
        state: 'Delhi',
        homeDelivery: true,
        acceptCOD: true,
        orderUpdates: true
      };
      
      const formData = new FormData();
      Object.entries(testData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
      
      const response = await axios.post(`${BASE_URL}/api/pharmacy/complete-profile`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('✅ Complete profile:', response.data);
    } catch (error) {
      console.log('❌ Complete profile error:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the tests
testPharmacyProfileEndpoints();
