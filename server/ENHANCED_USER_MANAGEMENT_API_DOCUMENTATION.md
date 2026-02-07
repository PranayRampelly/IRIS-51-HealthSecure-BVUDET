# Enhanced User Management API Documentation

This document describes the enhanced API endpoints for dynamic user management in the HealthSecure platform, providing comprehensive user administration capabilities.

## Base URL
```
http://localhost:5000/api/admin/users
```

## Authentication
All endpoints require authentication with a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Authorization
All endpoints require admin privileges. The user must have `role: 'admin'` in their JWT token.

## Enhanced Features

### 🚀 Dynamic User Table Features
- **Real-time Data**: Live user data with automatic updates
- **Advanced Filtering**: Multiple filter criteria and date ranges
- **Smart Search**: Search across multiple user fields
- **Bulk Operations**: Mass user management operations
- **User Activity Tracking**: Login history and activity monitoring
- **Data Export**: Export user data in multiple formats
- **Search Suggestions**: Auto-complete for user search
- **Role-specific Data**: Dynamic fields based on user roles

## Endpoints

### 1. Get All Users (Enhanced)
**GET** `/api/admin/users`

Returns paginated, filtered, and searchable user data with enhanced features.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `role` (string): Filter by user role
- `search` (string): Search in name, email, phone, address
- `status` (string): Filter by status ('active' or 'inactive')
- `verified` (boolean): Filter by email verification status
- `dateFrom` (string): Filter users created from date (YYYY-MM-DD)
- `dateTo` (string): Filter users created to date (YYYY-MM-DD)
- `lastLoginFrom` (string): Filter by last login from date
- `lastLoginTo` (string): Filter by last login to date
- `sortBy` (string): Sort field (default: 'createdAt')
- `sortOrder` (string): Sort order ('asc' or 'desc', default: 'desc')

**Response:**
```json
{
  "users": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "Dr. Sarah Johnson",
      "email": "sarah.johnson@healthtech.com",
      "role": "doctor",
      "status": "active",
      "avatar": "https://res.cloudinary.com/...",
      "lastLogin": "2 hours ago",
      "joinDate": "Jan 15, 2024",
      "phone": "+1 (555) 123-4567",
      "verified": true,
      "specialization": "Cardiology",
      "hospital": "City General Hospital",
      "licenseNumber": "MD123456"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalUsers": 50,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### 2. Get User Statistics (Enhanced)
**GET** `/api/admin/users/stats`

Returns comprehensive user statistics and analytics.

**Response:**
```json
{
  "roleStats": [
    {
      "_id": "patient",
      "count": 25,
      "activeCount": 23,
      "verifiedCount": 22
    }
  ],
  "totalUsers": 50,
  "activeUsers": 45,
  "verifiedUsers": 42,
  "inactiveUsers": 5,
  "unverifiedUsers": 8,
  "pendingUsers": 8,
  "suspendedUsers": 5,
  "newUsersThisMonth": 12,
  "activeUsersThisMonth": 38,
  "roleDistribution": [
    {
      "_id": "patient",
      "count": 25,
      "percentage": 50
    }
  ],
  "summary": {
    "total": 50,
    "active": 45,
    "pending": 8,
    "suspended": 5
  }
}
```

### 3. Get User Search Suggestions
**GET** `/api/admin/users/suggestions`

Returns user search suggestions for auto-complete functionality.

**Query Parameters:**
- `q` (string): Search query (minimum 2 characters)

**Response:**
```json
{
  "suggestions": [
    {
      "id": "507f1f77bcf86cd799439011",
      "label": "Dr. Sarah Johnson (sarah.johnson@healthtech.com)",
      "value": "507f1f77bcf86cd799439011",
      "role": "doctor",
      "status": "active"
    }
  ]
}
```

### 4. Export Users Data
**GET** `/api/admin/users/export`

Exports user data in JSON or CSV format.

**Query Parameters:**
- `format` (string): Export format ('json' or 'csv', default: 'json')
- `role` (string): Filter by role before export
- `status` (string): Filter by status before export

**Response (JSON):**
```json
{
  "users": [...],
  "exportDate": "2024-01-20T15:30:00.000Z",
  "totalUsers": 50
}
```

**Response (CSV):**
```
Full Name,Email,Role,Status,Phone,Verified,Created Date,Last Login
Dr. Sarah Johnson,sarah.johnson@healthtech.com,doctor,Active,+1 (555) 123-4567,Yes,1/15/2024,1/20/2024
```

### 5. Get User Activity
**GET** `/api/admin/users/:id/activity`

Returns user activity and login history.

**Response:**
```json
{
  "user": {
    "lastLoginAt": "2024-01-20T13:30:00.000Z",
    "loginHistory": [
      {
        "timestamp": "2024-01-20T13:30:00.000Z",
        "ip": "192.168.1.100",
        "userAgent": "Mozilla/5.0..."
      }
    ],
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-20T13:30:00.000Z"
  },
  "accessLogs": [
    {
      "action": "LOGIN",
      "timestamp": "2024-01-20T13:30:00.000Z",
      "ip": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "success": true
    }
  ]
}
```

### 6. Bulk User Operations
**POST** `/api/admin/users/bulk`

Performs bulk operations on multiple users.

**Request Body:**
```json
{
  "operation": "activate",
  "userIds": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
  "data": {
    "role": "patient"
  }
}
```

**Available Operations:**
- `activate`: Activate multiple users
- `deactivate`: Deactivate multiple users
- `verify`: Verify email for multiple users
- `update_role`: Update role for multiple users

**Response:**
```json
{
  "message": "Bulk operation completed successfully",
  "modifiedCount": 2,
  "operation": "activate"
}
```

### 7. Create User (Enhanced)
**POST** `/api/admin/users`

Creates a new user with role-specific fields and profile image.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "doctor",
  "phone": "+1 (555) 123-4567",
  "dateOfBirth": "1985-05-15",
  "gender": "male",
  "maritalStatus": "married",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "licenseNumber": "MD789012",
  "specialization": "Cardiology",
  "hospital": "City General Hospital",
  "department": "Cardiology",
  "yearsOfExperience": 10,
  "bio": "Experienced cardiologist...",
  "consultationFees": 150,
  "emergencyAvailable": true
}
```

