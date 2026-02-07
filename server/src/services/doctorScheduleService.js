import Appointment from '../models/Appointment.js';
import DoctorAvailability from '../models/DoctorAvailability.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

class DoctorScheduleService {
  /**
   * Get available time slots for a specific date
   * @param {string} doctorId - Doctor's ID
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Array} Array of available time slots
   */
  async getAvailableSlots(doctorId, date) {
    try {
      // Get doctor's availability for the specific day
      const availability = await DoctorAvailability.findOne({ doctorId });
      if (!availability) {
        throw new Error('Doctor availability not found');
      }

      // Get the day of week
      const targetDate = new Date(date);
      const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      
      // Find the working day schedule
      const daySchedule = availability.workingDays.find(day => day.day === dayName);
      if (!daySchedule || !daySchedule.isWorking) {
        return [];
      }

      // Get existing appointments for the date
      const existingAppointments = await Appointment.find({
        doctor: doctorId,
        scheduledDate: {
          $gte: new Date(date + 'T00:00:00.000Z'),
          $lt: new Date(date + 'T23:59:59.999Z')
        },
        status: { $nin: ['cancelled', 'no-show'] }
      });

      // Get booked time slots for the date using Appointment model
      const bookedSlots = await Appointment.findByDoctorAndDate(doctorId, new Date(date));

      // Generate time slots
      const slots = [];
      const startTime = new Date(`2000-01-01T${daySchedule.startTime}`);
      const endTime = new Date(`2000-01-01T${daySchedule.endTime}`);
      
      let currentTime = new Date(startTime);
      
      while (currentTime < endTime) {
        const slotStart = new Date(currentTime);
        const slotEnd = new Date(currentTime.getTime() + availability.appointmentDuration * 60000);
        
        // Check if slot conflicts with any breaks
        const conflictsWithBreak = daySchedule.breaks.some(break_ => {
          const breakStart = new Date(`2000-01-01T${break_.startTime}`);
          const breakEnd = new Date(`2000-01-01T${break_.endTime}`);
          return slotStart < breakEnd && slotEnd > breakStart;
        });
        
        if (!conflictsWithBreak) {
          const slotTime = slotStart.toLocaleTimeString('en-US', { 
            hour12: true, 
            hour: '2-digit', 
            minute: '2-digit' 
          });
          
          // Check if slot is already booked (either by appointment or by booked time slot)
          const slotStartTime = slotStart.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
          const slotEndTime = slotEnd.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
          
          const isBookedByAppointment = existingAppointments.some(appointment => {
            const appointmentTime = new Date(`2000-01-01T${appointment.scheduledTime}`);
            return Math.abs(appointmentTime - slotStart) < 60000; // Within 1 minute
          });
          
          const isBookedBySlot = bookedSlots.some(bookedSlot => {
            return bookedSlot.startTime === slotStartTime && bookedSlot.endTime === slotEndTime;
          });
          
          const isBooked = isBookedByAppointment || isBookedBySlot;
          
          slots.push({
            time: slotTime,
            available: !isBooked,
            bookedBy: isBooked ? 'Booked' : null,
            startTime: slotStart.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
            endTime: slotEnd.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
            duration: availability.appointmentDuration
          });
        }
        
        currentTime = new Date(currentTime.getTime() + availability.appointmentDuration * 60000);
      }
      
      return slots;
    } catch (error) {
      console.error('Error getting available slots:', error);
      throw error;
    }
  }

  /**
   * Get doctor's schedule for a date range
   * @param {string} doctorId - Doctor's ID
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   * @returns {Array} Array of appointments
   */
  async getDoctorSchedule(doctorId, startDate, endDate) {
    try {
      const appointments = await Appointment.find({
        doctor: doctorId,
        scheduledDate: {
          $gte: new Date(startDate + 'T00:00:00.000Z'),
          $lte: new Date(endDate + 'T23:59:59.999Z')
        }
      })
      .populate('patient', 'firstName lastName email phone')
      .populate('doctor', 'firstName lastName specialization')
      .sort({ scheduledDate: 1, scheduledTime: 1 });

      return appointments;
    } catch (error) {
      console.error('Error getting doctor schedule:', error);
      throw error;
    }
  }

