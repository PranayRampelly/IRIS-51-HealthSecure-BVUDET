import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Phone, 
  Activity, 
  MapPin, 
  MessageSquare,
  Search, 
  Filter,
  Plus,
  Edit,
  Eye,
  Trash2,
  Clock,
  AlertTriangle,
  CheckCircle,
  User,
  Building,
  Shield,
  Zap,
  TrendingUp,
  BarChart3,
  Settings,
  Calendar,
  PhoneCall,
  Navigation,
  Heart,
  Stethoscope,
  Star,
  Award,
  Target,
  Gauge,
  Route,
  FileText,
  Download,
  Upload,
  Bell,
  Mail,
  Wrench,
  Fuel,
  Thermometer,
  Droplets,
  Battery,
  Wifi,
  Camera,
  Lock,
  Unlock,
  Package,
  DollarSign,
  Ambulance as AmbulanceIcon,
  Car,
  Timer,
  Map,
  MessageCircle,
  Headphones,
  Radio,
  Satellite,
  Signal,
  Brain
} from 'lucide-react';

interface EmergencyCall {
  id: string;
  patientName: string;
  patientId: string;
  phone: string;
  location: string;
  coordinates: { lat: number; lng: number };
  emergencyType: 'medical' | 'trauma' | 'cardiac' | 'respiratory' | 'pediatric' | 'obstetric' | 'psychiatric';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'assigned' | 'en-route' | 'arrived' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedDriver?: string;
  assignedVehicle?: string;
  callTime: string;
  estimatedArrival?: string;
  actualArrival?: string;
  completionTime?: string;
  notes?: string;
  symptoms: string[];
  vitalSigns?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    oxygenSaturation?: number;
  };
  dispatchNotes: string[];
  callerInfo: {
    name: string;
    relationship: string;
    phone: string;
  };
}

