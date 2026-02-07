import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

async function testLoginAndProfileCompletion() {
  try {
    // Step 1: Login as hospital user
    console.log('🔐 Logging in as hospital user...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'siddheshharwande8@gmail.com',
        password: 'password123', // Use the actual password
        role: 'hospital'
      })
    });

    console.log('📡 Login response status:', loginResponse.status);

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Login successful');
      console.log('🔑 Token received:', loginData.token ? 'Yes' : 'No');
      
      if (loginData.token) {
        // Step 2: Test profile completion API with valid token
        console.log('\n🏥 Testing profile completion API...');
        const profileResponse = await fetch('http://localhost:5000/api/hospital/profile-completion', {
          headers: {
            'Authorization': `Bearer ${loginData.token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('📡 Profile completion response status:', profileResponse.status);

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          console.log('✅ Profile completion data:', JSON.stringify(profileData, null, 2));
        } else {
          const errorData = await profileResponse.text();
          console.log('❌ Profile completion error:', errorData);
        }
      }
    } else {
      const errorData = await loginResponse.text();
      console.log('❌ Login error:', errorData);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testLoginAndProfileCompletion(); 