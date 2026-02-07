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
  Bed,
  Wifi,
  Tv,
  Bath,
  AirVent,
  Thermometer
} from 'lucide-react';

interface Room {
  id: string;
  roomNumber: string;
  floor: string;
  ward: string;
  roomType: 'single' | 'double' | 'icu' | 'emergency' | 'private' | 'isolation';
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning' | 'reserved';
  capacity: number;
  occupiedBeds: number;
  temperature: string;
  humidity: string;
  lastCleaned: string;
  nextCleaning: string;
  amenities: string[];
  equipment: string[];
  notes?: string;
  patientIds?: string[];
  patientNames?: string[];
}

const RoomManagement: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [wardFilter, setWardFilter] = useState<string>('all');
  const [roomTypeFilter, setRoomTypeFilter] = useState<string>('all');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Fetch rooms from API
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        // const response = await api.get('/hospital/rooms');
        // setRooms(response.data);
        setRooms([]);
      } catch (error) {
        console.error('Error fetching rooms:', error);
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'cleaning': return 'bg-blue-100 text-blue-800';
      case 'reserved': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="w-4 h-4" />;
      case 'occupied': return <Users className="w-4 h-4" />;
      case 'maintenance': return <AlertTriangle className="w-4 h-4" />;
      case 'cleaning': return <Clock className="w-4 h-4" />;
      case 'reserved': return <Clock className="w-4 h-4" />;
      default: return <Building2 className="w-4 h-4" />;
    }
  };

  const getRoomTypeIcon = (roomType: string) => {
    switch (roomType) {
      case 'single': return <Bed className="w-4 h-4" />;
      case 'double': return <Users className="w-4 h-4" />;
      case 'icu': return <Activity className="w-4 h-4" />;
      case 'emergency': return <AlertTriangle className="w-4 h-4" />;
      case 'private': return <Building2 className="w-4 h-4" />;
      case 'isolation': return <AlertTriangle className="w-4 h-4" />;
      default: return <Building2 className="w-4 h-4" />;
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.ward.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.patientNames?.some(name => name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || room.status === statusFilter;
    const matchesWard = wardFilter === 'all' || room.ward === wardFilter;
    const matchesRoomType = roomTypeFilter === 'all' || room.roomType === roomTypeFilter;
    return matchesSearch && matchesStatus && matchesWard && matchesRoomType;
  });

  const stats = {
    total: rooms.length,
    available: rooms.filter(r => r.status === 'available').length,
    occupied: rooms.filter(r => r.status === 'occupied').length,
    maintenance: rooms.filter(r => r.status === 'maintenance').length,
    cleaning: rooms.filter(r => r.status === 'cleaning').length,
    reserved: rooms.filter(r => r.status === 'reserved').length
  };

  const occupancyRate = ((stats.occupied / stats.total) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Room Management</h1>
          <p className="text-gray-600">Manage hospital room allocation and facilities</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add New Room
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Rooms</p>
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
              <Clock className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Cleaning</p>
                <p className="text-2xl font-bold text-blue-600">{stats.cleaning}</p>
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
                  placeholder="Search rooms, patients, or wards..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="cleaning">Cleaning</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
              </SelectContent>
            </Select>
            <Select value={wardFilter} onValueChange={setWardFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Ward" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Wards</SelectItem>
                <SelectItem value="General Medicine">General Medicine</SelectItem>
                <SelectItem value="ICU">ICU</SelectItem>
                <SelectItem value="Emergency">Emergency</SelectItem>
                <SelectItem value="Private Ward">Private Ward</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roomTypeFilter} onValueChange={setRoomTypeFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Room Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="double">Double</SelectItem>
                <SelectItem value="icu">ICU</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="isolation">Isolation</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Rooms Table */}
      <Card>
        <CardHeader>
          <CardTitle>Room Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Room Number</th>
                  <th className="text-left p-3 font-medium">Ward/Floor</th>
                  <th className="text-left p-3 font-medium">Type</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Capacity</th>
                  <th className="text-left p-3 font-medium">Patients</th>
                  <th className="text-left p-3 font-medium">Environment</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRooms.map((room) => (
                  <tr key={room.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-medium">{room.roomNumber}</div>
                      <div className="text-sm text-gray-500">Floor {room.floor}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{room.ward}</div>
                      <div className="text-sm text-gray-500">Floor {room.floor}</div>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className="capitalize flex items-center gap-1 w-fit">
                        {getRoomTypeIcon(room.roomType)}
                        {room.roomType}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge className={`${getStatusColor(room.status)} flex items-center gap-1 w-fit`}>
                        {getStatusIcon(room.status)}
                        {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">
                        {room.occupiedBeds}/{room.capacity} beds
                      </div>
                      <div className="text-xs text-gray-500">
                        {((room.occupiedBeds / room.capacity) * 100).toFixed(0)}% full
                      </div>
                    </td>
                    <td className="p-3">
                      {room.patientNames && room.patientNames.length > 0 ? (
                        <div>
                          {room.patientNames.map((name, index) => (
                            <div key={index} className="text-sm">
                              {name}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">No patients</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="text-sm">{room.temperature}</div>
                      <div className="text-xs text-gray-500">{room.humidity}</div>
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRoom(room);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRoom(room);
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

      {/* Add Room Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Room</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="roomType">Room Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select room type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="double">Double</SelectItem>
                  <SelectItem value="icu">ICU</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="isolation">Isolation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="capacity">Capacity</Label>
              <Input id="capacity" type="number" placeholder="e.g., 2" />
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
                  <SelectItem value="cleaning">Cleaning</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label htmlFor="amenities">Amenities (comma separated)</Label>
              <Input id="amenities" placeholder="e.g., WiFi, TV, Private Bathroom, AC" />
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
              Add Room
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Room Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Room Details</DialogTitle>
          </DialogHeader>
          {selectedRoom && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Room Number</Label>
                  <p className="text-lg font-semibold">{selectedRoom.roomNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Floor</Label>
                  <p className="text-lg">{selectedRoom.floor}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Ward</Label>
                  <p className="text-lg">{selectedRoom.ward}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Room Type</Label>
                  <Badge variant="outline" className="capitalize">
                    {selectedRoom.roomType}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <Badge className={`${getStatusColor(selectedRoom.status)}`}>
                    {selectedRoom.status.charAt(0).toUpperCase() + selectedRoom.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Capacity</Label>
                  <p className="text-lg">{selectedRoom.occupiedBeds}/{selectedRoom.capacity} beds</p>
                </div>
              </div>
              
              {selectedRoom.patientNames && selectedRoom.patientNames.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Patients</h4>
                  <div className="space-y-2">
                    {selectedRoom.patientNames.map((name, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="font-medium">{name}</span>
                        <span className="text-sm text-gray-500">ID: {selectedRoom.patientIds?.[index]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Environment</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Temperature</Label>
                    <p className="text-lg">{selectedRoom.temperature}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Humidity</Label>
                    <p className="text-lg">{selectedRoom.humidity}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedRoom.amenities.map((amenity, index) => (
                    <Badge key={index} variant="secondary">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Equipment</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedRoom.equipment.map((item, index) => (
                    <Badge key={index} variant="outline">
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
                    <p className="text-lg">{selectedRoom.lastCleaned}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Next Cleaning</Label>
                    <p className="text-lg">{selectedRoom.nextCleaning}</p>
                  </div>
                </div>
              </div>

              {selectedRoom.notes && (
                <div className="border-t pt-4">
                  <Label className="text-sm font-medium text-gray-600">Notes</Label>
                  <p className="text-lg">{selectedRoom.notes}</p>
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

export default RoomManagement; 