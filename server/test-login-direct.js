import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

const testLogin = async () => {
  try {
    console.log('🔐 Testing login endpoint directly...');
    
    const loginData = {
      email: 'admin@healthsecure.com',
      password: 'AdminPass123!'
    };
    
    console.log('Sending login request with:', loginData);
    
    const response = await axios.post(`${BASE_URL}/auth/login`, loginData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Login successful!');
    console.log('Response:', response.data);
    
    return response.data.token;
    
  } catch (error) {
    console.log('❌ Login failed:');
    console.log('Status:', error.response?.status);
    console.log('Data:', error.response?.data);
    console.log('Message:', error.message);
    return null;
  }
};

testLogin(); 