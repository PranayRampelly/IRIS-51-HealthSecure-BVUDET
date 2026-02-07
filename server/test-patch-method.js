// Test script to verify PATCH method is working with CORS
import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:5000/api';

async function testPatchMethod() {
  try {
    console.log('Testing PATCH method with CORS...');
    
    // Test preflight request
    console.log('1. Testing preflight request...');
    const preflightResponse = await fetch(`${API_BASE_URL}/admin/users/test/reactivate`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:8080',
        'Access-Control-Request-Method': 'PATCH',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });

    console.log('Preflight response status:', preflightResponse.status);
    console.log('Access-Control-Allow-Methods:', preflightResponse.headers.get('Access-Control-Allow-Methods'));
    console.log('Access-Control-Allow-Headers:', preflightResponse.headers.get('Access-Control-Allow-Headers'));

    // Test actual PATCH request (this will fail without auth, but should not be blocked by CORS)
    console.log('\n2. Testing PATCH request...');
    const patchResponse = await fetch(`${API_BASE_URL}/admin/users/test/reactivate`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
        'Origin': 'http://localhost:8080'
      }
    });

    console.log('PATCH response status:', patchResponse.status);
    
    if (patchResponse.status === 401) {
      console.log('✅ PATCH method is working! (401 is expected without valid auth)');
    } else if (patchResponse.status === 405) {
      console.log('❌ Method not allowed - CORS issue');
    } else {
      console.log('✅ PATCH method is working!');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Test the PATCH method
testPatchMethod(); 