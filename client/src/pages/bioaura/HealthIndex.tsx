import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Activity,
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  MapPin,
  RefreshCw,
  Target,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Heart,
  Globe,
  Calendar,
  Clock,
} from 'lucide-react';
import bioAuraService from '@/services/bioAuraService';
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
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

type HealthIndexData = Awaited<ReturnType<typeof bioAuraService.getHealthIndex>>;

const HealthIndex: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [healthIndexData, setHealthIndexData] = useState<HealthIndexData | null>(null);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [timeRange, setTimeRange] = useState('30');

  const loadHealthIndex = async () => {
    try {
      setLoading(true);
      const data = await bioAuraService.getHealthIndex({
        region: selectedRegion === 'all' ? undefined : selectedRegion,
        timeRange,
      });
      setHealthIndexData(data);
    } catch (error) {
      console.error('Failed to load health index:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHealthIndex();
  }, [selectedRegion, timeRange]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHealthIndex();
    setRefreshing(false);
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'bg-health-danger';
      case 'medium':
        return 'bg-health-warning';
      default:
        return 'bg-health-success';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUpRight className="h-4 w-4 text-health-warning" />;
      case 'down':
        return <ArrowDownRight className="h-4 w-4 text-health-success" />;
      default:
        return <CheckCircle className="h-4 w-4 text-health-aqua" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-health-teal mx-auto"></div>
          <p className="mt-4 text-health-blue-gray">Loading Health Index...</p>
        </div>
      </div>
    );
  }

  if (!healthIndexData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Failed to load health index data.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const { index, riskLevel, region, indicators, recommendations, historicalData, regionalComparison, categoryBreakdown } =
    healthIndexData;

  const radarData =
    categoryBreakdown?.map(cat => ({
      category: cat.category,
      score: cat.score,
      fullMark: 100,
    })) || [];

  return (
    <div className="space-y-6 bg-health-light-gray min-h-screen px-2 md:px-6 py-4 w-full">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-health-teal to-health-aqua rounded-lg p-6 mb-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Activity className="h-8 w-8 mr-3" />
              BioAura Health Index
            </h1>
            <p className="text-white/90 mt-2">
              Comprehensive health resonance monitoring and predictive analysis across regions
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-[200px] bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="All regions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {regionalComparison?.map(entry => (
                  <SelectItem key={entry.region} value={entry.region}>
                    {entry.region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Health Index Card */}
      <Card className="bg-gradient-to-br from-health-teal to-health-aqua text-white border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Activity className="h-5 w-5" />
                <span className="text-sm font-medium opacity-90">Overall BioAura Health Index</span>
              </div>
              <div className="flex items-baseline space-x-3 mb-4">
                <span className="text-6xl font-bold">{index}</span>
                <span className="text-2xl opacity-80">/ 100</span>
              </div>
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <Badge className={`${getRiskColor(riskLevel)} text-white text-sm px-3 py-1`}>{riskLevel.toUpperCase()} RISK</Badge>
                <div className="flex items-center space-x-1 text-sm opacity-90">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {region.city}, {region.state}
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-sm opacity-90">
                  <Clock className="h-4 w-4" />
                  <span>Updated {new Date(healthIndexData.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
              <Progress value={index} className="w-full h-3 bg-white/20" />
            </div>
            <div className="text-center lg:text-right">
              <div className="text-sm opacity-80 mb-2">Health Resonance</div>
              <div className="text-4xl font-bold mb-2">{index}%</div>
              <div className="text-xs opacity-70">
                {index < 40 && 'Low Activity'}
                {index >= 40 && index < 60 && 'Moderate Activity'}
                {index >= 60 && index < 80 && 'Elevated Activity'}
                {index >= 80 && 'High Activity'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-health-blue-gray">Active Indicators</p>
                <p className="text-2xl font-bold text-health-teal">{indicators.anomalyCount}</p>
                <p className="text-xs text-health-blue-gray mt-1 flex flex-wrap gap-1">
                  {indicators.respiratory && <span>Respiratory •</span>}
                  {indicators.fever && <span>Fever •</span>}
                  <span>Trending</span>
                </p>
              </div>
              <Target className="h-8 w-8 text-health-aqua" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-health-blue-gray">Trending Medicines</p>
                <p className="text-2xl font-bold text-health-teal">{indicators.trendingMedicines}</p>
                <p className="text-xs text-health-blue-gray mt-1">Increased demand</p>
              </div>
              <TrendingUp className="h-8 w-8 text-health-aqua" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-health-blue-gray">Active Alerts</p>
                <p className="text-2xl font-bold text-health-warning">{recommendations.length}</p>
                <p className="text-xs text-health-blue-gray mt-1">Recommendations</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-health-warning" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-health-blue-gray">Monitored Regions</p>
                <p className="text-2xl font-bold text-health-teal">{regionalComparison?.length || 0}</p>
                <p className="text-xs text-health-blue-gray mt-1">Active monitoring</p>
              </div>
              <Globe className="h-8 w-8 text-health-aqua" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="regional">Regional</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-health-teal" />
                  Historical Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={historicalData}>
                    <defs>
                      <linearGradient id="colorIndex" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0D7377" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#0D7377" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Area type="monotone" dataKey="index" stroke="#0D7377" fillOpacity={1} fill="url(#colorIndex)" name="Health Index" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-health-teal" />
                  Category Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="score" fill="#0D7377" name="Score" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-health-teal" />
                Regional Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {regionalComparison?.map((regionEntry, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-health-charcoal">{regionEntry.region}</span>
                      <div className="flex items-center space-x-2">
                        {getTrendIcon(regionEntry.trend)}
                        <Badge className={regionEntry.index >= 60 ? 'bg-health-warning' : 'bg-health-success'}>{regionEntry.index}</Badge>
                      </div>
                    </div>
                    <Progress value={regionEntry.index} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Health Index Trend Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="index" stroke="#0D7377" strokeWidth={3} dot={{ fill: '#0D7377', r: 5 }} name="Health Index" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Regional Tab */}
        <TabsContent value="regional" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Regional Health Index Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={regionalComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="region" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="index" fill="#0D7377" name="Health Index" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Health Category Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Score" dataKey="score" stroke="#0D7377" fill="#0D7377" fillOpacity={0.6} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryBreakdown?.map((category, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-health-charcoal">{category.category}</span>
                    <Badge
                      className={
                        category.impact === 'high'
                          ? 'bg-health-warning'
                          : category.impact === 'medium'
                            ? 'bg-health-aqua'
                            : 'bg-health-success'
                      }
                    >
                      {category.impact}
                    </Badge>
                  </div>
                  <Progress value={category.score} className="h-2 mb-2" />
                  <p className="text-sm text-health-blue-gray">Score: {category.score}/100</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <Alert
                key={index}
                className={
                  rec.severity === 'high'
                    ? 'border-health-danger'
                    : rec.severity === 'medium'
                      ? 'border-health-warning'
                      : 'border-health-aqua'
                }
              >
                <AlertTriangle
                  className={`h-4 w-4 ${rec.severity === 'high' ? 'text-health-danger' : rec.severity === 'medium' ? 'text-health-warning' : 'text-health-aqua'
                    }`}
                />
                <AlertDescription>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{rec.message}</span>
                    <Badge
                      className={
                        rec.severity === 'high'
                          ? 'bg-health-danger'
                          : rec.severity === 'medium'
                            ? 'bg-health-warning'
                            : 'bg-health-aqua'
                      }
                    >
                      {rec.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-sm mt-2">
                    {rec.actions.map((action, i) => (
                      <li key={i} className="text-health-blue-gray">
                        {action}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HealthIndex;

