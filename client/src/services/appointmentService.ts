import api from '@/lib/api';
import { Doctor, TimeSlot, Appointment, ConsultationType } from '@/types/appointment';
import { SocketManager, appointmentSocketManager } from './socketUtils';

class AppointmentService {
  private doctors: Doctor[] = [];
  private appointments: Appointment[] = [];
  private baseURL = '/appointments';
  private socketManager: SocketManager;
  private isConnected: boolean = false;

  constructor() {
    this.socketManager = appointmentSocketManager;
    // Only initialize socket if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      this.initializeSocket();
    }
  }

  private async initializeSocket() {
    try {
      // Check if we have a valid token before connecting
      if (!this.socketManager.hasValidToken()) {
        const token = localStorage.getItem('token');
        if (token) {
          await this.socketManager.updateAuthToken(token);
        } else {
          console.log('No token available, skipping socket connection');
          return;
        }
      }

      await this.socketManager.connect();
      this.isConnected = true;

      // Set up event listeners
      this.socketManager.on('appointment-updated', (data: any) => {
        console.log('Appointment updated via socket:', data);
        window.dispatchEvent(new CustomEvent('appointment-updated', { detail: data }));
      });

      this.socketManager.on('appointment-cancelled', (data: any) => {
        console.log('Appointment cancelled via socket:', data);
        window.dispatchEvent(new CustomEvent('appointment-cancelled', { detail: data }));
      });

      this.socketManager.on('appointment-created', (data: any) => {
        console.log('Appointment created via socket:', data);
        window.dispatchEvent(new CustomEvent('appointment-created', { detail: data }));
      });

      this.socketManager.on('slot-updated', (data: any) => {
        console.log('Slot updated via socket:', data);
        window.dispatchEvent(new CustomEvent('slot-updated', { detail: data }));
      });

      // New real-time events for 4-step booking process
      this.socketManager.on('slot-locked', (data: any) => {
        console.log('Slot locked via socket:', data);
        window.dispatchEvent(new CustomEvent('slot-locked', { detail: data }));
      });

      this.socketManager.on('slot-unlocked', (data: any) => {
        console.log('Slot unlocked via socket:', data);
        window.dispatchEvent(new CustomEvent('slot-unlocked', { detail: data }));
      });

      this.socketManager.on('payment-initiated', (data: any) => {
        console.log('Payment initiated via socket:', data);
        window.dispatchEvent(new CustomEvent('payment-initiated', { detail: data }));
      });

      this.socketManager.on('payment-verified', (data: any) => {
        console.log('Payment verified via socket:', data);
        window.dispatchEvent(new CustomEvent('payment-verified', { detail: data }));
      });

      this.socketManager.on('appointment-confirmed', (data: any) => {
        console.log('Appointment confirmed via socket:', data);
        window.dispatchEvent(new CustomEvent('appointment-confirmed', { detail: data }));
      });

      this.socketManager.on('appointment-progress-updated', (data: any) => {
        console.log('Appointment progress updated via socket:', data);
        window.dispatchEvent(new CustomEvent('appointment-progress-updated', { detail: data }));
      });

    } catch (error) {
      console.error('Failed to initialize socket:', error);
      this.isConnected = false;
    }
  }

  // Fetch a complete doctor profile suitable for booking modal
  async getCompleteDoctorProfile(doctorId: string): Promise<Doctor | null> {
    // Reuse existing strategies in getDoctorById which already hits /doctors/:id/profile when needed
    const doctor = await this.getDoctorById(doctorId);
    return doctor || null;
  }

  // Method to check socket connection status
  isSocketConnected(): boolean {
    return this.socketManager.getConnectionStatus();
  }

  // Method to manually reconnect socket
  async reconnectSocket(): Promise<void> {
    try {
      await this.socketManager.connect();
      this.isConnected = true;
    } catch (error) {
      console.error('Failed to reconnect socket:', error);
      this.isConnected = false;
    }
  }

  // Method to initialize socket after login
  async initializeSocketAfterLogin(token: string): Promise<void> {
    try {
      await this.socketManager.updateAuthToken(token);
      await this.socketManager.connect();
      this.isConnected = true;

      // Set up event listeners
      this.socketManager.on('appointment-updated', (data) => {
        console.log('Appointment updated via socket:', data);
        window.dispatchEvent(new CustomEvent('appointment-updated', { detail: data }));
      });

      this.socketManager.on('appointment-cancelled', (data) => {
        console.log('Appointment cancelled via socket:', data);
        window.dispatchEvent(new CustomEvent('appointment-cancelled', { detail: data }));
      });

      this.socketManager.on('appointment-created', (data) => {
        console.log('Appointment created via socket:', data);
        window.dispatchEvent(new CustomEvent('appointment-created', { detail: data }));
      });

      this.socketManager.on('slot-updated', (data) => {
        console.log('Slot updated via socket:', data);
        window.dispatchEvent(new CustomEvent('slot-updated', { detail: data }));
      });
    } catch (error) {
      console.error('Failed to initialize socket after login:', error);
      this.isConnected = false;
    }
  }

  // Method to disconnect socket
  disconnect(): void {
    this.socketManager.disconnect();
    this.isConnected = false;
  }

  // Method to join appointment room
  joinAppointmentRoom(appointmentId: string): void {
    this.socketManager.emit('join-appointment-room', appointmentId);
  }

  // Method to leave appointment room
  leaveAppointmentRoom(appointmentId: string): void {
    this.socketManager.emit('leave-appointment-room', appointmentId);
  }

  // Video consultation subscription methods
  subscribeToVideoConsultation(appointmentId: string, callback: (event: string, data: any) => void): void {
    this.socketManager.emit('join-video-consultation', appointmentId);

    // Set up event listeners for video consultation events
    this.socketManager.on('video-consultation-ended', (data: any) => {
      callback('ended', data);
    });

    this.socketManager.on('participant-joined', (data: any) => {
      callback('participant-joined', data);
    });

    this.socketManager.on('participant-left', (data: any) => {
      callback('participant-left', data);
    });
  }

  unsubscribeFromVideoConsultation(appointmentId: string): void {
    this.socketManager.emit('leave-video-consultation', appointmentId);

    // Remove event listeners
    this.socketManager.off('video-consultation-ended');
    this.socketManager.off('participant-joined');
    this.socketManager.off('participant-left');
  }

  // Method to join doctor room
  joinDoctorRoom(doctorId: string): void {
    this.socketManager.emit('join-doctor-room', doctorId);
  }

  // Method to leave doctor room
  leaveDoctorRoom(doctorId: string): void {
    this.socketManager.emit('leave-doctor-room', doctorId);
  }

  // Test method to check database connectivity
  async testDatabaseConnection(): Promise<{ success: boolean; databaseCount: number; mockCount: number; error?: string }> {
    try {
      console.log('🧪 Testing database connection...');
      const response = await api.get('/doctors/all');
      console.log('🧪 Database test response:', response);

      // Check if response.data exists, if not, check response directly
      let doctorsData: any = response.data;
      if (!doctorsData && (response as any).doctors) {
        doctorsData = (response as any);
      }

      if (doctorsData && doctorsData.doctors) {
        console.log('✅ Database connection successful');
        console.log(`📊 Database doctors count: ${doctorsData.doctors.length}`);
        console.log('🏥 Database doctors:', doctorsData.doctors);

        return {
          success: true,
          databaseCount: doctorsData.doctors.length,
          mockCount: 0
        };
      } else {
        console.log('⚠️ Database response structure unexpected:', doctorsData);
        return {
          success: false,
          databaseCount: 0,
          mockCount: 0,
          error: 'Unexpected response structure'
        };
      }
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      return {
        success: false,
        databaseCount: 0,
        mockCount: 0,
        error: error.message || 'Unknown error'
      };
    }
  }

  // Enhanced methods for fetching doctors from real API
  async getAllDoctors(): Promise<Doctor[]> {
    try {
      console.log('🔍 Fetching all doctors from database...');
      console.log('📡 API Endpoint: /doctors/all');

      const response = await api.get('/doctors/all');
      console.log('✅ API Response received:', response);
      console.log('📊 Response data:', response.data);
      console.log('📊 Response status:', response.status);
      console.log('📊 Full response object keys:', Object.keys(response));

      // Handle different response structures
      let doctorsData: any = response.data;
      if (!doctorsData && (response as any).doctors) {
        // If response.data is undefined, check if the response itself has the data
        doctorsData = (response as any);
      }

      if (!doctorsData) {
        console.warn('⚠️ Unexpected response structure:', response);
        doctorsData = (response as any);
      }

      if (doctorsData && doctorsData.doctors) {
        console.log(`📋 Raw doctors data from API:`, doctorsData.doctors);
        const transformedDoctors = this.transformDoctorsFromAPI(doctorsData.doctors);
        // Update cache so downstream methods can use it
        this.doctors = transformedDoctors;
        console.log(`🎯 Successfully transformed ${transformedDoctors.length} doctors from database`);
        console.log('🏥 Transformed doctors:', transformedDoctors);
        return transformedDoctors;
      } else {
        console.warn('⚠️ No doctors data in API response structure:', doctorsData);
        this.doctors = [];
        return [];
      }
    } catch (error: any) {
      console.error('❌ Error fetching all doctors from database:', error);
      console.log('🔍 Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      this.doctors = [];
      return [];
    }
  }

  async getNearbyDoctors(location: { latitude: number; longitude: number; pincode?: string; radius?: number }): Promise<Doctor[]> {
    try {
      const params = new URLSearchParams();
      if (location.latitude && location.longitude) {
        params.append('lat', location.latitude.toString());
        params.append('lng', location.longitude.toString());
      }
      if (location.pincode) {
        params.append('pincode', location.pincode);
      }
      if (location.radius) {
        params.append('radius', location.radius.toString());
      }

      const response = await api.get(`/doctors/nearby?${params.toString()}`);
      console.log('📍 Nearby doctors API response:', response);

      // Check if response.data exists, if not, check response directly
      let doctorsData: any = response.data;
      if (!doctorsData && (response as any).doctors) {
        doctorsData = (response as any);
      }

      if (doctorsData && doctorsData.doctors) {
        const list = this.transformDoctorsFromAPI(doctorsData.doctors);
        // Merge into cache by id
        const existingById = new Map(this.doctors.map(d => [d._id, d] as const));
        list.forEach(d => existingById.set(d._id, d));
        this.doctors = Array.from(existingById.values());
        return list;
      } else {
        console.warn('⚠️ No doctors data in nearby API response:', doctorsData);
        return [];
      }
    } catch (error) {
      console.error('Error fetching nearby doctors:', error);
      // Fallback to empty array
      return [];
    }
  }

  async getDoctorsByPincode(pincode: string): Promise<Doctor[]> {
    try {
      const response = await api.get(`/doctors/nearby?pincode=${pincode}`);
      return this.transformDoctorsFromAPI(response.data.doctors);
    } catch (error) {
      console.error('Error fetching doctors by pincode:', error);
      return [];
    }
  }

  async getEmergencyDoctors(): Promise<Doctor[]> {
    try {
      const response = await api.get('/doctors/emergency');
      console.log('🚨 Emergency doctors API response:', response);

      // Check if response.data exists and has doctors
      const doctorsData = response.data;

      if (doctorsData && doctorsData.doctors) {
        return this.transformDoctorsFromAPI(doctorsData.doctors);
      } else {
        console.warn('⚠️ No doctors data in emergency API response:', doctorsData);
        return [];
      }
    } catch (error) {
      console.error('Error fetching emergency doctors:', error);
      return [];
    }
  }

  async getSavedDoctors(): Promise<Doctor[]> {
    try {
      const response = await api.get('/doctors/saved');
      console.log('💾 Saved doctors API response:', response);

      // Check if response.data exists and has savedDoctors
      const doctorsData = response.data;

      if (doctorsData && doctorsData.savedDoctors) {
        return this.transformDoctorsFromAPI(doctorsData.savedDoctors);
      } else {
        console.warn('⚠️ No saved doctors data in API response:', doctorsData);
        return [];
      }
    } catch (error) {
      console.error('Error fetching saved doctors:', error);
      return [];
    }
  }

  async addSavedDoctor(doctorId: string): Promise<void> {
    try {
      await api.post(`/doctors/saved/${doctorId}`);
    } catch (error) {
      console.error('Error adding saved doctor:', error);
      throw error;
    }
  }

  async removeSavedDoctor(doctorId: string): Promise<void> {
    try {
      await api.delete(`/doctors/saved/${doctorId}`);
    } catch (error) {
      console.error('Error removing saved doctor:', error);
      throw error;
    }
  }

  // Transform API doctor data to match our Doctor interface
  private formatAddress(
    locationAddress: string | { street?: string; area?: string; city?: string; state?: string; country?: string; pincode?: string } | undefined,
    hospital: string | undefined,
    addressObj: { city?: string; zipCode?: string; street?: string; state?: string } | undefined
  ): string {
    // If locationAddress is an object, convert it to a string
    if (locationAddress && typeof locationAddress === 'object') {
      const parts = [
        locationAddress.street,
        locationAddress.area,
        locationAddress.city,
        locationAddress.state,
        locationAddress.country,
        locationAddress.pincode
      ].filter(Boolean);
      return parts.join(', ');
    }

    // If it's already a string, return it
    if (typeof locationAddress === 'string') {
      return locationAddress;
    }

    // Fallback to hospital or address object
    if (hospital) {
      return hospital;
    }

    if (addressObj) {
      const parts = [
        addressObj.street,
        addressObj.city,
        addressObj.state,
        addressObj.zipCode
      ].filter(Boolean);
      return parts.join(', ') || 'Address not available';
    }

    return 'Address not available';
  }

  private transformDoctorsFromAPI(apiDoctors: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
    specialization?: string;
    yearsOfExperience?: string | number;
    experience?: number;
    languages?: string[];
    ratings?: { average: number; count: number };
    consultationFees?: { online: number; inPerson: number };
    location?: { address?: string; lng?: number; lat?: number; pincode?: string };
    availableSlots?: TimeSlot[];
    hospital?: string;
    department?: string;
    bio?: string;
    emergencyAvailable?: boolean;
    specialties?: string[];
    // Additional fields from real database
    licenseNumber?: string;
    address?: { city?: string; zipCode?: string; street?: string; state?: string };
    profileComplete?: boolean;
    isActive?: boolean;
  }>): Doctor[] {
    console.log('🔄 Starting transformation of', apiDoctors.length, 'doctors');

    return apiDoctors.map((doctor, index) => {
      console.log(`👨‍⚕️ Transforming doctor ${index + 1}:`, {
        id: doctor._id,
        name: `${doctor.firstName} ${doctor.lastName}`,
        specialization: doctor.specialization,
        hospital: doctor.hospital,
        experience: doctor.experience || doctor.yearsOfExperience
      });

      const transformedDoctor: Doctor = {
        _id: doctor._id,
        name: `${doctor.firstName} ${doctor.lastName}`,
        profilePhoto: doctor.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${doctor._id}`,
        specialization: doctor.specialization || 'General Physician',
        experience: doctor.yearsOfExperience ? parseInt(doctor.yearsOfExperience.toString()) : doctor.experience || 0,
        languages: doctor.languages || ['English'],
        ratings: {
          average: doctor.ratings?.average || 4.5,
          count: doctor.ratings?.count || 0
        },
        fees: {
          online: doctor.consultationFees?.online || 500,
          inPerson: doctor.consultationFees?.inPerson || 800
        },
        location: {
          address: this.formatAddress(doctor.location?.address, doctor.hospital, doctor.address),
          coordinates: [doctor.location?.lng || 0, doctor.location?.lat || 0],
          pincode: doctor.location?.pincode || doctor.address?.zipCode || '000000'
        },
        availableSlots: doctor.availableSlots || [],
        hospital: doctor.hospital,
        department: doctor.department,
        bio: doctor.bio || `Dr. ${doctor.firstName} ${doctor.lastName} is a ${doctor.specialization || 'medical professional'} with ${doctor.experience || doctor.yearsOfExperience || 0} years of experience.`,
        emergencyAvailable: doctor.emergencyAvailable || false,
        specialties: doctor.specialties || [doctor.specialization || 'General Medicine']
      };

      console.log(`✅ Transformed doctor ${index + 1}:`, transformedDoctor);
      return transformedDoctor;
    });
  }

  async getDoctorById(doctorId: string): Promise<Doctor | null> {
    try {
      // 1) Try cache first
      const cached = this.doctors.find(d => d._id === doctorId);
      if (cached) return cached;

      // 2) Refresh all doctors and try again
      const all = await this.getAllDoctors();
      const afterRefresh = all.find(d => d._id === doctorId);
      if (afterRefresh) return afterRefresh;

      // 3) Fallback: try profile endpoint /doctors/:doctorId/profile
      try {
        const resp = await api.get(`/doctors/${doctorId}/profile`);
        const payload = (resp.data?.data || (resp.data as any)?.doctor || resp.data);
        if (payload) {
          const [mapped] = this.transformDoctorsFromAPI([payload]);
          // Update cache
          this.doctors = [...this.doctors, mapped];
          return mapped;
        }
      } catch (innerError) {
        console.warn('Profile endpoint fallback failed:', innerError);
      }

      console.warn('Doctor not found after all strategies:', doctorId);
      return null;
    } catch (error) {
      console.error('Error fetching doctor by ID:', error);
      return null;
    }
  }

  async getAvailableSlots(doctorId: string, date: Date): Promise<TimeSlot[]> {
    try {
      // Use our new real-time slots API
      const formattedDate = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      console.log(`🔍 Fetching real-time slots for doctor ${doctorId} on ${formattedDate}`);

      // Temporarily use test route to bypass authentication
      const url = `/slots/${doctorId}/${formattedDate}`;
      console.log('🔗 Making API call to:', url);
      console.log('🔗 Full URL will be: http://localhost:5000/api' + url);

      const response = await api.get(url);
      console.log('✅ Real-time slots API response:', response);

      if (response.data?.success && response.data.availableSlots) {
        return response.data.availableSlots;
      }
      return [];
    } catch (error) {
      console.error('❌ Error fetching real-time slots:', error);
      console.log('🔄 Falling back to mock data');

      // Fallback to mock data if API fails
      const doctor = await this.getDoctorById(doctorId);
      return doctor?.availableSlots || [];
    }
  }

  async getWeeklySlots(doctorId: string, startDate: Date, days: number = 7): Promise<Record<string, { date: string; slots: TimeSlot[]; totalSlots: number; availableSlots: number }>> {
    try {
      // Use our new real-time weekly slots API
      const formattedDate = startDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      console.log(`📅 Fetching weekly slots for doctor ${doctorId} starting ${formattedDate}`);

      const response = await api.get(`/slots/${doctorId}/week/${formattedDate}?days=${days}`);
      console.log('✅ Weekly slots API response:', response.data);

      if (response.data.success && response.data.weeklySlots) {
        console.log(`🎯 Found weekly slots for ${Object.keys(response.data.weeklySlots).length} days`);
        return response.data.weeklySlots;
      } else {
        console.warn('⚠️ No weekly slots data in response:', response.data);
        return {};
      }
    } catch (error) {
      console.error('❌ Error fetching weekly slots:', error);
      console.log('🔄 Falling back to empty weekly data');
      return {};
    }
  }

  // Real-time slot locking for step 2
  async lockSlot(doctorId: string, date: Date, time: string, patientId: string): Promise<boolean> {
    try {
      if (!this.isConnected) {
        throw new Error('Socket not connected');
      }

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Slot lock timeout'));
        }, 10000);

        this.socketManager.emit('slot:lock', {
          doctorId,
          date: date.toISOString().split('T')[0],
          time,
          patientId,
          duration: 30
        });

        const handleSlotLocked = (data: any) => {
          if (data.doctorId === doctorId && data.time === time) {
            clearTimeout(timeout);
            this.socketManager.off('slot:locked', handleSlotLocked);
            this.socketManager.off('slot:lock:failed', handleSlotLockFailed);
            resolve(true);
          }
        };

        const handleSlotLockFailed = (data: any) => {
          if (data.doctorId === doctorId && data.time === time) {
            clearTimeout(timeout);
            this.socketManager.off('slot:locked', handleSlotLocked);
            this.socketManager.off('slot:lock:failed', handleSlotLockFailed);
            reject(new Error(data.message));
          }
        };

        this.socketManager.on('slot:locked', handleSlotLocked);
        this.socketManager.on('slot:lock:failed', handleSlotLockFailed);
      });
    } catch (error) {
      console.error('Error locking slot:', error);
      throw error;
    }
  }

  // Release slot lock
  async unlockSlot(doctorId: string, date: Date, time: string): Promise<void> {
    try {
      if (!this.isConnected) {
        return;
      }

      this.socketManager.emit('slot:unlock', {
        doctorId,
        date: date.toISOString().split('T')[0],
        time
      });
    } catch (error) {
      console.error('Error unlocking slot:', error);
    }
  }

  // Join doctor's calendar room for real-time updates
  async joinDoctorCalendar(doctorId: string): Promise<void> {
    try {
      if (!this.isConnected) {
        return;
      }

      this.socketManager.emit('doctor:calendar:join', { doctorId });
    } catch (error) {
      console.error('Error joining doctor calendar:', error);
    }
  }

  // Update appointment progress for real-time tracking
  async updateAppointmentProgress(appointmentId: string, step: number, progress: number, data?: Record<string, unknown>): Promise<void> {
    try {
      const response = await api.put(`/appointments/${appointmentId}/progress`, {
        step,
        progress,
        ...data
      });

      if (response.data.success) {
        // Emit progress update via socket
        if (this.isConnected) {
          this.socketManager.emit('appointment:progress:update', {
            appointmentId,
            step,
            progress
          });
        }
      }
    } catch (error) {
      console.error('Error updating appointment progress:', error);
      throw error;
    }
  }

  // Confirm appointment (final step)
  async confirmAppointment(appointmentId: string, data: Record<string, unknown>): Promise<Appointment> {
    try {
      const response = await api.post(`/appointments/${appointmentId}/confirm`, data);

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error confirming appointment:', error);
      throw error;
    }
  }

  // Enhanced booking with real-time functionality
  async bookAppointment(doctorId: string, slotId: string, type: ConsultationType, selectedDate?: Date, paymentMethod: 'online' | 'offline' = 'online', calculatedAmount?: number, selectedSlotTime?: string): Promise<Appointment> {
    try {
      // Get doctor details for payment amount
      const doctor = await this.getDoctorById(doctorId);
      if (!doctor) throw new Error('Doctor not found');

      // Try to find slot in availableSlots first (legacy support)
      let slot = doctor.availableSlots?.find(s => s._id === slotId);

      // If not found in availableSlots, try to construct slot info from slotId
      if (!slot) {
        console.log('⚠️ Slot not found in availableSlots, using slotId for booking:', slotId);
        // For real-time availability, we might not have the slot in availableSlots
        // So we'll proceed with the booking using the slotId directly
      }

      // Use the calculated amount if provided, otherwise get from doctor fees
      let amount = calculatedAmount;
      if (!amount || amount <= 0) {
        // Get the doctor's actual consultation fees dynamically
        amount = type === 'online' ? doctor.fees?.online : doctor.fees?.inPerson;

        // Add validation to ensure fees are properly set
        if (!amount || amount <= 0) {
          // If doctor fees are not set, throw an error instead of using hardcoded fallbacks
          console.error(`❌ Doctor fees not properly set for ${type} consultation:`, doctor.fees);
          throw new Error(`Doctor consultation fees are not configured. Please contact support.`);
        }
      }

      console.log(`🔍 Using consultation fees: ${type} consultation = ₹${amount} (${calculatedAmount ? 'calculated' : 'from doctor fees'})`);
      console.log(`🔍 Doctor fees object:`, doctor.fees);

      // Convert slot start time to time string
      let slotStartTime: Date;
      let timeString: string;

      if (selectedSlotTime) {
        // Use the selected slot time from the frontend
        slotStartTime = new Date(selectedSlotTime);
        timeString = slotStartTime.toTimeString().split(' ')[0];
        console.log('🔍 Using selected slot time from frontend:', timeString);
      } else if (slot) {
        slotStartTime = new Date(slot.startTime);
        timeString = slotStartTime.toTimeString().split(' ')[0];
        console.log('🔍 Using slot time from availableSlots:', timeString);
      } else {
        // If no slot found, we'll need to extract time from slotId or use current time
        // This is a fallback for real-time availability scenarios
        slotStartTime = new Date();
        timeString = slotStartTime.toTimeString().split(' ')[0];
        console.log('⚠️ Using fallback time for booking:', timeString);
      }

      // Use the selected date from the frontend, or fallback to slot date
      let scheduledDate: string;
      if (selectedDate) {
        // Use the user's selected date
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        scheduledDate = `${year}-${month}-${day}`;
        console.log('🔍 Using selected date from frontend:', scheduledDate);
      } else {
        // Fallback to slot date
        scheduledDate = slotStartTime.toISOString().split('T')[0];
        console.log('⚠️ No selected date provided, using slot date:', scheduledDate);
      }

      // Lock the slot first (only if we have valid slot info)
      if (slot) {
        await this.lockSlot(doctorId, slotStartTime, timeString, 'current-user-id');
      }

      try {
        // Use the new enhanced booking endpoint with payment integration
        const response = await api.post('/appointments/book', {
          doctorId,
          scheduledDate: scheduledDate, // Use the properly formatted selected date
          scheduledTime: timeString,
          consultationType: type,
          paymentMethod,
          amount: amount, // Dynamic consultation fee
          symptoms: [],
          notes: '',
          emergencyContact: {
            name: '',
            phone: '',
            relationship: ''
          },
          step: 1
        });

        if (response.data.success) {
          const appointment = response.data.data.appointment;

          // If online payment, return payment data for Razorpay integration
          if (paymentMethod === 'online' && response.data.data.payment) {
            return {
              ...appointment,
              paymentData: response.data.data.payment
            };
          }

          return appointment;
        } else {
          throw new Error(response.data.message || 'Failed to book appointment');
        }
      } finally {
        // Always unlock the slot after booking attempt (only if we locked it)
        if (slot) {
          await this.unlockSlot(doctorId, slotStartTime, timeString);
        }
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      throw error;
    }
  }

  // Subscribe to appointment events
  subscribeToAppointment(appointmentId: string, callback: (event: string, data: any) => void): void {
    if (!this.isConnected) {
      console.warn('Socket not connected, cannot subscribe to appointment events');
      return;
    }

    this.socketManager.emit('appointment:join', { appointmentId });

    // Set up event listeners
    const events = [
      'appointment:status:updated',
      'appointment:message:new',
      'payment:initiated',
      'payment:verified',
      'appointment:confirmed',
      'appointment:progress:updated'
    ];

    events.forEach(event => {
      this.socketManager.on(event, (data: any) => {
        if (data.appointmentId === appointmentId) {
          callback(event, data);
        }
      });
    });
  }

  // Unsubscribe from appointment events
  unsubscribeFromAppointment(appointmentId: string): void {
    if (!this.isConnected) return;

    const events = [
      'appointment:status:updated',
      'appointment:message:new',
      'payment:initiated',
      'payment:verified',
      'appointment:confirmed',
      'appointment:progress:updated'
    ];

    events.forEach(event => {
      this.socketManager.off(event);
    });
  }

  async getMyAppointments(): Promise<Appointment[]> {
    try {
      const response = await api.get('/appointments/my');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching my appointments:', error);
      return [];
    }
  }

  async getPatientAppointments(patientId: string): Promise<Appointment[]> {
    try {
      const response = await api.get('/appointments/patient');
      return response.data.appointments || [];
    } catch (error) {
      console.error('Error fetching patient appointments:', error);
      return [];
    }
  }

  async getDoctorAppointments(filters?: {
    status?: string;
    consultationType?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    appointments: Appointment[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
    statistics: {
      total: number;
      pending: number;
      confirmed: number;
      completed: number;
      cancelled: number;
      online: number;
      offline: number;
    };
  }> {
    try {
      const params = new URLSearchParams();

      if (filters?.status) params.append('status', filters.status);
      if (filters?.consultationType) params.append('consultationType', filters.consultationType);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await api.get(`/appointments/doctor?${params.toString()}`);

      if (response.data?.success) {
        return response.data.data;
      } else {
        throw new Error(response.data?.message || 'Failed to fetch doctor appointments');
      }
    } catch (error) {
      console.error('Error fetching doctor appointments:', error);
      throw error;
    }
  }

  async getDoctorStatistics(startDate?: string, endDate?: string): Promise<any> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await api.get(`/appointments/doctor/statistics?${params.toString()}`);

      if (response.data?.success) {
        return response.data.data;
      } else {
        throw new Error(response.data?.message || 'Failed to fetch doctor statistics');
      }
    } catch (error) {
      console.error('Error fetching doctor statistics:', error);
      throw error;
    }
  }

  async updateAppointmentStatus(appointmentId: string, status: string, notes?: string): Promise<void> {
    try {
      const response = await api.put(`/appointments/${appointmentId}/status`, {
        status,
        notes
      });

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to update appointment status');
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  }

  async updateAppointmentNotes(appointmentId: string, notes: string, followUpRequired?: boolean, followUpDate?: string): Promise<void> {
    try {
      const response = await api.put(`/appointments/${appointmentId}/notes`, {
        notes,
        followUpRequired,
        followUpDate
      });

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to update appointment notes');
      }
    } catch (error) {
      console.error('Error updating appointment notes:', error);
      throw error;
    }
  }

  async cancelAppointment(appointmentId: string): Promise<void> {
    try {
      await api.put(`/appointments/${appointmentId}/cancel`);
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      throw error;
    }
  }

  async joinVideoConsultation(appointmentId: string): Promise<string> {
    try {
      const response = await api.get(`/appointments/${appointmentId}/video-link`);
      return response.data.videoLink;
    } catch (error) {
      console.error('Error getting video consultation link:', error);
      throw error;
    }
  }
}

export const appointmentService = new AppointmentService();

// Fetch real-time doctor availability and slots
export const fetchDoctorAvailability = async (doctorId: string, date?: string): Promise<any> => {
  try {
    console.log(`🔍 Fetching real-time availability for doctor ${doctorId} on date: ${date || 'today'}`);

    const params = new URLSearchParams();
    if (date) {
      params.append('date', date);
    }

    const response = await api.get(`/doctors/${doctorId}/availability?${params.toString()}`);

    if (response.data?.success) {
      console.log('✅ Doctor availability data received:', response.data.data);
      return response.data.data;
    } else {
      throw new Error(response.data?.message || 'Failed to fetch doctor availability');
    }
  } catch (error) {
    console.error('❌ Error fetching doctor availability:', error);
    throw error;
  }
};