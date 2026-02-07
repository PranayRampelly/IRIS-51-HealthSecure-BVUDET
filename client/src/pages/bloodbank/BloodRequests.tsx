import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  BarChart3,
  Calendar,
  MapPin,
  User,
  Droplets,
  Activity
} from 'lucide-react';

interface BloodRequest {
  id: string;
  requestId: string;
  hospital: {
    name: string;
    city: string;
    state: string;
  };
  patient: {
    name: string;
    bloodType: string;
    age: number;
    gender: string;
  };
  bloodRequirements: {
    bloodType: string;
    componentType: string;
    quantity: number;
    specialRequirements: string[];
  };
  urgency: {
    level: 'routine' | 'urgent' | 'emergency' | 'critical';
    priority: number;
    requiredBy: string;
  };
  status: {
    current: 'pending' | 'approved' | 'processing' | 'ready' | 'dispatched' | 'delivered' | 'cancelled' | 'rejected';
    updatedAt: string;
  };
  requestDetails: {
    reason: string;
    clinicalIndication: string;
    doctor: {
      name: string;
      specialization: string;
    };
  };
  createdAt: string;
  inventory: {
    allocatedUnits: any[];
    totalAllocated: number;
  };
  delivery: {
    method: string;
    estimatedArrival?: string;
  };
}

