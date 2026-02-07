import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Cloud,
  AlertTriangle,
  RefreshCw,
  MapPin,
  TrendingUp,
  TrendingDown,
  Activity,
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

type AirQualityData = Awaited<ReturnType<typeof bioAuraService.getAirQualityMonitoring>>;

const AirQualityMonitoring: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [airQualityData, setAirQualityData] = useState<AirQualityData | null>(null);
  const [selectedRegion, setSelectedRegion] = useState('Delhi');
  const [days, setDays] = useState('7');
  const [availableRegions, setAvailableRegions] = useState<Array<{ name: string }>>([]);

  const loadAirQuality = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      // Always force fresh data from APIs for real-time updates
      const data = await bioAuraService.getAirQualityMonitoring({
        region: selectedRegion,
        days: parseInt(days),
        forceRefresh: true,
      });
      setAirQualityData(data);
    } catch (error) {
      console.error('Failed to load air quality data:', error);
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
          if (!selectedRegion || !data.regions.find((r: { name: string }) => r.name === selectedRegion)) {
            setSelectedRegion(data.regions[0].name);
          }
        }
      } catch (error) {
        console.error('Failed to load available regions:', error);
      }
    };
    loadRegions();
  }, []);

  useEffect(() => {
    if (availableRegions.length > 0 || airQualityData?.airQualityData) {
      loadAirQuality();
    }
  }, [selectedRegion, days, availableRegions.length]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAirQuality();
    setRefreshing(false);
  };

  const getAQIColor = (aqi: number) => {
    if (aqi > 300) return 'bg-red-700';
    if (aqi > 200) return 'bg-red-500';
    if (aqi > 150) return 'bg-orange-500';
    if (aqi > 100) return 'bg-health-warning';
    if (aqi > 50) return 'bg-yellow-300';
    return 'bg-health-success';
  };

  const getAQICategory = (aqi: number) => {
    if (aqi > 300) return 'Hazardous';
    if (aqi > 200) return 'Very Unhealthy';
    if (aqi > 150) return 'Unhealthy';
    if (aqi > 100) return 'Unhealthy for Sensitive Groups';
    if (aqi > 50) return 'Moderate';
    return 'Good';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-health-teal mx-auto"></div>
          <p className="mt-4 text-health-blue-gray">Loading Air Quality Data...</p>
        </div>
      </div>
    );
  }

  if (!airQualityData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Failed to load air quality data.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const { currentRegion, airQualityData: regionalData, historicalAQI, hourlyData, pollutants, dataSource, isRealData, source, lastUpdated } = airQualityData;
  const currentAQI = regionalData.find((r) => r.region === selectedRegion);

  return (
    <div className="space-y-6 bg-health-light-gray min-h-screen px-2 md:px-6 py-4 w-full">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-health-teal to-health-aqua rounded-lg p-6 mb-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Cloud className="h-8 w-8 mr-3" />
              Air Quality Monitoring
            </h1>
            <p className="text-white/90 mt-2 flex items-center gap-3 flex-wrap">
              Real-time air quality monitoring
              {airQualityData?.lastUpdated && (
                <span className="text-xs text-white/70">
                  Last: {new Date(airQualityData.lastUpdated).toLocaleTimeString()}
                </span>
              )}
              {airQualityData?.isRealData === false && (
                <span className="text-xs text-yellow-300 bg-yellow-500/20 px-2 py-1 rounded">
                  ⚠️ Using Fallback Data
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
                {(availableRegions.length > 0 ? availableRegions : regionalData).map((region) => (
                  <SelectItem key={region.name || region.region} value={region.name || region.region}>
                    {region.name || region.region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Current AQI Card */}
      {currentAQI && (
        <Card className="bg-gradient-to-br from-health-teal to-health-aqua text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Cloud className="h-5 w-5" />
                  <span className="text-sm font-medium opacity-90">Current Air Quality Index - {selectedRegion}</span>
                </div>
                <div className="flex items-baseline space-x-3 mb-4">
                  <span className="text-6xl font-bold">{currentAQI.aqi}</span>
                  <span className="text-2xl opacity-80">/ 500</span>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <Badge className={`${getAQIColor(currentAQI.aqi)} text-white text-sm px-3 py-1`}>
                    {currentAQI.category}
                  </Badge>
                  <Badge className={`${getAQIColor(currentAQI.healthRisk === 'high' ? 200 : currentAQI.healthRisk === 'medium' ? 100 : 50)} text-white`}>
                    {currentAQI.healthRisk.toUpperCase()} RISK
                  </Badge>
                  <div className="flex items-center space-x-1 text-sm opacity-90">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedRegion}</span>
                  </div>
                </div>
              </div>
              <div className="text-center lg:text-right">
                <div className="text-sm opacity-80 mb-2">Health Impact</div>
                <div className="text-2xl font-bold mb-2">
                  {currentAQI.aqi > 200 ? 'Severe' : currentAQI.aqi > 150 ? 'Unhealthy' : currentAQI.aqi > 100 ? 'Moderate' : 'Good'}
                </div>
                <Progress value={(currentAQI.aqi / 500) * 100} className="w-32 h-3 bg-white/20" />
              </div>
            </div>
          </CardContent>
        </Card>
      )
      }

      {/* Pollutant Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {pollutants.map((pollutant, index) => {
          const isExceeded = pollutant.value > pollutant.limit;
          return (
            <Card key={index} className="transition-all hover:shadow-lg">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-health-blue-gray mb-1 font-medium">{pollutant.name}</p>
                  <p className={`text-2xl font-bold transition-colors ${isExceeded ? 'text-red-500' : 'text-health-teal'}`}>
                    {typeof pollutant.value === 'number' ? pollutant.value.toFixed(1) : pollutant.value}
                  </p>
                  <p className="text-xs text-health-blue-gray">{pollutant.unit}</p>
                  <div className="mt-2">
                    <Progress
                      value={Math.min(100, (pollutant.value / pollutant.limit) * 100)}
                      className={`h-2 ${isExceeded ? 'bg-red-200' : ''}`}
                    />
                    <p className="text-xs text-health-blue-gray mt-1">Limit: {pollutant.limit}</p>
                  </div>
                  {isExceeded && (
                    <Badge className="bg-red-500 text-white mt-2 text-xs">Exceeded</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Historical AQI Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={historicalAQI}>
                <defs>
                  <linearGradient id="colorAQI" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D7377" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#0D7377" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="aqi" stroke="#0D7377" fillOpacity={1} fill="url(#colorAQI)" name="AQI" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Regional Comparison */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Regional Air Quality Comparison</CardTitle>
            {airQualityData?.source && (
              <Badge variant="outline" className="text-xs">
                Data Source: {airQualityData.source}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {regionalData.map((region, index) => (
              <div
                key={index}
                className={`p-4 border rounded-lg transition-all ${region.region === selectedRegion
                  ? 'border-health-teal border-2 shadow-lg bg-health-teal/5'
                  : 'hover:shadow-md'
                  }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-health-charcoal flex items-center gap-2">
                    {region.region === selectedRegion && (
                      <span className="w-2 h-2 bg-health-teal rounded-full animate-pulse"></span>
                    )}
                    {region.region}
                  </span>
                  <Badge className={getAQIColor(region.aqi)}>{region.aqi}</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-health-blue-gray">Category</span>
                    <span className="font-medium text-xs">{region.category}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-health-blue-gray">PM2.5</span>
                    <span className="font-medium">{typeof region.pm25 === 'number' ? region.pm25.toFixed(1) : region.pm25} µg/m³</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-health-blue-gray">PM10</span>
                    <span className="font-medium">{typeof region.pm10 === 'number' ? region.pm10.toFixed(1) : region.pm10} µg/m³</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-health-blue-gray">Risk</span>
                    <Badge
                      className={
                        region.healthRisk === 'high'
                          ? 'bg-health-danger'
                          : region.healthRisk === 'medium'
                            ? 'bg-health-warning'
                            : 'bg-health-success'
                      }
                    >
                      {region.healthRisk}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-health-blue-gray mt-2">
                  Updated: {new Date(region.lastUpdated).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div >
  );
};

export default AirQualityMonitoring;

