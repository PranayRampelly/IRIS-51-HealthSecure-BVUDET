import DoctorAvailability from '../models/DoctorAvailability.js';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';

class RealTimeAvailabilityService {
  constructor() {
    this.slotLocks = new Map(); // Store temporary slot locks
    this.doctorStatus = new Map(); // Store real-time doctor status
    this.setupCleanupInterval();
  }

  // Initialize doctor availability
  async initializeDoctorAvailability(doctorId) {
    try {
      let availability = await DoctorAvailability.findOne({ doctorId });
      
      if (!availability) {
        // Create default availability
        const defaultWorkingDays = [
          { day: 'monday', isWorking: true, startTime: '09:00', endTime: '17:00', breaks: [{ startTime: '12:00', endTime: '13:00', type: 'lunch', description: 'Lunch Break' }] },
          { day: 'tuesday', isWorking: true, startTime: '09:00', endTime: '17:00', breaks: [{ startTime: '12:00', endTime: '13:00', type: 'lunch', description: 'Lunch Break' }] },
          { day: 'wednesday', isWorking: true, startTime: '09:00', endTime: '17:00', breaks: [{ startTime: '12:00', endTime: '13:00', type: 'lunch', description: 'Lunch Break' }] },
          { day: 'thursday', isWorking: true, startTime: '09:00', endTime: '17:00', breaks: [{ startTime: '12:00', endTime: '13:00', type: 'lunch', description: 'Lunch Break' }] },
          { day: 'friday', isWorking: true, startTime: '09:00', endTime: '17:00', breaks: [{ startTime: '12:00', endTime: '13:00', type: 'lunch', description: 'Lunch Break' }] },
          { day: 'saturday', isWorking: false, startTime: '09:00', endTime: '17:00', breaks: [] },
          { day: 'sunday', isWorking: false, startTime: '09:00', endTime: '17:00', breaks: [] }
        ];

        availability = new DoctorAvailability({
          doctorId,
          workingDays: defaultWorkingDays,
          defaultStartTime: '09:00',
          defaultEndTime: '17:00',
          appointmentDuration: 30,
          isOnline: false,
          status: 'unavailable'
        });

        await availability.save();
      }

      // Update current status
      availability.updateCurrentStatus();
      await availability.save();

      // Store in memory for real-time access
      this.doctorStatus.set(doctorId.toString(), {
        isOnline: availability.isOnline,
        status: availability.status,
        currentStatus: availability.currentStatus,
        lastUpdated: new Date()
      });

      return availability;
    } catch (error) {
      console.error('Error initializing doctor availability:', error);
      throw error;
    }
  }

  // Get doctor availability
  async getDoctorAvailability(doctorId) {
    try {
      console.log('🔍 Getting doctor availability for:', doctorId);
      
      let availability = await DoctorAvailability.findOne({ doctorId });
      console.log('📥 Found availability:', availability ? 'Yes' : 'No');
      
      if (!availability) {
        console.log('🔄 Initializing new availability...');
        availability = await this.initializeDoctorAvailability(doctorId);
        console.log('✅ New availability initialized');
      }

      // Check if availability object is valid
      if (!availability || !availability.workingDays) {
        console.error('❌ Invalid availability object:', availability);
        throw new Error('Invalid availability data');
      }

      // Update current status
      try {
        console.log('🔄 Updating current status...');
        availability.updateCurrentStatus();
        await availability.save();
        console.log('✅ Current status updated');
      } catch (statusError) {
        console.error('⚠️ Error updating current status:', statusError);
        // Continue even if status update fails
      }

      console.log('📤 Returning availability object:', {
        hasWorkingDays: !!availability.workingDays,
        workingDaysCount: availability.workingDays?.length || 0,
        workingDaysDetails: availability.workingDays?.map(day => ({ day: day.day, isWorking: day.isWorking })),
        workingDaysFiltered: availability.workingDays?.filter(day => day.isWorking)?.map(day => day.day) || [],
        startTime: availability.defaultStartTime,
        endTime: availability.defaultEndTime,
        appointmentDuration: availability.appointmentDuration
      });

      return availability;
    } catch (error) {
      console.error('❌ Error getting doctor availability:', error);
      throw error;
    }
  }

