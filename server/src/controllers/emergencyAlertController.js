import EmergencyAlert from '../models/EmergencyAlert.js';
import BloodInventory from '../models/BloodInventory.js';
import BloodRequest from '../models/BloodRequest.js';

// Get all emergency alerts with filtering
export const getAlerts = async (req, res) => {
    try {
        const bloodBankId = req.user.userId;
        const {
            status,
            severity,
            alertType,
            startDate,
            endDate,
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build filter query
        const filter = { bloodBankId, isActive: true };

        if (status) filter.status = status;
        if (severity) filter.severity = severity;
        if (alertType) filter.alertType = alertType;

        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Execute query with pagination
        const skip = (page - 1) * limit;
        const alerts = await EmergencyAlert.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email');

        const total = await EmergencyAlert.countDocuments(filter);

        res.json({
            success: true,
            data: alerts,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error getting alerts:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching emergency alerts',
            error: error.message
        });
    }
};

// Get single alert by ID
export const getAlertById = async (req, res) => {
    try {
        const { id } = req.params;
        const bloodBankId = req.user.userId;

        const alert = await EmergencyAlert.findOne({ _id: id, bloodBankId })
            .populate('createdBy', 'name email role')
            .populate('updatedBy', 'name email role')
            .populate('affectedInventory.inventoryId')
            .populate('affectedRequests.requestId');

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: 'Emergency alert not found'
            });
        }

        res.json({
            success: true,
            data: alert
        });
    } catch (error) {
        console.error('Error getting alert:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching emergency alert',
            error: error.message
        });
    }
};

// Create new emergency alert
export const createAlert = async (req, res) => {
    try {
        const bloodBankId = req.user.userId;
        const alertData = req.body;

        // Generate alert ID
        const alertId = await EmergencyAlert.generateAlertId(bloodBankId);

        const alert = new EmergencyAlert({
            ...alertData,
            bloodBankId,
            alertId,
            createdBy: req.user.userId
        });

        // Add initial timeline entry
        alert.addTimelineEntry(
            'Alert Created',
            req.user.userId,
            req.user.name || 'Blood Bank User',
            `Alert created with severity: ${alert.severity}`
        );

        await alert.save();

        res.status(201).json({
            success: true,
            message: 'Emergency alert created successfully',
            data: alert
        });
    } catch (error) {
        console.error('Error creating alert:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating emergency alert',
            error: error.message
        });
    }
};

// Update emergency alert
export const updateAlert = async (req, res) => {
    try {
        const { id } = req.params;
        const bloodBankId = req.user.userId;
        const updates = req.body;

        const alert = await EmergencyAlert.findOne({ _id: id, bloodBankId });

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: 'Emergency alert not found'
            });
        }

        // Update fields
        Object.keys(updates).forEach(key => {
            if (key !== '_id' && key !== 'bloodBankId' && key !== 'alertId') {
                alert[key] = updates[key];
            }
        });

        alert.updatedBy = req.user.userId;

        // Add audit trail
        alert.auditTrail.push({
            action: 'Alert Updated',
            performedBy: req.user.userId,
            performedByName: req.user.name || 'Blood Bank User',
            timestamp: new Date(),
            details: 'Alert information updated'
        });

        await alert.save();

        res.json({
            success: true,
            message: 'Emergency alert updated successfully',
            data: alert
        });
    } catch (error) {
        console.error('Error updating alert:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating emergency alert',
            error: error.message
        });
    }
};

// Delete/archive emergency alert
export const deleteAlert = async (req, res) => {
    try {
        const { id } = req.params;
        const bloodBankId = req.user.userId;

        const alert = await EmergencyAlert.findOne({ _id: id, bloodBankId });

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: 'Emergency alert not found'
            });
        }

        // Soft delete
        alert.isActive = false;
        alert.updatedBy = req.user.userId;

        alert.auditTrail.push({
            action: 'Alert Archived',
            performedBy: req.user.userId,
            performedByName: req.user.name || 'Blood Bank User',
            timestamp: new Date(),
            details: 'Alert archived/deleted'
        });

        await alert.save();

        res.json({
            success: true,
            message: 'Emergency alert archived successfully'
        });
    } catch (error) {
        console.error('Error deleting alert:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting emergency alert',
            error: error.message
        });
    }
};

