import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Cloud,
  AlertTriangle,
  RefreshCw,
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
  AreaChart,
  Area,
  ComposedChart,
  Bar,
} from 'recharts';

type PollutionTrendsData = Awaited<ReturnType<typeof bioAuraService.getPollutionTrends>>;

const PollutionTrends: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [trendsData, setTrendsData] = useState<PollutionTrendsData | null>(null);
  const [selectedRegion, setSelectedRegion] = useState('Delhi');
  const [days, setDays] = useState('30');

  const loadTrends = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      // Always force fresh data from APIs for real-time updates
      const data = await bioAuraService.getPollutionTrends({
        region: selectedRegion,
        days: parseInt(days),
        forceRefresh: true,
      });
      setTrendsData(data);
    } catch (error) {
      console.error('Failed to load pollution trends:', error);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadTrends();
  }, [selectedRegion, days]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTrends();
    setRefreshing(false);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <Activity className="h-4 w-4 text-yellow-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-health-teal mx-auto"></div>
          <p className="mt-4 text-health-blue-gray">Loading Pollution Trends...</p>
        </div>
      </div>
    );
  }

  if (!trendsData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Failed to load pollution trends data.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const { currentRegion, pollutionTrends, pollutantBreakdown, seasonalPatterns } = trendsData;
  const selectedTrend = pollutionTrends.find((t) => t.region === selectedRegion) || pollutionTrends[0];

  return (
    <div className="space-y-6 bg-health-light-gray min-h-screen px-2 md:px-6 py-4 w-full">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-health-teal to-health-aqua rounded-lg p-6 mb-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Cloud className="h-8 w-8 mr-3" />
              Pollution Trends Analysis
            </h1>
            <p className="text-white/90 mt-2">
              Historical pollution patterns and seasonal analysis for predictive health insights
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-[150px] bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                {pollutionTrends.map((trend) => (
                  <SelectItem key={trend.region} value={trend.region}>
                    {trend.region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Pollution Trend Charts */}
      {selectedTrend && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>AQI Trend - {selectedTrend.region}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={selectedTrend.trend}>
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

          <Card>
            <CardHeader>
              <CardTitle>PM2.5 & PM10 Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={selectedTrend.trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="pm10" fill="#14A085" name="PM10" />
                  <Line type="monotone" dataKey="pm25" stroke="#0D7377" strokeWidth={2} name="PM2.5" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pollutant Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Pollutant Contribution Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pollutantBreakdown.map((pollutant, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-health-charcoal">{pollutant.name}</span>
                  {getTrendIcon(pollutant.trend)}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-health-blue-gray">Average</span>
                    <span className="font-medium">{pollutant.average} {pollutant.name === 'CO' ? 'ppm' : 'µg/m³'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-health-blue-gray">Contribution</span>
                    <span className="font-medium">{pollutant.contribution}%</span>
                  </div>
                  <div className="w-full bg-health-light-gray rounded-full h-2">
                    <div
                      className="bg-health-teal h-2 rounded-full"
                      style={{ width: `${pollutant.contribution}%` }}
                    ></div>
                  </div>
                  <Badge
                    className={
                      pollutant.trend === 'up'
                        ? 'bg-health-danger'
                        : pollutant.trend === 'down'
                          ? 'bg-health-success'
                          : 'bg-health-warning'
                    }
                  >
                    {pollutant.trend === 'up' ? 'Increasing' : pollutant.trend === 'down' ? 'Decreasing' : 'Stable'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Seasonal Patterns */}
      <Card>
        <CardHeader>
          <CardTitle>Seasonal Pollution Patterns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {seasonalPatterns.map((season, index) => (
              <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-health-charcoal">{season.season}</span>
                  <Badge className={season.avgAQI > 200 ? 'bg-health-danger' : season.avgAQI > 150 ? 'bg-orange-500' : 'bg-health-warning'}>
                    AQI {season.avgAQI}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-health-blue-gray">Average AQI</span>
                    <span className="font-medium">{season.avgAQI}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-health-blue-gray">Peak Days</span>
                    <span className="font-medium">{season.peakDays}</span>
                  </div>
                  <div className="w-full bg-health-light-gray rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full ${season.avgAQI > 200 ? 'bg-red-500' : season.avgAQI > 150 ? 'bg-orange-500' : 'bg-yellow-500'
                        }`}
                      style={{ width: `${(season.avgAQI / 300) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Regional Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Regional Pollution Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart
              data={pollutionTrends.map((trend) => ({
                region: trend.region,
                avgAQI: trend.trend.reduce((sum, d) => sum + d.aqi, 0) / trend.trend.length,
                maxAQI: Math.max(...trend.trend.map((d) => d.aqi)),
                minAQI: Math.min(...trend.trend.map((d) => d.aqi)),
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="region" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="avgAQI" fill="#0D7377" name="Average AQI" />
              <Line type="monotone" dataKey="maxAQI" stroke="#ff0000" strokeWidth={2} name="Max AQI" />
              <Line type="monotone" dataKey="minAQI" stroke="#14A085" strokeWidth={2} name="Min AQI" />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default PollutionTrends;

