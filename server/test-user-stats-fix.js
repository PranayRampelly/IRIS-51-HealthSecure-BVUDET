// Test script to verify user stats endpoint fix
import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:5000/api';

async function testUserStats() {
  try {
    console.log('Testing user stats endpoint...');
    
    const response = await fetch(`${API_BASE_URL}/admin/users/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add a test admin token if needed
        // 'Authorization': 'Bearer your-test-token'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ User stats endpoint working correctly!');
      console.log('Response:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ User stats endpoint failed:');
      console.log('Status:', response.status);
      console.log('Error:', errorText);
    }
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Test the endpoint
testUserStats(); 