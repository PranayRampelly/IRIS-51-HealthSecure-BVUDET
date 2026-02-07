import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';

const BASE_URL = 'http://localhost:5000/api';
let adminToken = '';
let testUserIds = [];

// Test configuration
const testEndpoints = [
  { name: 'Get All Users', path: '/admin/users' },
  { name: 'Get User Stats', path: '/admin/users/stats' },
  { name: 'Get User Suggestions', path: '/admin/users/suggestions' },
  { name: 'Export Users', path: '/admin/users/export' },
  { name: 'Create User', path: '/admin/users', method: 'POST' },
  { name: 'Update User', path: '/admin/users/:id', method: 'PUT' },
  { name: 'Delete User', path: '/admin/users/:id', method: 'DELETE' },
  { name: 'Reactivate User', path: '/admin/users/:id/reactivate', method: 'PATCH' },
  { name: 'Get User Activity', path: '/admin/users/:id/activity' },
  { name: 'Bulk Operations', path: '/admin/users/bulk', method: 'POST' }
];

// Helper function to make authenticated requests
async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  }

  try {
    const response = await fetch(url, config);
    let data;
    
    // Handle different response types
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else if (contentType && contentType.includes('text/csv')) {
      data = await response.text();
    } else {
      data = await response.text();
    }
    
    console.log(`${options.method || 'GET'} ${endpoint} - Status: ${response.status}`);
    
    if (!response.ok) {
      console.error('Error:', data);
      return { success: false, data };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error(`Request failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Test functions
async function testLogin() {
  console.log('\n=== Testing Admin Login ===');
  
  const loginData = {
    email: 'admin@healthsecure.com', // Replace with actual admin email
    password: 'AdminPass123!' // Replace with actual admin password
  };

  const result = await makeRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(loginData)
  });

  if (result.success) {
    adminToken = result.data.token;
    console.log('✅ Admin login successful');
    return true;
  } else {
    console.log('❌ Admin login failed');
    return false;
  }
}

async function testGetAllUsers() {
  console.log('\n=== Testing Get All Users ===');
  
  const result = await makeRequest('/admin/users');
  
  if (result.success) {
    console.log('✅ Get all users successful');
    
    const data = result.data;
    console.log(`📊 Total Users: ${data.pagination.totalUsers}`);
    console.log(`📄 Current Page: ${data.pagination.currentPage}`);
    console.log(`📋 Users on Page: ${data.users.length}`);
    console.log(`📈 Total Pages: ${data.pagination.totalPages}`);
    
    if (data.users.length > 0) {
      const user = data.users[0];
      console.log(`👤 Sample User: ${user.name} (${user.email})`);
      console.log(`🏷️ Role: ${user.role}, Status: ${user.status}`);
      console.log(`✅ Verified: ${user.verified}`);
      console.log(`📅 Joined: ${user.joinDate}`);
      console.log(`🕐 Last Login: ${user.lastLogin}`);
    }
    
    return true;
  } else {
    console.log('❌ Get all users failed');
    return false;
  }
}

async function testAdvancedFiltering() {
  console.log('\n=== Testing Advanced Filtering ===');
  
  const filters = [
    { name: 'Role Filter', query: '?role=doctor' },
    { name: 'Status Filter', query: '?status=active' },
    { name: 'Search Filter', query: '?search=doctor' },
    { name: 'Verified Filter', query: '?verified=true' },
    { name: 'Combined Filter', query: '?role=doctor&status=active&verified=true' },
    { name: 'Pagination', query: '?page=1&limit=5' },
    { name: 'Sorting', query: '?sortBy=createdAt&sortOrder=desc' }
  ];

  let passedTests = 0;
  let totalTests = filters.length;

  for (const filter of filters) {
    const result = await makeRequest(`/admin/users${filter.query}`);
    if (result.success) {
      console.log(`✅ ${filter.name} - Success`);
      passedTests++;
    } else {
      console.log(`❌ ${filter.name} - Failed`);
    }
  }

  console.log(`\n📊 Advanced Filtering: ${passedTests}/${totalTests} passed`);
  return passedTests === totalTests;
}

async function testGetUserStats() {
  console.log('\n=== Testing Get User Stats ===');
  
  const result = await makeRequest('/admin/users/stats');
  
  if (result.success) {
    console.log('✅ Get user stats successful');
    
    const stats = result.data;
    console.log(`📊 Total Users: ${stats.totalUsers}`);
    console.log(`✅ Active Users: ${stats.activeUsers}`);
    console.log(`📧 Verified Users: ${stats.verifiedUsers}`);
    console.log(`⏳ Pending Users: ${stats.pendingUsers}`);
    console.log(`🚫 Suspended Users: ${stats.suspendedUsers}`);
    console.log(`📈 New Users This Month: ${stats.newUsersThisMonth}`);
    console.log(`🔄 Active Users This Month: ${stats.activeUsersThisMonth}`);
    
    if (stats.roleStats && stats.roleStats.length > 0) {
      console.log('\n📋 Role Distribution:');
      stats.roleStats.forEach(role => {
        console.log(`  ${role._id}: ${role.count} (${role.activeCount} active, ${role.verifiedCount} verified)`);
      });
    }
    
    return true;
  } else {
    console.log('❌ Get user stats failed');
    return false;
  }
}

async function testGetUserSuggestions() {
  console.log('\n=== Testing Get User Suggestions ===');
  
  const queries = ['doctor', 'john', 'admin'];
  let passedTests = 0;
  let totalTests = queries.length;

  for (const query of queries) {
    const result = await makeRequest(`/admin/users/suggestions?q=${query}`);
    if (result.success) {
      console.log(`✅ Suggestions for "${query}" - ${result.data.suggestions.length} results`);
      passedTests++;
    } else {
      console.log(`❌ Suggestions for "${query}" - Failed`);
    }
  }

  console.log(`\n📊 User Suggestions: ${passedTests}/${totalTests} passed`);
  return passedTests === totalTests;
}

async function testExportUsers() {
  console.log('\n=== Testing Export Users ===');
  
  const exportTests = [
    { name: 'JSON Export', query: '?format=json' },
    { name: 'CSV Export', query: '?format=csv' },
    { name: 'Filtered Export', query: '?format=json&role=doctor' }
  ];

  let passedTests = 0;
  let totalTests = exportTests.length;

  for (const test of exportTests) {
    const result = await makeRequest(`/admin/users/export${test.query}`);
    if (result.success) {
      console.log(`✅ ${test.name} - Success`);
      if (test.query.includes('csv')) {
        console.log(`📄 CSV Data Length: ${result.data.length} characters`);
      } else {
        console.log(`📄 JSON Export: ${result.data.totalUsers} users`);
      }
      passedTests++;
    } else {
      console.log(`❌ ${test.name} - Failed`);
    }
  }

  console.log(`\n📊 Export Tests: ${passedTests}/${totalTests} passed`);
  return passedTests === totalTests;
}

async function testCreateUser() {
  console.log('\n=== Testing Create User ===');
  
  const userData = {
    email: `testuser${Date.now()}@example.com`,
    password: 'TestPass123!',
    firstName: 'Test',
    lastName: 'User',
    role: 'doctor',
    phone: '+1 (555) 999-8888',
    dateOfBirth: '1985-05-15',
    gender: 'male',
    specialization: 'Cardiology',
    hospital: 'Test Hospital',
    department: 'Cardiology',
    yearsOfExperience: 5,
    bio: 'Test doctor bio',
    consultationFees: 100,
    emergencyAvailable: true
  };

  const result = await makeRequest('/admin/users', {
    method: 'POST',
    body: JSON.stringify(userData)
  });

  if (result.success) {
    console.log('✅ Create user successful');
    console.log(`👤 Created User: ${result.data.user.firstName} ${result.data.user.lastName}`);
    console.log(`📧 Email: ${result.data.user.email}`);
    console.log(`🏷️ Role: ${result.data.user.role}`);
    console.log(`✅ Active: ${result.data.user.isActive}`);
    console.log(`📧 Verified: ${result.data.user.isEmailVerified}`);
    
    // Store user ID for later tests
    testUserIds.push(result.data.user._id);
    
    return true;
  } else {
    console.log('❌ Create user failed');
    return false;
  }
}

async function testUpdateUser() {
  console.log('\n=== Testing Update User ===');
  
  if (testUserIds.length === 0) {
    console.log('⚠️ No test user available for update test');
    return false;
  }

  const userId = testUserIds[0];
  const updateData = {
    firstName: 'Updated',
    lastName: 'Doctor',
    phone: '+1 (555) 777-6666',
    specialization: 'Neurology',
    hospital: 'Updated Hospital',
    bio: 'Updated doctor bio with more experience'
  };

  const result = await makeRequest(`/admin/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(updateData)
  });

  if (result.success) {
    console.log('✅ Update user successful');
    console.log(`👤 Updated User: ${result.data.user.firstName} ${result.data.user.lastName}`);
    console.log(`📞 New Phone: ${result.data.user.phone}`);
    console.log(`🏥 New Hospital: ${result.data.user.hospital}`);
    console.log(`🧠 New Specialization: ${result.data.user.specialization}`);
    
    return true;
  } else {
    console.log('❌ Update user failed');
    return false;
  }
}

