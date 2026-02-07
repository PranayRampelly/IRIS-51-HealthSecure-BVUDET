import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, TrendingUp, Users, Clock, 
  Calendar, Download, Filter, ArrowLeft,
  PieChart, Activity, Target, Award,
  TrendingDown, Eye, Star, Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Mock analytics data
const mockAnalytics = {
  overview: {
    totalTemplates: 24,
    totalRequests: 156,
    avgResponseTime: '1.8 days',
    successRate: 94.2,
    activeTemplates: 18,
    publicTemplates: 8
  },
  topTemplates: [
    { id: 'TEMPLATE-001', name: 'Insurance Claim Verification', usage: 45, successRate: 96.5, avgTime: '2.1 days' },
    { id: 'TEMPLATE-004', name: 'Routine Checkup', usage: 67, successRate: 98.2, avgTime: '1.2 days' },
    { id: 'TEMPLATE-002', name: 'Specialist Referral', usage: 23, successRate: 92.1, avgTime: '1.8 days' },
    { id: 'TEMPLATE-003', name: 'Emergency Room Transfer', usage: 12, successRate: 88.9, avgTime: '0.5 days' }
  ],
  monthlyUsage: [
    { month: 'Jan', requests: 45, templates: 12 },
    { month: 'Feb', requests: 52, templates: 15 },
    { month: 'Mar', requests: 38, templates: 11 },
    { month: 'Apr', requests: 61, templates: 18 },
    { month: 'May', requests: 48, templates: 14 },
    { month: 'Jun', requests: 55, templates: 16 }
  ],
  categoryBreakdown: [
    { category: 'Insurance', count: 8, percentage: 33.3 },
    { category: 'Referral', count: 6, percentage: 25.0 },
    { category: 'Emergency', count: 3, percentage: 12.5 },
    { category: 'Routine', count: 4, percentage: 16.7 },
    { category: 'Specialist', count: 2, percentage: 8.3 },
    { category: 'Follow-up', count: 1, percentage: 4.2 }
  ],
  performanceMetrics: {
    responseTime: {
      excellent: 45,
      good: 35,
      average: 15,
      poor: 5
    },
    patientSatisfaction: 4.6,
    completionRate: 87.3,
    reworkRate: 12.7
  }
};

