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
  Stethoscope, Heart, Brain, Baby, AlertTriangle, Building,
  Search, Plus, Eye, Edit, Trash2, Phone, Mail, MapPin, User,
  Calendar, Clock, CheckCircle, Award, Star, GraduationCap,
  Briefcase, Settings, Download, Filter, ArrowRight, TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { toast } from 'sonner';

const DoctorManagement: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<any>(null);
  const [newDoctor, setNewDoctor] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    employeeId: '',
    specialty: '',
    department: '',
    licenseNumber: '',
    experience: '',
    education: '',
    certifications: '',
    availability: '',
    consultationFee: '',
    status: 'active',
    address: '',
    emergencyContact: '',
    notes: ''
  });

  useEffect(() => {
    fetchDoctorsData();
  }, []);

  const fetchDoctorsData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/hospital/doctors');
      console.log('Doctors API Response:', response.data);
      if (response.data.success) {
        const doctorsList = response.data.doctors || [];
        console.log('Doctors list:', doctorsList);
        setDoctors(doctorsList);
      } else {
        console.warn('API returned success=false:', response.data);
        setDoctors([]);
      }
    } catch (error: any) {
      console.error('Error fetching doctors data:', error);
      console.error('Error details:', error.response?.data);
      setDoctors([]);
      toast.error(error.response?.data?.message || 'Failed to load doctors data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-health-success text-white';
      case 'inactive': return 'bg-health-blue-gray text-white';
      case 'on_leave': return 'bg-yellow-500 text-white';
      case 'terminated': return 'bg-health-danger text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getSpecialtyIcon = (specialty: string) => {
    switch (specialty?.toLowerCase()) {
      case 'cardiology': return <Heart className="w-4 h-4" />;
      case 'neurology': return <Brain className="w-4 h-4" />;
      case 'pediatrics': return <Baby className="w-4 h-4" />;
      case 'emergency': return <AlertTriangle className="w-4 h-4" />;
      case 'orthopedics': return <User className="w-4 h-4" />;
      default: return <Stethoscope className="w-4 h-4" />;
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    const name = `${doctor.firstName} ${doctor.lastName}`;
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doctor.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doctor.employeeId || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = specialtyFilter === 'all' || doctor.specialty === specialtyFilter;
    const matchesStatus = statusFilter === 'all' || doctor.status === statusFilter;
    return matchesSearch && matchesSpecialty && matchesStatus;
  });

  const handleAddDoctor = async () => {
    // Validate required fields
    if (!newDoctor.firstName?.trim()) {
      toast.error('First name is required');
      return;
    }
    if (!newDoctor.lastName?.trim()) {
      toast.error('Last name is required');
      return;
    }
    if (!newDoctor.email?.trim()) {
      toast.error('Email is required');
      return;
    }
    if (!newDoctor.licenseNumber?.trim()) {
      toast.error('License number is required');
      return;
    }
    if (!newDoctor.specialty?.trim()) {
      toast.error('Specialty is required');
      return;
    }

    try {
      const response = await api.post('/hospital/doctors', newDoctor);
      
      if (response.data.success) {
        setDoctors([...doctors, response.data.doctor]);
        setShowAddModal(false);
        setNewDoctor({
          firstName: '', lastName: '', email: '', phone: '', employeeId: '', specialty: '',
          department: '', licenseNumber: '', experience: '', education: '', certifications: '',
          availability: '', consultationFee: '', status: 'active', address: '', emergencyContact: '', notes: ''
        });
        toast.success('Doctor added successfully');
        fetchDoctorsData();
      }
    } catch (error: any) {
      console.error('Error adding doctor:', error);
      toast.error(error.response?.data?.message || 'Failed to add doctor');
    }
  };

  const handleUpdateDoctor = async () => {
    try {
      const response = await api.put(`/hospital/doctors/${editingDoctor.id}`, editingDoctor);
      
      if (response.data.success) {
        setDoctors(doctors.map(d => d.id === editingDoctor.id ? response.data.doctor : d));
        setEditingDoctor(null);
        toast.success('Doctor updated successfully');
        fetchDoctorsData();
      }
    } catch (error: any) {
      console.error('Error updating doctor:', error);
      toast.error(error.response?.data?.message || 'Failed to update doctor');
    }
  };

  const handleDeleteDoctor = async (doctorId: string) => {
    if (!confirm('Are you sure you want to delete this doctor?')) return;
    
    try {
      await api.delete(`/hospital/doctors/${doctorId}`);
      
      setDoctors(doctors.filter(d => d.id !== doctorId));
      toast.success('Doctor deleted successfully');
      fetchDoctorsData();
    } catch (error: any) {
      console.error('Error deleting doctor:', error);
      toast.error(error.response?.data?.message || 'Failed to delete doctor');
    }
  };

  const doctorStats = {
    total: doctors.length,
    active: doctors.filter(d => d.status === 'active').length,
    cardiologists: doctors.filter(d => d.specialty === 'cardiology').length,
    neurologists: doctors.filter(d => d.specialty === 'neurology').length,
    pediatricians: doctors.filter(d => d.specialty === 'pediatrics').length
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-montserrat font-bold text-health-teal">Doctor Management</h1>
          <p className="text-health-charcoal mt-2">Comprehensive doctor management and scheduling</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => navigate('/hospital/staff-scheduling')}>
            <Calendar className="w-4 h-4 mr-2" />
            Schedule
          </Button>
          <Button className="bg-health-aqua hover:bg-health-aqua/90 text-white" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Doctor
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-health-teal/10 rounded-lg">
                <Stethoscope className="w-6 h-6 text-health-teal" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Total Doctors</p>
                <p className="text-2xl font-bold text-health-teal">{doctorStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-health-success/10 rounded-lg">
                <CheckCircle className="w-6 h-6 text-health-success" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Active</p>
                <p className="text-2xl font-bold text-health-success">{doctorStats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Cardiologists</p>
                <p className="text-2xl font-bold text-red-600">{doctorStats.cardiologists}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Neurologists</p>
                <p className="text-2xl font-bold text-purple-600">{doctorStats.neurologists}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Baby className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Pediatricians</p>
                <p className="text-2xl font-bold text-pink-600">{doctorStats.pediatricians}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="doctors" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="doctors">All Doctors</TabsTrigger>
          <TabsTrigger value="specialties">Specialties</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="doctors" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search doctors by name, email, or employee ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Specialties</SelectItem>
                    <SelectItem value="cardiology">Cardiology</SelectItem>
                    <SelectItem value="neurology">Neurology</SelectItem>
                    <SelectItem value="pediatrics">Pediatrics</SelectItem>
                    <SelectItem value="orthopedics">Orthopedics</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="on_leave">On Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Doctors Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Stethoscope className="w-5 h-5" />
                <span>Doctor Directory</span>
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
                        <TableHead>Doctor</TableHead>
                        <TableHead>Specialty</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>License</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDoctors.map((doctor) => (
                        <TableRow key={doctor.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage src={doctor.avatar} />
                                <AvatarFallback>
                                  {doctor.firstName?.[0]}{doctor.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">Dr. {doctor.firstName} {doctor.lastName}</p>
                                <p className="text-sm text-gray-500">ID: {doctor.employeeId}</p>
                                <p className="text-xs text-gray-400">{doctor.experience} years exp.</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getSpecialtyIcon(doctor.specialty)}
                              <span className="capitalize">{doctor.specialty}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{doctor.department}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="text-sm">{doctor.phone}</p>
                              <p className="text-xs text-gray-500">{doctor.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(doctor.status)}>
                              {doctor.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm font-mono">{doctor.licenseNumber}</p>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedDoctor(doctor);
                                  setShowDoctorModal(true);
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingDoctor(doctor)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteDoctor(doctor.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {filteredDoctors.length === 0 && !loading && (
                    <div className="text-center py-8">
                      <Stethoscope className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No doctors found</p>
                      <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specialties" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { specialty: 'Cardiology', count: doctorStats.cardiologists, color: 'bg-red-500', icon: <Heart className="w-6 h-6" /> },
              { specialty: 'Neurology', count: doctorStats.neurologists, color: 'bg-purple-500', icon: <Brain className="w-6 h-6" /> },
              { specialty: 'Pediatrics', count: doctorStats.pediatricians, color: 'bg-pink-500', icon: <Baby className="w-6 h-6" /> },
              { specialty: 'Orthopedics', count: doctors.filter(d => d.specialty === 'orthopedics').length, color: 'bg-blue-500', icon: <User className="w-6 h-6" /> },
              { specialty: 'Emergency', count: doctors.filter(d => d.specialty === 'emergency').length, color: 'bg-orange-500', icon: <AlertTriangle className="w-6 h-6" /> },
              { specialty: 'General', count: doctors.filter(d => d.specialty === 'general').length, color: 'bg-gray-500', icon: <Stethoscope className="w-6 h-6" /> },
            ].map((spec) => (
              <Card key={spec.specialty} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg ${spec.color} text-white`}>
                      {spec.icon}
                    </div>
                    <span>{spec.specialty}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Doctors</span>
                      <span className="font-semibold">{spec.count}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {spec.count > 0 ? `${spec.count} active doctors` : 'No doctors in this specialty'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Doctor Schedules</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Schedule management coming soon</p>
                <p className="text-sm text-gray-400">Navigate to Staff Scheduling for detailed scheduling</p>
                <Button 
                  className="mt-4"
                  onClick={() => navigate('/hospital/staff-scheduling')}
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Go to Scheduling
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Specialty Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(doctorStats).map(([specialty, count]) => (
                    <div key={specialty} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          specialty === 'total' ? 'bg-health-teal' :
                          specialty === 'active' ? 'bg-health-success' :
                          specialty === 'cardiologists' ? 'bg-red-500' :
                          specialty === 'neurologists' ? 'bg-purple-500' :
                          'bg-pink-500'
                        }`}></div>
                        <span className="capitalize">{specialty}</span>
                      </div>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Additions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredDoctors
                    .sort((a, b) => new Date(b.hireDate || 0).getTime() - new Date(a.hireDate || 0).getTime())
                    .slice(0, 5)
                    .map((doctor) => (
                    <div key={doctor.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>
                          {doctor.firstName?.[0]}{doctor.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">Dr. {doctor.firstName} {doctor.lastName}</p>
                        <p className="text-xs text-gray-500">{doctor.specialty} • {doctor.department}</p>
                      </div>
                      <Badge className={getStatusColor(doctor.status)}>
                        {doctor.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Doctor Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Doctor</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>First Name</Label>
              <Input
                value={newDoctor.firstName}
                onChange={(e) => setNewDoctor({...newDoctor, firstName: e.target.value})}
              />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input
                value={newDoctor.lastName}
                onChange={(e) => setNewDoctor({...newDoctor, lastName: e.target.value})}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={newDoctor.email}
                onChange={(e) => setNewDoctor({...newDoctor, email: e.target.value})}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={newDoctor.phone}
                onChange={(e) => setNewDoctor({...newDoctor, phone: e.target.value})}
              />
            </div>
            <div>
              <Label>Employee ID</Label>
              <Input
                value={newDoctor.employeeId}
                onChange={(e) => setNewDoctor({...newDoctor, employeeId: e.target.value})}
              />
            </div>
            <div>
              <Label>License Number</Label>
              <Input
                value={newDoctor.licenseNumber}
                onChange={(e) => setNewDoctor({...newDoctor, licenseNumber: e.target.value})}
              />
            </div>
            <div>
              <Label>Specialty</Label>
              <Select value={newDoctor.specialty} onValueChange={(value) => setNewDoctor({...newDoctor, specialty: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cardiology">Cardiology</SelectItem>
                  <SelectItem value="neurology">Neurology</SelectItem>
                  <SelectItem value="pediatrics">Pediatrics</SelectItem>
                  <SelectItem value="orthopedics">Orthopedics</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Department</Label>
              <Select value={newDoctor.department} onValueChange={(value) => setNewDoctor({...newDoctor, department: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cardiology">Cardiology</SelectItem>
                  <SelectItem value="neurology">Neurology</SelectItem>
                  <SelectItem value="pediatrics">Pediatrics</SelectItem>
                  <SelectItem value="orthopedics">Orthopedics</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Experience (years)</Label>
              <Input
                value={newDoctor.experience}
                onChange={(e) => setNewDoctor({...newDoctor, experience: e.target.value})}
                type="number"
              />
            </div>
            <div>
              <Label>Consultation Fee</Label>
              <Input
                value={newDoctor.consultationFee}
                onChange={(e) => setNewDoctor({...newDoctor, consultationFee: e.target.value})}
                placeholder="$"
              />
            </div>
            <div className="col-span-2">
              <Label>Education</Label>
              <Textarea
                value={newDoctor.education}
                onChange={(e) => setNewDoctor({...newDoctor, education: e.target.value})}
                rows={2}
              />
            </div>
            <div className="col-span-2">
              <Label>Certifications</Label>
              <Textarea
                value={newDoctor.certifications}
                onChange={(e) => setNewDoctor({...newDoctor, certifications: e.target.value})}
                rows={2}
              />
            </div>
            <div className="col-span-2">
              <Label>Notes</Label>
              <Textarea
                value={newDoctor.notes}
                onChange={(e) => setNewDoctor({...newDoctor, notes: e.target.value})}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button onClick={handleAddDoctor}>Add Doctor</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Doctor Details Modal */}
      {selectedDoctor && (
        <Dialog open={showDoctorModal} onOpenChange={setShowDoctorModal}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback>
                    {selectedDoctor.firstName?.[0]}{selectedDoctor.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}</h2>
                  <p className="text-sm text-gray-500">Employee ID: {selectedDoctor.employeeId}</p>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Professional Information</Label>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Specialty:</span> {selectedDoctor.specialty}</p>
                    <p><span className="font-medium">Department:</span> {selectedDoctor.department}</p>
                    <p><span className="font-medium">License Number:</span> {selectedDoctor.licenseNumber}</p>
                    <p><span className="font-medium">Experience:</span> {selectedDoctor.experience} years</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Contact Information</Label>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Phone:</span> {selectedDoctor.phone}</p>
                    <p><span className="font-medium">Email:</span> {selectedDoctor.email}</p>
                    <p><span className="font-medium">Address:</span> {selectedDoctor.address}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Status & Availability</Label>
                  <div className="mt-2 space-y-2">
                    <Badge className={getStatusColor(selectedDoctor.status)}>
                      {selectedDoctor.status}
                    </Badge>
                    <p><span className="font-medium">Consultation Fee:</span> ${selectedDoctor.consultationFee}</p>
                    <p><span className="font-medium">Availability:</span> {selectedDoctor.availability}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Qualifications</Label>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Education:</span> {selectedDoctor.education}</p>
                    <p><span className="font-medium">Certifications:</span> {selectedDoctor.certifications}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <Label className="text-sm font-medium text-gray-700">Notes</Label>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm">{selectedDoctor.notes || 'No notes available'}</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDoctorModal(false)}>Close</Button>
              <Button onClick={() => {
                setShowDoctorModal(false);
                setEditingDoctor(selectedDoctor);
              }}>Edit Doctor</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default DoctorManagement; 