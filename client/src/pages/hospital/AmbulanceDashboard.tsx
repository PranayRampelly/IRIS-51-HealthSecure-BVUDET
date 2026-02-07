import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Ambulance as AmbulanceIcon, 
  Users, 
  Car, 
  Phone, 
  Activity, 
  MapPin, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  BarChart3,
  Settings,
  Calendar,
  PhoneCall,
  Navigation,
  Heart,
  Stethoscope,
  Zap,
  Shield,
  Building,
  User,
  MessageSquare,
  Bell,
  Star,
  Target,
  Gauge,
  Route
} from 'lucide-react';

interface DashboardStats {
  totalDrivers: number;
  availableDrivers: number;
  activeCalls: number;
  totalVehicles: number;
  availableVehicles: number;
  completedTransports: number;
  responseTime: number;
  satisfactionRate: number;
  emergencyCalls: number;
  scheduledTransports: number;
}

interface RecentActivity {
  id: string;
  type: 'emergency' | 'transport' | 'maintenance' | 'driver';
  title: string;
  description: string;
  time: string;
  status: 'completed' | 'in-progress' | 'pending';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface PerformanceMetrics {
  averageResponseTime: number;
  callCompletionRate: number;
  driverSatisfaction: number;
  vehicleUtilization: number;
  emergencySuccessRate: number;
}

const AmbulanceDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalDrivers: 0,
    availableDrivers: 0,
    activeCalls: 0,
    totalVehicles: 0,
    availableVehicles: 0,
    completedTransports: 0,
    responseTime: 0,
    satisfactionRate: 0,
    emergencyCalls: 0,
    scheduledTransports: 0
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    averageResponseTime: 0,
    callCompletionRate: 0,
    driverSatisfaction: 0,
    vehicleUtilization: 0,
    emergencySuccessRate: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch calls stats
      const callsStatsResponse = await api.get('/hospital/ambulance/calls/stats');
      const callsData = callsStatsResponse.data;
      
      // Fetch transports stats
      const transportsStatsResponse = await api.get('/hospital/ambulance/transports/stats');
      const transportsData = transportsStatsResponse.data;
      
      // Fetch recent calls
      const recentCallsResponse = await api.get('/hospital/ambulance/calls?limit=5');
      const recentCallsData = recentCallsResponse.data;
      
      // Fetch drivers count (you may need to add this endpoint)
      // For now, using placeholder
      const totalDrivers = 0;
      const availableDrivers = 0;
      const totalVehicles = 0;
      const availableVehicles = 0;
      
      // Update stats from API data
      if (callsData?.success && callsData.data) {
        setStats({
          totalDrivers,
          availableDrivers,
          activeCalls: (callsData.data.byStatus?.pending || 0) + (callsData.data.byStatus?.dispatched || 0),
          totalVehicles,
          availableVehicles,
          completedTransports: transportsData?.data?.byStatus?.completed || 0,
          responseTime: callsData.data.avgResponseTime || 0,
          satisfactionRate: 0, // TODO: Add satisfaction rate endpoint
          emergencyCalls: callsData.data.byPriority?.critical || 0,
          scheduledTransports: transportsData?.data?.byStatus?.scheduled || 0
        });
      }
      
      // Update recent activity from calls
      if (recentCallsData?.success && recentCallsData.data) {
        const activities: RecentActivity[] = recentCallsData.data.slice(0, 4).map((call: any) => ({
          id: call._id || call.callId,
          type: 'emergency' as const,
          title: `${call.emergencyDetails?.type || 'Emergency'} - ${call.patient?.name || 'Patient'}`,
          description: `Emergency call, ${call.status || 'pending'}`,
          time: new Date(call.createdAt).toLocaleString(),
          status: call.status === 'completed' ? 'completed' : call.status === 'pending' ? 'pending' : 'in-progress',
          priority: call.emergencyDetails?.priority || 'medium'
        }));
        setRecentActivity(activities);
      }
      