const DoctorTemplateAnalytics = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('6months');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const getPerformanceColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 80) return 'text-blue-600';
    if (rate >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceIcon = (rate: number) => {
    if (rate >= 90) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (rate >= 80) return <Activity className="w-4 h-4 text-blue-600" />;
    if (rate >= 70) return <Target className="w-4 h-4 text-yellow-600" />;
    return <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-3xl font-montserrat font-bold text-health-teal">Template Analytics</h1>
          </div>
          <p className="text-health-charcoal">Comprehensive insights into your template performance and usage patterns</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-health-charcoal/70">Total Requests</p>
                <p className="text-2xl font-bold text-health-teal">{mockAnalytics.overview.totalRequests}</p>
                <p className="text-xs text-health-charcoal/60">+12% from last month</p>
              </div>
              <BarChart3 className="w-8 h-8 text-health-teal/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-health-charcoal/70">Success Rate</p>
                <p className="text-2xl font-bold text-health-success">{mockAnalytics.overview.successRate}%</p>
                <p className="text-xs text-health-charcoal/60">+2.1% improvement</p>
              </div>
              <TrendingUp className="w-8 h-8 text-health-success/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-health-charcoal/70">Avg Response Time</p>
                <p className="text-2xl font-bold text-health-aqua">{mockAnalytics.overview.avgResponseTime}</p>
                <p className="text-xs text-health-charcoal/60">-0.3 days faster</p>
              </div>
              <Clock className="w-8 h-8 text-health-aqua/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-health-charcoal/70">Active Templates</p>
                <p className="text-2xl font-bold text-health-blue-gray">{mockAnalytics.overview.activeTemplates}</p>
                <p className="text-xs text-health-charcoal/60">of {mockAnalytics.overview.totalTemplates} total</p>
              </div>
              <Zap className="w-8 h-8 text-health-blue-gray/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="templates">Top Templates</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Template Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockAnalytics.categoryBreakdown.map((category, index) => (
                    <div key={category.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{
                          backgroundColor: `hsl(${index * 60}, 70%, 50%)`
                        }}></div>
                        <span className="text-sm font-medium">{category.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full" 
                            style={{
                              width: `${category.percentage}%`,
                              backgroundColor: `hsl(${index * 60}, 70%, 50%)`
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-health-charcoal/60 w-12 text-right">
                          {category.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Patient Satisfaction</span>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="font-bold">{mockAnalytics.performanceMetrics.patientSatisfaction}/5.0</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Completion Rate</span>
                    <div className="flex items-center gap-2">
                      {getPerformanceIcon(mockAnalytics.performanceMetrics.completionRate)}
                      <span className={`font-bold ${getPerformanceColor(mockAnalytics.performanceMetrics.completionRate)}`}>
                        {mockAnalytics.performanceMetrics.completionRate}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Rework Rate</span>
                    <div className="flex items-center gap-2">
                      {getPerformanceIcon(100 - mockAnalytics.performanceMetrics.reworkRate)}
                      <span className={`font-bold ${getPerformanceColor(100 - mockAnalytics.performanceMetrics.reworkRate)}`}>
                        {mockAnalytics.performanceMetrics.reworkRate}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Response Time Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Response Time Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(mockAnalytics.performanceMetrics.responseTime).map(([level, count]) => (
                    <div key={level} className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{level}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              level === 'excellent' ? 'bg-green-500' :
                              level === 'good' ? 'bg-blue-500' :
                              level === 'average' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${(count / 100) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-health-charcoal/60 w-8 text-right">
                          {count}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Performance Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Strong Performance</span>
                    </div>
                    <p className="text-xs text-green-700">
                      Your templates are performing above average with a 94.2% success rate.
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Eye className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">High Usage</span>
                    </div>
                    <p className="text-xs text-blue-700">
                      Insurance and routine checkup templates are most frequently used.
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">Improvement Opportunity</span>
                    </div>
                    <p className="text-xs text-yellow-700">
                      Emergency templates could benefit from optimization for faster response times.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Top Performing Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAnalytics.topTemplates.map((template, index) => (
                  <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-health-light-gray/30 transition">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-health-teal/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-health-teal">{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="font-medium">{template.name}</h3>
                        <p className="text-sm text-health-charcoal/60">ID: {template.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-sm font-medium text-health-charcoal/70">Usage</p>
                        <p className="text-lg font-bold text-health-teal">{template.usage}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-health-charcoal/70">Success Rate</p>
                        <p className={`text-lg font-bold ${getPerformanceColor(template.successRate)}`}>
                          {template.successRate}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-health-charcoal/70">Avg Time</p>
                        <p className="text-lg font-bold text-health-aqua">{template.avgTime}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Usage Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Monthly Usage Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockAnalytics.monthlyUsage.map((month, index) => (
                    <div key={month.month} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{month.month}</span>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-xs text-health-charcoal/60">Requests</p>
                          <p className="text-sm font-bold text-health-teal">{month.requests}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-health-charcoal/60">Templates</p>
                          <p className="text-sm font-bold text-health-aqua">{month.templates}</p>
                        </div>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-health-teal"
                            style={{ width: `${(month.requests / 70) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Growth Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Growth Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-green-800">Template Adoption</p>
                      <p className="text-xs text-green-700">New templates created this month</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">+3</p>
                      <p className="text-xs text-green-600">+15%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-blue-800">Usage Growth</p>
                      <p className="text-xs text-blue-700">Increase in template usage</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">+12%</p>
                      <p className="text-xs text-blue-600">vs last month</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-purple-800">Efficiency</p>
                      <p className="text-xs text-purple-700">Average response time improvement</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-purple-600">-0.3d</p>
                      <p className="text-xs text-purple-600">14% faster</p>
                    </div>
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

export default DoctorTemplateAnalytics;
