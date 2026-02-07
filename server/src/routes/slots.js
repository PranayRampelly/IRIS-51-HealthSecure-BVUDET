import express from 'express';
import { auth } from '../middleware/auth.js';
import slotGenerationService from '../services/slotGenerationService.js';

const router = express.Router();

// @desc    Get available slots for a doctor on a specific date (TEST ROUTE - NO AUTH)
// @route   GET /api/slots/test/:doctorId/:date
// @access  Public (for testing)
router.get('/test/:doctorId/:date', async (req, res) => {
  try {
    const { doctorId, date } = req.params;
    const { consultationType = 'both' } = req.query;
    
    console.log(`🧪 TEST: Fetching slots for doctor ${doctorId} on ${date}`);
    
    const availableSlots = await slotGenerationService.generateAvailableSlots(
      doctorId, 
      date, 
      consultationType
    );
    
    console.log(`✅ TEST: Found ${availableSlots.length} available slots`);
    
    res.json({
      success: true,
      doctorId,
      date,
      consultationType,
      availableSlots,
      totalSlots: availableSlots.length
    });
    
  } catch (error) {
    console.error('❌ TEST: Error fetching available slots:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available slots',
      error: error.message
    });
  }
});

// @desc    Get available slots for a doctor on a specific date
// @route   GET /api/slots/:doctorId/:date
// @access  Private
router.get('/:doctorId/:date', auth, async (req, res) => {
  try {
    const { doctorId, date } = req.params;
    const { consultationType = 'both' } = req.query;
    
    console.log(`🔍 Fetching slots for doctor ${doctorId} on ${date}`);
    
    const availableSlots = await slotGenerationService.generateAvailableSlots(
      doctorId, 
      date, 
      consultationType
    );
    
    console.log(`✅ Found ${availableSlots.length} available slots`);
    
    res.json({
      success: true,
      doctorId,
      date,
      consultationType,
      availableSlots,
      totalSlots: availableSlots.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching available slots:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available slots',
      error: error.message
    });
  }
});

// @desc    Get weekly slots for a doctor (for calendar view)
// @route   GET /api/slots/:doctorId/week/:startDate
// @access  Private
router.get('/:doctorId/week/:startDate', auth, async (req, res) => {
  try {
    const { doctorId, startDate } = req.params;
    const { days = 7 } = req.query;
    
    console.log(`📅 Fetching weekly slots for doctor ${doctorId} starting ${startDate}`);
    
    const weeklySlots = await slotGenerationService.generateWeeklySlots(
      doctorId, 
      startDate, 
      parseInt(days)
    );
    
    console.log(`✅ Generated weekly slots for ${Object.keys(weeklySlots).length} days`);
    
    res.json({
      success: true,
      doctorId,
      startDate,
      days: parseInt(days),
      weeklySlots
    });
    
  } catch (error) {
    console.error('❌ Error fetching weekly slots:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weekly slots',
      error: error.message
    });
  }
});

// @desc    Check slot availability in real-time
// @route   POST /api/slots/check-availability
// @access  Private
router.post('/check-availability', auth, async (req, res) => {
  try {
    const { doctorId, slotId, startTime, endTime } = req.body;
    
    console.log(`🔍 Checking availability for slot ${slotId}`);
    
    const isAvailable = await slotGenerationService.checkSlotAvailability(
      doctorId, 
      slotId, 
      startTime, 
      endTime
    );
    
    console.log(`✅ Slot availability: ${isAvailable ? 'Available' : 'Not Available'}`);
    
    res.json({
      success: true,
      slotId,
      isAvailable,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error checking slot availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check slot availability',
      error: error.message
    });
  }
});

// @desc    Reserve a slot temporarily (for booking process)
// @route   POST /api/slots/reserve
// @access  Private
router.post('/reserve', auth, async (req, res) => {
  try {
    const { doctorId, slotId, startTime, endTime } = req.body;
    const patientId = req.user._id;
    
    console.log(`🔒 Reserving slot ${slotId} for patient ${patientId}`);
    
    const reservation = await slotGenerationService.reserveSlot(
      doctorId, 
      slotId, 
      startTime, 
      endTime, 
      patientId
    );
    
    console.log(`✅ Slot reserved successfully: ${reservation._id}`);
    
    res.json({
      success: true,
      message: 'Slot reserved successfully',
      reservation: {
        id: reservation._id,
        expiresAt: reservation.reservationExpiresAt,
        status: reservation.status
      }
    });
    
  } catch (error) {
    console.error('❌ Error reserving slot:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to reserve slot'
    });
  }
});

// @desc    Get doctor's current availability status
// @route   GET /api/slots/doctor/:doctorId/status
// @access  Private
router.get('/doctor/:doctorId/status', auth, async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    console.log(`📊 Fetching availability status for doctor ${doctorId}`);
    
    const status = await slotGenerationService.getDoctorAvailabilityStatus(doctorId);
    
    console.log(`✅ Doctor status: ${status.currentStatus}`);
    
    res.json({
      success: true,
      status
    });
    
  } catch (error) {
    console.error('❌ Error fetching doctor availability status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor availability status',
      error: error.message
    });
  }
});

// @desc    Update doctor's availability settings
// @route   PUT /api/slots/doctor/:doctorId/availability
// @access  Private (Doctor only)
router.put('/doctor/:doctorId/availability', auth, async (req, res) => {
  try {
    const { doctorId } = req.params;
    const availabilityData = req.body;
    
    // Check if user is the doctor
    if (req.user._id.toString() !== doctorId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own availability'
      });
    }
    
    console.log(`🔄 Updating availability for doctor ${doctorId}`);
    
    const updatedAvailability = await slotGenerationService.updateDoctorAvailability(
      doctorId, 
      availabilityData
    );
    
    console.log(`✅ Availability updated successfully`);
    
    res.json({
      success: true,
      message: 'Availability updated successfully',
      availability: updatedAvailability
    });
    
  } catch (error) {
    console.error('❌ Error updating doctor availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update doctor availability',
      error: error.message
    });
  }
});

// @desc    Get slot statistics for a doctor
// @route   GET /api/slots/:doctorId/stats
// @access  Private
router.get('/:doctorId/stats', auth, async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { startDate, endDate } = req.query;
    
    console.log(`📊 Fetching slot statistics for doctor ${doctorId}`);
    
    // Generate stats for the date range
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    const stats = {
      totalDays: Math.ceil((end - start) / (1000 * 60 * 60 * 24)),
      totalSlots: 0,
      availableSlots: 0,
      bookedSlots: 0,
      workingDays: 0,
      nonWorkingDays: 0
    };
    
    // Generate slots for each day in range
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const daySlots = await slotGenerationService.generateAvailableSlots(doctorId, new Date(d));
      stats.totalSlots += daySlots.length;
      stats.availableSlots += daySlots.filter(s => s.isAvailable).length;
      stats.bookedSlots += daySlots.filter(s => !s.isAvailable).length;
      
      if (daySlots.length > 0) {
        stats.workingDays++;
      } else {
        stats.nonWorkingDays++;
      }
    }
    
    console.log(`✅ Generated statistics for ${stats.totalDays} days`);
    
    res.json({
      success: true,
      doctorId,
      dateRange: { start: start.toISOString(), end: end.toISOString() },
      stats
    });
    
  } catch (error) {
    console.error('❌ Error fetching slot statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch slot statistics',
      error: error.message
    });
  }
});

export default router;