      // Update performance metrics
      if (callsData?.success && callsData.data) {
        setPerformanceMetrics({
          averageResponseTime: callsData.data.avgResponseTime || 0,
          callCompletionRate: callsData.data.byStatus?.completed ? (callsData.data.byStatus.completed / callsData.data.total) * 100 : 0,
          driverSatisfaction: 0, // TODO: Add driver satisfaction endpoint
          vehicleUtilization: 0, // TODO: Add vehicle utilization endpoint
          emergencySuccessRate: 0 // TODO: Add emergency success rate endpoint
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set empty/default values on error
      setStats({
        totalDrivers: 0,
        availableDrivers: 0,
        activeCalls: 0,
        totalVehicles: 0,
        availableVehicles: 0,
        completedTransports: 0,
        responseTime: 0,
        satisfactionRate: 0,
        emergencyCalls: 0,
        scheduledTransports: 0
      });
      setRecentActivity([]);
      setPerformanceMetrics({
        averageResponseTime: 0,
        callCompletionRate: 0,
        driverSatisfaction: 0,
        vehicleUtilization: 0,
        emergencySuccessRate: 0
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'emergency': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'transport': return <Car className="w-5 h-5 text-blue-600" />;
      case 'maintenance': return <Settings className="w-5 h-5 text-yellow-600" />;
      case 'driver': return <User className="w-5 h-5 text-green-600" />;
      default: return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ambulance Dashboard</h1>
          <p className="text-gray-600">Real-time monitoring and performance overview</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button>
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </Button>
        </div>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-8 h-8" />
              <div>
                <p className="text-sm opacity-90">Total Drivers</p>
                <p className="text-2xl font-bold">{stats.totalDrivers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-8 h-8" />
              <div>
                <p className="text-sm opacity-90">Available Drivers</p>
                <p className="text-2xl font-bold">{stats.availableDrivers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-8 h-8" />
              <div>
                <p className="text-sm opacity-90">Active Calls</p>
                <p className="text-2xl font-bold">{stats.activeCalls}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Car className="w-8 h-8" />
              <div>
                <p className="text-sm opacity-90">Available Vehicles</p>
                <p className="text-2xl font-bold">{stats.availableVehicles}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-8 h-8" />
              <div>
                <p className="text-sm opacity-90">Completed Today</p>
                <p className="text-2xl font-bold">{stats.completedTransports}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Performance Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Average Response Time</span>
                <span className="text-sm text-gray-600">{performanceMetrics.averageResponseTime} min</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Call Completion Rate</span>
                <span className="text-sm text-gray-600">{performanceMetrics.callCompletionRate}%</span>
              </div>
              <Progress value={96.8} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Driver Satisfaction</span>
                <span className="text-sm text-gray-600">{performanceMetrics.driverSatisfaction}%</span>
              </div>
              <Progress value={94.2} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Vehicle Utilization</span>
                <span className="text-sm text-gray-600">{performanceMetrics.vehicleUtilization}%</span>
              </div>
              <Progress value={78.5} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Emergency Success Rate</span>
                <span className="text-sm text-gray-600">{performanceMetrics.emergencySuccessRate}%</span>
              </div>
              <Progress value={98.1} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button className="h-16 bg-red-600 hover:bg-red-700 text-white">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Emergency Call
              </Button>
              <Button className="h-16 bg-blue-600 hover:bg-blue-700 text-white">
                <Car className="w-5 h-5 mr-2" />
                Schedule Transport
              </Button>
              <Button className="h-16 bg-green-600 hover:bg-green-700 text-white">
                <User className="w-5 h-5 mr-2" />
                Assign Driver
              </Button>
              <Button className="h-16 bg-purple-600 hover:bg-purple-700 text-white">
                <Settings className="w-5 h-5 mr-2" />
                Vehicle Maintenance
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg border">
                <div className="flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <Badge className={`${getPriorityColor(activity.priority)} text-xs`}>
                      {activity.priority}
                    </Badge>
                    <Badge className={`${getStatusColor(activity.status)} text-xs`}>
                      {activity.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Emergency Calls</p>
                <p className="text-2xl font-bold text-red-600">{stats.emergencyCalls}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Car className="w-6 h-6 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Scheduled Transports</p>
                <p className="text-2xl font-bold text-blue-600">{stats.scheduledTransports}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-6 h-6 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold text-green-600">{stats.responseTime} min</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AmbulanceDashboard; 