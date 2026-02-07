import AuditLog from '../models/AuditLog.js';
import User from '../models/User.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../middleware/cloudinary.js';
import { logAccess } from '../utils/logger.js';

// @desc    Get all audit logs with advanced filtering and pagination
// @route   GET /api/admin/audit-logs
// @access  Private (Admin only)
export const getAllAuditLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      action,
      severity,
      status,
      targetType,
      userId,
      search,
      startDate,
      endDate,
      sortBy = 'timestamp',
      sortOrder = 'desc',
      complianceOnly = false
    } = req.query;

    // Build query
    const query = {};
    
    if (action) {
      query.action = action;
    }
    
    if (severity) {
      query.severity = severity;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (targetType) {
      query.targetType = targetType;
    }
    
    if (userId) {
      query.userId = userId;
    }
    
    if (complianceOnly === 'true') {
      query.isComplianceRelevant = true;
    }
    
    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { targetName: { $regex: search, $options: 'i' } },
        { details: { $regex: search, $options: 'i' } },
        { ipAddress: { $regex: search, $options: 'i' } }
      ];
    }

    // Date range filtering
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const logs = await AuditLog.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await AuditLog.countDocuments(query);

    // Log the action
    await logAccess(req.user._id, 'VIEW', 'AuditLog', null, null, req, 
      `Viewed audit logs. Filters: ${JSON.stringify({ action, severity, status, page, limit })}`);

    res.json({
      logs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalLogs: total,
        hasNextPage: skip + logs.length < total,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get all audit logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get audit log statistics
// @route   GET /api/admin/audit-logs/stats
// @access  Private (Admin only)
export const getAuditLogStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default 30 days
    const end = endDate ? new Date(endDate) : new Date();

    // Get system stats
    const systemStats = await AuditLog.getSystemStats(start, end);
    
    // Get action stats
    const actionStats = await AuditLog.getActionStats(start, end);
    
    // Get user stats
    const userStats = await AuditLog.getUserStats(start, end);
    
    // Get security alerts
    const securityAlerts = await AuditLog.getSecurityAlerts(start, end);

    // Get compliance stats
    const complianceStats = await AuditLog.aggregate([
      {
        $match: {
          timestamp: { $gte: start, $lte: end },
          isComplianceRelevant: true
        }
      },
      {
        $group: {
          _id: null,
          totalComplianceEvents: { $sum: 1 },
          hipaaEvents: { $sum: { $cond: [{ $in: ['hipaa', '$complianceTags'] }, 1, 0] } },
          gdprEvents: { $sum: { $cond: [{ $in: ['gdpr', '$complianceTags'] }, 1, 0] } },
          soxEvents: { $sum: { $cond: [{ $in: ['sox', '$complianceTags'] }, 1, 0] } }
        }
      }
    ]);

    await logAccess(req.user._id, 'VIEW', 'AuditLogStats', null, null, req, 
      'Viewed audit log statistics');

    res.json({
      systemStats: systemStats[0] || {
        totalEvents: 0,
        criticalEvents: 0,
        highEvents: 0,
        warningEvents: 0,
        failedEvents: 0,
        blockedEvents: 0
      },
      actionStats,
      userStats: userStats.slice(0, 10), // Top 10 users
      securityAlerts: securityAlerts.slice(0, 20), // Top 20 alerts
      complianceStats: complianceStats[0] || {
        totalComplianceEvents: 0,
        hipaaEvents: 0,
        gdprEvents: 0,
        soxEvents: 0
      },
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString()
      }
    });
  } catch (error) {
    console.error('Get audit log stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single audit log by ID
// @route   GET /api/admin/audit-logs/:id
// @access  Private (Admin only)
export const getAuditLogById = async (req, res) => {
  try {
    const log = await AuditLog.findById(req.params.id).lean();

    if (!log) {
      return res.status(404).json({ message: 'Audit log not found' });
    }

    await logAccess(req.user._id, 'VIEW', 'AuditLog', req.params.id, null, req, 
      `Viewed audit log details for ${log.action}`);

    res.json(log);
  } catch (error) {
    console.error('Get audit log by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user activity
// @route   GET /api/admin/audit-logs/user/:userId
// @access  Private (Admin only)
export const getUserActivity = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      actions,
      severity,
      limit = 100,
      page = 1
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const options = {
      startDate,
      endDate,
      actions: actions ? actions.split(',') : [],
      severity: severity ? severity.split(',') : [],
      limit: parseInt(limit),
      skip
    };

    const logs = await AuditLog.getUserActivity(req.params.userId, options);
    
    // Get user info
    const user = await User.findById(req.params.userId).select('firstName lastName email role').lean();

    await logAccess(req.user._id, 'VIEW', 'UserActivity', req.params.userId, null, req, 
      `Viewed activity for user: ${user?.email || req.params.userId}`);

    res.json({
      user,
      logs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(logs.length / parseInt(limit)),
        totalLogs: logs.length,
        hasNextPage: skip + logs.length < logs.length,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new audit log
// @route   POST /api/admin/audit-logs
// @access  Private (Admin only)
export const createAuditLog = async (req, res) => {
  try {
    const {
      userId,
      action,
      targetType,
      targetId,
      targetName,
      severity,
      status,
      details,
      metadata,
      complianceTags,
      attachments
    } = req.body;

    // Validate required fields
    if (!userId || !action || !targetType || !details) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Get user information
    const user = await User.findById(userId).select('firstName lastName email role').lean();
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const auditLog = new AuditLog({
      userId,
      userEmail: user.email,
      userName: `${user.firstName} ${user.lastName}`,
      userRole: user.role,
      action,
      targetType,
      targetId,
      targetName,
      severity: severity || 'info',
      status: status || 'success',
      ipAddress: req.realIp || req.ip,
      userAgent: req.get('User-Agent'),
      requestMethod: req.method,
      requestUrl: req.originalUrl,
      requestId: req.id,
      details,
      metadata: metadata || {},
      complianceTags: complianceTags || [],
      attachments: attachments || []
    });

    await auditLog.save();

    await logAccess(req.user._id, 'CREATE', 'AuditLog', auditLog._id, null, req, 
      `Created audit log for action: ${action}`);

    res.status(201).json({
      message: 'Audit log created successfully',
      auditLog
    });
  } catch (error) {
    console.error('Create audit log error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update audit log
// @route   PUT /api/admin/audit-logs/:id
// @access  Private (Admin only)
export const updateAuditLog = async (req, res) => {
  try {
    const {
      severity,
      status,
      details,
      metadata,
      complianceTags,
      isComplianceRelevant
    } = req.body;

    const auditLog = await AuditLog.findById(req.params.id);
    if (!auditLog) {
      return res.status(404).json({ message: 'Audit log not found' });
    }

    // Update fields
    if (severity) auditLog.severity = severity;
    if (status) auditLog.status = status;
    if (details) auditLog.details = details;
    if (metadata) auditLog.metadata = { ...auditLog.metadata, ...metadata };
    if (complianceTags) auditLog.complianceTags = complianceTags;
    if (isComplianceRelevant !== undefined) auditLog.isComplianceRelevant = isComplianceRelevant;

    await auditLog.save();

    await logAccess(req.user._id, 'UPDATE', 'AuditLog', req.params.id, null, req, 
      `Updated audit log: ${auditLog.action}`);

    res.json({
      message: 'Audit log updated successfully',
      auditLog
    });
  } catch (error) {
    console.error('Update audit log error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add attachment to audit log
// @route   POST /api/admin/audit-logs/:id/attachments
// @access  Private (Admin only)
export const addAttachment = async (req, res) => {
  try {
    const auditLog = await AuditLog.findById(req.params.id);
    if (!auditLog) {
      return res.status(404).json({ message: 'Audit log not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file, 'audit-attachments');

    const attachment = {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      filename: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size
    };

    await auditLog.addAttachment(attachment);

    await logAccess(req.user._id, 'UPDATE', 'AuditLog', req.params.id, null, req, 
      `Added attachment to audit log: ${req.file.originalname}`);

    res.json({
      message: 'Attachment added successfully',
      attachment
    });
  } catch (error) {
    console.error('Add attachment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove attachment from audit log
// @route   DELETE /api/admin/audit-logs/:id/attachments/:attachmentId
// @access  Private (Admin only)
export const removeAttachment = async (req, res) => {
  try {
    const { id, attachmentId } = req.params;

    const auditLog = await AuditLog.findById(id);
    if (!auditLog) {
      return res.status(404).json({ message: 'Audit log not found' });
    }

    const attachment = auditLog.attachments.id(attachmentId);
    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    // Delete from Cloudinary
    if (attachment.publicId) {
      await deleteFromCloudinary(attachment.publicId);
    }

    // Remove from audit log
    auditLog.attachments.pull(attachmentId);
    await auditLog.save();

    await logAccess(req.user._id, 'UPDATE', 'AuditLog', id, null, req, 
      `Removed attachment from audit log: ${attachment.filename}`);

    res.json({
      message: 'Attachment removed successfully'
    });
  } catch (error) {
    console.error('Remove attachment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Export audit logs
// @route   GET /api/admin/audit-logs/export
// @access  Private (Admin only)
export const exportAuditLogs = async (req, res) => {
  try {
    const {
      format = 'json',
      startDate,
      endDate,
      action,
      severity,
      status,
      targetType,
      userId,
      complianceOnly
    } = req.query;

    // Build query (same as getAllAuditLogs)
    const query = {};
    
    if (action) query.action = action;
    if (severity) query.severity = severity;
    if (status) query.status = status;
    if (targetType) query.targetType = targetType;
    if (userId) query.userId = userId;
    if (complianceOnly === 'true') query.isComplianceRelevant = true;
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const logs = await AuditLog.find(query).sort({ timestamp: -1 }).lean();

    await logAccess(req.user._id, 'EXPORT', 'AuditLog', null, null, req, 
      `Exported ${logs.length} audit logs as ${format}`);

    if (format === 'csv') {
      // Convert to CSV
      const csvHeaders = [
        'Timestamp', 'User', 'Email', 'Role', 'Action', 'Target Type', 'Target Name',
        'Severity', 'Status', 'IP Address', 'Details', 'Compliance Relevant'
      ];
      
      const csvData = logs.map(log => [
        log.timestamp,
        log.userName,
        log.userEmail,
        log.userRole,
        log.action,
        log.targetType,
        log.targetName || '',
        log.severity,
        log.status,
        log.ipAddress,
        log.details,
        log.isComplianceRelevant ? 'Yes' : 'No'
      ]);

      const csvContent = [csvHeaders, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=audit-logs-${Date.now()}.csv`);
      res.send(csvContent);
    } else {
      // JSON format
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=audit-logs-${Date.now()}.json`);
      res.json(logs);
    }
  } catch (error) {
    console.error('Export audit logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get audit log suggestions for search
// @route   GET /api/admin/audit-logs/suggestions
// @access  Private (Admin only)
export const getAuditLogSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }

    const suggestions = await AuditLog.aggregate([
      {
        $match: {
          $or: [
            { userName: { $regex: q, $options: 'i' } },
            { userEmail: { $regex: q, $options: 'i' } },
            { action: { $regex: q, $options: 'i' } },
            { targetName: { $regex: q, $options: 'i' } }
          ]
        }
      },
      {
        $group: {
          _id: {
            type: '$action',
            value: '$action'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const formattedSuggestions = suggestions.map(s => ({
      type: 'action',
      value: s._id.value,
      label: s._id.value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count: s.count
    }));

    res.json({ suggestions: formattedSuggestions });
  } catch (error) {
    console.error('Get audit log suggestions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Bulk operations on audit logs
// @route   POST /api/admin/audit-logs/bulk
// @access  Private (Admin only)
export const bulkAuditLogOperations = async (req, res) => {
  try {
    const { operation, logIds, data } = req.body;

    if (!logIds || !Array.isArray(logIds) || logIds.length === 0) {
      return res.status(400).json({ message: 'Log IDs are required' });
    }

    let result;
    let operationLog = '';

    switch (operation) {
      case 'mark_compliance':
        result = await AuditLog.updateMany(
          { _id: { $in: logIds } },
          { 
            isComplianceRelevant: true,
            complianceTags: data?.tags || []
          }
        );
        operationLog = `Marked ${result.modifiedCount} logs as compliance relevant`;
        break;

      case 'update_severity':
        if (!data?.severity) {
          return res.status(400).json({ message: 'Severity is required' });
        }
        result = await AuditLog.updateMany(
          { _id: { $in: logIds } },
          { severity: data.severity }
        );
        operationLog = `Updated severity to ${data.severity} for ${result.modifiedCount} logs`;
        break;

      case 'add_tags':
        if (!data?.tags || !Array.isArray(data.tags)) {
          return res.status(400).json({ message: 'Tags array is required' });
        }
        result = await AuditLog.updateMany(
          { _id: { $in: logIds } },
          { $addToSet: { complianceTags: { $each: data.tags } } }
        );
        operationLog = `Added tags ${data.tags.join(', ')} to ${result.modifiedCount} logs`;
        break;

      default:
        return res.status(400).json({ message: 'Invalid operation' });
    }

    await logAccess(req.user._id, 'BULK_UPDATE', 'AuditLog', null, null, req, operationLog);

    res.json({
      message: 'Bulk operation completed successfully',
      modifiedCount: result.modifiedCount,
      operation
    });
  } catch (error) {
    console.error('Bulk audit log operations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete audit log (soft delete for compliance)
// @route   DELETE /api/admin/audit-logs/:id
// @access  Private (Admin only)
export const deleteAuditLog = async (req, res) => {
  try {
    const auditLog = await AuditLog.findById(req.params.id);
    if (!auditLog) {
      return res.status(404).json({ message: 'Audit log not found' });
    }

    // For compliance reasons, we don't actually delete audit logs
    // Instead, we mark them as archived
    auditLog.metadata.archived = true;
    auditLog.metadata.archivedAt = new Date();
    auditLog.metadata.archivedBy = req.user._id;
    await auditLog.save();

    await logAccess(req.user._id, 'DELETE', 'AuditLog', req.params.id, null, req, 
      `Archived audit log: ${auditLog.action}`);

    res.json({
      message: 'Audit log archived successfully'
    });
  } catch (error) {
    console.error('Delete audit log error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 