# Insurance Proof Request Backend Implementation

This document describes the complete backend implementation for the insurance proof request functionality, including MongoDB integration, Cloudinary file management, and comprehensive API endpoints.

## 🏗️ Architecture Overview

The insurance proof request system consists of the following components:

- **MongoDB Models**: Data structure definitions
- **Express Controllers**: Business logic and API handlers
- **Cloudinary Integration**: File upload and management
- **Email Notifications**: Automated communication
- **Authentication & Authorization**: Security middleware
- **API Routes**: RESTful endpoints

## 📊 Database Schema

### ProofRequest Model

The `ProofRequest` model is the core entity that manages insurance proof requests:

```javascript
{
  // Basic Information
  title: String (required),
  description: String (required),
  category: ['medical', 'financial', 'identity', 'employment', 'insurance', 'other'],
  priority: ['low', 'medium', 'high', 'urgent'],
  status: ['pending', 'in_progress', 'fulfilled', 'rejected', 'expired'],
  
  // Request Details
  requestType: ['document', 'verification', 'certification', 'statement', 'other'],
  requiredDocuments: [String],
  customFields: [{
    name: String,
    type: ['text', 'number', 'date', 'file', 'select'],
    required: Boolean,
    options: [String],
    value: Mixed
  }],
  
  // Parties Involved
  requester: ObjectId (ref: User),
  provider: ObjectId (ref: User),
  patient: ObjectId (ref: User),
  
  // Insurance Specific
  insurancePolicy: ObjectId (ref: InsurancePolicy),
  claimId: String,
  policyNumber: String,
  
  // Timeline
  requestedAt: Date,
  dueDate: Date,
  fulfilledAt: Date,
  expiresAt: Date,
  
  // Attachments
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String,
    cloudinaryId: String,
    uploadedAt: Date,
    uploadedBy: ObjectId (ref: User)
  }],
  
  // Communication
  messages: [{
    sender: ObjectId (ref: User),
    message: String,
    timestamp: Date,
    isInternal: Boolean
  }],
  
  // Validation
  validationStatus: ['pending', 'validated', 'failed', 'manual_review'],
  validationDetails: {
    validatedBy: ObjectId (ref: User),
    validatedAt: Date,
    validationNotes: String,
    validationScore: Number
  },
  
  // Security
  accessLevel: ['public', 'restricted', 'confidential', 'secret'],
  allowedViewers: [ObjectId (ref: User)],
  
  // Metadata
  tags: [String],
  notes: String,
  internalNotes: String,
  
  // Audit Trail
  createdBy: ObjectId (ref: User),
  updatedBy: ObjectId (ref: User),
  version: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 API Endpoints

### Core CRUD Operations

#### 1. Create Proof Request
```http
POST /api/proof-requests
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Medical Certificate Request",
  "description": "Need medical certificate for insurance claim",
  "category": "medical",
  "priority": "high",
  "requestType": "document",
  "requiredDocuments": ["medical_certificate", "diagnosis_report"],
  "customFields": [...],
  "providerId": "507f1f77bcf86cd799439011",
  "patientId": "507f1f77bcf86cd799439012",
  "insurancePolicyId": "507f1f77bcf86cd799439013",
  "claimId": "CLM-2024-001",
  "policyNumber": "POL-2024-001",
  "dueDate": "2024-02-15T00:00:00.000Z",
  "accessLevel": "restricted",
  "allowedViewers": [],
  "tags": ["insurance", "medical"],
  "notes": "Urgent request for insurance processing"
}
```

#### 2. Get All Proof Requests
```http
GET /api/proof-requests?page=1&limit=10&status=pending&category=medical&search=medical
Authorization: Bearer <token>
```

#### 3. Get Proof Request by ID
```http
GET /api/proof-requests/:id
Authorization: Bearer <token>
```

#### 4. Update Proof Request
```http
PUT /api/proof-requests/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "priority": "urgent",
  "notes": "Updated notes - urgent processing required"
}
```

#### 5. Delete Proof Request
```http
DELETE /api/proof-requests/:id
Authorization: Bearer <token>
```

### Action Endpoints

#### 6. Fulfill Proof Request
```http
PUT /api/proof-requests/:id/fulfill
Authorization: Bearer <token>
Content-Type: application/json

