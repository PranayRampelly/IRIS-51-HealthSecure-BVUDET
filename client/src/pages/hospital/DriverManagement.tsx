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
  Mail
} from 'lucide-react';

interface AmbulanceDriver {
  id: string;
  name: string;
  licenseNumber: string;
  phone: string;
  email: string;
  status: 'available' | 'on-call' | 'off-duty' | 'emergency' | 'training' | 'suspended';
  currentLocation: string;
  experience: string;
  rating: number;
  vehicleId: string;
  lastActive: string;
  shift: 'morning' | 'afternoon' | 'night' | 'flexible';
  certifications: string[];
  performance: {
    totalCalls: number;
    successfulCalls: number;
    averageResponseTime: number;
    patientSatisfaction: number;
    safetyScore: number;
  };
  schedule: {
    startTime: string;
    endTime: string;
    daysOff: string[];
  };
  emergencyContacts: {
    name: string;
    relationship: string;
    phone: string;
  }[];
}

const DriverManagement: React.FC = () => {
  const [drivers, setDrivers] = useState<AmbulanceDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [shiftFilter, setShiftFilter] = useState<string>('all');
  const [selectedDriver, setSelectedDriver] = useState<AmbulanceDriver | null>(null);
  const [isAddDriverDialogOpen, setIsAddDriverDialogOpen] = useState(false);
  const [isViewDriverDialogOpen, setIsViewDriverDialogOpen] = useState(false);
  const [isEditDriverDialogOpen, setIsEditDriverDialogOpen] = useState(false);

  useEffect(() => {
    const mockDrivers: AmbulanceDriver[] = [
      {
        id: '1',
        name: 'John Smith',
        licenseNumber: 'AMB-001',
        phone: '+1-555-0101',
        email: 'john.smith@hospital.com',
        status: 'available',
        currentLocation: 'Downtown Area',
        experience: '5 years',
        rating: 4.8,
        vehicleId: 'V001',
        lastActive: '2024-01-22 15:30',
        shift: 'morning',
        certifications: ['CPR', 'Advanced Life Support', 'Emergency Driving', 'First Aid'],
        performance: {
          totalCalls: 245,
          successfulCalls: 238,
          averageResponseTime: 8.2,
          patientSatisfaction: 4.7,
          safetyScore: 95
        },
        schedule: {
          startTime: '06:00',
          endTime: '18:00',
          daysOff: ['Saturday', 'Sunday']
        },
        emergencyContacts: [
          {
            name: 'Sarah Smith',
            relationship: 'Spouse',
            phone: '+1-555-0102'
          }
        ]
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        licenseNumber: 'AMB-002',
        phone: '+1-555-0103',
        email: 'sarah.johnson@hospital.com',
        status: 'on-call',
        currentLocation: 'North District',
        experience: '3 years',
        rating: 4.6,
        vehicleId: 'V002',
        lastActive: '2024-01-22 15:25',
        shift: 'afternoon',
        certifications: ['CPR', 'Basic Life Support', 'Emergency Driving'],
        performance: {
          totalCalls: 189,
          successfulCalls: 182,
          averageResponseTime: 9.1,
          patientSatisfaction: 4.5,
          safetyScore: 92
        },
        schedule: {
          startTime: '14:00',
          endTime: '02:00',
          daysOff: ['Monday', 'Tuesday']
        },
        emergencyContacts: [
          {
            name: 'Mike Johnson',
            relationship: 'Spouse',
            phone: '+1-555-0104'
          }
        ]
      },
      {
        id: '3',
        name: 'Mike Wilson',
        licenseNumber: 'AMB-003',
        phone: '+1-555-0105',
        email: 'mike.wilson@hospital.com',
        status: 'emergency',
        currentLocation: 'Emergency Scene',
        experience: '7 years',
        rating: 4.9,
        vehicleId: 'V003',
        lastActive: '2024-01-22 15:20',
        shift: 'night',
        certifications: ['CPR', 'Advanced Life Support', 'Critical Care', 'Emergency Driving'],
        performance: {
          totalCalls: 312,
          successfulCalls: 308,
          averageResponseTime: 7.8,
          patientSatisfaction: 4.8,
          safetyScore: 97
        },
        schedule: {
          startTime: '22:00',
          endTime: '10:00',
          daysOff: ['Wednesday', 'Thursday']
        },
        emergencyContacts: [
          {
            name: 'Lisa Wilson',
            relationship: 'Spouse',
            phone: '+1-555-0106'
          }
        ]
      }
    ];

    setDrivers(mockDrivers);
    setLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'on-call': return 'bg-yellow-100 text-yellow-800';
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'off-duty': return 'bg-gray-100 text-gray-800';
      case 'training': return 'bg-blue-100 text-blue-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getShiftColor = (shift: string) => {
    switch (shift) {
      case 'morning': return 'bg-blue-100 text-blue-800';
      case 'afternoon': return 'bg-green-100 text-green-800';
      case 'night': return 'bg-purple-100 text-purple-800';
      case 'flexible': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || driver.status === statusFilter;
    const matchesShift = shiftFilter === 'all' || driver.shift === shiftFilter;
    return matchesSearch && matchesStatus && matchesShift;
  });

  const stats = {
    totalDrivers: drivers.length,
    availableDrivers: drivers.filter(d => d.status === 'available').length,
    onCallDrivers: drivers.filter(d => d.status === 'on-call').length,
    emergencyDrivers: drivers.filter(d => d.status === 'emergency').length,
    averageRating: drivers.reduce((acc, d) => acc + d.rating, 0) / drivers.length,
    averageExperience: drivers.reduce((acc, d) => acc + parseInt(d.experience), 0) / drivers.length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Driver Management</h1>
          <p className="text-gray-600">Manage ambulance drivers and their performance</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button onClick={() => setIsAddDriverDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Driver
          </Button>
        </div>
      </div>

      {/* Statistics */}
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
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-green-600">{stats.availableDrivers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">On Call</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.onCallDrivers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Emergency</p>
                <p className="text-2xl font-bold text-red-600">{stats.emergencyDrivers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.averageRating.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Experience</p>
                <p className="text-2xl font-bold text-purple-600">{stats.averageExperience} years</p>
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
                  placeholder="Search drivers..."
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
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="on-call">On Call</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="off-duty">Off Duty</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <Select value={shiftFilter} onValueChange={setShiftFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Shift" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Shifts</SelectItem>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="afternoon">Afternoon</SelectItem>
                  <SelectItem value="night">Night</SelectItem>
                  <SelectItem value="flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

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
                  <th className="text-left p-3 font-medium">Shift</th>
                  <th className="text-left p-3 font-medium">Location</th>
                  <th className="text-left p-3 font-medium">Experience</th>
                  <th className="text-left p-3 font-medium">Rating</th>
                  <th className="text-left p-3 font-medium">Performance</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDrivers.map((driver) => (
                  <tr key={driver.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-medium">{driver.name}</div>
                      <div className="text-sm text-gray-500">{driver.email}</div>
                      <div className="text-xs text-gray-400">{driver.phone}</div>
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
                      <Badge className={`${getShiftColor(driver.shift)} capitalize`}>
                        {driver.shift}
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
                        <Star className="w-4 h-4 text-yellow-500 ml-1" />
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">
                        <div className="flex items-center space-x-1">
                          <Target className="w-3 h-3 text-green-600" />
                          <span>{driver.performance.successfulCalls}/{driver.performance.totalCalls}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {driver.performance.averageResponseTime}min avg
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedDriver(driver);
                            setIsViewDriverDialogOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedDriver(driver);
                            setIsEditDriverDialogOpen(true);
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

      {/* Add Driver Dialog */}
      <Dialog open={isAddDriverDialogOpen} onOpenChange={setIsAddDriverDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Driver</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="driverName">Full Name</Label>
              <Input id="driverName" placeholder="Enter full name" />
            </div>
            <div>
              <Label htmlFor="licenseNumber">License Number</Label>
              <Input id="licenseNumber" placeholder="Enter license number" />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" placeholder="Enter phone number" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" placeholder="Enter email address" />
            </div>
            <div>
              <Label htmlFor="shift">Shift</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select shift" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="afternoon">Afternoon</SelectItem>
                  <SelectItem value="night">Night</SelectItem>
                  <SelectItem value="flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="experience">Experience</Label>
              <Input id="experience" placeholder="e.g., 3 years" />
            </div>
            <div className="col-span-2">
              <Label htmlFor="certifications">Certifications</Label>
              <Textarea id="certifications" placeholder="Enter certifications (comma separated)" />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsAddDriverDialogOpen(false)}>
              Cancel
            </Button>
            <Button>
              Add Driver
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Driver Dialog */}
      <Dialog open={isViewDriverDialogOpen} onOpenChange={setIsViewDriverDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Driver Details</DialogTitle>
          </DialogHeader>
          {selectedDriver && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Name</Label>
                      <p className="text-lg">{selectedDriver.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">License Number</Label>
                      <p className="text-lg font-mono">{selectedDriver.licenseNumber}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Phone</Label>
                      <p className="text-lg">{selectedDriver.phone}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Email</Label>
                      <p className="text-lg">{selectedDriver.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Experience</Label>
                      <p className="text-lg">{selectedDriver.experience}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Rating</Label>
                      <div className="flex items-center">
                        <span className="text-lg font-medium">{selectedDriver.rating}</span>
                        <Star className="w-5 h-5 text-yellow-500 ml-2" />
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Current Status</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Status</Label>
                      <Badge className={`${getStatusColor(selectedDriver.status)} capitalize`}>
                        {selectedDriver.status}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Shift</Label>
                      <Badge className={`${getShiftColor(selectedDriver.shift)} capitalize`}>
                        {selectedDriver.shift}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Current Location</Label>
                      <p className="text-lg">{selectedDriver.currentLocation}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Assigned Vehicle</Label>
                      <p className="text-lg">{selectedDriver.vehicleId}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Last Active</Label>
                      <p className="text-lg">{selectedDriver.lastActive}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{selectedDriver.performance.totalCalls}</div>
                    <div className="text-sm text-gray-600">Total Calls</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{selectedDriver.performance.successfulCalls}</div>
                    <div className="text-sm text-gray-600">Successful Calls</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{selectedDriver.performance.averageResponseTime}min</div>
                    <div className="text-sm text-gray-600">Avg Response Time</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{selectedDriver.performance.patientSatisfaction}</div>
                    <div className="text-sm text-gray-600">Patient Satisfaction</div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Certifications</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedDriver.certifications.map((cert, index) => (
                    <Badge key={index} variant="secondary">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Schedule</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Shift Time</Label>
                    <p className="text-lg">{selectedDriver.schedule.startTime} - {selectedDriver.schedule.endTime}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Days Off</Label>
                    <p className="text-lg">{selectedDriver.schedule.daysOff.join(', ')}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setIsViewDriverDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DriverManagement; 