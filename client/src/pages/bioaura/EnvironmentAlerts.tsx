import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertTriangle,
  Cloud,
  Thermometer,
  Droplets,
  RefreshCw,
  Filter,
  MapPin,
  Clock,
} from 'lucide-react';
import bioAuraService from '@/services/bioAuraService';

type EnvironmentAlertsData = Awaited<ReturnType<typeof bioAuraService.getEnvironmentAlerts>>;

const EnvironmentAlerts: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [alertsData, setAlertsData] = useState<EnvironmentAlertsData | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');

  const loadAlerts = async (silent = false, forceRefresh = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      const params: { severity?: string; region?: string; forceRefresh?: boolean } = {};
      if (severityFilter !== 'all') params.severity = severityFilter;
      if (regionFilter !== 'all') params.region = regionFilter;
      // Only force refresh on manual refresh, not on automatic polling
      params.forceRefresh = forceRefresh;
      const data = await bioAuraService.getEnvironmentAlerts(params);
      setAlertsData(data);
    } catch (error) {
      console.error('Failed to load environment alerts:', error);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [severityFilter, regionFilter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAlerts(false, true); // Force refresh on manual refresh
    setRefreshing(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-700 border-red-700';
      case 'high':
        return 'bg-health-danger border-health-danger';
      case 'medium':
        return 'bg-health-warning border-health-warning';
      default:
        return 'bg-health-aqua border-health-aqua';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'air_quality':
        return <Cloud className="h-5 w-5" />;
      case 'temperature':
        return <Thermometer className="h-5 w-5" />;
      case 'humidity':
        return <Droplets className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-health-teal mx-auto"></div>
          <p className="mt-4 text-health-blue-gray">Loading Environment Alerts...</p>
        </div>
      </div>
    );
  }

  if (!alertsData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Failed to load environment alerts.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const { alerts, summary } = alertsData;
  const regions: string[] = Array.from(new Set(alerts.map((a) => a.region)));

  return (
    <div className="space-y-6 bg-health-light-gray min-h-screen px-2 md:px-6 py-4 w-full">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-health-teal to-health-aqua rounded-lg p-6 mb-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <AlertTriangle className="h-8 w-8 mr-3" />
              Environment Alerts
            </h1>
            <p className="text-white/90 mt-2">
              Real-time environmental health alerts and recommendations
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[150px] bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className="w-[150px] bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {regions.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-health-blue-gray">Total Alerts</p>
              <p className="text-3xl font-bold text-health-teal">{summary.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-health-blue-gray">Critical</p>
              <p className="text-3xl font-bold text-health-danger">{summary.critical}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-health-blue-gray">High</p>
              <p className="text-3xl font-bold text-health-danger">{summary.high}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-health-blue-gray">Medium</p>
              <p className="text-3xl font-bold text-health-warning">{summary.medium}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-health-blue-gray">Low</p>
              <p className="text-3xl font-bold text-health-aqua">{summary.low}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Alerts ({alerts.length})</TabsTrigger>
          <TabsTrigger value="air_quality">
            Air Quality ({alerts.filter((a) => a.type === 'air_quality').length})
          </TabsTrigger>
          <TabsTrigger value="temperature">
            Temperature ({alerts.filter((a) => a.type === 'temperature').length})
          </TabsTrigger>
          <TabsTrigger value="humidity">
            Humidity ({alerts.filter((a) => a.type === 'humidity').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {alerts.length > 0 ? (
            alerts.map((alert) => (
              <Alert
                key={alert.id}
                className={`${getSeverityColor(alert.severity)} text-white border-0`}
              >
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5">{getTypeIcon(alert.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-lg">{alert.message}</span>
                        <Badge className="bg-white/20 text-white border-white/30">
                          {alert.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2 text-sm opacity-90">
                        <MapPin className="h-4 w-4" />
                        <span>{alert.region}</span>
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3 mt-2 mb-2">
                      <p className="text-sm font-medium mb-1">Details:</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        {Object.entries(alert.details).map(([key, value]) => (
                          <div key={key}>
                            <span className="opacity-80">{key}:</span> <span className="font-medium">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm opacity-90 mb-2">
                      <strong>Recommendation:</strong> {alert.recommendation}
                    </p>
                    <div className="flex items-center space-x-1 text-xs opacity-80">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(alert.timestamp).toLocaleString()}</span>
                      <span className="mx-2">•</span>
                      <span>Status: {alert.status}</span>
                    </div>
                  </div>
                </div>
              </Alert>
            ))
          ) : (
            <Alert>
              <AlertDescription>No alerts found matching the current filters.</AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="air_quality" className="space-y-4">
          {alerts
            .filter((a) => a.type === 'air_quality')
            .map((alert) => (
              <Alert
                key={alert.id}
                className={`${getSeverityColor(alert.severity)} text-white border-0`}
              >
                <div className="flex items-start space-x-3">
                  <Cloud className="h-5 w-5 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-lg">{alert.message}</span>
                      <Badge className="bg-white/20 text-white">{alert.severity.toUpperCase()}</Badge>
                    </div>
                    <p className="text-sm opacity-90 mb-2">{alert.recommendation}</p>
                    <p className="text-xs opacity-80">{new Date(alert.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              </Alert>
            ))}
        </TabsContent>

        <TabsContent value="temperature" className="space-y-4">
          {alerts
            .filter((a) => a.type === 'temperature')
            .map((alert) => (
              <Alert
                key={alert.id}
                className={`${getSeverityColor(alert.severity)} text-white border-0`}
              >
                <div className="flex items-start space-x-3">
                  <Thermometer className="h-5 w-5 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-lg">{alert.message}</span>
                      <Badge className="bg-white/20 text-white">{alert.severity.toUpperCase()}</Badge>
                    </div>
                    <p className="text-sm opacity-90 mb-2">{alert.recommendation}</p>
                    <p className="text-xs opacity-80">{new Date(alert.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              </Alert>
            ))}
        </TabsContent>

        <TabsContent value="humidity" className="space-y-4">
          {alerts
            .filter((a) => a.type === 'humidity')
            .map((alert) => (
              <Alert
                key={alert.id}
                className={`${getSeverityColor(alert.severity)} text-white border-0`}
              >
                <div className="flex items-start space-x-3">
                  <Droplets className="h-5 w-5 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-lg">{alert.message}</span>
                      <Badge className="bg-white/20 text-white">{alert.severity.toUpperCase()}</Badge>
                    </div>
                    <p className="text-sm opacity-90 mb-2">{alert.recommendation}</p>
                    <p className="text-xs opacity-80">{new Date(alert.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              </Alert>
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnvironmentAlerts;