{
  "fulfillmentNotes": "Medical certificate provided and validated",
  "validationScore": 95
}
```

#### 7. Reject Proof Request
```http
PUT /api/proof-requests/:id/reject
Authorization: Bearer <token>
Content-Type: application/json

{
  "rejectionReason": "Insufficient documentation provided"
}
```

#### 8. Upload Attachments
```http
POST /api/proof-requests/:id/attachments
Authorization: Bearer <token>
Content-Type: multipart/form-data

files: [File1, File2, ...]
```

#### 9. Send Follow-up Message
```http
POST /api/proof-requests/:id/follow-up
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "Please provide additional medical records for processing",
  "isInternal": false
}
```

### Analytics & Reporting

#### 10. Get Analytics
```http
GET /api/proof-requests/analytics?period=30d
Authorization: Bearer <token>
```

#### 11. Bulk Actions
```http
POST /api/proof-requests/bulk-action
Authorization: Bearer <token>
Content-Type: application/json

{
  "action": "mark_fulfilled",
  "requestIds": ["id1", "id2", "id3"]
}
```

## ☁️ Cloudinary Integration

### File Upload Process

1. **File Validation**: Check file type, size, and format
2. **Cloudinary Upload**: Upload to Cloudinary with optimization
3. **Metadata Storage**: Store file metadata in MongoDB
4. **Cleanup**: Remove local temporary files

### Supported File Types
- Images: JPEG, PNG, GIF
- Documents: PDF, DOC, DOCX
- Text: TXT

### File Size Limits
- Maximum file size: 10MB per file
- Maximum files per request: 5 files

### Cloudinary Configuration
```javascript
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
```

## 📧 Email Notifications

### Email Templates

The system includes pre-built email templates for various scenarios:

1. **Proof Request Notification**: Sent to providers when a new request is created
2. **Proof Request Fulfilled**: Sent to requesters when a request is fulfilled
3. **Proof Request Rejected**: Sent to requesters when a request is rejected
4. **Proof Request Reminder**: Sent to providers for upcoming due dates
5. **Proof Request Overdue**: Sent to providers for overdue requests

### Email Configuration
```javascript
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});
```

## 🔐 Security & Authorization

### Role-Based Access Control

The system implements role-based access control with the following roles:

- **insurance**: Can create, view, and manage proof requests
- **doctor**: Can view and fulfill proof requests assigned to them
- **patient**: Can view proof requests related to them
- **admin**: Full access to all functionality

### Permission Matrix

| Action | Insurance | Doctor | Patient | Admin |
|--------|-----------|--------|---------|-------|
| Create Request | ✅ | ❌ | ❌ | ✅ |
| View All Requests | ✅ | ❌ | ❌ | ✅ |
| View Assigned Requests | ❌ | ✅ | ❌ | ✅ |
| View Own Requests | ❌ | ❌ | ✅ | ✅ |
| Update Request | ✅ | ✅ | ❌ | ✅ |
| Fulfill Request | ❌ | ✅ | ❌ | ✅ |
| Reject Request | ❌ | ✅ | ❌ | ✅ |
| Delete Request | ✅ | ❌ | ❌ | ✅ |
| Upload Attachments | ❌ | ✅ | ❌ | ✅ |
| Send Follow-up | ✅ | ✅ | ❌ | ✅ |

### Authentication Middleware

```javascript
// Apply authentication to all routes
router.use(auth);

