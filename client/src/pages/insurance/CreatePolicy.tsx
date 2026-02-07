import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  Plus, 
  Trash2, 
  Eye, 
  FileText, 
  Shield, 
  DollarSign, 
  Calendar,
  Users,
  Activity,
  Heart,
  Stethoscope,
  Eye as EyeIcon,
  Brain,
  Baby,
  Car,
  Home,
  Plane,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import insurancePolicyService, { 
  InsurancePolicy, 
  CoverageService,
  NetworkProvider,
  PolicyDocument
} from '@/services/insurancePolicyService';

const CreatePolicy = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Add console log to test if component loads
  console.log('CreatePolicy component loaded');

  const [policy, setPolicy] = useState<Partial<InsurancePolicy>>({
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
    tags: [],
    notes: ''
  });

  const policyTypes = [
    { value: 'Health', label: 'Health Insurance', icon: <Heart className="w-4 h-4" /> },
    { value: 'Dental', label: 'Dental Insurance', icon: <Stethoscope className="w-4 h-4" /> },
    { value: 'Vision', label: 'Vision Insurance', icon: <EyeIcon className="w-4 h-4" /> },
    { value: 'Life', label: 'Life Insurance', icon: <Shield className="w-4 h-4" /> },
    { value: 'Disability', label: 'Disability Insurance', icon: <Activity className="w-4 h-4" /> },
    { value: 'Mental Health', label: 'Mental Health', icon: <Brain className="w-4 h-4" /> },
    { value: 'Maternity', label: 'Maternity Care', icon: <Baby className="w-4 h-4" /> },
    { value: 'Auto', label: 'Auto Insurance', icon: <Car className="w-4 h-4" /> },
    { value: 'Home', label: 'Home Insurance', icon: <Home className="w-4 h-4" /> },
    { value: 'Travel', label: 'Travel Insurance', icon: <Plane className="w-4 h-4" /> },
    { value: 'Critical Illness', label: 'Critical Illness', icon: <AlertCircle className="w-4 h-4" /> },
    { value: 'Accident', label: 'Accident Insurance', icon: <XCircle className="w-4 h-4" /> }
  ];

  const networkTypes = [
    { value: 'PPO', label: 'Preferred Provider Organization (PPO)' },
    { value: 'HMO', label: 'Health Maintenance Organization (HMO)' },
    { value: 'EPO', label: 'Exclusive Provider Organization (EPO)' },
    { value: 'POS', label: 'Point of Service (POS)' },
    { value: 'HDHP', label: 'High Deductible Health Plan (HDHP)' },
    { value: 'Other', label: 'Other Network Type' }
  ];

  const premiumFrequencies = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'semi-annual', label: 'Semi-Annual' },
    { value: 'annual', label: 'Annual' }
  ];

  const documentTypes = [
    { value: 'policy_document', label: 'Policy Document' },
    { value: 'terms_conditions', label: 'Terms & Conditions' },
    { value: 'coverage_details', label: 'Coverage Details' },
    { value: 'claim_procedures', label: 'Claim Procedures' },
    { value: 'network_providers', label: 'Network Providers' },
    { value: 'other', label: 'Other Document' }
  ];

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    switch (step) {
      case 1: // Basic Information
        if (!policy.policyName?.trim()) errors.policyName = 'Policy name is required';
        if (!policy.description?.trim()) errors.description = 'Description is required';
        if (!policy.startDate) errors.startDate = 'Start date is required';
        if (!policy.endDate) errors.endDate = 'End date is required';
        if (policy.startDate && policy.endDate && new Date(policy.startDate) >= new Date(policy.endDate)) {
          errors.endDate = 'End date must be after start date';
        }
        break;

      case 2: // Coverage Details
        if (!policy.coverageAmount || policy.coverageAmount <= 0) errors.coverageAmount = 'Coverage amount must be greater than 0';
        if (!policy.deductible || policy.deductible < 0) errors.deductible = 'Deductible must be 0 or greater';
        if (!policy.coinsurance || policy.coinsurance < 0 || policy.coinsurance > 100) {
          errors.coinsurance = 'Coinsurance must be between 0 and 100';
        }
        if (!policy.outOfPocketMax || policy.outOfPocketMax <= 0) errors.outOfPocketMax = 'Out of pocket maximum must be greater than 0';
        break;

      case 3: // Premium Information
        if (!policy.premium?.amount || policy.premium.amount <= 0) errors.premiumAmount = 'Premium amount must be greater than 0';
        break;

      case 4: // Coverage Services
        if (!policy.coverageDetails?.services || policy.coverageDetails.services.length === 0) {
          errors.coverageServices = 'At least one coverage service is required';
        }
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 6));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const addCoverageService = () => {
    const newService: CoverageService = {
      name: '',
      description: '',
      coveragePercentage: 100,
      limits: '',
      waitingPeriod: 0
    };
    setPolicy(prev => ({
      ...prev,
      coverageDetails: {
        ...prev.coverageDetails!,
        services: [...(prev.coverageDetails?.services || []), newService]
      }
    }));
  };

  const removeCoverageService = (index: number) => {
    setPolicy(prev => ({
      ...prev,
      coverageDetails: {
        ...prev.coverageDetails!,
        services: prev.coverageDetails?.services.filter((_, i) => i !== index) || []
      }
    }));
  };

  const updateCoverageService = (index: number, field: keyof CoverageService, value: string | number) => {
    setPolicy(prev => ({
      ...prev,
      coverageDetails: {
        ...prev.coverageDetails!,
        services: prev.coverageDetails?.services.map((service, i) => 
          i === index ? { ...service, [field]: value } : service
        ) || []
      }
    }));
  };

  const addNetworkProvider = () => {
    const newProvider: NetworkProvider = {
      name: '',
      type: 'Hospital',
      location: {},
      contact: {}
    };
    setPolicy(prev => ({
      ...prev,
      networkProviders: [...(prev.networkProviders || []), newProvider]
    }));
  };

  const removeNetworkProvider = (index: number) => {
    setPolicy(prev => ({
      ...prev,
      networkProviders: prev.networkProviders?.filter((_, i) => i !== index) || []
    }));
  };

  const updateNetworkProvider = (index: number, field: string, value: string | object) => {
    setPolicy(prev => ({
      ...prev,
      networkProviders: prev.networkProviders?.map((provider, i) => 
        i === index ? { ...provider, [field]: value } : provider
      ) || []
    }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreatePolicy = async () => {
    if (!validateStep(currentStep)) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the validation errors before creating the policy',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      
      // Generate policy number if not provided
      if (!policy.policyNumber) {
        policy.policyNumber = insurancePolicyService.generatePolicyNumber();
      }

      const response = await insurancePolicyService.createPolicy(policy);
      
      toast({
        title: 'Success',
        description: 'Policy created successfully',
      });

      navigate('/insurance/policies');
    } catch (error) {
      console.error('Error creating policy:', error);
      toast({
        title: 'Error',
        description: 'Failed to create policy',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStepStatus = (step: number) => {
    if (step < currentStep) return 'completed';
    if (step === currentStep) return 'current';
    return 'upcoming';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/insurance/policies')}
                className="flex items-center space-x-2 text-gray-700 hover:text-green-600 hover:bg-green-50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="font-medium">Back to Policies</span>
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-bold text-gray-900">Create New Insurance Policy</h1>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={() => navigate('/insurance/policies')}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreatePolicy}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white font-medium"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create Policy
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Progress Steps */}
        <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <nav className="flex items-center justify-center overflow-x-auto">
            <ol className="flex items-center space-x-2 lg:space-x-6 min-w-max">
              {[
                { step: 1, title: 'Basic Information', icon: <FileText className="w-4 h-4 lg:w-5 lg:h-5" /> },
                { step: 2, title: 'Coverage Details', icon: <Shield className="w-4 h-4 lg:w-5 lg:h-5" /> },
                { step: 3, title: 'Premium Information', icon: <DollarSign className="w-4 h-4 lg:w-5 lg:h-5" /> },
                { step: 4, title: 'Coverage Services', icon: <Activity className="w-4 h-4 lg:w-5 lg:h-5" /> },
                { step: 5, title: 'Network Providers', icon: <Users className="w-4 h-4 lg:w-5 lg:h-5" /> },
                { step: 6, title: 'Documents & Review', icon: <Upload className="w-4 h-4 lg:w-5 lg:h-5" /> }
              ].map(({ step, title, icon }) => (
                <li key={step} className="flex items-center">
                  <div className={`flex items-center space-x-2 lg:space-x-3 ${
                    getStepStatus(step) === 'completed' ? 'text-green-600' :
                    getStepStatus(step) === 'current' ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    <div className={`flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-full border-2 ${
                      getStepStatus(step) === 'completed' ? 'bg-green-600 border-green-600 text-white' :
                      getStepStatus(step) === 'current' ? 'border-green-600 text-green-600 bg-green-50' : 'border-gray-300 bg-white'
                    }`}>
                      {getStepStatus(step) === 'completed' ? (
                        <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5" />
                      ) : (
                        icon
                      )}
                    </div>
                    <span className="font-medium text-sm lg:text-base whitespace-nowrap">{title}</span>
                  </div>
                  {step < 6 && (
                    <div className={`ml-2 lg:ml-6 w-4 lg:w-12 h-0.5 ${
                      getStepStatus(step) === 'completed' ? 'bg-green-600' : 'bg-gray-300'
                    }`} />
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>

        {/* Form Content */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Form */}
          <div className="xl:col-span-3">
            <Card className="border border-gray-200 shadow-sm bg-white">
              <CardContent className="p-6">
                {/* Step 1: Basic Information */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold mb-6 text-gray-900 border-b border-gray-200 pb-3">Basic Policy Information</h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="policyNumber" className="text-sm font-medium text-gray-700 mb-2 block">Policy Number</Label>
                          <Input
                            id="policyNumber"
                            placeholder="Auto-generated if empty"
                            value={policy.policyNumber}
                            onChange={(e) => setPolicy(prev => ({ ...prev, policyNumber: e.target.value }))}
                            className="border-gray-300 focus:border-green-600 focus:ring-green-600 h-10"
                          />
                          <p className="text-xs text-gray-500 mt-1">Leave empty to auto-generate</p>
                        </div>

                        <div>
                          <Label htmlFor="policyName" className="text-sm font-medium text-red-600 mb-2 block">Policy Name *</Label>
                          <Input
                            id="policyName"
                            placeholder="Enter policy name"
                            value={policy.policyName}
                            onChange={(e) => setPolicy(prev => ({ ...prev, policyName: e.target.value }))}
                            className={`border-gray-300 focus:border-green-600 focus:ring-green-600 h-10 ${
                              validationErrors.policyName ? 'border-red-500' : ''
                            }`}
                          />
                          {validationErrors.policyName && (
                            <p className="text-xs text-red-500 mt-1">{validationErrors.policyName}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="policyType" className="text-sm font-medium text-red-600 mb-2 block">Policy Type *</Label>
                          <Select 
                            value={policy.policyType}
                            onValueChange={(value) => setPolicy(prev => ({ ...prev, policyType: value as InsurancePolicy['policyType'] }))}
                          >
                            <SelectTrigger className="border-gray-300 focus:border-green-600 focus:ring-green-600 h-10">
                              <SelectValue placeholder="Select policy type" />
                            </SelectTrigger>
                            <SelectContent>
                              {policyTypes.map(type => (
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

                        <div>
                          <Label htmlFor="networkType" className="text-sm font-medium text-gray-700 mb-2 block">Network Type</Label>
                          <Select 
                            value={policy.coverageDetails?.networkType}
                            onValueChange={(value) => setPolicy(prev => ({ 
                              ...prev, 
                              coverageDetails: { ...prev.coverageDetails!, networkType: value as InsurancePolicy['coverageDetails']['networkType'] }
                            }))}
                          >
                            <SelectTrigger className="border-gray-300 focus:border-green-600 focus:ring-green-600 h-10">
                              <SelectValue placeholder="Select network type" />
                            </SelectTrigger>
                            <SelectContent>
                              {networkTypes.map(type => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="md:col-span-2">
                          <Label htmlFor="description" className="text-sm font-medium text-red-600 mb-2 block">Description *</Label>
                          <Textarea
                            id="description"
                            placeholder="Enter detailed policy description"
                            value={policy.description}
                            onChange={(e) => setPolicy(prev => ({ ...prev, description: e.target.value }))}
                            rows={4}
                            className={`border-gray-300 focus:border-green-600 focus:ring-green-600 ${
                              validationErrors.description ? 'border-red-500' : ''
                            }`}
                          />
                          {validationErrors.description && (
                            <p className="text-xs text-red-500 mt-1">{validationErrors.description}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="startDate" className="text-sm font-medium text-red-600 mb-2 block">Start Date *</Label>
                          <Input
                            id="startDate"
                            type="date"
                            value={policy.startDate}
                            onChange={(e) => setPolicy(prev => ({ ...prev, startDate: e.target.value }))}
                            className={`border-gray-300 focus:border-green-600 focus:ring-green-600 h-10 ${
                              validationErrors.startDate ? 'border-red-500' : ''
                            }`}
                          />
                          {validationErrors.startDate && (
                            <p className="text-xs text-red-500 mt-1">{validationErrors.startDate}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="endDate" className="text-sm font-medium text-red-600 mb-2 block">End Date *</Label>
                          <Input
                            id="endDate"
                            type="date"
                            value={policy.endDate}
                            onChange={(e) => setPolicy(prev => ({ ...prev, endDate: e.target.value }))}
                            className={`border-gray-300 focus:border-green-600 focus:ring-green-600 h-10 ${
                              validationErrors.endDate ? 'border-red-500' : ''
                            }`}
                          />
                          {validationErrors.endDate && (
                            <p className="text-xs text-red-500 mt-1">{validationErrors.endDate}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Coverage Details */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold mb-6 text-gray-900 border-b border-gray-200 pb-3">Coverage Details</h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="coverageAmount" className="text-sm font-medium text-red-600 mb-2 block">Coverage Amount ($) *</Label>
                          <Input
                            id="coverageAmount"
                            type="number"
                            placeholder="Enter coverage amount"
                            value={policy.coverageAmount}
                            onChange={(e) => setPolicy(prev => ({ ...prev, coverageAmount: parseFloat(e.target.value) || 0 }))}
                            className={`border-gray-300 focus:border-green-600 focus:ring-green-600 h-10 ${
                              validationErrors.coverageAmount ? 'border-red-500' : ''
                            }`}
                          />
                          {validationErrors.coverageAmount && (
                            <p className="text-xs text-red-500 mt-1">{validationErrors.coverageAmount}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="deductible" className="text-sm font-medium text-red-600 mb-2 block">Deductible ($) *</Label>
                          <Input
                            id="deductible"
                            type="number"
                            placeholder="Enter deductible amount"
                            value={policy.deductible}
                            onChange={(e) => setPolicy(prev => ({ ...prev, deductible: parseFloat(e.target.value) || 0 }))}
                            className={`border-gray-300 focus:border-green-600 focus:ring-green-600 h-10 ${
                              validationErrors.deductible ? 'border-red-500' : ''
                            }`}
                          />
                          {validationErrors.deductible && (
                            <p className="text-xs text-red-500 mt-1">{validationErrors.deductible}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="coinsurance" className="text-sm font-medium text-red-600 mb-2 block">Coinsurance (%) *</Label>
                          <Input
                            id="coinsurance"
                            type="number"
                            placeholder="Enter coinsurance percentage"
                            value={policy.coinsurance}
                            onChange={(e) => setPolicy(prev => ({ ...prev, coinsurance: parseFloat(e.target.value) || 0 }))}
                            className={`border-gray-300 focus:border-green-600 focus:ring-green-600 h-10 ${
                              validationErrors.coinsurance ? 'border-red-500' : ''
                            }`}
                          />
                          {validationErrors.coinsurance && (
                            <p className="text-xs text-red-500 mt-1">{validationErrors.coinsurance}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="copay" className="text-sm font-medium text-gray-700 mb-2 block">Copay ($)</Label>
                          <Input
                            id="copay"
                            type="number"
                            placeholder="Enter copay amount"
                            value={policy.copay}
                            onChange={(e) => setPolicy(prev => ({ ...prev, copay: parseFloat(e.target.value) || 0 }))}
                            className="border-gray-300 focus:border-green-600 focus:ring-green-600 h-10"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <Label htmlFor="outOfPocketMax" className="text-sm font-medium text-red-600 mb-2 block">Out of Pocket Maximum ($) *</Label>
                          <Input
                            id="outOfPocketMax"
                            type="number"
                            placeholder="Enter out of pocket maximum"
                            value={policy.outOfPocketMax}
                            onChange={(e) => setPolicy(prev => ({ ...prev, outOfPocketMax: parseFloat(e.target.value) || 0 }))}
                            className={`border-gray-300 focus:border-green-600 focus:ring-green-600 h-10 ${
                              validationErrors.outOfPocketMax ? 'border-red-500' : ''
                            }`}
                          />
                          {validationErrors.outOfPocketMax && (
                            <p className="text-xs text-red-500 mt-1">{validationErrors.outOfPocketMax}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Premium Information */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold mb-6 text-gray-900 border-b border-gray-200 pb-3">Premium Information</h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="premiumAmount" className="text-sm font-medium text-red-600 mb-2 block">Premium Amount ($) *</Label>
                          <Input
                            id="premiumAmount"
                            type="number"
                            placeholder="Enter premium amount"
                            value={policy.premium?.amount}
                            onChange={(e) => setPolicy(prev => ({ 
                              ...prev, 
                              premium: { ...prev.premium!, amount: parseFloat(e.target.value) || 0 }
                            }))}
                            className={`border-gray-300 focus:border-green-600 focus:ring-green-600 h-10 ${
                              validationErrors.premiumAmount ? 'border-red-500' : ''
                            }`}
                          />
                          {validationErrors.premiumAmount && (
                            <p className="text-xs text-red-500 mt-1">{validationErrors.premiumAmount}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="premiumFrequency" className="text-sm font-medium text-gray-700 mb-2 block">Premium Frequency</Label>
                          <Select 
                            value={policy.premium?.frequency}
                            onValueChange={(value) => setPolicy(prev => ({ 
                              ...prev, 
                              premium: { ...prev.premium!, frequency: value as InsurancePolicy['premium']['frequency'] }
                            }))}
                          >
                            <SelectTrigger className="border-gray-300 focus:border-green-600 focus:ring-green-600 h-10">
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              {premiumFrequencies.map(freq => (
                                <SelectItem key={freq.value} value={freq.value}>
                                  {freq.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Coverage Services */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold mb-6 text-gray-900 border-b border-gray-200 pb-3">Coverage Services</h2>
                      
                      <div className="space-y-4">
                        {policy.coverageDetails?.services.map((service, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="font-semibold text-gray-900">Service {index + 1}</h3>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeCoverageService(index)}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium text-gray-700 mb-2 block">Service Name</Label>
                                <Input
                                  placeholder="e.g., Primary Care, Specialist Care"
                                  value={service.name}
                                  onChange={(e) => updateCoverageService(index, 'name', e.target.value)}
                                  className="border-gray-300 focus:border-green-600 focus:ring-green-600 h-10"
                                />
                              </div>
                              
                              <div>
                                <Label className="text-sm font-medium text-gray-700 mb-2 block">Coverage Percentage (%)</Label>
                                <Input
                                  type="number"
                                  placeholder="100"
                                  value={service.coveragePercentage}
                                  onChange={(e) => updateCoverageService(index, 'coveragePercentage', parseFloat(e.target.value) || 0)}
                                  className="border-gray-300 focus:border-green-600 focus:ring-green-600 h-10"
                                />
                              </div>
                              
                              <div>
                                <Label className="text-sm font-medium text-gray-700 mb-2 block">Limits</Label>
                                <Input
                                  placeholder="e.g., Unlimited visits, 2 per year"
                                  value={service.limits}
                                  onChange={(e) => updateCoverageService(index, 'limits', e.target.value)}
                                  className="border-gray-300 focus:border-green-600 focus:ring-green-600 h-10"
                                />
                              </div>
                              
                              <div>
                                <Label className="text-sm font-medium text-gray-700 mb-2 block">Waiting Period (days)</Label>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  value={service.waitingPeriod}
                                  onChange={(e) => updateCoverageService(index, 'waitingPeriod', parseInt(e.target.value) || 0)}
                                  className="border-gray-300 focus:border-green-600 focus:ring-green-600 h-10"
                                />
                              </div>
                              
                              <div className="md:col-span-2">
                                <Label className="text-sm font-medium text-gray-700 mb-2 block">Description</Label>
                                <Textarea
                                  placeholder="Describe the service coverage"
                                  value={service.description}
                                  onChange={(e) => updateCoverageService(index, 'description', e.target.value)}
                                  rows={2}
                                  className="border-gray-300 focus:border-green-600 focus:ring-green-600"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addCoverageService}
                          className="w-full border-green-600 text-green-600 hover:bg-green-600 hover:text-white h-12"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Coverage Service
                        </Button>
                      </div>
                      
                      <div className="mt-6">
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">Exclusions</Label>
                        <Textarea
                          placeholder="List services or conditions not covered (e.g., Cosmetic surgery, Experimental treatments)"
                          value={policy.coverageDetails?.exclusions.join(', ')}
                          onChange={(e) => setPolicy(prev => ({
                            ...prev,
                            coverageDetails: {
                              ...prev.coverageDetails!,
                              exclusions: e.target.value.split(',').map(item => item.trim()).filter(Boolean)
                            }
                          }))}
                          rows={3}
                          className="border-gray-300 focus:border-green-600 focus:ring-green-600"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 5: Network Providers */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold mb-6 text-gray-900 border-b border-gray-200 pb-3">Network Providers</h2>
                      
                      <div className="space-y-4">
                        {policy.networkProviders?.map((provider, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="font-semibold text-gray-900">Provider {index + 1}</h3>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeNetworkProvider(index)}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium text-gray-700 mb-2 block">Provider Name</Label>
                                <Input
                                  placeholder="e.g., City General Hospital"
                                  value={provider.name}
                                  onChange={(e) => updateNetworkProvider(index, 'name', e.target.value)}
                                  className="border-gray-300 focus:border-green-600 focus:ring-green-600 h-10"
                                />
                              </div>
                              
                              <div>
                                <Label className="text-sm font-medium text-gray-700 mb-2 block">Provider Type</Label>
                                <Select
                                  value={provider.type}
                                  onValueChange={(value) => updateNetworkProvider(index, 'type', value)}
                                >
                                  <SelectTrigger className="border-gray-300 focus:border-green-600 focus:ring-green-600 h-10">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Hospital">Hospital</SelectItem>
                                    <SelectItem value="Clinic">Clinic</SelectItem>
                                    <SelectItem value="Laboratory">Laboratory</SelectItem>
                                    <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div>
                                <Label className="text-sm font-medium text-gray-700 mb-2 block">City</Label>
                                <Input
                                  placeholder="City"
                                  value={provider.location?.city}
                                  onChange={(e) => updateNetworkProvider(index, 'location', {
                                    ...provider.location,
                                    city: e.target.value
                                  })}
                                  className="border-gray-300 focus:border-green-600 focus:ring-green-600 h-10"
                                />
                              </div>
                              
                              <div>
                                <Label className="text-sm font-medium text-gray-700 mb-2 block">State</Label>
                                <Input
                                  placeholder="State"
                                  value={provider.location?.state}
                                  onChange={(e) => updateNetworkProvider(index, 'location', {
                                    ...provider.location,
                                    state: e.target.value
                                  })}
                                  className="border-gray-300 focus:border-green-600 focus:ring-green-600 h-10"
                                />
                              </div>
                              
                              <div>
                                <Label className="text-sm font-medium text-gray-700 mb-2 block">Phone</Label>
                                <Input
                                  placeholder="Phone number"
                                  value={provider.contact?.phone}
                                  onChange={(e) => updateNetworkProvider(index, 'contact', {
                                    ...provider.contact,
                                    phone: e.target.value
                                  })}
                                  className="border-gray-300 focus:border-green-600 focus:ring-green-600 h-10"
                                />
                              </div>
                              
                              <div>
                                <Label className="text-sm font-medium text-gray-700 mb-2 block">Email</Label>
                                <Input
                                  type="email"
                                  placeholder="Email address"
                                  value={provider.contact?.email}
                                  onChange={(e) => updateNetworkProvider(index, 'contact', {
                                    ...provider.contact,
                                    email: e.target.value
                                  })}
                                  className="border-gray-300 focus:border-green-600 focus:ring-green-600 h-10"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addNetworkProvider}
                          className="w-full border-green-600 text-green-600 hover:bg-green-600 hover:text-white h-12"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Network Provider
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 6: Documents & Review */}
                {currentStep === 6 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold mb-6 text-gray-900 border-b border-gray-200 pb-3">Documents & Final Review</h2>
                      
                      <div className="space-y-6">
                        {/* Document Upload */}
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">Upload Policy Documents</Label>
                          <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-green-600 transition-colors bg-gray-50">
                            <div className="text-center">
                              <Upload className="mx-auto h-12 w-12 text-gray-400" />
                              <div className="mt-4">
                                <Button
                                  variant="outline"
                                  onClick={() => document.getElementById('file-upload')?.click()}
                                  className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                                >
                                  Select Files
                                </Button>
                                <input
                                  id="file-upload"
                                  type="file"
                                  multiple
                                  className="hidden"
                                  onChange={handleFileSelect}
                                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                />
                              </div>
                              <p className="text-sm text-gray-500 mt-2">
                                PDF, DOC, DOCX, JPG, PNG up to 10MB each
                              </p>
                            </div>
                          </div>
                          
                          {selectedFiles.length > 0 && (
                            <div className="mt-4 space-y-2">
                              {selectedFiles.map((file, index) => (
                                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white">
                                  <div className="flex items-center space-x-3">
                                    <FileText className="w-5 h-5 text-green-600" />
                                    <div>
                                      <p className="font-medium text-gray-900">{file.name}</p>
                                      <p className="text-sm text-gray-500">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeFile(index)}
                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Policy Settings */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4 text-gray-900">Policy Settings</h3>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white">
                              <div>
                                <Label className="text-sm font-medium text-gray-700">Public Policy</Label>
                                <p className="text-xs text-gray-500">Make this policy visible to all users</p>
                              </div>
                              <Switch
                                checked={policy.isPublic}
                                onCheckedChange={(checked) => setPolicy(prev => ({ ...prev, isPublic: checked }))}
                              />
                            </div>
                            
                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white">
                              <div>
                                <Label className="text-sm font-medium text-gray-700">Available for New Enrollments</Label>
                                <p className="text-xs text-gray-500">Allow new users to enroll in this policy</p>
                              </div>
                              <Switch
                                checked={policy.availableForNewEnrollments}
                                onCheckedChange={(checked) => setPolicy(prev => ({ ...prev, availableForNewEnrollments: checked }))}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Eligibility Criteria */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4 text-gray-900">Eligibility Criteria</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium text-gray-700 mb-2 block">Minimum Age</Label>
                              <Input
                                type="number"
                                placeholder="0"
                                value={policy.eligibilityCriteria?.minAge}
                                onChange={(e) => setPolicy(prev => ({ 
                                  ...prev, 
                                  eligibilityCriteria: { ...prev.eligibilityCriteria!, minAge: parseInt(e.target.value) || 0 }
                                }))}
                                className="border-gray-300 focus:border-green-600 focus:ring-green-600 h-10"
                              />
                            </div>
                            
                            <div>
                              <Label className="text-sm font-medium text-gray-700 mb-2 block">Maximum Age</Label>
                              <Input
                                type="number"
                                placeholder="100"
                                value={policy.eligibilityCriteria?.maxAge}
                                onChange={(e) => setPolicy(prev => ({ 
                                  ...prev, 
                                  eligibilityCriteria: { ...prev.eligibilityCriteria!, maxAge: parseInt(e.target.value) || 100 }
                                }))}
                                className="border-gray-300 focus:border-green-600 focus:ring-green-600 h-10"
                              />
                            </div>
                            
                            <div>
                              <Label className="text-sm font-medium text-gray-700 mb-2 block">Waiting Period (days)</Label>
                              <Input
                                type="number"
                                placeholder="0"
                                value={policy.eligibilityCriteria?.waitingPeriod}
                                onChange={(e) => setPolicy(prev => ({ 
                                  ...prev, 
                                  eligibilityCriteria: { ...prev.eligibilityCriteria!, waitingPeriod: parseInt(e.target.value) || 0 }
                                }))}
                                className="border-gray-300 focus:border-green-600 focus:ring-green-600 h-10"
                              />
                            </div>
                            
                            <div className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg bg-white">
                              <Checkbox 
                                id="preExisting"
                                checked={policy.eligibilityCriteria?.preExistingConditions}
                                onCheckedChange={(checked) => setPolicy(prev => ({ 
                                  ...prev, 
                                  eligibilityCriteria: { ...prev.eligibilityCriteria!, preExistingConditions: checked as boolean }
                                }))}
                              />
                              <Label htmlFor="preExisting" className="text-sm font-medium text-gray-700">Allow Pre-existing Conditions</Label>
                            </div>
                          </div>
                        </div>

                        {/* Notes */}
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">Additional Notes</Label>
                          <Textarea
                            placeholder="Any additional notes or special instructions for this policy"
                            value={policy.notes}
                            onChange={(e) => setPolicy(prev => ({ ...prev, notes: e.target.value }))}
                            rows={3}
                            className="border-gray-300 focus:border-green-600 focus:ring-green-600"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-8">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 h-10"
                  >
                    Previous
                  </Button>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 font-medium">
                      Step {currentStep} of 6
                    </span>
                  </div>
                  
                  {currentStep === 6 ? (
                    <Button
                      onClick={handleCreatePolicy}
                      disabled={loading || Object.keys(validationErrors).length > 0}
                      className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 h-10"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Create Policy
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNext}
                      disabled={Object.keys(validationErrors).length > 0}
                      className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 h-10"
                    >
                      Next
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1">
            <div className="space-y-6">
              {/* Policy Summary */}
              <Card className="border border-gray-200 shadow-sm bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-bold text-gray-900">Policy Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-xs text-gray-500 font-medium">Policy Name</Label>
                    <p className="font-semibold text-gray-900 text-sm">{policy.policyName || 'Not specified'}</p>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-gray-500 font-medium">Policy Type</Label>
                    <div className="flex items-center space-x-2">
                      {policyTypes.find(t => t.value === policy.policyType)?.icon}
                      <span className="font-semibold text-gray-900 text-sm">{policy.policyType}</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-gray-500 font-medium">Coverage Amount</Label>
                    <p className="font-semibold text-gray-900 text-sm">
                      {policy.coverageAmount ? insurancePolicyService.formatCurrency(policy.coverageAmount) : 'Not specified'}
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-gray-500 font-medium">Premium</Label>
                    <p className="font-semibold text-gray-900 text-sm">
                      {policy.premium?.amount ? `${insurancePolicyService.formatCurrency(policy.premium.amount)}/${policy.premium.frequency}` : 'Not specified'}
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-gray-500 font-medium">Coverage Services</Label>
                    <p className="font-semibold text-gray-900 text-sm">{policy.coverageDetails?.services.length || 0} services</p>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-gray-500 font-medium">Network Providers</Label>
                    <p className="font-semibold text-gray-900 text-sm">{policy.networkProviders?.length || 0} providers</p>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-gray-500 font-medium">Documents</Label>
                    <p className="font-semibold text-gray-900 text-sm">{selectedFiles.length} files selected</p>
                  </div>
                </CardContent>
              </Card>

              {/* Validation Status */}
              <Card className="border border-gray-200 shadow-sm bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-bold text-gray-900">Validation Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.keys(validationErrors).length === 0 ? (
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">All required fields completed</span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-red-600">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Validation errors found:</span>
                        </div>
                        {Object.entries(validationErrors).map(([field, error]) => (
                          <div key={field} className="text-xs text-red-600 ml-6">
                            • {error}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePolicy; 