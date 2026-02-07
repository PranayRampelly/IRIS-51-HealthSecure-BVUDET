import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Pill, Search, BarChart3, FileText, ShoppingCart, Clock,
  Truck, CheckCircle, XCircle, AlertTriangle, Star, DollarSign,
  Package, Calendar, User, MapPin, Phone, MessageSquare, Tag, 
  TrendingUp, Store, ShieldCheck, Heart, Brain, Zap, Target,
  Plus, ArrowRight, RefreshCw, Filter, SortAsc, SortDesc,
  Eye, Edit, Trash2, Download, Share2, Bell, Settings,
  Home, Users2, Activity, TrendingDown, ArrowUpRight
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ProfileCompletionCheck from '@/components/pharmacy/ProfileCompletionCheck';
import pharmacyService from '@/services/pharmacyService';

const PharmacyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [showMedicineDialog, setShowMedicineDialog] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [inventory, setInventory] = useState<any[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);

  // Load dashboard data from backend
  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await pharmacyService.getDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      // Fallback to empty state if API fails
      setDashboardData({
        metrics: {
          totalOrdersToday: 0,
          pendingOrders: 0,
          prescriptionsQueued: 0,
          revenueToday: 0,
          totalCustomers: 0,
          averageOrderValue: 0,
          deliverySuccessRate: 98.5,
          customerSatisfaction: 4.7
        },
        recentOrders: [],
        prescriptions: [],
        lowStock: [],
        deliveries: []
      });
    } finally {
      setLoading(false);
    }
  };

  // Load inventory data
  const loadInventory = async () => {
    try {
      setInventoryLoading(true);
      const data = await pharmacyService.listInventory();
      setInventory(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load inventory:', error);
      setInventory([]);
    } finally {
      setInventoryLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    loadInventory();

    // Auto-refresh dashboard every 30 seconds
    const refreshInterval = setInterval(() => {
      loadDashboard();
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, []);

  // Reload inventory when switching to inventory tab
  useEffect(() => {
    if (activeTab === 'inventory' && inventory.length === 0 && !inventoryLoading) {
      loadInventory();
    }
  }, [activeTab]);

  // Use real data or fallback to empty state
  const metrics = dashboardData?.metrics || {
    totalOrdersToday: 0,
    pendingOrders: 0,
    prescriptionsQueued: 0,
    revenueToday: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    deliverySuccessRate: 98.5,
    customerSatisfaction: 4.7
  };

  const recentOrders = dashboardData?.recentOrders || [];
  const prescriptions = dashboardData?.prescriptions || [];
  const lowStock = dashboardData?.lowStock || [];

  // Filter and transform inventory data to match the medicines format
  const filteredInventory = inventory.filter((item) => {
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        item.name?.toLowerCase().includes(query) ||
        item.generic?.toLowerCase().includes(query) ||
        item.manufacturer?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }
    
    // Filter by category
    if (selectedCategory && selectedCategory !== 'all') {
      if (item.category?.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
    }
    
    return true;
  });

  // Sort inventory
  let sortedInventory = [...filteredInventory];
  switch (sortBy) {
    case 'price-low':
      sortedInventory.sort((a, b) => (a.price || 0) - (b.price || 0));
      break;
    case 'price-high':
      sortedInventory.sort((a, b) => (b.price || 0) - (a.price || 0));
      break;
    case 'rating':
      sortedInventory.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    default:
      // Keep original order
      break;
  }

  // Transform inventory data to match the medicines format
  const medicines = sortedInventory.map((item) => ({
    id: item._id || item.id,
    name: item.name,
    generic: item.generic || item.name,
    dosage: item.dosage || '',
    form: item.form || '',
    manufacturer: item.manufacturer || '',
    description: item.description || '',
    price: {
      generic: item.genericPrice || item.price || 0,
      brand: item.brandPrice || item.price || 0,
      savings: (item.brandPrice || item.price || 0) - (item.genericPrice || item.price || 0)
    },
    availability: {
      inStock: (item.stock || 0) > 0,
      quantity: item.stock || 0,
      deliveryTime: item.deliveryTime || '1-2 days'
    },
    rating: item.rating || 0,
    reviews: item.reviews || 0,
    category: item.category || 'General',
    prescriptionRequired: item.prescriptionRequired || false,
    cloudinaryUrl: item.cloudinaryUrl
  }));

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'antibiotics', label: 'Antibiotics' },
    { value: 'pain-relief', label: 'Pain Relief' },
    { value: 'vitamins', label: 'Vitamins & Supplements' },
    { value: 'diabetes', label: 'Diabetes Care' },
    { value: 'cardiac', label: 'Cardiac Care' },
    { value: 'respiratory', label: 'Respiratory Care' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-yellow-100 text-yellow-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleMedicineClick = (medicine: any) => {
    setSelectedMedicine(medicine);
    setShowMedicineDialog(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-health-light-gray flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-health-teal mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-health-light-gray min-h-screen px-2 md:px-6 py-4 w-full">
      {/* Profile Completion Check */}
      <ProfileCompletionCheck />
      
      {/* Header Section */}
      <div className="bg-health-teal rounded-lg p-6 mb-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-white">Pharmacy Dashboard</h1>
            <p className="text-white/80 mt-2">Manage your pharmacy operations, track orders, and serve patients efficiently</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={() => navigate('/pharmacy/inventory')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Medicine
            </Button>
            <Button
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={() => navigate('/pharmacy/reports')}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
            <Button
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={async () => {
                await Promise.all([loadDashboard(), loadInventory()]);
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button 
              className="bg-white text-health-teal hover:bg-white/90"
              onClick={() => navigate('/pharmacy/orders')}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              New Order
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-health-blue-gray">Orders Today</p>
                <p className="text-2xl font-bold text-health-charcoal">{metrics.totalOrdersToday}</p>
                <p className="text-xs text-health-blue-gray mt-1">Real-time data</p>
              </div>
              <div className="p-3 bg-health-aqua/10 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-health-aqua" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-health-blue-gray">Revenue Today</p>
                <p className="text-2xl font-bold text-health-charcoal">₹{metrics.revenueToday.toLocaleString()}</p>
                <p className="text-xs text-health-blue-gray mt-1">Real-time data</p>
              </div>
              <div className="p-3 bg-chart-green/10 rounded-lg">
                <DollarSign className="h-6 w-6 text-chart-green" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-health-blue-gray">Pending Orders</p>
                <p className="text-2xl font-bold text-health-charcoal">{metrics.pendingOrders}</p>
                <p className="text-xs text-health-blue-gray mt-1">Require attention</p>
              </div>
              <div className="p-3 bg-chart-orange/10 rounded-lg">
                <Clock className="h-6 w-6 text-chart-orange" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-health-blue-gray">Customer Satisfaction</p>
                <p className="text-2xl font-bold text-health-charcoal">{metrics.customerSatisfaction}/5</p>
                <p className="text-xs text-health-blue-gray mt-1">Based on {metrics.totalCustomers || 0} customers</p>
              </div>
              <div className="p-3 bg-chart-purple/10 rounded-lg">
                <Star className="h-6 w-6 text-chart-purple" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-white border border-health-light-gray">
          <TabsTrigger value="overview" className="data-[state=active]:bg-health-aqua data-[state=active]:text-white">
            Overview
          </TabsTrigger>
          <TabsTrigger value="orders" className="data-[state=active]:bg-health-aqua data-[state=active]:text-white">
            Orders
          </TabsTrigger>
          <TabsTrigger value="prescriptions" className="data-[state=active]:bg-health-aqua data-[state=active]:text-white">
            Prescriptions
          </TabsTrigger>
          <TabsTrigger value="inventory" className="data-[state=active]:bg-health-aqua data-[state=active]:text-white">
            Inventory
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-health-aqua data-[state=active]:text-white">
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Quick Actions */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg text-health-charcoal">
                <Zap className="w-5 h-5 mr-2 text-health-aqua" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2 border-health-aqua/20 hover:bg-health-aqua/5"
                  onClick={() => navigate('/pharmacy/inventory')}
                >
                  <Package className="w-6 h-6 text-health-aqua" />
                  <span className="text-sm font-medium">Manage Inventory</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2 border-chart-blue/20 hover:bg-chart-blue/5"
                  onClick={() => navigate('/pharmacy/prescriptions')}
                >
                  <FileText className="w-6 h-6 text-chart-blue" />
                  <span className="text-sm font-medium">Process Prescriptions</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2 border-chart-green/20 hover:bg-chart-green/5"
                  onClick={() => navigate('/pharmacy/customers')}
                >
                  <Users2 className="w-6 h-6 text-chart-green" />
                  <span className="text-sm font-medium">Customer Management</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Low Stock Alert */}
          {lowStock.length > 0 && (
            <Card className="bg-white border-0 shadow-sm border-l-4 border-chart-orange">
              <CardHeader>
                <CardTitle className="flex items-center text-lg text-health-charcoal">
                  <AlertTriangle className="w-5 h-5 mr-2 text-chart-orange" />
                  Low Stock Alert
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {lowStock.slice(0, 6).map((item) => (
                    <div key={item.id} className="p-3 border border-chart-orange/20 rounded-lg bg-chart-orange/5">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-health-charcoal">{item.name}</p>
                          <p className="text-xs text-health-blue-gray">SKU: {item.sku}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-chart-orange">{item.stock} left</p>
                          <p className="text-xs text-health-blue-gray">Threshold: {item.threshold}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {lowStock.length > 6 && (
                  <Button
                    variant="outline"
                    className="w-full mt-4 border-chart-orange/20 text-chart-orange hover:bg-chart-orange/5"
                    onClick={() => navigate('/pharmacy/inventory')}
                  >
                    View All Low Stock Items ({lowStock.length})
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
            <CardTitle className="flex items-center text-lg text-health-charcoal">
                  <Activity className="w-5 h-5 mr-2 text-health-aqua" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentOrders.length > 0 ? recentOrders.map((order) => (
                  <div key={order.id} className="p-3 border border-health-light-gray rounded-lg hover:bg-health-light-gray/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-health-charcoal">{order.orderNumber}</span>
                          <Badge className={`text-xs ${getStatusColor(order.status)}`}>
                      {order.status}
                    </Badge>
                  </div>
                        <p className="text-xs text-health-blue-gray">
                          {order.items} items • {order.orderDate || (order.placedAt ? new Date(order.placedAt).toLocaleDateString() : 'N/A')}
                        </p>
                        <p className="text-xs text-health-blue-gray">
                          {order.customer} • {order.deliveryAddress || 'No address'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-health-charcoal">₹{order.total}</p>
                        <Badge className={`text-xs mt-1 ${getPaymentStatusColor(order.paymentStatus)}`}>
                          {order.paymentStatus}
                        </Badge>
                      </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No recent orders found</p>
              </div>
            )}
                <Button
                  variant="outline"
                  className="w-full border-health-aqua/20 text-health-aqua hover:bg-health-aqua/5"
                  onClick={() => navigate('/pharmacy/orders')}
                >
              View All Orders
                  <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
            <CardTitle className="flex items-center text-lg text-health-charcoal">
                  <Pill className="w-5 h-5 mr-2 text-chart-purple" />
              Prescription Queue
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
                {prescriptions.length > 0 ? prescriptions.map((prescription) => (
                  <div key={prescription.id} className="p-3 border border-health-light-gray rounded-lg hover:bg-health-light-gray/50 transition-colors">
                <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-health-charcoal">{prescription.medicine}</p>
                        <p className="text-xs text-health-blue-gray">
                          {prescription.patientName} • {prescription.doctorName}
                        </p>
                        <p className="text-xs text-health-blue-gray">
                          {prescription.dosage} • {prescription.frequency}
                        </p>
                </div>
                      <Badge className="bg-health-warning text-white text-xs">
                        {prescription.status}
                      </Badge>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <Pill className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No prescriptions in queue</p>
              </div>
            )}
                <Button
                  variant="outline"
                  className="w-full border-chart-purple/20 text-chart-purple hover:bg-chart-purple/5"
                  onClick={() => navigate('/pharmacy/prescriptions')}
                >
                  Process All
                  <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
            <CardTitle className="flex items-center text-lg text-health-charcoal">
                <ShoppingCart className="w-5 h-5 mr-2 text-health-aqua" />
                Order Management
            </CardTitle>
          </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="p-4 border border-health-light-gray rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="font-semibold text-health-charcoal text-lg">{order.orderNumber}</span>
                          <Badge className={`text-sm ${getStatusColor(order.status)}`}>
                            {order.status}
                          </Badge>
                          <Badge className={`text-sm ${getPaymentStatusColor(order.paymentStatus)}`}>
                            {order.paymentStatus}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-sm font-medium text-health-charcoal mb-1">Order Details</p>
                            <p className="text-xs text-health-blue-gray">Date: {order.orderDate}</p>
                            <p className="text-xs text-health-blue-gray">Delivery: {order.estimatedDelivery}</p>
                            {order.trackingNumber && (
                              <p className="text-xs text-health-blue-gray">Tracking: {order.trackingNumber}</p>
                            )}
                          </div>
                <div>
                            <p className="text-sm font-medium text-health-charcoal mb-1">Delivery Address</p>
                            <p className="text-xs text-health-blue-gray">{order.deliveryAddress}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium text-health-charcoal">Medicines:</p>
                          {order.medicines.map((medicine, index) => (
                            <div key={index} className="flex items-center gap-3 p-2 bg-health-light-gray/50 rounded">
                              <div className="w-8 h-8 bg-health-aqua/20 rounded flex items-center justify-center">
                                <Pill className="w-4 h-4 text-health-aqua" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-health-charcoal">{medicine.name}</p>
                                <p className="text-xs text-health-blue-gray">Qty: {medicine.quantity}</p>
                              </div>
                              <p className="text-sm font-semibold text-health-charcoal">₹{medicine.price}</p>
                            </div>
                          ))}
                </div>
                  </div>
                      
                      <div className="text-right ml-4">
                        <p className="text-2xl font-bold text-health-charcoal mb-2">₹{order.totalAmount}</p>
                        <div className="space-y-2">
                          <Button size="sm" variant="outline" className="w-full">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline" className="w-full">
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                  </Button>
                        </div>
                      </div>
                </div>
              </div>
            ))}
              </div>
          </CardContent>
        </Card>
        </TabsContent>

        {/* Prescriptions Tab */}
        <TabsContent value="prescriptions" className="space-y-6">
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
            <CardTitle className="flex items-center text-lg text-health-charcoal">
                <FileText className="w-5 h-5 mr-2 text-chart-purple" />
                Prescription Management
            </CardTitle>
          </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {prescriptions.map((prescription) => (
                  <div key={prescription.id} className="p-4 border border-health-light-gray rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="font-semibold text-health-charcoal text-lg">{prescription.medicine}</span>
                          <Badge className={`text-sm ${
                            prescription.status === 'active' ? 'bg-green-100 text-green-800' : 
                            prescription.status === 'expired' ? 'bg-red-100 text-red-800' : 
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {prescription.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-sm font-medium text-health-charcoal mb-1">Prescription Details</p>
                            <p className="text-xs text-health-blue-gray">Dosage: {prescription.dosage}</p>
                            <p className="text-xs text-health-blue-gray">Frequency: {prescription.frequency}</p>
                            {prescription.duration && (
                              <p className="text-xs text-health-blue-gray">Duration: {prescription.duration}</p>
                            )}
                            {prescription.refills !== undefined && (
                              <p className="text-xs text-health-blue-gray">Refills: {prescription.refills}</p>
                            )}
                          </div>
                <div>
                            <p className="text-sm font-medium text-health-charcoal mb-1">Patient & Doctor</p>
                            <p className="text-xs text-health-blue-gray">Patient: {prescription.patientName}</p>
                            <p className="text-xs text-health-blue-gray">Doctor: {prescription.doctorName}</p>
                            <p className="text-xs text-health-blue-gray">
                              Date: {prescription.prescribedDate 
                                ? (typeof prescription.prescribedDate === 'string' 
                                  ? new Date(prescription.prescribedDate).toLocaleDateString()
                                  : new Date(prescription.prescribedDate).toLocaleDateString())
                                : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right ml-4">
                        <div className="space-y-2">
                          <Button size="sm" variant="outline" className="w-full">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button size="sm" className="w-full bg-health-aqua hover:bg-health-teal">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Process
                          </Button>
                        </div>
                      </div>
                </div>
              </div>
            ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-6">
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                <CardTitle className="flex items-center text-lg text-health-charcoal">
                  <Package className="w-5 h-5 mr-2 text-chart-blue" />
                  Inventory Management
                </CardTitle>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search medicines..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64"
                  />
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {inventoryLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-health-teal mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading inventory...</p>
                </div>
              ) : medicines.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No inventory items found</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => navigate('/pharmacy/inventory')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Medicine
                  </Button>
                </div>
              ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {medicines.map((medicine) => (
                  <div
                    key={medicine.id}
                    className="p-4 border border-health-light-gray rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleMedicineClick(medicine)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-health-charcoal mb-1">{medicine.name}</h3>
                        <p className="text-xs text-health-blue-gray mb-2">{medicine.generic}</p>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="text-xs bg-health-aqua/10 text-health-aqua">
                            {medicine.category}
                          </Badge>
                          {medicine.prescriptionRequired && (
                            <Badge className="text-xs bg-chart-orange/10 text-chart-orange">
                              Prescription Required
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{medicine.rating}</span>
                          <span className="text-xs text-health-blue-gray">({medicine.reviews})</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-health-blue-gray">Generic:</span>
                        <span className="font-medium">₹{medicine.price.generic}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-health-blue-gray">Brand:</span>
                        <span className="font-medium">₹{medicine.price.brand}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-health-blue-gray">Savings:</span>
                        <span className="font-medium text-green-600">₹{medicine.price.savings}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-health-light-gray">
                      <div className="flex items-center justify-between text-xs text-health-blue-gray mb-2">
                        <span>Stock: {medicine.availability.quantity}</span>
                        <span>Delivery: {medicine.availability.deliveryTime}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-health-blue-gray">{medicine.form} • {medicine.dosage}</span>
                        <Button size="sm" variant="outline" className="text-xs">
                          <Plus className="w-3 h-3 mr-1" />
                          Add to Order
            </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-lg text-health-charcoal">
                  <TrendingUp className="w-5 h-5 mr-2 text-chart-green" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-health-blue-gray">Delivery Success Rate</span>
                    <span className="text-sm font-medium text-health-charcoal">{metrics.deliverySuccessRate}%</span>
                  </div>
                  <Progress value={metrics.deliverySuccessRate} className="h-2" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-health-blue-gray">Customer Satisfaction</span>
                    <span className="text-sm font-medium text-health-charcoal">{metrics.customerSatisfaction}/5</span>
                  </div>
                  <Progress value={metrics.customerSatisfaction * 20} className="h-2" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-health-blue-gray">Average Order Value</span>
                    <span className="text-sm font-medium text-health-charcoal">₹{metrics.averageOrderValue}</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-lg text-health-charcoal">
                  <BarChart3 className="w-5 h-5 mr-2 text-chart-blue" />
                  Revenue Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-green-800">Today's Revenue</p>
                      <p className="text-2xl font-bold text-green-900">₹{metrics.revenueToday.toLocaleString()}</p>
                    </div>
                    <ArrowUpRight className="w-8 h-8 text-green-600" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">Total Customers</p>
                      <p className="text-xl font-bold text-blue-900">{metrics.totalCustomers}</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <p className="text-sm text-purple-800">Pending Orders</p>
                      <p className="text-xl font-bold text-purple-900">{metrics.pendingOrders}</p>
                    </div>
                  </div>
                </div>
          </CardContent>
        </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Medicine Detail Dialog */}
      <Dialog open={showMedicineDialog} onOpenChange={setShowMedicineDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl text-health-charcoal">
              <Pill className="w-6 h-6 mr-2 text-health-aqua" />
              {selectedMedicine?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedMedicine && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-health-charcoal mb-2">Medicine Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-health-blue-gray">Generic Name:</span>
                      <span className="font-medium">{selectedMedicine.generic}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-health-blue-gray">Dosage:</span>
                      <span className="font-medium">{selectedMedicine.dosage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-health-blue-gray">Form:</span>
                      <span className="font-medium">{selectedMedicine.form}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-health-blue-gray">Manufacturer:</span>
                      <span className="font-medium">{selectedMedicine.manufacturer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-health-blue-gray">Category:</span>
                      <span className="font-medium">{selectedMedicine.category}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-health-charcoal mb-2">Pricing</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-health-blue-gray">Generic Price:</span>
                      <span className="font-medium">₹{selectedMedicine.price.generic}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-health-blue-gray">Brand Price:</span>
                      <span className="font-medium">₹{selectedMedicine.price.brand}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-health-blue-gray">Savings:</span>
                      <span className="font-medium text-green-600">₹{selectedMedicine.price.savings}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-health-light-gray/50 rounded">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-medium">{selectedMedicine.rating}/5</span>
                      <span className="text-health-blue-gray">({selectedMedicine.reviews} reviews)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600">In Stock ({selectedMedicine.availability.quantity})</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-health-charcoal mb-2">Description</h3>
                <p className="text-sm text-health-blue-gray">{selectedMedicine.description}</p>
      </div>

              <div className="flex gap-3 pt-4 border-t border-health-light-gray">
                <Button className="flex-1 bg-health-aqua hover:bg-health-teal">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Order
                </Button>
                <Button variant="outline" className="w-full">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Medicine
                </Button>
              </div>
            </div>
           )} 
        </DialogContent>
      </Dialog>
    </div> 
  );
};

export default PharmacyDashboard;
