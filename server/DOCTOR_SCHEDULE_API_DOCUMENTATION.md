# Doctor Schedule API Documentation

## Overview
The Doctor Schedule API provides comprehensive functionality for doctors to manage their appointment schedules, including viewing available time slots, creating appointments, and managing patient schedules.

## Base URL
```
http://localhost:8080/api/doctor/schedule
```

## Authentication
All endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Get Available Time Slots
**GET** `/slots/:date`

Get available time slots for a specific date.

**Parameters:**
- `date` (path parameter): Date in YYYY-MM-DD format

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "time": "09:00 AM",
      "available": true,
      "bookedBy": null,
      "startTime": "09:00",
      "endTime": "09:30",
      "duration": 30
    },
    {
      "time": "09:30 AM",
      "available": false,
      "bookedBy": "Booked",
      "startTime": "09:30",
      "endTime": "10:00",
      "duration": 30
    }
  ]
}
```

**Example:**
```bash
GET /api/doctor/schedule/slots/2024-01-20
```

### 2. Get Doctor's Schedule Range
**GET** `/range?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`

Get doctor's schedule for a specific date range.

**Query Parameters:**
- `startDate`: Start date in YYYY-MM-DD format
- `endDate`: End date in YYYY-MM-DD format

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "appointment_id",
      "patient": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phone": "+1234567890"
      },
      "scheduledDate": "2024-01-20T00:00:00.000Z",
      "scheduledTime": "09:30",
      "status": "confirmed",
      "appointmentType": "consultation"
    }
  ]
}
```

**Example:**
```bash
GET /api/doctor/schedule/range?startDate=2024-01-20&endDate=2024-01-27
```

### 3. Get Today's Appointments
**GET** `/today`

Get all appointments scheduled for today.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "appointment_id",
      "patient": {
        "firstName": "Jane",
        "lastName": "Smith",
        "email": "jane@example.com",
        "phone": "+1234567890"
      },
      "scheduledTime": "10:00",
      "status": "scheduled",
      "appointmentType": "follow_up"
    }
  ]
}
```

### 4. Get Patients
**GET** `/patients?search=search_term`

Get list of patients for the doctor with optional search.

**Query Parameters:**
- `search` (optional): Search term for patient name or email

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "patient_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "dateOfBirth": "1990-01-01T00:00:00.000Z",
      "gender": "Male",
      "profileImage": "image_url"
    }
  ]
}
```

**Example:**
```bash
GET /api/doctor/schedule/patients?search=john
```

### 5. Get Appointment Statistics
**GET** `/stats`

Get appointment statistics for the doctor.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalPatients": 25,
    "confirmedAppointments": 3,
    "scheduledAppointments": 2,
    "availableSlots": 8
  }
}
```

### 6. Get Calendar Data
**GET** `/calendar/:year/:month`

Get calendar data for a specific month.

**Parameters:**
- `year`: Year (e.g., 2024)
- `month`: Month (1-12)

**Response:**
```json
{
  "success": true,
  "data": {
    "2024-01-20": 2,
    "2024-01-21": 1,
    "2024-01-22": 0,
    "2024-01-23": 3
  }
}
```

**Example:**
```bash
GET /api/doctor/schedule/calendar/2024/1
```

### 7. Create Appointment
**POST** `/appointment`

Create a new appointment.

**Request Body:**
```json
{
  "patientId": "patient_id",
  "scheduledDate": "2024-01-25",
  "scheduledTime": "14:30",
  "appointmentType": "consultation",
  "consultationType": "online",
  "notes": "Follow-up consultation",
  "estimatedDuration": 30
}
```

**Required Fields:**
- `patientId`: MongoDB ObjectId of the patient
- `scheduledDate`: Date in YYYY-MM-DD format
- `scheduledTime`: Time in HH:MM format
- `appointmentType`: One of: consultation, follow_up, emergency, procedure, checkup
- `consultationType`: One of: online, in-person

**Response:**
```json
{
  "success": true,
  "message": "Appointment created successfully",
  "data": {
    "_id": "appointment_id",
    "patient": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    "scheduledDate": "2024-01-25T00:00:00.000Z",
    "scheduledTime": "14:30",
    "status": "scheduled"
  }
}
```

### 8. Update Appointment Status
**PUT** `/appointment/:id/status`

Update the status of an existing appointment.

**Parameters:**
- `id`: Appointment ID

**Request Body:**
```json
{
  "status": "confirmed"
}
```

**Valid Status Values:**
- `pending`
- `confirmed`
- `in-progress`
- `completed`
- `cancelled`
- `no-show`
- `rescheduled`

**Response:**
```json
{
  "success": true,
  "message": "Appointment status updated successfully",
  "data": {
    "_id": "appointment_id",
    "status": "confirmed",
    "statusHistory": [
      {
        "status": "confirmed",
        "timestamp": "2024-01-20T10:30:00.000Z",
        "updatedBy": "doctor_id"
      }
    ]
  }
}
```

### 9. Check Slot Availability
**GET** `/check-availability?date=YYYY-MM-DD&time=HH:MM`

Check if a specific time slot is available.

**Query Parameters:**
- `date`: Date in YYYY-MM-DD format
- `time`: Time in HH:MM format

**Response:**
```json
{
  "success": true,
  "data": {
    "isAvailable": true
  }
}
```

**Example:**
```bash
GET /api/doctor/schedule/check-availability?date=2024-01-25&time=14:30
```

### 10. Get Availability Settings
**GET** `/availability`

Get doctor's working hours and availability settings.

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Use /api/doctor-availability/me for detailed availability settings",
    "availableSlots": [
      {
        "time": "09:00 AM",
        "available": true,
        "startTime": "09:00",
        "endTime": "09:30",
        "duration": 30
      }
    ]
  }
}
```

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "scheduledDate",
      "message": "scheduledDate is required"
    }
  ]
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "message": "Access denied. Only doctors can access schedule."
}
```

### Forbidden (403)
```json
{
  "success": false,
  "message": "Access denied. Only doctors can access schedule."
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Appointment not found"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Failed to create appointment",
  "error": "Error details"
}
```

## Usage Examples

### Frontend Integration

#### 1. Get Available Slots
```javascript
const getAvailableSlots = async (date) => {
  try {
    const response = await fetch(`/api/doctor/schedule/slots/${date}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching slots:', error);
  }
};
```

#### 2. Create Appointment
```javascript
const createAppointment = async (appointmentData) => {
  try {
    const response = await fetch('/api/doctor/schedule/appointment', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(appointmentData)
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating appointment:', error);
  }
};
```

#### 3. Get Today's Appointments
```javascript
const getTodayAppointments = async () => {
  try {
    const response = await fetch('/api/doctor/schedule/today', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching today appointments:', error);
  }
};
```

## Notes

1. **Time Format**: All times are returned in 12-hour format (e.g., "09:00 AM") for display purposes, but stored in 24-hour format internally.

2. **Date Format**: All dates should be in YYYY-MM-DD format for API requests.

3. **Authentication**: All endpoints require a valid JWT token from a doctor user.

4. **Error Handling**: Always check the `success` field in responses and handle errors appropriately.

5. **Rate Limiting**: The API includes rate limiting to prevent abuse.

6. **Validation**: All input data is validated on both client and server side.

## Support

For technical support or questions about the API, please contact the development team or refer to the server logs for detailed error information.




