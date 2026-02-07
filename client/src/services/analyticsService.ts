import apiService from './api';

export interface AnalyticsData {
  coverageUtilization: Array<{
    type: string;
    used: number;
    total: number;
    percentage: number;
  }>;
  spendingTrends: Array<{
    month: string;
    premium: number;
    claims: number;
    outOfPocket: number;
  }>;
  claimStatistics: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    totalValue: number;
    approvedValue: number;
  };
  policyStatistics: {
    totalPolicies: number;
    activePolicies: number;
    totalPremium: number;
    totalCoverage: number;
    totalUsed: number;
    utilizationPercentage: number;
  };
}

class AnalyticsService {
  async getPatientAnalytics(): Promise<AnalyticsData> {
    try {
      const response = await apiService.get('/patient/analytics');
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Return default data if API fails
      return this.getDefaultAnalytics();
    }
  }

  async getClaimAnalytics(): Promise<any> {
    try {
      const response = await apiService.get('/patient/insurance-claims/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching claim analytics:', error);
      return null;
    }
  }

  private getDefaultAnalytics(): AnalyticsData {
    return {
      coverageUtilization: [],
      spendingTrends: [],
      claimStatistics: {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        totalValue: 0,
        approvedValue: 0
      },
      policyStatistics: {
        totalPolicies: 0,
        activePolicies: 0,
        totalPremium: 0,
        totalCoverage: 0,
        totalUsed: 0,
        utilizationPercentage: 0
      }
    };
  }

  // Calculate analytics from local data
  calculateCoverageUtilization(policies: any[], claims: any[]) {
    const utilizationByType: { [key: string]: { used: number; total: number; percentage: number } } = {};
    
    // Initialize with policy data
    policies.forEach(policy => {
      const type = policy.policyType || 'General';
      if (!utilizationByType[type]) {
        utilizationByType[type] = { used: 0, total: 0, percentage: 0 };
      }
      utilizationByType[type].total += policy.coverageAmount || 0;
      utilizationByType[type].used += policy.usedAmount || 0;
    });
    
    // Add claims data
    claims.forEach(claim => {
      const type = claim.coverageInfo?.selectedPlan || claim.type || 'General';
      if (!utilizationByType[type]) {
        utilizationByType[type] = { used: 0, total: 0, percentage: 0 };
      }
      
      const claimAmount = claim.coverageInfo?.coverageAmount || claim.amount || 0;
      if (claim.status === 'approved') {
        utilizationByType[type].used += claimAmount;
      }
    });
    
    // Calculate percentages
    Object.keys(utilizationByType).forEach(type => {
      const data = utilizationByType[type];
      data.percentage = data.total > 0 ? Math.round((data.used / data.total) * 100 * 10) / 10 : 0;
    });
    
    return Object.entries(utilizationByType).map(([type, data]) => ({
      type,
      used: data.used,
      total: data.total,
      percentage: data.percentage
    }));
  }

  calculateSpendingTrends(policies: any[], claims: any[]) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return months.map((month, index) => {
      const monthIndex = (currentMonth - 5 + index + 12) % 12; // Last 6 months
      const year = monthIndex > currentMonth ? currentYear - 1 : currentYear;
      
      // Calculate premium for this month
      const monthlyPremium = policies.reduce((sum, policy) => {
        if (policy.premium?.frequency === 'monthly') {
          return sum + (policy.premium?.amount || 0);
        } else if (policy.premium?.frequency === 'quarterly') {
          return sum + ((policy.premium?.amount || 0) / 3);
        } else if (policy.premium?.frequency === 'annual') {
          return sum + ((policy.premium?.amount || 0) / 12);
        }
        return sum;
      }, 0);
      
      // Calculate claims for this month
      const monthClaims = claims
        .filter(claim => {
          const claimDate = new Date(claim.submittedAt || claim.submittedDate || claim.createdAt);
          return claimDate.getMonth() === monthIndex && claimDate.getFullYear() === year;
        })
        .reduce((sum, claim) => {
          const amount = claim.coverageInfo?.coverageAmount || claim.amount || 0;
          return claim.status === 'approved' ? sum + amount : sum;
        }, 0);
      
      // Calculate out-of-pocket (simplified)
      const outOfPocket = monthClaims > 0 ? Math.round(monthClaims * 0.1) : 0;
      
      return {
        month,
        premium: Math.round(monthlyPremium),
        claims: Math.round(monthClaims),
        outOfPocket
      };
    });
  }

  calculateClaimStatistics(claims: any[]) {
    const total = claims.length;
    const pending = claims.filter(claim => claim.status === 'pending').length;
    const approved = claims.filter(claim => claim.status === 'approved').length;
    const rejected = claims.filter(claim => claim.status === 'rejected').length;
    
    const totalValue = claims.reduce((sum, claim) => {
      return sum + (claim.coverageInfo?.coverageAmount || claim.amount || 0);
    }, 0);
    
    const approvedValue = claims
      .filter(claim => claim.status === 'approved')
      .reduce((sum, claim) => {
        return sum + (claim.coverageInfo?.coverageAmount || claim.amount || 0);
      }, 0);
    
    return {
      total,
      pending,
      approved,
      rejected,
      totalValue,
      approvedValue
    };
  }

  calculatePolicyStatistics(policies: any[]) {
    const totalPolicies = policies.length;
    const activePolicies = policies.filter(policy => policy.status === 'active').length;
    const totalPremium = policies.reduce((sum, policy) => sum + (policy.premium?.amount || 0), 0);
    const totalCoverage = policies.reduce((sum, policy) => sum + (policy.coverageAmount || 0), 0);
    const totalUsed = policies.reduce((sum, policy) => sum + (policy.usedAmount || 0), 0);
    const utilizationPercentage = totalCoverage > 0 ? Math.round((totalUsed / totalCoverage) * 100) : 0;
    
    return {
      totalPolicies,
      activePolicies,
      totalPremium,
      totalCoverage,
      totalUsed,
      utilizationPercentage
    };
  }
}

export default new AnalyticsService(); 