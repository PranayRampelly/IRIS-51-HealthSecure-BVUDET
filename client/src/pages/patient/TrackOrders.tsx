import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Truck, Search, Filter, Star, DollarSign, Clock, Package, MapPin, Phone, MessageSquare,
  ChevronDown, ChevronUp, AlertTriangle, CheckCircle, XCircle, Calendar, User, RefreshCw,
  Download, Eye, Edit, Trash2, CreditCard, CheckCircle2, ArrowRight, ShoppingBag, Receipt,
  Navigation, Route, Timer, PhoneCall, Mail, MessageCircle, Bell, BellOff, Copy
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import orderService from '@/services/orderService';
import axios from 'axios';

interface OrderItem {
  id: number;
  medicineName: string;
  dosage: string;
  form: string;
  quantity: number;
  price: number;
  pharmacy: string;
  deliveryTime: string;
  insurancePrice?: number;
  savings: number;
}

interface TrackingEvent {
  id: number;
  timestamp: string;
  status: string;
  description: string;
  location?: string;
  estimatedTime?: string;
  icon: string;
  color: string;
}

interface Order {
  id: number;
  orderNumber: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
  orderDate: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  trackingNumber?: string;
  pharmacy: {
    name: string;
    address: string;
    phone: string;
    rating: number;
    email: string;
  };
  deliveryAddress: string;
  deliveryInstructions?: string;
  paymentMethod: string;
  paymentStatus?: 'pending' | 'completed' | 'failed';
  trackingEvents: TrackingEvent[];
  isNotified: boolean;
  driver?: {
    name: string;
    phone: string;
    vehicleNumber: string;
    photo?: string;
  };
}

const formatINR = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n || 0);