  // Get complete doctor data (availability + user profile)
  async getCompleteDoctorData(doctorId) {
    try {
      const [availability, user] = await Promise.all([
        DoctorAvailability.findOne({ doctorId }),
        User.findById(doctorId)
      ]);

      if (!availability) {
        await this.initializeDoctorAvailability(doctorId);
      }

      return {
        availability: availability || {},
        user: user || {},
        consultationFees: user?.consultationFees || {},
        languages: user?.languages || [],
        specialties: user?.specialties || []
      };
    } catch (error) {
      console.error('Error getting complete doctor data:', error);
      throw error;
    }
  }

  // Update doctor availability
  async updateDoctorAvailability(doctorId, availabilityData) {
    try {
      console.log('📥 Received availability data:', {
        workingDays: availabilityData.workingDays,
        workingDaysType: typeof availabilityData.workingDays,
        isArray: Array.isArray(availabilityData.workingDays),
        workingDaysLength: availabilityData.workingDays?.length
      });
      
      // Handle working days conversion if it's an array of day names
      let processedData = { ...availabilityData };
      
      if (availabilityData.workingDays && Array.isArray(availabilityData.workingDays)) {
        // Check if it's an array of day names (from frontend) or objects (from backend)
        if (typeof availabilityData.workingDays[0] === 'string') {
          console.log('🔄 Converting day names to working days objects:', availabilityData.workingDays);
          
          // Convert array of day names to working days objects
          const allDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
          processedData.workingDays = allDays.map(day => ({
            day,
            isWorking: availabilityData.workingDays.includes(day),
            startTime: availabilityData.defaultStartTime || '09:00',
            endTime: availabilityData.defaultEndTime || '17:00',
            breaks: availabilityData.workingDays.includes(day) 
              ? [{ startTime: availabilityData.lunchBreakStart || '12:00', endTime: availabilityData.lunchBreakEnd || '13:00', type: 'lunch', description: 'Lunch Break' }]
              : []
          }));
          
          console.log('🔍 Working days conversion:', {
            input: availabilityData.workingDays,
            output: processedData.workingDays.map(d => ({ day: d.day, isWorking: d.isWorking }))
          });
          
          console.log('✅ Converted working days:', processedData.workingDays);
        } else if (typeof availabilityData.workingDays[0] === 'object' && availabilityData.workingDays[0].hasOwnProperty('isWorking')) {
          console.log('🔄 Working days already in correct format with isWorking flags:', 
            availabilityData.workingDays.map(d => ({ day: d.day, isWorking: d.isWorking }))
          );
          
          // Validate that all 7 days are present
          const allDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
          const receivedDays = availabilityData.workingDays.map(d => d.day);
          
          // Add missing days with isWorking: false
          allDays.forEach(day => {
            if (!receivedDays.includes(day)) {
              availabilityData.workingDays.push({
                day,
                isWorking: false,
                startTime: availabilityData.defaultStartTime || '09:00',
                endTime: availabilityData.defaultEndTime || '17:00',
                breaks: []
              });
            }
          });
          
          // Sort by day order
          const dayOrder = { monday: 0, tuesday: 1, wednesday: 2, thursday: 3, friday: 4, saturday: 5, sunday: 6 };
          processedData.workingDays = availabilityData.workingDays.sort((a, b) => dayOrder[a.day] - dayOrder[b.day]);
          
          console.log('✅ Validated and sorted working days:', processedData.workingDays.map(d => ({ day: d.day, isWorking: d.isWorking })));
        }
      }
      
      const availability = await DoctorAvailability.findOneAndUpdate(
        { doctorId },
        { 
          ...processedData,
          updatedAt: new Date()
        },
        { new: true, upsert: true }
      );

      // Update current status
      availability.updateCurrentStatus();
      await availability.save();

      // SYNC WITH USER MODEL - Always update availability
      // Note: Consultation fees are now managed separately and should not be auto-calculated
      // Doctors must set their own consultation fees through their profile

      // Get working days as array of day names (for User model compatibility)
      const workingDaysArray = (availabilityData.workingDays || availability.workingDays)?.map(day => 
        typeof day === 'string' ? day : day.day
      ) || [];

      console.log('🔄 Syncing User model with:', {
        workingDaysArray,
        appointmentDuration: availabilityData.appointmentDuration || availability.appointmentDuration,
        startTime: availabilityData.defaultStartTime || availability.defaultStartTime,
        endTime: availabilityData.defaultEndTime || availability.defaultEndTime
      });

      // Update User model with availability (consultation fees are managed separately)
      await User.findByIdAndUpdate(doctorId, {
        'availability.appointmentDuration': availabilityData.appointmentDuration || availability.appointmentDuration,
        'availability.startTime': availabilityData.defaultStartTime || availability.defaultStartTime,
        'availability.endTime': availabilityData.defaultEndTime || availability.defaultEndTime,
        'availability.workingDays': workingDaysArray,
        'scheduleSettings.workingDays': workingDaysArray
      });

      // Update memory status
      this.doctorStatus.set(doctorId.toString(), {
        isOnline: availability.isOnline,
        status: availability.status,
        currentStatus: availability.currentStatus,
        lastUpdated: new Date()
      });

      // Emit real-time update
      this.emitDoctorAvailabilityUpdate(doctorId, availability);

      return availability;
    } catch (error) {
      console.error('Error updating doctor availability:', error);
      throw error;
    }
  }

