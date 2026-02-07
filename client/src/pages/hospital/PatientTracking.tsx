import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Users, Calendar, DollarSign, TrendingUp, 
  AlertTriangle, Bed, Activity, Heart,
  Building, Stethoscope, Clock, CheckCircle,
  Search, Filter, Plus, Eye, Edit, Trash2,
  Phone, Mail, MapPin, User, Shield, Activity as ActivityIcon,
  FileText, Pill, Thermometer, Heart as HeartIcon, Brain,
  Baby, UserCheck, UserX, UserPlus, Settings, Download,
  ArrowRight, CalendarDays, Clock as ClockIcon, MapPin as MapPinIcon,
  Home, Car, UserCheck as UserCheckIcon, FileCheck, ClipboardList,
  History, FileSearch, Database, Archive, Printer, Share2,
  Navigation, Map, Location, Wifi, Signal, Battery, Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import hospitalCareService, { PatientTrackingEntry } from '@/services/hospitalCareService';

const PatientTracking: React.FC = () => {
  const navigate = useNavigate();
  const surfaceCard = "bg-white/80 border border-white/60 shadow-sm backdrop-blur";
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [patients, setPatients] = useState<PatientTrackingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<PatientTrackingEntry | null>(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [newTracking, setNewTracking] = useState({
    patientId: '',
    patientName: '',
    currentLocation: '',
    department: '',
    roomNumber: '',
    bedNumber: '',
    status: '',
    lastSeen: '',
    assignedNurse: '',
    assignedDoctor: '',
    vitalSigns: {
      heartRate: '',
      bloodPressure: '',
      temperature: '',
      oxygenSaturation: '',
      lastUpdated: ''
    },
    alerts: [],
    notes: ''
  });

  useEffect(() => {
    fetchTrackingData();
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchTrackingData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchTrackingData = async () => {
    try {
      setLoading(true);
      const response = await hospitalCareService.getPatientTracking();
      setPatients(response.patients || []);
    } catch (error) {
      console.error('Error fetching tracking data:', error);
      setPatients([]);
      toast.error('Failed to load patient tracking data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-health-success text-white';
      case 'critical': return 'bg-health-danger text-white';
      case 'stable': return 'bg-health-aqua text-white';
      case 'discharged': return 'bg-health-blue-gray text-white';
      case 'transferred': return 'bg-purple-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getLocationIcon = (location: string) => {
    switch (location?.toLowerCase()) {
      case 'emergency': return <AlertTriangle className="w-4 h-4" />;
      case 'icu': return <Heart className="w-4 h-4" />;
      case 'operating_room': return <UserCheck className="w-4 h-4" />;
      case 'recovery': return <Activity className="w-4 h-4" />;
      case 'ward': return <Bed className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const getVitalStatusColor = (value: string, type: string) => {
    if (!value) return 'text-gray-400';
    
    const numValue = parseFloat(value);
    switch (type) {
      case 'heartRate':
        return numValue > 100 || numValue < 60 ? 'text-red-600' : 'text-green-600';
      case 'bloodPressure':
        const [systolic, diastolic] = value.split('/').map(Number);
        return systolic > 140 || diastolic > 90 ? 'text-red-600' : 'text-green-600';
      case 'temperature':
        return numValue > 100.4 || numValue < 95 ? 'text-red-600' : 'text-green-600';
      case 'oxygenSaturation':
        return numValue < 95 ? 'text-red-600' : 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const filteredPatients = patients.filter(patient => {
    const name = patient.patientName;
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.patientId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.currentLocation || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
    const matchesLocation = locationFilter === 'all' || patient.currentLocation === locationFilter;
    return matchesSearch && matchesStatus && matchesLocation;
  });

  const handleUpdateTracking = async () => {
    try {
      const response = await hospitalCareService.updatePatientTracking(newTracking.patientId, newTracking);
      setPatients(patients.map(p => p.patientId === newTracking.patientId ? response.patient : p));
      setShowTrackingModal(false);
      toast.success('Patient tracking updated successfully');
    } catch (error) {
      console.error('Error updating tracking:', error);
      toast.error('Failed to update patient tracking');
    }
  };

  const trackingStats = {
    total: patients.length,
    active: patients.filter(p => p.status === 'active').length,
    critical: patients.filter(p => p.status === 'critical').length,
    stable: patients.filter(p => p.status === 'stable').length,
    transferred: patients.filter(p => p.status === 'transferred').length
  };

  const locationStats = {
    emergency: patients.filter(p => p.currentLocation === 'emergency').length,
    icu: patients.filter(p => p.currentLocation === 'icu').length,
    ward: patients.filter(p => p.currentLocation === 'ward').length,
    operating_room: patients.filter(p => p.currentLocation === 'operating_room').length,
    recovery: patients.filter(p => p.currentLocation === 'recovery').length
  };

  const criticalPatients = patients.filter(p => p.status === 'critical');

  return (
    <div className="min-h-screen bg-gradient-to-br from-health-light-gray via-white to-health-light-gray/40">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
            <p className="text-xs font-semibold tracking-[0.3em] text-health-aqua/70 uppercase mb-2">Care Operations</p>
          <h1 className="text-3xl font-montserrat font-bold text-health-teal">Patient Tracking</h1>
          <p className="text-health-charcoal mt-2">Real-time patient monitoring and location tracking</p>
        </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="border-health-teal/30 text-health-teal hover:bg-health-teal/10" onClick={() => navigate('/hospital/patient-care')}>
            <Users className="w-4 h-4 mr-2" />
            Patient Care
          </Button>
            <Button className="bg-health-aqua hover:bg-health-aqua/90 text-white shadow-lg shadow-health-aqua/30" onClick={() => setShowTrackingModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Tracking
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className={surfaceCard}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
                <div className="p-2 bg-health-teal/15 rounded-xl">
                <Navigation className="w-6 h-6 text-health-teal" />
              </div>
              <div>
                  <p className="text-sm text-health-charcoal/70">Total Tracked</p>
                <p className="text-2xl font-bold text-health-teal">{trackingStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

          <Card className={surfaceCard}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
                <div className="p-2 bg-health-success/15 rounded-xl">
                <UserCheck className="w-6 h-6 text-health-success" />
              </div>
              <div>
                  <p className="text-sm text-health-charcoal/70">Active</p>
                <p className="text-2xl font-bold text-health-success">{trackingStats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

          <Card className={surfaceCard}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
                <div className="p-2 bg-health-danger/15 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-health-danger" />
              </div>
              <div>
                  <p className="text-sm text-health-charcoal/70">Critical</p>
                <p className="text-2xl font-bold text-health-danger">{trackingStats.critical}</p>
              </div>
            </div>
          </CardContent>
        </Card>

          <Card className={surfaceCard}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
                <div className="p-2 bg-health-aqua/15 rounded-xl">
                <Activity className="w-6 h-6 text-health-aqua" />
              </div>
              <div>
                  <p className="text-sm text-health-charcoal/70">Stable</p>
                <p className="text-2xl font-bold text-health-aqua">{trackingStats.stable}</p>
              </div>
            </div>
          </CardContent>
        </Card>

          <Card className={surfaceCard}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-xl">
                <Map className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                  <p className="text-sm text-health-charcoal/70">Transferred</p>
                <p className="text-2xl font-bold text-purple-600">{trackingStats.transferred}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="tracking" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 border border-white/60 shadow-sm backdrop-blur rounded-2xl">
          <TabsTrigger value="tracking">Live Tracking</TabsTrigger>
          <TabsTrigger value="locations">Location Map</TabsTrigger>
          <TabsTrigger value="critical">Critical Alerts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="tracking" className="space-y-6">
          {/* Filters */}
          <Card className={surfaceCard}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search patients by name, ID, or location..."
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
                    <SelectItem value="transferred">Transferred</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="icu">ICU</SelectItem>
                    <SelectItem value="ward">Ward</SelectItem>
                    <SelectItem value="operating_room">Operating Room</SelectItem>
                    <SelectItem value="recovery">Recovery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tracking Table */}
          <Card className={surfaceCard}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Navigation className="w-5 h-5" />
                <span>Patient Tracking</span>
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
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Vital Signs</TableHead>
                        <TableHead>Last Seen</TableHead>
                        <TableHead>Assigned Staff</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPatients.map((patient) => (
                        <TableRow key={patient.patientId}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage src={patient.avatar} />
                                <AvatarFallback>
                                  {patient.patientName?.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{patient.patientName}</p>
                                <p className="text-sm text-gray-500">ID: {patient.patientId}</p>
                                <p className="text-xs text-gray-400">Room: {patient.roomNumber}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getLocationIcon(patient.currentLocation)}
                              <span className="capitalize">{patient.currentLocation?.replace('_', ' ')}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(patient.status)}>
                              {patient.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <Heart className="w-3 h-3" />
                                <span className={`text-xs ${getVitalStatusColor(patient.vitalSigns?.heartRate, 'heartRate')}`}>
                                  {patient.vitalSigns?.heartRate || 'N/A'} bpm
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Thermometer className="w-3 h-3" />
                                <span className={`text-xs ${getVitalStatusColor(patient.vitalSigns?.temperature, 'temperature')}`}>
                                  {patient.vitalSigns?.temperature || 'N/A'}°F
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Activity className="w-3 h-3" />
                                <span className={`text-xs ${getVitalStatusColor(patient.vitalSigns?.oxygenSaturation, 'oxygenSaturation')}`}>
                                  {patient.vitalSigns?.oxygenSaturation || 'N/A'}%
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {patient.lastSeen ? new Date(patient.lastSeen).toLocaleTimeString() : 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {patient.lastSeen ? new Date(patient.lastSeen).toLocaleDateString() : ''}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="text-sm">{patient.assignedNurse}</p>
                              <p className="text-xs text-gray-500">{patient.assignedDoctor}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedPatient(patient)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setNewTracking(patient);
                                  setShowTrackingModal(true);
                                }}
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
                      <Navigation className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No patients found</p>
                      <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(locationStats).map(([location, count]) => (
              <Card key={location} className={`${surfaceCard} cursor-pointer hover:shadow-lg transition-shadow`}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg ${
                      location === 'emergency' ? 'bg-red-500' :
                      location === 'icu' ? 'bg-orange-500' :
                      location === 'ward' ? 'bg-blue-500' :
                      location === 'operating_room' ? 'bg-purple-500' :
                      'bg-green-500'
                    } text-white`}>
                      {getLocationIcon(location)}
                    </div>
                    <span className="capitalize">{location.replace('_', ' ')}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Patients</span>
                      <span className="font-semibold text-2xl">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          location === 'emergency' ? 'bg-red-500' :
                          location === 'icu' ? 'bg-orange-500' :
                          location === 'ward' ? 'bg-blue-500' :
                          location === 'operating_room' ? 'bg-purple-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${(count / Math.max(...Object.values(locationStats))) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {count > 0 ? `${count} patient${count > 1 ? 's' : ''} currently here` : 'No patients'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="critical" className="space-y-6">
          <Card className={surfaceCard}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span>Critical Patient Alerts ({criticalPatients.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {criticalPatients.map((patient) => (
                  <div key={patient.patientId} className="flex items-center space-x-4 p-4 border border-red-200 rounded-lg bg-red-50">
                    <div className="p-2 bg-red-100 rounded-full">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-red-800">{patient.patientName}</p>
                      <p className="text-sm text-red-600">{patient.currentLocation} • Room {patient.roomNumber}</p>
                      <div className="flex space-x-4 mt-2">
                        <span className="text-xs text-red-600">
                          HR: {patient.vitalSigns?.heartRate || 'N/A'} bpm
                        </span>
                        <span className="text-xs text-red-600">
                          BP: {patient.vitalSigns?.bloodPressure || 'N/A'}
                        </span>
                        <span className="text-xs text-red-600">
                          O2: {patient.vitalSigns?.oxygenSaturation || 'N/A'}%
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-red-600">{patient.assignedNurse}</p>
                      <p className="text-xs text-red-500">{patient.lastSeen ? new Date(patient.lastSeen).toLocaleTimeString() : 'N/A'}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPatient(patient)}
                      className="border-red-300 text-red-600 hover:bg-red-100"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                
                {criticalPatients.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                    <p className="text-green-600">No critical patients at this time</p>
                    <p className="text-sm text-green-500">All patients are stable</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className={surfaceCard}>
              <CardHeader>
                <CardTitle>Patient Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(trackingStats).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          status === 'total' ? 'bg-health-teal' :
                          status === 'active' ? 'bg-health-success' :
                          status === 'critical' ? 'bg-health-danger' :
                          status === 'stable' ? 'bg-health-aqua' :
                          'bg-purple-500'
                        }`}></div>
                        <span className="capitalize">{status}</span>
                      </div>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className={surfaceCard}>
              <CardHeader>
                <CardTitle>Location Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(locationStats).map(([location, count]) => (
                    <div key={location} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          location === 'emergency' ? 'bg-red-500' :
                          location === 'icu' ? 'bg-orange-500' :
                          location === 'ward' ? 'bg-blue-500' :
                          location === 'operating_room' ? 'bg-purple-500' :
                          'bg-green-500'
                        }`}></div>
                        <span className="capitalize">{location.replace('_', ' ')}</span>
                      </div>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Tracking Modal */}
      <Dialog open={showTrackingModal} onOpenChange={setShowTrackingModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Update Patient Tracking</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Patient ID</Label>
              <Input
                value={newTracking.patientId}
                onChange={(e) => setNewTracking({...newTracking, patientId: e.target.value})}
                placeholder="Enter patient ID"
              />
            </div>
            <div>
              <Label>Patient Name</Label>
              <Input
                value={newTracking.patientName}
                onChange={(e) => setNewTracking({...newTracking, patientName: e.target.value})}
              />
            </div>
            <div>
              <Label>Current Location</Label>
              <Select value={newTracking.currentLocation} onValueChange={(value) => setNewTracking({...newTracking, currentLocation: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="icu">ICU</SelectItem>
                  <SelectItem value="ward">Ward</SelectItem>
                  <SelectItem value="operating_room">Operating Room</SelectItem>
                  <SelectItem value="recovery">Recovery</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={newTracking.status} onValueChange={(value) => setNewTracking({...newTracking, status: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="stable">Stable</SelectItem>
                  <SelectItem value="transferred">Transferred</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Room Number</Label>
              <Input
                value={newTracking.roomNumber}
                onChange={(e) => setNewTracking({...newTracking, roomNumber: e.target.value})}
              />
            </div>
            <div>
              <Label>Bed Number</Label>
              <Input
                value={newTracking.bedNumber}
                onChange={(e) => setNewTracking({...newTracking, bedNumber: e.target.value})}
              />
            </div>
            <div>
              <Label>Assigned Nurse</Label>
              <Input
                value={newTracking.assignedNurse}
                onChange={(e) => setNewTracking({...newTracking, assignedNurse: e.target.value})}
              />
            </div>
            <div>
              <Label>Assigned Doctor</Label>
              <Input
                value={newTracking.assignedDoctor}
                onChange={(e) => setNewTracking({...newTracking, assignedDoctor: e.target.value})}
              />
            </div>
            <div>
              <Label>Heart Rate</Label>
              <Input
                value={newTracking.vitalSigns.heartRate}
                onChange={(e) => setNewTracking({
                  ...newTracking, 
                  vitalSigns: {...newTracking.vitalSigns, heartRate: e.target.value}
                })}
                placeholder="bpm"
              />
            </div>
            <div>
              <Label>Blood Pressure</Label>
              <Input
                value={newTracking.vitalSigns.bloodPressure}
                onChange={(e) => setNewTracking({
                  ...newTracking, 
                  vitalSigns: {...newTracking.vitalSigns, bloodPressure: e.target.value}
                })}
                placeholder="e.g., 120/80"
              />
            </div>
            <div>
              <Label>Temperature</Label>
              <Input
                value={newTracking.vitalSigns.temperature}
                onChange={(e) => setNewTracking({
                  ...newTracking, 
                  vitalSigns: {...newTracking.vitalSigns, temperature: e.target.value}
                })}
                placeholder="°F"
              />
            </div>
            <div>
              <Label>Oxygen Saturation</Label>
              <Input
                value={newTracking.vitalSigns.oxygenSaturation}
                onChange={(e) => setNewTracking({
                  ...newTracking, 
                  vitalSigns: {...newTracking.vitalSigns, oxygenSaturation: e.target.value}
                })}
                placeholder="%"
              />
            </div>
            <div className="col-span-2">
              <Label>Notes</Label>
              <Textarea
                value={newTracking.notes}
                onChange={(e) => setNewTracking({...newTracking, notes: e.target.value})}
                rows={3}
                placeholder="Additional tracking notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTrackingModal(false)}>Cancel</Button>
            <Button onClick={handleUpdateTracking}>Update Tracking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Patient Details Modal */}
      {selectedPatient && (
        <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback>
                    {selectedPatient.patientName?.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">{selectedPatient.patientName}</h2>
                  <p className="text-sm text-gray-500">Patient Tracking Details</p>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Patient Information</Label>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Patient ID:</span> {selectedPatient.patientId}</p>
                    <p><span className="font-medium">Room:</span> {selectedPatient.roomNumber}</p>
                    <p><span className="font-medium">Bed:</span> {selectedPatient.bedNumber}</p>
                    <p><span className="font-medium">Department:</span> {selectedPatient.department}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Location & Status</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      {getLocationIcon(selectedPatient.currentLocation)}
                      <span className="capitalize">{selectedPatient.currentLocation?.replace('_', ' ')}</span>
                    </div>
                    <Badge className={getStatusColor(selectedPatient.status)}>
                      {selectedPatient.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Vital Signs</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Heart className="w-4 h-4" />
                      <span className={getVitalStatusColor(selectedPatient.vitalSigns?.heartRate, 'heartRate')}>
                        {selectedPatient.vitalSigns?.heartRate || 'N/A'} bpm
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4" />
                      <span className={getVitalStatusColor(selectedPatient.vitalSigns?.bloodPressure, 'bloodPressure')}>
                        {selectedPatient.vitalSigns?.bloodPressure || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Thermometer className="w-4 h-4" />
                      <span className={getVitalStatusColor(selectedPatient.vitalSigns?.temperature, 'temperature')}>
                        {selectedPatient.vitalSigns?.temperature || 'N/A'}°F
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4" />
                      <span className={getVitalStatusColor(selectedPatient.vitalSigns?.oxygenSaturation, 'oxygenSaturation')}>
                        {selectedPatient.vitalSigns?.oxygenSaturation || 'N/A'}%
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Assigned Staff</Label>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Nurse:</span> {selectedPatient.assignedNurse}</p>
                    <p><span className="font-medium">Doctor:</span> {selectedPatient.assignedDoctor}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <Label className="text-sm font-medium text-gray-700">Last Updated</Label>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm">{selectedPatient.lastSeen ? new Date(selectedPatient.lastSeen).toLocaleString() : 'N/A'}</p>
              </div>
            </div>
            <div className="mt-6">
              <Label className="text-sm font-medium text-gray-700">Notes</Label>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm">{selectedPatient.notes || 'No notes available'}</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedPatient(null)}>Close</Button>
              <Button onClick={() => {
                setSelectedPatient(null);
                setNewTracking(selectedPatient);
                setShowTrackingModal(true);
              }}>Update Tracking</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      </div>
    </div>
  );
};

export default PatientTracking; 