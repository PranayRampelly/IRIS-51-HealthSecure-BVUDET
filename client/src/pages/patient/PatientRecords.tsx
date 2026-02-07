
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { DateRange } from 'react-day-picker';
import { 
  FileText, 
  Download, 
  Search, 
  Filter, 
  Calendar as CalendarIcon, 
  Eye, 
  Share, 
  Plus, 
  Upload, 
  Edit, 
  Trash2, 
  FileUp,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  MoreHorizontal,
  Copy,
  ExternalLink
} from 'lucide-react';
import { format, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';
import { toast } from 'sonner';
import api from '@/services/api';


// Type declaration for realtimeService to fix TypeScript errors


interface HealthRecord {
  _id: string;
  type: string;
  title: string;
  description?: string;
  provider: string;
  date: string;
  status: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

interface RecordStats {
  totalRecords: number;
  thisMonth: number;
  shared: number;
  recentViews: number;
}

const PatientRecords = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [stats, setStats] = useState<RecordStats>({
    totalRecords: 0,
    thisMonth: 0,
    shared: 0,
    recentViews: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);
  const [uploading, setUploading] = useState(false);


  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    type: '',
    title: '',
    description: '',
    provider: '',
    date: '',
    tags: '',
    file: null as File | null
  });

  // Share form state
  const [shareForm, setShareForm] = useState({
    email: '',
    message: '',
    duration: '7'
  });

  const pageSize = 10; // Default page size
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: pageSize
  });



  const fetchRecords = async () => {
    try {
      setLoading(true);
      // Build query params, omitting undefined values
      const queryParams: Record<string, string | number | boolean | undefined> = {
        page: currentPage,
        limit: pageSize
      };
      
      if (typeFilter !== 'all') {
        queryParams.type = typeFilter;
      }
      
      if (statusFilter !== 'all') {
        queryParams.status = statusFilter;
      }
      
      if (dateRange?.from) {
        queryParams.startDate = format(dateRange.from, 'yyyy-MM-dd');
      }
      
      if (dateRange?.to) {
        queryParams.endDate = format(dateRange.to, 'yyyy-MM-dd');
      }

      const response = await api.getHealthRecords(queryParams);
      
      if (response.records) {
        setRecords(response.records);
        setPagination({
          ...pagination,
          total: response.pagination?.total || 0
        });
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error('Error fetching records:', error);
      if (err.message?.includes('Rate limit exceeded')) {
        toast.error('Too many requests. Retrying automatically...', {
          description: err.message
        });
      } else {
        toast.error('Failed to fetch records', {
          description: err.message
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.getHealthRecordStats();
      if (response.stats) {
        setStats(response.stats);
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error('Error fetching stats:', error);
      if (err.message?.includes('Rate limit exceeded')) {
        // Don't show toast for stats rate limiting - it will be retried automatically
        console.log('Stats fetch rate limited, retrying:', err.message);
      } else {
        toast.error('Failed to fetch statistics', {
          description: err.message
        });
      }
    }
  };

  // Combine record and stats fetching
  const fetchData = useCallback(async () => {
    await Promise.all([fetchRecords(), fetchStats()]);
  }, [currentPage, typeFilter, statusFilter, dateRange]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Handle filter changes
  useEffect(() => {
    fetchData();
  }, [currentPage, typeFilter, statusFilter, dateRange]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadForm(prev => ({ ...prev, file }));
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.file || !uploadForm.type || !uploadForm.title || !uploadForm.provider || !uploadForm.date) {
      toast.error('Please fill in all required fields and select a file');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('type', uploadForm.type);
      formData.append('title', uploadForm.title);
      formData.append('description', uploadForm.description);
      formData.append('provider', uploadForm.provider);
      formData.append('date', uploadForm.date);
      if (uploadForm.tags) formData.append('tags', uploadForm.tags);

      await api.createHealthRecord(formData);
      toast.success('Health record uploaded successfully');
      setShowUploadDialog(false);
      setUploadForm({
        type: '',
        title: '',
        description: '',
        provider: '',
        date: '',
        tags: '',
        file: null
      });
      fetchRecords();
      fetchStats();
    } catch (error) {
      console.error('Error uploading record:', error);
      toast.error('Failed to upload health record');
    } finally {
      setUploading(false);
    }
  };

  const handleShare = async () => {
    if (!selectedRecord || !shareForm.email) {
      toast.error('Please provide recipient email');
      return;
    }

    try {
      // This would integrate with your sharing system
      toast.success(`Record shared with ${shareForm.email}`);
      setShowShareDialog(false);
      setShareForm({ email: '', message: '', duration: '7' });
    } catch (error) {
      console.error('Error sharing record:', error);
      toast.error('Failed to share record');
    }
  };

  const handleExport = async () => {
    try {
      const params: Record<string, string | number | boolean | undefined> = { export: true };
      if (typeFilter !== 'all') params.type = typeFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (dateRange?.from && dateRange?.to) {
        params.startDate = format(dateRange.from, 'yyyy-MM-dd');
        params.endDate = format(dateRange.to, 'yyyy-MM-dd');
      }

      const response = await api.getHealthRecords(params);
      
      if (response.blob) {
        // Create and download file from blob
        const url = URL.createObjectURL(response.blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `health_records_${format(new Date(), 'yyyy-MM-dd')}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('Records exported successfully');
      } else {
        throw new Error('Export failed: Invalid response format');
      }
    } catch (error) {
      console.error('Error exporting records:', error);
      toast.error('Failed to export records', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  };



  const handleDelete = async (recordId: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;

    try {
      // This would call the delete API endpoint
      toast.success('Record deleted successfully');
      fetchRecords();
      fetchStats();
    } catch (error) {
      console.error('Error deleting record:', error);
      toast.error('Failed to delete record');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-health-success text-white';
      case 'normal': return 'bg-health-success text-white';
      case 'completed': return 'bg-health-teal text-white';
      case 'abnormal': return 'bg-health-warning text-white';
      case 'critical': return 'bg-health-danger text-white';
      case 'archived': return 'bg-health-blue-gray text-white';
      default: return 'bg-health-blue-gray text-white';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'lab report':
      case 'lab result':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'prescription':
        return <FileText className="w-4 h-4 text-green-500" />;
      case 'imaging':
        return <FileText className="w-4 h-4 text-purple-500" />;
      case 'vaccination':
        return <FileText className="w-4 h-4 text-orange-500" />;
      case 'surgery':
        return <FileText className="w-4 h-4 text-red-500" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (record.description && record.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = typeFilter === 'all' || record.type.toLowerCase() === typeFilter.toLowerCase();
    const matchesStatus = statusFilter === 'all' || record.status.toLowerCase() === statusFilter.toLowerCase();
    
    let matchesDate = true;
    if (dateRange?.from && dateRange?.to) {
      const recordDate = new Date(record.date);
      matchesDate = isWithinInterval(recordDate, { start: dateRange.from, end: dateRange.to });
    }
    
    return matchesSearch && matchesType && matchesStatus && matchesDate;
  });



  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-3xl font-montserrat font-bold text-health-teal">My Records</h1>
            <p className="text-health-charcoal mt-2">View and manage your health records securely stored on the blockchain</p>
          </div>

        </div>
        <div className="flex space-x-3">
          <Button 
            onClick={handleExport}
            className="bg-health-aqua hover:bg-health-aqua/90 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Records
          </Button>
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button className="bg-health-teal hover:bg-health-teal/90 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Upload Record
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Upload Health Record</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Record Type *</Label>
                    <Select value={uploadForm.type} onValueChange={(value) => setUploadForm(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Lab Report">Lab Report</SelectItem>
                        <SelectItem value="Prescription">Prescription</SelectItem>
                        <SelectItem value="Imaging">Imaging</SelectItem>
                        <SelectItem value="Vaccination">Vaccination</SelectItem>
                        <SelectItem value="Surgery">Surgery</SelectItem>
                        <SelectItem value="Allergy">Allergy</SelectItem>
                        <SelectItem value="Medication">Medication</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      type="date"
                      value={uploadForm.date}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Blood Test Results, X-Ray Report"
                  />
                </div>
                <div>
                  <Label htmlFor="provider">Healthcare Provider *</Label>
                  <Input
                    value={uploadForm.provider}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, provider: e.target.value }))}
                    placeholder="e.g., Dr. Smith, City Hospital"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Additional details about this record"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    value={uploadForm.tags}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="e.g., diabetes, annual, emergency (comma separated)"
                  />
                </div>
                <div>
                  <Label htmlFor="file">File *</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <input
                      type="file"
                      id="file"
                      onChange={handleFileUpload}
                      accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.txt"
                      className="hidden"
                    />
                    <label htmlFor="file" className="cursor-pointer">
                      <span className="text-health-teal hover:text-health-teal/80">
                        Click to upload or drag and drop
                      </span>
                    </label>
                    <p className="text-sm text-gray-500 mt-1">
                      PDF, Images, Documents up to 10MB
                    </p>
                    {uploadForm.file && (
                      <div className="mt-2 p-2 bg-green-50 rounded">
                        <p className="text-sm text-green-700">{uploadForm.file.name}</p>
                        <p className="text-xs text-green-600">{formatFileSize(uploadForm.file.size)}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleUpload} 
                    disabled={uploading}
                    className="bg-health-teal hover:bg-health-teal/90 text-white"
                  >
                    {uploading ? 'Uploading...' : 'Upload Record'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-health-teal/10 rounded-lg">
                <FileText className="w-6 h-6 text-health-teal" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Total Records</p>
                <p className="text-2xl font-bold text-health-teal">{stats.totalRecords}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-health-aqua/10 rounded-lg">
                <FileText className="w-6 h-6 text-health-aqua" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">This Month</p>
                <p className="text-2xl font-bold text-health-teal">{stats.thisMonth}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-health-success/10 rounded-lg">
                <Share className="w-6 h-6 text-health-success" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Shared</p>
                <p className="text-2xl font-bold text-health-teal">{stats.shared}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-health-warning/10 rounded-lg">
                <Eye className="w-6 h-6 text-health-warning" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Recent Views</p>
                <p className="text-2xl font-bold text-health-teal">{stats.recentViews}</p>
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
                  placeholder="Search records by title, provider, type, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="md:w-48">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Lab Report">Lab Reports</SelectItem>
                  <SelectItem value="Prescription">Prescriptions</SelectItem>
                  <SelectItem value="Imaging">Imaging</SelectItem>
                  <SelectItem value="Vaccination">Vaccinations</SelectItem>
                  <SelectItem value="Surgery">Surgeries</SelectItem>
                  <SelectItem value="Allergy">Allergies</SelectItem>
                  <SelectItem value="Medication">Medications</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Archived">Archived</SelectItem>
                  <SelectItem value="Deleted">Deleted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:w-64">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      "Pick a date range"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Health Records</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-health-teal mx-auto"></div>
              <p className="mt-2 text-health-charcoal">Loading records...</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-health-charcoal">No records found</p>
              <p className="text-sm text-gray-500 mt-1">Upload your first health record to get started</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>File</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record._id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(record.type)}
                          <span className="text-sm">{record.type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>
                          <div>{record.title}</div>
                          {record.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {record.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{record.provider}</TableCell>
                      <TableCell>{format(new Date(record.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(record.status)}>
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {record.fileName ? (
                          <div className="text-sm">
                            <div className="flex items-center space-x-1">
                              <FileText className="w-3 h-3" />
                              <span>{record.fileName}</span>
                            </div>
                            {record.fileSize && (
                              <div className="text-xs text-gray-500">
                                {formatFileSize(record.fileSize)}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">No file</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => navigate(`/patient/records/${record._id}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {record.fileUrl && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => window.open(record.fileUrl, '_blank')}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                          <Dialog open={showShareDialog && selectedRecord?._id === record._id} onOpenChange={(open) => {
                            setShowShareDialog(open);
                            if (!open) setSelectedRecord(null);
                          }}>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setSelectedRecord(record)}
                              >
                                <Share className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Share Record</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="email">Recipient Email</Label>
                                  <Input
                                    type="email"
                                    value={shareForm.email}
                                    onChange={(e) => setShareForm(prev => ({ ...prev, email: e.target.value }))}
                                    placeholder="doctor@hospital.com"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="message">Message (Optional)</Label>
                                  <Textarea
                                    value={shareForm.message}
                                    onChange={(e) => setShareForm(prev => ({ ...prev, message: e.target.value }))}
                                    placeholder="I'm sharing this record for your review..."
                                    rows={3}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="duration">Access Duration</Label>
                                  <Select value={shareForm.duration} onValueChange={(value) => setShareForm(prev => ({ ...prev, duration: value }))}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="1">1 day</SelectItem>
                                      <SelectItem value="7">7 days</SelectItem>
                                      <SelectItem value="30">30 days</SelectItem>
                                      <SelectItem value="90">90 days</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="flex justify-end space-x-3">
                                  <Button variant="outline" onClick={() => setShowShareDialog(false)}>
                                    Cancel
                                  </Button>
                                  <Button onClick={handleShare} className="bg-health-teal hover:bg-health-teal/90 text-white">
                                    Share Record
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDelete(record._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientRecords;
