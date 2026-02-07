import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Cloud,
  Wind,
  Droplets,
  Sun,
  AlertTriangle,
  RefreshCw,
  MapPin,
  Thermometer,
  Gauge,
  Activity,
  TrendingUp,
  TrendingDown,
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
} from 'recharts';

type EnvironmentDashboardData = Awaited<ReturnType<typeof bioAuraService.getEnvironmentDashboard>>;

const EnvironmentDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<EnvironmentDashboardData | null>(null);
  const [selectedRegion, setSelectedRegion] = useState('Delhi');
  const [days, setDays] = useState('7');
  const [availableRegions, setAvailableRegions] = useState<Array<{ name: string; city: string; state: string }>>([]);

  const loadDashboard = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      // Always force fresh data from APIs for real-time updates
      const data = await bioAuraService.getEnvironmentDashboard({
        region: selectedRegion,
        days: parseInt(days),
        forceRefresh: true, // Always fetch fresh data from APIs
      });
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load environment dashboard:', error);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  // Load available regions on mount
  useEffect(() => {
    const loadRegions = async () => {
      try {
        const data = await bioAuraService.getAvailableRegions();
        if (data?.regions && data.regions.length > 0) {
          setAvailableRegions(data.regions);
          // Set first region as default if not already set
          if (!selectedRegion || !data.regions.find((r: { name: string }) => r.name === selectedRegion)) {
            setSelectedRegion(data.regions[0].name);
          }
        }
      } catch (error) {
        console.error('Failed to load available regions:', error);
        // Fallback to default regions
        setAvailableRegions([
          { name: 'Delhi', city: 'Delhi', state: 'Delhi' },
          { name: 'Mumbai', city: 'Mumbai', state: 'Maharashtra' },
          { name: 'Bangalore', city: 'Bangalore', state: 'Karnataka' },
          { name: 'Chennai', city: 'Chennai', state: 'Tamil Nadu' },
          { name: 'Kolkata', city: 'Kolkata', state: 'West Bengal' },
          { name: 'Hyderabad', city: 'Hyderabad', state: 'Telangana' },
        ]);
      }
    };
    loadRegions();
  }, []);

  useEffect(() => {
    if (availableRegions.length > 0) {
      loadDashboard();
    }
  }, [selectedRegion, days, availableRegions.length]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  const getAQIColor = (aqi: number) => {
    if (aqi > 300) return 'bg-red-700';
    if (aqi > 200) return 'bg-red-500';
    if (aqi > 150) return 'bg-orange-500';
    if (aqi > 100) return 'bg-yellow-500';
    if (aqi > 50) return 'bg-yellow-300';
    return 'bg-green-500';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical':
      case 'high':
        return 'bg-health-danger';
      case 'medium':
        return 'bg-health-warning';
      default:
        return 'bg-health-success';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-health-teal mx-auto"></div>
          <p className="mt-4 text-health-blue-gray">Loading Environment Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Failed to load environment dashboard data.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const { airQuality, climate, historicalData, regionalComparison, alerts, agentStatus } = dashboardData;

  return (
    <div className="space-y-6 bg-health-light-gray min-h-screen px-2 md:px-6 py-4 w-full">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-health-teal to-health-aqua rounded-lg p-6 mb-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Cloud className="h-8 w-8 mr-3" />
              Environment Agent Dashboard
            </h1>
            <p className="text-white/90 mt-2 flex items-center gap-3 flex-wrap">
              Real-time monitoring
              {dashboardData?.agentStatus?.lastUpdate && (
                <span className="text-xs text-white/70">
                  Last: {new Date(dashboardData.agentStatus.lastUpdate).toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-[150px] bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                {availableRegions.map((region) => (
                  <SelectItem key={region.name} value={region.name}>
                    {region.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-health-blue-gray">Air Quality Index</p>
                <p className="text-2xl font-bold text-health-teal">{airQuality.aqi}</p>
                <Badge className={`${getAQIColor(airQuality.aqi)} text-white mt-1`}>{airQuality.category}</Badge>
              </div>
              <Cloud className="h-8 w-8 text-health-aqua" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-health-blue-gray">Temperature</p>
                <p className="text-2xl font-bold text-health-teal">{climate.temperature}°C</p>
                <p className="text-xs text-health-blue-gray mt-1">Feels like {climate.feelsLike}°C</p>
              </div>
              <Thermometer className="h-8 w-8 text-health-aqua" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-health-blue-gray">Humidity</p>
                <p className="text-2xl font-bold text-health-teal">{climate.humidity}%</p>
                <p className="text-xs text-health-blue-gray mt-1">Wind: {climate.windSpeed} km/h</p>
              </div>
              <Droplets className="h-8 w-8 text-health-aqua" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-health-blue-gray">Active Alerts</p>
                <p className="text-2xl font-bold text-health-warning">{alerts.length}</p>
                <p className="text-xs text-health-blue-gray mt-1">Health risks detected</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-health-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="air-quality">Air Quality</TabsTrigger>
          <TabsTrigger value="climate">Climate</TabsTrigger>
          <TabsTrigger value="regional">Regional</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Air Quality Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Cloud className="h-5 w-5 mr-2 text-health-teal" />
                  Air Quality Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className={`inline-block px-6 py-4 rounded-lg ${getAQIColor(airQuality.aqi)} text-white mb-2`}>
                      <p className="text-4xl font-bold">{airQuality.aqi}</p>
                      <p className="text-sm opacity-90">{airQuality.category}</p>
                    </div>
                    <Badge className={`${getRiskColor(airQuality.healthRisk)} text-white mt-2`}>
                      {airQuality.healthRisk.toUpperCase()} RISK
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="p-3 bg-health-light-gray rounded-lg">
                      <p className="text-xs text-health-blue-gray">PM2.5</p>
                      <p className="text-lg font-semibold">{airQuality.pm25} µg/m³</p>
                    </div>
                    <div className="p-3 bg-health-light-gray rounded-lg">
                      <p className="text-xs text-health-blue-gray">PM10</p>
                      <p className="text-lg font-semibold">{airQuality.pm10} µg/m³</p>
                    </div>
                    <div className="p-3 bg-health-light-gray rounded-lg">
                      <p className="text-xs text-health-blue-gray">NO₂</p>
                      <p className="text-lg font-semibold">{airQuality.no2} ppb</p>
                    </div>
                    <div className="p-3 bg-health-light-gray rounded-lg">
                      <p className="text-xs text-health-blue-gray">O₃</p>
                      <p className="text-lg font-semibold">{airQuality.o3} ppb</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Climate Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sun className="h-5 w-5 mr-2 text-health-teal" />
                  Climate Conditions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-health-light-gray rounded-lg">
                      <Thermometer className="h-6 w-6 text-health-aqua mx-auto mb-2" />
                      <p className="text-2xl font-bold">{climate.temperature}°C</p>
                      <p className="text-xs text-health-blue-gray">Temperature</p>
                    </div>
                    <div className="text-center p-4 bg-health-light-gray rounded-lg">
                      <Droplets className="h-6 w-6 text-health-aqua mx-auto mb-2" />
                      <p className="text-2xl font-bold">{climate.humidity}%</p>
                      <p className="text-xs text-health-blue-gray">Humidity</p>
                    </div>
                    <div className="text-center p-4 bg-health-light-gray rounded-lg">
                      <Wind className="h-6 w-6 text-health-aqua mx-auto mb-2" />
                      <p className="text-2xl font-bold">{climate.windSpeed} km/h</p>
                      <p className="text-xs text-health-blue-gray">Wind Speed</p>
                    </div>
                    <div className="text-center p-4 bg-health-light-gray rounded-lg">
                      <Gauge className="h-6 w-6 text-health-aqua mx-auto mb-2" />
                      <p className="text-2xl font-bold">{climate.pressure} hPa</p>
                      <p className="text-xs text-health-blue-gray">Pressure</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-health-blue-gray">UV Index</span>
                      <Badge className={climate.uvIndex > 7 ? 'bg-red-500' : climate.uvIndex > 5 ? 'bg-yellow-500' : 'bg-green-500'}>
                        {climate.uvIndex} - {climate.uvIndex > 7 ? 'Very High' : climate.uvIndex > 5 ? 'Moderate' : 'Low'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Historical Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">AQI Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={historicalData.aqi}>
                    <defs>
                      <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0D7377" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#0D7377" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#0D7377" fillOpacity={1} fill="url(#colorAqi)" name="AQI" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Temperature Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={historicalData.temperature}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#0D7377" strokeWidth={2} name="Temperature (°C)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Humidity Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={historicalData.humidity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#14A085" strokeWidth={2} name="Humidity (%)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Agent Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2 text-health-teal" />
                Environment Agent Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-health-charcoal">{agentStatus.name}</p>
                  <p className="text-sm text-health-blue-gray">Status: {agentStatus.status}</p>
                  <p className="text-xs text-health-blue-gray mt-1">Data Sources: {agentStatus.sources.join(', ')}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-health-teal">{agentStatus.dataPoints.toLocaleString()}</p>
                  <p className="text-xs text-health-blue-gray">Data Points</p>
                  <p className="text-xs text-health-blue-gray mt-1">Last update: {agentStatus.lastUpdate}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Air Quality Tab */}
        <TabsContent value="air-quality" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Air Quality Index History</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={historicalData.aqi}>
                  <defs>
                    <linearGradient id="colorAqiFull" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0D7377" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#0D7377" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#0D7377" fillOpacity={1} fill="url(#colorAqiFull)" name="AQI" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Climate Tab */}
        <TabsContent value="climate" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Temperature History</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={historicalData.temperature}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#0D7377" strokeWidth={2} name="Temperature (°C)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Humidity History</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={historicalData.humidity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#0D7377" strokeWidth={2} name="Humidity (%)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Regional Tab */}
        <TabsContent value="regional" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Regional Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {regionalComparison.map((region, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-health-charcoal">{region.region}</span>
                      <Badge className={`${getRiskColor(region.healthRisk)} text-white`}>{region.healthRisk.toUpperCase()}</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-health-blue-gray">AQI</span>
                        <span className="font-medium">{region.aqi}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-health-blue-gray">Temp</span>
                        <span className="font-medium">{region.temperature}°C</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-health-blue-gray">Humidity</span>
                        <span className="font-medium">{region.humidity}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <div className="space-y-4">
            {alerts.length > 0 ? (
              alerts.map((alert, index) => (
                <Alert
                  key={index}
                  className={
                    alert.severity === 'high'
                      ? 'border-health-danger'
                      : alert.severity === 'medium'
                        ? 'border-health-warning'
                        : 'border-health-aqua'
                  }
                >
                  <AlertTriangle
                    className={`h-4 w-4 ${alert.severity === 'high' ? 'text-health-danger' : alert.severity === 'medium' ? 'text-health-warning' : 'text-health-aqua'
                      }`}
                  />
                  <AlertDescription>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{alert.message}</span>
                      <Badge className={`${getRiskColor(alert.severity)} text-white`}>{alert.severity.toUpperCase()}</Badge>
                    </div>
                    <p className="text-sm text-health-blue-gray mt-1">{alert.recommendation}</p>
                    <p className="text-xs text-health-blue-gray mt-2">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </AlertDescription>
                </Alert>
              ))
            ) : (
              <Alert>
                <AlertDescription>No active alerts at this time.</AlertDescription>
              </Alert>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnvironmentDashboard;

