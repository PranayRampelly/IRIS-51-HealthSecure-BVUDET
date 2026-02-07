# System Health Monitoring API Documentation

This document describes the API endpoints for real-time system health monitoring in the HealthSecure platform.

## Base URL
```
http://localhost:5000/api/admin/system-health
```

## Authentication
All endpoints require authentication with a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Authorization
All endpoints require admin privileges. The user must have `role: 'admin'` in their JWT token.

## Data Caching
System health data is cached for 30 seconds to improve performance. Use the refresh endpoint to force an immediate update.

## Endpoints

### 1. Get Complete System Health
**GET** `/api/admin/system-health`

Returns comprehensive system health data including all metrics, services, database, alerts, security, and performance data.

**Response:**
```json
{
  "system": {
    "cpu": {
      "usage": 45,
      "cores": 8,
      "model": "Intel(R) Core(TM) i7-10700K CPU @ 3.80GHz",
      "speed": 3800
    },
    "memory": {
      "usage": 67,
      "total": "16.0 GB",
      "used": "10.7 GB",
      "free": "5.3 GB"
    },
    "disk": {
      "usage": 23,
      "total": "1.0 TB",
      "used": "230 GB",
      "free": "770 GB"
    },
    "network": {
      "input": "2.5 MB/s",
      "output": "1.8 MB/s",
      "total": "4.3 MB/s"
    },
    "uptime": 86400,
    "loadAverage": [1.2, 1.5, 1.8],
    "platform": "linux",
    "arch": "x64",
    "nodeVersion": "v18.17.0",
    "timestamp": "2024-01-20T15:30:00.000Z"
  },
  "services": [
    {
      "name": "API Gateway",
      "status": "running",
      "uptime": "99.9%",
      "responseTime": "45ms",
      "lastCheck": "2024-01-20T15:30:00.000Z",
      "port": 5000,
      "error": null
    }
  ],
  "database": {
    "totalSize": "2.4 GB",
    "totalDocuments": "15,247",
    "activeConnections": "342",
    "queriesPerSec": "1,247",
    "cacheHitRatio": "94.2%",
    "slowQueries": "12",
    "deadlocks": "0",
    "collections": 25,
    "indexes": 45,
    "dataSize": "1.8 GB",
    "storageSize": "2.1 GB",
    "indexSize": "300 MB"
  },
  "alerts": [
    {
      "id": 1705758600001,
      "severity": "warning",
      "message": "Memory usage above 80% threshold (67%)",
      "service": "System",
      "timestamp": "2024-01-20T15:30:00.000Z",
      "resolved": false
    }
  ],
  "security": {
    "sslCertificates": [
      {
        "name": "Main Domain",
        "status": "valid",
        "expiresAt": "2024-02-20T00:00:00.000Z",
        "issuer": "Let's Encrypt"
      }
    ],
    "securityScans": [
      {
        "name": "Vulnerability Scan",
        "status": "clean",
        "lastScan": "2024-01-20T12:00:00.000Z",
        "details": "No critical vulnerabilities detected"
      }
    ],
    "authMetrics": {
      "activeSessions": 125,
      "failedLoginAttempts": 3,
      "blockedIPs": 1,
      "lastSecurityIncident": "2024-01-15T10:30:00.000Z"
    },
    "firewallStatus": "active",
    "encryptionStatus": "enabled",
    "lastSecurityUpdate": "2024-01-20T08:00:00.000Z"
  },
  "performance": [
    {
      "time": "00:00",
      "cpu": 30,
      "memory": 45,
      "network": 20
    }
  ],
  "lastUpdate": "2024-01-20T15:30:00.000Z",
  "cacheAge": 15000
}
```

### 2. Get System Metrics Only
**GET** `/api/admin/system-health/metrics`

Returns only system-level metrics (CPU, memory, disk, network).

**Response:**
```json
{
  "metrics": {
    "cpu": {
      "usage": 45,
      "cores": 8,
      "model": "Intel(R) Core(TM) i7-10700K CPU @ 3.80GHz",
      "speed": 3800
    },
    "memory": {
      "usage": 67,
      "total": "16.0 GB",
      "used": "10.7 GB",
      "free": "5.3 GB"
    },
    "disk": {
      "usage": 23,
      "total": "1.0 TB",
      "used": "230 GB",
      "free": "770 GB"
    },
    "network": {
      "input": "2.5 MB/s",
      "output": "1.8 MB/s",
      "total": "4.3 MB/s"
    },
    "uptime": 86400,
    "loadAverage": [1.2, 1.5, 1.8],
    "platform": "linux",
    "arch": "x64",
    "nodeVersion": "v18.17.0",
    "timestamp": "2024-01-20T15:30:00.000Z"
  },
  "lastUpdate": "2024-01-20T15:30:00.000Z"
}
```

