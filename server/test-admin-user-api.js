import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5000/api';
let adminToken = '';
let testUserId = '';

// Test configuration
const testUser = {
  email: 'test.user@example.com',
  password: 'TestPass123!',
  firstName: 'Test',
  lastName: 'User',
  role: 'patient',
  phone: '+1234567890',
  dateOfBirth: '1990-01-01',
  gender: 'Male',
  bloodType: 'A+'
};

const testDoctor = {
  email: 'test.doctor@example.com',
  password: 'TestPass123!',
  firstName: 'Test',
  lastName: 'Doctor',
  role: 'doctor',
  phone: '+1234567891',
  licenseNumber: 'MD123456',
  specialization: 'Cardiology',
  hospital: 'Test Hospital'
};

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
    const data = await response.json();
    
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

async function testGetUserStats() {
  console.log('\n=== Testing Get User Statistics ===');
  
  const result = await makeRequest('/admin/users/stats');
  
  if (result.success) {
    console.log('✅ User statistics retrieved successfully');
    console.log('Stats:', JSON.stringify(result.data, null, 2));
    return true;
  } else {
    console.log('❌ Failed to get user statistics');
    return false;
  }
}

async function testListUsers() {
  console.log('\n=== Testing List Users ===');
  
  const result = await makeRequest('/admin/users?page=1&limit=5');
  
  if (result.success) {
    console.log('✅ Users list retrieved successfully');
    console.log(`Found ${result.data.users.length} users`);
    console.log(`Total users: ${result.data.pagination.totalUsers}`);
    return true;
  } else {
    console.log('❌ Failed to list users');
    return false;
  }
}

async function testCreateUser() {
  console.log('\n=== Testing Create User ===');
  
  const formData = new FormData();
  formData.append('email', testUser.email);
  formData.append('password', testUser.password);
  formData.append('firstName', testUser.firstName);
  formData.append('lastName', testUser.lastName);
  formData.append('role', testUser.role);
  formData.append('phone', testUser.phone);
  formData.append('dateOfBirth', testUser.dateOfBirth);
  formData.append('gender', testUser.gender);
  formData.append('bloodType', testUser.bloodType);

  const result = await makeRequest('/admin/users', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`
    },
    body: formData
  });

  if (result.success) {
    testUserId = result.data.user._id;
    console.log('✅ User created successfully');
    console.log('User ID:', testUserId);
    return true;
  } else {
    console.log('❌ Failed to create user');
    return false;
  }
}

async function testCreateDoctor() {
  console.log('\n=== Testing Create Doctor ===');
  
  const formData = new FormData();
  formData.append('email', testDoctor.email);
  formData.append('password', testDoctor.password);
  formData.append('firstName', testDoctor.firstName);
  formData.append('lastName', testDoctor.lastName);
  formData.append('role', testDoctor.role);
  formData.append('phone', testDoctor.phone);
  formData.append('licenseNumber', testDoctor.licenseNumber);
  formData.append('specialization', testDoctor.specialization);
  formData.append('hospital', testDoctor.hospital);

  const result = await makeRequest('/admin/users', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`
    },
    body: formData
  });

  if (result.success) {
    console.log('✅ Doctor created successfully');
    console.log('Doctor ID:', result.data.user._id);
    return true;
  } else {
    console.log('❌ Failed to create doctor');
    return false;
  }
}

async function testGetUserById() {
  console.log('\n=== Testing Get User by ID ===');
  
  if (!testUserId) {
    console.log('❌ No test user ID available');
    return false;
  }

  const result = await makeRequest(`/admin/users/${testUserId}`);
  
  if (result.success) {
    console.log('✅ User details retrieved successfully');
    console.log('User:', JSON.stringify(result.data, null, 2));
    return true;
  } else {
    console.log('❌ Failed to get user details');
    return false;
  }
}

async function testUpdateUser() {
  console.log('\n=== Testing Update User ===');
  
  if (!testUserId) {
    console.log('❌ No test user ID available');
    return false;
  }

  const formData = new FormData();
  formData.append('firstName', 'Updated');
  formData.append('lastName', 'Name');
  formData.append('phone', '+1987654321');

  const result = await makeRequest(`/admin/users/${testUserId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${adminToken}`
    },
    body: formData
  });

  if (result.success) {
    console.log('✅ User updated successfully');
    console.log('Updated user:', JSON.stringify(result.data.user, null, 2));
    return true;
  } else {
    console.log('❌ Failed to update user');
    return false;
  }
}

async function testDeleteUser() {
  console.log('\n=== Testing Delete User ===');
  
  if (!testUserId) {
    console.log('❌ No test user ID available');
    return false;
  }

  const result = await makeRequest(`/admin/users/${testUserId}`, {
    method: 'DELETE'
  });

  if (result.success) {
    console.log('✅ User deleted successfully');
    return true;
  } else {
    console.log('❌ Failed to delete user');
    return false;
  }
}

async function testReactivateUser() {
  console.log('\n=== Testing Reactivate User ===');
  
  if (!testUserId) {
    console.log('❌ No test user ID available');
    return false;
  }

  const result = await makeRequest(`/admin/users/${testUserId}/reactivate`, {
    method: 'PATCH'
  });

  if (result.success) {
    console.log('✅ User reactivated successfully');
    return true;
  } else {
    console.log('❌ Failed to reactivate user');
    return false;
  }
}

async function testSearchAndFilter() {
  console.log('\n=== Testing Search and Filter ===');
  
  const searchQueries = [
    '/admin/users?search=test',
    '/admin/users?role=patient',
    '/admin/users?status=active',
    '/admin/users?sortBy=createdAt&sortOrder=desc',
    '/admin/users?page=1&limit=3'
  ];

  for (const query of searchQueries) {
    const result = await makeRequest(query);
    if (result.success) {
      console.log(`✅ ${query} - Success`);
    } else {
      console.log(`❌ ${query} - Failed`);
    }
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Admin User Management API Tests\n');

  const tests = [
    { name: 'Admin Login', fn: testLogin },
    { name: 'Get User Statistics', fn: testGetUserStats },
    { name: 'List Users', fn: testListUsers },
    { name: 'Create User', fn: testCreateUser },
    { name: 'Create Doctor', fn: testCreateDoctor },
    { name: 'Get User by ID', fn: testGetUserById },
    { name: 'Update User', fn: testUpdateUser },
    { name: 'Delete User', fn: testDeleteUser },
    { name: 'Reactivate User', fn: testReactivateUser },
    { name: 'Search and Filter', fn: testSearchAndFilter }
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
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { runTests }; 