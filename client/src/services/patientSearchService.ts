import apiService from './api.js';

export interface PatientSearchResult {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  profilePicture?: string;
  cloudinaryId?: string;
  insurancePolicies?: Array<{
    _id: string;
    policyNumber: string;
    policyType: string;
    status: string;
    coverageAmount: number;
    premium: {
      amount: number;
      frequency: string;
    };
  }>;
  healthRecords?: Array<{
    _id: string;
    recordType: string;
    date: string;
    status: string;
  }>;
  lastVisit?: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  updatedAt: string;
}

export interface PatientSearchFilters {
  searchTerm?: string;
  policyType?: string;
  status?: string;
  lastVisitAfter?: string;
  hasActivePolicy?: boolean;
  limit?: number;
  page?: number;
}

export interface PatientSearchResponse {
  patients: PatientSearchResult[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

class PatientSearchService {
  // Search patients with dynamic filters
  async searchPatients(filters: PatientSearchFilters = {}): Promise<PatientSearchResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.searchTerm) params.append('search', filters.searchTerm);
      if (filters.policyType) params.append('policyType', filters.policyType);
      if (filters.status) params.append('status', filters.status);
      if (filters.lastVisitAfter) params.append('lastVisitAfter', filters.lastVisitAfter);
      if (filters.hasActivePolicy !== undefined) params.append('hasActivePolicy', filters.hasActivePolicy.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.page) params.append('page', filters.page.toString());

      const response = await apiService.get(`/insurance/patients/search?${params.toString()}`);
      return response.data || response;
    } catch (error) {
      console.error('Error searching patients:', error);
      throw error;
    }
  }

  // Get patient by ID with full details
  async getPatientById(patientId: string): Promise<PatientSearchResult> {
    try {
      const response = await apiService.get(`/insurance/patients/${patientId}`);
      return response.data || response;
    } catch (error) {
      console.error('Error fetching patient details:', error);
      throw error;
    }
  }

  // Get patient's insurance policies
  async getPatientPolicies(patientId: string): Promise<any[]> {
    try {
      const response = await apiService.get(`/insurance/patients/${patientId}/policies`);
      return response.data?.policies || response.policies || [];
    } catch (error) {
      console.error('Error fetching patient policies:', error);
      return [];
    }
  }

  // Get patient's health records summary
  async getPatientHealthSummary(patientId: string): Promise<any> {
    try {
      const response = await apiService.get(`/insurance/patients/${patientId}/health-summary`);
      return response.data || response;
    } catch (error) {
      console.error('Error fetching patient health summary:', error);
      return {};
    }
  }

  // Upload patient document to Cloudinary
  async uploadPatientDocument(patientId: string, file: File, documentType: string): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);
      formData.append('patientId', patientId);

      const response = await apiService.post(`/insurance/patients/${patientId}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data || response;
    } catch (error) {
      console.error('Error uploading patient document:', error);
      throw error;
    }
  }

  // Get patient's recent activity
  async getPatientActivity(patientId: string, limit: number = 10): Promise<any[]> {
    try {
      const response = await apiService.get(`/insurance/patients/${patientId}/activity?limit=${limit}`);
      return response.data?.activities || response.activities || [];
    } catch (error) {
      console.error('Error fetching patient activity:', error);
      return [];
    }
  }

  // Search patients by insurance policy
  async searchPatientsByPolicy(policyNumber: string): Promise<PatientSearchResult[]> {
    try {
      const response = await apiService.get(`/insurance/patients/policy/${policyNumber}`);
      return response.data?.patients || response.patients || [];
    } catch (error) {
      console.error('Error searching patients by policy:', error);
      return [];
    }
  }

  // Get patient statistics for insurance dashboard
  async getPatientStatistics(): Promise<any> {
    try {
      const response = await apiService.get('/insurance/patients/statistics');
      return response.data || response;
    } catch (error) {
      console.error('Error fetching patient statistics:', error);
      return {};
    }
  }
}

export default new PatientSearchService();


