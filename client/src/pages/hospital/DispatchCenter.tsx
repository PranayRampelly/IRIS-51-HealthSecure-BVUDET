import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Phone, 
  MessageSquare, 
  Headphones, 
  Radio, 
  Users, 
  Car,
  AlertTriangle,
  CheckCircle,
  Activity,
  Clock,
  MapPin,
  Navigation,
  Route,
  Timer,
  Signal,
  Wifi,
  Satellite,
  Map,
  Compass,
  Target,
  ArrowRight,
  ArrowLeft,
  Home,
  Hospital,
  Building2,
  Plus,
  Edit,
  Eye,
  Trash2,
  Search,
  Filter,
  Bell,
  Mail,
  PhoneCall,
  MessageCircle,
  RadioIcon,
  HeadphonesIcon,
  Mic,
  MicOff,
  Volume2,
  VolumeX
} from 'lucide-react';

interface DispatchCall {
  id: string;
  callNumber: string;
  callerName: string;
  callerPhone: string;
  emergencyType: 'medical' | 'trauma' | 'cardiac' | 'respiratory' | 'pediatric' | 'obstetric' | 'psychiatric';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  coordinates: { lat: number; lng: number };
  status: 'incoming' | 'processing' | 'dispatched' | 'en-route' | 'arrived' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedDriver?: string;
  assignedVehicle?: string;
  callTime: string;
  dispatchTime?: string;
  estimatedArrival?: string;
  notes?: string;
  symptoms: string[];
  dispatchNotes: string[];
}

interface DispatchOperator {
  id: string;
  name: string;
  status: 'available' | 'busy' | 'offline';
  currentCall?: string;
  callsHandled: number;
  averageResponseTime: number;
}

