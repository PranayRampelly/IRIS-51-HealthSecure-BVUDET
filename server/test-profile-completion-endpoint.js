import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

async function testProfileCompletionEndpoint() {
  try {
    console.log('🔍 Testing hospital profile completion endpoint...');
    
    const testProfileData = {
      hospitalName: 'Test Hospital',
      hospitalType: 'general',
      licenseNumber: 'TEST123',
      phone: '1234567890',
      emergencyContact: 'Emergency Contact',
      address: {
        street: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
        country: 'United States'
      },
      description: 'Test hospital description',
      totalBeds: 100,
      departments: 5,
      staffCount: 50,
      insuranceAccepted: ['Medicare', 'Medicaid'],
      documents: []
    };
    
    const response = await fetch('http://localhost:5000/api/hospital/profile/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify(testProfileData)
    });

    console.log('📡 Profile completion response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Profile completion successful:', data);
    } else {
      const errorData = await response.text();
      console.log('❌ Profile completion error:', errorData);
    }
  } catch (error) {
    console.error('❌ Error testing profile completion:', error);
  }
}

testProfileCompletionEndpoint(); 