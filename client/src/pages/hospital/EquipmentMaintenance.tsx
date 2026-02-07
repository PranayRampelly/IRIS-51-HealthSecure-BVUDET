import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Wrench, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Search, 
  Filter,
  Plus,
  Edit,
  Eye,
  Trash2,
  MapPin,
  Calendar,
  Activity,
  BarChart3,
  TrendingUp,
  Building2,
  Settings,
  Zap,
  Shield,
  AlertCircle,
  Play,
  Square
} from 'lucide-react';

interface Equipment {
  id: string;
  name: string;
  type: 'monitoring' | 'surgical' | 'diagnostic' | 'life-support' | 'imaging' | 'laboratory';
  serialNumber: string;
  model: string;
  manufacturer: string;
  location: string;
  status: 'operational' | 'maintenance' | 'repair' | 'out-of-service' | 'calibration';
  lastMaintenance: string;
  nextMaintenance: string;
  maintenanceInterval: string;
  technician: string;
  department: string;
  purchaseDate: string;
  warrantyExpiry: string;
  cost: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  issues?: string[];
  notes?: string;
}

const EquipmentMaintenance: React.FC = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isMaintenanceDialogOpen, setIsMaintenanceDialogOpen] = useState(false);

  // Fetch equipment from API
  useEffect(() => {
    // Removed mock data - fetch from API instead
    const fetchEquipment = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        // const response = await api.get('/hospital/equipment');
        // setEquipment(response.data);
        setEquipment([]);
      } catch (error) {
        console.error('Error fetching equipment:', error);
        setEquipment([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEquipment();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'repair': return 'bg-red-100 text-red-800';
      case 'out-of-service': return 'bg-gray-100 text-gray-800';
      case 'calibration': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational': return <CheckCircle className="w-4 h-4" />;
      case 'maintenance': return <Wrench className="w-4 h-4" />;
      case 'repair': return <AlertTriangle className="w-4 h-4" />;
      case 'out-of-service': return <Square className="w-4 h-4" />;
      case 'calibration': return <Settings className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'monitoring': return <Activity className="w-4 h-4" />;
      case 'surgical': return <Wrench className="w-4 h-4" />;
      case 'diagnostic': return <Zap className="w-4 h-4" />;
      case 'life-support': return <Shield className="w-4 h-4" />;
      case 'imaging': return <Building2 className="w-4 h-4" />;
      case 'laboratory': return <Settings className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;
    return matchesSearch && matchesType && matchesStatus && matchesPriority;
  });

  const stats = {
    total: equipment.length,
    operational: equipment.filter(e => e.status === 'operational').length,
    maintenance: equipment.filter(e => e.status === 'maintenance').length,
    repair: equipment.filter(e => e.status === 'repair').length,
    outOfService: equipment.filter(e => e.status === 'out-of-service').length,
    calibration: equipment.filter(e => e.status === 'calibration').length
  };

  const totalValue = equipment.reduce((sum, item) => sum + item.cost, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Equipment Maintenance</h1>
          <p className="text-gray-600">Manage hospital equipment maintenance and repairs</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add New Equipment
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Equipment</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Operational</p>
                <p className="text-2xl font-bold text-green-600">{stats.operational}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Wrench className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Maintenance</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.maintenance}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Repair</p>
                <p className="text-2xl font-bold text-red-600">{stats.repair}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Settings className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Calibration</p>
                <p className="text-2xl font-bold text-blue-600">{stats.calibration}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-purple-600">${totalValue.toLocaleString()}</p>
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
                  placeholder="Search equipment, serial number, or model..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="monitoring">Monitoring</SelectItem>
                <SelectItem value="surgical">Surgical</SelectItem>
                <SelectItem value="diagnostic">Diagnostic</SelectItem>
                <SelectItem value="life-support">Life Support</SelectItem>
                <SelectItem value="imaging">Imaging</SelectItem>
                <SelectItem value="laboratory">Laboratory</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="operational">Operational</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="repair">Repair</SelectItem>
                <SelectItem value="out-of-service">Out of Service</SelectItem>
                <SelectItem value="calibration">Calibration</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Equipment Table */}
      <Card>
        <CardHeader>
          <CardTitle>Equipment Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Equipment</th>
                  <th className="text-left p-3 font-medium">Type</th>
                  <th className="text-left p-3 font-medium">Serial Number</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Priority</th>
                  <th className="text-left p-3 font-medium">Location</th>
                  <th className="text-left p-3 font-medium">Next Maintenance</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEquipment.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-500">{item.model}</div>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className="capitalize flex items-center gap-1 w-fit">
                        {getTypeIcon(item.type)}
                        {item.type.replace('-', ' ')}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="font-mono text-sm">{item.serialNumber}</div>
                    </td>
                    <td className="p-3">
                      <Badge className={`${getStatusColor(item.status)} flex items-center gap-1 w-fit`}>
                        {getStatusIcon(item.status)}
                        {item.status.replace('-', ' ').charAt(0).toUpperCase() + item.status.replace('-', ' ').slice(1)}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge className={`${getPriorityColor(item.priority)} capitalize`}>
                        {item.priority}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">{item.location}</div>
                      <div className="text-xs text-gray-500">{item.department}</div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">{item.nextMaintenance}</div>
                      <div className="text-xs text-gray-500">{item.maintenanceInterval}</div>
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedEquipment(item);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedEquipment(item);
                            setIsMaintenanceDialogOpen(true);
                          }}
                        >
                          <Wrench className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedEquipment(item);
                            setIsEditDialogOpen(true);
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

      {/* Add Equipment Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Equipment</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Equipment Name</Label>
              <Input id="name" placeholder="e.g., ECG Monitor" />
            </div>
            <div>
              <Label htmlFor="serialNumber">Serial Number</Label>
              <Input id="serialNumber" placeholder="e.g., ECG-2024-001" />
            </div>
            <div>
              <Label htmlFor="type">Equipment Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monitoring">Monitoring</SelectItem>
                  <SelectItem value="surgical">Surgical</SelectItem>
                  <SelectItem value="diagnostic">Diagnostic</SelectItem>
                  <SelectItem value="life-support">Life Support</SelectItem>
                  <SelectItem value="imaging">Imaging</SelectItem>
                  <SelectItem value="laboratory">Laboratory</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="model">Model</Label>
              <Input id="model" placeholder="e.g., ProCare 5000" />
            </div>
            <div>
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input id="manufacturer" placeholder="e.g., MedTech Solutions" />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="e.g., ICU Room 201" />
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Input id="department" placeholder="e.g., ICU" />
            </div>
            <div>
              <Label htmlFor="technician">Assigned Technician</Label>
              <Input id="technician" placeholder="e.g., John Smith" />
            </div>
            <div>
              <Label htmlFor="cost">Purchase Cost</Label>
              <Input id="cost" type="number" step="0.01" placeholder="e.g., 25000.00" />
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select>
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
              <Label htmlFor="purchaseDate">Purchase Date</Label>
              <Input id="purchaseDate" type="date" />
            </div>
            <div>
              <Label htmlFor="warrantyExpiry">Warranty Expiry</Label>
              <Input id="warrantyExpiry" type="date" />
            </div>
            <div>
              <Label htmlFor="maintenanceInterval">Maintenance Interval</Label>
              <Input id="maintenanceInterval" placeholder="e.g., 30 days" />
            </div>
            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Equipment description..." />
            </div>
            <div className="col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Additional notes..." />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Add Equipment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Maintenance Dialog */}
      <Dialog open={isMaintenanceDialogOpen} onOpenChange={setIsMaintenanceDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Maintenance</DialogTitle>
          </DialogHeader>
          {selectedEquipment && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Equipment</Label>
                <p className="text-lg font-semibold">{selectedEquipment.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Current Status</Label>
                <Badge className={`${getStatusColor(selectedEquipment.status)}`}>
                  {selectedEquipment.status.replace('-', ' ').charAt(0).toUpperCase() + selectedEquipment.status.replace('-', ' ').slice(1)}
                </Badge>
              </div>
              <div>
                <Label htmlFor="maintenanceType">Maintenance Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preventive">Preventive</SelectItem>
                    <SelectItem value="corrective">Corrective</SelectItem>
                    <SelectItem value="calibration">Calibration</SelectItem>
                    <SelectItem value="inspection">Inspection</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="maintenanceDate">Scheduled Date</Label>
                <Input id="maintenanceDate" type="date" />
              </div>
              <div>
                <Label htmlFor="maintenanceTechnician">Technician</Label>
                <Input id="maintenanceTechnician" defaultValue={selectedEquipment.technician} />
              </div>
              <div>
                <Label htmlFor="maintenanceNotes">Notes</Label>
                <Textarea id="maintenanceNotes" placeholder="Maintenance details..." />
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsMaintenanceDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">
              Schedule Maintenance
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Equipment Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Equipment Details</DialogTitle>
          </DialogHeader>
          {selectedEquipment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Equipment Name</Label>
                  <p className="text-lg font-semibold">{selectedEquipment.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Serial Number</Label>
                  <p className="text-lg font-mono">{selectedEquipment.serialNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Type</Label>
                  <Badge variant="outline" className="capitalize">
                    {selectedEquipment.type.replace('-', ' ')}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <Badge className={`${getStatusColor(selectedEquipment.status)}`}>
                    {selectedEquipment.status.replace('-', ' ').charAt(0).toUpperCase() + selectedEquipment.status.replace('-', ' ').slice(1)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Model</Label>
                  <p className="text-lg">{selectedEquipment.model}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Manufacturer</Label>
                  <p className="text-lg">{selectedEquipment.manufacturer}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Location</Label>
                  <p className="text-lg">{selectedEquipment.location}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Department</Label>
                  <p className="text-lg">{selectedEquipment.department}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Priority</Label>
                  <Badge className={`${getPriorityColor(selectedEquipment.priority)} capitalize`}>
                    {selectedEquipment.priority}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Technician</Label>
                  <p className="text-lg">{selectedEquipment.technician}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <Label className="text-sm font-medium text-gray-600">Description</Label>
                <p className="text-lg">{selectedEquipment.description}</p>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Maintenance Schedule</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Last Maintenance</Label>
                    <p className="text-lg">{selectedEquipment.lastMaintenance}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Next Maintenance</Label>
                    <p className="text-lg">{selectedEquipment.nextMaintenance}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Interval</Label>
                    <p className="text-lg">{selectedEquipment.maintenanceInterval}</p>
                  </div>
                </div>
              </div>

              {selectedEquipment.issues && selectedEquipment.issues.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Current Issues</h4>
                  <div className="space-y-2">
                    {selectedEquipment.issues.map((issue, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-red-50 rounded">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span className="text-sm">{issue}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Purchase Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Purchase Date</Label>
                    <p className="text-lg">{selectedEquipment.purchaseDate}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Warranty Expiry</Label>
                    <p className="text-lg">{selectedEquipment.warrantyExpiry}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Purchase Cost</Label>
                    <p className="text-lg">${selectedEquipment.cost.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {selectedEquipment.notes && (
                <div className="border-t pt-4">
                  <Label className="text-sm font-medium text-gray-600">Notes</Label>
                  <p className="text-lg">{selectedEquipment.notes}</p>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EquipmentMaintenance; 