**File Upload:**
- `profileImage`: Profile image file (optional)

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "507f1f77bcf86cd799439013",
    "email": "newuser@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "doctor",
    "isActive": true,
    "isEmailVerified": true,
    "profileImage": {
      "url": "https://res.cloudinary.com/...",
      "publicId": "user_profiles/...",
      "uploadedAt": "2024-01-20T15:30:00.000Z"
    }
  }
}
```

### 8. Update User (Enhanced)
**PUT** `/api/admin/users/:id`

Updates user information with role-specific fields and profile image.

**Request Body:** Same as create user, but all fields are optional.

**File Upload:**
- `profileImage`: New profile image file (optional)

**Response:**
```json
{
  "message": "User updated successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "sarah.johnson@healthtech.com",
    "firstName": "Sarah",
    "lastName": "Johnson",
    "role": "doctor",
    "isActive": true,
    "specialization": "Cardiology",
    "hospital": "City General Hospital"
  }
}
```

### 9. Get User by ID
**GET** `/api/admin/users/:id`

Returns detailed user information.

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "sarah.johnson@healthtech.com",
  "firstName": "Sarah",
  "lastName": "Johnson",
  "role": "doctor",
  "isActive": true,
  "isEmailVerified": true,
  "phone": "+1 (555) 123-4567",
  "dateOfBirth": "1980-03-15",
  "gender": "female",
  "address": {
    "street": "456 Oak Ave",
    "city": "New York",
    "state": "NY",
    "zipCode": "10002",
    "country": "USA"
  },
  "profileImage": {
    "url": "https://res.cloudinary.com/...",
    "publicId": "user_profiles/...",
    "uploadedAt": "2024-01-15T10:00:00.000Z"
  },
  "licenseNumber": "MD123456",
  "specialization": "Cardiology",
  "hospital": "City General Hospital",
  "department": "Cardiology",
  "yearsOfExperience": 15,
  "bio": "Experienced cardiologist with expertise in...",
  "consultationFees": 200,
  "emergencyAvailable": true,
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-20T13:30:00.000Z"
}
```

### 10. Delete User (Soft Delete)
**DELETE** `/api/admin/users/:id`

