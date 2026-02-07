import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

const testLoginCurl = async () => {
  try {
    console.log('🔐 Testing login with different approach...');
    
    // Test with explicit JSON string
    const loginData = JSON.stringify({
      email: 'admin@healthsecure.com',
      password: 'AdminPass123!'
    });
    
    console.log('Request data (stringified):', loginData);
    
    const response = await axios({
      method: 'POST',
      url: `${BASE_URL}/auth/login`,
      data: loginData,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      },
      timeout: 10000
    });
    
    console.log('✅ Login successful!');
    console.log('Status:', response.status);
    console.log('Response:', response.data);
    
  } catch (error) {
    console.log('❌ Login failed:');
    console.log('Status:', error.response?.status);
    console.log('Data:', error.response?.data);
    console.log('Message:', error.message);
    
    // Try to get more details about the request
    if (error.config) {
      console.log('Request config:', {
        method: error.config.method,
        url: error.config.url,
        headers: error.config.headers,
        data: error.config.data
      });
    }
  }
};

testLoginCurl(); 