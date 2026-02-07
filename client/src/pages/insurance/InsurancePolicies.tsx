
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Shield, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  Users,
  Activity,
  CreditCard,
  Building,
  Heart,
  Stethoscope,
  Pill,
  Brain,
  Baby,
  Car,
  Home,
  Plane,
  User,
  Settings,
  Upload,
  Save,
  Loader2
} from 'lucide-react';
import insurancePolicyService, { 
  InsurancePolicy, 
  PolicyFilters, 
  PolicyResponse, 
  PolicyStatistics,
  CoverageService,
  NetworkProvider
} from '@/services/insurancePolicyService';
import { useNavigate } from 'react-router-dom';

const InsurancePolicies = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPolicy, setSelectedPolicy] = useState<InsurancePolicy | null>(null);
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [statistics, setStatistics] = useState<PolicyStatistics>({});
  const [loading, setLoading] = useState(true);
  const [creatingPolicy, setCreatingPolicy] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalPolicies: 0,
    hasNext: false,
    hasPrev: false
  });
  const [analytics, setAnalytics] = useState<any>({});
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  // New policy form state
  const [newPolicy, setNewPolicy] = useState<Partial<InsurancePolicy>>({
    policyNumber: '',
    policyName: '',
    policyType: 'Health',
    description: '',
    coverageAmount: 0,
    deductible: 0,
    coinsurance: 0,
      copay: 0,
    outOfPocketMax: 0,
    premium: {
      amount: 0,
      frequency: 'monthly'
    },
    startDate: '',
    endDate: '',
    status: 'active',
    isPublic: false,
    availableForNewEnrollments: true,
    eligibilityCriteria: {
      minAge: 0,
      maxAge: 100,
      preExistingConditions: false,
      waitingPeriod: 0,
      requiredDocuments: []
    },
    coverageDetails: {
      services: [],
      exclusions: [],
      networkType: 'PPO'
    },
    networkProviders: [],
    documents: [],
    tags: []
  });

  // Document upload state
  const [uploadingDocuments, setUploadingDocuments] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [documentType, setDocumentType] = useState('policy_document');

  const navigate = useNavigate();

  // Load policies on component mount
  useEffect(() => {
    loadPolicies();
    loadStatistics();
    loadAnalytics();
  }, []);

  // Reload policies when pagination changes
  useEffect(() => {
    if (pagination.currentPage > 1) {
      loadPolicies();
    }
  }, [pagination.currentPage]);

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadPolicies();
        loadAnalytics();
      }, 30000); // Refresh every 30 seconds
      setRefreshInterval(interval);
    } else if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [autoRefresh]);

  // Load policies with filters
  const loadPolicies = async (filters: PolicyFilters = {}) => {
    try {
      setLoading(true);
      const response: PolicyResponse = await insurancePolicyService.getPolicies({
        page: pagination.currentPage,
        limit: 10,
        status: filterStatus === 'all' ? undefined : filterStatus,
        search: searchTerm || undefined,
        ...filters
      });
      
      setPolicies(response.policies || []);
      setPagination(response.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalPolicies: 0,
        hasNext: false,
        hasPrev: false
      });
      
      // Set statistics and recent activity from the enhanced response
      if (response.statistics) {
        setStatistics(response.statistics);
      }
      if (response.recentActivity) {
        setRecentActivity(response.recentActivity);
      }
    } catch (error) {
      console.error('Error loading policies:', error);
      // Don't show error toast, just set empty data
      setPolicies([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalPolicies: 0,
        hasNext: false,
        hasPrev: false
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle pagination change
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  // Load statistics
  const loadStatistics = async () => {
    try {
      const response = await insurancePolicyService.getPolicyStatistics();
      setStatistics(response.data || {});
    } catch (error) {
      console.error('Error loading statistics:', error);
      // Don't show error, just set empty statistics
      setStatistics({});
    }
  };

  // Load analytics data
  const loadAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const response = await insurancePolicyService.getPolicyAnalytics('12months');
      setAnalytics(response.data || {});
    } catch (error) {
      console.error('Error loading analytics:', error);
      setAnalytics({});
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Create new policy
  const handleCreatePolicy = async () => {
    try {
      setCreatingPolicy(true);
      
      // Generate policy number if not provided
      if (!newPolicy.policyNumber) {
        newPolicy.policyNumber = insurancePolicyService.generatePolicyNumber();
      }

      const response = await insurancePolicyService.createPolicy(newPolicy);
      
      toast({
        title: 'Success',
        description: response.message,
      });

      // Reset form and reload policies
      setNewPolicy({
        policyNumber: '',
        policyName: '',
        policyType: 'Health',
        description: '',
        coverageAmount: 0,
      deductible: 0,
        coinsurance: 0,
      copay: 0,
        outOfPocketMax: 0,
        premium: {
          amount: 0,
          frequency: 'monthly'
        },
        startDate: '',
        endDate: '',
        status: 'active',
        isPublic: false,
        availableForNewEnrollments: true,
        eligibilityCriteria: {
          minAge: 0,
          maxAge: 100,
          preExistingConditions: false,
          waitingPeriod: 0,
          requiredDocuments: []
        },
        coverageDetails: {
          services: [],
          exclusions: [],
          networkType: 'PPO'
        },
        networkProviders: [],
        documents: [],
        tags: []
      });
      
      loadPolicies();
    } catch (error) {
      console.error('Error creating policy:', error);
      toast({
        title: 'Error',
        description: 'Failed to create policy',
        variant: 'destructive'
      });
    } finally {
      setCreatingPolicy(false);
    }
  };

  // Upload documents
  const handleUploadDocuments = async (policyId: string) => {
    if (selectedFiles.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select a file to upload',
        variant: 'destructive'
      });
      return;
    }

    try {
      setUploadingDocuments(true);
      const response = await insurancePolicyService.uploadPolicyDocuments(
        policyId,
        selectedFiles
      );
      
      toast({
        title: 'Success',
        description: 'Document uploaded successfully',
      });

      setSelectedFiles([]);
      setDocumentType('policy_document');
      loadPolicies();
    } catch (error) {
      console.error('Error uploading documents:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload document',
        variant: 'destructive'
      });
    } finally {
      setUploadingDocuments(false);
    }
  };

  // Delete policy
  const handleDeletePolicy = async (policyId: string) => {
    if (!confirm('Are you sure you want to delete this policy?')) {
      return;
    }

    try {
      await insurancePolicyService.deletePolicy(policyId);
      toast({
        title: 'Success',
        description: 'Policy deleted successfully',
      });
      loadPolicies();
    } catch (error) {
      console.error('Error deleting policy:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete policy',
        variant: 'destructive'
      });
    }
  };

  // Approve policy
  const handleApprovePolicy = async (policyId: string) => {
    try {
      await insurancePolicyService.approvePolicy(policyId);
      toast({
        title: 'Success',
        description: 'Policy approved successfully',
      });
      loadPolicies();
    } catch (error) {
      console.error('Error approving policy:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve policy',
        variant: 'destructive'
      });
    }
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  // Add coverage service
  const addCoverageService = () => {
    setNewPolicy(prev => ({
      ...prev,
      coverageDetails: {
        ...prev.coverageDetails!,
        services: [
          ...(prev.coverageDetails?.services || []),
          {
            name: '',
            description: '',
            coveragePercentage: 0,
            limits: '',
            waitingPeriod: 0
          }
        ]
      }
    }));
  };

  // Remove coverage service
  const removeCoverageService = (index: number) => {
    setNewPolicy(prev => ({
      ...prev,
      coverageDetails: {
        ...prev.coverageDetails!,
        services: prev.coverageDetails?.services.filter((_, i) => i !== index) || []
      }
    }));
  };

  // Update coverage service
  const updateCoverageService = (index: number, field: keyof CoverageService, value: string | number) => {
    setNewPolicy(prev => ({
      ...prev,
      coverageDetails: {
        ...prev.coverageDetails!,
        services: prev.coverageDetails?.services.map((service, i) => 
          i === index ? { ...service, [field]: value } : service
        ) || []
      }
    }));
  };

  // Add network provider
  const addNetworkProvider = () => {
    setNewPolicy(prev => ({
      ...prev,
      networkProviders: [
        ...(prev.networkProviders || []),
        {
          name: '',
          type: 'Hospital',
          location: {},
          contact: {}
        }
      ]
    }));
  };

  // Remove network provider
  const removeNetworkProvider = (index: number) => {
    setNewPolicy(prev => ({
      ...prev,
      networkProviders: prev.networkProviders?.filter((_, i) => i !== index) || []
    }));
  };

  // Update network provider
  const updateNetworkProvider = (index: number, field: string, value: string | object) => {
    setNewPolicy(prev => ({
      ...prev,
      networkProviders: prev.networkProviders?.map((provider, i) => 
        i === index ? { ...provider, [field]: value } : provider
      ) || []
    }));
  };

  // Delete policy document
  const handleDeletePolicyDocument = async (policyId: string, documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await insurancePolicyService.deletePolicyDocument(policyId, documentId);
      toast({
        title: 'Success',
        description: 'Document deleted successfully',
      });
      loadPolicies();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete document',
        variant: 'destructive'
      });
    }
  };

  // Analytics data
  const premiumData = [
    { month: 'Jan', collected: 125000, expected: 120000 },
    { month: 'Feb', collected: 118000, expected: 120000 },
    { month: 'Mar', collected: 132000, expected: 120000 },
    { month: 'Apr', collected: 115000, expected: 120000 },
    { month: 'May', collected: 128000, expected: 120000 },
    { month: 'Jun', collected: 140000, expected: 120000 }
  ];

  const policyTypeData = [
    { name: 'Health', value: 45, color: '#0EA5E9' },
    { name: 'Dental', value: 25, color: '#10B981' },
    { name: 'Vision', value: 15, color: '#F59E0B' },
    { name: 'Life', value: 10, color: '#EF4444' },
    { name: 'Disability', value: 5, color: '#8B5CF6' }
  ];

  const statusData = [
    { name: 'Active', value: 75, color: '#10B981' },
    { name: 'Pending', value: 15, color: '#F59E0B' },
    { name: 'Expired', value: 10, color: '#EF4444' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-health-success text-white';
      case 'pending': return 'bg-health-warning text-white';
      case 'expired': return 'bg-health-danger text-white';
      case 'cancelled': return 'bg-health-charcoal text-white';
      default: return 'bg-health-blue-gray text-white';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'health': return <Heart className="w-4 h-4" />;
      case 'dental': return <Stethoscope className="w-4 h-4" />;
      case 'vision': return <Eye className="w-4 h-4" />;
      case 'life': return <Shield className="w-4 h-4" />;
      case 'disability': return <Activity className="w-4 h-4" />;
      case 'mental health': return <Brain className="w-4 h-4" />;
      case 'maternity': return <Baby className="w-4 h-4" />;
      case 'auto': return <Car className="w-4 h-4" />;
      case 'home': return <Home className="w-4 h-4" />;
      case 'travel': return <Plane className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = policy.policyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || policy.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Calculate metrics from real data
  const totalPolicies = policies.length;
  const activePolicies = policies.filter(p => p.status === 'active').length;
  const totalPremiums = policies.reduce((sum, p) => sum + (p.premium?.amount || 0), 0);
  const totalCoverage = policies.reduce((sum, p) => sum + p.coverageAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-montserrat font-bold text-health-teal">Insurance Policies</h1>
          <p className="text-health-charcoal mt-2">Manage and monitor all insurance policies and coverage details</p>
          {autoRefresh && (
            <div className="flex items-center space-x-2 mt-2">
              <div className="w-2 h-2 bg-health-success rounded-full animate-pulse"></div>
              <span className="text-sm text-health-success">Auto-refreshing every 30 seconds</span>
            </div>
          )}
        </div>
        <div className="flex space-x-3">
          <Button className="bg-health-success hover:bg-health-success/90 text-white">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button 
            variant="outline"
            onClick={() => {
              loadPolicies();
              loadAnalytics();
            }}
            disabled={loading || analyticsLoading}
          >
            <Loader2 className={`w-4 h-4 mr-2 ${(loading || analyticsLoading) ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
          <Button 
            variant={autoRefresh ? "default" : "outline"}
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? "bg-health-success text-white" : ""}
          >
            <Activity className="w-4 h-4 mr-2" />
            {autoRefresh ? "Auto-Refresh ON" : "Auto-Refresh OFF"}
          </Button>
          <Button 
            className="bg-health-warning hover:bg-health-warning/90 text-white"
            onClick={async () => {
              try {
                await insurancePolicyService.createSamplePolicies();
                toast({
                  title: 'Success',
                  description: 'Sample policies created successfully',
                });
                loadPolicies();
                loadAnalytics();
              } catch (error) {
                console.error('Error creating sample policies:', error);
                toast({
                  title: 'Error',
                  description: 'Failed to create sample policies',
                  variant: 'destructive'
                });
              }
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Sample Data
          </Button>
          <Button 
            className="bg-health-teal hover:bg-health-teal/90 text-white"
            onClick={() => navigate('/insurance/policies/create')}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Policy
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-health-charcoal">Total Policies</p>
                <p className="text-3xl font-bold text-health-teal">
                  {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : totalPolicies}
                </p>
                <p className="text-xs text-health-success">
                  {statistics.active?.count || 0} active
                </p>
              </div>
              <div className="p-3 bg-health-teal/10 rounded-full">
                <FileText className="w-6 h-6 text-health-teal" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-health-charcoal">Active Policies</p>
                <p className="text-3xl font-bold text-health-success">
                  {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : activePolicies}
                </p>
                <p className="text-xs text-health-charcoal/70">
                  {totalPolicies > 0 ? Math.round((activePolicies / totalPolicies) * 100) : 0}% of total
                </p>
              </div>
              <div className="p-3 bg-health-success/10 rounded-full">
                <CheckCircle className="w-6 h-6 text-health-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-health-charcoal">Total Premiums</p>
                <p className="text-3xl font-bold text-health-aqua">
                  {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : `$${totalPremiums.toLocaleString()}`}
                </p>
                <p className="text-xs text-health-success">
                  {statistics.active?.totalPremium ? `$${statistics.active.totalPremium.toLocaleString()}` : '$0'} active
                </p>
              </div>
              <div className="p-3 bg-health-aqua/10 rounded-full">
                <DollarSign className="w-6 h-6 text-health-aqua" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-health-charcoal">Total Coverage</p>
                <p className="text-3xl font-bold text-health-teal">
                  {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : `$${totalCoverage.toLocaleString()}`}
                </p>
                <p className="text-xs text-health-charcoal/70">Across all policies</p>
              </div>
              <div className="p-3 bg-health-warning/10 rounded-full">
                <Shield className="w-6 h-6 text-health-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="policies">All Policies</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Premium Collection Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Premium Collection Trends</CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : analytics.premiumTrends ? (
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={analytics.premiumTrends.map((item: any) => ({
                      month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
                      collected: item.totalPremium,
                      expected: item.totalPremium * 0.9 // Estimate expected
                    }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="collected" stackId="1" stroke="#0EA5E9" fill="#0EA5E9" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="expected" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
                ) : (
                  <div className="text-center text-gray-500 h-64 flex items-center justify-center">
                    No premium trend data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Policy Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Policy Distribution by Type</CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : analytics.policyTypeDistribution ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                        data={analytics.policyTypeDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                        dataKey="count"
                        label={({ _id, count }) => `${_id} ${count}`}
                    >
                        {analytics.policyTypeDistribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={getTypeIcon(entry._id)} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                ) : (
                  <div className="text-center text-gray-500 h-64 flex items-center justify-center">
                    No policy distribution data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Policy Status */}
            <Card>
              <CardHeader>
                <CardTitle>Policy Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : analytics.statusDistribution ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                        data={analytics.statusDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                        dataKey="count"
                        label={({ _id, count }) => `${_id} ${count}`}
                    >
                        {analytics.statusDistribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={getStatusColor(entry._id)} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                ) : (
                  <div className="text-center text-gray-500 h-64 flex items-center justify-center">
                    No status data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Policy Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : recentActivity.length > 0 ? (
                <div className="space-y-4">
                    {recentActivity.slice(0, 5).map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="p-2 bg-health-success/10 rounded-full">
                      <CheckCircle className="w-4 h-4 text-health-success" />
                    </div>
                    <div className="flex-1">
                          <p className="font-medium">{activity.action}</p>
                          <p className="text-sm text-health-charcoal/70">
                            {activity.policyNumber} - {activity.policyName}
                          </p>
                          <p className="text-xs text-health-charcoal/50">
                            {new Date(activity.updatedAt).toLocaleDateString()}
                          </p>
                    </div>
                        <Badge className={getStatusColor(activity.status)}>
                          {activity.status}
                        </Badge>
                  </div>
                    ))}
                    </div>
                ) : (
                  <div className="text-center text-gray-500 h-64 flex items-center justify-center">
                    No recent activity available
                    </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="policies">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Policies</CardTitle>
                <div className="flex space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-health-charcoal/50 w-4 h-4" />
                    <Input
                      placeholder="Search policies..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="pending_approval">Pending Approval</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                    <Button 
                      variant="outline"
                      onClick={() => loadPolicies()}
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Apply Filters
                    </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Policy</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Premium</TableHead>
                    <TableHead>Coverage</TableHead>
                    <TableHead>Claims</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto" />
                        <p className="mt-2 text-health-charcoal">Loading policies...</p>
                      </TableCell>
                    </TableRow>
                  ) : filteredPolicies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <FileText className="w-12 h-12 text-health-charcoal/30 mx-auto" />
                        <p className="mt-2 text-health-charcoal">No policies found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPolicies.map((policy) => (
                      <TableRow key={policy._id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{policy.policyNumber}</p>
                            <p className="text-sm text-health-charcoal/70">{policy.policyName}</p>
                            {policy.isExpiringSoon && (
                              <Badge variant="destructive" className="text-xs mt-1">
                                Expires in {policy.remainingDays} days
                              </Badge>
                            )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                            <p className="font-medium">
                              {policy.createdBy?.firstName} {policy.createdBy?.lastName}
                            </p>
                            <p className="text-sm text-health-charcoal/70">
                              {policy.createdBy?.email}
                            </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                            <span className="text-lg">{getTypeIcon(policy.policyType)}</span>
                            <span>{policy.policyType}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                          <Badge className={getStatusColor(policy.status)}>
                          {policy.status}
                        </Badge>
                          {policy.isOverdue && (
                            <Badge variant="destructive" className="ml-2 text-xs">
                              Overdue
                            </Badge>
                          )}
                      </TableCell>
                      <TableCell>
                        <div>
                            <p className="font-medium">
                              {insurancePolicyService.formatCurrency(policy.premium?.amount || 0)}
                            </p>
                          <p className="text-sm text-health-charcoal/70">
                              {policy.premium?.frequency || 'monthly'}
                          </p>
                            {policy.premium?.nextDueDate && (
                              <p className="text-xs text-health-charcoal/50">
                                Due: {insurancePolicyService.formatDate(policy.premium.nextDueDate)}
                              </p>
                            )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                            <p className="font-medium">
                              {insurancePolicyService.formatCurrency(policy.coverageAmount)}
                            </p>
                          <p className="text-sm text-health-charcoal/70">
                              Deductible: {insurancePolicyService.formatCurrency(policy.deductible)}
                          </p>
                            <p className="text-xs text-health-charcoal/50">
                              Coinsurance: {policy.coinsurance}%
                            </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                            <p className="font-medium">{policy.claimCount || 0}</p>
                          <p className="text-sm text-health-charcoal/70">
                              {policy.averageClaimAmount ? insurancePolicyService.formatCurrency(policy.averageClaimAmount) : '$0'} avg
                          </p>
                            {policy.utilizationRate !== undefined && (
                              <p className="text-xs text-health-charcoal/50">
                                {policy.utilizationRate.toFixed(1)}% utilization
                              </p>
                            )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedPolicy(policy)}
                            >
                            <Eye className="w-4 h-4" />
                          </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedPolicy(policy)}
                            >
                            <Edit className="w-4 h-4" />
                          </Button>
                            {policy.status === 'pending_approval' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-health-success"
                                onClick={() => handleApprovePolicy(policy._id!)}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-health-danger"
                              onClick={() => handleDeletePolicy(policy._id!)}
                            >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              
              {/* Pagination Controls */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <div className="text-sm text-gray-700">
                    Showing {((pagination.currentPage - 1) * 10) + 1} to{' '}
                    {Math.min(pagination.currentPage * 10, pagination.totalPolicies)} of{' '}
                    {pagination.totalPolicies} policies
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
                    <span className="flex items-center px-3 text-sm">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
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
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Premium Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Premium Performance by Policy Type</CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : analytics.premiumPerformance ? (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.premiumPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="_id" />
                    <YAxis />
                    <Tooltip />
                      <Bar dataKey="totalPremium" fill="#0EA5E9" name="Total Premium" />
                      <Bar dataKey="totalClaims" fill="#EF4444" name="Total Claims" />
                  </BarChart>
                </ResponsiveContainer>
                ) : (
                  <div className="text-center text-gray-500 h-64 flex items-center justify-center">
                    No analytics data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Coverage Utilization */}
            <Card>
              <CardHeader>
                <CardTitle>Coverage Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : analytics.coverageUtilization ? (
                <div className="space-y-4">
                    {analytics.coverageUtilization.slice(0, 5).map((policy: any) => (
                      <div key={policy.policyNumber} className="space-y-2">
                      <div className="flex justify-between text-sm">
                          <span className="font-medium">{policy.policyNumber}</span>
                          <span className="text-gray-600">
                            {policy.utilizationRate.toFixed(1)}% used
                          </span>
                      </div>
                      <Progress 
                          value={policy.utilizationRate} 
                        className="h-2"
                      />
                        <div className="text-xs text-gray-500">
                          {policy.policyName} • {policy.policyType}
                        </div>
                    </div>
                  ))}
                </div>
                ) : (
                  <div className="text-center text-gray-500 h-64 flex items-center justify-center">
                    No utilization data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Network Provider Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Network Provider Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : analytics.networkDistribution ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics.networkDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                        label={({ type, count }) => `${type}: ${count}`}
                      >
                        {analytics.networkDistribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={getTypeIcon(entry.type)} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-gray-500 h-64 flex items-center justify-center">
                    No network data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Risk Assessment */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment - Top Policies</CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : analytics.riskAssessment ? (
                  <div className="space-y-3">
                    {analytics.riskAssessment.slice(0, 5).map((policy: any) => (
                      <div key={policy.policyNumber} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-sm">{policy.policyNumber}</p>
                            <p className="text-xs text-gray-600">{policy.policyName}</p>
                          </div>
                          <Badge 
                            variant={policy.riskScore > 70 ? "destructive" : policy.riskScore > 40 ? "default" : "secondary"}
                          >
                            Risk: {policy.riskScore.toFixed(1)}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500 space-y-1">
                          <p>Coinsurance: {policy.coinsurance}%</p>
                          <p>Deductible: ${policy.deductible.toLocaleString()}</p>
                          <p>Claims: {policy.claimCount} / {policy.enrollmentCount} enrollments</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 h-64 flex items-center justify-center">
                    No risk assessment data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Expiring Policies Report */}
            <Card>
              <CardHeader>
                <CardTitle>Expiring Policies (Next 30 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : analytics.expiring && analytics.expiring.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.expiring.map((policy: any) => (
                      <div key={policy.policyNumber} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-sm">{policy.policyNumber}</p>
                            <p className="text-xs text-gray-600">{policy.policyName}</p>
                          </div>
                          <Badge 
                            variant={policy.remainingDays <= 7 ? "destructive" : policy.remainingDays <= 15 ? "default" : "secondary"}
                          >
                            {policy.remainingDays} days left
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500 space-y-1">
                          <p>End Date: {new Date(policy.endDate).toLocaleDateString()}</p>
                          <p>Premium: ${policy.premium?.amount?.toLocaleString() || 'N/A'}</p>
                          <p>Enrollments: {policy.enrollmentCount}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 h-64 flex items-center justify-center">
                    No expiring policies
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Overdue Premiums Report */}
            <Card>
              <CardHeader>
                <CardTitle>Overdue Premium Payments</CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : analytics.overdue && analytics.overdue.length > 0 ? (
                <div className="space-y-3">
                    {analytics.overdue.map((policy: any) => (
                      <div key={policy.policyNumber} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                    <div>
                            <p className="font-medium text-sm">{policy.policyNumber}</p>
                            <p className="text-xs text-gray-600">{policy.policyName}</p>
                    </div>
                          <Badge 
                            variant={policy.daysOverdue > 30 ? "destructive" : policy.daysOverdue > 15 ? "default" : "secondary"}
                          >
                            {policy.daysOverdue} days overdue
                          </Badge>
                  </div>
                        <div className="text-xs text-gray-500 space-y-1">
                          <p>Due Date: {new Date(policy.nextDueDate).toLocaleDateString()}</p>
                          <p>Amount: ${policy.premiumAmount?.toLocaleString() || 'N/A'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 h-64 flex items-center justify-center">
                    No overdue premiums
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Network Provider Report */}
            <Card>
              <CardHeader>
                <CardTitle>Network Provider Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : analytics.networkDistribution ? (
                  <div className="space-y-3">
                    {analytics.networkDistribution.map((provider: any) => (
                      <div key={provider.type} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-health-teal/10 rounded-full">
                            <Building className="w-4 h-4 text-health-teal" />
                          </div>
                    <div>
                            <p className="font-medium text-sm">{provider.type}</p>
                            <p className="text-xs text-gray-600">{provider.totalPolicies} policies</p>
                    </div>
                  </div>
                        <Badge variant="outline">{provider.count} providers</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 h-64 flex items-center justify-center">
                    No network provider data
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Risk Assessment Report */}
            <Card>
              <CardHeader>
                <CardTitle>High Risk Policies</CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : analytics.riskAssessment ? (
                  <div className="space-y-3">
                    {analytics.riskAssessment.slice(0, 5).map((policy: any) => (
                      <div key={policy.policyNumber} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                    <div>
                            <p className="font-medium text-sm">{policy.policyNumber}</p>
                            <p className="text-xs text-gray-600">{policy.policyName}</p>
                    </div>
                          <Badge 
                            variant={policy.riskScore > 70 ? "destructive" : policy.riskScore > 40 ? "default" : "secondary"}
                          >
                            Risk: {policy.riskScore.toFixed(1)}
                          </Badge>
                  </div>
                        <div className="text-xs text-gray-500 space-y-1">
                          <p>Coinsurance: {policy.coinsurance}%</p>
                          <p>Deductible: ${policy.deductible.toLocaleString()}</p>
                          <p>Claims: {policy.claimCount} / {policy.enrollmentCount} enrollments</p>
                </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 h-64 flex items-center justify-center">
                    No risk assessment data
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Policy Detail Dialog */}
      <Dialog open={!!selectedPolicy} onOpenChange={() => setSelectedPolicy(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Policy Details</DialogTitle>
          </DialogHeader>
          {selectedPolicy && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm text-health-charcoal">Policy Number</Label>
                      <p className="font-medium">{selectedPolicy.policyNumber}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-health-charcoal">Policy Name</Label>
                      <p className="font-medium">{selectedPolicy.policyName}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-health-charcoal">Policy Type</Label>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{insurancePolicyService.getPolicyTypeIcon(selectedPolicy.policyType)}</span>
                        <span className="font-medium">{selectedPolicy.policyType}</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-health-charcoal">Status</Label>
                      <Badge className={insurancePolicyService.getStatusColor(selectedPolicy.status)}>
                        {selectedPolicy.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Coverage Details</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm text-health-charcoal">Coverage Amount</Label>
                      <p className="font-medium">{insurancePolicyService.formatCurrency(selectedPolicy.coverageAmount)}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-health-charcoal">Deductible</Label>
                      <p className="font-medium">{insurancePolicyService.formatCurrency(selectedPolicy.deductible)}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-health-charcoal">Coinsurance</Label>
                      <p className="font-medium">{selectedPolicy.coinsurance}%</p>
                    </div>
                    <div>
                      <Label className="text-sm text-health-charcoal">Out of Pocket Max</Label>
                      <p className="font-medium">{insurancePolicyService.formatCurrency(selectedPolicy.outOfPocketMax)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Premium Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Premium Information</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm text-health-charcoal">Premium Amount</Label>
                    <p className="font-medium">{insurancePolicyService.formatCurrency(selectedPolicy.premium?.amount || 0)}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-health-charcoal">Frequency</Label>
                    <p className="font-medium capitalize">{selectedPolicy.premium?.frequency || 'monthly'}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-health-charcoal">Next Due Date</Label>
                    <p className="font-medium">
                      {selectedPolicy.premium?.nextDueDate 
                        ? insurancePolicyService.formatDate(selectedPolicy.premium.nextDueDate)
                        : 'Not set'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Coverage Period */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Coverage Period</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm text-health-charcoal">Start Date</Label>
                    <p className="font-medium">{insurancePolicyService.formatDate(selectedPolicy.startDate)}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-health-charcoal">End Date</Label>
                    <p className="font-medium">{insurancePolicyService.formatDate(selectedPolicy.endDate)}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-health-charcoal">Renewal Date</Label>
                    <p className="font-medium">
                      {selectedPolicy.renewalDate 
                        ? insurancePolicyService.formatDate(selectedPolicy.renewalDate)
                        : 'Not set'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Statistics</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm text-health-charcoal">Enrollments</Label>
                    <p className="font-medium">{selectedPolicy.enrollmentCount}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-health-charcoal">Claims</Label>
                    <p className="font-medium">{selectedPolicy.claimCount}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-health-charcoal">Average Claim Amount</Label>
                    <p className="font-medium">{insurancePolicyService.formatCurrency(selectedPolicy.averageClaimAmount)}</p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              {selectedPolicy.documents && selectedPolicy.documents.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Documents</h3>
                  <div className="space-y-2">
                    {selectedPolicy.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-health-teal" />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-sm text-health-charcoal/70">
                              {doc.documentType} • {insurancePolicyService.formatDate(doc.uploadedAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" asChild>
                            <a href={doc.url} target="_blank" rel="noopener noreferrer">
                              <Eye className="w-4 h-4" />
                            </a>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-health-danger"
                            onClick={() => handleDeletePolicyDocument(selectedPolicy._id!, doc._id!)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Document Upload */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Upload Documents</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Document Type</Label>
                      <Select value={documentType} onValueChange={setDocumentType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="policy_document">Policy Document</SelectItem>
                          <SelectItem value="terms_conditions">Terms & Conditions</SelectItem>
                          <SelectItem value="coverage_details">Coverage Details</SelectItem>
                          <SelectItem value="claim_procedures">Claim Procedures</SelectItem>
                          <SelectItem value="network_providers">Network Providers</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Files</Label>
                      <Input 
                        type="file" 
                        multiple 
                        onChange={handleFileSelect}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      />
                    </div>
                  </div>
                  {selectedFiles.length > 0 && (
                    <div>
                      <Label>Selected Files</Label>
                      <div className="space-y-2">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded">
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-health-charcoal/70">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <Button 
                    onClick={() => handleUploadDocuments(selectedPolicy._id!)}
                    disabled={uploadingDocuments || selectedFiles.length === 0}
                    className="bg-health-teal hover:bg-health-teal/90 text-white"
                  >
                    {uploadingDocuments ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Documents
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InsurancePolicies;