const BloodRequests: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<BloodRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isAllocateDialogOpen, setIsAllocateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Mock data for demonstration
  useEffect(() => {
    const mockRequests: BloodRequest[] = [
      {
        id: '1',
        requestId: 'REQ-2024-001',
        hospital: {
          name: 'City General Hospital',
          city: 'Mumbai',
          state: 'Maharashtra'
        },
        patient: {
          name: 'Rajesh Kumar',
          bloodType: 'O+',
          age: 45,
          gender: 'Male'
        },
        bloodRequirements: {
          bloodType: 'O+',
          componentType: 'red_blood_cells',
          quantity: 4,
          specialRequirements: ['Cross-match required', 'Leukoreduced']
        },
        urgency: {
          level: 'emergency',
          priority: 1,
          requiredBy: '2024-01-25T10:00:00Z'
        },
        status: {
          current: 'pending',
          updatedAt: '2024-01-24T14:30:00Z'
        },
        requestDetails: {
          reason: 'Severe anemia due to gastrointestinal bleeding',
          clinicalIndication: 'Blood transfusion required immediately',
          doctor: {
            name: 'Dr. Priya Sharma',
            specialization: 'Hematology'
          }
        },
        createdAt: '2024-01-24T14:00:00Z',
        inventory: {
          allocatedUnits: [],
          totalAllocated: 0
        },
        delivery: {
          method: 'emergency_delivery'
        }
      },
      {
        id: '2',
        requestId: 'REQ-2024-002',
        hospital: {
          name: 'Metro Medical Center',
          city: 'Delhi',
          state: 'Delhi'
        },
        patient: {
          name: 'Sunita Patel',
          bloodType: 'A-',
          age: 32,
          gender: 'Female'
        },
        bloodRequirements: {
          bloodType: 'A-',
          componentType: 'whole_blood',
          quantity: 2,
          specialRequirements: ['Irradiated']
        },
        urgency: {
          level: 'urgent',
          priority: 2,
          requiredBy: '2024-01-26T16:00:00Z'
        },
        status: {
          current: 'approved',
          updatedAt: '2024-01-24T15:00:00Z'
        },
        requestDetails: {
          reason: 'Scheduled surgery - cardiac bypass',
          clinicalIndication: 'Pre-operative blood preparation',
          doctor: {
            name: 'Dr. Amit Singh',
            specialization: 'Cardiovascular Surgery'
          }
        },
        createdAt: '2024-01-24T13:00:00Z',
        inventory: {
          allocatedUnits: [],
          totalAllocated: 0
        },
        delivery: {
          method: 'pickup'
        }
      },
      {
        id: '3',
        requestId: 'REQ-2024-003',
        hospital: {
          name: 'Regional Health Institute',
          city: 'Bangalore',
          state: 'Karnataka'
        },
        patient: {
          name: 'Vikram Reddy',
          bloodType: 'B+',
          age: 28,
          gender: 'Male'
        },
        bloodRequirements: {
          bloodType: 'B+',
          componentType: 'platelets',
          quantity: 1,
          specialRequirements: ['ABO compatible']
        },
        urgency: {
          level: 'routine',
          priority: 3,
          requiredBy: '2024-01-28T12:00:00Z'
        },
        status: {
          current: 'processing',
          updatedAt: '2024-01-24T16:00:00Z'
        },
        requestDetails: {
          reason: 'Thrombocytopenia treatment',
          clinicalIndication: 'Platelet transfusion for low platelet count',
          doctor: {
            name: 'Dr. Meera Iyer',
            specialization: 'Internal Medicine'
          }
        },
        createdAt: '2024-01-24T12:00:00Z',
        inventory: {
          allocatedUnits: [
            { bloodUnitId: 'UNIT-001', bloodType: 'B+', componentType: 'platelets' }
          ],
          totalAllocated: 1
        },
        delivery: {
          method: 'delivery',
          estimatedArrival: '2024-01-25T10:00:00Z'
        }
      },
      {
        id: '4',
        requestId: 'REQ-2024-004',
        hospital: {
          name: 'Community Hospital',
          city: 'Chennai',
          state: 'Tamil Nadu'
        },
        patient: {
          name: 'Lakshmi Devi',
          bloodType: 'AB+',
          age: 55,
          gender: 'Female'
        },
        bloodRequirements: {
          bloodType: 'AB+',
          componentType: 'plasma',
          quantity: 3,
          specialRequirements: ['Fresh frozen plasma']
        },
        urgency: {
          level: 'critical',
          priority: 1,
          requiredBy: '2024-01-24T20:00:00Z'
        },
        status: {
          current: 'ready',
          updatedAt: '2024-01-24T17:00:00Z'
        },
        requestDetails: {
          reason: 'Severe liver disease with coagulopathy',
          clinicalIndication: 'Emergency plasma transfusion',
          doctor: {
            name: 'Dr. Karthik Venkat',
            specialization: 'Hepatology'
          }
        },
        createdAt: '2024-01-24T11:00:00Z',
        inventory: {
          allocatedUnits: [
            { bloodUnitId: 'UNIT-002', bloodType: 'AB+', componentType: 'plasma' },
            { bloodUnitId: 'UNIT-003', bloodType: 'AB+', componentType: 'plasma' },
            { bloodUnitId: 'UNIT-004', bloodType: 'AB+', componentType: 'plasma' }
          ],
          totalAllocated: 3
        },
        delivery: {
          method: 'emergency_delivery'
        }
      }
    ];

    setRequests(mockRequests);
    setFilteredRequests(mockRequests);
  }, []);

  // Filter requests based on search and filters
  useEffect(() => {
    let filtered = requests;

    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.patient.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status.current === statusFilter);
    }

    if (urgencyFilter !== 'all') {
      filtered = filtered.filter(request => request.urgency.level === urgencyFilter);
    }

    if (bloodTypeFilter !== 'all') {
      filtered = filtered.filter(request => request.bloodRequirements.bloodType === bloodTypeFilter);
    }

    setFilteredRequests(filtered);
  }, [requests, searchTerm, statusFilter, urgencyFilter, bloodTypeFilter]);

  // Utility functions
  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      ready: 'bg-green-100 text-green-800',
      dispatched: 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getUrgencyColor = (urgency: string) => {
    const colors = {
      routine: 'bg-green-100 text-green-800',
      urgent: 'bg-yellow-100 text-yellow-800',
      emergency: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[urgency as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'routine':
        return <Clock className="w-4 h-4" />;
      case 'urgent':
        return <AlertTriangle className="w-4 h-4" />;
      case 'emergency':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeUntilRequired = (requiredBy: string) => {
    const now = new Date();
    const required = new Date(requiredBy);
    const diffMs = required.getTime() - now.getTime();
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 0) return 'Overdue';
    if (diffHours < 24) return `${diffHours}h remaining`;
    const diffDays = Math.ceil(diffHours / 24);
    return `${diffDays}d remaining`;
  };

  // Handlers
  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Data refreshed successfully');
    }, 1000);
  };

  const handleViewRequest = (request: BloodRequest) => {
    setSelectedRequest(request);
    setIsViewDialogOpen(true);
  };

  const handleStatusUpdate = (request: BloodRequest) => {
    setSelectedRequest(request);
    setIsStatusDialogOpen(true);
  };

  const handleAllocateUnits = (request: BloodRequest) => {
    setSelectedRequest(request);
    setIsAllocateDialogOpen(true);
  };

  const handleDeleteRequest = async (requestId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setRequests(prev => prev.filter(req => req.id !== requestId));
      toast.success('Request deleted successfully');
    } catch (error) {
      toast.error('Failed to delete request');
    }
  };

  // Calculate statistics
  const stats = {
    total: requests.length,
    pending: requests.filter(req => req.status.current === 'pending').length,
    processing: requests.filter(req => req.status.current === 'processing').length,
    completed: requests.filter(req => req.status.current === 'delivered').length,
    today: requests.filter(req => {
      const today = new Date().toDateString();
      return new Date(req.createdAt).toDateString() === today;
    }).length,
    urgent: requests.filter(req => 
      ['urgent', 'emergency', 'critical'].includes(req.urgency.level)
    ).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blood Requests</h1>
          <p className="text-gray-600">Manage and track blood requests from hospitals</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
            className="bg-white border-health-blue-gray/20 hover:bg-health-light-gray"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-health-500 hover:bg-health-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Request
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <RefreshCw className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Processing</p>
                <p className="text-2xl font-bold text-gray-900">{stats.processing}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Today</p>
                <p className="text-2xl font-bold text-gray-900">{stats.today}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Urgent</p>
                <p className="text-2xl font-bold text-gray-900">{stats.urgent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by request ID, hospital, or patient..."
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="dispatched">Dispatched</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Urgency</SelectItem>
                <SelectItem value="routine">Routine</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            <Select value={bloodTypeFilter} onValueChange={setBloodTypeFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Blood Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="A+">A+</SelectItem>
                <SelectItem value="A-">A-</SelectItem>
                <SelectItem value="B+">B+</SelectItem>
                <SelectItem value="B-">B-</SelectItem>
                <SelectItem value="AB+">AB+</SelectItem>
                <SelectItem value="AB-">AB-</SelectItem>
                <SelectItem value="O+">O+</SelectItem>
                <SelectItem value="O-">O-</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Blood Requests</CardTitle>
          <CardDescription>
            {filteredRequests.length} of {requests.length} requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Hospital</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Blood Requirements</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-mono text-sm">
                      {request.requestId}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{request.hospital.name}</p>
                        <p className="text-sm text-gray-500">
                          {request.hospital.city}, {request.hospital.state}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{request.patient.name}</p>
                        <p className="text-sm text-gray-500">
                          {request.patient.age} years, {request.patient.gender}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {request.bloodRequirements.bloodType}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {request.bloodRequirements.componentType.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {request.bloodRequirements.quantity} units
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getUrgencyIcon(request.urgency.level)}
                        <Badge className={getUrgencyColor(request.urgency.level)}>
                          {request.urgency.level}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {getTimeUntilRequired(request.urgency.requiredBy)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(request.status.current)}>
                        {request.status.current}
                      </Badge>
                      {request.inventory.totalAllocated > 0 && (
                        <p className="text-sm text-gray-500 mt-1">
                          {request.inventory.totalAllocated} units allocated
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{formatDate(request.createdAt)}</p>
                        <p className="text-xs text-gray-500">
                          {getTimeUntilRequired(request.urgency.requiredBy)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewRequest(request)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        
                        {request.status.current === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusUpdate(request)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                        
                        {request.status.current === 'approved' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAllocateUnits(request)}
                          >
                            <Droplets className="w-4 h-4" />
                          </Button>
                        )}
                        
                        {['pending', 'cancelled', 'rejected'].includes(request.status.current) && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Request</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this blood request? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteRequest(request.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredRequests.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No requests found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Request Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>
              Complete information about the blood request
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Request ID</Label>
                  <p className="font-mono text-lg">{selectedRequest.requestId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <Badge className={getStatusColor(selectedRequest.status.current)}>
                    {selectedRequest.status.current}
                  </Badge>
                </div>
              </div>

              {/* Hospital Information */}
              <div>
                <Label className="text-sm font-medium text-gray-600">Hospital</Label>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium">{selectedRequest.hospital.name}</p>
                  <p className="text-gray-600">
                    {selectedRequest.hospital.city}, {selectedRequest.hospital.state}
                  </p>
                </div>
              </div>

              {/* Patient Information */}
              <div>
                <Label className="text-sm font-medium text-gray-600">Patient</Label>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium">{selectedRequest.patient.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Blood Type</p>
                      <p className="font-medium">{selectedRequest.patient.bloodType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Age</p>
                      <p className="font-medium">{selectedRequest.patient.age} years</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Gender</p>
                      <p className="font-medium">{selectedRequest.patient.gender}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Blood Requirements */}
              <div>
                <Label className="text-sm font-medium text-gray-600">Blood Requirements</Label>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Blood Type</p>
                      <Badge variant="outline">{selectedRequest.bloodRequirements.bloodType}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Component</p>
                      <Badge variant="outline">
                        {selectedRequest.bloodRequirements.componentType.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Quantity</p>
                      <p className="font-medium">{selectedRequest.bloodRequirements.quantity} units</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Special Requirements</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedRequest.bloodRequirements.specialRequirements.map((req, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {req}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Urgency and Timing */}
              <div>
                <Label className="text-sm font-medium text-gray-600">Urgency & Timing</Label>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Level</p>
                      <Badge className={getUrgencyColor(selectedRequest.urgency.level)}>
                        {selectedRequest.urgency.level}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Priority</p>
                      <p className="font-medium">{selectedRequest.urgency.priority}/5</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Required By</p>
                      <p className="font-medium">{formatDate(selectedRequest.urgency.requiredBy)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Time Remaining</p>
                      <p className="font-medium">{getTimeUntilRequired(selectedRequest.urgency.requiredBy)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clinical Details */}
              <div>
                <Label className="text-sm font-medium text-gray-600">Clinical Details</Label>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Reason</p>
                      <p className="font-medium">{selectedRequest.requestDetails.reason}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Clinical Indication</p>
                      <p className="font-medium">{selectedRequest.requestDetails.clinicalIndication}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Requesting Doctor</p>
                      <p className="font-medium">
                        {selectedRequest.requestDetails.doctor.name} - {selectedRequest.requestDetails.doctor.specialization}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Inventory Allocation */}
              {selectedRequest.inventory.totalAllocated > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Inventory Allocation</Label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">
                      {selectedRequest.inventory.totalAllocated} units allocated
                    </p>
                    <div className="mt-2 space-y-2">
                      {selectedRequest.inventory.allocatedUnits.map((unit, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Badge variant="outline">{unit.bloodUnitId}</Badge>
                          <span className="text-sm text-gray-600">
                            {unit.bloodType} - {unit.componentType.replace('_', ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Delivery Information */}
              <div>
                <Label className="text-sm font-medium text-gray-600">Delivery</Label>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Method</p>
                      <Badge variant="outline">
                        {selectedRequest.delivery.method.replace('_', ' ')}
                      </Badge>
                    </div>
                    {selectedRequest.delivery.estimatedArrival && (
                      <div>
                        <p className="text-sm text-gray-600">Estimated Arrival</p>
                        <p className="font-medium">{formatDate(selectedRequest.delivery.estimatedArrival)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div>
                <Label className="text-sm font-medium text-gray-600">Timestamps</Label>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Created</p>
                      <p className="font-medium">{formatDate(selectedRequest.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Last Updated</p>
                      <p className="font-medium">{formatDate(selectedRequest.status.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add New Request Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Blood Request</DialogTitle>
            <DialogDescription>
              Add a new blood request from a hospital
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-center text-gray-500 py-8">
              Form implementation coming soon...
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Request Status</DialogTitle>
            <DialogDescription>
              Change the status of this blood request
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-center text-gray-500 py-8">
              Status update form coming soon...
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Allocate Units Dialog */}
      <Dialog open={isAllocateDialogOpen} onOpenChange={setIsAllocateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Allocate Blood Units</DialogTitle>
            <DialogDescription>
              Assign available blood units to this request
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-center text-gray-500 py-8">
              Unit allocation form coming soon...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BloodRequests;
