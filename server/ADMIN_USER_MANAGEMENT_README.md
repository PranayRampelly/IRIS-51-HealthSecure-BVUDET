# Admin User Management System

A comprehensive backend system for managing users in the HealthSecure platform, built with Node.js, Express, MongoDB, and Cloudinary.

## Features

### 🔐 Security & Authentication
- **JWT-based authentication** for all endpoints
- **Admin-only access** with role-based authorization
- **Comprehensive input validation** using express-validator
- **Audit logging** for all user management actions
- **Rate limiting** to prevent abuse

### 👥 User Management
- **Create users** with role-specific fields (patient, doctor, insurance, researcher, admin)
- **Update user information** including profile images
- **Soft delete** users (deactivate instead of permanent deletion)
- **Reactivate** previously deactivated users
- **Search and filter** users by various criteria
- **Pagination** for large user lists

### 📊 Analytics & Reporting
- **User statistics** by role and status
- **Comprehensive audit logs** for compliance
- **Real-time user activity** tracking

### 🖼️ File Management
- **Profile image upload** via Cloudinary
- **Automatic image optimization** and resizing
- **Secure file validation** (type, size, format)
- **Automatic cleanup** of old images

## API Endpoints

### Base URL
```
http://localhost:5000/api/admin/users
```

### Available Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stats` | Get user statistics |
| GET | `/` | List all users (with pagination/filtering) |
| GET | `/:id` | Get user by ID |
| POST | `/` | Create new user |
| PUT | `/:id` | Update user |
| DELETE | `/:id` | Deactivate user |
| PATCH | `/:id/reactivate` | Reactivate user |

## Quick Start

### 1. Prerequisites
- Node.js 18+ 
- MongoDB
- Cloudinary account
- Admin user account

### 2. Environment Variables
Ensure these are set in your `.env` file:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/healthsecure

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Server
PORT=5000
NODE_ENV=development
```

### 3. Installation
```bash
cd server
npm install
```

### 4. Start the Server
```bash
npm run dev
```

### 5. Test the API
```bash
node test-admin-user-api.js
```

## Usage Examples

### Authentication
First, obtain a JWT token by logging in as an admin:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@healthsecure.com",
    "password": "AdminPass123!"
  }'
```

### Create a New User
```bash
curl -X POST http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "email=john.doe@example.com" \
  -F "password=SecurePass123!" \
  -F "firstName=John" \
  -F "lastName=Doe" \
  -F "role=patient" \
  -F "phone=+1234567890" \
  -F "dateOfBirth=1990-01-01" \
  -F "bloodType=A+"
```

### List Users with Filtering
```bash
curl -X GET "http://localhost:5000/api/admin/users?role=doctor&status=active&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update User
```bash
curl -X PUT http://localhost:5000/api/admin/users/USER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "firstName=Updated" \
  -F "lastName=Name" \
  -F "phone=+1987654321"