Soft deletes a user by deactivating their account.

**Response:**
```json
{
  "message": "User deactivated successfully"
}
```

### 11. Reactivate User
**PATCH** `/api/admin/users/:id/reactivate`

Reactivates a previously deactivated user.

**Response:**
```json
{
  "message": "User reactivated successfully"
}
```

## Advanced Filtering Examples

### Filter by Date Range
```
GET /api/admin/users?dateFrom=2024-01-01&dateTo=2024-01-31
```

### Filter by Role and Status
```
GET /api/admin/users?role=doctor&status=active
```

### Search with Multiple Criteria
```
GET /api/admin/users?search=cardiology&role=doctor&verified=true
```

### Advanced Sorting
```
GET /api/admin/users?sortBy=lastLoginAt&sortOrder=desc&limit=20
```

## Role-Specific Data

### Doctor Fields
- `licenseNumber`: Medical license number
- `specialization`: Medical specialization
- `hospital`: Hospital affiliation
- `department`: Department
- `yearsOfExperience`: Years of experience
- `bio`: Professional biography
- `consultationFees`: Consultation fees
- `emergencyAvailable`: Emergency availability
- `languages`: Spoken languages
- `specialties`: Medical specialties

### Patient Fields
- `bloodType`: Blood type
- `height`: Height in cm
- `weight`: Weight in kg
- `allergies`: Allergies list
- `currentMedications`: Current medications
- `medicalConditions`: Medical conditions
- `surgeries`: Surgical history
- `emergencyContacts`: Emergency contact information

### Insurance Fields
- `organization`: Insurance organization
- `insurance`: Insurance details

## Error Responses

### Validation Error (400)
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

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

### Not Found (404)
```json
{
  "message": "User not found"
}
```

### Server Error (500)
```json
{
  "message": "Server error"
}
```

## Usage Examples

### Get All Users with Advanced Filtering
```bash
curl -X GET "http://localhost:5000/api/admin/users?role=doctor&status=active&search=cardiology&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create New Doctor
```bash
curl -X POST http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Smith",
    "role": "doctor",
    "specialization": "Cardiology",
    "hospital": "City General Hospital"
  }'
```

### Bulk Activate Users
```bash
curl -X POST http://localhost:5000/api/admin/users/bulk \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "activate",
    "userIds": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
  }'
```

### Export Users as CSV
```bash
curl -X GET "http://localhost:5000/api/admin/users/export?format=csv&role=doctor" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  --output users.csv
```

### Get User Activity
```bash
curl -X GET http://localhost:5000/api/admin/users/507f1f77bcf86cd799439011/activity \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Frontend Integration

### Real-time Data Updates
The frontend can implement real-time updates by:
1. Polling the users endpoint every 30 seconds
2. Using WebSocket connections for live updates
3. Implementing optimistic updates for immediate UI feedback

### Advanced Filtering UI
Implement a comprehensive filtering interface with:
- Text search with auto-complete
- Date range pickers
- Role and status dropdowns
- Advanced filter combinations
- Saved filter presets

### Bulk Operations UI
Provide bulk operation capabilities:
- Multi-select checkboxes
- Bulk action dropdown
- Confirmation dialogs
- Progress indicators
- Success/error notifications

### Data Export
Implement export functionality:
- Export format selection
- Filter-based exports
- Download progress
- Export history

## Performance Considerations

### Pagination
- Default limit of 10 users per page
- Maximum limit of 100 users per page
- Efficient database queries with proper indexing

### Caching
- User statistics cached for 5 minutes
- Search suggestions cached for 2 minutes
- User data cached for 1 minute

### Database Optimization
- Indexed fields: email, role, isActive, createdAt, lastLoginAt
- Compound indexes for common filter combinations
- Efficient aggregation pipelines for statistics

## Security Features

### Input Validation
- Comprehensive validation for all user inputs
- SQL injection prevention
- XSS protection
- File upload validation

### Access Control
- Admin-only access to all endpoints
- Audit logging for all operations
- Rate limiting to prevent abuse
- Secure file upload handling

### Data Protection
- Sensitive data excluded from responses
- Encrypted password storage
- Secure image upload to Cloudinary
- Audit trail for all user modifications 