const TrackOrders = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [role, setRole] = useState<'patient'|'pharmacy'|'admin'>('patient');

  // Mock fallback data (used only if API fails)
  const mockOrders: Order[] = [
    {
      id: 1,
      orderNumber: 'ORD-2024-001',
      items: [
        {
          id: 1,
          medicineName: 'Amoxicillin 500mg',
          dosage: '500mg',
          form: 'Capsule',
          quantity: 1,
          price: 12.50,
          pharmacy: 'City Pharmacy',
          deliveryTime: '2-3 hours',
          insurancePrice: 8.75,
          savings: 32.50
        },
        {
          id: 2,
          medicineName: 'Ibuprofen 400mg',
          dosage: '400mg',
          form: 'Tablet',
          quantity: 2,
          price: 8.75,
          pharmacy: 'Quick Pharmacy',
          deliveryTime: '1-2 hours',
          savings: 19.25
        }
      ],
      totalAmount: 30.00,
      status: 'out_for_delivery',
      orderDate: '2024-01-20',
      estimatedDelivery: '2024-01-22',
      trackingNumber: 'TRK123456',
      pharmacy: {
        name: 'City Pharmacy',
        address: '123 Main Street, City Center',
        phone: '+1-555-0301',
        rating: 4.5,
        email: 'contact@citypharmacy.com'
      },
      deliveryAddress: '456 Oak Avenue, Metro District',
      deliveryInstructions: 'Leave at front door if no answer',
      paymentMethod: 'Credit Card',
      paymentStatus: 'completed',
      isNotified: true,
      driver: {
        name: 'John Smith',
        phone: '+1-555-0123',
        vehicleNumber: 'DL-1234'
      },
      trackingEvents: [
        {
          id: 1,
          timestamp: '2024-01-20 10:30:00',
          status: 'Order Placed',
          description: 'Your order has been successfully placed',
          icon: 'CheckCircle',
          color: 'text-green-500'
        },
        {
          id: 2,
          timestamp: '2024-01-20 11:15:00',
          status: 'Order Confirmed',
          description: 'Your order has been confirmed and is being processed',
          icon: 'CheckCircle',
          color: 'text-green-500'
        },
        {
          id: 3,
          timestamp: '2024-01-20 14:20:00',
          status: 'Processing',
          description: 'Your medicines are being prepared for delivery',
          icon: 'Clock',
          color: 'text-blue-500'
        },
        {
          id: 4,
          timestamp: '2024-01-20 16:45:00',
          status: 'Shipped',
          description: 'Your order has been shipped and is on its way',
          location: 'City Pharmacy Warehouse',
          icon: 'Truck',
          color: 'text-purple-500'
        },
        {
          id: 5,
          timestamp: '2024-01-22 09:30:00',
          status: 'Out for Delivery',
          description: 'Your order is out for delivery',
          location: 'Metro District',
          estimatedTime: '30-45 minutes',
          icon: 'Navigation',
          color: 'text-orange-500'
        }
      ]
    },
    {
      id: 2,
      orderNumber: 'ORD-2024-002',
      items: [
        {
          id: 3,
          medicineName: 'Vitamin D3 1000IU',
          dosage: '1000IU',
          form: 'Softgel',
          quantity: 1,
          price: 15.00,
          pharmacy: 'Wellness Pharmacy',
          deliveryTime: '2-4 hours',
          insurancePrice: 12.00,
          savings: 20.00
        }
      ],
      totalAmount: 15.00,
      status: 'delivered',
      orderDate: '2024-01-21',
      estimatedDelivery: '2024-01-23',
      actualDelivery: '2024-01-22 14:30:00',
      trackingNumber: 'TRK789012',
      pharmacy: {
        name: 'Wellness Pharmacy',
        address: '789 Health Blvd, Wellness District',
        phone: '+1-555-0303',
        rating: 4.7,
        email: 'info@wellnesspharmacy.com'
      },
      deliveryAddress: '456 Oak Avenue, Metro District',
      paymentMethod: 'Insurance',
      paymentStatus: 'completed',
      isNotified: false,
      trackingEvents: [
        {
          id: 1,
          timestamp: '2024-01-21 09:00:00',
          status: 'Order Placed',
          description: 'Your order has been successfully placed',
          icon: 'CheckCircle',
          color: 'text-green-500'
        },
        {
          id: 2,
          timestamp: '2024-01-21 10:30:00',
          status: 'Order Confirmed',
          description: 'Your order has been confirmed and is being processed',
          icon: 'CheckCircle',
          color: 'text-green-500'
        },
        {
          id: 3,
          timestamp: '2024-01-21 13:45:00',
          status: 'Processing',
          description: 'Your medicines are being prepared for delivery',
          icon: 'Clock',
          color: 'text-blue-500'
        },
        {
          id: 4,
          timestamp: '2024-01-22 11:20:00',
          status: 'Shipped',
          description: 'Your order has been shipped and is on its way',
          location: 'Wellness Pharmacy',
          icon: 'Truck',
          color: 'text-purple-500'
        },
        {
          id: 5,
          timestamp: '2024-01-22 14:15:00',
          status: 'Out for Delivery',
          description: 'Your order is out for delivery',
          location: 'Metro District',
          icon: 'Navigation',
          color: 'text-orange-500'
        },
        {
          id: 6,
          timestamp: '2024-01-22 14:30:00',
          status: 'Delivered',
          description: 'Your order has been successfully delivered',
          location: '456 Oak Avenue, Metro District',
          icon: 'CheckCircle2',
          color: 'text-green-500'
        }
      ]
    },
    {
      id: 3,
      orderNumber: 'ORD-2024-003',
      items: [
        {
          id: 4,
          medicineName: 'Omeprazole 20mg',
          dosage: '20mg',
          form: 'Capsule',
          quantity: 1,
          price: 22.50,
          pharmacy: 'Digestive Care',
          deliveryTime: '3-4 hours',
          insurancePrice: 15.75,
          savings: 42.50
        }
      ],
      totalAmount: 22.50,
      status: 'processing',
      orderDate: '2024-01-22',
      estimatedDelivery: '2024-01-24',
      trackingNumber: 'TRK345678',
      pharmacy: {
        name: 'Digestive Care',
        address: '321 Gastro Street, Medical Center',
        phone: '+1-555-0304',
        rating: 4.6,
        email: 'orders@digestivecare.com'
      },
      deliveryAddress: '456 Oak Avenue, Metro District',
      paymentMethod: 'Credit Card',
      paymentStatus: 'pending',
      isNotified: true,
      trackingEvents: [
        {
          id: 1,
          timestamp: '2024-01-22 08:15:00',
          status: 'Order Placed',
          description: 'Your order has been successfully placed',
          icon: 'CheckCircle',
          color: 'text-green-500'
        },
        {
          id: 2,
          timestamp: '2024-01-22 09:30:00',
          status: 'Order Confirmed',
          description: 'Your order has been confirmed and is being processed',
          icon: 'CheckCircle',
          color: 'text-green-500'
        },
        {
          id: 3,
          timestamp: '2024-01-22 11:45:00',
          status: 'Processing',
          description: 'Your medicines are being prepared for delivery',
          icon: 'Clock',
          color: 'text-blue-500'
        }
      ]
    }
  ];

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        let data: any[] = [];
        // Determine role by route or selector; default to patient
        if (role === 'pharmacy') {
          data = await orderService.listPharmacyPatientOrders();
        } else {
          const res = await orderService.listPatientOrders();
          data = (Array.isArray(res) ? res : (res as any).orders) || [];
        }
        // Map backend DTO to UI Order model conservatively
        const mapped: Order[] = data.map((o: any, idx: number) => ({
          id: idx,
          orderNumber: o.orderNumber || o._id,
          items: (o.items || []).map((it: any, i: number) => ({
            id: i,
            medicineName: it.medicineName || it?.medicineId?.name || 'Item',
            dosage: it?.medicineId?.dosage || '',
            form: it?.medicineId?.form || '',
            quantity: Number(it.quantity || 1),
            price: Number(it.unitPrice || it.price || 0),
            pharmacy: it.pharmacy?.name || it.pharmacy || '' ,
            savings: 0,
          })),
          totalAmount: Number(o?.pricing?.grandTotal ?? 0),
          status: (o.status as Order['status']) || 'processing',
          orderDate: o.placedAt ? new Date(o.placedAt).toISOString().slice(0,10) : '',
          estimatedDelivery: o.estimatedDelivery ? new Date(o.estimatedDelivery).toISOString().slice(0,10) : '',
          trackingNumber: o.trackingNumber,
          pharmacy: { name: (o.items?.[0]?.pharmacy?.name || o.items?.[0]?.pharmacy || 'Pharmacy'), address: '', phone: '', rating: 4.5, email: '' },
          deliveryAddress: o.deliveryDetails?.address || '',
          paymentMethod: o.paymentDetails?.method || 'COD',
          paymentStatus: o.paymentDetails?.status || (o.paymentDetails?.method === 'online' ? 'completed' : 'pending'),
          isNotified: true,
          trackingEvents: [],
        }));
        setOrders(mapped);
        setFilteredOrders(mapped);
      } catch (e) {
        console.warn('TrackOrders: API failed, using mock data', e);
        setOrders(mockOrders);
        setFilteredOrders(mockOrders);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [role]);

  useEffect(() => {
    let filtered = orders;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.trackingNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.pharmacy.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (selectedStatus && selectedStatus !== 'all') {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }

    // Apply tab filter
    if (activeTab && activeTab !== 'all') {
      switch (activeTab) {
        case 'active':
          filtered = filtered.filter(order => 
            ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery'].includes(order.status)
          );
          break;
        case 'delivered':
          filtered = filtered.filter(order => order.status === 'delivered');
          break;
        case 'cancelled':
          filtered = filtered.filter(order => order.status === 'cancelled');
          break;
        case 'tracking':
          filtered = filtered.filter(order => order.trackingNumber);
          break;
      }
    }

    // Apply sorting
    switch (sortBy) {
      case 'date':
        filtered.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
        break;
      case 'status':
        const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];
        filtered.sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status));
        break;
      case 'amount':
        filtered.sort((a, b) => b.totalAmount - a.totalAmount);
        break;
      case 'pharmacy':
        filtered.sort((a, b) => a.pharmacy.name.localeCompare(b.pharmacy.name));
        break;
    }

    setFilteredOrders(filtered);
  }, [searchQuery, selectedStatus, activeTab, sortBy, orders]);

  const toggleNotifications = (orderId: number) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, isNotified: !order.isNotified }
        : order
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-teal-50 text-teal-800 ring-1 ring-teal-200';
      case 'confirmed':
      case 'processing':
        return 'bg-teal-50 text-teal-800 ring-1 ring-teal-200';
      case 'shipped':
        return 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200';
      case 'out_for_delivery':
        return 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200';
      case 'delivered':
        return 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200';
      case 'cancelled':
        return 'bg-rose-50 text-rose-800 ring-1 ring-rose-200';
      default:
        return 'bg-gray-50 text-gray-700 ring-1 ring-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-teal-600" />;
      case 'confirmed':
      case 'processing':
        return <CheckCircle className="h-4 w-4 text-teal-600" />;
      case 'shipped':
        return <Truck className="h-4 w-4 text-emerald-700" />;
      case 'out_for_delivery':
        return <Navigation className="h-4 w-4 text-emerald-700" />;
      case 'delivered':
        return <CheckCircle2 className="h-4 w-4 text-emerald-700" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-rose-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getProgressPercentage = (order: Order) => {
    const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
    const currentIndex = statusOrder.indexOf(order.status);
    return Math.round(((currentIndex + 1) / statusOrder.length) * 100);
  };

  const getLatestEvent = (order: Order) => {
    return order.trackingEvents[order.trackingEvents.length - 1];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-health-teal"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-900 via-teal-800 to-teal-700 p-6 sm:p-8">
            <h1 className="text-3xl font-bold text-white">Track Orders</h1>
            <p className="text-teal-100 mt-2">Monitor your pharmacy orders and live delivery updates</p>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
              {/* Search Input */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search orders, tracking number, or pharmacy..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-9"
                  />
                </div>
              </div>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 h-9">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Order Date</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="amount">Amount</SelectItem>
                  <SelectItem value="pharmacy">Pharmacy</SelectItem>
                </SelectContent>
              </Select>

              {/* Role */}
              <Select value={role} onValueChange={(v)=>setRole(v as any)}>
                <SelectTrigger className="w-36 h-9">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient">Patient</SelectItem>
                  <SelectItem value="pharmacy">Pharmacy</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>

              {/* Filter Toggle */}
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="h-9">
                <Filter className="h-4 w-4 mr-2" /> Filters {showFilters ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
              </Button>

              {/* Refresh */}
              <Button variant="outline" className="h-9" onClick={async ()=>{
                setLoading(true);
                try {
                  const data = role === 'pharmacy' ? await orderService.listPharmacyPatientOrders() : await orderService.listPatientOrders();
                  const d = Array.isArray(data) ? data : (data as any).orders;
                  // trigger useEffect-mapping manually
                  setOrders([]); setFilteredOrders([]);
                                     const mapped = (d || []).map((o: any, idx: number) => ({
                     id: idx,
                     orderNumber: o.orderNumber || o._id,
                     items: (o.items || []).map((it: any, i: number) => ({ id: i, medicineName: it.medicineName || it?.medicineId?.name || 'Item', dosage: it?.medicineId?.dosage || '', form: it?.medicineId?.form || '', quantity: Number(it.quantity || 1), price: Number(it.unitPrice || it.price || 0), pharmacy: it.pharmacy?.name || it.pharmacy || '', savings: 0 })),
                     totalAmount: Number(o?.pricing?.grandTotal ?? 0),
                     status: (o.status as Order['status']) || 'processing',
                     orderDate: o.placedAt ? new Date(o.placedAt).toISOString().slice(0,10) : '',
                     estimatedDelivery: o.estimatedDelivery ? new Date(o.estimatedDelivery).toISOString().slice(0,10) : '',
                     trackingNumber: o.trackingNumber,
                     pharmacy: { name: (o.items?.[0]?.pharmacy?.name || o.items?.[0]?.pharmacy || 'Pharmacy'), address: '', phone: '', rating: 4.5, email: '' },
                     deliveryAddress: o.deliveryDetails?.address || '',
                     paymentMethod: o.paymentDetails?.method || 'COD',
                     paymentStatus: o.paymentDetails?.status || (o.paymentDetails?.method === 'online' ? 'completed' : 'pending'),
                     isNotified: true,
                     trackingEvents: [],
                   }));
                  setOrders(mapped); setFilteredOrders(mapped);
                } catch {
                  setOrders(mockOrders); setFilteredOrders(mockOrders);
                } finally { setLoading(false); }
              }}>
                <RefreshCw className="h-4 w-4 mr-2" /> Refresh
              </Button>

              {/* Export */}
              <Button className="h-9 bg-emerald-600 hover:bg-emerald-700" onClick={()=>{
                const blob = new Blob([JSON.stringify(filteredOrders, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'orders.json'; a.click(); URL.revokeObjectURL(url);
              }}>
                <Download className="h-4 w-4 mr-2" /> Export
              </Button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Date Range</label>
                  <Select value="all" onValueChange={() => {}}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="All Dates" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Dates</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Pharmacy</label>
                  <Select value="all" onValueChange={() => {}}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="All Pharmacies" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Pharmacies</SelectItem>
                      <SelectItem value="city">City Pharmacy</SelectItem>
                      <SelectItem value="wellness">Wellness Pharmacy</SelectItem>
                      <SelectItem value="digestive">Digestive Care</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/60 backdrop-blur border rounded-xl">
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="tracking">Tracking</TabsTrigger>
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Results */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-600">Try adjusting your search criteria or filters</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-600">
                  Showing {filteredOrders.length} of {orders.length} orders
                </p>
              </div>

              {filteredOrders.map((order) => (
                <Card key={order.id} className="hover:shadow-md transition-all border border-emerald-100/70 rounded-2xl">
                  <CardContent className="p-5 md:p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="p-3 bg-emerald-50 rounded-xl ring-1 ring-emerald-200">
                          <Package className="h-6 w-6 text-emerald-700" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <h3 className="text-lg font-semibold text-gray-900">{order.orderNumber}</h3>
                              <Badge className={getStatusColor(order.status)}>
                                {order.status.replace('_', ' ')}
                              </Badge>
                              {order.trackingNumber && (
                                <Badge variant="outline" className="border-emerald-200 text-emerald-800">#{order.trackingNumber}</Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleNotifications(order.id)}
                              >
                                {order.isNotified ? (
                                  <Bell className="h-4 w-4 text-blue-500" />
                                ) : (
                                  <BellOff className="h-4 w-4 text-gray-400" />
                                )}
                              </Button>
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 mb-3">{order.items.length} item{order.items.length !== 1 ? 's' : ''} • Total: {formatINR(order.totalAmount)}</p>

                          {/* Items mini list */}
                          <div className="hidden md:grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                            {order.items.slice(0, 2).map((it, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white border">
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 bg-emerald-50 rounded ring-1 ring-emerald-200">
                                    <Package className="h-3.5 w-3.5 text-emerald-700" />
                                  </div>
                                  <div className="text-sm text-gray-800 truncate max-w-[220px]">{it.medicineName}</div>
                                </div>
                                <div className="text-xs text-gray-600">Qty: {it.quantity}</div>
                              </div>
                            ))}
                          </div>

                          {/* Progress Bar */}
                          <div className="mb-4">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm text-gray-600">Delivery Progress</span>
                              <span className="text-sm font-medium text-gray-900">{getProgressPercentage(order)}%</span>
                            </div>
                            <Progress value={getProgressPercentage(order)} className="h-2 bg-emerald-100" />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-emerald-700" />
                              <span className="text-sm text-gray-600">
                                Ordered: {order.orderDate}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-emerald-700" />
                              <span className="text-sm text-gray-600">
                                ETA: {order.estimatedDelivery}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-emerald-700" />
                              <span className="text-sm text-gray-600">
                                {order.pharmacy.name}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CreditCard className="h-4 w-4 text-emerald-700" />
                              <span className="text-sm text-gray-600">
                                {order.paymentMethod}
                              </span>
                            </div>
                          </div>

                          {/* Latest Tracking Event */}
                          {order.trackingEvents.length > 0 && (
                            <div className="border-t pt-4">
                              <div className="flex items-center space-x-3">
                                {getStatusIcon(order.status)}
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {getLatestEvent(order).status}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {getLatestEvent(order).timestamp} • {getLatestEvent(order).description}
                                  </p>
                                  {getLatestEvent(order).location && (
                                    <p className="text-xs text-gray-500">
                                      📍 {getLatestEvent(order).location}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Driver Info for Out for Delivery */}
                          {order.status === 'out_for_delivery' && order.driver && (
                            <div className="border-t pt-4 mt-4">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-green-100 rounded">
                                  <User className="h-4 w-4 text-green-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    Driver: {order.driver.name}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    Vehicle: {order.driver.vehicleNumber}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1 text-emerald-700" />
                          Track
                        </Button>
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4 mr-1 text-emerald-700" />
                          Call
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-1 text-emerald-700" />
                          Message
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>

        {/* Order Details Dialog */}
        <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border-emerald-100">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-emerald-800">
                <Truck className="h-5 w-5 text-emerald-700" />
                <span className="text-lg">Order Tracking Details</span>
              </DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start gap-4">
                  <div className="p-4 bg-emerald-50 rounded-xl ring-1 ring-emerald-200">
                    <Package className="h-10 w-10 text-emerald-700" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-2xl font-bold text-gray-900">{selectedOrder.orderNumber}</h3>
                      <Badge className={getStatusColor(selectedOrder.status)}>{selectedOrder.status.replace('_', ' ')}</Badge>
                      {selectedOrder.trackingNumber && (
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="border-emerald-200 text-emerald-800">#{selectedOrder.trackingNumber}</Badge>
                          <Button variant="ghost" size="sm" className="h-6 px-2" onClick={()=>navigator.clipboard?.writeText(selectedOrder.trackingNumber || '')}>
                            <Copy className="h-3 w-3 text-gray-500" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-700 mb-1">
                      <span>{selectedOrder.items.length} item{selectedOrder.items.length !== 1 ? 's' : ''}</span>
                      <span>•</span>
                      <span>Total: {formatINR(selectedOrder.totalAmount)}</span>
                    </div>
                    <div className="text-sm text-gray-600">Estimated Delivery: {selectedOrder.estimatedDelivery}</div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>Progress</span>
                        <span>{getProgressPercentage(selectedOrder)}%</span>
                      </div>
                      <Progress value={getProgressPercentage(selectedOrder)} className="h-2 bg-emerald-100" />
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="tracking" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 bg-white/60 backdrop-blur border rounded-xl">
                    <TabsTrigger value="tracking">Tracking</TabsTrigger>
                    <TabsTrigger value="items">Items</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="contact">Contact</TabsTrigger>
                  </TabsList>

                  <TabsContent value="tracking" className="space-y-4">
                    {/* Progress Timeline */}
                    <div className="relative pl-1">
                      {selectedOrder.trackingEvents.map((event, index) => {
                        const isCurrent = index === selectedOrder.trackingEvents.length - 1;
                        const dotBg = event.color.replace('text-', 'bg-').replace('-500', '-100');
                        return (
                          <div key={event.id} className="relative flex items-start gap-4 mb-6">
                            <div className="relative">
                              <div className={`p-2 rounded-full ring-2 ring-white shadow ${dotBg}`}>
                                {event.icon === 'CheckCircle' && <CheckCircle className="h-4 w-4 text-emerald-700" />}
                                {event.icon === 'Clock' && <Clock className="h-4 w-4 text-emerald-700" />}
                                {event.icon === 'Truck' && <Truck className="h-4 w-4 text-emerald-700" />}
                                {event.icon === 'Navigation' && <Navigation className="h-4 w-4 text-emerald-700" />}
                                {event.icon === 'CheckCircle2' && <CheckCircle2 className="h-4 w-4 text-emerald-700" />}
                              </div>
                              {index < selectedOrder.trackingEvents.length - 1 && (
                                <div className="absolute left-4 top-8 w-0.5 h-10 bg-gray-200"></div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className={`font-medium ${isCurrent ? 'text-emerald-800' : 'text-gray-900'}`}>{event.status}</h4>
                                <span className="text-xs text-gray-500">{event.timestamp}</span>
                              </div>
                              <p className="text-sm text-gray-600 mb-1">{event.description}</p>
                              <div className="flex flex-wrap gap-4">
                                {event.location && (
                                  <span className="inline-flex items-center text-xs text-gray-500"><MapPin className="h-3 w-3 mr-1 text-rose-500" /> {event.location}</span>
                                )}
                                {event.estimatedTime && (
                                  <span className="inline-flex items-center text-xs text-blue-600"><Timer className="h-3 w-3 mr-1" /> {event.estimatedTime}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Driver Info */}
                    {selectedOrder.status === 'out_for_delivery' && selectedOrder.driver && (
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-medium text-green-800 mb-2">Driver Information</h4>
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-green-100 rounded">
                            <User className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">{selectedOrder.driver.name}</p>
                            <p className="text-sm text-gray-600">Vehicle: {selectedOrder.driver.vehicleNumber}</p>
                            <p className="text-sm text-gray-600">Phone: {selectedOrder.driver.phone}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <Phone className="h-4 w-4 mr-1" />
                              Call Driver
                            </Button>
                            <Button variant="outline" size="sm">
                              <MessageCircle className="h-4 w-4 mr-1" />
                              Message
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="items" className="space-y-4">
                    <div className="space-y-3">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded">
                              <Package className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">{item.medicineName}</p>
                              <p className="text-sm text-gray-600">{item.pharmacy}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatINR(item.price)}</p>
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                            {item.insurancePrice && (
                              <p className="text-xs text-green-600">Insurance: {formatINR(item.insurancePrice)}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="details" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg bg-white">
                        <div className="flex items-center gap-2 text-sm text-gray-600"><Calendar className="h-4 w-4 text-emerald-700" /> Order Date</div>
                        <div className="mt-1 font-semibold text-gray-900">{selectedOrder.orderDate}</div>
                      </div>
                      <div className="p-4 border rounded-lg bg-white">
                        <div className="flex items-center gap-2 text-sm text-gray-600"><Clock className="h-4 w-4 text-emerald-700" /> Estimated Delivery</div>
                        <div className="mt-1 font-semibold text-gray-900">{selectedOrder.estimatedDelivery}</div>
                      </div>
                      <div className="p-4 border rounded-lg bg-white">
                        <div className="flex items-center gap-2 text-sm text-gray-600"><CreditCard className="h-4 w-4 text-emerald-700" /> Payment Method</div>
                        <div className="mt-1 font-semibold text-gray-900">{selectedOrder.paymentMethod}</div>
                      </div>
                      <div className="p-4 border rounded-lg bg-white">
                        <div className="flex items-center gap-2 text-sm text-gray-600"><DollarSign className="h-4 w-4 text-emerald-700" /> Total Amount</div>
                        <div className="mt-1 font-semibold text-gray-900">{formatINR(selectedOrder.totalAmount)}</div>
                      </div>
                      <div className="p-4 border rounded-lg bg-white">
                        <div className="flex items-center gap-2 text-sm text-gray-600"><CheckCircle className="h-4 w-4 text-emerald-700" /> Payment Status</div>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge 
                            className={
                              selectedOrder.paymentStatus === 'completed' 
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                                : selectedOrder.paymentStatus === 'failed'
                                ? 'bg-red-100 text-red-800 border-red-200'
                                : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                            }
                          >
                            {selectedOrder.paymentStatus === 'completed' ? 'Completed' : 
                             selectedOrder.paymentStatus === 'failed' ? 'Failed' : 
                             selectedOrder.paymentMethod === 'online' ? 'Pending' : 'Pending'}
                          </Badge>
                          {selectedOrder.paymentMethod === 'online' && selectedOrder.paymentStatus === 'completed' && (
                            <CheckCircle className="h-3 w-3 text-emerald-600" />
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Delivery Address</h4>
                      <div className="p-4 border rounded-lg bg-white">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 mt-1 text-rose-500" />
                          <div className="text-sm text-gray-800">{selectedOrder.deliveryAddress}</div>
                        </div>
                        {selectedOrder.deliveryInstructions && (
                          <div className="text-xs text-gray-600 mt-2">Instructions: {selectedOrder.deliveryInstructions}</div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="contact" className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Pharmacy Contact</h4>
                      <PharmacyContactBlock pharmacyId={(selectedOrder.items?.[0] as any)?.pharmacy || ''} fallback={selectedOrder.pharmacy} />
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex space-x-2 pt-4 border-t">
                  <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Tracking
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Download Receipt
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

// Detailed Pharmacy Contact subcomponent
const PharmacyContactBlock: React.FC<{ pharmacyId: string; fallback: Order['pharmacy'] }> = ({ pharmacyId, fallback }) => {
  const [info, setInfo] = React.useState<{ name: string; address: string; phone: string; email: string; rating: number; logo?: string } | null>(null);
  React.useEffect(() => {
    (async () => {
      try {
        if (!pharmacyId) { setInfo(fallback as any); return; }
        const token = localStorage.getItem('token');
        const res = await axios.get(`/api/patient/pharmacy/contact/${pharmacyId}`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
        setInfo(res.data);
      } catch {
        setInfo(fallback as any);
      }
    })();
  }, [pharmacyId]);

  const data: { name: string; address: string; phone: string; email: string; rating: number; logo?: string } = info || { ...fallback } as any;

  return (
    <div className="p-4 border rounded-lg bg-white">
      <div className="flex items-start gap-3 mb-3">
        {data?.logo ? (
          <img src={data.logo} alt={data.name} className="h-12 w-12 rounded-lg object-cover ring-1 ring-emerald-200" />
        ) : (
          <div className="h-12 w-12 rounded-lg bg-emerald-50 ring-1 ring-emerald-200 flex items-center justify-center">
            <Package className="h-5 w-5 text-emerald-700" />
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h5 className="font-medium text-gray-900">{data?.name || 'Pharmacy'}</h5>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-emerald-600" />
              <span className="text-sm">{Number(data?.rating ?? 4.5).toFixed(1)}</span>
            </div>
          </div>
          <div className="flex items-start gap-2 mt-1">
            <MapPin className="h-4 w-4 mt-0.5 text-emerald-700" />
            <p className="text-sm text-gray-700">{data?.address || '—'}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-3">
        {data?.phone && (
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
            <Phone className="h-4 w-4 mr-1" />
            {data.phone}
          </Button>
        )}
        {data?.email && (
          <Button variant="outline" size="sm">
            <Mail className="h-4 w-4 mr-1" />
            {data.email}
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2"
          onClick={()=>window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data?.address || '')}`, '_blank')}
        >
          <MapPin className="h-3 w-3 mr-1 text-emerald-700" /> Open in Maps
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2"
          onClick={()=>navigator.clipboard?.writeText(data?.address || '')}
        >
          <Copy className="h-3 w-3 mr-1" /> Copy Address
        </Button>
      </div>
    </div>
  );
};

export default TrackOrders;