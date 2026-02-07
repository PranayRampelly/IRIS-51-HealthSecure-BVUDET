import api from './api';

// Types
export interface AvailableHospital {
  _id: string;
  hospitalName: string;
  hospitalType: string;
  location: {
    address: string;
    city?: string;
    state?: string;
    pincode?: string;
    lat?: number;
    lng?: number;
  };
  phone: string;
  emergencyContact: string;
  description?: string;
  specialties?: string[];
  facilities?: string[];
  operatingHours?: string;
  insuranceAccepted?: string[];
  rating?: number;
  reviewCount?: number;
  distance?: number;
  waitTimes?: {
    emergency: number;
    outpatient: number;
    inpatient: number;
  };
  capacity?: {
    emergency: number;
    outpatient: number;
    inpatient: number;
  };
}

export interface HospitalDetails extends AvailableHospital {
  departments: HospitalDepartment[];
  patientHistory: PatientHospitalHistory;
  currentCapacity: any;
  announcements: any[];
  emergencyServices: boolean;
  insurancePartners: string[];
  visitingHours: string;
  parkingInfo: string;
  accessibility: string[];
}

export interface HospitalDepartment {
  _id: string;
  name: string;
  description: string;
  departmentHead: {
    firstName: string;
    lastName: string;
    specialization: string;
  };
  capacity: {
    total: number;
    available: number;
    occupied: number;
  };
  currentWaitTime: number;
  services: string[];
  operatingHours: string;
  emergencyServices: boolean;
}

export interface PatientHospitalHistory {
  appointments: PatientHospitalAppointment[];
  admissions: PatientHospitalAdmission[];
  emergencyResponses: PatientEmergencyResponse[];
  ratings: HospitalRating[];
}

