import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
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
  DollarSign
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

interface AmbulanceVehicle {
  _id: string;
  vehicleNumber: string;
  type: 'basic' | 'advanced' | 'critical-care' | 'neonatal' | 'bariatric';
  status: 'available' | 'in-use' | 'maintenance' | 'offline' | 'reserved';
  equipment: string[];
  assignedDriver?: {
    _id: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  currentLocation: {
    address: string;
  };
  specifications: {
    make: string;
    model: string;
    year: number;
    engine: string;
    transmission: string;
    fuelType: string;
  };
  maintenance: {
    totalCost: number;
    lastService: string;
    nextService: string;
    serviceHistory: Array<{
      date: string;
      type: string;
      cost: number;
      description: string;
    }>;
  };
  performance: {
    mileage: number;
    fuelLevel: number;
    engineStatus: 'good' | 'warning' | 'critical';
    fuelEfficiency: number;
  };
  insurance: {
    policyNumber: string;
    expiryDate: string;
    coverage: string;
  };
}

const VehicleFleet: React.FC = () => {
  const [vehicles, setVehicles] = useState<AmbulanceVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedVehicle, setSelectedVehicle] = useState<AmbulanceVehicle | null>(null);
  const [isAddVehicleDialogOpen, setIsAddVehicleDialogOpen] = useState(false);
  const [isViewVehicleDialogOpen, setIsViewVehicleDialogOpen] = useState(false);
  const [isEditVehicleDialogOpen, setIsEditVehicleDialogOpen] = useState(false);
  const [drivers, setDrivers] = useState<any[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    type: 'basic',
    status: 'available',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    mileage: 0,
    fuelLevel: 100,
    equipment: '',
    assignedDriver: '',
    engineStatus: 'good',
    fuelType: 'Diesel',
    transmission: 'Automatic',
    engine: '',
    insurancePolicy: '',
    insuranceExpiry: '',
    insuranceCoverage: 'Comprehensive',
    baseLocation: 'Main Hospital',
    priceBase: 100,
    pricePerKm: 10,
    priceEmergency: 50
  });

  useEffect(() => {
    fetchVehicles();
    fetchDrivers();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/hospital/ambulance/services', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVehicles(response.data.data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast.error('Failed to load vehicle fleet');
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/hospital/ambulance/drivers?status=available', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDrivers(response.data.data.drivers);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const handleCreateVehicle = async () => {
    try {
      const token = localStorage.getItem('token');

      const payload = {
        name: `${formData.make} ${formData.model}`, // Required by model
        contact: 'Hospital Transport', // Default
        vehicleNumber: formData.vehicleNumber,
        type: formData.type,
        status: formData.status,
        available: formData.status === 'available',
        assignedDriver: formData.assignedDriver && formData.assignedDriver !== 'unassigned' ? formData.assignedDriver : null,
        specifications: {
          make: formData.make,
          model: formData.model,
          year: formData.year,
          engine: formData.engine,
          transmission: formData.transmission,
          fuelType: formData.fuelType
        },
        performance: {
          mileage: formData.mileage,
          fuelLevel: formData.fuelLevel,
          engineStatus: formData.engineStatus
        },
        insurance: {
          policyNumber: formData.insurancePolicy,
          expiryDate: formData.insuranceExpiry,
          coverage: formData.insuranceCoverage
        },
        equipment: formData.equipment.split(',').map(e => e.trim()).filter(e => e),
        baseLocation: formData.baseLocation,
        currentLocation: {
          address: formData.baseLocation,
          lat: 0, // Default
          lng: 0  // Default
        },
        responseTime: '10-15', // Default
        price: {
          base: formData.priceBase,
          perKm: formData.pricePerKm,
          emergency: formData.priceEmergency
        }
      };

      await axios.post('http://localhost:5000/api/hospital/ambulance/services', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Vehicle added successfully');
      setIsAddVehicleDialogOpen(false);
      fetchVehicles();
      resetForm();
    } catch (error) {
      console.error('Error creating vehicle:', error);
      toast.error('Failed to add vehicle');
    }
  };

  const handleUpdateVehicle = async () => {
    if (!selectedVehicle) return;
    try {
      const token = localStorage.getItem('token');

      // Construct update payload similar to create
      const payload = {
        vehicleNumber: formData.vehicleNumber,
        type: formData.type,
        status: formData.status,
        available: formData.status === 'available',
        assignedDriver: formData.assignedDriver && formData.assignedDriver !== 'unassigned' ? formData.assignedDriver : null,
        specifications: {
          make: formData.make,
          model: formData.model,
          year: formData.year,
          engine: formData.engine,
          transmission: formData.transmission,
          fuelType: formData.fuelType
        },
        performance: {
          mileage: formData.mileage,
          fuelLevel: formData.fuelLevel,
          engineStatus: formData.engineStatus
        },
        insurance: {
          policyNumber: formData.insurancePolicy,
          expiryDate: formData.insuranceExpiry,
          coverage: formData.insuranceCoverage
        },
        equipment: formData.equipment.split(',').map(e => e.trim()).filter(e => e)
      };

      await axios.put(`http://localhost:5000/api/hospital/ambulance/services/${selectedVehicle._id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Vehicle updated successfully');
      setIsEditVehicleDialogOpen(false);
      fetchVehicles();
    } catch (error) {
      console.error('Error updating vehicle:', error);
      toast.error('Failed to update vehicle');
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/hospital/ambulance/services/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Vehicle deleted successfully');
      fetchVehicles();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast.error('Failed to delete vehicle');
    }
  };

  const resetForm = () => {
    setFormData({
      vehicleNumber: '',
      type: 'basic',
      status: 'available',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      mileage: 0,
      fuelLevel: 100,
      equipment: '',
      assignedDriver: '',
      engineStatus: 'good',
      fuelType: 'Diesel',
      transmission: 'Automatic',
      engine: '',
      insurancePolicy: '',
      insuranceExpiry: '',
      insuranceCoverage: 'Comprehensive',
      baseLocation: 'Main Hospital',
      priceBase: 100,
      pricePerKm: 10,
      priceEmergency: 50
    });
  };

  const populateForm = (vehicle: AmbulanceVehicle) => {
    setFormData({
      vehicleNumber: vehicle.vehicleNumber,
      type: vehicle.type,
      status: vehicle.status,
      make: vehicle.specifications?.make || '',
      model: vehicle.specifications?.model || '',
      year: vehicle.specifications?.year || new Date().getFullYear(),
      mileage: vehicle.performance?.mileage || 0,
      fuelLevel: vehicle.performance?.fuelLevel || 100,
      equipment: vehicle.equipment?.join(', ') || '',
      assignedDriver: vehicle.assignedDriver?._id || 'unassigned',
      engineStatus: vehicle.performance?.engineStatus || 'good',
      fuelType: vehicle.specifications?.fuelType || 'Diesel',
      transmission: vehicle.specifications?.transmission || 'Automatic',
      engine: vehicle.specifications?.engine || '',
      insurancePolicy: vehicle.insurance?.policyNumber || '',
      insuranceExpiry: vehicle.insurance?.expiryDate ? new Date(vehicle.insurance.expiryDate).toISOString().split('T')[0] : '',
      insuranceCoverage: vehicle.insurance?.coverage || 'Comprehensive',
      baseLocation: 'Main Hospital', // Default as not always in response
      priceBase: 100, // Default
      pricePerKm: 10, // Default
      priceEmergency: 50 // Default
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-use': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'offline': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'reserved': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'basic': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'advanced': return 'bg-teal-50 text-teal-700 border-teal-100';
      case 'critical-care': return 'bg-red-50 text-red-700 border-red-100';
      case 'neonatal': return 'bg-pink-50 text-pink-700 border-pink-100';
      case 'bariatric': return 'bg-orange-50 text-orange-700 border-orange-100';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const getEngineStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.specifications?.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.specifications?.model?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    const matchesType = typeFilter === 'all' || vehicle.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    totalVehicles: vehicles.length,
    availableVehicles: vehicles.filter(v => v.status === 'available').length,
    inUseVehicles: vehicles.filter(v => v.status === 'in-use').length,
    maintenanceVehicles: vehicles.filter(v => v.status === 'maintenance').length,
    averageMileage: vehicles.reduce((acc, v) => acc + (v.performance?.mileage || 0), 0) / (vehicles.length || 1),
    totalMaintenanceCost: vehicles.reduce((acc, v) => acc + (v.maintenance?.totalCost || 0), 0)
  };

  return (
    <div className="space-y-6 min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-teal-100">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-cyan-600">
            Vehicle Fleet
          </h1>
          <p className="text-gray-500 mt-1">Manage ambulance fleet and maintenance</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button
            onClick={() => {
              resetForm();
              setIsAddVehicleDialogOpen(true);
            }}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-md transition-all duration-200 hover:shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Vehicle
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="bg-white border-teal-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Vehicles</p>
              <p className="text-xl font-bold text-gray-800">{stats.totalVehicles}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-green-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2 bg-green-50 rounded-lg text-green-600">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Available</p>
              <p className="text-xl font-bold text-green-600">{stats.availableVehicles}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-blue-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">In Use</p>
              <p className="text-xl font-bold text-blue-600">{stats.inUseVehicles}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-yellow-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Maintenance</p>
              <p className="text-xl font-bold text-yellow-600">{stats.maintenanceVehicles}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-purple-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <Gauge className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Avg Mileage</p>
              <p className="text-xl font-bold text-purple-600">{Math.round(stats.averageMileage / 1000)}k</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-red-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2 bg-red-50 rounded-lg text-red-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Cost</p>
              <p className="text-xl font-bold text-red-600">${(stats.totalMaintenanceCost / 1000).toFixed(1)}k</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white border-gray-100 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search vehicles by number, make, or model..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 border-gray-200">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="in-use">In Use</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40 border-gray-200">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="critical-care">Critical Care</SelectItem>
                  <SelectItem value="neonatal">Neonatal</SelectItem>
                  <SelectItem value="bariatric">Bariatric</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicles Table */}
      <Card className="bg-white border-gray-100 shadow-sm overflow-hidden">
        <CardHeader className="bg-gray-50 border-b border-gray-100 py-4">
          <CardTitle className="text-lg font-semibold text-gray-800">Ambulance Fleet</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left p-4 font-medium text-gray-500 text-sm">Vehicle</th>
                  <th className="text-left p-4 font-medium text-gray-500 text-sm">Type</th>
                  <th className="text-left p-4 font-medium text-gray-500 text-sm">Status</th>
                  <th className="text-left p-4 font-medium text-gray-500 text-sm">Location</th>
                  <th className="text-left p-4 font-medium text-gray-500 text-sm">Driver</th>
                  <th className="text-left p-4 font-medium text-gray-500 text-sm">Mileage</th>
                  <th className="text-left p-4 font-medium text-gray-500 text-sm">Fuel</th>
                  <th className="text-left p-4 font-medium text-gray-500 text-sm">Engine</th>
                  <th className="text-left p-4 font-medium text-gray-500 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredVehicles.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-gray-500">
                      No vehicles found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredVehicles.map((vehicle) => (
                    <tr key={vehicle._id} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-gray-800">{vehicle.vehicleNumber}</div>
                        <div className="text-xs text-gray-500">{vehicle.specifications?.make} {vehicle.specifications?.model}</div>
                        <div className="text-xs text-gray-400">{vehicle.specifications?.year}</div>
                      </td>
                      <td className="p-4">
                        <Badge className={`${getTypeColor(vehicle.type)} capitalize shadow-sm border`}>
                          {vehicle.type}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge className={`${getStatusColor(vehicle.status)} capitalize shadow-sm border`}>
                          {vehicle.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-600">{vehicle.currentLocation?.address || 'Unknown'}</div>
                      </td>
                      <td className="p-4">
                        {vehicle.assignedDriver ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-xs font-bold text-teal-700">
                              {vehicle.assignedDriver.firstName[0]}
                            </div>
                            <span className="text-sm text-gray-700">{vehicle.assignedDriver.firstName}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-mono text-gray-600">{(vehicle.performance?.mileage || 0).toLocaleString()} km</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${(vehicle.performance?.fuelLevel || 0) > 20 ? 'bg-green-500' : 'bg-red-500'
                                }`}
                              style={{ width: `${vehicle.performance?.fuelLevel || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">{vehicle.performance?.fuelLevel || 0}%</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={`${getEngineStatusColor(vehicle.performance?.engineStatus || 'good')} capitalize text-xs`}>
                          {vehicle.performance?.engineStatus || 'good'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => {
                              setSelectedVehicle(vehicle);
                              setIsViewVehicleDialogOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                            onClick={() => {
                              setSelectedVehicle(vehicle);
                              populateForm(vehicle);
                              setIsEditVehicleDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteVehicle(vehicle._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Vehicle Dialog */}
      <Dialog
        open={isAddVehicleDialogOpen || isEditVehicleDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddVehicleDialogOpen(false);
            setIsEditVehicleDialogOpen(false);
          }
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-teal-700">
              {isAddVehicleDialogOpen ? 'Add New Vehicle' : 'Edit Vehicle'}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="specs">Specifications</TabsTrigger>
              <TabsTrigger value="status">Status & Perf</TabsTrigger>
              <TabsTrigger value="insurance">Insurance</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicleNumber">Vehicle Number</Label>
                  <Input
                    id="vehicleNumber"
                    value={formData.vehicleNumber}
                    onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                    placeholder="e.g., AMB-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Vehicle Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="critical-care">Critical Care</SelectItem>
                      <SelectItem value="neonatal">Neonatal</SelectItem>
                      <SelectItem value="bariatric">Bariatric</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assignedDriver">Assigned Driver</Label>
                  <Select
                    value={formData.assignedDriver}
                    onValueChange={(value) => setFormData({ ...formData, assignedDriver: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select driver" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {drivers.map(driver => (
                        <SelectItem key={driver._id} value={driver._id}>
                          {driver.firstName} {driver.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="baseLocation">Base Location</Label>
                  <Input
                    id="baseLocation"
                    value={formData.baseLocation}
                    onChange={(e) => setFormData({ ...formData, baseLocation: e.target.value })}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="equipment">Equipment (comma separated)</Label>
                  <Textarea
                    id="equipment"
                    value={formData.equipment}
                    onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                    placeholder="Defibrillator, Oxygen, Stretcher..."
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="specs" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="make">Make</Label>
                  <Input
                    id="make"
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="engine">Engine</Label>
                  <Input
                    id="engine"
                    value={formData.engine}
                    onChange={(e) => setFormData({ ...formData, engine: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transmission">Transmission</Label>
                  <Select
                    value={formData.transmission}
                    onValueChange={(value) => setFormData({ ...formData, transmission: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select transmission" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Automatic">Automatic</SelectItem>
                      <SelectItem value="Manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fuelType">Fuel Type</Label>
                  <Select
                    value={formData.fuelType}
                    onValueChange={(value) => setFormData({ ...formData, fuelType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select fuel type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Diesel">Diesel</SelectItem>
                      <SelectItem value="Gasoline">Gasoline</SelectItem>
                      <SelectItem value="Electric">Electric</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="status" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="in-use">In Use</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="engineStatus">Engine Status</Label>
                  <Select
                    value={formData.engineStatus}
                    onValueChange={(value) => setFormData({ ...formData, engineStatus: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select engine status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mileage">Mileage (km)</Label>
                  <Input
                    id="mileage"
                    type="number"
                    value={formData.mileage}
                    onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fuelLevel">Fuel Level (%)</Label>
                  <Input
                    id="fuelLevel"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.fuelLevel}
                    onChange={(e) => setFormData({ ...formData, fuelLevel: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="insurance" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="insurancePolicy">Policy Number</Label>
                  <Input
                    id="insurancePolicy"
                    value={formData.insurancePolicy}
                    onChange={(e) => setFormData({ ...formData, insurancePolicy: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insuranceExpiry">Expiry Date</Label>
                  <Input
                    id="insuranceExpiry"
                    type="date"
                    value={formData.insuranceExpiry}
                    onChange={(e) => setFormData({ ...formData, insuranceExpiry: e.target.value })}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="insuranceCoverage">Coverage Type</Label>
                  <Input
                    id="insuranceCoverage"
                    value={formData.insuranceCoverage}
                    onChange={(e) => setFormData({ ...formData, insuranceCoverage: e.target.value })}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => {
              setIsAddVehicleDialogOpen(false);
              setIsEditVehicleDialogOpen(false);
            }}>Cancel</Button>
            <Button
              onClick={isAddVehicleDialogOpen ? handleCreateVehicle : handleUpdateVehicle}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              {isAddVehicleDialogOpen ? 'Add Vehicle' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Vehicle Dialog */}
      <Dialog open={isViewVehicleDialogOpen} onOpenChange={setIsViewVehicleDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-teal-700">Vehicle Details</DialogTitle>
          </DialogHeader>
          {selectedVehicle && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Vehicle Information</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Vehicle Number</Label>
                      <p className="text-lg font-mono font-bold text-gray-800">{selectedVehicle.vehicleNumber}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Type</Label>
                      <div className="mt-1">
                        <Badge className={`${getTypeColor(selectedVehicle.type)} capitalize`}>
                          {selectedVehicle.type}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Make & Model</Label>
                      <p className="text-lg text-gray-800">{selectedVehicle.specifications?.make} {selectedVehicle.specifications?.model}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Year</Label>
                      <p className="text-lg text-gray-800">{selectedVehicle.specifications?.year}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Engine</Label>
                      <p className="text-lg text-gray-800">{selectedVehicle.specifications?.engine}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Current Status</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Status</Label>
                      <div className="mt-1">
                        <Badge className={`${getStatusColor(selectedVehicle.status)} capitalize`}>
                          {selectedVehicle.status}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Location</Label>
                      <p className="text-lg text-gray-800">{selectedVehicle.currentLocation?.address || 'Unknown'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Assigned Driver</Label>
                      <p className="text-lg text-gray-800">
                        {selectedVehicle.assignedDriver ?
                          `${selectedVehicle.assignedDriver.firstName} ${selectedVehicle.assignedDriver.lastName}` :
                          'Unassigned'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Mileage</Label>
                      <p className="text-lg text-gray-800">{(selectedVehicle.performance?.mileage || 0).toLocaleString()} km</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Equipment</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedVehicle.equipment?.map((item, index) => (
                    <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Performance Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="text-2xl font-bold text-blue-600">{selectedVehicle.performance?.fuelLevel}%</div>
                    <div className="text-sm text-gray-600">Fuel Level</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                    <div className="text-2xl font-bold text-green-600 capitalize">{selectedVehicle.performance?.engineStatus}</div>
                    <div className="text-sm text-gray-600">Engine Status</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
                    <div className="text-2xl font-bold text-purple-600">{selectedVehicle.specifications?.transmission}</div>
                    <div className="text-sm text-gray-600">Transmission</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                    <div className="text-2xl font-bold text-yellow-600">{selectedVehicle.specifications?.fuelType}</div>
                    <div className="text-sm text-gray-600">Fuel Type</div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Insurance & Maintenance</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Policy Number</Label>
                    <p className="text-lg text-gray-800">{selectedVehicle.insurance?.policyNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Expiry Date</Label>
                    <p className="text-lg text-gray-800">
                      {selectedVehicle.insurance?.expiryDate ? new Date(selectedVehicle.insurance.expiryDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Total Maintenance Cost</Label>
                    <p className="text-lg text-gray-800">${(selectedVehicle.maintenance?.totalCost || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={() => setIsViewVehicleDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VehicleFleet;