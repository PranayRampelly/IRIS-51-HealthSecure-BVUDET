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
  Car, 
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
  Timer,
  Map,
  MessageCircle,
  Headphones,
  Radio,
  Satellite,
  Signal,
  CalendarDays,
  ArrowRight,
  ArrowLeft,
  Home,
  Hospital,
  Building2,
  Bed
} from 'lucide-react';

interface PatientTransport {
  id: string;
  patientName: string;
  patientId: string;
  fromLocation: string;
  toLocation: string;
  fromCoordinates: { lat: number; lng: number };
  toCoordinates: { lat: number; lng: number };
  transportType: 'emergency' | 'scheduled' | 'discharge' | 'transfer' | 'appointment' | 'return';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'delayed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedDriver: string;
  assignedVehicle: string;
  scheduledTime: string;
  actualTime?: string;
  completionTime?: string;
  estimatedDuration: number;
  actualDuration?: number;
  distance: number;
  notes?: string;
  patientCondition: {
    mobility: 'independent' | 'assisted' | 'wheelchair' | 'stretcher';
    oxygenRequired: boolean;
    specialEquipment: string[];
    medicalNotes: string;
  };
  escortInfo?: {
    name: string;
    relationship: string;
    phone: string;
  };
  billing: {
    cost: number;
    insurance: string;
    coverage: number;
    patientResponsibility: number;
  };
  route: {
    distance: number;
    estimatedTime: number;
    trafficConditions: string;
    alternativeRoutes: string[];
  };
}

