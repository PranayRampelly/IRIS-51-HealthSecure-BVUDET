import apiService from './api.js';

export interface FinancialReport {
  premiumData: Array<{
    _id: { year: number; month: number };
    totalPremium: number;
    policyCount: number;
  }>;
  claimData: Array<{
    _id: { year: number; month: number };
    totalPayout: number;
    claimCount: number;
  }>;
  profitData: Array<{
    _id: string;
    revenue: number;
    policies: number;
    avgPremium: number;
  }>;
}

export interface PerformanceReport {
  claimProcessing: Array<{
    _id: string;
    count: number;
    avgProcessingTime: number;
  }>;
  policyMetrics: Array<{
    _id: string;
    count: number;
    totalPremium: number;
    avgCoverage: number;
  }>;
  customerSatisfaction: {
    totalCustomers: number;
    activePolicies: number;
  };
}

export interface ComplianceReport {
  claimAudits: Array<{
    _id: string;
    count: number;
    avgAmount: number;
    totalAmount: number;
    flaggedCount: number;
  }>;
  policyAudits: Array<{
    _id: string;
    count: number;
    expiredCount: number;
    renewalCount: number;
  }>;
  accessLogs: unknown[];
}

export interface GenerateReportOptions {
  type: string;
  format: 'pdf' | 'csv';
  data: unknown;
  title: string;
}

export interface DateRange {
  startDate?: string;
  endDate?: string;
}

class InsuranceReportService {
  private baseUrl = '/insurance/reports';

  async getFinancialReport(filters = {}) {
    try {
      const params = new URLSearchParams(filters);
      const response = await apiService.get(`${this.baseUrl}/financial?${params.toString()}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching financial report:', error);
      throw error;
    }
  }

  async getPerformanceReport(filters = {}) {
    try {
      const params = new URLSearchParams(filters);
      const response = await apiService.get(`${this.baseUrl}/performance?${params.toString()}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching performance report:', error);
      throw error;
    }
  }

  async getComplianceReport(filters = {}) {
    try {
      const params = new URLSearchParams(filters);
      const response = await apiService.get(`${this.baseUrl}/compliance?${params.toString()}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching compliance report:', error);
      throw error;
    }
  }

  async generateReport(options = {}) {
    try {
      const response = await apiService.post(`${this.baseUrl}/generate`, options);
      return response.data.data;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  // Utility functions for formatting data
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

  formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
  }

  getStatusColor(status: string): string {
    const colors = {
      active: 'text-green-600 bg-green-100',
      pending: 'text-yellow-600 bg-yellow-100',
      expired: 'text-red-600 bg-red-100',
      approved: 'text-green-600 bg-green-100',
      rejected: 'text-red-600 bg-red-100',
      flagged: 'text-yellow-600 bg-yellow-100',
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

  getMonthName(month: number): string {
    return new Date(2000, month - 1).toLocaleString('default', { month: 'short' });
  }
}

export default new InsuranceReportService(); 