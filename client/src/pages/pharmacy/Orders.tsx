import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Package, Truck, CheckCircle, Plus, Trash2, Upload, Search, Filter, 
  Eye, Edit, Clock, AlertTriangle, Star, DollarSign, User, MapPin, 
  Phone, Mail, Calendar, FileText, Download, Share2, Bell, Settings,
  ArrowUpDown, ArrowRight, RefreshCw, Filter as FilterIcon, SortAsc,
  SortDesc, MoreHorizontal, Printer, MessageSquare, CreditCard
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import pharmacyService from '@/services/pharmacyService';
import ProfileCompletionCheck from '@/components/pharmacy/ProfileCompletionCheck';

// Helpers to format values coming from backend PatientOrder
const formatCurrency = (value?: number) => {
  if (typeof value !== 'number') return '—';
  return `₹${value.toLocaleString('en-IN')}`;
};

const formatDateTime = (value?: string) => {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
};

// Normalize fields between raw PatientOrder and transformed '/orders/patients'
const getCustomerName = (order: any) => {
  const p = order.patientId || order.patient;
  const first = p?.firstName || '';
  const last = p?.lastName || '';
  const combined = `${first} ${last}`.trim();
  return combined || '—';
};

const getCustomerContact = (order: any) => {
  const p = order.patientId || order.patient;
  return p?.phone || p?.email || '—';
};

const getAmount = (order: any) => {
  // Prefer pricing.grandTotal, fallback to totalAmount
  return order?.pricing?.grandTotal ?? order?.totalAmount ?? undefined;
};

const getPlacedAt = (order: any) => {
  return order?.placedAt || order?.createdAt || undefined;
};

const getPatientEmail = (order: any) => {
  const p = order.patientId || order.patient;
  return p?.email || '—';
};

const getDeliveryAddress = (order: any) => {
  // PatientOrder has deliveryDetails.address, transformed uses deliveryAddress
  return order?.deliveryDetails?.address || order?.deliveryAddress || '—';
};

const getDeliveryOption = (order: any) => order?.deliveryDetails?.option || '—';
const getDeliverySlot = (order: any) => order?.deliveryDetails?.slot || '—';

const getPaymentMethod = (order: any) => order?.paymentDetails?.method || order?.paymentMethod || '—';
const getPaymentStatus = (order: any) => order?.paymentDetails?.status || order?.paymentStatus || '—';

