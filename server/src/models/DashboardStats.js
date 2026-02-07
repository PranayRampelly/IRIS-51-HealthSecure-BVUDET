import mongoose from 'mongoose';

const dashboardStatsSchema = new mongoose.Schema({
  // System Health Metrics
  systemHealth: {
    cpuUsage: Number,
    memoryUsage: Number,
    diskUsage: Number,
    uptime: Number,
    lastBackup: Date,
    activeConnections: Number,
    responseTime: Number,
    errorRate: Number
  },

  // User Statistics
  userStats: {
    totalUsers: Number,
    activeUsers: Number,
    newUsers: Number, // Last 24 hours
    usersByRole: {
      admin: Number,
      doctor: Number,
      patient: Number,
      insurance: Number,
      researcher: Number
    },
    onlineUsers: Number,
    verifiedUsers: Number,
    suspendedUsers: Number
  },

  // Activity Metrics
  activityMetrics: {
    totalAppointments: Number,
    pendingAppointments: Number,
    completedAppointments: Number,
    totalHealthRecords: Number,
    recordsShared: Number,
    totalProofs: Number,
    proofsVerified: Number,
    totalClaims: Number,
    claimsProcessed: Number
  },

  // Security Metrics
  securityMetrics: {
    failedLogins: Number,
    securityAlerts: Number,
    activeSessionsCount: Number,
    twoFactorEnabled: Number,
    dataBreachAttempts: Number,
    suspiciousActivities: Number
  },

  // Compliance Metrics
  complianceMetrics: {
    hipaaCompliance: Number, // Percentage
    gdprCompliance: Number, // Percentage
    dataEncrypted: Number, // Percentage
    pendingConsents: Number,
    expiredConsents: Number,
    dataRetentionAlerts: Number
  },

  // Storage Metrics
  storageMetrics: {
    totalStorage: Number, // In bytes
    usedStorage: Number, // In bytes
    documentsCount: Number,
    imageCount: Number,
    videoCount: Number,
    audioCount: Number,
    averageFileSize: Number
  },

  // Performance Metrics
  performanceMetrics: {
    averageResponseTime: Number, // In milliseconds
    apiCallsPerMinute: Number,
    errorRate: Number, // Percentage
    slowestEndpoints: [{
      endpoint: String,
      responseTime: Number,
      callCount: Number
    }],
    databaseQueryTime: Number
  },

  // Revenue Metrics (if applicable)
  revenueMetrics: {
    totalRevenue: Number,
    monthlyRevenue: Number,
    pendingPayments: Number,
    successfulTransactions: Number,
    failedTransactions: Number,
    averageTransactionValue: Number
  },

  // Audit Metrics
  auditMetrics: {
    totalAuditLogs: Number,
    criticalEvents: Number,
    highSeverityEvents: Number,
    complianceEvents: Number,
    dataAccessEvents: Number
  },

  // Time-based Metrics
  timeBasedMetrics: {
    hourly: [{
      hour: Number,
      activeUsers: Number,
      apiCalls: Number,
      errorCount: Number
    }],
    daily: [{
      date: Date,
      activeUsers: Number,
      newUsers: Number,
      totalCalls: Number
    }],
    weekly: [{
      week: Number,
      activeUsers: Number,
      newUsers: Number,
      totalCalls: Number
    }]
  },

  // Geographical Distribution
  geographicalMetrics: [{
    country: String,
    region: String,
    userCount: Number,
    activityCount: Number
  }],

  // Update Information
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  
  // Update Frequency
  updateInterval: {
    type: Number, // In minutes
    default: 5
  }
}, {
  timestamps: true
});

// Indexes for better query performance
dashboardStatsSchema.index({ 'lastUpdated': -1 });
dashboardStatsSchema.index({ 'timeBasedMetrics.daily.date': -1 });
dashboardStatsSchema.index({ 'geographicalMetrics.country': 1 });

// Static method to get latest stats
dashboardStatsSchema.statics.getLatestStats = async function() {
  return this.findOne().sort({ lastUpdated: -1 }).lean();
};

// Static method to get time-based metrics
dashboardStatsSchema.statics.getTimeBasedMetrics = async function(timeframe = 'daily', limit = 7) {
  const stats = await this.findOne().sort({ lastUpdated: -1 }).lean();
  return stats?.timeBasedMetrics?.[timeframe]?.slice(-limit) || [];
};

// Static method to get geographical distribution
dashboardStatsSchema.statics.getGeographicalDistribution = async function() {
  const stats = await this.findOne().sort({ lastUpdated: -1 }).lean();
  return stats?.geographicalMetrics || [];
};

// Static method to get system health
dashboardStatsSchema.statics.getSystemHealth = async function() {
  const stats = await this.findOne().sort({ lastUpdated: -1 }).lean();
  return stats?.systemHealth || {};
};

// Static method to get security metrics
dashboardStatsSchema.statics.getSecurityMetrics = async function() {
  const stats = await this.findOne().sort({ lastUpdated: -1 }).lean();
  return stats?.securityMetrics || {};
};

// Static method to get compliance metrics
dashboardStatsSchema.statics.getComplianceMetrics = async function() {
  const stats = await this.findOne().sort({ lastUpdated: -1 }).lean();
  return stats?.complianceMetrics || {};
};

// Pre-save middleware to calculate some metrics
dashboardStatsSchema.pre('save', function(next) {
  // Calculate storage percentages
  if (this.storageMetrics?.totalStorage > 0) {
    this.storageMetrics.usagePercentage = 
      (this.storageMetrics.usedStorage / this.storageMetrics.totalStorage) * 100;
  }

  // Update lastUpdated timestamp
  this.lastUpdated = new Date();

  next();
});

const DashboardStats = mongoose.model('DashboardStats', dashboardStatsSchema);

export default DashboardStats; 