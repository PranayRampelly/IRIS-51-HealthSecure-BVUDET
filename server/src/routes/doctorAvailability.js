import express from 'express';
import { auth } from '../middleware/auth.js';
import realTimeAvailabilityService from '../services/realTimeAvailabilityService.js';
import DoctorAvailability from '../models/DoctorAvailability.js';

const router = express.Router();

// @desc    Get doctor's availability
// @route   GET /api/doctor-availability/me
// @access  Private (Doctor only)
router.get('/me', auth, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only doctors can access availability settings.'
      });
    }

    const availability = await realTimeAvailabilityService.getDoctorAvailability(req.user._id);
    // Prevent caching so clients don't receive 304 with empty body
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    console.log('📥 Route received availability:', {
      hasAvailability: !!availability,
      type: typeof availability,
      workingDays: availability?.workingDays?.length || 0,
      workingDaysDetails: availability?.workingDays?.map(day => ({ day: day.day, isWorking: day.isWorking }))
    });
    
    // Filter to only working days before sending
    const filteredWorkingDays = availability?.workingDays?.filter(day => day.isWorking) || [];
    console.log('🔍 Filtered working days:', {
      total: availability?.workingDays?.length || 0,
      working: filteredWorkingDays.length,
      workingDays: filteredWorkingDays.map(day => day.day)
    });
    
    if (!availability) {
      console.error('❌ No availability data returned from service');
      return res.status(500).json({
        success: false,
        message: 'No availability data returned'
      });
    }
    
    res.json({
      success: true,
      data: {
        workingDays: filteredWorkingDays,
        defaultStartTime: availability.defaultStartTime,
        defaultEndTime: availability.defaultEndTime,
        appointmentDuration: availability.appointmentDuration,
        isOnline: availability.isOnline,
        status: availability.status,
        currentStatus: availability.currentStatus,
        analytics: availability.analytics,
        settings: availability.settings,
        autoSave: availability.autoSave,
        realTimeUpdates: availability.realTimeUpdates
      }
    });
  } catch (error) {
    console.error('Error getting doctor availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get availability settings'
    });
  }
});

// @desc    Get complete doctor data (availability + profile)
// @route   GET /api/doctor-availability/me/complete
// @access  Private (Doctor only)
router.get('/me/complete', auth, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only doctors can access availability settings.'
      });
    }

    const completeData = await realTimeAvailabilityService.getCompleteDoctorData(req.user._id);
    // Prevent caching so clients don't receive 304 with empty body
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    res.json({
      success: true,
      data: completeData
    });
  } catch (error) {
    console.error('Error getting complete doctor data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get complete doctor data'
    });
  }
});

// @desc    Update doctor's availability
// @route   PUT /api/doctor-availability/me
// @access  Private (Doctor only)
router.put('/me', auth, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only doctors can update availability settings.'
      });
    }

    const {
      workingDays,
      defaultStartTime,
      defaultEndTime,
      appointmentDuration,
      autoSave,
      realTimeUpdates,
      settings
    } = req.body;

    const updateData = {};
    
    if (workingDays) updateData.workingDays = workingDays;
    if (defaultStartTime) updateData.defaultStartTime = defaultStartTime;
    if (defaultEndTime) updateData.defaultEndTime = defaultEndTime;
    if (appointmentDuration) updateData.appointmentDuration = appointmentDuration;
    if (autoSave !== undefined) updateData.autoSave = autoSave;
    if (realTimeUpdates !== undefined) updateData.realTimeUpdates = realTimeUpdates;
    if (settings) updateData.settings = settings;

    const availability = await realTimeAvailabilityService.updateDoctorAvailability(
      req.user._id,
      updateData
    );

    res.json({
      success: true,
      message: 'Availability settings updated successfully',
      data: {
        workingDays: availability.workingDays.filter(day => day.isWorking),
        defaultStartTime: availability.defaultStartTime,
        defaultEndTime: availability.defaultEndTime,
        appointmentDuration: availability.appointmentDuration,
        analytics: availability.analytics,
        settings: availability.settings
      }
    });
  } catch (error) {
    console.error('Error updating doctor availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update availability settings'
    });
  }
});

