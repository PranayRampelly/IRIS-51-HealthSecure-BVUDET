import DoctorAvailability from '../models/DoctorAvailability.js';
import Appointment from '../models/Appointment.js';

class TimeSlotService {
  /**
   * Check if a specific time slot is available for booking
   * @param {string} doctorId - Doctor's ID
   * @param {string} hospitalId - Hospital's ID
   * @param {Date} date - Date of the appointment
   * @param {string} startTime - Start time in HH:mm format
   * @param {number} duration - Duration in minutes
   * @returns {Object} Availability status and details
   */
  async checkSlotAvailability(doctorId, hospitalId, date, startTime, duration = 30) {
    try {
      // Calculate end time
      const startTimeParts = startTime.split(':');
      const startHour = parseInt(startTimeParts[0]);
      const startMinute = parseInt(startTimeParts[1]);
      
      const endTimeDate = new Date(date);
      endTimeDate.setHours(startHour, startMinute + duration, 0, 0);
      const endTime = endTimeDate.toTimeString().slice(0, 5);
      
      // Check if slot conflicts with existing appointments
      const existingAppointment = await Appointment.findOne({
        doctor: doctorId,
        scheduledDate: {
          $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
          $lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
        },
        scheduledTime: startTime,
        status: { $nin: ['cancelled', 'no-show'] }
      });
      
      if (existingAppointment) {
        return {
          available: false,
          reason: 'Slot already booked by another patient',
          appointmentId: existingAppointment._id,
          patientId: existingAppointment.patient
        };
      }
      
      // Check if slot conflicts with booked time slots using Appointment model
      const existingBookedSlot = await Appointment.checkSlotAvailability(
        doctorId,
        hospitalId,
        date,
        startTime,
        endTime
      );
      
      if (existingBookedSlot) {
        return {
          available: false,
          reason: 'Slot already reserved',
          slotId: existingBookedSlot._id,
          appointmentId: existingBookedSlot._id
        };
      }
      
      // Check if slot is within doctor's working hours
      const availability = await DoctorAvailability.findOne({ doctorId });
      if (availability) {
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        const daySchedule = availability.workingDays.find(day => day.day === dayName);
        
        if (!daySchedule || !daySchedule.isWorking) {
          return {
            available: false,
            reason: 'Doctor not working on this day'
          };
        }
        
        // Check if time is within working hours
        if (startTime < daySchedule.startTime || startTime >= daySchedule.endTime) {
          return {
            available: false,
            reason: 'Time outside working hours'
          };
        }
        
        // Check if slot conflicts with breaks
        const slotStart = new Date(`2000-01-01T${startTime}`);
        const slotEnd = new Date(`2000-01-01T${endTime}`);
        
        const conflictsWithBreak = daySchedule.breaks.some(break_ => {
          const breakStart = new Date(`2000-01-01T${break_.startTime}`);
          const breakEnd = new Date(`2000-01-01T${break_.endTime}`);
          return slotStart < breakEnd && slotEnd > breakStart;
        });
        
        if (conflictsWithBreak) {
          return {
            available: false,
            reason: 'Slot conflicts with doctor\'s break time'
          };
        }
      }
      
      return {
        available: true,
        startTime,
        endTime,
        duration
      };
    } catch (error) {
      console.error('Error checking slot availability:', error);
      throw error;
    }
  }
  
  /**
   * Get all available time slots for a doctor on a specific date
   * @param {string} doctorId - Doctor's ID
   * @param {Date} date - Date to get slots for
   * @returns {Array} Array of available time slots
   */
  async getAvailableSlots(doctorId, date) {
    try {
      const availability = await DoctorAvailability.findOne({ doctorId });
      if (!availability) {
        throw new Error('Doctor availability not found');
      }
      
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const daySchedule = availability.workingDays.find(day => day.day === dayName);
      
      if (!daySchedule || !daySchedule.isWorking) {
        return [];
      }
      
      // Get existing appointments and booked slots
      const existingAppointments = await Appointment.find({
        doctor: doctorId,
        scheduledDate: {
          $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
          $lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
        },
        status: { $nin: ['cancelled', 'no-show'] }
      });
      
      const bookedSlots = await Appointment.findByDoctorAndDate(doctorId, date);
      
      // Generate all possible slots
      const slots = [];
      const startTime = new Date(`2000-01-01T${daySchedule.startTime}`);
      const endTime = new Date(`2000-01-01T${daySchedule.endTime}`);
      
      let currentTime = new Date(startTime);
      
      while (currentTime < endTime) {
        const slotStart = new Date(currentTime);
        const slotEnd = new Date(currentTime.getTime() + availability.appointmentDuration * 60000);
        
        const slotStartTime = slotStart.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
        const slotEndTime = slotEnd.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
        
        // Check if slot conflicts with breaks
        const conflictsWithBreak = daySchedule.breaks.some(break_ => {
          const breakStart = new Date(`2000-01-01T${break_.startTime}`);
          const breakEnd = new Date(`2000-01-01T${break_.endTime}`);
          return slotStart < breakEnd && slotEnd > breakStart;
        });
        
        if (!conflictsWithBreak) {
          // Check if slot is already booked
          const isBookedByAppointment = existingAppointments.some(appointment => {
            const appointmentTime = new Date(`2000-01-01T${appointment.scheduledTime}`);
            return Math.abs(appointmentTime - slotStart) < 60000; // Within 1 minute
          });
          
          const isBookedBySlot = bookedSlots.some(bookedSlot => {
            return bookedSlot.startTime === slotStartTime && bookedSlot.endTime === slotEndTime;
          });
          
          const isAvailable = !isBookedByAppointment && !isBookedBySlot;
          
          slots.push({
            startTime: slotStartTime,
            endTime: slotEndTime,
            duration: availability.appointmentDuration,
            available: isAvailable,
            displayTime: slotStart.toLocaleTimeString('en-US', { 
              hour12: true, 
              hour: '2-digit', 
              minute: '2-digit' 
            })
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
   * Reserve a time slot (mark as booked)
   * @param {Object} slotData - Slot data
   * @returns {Object} Created Appointment
   */
  async reserveSlot(slotData) {
    try {
      const appointment = new Appointment(slotData);
      await appointment.save();
      return appointment;
    } catch (error) {
      console.error('Error reserving time slot:', error);
      throw error;
    }
  }
  
  /**
   * Release a reserved time slot
   * @param {string} appointmentId - Appointment ID
   * @returns {boolean} Success status
   */
  async releaseSlot(appointmentId) {
    try {
      const result = await Appointment.findByIdAndUpdate(appointmentId, {
        status: 'cancelled'
      });
      return !!result;
    } catch (error) {
      console.error('Error releasing time slot:', error);
      throw error;
    }
  }
}

export default new TimeSlotService();


