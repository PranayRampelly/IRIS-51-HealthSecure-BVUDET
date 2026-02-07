import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Sun,
  Droplets,
  Wind,
  Thermometer,
  Gauge,
  AlertTriangle,
  RefreshCw,
  MapPin,
  CloudRain,
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
  AreaChart,
  Area,
  ComposedChart,
  Bar,
} from 'recharts';

type ClimateData = Awaited<ReturnType<typeof bioAuraService.getClimateAnalysis>>;

const ClimateAnalysis: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [climateData, setClimateData] = useState<ClimateData | null>(null);
  const [selectedRegion, setSelectedRegion] = useState('Delhi');
  const [days, setDays] = useState('7');

  const loadClimate = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      // Always force fresh data from APIs for real-time updates
      const data = await bioAuraService.getClimateAnalysis({
        region: selectedRegion,
        days: parseInt(days),
        forceRefresh: true,
      });
      setClimateData(data);
    } catch (error) {
      console.error('Failed to load climate data:', error);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadClimate();
  }, [selectedRegion, days]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadClimate();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-health-teal mx-auto"></div>
          <p className="mt-4 text-health-blue-gray">Loading Climate Data...</p>
        </div>
      </div>
    );
  }

  if (!climateData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Failed to load climate data.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const { currentRegion, currentClimate, regionalClimate, historicalData, hourlyForecast, healthRecommendations } =
    climateData;

  return (
    <div className="space-y-6 bg-health-light-gray min-h-screen px-2 md:px-6 py-4 w-full">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-health-teal to-health-aqua rounded-lg p-6 mb-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Sun className="h-8 w-8 mr-3" />
              Climate Analysis
            </h1>
            <p className="text-white/90 mt-2">
              Comprehensive climate monitoring and health impact analysis
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-[150px] bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                {regionalClimate.map((region) => (
                  <SelectItem key={region.region} value={region.region}>
                    {region.region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Current Climate Card */}
      <Card className="bg-gradient-to-br from-health-teal to-health-aqua text-white border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Sun className="h-5 w-5" />
                <span className="text-sm font-medium opacity-90">Current Climate - {currentRegion}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="text-center">
                  <Thermometer className="h-6 w-6 mx-auto mb-2 opacity-90" />
                  <p className="text-3xl font-bold">{currentClimate.temperature}°C</p>
                  <p className="text-xs opacity-80">Temperature</p>
                  <p className="text-xs opacity-70 mt-1">Feels like {currentClimate.feelsLike}°C</p>
                </div>
                <div className="text-center">
                  <Droplets className="h-6 w-6 mx-auto mb-2 opacity-90" />
                  <p className="text-3xl font-bold">{currentClimate.humidity}%</p>
                  <p className="text-xs opacity-80">Humidity</p>
                </div>
                <div className="text-center">
                  <Wind className="h-6 w-6 mx-auto mb-2 opacity-90" />
                  <p className="text-3xl font-bold">{currentClimate.windSpeed}</p>
                  <p className="text-xs opacity-80">Wind Speed (km/h)</p>
                </div>
                <div className="text-center">
                  <Gauge className="h-6 w-6 mx-auto mb-2 opacity-90" />
                  <p className="text-3xl font-bold">{currentClimate.pressure}</p>
                  <p className="text-xs opacity-80">Pressure (hPa)</p>
                </div>
              </div>
            </div>
            <div className="text-center lg:text-right">
              <div className="text-sm opacity-80 mb-2">UV Index</div>
              <div className="text-4xl font-bold mb-2">{currentClimate.uvIndex}</div>
              <Badge
                className={
                  currentClimate.uvIndex > 7
                    ? 'bg-health-danger'
                    : currentClimate.uvIndex > 5
                      ? 'bg-health-warning'
                      : 'bg-health-success'
                }
              >
                {currentClimate.uvIndex > 7 ? 'Very High' : currentClimate.uvIndex > 5 ? 'Moderate' : 'Low'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card >

      {/* Health Recommendations */}
      {
        healthRecommendations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {healthRecommendations.map((rec, index) => (
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
                  <div className="font-semibold mb-1">{rec.message}</div>
                  <p className="text-sm text-health-blue-gray">{rec.advice}</p>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )
      }

      {/* Historical Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Temperature History</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
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
            <CardTitle>Humidity History</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={historicalData.humidity}>
                <defs>
                  <linearGradient id="colorHumidity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D7377" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#0D7377" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#0D7377" fillOpacity={1} fill="url(#colorHumidity)" name="Humidity (%)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pressure History</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={historicalData.pressure}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#0D7377" strokeWidth={2} name="Pressure (hPa)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Hourly Forecast */}
      <Card>
        <CardHeader>
          <CardTitle>24-Hour Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={hourlyForecast}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Bar yAxisId="right" dataKey="precipitation" fill="#0D7377" name="Precipitation (mm)" />
              <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#0D7377" strokeWidth={2} name="Temperature (°C)" />
              <Line yAxisId="left" type="monotone" dataKey="humidity" stroke="#14A085" strokeWidth={2} name="Humidity (%)" />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Regional Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Regional Climate Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regionalClimate.map((region, index) => (
              <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-health-charcoal">{region.region}</span>
                  <MapPin className="h-4 w-4 text-health-blue-gray" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1">
                      <Thermometer className="h-4 w-4 text-health-aqua" />
                      <span className="text-health-blue-gray">Temp</span>
                    </div>
                    <span className="font-medium">{region.temperature}°C</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1">
                      <Droplets className="h-4 w-4 text-health-aqua" />
                      <span className="text-health-blue-gray">Humidity</span>
                    </div>
                    <span className="font-medium">{region.humidity}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1">
                      <Wind className="h-4 w-4 text-health-aqua" />
                      <span className="text-health-blue-gray">Wind</span>
                    </div>
                    <span className="font-medium">{region.windSpeed} km/h</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1">
                      <Gauge className="h-4 w-4 text-health-aqua" />
                      <span className="text-health-blue-gray">Pressure</span>
                    </div>
                    <span className="font-medium">{region.pressure} hPa</span>
                  </div>
                  <div className="flex items-center justify-between text-sm pt-2 border-t">
                    <span className="text-health-blue-gray">UV Index</span>
                    <Badge
                      className={
                        region.uvIndex > 7
                          ? 'bg-health-danger'
                          : region.uvIndex > 5
                            ? 'bg-health-warning'
                            : 'bg-health-success'
                      }
                    >
                      {region.uvIndex}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div >
  );
};

export default ClimateAnalysis;

