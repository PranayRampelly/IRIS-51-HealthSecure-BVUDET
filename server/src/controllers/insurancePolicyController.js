import InsurancePolicy from '../models/InsurancePolicy.js';
import User from '../models/User.js';

// Get all policies with pagination and filters
export const getPolicies = async (req, res) => {
  try {
    const { 
      status, 
      page = 1, 
      limit = 10, 
      search, 
      policyType, 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;
    
    // Build query
    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { policyNumber: { $regex: search, $options: 'i' } },
        { policyName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (policyType && policyType !== 'all') {
      query.policyType = policyType;
    }
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Get total count for pagination
    const totalPolicies = await InsurancePolicy.countDocuments(query);
    const totalPages = Math.ceil(totalPolicies / Number(limit));
    
    // Get policies with pagination and enhanced population
    const policies = await InsurancePolicy.find(query)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName email')
      .sort(sort)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();
    
    // Enhance policies with calculated fields
    const enhancedPolicies = policies.map(policy => {
      const now = new Date();
      const created = new Date(policy.createdAt);
      const end = new Date(policy.endDate);
      
      return {
        ...policy,
        policyAge: Math.floor((now - created) / (1000 * 60 * 60 * 24)),
        remainingDays: Math.ceil((end - now) / (1000 * 60 * 60 * 24)),
        utilizationRate: policy.enrollmentCount > 0 ? (policy.claimCount / policy.enrollmentCount) * 100 : 0,
        isExpiringSoon: Math.ceil((end - now) / (1000 * 60 * 60 * 24)) <= 30,
        isOverdue: policy.premium?.nextDueDate && new Date(policy.premium.nextDueDate) < now
      };
    });
    
    // Get comprehensive statistics
    const stats = await InsurancePolicy.aggregate([
      {
        $group: {
          _id: '$policyType',
          count: { $sum: 1 },
          totalPremium: { $sum: '$premium.amount' },
          avgCoverageAmount: { $avg: '$coverageAmount' },
          totalEnrollments: { $sum: '$enrollmentCount' },
          totalClaims: { $sum: '$claimCount' },
          avgClaimAmount: { $avg: '$averageClaimAmount' }
        }
      }
    ]);
    
    // Get status-based statistics
    const statusStats = await InsurancePolicy.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalPremium: { $sum: '$premium.amount' },
          totalCoverage: { $sum: '$coverageAmount' }
        }
      }
    ]);
    
    // Get monthly premium trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyStats = await InsurancePolicy.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          status: 'active'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalPremium: { $sum: '$premium.amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);
    
    const statistics = {
      byType: {},
      byStatus: {},
      monthly: monthlyStats,
      summary: {
        totalPolicies,
        totalActive: 0,
        totalPremium: 0,
        totalCoverage: 0,
        totalEnrollments: 0,
        totalClaims: 0
      }
    };
    
    // Process type-based statistics
    stats.forEach(stat => {
      statistics.byType[stat._id] = {
        count: stat.count,
        totalPremium: stat.totalPremium,
        avgCoverageAmount: Math.round(stat.avgCoverageAmount),
        totalEnrollments: stat.totalEnrollments,
        totalClaims: stat.totalClaims,
        avgClaimAmount: Math.round(stat.avgClaimAmount)
      };
    });
    
    // Process status-based statistics
    statusStats.forEach(stat => {
      statistics.byStatus[stat._id] = {
        count: stat.count,
        totalPremium: stat.totalPremium,
        totalCoverage: stat.totalCoverage
      };
      
      // Update summary
      statistics.summary.totalPremium += stat.totalPremium;
      statistics.summary.totalCoverage += stat.totalCoverage;
      if (stat._id === 'active') {
        statistics.summary.totalActive = stat.count;
      }
    });
    
    // Get recent activity
    const recentActivity = await InsurancePolicy.aggregate([
      {
        $sort: { updatedAt: -1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          action: 'Policy Updated',
          policyNumber: 1,
          policyName: 1,
          status: 1,
          updatedAt: 1,
          updatedBy: 1
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        policies: enhancedPolicies,
        statistics,
        recentActivity,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalPolicies,
          hasNext: Number(page) < totalPages,
          hasPrev: Number(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching policies:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch policies' });
  }
};

// Create new policy
export const createPolicy = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const policyData = {
      ...req.body,
      createdBy: userId,
      updatedBy: userId
    };
    
    const policy = new InsurancePolicy(policyData);
    await policy.save();
    
    res.status(201).json({
      success: true,
      message: 'Policy created successfully',
      data: policy
    });
  } catch (error) {
    console.error('Error creating policy:', error);
    res.status(500).json({ success: false, message: 'Failed to create policy' });
  }
};

// Get policy by ID
export const getPolicyById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const policy = await InsurancePolicy.findById(id)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName email');
    
    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }
    
    res.json({
      success: true,
      data: policy
    });
  } catch (error) {
    console.error('Error fetching policy:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch policy' });
  }
};

