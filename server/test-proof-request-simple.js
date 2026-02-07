import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let testRequestId = '';
let testTemplateId = '';

// Test data
const testUser = {
  email: 'admin@healthsecure.com',
  password: 'AdminPass123!'
};

const testProofRequest = {
  patientId: '507f1f77bcf86cd799439011', // Mock patient ID
  proofType: 'medical-certificate',
  urgency: 'high',
  priority: 2,
  category: 'emergency',
  dueDate: '2024-02-15T00:00:00.000Z',
  reason: 'Claim verification for recent hospitalization',
  notes: 'Patient was admitted for chest pain',
  autoFollowUp: true,
  notifyPatient: true,
  tags: ['urgent', 'hospitalization']
};

const testTemplate = {
  name: 'Emergency Medical Certificate',
  description: 'Standard template for emergency medical documentation',
  proofType: 'medical-certificate',
  defaultUrgency: 'urgent',
  defaultReason: 'Emergency medical claim verification',
  category: 'emergency',
  defaultPriority: 1,
  defaultDueDays: 3,
  isDefault: true,
  tags: ['emergency', 'medical']
};

// Helper function to make authenticated requests
const makeRequest = async (method, endpoint, data = null, headers = {}) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`Error in ${method} ${endpoint}:`, error.response?.data || error.message);
    throw error;
  }
};

// Test authentication
const testAuth = async () => {
  console.log('\n🔐 Testing Authentication...');
  
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, testUser);
    authToken = response.data.token;
    console.log('✅ Authentication successful');
    return true;
  } catch (error) {
    console.log('❌ Authentication failed:', error.response?.data || error.message);
    return false;
  }
};

// Test proof request creation
const testCreateProofRequest = async () => {
  console.log('\n📝 Testing Proof Request Creation...');
  
  try {
    const response = await makeRequest('POST', '/proof-requests', testProofRequest);
    testRequestId = response.data._id;
    console.log('✅ Proof request created successfully');
    console.log('Request ID:', response.data.requestId);
    return true;
  } catch (error) {
    console.log('❌ Proof request creation failed');
    return false;
  }
};

// Test get all proof requests
const testGetAllProofRequests = async () => {
  console.log('\n📋 Testing Get All Proof Requests...');
  
  try {
    const response = await makeRequest('GET', '/proof-requests');
    console.log('✅ Get all proof requests successful');
    console.log(`Total requests: ${response.data.length}`);
    return true;
  } catch (error) {
    console.log('❌ Get proof requests failed');
    return false;
  }
};

// Test get proof request by ID
const testGetProofRequestById = async () => {
  if (!testRequestId) {
    console.log('⚠️ Skipping - no test request ID available');
    return false;
  }
  
  console.log('\n🔍 Testing Get Proof Request by ID...');
  
  try {
    const response = await makeRequest('GET', `/proof-requests/${testRequestId}`);
    console.log('✅ Get proof request by ID successful');
    return true;
  } catch (error) {
    console.log('❌ Get proof request by ID failed');
    return false;
  }
};

// Test create template
const testCreateTemplate = async () => {
  console.log('\n📋 Testing Create Template...');
  
  try {
    const response = await makeRequest('POST', '/proof-templates', testTemplate);
    testTemplateId = response.data._id;
    console.log('✅ Template created successfully');
    return true;
  } catch (error) {
    console.log('❌ Template creation failed');
    return false;
  }
};

// Test get all templates
const testGetAllTemplates = async () => {
  console.log('\n📋 Testing Get All Templates...');
  
  try {
    const response = await makeRequest('GET', '/proof-templates');
    console.log('✅ Get all templates successful');
    console.log(`Total templates: ${response.data.length}`);
    return true;
  } catch (error) {
    console.log('❌ Get templates failed');
    return false;
  }
};

// Test get analytics
const testGetAnalytics = async () => {
  console.log('\n📊 Testing Get Analytics...');
  
  try {
    const response = await makeRequest('GET', '/proof-requests/analytics');
    console.log('✅ Get analytics successful');
    console.log('Analytics data received');
    return true;
  } catch (error) {
    console.log('❌ Get analytics failed');
    return false;
  }
};

// Run all tests
const runTests = async () => {
  console.log('🚀 Starting Simple Proof Request API Tests...\n');
  
  let passed = 0;
  let failed = 0;
  
  // Test authentication first
  const authSuccess = await testAuth();
  if (authSuccess) {
    passed++;
  } else {
    failed++;
    console.log('❌ Cannot proceed without authentication');
    return;
  }
  
  // Test proof requests
  const createSuccess = await testCreateProofRequest();
  if (createSuccess) passed++; else failed++;
  
  const getAllSuccess = await testGetAllProofRequests();
  if (getAllSuccess) passed++; else failed++;
  
  const getByIdSuccess = await testGetProofRequestById();
  if (getByIdSuccess) passed++; else failed++;
  
  // Test templates
  const createTemplateSuccess = await testCreateTemplate();
  if (createTemplateSuccess) passed++; else failed++;
  
  const getAllTemplatesSuccess = await testGetAllTemplates();
  if (getAllTemplatesSuccess) passed++; else failed++;
  
  // Test analytics
  const analyticsSuccess = await testGetAnalytics();
  if (analyticsSuccess) passed++; else failed++;
  
  // Print results
  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! The API is working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the implementation.');
  }
};

// Run the tests
runTests().catch(console.error); 