# Insurance Proof Request API Documentation

## Overview

The Insurance Proof Request API provides comprehensive functionality for managing proof requests between insurance companies and patients. This system allows insurance companies to request medical proofs from patients for claim verification, with features for tracking, analytics, and template management.

## Base URL

```
https://your-domain.com/api
```

## Authentication

All endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Models

### ProofRequest

```typescript
interface ProofRequest {
  _id: string;
  requestId: string;
  patient: {
    id: string;
    name: string;
    email: string;
    phone: string;
    policyNumber: string;
    policyType: string;
  };
  proofType: string;
  status: 'pending' | 'fulfilled' | 'rejected' | 'expired' | 'cancelled';
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  priority: number;
  category: string;
  requestDate: string;
  dueDate: string;
  reason: string;
  notes?: string;
  attachments: Attachment[];
  autoFollowUp: boolean;
  notifyPatient: boolean;
  assignedTo?: string;
  responseTime?: number;
  followUps: FollowUp[];
  followUpCount: number;
  lastFollowUp?: string;
  template?: {
    id: string;
    name: string;
  };
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  updatedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  fulfilledAt?: string;
  fulfilledBy?: {
    _id: string;
    name: string;
    email: string;
  };
  rejectionReason?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
```

### ProofTemplate

```typescript
interface ProofTemplate {
  _id: string;
  name: string;
  description: string;
  proofType: string;
  defaultUrgency: 'low' | 'medium' | 'high' | 'urgent';
  defaultReason: string;
  category: string;
  defaultPriority: number;
  defaultDueDays: number;
  isDefault: boolean;
  isActive: boolean;
  usageCount: number;
  tags: string[];
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  updatedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  lastUsed?: string;
  createdAt: string;
  updatedAt: string;
}
```

## Proof Request Endpoints

### 1. Create Proof Request

**POST** `/proof-requests`

Creates a new proof request for a patient.

**Request Body:**
```json
{
  "patientId": "507f1f77bcf86cd799439011",
  "proofType": "medical-certificate",
  "urgency": "high",
  "priority": 2,
  "category": "emergency",
  "dueDate": "2024-02-15T00:00:00.000Z",
  "reason": "Claim verification for recent hospitalization",
  "notes": "Patient was admitted for chest pain",
  "autoFollowUp": true,
  "notifyPatient": true,
  "templateId": "507f1f77bcf86cd799439012",
  "tags": ["urgent", "hospitalization"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Proof request created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "requestId": "REQ24010001",
    "patient": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john.doe@email.com",
      "phone": "+1-555-0123",
      "policyNumber": "POL-2024-001",
      "policyType": "Health"
    },
    "proofType": "medical-certificate",
    "status": "pending",
    "urgency": "high",
    "priority": 2,
    "category": "emergency",
    "requestDate": "2024-01-20T10:30:00.000Z",
    "dueDate": "2024-02-15T00:00:00.000Z",
    "reason": "Claim verification for recent hospitalization",
    "notes": "Patient was admitted for chest pain",
    "attachments": [],
    "autoFollowUp": true,
    "notifyPatient": true,
    "followUps": [],
    "followUpCount": 0,
    "createdBy": {
      "_id": "507f1f77bcf86cd799439014",
      "name": "Insurance Agent",
      "email": "agent@insurance.com"
    },
    "tags": ["urgent", "hospitalization"],
    "createdAt": "2024-01-20T10:30:00.000Z",
    "updatedAt": "2024-01-20T10:30:00.000Z"
  }
}
```

### 2. Get All Proof Requests

**GET** `/proof-requests`

