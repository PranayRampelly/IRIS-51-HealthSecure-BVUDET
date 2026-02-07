const fetch = require('node-fetch');

async function testInsuranceAPI() {
  const baseURL = 'http://localhost:5000/api';
  
  // Test data
  const testClaim = {
    policyId: 'POL-001',
    policyNumber: 'TEST-123',
    policyHolder: 'Test User',
    policyHolderSSN: '123456789',
    insuranceProvider: 'Test Insurance',
    policyType: 'Health',
    claimType: 'medical',
    incidentDate: '2025-01-19',
    reportedDate: '2025-01-19',
    diagnosis: 'Test diagnosis',
    treatmentDescription: 'Test treatment',
    placeOfService: 'office',
    providerName: 'Test Provider',
    claimItems: [],
    totalAmount: 100,
    status: 'draft'
  };

  try {
    console.log('Testing Insurance Claims API...\n');

    // Test 1: Create a new claim
    console.log('1. Creating a new claim...');
    const createResponse = await fetch(`${baseURL}/insurance-claims`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // Replace with actual token
      },
      body: JSON.stringify(testClaim)
    });

    if (createResponse.ok) {
      const createResult = await createResponse.json();
      console.log('✅ Claim created successfully:', createResult.data.claimId);
      
      const claimId = createResult.data.claimId;
      
      // Test 2: Get the claim by ID
      console.log('\n2. Getting claim by ID...');
      const getResponse = await fetch(`${baseURL}/insurance-claims/${claimId}`, {
        headers: {
          'Authorization': 'Bearer YOUR_TOKEN_HERE' // Replace with actual token
        }
      });

      if (getResponse.ok) {
        const getResult = await getResponse.json();
        console.log('✅ Claim retrieved successfully:', getResult.data._id);
      } else {
        console.log('❌ Failed to get claim:', getResponse.status, getResponse.statusText);
        const errorText = await getResponse.text();
        console.log('Error details:', errorText);
      }
      
      // Test 3: Submit the claim
      console.log('\n3. Submitting claim...');
      const submitResponse = await fetch(`${baseURL}/insurance-claims/${claimId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer YOUR_TOKEN_HERE' // Replace with actual token
        }
      });

      if (submitResponse.ok) {
        const submitResult = await submitResponse.json();
        console.log('✅ Claim submitted successfully:', submitResult.data.claimNumber);
      } else {
        console.log('❌ Failed to submit claim:', submitResponse.status, submitResponse.statusText);
        const errorText = await submitResponse.text();
        console.log('Error details:', errorText);
      }
      
    } else {
      console.log('❌ Failed to create claim:', createResponse.status, createResponse.statusText);
      const errorText = await createResponse.text();
      console.log('Error details:', errorText);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testInsuranceAPI(); 