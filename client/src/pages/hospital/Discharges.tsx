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
  ArrowRight, CalendarDays, Clock as ClockIcon, MapPin as MapPinIcon,
  Home, Car, UserCheck as UserCheckIcon, FileCheck, ClipboardList
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import hospitalCareService, { HospitalDischarge } from '@/services/hospitalCareService';

const Discharges: React.FC = () => {
  const navigate = useNavigate();
  const surfaceCard = "bg-white/80 border border-white/60 shadow-sm backdrop-blur";
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [discharges, setDischarges] = useState<HospitalDischarge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDischargeModal, setShowDischargeModal] = useState(false);
  const [selectedDischarge, setSelectedDischarge] = useState<HospitalDischarge | null>(null);
  const [newDischarge, setNewDischarge] = useState({
    patientId: '',
    patientName: '',
    admissionDate: '',
    dischargeDate: '',
    department: '',
    primaryDiagnosis: '',
    dischargeDiagnosis: '',
    dischargeType: '',
    dischargeDestination: '',
    dischargeInstructions: '',
    medications: '',
    followUpAppointment: '',
    followUpPhysician: '',
    homeCareNeeded: false,
    homeCareDetails: '',
    transportationNeeded: false,
    transportationDetails: '',
    dischargeSummary: '',
    notes: ''
  });

  useEffect(() => {
    fetchDischarges();
  }, []);

  const fetchDischarges = async () => {
    try {
      setLoading(true);
      const response = await hospitalCareService.getDischarges();
      setDischarges(response.discharges || []);
    } catch (error) {
      console.error('Error fetching discharges:', error);
      setDischarges([]);
      toast.error('Failed to load discharge data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500 text-white';
      case 'approved': return 'bg-health-success text-white';
      case 'discharged': return 'bg-health-aqua text-white';
      case 'cancelled': return 'bg-health-danger text-white';
      case 'completed': return 'bg-health-blue-gray text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getDischargeTypeColor = (type: string) => {
    switch (type) {
      case 'regular': return 'bg-green-100 text-green-800';
      case 'early': return 'bg-blue-100 text-blue-800';
      case 'against_advice': return 'bg-red-100 text-red-800';
      case 'transfer': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDestinationIcon = (destination: string) => {
    switch (destination?.toLowerCase()) {
      case 'home': return <Home className="w-4 h-4" />;
      case 'rehabilitation': return <UserCheckIcon className="w-4 h-4" />;
      case 'nursing_home': return <Building className="w-4 h-4" />;
      case 'another_hospital': return <Stethoscope className="w-4 h-4" />;
      default: return <MapPinIcon className="w-4 h-4" />;
    }
  };

  const filteredDischarges = discharges.filter(discharge => {
    const name = discharge.patientName;
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (discharge.patientId || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || discharge.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || discharge.department === departmentFilter;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const handleCreateDischarge = async () => {
    try {
      // Validate required fields on frontend
      if (!newDischarge.patientId || !newDischarge.patientName || !newDischarge.department || !newDischarge.primaryDiagnosis) {
        toast.error('Please fill in all required fields: Patient ID, Patient Name, Department, and Primary Diagnosis');
        return;
      }

      const response = await hospitalCareService.createDischargePlan(newDischarge);
      setDischarges([response.discharge, ...discharges]);
      setShowDischargeModal(false);
      setNewDischarge({
        patientId: '', patientName: '', admissionDate: '', dischargeDate: '', department: '',
        primaryDiagnosis: '', dischargeDiagnosis: '', dischargeType: '', dischargeDestination: '',
        dischargeInstructions: '', medications: '', followUpAppointment: '', followUpPhysician: '',
        homeCareNeeded: false, homeCareDetails: '', transportationNeeded: false, transportationDetails: '',
        dischargeSummary: '', notes: ''
      });
      toast.success('Discharge plan created successfully');
    } catch (error: any) {
      console.error('Error creating discharge:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create discharge plan';
      const missingFields = error?.response?.data?.missingFields;
      if (missingFields && missingFields.length > 0) {
        toast.error(`Missing required fields: ${missingFields.join(', ')}`);
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleApproveDischarge = async (dischargeId: string) => {
    try {
      const response = await hospitalCareService.approveDischarge(dischargeId);
      setDischarges(discharges.map(d => d.id === dischargeId ? response.discharge : d));
      toast.success('Discharge approved successfully');
    } catch (error) {
      console.error('Error approving discharge:', error);
      toast.error('Failed to approve discharge');
    }
  };

  const handleCompleteDischarge = async (dischargeId: string) => {
    try {
      const response = await hospitalCareService.completeDischarge(dischargeId);
      setDischarges(discharges.map(d => d.id === dischargeId ? response.discharge : d));
      toast.success('Discharge completed successfully');
    } catch (error) {
      console.error('Error completing discharge:', error);
      toast.error('Failed to complete discharge');
    }
  };

  const dischargeStats = {
    total: discharges.length,
    pending: discharges.filter(d => d.status === 'pending').length,
    approved: discharges.filter(d => d.status === 'approved').length,
    discharged: discharges.filter(d => d.status === 'discharged').length,
    completed: discharges.filter(d => d.status === 'completed').length
  };

  const todayDischarges = discharges.filter(d => {
    const dischargeDate = new Date(d.dischargeDate);
    const today = new Date();
    return dischargeDate.toDateString() === today.toDateString();
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-health-light-gray via-white to-health-light-gray/40">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
            <p className="text-xs font-semibold tracking-[0.3em] text-health-aqua/70 uppercase mb-2">Continuity Of Care</p>
          <h1 className="text-3xl font-montserrat font-bold text-health-teal">Patient Discharges</h1>
          <p className="text-health-charcoal mt-2">Manage patient discharges and discharge planning</p>
        </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="border-health-teal/30 text-health-teal hover:bg-health-teal/10" onClick={() => navigate('/hospital/patient-care')}>
            <Bed className="w-4 h-4 mr-2" />
            Patient Care
          </Button>
            <Button className="bg-health-aqua hover:bg-health-aqua/90 text-white shadow-lg shadow-health-aqua/30" onClick={() => setShowDischargeModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
              New Discharge Plan
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className={surfaceCard}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
                <div className="p-2 bg-health-teal/15 rounded-xl">
                <FileText className="w-6 h-6 text-health-teal" />
              </div>
              <div>
                  <p className="text-sm text-health-charcoal/70">Total Discharges</p>
                <p className="text-2xl font-bold text-health-teal">{dischargeStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

          <Card className={surfaceCard}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-xl">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                  <p className="text-sm text-health-charcoal/70">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{dischargeStats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

          <Card className={surfaceCard}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
                <div className="p-2 bg-health-success/15 rounded-xl">
                <CheckCircle className="w-6 h-6 text-health-success" />
              </div>
              <div>
                  <p className="text-sm text-health-charcoal/70">Approved</p>
                <p className="text-2xl font-bold text-health-success">{dischargeStats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>

          <Card className={surfaceCard}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
                <div className="p-2 bg-health-aqua/15 rounded-xl">
                <Home className="w-6 h-6 text-health-aqua" />
              </div>
              <div>
                  <p className="text-sm text-health-charcoal/70">Discharged</p>
                <p className="text-2xl font-bold text-health-aqua">{dischargeStats.discharged}</p>
              </div>
            </div>
          </CardContent>
        </Card>

          <Card className={surfaceCard}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
                <div className="p-2 bg-health-blue-gray/15 rounded-xl">
                <FileCheck className="w-6 h-6 text-health-blue-gray" />
              </div>
              <div>
                  <p className="text-sm text-health-charcoal/70">Completed</p>
                <p className="text-2xl font-bold text-health-blue-gray">{dischargeStats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="discharges" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 border border-white/60 shadow-sm backdrop-blur rounded-2xl">
          <TabsTrigger value="discharges">Discharge Plans</TabsTrigger>
          <TabsTrigger value="today">Today's Discharges</TabsTrigger>
          <TabsTrigger value="workflow">Discharge Workflow</TabsTrigger>
        </TabsList>

        <TabsContent value="discharges" className="space-y-6">
          {/* Filters */}
          <Card className={surfaceCard}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search discharges by patient name or ID..."
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
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="discharged">Discharged</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by department" />
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
            </CardContent>
          </Card>

          {/* Discharges Table */}
          <Card className={surfaceCard}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Discharge Plans</span>
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
                        <TableHead>Department</TableHead>
                        <TableHead>Discharge Type</TableHead>
                        <TableHead>Destination</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Discharge Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDischarges.map((discharge) => (
                        <TableRow key={discharge.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage src={discharge.avatar} />
                                <AvatarFallback>
                                  {discharge.patientName?.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{discharge.patientName}</p>
                                <p className="text-sm text-gray-500">ID: {discharge.patientId}</p>
                                <p className="text-xs text-gray-400">Admitted: {new Date(discharge.admissionDate).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{discharge.department}</TableCell>
                          <TableCell>
                            <Badge className={getDischargeTypeColor(discharge.dischargeType)}>
                              {discharge.dischargeType?.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getDestinationIcon(discharge.dischargeDestination)}
                              <span className="capitalize">{discharge.dischargeDestination?.replace('_', ' ')}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(discharge.status)}>
                              {discharge.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {discharge.dischargeDate ? new Date(discharge.dischargeDate).toLocaleDateString() : 'TBD'}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedDischarge(discharge)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              {discharge.status === 'pending' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleApproveDischarge(discharge.id)}
                                  className="text-green-600 border-green-600 hover:bg-green-50"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              )}
                              {discharge.status === 'approved' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCompleteDischarge(discharge.id)}
                                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                                >
                                  <Home className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {filteredDischarges.length === 0 && !loading && (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No discharge plans found</p>
                      <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="today" className="space-y-6">
          <Card className={surfaceCard}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CalendarDays className="w-5 h-5" />
                <span>Today's Discharges ({todayDischarges.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todayDischarges.map((discharge) => (
                  <div key={discharge.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="p-2 bg-health-aqua/10 rounded-lg">
                      <Home className="w-6 h-6 text-health-aqua" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{discharge.patientName}</p>
                      <p className="text-sm text-gray-500">{discharge.department} • {discharge.dischargeDestination}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{discharge.dischargeDate}</p>
                      <Badge className={getStatusColor(discharge.status)}>
                        {discharge.status}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedDischarge(discharge)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                
                {todayDischarges.length === 0 && (
                  <div className="text-center py-8">
                    <CalendarDays className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No discharges scheduled for today</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflow" className="space-y-6">
          <Card className={surfaceCard}>
            <CardHeader>
              <CardTitle>Discharge Workflow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-health-teal/10 rounded-full">
                    <ClipboardList className="w-6 h-6 text-health-teal" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">1. Discharge Planning</h3>
                    <p className="text-sm text-gray-600">Create discharge plan with medications, instructions, and follow-up care</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>

                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">2. Review & Approval</h3>
                    <p className="text-sm text-gray-600">Medical staff reviews discharge plan and approves patient readiness</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>

                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-health-success/10 rounded-full">
                    <FileCheck className="w-6 h-6 text-health-success" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">3. Documentation</h3>
                    <p className="text-sm text-gray-600">Complete discharge summary, medication reconciliation, and patient education</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>

                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-health-aqua/10 rounded-full">
                    <Home className="w-6 h-6 text-health-aqua" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">4. Patient Discharge</h3>
                    <p className="text-sm text-gray-600">Patient is discharged with all necessary documentation and follow-up arrangements</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Discharge Modal */}
      <Dialog open={showDischargeModal} onOpenChange={setShowDischargeModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Discharge Plan</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Patient ID</Label>
              <Input
                value={newDischarge.patientId}
                onChange={(e) => setNewDischarge({...newDischarge, patientId: e.target.value})}
                placeholder="Enter patient ID"
              />
            </div>
            <div>
              <Label>Patient Name</Label>
              <Input
                value={newDischarge.patientName}
                onChange={(e) => setNewDischarge({...newDischarge, patientName: e.target.value})}
              />
            </div>
            <div>
              <Label>Admission Date</Label>
              <Input
                type="date"
                value={newDischarge.admissionDate}
                onChange={(e) => setNewDischarge({...newDischarge, admissionDate: e.target.value})}
              />
            </div>
            <div>
              <Label>Discharge Date</Label>
              <Input
                type="date"
                value={newDischarge.dischargeDate}
                onChange={(e) => setNewDischarge({...newDischarge, dischargeDate: e.target.value})}
              />
            </div>
            <div>
              <Label>Department</Label>
              <Select value={newDischarge.department} onValueChange={(value) => setNewDischarge({...newDischarge, department: value})}>
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
              <Label>Discharge Type</Label>
              <Select value={newDischarge.dischargeType} onValueChange={(value) => setNewDischarge({...newDischarge, dischargeType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select discharge type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="early">Early</SelectItem>
                  <SelectItem value="against_advice">Against Medical Advice</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Primary Diagnosis</Label>
              <Input
                value={newDischarge.primaryDiagnosis}
                onChange={(e) => setNewDischarge({...newDischarge, primaryDiagnosis: e.target.value})}
              />
            </div>
            <div>
              <Label>Discharge Diagnosis</Label>
              <Input
                value={newDischarge.dischargeDiagnosis}
                onChange={(e) => setNewDischarge({...newDischarge, dischargeDiagnosis: e.target.value})}
              />
            </div>
            <div>
              <Label>Discharge Destination</Label>
              <Select value={newDischarge.dischargeDestination} onValueChange={(value) => setNewDischarge({...newDischarge, dischargeDestination: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="rehabilitation">Rehabilitation Center</SelectItem>
                  <SelectItem value="nursing_home">Nursing Home</SelectItem>
                  <SelectItem value="another_hospital">Another Hospital</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Follow-up Appointment</Label>
              <Input
                type="date"
                value={newDischarge.followUpAppointment}
                onChange={(e) => setNewDischarge({...newDischarge, followUpAppointment: e.target.value})}
              />
            </div>
            <div>
              <Label>Follow-up Physician</Label>
              <Input
                value={newDischarge.followUpPhysician}
                onChange={(e) => setNewDischarge({...newDischarge, followUpPhysician: e.target.value})}
              />
            </div>
            <div className="col-span-2">
              <Label>Discharge Instructions</Label>
              <Textarea
                value={newDischarge.dischargeInstructions}
                onChange={(e) => setNewDischarge({...newDischarge, dischargeInstructions: e.target.value})}
                rows={3}
                placeholder="Detailed discharge instructions for the patient"
              />
            </div>
            <div className="col-span-2">
              <Label>Medications</Label>
              <Textarea
                value={newDischarge.medications}
                onChange={(e) => setNewDischarge({...newDischarge, medications: e.target.value})}
                rows={3}
                placeholder="List of medications with dosages and instructions"
              />
            </div>
            <div className="col-span-2">
              <Label>Discharge Summary</Label>
              <Textarea
                value={newDischarge.dischargeSummary}
                onChange={(e) => setNewDischarge({...newDischarge, dischargeSummary: e.target.value})}
                rows={4}
                placeholder="Comprehensive discharge summary including treatment provided and outcomes"
              />
            </div>
            <div className="col-span-2">
              <Label>Notes</Label>
              <Textarea
                value={newDischarge.notes}
                onChange={(e) => setNewDischarge({...newDischarge, notes: e.target.value})}
                rows={3}
                placeholder="Additional notes or special instructions"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDischargeModal(false)}>Cancel</Button>
            <Button onClick={handleCreateDischarge}>Create Discharge Plan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Discharge Details Modal */}
      {selectedDischarge && (
        <Dialog open={!!selectedDischarge} onOpenChange={() => setSelectedDischarge(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback>
                    {selectedDischarge.patientName?.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">{selectedDischarge.patientName}</h2>
                  <p className="text-sm text-gray-500">Discharge Plan</p>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Patient Information</Label>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Patient ID:</span> {selectedDischarge.patientId}</p>
                    <p><span className="font-medium">Admission Date:</span> {selectedDischarge.admissionDate}</p>
                    <p><span className="font-medium">Discharge Date:</span> {selectedDischarge.dischargeDate}</p>
                    <p><span className="font-medium">Department:</span> {selectedDischarge.department}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Medical Information</Label>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Primary Diagnosis:</span> {selectedDischarge.primaryDiagnosis}</p>
                    <p><span className="font-medium">Discharge Diagnosis:</span> {selectedDischarge.dischargeDiagnosis}</p>
                    <p><span className="font-medium">Follow-up Physician:</span> {selectedDischarge.followUpPhysician}</p>
                    <p><span className="font-medium">Follow-up Appointment:</span> {selectedDischarge.followUpAppointment}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Discharge Details</Label>
                  <div className="mt-2 space-y-2">
                    <Badge className={getStatusColor(selectedDischarge.status)}>
                      {selectedDischarge.status}
                    </Badge>
                    <Badge className={getDischargeTypeColor(selectedDischarge.dischargeType)}>
                      {selectedDischarge.dischargeType?.replace('_', ' ')}
                    </Badge>
                    <div className="flex items-center space-x-2">
                      {getDestinationIcon(selectedDischarge.dischargeDestination)}
                      <span className="capitalize">{selectedDischarge.dischargeDestination?.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Care Requirements</Label>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Home Care Needed:</span> {selectedDischarge.homeCareNeeded ? 'Yes' : 'No'}</p>
                    {selectedDischarge.homeCareNeeded && (
                      <p><span className="font-medium">Home Care Details:</span> {selectedDischarge.homeCareDetails}</p>
                    )}
                    <p><span className="font-medium">Transportation Needed:</span> {selectedDischarge.transportationNeeded ? 'Yes' : 'No'}</p>
                    {selectedDischarge.transportationNeeded && (
                      <p><span className="font-medium">Transportation Details:</span> {selectedDischarge.transportationDetails}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <Label className="text-sm font-medium text-gray-700">Discharge Instructions</Label>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm">{selectedDischarge.dischargeInstructions || 'No instructions available'}</p>
              </div>
            </div>
            <div className="mt-6">
              <Label className="text-sm font-medium text-gray-700">Medications</Label>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm">{selectedDischarge.medications || 'No medications listed'}</p>
              </div>
            </div>
            <div className="mt-6">
              <Label className="text-sm font-medium text-gray-700">Discharge Summary</Label>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm">{selectedDischarge.dischargeSummary || 'No summary available'}</p>
              </div>
            </div>
            <div className="mt-6">
              <Label className="text-sm font-medium text-gray-700">Notes</Label>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm">{selectedDischarge.notes || 'No notes available'}</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedDischarge(null)}>Close</Button>
              {selectedDischarge.status === 'pending' && (
                <Button onClick={() => handleApproveDischarge(selectedDischarge.id)}>
                  Approve Discharge
                </Button>
              )}
              {selectedDischarge.status === 'approved' && (
                <Button onClick={() => handleCompleteDischarge(selectedDischarge.id)}>
                  Complete Discharge
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      </div>
    </div>
  );
};

export default Discharges; 