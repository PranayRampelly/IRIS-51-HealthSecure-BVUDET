# Proof Health Nexus API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "patient",
  "dateOfBirth": "1990-01-01",
  "bloodType": "A+",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "patient",
    "isEmailVerified": false
  }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "patient",
    "isEmailVerified": false
  }
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

### Health Records (Patient Only)

#### Get All Health Records
```http
GET /health-records?page=1&limit=10&type=Lab Report&status=Active&search=diabetes
Authorization: Bearer <token>
```

#### Get Single Health Record
```http
GET /health-records/:id
Authorization: Bearer <token>
```

#### Create Health Record
```http
POST /health-records
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "type": "Lab Report",
  "title": "Blood Test Results",
  "description": "Annual blood work",
  "provider": "City General Hospital",
  "date": "2024-01-15",
  "tags": "blood,annual,diabetes",
  "file": <file>
}
```

#### Update Health Record
```http
PUT /health-records/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Blood Test Results",
  "description": "Updated description",
  "tags": "blood,annual,diabetes,updated"
}
```

#### Delete Health Record
```http
DELETE /health-records/:id
Authorization: Bearer <token>
```

#### Get Health Record Statistics
```http
GET /health-records/stats
Authorization: Bearer <token>
```

### Proofs (Patient Only)

#### Get All Proofs
```http
GET /proofs?page=1&limit=10&status=Active&proofType=Allergy Status
Authorization: Bearer <token>
```

#### Get Single Proof
```http
GET /proofs/:id
Authorization: Bearer <token>
```

#### Create Proof
```http
POST /proofs
Authorization: Bearer <token>
Content-Type: application/json

{
  "proofType": "Allergy Status",
  "title": "No Penicillin Allergy",
  "description": "Patient has no known allergies to penicillin",
  "statement": "This patient has no known allergies to penicillin antibiotics",
  "healthRecordIds": ["record-id-1", "record-id-2"],
  "expiresAt": "2024-12-31",
  "isPublic": false
}
```

#### Update Proof
```http
PUT /proofs/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Proof Title",
  "description": "Updated description",
  "isPublic": true
}
```

#### Revoke Proof
```http
PUT /proofs/:id/revoke
Authorization: Bearer <token>
```

#### Get Proof Statistics
```http
GET /proofs/stats
Authorization: Bearer <token>
```

### Proof Verification (Public)

#### Verify Proof
```http
GET /proofs/verify/:signature
```

**Response:**
```json
{
  "isValid": true,
  "proof": {
    "id": "proof-id",
    "title": "No Penicillin Allergy",
    "statement": "This patient has no known allergies to penicillin antibiotics",
    "proofType": "Allergy Status",
    "patient": {
      "firstName": "John",
      "lastName": "Doe"
    },
    "healthRecords": [...],
    "createdAt": "2024-01-15T10:30:00Z",
    "expiresAt": "2024-12-31T23:59:59Z",
    "signature": "signature-here",
    "signatureHash": "hash-here"
  }
}
```

### Proof Requests

#### Get Patient's Proof Requests
```http
GET /proof-requests/patient?page=1&limit=10&status=Pending
Authorization: Bearer <token>
```

#### Get Doctor's Proof Requests
```http
GET /proof-requests/doctor?page=1&limit=10&status=Pending
Authorization: Bearer <token>
```

#### Create Proof Request (Doctor)
```http
POST /proof-requests
Authorization: Bearer <token>
Content-Type: application/json

{
  "patientId": "patient-id",
  "proofType": "Allergy Status",
  "requestedProof": "No penicillin allergy",
  "purpose": "Pre-surgery checkup",
  "urgency": "High"
}
```

#### Approve Proof Request (Patient)
```http
PUT /proof-requests/:id/approve
Authorization: Bearer <token>
Content-Type: application/json

{
  "proofId": "proof-id"
}
```

#### Deny Proof Request (Patient)
```http
PUT /proof-requests/:id/deny
Authorization: Bearer <token>
Content-Type: application/json

{
  "denialReason": "Patient prefers not to share this information"
}
```

#### Cancel Proof Request (Doctor)
```http
PUT /proof-requests/:id/cancel
Authorization: Bearer <token>
```

#### Get Proof Request Statistics
```http
GET /proof-requests/stats
Authorization: Bearer <token>
```

### Doctor Features

#### Get Doctor Dashboard
```http
GET /doctor/dashboard
Authorization: Bearer <token>
```

#### Get All Patients
```http
GET /doctor/patients?page=1&limit=10&search=john
Authorization: Bearer <token>
```

#### Get Patient Detail
```http
GET /doctor/patients/:id
Authorization: Bearer <token>
```

#### Search Patients
```http
GET /doctor/patients/search?q=john
Authorization: Bearer <token>
```

#### Upload Prescription
```http
POST /doctor/prescriptions
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "patientId": "patient-id",
  "title": "Diabetes Medication",
  "description": "Metformin prescription",
  "medications": "Metformin 500mg twice daily",
  "instructions": "Take with meals",
  "followUpDate": "2024-02-15",
  "file": <file>
}
```

### Access Logs

#### Get User Access Logs
```http
GET /access-logs?page=1&limit=20&action=VIEW_RECORD&resourceType=HealthRecord&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

#### Get Access Log Statistics
```http
GET /access-logs/stats?days=7
Authorization: Bearer <token>
```

#### Export Access Logs
```http
GET /access-logs/export?startDate=2024-01-01&endDate=2024-01-31&format=csv
Authorization: Bearer <token>
```

#### Get All Access Logs (Admin)
```http
GET /access-logs/admin?page=1&limit=50&userId=user-id&action=VIEW_RECORD
Authorization: Bearer <token>
```

## Error Responses

### Validation Error
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "type": "field",
      "value": "",
      "msg": "Email is required",
      "path": "email",
      "location": "body"
    }
  ]
}
```

### Authentication Error
```json
{
  "message": "No token, authorization denied"
}
```

### Not Found Error
```json
{
  "message": "Health record not found"
}
```

### Server Error
```json
{
  "message": "Server error"
}
```

## File Upload

### Supported File Types
- PDF files
- Images (JPEG, JPG, PNG, GIF)
- Documents (DOC, DOCX)
- Text files

### File Size Limit
- Maximum: 10MB per file

### Upload Format
Use `multipart/form-data` with field name `file` for file uploads.

## Rate Limiting

- **Limit**: 100 requests per 15 minutes per IP
- **Headers**: Rate limit information is included in response headers

## Pagination

Most list endpoints support pagination with these query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

**Response format:**
```json
{
  "data": [...],
  "pagination": {
    "current": 1,
    "total": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error 