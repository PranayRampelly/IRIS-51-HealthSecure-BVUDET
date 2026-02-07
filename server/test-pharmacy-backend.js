import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'http://localhost:5000';
const API_BASE = `${BASE_URL}/api`;

// Test data
const testPharmacyData = {
  email: 'testpharmacy@healthsecure.com',
  password: 'TestPharmacy123!',
  role: 'pharmacy',
  pharmacyName: 'Test HealthSecure Pharmacy'
};

const testPatientData = {
  email: 'testpatient@healthsecure.com',
  password: 'TestPatient123!',
  role: 'patient',
  firstName: 'Test',
  lastName: 'Patient'
};

const testMedicineData = {
  sku: 'TEST-MED-001',
  name: 'Test Amoxicillin',
  generic: 'Amoxicillin',
  dosage: '500mg',
  form: 'Capsule',
  manufacturer: 'Test Pharmaceuticals',
  description: 'Test antibiotic for bacterial infections',
  category: 'Antibiotics',
  prescriptionRequired: true,
  stock: 100,
  threshold: 10,
  price: 15.00,
  genericPrice: 12.00,
  brandPrice: 18.00,
  insuranceCovered: true,
  insurancePrice: 10.00,
  deliveryTime: '1-2 days',
  rating: 4.5,
  reviews: 25
};

let authToken = '';
let patientToken = '';
let pharmacyId = '';
let medicineId = '';
let orderId = '';

// Utility functions
const log = (message, data = null) => {
  console.log(`\n🔍 ${message}`);
  if (data) console.log(JSON.stringify(data, null, 2));
};

const logError = (message, error) => {
  console.error(`\n❌ ${message}:`, error.response?.data || error.message);
};

const logSuccess = (message) => {
  console.log(`\n✅ ${message}`);
};

// Test functions
const testServerHealth = async () => {
  try {
    log('Testing server health...');
    const response = await axios.get(`${BASE_URL}/health`);
    logSuccess('Server is healthy');
    log('Health response:', response.data);
    return true;
  } catch (error) {
    logError('Server health check failed', error);
    return false;
  }
};

const testPharmacyRegistration = async () => {
  try {
    log('Testing pharmacy registration...');
    const response = await axios.post(`${API_BASE}/register`, testPharmacyData);
    logSuccess('Pharmacy registered successfully');
    log('Registration response:', response.data);
    return true;
  } catch (error) {
    if (error.response?.status === 409) {
      log('Pharmacy already exists, proceeding with login...');
      return true;
    }
    logError('Pharmacy registration failed', error);
    return false;
  }
};

const testPharmacyLogin = async () => {
  try {
    log('Testing pharmacy login...');
    const response = await axios.post(`${API_BASE}/login`, {
      email: testPharmacyData.email,
      password: testPharmacyData.password
    });
    
    authToken = response.data.token;
    pharmacyId = response.data.user._id;
    
    logSuccess('Pharmacy login successful');
    log('Login response:', response.data);
    return true;
  } catch (error) {
    logError('Pharmacy login failed', error);
    return false;
  }
};

const testPatientRegistration = async () => {
  try {
    log('Testing patient registration...');
    const response = await axios.post(`${API_BASE}/register`, testPatientData);
    logSuccess('Patient registered successfully');
    log('Registration response:', response.data);
    return true;
  } catch (error) {
    if (error.response?.status === 409) {
      log('Patient already exists, proceeding with login...');
      return true;
    }
    logError('Patient registration failed', error);
    return false;
  }
};

const testPatientLogin = async () => {
  try {
    log('Testing patient login...');
    const response = await axios.post(`${API_BASE}/login`, {
      email: testPatientData.email,
      password: testPatientData.password
    });
    
    patientToken = response.data.token;
    
    logSuccess('Patient login successful');
    log('Login response:', response.data);
    return true;
  } catch (error) {
    logError('Patient login failed', error);
    return false;
  }
};

