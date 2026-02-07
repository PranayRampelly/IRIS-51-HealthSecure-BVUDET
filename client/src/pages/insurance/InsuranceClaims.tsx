
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Search, Filter, Eye, CheckCircle, XCircle, Clock, DollarSign, Plus, RefreshCw, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import insuranceClaimService, { InsuranceClaim } from '@/services/insuranceClaimService';

const InsuranceClaims = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [statistics, setStatistics] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    totalValue: 0
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalClaims: 0,
    hasNext: false,
    hasPrev: false
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [claimTypeFilter, setClaimTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('submittedDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const response = await insuranceClaimService.getClaims({
        page: pagination.currentPage,
        limit: 10,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined,
        claimType: claimTypeFilter !== 'all' ? claimTypeFilter : undefined,
        sortBy,
        sortOrder
      });
      
      // Handle the response structure
      if (response && response.data) {
        setClaims(response.data.claims || []);
        setStatistics(response.data.statistics || {
          pending: 0,
          approved: 0,
          rejected: 0,
          totalValue: 0
        });
        setPagination(response.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalClaims: 0,
          hasNext: false,
          hasPrev: false
        });
      } else {
        // Fallback if response structure is different
        setClaims(response?.claims || []);
        setStatistics(response?.statistics || {
          pending: 0,
          approved: 0,
          rejected: 0,
          totalValue: 0
        });
        setPagination(response?.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalClaims: 0,
          hasNext: false,
          hasPrev: false
        });
      }
    } catch (error) {
      console.error('Error fetching claims:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch claims',
        variant: 'destructive'
      });
      // Set empty data on error
      setClaims([]);
      setStatistics({
        pending: 0,
        approved: 0,
        rejected: 0,
        totalValue: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [pagination.currentPage, statusFilter, claimTypeFilter, sortBy, sortOrder]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== '') {
        setPagination(prev => ({ ...prev, currentPage: 1 }));
        fetchClaims();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleStatusUpdate = (claimId: string, newStatus: InsuranceClaim['status'], approvedAmount?: number) => {
    try {
      setUpdating(claimId);
      if (newStatus === 'draft') {
        insuranceClaimService.saveDraft({ id: claimId, status: newStatus, approvedAmount, reviewNotes: `Status updated to ${newStatus}` });
      } else {
        insuranceClaimService.submitClaim(claimId, { status: newStatus, approvedAmount, reviewNotes: `Status updated to ${newStatus}` });
      }
      toast({
        title: 'Success',
        description: `Claim ${newStatus} successfully`,
      });
      fetchClaims();
    } catch (error) {
      console.error('Error updating claim status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update claim status',
        variant: 'destructive'
      });
    } finally {
      setUpdating(null);
    }
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: InsuranceClaim['status']) => {
    return insuranceClaimService.getStatusColor(status);
  };

  const getPriorityColor = (priority: InsuranceClaim['priority']) => {
    return insuranceClaimService.getPriorityColor(priority);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-health-teal" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-montserrat font-bold text-health-teal">Claim Requests</h1>
          <p className="text-health-charcoal mt-2">Review and process insurance claims</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={fetchClaims} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => navigate('/insurance/claims/new')} className="bg-health-teal hover:bg-health-teal/90">
            <Plus className="w-4 h-4 mr-2" />
            New Claim
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-health-warning/10 rounded-lg">
                <Clock className="w-6 h-6 text-health-warning" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Pending Claims</p>
                <p className="text-2xl font-bold text-health-teal">{statistics.pending}</p>
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
                <p className="text-sm text-health-charcoal">Approved Today</p>
                <p className="text-2xl font-bold text-health-teal">{statistics.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-health-danger/10 rounded-lg">
                <XCircle className="w-6 h-6 text-health-danger" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Rejected</p>
                <p className="text-2xl font-bold text-health-teal">{statistics.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-health-aqua/10 rounded-lg">
                <DollarSign className="w-6 h-6 text-health-aqua" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Total Value</p>
                <p className="text-2xl font-bold text-health-teal">
                  {insuranceClaimService.formatAmount(statistics.totalValue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-health-blue-gray w-4 h-4" />
                <Input
                  placeholder="Search by claim ID, patient, or provider..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="requires_proof">Requires Proof</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={claimTypeFilter} onValueChange={setClaimTypeFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="medical">Medical</SelectItem>
                  <SelectItem value="dental">Dental</SelectItem>
                  <SelectItem value="vision">Vision</SelectItem>
                  <SelectItem value="pharmacy">Pharmacy</SelectItem>
                  <SelectItem value="mental_health">Mental Health</SelectItem>
                  <SelectItem value="rehabilitation">Rehabilitation</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                const [field, order] = value.split('-');
                setSortBy(field);
                setSortOrder(order as 'asc' | 'desc');
              }}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="submittedDate-desc">Newest First</SelectItem>
                  <SelectItem value="submittedDate-asc">Oldest First</SelectItem>
                  <SelectItem value="claimAmount-desc">Amount High-Low</SelectItem>
                  <SelectItem value="claimAmount-asc">Amount Low-High</SelectItem>
                  <SelectItem value="priority-desc">Priority High-Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Claims Table */}
      <Card>
        <CardHeader>
          <CardTitle>Claims Queue ({pagination.totalClaims} total)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Claim ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {claims.map((claim) => (
                <TableRow key={claim._id}>
                  <TableCell className="font-mono text-sm">{claim.claimId}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{claim.patientName}</div>
                      <div className="text-sm text-gray-500">{claim.patientEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>{claim.providerName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {insuranceClaimService.getClaimTypeDisplay(claim.claimType)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {insuranceClaimService.formatAmount(claim.claimAmount)}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(claim.status)}>
                      {claim.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(claim.priority)}>
                      {claim.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(claim.submittedDate)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate(`/insurance/claims/${claim._id}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {claim.status === 'pending' && (
                        <>
                          <Button 
                            size="sm" 
                            className="bg-health-success hover:bg-health-success/90 text-white"
                            onClick={() => handleStatusUpdate(claim._id, 'approved', claim.claimAmount)}
                            disabled={updating === claim._id}
                          >
                            {updating === claim._id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                            <CheckCircle className="w-4 h-4" />
                            )}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleStatusUpdate(claim._id, 'rejected')}
                            disabled={updating === claim._id}
                          >
                            {updating === claim._id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                            <XCircle className="w-4 h-4" />
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Showing page {pagination.currentPage} of {pagination.totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrev}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNext}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InsuranceClaims;