const getItemMedicineName = (item: any) => item?.medicineId?.name || item?.medicine?.name || item?.medicineName || '—';
const getItemUnitPrice = (item: any) => item?.unitPrice ?? item?.price ?? 0;
const getItemTotalPrice = (item: any) => item?.totalPrice ?? item?.total ?? 0;

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showOrderDialog, setShowOrderDialog] = useState(false);

  const isOfflineOrder = (order: any) => {
    const method = String(getPaymentMethod(order)).toLowerCase();
    return method === 'cash' || method === 'offline';
  };

  // Derived, filtered and sorted orders
  const filteredOrders = useMemo(() => {
    let list = Array.isArray(orders) ? [...orders] : [];

    // Determine effective status filter: tab overrides dropdown
    const statusFromTab = activeTab !== 'all' ? activeTab : undefined;
    const effectiveStatus = statusFromTab || (statusFilter !== 'all' ? statusFilter : undefined);
    if (effectiveStatus) {
      list = list.filter(o => (o.status || '').toLowerCase() === effectiveStatus);
    }

    // Search by order number, patient name, phone, email
    const q = (searchQuery || '').trim().toLowerCase();
    if (q) {
      list = list.filter(o => {
        const orderNo = String(o.orderNumber || '').toLowerCase();
        const name = `${o.patientId?.firstName ?? ''} ${o.patientId?.lastName ?? ''}`.toLowerCase();
        const phone = String(o.patientId?.phone || '').toLowerCase();
        const email = String(o.patientId?.email || '').toLowerCase();
        return orderNo.includes(q) || name.includes(q) || phone.includes(q) || email.includes(q);
      });
    }

    // Date range filter on placedAt
    if (dateFilter !== 'all') {
      const now = new Date();
      let since = new Date(0);
      if (dateFilter === 'today') {
        since = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (dateFilter === 'week') {
        since = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      } else if (dateFilter === 'month') {
        since = new Date(now.getFullYear(), now.getMonth(), 1);
      }
      list = list.filter(o => {
        const ts = o.placedAt ? new Date(o.placedAt).getTime() : 0;
        return ts >= since.getTime();
      });
    }

    // Sorting
    if (sortBy === 'date-desc') {
      list.sort((a, b) => new Date(b.placedAt || 0).getTime() - new Date(a.placedAt || 0).getTime());
    } else if (sortBy === 'date-asc') {
      list.sort((a, b) => new Date(a.placedAt || 0).getTime() - new Date(b.placedAt || 0).getTime());
    } else if (sortBy === 'amount-desc') {
      list.sort((a, b) => (b.pricing?.grandTotal || 0) - (a.pricing?.grandTotal || 0));
    } else if (sortBy === 'amount-asc') {
      list.sort((a, b) => (a.pricing?.grandTotal || 0) - (b.pricing?.grandTotal || 0));
    }

    return list;
  }, [orders, activeTab, statusFilter, dateFilter, searchQuery, sortBy]);

  // Enhanced form state
  const [orderForm, setOrderForm] = useState({
    orderNumber: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerAddress: '',
    deliveryAddress: '',
    prescriptionRequired: false,
    priority: 'normal',
    paymentMethod: 'cash',
    notes: '',
    expectedDelivery: '',
    items: [{ sku: '', name: '', quantity: 1, price: 0, prescription: false }]
  });

  const load = async () => {
    setLoading(true);
    try {
      // Check both 'user' and 'authUser' keys in localStorage
      console.log('All localStorage keys:', Object.keys(localStorage));
      
      const userRaw = localStorage.getItem('user');
      const authRaw = localStorage.getItem('authUser');
      const token = localStorage.getItem('token');
      console.log('User raw:', userRaw);
      console.log('Auth raw:', authRaw);
      console.log('Token:', token);
      
      const auth = userRaw ? JSON.parse(userRaw) : (authRaw ? JSON.parse(authRaw) : null);
      console.log('Auth user structure:', auth);
      
      // Try to get pharmacy ID from different possible locations
      let pharmacyId = auth?._id ||           // Direct user ID
                       auth?.user?._id ||      // Nested user object
                       auth?.user?.id ||       // Alternative nested ID
                       auth?.pharmacyId;       // Direct pharmacy ID
      
      // If no pharmacy ID found in auth, try to decode it from JWT token
      if (!pharmacyId && token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('JWT payload:', payload);
          pharmacyId = payload.userId;
        } catch (error) {
          console.error('Error decoding JWT:', error);
        }
      }
      
      // Final fallback
      if (!pharmacyId) {
        pharmacyId = '68a7441bd3e6a75f76e88955';
      }
      
      console.log('Using pharmacy ID:', pharmacyId);
      
      // Fetch orders for this pharmacy (PatientOrder with populations)
      const data = await pharmacyService.listOrders(pharmacyId);
      console.log('Loaded orders:', data);
      // Ensure data is always an array to prevent filter errors
      const ordersArray = Array.isArray(data) ? data : [];
      console.log(`Successfully loaded ${ordersArray.length} orders for pharmacy ${pharmacyId}`);
      setOrders(ordersArray);
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrders([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    // Prefer updating patient orders endpoint (orders loaded from /orders/patients)
    try {
      await pharmacyService.updatePatientOrderStatus(id, status);
    } catch (e) {
      // fallback to generic pharmacy orders if needed
      try { await pharmacyService.updateOrderStatus(id, status); } catch {}
    }
    load();
  };

  const addItem = () => {
    setOrderForm(prev => ({
      ...prev,
      items: [...prev.items, { sku: '', name: '', quantity: 1, price: 0, prescription: false }]
    }));
  };

  const removeItem = (idx: number) => {
    setOrderForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx)
    }));
  };

  const updateItem = (idx: number, key: string, value: any) => {
    setOrderForm(prev => ({
      ...prev,
      items: prev.items.map((it, i) => i === idx ? { ...it, [key]: value } : it)
    }));
  };

  const updateForm = (key: string, value: any) => {
    setOrderForm(prev => ({ ...prev, [key]: value }));
  };

  const createOrder = async () => {
    setCreating(true);
    try {
      const payload = {
        orderNumber: orderForm.orderNumber,
        customer: { 
          name: orderForm.customerName, 
          phone: orderForm.customerPhone, 
          email: orderForm.customerEmail,
          address: orderForm.customerAddress 
        },
        deliveryAddress: orderForm.deliveryAddress,
        prescriptionRequired: orderForm.prescriptionRequired,
        priority: orderForm.priority,
        paymentMethod: orderForm.paymentMethod,
        notes: orderForm.notes,
        expectedDelivery: orderForm.expectedDelivery,
        items: orderForm.items,
      };
      await pharmacyService.createOrder(payload);
      setOrderForm({
        orderNumber: '',
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        customerAddress: '',
        deliveryAddress: '',
        prescriptionRequired: false,
        priority: 'normal',
        paymentMethod: 'cash',
        notes: '',
        expectedDelivery: '',
        items: [{ sku: '', name: '', quantity: 1, price: 0, prescription: false }]
      });
      setShowCreateDialog(false);
      await load();
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-4 bg-health-light-gray min-h-screen px-2 md:px-6 py-4 w-full">
      {/* Profile Completion Check */}
      <ProfileCompletionCheck />
      
      {/* Header Section */}
      <div className="bg-health-teal rounded-lg p-6 mb-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-white">Pharmacy Orders</h1>
            <p className="text-white/80 mt-2">Manage customer orders, track deliveries, and process prescriptions efficiently</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={load}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              className="bg-white text-health-teal hover:bg-white/90"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Order
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="bg-white border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-health-blue-gray w-4 h-4" />
                <Input
                  placeholder="Search orders by number, customer name, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full lg:w-96"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <FilterIcon className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-40">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Newest First</SelectItem>
                  <SelectItem value="date-asc">Oldest First</SelectItem>
                  <SelectItem value="amount-desc">Highest Amount</SelectItem>
                  <SelectItem value="amount-asc">Lowest Amount</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 bg-white border border-health-light-gray">
          <TabsTrigger value="all" className="data-[state=active]:bg-health-aqua data-[state=active]:text-white">
            All Orders
          </TabsTrigger>
          <TabsTrigger value="pending" className="data-[state=active]:bg-health-aqua data-[state=active]:text-white">
            Pending
          </TabsTrigger>
          <TabsTrigger value="processing" className="data-[state=active]:bg-health-aqua data-[state=active]:text-white">
            Processing
          </TabsTrigger>
          <TabsTrigger value="shipped" className="data-[state=active]:bg-health-aqua data-[state=active]:text-white">
            Shipped
          </TabsTrigger>
          <TabsTrigger value="delivered" className="data-[state=active]:bg-health-aqua data-[state=active]:text-white">
            Delivered
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="data-[state=active]:bg-health-aqua data-[state=active]:text-white">
            Cancelled
          </TabsTrigger>
        </TabsList>

                 <TabsContent value={activeTab} className="space-y-6">
          {/* Orders Table */}
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-health-light-gray/50">
                    <TableHead className="font-semibold text-health-charcoal">Order ID</TableHead>
                    <TableHead className="font-semibold text-health-charcoal">Customer</TableHead>
                    <TableHead className="font-semibold text-health-charcoal">Contact</TableHead>
                    <TableHead className="font-semibold text-health-charcoal">Items</TableHead>
                    <TableHead className="font-semibold text-health-charcoal">Amount</TableHead>
                    <TableHead className="font-semibold text-health-charcoal">Status</TableHead>
                    <TableHead className="font-semibold text-health-charcoal">Date</TableHead>
                    <TableHead className="font-semibold text-health-charcoal">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order._id} className="hover:bg-health-light-gray/30 cursor-pointer" onClick={() => {
                      setSelectedOrder(order);
                      setShowOrderDialog(true);
                    }}>
                      <TableCell className="font-medium text-health-charcoal">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-health-aqua" />
                          {order.orderNumber}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-health-blue-gray" />
                          <span className="font-medium text-health-charcoal">{getCustomerName(order)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-health-blue-gray" />
                          <span className="text-health-blue-gray">{getCustomerContact(order)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-health-blue-gray" />
                          <span className="text-health-blue-gray">{order.items?.length ?? 0} items</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-lg font-bold text-health-charcoal">{formatCurrency(getAmount(order))}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-health-blue-gray">{formatDateTime(getPlacedAt(order))}</span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => { setSelectedOrder(order); setShowOrderDialog(true); }}>
                              <Eye className="w-3 h-3 mr-2" /> View
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="w-3 h-3 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {isOfflineOrder(order) ? (
                              <>
                                <DropdownMenuItem onClick={() => updateStatus(order._id, 'processing')}>
                                  <CheckCircle className="w-3 h-3 mr-2" /> Accept order
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateStatus(order._id, 'cancelled')}>
                                  <Trash2 className="w-3 h-3 mr-2" /> Reject order
                                </DropdownMenuItem>
                              </>
                            ) : (
                              <>
                                <DropdownMenuItem onClick={() => updateStatus(order._id, 'processing')}>
                                  Process
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateStatus(order._id, 'shipped')}>
                                  <Truck className="w-3 h-3 mr-2" /> Ship
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateStatus(order._id, 'delivered')}>
                                  <CheckCircle className="w-3 h-3 mr-2" /> Deliver
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredOrders.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-health-blue-gray mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-health-charcoal mb-2">No orders found</h3>
                  <p className="text-health-blue-gray mb-4">Get started by creating your first order</p>
                  <Button onClick={() => setShowCreateDialog(true)} className="bg-health-aqua hover:bg-health-teal">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Order
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Order Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="w-[95vw] md:w-auto sm:max-w-[95vw] md:max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl text-health-charcoal">
              <Plus className="w-6 h-6 mr-2 text-health-aqua" />
              Create New Order
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-health-charcoal text-lg">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Order Number"
                  value={orderForm.orderNumber}
                  onChange={(e) => updateForm('orderNumber', e.target.value)}
                />
                <Input
                  placeholder="Customer Name"
                  value={orderForm.customerName}
                  onChange={(e) => updateForm('customerName', e.target.value)}
                />
                <Input
                  placeholder="Customer Phone"
                  value={orderForm.customerPhone}
                  onChange={(e) => updateForm('customerPhone', e.target.value)}
                />
                <Input
                  placeholder="Customer Email"
                  value={orderForm.customerEmail}
                  onChange={(e) => updateForm('customerEmail', e.target.value)}
                />
                <Input
                  placeholder="Customer Address"
                  value={orderForm.customerAddress}
                  onChange={(e) => updateForm('customerAddress', e.target.value)}
                />
                <Input
                  placeholder="Delivery Address"
                  value={orderForm.deliveryAddress}
                  onChange={(e) => updateForm('deliveryAddress', e.target.value)}
                />
              </div>
            </div>

            {/* Order Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-health-charcoal text-lg">Order Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select value={orderForm.priority} onValueChange={(value) => updateForm('priority', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Priority</SelectItem>
                    <SelectItem value="normal">Normal Priority</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={orderForm.paymentMethod} onValueChange={(value) => updateForm('paymentMethod', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Payment Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Expected Delivery Date"
                  type="date"
                  value={orderForm.expectedDelivery}
                  onChange={(e) => updateForm('expectedDelivery', e.target.value)}
                />
              </div>
              <Textarea
                placeholder="Order Notes"
                value={orderForm.notes}
                onChange={(e) => updateForm('notes', e.target.value)}
                rows={3}
              />
            </div>

            {/* Order Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-health-charcoal text-lg">Order Items</h3>
                <Button size="sm" variant="outline" onClick={addItem}>
                  <Plus className="w-3 h-3 mr-1" />
                  Add Item
                </Button>
              </div>
              <div className="space-y-3">
                {orderForm.items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-center p-3 border border-health-light-gray rounded-lg">
                    <Input
                      placeholder="SKU"
                      value={item.sku}
                      onChange={(e) => updateItem(idx, 'sku', e.target.value)}
                    />
                    <Input
                      placeholder="Medicine Name"
                      value={item.name}
                      onChange={(e) => updateItem(idx, 'name', e.target.value)}
                    />
                    <Input
                      placeholder="Qty"
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value) || 0)}
                    />
                    <Input
                      placeholder="Price"
                      type="number"
                      value={item.price}
                      onChange={(e) => updateItem(idx, 'price', parseFloat(e.target.value) || 0)}
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={item.prescription}
                        onChange={(e) => updateItem(idx, 'prescription', e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span className="text-xs text-health-blue-gray">Prescription</span>
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => removeItem(idx)}
                      className="w-8 h-8"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4 border-t border-health-light-gray">
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-health-aqua hover:bg-health-teal"
                onClick={createOrder}
                disabled={creating}
              >
                {creating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Create Order
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Order Detail Dialog */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="w-[95vw] md:w-auto sm:max-w-[95vw] md:max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl text-health-charcoal">
              <Package className="w-6 h-6 mr-2 text-health-aqua" />
              Order Details - {selectedOrder?.orderNumber}
            </DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-health-light-gray/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-health-blue-gray mb-1">Order Status</p>
                  <Badge className={`text-sm ${
                    selectedOrder.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    selectedOrder.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    selectedOrder.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                    selectedOrder.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedOrder.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-health-blue-gray mb-1">Total Amount</p>
                  <p className="text-lg font-bold text-health-charcoal">{formatCurrency(getAmount(selectedOrder))}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-health-blue-gray mb-1">Order Date</p>
                  <p className="text-sm text-health-charcoal">{formatDateTime(selectedOrder.placedAt)}</p>
                </div>
              </div>

              {/* Customer Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-health-charcoal text-lg">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-health-blue-gray mb-1">Name</p>
                    <p className="text-sm text-health-charcoal">{getCustomerName(selectedOrder)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-health-blue-gray mb-1">Phone</p>
                    <p className="text-sm text-health-charcoal">{getCustomerContact(selectedOrder)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-health-blue-gray mb-1">Email</p>
                    <p className="text-sm text-health-charcoal">{getPatientEmail(selectedOrder)}</p>
                  </div>
                </div>
              </div>

              {/* Delivery Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-health-charcoal text-lg">Delivery Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-health-blue-gray mb-1">Option</p>
                    <p className="text-sm text-health-charcoal">{getDeliveryOption(selectedOrder)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-health-blue-gray mb-1">Slot</p>
                    <p className="text-sm text-health-charcoal">{getDeliverySlot(selectedOrder)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-health-blue-gray mb-1">Address</p>
                    <p className="text-sm text-health-charcoal">{getDeliveryAddress(selectedOrder)}</p>
                  </div>
                </div>
                {selectedOrder.deliveryDetails?.instructions && (
                  <div>
                    <p className="text-sm font-medium text-health-blue-gray mb-1">Instructions</p>
                    <p className="text-sm text-health-charcoal">{selectedOrder.deliveryDetails?.instructions}</p>
                  </div>
                )}
              </div>

              {/* Payment Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-health-charcoal text-lg">Payment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-health-blue-gray mb-1">Method</p>
                    <p className="text-sm text-health-charcoal">{getPaymentMethod(selectedOrder)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-health-blue-gray mb-1">Status</p>
                    <p className="text-sm text-health-charcoal">{getPaymentStatus(selectedOrder)}</p>
                  </div>
                  {selectedOrder.paymentDetails?.transactionId && (
                    <div>
                      <p className="text-sm font-medium text-health-blue-gray mb-1">Transaction ID</p>
                      <p className="text-sm text-health-charcoal">{selectedOrder.paymentDetails?.transactionId}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-4">
                <h3 className="font-semibold text-health-charcoal text-lg">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 border border-health-light-gray rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-health-charcoal">{getItemMedicineName(item)}</p>
                        <p className="text-xs text-health-blue-gray">Variant: {item.variant || '—'}</p>
                        {item.medicineId?.manufacturer && (
                          <p className="text-xs text-health-blue-gray">Manufacturer: {item.medicineId.manufacturer}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-health-charcoal">Qty: {item.quantity}</p>
                        <p className="text-sm text-health-charcoal">Unit: {formatCurrency(getItemUnitPrice(item))}</p>
                        <p className="text-sm font-semibold text-health-charcoal">Total: {formatCurrency(getItemTotalPrice(item))}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-2 p-4 bg-white border border-health-light-gray rounded-lg">
                <h3 className="font-semibold text-health-charcoal text-lg mb-2">Cost Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between"><span className="text-health-blue-gray">Subtotal</span><span className="font-medium">{formatCurrency(selectedOrder.pricing?.subtotal)}</span></div>
                  <div className="flex justify-between"><span className="text-health-blue-gray">Delivery Fee</span><span className="font-medium">{formatCurrency(selectedOrder.pricing?.deliveryFee)}</span></div>
                  <div className="flex justify-between"><span className="text-health-blue-gray">Discount</span><span className="font-medium">{formatCurrency(selectedOrder.pricing?.discount)}</span></div>
                  <div className="flex justify-between"><span className="text-health-blue-gray">Tax</span><span className="font-medium">{formatCurrency(selectedOrder.pricing?.tax)}</span></div>
                </div>
                <div className="flex justify-between pt-3 border-t mt-3"><span className="text-health-charcoal font-semibold">Grand Total</span><span className="text-health-charcoal font-bold">{formatCurrency(selectedOrder.pricing?.grandTotal)}</span></div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-health-light-gray">
                <Button variant="outline" className="flex-1" onClick={async () => {
                  if (!selectedOrder?._id) return;
                  try {
                    const blob = await pharmacyService.downloadOrderPdf(selectedOrder._id);
                    const url = window.URL.createObjectURL(blob);
                    const w = window.open(url);
                    if (!w) {
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${selectedOrder.orderNumber || 'order'}.pdf`;
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                    }
                  } catch (e) {
                    console.error('Print order failed', e);
                  }
                }}>
                  <Printer className="w-4 h-4 mr-2" />
                  Print Order
                </Button>
                <Button variant="outline" className="flex-1" onClick={async () => {
                  if (!selectedOrder?._id) return;
                  try {
                    await pharmacyService.sendOrderSms(selectedOrder._id);
                  } catch (e) {
                    console.error('Send SMS failed', e);
                  }
                }}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send SMS
                </Button>
                <Button variant="outline" className="flex-1" onClick={async () => {
                  if (!selectedOrder?._id) return;
                  try {
                    const blob = await pharmacyService.downloadOrderPdf(selectedOrder._id);
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${selectedOrder.orderNumber || 'order'}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                  } catch (e) {
                    console.error('Export PDF failed', e);
                  }
                }}>
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;


