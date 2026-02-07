import { ApiService } from '@/lib/api';

const api = new ApiService();

export interface InsuranceClaim {
  id: string;
  claimNumber: string;
  status: 'draft' | 'submitted' | 'pending' | 'approved' | 'rejected';
  priority?: 'low' | 'medium' | 'high';
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    ssn?: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  employmentInfo: {
    employer?: string;
    jobTitle?: string;
    employmentStatus?: string;
    annualIncome?: number;
  };
  healthInfo: {
    height?: number;
    weight?: number;
    tobaccoUse?: string;
    preExistingConditions?: string;
    currentMedications?: string;
    familyHistory?: string;
  };
  coverageInfo: {
    startDate: string;
    coverageAmount: number;
    selectedPlan: string;
    riders: string[];
  };
  dependents?: Array<{
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    relationship: string;
    ssn?: string;
  }>;
  documents: Array<{
    id: string;
    name: string;
    type: string;
    cloudinaryUrl: string;
    uploadedAt: string;
    status: 'pending' | 'verified';
  }>;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  lastSavedAt?: string;
  isDraft: boolean;
  // Additional properties for display
  _id?: string;
  claimId?: string;
  patientName?: string;
  patientEmail?: string;
  providerName?: string;
  approvedAmount?: number;
  reviewNotes?: string;
}

class InsuranceClaimService {
  // Save draft
  async saveDraft(data: Partial<InsuranceClaim>) {
    try {
      const response = await api.post('/insurance/claims/draft', data);
      return response.data;
    } catch (error) {
      console.error('Error saving draft:', error);
      throw error;
    }
  }

  // Submit claim
  async submitClaim(claimId: string, data: Partial<InsuranceClaim>) {
    try {
      const response = await api.post('/insurance/claims/submit', {
        claimId,
        ...data
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting claim:', error);
      throw error;
    }
  }

  // Upload document
  async uploadDocument(claimId: string, file: File, name: string, type: string) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', name);
      formData.append('type', type);

      const response = await api.post(
        `/insurance/claims/${claimId}/documents`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  // Delete document
  async deleteDocument(claimId: string, documentId: string) {
    try {
      const response = await api.delete(
        `/insurance/claims/${claimId}/documents/${documentId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  // Get claim by ID
  async getClaimById(claimId: string) {
    try {
      const response = await api.get(`/insurance/claims/${claimId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching claim:', error);
      throw error;
    }
  }

  // Get user's claims with pagination and filters
  async getClaims(params?: {
    status?: string;
    page?: number;
    limit?: number;
    search?: string;
    claimType?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    try {
      // Decide endpoint based on role
      // - admin and insurance staff use the aggregated endpoint (server filters scope)
      // - patients use the per-user endpoint
      let endpoint = '/insurance/claims';
      try {
        const storedUser = localStorage.getItem('user');
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;
        if (parsedUser?.role === 'admin' || parsedUser?.role === 'insurance') {
          endpoint = '/insurance/claims/all';
        }
      } catch {}

      const response = await api.get(endpoint, { params });

      // Normalize response shape so consumers can always expect { data: { claims, statistics, pagination } }
      if (endpoint === '/insurance/claims/all') {
        // Backend already returns the normalized shape
        return response.data;
      }

      const claims = Array.isArray(response.data?.data)
        ? response.data.data
        : Array.isArray(response.data)
          ? response.data
          : [];

      return {
        success: true,
        data: {
          claims,
          statistics: {
            pending: 0,
            approved: 0,
            rejected: 0,
            totalValue: 0
          },
          pagination: {
            currentPage: params?.page || 1,
            totalPages: 1,
            totalClaims: claims.length,
            hasNext: false,
            hasPrev: false
          }
        }
      } as any;
    } catch (error) {
      console.error('Error fetching claims:', error);
      throw error;
    }
  }

  // Helper functions
  getStatusColor(status: InsuranceClaim['status']) {
    switch (status) {
      case 'approved':
        return 'bg-health-success text-white';
      case 'rejected':
        return 'bg-health-danger text-white';
      case 'pending':
        return 'bg-health-warning text-white';
      case 'submitted':
        return 'bg-health-info text-white';
      case 'draft':
        return 'bg-health-blue-gray text-white';
      default:
        return 'bg-health-blue-gray text-white';
    }
  }

  getPriorityColor(priority: string) {
    switch (priority) {
      case 'high':
        return 'bg-health-danger text-white';
      case 'medium':
        return 'bg-health-warning text-white';
      case 'low':
        return 'bg-health-success text-white';
      default:
        return 'bg-health-blue-gray text-white';
    }
  }

  formatAmount(amount: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  getClaimTypeDisplay(claimType: string) {
    const types = {
      'medical': 'Medical',
      'dental': 'Dental',
      'vision': 'Vision',
      'pharmacy': 'Pharmacy',
      'mental_health': 'Mental Health'
    };
    return types[claimType] || claimType;
  }
}

export default new InsuranceClaimService();
