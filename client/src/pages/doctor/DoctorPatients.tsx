
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Search, Filter, Eye, MessageCircle, FileText, Calendar, Plus } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const DoctorPatients = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPatient, setNewPatient] = useState({ firstName: '', lastName: '', email: '', dateOfBirth: '', bloodType: '', phone: '' });
  const [adding, setAdding] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchPatients() {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:8080/api/doctor/patients', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPatients(res.data.patients || []);
      } catch (e) {
        setPatients([]);
      }
      setLoading(false);
    }
    fetchPatients();
  }, []);

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-health-success text-white' : 'bg-health-blue-gray text-white';
  };

  const getAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const filteredPatients = patients.filter(patient => {
    const name = `${patient.firstName} ${patient.lastName}`;
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (patient.status || 'active') === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-montserrat font-bold text-health-teal">My Patients</h1>
          <p className="text-health-charcoal mt-2">Manage your patient roster and access medical information</p>
        </div>
        <Button className="bg-health-aqua hover:bg-health-aqua/90 text-white" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Patient
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-health-teal/10 rounded-lg">
                <Users className="w-6 h-6 text-health-teal" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Total Patients</p>
                <p className="text-2xl font-bold text-health-teal">{patients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-health-success/10 rounded-lg">
                <Users className="w-6 h-6 text-health-success" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Active Patients</p>
                <p className="text-2xl font-bold text-health-teal">
                  {patients.filter(p => p.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-health-aqua/10 rounded-lg">
                <Calendar className="w-6 h-6 text-health-aqua" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Upcoming Appointments</p>
                <p className="text-2xl font-bold text-health-teal">
                  {patients.filter(p => p.upcomingAppointment).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-health-warning/10 rounded-lg">
                <FileText className="w-6 h-6 text-health-warning" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Recent Records</p>
                <p className="text-2xl font-bold text-health-teal">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-health-blue-gray w-4 h-4" />
                <Input
                  placeholder="Search by name, email, or condition..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Patients</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patients Table */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Roster</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Primary Condition</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead>Next Appointment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : filteredPatients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-health-charcoal/60 py-8">No patients found.</TableCell>
                </TableRow>
              ) : (
                filteredPatients.map((patient) => (
                  <TableRow key={patient._id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                          <AvatarImage src={patient.profileImage || "/placeholder.svg"} />
                        <AvatarFallback className="bg-health-teal text-white">
                            {patient.firstName?.charAt(0) || ''}{patient.lastName?.charAt(0) || ''}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                          <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                          <p className="text-sm text-health-charcoal/70">{patient._id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{patient.email}</p>
                      <p className="text-sm text-health-charcoal/70">{patient.phone}</p>
                    </div>
                  </TableCell>
                    <TableCell>{patient.dateOfBirth ? getAge(patient.dateOfBirth) : ''}</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                  <TableCell>
                      <Badge className={getStatusColor(patient.status || 'active')}>
                        {patient.status || 'active'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => navigate(`/doctor/patients/${patient._id}`)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                        <Button size="sm" variant="outline" onClick={() => window.open(`mailto:${patient.email}`)}>
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                        <Button size="sm" variant="outline" onClick={() => navigate(`/doctor/patient-records/${patient._id}`)}>
                        <FileText className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Patient</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="First Name" value={newPatient.firstName} onChange={e => setNewPatient(p => ({ ...p, firstName: e.target.value }))} />
            <Input placeholder="Last Name" value={newPatient.lastName} onChange={e => setNewPatient(p => ({ ...p, lastName: e.target.value }))} />
            <Input placeholder="Email" value={newPatient.email} onChange={e => setNewPatient(p => ({ ...p, email: e.target.value }))} />
            <Input placeholder="Date of Birth" type="date" value={newPatient.dateOfBirth} onChange={e => setNewPatient(p => ({ ...p, dateOfBirth: e.target.value }))} />
            <Input placeholder="Blood Type" value={newPatient.bloodType} onChange={e => setNewPatient(p => ({ ...p, bloodType: e.target.value }))} />
            <Input placeholder="Phone" value={newPatient.phone} onChange={e => setNewPatient(p => ({ ...p, phone: e.target.value }))} />
          </div>
          <DialogFooter>
            <Button onClick={async () => {
              setAdding(true);
              try {
                const token = localStorage.getItem('token');
                await axios.post('http://localhost:8080/api/auth/register', {
                  ...newPatient,
                  role: 'patient',
                  password: Math.random().toString(36).slice(-8) // temp password
                }, { headers: { Authorization: `Bearer ${token}` } });
                toast.success('Patient added! They must verify their email.');
                setShowAddModal(false);
                setNewPatient({ firstName: '', lastName: '', email: '', dateOfBirth: '', bloodType: '', phone: '' });
                // Refresh patient list
                setLoading(true);
                const res = await axios.get('http://localhost:8080/api/doctor/patients', { headers: { Authorization: `Bearer ${token}` } });
                setPatients(res.data.patients || []);
              } catch (e) {
                toast.error('Failed to add patient.');
              }
              setAdding(false);
            }} disabled={adding}>
              Add Patient
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorPatients;
