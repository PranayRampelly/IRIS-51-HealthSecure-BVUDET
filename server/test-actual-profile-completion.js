import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

async function testActualProfileCompletion() {
  try {
    console.log('🔍 Testing actual hospital profile completion...');
    
    // First, login to get a real token
    console.log('📡 Logging in...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'siddheshharwande8@gmail.com',
        password: 'password123', // You'll need to use the actual password
        role: 'hospital'
      })
    });

    console.log('📡 Login response status:', loginResponse.status);
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Login successful');
      
      if (loginData.token) {
        console.log('\n🏥 Testing profile completion with real token...');
        
        const testProfileData = {
          hospitalName: 'Podar Hospital',
          hospitalType: 'Specialty Hospital',
          licenseNumber: '238923893822',
          phone: '08392936982',
          emergencyContact: 'Emergency Contact',
          address: {
            street: '123 Test Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400001',
            country: 'India'
          },
          description: 'A leading specialty hospital providing comprehensive healthcare services',
          totalBeds: 200,
          departments: 10,
          staffCount: 150,
          insuranceAccepted: ['Medicare', 'Medicaid'],
          documents: []
        };
        
        const profileResponse = await fetch('http://localhost:5000/api/hospital/profile/complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loginData.token}`
          },
          body: JSON.stringify(testProfileData)
        });
        
        console.log('📡 Profile completion response status:', profileResponse.status);
        
        if (profileResponse.ok) {
          const data = await profileResponse.json();
          console.log('✅ Profile completion successful:', data);
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

testActualProfileCompletion(); 