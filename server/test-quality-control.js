import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';
const BLOOD_BANK_ID = '507f1f77bcf86cd799439011'; // Mock blood bank ID

// Test quality control summary
async function testQualitySummary() {
  try {
    console.log('🔍 Testing Quality Control Summary...');
    const response = await fetch(`${BASE_URL}/quality-control/summary/${BLOOD_BANK_ID}`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Quality Control Summary:', data);
    } else {
      console.log('❌ Quality Control Summary Error:', data);
    }
  } catch (error) {
    console.error('❌ Quality Control Summary Error:', error.message);
  }
}

// Test get quality controls
async function testGetQualityControls() {
  try {
    console.log('🔍 Testing Get Quality Controls...');
    const response = await fetch(`${BASE_URL}/quality-control/${BLOOD_BANK_ID}?page=1&limit=5`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Get Quality Controls:', data);
    } else {
      console.log('❌ Get Quality Controls Error:', data);
    }
  } catch (error) {
    console.error('❌ Get Quality Controls Error:', error.message);
  }
}

// Test failed tests
async function testFailedTests() {
  try {
    console.log('🔍 Testing Failed Tests...');
    const response = await fetch(`${BASE_URL}/quality-control/failed-tests/${BLOOD_BANK_ID}?days=30`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Failed Tests:', data);
    } else {
      console.log('❌ Failed Tests Error:', data);
    }
  } catch (error) {
    console.error('❌ Failed Tests Error:', error.message);
  }
}

// Test expiring quality tests
async function testExpiringQualityTests() {
  try {
    console.log('🔍 Testing Expiring Quality Tests...');
    const response = await fetch(`${BASE_URL}/quality-control/expiring/${BLOOD_BANK_ID}?days=7`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Expiring Quality Tests:', data);
    } else {
      console.log('❌ Expiring Quality Tests Error:', data);
    }
  } catch (error) {
    console.error('❌ Expiring Quality Tests Error:', error.message);
  }
}

// Test quality analytics
async function testQualityAnalytics() {
  try {
    console.log('🔍 Testing Quality Analytics...');
    const startDate = '2024-01-01';
    const endDate = '2024-01-31';
    const response = await fetch(`${BASE_URL}/quality-control/analytics/${BLOOD_BANK_ID}?startDate=${startDate}&endDate=${endDate}`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Quality Analytics:', data);
    } else {
      console.log('❌ Quality Analytics Error:', data);
    }
  } catch (error) {
    console.error('❌ Quality Analytics Error:', error.message);
  }
}

// Test compliance report
async function testComplianceReport() {
  try {
    console.log('🔍 Testing Compliance Report...');
    const startDate = '2024-01-01';
    const endDate = '2024-01-31';
    const response = await fetch(`${BASE_URL}/quality-control/compliance/${BLOOD_BANK_ID}?startDate=${startDate}&endDate=${endDate}`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Compliance Report:', data);
    } else {
      console.log('❌ Compliance Report Error:', data);
    }
  } catch (error) {
    console.error('❌ Compliance Report Error:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Quality Control API Tests...\n');
  
  await testQualitySummary();
  console.log('');
  
  await testGetQualityControls();
  console.log('');
  
  await testFailedTests();
  console.log('');
  
  await testExpiringQualityTests();
  console.log('');
  
  await testQualityAnalytics();
  console.log('');
  
  await testComplianceReport();
  console.log('');
  
  console.log('✅ Quality Control API Tests Completed!');
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error);
}

export {
  testQualitySummary,
  testGetQualityControls,
  testFailedTests,
  testExpiringQualityTests,
  testQualityAnalytics,
  testComplianceReport,
  runAllTests
};
