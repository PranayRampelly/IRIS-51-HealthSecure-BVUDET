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
  Heart, Brain, Baby, AlertTriangle, Building, Stethoscope,
  Search, Plus, Eye, Edit, Trash2, Phone, Mail, MapPin, User,
  Calendar, Clock, CheckCircle, Award, Star, GraduationCap,
  Briefcase, Settings, Download, Filter, ArrowRight, TrendingUp,
  Shield, Activity, Thermometer, Pill, Syringe, Bed
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { toast } from 'sonner';

const NurseManagement: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [unitFilter, setUnitFilter] = useState('all');
  const [shiftFilter, setShiftFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [nurses, setNurses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNurse, setSelectedNurse] = useState<any>(null);
  const [showNurseModal, setShowNurseModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingNurse, setEditingNurse] = useState<any>(null);
  const [newNurse, setNewNurse] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    employeeId: '',
    unit: '',
    department: '',
    licenseNumber: '',
    experience: '',
    education: '',
    certifications: '',
    shift: '',
    status: 'active',
    address: '',
    emergencyContact: '',
    specializations: '',
    notes: ''
  });

  useEffect(() => {
    fetchNursesData();
  }, []);

  const fetchNursesData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/hospital/nurses');
      console.log('Nurses API Response:', response); // Debugging
      console.log('Response data:', response.data); // Debugging
      
      // The API returns { success: true, nurses: [...] }
      if (response.data && response.data.success && response.data.nurses) {
        console.log('Nurses list:', response.data.nurses); // Debugging
        setNurses(response.data.nurses);
      } else if (Array.isArray(response.data)) {
        // Fallback if response is directly an array
        console.log('Nurses list (array):', response.data);
        setNurses(response.data);
      } else {
        console.warn('Unexpected nurses data structure:', response.data);
        setNurses([]);
        toast.error('Invalid response format from server');
      }
    } catch (error: any) {
      console.error('Error fetching nurses data:', error);
      console.error('Error response:', error.response?.data);
      setNurses([]);
      toast.error(error.response?.data?.message || 'Failed to load nurses data');
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

  const getUnitIcon = (unit: string) => {
    switch (unit?.toLowerCase()) {
      case 'icu': return <AlertTriangle className="w-4 h-4" />;
      case 'emergency': return <Activity className="w-4 h-4" />;
      case 'pediatrics': return <Baby className="w-4 h-4" />;
      case 'cardiology': return <Heart className="w-4 h-4" />;
      case 'neurology': return <Brain className="w-4 h-4" />;
      case 'orthopedics': return <User className="w-4 h-4" />;
      default: return <Bed className="w-4 h-4" />;
    }
  };

  const getShiftColor = (shift: string) => {
    switch (shift?.toLowerCase()) {
      case 'day': return 'bg-blue-100 text-blue-800';
      case 'night': return 'bg-purple-100 text-purple-800';
      case 'evening': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredNurses = nurses.filter(nurse => {
    const name = `${nurse.firstName} ${nurse.lastName}`;
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (nurse.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (nurse.employeeId || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUnit = unitFilter === 'all' || nurse.unit === unitFilter;
    const matchesShift = shiftFilter === 'all' || nurse.shift === shiftFilter;
    const matchesStatus = statusFilter === 'all' || nurse.status === statusFilter;
    return matchesSearch && matchesUnit && matchesShift && matchesStatus;
  });

  const handleAddNurse = async () => {
    try {
      const response = await api.post('/hospital/nurses', newNurse);
      
      if (response.data.success) {
        setNurses([...nurses, response.data.nurse]);
        setShowAddModal(false);
        setNewNurse({
          firstName: '', lastName: '', email: '', phone: '', employeeId: '', unit: '',
          department: '', licenseNumber: '', experience: '', education: '', certifications: '',
          shift: '', status: 'active', address: '', emergencyContact: '', specializations: '', notes: ''
        });
        toast.success('Nurse added successfully');
        fetchNursesData();
      }
    } catch (error: any) {
      console.error('Error adding nurse:', error);
      toast.error(error.response?.data?.message || 'Failed to add nurse');
    }
  };

  const handleUpdateNurse = async () => {
    try {
      const response = await api.put(`/hospital/nurses/${editingNurse.id}`, editingNurse);
      
      if (response.data.success) {
        setNurses(nurses.map(n => n.id === editingNurse.id ? response.data.nurse : n));
        setEditingNurse(null);
        toast.success('Nurse updated successfully');
        fetchNursesData();
      }
    } catch (error: any) {
      console.error('Error updating nurse:', error);
      toast.error(error.response?.data?.message || 'Failed to update nurse');
    }
  };

  const handleDeleteNurse = async (nurseId: string) => {
    if (!confirm('Are you sure you want to delete this nurse?')) return;
    
    try {
      await api.delete(`/hospital/nurses/${nurseId}`);
      
      setNurses(nurses.filter(n => n.id !== nurseId));
      toast.success('Nurse deleted successfully');
      fetchNursesData();
    } catch (error) {
      console.error('Error deleting nurse:', error);
      toast.error('Failed to delete nurse');
    }
  };

  const nurseStats = {
    total: nurses.length,
    active: nurses.filter(n => n.status === 'active').length,
    icu: nurses.filter(n => n.unit === 'icu').length,
    emergency: nurses.filter(n => n.unit === 'emergency').length,
    pediatrics: nurses.filter(n => n.unit === 'pediatrics').length
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-montserrat font-bold text-health-teal">Nurse Management</h1>
          <p className="text-health-charcoal mt-2">Comprehensive nurse management and unit coordination</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => navigate('/hospital/staff-scheduling')}>
            <Calendar className="w-4 h-4 mr-2" />
            Schedule
          </Button>
          <Button className="bg-health-aqua hover:bg-health-aqua/90 text-white" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Nurse
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-health-teal/10 rounded-lg">
                <Heart className="w-6 h-6 text-health-teal" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Total Nurses</p>
                <p className="text-2xl font-bold text-health-teal">{nurseStats.total}</p>
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
                <p className="text-2xl font-bold text-health-success">{nurseStats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">ICU Nurses</p>
                <p className="text-2xl font-bold text-red-600">{nurseStats.icu}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Emergency</p>
                <p className="text-2xl font-bold text-orange-600">{nurseStats.emergency}</p>
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
                <p className="text-sm text-health-charcoal">Pediatrics</p>
                <p className="text-2xl font-bold text-pink-600">{nurseStats.pediatrics}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="nurses" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="nurses">All Nurses</TabsTrigger>
          <TabsTrigger value="units">Units</TabsTrigger>
          <TabsTrigger value="shifts">Shifts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="nurses" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search nurses by name, email, or employee ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={unitFilter} onValueChange={setUnitFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Units</SelectItem>
                    <SelectItem value="icu">ICU</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="pediatrics">Pediatrics</SelectItem>
                    <SelectItem value="cardiology">Cardiology</SelectItem>
                    <SelectItem value="neurology">Neurology</SelectItem>
                    <SelectItem value="orthopedics">Orthopedics</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={shiftFilter} onValueChange={setShiftFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by shift" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Shifts</SelectItem>
                    <SelectItem value="day">Day Shift</SelectItem>
                    <SelectItem value="evening">Evening Shift</SelectItem>
                    <SelectItem value="night">Night Shift</SelectItem>
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

          {/* Nurses Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="w-5 h-5" />
                <span>Nurse Directory</span>
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
                        <TableHead>Nurse</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Shift</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>License</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredNurses.map((nurse) => (
                        <TableRow key={nurse.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage src={nurse.avatar} />
                                <AvatarFallback>
                                  {nurse.firstName?.[0]}{nurse.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{nurse.firstName} {nurse.lastName}</p>
                                <p className="text-sm text-gray-500">ID: {nurse.employeeId}</p>
                                <p className="text-xs text-gray-400">{nurse.experience} years exp.</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getUnitIcon(nurse.unit)}
                              <span className="capitalize">{nurse.unit}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getShiftColor(nurse.shift)}>
                              {nurse.shift}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="text-sm">{nurse.phone}</p>
                              <p className="text-xs text-gray-500">{nurse.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(nurse.status)}>
                              {nurse.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm font-mono">{nurse.licenseNumber}</p>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedNurse(nurse);
                                  setShowNurseModal(true);
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingNurse(nurse)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteNurse(nurse.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {filteredNurses.length === 0 && !loading && (
                    <div className="text-center py-8">
                      <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No nurses found</p>
                      <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="units" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { unit: 'ICU', count: nurseStats.icu, color: 'bg-red-500', icon: <AlertTriangle className="w-6 h-6" /> },
              { unit: 'Emergency', count: nurseStats.emergency, color: 'bg-orange-500', icon: <Activity className="w-6 h-6" /> },
              { unit: 'Pediatrics', count: nurseStats.pediatrics, color: 'bg-pink-500', icon: <Baby className="w-6 h-6" /> },
              { unit: 'Cardiology', count: nurses.filter(n => n.unit === 'cardiology').length, color: 'bg-red-500', icon: <Heart className="w-6 h-6" /> },
              { unit: 'Neurology', count: nurses.filter(n => n.unit === 'neurology').length, color: 'bg-purple-500', icon: <Brain className="w-6 h-6" /> },
              { unit: 'Orthopedics', count: nurses.filter(n => n.unit === 'orthopedics').length, color: 'bg-blue-500', icon: <User className="w-6 h-6" /> },
            ].map((unit) => (
              <Card key={unit.unit} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg ${unit.color} text-white`}>
                      {unit.icon}
                    </div>
                    <span>{unit.unit}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Nurses</span>
                      <span className="font-semibold">{unit.count}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {unit.count > 0 ? `${unit.count} active nurses` : 'No nurses in this unit'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="shifts" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { shift: 'Day Shift', count: nurses.filter(n => n.shift === 'day').length, color: 'bg-blue-500', icon: <Clock className="w-6 h-6" /> },
              { shift: 'Evening Shift', count: nurses.filter(n => n.shift === 'evening').length, color: 'bg-orange-500', icon: <Clock className="w-6 h-6" /> },
              { shift: 'Night Shift', count: nurses.filter(n => n.shift === 'night').length, color: 'bg-purple-500', icon: <Clock className="w-6 h-6" /> },
            ].map((shift) => (
              <Card key={shift.shift} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg ${shift.color} text-white`}>
                      {shift.icon}
                    </div>
                    <span>{shift.shift}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Nurses</span>
                      <span className="font-semibold">{shift.count}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {shift.count > 0 ? `${shift.count} nurses on this shift` : 'No nurses on this shift'}
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
                <CardTitle>Unit Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(nurseStats).map(([unit, count]) => (
                    <div key={unit} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          unit === 'total' ? 'bg-health-teal' :
                          unit === 'active' ? 'bg-health-success' :
                          unit === 'icu' ? 'bg-red-500' :
                          unit === 'emergency' ? 'bg-orange-500' :
                          'bg-pink-500'
                        }`}></div>
                        <span className="capitalize">{unit}</span>
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
                  {filteredNurses
                    .sort((a, b) => new Date(b.hireDate || 0).getTime() - new Date(a.hireDate || 0).getTime())
                    .slice(0, 5)
                    .map((nurse) => (
                    <div key={nurse.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>
                          {nurse.firstName?.[0]}{nurse.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{nurse.firstName} {nurse.lastName}</p>
                        <p className="text-xs text-gray-500">{nurse.unit} • {nurse.shift}</p>
                      </div>
                      <Badge className={getStatusColor(nurse.status)}>
                        {nurse.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Nurse Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Nurse</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>First Name</Label>
              <Input
                value={newNurse.firstName}
                onChange={(e) => setNewNurse({...newNurse, firstName: e.target.value})}
              />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input
                value={newNurse.lastName}
                onChange={(e) => setNewNurse({...newNurse, lastName: e.target.value})}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={newNurse.email}
                onChange={(e) => setNewNurse({...newNurse, email: e.target.value})}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={newNurse.phone}
                onChange={(e) => setNewNurse({...newNurse, phone: e.target.value})}
              />
            </div>
            <div>
              <Label>Employee ID</Label>
              <Input
                value={newNurse.employeeId}
                onChange={(e) => setNewNurse({...newNurse, employeeId: e.target.value})}
              />
            </div>
            <div>
              <Label>License Number</Label>
              <Input
                value={newNurse.licenseNumber}
                onChange={(e) => setNewNurse({...newNurse, licenseNumber: e.target.value})}
              />
            </div>
            <div>
              <Label>Unit</Label>
              <Select value={newNurse.unit} onValueChange={(value) => setNewNurse({...newNurse, unit: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="icu">ICU</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="pediatrics">Pediatrics</SelectItem>
                  <SelectItem value="cardiology">Cardiology</SelectItem>
                  <SelectItem value="neurology">Neurology</SelectItem>
                  <SelectItem value="orthopedics">Orthopedics</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Shift</Label>
              <Select value={newNurse.shift} onValueChange={(value) => setNewNurse({...newNurse, shift: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select shift" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day Shift</SelectItem>
                  <SelectItem value="evening">Evening Shift</SelectItem>
                  <SelectItem value="night">Night Shift</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Experience (years)</Label>
              <Input
                value={newNurse.experience}
                onChange={(e) => setNewNurse({...newNurse, experience: e.target.value})}
                type="number"
              />
            </div>
            <div>
              <Label>Department</Label>
              <Select value={newNurse.department} onValueChange={(value) => setNewNurse({...newNurse, department: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="icu">ICU</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="pediatrics">Pediatrics</SelectItem>
                  <SelectItem value="cardiology">Cardiology</SelectItem>
                  <SelectItem value="neurology">Neurology</SelectItem>
                  <SelectItem value="orthopedics">Orthopedics</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Education</Label>
              <Textarea
                value={newNurse.education}
                onChange={(e) => setNewNurse({...newNurse, education: e.target.value})}
                rows={2}
              />
            </div>
            <div className="col-span-2">
              <Label>Certifications</Label>
              <Textarea
                value={newNurse.certifications}
                onChange={(e) => setNewNurse({...newNurse, certifications: e.target.value})}
                rows={2}
              />
            </div>
            <div className="col-span-2">
              <Label>Specializations</Label>
              <Textarea
                value={newNurse.specializations}
                onChange={(e) => setNewNurse({...newNurse, specializations: e.target.value})}
                rows={2}
              />
            </div>
            <div className="col-span-2">
              <Label>Notes</Label>
              <Textarea
                value={newNurse.notes}
                onChange={(e) => setNewNurse({...newNurse, notes: e.target.value})}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button onClick={handleAddNurse}>Add Nurse</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Nurse Details Modal */}
      {selectedNurse && (
        <Dialog open={showNurseModal} onOpenChange={setShowNurseModal}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback>
                    {selectedNurse.firstName?.[0]}{selectedNurse.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">{selectedNurse.firstName} {selectedNurse.lastName}</h2>
                  <p className="text-sm text-gray-500">Employee ID: {selectedNurse.employeeId}</p>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Professional Information</Label>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Unit:</span> {selectedNurse.unit}</p>
                    <p><span className="font-medium">Department:</span> {selectedNurse.department}</p>
                    <p><span className="font-medium">License Number:</span> {selectedNurse.licenseNumber}</p>
                    <p><span className="font-medium">Experience:</span> {selectedNurse.experience} years</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Contact Information</Label>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Phone:</span> {selectedNurse.phone}</p>
                    <p><span className="font-medium">Email:</span> {selectedNurse.email}</p>
                    <p><span className="font-medium">Address:</span> {selectedNurse.address}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Schedule & Status</Label>
                  <div className="mt-2 space-y-2">
                    <Badge className={getStatusColor(selectedNurse.status)}>
                      {selectedNurse.status}
                    </Badge>
                    <Badge className={getShiftColor(selectedNurse.shift)}>
                      {selectedNurse.shift}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Qualifications</Label>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Education:</span> {selectedNurse.education}</p>
                    <p><span className="font-medium">Certifications:</span> {selectedNurse.certifications}</p>
                    <p><span className="font-medium">Specializations:</span> {selectedNurse.specializations}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <Label className="text-sm font-medium text-gray-700">Notes</Label>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm">{selectedNurse.notes || 'No notes available'}</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNurseModal(false)}>Close</Button>
              <Button onClick={() => {
                setShowNurseModal(false);
                setEditingNurse(selectedNurse);
              }}>Edit Nurse</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default NurseManagement; 