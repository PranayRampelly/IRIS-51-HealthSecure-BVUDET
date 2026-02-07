import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:8080/api/blood-inventory';

async function testBloodInventoryAPI() {
  console.log('🧪 Testing Blood Inventory API...\n');

  try {
    // Test 1: Get inventory summary
    console.log('1. Testing GET /summary');
    const summaryResponse = await fetch(`${BASE_URL}/summary`);
    if (summaryResponse.ok) {
      const summaryData = await summaryResponse.json();
      console.log('✅ Summary endpoint working:', summaryData.message);
    } else {
      console.log('❌ Summary endpoint failed:', summaryResponse.status, summaryResponse.statusText);
    }

    // Test 2: Get blood units
    console.log('\n2. Testing GET /units');
    const unitsResponse = await fetch(`${BASE_URL}/units`);
    if (unitsResponse.ok) {
      const unitsData = await unitsResponse.json();
      console.log('✅ Units endpoint working:', unitsData.message);
    } else {
      console.log('❌ Units endpoint failed:', unitsResponse.status, unitsResponse.statusText);
    }

    // Test 3: Get expiring units
    console.log('\n3. Testing GET /expiring');
    const expiringResponse = await fetch(`${BASE_URL}/expiring?days=7`);
    if (expiringResponse.ok) {
      const expiringData = await expiringResponse.json();
      console.log('✅ Expiring units endpoint working:', expiringData.message);
    } else {
      console.log('❌ Expiring units endpoint failed:', expiringResponse.status, expiringResponse.statusText);
    }

    // Test 4: Get critical stock
    console.log('\n4. Testing GET /critical-stock');
    const criticalResponse = await fetch(`${BASE_URL}/critical-stock?minimumUnits=10`);
    if (criticalResponse.ok) {
      const criticalData = await criticalResponse.json();
      console.log('✅ Critical stock endpoint working:', criticalData.message);
    } else {
      console.log('❌ Critical stock endpoint failed:', criticalResponse.status, criticalResponse.statusText);
    }

    // Test 5: Get analytics
    console.log('\n5. Testing GET /analytics');
    const analyticsResponse = await fetch(`${BASE_URL}/analytics?timeframe=month`);
    if (analyticsResponse.ok) {
      const analyticsData = await analyticsResponse.json();
      console.log('✅ Analytics endpoint working:', analyticsData.message);
    } else {
      console.log('❌ Analytics endpoint failed:', analyticsResponse.status, analyticsResponse.statusText);
    }

    console.log('\n🎉 Blood Inventory API testing completed!');

  } catch (error) {
    console.error('❌ Error testing Blood Inventory API:', error.message);
  }
}

// Run the test
testBloodInventoryAPI();