const testCreateMedicine = async () => {
  try {
    log('Testing medicine creation...');
    const response = await axios.post(`${API_BASE}/pharmacy/inventory`, testMedicineData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    medicineId = response.data.item._id;
    
    logSuccess('Medicine created successfully');
    log('Medicine response:', response.data);
    return true;
  } catch (error) {
    logError('Medicine creation failed', error);
    return false;
  }
};

const testGetInventory = async () => {
  try {
    log('Testing inventory retrieval...');
    const response = await axios.get(`${API_BASE}/pharmacy/inventory`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    logSuccess('Inventory retrieved successfully');
    log('Inventory response:', response.data);
    return true;
  } catch (error) {
    logError('Inventory retrieval failed', error);
    return false;
  }
};

const testMedicineSearch = async () => {
  try {
    log('Testing medicine search...');
    const response = await axios.get(`${API_BASE}/patient/pharmacy/search?q=amoxicillin`, {
      headers: { Authorization: `Bearer ${patientToken}` }
    });
    
    logSuccess('Medicine search successful');
    log('Search response:', response.data);
    return true;
  } catch (error) {
    logError('Medicine search failed', error);
    return false;
  }
};

const testPriceComparison = async () => {
  try {
    log('Testing price comparison...');
    const response = await axios.get(`${API_BASE}/patient/pharmacy/price-comparison?q=amoxicillin`, {
      headers: { Authorization: `Bearer ${patientToken}` }
    });
    
    logSuccess('Price comparison successful');
    log('Price comparison response:', response.data);
    return true;
  } catch (error) {
    logError('Price comparison failed', error);
    return false;
  }
};

const testAddToCart = async () => {
  try {
    log('Testing add to cart...');
    const cartData = {
      medicineId,
      variant: 'generic',
      quantity: 2,
      packSize: 10,
      pharmacy: pharmacyId,
      insuranceApplied: false
    };
    
    const response = await axios.post(`${API_BASE}/patient/pharmacy/cart`, cartData, {
      headers: { Authorization: `Bearer ${patientToken}` }
    });
    
    logSuccess('Add to cart successful');
    log('Cart response:', response.data);
    return true;
  } catch (error) {
    logError('Add to cart failed', error);
    return false;
  }
};

const testGetCart = async () => {
  try {
    log('Testing get cart...');
    const response = await axios.get(`${API_BASE}/patient/pharmacy/cart`, {
      headers: { Authorization: `Bearer ${patientToken}` }
    });
    
    logSuccess('Get cart successful');
    log('Cart response:', response.data);
    return true;
  } catch (error) {
    logError('Get cart failed', error);
    return false;
  }
};

const testCheckout = async () => {
  try {
    log('Testing checkout...');
    const checkoutData = {
      deliveryDetails: {
        option: 'standard',
        address: '123 Test Street, Test City, Test State 12345',
        instructions: 'Leave at front door'
      },
      paymentDetails: {
        method: 'cod',
        status: 'pending'
      },
      prescriptionRequired: false
    };
    
    const response = await axios.post(`${API_BASE}/patient/pharmacy/checkout`, checkoutData, {
      headers: { Authorization: `Bearer ${patientToken}` }
    });
    
    orderId = response.data.order.id;
    
    logSuccess('Checkout successful');
    log('Checkout response:', response.data);
    return true;
  } catch (error) {
    logError('Checkout failed', error);
    return false;
  }
};

const testGetOrders = async () => {
  try {
    log('Testing get orders...');
    const response = await axios.get(`${API_BASE}/patient/pharmacy/orders`, {
      headers: { Authorization: `Bearer ${patientToken}` }
    });
    
    logSuccess('Get orders successful');
    log('Orders response:', response.data);
    return true;
  } catch (error) {
    logError('Get orders failed', error);
    return false;
  }
};

const testPharmacyOrders = async () => {
  try {
    log('Testing pharmacy orders...');
    const response = await axios.get(`${API_BASE}/pharmacy/orders`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    logSuccess('Pharmacy orders retrieved successfully');
    log('Pharmacy orders response:', response.data);
    return true;
  } catch (error) {
    logError('Pharmacy orders retrieval failed', error);
    return false;
  }
};

const testUpdateOrderStatus = async () => {
  try {
    log('Testing order status update...');
    const response = await axios.patch(`${API_BASE}/pharmacy/orders/${orderId}/status`, {
      status: 'confirmed'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    logSuccess('Order status updated successfully');
    log('Status update response:', response.data);
    return true;
  } catch (error) {
    logError('Order status update failed', error);
    return false;
  }
};

const testGetCategories = async () => {
  try {
    log('Testing get categories...');
    const response = await axios.get(`${API_BASE}/patient/pharmacy/categories`, {
      headers: { Authorization: `Bearer ${patientToken}` }
    });
    
    logSuccess('Categories retrieved successfully');
    log('Categories response:', response.data);
    return true;
  } catch (error) {
    logError('Categories retrieval failed', error);
    return false;
  }
};

const testGetAnalytics = async () => {
  try {
    log('Testing get analytics...');
    const response = await axios.get(`${API_BASE}/patient/pharmacy/analytics?timeRange=30`, {
      headers: { Authorization: `Bearer ${patientToken}` }
    });
    
    logSuccess('Analytics retrieved successfully');
    log('Analytics response:', response.data);
    return true;
  } catch (error) {
    logError('Analytics retrieval failed', error);
    return false;
  }
};

const testPharmacyDashboard = async () => {
  try {
    log('Testing pharmacy dashboard...');
    const response = await axios.get(`${API_BASE}/pharmacy/dashboard`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    logSuccess('Pharmacy dashboard retrieved successfully');
    log('Dashboard response:', response.data);
    return true;
  } catch (error) {
    logError('Pharmacy dashboard retrieval failed', error);
    return false;
  }
};

const testPharmacyReports = async () => {
  try {
    log('Testing pharmacy reports...');
    const response = await axios.get(`${API_BASE}/pharmacy/reports?timeRange=30`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    logSuccess('Pharmacy reports retrieved successfully');
    log('Reports response:', response.data);
    return true;
  } catch (error) {
    logError('Pharmacy reports retrieval failed', error);
    return false;
  }
};

const testPharmacyProfile = async () => {
  try {
    log('Testing pharmacy profile...');
    const response = await axios.get(`${API_BASE}/pharmacy/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    logSuccess('Pharmacy profile retrieved successfully');
    log('Profile response:', response.data);
    return true;
  } catch (error) {
    logError('Pharmacy profile retrieval failed', error);
    return false;
  }
};

const testProfileCompletion = async () => {
  try {
    log('Testing profile completion...');
    const response = await axios.get(`${API_BASE}/pharmacy/profile-completion`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    logSuccess('Profile completion retrieved successfully');
    log('Profile completion response:', response.data);
    return true;
  } catch (error) {
    logError('Profile completion retrieval failed', error);
    return false;
  }
};

// Main test runner
const runTests = async () => {
  console.log('🚀 Starting Pharmacy Backend Tests...\n');
  
  const tests = [
    { name: 'Server Health', fn: testServerHealth },
    { name: 'Pharmacy Registration', fn: testPharmacyRegistration },
    { name: 'Pharmacy Login', fn: testPharmacyLogin },
    { name: 'Patient Registration', fn: testPatientRegistration },
    { name: 'Patient Login', fn: testPatientLogin },
    { name: 'Create Medicine', fn: testCreateMedicine },
    { name: 'Get Inventory', fn: testGetInventory },
    { name: 'Medicine Search', fn: testMedicineSearch },
    { name: 'Price Comparison', fn: testPriceComparison },
    { name: 'Add to Cart', fn: testAddToCart },
    { name: 'Get Cart', fn: testGetCart },
    { name: 'Checkout', fn: testCheckout },
    { name: 'Get Orders', fn: testGetOrders },
    { name: 'Pharmacy Orders', fn: testPharmacyOrders },
    { name: 'Update Order Status', fn: testUpdateOrderStatus },
    { name: 'Get Categories', fn: testGetCategories },
    { name: 'Get Analytics', fn: testGetAnalytics },
    { name: 'Pharmacy Dashboard', fn: testPharmacyDashboard },
    { name: 'Pharmacy Reports', fn: testPharmacyReports },
    { name: 'Pharmacy Profile', fn: testPharmacyProfile },
    { name: 'Profile Completion', fn: testProfileCompletion }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      console.log(`\n📋 Running: ${test.name}`);
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`\n💥 Test ${test.name} crashed:`, error.message);
      failed++;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Pharmacy backend is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }
};

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { runTests };
