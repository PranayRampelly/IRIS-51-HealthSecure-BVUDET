# Doctor Schedule Backend

## Overview
This backend provides comprehensive functionality for doctors to manage their appointment schedules. It includes endpoints for viewing available time slots, creating appointments, managing patient schedules, and getting appointment statistics.

## Features

- **Time Slot Management**: Get available time slots for specific dates
- **Appointment Creation**: Create new appointments with validation
- **Schedule Viewing**: View doctor's schedule for date ranges
- **Patient Management**: Search and manage patient lists
- **Statistics**: Get appointment statistics and analytics
- **Calendar Integration**: Get calendar data for month views
- **Status Management**: Update appointment statuses with audit trail

## File Structure

```
server/src/
├── services/
│   └── doctorScheduleService.js    # Core business logic
├── routes/
│   └── doctorSchedule.js           # API endpoints
├── models/
│   ├── Appointment.js              # Appointment data model
│   └── DoctorAvailability.js       # Doctor availability model
└── server.js                       # Main server file (updated)

server/
├── DOCTOR_SCHEDULE_API_DOCUMENTATION.md  # Complete API documentation
├── DOCTOR_SCHEDULE_README.md             # This file
└── test-doctor-schedule.js               # Test script
```

## Installation & Setup

### 1. Prerequisites
- Node.js (v16 or higher)
- MongoDB database
- Existing HealthSecure backend setup

### 2. Database Setup
Ensure you have the following collections in your MongoDB database:
- `appointments` - for storing appointment data
- `doctoravailabilities` - for storing doctor working hours
- `users` - for storing doctor and patient information

### 3. Backend Setup
The backend is already integrated into the main server. No additional setup is required.

## API Endpoints

### Base URL
```
http://localhost:8080/api/doctor/schedule
```

### Available Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/slots/:date` | Get available time slots for a date |
| GET | `/range` | Get schedule for a date range |
| GET | `/today` | Get today's appointments |
| GET | `/patients` | Get patient list with search |
| GET | `/stats` | Get appointment statistics |
| GET | `/calendar/:year/:month` | Get calendar data for a month |
| POST | `/appointment` | Create a new appointment |
| PUT | `/appointment/:id/status` | Update appointment status |
| GET | `/check-availability` | Check if a slot is available |
| GET | `/availability` | Get availability settings |

## Usage Examples

### 1. Get Available Time Slots
```javascript
const response = await fetch('/api/doctor/schedule/slots/2024-01-20', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const slots = await response.json();
```

### 2. Create Appointment
```javascript
const appointmentData = {
  patientId: 'patient_id_here',
  scheduledDate: '2024-01-25',
  scheduledTime: '14:30',
  appointmentType: 'consultation',
  consultationType: 'online',
  notes: 'Follow-up consultation'
};

const response = await fetch('/api/doctor/schedule/appointment', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(appointmentData)
});
```

### 3. Get Today's Appointments
```javascript
const response = await fetch('/api/doctor/schedule/today', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const appointments = await response.json();
```

## Authentication

All endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Data Models

### Appointment Model
The appointment model includes:
- Patient and doctor information
- Scheduling details (date, time, duration)
- Status tracking with history
- Medical information (symptoms, diagnosis, prescriptions)
- Payment and insurance details

### Doctor Availability Model
The availability model includes:
- Working days and hours
- Break times
- Appointment duration settings
- Online/offline status
- Analytics and statistics

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created (for new appointments)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Testing

### Running Tests
Use the provided test script to verify all endpoints:

```bash
cd server
node test-doctor-schedule.js
```

**Note**: Update the `TEST_TOKEN` variable in the test file with a valid JWT token before running.

### Manual Testing
You can also test endpoints manually using tools like:
- Postman
- Insomnia
- cURL
- Browser Developer Tools

## Integration with Frontend

The backend is designed to work seamlessly with the existing frontend. The frontend can:

1. **Fetch Available Slots**: Get time slots for calendar display
2. **Create Appointments**: Schedule new appointments
3. **View Schedule**: Display doctor's schedule
4. **Manage Patients**: Search and select patients
5. **Update Status**: Change appointment statuses

## Security Features

- **Authentication**: JWT-based authentication required for all endpoints
- **Authorization**: Role-based access control (doctors only)
- **Input Validation**: Comprehensive validation for all inputs
- **Rate Limiting**: Built-in rate limiting to prevent abuse
- **Audit Trail**: Complete history of appointment status changes

## Performance Considerations

- **Database Indexing**: Optimized indexes for common queries
- **Pagination**: Support for large datasets
- **Caching**: Appropriate cache headers for static data
- **Efficient Queries**: Optimized database queries

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Ensure JWT token is valid and not expired
   - Check that user has doctor role

2. **Validation Errors**
   - Verify all required fields are provided
   - Check date and time formats (YYYY-MM-DD, HH:MM)

3. **Database Connection Issues**
   - Verify MongoDB connection
   - Check database permissions

4. **Slot Availability Issues**
   - Ensure doctor has set working hours
   - Check for conflicting appointments

### Debug Mode
Enable debug logging by setting environment variable:
```bash
DEBUG=doctor-schedule:*
```

## Development

### Adding New Features
1. Update the service layer (`doctorScheduleService.js`)
2. Add new routes (`doctorSchedule.js`)
3. Update validation middleware
4. Add tests
5. Update documentation

### Code Style
- Use ES6+ syntax
- Follow existing naming conventions
- Include JSDoc comments for functions
- Handle errors gracefully
- Use async/await for asynchronous operations

## Deployment

### Production Considerations
- Set appropriate environment variables
- Configure proper logging
- Set up monitoring and alerting
- Use HTTPS in production
- Configure proper CORS settings

### Environment Variables
```bash
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=8080
```

## Support

For technical support or questions:
1. Check the API documentation
2. Review server logs
3. Run the test script
4. Contact the development team

## Changelog

### Version 1.0.0
- Initial release
- Complete CRUD operations for appointments
- Time slot management
- Patient management
- Statistics and analytics
- Calendar integration

## License

This project is part of the HealthSecure platform and follows the same licensing terms.