const DispatchCenter: React.FC = () => {
  const [dispatchCalls, setDispatchCalls] = useState<DispatchCall[]>([]);
  const [operators, setOperators] = useState<DispatchOperator[]>([]);
  const [selectedCall, setSelectedCall] = useState<DispatchCall | null>(null);
  const [isViewCallDialogOpen, setIsViewCallDialogOpen] = useState(false);
  const [isDispatchDialogOpen, setIsDispatchDialogOpen] = useState(false);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [dispatchForm, setDispatchForm] = useState({
    driverId: '',
    vehicleId: '',
    estimatedArrival: '',
    notes: ''
  });

  useEffect(() => {
    fetchDispatchCalls();
    fetchDispatchOperators();
    fetchDispatchStats();
    fetchDrivers();
    fetchVehicles();
    
    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      fetchDispatchCalls();
      fetchDispatchOperators();
      fetchDispatchStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchDrivers = async () => {
    try {
      const response = await api.get('/hospital/ambulance/drivers');
      const data = response.data;
      if (data.success && data.data) {
        setDrivers(data.data);
      } else {
        setDrivers([]);
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
      setDrivers([]);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await api.get('/hospital/ambulance/services');
      const data = response.data;
      if (data.success && data.data) {
        setVehicles(data.data);
      } else {
        setVehicles([]);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setVehicles([]);
    }
  };

  const fetchDispatchCalls = async () => {
    try {
      const response = await api.get('/hospital/ambulance/dispatch/calls');
      const data = response.data;
      if (data.success && data.data) {
        const transformedCalls: DispatchCall[] = data.data.map((call: any) => ({
          id: call.id,
          callNumber: call.callNumber,
          callerName: call.callerName,
          callerPhone: call.callerPhone,
          emergencyType: call.emergencyType,
          severity: call.severity === 'mild' ? 'low' : 
                   call.severity === 'moderate' ? 'medium' :
                   call.severity === 'severe' ? 'high' : 'critical',
          location: call.location,
          coordinates: call.coordinates,
          status: call.status,
          priority: call.priority,
          assignedDriver: call.assignedDriver,
          assignedVehicle: call.assignedVehicle,
          callTime: new Date(call.callTime).toLocaleString(),
          dispatchTime: call.dispatchTime ? new Date(call.dispatchTime).toLocaleString() : undefined,
          estimatedArrival: call.estimatedArrival ? new Date(call.estimatedArrival).toLocaleString() : undefined,
          notes: call.notes,
          symptoms: call.symptoms || [],
          dispatchNotes: call.dispatchNotes || []
        }));
        setDispatchCalls(transformedCalls);
      } else {
        setDispatchCalls([]);
      }
    } catch (error) {
      console.error('Error fetching dispatch calls:', error);
      setDispatchCalls([]);
    }
  };

  const fetchDispatchOperators = async () => {
    try {
      const response = await api.get('/hospital/ambulance/dispatch/operators');
      const data = response.data;
      if (data.success && data.data) {
        const transformedOperators: DispatchOperator[] = data.data.map((op: any) => ({
          id: op.id,
          name: op.name,
          status: op.status,
          currentCall: op.currentCall,
          callsHandled: op.callsHandled || 0,
          averageResponseTime: op.averageResponseTime || 0
        }));
        setOperators(transformedOperators);
      } else {
        setOperators([]);
      }
    } catch (error) {
      console.error('Error fetching dispatch operators:', error);
      setOperators([]);
    }
  };

  const fetchDispatchStats = async () => {
    try {
      const response = await api.get('/hospital/ambulance/dispatch/stats');
      const data = response.data;
      if (data.success && data.data) {
        // Stats are used in the component, can be stored in state if needed
      }
    } catch (error) {
      console.error('Error fetching dispatch stats:', error);
    }
  };

  const handleDispatchAmbulance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCall || !dispatchForm.driverId || !dispatchForm.vehicleId) {
      toast.error('Please select both driver and vehicle');
      return;
    }

    try {
      const response = await api.post(`/hospital/ambulance/dispatch/calls/${selectedCall.id}/dispatch`, {
        driverId: dispatchForm.driverId,
        vehicleId: dispatchForm.vehicleId,
        estimatedArrival: dispatchForm.estimatedArrival,
        notes: dispatchForm.notes
      });
      
      if (response.data.success) {
        toast.success('Ambulance dispatched successfully');
        setIsDispatchDialogOpen(false);
        setDispatchForm({
          driverId: '',
          vehicleId: '',
          estimatedArrival: '',
          notes: ''
        });
        fetchDispatchCalls();
        fetchDispatchOperators();
      }
    } catch (error: any) {
      console.error('Error dispatching ambulance:', error);
      toast.error(error.response?.data?.message || 'Failed to dispatch ambulance');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'incoming': return 'bg-orange-100 text-orange-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'dispatched': return 'bg-blue-100 text-blue-800';
      case 'en-route': return 'bg-purple-100 text-purple-800';
      case 'arrived': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
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

  const getOperatorStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'offline': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    totalCalls: dispatchCalls.length,
    incomingCalls: dispatchCalls.filter(c => c.status === 'incoming').length,
    processingCalls: dispatchCalls.filter(c => c.status === 'processing').length,
    dispatchedCalls: dispatchCalls.filter(c => c.status === 'dispatched' || c.status === 'en-route').length,
    availableOperators: operators.filter(o => o.status === 'available').length,
    averageResponseTime: operators.reduce((acc, o) => acc + o.averageResponseTime, 0) / operators.length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dispatch Center</h1>
          <p className="text-gray-600">Real-time emergency call management and dispatch</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Radio className="w-4 h-4 mr-2" />
            Radio Control
          </Button>
          <Button>
            <Phone className="w-4 h-4 mr-2" />
            Take Call
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
              <AlertTriangle className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Incoming</p>
                <p className="text-2xl font-bold text-orange-600">{stats.incomingCalls}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Processing</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.processingCalls}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Radio className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Dispatched</p>
                <p className="text-2xl font-bold text-blue-600">{stats.dispatchedCalls}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Available Ops</p>
                <p className="text-2xl font-bold text-green-600">{stats.availableOperators}</p>
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
                <p className="text-2xl font-bold text-purple-600">{stats.averageResponseTime.toFixed(1)}s</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dispatch Calls Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Calls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Call Info</th>
                  <th className="text-left p-3 font-medium">Emergency Type</th>
                  <th className="text-left p-3 font-medium">Priority</th>
                  <th className="text-left p-3 font-medium">Location</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Assigned To</th>
                  <th className="text-left p-3 font-medium">ETA</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {dispatchCalls.map((call) => (
                  <tr key={call.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-medium">{call.callNumber}</div>
                      <div className="text-sm text-gray-500">{call.callerName}</div>
                      <div className="text-xs text-gray-400">{call.callerPhone}</div>
                      <div className="text-xs text-gray-400">{call.callTime}</div>
                    </td>
                    <td className="p-3">
                      <Badge className="capitalize">
                        {call.emergencyType}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge className={`${getPriorityColor(call.priority)} capitalize`}>
                        {call.priority}
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Operators Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Headphones className="w-5 h-5" />
              <span>Dispatch Operators</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {operators.map((operator) => (
                <div key={operator.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <div>
                      <p className="font-medium">{operator.name}</p>
                      <p className="text-sm text-gray-500">
                        {operator.currentCall ? `On call: ${operator.currentCall}` : 'Available'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={`${getOperatorStatusColor(operator.status)} capitalize`}>
                      {operator.status}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {operator.callsHandled} calls • {operator.averageResponseTime}s avg
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Radio className="w-5 h-5" />
              <span>Communication Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Signal className="w-5 h-5 text-green-600" />
                  <span>Radio Signal</span>
                </div>
                <Badge className="bg-green-100 text-green-800">Strong</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Wifi className="w-5 h-5 text-blue-600" />
                  <span>Network Status</span>
                </div>
                <Badge className="bg-blue-100 text-blue-800">Connected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Phone className="w-5 h-5 text-purple-600" />
                  <span>Phone System</span>
                </div>
                <Badge className="bg-purple-100 text-purple-800">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Satellite className="w-5 h-5 text-orange-600" />
                  <span>GPS Tracking</span>
                </div>
                <Badge className="bg-orange-100 text-orange-800">Online</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Call Dialog */}
      <Dialog open={isViewCallDialogOpen} onOpenChange={setIsViewCallDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Call Details</DialogTitle>
          </DialogHeader>
          {selectedCall && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Call Information</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Call Number</Label>
                      <p className="text-lg font-semibold">{selectedCall.callNumber}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Caller Name</Label>
                      <p className="text-lg">{selectedCall.callerName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Phone</Label>
                      <p className="text-lg">{selectedCall.callerPhone}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Emergency Type</Label>
                      <Badge className="capitalize">{selectedCall.emergencyType}</Badge>
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
                  <h3 className="text-lg font-semibold mb-4">Dispatch Information</h3>
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
                      <Label className="text-sm font-medium text-gray-600">Dispatch Time</Label>
                      <p className="text-lg">{selectedCall.dispatchTime || 'Not dispatched'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Assigned Driver</Label>
                      <p className="text-lg">{selectedCall.assignedDriver || 'Unassigned'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Assigned Vehicle</Label>
                      <p className="text-lg">{selectedCall.assignedVehicle || 'Unassigned'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Location</h3>
                <p className="text-lg">{selectedCall.location}</p>
                <p className="text-sm text-gray-500">
                  {selectedCall.coordinates.lat.toFixed(4)}, {selectedCall.coordinates.lng.toFixed(4)}
                </p>
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
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setIsViewCallDialogOpen(false)}
            >
              Close
            </Button>
            {selectedCall && selectedCall.status === 'processing' && (
              <Button 
                onClick={() => {
                  setIsViewCallDialogOpen(false);
                  setIsDispatchDialogOpen(true);
                }}
              >
                <Radio className="w-4 h-4 mr-2" />
                Dispatch
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dispatch Assignment Dialog */}
      <Dialog open={isDispatchDialogOpen} onOpenChange={setIsDispatchDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Radio className="w-5 h-5" />
              <span>Dispatch Assignment</span>
            </DialogTitle>
          </DialogHeader>
          {selectedCall && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Call Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700 font-medium">Call:</span> {selectedCall.callNumber}
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Type:</span> {selectedCall.emergencyType}
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Priority:</span> 
                    <Badge className={`${getPriorityColor(selectedCall.priority)} ml-2 capitalize`}>
                      {selectedCall.priority}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Location:</span> {selectedCall.location}
                  </div>
                </div>
              </div>

              <form onSubmit={handleDispatchAmbulance}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="driver" className="text-sm font-medium">Assign Driver *</Label>
                    <Select 
                      value={dispatchForm.driverId}
                      onValueChange={(value) => setDispatchForm({...dispatchForm, driverId: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select driver" />
                      </SelectTrigger>
                      <SelectContent>
                        {drivers.map((driver) => (
                          <SelectItem key={driver._id} value={driver._id}>
                            {driver.firstName} {driver.lastName} - {driver.licenseNumber}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="vehicle" className="text-sm font-medium">Assign Vehicle *</Label>
                    <Select 
                      value={dispatchForm.vehicleId}
                      onValueChange={(value) => setDispatchForm({...dispatchForm, vehicleId: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles.map((vehicle) => (
                          <SelectItem key={vehicle._id} value={vehicle._id}>
                            {vehicle.vehicleNumber} ({vehicle.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="eta" className="text-sm font-medium">Estimated Arrival Time</Label>
                    <Input 
                      id="eta" 
                      type="datetime-local"
                      value={dispatchForm.estimatedArrival}
                      onChange={(e) => setDispatchForm({...dispatchForm, estimatedArrival: e.target.value})}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="dispatch-notes" className="text-sm font-medium">Dispatch Notes</Label>
                    <Textarea 
                      id="dispatch-notes" 
                      placeholder="Add any additional dispatch instructions..."
                      value={dispatchForm.notes}
                      onChange={(e) => setDispatchForm({...dispatchForm, notes: e.target.value})}
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-900 mb-2">Emergency Protocols</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Verify patient condition with caller</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Confirm location and access points</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Notify receiving hospital if needed</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Coordinate with other emergency services</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => {
                      setIsDispatchDialogOpen(false);
                      setDispatchForm({
                        driverId: '',
                        vehicleId: '',
                        estimatedArrival: '',
                        notes: ''
                      });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    <Radio className="w-4 h-4 mr-2" />
                    Confirm Dispatch
                  </Button>
                </div>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Real-time Communication Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>Real-time Communication</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <PhoneCall className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Active Calls</span>
                </div>
                <Badge className="bg-green-100 text-green-800">3</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Text Messages</span>
                </div>
                <Badge className="bg-blue-100 text-blue-800">12</Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <RadioIcon className="w-5 h-5 text-purple-600" />
                  <span className="font-medium">Radio Channels</span>
                </div>
                <Badge className="bg-purple-100 text-purple-800">8 Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <HeadphonesIcon className="w-5 h-5 text-orange-600" />
                  <span className="font-medium">Audio Quality</span>
                </div>
                <Badge className="bg-orange-100 text-orange-800">Excellent</Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm">
                  <Mic className="w-4 h-4 mr-2" />
                  Mute
                </Button>
                <Button variant="outline" size="sm">
                  <Volume2 className="w-4 h-4 mr-2" />
                  Volume
                </Button>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm">
                  <Bell className="w-4 h-4 mr-2" />
                  Alerts
                </Button>
                <Button variant="outline" size="sm">
                  <Mail className="w-4 h-4 mr-2" />
                  Messages
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Response Map */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Map className="w-5 h-5" />
            <span>Emergency Response Map</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Map className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Interactive map showing ambulance locations and emergency calls</p>
              <Button variant="outline" className="mt-2">
                <Compass className="w-4 h-4 mr-2" />
                Open Full Map
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Phone className="w-6 h-6 mb-2" />
              <span className="text-sm">New Call</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Radio className="w-6 h-6 mb-2" />
              <span className="text-sm">Dispatch</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Users className="w-6 h-6 mb-2" />
              <span className="text-sm">Team Status</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Activity className="w-6 h-6 mb-2" />
              <span className="text-sm">Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DispatchCenter; 