### 3. Get Service Status
**GET** `/api/admin/system-health/services`

Returns the status of all monitored services.

**Response:**
```json
{
  "services": [
    {
      "name": "API Gateway",
      "status": "running",
      "uptime": "99.9%",
      "responseTime": "45ms",
      "lastCheck": "2024-01-20T15:30:00.000Z",
      "port": 5000,
      "error": null
    },
    {
      "name": "Database",
      "status": "running",
      "uptime": "99.8%",
      "responseTime": "12ms",
      "lastCheck": "2024-01-20T15:30:00.000Z",
      "port": 27017,
      "error": null
    },
    {
      "name": "Authentication Service",
      "status": "running",
      "uptime": "99.9%",
      "responseTime": "23ms",
      "lastCheck": "2024-01-20T15:30:00.000Z",
      "port": 5000,
      "error": null
    },
    {
      "name": "File Storage",
      "status": "running",
      "uptime": "97.2%",
      "responseTime": "156ms",
      "lastCheck": "2024-01-20T15:30:00.000Z",
      "port": null,
      "error": null
    },
    {
      "name": "Email Service",
      "status": "running",
      "uptime": "98.5%",
      "responseTime": "78ms",
      "lastCheck": "2024-01-20T15:30:00.000Z",
      "port": null,
      "error": null
    },
    {
      "name": "Encryption Service",
      "status": "running",
      "uptime": "99.5%",
      "responseTime": "34ms",
      "lastCheck": "2024-01-20T15:30:00.000Z",
      "port": 5000,
      "error": null
    }
  ],
  "lastUpdate": "2024-01-20T15:30:00.000Z"
}
```

### 4. Get Database Health
**GET** `/api/admin/system-health/database`

Returns detailed database health metrics.

**Response:**
```json
{
  "database": {
    "totalSize": "2.4 GB",
    "totalDocuments": "15,247",
    "activeConnections": "342",
    "queriesPerSec": "1,247",
    "cacheHitRatio": "94.2%",
    "slowQueries": "12",
    "deadlocks": "0",
    "collections": 25,
    "indexes": 45,
    "dataSize": "1.8 GB",
    "storageSize": "2.1 GB",
    "indexSize": "300 MB"
  },
  "lastUpdate": "2024-01-20T15:30:00.000Z"
}
```

### 5. Get System Alerts
**GET** `/api/admin/system-health/alerts`

Returns current system alerts and notifications.

**Response:**
```json
{
  "alerts": [
    {
      "id": 1705758600001,
      "severity": "warning",
      "message": "Memory usage above 80% threshold (67%)",
      "service": "System",
      "timestamp": "2024-01-20T15:30:00.000Z",
      "resolved": false
    },
    {
      "id": 1705758600002,
      "severity": "critical",
      "message": "SSL certificate expires in 7 days",
      "service": "Security",
      "timestamp": "2024-01-20T15:00:00.000Z",
      "resolved": false
    },
    {
      "id": 1705758600003,
      "severity": "info",
      "message": "System backup completed successfully",
      "service": "System",
      "timestamp": "2024-01-20T14:00:00.000Z",
      "resolved": true
    }
  ],
  "lastUpdate": "2024-01-20T15:30:00.000Z"
}
```

### 6. Get Security Status
**GET** `/api/admin/system-health/security`

Returns security-related information including SSL certificates, security scans, and authentication metrics.

**Response:**
```json
{
  "security": {
    "sslCertificates": [
      {
        "name": "Main Domain",
        "status": "valid",
        "expiresAt": "2024-02-20T00:00:00.000Z",
        "issuer": "Let's Encrypt"
      },
      {
        "name": "API Gateway",
        "status": "expires-soon",
        "expiresAt": "2024-01-25T00:00:00.000Z",
        "issuer": "Let's Encrypt"
      },
      {
        "name": "Admin Panel",
        "status": "valid",
        "expiresAt": "2024-03-05T00:00:00.000Z",
        "issuer": "Let's Encrypt"
      }
    ],
    "securityScans": [
      {
        "name": "Vulnerability Scan",
        "status": "clean",
        "lastScan": "2024-01-20T12:00:00.000Z",
        "details": "No critical vulnerabilities detected"
      },
      {
        "name": "Malware Scan",
        "status": "clean",
        "lastScan": "2024-01-20T06:00:00.000Z",
        "details": "No malware detected"
      },
      {
        "name": "Dependency Scan",
        "status": "updates-available",
        "lastScan": "2024-01-20T18:00:00.000Z",
        "details": "5 packages have available updates"
      }
    ],
    "authMetrics": {
      "activeSessions": 125,
      "failedLoginAttempts": 3,
      "blockedIPs": 1,
      "lastSecurityIncident": "2024-01-15T10:30:00.000Z"
    },
    "firewallStatus": "active",
    "encryptionStatus": "enabled",
    "lastSecurityUpdate": "2024-01-20T08:00:00.000Z"
  },
  "lastUpdate": "2024-01-20T15:30:00.000Z"
}
```

