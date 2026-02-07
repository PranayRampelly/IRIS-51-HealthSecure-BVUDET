# HealthSecure Admin Dashboard Documentation

## Overview

The HealthSecure Admin Dashboard is a comprehensive, dynamic dashboard system that provides real-time insights into system performance, user activity, security metrics, and compliance status. The dashboard is built with a MongoDB backend and React frontend, featuring Cloudinary integration for file storage.

## Architecture

### Backend Components

1. **DashboardStats Model** (`server/src/models/DashboardStats.js`)
   - Comprehensive MongoDB schema for storing dashboard metrics
   - Supports user stats, activity stats, system health, storage, performance, security, compliance, audit, time-based, and geographical statistics

2. **Dashboard Controller** (`server/src/controllers/dashboardController.js`)
   - RESTful API endpoints for dashboard data
   - Real-time metrics generation
   - Category-specific data retrieval
   - Export functionality

3. **Dashboard Routes** (`server/src/routes/adminDashboard.js`)
   - Admin-only protected routes
   - Comprehensive endpoint coverage

### Frontend Components

1. **Dashboard Service** (`src/services/adminDashboardService.ts`)
   - TypeScript service for API integration
   - Type-safe data handling
   - Error handling and utility functions

2. **Dashboard Component** (`src/pages/admin/AdminDashboard.tsx`)
   - Dynamic React component with real-time data
   - Tabbed interface for different metric categories
   - Responsive design with modern UI components
   - Interactive charts and progress indicators

## API Endpoints

### Base URL
```
http://localhost:5000/api/admin/dashboard
```

### Available Endpoints

#### 1. Get All Dashboard Statistics
```http
GET /stats
```
Returns complete dashboard statistics including all metric categories.

**Response:**
```json
{
  "userStats": { ... },
  "activityStats": { ... },
  "systemHealth": { ... },
  "storageStats": { ... },
  "performanceStats": { ... },
  "securityStats": { ... },
  "complianceStats": { ... },
  "auditStats": { ... },
  "timeBasedStats": { ... },
  "geographicalStats": { ... }
}
```

#### 2. Get Category-Specific Statistics
```http
GET /stats/{category}
```
Where `{category}` can be: `users`, `activity`, `system`, `security`, `performance`, `compliance`, `storage`, `audit`, `time`, `geographical`

#### 3. Get Real-Time Metrics
```http
GET /realtime
```
Returns current system metrics for real-time monitoring.

#### 4. Get System Health
```http
GET /health
```
Returns system health status and component availability.

#### 5. Export Dashboard Data
```http
GET /export
```
Exports all dashboard data in JSON format.

## Data Models

### DashboardStats Schema

```javascript
{
  userStats: {
    totalUsers: Number,
    activeUsers: Number,
    newUsersThisMonth: Number,
    newUsersLastMonth: Number,
    userGrowthRate: Number,
    inactiveUsers: Number,
    patientCount: Number,
    doctorCount: Number,
    adminCount: Number,
    insuranceCount: Number,
    userRetentionRate: Number,
    averageSessionDuration: Number,
    userSatisfactionScore: Number
  },
  activityStats: {
    activeSessions: Number,
    sessionGrowthRate: Number,
    totalLogins: Number,
    failedLogins: Number,
    averageSessionDuration: Number,
    peakConcurrentUsers: Number,
    dailyActiveUsers: Number,
    weeklyActiveUsers: Number,
    monthlyActiveUsers: Number,
    userEngagementScore: Number,
    featureUsageStats: {
      appointments: Number,
      healthRecords: Number,
      insuranceClaims: Number,
      proofRequests: Number,
      videoConsultations: Number
    }
  },
  systemHealth: {
    overallHealth: String,
    databaseStatus: String,
    apiStatus: String,
    cloudinaryStatus: String,
    uptime: Number,
    lastMaintenance: Date,
    nextMaintenance: Date,
    systemAlerts: Number,
    criticalAlerts: Number,
    warningAlerts: Number,
    infoAlerts: Number
  },
  storageStats: {
    usedStorageGB: Number,
    totalStorageGB: Number,
    storageGrowthRate: Number,
    databaseSizeGB: Number,
    databaseLimitGB: Number,
    fileCount: Number,
    averageFileSize: Number,
    storageEfficiency: Number,
    backupSizeGB: Number,
    backupRetentionDays: Number
  },
  performanceStats: {
    cpuUsage: Number,
    memoryUsage: Number,
    averageResponseTime: Number,
    uptimePercentage: Number,
    totalRequests: Number,
    successRate: Number,
    errorRate: Number,
    cacheHitRate: Number,
    fastResponses: Number,
    normalResponses: Number,
    slowResponses: Number,
    databaseQueries: Number,
    averageQueryTime: Number,
    connectionPoolUsage: Number
  },
  securityStats: {
    failedLoginAttempts: Number,
    activeSessions: Number,
    securityAlerts: Number,
    encryptedDataPercentage: Number,
    twoFactorEnabled: Boolean,
    suspiciousIPs: Number,
    blockedRequests: Number,
    lastSecurityScan: Date,
    securityScore: Number,
    vulnerabilityCount: Number,
    patchedVulnerabilities: Number
  },
  complianceStats: {
    overallComplianceScore: Number,
    dataRetentionCompliance: Number,
    privacyViolations: Number,
    auditCompliance: Number,
    regulatoryCompliance: Number,
    lastComplianceCheck: Date,
    nextComplianceCheck: Date,
    complianceAlerts: Number,
    dataProtectionScore: Number
  },
  auditStats: {
    totalAuditLogs: Number,
    todayLogs: Number,
    thisWeekLogs: Number,
    thisMonthLogs: Number,
    criticalEvents: Number,
    securityEvents: Number,
    userActivityEvents: Number,
    systemEvents: Number,
    complianceEvents: Number,
    dataAccessEvents: Number
  },
  timeBasedStats: {
    hourlyActivity: Object,
    dailyActivity: Object,
    monthlyActivity: Object
  },
  geographicalStats: {
    userDistribution: Object,
    topCities: Object
  }
}
```