export interface PatientHospitalAppointment {
  _id: string;
  appointmentNumber: string;
  hospital: {
    _id: string;
    hospitalName: string;
  };
  appointmentType: string;
  department: string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  priority: string;
  symptoms?: string;
  room?: string;
  bed?: string;
  estimatedDuration: number;
  checkInTime?: string;
  checkOutTime?: string;
  actualDuration?: number;
  waitTime?: number;
  doctorNotes?: string;
  patientNotes?: string;
  paymentStatus: string;
  cost?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PatientHospitalAdmission {
  _id: string;
  admissionNumber: string;
  hospital: {
    _id: string;
    hospitalName: string;
  };
  admittingDoctor: {
    firstName: string;
    lastName: string;
    specialization: string;
  };
  admissionType: string;
  department: string;
  admissionDate: string;
  admissionTime: string;
  expectedDischargeDate?: string;
  actualDischargeDate?: string;
  status: string;
  room: string;
  bed: string;
  primaryDiagnosis: string;
  secondaryDiagnosis?: string;
  symptoms: string[];
  allergies?: string[];
  currentMedications?: string[];
  treatmentPlan?: string;
  procedures?: string[];
  vitalSigns?: any[];
  labTests?: any[];
  imaging?: any[];
  progressNotes?: any[];
  dischargePlan?: string;
  insurance?: any;
  billing?: any;
  emergencyContacts?: any[];
  consents?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface PatientEmergencyResponse {
  _id: string;
  emergencyNumber: string;
  hospital?: {
    _id: string;
    hospitalName: string;
  };
  emergencyType: string;
  priority: string;
  severity: string;
  location: {
    address: string;
    coordinates: [number, number];
  };
  symptoms: string[];
  description: string;
  status: string;
  callReceivedAt: string;
  dispatchTime?: string;
  arrivalTime?: string;
  transportTime?: string;
  hospitalArrivalTime?: string;
  assignedHospital?: string;
  assignedAmbulance?: string;
  currentLocation?: {
    address: string;
    coordinates: [number, number];
    timestamp: string;
  };
  patientInfo?: any;
  treatmentProvided?: any[];
  communications?: any[];
  hospitalCapacity?: any;
  outcome?: string;
  followUp?: string;
  qualityMetrics?: any;
  createdAt: string;
  updatedAt: string;
}

export interface HospitalRating {
  _id: string;
  hospital: string;
  rating: number;
  review: string;
  categories: {
    cleanliness: number;
    staff: number;
    treatment: number;
    facilities: number;
    communication: number;
  };
  createdAt: string;
}

export interface AppointmentBookingData {
  hospitalId: string;
  appointmentType: string;
  department: string;
  scheduledDate: string;
  scheduledTime: string;
  symptoms?: string;
  priority?: string;
  estimatedDuration?: number;
  insuranceInfo?: any;
  emergencyContact?: any;
}

export interface EmergencyRequestData {
  emergencyType: string;
  priority: string;
  severity: string;
  location: {
    address: string;
    coordinates: [number, number];
  };
  symptoms: string[];
  description: string;
  patientInfo?: any;
  emergencyContact?: any;
}

export interface HospitalMessage {
  _id: string;
  hospital: string;
  sender: string;
  message: string;
  messageType: 'text' | 'file' | 'image';
  attachments?: string[];
  read: boolean;
  createdAt: string;
}

export interface HospitalWaitTime {
  hospitalId: string;
  hospitalName: string;
  departments: {
    name: string;
    currentWaitTime: number;
    capacity: {
      total: number;
      available: number;
      occupied: number;
    };
  }[];
}

export interface AdmissionRequestData {
  hospitalId: string;
  admissionType: 'emergency' | 'elective' | 'transfer' | 'day-care';
  department: string;
  primaryDiagnosis: string;
  secondaryDiagnosis?: string;
  symptoms: string[];
  allergies?: string[];
  currentMedications?: string[];
  urgency: 'low' | 'medium' | 'high' | 'critical';
  expectedStay: number;
  roomPreference?: 'general' | 'semi-private' | 'private' | 'icu';
  specialRequirements?: string;
  insuranceProvider?: string;
  policyNumber?: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
  notes?: string;
  preferredAdmissionDate?: string;
}

export interface PatientAdmissionRequest {
  _id: string;
  requestNumber: string;
  patient: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  hospital: {
    _id: string;
    hospitalName: string;
    address: string;
  };
  admissionType: string;
  department: string;
  primaryDiagnosis: string;
  secondaryDiagnosis?: string;
  symptoms: string[];
  allergies?: string[];
  currentMedications?: string[];
  urgency: string;
  expectedStay: number;
  roomPreference?: string;
  specialRequirements?: string;
  insuranceProvider?: string;
  policyNumber?: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
  notes?: string;
  preferredAdmissionDate?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  statusHistory: {
    status: string;
    timestamp: string;
    updatedBy: string;
    notes?: string;
  }[];
  reviewNotes?: string;
  assignedDoctor?: {
    _id: string;
    firstName: string;
    lastName: string;
    specialization: string;
  };
  assignedRoom?: string;
  assignedBed?: string;
  estimatedAdmissionDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Patient Hospital Service
class PatientHospitalService {
  // Hospital Discovery
  async getAvailableHospitals(filters?: any): Promise<AvailableHospital[]> {
    const response = await api.get('/patient/hospitals', { params: filters });
    console.log('API Response:', response.data);

    // Handle different response structures
    if (response.data.data && response.data.data.hospitals) {
      return response.data.data.hospitals;
    } else if (response.data.hospitals) {
      return response.data.hospitals;
    } else if (Array.isArray(response.data)) {
      return response.data;
    } else {
      console.error('Unexpected response structure:', response.data);
      return [];
    }
  }

  async getHospitalDetails(hospitalId: string): Promise<HospitalDetails> {
    const response = await api.get(`/patient/hospitals/${hospitalId}`);
    return response.data;
  }

  // Appointments
  async bookHospitalAppointment(bookingData: AppointmentBookingData): Promise<PatientHospitalAppointment> {
    const response = await api.post('/patient/hospitals/appointments', bookingData);
    return response.data;
  }

  async getPatientHospitalAppointments(filters?: any): Promise<PatientHospitalAppointment[]> {
    const response = await api.get('/patient/hospitals/appointments', { params: filters });
    return response.data;
  }

  async cancelHospitalAppointment(appointmentId: string, reason?: string): Promise<PatientHospitalAppointment> {
    const response = await api.put(`/patient/hospitals/appointments/${appointmentId}/cancel`, { reason });
    return response.data;
  }

  // Admissions
  async getPatientHospitalAdmissions(filters?: any): Promise<PatientHospitalAdmission[]> {
    const response = await api.get('/patient/hospitals/admissions', { params: filters });
    return response.data;
  }

  // Emergency Assistance
  async requestEmergencyAssistance(emergencyData: EmergencyRequestData): Promise<PatientEmergencyResponse> {
    const response = await api.post('/patient/hospitals/emergency', emergencyData);
    return response.data;
  }

  async getPatientEmergencyResponses(filters?: any): Promise<PatientEmergencyResponse[]> {
    const response = await api.get('/patient/hospitals/emergency', { params: filters });
    return response.data;
  }

  // Communication
  async sendMessageToHospital(hospitalId: string, messageData: { message: string; messageType?: string; attachments?: string[] }): Promise<HospitalMessage> {
    const response = await api.post(`/patient/hospitals/${hospitalId}/messages`, messageData);
    return response.data;
  }

  async getHospitalMessages(hospitalId: string): Promise<HospitalMessage[]> {
    const response = await api.get(`/patient/hospitals/${hospitalId}/messages`);
    return response.data;
  }

  // Wait Times
  async getHospitalWaitTimes(hospitalIds?: string[]): Promise<HospitalWaitTime[]> {
    const response = await api.get('/patient/hospitals/wait-times', { params: { hospitalIds } });
    return response.data;
  }

  // Ratings and Reviews
  async rateHospitalExperience(hospitalId: string, ratingData: {
    rating: number;
    review: string;
    categories: {
      cleanliness: number;
      staff: number;
      treatment: number;
      facilities: number;
      communication: number;
    };
  }): Promise<HospitalRating> {
    const response = await api.post(`/patient/hospitals/${hospitalId}/ratings`, ratingData);
    return response.data;
  }

  async getPatientHospitalRatings(): Promise<HospitalRating[]> {
    const response = await api.get('/patient/hospitals/ratings');
    return response.data;
  }

  // Admission Requests
  async requestHospitalAdmission(admissionData: AdmissionRequestData): Promise<PatientHospitalAdmission> {
    const response = await api.post('/patient/admission-requests', admissionData);
    return response.data;
  }

  async getPatientAdmissionRequests(filters?: any): Promise<PatientAdmissionRequest[]> {
    const response = await api.get('/patient/admission-requests', { params: filters });
    return response.data;
  }

  async cancelAdmissionRequest(requestId: string, reason?: string): Promise<PatientAdmissionRequest> {
    const response = await api.put(`/patient/admission-requests/${requestId}/cancel`, { reason });
    return response.data;
  }
}

export default new PatientHospitalService(); 