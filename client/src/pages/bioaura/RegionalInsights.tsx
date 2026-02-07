import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  MapPin,
  BarChart3,
  Activity,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Layers,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import bioAuraService from '@/services/bioAuraService';

interface RegionalCategory {
  name: string;
  count: number;
}

interface RegionalDailySales {
  date: string;
  count: number;
}

interface RegionalTrend {
  region: string;
  state: string;
  totalOrders: number;
  totalItems: number;
  categories: RegionalCategory[];
  dailySales: RegionalDailySales[];
}

interface DailySummaryPoint {
  date: string;
  totalItems: number;
  orders: number;
}

const RegionalInsights: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [regions, setRegions] = useState<RegionalTrend[]>([]);
  const [dailySummary, setDailySummary] = useState<DailySummaryPoint[]>([]);
  const [days, setDays] = useState(30);
  const [selectedRegionKey, setSelectedRegionKey] = useState<string | 'all'>('all');
  const [sortBy, setSortBy] = useState<'orders' | 'items'>('orders');

  useEffect(() => {
    loadRegionalInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const loadRegionalInsights = async () => {
    try {
      setLoading(true);
      const response = await bioAuraService.getRegionalSalesTrends({ days });
      setRegions(response.regions || []);
      setDailySummary(response.dailySummary || []);

      // Reset selected region if it no longer exists
      if (
        selectedRegionKey !== 'all' &&
        !response.regions?.some(
          (r: RegionalTrend) => `${r.state}-${r.region}` === selectedRegionKey
        )
      ) {
        setSelectedRegionKey('all');
      }
    } catch (error) {
      console.error('Failed to load regional insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortedRegions = useMemo(() => {
    const copy = [...regions];
    return copy.sort((a, b) =>
      sortBy === 'orders'
        ? b.totalOrders - a.totalOrders
        : b.totalItems - a.totalItems
    );
  }, [regions, sortBy]);

  const summary = useMemo(() => {
    const totalOrders = regions.reduce((sum, r) => sum + r.totalOrders, 0);
    const totalItems = regions.reduce((sum, r) => sum + r.totalItems, 0);
    const avgItemsPerOrder = totalOrders > 0 ? totalItems / totalOrders : 0;
    const totalCategories = new Set(
      regions.flatMap((r) => r.categories.map((c) => c.name))
    ).size;

    return {
      totalRegions: regions.length,
      totalOrders,
      totalItems,
      avgItemsPerOrder,
      totalCategories,
    };
  }, [regions]);

  const selectedRegion =
    selectedRegionKey === 'all'
      ? null
      : regions.find((r) => `${r.state}-${r.region}` === selectedRegionKey) || null;

  const categorySummary = useMemo(() => {
    const map: Record<
      string,
      { total: number; regions: Set<string> }
    > = {};
    regions.forEach((region) => {
      region.categories.forEach((cat) => {
        if (!map[cat.name]) {
          map[cat.name] = { total: 0, regions: new Set() };
        }
        map[cat.name].total += cat.count;
        map[cat.name].regions.add(region.region);
      });
    });

    return Object.entries(map)
      .map(([name, value]) => ({
        name,
        total: value.total,
        regions: value.regions.size,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [regions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-health-teal mx-auto"></div>
          <p className="mt-4 text-health-blue-gray">Loading regional insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-health-light-gray min-h-screen px-2 md:px-6 py-4 w-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-health-teal to-health-aqua rounded-lg p-6 mb-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <MapPin className="h-8 w-8 mr-3" />
              Regional Insights
            </h1>
            <p className="text-white/90 mt-2">
              Understand how medicine demand and orders vary across regions and time
            </p>
          </div>
          <div className="flex gap-2">
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
            <Select
              value={sortBy}
              onValueChange={(v: 'orders' | 'items') => setSortBy(v)}
            >
              <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="orders">Sort by Orders</SelectItem>
                <SelectItem value="items">Sort by Items</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={loadRegionalInsights}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-health-blue-gray">Regions</p>
                <p className="text-2xl font-bold text-health-teal">
                  {summary.totalRegions}
                </p>
              </div>
              <MapPin className="h-8 w-8 text-health-aqua" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-health-blue-gray">Total Orders</p>
                <p className="text-2xl font-bold text-health-teal">
                  {summary.totalOrders.toLocaleString()}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-health-aqua" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-health-blue-gray">Total Items Sold</p>
                <p className="text-2xl font-bold text-health-teal">
                  {summary.totalItems.toLocaleString()}
                </p>
              </div>
              <Activity className="h-8 w-8 text-health-aqua" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-health-blue-gray">Avg Items / Order</p>
                <p className="text-2xl font-bold text-health-teal">
                  {summary.avgItemsPerOrder.toFixed(1)}
                </p>
              </div>
              <Layers className="h-8 w-8 text-health-aqua" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Global timelines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Network Daily Items Sold</CardTitle>
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
                  dataKey="totalItems"
                  stroke="#0D7377"
                  strokeWidth={2}
                  name="Items"
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
              <BarChart data={sortedRegions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey={sortBy === 'orders' ? 'totalOrders' : 'totalItems'}
                  fill="#14A085"
                  name={sortBy === 'orders' ? 'Orders' : 'Items'}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Region selector */}
      <Card>
        <CardContent className="p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-health-teal" />
            <span className="font-semibold text-health-charcoal">
              Focus region
            </span>
          </div>
          <Select
            value={selectedRegionKey}
            onValueChange={(value) =>
              setSelectedRegionKey(value as string | 'all')
            }
          >
            <SelectTrigger className="w-full md:w-[260px]">
              <SelectValue placeholder="All Regions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {regions.map((r) => {
                const key = `${r.state}-${r.region}`;
                return (
                  <SelectItem key={key} value={key}>
                    {r.region}, {r.state}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Region detail & categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedRegion
                ? `Daily trend – ${selectedRegion.region}, ${selectedRegion.state}`
                : 'Pick a region to see its daily trend'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedRegion ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={selectedRegion.dailySales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#0D7377"
                    strokeWidth={2}
                    name="Items"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-health-blue-gray">
                Select a specific region above to explore its daily sales pattern.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Categories across Regions</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categorySummary}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={90} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#0D7377" name="Items" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {categorySummary.map((cat) => (
                <div
                  key={cat.name}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm text-health-charcoal">
                      {cat.name}
                    </p>
                    <p className="text-xs text-health-blue-gray">
                      Active in {cat.regions} region(s)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-health-teal">
                      {cat.total.toLocaleString()}
                    </p>
                    <p className="text-xs text-health-blue-gray">items</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Region cards */}
      <div className="space-y-4">
        {sortedRegions.map((region) => {
          const trend =
            region.dailySales.length > 1 &&
            region.dailySales[region.dailySales.length - 1].count >
              region.dailySales[0].count
              ? 'up'
              : 'down';
          return (
            <Card key={`${region.state}-${region.region}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-health-teal" />
                    {region.region}, {region.state}
                  </CardTitle>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">
                      {region.totalOrders.toLocaleString()} orders
                    </Badge>
                    <Badge variant="outline">
                      {region.totalItems.toLocaleString()} items
                    </Badge>
                    <Badge
                      className={
                        trend === 'up'
                          ? 'bg-health-success'
                          : 'bg-health-warning'
                      }
                    >
                      {trend === 'up' ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {trend === 'up' ? 'Rising' : 'Cooling'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-health-blue-gray">Total Orders</p>
                    <p className="text-xl font-semibold text-health-teal">
                      {region.totalOrders.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-health-blue-gray">Total Items</p>
                    <p className="text-xl font-semibold text-health-teal">
                      {region.totalItems.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-health-blue-gray">
                      Avg Items / Order
                    </p>
                    <p className="text-xl font-semibold text-health-aqua">
                      {region.totalOrders > 0
                        ? (region.totalItems / region.totalOrders).toFixed(1)
                        : '0.0'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-health-blue-gray">Categories</p>
                    <p className="text-xl font-semibold text-health-aqua">
                      {region.categories.length}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-health-charcoal">
                    Top Categories
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {region.categories
                      .slice()
                      .sort((a, b) => b.count - a.count)
                      .slice(0, 8)
                      .map((category) => (
                        <div
                          key={category.name}
                          className="p-3 border rounded-lg hover:shadow-sm transition-shadow"
                        >
                          <p className="font-medium text-sm">{category.name}</p>
                          <p className="text-xs text-health-blue-gray">
                            {category.count} items
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default RegionalInsights;


