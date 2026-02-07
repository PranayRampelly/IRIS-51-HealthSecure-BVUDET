import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';
let authToken = null;

// Test data
const testProofRequest = {
  title: 'Medical Certificate Request',
  description: 'Need medical certificate for insurance claim',
  category: 'medical',
  priority: 'high',
  requestType: 'document',
  requiredDocuments: ['medical_certificate', 'diagnosis_report'],
  customFields: [
    {
      name: 'patientName',
      type: 'text',
      required: true,
      value: 'John Doe'
    },
    {
      name: 'diagnosis',
      type: 'text',
      required: true,
      value: 'Hypertension'
    }
  ],
  providerId: '507f1f77bcf86cd799439011', // Mock provider ID
  patientId: '507f1f77bcf86cd799439012', // Mock patient ID
  claimId: 'CLM-2024-001',
  policyNumber: 'POL-2024-001',
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
  accessLevel: 'restricted',
  allowedViewers: [],
  tags: ['insurance', 'medical'],
  notes: 'Urgent request for insurance processing'
};

// Helper function to make authenticated requests
const makeAuthenticatedRequest = async (method, endpoint, data = null) => {
  const config = {
    method,
    url: `${API_BASE_URL}${endpoint}`,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    }
  };

  if (data) {
    config.data = data;
  }

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`Error in ${method} ${endpoint}:`, error.response?.data || error.message);
    throw error;
  }
};

// Test functions
const testAuthentication = async () => {
  console.log('\n🔐 Testing Authentication...');
  
  try {
    // First, try to access a protected endpoint without token
    await axios.get(`${API_BASE_URL}/proof-requests`);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Authentication required - endpoint is protected');
    } else {
      console.log('❌ Unexpected error:', error.response?.status);
    }
  }
};

const testCreateProofRequest = async () => {
  console.log('\n📝 Testing Create Proof Request...');
  
  try {
    const result = await makeAuthenticatedRequest('POST', '/proof-requests', testProofRequest);
    console.log('✅ Proof request created successfully');
    console.log('Request ID:', result.data._id);
    console.log('Title:', result.data.title);
    console.log('Status:', result.data.status);
    return result.data._id;
  } catch (error) {
    console.log('❌ Failed to create proof request');
    throw error;
  }
};

const testGetProofRequests = async () => {
  console.log('\n📋 Testing Get Proof Requests...');
  
  try {
    const result = await makeAuthenticatedRequest('GET', '/proof-requests');
    console.log('✅ Proof requests retrieved successfully');
    console.log('Total requests:', result.pagination.total);
    console.log('Requests in current page:', result.data.length);
    return result.data;
  } catch (error) {
    console.log('❌ Failed to get proof requests');
    throw error;
  }
};

const testGetProofRequestById = async (requestId) => {
  console.log('\n🔍 Testing Get Proof Request by ID...');
  
  try {
    const result = await makeAuthenticatedRequest('GET', `/proof-requests/${requestId}`);
    console.log('✅ Proof request retrieved successfully');
    console.log('Title:', result.data.title);
    console.log('Category:', result.data.category);
    console.log('Priority:', result.data.priority);
    console.log('Status:', result.data.status);
    return result.data;
  } catch (error) {
    console.log('❌ Failed to get proof request by ID');
    throw error;
  }
};

const testUpdateProofRequest = async (requestId) => {
  console.log('\n✏️ Testing Update Proof Request...');
  
  const updateData = {
    priority: 'urgent',
    notes: 'Updated notes - urgent processing required'
  };
  
  try {
    const result = await makeAuthenticatedRequest('PUT', `/proof-requests/${requestId}`, updateData);
    console.log('✅ Proof request updated successfully');
    console.log('Updated priority:', result.data.priority);
    console.log('Updated notes:', result.data.notes);
    return result.data;
  } catch (error) {
    console.log('❌ Failed to update proof request');
    throw error;
  }
};

const testFulfillProofRequest = async (requestId) => {
  console.log('\n✅ Testing Fulfill Proof Request...');
  
  const fulfillmentData = {
    fulfillmentNotes: 'Medical certificate provided and validated',
    validationScore: 95
  };
  
  try {
    const result = await makeAuthenticatedRequest('PUT', `/proof-requests/${requestId}/fulfill`, fulfillmentData);
    console.log('✅ Proof request fulfilled successfully');
    console.log('Status:', result.data.status);
    console.log('Fulfilled at:', result.data.fulfilledAt);
    console.log('Validation score:', result.data.validationDetails?.validationScore);
    return result.data;
  } catch (error) {
    console.log('❌ Failed to fulfill proof request');
    throw error;
  }
};

const testRejectProofRequest = async (requestId) => {
  console.log('\n❌ Testing Reject Proof Request...');
  
  const rejectionData = {
    rejectionReason: 'Insufficient documentation provided'
  };
  
  try {
    const result = await makeAuthenticatedRequest('PUT', `/proof-requests/${requestId}/reject`, rejectionData);
    console.log('✅ Proof request rejected successfully');
    console.log('Status:', result.data.status);
    console.log('Rejection reason:', result.data.notes);
    return result.data;
  } catch (error) {
    console.log('❌ Failed to reject proof request');
    throw error;
  }
};

