import DashboardStats from '../models/DashboardStats.js';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import HealthRecord from '../models/HealthRecord.js';
import Proof from '../models/Proof.js';
import InsuranceClaim from '../models/InsuranceClaim.js';
import AuditLog from '../models/AuditLog.js';
import Session from '../models/Session.js';
import os from 'os';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Get all dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    // Get latest stats
    const stats = await DashboardStats.getLatestStats();
    
    // If stats exist and are recent (less than 5 minutes old), return them
    if (stats && (Date.now() - new Date(stats.lastUpdated).getTime()) < 5 * 60 * 1000) {
      return res.json(stats);
    }

    // Otherwise, generate new stats
    const newStats = await generateDashboardStats();
    res.json(newStats);
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
};

// Get system health metrics
export const getSystemHealth = async (req, res) => {
  try {
    const systemHealth = await generateSystemHealthMetrics();
    res.json(systemHealth);
  } catch (error) {
    console.error('Error getting system health:', error);
    res.status(500).json({ message: 'Error fetching system health metrics' });
  }
};

// Get user statistics
export const getUserStats = async (req, res) => {
  try {
    const userStats = await generateUserStats();
    res.json(userStats);
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({ message: 'Error fetching user statistics' });
  }
};

// Get activity metrics
export const getActivityMetrics = async (req, res) => {
  try {
    const activityMetrics = await generateActivityMetrics();
    res.json(activityMetrics);
  } catch (error) {
    console.error('Error getting activity metrics:', error);
    res.status(500).json({ message: 'Error fetching activity metrics' });
  }
};

// Get security metrics
export const getSecurityMetrics = async (req, res) => {
  try {
    const securityMetrics = await generateSecurityMetrics();
    res.json(securityMetrics);
  } catch (error) {
    console.error('Error getting security metrics:', error);
    res.status(500).json({ message: 'Error fetching security metrics' });
  }
};

// Get compliance metrics
export const getComplianceMetrics = async (req, res) => {
  try {
    const complianceMetrics = await generateComplianceMetrics();
    res.json(complianceMetrics);
  } catch (error) {
    console.error('Error getting compliance metrics:', error);
    res.status(500).json({ message: 'Error fetching compliance metrics' });
  }
};

// Get storage metrics
export const getStorageMetrics = async (req, res) => {
  try {
    const storageMetrics = await generateStorageMetrics();
    res.json(storageMetrics);
  } catch (error) {
    console.error('Error getting storage metrics:', error);
    res.status(500).json({ message: 'Error fetching storage metrics' });
  }
};

// Get performance metrics
export const getPerformanceMetrics = async (req, res) => {
  try {
    const performanceMetrics = await generatePerformanceMetrics();
    res.json(performanceMetrics);
  } catch (error) {
    console.error('Error getting performance metrics:', error);
    res.status(500).json({ message: 'Error fetching performance metrics' });
  }
};

// Get audit metrics
export const getAuditMetrics = async (req, res) => {
  try {
    const auditMetrics = await generateAuditMetrics();
    res.json(auditMetrics);
  } catch (error) {
    console.error('Error getting audit metrics:', error);
    res.status(500).json({ message: 'Error fetching audit metrics' });
  }
};

// Get time-based metrics
export const getTimeBasedMetrics = async (req, res) => {
  try {
    const { timeframe = 'daily', limit = 7 } = req.query;
    const metrics = await DashboardStats.getTimeBasedMetrics(timeframe, parseInt(limit));
    res.json(metrics);
  } catch (error) {
    console.error('Error getting time-based metrics:', error);
    res.status(500).json({ message: 'Error fetching time-based metrics' });
  }
};

// Get geographical distribution
export const getGeographicalDistribution = async (req, res) => {
  try {
    const distribution = await DashboardStats.getGeographicalDistribution();
    res.json(distribution);
  } catch (error) {
    console.error('Error getting geographical distribution:', error);
    res.status(500).json({ message: 'Error fetching geographical distribution' });
  }
};

