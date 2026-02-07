import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Heart,
  Stethoscope,
  Eye,
  Shield,
  Activity,
  Plane,
  Building,
  Star,
  Calendar,
  User,
  Users,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Calculator,
  Download,
  EyeOff,
  Eye as EyeIcon,
  Plus,
  Minus,
  Trash2,
  Save,
  Send,
  Clock,
  FileCheck,
  AlertTriangle,
  Info,
  RefreshCw,
  XCircle
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
import { useToast } from '@/hooks/use-toast';
import insuranceApplicationService, { InsuranceApplication } from '@/services/insuranceApplicationService';
import insurancePolicyService from '@/services/insurancePolicyService';
import { 
  isCloudinaryConfigured, 
  mockUploadToCloudinary, 
  createUploadFormData, 
  getCloudinaryUploadUrl,
  CLOUDINARY_CONFIG
} from '../../config/cloudinary';

interface InsurancePlan {
  _id: string;
  policyName: string;
  policyType: string;
  description: string;
  coverageAmount: number;
  deductible: number;
  coinsurance: number;
  copay: number;
  outOfPocketMax: number;
  premium: {
    amount: number;
    frequency: string;
  };
  status: string;
  availableForNewEnrollments: boolean;
  eligibilityCriteria: {
    minAge: number;
    maxAge: number;
    preExistingConditions: boolean;
    waitingPeriod: number;
    requiredDocuments: string[];
  };
  coverageDetails: {
    services: string[];
    exclusions: string[];
    networkType: string;
  };
  tags: string[];
  notes: string;
}