// Update alert status
export const updateAlertStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, details } = req.body;
        const bloodBankId = req.user.userId;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        const alert = await EmergencyAlert.findOne({ _id: id, bloodBankId });

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: 'Emergency alert not found'
            });
        }

        alert.updateStatus(
            status,
            req.user.userId,
            req.user.name || 'Blood Bank User',
            details || ''
        );

        alert.updatedBy = req.user.userId;
        await alert.save();

        res.json({
            success: true,
            message: `Alert status updated to ${status}`,
            data: alert
        });
    } catch (error) {
        console.error('Error updating alert status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating alert status',
            error: error.message
        });
    }
};

// Add action to alert
export const addAlertAction = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, description, assignedTo, priority, dueDate } = req.body;
        const bloodBankId = req.user.userId;

        if (!action || !description) {
            return res.status(400).json({
                success: false,
                message: 'Action and description are required'
            });
        }

        const alert = await EmergencyAlert.findOne({ _id: id, bloodBankId });

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: 'Emergency alert not found'
            });
        }

        alert.addAction(
            action,
            description,
            assignedTo || req.user.userId,
            req.user.name || 'Blood Bank User',
            priority || 'Medium',
            dueDate
        );

        alert.addTimelineEntry(
            'Action Added',
            req.user.userId,
            req.user.name || 'Blood Bank User',
            `Action: ${action}`
        );

        await alert.save();

        res.json({
            success: true,
            message: 'Action added successfully',
            data: alert
        });
    } catch (error) {
        console.error('Error adding action:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding action to alert',
            error: error.message
        });
    }
};

// Upload alert attachment
export const uploadAlertAttachment = async (req, res) => {
    try {
        const { id } = req.params;
        const bloodBankId = req.user.userId;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const alert = await EmergencyAlert.findOne({ _id: id, bloodBankId });

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: 'Emergency alert not found'
            });
        }

        const attachment = {
            type: req.body.type || 'Document',
            title: req.body.title || req.file.originalname,
            fileName: req.file.originalname,
            fileUrl: req.file.path,
            uploadDate: new Date(),
            uploadedBy: req.user.userId
        };

        alert.attachments.push(attachment);

        alert.addTimelineEntry(
            'Attachment Added',
            req.user.userId,
            req.user.name || 'Blood Bank User',
            `File: ${req.file.originalname}`
        );

        await alert.save();

        res.json({
            success: true,
            message: 'Attachment uploaded successfully',
            data: attachment
        });
    } catch (error) {
        console.error('Error uploading attachment:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading attachment',
            error: error.message
        });
    }
};

// Get alert statistics
export const getAlertStatistics = async (req, res) => {
    try {
        const bloodBankId = req.user.userId;
        const { startDate, endDate } = req.query;

        const stats = await EmergencyAlert.getAlertStatistics(bloodBankId, startDate, endDate);

        // Get additional statistics
        const totalAlerts = await EmergencyAlert.countDocuments({ bloodBankId, isActive: true });
        const activeAlerts = await EmergencyAlert.countDocuments({
            bloodBankId,
            status: { $in: ['Active', 'Acknowledged', 'In Progress'] },
            isActive: true
        });
        const resolvedAlerts = await EmergencyAlert.countDocuments({
            bloodBankId,
            status: 'Resolved',
            isActive: true
        });
        const criticalAlerts = await EmergencyAlert.countDocuments({
            bloodBankId,
            severity: 'Critical',
            status: { $in: ['Active', 'Acknowledged', 'In Progress'] },
            isActive: true
        });

        res.json({
            success: true,
            data: {
                total: totalAlerts,
                active: activeAlerts,
                resolved: resolvedAlerts,
                critical: criticalAlerts,
                breakdown: stats
            }
        });
    } catch (error) {
        console.error('Error getting alert statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching alert statistics',
            error: error.message
        });
    }
};

// Get alerts by status
export const getAlertsByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        const bloodBankId = req.user.userId;

        const alerts = await EmergencyAlert.find({
            bloodBankId,
            status,
            isActive: true
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            data: alerts
        });
    } catch (error) {
        console.error('Error getting alerts by status:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching alerts by status',
            error: error.message
        });
    }
};

// Get alerts by severity
export const getAlertsBySeverity = async (req, res) => {
    try {
        const { severity } = req.params;
        const bloodBankId = req.user.userId;

        const alerts = await EmergencyAlert.find({
            bloodBankId,
            severity,
            isActive: true
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            data: alerts
        });
    } catch (error) {
        console.error('Error getting alerts by severity:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching alerts by severity',
            error: error.message
        });
    }
};

