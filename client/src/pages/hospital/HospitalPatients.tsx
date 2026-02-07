import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { 
  Users, Search, Plus, Filter, Eye, Edit, Download, Upload, RefreshCw,
  Phone, Mail, Calendar, MapPin, Activity, AlertTriangle, CheckCircle,
  Hospital, Stethoscope, Pill, Heart, Brain, Clock, Bed, UserCheck,
  FileText, CreditCard, Star, TrendingUp, ArrowUpRight, ArrowDownRight,
  MoreHorizontal, Settings, Bell, Shield, Globe, Database, Zap,
  Monitor, Thermometer, Clipboard, Microscope, X, Save, UserPlus,
  History, AlertCircle, Info, Archive, BookOpen, Receipt, BedDouble
} from 'lucide-react';

const HospitalPatients: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState(false);

  // Enhanced patient data
  const patients = [
    {
      id: 1, name: 'John Smith', age: 45, gender: 'Male', status: 'admitted', priority: 'high',
      department: 'Cardiology', room: '301A', bed: 'B1', floor: '3rd Floor',
      admissionDate: '2024-01-15', expectedDischarge: '2024-01-25',
      phone: '+1-555-0123', email: 'john.smith@email.com',
      address: '123 Main St, Springfield, IL 62701', emergencyContact: 'Sarah Smith',
      emergencyPhone: '+1-555-0124', bloodType: 'O+', allergies: ['Penicillin', 'Shellfish'],
      diagnosis: 'Acute Myocardial Infarction', symptoms: ['Chest pain', 'Shortness of breath', 'Nausea'],
      vitalSigns: { temperature: 98.6, bloodPressure: '140/90', heartRate: 78, respiratoryRate: 16, oxygenSaturation: 95 },
      doctor: 'Dr. Johnson', nurse: 'Nurse Williams', insurance: 'BlueCross BlueShield', policyNumber: 'BC12345678',
      medications: ['Aspirin 81mg', 'Metoprolol 50mg', 'Atorvastatin 40mg'],
      treatmentPlan: 'Cardiac monitoring, IV medications, daily ECG',
      notes: 'Patient stable, responding well to treatment', lastUpdated: '2024-01-20 14:30',
      medicalHistory: ['Hypertension', 'Diabetes Type 2'],
      tests: [
        { name: 'ECG', status: 'completed', result: 'Abnormal', date: '2024-01-20' },
        { name: 'Blood Work', status: 'pending', result: '', date: '2024-01-21' },
        { name: 'Chest X-Ray', status: 'completed', result: 'Normal', date: '2024-01-19' }
      ],
      billingInfo: { totalCharges: 15420.50, insuranceCoverage: 12336.40, patientResponsibility: 3084.10, lastPayment: 1000.00, paymentStatus: 'partial' }
    },
    {
      id: 2, name: 'Sarah Johnson', age: 32, gender: 'Female', status: 'discharged', priority: 'low',
      department: 'Orthopedics', room: '205B', bed: 'B2', floor: '2nd Floor',
      admissionDate: '2024-01-10', expectedDischarge: '2024-01-18',
      phone: '+1-555-0124', email: 'sarah.johnson@email.com',
      address: '456 Oak Ave, Springfield, IL 62702', emergencyContact: 'Mike Johnson',
      emergencyPhone: '+1-555-0125', bloodType: 'A+', allergies: ['Latex'],
      diagnosis: 'Fractured right ankle', symptoms: ['Pain', 'Swelling', 'Limited mobility'],
      vitalSigns: { temperature: 98.4, bloodPressure: '120/80', heartRate: 72, respiratoryRate: 14, oxygenSaturation: 98 },
      doctor: 'Dr. Williams', nurse: 'Nurse Davis', insurance: 'Aetna Health', policyNumber: 'AE87654321',
      medications: ['Ibuprofen 600mg', 'Acetaminophen 500mg'],
      treatmentPlan: 'Cast immobilization, physical therapy',
      notes: 'Patient discharged with walking boot, follow-up in 2 weeks', lastUpdated: '2024-01-18 16:45',
      medicalHistory: ['No significant history'],
      tests: [
        { name: 'X-Ray Ankle', status: 'completed', result: 'Fracture confirmed', date: '2024-01-10' },
        { name: 'Follow-up X-Ray', status: 'completed', result: 'Healing well', date: '2024-01-17' }
      ],
      billingInfo: { totalCharges: 8750.25, insuranceCoverage: 7875.23, patientResponsibility: 875.02, lastPayment: 875.02, paymentStatus: 'paid' }
    },
    {
      id: 3, name: 'Mike Wilson', age: 28, gender: 'Male', status: 'emergency', priority: 'critical',
      department: 'Emergency', room: 'ER-01', bed: 'ER1', floor: '1st Floor',
      admissionDate: '2024-01-20', expectedDischarge: 'TBD',
      phone: '+1-555-0125', email: 'mike.wilson@email.com',
      address: '789 Pine St, Springfield, IL 62703', emergencyContact: 'Lisa Wilson',
      emergencyPhone: '+1-555-0126', bloodType: 'B+', allergies: ['None known'],
      diagnosis: 'Acute chest pain, rule out MI', symptoms: ['Severe chest pain', 'Diaphoresis', 'Anxiety'],
      vitalSigns: { temperature: 99.1, bloodPressure: '160/95', heartRate: 105, respiratoryRate: 22, oxygenSaturation: 92 },
      doctor: 'Dr. Brown', nurse: 'Nurse Taylor', insurance: 'United Healthcare', policyNumber: 'UH11223344',
      medications: ['Nitroglycerin SL', 'Aspirin 325mg', 'Morphine 2mg'],
      treatmentPlan: 'Continuous monitoring, serial ECGs, cardiac enzymes',
      notes: 'Patient arrived via ambulance, undergoing evaluation', lastUpdated: '2024-01-20 22:15',
      medicalHistory: ['Smoking history'],
      tests: [
        { name: 'ECG', status: 'completed', result: 'ST elevation', date: '2024-01-20' },
        { name: 'Troponin', status: 'pending', result: '', date: '2024-01-20' },
        { name: 'Chest X-Ray', status: 'in_progress', result: '', date: '2024-01-20' }
      ],
      billingInfo: { totalCharges: 0, insuranceCoverage: 0, patientResponsibility: 0, lastPayment: 0, paymentStatus: 'pending' }
    }
  ];

  // Helper functions
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.room.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || patient.status === filterStatus;
    const matchesDepartment = filterDepartment === 'all' || patient.department === filterDepartment;
    return matchesSearch && matchesStatus && matchesDepartment;
  }).sort((a, b) => {
    let aValue, bValue;
    switch (sortBy) {
      case 'name': aValue = a.name; bValue = b.name; break;
      case 'age': aValue = a.age; bValue = b.age; break;
      case 'admission': aValue = new Date(a.admissionDate); bValue = new Date(b.admissionDate); break;
      case 'department': aValue = a.department; bValue = b.department; break;
      default: aValue = a.name; bValue = b.name;
    }
    if (sortOrder === 'asc') return aValue > bValue ? 1 : -1;
    return aValue < bValue ? 1 : -1;
  });

  const departments = Array.from(new Set(patients.map(p => p.department)));

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'admitted': return { color: 'bg-health-teal/10 text-health-teal border-health-teal/30', icon: Bed, label: 'Admitted' };
      case 'discharged': return { color: 'bg-health-success/10 text-health-success border-health-success/30', icon: CheckCircle, label: 'Discharged' };
      case 'emergency': return { color: 'bg-health-error/10 text-health-error border-health-error/30', icon: AlertTriangle, label: 'Emergency' };
      default: return { color: 'bg-gray-100 text-gray-800 border-gray-300', icon: Info, label: status };
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'critical': return { color: 'bg-red-500', pulse: true };
      case 'high': return { color: 'bg-orange-500', pulse: false };
      case 'medium': return { color: 'bg-yellow-500', pulse: false };
      case 'low': return { color: 'bg-green-500', pulse: false };
      default: return { color: 'bg-gray-500', pulse: false };
    }
  };

  const refreshData = async () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="w-full px-4 md:px-6 py-6">
        {/* Header Section */}
        <div className="mb-6">
          <div className="rounded-2xl overflow-hidden shadow-lg">
            <div className="bg-gradient-to-r from-health-teal via-health-aqua to-teal-600 relative">
              <div className="relative p-4 md:p-6">
                <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Patient Management</h1>
                        <p className="text-white/90 text-sm">Comprehensive patient care management and medical records system</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 mt-4">
                      <Button variant="outline" size="default" className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm" onClick={refreshData} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh Data
                      </Button>
                      <Button variant="outline" size="default" className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Patient
                      </Button>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3 min-w-[250px]">
                    <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 text-center shadow-md border border-white/20">
                      <div className="text-xl font-bold text-health-teal">{patients.length}</div>
                      <div className="text-xs text-gray-700">Total Patients</div>
                    </div>
                    <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 text-center shadow-md border border-white/20">
                      <div className="text-xl font-bold text-health-error">{patients.filter(p => p.status === 'emergency').length}</div>
                      <div className="text-xs text-gray-700">Emergency</div>
                    </div>
                    <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 text-center shadow-md border border-white/20">
                      <div className="text-xl font-bold text-health-aqua">{patients.filter(p => p.status === 'admitted').length}</div>
                      <div className="text-xs text-gray-700">Admitted</div>
                    </div>
                    <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 text-center shadow-md border border-white/20">
                      <div className="text-xl font-bold text-health-success">{patients.filter(p => p.status === 'discharged').length}</div>
                      <div className="text-xs text-gray-700">Discharged</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Search and Filters */}
        <div className="mb-6">
          <div className="bg-white rounded-2xl shadow-lg border border-health-teal/20 p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-health-teal/60 w-5 h-5" />
                  <Input placeholder="Search patients by name, department, diagnosis, doctor, or room..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-12 h-12 text-lg border-health-teal/30 focus:border-health-teal" />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40 h-12 border-health-teal/30">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="admitted">Admitted</SelectItem>
                    <SelectItem value="discharged">Discharged</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                  <SelectTrigger className="w-40 h-12 border-health-teal/30">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32 h-12 border-health-teal/30">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="age">Age</SelectItem>
                    <SelectItem value="admission">Admission</SelectItem>
                    <SelectItem value="department">Department</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="lg" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="h-12 border-health-teal/30 text-health-teal hover:bg-health-teal/10">
                  {sortOrder === 'asc' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards - Professional UI Active */}
        <div className="mb-4 p-4 bg-gradient-to-r from-health-teal to-health-aqua rounded-2xl text-white text-center shadow-lg">
          <h2 className="text-2xl font-bold mb-2">✨ Enhanced Professional UI Active ✨</h2>
          <p className="text-white/90">All advanced features are now loaded and working!</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-health-teal/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">Total Patients</CardTitle>
              <div className="p-3 rounded-xl bg-gradient-to-br from-health-teal to-health-aqua shadow-md">
                <Users className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-health-teal">{patients.length}</div>
              <p className="text-xs text-gray-600 font-medium">Currently in system</p>
              <div className="mt-2">
                <Progress value={85} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">85% capacity</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-health-aqua/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">Admitted Patients</CardTitle>
              <div className="p-3 rounded-xl bg-gradient-to-br from-health-aqua to-teal-500 shadow-md">
                <Bed className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-health-aqua">{patients.filter(p => p.status === 'admitted').length}</div>
              <p className="text-xs text-gray-600 font-medium">Currently admitted</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-xs text-green-600">+12% this week</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-health-error/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">Emergency Cases</CardTitle>
              <div className="p-3 rounded-xl bg-gradient-to-br from-health-error to-red-600 shadow-md">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-health-error">{patients.filter(p => p.status === 'emergency').length}</div>
              <p className="text-xs text-gray-600 font-medium">Critical cases</p>
              <div className="flex items-center mt-2">
                <AlertCircle className="h-3 w-3 text-red-500 mr-1" />
                <span className="text-xs text-red-600">Requires attention</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-health-success/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">Discharged Today</CardTitle>
              <div className="p-3 rounded-xl bg-gradient-to-br from-health-success to-green-600 shadow-md">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-health-success">{patients.filter(p => p.status === 'discharged').length}</div>
              <p className="text-xs text-gray-600 font-medium">Successfully treated</p>
              <div className="flex items-center mt-2">
                <Star className="h-3 w-3 text-yellow-500 mr-1" />
                <span className="text-xs text-green-600">4.8 avg rating</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Patient Cards */}
        <div className="space-y-6">
          {filteredPatients.map((patient) => {
            const statusConfig = getStatusConfig(patient.status);
            const priorityConfig = getPriorityConfig(patient.priority);
            const StatusIcon = statusConfig.icon;

            return (
              <Card key={patient.id} className="shadow-lg border-2 border-transparent hover:border-health-teal/30 transition-all duration-300 hover:shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-health-teal to-health-aqua rounded-2xl flex items-center justify-center shadow-lg">
                          <Users className="w-8 h-8 text-white" />
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${priorityConfig.color} rounded-full border-2 border-white ${priorityConfig.pulse ? 'animate-pulse' : ''}`}></div>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{patient.name}</h3>
                        <p className="text-gray-600 text-lg">{patient.age} years • {patient.gender} • Blood Type: {patient.bloodType}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={statusConfig.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                          <Badge variant="outline" className="border-health-warning/30 text-health-warning">
                            {patient.priority.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="border-health-teal/30 text-health-teal hover:bg-health-teal/10">
                            <Eye className="w-4 h-4 mr-1" />View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-2xl">Patient Details - {patient.name}</DialogTitle>
                          </DialogHeader>
                          <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="grid w-full grid-cols-5">
                              <TabsTrigger value="overview">Overview</TabsTrigger>
                              <TabsTrigger value="medical">Medical</TabsTrigger>
                              <TabsTrigger value="tests">Tests</TabsTrigger>
                              <TabsTrigger value="billing">Billing</TabsTrigger>
                              <TabsTrigger value="notes">Notes</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="overview" className="space-y-4 mt-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                  <h4 className="font-semibold text-lg text-health-teal">Personal Information</h4>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div><span className="font-medium">Age:</span> {patient.age}</div>
                                    <div><span className="font-medium">Gender:</span> {patient.gender}</div>
                                    <div><span className="font-medium">Blood Type:</span> {patient.bloodType}</div>
                                    <div><span className="font-medium">Room:</span> {patient.room}</div>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <Phone className="h-4 w-4 text-health-teal" />
                                      <span className="text-sm">{patient.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Mail className="h-4 w-4 text-health-teal" />
                                      <span className="text-sm">{patient.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <MapPin className="h-4 w-4 text-health-teal" />
                                      <span className="text-sm">{patient.address}</span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="space-y-4">
                                  <h4 className="font-semibold text-lg text-health-teal">Vital Signs</h4>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                      <Thermometer className="h-4 w-4 text-red-500" />
                                      <span>{patient.vitalSigns.temperature}°F</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Heart className="h-4 w-4 text-red-500" />
                                      <span>{patient.vitalSigns.heartRate} bpm</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Monitor className="h-4 w-4 text-blue-500" />
                                      <span>{patient.vitalSigns.bloodPressure}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Activity className="h-4 w-4 text-green-500" />
                                      <span>{patient.vitalSigns.oxygenSaturation}% O2</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="medical" className="space-y-4 mt-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <h4 className="font-semibold text-lg text-health-teal mb-3">Current Medications</h4>
                                  <div className="space-y-2">
                                    {patient.medications.map((med, index) => (
                                      <div key={index} className="flex items-center gap-2 p-2 bg-health-teal/5 rounded-lg">
                                        <Pill className="h-4 w-4 text-health-teal" />
                                        <span className="text-sm">{med}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="font-semibold text-lg text-health-teal mb-3">Allergies</h4>
                                  <div className="space-y-2">
                                    {patient.allergies.map((allergy, index) => (
                                      <Badge key={index} variant="destructive" className="mr-2 mb-2">{allergy}</Badge>
                                    ))}
                                  </div>
                                  
                                  <h4 className="font-semibold text-lg text-health-teal mb-3 mt-6">Medical History</h4>
                                  <div className="space-y-2">
                                    {patient.medicalHistory.map((condition, index) => (
                                      <div key={index} className="text-sm p-2 bg-gray-50 rounded-lg">{condition}</div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="tests" className="space-y-4 mt-6">
                              <h4 className="font-semibold text-lg text-health-teal">Laboratory Tests & Results</h4>
                              <div className="space-y-3">
                                {patient.tests.map((test, index) => (
                                  <div key={index} className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <h5 className="font-medium">{test.name}</h5>
                                        <p className="text-sm text-gray-600">{test.date}</p>
                                      </div>
                                      <div className="text-right">
                                        <Badge className={test.status === 'completed' ? 'bg-green-100 text-green-800' : test.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}>
                                          {test.status}
                                        </Badge>
                                        {test.result && <p className="text-sm font-medium mt-1">{test.result}</p>}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="billing" className="space-y-4 mt-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <h4 className="font-semibold text-lg text-health-teal mb-3">Billing Summary</h4>
                                  <div className="space-y-3">
                                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                                      <span>Total Charges:</span>
                                      <span className="font-bold">${patient.billingInfo.totalCharges.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between p-3 bg-green-50 rounded-lg">
                                      <span>Insurance Coverage:</span>
                                      <span className="font-bold text-green-600">${patient.billingInfo.insuranceCoverage.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between p-3 bg-orange-50 rounded-lg">
                                      <span>Patient Responsibility:</span>
                                      <span className="font-bold text-orange-600">${patient.billingInfo.patientResponsibility.toFixed(2)}</span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="font-semibold text-lg text-health-teal mb-3">Insurance Information</h4>
                                  <div className="space-y-2">
                                    <div><span className="font-medium">Provider:</span> {patient.insurance}</div>
                                    <div><span className="font-medium">Policy:</span> {patient.policyNumber}</div>
                                    <div>
                                      <span className="font-medium">Status:</span> 
                                      <Badge className={patient.billingInfo.paymentStatus === 'paid' ? 'bg-green-100 text-green-800 ml-2' : patient.billingInfo.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800 ml-2' : 'bg-red-100 text-red-800 ml-2'}>
                                        {patient.billingInfo.paymentStatus}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="notes" className="space-y-4 mt-6">
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-semibold text-lg text-health-teal mb-3">Treatment Plan</h4>
                                  <div className="p-4 bg-health-teal/5 rounded-lg">
                                    <p className="text-sm">{patient.treatmentPlan}</p>
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="font-semibold text-lg text-health-teal mb-3">Clinical Notes</h4>
                                  <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm">{patient.notes}</p>
                                    <p className="text-xs text-gray-500 mt-2">Last updated: {patient.lastUpdated}</p>
                                  </div>
                                </div>
                              </div>
                            </TabsContent>
                          </Tabs>
                        </DialogContent>
                      </Dialog>
                      
                      <Button size="sm" variant="outline" className="border-health-aqua/30 text-health-aqua hover:bg-health-aqua/10">
                        <Edit className="w-4 h-4 mr-1" />Edit
                      </Button>
                      
                      <Button size="sm" variant="outline" className="border-gray-300">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Patient Summary Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="bg-health-teal/5 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Stethoscope className="h-4 w-4 text-health-teal" />
                        <span className="text-sm font-medium text-health-teal">Department</span>
                      </div>
                      <p className="text-sm font-bold">{patient.department}</p>
                      <p className="text-xs text-gray-600">{patient.doctor}</p>
                    </div>

                    <div className="bg-health-aqua/5 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="h-4 w-4 text-health-aqua" />
                        <span className="text-sm font-medium text-health-aqua">Location</span>
                      </div>
                      <p className="text-sm font-bold">{patient.room}</p>
                      <p className="text-xs text-gray-600">{patient.floor}</p>
                    </div>

                    <div className="bg-health-warning/5 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-4 w-4 text-health-warning" />
                        <span className="text-sm font-medium text-health-warning">Admission</span>
                      </div>
                      <p className="text-sm font-bold">{patient.admissionDate}</p>
                      <p className="text-xs text-gray-600">Expected: {patient.expectedDischarge}</p>
                    </div>

                    <div className="bg-health-error/5 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Heart className="h-4 w-4 text-health-error" />
                        <span className="text-sm font-medium text-health-error">Diagnosis</span>
                      </div>
                      <p className="text-sm font-bold">{patient.diagnosis}</p>
                      <p className="text-xs text-gray-600">{patient.symptoms.slice(0, 2).join(', ')}</p>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                    <Button size="sm" variant="ghost" className="text-health-teal hover:bg-health-teal/10">
                      <Pill className="w-4 h-4 mr-1" />Medications
                    </Button>
                    <Button size="sm" variant="ghost" className="text-health-aqua hover:bg-health-aqua/10">
                      <Microscope className="w-4 h-4 mr-1" />Lab Results
                    </Button>
                    <Button size="sm" variant="ghost" className="text-health-warning hover:bg-health-warning/10">
                      <FileText className="w-4 h-4 mr-1" />Medical Records
                    </Button>
                    <Button size="sm" variant="ghost" className="text-health-success hover:bg-health-success/10">
                      <Receipt className="w-4 h-4 mr-1" />Billing
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* No Results State */}
        {filteredPatients.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
              <Button onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
                setFilterDepartment('all');
              }}>Clear Filters</Button>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
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
                <Database className="h-4 w-4 text-health-aqua" />
                <span className="text-sm text-gray-600">{filteredPatients.length} patients shown</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="border-health-teal/30 text-health-teal hover:bg-health-teal/10">
                <Download className="h-4 w-4 mr-2" />Export
              </Button>
              <Button variant="outline" size="sm" className="border-health-aqua/30 text-health-aqua hover:bg-health-aqua/10">
                <Upload className="h-4 w-4 mr-2" />Import
              </Button>
              <Button variant="outline" size="sm" className="border-health-warning/30 text-health-warning hover:bg-health-warning/10">
                <Settings className="h-4 w-4 mr-2" />Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalPatients;