Retrieves all proof requests with filtering and pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search term for request ID, patient name, email, or reason
- `status` (string): Filter by status (all, pending, fulfilled, rejected, expired)
- `urgency` (string): Filter by urgency (all, urgent, high, medium, low)
- `category` (string): Filter by category (all, emergency, routine, preventive, specialist, surgery, therapy)
- `proofType` (string): Filter by proof type
- `patientId` (string): Filter by patient ID
- `assignedTo` (string): Filter by assigned user ID
- `sortBy` (string): Sort field (default: createdAt)
- `sortOrder` (string): Sort order (asc, desc)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "requestId": "REQ24010001",
      "patient": {
        "id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "john.doe@email.com"
      },
      "proofType": "medical-certificate",
      "status": "pending",
      "urgency": "high",
      "category": "emergency",
      "dueDate": "2024-02-15T00:00:00.000Z",
      "reason": "Claim verification for recent hospitalization",
      "followUpCount": 2,
      "createdBy": {
        "_id": "507f1f77bcf86cd799439014",
        "name": "Insurance Agent",
        "email": "agent@insurance.com"
      },
      "createdAt": "2024-01-20T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### 3. Get Proof Request by ID

**GET** `/proof-requests/:id`

Retrieves a specific proof request by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "requestId": "REQ24010001",
    "patient": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john.doe@email.com",
      "phone": "+1-555-0123",
      "policyNumber": "POL-2024-001",
      "policyType": "Health"
    },
    "proofType": "medical-certificate",
    "status": "pending",
    "urgency": "high",
    "priority": 2,
    "category": "emergency",
    "requestDate": "2024-01-20T10:30:00.000Z",
    "dueDate": "2024-02-15T00:00:00.000Z",
    "reason": "Claim verification for recent hospitalization",
    "notes": "Patient was admitted for chest pain",
    "attachments": [
      {
        "name": "medical_report.pdf",
        "originalName": "medical_report.pdf",
        "type": "application/pdf",
        "size": 1024000,
        "url": "https://res.cloudinary.com/...",
        "cloudinaryId": "proof-requests/...",
        "uploadedAt": "2024-01-20T11:00:00.000Z"
      }
    ],
    "autoFollowUp": true,
    "notifyPatient": true,
    "assignedTo": {
      "_id": "507f1f77bcf86cd799439015",
      "name": "Case Manager",
      "email": "manager@insurance.com"
    },
    "responseTime": null,
    "followUps": [
      {
        "date": "2024-01-22T09:00:00.000Z",
        "type": "email",
        "message": "Follow-up reminder sent",
        "sentBy": "507f1f77bcf86cd799439014",
        "status": "sent"
      }
    ],
    "followUpCount": 1,
    "lastFollowUp": "2024-01-22T09:00:00.000Z",
    "template": {
      "id": "507f1f77bcf86cd799439012",
      "name": "Emergency Medical Certificate"
    },
    "createdBy": {
      "_id": "507f1f77bcf86cd799439014",
      "name": "Insurance Agent",
      "email": "agent@insurance.com"
    },
    "tags": ["urgent", "hospitalization"],
    "createdAt": "2024-01-20T10:30:00.000Z",
    "updatedAt": "2024-01-20T10:30:00.000Z"
  }
}
```

### 4. Update Proof Request

**PUT** `/proof-requests/:id`

Updates an existing proof request.

**Request Body:**
```json
{
  "urgency": "urgent",
  "priority": 1,
  "dueDate": "2024-02-10T00:00:00.000Z",
  "reason": "Updated reason for urgent claim verification",
  "notes": "Updated notes",
  "assignedTo": "507f1f77bcf86cd799439015",
  "tags": ["urgent", "hospitalization", "critical"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Proof request updated successfully",
  "data": {
    // Updated proof request object
  }
}
```

### 5. Delete Proof Request

**DELETE** `/proof-requests/:id`

Deletes a proof request and its attachments from Cloudinary.

**Response:**
```json
{
  "success": true,
  "message": "Proof request deleted successfully"
}
```

### 6. Fulfill Proof Request

**PUT** `/proof-requests/:id/fulfill`

Marks a proof request as fulfilled.

**Request Body:**
```json
{
  "fulfillmentNotes": "Proof received and verified successfully"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Proof request fulfilled successfully",
  "data": {
    // Updated proof request with fulfilled status
  }
}
```

### 7. Reject Proof Request

**PUT** `/proof-requests/:id/reject`

Rejects a proof request.

**Request Body:**
```json
{
  "rejectionReason": "Insufficient documentation provided"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Proof request rejected successfully",
  "data": {
    // Updated proof request with rejected status
  }
}
```

### 8. Send Follow-up

**POST** `/proof-requests/:id/follow-up`

Sends a follow-up message for a proof request.

**Request Body:**
```json
{
  "message": "Reminder: Please provide the requested medical certificate",
  "type": "email"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Follow-up sent successfully",
  "data": {
    "date": "2024-01-22T09:00:00.000Z",
    "type": "email",
    "message": "Reminder: Please provide the requested medical certificate",
    "sentBy": "507f1f77bcf86cd799439014",
    "status": "sent"
  }
}
```

### 9. Upload Attachments

**POST** `/proof-requests/:id/attachments`

Uploads files as attachments to a proof request.

**Request:**
- Content-Type: `multipart/form-data`
- Body: Form data with `files` field containing file(s)

**Response:**
```json
{
  "success": true,
  "message": "Attachments uploaded successfully",
  "data": [
    {
      "name": "medical_report.pdf",
      "originalName": "medical_report.pdf",
      "type": "application/pdf",
      "size": 1024000,
      "url": "https://res.cloudinary.com/...",
      "cloudinaryId": "proof-requests/..."
    }
  ]
}
```

### 10. Get Analytics

**GET** `/proof-requests/analytics`

Retrieves analytics data for proof requests.

**Query Parameters:**
- `startDate` (string): Start date for filtering
- `endDate` (string): End date for filtering
- `category` (string): Filter by category
- `urgency` (string): Filter by urgency

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "pending": 45,
    "fulfilled": 95,
    "urgent": 12,
    "responseRate": 89.5,
    "avgResponseTime": 2.3,
    "categoryStats": [
      { "_id": "emergency", "count": 25 },
      { "_id": "routine", "count": 80 },
      { "_id": "preventive", "count": 45 }
    ],
    "urgencyStats": [
      { "_id": "urgent", "count": 12 },
      { "_id": "high", "count": 30 },
      { "_id": "medium", "count": 80 },
      { "_id": "low", "count": 28 }
    ],
    "monthlyStats": [
      { "_id": { "year": 2024, "month": 1 }, "count": 45 },
      { "_id": { "year": 2024, "month": 2 }, "count": 38 }
    ]
  }
}
```

### 11. Bulk Actions

**POST** `/proof-requests/bulk-action`

Performs bulk actions on multiple proof requests.

**Request Body:**
```json
{
  "ids": ["507f1f77bcf86cd799439013", "507f1f77bcf86cd799439014"],
  "action": "fulfill",
  "data": {
    "reason": "Bulk fulfillment"
  }
}
```

**Available Actions:**
- `fulfill`: Mark requests as fulfilled
- `reject`: Reject requests with reason
- `assign`: Assign requests to a user
- `followUp`: Send follow-up to requests

**Response:**
```json
{
  "success": true,
  "message": "Bulk action 'fulfill' completed successfully",
  "data": {
    "modifiedCount": 2
  }
}
```

## Proof Template Endpoints

### 1. Create Proof Template

**POST** `/proof-templates`

Creates a new proof template.

**Request Body:**
```json
{
  "name": "Emergency Medical Certificate",
  "description": "Standard template for emergency medical documentation",
  "proofType": "medical-certificate",
  "defaultUrgency": "urgent",
  "defaultReason": "Emergency medical claim verification",
  "category": "emergency",
  "defaultPriority": 1,
  "defaultDueDays": 3,
  "isDefault": true,
  "tags": ["emergency", "medical"]
}
```

### 2. Get All Proof Templates

**GET** `/proof-templates`

Retrieves all proof templates with filtering.

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `search` (string): Search term
- `proofType` (string): Filter by proof type
- `category` (string): Filter by category
- `isActive` (boolean): Filter by active status
- `sortBy` (string): Sort field
- `sortOrder` (string): Sort order

### 3. Get Proof Template by ID

**GET** `/proof-templates/:id`

Retrieves a specific proof template.

### 4. Update Proof Template

**PUT** `/proof-templates/:id`

Updates an existing proof template.

### 5. Delete Proof Template

**DELETE** `/proof-templates/:id`

Soft deletes a proof template.

### 6. Set Default Template

**PUT** `/proof-templates/:id/set-default`

Sets a template as the default for its proof type.

### 7. Get Templates by Proof Type

**GET** `/proof-templates/type/:proofType`

Retrieves templates for a specific proof type.

### 8. Get Default Templates

**GET** `/proof-templates/default`

Retrieves all default templates.

### 9. Get Template Usage Stats

**GET** `/proof-templates/stats`

Retrieves usage statistics for templates.

### 10. Duplicate Template

**POST** `/proof-templates/:id/duplicate`

Creates a copy of an existing template.

**Request Body:**
```json
{
  "name": "Emergency Medical Certificate (Copy)",
  "description": "Modified version of emergency template"
}
```

### 11. Export Templates

**GET** `/proof-templates/export`

Exports templates in JSON or CSV format.

**Query Parameters:**
- `format` (string): Export format (json, csv)

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## File Upload Limits

- **Maximum file size**: 10MB per file
- **Maximum files**: 5 files per request
- **Allowed file types**: PDF, JPEG, PNG, GIF, DOC, DOCX, TXT

## Rate Limiting

- **Requests per minute**: 100
- **File uploads per minute**: 20
- **Bulk actions per minute**: 10

## WebSocket Events

The system supports real-time updates via WebSocket connections:

### Client Events
- `join-room`: Join a specific proof request room
- `leave-room`: Leave a proof request room

### Server Events
- `proof-request:created`: New proof request created
- `proof-request:updated`: Proof request updated
- `proof-request:fulfilled`: Proof request fulfilled
- `proof-request:rejected`: Proof request rejected
- `follow-up:sent`: Follow-up message sent

## Usage Examples

### Frontend Integration

```typescript
import proofRequestService from './services/proofRequestService';

// Create a new proof request
const newRequest = await proofRequestService.createProofRequest({
  patientId: '507f1f77bcf86cd799439011',
  proofType: 'medical-certificate',
  urgency: 'high',
  category: 'emergency',
  dueDate: '2024-02-15T00:00:00.000Z',
  reason: 'Claim verification for recent hospitalization'
});

// Get all proof requests with filtering
const requests = await proofRequestService.getProofRequests({
  page: 1,
  limit: 10,
  status: 'pending',
  urgency: 'urgent'
});

// Upload attachments
const files = document.getElementById('fileInput').files;
await proofRequestService.uploadAttachments(requestId, Array.from(files));

// Get analytics
const analytics = await proofRequestService.getAnalytics(
  '2024-01-01',
  '2024-01-31'
);
```

### WebSocket Integration

```javascript
import io from 'socket.io-client';

const socket = io('https://your-domain.com');

// Join a proof request room
socket.emit('join-room', { requestId: 'REQ24010001' });

// Listen for updates
socket.on('proof-request:updated', (data) => {
  console.log('Proof request updated:', data);
});

socket.on('follow-up:sent', (data) => {
  console.log('Follow-up sent:', data);
});
```

## Security Considerations

1. **Authentication**: All endpoints require valid JWT tokens
2. **Authorization**: Role-based access control (insurance, admin, doctor)
3. **File Validation**: Server-side file type and size validation
4. **Rate Limiting**: Prevents abuse and ensures system stability
5. **Input Validation**: All inputs are validated and sanitized
6. **Cloudinary Integration**: Secure file storage with automatic cleanup

## Monitoring and Logging

The system includes comprehensive logging for:
- All API requests and responses
- File uploads and deletions
- User actions and bulk operations
- Error tracking and debugging
- Performance metrics

## Support

For technical support or questions about the API, please contact:
- Email: support@healthsecure.com
- Documentation: https://docs.healthsecure.com
- GitHub Issues: https://github.com/healthsecure/api-issues 