// Update policy
export const updatePolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;
    
    const policy = await InsurancePolicy.findById(id);
    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }
    
    Object.assign(policy, req.body, { updatedBy: userId });
    await policy.save();
    
    res.json({
      success: true,
      message: 'Policy updated successfully',
      data: policy
    });
  } catch (error) {
    console.error('Error updating policy:', error);
    res.status(500).json({ success: false, message: 'Failed to update policy' });
  }
};

// Delete policy
export const deletePolicy = async (req, res) => {
  try {
    const { id } = req.params;
    
    const policy = await InsurancePolicy.findById(id);
    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }
    
    await InsurancePolicy.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Policy deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting policy:', error);
    res.status(500).json({ success: false, message: 'Failed to delete policy' });
  }
};

// Get policy statistics
export const getPolicyStatistics = async (req, res) => {
  try {
    // Get comprehensive statistics by policy type
    const typeStats = await InsurancePolicy.aggregate([
      {
        $group: {
          _id: '$policyType',
          count: { $sum: 1 },
          totalPremium: { $sum: '$premium.amount' },
          avgCoverageAmount: { $avg: '$coverageAmount' },
          totalEnrollments: { $sum: '$enrollmentCount' },
          totalClaims: { $sum: '$claimCount' },
          avgClaimAmount: { $avg: '$averageClaimAmount' },
          activeCount: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          pendingCount: {
            $sum: { $cond: [{ $eq: ['$status', 'pending_approval'] }, 1, 0] }
          }
        }
      }
    ]);
    
    // Get status-based statistics
    const statusStats = await InsurancePolicy.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalPremium: { $sum: '$premium.amount' },
          totalCoverage: { $sum: '$coverageAmount' },
          totalEnrollments: { $sum: '$enrollmentCount' },
          totalClaims: { $sum: '$claimCount' }
        }
      }
    ]);
    
    // Get monthly premium trends (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    
    const monthlyTrends = await InsurancePolicy.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalPremium: { $sum: '$premium.amount' },
          count: { $sum: 1 },
          totalCoverage: { $sum: '$coverageAmount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);
    
    // Get premium collection performance
    const premiumPerformance = await InsurancePolicy.aggregate([
      {
        $match: { status: 'active' }
      },
      {
        $group: {
          _id: null,
          totalExpectedPremium: { $sum: '$premium.amount' },
          totalCoverage: { $sum: '$coverageAmount' },
          avgPremium: { $avg: '$premium.amount' },
          avgCoverage: { $avg: '$coverageAmount' }
        }
      }
    ]);
    
    // Get network provider statistics
    const networkStats = await InsurancePolicy.aggregate([
      {
        $unwind: '$networkProviders'
      },
      {
        $group: {
          _id: '$networkProviders.type',
          count: { $sum: 1 },
          totalPolicies: { $addToSet: '$_id' }
        }
      },
      {
        $project: {
          type: '$_id',
          count: 1,
          totalPolicies: { $size: '$totalPolicies' }
        }
      }
    ]);
    
    // Get coverage utilization statistics
    const utilizationStats = await InsurancePolicy.aggregate([
      {
        $match: { enrollmentCount: { $gt: 0 } }
      },
      {
        $project: {
          policyNumber: 1,
          policyName: 1,
          utilizationRate: {
            $multiply: [
              { $divide: ['$claimCount', '$enrollmentCount'] },
              100
            ]
          },
          avgClaimAmount: 1,
          coverageAmount: 1
        }
      },
      {
        $sort: { utilizationRate: -1 }
      },
      {
        $limit: 10
      }
    ]);
    
    // Get expiring policies (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const expiringPolicies = await InsurancePolicy.aggregate([
      {
        $match: {
          endDate: { $lte: thirtyDaysFromNow, $gte: new Date() },
          status: 'active'
        }
      },
      {
        $project: {
          policyNumber: 1,
          policyName: 1,
          endDate: 1,
          remainingDays: {
            $ceil: {
              $divide: [
                { $subtract: ['$endDate', new Date()] },
                1000 * 60 * 60 * 24
              ]
            }
          },
          premium: 1,
          enrollmentCount: 1
        }
      },
      {
        $sort: { endDate: 1 }
      }
    ]);
    
    // Get overdue premium policies
    const overduePolicies = await InsurancePolicy.aggregate([
      {
        $match: {
          'premium.nextDueDate': { $lt: new Date() },
          status: 'active'
        }
      },
      {
        $project: {
          policyNumber: 1,
          policyName: 1,
          nextDueDate: '$premium.nextDueDate',
          premiumAmount: '$premium.amount',
          daysOverdue: {
            $ceil: {
              $divide: [
                { $subtract: [new Date(), '$premium.nextDueDate'] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        }
      },
      {
        $sort: { daysOverdue: -1 }
      }
    ]);
    
    const statistics = {
      byType: {},
      byStatus: {},
      monthly: monthlyTrends,
      premiumPerformance: premiumPerformance[0] || {},
      networkProviders: networkStats,
      utilization: utilizationStats,
      expiring: expiringPolicies,
      overdue: overduePolicies,
      summary: {
        totalPolicies: 0,
        totalActive: 0,
        totalPremium: 0,
        totalCoverage: 0,
        totalEnrollments: 0,
        totalClaims: 0
      }
    };
    
    // Process type-based statistics
    typeStats.forEach(stat => {
      statistics.byType[stat._id] = {
        count: stat.count,
        totalPremium: stat.totalPremium,
        avgCoverageAmount: Math.round(stat.avgCoverageAmount),
        totalEnrollments: stat.totalEnrollments,
        totalClaims: stat.totalClaims,
        avgClaimAmount: Math.round(stat.avgClaimAmount),
        activeCount: stat.activeCount,
        pendingCount: stat.pendingCount
      };
    });
    
    // Process status-based statistics
    statusStats.forEach(stat => {
      statistics.byStatus[stat._id] = {
        count: stat.count,
        totalPremium: stat.totalPremium,
        totalCoverage: stat.totalCoverage,
        totalEnrollments: stat.totalEnrollments,
        totalClaims: stat.totalClaims
      };
      
      // Update summary
      statistics.summary.totalPolicies += stat.count;
      statistics.summary.totalPremium += stat.totalPremium;
      statistics.summary.totalCoverage += stat.totalCoverage;
      statistics.summary.totalEnrollments += stat.totalEnrollments;
      statistics.summary.totalClaims += stat.totalClaims;
      
      if (stat._id === 'active') {
        statistics.summary.totalActive = stat.count;
      }
    });
    
    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('Error fetching policy statistics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch policy statistics' });
  }
};

// Create sample policies for testing
export const createSamplePolicies = async (req, res) => {
  try {
    const samplePolicies = [
      {
        policyNumber: `POL${Date.now()}001`,
        policyName: 'Premium Health Plus',
        policyType: 'Health',
        description: 'Comprehensive health insurance with extensive coverage',
        coverageAmount: 500000,
        deductible: 1000,
        coinsurance: 20,
        copay: 25,
        outOfPocketMax: 5000,
        premium: {
          amount: 450,
          frequency: 'monthly'
        },
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        status: 'active',
        isPublic: true,
        availableForNewEnrollments: true,
        eligibilityCriteria: {
          minAge: 18,
          maxAge: 65,
          preExistingConditions: true,
          waitingPeriod: 30,
          requiredDocuments: ['ID', 'Medical History']
        },
        coverageDetails: {
          services: ['Hospitalization', 'Outpatient Care', 'Prescription Drugs', 'Mental Health'],
          exclusions: ['Cosmetic Surgery', 'Experimental Treatments'],
          networkType: 'PPO'
        },
        networkProviders: ['City General Hospital', 'Metro Medical Center'],
        documents: [],
        tags: ['premium', 'comprehensive'],
        notes: 'Best value for comprehensive coverage',
        createdBy: req.user.id
      },
      {
        policyNumber: `POL${Date.now()}002`,
        policyName: 'Basic Health Coverage',
        policyType: 'Health',
        description: 'Affordable basic health insurance',
        coverageAmount: 250000,
        deductible: 2000,
        coinsurance: 30,
        copay: 40,
        outOfPocketMax: 8000,
        premium: {
          amount: 250,
          frequency: 'monthly'
        },
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        status: 'active',
        isPublic: true,
        availableForNewEnrollments: true,
        eligibilityCriteria: {
          minAge: 18,
          maxAge: 70,
          preExistingConditions: false,
          waitingPeriod: 90,
          requiredDocuments: ['ID']
        },
        coverageDetails: {
          services: ['Hospitalization', 'Basic Outpatient Care'],
          exclusions: ['Prescription Drugs', 'Mental Health', 'Dental'],
          networkType: 'HMO'
        },
        networkProviders: ['Community Health Center'],
        documents: [],
        tags: ['basic', 'affordable'],
        notes: 'Entry-level health coverage',
        createdBy: req.user.id
      },
      {
        policyNumber: `POL${Date.now()}003`,
        policyName: 'Family Health Plan',
        policyType: 'Health',
        description: 'Family-focused health insurance with dependents coverage',
        coverageAmount: 750000,
        deductible: 1500,
        coinsurance: 15,
        copay: 20,
        outOfPocketMax: 4000,
        premium: {
          amount: 650,
          frequency: 'monthly'
        },
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        status: 'active',
        isPublic: true,
        availableForNewEnrollments: true,
        eligibilityCriteria: {
          minAge: 0,
          maxAge: 80,
          preExistingConditions: true,
          waitingPeriod: 15,
          requiredDocuments: ['ID', 'Family Information']
        },
        coverageDetails: {
          services: ['Hospitalization', 'Outpatient Care', 'Prescription Drugs', 'Mental Health', 'Dental', 'Vision'],
          exclusions: ['Cosmetic Surgery'],
          networkType: 'PPO'
        },
        networkProviders: ['Family Medical Center', 'Children\'s Hospital'],
        documents: [],
        tags: ['family', 'comprehensive'],
        notes: 'Perfect for families with children',
        createdBy: req.user.id
      }
    ];

    const result = await InsurancePolicy.insertMany(samplePolicies);
    
    res.status(201).json({
      success: true,
      message: 'Sample policies created successfully',
      data: result
    });
  } catch (error) {
    console.error('Error creating sample policies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create sample policies',
      error: error.message
    });
  }
};

