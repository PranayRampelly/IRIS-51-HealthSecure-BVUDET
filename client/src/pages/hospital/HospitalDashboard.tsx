import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, Calendar, AlertTriangle, Bed, Activity, 
  Building, Stethoscope, Clock, CheckCircle,
  RefreshCw, Settings, Plus, Ambulance, Pill,
  TestTube, CreditCard, BarChart3,
  AlertCircle, Info, Hospital, Zap, Microscope
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const HospitalDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState('overview');

  const refreshData = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setLastUpdated(new Date());
      setIsLoading(false);
      toast.success('Dashboard refreshed');
    }, 1000);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'patients':
        navigate('/hospital/patients');
        break;
      case 'appointments':
        navigate('/hospital/appointments');
        break;
      case 'emergency':
        navigate('/hospital/emergency');
        break;
      case 'pharmacy':
        navigate('/hospital/pharmacy');
        break;
      case 'laboratory':
        navigate('/hospital/laboratory');
        break;
      case 'radiology':
        navigate('/hospital/radiology');
        break;
      case 'billing':
        navigate('/hospital/billing');
        break;
      case 'reports':
        navigate('/hospital/reports');
        break;
      default:
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-teal-600 border-t-transparent"></div>
          <p className="mt-6 text-xl font-semibold text-gray-800">Loading Hospital Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="w-full px-4 md:px-6 py-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="rounded-3xl overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-health-teal via-health-aqua to-teal-600 relative">
              <div className="relative p-8 md:p-12">
                <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                        <Hospital className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                          Hospital Dashboard
                        </h1>
                        <p className="text-white/90 text-lg">
                          Comprehensive overview of hospital operations and patient care
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 mt-6">
                      <Button 
                        variant="outline" 
                        size="lg"
                        className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
                        onClick={refreshData}
                      >
                        <RefreshCw className="h-5 w-5 mr-2" />
                        Refresh Data
                      </Button>
                      <Button 
                        variant="outline" 
                        size="lg"
                        className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
                        onClick={() => navigate('/hospital/settings')}
                      >
                        <Settings className="h-5 w-5 mr-2" />
                        Settings
                      </Button>
                    </div>
                  </div>

                  {/* Status Indicators */}
                  <div className="grid grid-cols-2 gap-4 min-w-[300px]">
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 text-center shadow-lg border border-white/20">
                      <div className="text-2xl font-bold text-health-teal">92</div>
                      <div className="text-sm text-gray-700">Staff On Duty</div>
                    </div>
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 text-center shadow-lg border border-white/20">
                      <div className="text-2xl font-bold text-health-aqua">12</div>
                      <div className="text-sm text-gray-700">Departments</div>
                    </div>
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 text-center shadow-lg border border-white/20">
                      <div className="text-2xl font-bold text-health-success">24</div>
                      <div className="text-sm text-gray-700">ICU Beds</div>
                    </div>
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 text-center shadow-lg border border-white/20">
                      <div className="text-2xl font-bold text-health-warning">6</div>
                      <div className="text-sm text-gray-700">Ambulances</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
            <div className="flex items-center gap-3">
              <Input
                placeholder="Search actions..."
                className="w-64"
              />
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="cardiology">Cardiology</SelectItem>
                  <SelectItem value="orthopedics">Orthopedics</SelectItem>
                  <SelectItem value="neurology">Neurology</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="pediatrics">Pediatrics</SelectItem>
                  <SelectItem value="surgery">Surgery</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-gray-200" onClick={() => handleQuickAction('patients')}>
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Patient Management</h3>
                <p className="text-sm text-gray-600 mb-3">View, add, and manage patient records</p>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-gray-200" onClick={() => handleQuickAction('appointments')}>
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Appointments</h3>
                <p className="text-sm text-gray-600 mb-3">Schedule and manage appointments</p>
                <Badge className="bg-blue-100 text-blue-800">Today: 45</Badge>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-gray-200" onClick={() => handleQuickAction('emergency')}>
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                  <Ambulance className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Emergency Services</h3>
                <p className="text-sm text-gray-600 mb-3">Monitor emergency cases</p>
                <Badge className="bg-red-100 text-red-800">8 Active</Badge>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-gray-200" onClick={() => handleQuickAction('pharmacy')}>
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Pill className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Pharmacy Services</h3>
                <p className="text-sm text-gray-600 mb-3">Manage medication inventory</p>
                <Badge className="bg-green-100 text-green-800">Stocked</Badge>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-lg">
            <TabsTrigger value="overview" className="text-sm font-medium">Overview</TabsTrigger>
            <TabsTrigger value="departments" className="text-sm font-medium">Departments</TabsTrigger>
            <TabsTrigger value="staff" className="text-sm font-medium">Staff</TabsTrigger>
            <TabsTrigger value="resources" className="text-sm font-medium">Resources</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="relative overflow-hidden border-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-green-200 bg-green-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-700">Total Patients</CardTitle>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-3xl font-bold text-gray-900">1,247</div>
                  <p className="text-xs text-gray-600 font-medium">Currently registered</p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-orange-200 bg-orange-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-700">Active Admissions</CardTitle>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-md">
                    <Bed className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-3xl font-bold text-gray-900">89</div>
                  <p className="text-xs text-gray-600 font-medium">Inpatient care</p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-green-200 bg-green-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-700">Available Beds</CardTitle>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-md">
                    <Building className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-3xl font-bold text-gray-900">156</div>
                  <p className="text-xs text-gray-600 font-medium">Ready for patients</p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-red-200 bg-red-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-700">Emergency Cases</CardTitle>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-md">
                    <AlertTriangle className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-3xl font-bold text-gray-900">8</div>
                  <p className="text-xs text-gray-600 font-medium">Critical care needed</p>
                </CardContent>
              </Card>
            </div>

            {/* Department Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <Card className="shadow-lg border-health-teal/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Building className="h-6 w-6 text-health-teal" />
                    Department Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Emergency</div>
                          <div className="text-sm text-gray-600">8 patients • 100% occupancy</div>
                        </div>
                      </div>
                      <Badge className="bg-red-100 text-red-800">Critical</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Clock className="h-4 w-4 text-orange-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Cardiology</div>
                          <div className="text-sm text-gray-600">23 patients • 85% occupancy</div>
                        </div>
                      </div>
                      <Badge className="bg-orange-100 text-orange-800">Busy</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-health-aqua/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Activity className="h-6 w-6 text-health-aqua" />
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                    <div>
                      <span className="text-sm font-semibold text-green-700">Database</span>
                      <p className="text-xs text-gray-600">Operational</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                    <div>
                      <span className="text-sm font-semibold text-green-700">Network</span>
                      <p className="text-xs text-gray-600">Operational</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border">
                    <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse"></div>
                    <div>
                      <span className="text-sm font-semibold text-yellow-700">Backup</span>
                      <p className="text-xs text-gray-600">Attention needed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Departments Tab */}
          <TabsContent value="departments" className="space-y-6">
            <Card className="shadow-lg border-health-teal/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Building className="h-7 w-7 text-health-teal" />
                  Department Management
                </CardTitle>
                <p className="text-gray-600">Monitor and manage all hospital departments</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="hover:shadow-md transition-shadow duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-gray-900">Cardiology</CardTitle>
                        <Badge className="bg-orange-100 text-orange-800 border-orange-200">Busy</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">23</div>
                          <div className="text-xs text-gray-600">Patients</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">15</div>
                          <div className="text-xs text-gray-600">Total Beds</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Occupancy</span>
                          <span className="font-semibold">85%</span>
                        </div>
                        <Progress value={85} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Staff Tab */}
          <TabsContent value="staff" className="space-y-6">
            <Card className="shadow-lg border-health-aqua/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Users className="h-7 w-7 text-health-aqua" />
                  Staff Management
                </CardTitle>
                <p className="text-gray-600">Monitor staff availability and performance</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="text-center p-6 bg-gradient-to-br from-health-teal/10 to-health-teal/20 border-health-teal/30">
                    <Users className="h-12 w-12 text-health-teal mx-auto mb-4" />
                    <div className="text-3xl font-bold text-health-teal">23</div>
                    <div className="text-lg font-semibold text-health-teal">Doctors</div>
                    <div className="text-sm text-health-teal/70">On Duty</div>
                  </Card>
                  <Card className="text-center p-6 bg-gradient-to-br from-health-aqua/10 to-health-aqua/20 border-health-aqua/30">
                    <Users className="h-12 w-12 text-health-aqua mx-auto mb-4" />
                    <div className="text-3xl font-bold text-health-aqua">34</div>
                    <div className="text-lg font-semibold text-health-aqua">Nurses</div>
                    <div className="text-sm text-health-aqua/70">On Duty</div>
                  </Card>
                  <Card className="text-center p-6 bg-gradient-to-br from-health-success/10 to-health-success/20 border-health-success/30">
                    <Users className="h-12 w-12 text-health-success mx-auto mb-4" />
                    <div className="text-3xl font-bold text-health-success">8</div>
                    <div className="text-lg font-semibold text-health-success">Specialists</div>
                    <div className="text-sm text-health-success/70">On Duty</div>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <Card className="shadow-lg border-health-warning/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Zap className="h-7 w-7 text-health-warning" />
                  Hospital Resources
                </CardTitle>
                <p className="text-gray-600">Monitor equipment and facility availability</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="text-center p-6 bg-gradient-to-br from-health-warning/10 to-health-warning/20 border-health-warning/30">
                    <Bed className="h-12 w-12 text-health-warning mx-auto mb-4" />
                    <div className="text-3xl font-bold text-health-warning">24</div>
                    <div className="text-lg font-semibold text-health-warning">ICU Beds</div>
                  </Card>
                  <Card className="text-center p-6 bg-gradient-to-br from-health-error/10 to-health-error/20 border-health-error/30">
                    <Ambulance className="h-12 w-12 text-health-error mx-auto mb-4" />
                    <div className="text-3xl font-bold text-health-error">6</div>
                    <div className="text-lg font-semibold text-health-error">Ambulances</div>
                  </Card>
                  <Card className="text-center p-6 bg-gradient-to-br from-health-teal/10 to-health-teal/20 border-health-teal/30">
                    <Microscope className="h-12 w-12 text-health-teal mx-auto mb-4" />
                    <div className="text-3xl font-bold text-health-teal">2</div>
                    <div className="text-lg font-semibold text-health-teal">MRI Machines</div>
                  </Card>
                  <Card className="text-center p-6 bg-gradient-to-br from-health-success/10 to-health-success/20 border-health-success/30">
                    <Activity className="h-12 w-12 text-health-success mx-auto mb-4" />
                    <div className="text-3xl font-bold text-health-success">3</div>
                    <div className="text-lg font-semibold text-health-success">CT Scanners</div>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer Status Bar */}
        <div className="mt-12 p-4 bg-white rounded-2xl shadow-lg border border-health-teal/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-health-success animate-pulse"></div>
                <span className="text-sm text-gray-600">Real-time Connected</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-health-teal" />
                <span className="text-sm text-gray-600">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={refreshData} className="border-health-teal/30 text-health-teal hover:bg-health-teal/10">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/hospital/settings')} className="border-health-aqua/30 text-health-aqua hover:bg-health-aqua/10">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalDashboard;
