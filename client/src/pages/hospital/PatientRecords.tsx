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
  Home, Car, UserCheck as UserCheckIcon, FileCheck, ClipboardList,
  History, FileSearch, Database, Archive, Printer, Share2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import hospitalCareService, { HospitalPatientRecord } from '@/services/hospitalCareService';

const PatientRecords: React.FC = () => {
  const navigate = useNavigate();
  const surfaceCard = "bg-white/80 border border-white/60 shadow-sm backdrop-blur";
  const [searchTerm, setSearchTerm] = useState('');
  const [recordTypeFilter, setRecordTypeFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [records, setRecords] = useState<HospitalPatientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [newRecord, setNewRecord] = useState({
    patientId: '',
    patientName: '',
    recordType: '',
    department: '',
    physician: '',
    date: '',
    diagnosis: '',
    treatment: '',
    medications: '',
    vitalSigns: {
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      oxygenSaturation: '',
      weight: ''
    },
    labResults: '',
    imagingResults: '',
    notes: '',
    attachments: []
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await hospitalCareService.getPatientRecords();
      setRecords(response.records || []);
    } catch (error) {
      console.error('Error fetching records:', error);
      setRecords([]);
      toast.error('Failed to load patient records');
    } finally {
      setLoading(false);
    }
  };

  const getRecordTypeColor = (type: string) => {
    switch (type) {
      case 'consultation': return 'bg-blue-100 text-blue-800';
      case 'lab_result': return 'bg-green-100 text-green-800';
      case 'imaging': return 'bg-purple-100 text-purple-800';
      case 'medication': return 'bg-orange-100 text-orange-800';
      case 'vital_signs': return 'bg-red-100 text-red-800';
      case 'procedure': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRecordTypeIcon = (type: string) => {
    switch (type) {
      case 'consultation': return <Stethoscope className="w-4 h-4" />;
      case 'lab_result': return <Activity className="w-4 h-4" />;
      case 'imaging': return <FileSearch className="w-4 h-4" />;
      case 'medication': return <Pill className="w-4 h-4" />;
      case 'vital_signs': return <Thermometer className="w-4 h-4" />;
      case 'procedure': return <UserCheck className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const filteredRecords = records.filter(record => {
    const name = record.patientName;
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.patientId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.diagnosis || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = recordTypeFilter === 'all' || record.recordType === recordTypeFilter;
    const matchesDepartment = departmentFilter === 'all' || record.department === departmentFilter;
    return matchesSearch && matchesType && matchesDepartment;
  });

  const handleCreateRecord = async () => {
    try {
      const response = await hospitalCareService.createPatientRecord(newRecord);
      setRecords([response.record, ...records]);
      setShowRecordModal(false);
      setNewRecord({
        patientId: '', patientName: '', recordType: '', department: '', physician: '', date: '',
        diagnosis: '', treatment: '', medications: '', vitalSigns: {
          bloodPressure: '', heartRate: '', temperature: '', oxygenSaturation: '', weight: ''
        }, labResults: '', imagingResults: '', notes: '', attachments: []
      });
      toast.success('Patient record created successfully');
    } catch (error) {
      console.error('Error creating record:', error);
      toast.error('Failed to create patient record');
    }
  };

  const exportRecords = () => {
    const csvContent = [
      ['Patient ID', 'Patient Name', 'Record Type', 'Department', 'Date', 'Diagnosis', 'Physician'].join(','),
      ...filteredRecords.map(r => [
        r.patientId,
        r.patientName,
        r.recordType,
        r.department,
        r.date,
        r.diagnosis,
        r.physician
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'patient-records.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const recordStats = {
    total: records.length,
    consultations: records.filter(r => r.recordType === 'consultation').length,
    labResults: records.filter(r => r.recordType === 'lab_result').length,
    imaging: records.filter(r => r.recordType === 'imaging').length,
    medications: records.filter(r => r.recordType === 'medication').length
  };

  const recentRecords = records.slice(0, 10);

  return (
    <div className="min-h-screen bg-gradient-to-br from-health-light-gray via-white to-health-light-gray/40">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
            <p className="text-xs font-semibold tracking-[0.3em] text-health-aqua/70 uppercase mb-2">Hospital Intelligence</p>
          <h1 className="text-3xl font-montserrat font-bold text-health-teal">Patient Records</h1>
          <p className="text-health-charcoal mt-2">Comprehensive patient medical records and documentation</p>
        </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="border-health-aqua/30 text-health-aqua hover:bg-health-aqua/10" onClick={exportRecords}>
            <Download className="w-4 h-4 mr-2" />
            Export Records
          </Button>
            <Button variant="outline" className="border-health-teal/30 text-health-teal hover:bg-health-teal/10" onClick={() => navigate('/hospital/patient-care')}>
            <Users className="w-4 h-4 mr-2" />
            Patient Care
          </Button>
            <Button className="bg-health-aqua hover:bg-health-aqua/90 text-white shadow-lg shadow-health-aqua/30" onClick={() => setShowRecordModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Record
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className={surfaceCard}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
                <div className="p-2 bg-health-teal/15 rounded-xl">
                <Database className="w-6 h-6 text-health-teal" />
              </div>
              <div>
                  <p className="text-sm text-health-charcoal/70">Total Records</p>
                <p className="text-2xl font-bold text-health-teal">{recordStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

          <Card className={surfaceCard}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                <Stethoscope className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                  <p className="text-sm text-health-charcoal/70">Consultations</p>
                <p className="text-2xl font-bold text-blue-600">{recordStats.consultations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

          <Card className={surfaceCard}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-xl">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
              <div>
                  <p className="text-sm text-health-charcoal/70">Lab Results</p>
                <p className="text-2xl font-bold text-green-600">{recordStats.labResults}</p>
              </div>
            </div>
          </CardContent>
        </Card>

          <Card className={surfaceCard}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-xl">
                <FileSearch className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                  <p className="text-sm text-health-charcoal/70">Imaging</p>
                <p className="text-2xl font-bold text-purple-600">{recordStats.imaging}</p>
              </div>
            </div>
          </CardContent>
        </Card>

          <Card className={surfaceCard}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-xl">
                <Pill className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                  <p className="text-sm text-health-charcoal/70">Medications</p>
                <p className="text-2xl font-bold text-orange-600">{recordStats.medications}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="records" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 border border-white/60 shadow-sm backdrop-blur rounded-2xl">
          <TabsTrigger value="records">All Records</TabsTrigger>
          <TabsTrigger value="recent">Recent Records</TabsTrigger>
          <TabsTrigger value="search">Advanced Search</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="space-y-6">
          {/* Filters */}
          <Card className={surfaceCard}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search records by patient name, ID, or diagnosis..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={recordTypeFilter} onValueChange={setRecordTypeFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by record type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="consultation">Consultations</SelectItem>
                    <SelectItem value="lab_result">Lab Results</SelectItem>
                    <SelectItem value="imaging">Imaging</SelectItem>
                    <SelectItem value="medication">Medications</SelectItem>
                    <SelectItem value="vital_signs">Vital Signs</SelectItem>
                    <SelectItem value="procedure">Procedures</SelectItem>
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

          {/* Records Table */}
          <Card className={surfaceCard}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Patient Records</span>
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
                        <TableHead>Record Type</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Physician</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Diagnosis</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage src={record.avatar} />
                                <AvatarFallback>
                                  {record.patientName?.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{record.patientName}</p>
                                <p className="text-sm text-gray-500">ID: {record.patientId}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getRecordTypeIcon(record.recordType)}
                              <Badge className={getRecordTypeColor(record.recordType)}>
                                {record.recordType?.replace('_', ' ')}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>{record.department}</TableCell>
                          <TableCell>{record.physician}</TableCell>
                          <TableCell>
                            {record.date ? new Date(record.date).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate" title={record.diagnosis}>
                              {record.diagnosis}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedRecord(record)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.print()}
                              >
                                <Printer className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                              >
                                <Share2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {filteredRecords.length === 0 && !loading && (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No patient records found</p>
                      <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-6">
          <Card className={surfaceCard}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <History className="w-5 h-5" />
                <span>Recent Records</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentRecords.map((record) => (
                  <div key={record.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className={`p-2 rounded-full ${getRecordTypeColor(record.recordType)}`}>
                      {getRecordTypeIcon(record.recordType)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{record.patientName}</p>
                      <p className="text-sm text-gray-500">{record.department} • {record.recordType}</p>
                      <p className="text-xs text-gray-400">{record.diagnosis}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{new Date(record.date).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-400">{record.physician}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRecord(record)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                
                {recentRecords.length === 0 && (
                  <div className="text-center py-8">
                    <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No recent records found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-6">
          <Card className={surfaceCard}>
            <CardHeader>
              <CardTitle>Advanced Search</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <Label>Date Range</Label>
                  <div className="flex space-x-2 mt-2">
                    <Input type="date" placeholder="From" />
                    <Input type="date" placeholder="To" />
                  </div>
                </div>
                <div>
                  <Label>Physician</Label>
                  <Input placeholder="Search by physician name" className="mt-2" />
                </div>
                <div>
                  <Label>Diagnosis</Label>
                  <Input placeholder="Search by diagnosis" className="mt-2" />
                </div>
                <div>
                  <Label>Record Type</Label>
                  <Select>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select record type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="lab_result">Lab Result</SelectItem>
                      <SelectItem value="imaging">Imaging</SelectItem>
                      <SelectItem value="medication">Medication</SelectItem>
                      <SelectItem value="vital_signs">Vital Signs</SelectItem>
                      <SelectItem value="procedure">Procedure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Department</Label>
                  <Select>
                    <SelectTrigger className="mt-2">
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
                <div className="flex items-end">
                  <Button className="w-full">
                    <Search className="w-4 h-4 mr-2" />
                    Search Records
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className={surfaceCard}>
              <CardHeader>
                <CardTitle>Record Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(recordStats).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          type === 'total' ? 'bg-health-teal' :
                          type === 'consultations' ? 'bg-blue-500' :
                          type === 'labResults' ? 'bg-green-500' :
                          type === 'imaging' ? 'bg-purple-500' :
                          'bg-orange-500'
                        }`}></div>
                        <span className="capitalize">{type.replace(/([A-Z])/g, ' $1').trim()}</span>
                      </div>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className={surfaceCard}>
              <CardHeader>
                <CardTitle>Department Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Cardiology', records: 45, color: 'bg-red-500' },
                    { name: 'Orthopedics', records: 32, color: 'bg-blue-500' },
                    { name: 'Neurology', records: 28, color: 'bg-green-500' },
                    { name: 'Emergency', records: 67, color: 'bg-orange-500' },
                    { name: 'Pediatrics', records: 23, color: 'bg-purple-500' },
                  ].map((dept) => (
                    <div key={dept.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${dept.color}`}></div>
                        <span>{dept.name}</span>
                      </div>
                      <span className="font-semibold">{dept.records}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* New Record Modal */}
      <Dialog open={showRecordModal} onOpenChange={setShowRecordModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Patient Record</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Patient ID</Label>
              <Input
                value={newRecord.patientId}
                onChange={(e) => setNewRecord({...newRecord, patientId: e.target.value})}
                placeholder="Enter patient ID"
              />
            </div>
            <div>
              <Label>Patient Name</Label>
              <Input
                value={newRecord.patientName}
                onChange={(e) => setNewRecord({...newRecord, patientName: e.target.value})}
              />
            </div>
            <div>
              <Label>Record Type</Label>
              <Select value={newRecord.recordType} onValueChange={(value) => setNewRecord({...newRecord, recordType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select record type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="lab_result">Lab Result</SelectItem>
                  <SelectItem value="imaging">Imaging</SelectItem>
                  <SelectItem value="medication">Medication</SelectItem>
                  <SelectItem value="vital_signs">Vital Signs</SelectItem>
                  <SelectItem value="procedure">Procedure</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Department</Label>
              <Select value={newRecord.department} onValueChange={(value) => setNewRecord({...newRecord, department: value})}>
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
              <Label>Physician</Label>
              <Input
                value={newRecord.physician}
                onChange={(e) => setNewRecord({...newRecord, physician: e.target.value})}
              />
            </div>
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={newRecord.date}
                onChange={(e) => setNewRecord({...newRecord, date: e.target.value})}
              />
            </div>
            <div>
              <Label>Diagnosis</Label>
              <Input
                value={newRecord.diagnosis}
                onChange={(e) => setNewRecord({...newRecord, diagnosis: e.target.value})}
              />
            </div>
            <div>
              <Label>Treatment</Label>
              <Input
                value={newRecord.treatment}
                onChange={(e) => setNewRecord({...newRecord, treatment: e.target.value})}
              />
            </div>
            <div className="col-span-2">
              <Label>Medications</Label>
              <Textarea
                value={newRecord.medications}
                onChange={(e) => setNewRecord({...newRecord, medications: e.target.value})}
                rows={3}
                placeholder="List medications with dosages and instructions"
              />
            </div>
            <div>
              <Label>Blood Pressure</Label>
              <Input
                value={newRecord.vitalSigns.bloodPressure}
                onChange={(e) => setNewRecord({
                  ...newRecord, 
                  vitalSigns: {...newRecord.vitalSigns, bloodPressure: e.target.value}
                })}
                placeholder="e.g., 120/80"
              />
            </div>
            <div>
              <Label>Heart Rate</Label>
              <Input
                value={newRecord.vitalSigns.heartRate}
                onChange={(e) => setNewRecord({
                  ...newRecord, 
                  vitalSigns: {...newRecord.vitalSigns, heartRate: e.target.value}
                })}
                placeholder="bpm"
              />
            </div>
            <div>
              <Label>Temperature</Label>
              <Input
                value={newRecord.vitalSigns.temperature}
                onChange={(e) => setNewRecord({
                  ...newRecord, 
                  vitalSigns: {...newRecord.vitalSigns, temperature: e.target.value}
                })}
                placeholder="°F"
              />
            </div>
            <div>
              <Label>Oxygen Saturation</Label>
              <Input
                value={newRecord.vitalSigns.oxygenSaturation}
                onChange={(e) => setNewRecord({
                  ...newRecord, 
                  vitalSigns: {...newRecord.vitalSigns, oxygenSaturation: e.target.value}
                })}
                placeholder="%"
              />
            </div>
            <div className="col-span-2">
              <Label>Lab Results</Label>
              <Textarea
                value={newRecord.labResults}
                onChange={(e) => setNewRecord({...newRecord, labResults: e.target.value})}
                rows={3}
                placeholder="Lab test results and interpretations"
              />
            </div>
            <div className="col-span-2">
              <Label>Imaging Results</Label>
              <Textarea
                value={newRecord.imagingResults}
                onChange={(e) => setNewRecord({...newRecord, imagingResults: e.target.value})}
                rows={3}
                placeholder="Imaging findings and interpretations"
              />
            </div>
            <div className="col-span-2">
              <Label>Notes</Label>
              <Textarea
                value={newRecord.notes}
                onChange={(e) => setNewRecord({...newRecord, notes: e.target.value})}
                rows={4}
                placeholder="Additional clinical notes and observations"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRecordModal(false)}>Cancel</Button>
            <Button onClick={handleCreateRecord}>Create Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Details Modal */}
      {selectedRecord && (
        <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback>
                    {selectedRecord.patientName?.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">{selectedRecord.patientName}</h2>
                  <p className="text-sm text-gray-500">Medical Record</p>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Patient Information</Label>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Patient ID:</span> {selectedRecord.patientId}</p>
                    <p><span className="font-medium">Date:</span> {selectedRecord.date}</p>
                    <p><span className="font-medium">Department:</span> {selectedRecord.department}</p>
                    <p><span className="font-medium">Physician:</span> {selectedRecord.physician}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Clinical Information</Label>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Diagnosis:</span> {selectedRecord.diagnosis}</p>
                    <p><span className="font-medium">Treatment:</span> {selectedRecord.treatment}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Record Details</Label>
                  <div className="mt-2 space-y-2">
                    <Badge className={getRecordTypeColor(selectedRecord.recordType)}>
                      {selectedRecord.recordType?.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Vital Signs</Label>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Blood Pressure:</span> {selectedRecord.vitalSigns?.bloodPressure || 'N/A'}</p>
                    <p><span className="font-medium">Heart Rate:</span> {selectedRecord.vitalSigns?.heartRate || 'N/A'}</p>
                    <p><span className="font-medium">Temperature:</span> {selectedRecord.vitalSigns?.temperature || 'N/A'}</p>
                    <p><span className="font-medium">Oxygen Saturation:</span> {selectedRecord.vitalSigns?.oxygenSaturation || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <Label className="text-sm font-medium text-gray-700">Medications</Label>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm">{selectedRecord.medications || 'No medications listed'}</p>
              </div>
            </div>
            <div className="mt-6">
              <Label className="text-sm font-medium text-gray-700">Lab Results</Label>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm">{selectedRecord.labResults || 'No lab results available'}</p>
              </div>
            </div>
            <div className="mt-6">
              <Label className="text-sm font-medium text-gray-700">Imaging Results</Label>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm">{selectedRecord.imagingResults || 'No imaging results available'}</p>
              </div>
            </div>
            <div className="mt-6">
              <Label className="text-sm font-medium text-gray-700">Notes</Label>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm">{selectedRecord.notes || 'No notes available'}</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedRecord(null)}>Close</Button>
              <Button onClick={() => window.print()}>
                <Printer className="w-4 h-4 mr-2" />
                Print Record
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      </div>
    </div>
  );
};

export default PatientRecords; 