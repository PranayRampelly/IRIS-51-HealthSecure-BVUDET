import api from './api';
import realtimeService from './realtimeService';

// Types
export interface Hospital {
  id: string;
  name: string;
  type: string;
  address: string;
  phone: string;
  email: string;
  emergencyContact: string;
  rating: number;
  description: string;
  profileImage?: string;
  realTimeData: {
    availableBeds: number;
    totalBeds: number;
    occupancyRate: number;
    activeAdmissions: number;
    connectedStaff: number;
    averageWaitTime: number;
    departments: number;
    availabilityStatus: string;
  };
  specialties: string[];
  services: string[];
  insurance: string[];
  facilities: string[];
  operatingHours: string;
  traumaLevel: string;
  coordinates: { lat: number; lng: number };
  isFavorite: boolean;
  // Additional detailed fields
  accreditations?: string[];
  certifications?: string[];
  qualityStandards?: string[];
  paymentMethods?: string[];
  emergencyServices?: {
    traumaCenter: boolean;
    strokeCenter: boolean;
    heartCenter: boolean;
    burnUnit: boolean;
    neonatalICU: boolean;
    pediatricICU: boolean;
    ambulanceService: boolean;
    helicopterService: boolean;
  };
  technology?: {
    mri: boolean;
    ctScan: boolean;
    xray: boolean;
    ultrasound: boolean;
    endoscopy: boolean;
    laparoscopy: boolean;
    roboticSurgery: boolean;
    telemedicine: boolean;
  };
  medicalStaff?: {
    doctors: number;
    nurses: number;
    specialists: number;
    technicians: number;
    supportStaff: number;
  };
  ambulanceServices?: {
    available: boolean;
    fleetSize: number;
    responseTime: string;
    coverageArea: string;
    specialEquipment: string[];
  };
}

export interface Bed {
  id: string;
  bedNumber: string;
  roomNumber: string;
  wing: string;
  bedType: string;
  status: string;
  specifications: {
    isElectric: boolean;
    hasMonitoring: boolean;
    hasVentilator: boolean;
    hasOxygen: boolean;
    hasCallButton: boolean;
    hasTV: boolean;
    hasWiFi: boolean;
    isWheelchairAccessible: boolean;
  };
  pricing: {
    dailyRate: number;
    insuranceAccepted: string[];
    selfPayDiscount: number;
  };
  currentPatient?: {
    id: string;
    name: string;
  };
  occupancyDuration: number;
  lastCleaned: Date;
  nextCleaning?: Date;
  coordinates: { x: number; y: number; floor: number };
}

export interface BedGroup {
  department: string;
  floor: number;
  beds: Bed[];
}

export interface BedAvailabilityData {
  bedGroups: BedGroup[];
  statistics: {
    total: number;
    available: number;
    occupied: number;
    reserved: number;
    maintenance: number;
    occupancyRate: number;
    availabilityRate: number;
  };
  filters: {
    hospitalId?: string;
    departmentId?: string;
    bedType?: string;
    floor?: number;
    status?: string;
  };
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  hospital?: {
    id: string;
    name: string;
    type: string;
  };
  department?: {
    id: string;
    name: string;
  };
  rating: number;
  yearsOfExperience: number;
  bio?: string;
  profileImage?: string;
  contact: {
    phone: string;
    email: string;
  };
  realTimeData: {
    isOnline: boolean;
    todayAppointments: number;
    availableSlots: number;
    availabilityPercentage: number;
    nextAvailableSlot: string;
  };
}

