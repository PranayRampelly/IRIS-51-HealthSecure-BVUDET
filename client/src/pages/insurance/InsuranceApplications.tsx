import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText,
  Calendar,
  User,
  Building,
  DollarSign,
  AlertTriangle,
  Plus,
  RefreshCw,
  BarChart3,
  TrendingUp,
  Users,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import insuranceApplicationService from '@/services/insuranceApplicationService';
import insurancePolicyService from '@/services/insurancePolicyService';

interface InsuranceApplication {
  _id: string;
  applicationNumber: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'pending_documents';
  policyId: {
    _id: string;
    policyName: string;
    policyType: string;
    premium: {
      amount: number;
      frequency: string;
    };
    coverageAmount: number;
  };
  applicant: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
  };
  coverage: {
    startDate: string;
    coverageAmount: number;
  };
  submittedAt?: string;
  reviewedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  patientId: string;
  reviewedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ApplicationStatistics {
  total: number;
  draft: number;
  submitted: number;
  under_review: number;
  approved: number;
  rejected: number;
  pending_documents: number;
  approvalRate: number;
  averageProcessingTime: number;
}

const InsuranceApplications: React.FC = () => {
  const { toast } = useToast();
  const [applications, setApplications] = useState<InsuranceApplication[]>([]);
  const [statistics, setStatistics] = useState<ApplicationStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [policyTypeFilter, setPolicyTypeFilter] = useState<string>('all');
  const [selectedApplication, setSelectedApplication] = useState<InsuranceApplication | null>(null);
  const [showApplicationDetails, setShowApplicationDetails] = useState(false);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [hasInsuranceRole, setHasInsuranceRole] = useState<boolean | null>(null);
  const [policies, setPolicies] = useState<any[]>([]);
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>('all');
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [approveForm, setApproveForm] = useState({ approvalNotes: '', effectiveDate: '' });

  // Check user role on component mount
  useEffect(() => {
    const checkUserRole = () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const userRole = payload.role;
          console.log('User role detected:', userRole); // Debug log
          setHasInsuranceRole(userRole === 'insurance');
        } else {
          console.log('No token found'); // Debug log
          setHasInsuranceRole(false);
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        setHasInsuranceRole(false);
      }
    };
    
    checkUserRole();
    // Force show insurance content for testing
    setHasInsuranceRole(true);
  }, []);

  // Fetch applications and statistics
  useEffect(() => {
    if (hasInsuranceRole) {
      loadPolicies();
      fetchApplications();
      fetchStatistics();
    }
  }, [hasInsuranceRole]);

  // Load available policies
  const loadPolicies = async () => {
    try {
      console.log('🔍 Loading policies...');
      const response = await insurancePolicyService.getPolicies();
      const policyList = response.policies || [];
      console.log('🔍 Loaded policies:', policyList.length);
      setPolicies(policyList);
    } catch (error) {
      console.error('Error loading policies:', error);
      setPolicies([]);
    }
  };

  // Fetch applications by selected policy
  const fetchApplications = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching applications for policy:', selectedPolicyId);
      
      // Build backend filters
      const filters: any = {};
      if (statusFilter && statusFilter !== 'all') filters.status = statusFilter;
      if (policyTypeFilter && policyTypeFilter !== 'all') filters.policyType = policyTypeFilter;
      if (searchTerm) filters.search = searchTerm;
      
      let response;
      if (selectedPolicyId === 'all') {
        response = await insuranceApplicationService.getAllApplications(filters);
      } else {
        response = await insuranceApplicationService.getApplicationsByPolicyId(selectedPolicyId, filters);
      }
      
      console.log('🔍 Full API Response:', response);
      
      // Handle different response structures
      let apps = [];
      if (response?.data?.applications) {
        apps = response.data.applications;
      } else if (response?.applications) {
        apps = response.applications;
      } else if (Array.isArray(response)) {
        apps = response;
      } else if (response?.data && Array.isArray(response.data)) {
        apps = response.data;
      }
      
      console.log('🔍 Extracted applications:', apps);
      console.log('🔍 Number of applications:', apps.length);
      
      setApplications(apps);
      
      // Update statistics based on actual data
      const total = apps.length;
      const approved = apps.filter(app => app.status === 'approved').length;
      const underReview = apps.filter(app => app.status === 'under_review').length;
      const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;
      
      setStatistics({
        total,
        approvalRate,
        under_review: underReview,
        averageProcessingTime: 0,
        draft: apps.filter(app => app.status === 'draft').length,
        submitted: apps.filter(app => app.status === 'submitted').length,
        approved,
        rejected: apps.filter(app => app.status === 'rejected').length,
        pending_documents: apps.filter(app => app.status === 'pending_documents').length
      });
      
    } catch (error) {
      console.error('Error fetching applications:', error);
      if (error.response?.status === 403) {
        console.log('User does not have insurance role permissions');
      } else {
        console.log('Failed to fetch applications:', (error as any).message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto refetch when filters change
  useEffect(() => {
    if (!hasInsuranceRole) return;
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPolicyId, statusFilter, policyTypeFilter]);

  // Debounced refetch when search term changes
  useEffect(() => {
    if (!hasInsuranceRole) return;
    const t = setTimeout(() => {
      fetchApplications();
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const fetchStatistics = async () => {
    try {
      const response = await insuranceApplicationService.getApplicationStatistics();
      setStatistics(response?.data || response);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      // Set fallback statistics based on applications data
      const fallbackStats = {
        total: applications.length,
        approvalRate: 0,
        under_review: applications.filter(app => app.status === 'under_review').length,
        averageProcessingTime: 0
      };
      setStatistics(fallbackStats);
    }
  };

  // Filter applications based on search and filters
  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${app.applicant.firstName} ${app.applicant.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicant.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesPolicyType = policyTypeFilter === 'all' || app.policyId.policyType === policyTypeFilter;
    
    return matchesSearch && matchesStatus && matchesPolicyType;
  });

  // Handle application actions
  const handleApplicationAction = async (applicationId: string, action: string, data?: any) => {
    try {
      setProcessingAction(action);
      
      switch (action) {
        case 'approve':
          await insuranceApplicationService.approveApplication(applicationId, data);
          toast({
            title: "Success",
            description: "Application approved successfully"
          });
          break;
        case 'draft':
          await insuranceApplicationService.updateApplication(applicationId, { status: 'draft' } as any);
          toast({
            title: 'Updated',
            description: 'Application moved to Draft'
          });
          break;
        case 'under_review':
          await insuranceApplicationService.updateApplication(applicationId, { status: 'under_review' } as any);
          toast({
            title: 'Updated',
            description: 'Application moved to Under Review'
          });
          break;
        case 'reject':
          await insuranceApplicationService.rejectApplication(applicationId, data);
          toast({
            title: "Success",
            description: "Application rejected"
          });
          break;
        case 'request_documents':
          await insuranceApplicationService.requestDocuments(applicationId, data);
          toast({
            title: "Success",
            description: "Document request sent"
          });
          break;
        default:
          break;
      }
      
      // Refresh data
      fetchApplications();
      fetchStatistics();
    } catch (error) {
      console.error(`Error ${action}ing application:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} application`,
        variant: "destructive"
      });
    } finally {
      setProcessingAction(null);
    }
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      case 'under_review': return 'secondary';
      case 'pending_documents': return 'outline';
      case 'submitted': return 'secondary';
      case 'draft': return 'outline';
      default: return 'outline';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600';
      case 'rejected': return 'text-red-600';
      case 'under_review': return 'text-blue-600';
      case 'pending_documents': return 'text-orange-600';
      case 'submitted': return 'text-purple-600';
      case 'draft': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate processing time
  const getProcessingTime = (application: InsuranceApplication) => {
    if (!application.submittedAt) return 'Not submitted';
    
    const submitted = new Date(application.submittedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - submitted.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Insurance Applications</h1>
          <p className="text-gray-600 mt-2">
            {selectedPolicyId === 'all' 
              ? 'Manage and review all insurance applications'
              : `Applications for ${policies.find(p => p._id === selectedPolicyId)?.policyName || 'Selected Policy'}`
            }
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={fetchApplications}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => {
            console.log('Manual fetch triggered');
            fetchApplications();
            fetchStatistics();
          }}>
            <Search className="w-4 h-4 mr-2" />
            Fetch Apps
          </Button>
          <Button variant="outline" onClick={() => {
            console.log('Testing policy-specific fetch for:', selectedPolicyId);
            if (selectedPolicyId !== 'all') {
              insuranceApplicationService.getApplicationsByPolicyId(selectedPolicyId)
                .then(response => {
                  console.log('Policy-specific response:', response);
                  const apps = response?.data?.applications || response?.applications || [];
                  console.log('Policy applications found:', apps.length);
                  setApplications(apps);
                })
                .catch(error => {
                  console.error('Policy-specific fetch error:', error);
                });
            }
          }}>
            <FileText className="w-4 h-4 mr-2" />
            Test Policy Fetch
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Show message for non-insurance users */}
      {hasInsuranceRole === false && (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
              <p className="text-gray-500 mb-4">
                This page is only available to insurance agents and administrators.
              </p>
              <p className="text-sm text-gray-400">
                Please contact your administrator if you believe you should have access to this page.
              </p>
              <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-gray-600">
                Debug: Role check result = {hasInsuranceRole === null ? 'Checking...' : hasInsuranceRole ? 'true' : 'false'}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4"
                onClick={() => {
                  console.log('Manual override: Setting insurance role to true');
                  setHasInsuranceRole(true);
                }}
              >
                Override: Show Insurance Content
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Show content for insurance users or while checking */}
      {(hasInsuranceRole === true || hasInsuranceRole === null) && (
        <>
          {/* Approve Dialog */}
          <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Approve Application</DialogTitle>
                <DialogDescription>
                  Add optional approval notes and choose an effective date.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Effective Date</p>
                  <Input
                    type="date"
                    value={approveForm.effectiveDate}
                    onChange={(e) => setApproveForm(prev => ({ ...prev, effectiveDate: e.target.value }))}
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Approval Notes</p>
                  <Textarea
                    placeholder="Notes (optional)"
                    value={approveForm.approvalNotes}
                    onChange={(e) => setApproveForm(prev => ({ ...prev, approvalNotes: e.target.value }))}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowApproveDialog(false)}>Cancel</Button>
                  <Button
                    onClick={async () => {
                      if (!selectedApplication) return;
                      try {
                        setProcessingAction('approve');
                        await insuranceApplicationService.approveApplication(selectedApplication._id, approveForm);
                        toast({ title: 'Success', description: 'Application approved successfully' });
                        setShowApproveDialog(false);
                        setSelectedApplication(null);
                        fetchApplications();
                        fetchStatistics();
                      } catch (err) {
                        toast({ title: 'Error', description: 'Failed to approve application', variant: 'destructive' });
                      } finally {
                        setProcessingAction(null);
                      }
                    }}
                    disabled={processingAction === 'approve'}
                  >
                    Approve
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Statistics Cards */}
          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Applications</p>
                      <p className="text-2xl font-bold text-gray-900">{statistics.total || 0}</p>
                    </div>
                    <FileText className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Approval Rate</p>
                      <p className="text-2xl font-bold text-green-600">{statistics.approvalRate || 0}%</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Under Review</p>
                      <p className="text-2xl font-bold text-blue-600">{statistics.under_review || 0}</p>
                    </div>
                    <Clock className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg. Processing</p>
                      <p className="text-2xl font-bold text-purple-600">{statistics.averageProcessingTime || 0} days</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters and Search */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search by application number, name, or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={selectedPolicyId} onValueChange={(value) => {
                  setSelectedPolicyId(value);
                  // Refetch applications when policy changes
                  setTimeout(() => fetchApplications(), 100);
                }}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Select Policy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Policies</SelectItem>
                    {policies.map((policy) => (
                      <SelectItem key={policy._id} value={policy._id}>
                        {policy.policyName} ({policy.policyType})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="pending_documents">Pending Documents</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={policyTypeFilter} onValueChange={setPolicyTypeFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by policy type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Policy Types</SelectItem>
                    <SelectItem value="Health">Health</SelectItem>
                    <SelectItem value="Dental">Dental</SelectItem>
                    <SelectItem value="Vision">Vision</SelectItem>
                    <SelectItem value="Life">Life</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Applications Table */}
          <Card>
            <CardHeader>
              <CardTitle>Applications ({filteredApplications.length})</CardTitle>
              <CardDescription>
                Review and manage insurance applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading applications...</p>
                  </div>
                </div>
              ) : filteredApplications.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || statusFilter !== 'all' || policyTypeFilter !== 'all' 
                      ? 'Try adjusting your search or filters'
                      : 'There are no insurance applications to review at this time'
                    }
                  </p>
                  {(searchTerm || statusFilter !== 'all' || policyTypeFilter !== 'all') && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('all');
                        setPolicyTypeFilter('all');
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Application #</TableHead>
                        <TableHead>Applicant</TableHead>
                        <TableHead>Policy</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Processing Time</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.map((application) => (
                        <TableRow key={application._id}>
                          <TableCell className="font-medium">
                            {application.applicationNumber}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {application.applicant.firstName} {application.applicant.lastName}
                              </p>
                              <p className="text-sm text-gray-500">{application.applicant.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{application.policyId.policyName}</p>
                              <p className="text-sm text-gray-500">
                                ${application.policyId.premium.amount}/{application.policyId.premium.frequency}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(application.status)}>
                              {application.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {application.submittedAt ? formatDate(application.submittedAt) : 'Not submitted'}
                          </TableCell>
                          <TableCell>
                            <span className={getStatusColor(application.status)}>
                              {getProcessingTime(application)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedApplication(application);
                                  setShowApplicationDetails(true);
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              
                              {(application.status === 'submitted') && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedApplication(application);
                                      setApproveForm({ approvalNotes: '', effectiveDate: '' });
                                      setShowApproveDialog(true);
                                    }}
                                    disabled={processingAction === 'approve'}
                                  >
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleApplicationAction(application._id, 'reject')}
                                    disabled={processingAction === 'reject'}
                                  >
                                    <XCircle className="w-4 h-4 text-red-600" />
                                  </Button>
                                </>
                              )}
                              
                              {application.status === 'under_review' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleApplicationAction(application._id, 'request_documents')}
                                  disabled={processingAction === 'request_documents'}
                                >
                                  <FileText className="w-4 h-4" />
                                </Button>
                              )}

                              {/* Removed: Move to Draft button */}

                              {/* Move to Under Review (available when submitted) */}
                              {application.status === 'submitted' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleApplicationAction(application._id, 'under_review')}
                                  disabled={processingAction === 'under_review'}
                                  title="Move to Under Review"
                                >
                                  <Clock className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Application Details Dialog */}
      <Dialog open={showApplicationDetails} onOpenChange={setShowApplicationDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Review complete application information
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-6">
              {/* Application Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedApplication.applicationNumber}
                  </h3>
                  <p className="text-gray-600">
                    {selectedApplication.applicant.firstName} {selectedApplication.applicant.lastName}
                  </p>
                </div>
                <Badge variant={getStatusBadgeVariant(selectedApplication.status)}>
                  {selectedApplication.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>

              {/* Applicant Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Applicant Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Full Name</p>
                      <p className="font-medium">
                        {selectedApplication.applicant.firstName} {selectedApplication.applicant.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{selectedApplication.applicant.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{selectedApplication.applicant.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date of Birth</p>
                      <p className="font-medium">{formatDate(selectedApplication.applicant.dateOfBirth)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Policy Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Policy Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Policy Name</p>
                      <p className="font-medium">{selectedApplication.policyId.policyName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Policy Type</p>
                      <p className="font-medium">{selectedApplication.policyId.policyType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Premium</p>
                      <p className="font-medium">
                        ${selectedApplication.policyId.premium.amount}/{selectedApplication.policyId.premium.frequency}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Coverage Amount</p>
                      <p className="font-medium">${selectedApplication.policyId.coverageAmount.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Application Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                      <div>
                        <p className="font-medium">Application Created</p>
                        <p className="text-sm text-gray-600">{formatDate(selectedApplication.createdAt)}</p>
                      </div>
                    </div>
                    
                    {selectedApplication.submittedAt && (
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                        <div>
                          <p className="font-medium">Application Submitted</p>
                          <p className="text-sm text-gray-600">{formatDate(selectedApplication.submittedAt)}</p>
                        </div>
                      </div>
                    )}
                    
                    {selectedApplication.reviewedAt && (
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                        <div>
                          <p className="font-medium">Application Reviewed</p>
                          <p className="text-sm text-gray-600">{formatDate(selectedApplication.reviewedAt)}</p>
                        </div>
                      </div>
                    )}
                    
                    {selectedApplication.approvedAt && (
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                        <div>
                          <p className="font-medium">Application Approved</p>
                          <p className="text-sm text-gray-600">{formatDate(selectedApplication.approvedAt)}</p>
                        </div>
                      </div>
                    )}
                    
                    {selectedApplication.rejectedAt && (
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                        <div>
                          <p className="font-medium">Application Rejected</p>
                          <p className="text-sm text-gray-600">{formatDate(selectedApplication.rejectedAt)}</p>
                          {selectedApplication.rejectionReason && (
                            <p className="text-sm text-red-600 mt-1">{selectedApplication.rejectionReason}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowApplicationDetails(false)}
                >
                  Close
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    if (!selectedApplication) return;
                    await handleApplicationAction(selectedApplication._id, 'draft');
                  }}
                  disabled={
                    processingAction === 'draft' || selectedApplication.status === 'draft'
                  }
                  title={
                    selectedApplication.status === 'draft'
                      ? 'Already in Draft'
                      : 'Move to Draft'
                  }
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Draft
                </Button>
                <Button
                  onClick={() => {
                    if (!selectedApplication) return;
                    setApproveForm({ approvalNotes: '', effectiveDate: '' });
                    setShowApproveDialog(true);
                  }}
                  disabled={
                    processingAction === 'approve' ||
                    !(selectedApplication.status === 'submitted' || selectedApplication.status === 'under_review')
                  }
                  className="bg-health-teal text-white hover:bg-health-teal/90"
                  title={
                    selectedApplication.status === 'submitted' || selectedApplication.status === 'under_review'
                      ? 'Approve application'
                      : 'Approve is enabled only for Submitted or Under Review applications'
                  }
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InsuranceApplications; 