```

### Upload Profile Image
```bash
curl -X PUT http://localhost:5000/api/admin/users/USER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "profileImage=@/path/to/image.jpg"
```

## User Roles & Fields

### Patient Users
**Required fields:**
- `email`, `password`, `firstName`, `lastName`, `role`
- `dateOfBirth`, `bloodType`

**Optional fields:**
- `phone`, `gender`, `maritalStatus`, `address`
- `height`, `weight`, `allergies`, `currentMedications`
- `medicalConditions`, `surgeries`, `emergencyContacts`

### Doctor Users
**Required fields:**
- `email`, `password`, `firstName`, `lastName`, `role`
- `licenseNumber`, `specialization`, `hospital`

**Optional fields:**
- `phone`, `gender`, `maritalStatus`, `address`
- `department`, `yearsOfExperience`, `bio`, `organization`
- `experience`, `languages`, `consultationFees`, `availability`
- `location`, `specialties`, `emergencyAvailable`

### Insurance Users
**Required fields:**
- `email`, `password`, `firstName`, `lastName`, `role`

**Optional fields:**
- `phone`, `gender`, `maritalStatus`, `address`
- `insurance` (JSON object with provider details)

### Researcher Users
**Required fields:**
- `email`, `password`, `firstName`, `lastName`, `role`

**Optional fields:**
- `phone`, `gender`, `maritalStatus`, `address`
- Any additional research-specific fields

## Validation Rules

### Email
- Must be a valid email format
- Automatically normalized (lowercase, trimmed)

### Password
- Minimum 8 characters
- Must contain uppercase, lowercase, number, and special character
- Pattern: `^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]`

### Names
- 2-50 characters
- Only letters, spaces, hyphens, and apostrophes allowed

### Phone
- Must be a valid mobile phone number format

### Date of Birth
- Must be a valid ISO 8601 date
- Age must be reasonable (0-120 years)

### Profile Images
- Supported formats: JPEG, PNG, GIF, WebP
- Maximum size: 5MB
- Automatically optimized by Cloudinary

## Error Handling

The API returns consistent error responses:

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

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (no/invalid token)
- `403` - Forbidden (insufficient privileges)
- `404` - Not Found
- `500` - Server Error

## Security Features

### Authentication
- JWT tokens with configurable expiration
- Secure token storage and transmission
- Automatic token validation on all protected routes

### Authorization
- Role-based access control
- Admin-only endpoint protection
- Self-protection (admins can't delete themselves)

### Input Validation
- Comprehensive field validation
- SQL injection prevention
- XSS protection
- File upload security

### Audit Logging
All user management actions are logged with:
- Admin user ID
- Action type and timestamp
- Target user ID
- IP address and user agent
- Detailed action description

## File Structure

```
server/
├── src/
│   ├── controllers/
│   │   └── adminUserController.js    # Main controller logic
│   ├── routes/
│   │   └── adminUsers.js             # Route definitions
│   ├── middleware/
│   │   ├── adminUserValidation.js    # Input validation
│   │   ├── auth.js                   # Authentication
│   │   └── cloudinary.js             # File upload
│   └── server.js                     # Main server file
├── test-admin-user-api.js            # Test script
├── ADMIN_USER_API_DOCUMENTATION.md   # Detailed API docs
└── ADMIN_USER_MANAGEMENT_README.md   # This file
```

## Testing

### Automated Tests
Run the comprehensive test suite:

```bash
node test-admin-user-api.js
```

The test suite covers:
- Authentication
- CRUD operations
- File uploads
- Search and filtering
- Error handling

### Manual Testing
Use tools like Postman, cURL, or Insomnia to test endpoints manually.

### Test Data
The test script creates sample users for testing:
- Test patient: `test.user@example.com`
- Test doctor: `test.doctor@example.com`

## Monitoring & Logging

### Access Logs
All API requests are logged with:
- Request method and URL
- Response status and timing
- User agent and IP address
- Authentication status

### Error Logging
- Detailed error messages
- Stack traces for debugging
- Error categorization

### Performance Monitoring
- Request/response timing
- Database query performance
- File upload metrics

## Deployment

### Production Considerations
1. **Environment Variables**: Use strong, unique secrets
2. **Database**: Use MongoDB Atlas or similar managed service
3. **File Storage**: Configure Cloudinary for production
4. **SSL/TLS**: Enable HTTPS in production
5. **Rate Limiting**: Adjust limits based on expected traffic
6. **Monitoring**: Set up application monitoring and alerting

### Docker Support
The system can be containerized using Docker:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify JWT token is valid and not expired
   - Check admin role in token payload
   - Ensure Authorization header format is correct

2. **Validation Errors**
   - Check field requirements for each user role
   - Verify data formats (email, phone, dates)
   - Ensure file uploads meet size and type requirements

3. **File Upload Issues**
   - Verify Cloudinary credentials
   - Check file size and format
   - Ensure proper multipart/form-data encoding

4. **Database Connection**
   - Verify MongoDB connection string
   - Check network connectivity
   - Ensure database permissions

### Debug Mode
Enable debug logging by setting:
```env
NODE_ENV=development
DEBUG=admin-user:*
```

## Contributing

1. Follow the existing code style
2. Add comprehensive tests for new features
3. Update documentation for API changes
4. Ensure all validations are in place
5. Test with different user roles and scenarios

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Run the test suite to verify functionality
4. Check server logs for detailed error information 