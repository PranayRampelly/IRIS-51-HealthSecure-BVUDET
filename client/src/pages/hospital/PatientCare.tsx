import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, Calendar, DollarSign, TrendingUp, 
  AlertTriangle, Bed, Activity, Heart,
  Building, Stethoscope, Clock, CheckCircle,
  Search, Filter, Plus, Eye, Edit, Trash2,
  Phone, Mail, MapPin, User, Shield, Activity as ActivityIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const PatientCare: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    activePatients: 0,
    criticalPatients: 0,
    dischargedToday: 0,
    admittedToday: 0,
    emergencyCases: 0,
    avgStayDuration: 0,
    bedOccupancy: 0
  });

  useEffect(() => {
    fetchPatientData();
    fetchStats();
  }, []);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/hospital/patients', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPatients(response.data.patients || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setPatients([]);
      toast.error('Failed to load patient data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/hospital/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.stats || {
        totalPatients: 1247,
        activePatients: 89,
        criticalPatients: 12,
        dischargedToday: 8,
        admittedToday: 15,
        emergencyCases: 5,
        avgStayDuration: 4.2,
        bedOccupancy: 78
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Use mock data if API fails
      setStats({
        totalPatients: 1247,
        activePatients: 89,
        criticalPatients: 12,
        dischargedToday: 8,
        admittedToday: 15,
        emergencyCases: 5,
        avgStayDuration: 4.2,
        bedOccupancy: 78
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-health-success text-white';
      case 'critical': return 'bg-health-danger text-white';
      case 'stable': return 'bg-health-aqua text-white';
      case 'discharged': return 'bg-health-blue-gray text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPatients = patients.filter(patient => {
    const name = `${patient.firstName} ${patient.lastName}`;
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.patientId || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || patient.department === departmentFilter;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const recentActivities = [
    { id: 1, type: 'admission', patient: 'John Smith', time: '2 hours ago', department: 'Cardiology', status: 'active' },
    { id: 2, type: 'discharge', patient: 'Sarah Johnson', time: '3 hours ago', department: 'Orthopedics', status: 'discharged' },
    { id: 3, type: 'emergency', patient: 'Mike Wilson', time: '4 hours ago', department: 'Emergency', status: 'critical' },
    { id: 4, type: 'transfer', patient: 'Lisa Brown', time: '5 hours ago', department: 'Neurology', status: 'stable' },
  ];

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-montserrat font-bold text-health-teal">Patient Care</h1>
          <p className="text-health-charcoal mt-2">Comprehensive patient care management and monitoring</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => navigate('/hospital/patient-management')}>
            <Users className="w-4 h-4 mr-2" />
            Patient Management
          </Button>
          <Button className="bg-health-aqua hover:bg-health-aqua/90 text-white" onClick={() => navigate('/hospital/admissions')}>
            <Plus className="w-4 h-4 mr-2" />
            New Admission
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-health-teal/10 rounded-lg">
                <Users className="w-6 h-6 text-health-teal" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Total Patients</p>
                <p className="text-2xl font-bold text-health-teal">{stats.totalPatients.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-health-success/10 rounded-lg">
                <Heart className="w-6 h-6 text-health-success" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Active Patients</p>
                <p className="text-2xl font-bold text-health-success">{stats.activePatients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-health-danger/10 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-health-danger" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Critical Cases</p>
                <p className="text-2xl font-bold text-health-danger">{stats.criticalPatients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-health-aqua/10 rounded-lg">
                <Bed className="w-6 h-6 text-health-aqua" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Bed Occupancy</p>
                <p className="text-2xl font-bold text-health-aqua">{stats.bedOccupancy}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Admitted Today</p>
                <p className="text-2xl font-bold text-green-600">{stats.admittedToday}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ActivityIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Emergency Cases</p>
                <p className="text-2xl font-bold text-blue-600">{stats.emergencyCases}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Avg Stay (Days)</p>
                <p className="text-2xl font-bold text-orange-600">{stats.avgStayDuration}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="activities">Recent Activities</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Department Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="w-5 h-5" />
                  <span>Department Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Cardiology', patients: 23, capacity: 30, color: 'bg-red-500' },
                    { name: 'Orthopedics', patients: 18, capacity: 25, color: 'bg-blue-500' },
                    { name: 'Neurology', patients: 12, capacity: 20, color: 'bg-green-500' },
                    { name: 'Emergency', patients: 8, capacity: 15, color: 'bg-orange-500' },
                    { name: 'Pediatrics', patients: 15, capacity: 25, color: 'bg-purple-500' },
                  ].map((dept) => (
                    <div key={dept.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${dept.color}`}></div>
                        <span className="font-medium">{dept.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{dept.patients}/{dept.capacity}</div>
                        <div className="text-sm text-gray-500">
                          {Math.round((dept.patients / dept.capacity) * 100)}% occupancy
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col space-y-2"
                    onClick={() => navigate('/hospital/admissions')}
                  >
                    <Plus className="w-6 h-6" />
                    <span>New Admission</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col space-y-2"
                    onClick={() => navigate('/hospital/discharges')}
                  >
                    <CheckCircle className="w-6 h-6" />
                    <span>Process Discharge</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col space-y-2"
                    onClick={() => navigate('/hospital/patient-records')}
                  >
                    <User className="w-6 h-6" />
                    <span>Patient Records</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col space-y-2"
                    onClick={() => navigate('/hospital/emergency-cases')}
                  >
                    <AlertTriangle className="w-6 h-6" />
                    <span>Emergency Cases</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="patients" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search patients by name or ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="stable">Stable</SelectItem>
                    <SelectItem value="discharged">Discharged</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="cardiology">Cardiology</SelectItem>
                    <SelectItem value="orthopedics">Orthopedics</SelectItem>
                    <SelectItem value="neurology">Neurology</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="pediatrics">Pediatrics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Patients Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Patient List</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-health-teal"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Admission Date</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPatients.map((patient) => (
                        <TableRow key={patient.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage src={patient.avatar} />
                                <AvatarFallback>
                                  {patient.firstName?.[0]}{patient.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                                <p className="text-sm text-gray-500">ID: {patient.patientId}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(patient.status || 'active')}>
                              {patient.status || 'active'}
                            </Badge>
                          </TableCell>
                          <TableCell>{patient.department || 'General'}</TableCell>
                          <TableCell>
                            {patient.admissionDate ? new Date(patient.admissionDate).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Badge className={getPriorityColor(patient.priority || 'medium')}>
                              {patient.priority || 'medium'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/hospital/patient/${patient.id}`)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/hospital/patient/${patient.id}/edit`)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {filteredPatients.length === 0 && !loading && (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No patients found</p>
                      <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Recent Activities</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className={`p-2 rounded-full ${
                      activity.type === 'admission' ? 'bg-green-100 text-green-600' :
                      activity.type === 'discharge' ? 'bg-blue-100 text-blue-600' :
                      activity.type === 'emergency' ? 'bg-red-100 text-red-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {activity.type === 'admission' ? <Plus className="w-4 h-4" /> :
                       activity.type === 'discharge' ? <CheckCircle className="w-4 h-4" /> :
                       activity.type === 'emergency' ? <AlertTriangle className="w-4 h-4" /> :
                       <Activity className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.patient}</p>
                      <p className="text-sm text-gray-500">{activity.department} • {activity.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{activity.time}</p>
                      <Badge className={getStatusColor(activity.status)}>
                        {activity.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5" />
                <span>Active Alerts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="font-medium text-red-800">Critical Patient Alert</p>
                      <p className="text-sm text-red-600">Patient John Smith in Cardiology requires immediate attention</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-yellow-800">Bed Shortage Warning</p>
                      <p className="text-sm text-yellow-600">Emergency department at 95% capacity</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                  <div className="flex items-center space-x-3">
                    <Activity className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-800">Staff Notification</p>
                      <p className="text-sm text-blue-600">Dr. Johnson requested for consultation in Neurology</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientCare; 