  // Update online status
  async updateOnlineStatus(doctorId, isOnline) {
    try {
      const availability = await DoctorAvailability.updateOnlineStatus(doctorId, isOnline);
      
      // Update memory status
      this.doctorStatus.set(doctorId.toString(), {
        isOnline: availability.isOnline,
        status: availability.status,
        currentStatus: availability.currentStatus,
        lastUpdated: new Date()
      });

      // Emit real-time update
      this.emitDoctorStatusUpdate(doctorId, {
        isOnline: availability.isOnline,
        status: availability.status,
        lastOnlineAt: availability.lastOnlineAt
      });

      return availability;
    } catch (error) {
      console.error('Error updating online status:', error);
      throw error;
    }
  }

  // Get available slots for a specific date
  async getAvailableSlots(doctorId, date) {
    try {
      const availability = await this.getDoctorAvailability(doctorId);
      const baseSlots = availability.getAvailableSlots(date);

      // Get existing appointments for the date
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const existingAppointments = await Appointment.find({
        doctor: doctorId,
        scheduledDate: {
          $gte: startOfDay,
          $lte: endOfDay
        },
        status: { $in: ['pending', 'confirmed', 'in-progress', 'scheduled'] }
      });

      // Filter out booked slots
      const availableSlots = baseSlots.map(slot => {
        const isBooked = existingAppointments.some(appointment => {
          const appointmentTime = new Date(appointment.scheduledDate);
          const appointmentStartTime = appointmentTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
          return appointmentStartTime === slot.startTime;
        });

        return {
          ...slot,
          isAvailable: !isBooked,
          isBooked: isBooked
        };
      });

      return availableSlots;
    } catch (error) {
      console.error('Error getting available slots:', error);
      throw error;
    }
  }

  // Lock a slot temporarily
  async lockSlot(doctorId, date, time, patientId, duration = 30) {
    try {
      const slotKey = `${doctorId}:${date}:${time}`;
      
      // Check if slot is already locked
      if (this.slotLocks.has(slotKey)) {
        const existingLock = this.slotLocks.get(slotKey);
        if (existingLock.patientId !== patientId) {
          return { success: false, message: 'Slot is already locked by another patient' };
        }
      }

      // Check if slot is available
      const availableSlots = await this.getAvailableSlots(doctorId, date);
      const targetSlot = availableSlots.find(slot => slot.startTime === time);
      
      if (!targetSlot || !targetSlot.isAvailable) {
        return { success: false, message: 'Slot is not available' };
      }

      // Create temporary lock
      const lockData = {
        doctorId,
        date,
        time,
        patientId,
        duration,
        lockedAt: new Date(),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
      };

      this.slotLocks.set(slotKey, lockData);

      // Emit real-time update
      this.emitSlotLocked(doctorId, lockData);

      // Auto-unlock after 5 minutes
      setTimeout(() => {
        this.unlockSlot(doctorId, date, time);
      }, 5 * 60 * 1000);

      return { success: true, lockData };
    } catch (error) {
      console.error('Error locking slot:', error);
      throw error;
    }
  }