export interface HospitalAppointment {
  id: string;
  patient?: {
    id: string;
    name: string;
    phone: string;
    email: string;
  };
  doctor?: {
    id: string;
    name: string;
    specialization: string;
  };
  hospital?: {
    id: string;
    name: string;
    type: string;
  };
  department?: {
    id: string;
    name: string;
  };
  scheduledDate: Date;
  duration: number;
  type: string;
  status: string;
  notes?: string;
  realTimeData: {
    isPatientCheckedIn: boolean;
    isDoctorAvailable: boolean;
    waitTime: number;
    estimatedStartTime?: Date;
    actualStartTime?: Date;
    actualEndTime?: Date;
  };
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Hospital Services API Service
class HospitalServicesService {
  // Hospital Directory
  async getHospitalDirectory(params: {
    search?: string;
    type?: string;
    specialty?: string;
    rating?: number;
    distance?: number;
    availability?: string;
    insurance?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  }): Promise<{ hospitals: Hospital[]; pagination: PaginationData }> {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await api.get(`/hospital-services/directory?${queryParams}`);

      if (response.data.data) {
        return response.data.data;
      } else if (response.data.hospitals) {
        // fallback for when auth is disabled and backend returns { hospitals, pagination }
        return response.data;
      } else {
        throw new Error('Invalid response structure from server');
      }
    } catch (error) {
      console.error('Error in getHospitalDirectory:', error);
      throw error;
    }
  }

  async getHospitalDetails(hospitalId: string): Promise<Hospital> {
    try {
      console.log('Service: Fetching hospital details for ID:', hospitalId);
      const response = await api.get(`/hospital-services/hospital/${hospitalId}`);
      console.log('Service: Response received:', response.data);
      console.log('Service: Response.data.data:', response.data.data);
      console.log('Service: Response.data.success:', response.data.success);
      console.log('Service: Response status:', response.status);
      console.log('Service: Response headers:', response.headers);
      
      // Check if data is in response.data.data or response.data
      if (response.data.data) {
        return response.data.data;
      } else {
        // Fallback: return the entire response.data if it has the expected structure
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching hospital details:', error);
      throw error;
    }
  }

  // Bed Availability
  async getBedAvailability(params: {
    hospitalId?: string;
    departmentId?: string;
    bedType?: string;
    floor?: number;
    status?: string;
  }): Promise<BedAvailabilityData> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await api.get(`/hospital-services/bed-availability?${queryParams}`);
    return response.data;
  }

