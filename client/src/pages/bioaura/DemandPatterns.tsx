import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, Search, RefreshCw, TrendingUp, MapPin, Pill } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import bioAuraService from '@/services/bioAuraService';

interface MedicineDemand {
  name: string;
  generic: string;
  category: string;
  dosage: string;
  form: string;
  totalDemand: number;
  regions: Array<{
    region: string;
    state: string;
    demand: number;
  }>;
  dailyDemand: Array<{ date: string; count: number }>;
}

const DemandPatterns: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [demandData, setDemandData] = useState<MedicineDemand[]>([]);
  const [filteredData, setFilteredData] = useState<MedicineDemand[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [days, setDays] = useState(30);
  const [sortBy, setSortBy] = useState<'demand' | 'name'>('demand');
  const [selectedMedicine, setSelectedMedicine] = useState<MedicineDemand | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);

  const loadDemandPatterns = useCallback(
    async (options?: { silent?: boolean }) => {
      const silent = options?.silent;
      try {
        if (!silent) {
          setLoading(true);
        } else {
          setIsAutoRefreshing(true);
        }
        const response = await bioAuraService.getMedicineDemandPatterns({
          category: selectedCategory && selectedCategory !== 'all' ? selectedCategory : undefined,
          region: selectedRegion && selectedRegion !== 'all' ? selectedRegion : undefined,
          days,
        });
        setDemandData(response.medicines || []);
        setLastUpdated(new Date().toISOString());
      } catch (error) {
        console.error('Failed to load demand patterns:', error);
      } finally {
        if (!options?.silent) {
          setLoading(false);
        }
        setIsAutoRefreshing(false);
      }
    },
    [selectedCategory, selectedRegion, days]
  );

  useEffect(() => {
    loadDemandPatterns();
  }, [loadDemandPatterns]);



  useEffect(() => {
    filterData();
  }, [demandData, searchTerm, sortBy]);

  const filterData = () => {
    let filtered = [...demandData];

    if (searchTerm) {
      filtered = filtered.filter(med =>
        med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.generic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return b.totalDemand - a.totalDemand;
    });

    setFilteredData(filtered);

    if (filtered.length > 0 && !selectedMedicine) {
      setSelectedMedicine(filtered[0]);
    }
  };

  const topMedicines = useMemo(() => filteredData.slice(0, 10), [filteredData]);

  const categoryData = filteredData.reduce((acc, med) => {
    const cat = med.category || 'Uncategorized';
    if (!acc[cat]) acc[cat] = 0;
    acc[cat] += med.totalDemand;
    return acc;
  }, {} as Record<string, number>);

  const categoryChartData = Object.entries(categoryData)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const uniqueRegions = Array.from(new Set(demandData.flatMap(m => m.regions.map(r => r.region))));

  const summaryStats = useMemo(() => {
    const totalDemand = filteredData.reduce((sum, med) => sum + med.totalDemand, 0);
    const avgDemand = filteredData.length ? totalDemand / filteredData.length : 0;
    const regionCoverage = new Set(
      filteredData.flatMap(med => med.regions.map(region => `${region.region}-${region.state}`))
    ).size;
    const categoryCount = new Set(filteredData.map(med => med.category || 'Uncategorized')).size;
    return {
      totalMedicines: filteredData.length,
      totalDemand,
      avgDemand,
      regions: regionCoverage,
      categories: categoryCount,
    };
  }, [filteredData]);

  const formattedLastUpdated = lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : '—';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-health-teal mx-auto"></div>
          <p className="mt-4 text-health-blue-gray">Loading demand patterns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-health-light-gray min-h-screen px-2 md:px-6 py-4 w-full">
      {/* Header section */}
      <div className="bg-gradient-to-r from-health-teal to-health-aqua rounded-lg p-6 mb-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <BarChart3 className="h-8 w-8 mr-3" />
              Medicine Demand Patterns
            </h1>
            <p className="text-white/90 mt-2">Analyze medicine demand trends across the BioAura pharmacy network</p>
          </div>
          <div className="flex flex-col lg:items-end gap-3">
            <div className="text-white/80 text-sm">
              Last updated: <span className="font-semibold">{formattedLastUpdated}</span>
              {isAutoRefreshing && <span className="ml-2 text-xs text-white/70">(refreshing...)</span>}
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={sortBy} onValueChange={(v: 'demand' | 'name') => setSortBy(v)}>
                <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="demand">Sort by Demand</SelectItem>
                  <SelectItem value="name">Sort by Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-health-blue-gray" />
              <Input
                placeholder="Search medicines..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Array.from(new Set(demandData.map(m => m.category))).map(cat => (
                  <SelectItem key={cat} value={cat || 'uncategorized'}>
                    {cat || 'Uncategorized'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger>
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {uniqueRegions.map(region => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-health-blue-gray">Total Medicines</p>
                <p className="text-2xl font-bold text-health-teal">{summaryStats.totalMedicines.toLocaleString()}</p>
              </div>
              <Pill className="h-8 w-8 text-health-aqua" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-health-blue-gray">Total Demand</p>
                <p className="text-2xl font-bold text-health-teal">
                  {summaryStats.totalDemand.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-health-aqua" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-health-blue-gray">Avg Demand / Medicine</p>
                <p className="text-2xl font-bold text-health-teal">{summaryStats.avgDemand.toFixed(1)}</p>
                <p className="text-xs text-health-blue-gray mt-1">Rolling {days}-day window</p>
              </div>
              <BarChart3 className="h-8 w-8 text-health-aqua" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-health-blue-gray">Coverage</p>
                <p className="text-2xl font-bold text-health-teal">
                  {summaryStats.regions} regions • {summaryStats.categories} categories
                </p>
              </div>
              <MapPin className="h-8 w-8 text-health-aqua" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Medicines by Demand</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={topMedicines}
                onClick={state => {
                  const payload = (state && (state as any).activePayload?.[0]?.payload) as MedicineDemand | undefined;
                  if (payload) setSelectedMedicine(payload);
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="totalDemand" fill="#0D7377" name="Demand" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{selectedMedicine ? `Daily Demand – ${selectedMedicine.name}` : 'Daily Demand (select a medicine)'}</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedMedicine ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={selectedMedicine.dailyDemand}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#14A085" strokeWidth={2} name="Demand" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-health-blue-gray">Click on a medicine in the bar chart to see its daily demand pattern.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Medicines List */}
      <Card>
        <CardHeader>
          <CardTitle>Top Medicines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topMedicines.map((medicine, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="w-8 text-center">
                      {index + 1}
                    </Badge>
                    <div>
                      <p className="font-semibold text-health-charcoal">{medicine.name}</p>
                      <div className="flex flex-wrap items-center space-x-4 text-sm text-health-blue-gray mt-1">
                        {medicine.generic && <span>Generic: {medicine.generic}</span>}
                        {medicine.category && <span>Category: {medicine.category}</span>}
                        {medicine.dosage && <span>{medicine.dosage}</span>}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-health-teal">{medicine.totalDemand}</p>
                  <p className="text-xs text-health-blue-gray">total demand</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DemandPatterns;

