import InsuranceClaim from '../models/InsuranceClaim.js';
import User from '../models/User.js';

// Get key metrics for insurance dashboard
export const getKeyMetrics = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    // Get total policies (mock data for now)
    const totalPolicies = 1250;
    const activePolicies = 1180;
    const policyUtilization = (activePolicies / totalPolicies) * 100;

    // Get claims data
    const totalClaims = await InsuranceClaim.countDocuments();
    const pendingClaims = await InsuranceClaim.countDocuments({ status: 'pending' });
    const claimProcessingRate = totalClaims > 0 ? ((totalClaims - pendingClaims) / totalClaims) * 100 : 0;

    // Mock financial data
    const totalPremium = 2500000; // $2.5M
    const totalPayout = 1800000; // $1.8M
    const profitMargin = ((totalPremium - totalPayout) / totalPremium) * 100;

    res.json({
      success: true,
      data: {
        totalPolicies,
        activePolicies,
        policyUtilization: Math.round(policyUtilization * 100) / 100,
        totalClaims,
        pendingClaims,
        claimProcessingRate: Math.round(claimProcessingRate * 100) / 100,
        totalPremium,
        totalPayout,
        profitMargin: Math.round(profitMargin * 100) / 100
      }
    });
  } catch (error) {
    console.error('Error getting key metrics:', error);
    res.status(500).json({ success: false, message: 'Failed to get key metrics' });
  }
};

// Get revenue trends
export const getRevenueTrends = async (req, res) => {
  try {
    // Mock revenue trend data
    const monthlyRevenue = [
      { _id: { year: 2024, month: 1 }, premium: 210000, policies: 45 },
      { _id: { year: 2024, month: 2 }, premium: 225000, policies: 52 },
      { _id: { year: 2024, month: 3 }, premium: 240000, policies: 58 },
      { _id: { year: 2024, month: 4 }, premium: 235000, policies: 55 },
      { _id: { year: 2024, month: 5 }, premium: 250000, policies: 60 },
      { _id: { year: 2024, month: 6 }, premium: 265000, policies: 65 }
    ];

    const monthlyClaims = [
      { _id: { year: 2024, month: 1 }, payout: 180000, claims: 38 },
      { _id: { year: 2024, month: 2 }, payout: 195000, claims: 42 },
      { _id: { year: 2024, month: 3 }, payout: 210000, claims: 45 },
      { _id: { year: 2024, month: 4 }, payout: 205000, claims: 43 },
      { _id: { year: 2024, month: 5 }, payout: 220000, claims: 47 },
      { _id: { year: 2024, month: 6 }, payout: 235000, claims: 50 }
    ];

    res.json({
      success: true,
      data: {
        monthlyRevenue,
        monthlyClaims
      }
    });
  } catch (error) {
    console.error('Error getting revenue trends:', error);
    res.status(500).json({ success: false, message: 'Failed to get revenue trends' });
  }
};

// Get policy distribution
export const getPolicyDistribution = async (req, res) => {
  try {
    // Mock policy distribution data
    const policyTypes = [
      { _id: 'Health', count: 650, totalPremium: 1300000 },
      { _id: 'Dental', count: 300, totalPremium: 450000 },
      { _id: 'Vision', count: 200, totalPremium: 300000 },
      { _id: 'Life', count: 100, totalPremium: 450000 }
    ];

    const policyStatus = [
      { _id: 'active', count: 1180 },
      { _id: 'pending', count: 45 },
      { _id: 'expired', count: 25 }
    ];

    const networkTypes = [
      { _id: 'PPO', count: 800 },
      { _id: 'HMO', count: 300 },
      { _id: 'EPO', count: 150 }
    ];

    res.json({
      success: true,
      data: {
        policyTypes,
        policyStatus,
        networkTypes
      }
    });
  } catch (error) {
    console.error('Error getting policy distribution:', error);
    res.status(500).json({ success: false, message: 'Failed to get policy distribution' });
  }
};

// Get claims analytics
export const getClaimsAnalytics = async (req, res) => {
  try {
    // Get real claims data
    const claimsByStatus = await InsuranceClaim.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$coverageInfo.coverageAmount' }
        }
      }
    ]);

    // Mock claims by type data
    const claimsByType = [
      { _id: 'medical', count: 45, totalAmount: 450000, avgAmount: 10000 },
      { _id: 'dental', count: 25, totalAmount: 125000, avgAmount: 5000 },
      { _id: 'vision', count: 15, totalAmount: 75000, avgAmount: 5000 },
      { _id: 'pharmacy', count: 30, totalAmount: 90000, avgAmount: 3000 }
    ];

    const processingTimes = {
      avgProcessingTime: 5.2, // days
      minProcessingTime: 1,
      maxProcessingTime: 15
    };

    res.json({
      success: true,
      data: {
        claimsByStatus,
        claimsByType,
        processingTimes
      }
    });
  } catch (error) {
    console.error('Error getting claims analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to get claims analytics' });
  }
};

// Get customer demographics
export const getCustomerDemographics = async (req, res) => {
  try {
    // Get real user data for demographics
    const ageDistribution = await User.aggregate([
      {
        $match: { role: 'patient' }
      },
      {
        $addFields: {
          age: {
            $floor: {
              $divide: [
                { $subtract: [new Date(), '$dateOfBirth'] },
                365 * 24 * 60 * 60 * 1000
              ]
            }
          }
        }
      },
      {
        $bucket: {
          groupBy: '$age',
          boundaries: [0, 25, 35, 45, 55, 65, 100],
          default: '65+',
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]);

    const genderDistribution = await User.aggregate([
      {
        $match: { role: 'patient' }
      },
      {
        $group: {
          _id: '$gender',
          count: { $sum: 1 }
        }
      }
    ]);

    const locationDistribution = await User.aggregate([
      {
        $match: { role: 'patient' }
      },
      {
        $group: {
          _id: '$address.state',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      success: true,
      data: {
        ageDistribution,
        genderDistribution,
        locationDistribution
      }
    });
  } catch (error) {
    console.error('Error getting customer demographics:', error);
    res.status(500).json({ success: false, message: 'Failed to get customer demographics' });
  }
}; 