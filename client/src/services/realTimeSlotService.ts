import { io, Socket } from 'socket.io-client';
import api from '@/lib/api';

export interface TimeSlot {
  _id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  isBooked: boolean;
  consultationType: 'online' | 'in-person';
  realTimeStatus?: 'available' | 'offline' | 'locked';
  lastUpdated?: string;
}

export interface SlotLockData {
  doctorId: string;
  date: string;
  time: string;
  patientId: string;
  lockedAt: string;
  expiresAt: string;
  duration: number;
}

export interface DoctorAvailabilityStatus {
  isWorkingToday: boolean;
  isWithinWorkingHours: boolean;
  isOnline: boolean;
  currentStatus: string;
  workingHours: {
    startTime: string;
    endTime: string;
    workingDays: string[];
  };
  lastUpdated: string;
}

class RealTimeSlotService {
  private socket: Socket | null = null;
  private isConnected = false;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.setupSocketConnection();
  }

  private setupSocketConnection() {
    try {
      this.socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
        auth: {
          token: localStorage.getItem('token')
        }
      });

      this.socket.on('connect', () => {
        console.log('🔌 Connected to real-time slot service');
        this.isConnected = true;
        this.emit('slot:connected', { timestamp: new Date().toISOString() });
      });

      this.socket.on('disconnect', () => {
        console.log('🔌 Disconnected from real-time slot service');
        this.isConnected = false;
      });

      this.socket.on('slot:locked', (data: SlotLockData) => {
        console.log('🔒 Slot locked:', data);
        this.emit('slot:locked', data);
      });

      this.socket.on('slot:unlocked', (data: { doctorId: string; date: string; time: string }) => {
        console.log('🔓 Slot unlocked:', data);
        this.emit('slot:unlocked', data);
      });

      this.socket.on('doctor:availability:updated', (data: { doctorId: string; availability: any }) => {
        console.log('👨‍⚕️ Doctor availability updated:', data);
        this.emit('doctor:availability:updated', data);
      });

      this.socket.on('error', (error: any) => {
        console.error('❌ Socket error:', error);
        this.emit('error', error);
      });

    } catch (error) {
      console.error('❌ Failed to setup socket connection:', error);
    }
  }

  // Join doctor's calendar room for real-time updates
  joinDoctorCalendar(doctorId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('doctor:join', { doctorId });
      console.log(`👨‍⚕️ Joined doctor calendar: ${doctorId}`);
    }
  }

  // Leave doctor's calendar room
  leaveDoctorCalendar(doctorId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('doctor:leave', { doctorId });
      console.log(`👨‍⚕️ Left doctor calendar: ${doctorId}`);
    }
  }

  // Lock a slot temporarily (for booking process)
  async lockSlot(doctorId: string, date: string, time: string, duration: number = 30): Promise<SlotLockData | null> {
    if (!this.socket || !this.isConnected) {
      console.warn('⚠️ Socket not connected, cannot lock slot');
      return null;
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Slot lock timeout'));
      }, 10000);

      this.socket!.emit('slot:lock', {
        doctorId,
        date,
        time,
        duration,
        patientId: this.getCurrentUserId()
      });

      const handleLocked = (data: SlotLockData) => {
        if (data.doctorId === doctorId && data.date === date && data.time === time) {
          clearTimeout(timeout);
          this.off('slot:locked', handleLocked);
          this.off('slot:lock:failed', handleFailed);
          resolve(data);
        }
      };

      const handleFailed = (data: any) => {
        if (data.doctorId === doctorId && data.date === date && data.time === time) {
          clearTimeout(timeout);
          this.off('slot:locked', handleLocked);
          this.off('slot:lock:failed', handleFailed);
          reject(new Error(data.message || 'Failed to lock slot'));
        }
      };

      this.on('slot:locked', handleLocked);
      this.on('slot:lock:failed', handleFailed);
    });
  }

  // Release a locked slot
  unlockSlot(doctorId: string, date: string, time: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('slot:unlock', { doctorId, date, time });
      console.log(`🔓 Unlocked slot: ${doctorId} ${date} ${time}`);
    }
  }

  // Get real-time available slots for a doctor
  async getAvailableSlots(doctorId: string, date: string, consultationType: string = 'both'): Promise<TimeSlot[]> {
    try {
      const response = await api.get(`/api/slots/${doctorId}/${date}`, {
        params: { consultationType }
      });

      if (response.data?.success) {
        return response.data.availableSlots.map((slot: any) => ({
          _id: slot._id,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isAvailable: slot.isAvailable && slot.realTimeStatus === 'available',
          isBooked: !slot.isAvailable,
          consultationType: slot.consultationType,
          realTimeStatus: slot.realTimeStatus,
          lastUpdated: slot.lastUpdated
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching available slots:', error);
      return [];
    }
  }

  // Get doctor's current availability status
  async getDoctorAvailabilityStatus(doctorId: string): Promise<DoctorAvailabilityStatus | null> {
    try {
      const response = await api.get(`/api/slots/doctor/${doctorId}/status`);
      if (response.data?.success) {
        return response.data.status;
      }
      return null;
    } catch (error) {
      console.error('Error fetching doctor availability status:', error);
      return null;
    }
  }

  // Update doctor's availability settings
  async updateDoctorAvailability(availabilityData: any): Promise<any> {
    try {
      const response = await api.put('/api/slots/doctor/me/availability', availabilityData);
      if (response.data?.success) {
        return response.data.availability;
      }
      throw new Error('Failed to update availability');
    } catch (error) {
      console.error('Error updating doctor availability:', error);
      throw error;
    }
  }

  // Check slot availability in real-time
  async checkSlotAvailability(doctorId: string, slotId: string, startTime: string, endTime: string): Promise<boolean> {
    try {
      const response = await api.post('/api/slots/check-availability', {
        doctorId,
        slotId,
        startTime,
        endTime
      });
      return response.data?.success ? response.data.isAvailable : false;
    } catch (error) {
      console.error('Error checking slot availability:', error);
      return false;
    }
  }

  // Reserve a slot temporarily
  async reserveSlot(doctorId: string, slotId: string, startTime: string, endTime: string): Promise<any> {
    try {
      const response = await api.post('/api/slots/reserve', {
        doctorId,
        slotId,
        startTime,
        endTime
      });
      return response.data?.success ? response.data.reservation : null;
    } catch (error) {
      console.error('Error reserving slot:', error);
      throw error;
    }
  }

  // Event handling methods
  on(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  private getCurrentUserId(): string {
    // Get current user ID from localStorage or context
    const user = localStorage.getItem('user');
    if (user) {
      try {
        return JSON.parse(user)._id;
      } catch {
        return '';
      }
    }
    return '';
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.eventListeners.clear();
    }
  }

  // Get connection status
  isSocketConnected(): boolean {
    return this.isConnected;
  }
}

export const realTimeSlotService = new RealTimeSlotService();
export default realTimeSlotService;








