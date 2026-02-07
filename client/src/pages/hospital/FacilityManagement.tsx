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
  Building2, 
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
  Settings,
  Wrench,
  Zap,
  Shield,
  AlertCircle,
  Play,
  Square,
  Thermometer,
  Droplets,
  Lightbulb,
  Wifi
} from 'lucide-react';

interface Facility {
  id: string;
  name: string;
  type: 'building' | 'room' | 'equipment' | 'system' | 'area' | 'utility';
  location: string;
  floor: string;
  status: 'operational' | 'maintenance' | 'repair' | 'out-of-service' | 'upgrade';
  priority: 'low' | 'medium' | 'high' | 'critical';
  lastInspection: string;
  nextInspection: string;
  inspector: string;
  department: string;
  capacity?: number;
  currentUsage?: number;
  temperature?: string;
  humidity?: string;
  powerStatus: 'normal' | 'backup' | 'offline';
  maintenanceHistory: string[];
  issues?: string[];
  notes?: string;
}

const FacilityManagement: React.FC = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isInspectionDialogOpen, setIsInspectionDialogOpen] = useState(false);

  // Fetch facilities from API
  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        // const response = await api.get('/hospital/facilities');
        // setFacilities(response.data);
        setFacilities([]);
      } catch (error) {
        console.error('Error fetching facilities:', error);
        setFacilities([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFacilities();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'repair': return 'bg-red-100 text-red-800';
      case 'out-of-service': return 'bg-gray-100 text-gray-800';
      case 'upgrade': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational': return <CheckCircle className="w-4 h-4" />;
      case 'maintenance': return <Wrench className="w-4 h-4" />;
      case 'repair': return <AlertTriangle className="w-4 h-4" />;
      case 'out-of-service': return <Square className="w-4 h-4" />;
      case 'upgrade': return <Settings className="w-4 h-4" />;
      default: return <Building2 className="w-4 h-4" />;
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
      case 'building': return <Building2 className="w-4 h-4" />;
      case 'room': return <MapPin className="w-4 h-4" />;
      case 'equipment': return <Wrench className="w-4 h-4" />;
      case 'system': return <Settings className="w-4 h-4" />;
      case 'area': return <Activity className="w-4 h-4" />;
      case 'utility': return <Zap className="w-4 h-4" />;
      default: return <Building2 className="w-4 h-4" />;
    }
  };

  const getPowerStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-100 text-green-800';
      case 'backup': return 'bg-yellow-100 text-yellow-800';
      case 'offline': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredFacilities = facilities.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;
    return matchesSearch && matchesType && matchesStatus && matchesPriority;
  });

  const stats = {
    total: facilities.length,
    operational: facilities.filter(f => f.status === 'operational').length,
    maintenance: facilities.filter(f => f.status === 'maintenance').length,
    repair: facilities.filter(f => f.status === 'repair').length,
    outOfService: facilities.filter(f => f.status === 'out-of-service').length,
    upgrade: facilities.filter(f => f.status === 'upgrade').length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Facility Management</h1>
          <p className="text-gray-600">Manage hospital facilities and infrastructure</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add New Facility
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Facilities</p>
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
                <p className="text-sm font-medium text-gray-600">Upgrade</p>
                <p className="text-2xl font-bold text-blue-600">{stats.upgrade}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Utilization</p>
                <p className="text-2xl font-bold text-purple-600">85%</p>
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
                  placeholder="Search facilities, location, or department..."
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
                <SelectItem value="building">Building</SelectItem>
                <SelectItem value="room">Room</SelectItem>
                <SelectItem value="equipment">Equipment</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="area">Area</SelectItem>
                <SelectItem value="utility">Utility</SelectItem>
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
                <SelectItem value="upgrade">Upgrade</SelectItem>
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

      {/* Facilities Table */}
      <Card>
        <CardHeader>
          <CardTitle>Facility Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Facility</th>
                  <th className="text-left p-3 font-medium">Type</th>
                  <th className="text-left p-3 font-medium">Location</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Priority</th>
                  <th className="text-left p-3 font-medium">Power</th>
                  <th className="text-left p-3 font-medium">Next Inspection</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFacilities.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-500">{item.department}</div>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className="capitalize flex items-center gap-1 w-fit">
                        {getTypeIcon(item.type)}
                        {item.type}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">{item.location}</div>
                      <div className="text-xs text-gray-500">Floor {item.floor}</div>
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
                      <Badge className={`${getPowerStatusColor(item.powerStatus)} capitalize`}>
                        {item.powerStatus}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">{item.nextInspection}</div>
                      <div className="text-xs text-gray-500">{item.inspector}</div>
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedFacility(item);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedFacility(item);
                            setIsInspectionDialogOpen(true);
                          }}
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedFacility(item);
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

      {/* Add Facility Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Facility</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Facility Name</Label>
              <Input id="name" placeholder="e.g., Main Building" />
            </div>
            <div>
              <Label htmlFor="type">Facility Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="building">Building</SelectItem>
                  <SelectItem value="room">Room</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="area">Area</SelectItem>
                  <SelectItem value="utility">Utility</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="e.g., Hospital Campus" />
            </div>
            <div>
              <Label htmlFor="floor">Floor</Label>
              <Input id="floor" placeholder="e.g., 2" />
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Input id="department" placeholder="e.g., Facilities" />
            </div>
            <div>
              <Label htmlFor="inspector">Assigned Inspector</Label>
              <Input id="inspector" placeholder="e.g., John Smith" />
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
              <Label htmlFor="powerStatus">Power Status</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="backup">Backup</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="capacity">Capacity (Optional)</Label>
              <Input id="capacity" type="number" placeholder="e.g., 100" />
            </div>
            <div>
              <Label htmlFor="temperature">Temperature (Optional)</Label>
              <Input id="temperature" placeholder="e.g., 22°C" />
            </div>
            <div>
              <Label htmlFor="humidity">Humidity (Optional)</Label>
              <Input id="humidity" placeholder="e.g., 45%" />
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
              Add Facility
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Inspection Dialog */}
      <Dialog open={isInspectionDialogOpen} onOpenChange={setIsInspectionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Inspection</DialogTitle>
          </DialogHeader>
          {selectedFacility && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Facility</Label>
                <p className="text-lg font-semibold">{selectedFacility.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Current Status</Label>
                <Badge className={`${getStatusColor(selectedFacility.status)}`}>
                  {selectedFacility.status.replace('-', ' ').charAt(0).toUpperCase() + selectedFacility.status.replace('-', ' ').slice(1)}
                </Badge>
              </div>
              <div>
                <Label htmlFor="inspectionType">Inspection Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="routine">Routine</SelectItem>
                    <SelectItem value="safety">Safety</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="inspectionDate">Scheduled Date</Label>
                <Input id="inspectionDate" type="date" />
              </div>
              <div>
                <Label htmlFor="inspectionInspector">Inspector</Label>
                <Input id="inspectionInspector" defaultValue={selectedFacility.inspector} />
              </div>
              <div>
                <Label htmlFor="inspectionNotes">Notes</Label>
                <Textarea id="inspectionNotes" placeholder="Inspection details..." />
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsInspectionDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">
              Schedule Inspection
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Facility Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Facility Details</DialogTitle>
          </DialogHeader>
          {selectedFacility && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Facility Name</Label>
                  <p className="text-lg font-semibold">{selectedFacility.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Type</Label>
                  <Badge variant="outline" className="capitalize">
                    {selectedFacility.type}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Location</Label>
                  <p className="text-lg">{selectedFacility.location}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Floor</Label>
                  <p className="text-lg">{selectedFacility.floor}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <Badge className={`${getStatusColor(selectedFacility.status)}`}>
                    {selectedFacility.status.replace('-', ' ').charAt(0).toUpperCase() + selectedFacility.status.replace('-', ' ').slice(1)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Priority</Label>
                  <Badge className={`${getPriorityColor(selectedFacility.priority)} capitalize`}>
                    {selectedFacility.priority}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Department</Label>
                  <p className="text-lg">{selectedFacility.department}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Inspector</Label>
                  <p className="text-lg">{selectedFacility.inspector}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Power Status</Label>
                  <Badge className={`${getPowerStatusColor(selectedFacility.powerStatus)} capitalize`}>
                    {selectedFacility.powerStatus}
                  </Badge>
                </div>
              </div>

              {selectedFacility.capacity && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Capacity Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Capacity</Label>
                      <p className="text-lg">{selectedFacility.capacity}</p>
                    </div>
                    {selectedFacility.currentUsage && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Current Usage</Label>
                        <p className="text-lg">{selectedFacility.currentUsage}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(selectedFacility.temperature || selectedFacility.humidity) && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Environmental Conditions</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedFacility.temperature && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Temperature</Label>
                        <p className="text-lg">{selectedFacility.temperature}</p>
                      </div>
                    )}
                    {selectedFacility.humidity && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Humidity</Label>
                        <p className="text-lg">{selectedFacility.humidity}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Inspection Schedule</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Last Inspection</Label>
                    <p className="text-lg">{selectedFacility.lastInspection}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Next Inspection</Label>
                    <p className="text-lg">{selectedFacility.nextInspection}</p>
                  </div>
                </div>
              </div>

              {selectedFacility.issues && selectedFacility.issues.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Current Issues</h4>
                  <div className="space-y-2">
                    {selectedFacility.issues.map((issue, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-red-50 rounded">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span className="text-sm">{issue}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Maintenance History</h4>
                <div className="space-y-2">
                  {selectedFacility.maintenanceHistory.map((record, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded">
                      <span className="text-sm">{record}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedFacility.notes && (
                <div className="border-t pt-4">
                  <Label className="text-sm font-medium text-gray-600">Notes</Label>
                  <p className="text-lg">{selectedFacility.notes}</p>
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

export default FacilityManagement; 