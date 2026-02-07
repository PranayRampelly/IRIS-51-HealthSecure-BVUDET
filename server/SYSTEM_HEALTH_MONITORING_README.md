# System Health Monitoring System

A comprehensive real-time system health monitoring solution for the HealthSecure platform, providing 100% dynamic monitoring of system resources, services, database health, security status, and performance metrics.

## 🚀 Features

### 📊 Real-time System Metrics
- **CPU Monitoring**: Usage percentage, core count, model, speed
- **Memory Monitoring**: Usage, total, used, free memory
- **Disk Monitoring**: Usage percentage, total, used, free space
- **Network Monitoring**: Input/output traffic, total bandwidth
- **System Information**: Uptime, load averages, platform, architecture

### 🔧 Service Health Monitoring
- **HTTP Services**: Health checks for API endpoints
- **Database Services**: MongoDB connectivity and performance
- **File Storage**: Cloudinary service status
- **Email Services**: SMTP availability
- **Encryption Services**: Security service health
- **Response Time Tracking**: Service performance metrics

### 🗄️ Database Health Monitoring
- **Connection Pool**: Active connections monitoring
- **Query Performance**: Queries per second, slow query detection
- **Cache Performance**: Hit ratios and optimization metrics
- **Storage Metrics**: Data size, storage size, index size
- **Health Indicators**: Deadlocks, collection counts, index counts

### 🚨 Alert System
- **Real-time Alerts**: Automatic detection of system issues
- **Severity Levels**: Critical, warning, and info alerts
- **Service-specific Alerts**: Targeted notifications for different services
- **Alert Resolution**: Track resolved vs. active alerts
- **Threshold Monitoring**: Configurable alert thresholds

### 🛡️ Security Monitoring
- **SSL Certificate Monitoring**: Expiration tracking and validation
- **Security Scans**: Vulnerability, malware, and dependency scans
- **Authentication Metrics**: Active sessions, failed logins, blocked IPs
- **Firewall Status**: Network security monitoring
- **Encryption Status**: Data protection monitoring

### 📈 Performance Analytics
- **Historical Data**: 24-hour performance trends
- **Resource Trends**: CPU, memory, and network usage patterns
- **Capacity Planning**: Data for infrastructure scaling
- **Performance Alerts**: Automatic detection of performance issues

### 🎯 Health Scoring
- **Overall Health Score**: 0-100 comprehensive system health rating
- **Multi-factor Analysis**: System resources, services, alerts, security
- **Status Classification**: Excellent, Good, Fair, Poor
- **Trend Analysis**: Health score changes over time

## 🏗️ Architecture

### Backend Components
```
server/src/
├── controllers/
│   └── systemHealthController.js    # Main monitoring logic
├── routes/
│   └── systemHealth.js              # API endpoints
└── server.js                        # Route registration
```

### Data Flow
1. **System Metrics Collection**: OS-level resource monitoring
2. **Service Health Checks**: HTTP, database, and external service monitoring
3. **Database Analytics**: MongoDB performance and health metrics
4. **Security Assessment**: SSL, scans, and authentication monitoring
5. **Alert Generation**: Automatic issue detection and notification
6. **Data Caching**: 30-second cache for performance optimization
7. **API Response**: Structured JSON data for frontend consumption

### Caching Strategy
- **Cache Duration**: 30 seconds
- **Cache Scope**: Shared across all admin users
- **Cache Invalidation**: Automatic TTL or manual refresh
- **Performance Impact**: Reduces system load while maintaining freshness

## 📡 API Endpoints

### Base URL
```
http://localhost:5000/api/admin/system-health
```

### Available Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Complete system health data |
| GET | `/metrics` | System metrics only |
| GET | `/services` | Service status |
| GET | `/database` | Database health |
| GET | `/alerts` | System alerts |
| GET | `/security` | Security status |
| GET | `/performance` | Performance data |
| GET | `/summary` | Health summary |
| POST | `/refresh` | Force refresh |

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+
- MongoDB
- Admin user account
- Cloudinary account (for file storage monitoring)

### Environment Variables
```env
# Database
MONGODB_URI=mongodb://localhost:27017/healthsecure

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Cloudinary (for file storage monitoring)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Server
PORT=5000
NODE_ENV=development
```

### Installation Steps
```bash
# 1. Navigate to server directory
cd server

# 2. Install dependencies
npm install

# 3. Start the server
npm run dev

# 4. Test the API
node test-system-health-api.js
```

