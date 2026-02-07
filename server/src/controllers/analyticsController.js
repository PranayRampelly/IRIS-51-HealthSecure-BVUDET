import InsuranceClaim from '../models/InsuranceClaim.js';
import Policy from '../models/Policy.js';
import User from '../models/User.js';

// Get patient analytics
export const getPatientAnalytics = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    
    // Get all claims for the user
    const claims = await InsuranceClaim.find({ userId });
    
    // Get all policies for the user
    const policies = await Policy.find({ userId });
    
    // Calculate coverage utilization by type
    const utilizationByType = {};
    
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
      const type = claim.coverageInfo?.selectedPlan || 'General';
      if (!utilizationByType[type]) {
        utilizationByType[type] = { used: 0, total: 0, percentage: 0 };
      }
      
      const claimAmount = claim.coverageInfo?.coverageAmount || 0;
      if (claim.status === 'approved') {
        utilizationByType[type].used += claimAmount;
      }
    });
    
    // Calculate percentages
    Object.keys(utilizationByType).forEach(type => {
      const data = utilizationByType[type];
      data.percentage = data.total > 0 ? Math.round((data.used / data.total) * 100 * 10) / 10 : 0;
    });
    
    const coverageUtilization = Object.entries(utilizationByType).map(([type, data]) => ({
      type,
      used: data.used,
      total: data.total,
      percentage: data.percentage
    }));
    
    // Calculate spending trends for last 6 months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const spendingTrends = months.map((month, index) => {
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
          const claimDate = new Date(claim.submittedAt || claim.createdAt);
          return claimDate.getMonth() === monthIndex && claimDate.getFullYear() === year;
        })
        .reduce((sum, claim) => {
          const amount = claim.coverageInfo?.coverageAmount || 0;
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
    
    // Calculate claim statistics
    const totalClaims = claims.length;
    const pendingClaims = claims.filter(claim => claim.status === 'pending').length;
    const approvedClaims = claims.filter(claim => claim.status === 'approved').length;
    const rejectedClaims = claims.filter(claim => claim.status === 'rejected').length;
    
    const totalClaimValue = claims.reduce((sum, claim) => {
      return sum + (claim.coverageInfo?.coverageAmount || 0);
    }, 0);
    
    const approvedClaimValue = claims
      .filter(claim => claim.status === 'approved')
      .reduce((sum, claim) => {
        return sum + (claim.coverageInfo?.coverageAmount || 0);
      }, 0);
    
    // Calculate policy statistics
    const totalPolicies = policies.length;
    const activePolicies = policies.filter(policy => policy.status === 'active').length;
    const totalPremium = policies.reduce((sum, policy) => sum + (policy.premium?.amount || 0), 0);
    const totalCoverage = policies.reduce((sum, policy) => sum + (policy.coverageAmount || 0), 0);
    const totalUsed = policies.reduce((sum, policy) => sum + (policy.usedAmount || 0), 0);
    const utilizationPercentage = totalCoverage > 0 ? Math.round((totalUsed / totalCoverage) * 100) : 0;
    
    res.json({
      success: true,
      data: {
        coverageUtilization,
        spendingTrends,
        claimStatistics: {
          total: totalClaims,
          pending: pendingClaims,
          approved: approvedClaims,
          rejected: rejectedClaims,
          totalValue: totalClaimValue,
          approvedValue: approvedClaimValue
        },
        policyStatistics: {
          totalPolicies,
          activePolicies,
          totalPremium,
          totalCoverage,
          totalUsed,
          utilizationPercentage
        }
      }
    });
  } catch (error) {
    console.error('Error fetching patient analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
}; 