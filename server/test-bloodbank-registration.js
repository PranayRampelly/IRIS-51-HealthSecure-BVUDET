import fetch from 'node-fetch';

async function testBloodBankRegistration() {
  const testData = {
    firstName: 'Test',
    lastName: 'BloodBank',
    email: 'test.bloodbank@example.com',
    password: 'TestPass123!',
    role: 'bloodbank',
    bloodBankName: 'Test Blood Bank',
    bloodBankType: 'Standalone Blood Bank',
    bloodBankLicense: 'BB123456',
    address: '123 Test Street, Test City',
    phone: '+91-9876543210',
    emergencyContact: '+91-9876543211'
  };

  try {
    console.log('🧪 Testing bloodbank registration...');
    console.log('📝 Test data:', JSON.stringify(testData, null, 2));

    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    console.log('📊 Response status:', response.status);
    console.log('📄 Response body:', JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log('✅ Bloodbank registration test passed!');
    } else {
      console.log('❌ Bloodbank registration test failed!');
      console.log('🔍 Error details:', result.message || result);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testBloodBankRegistration();