## 🔧 Configuration

### Service Definitions
Services are defined in `systemHealthController.js`:

```javascript
const serviceDefinitions = [
  {
    name: 'API Gateway',
    port: 5000,
    endpoint: '/health',
    type: 'http'
  },
  {
    name: 'Database',
    port: 27017,
    type: 'mongodb'
  },
  // Add more services as needed
];
```

### Alert Thresholds
Configure alert thresholds in the monitoring logic:

```javascript
// Memory alert threshold
if (systemMetrics.memory.usage > 80) {
  // Generate warning alert
}

// CPU alert threshold
if (systemMetrics.cpu.usage > 90) {
  // Generate critical alert
}

// Disk alert threshold
if (systemMetrics.disk.usage > 85) {
  // Generate warning alert
}
```

### Cache Configuration
Adjust cache settings for your needs:

```javascript
const metricsCache = {
  // ... other properties
  cacheTTL: 30000 // 30 seconds - adjust as needed
};
```

## 📊 Usage Examples

### Get Complete System Health
```bash
curl -X GET http://localhost:5000/api/admin/system-health \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get System Metrics Only
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

## 🧪 Testing

### Automated Test Suite
Run the comprehensive test suite:

```bash
node test-system-health-api.js
```

The test suite covers:
- Authentication and authorization
- All API endpoints
- Data validation
- Error handling
- Performance testing

### Manual Testing
Use tools like Postman, cURL, or Insomnia to test endpoints manually.

### Test Coverage
- ✅ Complete system health endpoint
- ✅ Individual metric endpoints
- ✅ Service health checks
- ✅ Database monitoring
- ✅ Alert system
- ✅ Security monitoring
- ✅ Performance data
- ✅ Health scoring
- ✅ Error handling
- ✅ Authentication

## 🔍 Monitoring Features

### Real-time Metrics Collection
- **OS-level Monitoring**: CPU, memory, disk, network
- **Process Monitoring**: Node.js process metrics
- **Platform Detection**: Windows/Linux/macOS support
- **Resource Formatting**: Human-readable byte formatting

### Service Health Checks
- **HTTP Health Checks**: Endpoint availability testing
- **Database Connectivity**: MongoDB connection status
- **External Services**: Cloudinary, SMTP, etc.
- **Response Time Tracking**: Performance monitoring
- **Error Detection**: Service failure identification

### Database Analytics
- **Connection Pool Monitoring**: Active connection tracking
- **Query Performance**: Operations per second
- **Storage Analytics**: Data and index sizes
- **Performance Indicators**: Cache hit ratios, slow queries
- **Health Metrics**: Deadlocks, collection counts

### Security Monitoring
- **SSL Certificate Tracking**: Expiration monitoring
- **Security Scan Results**: Vulnerability assessments
- **Authentication Metrics**: Session and login monitoring
- **Network Security**: Firewall and encryption status

### Alert Management
- **Automatic Detection**: Threshold-based alerting
- **Severity Classification**: Critical, warning, info
- **Service Attribution**: Alert-to-service mapping
- **Resolution Tracking**: Alert lifecycle management

## 📈 Performance Optimization

### Caching Strategy
- **30-second TTL**: Balance between freshness and performance
- **Shared Cache**: Reduce redundant system calls
- **Smart Invalidation**: Manual refresh capability
- **Memory Efficient**: Minimal memory footprint

### Efficient Data Collection
- **Async Operations**: Non-blocking metric collection
- **Error Handling**: Graceful degradation on failures
- **Resource Management**: Proper cleanup and memory management
- **Platform Optimization**: OS-specific optimizations

### API Performance
- **Response Optimization**: Minimal data transfer
- **Endpoint Specialization**: Specific data endpoints
- **Error Handling**: Fast failure responses
- **Authentication**: Efficient token validation

## 🔒 Security Features

### Authentication & Authorization
- **JWT-based Authentication**: Secure token-based access
- **Admin-only Access**: Role-based authorization
- **Token Validation**: Secure token verification
- **Access Logging**: Comprehensive audit trails

### Data Security
- **No Sensitive Data Exposure**: Secure metric collection
- **Input Validation**: Comprehensive request validation
- **Error Sanitization**: Safe error message handling
- **Rate Limiting**: Protection against abuse

### Monitoring Security
- **Secure Health Checks**: Protected endpoint monitoring
- **Encrypted Communications**: HTTPS/TLS support
- **Audit Logging**: All access attempts logged
- **Security Metrics**: Authentication and security monitoring

## 🚨 Alert System

### Alert Types
- **System Alerts**: CPU, memory, disk usage
- **Service Alerts**: Service failures and performance issues
- **Database Alerts**: Connection and performance problems
- **Security Alerts**: SSL expiration, security scan issues

### Alert Severity
- **Critical**: Immediate attention required
- **Warning**: Attention needed soon
- **Info**: Informational messages

### Alert Management
- **Automatic Generation**: Threshold-based alerting
- **Manual Resolution**: Alert status tracking
- **Historical Tracking**: Alert history and trends
- **Service Attribution**: Alert-to-service mapping

## 📊 Health Scoring

### Score Calculation
The overall health score (0-100) is calculated based on:

- **System Resources** (40%): CPU, memory, disk usage
- **Service Status** (30%): Failed/warning services
- **Alerts** (20%): Critical and warning alerts
- **Security** (10%): SSL and security scan status

### Score Ranges
- **90-100**: Excellent (🟢)
- **70-89**: Good (🟡)
- **50-69**: Fair (🟠)
- **0-49**: Poor (🔴)

### Score Factors
- **Resource Usage**: High usage reduces score
- **Service Failures**: Failed services significantly impact score
- **Critical Alerts**: Each critical alert reduces score
- **Security Issues**: SSL and security problems affect score

## 🔧 Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify JWT token is valid and not expired
   - Check admin role in token payload
   - Ensure Authorization header format is correct

2. **Service Health Check Failures**
   - Verify service endpoints are accessible
   - Check network connectivity
   - Ensure proper service configuration

3. **Database Connection Issues**
   - Verify MongoDB connection string
   - Check database server status
   - Ensure proper database permissions

4. **System Metric Collection Errors**
   - Check OS permissions for system calls
   - Verify platform-specific commands
   - Ensure proper error handling

### Debug Mode
Enable debug logging:

```env
NODE_ENV=development
DEBUG=system-health:*
```

### Performance Issues
- **High Response Times**: Check cache configuration
- **Memory Usage**: Monitor cache size and TTL
- **CPU Usage**: Optimize metric collection frequency
- **Network Issues**: Verify service endpoint accessibility

## 📚 Integration

### Frontend Integration
The frontend can integrate with these endpoints to:

1. **Real-time Dashboard**: Poll main endpoint every 30 seconds
2. **Specific Widgets**: Use individual endpoints for components
3. **Alert Management**: Monitor alerts endpoint for new issues
4. **Performance Charts**: Use performance endpoint for historical data
5. **Health Score Display**: Show summary endpoint for overall status

### External Monitoring
Integrate with external monitoring tools:

- **Prometheus**: Export metrics for Prometheus scraping
- **Grafana**: Use data for Grafana dashboards
- **PagerDuty**: Send alerts to PagerDuty
- **Slack**: Post alerts to Slack channels
- **Email**: Send alert notifications via email

### API Integration
Use the REST API to integrate with:

- **Custom Dashboards**: Build custom monitoring interfaces
- **Mobile Apps**: Monitor system health on mobile devices
- **Third-party Tools**: Integrate with existing monitoring solutions
- **Automation Scripts**: Automated health checks and responses

## 🚀 Deployment

### Production Considerations
1. **Environment Variables**: Use strong, unique secrets
2. **Database**: Use MongoDB Atlas or similar managed service
3. **SSL/TLS**: Enable HTTPS in production
4. **Rate Limiting**: Adjust limits based on expected traffic
5. **Monitoring**: Set up application monitoring and alerting
6. **Backup**: Implement data backup strategies

### Docker Support
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Scaling Considerations
- **Horizontal Scaling**: Multiple server instances
- **Load Balancing**: Distribute monitoring load
- **Database Scaling**: MongoDB replica sets or sharding
- **Cache Distribution**: Redis for shared caching
- **Service Discovery**: Dynamic service endpoint discovery

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Follow the existing code style
2. Add comprehensive tests for new features
3. Update documentation for API changes
4. Ensure all monitoring is in place
5. Test with different system configurations

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Run the test suite to verify functionality
4. Check server logs for detailed error information
5. Review system requirements and configuration 