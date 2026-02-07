import express from 'express';
import mongoose from 'mongoose';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import DoctorAvailability from '../models/DoctorAvailability.js';
import { auth } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get doctor's schedule overview (dashboard stats)
router.get('/overview', auth, async (req, res) => {
  try {
    const doctorId = req.user._id;
    const today = new Date();
    // Use UTC to avoid timezone issues
    const startOfDay = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
    const endOfDay = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() + 1));

    // Get today's appointments
    const todayAppointments = await Appointment.find({
      doctor: doctorId,
      scheduledDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['pending', 'confirmed', 'in-progress'] }
    }).populate('patient', 'firstName lastName email phone');

    // Get this week's appointments
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const weekAppointments = await Appointment.find({
      doctor: doctorId,
      scheduledDate: { $gte: startOfWeek, $lte: endOfWeek },
      status: { $in: ['pending', 'confirmed', 'in-progress'] }
    });

    // Get this month's appointments
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const monthAppointments = await Appointment.find({
      doctor: doctorId,
      scheduledDate: { $gte: startOfMonth, $lte: endOfMonth },
      status: { $in: ['pending', 'confirmed', 'in-progress'] }
    });

    // Calculate stats
    const stats = {
      today: {
        total: todayAppointments.length,
        confirmed: todayAppointments.filter(apt => apt.status === 'confirmed').length,
        pending: todayAppointments.filter(apt => apt.status === 'pending').length,
        inProgress: todayAppointments.filter(apt => apt.status === 'in-progress').length
      },
      week: {
        total: weekAppointments.length,
        confirmed: weekAppointments.filter(apt => apt.status === 'confirmed').length,
        pending: weekAppointments.filter(apt => apt.status === 'pending').length
      },
      month: {
        total: monthAppointments.length,
        confirmed: monthAppointments.filter(apt => apt.status === 'confirmed').length,
        pending: monthAppointments.filter(apt => apt.status === 'pending').length
      }
    };

    res.json({
      success: true,
      data: {
        stats,
        todayAppointments: todayAppointments.map(apt => ({
          id: apt._id,
          patientName: `${apt.patient.firstName} ${apt.patient.lastName}`,
          patientId: apt.patient._id,
          date: apt.scheduledDate,
          time: apt.startTime,
          endTime: apt.endTime,
          type: apt.appointmentType,
          status: apt.status,
          notes: apt.doctorNotes || '',
          consultationType: apt.consultationType
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching doctor schedule overview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch schedule overview',
      error: error.message
    });
  }
});

// Get appointments for a specific date
router.get('/appointments/:date', auth, async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { date } = req.params;
    
    // Parse the date parameter and ensure it's handled in UTC to avoid timezone issues
    const selectedDate = new Date(date + 'T00:00:00.000Z'); // Force UTC
    const startOfDay = new Date(selectedDate);
    const endOfDay = new Date(selectedDate);
    endOfDay.setUTCDate(endOfDay.getUTCDate() + 1); // Next day at 00:00:00 UTC

    // Debug logging for date filtering
    console.log('🔍 Doctor Schedule - Date filtering:', {
      requestedDate: date,
      selectedDate: selectedDate.toISOString(),
      startOfDay: startOfDay.toISOString(),
      endOfDay: endOfDay.toISOString(),
      doctorId: doctorId
    });

    const appointments = await Appointment.find({
      doctor: doctorId,
      scheduledDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['pending', 'confirmed', 'in-progress', 'completed'] }
    }).populate('patient', 'firstName lastName email phone');

    console.log('🔍 Doctor Schedule - Found appointments:', appointments.length);
    appointments.forEach(apt => {
      console.log('📅 Appointment:', {
        id: apt._id,
        scheduledDate: apt.scheduledDate.toISOString(),
        patientName: `${apt.patient.firstName} ${apt.patient.lastName}`,
        time: apt.startTime
      });
    });

    const formattedAppointments = appointments.map(apt => ({
      id: apt._id,
      patientName: `${apt.patient.firstName} ${apt.patient.lastName}`,
      patientId: apt.patient._id,
      patientEmail: apt.patient.email,
      patientPhone: apt.patient.phone,
      date: apt.scheduledDate,
      time: apt.startTime,
      endTime: apt.endTime,
      type: apt.appointmentType,
      status: apt.status,
      notes: apt.doctorNotes || '',
      consultationType: apt.consultationType,
      estimatedDuration: apt.estimatedDuration,
      cost: apt.cost
    }));

    res.json({
      success: true,
      data: formattedAppointments
    });

  } catch (error) {
    console.error('Error fetching appointments for date:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments',
      error: error.message
    });
  }
});

