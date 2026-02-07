# Admin User Management API Documentation

This document describes the API endpoints for admin user management functionality in the HealthSecure system.

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

## Endpoints

### 1. Get User Statistics
**GET** `/api/admin/users/stats`

Returns statistics about users in the system.

**Response:**
```json
{
  "roleStats": [
    {
      "_id": "patient",
      "count": 150,
      "activeCount": 145,
      "verifiedCount": 140
    },
    {
      "_id": "doctor",
      "count": 25,
      "activeCount": 23,
      "verifiedCount": 22
    }
  ],
  "totalUsers": 200,
  "activeUsers": 190,
  "verifiedUsers": 185,
  "inactiveUsers": 10,
  "unverifiedUsers": 15
}
```

### 2. List All Users
**GET** `/api/admin/users`

Returns a paginated list of users with filtering and search capabilities.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of users per page (default: 10, max: 100)
- `role` (optional): Filter by user role (`patient`, `doctor`, `insurance`, `researcher`, `admin`)
- `status` (optional): Filter by status (`active`, `inactive`)
- `search` (optional): Search in firstName, lastName, email, phone
- `sortBy` (optional): Sort field (`firstName`, `lastName`, `email`, `role`, `createdAt`, `lastLogin`)
- `sortOrder` (optional): Sort order (`asc`, `desc`)

**Example Request:**
```
GET /api/admin/users?page=1&limit=20&role=doctor&status=active&search=john&sortBy=createdAt&sortOrder=desc
```

**Response:**
```json
{
  "users": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "doctor",
      "phone": "+1234567890",
      "isActive": true,
      "isEmailVerified": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "lastLogin": "2024-01-20T14:45:00.000Z",
      "profileImage": {
        "url": "https://res.cloudinary.com/example/image/upload/v123/user_profiles/john_doe.jpg",
        "publicId": "user_profiles/john_doe",
        "uploadedAt": "2024-01-15T10:30:00.000Z"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalUsers": 100,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### 3. Get User by ID
**GET** `/api/admin/users/:id`

Returns detailed information about a specific user.

**Parameters:**
- `id`: User ID (MongoDB ObjectId)

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "role": "doctor",
  "phone": "+1234567890",
  "dateOfBirth": "1985-03-15T00:00:00.000Z",
  "gender": "Male",
  "maritalStatus": "Married",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "United States"
  },
  "isActive": true,
  "isEmailVerified": true,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-20T14:45:00.000Z",
  "lastLogin": "2024-01-20T14:45:00.000Z",
  "profileImage": {
    "url": "https://res.cloudinary.com/example/image/upload/v123/user_profiles/john_doe.jpg",
    "publicId": "user_profiles/john_doe",
    "uploadedAt": "2024-01-15T10:30:00.000Z"
  },
  // Doctor-specific fields
  "licenseNumber": "MD123456",
  "specialization": "Cardiology",
  "hospital": "City General Hospital",
  "department": "Cardiology",
  "yearsOfExperience": "15",
  "bio": "Experienced cardiologist with expertise in interventional cardiology",
  "organization": "City General Hospital",
  "experience": 15,
  "languages": ["English", "Spanish"],
  "consultationFees": {
    "online": 150,
    "inPerson": 200
  },
  "availability": {
    "workingDays": ["monday", "tuesday", "wednesday", "thursday", "friday"],
    "startTime": "09:00",
    "endTime": "17:00",
    "appointmentDuration": 30,
    "lunchBreakStart": "12:00",
    "lunchBreakEnd": "13:00"
  },
  "location": {
    "lat": 40.7128,
    "lng": -74.0060,
    "city": "New York",
    "state": "NY",
    "pincode": "10001",
    "address": "123 Main St, New York, NY 10001"
  },
  "specialties": ["Interventional Cardiology", "Echocardiography"],
  "emergencyAvailable": true,
  "ratings": {
    "average": 4.8,
    "count": 45
  }
}
```

### 4. Create New User
**POST** `/api/admin/users`

Creates a new user account. Supports profile image upload via multipart/form-data.

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `profileImage` (optional): Profile image file (JPEG, PNG, GIF, WebP, max 5MB)
- `email` (required): User's email address
- `password` (required): User's password (min 8 chars, must contain uppercase, lowercase, number, special char)
- `firstName` (required): User's first name
- `lastName` (required): User's last name
- `role` (required): User role (`patient`, `doctor`, `insurance`, `researcher`, `admin`)
- `phone` (optional): User's phone number
- `dateOfBirth` (optional): User's date of birth (ISO 8601 format)
- `gender` (optional): User's gender (`Male`, `Female`, `Other`, `Prefer not to say`)
- `maritalStatus` (optional): User's marital status (`Single`, `Married`, `Divorced`, `Widowed`, `Separated`)
- `address` (optional): JSON string of address object

**Role-specific fields:**

