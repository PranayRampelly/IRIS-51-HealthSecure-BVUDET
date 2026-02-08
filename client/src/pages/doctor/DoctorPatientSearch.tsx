import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Eye, Search, Shield, Plus, Loader2 } from 'lucide-react';
import api from '@/services/api';
import { toast } from 'sonner';
import { format } from 'date-fns';

const DoctorPatientSearch = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getDoctorPatients();

      if (response.success) {
        setPatients(response.patients || []);
      } else {
        throw new Error(response.message || 'Failed to fetch patients');
      }
    } catch (err: any) {
      console.error('Error fetching patients:', err);
      setError(err.message || 'Failed to load patients');
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(p => {
    const matchesSearch =
      p.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      p.lastName?.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase()) ||
      p._id?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-montserrat font-bold text-health-teal">Patient Search</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-health-charcoal">Find patients and manage their records or proof requests</span>
            <span className="flex items-center ml-2 text-xs text-health-success font-semibold">
              <span className="w-2 h-2 rounded-full bg-health-success mr-1"></span>Live
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-2 md:items-center md:justify-between mb-2">
        <div className="relative w-full md:w-1/2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-health-blue-gray w-4 h-4" />
          <Input
            placeholder="Search by name, email, or patient ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 mt-2 md:mt-0">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <Shield className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Patient List/Table */}
      <Card>
        <CardHeader>
          <CardTitle>Patients ({filteredPatients.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-health-teal" />
              <span className="ml-2 text-health-charcoal">Loading patients...</span>
            </div>
          ) : error ? (
            <div className="text-center text-red-600 py-8">
              <p>{error}</p>
              <Button onClick={fetchPatients} className="mt-4">Retry</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Patient ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Last Appointment</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Appointments</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center text-health-charcoal/60 py-8">
                        {patients.length === 0 ? 'No patients found. Patients will appear here after appointments.' : 'No patients match your search.'}
                      </td>
                    </tr>
                  ) : (
                    filteredPatients.map((p) => (
                      <tr key={p._id} className="hover:bg-health-light-gray/40 transition">
                        <td className="px-4 py-2 font-mono text-sm">{p._id?.slice(-8)}</td>
                        <td className="px-4 py-2 font-medium">
                          <div className="flex items-center gap-2">
                            <Avatar>
                              <AvatarImage src={p.profileImage} />
                              <AvatarFallback className="bg-health-teal text-white">
                                {p.firstName?.[0]}{p.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            {p.firstName} {p.lastName}
                          </div>
                        </td>
                        <td className="px-4 py-2">{p.email}</td>
                        <td className="px-4 py-2">
                          {p.lastAppointment ? format(new Date(p.lastAppointment), 'MMM dd, yyyy') : 'N/A'}
                        </td>
                        <td className="px-4 py-2">{p.totalAppointments || 0}</td>
                        <td className="px-4 py-2 capitalize">{p.status || 'active'}</td>
                        <td className="px-4 py-2">
                          <div className="flex gap-2">
                            <Button size="icon" variant="outline" title="View Patient"><Eye className="w-4 h-4" /></Button>
                            <Button size="icon" variant="outline" title="Request Proof"><Plus className="w-4 h-4" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorPatientSearch; 