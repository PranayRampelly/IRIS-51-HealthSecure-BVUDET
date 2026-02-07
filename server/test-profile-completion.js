import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

async function testProfileCompletion() {
  try {
    // Create a test JWT token for the hospital user
    const payload = {
      id: 'test-hospital-id',
      email: 'siddheshharwande8@gmail.com',
      role: 'hospital'
    };
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('🔑 Generated test token:', token.substring(0, 50) + '...');

    // Test the profile completion endpoint
    const response = await fetch('http://localhost:5000/api/hospital/profile-completion', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Profile completion data:', JSON.stringify(data, null, 2));
    } else {
      const errorData = await response.text();
      console.log('❌ Error response:', errorData);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testProfileCompletion(); 