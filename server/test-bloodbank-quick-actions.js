// Test file for blood bank quick actions
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
const TOKEN = 'YOUR_BLOODBANK_TOKEN_HERE'; // Replace with actual token

// Test configuration
const config = {
    headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
    }
};

async function testGetDashboardStats() {
    console.log('\n=== Testing Get Dashboard Stats ===');
    try {
        const response = await axios.get(`${BASE_URL}/api/bloodbank/dashboard/stats`, config);
        console.log('✓ Dashboard stats retrieved successfully');
        console.log('Stats:', JSON.stringify(response.data, null, 2));
        return true;
    } catch (error) {
        console.error('✗ Failed to get dashboard stats:', error.response?.data || error.message);
        return false;
    }
}

async function testCreateQuickRequest() {
    console.log('\n=== Testing Create Quick Blood Request ===');
    try {
        const requestData = {
            bloodType: 'O+',
            componentType: 'Whole Blood',
            quantity: 2,
            urgency: 'Routine'
        };

        const response = await axios.post(
            `${BASE_URL}/api/bloodbank/dashboard/quick-request`,
            requestData,
            config
        );

        console.log('✓ Quick blood request created successfully');
        console.log('Request:', JSON.stringify(response.data, null, 2));
        return response.data.data;
    } catch (error) {
        console.error('✗ Failed to create quick request:', error.response?.data || error.message);
        return null;
    }
}

async function testRegisterQuickDonor() {
    console.log('\n=== Testing Register Quick Donor ===');
    try {
        const donorData = {
            firstName: 'Test',
            lastName: 'Donor',
            bloodType: 'A+',
            phone: '9876543210',
            email: `testdonor${Date.now()}@example.com`,
            dateOfBirth: '1990-01-01',
            gender: 'Male',
            weight: 70,
            height: 175
        };

        const response = await axios.post(
            `${BASE_URL}/api/bloodbank/dashboard/quick-donor`,
            donorData,
            config
        );

        console.log('✓ Quick donor registered successfully');
        console.log('Donor:', JSON.stringify(response.data, null, 2));
        return response.data.data;
    } catch (error) {
        console.error('✗ Failed to register quick donor:', error.response?.data || error.message);
        return null;
    }
}

async function testGenerateQuickReport() {
    console.log('\n=== Testing Generate Quick Report ===');
    try {
        const response = await axios.post(
            `${BASE_URL}/api/bloodbank/dashboard/quick-report`,
            { reportType: 'dashboard_summary' },
            config
        );

        console.log('✓ Quick report generated successfully');
        console.log('Report:', JSON.stringify(response.data, null, 2));
        return true;
    } catch (error) {
        console.error('✗ Failed to generate quick report:', error.response?.data || error.message);
        return false;
    }
}

async function testGetRecentActivity() {
    console.log('\n=== Testing Get Recent Activity ===');
    try {
        const response = await axios.get(`${BASE_URL}/api/bloodbank/dashboard/activity`, config);
        console.log('✓ Recent activity retrieved successfully');
        console.log('Activity:', JSON.stringify(response.data, null, 2));
        return true;
    } catch (error) {
        console.error('✗ Failed to get recent activity:', error.response?.data || error.message);
        return false;
    }
}

async function runAllTests() {
    console.log('========================================');
    console.log('Blood Bank Quick Actions API Tests');
    console.log('========================================');

    if (!TOKEN || TOKEN === 'YOUR_BLOODBANK_TOKEN_HERE') {
        console.error('\n⚠️  Please set a valid blood bank token in the TOKEN variable');
        console.log('You can get a token by logging in as a blood bank user');
        return;
    }

    const results = {
        dashboardStats: await testGetDashboardStats(),
        quickRequest: await testCreateQuickRequest(),
        quickDonor: await testRegisterQuickDonor(),
        quickReport: await testGenerateQuickReport(),
        recentActivity: await testGetRecentActivity()
    };

    console.log('\n========================================');
    console.log('Test Results Summary');
    console.log('========================================');
    console.log(`Dashboard Stats: ${results.dashboardStats ? '✓ PASSED' : '✗ FAILED'}`);
    console.log(`Quick Request: ${results.quickRequest ? '✓ PASSED' : '✗ FAILED'}`);
    console.log(`Quick Donor: ${results.quickDonor ? '✓ PASSED' : '✗ FAILED'}`);
    console.log(`Quick Report: ${results.quickReport ? '✓ PASSED' : '✗ FAILED'}`);
    console.log(`Recent Activity: ${results.recentActivity ? '✓ PASSED' : '✗ FAILED'}`);

    const passedTests = Object.values(results).filter(r => r).length;
    const totalTests = Object.keys(results).length;

    console.log(`\nTotal: ${passedTests}/${totalTests} tests passed`);
    console.log('========================================\n');
}

// Run tests
runAllTests().catch(console.error);
