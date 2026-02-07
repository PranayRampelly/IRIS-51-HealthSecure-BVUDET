
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Shield, Search, Filter, Eye, CheckCircle, XCircle, Clock, Download } from 'lucide-react';
import axios from 'axios';

const DoctorVerifyProofs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQueue() {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:8080/api/proof-requests/doctor/verification-queue', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setQueue(res.data.queue || []);
      } catch (e) {
        setQueue([]);
      }
      setLoading(false);
    }
    fetchQueue();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-health-success text-white';
      case 'Pending': return 'bg-health-warning text-white';
      case 'Denied': return 'bg-health-danger text-white';
      default: return 'bg-health-blue-gray text-white';
    }
  };

  const filteredQueue = queue.filter(proof => {
    const patient = proof.patientId?.firstName + ' ' + proof.patientId?.lastName;
    const matchesSearch =
      (patient || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (proof.purpose || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (proof._id || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || proof.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Proof Verification Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-health-blue-gray w-4 h-4" />
              <Input
                placeholder="Search by patient, purpose, or request ID..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Denied">Denied</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted At</TableHead>
                <TableHead>Attachment</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : filteredQueue.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-health-charcoal/60 py-8">No proofs in queue.</TableCell>
                </TableRow>
              ) : (
                filteredQueue.map((proof) => (
                  <TableRow key={proof._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarImage src={proof.patientId?.profileImage || "/placeholder.svg"} />
                          <AvatarFallback className="bg-health-teal text-white">
                            {proof.patientId?.firstName?.charAt(0) || ''}{proof.patientId?.lastName?.charAt(0) || ''}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{proof.patientId?.firstName} {proof.patientId?.lastName}</div>
                          <div className="text-xs text-gray-500">{proof.patientId?.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{proof.purpose}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(proof.status)}>{proof.status}</Badge>
                    </TableCell>
                    <TableCell>{proof.createdAt ? new Date(proof.createdAt).toLocaleString() : ''}</TableCell>
                    <TableCell>
                      {proof.cloudinaryUrl ? (
                        <a href={proof.cloudinaryUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline">View</a>
                      ) : (
                        <span className="text-gray-400">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button size="icon" variant="outline"><Eye className="w-4 h-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorVerifyProofs;