  // Unlock a slot
  async unlockSlot(doctorId, date, time) {
    try {
      const slotKey = `${doctorId}:${date}:${time}`;
      
      if (this.slotLocks.has(slotKey)) {
        this.slotLocks.delete(slotKey);
        
        // Emit real-time update
        this.emitSlotUnlocked(doctorId, { doctorId, date, time });
        
        return { success: true };
      }
      
      return { success: false, message: 'Slot was not locked' };
    } catch (error) {
      console.error('Error unlocking slot:', error);
      throw error;
    }
  }

  // Check slot availability
  async checkSlotAvailability(doctorId, date, time) {
    try {
      const availableSlots = await this.getAvailableSlots(doctorId, date);
      const targetSlot = availableSlots.find(slot => slot.startTime === time);
      
      return {
        isAvailable: targetSlot ? targetSlot.isAvailable : false,
        slot: targetSlot
      };
    } catch (error) {
      console.error('Error checking slot availability:', error);
      throw error;
    }
  }

  // Get real-time doctor status
  getDoctorStatus(doctorId) {
    return this.doctorStatus.get(doctorId.toString()) || {
      isOnline: false,
      status: 'unavailable',
      currentStatus: {
        isWorkingToday: false,
        isWithinWorkingHours: false,
        lastUpdated: new Date()
      }
    };
  }

  // Emit real-time updates
  emitDoctorAvailabilityUpdate(doctorId, availability) {
    if (global.io) {
      global.io.to(`doctor:${doctorId}`).emit('doctor:availability:updated', {
        doctorId,
        availability: {
          workingDays: availability.workingDays,
          defaultStartTime: availability.defaultStartTime,
          defaultEndTime: availability.defaultEndTime,
          appointmentDuration: availability.appointmentDuration,
          analytics: availability.analytics,
          settings: availability.settings
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  emitDoctorStatusUpdate(doctorId, statusData) {
    if (global.io) {
      global.io.to(`doctor:${doctorId}`).emit('doctor:status:updated', {
        doctorId,
        ...statusData,
        timestamp: new Date().toISOString()
      });
    }
  }

  emitSlotLocked(doctorId, lockData) {
    if (global.io) {
      global.io.to(`doctor:${doctorId}`).emit('slot:locked', lockData);
      global.io.to(`patient:${lockData.patientId}`).emit('slot:locked', lockData);
    }
  }

  emitSlotUnlocked(doctorId, unlockData) {
    if (global.io) {
      global.io.to(`doctor:${doctorId}`).emit('slot:unlocked', unlockData);
      global.io.to('patients').emit('slot:unlocked', unlockData);
    }
  }

  // Cleanup expired locks
  setupCleanupInterval() {
    setInterval(() => {
      const now = new Date();
      for (const [key, lock] of this.slotLocks.entries()) {
        if (lock.expiresAt < now) {
          this.slotLocks.delete(key);
          const [doctorId, date, time] = key.split(':');
          this.emitSlotUnlocked(doctorId, { doctorId, date, time });
        }
      }
    }, 60000); // Check every minute
  }

  // Get all online doctors
  async getOnlineDoctors() {
    try {
      const onlineDoctors = await DoctorAvailability.find({
        isOnline: true,
        status: { $in: ['available', 'away'] }
      }).populate('doctorId', 'name email role');

      return onlineDoctors;
    } catch (error) {
      console.error('Error getting online doctors:', error);
      throw error;
    }
  }

  // Update all doctor statuses (called periodically)
  async updateAllDoctorStatuses() {
    try {
      const allDoctors = await DoctorAvailability.find({});
      
      for (const doctor of allDoctors) {
        doctor.updateCurrentStatus();
        await doctor.save();
        
        // Update memory status
        this.doctorStatus.set(doctor.doctorId.toString(), {
          isOnline: doctor.isOnline,
          status: doctor.status,
          currentStatus: doctor.currentStatus,
          lastUpdated: new Date()
        });
      }
    } catch (error) {
      console.error('Error updating all doctor statuses:', error);
    }
  }
}

export default new RealTimeAvailabilityService();