// @desc    Update doctor's online status
// @route   PUT /api/doctor-availability/me/online-status
// @access  Private (Doctor only)
router.put('/me/online-status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only doctors can update online status.'
      });
    }

    const { isOnline } = req.body;

    if (typeof isOnline !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isOnline must be a boolean value'
      });
    }

    const availability = await realTimeAvailabilityService.updateOnlineStatus(
      req.user._id,
      isOnline
    );

    res.json({
      success: true,
      message: `Doctor is now ${isOnline ? 'online' : 'offline'}`,
      status: {
        isOnline: availability.isOnline,
        status: availability.status,
        lastOnlineAt: availability.lastOnlineAt
      }
    });
  } catch (error) {
    console.error('Error updating online status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update online status'
    });
  }
});

// @desc    Get available slots for a specific date
// @route   GET /api/doctor-availability/:doctorId/slots/:date
// @access  Public
router.get('/:doctorId/slots/:date', async (req, res) => {
  try {
    const { doctorId, date } = req.params;

    // Validate date format
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }

    const availableSlots = await realTimeAvailabilityService.getAvailableSlots(
      doctorId,
      date
    );

    res.json({
      success: true,
      date,
      doctorId,
      availableSlots,
      totalSlots: availableSlots.length,
      availableCount: availableSlots.filter(slot => slot.isAvailable).length
    });
  } catch (error) {
    console.error('Error getting available slots:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get available slots'
    });
  }
});

// @desc    Lock a slot temporarily
// @route   POST /api/doctor-availability/:doctorId/slots/:date/:time/lock
// @access  Private
router.post('/:doctorId/slots/:date/:time/lock', auth, async (req, res) => {
  try {
    const { doctorId, date, time } = req.params;
    const { duration = 30 } = req.body;

    const result = await realTimeAvailabilityService.lockSlot(
      doctorId,
      date,
      time,
      req.user._id,
      duration
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: 'Slot locked successfully',
      lockData: result.lockData
    });
  } catch (error) {
    console.error('Error locking slot:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to lock slot'
    });
  }
});

// @desc    Unlock a slot
// @route   DELETE /api/doctor-availability/:doctorId/slots/:date/:time/unlock
// @access  Private
router.delete('/:doctorId/slots/:date/:time/unlock', auth, async (req, res) => {
  try {
    const { doctorId, date, time } = req.params;

    const result = await realTimeAvailabilityService.unlockSlot(
      doctorId,
      date,
      time
    );

    res.json({
      success: true,
      message: 'Slot unlocked successfully'
    });
  } catch (error) {
    console.error('Error unlocking slot:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unlock slot'
    });
  }
});

// @desc    Check slot availability
// @route   GET /api/doctor-availability/:doctorId/slots/:date/:time/check
// @access  Public
router.get('/:doctorId/slots/:date/:time/check', async (req, res) => {
  try {
    const { doctorId, date, time } = req.params;

    const result = await realTimeAvailabilityService.checkSlotAvailability(
      doctorId,
      date,
      time
    );

    res.json({
      success: true,
      isAvailable: result.isAvailable,
      slot: result.slot
    });
  } catch (error) {
    console.error('Error checking slot availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check slot availability'
    });
  }
});

// @desc    Get doctor's current status
// @route   GET /api/doctor-availability/:doctorId/status
// @access  Public
router.get('/:doctorId/status', async (req, res) => {
  try {
    const { doctorId } = req.params;

    const status = realTimeAvailabilityService.getDoctorStatus(doctorId);

    res.json({
      success: true,
      status: {
        isOnline: status.isOnline,
        status: status.status,
        currentStatus: status.currentStatus,
        lastUpdated: status.lastUpdated
      }
    });
  } catch (error) {
    console.error('Error getting doctor status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get doctor status'
    });
  }
});

