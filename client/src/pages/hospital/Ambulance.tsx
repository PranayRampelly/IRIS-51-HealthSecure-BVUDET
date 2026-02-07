import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Ambulance as AmbulanceIcon,
  Users,
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
  Stethoscope
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

interface AmbulanceDriver {
  id: string;
  name: string;
  licenseNumber: string;
  phone: string;
  status: 'available' | 'on-call' | 'off-duty' | 'emergency';
  currentLocation: string;
  experience: string;
  rating: number;
  vehicleId: string;
  lastActive: string;
}

interface AmbulanceVehicle {
  id: string;
  vehicleNumber: string;
  type: 'basic' | 'advanced' | 'critical-care';
  status: 'available' | 'in-use' | 'maintenance' | 'offline';
  equipment: string[];
  lastMaintenance: string;
  driverId?: string;
  currentLocation: string;
}

interface EmergencyCall {
  id: string;
  patientName: string;
  patientId: string;
  phone: string;
  location: string;
  emergencyType: 'medical' | 'trauma' | 'cardiac' | 'respiratory' | 'pediatric';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'assigned' | 'en-route' | 'arrived' | 'completed';
  assignedDriver?: string;
  assignedVehicle?: string;
  callTime: string;
  estimatedArrival?: string;
  notes?: string;
}

interface PatientTransport {
  id: string;
  patientName: string;
  patientId: string;
  fromLocation: string;
  toLocation: string;
  transportType: 'emergency' | 'scheduled' | 'discharge' | 'transfer';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  assignedDriver: string;
  assignedVehicle: string;
  scheduledTime: string;
  actualTime?: string;
  notes?: string;
}

