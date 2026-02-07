// Admin User Management Service
const API_BASE_URL = 'http://localhost:5000/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'insurance' | 'researcher' | 'admin';
  status: 'active' | 'suspended';
  avatar: string;
  lastLogin: string;
  joinDate: string;
  phone: string;
  verified: boolean;
  specialization?: string;
  hospital?: string;
  licenseNumber?: string;
  bio?: string;
  consultationFees?: number;
  bloodType?: string;
  age?: number;
  organization?: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  suspendedUsers: number;
  newUsersThisMonth: number;
  activeUsersThisMonth: number;
  roleDistribution: Array<{
    _id: string;
    count: number;
    percentage: number;
  }>;
}

export interface UserActivity {
  user: {
    lastLoginAt: string | null;
    loginHistory: Array<{
      timestamp: string;
      ip: string;
      userAgent: string;
    }>;
    createdAt: string;
    updatedAt: string;
  };
  accessLogs: Array<{
    action: string;
    timestamp: string;
    ip: string;
    userAgent: string;
    success: boolean;
  }>;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface UsersResponse {
  users: User[];
  pagination: PaginationInfo;
}

export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  phone?: string;
  isActive?: boolean;
  isEmailVerified?: boolean;
  specialization?: string;
  hospital?: string;
  licenseNumber?: string;
  bio?: string;
  consultationFees?: number;
  bloodType?: string;
  dateOfBirth?: string;
  organization?: string;
}

export interface UpdateUserData extends Partial<CreateUserData> {
  password?: string; // Optional for updates
}

export interface BulkOperationData {
  operation: 'activate' | 'deactivate' | 'verify' | 'update_role';
  userIds: string[];
  data?: {
    role?: string;
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

// User Management API Functions
export const adminUserService = {
  // Get all users with filters
  getUsers: async (params: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
    status?: string;
    verified?: string;
    dateFrom?: string;
    dateTo?: string;
    lastLoginFrom?: string;
    lastLoginTo?: string;
    sortBy?: string;
    sortOrder?: string;
  } = {}): Promise<UsersResponse> => {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    return apiRequest<UsersResponse>(`/admin/users?${searchParams.toString()}`);
  },

  // Get user statistics
  getUserStats: async (): Promise<UserStats> => {
    return apiRequest<UserStats>('/admin/users/stats');
  },

  // Get user search suggestions
  getUserSuggestions: async (query: string): Promise<{ suggestions: Array<{
    id: string;
    label: string;
    value: string;
    role: string;
    status: string;
  }> }> => {
    return apiRequest(`/admin/users/suggestions?q=${encodeURIComponent(query)}`);
  },

  // Get user by ID
  getUserById: async (userId: string): Promise<User> => {
    return apiRequest<User>(`/admin/users/${userId}`);
  },

  // Get user activity
  getUserActivity: async (userId: string): Promise<UserActivity> => {
    return apiRequest<UserActivity>(`/admin/users/${userId}/activity`);
  },

  // Create new user
  createUser: async (userData: CreateUserData): Promise<{ message: string; user: User }> => {
    return apiRequest('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Update user
  updateUser: async (userId: string, userData: UpdateUserData): Promise<{ message: string; user: User }> => {
    return apiRequest(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  // Delete user (soft delete)
  deleteUser: async (userId: string): Promise<{ message: string }> => {
    return apiRequest(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  },

  // Reactivate user
  reactivateUser: async (userId: string): Promise<{ message: string }> => {
    return apiRequest(`/admin/users/${userId}/reactivate`, {
      method: 'PATCH',
    });
  },

  // Bulk operations
  bulkOperation: async (operationData: BulkOperationData): Promise<{
    message: string;
    modifiedCount: number;
    operation: string;
  }> => {
    return apiRequest('/admin/users/bulk', {
      method: 'POST',
      body: JSON.stringify(operationData),
    });
  },

  // Export users
  exportUsers: async (format: 'json' | 'csv' = 'json', filters?: {
    role?: string;
    status?: string;
  }): Promise<Blob> => {
    const token = getAuthToken();
    const searchParams = new URLSearchParams({
      format,
      ...(filters?.role && { role: filters.role }),
      ...(filters?.status && { status: filters.status }),
    });

    const response = await fetch(`${API_BASE_URL}/admin/users/export?${searchParams.toString()}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  },

  // Upload profile image
  uploadProfileImage: async (userId: string, file: File): Promise<{ message: string; user: User }> => {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('profileImage', file);

    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'PUT',
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
};

// Utility functions
export const userUtils = {
  // Format user name
  formatUserName: (firstName: string, lastName: string): string => {
    return `${firstName} ${lastName}`.trim();
  },

  // Get user initials for avatar
  getUserInitials: (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  },

  // Get role display name
  getRoleDisplayName: (role: string): string => {
    const roleMap: Record<string, string> = {
      patient: 'Patient',
      doctor: 'Doctor',
      insurance: 'Insurance',
      researcher: 'Researcher',
      admin: 'Administrator',
    };
    return roleMap[role] || role;
  },

  // Get status display name
  getStatusDisplayName: (status: string): string => {
    const statusMap: Record<string, string> = {
      active: 'Active',
      suspended: 'Suspended',
      pending: 'Pending',
    };
    return statusMap[status] || status;
  },

  // Get role color class
  getRoleColorClass: (role: string): string => {
    const colorMap: Record<string, string> = {
      patient: 'bg-health-teal text-white',
      doctor: 'bg-health-aqua text-white',
      insurance: 'bg-health-success text-white',
      researcher: 'bg-health-warning text-white',
      admin: 'bg-health-blue-gray text-white',
    };
    return colorMap[role] || 'bg-gray-500 text-white';
  },

  // Get status color class
  getStatusColorClass: (status: string): string => {
    const colorMap: Record<string, string> = {
      active: 'bg-health-success text-white',
      pending: 'bg-health-warning text-white',
      suspended: 'bg-health-danger text-white',
    };
    return colorMap[status] || 'bg-gray-500 text-white';
  },

  // Format date
  formatDate: (date: string | Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  },

  // Format time ago
  formatTimeAgo: (date: string | Date): string => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
  },

  // Validate email
  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate phone number
  validatePhone: (phone: string): boolean => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  },

  // Get default avatar URL
  getDefaultAvatar: (name: string): string => {
    const initials = userUtils.getUserInitials(name);
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0ea5e9&color=fff&size=128`;
  },
};

export default adminUserService; 