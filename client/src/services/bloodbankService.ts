import api from './api';

// Types
export interface BloodUnit {
  _id: string;
  unitId: string;
  bloodType: string;
  componentType: string;
  donor: {
    donorId: string;
    name: string;
    age: number;
    gender: string;
  };
  collection: {
    date: string;
    location: string;
    volume: number;
  };
  status: 'available' | 'reserved' | 'testing' | 'quarantine' | 'expired' | 'disposed' | 'transfused';
  storage: {
    location: string;
    shelf: string;
    rack: string;
  };
  expiry: {
    expiryDate: string;
    daysUntilExpiry: number;
  };
  qualityTests: Array<{
    testType: string;
    result: 'pass' | 'fail' | 'pending' | 'inconclusive';
    testDate: string;
    technician: string;
    qualityScore: number;
  }>;
  reservation?: {
    isReserved: boolean;
    reservedBy: {
      hospital: string;
      patient: string;
    };
    reservedUntil: string;
  };
}

export interface BloodDonor {
  _id: string;
  donorId: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    bloodType: string;
    phone: string;
    email: string;
    address: {
      street: string;
      city: string;
      state: string;
      pincode: string;
      country: string;
    };
  };
  eligibility: {
    isEligible: boolean;
    lastDonation: string;
    nextEligibleDate: string;
    deferralReason?: string;
    deferralEndDate?: string;
  };
  donationHistory: Array<{
    donationId: string;
    donationDate: string;
    bloodType: string;
    volume: number;
    status: string;
  }>;
  medicalHistory: {
    allergies: string[];
    medications: string[];
    conditions: string[];
  };
  isActive: boolean;
}

export interface BloodRequest {
  _id: string;
  requestId: string;
  requester: {
    hospitalId: string;
    hospitalName: string;
    doctorName: string;
    patientName: string;
  };
  bloodType: string;
  componentType: string;
  quantity: number;
  urgency: 'routine' | 'urgent' | 'emergency';
  status: 'pending' | 'approved' | 'fulfilled' | 'cancelled' | 'rejected';
  requestDate: string;
  requiredBy: string;
  reason: string;
  allocatedUnits?: string[];
}

export interface QualityControl {
  _id: string;
  unitId: string;
  bloodType: string;
  componentType: string;
  tests: Array<{
    testType: string;
    result: 'pass' | 'fail' | 'pending';
    testDate: string;
    technician: string;
    notes?: string;
  }>;
  status: 'testing' | 'passed' | 'failed' | 'quarantine';
  expiryDate: string;
  isActive: boolean;
}

export interface EmergencyAlert {
  _id: string;
  alertId: string;
  type: 'blood_shortage' | 'equipment_failure' | 'staff_shortage' | 'system_alert';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  bloodType?: string;
  location: string;
  status: 'active' | 'acknowledged' | 'resolved';
  createdAt: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
}

export interface InventorySummary {
  _id: string;
  total: number;
  available: number;
  reserved: number;
  testing: number;
  expired: number;
}

export interface DashboardStats {
  inventory: {
    total: number;
    available: number;
    reserved: number;
    testing: number;
    expired: number;
  };
  donors: {
    total: number;
    active: number;
    eligible: number;
    deferred: number;
  };
  requests: {
    total: number;
    pending: number;
    approved: number;
    fulfilled: number;
  };
  alerts: {
    total: number;
    critical: number;
    high: number;
    medium: number;
  };
  trends: {
    donations: number;
    requests: number;
    expiring: number;
  };
}

