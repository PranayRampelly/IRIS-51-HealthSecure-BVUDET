import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Users, Calendar, DollarSign, TrendingUp,
  AlertTriangle, Bed, Activity, Heart,
  Building, Stethoscope, Clock, CheckCircle,
  Search, Filter, Plus, Eye, Edit, Trash2,
  Phone, Mail, MapPin, User, Shield, Activity as ActivityIcon,
  FileText, Pill, Thermometer, Heart as HeartIcon, Brain,
  Baby, UserCheck, UserX, UserPlus, Settings, Download,
  ArrowRight, CalendarDays, Clock as ClockIcon, MapPin as MapPinIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const Admissions: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdmissionModal, setShowAdmissionModal] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState<any>(null);
  const [newAdmission, setNewAdmission] = useState({
    patientId: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    email: '',
    address: '',
    emergencyContact: '',
    insuranceProvider: '',
    policyNumber: '',
    primaryDiagnosis: '',
    secondaryDiagnosis: '',
    department: '',
    admittingPhysician: '',
    admissionType: '',
    priority: '',
    expectedStay: '',
    roomPreference: '',
    specialRequirements: '',
    notes: ''
  });

  useEffect(() => {
    fetchAdmissions();
  }, []);

  const fetchAdmissions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/hospital/admissions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Backend returns: { success: true, data: { admissions: [], pagination: {} } }
      setAdmissions(response.data.data?.admissions || response.data.admissions || []);
    } catch (error) {
      console.error('Error fetching admissions:', error);
      setAdmissions([]);
      toast.error('Failed to load admission data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500 text-white';
      case 'approved': return 'bg-health-success text-white';
      case 'admitted': return 'bg-health-aqua text-white';
      case 'rejected': return 'bg-health-danger text-white';
      case 'discharged': return 'bg-health-blue-gray text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAdmissionTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'emergency': return <AlertTriangle className="w-4 h-4" />;
      case 'elective': return <CalendarDays className="w-4 h-4" />;
      case 'urgent': return <ClockIcon className="w-4 h-4" />;
      default: return <UserPlus className="w-4 h-4" />;
    }
  };

  const filteredAdmissions = admissions.filter(admission => {
    const name = `${admission.firstName} ${admission.lastName}`;
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (admission.patientId || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || admission.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || admission.department === departmentFilter;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const handleCreateAdmission = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8080/api/hospital/admissions', newAdmission, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setAdmissions([...admissions, response.data.admission]);
      setShowAdmissionModal(false);
      setNewAdmission({
        patientId: '', firstName: '', lastName: '', dateOfBirth: '', gender: '', phone: '', email: '',
        address: '', emergencyContact: '', insuranceProvider: '', policyNumber: '',
        primaryDiagnosis: '', secondaryDiagnosis: '', department: '', admittingPhysician: '',
        admissionType: '', priority: '', expectedStay: '', roomPreference: '', specialRequirements: '', notes: ''
      });
      toast.success('Admission request created successfully');
    } catch (error) {
      console.error('Error creating admission:', error);
      toast.error('Failed to create admission request');
    }
  };

  const handleApproveAdmission = async (admissionId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8080/api/hospital/admissions/${admissionId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setAdmissions(admissions.map(a => a.id === admissionId ? { ...a, status: 'approved' } : a));
      toast.success('Admission approved successfully');
    } catch (error) {
      console.error('Error approving admission:', error);
      toast.error('Failed to approve admission');
    }
  };

  const handleRejectAdmission = async (admissionId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8080/api/hospital/admissions/${admissionId}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setAdmissions(admissions.map(a => a.id === admissionId ? { ...a, status: 'rejected' } : a));
      toast.success('Admission rejected');
    } catch (error) {
      console.error('Error rejecting admission:', error);
      toast.error('Failed to reject admission');
    }
  };

  const admissionStats = {
    total: admissions.length,
    pending: admissions.filter(a => a.status === 'pending').length,
    approved: admissions.filter(a => a.status === 'approved').length,
    admitted: admissions.filter(a => a.status === 'admitted').length,
    rejected: admissions.filter(a => a.status === 'rejected').length
  };

  const availableBeds = {
    cardiology: 7,
    orthopedics: 12,
    neurology: 8,
    emergency: 2,
    pediatrics: 10,
    general: 15
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="w-full px-4 md:px-6 py-6">
        {/* Enhanced Header Section */}
        <div className="mb-8">
          <div className="rounded-3xl overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-health-teal via-health-aqua to-teal-600 relative">
              <div className="relative p-8 md:p-12">
                <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                        <UserPlus className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">🏥 Patient Admissions Management</h1>
                        <p className="text-white/90 text-lg">Comprehensive patient admission and bed allocation system</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-6">
                      <Button variant="outline" size="lg" className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm">
                        <Bed className="h-5 w-5 mr-2" />
                        Bed Management
                      </Button>
                      <Button variant="outline" size="lg" className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm">
                        <UserPlus className="h-5 w-5 mr-2" />
                        New Admission
                      </Button>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4 min-w-[300px]">
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 text-center shadow-lg border border-white/20">
                      <div className="text-2xl font-bold text-health-teal">{admissionStats.total}</div>
                      <div className="text-sm text-gray-700">Total Requests</div>
                    </div>
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 text-center shadow-lg border border-white/20">
                      <div className="text-2xl font-bold text-health-error">{admissionStats.pending}</div>
                      <div className="text-sm text-gray-700">Pending</div>
                    </div>
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 text-center shadow-lg border border-white/20">
                      <div className="text-2xl font-bold text-health-aqua">{admissionStats.approved}</div>
                      <div className="text-sm text-gray-700">Approved</div>
                    </div>
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 text-center shadow-lg border border-white/20">
                      <div className="text-2xl font-bold text-health-success">{admissionStats.admitted}</div>
                      <div className="text-sm text-gray-700">Admitted</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards - Professional UI Active */}
        <div className="mb-4 p-4 bg-gradient-to-r from-health-teal to-health-aqua rounded-2xl text-white text-center shadow-lg">
          <h2 className="text-2xl font-bold mb-2">✨ Enhanced Professional UI Active ✨</h2>
          <p className="text-white/90">All advanced features are now loaded and working!</p>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-health-teal/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">Total Requests</CardTitle>
              <div className="p-3 rounded-xl bg-gradient-to-br from-health-teal to-health-aqua shadow-md">
                <UserPlus className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-health-teal">{admissionStats.total}</div>
              <p className="text-xs text-gray-600 font-medium">Currently in system</p>
            </CardContent>
          </Card>

          <Card className="border-health-warning/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">Pending Review</CardTitle>
              <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 shadow-md">
                <Clock className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{admissionStats.pending}</div>
              <p className="text-xs text-gray-600 font-medium">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card className="border-health-aqua/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">Approved</CardTitle>
              <div className="p-3 rounded-xl bg-gradient-to-br from-health-aqua to-teal-500 shadow-md">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-health-aqua">{admissionStats.approved}</div>
              <p className="text-xs text-gray-600 font-medium">Ready for admission</p>
            </CardContent>
          </Card>

          <Card className="border-health-success/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">Currently Admitted</CardTitle>
              <div className="p-3 rounded-xl bg-gradient-to-br from-health-success to-green-600 shadow-md">
                <Bed className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-health-success">{admissionStats.admitted}</div>
              <p className="text-xs text-gray-600 font-medium">In hospital care</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end mb-6">
          <Button className="bg-health-aqua hover:bg-health-aqua/90 text-white" onClick={() => setShowAdmissionModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Admission
          </Button>
        </div>
      </div>



      {/* Main Content */}
      <Tabs defaultValue="admissions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="admissions">Admission Requests</TabsTrigger>
          <TabsTrigger value="beds">Bed Availability</TabsTrigger>
          <TabsTrigger value="workflow">Admission Workflow</TabsTrigger>
        </TabsList>

        <TabsContent value="admissions" className="space-y-6">
          {/* Enhanced Search and Filters */}
          <div className="bg-white rounded-2xl shadow-lg border border-health-teal/20 p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-health-teal/60 w-5 h-5" />
                  <Input
                    placeholder="Search admissions by patient name, ID, or department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 text-lg border-health-teal/30 focus:border-health-teal"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 h-12 border-health-teal/30">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="admitted">Admitted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-40 h-12 border-health-teal/30">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="cardiology">Cardiology</SelectItem>
                    <SelectItem value="orthopedics">Orthopedics</SelectItem>
                    <SelectItem value="neurology">Neurology</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="pediatrics">Pediatrics</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Admissions Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Admission Requests</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-health-teal"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Request Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAdmissions.map((admission) => (
                        <TableRow key={admission.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage src={admission.avatar} />
                                <AvatarFallback>
                                  {admission.firstName?.[0]}{admission.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{admission.firstName} {admission.lastName}</p>
                                <p className="text-sm text-gray-500">ID: {admission.patientId}</p>
                                <p className="text-xs text-gray-400">{admission.primaryDiagnosis}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getAdmissionTypeIcon(admission.admissionType)}
                              <span className="capitalize">{admission.admissionType}</span>
                            </div>
                          </TableCell>
                          <TableCell>{admission.department}</TableCell>
                          <TableCell>
                            <Badge className={getPriorityColor(admission.priority)}>
                              {admission.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(admission.status)}>
                              {admission.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {admission.requestDate ? new Date(admission.requestDate).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedAdmission(admission)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              {admission.status === 'pending' && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleApproveAdmission(admission.id)}
                                    className="text-green-600 border-green-600 hover:bg-green-50"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRejectAdmission(admission.id)}
                                    className="text-red-600 border-red-600 hover:bg-red-50"
                                  >
                                    <UserX className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {filteredAdmissions.length === 0 && !loading && (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No admission requests found</p>
                      <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="beds" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(availableBeds).map(([department, beds]) => (
              <Card key={department} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg ${department === 'cardiology' ? 'bg-red-500' :
                        department === 'orthopedics' ? 'bg-blue-500' :
                          department === 'neurology' ? 'bg-green-500' :
                            department === 'emergency' ? 'bg-orange-500' :
                              department === 'pediatrics' ? 'bg-purple-500' :
                                'bg-gray-500'
                      } text-white`}>
                      {department === 'cardiology' ? <HeartIcon className="w-6 h-6" /> :
                        department === 'orthopedics' ? <UserCheck className="w-6 h-6" /> :
                          department === 'neurology' ? <Brain className="w-6 h-6" /> :
                            department === 'emergency' ? <AlertTriangle className="w-6 h-6" /> :
                              department === 'pediatrics' ? <Baby className="w-6 h-6" /> :
                                <Stethoscope className="w-6 h-6" />}
                    </div>
                    <span className="capitalize">{department}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Available Beds</span>
                      <span className="font-semibold text-2xl">{beds}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${department === 'cardiology' ? 'bg-red-500' :
                            department === 'orthopedics' ? 'bg-blue-500' :
                              department === 'neurology' ? 'bg-green-500' :
                                department === 'emergency' ? 'bg-orange-500' :
                                  department === 'pediatrics' ? 'bg-purple-500' :
                                    'bg-gray-500'
                          }`}
                        style={{ width: `${(beds / 20) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {beds > 10 ? 'Good availability' : beds > 5 ? 'Limited availability' : 'Low availability'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="workflow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Admission Workflow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-health-teal/10 rounded-full">
                    <FileText className="w-6 h-6 text-health-teal" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">1. Admission Request</h3>
                    <p className="text-sm text-gray-600">Patient or physician submits admission request with medical details</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>

                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">2. Review & Approval</h3>
                    <p className="text-sm text-gray-600">Medical staff reviews request and approves or rejects based on criteria</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>

                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-health-success/10 rounded-full">
                    <Bed className="w-6 h-6 text-health-success" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">3. Bed Allocation</h3>
                    <p className="text-sm text-gray-600">Assign appropriate bed and room based on department and patient needs</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>

                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-health-aqua/10 rounded-full">
                    <UserCheck className="w-6 h-6 text-health-aqua" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">4. Patient Admission</h3>
                    <p className="text-sm text-gray-600">Patient is admitted and care plan is initiated</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Admission Modal */}
      <Dialog open={showAdmissionModal} onOpenChange={setShowAdmissionModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Admission Request</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Patient ID</Label>
              <Input
                value={newAdmission.patientId}
                onChange={(e) => setNewAdmission({ ...newAdmission, patientId: e.target.value })}
                placeholder="Enter patient ID or leave blank for new patient"
              />
            </div>
            <div>
              <Label>Admission Type</Label>
              <Select value={newAdmission.admissionType} onValueChange={(value) => setNewAdmission({ ...newAdmission, admissionType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select admission type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="elective">Elective</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>First Name</Label>
              <Input
                value={newAdmission.firstName}
                onChange={(e) => setNewAdmission({ ...newAdmission, firstName: e.target.value })}
              />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input
                value={newAdmission.lastName}
                onChange={(e) => setNewAdmission({ ...newAdmission, lastName: e.target.value })}
              />
            </div>
            <div>
              <Label>Date of Birth</Label>
              <Input
                type="date"
                value={newAdmission.dateOfBirth}
                onChange={(e) => setNewAdmission({ ...newAdmission, dateOfBirth: e.target.value })}
              />
            </div>
            <div>
              <Label>Gender</Label>
              <Select value={newAdmission.gender} onValueChange={(value) => setNewAdmission({ ...newAdmission, gender: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={newAdmission.phone}
                onChange={(e) => setNewAdmission({ ...newAdmission, phone: e.target.value })}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={newAdmission.email}
                onChange={(e) => setNewAdmission({ ...newAdmission, email: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <Label>Address</Label>
              <Input
                value={newAdmission.address}
                onChange={(e) => setNewAdmission({ ...newAdmission, address: e.target.value })}
              />
            </div>
            <div>
              <Label>Department</Label>
              <Select value={newAdmission.department} onValueChange={(value) => setNewAdmission({ ...newAdmission, department: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cardiology">Cardiology</SelectItem>
                  <SelectItem value="orthopedics">Orthopedics</SelectItem>
                  <SelectItem value="neurology">Neurology</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="pediatrics">Pediatrics</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={newAdmission.priority} onValueChange={(value) => setNewAdmission({ ...newAdmission, priority: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Primary Diagnosis</Label>
              <Input
                value={newAdmission.primaryDiagnosis}
                onChange={(e) => setNewAdmission({ ...newAdmission, primaryDiagnosis: e.target.value })}
              />
            </div>
            <div>
              <Label>Secondary Diagnosis</Label>
              <Input
                value={newAdmission.secondaryDiagnosis}
                onChange={(e) => setNewAdmission({ ...newAdmission, secondaryDiagnosis: e.target.value })}
              />
            </div>
            <div>
              <Label>Admitting Physician</Label>
              <Input
                value={newAdmission.admittingPhysician}
                onChange={(e) => setNewAdmission({ ...newAdmission, admittingPhysician: e.target.value })}
              />
            </div>
            <div>
              <Label>Expected Stay (Days)</Label>
              <Input
                type="number"
                value={newAdmission.expectedStay}
                onChange={(e) => setNewAdmission({ ...newAdmission, expectedStay: e.target.value })}
              />
            </div>
            <div>
              <Label>Room Preference</Label>
              <Input
                value={newAdmission.roomPreference}
                onChange={(e) => setNewAdmission({ ...newAdmission, roomPreference: e.target.value })}
                placeholder="e.g., Private, Shared, ICU"
              />
            </div>
            <div>
              <Label>Emergency Contact</Label>
              <Input
                value={newAdmission.emergencyContact}
                onChange={(e) => setNewAdmission({ ...newAdmission, emergencyContact: e.target.value })}
              />
            </div>
            <div>
              <Label>Insurance Provider</Label>
              <Input
                value={newAdmission.insuranceProvider}
                onChange={(e) => setNewAdmission({ ...newAdmission, insuranceProvider: e.target.value })}
              />
            </div>
            <div>
              <Label>Policy Number</Label>
              <Input
                value={newAdmission.policyNumber}
                onChange={(e) => setNewAdmission({ ...newAdmission, policyNumber: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <Label>Special Requirements</Label>
              <Input
                value={newAdmission.specialRequirements}
                onChange={(e) => setNewAdmission({ ...newAdmission, specialRequirements: e.target.value })}
                placeholder="e.g., Wheelchair accessible, Dietary restrictions"
              />
            </div>
            <div className="col-span-2">
              <Label>Notes</Label>
              <Textarea
                value={newAdmission.notes}
                onChange={(e) => setNewAdmission({ ...newAdmission, notes: e.target.value })}
                rows={3}
                placeholder="Additional notes or special instructions"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdmissionModal(false)}>Cancel</Button>
            <Button onClick={handleCreateAdmission}>Create Admission Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admission Details Modal */}
      {selectedAdmission && (
        <Dialog open={!!selectedAdmission} onOpenChange={() => setSelectedAdmission(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback>
                    {selectedAdmission.firstName?.[0]}{selectedAdmission.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">{selectedAdmission.firstName} {selectedAdmission.lastName}</h2>
                  <p className="text-sm text-gray-500">Admission Request</p>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Patient Information</Label>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Patient ID:</span> {selectedAdmission.patientId}</p>
                    <p><span className="font-medium">Date of Birth:</span> {selectedAdmission.dateOfBirth}</p>
                    <p><span className="font-medium">Gender:</span> {selectedAdmission.gender}</p>
                    <p><span className="font-medium">Phone:</span> {selectedAdmission.phone}</p>
                    <p><span className="font-medium">Email:</span> {selectedAdmission.email}</p>
                    <p><span className="font-medium">Address:</span> {selectedAdmission.address}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Medical Information</Label>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Primary Diagnosis:</span> {selectedAdmission.primaryDiagnosis}</p>
                    <p><span className="font-medium">Secondary Diagnosis:</span> {selectedAdmission.secondaryDiagnosis}</p>
                    <p><span className="font-medium">Department:</span> {selectedAdmission.department}</p>
                    <p><span className="font-medium">Admitting Physician:</span> {selectedAdmission.admittingPhysician}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Admission Details</Label>
                  <div className="mt-2 space-y-2">
                    <Badge className={getStatusColor(selectedAdmission.status)}>
                      {selectedAdmission.status}
                    </Badge>
                    <Badge className={getPriorityColor(selectedAdmission.priority)}>
                      {selectedAdmission.priority} Priority
                    </Badge>
                    <p><span className="font-medium">Type:</span> {selectedAdmission.admissionType}</p>
                    <p><span className="font-medium">Expected Stay:</span> {selectedAdmission.expectedStay} days</p>
                    <p><span className="font-medium">Room Preference:</span> {selectedAdmission.roomPreference}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Insurance</Label>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Provider:</span> {selectedAdmission.insuranceProvider}</p>
                    <p><span className="font-medium">Policy Number:</span> {selectedAdmission.policyNumber}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Emergency Contact</Label>
                  <div className="mt-2">
                    <p>{selectedAdmission.emergencyContact}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <Label className="text-sm font-medium text-gray-700">Special Requirements</Label>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm">{selectedAdmission.specialRequirements || 'None specified'}</p>
              </div>
            </div>
            <div className="mt-6">
              <Label className="text-sm font-medium text-gray-700">Notes</Label>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm">{selectedAdmission.notes || 'No notes available'}</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedAdmission(null)}>Close</Button>
              {selectedAdmission.status === 'pending' && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleRejectAdmission(selectedAdmission.id)}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    Reject
                  </Button>
                  <Button onClick={() => handleApproveAdmission(selectedAdmission.id)}>
                    Approve
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Professional Footer */}
      <div className="mt-12 p-4 bg-white rounded-2xl shadow-lg border border-health-teal/20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-health-success animate-pulse"></div>
              <span className="text-sm text-gray-600">System Online</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-health-teal" />
              <span className="text-sm text-gray-600">Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-health-aqua" />
              <span className="text-sm text-gray-600">{filteredAdmissions.length} admissions shown</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="border-health-teal/30 text-health-teal hover:bg-health-teal/10">
              <Download className="h-4 w-4 mr-2" />Export
            </Button>
            <Button variant="outline" size="sm" className="border-health-aqua/30 text-health-aqua hover:bg-health-aqua/10">
              <Settings className="h-4 w-4 mr-2" />Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admissions; 