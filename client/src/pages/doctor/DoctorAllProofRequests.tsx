import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Eye, Filter, Search, Download, Send, XCircle, Clock, Shield, ChevronDown, ChevronUp, User } from 'lucide-react';
import { format } from 'date-fns';
import { getDoctorProofRequests } from '@/services/proofRequestService';

const stats = [
  { label: 'Total Requests', value: 24, icon: <Shield className="w-6 h-6 text-health-teal" /> },
  { label: 'Pending', value: 7, icon: <Clock className="w-6 h-6 text-health-warning" /> },
  { label: 'Approved', value: 13, icon: <Shield className="w-6 h-6 text-health-success" /> },
  { label: 'Expired', value: 4, icon: <Shield className="w-6 h-6 text-health-danger" /> },
];

const statusColors = {
  approved: 'bg-health-success text-white',
  pending: 'bg-health-warning text-white',
  expired: 'bg-health-danger text-white',
};

const urgencyColors = {
  low: 'bg-blue-100 text-blue-700',
  normal: 'bg-green-100 text-green-700',
  high: 'bg-yellow-100 text-yellow-800',
  urgent: 'bg-red-100 text-red-700',
};

const pageSizeOptions = [10, 25, 50, 100];

const DoctorAllProofRequests = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [selected, setSelected] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'requestedAt' | 'patient' | 'purpose' | 'urgency' | 'status'>('requestedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [showDetail, setShowDetail] = useState<null | any>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRequests() {
      setLoading(true);
      try {
        const res = await getDoctorProofRequests();
        setRequests(res.data.requests || res.data.recentRequests || []);
      } catch (e) {
        setRequests([]);
      }
      setLoading(false);
    }
    fetchRequests();
  }, []);

  // Filtering
  let filtered = requests.filter(req => {
    const matchesSearch = (req.patientId?.firstName || req.patient || '').toLowerCase().includes(search.toLowerCase()) || (req.purpose || '').toLowerCase().includes(search.toLowerCase()) || (req._id || req.id || '').toLowerCase().includes(search.toLowerCase()) || (req.patientId?.email || req.email || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (req.status && req.status.toLowerCase() === statusFilter);
    const matchesUrgency = urgencyFilter === 'all' || (req.urgency && req.urgency.toLowerCase() === urgencyFilter);
    return matchesSearch && matchesStatus && matchesUrgency;
  });

  // Sorting
  filtered = filtered.sort((a, b) => {
    const valA = a[sortBy];
    const valB = b[sortBy];
    if (sortBy === 'requestedAt') {
      const dateA = new Date(String(valA)).getTime();
      const dateB = new Date(String(valB)).getTime();
      if (dateA < dateB) return sortDir === 'asc' ? -1 : 1;
      if (dateA > dateB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    }
    if (valA < valB) return sortDir === 'asc' ? -1 : 1;
    if (valA > valB) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Bulk actions
  const allSelected = paginated.length > 0 && paginated.every(r => selected.includes(r._id || r.id));
  const toggleSelectAll = () => {
    if (allSelected) setSelected(selected.filter(id => !paginated.some(r => r._id || r.id === id)));
    else setSelected([...selected, ...paginated.filter(r => !selected.includes(r._id || r.id)).map(r => r._id || r.id)]);
  };
  const toggleSelect = (id: string) => {
    setSelected(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id]);
  };
  const resetFilters = () => {
    setSearch(''); setStatusFilter('all'); setUrgencyFilter('all');
  };

  return (
    <div className="space-y-8">
      {/* Breadcrumbs */}
      <div className="text-sm text-health-charcoal/70 mb-2">Home / Proof Requests</div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-montserrat font-bold text-health-teal">All Proof Requests</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-health-charcoal">View and manage all proof requests sent to patients</span>
            <span className="flex items-center ml-2 text-xs text-health-success font-semibold"><span className="w-2 h-2 rounded-full bg-health-success mr-1"></span>Live</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Download className="w-4 h-4 mr-2" />Export</Button>
          <Button variant="default"><Send className="w-4 h-4 mr-2" />Create New Request</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="flex flex-row items-center gap-4 p-4 hover:shadow-md transition-shadow">
            <div className="bg-health-light-gray rounded-lg p-3 flex items-center justify-center">{stat.icon}</div>
            <div>
              <div className="text-2xl font-bold text-health-teal">{stat.value}</div>
              <div className="text-health-charcoal text-sm font-medium">{stat.label}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters/Search */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-1 gap-2">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-health-blue-gray w-4 h-4" />
              <Input
                placeholder="Search by patient, purpose, request ID, or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Urgency</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" onClick={resetFilters}>Reset</Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" disabled={selected.length === 0}>Bulk Resend</Button>
            <Button variant="outline" disabled={selected.length === 0}>Bulk Cancel</Button>
            <Button variant="outline" disabled={selected.length === 0}><Download className="w-4 h-4 mr-2" />Export Selected</Button>
          </div>
        </div>
      </Card>

      {/* Requests Table/List */}
      <Card>
        <CardHeader>
          <CardTitle>Proof Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-2 py-2"><input type="checkbox" checked={allSelected} onChange={toggleSelectAll} /></th>
                  <th className="px-4 py-2">Request ID</th>
                  <th className="px-4 py-2 cursor-pointer" onClick={() => { setSortBy('patient'); setSortDir(sortBy === 'patient' && sortDir === 'asc' ? 'desc' : 'asc'); }}>Patient {sortBy === 'patient' ? (sortDir === 'asc' ? <ChevronUp className="inline w-3 h-3" /> : <ChevronDown className="inline w-3 h-3" />) : null}</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2 cursor-pointer" onClick={() => { setSortBy('purpose'); setSortDir(sortBy === 'purpose' && sortDir === 'asc' ? 'desc' : 'asc'); }}>Purpose {sortBy === 'purpose' ? (sortDir === 'asc' ? <ChevronUp className="inline w-3 h-3" /> : <ChevronDown className="inline w-3 h-3" />) : null}</th>
                  <th className="px-4 py-2 cursor-pointer" onClick={() => { setSortBy('urgency'); setSortDir(sortBy === 'urgency' && sortDir === 'asc' ? 'desc' : 'asc'); }}>Urgency {sortBy === 'urgency' ? (sortDir === 'asc' ? <ChevronUp className="inline w-3 h-3" /> : <ChevronDown className="inline w-3 h-3" />) : null}</th>
                  <th className="px-4 py-2 cursor-pointer" onClick={() => { setSortBy('status'); setSortDir(sortBy === 'status' && sortDir === 'asc' ? 'desc' : 'asc'); }}>Status {sortBy === 'status' ? (sortDir === 'asc' ? <ChevronUp className="inline w-3 h-3" /> : <ChevronDown className="inline w-3 h-3" />) : null}</th>
                  <th className="px-4 py-2 cursor-pointer" onClick={() => { setSortBy('requestedAt'); setSortDir(sortBy === 'requestedAt' && sortDir === 'asc' ? 'desc' : 'asc'); }}>Requested At {sortBy === 'requestedAt' ? (sortDir === 'asc' ? <ChevronUp className="inline w-3 h-3" /> : <ChevronDown className="inline w-3 h-3" />) : null}</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={10} className="text-center py-8">Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={10} className="text-center text-health-charcoal/60 py-8">No requests found.</td></tr>
                ) : (
                  paginated.map((req) => (
                    <tr key={req._id || req.id} className={selected.includes(req._id || req.id) ? "bg-health-light-gray/60" : "hover:bg-health-light-gray/40 transition"}>
                      <td className="px-2 py-2"><input type="checkbox" checked={selected.includes(req._id || req.id)} onChange={() => toggleSelect(req._id || req.id)} /></td>
                      <td className="px-4 py-2 font-mono text-sm">{req._id || req.id}</td>
                      <td className="px-4 py-2 font-medium flex items-center gap-2"><User className="w-4 h-4 text-health-teal" />{req.patientId?.firstName || req.patient || 'Unknown'}</td>
                      <td className="px-4 py-2 text-xs text-health-charcoal/80">{req.patientId?.email || req.email || ''}</td>
                      <td className="px-4 py-2">{req.purpose}</td>
                      <td className="px-4 py-2"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${urgencyColors[req.urgency?.toLowerCase() || 'normal']}`}>{req.urgency}</span></td>
                      <td className="px-4 py-2"><Badge className={statusColors[req.status?.toLowerCase()] || 'bg-health-blue-gray text-white'}>{req.status}</Badge></td>
                      <td className="px-4 py-2 text-sm">{req.createdAt ? format(new Date(req.createdAt), 'yyyy-MM-dd') : ''}</td>
                      <td className="px-4 py-2">
                        {req.cloudinaryUrl && <a href={req.cloudinaryUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline">Attachment</a>}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex gap-2">
                          <Button size="icon" variant="outline" onClick={() => setShowDetail(req)}><Eye className="w-4 h-4" /></Button>
                          <Button size="icon" variant="outline"><Send className="w-4 h-4" /></Button>
                          <Button size="icon" variant="destructive"><XCircle className="w-4 h-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-health-charcoal/70">Page {page} of {totalPages}</div>
            <div className="flex gap-2 items-center">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</Button>
              <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
              <Select value={String(pageSize)} onValueChange={v => { setPageSize(Number(v)); setPage(1); }}>
                <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {pageSizeOptions.map(opt => <SelectItem key={opt} value={String(opt)}>{opt} / page</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Request Details Modal/Drawer */}
      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 relative animate-fade-in">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowDetail(null)}>&times;</button>
            <h2 className="text-2xl font-bold mb-2 text-health-teal">Request Details</h2>
            <div className="mb-2"><span className="font-semibold">Request ID:</span> {showDetail._id || showDetail.id}</div>
            <div className="mb-2"><span className="font-semibold">Patient:</span> {showDetail.patientId?.firstName || showDetail.patient || 'Unknown'} ({showDetail.patientId?.email || showDetail.email || 'N/A'})</div>
            <div className="mb-2"><span className="font-semibold">Purpose:</span> {showDetail.purpose}</div>
            <div className="mb-2"><span className="font-semibold">Urgency:</span> <span className={`px-2 py-1 rounded-full text-xs font-semibold ${urgencyColors[showDetail.urgency?.toLowerCase() || 'normal']}`}>{showDetail.urgency}</span></div>
            <div className="mb-2"><span className="font-semibold">Status:</span> <Badge className={statusColors[showDetail.status?.toLowerCase()] || 'bg-health-blue-gray text-white'}>{showDetail.status}</Badge></div>
            <div className="mb-2"><span className="font-semibold">Requested At:</span> {showDetail.createdAt ? format(new Date(showDetail.createdAt), 'yyyy-MM-dd') : ''}</div>
            <div className="mb-2"><span className="font-semibold">Fields:</span> {showDetail.fields?.join(', ') || 'N/A'}</div>
            <div className="mb-2"><span className="font-semibold">Message:</span> {showDetail.message || <span className="text-gray-400">(none)</span>}</div>
            <div className="mb-2"><span className="font-semibold">Attachment:</span> {showDetail?.cloudinaryUrl ? <a href={showDetail.cloudinaryUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline">View</a> : <span className="text-gray-400">(none)</span>}</div>
            <div className="mb-2"><span className="font-semibold">Audit Log:</span>
              <ul className="list-disc ml-6 text-sm">
                {showDetail.audit?.map((a, i) => <li key={i}>{a.action} - {a.date}</li>)}
              </ul>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline"><Send className="w-4 h-4 mr-2" />Resend</Button>
              <Button variant="destructive"><XCircle className="w-4 h-4 mr-2" />Cancel</Button>
              <Button variant="outline"><Download className="w-4 h-4 mr-2" />Export PDF</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAllProofRequests; 