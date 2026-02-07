import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';
let adminToken = '';

// Test configuration
const testEndpoints = [
  { name: 'Complete System Health', path: '/admin/system-health' },
  { name: 'System Metrics', path: '/admin/system-health/metrics' },
  { name: 'Service Status', path: '/admin/system-health/services' },
  { name: 'Database Health', path: '/admin/system-health/database' },
  { name: 'System Alerts', path: '/admin/system-health/alerts' },
  { name: 'Security Status', path: '/admin/system-health/security' },
  { name: 'Performance Data', path: '/admin/system-health/performance' },
  { name: 'Health Summary', path: '/admin/system-health/summary' }
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

async function testCompleteSystemHealth() {
  console.log('\n=== Testing Complete System Health ===');
  
  const result = await makeRequest('/admin/system-health');
  
  if (result.success) {
    console.log('✅ Complete system health data retrieved successfully');
    
    // Validate response structure
    const data = result.data;
    const requiredFields = ['system', 'services', 'database', 'alerts', 'security', 'performance', 'lastUpdate'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length === 0) {
      console.log('✅ All required fields present');
      console.log(`📊 System CPU: ${data.system.cpu.usage}%`);
      console.log(`📊 System Memory: ${data.system.memory.usage}%`);
      console.log(`📊 System Disk: ${data.system.disk.usage}%`);
      console.log(`🔧 Services: ${data.services.length} total`);
      console.log(`🚨 Alerts: ${data.alerts.length} total`);
      console.log(`🛡️ Security: ${data.security.sslCertificates.length} certificates`);
      console.log(`📈 Performance: ${data.performance.length} data points`);
      console.log(`⏰ Last Update: ${data.lastUpdate}`);
      console.log(`⏱️ Cache Age: ${data.cacheAge}ms`);
    } else {
      console.log(`❌ Missing fields: ${missingFields.join(', ')}`);
      return false;
    }
    
    return true;
  } else {
    console.log('❌ Failed to get complete system health data');
    return false;
  }
}

async function testSystemMetrics() {
  console.log('\n=== Testing System Metrics ===');
  
  const result = await makeRequest('/admin/system-health/metrics');
  
  if (result.success) {
    console.log('✅ System metrics retrieved successfully');
    
    const metrics = result.data.metrics;
    console.log(`💻 CPU: ${metrics.cpu.usage}% (${metrics.cpu.cores} cores)`);
    console.log(`🧠 Memory: ${metrics.memory.usage}% (${metrics.memory.total})`);
    console.log(`💾 Disk: ${metrics.disk.usage}% (${metrics.disk.total})`);
    console.log(`🌐 Network: ${metrics.network.total}`);
    console.log(`⏰ Uptime: ${Math.round(metrics.uptime / 3600)} hours`);
    console.log(`🖥️ Platform: ${metrics.platform} (${metrics.arch})`);
    console.log(`📦 Node.js: ${metrics.nodeVersion}`);
    
    return true;
  } else {
    console.log('❌ Failed to get system metrics');
    return false;
  }
}

async function testServiceStatus() {
  console.log('\n=== Testing Service Status ===');
  
  const result = await makeRequest('/admin/system-health/services');
  
  if (result.success) {
    console.log('✅ Service status retrieved successfully');
    
    const services = result.data.services;
    console.log(`🔧 Total Services: ${services.length}`);
    
    services.forEach(service => {
      const statusIcon = service.status === 'running' ? '✅' : 
                        service.status === 'warning' ? '⚠️' : '❌';
      console.log(`${statusIcon} ${service.name}: ${service.status} (${service.responseTime})`);
    });
    
    const runningServices = services.filter(s => s.status === 'running').length;
    const failedServices = services.filter(s => s.status === 'error').length;
    const warningServices = services.filter(s => s.status === 'warning').length;
    
    console.log(`📊 Summary: ${runningServices} running, ${warningServices} warning, ${failedServices} failed`);
    
    return true;
  } else {
    console.log('❌ Failed to get service status');
    return false;
  }
}

async function testDatabaseHealth() {
  console.log('\n=== Testing Database Health ===');
  
  const result = await makeRequest('/admin/system-health/database');
  
  if (result.success) {
    console.log('✅ Database health retrieved successfully');
    
    const db = result.data.database;
    console.log(`💾 Total Size: ${db.totalSize}`);
    console.log(`📄 Documents: ${db.totalDocuments}`);
    console.log(`🔗 Active Connections: ${db.activeConnections}`);
    console.log(`⚡ Queries/sec: ${db.queriesPerSec}`);
    console.log(`🎯 Cache Hit Ratio: ${db.cacheHitRatio}`);
    console.log(`🐌 Slow Queries: ${db.slowQueries}`);
    console.log(`🔒 Deadlocks: ${db.deadlocks}`);
    console.log(`📚 Collections: ${db.collections}`);
    console.log(`🔍 Indexes: ${db.indexes}`);
    
    return true;
  } else {
    console.log('❌ Failed to get database health');
    return false;
  }
}

async function testSystemAlerts() {
  console.log('\n=== Testing System Alerts ===');
  
  const result = await makeRequest('/admin/system-health/alerts');
  
  if (result.success) {
    console.log('✅ System alerts retrieved successfully');
    
    const alerts = result.data.alerts;
    console.log(`🚨 Total Alerts: ${alerts.length}`);
    
    alerts.forEach(alert => {
      const severityIcon = alert.severity === 'critical' ? '🔴' : 
                          alert.severity === 'warning' ? '🟡' : '🔵';
      const resolvedIcon = alert.resolved ? '✅' : '⏳';
      console.log(`${severityIcon} ${resolvedIcon} ${alert.message} (${alert.service})`);
    });
    
    const criticalAlerts = alerts.filter(a => a.severity === 'critical' && !a.resolved).length;
    const warningAlerts = alerts.filter(a => a.severity === 'warning' && !a.resolved).length;
    const resolvedAlerts = alerts.filter(a => a.resolved).length;
    
    console.log(`📊 Summary: ${criticalAlerts} critical, ${warningAlerts} warning, ${resolvedAlerts} resolved`);
    
    return true;
  } else {
    console.log('❌ Failed to get system alerts');
    return false;
  }
}

async function testSecurityStatus() {
  console.log('\n=== Testing Security Status ===');
  
  const result = await makeRequest('/admin/system-health/security');
  
  if (result.success) {
    console.log('✅ Security status retrieved successfully');
    
    const security = result.data.security;
    
    // SSL Certificates
    console.log(`🔐 SSL Certificates: ${security.sslCertificates.length}`);
    security.sslCertificates.forEach(cert => {
      const statusIcon = cert.status === 'valid' ? '✅' : 
                        cert.status === 'expires-soon' ? '⚠️' : '❌';
      console.log(`${statusIcon} ${cert.name}: ${cert.status} (${cert.issuer})`);
    });
    
    // Security Scans
    console.log(`🔍 Security Scans: ${security.securityScans.length}`);
    security.securityScans.forEach(scan => {
      const statusIcon = scan.status === 'clean' ? '✅' : 
                        scan.status === 'updates-available' ? '⚠️' : '❌';
      console.log(`${statusIcon} ${scan.name}: ${scan.status}`);
    });
    
    // Auth Metrics
    const auth = security.authMetrics;
    console.log(`👥 Active Sessions: ${auth.activeSessions}`);
    console.log(`❌ Failed Logins: ${auth.failedLoginAttempts}`);
    console.log(`🚫 Blocked IPs: ${auth.blockedIPs}`);
    console.log(`🛡️ Firewall: ${security.firewallStatus}`);
    console.log(`🔒 Encryption: ${security.encryptionStatus}`);
    
    return true;
  } else {
    console.log('❌ Failed to get security status');
    return false;
  }
}

async function testPerformanceData() {
  console.log('\n=== Testing Performance Data ===');
  
  const result = await makeRequest('/admin/system-health/performance');
  
  if (result.success) {
    console.log('✅ Performance data retrieved successfully');
    
    const performance = result.data.performance;
    console.log(`📈 Performance Data Points: ${performance.length}`);
    
    // Show first and last data points
    if (performance.length > 0) {
      const first = performance[0];
      const last = performance[performance.length - 1];
      console.log(`🕐 First (${first.time}): CPU ${first.cpu}%, Memory ${first.memory}%, Network ${first.network}`);
      console.log(`🕐 Last (${last.time}): CPU ${last.cpu}%, Memory ${last.memory}%, Network ${last.network}`);
    }
    
    // Calculate averages
    const avgCPU = performance.reduce((sum, p) => sum + p.cpu, 0) / performance.length;
    const avgMemory = performance.reduce((sum, p) => sum + p.memory, 0) / performance.length;
    const avgNetwork = performance.reduce((sum, p) => sum + p.network, 0) / performance.length;
    
    console.log(`📊 Averages: CPU ${avgCPU.toFixed(1)}%, Memory ${avgMemory.toFixed(1)}%, Network ${avgNetwork.toFixed(1)}`);
    
    return true;
  } else {
    console.log('❌ Failed to get performance data');
    return false;
  }
}

async function testHealthSummary() {
  console.log('\n=== Testing Health Summary ===');
  
  const result = await makeRequest('/admin/system-health/summary');
  
  if (result.success) {
    console.log('✅ Health summary retrieved successfully');
    
    const summary = result.data;
    const healthIcon = summary.overallHealth >= 90 ? '🟢' : 
                      summary.overallHealth >= 70 ? '🟡' : 
                      summary.overallHealth >= 50 ? '🟠' : '🔴';
    
    console.log(`${healthIcon} Overall Health: ${summary.overallHealth}/100 (${summary.status})`);
    console.log(`💻 System: CPU ${summary.systemMetrics.cpu}%, Memory ${summary.systemMetrics.memory}%, Disk ${summary.systemMetrics.disk}%`);
    console.log(`🔧 Services: ${summary.serviceStatus.running}/${summary.serviceStatus.total} running`);
    console.log(`🚨 Alerts: ${summary.alerts.critical} critical, ${summary.alerts.warning} warning, ${summary.alerts.resolved} resolved`);
    
    return true;
  } else {
    console.log('❌ Failed to get health summary');
    return false;
  }
}

async function testRefreshEndpoint() {
  console.log('\n=== Testing Refresh Endpoint ===');
  
  const result = await makeRequest('/admin/system-health/refresh', {
    method: 'POST'
  });
  
  if (result.success) {
    console.log('✅ System health data refreshed successfully');
    console.log(`⏰ Last Update: ${result.data.lastUpdate}`);
    return true;
  } else {
    console.log('❌ Failed to refresh system health data');
    return false;
  }
}

async function testIndividualEndpoints() {
  console.log('\n=== Testing Individual Endpoints ===');
  
  let passedTests = 0;
  let totalTests = testEndpoints.length;
  
  for (const endpoint of testEndpoints) {
    const result = await makeRequest(endpoint.path);
    if (result.success) {
      console.log(`✅ ${endpoint.name} - Success`);
      passedTests++;
    } else {
      console.log(`❌ ${endpoint.name} - Failed`);
    }
  }
  
  console.log(`\n📊 Individual Endpoints: ${passedTests}/${totalTests} passed`);
  return passedTests === totalTests;
}

async function testErrorHandling() {
  console.log('\n=== Testing Error Handling ===');
  
  // Test without authentication
  const noAuthResult = await makeRequest('/admin/system-health', {
    headers: { Authorization: '' }
  });
  
  if (!noAuthResult.success && noAuthResult.data?.message) {
    console.log('✅ Unauthorized access properly blocked');
  } else {
    console.log('❌ Unauthorized access not properly handled');
    return false;
  }
  
  // Test invalid endpoint
  const invalidResult = await makeRequest('/admin/system-health/invalid');
  
  if (!invalidResult.success) {
    console.log('✅ Invalid endpoint properly handled');
  } else {
    console.log('❌ Invalid endpoint not properly handled');
    return false;
  }
  
  return true;
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting System Health API Tests\n');

  const tests = [
    { name: 'Admin Login', fn: testLogin },
    { name: 'Complete System Health', fn: testCompleteSystemHealth },
    { name: 'System Metrics', fn: testSystemMetrics },
    { name: 'Service Status', fn: testServiceStatus },
    { name: 'Database Health', fn: testDatabaseHealth },
    { name: 'System Alerts', fn: testSystemAlerts },
    { name: 'Security Status', fn: testSecurityStatus },
    { name: 'Performance Data', fn: testPerformanceData },
    { name: 'Health Summary', fn: testHealthSummary },
    { name: 'Refresh Endpoint', fn: testRefreshEndpoint },
    { name: 'Individual Endpoints', fn: testIndividualEndpoints },
    { name: 'Error Handling', fn: testErrorHandling }
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
  
  // Performance test
  console.log('\n=== Performance Test ===');
  const startTime = Date.now();
  await makeRequest('/admin/system-health');
  const endTime = Date.now();
  console.log(`⏱️ Response time: ${endTime - startTime}ms`);
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { runTests }; 