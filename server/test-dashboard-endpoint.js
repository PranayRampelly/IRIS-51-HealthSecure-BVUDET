import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

async function testDashboardEndpoint() {
  try {
    console.log('🔍 Testing hospital dashboard endpoint...');
    
    const response = await fetch('http://localhost:5000/api/hospital/dashboard', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      }
    });

    console.log('📡 Dashboard response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Dashboard data received:', JSON.stringify(data, null, 2));
    } else {
      const errorData = await response.text();
      console.log('❌ Dashboard error:', errorData);
    }
  } catch (error) {
    console.error('❌ Error testing dashboard:', error);
  }
}

testDashboardEndpoint(); 