const PatientTransport: React.FC = () => {
  const [transports, setTransports] = useState<PatientTransport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedTransport, setSelectedTransport] = useState<PatientTransport | null>(null);
  const [isAddTransportDialogOpen, setIsAddTransportDialogOpen] = useState(false);
  const [isViewTransportDialogOpen, setIsViewTransportDialogOpen] = useState(false);
  const [isEditTransportDialogOpen, setIsEditTransportDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    patientName: '',
    patientId: '',
    transportType: '',
    priority: '',
    scheduledTime: '',
    mobility: '',
    fromLocation: '',
    toLocation: '',
    specialEquipment: '',
    medicalNotes: '',
    transportNotes: ''
  });

  useEffect(() => {
    fetchTransports();
  }, []);

  const fetchTransports = async () => {
    try {
      setLoading(true);
      const response = await api.get('/hospital/ambulance/transports');
      const data = response.data;
      if (data.success && data.data) {
        // Transform API data to component format
        const transformedTransports: PatientTransport[] = data.data.map((transport: any) => ({
          id: transport._id || transport.transportId,
          patientName: transport.patient?.name || transport.patientName || 'Unknown',
          patientId: transport.patient?.patientId || transport.patientId || 'N/A',
          fromLocation: transport.origin?.name || transport.origin?.address || transport.fromLocation || '',
          toLocation: transport.destination?.name || transport.destination?.address || transport.toLocation || '',
          fromCoordinates: transport.origin?.coordinates || transport.fromCoordinates || { lat: 0, lng: 0 },
          toCoordinates: transport.destination?.coordinates || transport.toCoordinates || { lat: 0, lng: 0 },
          transportType: transport.transportType || 'transfer',
          status: transport.status || 'scheduled',
          priority: transport.medicalRequirements?.priority || 'medium',
          assignedDriver: transport.dispatch?.driver?.name || transport.assignedDriver,
          assignedVehicle: transport.dispatch?.ambulanceService?.vehicleNumber || transport.assignedVehicle,
          scheduledTime: transport.scheduling?.scheduledDateTime ? new Date(transport.scheduling.scheduledDateTime).toLocaleString() : '',
          actualTime: transport.dispatch?.pickupTime ? new Date(transport.dispatch.pickupTime).toLocaleString() : undefined,
          completionTime: transport.dispatch?.arrivalTime ? new Date(transport.dispatch.arrivalTime).toLocaleString() : undefined,
          estimatedDuration: transport.scheduling?.estimatedDuration || 0,
          actualDuration: transport.scheduling?.actualDuration || undefined,
          distance: transport.route?.distance || 0,
          notes: transport.notes || '',
          patientCondition: {
            mobility: transport.medicalRequirements?.mobility || 'ambulatory',
            oxygenRequired: transport.medicalRequirements?.oxygenRequired || false,
            specialEquipment: transport.medicalRequirements?.specialEquipment || [],
            medicalNotes: transport.medicalRequirements?.notes || ''
          },
          escortInfo: transport.medicalTeam ? {
            name: transport.medicalTeam.doctor?.name || transport.medicalTeam.nurse?.name || '',
            relationship: 'Medical Escort',
            phone: ''
          } : undefined,
          billing: transport.billing || undefined,
          route: transport.route || undefined
        }));
        setTransports(transformedTransports);
      } else {
        setTransports([]);
      }
    } catch (error) {
      console.error('Error fetching transports:', error);
      setTransports([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'delayed': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'discharge': return 'bg-green-100 text-green-800';
      case 'transfer': return 'bg-purple-100 text-purple-800';
      case 'appointment': return 'bg-yellow-100 text-yellow-800';
      case 'return': return 'bg-orange-100 text-orange-800';
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

  const getMobilityIcon = (mobility: string) => {
    switch (mobility) {
      case 'independent': return <User className="w-4 h-4 text-green-600" />;
      case 'assisted': return <User className="w-4 h-4 text-yellow-600" />;
      case 'wheelchair': return <Bed className="w-4 h-4 text-blue-600" />;
      case 'stretcher': return <Bed className="w-4 h-4 text-red-600" />;
      default: return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleCreateTransport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.patientName || !formData.transportType || !formData.fromLocation || !formData.toLocation || !formData.scheduledTime) {
        toast.error('Please fill in all required fields');
        return;
      }

      const specialEquipmentArray = formData.specialEquipment ? formData.specialEquipment.split(',').map(s => s.trim()).filter(s => s) : [];

      const transportData = {
        patient: formData.patientId || null, // Will be used to look up patient, but schema needs patient object
        patientName: formData.patientName, // Pass patient name separately for backend to use
        transportType: formData.transportType,
        origin: {
          type: 'hospital',
          name: formData.fromLocation,
          address: formData.fromLocation,
          coordinates: { lat: 0, lng: 0 }
        },
        destination: {
          type: 'hospital',
          name: formData.toLocation,
          address: formData.toLocation,
          coordinates: { lat: 0, lng: 0 }
        },
        scheduling: {
          scheduledDateTime: new Date(formData.scheduledTime),
          estimatedDuration: 30
        },
        medicalRequirements: {
          mobility: formData.mobility || 'independent',
          specialEquipment: specialEquipmentArray,
          medicalNotes: formData.medicalNotes || ''
        },
        notes: formData.transportNotes || ''
      };

      const response = await api.post('/hospital/ambulance/transports', transportData);
      
      if (response.data.success) {
        toast.success('Transport scheduled successfully');
        setIsAddTransportDialogOpen(false);
        setFormData({
          patientName: '',
          patientId: '',
          transportType: '',
          priority: '',
          scheduledTime: '',
          mobility: '',
          fromLocation: '',
          toLocation: '',
          specialEquipment: '',
          medicalNotes: '',
          transportNotes: ''
        });
        fetchTransports();
      }
    } catch (error: any) {
      console.error('Error creating transport:', error);
      toast.error(error.response?.data?.message || 'Failed to schedule transport');
    }
  };

  const handleExportReport = async (format: 'pdf' | 'csv' = 'pdf') => {
    try {
      const params = new URLSearchParams({ format });
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('transportType', typeFilter);

      const response = await api.get(`/hospital/ambulance/transports/export?${params.toString()}`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], {
        type: format === 'pdf' ? 'application/pdf' : 'text/csv'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ambulance-transports-${Date.now()}.${format}`;
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

  const filteredTransports = transports.filter(transport => {
    const matchesSearch = transport.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transport.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transport.fromLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transport.toLocation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transport.status === statusFilter;
    const matchesType = typeFilter === 'all' || transport.transportType === typeFilter;
    const matchesPriority = priorityFilter === 'all' || transport.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesType && matchesPriority;
  });

  const stats = {
    totalTransports: transports.length,
    scheduledTransports: transports.filter(t => t.status === 'scheduled').length,
    inProgressTransports: transports.filter(t => t.status === 'in-progress').length,
    completedTransports: transports.filter(t => t.status === 'completed').length,
    averageDistance: transports.reduce((acc, t) => acc + t.distance, 0) / transports.length,
    totalRevenue: transports.reduce((acc, t) => acc + t.billing.cost, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patient Transport</h1>
          <p className="text-gray-600">Manage patient transport and scheduling</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => handleExportReport('pdf')}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button onClick={() => setIsAddTransportDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Schedule Transport
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Car className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transports</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTransports}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CalendarDays className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-blue-600">{stats.scheduledTransports}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.inProgressTransports}</p>
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
                <p className="text-2xl font-bold text-green-600">{stats.completedTransports}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
                              <MapPin className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Distance</p>
                <p className="text-2xl font-bold text-purple-600">{stats.averageDistance.toFixed(1)} km</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-green-600">${stats.totalRevenue}</p>
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
                  placeholder="Search transports..."
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
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="delayed">Delayed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="discharge">Discharge</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="appointment">Appointment</SelectItem>
                  <SelectItem value="return">Return</SelectItem>
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Transports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Patient</th>
                  <th className="text-left p-3 font-medium">Transport Type</th>
                  <th className="text-left p-3 font-medium">Route</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Priority</th>
                  <th className="text-left p-3 font-medium">Scheduled Time</th>
                  <th className="text-left p-3 font-medium">Assigned Driver</th>
                  <th className="text-left p-3 font-medium">Distance</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransports.map((transport) => (
                  <tr key={transport.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-medium">{transport.patientName}</div>
                      <div className="text-sm text-gray-500">ID: {transport.patientId}</div>
                      <div className="flex items-center space-x-1 text-xs text-gray-400">
                        {getMobilityIcon(transport.patientCondition.mobility)}
                        <span className="capitalize">{transport.patientCondition.mobility}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className={`${getTypeColor(transport.transportType)} capitalize`}>
                        {transport.transportType}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">
                        <div className="flex items-center space-x-1">
                          <ArrowRight className="w-3 h-3 text-gray-400" />
                          <span className="truncate max-w-32">{transport.fromLocation}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ArrowLeft className="w-3 h-3 text-gray-400" />
                          <span className="truncate max-w-32">{transport.toLocation}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className={`${getStatusColor(transport.status)} capitalize`}>
                        {transport.status}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge className={`${getPriorityColor(transport.priority)} capitalize`}>
                        {transport.priority}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">{transport.scheduledTime}</div>
                      {transport.actualTime && (
                        <div className="text-xs text-gray-500">Actual: {transport.actualTime}</div>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="text-sm">{transport.assignedDriver}</div>
                      <div className="text-xs text-gray-500">{transport.assignedVehicle}</div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">{transport.distance} km</div>
                      <div className="text-xs text-gray-500">{transport.estimatedDuration} min</div>
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedTransport(transport);
                            setIsViewTransportDialogOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedTransport(transport);
                            setIsEditTransportDialogOpen(true);
                          }}
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

      {/* Add Transport Dialog */}
      <Dialog open={isAddTransportDialogOpen} onOpenChange={setIsAddTransportDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule Patient Transport</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateTransport}>
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
                <Label htmlFor="transportType">Transport Type *</Label>
                <Select 
                  value={formData.transportType}
                  onValueChange={(value) => setFormData({...formData, transportType: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="discharge">Discharge</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                    <SelectItem value="appointment">Appointment</SelectItem>
                    <SelectItem value="return">Return</SelectItem>
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
              <div>
                <Label htmlFor="scheduledTime">Scheduled Time *</Label>
                <Input 
                  id="scheduledTime" 
                  type="datetime-local" 
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({...formData, scheduledTime: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="mobility">Patient Mobility</Label>
                <Select 
                  value={formData.mobility}
                  onValueChange={(value) => setFormData({...formData, mobility: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select mobility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="independent">Independent</SelectItem>
                    <SelectItem value="assisted">Assisted</SelectItem>
                    <SelectItem value="wheelchair">Wheelchair</SelectItem>
                    <SelectItem value="stretcher">Stretcher</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="fromLocation">From Location *</Label>
                <Input 
                  id="fromLocation" 
                  placeholder="Pickup location" 
                  value={formData.fromLocation}
                  onChange={(e) => setFormData({...formData, fromLocation: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="toLocation">To Location *</Label>
                <Input 
                  id="toLocation" 
                  placeholder="Destination" 
                  value={formData.toLocation}
                  onChange={(e) => setFormData({...formData, toLocation: e.target.value})}
                  required
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="specialEquipment">Special Equipment</Label>
                <Textarea 
                  id="specialEquipment" 
                  placeholder="Enter special equipment needs (comma separated)" 
                  value={formData.specialEquipment}
                  onChange={(e) => setFormData({...formData, specialEquipment: e.target.value})}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="medicalNotes">Medical Notes</Label>
                <Textarea 
                  id="medicalNotes" 
                  placeholder="Enter medical notes" 
                  value={formData.medicalNotes}
                  onChange={(e) => setFormData({...formData, medicalNotes: e.target.value})}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="transportNotes">Transport Notes</Label>
                <Textarea 
                  id="transportNotes" 
                  placeholder="Additional information..." 
                  value={formData.transportNotes}
                  onChange={(e) => setFormData({...formData, transportNotes: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddTransportDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Schedule Transport
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Transport Dialog */}
      <Dialog open={isViewTransportDialogOpen} onOpenChange={setIsViewTransportDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Transport Details</DialogTitle>
          </DialogHeader>
          {selectedTransport && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Patient Information</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Patient Name</Label>
                      <p className="text-lg font-semibold">{selectedTransport.patientName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Patient ID</Label>
                      <p className="text-lg">{selectedTransport.patientId}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Transport Type</Label>
                      <Badge className={`${getTypeColor(selectedTransport.transportType)} capitalize`}>
                        {selectedTransport.transportType}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Priority</Label>
                      <Badge className={`${getPriorityColor(selectedTransport.priority)} capitalize`}>
                        {selectedTransport.priority}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Status</Label>
                      <Badge className={`${getStatusColor(selectedTransport.status)} capitalize`}>
                        {selectedTransport.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Transport Information</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Assigned Driver</Label>
                      <p className="text-lg">{selectedTransport.assignedDriver}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Assigned Vehicle</Label>
                      <p className="text-lg">{selectedTransport.assignedVehicle}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Scheduled Time</Label>
                      <p className="text-lg">{selectedTransport.scheduledTime}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Actual Time</Label>
                      <p className="text-lg">{selectedTransport.actualTime || 'Not started'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Completion Time</Label>
                      <p className="text-lg">{selectedTransport.completionTime || 'Not completed'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Route Information</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">From Location</Label>
                    <p className="text-lg">{selectedTransport.fromLocation}</p>
                    <p className="text-sm text-gray-500">
                      {selectedTransport.fromCoordinates.lat.toFixed(4)}, {selectedTransport.fromCoordinates.lng.toFixed(4)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">To Location</Label>
                    <p className="text-lg">{selectedTransport.toLocation}</p>
                    <p className="text-sm text-gray-500">
                      {selectedTransport.toCoordinates.lat.toFixed(4)}, {selectedTransport.toCoordinates.lng.toFixed(4)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Distance</Label>
                    <p className="text-lg">{selectedTransport.distance} km</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Estimated Duration</Label>
                    <p className="text-lg">{selectedTransport.estimatedDuration} minutes</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Patient Condition</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Mobility</Label>
                    <div className="flex items-center space-x-2">
                      {getMobilityIcon(selectedTransport.patientCondition.mobility)}
                      <span className="capitalize">{selectedTransport.patientCondition.mobility}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Oxygen Required</Label>
                    <p className="text-lg">{selectedTransport.patientCondition.oxygenRequired ? 'Yes' : 'No'}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-sm font-medium text-gray-600">Special Equipment</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedTransport.patientCondition.specialEquipment.map((equipment, index) => (
                        <Badge key={index} variant="secondary">
                          {equipment}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-sm font-medium text-gray-600">Medical Notes</Label>
                    <p className="text-lg">{selectedTransport.patientCondition.medicalNotes}</p>
                  </div>
                </div>
              </div>

              {selectedTransport.escortInfo && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Escort Information</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Name</Label>
                      <p className="text-lg">{selectedTransport.escortInfo.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Relationship</Label>
                      <p className="text-lg">{selectedTransport.escortInfo.relationship}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Phone</Label>
                      <p className="text-lg">{selectedTransport.escortInfo.phone}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Billing Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">${selectedTransport.billing.cost}</div>
                    <div className="text-sm text-gray-600">Total Cost</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{selectedTransport.billing.coverage}%</div>
                    <div className="text-sm text-gray-600">Insurance Coverage</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">${selectedTransport.billing.patientResponsibility}</div>
                    <div className="text-sm text-gray-600">Patient Responsibility</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{selectedTransport.billing.insurance}</div>
                    <div className="text-sm text-gray-600">Insurance Provider</div>
                  </div>
                </div>
              </div>

              {selectedTransport.notes && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Notes</h3>
                  <p className="text-lg">{selectedTransport.notes}</p>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setIsViewTransportDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientTransport; 