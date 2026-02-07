import axios from 'axios';

export interface CartItem {
  id: string;
  key: string;
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
  variant: 'generic' | 'brand';
  quantity: number;
  packSize: number;
  pharmacy: string;
  insuranceApplied: boolean;
  genericPrice: number;
  brandPrice: number;
  unitPrice: number;
  totalPrice: number;
  addedAt: string;
}

export interface DeliveryDetails {
  option: 'sameDay' | 'standard' | 'pickup';
  slot?: string;
  address: string;
  instructions?: string;
}

export interface PaymentDetails {
  method: 'cod' | 'online' | 'card';
  status?: 'pending' | 'completed' | 'failed';
  transactionId?: string;
}

export interface OrderHistoryResponse {
  orders: any[];
  totalPages: number;
  currentPage: number;
  total: number;
}

const patientCartService = {
  // Get cart items
  async getCart(): Promise<CartItem[]> {
    const token = localStorage.getItem('token');
    const response = await axios.get('/api/patient/cart', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Add item to cart
  async addToCart(data: {
    medicineId: string;
    variant?: 'generic' | 'brand';
    quantity?: number;
    packSize?: number;
    pharmacy?: string;
    insuranceApplied?: boolean;
  }): Promise<CartItem> {
    const token = localStorage.getItem('token');
    const response = await axios.post('/api/patient/cart', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Update cart item
  async updateCartItem(id: string, updates: Partial<CartItem>): Promise<CartItem> {
    const token = localStorage.getItem('token');
    const response = await axios.put(`/api/patient/cart/${id}`, updates, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Remove item from cart
  async removeFromCart(id: string): Promise<{ message: string }> {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`/api/patient/cart/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Clear cart
  async clearCart(): Promise<{ message: string }> {
    const token = localStorage.getItem('token');
    const response = await axios.delete('/api/patient/cart', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Checkout
  async checkout(data: {
    deliveryDetails: DeliveryDetails;
    paymentDetails: PaymentDetails;
    prescriptionFile?: File;
  }): Promise<{ message: string; order: any }> {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    
    formData.append('deliveryDetails', JSON.stringify(data.deliveryDetails));
    formData.append('paymentDetails', JSON.stringify(data.paymentDetails));
    
    if (data.prescriptionFile) {
      formData.append('prescriptionFile', data.prescriptionFile);
    }

    const response = await axios.post('/api/patient/checkout', formData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Get order history
  async getOrderHistory(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<OrderHistoryResponse> {
    const token = localStorage.getItem('token');
    const response = await axios.get('/api/patient/orders', {
      headers: { Authorization: `Bearer ${token}` },
      params
    });
    return response.data;
  },

  // Get order details
  async getOrderDetails(orderId: string): Promise<any> {
    const token = localStorage.getItem('token');
    const response = await axios.get(`/api/patient/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
};

export default patientCartService;