// Upload policy documents
export const uploadPolicyDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const policy = await InsurancePolicy.findById(id);
    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }

    const document = {
      name: req.file.originalname,
      originalName: req.file.originalname,
      type: req.file.mimetype,
      size: req.file.size,
      url: req.file.path,
      documentType: 'policy_document',
      uploadedAt: new Date()
    };

    policy.documents.push(document);
    policy.updatedBy = userId;
    await policy.save();

    res.status(200).json({
      success: true,
      message: 'Document uploaded successfully',
      data: document
    });
  } catch (error) {
    console.error('Error uploading policy document:', error);
    res.status(500).json({ success: false, message: 'Failed to upload document' });
  }
};

// Approve policy
export const approvePolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    const policy = await InsurancePolicy.findById(id);
    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }

    policy.status = 'active';
    policy.approvedBy = userId;
    policy.approvalDate = new Date();
    policy.updatedBy = userId;
    await policy.save();

    res.status(200).json({
      success: true,
      message: 'Policy approved successfully',
      data: policy
    });
  } catch (error) {
    console.error('Error approving policy:', error);
    res.status(500).json({ success: false, message: 'Failed to approve policy' });
  }
};

// Delete policy document
export const deletePolicyDocument = async (req, res) => {
  try {
    const { id, documentId } = req.params;
    const userId = req.user._id || req.user.id;

    const policy = await InsurancePolicy.findById(id);
    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }

    policy.documents = policy.documents.filter(doc => doc._id.toString() !== documentId);
    policy.updatedBy = userId;
    await policy.save();

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting policy document:', error);
    res.status(500).json({ success: false, message: 'Failed to delete document' });
  }
}; 

