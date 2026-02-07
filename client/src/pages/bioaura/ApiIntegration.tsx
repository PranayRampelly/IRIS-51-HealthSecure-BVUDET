import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Cloud,
  CheckCircle,
  XCircle,
  RefreshCw,
  Activity,
  Server,
  Database,
  Shield,
  Zap,
  TrendingUp,
  AlertTriangle,
  Clock,
  Globe,
  Key,
  Webhook,
  TestTube,
  FileText,
  Download,
  Settings,
  BarChart3,
} from 'lucide-react';
import bioAuraService from '@/services/bioAuraService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface ApiEndpoint {
  name: string;
  path: string;
  method: string;
  status: 'active' | 'inactive' | 'error';
  lastChecked: string;
  responseTime?: number;
  description: string;
  error?: string | null;
}

interface ApiIntegrationData {
  overallStatus: 'healthy' | 'degraded' | 'down';
  endpoints: ApiEndpoint[];
  dataSources: {
    pharmacies: { total: number; connected: number; recent: number; status: string };
    hospitals: { total: number; connected: number; status: string };
    orders: { total: number; last24Hours: number; last30Days: number };
    inventory: { totalItems: number };
  };
  performance: {
    averageResponseTime: number;
    uptime: string;
    successRate: string;
    totalRequests: number;
  };
  security: {
    authentication: string;
    encryption: string;
    rateLimiting: string;
    apiKeys: string;
  };
  usageData?: Array<{ date: string; requests: number; errors: number; avgResponseTime: number }>;
  lastUpdated: string;
}

interface ApiKey {
  _id: string;
  name: string;
  key?: string;
  permissions: string[];
  endpoints: string[];
  rateLimit: number;
  status: string;
  expiresAt?: string;
  createdAt: string;
  lastUsed?: string;
  usageCount: number;
}

interface Webhook {
  _id: string;
  name: string;
  url: string;
  events: string[];
  status: string;
  secret?: string;
  lastTriggered?: string;
  lastResponse?: { statusCode: number; responseTime: number; error?: string };
  successCount: number;
  failureCount: number;
  createdAt: string;
}

