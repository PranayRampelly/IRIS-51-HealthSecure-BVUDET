import mongoose from 'mongoose';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';

class SlotGenerationService {
  
  /**
   * Generate available slots for a doctor on a specific date
   */
  async generateAvailableSlots(doctorId, date, consultationType = 'both') {
    try {
      const doctor = await User.findById(doctorId);
      if (!doctor || doctor.role !== 'doctor') {
        throw new Error('Doctor not found');
      }

      // Get doctor's working hours and preferences
      const workingHours = this.getDoctorWorkingHours(doctor);
      const slotDuration = this.getSlotDuration(doctor);
      
      // Generate all possible slots for the day
      const allSlots = this.generateAllSlots(date, workingHours, slotDuration);
      
      // Get existing bookings for this date
      const existingBookings = await this.getExistingBookings(doctorId, date);
      
      // Filter out booked slots and generate available slots
      const availableSlots = this.filterAvailableSlots(allSlots, existingBookings, consultationType);
      
      return availableSlots;
      
    } catch (error) {
      console.error('Error generating available slots:', error);
      throw error;
    }
  }

  /**
   * Get doctor's working hours (with fallbacks)
   */
  getDoctorWorkingHours(doctor) {
    // Check if doctor has custom working hours
    if (doctor.workingHours && doctor.workingHours.length > 0) {
      return doctor.workingHours;
    }
    
    // Default working hours for doctors
    return [
      {
        day: 'monday',
        startTime: '09:00',
        endTime: '17:00',
        isWorking: true
      },
      {
        day: 'tuesday',
        startTime: '09:00',
        endTime: '17:00',
        isWorking: true
      },
      {
        day: 'wednesday',
        startTime: '09:00',
        endTime: '17:00',
        isWorking: true
      },
      {
        day: 'thursday',
        startTime: '09:00',
        endTime: '17:00',
        isWorking: true
      },
      {
        day: 'friday',
        startTime: '09:00',
        endTime: '17:00',
        isWorking: true
      },
      {
        day: 'saturday',
        startTime: '09:00',
        endTime: '13:00',
        isWorking: true
      },
      {
        day: 'sunday',
        startTime: '00:00',
        endTime: '00:00',
        isWorking: false
      }
    ];
  }

  /**
   * Get slot duration (with fallbacks)
   */
  getSlotDuration(doctor) {
    // Check if doctor has custom slot duration
    if (doctor.slotDuration) {
      return doctor.slotDuration;
    }
    
    // Default slot duration: 30 minutes
    return 30;
  }

  /**
   * Generate all possible slots for a specific date
   */
  generateAllSlots(date, workingHours, slotDuration) {
    const slots = [];
    const targetDate = new Date(date);
    const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    // Find working hours for this day
    const daySchedule = workingHours.find(h => h.day === dayName);
    
    if (!daySchedule || !daySchedule.isWorking) {
      return []; // No slots for non-working days
    }

    // Parse start and end times
    const [startHour, startMinute] = daySchedule.startTime.split(':').map(Number);
    const [endHour, endMinute] = daySchedule.endTime.split(':').map(Number);
    
    // Create date objects for start and end times
    const startTime = new Date(targetDate);
    startTime.setHours(startHour, startMinute, 0, 0);
    
    const endTime = new Date(targetDate);
    endTime.setHours(endHour, endMinute, 0, 0);
    
    // Generate slots
    let currentSlot = new Date(startTime);
    
    while (currentSlot < endTime) {
      const slotEnd = new Date(currentSlot.getTime() + slotDuration * 60 * 1000);
      
      if (slotEnd <= endTime) {
        slots.push({
          startTime: new Date(currentSlot),
          endTime: slotEnd,
          duration: slotDuration
        });
      }
      
      // Move to next slot
      currentSlot = slotEnd;
    }
    
    return slots;
  }

  /**
   * Get existing bookings for a doctor on a specific date
   */
  async getExistingBookings(doctorId, date) {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      const bookings = await Appointment.find({
        doctorId,
        appointmentDate: {
          $gte: startOfDay,
          $lte: endOfDay
        },
        status: { $in: ['scheduled', 'confirmed'] }
      }).select('startTime endTime consultationType');
      
      return bookings;
      
    } catch (error) {
      console.error('Error fetching existing bookings:', error);
      return [];
    }
  }

  /**
   * Filter available slots based on existing bookings
   */
  filterAvailableSlots(allSlots, existingBookings, consultationType) {
    const availableSlots = [];
    
    for (const slot of allSlots) {
      // Check if slot conflicts with existing bookings
      const isConflict = existingBookings.some(booking => {
        return this.slotsOverlap(slot, booking);
      });
      
      if (!isConflict) {
        // Create slot object
        const slotObj = {
          _id: `slot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          startTime: slot.startTime.toISOString(),
          endTime: slot.endTime.toISOString(),
          duration: slot.duration,
          isAvailable: true,
          isBooked: false,
          consultationType: consultationType === 'both' ? 
            (Math.random() > 0.5 ? 'online' : 'in-person') : 
            consultationType
        };
        
        availableSlots.push(slotObj);
      }
    }
    
    return availableSlots;
  }

  /**
   * Check if two slots overlap
   */
  slotsOverlap(slot1, slot2) {
    const start1 = new Date(slot1.startTime);
    const end1 = new Date(slot1.endTime);
    const start2 = new Date(slot2.startTime);
    const end2 = new Date(slot2.endTime);
    
    return start1 < end2 && start2 < end1;
  }

  /**
   * Generate slots for multiple days (for calendar view)
   */
  async generateWeeklySlots(doctorId, startDate, days = 7) {
    const weeklySlots = {};
    
    for (let i = 0; i < days; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);
      
      const dateKey = currentDate.toISOString().split('T')[0];
      const slots = await this.generateAvailableSlots(doctorId, currentDate);
      
      weeklySlots[dateKey] = {
        date: currentDate.toISOString(),
        slots: slots,
        totalSlots: slots.length,
        availableSlots: slots.filter(s => s.isAvailable).length
      };
    }
    
    return weeklySlots;
  }

  /**
   * Check slot availability in real-time
   */
  async checkSlotAvailability(doctorId, slotId, startTime, endTime) {
    try {
      // Check if slot is already booked
      const existingBooking = await Appointment.findOne({
        doctorId,
        startTime: { $lte: new Date(endTime) },
        endTime: { $gte: new Date(startTime) },
        status: { $in: ['scheduled', 'confirmed'] }
      });
      
      return !existingBooking;
      
    } catch (error) {
      console.error('Error checking slot availability:', error);
      return false;
    }
  }

  /**
   * Reserve a slot temporarily (for booking process)
   */
  async reserveSlot(doctorId, slotId, startTime, endTime, patientId) {
    try {
      // Check availability first
      const isAvailable = await this.checkSlotAvailability(doctorId, slotId, startTime, endTime);
      
      if (!isAvailable) {
        throw new Error('Slot is no longer available');
      }
      
      // Create temporary reservation (expires in 15 minutes)
      const reservation = new Appointment({
        doctorId,
        patientId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: 'reserved',
        reservationExpiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
      });
      
      await reservation.save();
      return reservation;
      
    } catch (error) {
      console.error('Error reserving slot:', error);
      throw error;
    }
  }
}

export default new SlotGenerationService();