const ApplyForInsurance: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [policies, setPolicies] = useState<InsurancePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentApplication, setCurrentApplication] = useState<InsuranceApplication | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [applicationData, setApplicationData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    ssn: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    
    // Employment Information
    employer: '',
    jobTitle: '',
    employmentStatus: '',
    annualIncome: '',
    
    // Health Information
    height: '',
    weight: '',
    tobaccoUse: '',
    preExistingConditions: '',
    currentMedications: '',
    familyHistory: '',
    
    // Dependents
    dependents: [],
    
    // Coverage Preferences
    coverageStartDate: '',
    coverageAmount: '',
    riders: [],
    
    // Documents
    documents: []
  });

  const [showSSN, setShowSSN] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  
  // Document upload state
  const [uploadedDocuments, setUploadedDocuments] = useState<{
    governmentId?: { file: File; url?: string; uploading: boolean };
    proofOfIncome?: { file: File; url?: string; uploading: boolean };
    medicalRecords?: { file: File; url?: string; uploading: boolean };
    additionalDocuments?: { file: File; url?: string; uploading: boolean };
  }>({});
  
  // Upload progress state
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  
  // Auto-save state
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // Ref to track if policies have been fetched
  const policiesFetchedRef = useRef(false);

  // Fetch available insurance policies
  useEffect(() => {
    const fetchPolicies = async () => {
      // Prevent multiple fetches
      if (policiesFetchedRef.current) return;
      
      try {
        setLoading(true);
        policiesFetchedRef.current = true;
        console.log('Fetching insurance policies...');
        const policies = await insuranceApplicationService.getAvailablePolicies();
        console.log('Policies response:', policies);
        console.log('Response type:', typeof policies);
        console.log('Is Array:', Array.isArray(policies));
        console.log('Response length:', policies?.length);
        console.log('Response keys:', Object.keys(policies || {}));
        
        // Handle both array and object responses
        let extractedPolicies = policies;
        if (policies && typeof policies === 'object' && !Array.isArray(policies)) {
          // If it's an object with a data property, extract it
          extractedPolicies = policies.data || policies.policies || [];
        }
        
        console.log('Extracted policies:', extractedPolicies);
        console.log('Policies array length:', extractedPolicies?.length);
        
        if (Array.isArray(extractedPolicies)) {
          console.log('Setting policies:', extractedPolicies);
          console.log('First policy:', extractedPolicies[0]);
          setPolicies(extractedPolicies);
          console.log('Policies set successfully:', extractedPolicies.length, 'policies');
        } else {
          console.error('Invalid policies format:', extractedPolicies);
          setPolicies([]);
        }
      } catch (error) {
        console.error('Error fetching policies:', error);
        setPolicies([]);
        // Reset the ref on error so we can retry
        policiesFetchedRef.current = false;
      } finally {
        setLoading(false);
      }
    };

    fetchPolicies();
  }, []); // Empty dependency array - only run once on mount

  // Check Cloudinary configuration on component mount
  useEffect(() => {
    if (!isCloudinaryConfigured()) {
      toast({
        title: "Cloudinary Setup Required",
        description: "Document uploads are using mock mode. Please configure Cloudinary for production use. See CLOUDINARY_SETUP.md for instructions.",
        variant: "default",
      });
    }
  }, [toast]);

  // Show auto-save notification on first visit
  useEffect(() => {
    const hasSeenAutoSaveNotice = localStorage.getItem('hasSeenAutoSaveNotice');
    if (!hasSeenAutoSaveNotice) {
      toast({
        title: "Auto-Save Enabled",
        description: "Save your application first, then your progress will be automatically saved every 2 seconds. You can safely refresh the page or come back later.",
        variant: "default",
      });
      localStorage.setItem('hasSeenAutoSaveNotice', 'true');
    }
  }, [toast]);

  // Load saved application data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('insuranceApplicationData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setApplicationData(parsedData);
        console.log('Loaded saved application data from localStorage');
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }

    const savedPlan = localStorage.getItem('selectedInsurancePlan');
    if (savedPlan) {
      setSelectedPlan(savedPlan);
      console.log('Loaded saved plan from localStorage');
    }

    const savedStep = localStorage.getItem('currentApplicationStep');
    if (savedStep) {
      setCurrentStep(parseInt(savedStep));
      console.log('Loaded saved step from localStorage');
    }

    // Check for existing applications only if we have a saved plan
    const checkExistingApplications = async () => {
      if (!savedPlan) {
        console.log('No saved plan, starting fresh application');
        return;
      }

      try {
        console.log('Checking for existing applications for saved plan:', savedPlan);
        const existingApps = await insuranceApplicationService.getUserApplications();
        console.log('Existing apps response:', existingApps);
        
        // Handle different response structures
        let applications = [];
        if (existingApps?.data?.data?.applications) {
          applications = existingApps.data.data.applications;
        } else if (existingApps?.data?.applications) {
          applications = existingApps.data.applications;
        } else if (existingApps?.applications) {
          applications = existingApps.applications;
        } else if (Array.isArray(existingApps)) {
          applications = existingApps;
        }
        
        console.log('Extracted applications:', applications);
        
        if (applications.length > 0) {
          // Only look for application matching the saved plan
          const existingApp = applications.find(
            (app: InsuranceApplication) => app.policyId === savedPlan
          );
          
          if (existingApp) {
            console.log('Found existing application for saved plan:', existingApp._id, 'Status:', existingApp.status);
            setCurrentApplication(existingApp);
            
            // Populate form data if application exists
            if (existingApp.applicant) {
              setApplicationData(prev => ({
                ...prev,
                firstName: existingApp.applicant.firstName || '',
                lastName: existingApp.applicant.lastName || '',
                dateOfBirth: existingApp.applicant.dateOfBirth || '',
                ssn: existingApp.applicant.ssn || '',
                email: existingApp.applicant.email || '',
                phone: existingApp.applicant.phone || '',
                address: existingApp.applicant.address || '',
                city: existingApp.applicant.city || '',
                state: existingApp.applicant.state || '',
                zipCode: existingApp.applicant.zipCode || '',
                employer: existingApp.employment?.employer || '',
                jobTitle: existingApp.employment?.jobTitle || '',
                employmentStatus: existingApp.employment?.employmentStatus || '',
                annualIncome: existingApp.employment?.annualIncome?.toString() || '',
                height: existingApp.health?.height || '',
                weight: existingApp.health?.weight || '',
                tobaccoUse: existingApp.health?.tobaccoUse || '',
                preExistingConditions: existingApp.health?.preExistingConditions || '',
                currentMedications: existingApp.health?.currentMedications || '',
                familyHistory: existingApp.health?.familyHistory || '',
                dependents: existingApp.dependents || [],
                coverageStartDate: existingApp.coverage?.startDate || '',
                coverageAmount: existingApp.coverage?.coverageAmount?.toString() || '',
                riders: existingApp.coverage?.riders || []
              }));
            }
          } else {
            console.log('No existing application found for saved plan, starting fresh');
            setCurrentApplication(null);
          }
        } else {
          console.log('No existing applications found');
          setCurrentApplication(null);
        }
      } catch (error) {
        console.error('Error checking existing applications:', error);
      }
    };

    // Delay the check slightly to ensure other state is loaded
    setTimeout(checkExistingApplications, 1000);
  }, []);

  // Handle plan selection and load existing application data
  useEffect(() => {
    if (!selectedPlan) {
      setCurrentApplication(null);
      return;
    }

    const loadApplicationForPlan = async () => {
      try {
        console.log('Loading application for selected plan:', selectedPlan);
        const existingApps = await insuranceApplicationService.getUserApplications();
        
        // Handle different response structures
        let applications = [];
        if (existingApps?.data?.data?.applications) {
          applications = existingApps.data.data.applications;
        } else if (existingApps?.data?.applications) {
          applications = existingApps.data.applications;
        } else if (existingApps?.applications) {
          applications = existingApps.applications;
        } else if (Array.isArray(existingApps)) {
          applications = existingApps;
        }
        
        const existingApp = applications.find(
          (app: InsuranceApplication) => app.policyId === selectedPlan
        );
        
        if (existingApp) {
          console.log('Found existing application for plan:', existingApp._id, 'Status:', existingApp.status);
          setCurrentApplication(existingApp);
          
          // Populate form data
          if (existingApp.applicant) {
            setApplicationData(prev => ({
              ...prev,
              firstName: existingApp.applicant.firstName || '',
              lastName: existingApp.applicant.lastName || '',
              dateOfBirth: existingApp.applicant.dateOfBirth || '',
              ssn: existingApp.applicant.ssn || '',
              email: existingApp.applicant.email || '',
              phone: existingApp.applicant.phone || '',
              address: existingApp.applicant.address || '',
              city: existingApp.applicant.city || '',
              state: existingApp.applicant.state || '',
              zipCode: existingApp.applicant.zipCode || '',
              employer: existingApp.employment?.employer || '',
              jobTitle: existingApp.employment?.jobTitle || '',
              employmentStatus: existingApp.employment?.employmentStatus || '',
              annualIncome: existingApp.employment?.annualIncome?.toString() || '',
              height: existingApp.health?.height || '',
              weight: existingApp.health?.weight || '',
              tobaccoUse: existingApp.health?.tobaccoUse || '',
              preExistingConditions: existingApp.health?.preExistingConditions || '',
              currentMedications: existingApp.health?.currentMedications || '',
              familyHistory: existingApp.health?.familyHistory || '',
              dependents: existingApp.dependents || [],
              coverageStartDate: existingApp.coverage?.startDate || '',
              coverageAmount: existingApp.coverage?.coverageAmount?.toString() || '',
              riders: existingApp.coverage?.riders || []
            }));
          }
        } else {
          console.log('No existing application found for plan, starting fresh');
          setCurrentApplication(null);
          // Clear form data for new application
          setApplicationData({
            firstName: '',
            lastName: '',
            dateOfBirth: '',
            ssn: '',
            email: '',
            phone: '',
            address: '',
            city: '',
            state: '',
            zipCode: '',
            employer: '',
            jobTitle: '',
            employmentStatus: '',
            annualIncome: '',
            height: '',
            weight: '',
            tobaccoUse: '',
            preExistingConditions: '',
            currentMedications: '',
            familyHistory: '',
            dependents: [],
            coverageStartDate: '',
            coverageAmount: '',
            riders: [],
            documents: []
          });
        }
      } catch (error) {
        console.error('Error loading application for plan:', error);
      }
    };

    loadApplicationForPlan();
  }, [selectedPlan]);

  // Check if all required fields are filled
  const hasRequiredFields = useCallback(() => {
    const requiredFields = {
      firstName: !!applicationData.firstName,
      lastName: !!applicationData.lastName,
      dateOfBirth: !!applicationData.dateOfBirth,
      ssn: !!applicationData.ssn,
      email: !!applicationData.email,
      phone: !!applicationData.phone,
      address: !!applicationData.address,
      city: !!applicationData.city,
      state: !!applicationData.state,
      zipCode: !!applicationData.zipCode,
      coverageStartDate: !!applicationData.coverageStartDate
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([field, hasValue]) => !hasValue)
      .map(([field]) => field);

    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields);
    }

    return missingFields.length === 0;
  }, [applicationData]);

  // Save application
  const saveApplication = async () => {
    try {
      setSaving(true);
      if (!selectedPlan) {
        toast({
          title: "Error",
          description: "Please select an insurance plan first.",
          variant: "destructive",
        });
        return;
      }

      if (!hasRequiredFields()) {
        toast({
          title: "Error",
          description: "Please fill in all required fields before saving.",
          variant: "destructive",
        });
        return;
      }

      const applicationPayload = {
        policyId: selectedPlan,
        applicant: {
          firstName: applicationData.firstName,
          lastName: applicationData.lastName,
          dateOfBirth: applicationData.dateOfBirth,
          ssn: applicationData.ssn,
          email: applicationData.email,
          phone: applicationData.phone,
          address: applicationData.address,
          city: applicationData.city,
          state: applicationData.state,
          zipCode: applicationData.zipCode
        },
        employment: {
          employer: applicationData.employer || undefined,
          jobTitle: applicationData.jobTitle || undefined,
          employmentStatus: applicationData.employmentStatus || undefined,
          annualIncome: applicationData.annualIncome ? parseFloat(applicationData.annualIncome) : undefined
        },
        health: {
          height: applicationData.height || undefined,
          weight: applicationData.weight || undefined,
          tobaccoUse: applicationData.tobaccoUse || undefined,
          preExistingConditions: applicationData.preExistingConditions || undefined,
          currentMedications: applicationData.currentMedications || undefined,
          familyHistory: applicationData.familyHistory || undefined
        },
        dependents: applicationData.dependents.map(dep => ({
          firstName: dep.firstName,
          lastName: dep.lastName,
          dateOfBirth: dep.dateOfBirth,
          relationship: dep.relationship,
          ssn: dep.ssn
        })),
        coverage: {
          startDate: applicationData.coverageStartDate,
          coverageAmount: applicationData.coverageAmount ? parseFloat(applicationData.coverageAmount) : undefined,
          riders: applicationData.riders || []
        }
      };

      if (currentApplication) {
        // Check if application is already submitted
        if (currentApplication.status === 'submitted') {
          toast({
            title: "Application Already Submitted",
            description: "This application has already been submitted and cannot be modified.",
            variant: "destructive",
          });
          return;
        }
        
        // Update existing application
        const response = await insuranceApplicationService.updateApplication(currentApplication._id, applicationPayload);
        setCurrentApplication(response.data);
        toast({
          title: "Success",
          description: "Application updated successfully.",
        });
      } else {
        // Create new application
        try {
          const response = await insuranceApplicationService.createApplication(applicationPayload);
          setCurrentApplication(response.data);
          toast({
            title: "Success",
            description: "Application created successfully.",
          });
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          if (errorMessage.includes('already have an application')) {
            // Try to fetch existing application
            try {
              const existingApps = await insuranceApplicationService.getUserApplications();
              
              // Handle different response structures
              let applications = [];
              if (existingApps?.data?.data?.applications) {
                applications = existingApps.data.data.applications;
              } else if (existingApps?.data?.applications) {
                applications = existingApps.data.applications;
              } else if (existingApps?.applications) {
                applications = existingApps.applications;
              } else if (Array.isArray(existingApps)) {
                applications = existingApps;
              }
              
              const existingApp = applications.find(
                (app: InsuranceApplication) => app.policyId === selectedPlan
              );
              if (existingApp) {
                setCurrentApplication(existingApp);
                toast({
                  title: "Application Found",
                  description: "Found your existing application for this policy. You can continue editing it.",
                });
              } else {
                throw error;
              }
            } catch (fetchError) {
              toast({
                title: "Error",
                description: "You already have an application for this policy. Please select a different policy or contact support.",
                variant: "destructive",
              });
            }
          } else {
            throw error;
          }
        }
      }
    } catch (error) {
      console.error('Error saving application:', error);
      toast({
        title: "Error",
        description: "Failed to save application. Please check all required fields and try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Auto-save function with debouncing
  const autoSave = useCallback(async () => {
    if (!selectedPlan) return; // Don't save without a plan selected
    if (!currentApplication) return; // Only auto-save after manual save
    if (!hasRequiredFields()) return; // Only auto-save when required fields are filled
    
    // Don't auto-save if application is already submitted, approved, rejected, or under review
    if (currentApplication.status === 'submitted' || 
        currentApplication.status === 'approved' || 
        currentApplication.status === 'rejected' || 
        currentApplication.status === 'under_review') {
      console.log('Application status is', currentApplication.status, '- skipping auto-save');
      return;
    }

    try {
      setAutoSaving(true);
      setHasUnsavedChanges(false);

      const applicationPayload = {
        applicant: {
          firstName: applicationData.firstName,
          lastName: applicationData.lastName,
          dateOfBirth: applicationData.dateOfBirth,
          ssn: applicationData.ssn,
          email: applicationData.email,
          phone: applicationData.phone,
          address: applicationData.address,
          city: applicationData.city,
          state: applicationData.state,
          zipCode: applicationData.zipCode
        },
        employment: {
          employer: applicationData.employer || undefined,
          jobTitle: applicationData.jobTitle || undefined,
          employmentStatus: applicationData.employmentStatus || undefined,
          annualIncome: applicationData.annualIncome ? parseFloat(applicationData.annualIncome) : undefined
        },
        health: {
          height: applicationData.height || undefined,
          weight: applicationData.weight || undefined,
          tobaccoUse: applicationData.tobaccoUse || undefined,
          preExistingConditions: applicationData.preExistingConditions || undefined,
          currentMedications: applicationData.currentMedications || undefined,
          familyHistory: applicationData.familyHistory || undefined
        },
        dependents: applicationData.dependents.map(dep => ({
          firstName: dep.firstName,
          lastName: dep.lastName,
          dateOfBirth: dep.dateOfBirth,
          relationship: dep.relationship,
          ssn: dep.ssn
        })),
        coverage: {
          startDate: applicationData.coverageStartDate,
          coverageAmount: applicationData.coverageAmount ? parseFloat(applicationData.coverageAmount) : undefined,
          riders: applicationData.riders || []
        }
      };

      // Update existing application
      const response = await insuranceApplicationService.updateApplication(currentApplication._id, applicationPayload);
      setCurrentApplication(response.data);

      setLastSaved(new Date());
      console.log('Auto-saved application data');
    } catch (error) {
      console.error('Auto-save error:', error);
      setHasUnsavedChanges(true);
    } finally {
      setAutoSaving(false);
    }
  }, [selectedPlan, applicationData, currentApplication, hasRequiredFields]);

  // Debounced auto-save effect
  useEffect(() => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    // Don't auto-save if application is in a final state
    if (selectedPlan && hasUnsavedChanges && currentApplication && 
        currentApplication.status !== 'approved' && 
        currentApplication.status !== 'rejected' && 
        currentApplication.status !== 'under_review') {
      const timeout = setTimeout(() => {
        autoSave();
      }, 2000); // 2 second delay after user stops typing

      setAutoSaveTimeout(timeout);
    }

    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [applicationData, selectedPlan, hasUnsavedChanges, currentApplication, autoSave]);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('insuranceApplicationData', JSON.stringify(applicationData));
    setHasUnsavedChanges(true);
  }, [applicationData]);

  // Save selected plan to localStorage
  useEffect(() => {
    if (selectedPlan) {
      localStorage.setItem('selectedInsurancePlan', selectedPlan);
    }
  }, [selectedPlan]);

  // Save current step to localStorage
  useEffect(() => {
    localStorage.setItem('currentApplicationStep', currentStep.toString());
  }, [currentStep]);

  // Warn user before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Get plan icon based on policy type
  const getPlanIcon = (policyType: string) => {
    switch (policyType.toLowerCase()) {
      case 'health':
        return <Heart className="w-5 h-5" />;
      case 'dental':
        return <Stethoscope className="w-5 h-5" />;
      case 'vision':
        return <Eye className="w-5 h-5" />;
      case 'life':
        return <Shield className="w-5 h-5" />;
      case 'disability':
        return <Activity className="w-5 h-5" />;
      default:
        return <Building className="w-5 h-5" />;
    }
  };

  // Get plan color based on policy type
  const getPlanColor = (policyType: string) => {
    switch (policyType.toLowerCase()) {
      case 'health':
        return 'health-teal';
      case 'dental':
        return 'health-aqua';
      case 'vision':
        return 'health-success';
      case 'life':
        return 'health-warning';
      case 'disability':
        return 'health-danger';
      default:
        return 'health-teal';
    }
  };

  // Check if form should be disabled (when application is approved, rejected, or under review)
  const isFormDisabled = () => {
    return currentApplication?.status === 'approved' || 
           currentApplication?.status === 'rejected' || 
           currentApplication?.status === 'under_review';
  };

  const steps = [
    { id: 1, title: 'Select Plan', description: 'Choose your insurance plan' },
    { id: 2, title: 'Personal Info', description: 'Basic personal information' },
    { id: 3, title: 'Health Info', description: 'Health and medical history' },
    { id: 4, title: 'Dependents', description: 'Add family members' },
    { id: 5, title: 'Documents', description: 'Upload required documents' },
    { id: 6, title: 'Review', description: 'Review and submit' }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Upload document to Cloudinary
  const uploadDocumentToCloudinary = async (file: File, documentType: string): Promise<string> => {
    try {
      console.log('Uploading to Cloudinary:', { file: file.name, documentType });
      
      if (!isCloudinaryConfigured()) {
        console.log('Cloudinary not configured, using mock upload');
        return await mockUploadToCloudinary(file, documentType);
      }

      const formData = createUploadFormData(file, documentType);
      console.log('Upload form data created:', {
        uploadPreset: CLOUDINARY_CONFIG.uploadPreset,
        folder: CLOUDINARY_CONFIG.folder,
        cloudName: CLOUDINARY_CONFIG.cloudName
      });

      const response = await fetch(getCloudinaryUploadUrl(), {
        method: 'POST',
        body: formData,
      });

      console.log('Cloudinary response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Cloudinary upload failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        
        // If Cloudinary fails, fall back to mock upload
        console.log('Falling back to mock upload due to Cloudinary error');
        return await mockUploadToCloudinary(file, documentType);
      }

      const result = await response.json();
      console.log('Cloudinary upload successful:', result);
      
      if (result.secure_url) {
        return result.secure_url;
      } else {
        throw new Error('No secure_url in Cloudinary response');
      }
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      
      // Always fall back to mock upload on any error
      console.log('Falling back to mock upload due to error');
      return await mockUploadToCloudinary(file, documentType);
    }
  };

  // Handle document upload by type
  const handleDocumentUpload = async (file: File, documentType: string) => {
    try {
      // Update state to show uploading
      setUploadedDocuments(prev => ({
        ...prev,
        [documentType]: { file, uploading: true }
      }));

      // Upload to Cloudinary
      const cloudinaryUrl = await uploadDocumentToCloudinary(file, documentType);

      // Update state with uploaded document
      setUploadedDocuments(prev => ({
        ...prev,
        [documentType]: { file, url: cloudinaryUrl, uploading: false }
      }));

      toast({
        title: "Success",
        description: `${documentType.replace(/([A-Z])/g, ' $1').trim()} uploaded successfully.`,
      });

    } catch (error) {
      console.error(`Error uploading ${documentType}:`, error);
      toast({
        title: "Error",
        description: `Failed to upload ${documentType.replace(/([A-Z])/g, ' $1').trim()}. Please try again.`,
        variant: "destructive",
      });

      // Reset state on error
      setUploadedDocuments(prev => ({
        ...prev,
        [documentType]: undefined
      }));
    }
  };

  // Handle file input change for specific document types
  const handleDocumentFileChange = (event: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size must be less than 10MB.",
          variant: "destructive",
        });
        return;
      }

      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Error",
          description: "Only PDF, JPG, and PNG files are allowed.",
          variant: "destructive",
        });
        return;
      }

      handleDocumentUpload(file, documentType);
    }
  };

  // Upload additional files to Cloudinary
  const uploadAdditionalFiles = async () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please select files to upload.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      const uploadedUrls: string[] = [];

      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        
        // Update progress
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

        try {
          const cloudinaryUrl = await uploadDocumentToCloudinary(file, 'additional');
          uploadedUrls.push(cloudinaryUrl);
          
          // Update progress to 100%
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          toast({
            title: "Error",
            description: `Failed to upload ${file.name}.`,
            variant: "destructive",
          });
        }
      }

      if (uploadedUrls.length > 0) {
        toast({
          title: "Success",
          description: `${uploadedUrls.length} file(s) uploaded successfully.`,
        });
        
        // Clear uploaded files
        setUploadedFiles([]);
        setUploadProgress({});
      }

    } catch (error) {
      console.error('Error uploading additional files:', error);
      toast({
        title: "Error",
        description: "Failed to upload files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const addDependent = () => {
    setApplicationData(prev => ({
      ...prev,
      dependents: [...prev.dependents, {
        id: Date.now(),
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        relationship: '',
        ssn: ''
      }]
    }));
  };

  const removeDependent = (id: number) => {
    setApplicationData(prev => ({
      ...prev,
      dependents: prev.dependents.filter(dep => dep.id !== id)
    }));
  };

  const updateDependent = (id: number, field: string, value: string) => {
    setApplicationData(prev => ({
      ...prev,
      dependents: prev.dependents.map(dep => 
        dep.id === id ? { ...dep, [field]: value } : dep
      )
    }));
  };

  // Clear saved data from localStorage
  const clearSavedData = () => {
    localStorage.removeItem('insuranceApplicationData');
    localStorage.removeItem('selectedInsurancePlan');
    localStorage.removeItem('currentApplicationStep');
    setHasUnsavedChanges(false);
    setLastSaved(null);
    setSelectedPlan('');
    setCurrentApplication(null);
    setCurrentStep(1);
    setApplicationData({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      ssn: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      employer: '',
      jobTitle: '',
      employmentStatus: '',
      annualIncome: '',
      height: '',
      weight: '',
      tobaccoUse: '',
      preExistingConditions: '',
      currentMedications: '',
      familyHistory: '',
      dependents: [],
      coverageStartDate: '',
      coverageAmount: '',
      riders: [],
      documents: []
    });
  };

  // Submit application
  const submitApplication = async () => {
    try {
      setSubmitting(true);
      
      if (!selectedPlan) {
        toast({
          title: "Error",
          description: "Please select an insurance plan first.",
          variant: "destructive",
        });
        return;
      }

      if (!hasRequiredFields()) {
        toast({
          title: "Error",
          description: "Please fill in all required fields before submitting.",
          variant: "destructive",
        });
        return;
      }

      let applicationToSubmit = currentApplication;

      // If no current application, try to find existing one or create new one
      if (!currentApplication) {
        try {
          // First, try to get existing applications for this plan
          const existingApps = await insuranceApplicationService.getUserApplications();
          
          // Handle different response structures
          let applications = [];
          if (existingApps?.data?.data?.applications) {
            applications = existingApps.data.data.applications;
          } else if (existingApps?.data?.applications) {
            applications = existingApps.data.applications;
          } else if (existingApps?.applications) {
            applications = existingApps.applications;
          } else if (Array.isArray(existingApps)) {
            applications = existingApps;
          }
          
          // Find application for the selected plan
          const existingApp = applications.find(
            (app: InsuranceApplication) => app.policyId === selectedPlan
          );
          
          if (existingApp) {
            console.log('Found existing application for plan:', existingApp._id);
            applicationToSubmit = existingApp;
            setCurrentApplication(existingApp);
          } else {
            // Create new application if none exists
            console.log('Creating new application for plan:', selectedPlan);
            const applicationPayload = {
              policyId: selectedPlan,
              applicant: {
                firstName: applicationData.firstName,
                lastName: applicationData.lastName,
                dateOfBirth: applicationData.dateOfBirth,
                ssn: applicationData.ssn,
                email: applicationData.email,
                phone: applicationData.phone,
                address: applicationData.address,
                city: applicationData.city,
                state: applicationData.state,
                zipCode: applicationData.zipCode
              },
              employment: {
                employer: applicationData.employer || undefined,
                jobTitle: applicationData.jobTitle || undefined,
                employmentStatus: applicationData.employmentStatus || undefined,
                annualIncome: applicationData.annualIncome ? parseFloat(applicationData.annualIncome) : undefined
              },
              health: {
                height: applicationData.height || undefined,
                weight: applicationData.weight || undefined,
                tobaccoUse: applicationData.tobaccoUse || undefined,
                preExistingConditions: applicationData.preExistingConditions || undefined,
                currentMedications: applicationData.currentMedications || undefined,
                familyHistory: applicationData.familyHistory || undefined
              },
              dependents: applicationData.dependents.map(dep => ({
                firstName: dep.firstName,
                lastName: dep.lastName,
                dateOfBirth: dep.dateOfBirth,
                relationship: dep.relationship,
                ssn: dep.ssn
              })),
              coverage: {
                startDate: applicationData.coverageStartDate,
                coverageAmount: applicationData.coverageAmount ? parseFloat(applicationData.coverageAmount) : undefined,
                riders: applicationData.riders || []
              }
            };

            const createResponse = await insuranceApplicationService.createApplication(applicationPayload);
            applicationToSubmit = createResponse.data;
            setCurrentApplication(createResponse.data);
          }
        } catch (error) {
          console.error('Error finding/creating application:', error);
          toast({
            title: "Error",
            description: "Failed to process application. Please try again.",
            variant: "destructive",
          });
          return;
        }
      }

      // Now submit the application
      if (applicationToSubmit) {
        const response = await insuranceApplicationService.submitApplication(applicationToSubmit._id);
        setCurrentApplication(response.data);
        
        // Clear saved data after successful submission
        clearSavedData();
        
        toast({
          title: "Success",
          description: "Application submitted successfully! We'll review it and get back to you soon.",
        });

        // Navigate to applications list
        navigate('/patient/insurance');
      } else {
        throw new Error('No application to submit');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Error",
        description: "Failed to submit application. Please check all required fields and try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Upload documents
  const uploadDocuments = async () => {
    if (!currentApplication || uploadedFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please save your application and select files to upload.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      for (const file of uploadedFiles) {
        await insuranceApplicationService.uploadApplicationDocuments(currentApplication._id, file);
      }
      
      setUploadedFiles([]);
      toast({
        title: "Success",
        description: "Documents uploaded successfully.",
      });
      
      // Refresh application data
      const response = await insuranceApplicationService.getApplicationById(currentApplication._id);
      setCurrentApplication(response.data);
    } catch (error) {
      console.error('Error uploading documents:', error);
      toast({
        title: "Error",
        description: "Failed to upload documents. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
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
              {currentApplication?.status === 'approved' ? (
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Application Approved
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      clearSavedData();
                      toast({
                        title: "New Application Started",
                        description: "You can now select a new insurance plan and start fresh.",
                      });
                    }}
                  >
                    Start New Application
                  </Button>
                </div>
              ) : currentApplication?.status === 'submitted' ? (
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  <Clock className="w-3 h-3 mr-1" />
                  Application Submitted
                </Badge>
              ) : currentApplication?.status === 'rejected' ? (
                <Badge variant="outline" className="text-red-600 border-red-600">
                  <XCircle className="w-3 h-3 mr-1" />
                  Application Rejected
                </Badge>
              ) : (
                <Badge variant="outline" className="text-health-teal border-health-teal">
                  <Clock className="w-3 h-3 mr-1" />
                  Application in Progress
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Apply for Insurance</h1>
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
                {/* Show approved application message */}
                {currentApplication?.status === 'approved' && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <strong>Congratulations!</strong> Your insurance application has been approved. 
                      You can now view your policy in the <strong>My Insurance</strong> section. 
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-green-800 underline"
                        onClick={() => navigate('/patient/insurance')}
                      >
                        Go to My Insurance
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
                {/* Step 1: Select Plan */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    {loading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-health-teal mx-auto mb-4"></div>
                          <p className="text-gray-600">Loading available insurance plans...</p>
                        </div>
                      </div>
                    ) : policies.length === 0 ? (
                      <div className="space-y-4">
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            No insurance plans are currently available. Please check back later or contact support.
                          </AlertDescription>
                        </Alert>
                        <Button 
                          onClick={() => window.location.reload()} 
                          variant="outline"
                          className="w-full"
                        >
                          Retry Loading Policies
                        </Button>
                        <Button 
                          onClick={async () => {
                            try {
                              console.log('Manual API test...');
                              const timestamp = new Date().getTime();
                              const response = await fetch(`http://localhost:5000/api/insurance/applications/policies/available?_t=${timestamp}`, {
                                headers: {
                                  'Content-Type': 'application/json',
                                  'Cache-Control': 'no-cache',
                                  'Pragma': 'no-cache'
                                }
                              });
                              const data = await response.json();
                              console.log('Raw API response:', data);
                              console.log('Response status:', response.status);
                              console.log('Response headers:', response.headers);
                              console.log('Data type:', typeof data);
                              console.log('Is array:', Array.isArray(data));
                              console.log('Data keys:', Object.keys(data));
                              if (data.data) {
                                console.log('Data.data type:', typeof data.data);
                                console.log('Data.data is array:', Array.isArray(data.data));
                                console.log('Data.data length:', data.data?.length);
                              }
                            } catch (error) {
                              console.error('Manual API test error:', error);
                            }
                          }} 
                          variant="outline"
                          className="w-full"
                        >
                          Test API Directly
                        </Button>
                      </div>
                    ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {policies.map((plan) => (
                        <Card
                            key={plan._id}
                          className={`cursor-pointer transition-all hover:shadow-lg ${
                              selectedPlan === plan._id ? 'ring-2 ring-health-teal' : ''
                          }`}
                            onClick={() => setSelectedPlan(plan._id)}
                        >
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                  <div className={`text-${getPlanColor(plan.policyType)}`}>
                                    {getPlanIcon(plan.policyType)}
                                </div>
                                <div>
                                    <CardTitle className="text-lg">{plan.policyName}</CardTitle>
                                    <p className="text-sm text-gray-500">{plan.policyType}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  <span className="text-sm font-medium">{plan.coverageAmount.toLocaleString()}</span>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Monthly Premium:</span>
                                  <span className="font-semibold text-health-teal">${plan.premium.amount.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Deductible:</span>
                                <span className="font-semibold">${plan.deductible.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Coverage:</span>
                                  <span className="font-semibold">${plan.coverageAmount.toLocaleString()}</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-gray-600">Features:</p>
                              <ul className="text-xs text-gray-500 space-y-1">
                                  {plan.coverageDetails.services.slice(0, 3).map((feature: string | { name: string }, index) => (
                                  <li key={index} className="flex items-center space-x-1">
                                    <CheckCircle className="w-3 h-3 text-green-500" />
                                      <span>{typeof feature === 'string' ? feature : feature.name || 'Service'}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                              <div className="pt-2">
                                <p className="text-xs text-gray-500">{plan.description}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    )}
                  </div>
                )}

                {/* Step 2: Personal Information */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <Tabs defaultValue="personal" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="personal">Personal</TabsTrigger>
                        <TabsTrigger value="contact">Contact</TabsTrigger>
                        <TabsTrigger value="employment">Employment</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="personal" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="firstName">First Name *</Label>
                            <Input
                              id="firstName"
                              value={applicationData.firstName}
                              onChange={(e) => setApplicationData(prev => ({ ...prev, firstName: e.target.value }))}
                              placeholder="Enter first name"
                              disabled={isFormDisabled()}
                            />
                          </div>
                          <div>
                            <Label htmlFor="lastName">Last Name *</Label>
                            <Input
                              id="lastName"
                              value={applicationData.lastName}
                              onChange={(e) => setApplicationData(prev => ({ ...prev, lastName: e.target.value }))}
                              placeholder="Enter last name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                            <Input
                              id="dateOfBirth"
                              type="date"
                              value={applicationData.dateOfBirth}
                              onChange={(e) => setApplicationData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="ssn">Social Security Number *</Label>
                            <div className="relative">
                              <Input
                                id="ssn"
                                type={showSSN ? "text" : "password"}
                                value={applicationData.ssn}
                                onChange={(e) => setApplicationData(prev => ({ ...prev, ssn: e.target.value }))}
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
                        </div>
                      </TabsContent>

                      <TabsContent value="contact" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="email">Email Address *</Label>
                            <Input
                              id="email"
                              type="email"
                              value={applicationData.email}
                              onChange={(e) => setApplicationData(prev => ({ ...prev, email: e.target.value }))}
                              placeholder="Enter email address"
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone Number *</Label>
                            <Input
                              id="phone"
                              type="tel"
                              value={applicationData.phone}
                              onChange={(e) => setApplicationData(prev => ({ ...prev, phone: e.target.value }))}
                              placeholder="(555) 123-4567"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label htmlFor="address">Street Address *</Label>
                            <Input
                              id="address"
                              value={applicationData.address}
                              onChange={(e) => setApplicationData(prev => ({ ...prev, address: e.target.value }))}
                              placeholder="Enter street address"
                            />
                          </div>
                          <div>
                            <Label htmlFor="city">City *</Label>
                            <Input
                              id="city"
                              value={applicationData.city}
                              onChange={(e) => setApplicationData(prev => ({ ...prev, city: e.target.value }))}
                              placeholder="Enter city"
                            />
                          </div>
                          <div>
                            <Label htmlFor="state">State *</Label>
                            <Select value={applicationData.state} onValueChange={(value) => setApplicationData(prev => ({ ...prev, state: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select state" />
                              </SelectTrigger>
                              <SelectContent>
                                {['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'].map((state) => (
                                  <SelectItem key={state} value={state}>{state}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="zipCode">ZIP Code *</Label>
                            <Input
                              id="zipCode"
                              value={applicationData.zipCode}
                              onChange={(e) => setApplicationData(prev => ({ ...prev, zipCode: e.target.value }))}
                              placeholder="Enter ZIP code"
                              maxLength={10}
                            />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="employment" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="employer">Employer</Label>
                            <Input
                              id="employer"
                              value={applicationData.employer}
                              onChange={(e) => setApplicationData(prev => ({ ...prev, employer: e.target.value }))}
                              placeholder="Enter employer name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="jobTitle">Job Title</Label>
                            <Input
                              id="jobTitle"
                              value={applicationData.jobTitle}
                              onChange={(e) => setApplicationData(prev => ({ ...prev, jobTitle: e.target.value }))}
                              placeholder="Enter job title"
                            />
                          </div>
                          <div>
                            <Label htmlFor="employmentStatus">Employment Status</Label>
                            <Select value={applicationData.employmentStatus} onValueChange={(value) => setApplicationData(prev => ({ ...prev, employmentStatus: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select employment status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="full-time">Full-time</SelectItem>
                                <SelectItem value="part-time">Part-time</SelectItem>
                                <SelectItem value="self-employed">Self-employed</SelectItem>
                                <SelectItem value="unemployed">Unemployed</SelectItem>
                                <SelectItem value="retired">Retired</SelectItem>
                                <SelectItem value="student">Student</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="annualIncome">Annual Income</Label>
                            <Input
                              id="annualIncome"
                              type="number"
                              value={applicationData.annualIncome}
                              onChange={(e) => setApplicationData(prev => ({ ...prev, annualIncome: e.target.value }))}
                              placeholder="Enter annual income"
                            />
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                )}

                {/* Step 3: Health Information */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Your health information helps us provide accurate quotes and coverage options. All information is kept confidential and secure.
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="height">Height (inches)</Label>
                        <Input
                          id="height"
                          type="number"
                          value={applicationData.height}
                          onChange={(e) => setApplicationData(prev => ({ ...prev, height: e.target.value }))}
                          placeholder="Enter height in inches"
                        />
                      </div>
                      <div>
                        <Label htmlFor="weight">Weight (lbs)</Label>
                        <Input
                          id="weight"
                          type="number"
                          value={applicationData.weight}
                          onChange={(e) => setApplicationData(prev => ({ ...prev, weight: e.target.value }))}
                          placeholder="Enter weight in pounds"
                        />
                      </div>
                      <div>
                        <Label htmlFor="tobaccoUse">Tobacco Use</Label>
                        <Select value={applicationData.tobaccoUse} onValueChange={(value) => setApplicationData(prev => ({ ...prev, tobaccoUse: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select tobacco use status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="never">Never used</SelectItem>
                            <SelectItem value="former">Former user (quit)</SelectItem>
                            <SelectItem value="current">Current user</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="coverageStartDate">Desired Coverage Start Date</Label>
                        <Input
                          id="coverageStartDate"
                          type="date"
                          value={applicationData.coverageStartDate}
                          onChange={(e) => setApplicationData(prev => ({ ...prev, coverageStartDate: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="preExistingConditions">Pre-existing Conditions</Label>
                        <Textarea
                          id="preExistingConditions"
                          value={applicationData.preExistingConditions}
                          onChange={(e) => setApplicationData(prev => ({ ...prev, preExistingConditions: e.target.value }))}
                          placeholder="List any pre-existing medical conditions, surgeries, or ongoing treatments..."
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="currentMedications">Current Medications</Label>
                        <Textarea
                          id="currentMedications"
                          value={applicationData.currentMedications}
                          onChange={(e) => setApplicationData(prev => ({ ...prev, currentMedications: e.target.value }))}
                          placeholder="List current medications and dosages..."
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="familyHistory">Family Medical History</Label>
                        <Textarea
                          id="familyHistory"
                          value={applicationData.familyHistory}
                          onChange={(e) => setApplicationData(prev => ({ ...prev, familyHistory: e.target.value }))}
                          placeholder="List any significant family medical history..."
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Dependents */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Dependents</h3>
                      <Button onClick={addDependent} className="bg-health-teal hover:bg-health-teal/90 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Dependent
                      </Button>
                    </div>

                    {applicationData.dependents.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No dependents added yet</p>
                        <p className="text-sm">Click "Add Dependent" to include family members in your coverage</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {applicationData.dependents.map((dependent, index) => (
                          <Card key={dependent.id}>
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">Dependent {index + 1}</CardTitle>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeDependent(dependent.id)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label>First Name *</Label>
                                  <Input
                                    value={dependent.firstName}
                                    onChange={(e) => updateDependent(dependent.id, 'firstName', e.target.value)}
                                    placeholder="Enter first name"
                                  />
                                </div>
                                <div>
                                  <Label>Last Name *</Label>
                                  <Input
                                    value={dependent.lastName}
                                    onChange={(e) => updateDependent(dependent.id, 'lastName', e.target.value)}
                                    placeholder="Enter last name"
                                  />
                                </div>
                                <div>
                                  <Label>Date of Birth *</Label>
                                  <Input
                                    type="date"
                                    value={dependent.dateOfBirth}
                                    onChange={(e) => updateDependent(dependent.id, 'dateOfBirth', e.target.value)}
                                  />
                                </div>
                                <div>
                                  <Label>Relationship *</Label>
                                  <Select value={dependent.relationship} onValueChange={(value) => updateDependent(dependent.id, 'relationship', value)}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select relationship" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="spouse">Spouse</SelectItem>
                                      <SelectItem value="child">Child</SelectItem>
                                      <SelectItem value="stepchild">Stepchild</SelectItem>
                                      <SelectItem value="adopted">Adopted Child</SelectItem>
                                      <SelectItem value="foster">Foster Child</SelectItem>
                                      <SelectItem value="domestic-partner">Domestic Partner</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label>Social Security Number</Label>
                                  <Input
                                    value={dependent.ssn}
                                    onChange={(e) => updateDependent(dependent.id, 'ssn', e.target.value)}
                                    placeholder="XXX-XX-XXXX"
                                    maxLength={11}
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Step 5: Documents */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <Alert>
                      <FileCheck className="h-4 w-4" />
                      <AlertDescription>
                        Upload required documents to complete your application. Supported formats: PDF, JPG, PNG (Max 10MB each)
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-4">
                      <div>
                        <Label>Required Documents</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                          {/* Government ID */}
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            {uploadedDocuments.governmentId ? (
                              <div className="space-y-2">
                                {uploadedDocuments.governmentId.uploading ? (
                                  <div className="space-y-2">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-health-teal mx-auto"></div>
                                    <p className="text-sm text-gray-600">Uploading...</p>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    <FileCheck className="w-8 h-8 mx-auto text-green-500" />
                                    <p className="text-sm font-medium text-green-600">Government ID Uploaded</p>
                                    <p className="text-xs text-gray-500">{uploadedDocuments.governmentId.file.name}</p>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      onClick={() => setUploadedDocuments(prev => ({ ...prev, governmentId: undefined }))}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <Upload className="w-8 h-8 mx-auto text-gray-400" />
                            <p className="text-sm font-medium">Government ID</p>
                            <p className="text-xs text-gray-500">Driver's license, passport, or state ID</p>
                                <div className="relative">
                                  <Input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => handleDocumentFileChange(e, 'governmentId')}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  />
                                  <Button variant="outline" size="sm" className="w-full">
                              Upload Document
                            </Button>
                          </div>
                              </div>
                            )}
                          </div>

                          {/* Proof of Income */}
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            {uploadedDocuments.proofOfIncome ? (
                              <div className="space-y-2">
                                {uploadedDocuments.proofOfIncome.uploading ? (
                                  <div className="space-y-2">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-health-teal mx-auto"></div>
                                    <p className="text-sm text-gray-600">Uploading...</p>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    <FileCheck className="w-8 h-8 mx-auto text-green-500" />
                                    <p className="text-sm font-medium text-green-600">Proof of Income Uploaded</p>
                                    <p className="text-xs text-gray-500">{uploadedDocuments.proofOfIncome.file.name}</p>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      onClick={() => setUploadedDocuments(prev => ({ ...prev, proofOfIncome: undefined }))}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <Upload className="w-8 h-8 mx-auto text-gray-400" />
                            <p className="text-sm font-medium">Proof of Income</p>
                            <p className="text-xs text-gray-500">Pay stubs, tax returns, or W-2</p>
                                <div className="relative">
                                  <Input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => handleDocumentFileChange(e, 'proofOfIncome')}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  />
                                  <Button variant="outline" size="sm" className="w-full">
                              Upload Document
                            </Button>
                          </div>
                              </div>
                            )}
                          </div>

                          {/* Medical Records */}
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            {uploadedDocuments.medicalRecords ? (
                              <div className="space-y-2">
                                {uploadedDocuments.medicalRecords.uploading ? (
                                  <div className="space-y-2">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-health-teal mx-auto"></div>
                                    <p className="text-sm text-gray-600">Uploading...</p>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    <FileCheck className="w-8 h-8 mx-auto text-green-500" />
                                    <p className="text-sm font-medium text-green-600">Medical Records Uploaded</p>
                                    <p className="text-xs text-gray-500">{uploadedDocuments.medicalRecords.file.name}</p>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      onClick={() => setUploadedDocuments(prev => ({ ...prev, medicalRecords: undefined }))}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <Upload className="w-8 h-8 mx-auto text-gray-400" />
                            <p className="text-sm font-medium">Medical Records</p>
                            <p className="text-xs text-gray-500">Recent medical history or records</p>
                                <div className="relative">
                                  <Input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => handleDocumentFileChange(e, 'medicalRecords')}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  />
                                  <Button variant="outline" size="sm" className="w-full">
                              Upload Document
                            </Button>
                          </div>
                              </div>
                            )}
                          </div>

                          {/* Additional Documents */}
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            {uploadedDocuments.additionalDocuments ? (
                              <div className="space-y-2">
                                {uploadedDocuments.additionalDocuments.uploading ? (
                                  <div className="space-y-2">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-health-teal mx-auto"></div>
                                    <p className="text-sm text-gray-600">Uploading...</p>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    <FileCheck className="w-8 h-8 mx-auto text-green-500" />
                                    <p className="text-sm font-medium text-green-600">Additional Documents Uploaded</p>
                                    <p className="text-xs text-gray-500">{uploadedDocuments.additionalDocuments.file.name}</p>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      onClick={() => setUploadedDocuments(prev => ({ ...prev, additionalDocuments: undefined }))}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <Upload className="w-8 h-8 mx-auto text-gray-400" />
                            <p className="text-sm font-medium">Additional Documents</p>
                            <p className="text-xs text-gray-500">Any other relevant documents</p>
                                <div className="relative">
                                  <Input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => handleDocumentFileChange(e, 'additionalDocuments')}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  />
                                  <Button variant="outline" size="sm" className="w-full">
                              Upload Document
                            </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label>Upload Additional Files</Label>
                        <div className="mt-2 space-y-4">
                          <Input
                            type="file"
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileUpload}
                            className="cursor-pointer"
                          />
                          
                          {uploadedFiles.length > 0 && (
                            <Button 
                              onClick={uploadAdditionalFiles}
                              disabled={uploading}
                              className="w-full"
                            >
                              {uploading ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Uploading...
                                </>
                              ) : (
                                `Upload ${uploadedFiles.length} File(s) to Cloudinary`
                              )}
                            </Button>
                          )}
                        </div>
                      </div>

                      {uploadedFiles.length > 0 && (
                        <div>
                          <Label>Uploaded Files</Label>
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
                                    {uploadProgress[file.name] !== undefined && (
                                      <div className="mt-1">
                                        <div className="w-full bg-gray-200 rounded-full h-1">
                                          <div 
                                            className="bg-health-teal h-1 rounded-full transition-all duration-300"
                                            style={{ width: `${uploadProgress[file.name]}%` }}
                                          ></div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                          {uploadProgress[file.name]}% uploaded
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(index)}
                                  className="text-red-500 hover:text-red-700"
                                  disabled={uploading}
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
                      {/* Selected Plan */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Selected Plan</h3>
                        {selectedPlan && (
                          <Card>
                            <CardContent className="pt-6">
                              {(() => {
                                const plan = policies.find(p => p._id === selectedPlan);
                                return plan ? (
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <div className={`text-${getPlanColor(plan.policyType)}`}>
                                        {getPlanIcon(plan.policyType)}
                                      </div>
                                      <div>
                                        <p className="font-semibold">{plan.policyName}</p>
                                        <p className="text-sm text-gray-500">{plan.policyType}</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-semibold text-health-teal">${plan.premium.amount}/month</p>
                                      <p className="text-sm text-gray-500">${plan.coverageAmount.toLocaleString()} coverage</p>
                                    </div>
                                  </div>
                                ) : null;
                              })()}
                            </CardContent>
                          </Card>
                        )}
                      </div>

                      {/* Personal Information */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-500">Name</p>
                                <p className="font-medium">{applicationData.firstName} {applicationData.lastName}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Date of Birth</p>
                                <p className="font-medium">{applicationData.dateOfBirth}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="font-medium">{applicationData.email}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Phone</p>
                                <p className="font-medium">{applicationData.phone}</p>
                              </div>
                              <div className="md:col-span-2">
                                <p className="text-sm text-gray-500">Address</p>
                                <p className="font-medium">
                                  {applicationData.address}, {applicationData.city}, {applicationData.state} {applicationData.zipCode}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Dependents */}
                      {applicationData.dependents.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Dependents ({applicationData.dependents.length})</h3>
                          <div className="space-y-2">
                            {applicationData.dependents.map((dependent, index) => (
                              <Card key={dependent.id}>
                                <CardContent className="pt-6">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="font-medium">{dependent.firstName} {dependent.lastName}</p>
                                      <p className="text-sm text-gray-500">
                                        {dependent.relationship} • {dependent.dateOfBirth}
                                      </p>
                                    </div>
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
              {/* Application Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Application Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Application Status */}
                  {currentApplication && (
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Status:</span>
                      <Badge variant={
                        currentApplication.status === 'submitted' ? 'default' :
                        currentApplication.status === 'draft' ? 'secondary' :
                        currentApplication.status === 'approved' ? 'default' :
                        currentApplication.status === 'rejected' ? 'destructive' :
                        'outline'
                      }>
                        {currentApplication.status === 'submitted' ? 'Submitted' :
                         currentApplication.status === 'draft' ? 'Draft' :
                         currentApplication.status === 'approved' ? 'Approved' :
                         currentApplication.status === 'rejected' ? 'Rejected' :
                         currentApplication.status}
                      </Badge>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Selected Plan:</span>
                    <span className="text-sm font-medium">
                      {selectedPlan ? policies.find(p => p._id === selectedPlan)?.policyName : 'None selected'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Monthly Premium:</span>
                    <span className="text-sm font-medium text-health-teal">
                      {selectedPlan ? `$${policies.find(p => p._id === selectedPlan)?.premium.amount}` : '$0'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Dependents:</span>
                    <span className="text-sm font-medium">{applicationData.dependents.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Documents:</span>
                    <span className="text-sm font-medium">{uploadedFiles.length}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-medium">Estimated Total:</span>
                    <span className="font-semibold text-health-teal">
                      {selectedPlan ? `$${policies.find(p => p._id === selectedPlan)?.premium.amount}` : '$0'}
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
                      <p className="text-sm font-medium">Application Guide</p>
                      <p className="text-xs text-gray-600">Step-by-step instructions</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <Phone className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Call Support</p>
                      <p className="text-xs text-gray-600">1-800-HEALTH-1</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                    <Mail className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="text-sm font-medium">Email Support</p>
                      <p className="text-xs text-gray-600">support@healthsecure.com</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Save Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Save Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Auto-save status */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Auto-save:</span>
                    <div className="flex items-center space-x-2">
                      {autoSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-health-teal"></div>
                          <span className="text-health-teal">Saving...</span>
                        </>
                      ) : lastSaved ? (
                        <>
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span className="text-green-600">Saved</span>
                        </>
                      ) : currentApplication ? (
                        <>
                          <Clock className="w-3 h-3 text-blue-400" />
                          <span className="text-blue-600">Ready</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-500">Save first</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {lastSaved && (
                    <p className="text-xs text-gray-500">
                      Last saved: {lastSaved.toLocaleTimeString()}
                    </p>
                  )}

                  {/* Manual save button */}
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={saveApplication}
                    disabled={!selectedPlan || saving || autoSaving || !hasRequiredFields()}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : (currentApplication ? 'Update Draft' : 'Save Draft')}
                  </Button>

                  {/* Force save button - always available */}
                  <Button 
                    variant="secondary" 
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      console.log('Force Save clicked');
                      console.log('Current state:', {
                        selectedPlan,
                        hasRequiredFields: hasRequiredFields(),
                        currentApplication: currentApplication?._id
                      });
                      saveApplication();
                    }}
                    disabled={!selectedPlan || saving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Force Save
                  </Button>

                  {/* Clear data button */}
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to clear all data and start fresh?')) {
                        clearSavedData();
                        toast({
                          title: "Data Cleared",
                          description: "All data has been cleared. You can start a new application.",
                        });
                      }
                    }}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Clear Data
                  </Button>

                  {/* Refresh application state button */}
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full"
                    onClick={async () => {
                      console.log('=== REFRESH STATE CLICKED ===');
                      console.log('Current token:', localStorage.getItem('token'));
                      console.log('Current state before refresh:', {
                        currentApplication: currentApplication?._id,
                        selectedPlan,
                        hasRequiredFields: hasRequiredFields()
                      });
                      
                      try {
                        console.log('Calling getUserApplications...');
                        const existingApps = await insuranceApplicationService.getUserApplications();
                        console.log('=== REFRESH RESPONSE ===');
                        console.log('Full response:', existingApps);
                        console.log('Response type:', typeof existingApps);
                        console.log('Response keys:', Object.keys(existingApps || {}));
                        console.log('Data property:', existingApps?.data);
                        console.log('Applications array:', existingApps?.data?.applications);
                        console.log('Applications length:', existingApps?.data?.applications?.length);
                        
                        // Handle different response structures
                        let applications = [];
                        if (existingApps?.data?.data?.applications) {
                          // Backend returns: { success: true, data: { applications: [], pagination: {} } }
                          applications = existingApps.data.data.applications;
                        } else if (existingApps?.data?.applications) {
                          // Alternative structure
                          applications = existingApps.data.applications;
                        } else if (existingApps?.applications) {
                          // Direct applications array
                          applications = existingApps.applications;
                        } else if (Array.isArray(existingApps)) {
                          // Direct array
                          applications = existingApps;
                        }
                        
                        console.log('Extracted applications:', applications);
                        console.log('Applications length:', applications.length);
                        
                        if (applications.length > 0) {
                          const app = applications[0];
                          console.log('Found application:', app);
                          console.log('Application ID:', app._id);
                          console.log('Policy ID:', app.policyId);
                          
                          console.log('Setting current application...');
                          setCurrentApplication(app);
                          
                          if (app.policyId) {
                            console.log('Setting selected plan to:', app.policyId);
                            setSelectedPlan(app.policyId);
                            localStorage.setItem('selectedInsurancePlan', app.policyId);
                          }
                          
                          console.log('=== REFRESH COMPLETE ===');
                          console.log('New state should be:', {
                            currentApplication: app._id,
                            selectedPlan: app.policyId
                          });
                        } else {
                          console.log('No applications found in response');
                        }
                      } catch (error) {
                        console.error('=== REFRESH ERROR ===');
                        console.error('Error refreshing application state:', error);
                        console.error('Error message:', error.message);
                        console.error('Error response:', error.response);
                        console.error('Error status:', error.response?.status);
                        console.error('Error data:', error.response?.data);
                        
                        // Show error in toast
                        toast({
                          title: "Refresh Failed",
                          description: `Error: ${error.message}`,
                          variant: "destructive"
                        });
                      }
                    }}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh State
                  </Button>

                  {/* Required fields message */}
                  {!hasRequiredFields() && (
                    <div className="text-xs text-amber-600 mt-2">
                      <AlertCircle className="w-3 h-3 inline-block mr-1" />
                      Missing required fields. Check console for details.
                    </div>
                  )}

                  {/* Force save button for unsaved changes */}
                  {hasUnsavedChanges && !autoSaving && hasRequiredFields() && (
                    <Button 
                      variant="secondary" 
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        console.log('Save Now clicked');
                        console.log('Current state:', {
                          selectedPlan,
                          hasRequiredFields: hasRequiredFields(),
                          currentApplication: currentApplication?._id,
                          applicationData
                        });
                        autoSave();
                      }}
                      disabled={!selectedPlan}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Now
                    </Button>
                  )}

                  {/* Clear draft button */}
                  {(currentApplication || Object.values(applicationData).some(value => 
                    typeof value === 'string' ? value.length > 0 : 
                    Array.isArray(value) ? value.length > 0 : 
                    value !== null && value !== undefined
                  )) && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to clear all data and start over?')) {
                          clearSavedData();
                          setApplicationData({
                            firstName: '',
                            lastName: '',
                            dateOfBirth: '',
                            ssn: '',
                            email: '',
                            phone: '',
                            address: '',
                            city: '',
                            state: '',
                            zipCode: '',
                            employer: '',
                            jobTitle: '',
                            employmentStatus: '',
                            annualIncome: '',
                            height: '',
                            weight: '',
                            tobaccoUse: '',
                            preExistingConditions: '',
                            currentMedications: '',
                            familyHistory: '',
                            dependents: [],
                            coverageStartDate: '',
                            coverageAmount: '',
                            riders: [],
                            documents: []
                          });
                          setSelectedPlan('');
                          setCurrentStep(1);
                          setCurrentApplication(null);
                          setUploadedFiles([]);
                          setUploadedDocuments({});
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear Draft
                    </Button>
                  )}

                  {currentApplication && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={uploadDocuments}
                      disabled={uploadedFiles.length === 0 || uploading}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploading ? 'Uploading...' : 'Upload Documents'}
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
                disabled={currentStep === 1 && !selectedPlan}
              >
                Next Step
              </Button>
            ) : (
              <div className="flex flex-col space-y-2">
              {selectedPlan ? (
                <Button
                    onClick={submitApplication}
                  className="bg-health-success hover:bg-health-success/90 text-white"
                    disabled={submitting || currentApplication?.status === 'submitted'}
                >
                  <Send className="w-4 h-4 mr-2" />
                    {submitting ? 'Submitting...' : 
                     currentApplication?.status === 'submitted' ? 'Application Submitted' : 
                     'Submit Application'}
                </Button>
              ) : (
                <Button
                  className="bg-gray-400 cursor-not-allowed text-white"
                  disabled={true}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Select a Plan First
                </Button>
              )}
                
                {/* Debug info */}
                <div className="text-xs text-gray-500 text-center">
                  Debug: plan={selectedPlan ? 'Selected' : 'None'}, 
                  app={currentApplication ? 'Yes' : 'No'}, 
                  submitting={submitting ? 'Yes' : 'No'},
                  status={currentApplication?.status || 'None'},
                  required={hasRequiredFields() ? 'Yes' : 'No'}
                </div>
                
                {/* Helper message for missing required fields */}
                {!hasRequiredFields() && (
                  <p className="text-xs text-amber-600 text-center">
                    <AlertCircle className="w-3 h-3 inline-block mr-1" />
                    Please fill in all required fields before submitting
                  </p>
                )}
                
                {/* Helper message for submitted application */}
                {currentApplication?.status === 'submitted' && (
                  <p className="text-xs text-green-600 text-center">
                    <CheckCircle className="w-3 h-3 inline-block mr-1" />
                    Application has been submitted successfully!
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyForInsurance; 