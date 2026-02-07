import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Pill, MapPin, Building, Phone, Mail, Package, TrendingUp,
  RefreshCw, Search, AlertTriangle, CheckCircle, XCircle, Activity,
  BarChart3, Users, ShoppingCart, Download, Filter, Eye, EyeOff,
  Globe, TrendingDown, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import bioAuraService from '@/services/bioAuraService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface PharmacyData {
  pharmacyId: string;
  businessName: string;
  location: {
    city: string;
    state: string;
    address: string;
    coordinates: { lat: number; lng: number } | null;
  };
  type: string;
  contact: {
    email: string;
    phone: string;
  };
  inventory: {
    totalItems: number;
    lowStockItems: number;
    items: Array<{
      name: string;
      stock: number;
      threshold: number;
      category: string;
      generic: string;
      dosage: string;
      form: string;
    }>;
  };
  sales: {
    totalOrders: number;
    totalItemsSold: number;
    period: string;
    totalRevenue?: number;
  };
  lastUpdated: string;
  status?: 'connected' | 'no-data';
}

const PharmacyNetwork: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [pharmacies, setPharmacies] = useState<PharmacyData[]>([]);
  const [filteredPharmacies, setFilteredPharmacies] = useState<PharmacyData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [stateFilter, setStateFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPharmacy, setSelectedPharmacy] = useState<PharmacyData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);

  const loadPharmacyData = useCallback(
    async (options?: { silent?: boolean }) => {
      const silent = options?.silent;
      try {
        if (!silent) {
          setLoading(true);
        } else {
          setIsAutoRefreshing(true);
        }
        const response = await bioAuraService.getPharmacyData({
          region: regionFilter && regionFilter !== 'all' ? regionFilter : undefined,
          state: stateFilter && stateFilter !== 'all' ? stateFilter : undefined,
          limit: 100
        });
        setPharmacies(response.data || []);
        setLastUpdated(new Date().toISOString());
      } catch (error) {
        console.error('Failed to load pharmacy data:', error);
      } finally {
        if (!silent) {
          setLoading(false);
        }
        setIsAutoRefreshing(false);
      }
    },
    [regionFilter, stateFilter]
  );

  useEffect(() => {
    loadPharmacyData();
  }, [loadPharmacyData]);

  useEffect(() => {
    filterPharmacies();
  }, [pharmacies, searchTerm, regionFilter, stateFilter, typeFilter]);



  const filterPharmacies = () => {
    let filtered = [...pharmacies];

    if (searchTerm) {
      filtered = filtered.filter(pharmacy =>
        pharmacy.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pharmacy.location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pharmacy.location.state.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (regionFilter && regionFilter !== 'all') {
      filtered = filtered.filter(pharmacy =>
        pharmacy.location.city.toLowerCase().includes(regionFilter.toLowerCase())
      );
    }

    if (stateFilter && stateFilter !== 'all') {
      filtered = filtered.filter(pharmacy =>
        pharmacy.location.state.toLowerCase().includes(stateFilter.toLowerCase())
      );
    }

    if (typeFilter && typeFilter !== 'all') {
      filtered = filtered.filter(pharmacy =>
        pharmacy.type.toLowerCase() === typeFilter.toLowerCase()
      );
    }

    setFilteredPharmacies(filtered);
  };

  const uniqueStates = Array.from(new Set(pharmacies.map(p => p.location.state))).sort();
  const uniqueCities = Array.from(new Set(pharmacies.map(p => p.location.city))).sort();
  const uniqueTypes = Array.from(new Set(pharmacies.map(p => p.type))).sort();

  const summary = useMemo(() => {
    const totalInventory = filteredPharmacies.reduce((sum, p) => sum + p.inventory.totalItems, 0);
    const lowStock = filteredPharmacies.reduce((sum, p) => sum + p.inventory.lowStockItems, 0);
    const totalOrders = filteredPharmacies.reduce((sum, p) => sum + p.sales.totalOrders, 0);
    const totalItemsSold = filteredPharmacies.reduce((sum, p) => sum + p.sales.totalItemsSold, 0);
    const connected = filteredPharmacies.filter(p => p.status !== 'no-data').length;
    return {
      pharmacies: filteredPharmacies.length,
      totalInventory,
      lowStock,
      totalOrders,
      totalItemsSold,
      connected,
    };
  }, [filteredPharmacies]);
  const formattedLastUpdated = lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : '—';

  // Chart data
  const stateDistribution = uniqueStates.map(state => ({
    name: state,
    count: filteredPharmacies.filter(p => p.location.state === state).length
  }));

  const typeDistribution = uniqueTypes.map(type => ({
    name: type,
    value: filteredPharmacies.filter(p => p.type === type).length
  }));

  const COLORS = ['#0D7377', '#14A085', '#39B982', '#0D7377', '#14A085'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-health-teal mx-auto"></div>
          <p className="mt-4 text-health-blue-gray">Loading pharmacy network...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-health-light-gray min-h-screen px-2 md:px-6 py-4 w-full">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-health-teal to-health-aqua rounded-lg p-6 mb-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Pill className="h-8 w-8 mr-3" />
              Pharmacy Network
            </h1>
            <p className="text-white/90 mt-2">
              Monitor connected pharmacies, inventory levels, and data integration status across the network
            </p>
          </div>
          <div className="flex flex-col gap-2 lg:items-end">
            <div className="text-white/80 text-sm">
              Last updated: <span className="font-semibold">{formattedLastUpdated}</span>
              {isAutoRefreshing && <span className="ml-2 text-xs text-white/70">(refreshing...)</span>}
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {viewMode === 'grid' ? 'List View' : 'Grid View'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-health-blue-gray">Pharmacies</p>
                <p className="text-2xl font-bold text-health-teal">{summary.pharmacies}</p>
                <p className="text-xs text-health-blue-gray mt-1">
                  {summary.connected} connected • {summary.pharmacies - summary.connected} awaiting data
                </p>
              </div>
              <Building className="h-8 w-8 text-health-aqua" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-health-blue-gray">Total Inventory</p>
                <p className="text-2xl font-bold text-health-teal">{summary.totalInventory.toLocaleString()}</p>
                <p className="text-xs text-health-blue-gray mt-1">Items across network</p>
              </div>
              <Package className="h-8 w-8 text-health-aqua" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-health-blue-gray">Low Stock Alerts</p>
                <p className="text-2xl font-bold text-health-warning">{summary.lowStock}</p>
                <p className="text-xs text-health-blue-gray mt-1">Requires attention</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-health-warning" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-health-blue-gray">Total Orders</p>
                <p className="text-2xl font-bold text-health-teal">{summary.totalOrders}</p>
                <p className="text-xs text-health-blue-gray mt-1">
                  {summary.totalItemsSold.toLocaleString()} items fulfilled
                </p>
              </div>
              <ShoppingCart className="h-8 w-8 text-health-aqua" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-health-blue-gray" />
              <Input
                placeholder="Search pharmacies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {uniqueStates.map(state => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {uniqueCities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center justify-end">
              <Badge variant="outline" className="text-sm">
                {filteredPharmacies.length} pharmacies
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different views */}
      <Tabs defaultValue="pharmacies" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pharmacies">Pharmacies</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Pharmacies Tab */}
        <TabsContent value="pharmacies" className="space-y-6">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPharmacies.map((pharmacy) => (
                <Card key={pharmacy.pharmacyId} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedPharmacy(pharmacy)}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-health-teal/10 rounded-lg">
                          <Building className="h-5 w-5 text-health-teal" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{pharmacy.businessName}</CardTitle>
                          <div className="flex items-center text-sm text-health-blue-gray mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {pharmacy.location.city}, {pharmacy.location.state}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline">{pharmacy.type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Contact Info */}
                    <div className="space-y-2">
                      {pharmacy.contact.phone && (
                        <div className="flex items-center text-sm text-health-blue-gray">
                          <Phone className="h-4 w-4 mr-2" />
                          {pharmacy.contact.phone}
                        </div>
                      )}
                      {pharmacy.contact.email && (
                        <div className="flex items-center text-sm text-health-blue-gray">
                          <Mail className="h-4 w-4 mr-2" />
                          {pharmacy.contact.email}
                        </div>
                      )}
                    </div>

                    {/* Inventory Stats */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-xs text-health-blue-gray">Total Items</p>
                        <p className="text-lg font-semibold text-health-teal">
                          {pharmacy.inventory.totalItems}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-health-blue-gray">Low Stock</p>
                        <p className={`text-lg font-semibold ${pharmacy.inventory.lowStockItems > 0 ? 'text-health-warning' : 'text-health-success'
                          }`}>
                          {pharmacy.inventory.lowStockItems}
                        </p>
                      </div>
                    </div>

                    {/* Sales Stats */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-xs text-health-blue-gray">Orders ({pharmacy.sales.period})</p>
                        <p className="text-lg font-semibold text-health-teal">
                          {pharmacy.sales.totalOrders}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-health-blue-gray">Items Sold</p>
                        <p className="text-lg font-semibold text-health-aqua">
                          {pharmacy.sales.totalItemsSold}
                        </p>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center space-x-2">
                        {pharmacy.status === 'connected' ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-health-success" />
                            <span className="text-xs text-health-blue-gray">Connected</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-health-warning" />
                            <span className="text-xs text-health-blue-gray">Awaiting data</span>
                          </>
                        )}
                      </div>
                      <span className="text-xs text-health-blue-gray">
                        Updated {new Date(pharmacy.lastUpdated).toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-health-light-gray border-b">
                      <tr>
                        <th className="text-left p-4 text-sm font-semibold text-health-charcoal">Pharmacy</th>
                        <th className="text-left p-4 text-sm font-semibold text-health-charcoal">Location</th>
                        <th className="text-left p-4 text-sm font-semibold text-health-charcoal">Type</th>
                        <th className="text-left p-4 text-sm font-semibold text-health-charcoal">Inventory</th>
                        <th className="text-left p-4 text-sm font-semibold text-health-charcoal">Low Stock</th>
                        <th className="text-left p-4 text-sm font-semibold text-health-charcoal">Orders</th>
                        <th className="text-left p-4 text-sm font-semibold text-health-charcoal">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPharmacies.map((pharmacy) => (
                        <tr key={pharmacy.pharmacyId} className="border-b hover:bg-health-light-gray/50 cursor-pointer" onClick={() => setSelectedPharmacy(pharmacy)}>
                          <td className="p-4">
                            <div className="font-semibold text-health-charcoal">{pharmacy.businessName}</div>
                            <div className="text-xs text-health-blue-gray">{pharmacy.contact.email}</div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm text-health-charcoal">{pharmacy.location.city}</div>
                            <div className="text-xs text-health-blue-gray">{pharmacy.location.state}</div>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline">{pharmacy.type}</Badge>
                          </td>
                          <td className="p-4">
                            <div className="text-sm font-semibold text-health-teal">{pharmacy.inventory.totalItems}</div>
                          </td>
                          <td className="p-4">
                            <div className={`text-sm font-semibold ${pharmacy.inventory.lowStockItems > 0 ? 'text-health-warning' : 'text-health-success'
                              }`}>
                              {pharmacy.inventory.lowStockItems}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm font-semibold text-health-teal">{pharmacy.sales.totalOrders}</div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              {pharmacy.status === 'connected' ? (
                                <>
                                  <CheckCircle className="h-4 w-4 text-health-success" />
                                  <span className="text-xs text-health-blue-gray">Connected</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-4 w-4 text-health-warning" />
                                  <span className="text-xs text-health-blue-gray">Awaiting data</span>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {filteredPharmacies.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <AlertTriangle className="h-12 w-12 text-health-warning mx-auto mb-4" />
                <p className="text-health-blue-gray">No pharmacies found matching your filters.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Pharmacies by State</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stateDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0D7377" name="Pharmacies" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pharmacy Types Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={typeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {typeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Distribution Tab */}
        <TabsContent value="distribution" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Geographic Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stateDistribution.map((state, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-health-charcoal">{state.name}</span>
                      <Badge variant="outline">{state.count}</Badge>
                    </div>
                    <Progress value={(state.count / Math.max(summary.pharmacies, 1)) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPharmacies
              .sort((a, b) => b.sales.totalOrders - a.sales.totalOrders)
              .slice(0, 9)
              .map((pharmacy) => (
                <Card key={pharmacy.pharmacyId}>
                  <CardHeader>
                    <CardTitle className="text-lg">{pharmacy.businessName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-health-blue-gray">Performance Score</p>
                        <Progress value={(pharmacy.sales.totalOrders / Math.max(...filteredPharmacies.map(p => p.sales.totalOrders))) * 100} className="h-2" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-health-blue-gray">Orders</p>
                          <p className="text-lg font-semibold text-health-teal">{pharmacy.sales.totalOrders}</p>
                        </div>
                        <div>
                          <p className="text-xs text-health-blue-gray">Items Sold</p>
                          <p className="text-lg font-semibold text-health-aqua">{pharmacy.sales.totalItemsSold}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PharmacyNetwork;
