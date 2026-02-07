# Insurance Proof Request System

## Overview

The Insurance Proof Request System is a comprehensive backend solution for managing proof requests between insurance companies and patients. This system enables insurance companies to request medical proofs from patients for claim verification, with advanced features for tracking, analytics, and template management.

## Features

### 🎯 Core Features
- **Proof Request Management**: Create, update, and track proof requests
- **Template System**: Reusable templates for common proof requests
- **File Upload**: Secure attachment uploads with Cloudinary integration
- **Follow-up System**: Automated and manual follow-up capabilities
- **Analytics Dashboard**: Comprehensive analytics and reporting
- **Bulk Operations**: Mass actions on multiple requests
- **Real-time Updates**: WebSocket integration for live updates

### 📊 Advanced Features
- **Priority Management**: Urgency levels and priority scoring
- **Status Tracking**: Complete lifecycle management
- **Response Time Analytics**: Performance monitoring
- **Category Classification**: Organized request categorization
- **Tag System**: Flexible tagging for organization
- **Export Functionality**: Data export in multiple formats

## System Architecture

### Database Models

#### ProofRequest
```javascript
{
  requestId: String,           // Auto-generated unique ID
  patient: {                   // Patient information
    id: ObjectId,
    name: String,
    email: String,
    phone: String,
    policyNumber: String,
    policyType: String
  },
  proofType: String,           // Type of proof required
  status: String,              // pending, fulfilled, rejected, expired, cancelled
  urgency: String,             // low, medium, high, urgent
  priority: Number,            // 1-4 priority levels
  category: String,            // emergency, routine, preventive, etc.
  requestDate: Date,
  dueDate: Date,
  reason: String,
  notes: String,
  attachments: [Attachment],   // File attachments
  autoFollowUp: Boolean,
  notifyPatient: Boolean,
  assignedTo: ObjectId,
  responseTime: Number,        // Hours to fulfillment
  followUps: [FollowUp],
  followUpCount: Number,
  template: {                  // Associated template
    id: ObjectId,
    name: String
  },
  createdBy: ObjectId,
  updatedBy: ObjectId,
  fulfilledAt: Date,
  fulfilledBy: ObjectId,
  rejectionReason: String,
  tags: [String],
  metadata: Map
}
```

#### ProofTemplate
```javascript
{
  name: String,
  description: String,
  proofType: String,
  defaultUrgency: String,
  defaultReason: String,
  category: String,
  defaultPriority: Number,
  defaultDueDays: Number,
  isDefault: Boolean,
  isActive: Boolean,
  usageCount: Number,
  tags: [String],
  createdBy: ObjectId,
  updatedBy: ObjectId,
  lastUsed: Date
}
```

### API Endpoints

#### Proof Requests
- `POST /api/proof-requests` - Create new proof request
- `GET /api/proof-requests` - Get all proof requests with filtering
- `GET /api/proof-requests/:id` - Get specific proof request
- `PUT /api/proof-requests/:id` - Update proof request
- `DELETE /api/proof-requests/:id` - Delete proof request
- `PUT /api/proof-requests/:id/fulfill` - Fulfill proof request
- `PUT /api/proof-requests/:id/reject` - Reject proof request
- `POST /api/proof-requests/:id/follow-up` - Send follow-up
- `POST /api/proof-requests/:id/attachments` - Upload attachments
- `GET /api/proof-requests/analytics` - Get analytics
- `POST /api/proof-requests/bulk-action` - Bulk operations

#### Proof Templates
- `POST /api/proof-templates` - Create template
- `GET /api/proof-templates` - Get all templates
- `GET /api/proof-templates/:id` - Get specific template
- `PUT /api/proof-templates/:id` - Update template
- `DELETE /api/proof-templates/:id` - Delete template
- `PUT /api/proof-templates/:id/set-default` - Set as default
- `GET /api/proof-templates/type/:proofType` - Get by proof type
- `GET /api/proof-templates/default` - Get default templates
- `GET /api/proof-templates/stats` - Get usage statistics
- `POST /api/proof-templates/:id/duplicate` - Duplicate template
- `GET /api/proof-templates/export` - Export templates

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- Redis (for caching and sessions)
- Cloudinary account (for file storage)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd server
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Configuration**
Create a `.env` file in the server directory:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/healthsecure
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=24h

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Server
PORT=5000
NODE_ENV=development

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