// Blood Inventory API
export const bloodInventoryAPI = {
  // Get inventory summary
  getSummary: async (): Promise<DashboardStats['inventory']> => {
    const response = await api.get('/api/blood-inventory/summary');
    return response.data;
  },

  // Get all blood units with filtering
  getUnits: async (params: {
    page?: number;
    limit?: number;
    bloodType?: string;
    componentType?: string;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<{
    data: BloodUnit[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  }> => {
    const response = await api.get('/api/blood-inventory/units', { params });
    return response.data;
  },

  // Get single blood unit
  getUnit: async (unitId: string): Promise<BloodUnit> => {
    const response = await api.get(`/api/blood-inventory/units/${unitId}`);
    return response.data;
  },

  // Create new blood unit
  createUnit: async (unitData: Partial<BloodUnit>): Promise<BloodUnit> => {
    const response = await api.post('/api/blood-inventory/units', unitData);
    return response.data;
  },

  // Update blood unit
  updateUnit: async (unitId: string, unitData: Partial<BloodUnit>): Promise<BloodUnit> => {
    const response = await api.put(`/api/blood-inventory/units/${unitId}`, unitData);
    return response.data;
  },

  // Delete blood unit
  deleteUnit: async (unitId: string): Promise<void> => {
    await api.delete(`/api/blood-inventory/units/${unitId}`);
  },

  // Update unit quantity
  updateQuantity: async (unitId: string, quantity: number): Promise<BloodUnit> => {
    const response = await api.patch(`/api/blood-inventory/units/${unitId}/quantity`, { quantity });
    return response.data;
  },

  // Get inventory alerts
  getAlerts: async (): Promise<any[]> => {
    const response = await api.get('/api/blood-inventory/alerts');
    return response.data;
  },

  // Get inventory analytics
  getAnalytics: async (): Promise<any> => {
    const response = await api.get('/api/blood-inventory/analytics');
    return response.data;
  },
};

// Blood Donors API
export const bloodDonorsAPI = {
  // Get donor summary
  getSummary: async (): Promise<DashboardStats['donors']> => {
    const response = await api.get('/blood-donors/summary');
    return response.data;
  },

  // Get all donors
  getDonors: async (params: {
    page?: number;
    limit?: number;
    bloodType?: string;
    status?: string;
    search?: string;
  } = {}): Promise<{
    data: BloodDonor[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  }> => {
    const response = await api.get('/blood-donors', { params });
    return response.data;
  },

  // Get single donor
  getDonor: async (donorId: string): Promise<BloodDonor> => {
    const response = await api.get(`/api/blood-donors/${donorId}`);
    return response.data;
  },

  // Create new donor
  createDonor: async (donorData: Partial<BloodDonor>): Promise<BloodDonor> => {
    const response = await api.post('/blood-donors', donorData);
    return response.data;
  },

  // Update donor
  updateDonor: async (donorId: string, donorData: Partial<BloodDonor>): Promise<BloodDonor> => {
    const response = await api.put(`/api/blood-donors/${donorId}`, donorData);
    return response.data;
  },

  // Delete donor
  deleteDonor: async (donorId: string): Promise<void> => {
    await api.delete(`/api/blood-donors/${donorId}`);
  },

  // Get eligible donors
  getEligibleDonors: async (params: {
    bloodType?: string;
    location?: string;
  } = {}): Promise<BloodDonor[]> => {
    const response = await api.get('/blood-donors/eligible', { params });
    return response.data;
  },

  // Check donor eligibility
  checkEligibility: async (donorId: string): Promise<{ isEligible: boolean; reason?: string }> => {
    const response = await api.patch(`/api/blood-donors/${donorId}/eligibility`);
    return response.data;
  },

  // Add donor deferral
  addDeferral: async (donorId: string, deferralData: {
    reason: string;
    endDate: string;
  }): Promise<BloodDonor> => {
    const response = await api.post(`/api/blood-donors/${donorId}/deferral`, deferralData);
    return response.data;
  },

  // Remove donor deferral
  removeDeferral: async (donorId: string): Promise<BloodDonor> => {
    const response = await api.delete(`/api/blood-donors/${donorId}/deferral`);
    return response.data;
  },

  // Add donation
  addDonation: async (donorId: string, donationData: {
    bloodType: string;
    volume: number;
    donationDate: string;
  }): Promise<any> => {
    const response = await api.post(`/api/blood-donors/${donorId}/donations`, donationData);
    return response.data;
  },

  // Get donation history
  getDonationHistory: async (donorId: string): Promise<any[]> => {
    const response = await api.get(`/api/blood-donors/${donorId}/donations`);
    return response.data;
  },

  // Upload donor document
  uploadDocument: async (donorId: string, file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('document', file);
    const response = await api.post(`/api/blood-donors/${donorId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Get donor analytics
  getAnalytics: async (): Promise<any> => {
    const response = await api.get('/blood-donors/analytics');
    return response.data;
  },
};

// Blood Requests API
export const bloodRequestsAPI = {
  // Get request summary
  getSummary: async (): Promise<DashboardStats['requests']> => {
    const response = await api.get('/blood-requests/summary');
    return response.data;
  },

  // Get all requests
  getRequests: async (params: {
    page?: number;
    limit?: number;
    status?: string;
    urgency?: string;
    bloodType?: string;
    search?: string;
  } = {}): Promise<{
    data: BloodRequest[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  }> => {
    const response = await api.get('/blood-requests', { params });
    return response.data;
  },

  // Get single request
  getRequest: async (requestId: string): Promise<BloodRequest> => {
    const response = await api.get(`/api/blood-requests/${requestId}`);
    return response.data;
  },

  // Create new request
  createRequest: async (requestData: Partial<BloodRequest>): Promise<BloodRequest> => {
    const response = await api.post('/blood-requests', requestData);
    return response.data;
  },

  // Update request
  updateRequest: async (requestId: string, requestData: Partial<BloodRequest>): Promise<BloodRequest> => {
    const response = await api.put(`/api/blood-requests/${requestId}`, requestData);
    return response.data;
  },

  // Delete request
  deleteRequest: async (requestId: string): Promise<void> => {
    await api.delete(`/api/blood-requests/${requestId}`);
  },

  // Update request status
  updateStatus: async (requestId: string, status: string): Promise<BloodRequest> => {
    const response = await api.patch(`/api/blood-requests/${requestId}/status`, { status });
    return response.data;
  },

  // Allocate blood units
  allocateUnits: async (requestId: string, unitIds: string[]): Promise<BloodRequest> => {
    const response = await api.post(`/api/blood-requests/${requestId}/allocate`, { unitIds });
    return response.data;
  },

  // Get urgent requests
  getUrgentRequests: async (): Promise<BloodRequest[]> => {
    const response = await api.get('/blood-requests/urgent');
    return response.data;
  },

  // Get requests by blood type
  getRequestsByBloodType: async (bloodType: string): Promise<BloodRequest[]> => {
    const response = await api.get('/blood-requests/by-blood-type', { params: { bloodType } });
    return response.data;
  },

  // Get request analytics
  getAnalytics: async (): Promise<any> => {
    const response = await api.get('/blood-requests/analytics');
    return response.data;
  },

  // Export requests
  exportRequests: async (params: {
    startDate?: string;
    endDate?: string;
    status?: string;
  } = {}): Promise<Blob> => {
    const response = await api.get('/blood-requests/export', {
      params,
      responseType: 'blob'
    });
    return response.data;
  },
};

// Quality Control API
export const qualityControlAPI = {
  // Get quality summary
  getSummary: async (bloodBankId: string): Promise<any> => {
    const response = await api.get(`/api/quality-control/summary/${bloodBankId}`);
    return response.data;
  },

  // Get all quality controls
  getQualityControls: async (bloodBankId: string, params: {
    page?: number;
    limit?: number;
    status?: string;
    bloodType?: string;
  } = {}): Promise<{
    data: QualityControl[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  }> => {
    const response = await api.get(`/api/quality-control/${bloodBankId}`, { params });
    return response.data;
  },

  // Get single quality control
  getQualityControl: async (recordId: string): Promise<QualityControl> => {
    const response = await api.get(`/api/quality-control/record/${recordId}`);
    return response.data;
  },

  // Create quality control
  createQualityControl: async (bloodBankId: string, controlData: Partial<QualityControl>): Promise<QualityControl> => {
    const response = await api.post(`/api/quality-control/${bloodBankId}`, controlData);
    return response.data;
  },

  // Update quality control
  updateQualityControl: async (recordId: string, controlData: Partial<QualityControl>): Promise<QualityControl> => {
    const response = await api.put(`/api/quality-control/record/${recordId}`, controlData);
    return response.data;
  },

  // Delete quality control
  deleteQualityControl: async (recordId: string): Promise<void> => {
    await api.delete(`/api/quality-control/record/${recordId}`);
  },

  // Add quality test
  addQualityTest: async (recordId: string, testData: {
    testType: string;
    result: 'pass' | 'fail' | 'pending';
    technician: string;
    notes?: string;
  }): Promise<QualityControl> => {
    const response = await api.post(`/api/quality-control/record/${recordId}/tests`, testData);
    return response.data;
  },

  // Quarantine unit
  quarantineUnit: async (recordId: string, reason: string): Promise<QualityControl> => {
    const response = await api.post(`/api/quality-control/record/${recordId}/quarantine`, { reason });
    return response.data;
  },

  // Release from quarantine
  releaseFromQuarantine: async (recordId: string): Promise<QualityControl> => {
    const response = await api.post(`/api/quality-control/record/${recordId}/release`);
    return response.data;
  },

  // Dispose unit
  disposeUnit: async (recordId: string, reason: string): Promise<QualityControl> => {
    const response = await api.post(`/api/quality-control/record/${recordId}/dispose`, { reason });
    return response.data;
  },

  // Get failed tests
  getFailedTests: async (bloodBankId: string): Promise<QualityControl[]> => {
    const response = await api.get(`/api/quality-control/failed-tests/${bloodBankId}`);
    return response.data;
  },

  // Get expiring quality tests
  getExpiringTests: async (bloodBankId: string): Promise<QualityControl[]> => {
    const response = await api.get(`/api/quality-control/expiring/${bloodBankId}`);
    return response.data;
  },

  // Get quality analytics
  getAnalytics: async (bloodBankId: string): Promise<any> => {
    const response = await api.get(`/api/quality-control/analytics/${bloodBankId}`);
    return response.data;
  },

  // Get compliance report
  getComplianceReport: async (bloodBankId: string): Promise<any> => {
    const response = await api.get(`/api/quality-control/compliance/${bloodBankId}`);
    return response.data;
  },
};

// Emergency Alerts API
export const emergencyAlertsAPI = {
  // Get all alerts
  getAlerts: async (params: {
    status?: string;
    severity?: string;
    type?: string;
  } = {}): Promise<EmergencyAlert[]> => {
    const response = await api.get('/emergency-alerts', { params });
    return response.data;
  },

  // Get single alert
  getAlert: async (alertId: string): Promise<EmergencyAlert> => {
    const response = await api.get(`/api/emergency-alerts/${alertId}`);
    return response.data;
  },

  // Create alert
  createAlert: async (alertData: Partial<EmergencyAlert>): Promise<EmergencyAlert> => {
    const response = await api.post('/emergency-alerts', alertData);
    return response.data;
  },

  // Update alert
  updateAlert: async (alertId: string, alertData: Partial<EmergencyAlert>): Promise<EmergencyAlert> => {
    const response = await api.put(`/api/emergency-alerts/${alertId}`, alertData);
    return response.data;
  },

  // Acknowledge alert
  acknowledgeAlert: async (alertId: string): Promise<EmergencyAlert> => {
    const response = await api.patch(`/api/emergency-alerts/${alertId}/acknowledge`);
    return response.data;
  },

  // Resolve alert
  resolveAlert: async (alertId: string, resolution: string): Promise<EmergencyAlert> => {
    const response = await api.patch(`/api/emergency-alerts/${alertId}/resolve`, { resolution });
    return response.data;
  },

  // Delete alert
  deleteAlert: async (alertId: string): Promise<void> => {
    await api.delete(`/api/emergency-alerts/${alertId}`);
  },
};

// Dashboard API
export const dashboardAPI = {
  // Get dashboard stats
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/bloodbank/dashboard/stats');
    return response.data;
  },

  // Get recent activity
  getRecentActivity: async (): Promise<any[]> => {
    const response = await api.get('/bloodbank/dashboard/activity');
    return response.data;
  },

  // Get alerts summary
  getAlertsSummary: async (): Promise<DashboardStats['alerts']> => {
    const response = await api.get('/bloodbank/dashboard/alerts');
    return response.data;
  },

  // Quick Actions
  // Create quick blood request
  createQuickRequest: async (data: {
    bloodType: string;
    componentType: string;
    quantity: number;
    urgency?: string;
  }): Promise<any> => {
    const response = await api.post('/bloodbank/dashboard/quick-request', data);
    return response.data;
  },

  // Register quick donor
  registerQuickDonor: async (data: {
    firstName: string;
    lastName: string;
    bloodType: string;
    phone: string;
    email: string;
    dateOfBirth: string;
    gender: string;
    weight: number;
    height: number;
  }): Promise<any> => {
    const response = await api.post('/bloodbank/dashboard/quick-donor', data);
    return response.data;
  },

  // Initiate quality test
  initiateQualityTest: async (data: {
    unitId: string;
    testType?: string;
  }): Promise<any> => {
    const response = await api.post('/bloodbank/dashboard/quick-test', data);
    return response.data;
  },

  // Generate quick report
  generateQuickReport: async (reportType?: string): Promise<any> => {
    const response = await api.post('/bloodbank/dashboard/quick-report', { reportType });
    return response.data;
  },
};

// Utility functions
export const bloodbankUtils = {
  // Format blood type for display
  formatBloodType: (bloodType: string): string => {
    return bloodType.toUpperCase();
  },

  // Get blood type color
  getBloodTypeColor: (bloodType: string): string => {
    const colors: { [key: string]: string } = {
      'O+': 'bg-red-100 text-red-800',
      'O-': 'bg-red-200 text-red-900',
      'A+': 'bg-blue-100 text-blue-800',
      'A-': 'bg-blue-200 text-blue-900',
      'B+': 'bg-green-100 text-green-800',
      'B-': 'bg-green-200 text-green-900',
      'AB+': 'bg-purple-100 text-purple-800',
      'AB-': 'bg-purple-200 text-purple-900',
    };
    return colors[bloodType] || 'bg-gray-100 text-gray-800';
  },

  // Get status color
  getStatusColor: (status: string): string => {
    const colors: { [key: string]: string } = {
      'available': 'bg-green-100 text-green-800',
      'reserved': 'bg-yellow-100 text-yellow-800',
      'testing': 'bg-blue-100 text-blue-800',
      'quarantine': 'bg-red-100 text-red-800',
      'expired': 'bg-gray-100 text-gray-800',
      'disposed': 'bg-black-100 text-black-800',
      'transfused': 'bg-purple-100 text-purple-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  },

  // Get urgency color
  getUrgencyColor: (urgency: string): string => {
    const colors: { [key: string]: string } = {
      'routine': 'bg-green-100 text-green-800',
      'urgent': 'bg-yellow-100 text-yellow-800',
      'emergency': 'bg-red-100 text-red-800',
    };
    return colors[urgency] || 'bg-gray-100 text-gray-800';
  },

  // Get severity color
  getSeverityColor: (severity: string): string => {
    const colors: { [key: string]: string } = {
      'low': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-orange-100 text-orange-800',
      'critical': 'bg-red-100 text-red-800',
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  },

  // Calculate days until expiry
  getDaysUntilExpiry: (expiryDate: string): number => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  },

  // Format date
  formatDate: (date: string): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  },

  // Format date and time
  formatDateTime: (date: string): string => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },
};

