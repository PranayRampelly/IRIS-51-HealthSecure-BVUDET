// Admin Audit Log Management Service
const API_BASE_URL = 'http://localhost:5000/api';

export interface AuditLog {
  _id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  userName: string;
  userRole: 'admin' | 'doctor' | 'patient' | 'insurance' | 'researcher';
  action: string;
  targetType: 'user' | 'health_record' | 'proof' | 'appointment' | 'claim' | 'policy' | 'system' | 'settings' | 'database';
  targetId?: string;
  targetName?: string;
  severity: 'info' | 'warning' | 'high' | 'critical';
  status: 'success' | 'failed' | 'pending' | 'blocked' | 'error';
  ipAddress: string;
  userAgent: string;
  requestMethod: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  requestUrl: string;
  requestId: string;
  details: string;
  metadata: Record<string, any>;
  attachments: Array<{
    _id: string;
    url: string;
    publicId: string;
    filename: string;
    mimeType: string;
    size: number;
    uploadedAt: string;
  }>;
  retentionPeriod: number;
  isComplianceRelevant: boolean;
  complianceTags: Array<'hipaa' | 'gdpr' | 'sox' | 'pci' | 'iso27001'>;
  previousValues: Record<string, any>;
  newValues: Record<string, any>;
  executionTime: number;
  relatedLogIds: string[];
  sessionId?: string;
  location?: {
    country?: string;
    region?: string;
    city?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogStats {
  systemStats: {
    totalEvents: number;
    criticalEvents: number;
    highEvents: number;
    warningEvents: number;
    failedEvents: number;
    blockedEvents: number;
  };
  actionStats: Array<{
    _id: string;
    count: number;
    successCount: number;
    failedCount: number;
    avgExecutionTime: number;
  }>;
  userStats: Array<{
    _id: string;
    userName: string;
    userEmail: string;
    userRole: string;
    totalActions: number;
    criticalActions: number;
    failedActions: number;
    lastActivity: string;
  }>;
  securityAlerts: AuditLog[];
  complianceStats: {
    totalComplianceEvents: number;
    hipaaEvents: number;
    gdprEvents: number;
    soxEvents: number;
  };
  dateRange: {
    start: string;
    end: string;
  };
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalLogs: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface AuditLogsResponse {
  logs: AuditLog[];
  pagination: PaginationInfo;
}

export interface CreateAuditLogData {
  userId: string;
  action: string;
  targetType: string;
  targetId?: string;
  targetName?: string;
  severity?: string;
  status?: string;
  details: string;
  metadata?: Record<string, any>;
  complianceTags?: string[];
  attachments?: Array<{
    url: string;
    publicId: string;
    filename: string;
    mimeType: string;
    size: number;
  }>;
}

export interface UpdateAuditLogData {
  severity?: string;
  status?: string;
  details?: string;
  metadata?: Record<string, any>;
  complianceTags?: string[];
  isComplianceRelevant?: boolean;
}

export interface BulkOperationData {
  operation: 'mark_compliance' | 'update_severity' | 'add_tags';
  logIds: string[];
  data?: {
    tags?: string[];
    severity?: string;
  };
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

// Audit Log Management API Functions
export const adminAuditLogService = {
  // Get all audit logs with filters
  getAuditLogs: async (params: {
    page?: number;
    limit?: number;
    action?: string;
    severity?: string;
    status?: string;
    targetType?: string;
    userId?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: string;
    complianceOnly?: boolean;
  } = {}): Promise<AuditLogsResponse> => {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    return apiRequest<AuditLogsResponse>(`/admin/audit-logs?${searchParams.toString()}`);
  },

  // Get audit log statistics
  getAuditLogStats: async (startDate?: string, endDate?: string): Promise<AuditLogStats> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return apiRequest<AuditLogStats>(`/admin/audit-logs/stats?${params.toString()}`);
  },

  // Get audit log by ID
  getAuditLogById: async (logId: string): Promise<AuditLog> => {
    return apiRequest<AuditLog>(`/admin/audit-logs/${logId}`);
  },

  // Get user activity
  getUserActivity: async (userId: string, params: {
    startDate?: string;
    endDate?: string;
    actions?: string[];
    severity?: string[];
    limit?: number;
    page?: number;
  } = {}): Promise<{
    user: any;
    logs: AuditLog[];
    pagination: PaginationInfo;
  }> => {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          searchParams.append(key, value.join(','));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });

    return apiRequest(`/admin/audit-logs/user/${userId}?${searchParams.toString()}`);
  },

  // Create new audit log
  createAuditLog: async (logData: CreateAuditLogData): Promise<{ message: string; auditLog: AuditLog }> => {
    return apiRequest('/admin/audit-logs', {
      method: 'POST',
      body: JSON.stringify(logData),
    });
  },

  // Update audit log
  updateAuditLog: async (logId: string, logData: UpdateAuditLogData): Promise<{ message: string; auditLog: AuditLog }> => {
    return apiRequest(`/admin/audit-logs/${logId}`, {
      method: 'PUT',
      body: JSON.stringify(logData),
    });
  },

  // Add attachment to audit log
  addAttachment: async (logId: string, file: File): Promise<{ message: string; attachment: any }> => {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('attachment', file);

    const response = await fetch(`${API_BASE_URL}/admin/audit-logs/${logId}/attachments`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }

    return data;
  },

  // Remove attachment from audit log
  removeAttachment: async (logId: string, attachmentId: string): Promise<{ message: string }> => {
    return apiRequest(`/admin/audit-logs/${logId}/attachments/${attachmentId}`, {
      method: 'DELETE',
    });
  },

  // Export audit logs
  exportAuditLogs: async (format: 'json' | 'csv' = 'json', filters?: {
    startDate?: string;
    endDate?: string;
    action?: string;
    severity?: string;
    status?: string;
    targetType?: string;
    userId?: string;
    complianceOnly?: boolean;
  }): Promise<Blob> => {
    const token = getAuthToken();
    const searchParams = new URLSearchParams({
      format,
      ...(filters?.startDate && { startDate: filters.startDate }),
      ...(filters?.endDate && { endDate: filters.endDate }),
      ...(filters?.action && { action: filters.action }),
      ...(filters?.severity && { severity: filters.severity }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.targetType && { targetType: filters.targetType }),
      ...(filters?.userId && { userId: filters.userId }),
      ...(filters?.complianceOnly && { complianceOnly: filters.complianceOnly }),
    });

    const response = await fetch(`${API_BASE_URL}/admin/audit-logs/export?${searchParams.toString()}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  },

  // Get audit log suggestions
  getAuditLogSuggestions: async (query: string): Promise<{ suggestions: Array<{
    type: string;
    value: string;
    label: string;
    count: number;
  }> }> => {
    return apiRequest(`/admin/audit-logs/suggestions?q=${encodeURIComponent(query)}`);
  },

  // Bulk operations
  bulkOperation: async (operationData: BulkOperationData): Promise<{
    message: string;
    modifiedCount: number;
    operation: string;
  }> => {
    return apiRequest('/admin/audit-logs/bulk', {
      method: 'POST',
      body: JSON.stringify(operationData),
    });
  },

  // Delete audit log (soft delete)
  deleteAuditLog: async (logId: string): Promise<{ message: string }> => {
    return apiRequest(`/admin/audit-logs/${logId}`, {
      method: 'DELETE',
    });
  },
};

// Utility functions
export const auditLogUtils = {
  // Get severity color class
  getSeverityColorClass: (severity: string): string => {
    const colorMap: Record<string, string> = {
      info: 'bg-health-aqua text-white',
      warning: 'bg-health-warning text-white',
      high: 'bg-orange-500 text-white',
      critical: 'bg-health-danger text-white',
    };
    return colorMap[severity] || 'bg-gray-500 text-white';
  },

  // Get status color class
  getStatusColorClass: (status: string): string => {
    const colorMap: Record<string, string> = {
      success: 'bg-health-success text-white',
      failed: 'bg-health-danger text-white',
      pending: 'bg-health-warning text-white',
      blocked: 'bg-health-danger text-white',
      error: 'bg-health-danger text-white',
    };
    return colorMap[status] || 'bg-gray-500 text-white';
  },

  // Get action icon
  getActionIcon: (action: string): string => {
    const iconMap: Record<string, string> = {
      user_created: 'User',
      user_modified: 'User',
      user_suspended: 'User',
      user_deleted: 'User',
      user_login: 'Shield',
      user_logout: 'Shield',
      login_failed: 'XCircle',
      password_changed: 'Shield',
      profile_updated: 'User',
      '2fa_enabled': 'Shield',
      '2fa_disabled': 'Shield',
      '2fa_verified': 'Shield',
      '2fa_failed': 'XCircle',
      session_created: 'Shield',
      session_expired: 'Shield',
      session_revoked: 'Shield',
      access_denied: 'AlertTriangle',
      permission_denied: 'AlertTriangle',
      security_alert: 'AlertTriangle',
      record_created: 'FileText',
      record_modified: 'FileText',
      record_deleted: 'FileText',
      record_viewed: 'Eye',
      record_shared: 'Share',
      record_exported: 'Download',
      record_imported: 'Upload',
      proof_created: 'Shield',
      proof_verified: 'CheckCircle',
      proof_rejected: 'XCircle',
      proof_shared: 'Share',
      proof_requested: 'Shield',
      proof_expired: 'Clock',
      appointment_created: 'Calendar',
      appointment_modified: 'Calendar',
      appointment_cancelled: 'XCircle',
      appointment_completed: 'CheckCircle',
      appointment_rescheduled: 'Calendar',
      claim_submitted: 'FileText',
      claim_approved: 'CheckCircle',
      claim_rejected: 'XCircle',
      claim_modified: 'FileText',
      policy_created: 'FileText',
      policy_modified: 'FileText',
      policy_cancelled: 'XCircle',
      backup_created: 'Database',
      backup_restored: 'Database',
      backup_failed: 'Database',
      system_maintenance: 'Settings',
      system_update: 'Settings',
      system_error: 'AlertTriangle',
      data_export: 'Download',
      data_import: 'Upload',
      data_archived: 'Archive',
      settings_modified: 'Settings',
      config_changed: 'Settings',
      admin_action: 'Shield',
      bulk_operation: 'Settings',
      user_bulk_modified: 'Users',
      compliance_check: 'Shield',
      audit_report: 'FileText',
      regulatory_update: 'Shield',
      data_retention: 'Archive',
      privacy_consent: 'Shield',
      gdpr_request: 'Shield',
    };
    return iconMap[action] || 'Activity';
  },

  // Format timestamp
  formatTimestamp: (timestamp: string): string => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  },

  // Format time ago
  formatTimeAgo: (timestamp: string): string => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
  },

  // Get action display name
  getActionDisplayName: (action: string): string => {
    return action
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  },

  // Get target type display name
  getTargetTypeDisplayName: (targetType: string): string => {
    const displayMap: Record<string, string> = {
      user: 'User',
      health_record: 'Health Record',
      proof: 'Proof',
      appointment: 'Appointment',
      claim: 'Insurance Claim',
      policy: 'Insurance Policy',
      system: 'System',
      settings: 'Settings',
      database: 'Database',
    };
    return displayMap[targetType] || targetType;
  },

  // Check if log is security relevant
  isSecurityRelevant: (log: AuditLog): boolean => {
    return log.severity === 'critical' || 
           log.severity === 'high' || 
           ['access_denied', 'login_failed', 'security_alert'].includes(log.action) ||
           log.status === 'failed' || 
           log.status === 'blocked';
  },

  // Check if log is compliance relevant
  isComplianceRelevant: (log: AuditLog): boolean => {
    return log.isComplianceRelevant || log.complianceTags.length > 0;
  },
};

export default adminAuditLogService; 