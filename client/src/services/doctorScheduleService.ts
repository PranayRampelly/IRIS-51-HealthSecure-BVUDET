import api from './api';

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number | null;
  gender: string;
  lastVisit: string | null;
}

export interface TimeSlot {
  time: string;
  endTime: string;
  available: boolean;
  bookedBy?: string | null;
  appointmentId?: string | null;
}

export interface Appointment {
  id: string;
  patientName: string;
  patientId: string;
  patientEmail?: string;
  patientPhone?: string;
  date: string;
  time: string;
  endTime: string;
  type: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
  consultationType: 'online' | 'in-person';
  estimatedDuration?: number;
  cost?: any;
}

export interface ScheduleStats {
  today: {
    total: number;
    confirmed: number;
    pending: number;
    inProgress: number;
  };
  week: {
    total: number;
    confirmed: number;
    pending: number;
  };
  month: {
    total: number;
    confirmed: number;
    pending: number;
  };
}

export interface ScheduleOverview {
  stats: ScheduleStats;
  todayAppointments: Appointment[];
}

export interface CalendarData {
  [date: string]: {
    id: string;
    time: string;
    type: string;
    status: string;
  }[];
}

class DoctorScheduleService {
  // Get doctor's schedule overview (dashboard stats)
  async getScheduleOverview(): Promise<ScheduleOverview> {
    try {
      const response = await api.get('/doctor/schedule/overview');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching schedule overview:', error);
      throw error;
    }
  }

  // Get appointments for a specific date
  async getAppointmentsForDate(date: string): Promise<Appointment[]> {
    try {
      const response = await api.get(`/doctor/schedule/appointments/${date}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching appointments for date:', error);
      throw error;
    }
  }

  // Get available time slots for a specific date
  async getTimeSlotsForDate(date: string): Promise<TimeSlot[]> {
    try {
      const response = await api.get(`/doctor/schedule/time-slots/${date}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching time slots for date:', error);
      throw error;
    }
  }

  // Get all patients for the doctor
  async getPatients(search?: string): Promise<Patient[]> {
    try {
      const params = search ? { search } : {};
      const response = await api.get('/doctor/schedule/patients', { params });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  }

  // Schedule a new appointment
  async scheduleAppointment(appointmentData: {
    patientId: string;
    date: string;
    startTime: string;
    appointmentType: string;
    consultationType: 'online' | 'in-person';
    notes?: string;
    estimatedDuration?: number;
  }): Promise<Appointment> {
    try {
      const response = await api.post('/doctor/schedule/schedule', appointmentData);
      return response.data.data;
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      throw error;
    }
  }

  // Update appointment status
  async updateAppointmentStatus(
    appointmentId: string, 
    status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled',
    notes?: string
  ): Promise<Appointment> {
    try {
      const response = await api.patch(`/doctor/schedule/appointments/${appointmentId}/status`, {
        status,
        notes
      });
      return response.data.data;
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  }

  // Cancel appointment
  async cancelAppointment(appointmentId: string): Promise<{ id: string; patientName: string; status: string }> {
    try {
      const response = await api.delete(`/doctor/schedule/appointments/${appointmentId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      throw error;
    }
  }

  // Get calendar data for a month
  async getCalendarData(year: number, month: number): Promise<CalendarData> {
    try {
      const response = await api.get(`/doctor/schedule/calendar/${year}/${month}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      throw error;
    }
  }

  // Helper method to format date for API calls
  formatDateForAPI(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Helper method to format time for display
  formatTimeForDisplay(time: string): string {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  // Helper method to get appointment type label
  getAppointmentTypeLabel(type: string): string {
    const typeLabels: { [key: string]: string } = {
      'consultation': 'General Consultation',
      'follow_up': 'Follow-up Visit',
      'emergency': 'Emergency Visit',
      'procedure': 'Medical Procedure',
      'checkup': 'Routine Checkup'
    };
    return typeLabels[type] || type;
  }

  // Helper method to get status badge color
  getStatusBadgeColor(status: string): string {
    const statusColors: { [key: string]: string } = {
      'confirmed': 'bg-green-100 text-green-800',
      'pending': 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-gray-100 text-gray-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  }

  // Helper method to check if a date has appointments
  async hasAppointmentsOnDate(date: Date): Promise<boolean> {
    try {
      const appointments = await this.getAppointmentsForDate(this.formatDateForAPI(date));
      return appointments.length > 0;
    } catch (error) {
      console.error('Error checking appointments for date:', error);
      return false;
    }
  }

  // Helper method to get available slots count for a date
  async getAvailableSlotsCount(date: Date): Promise<number> {
    try {
      const timeSlots = await this.getTimeSlotsForDate(this.formatDateForAPI(date));
      return timeSlots.filter(slot => slot.available).length;
    } catch (error) {
      console.error('Error getting available slots count:', error);
      return 0;
    }
  }
}

const doctorScheduleService = new DoctorScheduleService();
export default doctorScheduleService;
