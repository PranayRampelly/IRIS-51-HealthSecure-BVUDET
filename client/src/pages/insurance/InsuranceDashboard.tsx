
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import {
  FileText,
  Shield,
  DollarSign,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Activity
} from 'lucide-react';
import insuranceDashboardService, {
  KeyMetrics,
  RevenueTrend,
  PolicyDistribution,
  ClaimsAnalytics,
  CustomerDemographics
} from '@/services/insuranceDashboardService';

const InsuranceDashboard = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<KeyMetrics | null>(null);
  const [revenueTrends, setRevenueTrends] = useState<RevenueTrend | null>(null);
  const [policyDistribution, setPolicyDistribution] = useState<PolicyDistribution | null>(null);
  const [claimsAnalytics, setClaimsAnalytics] = useState<ClaimsAnalytics | null>(null);
  const [demographics, setDemographics] = useState<CustomerDemographics | null>(null);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [
        metricsData,
        trendsData,
        distributionData,
        analyticsData,
        demographicsData
      ] = await Promise.all([
        insuranceDashboardService.getKeyMetrics(),
        insuranceDashboardService.getRevenueTrends(),
        insuranceDashboardService.getPolicyDistribution(),
        insuranceDashboardService.getClaimsAnalytics(),
        insuranceDashboardService.getCustomerDemographics()
      ]);

      setMetrics(metricsData);
      setRevenueTrends(trendsData);
      setPolicyDistribution(distributionData);
      setClaimsAnalytics(analyticsData);
      setDemographics(demographicsData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const getTrendIcon = (value: number) => {
    if (value > 0) return <ArrowUpRight className="w-4 h-4 text-health-success" />;
    if (value < 0) return <ArrowDownRight className="w-4 h-4 text-health-danger" />;
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-montserrat font-bold text-health-teal">Insurance Dashboard</h1>
          <p className="text-health-charcoal mt-2">Overview of insurance operations and performance metrics</p>
        </div>
        <Button
          variant="outline"
          className="border-health-teal text-health-teal hover:bg-health-teal hover:text-white"
          onClick={loadDashboardData}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-health-charcoal">Total Policies</p>
                <p className="text-3xl font-bold text-health-teal">
                  {loading ? '...' : metrics?.totalPolicies}
                </p>
                <div className="flex items-center text-xs text-health-success">
                  <span>{insuranceDashboardService.formatPercentage(metrics?.policyUtilization || 0)} active</span>
                </div>
              </div>
              <div className="p-3 bg-health-teal/10 rounded-full">
                <FileText className="w-6 h-6 text-health-teal" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-health-charcoal">Total Claims</p>
                <p className="text-3xl font-bold text-health-success">
                  {loading ? '...' : metrics?.totalClaims}
                </p>
                <div className="flex items-center text-xs text-health-success">
                  <span>
                    {insuranceDashboardService.formatPercentage(metrics?.claimProcessingRate || 0)} processed
                  </span>
                </div>
              </div>
              <div className="p-3 bg-health-success/10 rounded-full">
                <Shield className="w-6 h-6 text-health-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-health-charcoal">Total Premium</p>
                <p className="text-3xl font-bold text-health-aqua">
                  {loading ? '...' : insuranceDashboardService.formatCurrency(metrics?.totalPremium || 0)}
                </p>
                <div className="flex items-center text-xs text-health-success">
                  <span>{insuranceDashboardService.formatPercentage(metrics?.profitMargin || 0)} margin</span>
                </div>
              </div>
              <div className="p-3 bg-health-aqua/10 rounded-full">
                <DollarSign className="w-6 h-6 text-health-aqua" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-health-charcoal">Processing Time</p>
                <p className="text-3xl font-bold text-health-warning">
                  {loading ? '...' : Math.round(claimsAnalytics?.processingTimes.avgProcessingTime || 0)}
                </p>
                <p className="text-xs text-health-charcoal/70">days average</p>
              </div>
              <div className="p-3 bg-health-warning/10 rounded-full">
                <Clock className="w-6 h-6 text-health-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={revenueTrends?.monthlyRevenue.map(item => ({
                  month: insuranceDashboardService.formatDate(new Date(item._id.year, item._id.month - 1)),
                  premium: item.premium,
                  policies: item.policies
                })) || []}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="premium"
                  stroke="#0EA5E9"
                  fill="#0EA5E9"
                  fillOpacity={0.1}
                  name="Premium"
                />
                <Area
                  type="monotone"
                  dataKey="policies"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.1}
                  name="Policies"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Policy Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Policy Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={policyDistribution?.policyTypes.map(item => ({
                    name: item._id,
                    value: item.count
                  })) || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {(policyDistribution?.policyTypes || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Claims Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>Claims Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={claimsAnalytics?.claimsByType.map(item => ({
                  type: item._id,
                  count: item.count,
                  amount: item.totalAmount
                })) || []}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#0EA5E9" name="Claims" />
                <Bar dataKey="amount" fill="#10B981" name="Amount" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Demographics */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Demographics</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={demographics?.ageDistribution.map(item => ({
                  age: item._id,
                  count: item.count
                })) || []}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="age" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#0EA5E9" name="Customers" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InsuranceDashboard;