// Helper function to generate all dashboard statistics
const generateDashboardStats = async () => {
  const [
    systemHealth,
    userStats,
    activityMetrics,
    securityMetrics,
    complianceMetrics,
    storageMetrics,
    performanceMetrics,
    auditMetrics,
    timeBasedMetrics,
    geographicalMetrics
  ] = await Promise.all([
    generateSystemHealthMetrics(),
    generateUserStats(),
    generateActivityMetrics(),
    generateSecurityMetrics(),
    generateComplianceMetrics(),
    generateStorageMetrics(),
    generatePerformanceMetrics(),
    generateAuditMetrics(),
    generateTimeBasedMetrics(),
    generateGeographicalMetrics()
  ]);

  const dashboardStats = new DashboardStats({
    systemHealth,
    userStats,
    activityMetrics,
    securityMetrics,
    complianceMetrics,
    storageMetrics,
    performanceMetrics,
    auditMetrics,
    timeBasedMetrics,
    geographicalMetrics,
    lastUpdated: new Date()
  });

  await dashboardStats.save();
  return dashboardStats;
};

// Helper function to generate system health metrics
const generateSystemHealthMetrics = async () => {
  return {
    cpuUsage: os.loadavg()[0] * 100,
    memoryUsage: (os.totalmem() - os.freemem()) / os.totalmem() * 100,
    diskUsage: 75, // Example value, implement actual disk usage check
    uptime: os.uptime(),
    lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000), // Example
    activeConnections: 150, // Example value
    responseTime: 250, // Example value in ms
    errorRate: 0.5 // Example value in percentage
  };
};

// Helper function to generate user statistics
const generateUserStats = async () => {
  const now = new Date();
  const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    activeUsers,
    newUsers,
    usersByRole,
    verifiedUsers,
    suspendedUsers
  ] = await Promise.all([
    User.countDocuments(),
    Session.countDocuments({ lastActivity: { $gte: oneDayAgo } }),
    User.countDocuments({ createdAt: { $gte: oneDayAgo } }),
    User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]),
    User.countDocuments({ isVerified: true }),
    User.countDocuments({ isSuspended: true })
  ]);

  const roleCount = {};
  usersByRole.forEach(role => {
    roleCount[role._id] = role.count;
  });

  return {
    totalUsers,
    activeUsers,
    newUsers,
    usersByRole: {
      admin: roleCount.admin || 0,
      doctor: roleCount.doctor || 0,
      patient: roleCount.patient || 0,
      insurance: roleCount.insurance || 0,
      researcher: roleCount.researcher || 0
    },
    onlineUsers: activeUsers,
    verifiedUsers,
    suspendedUsers
  };
};

// Helper function to generate activity metrics
const generateActivityMetrics = async () => {
  const [
    totalAppointments,
    pendingAppointments,
    completedAppointments,
    totalHealthRecords,
    recordsShared,
    totalProofs,
    proofsVerified,
    totalClaims,
    claimsProcessed
  ] = await Promise.all([
    Appointment.countDocuments(),
    Appointment.countDocuments({ status: 'pending' }),
    Appointment.countDocuments({ status: 'completed' }),
    HealthRecord.countDocuments(),
    HealthRecord.countDocuments({ shared: true }),
    Proof.countDocuments(),
    Proof.countDocuments({ verified: true }),
    InsuranceClaim.countDocuments(),
    InsuranceClaim.countDocuments({ status: 'processed' })
  ]);

  return {
    totalAppointments,
    pendingAppointments,
    completedAppointments,
    totalHealthRecords,
    recordsShared,
    totalProofs,
    proofsVerified,
    totalClaims,
    claimsProcessed
  };
};