### 7. Get Performance Data
**GET** `/api/admin/system-health/performance`

Returns historical performance data for the last 24 hours.

**Response:**
```json
{
  "performance": [
    {
      "time": "00:00",
      "cpu": 30,
      "memory": 45,
      "network": 20
    },
    {
      "time": "04:00",
      "cpu": 25,
      "memory": 42,
      "network": 15
    },
    {
      "time": "08:00",
      "cpu": 55,
      "memory": 65,
      "network": 45
    },
    {
      "time": "12:00",
      "cpu": 45,
      "memory": 67,
      "network": 34
    },
    {
      "time": "16:00",
      "cpu": 38,
      "memory": 58,
      "network": 28
    },
    {
      "time": "20:00",
      "cpu": 42,
      "memory": 62,
      "network": 32
    },
    {
      "time": "24:00",
      "cpu": 35,
      "memory": 50,
      "network": 25
    }
  ],
  "lastUpdate": "2024-01-20T15:30:00.000Z"
}
```

### 8. Get System Health Summary
**GET** `/api/admin/system-health/summary`

Returns a high-level summary of system health with an overall health score.

**Response:**
```json
{
  "overallHealth": 85,
  "status": "good",
  "systemMetrics": {
    "cpu": 45,
    "memory": 67,
    "disk": 23
  },
  "serviceStatus": {
    "total": 6,
    "running": 6,
    "failed": 0,
    "warning": 0
  },
  "alerts": {
    "total": 3,
    "critical": 1,
    "warning": 1,
    "resolved": 1
  },
  "lastUpdate": "2024-01-20T15:30:00.000Z"
}
```

### 9. Force Refresh System Health Data
**POST** `/api/admin/system-health/refresh`

Forces an immediate refresh of all system health data, bypassing the cache.

**Response:**
```json
{
  "message": "System health data refreshed successfully",
  "lastUpdate": "2024-01-20T15:30:00.000Z"
}
```

## Health Score Calculation

The overall health score is calculated based on:

- **System Resources**: CPU, memory, and disk usage
- **Service Status**: Number of failed or warning services
- **Alerts**: Critical and warning alerts
- **Security**: SSL certificate status and security scan results

Score ranges:
- **90-100**: Excellent
- **70-89**: Good
- **50-69**: Fair
- **0-49**: Poor

## Service Status Values

- **running**: Service is healthy and responding
- **warning**: Service has issues but is still functional
- **error**: Service is down or not responding
- **unknown**: Service status cannot be determined

## Alert Severity Levels

- **critical**: Immediate attention required
- **warning**: Attention needed soon
- **info**: Informational message

## Error Responses

### Unauthorized (401)
```json
{
  "message": "No token provided"
}
```

### Forbidden (403)
```json
{
  "message": "Access denied. Admin privileges required."
}
```

### Server Error (500)
```json
{
  "message": "Failed to get system health data"
}
```

## Monitoring Features

### Real-time Metrics
- CPU usage and load averages
- Memory usage and availability
- Disk usage and space
- Network I/O statistics
- System uptime and platform info

### Service Monitoring
- HTTP service health checks
- Database connectivity
- Cloudinary file storage status
- Email service availability
- Encryption service status

### Database Health
- Connection pool status
- Query performance metrics
- Cache hit ratios
- Slow query detection
- Deadlock monitoring

### Security Monitoring
- SSL certificate expiration
- Security scan results
- Authentication metrics
- Firewall status
- Encryption status

### Performance Tracking
- 24-hour historical data
- Resource usage trends
- Performance alerts
- Capacity planning data

## Usage Examples

### Get Complete System Health
```bash
curl -X GET http://localhost:5000/api/admin/system-health \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Only System Metrics
```bash
curl -X GET http://localhost:5000/api/admin/system-health/metrics \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Force Refresh Data
```bash
curl -X POST http://localhost:5000/api/admin/system-health/refresh \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Health Summary
```bash
curl -X GET http://localhost:5000/api/admin/system-health/summary \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Integration with Frontend

The frontend can use these endpoints to:

1. **Real-time Dashboard**: Poll the main endpoint every 30 seconds
2. **Specific Widgets**: Use individual endpoints for specific components
3. **Alert Management**: Monitor the alerts endpoint for new issues
4. **Performance Charts**: Use the performance endpoint for historical data
5. **Health Score**: Display the summary endpoint for overall status

## Caching Strategy

- **Cache Duration**: 30 seconds
- **Cache Invalidation**: Automatic after TTL or manual refresh
- **Cache Scope**: Per-request, shared across all admin users
- **Performance**: Reduces system load while maintaining data freshness 