
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Server, 
  Database, 
  Activity, 
  Cpu, 
  HardDrive, 
  MemoryStick,
  Network,
  Shield,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  TrendingUp,
  Clock,
  Zap,
  Globe,
  Lock
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';

const AdminSystemHealth = () => {
  const [refreshing, setRefreshing] = useState(false);

  const systemMetrics = [
    {
      name: 'CPU Usage',
      value: 45,
      status: 'healthy',
      icon: Cpu,
      unit: '%',
      trend: '+2%'
    },
    {
      name: 'Memory Usage',
      value: 67,
      status: 'warning',
      icon: MemoryStick,
      unit: '%',
      trend: '+5%'
    },
    {
      name: 'Disk Usage',
      value: 23,
      status: 'healthy',
      icon: HardDrive,
      unit: '%',
      trend: '+1%'
    },
    {
      name: 'Network I/O',
      value: 34,
      status: 'healthy',
      icon: Network,
      unit: 'MB/s',
      trend: '-3%'
    }
  ];

  const services = [
    {
      name: 'API Gateway',
      status: 'running',
      uptime: '99.9%',
      responseTime: '45ms',
      lastCheck: '30 seconds ago',
      port: 3000
    },
    {
      name: 'Database',
      status: 'running',
      uptime: '99.8%',
      responseTime: '12ms',
      lastCheck: '1 minute ago',
      port: 5432
    },
    {
      name: 'Authentication Service',
      status: 'running',
      uptime: '99.9%',
      responseTime: '23ms',
      lastCheck: '45 seconds ago',
      port: 8080
    },
    {
      name: 'File Storage',
      status: 'warning',
      uptime: '97.2%',
      responseTime: '156ms',
      lastCheck: '2 minutes ago',
      port: 9000
    },
    {
      name: 'Email Service',
      status: 'running',
      uptime: '98.5%',
      responseTime: '78ms',
      lastCheck: '1 minute ago',
      port: 587
    },
    {
      name: 'Encryption Service',
      status: 'running',
      uptime: '99.5%',
      responseTime: '34ms',
      lastCheck: '30 seconds ago',
      port: 8443
    }
  ];

  const performanceData = [
    { time: '00:00', cpu: 30, memory: 45, network: 20 },
    { time: '04:00', cpu: 25, memory: 42, network: 15 },
    { time: '08:00', cpu: 55, memory: 65, network: 45 },
    { time: '12:00', cpu: 45, memory: 67, network: 34 },
    { time: '16:00', cpu: 38, memory: 58, network: 28 },
    { time: '20:00', cpu: 42, memory: 62, network: 32 },
    { time: '24:00', cpu: 35, memory: 50, network: 25 }
  ];

  const alertsData = [
    {
      id: 1,
      severity: 'warning',
      message: 'Memory usage above 65% threshold',
      service: 'Application Server',
      timestamp: '2024-06-04 14:30:00',
      resolved: false
    },
    {
      id: 2,
      severity: 'info',
      message: 'Database backup completed successfully',
      service: 'Database',
      timestamp: '2024-06-04 14:00:00',
      resolved: true
    },
    {
      id: 3,
      severity: 'warning',
      message: 'File storage response time degraded',
      service: 'File Storage',
      timestamp: '2024-06-04 13:45:00',
      resolved: false
    },
    {
      id: 4,
      severity: 'critical',
      message: 'SSL certificate expires in 7 days',
      service: 'Security',
      timestamp: '2024-06-04 13:00:00',
      resolved: false
    },
    {
      id: 5,
      severity: 'info',
      message: 'System update completed',
      service: 'System',
      timestamp: '2024-06-04 12:00:00',
      resolved: true
    }
  ];

  const databaseMetrics = [
    { name: 'Total Size', value: '2.4 GB', status: 'normal' },
    { name: 'Active Connections', value: '342', status: 'normal' },
    { name: 'Queries/sec', value: '1,247', status: 'normal' },
    { name: 'Cache Hit Ratio', value: '94.2%', status: 'good' },
    { name: 'Slow Queries', value: '12', status: 'warning' },
    { name: 'Deadlocks', value: '0', status: 'good' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'running':
      case 'healthy':
      case 'good':
      case 'normal':
        return 'bg-health-success text-white';
      case 'warning':
        return 'bg-health-warning text-white';
      case 'critical':
      case 'error':
        return 'bg-health-danger text-white';
      case 'info':
        return 'bg-health-aqua text-white';
      default:
        return 'bg-health-blue-gray text-white';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-health-danger" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-health-warning" />;
      case 'info':
        return <CheckCircle className="h-4 w-4 text-health-aqua" />;
      default:
        return <CheckCircle className="h-4 w-4 text-health-success" />;
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-montserrat font-bold text-health-teal">System Health Monitor</h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm">
            <TrendingUp className="h-4 w-4 mr-2" />
            View Reports
          </Button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Icon className="h-6 w-6 text-health-teal" />
                  <Badge className={getStatusColor(metric.status)}>
                    {metric.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-health-charcoal">{metric.name}</p>
                  <div className="flex items-center space-x-2">
                    <Progress value={metric.value} className="flex-1" />
                    <span className="text-lg font-bold text-health-teal">
                      {metric.value}{metric.unit}
                    </span>
                  </div>
                  <p className="text-xs text-health-blue-gray">
                    {metric.trend} from last hour
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="services" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Server className="h-5 w-5 mr-2 text-health-teal" />
                Service Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-health-blue-gray/20">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        service.status === 'running' ? 'bg-health-success' :
                        service.status === 'warning' ? 'bg-health-warning' :
                        'bg-health-danger'
                      }`} />
                      <div>
                        <h3 className="font-semibold text-health-charcoal">{service.name}</h3>
                        <p className="text-sm text-health-blue-gray">Port: {service.port}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(service.status)}>
                        {service.status.toUpperCase()}
                      </Badge>
                      <div className="text-xs text-health-blue-gray mt-1">
                        <p>Uptime: {service.uptime}</p>
                        <p>Response: {service.responseTime}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2 text-health-teal" />
                Performance Metrics (Last 24 Hours)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="cpu" stroke="#0D7377" strokeWidth={2} name="CPU %" />
                  <Line type="monotone" dataKey="memory" stroke="#14A085" strokeWidth={2} name="Memory %" />
                  <Line type="monotone" dataKey="network" stroke="#39B982" strokeWidth={2} name="Network MB/s" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2 text-health-teal" />
                Database Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {databaseMetrics.map((metric, index) => (
                  <div key={index} className="p-4 rounded-lg border border-health-blue-gray/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-health-charcoal">{metric.name}</span>
                      <Badge className={getStatusColor(metric.status)}>
                        {metric.status}
                      </Badge>
                    </div>
                    <p className="text-xl font-bold text-health-teal mt-2">{metric.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-health-teal" />
                System Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alertsData.map((alert) => (
                  <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${
                    alert.severity === 'critical' ? 'border-health-danger bg-red-50' :
                    alert.severity === 'warning' ? 'border-health-warning bg-yellow-50' :
                    'border-health-aqua bg-blue-50'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {getSeverityIcon(alert.severity)}
                        <div>
                          <p className="font-medium text-health-charcoal">{alert.message}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-sm text-health-blue-gray">Service: {alert.service}</span>
                            <span className="text-sm text-health-blue-gray flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {alert.timestamp}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        {alert.resolved && (
                          <CheckCircle className="h-5 w-5 text-health-success" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-health-teal" />
                Security Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-health-teal">SSL Certificates</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-health-light-gray/50">
                      <span className="text-sm">Main Domain</span>
                      <Badge className="bg-health-success text-white">Valid</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-health-light-gray/50">
                      <span className="text-sm">API Gateway</span>
                      <Badge className="bg-health-warning text-white">Expires Soon</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-health-light-gray/50">
                      <span className="text-sm">Admin Panel</span>
                      <Badge className="bg-health-success text-white">Valid</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-health-teal">Security Scans</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-health-light-gray/50">
                      <span className="text-sm">Vulnerability Scan</span>
                      <Badge className="bg-health-success text-white">Clean</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-health-light-gray/50">
                      <span className="text-sm">Malware Scan</span>
                      <Badge className="bg-health-success text-white">Clean</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-health-light-gray/50">
                      <span className="text-sm">Intrusion Detection</span>
                      <Badge className="bg-health-success text-white">Active</Badge>
                    </div>
                  </div>
                </div>
              </div>
              
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  All security systems are operational. Last security scan completed 2 hours ago.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSystemHealth;