// Apply authorization for specific endpoints
router.post('/', authorize(['insurance', 'admin']), createProofRequest);
router.get('/', authorize(['insurance', 'admin', 'doctor']), getProofRequests);
```

## 📊 Analytics & Reporting

### Analytics Data Structure

```javascript
{
  totalRequests: Number,
  statusBreakdown: {
    pending: Number,
    in_progress: Number,
    fulfilled: Number,
    rejected: Number,
    expired: Number
  },
  categoryBreakdown: {
    medical: Number,
    financial: Number,
    identity: Number,
    employment: Number,
    insurance: Number,
    other: Number
  },
  priorityBreakdown: {
    low: Number,
    medium: Number,
    high: Number,
    urgent: Number
  },
  overdueRequests: Number,
  averageResponseTime: Number
}
```

### Analytics Periods
- 7 days: `period=7d`
- 30 days: `period=30d`
- 90 days: `period=90d`

## 🧪 Testing

### Test Script

Run the comprehensive test suite:

```bash
cd server
node test-proof-request-api.js
```

### Test Coverage

The test suite covers:

1. **Authentication**: Verify protected endpoints
2. **CRUD Operations**: Create, read, update, delete requests
3. **Actions**: Fulfill, reject, upload attachments, send follow-up
4. **Search & Filtering**: Test search and filter functionality
5. **Pagination**: Verify pagination works correctly
6. **Analytics**: Test analytics endpoint
7. **Bulk Actions**: Test bulk operations
8. **Error Handling**: Verify proper error responses

### Environment Variables for Testing

```bash
# API Configuration
API_BASE_URL=http://localhost:5000/api

# Authentication
TEST_AUTH_TOKEN=your_jwt_token_here

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=your_email@gmail.com

# MongoDB Configuration
MONGODB_URI=your_mongodb_connection_string

# JWT Configuration
JWT_SECRET=your_jwt_secret
```

## 🚀 Deployment

### Environment Variables

Create a `.env` file in the server directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# JWT Configuration
JWT_SECRET=your_very_secure_jwt_secret_key

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=your_email@gmail.com

# Frontend URL (for email links)
FRONTEND_URL=https://your-frontend-domain.com
```

### Dependencies

Install required packages:

```bash
npm install express mongoose cloudinary nodemailer multer cors helmet compression morgan express-rate-limit jsonwebtoken bcryptjs
```

### Database Setup

1. **Create MongoDB Database**: Set up a MongoDB database
2. **Create Indexes**: The model automatically creates necessary indexes
3. **Create Admin User**: Create an admin user for testing

### File Upload Directory

Create the upload directory:

```bash
mkdir -p uploads/proof-requests
```

## 📈 Performance Optimization

### Database Indexes

The ProofRequest model includes optimized indexes:

```javascript
// Indexes for better performance
proofRequestSchema.index({ requester: 1, status: 1 });
proofRequestSchema.index({ provider: 1, status: 1 });
proofRequestSchema.index({ dueDate: 1 });
proofRequestSchema.index({ category: 1, priority: 1 });
proofRequestSchema.index({ insurancePolicy: 1 });
proofRequestSchema.index({ createdAt: -1 });
```

### Caching Strategy

- **Redis Caching**: For frequently accessed data
- **Query Optimization**: Use lean() for read-only operations
- **Pagination**: Implement proper pagination to limit data transfer

### File Optimization

- **Image Compression**: Automatic image optimization via Cloudinary
- **Format Conversion**: Automatic format conversion for better performance
- **CDN Delivery**: Cloudinary CDN for fast file delivery

## 🔍 Monitoring & Logging

### Logging Levels

- **Error**: Failed operations and exceptions
- **Warn**: Potential issues and warnings
- **Info**: General information and successful operations
- **Debug**: Detailed debugging information

### Key Metrics to Monitor

1. **API Response Times**: Monitor endpoint performance
2. **File Upload Success Rate**: Track upload failures
3. **Email Delivery Rate**: Monitor notification delivery
4. **Database Query Performance**: Monitor slow queries
5. **Error Rates**: Track API error frequencies

