import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

const testSimpleLogin = async () => {
  try {
    console.log('🔐 Testing simple login...');
    
    // Test with minimal data
    const loginData = {
      email: 'admin@healthsecure.com',
      password: 'AdminPass123!'
    };
    
    console.log('Request data:', JSON.stringify(loginData, null, 2));
    
    const response = await axios.post(`${BASE_URL}/auth/login`, loginData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Login successful!');
    console.log('Status:', response.status);
    console.log('Response:', response.data);
    
  } catch (error) {
    console.log('❌ Login failed:');
    console.log('Status:', error.response?.status);
    console.log('Status Text:', error.response?.statusText);
    console.log('Headers:', error.response?.headers);
    console.log('Data:', error.response?.data);
    console.log('Message:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Connection refused - server might not be running');
    }
  }
};

testSimpleLogin(); 