const ApiIntegration: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ApiIntegrationData | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState('overview');
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [newApiKeyName, setNewApiKeyName] = useState('');
  const [newWebhookName, setNewWebhookName] = useState('');
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null);
  const [generatingKey, setGeneratingKey] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await bioAuraService.getApiIntegrationStatus();
      setData(response);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to load API integration status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    loadApiKeys();
    loadWebhooks();
  }, []);

  const loadApiKeys = async () => {
    try {
      const response = await bioAuraService.getApiKeys();
      setApiKeys(response.apiKeys || []);
    } catch (error) {
      console.error('Failed to load API keys:', error);
    }
  };

  const loadWebhooks = async () => {
    try {
      const response = await bioAuraService.getWebhooks();
      setWebhooks(response.webhooks || []);
    } catch (error) {
      console.error('Failed to load webhooks:', error);
    }
  };

  const handleGenerateApiKey = async () => {
    if (!newApiKeyName.trim()) {
      alert('Please enter a name for the API key');
      return;
    }
    try {
      setGeneratingKey(true);
      const response = await bioAuraService.createApiKey({
        name: newApiKeyName,
        permissions: ['read'],
        endpoints: [],
        rateLimit: 1000,
      });
      alert(`API Key created! Key: ${response.apiKey.key}\n\nPlease save this key - it won't be shown again.`);
      setNewApiKeyName('');
      await loadApiKeys();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create API key');
    } finally {
      setGeneratingKey(false);
    }
  };

  const handleRevokeApiKey = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this API key?')) return;
    try {
      await bioAuraService.revokeApiKey(id);
      await loadApiKeys();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to revoke API key');
    }
  };

  const handleDeleteApiKey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) return;
    try {
      await bioAuraService.deleteApiKey(id);
      await loadApiKeys();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete API key');
    }
  };

  const handleCreateWebhook = async () => {
    if (!newWebhookName.trim() || !newWebhookUrl.trim()) {
      alert('Please enter both name and URL for the webhook');
      return;
    }
    try {
      const response = await bioAuraService.createWebhook({
        name: newWebhookName,
        url: newWebhookUrl,
        events: ['order.created', 'inventory.low_stock'],
      });
      alert(`Webhook created! Secret: ${response.webhook.secret}\n\nPlease save this secret - it won't be shown again.`);
      setNewWebhookName('');
      setNewWebhookUrl('');
      await loadWebhooks();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create webhook');
    }
  };

  const handleTestWebhook = async (id: string) => {
    try {
      setTestingWebhook(id);
      const response = await bioAuraService.testWebhook(id);
      if (response.success) {
        alert(`Webhook test successful! Response time: ${response.responseTime}ms`);
      } else {
        alert(`Webhook test failed: ${response.message}`);
      }
      await loadWebhooks();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to test webhook');
    } finally {
      setTestingWebhook(null);
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return;
    try {
      await bioAuraService.deleteWebhook(id);
      await loadWebhooks();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete webhook');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'healthy':
      case 'connected':
        return 'text-health-success';
      case 'inactive':
      case 'degraded':
        return 'text-health-warning';
      case 'error':
      case 'down':
      case 'disconnected':
        return 'text-health-danger';
      default:
        return 'text-health-blue-gray';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
      case 'healthy':
      case 'connected':
        return <Badge className="bg-health-success text-white">Active</Badge>;
      case 'inactive':
      case 'degraded':
        return <Badge className="bg-health-warning text-white">Degraded</Badge>;
      case 'error':
      case 'down':
      case 'disconnected':
        return <Badge className="bg-health-danger text-white">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Format usage data for charts
  const usageData = data?.usageData?.map((day) => {
    try {
      const date = new Date(day.date);
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        requests: day.requests || 0,
        errors: day.errors || 0,
      };
    } catch {
      return {
        date: day.date,
        requests: day.requests || 0,
        errors: day.errors || 0,
      };
    }
  }) || [];

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-health-teal mx-auto"></div>
          <p className="mt-4 text-health-blue-gray">Loading API integration status...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-health-warning mx-auto mb-4" />
          <p className="text-health-blue-gray">Failed to load API integration status</p>
          <Button onClick={loadData} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-health-light-gray min-h-screen px-2 md:px-6 py-4 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-health-charcoal flex items-center">
            <Cloud className="h-8 w-8 mr-3 text-health-teal" />
            API Integration Status
          </h1>
          <p className="text-health-blue-gray mt-2">
            Monitor BioAura API endpoints and data integration health in real-time
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      <Card
        className={
          data.overallStatus === 'healthy'
            ? 'border-health-success border-2'
            : data.overallStatus === 'degraded'
              ? 'border-health-warning border-2'
              : 'border-health-danger border-2'
        }
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {data.overallStatus === 'healthy' ? (
                <CheckCircle className="h-12 w-12 text-health-success" />
              ) : data.overallStatus === 'degraded' ? (
                <Activity className="h-12 w-12 text-health-warning" />
              ) : (
                <XCircle className="h-12 w-12 text-health-danger" />
              )}
              <div>
                <h3 className="text-xl font-semibold text-health-charcoal">System Status</h3>
                <p className="text-health-blue-gray">
                  {data.overallStatus === 'healthy' && 'All systems operational'}
                  {data.overallStatus === 'degraded' && 'Some services experiencing issues'}
                  {data.overallStatus === 'down' && 'System unavailable'}
                </p>
                <p className="text-xs text-health-blue-gray mt-1">
                  Last updated: {new Date(data.lastUpdated).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              {getStatusBadge(data.overallStatus)}
              <p className="text-xs text-health-blue-gray mt-2">
                {data.endpoints.filter((e) => e.status === 'active').length} / {data.endpoints.length} endpoints active
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="data-sources">Data Sources</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-health-blue-gray">Active Endpoints</p>
                    <p className="text-2xl font-bold text-health-teal">
                      {data.endpoints.filter((e) => e.status === 'active').length}
                    </p>
                  </div>
                  <Server className="h-8 w-8 text-health-aqua" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-health-blue-gray">Avg Response Time</p>
                    <p className="text-2xl font-bold text-health-teal">{data.performance.averageResponseTime}ms</p>
                  </div>
                  <Zap className="h-8 w-8 text-health-aqua" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-health-blue-gray">Success Rate</p>
                    <p className="text-2xl font-bold text-health-success">{data.performance.successRate}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-health-success" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-health-blue-gray">Uptime</p>
                    <p className="text-2xl font-bold text-health-success">{data.performance.uptime}%</p>
                  </div>
                  <Activity className="h-8 w-8 text-health-success" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* API Usage Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-health-teal" />
                API Usage (Last 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {usageData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={usageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="requests" stroke="#0D7377" strokeWidth={2} name="Requests" />
                    <Line type="monotone" dataKey="errors" stroke="#ef4444" strokeWidth={2} name="Errors" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-health-blue-gray">
                  <p>No usage data available yet. Data will appear as API endpoints are used.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Endpoints Tab */}
        <TabsContent value="endpoints" className="space-y-4">
          <h2 className="text-xl font-semibold text-health-charcoal">API Endpoints</h2>
          {data.endpoints.map((endpoint, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Server className="h-5 w-5 text-health-teal" />
                      <CardTitle>{endpoint.name}</CardTitle>
                      {getStatusBadge(endpoint.status)}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-health-blue-gray">
                      <span className="flex items-center">
                        <Badge variant="outline" className="mr-2">
                          {endpoint.method}
                        </Badge>
                        <code className="text-xs bg-health-light-gray px-2 py-1 rounded">{endpoint.path}</code>
                      </span>
                      {endpoint.responseTime && (
                        <span className="flex items-center">
                          <Zap className="h-4 w-4 mr-1" />
                          {endpoint.responseTime}ms
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-health-blue-gray mb-4">{endpoint.description}</p>
                {endpoint.error && (
                  <div className="bg-health-danger/10 border border-health-danger rounded p-2 mb-4">
                    <p className="text-sm text-health-danger">Error: {endpoint.error}</p>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs text-health-blue-gray">
                  <span>Last checked: {new Date(endpoint.lastChecked).toLocaleString()}</span>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-2 h-2 rounded-full ${endpoint.status === 'active'
                        ? 'bg-health-success'
                        : endpoint.status === 'inactive'
                          ? 'bg-health-warning'
                          : 'bg-health-danger'
                        }`}
                    />
                    <span className={getStatusColor(endpoint.status)}>{endpoint.status}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Data Sources Tab */}
        <TabsContent value="data-sources" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2 text-health-teal" />
                  Data Sources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-health-light-gray rounded">
                    <div>
                      <p className="font-semibold text-health-charcoal">Pharmacies</p>
                      <p className="text-sm text-health-blue-gray">
                        {data.dataSources.pharmacies.connected} connected of {data.dataSources.pharmacies.total} total
                      </p>
                    </div>
                    {getStatusBadge(data.dataSources.pharmacies.status)}
                  </div>
                  <div className="flex items-center justify-between p-3 bg-health-light-gray rounded">
                    <div>
                      <p className="font-semibold text-health-charcoal">Hospitals</p>
                      <p className="text-sm text-health-blue-gray">
                        {data.dataSources.hospitals.connected} connected of {data.dataSources.hospitals.total} total
                      </p>
                    </div>
                    {getStatusBadge(data.dataSources.hospitals.status)}
                  </div>
                  <div className="p-3 bg-health-light-gray rounded">
                    <p className="font-semibold text-health-charcoal mb-2">Orders</p>
                    <div className="space-y-1 text-sm text-health-blue-gray">
                      <p>Total: {data.dataSources.orders.total.toLocaleString()}</p>
                      <p>Last 24h: {data.dataSources.orders.last24Hours.toLocaleString()}</p>
                      <p>Last 30d: {data.dataSources.orders.last30Days.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-health-light-gray rounded">
                    <p className="font-semibold text-health-charcoal mb-2">Inventory</p>
                    <p className="text-sm text-health-blue-gray">
                      {data.dataSources.inventory.totalItems.toLocaleString()} items tracked
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-health-teal" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-health-blue-gray">Average Response Time</span>
                    <span className="font-semibold text-health-teal">{data.performance.averageResponseTime}ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-health-blue-gray">Uptime</span>
                    <span className="font-semibold text-health-success">{data.performance.uptime}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-health-blue-gray">Success Rate</span>
                    <span className="font-semibold text-health-success">{data.performance.successRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-health-blue-gray">Total Requests (30d)</span>
                    <span className="font-semibold text-health-teal">
                      {data.performance.totalRequests.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-health-teal" />
                  Response Times
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={data.endpoints.map((e) => ({ name: e.name.split(' ')[0], time: e.responseTime || 0 }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="time" fill="#0D7377" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-health-teal" />
                  Security Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-health-blue-gray">Authentication</span>
                    <Badge className="bg-health-success">{data.security.authentication}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-health-blue-gray">Encryption</span>
                    <Badge className="bg-health-success">{data.security.encryption}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-health-blue-gray">Rate Limiting</span>
                    <Badge className="bg-health-success">{data.security.rateLimiting}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-health-blue-gray">API Keys</span>
                    <Badge className="bg-health-success">{data.security.apiKeys}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="h-5 w-5 mr-2 text-health-teal" />
                  API Key Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="new-api-key-name">Create New API Key</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="new-api-key-name"
                      value={newApiKeyName}
                      onChange={(e) => setNewApiKeyName(e.target.value)}
                      placeholder="Enter key name"
                    />
                    <Button onClick={handleGenerateApiKey} disabled={generatingKey}>
                      {generatingKey ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Generate'}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {apiKeys.map((key) => (
                    <div key={key._id} className="p-3 bg-health-light-gray rounded flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{key.name}</p>
                        <p className="text-xs text-health-blue-gray">
                          {key.permissions.join(', ')} • {key.usageCount} uses
                          {key.lastUsed && ` • Last used: ${new Date(key.lastUsed).toLocaleDateString()}`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {key.status === 'active' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRevokeApiKey(key._id)}
                          >
                            Revoke
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteApiKey(key._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                  {apiKeys.length === 0 && (
                    <p className="text-sm text-health-blue-gray text-center py-4">No API keys created yet</p>
                  )}
                </div>
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download API Documentation
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Webhook className="h-5 w-5 mr-2 text-health-teal" />
                  Webhook Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="new-webhook-name">Create New Webhook</Label>
                  <Input
                    id="new-webhook-name"
                    value={newWebhookName}
                    onChange={(e) => setNewWebhookName(e.target.value)}
                    placeholder="Webhook name"
                    className="mt-2 mb-2"
                  />
                  <div className="flex gap-2">
                    <Input
                      id="new-webhook-url"
                      value={newWebhookUrl}
                      onChange={(e) => setNewWebhookUrl(e.target.value)}
                      placeholder="https://example.com/webhook"
                    />
                    <Button onClick={handleCreateWebhook}>Create</Button>
                  </div>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {webhooks.map((webhook) => (
                    <div key={webhook._id} className="p-3 bg-health-light-gray rounded">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{webhook.name}</p>
                          <p className="text-xs text-health-blue-gray break-all">{webhook.url}</p>
                          <p className="text-xs text-health-blue-gray mt-1">
                            {webhook.successCount} success, {webhook.failureCount} failures
                            {webhook.lastTriggered && ` • Last: ${new Date(webhook.lastTriggered).toLocaleString()}`}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTestWebhook(webhook._id)}
                            disabled={testingWebhook === webhook._id}
                          >
                            {testingWebhook === webhook._id ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <TestTube className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteWebhook(webhook._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                      {webhook.lastResponse && (
                        <div className="mt-2 text-xs">
                          <span className={webhook.lastResponse.statusCode >= 200 && webhook.lastResponse.statusCode < 300 ? 'text-health-success' : 'text-health-danger'}>
                            Status: {webhook.lastResponse.statusCode} • {webhook.lastResponse.responseTime}ms
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                  {webhooks.length === 0 && (
                    <p className="text-sm text-health-blue-gray text-center py-4">No webhooks configured yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2 text-health-teal" />
                Integration Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-health-charcoal">Auto-refresh</p>
                  <p className="text-sm text-health-blue-gray">Automatically refresh status every 30 seconds</p>
                </div>
                <Badge className="bg-health-success">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-health-charcoal">Error Notifications</p>
                  <p className="text-sm text-health-blue-gray">Receive alerts when endpoints fail</p>
                </div>
                <Badge className="bg-health-success">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-health-charcoal">Performance Monitoring</p>
                  <p className="text-sm text-health-blue-gray">Track response times and uptime</p>
                </div>
                <Badge className="bg-health-success">Enabled</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApiIntegration;
