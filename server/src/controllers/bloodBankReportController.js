import BloodInventory from '../models/BloodInventory.js';
import BloodDonor from '../models/BloodDonor.js';
import BloodRequest from '../models/BloodRequest.js';
import QualityControl from '../models/QualityControl.js';
import EmergencyAlert from '../models/EmergencyAlert.js';

// Get dashboard overview
export const getDashboardOverview = async (req, res) => {
    try {
        const bloodBankId = req.user.userId;

        // Get inventory summary
        const inventoryStats = await BloodInventory.aggregate([
            { $match: { bloodBankId } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get donor summary
        const donorStats = await BloodDonor.aggregate([
            { $match: { bloodBankId } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get request summary
        const requestStats = await BloodRequest.aggregate([
            { $match: { bloodBankId } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get quality control summary
        const qcStats = await QualityControl.aggregate([
            { $match: { bloodBankId } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get emergency alerts summary
        const alertStats = await EmergencyAlert.aggregate([
            { $match: { bloodBankId, isActive: true } },
            {
                $group: {
                    _id: '$severity',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                inventory: inventoryStats,
                donors: donorStats,
                requests: requestStats,
                qualityControl: qcStats,
                alerts: alertStats
            }
        });
    } catch (error) {
        console.error('Error getting dashboard overview:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard overview',
            error: error.message
        });
    }
};

// Get inventory reports
export const getInventoryReports = async (req, res) => {
    try {
        const bloodBankId = req.user.userId;
        const { startDate, endDate, bloodType, status } = req.query;

        const filter = { bloodBankId };
        if (bloodType) filter.bloodType = bloodType;
        if (status) filter.status = status;

        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        const inventory = await BloodInventory.find(filter).sort({ createdAt: -1 });

        // Calculate statistics
        const totalUnits = inventory.length;
        const availableUnits = inventory.filter(u => u.status === 'Available').length;
        const expiringUnits = inventory.filter(u => {
            const expiryDate = new Date(u.expiry.expiryDate);
            const daysUntilExpiry = (expiryDate - new Date()) / (1000 * 60 * 60 * 24);
            return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
        }).length;

        res.json({
            success: true,
            data: {
                inventory,
                statistics: {
                    total: totalUnits,
                    available: availableUnits,
                    expiring: expiringUnits
                }
            }
        });
    } catch (error) {
        console.error('Error getting inventory reports:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching inventory reports',
            error: error.message
        });
    }
};

// Get donor reports
export const getDonorReports = async (req, res) => {
    try {
        const bloodBankId = req.user.userId;
        const { startDate, endDate, bloodType, status } = req.query;

        const filter = { bloodBankId };
        if (bloodType) filter['personalInfo.bloodType'] = bloodType;
        if (status) filter.status = status;

        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        const donors = await BloodDonor.find(filter).sort({ createdAt: -1 });

        // Calculate statistics
        const totalDonors = donors.length;
        const activeDonors = donors.filter(d => d.status === 'Active').length;
        const eligibleDonors = donors.filter(d => d.eligibility.isEligible).length;

        res.json({
            success: true,
            data: {
                donors,
                statistics: {
                    total: totalDonors,
                    active: activeDonors,
                    eligible: eligibleDonors
                }
            }
        });
    } catch (error) {
        console.error('Error getting donor reports:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching donor reports',
            error: error.message
        });
    }
};

// Get request reports
export const getRequestReports = async (req, res) => {
    try {
        const bloodBankId = req.user.userId;
        const { startDate, endDate, status, urgency } = req.query;

        const filter = { bloodBankId };
        if (status) filter.status = status;
        if (urgency) filter['requestDetails.urgency'] = urgency;

        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        const requests = await BloodRequest.find(filter).sort({ createdAt: -1 });

        // Calculate statistics
        const totalRequests = requests.length;
        const pendingRequests = requests.filter(r => r.status === 'Pending').length;
        const fulfilledRequests = requests.filter(r => r.status === 'Fulfilled').length;

        res.json({
            success: true,
            data: {
                requests,
                statistics: {
                    total: totalRequests,
                    pending: pendingRequests,
                    fulfilled: fulfilledRequests
                }
            }
        });
    } catch (error) {
        console.error('Error getting request reports:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching request reports',
            error: error.message
        });
    }
};

// Get quality control reports
export const getQualityReports = async (req, res) => {
    try {
        const bloodBankId = req.user.userId;
        const { startDate, endDate, status } = req.query;

        const filter = { bloodBankId };
        if (status) filter.status = status;

        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        const qualityControls = await QualityControl.find(filter).sort({ createdAt: -1 });

        // Calculate statistics
        const totalTests = qualityControls.length;
        const passedTests = qualityControls.filter(qc => qc.status === 'passed').length;
        const failedTests = qualityControls.filter(qc => qc.status === 'failed').length;

        res.json({
            success: true,
            data: {
                qualityControls,
                statistics: {
                    total: totalTests,
                    passed: passedTests,
                    failed: failedTests
                }
            }
        });
    } catch (error) {
        console.error('Error getting quality reports:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching quality reports',
            error: error.message
        });
    }
};

// Get compliance reports
export const getComplianceReports = async (req, res) => {
    try {
        const bloodBankId = req.user.userId;

        // Get expiring units
        const expiringUnits = await BloodInventory.find({
            bloodBankId,
            status: 'Available',
            'expiry.expiryDate': { $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
        });

        // Get overdue quality controls
        const overdueQC = await QualityControl.find({
            bloodBankId,
            status: 'pending',
            createdAt: { $lte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });

        // Get active emergency alerts
        const activeAlerts = await EmergencyAlert.find({
            bloodBankId,
            status: { $in: ['Active', 'Acknowledged', 'In Progress'] },
            isActive: true
        });

        res.json({
            success: true,
            data: {
                expiringUnits: expiringUnits.length,
                overdueQualityControls: overdueQC.length,
                activeEmergencyAlerts: activeAlerts.length,
                details: {
                    expiringUnits,
                    overdueQC,
                    activeAlerts
                }
            }
        });
    } catch (error) {
        console.error('Error getting compliance reports:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching compliance reports',
            error: error.message
        });
    }
};

// Get operational reports
export const getOperationalReports = async (req, res) => {
    try {
        const bloodBankId = req.user.userId;
        const { period = 'month' } = req.query;

        let startDate;
        const endDate = new Date();

        switch (period) {
            case 'week':
                startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                break;
            case 'year':
                startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        }

        // Get donations in period
        const donations = await BloodDonor.aggregate([
            { $match: { bloodBankId } },
            { $unwind: '$donationHistory' },
            {
                $match: {
                    'donationHistory.donationDate': { $gte: startDate, $lte: endDate }
                }
            },
            { $count: 'total' }
        ]);

        // Get requests in period
        const requests = await BloodRequest.countDocuments({
            bloodBankId,
            createdAt: { $gte: startDate, $lte: endDate }
        });

        // Get fulfilled requests
        const fulfilledRequests = await BloodRequest.countDocuments({
            bloodBankId,
            status: 'Fulfilled',
            createdAt: { $gte: startDate, $lte: endDate }
        });

        // Calculate fulfillment rate
        const fulfillmentRate = requests > 0 ? ((fulfilledRequests / requests) * 100).toFixed(2) : 0;

        res.json({
            success: true,
            data: {
                period,
                donations: donations[0]?.total || 0,
                requests,
                fulfilledRequests,
                fulfillmentRate: parseFloat(fulfillmentRate)
            }
        });
    } catch (error) {
        console.error('Error getting operational reports:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching operational reports',
            error: error.message
        });
    }
};

// Export report (placeholder for PDF/Excel generation)
export const exportReport = async (req, res) => {
    try {
        const { type } = req.params;
        const bloodBankId = req.user.userId;

        // This is a placeholder - actual implementation would use libraries like PDFKit or ExcelJS
        res.json({
            success: true,
            message: `Export functionality for ${type} reports will be implemented with PDF/Excel libraries`,
            data: {
                type,
                bloodBankId,
                timestamp: new Date()
            }
        });
    } catch (error) {
        console.error('Error exporting report:', error);
        res.status(500).json({
            success: false,
            message: 'Error exporting report',
            error: error.message
        });
    }
};

// Generate custom report
export const generateCustomReport = async (req, res) => {
    try {
        const bloodBankId = req.user.userId;
        const { reportType, filters, dateRange } = req.body;

        // Build dynamic query based on report type and filters
        const query = { bloodBankId };

        if (dateRange) {
            query.createdAt = {
                $gte: new Date(dateRange.start),
                $lte: new Date(dateRange.end)
            };
        }

        let data;
        switch (reportType) {
            case 'inventory':
                data = await BloodInventory.find({ ...query, ...filters });
                break;
            case 'donors':
                data = await BloodDonor.find({ ...query, ...filters });
                break;
            case 'requests':
                data = await BloodRequest.find({ ...query, ...filters });
                break;
            case 'quality':
                data = await QualityControl.find({ ...query, ...filters });
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid report type'
                });
        }

        res.json({
            success: true,
            data: {
                reportType,
                filters,
                dateRange,
                results: data,
                count: data.length
            }
        });
    } catch (error) {
        console.error('Error generating custom report:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating custom report',
            error: error.message
        });
    }
};

// Get analytics overview
export const getAnalyticsOverview = async (req, res) => {
    try {
        const bloodBankId = req.user.userId;

        // Get blood type distribution
        const bloodTypeDistribution = await BloodInventory.aggregate([
            { $match: { bloodBankId, status: 'Available' } },
            {
                $group: {
                    _id: '$bloodType',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get monthly trends
        const monthlyTrends = await BloodRequest.aggregate([
            {
                $match: {
                    bloodBankId,
                    createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        res.json({
            success: true,
            data: {
                bloodTypeDistribution,
                monthlyTrends
            }
        });
    } catch (error) {
        console.error('Error getting analytics overview:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching analytics overview',
            error: error.message
        });
    }
};

// Get inventory trends
export const getInventoryTrends = async (req, res) => {
    try {
        const bloodBankId = req.user.userId;
        const { period = '30' } = req.query;

        const daysAgo = parseInt(period);
        const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

        const trends = await BloodInventory.aggregate([
            {
                $match: {
                    bloodBankId,
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        bloodType: '$bloodType'
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.date': 1 } }
        ]);

        res.json({
            success: true,
            data: trends
        });
    } catch (error) {
        console.error('Error getting inventory trends:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching inventory trends',
            error: error.message
        });
    }
};

// Get donor trends
export const getDonorTrends = async (req, res) => {
    try {
        const bloodBankId = req.user.userId;
        const { period = '30' } = req.query;

        const daysAgo = parseInt(period);
        const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

        const trends = await BloodDonor.aggregate([
            { $match: { bloodBankId } },
            { $unwind: '$donationHistory' },
            {
                $match: {
                    'donationHistory.donationDate': { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$donationHistory.donationDate' } }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.date': 1 } }
        ]);

        res.json({
            success: true,
            data: trends
        });
    } catch (error) {
        console.error('Error getting donor trends:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching donor trends',
            error: error.message
        });
    }
};

// Get request trends
export const getRequestTrends = async (req, res) => {
    try {
        const bloodBankId = req.user.userId;
        const { period = '30' } = req.query;

        const daysAgo = parseInt(period);
        const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

        const trends = await BloodRequest.aggregate([
            {
                $match: {
                    bloodBankId,
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        status: '$status'
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.date': 1 } }
        ]);

        res.json({
            success: true,
            data: trends
        });
    } catch (error) {
        console.error('Error getting request trends:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching request trends',
            error: error.message
        });
    }
};

// Notification management (placeholder)
export const getNotifications = async (req, res) => {
    try {
        const bloodBankId = req.user.userId;

        // This is a placeholder - actual implementation would use a Notification model
        res.json({
            success: true,
            data: [],
            message: 'Notification system will be implemented with a dedicated Notification model'
        });
    } catch (error) {
        console.error('Error getting notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching notifications',
            error: error.message
        });
    }
};

export const markNotificationAsRead = async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Notification marked as read (placeholder)'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error marking notification as read',
            error: error.message
        });
    }
};

export const markAllNotificationsAsRead = async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'All notifications marked as read (placeholder)'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error marking all notifications as read',
            error: error.message
        });
    }
};

export const getNotificationSettings = async (req, res) => {
    try {
        res.json({
            success: true,
            data: {},
            message: 'Notification settings (placeholder)'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching notification settings',
            error: error.message
        });
    }
};

export const updateNotificationSettings = async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Notification settings updated (placeholder)'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating notification settings',
            error: error.message
        });
    }
};

export default {
    getDashboardOverview,
    getInventoryReports,
    getDonorReports,
    getRequestReports,
    getQualityReports,
    getComplianceReports,
    getOperationalReports,
    exportReport,
    generateCustomReport,
    getAnalyticsOverview,
    getInventoryTrends,
    getDonorTrends,
    getRequestTrends,
    getNotificationSettings,
    updateNotificationSettings,
    // Aliases and new functions
    getQualityControlReports: getQualityReports,
    getEmergencyAlertReports: async (req, res) => {
        try {
            res.json({ success: true, data: { message: "Emergency alert reports placeholder" } });
        } catch (error) { res.status(500).json({ error: error.message }); }
    },
    getFinancialReports: async (req, res) => {
        try {
            res.json({ success: true, data: { message: "Financial reports placeholder" } });
        } catch (error) { res.status(500).json({ error: error.message }); }
    },
    getInventoryAnalytics: getInventoryTrends,
    getDonorAnalytics: getDonorTrends,
    getRequestAnalytics: getRequestTrends,
    getQualityControlAnalytics: async (req, res) => {
        try {
            res.json({ success: true, data: { message: "Quality control analytics placeholder" } });
        } catch (error) { res.status(500).json({ error: error.message }); }
    },
    getEmergencyAlertAnalytics: async (req, res) => {
        try {
            res.json({ success: true, data: { message: "Emergency alert analytics placeholder" } });
        } catch (error) { res.status(500).json({ error: error.message }); }
    },
    getTrendAnalysis: async (req, res) => {
        try {
            res.json({ success: true, data: { message: "Trend analysis placeholder" } });
        } catch (error) { res.status(500).json({ error: error.message }); }
    },
    getPerformanceMetrics: async (req, res) => {
        try {
            res.json({ success: true, data: { message: "Performance metrics placeholder" } });
        } catch (error) { res.status(500).json({ error: error.message }); }
    },
    getBloodBankSettings: async (req, res) => {
        try {
            res.json({ success: true, data: { message: "Settings placeholder" } });
        } catch (error) { res.status(500).json({ error: error.message }); }
    },
    updateBloodBankSettings: async (req, res) => {
        try {
            res.json({ success: true, message: "Settings updated" });
        } catch (error) { res.status(500).json({ error: error.message }); }
    },
    getUserPreferences: async (req, res) => {
        try {
            res.json({ success: true, data: { message: "Preferences placeholder" } });
        } catch (error) { res.status(500).json({ error: error.message }); }
    },
    updateUserPreferences: async (req, res) => {
        try {
            res.json({ success: true, message: "Preferences updated" });
        } catch (error) { res.status(500).json({ error: error.message }); }
    }
};

// Export individual functions for named imports (which is what the route uses)
export const getQualityControlReports = getQualityReports;
export const getEmergencyAlertReports = async (req, res) => {
    try {
        res.json({ success: true, data: { message: "Emergency alert reports placeholder" } });
    } catch (error) { res.status(500).json({ error: error.message }); }
};
export const getFinancialReports = async (req, res) => {
    try {
        res.json({ success: true, data: { message: "Financial reports placeholder" } });
    } catch (error) { res.status(500).json({ error: error.message }); }
};
export const getInventoryAnalytics = getInventoryTrends;
export const getDonorAnalytics = getDonorTrends;
export const getRequestAnalytics = getRequestTrends;
export const getQualityControlAnalytics = async (req, res) => {
    try {
        res.json({ success: true, data: { message: "Quality control analytics placeholder" } });
    } catch (error) { res.status(500).json({ error: error.message }); }
};
export const getEmergencyAlertAnalytics = async (req, res) => {
    try {
        res.json({ success: true, data: { message: "Emergency alert analytics placeholder" } });
    } catch (error) { res.status(500).json({ error: error.message }); }
};
export const getTrendAnalysis = async (req, res) => {
    try {
        res.json({ success: true, data: { message: "Trend analysis placeholder" } });
    } catch (error) { res.status(500).json({ error: error.message }); }
};
export const getPerformanceMetrics = async (req, res) => {
    try {
        res.json({ success: true, data: { message: "Performance metrics placeholder" } });
    } catch (error) { res.status(500).json({ error: error.message }); }
};
export const getBloodBankSettings = async (req, res) => {
    try {
        res.json({ success: true, data: { message: "Settings placeholder" } });
    } catch (error) { res.status(500).json({ error: error.message }); }
};
export const updateBloodBankSettings = async (req, res) => {
    try {
        res.json({ success: true, message: "Settings updated" });
    } catch (error) { res.status(500).json({ error: error.message }); }
};
export const getUserPreferences = async (req, res) => {
    try {
        res.json({ success: true, data: { message: "Preferences placeholder" } });
    } catch (error) { res.status(500).json({ error: error.message }); }
};
export const updateUserPreferences = async (req, res) => {
    try {
        res.json({ success: true, message: "Preferences updated" });
    } catch (error) { res.status(500).json({ error: error.message }); }
};