// Get available time slots for a specific date
router.get('/time-slots/:date', auth, async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { date } = req.params;
    
    // Parse the date parameter and ensure it's handled in UTC to avoid timezone issues
    const selectedDate = new Date(date + 'T00:00:00.000Z'); // Force UTC
    const startOfDay = new Date(selectedDate);
    const endOfDay = new Date(selectedDate);
    endOfDay.setUTCDate(endOfDay.getUTCDate() + 1); // Next day at 00:00:00 UTC

    // Get doctor's availability for this date
    const availability = await DoctorAvailability.findOne({
      doctorId: doctorId
    });

    if (!availability) {
      return res.json({
        success: true,
        data: []
      });
    }

    // Get the day of week for the selected date
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    // Find the working day schedule
    const daySchedule = availability.workingDays.find(day => day.day === dayName);
    if (!daySchedule || !daySchedule.isWorking) {
      return res.json({
        success: true,
        data: []
      });
    }

    // Get booked appointments for this date
    const bookedAppointments = await Appointment.find({
      doctor: doctorId,
      scheduledDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['pending', 'confirmed', 'in-progress'] }
    }).populate('patient', 'firstName lastName');

    console.log('🔍 Time Slots - Booked appointments found:', bookedAppointments.length);
    bookedAppointments.forEach(apt => {
      console.log('📅 Booked appointment:', {
        id: apt._id,
        scheduledDate: apt.scheduledDate.toISOString(),
        startTime: apt.startTime,
        endTime: apt.endTime,
        patientName: `${apt.patient.firstName} ${apt.patient.lastName}`,
        status: apt.status
      });
    });

    // Generate time slots based on availability
    const timeSlots = [];
    const startTime = new Date(`2000-01-01T${daySchedule.startTime}`);
    const endTime = new Date(`2000-01-01T${daySchedule.endTime}`);
    const slotDuration = availability.appointmentDuration || 30; // minutes

    let currentTime = new Date(startTime);
    while (currentTime < endTime) {
      const timeString = currentTime.toTimeString().slice(0, 5);
      const endTimeString = new Date(currentTime.getTime() + slotDuration * 60000).toTimeString().slice(0, 5);
      
      // Check if this slot conflicts with any breaks
      const conflictsWithBreak = daySchedule.breaks.some(break_ => {
        const breakStart = new Date(`2000-01-01T${break_.startTime}`);
        const breakEnd = new Date(`2000-01-01T${break_.endTime}`);
        return currentTime < breakEnd && new Date(currentTime.getTime() + slotDuration * 60000) > breakStart;
      });
      
      if (!conflictsWithBreak) {
        // Check if this slot is booked
        const isBooked = bookedAppointments.some(apt => 
          apt.startTime === timeString || apt.startTime === timeString + ':00'
        );

        const bookedAppointment = bookedAppointments.find(apt => 
          apt.startTime === timeString || apt.startTime === timeString + ':00'
        );

        // Debug logging for slot booking check
        if (timeString === '11:15') {
          console.log('🔍 Checking 11:15 slot:', {
            timeString,
            timeStringWithSeconds: timeString + ':00',
            isBooked,
            bookedAppointment: bookedAppointment ? {
              id: bookedAppointment._id,
              startTime: bookedAppointment.startTime,
              patientName: `${bookedAppointment.patient.firstName} ${bookedAppointment.patient.lastName}`
            } : null,
            allBookedTimes: bookedAppointments.map(apt => apt.startTime)
          });
        }

        timeSlots.push({
          time: timeString,
          endTime: endTimeString,
          available: !isBooked,
          bookedBy: bookedAppointment ? `${bookedAppointment.patient.firstName} ${bookedAppointment.patient.lastName}` : null,
          appointmentId: bookedAppointment ? bookedAppointment._id : null
        });
      }

      currentTime.setMinutes(currentTime.getMinutes() + slotDuration);
    }

    res.json({
      success: true,
      data: timeSlots
    });

  } catch (error) {
    console.error('Error fetching time slots:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch time slots',
      error: error.message
    });
  }
});

