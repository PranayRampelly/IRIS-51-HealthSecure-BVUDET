import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Eye, Search, Shield, Plus } from 'lucide-react';

const mockPatients = [
  { id: 'PAT-001', name: 'John Doe', email: 'john@example.com', lastProof: '2024-01-20', avatar: '/placeholder.svg', status: 'active' },
  { id: 'PAT-002', name: 'Jane Smith', email: 'jane@example.com', lastProof: '2024-01-18', avatar: '/placeholder.svg', status: 'inactive' },
  { id: 'PAT-003', name: 'Bob Johnson', email: 'bob@example.com', lastProof: '2024-01-15', avatar: '/placeholder.svg', status: 'active' },
  { id: 'PAT-004', name: 'Alice Brown', email: 'alice@example.com', lastProof: '2024-01-10', avatar: '/placeholder.svg', status: 'active' },
];

const DoctorPatientSearch = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredPatients = mockPatients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.email.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase());
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
            <span className="flex items-center ml-2 text-xs text-health-success font-semibold"><span className="w-2 h-2 rounded-full bg-health-success mr-1"></span>Live</span>
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
          <CardTitle>Patients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Patient ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Last Proof</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-health-charcoal/60 py-8">No patients found.</td>
                  </tr>
                ) : (
                  filteredPatients.map((p) => (
                    <tr key={p.id} className="hover:bg-health-light-gray/40 transition">
                      <td className="px-4 py-2 font-mono text-sm">{p.id}</td>
                      <td className="px-4 py-2 font-medium">
                        <div className="flex items-center gap-2">
                          <Avatar>
                            <AvatarImage src={p.avatar} />
                            <AvatarFallback className="bg-health-teal text-white">{p.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          {p.name}
                        </div>
                      </td>
                      <td className="px-4 py-2">{p.email}</td>
                      <td className="px-4 py-2">{p.lastProof}</td>
                      <td className="px-4 py-2 capitalize">{p.status}</td>
                      <td className="px-4 py-2">
                        <div className="flex gap-2">
                          <Button size="icon" variant="outline"><Eye className="w-4 h-4" /></Button>
                          <Button size="icon" variant="outline"><Plus className="w-4 h-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorPatientSearch; 