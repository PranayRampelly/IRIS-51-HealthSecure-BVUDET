import BloodRequest from '../models/BloodRequest.js';
import BloodDonor from '../models/BloodDonor.js';
import BloodInventory from '../models/BloodInventory.js';
import QualityControl from '../models/QualityControl.js';
import EmergencyAlert from '../models/EmergencyAlert.js';

// Get comprehensive dashboard statistics
export const getDashboardStats = async (req, res) => {
    try {
        const bloodBankId = req.user.userId;

        // Get inventory stats
        const inventoryStats = await BloodInventory.aggregate([
            { $match: { bloodBankId } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const inventory = {
            total: 0,
            available: 0,
            reserved: 0,
            testing: 0,
            expired: 0
        };

        inventoryStats.forEach(stat => {
            inventory.total += stat.count;
            if (stat._id === 'Available') inventory.available = stat.count;
            if (stat._id === 'Reserved') inventory.reserved = stat.count;
            if (stat._id === 'Testing') inventory.testing = stat.count;
            if (stat._id === 'Expired') inventory.expired = stat.count;
        });

        // Get donor stats
        const donorStats = await BloodDonor.aggregate([
            { $match: { bloodBankId } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const donors = {
            total: 0,
            active: 0,
            eligible: 0,
            deferred: 0
        };

        donorStats.forEach(stat => {
            donors.total += stat.count;
            if (stat._id === 'Active') donors.active = stat.count;
            if (stat._id === 'Deferred') donors.deferred = stat.count;
        });

        // Count eligible donors
        const eligibleCount = await BloodDonor.countDocuments({
            bloodBankId,
            'eligibility.isEligible': true,
            status: 'Active'
        });
        donors.eligible = eligibleCount;

        // Get request stats
        const requestStats = await BloodRequest.aggregate([
            { $match: { bloodBankId } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const requests = {
            total: 0,
            pending: 0,
            approved: 0,
            fulfilled: 0
        };

        requestStats.forEach(stat => {
            requests.total += stat.count;
            if (stat._id === 'Pending') requests.pending = stat.count;
            if (stat._id === 'Approved') requests.approved = stat.count;
            if (stat._id === 'Fulfilled') requests.fulfilled = stat.count;
        });

        // Get alert stats
        const alertStats = await EmergencyAlert.aggregate([
            { $match: { bloodBankId, status: 'active' } },
            {
                $group: {
                    _id: '$severity',
                    count: { $sum: 1 }
                }
            }
        ]);

        const alerts = {
            total: 0,
            critical: 0,
            high: 0,
            medium: 0
        };

        alertStats.forEach(stat => {
            alerts.total += stat.count;
            if (stat._id === 'critical') alerts.critical = stat.count;
            if (stat._id === 'high') alerts.high = stat.count;
            if (stat._id === 'medium') alerts.medium = stat.count;
        });

        // Get trends (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentDonations = await BloodDonor.aggregate([
            { $match: { bloodBankId } },
            { $unwind: '$donationHistory' },
            { $match: { 'donationHistory.donationDate': { $gte: thirtyDaysAgo } } },
            { $count: 'total' }
        ]);

        const recentRequests = await BloodRequest.countDocuments({
            bloodBankId,
            createdAt: { $gte: thirtyDaysAgo }
        });

        const expiringUnits = await BloodInventory.countDocuments({
            bloodBankId,
            'expiry.expiryDate': { $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
            status: 'Available'
        });

        const trends = {
            donations: recentDonations[0]?.total || 0,
            requests: recentRequests,
            expiring: expiringUnits
        };

        res.json({
            success: true,
            data: {
                inventory,
                donors,
                requests,
                alerts,
                trends
            }
        });
    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard statistics',
            error: error.message
        });
    }
};

// Create a quick blood request with minimal data
export const createQuickBloodRequest = async (req, res) => {
    try {
        const bloodBankId = req.user.userId;
        const { bloodType, componentType, quantity, urgency } = req.body;

        // Validate required fields
        if (!bloodType || !componentType || !quantity) {
            return res.status(400).json({
                success: false,
                message: 'Blood type, component type, and quantity are required'
            });
        }

        // Generate request ID
        const requestId = await BloodRequest.generateRequestId(bloodBankId);

        // Create request with default values
        const bloodRequest = new BloodRequest({
            bloodBankId,
            requestId,
            requestingHospital: {
                hospitalName: 'Quick Request - To Be Updated',
                contactPerson: {
                    name: 'To Be Updated',
                    phone: 'N/A',
                    email: 'N/A'
                }
            },
            patientInfo: {
                name: 'To Be Updated',
                bloodType: bloodType
            },
            requestDetails: {
                bloodType,
                componentType,
                quantity: parseInt(quantity),
                urgency: urgency || 'Routine',
                priority: urgency === 'Emergency' ? 'Critical' : urgency === 'Urgent' ? 'High' : 'Medium',
                requiredBy: new Date(Date.now() + 24 * 60 * 60 * 1000), // Default: 24 hours from now
                clinicalIndication: 'Other'
            },
            status: 'Pending',
            createdBy: req.user.userId
        });

        // Add initial timeline entry
        bloodRequest.addTimelineEntry(
            'Request Created',
            req.user.userId,
            req.user.name || 'Blood Bank User',
            'Quick request created from dashboard'
        );

        await bloodRequest.save();

        res.status(201).json({
            success: true,
            message: 'Quick blood request created successfully. Please update the details.',
            data: bloodRequest
        });
    } catch (error) {
        console.error('Error creating quick blood request:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating quick blood request',
            error: error.message
        });
    }
};

// Register a quick donor with basic information
export const registerQuickDonor = async (req, res) => {
    try {
        const bloodBankId = req.user.userId;
        const { firstName, lastName, bloodType, phone, email, dateOfBirth, gender, weight, height } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !bloodType || !phone || !email || !dateOfBirth || !gender || !weight || !height) {
            return res.status(400).json({
                success: false,
                message: 'First name, last name, blood type, phone, email, date of birth, gender, weight, and height are required'
            });
        }

        // Check if donor already exists
        const existingDonor = await BloodDonor.findOne({
            bloodBankId,
            $or: [
                { 'contactInfo.email': email },
                { 'contactInfo.phone': phone }
            ]
        });

        if (existingDonor) {
            return res.status(400).json({
                success: false,
                message: 'Donor with this email or phone already exists'
            });
        }

        // Generate donor ID
        const donorId = await BloodDonor.generateDonorId(bloodBankId);

        // Determine Rh factor from blood type
        const rhFactor = bloodType.includes('+') ? 'Positive' : 'Negative';

        // Calculate BMI
        const heightInMeters = parseFloat(height) / 100;
        const bmi = (parseFloat(weight) / (heightInMeters * heightInMeters)).toFixed(1);

        // Create donor with basic information
        const donor = new BloodDonor({
            bloodBankId,
            donorId,
            personalInfo: {
                firstName,
                lastName,
                dateOfBirth: new Date(dateOfBirth),
                gender,
                bloodType,
                rhFactor,
                weight: parseFloat(weight),
                height: parseFloat(height),
                bmi: parseFloat(bmi)
            },
            contactInfo: {
                email: email.toLowerCase(),
                phone,
                address: {
                    street: 'To Be Updated',
                    city: 'To Be Updated',
                    state: 'To Be Updated',
                    zipCode: 'To Be Updated',
                    country: 'India'
                }
            },
            medicalHistory: {
                hasDonatedBefore: false,
                totalDonations: 0,
                medicalConditions: [],
                surgeries: [],
                allergies: [],
                medications: [],
                travelHistory: [],
                tattoos: [],
                piercings: []
            },
            donationHistory: [],
            screeningResults: {},
            eligibility: {
                isEligible: true,
                eligibilityDate: new Date()
            },
            status: 'Active',
            createdBy: req.user.userId
        });

        await donor.save();

        res.status(201).json({
            success: true,
            message: 'Quick donor registration successful. Please complete the medical history and screening.',
            data: donor
        });
    } catch (error) {
        console.error('Error registering quick donor:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering quick donor',
            error: error.message
        });
    }
};

// Initiate a quality test for a blood unit
export const initiateQualityTest = async (req, res) => {
    try {
        const bloodBankId = req.user.userId;
        const { unitId, testType } = req.body;

        // Validate required fields
        if (!unitId) {
            return res.status(400).json({
                success: false,
                message: 'Unit ID is required'
            });
        }

        // Find the blood unit
        const bloodUnit = await BloodInventory.findOne({
            _id: unitId,
            bloodBankId
        });

        if (!bloodUnit) {
            return res.status(404).json({
                success: false,
                message: 'Blood unit not found'
            });
        }

        // Create quality control record
        const qualityControl = new QualityControl({
            bloodBankId,
            unitId: bloodUnit._id,
            bloodType: bloodUnit.bloodType,
            componentType: bloodUnit.componentType,
            tests: [{
                testType: testType || 'Standard Screening',
                result: 'pending',
                testDate: new Date(),
                technician: req.user.name || 'Blood Bank User',
                notes: 'Quick test initiated from dashboard'
            }],
            status: 'testing',
            expiryDate: bloodUnit.expiry.expiryDate,
            createdBy: req.user.userId
        });

        await qualityControl.save();

        // Update blood unit status to testing
        bloodUnit.status = 'Testing';
        await bloodUnit.save();

        res.status(201).json({
            success: true,
            message: 'Quality test initiated successfully',
            data: qualityControl
        });
    } catch (error) {
        console.error('Error initiating quality test:', error);
        res.status(500).json({
            success: false,
            message: 'Error initiating quality test',
            error: error.message
        });
    }
};

// Generate a quick report
export const generateQuickReport = async (req, res) => {
    try {
        const bloodBankId = req.user.userId;
        const { reportType } = req.body;

        const reportData = {
            reportType: reportType || 'dashboard_summary',
            generatedAt: new Date(),
            generatedBy: req.user.name || 'Blood Bank User'
        };

        // Get inventory summary
        const inventoryData = await BloodInventory.aggregate([
            { $match: { bloodBankId } },
            {
                $group: {
                    _id: {
                        bloodType: '$bloodType',
                        status: '$status'
                    },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get donor summary
        const donorCount = await BloodDonor.countDocuments({ bloodBankId, status: 'Active' });
        const eligibleDonorCount = await BloodDonor.countDocuments({
            bloodBankId,
            'eligibility.isEligible': true,
            status: 'Active'
        });

        // Get request summary
        const pendingRequests = await BloodRequest.countDocuments({
            bloodBankId,
            status: 'Pending'
        });

        const fulfilledRequests = await BloodRequest.countDocuments({
            bloodBankId,
            status: 'Fulfilled'
        });

        // Get recent donations (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentDonations = await BloodDonor.aggregate([
            { $match: { bloodBankId } },
            { $unwind: '$donationHistory' },
            { $match: { 'donationHistory.donationDate': { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: '$donationHistory.bloodType',
                    count: { $sum: 1 },
                    totalVolume: { $sum: '$donationHistory.quantity' }
                }
            }
        ]);

        reportData.summary = {
            inventory: inventoryData,
            donors: {
                total: donorCount,
                eligible: eligibleDonorCount
            },
            requests: {
                pending: pendingRequests,
                fulfilled: fulfilledRequests
            },
            recentDonations
        };

        res.json({
            success: true,
            message: 'Report generated successfully',
            data: reportData
        });
    } catch (error) {
        console.error('Error generating quick report:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating quick report',
            error: error.message
        });
    }
};

// Get recent activity for dashboard
export const getRecentActivity = async (req, res) => {
    try {
        const bloodBankId = req.user.userId;
        const limit = parseInt(req.query.limit) || 10;

        // Get recent requests
        const recentRequests = await BloodRequest.find({ bloodBankId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .select('requestId requestDetails status createdAt');

        // Get recent donations
        const recentDonors = await BloodDonor.find({ bloodBankId })
            .sort({ 'donationHistory.donationDate': -1 })
            .limit(limit)
            .select('donorId personalInfo donationHistory');

        res.json({
            success: true,
            data: {
                requests: recentRequests,
                donations: recentDonors
            }
        });
    } catch (error) {
        console.error('Error getting recent activity:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching recent activity',
            error: error.message
        });
    }
};

export default {
    getDashboardStats,
    createQuickBloodRequest,
    registerQuickDonor,
    initiateQualityTest,
    generateQuickReport,
    getRecentActivity
};
