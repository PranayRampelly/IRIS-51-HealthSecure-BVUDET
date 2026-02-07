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
  Bed, 
  Users, 
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
  Building2
} from 'lucide-react';

interface Bed {
  id: string;
  bedNumber: string;
  roomNumber: string;
  floor: string;
  ward: string;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  patientId?: string;
  patientName?: string;
  admissionDate?: string;
  expectedDischarge?: string;
  bedType: 'general' | 'icu' | 'emergency' | 'private' | 'isolation';
  equipment: string[];
  lastCleaned: string;
  nextCleaning: string;
  notes?: string;
}

const BedManagement: React.FC = () => {
  const [beds, setBeds] = useState<Bed[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [wardFilter, setWardFilter] = useState<string>('all');
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Mock data
  useEffect(() => {
    const mockBeds: Bed[] = [
      {
        id: '1',
        bedNumber: 'A101',
        roomNumber: '101',
        floor: '1',
        ward: 'General Medicine',
        status: 'occupied',
        patientId: 'P001',
        patientName: 'John Smith',
        admissionDate: '2024-01-15',
        expectedDischarge: '2024-01-25',
        bedType: 'general',
        equipment: ['Oxygen', 'Monitor', 'IV Stand'],
        lastCleaned: '2024-01-20',
        nextCleaning: '2024-01-22',
        notes: 'Patient requires isolation protocol'
      },
      {
        id: '2',
        bedNumber: 'A102',
        roomNumber: '102',
        floor: '1',
        ward: 'General Medicine',
        status: 'available',
        bedType: 'general',
        equipment: ['Oxygen', 'Monitor'],
        lastCleaned: '2024-01-21',
        nextCleaning: '2024-01-23'
      },
      {
        id: '3',
        bedNumber: 'ICU101',
        roomNumber: '201',
        floor: '2',
        ward: 'ICU',
        status: 'occupied',
        patientId: 'P002',
        patientName: 'Sarah Johnson',
        admissionDate: '2024-01-18',
        expectedDischarge: '2024-01-30',
        bedType: 'icu',
        equipment: ['Ventilator', 'ECG Monitor', 'IV Pump', 'Defibrillator'],
        lastCleaned: '2024-01-19',
        nextCleaning: '2024-01-21',
        notes: 'Critical care patient'
      },
      {
        id: '4',
        bedNumber: 'ER001',
        roomNumber: '301',
        floor: '3',
        ward: 'Emergency',
        status: 'reserved',
        bedType: 'emergency',
        equipment: ['Defibrillator', 'Monitor', 'Emergency Cart'],
        lastCleaned: '2024-01-20',
        nextCleaning: '2024-01-22'
      },
      {
        id: '5',
        bedNumber: 'P101',
        roomNumber: '401',
        floor: '4',
        ward: 'Private Ward',
        status: 'occupied',
        patientId: 'P003',
        patientName: 'Michael Brown',
        admissionDate: '2024-01-16',
        expectedDischarge: '2024-01-28',
        bedType: 'private',
        equipment: ['TV', 'WiFi', 'Private Bathroom', 'Monitor'],
        lastCleaned: '2024-01-20',
        nextCleaning: '2024-01-22'
      }
    ];

    setBeds(mockBeds);
    setLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'reserved': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="w-4 h-4" />;
      case 'occupied': return <Users className="w-4 h-4" />;
      case 'maintenance': return <AlertTriangle className="w-4 h-4" />;
      case 'reserved': return <Clock className="w-4 h-4" />;
      default: return <Bed className="w-4 h-4" />;
    }
  };

  const filteredBeds = beds.filter(bed => {
    const matchesSearch = bed.bedNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bed.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bed.ward.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || bed.status === statusFilter;
    const matchesWard = wardFilter === 'all' || bed.ward === wardFilter;
    return matchesSearch && matchesStatus && matchesWard;
  });

  const stats = {
    total: beds.length,
    available: beds.filter(b => b.status === 'available').length,
    occupied: beds.filter(b => b.status === 'occupied').length,
    maintenance: beds.filter(b => b.status === 'maintenance').length,
    reserved: beds.filter(b => b.status === 'reserved').length
  };

  const occupancyRate = ((stats.occupied / stats.total) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bed Management</h1>
          <p className="text-gray-600">Manage hospital bed allocation and availability</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add New Bed
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bed className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Beds</p>
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
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-green-600">{stats.available}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Occupied</p>
                <p className="text-2xl font-bold text-red-600">{stats.occupied}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
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
              <BarChart3 className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                <p className="text-2xl font-bold text-purple-600">{occupancyRate}%</p>
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
                  placeholder="Search beds, patients, or wards..."
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
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
              </SelectContent>
            </Select>
            <Select value={wardFilter} onValueChange={setWardFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by ward" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Wards</SelectItem>
                <SelectItem value="General Medicine">General Medicine</SelectItem>
                <SelectItem value="ICU">ICU</SelectItem>
                <SelectItem value="Emergency">Emergency</SelectItem>
                <SelectItem value="Private Ward">Private Ward</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Beds Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bed Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Bed Number</th>
                  <th className="text-left p-3 font-medium">Room/Ward</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Patient</th>
                  <th className="text-left p-3 font-medium">Bed Type</th>
                  <th className="text-left p-3 font-medium">Last Cleaned</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBeds.map((bed) => (
                  <tr key={bed.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-medium">{bed.bedNumber}</div>
                      <div className="text-sm text-gray-500">Room {bed.roomNumber}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{bed.ward}</div>
                      <div className="text-sm text-gray-500">Floor {bed.floor}</div>
                    </td>
                    <td className="p-3">
                      <Badge className={`${getStatusColor(bed.status)} flex items-center gap-1 w-fit`}>
                        {getStatusIcon(bed.status)}
                        {bed.status.charAt(0).toUpperCase() + bed.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="p-3">
                      {bed.patientName ? (
                        <div>
                          <div className="font-medium">{bed.patientName}</div>
                          <div className="text-sm text-gray-500">ID: {bed.patientId}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">No patient</span>
                      )}
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className="capitalize">
                        {bed.bedType}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">{bed.lastCleaned}</div>
                      <div className="text-xs text-gray-500">Next: {bed.nextCleaning}</div>
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedBed(bed);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedBed(bed);
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

      {/* Add Bed Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Bed</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bedNumber">Bed Number</Label>
              <Input id="bedNumber" placeholder="e.g., A101" />
            </div>
            <div>
              <Label htmlFor="roomNumber">Room Number</Label>
              <Input id="roomNumber" placeholder="e.g., 101" />
            </div>
            <div>
              <Label htmlFor="floor">Floor</Label>
              <Input id="floor" placeholder="e.g., 1" />
            </div>
            <div>
              <Label htmlFor="ward">Ward</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select ward" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Medicine</SelectItem>
                  <SelectItem value="icu">ICU</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="private">Private Ward</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="bedType">Bed Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select bed type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="icu">ICU</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="isolation">Isolation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label htmlFor="equipment">Equipment (comma separated)</Label>
              <Input id="equipment" placeholder="e.g., Oxygen, Monitor, IV Stand" />
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
              Add Bed
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Bed Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bed Details</DialogTitle>
          </DialogHeader>
          {selectedBed && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Bed Number</Label>
                  <p className="text-lg font-semibold">{selectedBed.bedNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Room Number</Label>
                  <p className="text-lg">{selectedBed.roomNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Ward</Label>
                  <p className="text-lg">{selectedBed.ward}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Floor</Label>
                  <p className="text-lg">{selectedBed.floor}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <Badge className={`${getStatusColor(selectedBed.status)}`}>
                    {selectedBed.status.charAt(0).toUpperCase() + selectedBed.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Bed Type</Label>
                  <Badge variant="outline" className="capitalize">
                    {selectedBed.bedType}
                  </Badge>
                </div>
              </div>
              
              {selectedBed.patientName && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Patient Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Patient Name</Label>
                      <p className="text-lg">{selectedBed.patientName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Patient ID</Label>
                      <p className="text-lg">{selectedBed.patientId}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Admission Date</Label>
                      <p className="text-lg">{selectedBed.admissionDate}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Expected Discharge</Label>
                      <p className="text-lg">{selectedBed.expectedDischarge}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Equipment</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedBed.equipment.map((item, index) => (
                    <Badge key={index} variant="secondary">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Maintenance</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Last Cleaned</Label>
                    <p className="text-lg">{selectedBed.lastCleaned}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Next Cleaning</Label>
                    <p className="text-lg">{selectedBed.nextCleaning}</p>
                  </div>
                </div>
              </div>

              {selectedBed.notes && (
                <div className="border-t pt-4">
                  <Label className="text-sm font-medium text-gray-600">Notes</Label>
                  <p className="text-lg">{selectedBed.notes}</p>
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

export default BedManagement; 