const EmergencyCalls: React.FC = () => {
  const [emergencyCalls, setEmergencyCalls] = useState<EmergencyCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedCall, setSelectedCall] = useState<EmergencyCall | null>(null);
  const [isAddCallDialogOpen, setIsAddCallDialogOpen] = useState(false);
  const [isViewCallDialogOpen, setIsViewCallDialogOpen] = useState(false);
  const [isDispatchDialogOpen, setIsDispatchDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    patientName: '',
    patientId: '',
    phone: '',
    emergencyType: '',
    severity: '',
    priority: '',
    location: '',
    symptoms: '',
    notes: ''
  });

  useEffect(() => {
    fetchEmergencyCalls();
  }, []);

  const fetchEmergencyCalls = async () => {
    try {
      setLoading(true);
      const response = await api.get('/hospital/ambulance/calls');
      const data = response.data;
      if (data.success && data.data) {
        // Transform API data to component format
        const transformedCalls: EmergencyCall[] = data.data.map((call: any) => ({
          id: call._id || call.callId,
          patientName: call.patient?.name || call.patientName || 'Unknown',
          patientId: call.patient?.patientId || call.patientId || 'N/A',
          phone: call.caller?.phone || call.phone || '',
          location: call.destination?.address || call.location || '',
          coordinates: call.destination?.coordinates || call.coordinates || { lat: 0, lng: 0 },
          emergencyType: call.emergencyDetails?.type || 'medical',
          severity: call.emergencyDetails?.priority || 'medium',
          status: call.status || 'pending',
          priority: call.emergencyDetails?.priority || 'medium',
          assignedDriver: call.dispatch?.driver?.name || call.assignedDriver,
          assignedVehicle: call.dispatch?.ambulanceService?.vehicleNumber || call.assignedVehicle,
          callTime: new Date(call.createdAt || call.callTime).toLocaleString(),
          estimatedArrival: call.dispatch?.estimatedArrival ? new Date(call.dispatch.estimatedArrival).toLocaleString() : undefined,
          actualArrival: call.dispatch?.arrivedAt ? new Date(call.dispatch.arrivedAt).toLocaleString() : undefined,
          completionTime: call.dispatch?.completedAt ? new Date(call.dispatch.completedAt).toLocaleString() : undefined,
          notes: call.notes || call.emergencyDetails?.description || '',
          symptoms: call.emergencyDetails?.symptoms || [],
          vitalSigns: call.vitalSigns || undefined,
          dispatchNotes: call.dispatch?.notes || [],
          callerInfo: {
            name: call.caller?.name || 'Unknown',
            relationship: call.caller?.relationship || '',
            phone: call.caller?.phone || ''
          }
        }));
        setEmergencyCalls(transformedCalls);
      } else {
        setEmergencyCalls([]);
      }
    } catch (error) {
      console.error('Error fetching emergency calls:', error);
      setEmergencyCalls([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'en-route': return 'bg-purple-100 text-purple-800';
      case 'arrived': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'cardiac': return <Heart className="w-4 h-4 text-red-600" />;
      case 'trauma': return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'respiratory': return <Droplets className="w-4 h-4 text-blue-600" />;
      case 'pediatric': return <User className="w-4 h-4 text-green-600" />;
      case 'obstetric': return <Heart className="w-4 h-4 text-pink-600" />;
      case 'psychiatric': return <Brain className="w-4 h-4 text-purple-600" />;
      default: return <Stethoscope className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleCreateCall = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.patientName || !formData.phone || !formData.location || !formData.emergencyType) {
        toast.error('Please fill in all required fields');
        return;
      }

      const symptomsArray = formData.symptoms ? formData.symptoms.split(',').map(s => s.trim()).filter(s => s) : [];

      const callData = {
        caller: {
          name: formData.patientName,
          phone: formData.phone,
          relationship: 'self'
        },
        patient: formData.patientId || null,
        emergencyDetails: {
          type: formData.emergencyType,
          priority: formData.priority || 'medium',
          severity: formData.severity || 'medium',
          location: {
            address: formData.location,
            coordinates: { lat: 0, lng: 0 }
          },
          symptoms: symptomsArray,
          description: formData.notes || ''
        },
        destination: {
          type: 'hospital',
          address: formData.location
        },
        notes: formData.notes || ''
      };

      const response = await api.post('/hospital/ambulance/calls', callData);
      
      if (response.data.success) {
        toast.success('Emergency call created successfully');
        setIsAddCallDialogOpen(false);
        setFormData({
          patientName: '',
          patientId: '',
          phone: '',
          emergencyType: '',
          severity: '',
          priority: '',
          location: '',
          symptoms: '',
          notes: ''
        });
        fetchEmergencyCalls();
      }
    } catch (error: any) {
      console.error('Error creating emergency call:', error);
      toast.error(error.response?.data?.message || 'Failed to create emergency call');
    }
  };

  const handleExportReport = async (format: 'pdf' | 'csv' = 'pdf') => {
    try {
      const params = new URLSearchParams({ format });
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);

      const response = await api.get(`/hospital/ambulance/calls/export?${params.toString()}`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], {
        type: format === 'pdf' ? 'application/pdf' : 'text/csv'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ambulance-calls-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error: any) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    }
  };

  const filteredCalls = emergencyCalls.filter(call => {
    const matchesSearch = call.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         call.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         call.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || call.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || call.priority === priorityFilter;
    const matchesType = typeFilter === 'all' || call.emergencyType === typeFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  const stats = {
    totalCalls: emergencyCalls.length,
    pendingCalls: emergencyCalls.filter(c => c.status === 'pending').length,
    activeCalls: emergencyCalls.filter(c => c.status === 'assigned' || c.status === 'en-route').length,
    completedCalls: emergencyCalls.filter(c => c.status === 'completed').length,
    criticalCalls: emergencyCalls.filter(c => c.priority === 'critical').length,
    averageResponseTime: 8.5
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Emergency Calls</h1>
          <p className="text-gray-600">Manage emergency calls and dispatch</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => handleExportReport('pdf')}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button onClick={() => setIsAddCallDialogOpen(true)} className="bg-red-600 hover:bg-red-700">
            <Plus className="w-4 h-4 mr-2" />
            New Emergency Call
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Phone className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Calls</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCalls}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pendingCalls}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-blue-600">{stats.activeCalls}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completedCalls}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-red-600">{stats.criticalCalls}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Timer className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response</p>
                <p className="text-2xl font-bold text-purple-600">{stats.averageResponseTime} min</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search calls..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="en-route">En Route</SelectItem>
                  <SelectItem value="arrived">Arrived</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="medical">Medical</SelectItem>
                  <SelectItem value="trauma">Trauma</SelectItem>
                  <SelectItem value="cardiac">Cardiac</SelectItem>
                  <SelectItem value="respiratory">Respiratory</SelectItem>
                  <SelectItem value="pediatric">Pediatric</SelectItem>
                  <SelectItem value="obstetric">Obstetric</SelectItem>
                  <SelectItem value="psychiatric">Psychiatric</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Calls Table */}
      <Card>
        <CardHeader>
          <CardTitle>Emergency Calls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Call Info</th>
                  <th className="text-left p-3 font-medium">Emergency Type</th>
                  <th className="text-left p-3 font-medium">Priority</th>
                  <th className="text-left p-3 font-medium">Severity</th>
                  <th className="text-left p-3 font-medium">Location</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Assigned To</th>
                  <th className="text-left p-3 font-medium">ETA</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCalls.map((call) => (
                  <tr key={call.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-medium">{call.patientName}</div>
                      <div className="text-sm text-gray-500">ID: {call.patientId}</div>
                      <div className="text-xs text-gray-400">{call.phone}</div>
                      <div className="text-xs text-gray-400">{call.callTime}</div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(call.emergencyType)}
                        <Badge className="capitalize">
                          {call.emergencyType}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className={`${getPriorityColor(call.priority)} capitalize`}>
                        {call.priority}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge className={`${getSeverityColor(call.severity)} capitalize`}>
                        {call.severity}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">{call.location}</div>
                      <div className="text-xs text-gray-500">
                        {call.coordinates.lat.toFixed(4)}, {call.coordinates.lng.toFixed(4)}
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className={`${getStatusColor(call.status)} capitalize`}>
                        {call.status}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">{call.assignedDriver || 'Unassigned'}</div>
                      <div className="text-xs text-gray-500">{call.assignedVehicle || ''}</div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">{call.estimatedArrival || 'TBD'}</div>
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCall(call);
                            setIsViewCallDialogOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCall(call);
                            setIsDispatchDialogOpen(true);
                          }}
                        >
                          <Radio className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Add Emergency Call Dialog */}
      <Dialog open={isAddCallDialogOpen} onOpenChange={setIsAddCallDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Emergency Call</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateCall}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patientName">Patient Name *</Label>
                <Input 
                  id="patientName" 
                  placeholder="Enter patient name" 
                  value={formData.patientName}
                  onChange={(e) => setFormData({...formData, patientName: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="patientId">Patient ID</Label>
                <Input 
                  id="patientId" 
                  placeholder="Enter patient ID" 
                  value={formData.patientId}
                  onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input 
                  id="phone" 
                  placeholder="Enter phone number" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="emergencyType">Emergency Type *</Label>
                <Select 
                  value={formData.emergencyType}
                  onValueChange={(value) => setFormData({...formData, emergencyType: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medical">Medical</SelectItem>
                    <SelectItem value="trauma">Trauma</SelectItem>
                    <SelectItem value="cardiac">Cardiac</SelectItem>
                    <SelectItem value="respiratory">Respiratory</SelectItem>
                    <SelectItem value="pediatric">Pediatric</SelectItem>
                    <SelectItem value="obstetric">Obstetric</SelectItem>
                    <SelectItem value="psychiatric">Psychiatric</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="severity">Severity</Label>
                <Select 
                  value={formData.severity}
                  onValueChange={(value) => setFormData({...formData, severity: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={formData.priority}
                  onValueChange={(value) => setFormData({...formData, priority: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="location">Location *</Label>
                <Input 
                  id="location" 
                  placeholder="Enter location address" 
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  required
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="symptoms">Symptoms</Label>
                <Textarea 
                  id="symptoms" 
                  placeholder="Enter symptoms (comma separated)" 
                  value={formData.symptoms}
                  onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Additional information..." 
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddCallDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-red-600 hover:bg-red-700">
                Create Emergency Call
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Call Dialog */}
      <Dialog open={isViewCallDialogOpen} onOpenChange={setIsViewCallDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Emergency Call Details</DialogTitle>
          </DialogHeader>
          {selectedCall && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Patient Information</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Patient Name</Label>
                      <p className="text-lg font-semibold">{selectedCall.patientName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Patient ID</Label>
                      <p className="text-lg">{selectedCall.patientId}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Phone</Label>
                      <p className="text-lg">{selectedCall.phone}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Emergency Type</Label>
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(selectedCall.emergencyType)}
                        <Badge className="capitalize">{selectedCall.emergencyType}</Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Severity</Label>
                      <Badge className={`${getSeverityColor(selectedCall.severity)} capitalize`}>
                        {selectedCall.severity}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Priority</Label>
                      <Badge className={`${getPriorityColor(selectedCall.priority)} capitalize`}>
                        {selectedCall.priority}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Call Information</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Status</Label>
                      <Badge className={`${getStatusColor(selectedCall.status)} capitalize`}>
                        {selectedCall.status}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Call Time</Label>
                      <p className="text-lg">{selectedCall.callTime}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Assigned Driver</Label>
                      <p className="text-lg">{selectedCall.assignedDriver || 'Unassigned'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Assigned Vehicle</Label>
                      <p className="text-lg">{selectedCall.assignedVehicle || 'Unassigned'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Estimated Arrival</Label>
                      <p className="text-lg">{selectedCall.estimatedArrival || 'TBD'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Actual Arrival</Label>
                      <p className="text-lg">{selectedCall.actualArrival || 'Not arrived'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Location</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Address</Label>
                    <p className="text-lg">{selectedCall.location}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Coordinates</Label>
                    <p className="text-lg">{selectedCall.coordinates.lat.toFixed(4)}, {selectedCall.coordinates.lng.toFixed(4)}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Symptoms</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCall.symptoms.map((symptom, index) => (
                    <Badge key={index} variant="secondary">
                      {symptom}
                    </Badge>
                  ))}
                </div>
              </div>

              {selectedCall.vitalSigns && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Vital Signs</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedCall.vitalSigns.bloodPressure && (
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{selectedCall.vitalSigns.bloodPressure}</div>
                        <div className="text-sm text-gray-600">Blood Pressure</div>
                      </div>
                    )}
                    {selectedCall.vitalSigns.heartRate && (
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{selectedCall.vitalSigns.heartRate} bpm</div>
                        <div className="text-sm text-gray-600">Heart Rate</div>
                      </div>
                    )}
                    {selectedCall.vitalSigns.temperature && (
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">{selectedCall.vitalSigns.temperature}°F</div>
                        <div className="text-sm text-gray-600">Temperature</div>
                      </div>
                    )}
                    {selectedCall.vitalSigns.oxygenSaturation && (
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{selectedCall.vitalSigns.oxygenSaturation}%</div>
                        <div className="text-sm text-gray-600">O2 Saturation</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedCall.notes && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Notes</h3>
                  <p className="text-lg">{selectedCall.notes}</p>
                </div>
              )}

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Dispatch Notes</h3>
                <div className="space-y-2">
                  {selectedCall.dispatchNotes.map((note, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm">{note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setIsViewCallDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmergencyCalls; 