import api from '../lib/api';

export interface Patient {
  _id: string;
  patientId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  bloodType?: string;
  phone: string;
  email: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  emergencyContacts: Array<{
    name: string;
    relationship: string;
    phone: string;
    email: string;
    isPrimary: boolean;
  }>;
  primaryDiagnosis: string;
  secondaryDiagnosis: string[];
  allergies: string[];
  currentMedications: Array<{
    medication: string;
    dosage: string;
    frequency: string;
    startDate: string;
    endDate: string;
    prescribedBy: string;
  }>;
  hospital: string;
  department: string;
  roomNumber?: string;
  bedNumber?: string;
  admissionDate: string;
  expectedDischargeDate?: string;
  actualDischargeDate?: string;
  admittingDoctor: {
    _id: string;
    firstName: string;
    lastName: string;
    specialization: string;
  };
  status: 'active' | 'critical' | 'discharged' | 'pending' | 'transferred';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  vitalSigns: Array<{
    timestamp: string;
    bloodPressure: string;
    heartRate: string;
    temperature: string;
    respiratoryRate: string;
    oxygenSaturation: string;
    weight: string;
    height: string;
    recordedBy: string;
  }>;
  treatmentPlan?: string;
  procedures: Array<{
    name: string;
    date: string;
    performedBy: string;
    notes: string;
    status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  }>;
  labTests: Array<{
    testName: string;
    orderedDate: string;
    performedDate?: string;
    results?: string;
    status: 'ordered' | 'in-progress' | 'completed' | 'cancelled';
    orderedBy: string;
  }>;
  imaging: Array<{
    type: string;
    orderedDate: string;
    performedDate?: string;
    results?: string;
    status: 'ordered' | 'in-progress' | 'completed' | 'cancelled';
    orderedBy: string;
  }>;
  progressNotes: Array<{
    date: string;
    note: string;
    writtenBy: string;
    category: 'nursing' | 'medical' | 'consultation' | 'discharge';
  }>;
  insurance?: {
    provider: string;
    policyNumber: string;
    groupNumber: string;
    coverage: number;
    deductible: number;
    copay: number;
  };
  billing: {
    roomCharges: number;
    medicationCharges: number;
    procedureCharges: number;
    labCharges: number;
    imagingCharges: number;
    totalCharges: number;
    insuranceCoverage: number;
    patientResponsibility: number;
    paymentStatus: 'pending' | 'partial' | 'paid' | 'insurance-pending';
  };
  dischargePlan?: {
    dischargeDate: string;
    dischargeType: 'home' | 'rehabilitation' | 'nursing-home' | 'transfer' | 'hospice';
    followUpAppointment?: string;
    followUpDoctor?: string;
    homeCareInstructions?: string;
    medications: Array<{
      medication: string;
      dosage: string;
      frequency: string;
      duration: string;
      instructions: string;
    }>;
    restrictions: string[];
    activities: string[];
  };
  consents: Array<{
    type: string;
    date: string;
    signedBy: string;
    witness: string;
    isActive: boolean;
  }>;
  statusHistory: Array<{
    status: string;
    timestamp: string;
    updatedBy: string;
    notes?: string;
  }>;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  updatedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PatientStats {
  total: number;
  active: number;
  critical: number;
  discharged: number;
  pending: number;
  transferred: number;
}

export interface PatientListResponse {
  patients: Patient[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalPatients: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  stats: PatientStats;
}

export interface AnalyticsData {
  patientStats: {
    totalPatients: number;
    activePatients: number;
    criticalPatients: number;
    dischargedPatients: number;
    pendingPatients: number;
  };
  departmentStats: Array<{
    _id: string;
    count: number;
    activeCount: number;
    criticalCount: number;
  }>;
  admissionsOverTime: Array<{
    _id: string;
    count: number;
  }>;
  dischargesOverTime: Array<{
    _id: string;
    count: number;
  }>;
  avgLengthOfStay: {
    avgLengthOfStay: number;
    minLengthOfStay: number;
    maxLengthOfStay: number;
  };
  priorityStats: Array<{
    _id: string;
    count: number;
  }>;
  doctorPerformance: Array<{
    doctorName: string;
    specialization: string;
    patientCount: number;
    activePatients: number;
    dischargedPatients: number;
  }>;
  bedUtilization: Array<{
    _id: string;
    occupiedBeds: number;
  }>;
  revenueStats: {
    totalRevenue: number;
    avgRevenuePerPatient: number;
    totalInsuranceCoverage: number;
    totalPatientResponsibility: number;
  };
  monthlyTrends: Array<{
    _id: {
      year: number;
      month: number;
    };
    admissions: number;
    discharges: number;
    revenue: number;
  }>;
}

export interface Department {
  _id: string;
  name: string;
  description: string;
  departmentHead?: {
    _id: string;
    firstName: string;
    lastName: string;
    specialization: string;
  };
  staff: Array<{
    doctor: {
      _id: string;
      firstName: string;
      lastName: string;
      specialization: string;
    };
    role: string;
  }>;
}

export interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  specialization: string;
  department: string;
  phone: string;
  email: string;
}

export interface HospitalSettings {
  hospital: {
    name: string;
    type: string;
    location: any;
    phone: string;
    email: string;
    emergencyContact: string;
    rating: number;
    isActive: boolean;
  };
  departments: Department[];
  doctors: Doctor[];
  preferences: {
    patientIdFormat: string;
    defaultAdmissionType: string;
    autoGeneratePatientId: boolean;
    requireInsuranceInfo: boolean;
    requireEmergencyContact: boolean;
    enableVitalSignsTracking: boolean;
    enableProgressNotes: boolean;
    enableBillingTracking: boolean;
    enableDischargePlanning: boolean;
    notificationSettings: {
      newPatientAdmission: boolean;
      patientStatusChange: boolean;
      criticalPatientAlert: boolean;
      dischargeNotification: boolean;
      billingUpdates: boolean;
    };
  };
}

class HospitalPatientService {
  // Get all patients with filtering and pagination
  async getPatients(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    department?: string;
    priority?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PatientListResponse> {
    const response = await api.get('/hospital/patients', { params });
    return response.data;
  }

  // Get single patient details
  async getPatient(id: string): Promise<{ success: boolean; data: Patient }> {
    const response = await api.get(`/hospital/patients/${id}`);
    return response.data;
  }

  // Add new patient
  async addPatient(patientData: Partial<Patient>): Promise<{ success: boolean; message: string; data: Patient }> {
    const response = await api.post('/hospital/patients', patientData);
    return response.data;
  }

  // Update patient
  async updatePatient(id: string, updateData: Partial<Patient>): Promise<{ success: boolean; message: string; data: Patient }> {
    const response = await api.put(`/hospital/patients/${id}`, updateData);
    return response.data;
  }

  // Update patient status
  async updatePatientStatus(id: string, status: string, notes?: string): Promise<{ success: boolean; message: string; data: Patient }> {
    const response = await api.patch(`/hospital/patients/${id}/status`, { status, notes });
    return response.data;
  }

  // Add progress note
  async addProgressNote(id: string, note: string, category: string = 'medical'): Promise<{ success: boolean; message: string; data: Patient }> {
    const response = await api.post(`/hospital/patients/${id}/notes`, { note, category });
    return response.data;
  }

  // Add vital signs
  async addVitalSigns(id: string, vitals: any): Promise<{ success: boolean; message: string; data: Patient }> {
    const response = await api.post(`/hospital/patients/${id}/vitals`, vitals);
    return response.data;
  }

  // Discharge patient
  async dischargePatient(id: string, dischargeData: any): Promise<{ success: boolean; message: string; data: Patient }> {
    const response = await api.post(`/hospital/patients/${id}/discharge`, dischargeData);
    return response.data;
  }

  // Delete patient (soft delete)
  async deletePatient(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/hospital/patients/${id}`);
    return response.data;
  }

  // Get patient analytics
  async getPatientAnalytics(period: string = '30'): Promise<{ success: boolean; data: any }> {
    const response = await api.get('/hospital/patients/analytics', { params: { period } });
    return response.data;
  }

  // Export patient data
  async exportPatientData(params: { format?: string; status?: string; department?: string }): Promise<any> {
    const response = await api.get('/hospital/patients/export', { 
      params,
      responseType: params.format === 'csv' ? 'blob' : 'json'
    });
    return response.data;
  }

  // Get hospital departments
  async getDepartments(): Promise<{ success: boolean; data: Department[] }> {
    const response = await api.get('/hospital/patients/departments');
    return response.data;
  }

  // Get hospital doctors
  async getDoctors(department?: string): Promise<{ success: boolean; data: Doctor[] }> {
    const response = await api.get('/hospital/patients/doctors', { params: { department } });
    return response.data;
  }

  // Get comprehensive hospital analytics
  async getHospitalAnalytics(period: string = '30'): Promise<{ success: boolean; data: AnalyticsData }> {
    const response = await api.get('/hospital/analytics', { params: { period } });
    return response.data;
  }

  // Get department-specific analytics
  async getDepartmentAnalytics(departmentId: string, period: string = '30'): Promise<{ success: boolean; data: any }> {
    const response = await api.get(`/hospital/analytics/departments/${departmentId}`, { params: { period } });
    return response.data;
  }

  // Get doctor performance analytics
  async getDoctorAnalytics(doctorId: string, period: string = '30'): Promise<{ success: boolean; data: any }> {
    const response = await api.get(`/hospital/analytics/doctors/${doctorId}`, { params: { period } });
    return response.data;
  }

  // Get revenue analytics
  async getRevenueAnalytics(period: string = '30'): Promise<{ success: boolean; data: any }> {
    const response = await api.get('/hospital/analytics/revenue', { params: { period } });
    return response.data;
  }

  // Get hospital settings
  async getHospitalSettings(): Promise<{ success: boolean; data: HospitalSettings }> {
    const response = await api.get('/hospital/settings');
    return response.data;
  }

  // Update hospital settings
  async updateHospitalSettings(settings: any): Promise<{ success: boolean; message: string; data: any }> {
    const response = await api.put('/hospital/settings', settings);
    return response.data;
  }

  // Get department settings
  async getDepartmentSettings(): Promise<{ success: boolean; data: Department[] }> {
    const response = await api.get('/hospital/settings/departments');
    return response.data;
  }

  // Update department settings
  async updateDepartmentSettings(departmentId: string, settings: any): Promise<{ success: boolean; message: string; data: any }> {
    const response = await api.put(`/hospital/settings/departments/${departmentId}`, settings);
    return response.data;
  }

  // Get notification settings
  async getNotificationSettings(): Promise<{ success: boolean; data: any }> {
    const response = await api.get('/hospital/settings/notifications');
    return response.data;
  }

  // Update notification settings
  async updateNotificationSettings(settings: any): Promise<{ success: boolean; message: string; data: any }> {
    const response = await api.put('/hospital/settings/notifications', settings);
    return response.data;
  }

  // Get system preferences
  async getSystemPreferences(): Promise<{ success: boolean; data: any }> {
    const response = await api.get('/hospital/settings/preferences');
    return response.data;
  }

  // Update system preferences
  async updateSystemPreferences(preferences: any): Promise<{ success: boolean; message: string; data: any }> {
    const response = await api.put('/hospital/settings/preferences', preferences);
    return response.data;
  }

  // Get security settings
  async getSecuritySettings(): Promise<{ success: boolean; data: any }> {
    const response = await api.get('/hospital/settings/security');
    return response.data;
  }

  // Update security settings
  async updateSecuritySettings(settings: any): Promise<{ success: boolean; message: string; data: any }> {
    const response = await api.put('/hospital/settings/security', settings);
    return response.data;
  }

  // Helper method to download CSV file
  async downloadPatientData(params: { format?: string; status?: string; department?: string }): Promise<void> {
    try {
      const data = await this.exportPatientData({ ...params, format: 'csv' });
      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `patients_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading patient data:', error);
      throw error;
    }
  }
}

export default new HospitalPatientService(); 