# 🔍 Comprehensive Audit Log System

A complete audit logging system for HealthSecure with MongoDB backend, Cloudinary integration, and dynamic React frontend.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Backend Components](#backend-components)
- [Frontend Components](#frontend-components)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Installation & Setup](#installation--setup)
- [Usage Examples](#usage-examples)
- [Testing](#testing)
- [Security & Compliance](#security--compliance)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

The audit log system provides comprehensive tracking of all system activities, user actions, and security events. It supports:

- **Real-time logging** of all system events
- **Advanced filtering and search** capabilities
- **Compliance tracking** (HIPAA, GDPR, SOX)
- **File attachments** via Cloudinary
- **Bulk operations** for efficient management
- **Export functionality** (JSON/CSV)
- **Performance monitoring** and analytics

## ✨ Features

### 🔐 Security & Compliance
- **HIPAA Compliance**: Track healthcare-related activities
- **GDPR Compliance**: Monitor data access and privacy
- **SOX Compliance**: Financial and operational controls
- **Security Alerts**: Real-time threat detection
- **Access Control**: Role-based permissions

### 📊 Analytics & Reporting
- **Real-time Statistics**: Live dashboard metrics
- **Trend Analysis**: Historical data patterns
- **User Activity Tracking**: Individual user behavior
- **Performance Metrics**: System performance monitoring
- **Custom Reports**: Flexible reporting options

### 🛠️ Management Features
- **Advanced Filtering**: Multi-criteria search
- **Bulk Operations**: Mass updates and actions
- **Export Capabilities**: JSON and CSV formats
- **File Attachments**: Cloudinary integration
- **Audit Trail**: Complete change history

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  Node.js Backend │    │   MongoDB Atlas │
│                 │    │                 │    │                 │
│ - Dynamic UI    │◄──►│ - REST API      │◄──►│ - Audit Logs    │
│ - Real-time     │    │ - Authentication │    │ - User Data     │
│ - Filtering     │    │ - Authorization  │    │ - Statistics    │
│ - Export        │    │ - Validation     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Cloudinary    │    │   Socket.IO     │    │   Redis Cache   │
│                 │    │                 │    │                 │
│ - File Storage  │    │ - Real-time     │    │ - Session Data  │
│ - Image CDN     │    │ - Notifications │    │ - Rate Limiting │
│ - Transformations│   │ - Live Updates  │    │ - Caching       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Backend Components

### 1. Audit Log Model (`server/src/models/AuditLog.js`)

Comprehensive MongoDB schema with:

```javascript
const auditLogSchema = new mongoose.Schema({
  // Basic Information
  timestamp: Date,
  userId: ObjectId,
  userEmail: String,
  userName: String,
  userRole: String,
  
  // Action Details
  action: String, // 50+ predefined actions
  targetType: String,
  targetId: ObjectId,
  targetName: String,
  
  // Security & Status
  severity: String, // info, warning, high, critical
  status: String, // success, failed, pending, blocked, error
  
  // Request Information
  ipAddress: String,
  userAgent: String,
  requestMethod: String,
  requestUrl: String,
  requestId: String,
  
  // Additional Data
  details: String,
  metadata: Mixed,
  attachments: [{
    url: String,
    publicId: String,
    filename: String,
    mimeType: String,
    size: Number
  }],
  
  // Compliance
  retentionPeriod: Number,
  isComplianceRelevant: Boolean,
  complianceTags: [String], // hipaa, gdpr, sox, pci, iso27001
  
  // Audit Trail
  previousValues: Mixed,
  newValues: Mixed,
  executionTime: Number,
  relatedLogIds: [ObjectId],
  
  // Session & Location
  sessionId: String,
  location: {
    country: String,
    region: String,
    city: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  }
});
```

### 2. Audit Log Controller (`server/src/controllers/auditLogController.js`)

Complete CRUD operations with advanced features:

- **getAllAuditLogs**: Advanced filtering, pagination, search
- **getAuditLogStats**: System statistics and analytics
- **getUserActivity**: Individual user activity tracking
- **createAuditLog**: Create new audit entries
- **updateAuditLog**: Modify existing logs
- **addAttachment**: File upload to Cloudinary
- **exportAuditLogs**: JSON/CSV export functionality
- **bulkAuditLogOperations**: Mass operations
- **getAuditLogSuggestions**: Search suggestions

### 3. Audit Log Routes (`server/src/routes/adminAuditLogs.js`)

RESTful API endpoints with admin authorization:

```javascript
// GET endpoints
GET /api/admin/audit-logs - Get all logs with filters
GET /api/admin/audit-logs/stats - Get statistics
GET /api/admin/audit-logs/:id - Get specific log
GET /api/admin/audit-logs/user/:userId - Get user activity
GET /api/admin/audit-logs/export - Export logs
GET /api/admin/audit-logs/suggestions - Get search suggestions

// POST endpoints
POST /api/admin/audit-logs - Create new log
POST /api/admin/audit-logs/bulk - Bulk operations
POST /api/admin/audit-logs/:id/attachments - Add attachment

// PUT endpoints
PUT /api/admin/audit-logs/:id - Update log

// DELETE endpoints
DELETE /api/admin/audit-logs/:id - Delete log
DELETE /api/admin/audit-logs/:id/attachments/:attachmentId - Remove attachment
```

## 🎨 Frontend Components

### 1. Admin Audit Logs Page (`src/pages/admin/AdminAuditLogs.tsx`)

Dynamic React component with:

- **Real-time Data**: Live updates from MongoDB
- **Advanced Filtering**: Multi-criteria search
- **Interactive UI**: Modern, responsive design
- **Bulk Operations**: Mass selection and actions
- **Export Functionality**: Download as JSON/CSV
- **User Activity**: Individual user tracking
- **Compliance Features**: HIPAA/GDPR indicators

### 2. Audit Log Service (`src/services/adminAuditLogService.ts`)

TypeScript service with:

- **Type Safety**: Full TypeScript interfaces
- **API Integration**: Complete backend integration
- **Error Handling**: Robust error management
- **Utility Functions**: Helper methods for UI
- **Export Functions**: File download capabilities

## 📡 API Endpoints

### Authentication Required
All endpoints require admin authentication via JWT token.

### Query Parameters

#### Get All Audit Logs
```
GET /api/admin/audit-logs?page=1&limit=50&action=user_login&severity=high&status=success&search=admin&startDate=2024-01-01&endDate=2024-12-31&sortBy=timestamp&sortOrder=desc&complianceOnly=true
```

**Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50)
- `action`: Filter by action type
- `severity`: Filter by severity level
- `status`: Filter by status
- `targetType`: Filter by target type
- `userId`: Filter by user ID
- `search`: Text search across multiple fields
- `startDate`: Start date for range filtering
- `endDate`: End date for range filtering
- `sortBy`: Sort field (timestamp, action, severity, etc.)
- `sortOrder`: Sort direction (asc, desc)
- `complianceOnly`: Filter compliance-relevant logs only

#### Get Statistics
```
GET /api/admin/audit-logs/stats?startDate=2024-01-01&endDate=2024-12-31
```

#### Export Logs
```
GET /api/admin/audit-logs/export?format=json&startDate=2024-01-01&endDate=2024-12-31
```

**Formats:** `json`, `csv`

### Request/Response Examples

#### Create Audit Log
```javascript
POST /api/admin/audit-logs
{
  "userId": "507f1f77bcf86cd799439011",
  "action": "user_login",
  "targetType": "user",
  "targetId": "507f1f77bcf86cd799439011",
  "targetName": "John Doe",
  "severity": "info",
  "status": "success",
  "details": "User logged in successfully",
  "metadata": {
    "browser": "Chrome",
    "version": "125.0.0.0",
    "platform": "Windows"
  },
  "complianceTags": ["hipaa"]
}
```

#### Bulk Operation
```javascript
POST /api/admin/audit-logs/bulk
{
  "operation": "mark_compliance",
  "logIds": ["507f1f77bcf86cd799439011"],
  "data": {
    "tags": ["gdpr", "hipaa"]
  }
}
```

## 🗄️ Database Schema

### Indexes for Performance
```javascript
// Single field indexes
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ severity: 1, timestamp: -1 });
auditLogSchema.index({ status: 1, timestamp: -1 });

// Compound indexes
auditLogSchema.index({ userId: 1, action: 1, timestamp: -1 });
auditLogSchema.index({ severity: 1, status: 1, timestamp: -1 });
auditLogSchema.index({ targetType: 1, action: 1, timestamp: -1 });

// Compliance indexes
auditLogSchema.index({ isComplianceRelevant: 1, timestamp: -1 });
auditLogSchema.index({ complianceTags: 1, timestamp: -1 });
```

### Aggregation Methods
```javascript
// System statistics
AuditLog.getSystemStats(startDate, endDate)

// Action statistics
AuditLog.getActionStats(startDate, endDate)

// User statistics
AuditLog.getUserStats(startDate, endDate)

// Security alerts
AuditLog.getSecurityAlerts(startDate, endDate)

// User activity
AuditLog.getUserActivity(userId, options)
```

## 🚀 Installation & Setup

### 1. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Set environment variables
cp .env.example .env

# Configure MongoDB connection
MONGODB_URI=mongodb://localhost:27017/healthsecure

# Configure Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Start the server
npm run dev
```

### 2. Frontend Setup

```bash
cd ..

# Install dependencies
npm install

# Start the frontend
npm run dev
```

### 3. Database Setup

```bash
# Create indexes for performance
cd server
node -e "
const mongoose = require('mongoose');
const AuditLog = require('./src/models/AuditLog.js');

mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log('Creating indexes...');
  return AuditLog.createIndexes();
}).then(() => {
  console.log('Indexes created successfully');
  process.exit(0);
}).catch(console.error);
"
```

## 📖 Usage Examples

### 1. Creating Audit Logs

```javascript
// In your application code
import AuditLog from '../models/AuditLog.js';

const createAuditEntry = async (req, user, action, details) => {
  const auditLog = new AuditLog({
    userId: user._id,
    userEmail: user.email,
    userName: `${user.firstName} ${user.lastName}`,
    userRole: user.role,
    action: action,
    targetType: 'user',
    targetId: user._id,
    targetName: user.email,
    severity: 'info',
    status: 'success',
    ipAddress: req.ip,
    userAgent: req.get('User-Agent'),
    requestMethod: req.method,
    requestUrl: req.originalUrl,
    requestId: req.id,
    details: details
  });

  await auditLog.save();
};
```

### 2. Monitoring Security Events

```javascript
// Monitor failed login attempts
const monitorLoginAttempts = async (userId, success, ipAddress) => {
  const auditLog = new AuditLog({
    userId: userId,
    action: success ? 'user_login' : 'login_failed',
    targetType: 'user',
    severity: success ? 'info' : 'warning',
    status: success ? 'success' : 'failed',
    ipAddress: ipAddress,
    details: success ? 'Login successful' : 'Failed login attempt'
  });

  await auditLog.save();

  // Check for suspicious activity
  if (!success) {
    const recentFailures = await AuditLog.countDocuments({
      userId: userId,
      action: 'login_failed',
      timestamp: { $gte: new Date(Date.now() - 15 * 60 * 1000) } // 15 minutes
    });

    if (recentFailures >= 5) {
      // Create security alert
      await new AuditLog({
        userId: userId,
        action: 'security_alert',
        targetType: 'user',
        severity: 'high',
        status: 'blocked',
        details: 'Multiple failed login attempts detected'
      }).save();
    }
  }
};
```

### 3. Compliance Tracking

```javascript
// Track HIPAA compliance
const trackHIPAACompliance = async (userId, action, recordId) => {
  const auditLog = new AuditLog({
    userId: userId,
    action: action,
    targetType: 'health_record',
    targetId: recordId,
    severity: 'info',
    status: 'success',
    details: `HIPAA-compliant ${action} operation`,
    isComplianceRelevant: true,
    complianceTags: ['hipaa']
  });

  await auditLog.save();
};
```

## 🧪 Testing

### Run Test Suite

```bash
cd server
node test-audit-log-system.js
```

### Test Coverage

The test suite covers:

- ✅ **CRUD Operations**: Create, read, update, delete
- ✅ **Filtering & Search**: All filter combinations
- ✅ **Statistics**: System and user analytics
- ✅ **Export Functionality**: JSON and CSV export
- ✅ **Bulk Operations**: Mass updates and actions
- ✅ **Error Handling**: Invalid requests and edge cases
- ✅ **Performance**: Concurrent requests and large datasets
- ✅ **MongoDB Aggregations**: Complex queries and statistics
- ✅ **Authentication**: Admin-only access control

### Manual Testing

1. **Access Admin Panel**: Navigate to `/admin/audit-logs`
2. **Test Filtering**: Use different filter combinations
3. **Test Search**: Search for specific terms
4. **Test Export**: Download logs in different formats
5. **Test Bulk Operations**: Select multiple logs and perform actions
6. **Test User Activity**: View individual user activity
7. **Test Compliance**: Filter compliance-relevant logs

## 🔒 Security & Compliance

### Security Features

- **Authentication**: JWT-based admin authentication
- **Authorization**: Role-based access control
- **Input Validation**: Comprehensive request validation
- **SQL Injection Protection**: Mongoose ODM protection
- **XSS Protection**: Input sanitization
- **Rate Limiting**: API rate limiting
- **Audit Trail**: Complete change tracking

### Compliance Features

- **HIPAA Compliance**: Healthcare data tracking
- **GDPR Compliance**: Privacy and data protection
- **SOX Compliance**: Financial controls
- **Data Retention**: Configurable retention periods
- **Audit Reports**: Compliance reporting
- **Data Export**: Right to data portability

### Data Protection

- **Encryption**: Data encryption at rest and in transit
- **Access Logging**: All access attempts logged
- **Session Management**: Secure session handling
- **File Security**: Secure file upload and storage
- **Backup Security**: Encrypted backups

## 🛠️ Troubleshooting

### Common Issues

#### 1. MongoDB Connection Issues
```bash
# Check MongoDB status
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod

# Check connection string
echo $MONGODB_URI
```

#### 2. Cloudinary Upload Issues
```bash
# Verify Cloudinary credentials
node -e "
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
cloudinary.api.ping().then(console.log).catch(console.error);
"
```

#### 3. Performance Issues
```bash
# Check database indexes
cd server
node -e "
const mongoose = require('mongoose');
const AuditLog = require('./src/models/AuditLog.js');
mongoose.connect(process.env.MONGODB_URI).then(() => {
  return AuditLog.listIndexes();
}).then(console.log).catch(console.error);
"
```

#### 4. Memory Issues
```bash
# Monitor memory usage
node --max-old-space-size=4096 server.js

# Check for memory leaks
npm install -g clinic
clinic doctor -- node server.js
```

### Performance Optimization

1. **Database Indexes**: Ensure all indexes are created
2. **Query Optimization**: Use proper MongoDB queries
3. **Pagination**: Implement proper pagination
4. **Caching**: Use Redis for frequently accessed data
5. **Compression**: Enable gzip compression
6. **CDN**: Use Cloudinary CDN for files

### Monitoring

```bash
# Monitor API performance
npm install -g artillery
artillery quick --count 100 --num 10 http://localhost:5000/api/admin/audit-logs

# Monitor database performance
db.audit_logs.find().explain("executionStats")

# Monitor memory usage
node --inspect server.js
```

## 📈 Future Enhancements

### Planned Features

1. **Real-time Notifications**: WebSocket-based alerts
2. **Advanced Analytics**: Machine learning insights
3. **Custom Dashboards**: Configurable dashboards
4. **API Rate Limiting**: Advanced rate limiting
5. **Data Archiving**: Automatic data archiving
6. **Integration APIs**: Third-party integrations
7. **Mobile App**: React Native mobile app
8. **Advanced Search**: Elasticsearch integration

### Scalability Improvements

1. **Database Sharding**: Horizontal scaling
2. **Microservices**: Service decomposition
3. **Load Balancing**: Multiple server instances
4. **Caching Layer**: Redis cluster
5. **CDN Integration**: Global content delivery
6. **Auto-scaling**: Cloud auto-scaling

## 📞 Support

For support and questions:

- **Documentation**: Check this README
- **Issues**: Create GitHub issues
- **Testing**: Run test suite
- **Monitoring**: Check server logs
- **Performance**: Use monitoring tools

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**🎉 The audit log system is now fully functional with MongoDB backend, Cloudinary integration, and dynamic React frontend!** 