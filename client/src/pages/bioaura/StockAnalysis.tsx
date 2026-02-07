import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Package, MapPin, AlertTriangle, RefreshCw, TrendingDown, 
  BarChart3, Building, Activity, TrendingUp, ArrowUpRight,
  ArrowDownRight, CheckCircle, Info, Download, Filter,
  Zap, Target, Shield
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line, AreaChart, Area, PieChart, Pie } from 'recharts';
import bioAuraService from '@/services/bioAuraService';

interface RegionalStock {
  region: string;
  state: string;
  categories: Array<{
    name: string;
    totalStock: number;
    lowStockCount: number;
    items: Array<{
      name: string;
      stock: number;
      threshold: number;
      generic: string;
    }>;
  }>;
  totalItems: number;
  lowStockItems: number;
  pharmacies: string[];
}

const StockAnalysis: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stockData, setStockData] = useState<RegionalStock[]>([]);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'total' | 'lowStock' | 'pharmacies'>('total');

  useEffect(() => {
    loadStockAnalysis();
  }, [selectedRegion, selectedCategory]);

  const loadStockAnalysis = async () => {
    try {
      setLoading(true);
      const response = await bioAuraService.getRegionalStockAnalysis({
        region: selectedRegion && selectedRegion !== 'all' ? selectedRegion : undefined,
        category: selectedCategory && selectedCategory !== 'all' ? selectedCategory : undefined
      });
      setStockData(response.regions || []);
    } catch (error) {
      console.error('Failed to load stock analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortedData = [...stockData].sort((a, b) => {
    switch (sortBy) {
      case 'lowStock':
        return b.lowStockItems - a.lowStockItems;
      case 'pharmacies':
        return b.pharmacies.length - a.pharmacies.length;
      default:
        return b.totalItems - a.totalItems;
    }
  });

  const chartData = sortedData.map(region => ({
    name: region.region,
    totalStock: region.totalItems,
    lowStock: region.lowStockItems,
    pharmacies: region.pharmacies.length,
    stockRatio: region.totalItems > 0 ? ((region.totalItems - region.lowStockItems) / region.totalItems) * 100 : 0
  }));

  const categoryData = stockData.flatMap(region =>
    region.categories.map(cat => ({
      region: region.region,
      category: cat.name,
      totalStock: cat.totalStock,
      lowStock: cat.lowStockCount
    }))
  );

  const categorySummary = categoryData.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = { total: 0, low: 0 };
    }
    acc[item.category].total += item.totalStock;
    acc[item.category].low += item.lowStock;
    return acc;
  }, {} as Record<string, { total: number; low: number }>);

  const categoryChartData = Object.entries(categorySummary).map(([name, data]) => ({
    name,
    total: data.total,
    low: data.low,
    healthy: data.total - data.low
  }));

  const totalStock = stockData.reduce((sum, r) => sum + r.totalItems, 0);
  const totalLowStock = stockData.reduce((sum, r) => sum + r.lowStockItems, 0);
  const totalPharmacies = new Set(stockData.flatMap(r => r.pharmacies)).size;
  const stockHealthPercentage = totalStock > 0 ? ((totalStock - totalLowStock) / totalStock) * 100 : 0;

  const COLORS = ['#0D7377', '#14A085', '#39B982', '#F59E0B', '#EF4444'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-health-teal mx-auto"></div>
          <p className="mt-4 text-health-blue-gray">Loading stock analysis...</p>
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
              <Package className="h-8 w-8 mr-3" />
              Regional Stock Analysis
            </h1>
            <p className="text-white/90 mt-2">
              Comprehensive stock level monitoring, supply chain risk assessment, and inventory optimization insights
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={(v: 'total' | 'lowStock' | 'pharmacies') => setSortBy(v)}>
              <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="total">Sort by Total Stock</SelectItem>
                <SelectItem value="lowStock">Sort by Low Stock</SelectItem>
                <SelectItem value="pharmacies">Sort by Pharmacies</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={loadStockAnalysis}
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
                <p className="text-sm text-health-blue-gray">Total Regions</p>
                <p className="text-2xl font-bold text-health-teal">{stockData.length}</p>
                <p className="text-xs text-health-blue-gray mt-1">Monitored</p>
              </div>
              <MapPin className="h-8 w-8 text-health-aqua" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-health-blue-gray">Total Stock Items</p>
                <p className="text-2xl font-bold text-health-teal">
                  {totalStock.toLocaleString()}
                </p>
                <p className="text-xs text-health-blue-gray mt-1">Across network</p>
              </div>
              <Package className="h-8 w-8 text-health-aqua" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-health-blue-gray">Low Stock Items</p>
                <p className="text-2xl font-bold text-health-warning">
                  {totalLowStock}
                </p>
                <p className="text-xs text-health-blue-gray mt-1">
                  {totalStock > 0 ? ((totalLowStock / totalStock) * 100).toFixed(1) : 0}% of total
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-health-warning" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-health-blue-gray">Stock Health</p>
                <p className="text-2xl font-bold text-health-success">
                  {stockHealthPercentage.toFixed(1)}%
                </p>
                <Progress value={stockHealthPercentage} className="h-2 mt-2" />
              </div>
              <Activity className="h-8 w-8 text-health-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger>
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {Array.from(new Set(stockData.map(r => r.region))).map(region => (
                  <SelectItem key={region} value={region}>{region}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Array.from(new Set(stockData.flatMap(r => r.categories.map(c => c.name)))).map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center justify-end">
              <Badge variant="outline" className="text-sm">
                {totalPharmacies} pharmacies
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="regional">Regional</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Stock Levels by Region</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="totalStock" fill="#0D7377" name="Total Stock" />
                    <Bar dataKey="lowStock" fill="#F59E0B" name="Low Stock" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stock Health Ratio</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14A085" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#14A085" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Area type="monotone" dataKey="stockRatio" stroke="#14A085" fillOpacity={1} fill="url(#colorStock)" name="Health %" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Category Stock Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="healthy" stackId="a" fill="#14A085" name="Healthy Stock" />
                  <Bar dataKey="low" stackId="a" fill="#F59E0B" name="Low Stock" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Regional Tab */}
        <TabsContent value="regional" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Pharmacies per Region</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="pharmacies" fill="#14A085" name="Pharmacies" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Regional Stock Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, totalStock }) => `${name}: ${totalStock}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="totalStock"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Regional Details */}
          <div className="space-y-4">
            {sortedData.map((region, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-health-teal" />
                      {region.region}, {region.state}
                    </CardTitle>
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline">
                        {region.pharmacies.length} pharmacies
                      </Badge>
                      {region.lowStockItems > 0 && (
                        <Badge className="bg-health-warning">
                          {region.lowStockItems} alerts
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-health-blue-gray">Total Items</p>
                      <p className="text-xl font-semibold text-health-teal">{region.totalItems.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-health-blue-gray">Low Stock Items</p>
                      <p className={`text-xl font-semibold ${
                        region.lowStockItems > 0 ? 'text-health-warning' : 'text-health-success'
                      }`}>
                        {region.lowStockItems}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-health-blue-gray">Stock Health</p>
                      <p className="text-xl font-semibold text-health-success">
                        {region.totalItems > 0 
                          ? (((region.totalItems - region.lowStockItems) / region.totalItems) * 100).toFixed(1)
                          : 100}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-health-blue-gray">Categories</p>
                      <p className="text-xl font-semibold text-health-aqua">{region.categories.length}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-health-charcoal">Categories Breakdown</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {region.categories.map((category, catIndex) => (
                        <div key={catIndex} className="p-3 border rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{category.name}</span>
                            {category.lowStockCount > 0 && (
                              <Badge variant="outline" className="bg-health-warning/10 text-health-warning">
                                {category.lowStockCount} low
                              </Badge>
                            )}
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-health-blue-gray">Total:</span>
                              <span className="font-semibold text-health-charcoal">{category.totalStock}</span>
                            </div>
                            <Progress 
                              value={category.totalStock > 0 ? ((category.totalStock - category.lowStockCount) / category.totalStock) * 100 : 100} 
                              className="h-2" 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Category Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryChartData.map((category, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-health-charcoal">{category.name}</span>
                        {category.low > 0 && (
                          <Badge className="bg-health-warning">{category.low} low</Badge>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-health-blue-gray">Total Stock</span>
                          <span className="font-semibold text-health-teal">{category.total.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-health-blue-gray">Low Stock</span>
                          <span className="font-semibold text-health-warning">{category.low}</span>
                        </div>
                        <Progress 
                          value={category.total > 0 ? ((category.total - category.low) / category.total) * 100 : 100} 
                          className="h-2" 
                        />
                        <p className="text-xs text-health-blue-gray">
                          Health: {category.total > 0 ? (((category.total - category.low) / category.total) * 100).toFixed(1) : 100}%
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <div className="space-y-4">
            {sortedData
              .filter(region => region.lowStockItems > 0)
              .map((region, index) => (
                <Alert key={index} className="border-health-warning">
                  <AlertTriangle className="h-4 w-4 text-health-warning" />
                  <AlertDescription>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{region.region}, {region.state}</span>
                      <Badge className="bg-health-warning">
                        {region.lowStockItems} low stock items
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                      {region.categories
                        .filter(cat => cat.lowStockCount > 0)
                        .map((category, catIndex) => (
                          <div key={catIndex} className="text-sm text-health-blue-gray">
                            • {category.name}: {category.lowStockCount} items need restocking
                          </div>
                        ))}
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            {sortedData.filter(region => region.lowStockItems > 0).length === 0 && (
              <Alert className="border-health-success">
                <CheckCircle className="h-4 w-4 text-health-success" />
                <AlertDescription>
                  <span className="font-semibold">All regions have healthy stock levels!</span>
                  <p className="text-sm text-health-blue-gray mt-1">No low stock alerts at this time.</p>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stock Trend Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="totalStock" stroke="#0D7377" strokeWidth={2} name="Total Stock" />
                  <Line type="monotone" dataKey="lowStock" stroke="#F59E0B" strokeWidth={2} name="Low Stock" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StockAnalysis;