  /**
   * Get today's appointments for a doctor
   * @param {string} doctorId - Doctor's ID
   * @returns {Array} Array of today's appointments
   */
  async getTodayAppointments(doctorId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const appointments = await Appointment.find({
        doctor: doctorId,
        scheduledDate: {
          $gte: new Date(today + 'T00:00:00.000Z'),
          $lt: new Date(today + 'T23:59:59.999Z')
        },
        status: { $nin: ['cancelled', 'no-show'] }
      })
      .populate('patient', 'firstName lastName email phone')
      .sort({ scheduledTime: 1 });

      return appointments;
    } catch (error) {
      console.error('Error getting today appointments:', error);
      throw error;
    }
  }

  /**
   * Create a new appointment
   * @param {Object} appointmentData - Appointment data
   * @returns {Object} Created appointment
   */
  async createAppointment(appointmentData) {
    try {
      // Validate that the slot is available
      const availableSlots = await this.getAvailableSlots(
        appointmentData.doctor, 
        appointmentData.scheduledDate
      );
      
      const requestedSlot = availableSlots.find(slot => 
        slot.time === appointmentData.scheduledTime
      );
      
      if (!requestedSlot || !requestedSlot.available) {
        throw new Error('Requested time slot is not available');
      }

      // Create the appointment
      const appointment = new Appointment({
        ...appointmentData,
        status: 'scheduled',
        createdBy: appointmentData.doctor
      });

      await appointment.save();
      
      // Populate the created appointment
      const populatedAppointment = await Appointment.findById(appointment._id)
        .populate('patient', 'firstName lastName email phone')
        .populate('doctor', 'firstName lastName specialization');

      return populatedAppointment;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }

  /**
   * Update appointment status
   * @param {string} appointmentId - Appointment ID
   * @param {string} status - New status
   * @param {string} updatedBy - User ID who updated the status
   * @returns {Object} Updated appointment
   */
  async updateAppointmentStatus(appointmentId, status, updatedBy) {
    try {
      const appointment = await Appointment.findByIdAndUpdate(
        appointmentId,
        { 
          status,
          updatedBy,
          $push: {
            statusHistory: {
              status,
              timestamp: new Date(),
              updatedBy
            }
          }
        },
        { new: true }
      ).populate('patient', 'firstName lastName email phone')
       .populate('doctor', 'firstName lastName specialization');

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      return appointment;
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  }

  /**
   * Get patients for a doctor
   * @param {string} doctorId - Doctor's ID
   * @param {string} searchTerm - Search term for patient name or email
   * @returns {Array} Array of patients
   */
  async getPatients(doctorId, searchTerm = '') {
    try {
      // Get patients who have had appointments with this doctor
      const appointments = await Appointment.find({ doctor: doctorId })
        .distinct('patient');

      let query = { _id: { $in: appointments } };
      
      if (searchTerm) {
        query.$or = [
          { firstName: { $regex: searchTerm, $options: 'i' } },
          { lastName: { $regex: searchTerm, $options: 'i' } },
          { email: { $regex: searchTerm, $options: 'i' } }
        ];
      }

      const patients = await User.find(query)
        .select('firstName lastName email phone dateOfBirth gender profileImage')
        .limit(50);

      return patients;
    } catch (error) {
      console.error('Error getting patients:', error);
      throw error;
    }
  }

  /**
   * Get appointment statistics for a doctor
   * @param {string} doctorId - Doctor's ID
   * @returns {Object} Statistics object
   */
  async getAppointmentStats(doctorId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const [
        totalPatients,
        confirmedAppointments,
        scheduledAppointments,
        availableSlots
      ] = await Promise.all([
        Appointment.distinct('patient', { doctor: doctorId }),
        Appointment.countDocuments({ 
          doctor: doctorId, 
          status: 'confirmed',
          scheduledDate: { $gte: new Date(today + 'T00:00:00.000Z') }
        }),
        Appointment.countDocuments({ 
          doctor: doctorId, 
          status: 'scheduled',
          scheduledDate: { $gte: new Date(today + 'T00:00:00.000Z') }
        }),
        this.getAvailableSlots(doctorId, today)
      ]);

      return {
        totalPatients: totalPatients.length,
        confirmedAppointments,
        scheduledAppointments,
        availableSlots: availableSlots.filter(slot => slot.available).length
      };
    } catch (error) {
      console.error('Error getting appointment stats:', error);
      throw error;
    }
  }

  /**
   * Check if a time slot is available
   * @param {string} doctorId - Doctor's ID
   * @param {string} date - Date in YYYY-MM-DD format
   * @param {string} time - Time in HH:MM format
   * @returns {boolean} True if available, false otherwise
   */
  async isSlotAvailable(doctorId, date, time) {
    try {
      const availableSlots = await this.getAvailableSlots(doctorId, date);
      const requestedSlot = availableSlots.find(slot => slot.time === time);
      return requestedSlot ? requestedSlot.available : false;
    } catch (error) {
      console.error('Error checking slot availability:', error);
      return false;
    }
  }

  /**
   * Get calendar data for a month
   * @param {string} doctorId - Doctor's ID
   * @param {number} year - Year
   * @param {number} month - Month (1-12)
   * @returns {Object} Calendar data with dates and appointment counts
   */
  async getCalendarData(doctorId, year, month) {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      const appointments = await Appointment.find({
        doctor: doctorId,
        scheduledDate: {
          $gte: startDate,
          $lte: endDate
        },
        status: { $nin: ['cancelled', 'no-show'] }
      });

      // Group appointments by date
      const appointmentsByDate = {};
      appointments.forEach(appointment => {
        const dateKey = appointment.scheduledDate.toISOString().split('T')[0];
        if (!appointmentsByDate[dateKey]) {
          appointmentsByDate[dateKey] = 0;
        }
        appointmentsByDate[dateKey]++;
      });

      return appointmentsByDate;
    } catch (error) {
      console.error('Error getting calendar data:', error);
      throw error;
    }
  }
}

export default new DoctorScheduleService();
