import { getAccessLogs as getAccessLogsUtil } from '../utils/logger.js';
import AccessLog from '../models/AccessLog.js';
import { notifyUser } from '../services/notificationService.js';

// @desc    Get access logs for the authenticated user only
// @route   GET /api/access-logs
// @access  Private (Patient/Doctor/Any user)
export const getAccessLogs = async (req, res) => {
  try {
    // Always filter by the authenticated user's ID
    console.log('Getting access logs for user:', req.user._id);
    const logs = await AccessLog.find({ userId: req.user._id }).sort({ timestamp: -1 }).limit(100);
    console.log(`Found ${logs.length} logs for user ${req.user._id}`);
    res.json({ logs });
  } catch (error) {
    console.error('Get access logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get access log statistics
// @route   GET /api/access-logs/stats
// @access  Private
export const getAccessLogStats = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get action statistics
    const actionStats = await AccessLog.aggregate([
      {
        $match: {
          userId: req.user._id,
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get resource type statistics
    const resourceStats = await AccessLog.aggregate([
      {
        $match: {
          userId: req.user._id,
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$resourceType',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get daily activity
    const dailyActivity = await AccessLog.aggregate([
      {
        $match: {
          userId: req.user._id,
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$timestamp'
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get recent activity
    const recentActivity = await AccessLog.find({
      userId: req.user._id
    })
    .sort({ timestamp: -1 })
    .limit(10);

    res.json({
      actionStats,
      resourceStats,
      dailyActivity,
      recentActivity,
      totalLogs: recentActivity.length
    });
  } catch (error) {
    console.error('Get access log stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get access logs for admin (all users)
// @route   GET /api/admin/access-logs
// @access  Private (Admin only)
export const getAllAccessLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, userId, action, resourceType, startDate, endDate } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    
    if (userId) query.userId = userId;
    if (action) query.action = action;
    if (resourceType) query.resourceType = resourceType;
    if (startDate) query.timestamp = { $gte: new Date(startDate) };
    if (endDate) {
      if (query.timestamp) {
        query.timestamp.$lte = new Date(endDate);
      } else {
        query.timestamp = { $lte: new Date(endDate) };
      }
    }

    const logs = await AccessLog.find(query)
      .populate('userId', 'firstName lastName email role')
      .populate('targetUserId', 'firstName lastName email role')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await AccessLog.countDocuments(query);

    res.json({
      logs,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get all access logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Export access logs
// @route   GET /api/access-logs/export
// @access  Private
export const exportAccessLogs = async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;

    const query = { userId: req.user._id };
    
    if (startDate) query.timestamp = { $gte: new Date(startDate) };
    if (endDate) {
      if (query.timestamp) {
        query.timestamp.$lte = new Date(endDate);
      } else {
        query.timestamp = { $lte: new Date(endDate) };
      }
    }

    const logs = await AccessLog.find(query)
      .sort({ timestamp: -1 })
      .limit(1000); // Limit to prevent memory issues

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeader = 'Timestamp,Action,Resource Type,Resource ID,IP Address,User Agent\n';
      const csvData = logs.map(log => 
        `${log.timestamp},${log.action},${log.resourceType},${log.resourceId || ''},${log.ipAddress},${log.userAgent || ''}`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=access-logs.csv');
      res.send(csvHeader + csvData);
    } else {
      res.json({
        logs,
        exportDate: new Date(),
        totalRecords: logs.length
      });
    }
  } catch (error) {
    console.error('Export access logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 

// @desc    Bulk delete access logs
// @route   DELETE /api/access-logs/bulk-delete
// @access  Private
export const bulkDeleteAccessLogs = async (req, res) => {
  try {
    const { logIds } = req.body;
    
    if (!logIds || !Array.isArray(logIds) || logIds.length === 0) {
      return res.status(400).json({ message: 'Log IDs array is required' });
    }

    // Only allow deletion of user's own logs
    const result = await AccessLog.deleteMany({
      _id: { $in: logIds },
      userId: req.user._id
    });

    // Emit real-time update for deleted logs
    notifyUser(req.user._id, 'logs_deleted', {
      logIds,
      timestamp: new Date().toISOString()
    });

    res.json({
      message: `${result.deletedCount} logs deleted successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Bulk delete access logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 