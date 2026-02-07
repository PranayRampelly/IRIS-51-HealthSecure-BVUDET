import express from 'express';
import timeSlotService from '../services/timeSlotService.js';
import { auth } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Validation middleware
const validateSlotCheck = [
  body('doctorId').isMongoId().withMessage('Invalid doctor ID'),
  body('hospitalId').isMongoId().withMessage('Invalid hospital ID'),
  body('date').isISO8601().withMessage('Invalid date format'),
  body('startTime').matches(/^\d{2}:\d{2}$/).withMessage('Invalid time format (HH:mm)'),
  body('duration').optional().isInt({ min: 15, max: 120 }).withMessage('Duration must be between 15 and 120 minutes')
];

// GET /api/time-slots/available/:doctorId/:date
// Get all available time slots for a doctor on a specific date
router.get('/available/:doctorId/:date', auth, async (req, res) => {
  try {
    const { doctorId, date } = req.params;
    
    // Validate date format
    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
    }
    
    const slots = await timeSlotService.getAvailableSlots(doctorId, targetDate);
    
    res.json({
      success: true,
      data: slots,
      date: date,
      doctorId: doctorId
    });
  } catch (error) {
    console.error('Error getting available slots:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get available slots',
      error: error.message
    });
  }
});

// POST /api/time-slots/check-availability
// Check if a specific time slot is available for booking
router.post('/check-availability', auth, validateSlotCheck, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { doctorId, hospitalId, date, startTime, duration = 30 } = req.body;
    
    const targetDate = new Date(date);
    const availability = await timeSlotService.checkSlotAvailability(
      doctorId,
      hospitalId,
      targetDate,
      startTime,
      duration
    );
    
    res.json({
      success: true,
      data: availability
    });
  } catch (error) {
    console.error('Error checking slot availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check slot availability',
      error: error.message
    });
  }
});

// GET /api/time-slots/doctor/:doctorId/calendar/:year/:month
// Get calendar data showing which days have available slots
router.get('/doctor/:doctorId/calendar/:year/:month', auth, async (req, res) => {
  try {
    const { doctorId, year, month } = req.params;
    
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    
    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({
        success: false,
        message: 'Invalid year or month'
      });
    }
    
    // Get the first and last day of the month
    const firstDay = new Date(yearNum, monthNum - 1, 1);
    const lastDay = new Date(yearNum, monthNum, 0);
    
    const calendarData = {};
    
    // Check each day of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const currentDate = new Date(yearNum, monthNum - 1, day);
      const dateString = currentDate.toISOString().split('T')[0];
      
      try {
        const slots = await timeSlotService.getAvailableSlots(doctorId, currentDate);
        const availableSlots = slots.filter(slot => slot.available).length;
        
        if (availableSlots > 0) {
          calendarData[dateString] = availableSlots;
        }
      } catch (error) {
        // If there's an error for a specific date, skip it
        console.warn(`Error getting slots for ${dateString}:`, error.message);
      }
    }
    
    res.json({
      success: true,
      data: calendarData,
      year: yearNum,
      month: monthNum
    });
  } catch (error) {
    console.error('Error getting calendar data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get calendar data',
      error: error.message
    });
  }
});

export default router;




