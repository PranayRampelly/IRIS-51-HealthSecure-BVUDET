import apiService from './api';

export interface PatientPolicy {
  _id: string;
  patientId: string;
  policyId: {
    _id: string;
    policyName: string;
    policyType: string;
    premium: {
      amount: number;
      frequency: string;
    };
    coverageAmount: number;
    deductible: number;
    coinsurance: number;
    copay: number;
    outOfPocketMax: number;
  };
  applicationId: {
    _id: string;
    applicationNumber: string;
    status: string;
  };
  policyNumber: string;
  status: 'active' | 'inactive' | 'expired' | 'cancelled';
  startDate: string;
  endDate: string;
  premium: {
    amount: number;
    frequency: string;
  };
  coverageAmount: number;
  deductible: number;
  coinsurance: number;
  copay: number;
  outOfPocketMax: number;
  usedAmount: number;
  remainingAmount: number;
  policyName: string;
  policyType: string;
  insuranceCompany: {
    _id: string;
    firstName: string;
    lastName: string;
    companyName?: string;
  };
  documents: Array<{
    name: string;
    url: string;
    type: string;
    uploadedAt: string;
  }>;
  notes?: string;
  lastPaymentDate?: string;
  nextPaymentDate?: string;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PolicyStatistics {
  totalPolicies: number;
  activePolicies: number;
  totalPremium: number;
  totalCoverage: number;
  totalUsed: number;
  utilizationPercentage: number;
  byType: {
    [key: string]: {
      count: number;
      totalCoverage: number;
      totalUsed: number;
      utilizationPercentage: number;
    };
  };
}

export interface PolicyFilters {
  status?: string;
  policyType?: string;
}

class PatientPolicyService {
  // Get patient's policies
  async getPatientPolicies(filters: PolicyFilters = {}) {
    try {
      const response = await apiService.get('/patient/policies', { params: filters });
      console.log('🔍 Raw policies response:', response);
      
      // Handle different response structures
      if (response.data?.data?.policies) {
        return response.data.data.policies;
      } else if (response.data?.policies) {
        return response.data.policies;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else {
        console.log('🔍 No policies found in response');
        return [];
      }
    } catch (error) {
      console.error('Error fetching patient policies:', error);
      // Return empty array instead of throwing error
      return [];
    }
  }

  // Get policy by ID
  async getPolicyById(policyId: string) {
    try {
      const response = await apiService.get(`/patient/policies/${policyId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching policy:', error);
      throw error;
    }
  }

  // Update policy
  async updatePolicy(policyId: string, updates: { autoRenew?: boolean; notes?: string }) {
    try {
      const response = await apiService.put(`/patient/policies/${policyId}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating policy:', error);
      throw error;
    }
  }

  // Get policy statistics
  async getPolicyStatistics() {
    try {
      const response = await apiService.get('/patient/policies/stats');
      console.log('🔍 Raw statistics response:', response);
      
      // Handle different response structures
      if (response.data?.data?.statistics) {
        return response.data.data.statistics;
      } else if (response.data?.statistics) {
        return response.data.statistics;
      } else if (response.data) {
        return response.data;
      } else {
        console.log('🔍 No statistics found in response');
        return null;
      }
    } catch (error) {
      console.error('Error fetching policy statistics:', error);
      // Return null instead of throwing error
      return null;
    }
  }

  // Get claims for the authenticated patient
  async getClaims(params: {
    status?: string;
    page?: number;
    limit?: number;
    search?: string;
  } = {}) {
    try {
      console.log('🔍 Fetching claims with params:', params);
      const response = await apiService.getPatientInsuranceClaims(params);
      console.log('🔍 Raw claims response:', response);
      
      // Handle different response structures
      if (response.data?.data) {
        console.log('🔍 Claims found in response.data.data:', response.data.data);
        return response.data.data;
      } else if (response.data) {
        console.log('🔍 Claims found in response.data:', response.data);
        return response.data;
      } else {
        console.log('🔍 No claims found in response');
        return [];
      }
    } catch (error) {
      console.error('Error fetching claims:', error);
      // Return empty array instead of throwing error
      return [];
    }
  }

  // Format currency
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  // Format date
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Get status color
  getStatusColor(status: string): string {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'inactive':
        return 'text-gray-600 bg-gray-100';
      case 'expired':
        return 'text-red-600 bg-red-100';
      case 'cancelled':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  // Get policy type icon
  getPolicyTypeIcon(type: string): string {
    switch (type) {
      case 'Health':
        return '🏥';
      case 'Dental':
        return '🦷';
      case 'Vision':
        return '👁️';
      case 'Life':
        return '💝';
      case 'Disability':
        return '♿';
      default:
        return '📋';
    }
  }

  // Calculate utilization percentage
  calculateUtilization(used: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((used / total) * 100);
  }

  // Get next payment date
  getNextPaymentDate(policy: PatientPolicy): string {
    if (policy.nextPaymentDate) {
      return this.formatDate(policy.nextPaymentDate);
    }
    
    // Calculate based on last payment and frequency
    if (policy.lastPaymentDate) {
      const lastPayment = new Date(policy.lastPaymentDate);
      const frequency = policy.premium.frequency;
      
      let nextPayment = new Date(lastPayment);
      switch (frequency) {
        case 'monthly':
          nextPayment.setMonth(nextPayment.getMonth() + 1);
          break;
        case 'quarterly':
          nextPayment.setMonth(nextPayment.getMonth() + 3);
          break;
        case 'annual':
          nextPayment.setFullYear(nextPayment.getFullYear() + 1);
          break;
      }
      
      return this.formatDate(nextPayment.toISOString());
    }
    
    return 'Not set';
  }
}

const patientPolicyService = new PatientPolicyService();
export default patientPolicyService; 