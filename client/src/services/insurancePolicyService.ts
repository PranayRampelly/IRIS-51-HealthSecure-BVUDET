import apiService from './api';

export interface PolicyDocument {
  _id?: string;
  name: string;
  originalName: string;
  type: string;
  size: number;
  url: string;
  cloudinaryId?: string;
  documentType: 'policy_document' | 'terms_conditions' | 'coverage_details' | 'claim_procedures' | 'network_providers' | 'other';
  uploadedAt: string;
  status: 'active' | 'archived' | 'expired';
}

export interface NetworkProvider {
  name: string;
  type: 'Hospital' | 'Clinic' | 'Laboratory' | 'Pharmacy' | 'Other';
  location?: {
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
}

export interface CoverageService {
  name: string;
  description?: string;
  coveragePercentage: number;
  limits?: string;
  waitingPeriod?: number;
}

export interface CoverageDetails {
  services: CoverageService[];
  exclusions: string[];
  networkType: 'PPO' | 'HMO' | 'EPO' | 'POS' | 'HDHP' | 'Other';
}

export interface EligibilityCriteria {
  minAge: number;
  maxAge: number;
  preExistingConditions: boolean;
  waitingPeriod: number;
  requiredDocuments: string[];
}

export interface Premium {
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'semi-annual' | 'annual';
  nextDueDate?: string;
}

export interface InsurancePolicy {
  _id?: string;
  policyNumber: string;
  policyName: string;
  policyType: 'Health' | 'Dental' | 'Vision' | 'Life' | 'Disability' | 'Travel' | 'Critical Illness' | 'Accident' | 'Auto';
  description: string;
  coverageAmount: number;
  deductible: number;
  coinsurance: number;
  copay: number;
  outOfPocketMax: number;
  premium: Premium;
  startDate: string;
  endDate: string;
  renewalDate?: string;
  status: 'active' | 'draft' | 'inactive' | 'expired' | 'cancelled' | 'pending_approval';
  isPublic: boolean;
  availableForNewEnrollments: boolean;
  eligibilityCriteria: EligibilityCriteria;
  coverageDetails: CoverageDetails;
  networkProviders: NetworkProvider[];
  documents: PolicyDocument[];
  tags: string[];
  notes?: string;
  createdBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  updatedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  approvedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  approvalDate?: string;
  enrollmentCount: number;
  claimCount: number;
  averageClaimAmount: number;
  createdAt?: string;
  updatedAt?: string;
  policyAge?: number;
  remainingDays?: number;
  utilizationRate?: number;
}

export interface PolicyFilters {
  page?: number;
  limit?: number;
  status?: string;
  policyType?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  isPublic?: boolean;
}

export interface PolicyResponse {
  policies: InsurancePolicy[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalPolicies: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  statistics: unknown;
}

export interface PolicyStatistics {
  [key: string]: {
    count: number;
    totalPremium: number;
    avgCoverageAmount: number;
    totalEnrollments: number;
    totalClaims: number;
  };
}

class InsurancePolicyService {
  async getPolicies(filters: PolicyFilters = {}) {
    try {
      const response = await apiService.get('/insurance/policies', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching policies:', error);
      // Return empty data on error
      return {
        policies: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalPolicies: 0,
          hasNext: false,
          hasPrev: false
        },
        statistics: {}
      };
    }
  }

  async createPolicy(policyData: Partial<InsurancePolicy>) {
    try {
      const response = await apiService.post('/insurance/policies', policyData);
      return response.data;
    } catch (error) {
      console.error('Error creating policy:', error);
      throw error;
    }
  }

  async updatePolicy(policyId: string, updateData: Partial<InsurancePolicy>) {
    try {
      const response = await apiService.put(`/insurance/policies/${policyId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating policy:', error);
      throw error;
    }
  }

  async deletePolicy(policyId: string) {
    try {
      const response = await apiService.delete(`/insurance/policies/${policyId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting policy:', error);
      throw error;
    }
  }

  async getPolicyStatistics() {
    try {
      const response = await apiService.get('/insurance/policies/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching policy statistics:', error);
      throw error;
    }
  }

  async getPolicyAnalytics(period: string = '12months') {
    try {
      const response = await apiService.get(`/insurance/policies/analytics?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching policy analytics:', error);
      throw error;
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'expired':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  }

  getPolicyTypeIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'health':
        return '❤️';
      case 'dental':
        return '🦷';
      case 'vision':
        return '👁️';
      case 'life':
        return '🛡️';
      case 'disability':
        return '♿';
      case 'mental health':
        return '🧠';
      case 'maternity':
        return '👶';
      case 'auto':
        return '🚗';
      case 'home':
        return '🏠';
      case 'travel':
        return '✈️';
      default:
        return '📄';
    }
  }

  formatDate(date: string | Date): string {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  generatePolicyNumber(): string {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `POL${year}${month}${random}`;
  }

  async createSamplePolicies(): Promise<{ success: boolean; message: string; data: InsurancePolicy[] }> {
    try {
      const response = await apiService.post('/insurance/policies/sample');
      return response.data;
    } catch (error) {
      console.error('Error creating sample policies:', error);
      throw new Error('Failed to create sample policies');
    }
  }

  async uploadPolicyDocuments(policyId: string, documents: File[]) {
    try {
      const formData = new FormData();
      // For single file upload, just use the first file
      if (documents.length > 0) {
        formData.append('file', documents[0]);
      }

      const response = await apiService.post(`/insurance/policies/${policyId}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading policy documents:', error);
      throw error;
    }
  }

  async approvePolicy(policyId: string) {
    try {
      const response = await apiService.put(`/insurance/policies/${policyId}/approve`);
      return response.data;
    } catch (error) {
      console.error('Error approving policy:', error);
      throw error;
    }
  }

  async deletePolicyDocument(policyId: string, documentId: string) {
    try {
      const response = await apiService.delete(`/insurance/policies/${policyId}/documents/${documentId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting policy document:', error);
      throw error;
    }
  }
}

export default new InsurancePolicyService(); 