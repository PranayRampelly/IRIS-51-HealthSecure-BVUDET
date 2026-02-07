import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import patientPolicyService, { PatientPolicy, PolicyStatistics } from '@/services/patientPolicyService';
import apiService from '@/services/api';
import pdfService, { ClaimPDFData } from '@/services/pdfService';
import analyticsService from '@/services/analyticsService';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  ResponsiveContainer, 
  AreaChart, 
  Area
} from 'recharts';
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
  Brain,
  Baby,
  Car,
  Home,
  Plane,
  User,
  Settings,
  BarChart3,
  MessageCircle,
  Upload,
  Share2,
  Phone,
  Mail,
  MapPin,
  Star,
  Target,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  HelpCircle,
  Database,
  Globe,
  Loader2
} from 'lucide-react';

const PatientInsurance = () => {
  const [selectedPolicy, setSelectedPolicy] = useState<PatientPolicy | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);
  const [insurancePolicies, setInsurancePolicies] = useState<PatientPolicy[]>([]);
  const [claims, setClaims] = useState<Array<{
    _id?: string;
    id?: string;
    claimNumber?: string;
    policyId?: string;
    provider?: string;
    type?: string;
    description?: string;
    amount?: number;
    status: string;
    submittedDate?: string;
    submittedAt?: string;
    processedDate?: string;
    paidAmount?: number;
    approvedAmount?: number;
    patientResponsibility?: number;
    documents?: Array<{
      name: string;
      type: string;
      cloudinaryUrl: string;
      uploadedAt: string;
      status: string;
    }>;
    personalInfo?: {
      firstName: string;
      lastName: string;
      email: string;
    };
    coverageInfo?: {
      selectedPlan: string;
      coverageAmount: number;
    };
    createdAt?: string;
    updatedAt?: string;
  }>>([]);
  const [policyStatistics, setPolicyStatistics] = useState<PolicyStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Claim action states
  const [selectedClaim, setSelectedClaim] = useState<typeof claims[0] | null>(null);
  const [showClaimDetails, setShowClaimDetails] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [downloadingClaim, setDownloadingClaim] = useState<string | null>(null);
  
  // Policy action states
  const [showPolicyDetails, setShowPolicyDetails] = useState(false);
  const [downloadingPolicy, setDownloadingPolicy] = useState<string | null>(null);
  const [showPolicyMessageModal, setShowPolicyMessageModal] = useState(false);
  const [policyMessageText, setPolicyMessageText] = useState('');
  const [sendingPolicyMessage, setSendingPolicyMessage] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 Fetching patient insurance data...');
        
        const [policiesResponse, statsResponse, claimsResponse] = await Promise.allSettled([
          patientPolicyService.getPatientPolicies(),
          patientPolicyService.getPolicyStatistics(),
          patientPolicyService.getClaims({
            status: filterStatus !== 'all' ? filterStatus : undefined,
            search: searchTerm || undefined,
            page: 1,
            limit: 50
          })
        ]);
        
        // Handle policies
        if (policiesResponse.status === 'fulfilled') {
          console.log('🔍 Policies fetched successfully:', policiesResponse.value);
          setInsurancePolicies(policiesResponse.value || []);
        } else {
          console.log('🔍 No policies found or error:', policiesResponse.reason);
          setInsurancePolicies([]);
        }
        
        // Handle statistics
        if (statsResponse.status === 'fulfilled') {
          console.log('🔍 Statistics fetched successfully:', statsResponse.value);
          setPolicyStatistics(statsResponse.value);
        } else {
          console.log('🔍 No statistics found or error:', statsResponse.reason);
          setPolicyStatistics(null);
        }
        
        // Handle claims
        if (claimsResponse.status === 'fulfilled') {
          console.log('🔍 Claims fetched successfully:', claimsResponse.value);
          setClaims(claimsResponse.value || []);
        } else {
          console.log('🔍 No claims found or error:', claimsResponse.reason);
          setClaims([]);
        }
        
      } catch (err) {
        console.error('🔍 Error in fetchData:', err);
        // Don't set error for empty data - this is normal
        setInsurancePolicies([]);
        setClaims([]);
        setPolicyStatistics(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Refetch claims when search or filter changes
  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const claimsResponse = await patientPolicyService.getClaims({
          status: filterStatus !== 'all' ? filterStatus : undefined,
          search: searchTerm || undefined,
          page: 1,
          limit: 50
        });
        setClaims(claimsResponse || []);
      } catch (error) {
        console.error('Error fetching claims:', error);
        setClaims([]);
      }
    };

    fetchClaims();
  }, [searchTerm, filterStatus]);

  // Claim action functions
  const handleViewClaim = (claim: typeof claims[0]) => {
    setSelectedClaim(claim);
    setShowClaimDetails(true);
  };

  const handleDownloadClaim = async (claim: typeof claims[0]) => {
    try {
      setDownloadingClaim(claim._id || claim.id || '');
      
      // Prepare claim data for PDF generation
      const claimData: ClaimPDFData = {
        claimNumber: claim.claimNumber || claim.id || 'Unknown',
        status: claim.status,
        claimType: claim.coverageInfo?.selectedPlan || claim.type || 'General',
        amount: claim.coverageInfo?.coverageAmount || claim.amount || 0,
        approvedAmount: claim.approvedAmount,
        submittedDate: claim.submittedAt || claim.submittedDate || claim.createdAt || new Date().toISOString(),
        personalInfo: claim.personalInfo,
        coverageInfo: claim.coverageInfo,
        documents: claim.documents,
        createdAt: claim.createdAt,
        updatedAt: claim.updatedAt
      };
      
      // Generate professional PDF
      const pdfBlob = await pdfService.generateClaimPDF(claimData);
      
      // Download the PDF
      const filename = `claim-${claim.claimNumber || claim.id || 'unknown'}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdfService.downloadPDF(pdfBlob, filename);
      
      toast({
        title: 'Success',
        description: 'Claim PDF downloaded successfully',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate claim PDF',
        variant: 'destructive'
      });
    } finally {
      setDownloadingClaim(null);
    }
  };

  const handleSendMessage = (claim: typeof claims[0]) => {
    setSelectedClaim(claim);
    setShowMessageModal(true);
  };

  const handleSubmitMessage = async () => {
    if (!messageText.trim() || !selectedClaim) return;
    
    try {
      setSendingMessage(true);
      
      // Here you would typically send the message to the backend
      // For now, we'll simulate sending a message
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Success',
        description: 'Message sent successfully',
      });
      
      setMessageText('');
      setShowMessageModal(false);
      setSelectedClaim(null);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
      });
    } finally {
      setSendingMessage(false);
    }
  };

  // Policy action functions
  const handleViewPolicy = (policy: typeof insurancePolicies[0]) => {
    setSelectedPolicy(policy);
    setShowPolicyDetails(true);
  };

  const handleDownloadPolicy = async (policy: typeof insurancePolicies[0]) => {
    try {
      setDownloadingPolicy(policy._id || '');
      
      // Prepare policy data for PDF generation
      const policyData = {
        policyNumber: policy.policyNumber,
        policyName: policy.policyName,
        policyType: policy.policyType,
        status: policy.status,
        startDate: policy.startDate,
        endDate: policy.endDate,
        premium: policy.premium,
        coverageAmount: policy.coverageAmount,
        deductible: policy.deductible,
        coinsurance: policy.coinsurance,
        copay: policy.copay,
        outOfPocketMax: policy.outOfPocketMax,
        usedAmount: policy.usedAmount,
        remainingAmount: policy.remainingAmount,
        insuranceCompany: policy.insuranceCompany,
        documents: policy.documents,
        notes: policy.notes,
        autoRenew: policy.autoRenew,
        createdAt: policy.createdAt,
        updatedAt: policy.updatedAt
      };
      
      // Generate professional PDF
      const pdfBlob = await pdfService.generatePolicyPDF(policyData);
      
      // Download the PDF
      const filename = `policy-${policy.policyNumber}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdfService.downloadPDF(pdfBlob, filename);
      
      toast({
        title: 'Success',
        description: 'Policy PDF downloaded successfully',
      });
    } catch (error) {
      console.error('Error generating policy PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate policy PDF',
        variant: 'destructive'
      });
    } finally {
      setDownloadingPolicy(null);
    }
  };

  const handleSendPolicyMessage = (policy: typeof insurancePolicies[0]) => {
    setSelectedPolicy(policy);
    setShowPolicyMessageModal(true);
  };

  const handleSubmitPolicyMessage = async () => {
    if (!policyMessageText.trim() || !selectedPolicy) return;
    
    try {
      setSendingPolicyMessage(true);
      
      // Here you would typically send the message to the backend
      // For now, we'll simulate sending a message
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Success',
        description: 'Message sent successfully',
      });
      
      setPolicyMessageText('');
      setShowPolicyMessageModal(false);
      setSelectedPolicy(null);
    } catch (error) {
      console.error('Error sending policy message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
      });
    } finally {
      setSendingPolicyMessage(false);
    }
  };

  // Generate real analytics data using the analytics service
  const coverageUtilization = analyticsService.calculateCoverageUtilization(insurancePolicies, claims);
  const spendingData = analyticsService.calculateSpendingTrends(insurancePolicies, claims);
  const claimStatistics = analyticsService.calculateClaimStatistics(claims);
  const calculatedPolicyStatistics = analyticsService.calculatePolicyStatistics(insurancePolicies);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-health-success text-white';
      case 'pending': return 'bg-health-warning text-white';
      case 'approved': return 'bg-health-success text-white';
      case 'rejected': return 'bg-health-danger text-white';
      case 'expired': return 'bg-health-charcoal text-white';
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
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // Use calculated statistics with fallback to backend data
  const totalPolicies = calculatedPolicyStatistics.totalPolicies || policyStatistics?.totalPolicies || insurancePolicies.length;
  const activePolicies = calculatedPolicyStatistics.activePolicies || policyStatistics?.activePolicies || insurancePolicies.filter(policy => policy.status === 'active').length;
  const totalPremium = calculatedPolicyStatistics.totalPremium || policyStatistics?.totalPremium || insurancePolicies.reduce((sum, policy) => sum + (policy.premium?.amount || 0), 0);
  const totalCoverage = calculatedPolicyStatistics.totalCoverage || policyStatistics?.totalCoverage || insurancePolicies.reduce((sum, policy) => sum + (policy.coverageAmount || 0), 0);
  const totalUsed = calculatedPolicyStatistics.totalUsed || policyStatistics?.totalUsed || insurancePolicies.reduce((sum, policy) => sum + (policy.usedAmount || 0), 0);
  const pendingClaims = claimStatistics.pending || claims.filter(claim => claim.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-health-charcoal">My Insurance</h1>
          <p className="text-health-charcoal mt-2">Manage your insurance policies, track claims, and verify coverage</p>
        </div>
        <div className="flex space-x-3">
          <Link to="/patient/apply-insurance">
            <Button variant="outline" className="border-health-success text-health-success hover:bg-health-success hover:text-white">
              <Plus className="w-4 h-4 mr-2" />
              Apply for Insurance
            </Button>
          </Link>

          <Link to="/patient/submit-claim">
            <Button className="bg-health-teal hover:bg-health-teal/90 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Submit Claim
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-health-charcoal">Active Policies</p>
                <p className="text-3xl font-bold text-health-teal">{activePolicies}</p>
                <p className="text-xs text-health-success">All active</p>
              </div>
              <div className="p-3 bg-health-teal/10 rounded-full">
                <Shield className="w-6 h-6 text-health-teal" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-health-charcoal">Monthly Premium</p>
                <p className="text-3xl font-bold text-health-aqua">${totalPremium}</p>
                <p className="text-xs text-health-charcoal/70">Total across all policies</p>
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
                <p className="text-3xl font-bold text-health-success">${totalCoverage.toLocaleString()}</p>
                <p className="text-xs text-health-success">Combined coverage</p>
              </div>
              <div className="p-3 bg-health-success/10 rounded-full">
                <Target className="w-6 h-6 text-health-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-health-charcoal">Pending Claims</p>
                <p className="text-3xl font-bold text-health-warning">{pendingClaims}</p>
                <p className="text-xs text-health-charcoal/70">Out of {claims.length} total</p>
              </div>
              <div className="p-3 bg-health-warning/10 rounded-full">
                <Clock className="w-6 h-6 text-health-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="policies">My Policies</TabsTrigger>
          <TabsTrigger value="claims">Claims</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Coverage Utilization */}
            <Card>
              <CardHeader>
                <CardTitle>Coverage Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {coverageUtilization.map((item) => (
                    <div key={item.type} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{item.type}</span>
                        <span>{item.percentage}% used</span>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
                      <div className="flex justify-between text-xs text-health-charcoal/70">
                        <span>Used: ${item.used.toLocaleString()}</span>
                        <span>Total: ${item.total.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Spending Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Spending Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={spendingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="premium" stackId="1" stroke="#0EA5E9" fill="#0EA5E9" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="claims" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="outOfPocket" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="p-2 bg-health-warning/10 rounded-full">
                      <Clock className="w-4 h-4 text-health-warning" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Claim submitted</p>
                      <p className="text-sm text-health-charcoal/70">Blood work and lab tests</p>
                      <p className="text-xs text-health-charcoal/50">2 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="p-2 bg-health-success/10 rounded-full">
                      <CheckCircle className="w-4 h-4 text-health-success" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Claim approved</p>
                      <p className="text-sm text-health-charcoal/70">Dental cleaning and checkup</p>
                      <p className="text-xs text-health-charcoal/50">1 week ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="p-2 bg-health-aqua/10 rounded-full">
                      <DollarSign className="w-4 h-4 text-health-aqua" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Premium paid</p>
                      <p className="text-sm text-health-charcoal/70">HealthGuard Insurance</p>
                      <p className="text-xs text-health-charcoal/50">2 weeks ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-20 flex-col">
                    <FileText className="w-6 h-6 mb-2" />
                    <span className="text-sm">Submit Claim</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Search className="w-6 h-6 mb-2" />
                    <span className="text-sm">Find Provider</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <MessageCircle className="w-6 h-6 mb-2" />
                    <span className="text-sm">Contact Insurer</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Download className="w-6 h-6 mb-2" />
                    <span className="text-sm">Download Card</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="policies">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>My Insurance Policies</CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Policy
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {insurancePolicies.map((policy) => (
                  <Card key={policy._id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getTypeIcon(policy.policyType)}
                          <div>
                            <CardTitle className="text-lg">{policy.policyName}</CardTitle>
                            <p className="text-sm text-health-charcoal/70">{policy.policyType} Insurance</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(policy.status)}>
                          {policy.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-health-charcoal/70">Policy Number</p>
                          <p className="font-medium">{policy.policyNumber}</p>
                        </div>
                        <div>
                          <p className="text-health-charcoal/70">Monthly Premium</p>
                          <p className="font-medium">${policy.premium.amount}</p>
                        </div>
                        <div>
                          <p className="text-health-charcoal/70">Coverage</p>
                          <p className="font-medium">${policy.coverageAmount}</p>
                        </div>
                        <div>
                          <p className="text-health-charcoal/70">Deductible</p>
                          <p className="font-medium">${policy.deductible}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Used: ${policy.usedAmount}</span>
                          <span>Remaining: ${policy.remainingAmount}</span>
                        </div>
                        <Progress value={(policy.usedAmount / policy.coverageAmount) * 100} className="h-2" />
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          className="bg-health-teal hover:bg-health-teal/90 text-white"
                          onClick={() => handleViewPolicy(policy)}
                        >
                          View Details
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDownloadPolicy(policy)}
                          disabled={downloadingPolicy === policy._id}
                        >
                          {downloadingPolicy === policy._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                          <Download className="w-4 h-4" />
                          )}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleSendPolicyMessage(policy)}
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="claims">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Claims History</CardTitle>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Search claims..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Claim ID</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {claims.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center space-y-2">
                          <FileText className="w-8 h-8 text-health-charcoal/30" />
                          <p className="text-health-charcoal/70">No claims found</p>
                          <p className="text-sm text-health-charcoal/50">Submit your first claim to get started</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    claims.map((claim) => (
                      <TableRow key={claim._id || claim.id}>
                      <TableCell>
                        <div>
                            <p className="font-medium">{claim.claimNumber || claim.id}</p>
                            <p className="text-sm text-health-charcoal/70">
                              {claim.coverageInfo?.selectedPlan || claim.type || 'Insurance Claim'}
                            </p>
                        </div>
                      </TableCell>
                      <TableCell>
                          {claim.personalInfo?.firstName && claim.personalInfo?.lastName 
                            ? `${claim.personalInfo.firstName} ${claim.personalInfo.lastName}`
                            : claim.provider || 'N/A'
                          }
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {claim.coverageInfo?.selectedPlan || claim.type || 'General'}
                          </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                            <p className="font-medium">
                              ${claim.coverageInfo?.coverageAmount || claim.amount || 0}
                            </p>
                            {claim.approvedAmount && claim.approvedAmount > 0 && (
                              <p className="text-sm text-health-success">
                                Approved: ${claim.approvedAmount}
                              </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(claim.status)}>
                          {claim.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                            <p className="text-sm">
                              {new Date(claim.submittedAt || claim.submittedDate || claim.createdAt).toLocaleDateString()}
                            </p>
                            {claim.updatedAt && claim.updatedAt !== claim.createdAt && (
                            <p className="text-xs text-health-charcoal/70">
                                Updated: {new Date(claim.updatedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleViewClaim(claim)}
                              title="View Details"
                            >
                            <Eye className="w-4 h-4" />
                          </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDownloadClaim(claim)}
                              disabled={downloadingClaim === (claim._id || claim.id)}
                              title="Download PDF"
                            >
                              {downloadingClaim === (claim._id || claim.id) ? (
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              ) : (
                            <Download className="w-4 h-4" />
                              )}
                          </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleSendMessage(claim)}
                              title="Send Message"
                            >
                            <MessageCircle className="w-4 h-4" />
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
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Spending Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Spending Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={spendingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="premium" fill="#0EA5E9" name="Premium" />
                    <Bar dataKey="claims" fill="#10B981" name="Claims" />
                    <Bar dataKey="outOfPocket" fill="#F59E0B" name="Out of Pocket" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Claims by Type */}
            <Card>
              <CardHeader>
                <CardTitle>Claims by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Medical', value: 700, color: '#0EA5E9' },
                        { name: 'Dental', value: 150, color: '#10B981' },
                        { name: 'Vision', value: 0, color: '#F59E0B' }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: $${value}`}
                    >
                      {[
                        { name: 'Medical', value: 700, color: '#0EA5E9' },
                        { name: 'Dental', value: 150, color: '#10B981' },
                        { name: 'Vision', value: 0, color: '#F59E0B' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="providers">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {insurancePolicies.map((policy) => (
              <Card key={policy._id}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building className="w-5 h-5" />
                    <span>{policy.policyName}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="w-4 h-4 text-health-charcoal/50" />
                      <span>Contact Insurance Company</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="w-4 h-4 text-health-charcoal/50" />
                      <span>Email Insurance Company</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Globe className="w-4 h-4 text-health-charcoal/50" />
                      <span>Visit Website</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" className="bg-health-teal hover:bg-health-teal/90 text-white">
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                    <Button size="sm" variant="outline">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    <Button size="sm" variant="outline">
                      <Globe className="w-4 h-4 mr-2" />
                      Website
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Claim Details Modal */}
      <Dialog open={showClaimDetails} onOpenChange={setShowClaimDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" aria-describedby="claim-details-description">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Claim Details</span>
            </DialogTitle>
            <p id="claim-details-description" className="text-sm text-health-charcoal/70">
              View detailed information about your insurance claim including status, timeline, and documents.
            </p>
          </DialogHeader>
          {selectedClaim && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-health-charcoal mb-2">Claim Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-health-charcoal/70">Claim Number:</span>
                      <span className="font-medium">{selectedClaim.claimNumber || selectedClaim.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-health-charcoal/70">Status:</span>
                      <Badge className={getStatusColor(selectedClaim.status)}>
                        {selectedClaim.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-health-charcoal/70">Type:</span>
                      <span>{selectedClaim.coverageInfo?.selectedPlan || selectedClaim.type || 'General'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-health-charcoal/70">Amount:</span>
                      <span className="font-medium">
                        ${selectedClaim.coverageInfo?.coverageAmount || selectedClaim.amount || 0}
                      </span>
                    </div>
                    {selectedClaim.approvedAmount && (
                      <div className="flex justify-between">
                        <span className="text-health-charcoal/70">Approved Amount:</span>
                        <span className="font-medium text-health-success">
                          ${selectedClaim.approvedAmount}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-health-charcoal mb-2">Timeline</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-health-charcoal/70">Created:</span>
                      <span>{new Date(selectedClaim.createdAt || selectedClaim.submittedDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-health-charcoal/70">Submitted:</span>
                      <span>{new Date(selectedClaim.submittedAt || selectedClaim.submittedDate).toLocaleDateString()}</span>
                    </div>
                    {selectedClaim.updatedAt && selectedClaim.updatedAt !== selectedClaim.createdAt && (
                      <div className="flex justify-between">
                        <span className="text-health-charcoal/70">Last Updated:</span>
                        <span>{new Date(selectedClaim.updatedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              {selectedClaim.personalInfo && (
                <div>
                  <h3 className="font-semibold text-health-charcoal mb-2">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-health-charcoal/70">Name:</span>
                      <span>{selectedClaim.personalInfo.firstName} {selectedClaim.personalInfo.lastName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-health-charcoal/70">Email:</span>
                      <span>{selectedClaim.personalInfo.email}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Documents */}
              {selectedClaim.documents && selectedClaim.documents.length > 0 && (
                <div>
                  <h3 className="font-semibold text-health-charcoal mb-2">Documents</h3>
                  <div className="space-y-2">
                    {selectedClaim.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-4 h-4 text-health-charcoal/50" />
                          <div>
                            <p className="font-medium text-sm">{doc.name}</p>
                            <p className="text-xs text-health-charcoal/70">
                              {new Date(doc.uploadedAt).toLocaleDateString()} • {doc.type}
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowClaimDetails(false)}>
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    setShowClaimDetails(false);
                    handleDownloadClaim(selectedClaim);
                  }}
                  disabled={downloadingClaim === (selectedClaim._id || selectedClaim.id)}
                >
                  {downloadingClaim === (selectedClaim._id || selectedClaim.id) ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Message Modal */}
      <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
        <DialogContent className="max-w-md" aria-describedby="message-modal-description">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <span>Send Message</span>
            </DialogTitle>
            <p id="message-modal-description" className="text-sm text-health-charcoal/70">
              Send a message regarding your insurance claim to the insurance provider.
            </p>
          </DialogHeader>
          {selectedClaim && (
            <div className="space-y-4">
              <div className="text-sm text-health-charcoal/70">
                Sending message regarding claim: <span className="font-medium">{selectedClaim.claimNumber || selectedClaim.id}</span>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Enter your message here..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowMessageModal(false);
                    setMessageText('');
                    setSelectedClaim(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitMessage}
                  disabled={!messageText.trim() || sendingMessage}
                >
                  {sendingMessage ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Policy Details Modal */}
      <Dialog open={showPolicyDetails} onOpenChange={setShowPolicyDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" aria-describedby="policy-details-description">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Policy Details</span>
            </DialogTitle>
            <p id="policy-details-description" className="text-sm text-health-charcoal/70">
              View detailed information about your insurance policy including coverage, benefits, and documents.
            </p>
          </DialogHeader>
          {selectedPolicy && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-health-charcoal mb-2">Policy Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-health-charcoal/70">Policy Number:</span>
                      <span className="font-medium">{selectedPolicy.policyNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-health-charcoal/70">Policy Name:</span>
                      <span className="font-medium">{selectedPolicy.policyName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-health-charcoal/70">Type:</span>
                      <span>{selectedPolicy.policyType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-health-charcoal/70">Status:</span>
                      <Badge className={getStatusColor(selectedPolicy.status)}>
                        {selectedPolicy.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-health-charcoal/70">Premium:</span>
                      <span className="font-medium">
                        ${selectedPolicy.premium?.amount}/{selectedPolicy.premium?.frequency}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-health-charcoal mb-2">Coverage Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-health-charcoal/70">Total Coverage:</span>
                      <span className="font-medium">${selectedPolicy.coverageAmount?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-health-charcoal/70">Used Amount:</span>
                      <span className="font-medium">${selectedPolicy.usedAmount?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-health-charcoal/70">Remaining:</span>
                      <span className="font-medium">${selectedPolicy.remainingAmount?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-health-charcoal/70">Deductible:</span>
                      <span className="font-medium">${selectedPolicy.deductible?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-health-charcoal/70">Coinsurance:</span>
                      <span className="font-medium">{selectedPolicy.coinsurance}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-health-charcoal/70">Copay:</span>
                      <span className="font-medium">${selectedPolicy.copay}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-health-charcoal/70">Out-of-Pocket Max:</span>
                      <span className="font-medium">${selectedPolicy.outOfPocketMax?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h3 className="font-semibold text-health-charcoal mb-2">Policy Timeline</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-health-charcoal/70">Start Date:</span>
                    <span>{new Date(selectedPolicy.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-health-charcoal/70">End Date:</span>
                    <span>{new Date(selectedPolicy.endDate).toLocaleDateString()}</span>
                  </div>
                  {selectedPolicy.createdAt && (
                    <div className="flex justify-between">
                      <span className="text-health-charcoal/70">Created:</span>
                      <span>{new Date(selectedPolicy.createdAt).toLocaleDateString()}</span>
                    </div>
                  )}
                  {selectedPolicy.updatedAt && selectedPolicy.updatedAt !== selectedPolicy.createdAt && (
                    <div className="flex justify-between">
                      <span className="text-health-charcoal/70">Last Updated:</span>
                      <span>{new Date(selectedPolicy.updatedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Documents */}
              {selectedPolicy.documents && selectedPolicy.documents.length > 0 && (
                <div>
                  <h3 className="font-semibold text-health-charcoal mb-2">Policy Documents</h3>
                  <div className="space-y-2">
                    {selectedPolicy.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-4 h-4 text-health-charcoal/50" />
                          <div>
                            <p className="font-medium text-sm">{doc.name}</p>
                            <p className="text-xs text-health-charcoal/70">
                              {new Date(doc.uploadedAt).toLocaleDateString()} • {doc.type}
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowPolicyDetails(false)}>
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    setShowPolicyDetails(false);
                    handleDownloadPolicy(selectedPolicy);
                  }}
                  disabled={downloadingPolicy === selectedPolicy._id}
                >
                  {downloadingPolicy === selectedPolicy._id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Policy Message Modal */}
      <Dialog open={showPolicyMessageModal} onOpenChange={setShowPolicyMessageModal}>
        <DialogContent className="max-w-md" aria-describedby="policy-message-modal-description">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <span>Send Message</span>
            </DialogTitle>
            <p id="policy-message-modal-description" className="text-sm text-health-charcoal/70">
              Send a message regarding your insurance policy to the insurance provider.
            </p>
          </DialogHeader>
          {selectedPolicy && (
            <div className="space-y-4">
              <div className="text-sm text-health-charcoal/70">
                Sending message regarding policy: <span className="font-medium">{selectedPolicy.policyNumber}</span>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="policy-message">Message</Label>
                <Textarea
                  id="policy-message"
                  placeholder="Enter your message here..."
                  value={policyMessageText}
                  onChange={(e) => setPolicyMessageText(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowPolicyMessageModal(false);
                    setPolicyMessageText('');
                    setSelectedPolicy(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitPolicyMessage}
                  disabled={!policyMessageText.trim() || sendingPolicyMessage}
                >
                  {sendingPolicyMessage ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientInsurance; 