4. **Database Setup**
```bash
# Start MongoDB
mongod

# Start Redis
redis-server
```

5. **Run the server**
```bash
npm start
```

### Testing

Run the comprehensive test suite:
```bash
node test-proof-request-api.js
```

## Usage Examples

### Creating a Proof Request

```javascript
const proofRequestData = {
  patientId: '507f1f77bcf86cd799439011',
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

const response = await fetch('/api/proof-requests', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(proofRequestData)
});
```

### Uploading Attachments

```javascript
const formData = new FormData();
formData.append('files', file1);
formData.append('files', file2);

const response = await fetch(`/api/proof-requests/${requestId}/attachments`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### Creating a Template

```javascript
const templateData = {
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

const response = await fetch('/api/proof-templates', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(templateData)
});
```

### Bulk Operations

```javascript
const bulkData = {
  ids: ['request1', 'request2', 'request3'],
  action: 'fulfill',
  data: {
    reason: 'Bulk fulfillment'
  }
};

const response = await fetch('/api/proof-requests/bulk-action', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(bulkData)
});
```

## Frontend Integration

### Service Layer

The frontend includes a comprehensive service layer (`proofRequestService.ts`) that provides:

- Type-safe API calls
- File upload handling
- Error management
- Utility functions for formatting and validation

### Key Features

1. **Real-time Updates**: WebSocket integration for live updates
2. **File Management**: Secure file upload with progress tracking
3. **Template System**: Pre-built templates for common requests
4. **Analytics Dashboard**: Visual analytics and reporting
5. **Bulk Operations**: Mass actions with confirmation dialogs

## Security Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (insurance, admin, doctor)
- Session management with Redis

### File Security
- File type validation
- Size limits (10MB per file, 5 files max)
- Cloudinary integration with secure URLs
- Automatic cleanup of orphaned files

### Data Protection
- Input validation and sanitization
- Rate limiting (100 req/min, 20 uploads/min)
- SQL injection prevention
- XSS protection

## Monitoring & Logging

### Logging Levels
- **INFO**: General operations and successful requests
- **WARN**: Non-critical issues and warnings
- **ERROR**: Errors and exceptions
- **DEBUG**: Detailed debugging information

### Metrics Tracked
- Request/response times
- File upload success rates
- Template usage statistics
- User activity patterns
- Error rates and types

## Performance Optimization

### Database Optimization
- Indexed fields for fast queries
- Aggregation pipelines for analytics
- Connection pooling
- Query optimization

### Caching Strategy
- Redis caching for frequently accessed data
- Template caching
- Analytics result caching
- Session storage

### File Storage
- Cloudinary CDN for fast file delivery
- Automatic image optimization
- Lazy loading for large files
- Backup and recovery procedures

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Check JWT token validity
   - Verify user permissions
   - Ensure proper role assignment

2. **File Upload Failures**
   - Verify file size limits
   - Check file type restrictions
   - Ensure Cloudinary credentials are correct

3. **Database Connection Issues**
   - Verify MongoDB connection string
   - Check network connectivity
   - Ensure database is running

4. **Performance Issues**
   - Monitor database query performance
   - Check Redis connection
   - Review file upload sizes

### Debug Mode

Enable debug logging:
```bash
NODE_ENV=development DEBUG=* npm start
```

## API Documentation

Complete API documentation is available in:
- `INSURANCE_PROOF_REQUEST_API_DOCUMENTATION.md` - Detailed API reference
- Interactive documentation via Swagger (if configured)

## Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Code Standards
- Follow ESLint configuration
- Use TypeScript for type safety
- Write comprehensive tests
- Document new endpoints

## Support

For technical support:
- Email: support@healthsecure.com
- Documentation: https://docs.healthsecure.com
- GitHub Issues: https://github.com/healthsecure/issues

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Changelog

### Version 1.0.0
- Initial release
- Complete proof request management
- Template system
- File upload functionality
- Analytics dashboard
- Bulk operations
- Real-time updates

---

**Note**: This system is designed to be scalable and maintainable. Regular updates and security patches are recommended to ensure optimal performance and security. 