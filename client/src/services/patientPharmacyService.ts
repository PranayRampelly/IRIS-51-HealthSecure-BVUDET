import axios from 'axios';

// Base API configuration
const API_BASE = 'http://localhost:5000/api';

// Interfaces for patient pharmacy data
export interface Medicine {
  _id: string;
  name: string;
  generic: string;
  dosage: string;
  form: string;
  manufacturer: string;
  description: string;
  category: string;
  prescriptionRequired: boolean;
  stock: number;
  genericPrice: number;
  brandPrice: number;
  insuranceCovered: boolean;
  insurancePrice: number;
  rating: number;
  reviews: number;
  cloudinaryUrl?: string;
  deliveryTime: string;
}

export interface Prescription {
  _id: string;
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
  prescribedBy: string;
  prescribedDate: string;
  refills: number;
  status: 'active' | 'expired' | 'completed';
  notes?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  items: Array<{
    medicineId: string;
    medicineName: string;
    quantity: number;
    price: number;
    variant: string;
  }>;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  estimatedDelivery: string;
  trackingNumber?: string;
  pharmacy: {
    name: string;
    address: string;
    phone: string;
  };
}

export interface CartItem {
  _id: string;
  medicineId: string;
  name: string;
  generic: string;
  dosage: string;
  form: string;
  manufacturer: string;
  description: string;
  category: string;
  prescriptionRequired: boolean;
  cloudinaryUrl?: string;
  variant: string;
  quantity: number;
  packSize: number;
  pharmacy: string;
  insuranceApplied: boolean;
  genericPrice: number;
  brandPrice: number;
  unitPrice: number;
  totalPrice: number;
  stock: number;
}

export interface PriceComparison {
  medicines: Array<{
    medicineId: string;
    medicineName: string;
    dosage: string;
    form: string;
    manufacturer: string;
    description: string;
    cloudinaryUrl?: string;
    category: string;
    prescriptionRequired: boolean;
    pharmacies: Array<{
      pharmacyId: string;
      pharmacyName: string;
      genericPrice: number;
      brandPrice: number;
      insurancePrice?: number;
      savings: number;
      inStock: boolean;
      quantity: number;
      deliveryTime: string;
      rating: number;
      reviews: number;
    }>;
  }>;
}

export interface PatientAnalytics {
  totalOrders: number;
  totalRevenue: number;
  lowStockItems: Array<{
    _id: string;
    name: string;
    stock: number;
  }>;
  topMedicines: Array<{
    _id: string;
    name: string;
    totalQuantity: number;
    totalRevenue: number;
  }>;
}

