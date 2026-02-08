import apiService from './api';

export interface InsuranceApplication {
  _id: string;
  applicationNumber: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'pending_documents';
  policyId: string;
  applicant: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    ssn: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  employment: {
    employer: string;
    jobTitle: string;
    employmentStatus: string;
    annualIncome: number;
  };
  health: {
    height: string;
    weight: string;
    tobaccoUse: string;
    preExistingConditions: string;
    currentMedications: string;
    familyHistory: string;
  };
  dependents: Array<{
    _id?: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    relationship: string;
    ssn: string;
  }>;
  coverage: {
    startDate: string;
    coverageAmount: number;
    riders: string[];
  };
  documents: Array<{
    _id: string;
    name: string;
    originalName: string;
    type: string;
    size: number;
    url: string;
    cloudinaryId: string;
    documentType: string;
    uploadedAt: string;
  }>;
  submittedAt?: string;
  reviewedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  patientId: string;
  reviewedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationFilters {
  status?: string;
  page?: number;
  limit?: number;
}

export interface ApplicationStatistics {
  total: number;
  draft: number;
  submitted: number;
  under_review: number;
  approved: number;
  rejected: number;
  pending_documents: number;
}

class InsuranceApplicationService {
  // Get available policies for application
  async getAvailablePolicies() {
    try {
      console.log('Calling API for available policies...');

      // Use relative URL so it works in all envs (Vite proxy → backend on 5000)
      // Add cache-busting parameter to force fresh request
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/insurance/applications/policies/available?_t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = await response.json();
      // Controller wraps data as { success, data }
      const policies = json?.data || json;
      return policies;
    } catch (error) {
      console.error('Error fetching available policies:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }

  // Create new application
  async createApplication(applicationData: Partial<InsuranceApplication>) {
    try {
      const response = await apiService.post('/insurance/applications/applications', applicationData);
      return response.data;
    } catch (error) {
      console.error('Error creating application:', error);
      throw error;
    }
  }

  // Get user's applications
  async getUserApplications(filters: ApplicationFilters = {}) {
    try {
      const response = await apiService.get('/insurance/applications/applications', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching user applications:', error);
      throw error;
    }
  }

  // Get application by ID
  async getApplicationById(id: string) {
    try {
      const response = await apiService.get(`/insurance/applications/applications/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching application:', error);
      throw error;
    }
  }

  // Update application
  async updateApplication(id: string, updateData: Partial<InsuranceApplication>) {
    try {
      const response = await apiService.put(`/insurance/applications/applications/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating application:', error);
      throw error;
    }
  }

  // Submit application
  async submitApplication(id: string) {
    try {
      const response = await apiService.post(`/insurance/applications/applications/${id}/submit`);
      return response.data;
    } catch (error) {
      console.error('Error submitting application:', error);
      throw error;
    }
  }

  // Upload application documents
  async uploadApplicationDocuments(id: string, file: File, documentType: string = 'application_document') {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);

      const response = await apiService.post(`/insurance/applications/applications/${id}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading application document:', error);
      throw error;
    }
  }

  // Delete application document
  async deleteApplicationDocument(id: string, documentId: string) {
    try {
      const response = await apiService.delete(`/insurance/applications/applications/${id}/documents/${documentId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting application document:', error);
      throw error;
    }
  }

  // Get application statistics
  async getApplicationStatistics() {
    try {
      const response = await apiService.get('/insurance/applications/applications/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching application statistics:', error);
      throw error;
    }
  }

  // Get applications by policy ID
  async getApplicationsByPolicyId(policyId: string, filters: ApplicationFilters = {}) {
    try {
      const response = await apiService.get(`/insurance/applications/applications/policy/${policyId}`, { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching applications by policy ID:', error);
      throw error;
    }
  }

  // Get all applications (for insurance dashboard)
  async getAllApplications(filters: ApplicationFilters = {}) {
    try {
      const response = await apiService.get('/insurance/applications/applications/all', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching all applications:', error);
      throw error;
    }
  }

  // Approve application
  async approveApplication(id: string, approvalData?: any) {
    try {
      const response = await apiService.post(`/insurance/applications/applications/${id}/approve`, approvalData);
      return response.data;
    } catch (error) {
      console.error('Error approving application:', error);
      throw error;
    }
  }

  // Reject application
  async rejectApplication(id: string, rejectionData: { reason: string }) {
    try {
      const response = await apiService.post(`/insurance/applications/applications/${id}/reject`, rejectionData);
      return response.data;
    } catch (error) {
      console.error('Error rejecting application:', error);
      throw error;
    }
  }

  // Request additional documents
  async requestDocuments(id: string, requestData: { documents: string[]; message?: string }) {
    try {
      const response = await apiService.post(`/insurance/applications/applications/${id}/request-documents`, requestData);
      return response.data;
    } catch (error) {
      console.error('Error requesting documents:', error);
      throw error;
    }
  }

  // Export applications
  async exportApplications(filters: ApplicationFilters = {}) {
    try {
      const response = await apiService.get('/insurance/applications/applications/export', {
        params: { ...filters, export: true },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting applications:', error);
      throw error;
    }
  }
}

export default new InsuranceApplicationService(); 