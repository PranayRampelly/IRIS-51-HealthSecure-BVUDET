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
  Phone, Mail, MapPin, User, Shield,
  FileText, Pill, Thermometer, Brain,
  Baby, UserCheck, UserX, UserPlus, Settings, Download,
  ArrowRight, CalendarDays,
  Home, Car, FileCheck, ClipboardList,
  History, FileSearch, Database, Archive, Printer, Share2,
  Navigation, Map, Wifi, Signal, Battery, Zap,
  Ambulance, Siren, AlertCircle, Timer,
  Award, Star, GraduationCap, Briefcase
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const StaffDirectory: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [newStaff, setNewStaff] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    employeeId: '',
    department: '',
    role: '',
    position: '',
    hireDate: '',
    salary: '',
    status: 'active',
    address: '',
    emergencyContact: '',
    qualifications: '',
    certifications: '',
    specializations: '',
    experience: '',
    education: '',
    notes: ''
  });

  useEffect(() => {
    fetchStaffData();
  }, []);

  const fetchStaffData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/hospital/staff', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStaff(response.data.staff || []);
    } catch (error) {
      console.error('Error fetching staff data:', error);
      setStaff([]);
      toast.error('Failed to load staff data');
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

  const getRoleIcon = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'doctor': return <Stethoscope className="w-4 h-4" />;
      case 'nurse': return <Heart className="w-4 h-4" />;
      case 'administrator': return <Building className="w-4 h-4" />;
      case 'technician': return <Settings className="w-4 h-4" />;
      case 'pharmacist': return <Pill className="w-4 h-4" />;
      case 'receptionist': return <Phone className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getDepartmentColor = (department: string) => {
    switch (department?.toLowerCase()) {
      case 'cardiology': return 'bg-red-100 text-red-800';
      case 'neurology': return 'bg-purple-100 text-purple-800';
      case 'orthopedics': return 'bg-blue-100 text-blue-800';
      case 'pediatrics': return 'bg-pink-100 text-pink-800';
      case 'emergency': return 'bg-orange-100 text-orange-800';
      case 'administration': return 'bg-gray-100 text-gray-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const filteredStaff = staff.filter(member => {
    const name = `${member.firstName} ${member.lastName}`;
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.employeeId || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || member.department === departmentFilter;
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    return matchesSearch && matchesDepartment && matchesRole && matchesStatus;
  });

  const handleAddStaff = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8080/api/hospital/staff', newStaff, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setStaff([...staff, response.data.staff]);
      setShowAddModal(false);
      setNewStaff({
        firstName: '', lastName: '', email: '', phone: '', employeeId: '', department: '',
        role: '', position: '', hireDate: '', salary: '', status: 'active', address: '',
        emergencyContact: '', qualifications: '', certifications: '', specializations: '',
        experience: '', education: '', notes: ''
      });
      toast.success('Staff member added successfully');
    } catch (error) {
      console.error('Error adding staff:', error);
      toast.error('Failed to add staff member');
    }
  };

  const handleUpdateStaff = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:8080/api/hospital/staff/${editingStaff.id}`, editingStaff, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setStaff(staff.map(s => s.id === editingStaff.id ? response.data.staff : s));
      setEditingStaff(null);
      toast.success('Staff member updated successfully');
    } catch (error) {
      console.error('Error updating staff:', error);
      toast.error('Failed to update staff member');
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/hospital/staff/${staffId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setStaff(staff.filter(s => s.id !== staffId));
      toast.success('Staff member deleted successfully');
    } catch (error) {
      console.error('Error deleting staff:', error);
      toast.error('Failed to delete staff member');
    }
  };

  const exportStaffData = () => {
    const csvContent = [
      ['Employee ID', 'Name', 'Role', 'Department', 'Email', 'Phone', 'Status', 'Hire Date'].join(','),
      ...filteredStaff.map(s => [
        s.employeeId,
        `${s.firstName} ${s.lastName}`,
        s.role,
        s.department,
        s.email,
        s.phone,
        s.status,
        s.hireDate
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'staff-directory.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const staffStats = {
    total: staff.length,
    doctors: staff.filter(s => s.role === 'doctor').length,
    nurses: staff.filter(s => s.role === 'nurse').length,
    active: staff.filter(s => s.status === 'active').length,
    onLeave: staff.filter(s => s.status === 'on_leave').length
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-montserrat font-bold text-health-teal">Staff Directory</h1>
          <p className="text-health-charcoal mt-2">Comprehensive staff management and directory</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={exportStaffData}>
                                    <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button className="bg-health-aqua hover:bg-health-aqua/90 text-white" onClick={() => setShowAddModal(true)}>
                                    <Plus className="w-4 h-4 mr-2" />
            Add Staff
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-health-teal/10 rounded-lg">
                <Users className="w-6 h-6 text-health-teal" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Total Staff</p>
                <p className="text-2xl font-bold text-health-teal">{staffStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-health-success/10 rounded-lg">
                <Stethoscope className="w-6 h-6 text-health-success" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Doctors</p>
                <p className="text-2xl font-bold text-health-success">{staffStats.doctors}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-health-aqua/10 rounded-lg">
                <Heart className="w-6 h-6 text-health-aqua" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Nurses</p>
                <p className="text-2xl font-bold text-health-aqua">{staffStats.nurses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-health-success/10 rounded-lg">
                <UserCheck className="w-6 h-6 text-health-success" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Active</p>
                <p className="text-2xl font-bold text-health-success">{staffStats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">On Leave</p>
                <p className="text-2xl font-bold text-yellow-600">{staffStats.onLeave}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="directory" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="directory">Staff Directory</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="directory" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search staff by name, email, or employee ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="cardiology">Cardiology</SelectItem>
                    <SelectItem value="neurology">Neurology</SelectItem>
                    <SelectItem value="orthopedics">Orthopedics</SelectItem>
                    <SelectItem value="pediatrics">Pediatrics</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="administration">Administration</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="nurse">Nurse</SelectItem>
                    <SelectItem value="administrator">Administrator</SelectItem>
                    <SelectItem value="technician">Technician</SelectItem>
                    <SelectItem value="pharmacist">Pharmacist</SelectItem>
                    <SelectItem value="receptionist">Receptionist</SelectItem>
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
                    <SelectItem value="terminated">Terminated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Staff Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Staff Directory</span>
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
                        <TableHead>Staff Member</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Hire Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStaff.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage src={member.avatar} />
                                <AvatarFallback>
                                  {member.firstName?.[0]}{member.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{member.firstName} {member.lastName}</p>
                                <p className="text-sm text-gray-500">ID: {member.employeeId}</p>
                                <p className="text-xs text-gray-400">{member.position}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getRoleIcon(member.role)}
                              <span className="capitalize">{member.role}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getDepartmentColor(member.department)}>
                              {member.department}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="text-sm">{member.phone}</p>
                              <p className="text-xs text-gray-500">{member.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(member.status)}>
                              {member.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {member.hireDate ? new Date(member.hireDate).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedStaff(member);
                                  setShowStaffModal(true);
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingStaff(member)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteStaff(member.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {filteredStaff.length === 0 && !loading && (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No staff members found</p>
                      <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Cardiology', staff: staff.filter(s => s.department === 'cardiology').length, color: 'bg-red-500', icon: <Heart className="w-6 h-6" /> },
              { name: 'Neurology', staff: staff.filter(s => s.department === 'neurology').length, color: 'bg-purple-500', icon: <Brain className="w-6 h-6" /> },
              { name: 'Orthopedics', staff: staff.filter(s => s.department === 'orthopedics').length, color: 'bg-blue-500', icon: <UserCheck className="w-6 h-6" /> },
              { name: 'Pediatrics', staff: staff.filter(s => s.department === 'pediatrics').length, color: 'bg-pink-500', icon: <Baby className="w-6 h-6" /> },
              { name: 'Emergency', staff: staff.filter(s => s.department === 'emergency').length, color: 'bg-orange-500', icon: <AlertTriangle className="w-6 h-6" /> },
              { name: 'Administration', staff: staff.filter(s => s.department === 'administration').length, color: 'bg-gray-500', icon: <Building className="w-6 h-6" /> },
            ].map((dept) => (
              <Card key={dept.name} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg ${dept.color} text-white`}>
                      {dept.icon}
                    </div>
                    <span>{dept.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Staff Members</span>
                      <span className="font-semibold">{dept.staff}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {dept.staff > 0 ? `${dept.staff} active staff members` : 'No staff assigned'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { role: 'Doctors', count: staffStats.doctors, color: 'bg-health-success', icon: <Stethoscope className="w-6 h-6" /> },
              { role: 'Nurses', count: staffStats.nurses, color: 'bg-health-aqua', icon: <Heart className="w-6 h-6" /> },
              { role: 'Administrators', count: staff.filter(s => s.role === 'administrator').length, color: 'bg-gray-500', icon: <Building className="w-6 h-6" /> },
              { role: 'Technicians', count: staff.filter(s => s.role === 'technician').length, color: 'bg-blue-500', icon: <Settings className="w-6 h-6" /> },
              { role: 'Pharmacists', count: staff.filter(s => s.role === 'pharmacist').length, color: 'bg-green-500', icon: <Pill className="w-6 h-6" /> },
              { role: 'Receptionists', count: staff.filter(s => s.role === 'receptionist').length, color: 'bg-purple-500', icon: <Phone className="w-6 h-6" /> },
            ].map((role) => (
              <Card key={role.role} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg ${role.color} text-white`}>
                      {role.icon}
                    </div>
                    <span>{role.role}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Count</span>
                      <span className="font-semibold">{role.count}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {role.count > 0 ? `${role.count} staff members` : 'No staff in this role'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Staff Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(staffStats).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          status === 'total' ? 'bg-health-teal' :
                          status === 'doctors' ? 'bg-health-success' :
                          status === 'nurses' ? 'bg-health-aqua' :
                          status === 'active' ? 'bg-green-500' :
                          'bg-yellow-500'
                        }`}></div>
                        <span className="capitalize">{status.replace('_', ' ')}</span>
                      </div>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Hires</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredStaff
                    .sort((a, b) => new Date(b.hireDate).getTime() - new Date(a.hireDate).getTime())
                    .slice(0, 5)
                    .map((member) => (
                    <div key={member.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>
                          {member.firstName?.[0]}{member.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{member.firstName} {member.lastName}</p>
                        <p className="text-xs text-gray-500">{member.role} • {member.department}</p>
                      </div>
                      <Badge className={getStatusColor(member.status)}>
                        {member.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Staff Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Staff Member</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>First Name</Label>
              <Input
                value={newStaff.firstName}
                onChange={(e) => setNewStaff({...newStaff, firstName: e.target.value})}
              />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input
                value={newStaff.lastName}
                onChange={(e) => setNewStaff({...newStaff, lastName: e.target.value})}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={newStaff.email}
                onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={newStaff.phone}
                onChange={(e) => setNewStaff({...newStaff, phone: e.target.value})}
              />
            </div>
            <div>
              <Label>Employee ID</Label>
              <Input
                value={newStaff.employeeId}
                onChange={(e) => setNewStaff({...newStaff, employeeId: e.target.value})}
              />
            </div>
            <div>
              <Label>Department</Label>
              <Select value={newStaff.department} onValueChange={(value) => setNewStaff({...newStaff, department: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cardiology">Cardiology</SelectItem>
                  <SelectItem value="neurology">Neurology</SelectItem>
                  <SelectItem value="orthopedics">Orthopedics</SelectItem>
                  <SelectItem value="pediatrics">Pediatrics</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="administration">Administration</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Role</Label>
              <Select value={newStaff.role} onValueChange={(value) => setNewStaff({...newStaff, role: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="nurse">Nurse</SelectItem>
                  <SelectItem value="administrator">Administrator</SelectItem>
                  <SelectItem value="technician">Technician</SelectItem>
                  <SelectItem value="pharmacist">Pharmacist</SelectItem>
                  <SelectItem value="receptionist">Receptionist</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Position</Label>
              <Input
                value={newStaff.position}
                onChange={(e) => setNewStaff({...newStaff, position: e.target.value})}
              />
            </div>
            <div>
              <Label>Hire Date</Label>
              <Input
                type="date"
                value={newStaff.hireDate}
                onChange={(e) => setNewStaff({...newStaff, hireDate: e.target.value})}
              />
            </div>
            <div>
              <Label>Salary</Label>
              <Input
                value={newStaff.salary}
                onChange={(e) => setNewStaff({...newStaff, salary: e.target.value})}
                placeholder="$"
              />
            </div>
            <div className="col-span-2">
              <Label>Address</Label>
              <Input
                value={newStaff.address}
                onChange={(e) => setNewStaff({...newStaff, address: e.target.value})}
              />
            </div>
            <div className="col-span-2">
              <Label>Emergency Contact</Label>
              <Input
                value={newStaff.emergencyContact}
                onChange={(e) => setNewStaff({...newStaff, emergencyContact: e.target.value})}
              />
            </div>
            <div className="col-span-2">
              <Label>Qualifications</Label>
              <Textarea
                value={newStaff.qualifications}
                onChange={(e) => setNewStaff({...newStaff, qualifications: e.target.value})}
                rows={2}
              />
            </div>
            <div className="col-span-2">
              <Label>Notes</Label>
              <Textarea
                value={newStaff.notes}
                onChange={(e) => setNewStaff({...newStaff, notes: e.target.value})}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button onClick={handleAddStaff}>Add Staff Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Staff Modal */}
      {editingStaff && (
        <Dialog open={!!editingStaff} onOpenChange={() => setEditingStaff(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Staff Member</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <Input
                  value={editingStaff.firstName}
                  onChange={(e) => setEditingStaff({...editingStaff, firstName: e.target.value})}
                />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input
                  value={editingStaff.lastName}
                  onChange={(e) => setEditingStaff({...editingStaff, lastName: e.target.value})}
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={editingStaff.status} onValueChange={(value) => setEditingStaff({...editingStaff, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="on_leave">On Leave</SelectItem>
                    <SelectItem value="terminated">Terminated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Department</Label>
                <Select value={editingStaff.department} onValueChange={(value) => setEditingStaff({...editingStaff, department: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cardiology">Cardiology</SelectItem>
                    <SelectItem value="neurology">Neurology</SelectItem>
                    <SelectItem value="orthopedics">Orthopedics</SelectItem>
                    <SelectItem value="pediatrics">Pediatrics</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="administration">Administration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={editingStaff.phone}
                  onChange={(e) => setEditingStaff({...editingStaff, phone: e.target.value})}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={editingStaff.email}
                  onChange={(e) => setEditingStaff({...editingStaff, email: e.target.value})}
                />
              </div>
              <div>
                <Label>Position</Label>
                <Input
                  value={editingStaff.position}
                  onChange={(e) => setEditingStaff({...editingStaff, position: e.target.value})}
                />
              </div>
              <div>
                <Label>Salary</Label>
                <Input
                  value={editingStaff.salary}
                  onChange={(e) => setEditingStaff({...editingStaff, salary: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingStaff(null)}>Cancel</Button>
              <Button onClick={handleUpdateStaff}>Update Staff Member</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Staff Details Modal */}
      {selectedStaff && (
        <Dialog open={showStaffModal} onOpenChange={setShowStaffModal}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback>
                    {selectedStaff.firstName?.[0]}{selectedStaff.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">{selectedStaff.firstName} {selectedStaff.lastName}</h2>
                  <p className="text-sm text-gray-500">Employee ID: {selectedStaff.employeeId}</p>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Personal Information</Label>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Position:</span> {selectedStaff.position}</p>
                    <p><span className="font-medium">Department:</span> {selectedStaff.department}</p>
                    <p><span className="font-medium">Role:</span> {selectedStaff.role}</p>
                    <p><span className="font-medium">Hire Date:</span> {selectedStaff.hireDate ? new Date(selectedStaff.hireDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Contact Information</Label>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Phone:</span> {selectedStaff.phone}</p>
                    <p><span className="font-medium">Email:</span> {selectedStaff.email}</p>
                    <p><span className="font-medium">Address:</span> {selectedStaff.address}</p>
                    <p><span className="font-medium">Emergency Contact:</span> {selectedStaff.emergencyContact}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Status & Employment</Label>
                  <div className="mt-2 space-y-2">
                    <Badge className={getStatusColor(selectedStaff.status)}>
                      {selectedStaff.status}
                    </Badge>
                    <p><span className="font-medium">Salary:</span> {selectedStaff.salary}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Qualifications</Label>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Education:</span> {selectedStaff.education}</p>
                    <p><span className="font-medium">Experience:</span> {selectedStaff.experience}</p>
                    <p><span className="font-medium">Certifications:</span> {selectedStaff.certifications}</p>
                    <p><span className="font-medium">Specializations:</span> {selectedStaff.specializations}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <Label className="text-sm font-medium text-gray-700">Notes</Label>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm">{selectedStaff.notes || 'No notes available'}</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowStaffModal(false)}>Close</Button>
              <Button onClick={() => {
                setShowStaffModal(false);
                setEditingStaff(selectedStaff);
              }}>Edit Staff Member</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default StaffDirectory; 