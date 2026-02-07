// Admin Dashboard Service
const API_BASE_URL = 'http://localhost:5000/api';

// Types
export interface SystemHealth {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  uptime: number;
  lastBackup: Date;
  activeConnections: number;
  responseTime: number;
  errorRate: number;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  usersByRole: {
    admin: number;
    doctor: number;
    patient: number;
    insurance: number;
    researcher: number;
  };
  onlineUsers: number;
  verifiedUsers: number;
  suspendedUsers: number;
}

export interface ActivityMetrics {
  totalAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  totalHealthRecords: number;
  recordsShared: number;
  totalProofs: number;
  proofsVerified: number;
  totalClaims: number;
  claimsProcessed: number;
}

export interface SecurityMetrics {
  failedLogins: number;
  securityAlerts: number;
  activeSessionsCount: number;
  twoFactorEnabled: number;
  dataBreachAttempts: number;
  suspiciousActivities: number;
}

export interface ComplianceMetrics {
  hipaaCompliance: number;
  gdprCompliance: number;
  dataEncrypted: number;
  pendingConsents: number;
  expiredConsents: number;
  dataRetentionAlerts: number;
}

export interface StorageMetrics {
  totalStorage: number;
  usedStorage: number;
  documentsCount: number;
  imageCount: number;
  videoCount: number;
  audioCount: number;
  averageFileSize: number;
  usagePercentage?: number;
}

export interface PerformanceMetrics {
  averageResponseTime: number;
  apiCallsPerMinute: number;
  errorRate: number;
  slowestEndpoints: Array<{
    endpoint: string;
    responseTime: number;
    callCount: number;
  }>;
  databaseQueryTime: number;
}

export interface AuditMetrics {
  totalAuditLogs: number;
  criticalEvents: number;
  highSeverityEvents: number;
  complianceEvents: number;
  dataAccessEvents: number;
}

export interface TimeBasedMetrics {
  hourly: Array<{
    hour: number;
    activeUsers: number;
    apiCalls: number;
    errorCount: number;
  }>;
  daily: Array<{
    date: Date;
    activeUsers: number;
    newUsers: number;
    totalCalls: number;
  }>;
  weekly: Array<{
    week: number;
    activeUsers: number;
    newUsers: number;
    totalCalls: number;
  }>;
}

export interface GeographicalMetrics {
  country: string;
  region: string;
  userCount: number;
  activityCount: number;
}

export interface DashboardStats {
  systemHealth: SystemHealth;
  userStats: UserStats;
  activityMetrics: ActivityMetrics;
  securityMetrics: SecurityMetrics;
  complianceMetrics: ComplianceMetrics;
  storageMetrics: StorageMetrics;
  performanceMetrics: PerformanceMetrics;
  auditMetrics: AuditMetrics;
  timeBasedMetrics: TimeBasedMetrics;
  geographicalMetrics: GeographicalMetrics[];
  lastUpdated: Date;
  updateInterval: number;
}

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

// API request helper
const apiRequest = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const token = getAuthToken();
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Dashboard API Functions
export const adminDashboardService = {
  // Get all dashboard statistics
  getDashboardStats: async (): Promise<DashboardStats> => {
    return apiRequest('/admin/dashboard/stats');
  },

  // Get system health metrics
  getSystemHealth: async (): Promise<SystemHealth> => {
    return apiRequest('/admin/dashboard/system-health');
  },

  // Get user statistics
  getUserStats: async (): Promise<UserStats> => {
    return apiRequest('/admin/dashboard/user-stats');
  },

  // Get activity metrics
  getActivityMetrics: async (): Promise<ActivityMetrics> => {
    return apiRequest('/admin/dashboard/activity-metrics');
  },

  // Get security metrics
  getSecurityMetrics: async (): Promise<SecurityMetrics> => {
    return apiRequest('/admin/dashboard/security-metrics');
  },

  // Get compliance metrics
  getComplianceMetrics: async (): Promise<ComplianceMetrics> => {
    return apiRequest('/admin/dashboard/compliance-metrics');
  },

  // Get storage metrics
  getStorageMetrics: async (): Promise<StorageMetrics> => {
    return apiRequest('/admin/dashboard/storage-metrics');
  },

  // Get time-based metrics
  getTimeBasedMetrics: async (timeframe: 'hourly' | 'daily' | 'weekly' = 'daily', limit?: number): Promise<TimeBasedMetrics> => {
    const params = new URLSearchParams();
    if (timeframe) params.append('timeframe', timeframe);
    if (limit) params.append('limit', limit.toString());
    return apiRequest(`/admin/dashboard/time-metrics?${params.toString()}`);
  },

  // Get geographical distribution
  getGeographicalDistribution: async (): Promise<GeographicalMetrics[]> => {
    return apiRequest('/admin/dashboard/geo-distribution');
  }
};

// Utility functions
export const dashboardUtils = {
  // Format bytes to human readable size
  formatBytes: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Format number with commas
  formatNumber: (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },

  // Format percentage
  formatPercentage: (num: number): string => {
    return `${num.toFixed(1)}%`;
  },

  // Format duration in seconds to human readable time
  formatDuration: (seconds: number): string => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  },

  // Get severity color class
  getSeverityColorClass: (severity: number): string => {
    if (severity >= 90) return 'bg-health-danger text-white';
    if (severity >= 75) return 'bg-health-warning text-white';
    if (severity >= 50) return 'bg-health-aqua text-white';
    return 'bg-health-success text-white';
  },

  // Get trend indicator
  getTrendIndicator: (current: number, previous: number): {
    trend: 'up' | 'down' | 'stable';
    percentage: number;
  } => {
    if (previous === 0) return { trend: 'stable', percentage: 0 };
    const percentage = ((current - previous) / previous) * 100;
    return {
      trend: percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'stable',
      percentage: Math.abs(percentage)
    };
  },

  // Format date for display
  formatDate: (date: Date): string => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Get chart colors
  getChartColors: (darkMode: boolean = false): {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    danger: string;
    info: string;
    background: string;
    text: string;
    grid: string;
  } => {
    return {
      primary: '#0EA5E9',   // health-teal
      secondary: '#64748B',  // health-blue-gray
      success: '#22C55E',   // health-success
      warning: '#F59E0B',   // health-warning
      danger: '#EF4444',    // health-danger
      info: '#06B6D4',      // health-aqua
      background: darkMode ? '#1E293B' : '#FFFFFF',
      text: darkMode ? '#F8FAFC' : '#334155',
      grid: darkMode ? '#334155' : '#E2E8F0'
    };
  }
};

export default adminDashboardService; 