import fetch from 'node-fetch';

async function testBloodBankLogin() {
  const loginData = {
    email: 'test.bloodbank@example.com',
    password: 'TestPass123!',
    role: 'bloodbank'
  };

  try {
    console.log('🧪 Testing bloodbank login...');
    console.log('📝 Login data:', JSON.stringify(loginData, null, 2));

    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });

    const result = await response.json();
    
    console.log('📊 Response status:', response.status);
    console.log('📄 Response body:', JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log('✅ Bloodbank login test passed!');
      console.log('🔑 Token received:', result.token ? 'Yes' : 'No');
      console.log('👤 User role:', result.user?.role);
      console.log('📧 Email verified:', result.user?.isEmailVerified);
    } else {
      console.log('❌ Bloodbank login test failed!');
      console.log('🔍 Error details:', result.message || result);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testBloodBankLogin();