const Ambulance: React.FC = () => {
  const [drivers, setDrivers] = useState<AmbulanceDriver[]>([]);
  const [vehicles, setVehicles] = useState<AmbulanceVehicle[]>([]);
  const [emergencyCalls, setEmergencyCalls] = useState<EmergencyCall[]>([]);
  const [transports, setTransports] = useState<PatientTransport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCall, setSelectedCall] = useState<EmergencyCall | null>(null);
  const [selectedTransport, setSelectedTransport] = useState<PatientTransport | null>(null);
  const [isAddCallDialogOpen, setIsAddCallDialogOpen] = useState(false);
  const [isAddTransportDialogOpen, setIsAddTransportDialogOpen] = useState(false);
  const [isViewCallDialogOpen, setIsViewCallDialogOpen] = useState(false);
  const [isViewTransportDialogOpen, setIsViewTransportDialogOpen] = useState(false);

  // Fetch real data from API
  useEffect(() => {
    fetchAmbulanceData();
  }, []);

  const fetchAmbulanceData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Fetch bookings
      const bookingsRes = await axios.get('http://localhost:5000/api/hospital/ambulance/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Fetch services
      const servicesRes = await axios.get('http://localhost:5000/api/hospital/ambulance/services', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Fetch stats
      const statsRes = await axios.get('http://localhost:5000/api/hospital/ambulance/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Map bookings to emergency calls format
      const bookings = bookingsRes.data.data?.bookings || [];
      const mappedCalls = bookings.map((booking: any) => ({
        id: booking._id,
        patientName: booking.patient ? `${booking.patient.firstName} ${booking.patient.lastName}` : booking.patientDetails.name,
        patientId: booking.patient?._id || 'N/A',
        phone: booking.patient?.phone || booking.patientDetails.phone,
        location: booking.addresses.pickup,
        emergencyType: booking.emergencyDetails.type,
        severity: booking.emergencyDetails.urgency,
        status: booking.status.current,
        assignedDriver: booking.ambulanceService?.driver?.name || booking.driver?.name,
        assignedVehicle: booking.ambulanceService?.vehicleNumber,
        callTime: new Date(booking.createdAt).toLocaleString(),
        estimatedArrival: booking.tracking?.estimatedArrival ? new Date(booking.tracking.estimatedArrival).toLocaleString() : 'TBD',
        notes: booking.emergencyDetails.symptoms
      }));

      // Map services to vehicles format
      const services = servicesRes.data.data || [];
      const mappedVehicles = services.map((service: any) => ({
        id: service._id,
        vehicleNumber: service.vehicleNumber,
        type: service.type,
        status: service.available && service.status === 'active' ? 'available' : service.status,
        equipment: service.equipment || [],
        lastMaintenance: service.updatedAt ? new Date(service.updatedAt).toLocaleDateString() : 'N/A',
        driverId: service.driver?.name,
        currentLocation: service.currentLocation?.address || service.baseLocation
      }));

      // Map services to drivers format (extract driver info)
      const mappedDrivers = services
        .filter((service: any) => service.driver)
        .map((service: any) => ({
          id: service._id,
          name: service.driver.name,
          licenseNumber: service.driver.license,
          phone: service.driver.contact || service.contact,
          status: service.available && service.status === 'active' ? 'available' : 'off-duty',
          currentLocation: service.currentLocation?.address || service.baseLocation,
          experience: `${service.driver.experience || 0} years`,
          rating: service.rating || 0,
          vehicleId: service.vehicleNumber,
          lastActive: new Date(service.updatedAt).toLocaleString()
        }));

      setEmergencyCalls(mappedCalls);
      setVehicles(mappedVehicles);
      setDrivers(mappedDrivers);
      setTransports([]); // Transports are same as bookings, can be filtered

    } catch (error) {
      console.error('Error fetching ambulance data:', error);
      toast.error('Failed to load ambulance data');
      // Set empty arrays on error
      setEmergencyCalls([]);
      setVehicles([]);
      setDrivers([]);
      setTransports([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'on-call': return 'bg-yellow-100 text-yellow-800';
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'off-duty': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'en-route': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-use': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'offline': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    totalDrivers: drivers.length,
    availableDrivers: drivers.filter(d => d.status === 'available').length,
    activeCalls: emergencyCalls.filter(c => c.status === 'pending' || c.status === 'assigned').length,
    totalVehicles: vehicles.length,
    availableVehicles: vehicles.filter(v => v.status === 'available').length,
    completedTransports: transports.filter(t => t.status === 'completed').length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ambulance Services</h1>
          <p className="text-gray-600">Manage emergency response and patient transport</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setIsAddCallDialogOpen(true)} className="bg-red-600 hover:bg-red-700">
            <AmbulanceIcon className="w-4 h-4 mr-2" />
            New Emergency Call
          </Button>
          <Button onClick={() => setIsAddTransportDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Schedule Transport
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Drivers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDrivers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Available Drivers</p>
                <p className="text-2xl font-bold text-green-600">{stats.availableDrivers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Active Calls</p>
                <p className="text-2xl font-bold text-red-600">{stats.activeCalls}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Car className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Vehicles</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalVehicles}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Available Vehicles</p>
                <p className="text-2xl font-bold text-green-600">{stats.availableVehicles}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Transports</p>
                <p className="text-2xl font-bold text-blue-600">{stats.completedTransports}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="emergency" className="space-y-4">
        <TabsList>
          <TabsTrigger value="emergency">Emergency Calls</TabsTrigger>
          <TabsTrigger value="transports">Patient Transports</TabsTrigger>
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
        </TabsList>

        <TabsContent value="emergency" className="space-y-4">
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
                      <th className="text-left p-3 font-medium">Patient</th>
                      <th className="text-left p-3 font-medium">Emergency Type</th>
                      <th className="text-left p-3 font-medium">Severity</th>
                      <th className="text-left p-3 font-medium">Location</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Assigned To</th>
                      <th className="text-left p-3 font-medium">ETA</th>
                      <th className="text-left p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emergencyCalls.map((call) => (
                      <tr key={call.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="font-medium">{call.patientName}</div>
                          <div className="text-sm text-gray-500">ID: {call.patientId}</div>
                        </td>
                        <td className="p-3">
                          <Badge className="capitalize">
                            {call.emergencyType}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge className={`${getSeverityColor(call.severity)} capitalize`}>
                            {call.severity}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="text-sm">{call.location}</div>
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
        </TabsContent>

        <TabsContent value="transports" className="space-y-4">
          {/* Patient Transports Table */}
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
                      <th className="text-left p-3 font-medium">From</th>
                      <th className="text-left p-3 font-medium">To</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Scheduled Time</th>
                      <th className="text-left p-3 font-medium">Assigned Driver</th>
                      <th className="text-left p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transports.map((transport) => (
                      <tr key={transport.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="font-medium">{transport.patientName}</div>
                          <div className="text-sm text-gray-500">ID: {transport.patientId}</div>
                        </td>
                        <td className="p-3">
                          <Badge className="capitalize">
                            {transport.transportType}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="text-sm">{transport.fromLocation}</div>
                        </td>
                        <td className="p-3">
                          <div className="text-sm">{transport.toLocation}</div>
                        </td>
                        <td className="p-3">
                          <Badge className={`${getStatusColor(transport.status)} capitalize`}>
                            {transport.status}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="text-sm">{transport.scheduledTime}</div>
                        </td>
                        <td className="p-3">
                          <div className="text-sm">{transport.assignedDriver}</div>
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
        </TabsContent>

        <TabsContent value="drivers" className="space-y-4">
          {/* Drivers Table */}
          <Card>
            <CardHeader>
              <CardTitle>Ambulance Drivers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Driver</th>
                      <th className="text-left p-3 font-medium">License</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Location</th>
                      <th className="text-left p-3 font-medium">Experience</th>
                      <th className="text-left p-3 font-medium">Rating</th>
                      <th className="text-left p-3 font-medium">Vehicle</th>
                      <th className="text-left p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drivers.map((driver) => (
                      <tr key={driver.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="font-medium">{driver.name}</div>
                          <div className="text-sm text-gray-500">{driver.phone}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-mono text-sm">{driver.licenseNumber}</div>
                        </td>
                        <td className="p-3">
                          <Badge className={`${getStatusColor(driver.status)} capitalize`}>
                            {driver.status}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="text-sm">{driver.currentLocation}</div>
                        </td>
                        <td className="p-3">
                          <div className="text-sm">{driver.experience}</div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center">
                            <span className="text-sm font-medium">{driver.rating}</span>
                            <span className="text-yellow-500 ml-1">★</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="text-sm">{driver.vehicleId}</div>
                        </td>
                        <td className="p-3">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                            >
                              <Eye className="w-4 h-4" />
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
        </TabsContent>

        <TabsContent value="vehicles" className="space-y-4">
          {/* Vehicles Table */}
          <Card>
            <CardHeader>
              <CardTitle>Ambulance Fleet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Vehicle</th>
                      <th className="text-left p-3 font-medium">Type</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Location</th>
                      <th className="text-left p-3 font-medium">Equipment</th>
                      <th className="text-left p-3 font-medium">Driver</th>
                      <th className="text-left p-3 font-medium">Last Maintenance</th>
                      <th className="text-left p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.map((vehicle) => (
                      <tr key={vehicle.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="font-medium">{vehicle.vehicleNumber}</div>
                        </td>
                        <td className="p-3">
                          <Badge className="capitalize">
                            {vehicle.type}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge className={`${getStatusColor(vehicle.status)} capitalize`}>
                            {vehicle.status}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="text-sm">{vehicle.currentLocation}</div>
                        </td>
                        <td className="p-3">
                          <div className="text-sm">
                            {vehicle.equipment.slice(0, 2).join(', ')}
                            {vehicle.equipment.length > 2 && '...'}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="text-sm">{vehicle.driverId || 'Unassigned'}</div>
                        </td>
                        <td className="p-3">
                          <div className="text-sm">{vehicle.lastMaintenance}</div>
                        </td>
                        <td className="p-3">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                            >
                              <Eye className="w-4 h-4" />
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
        </TabsContent>
      </Tabs>

      {/* Add Emergency Call Dialog */}
      <Dialog open={isAddCallDialogOpen} onOpenChange={setIsAddCallDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Emergency Call</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="patientName">Patient Name</Label>
              <Input id="patientName" placeholder="Enter patient name" />
            </div>
            <div>
              <Label htmlFor="patientId">Patient ID</Label>
              <Input id="patientId" placeholder="Enter patient ID" />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" placeholder="Enter phone number" />
            </div>
            <div>
              <Label htmlFor="emergencyType">Emergency Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medical">Medical</SelectItem>
                  <SelectItem value="trauma">Trauma</SelectItem>
                  <SelectItem value="cardiac">Cardiac</SelectItem>
                  <SelectItem value="respiratory">Respiratory</SelectItem>
                  <SelectItem value="pediatric">Pediatric</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="severity">Severity</Label>
              <Select>
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
            <div className="col-span-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="Enter location address" />
            </div>
            <div className="col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Additional information..." />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsAddCallDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-red-600 hover:bg-red-700">
              Create Emergency Call
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Transport Dialog */}
      <Dialog open={isAddTransportDialogOpen} onOpenChange={setIsAddTransportDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule Patient Transport</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="transportPatientName">Patient Name</Label>
              <Input id="transportPatientName" placeholder="Enter patient name" />
            </div>
            <div>
              <Label htmlFor="transportPatientId">Patient ID</Label>
              <Input id="transportPatientId" placeholder="Enter patient ID" />
            </div>
            <div>
              <Label htmlFor="transportType">Transport Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="discharge">Discharge</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="scheduledTime">Scheduled Time</Label>
              <Input id="scheduledTime" type="datetime-local" />
            </div>
            <div>
              <Label htmlFor="fromLocation">From Location</Label>
              <Input id="fromLocation" placeholder="Pickup location" />
            </div>
            <div>
              <Label htmlFor="toLocation">To Location</Label>
              <Input id="toLocation" placeholder="Destination" />
            </div>
            <div className="col-span-2">
              <Label htmlFor="transportNotes">Notes</Label>
              <Textarea id="transportNotes" placeholder="Additional information..." />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsAddTransportDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Schedule Transport
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Call Dialog */}
      <Dialog open={isViewCallDialogOpen} onOpenChange={setIsViewCallDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Emergency Call Details</DialogTitle>
          </DialogHeader>
          {selectedCall && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Patient Name</Label>
                  <p className="text-lg font-semibold">{selectedCall.patientName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Patient ID</Label>
                  <p className="text-lg">{selectedCall.patientId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Emergency Type</Label>
                  <Badge className="capitalize">{selectedCall.emergencyType}</Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Severity</Label>
                  <Badge className={`${getSeverityColor(selectedCall.severity)} capitalize`}>
                    {selectedCall.severity}
                  </Badge>
                </div>
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
                  <Label className="text-sm font-medium text-gray-600">Phone</Label>
                  <p className="text-lg">{selectedCall.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Estimated Arrival</Label>
                  <p className="text-lg">{selectedCall.estimatedArrival || 'TBD'}</p>
                </div>
              </div>
              <div className="border-t pt-4">
                <Label className="text-sm font-medium text-gray-600">Location</Label>
                <p className="text-lg">{selectedCall.location}</p>
              </div>
              {selectedCall.notes && (
                <div className="border-t pt-4">
                  <Label className="text-sm font-medium text-gray-600">Notes</Label>
                  <p className="text-lg">{selectedCall.notes}</p>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setIsViewCallDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Transport Dialog */}
      <Dialog open={isViewTransportDialogOpen} onOpenChange={setIsViewTransportDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transport Details</DialogTitle>
          </DialogHeader>
          {selectedTransport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                  <Badge className="capitalize">{selectedTransport.transportType}</Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <Badge className={`${getStatusColor(selectedTransport.status)} capitalize`}>
                    {selectedTransport.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">From Location</Label>
                  <p className="text-lg">{selectedTransport.fromLocation}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">To Location</Label>
                  <p className="text-lg">{selectedTransport.toLocation}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Scheduled Time</Label>
                  <p className="text-lg">{selectedTransport.scheduledTime}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Assigned Driver</Label>
                  <p className="text-lg">{selectedTransport.assignedDriver}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Assigned Vehicle</Label>
                  <p className="text-lg">{selectedTransport.assignedVehicle}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Actual Time</Label>
                  <p className="text-lg">{selectedTransport.actualTime || 'Not completed'}</p>
                </div>
              </div>
              {selectedTransport.notes && (
                <div className="border-t pt-4">
                  <Label className="text-sm font-medium text-gray-600">Notes</Label>
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

export default Ambulance; 