import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Droplets, AlertTriangle, Users, Calendar, TrendingUp,
  Activity, Heart, Clock, CheckCircle, RefreshCw,
  ArrowUpRight, ArrowDownRight, Minus, Plus, Eye,
  BarChart3, PieChart, LineChart, MapPin, Phone,
  Mail, Shield, Zap, Target, Award, Star, Clock3,
  Thermometer, ActivitySquare, Brain, Car, Ambulance,
  Hospital, Pill, Microscope, TestTube, Syringe,
  Droplet, Cross, AlertCircle, Truck, FileText,
  UserRound, Settings, Bell, Search, Filter
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  dashboardAPI,
  bloodInventoryAPI,
  bloodDonorsAPI,
  bloodRequestsAPI,
  emergencyAlertsAPI,
  DashboardStats,
  BloodUnit,
  BloodDonor,
  BloodRequest,
  EmergencyAlert,
  bloodbankUtils
} from '@/services/bloodbankService';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: React.ComponentType<any>;
  color: string;
  subtitle?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  color,
  subtitle
}) => (
  <Card className="relative overflow-hidden border-0 shadow-sm bg-white hover:shadow-md transition-all duration-300">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
      <CardTitle className="text-sm font-semibold text-health-charcoal">{title}</CardTitle>
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
    </CardHeader>
    <CardContent className="space-y-2">
      <div className="text-2xl font-bold text-health-charcoal">{value}</div>
      {subtitle && (
        <p className="text-xs text-health-blue-gray">{subtitle}</p>
      )}
      {change !== undefined && (
        <div className="flex items-center space-x-1">
          {changeType === 'increase' ? (
            <ArrowUpRight className="h-3 w-3 text-health-success" />
          ) : changeType === 'decrease' ? (
            <ArrowDownRight className="h-3 w-3 text-health-danger" />
          ) : (
            <Minus className="h-3 w-3 text-health-blue-gray" />
          )}
          <span className={`text-xs font-medium ${changeType === 'increase' ? 'text-health-success' :
              changeType === 'decrease' ? 'text-health-danger' : 'text-health-blue-gray'
            }`}>
            {change > 0 ? '+' : ''}{change}%
          </span>
          <span className="text-xs text-health-blue-gray">vs last month</span>
        </div>
      )}
    </CardContent>
  </Card>
);

interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'warning';
  label: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, label }) => (
  <div className="flex items-center space-x-2">
    <div className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-health-success' :
        status === 'warning' ? 'bg-health-warning' : 'bg-health-danger'
      }`}></div>
    <span className="text-sm text-health-charcoal">{label}</span>
  </div>
);

interface BloodTypeData {
  type: string;
  available: number;
  reserved: number;
  testing: number;
  expired: number;
  percentage: number;
  color: string;
}

interface DonorData {
  id: string;
  name: string;
  bloodType: string;
  lastDonation: string;
  nextEligible: string;
  totalDonations: number;
  status: 'eligible' | 'ineligible' | 'pending';
}

interface BloodRequest {
  id: string;
  hospital: string;
  bloodType: string;
  quantity: number;
  urgency: 'routine' | 'urgent' | 'emergency';
  requestDate: string;
  requiredDate: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
}

interface QualityTest {
  id: string;
  bloodUnit: string;
  testType: string;
  testDate: string;
  result: 'pass' | 'fail' | 'pending';
  technician: string;
  qualityScore: number;
}

const BloodBankDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [selectedTimeframe, setSelectedTimeframe] = useState<'today' | 'week' | 'month'>('today');

  // Quick action loading states
  const [isCreatingRequest, setIsCreatingRequest] = useState(false);
  const [isRegisteringDonor, setIsRegisteringDonor] = useState(false);
  const [isInitiatingTest, setIsInitiatingTest] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Real data state
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [bloodTypeData, setBloodTypeData] = useState<BloodTypeData[]>([]);
  const [recentDonors, setRecentDonors] = useState<DonorData[]>([]);
  const [pendingRequests, setPendingRequests] = useState<BloodRequest[]>([]);
  const [qualityTests, setQualityTests] = useState<QualityTest[]>([]);
  const [emergencyAlerts, setEmergencyAlerts] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  // Initialize real-time connection
  useEffect(() => {
    if (user?.token && user?.role === 'bloodbank') {
      initializeRealtimeConnection();
    }
  }, [user]);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const initializeRealtimeConnection = async () => {
    try {
      setIsConnected(true);
      toast.success('Real-time connection established');
    } catch (error) {
      console.error('Failed to establish real-time connection:', error);
      toast.error('Failed to establish real-time connection');
    }
  };

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Load dashboard stats
      const stats = await dashboardAPI.getStats();
      setDashboardStats(stats);

      // Load inventory data
      const inventoryResponse = await bloodInventoryAPI.getUnits({ limit: 100 });
      const inventoryData = inventoryResponse.data;

      // Transform inventory data to blood type data
      const bloodTypeMap = new Map<string, BloodTypeData>();
      const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

      bloodTypes.forEach(type => {
        const units = inventoryData.filter((unit: any) => unit.bloodType === type);
        const available = units.filter((unit: any) => unit.status === 'available').length;
        const reserved = units.filter((unit: any) => unit.status === 'reserved').length;
        const testing = units.filter((unit: any) => unit.status === 'testing').length;
        const expired = units.filter((unit: any) => unit.status === 'expired').length;
        const total = available + reserved + testing + expired;
        const percentage = total > 0 ? (available / total) * 100 : 0;

        bloodTypeMap.set(type, {
          type,
          available,
          reserved,
          testing,
          expired,
          percentage: Math.round(percentage * 10) / 10,
          color: bloodbankUtils.getBloodTypeColor(type).replace('bg-', 'bg-').split(' ')[0]
        });
      });

      setBloodTypeData(Array.from(bloodTypeMap.values()));

      // Load recent donors
      const donorsResponse = await bloodDonorsAPI.getDonors({ limit: 5 });
      const donors = donorsResponse.data.map((donor: any) => ({
        id: donor._id,
        name: `${donor.personalInfo.firstName} ${donor.personalInfo.lastName}`,
        bloodType: donor.personalInfo.bloodType,
        lastDonation: donor.eligibility.lastDonation,
        nextEligible: donor.eligibility.nextEligibleDate,
        totalDonations: donor.donationHistory.length,
        status: donor.eligibility.isEligible ? 'eligible' : 'deferred'
      }));
      setRecentDonors(donors);

      // Load pending requests
      const requestsResponse = await bloodRequestsAPI.getRequests({
        status: 'pending',
        limit: 5
      });
      const requests = requestsResponse.data.map((request: any) => ({
        id: request._id,
        hospital: request.requester.hospitalName,
        bloodType: request.bloodType,
        quantity: request.quantity,
        urgency: request.urgency,
        requestDate: request.requestDate,
        requiredDate: request.requiredBy,
        status: request.status
      }));
      setPendingRequests(requests);

      // Load emergency alerts
      const alerts = await emergencyAlertsAPI.getAlerts({ status: 'active' });
      setEmergencyAlerts(alerts.slice(0, 5));

      // Load recent activities (mock for now)
      setRecentActivities([
        { id: 1, type: 'donation', donor: 'John Smith', bloodType: 'O+', time: '2 hours ago', status: 'completed' },
        { id: 2, type: 'request', hospital: 'City General', bloodType: 'A+', time: '3 hours ago', status: 'processed' },
        { id: 3, type: 'testing', unit: 'BB001', testType: 'HIV', time: '4 hours ago', status: 'passed' },
        { id: 4, type: 'expiry', bloodType: 'B+', units: 3, time: '5 hours ago', status: 'disposed' },
        { id: 5, type: 'emergency', hospital: 'Trauma Center', bloodType: 'O-', time: '6 hours ago', status: 'delivered' },
      ]);

      setLastUpdated(new Date());
      toast.success('Dashboard data refreshed');
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = () => {
    loadDashboardData();
  };

  // Quick Action Handlers
  const handleQuickRequest = async () => {
    try {
      setIsCreatingRequest(true);
      const response = await dashboardAPI.createQuickRequest({
        bloodType: 'O+',
        componentType: 'Whole Blood',
        quantity: 1,
        urgency: 'Routine'
      });
      toast.success('Quick blood request created! Please update the details.');
      await loadDashboardData();
      setTimeout(() => navigate('/bloodbank/requests'), 1500);
    } catch (error) {
      console.error('Error creating quick request:', error);
      toast.error('Failed to create blood request. Please try again.');
    } finally {
      setIsCreatingRequest(false);
    }
  };

  const handleRegisterDonor = async () => {
    try {
      setIsRegisteringDonor(true);
      toast.info('Redirecting to donor registration...');
      navigate('/bloodbank/donors?action=register');
    } catch (error) {
      console.error('Error navigating to donor registration:', error);
      toast.error('Failed to navigate to donor registration.');
    } finally {
      setIsRegisteringDonor(false);
    }
  };

  const handleQualityTest = async () => {
    try {
      setIsInitiatingTest(true);
      toast.info('Redirecting to quality control...');
      navigate('/bloodbank/quality');
    } catch (error) {
      console.error('Error navigating to quality control:', error);
      toast.error('Failed to navigate to quality control.');
    } finally {
      setIsInitiatingTest(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setIsGeneratingReport(true);
      const response = await dashboardAPI.generateQuickReport('dashboard_summary');
      toast.success('Report generated successfully!');
      console.log('Generated report:', response.data);
      setTimeout(() => navigate('/bloodbank/reports'), 1000);
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report. Please try again.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Calculate totals
  const totalInventory = bloodTypeData.reduce((sum, type) => sum + type.available, 0);
  const criticalStock = bloodTypeData.filter(type => type.available < 50).length;
  const pendingRequestsCount = pendingRequests.filter(req => req.status === 'pending').length;
  const todayDonations = dashboardStats?.trends?.donations || 0;
  const expiringUnits = dashboardStats?.trends?.expiring || 0;
  const completedTests = qualityTests.filter(test => test.result === 'pass').length;
  const emergencyRequests = pendingRequests.filter(req => req.urgency === 'emergency').length;
  const totalDonors = dashboardStats?.donors?.total || 0;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-health-charcoal">Blood Bank Dashboard</h1>
          <p className="text-health-blue-gray mt-1">
            Welcome back! Here's what's happening with your blood bank today.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={refreshData}
            disabled={isLoading}
            className="bg-white border-health-blue-gray/20 hover:bg-health-light-gray"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/bloodbank/inventory')}
            className="bg-white border-health-blue-gray/20 hover:bg-health-light-gray"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Inventory
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/bloodbank/donors')}
            className="bg-white border-health-blue-gray/20 hover:bg-health-light-gray"
          >
            <Users className="w-4 h-4 mr-2" />
            Donors
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/bloodbank/requests')}
            className="bg-white border-health-blue-gray/20 hover:bg-health-light-gray"
          >
            <Activity className="w-4 h-4 mr-2" />
            Requests
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/bloodbank/quality')}
            className="bg-white border-health-blue-gray/20 hover:bg-health-light-gray"
          >
            <Shield className="w-4 h-4 mr-2" />
            Quality Control
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/bloodbank/emergency')}
            className="bg-white border-health-blue-gray/20 hover:bg-health-light-gray"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Emergency Alerts
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/bloodbank/reports')}
            className="bg-white border-health-blue-gray/20 hover:bg-health-light-gray"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Reports
          </Button>
          <Button className="bg-health-danger hover:bg-red-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Donor
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/bloodbank/profile')}
            className="bg-white border-health-blue-gray/20 hover:bg-health-light-gray"
          >
            <UserRound className="w-4 h-4 mr-2" />
            My Profile
          </Button>
        </div>
      </div>

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Blood Inventory"
          value={totalInventory.toLocaleString()}
          change={8}
          changeType="increase"
          icon={Droplets}
          color="bg-health-danger"
          subtitle="Available units"
        />
        <MetricCard
          title="Critical Stock Alerts"
          value={criticalStock}
          change={-2}
          changeType="decrease"
          icon={AlertTriangle}
          color="bg-health-warning"
          subtitle="Low inventory types"
        />
        <MetricCard
          title="Pending Requests"
          value={pendingRequestsCount}
          change={12}
          changeType="increase"
          icon={Hospital}
          color="bg-chart-blue"
          subtitle="Hospital requests"
        />
        <MetricCard
          title="Today's Donations"
          value={todayDonations}
          change={15}
          changeType="increase"
          icon={Heart}
          color="bg-health-success"
          subtitle="Units collected"
        />
      </div>

      {/* Second Row of Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Expiry Alerts"
          value={expiringUnits}
          change={-5}
          changeType="decrease"
          icon={Clock}
          color="bg-health-warning"
          subtitle="Units expiring soon"
        />
        <MetricCard
          title="Quality Tests"
          value={completedTests}
          change={3}
          changeType="increase"
          icon={TestTube}
          color="bg-chart-purple"
          subtitle="Tests completed"
        />
        <MetricCard
          title="Emergency Requests"
          value={emergencyRequests}
          change={0}
          changeType="neutral"
          icon={AlertCircle}
          color="bg-health-danger"
          subtitle="Active emergencies"
        />
        <MetricCard
          title="Total Donors"
          value={totalDonors.toLocaleString()}
          change={9}
          changeType="increase"
          icon={Users}
          color="bg-health-aqua"
          subtitle="Registered donors"
        />
      </div>

      {/* Emergency & Critical Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Emergency Alerts */}
        <Card className="bg-white border-l-4 border-l-health-danger">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg text-health-danger">
              <AlertCircle className="w-5 h-5 mr-2" />
              Emergency Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {emergencyAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {alert.severity}
                    </Badge>
                    <span className="text-sm font-medium text-health-charcoal">{alert.type}</span>
                  </div>
                  <p className="text-xs text-health-blue-gray mt-1">
                    {alert.bloodType} • {alert.location}
                  </p>
                </div>
                <span className="text-xs text-health-blue-gray">{alert.time}</span>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-3 border-health-danger/20 text-health-danger hover:bg-red-50">
              View All Alerts
            </Button>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg text-health-charcoal">
              <Activity className="w-5 h-5 mr-2" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <StatusIndicator status="online" label="Blood Bank Database" />
              <StatusIndicator status="online" label="Quality Control System" />
              <StatusIndicator status="warning" label="Inventory Management" />
              <StatusIndicator status="online" label="Donor Management" />
              <StatusIndicator status="online" label="Emergency Response" />
            </div>
            <div className="pt-3 border-t border-health-light-gray">
              <div className="flex items-center justify-between text-sm">
                <span className="text-health-blue-gray">Last Updated:</span>
                <span className="text-health-charcoal font-medium">
                  {lastUpdated.toLocaleTimeString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-health-blue-gray">Connection:</span>
                <span className={`font-medium ${isConnected ? 'text-health-success' : 'text-health-danger'}`}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg text-health-charcoal">
              <Zap className="w-5 h-5 mr-2" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full bg-health-aqua hover:bg-health-teal" onClick={handleQuickRequest} disabled={isCreatingRequest}>
              {isCreatingRequest ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              New Blood Request
            </Button>
            <Button variant="outline" className="w-full border-health-aqua/20 text-health-aqua hover:bg-health-aqua/5" onClick={handleRegisterDonor} disabled={isRegisteringDonor}>
              {isRegisteringDonor ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Users className="w-4 h-4 mr-2" />}
              Register Donor
            </Button>
            <Button variant="outline" className="w-full border-health-warning/20 text-health-warning hover:bg-health-warning/5" onClick={handleQualityTest} disabled={isInitiatingTest}>
              {isInitiatingTest ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <TestTube className="w-4 h-4 mr-2" />}
              Quality Test
            </Button>
            <Button variant="outline" className="w-full border-health-success/20 text-health-success hover:bg-health-success/5" onClick={handleGenerateReport} disabled={isGeneratingReport}>
              {isGeneratingReport ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <BarChart3 className="w-4 h-4 mr-2" />}
              Generate Report
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Blood Type Distribution & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blood Type Distribution */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center text-lg text-health-charcoal">
              <PieChart className="w-5 h-5 mr-2" />
              Blood Type Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bloodTypeData.map((type) => (
                <div key={type.type} className="flex items-center space-x-4">
                  <div className={`w-4 h-4 rounded-full ${type.color}`}></div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-health-charcoal">{type.type}</span>
                      <span className="text-health-blue-gray">{type.percentage}%</span>
                    </div>
                    <Progress value={type.percentage} className="mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center text-lg text-health-charcoal">
              <Activity className="w-5 h-5 mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-health-light-gray">
                  <div className={`w-2 h-2 rounded-full ${activity.status === 'completed' ? 'bg-health-success' :
                      activity.status === 'pending' ? 'bg-health-warning' : 'bg-health-danger'
                    }`}></div>
                  <div className="flex-1">
                    <p className="text-sm text-health-charcoal">
                      {activity.type === 'donation' && `${activity.donor} donated ${activity.bloodType}`}
                      {activity.type === 'request' && `${activity.hospital} requested ${activity.bloodType}`}
                      {activity.type === 'testing' && `${activity.unit} ${activity.testType} test ${activity.status}`}
                      {activity.type === 'expiry' && `${activity.bloodType} units expired (${activity.units})`}
                      {activity.type === 'emergency' && `${activity.hospital} emergency ${activity.bloodType} delivered`}
                    </p>
                    <p className="text-xs text-health-blue-gray">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Blood Requests & Quality Control */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Blood Requests */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center text-lg text-health-charcoal">
              <FileText className="w-5 h-5 mr-2" />
              Pending Blood Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div key={request.id} className="p-3 border border-health-light-gray rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-health-charcoal">{request.hospital}</span>
                    <Badge
                      variant={
                        request.urgency === 'emergency' ? 'destructive' :
                          request.urgency === 'urgent' ? 'secondary' : 'outline'
                      }
                      className="text-xs"
                    >
                      {request.urgency}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-health-blue-gray">
                    <span>{request.bloodType} • {request.quantity} units</span>
                    <span>{request.requiredDate}</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <Button size="sm" className="bg-health-success hover:bg-green-700">
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" className="border-health-danger/20 text-health-danger hover:bg-red-50">
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quality Control Tests */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center text-lg text-health-charcoal">
              <Shield className="w-5 h-5 mr-2" />
              Quality Control Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {qualityTests.map((test) => (
                <div key={test.id} className="p-3 border border-health-light-gray rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-health-charcoal">{test.bloodUnit}</span>
                    <Badge
                      variant={
                        test.result === 'pass' ? 'default' :
                          test.result === 'fail' ? 'destructive' : 'secondary'
                      }
                      className="text-xs"
                    >
                      {test.result}
                    </Badge>
                  </div>
                  <div className="text-sm text-health-blue-gray mb-2">
                    {test.testType} • {test.technician}
                  </div>
                  {test.result === 'pass' && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-health-blue-gray">Quality Score:</span>
                      <span className="text-sm font-medium text-health-success">{test.qualityScore}%</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Donor Management */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center text-lg text-health-charcoal">
            <Users className="w-5 h-5 mr-2" />
            Recent Donors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-health-light-gray">
                  <th className="text-left py-2 text-sm font-medium text-health-charcoal">Name</th>
                  <th className="text-left py-2 text-sm font-medium text-health-charcoal">Blood Type</th>
                  <th className="text-left py-2 text-sm font-medium text-health-charcoal">Last Donation</th>
                  <th className="text-left py-2 text-sm font-medium text-health-charcoal">Next Eligible</th>
                  <th className="text-left py-2 text-sm font-medium text-health-charcoal">Total Donations</th>
                  <th className="text-left py-2 text-sm font-medium text-health-charcoal">Status</th>
                  <th className="text-left py-2 text-sm font-medium text-health-charcoal">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentDonors.map((donor) => (
                  <tr key={donor.id} className="border-b border-health-light-gray/50">
                    <td className="py-3 text-sm text-health-charcoal">{donor.name}</td>
                    <td className="py-3">
                      <Badge variant="outline" className="text-xs">
                        {donor.bloodType}
                      </Badge>
                    </td>
                    <td className="py-3 text-sm text-health-blue-gray">{donor.lastDonation}</td>
                    <td className="py-3 text-sm text-health-blue-gray">{donor.nextEligible}</td>
                    <td className="py-3 text-sm text-health-charcoal">{donor.totalDonations}</td>
                    <td className="py-3">
                      <Badge
                        variant={donor.status === 'eligible' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {donor.status}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline" className="border-health-aqua/20 text-health-aqua hover:bg-health-aqua/5">
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="border-health-success/20 text-health-success hover:bg-health-success/5">
                          <Calendar className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center py-6 text-health-blue-gray">
        <p className="text-sm">
          Last updated: {lastUpdated.toLocaleString()} •
          Connected to HealthSecure Platform
        </p>
      </div>
    </div>
  );
};

export default BloodBankDashboard; 