async function testGetUserActivity() {
  console.log('\n=== Testing Get User Activity ===');
  
  if (testUserIds.length === 0) {
    console.log('⚠️ No test user available for activity test');
    return false;
  }

  const userId = testUserIds[0];
  const result = await makeRequest(`/admin/users/${userId}/activity`);

  if (result.success) {
    console.log('✅ Get user activity successful');
    
    const activity = result.data;
    console.log(`👤 User: ${activity.user.lastLoginAt ? 'Has login history' : 'No login history'}`);
    console.log(`📅 Created: ${new Date(activity.user.createdAt).toLocaleDateString()}`);
    console.log(`🔄 Updated: ${new Date(activity.user.updatedAt).toLocaleDateString()}`);
    console.log(`📊 Access Logs: ${activity.accessLogs.length} entries`);
    
    return true;
  } else {
    console.log('❌ Get user activity failed');
    return false;
  }
}

async function testBulkOperations() {
  console.log('\n=== Testing Bulk Operations ===');
  
  if (testUserIds.length === 0) {
    console.log('⚠️ No test users available for bulk operations');
    return false;
  }

  const bulkTests = [
    {
      name: 'Bulk Verify',
      operation: 'verify',
      userIds: testUserIds
    },
    {
      name: 'Bulk Update Role',
      operation: 'update_role',
      userIds: testUserIds,
      data: { role: 'patient' }
    }
  ];

  let passedTests = 0;
  let totalTests = bulkTests.length;

  for (const test of bulkTests) {
    const payload = {
      operation: test.operation,
      userIds: test.userIds,
      ...(test.data && { data: test.data })
    };

    const result = await makeRequest('/admin/users/bulk', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (result.success) {
      console.log(`✅ ${test.name} - Success`);
      console.log(`📊 Modified Count: ${result.data.modifiedCount}`);
      passedTests++;
    } else {
      console.log(`❌ ${test.name} - Failed`);
    }
  }

  console.log(`\n📊 Bulk Operations: ${passedTests}/${totalTests} passed`);
  return passedTests === totalTests;
}

async function testDeleteAndReactivate() {
  console.log('\n=== Testing Delete and Reactivate ===');
  
  if (testUserIds.length === 0) {
    console.log('⚠️ No test user available for delete/reactivate test');
    return false;
  }

  const userId = testUserIds[0];

  // Test delete (soft delete)
  const deleteResult = await makeRequest(`/admin/users/${userId}`, {
    method: 'DELETE'
  });

  if (deleteResult.success) {
    console.log('✅ Delete user successful');
    
    // Test reactivate
    const reactivateResult = await makeRequest(`/admin/users/${userId}/reactivate`, {
      method: 'PATCH'
    });

    if (reactivateResult.success) {
      console.log('✅ Reactivate user successful');
      return true;
    } else {
      console.log('❌ Reactivate user failed');
      return false;
    }
  } else {
    console.log('❌ Delete user failed');
    return false;
  }
}

async function testErrorHandling() {
  console.log('\n=== Testing Error Handling ===');
  
  const errorTests = [
    {
      name: 'Invalid User ID',
      path: '/admin/users/invalid-id',
      expectedStatus: 404
    },
    {
      name: 'Unauthorized Access',
      path: '/admin/users',
      headers: { Authorization: '' },
      expectedStatus: 401
    },
    {
      name: 'Invalid Bulk Operation',
      path: '/admin/users/bulk',
      method: 'POST',
      body: { operation: 'invalid', userIds: [] },
      expectedStatus: 400
    }
  ];

  let passedTests = 0;
  let totalTests = errorTests.length;

  for (const test of errorTests) {
    const config = {
      method: test.method || 'GET',
      headers: test.headers || {}
    };

    if (test.body) {
      config.body = JSON.stringify(test.body);
    }

    const result = await makeRequest(test.path, config);
    
    if (!result.success) {
      console.log(`✅ ${test.name} - Properly handled error`);
      passedTests++;
    } else {
      console.log(`❌ ${test.name} - Error not properly handled`);
    }
  }

  console.log(`\n📊 Error Handling: ${passedTests}/${totalTests} passed`);
  return passedTests === totalTests;
}

async function testPerformance() {
  console.log('\n=== Testing Performance ===');
  
  const performanceTests = [
    { name: 'Get All Users', path: '/admin/users' },
    { name: 'Get User Stats', path: '/admin/users/stats' },
    { name: 'Get User Suggestions', path: '/admin/users/suggestions?q=doctor' },
    { name: 'Export Users JSON', path: '/admin/users/export?format=json' }
  ];

  for (const test of performanceTests) {
    const startTime = Date.now();
    const result = await makeRequest(test.path);
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    if (result.success) {
      console.log(`✅ ${test.name} - ${responseTime}ms`);
    } else {
      console.log(`❌ ${test.name} - Failed (${responseTime}ms)`);
    }
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Enhanced User Management API Tests\n');

  const tests = [
    { name: 'Admin Login', fn: testLogin },
    { name: 'Get All Users', fn: testGetAllUsers },
    { name: 'Advanced Filtering', fn: testAdvancedFiltering },
    { name: 'Get User Stats', fn: testGetUserStats },
    { name: 'Get User Suggestions', fn: testGetUserSuggestions },
    { name: 'Export Users', fn: testExportUsers },
    { name: 'Create User', fn: testCreateUser },
    { name: 'Update User', fn: testUpdateUser },
    { name: 'Get User Activity', fn: testGetUserActivity },
    { name: 'Bulk Operations', fn: testBulkOperations },
    { name: 'Delete and Reactivate', fn: testDeleteAndReactivate },
    { name: 'Error Handling', fn: testErrorHandling },
    { name: 'Performance', fn: testPerformance }
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    try {
      const success = await test.fn();
      if (success) {
        passedTests++;
      }
    } catch (error) {
      console.error(`❌ ${test.name} failed with error:`, error.message);
    }
  }

  console.log('\n=== Test Results ===');
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed!');
  } else {
    console.log('⚠️  Some tests failed. Check the logs above for details.');
  }

  // Cleanup test users
  if (testUserIds.length > 0) {
    console.log('\n🧹 Cleaning up test users...');
    for (const userId of testUserIds) {
      try {
        await makeRequest(`/admin/users/${userId}`, { method: 'DELETE' });
      } catch (error) {
        // Ignore cleanup errors
      }
    }
    console.log('✅ Cleanup completed');
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { runTests }; 