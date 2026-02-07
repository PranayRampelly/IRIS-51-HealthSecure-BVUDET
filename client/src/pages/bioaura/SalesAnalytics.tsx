import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, MapPin, RefreshCw, BarChart3,
  ShoppingCart, Package, Layers
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import bioAuraService from '@/services/bioAuraService';

interface RegionalSales {
  region: string;
  state: string;
  totalOrders: number;
  totalItems: number;
  categories: Array<{ name: string; count: number }>;
  dailySales: Array<{ date: string; count: number }>;
}

const SalesAnalytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState<RegionalSales[]>([]);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [days, setDays] = useState(30);
  const [viewMetric, setViewMetric] = useState<'orders' | 'items'>('orders');
  const [sortBy, setSortBy] = useState<'orders' | 'items' | 'name'>('orders');

  useEffect(() => {
    loadSalesTrends();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRegion, days, viewMetric]);

  const loadSalesTrends = async () => {
    try {
      setLoading(true);
      const response = await bioAuraService.getRegionalSalesTrends({
        region: selectedRegion && selectedRegion !== 'all' ? selectedRegion : undefined,
        days: days
      });
      setSalesData(response.regions || []);
    } catch (error) {
      console.error('Failed to load sales trends:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortedSalesData = useMemo(() => {
    const copy = [...salesData];
    return copy.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.region.localeCompare(b.region);
        case 'items':
          return b.totalItems - a.totalItems;
        default:
          return b.totalOrders - a.totalOrders;
      }
    });
  }, [salesData, sortBy]);

  const dailySummary = useMemo(() => {
    if (salesData.length === 0) return [];

    // Use dates from the first region as reference, then aggregate
    return salesData[0].dailySales.map(day => ({
      date: day.date,
      total: salesData.reduce((sum, region) => {
        const regionDay = region.dailySales.find(d => d.date === day.date);
        return sum + (regionDay?.count || 0);
      }, 0)
    }));
  }, [salesData]);

  const totals = useMemo(() => {
    const totalOrders = salesData.reduce((sum, r) => sum + r.totalOrders, 0);
    const totalItems = salesData.reduce((sum, r) => sum + r.totalItems, 0);
    const avgItemsPerOrder = totalOrders > 0 ? totalItems / totalOrders : 0;
    return { totalOrders, totalItems, avgItemsPerOrder };
  }, [salesData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-health-teal mx-auto"></div>
          <p className="mt-4 text-health-blue-gray">Loading sales analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-health-light-gray min-h-screen px-2 md:px-6 py-4 w-full">
      {/* Header section with gradient, matching other BioAura pages */}
      <div className="bg-gradient-to-r from-health-teal to-health-aqua rounded-lg p-6 mb-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <TrendingUp className="h-8 w-8 mr-3" />
              Sales Analytics
            </h1>
            <p className="text-white/90 mt-2">
              Analyze sales trends and patterns across regions in real time
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={days.toString()} onValueChange={(v) => setDays(parseInt(v))}>
              <SelectTrigger className="w-[150px] bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="60">Last 60 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-[200px] bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {Array.from(new Set(salesData.map(r => r.region))).map(region => (
                  <SelectItem key={region} value={region}>{region}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={viewMetric}
              onValueChange={(v: 'orders' | 'items') => setViewMetric(v)}
            >
              <SelectTrigger className="w-[160px] bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Metric" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="orders">View Orders</SelectItem>
                <SelectItem value="items">View Items</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={sortBy}
              onValueChange={(v: 'orders' | 'items' | 'name') => setSortBy(v)}
            >
              <SelectTrigger className="w-[170px] bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="orders">Sort by Orders</SelectItem>
                <SelectItem value="items">Sort by Items</SelectItem>
                <SelectItem value="name">Sort by Region Name</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={loadSalesTrends}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-health-blue-gray">Total Orders</p>
                <p className="text-2xl font-bold text-health-teal">
                  {totals.totalOrders.toLocaleString()}
                </p>
              </div>
              <ShoppingCart className="h-8 w-8 text-health-aqua" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-health-blue-gray">Total Items Sold</p>
                <p className="text-2xl font-bold text-health-teal">
                  {totals.totalItems.toLocaleString()}
                </p>
              </div>
              <Package className="h-8 w-8 text-health-aqua" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-health-blue-gray">Active Regions</p>
                <p className="text-2xl font-bold text-health-teal">{salesData.length}</p>
              </div>
              <MapPin className="h-8 w-8 text-health-aqua" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-health-blue-gray">Avg Items/Order</p>
                <p className="text-2xl font-bold text-health-teal">
                  {totals.avgItemsPerOrder > 0
                    ? totals.avgItemsPerOrder.toFixed(1)
                    : '0.0'}
                </p>
              </div>
              <Layers className="h-8 w-8 text-health-aqua" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Daily Sales Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailySummary}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#0D7377"
                  strokeWidth={2}
                  name="Items per day"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orders by Region</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sortedSalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey={viewMetric === 'orders' ? 'totalOrders' : 'totalItems'}
                  fill="#14A085"
                  name={viewMetric === 'orders' ? 'Orders' : 'Items'}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Regional Details */}
      <div className="space-y-4">
        {salesData.map((region, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-health-teal" />
                  {region.region}, {region.state}
                </CardTitle>
                <Badge variant="outline">
                  {region.totalOrders} orders
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-health-blue-gray">Total Orders</p>
                  <p className="text-xl font-semibold text-health-teal">{region.totalOrders}</p>
                </div>
                <div>
                  <p className="text-sm text-health-blue-gray">Items Sold</p>
                  <p className="text-xl font-semibold text-health-aqua">{region.totalItems}</p>
                </div>
                <div>
                  <p className="text-sm text-health-blue-gray">Categories</p>
                  <p className="text-xl font-semibold text-health-teal">{region.categories.length}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-health-charcoal">Top Categories</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {region.categories
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 8)
                    .map((category, catIndex) => (
                      <div key={catIndex} className="p-3 border rounded-lg">
                        <p className="font-medium text-sm">{category.name}</p>
                        <p className="text-xs text-health-blue-gray">{category.count} items</p>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SalesAnalytics;

