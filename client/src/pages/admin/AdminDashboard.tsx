
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  Activity, 
  Shield, 
  Database, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Eye,
  FileText,
  Calendar,
  MapPin,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw,
  Download,
  Settings,
  Bell,
  UserCheck,
  UserX,
  FileCheck,
  FileX,
  Clock4,
  Zap,
  HardDrive,
  Network,
  Globe,
  Lock,
  Unlock,
  AlertCircle,
  Info,
  Plus,
  Minus,
  ArrowUp,
  ArrowDown,
  Equal,
  Cloud
} from 'lucide-react';
import { adminDashboardService, DashboardStats, MetricCategory } from '@/services/adminDashboardService';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminDashboardService.getDashboardStats();
      setStats(data);
      toast({
        title: "Dashboard Updated",
        description: "Latest statistics have been loaded successfully.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard statistics';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = async () => {
    setRefreshing(true);
    await fetchDashboardStats();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const getMetricIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      users: <Users className="h-4 w-4" />,
      activity: <Activity className="h-4 w-4" />,
      security: <Shield className="h-4 w-4" />,
      storage: <Database className="h-4 w-4" />,
      performance: <Zap className="h-4 w-4" />,
      audit: <FileText className="h-4 w-4" />,
      time: <Clock className="h-4 w-4" />,
      geographical: <Globe className="h-4 w-4" />,
      compliance: <CheckCircle className="h-4 w-4" />,
      system: <Settings className="h-4 w-4" />
    };
    return icons[category] || <BarChart3 className="h-4 w-4" />;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'healthy':
      case 'active':
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
      case 'inactive':
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <ArrowUp className="h-3 w-3 text-green-600" />;
    if (trend < 0) return <ArrowDown className="h-3 w-3 text-red-600" />;
    return <Equal className="h-3 w-3 text-gray-600" />;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const formatPercentage = (num: number) => `${num.toFixed(1)}%`;

  const MetricCard: React.FC<{ title: string; value: string | number; subtitle?: string; trend?: number; icon?: React.ReactNode; color?: string }> = ({ 
    title, 
    value, 
    subtitle, 
    trend, 
    icon, 
    color = "bg-blue-500" 
  }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className={`p-2 rounded-full ${color} text-white`}>
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        {trend !== undefined && (
          <div className="flex items-center mt-2 text-xs">
            {getTrendIcon(trend)}
            <span className={`ml-1 ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'}`}>
              {Math.abs(trend)}% from last month
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const StatusCard: React.FC<{ title: string; status: string; description?: string; icon?: React.ReactNode }> = ({ 
    title, 
    status, 
    description, 
    icon 
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <Badge className={getStatusColor(status)}>
          {status}
        </Badge>
        {description && (
          <p className="text-xs text-muted-foreground mt-2">{description}</p>
        )}
      </CardContent>
    </Card>
  );

  const ProgressCard: React.FC<{ title: string; value: number; max: number; subtitle?: string; color?: string }> = ({ 
    title, 
    value, 
    max, 
    subtitle, 
    color = "bg-blue-500" 
  }) => {
    const percentage = (value / max) * 100;
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {subtitle && <CardDescription className="text-xs">{subtitle}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{formatNumber(value)}</span>
              <span className="text-muted-foreground">{formatNumber(max)}</span>
            </div>
            <Progress value={percentage} className="h-2" />
            <p className="text-xs text-muted-foreground">{formatPercentage(percentage)} used</p>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2" 
              onClick={fetchDashboardStats}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>No dashboard data available.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            System overview and performance metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={refreshStats}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant="outline"
            onClick={() => adminDashboardService.exportDashboardStats()}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Users"
              value={formatNumber(stats.userStats?.totalUsers || 0)}
              subtitle="Active accounts"
              trend={stats.userStats?.userGrowthRate || 0}
              icon={<Users className="h-4 w-4" />}
              color="bg-blue-500"
            />
            <MetricCard
              title="Active Sessions"
              value={formatNumber(stats.activityStats?.activeSessions || 0)}
              subtitle="Current online users"
              trend={stats.activityStats?.sessionGrowthRate || 0}
              icon={<Activity className="h-4 w-4" />}
              color="bg-green-500"
            />
            <MetricCard
              title="System Health"
              value={stats.systemHealth?.overallHealth || 'Unknown'}
              subtitle="System status"
              icon={<Shield className="h-4 w-4" />}
              color="bg-purple-500"
            />
            <MetricCard
              title="Storage Used"
              value={formatNumber(stats.storageStats?.usedStorageGB || 0)}
              subtitle="GB of total storage"
              trend={stats.storageStats?.storageGrowthRate || 0}
              icon={<Database className="h-4 w-4" />}
              color="bg-orange-500"
            />
          </div>

          {/* System Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatusCard
              title="Database Status"
              status={stats.systemHealth?.databaseStatus || 'Unknown'}
              description="MongoDB connection health"
              icon={<Database className="h-4 w-4 text-muted-foreground" />}
            />
            <StatusCard
              title="API Status"
              status={stats.systemHealth?.apiStatus || 'Unknown'}
              description="REST API availability"
              icon={<Network className="h-4 w-4 text-muted-foreground" />}
            />
            <StatusCard
              title="Cloudinary Status"
              status={stats.systemHealth?.cloudinaryStatus || 'Unknown'}
              description="File storage service"
              icon={<Cloud className="h-4 w-4 text-muted-foreground" />}
            />
          </div>

          {/* Storage Progress */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProgressCard
              title="Storage Usage"
              value={stats.storageStats?.usedStorageGB || 0}
              max={stats.storageStats?.totalStorageGB || 100}
              subtitle="Cloudinary storage"
              color="bg-blue-500"
            />
            <ProgressCard
              title="Database Usage"
              value={stats.storageStats?.databaseSizeGB || 0}
              max={stats.storageStats?.databaseLimitGB || 10}
              subtitle="MongoDB storage"
              color="bg-green-500"
            />
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Users"
              value={formatNumber(stats.userStats?.totalUsers || 0)}
              subtitle="All registered users"
              icon={<Users className="h-4 w-4" />}
              color="bg-blue-500"
            />
            <MetricCard
              title="Active Users"
              value={formatNumber(stats.userStats?.activeUsers || 0)}
              subtitle="Users in last 30 days"
              icon={<UserCheck className="h-4 w-4" />}
              color="bg-green-500"
            />
            <MetricCard
              title="New Users"
              value={formatNumber(stats.userStats?.newUsersThisMonth || 0)}
              subtitle="Registered this month"
              icon={<Plus className="h-4 w-4" />}
              color="bg-purple-500"
            />
            <MetricCard
              title="Inactive Users"
              value={formatNumber(stats.userStats?.inactiveUsers || 0)}
              subtitle="No activity in 90 days"
              icon={<UserX className="h-4 w-4" />}
              color="bg-red-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>Monthly user registration trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>This Month</span>
                    <span className="font-medium">{formatNumber(stats.userStats?.newUsersThisMonth || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Month</span>
                    <span className="font-medium">{formatNumber(stats.userStats?.newUsersLastMonth || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Growth Rate</span>
                    <span className={`font-medium ${(stats.userStats?.userGrowthRate || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercentage(stats.userStats?.userGrowthRate || 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Types</CardTitle>
                <CardDescription>Distribution by user role</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Patients</span>
                    <span className="font-medium">{formatNumber(stats.userStats?.patientCount || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Doctors</span>
                    <span className="font-medium">{formatNumber(stats.userStats?.doctorCount || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Admins</span>
                    <span className="font-medium">{formatNumber(stats.userStats?.adminCount || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Insurance</span>
                    <span className="font-medium">{formatNumber(stats.userStats?.insuranceCount || 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="CPU Usage"
              value={formatPercentage(stats.performanceStats?.cpuUsage || 0)}
              subtitle="Current CPU load"
              icon={<Zap className="h-4 w-4" />}
              color="bg-blue-500"
            />
            <MetricCard
              title="Memory Usage"
              value={formatPercentage(stats.performanceStats?.memoryUsage || 0)}
              subtitle="RAM utilization"
              icon={<HardDrive className="h-4 w-4" />}
              color="bg-green-500"
            />
            <MetricCard
              title="Response Time"
              value={`${stats.performanceStats?.averageResponseTime || 0}ms`}
              subtitle="API response time"
              icon={<Clock4 className="h-4 w-4" />}
              color="bg-purple-500"
            />
            <MetricCard
              title="Uptime"
              value={`${stats.performanceStats?.uptimePercentage || 0}%`}
              subtitle="System availability"
              icon={<CheckCircle className="h-4 w-4" />}
              color="bg-orange-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProgressCard
              title="CPU Usage"
              value={stats.performanceStats?.cpuUsage || 0}
              max={100}
              subtitle="Processor utilization"
              color="bg-blue-500"
            />
            <ProgressCard
              title="Memory Usage"
              value={stats.performanceStats?.memoryUsage || 0}
              max={100}
              subtitle="RAM utilization"
              color="bg-green-500"
            />
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Failed Logins"
              value={formatNumber(stats.securityStats?.failedLoginAttempts || 0)}
              subtitle="Last 24 hours"
              icon={<Lock className="h-4 w-4" />}
              color="bg-red-500"
            />
            <MetricCard
              title="Active Sessions"
              value={formatNumber(stats.securityStats?.activeSessions || 0)}
              subtitle="Current sessions"
              icon={<Eye className="h-4 w-4" />}
              color="bg-green-500"
            />
            <MetricCard
              title="Security Alerts"
              value={formatNumber(stats.securityStats?.securityAlerts || 0)}
              subtitle="Active alerts"
              icon={<AlertTriangle className="h-4 w-4" />}
              color="bg-yellow-500"
            />
            <MetricCard
              title="Encrypted Data"
              value={formatPercentage(stats.securityStats?.encryptedDataPercentage || 0)}
              subtitle="Data encryption"
              icon={<Shield className="h-4 w-4" />}
              color="bg-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Status</CardTitle>
                <CardDescription>System security overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Two-Factor Auth</span>
                    <Badge className={stats.securityStats?.twoFactorEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {stats.securityStats?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>SSL Certificate</span>
                    <Badge className="bg-green-100 text-green-800">Valid</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Rate Limiting</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Virus Scanning</span>
                    <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Security Events</CardTitle>
                <CardDescription>Last 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Failed Logins</span>
                    <span className="font-medium">{formatNumber(stats.securityStats?.failedLoginAttempts || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Suspicious IPs</span>
                    <span className="font-medium">{formatNumber(stats.securityStats?.suspiciousIPs || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Blocked Requests</span>
                    <span className="font-medium">{formatNumber(stats.securityStats?.blockedRequests || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Security Alerts</span>
                    <span className="font-medium">{formatNumber(stats.securityStats?.securityAlerts || 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="API Requests"
              value={formatNumber(stats.performanceStats?.totalRequests || 0)}
              subtitle="Last 24 hours"
              icon={<Activity className="h-4 w-4" />}
              color="bg-blue-500"
            />
            <MetricCard
              title="Success Rate"
              value={formatPercentage(stats.performanceStats?.successRate || 0)}
              subtitle="API success rate"
              icon={<CheckCircle className="h-4 w-4" />}
              color="bg-green-500"
            />
            <MetricCard
              title="Error Rate"
              value={formatPercentage(stats.performanceStats?.errorRate || 0)}
              subtitle="API error rate"
              icon={<AlertCircle className="h-4 w-4" />}
              color="bg-red-500"
            />
            <MetricCard
              title="Cache Hit Rate"
              value={formatPercentage(stats.performanceStats?.cacheHitRate || 0)}
              subtitle="Database cache efficiency"
              icon={<Zap className="h-4 w-4" />}
              color="bg-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Response Time Distribution</CardTitle>
                <CardDescription>API response times</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Fast (&lt;100ms)</span>
                    <span className="font-medium">{formatPercentage(stats.performanceStats?.fastResponses || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Normal (100-500ms)</span>
                    <span className="font-medium">{formatPercentage(stats.performanceStats?.normalResponses || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Slow (&gt;500ms)</span>
                    <span className="font-medium">{formatPercentage(stats.performanceStats?.slowResponses || 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Database Performance</CardTitle>
                <CardDescription>MongoDB metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Query Count</span>
                    <span className="font-medium">{formatNumber(stats.performanceStats?.databaseQueries || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Avg Query Time</span>
                    <span className="font-medium">{stats.performanceStats?.averageQueryTime || 0}ms</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Connection Pool</span>
                    <span className="font-medium">{stats.performanceStats?.connectionPoolUsage || 0}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Audit Logs"
              value={formatNumber(stats.auditStats?.totalAuditLogs || 0)}
              subtitle="Total audit entries"
              icon={<FileText className="h-4 w-4" />}
              color="bg-blue-500"
            />
            <MetricCard
              title="Compliance Score"
              value={`${stats.complianceStats?.overallComplianceScore || 0}%`}
              subtitle="Overall compliance"
              icon={<CheckCircle className="h-4 w-4" />}
              color="bg-green-500"
            />
            <MetricCard
              title="Data Retention"
              value={formatPercentage(stats.complianceStats?.dataRetentionCompliance || 0)}
              subtitle="Retention compliance"
              icon={<Calendar className="h-4 w-4" />}
              color="bg-purple-500"
            />
            <MetricCard
              title="Privacy Violations"
              value={formatNumber(stats.complianceStats?.privacyViolations || 0)}
              subtitle="This month"
              icon={<AlertTriangle className="h-4 w-4" />}
              color="bg-red-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Status</CardTitle>
                <CardDescription>Regulatory compliance overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>HIPAA Compliance</span>
                    <Badge className="bg-green-100 text-green-800">Compliant</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>GDPR Compliance</span>
                    <Badge className="bg-green-100 text-green-800">Compliant</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Data Encryption</span>
                    <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Access Controls</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Audit Activity</CardTitle>
                <CardDescription>Recent audit events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Today's Logs</span>
                    <span className="font-medium">{formatNumber(stats.auditStats?.todayLogs || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>This Week</span>
                    <span className="font-medium">{formatNumber(stats.auditStats?.thisWeekLogs || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>This Month</span>
                    <span className="font-medium">{formatNumber(stats.auditStats?.thisMonthLogs || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Critical Events</span>
                    <span className="font-medium">{formatNumber(stats.auditStats?.criticalEvents || 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
