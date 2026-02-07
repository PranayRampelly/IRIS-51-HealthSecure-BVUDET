import React, { useState, useEffect, useMemo } from 'react';
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
  Baby, UserCheck, UserX, UserPlus, Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

type NewPatientFormState = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  insuranceProvider: string;
  policyNumber: string;
  primaryDiagnosis: string;
  department: string;
  roomNumber: string;
  bedNumber: string;
  admissionDate: string;
  expectedDischargeDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes: string;
  admittingDoctor: string;
};

type DepartmentStaffMember = {
  doctor?: {
    _id: string;
    firstName: string;
    lastName: string;
    specialization?: string;
  };
};

type DepartmentRecord = {
  _id: string;
  name: string;
  description?: string;
  departmentHead?: {
    _id: string;
    firstName: string;
    lastName: string;
    specialization?: string;
  };
  staff?: DepartmentStaffMember[];
};

type DoctorRecord = {
  _id: string;
  firstName: string;
  lastName: string;
  specialization?: string;
  department?: string;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const PATIENTS_ENDPOINT = `${API_BASE_URL}/hospital/patients`;
const PATIENT_DEPARTMENTS_ENDPOINT = `${PATIENTS_ENDPOINT}/departments`;
const PATIENT_DOCTORS_ENDPOINT = `${PATIENTS_ENDPOINT}/doctors`;
const PATIENT_EXPORT_ENDPOINT = `${PATIENTS_ENDPOINT}/export`;

const defaultStats = {
  total: 0,
  active: 0,
  critical: 0,
  discharged: 0,
  pending: 0,
  transferred: 0
};

const defaultPagination = {
  currentPage: 1,
  totalPages: 1,
  totalPatients: 0,
  hasNextPage: false,
  hasPrevPage: false
};

const initialNewPatientState: NewPatientFormState = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: '',
  phone: '',
  email: '',
  address: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactRelationship: '',
  insuranceProvider: '',
  policyNumber: '',
  primaryDiagnosis: '',
  department: '',
  roomNumber: '',
  bedNumber: '',
  admissionDate: '',
  expectedDischargeDate: '',
  priority: 'medium',
  notes: '',
  admittingDoctor: ''
};

const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Critical', value: 'critical' },
  { label: 'Discharged', value: 'discharged' },
  { label: 'Pending', value: 'pending' },
  { label: 'Transferred', value: 'transferred' }
];

const PRIORITY_OPTIONS = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Urgent', value: 'urgent' }
];

const formatAddress = (address: any) => {
  if (!address) return 'N/A';
  if (typeof address === 'string') return address;
  const parts = [
    address.street,
    address.city,
    address.state,
    address.zipCode,
    address.country
  ].filter(Boolean);
  return parts.length ? parts.join(', ') : 'N/A';
};

const formatDate = (value?: string | Date) => {
  if (!value) return 'N/A';
  const dateValue = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(dateValue.getTime())) {
    return 'N/A';
  }
  return dateValue.toLocaleDateString();
};

const getPrimaryEmergencyContact = (contacts?: any[]) => {
  if (!Array.isArray(contacts) || contacts.length === 0) return null;
  const primary = contacts.find(contact => contact?.isPrimary);
  return primary || contacts[0];
};

