import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

const testLoginNoValidation = async () => {
  try {
    console.log('🔐 Testing login with different data formats...');
    
    // Test 1: Normal format
    console.log('\n1. Testing normal format...');
    try {
      const response1 = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'admin@healthsecure.com',
        password: 'AdminPass123!'
      });
      console.log('✅ Normal format successful:', response1.data);
      return;
    } catch (error) {
      console.log('❌ Normal format failed:', error.response?.data);
    }
    
    // Test 2: With extra fields
    console.log('\n2. Testing with extra fields...');
    try {
      const response2 = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'admin@healthsecure.com',
        password: 'AdminPass123!',
        role: 'admin',
        device: 'test'
      });
      console.log('✅ Extra fields successful:', response2.data);
      return;
    } catch (error) {
      console.log('❌ Extra fields failed:', error.response?.data);
    }
    
    // Test 3: Test the test endpoint
    console.log('\n3. Testing JSON parsing endpoint...');
    try {
      const response3 = await axios.post(`${BASE_URL}/auth/test-json`, {
        email: 'admin@healthsecure.com',
        password: 'AdminPass123!'
      });
      console.log('✅ JSON parsing test successful:', response3.data);
    } catch (error) {
      console.log('❌ JSON parsing test failed:', error.response?.data);
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
};

testLoginNoValidation(); 