const patientPharmacyService = {
  // Get authentication token
  getAuthToken(): string | null {
    return localStorage.getItem('token');
  },

  // Get auth headers
  getAuthHeaders() {
    const token = this.getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  // Search medicines
  async searchMedicines(filters: {
    query?: string;
    category?: string;
    inStock?: boolean;
    sortBy?: string;
    limit?: number;
  } = {}): Promise<Medicine[]> {
    try {
      const params = new URLSearchParams();
      if (filters.query) params.append('q', filters.query);
      if (filters.category) params.append('category', filters.category);
      if (filters.inStock !== undefined) params.append('inStock', filters.inStock.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await axios.get(`${API_BASE}/patient/pharmacy/search?${params}`, {
        headers: this.getAuthHeaders()
      });
      return response.data.medicines || [];
    } catch (error) {
      console.error('Error searching medicines:', error);
      throw error;
    }
  },

  // Get medicine details
  async getMedicineDetails(medicineId: string): Promise<Medicine> {
    try {
      const response = await axios.get(`${API_BASE}/patient/pharmacy/medicines/${medicineId}`, {
        headers: this.getAuthHeaders()
      });
      // Backend returns medicine directly, not wrapped in { medicine: ... }
      return response.data.medicine || response.data;
    } catch (error) {
      console.error('Error getting medicine details:', error);
      throw error;
    }
  },

  // Get medicine categories
  async getCategories(): Promise<string[]> {
    try {
      const response = await axios.get(`${API_BASE}/patient/pharmacy/categories`, {
        headers: this.getAuthHeaders()
      });
      return response.data.categories || [];
    } catch (error) {
      console.error('Error getting categories:', error);
      throw error;
    }
  },

  // Get price comparison
  async getPriceComparison(searchQuery?: string): Promise<PriceComparison> {
    try {
      const params = searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : '';
      const response = await axios.get(`${API_BASE}/patient/pharmacy/price-comparison${params}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error getting price comparison:', error);
      throw error;
    }
  },

  // Cart operations
  async getCart(): Promise<CartItem[]> {
    try {
      const response = await axios.get(`${API_BASE}/patient/pharmacy/cart`, {
        headers: this.getAuthHeaders()
      });
      return response.data.cartItems || [];
    } catch (error) {
      console.error('Error getting cart:', error);
      throw error;
    }
  },

  async addToCart(cartData: {
    medicineId: string;
    variant: string;
    quantity: number;
    packSize: number;
    pharmacy: string;
    insuranceApplied: boolean;
  }): Promise<CartItem> {
    try {
      const response = await axios.post(`${API_BASE}/patient/pharmacy/cart`, cartData, {
        headers: this.getAuthHeaders()
      });
      return response.data.cartItem;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },

  async updateCartItem(cartItemId: string, updates: {
    quantity?: number;
    packSize?: number;
    variant?: string;
    insuranceApplied?: boolean;
  }): Promise<CartItem> {
    try {
      const response = await axios.put(`${API_BASE}/patient/pharmacy/cart/${cartItemId}`, updates, {
        headers: this.getAuthHeaders()
      });
      return response.data.cartItem;
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  },

  async removeFromCart(cartItemId: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE}/patient/pharmacy/cart/${cartItemId}`, {
        headers: this.getAuthHeaders()
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  },

  async clearCart(): Promise<void> {
    try {
      await axios.delete(`${API_BASE}/patient/pharmacy/cart`, {
        headers: this.getAuthHeaders()
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  },

  // Checkout
  async checkout(checkoutData: {
    deliveryDetails: {
      option: string;
      address: string;
      instructions?: string;
    };
    paymentDetails: {
      method: string;
      status: string;
    };
    prescriptionRequired: boolean;
  }): Promise<Order> {
    try {
      const response = await axios.post(`${API_BASE}/patient/pharmacy/checkout`, checkoutData, {
        headers: this.getAuthHeaders()
      });
      return response.data.order;
    } catch (error) {
      console.error('Error during checkout:', error);
      throw error;
    }
  },

  // Orders
  async getOrders(): Promise<Order[]> {
    try {
      const response = await axios.get(`${API_BASE}/patient/pharmacy/orders`, {
        headers: this.getAuthHeaders()
      });
      return response.data.orders || [];
    } catch (error) {
      console.error('Error getting orders:', error);
      throw error;
    }
  },

  async getOrderDetails(orderId: string): Promise<Order> {
    try {
      const response = await axios.get(`${API_BASE}/patient/pharmacy/orders/${orderId}`, {
        headers: this.getAuthHeaders()
      });
      return response.data.order;
    } catch (error) {
      console.error('Error getting order details:', error);
      throw error;
    }
  },

  // Analytics
  async getAnalytics(timeRange: string = '30'): Promise<PatientAnalytics> {
    try {
      const response = await axios.get(`${API_BASE}/patient/pharmacy/analytics?timeRange=${timeRange}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error getting analytics:', error);
      throw error;
    }
  },

  // Prescriptions
  async getPrescriptions(): Promise<Prescription[]> {
    try {
      const response = await axios.get(`${API_BASE}/patient/pharmacy/prescriptions`, {
        headers: this.getAuthHeaders()
      });
      return response.data.prescriptions || [];
    } catch (error) {
      console.error('Error getting prescriptions:', error);
      throw error;
    }
  },

  // Utility function to format currency
  formatCurrency(amount: number): string {
    return `$${amount.toFixed(2)}`;
  },

  // Utility function to get status color
  getStatusColor(status: string): string {
    switch (status) {
      case 'active':
      case 'confirmed':
      case 'shipped':
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },

  // Utility function to get order status icon
  getOrderStatusIcon(status: string): string {
    switch (status) {
      case 'processing':
        return 'Clock';
      case 'confirmed':
        return 'CheckCircle';
      case 'shipped':
        return 'Truck';
      case 'delivered':
        return 'CheckCircle';
      case 'cancelled':
        return 'XCircle';
      default:
        return 'AlertCircle';
    }
  }
};

export default patientPharmacyService;