// Helper function to generate security metrics
const generateSecurityMetrics = async () => {
  const now = new Date();
  const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);

  const [
    failedLogins,
    securityAlerts,
    activeSessionsCount,
    twoFactorEnabled,
    suspiciousActivities
  ] = await Promise.all([
    AuditLog.countDocuments({
      action: 'login_failed',
      timestamp: { $gte: oneDayAgo }
    }),
    AuditLog.countDocuments({
      severity: 'high',
      timestamp: { $gte: oneDayAgo }
    }),
    Session.countDocuments({ active: true }),
    User.countDocuments({ twoFactorEnabled: true }),
    AuditLog.countDocuments({
      action: 'security_alert',
      timestamp: { $gte: oneDayAgo }
    })
  ]);

  return {
    failedLogins,
    securityAlerts,
    activeSessionsCount,
    twoFactorEnabled,
    dataBreachAttempts: securityAlerts,
    suspiciousActivities
  };
};

// Helper function to generate compliance metrics
const generateComplianceMetrics = async () => {
  const [
    totalUsers,
    compliantUsers,
    encryptedRecords,
    totalRecords,
    pendingConsents,
    expiredConsents
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ privacyConsent: true }),
    HealthRecord.countDocuments({ isEncrypted: true }),
    HealthRecord.countDocuments(),
    User.countDocuments({ pendingConsent: true }),
    User.countDocuments({ consentExpired: true })
  ]);

  return {
    hipaaCompliance: totalUsers > 0 ? (compliantUsers / totalUsers) * 100 : 0,
    gdprCompliance: totalUsers > 0 ? (compliantUsers / totalUsers) * 100 : 0,
    dataEncrypted: totalRecords > 0 ? (encryptedRecords / totalRecords) * 100 : 0,
    pendingConsents,
    expiredConsents,
    dataRetentionAlerts: expiredConsents
  };
};

// Helper function to generate storage metrics
const generateStorageMetrics = async () => {
  try {
    // Get Cloudinary storage metrics
    const cloudinaryStats = await cloudinary.api.usage();
    
    const [
      documentsCount,
      imageCount,
      videoCount,
      audioCount
    ] = await Promise.all([
      HealthRecord.countDocuments({ type: 'document' }),
      HealthRecord.countDocuments({ type: 'image' }),
      HealthRecord.countDocuments({ type: 'video' }),
      HealthRecord.countDocuments({ type: 'audio' })
    ]);

    const totalFiles = documentsCount + imageCount + videoCount + audioCount;
    const averageFileSize = totalFiles > 0 ? cloudinaryStats.storage.used / totalFiles : 0;

    return {
      totalStorage: cloudinaryStats.storage.max,
      usedStorage: cloudinaryStats.storage.used,
      documentsCount,
      imageCount,
      videoCount,
      audioCount,
      averageFileSize
    };
  } catch (error) {
    console.error('Error getting storage metrics:', error);
    return {
      totalStorage: 0,
      usedStorage: 0,
      documentsCount: 0,
      imageCount: 0,
      videoCount: 0,
      audioCount: 0,
      averageFileSize: 0
    };
  }
};

// Helper function to generate performance metrics
const generatePerformanceMetrics = async () => {
  // This would typically come from your APM (Application Performance Monitoring) system
  return {
    averageResponseTime: 250, // Example value in ms
    apiCallsPerMinute: 100, // Example value
    errorRate: 0.5, // Example value in percentage
    slowestEndpoints: [
      { endpoint: '/api/health-records', responseTime: 500, callCount: 1000 },
      { endpoint: '/api/proofs/verify', responseTime: 450, callCount: 800 },
      { endpoint: '/api/appointments', responseTime: 400, callCount: 1200 }
    ],
    databaseQueryTime: 100 // Example value in ms
  };
};

// Helper function to generate audit metrics
const generateAuditMetrics = async () => {
  const [
    totalAuditLogs,
    criticalEvents,
    highSeverityEvents,
    complianceEvents,
    dataAccessEvents
  ] = await Promise.all([
    AuditLog.countDocuments(),
    AuditLog.countDocuments({ severity: 'critical' }),
    AuditLog.countDocuments({ severity: 'high' }),
    AuditLog.countDocuments({ isComplianceRelevant: true }),
    AuditLog.countDocuments({ action: /access|view|download/ })
  ]);

  return {
    totalAuditLogs,
    criticalEvents,
    highSeverityEvents,
    complianceEvents,
    dataAccessEvents
  };
};