  // Find Doctors
  async findDoctors(params: {
    search?: string;
    specialization?: string;
    hospitalId?: string;
    departmentId?: string;
    availability?: string;
    rating?: number;
    experience?: number;
    sortBy?: string;
    page?: number;
    limit?: number;
  }): Promise<{ doctors: Doctor[]; pagination: PaginationData }> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await api.get(`/patient/hospitals/${params.hospitalId}/doctors?${queryParams}`);
    return response.data;
  }

  // Hospital Appointments
  async getHospitalAppointments(params: {
    hospitalId?: string;
    departmentId?: string;
    doctorId?: string;
    status?: string;
    date?: string;
    patientId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ appointments: HospitalAppointment[]; pagination: PaginationData }> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await api.get(`/hospital-services/appointments?${queryParams}`);
    return response.data;
  }

  // Book Hospital Appointment
  async bookHospitalAppointment(data: {
    hospitalId: string;
    departmentId?: string;
    doctorId: string;
    patientId?: string;
    scheduledDate: string;
    type?: string;
    notes?: string;
  }): Promise<{ appointment: Record<string, unknown>; message: string }> {
    const response = await api.post('/hospital-services/appointments', data);
    return response.data;
  }

  // Update Appointment Status
  async updateAppointmentStatus(
    appointmentId: string,
    data: { status: string; notes?: string }
  ): Promise<{ appointment: Record<string, unknown>; message: string }> {
    const response = await api.put(`/hospital-services/appointments/${appointmentId}/status`, data);
    return response.data;
  }

  // Real-time subscription methods with proper integration
  subscribeToHospitalUpdates(hospitalId: string, callback: (data: Record<string, unknown>) => void): () => void {
    realtimeService.onMessage('hospital-update', callback);
    return () => realtimeService.offMessage('hospital-update', callback);
  }

  subscribeToBedAvailability(hospitalId: string, callback: (data: Record<string, unknown>) => void): () => void {
    realtimeService.onMessage('bed-availability-update', callback);
    return () => realtimeService.offMessage('bed-availability-update', callback);
  }

  subscribeToDoctorAvailability(doctorId: string, callback: (data: Record<string, unknown>) => void): () => void {
    realtimeService.onMessage('doctor-availability-update', callback);
    return () => realtimeService.offMessage('doctor-availability-update', callback);
  }

  subscribeToDepartmentUpdates(departmentId: string, callback: (data: Record<string, unknown>) => void): () => void {
    realtimeService.onMessage('department-update', callback);
    return () => realtimeService.offMessage('department-update', callback);
  }

  subscribeToAppointmentUpdates(appointmentId: string, callback: (data: Record<string, unknown>) => void): () => void {
    realtimeService.onMessage('appointment-update', callback);
    return () => realtimeService.offMessage('appointment-update', callback);
  }

  subscribeToHospitalAnnouncements(hospitalId: string, callback: (data: Record<string, unknown>) => void): () => void {
    realtimeService.onMessage('hospital-announcement', callback);
    return () => realtimeService.offMessage('hospital-announcement', callback);
  }

  subscribeToEmergencyAlerts(hospitalId: string, callback: (data: Record<string, unknown>) => void): () => void {
    realtimeService.onMessage('emergency-alert', callback);
    return () => realtimeService.offMessage('emergency-alert', callback);
  }

  // Real-time event emission methods
  emitBedStatusUpdate(bedId: string, status: string, reason?: string): void {
    // Send update via socket
    realtimeService.sendUpdate('bed-status-update', { bedId, status, reason });
  }

  emitDoctorAvailabilityUpdate(doctorId: string, availability: string, reason?: string): void {
    // Send update via socket
    realtimeService.sendUpdate('doctor-availability-update', { doctorId, availability, reason });
  }

  emitDepartmentStatusUpdate(departmentId: string, status: string, waitTime: number, capacity: Record<string, unknown>): void {
    // Send update via socket
    realtimeService.sendUpdate('department-status-update', { departmentId, status, waitTime, capacity });
  }

  emitHospitalServiceUpdate(serviceId: string, status: string, availability: string, waitTime: number): void {
    // Send update via socket
    realtimeService.sendUpdate('hospital-service-update', { serviceId, status, availability, waitTime });
  }

  emitHospitalAnnouncement(title: string, message: string, priority: string, targetAudience: string): void {
    // Send update via socket
    realtimeService.sendUpdate('hospital-announcement', { title, message, priority, targetAudience });
  }

  emitEmergencyAlert(type: string, message: string, priority: string, location: string): void {
    // Send update via socket
    realtimeService.sendUpdate('emergency-alert', { type, message, priority, location });
  }

  // Utility methods
  getBedTypeDisplay(bedType: string): string {
    const typeMap: Record<string, string> = {
      'general': 'General Ward',
      'semi-private': 'Semi-Private',
      'private': 'Private Room',
      'icu': 'ICU',
      'nicu': 'NICU',
      'emergency': 'Emergency',
      'isolation': 'Isolation'
    };
    return typeMap[bedType] || bedType;
  }

  getStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      'available': 'text-green-600 bg-green-100',
      'occupied': 'text-red-600 bg-red-100',
      'reserved': 'text-yellow-600 bg-yellow-100',
      'maintenance': 'text-orange-600 bg-orange-100',
      'cleaning': 'text-blue-600 bg-blue-100',
      'out-of-service': 'text-gray-600 bg-gray-100'
    };
    return colorMap[status] || 'text-gray-600 bg-gray-100';
  }

  getAvailabilityColor(availability: string): string {
    const colorMap: Record<string, string> = {
      'available': 'text-green-600 bg-green-100',
      'limited': 'text-yellow-600 bg-yellow-100',
      'unavailable': 'text-red-600 bg-red-100'
    };
    return colorMap[availability] || 'text-gray-600 bg-gray-100';
  }

  formatWaitTime(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    } else if (minutes < 1440) { // Less than 24 hours
      const hours = Math.floor(minutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(minutes / 1440);
      return `${days} day${days > 1 ? 's' : ''}`;
    }
  }

  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    // Haversine formula for calculating distance between two points
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

const hospitalServicesService = new HospitalServicesService();
export default hospitalServicesService; 