## 🛠️ Troubleshooting

### Common Issues

1. **File Upload Failures**
   - Check Cloudinary credentials
   - Verify file size limits
   - Check file type restrictions

2. **Email Delivery Issues**
   - Verify SMTP credentials
   - Check email provider settings
   - Monitor email delivery logs

3. **Database Connection Issues**
   - Verify MongoDB connection string
   - Check network connectivity
   - Monitor database performance

4. **Authentication Issues**
   - Verify JWT secret
   - Check token expiration
   - Validate user permissions

### Debug Commands

```bash
# Test database connection
node test-env.js

# Test email configuration
node -e "require('./src/utils/email.js').testEmailConfig('test@example.com')"

# Test Cloudinary configuration
node -e "console.log(require('./src/utils/cloudinary.js').validateCloudinaryConfig())"

# Test API endpoints
node test-proof-request-api.js
```

## 📚 API Documentation

### Response Format

All API responses follow a consistent format:

```javascript
{
  success: boolean,
  message: string,
  data: any,
  pagination?: {
    page: number,
    limit: number,
    total: number,
    totalPages: number,
    hasNextPage: boolean,
    hasPrevPage: boolean
  }
}
```

### Error Response Format

```javascript
{
  success: false,
  message: string,
  error: string
}
```

### Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

## 🔄 Integration with Frontend

### Frontend Service

The frontend uses a service class to interact with the API:

```typescript
// src/services/proofRequestService.ts
class ProofRequestService {
  async createProofRequest(data: CreateProofRequestData): Promise<ProofRequest>
  async getProofRequests(filters: ProofRequestFilters): Promise<{data: ProofRequest[], pagination: Pagination}>
  async getProofRequestById(id: string): Promise<ProofRequest>
  async updateProofRequest(id: string, data: UpdateProofRequestData): Promise<ProofRequest>
  async deleteProofRequest(id: string): Promise<void>
  async fulfillProofRequest(id: string, fulfillmentNotes?: string, validationScore?: number): Promise<ProofRequest>
  async rejectProofRequest(id: string, rejectionReason: string): Promise<ProofRequest>
  async uploadAttachments(id: string, files: File[]): Promise<Attachment[]>
  async sendFollowUp(id: string, message: string, isInternal?: boolean): Promise<void>
  async getAnalytics(period?: '7d' | '30d' | '90d'): Promise<ProofRequestAnalytics>
  async bulkAction(data: BulkActionData): Promise<{updatedCount: number}>
}
```

### Real-time Updates

The system supports real-time updates via WebSocket connections for:
- New proof request notifications
- Status change updates
- Message notifications
- Due date reminders

## 🎯 Future Enhancements

### Planned Features

1. **Advanced Analytics**: More detailed reporting and insights
2. **Workflow Automation**: Automated approval workflows
3. **Document Templates**: Pre-built document templates
4. **Integration APIs**: Third-party system integrations
5. **Mobile App Support**: Native mobile application
6. **AI-Powered Validation**: Automated document validation
7. **Multi-language Support**: Internationalization
8. **Advanced Security**: Enhanced security features

### Scalability Considerations

1. **Horizontal Scaling**: Load balancing across multiple servers
2. **Database Sharding**: Distribute data across multiple databases
3. **Microservices Architecture**: Break down into smaller services
4. **Caching Layer**: Implement Redis caching for better performance
5. **CDN Integration**: Use CDN for static assets and files

## 📞 Support

For technical support or questions about the implementation:

1. Check the troubleshooting section
2. Review the API documentation
3. Run the test suite to identify issues
4. Check server logs for error details
5. Verify environment configuration

---

This implementation provides a robust, scalable, and secure foundation for managing insurance proof requests with comprehensive features for file management, communication, and analytics. 