const testSendFollowUp = async (requestId) => {
  console.log('\n💬 Testing Send Follow-up...');
  
  const followUpData = {
    message: 'Please provide additional medical records for processing',
    isInternal: false
  };
  
  try {
    await makeAuthenticatedRequest('POST', `/proof-requests/${requestId}/follow-up`, followUpData);
    console.log('✅ Follow-up message sent successfully');
  } catch (error) {
    console.log('❌ Failed to send follow-up message');
    throw error;
  }
};

const testGetAnalytics = async () => {
  console.log('\n📊 Testing Get Analytics...');
  
  try {
    const result = await makeAuthenticatedRequest('GET', '/proof-requests/analytics?period=30d');
    console.log('✅ Analytics retrieved successfully');
    console.log('Total requests:', result.data.totalRequests);
    console.log('Status breakdown:', result.data.statusBreakdown);
    console.log('Category breakdown:', result.data.categoryBreakdown);
    console.log('Priority breakdown:', result.data.priorityBreakdown);
    console.log('Overdue requests:', result.data.overdueRequests);
    console.log('Average response time:', result.data.averageResponseTime);
    return result.data;
  } catch (error) {
    console.log('❌ Failed to get analytics');
    throw error;
  }
};

const testBulkAction = async (requestIds) => {
  console.log('\n🔄 Testing Bulk Action...');
  
  const bulkData = {
    action: 'update_priority',
    requestIds: requestIds,
    priority: 'medium'
  };
  
  try {
    const result = await makeAuthenticatedRequest('POST', '/proof-requests/bulk-action', bulkData);
    console.log('✅ Bulk action completed successfully');
    console.log('Updated count:', result.data.updatedCount);
    return result.data;
  } catch (error) {
    console.log('❌ Failed to perform bulk action');
    throw error;
  }
};

const testSearchRequests = async () => {
  console.log('\n🔍 Testing Search Requests...');
  
  try {
    const result = await makeAuthenticatedRequest('GET', '/proof-requests?search=medical');
    console.log('✅ Search completed successfully');
    console.log('Search results count:', result.data.length);
    return result.data;
  } catch (error) {
    console.log('❌ Failed to search requests');
    throw error;
  }
};

const testFilterRequests = async () => {
  console.log('\n🔍 Testing Filter Requests...');
  
  try {
    const result = await makeAuthenticatedRequest('GET', '/proof-requests?category=medical&priority=high');
    console.log('✅ Filter completed successfully');
    console.log('Filtered results count:', result.data.length);
    return result.data;
  } catch (error) {
    console.log('❌ Failed to filter requests');
    throw error;
  }
};

const testPagination = async () => {
  console.log('\n📄 Testing Pagination...');
  
  try {
    const result = await makeAuthenticatedRequest('GET', '/proof-requests?page=1&limit=5');
    console.log('✅ Pagination working correctly');
    console.log('Current page:', result.pagination.page);
    console.log('Items per page:', result.pagination.limit);
    console.log('Total items:', result.pagination.total);
    console.log('Total pages:', result.pagination.totalPages);
    console.log('Has next page:', result.pagination.hasNextPage);
    console.log('Has previous page:', result.pagination.hasPrevPage);
    return result.pagination;
  } catch (error) {
    console.log('❌ Failed to test pagination');
    throw error;
  }
};

const testDeleteProofRequest = async (requestId) => {
  console.log('\n🗑️ Testing Delete Proof Request...');
  
  try {
    await makeAuthenticatedRequest('DELETE', `/proof-requests/${requestId}`);
    console.log('✅ Proof request deleted successfully');
  } catch (error) {
    console.log('❌ Failed to delete proof request');
    throw error;
  }
};

// Main test function
const runTests = async () => {
  console.log('🚀 Starting Proof Request API Tests...');
  console.log('API Base URL:', API_BASE_URL);
  
  try {
    // Test authentication
    await testAuthentication();
    
    // Test creating a proof request
    const requestId = await testCreateProofRequest();
    
    // Test getting all proof requests
    const requests = await testGetProofRequests();
    
    // Test getting a specific proof request
    await testGetProofRequestById(requestId);
    
    // Test updating a proof request
    await testUpdateProofRequest(requestId);
    
    // Test sending follow-up
    await testSendFollowUp(requestId);
    
    // Test search functionality
    await testSearchRequests();
    
    // Test filtering
    await testFilterRequests();
    
    // Test pagination
    await testPagination();
    
    // Test analytics
    await testGetAnalytics();
    
    // Test bulk actions (if we have multiple requests)
    if (requests.length > 1) {
      const requestIds = requests.slice(0, 2).map(req => req._id);
      await testBulkAction(requestIds);
    }
    
    // Test fulfilling a proof request
    await testFulfillProofRequest(requestId);
    
    // Create another request for rejection test
    const secondRequestId = await testCreateProofRequest();
    
    // Test rejecting a proof request
    await testRejectProofRequest(secondRequestId);
    
    // Test deleting a proof request
    await testDeleteProofRequest(secondRequestId);
    
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('\n💥 Test suite failed:', error.message);
    process.exit(1);
  }
};

// Check if we have a token to use
if (!process.env.TEST_AUTH_TOKEN) {
  console.log('⚠️ No TEST_AUTH_TOKEN provided. Some tests may fail due to authentication.');
  console.log('Set TEST_AUTH_TOKEN environment variable to run authenticated tests.');
} else {
  authToken = process.env.TEST_AUTH_TOKEN;
}

// Run the tests
runTests(); 