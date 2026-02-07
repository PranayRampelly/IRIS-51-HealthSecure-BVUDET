import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  BarChart3, FileText, Download, Calendar, TrendingUp, TrendingDown,
  Eye, Plus, Search, Filter, RefreshCw, ArrowLeft, Users, Droplets,
  Heart, Shield, AlertTriangle, Clock, DollarSign, Activity,
  PieChart, LineChart, BarChart, Target, Award, Star, Clock3,
  AlertCircle, Truck, FileText as FileTextIcon, UserRound, Settings,
  ExternalLink, MessageSquare, PhoneCall, Video, Send, Printer,
  Share2, Mail, Database, ChartBar, PieChart as PieChartIcon,
  LineChart as LineChartIcon, BarChart as BarChartIcon, DownloadCloud
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ReportData {
  id: string;
  name: string;
  type: 'inventory' | 'donors' | 'requests' | 'quality' | 'financial' | 'compliance';
  format: 'pdf' | 'excel' | 'csv' | 'json';
  status: 'generating' | 'ready' | 'failed';
  createdAt: string;
  downloadUrl?: string;
  size?: string;
  description: string;
}

interface AnalyticsData {
  inventoryMetrics: {
    totalUnits: number;
    availableUnits: number;
    reservedUnits: number;
    expiringUnits: number;
    criticalStock: number;
  };
  donorMetrics: {
    totalDonors: number;
    activeDonors: number;
    newDonorsThisMonth: number;
    eligibleDonors: number;
    averageDonations: number;
  };
  requestMetrics: {
    totalRequests: number;
    pendingRequests: number;
    fulfilledRequests: number;
    urgentRequests: number;
    averageFulfillmentTime: number;
  };
  qualityMetrics: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    quarantineUnits: number;
    complianceRate: number;
  };
  financialMetrics: {
    totalRevenue: number;
    totalCosts: number;
    profitMargin: number;
    averageUnitCost: number;
    monthlyGrowth: number;
  };
}

