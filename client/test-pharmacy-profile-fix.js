#!/usr/bin/env node

// Test script to verify pharmacy profile completion fix
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

// Test data that previously caused the error
const testProfileData = {
  businessName: 'Test Pharmacy',
  licenseNumber: 'LIC123456',
  address: '123 Test Street',
  city: 'Test City',
  state: 'Test State',
  phone: '1234567890',
  description: 'A test pharmacy',
  pharmacyType: 'retail',
  emergencyServices: '24x7', // This was causing the Boolean casting error
  homeDelivery: 'true',
  acceptCOD: 'false',
  deliveryRadius: '10',
  deliveryCharges: '50',
  taxRate: '18'
};

async function testPharmacyProfileCompletion() {
  try {
    console.log('🧪 Testing pharmacy profile completion with fixed data conversion...');
    
    // First, try to login as a pharmacy user (you'll need valid credentials)
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'ayush@pharmacy.com', // Replace with actual pharmacy email
        password: 'password123' // Replace with actual password
      })
    });

    if (!loginResponse.ok) {
      console.log('⚠️  Login failed - please ensure you have a valid pharmacy user account');
      console.log('Response status:', loginResponse.status);
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login successful');

    // Test the complete-profile endpoint
    const profileResponse = await fetch(`${API_BASE}/pharmacy/complete-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testProfileData)
    });

    const profileResult = await profileResponse.json();

    if (profileResponse.ok) {
      console.log('✅ Profile completion successful!');
      console.log('📊 Profile data:', {
        businessName: profileResult.profile?.businessName,
        emergencyServices: profileResult.profile?.emergencyServices,
        homeDelivery: profileResult.profile?.homeDelivery,
        deliveryRadius: profileResult.profile?.deliveryRadius
      });
      console.log('🎉 The Boolean casting error has been fixed!');
    } else {
      console.log('❌ Profile completion failed:');
      console.log('Status:', profileResponse.status);
      console.log('Error:', profileResult.message);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testPharmacyProfileCompletion();