// Get comprehensive policy analytics
export const getPolicyAnalytics = async (req, res) => {
  try {
    const { period = '12months' } = req.query;
    
    // Calculate date range based on period
    let startDate = new Date();
    switch (period) {
      case '6months':
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      case '12months':
        startDate.setMonth(startDate.getMonth() - 12);
        break;
      case '24months':
        startDate.setMonth(startDate.getMonth() - 24);
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 12);
    }
    
    // Get premium collection trends
    const premiumTrends = await InsurancePolicy.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: 'active'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalPremium: { $sum: '$premium.amount' },
          count: { $sum: 1 },
          totalCoverage: { $sum: '$coverageAmount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);
    
    // Get policy type distribution
    const policyTypeDistribution = await InsurancePolicy.aggregate([
      {
        $group: {
          _id: '$policyType',
          count: { $sum: 1 },
          totalPremium: { $sum: '$premium.amount' },
          avgCoverage: { $avg: '$coverageAmount' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Get status distribution
    const statusDistribution = await InsurancePolicy.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalPremium: { $sum: '$premium.amount' },
          totalCoverage: { $sum: '$coverageAmount' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Get network provider distribution
    const networkDistribution = await InsurancePolicy.aggregate([
      {
        $unwind: '$networkProviders'
      },
      {
        $group: {
          _id: '$networkProviders.type',
          count: { $sum: 1 },
          totalPolicies: { $addToSet: '$_id' }
        }
      },
      {
        $project: {
          type: '$_id',
          count: 1,
          totalPolicies: { $size: '$totalPolicies' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Get coverage utilization by policy
    const coverageUtilization = await InsurancePolicy.aggregate([
      {
        $match: { enrollmentCount: { $gt: 0 } }
      },
      {
        $project: {
          policyNumber: 1,
          policyName: 1,
          policyType: 1,
          utilizationRate: {
            $multiply: [
              { $divide: ['$claimCount', '$enrollmentCount'] },
              100
            ]
          },
          avgClaimAmount: 1,
          coverageAmount: 1,
          enrollmentCount: 1,
          claimCount: 1
        }
      },
      {
        $sort: { utilizationRate: -1 }
      }
    ]);
    
    // Get premium performance by policy type
    const premiumPerformance = await InsurancePolicy.aggregate([
      {
        $match: { status: 'active' }
      },
      {
        $group: {
          _id: '$policyType',
          totalPremium: { $sum: '$premium.amount' },
          totalClaims: { $sum: '$claimCount' },
          avgPremium: { $avg: '$premium.amount' },
          avgCoverage: { $avg: '$coverageAmount' },
          totalEnrollments: { $sum: '$enrollmentCount' }
        }
      },
      {
        $sort: { totalPremium: -1 }
      }
    ]);
    
    // Get monthly growth metrics
    const monthlyGrowth = await InsurancePolicy.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          newPolicies: { $sum: 1 },
          totalPremium: { $sum: '$premium.amount' },
          totalCoverage: { $sum: '$coverageAmount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);
    
    // Get risk assessment data
    const riskAssessment = await InsurancePolicy.aggregate([
      {
        $match: { status: 'active' }
      },
      {
        $project: {
          policyNumber: 1,
          policyName: 1,
          riskScore: {
            $add: [
              { $multiply: ['$coinsurance', 0.3] },
              { $multiply: [{ $divide: ['$deductible', '$coverageAmount'] }, 100] },
              { $multiply: [{ $divide: ['$claimCount', { $max: ['$enrollmentCount', 1] }] }, 50] }
            ]
          },
          coinsurance: 1,
          deductible: 1,
          coverageAmount: 1,
          claimCount: 1,
          enrollmentCount: 1
        }
      },
      {
        $sort: { riskScore: -1 }
      },
      {
        $limit: 20
      }
    ]);
    
    const analytics = {
      premiumTrends,
      policyTypeDistribution,
      statusDistribution,
      networkDistribution,
      coverageUtilization,
      premiumPerformance,
      monthlyGrowth,
      riskAssessment,
      period,
      generatedAt: new Date()
    };
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching policy analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch policy analytics' });
  }
}; 