import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Pill, Search, BarChart3, FileText, ShoppingCart, Clock,
  Truck, CheckCircle, XCircle, AlertCircle, Star, DollarSign,
  Package, Calendar, User, MapPin, Phone, MessageSquare, Tag, TrendingUp, Store, ShieldCheck
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Progress } from '@/components/ui/progress';
import patientPharmacyService, { 
  Medicine, 
  Prescription, 
  Order, 
  CartItem, 
  PriceComparison as PriceComparisonData,
  PatientAnalytics 
} from '@/services/patientPharmacyService';

// Using interfaces from patientPharmacyService

const PharmacyServices = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [analytics, setAnalytics] = useState<PatientAnalytics | null>(null);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showMedicineDialog, setShowMedicineDialog] = useState(false);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [selectedForm, setSelectedForm] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [timeRange, setTimeRange] = useState<'30'|'90'|'365'|'all'>('90');

  // Real data will be fetched from backend

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all data in parallel
      const [medicinesData, prescriptionsData, ordersData, cartData, analyticsData] = await Promise.all([
        patientPharmacyService.searchMedicines({ limit: 100 }),
        patientPharmacyService.getPrescriptions(),
        patientPharmacyService.getOrders(),
        patientPharmacyService.getCart(),
        patientPharmacyService.getAnalytics(timeRange === 'all' ? '365' : timeRange)
      ]);
      
      setMedicines(medicinesData);
      setPrescriptions(prescriptionsData);
      setOrders(ordersData);
      setCartItems(cartData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (n: number) => `$${n.toFixed(2)}`;
  const availableForms = Array.from(new Set(medicines.filter(m => m && m.form).map(m => m.form)));
  const filteredMedicines = medicines
    .filter(medicine => medicine && medicine.name && medicine.generic)
    .filter(medicine =>
    medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    medicine.generic.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(medicine => (inStockOnly ? medicine.stock > 0 : true))
    .filter(medicine => (selectedForm !== 'all' ? medicine.form === selectedForm : true))
    .sort((a, b) => {
      switch (sortBy) {
        case 'price': return (a.genericPrice || 0) - (b.genericPrice || 0);
        case 'rating': return (b.rating || 0) - (a.rating || 0);
        case 'savings': return ((b.brandPrice || 0) - (b.genericPrice || 0)) - ((a.brandPrice || 0) - (a.genericPrice || 0));
        default: return 0;
      }
    });

  // Derived analytics
  const monthlySpendSeries = [120, 180, 160, 240, 200, 260, 210, 280, 230, 300, 260, 320];
  const monthlySavingsSeries = [20, 35, 28, 40, 32, 45, 38, 52, 41, 60, 49, 65];
  const refillDueSoon = prescriptions.filter(p => p && p.status === 'active' && typeof p.refills === 'number' && p.refills <= 1);
  const genericAdoptionRate = Math.round((medicines.filter(m => m && typeof m.brandPrice === 'number' && typeof m.genericPrice === 'number' && (m.brandPrice - m.genericPrice) > 0).length / Math.max(1, medicines.length)) * 100);
  const openOrdersCount = orders.filter(o => o && o.status && ['processing','confirmed','shipped'].includes(o.status)).length;
  const totalSpend = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const avgBasketSize = orders.length ? (orders.reduce((s,o)=>s+(o.items?.length || 0),0) / orders.length).toFixed(1) : '0.0';

  const getCategoryForName = (name: string): string => {
    const lower = name.toLowerCase();
    if (lower.includes('amoxicillin')) return 'Antibiotics';
    if (lower.includes('ibuprofen')) return 'Pain Relief';
    if (lower.includes('vitamin d')) return 'Supplements';
    return 'Other';
  };

  const spendByCategory = (() => {
    const map: Record<string, number> = {};
    orders.forEach(o => {
      if (o.items && Array.isArray(o.items)) {
        o.items.forEach(m => {
          if (m && m.medicineName && typeof m.price === 'number' && typeof m.quantity === 'number') {
            const cat = getCategoryForName(m.medicineName);
            map[cat] = (map[cat] || 0) + m.price * m.quantity;
          }
        });
      }
    });
    return Object.entries(map).sort((a,b)=>b[1]-a[1]);
  })();

  const pharmacyLeaderboard = (() => {
    const map: Record<string, {orders: number; spend: number}> = {};
    orders.forEach(o => {
      if (o.pharmacy && o.pharmacy.name) {
        const key = o.pharmacy.name;
        if (!map[key]) map[key] = { orders: 0, spend: 0 };
        map[key].orders += 1;
        map[key].spend += o.totalAmount;
      }
    });
    return Object.entries(map)
      .map(([name, v]) => ({ name, ...v }))
      .sort((a,b)=>b.spend - a.spend)
      .slice(0,5);
  })();

  const deliveryStats = (() => {
    const statuses = ['processing','confirmed','shipped','delivered','cancelled'] as const;
    const counts: Record<string, number> = {};
    statuses.forEach(s => counts[s] = 0);
    orders.forEach(o => {
      if (o && o.status) {
        counts[o.status] = (counts[o.status] || 0) + 1;
      }
    });
    const total = orders.length || 1;
    const deliveredPct = Math.round(((counts['delivered'] || 0) / total) * 100);
    return { counts, deliveredPct };
  })();

  const adherencePct = (() => {
    const active = prescriptions.filter(p => p.status === 'active');
    if (active.length === 0) return 0;
    const onTrack = active.filter(p => p.refills > 0).length;
    return Math.round((onTrack / active.length) * 100);
  })();

  const getStatusColor = (status: string) => {
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
  };

  const getOrderStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Clock className="h-4 w-4" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const handleOrderRefill = (prescriptionId: string) => {
    // Handle prescription refill
    console.log('Ordering refill for prescription:', prescriptionId);
  };

  const handleTrackOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDialog(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-health-teal"></div>
          <p className="mt-4 text-gray-600">Loading pharmacy services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error loading pharmacy services</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchData}>Retry</Button>
        </div>
      </div>
    );
  }

  // Ensure we have data before rendering
  if (!medicines || !prescriptions || !orders) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-gray-600 text-xl mb-4">No data available</div>
          <Button onClick={fetchData}>Refresh</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-2 md:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-900 via-teal-800 to-teal-700">
              <div className="p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-white">Pharmacy Services</h1>
                    <p className="text-teal-100 mt-2">Search medicines, compare prices, and manage your prescriptions efficiently.</p>
                    <div className="mt-4 flex space-x-3">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                        onClick={() => window.location.href = '/patient/pharmacy/search'}
                      >
                        <Search className="h-4 w-4 mr-2" />
                        Search Medicines
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                        onClick={() => window.location.href = '/patient/pharmacy/price-comparison'}
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Price Comparison
                      </Button>
                    </div>
                  </div>
                  <div className="hidden md:grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-white/40 bg-white/90 backdrop-blur p-3 min-w-[200px] flex items-center gap-3 shadow-sm">
                      <div className="h-9 w-9 rounded-full bg-blue-50 ring-1 ring-blue-100 flex items-center justify-center">
                        <Pill className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Medicines</div>
                        <div className="text-xl font-semibold">{medicines.length}</div>
                      </div>
                    </div>
                    <div className="rounded-lg border border-white/40 bg-white/90 backdrop-blur p-3 min-w-[200px] flex items-center gap-3 shadow-sm">
                      <div className="h-9 w-9 rounded-full bg-purple-50 ring-1 ring-purple-100 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Active Prescriptions</div>
                        <div className="text-xl font-semibold">{prescriptions.filter(p=>p.status==='active').length}</div>
                      </div>
                    </div>
                    <div className="rounded-lg border border-white/40 bg-white/90 backdrop-blur p-3 min-w-[200px] flex items-center gap-3 shadow-sm">
                      <div className="h-9 w-9 rounded-full bg-orange-50 ring-1 ring-orange-100 flex items-center justify-center">
                        <Package className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Open Orders</div>
                        <div className="text-xl font-semibold">{openOrdersCount}</div>
                      </div>
                    </div>
                    <div className="rounded-lg border border-white/40 bg-white/90 backdrop-blur p-3 min-w-[200px] flex items-center gap-3 shadow-sm">
                      <div className="h-9 w-9 rounded-full bg-green-50 ring-1 ring-green-100 flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Avg. Savings</div>
                                                 <div className="text-xl font-semibold text-green-600">{formatCurrency(Math.max(0, medicines.reduce((s,m)=>s+(m.brandPrice - m.genericPrice),0)/(medicines.length||1)))}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => window.location.href = '/patient/pharmacy/search'}
          >
            <CardContent className="p-4 text-center">
              <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-blue-50 ring-1 ring-blue-100 flex items-center justify-center">
                <Search className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Search Medicines</h3>
              <p className="text-sm text-gray-600">Find medicines by name</p>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => window.location.href = '/patient/pharmacy/price-comparison'}
          >
            <CardContent className="p-4 text-center">
              <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-green-50 ring-1 ring-green-100 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Price Comparison</h3>
              <p className="text-sm text-gray-600">Compare medicine prices</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-purple-50 ring-1 ring-purple-100 flex items-center justify-center">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">My Prescriptions</h3>
              <p className="text-sm text-gray-600">View prescription history</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-orange-50 ring-1 ring-orange-100 flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Order Medicines</h3>
              <p className="text-sm text-gray-600">Place medicine orders</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Time range controls */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-white/80 md:text-gray-600">Analytics are derived from your recent orders and prescriptions.</div>
              <ToggleGroup type="single" value={timeRange} onValueChange={(v)=>v && setTimeRange(v as any)} className="bg-white/70 md:bg-transparent rounded-md p-1">
                <ToggleGroupItem value="30" className="px-2">30d</ToggleGroupItem>
                <ToggleGroupItem value="90" className="px-2">90d</ToggleGroupItem>
                <ToggleGroupItem value="365" className="px-2">1y</ToggleGroupItem>
                <ToggleGroupItem value="all" className="px-2">All</ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
              <Card className="border-blue-100"><CardContent className="p-4 flex items-center gap-3"><div className="h-10 w-10 rounded-full bg-blue-50 ring-1 ring-blue-100 flex items-center justify-center"><Pill className="h-5 w-5 text-blue-600" /></div><div><div className="text-xs text-gray-500">Medicines</div><div className="text-xl font-semibold">{medicines.length}</div></div></CardContent></Card>
              <Card className="border-purple-100"><CardContent className="p-4 flex items-center gap-3"><div className="h-10 w-10 rounded-full bg-purple-50 ring-1 ring-purple-100 flex items-center justify-center"><FileText className="h-5 w-5 text-purple-600" /></div><div><div className="text-xs text-gray-500">Active Prescriptions</div><div className="text-xl font-semibold">{prescriptions.filter(p=>p && p.status==='active').length}</div></div></CardContent></Card>
              <Card className="border-emerald-100"><CardContent className="p-4 flex items-center gap-3"><div className="h-10 w-10 rounded-full bg-emerald-50 ring-1 ring-emerald-100 flex items-center justify-center"><DollarSign className="h-5 w-5 text-emerald-600" /></div><div><div className="text-xs text-gray-500">Avg. Savings</div><div className="text-xl font-semibold text-green-600">{formatCurrency(Math.max(0, medicines.reduce((s,m)=>s+(m.brandPrice - m.genericPrice),0)/(medicines.length||1)))}</div></div></CardContent></Card>
              <Card className="border-orange-100"><CardContent className="p-4 flex items-center gap-3"><div className="h-10 w-10 rounded-full bg-orange-50 ring-1 ring-orange-100 flex items-center justify-center"><Package className="h-5 w-5 text-orange-600" /></div><div><div className="text-xs text-gray-500">Open Orders</div><div className="text-xl font-semibold">{openOrdersCount}</div></div></CardContent></Card>
              <Card className="border-teal-100"><CardContent className="p-4 flex items-center gap-3"><div className="h-10 w-10 rounded-full bg-teal-50 ring-1 ring-teal-100 flex items-center justify-center"><TrendingUp className="h-5 w-5 text-teal-700" /></div><div><div className="text-xs text-gray-500">Generic Adoption</div><div className="text-xl font-semibold">{genericAdoptionRate}%</div></div></CardContent></Card>
              <Card className="border-sky-100"><CardContent className="p-4 flex items-center gap-3"><div className="h-10 w-10 rounded-full bg-sky-50 ring-1 ring-sky-100 flex items-center justify-center"><Clock className="h-5 w-5 text-sky-600" /></div><div><div className="text-xs text-gray-500">Refill Due Soon</div><div className="text-xl font-semibold">{refillDueSoon.length}</div></div></CardContent></Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-emerald-600" />Spend Over Time</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-24 flex items-end gap-1">
                    {monthlySpendSeries.map((v, i) => (<div key={i} className="flex-1 bg-gradient-to-t from-emerald-200 to-emerald-500 rounded-sm" style={{height: `${Math.max(18, v/4)}px`}}></div>))}
                  </div>
                  <div className="mt-3 text-sm text-gray-600">Total this period: <span className="font-semibold">{formatCurrency(totalSpend)}</span> • Avg basket size: <span className="font-semibold">{avgBasketSize}</span></div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5 text-green-600" />Savings Over Time</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-24 flex items-end gap-1">
                    {monthlySavingsSeries.map((v, i) => (<div key={i} className="flex-1 bg-gradient-to-t from-sky-200 to-sky-500 rounded-sm" style={{height: `${Math.max(12, v/1.2)}px`}}></div>))}
                  </div>
                  <div className="mt-3 text-sm text-gray-600">Generic adoption: <span className="font-semibold">{genericAdoptionRate}%</span></div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-1">
                <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5 text-amber-600" />Upcoming Refills</CardTitle></CardHeader>
                <CardContent>
                  {refillDueSoon.length === 0 && (<div className="text-sm text-gray-600">No refills due soon.</div>)}
                  <div className="space-y-3">
                    {refillDueSoon.map((p) => (
                      <div key={p._id} className="flex items-center justify-between p-3 border rounded-md">
                        <div>
                          <div className="font-medium text-gray-900">{p.medicine} • {p.dosage}</div>
                          <div className="text-xs text-gray-500">Refills left: {p.refills}</div>
                        </div>
                        <Badge className="bg-amber-100 text-amber-800">Due</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="lg:col-span-2">
                <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-blue-600" />Price Intelligence</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {medicines.filter(m => m && typeof m.brandPrice === 'number' && typeof m.genericPrice === 'number' && (m.brandPrice - m.genericPrice) > 0).sort((a,b)=>(b.brandPrice - b.genericPrice) - (a.brandPrice - a.genericPrice)).slice(0,3).map(m => (
                      <div key={m._id} className="flex items-center justify-between p-3 border rounded-md">
                        <div>
                          <div className="font-medium text-gray-900">{m.name}</div>
                          <div className="text-xs text-gray-500">Generic {formatCurrency(m.genericPrice)} • Brand {formatCurrency(m.brandPrice)}</div>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1"><Tag className="h-3 w-3" />Save {formatCurrency(m.brandPrice - m.genericPrice)}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Category and pharmacy insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-indigo-600" />Spend by Category</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {spendByCategory.map(([cat, amt]) => (
                      <div key={cat} className="grid grid-cols-3 items-center gap-3">
                        <div className="col-span-1 text-sm text-gray-700">{cat}</div>
                        <div className="col-span-2">
                          <div className="w-full h-2 bg-gray-100 rounded">
                            <div className="h-2 rounded bg-gradient-to-r from-teal-400 to-emerald-600" style={{ width: `${Math.min(100, (amt as number) / Math.max(1, totalSpend) * 100)}%` }}></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{formatCurrency(amt as number)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Package className="h-5 w-5 text-rose-600" />Delivery & Orders</CardTitle></CardHeader>
                <CardContent>
                  <div className="mb-3 text-sm text-gray-700">On-time deliveries</div>
                  <div className="w-full h-2 bg-gray-100 rounded mb-2">
                    <div className="h-2 rounded bg-gradient-to-r from-emerald-400 to-emerald-600" style={{ width: `${deliveryStats.deliveredPct}%` }}></div>
                  </div>
                  <div className="text-xs text-gray-500 mb-4">Delivered: {deliveryStats.deliveredPct}%</div>
                  <div className="grid grid-cols-5 gap-2 text-xs text-gray-600">
                    {Object.entries(deliveryStats.counts).map(([k,v]) => (
                      <div key={k} className="p-2 border rounded text-center">
                        <div className="font-semibold">{v as number}</div>
                        <div className="capitalize">{k}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pharmacy leaderboard & adherence */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Store className="h-5 w-5 text-teal-700" />Top Pharmacies</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {pharmacyLeaderboard.map((p, idx) => (
                      <div key={p.name} className="flex items-center justify-between p-3 border rounded-md">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-teal-50 ring-1 ring-teal-100 flex items-center justify-center">{idx+1}</div>
                          <div>
                            <div className="font-medium text-gray-900">{p.name}</div>
                            <div className="text-xs text-gray-500">Orders: {p.orders}</div>
                          </div>
                        </div>
                        <div className="text-sm font-semibold">{formatCurrency(p.spend)}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-emerald-700" />Adherence</CardTitle></CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-700 mb-2">On-track with refills</div>
                  <div className="w-full h-2 bg-gray-100 rounded mb-2">
                    <div className="h-2 rounded bg-gradient-to-r from-emerald-400 to-emerald-600" style={{ width: `${adherencePct}%` }}></div>
                  </div>
                  <div className="text-xs text-gray-500">{adherencePct}% adherence across active prescriptions</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Search Medicines Tab */}
          <TabsContent value="search" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="h-5 w-5 text-blue-500" />
                  <span>Search Medicines</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                  <div className="md:col-span-2">
                    <Input placeholder="Search for medicines..." value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)} />
                  </div>
                  <div>
                    <Select value={selectedForm} onValueChange={setSelectedForm}>
                      <SelectTrigger><SelectValue placeholder="Form" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Forms</SelectItem>
                        {availableForms.map(f => (<SelectItem key={f} value={f}>{f}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="stock" checked={inStockOnly} onCheckedChange={(v)=>setInStockOnly(!!v)} />
                    <label htmlFor="stock" className="text-sm text-gray-700">In stock only</label>
                  </div>
                  <div>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger><SelectValue placeholder="Sort" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Relevance</SelectItem>
                        <SelectItem value="price">Price (Low to High)</SelectItem>
                        <SelectItem value="rating">Rating</SelectItem>
                        <SelectItem value="savings">Savings</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {filteredMedicines.map((medicine) => (
                                         <div key={medicine._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <Pill className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{medicine.name}</h4>
                            <Badge variant="outline">{medicine.dosage}</Badge>
                            <Badge className="bg-green-100 text-green-800">
                              {medicine.stock > 0 ? 'In Stock' : 'Out of Stock'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{medicine.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span className="flex items-center">
                              <Star className="h-3 w-3 mr-1" />
                              {medicine.rating} ({medicine.reviews} reviews)
                            </span>
                            <span className="flex items-center">
                              <DollarSign className="h-3 w-3 mr-1" />
                                  From {formatCurrency(medicine.genericPrice)}
                            </span>
                            {medicine.brandPrice - medicine.genericPrice > 0 && (
                              <span className="flex items-center text-blue-700">
                                <Tag className="h-3 w-3 mr-1" /> Save {formatCurrency(medicine.brandPrice - medicine.genericPrice)}
                              </span>
                            )}
                            <span className="flex items-center">
                              <Truck className="h-3 w-3 mr-1" />
                              {medicine.deliveryTime}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedMedicine(medicine);
                            setShowMedicineDialog(true);
                          }}
                        >
                          Details
                        </Button>
                        <Button size="sm" disabled={(medicine.stock || 0) <= 0}>
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Prescriptions Tab */}
          <TabsContent value="prescriptions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-purple-500" />
                  <span>My Prescriptions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {prescriptions.map((prescription) => (
                    <div key={prescription._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-purple-100 rounded-lg">
                          <FileText className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{prescription.medicine}</h4>
                            <Badge variant="outline">{prescription.dosage}</Badge>
                            <Badge className={getStatusColor(prescription.status)}>
                              {prescription.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {prescription.frequency} • {prescription.duration} • {prescription.refills} refills left
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Prescribed by: {prescription.prescribedBy}</span>
                            <span>Date: {prescription.prescribedDate}</span>
                            {prescription.notes && (
                              <span>Notes: {prescription.notes}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleOrderRefill(prescription._id)}
                          disabled={prescription.status !== 'active'}
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Order Refill
                        </Button>
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <span>My Orders</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-orange-100 rounded-lg">
                          <Package className="h-6 w-6 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{order.orderNumber}</h4>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {order.items.length} items • Total: ${order.totalAmount}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Ordered: {order.orderDate}</span>
                            <span>ETA: {order.estimatedDelivery}</span>
                            {order.trackingNumber && (
                              <span>Tracking: {order.trackingNumber}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTrackOrder(order)}
                        >
                          <Truck className="h-4 w-4 mr-1" />
                          Track
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4" />
                          Contact
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Price Comparison Tab */}
          <TabsContent value="prices" className="space-y-6">
            {/* Full Price Comparison CTA */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                      🏆 Advanced Price Comparison Tool
                    </h3>
                    <p className="text-blue-700 mb-4">
                      Compare prices across all medicines, view detailed pharmacy information, 
                      insurance coverage, and find the best deals with our comprehensive comparison tool.
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-blue-600">
                      <span className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Generic vs Brand pricing
                      </span>
                      <span className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Insurance coverage details
                      </span>
                      <span className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Pharmacy ratings & delivery
                      </span>
                    </div>
                  </div>
                  <Button 
                    size="lg" 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => window.location.href = '/patient/pharmacy/price-comparison'}
                  >
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Open Full Comparison
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-green-500" />
                  <span>Quick Price Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {medicines.filter(m => m && m.name && m.description).map((medicine) => (
                    <div key={medicine._id} className="flex items-center justify-between p-4 border rounded-lg">    
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{medicine.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{medicine.description}</p>
                        <div className="flex space-x-4 text-sm">
                          <span className="text-green-600 font-medium">
                            Generic: ${medicine.genericPrice || 0}
                          </span>
                          <span className="text-gray-600">
                            Brand: ${medicine.brandPrice || 0}
                          </span>
                          <span className="text-blue-600 font-medium">
                            Save: ${(medicine.brandPrice || 0) - (medicine.genericPrice || 0)}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Order Generic
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.location.href = '/patient/pharmacy/price-comparison'}
                        >
                          Compare
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Medicine Details Dialog */}
        <Dialog open={showMedicineDialog} onOpenChange={setShowMedicineDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Pill className="h-5 w-5 text-blue-500" />
                <span>Medicine Details</span>
              </DialogTitle>
            </DialogHeader>
            {selectedMedicine && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Pill className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedMedicine.name}</h3>
                    <p className="text-gray-600">{selectedMedicine.generic}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm text-gray-600">Dosage</p>
                    <p className="font-semibold">{selectedMedicine.dosage}</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm text-gray-600">Form</p>
                    <p className="font-semibold">{selectedMedicine.form}</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm text-gray-600">Generic Price</p>
                    <p className="font-semibold text-green-600">${selectedMedicine.genericPrice}</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm text-gray-600">Brand Price</p>
                    <p className="font-semibold text-gray-600">${selectedMedicine.brandPrice}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                  <p className="text-sm text-gray-600">{selectedMedicine.description}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                  <p className="text-sm text-gray-600">{selectedMedicine.description}</p>
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button className="flex-1 bg-green-600 hover:bg-green-700">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Order Generic (${selectedMedicine.genericPrice})
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Compare Prices
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Order Details Dialog */}
        <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-orange-500" />
                <span>Order Details</span>
              </DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Package className="h-8 w-8 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedOrder.orderNumber}</h3>
                    <Badge className={getStatusColor(selectedOrder.status)}>
                      {selectedOrder.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm text-gray-600">Order Date</p>
                    <p className="font-semibold">{selectedOrder.orderDate}</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm text-gray-600">Estimated Delivery</p>
                    <p className="font-semibold">{selectedOrder.estimatedDelivery}</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="font-semibold">${selectedOrder.totalAmount}</p>
                  </div>
                  {selectedOrder.trackingNumber && (
                    <div className="p-3 border rounded-lg">
                      <p className="text-sm text-gray-600">Tracking Number</p>
                      <p className="font-semibold">{selectedOrder.trackingNumber}</p>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Medicines</h4>
                  <div className="space-y-2">
                                         {selectedOrder.items.map((item, index) => (
                       <div key={index} className="flex justify-between items-center p-2 border rounded">
                         <span className="text-sm">{item.medicineName}</span>
                         <span className="text-sm text-gray-600">
                           Qty: {item.quantity} • ${item.price}
                         </span>
                       </div>
                     ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Pharmacy</h4>
                  <div className="p-3 border rounded-lg">
                    <p className="font-medium">{selectedOrder.pharmacy.name}</p>
                    <p className="text-sm text-gray-600">{selectedOrder.pharmacy.address}</p>
                    <p className="text-sm text-gray-600">{selectedOrder.pharmacy.phone}</p>
                  </div>
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button className="flex-1">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Pharmacy
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
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

export default PharmacyServices;  