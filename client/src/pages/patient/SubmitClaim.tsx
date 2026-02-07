import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import insuranceClaimService, { 
  InsuranceClaim
} from '@/services/insuranceClaimService';
import insurancePolicyService, { InsurancePolicy } from '@/services/insurancePolicyService';
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Plus,
  Minus,
  Trash2,
  Save,
  Send,
  Clock,
  FileCheck,
  AlertTriangle,
  Info,
  Calendar,
  DollarSign,
  User,
  MapPin,
  Phone,
  Mail,
  Building,
  Stethoscope,
  Eye,
  Heart,
  Activity,
  Car,
  Home,
  Plane,
  Receipt,
  CreditCard,
  Calculator,
  Download,
  EyeOff,
  Eye as EyeIcon,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Copy,
  Share2,
  MessageCircle,
  Bell,
  CheckSquare,
  Square,
  HelpCircle,
  Shield,
  Award,
  TrendingUp,
  AlertOctagon,
  FileX,
  FilePlus,
  FileImage,
  FileSpreadsheet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

// Using imported types from insuranceClaimService

const SubmitClaim: React.FC = () => {

  const navigate = useNavigate();
  const { claimId: urlClaimId } = useParams<{ claimId?: string }>();
  const { toast } = useToast();
  
  // Use local state for claimId to avoid URL navigation issues
  const [claimId, setClaimId] = useState<string | undefined>(urlClaimId);
  
  // Component mount logging
  useEffect(() => {
    console.log('SubmitClaim component mounted');
  }, []);

  // Sync URL claimId with local state when component loads
  useEffect(() => {
    if (urlClaimId && urlClaimId !== claimId) {
      setClaimId(urlClaimId);
    }
  }, [urlClaimId, claimId]);
  

  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPolicy, setSelectedPolicy] = useState('');
  const [claimType, setClaimType] = useState('');
  const [showSSN, setShowSSN] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [claimItems, setClaimItems] = useState<{ id: string; description: string; amount: number; date: string; provider: string; serviceType: string; diagnosis: string; procedureCode: string; }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentClaim, setCurrentClaim] = useState<InsuranceClaim | null>(null);


  const [claimData, setClaimData] = useState({
    // Policy Information
    policyNumber: '',
    policyHolder: '',
    policyHolderSSN: '',
    
    // Claim Information
    claimType: '',
    incidentDate: '',
    reportedDate: '',
    totalAmount: 0,
    
    // Provider Information
    providerName: '',
    providerAddress: '',
    providerPhone: '',
    providerTaxId: '',
    
    // Patient Information
    patientName: '',
    patientDOB: '',
    patientSSN: '',
    patientAddress: '',
    patientPhone: '',
    patientEmail: '',
    
    // Claim Details
    diagnosis: '',
    treatmentDescription: '',
    placeOfService: '',
    authorizationNumber: '',
    
    // Additional Information
    isEmergency: false,
    isAccident: false,
    accidentDescription: '',
    otherInsurance: false,
    otherInsuranceDetails: '',
    
    // Contact Information
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    contactRelationship: ''
  });

  const steps = [
    { id: 1, title: 'Select Policy', description: 'Choose insurance policy' },
    { id: 2, title: 'Claim Details', description: 'Enter claim information' },
    { id: 3, title: 'Provider Info', description: 'Healthcare provider details' },
    { id: 4, title: 'Claim Items', description: 'Add services and charges' },
    { id: 5, title: 'Documents', description: 'Upload supporting documents' },
    { id: 6, title: 'Review', description: 'Review and submit claim' }
  ];

  const [policies, setPolicies] = useState<Array<{
    id: string;
    provider: string;
    policyNumber: string;
    type: string;
    status: string;
    coverage: number;
    deductible: number;
    copay: number;
    coinsurance: number;
  }>>([]);

  useEffect(() => {
    const loadPolicies = async () => {
      try {
        const res = await insurancePolicyService.getPolicies({ status: 'active' });
        const mapped = (res.policies || []).map((p: InsurancePolicy) => ({
          id: p._id || p.policyNumber,
          provider: p.policyName,
          policyNumber: p.policyNumber,
          type: p.policyType,
          status: p.status,
          coverage: p.coverageAmount,
          deductible: p.deductible,
          copay: p.copay,
          coinsurance: p.coinsurance,
        }));
        setPolicies(mapped);
        if (!selectedPolicy && mapped.length) setSelectedPolicy(mapped[0].id);
      } catch (e) {
        console.error('Failed to load policies for submit claim:', e);
        setPolicies([]);
      }
    };
    loadPolicies();
  }, []);

  const claimTypes = [
    { value: 'medical', label: 'Medical Services', icon: <Stethoscope className="w-4 h-4" /> },
    { value: 'dental', label: 'Dental Services', icon: <Stethoscope className="w-4 h-4" /> },
    { value: 'vision', label: 'Vision Services', icon: <Eye className="w-4 h-4" /> },
    { value: 'pharmacy', label: 'Prescription Drugs', icon: <Heart className="w-4 h-4" /> },
    { value: 'mental-health', label: 'Mental Health', icon: <Activity className="w-4 h-4" /> },
    { value: 'emergency', label: 'Emergency Services', icon: <AlertTriangle className="w-4 h-4" /> },
    { value: 'accident', label: 'Accident Related', icon: <Car className="w-4 h-4" /> },
    { value: 'travel', label: 'Travel Medical', icon: <Plane className="w-4 h-4" /> }
  ];

  const requiredDocuments = [
    { id: 'itemized-bill', name: 'Itemized Bill', required: true, description: 'Detailed bill from healthcare provider' },
    { id: 'medical-records', name: 'Medical Records', required: false, description: 'Relevant medical documentation' },
    { id: 'prescription', name: 'Prescription', required: false, description: 'Doctor\'s prescription if applicable' },
    { id: 'receipts', name: 'Receipts', required: true, description: 'Payment receipts and invoices' },
    { id: 'authorization', name: 'Authorization Letter', required: false, description: 'Pre-authorization if required' },
    { id: 'accident-report', name: 'Accident Report', required: false, description: 'Police or incident report' },
    { id: 'other-insurance', name: 'Other Insurance Info', required: false, description: 'Information about other insurance' }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validate file types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const validFiles = files.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type.`,
          variant: "destructive",
        });
        return false;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB.`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });
    
    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addClaimItem = () => {
    const newItem = {
      id: Date.now().toString(),
      description: '',
      amount: 0,
      date: '',
      provider: '',
      serviceType: '',
      diagnosis: '',
      procedureCode: ''
    };
    setClaimItems(prev => [...prev, newItem]);
  };

  const removeClaimItem = (id: string) => {
    setClaimItems(prev => prev.filter(item => item.id !== id));
  };

  const updateClaimItem = (id: string, field: string, value: string | number) => {
    setClaimItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const calculateTotal = () => {
    return claimItems.reduce((total, item) => total + item.amount, 0);
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = (currentStep / steps.length) * 100;

  // Helper function to format dates for HTML date inputs
  const formatDateForInput = (dateString: string | Date | undefined): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const formatSSN = (ssn: string): string => {
    // Remove all non-digits
    const digits = ssn.replace(/\D/g, '');
    
    // Format as XXX-XX-XXXX
    if (digits.length <= 3) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 9)}`;
  };

  // Load existing claim data if editing
  useEffect(() => {
    if (claimId) {
      loadClaimData();
    }
  }, [claimId]);

  const loadClaimData = async () => {
    if (!claimId) return;
    
    setIsLoading(true);
    try {
      const response = await insuranceClaimService.getClaims();
      const allClaims = response.claims;
      const claim = allClaims.find(c => c._id === claimId);
      
      if (!claim) {
        throw new Error('Claim not found');
      }
      
      setCurrentClaim(claim);
      
      // Populate form data
      setSelectedPolicy(claim.policyId);
      setClaimData({
        policyNumber: claim.policyNumber,
        policyHolder: claim.policyHolder,
        policyHolderSSN: formatSSN(claim.policyHolderSSN || ''),
        claimType: claim.claimType,
        incidentDate: formatDateForInput(claim.incidentDate),
        reportedDate: formatDateForInput(claim.reportedDate),
        totalAmount: claim.totalAmount,
        providerName: claim.providerName,
        providerAddress: claim.providerAddress || '',
        providerPhone: claim.providerPhone || '',
        providerTaxId: claim.providerTaxId || '',
        patientName: claim.policyHolder,
        patientDOB: '',
        patientSSN: formatSSN(claim.policyHolderSSN || ''),
        patientAddress: '',
        patientPhone: '',
        patientEmail: '',
        diagnosis: claim.diagnosis || '',
        treatmentDescription: claim.treatmentDescription || '',
        placeOfService: claim.placeOfService || '',
        authorizationNumber: claim.authorizationNumber || '',
        isEmergency: claim.isEmergency || false,
        isAccident: claim.isAccident || false,
        accidentDescription: claim.accidentDescription || '',
        otherInsurance: claim.otherInsurance || false,
        otherInsuranceDetails: claim.otherInsuranceDetails || '',
        contactName: claim.contactName || '',
        contactPhone: claim.contactPhone || '',
        contactEmail: claim.contactEmail || '',
        contactRelationship: claim.contactRelationship || ''
      });
      
      setClaimItems(claim.claimItems?.map(item => ({
        ...item,
        id: item.id || Date.now().toString(),
        date: formatDateForInput(item.date)
      })) || []);
      
      toast({
        title: "Claim loaded",
        description: "Existing claim data has been loaded successfully.",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load claim data';
      console.log('Error loading claim:', errorMessage);
      
      // Only clear claimId if it's a 404 or not found error
      if (errorMessage.includes('Claim not found')) {
        setClaimId(null);
        setCurrentClaim(null);
        // Update URL to remove the invalid claimId
        navigate('/patient/submit-claim', { replace: true });
        
        toast({
          title: "Claim not found",
          description: "The claim was not found. Starting a new claim.",
          variant: "destructive",
        });
      } else {
        // For other errors, keep the claimId but show error
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load claim data when claimId is available
  useEffect(() => {
    if (claimId) {
      loadClaimData();
    }
  }, [claimId]);

  // Load most recent draft if no claimId is provided
  const loadMostRecentDraft = async () => {
    try {
      const response = await insuranceClaimService.getClaims();
      const allClaims = response.claims;
      const mostRecentDraft = allClaims.find(c => c.status === 'draft');
      
      if (mostRecentDraft) {
        setClaimId(mostRecentDraft._id);
        setCurrentClaim(mostRecentDraft);
        
        // Update URL to include the claimId
        navigate(`/patient/submit-claim/${mostRecentDraft._id}`, { replace: true });
        
        // Load the data into the form
        await loadClaimData();
        
        toast({
          title: "Draft loaded",
          description: "Your most recent draft has been loaded.",
        });
      } else {
        console.log('No existing drafts found');
      }
    } catch (error) {
      console.log('Error loading drafts:', error);
    }
  };

  // Load most recent draft on component mount if no claimId
  useEffect(() => {
    if (!claimId && !urlClaimId) {
      loadMostRecentDraft();
    }
  }, [claimId, urlClaimId]);
  
  const saveDraft = async () => {
    console.log('Save Draft clicked!');
    try {
      setIsLoading(true);

      // Ensure we have the minimum required data
      if (!selectedPolicy && policies.length) {
        setSelectedPolicy(policies[0].id);
      }
      const selectedPolicyData = policies.find(p => p.id === selectedPolicy);

      // Map flat claimData to nested structure expected by backend
      const claimDataToSave: Partial<InsuranceClaim> = {
        personalInfo: {
          firstName: claimData.policyHolder?.split(' ')[0] || '',
          lastName: claimData.policyHolder?.split(' ')[1] || '',
          dateOfBirth: claimData.patientDOB || new Date().toISOString().split('T')[0],
          ssn: claimData.patientSSN || '',
          email: claimData.patientEmail || '',
          phone: claimData.patientPhone || '',
          address: claimData.patientAddress || '',
          city: claimData.providerAddress?.split(',')[0] || '',
          state: claimData.providerAddress?.split(',')[1]?.trim() || '',
          zipCode: claimData.providerAddress?.split(',')[2]?.trim() || ''
        },
        employmentInfo: {
          employer: claimData.providerName || '',
          jobTitle: '',
          employmentStatus: 'full-time',
          annualIncome: 0
        },
        healthInfo: {
          height: 0,
          weight: 0,
          tobaccoUse: 'never',
          preExistingConditions: claimData.diagnosis || '',
          currentMedications: '',
          familyHistory: ''
        },
        coverageInfo: {
          startDate: new Date().toISOString().split('T')[0],
          coverageAmount: selectedPolicyData?.coverage || 0,
          selectedPlan: selectedPolicyData?.type || 'Health',
          riders: []
        },
        dependents: [],
        status: 'draft' as const,
        documents: [],
        isDraft: true
      };

      console.log('Saving claim data:', claimDataToSave);

      let response;
      if (claimId) {
        response = await insuranceClaimService.saveDraft(claimDataToSave);
      } else {
        response = await insuranceClaimService.saveDraft(claimDataToSave);
      }

      if (!response.success) {
        throw new Error(response.message || 'Failed to save draft');
      }

      if (!claimId) {
        const newClaimId = response.data.id;
        const savedClaim = await insuranceClaimService.getClaimById(newClaimId);
        setCurrentClaim(savedClaim);
        setClaimId(newClaimId);
        navigate(`/patient/submit-claim/${newClaimId}`, { replace: true });
      } else {
        const savedClaim = await insuranceClaimService.getClaimById(claimId);
        setCurrentClaim(savedClaim);
      }

      toast({
        title: 'Draft saved',
        description: 'Claim draft has been saved successfully.',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save draft';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const uploadDocumentsToBackend = async () => {
    if (!claimId || uploadedFiles.length === 0) return;

    try {
      console.log('Uploading documents:', uploadedFiles);
      
      // Create FormData for file upload
      const formData = new FormData();
      uploadedFiles.forEach((file, index) => {
        formData.append('documents', file);
      });
      formData.append('documentType', 'other');

      // Use the API service directly for file upload
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/insurance-claims/${claimId}/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload documents');
      }

      const result = await response.json();
      
      toast({
        title: "Documents uploaded",
        description: `${result.data.uploadedDocuments.length} documents have been uploaded successfully.`,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload documents';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const submitClaim = async () => {
    console.log('Submit Claim clicked!');
    if (!claimId) {
      toast({
        title: "Error",
        description: "Please save the draft first before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Submitting claim:', claimId);
      
      // Upload documents first if any
      if (uploadedFiles.length > 0) {
        console.log('Uploading documents before submission...');
        await uploadDocumentsToBackend();
      }

      // Prepare the complete claim data for submission
      const selectedPolicyData = policies.find(p => p.id === selectedPolicy);
      
      const claimDataToSubmit: Partial<InsuranceClaim> = {
        personalInfo: {
          firstName: claimData.policyHolder?.split(' ')[0] || '',
          lastName: claimData.policyHolder?.split(' ')[1] || '',
          dateOfBirth: claimData.patientDOB || new Date().toISOString().split('T')[0],
          ssn: claimData.patientSSN || '',
          email: claimData.patientEmail || '',
          phone: claimData.patientPhone || '',
          address: claimData.patientAddress || '',
          city: claimData.providerAddress?.split(',')[0] || '',
          state: claimData.providerAddress?.split(',')[1]?.trim() || '',
          zipCode: claimData.providerAddress?.split(',')[2]?.trim() || ''
        },
        employmentInfo: {
          employer: claimData.providerName || '',
          jobTitle: '',
          employmentStatus: 'full-time',
          annualIncome: 0
        },
        healthInfo: {
          height: 0,
          weight: 0,
          tobaccoUse: 'never',
          preExistingConditions: claimData.diagnosis || '',
          currentMedications: '',
          familyHistory: ''
        },
        coverageInfo: {
          startDate: new Date().toISOString().split('T')[0],
          coverageAmount: selectedPolicyData?.coverage || 0,
          selectedPlan: selectedPolicyData?.type || 'Health',
          riders: []
        },
        dependents: [],
        status: 'submitted' as const,
        documents: [],
        isDraft: false
      };

      // Submit the claim with all the data
      console.log('Submitting claim to backend with data:', claimDataToSubmit);
      const response = await insuranceClaimService.submitClaim(claimId, claimDataToSubmit);
      
      console.log('Claim submitted successfully:', response);
      
      toast({
        title: 'Claim submitted successfully!',
        description: `Claim ${response.data.claimNumber} has been submitted. Tracking number: ${response.data.trackingNumber}`,
      });

      // Navigate to success page or claims list
      navigate('/patient/insurance', { 
        state: { 
          message: 'Claim submitted successfully',
          claimNumber: response.data.claimNumber,
          trackingNumber: response.data.trackingNumber
        }
      });
    } catch (error: unknown) {
      console.error('Error submitting claim:', error);
      let errorMessage = 'Failed to submit claim';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Try to extract validation errors from the response
        if (error.message.includes('Claim validation failed')) {
          errorMessage = 'Please check all required fields and ensure all information is valid.';
        }
      }
      
      toast({
        title: 'Error submitting claim',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
          <div 
        className="min-h-screen bg-gray-50" 
        style={{ position: 'relative', zIndex: 1 }}

      >

        
        {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/patient/insurance')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Insurance</span>
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-health-teal border-health-teal">
                <Clock className="w-3 h-3 mr-1" />
                {claimId ? 'Draft Saved' : 'Claim in Progress'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Submit Insurance Claim</h1>
              <div className="text-sm text-gray-500">
                Step {currentStep} of {steps.length}
              </div>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`flex flex-col items-center space-y-1 ${
                    step.id <= currentStep ? 'text-health-teal' : ''
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    step.id <= currentStep ? 'bg-health-teal text-white' : 'bg-gray-200'
                  }`}>
                    {step.id < currentStep ? <CheckCircle className="w-4 h-4" /> : step.id}
                  </div>
                  <span className="text-center max-w-20">{step.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{steps[currentStep - 1].title}</CardTitle>
                <CardDescription>{steps[currentStep - 1].description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 1: Select Policy */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Select the insurance policy you want to submit a claim for. Make sure the policy is active and covers the type of claim you're submitting.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-4">
                      {policies.map((policy) => (
                        <Card
                          key={policy.id}
                          className={`cursor-pointer transition-all hover:shadow-lg ${
                            selectedPolicy === policy.id ? 'ring-2 ring-health-teal' : ''
                          }`}
                          onClick={() => setSelectedPolicy(policy.id)}
                        >
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  policy.type === 'Health' ? 'bg-health-teal' :
                                  policy.type === 'Dental' ? 'bg-health-aqua' : 'bg-health-success'
                                } text-white`}>
                                  {policy.type === 'Health' ? <Heart className="w-5 h-5" /> :
                                   policy.type === 'Dental' ? <Stethoscope className="w-5 h-5" /> :
                                   <Eye className="w-5 h-5" />}
                                </div>
                                <div>
                                  <CardTitle className="text-lg">{policy.provider}</CardTitle>
                                  <p className="text-sm text-gray-500">{policy.policyNumber}</p>
                                </div>
                              </div>
                              <Badge variant={policy.status === 'active' ? 'default' : 'secondary'}>
                                {policy.status}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Coverage:</span>
                                <p className="font-medium">${policy.coverage.toLocaleString()}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Deductible:</span>
                                <p className="font-medium">${policy.deductible.toLocaleString()}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Copay:</span>
                                <p className="font-medium">${policy.copay}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Coinsurance:</span>
                                <p className="font-medium">{policy.coinsurance}%</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 2: Claim Details */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <Tabs defaultValue="basic" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="basic">Basic Info</TabsTrigger>
                        <TabsTrigger value="details">Claim Details</TabsTrigger>
                        <TabsTrigger value="additional">Additional Info</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="basic" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="policyNumber">Policy Number *</Label>
                            <Input
                              id="policyNumber"
                              value={claimData.policyNumber}
                              onChange={(e) => setClaimData(prev => ({ ...prev, policyNumber: e.target.value }))}
                              placeholder="Enter policy number"
                            />
                          </div>
                          <div>
                            <Label htmlFor="policyHolder">Policy Holder Name *</Label>
                            <Input
                              id="policyHolder"
                              value={claimData.policyHolder}
                              onChange={(e) => setClaimData(prev => ({ ...prev, policyHolder: e.target.value }))}
                              placeholder="Enter policy holder name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="policyHolderSSN">Policy Holder SSN *</Label>
                            <div className="relative">
                              <Input
                                id="policyHolderSSN"
                                type={showSSN ? "text" : "password"}
                                value={claimData.policyHolderSSN}
                                onChange={(e) => {
                                  const formattedSSN = formatSSN(e.target.value);
                                  setClaimData(prev => ({ ...prev, policyHolderSSN: formattedSSN }));
                                }}
                                placeholder="XXX-XX-XXXX"
                                maxLength={11}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={() => setShowSSN(!showSSN)}
                              >
                                {showSSN ? <EyeOff className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                              </Button>
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="claimType">Claim Type *</Label>
                            <Select value={claimData.claimType} onValueChange={(value) => setClaimData(prev => ({ ...prev, claimType: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select claim type" />
                              </SelectTrigger>
                              <SelectContent>
                                {claimTypes.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    <div className="flex items-center space-x-2">
                                      {type.icon}
                                      <span>{type.label}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="details" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="incidentDate">Date of Service/Incident *</Label>
                            <Input
                              id="incidentDate"
                              type="date"
                              value={claimData.incidentDate}
                              onChange={(e) => setClaimData(prev => ({ ...prev, incidentDate: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="reportedDate">Date Reported</Label>
                            <Input
                              id="reportedDate"
                              type="date"
                              value={claimData.reportedDate}
                              onChange={(e) => setClaimData(prev => ({ ...prev, reportedDate: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="diagnosis">Diagnosis/Condition</Label>
                            <Input
                              id="diagnosis"
                              value={claimData.diagnosis}
                              onChange={(e) => setClaimData(prev => ({ ...prev, diagnosis: e.target.value }))}
                              placeholder="Enter diagnosis or condition"
                            />
                          </div>
                          <div>
                            <Label htmlFor="treatmentDescription">Treatment Description</Label>
                            <Textarea
                              id="treatmentDescription"
                              value={claimData.treatmentDescription}
                              onChange={(e) => setClaimData(prev => ({ ...prev, treatmentDescription: e.target.value }))}
                              placeholder="Describe the treatment or services received"
                              rows={3}
                            />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="additional" className="space-y-4">
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="isEmergency"
                              checked={claimData.isEmergency}
                              onCheckedChange={(checked) => setClaimData(prev => ({ ...prev, isEmergency: checked as boolean }))}
                            />
                            <Label htmlFor="isEmergency">This is an emergency claim</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="isAccident"
                              checked={claimData.isAccident}
                              onCheckedChange={(checked) => setClaimData(prev => ({ ...prev, isAccident: checked as boolean }))}
                            />
                            <Label htmlFor="isAccident">This claim is accident-related</Label>
                          </div>
                          {claimData.isAccident && (
                            <div>
                              <Label htmlFor="accidentDescription">Accident Description</Label>
                              <Textarea
                                id="accidentDescription"
                                value={claimData.accidentDescription}
                                onChange={(e) => setClaimData(prev => ({ ...prev, accidentDescription: e.target.value }))}
                                placeholder="Describe the accident and circumstances"
                                rows={3}
                              />
                            </div>
                          )}
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="otherInsurance"
                              checked={claimData.otherInsurance}
                              onCheckedChange={(checked) => setClaimData(prev => ({ ...prev, otherInsurance: checked as boolean }))}
                            />
                            <Label htmlFor="otherInsurance">I have other insurance coverage</Label>
                          </div>
                          {claimData.otherInsurance && (
                            <div>
                              <Label htmlFor="otherInsuranceDetails">Other Insurance Details</Label>
                              <Textarea
                                id="otherInsuranceDetails"
                                value={claimData.otherInsuranceDetails}
                                onChange={(e) => setClaimData(prev => ({ ...prev, otherInsuranceDetails: e.target.value }))}
                                placeholder="Provide details about other insurance coverage"
                                rows={3}
                              />
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                )}

                {/* Step 3: Provider Information */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <Alert>
                      <Building className="h-4 w-4" />
                      <AlertDescription>
                        Provide the healthcare provider's information. This helps us process your claim faster and more accurately.
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="providerName">Provider Name *</Label>
                        <Input
                          id="providerName"
                          value={claimData.providerName}
                          onChange={(e) => setClaimData(prev => ({ ...prev, providerName: e.target.value }))}
                          placeholder="Enter healthcare provider name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="providerTaxId">Provider Tax ID</Label>
                        <Input
                          id="providerTaxId"
                          value={claimData.providerTaxId}
                          onChange={(e) => setClaimData(prev => ({ ...prev, providerTaxId: e.target.value }))}
                          placeholder="Enter provider tax ID"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="providerAddress">Provider Address</Label>
                        <Input
                          id="providerAddress"
                          value={claimData.providerAddress}
                          onChange={(e) => setClaimData(prev => ({ ...prev, providerAddress: e.target.value }))}
                          placeholder="Enter provider address"
                        />
                      </div>
                      <div>
                        <Label htmlFor="providerPhone">Provider Phone</Label>
                        <Input
                          id="providerPhone"
                          value={claimData.providerPhone}
                          onChange={(e) => setClaimData(prev => ({ ...prev, providerPhone: e.target.value }))}
                          placeholder="Enter provider phone number"
                        />
                      </div>
                      <div>
                        <Label htmlFor="placeOfService">Place of Service</Label>
                        <Select value={claimData.placeOfService} onValueChange={(value) => setClaimData(prev => ({ ...prev, placeOfService: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select place of service" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="office">Office</SelectItem>
                            <SelectItem value="hospital">Hospital</SelectItem>
                            <SelectItem value="emergency-room">Emergency Room</SelectItem>
                            <SelectItem value="urgent-care">Urgent Care</SelectItem>
                            <SelectItem value="clinic">Clinic</SelectItem>
                            <SelectItem value="home">Home</SelectItem>
                            <SelectItem value="nursing-home">Nursing Home</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="authorizationNumber">Authorization Number</Label>
                        <Input
                          id="authorizationNumber"
                          value={claimData.authorizationNumber}
                          onChange={(e) => setClaimData(prev => ({ ...prev, authorizationNumber: e.target.value }))}
                          placeholder="Enter pre-authorization number"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Claim Items */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Claim Items</h3>
                      <Button onClick={addClaimItem} className="bg-health-teal hover:bg-health-teal/90 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Item
                      </Button>
                    </div>

                    {claimItems.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Receipt className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No claim items added yet</p>
                        <p className="text-sm">Click "Add Item" to include services and charges</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {claimItems.map((item, index) => (
                          <Card key={item.id}>
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">Item {index + 1}</CardTitle>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeClaimItem(item.id)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label>Description *</Label>
                                  <Input
                                    value={item.description}
                                    onChange={(e) => updateClaimItem(item.id, 'description', e.target.value)}
                                    placeholder="Enter service description"
                                  />
                                </div>
                                <div>
                                  <Label>Amount *</Label>
                                  <Input
                                    type="number"
                                    value={item.amount}
                                    onChange={(e) => updateClaimItem(item.id, 'amount', parseFloat(e.target.value) || 0)}
                                    placeholder="0.00"
                                    step="0.01"
                                  />
                                </div>
                                <div>
                                  <Label>Date of Service *</Label>
                                  <Input
                                    type="date"
                                    value={item.date}
                                    onChange={(e) => updateClaimItem(item.id, 'date', e.target.value)}
                                  />
                                </div>
                                <div>
                                  <Label>Provider</Label>
                                  <Input
                                    value={item.provider}
                                    onChange={(e) => updateClaimItem(item.id, 'provider', e.target.value)}
                                    placeholder="Enter provider name"
                                  />
                                </div>
                                <div>
                                  <Label>Service Type</Label>
                                  <Select value={item.serviceType} onValueChange={(value) => updateClaimItem(item.id, 'serviceType', value)}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select service type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="consultation">Consultation</SelectItem>
                                      <SelectItem value="procedure">Procedure</SelectItem>
                                      <SelectItem value="test">Test/Lab</SelectItem>
                                      <SelectItem value="medication">Medication</SelectItem>
                                      <SelectItem value="equipment">Equipment</SelectItem>
                                      <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label>Procedure Code</Label>
                                  <Input
                                    value={item.procedureCode || ''}
                                    onChange={(e) => updateClaimItem(item.id, 'procedureCode', e.target.value)}
                                    placeholder="Enter CPT/HCPCS code"
                                  />
                                </div>
                                <div className="md:col-span-2">
                                  <Label>Diagnosis</Label>
                                  <Input
                                    value={item.diagnosis || ''}
                                    onChange={(e) => updateClaimItem(item.id, 'diagnosis', e.target.value)}
                                    placeholder="Enter diagnosis code or description"
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}

                    {claimItems.length > 0 && (
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold">Total Claim Amount:</span>
                            <span className="text-2xl font-bold text-health-teal">
                              ${calculateTotal().toFixed(2)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {/* Step 5: Documents */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <Alert>
                      <FileCheck className="h-4 w-4" />
                      <AlertDescription>
                        Upload required documents to support your claim. Supported formats: PDF, JPG, PNG (Max 10MB each)
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-6">
                      {/* Required Documents */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Required Documents</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {requiredDocuments.map((doc) => (
                            <div key={doc.id} className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  {doc.required ? (
                                    <AlertTriangle className="w-4 h-4 text-red-500" />
                                  ) : (
                                    <FileText className="w-4 h-4 text-gray-400" />
                                  )}
                                  <span className="font-medium">{doc.name}</span>
                                  {doc.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                                </div>
                              </div>
                              <p className="text-sm text-gray-500 mb-3">{doc.description}</p>
                              <Button variant="outline" size="sm" className="w-full">
                                <Upload className="w-4 h-4 mr-2" />
                                Upload {doc.name}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Additional Documents */}
                      <div>
                        <Label>Upload Additional Documents</Label>
                        <div className="mt-2">
                          <Input
                            type="file"
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileUpload}
                            className="cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Uploaded Files */}
                      {uploadedFiles.length > 0 && (
                        <div>
                          <Label>Uploaded Files ({uploadedFiles.length})</Label>
                          <div className="space-y-2 mt-2">
                            {uploadedFiles.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <FileText className="w-5 h-5 text-gray-400" />
                                  <div>
                                    <p className="text-sm font-medium">{file.name}</p>
                                    <p className="text-xs text-gray-500">
                                      {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 6: Review */}
                {currentStep === 6 && (
                  <div className="space-y-6">
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Please review all information carefully before submitting. You can go back to any step to make changes.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-6">
                      {/* Selected Policy */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Selected Policy</h3>
                        {selectedPolicy && (
                          <Card>
                            <CardContent className="pt-6">
                              {(() => {
                                const policy = policies.find(p => p.id === selectedPolicy);
                                return policy ? (
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                        policy.type === 'Health' ? 'bg-health-teal' :
                                        policy.type === 'Dental' ? 'bg-health-aqua' : 'bg-health-success'
                                      } text-white`}>
                                        {policy.type === 'Health' ? <Heart className="w-5 h-5" /> :
                                         policy.type === 'Dental' ? <Stethoscope className="w-5 h-5" /> :
                                         <Eye className="w-5 h-5" />}
                                      </div>
                                      <div>
                                        <p className="font-semibold">{policy.provider}</p>
                                        <p className="text-sm text-gray-500">{policy.policyNumber}</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-semibold text-health-teal">{policy.type}</p>
                                      <p className="text-sm text-gray-500">${policy.coverage.toLocaleString()} coverage</p>
                                    </div>
                                  </div>
                                ) : null;
                              })()}
                            </CardContent>
                          </Card>
                        )}
                      </div>

                      {/* Claim Details */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Claim Details</h3>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-500">Claim Type</p>
                                <p className="font-medium">{claimData.claimType}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Date of Service</p>
                                <p className="font-medium">{claimData.incidentDate}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Provider</p>
                                <p className="font-medium">{claimData.providerName}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Total Amount</p>
                                <p className="font-medium text-health-teal">${calculateTotal().toFixed(2)}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Claim Items */}
                      {claimItems.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Claim Items ({claimItems.length})</h3>
                          <div className="space-y-2">
                            {claimItems.map((item, index) => (
                              <Card key={item.id}>
                                <CardContent className="pt-6">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="font-medium">{item.description}</p>
                                      <p className="text-sm text-gray-500">
                                        {item.date} • {item.provider}
                                      </p>
                                    </div>
                                    <p className="font-semibold">${item.amount.toFixed(2)}</p>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Documents */}
                      {uploadedFiles.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Uploaded Documents ({uploadedFiles.length})</h3>
                          <div className="space-y-2">
                            {uploadedFiles.map((file, index) => (
                              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <FileText className="w-5 h-5 text-gray-400" />
                                <div>
                                  <p className="text-sm font-medium">{file.name}</p>
                                  <p className="text-xs text-gray-500">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Claim Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Claim Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Selected Policy:</span>
                    <span className="text-sm font-medium">
                      {selectedPolicy ? policies.find(p => p.id === selectedPolicy)?.provider : 'None selected'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Claim Type:</span>
                    <span className="text-sm font-medium">{claimData.claimType || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Claim Items:</span>
                    <span className="text-sm font-medium">{claimItems.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Documents:</span>
                    <span className="text-sm font-medium">{uploadedFiles.length}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-medium">Total Amount:</span>
                    <span className="font-semibold text-health-teal">
                      ${calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Help & Support */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Need Help?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <Info className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">Claim Guide</p>
                      <p className="text-xs text-gray-600">Step-by-step instructions</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <Phone className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Claims Support</p>
                      <p className="text-xs text-gray-600">1-800-CLAIMS-1</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                    <Mail className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="text-sm font-medium">Email Support</p>
                      <p className="text-xs text-gray-600">claims@healthsecure.com</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Save Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Save Progress</CardTitle>
                  <CardDescription>
                    Save your work as you go. You can submit the claim when you're ready.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      console.log('Save Draft button clicked');
                      saveDraft();
                    }}
                    disabled={isLoading}
                    style={{ pointerEvents: 'auto' }}
                  >
                    {isLoading ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Draft
                      </>
                    )}
                  </Button>
                  

                  
                  {claimId && uploadedFiles.length > 0 && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={uploadDocumentsToBackend}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Clock className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Documents
                        </>
                      )}
                    </Button>
                  )}
                  
                  
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </Button>

          <div className="flex space-x-3">
            {currentStep < steps.length ? (
              <Button
                onClick={nextStep}
                className="bg-health-teal hover:bg-health-teal/90 text-white"
              >
                Next Step
              </Button>
            ) : (
              <div className="flex flex-col items-end space-y-2">
                <p className="text-sm text-gray-600 text-right">
                  Review your claim and submit when ready
                </p>
                <Button
                  onClick={submitClaim}
                  disabled={isSubmitting}
                  className="bg-health-success hover:bg-health-success/90 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Claim
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitClaim; 