const PatientManagement: React.FC = () => {
  const navigate = useNavigate();
  const surfaceCard = "bg-white/80 border border-white/60 shadow-sm backdrop-blur";
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [patients, setPatients] = useState<any[]>([]);
  const [patientStats, setPatientStats] = useState(defaultStats);
  const [pagination, setPagination] = useState(defaultPagination);
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);
  const [doctors, setDoctors] = useState<DoctorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<any>(null);
  const [newPatient, setNewPatient] = useState<NewPatientFormState>(initialNewPatientState);

  const departmentOptions = useMemo(() => {
    const departmentNames = departments
      .map((dept) => dept?.name)
      .filter((name): name is string => Boolean(name));
    const patientDepartments = patients
      .map((patient) => patient?.department)
      .filter((name): name is string => Boolean(name));
    return Array.from(new Set([...departmentNames, ...patientDepartments]));
  }, [departments, patients]);

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    fetchPatients();
    fetchSupportingData();
  }, []);

  useEffect(() => {
    if (departmentFilter !== 'all' && !departmentOptions.includes(departmentFilter)) {
      setDepartmentFilter('all');
    }
  }, [departmentFilter, departmentOptions]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await axios.get(PATIENTS_ENDPOINT, {
        headers: getAuthHeaders()
      });
      const payload = response.data?.data || response.data || {};
      setPatients(payload.patients || []);
      setPagination(payload.pagination || defaultPagination);
      setPatientStats(payload.stats || defaultStats);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setPatients([]);
      setPatientStats(defaultStats);
      toast.error('Failed to load patient data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSupportingData = async () => {
    try {
      const headers = getAuthHeaders();
      const [departmentResponse, doctorResponse] = await Promise.all([
        axios.get(PATIENT_DEPARTMENTS_ENDPOINT, { headers }),
        axios.get(PATIENT_DOCTORS_ENDPOINT, { headers })
      ]);

      const departmentData = departmentResponse.data?.data || departmentResponse.data;
      const doctorData = doctorResponse.data?.data || doctorResponse.data;

      setDepartments(Array.isArray(departmentData) ? departmentData : []);
      setDoctors(Array.isArray(doctorData) ? doctorData : []);
    } catch (error) {
      console.error('Error loading supporting data:', error);
      toast.error('Failed to load departments or doctors');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-health-success text-white';
      case 'critical': return 'bg-health-danger text-white';
      case 'stable': return 'bg-health-aqua text-white';
      case 'discharged': return 'bg-health-blue-gray text-white';
      case 'pending': return 'bg-yellow-500 text-white';
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

  const getDepartmentIcon = (department: string) => {
    switch (department?.toLowerCase()) {
      case 'cardiology': return <HeartIcon className="w-4 h-4" />;
      case 'neurology': return <Brain className="w-4 h-4" />;
      case 'pediatrics': return <Baby className="w-4 h-4" />;
      case 'orthopedics': return <UserCheck className="w-4 h-4" />;
      case 'emergency': return <AlertTriangle className="w-4 h-4" />;
      default: return <Stethoscope className="w-4 h-4" />;
    }
  };

  const filteredPatients = patients.filter(patient => {
    const name = `${patient.firstName} ${patient.lastName}`;
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.patientId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || patient.department === departmentFilter;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const handleAddPatient = async () => {
    if (
      !newPatient.firstName.trim() ||
      !newPatient.lastName.trim() ||
      !newPatient.dateOfBirth ||
      !newPatient.gender ||
      !newPatient.phone.trim() ||
      !newPatient.email.trim() ||
      !newPatient.department
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const fallbackDoctorId = newPatient.admittingDoctor || doctors[0]?._id || undefined;

      const payload: Record<string, any> = {
        firstName: newPatient.firstName.trim(),
        lastName: newPatient.lastName.trim(),
        dateOfBirth: newPatient.dateOfBirth,
        gender: newPatient.gender,
        phone: newPatient.phone.trim(),
        email: newPatient.email.trim(),
        department: newPatient.department,
        roomNumber: newPatient.roomNumber || undefined,
        bedNumber: newPatient.bedNumber || undefined,
        primaryDiagnosis: newPatient.primaryDiagnosis || undefined,
        admissionDate: newPatient.admissionDate || new Date().toISOString(),
        expectedDischargeDate: newPatient.expectedDischargeDate || undefined,
        priority: newPatient.priority || 'medium',
        notes: newPatient.notes || undefined,
        admittingDoctor: fallbackDoctorId
      };

      if (newPatient.address) {
        payload.address = { street: newPatient.address };
      }

      if (newPatient.emergencyContactName || newPatient.emergencyContactPhone) {
        payload.emergencyContacts = [{
          name: newPatient.emergencyContactName || 'Primary Contact',
          relationship: newPatient.emergencyContactRelationship || 'Primary',
          phone: newPatient.emergencyContactPhone,
          email: newPatient.email,
          isPrimary: true
        }];
      }

      if (newPatient.insuranceProvider || newPatient.policyNumber) {
        payload.insurance = {
          provider: newPatient.insuranceProvider || undefined,
          policyNumber: newPatient.policyNumber || undefined
        };
      }

      const response = await axios.post(PATIENTS_ENDPOINT, payload, {
        headers: getAuthHeaders()
      });

      const createdPatient = response.data?.data;

      toast.success('Patient added successfully');
      setShowAddModal(false);
      setNewPatient(initialNewPatientState);
      if (createdPatient?._id) {
        setPatients(prev => [createdPatient, ...prev]);
        setPatientStats(prev => ({
          ...prev,
          total: prev.total + 1,
          active: createdPatient.status === 'active' ? prev.active + 1 : prev.active
        }));
      } else {
        fetchPatients();
      }
    } catch (error) {
      console.error('Error adding patient:', error);
      toast.error('Failed to add patient');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePatient = async () => {
    if (!editingPatient?._id) return;

    try {
      setIsSubmitting(true);
      const updatePayload: Record<string, any> = {
        firstName: editingPatient.firstName,
        lastName: editingPatient.lastName,
        status: editingPatient.status,
        department: editingPatient.department,
        phone: editingPatient.phone,
        email: editingPatient.email,
        roomNumber: editingPatient.roomNumber,
        bedNumber: editingPatient.bedNumber,
        primaryDiagnosis: editingPatient.primaryDiagnosis,
        priority: editingPatient.priority || 'medium'
      };

      const response = await axios.put(`${PATIENTS_ENDPOINT}/${editingPatient._id}`, updatePayload, {
        headers: getAuthHeaders()
      });

      const updatedPatient = response.data?.data;

      if (updatedPatient?._id) {
        setPatients(prev => prev.map(p => (p._id === updatedPatient._id ? updatedPatient : p)));
        setSelectedPatient(prev => (prev?._id === updatedPatient._id ? updatedPatient : prev));
      } else {
        fetchPatients();
      }

      toast.success('Patient updated successfully');
      setEditingPatient(null);
    } catch (error) {
      console.error('Error updating patient:', error);
      toast.error('Failed to update patient');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePatient = async (patientId?: string) => {
    if (!patientId) return;
    const confirmed = window.confirm('Are you sure you want to delete this patient?');
    if (!confirmed) return;
    
    try {
      setIsSubmitting(true);
      await axios.delete(`${PATIENTS_ENDPOINT}/${patientId}`, {
        headers: getAuthHeaders()
      });
      
      setPatients(prev => prev.filter(p => p._id !== patientId));
      if (selectedPatient?._id === patientId) {
        setSelectedPatient(null);
        setShowPatientModal(false);
      }
      toast.success('Patient deleted successfully');
      fetchPatients();
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast.error('Failed to delete patient');
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportPatientData = async () => {
    try {
      setIsExporting(true);
      const params: Record<string, string> = { format: 'csv' };
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (departmentFilter !== 'all') {
        params.department = departmentFilter;
      }

      const response = await axios.get(PATIENT_EXPORT_ENDPOINT, {
        headers: getAuthHeaders(),
        params,
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `patient-data-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting patient data:', error);
      toast.error('Failed to export patient data');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-health-light-gray via-white to-health-light-gray/40">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.3em] text-health-aqua/70 uppercase mb-2">Comprehensive Care</p>
            <h1 className="text-3xl font-montserrat font-bold text-health-teal">Patient Management</h1>
            <p className="text-health-charcoal mt-2">Comprehensive patient information and care coordination</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline" 
              className="border-health-teal/30 text-health-teal hover:bg-health-teal/10" 
              onClick={exportPatientData}
              disabled={isExporting}
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export Data'}
            </Button>
            <Button className="bg-health-aqua hover:bg-health-aqua/90 text-white shadow-lg shadow-health-aqua/30" onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Patient
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className={surfaceCard}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-health-teal/15 rounded-xl">
                  <Users className="w-6 h-6 text-health-teal" />
                </div>
                <div>
                  <p className="text-sm text-health-charcoal/70">Total Patients</p>
                  <p className="text-2xl font-bold text-health-teal">{patientStats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={surfaceCard}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-health-success/15 rounded-xl">
                  <UserCheck className="w-6 h-6 text-health-success" />
                </div>
                <div>
                  <p className="text-sm text-health-charcoal/70">Active</p>
                  <p className="text-2xl font-bold text-health-success">{patientStats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={surfaceCard}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-health-danger/15 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-health-danger" />
                </div>
                <div>
                  <p className="text-sm text-health-charcoal/70">Critical</p>
                  <p className="text-2xl font-bold text-health-danger">{patientStats.critical}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={surfaceCard}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-health-aqua/15 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-health-aqua" />
                </div>
                <div>
                  <p className="text-sm text-health-charcoal/70">Discharged</p>
                  <p className="text-2xl font-bold text-health-aqua">{patientStats.discharged}</p>
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
                  <p className="text-2xl font-bold text-yellow-600">{patientStats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="patients" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 border border-white/60 shadow-sm backdrop-blur rounded-2xl">
            <TabsTrigger value="patients">Patient List</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="patients" className="space-y-6">
            {/* Filters */}
            <Card className={surfaceCard}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search patients by name, ID, or email..."
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
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select 
                  value={departmentFilter} 
                  onValueChange={setDepartmentFilter}
                >
                  <SelectTrigger 
                    className="w-full md:w-48"
                    disabled={!departmentOptions.length && departmentFilter !== 'all'}
                  >
                    <SelectValue placeholder="Filter by department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departmentOptions.length ? (
                      departmentOptions.map((value) => (
                        <SelectItem key={value} value={value}>
                          {value}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-departments" disabled>
                        No departments available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Patients Table */}
          <Card className={surfaceCard}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Patient Directory</span>
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
                        <TableHead>Status</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Admission Date</TableHead>
                        <TableHead>Room</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPatients.map((patient) => (
                        <TableRow key={patient._id || patient.patientId}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage src={patient.avatar} />
                                <AvatarFallback>
                                  {patient.firstName?.[0]}{patient.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                                <p className="text-sm text-gray-500">ID: {patient.patientId}</p>
                                <p className="text-xs text-gray-400">{patient.dateOfBirth}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(patient.status || 'active')}>
                              {patient.status || 'active'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getDepartmentIcon(patient.department)}
                              <span>{patient.department || 'General'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="text-sm">{patient.phone}</p>
                              <p className="text-xs text-gray-500">{patient.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatDate(patient.admissionDate)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{patient.roomNumber || 'TBD'}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedPatient(patient);
                                  setShowPatientModal(true);
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingPatient(patient)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeletePatient(patient._id)}
                                disabled={isSubmitting}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {filteredPatients.length === 0 && !loading && (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No patients found</p>
                      <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          {departmentOptions.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {departmentOptions.map((deptName) => {
                const departmentRecord = departments.find((dept) => dept.name === deptName);
                const patientCount = patients.filter((patient) => patient.department === deptName).length;
                const staffCount = departmentRecord?.staff?.length || 0;
                const departmentHead = departmentRecord?.departmentHead
                  ? `${departmentRecord.departmentHead.firstName} ${departmentRecord.departmentHead.lastName}`
                  : 'Not assigned';
                const staffPreview = (departmentRecord?.staff || [])
                  .slice(0, 2)
                  .map((member) => member.doctor ? `${member.doctor.firstName} ${member.doctor.lastName}` : '')
                  .filter(Boolean);
                return (
                  <Card key={departmentRecord?._id || deptName} className={`${surfaceCard} hover:shadow-lg transition-shadow`}>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <div className="p-2 rounded-lg bg-health-teal/10 text-health-teal">
                          {getDepartmentIcon(deptName)}
                        </div>
                        <span>{deptName}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {departmentRecord?.description && (
                          <p className="text-sm text-gray-600">{departmentRecord.description}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs uppercase text-gray-500">Patients</p>
                            <p className="text-2xl font-semibold text-health-teal">{patientCount}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase text-gray-500">Staff</p>
                            <p className="text-2xl font-semibold text-health-aqua">{staffCount}</p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs uppercase text-gray-500">Department Head</p>
                          <p className="text-sm font-medium">{departmentHead}</p>
                        </div>
                        {staffPreview.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-xs uppercase text-gray-500">Key Staff</p>
                            <p className="text-sm text-gray-600">{staffPreview.join(', ')}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className={surfaceCard}>
              <CardContent className="p-8 text-center space-y-3">
                <Building className="w-10 h-10 text-health-teal mx-auto" />
                <p className="text-health-charcoal font-medium">No department records found</p>
                <p className="text-sm text-gray-500">
                  Create departments in the hospital admin panel to see staffing and patient distribution data.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className={surfaceCard}>
              <CardHeader>
                <CardTitle>Patient Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(patientStats).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          status === 'total' ? 'bg-health-teal' :
                          status === 'active' ? 'bg-health-success' :
                          status === 'critical' ? 'bg-health-danger' :
                          status === 'discharged' ? 'bg-health-aqua' :
                          'bg-yellow-500'
                        }`}></div>
                        <span className="capitalize">{status}</span>
                      </div>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className={surfaceCard}>
              <CardHeader>
                <CardTitle>Recent Admissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredPatients.slice(0, 5).map((patient) => (
                    <div key={patient._id || patient.patientId} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>
                          {patient.firstName?.[0]}{patient.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{patient.firstName} {patient.lastName}</p>
                        <p className="text-xs text-gray-500">{patient.department}</p>
                      </div>
                      <Badge className={getStatusColor(patient.status)}>
                        {patient.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

      </Tabs>

      </div>

      {/* Add Patient Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Patient</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>First Name</Label>
              <Input
                value={newPatient.firstName}
                onChange={(e) => setNewPatient({...newPatient, firstName: e.target.value})}
              />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input
                value={newPatient.lastName}
                onChange={(e) => setNewPatient({...newPatient, lastName: e.target.value})}
              />
            </div>
            <div>
              <Label>Date of Birth</Label>
              <Input
                type="date"
                value={newPatient.dateOfBirth}
                onChange={(e) => setNewPatient({...newPatient, dateOfBirth: e.target.value})}
              />
            </div>
            <div>
              <Label>Gender</Label>
              <Select value={newPatient.gender} onValueChange={(value) => setNewPatient({...newPatient, gender: value})}>
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
                value={newPatient.phone}
                onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={newPatient.email}
                onChange={(e) => setNewPatient({...newPatient, email: e.target.value})}
              />
            </div>
            <div className="md:col-span-2">
              <Label>Address</Label>
              <Input
                value={newPatient.address}
                onChange={(e) => setNewPatient({...newPatient, address: e.target.value})}
              />
            </div>
            <div>
              <Label>Department</Label>
              {departmentOptions.length ? (
                <Select value={newPatient.department} onValueChange={(value) => setNewPatient({...newPatient, department: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departmentOptions.map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  placeholder="Enter department name"
                  value={newPatient.department}
                  onChange={(e) => setNewPatient({...newPatient, department: e.target.value})}
                />
              )}
            </div>
            <div>
              <Label>Admitting Doctor</Label>
              <Select value={newPatient.admittingDoctor} onValueChange={(value) => setNewPatient({...newPatient, admittingDoctor: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Assign doctor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto-assign">Auto assign</SelectItem>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor._id} value={doctor._id}>
                      {doctor.firstName} {doctor.lastName} • {doctor.specialization || 'Doctor'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Room Number</Label>
              <Input
                value={newPatient.roomNumber}
                onChange={(e) => setNewPatient({...newPatient, roomNumber: e.target.value})}
              />
            </div>
            <div>
              <Label>Bed Number</Label>
              <Input
                value={newPatient.bedNumber}
                onChange={(e) => setNewPatient({...newPatient, bedNumber: e.target.value})}
              />
            </div>
            <div>
              <Label>Admission Date</Label>
              <Input
                type="date"
                value={newPatient.admissionDate}
                onChange={(e) => setNewPatient({...newPatient, admissionDate: e.target.value})}
              />
            </div>
            <div>
              <Label>Expected Discharge</Label>
              <Input
                type="date"
                value={newPatient.expectedDischargeDate}
                onChange={(e) => setNewPatient({...newPatient, expectedDischargeDate: e.target.value})}
              />
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={newPatient.priority} onValueChange={(value) => setNewPatient({...newPatient, priority: value as NewPatientFormState['priority']})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Primary Diagnosis</Label>
              <Input
                value={newPatient.primaryDiagnosis}
                onChange={(e) => setNewPatient({...newPatient, primaryDiagnosis: e.target.value})}
              />
            </div>
            <div>
              <Label>Insurance Provider</Label>
              <Input
                value={newPatient.insuranceProvider}
                onChange={(e) => setNewPatient({...newPatient, insuranceProvider: e.target.value})}
              />
            </div>
            <div>
              <Label>Policy Number</Label>
              <Input
                value={newPatient.policyNumber}
                onChange={(e) => setNewPatient({...newPatient, policyNumber: e.target.value})}
              />
            </div>
            <div>
              <Label>Emergency Contact Name</Label>
              <Input
                value={newPatient.emergencyContactName}
                onChange={(e) => setNewPatient({...newPatient, emergencyContactName: e.target.value})}
              />
            </div>
            <div>
              <Label>Emergency Contact Phone</Label>
              <Input
                value={newPatient.emergencyContactPhone}
                onChange={(e) => setNewPatient({...newPatient, emergencyContactPhone: e.target.value})}
              />
            </div>
            <div>
              <Label>Relationship</Label>
              <Input
                value={newPatient.emergencyContactRelationship}
                onChange={(e) => setNewPatient({...newPatient, emergencyContactRelationship: e.target.value})}
              />
            </div>
            <div className="md:col-span-2">
              <Label>Notes</Label>
              <Textarea
                value={newPatient.notes}
                onChange={(e) => setNewPatient({...newPatient, notes: e.target.value})}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button onClick={handleAddPatient} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Add Patient'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Patient Modal */}
      {editingPatient && (
        <Dialog open={!!editingPatient} onOpenChange={() => setEditingPatient(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Patient</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <Input
                  value={editingPatient.firstName}
                  onChange={(e) => setEditingPatient({...editingPatient, firstName: e.target.value})}
                />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input
                  value={editingPatient.lastName}
                  onChange={(e) => setEditingPatient({...editingPatient, lastName: e.target.value})}
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={editingPatient.status} onValueChange={(value) => setEditingPatient({...editingPatient, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Department</Label>
                {departmentOptions.length ? (
                  <Select value={editingPatient.department} onValueChange={(value) => setEditingPatient({...editingPatient, department: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {departmentOptions.map((value) => (
                        <SelectItem key={value} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={editingPatient.department}
                    onChange={(e) => setEditingPatient({...editingPatient, department: e.target.value})}
                    placeholder="Enter department"
                  />
                )}
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={editingPatient.phone}
                  onChange={(e) => setEditingPatient({...editingPatient, phone: e.target.value})}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={editingPatient.email}
                  onChange={(e) => setEditingPatient({...editingPatient, email: e.target.value})}
                />
              </div>
              <div>
                <Label>Room Number</Label>
                <Input
                  value={editingPatient.roomNumber}
                  onChange={(e) => setEditingPatient({...editingPatient, roomNumber: e.target.value})}
                />
              </div>
              <div>
                <Label>Bed Number</Label>
                <Input
                  value={editingPatient.bedNumber || ''}
                  onChange={(e) => setEditingPatient({...editingPatient, bedNumber: e.target.value})}
                />
              </div>
              <div>
                <Label>Primary Diagnosis</Label>
                <Input
                  value={editingPatient.primaryDiagnosis}
                  onChange={(e) => setEditingPatient({...editingPatient, primaryDiagnosis: e.target.value})}
                />
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={editingPatient.priority || 'medium'} onValueChange={(value) => setEditingPatient({...editingPatient, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingPatient(null)}>Cancel</Button>
              <Button onClick={handleUpdatePatient} disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Update Patient'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Patient Details Modal */}
      {selectedPatient && (
        <Dialog open={showPatientModal} onOpenChange={setShowPatientModal}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback>
                    {selectedPatient.firstName?.[0]}{selectedPatient.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">{selectedPatient.firstName} {selectedPatient.lastName}</h2>
                  <p className="text-sm text-gray-500">Patient ID: {selectedPatient.patientId}</p>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Personal Information</Label>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Date of Birth:</span> {selectedPatient.dateOfBirth}</p>
                    <p><span className="font-medium">Gender:</span> {selectedPatient.gender}</p>
                    <p><span className="font-medium">Phone:</span> {selectedPatient.phone}</p>
                    <p><span className="font-medium">Email:</span> {selectedPatient.email}</p>
                    <p><span className="font-medium">Address:</span> {selectedPatient.address}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Medical Information</Label>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Primary Diagnosis:</span> {selectedPatient.primaryDiagnosis}</p>
                    <p><span className="font-medium">Department:</span> {selectedPatient.department}</p>
                    <p><span className="font-medium">Room:</span> {selectedPatient.roomNumber}</p>
                    <p><span className="font-medium">Admission Date:</span> {selectedPatient.admissionDate}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Status & Priority</Label>
                  <div className="mt-2 space-y-2">
                    <Badge className={getStatusColor(selectedPatient.status)}>
                      {selectedPatient.status}
                    </Badge>
                    <Badge className={getPriorityColor(selectedPatient.priority)}>
                      {selectedPatient.priority} Priority
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Insurance</Label>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Provider:</span> {selectedPatient.insuranceProvider}</p>
                    <p><span className="font-medium">Policy Number:</span> {selectedPatient.policyNumber}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Emergency Contact</Label>
                  <div className="mt-2">
                    <p>{selectedPatient.emergencyContact}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <Label className="text-sm font-medium text-gray-700">Notes</Label>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm">{selectedPatient.notes || 'No notes available'}</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPatientModal(false)}>Close</Button>
              <Button onClick={() => {
                setShowPatientModal(false);
                setEditingPatient(selectedPatient);
              }}>Edit Patient</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default PatientManagement; 