import axios from 'axios';

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface PatientOrderDto {
  _id: string;
  orderNumber: string;
  items: Array<{ medicineName: string; quantity: number; price?: number; pharmacy?: string; }>;
  pricing?: { grandTotal: number };
  status: OrderStatus;
  placedAt?: string;
  estimatedDelivery?: string;
  paymentDetails?: { method: string };
  trackingNumber?: string;
  deliveryAddress?: string;
}

const withAuth = () => ({ Authorization: `Bearer ${localStorage.getItem('token') || ''}` });

export const orderService = {
  async listPatientOrders() {
    const res = await axios.get('/api/patient/orders', { headers: withAuth() });
    return res.data as { orders: PatientOrderDto[] } | PatientOrderDto[];
  },
  async listPharmacyPatientOrders() {
    const res = await axios.get('/api/pharmacy/orders/patients', { headers: withAuth() });
    return res.data as PatientOrderDto[];
  },
  async updatePharmacyOrderStatus(orderId: string, status: Exclude<OrderStatus, 'out_for_delivery'>) {
    const res = await axios.patch(`/api/pharmacy/orders/patients/${orderId}/status`, { status }, { headers: withAuth() });
    return res.data as PatientOrderDto;
  },
  async downloadReceipt(paymentId: string) {
    const res = await axios.get(`/api/payments/${paymentId}/receipt/pdf`, { headers: withAuth(), responseType: 'blob' });
    return res.data as Blob;
  }
};

export default orderService;



