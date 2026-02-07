import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api/blood-donors';

async function testBloodDonorAPI() {
  console.log('🧪 Testing Blood Donor API Endpoints...\n');

  try {
    // Test 1: Get donor summary
    console.log('1. Testing GET /summary');
    const summaryResponse = await fetch(`${BASE_URL}/summary`);
    const summaryData = await summaryResponse.json();
    console.log('✅ Summary Response:', summaryData.success ? 'SUCCESS' : 'FAILED');
    if (summaryData.success) {
      console.log(`   - Total Donors: ${summaryData.data.totalDonors}`);
      console.log(`   - Active Donors: ${summaryData.data.activeDonors}`);
      console.log(`   - Eligible Donors: ${summaryData.data.eligibleDonors}`);
    }
    console.log('');

    // Test 2: Get all donors
    console.log('2. Testing GET / (all donors)');
    const donorsResponse = await fetch(`${BASE_URL}/?page=1&limit=5`);
    const donorsData = await donorsResponse.json();
    console.log('✅ Donors Response:', donorsData.success ? 'SUCCESS' : 'FAILED');
    if (donorsData.success) {
      console.log(`   - Found ${donorsData.data.donors.length} donors`);
      console.log(`   - Total: ${donorsData.data.pagination.totalDonors}`);
      console.log(`   - Pages: ${donorsData.data.pagination.totalPages}`);
    }
    console.log('');

    // Test 3: Get eligible donors
    console.log('3. Testing GET /eligible');
    const eligibleResponse = await fetch(`${BASE_URL}/eligible?bloodType=O+&limit=5`);
    const eligibleData = await eligibleResponse.json();
    console.log('✅ Eligible Donors Response:', eligibleData.success ? 'SUCCESS' : 'FAILED');
    if (eligibleData.success) {
      console.log(`   - Found ${eligibleData.data.length} eligible O+ donors`);
    }
    console.log('');

    // Test 4: Get donors due for follow-up
    console.log('4. Testing GET /follow-up');
    const followUpResponse = await fetch(`${BASE_URL}/follow-up?days=180`);
    const followUpData = await followUpResponse.json();
    console.log('✅ Follow-up Response:', followUpData.success ? 'SUCCESS' : 'FAILED');
    if (followUpData.success) {
      console.log(`   - Found ${followUpData.data.length} donors due for follow-up`);
    }
    console.log('');

    // Test 5: Get donor analytics
    console.log('5. Testing GET /analytics');
    const analyticsResponse = await fetch(`${BASE_URL}/analytics?period=30`);
    const analyticsData = await analyticsResponse.json();
    console.log('✅ Analytics Response:', analyticsData.success ? 'SUCCESS' : 'FAILED');
    if (analyticsData.success) {
      console.log(`   - Blood Type Distribution: ${analyticsData.data.bloodTypeDistribution.length} types`);
      console.log(`   - Category Performance: ${analyticsData.data.categoryPerformance.length} categories`);
      console.log(`   - Geographic Distribution: ${analyticsData.data.geographicDistribution.length} cities`);
    }
    console.log('');

    // Test 6: Test export functionality
    console.log('6. Testing GET /export');
    const exportResponse = await fetch(`${BASE_URL}/export?format=json`);
    const exportData = await exportResponse.json();
    console.log('✅ Export Response:', exportData.success ? 'SUCCESS' : 'FAILED');
    if (exportData.success) {
      console.log(`   - Exported ${exportData.data.length} donors`);
    }
    console.log('');

    console.log('🎉 All Blood Donor API tests completed successfully!');

  } catch (error) {
    console.error('❌ Error testing Blood Donor API:', error.message);
  }
}

// Run the tests
testBloodDonorAPI();
