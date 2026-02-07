import axios from 'axios';

export interface PharmacyMetrics {
  totalOrdersToday: number;
  pendingOrders: number;
  prescriptionsQueued: number;
  revenueToday: number;
  totalCustomers: number;
  averageOrderValue: number;
  deliverySuccessRate: number;
  customerSatisfaction: number;
}

export interface PharmacyDashboardResponse {
  metrics: PharmacyMetrics;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customer: string;
    items: number;
    total: number;
    totalAmount: number;
    status: string;
    placedAt: string;
    orderDate?: string;
    estimatedDelivery?: string;
    trackingNumber?: string;
    paymentStatus: string;
    deliveryAddress: string;
    medicines: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
  }>;
  prescriptions: Array<{
    id: string;
    medicine: string;
    patientName: string;
    doctorName: string;
    dosage: string;
    frequency: string;
    duration?: string;
    refills?: number;
    status: string;
    prescribedDate: string | Date;
  }>;
  lowStock: Array<{
    id: string;
    sku: string;
    name: string;
    stock: number;
    threshold: number;
    cloudinaryUrl?: string;
  }>;
  deliveries: Array<{ id: string; time: string; vendor: string }>;
}

const pharmacyService = {
  async getDashboard(): Promise<PharmacyDashboardResponse> {
    const token = localStorage.getItem('token');
    const res = await axios.get('/api/pharmacy/dashboard', {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return res.data as PharmacyDashboardResponse;
  },
  async listInventory() {
    const token = localStorage.getItem('token');
    const res = await axios.get('/api/pharmacy/inventory', { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    // Backend returns { inventory: [...], pagination: {...} } but we need just the inventory array
    return res.data.inventory || res.data;
  },
  async getMedicineDetails(id: string) {
    const token = localStorage.getItem('token');
    const res = await axios.get(`/api/pharmacy/inventory/${id}`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    return res.data;
  },
  async createInventoryItem(
    fields: {
      sku: string;
      name: string;
      stock: number;
      threshold: number;
      price: number;
      generic?: string;
      dosage?: string;
      form?: string;
      manufacturer?: string;
      description?: string;
      category?: string;
      prescriptionRequired?: boolean;
      expiryDate?: string;
      storage?: string;
      dosageInstructions?: string;
      deliveryTime?: string;
      genericPrice?: number;
      brandPrice?: number;
      insuranceCovered?: boolean;
      insurancePrice?: number;
      rating?: number;
      reviews?: number;
      // Extended clinical fields for patient detail parity (as CSV strings)
      indications?: string;
      mechanism?: string;
      onset?: string;
      halfLife?: string;
      pregnancyCategory?: string;
      lactationSafety?: string;
      alcoholWarning?: string;
      drivingWarning?: string;
      overdose?: string;
      brandNames?: string;
      sideEffects?: string;
      interactions?: string;
      contraindications?: string;
    },
    image?: File
  ) {
    const token = localStorage.getItem('token');
    const fd = new FormData();
    Object.entries(fields).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      // booleans and numbers should be stringified explicitly; backend parses
      if (typeof v === 'boolean' || typeof v === 'number') {
        fd.append(k, String(v));
      } else {
        fd.append(k, v as any);
      }
    });
    if (image) fd.append('image', image);
    const res = await axios.post('/api/pharmacy/inventory', fd, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    return res.data;
  },
  async updateInventoryItem(
    id: string,
    fields: Partial<{
      name: string;
      stock: number;
      threshold: number;
      price: number;
      generic: string;
      dosage: string;
      form: string;
      manufacturer: string;
      description: string;
      category: string;
      prescriptionRequired: boolean;
      expiryDate: string;
      storage: string;
      dosageInstructions: string;
      deliveryTime: string;
      genericPrice: number;
      brandPrice: number;
      insuranceCovered: boolean;
      insurancePrice: number;
      rating: number;
      reviews: number;
      indications: string;
      mechanism: string;
      onset: string;
      halfLife: string;
      pregnancyCategory: string;
      lactationSafety: string;
      alcoholWarning: string;
      drivingWarning: string;
      overdose: string;
      brandNames: string;
      sideEffects: string;
      interactions: string;
      contraindications: string;
    }>,
    image?: File
  ) {
    const token = localStorage.getItem('token');
    const fd = new FormData();
    Object.entries(fields).forEach(([k, v]) => v !== undefined && fd.append(k, String(v)));
    if (image) fd.append('image', image);
    const res = await axios.put(`/api/pharmacy/inventory/${id}`, fd, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    return res.data;
  },
  async deleteInventoryItem(id: string) {
    const token = localStorage.getItem('token');
    const res = await axios.delete(`/api/pharmacy/inventory/${id}`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    return res.data;
  },
  async listOrders(pharmacyId?: string) {
    const token = localStorage.getItem('token');
    // Use pharmacy-specific endpoint for patient orders, fallback to regular pharmacy orders
    const url = pharmacyId ? '/api/pharmacy/orders/patients' : '/api/pharmacy/orders';
    const res = await axios.get(url, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    // Backend returns { orders: [...], pagination: {...} } but we need just the orders array
    return res.data.orders || res.data;
  },
  async createOrder(payload: any, file?: File) {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('payload', JSON.stringify(payload));
    if (file) formData.append('file', file);
    const res = await axios.post('/api/pharmacy/orders', formData, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    return res.data;
  },
  async updateOrderStatus(id: string, status: string) {
    const token = localStorage.getItem('token');
    const res = await axios.patch(`/api/pharmacy/orders/${id}/status`, { status }, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    return res.data;
  },
  async updatePatientOrderStatus(id: string, status: string) {
    const token = localStorage.getItem('token');
    const res = await axios.patch(`/api/pharmacy/orders/patients/${id}/status`, { status }, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    return res.data;
  },
  async downloadOrderPdf(id: string) {
    const token = localStorage.getItem('token');
    const res = await axios.get(`/api/pharmacy/orders/${id}/pdf`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined, responseType: 'blob' });
    return res.data as Blob;
  },
  async sendOrderSms(id: string) {
    const token = localStorage.getItem('token');
    const res = await axios.post(`/api/pharmacy/orders/${id}/sms`, {}, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    return res.data;
  },
  async listPrescriptions() {
    const token = localStorage.getItem('token');
    const res = await axios.get('/api/pharmacy/prescriptions', { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    // Backend returns { prescriptions: [...], pagination: {...} } but we need just the prescriptions array
    return res.data.prescriptions || res.data;
  },
  async createPrescription(payload: any, file?: File) {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('payload', JSON.stringify(payload));
    if (file) formData.append('file', file);
    const res = await axios.post('/api/pharmacy/prescriptions', formData, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    return res.data;
  },
  async updatePrescriptionStatus(id: string, status: string) {
    const token = localStorage.getItem('token');
    const res = await axios.patch(`/api/pharmacy/prescriptions/${id}/status`, { status }, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    return res.data;
  },
  async listSuppliers() {
    const token = localStorage.getItem('token');
    const res = await axios.get('/api/pharmacy/suppliers', { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    return res.data;
  },
  async createSupplier(fields: any, image?: File) {
    const token = localStorage.getItem('token');
    const fd = new FormData();
    Object.entries(fields).forEach(([k, v]) => {
      if (Array.isArray(v)) {
        fd.append(k, v.join(','));
      } else if (v !== undefined && v !== null) {
        fd.append(k, String(v));
      }
    });
    if (image) fd.append('image', image);
    const res = await axios.post('/api/pharmacy/suppliers', fd, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    return res.data;
  },
  async updateSupplier(id: string, fields: any, image?: File) {
    const token = localStorage.getItem('token');
    const fd = new FormData();
    Object.entries(fields).forEach(([k, v]) => {
      if (Array.isArray(v)) {
        fd.append(k, v.join(','));
      } else if (v !== undefined && v !== null) {
        fd.append(k, String(v));
      }
    });
    if (image) fd.append('image', image);
    const res = await axios.put(`/api/pharmacy/suppliers/${id}`, fd, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    return res.data;
  },
  async uploadSupplierLogo(id: string, logoFile: File) {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('logo', logoFile);
    const res = await axios.post(`/api/pharmacy/suppliers/${id}/logo`, formData, { 
      headers: token ? { Authorization: `Bearer ${token}` } : undefined 
    });
    return res.data;
  },
  async updateSupplierLogo(id: string, logoFile: File) {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('logo', logoFile);
    const res = await axios.put(`/api/pharmacy/suppliers/${id}/logo`, formData, { 
      headers: token ? { Authorization: `Bearer ${token}` } : undefined 
    });
    return res.data;
  },
  async getSupplierLogo(id: string) {
    const token = localStorage.getItem('token');
    const res = await axios.get(`/api/pharmacy/suppliers/${id}/logo`, { 
      headers: token ? { Authorization: `Bearer ${token}` } : undefined 
    });
    return res.data;
  },
  async deleteSupplierLogo(id: string) {
    const token = localStorage.getItem('token');
    const res = await axios.delete(`/api/pharmacy/suppliers/${id}/logo`, { 
      headers: token ? { Authorization: `Bearer ${token}` } : undefined 
    });
    return res.data;
  },

  // Customer Management Functions
  async listCustomers(params?: any) {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    const url = `/api/pharmacy/customers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const res = await axios.get(url, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    // Backend returns { success: true, data: { customers, pagination } } from customerController
    // or direct array from pharmacyController.listCustomers
    return res.data;
  },
  async createCustomer(fields: any, profileImage?: File) {
    const token = localStorage.getItem('token');
    const fd = new FormData();
    Object.entries(fields).forEach(([k, v]) => {
      if (Array.isArray(v)) {
        fd.append(k, v.join(','));
      } else if (v !== undefined && v !== null) {
        fd.append(k, String(v));
      }
    });
    if (profileImage) fd.append('profileImage', profileImage);
    const res = await axios.post('/api/pharmacy/customers', fd, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    return res.data;
  },
  async updateCustomer(id: string, fields: any, profileImage?: File) {
    const token = localStorage.getItem('token');
    const fd = new FormData();
    Object.entries(fields).forEach(([k, v]) => {
      if (Array.isArray(v)) {
        fd.append(k, v.join(','));
      } else if (v !== undefined && v !== null) {
        fd.append(k, String(v));
      }
    });
    if (profileImage) fd.append('profileImage', profileImage);
    const res = await axios.put(`/api/pharmacy/customers/${id}`, fd, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    return res.data;
  },
  async deleteCustomer(id: string) {
    const token = localStorage.getItem('token');
    const res = await axios.delete(`/api/pharmacy/customers/${id}`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    return res.data;
  },
  async getCustomerById(id: string) {
    const token = localStorage.getItem('token');
    const res = await axios.get(`/api/pharmacy/customers/${id}`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    return res.data;
  },
  async toggleCustomerStatus(id: string) {
    const token = localStorage.getItem('token');
    const res = await axios.patch(`/api/pharmacy/customers/${id}/status`, {}, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    return res.data;
  },
  async getCustomerStats() {
    const token = localStorage.getItem('token');
    const res = await axios.get('/api/pharmacy/customers/stats', { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    return res.data;
  },
  async searchCustomers(query: string, limit?: number) {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams({ q: query });
    if (limit) params.append('limit', String(limit));
    const res = await axios.get(`/api/pharmacy/customers/search?${params.toString()}`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    return res.data;
  },
  async getCustomersByLocation(city?: string, state?: string, pincode?: string) {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams();
    if (city) params.append('city', city);
    if (state) params.append('state', state);
    if (pincode) params.append('pincode', pincode);
    const res = await axios.get(`/api/pharmacy/customers/location?${params.toString()}`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    return res.data;
  },
  async getPremiumCustomers() {
    const token = localStorage.getItem('token');
    const res = await axios.get('/api/pharmacy/customers/premium', { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    return res.data;
  },
  async uploadCustomerDocument(id: string, documentFile: File, type: string, name?: string, description?: string) {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('document', documentFile);
    formData.append('type', type);
    if (name) formData.append('name', name);
    if (description) formData.append('description', description);
    const res = await axios.post(`/api/pharmacy/customers/${id}/documents`, formData, { 
      headers: token ? { Authorization: `Bearer ${token}` } : undefined 
    });
    return res.data;
  },
  async deleteCustomerDocument(id: string, docId: string) {
    const token = localStorage.getItem('token');
    const res = await axios.delete(`/api/pharmacy/customers/${id}/documents/${docId}`, { 
      headers: token ? { Authorization: `Bearer ${token}` } : undefined 
    });
    return res.data;
  },
  async addCustomerAllergy(id: string, allergen: string, severity?: string, notes?: string) {
    const token = localStorage.getItem('token');
    const res = await axios.post(`/api/pharmacy/customers/${id}/allergies`, { 
      allergen, severity, notes 
    }, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    return res.data;
  },
  async addCustomerChronicCondition(id: string, condition: string, diagnosisDate?: string, notes?: string) {
    const token = localStorage.getItem('token');
    const res = await axios.post(`/api/pharmacy/customers/${id}/chronic-conditions`, { 
      condition, diagnosisDate, notes 
    }, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    return res.data;
  },
  async addCustomerMedication(id: string, medication: string, dosage: string, frequency: string, prescribedBy?: string) {
    const token = localStorage.getItem('token');
    const res = await axios.post(`/api/pharmacy/customers/${id}/medications`, { 
      medication, dosage, frequency, prescribedBy 
    }, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    return res.data;
  },
  async addCustomerPaymentMethod(id: string, paymentMethod: any) {
    const token = localStorage.getItem('token');
    const res = await axios.post(`/api/pharmacy/customers/${id}/payment-methods`, paymentMethod, { 
      headers: token ? { Authorization: `Bearer ${token}` } : undefined 
    });
    return res.data;
  },
  async removeCustomerPaymentMethod(id: string, methodId: string) {
    const token = localStorage.getItem('token');
    const res = await axios.delete(`/api/pharmacy/customers/${id}/payment-methods/${methodId}`, { 
      headers: token ? { Authorization: `Bearer ${token}` } : undefined 
    });
    return res.data;
  },
  async updateCustomerOrderStats(id: string, orderValue: number) {
    const token = localStorage.getItem('token');
    const res = await axios.patch(`/api/pharmacy/customers/${id}/order-stats`, { 
      orderValue 
    }, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    return res.data;
  },
  async addCustomerLoyaltyPoints(id: string, points: number) {
    const token = localStorage.getItem('token');
    const res = await axios.patch(`/api/pharmacy/customers/${id}/loyalty-points`, { 
      points 
    }, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    return res.data;
  },

  // Reports Functions
  async getReports(params?: any) {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    const url = `/api/pharmacy/reports${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const res = await axios.get(url, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    return res.data;
  },
  async getReportById(id: string) {
    const token = localStorage.getItem('token');
    const res = await axios.get(`/api/pharmacy/reports/${id}`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    return res.data;
  },
  async generateReport(reportType: string, startDate: string, endDate: string) {
    const token = localStorage.getItem('token');
    const res = await axios.post('/api/pharmacy/reports', { 
      reportType, startDate, endDate 
    }, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    return res.data;
  },
  async getReportStats() {
    const token = localStorage.getItem('token');
    const res = await axios.get('/api/pharmacy/reports/stats', { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    return res.data;
  },
  async exportReport(id: string) {
    const token = localStorage.getItem('token');
    const res = await axios.get(`/api/pharmacy/reports/${id}/export`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    return res.data;
  },
  async getRevenueSummary(params?: any) {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    const url = `/api/pharmacy/reports/revenue/summary${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const res = await axios.get(url, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    return res.data;
  },
  async getOrdersSummary(params?: any) {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    const url = `/api/pharmacy/reports/orders/summary${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const res = await axios.get(url, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    return res.data;
  },
  async getCustomersSummary(params?: any) {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    const url = `/api/pharmacy/reports/customers/summary${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const res = await axios.get(url, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    return res.data;
  },
  async getInventorySummary() {
    const token = localStorage.getItem('token');
    const res = await axios.get('/api/pharmacy/reports/inventory/summary', { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    return res.data;
  },
  async getSuppliersSummary() {
    const token = localStorage.getItem('token');
    const res = await axios.get('/api/pharmacy/reports/suppliers/summary', { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    return res.data;
  },
  async getPrescriptionsSummary(params?: any) {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    const url = `/api/pharmacy/reports/prescriptions/summary${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const res = await axios.get(url, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    return res.data;
  },
  async deleteSupplier(id: string) {
    const token = localStorage.getItem('token');
    const res = await axios.delete(`/api/pharmacy/suppliers/${id}`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    return res.data;
  },
  async listCustomers() {
    const token = localStorage.getItem('token');
    const res = await axios.get('/api/pharmacy/customers', { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    return res.data;
  },
  async createCustomer(fields: any, image?: File) {
    const token = localStorage.getItem('token');
    const fd = new FormData();
    Object.entries(fields).forEach(([k, v]) => {
      if (Array.isArray(v)) {
        fd.append(k, v.join(','));
      } else if (v !== undefined && v !== null) {
        fd.append(k, String(v));
      }
    });
    if (image) fd.append('image', image);
    const res = await axios.post('/api/pharmacy/customers', fd, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    return res.data;
  },
  async updateCustomer(id: string, fields: any, image?: File) {
    const token = localStorage.getItem('token');
    const fd = new FormData();
    Object.entries(fields).forEach(([k, v]) => {
      if (Array.isArray(v)) {
        fd.append(k, v.join(','));
      } else if (v !== undefined && v !== null) {
        fd.append(k, String(v));
      }
    });
    if (image) fd.append('image', image);
    const res = await axios.put(`/api/pharmacy/customers/${id}`, fd, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    return res.data;
  },
  async deleteCustomer(id: string) {
    const token = localStorage.getItem('token');
    const res = await axios.delete(`/api/pharmacy/customers/${id}`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    return res.data;
  },
  async getReports(params?: { since?: string; until?: string }) {
    const token = localStorage.getItem('token');
    const res = await axios.get('/api/pharmacy/reports', {
      params,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return res.data as {
      byStatus: Array<{ _id: string; count: number; total: number }>;
      revenueByDay: Array<{ _id: string; total: number }>;
      topItems: Array<{ _id: string; name: string; quantity: number; revenue: number }>;
      customers: Array<{ _id: string; orders: number; total: number }>;
    };
  },
  async getSettings() {
    const token = localStorage.getItem('token');
    const res = await axios.get('/api/pharmacy/settings', { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    return res.data;
  },
  async updateSettings(fields: any, logo?: File, banner?: File) {
    const token = localStorage.getItem('token');
    const fd = new FormData();
    Object.entries(fields).forEach(([k, v]) => {
      if (v !== undefined && v !== null) fd.append(k, String(v));
    });
    if (logo) fd.append('logo', logo);
    if (banner) fd.append('banner', banner);
    const res = await axios.put('/api/pharmacy/settings', fd, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    return res.data;
  },
  async getMyProfile() {
    const token = localStorage.getItem('token');
    const res = await axios.get('/api/pharmacy/me', { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    return res.data;
  },
  async updateMyProfile(
    fields: any,
    avatar?: File,
    extras?: { licenseDoc?: File; gstCertificate?: File; panCard?: File }
  ) {
    const token = localStorage.getItem('token');
    const fd = new FormData();
    Object.entries(fields).forEach(([k, v]) => { if (v !== undefined && v !== null) fd.append(k, String(v)); });
    if (avatar) fd.append('avatar', avatar);
    if (extras?.licenseDoc) fd.append('licenseDoc', extras.licenseDoc);
    if (extras?.gstCertificate) fd.append('gstCertificate', extras.gstCertificate);
    if (extras?.panCard) fd.append('panCard', extras.panCard);
    const res = await axios.put('/api/pharmacy/me', fd, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    return res.data;
  },

  // Profile Completion System
  async getProfileCompletion() {
    const token = localStorage.getItem('token');
    const res = await axios.get('/api/pharmacy/profile-completion', { 
      headers: token ? { Authorization: `Bearer ${token}` } : undefined 
    });
    return res.data;
  },

  async saveProfileProgress(profileData: any) {
    const token = localStorage.getItem('token');
    const res = await axios.post('/api/pharmacy/save-profile-progress', profileData, { 
      headers: token ? { Authorization: `Bearer ${token}` } : undefined 
    });
    return res.data;
  },

  async completeProfile(profileData: any, documents?: {
    license?: File;
    gst?: File;
    pan?: File;
    other?: File;
  }) {
    const token = localStorage.getItem('token');
    const fd = new FormData();
    
    // Add profile data (excluding documents array)
    Object.entries(profileData).forEach(([key, value]) => {
      if (key !== 'documents' && value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(item => fd.append(key, item));
        } else {
          fd.append(key, String(value));
        }
      }
    });
    
    // Add documents
    if (documents) {
      if (documents.license) fd.append('license', documents.license);
      if (documents.gst) fd.append('gst', documents.gst);
      if (documents.pan) fd.append('pan', documents.pan);
      if (documents.other) fd.append('other', documents.other);
    }
    
    const res = await axios.post('/api/pharmacy/complete-profile', fd, { 
      headers: token ? { Authorization: `Bearer ${token}` } : undefined 
    });
    return res.data;
  },
};

export default pharmacyService;