const Reports: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [dateRange, setDateRange] = useState('30');
  const [reportType, setReportType] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for reports
  const mockReports: ReportData[] = [
    {
      id: '1',
      name: 'Monthly Inventory Report',
      type: 'inventory',
      format: 'pdf',
      status: 'ready',
      createdAt: '2024-01-15T10:00:00Z',
      downloadUrl: '/reports/inventory-jan-2024.pdf',
      size: '2.4 MB',
      description: 'Comprehensive monthly inventory analysis with stock levels, expiry dates, and critical alerts.'
    },
    {
      id: '2',
      name: 'Donor Analytics Report',
      type: 'donors',
      format: 'excel',
      status: 'ready',
      createdAt: '2024-01-14T15:30:00Z',
      downloadUrl: '/reports/donor-analytics-jan-2024.xlsx',
      size: '1.8 MB',
      description: 'Detailed donor statistics, eligibility analysis, and recruitment insights.'
    },
    {
      id: '3',
      name: 'Blood Request Summary',
      type: 'requests',
      format: 'csv',
      status: 'ready',
      createdAt: '2024-01-13T09:15:00Z',
      downloadUrl: '/reports/requests-summary-jan-2024.csv',
      size: '856 KB',
      description: 'Blood request patterns, fulfillment rates, and response time analysis.'
    },
    {
      id: '4',
      name: 'Quality Control Report',
      type: 'quality',
      format: 'pdf',
      status: 'ready',
      createdAt: '2024-01-12T14:20:00Z',
      downloadUrl: '/reports/quality-control-jan-2024.pdf',
      size: '3.2 MB',
      description: 'Quality test results, compliance metrics, and regulatory reporting.'
    },
    {
      id: '5',
      name: 'Financial Performance Report',
      type: 'financial',
      format: 'excel',
      status: 'ready',
      createdAt: '2024-01-11T11:45:00Z',
      downloadUrl: '/reports/financial-jan-2024.xlsx',
      size: '2.1 MB',
      description: 'Revenue analysis, cost breakdown, and profitability metrics.'
    },
    {
      id: '6',
      name: 'Compliance Audit Report',
      type: 'compliance',
      format: 'pdf',
      status: 'generating',
      createdAt: '2024-01-15T08:00:00Z',
      description: 'Regulatory compliance assessment and audit findings.'
    }
  ];

  const mockAnalytics: AnalyticsData = {
    inventoryMetrics: {
      totalUnits: 1247,
      availableUnits: 892,
      reservedUnits: 234,
      expiringUnits: 45,
      criticalStock: 12
    },
    donorMetrics: {
      totalDonors: 2847,
      activeDonors: 2156,
      newDonorsThisMonth: 89,
      eligibleDonors: 1892,
      averageDonations: 3.2
    },
    requestMetrics: {
      totalRequests: 456,
      pendingRequests: 23,
      fulfilledRequests: 433,
      urgentRequests: 67,
      averageFulfillmentTime: 2.4
    },
    qualityMetrics: {
      totalTests: 1247,
      passedTests: 1198,
      failedTests: 49,
      quarantineUnits: 23,
      complianceRate: 96.1
    },
    financialMetrics: {
      totalRevenue: 284750,
      totalCosts: 198520,
      profitMargin: 30.3,
      averageUnitCost: 159,
      monthlyGrowth: 12.5
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  };

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'inventory': return <Droplets className="w-4 h-4" />;
      case 'donors': return <Users className="w-4 h-4" />;
      case 'requests': return <Heart className="w-4 h-4" />;
      case 'quality': return <Shield className="w-4 h-4" />;
      case 'financial': return <DollarSign className="w-4 h-4" />;
      case 'compliance': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
      case 'generating': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf': return <FileText className="w-4 h-4 text-red-500" />;
      case 'excel': return <FileText className="w-4 h-4 text-green-500" />;
      case 'csv': return <FileText className="w-4 h-4 text-blue-500" />;
      case 'json': return <FileText className="w-4 h-4 text-purple-500" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const handleGenerateReport = (type: string) => {
    toast.success(`Generating ${type} report...`);
  };

  const handleDownloadReport = (report: ReportData) => {
    if (report.status === 'ready' && report.downloadUrl) {
      toast.success(`Downloading ${report.name}...`);
      // Simulate download
      const link = document.createElement('a');
      link.href = report.downloadUrl;
      link.download = report.name;
      link.click();
    } else {
      toast.error('Report not ready for download');
    }
  };

  const filteredReports = mockReports.filter(report => {
    const matchesType = reportType === 'all' || report.type === reportType;
    return matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/bloodbank/dashboard')}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600">Generate and view comprehensive blood bank reports</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={loadReports}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockReports.length}</div>
            <p className="text-xs text-muted-foreground">
              Available reports
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready Reports</CardTitle>
            <Download className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {mockReports.filter(r => r.status === 'ready').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Available for download
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Generating</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {mockReports.filter(r => r.status === 'generating').length}
            </div>
            <p className="text-xs text-muted-foreground">
              In progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockReports.filter(r => new Date(r.createdAt).getMonth() === new Date().getMonth()).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Reports generated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
            <DownloadCloud className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">1,247</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="exports">Exports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Droplets className="w-5 h-5 text-blue-500" />
                  <span>Inventory Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Units</span>
                  <span className="font-semibold">{mockAnalytics.inventoryMetrics.totalUnits.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Available</span>
                  <span className="font-semibold text-green-600">{mockAnalytics.inventoryMetrics.availableUnits.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Critical Stock</span>
                  <span className="font-semibold text-red-600">{mockAnalytics.inventoryMetrics.criticalStock}</span>
                </div>
                <Progress value={75} className="w-full" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-green-500" />
                  <span>Donor Statistics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Donors</span>
                  <span className="font-semibold">{mockAnalytics.donorMetrics.totalDonors.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Donors</span>
                  <span className="font-semibold text-green-600">{mockAnalytics.donorMetrics.activeDonors.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">New This Month</span>
                  <span className="font-semibold text-blue-600">+{mockAnalytics.donorMetrics.newDonorsThisMonth}</span>
                </div>
                <Progress value={76} className="w-full" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  <span>Request Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Requests</span>
                  <span className="font-semibold">{mockAnalytics.requestMetrics.totalRequests}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Fulfillment Rate</span>
                  <span className="font-semibold text-green-600">{Math.round((mockAnalytics.requestMetrics.fulfilledRequests / mockAnalytics.requestMetrics.totalRequests) * 100)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg Response Time</span>
                  <span className="font-semibold">{mockAnalytics.requestMetrics.averageFulfillmentTime}h</span>
                </div>
                <Progress value={95} className="w-full" />
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Report Generation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Button
                  variant="outline"
                  onClick={() => handleGenerateReport('inventory')}
                  className="flex flex-col items-center space-y-2 h-24"
                >
                  <Droplets className="w-6 h-6 text-blue-500" />
                  <span className="text-sm">Inventory</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleGenerateReport('donors')}
                  className="flex flex-col items-center space-y-2 h-24"
                >
                  <Users className="w-6 h-6 text-green-500" />
                  <span className="text-sm">Donors</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleGenerateReport('requests')}
                  className="flex flex-col items-center space-y-2 h-24"
                >
                  <Heart className="w-6 h-6 text-red-500" />
                  <span className="text-sm">Requests</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleGenerateReport('quality')}
                  className="flex flex-col items-center space-y-2 h-24"
                >
                  <Shield className="w-6 h-6 text-purple-500" />
                  <span className="text-sm">Quality</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleGenerateReport('financial')}
                  className="flex flex-col items-center space-y-2 h-24"
                >
                  <DollarSign className="w-6 h-6 text-green-600" />
                  <span className="text-sm">Financial</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleGenerateReport('compliance')}
                  className="flex flex-col items-center space-y-2 h-24"
                >
                  <FileText className="w-6 h-6 text-orange-500" />
                  <span className="text-sm">Compliance</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search reports..."
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="inventory">Inventory</SelectItem>
                  <SelectItem value="donors">Donors</SelectItem>
                  <SelectItem value="requests">Requests</SelectItem>
                  <SelectItem value="quality">Quality</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reports Table */}
          <Card>
            <CardHeader>
              <CardTitle>Generated Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div>
                          <div className="font-medium">{report.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {report.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getReportTypeIcon(report.type)}
                          <span className="capitalize">{report.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getFormatIcon(report.format)}
                          <span className="uppercase">{report.format}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(report.createdAt).toLocaleDateString()}</div>
                          <div className="text-gray-500">
                            {new Date(report.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {report.size || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedReport(report)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {report.status === 'ready' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadReport(report)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {/* Financial Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${mockAnalytics.financialMetrics.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +{mockAnalytics.financialMetrics.monthlyGrowth}% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
                <Target className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockAnalytics.financialMetrics.profitMargin}%</div>
                <p className="text-xs text-muted-foreground">
                  Net profit margin
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quality Compliance</CardTitle>
                <Shield className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockAnalytics.qualityMetrics.complianceRate}%</div>
                <p className="text-xs text-muted-foreground">
                  Regulatory compliance rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockAnalytics.requestMetrics.averageFulfillmentTime}h</div>
                <p className="text-xs text-muted-foreground">
                  Average request fulfillment
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Placeholder */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart className="w-5 h-5 text-blue-500" />
                  <span>Blood Type Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Chart visualization would be here</p>
                    <p className="text-sm text-gray-400">Blood type distribution over time</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <LineChart className="w-5 h-5 text-green-500" />
                  <span>Donation Trends</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <LineChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Chart visualization would be here</p>
                    <p className="text-sm text-gray-400">Monthly donation trends</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Exports Tab */}
        <TabsContent value="exports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Exports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Database className="w-5 h-5 text-blue-500" />
                    <h3 className="font-semibold">Inventory Data</h3>
                  </div>
                  <p className="text-sm text-gray-600">Export complete inventory data with all details</p>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">CSV</Button>
                    <Button size="sm" variant="outline">Excel</Button>
                    <Button size="sm" variant="outline">JSON</Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-green-500" />
                    <h3 className="font-semibold">Donor Records</h3>
                  </div>
                  <p className="text-sm text-gray-600">Export donor information and donation history</p>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">CSV</Button>
                    <Button size="sm" variant="outline">Excel</Button>
                    <Button size="sm" variant="outline">JSON</Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    <h3 className="font-semibold">Request History</h3>
                  </div>
                  <p className="text-sm text-gray-600">Export blood request and fulfillment data</p>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">CSV</Button>
                    <Button size="sm" variant="outline">Excel</Button>
                    <Button size="sm" variant="outline">JSON</Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-purple-500" />
                    <h3 className="font-semibold">Quality Tests</h3>
                  </div>
                  <p className="text-sm text-gray-600">Export quality control test results</p>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">CSV</Button>
                    <Button size="sm" variant="outline">Excel</Button>
                    <Button size="sm" variant="outline">JSON</Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold">Financial Data</h3>
                  </div>
                  <p className="text-sm text-gray-600">Export financial transactions and reports</p>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">CSV</Button>
                    <Button size="sm" variant="outline">Excel</Button>
                    <Button size="sm" variant="outline">JSON</Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-orange-500" />
                    <h3 className="font-semibold">Audit Logs</h3>
                  </div>
                  <p className="text-sm text-gray-600">Export system audit and activity logs</p>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">CSV</Button>
                    <Button size="sm" variant="outline">Excel</Button>
                    <Button size="sm" variant="outline">JSON</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Report Details Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-2xl">
          {selectedReport && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  {getReportTypeIcon(selectedReport.type)}
                  <span>{selectedReport.name}</span>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Report Type</Label>
                    <div className="flex items-center space-x-2">
                      {getReportTypeIcon(selectedReport.type)}
                      <span className="capitalize">{selectedReport.type}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Format</Label>
                    <div className="flex items-center space-x-2">
                      {getFormatIcon(selectedReport.format)}
                      <span className="uppercase">{selectedReport.format}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge className={getStatusColor(selectedReport.status)}>
                      {selectedReport.status}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">File Size</Label>
                    <span>{selectedReport.size || 'Calculating...'}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-gray-700">{selectedReport.description}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Created</Label>
                  <p className="text-gray-700">
                    {new Date(selectedReport.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    {selectedReport.status === 'ready' && (
                      <Button onClick={() => handleDownloadReport(selectedReport)}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    )}
                    <Button variant="outline">
                      <Printer className="w-4 h-4 mr-2" />
                      Print
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="outline">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <Button variant="outline">
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reports;
