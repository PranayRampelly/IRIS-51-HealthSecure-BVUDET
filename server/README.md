# Proof Health Nexus Backend

A comprehensive Node.js backend API for the Proof Health Nexus platform, providing secure health record management, proof generation, and verification for both patients and doctors.

## Features

### Patient Features
- **Dashboard Home**: Overview of health records, pending requests, and activity
- **My Records**: Upload, view, and manage health records
- **Record Detail**: Detailed view of individual health records
- **Shared Proofs**: Generate and manage health proofs
- **Proof Detail**: View and manage individual proofs
- **Access Logs**: Track all data access and sharing activities
- **Settings**: Manage profile and account settings

### Doctor Features
- **Dashboard Home**: Overview of patients, pending requests, and statistics
- **Request Proof**: Request health proofs from patients
- **Verify Proofs**: Verify patient health proofs
- **Upload Prescription**: Upload prescriptions for patients
- **My Patients**: View and manage patient list
- **Patient Detail**: Detailed patient information and history
- **Proof Detail**: View and verify patient proofs
- **Settings**: Manage doctor profile and settings

## Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs, helmet, rate limiting
- **File Upload**: Multer
- **Validation**: express-validator
- **Logging**: Morgan, custom access logging

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   cd proof-health-nexus-main/server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/proof-health-nexus
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (patient/doctor)
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Health Records (Patient Only)
- `GET /api/health-records` - Get all health records
- `GET /api/health-records/:id` - Get single health record
- `POST /api/health-records` - Create new health record
- `PUT /api/health-records/:id` - Update health record
- `DELETE /api/health-records/:id` - Delete health record
- `GET /api/health-records/stats` - Get health record statistics

### Proofs (Patient Only)
- `GET /api/proofs` - Get all proofs
- `GET /api/proofs/:id` - Get single proof
- `POST /api/proofs` - Create new proof
- `PUT /api/proofs/:id` - Update proof
- `PUT /api/proofs/:id/revoke` - Revoke proof
- `GET /api/proofs/stats` - Get proof statistics

### Proof Verification (Public)
- `GET /api/proofs/verify/:signature` - Verify proof signature

### Proof Requests
- `GET /api/proof-requests/patient` - Get patient's proof requests
- `GET /api/proof-requests/doctor` - Get doctor's proof requests
- `POST /api/proof-requests` - Create proof request (doctor)
- `PUT /api/proof-requests/:id/approve` - Approve request (patient)
- `PUT /api/proof-requests/:id/deny` - Deny request (patient)
- `PUT /api/proof-requests/:id/cancel` - Cancel request (doctor)
- `GET /api/proof-requests/stats` - Get request statistics

### Doctor Features
- `GET /api/doctor/dashboard` - Get doctor dashboard
- `GET /api/doctor/patients` - Get all patients
- `GET /api/doctor/patients/:id` - Get patient detail
- `GET /api/doctor/patients/search` - Search patients
- `POST /api/doctor/prescriptions` - Upload prescription

### Access Logs
- `GET /api/access-logs` - Get user access logs
- `GET /api/access-logs/stats` - Get access log statistics
- `GET /api/access-logs/export` - Export access logs
- `GET /api/access-logs/admin` - Get all access logs (admin)

## Database Models

### User
- Supports both patient and doctor roles
- Role-specific fields (license, specialization for doctors; blood type, DOB for patients)
- Password hashing with bcrypt
- Email verification status

### HealthRecord
- Links to patient and optional doctor
- File upload support
- Metadata and tagging
- Status tracking (Active, Archived, Deleted)

### Proof
- Cryptographic signature generation
- Links to health records
- Expiration dates
- Public/private visibility

### ProofRequest
- Request tracking between doctors and patients
- Urgency levels
- Approval/denial workflow
- Expiration handling

### AccessLog
- Comprehensive activity tracking
- IP address and user agent logging
- Automatic cleanup (TTL index)

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for password security
- **Rate Limiting**: Prevents abuse and DDoS attacks
- **CORS Protection**: Configurable cross-origin requests
- **Helmet**: Security headers
- **Input Validation**: Comprehensive request validation
- **Access Control**: Role-based permissions
- **Audit Logging**: Complete activity tracking

## File Upload

The backend supports file uploads for health records and prescriptions:

- **Supported Formats**: PDF, images, documents
- **File Size Limit**: Configurable (default 10MB)
- **Storage**: Local file system (can be extended to cloud storage)
- **Security**: File type validation and virus scanning recommended

## Error Handling

- **Centralized Error Handling**: Consistent error responses
- **Validation Errors**: Detailed field-level validation
- **Database Errors**: Proper MongoDB error handling
- **JWT Errors**: Token validation and expiration handling

## Logging

- **Request Logging**: Morgan for HTTP request logging
- **Access Logging**: Custom logging for data access tracking
- **Error Logging**: Comprehensive error tracking
- **Audit Trail**: Complete user activity history

## Development

### Scripts
```bash
npm run dev      # Start development server with nodemon
npm start        # Start production server
npm test         # Run tests (when implemented)
```

### Environment Variables
See `.env.example` for all available configuration options.

### Database Setup
1. Install MongoDB locally or use MongoDB Atlas
2. Update `MONGODB_URI` in `.env`
3. The application will create collections automatically

## Production Deployment

1. **Environment Setup**
   - Set `NODE_ENV=production`
   - Use production MongoDB URI
   - Set strong JWT secret
   - Configure CORS origin

2. **Security Considerations**
   - Use HTTPS
   - Set up proper firewall rules
   - Configure rate limiting
   - Enable file upload restrictions
   - Set up monitoring and logging

3. **Performance Optimization**
   - Enable compression
   - Use CDN for static files
   - Implement caching strategies
   - Monitor database performance

## API Documentation

The API provides comprehensive documentation at `/api` endpoint when the server is running.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please refer to the main project documentation or create an issue in the repository. 