// Helper function to generate time-based metrics
const generateTimeBasedMetrics = async () => {
  const now = new Date();
  const hourlyMetrics = [];
  const dailyMetrics = [];
  const weeklyMetrics = [];

  // Generate hourly metrics for the last 24 hours
  for (let i = 0; i < 24; i++) {
    const hourStart = new Date(now - i * 60 * 60 * 1000);
    const hourEnd = new Date(hourStart - 60 * 60 * 1000);
    
    const [activeUsers, apiCalls, errorCount] = await Promise.all([
      Session.countDocuments({
        lastActivity: { $gte: hourEnd, $lt: hourStart }
      }),
      AuditLog.countDocuments({
        timestamp: { $gte: hourEnd, $lt: hourStart }
      }),
      AuditLog.countDocuments({
        timestamp: { $gte: hourEnd, $lt: hourStart },
        status: 'error'
      })
    ]);

    hourlyMetrics.push({
      hour: hourStart.getHours(),
      activeUsers,
      apiCalls,
      errorCount
    });
  }

  // Generate daily metrics for the last 7 days
  for (let i = 0; i < 7; i++) {
    const dayStart = new Date(now - i * 24 * 60 * 60 * 1000);
    const dayEnd = new Date(dayStart - 24 * 60 * 60 * 1000);
    
    const [activeUsers, newUsers, totalCalls] = await Promise.all([
      Session.countDocuments({
        lastActivity: { $gte: dayEnd, $lt: dayStart }
      }),
      User.countDocuments({
        createdAt: { $gte: dayEnd, $lt: dayStart }
      }),
      AuditLog.countDocuments({
        timestamp: { $gte: dayEnd, $lt: dayStart }
      })
    ]);

    dailyMetrics.push({
      date: dayStart,
      activeUsers,
      newUsers,
      totalCalls
    });
  }

  // Generate weekly metrics for the last 4 weeks
  for (let i = 0; i < 4; i++) {
    const weekStart = new Date(now - i * 7 * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(weekStart - 7 * 24 * 60 * 60 * 1000);
    
    const [activeUsers, newUsers, totalCalls] = await Promise.all([
      Session.countDocuments({
        lastActivity: { $gte: weekEnd, $lt: weekStart }
      }),
      User.countDocuments({
        createdAt: { $gte: weekEnd, $lt: weekStart }
      }),
      AuditLog.countDocuments({
        timestamp: { $gte: weekEnd, $lt: weekStart }
      })
    ]);

    weeklyMetrics.push({
      week: Math.ceil(weekStart.getDate() / 7),
      activeUsers,
      newUsers,
      totalCalls
    });
  }

  return {
    hourly: hourlyMetrics,
    daily: dailyMetrics,
    weekly: weeklyMetrics
  };
};

// Helper function to generate geographical metrics
const generateGeographicalMetrics = async () => {
  const geoMetrics = await User.aggregate([
    {
      $group: {
        _id: {
          country: '$location.country',
          region: '$location.region'
        },
        userCount: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'auditlogs',
        let: { country: '$_id.country', region: '$_id.region' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$location.country', '$$country'] },
                  { $eq: ['$location.region', '$$region'] }
                ]
              }
            }
          },
          { $count: 'activityCount' }
        ],
        as: 'activity'
      }
    },
    {
      $project: {
        _id: 0,
        country: '$_id.country',
        region: '$_id.region',
        userCount: 1,
        activityCount: { $first: '$activity.activityCount' }
      }
    }
  ]);

  return geoMetrics;
};

export default {
  getDashboardStats,
  getSystemHealth,
  getUserStats,
  getActivityMetrics,
  getSecurityMetrics,
  getComplianceMetrics,
  getStorageMetrics,
  getTimeBasedMetrics,
  getGeographicalDistribution
}; 