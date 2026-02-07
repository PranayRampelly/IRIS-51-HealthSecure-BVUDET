import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:8080/api/blood-requests';

async function testBloodRequestAPI() {
  console.log('🧪 Testing Blood Request API...\n');

  try {
    // Test 1: Get request summary
    console.log('1. Testing GET /summary');
    const summaryResponse = await fetch(`${BASE_URL}/summary`);
    const summaryData = await summaryResponse.json();
    console.log('✅ Summary Response:', summaryData);
    console.log('');

    // Test 2: Get all requests
    console.log('2. Testing GET /');
    const requestsResponse = await fetch(`${BASE_URL}/`);
    const requestsData = await requestsResponse.json();
    console.log('✅ Requests Response:', requestsData);
    console.log('');

    // Test 3: Get urgent requests
    console.log('3. Testing GET /urgent');
    const urgentResponse = await fetch(`${BASE_URL}/urgent`);
    const urgentData = await urgentResponse.json();
    console.log('✅ Urgent Requests Response:', urgentData);
    console.log('');

    // Test 4: Get requests by blood type
    console.log('4. Testing GET /by-blood-type?bloodType=O+');
    const bloodTypeResponse = await fetch(`${BASE_URL}/by-blood-type?bloodType=O+`);
    const bloodTypeData = await bloodTypeResponse.json();
    console.log('✅ Blood Type Response:', bloodTypeData);
    console.log('');

    // Test 5: Get analytics
    console.log('5. Testing GET /analytics');
    const analyticsResponse = await fetch(`${BASE_URL}/analytics`);
    const analyticsData = await analyticsResponse.json();
    console.log('✅ Analytics Response:', analyticsData);
    console.log('');

    // Test 6: Export requests
    console.log('6. Testing GET /export?format=json');
    const exportResponse = await fetch(`${BASE_URL}/export?format=json`);
    const exportData = await exportResponse.json();
    console.log('✅ Export Response:', exportData);
    console.log('');

    console.log('🎉 All Blood Request API tests completed successfully!');

  } catch (error) {
    console.error('❌ Error testing Blood Request API:', error.message);
  }
}

// Run the tests
testBloodRequestAPI();
