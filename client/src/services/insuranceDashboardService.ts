import apiService from './api';

export interface KeyMetrics {
  totalPolicies: number;
  activePolicies: number;
  policyUtilization: number;
  totalClaims: number;
  pendingClaims: number;
  claimProcessingRate: number;
  totalPremium: number;
  totalPayout: number;
  profitMargin: number;
}

export interface RevenueTrend {
  monthlyRevenue: Array<{
    _id: { year: number; month: number };
    premium: number;
    policies: number;
  }>;
  monthlyClaims: Array<{
    _id: { year: number; month: number };
    payout: number;
    claims: number;
  }>;
}

export interface PolicyDistribution {
  policyTypes: Array<{
    _id: string;
    count: number;
    totalPremium: number;
  }>;
  policyStatus: Array<{
    _id: string;
    count: number;
  }>;
  networkTypes: Array<{
    _id: string;
    count: number;
  }>;
}

export interface ClaimsAnalytics {
  claimsByStatus: Array<{
    _id: string;
    count: number;
    totalAmount: number;
  }>;
  claimsByType: Array<{
    _id: string;
    count: number;
    totalAmount: number;
    avgAmount: number;
  }>;
  processingTimes: {
    avgProcessingTime: number;
    minProcessingTime: number;
    maxProcessingTime: number;
  };
}

export interface CustomerDemographics {
  ageDistribution: Array<{
    _id: string;
    count: number;
  }>;
  genderDistribution: Array<{
    _id: string;
    count: number;
  }>;
  locationDistribution: Array<{
    _id: string;
    count: number;
  }>;
}

class InsuranceDashboardService {
  private baseUrl = '/insurance/dashboard';

  async getKeyMetrics(): Promise<KeyMetrics> {
    const response = await apiService.get(`${this.baseUrl}/metrics`);
    return response.data;
  }

  async getRevenueTrends(): Promise<RevenueTrend> {
    const response = await apiService.get(`${this.baseUrl}/revenue-trends`);
    return response.data;
  }

  async getPolicyDistribution(): Promise<PolicyDistribution> {
    const response = await apiService.get(`${this.baseUrl}/policy-distribution`);
    return response.data;
  }

  async getClaimsAnalytics(): Promise<ClaimsAnalytics> {
    const response = await apiService.get(`${this.baseUrl}/claims-analytics`);
    return response.data;
  }

  async getCustomerDemographics(): Promise<CustomerDemographics> {
    const response = await apiService.get(`${this.baseUrl}/demographics`);
    return response.data;
  }

  // Utility functions for data formatting
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  formatPercentage(value: number): string {
    return `${Math.round(value)}%`;
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
    }).format(date);
  }

  getStatusColor(status: string): string {
    const colors = {
      active: 'text-green-600 bg-green-100',
      pending: 'text-yellow-600 bg-yellow-100',
      expired: 'text-red-600 bg-red-100',
      approved: 'text-green-600 bg-green-100',
      rejected: 'text-red-600 bg-red-100',
      processing: 'text-blue-600 bg-blue-100',
      default: 'text-gray-600 bg-gray-100'
    };
    return colors[status.toLowerCase()] || colors.default;
  }

  getTrendIndicator(current: number, previous: number): {
    trend: 'up' | 'down' | 'neutral';
    percentage: number;
  } {
    if (!previous) return { trend: 'neutral', percentage: 0 };
    const percentage = ((current - previous) / previous) * 100;
    return {
      trend: percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'neutral',
      percentage: Math.abs(percentage)
    };
  }
}

export default new InsuranceDashboardService(); 