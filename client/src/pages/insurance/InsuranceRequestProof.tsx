
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  CalendarIcon, 
  Send, 
  Clock, 
  CheckCircle, 
  FileText, 
  User, 
  Plus, 
  Search,
  Filter,
  Download,
  Upload,
  Edit,
  Trash2,
  Eye,
  MessageSquare,
  AlertTriangle,
  Shield,
  Zap,
  Target,
  Users,
  BarChart3,
  Settings,
  Copy,
  Save,
  RefreshCw,
  Bell,
  Star,
  Tag,
  Link,
  ExternalLink,
  Check,
  X,
  Info,
  Loader2
} from 'lucide-react';
import { format, addDays, isAfter, isBefore } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import patientSearchService, { PatientSearchResult, PatientSearchFilters } from '@/services/patientSearchService';
import { createProofRequest, getDoctorProofRequests, cancelProofRequest } from '@/services/proofRequestService.js';

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  profilePicture?: string;
  cloudinaryId?: string;
  insurancePolicies?: Array<{
    _id: string;
  policyNumber: string;
  policyType: string;
    status: string;
    coverageAmount: number;
    premium: {
      amount: number;
      frequency: string;
    };
  }>;
  lastVisit?: string;
  status: 'active' | 'inactive' | 'pending';
  policyCount?: number;
  activePolicyCount?: number;
}

interface ProofRequest {
  id: string;
  patient: Patient;
  proofType: string;
  status: 'pending' | 'fulfilled' | 'rejected' | 'expired';
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  requestDate: string;
  dueDate: string;
  reason: string;
  attachments: string[];
  notes: string;
  priority: number;
  category: string;
  assignedTo?: string;
  responseTime?: string;
  followUpCount: number;
  lastFollowUp?: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  proofType: string;
  defaultUrgency: string;
  defaultReason: string;
  category: string;
  isDefault: boolean;
  usageCount: number;
}

