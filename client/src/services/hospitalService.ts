import api from './api';

// Types
export interface HospitalProfile {
  _id: string;
  hospitalName: string;
  hospitalType: string;
  licenseNumber: string;
  address: string;
  phone: string;
  emergencyContact: string;
  email: string;
  description?: string;
  specialties?: string[];
  facilities?: string[];
  operatingHours?: string;
  insuranceAccepted?: string[];
  rating?: number;
  reviewCount?: number;
}

export interface HospitalDashboard {
  totalPatients: number;
  activeAdmissions: number;
  availableBeds: number;
  todayAppointments: number;
  emergencyCases: number;
  connectedUsers: number;
  connectedStaff: number;
  recentAdmissions: any[];
  upcomingAppointments: any[];
  emergencyAlerts: any[];
  departmentStats: any[];
}

export interface HospitalAppointment {
  _id: string;
  appointmentNumber: string;
  patient: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
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

export interface PatientAdmission {
  _id: string;
  admissionNumber: string;
  patient: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  admittingDoctor: {
    _id: string;
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

export interface HospitalDepartment {
  _id: string;
  name: string;
  description: string;
  departmentHead: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  staff: any[];
  capacity: {
    total: number;
    available: number;
    occupied: number;
    reserved: number;
  };
  operatingHours: string;
  emergencyServices: boolean;
  services: string[];
  equipment: string[];
  status: string;
  currentWaitTime: number;
  statistics: any;
  contactInfo: any;
  announcements: any[];
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyResponse {
  _id: string;
  emergencyNumber: string;
  caller: {
    _id: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  patient?: {
    _id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
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

export interface AdmissionRequest {
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

// Hospital Service
class HospitalService {
  // Profile Management
  async getHospitalProfile(): Promise<HospitalProfile> {
    const response = await api.get('/hospital/profile');
    return response.data;
  }

  async updateHospitalProfile(profileData: Partial<HospitalProfile>): Promise<HospitalProfile> {
    const response = await api.put('/hospital/profile', profileData);
    return response.data;
  }

  // Dashboard
  async getHospitalDashboard(): Promise<HospitalDashboard> {
    const response = await api.get('/hospital/dashboard');
    // Return the entire dashboard data, not just realTimeStats
    return response.data.data;
  }

  async getRealTimeStats(): Promise<any> {
    const response = await api.get('/hospital/stats/realtime');
    return response.data;
  }

  // Staff Management
  async getHospitalStaff(): Promise<any[]> {
    const response = await api.get('/hospital/staff');
    return response.data;
  }

  // Appointments
  async getHospitalAppointments(filters?: any): Promise<HospitalAppointment[]> {
    const response = await api.get('/hospital/appointments', { params: filters });
    return response.data;
  }

  async updateAppointmentStatus(appointmentId: string, status: string, notes?: string): Promise<HospitalAppointment> {
    const response = await api.put(`/hospital/appointments/${appointmentId}/status`, { status, notes });
    return response.data;
  }

  // Admissions
  async getHospitalAdmissions(filters?: any): Promise<PatientAdmission[]> {
    const response = await api.get('/hospital/admissions', { params: filters });
    return response.data;
  }

  async createPatientAdmission(admissionData: any): Promise<PatientAdmission> {
    const response = await api.post('/hospital/admissions', admissionData);
    return response.data;
  }

  async updateAdmissionStatus(admissionId: string, status: string, notes?: string): Promise<PatientAdmission> {
    const response = await api.put(`/hospital/admissions/${admissionId}/status`, { status, notes });
    return response.data;
  }

  // Departments
  async getHospitalDepartments(): Promise<HospitalDepartment[]> {
    const response = await api.get('/hospital/departments');
    return response.data;
  }

  async createHospitalDepartment(departmentData: any): Promise<HospitalDepartment> {
    const response = await api.post('/hospital/departments', departmentData);
    return response.data;
  }

  async updateDepartmentCapacity(departmentId: string, capacityData: any): Promise<HospitalDepartment> {
    const response = await api.put(`/hospital/departments/${departmentId}/capacity`, capacityData);
    return response.data;
  }

  // Emergencies
  async getHospitalEmergencies(filters?: any): Promise<EmergencyResponse[]> {
    const response = await api.get('/hospital/emergencies', { params: filters });
    return response.data;
  }

  async updateEmergencyStatus(emergencyId: string, status: string, notes?: string): Promise<EmergencyResponse> {
    const response = await api.put(`/hospital/emergencies/${emergencyId}/status`, { status, notes });
    return response.data;
  }

  // Profile Completion
  async getProfileCompletion(): Promise<any> {
    const response = await api.get('/hospital/profile-completion');
    return response.data;
  }

  // Admission Requests
  async getHospitalAdmissionRequests(filters?: any): Promise<AdmissionRequest[]> {
    const response = await api.get('/hospital/admission-requests', { params: filters });
    return response.data;
  }

  async reviewAdmissionRequest(requestId: string, reviewData: any): Promise<AdmissionRequest> {
    const response = await api.put(`/hospital/admission-requests/${requestId}/review`, reviewData);
    return response.data;
  }

  async getHospitalDoctors(): Promise<any[]> {
    const response = await api.get('/hospital/doctors');
    if (response.data.success) {
      return response.data.doctors || [];
    }
    return [];
  }
}

export default new HospitalService(); 