// @desc    Get all online doctors
// @route   GET /api/doctor-availability/online-doctors
// @access  Public
router.get('/online-doctors', async (req, res) => {
  try {
    const onlineDoctors = await realTimeAvailabilityService.getOnlineDoctors();

    res.json({
      success: true,
      onlineDoctors: onlineDoctors.map(doctor => ({
        doctorId: doctor.doctorId._id,
        name: doctor.doctorId.name,
        email: doctor.doctorId.email,
        status: doctor.status,
        isOnline: doctor.isOnline,
        lastOnlineAt: doctor.lastOnlineAt,
        analytics: doctor.analytics
      })),
      count: onlineDoctors.length
    });
  } catch (error) {
    console.error('Error getting online doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get online doctors'
    });
  }
});

// @desc    Get doctor's analytics
// @route   GET /api/doctor-availability/me/analytics
// @access  Private (Doctor only)
router.get('/me/analytics', auth, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only doctors can access analytics.'
      });
    }

    const availability = await realTimeAvailabilityService.getDoctorAvailability(req.user._id);

    res.json({
      success: true,
      analytics: {
        totalWorkingHours: availability.analytics.totalWorkingHours,
        totalSlotsPerDay: availability.analytics.totalSlotsPerDay,
        weeklyAvailability: availability.analytics.weeklyAvailability,
        workingDays: availability.workingDays.filter(day => day.isWorking).length,
        currentStatus: availability.currentStatus,
        status: availability.status
      }
    });
  } catch (error) {
    console.error('Error getting doctor analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics'
    });
  }
});

// @desc    Reset doctor availability to default
// @route   POST /api/doctor-availability/me/reset
// @access  Private (Doctor only)
router.post('/me/reset', auth, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only doctors can reset availability settings.'
      });
    }

    const defaultWorkingDays = [
      { day: 'monday', isWorking: true, startTime: '09:00', endTime: '17:00', breaks: [{ startTime: '12:00', endTime: '13:00', type: 'lunch', description: 'Lunch Break' }] },
      { day: 'tuesday', isWorking: true, startTime: '09:00', endTime: '17:00', breaks: [{ startTime: '12:00', endTime: '13:00', type: 'lunch', description: 'Lunch Break' }] },
      { day: 'wednesday', isWorking: true, startTime: '09:00', endTime: '17:00', breaks: [{ startTime: '12:00', endTime: '13:00', type: 'lunch', description: 'Lunch Break' }] },
      { day: 'thursday', isWorking: true, startTime: '09:00', endTime: '17:00', breaks: [{ startTime: '12:00', endTime: '13:00', type: 'lunch', description: 'Lunch Break' }] },
      { day: 'friday', isWorking: true, startTime: '09:00', endTime: '17:00', breaks: [{ startTime: '12:00', endTime: '13:00', type: 'lunch', description: 'Lunch Break' }] },
      { day: 'saturday', isWorking: false, startTime: '09:00', endTime: '17:00', breaks: [] },
      { day: 'sunday', isWorking: false, startTime: '09:00', endTime: '17:00', breaks: [] }
    ];

    const resetData = {
      workingDays: defaultWorkingDays,
      defaultStartTime: '09:00',
      defaultEndTime: '17:00',
      appointmentDuration: 30,
      autoSave: true,
      realTimeUpdates: true,
      settings: {
        allowSameDayBookings: true,
        maxAdvanceBookingDays: 30,
        bufferTimeBetweenAppointments: 5,
        emergencySlotDuration: 15
      }
    };

    const availability = await realTimeAvailabilityService.updateDoctorAvailability(
      req.user._id,
      resetData
    );

    res.json({
      success: true,
      message: 'Availability settings reset to default successfully',
      availability: {
        workingDays: availability.workingDays.filter(day => day.isWorking),
        defaultStartTime: availability.defaultStartTime,
        defaultEndTime: availability.defaultEndTime,
        appointmentDuration: availability.appointmentDuration,
        analytics: availability.analytics,
        settings: availability.settings
      }
    });
  } catch (error) {
    console.error('Error resetting doctor availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset availability settings'
    });
  }
});

export default router;