const InsuranceRequestProof = () => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [urgencyLevel, setUrgencyLevel] = useState('');
  const [proofType, setProofType] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [reason, setReason] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [notes, setNotes] = useState('');
  const [autoFollowUp, setAutoFollowUp] = useState(false);
  const [notifyPatient, setNotifyPatient] = useState(true);
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('new-request');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [uploadingDocuments, setUploadingDocuments] = useState(false);
  const [documentTypes, setDocumentTypes] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<PatientSearchResult[]>([]);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [selectedPatientDetails, setSelectedPatientDetails] = useState<any>(null);
  const [loadingPatientDetails, setLoadingPatientDetails] = useState(false);

  // Document types for Cloudinary uploads
  const availableDocumentTypes = [
    { value: 'medical_certificate', label: 'Medical Certificate' },
    { value: 'treatment_record', label: 'Treatment Record' },
    { value: 'lab_results', label: 'Lab Results' },
    { value: 'prescription', label: 'Prescription' },
    { value: 'discharge_summary', label: 'Discharge Summary' },
    { value: 'diagnostic_report', label: 'Diagnostic Report' },
    { value: 'surgery_report', label: 'Surgery Report' },
    { value: 'therapy_notes', label: 'Therapy Notes' },
    { value: 'imaging_results', label: 'Imaging Results' },
    { value: 'vaccination_record', label: 'Vaccination Record' },
    { value: 'allergy_test', label: 'Allergy Test Results' },
    { value: 'specialist_report', label: 'Specialist Report' }
  ];

  // Debounced search effect
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (patientSearch.trim()) {
      const timeout = setTimeout(() => {
        handlePatientSearch(patientSearch);
      }, 500); // 500ms delay
      setSearchTimeout(timeout);
    } else {
      setSearchResults([]);
    }

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [patientSearch]);

  // Fetch patient details when selected
  const handlePatientSelect = async (patient: PatientSearchResult) => {
    setSelectedPatient(patient);
    setLoadingPatientDetails(true);
    
    try {
      // Fetch detailed patient information
      const [patientDetails, policies, healthSummary] = await Promise.all([
        patientSearchService.getPatientById(patient._id),
        patientSearchService.getPatientPolicies(patient._id),
        patientSearchService.getPatientHealthSummary(patient._id)
      ]);
      
      setSelectedPatientDetails({
        ...patientDetails,
        policies,
        healthSummary
      });
      
      toast({
        title: "Patient Selected",
        description: `Loaded details for ${patient.firstName} ${patient.lastName}`,
      });
    } catch (error) {
      console.error('Error fetching patient details:', error);
      toast({
        title: "Error",
        description: "Failed to load patient details. Basic info will be used.",
        variant: "destructive"
      });
    } finally {
      setLoadingPatientDetails(false);
    }
  };

  // Mock data
  const patients: Patient[] = [
    {
      _id: 'P-12345',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@email.com',
      phone: '+1-555-0123',
      dateOfBirth: '1990-01-01',
      status: 'active'
    },
    {
      _id: 'P-12346',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@email.com',
      phone: '+1-555-0124',
      dateOfBirth: '1985-05-10',
      status: 'active'
    },
    {
      _id: 'P-12347',
      firstName: 'Bob',
      lastName: 'Johnson',
      email: 'bob.johnson@email.com',
      phone: '+1-555-0125',
      dateOfBirth: '1995-12-20',
      status: 'active'
    }
  ];

  const proofRequests: ProofRequest[] = [
    {
      id: 'REQ-001',
      patient: patients[0],
      proofType: 'Medical Certificate',
      status: 'pending',
      requestDate: '2024-01-20',
      dueDate: '2024-01-25',
      reason: 'Claim verification for recent hospitalization',
      urgency: 'high',
      attachments: ['medical_report.pdf'],
      notes: 'Patient was admitted for chest pain',
      priority: 1,
      category: 'Emergency',
      followUpCount: 2,
      lastFollowUp: '2024-01-22'
    },
    {
      id: 'REQ-002',
      patient: patients[1],
      proofType: 'Treatment Record',
      status: 'fulfilled',
      requestDate: '2024-01-19',
      dueDate: '2024-01-26',
      reason: 'Routine dental procedure documentation',
      urgency: 'medium',
      attachments: ['dental_record.pdf', 'xray.pdf'],
      notes: 'Standard cleaning and filling',
      priority: 2,
      category: 'Routine',
      responseTime: '2 days',
      followUpCount: 0
    },
    {
      id: 'REQ-003',
      patient: patients[2],
      proofType: 'Lab Results',
      status: 'pending',
      requestDate: '2024-01-18',
      dueDate: '2024-01-28',
      reason: 'Blood work results for annual checkup',
      urgency: 'low',
      attachments: [],
      notes: 'Annual wellness check',
      priority: 3,
      category: 'Preventive',
      followUpCount: 1
    }
  ];

  const templates: Template[] = [
    {
      id: 'TEMP-001',
      name: 'Emergency Medical Certificate',
      description: 'Standard template for emergency medical documentation',
      proofType: 'Medical Certificate',
      defaultUrgency: 'urgent',
      defaultReason: 'Emergency medical claim verification',
      category: 'Emergency',
      isDefault: true,
      usageCount: 45
    },
    {
      id: 'TEMP-002',
      name: 'Routine Dental Checkup',
      description: 'Template for routine dental procedures',
      proofType: 'Treatment Record',
      defaultUrgency: 'medium',
      defaultReason: 'Dental procedure documentation for claim processing',
      category: 'Routine',
      isDefault: false,
      usageCount: 23
    },
    {
      id: 'TEMP-003',
      name: 'Lab Results Request',
      description: 'Standard template for laboratory results',
      proofType: 'Lab Results',
      defaultUrgency: 'low',
      defaultReason: 'Laboratory results for claim verification',
      category: 'Preventive',
      isDefault: false,
      usageCount: 18
    }
  ];

  const proofTypes = [
    { value: 'medical-certificate', label: 'Medical Certificate', icon: '🏥' },
    { value: 'treatment-record', label: 'Treatment Record', icon: '📋' },
    { value: 'lab-results', label: 'Lab Results', icon: '🔬' },
    { value: 'prescription', label: 'Prescription', icon: '💊' },
    { value: 'discharge-summary', label: 'Discharge Summary', icon: '📄' },
    { value: 'diagnostic-report', label: 'Diagnostic Report', icon: '📊' },
    { value: 'surgery-report', label: 'Surgery Report', icon: '⚕️' },
    { value: 'therapy-notes', label: 'Therapy Notes', icon: '🧠' },
    { value: 'imaging-results', label: 'Imaging Results', icon: '🖼️' },
    { value: 'vaccination-record', label: 'Vaccination Record', icon: '💉' },
    { value: 'allergy-test', label: 'Allergy Test Results', icon: '🔍' },
    { value: 'specialist-report', label: 'Specialist Report', icon: '👨‍⚕️' }
  ];

  const categories = [
    { value: 'emergency', label: 'Emergency', color: 'bg-red-100 text-red-800' },
    { value: 'routine', label: 'Routine', color: 'bg-blue-100 text-blue-800' },
    { value: 'preventive', label: 'Preventive', color: 'bg-green-100 text-green-800' },
    { value: 'specialist', label: 'Specialist', color: 'bg-purple-100 text-purple-800' },
    { value: 'surgery', label: 'Surgery', color: 'bg-orange-100 text-orange-800' },
    { value: 'therapy', label: 'Therapy', color: 'bg-pink-100 text-pink-800' }
  ];

  const urgencyLevels = [
    { value: 'low', label: 'Low Priority', description: '7 days response time', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium Priority', description: '3 days response time', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High Priority', description: '24 hours response time', color: 'bg-orange-100 text-orange-800' },
    { value: 'urgent', label: 'Urgent', description: 'Same day response', color: 'bg-red-100 text-red-800' }
  ];

  const priorities = [
    { value: '1', label: 'Critical', description: 'Immediate attention required' },
    { value: '2', label: 'High', description: 'Within 24 hours' },
    { value: '3', label: 'Medium', description: 'Within 3 days' },
    { value: '4', label: 'Low', description: 'Within 7 days' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fulfilled': return 'bg-health-success text-white';
      case 'pending': return 'bg-health-warning text-white';
      case 'rejected': return 'bg-health-danger text-white';
      case 'expired': return 'bg-gray-500 text-white';
      default: return 'bg-health-blue-gray text-white';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePatientSearch = async (searchTerm: string) => {
    setPatientSearch(searchTerm);
    
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    
    setLoading(true);
    try {
      const filters: PatientSearchFilters = {
        searchTerm: searchTerm.trim(),
        limit: 10,
        page: 1
      };
      
      const response = await patientSearchService.searchPatients(filters);
      setSearchResults(response.patients || []);
    } catch (error) {
      console.error('Patient search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to search patients. Please try again.",
        variant: "destructive"
      });
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setProofType(template.proofType);
    setUrgencyLevel(template.defaultUrgency);
    setReason(template.defaultReason);
    setCategory(template.category);
    setShowTemplateDialog(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const handleSubmitRequest = async () => {
    if (!selectedPatient || !proofType || !urgencyLevel || !reason) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Validate document types
    const missingTypes = attachments.filter(file => !documentTypes[file.name]);
    if (missingTypes.length > 0) {
    toast({
        title: "Document Type Required",
        description: `Please select document types for: ${missingTypes.map(f => f.name).join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    setUploadingDocuments(true);
    
    try {
      // Upload documents to Cloudinary
      const uploadPromises = attachments.map(async (file) => {
        const documentType = documentTypes[file.name];
        return await patientSearchService.uploadPatientDocument(
          selectedPatient._id,
          file,
          documentType
        );
      });

      const uploadResults = await Promise.all(uploadPromises);
      
      // Create proof request with uploaded document URLs
      const proofRequest = {
        patientId: selectedPatient._id,
        proofType,
        urgency: urgencyLevel,
        reason,
        dueDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(addDays(new Date(), 7), 'yyyy-MM-dd'),
        category,
        priority: typeof priority === 'string' ? parseInt(priority) : priority,
        notes,
        autoFollowUp,
        notifyPatient,
        documents: uploadResults.map(result => ({
          url: result.url,
          cloudinaryId: result.cloudinaryId,
          type: result.documentType,
          originalName: result.originalName
        }))
      };

            // Submit to backend API to store in database
      const createdRequest = await createProofRequest(proofRequest);
      
      console.log('Proof request created in database:', createdRequest);

      toast({
        title: "Request Submitted Successfully",
        description: `Proof request for ${selectedPatient.firstName} ${selectedPatient.lastName} has been submitted and stored with ${attachments.length} documents`,
      });

    // Reset form
    setSelectedPatient(null);
      setSelectedPatientDetails(null);
    setProofType('');
    setUrgencyLevel('');
    setReason('');
    setSelectedDate(undefined);
    setCategory('');
    setPriority('');
    setAttachments([]);
      setDocumentTypes({});
    setNotes('');
      
    } catch (error) {
      console.error('Error submitting proof request:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload documents. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadingDocuments(false);
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedRequests.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select requests to perform bulk actions",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Bulk Action",
      description: `${action} performed on ${selectedRequests.length} requests`,
    });
  };

  const filteredRequests = proofRequests.filter(request => {
    const matchesSearch = request.patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.patient._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.proofType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesUrgency = urgencyFilter === 'all' || request.urgency === urgencyFilter;
    
    return matchesSearch && matchesStatus && matchesUrgency;
  });

  const stats = {
    total: proofRequests.length,
    pending: proofRequests.filter(r => r.status === 'pending').length,
    fulfilled: proofRequests.filter(r => r.status === 'fulfilled').length,
    urgent: proofRequests.filter(r => r.urgency === 'urgent').length,
    responseRate: 89,
    avgResponseTime: '2.3 days'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-montserrat font-bold text-health-teal">Proof Request Management</h1>
          <p className="text-health-charcoal mt-2">Request and manage medical proofs from patients for claim verification</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-health-warning/10 rounded-lg">
                <Clock className="w-5 h-5 text-health-warning" />
              </div>
              <div>
                <p className="text-xs text-health-charcoal">Pending</p>
                <p className="text-lg font-bold text-health-teal">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-health-success/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-health-success" />
              </div>
              <div>
                <p className="text-xs text-health-charcoal">Fulfilled</p>
                <p className="text-lg font-bold text-health-teal">{stats.fulfilled}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-health-danger/10 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-health-danger" />
              </div>
              <div>
                <p className="text-xs text-health-charcoal">Urgent</p>
                <p className="text-lg font-bold text-health-teal">{stats.urgent}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-health-aqua/10 rounded-lg">
                <BarChart3 className="w-5 h-5 text-health-aqua" />
              </div>
              <div>
                <p className="text-xs text-health-charcoal">Response Rate</p>
                <p className="text-lg font-bold text-health-teal">{stats.responseRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-health-teal/10 rounded-lg">
                <Zap className="w-5 h-5 text-health-teal" />
              </div>
              <div>
                <p className="text-xs text-health-charcoal">Avg Response</p>
                <p className="text-lg font-bold text-health-teal">{stats.avgResponseTime}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-health-blue/10 rounded-lg">
                <Users className="w-5 h-5 text-health-blue" />
              </div>
              <div>
                <p className="text-xs text-health-charcoal">Total</p>
                <p className="text-lg font-bold text-health-teal">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="new-request">New Request</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="requests">All Requests</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* New Request Tab */}
        <TabsContent value="new-request" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="w-5 h-5" />
                <span>Create New Proof Request</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
              {/* Patient Selection */}
            <div className="space-y-4">
              <div>
                  <Label htmlFor="patientSearch">Patient Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                      id="patientSearch"
                      placeholder="Search by patient name, ID, email, or phone..."
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  {/* Advanced Filters */}
                  <div className="mt-3 flex flex-wrap gap-3">
                    <Select onValueChange={(value) => {
                      if (value && patientSearch.trim()) {
                        handlePatientSearch(patientSearch);
                      }
                    }}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Policy Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="health">Health</SelectItem>
                        <SelectItem value="dental">Dental</SelectItem>
                        <SelectItem value="vision">Vision</SelectItem>
                        <SelectItem value="life">Life</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select onValueChange={(value) => {
                      if (value && patientSearch.trim()) {
                        handlePatientSearch(patientSearch);
                      }
                    }}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {loading && (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-health-teal" />
                    <span className="ml-2 text-gray-600">Searching patients...</span>
                  </div>
                )}

                {searchResults.length > 0 && (
                  <div className="border rounded-lg p-4 space-y-2">
                    <Label className="text-sm font-medium">Search Results ({searchResults.length})</Label>
                    {searchResults.map(patient => (
                      <div
                        key={patient._id}
                        className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedPatient?._id === patient._id ? 'border-health-teal bg-health-teal/5' : ''
                        }`}
                        onClick={() => handlePatientSelect(patient)}
                      >
                        <div className="flex items-start space-x-3">
                          {/* Profile Picture */}
                          <div className="flex-shrink-0">
                            {patient.profilePicture ? (
                              <img 
                                src={patient.profilePicture} 
                                alt={`${patient.firstName} ${patient.lastName}`}
                                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-health-teal/10 flex items-center justify-center">
                                <User className="w-6 h-6 text-health-teal" />
                              </div>
                            )}
                          </div>
                          
                          {/* Patient Info */}
                          <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                                <h4 className="font-semibold text-gray-900">
                                  {patient.firstName} {patient.lastName}
                                </h4>
                            <p className="text-sm text-gray-600">{patient.email}</p>
                                <p className="text-xs text-gray-500">
                                  ID: {patient._id} • Phone: {patient.phone}
                                </p>
                          </div>
                              <div className="text-right">
                          <Badge variant={patient.status === 'active' ? 'default' : 'secondary'}>
                            {patient.status}
                          </Badge>
                                <div className="text-xs text-gray-500 mt-1">
                                  {patient.insurancePolicies.length || 0} active policies
                        </div>
                      </div>
                            </div>
                            
                            {/* Policy Summary */}
                            {patient.insurancePolicies && patient.insurancePolicies.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {patient.insurancePolicies.slice(0, 3).map((policy, idx) => (
                                  <Badge key={policy._id} variant="outline" className="text-xs">
                                    {policy.policyType} - {policy.policyNumber}
                                  </Badge>
                                ))}
                                {patient.insurancePolicies.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{patient.insurancePolicies.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {patientSearch && !loading && searchResults.length === 0 && (
                  <div className="border rounded-lg p-4 text-center text-gray-500">
                    <User className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p>No patients found matching your search.</p>
                    <p className="text-sm">Try different keywords or check spelling.</p>
                  </div>
                )}

                {selectedPatient && (
                  <Alert>
                    <User className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <strong>{selectedPatient.firstName} {selectedPatient.lastName}</strong>
                          <Badge variant={selectedPatient.status === 'active' ? 'default' : 'secondary'}>
                            {selectedPatient.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          ID: {selectedPatient._id} • Email: {selectedPatient.email} • Phone: {selectedPatient.phone}
                        </div>
                        
                        {/* Policy Summary */}
                        {selectedPatientDetails?.policies && selectedPatientDetails.policies.length > 0 && (
                          <div className="mt-2">
                            <div className="text-xs font-medium text-gray-700 mb-1">Active Policies:</div>
                            <div className="flex flex-wrap gap-1">
                              {selectedPatientDetails.policies.slice(0, 3).map((policy: any) => (
                                <Badge key={policy._id} variant="outline" className="text-xs">
                                  {policy.policyType} - ₹{policy.coverageAmount?.toLocaleString()}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Health Summary */}
                        {selectedPatientDetails?.healthSummary && (
                          <div className="mt-2">
                            <div className="text-xs font-medium text-gray-700 mb-1">Health Summary:</div>
                            <div className="text-xs text-gray-600">
                              {selectedPatientDetails.healthSummary.totalApplications || 0} applications • 
                              {selectedPatientDetails.healthSummary.totalPolicies || 0} policies
                            </div>
                          </div>
                        )}
                        
                        {loadingPatientDetails && (
                          <div className="flex items-center text-xs text-gray-500">
                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                            Loading additional details...
                          </div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Request Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
              <div>
                    <Label htmlFor="proofType">Proof Type *</Label>
                <Select value={proofType} onValueChange={setProofType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select proof type" />
                  </SelectTrigger>
                  <SelectContent>
                        {proofTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center space-x-2">
                              <span>{type.icon}</span>
                              <span>{type.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            <Badge className={cat.color}>{cat.label}</Badge>
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                    <Label htmlFor="urgency">Urgency Level *</Label>
                <Select value={urgencyLevel} onValueChange={setUrgencyLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select urgency level" />
                  </SelectTrigger>
                  <SelectContent>
                        {urgencyLevels.map(level => (
                          <SelectItem key={level.value} value={level.value}>
                            <div className="flex items-center justify-between w-full">
                              <div>
                                <div className="font-medium">{level.label}</div>
                                <div className="text-sm text-gray-500">{level.description}</div>
                              </div>
                              <Badge className={level.color}>{level.value}</Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="priority">Priority Level</Label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map(pri => (
                          <SelectItem key={pri.value} value={pri.value}>
                            <div className="flex items-center justify-between w-full">
                              <div>
                                <div className="font-medium">{pri.label}</div>
                                <div className="text-sm text-gray-500">{pri.description}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                          disabled={(date) => isBefore(date, new Date())}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                    <Label htmlFor="reason">Reason for Request *</Label>
                <Textarea
                  id="reason"
                      placeholder="Provide detailed explanation of why this proof is needed for claim processing..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                />
              </div>

                  <div>
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any additional information or special instructions..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="attachments">Attachments</Label>
                    <div className="space-y-3">
                    <Input
                      id="attachments"
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="cursor-pointer"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
                    />
                      
                      {/* Document Type Selection */}
                    {attachments.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Document Types</Label>
                        {attachments.map((file, index) => (
                            <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <FileText className="w-4 h-4 text-gray-500" />
                                  <span className="text-sm font-medium">{file.name}</span>
                                  <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                                </div>
                              </div>
                              
                              <Select 
                                value={documentTypes[file.name] || ''} 
                                onValueChange={(value) => setDocumentTypes(prev => ({
                                  ...prev,
                                  [file.name]: value
                                }))}
                              >
                                <SelectTrigger className="w-40">
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableDocumentTypes.map(type => (
                                    <SelectItem key={type.value} value={type.value}>
                                      {type.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              
                            <Button
                              size="sm"
                              variant="ghost"
                                onClick={() => {
                                  setAttachments(prev => prev.filter((_, i) => i !== index));
                                  const newDocTypes = { ...documentTypes };
                                  delete newDocTypes[file.name];
                                  setDocumentTypes(newDocTypes);
                                }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                      
                      {/* Upload Progress */}
                      {uploadingDocuments && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                            <span className="text-sm text-blue-700">Uploading documents to Cloudinary...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="autoFollowUp"
                    checked={autoFollowUp}
                    onCheckedChange={setAutoFollowUp}
                  />
                  <Label htmlFor="autoFollowUp">Enable automatic follow-up reminders</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="notifyPatient"
                    checked={notifyPatient}
                    onCheckedChange={setNotifyPatient}
                  />
                  <Label htmlFor="notifyPatient">Notify patient via email/SMS</Label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex space-x-4">
              <Button 
                onClick={handleSubmitRequest}
                  className="bg-health-teal hover:bg-health-teal/90 text-white"
                  disabled={!selectedPatient || !proofType || !urgencyLevel || !reason}
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Request
                </Button>
                <Button variant="outline">
                  <Save className="w-4 h-4 mr-2" />
                  Save as Draft
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Request Templates</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map(template => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium">{template.name}</h3>
                            {template.isDefault && <Star className="w-4 h-4 text-yellow-500" />}
                          </div>
                          <p className="text-sm text-gray-600">{template.description}</p>
                          <div className="flex items-center space-x-2">
                            <Badge className={getUrgencyColor(template.defaultUrgency)}>
                              {template.defaultUrgency}
                            </Badge>
                            <Badge variant="outline">{template.category}</Badge>
                          </div>
                          <p className="text-xs text-gray-500">Used {template.usageCount} times</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleTemplateSelect(template)}
                        >
                          Use Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Requests Tab */}
        <TabsContent value="requests" className="space-y-6">
          {/* Filters and Actions */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col md:flex-row gap-4 flex-1">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search requests..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="fulfilled">Fulfilled</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Urgency</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('Follow Up')}
                    disabled={selectedRequests.length === 0}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Follow Up
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('Export')}
                    disabled={selectedRequests.length === 0}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

          {/* Requests Table */}
      <Card>
            <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedRequests.length === filteredRequests.length}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedRequests(filteredRequests.map(r => r.id));
                          } else {
                            setSelectedRequests([]);
                          }
                        }}
                      />
                    </TableHead>
                <TableHead>Request ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Proof Type</TableHead>
                    <TableHead>Category</TableHead>
                <TableHead>Urgency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                  {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedRequests.includes(request.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedRequests(prev => [...prev, request.id]);
                            } else {
                              setSelectedRequests(prev => prev.filter(id => id !== request.id));
                            }
                          }}
                        />
                      </TableCell>
                  <TableCell className="font-mono text-sm">{request.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{request.patient.firstName} {request.patient.lastName}</p>
                          <p className="text-sm text-gray-500">{request.patient._id}</p>
                        </div>
                      </TableCell>
                  <TableCell>{request.proofType}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{request.category}</Badge>
                      </TableCell>
                  <TableCell>
                    <Badge className={getUrgencyColor(request.urgency)}>
                      {request.urgency}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                  </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{format(new Date(request.dueDate), 'MMM dd')}</p>
                          <p className="text-gray-500">
                            {isAfter(new Date(request.dueDate), new Date()) ? 'Upcoming' : 'Overdue'}
                          </p>
                        </div>
                      </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                      </Button>
                      {request.status === 'pending' && (
                        <Button size="sm" variant="outline">
                              <MessageSquare className="w-4 h-4" />
                        </Button>
                      )}
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Response Time Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Average Response Time</span>
                      <span className="font-medium">2.3 days</span>
                    </div>
                    <Progress value={65} className="mt-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Urgent Requests</span>
                      <span className="font-medium">4.2 hours</span>
                    </div>
                    <Progress value={85} className="mt-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Standard Requests</span>
                      <span className="font-medium">3.1 days</span>
                    </div>
                    <Progress value={45} className="mt-2" />
                  </div>
                </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
                <CardTitle>Request Categories</CardTitle>
        </CardHeader>
        <CardContent>
                <div className="space-y-4">
                  {categories.map(category => (
                    <div key={category.value}>
                      <div className="flex justify-between text-sm">
                        <span>{category.label}</span>
                        <span className="font-medium">
                          {Math.floor(Math.random() * 50) + 10}%
                        </span>
                      </div>
                      <Progress value={Math.floor(Math.random() * 100)} className="mt-2" />
                    </div>
                  ))}
          </div>
        </CardContent>
      </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InsuranceRequestProof;
