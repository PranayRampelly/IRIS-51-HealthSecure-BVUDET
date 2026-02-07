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
  ArrowRight, CalendarDays, Clock as ClockIcon,
  Home, Car, UserCheck as UserCheckIcon, FileCheck, ClipboardList,
  History, FileSearch, Database, Archive, Printer, Share2,
  Navigation, Map, Wifi, Signal, Battery, Zap,
  Ambulance, Siren, AlertCircle, Zap as ZapIcon, Timer
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const EmergencyCases: React.FC = () => {
  const navigate = useNavigate();
  const surfaceCard = "bg-white/80 border border-white/60 shadow-sm backdrop-blur";
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [emergencies, setEmergencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmergency, setSelectedEmergency] = useState<any>(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [newEmergency, setNewEmergency] = useState({
    patientId: '',
    patientName: '',
    emergencyType: '',
    priority: '',
    status: '',
    arrivalTime: '',
    triageLevel: '',
    chiefComplaint: '',
    vitalSigns: {
      heartRate: '',
      bloodPressure: '',
      temperature: '',
      oxygenSaturation: '',
      consciousness: ''
    },
    assignedDoctor: '',
    assignedNurse: '',
    treatmentPlan: '',
    notes: '',
    ambulanceInfo: {
      ambulanceNumber: '',
      driver: '',
      paramedic: ''
    }
  });

  useEffect(() => {
    fetchEmergencyData();
    // Set up real-time updates every 15 seconds for emergencies
    const interval = setInterval(fetchEmergencyData, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchEmergencyData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/hospital/emergencies', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmergencies(response.data.emergencies || []);
    } catch (error) {
      console.error('Error fetching emergency data:', error);
      setEmergencies([]);
      toast.error('Failed to load emergency cases');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white';
      case 'urgent': return 'bg-orange-500 text-white';
      case 'high': return 'bg-yellow-500 text-white';
      case 'medium': return 'bg-blue-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'arrived': return 'bg-blue-500 text-white';
      case 'triage': return 'bg-yellow-500 text-white';
      case 'treatment': return 'bg-orange-500 text-white';
      case 'stabilized': return 'bg-green-500 text-white';
      case 'discharged': return 'bg-gray-500 text-white';
      case 'transferred': return 'bg-purple-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getEmergencyTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'cardiac': return <Heart className="w-4 h-4" />;
      case 'trauma': return <AlertTriangle className="w-4 h-4" />;
      case 'respiratory': return <Activity className="w-4 h-4" />;
      case 'neurological': return <Brain className="w-4 h-4" />;
      case 'pediatric': return <Baby className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getTriageLevelColor = (level: string) => {
    switch (level) {
      case '1': return 'bg-red-500 text-white';
      case '2': return 'bg-orange-500 text-white';
      case '3': return 'bg-yellow-500 text-white';
      case '4': return 'bg-blue-500 text-white';
      case '5': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const filteredEmergencies = emergencies.filter(emergency => {
    const name = emergency.patientName;
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emergency.patientId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emergency.chiefComplaint || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || emergency.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || emergency.status === statusFilter;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const handleCreateEmergency = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8080/api/hospital/emergencies', newEmergency, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setEmergencies([...emergencies, response.data.emergency]);
      setShowEmergencyModal(false);
      setNewEmergency({
        patientId: '', patientName: '', emergencyType: '', priority: '', status: '', arrivalTime: '',
        triageLevel: '', chiefComplaint: '', vitalSigns: {
          heartRate: '', bloodPressure: '', temperature: '', oxygenSaturation: '', consciousness: ''
        }, assignedDoctor: '', assignedNurse: '', treatmentPlan: '', notes: '', ambulanceInfo: {
          ambulanceNumber: '', driver: '', paramedic: ''
        }
      });
      toast.success('Emergency case created successfully');
    } catch (error) {
      console.error('Error creating emergency:', error);
      toast.error('Failed to create emergency case');
    }
  };

  const handleUpdateStatus = async (emergencyId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8080/api/hospital/emergencies/${emergencyId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEmergencies(emergencies.map(e => e.id === emergencyId ? { ...e, status: newStatus } : e));
      toast.success('Emergency status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update emergency status');
    }
  };

  const emergencyStats = {
    total: emergencies.length,
    critical: emergencies.filter(e => e.priority === 'critical').length,
    urgent: emergencies.filter(e => e.priority === 'urgent').length,
    arrived: emergencies.filter(e => e.status === 'arrived').length,
    triage: emergencies.filter(e => e.status === 'triage').length,
    treatment: emergencies.filter(e => e.status === 'treatment').length
  };

  const criticalCases = emergencies.filter(e => e.priority === 'critical');
  const waitingCases = emergencies.filter(e => ['arrived', 'triage'].includes(e.status));

  return (
    <div className="min-h-screen bg-gradient-to-br from-health-light-gray via-white to-health-light-gray/40">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.3em] text-health-aqua/70 uppercase mb-2">Emergency Hub</p>
            <h1 className="text-3xl font-montserrat font-bold text-health-teal">Emergency Cases</h1>
            <p className="text-health-charcoal mt-2">Emergency department management and triage coordination</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="border-health-teal/30 text-health-teal hover:bg-health-teal/10" onClick={() => navigate('/hospital/patient-care')}>
              <Users className="w-4 h-4 mr-2" />
              Patient Care
            </Button>
            <Button className="bg-health-aqua hover:bg-health-aqua/90 text-white shadow-lg shadow-health-aqua/30" onClick={() => setShowEmergencyModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Emergency
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <Card className={surfaceCard}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-health-teal/15 rounded-xl">
                  <Siren className="w-6 h-6 text-health-teal" />
                </div>
                <div>
                  <p className="text-sm text-health-charcoal/70">Total Cases</p>
                  <p className="text-2xl font-bold text-health-teal">{emergencyStats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={surfaceCard}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-health-charcoal/70">Critical</p>
                  <p className="text-2xl font-bold text-red-600">{emergencyStats.critical}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={surfaceCard}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-xl">
                  <Timer className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-health-charcoal/70">Urgent</p>
                  <p className="text-2xl font-bold text-orange-600">{emergencyStats.urgent}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={surfaceCard}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Ambulance className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-health-charcoal/70">Arrived</p>
                  <p className="text-2xl font-bold text-blue-600">{emergencyStats.arrived}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={surfaceCard}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-xl">
                  <ClipboardList className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-health-charcoal/70">Triage</p>
                  <p className="text-2xl font-bold text-yellow-600">{emergencyStats.triage}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={surfaceCard}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-xl">
                  <Stethoscope className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-health-charcoal/70">Treatment</p>
                  <p className="text-2xl font-bold text-green-600">{emergencyStats.treatment}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="emergencies" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 border border-white/60 shadow-sm backdrop-blur rounded-2xl">
            <TabsTrigger value="emergencies">All Cases</TabsTrigger>
            <TabsTrigger value="critical">Critical Cases</TabsTrigger>
            <TabsTrigger value="waiting">Waiting Room</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="emergencies" className="space-y-6">
            {/* Filters */}
            <Card className={surfaceCard}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search emergencies by patient name, ID, or complaint..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filter by priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="arrived">Arrived</SelectItem>
                      <SelectItem value="triage">Triage</SelectItem>
                      <SelectItem value="treatment">Treatment</SelectItem>
                      <SelectItem value="stabilized">Stabilized</SelectItem>
                      <SelectItem value="discharged">Discharged</SelectItem>
                      <SelectItem value="transferred">Transferred</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Emergencies Table */}
            <Card className={surfaceCard}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Siren className="w-5 h-5" />
                  <span>Emergency Cases</span>
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
                          <TableHead>Type</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Triage</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Arrival Time</TableHead>
                          <TableHead>Assigned Staff</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEmergencies.map((emergency) => (
                          <TableRow key={emergency.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar>
                                  <AvatarImage src={emergency.avatar} />
                                  <AvatarFallback>
                                    {emergency.patientName?.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{emergency.patientName}</p>
                                  <p className="text-sm text-gray-500">ID: {emergency.patientId}</p>
                                  <p className="text-xs text-gray-400">{emergency.chiefComplaint}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {getEmergencyTypeIcon(emergency.emergencyType)}
                                <span className="capitalize">{emergency.emergencyType}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getPriorityColor(emergency.priority)}>
                                {emergency.priority}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getTriageLevelColor(emergency.triageLevel)}>
                                Level {emergency.triageLevel}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(emergency.status)}>
                                {emergency.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {emergency.arrivalTime ? new Date(emergency.arrivalTime).toLocaleTimeString() : 'N/A'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {emergency.arrivalTime ? new Date(emergency.arrivalTime).toLocaleDateString() : ''}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <p className="text-sm">{emergency.assignedDoctor}</p>
                                <p className="text-xs text-gray-500">{emergency.assignedNurse}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedEmergency(emergency)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                {emergency.status === 'arrived' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUpdateStatus(emergency.id, 'triage')}
                                    className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                                  >
                                    <ClipboardList className="w-4 h-4" />
                                  </Button>
                                )}
                                {emergency.status === 'triage' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUpdateStatus(emergency.id, 'treatment')}
                                    className="text-green-600 border-green-600 hover:bg-green-50"
                                  >
                                    <Stethoscope className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {filteredEmergencies.length === 0 && !loading && (
                      <div className="text-center py-8">
                        <Siren className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No emergency cases found</p>
                        <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="critical" className="space-y-6">
            <Card className={surfaceCard}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span>Critical Cases ({criticalCases.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {criticalCases.map((emergency) => (
                    <div key={emergency.id} className="flex items-center space-x-4 p-4 border border-red-200 rounded-lg bg-red-50">
                      <div className="p-2 bg-red-100 rounded-full">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-red-800">{emergency.patientName}</p>
                        <p className="text-sm text-red-600">{emergency.emergencyType} • {emergency.chiefComplaint}</p>
                        <div className="flex space-x-4 mt-2">
                          <span className="text-xs text-red-600">
                            HR: {emergency.vitalSigns?.heartRate || 'N/A'} bpm
                          </span>
                          <span className="text-xs text-red-600">
                            BP: {emergency.vitalSigns?.bloodPressure || 'N/A'}
                          </span>
                          <span className="text-xs text-red-600">
                            O2: {emergency.vitalSigns?.oxygenSaturation || 'N/A'}%
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(emergency.status)}>
                          {emergency.status}
                        </Badge>
                        <p className="text-sm text-red-600 mt-1">{emergency.assignedDoctor}</p>
                        <p className="text-xs text-red-500">{emergency.arrivalTime ? new Date(emergency.arrivalTime).toLocaleTimeString() : 'N/A'}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedEmergency(emergency)}
                        className="border-red-300 text-red-600 hover:bg-red-100"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}

                  {criticalCases.length === 0 && (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                      <p className="text-green-600">No critical cases at this time</p>
                      <p className="text-sm text-green-500">All emergency cases are under control</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="waiting" className="space-y-6">
            <Card className={surfaceCard}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span>Waiting Room ({waitingCases.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {waitingCases.map((emergency) => (
                    <div key={emergency.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className={`p-2 rounded-full ${emergency.priority === 'critical' ? 'bg-red-100' :
                          emergency.priority === 'urgent' ? 'bg-orange-100' :
                            'bg-blue-100'
                        }`}>
                        <Timer className={`w-6 h-6 ${emergency.priority === 'critical' ? 'text-red-600' :
                            emergency.priority === 'urgent' ? 'text-orange-600' :
                              'text-blue-600'
                          }`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{emergency.patientName}</p>
                        <p className="text-sm text-gray-500">{emergency.emergencyType} • {emergency.chiefComplaint}</p>
                        <p className="text-xs text-gray-400">Arrived: {emergency.arrivalTime ? new Date(emergency.arrivalTime).toLocaleTimeString() : 'N/A'}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={getPriorityColor(emergency.priority)}>
                          {emergency.priority}
                        </Badge>
                        <Badge className={getStatusColor(emergency.status)}>
                          {emergency.status}
                        </Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedEmergency(emergency)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}

                  {waitingCases.length === 0 && (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                      <p className="text-green-600">No patients waiting</p>
                      <p className="text-sm text-green-500">All patients have been attended to</p>
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
                  <CardTitle>Emergency Type Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { type: 'Cardiac', count: emergencies.filter(e => e.emergencyType === 'cardiac').length, color: 'bg-red-500' },
                      { type: 'Trauma', count: emergencies.filter(e => e.emergencyType === 'trauma').length, color: 'bg-orange-500' },
                      { type: 'Respiratory', count: emergencies.filter(e => e.emergencyType === 'respiratory').length, color: 'bg-blue-500' },
                      { type: 'Neurological', count: emergencies.filter(e => e.emergencyType === 'neurological').length, color: 'bg-purple-500' },
                      { type: 'Pediatric', count: emergencies.filter(e => e.emergencyType === 'pediatric').length, color: 'bg-green-500' },
                    ].map((item) => (
                      <div key={item.type} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                          <span>{item.type}</span>
                        </div>
                        <span className="font-semibold">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className={surfaceCard}>
                <CardHeader>
                  <CardTitle>Priority Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { priority: 'Critical', count: emergencyStats.critical, color: 'bg-red-500' },
                      { priority: 'Urgent', count: emergencyStats.urgent, color: 'bg-orange-500' },
                      { priority: 'High', count: emergencies.filter(e => e.priority === 'high').length, color: 'bg-yellow-500' },
                      { priority: 'Medium', count: emergencies.filter(e => e.priority === 'medium').length, color: 'bg-blue-500' },
                      { priority: 'Low', count: emergencies.filter(e => e.priority === 'low').length, color: 'bg-green-500' },
                    ].map((item) => (
                      <div key={item.priority} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                          <span>{item.priority}</span>
                        </div>
                        <span className="font-semibold">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

      </div>

      {/* New Emergency Modal */}
      <Dialog open={showEmergencyModal} onOpenChange={setShowEmergencyModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Emergency Case</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Patient ID</Label>
              <Input
                value={newEmergency.patientId}
                onChange={(e) => setNewEmergency({ ...newEmergency, patientId: e.target.value })}
                placeholder="Enter patient ID"
              />
            </div>
            <div>
              <Label>Patient Name</Label>
              <Input
                value={newEmergency.patientName}
                onChange={(e) => setNewEmergency({ ...newEmergency, patientName: e.target.value })}
              />
            </div>
            <div>
              <Label>Emergency Type</Label>
              <Select value={newEmergency.emergencyType} onValueChange={(value) => setNewEmergency({ ...newEmergency, emergencyType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select emergency type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cardiac">Cardiac</SelectItem>
                  <SelectItem value="trauma">Trauma</SelectItem>
                  <SelectItem value="respiratory">Respiratory</SelectItem>
                  <SelectItem value="neurological">Neurological</SelectItem>
                  <SelectItem value="pediatric">Pediatric</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={newEmergency.priority} onValueChange={(value) => setNewEmergency({ ...newEmergency, priority: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={newEmergency.status} onValueChange={(value) => setNewEmergency({ ...newEmergency, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="arrived">Arrived</SelectItem>
                  <SelectItem value="triage">Triage</SelectItem>
                  <SelectItem value="treatment">Treatment</SelectItem>
                  <SelectItem value="stabilized">Stabilized</SelectItem>
                  <SelectItem value="discharged">Discharged</SelectItem>
                  <SelectItem value="transferred">Transferred</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Triage Level</Label>
              <Select value={newEmergency.triageLevel} onValueChange={(value) => setNewEmergency({ ...newEmergency, triageLevel: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select triage level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Level 1 - Immediate</SelectItem>
                  <SelectItem value="2">Level 2 - Very Urgent</SelectItem>
                  <SelectItem value="3">Level 3 - Urgent</SelectItem>
                  <SelectItem value="4">Level 4 - Less Urgent</SelectItem>
                  <SelectItem value="5">Level 5 - Non-Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Arrival Time</Label>
              <Input
                type="datetime-local"
                value={newEmergency.arrivalTime}
                onChange={(e) => setNewEmergency({ ...newEmergency, arrivalTime: e.target.value })}
              />
            </div>
            <div>
              <Label>Chief Complaint</Label>
              <Input
                value={newEmergency.chiefComplaint}
                onChange={(e) => setNewEmergency({ ...newEmergency, chiefComplaint: e.target.value })}
                placeholder="Primary complaint or reason for visit"
              />
            </div>
            <div>
              <Label>Assigned Doctor</Label>
              <Input
                value={newEmergency.assignedDoctor}
                onChange={(e) => setNewEmergency({ ...newEmergency, assignedDoctor: e.target.value })}
              />
            </div>
            <div>
              <Label>Assigned Nurse</Label>
              <Input
                value={newEmergency.assignedNurse}
                onChange={(e) => setNewEmergency({ ...newEmergency, assignedNurse: e.target.value })}
              />
            </div>
            <div>
              <Label>Heart Rate</Label>
              <Input
                value={newEmergency.vitalSigns.heartRate}
                onChange={(e) => setNewEmergency({
                  ...newEmergency,
                  vitalSigns: { ...newEmergency.vitalSigns, heartRate: e.target.value }
                })}
                placeholder="bpm"
              />
            </div>
            <div>
              <Label>Blood Pressure</Label>
              <Input
                value={newEmergency.vitalSigns.bloodPressure}
                onChange={(e) => setNewEmergency({
                  ...newEmergency,
                  vitalSigns: { ...newEmergency.vitalSigns, bloodPressure: e.target.value }
                })}
                placeholder="e.g., 120/80"
              />
            </div>
            <div>
              <Label>Temperature</Label>
              <Input
                value={newEmergency.vitalSigns.temperature}
                onChange={(e) => setNewEmergency({
                  ...newEmergency,
                  vitalSigns: { ...newEmergency.vitalSigns, temperature: e.target.value }
                })}
                placeholder="°F"
              />
            </div>
            <div>
              <Label>Oxygen Saturation</Label>
              <Input
                value={newEmergency.vitalSigns.oxygenSaturation}
                onChange={(e) => setNewEmergency({
                  ...newEmergency,
                  vitalSigns: { ...newEmergency.vitalSigns, oxygenSaturation: e.target.value }
                })}
                placeholder="%"
              />
            </div>
            <div>
              <Label>Consciousness</Label>
              <Select value={newEmergency.vitalSigns.consciousness} onValueChange={(value) => setNewEmergency({
                ...newEmergency,
                vitalSigns: { ...newEmergency.vitalSigns, consciousness: value }
              })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select consciousness level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alert">Alert</SelectItem>
                  <SelectItem value="verbal">Verbal</SelectItem>
                  <SelectItem value="pain">Pain</SelectItem>
                  <SelectItem value="unresponsive">Unresponsive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Treatment Plan</Label>
              <Textarea
                value={newEmergency.treatmentPlan}
                onChange={(e) => setNewEmergency({ ...newEmergency, treatmentPlan: e.target.value })}
                rows={3}
                placeholder="Initial treatment plan and interventions"
              />
            </div>
            <div className="col-span-2">
              <Label>Notes</Label>
              <Textarea
                value={newEmergency.notes}
                onChange={(e) => setNewEmergency({ ...newEmergency, notes: e.target.value })}
                rows={3}
                placeholder="Additional notes and observations"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmergencyModal(false)}>Cancel</Button>
            <Button onClick={handleCreateEmergency}>Create Emergency Case</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Emergency Details Modal */}
      {selectedEmergency && (
        <Dialog open={!!selectedEmergency} onOpenChange={() => setSelectedEmergency(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback>
                    {selectedEmergency.patientName?.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">{selectedEmergency.patientName}</h2>
                  <p className="text-sm text-gray-500">Emergency Case Details</p>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Patient Information</Label>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Patient ID:</span> {selectedEmergency.patientId}</p>
                    <p><span className="font-medium">Arrival Time:</span> {selectedEmergency.arrivalTime ? new Date(selectedEmergency.arrivalTime).toLocaleString() : 'N/A'}</p>
                    <p><span className="font-medium">Chief Complaint:</span> {selectedEmergency.chiefComplaint}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Emergency Details</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      {getEmergencyTypeIcon(selectedEmergency.emergencyType)}
                      <span className="capitalize">{selectedEmergency.emergencyType}</span>
                    </div>
                    <Badge className={getPriorityColor(selectedEmergency.priority)}>
                      {selectedEmergency.priority}
                    </Badge>
                    <Badge className={getStatusColor(selectedEmergency.status)}>
                      {selectedEmergency.status}
                    </Badge>
                    <Badge className={getTriageLevelColor(selectedEmergency.triageLevel)}>
                      Triage Level {selectedEmergency.triageLevel}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Vital Signs</Label>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Heart Rate:</span> {selectedEmergency.vitalSigns?.heartRate || 'N/A'} bpm</p>
                    <p><span className="font-medium">Blood Pressure:</span> {selectedEmergency.vitalSigns?.bloodPressure || 'N/A'}</p>
                    <p><span className="font-medium">Temperature:</span> {selectedEmergency.vitalSigns?.temperature || 'N/A'}°F</p>
                    <p><span className="font-medium">Oxygen Saturation:</span> {selectedEmergency.vitalSigns?.oxygenSaturation || 'N/A'}%</p>
                    <p><span className="font-medium">Consciousness:</span> {selectedEmergency.vitalSigns?.consciousness || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Assigned Staff</Label>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Doctor:</span> {selectedEmergency.assignedDoctor}</p>
                    <p><span className="font-medium">Nurse:</span> {selectedEmergency.assignedNurse}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <Label className="text-sm font-medium text-gray-700">Treatment Plan</Label>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm">{selectedEmergency.treatmentPlan || 'No treatment plan available'}</p>
              </div>
            </div>
            <div className="mt-6">
              <Label className="text-sm font-medium text-gray-700">Notes</Label>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm">{selectedEmergency.notes || 'No notes available'}</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedEmergency(null)}>Close</Button>
              {selectedEmergency.status === 'arrived' && (
                <Button onClick={() => handleUpdateStatus(selectedEmergency.id, 'triage')}>
                  Move to Triage
                </Button>
              )}
              {selectedEmergency.status === 'triage' && (
                <Button onClick={() => handleUpdateStatus(selectedEmergency.id, 'treatment')}>
                  Start Treatment
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default EmergencyCases; 