// Get all patients for the doctor
router.get('/patients', auth, async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { search } = req.query;

    // Get all patients who have appointments with this doctor
    const appointments = await Appointment.find({
      doctor: doctorId
    }).populate('patient', 'firstName lastName email phone dateOfBirth gender');

    // Extract unique patients
    const patientMap = new Map();
    appointments.forEach(apt => {
      if (!patientMap.has(apt.patient._id.toString())) {
        patientMap.set(apt.patient._id.toString(), apt.patient);
      }
    });

    let patients = Array.from(patientMap.values());

    // Apply search filter if provided
    if (search) {
      patients = patients.filter(patient => 
        patient.firstName.toLowerCase().includes(search.toLowerCase()) ||
        patient.lastName.toLowerCase().includes(search.toLowerCase()) ||
        patient.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Get last visit date for each patient
    const patientsWithLastVisit = await Promise.all(
      patients.map(async (patient) => {
        const lastAppointment = await Appointment.findOne({
          doctor: doctorId,
          patient: patient._id
        }).sort({ scheduledDate: -1 });

        return {
          id: patient._id,
          name: `${patient.firstName} ${patient.lastName}`,
          email: patient.email,
          phone: patient.phone,
          age: patient.dateOfBirth ? 
            Math.floor((new Date() - new Date(patient.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)) : 
            null,
          gender: patient.gender,
          lastVisit: lastAppointment ? lastAppointment.scheduledDate : null
        };
      })
    );

    res.json({
      success: true,
      data: patientsWithLastVisit
    });

  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patients',
      error: error.message
    });
  }
});

// Schedule a new appointment
router.post('/schedule', auth, [
  body('patientId').isMongoId().withMessage('Valid patient ID is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('startTime').isString().withMessage('Start time is required'),
  body('appointmentType').isString().withMessage('Appointment type is required'),
  body('consultationType').isIn(['online', 'in-person']).withMessage('Valid consultation type is required'),
  body('notes').optional().isString(),
  body('estimatedDuration').optional().isInt({ min: 15, max: 120 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const doctorId = req.user._id;
    const {
      patientId,
      date,
      startTime,
      appointmentType,
      consultationType,
      notes,
      estimatedDuration
    } = req.body;

    // Get doctor's availability to use their actual appointment duration
    const availability = await DoctorAvailability.findOne({ doctorId });
    const doctorAppointmentDuration = availability?.appointmentDuration || 30;
    
    // Use the provided estimatedDuration or fall back to doctor's setting
    const finalDuration = estimatedDuration || doctorAppointmentDuration;
    
    console.log('🔍 Doctor Schedule - Duration calculation:', {
      doctorId: doctorId,
      requestedDuration: estimatedDuration,
      doctorSetting: doctorAppointmentDuration,
      finalDuration: finalDuration
    });

    const scheduledDate = new Date(date);
    const startTimeParts = startTime.split(':');
    const startHour = parseInt(startTimeParts[0]);
    const startMinute = parseInt(startTimeParts[1]);
    
    const endTimeDate = new Date(scheduledDate);
    endTimeDate.setHours(startHour, startMinute + finalDuration, 0, 0);
    const endTime = endTimeDate.toTimeString().slice(0, 5);

    // Check if slot is available
    const existingAppointment = await Appointment.checkSlotAvailability(
      doctorId,
      doctorId, // hospital ID same as doctor ID for now
      scheduledDate,
      startTime,
      endTime
    );

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }

    // Create the appointment
    const appointment = new Appointment({
      patient: patientId,
      doctor: doctorId,
      hospital: doctorId, // hospital ID same as doctor ID for now
      appointmentType,
      department: 'General Medicine', // default department
      scheduledDate,
      scheduledTime: startTime,
      startTime,
      endTime,
      estimatedDuration: finalDuration,
      consultationType,
      doctorNotes: notes,
      createdBy: doctorId
    });

    await appointment.save();

    // Populate patient details for response
    await appointment.populate('patient', 'firstName lastName email phone');

    res.json({
      success: true,
      message: 'Appointment scheduled successfully',
      data: {
        id: appointment._id,
        patientName: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
        patientId: appointment.patient._id,
        date: appointment.scheduledDate,
        time: appointment.startTime,
        endTime: appointment.endTime,
        type: appointment.appointmentType,
        status: appointment.status,
        notes: appointment.doctorNotes,
        consultationType: appointment.consultationType
      }
    });

  } catch (error) {
    console.error('Error scheduling appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule appointment',
      error: error.message
    });
  }
});