**For Doctors:**
- `licenseNumber` (required): Medical license number
- `specialization` (required): Medical specialization
- `hospital` (required): Hospital name
- `department` (optional): Department name
- `yearsOfExperience` (optional): Years of experience
- `bio` (optional): Professional bio
- `organization` (optional): Organization name
- `experience` (optional): Years of experience (number)
- `languages` (optional): Comma-separated list of languages
- `consultationFees` (optional): JSON string of fees object
- `availability` (optional): JSON string of availability object
- `location` (optional): JSON string of location object
- `specialties` (optional): Comma-separated list of specialties
- `emergencyAvailable` (optional): Boolean

**For Patients:**
- `dateOfBirth` (required): Date of birth
- `bloodType` (required): Blood type (`A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`)
- `height` (optional): Height in cm
- `weight` (optional): Weight in kg
- `allergies` (optional): Allergies information
- `currentMedications` (optional): Current medications
- `medicalConditions` (optional): Medical conditions
- `surgeries` (optional): Surgery history
- `emergencyContacts` (optional): JSON string of emergency contacts array

**For Insurance:**
- `insurance` (optional): JSON string of insurance information

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer <your-jwt-token>" \
  -F "profileImage=@/path/to/image.jpg" \
  -F "email=john.doe@example.com" \
  -F "password=SecurePass123!" \
  -F "firstName=John" \
  -F "lastName=Doe" \
  -F "role=doctor" \
  -F "phone=+1234567890" \
  -F "licenseNumber=MD123456" \
  -F "specialization=Cardiology" \
  -F "hospital=City General Hospital"
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "role": "doctor",
    "isActive": true,
    "isEmailVerified": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "profileImage": {
      "url": "https://res.cloudinary.com/example/image/upload/v123/user_profiles/john_doe.jpg",
      "publicId": "user_profiles/john_doe",
      "uploadedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### 5. Update User
**PUT** `/api/admin/users/:id`

Updates an existing user's information. Supports profile image upload via multipart/form-data.

**Parameters:**
- `id`: User ID (MongoDB ObjectId)

**Content-Type:** `multipart/form-data`

**Form Fields:** Same as create user, but all fields are optional.

**Example Request:**
```bash
curl -X PUT http://localhost:5000/api/admin/users/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer <your-jwt-token>" \
  -F "firstName=John" \
  -F "lastName=Smith" \
  -F "phone=+1987654321"
```

**Response:**
```json
{
  "message": "User updated successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Smith",
    "email": "john.doe@example.com",
    "phone": "+1987654321",
    "updatedAt": "2024-01-20T15:30:00.000Z"
  }
}
```

### 6. Delete User (Soft Delete)
**DELETE** `/api/admin/users/:id`

Deactivates a user account (soft delete). The user cannot delete their own account.

**Parameters:**
- `id`: User ID (MongoDB ObjectId)

**Response:**
```json
{
  "message": "User deactivated successfully"
}
```

### 7. Reactivate User
**PATCH** `/api/admin/users/:id/reactivate`

Reactivates a previously deactivated user account.

**Parameters:**
- `id`: User ID (MongoDB ObjectId)

**Response:**
```json
{
  "message": "User reactivated successfully"
}
```

## Error Responses

### Validation Error (400)
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address",
      "value": "invalid-email"
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

## File Upload Guidelines

### Profile Images
- **Supported formats:** JPEG, PNG, GIF, WebP
- **Maximum size:** 5MB
- **Storage:** Cloudinary with folder `user_profiles`
- **Naming:** Automatically generated based on user ID and timestamp

### Image Processing
- Images are automatically optimized by Cloudinary
- Multiple sizes are generated for responsive design
- Old images are automatically deleted when replaced

## Security Considerations

1. **Authentication:** All endpoints require valid JWT tokens
2. **Authorization:** Only admin users can access these endpoints
3. **Input Validation:** Comprehensive validation for all inputs
4. **File Upload Security:** File type and size validation
5. **Audit Logging:** All actions are logged for compliance
6. **Soft Delete:** Users are deactivated rather than permanently deleted
7. **Self-Protection:** Admins cannot delete their own accounts

## Rate Limiting

The API implements rate limiting to prevent abuse:
- 100 requests per 15 minutes per IP address
- Additional limits may apply based on server configuration

## Audit Logging

All admin user management actions are logged with the following information:
- Admin user ID
- Action type (CREATE, UPDATE, DELETE, VIEW, REACTIVATE)
- Target user ID
- Timestamp
- IP address
- User agent
- Action details

## Testing

You can test the API endpoints using tools like:
- Postman
- cURL
- Insomnia
- Thunder Client (VS Code extension)

Make sure to:
1. First authenticate and obtain a JWT token
2. Include the token in the Authorization header
3. Use the correct Content-Type for file uploads
4. Validate responses and error handling 