## Frontend Features

### Dashboard Tabs

1. **Overview Tab**
   - Key metrics cards with trend indicators
   - System status indicators
   - Storage progress bars
   - Quick access to critical information

2. **Users Tab**
   - User growth metrics
   - User type distribution
   - Activity statistics
   - Retention rates

3. **System Tab**
   - CPU and memory usage
   - Performance metrics
   - Response time distribution
   - Database performance

4. **Security Tab**
   - Security alerts and incidents
   - Authentication metrics
   - Encryption status
   - Vulnerability tracking

5. **Performance Tab**
   - API performance metrics
   - Cache efficiency
   - Database query statistics
   - Response time analysis

6. **Compliance Tab**
   - Regulatory compliance scores
   - Audit activity
   - Data protection metrics
   - Privacy violation tracking

### Interactive Components

- **Metric Cards**: Display key metrics with icons, trends, and color coding
- **Status Cards**: Show system status with appropriate badges
- **Progress Cards**: Visual representation of usage and limits
- **Trend Indicators**: Show growth/decline with arrows and colors
- **Refresh Button**: Manual data refresh with loading states
- **Export Button**: Download dashboard data

## Setup Instructions

### 1. Backend Setup

1. Ensure MongoDB is running
2. Install dependencies:
   ```bash
   cd server
   npm install
   ```

3. Create sample dashboard data:
   ```bash
   node create-sample-dashboard-data.js
   ```

4. Start the server:
   ```bash
   npm start
   ```

### 2. Frontend Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

### 3. Testing

1. Test the API endpoints:
   ```bash
   cd server
   node demo-dashboard-api.js
   ```

2. Access the dashboard at:
   ```
   http://localhost:8080/admin/dashboard
   ```

## Usage Examples

### Fetching Dashboard Data

```typescript
import { adminDashboardService } from '@/services/adminDashboardService';

// Get all dashboard statistics
const stats = await adminDashboardService.getDashboardStats();

// Get specific category
const userStats = await adminDashboardService.getCategoryStats('users');

// Get real-time metrics
const realtime = await adminDashboardService.getRealTimeStats();

// Export data
const exportData = await adminDashboardService.exportDashboardStats();
```

### Component Usage

```tsx
import AdminDashboard from '@/pages/admin/AdminDashboard';

// In your router or app
<Route path="/admin/dashboard" element={<AdminDashboard />} />
```

## Error Handling

The dashboard includes comprehensive error handling:

- **Network Errors**: Displayed with retry options
- **Authentication Errors**: Redirect to login
- **Data Loading Errors**: Graceful fallbacks with skeleton loading
- **API Errors**: Toast notifications with error details

## Performance Optimizations

1. **Lazy Loading**: Dashboard tabs load data on demand
2. **Caching**: API responses cached for better performance
3. **Debounced Refresh**: Prevents excessive API calls
4. **Skeleton Loading**: Smooth loading experience
5. **Error Boundaries**: Prevents component crashes

## Security Features

1. **Admin Authentication**: All endpoints require admin privileges
2. **Rate Limiting**: Prevents API abuse
3. **Data Validation**: Input validation on all endpoints
4. **Audit Logging**: All dashboard access is logged
5. **CORS Protection**: Proper CORS configuration

## Monitoring and Maintenance

### Health Checks

The dashboard includes built-in health monitoring:

- Database connectivity
- API availability
- Cloudinary service status
- System resource usage

### Maintenance Tasks

1. **Regular Data Updates**: Dashboard data should be updated regularly
2. **Performance Monitoring**: Monitor API response times
3. **Storage Management**: Track storage usage and cleanup
4. **Security Audits**: Regular security assessments

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure CORS is properly configured in server.js
   - Check that frontend and backend ports match

2. **Authentication Errors**
   - Verify admin token is valid
   - Check authentication middleware

3. **Data Loading Issues**
   - Verify MongoDB connection
   - Check if sample data exists
   - Review API endpoint registration

4. **Performance Issues**
   - Monitor database query performance
   - Check for memory leaks
   - Review caching strategies

### Debug Commands

```bash
# Check MongoDB connection
mongo healthsecure --eval "db.stats()"

# Test API endpoints
curl http://localhost:5000/api/admin/dashboard/stats

# Check server logs
tail -f server/logs/app.log
```

## Future Enhancements

1. **Real-time WebSocket Updates**: Live dashboard updates
2. **Custom Dashboards**: User-configurable layouts
3. **Advanced Analytics**: Machine learning insights
4. **Mobile Dashboard**: Responsive mobile interface
5. **Integration APIs**: Third-party service integration
6. **Automated Reports**: Scheduled report generation
7. **Alert System**: Proactive issue notifications

## Support

For technical support or questions about the dashboard system:

1. Check the troubleshooting section
2. Review API documentation
3. Test with sample data
4. Check server logs for errors
5. Verify all dependencies are installed

---

**Last Updated**: January 2024
**Version**: 1.0.0
**Author**: HealthSecure Development Team 