// Update appointment status
router.patch('/appointments/:appointmentId/status', auth, [
  body('status').isIn(['pending', 'confirmed', 'in-progress', 'completed', 'cancelled']).withMessage('Valid status is required'),
  body('notes').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const doctorId = req.user._id;
    const { appointmentId } = req.params;
    const { status, notes } = req.body;

    const appointment = await Appointment.findOneAndUpdate(
      {
        _id: appointmentId,
        doctor: doctorId
      },
      {
        status,
        doctorNotes: notes,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('patient', 'firstName lastName email phone');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      message: 'Appointment status updated successfully',
      data: {
        id: appointment._id,
        patientName: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
        patientId: appointment.patient._id,
        date: appointment.scheduledDate,
        time: appointment.startTime,
        endTime: appointment.endTime,
        type: appointment.appointmentType,
        status: appointment.status,
        notes: appointment.doctorNotes,
        consultationType: appointment.consultationType
      }
    });

  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment status',
      error: error.message
    });
  }
});

// Cancel appointment
router.delete('/appointments/:appointmentId', auth, async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { appointmentId } = req.params;

    const appointment = await Appointment.findOneAndUpdate(
      {
        _id: appointmentId,
        doctor: doctorId,
        status: { $in: ['pending', 'confirmed'] }
      },
      {
        status: 'cancelled',
        updatedAt: new Date()
      },
      { new: true }
    ).populate('patient', 'firstName lastName email phone');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found or cannot be cancelled'
      });
    }

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: {
        id: appointment._id,
        patientName: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
        status: appointment.status
      }
    });

  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel appointment',
      error: error.message
    });
  }
});

// Get calendar data for a month
router.get('/calendar/:year/:month', auth, async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { year, month } = req.params;
    
    const startOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endOfMonth = new Date(parseInt(year), parseInt(month), 0);

    const appointments = await Appointment.find({
      doctor: doctorId,
      scheduledDate: { $gte: startOfMonth, $lte: endOfMonth },
      status: { $in: ['pending', 'confirmed', 'in-progress'] }
    });

    // Group appointments by date
    const calendarData = {};
    appointments.forEach(apt => {
      const dateKey = apt.scheduledDate.toISOString().split('T')[0];
      if (!calendarData[dateKey]) {
        calendarData[dateKey] = [];
      }
      calendarData[dateKey].push({
        id: apt._id,
        time: apt.startTime,
        type: apt.appointmentType,
        status: apt.status
      });
    });

    res.json({
      success: true,
      data: calendarData
    });

  } catch (error) {
    console.error('Error fetching calendar data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch calendar data',
      error: error.message
    });
  }
});

export default router;


