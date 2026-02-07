import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, TrendingUp, Users, Calendar, DollarSign, 
  Activity, Clock, Star, MessageSquare, FileText,
  ArrowUp, ArrowDown, Eye, Download, Filter,
  BarChart, PieChart, LineChart, Target, Award
} from 'lucide-react';

interface AnalyticsData {
  totalPatients: number;
  totalAppointments: number;
  totalConsultations: number;
  totalRevenue: number;
  averageRating: number;
  responseTime: number;
  patientGrowth: number;
  appointmentGrowth: number;
  revenueGrowth: number;
  ratingGrowth: number;
}

const DoctorAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalPatients: 1247,
    totalAppointments: 89,
    totalConsultations: 156,
    totalRevenue: 45230,
    averageRating: 4.8,
    responseTime: 2.3,
    patientGrowth: 12.5,
    appointmentGrowth: 8.3,
    revenueGrowth: 15.2,
    ratingGrowth: 2.1,
  });

  const metrics = [
    {
      title: 'Total Patients',
      value: analyticsData.totalPatients,
      icon: Users,
      growth: analyticsData.patientGrowth,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Appointments',
      value: analyticsData.totalAppointments,
      icon: Calendar,
      growth: analyticsData.appointmentGrowth,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Consultations',
      value: analyticsData.totalConsultations,
      icon: Activity,
      growth: 5.7,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Revenue',
      value: `$${analyticsData.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      growth: analyticsData.revenueGrowth,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Rating',
      value: analyticsData.averageRating,
      icon: Star,
      growth: analyticsData.ratingGrowth,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Response Time',
      value: `${analyticsData.responseTime}h`,
      icon: Clock,
      growth: -8.5,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  const chartData = {
    appointments: [
      { month: 'Jan', value: 65 },
      { month: 'Feb', value: 78 },
      { month: 'Mar', value: 89 },
      { month: 'Apr', value: 92 },
      { month: 'May', value: 85 },
      { month: 'Jun', value: 89 },
    ],
    revenue: [
      { month: 'Jan', value: 32000 },
      { month: 'Feb', value: 38000 },
      { month: 'Mar', value: 42000 },
      { month: 'Apr', value: 45000 },
      { month: 'May', value: 43000 },
      { month: 'Jun', value: 45230 },
    ],
    patients: [
      { month: 'Jan', value: 1100 },
      { month: 'Feb', value: 1150 },
      { month: 'Mar', value: 1200 },
      { month: 'Apr', value: 1220 },
      { month: 'May', value: 1235 },
      { month: 'Jun', value: 1247 },
    ],
  };

  const topSpecialties = [
    { name: 'Cardiology', patients: 234, growth: 12.5 },
    { name: 'Dermatology', patients: 189, growth: 8.3 },
    { name: 'Orthopedics', patients: 156, growth: 15.2 },
    { name: 'Neurology', patients: 134, growth: 6.7 },
    { name: 'Pediatrics', patients: 98, growth: 9.1 },
  ];

  const recentActivity = [
    { type: 'appointment', patient: 'John Doe', time: '2 hours ago', status: 'completed' },
    { type: 'consultation', patient: 'Jane Smith', time: '4 hours ago', status: 'scheduled' },
    { type: 'prescription', patient: 'Mike Johnson', time: '6 hours ago', status: 'issued' },
    { type: 'proof_request', patient: 'Sarah Wilson', time: '1 day ago', status: 'pending' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-health-charcoal">Analytics Dashboard</h1>
          <p className="text-health-blue-gray mt-2">Track your practice performance and insights</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const isPositive = metric.growth >= 0;
          
          return (
            <Card key={metric.title} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-health-blue-gray">{metric.title}</p>
                    <p className="text-2xl font-bold text-health-charcoal mt-1">{metric.value}</p>
                    <div className="flex items-center mt-2">
                      {isPositive ? (
                        <ArrowUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <ArrowDown className="w-4 h-4 text-red-600" />
                      )}
                      <span className={`text-sm font-medium ml-1 ${
                        isPositive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {Math.abs(metric.growth)}%
                      </span>
                      <span className="text-sm text-health-blue-gray ml-1">vs last period</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-full ${metric.bgColor}`}>
                    <Icon className={`w-6 h-6 ${metric.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts and Insights */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="specialties">Specialties</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Appointments Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-health-aqua" />
                  <span>Appointments Trend</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between space-x-2">
                  {chartData.appointments.map((item, index) => (
                    <div key={index} className="flex flex-col items-center space-y-2">
                      <div 
                        className="w-8 bg-health-aqua rounded-t"
                        style={{ height: `${(item.value / 100) * 200}px` }}
                      />
                      <span className="text-xs text-health-blue-gray">{item.month}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-health-success" />
                  <span>Revenue Trend</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between space-x-2">
                  {chartData.revenue.map((item, index) => (
                    <div key={index} className="flex flex-col items-center space-y-2">
                      <div 
                        className="w-8 bg-health-success rounded-t"
                        style={{ height: `${(item.value / 50000) * 200}px` }}
                      />
                      <span className="text-xs text-health-blue-gray">{item.month}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Patient Growth */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-health-teal" />
                  <span>Patient Growth</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between space-x-2">
                  {chartData.patients.map((item, index) => (
                    <div key={index} className="flex flex-col items-center space-y-2">
                      <div 
                        className="w-8 bg-health-teal rounded-t"
                        style={{ height: `${(item.value / 1300) * 200}px` }}
                      />
                      <span className="text-xs text-health-blue-gray">{item.month}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-health-warning" />
                  <span>Performance Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-health-blue-gray">Patient Satisfaction</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-health-success h-2 rounded-full" style={{ width: '92%' }} />
                    </div>
                    <span className="text-sm font-medium">92%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-health-blue-gray">Appointment Completion</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-health-aqua h-2 rounded-full" style={{ width: '88%' }} />
                    </div>
                    <span className="text-sm font-medium">88%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-health-blue-gray">Response Time</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-health-warning h-2 rounded-full" style={{ width: '85%' }} />
                    </div>
                    <span className="text-sm font-medium">85%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="specialties" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-health-aqua" />
                <span>Top Specialties</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topSpecialties.map((specialty, index) => (
                  <div key={specialty.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-health-aqua rounded-full flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-health-charcoal">{specialty.name}</p>
                        <p className="text-sm text-health-blue-gray">{specialty.patients} patients</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-green-600 font-medium">+{specialty.growth}%</span>
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-health-aqua" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-health-aqua/10 rounded-full flex items-center justify-center">
                        {activity.type === 'appointment' && <Calendar className="w-4 h-4 text-health-aqua" />}
                        {activity.type === 'consultation' && <Activity className="w-4 h-4 text-health-aqua" />}
                        {activity.type === 'prescription' && <FileText className="w-4 h-4 text-health-aqua" />}
                        {activity.type === 'proof_request' && <MessageSquare className="w-4 h-4 text-health-aqua" />}
                      </div>
                      <div>
                        <p className="font-medium text-health-charcoal">{activity.patient}</p>
                        <p className="text-sm text-health-blue-gray capitalize">{activity.type.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={activity.status === 'completed' ? 'default' : 'secondary'}>
                        {activity.status}
                      </Badge>
                      <span className="text-sm text-health-blue-gray">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DoctorAnalytics; 