// Resolve alert
export const resolveAlert = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            resolutionMethod,
            resolutionDetails,
            followUpRequired,
            followUpDate,
            followUpActions
        } = req.body;
        const bloodBankId = req.user.userId;

        if (!resolutionMethod || !resolutionDetails) {
            return res.status(400).json({
                success: false,
                message: 'Resolution method and details are required'
            });
        }

        const alert = await EmergencyAlert.findOne({ _id: id, bloodBankId });

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: 'Emergency alert not found'
            });
        }

        alert.resolve(
            req.user.userId,
            req.user.name || 'Blood Bank User',
            resolutionMethod,
            resolutionDetails,
            followUpRequired || false,
            followUpDate,
            followUpActions || []
        );

        alert.updatedBy = req.user.userId;
        await alert.save();

        res.json({
            success: true,
            message: 'Alert resolved successfully',
            data: alert
        });
    } catch (error) {
        console.error('Error resolving alert:', error);
        res.status(500).json({
            success: false,
            message: 'Error resolving alert',
            error: error.message
        });
    }
};

// Escalate alert
export const escalateAlert = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason, actions } = req.body;
        const bloodBankId = req.user.userId;

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Escalation reason is required'
            });
        }

        const alert = await EmergencyAlert.findOne({ _id: id, bloodBankId });

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: 'Emergency alert not found'
            });
        }

        alert.escalate(
            req.user.userId,
            req.user.name || 'Blood Bank User',
            reason,
            actions || []
        );

        alert.updatedBy = req.user.userId;
        await alert.save();

        res.json({
            success: true,
            message: 'Alert escalated successfully',
            data: alert
        });
    } catch (error) {
        console.error('Error escalating alert:', error);
        res.status(500).json({
            success: false,
            message: 'Error escalating alert',
            error: error.message
        });
    }
};

// Function aliases to match route expectations
export const getEmergencyAlerts = getAlerts;
export const getEmergencyAlert = getAlertById;
export const getEmergencyAlertSummary = getAlertStatistics;
export const createEmergencyAlert = createAlert;
export const updateEmergencyAlert = updateAlert;
export const deleteEmergencyAlert = deleteAlert;
export const updateEmergencyAlertStatus = updateAlertStatus;
export const uploadEmergencyAlertAttachment = uploadAlertAttachment;
export const addEmergencyAlertAction = addAlertAction;
export const escalateEmergencyAlert = escalateAlert;
export const resolveEmergencyAlert = resolveAlert;
export const getActiveEmergencyAlerts = async (req, res) => {
    try {
        const bloodBankId = req.user.userId;
        const alerts = await EmergencyAlert.find({
            bloodBankId,
            status: { $in: ['Active', 'Acknowledged', 'In Progress'] },
            isActive: true
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            data: alerts
        });
    } catch (error) {
        console.error('Error getting active alerts:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching active alerts',
            error: error.message
        });
    }
};

export const getCriticalEmergencyAlerts = async (req, res) => {
    try {
        const bloodBankId = req.user.userId;
        const alerts = await EmergencyAlert.find({
            bloodBankId,
            severity: 'Critical',
            isActive: true
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            data: alerts
        });
    } catch (error) {
        console.error('Error getting critical alerts:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching critical alerts',
            error: error.message
        });
    }
};

export const getEmergencyAlertTimeline = async (req, res) => {
    try {
        const { id } = req.params;
        const bloodBankId = req.user.userId;

        const alert = await EmergencyAlert.findOne({ _id: id, bloodBankId });

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: 'Emergency alert not found'
            });
        }

        res.json({
            success: true,
            data: {
                alertId: alert.alertId,
                timeline: alert.timeline || []
            }
        });
    } catch (error) {
        console.error('Error getting alert timeline:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching alert timeline',
            error: error.message
        });
    }
};

export const getEmergencyAlertStatistics = getAlertStatistics;

export default {
    getAlerts,
    getAlertById,
    createAlert,
    updateAlert,
    deleteAlert,
    updateAlertStatus,
    addAlertAction,
    uploadAlertAttachment,
    getAlertStatistics,
    getAlertsByStatus,
    getAlertsBySeverity,
    resolveAlert,
    escalateAlert
};
