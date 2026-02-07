import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, Save, ArrowRight, ArrowLeft, CheckCircle, AlertCircle, X, FileText, AlertTriangle, Building, Phone, Mail, MapPin, Clock, Users, Shield, Award, Car, Wifi, Database, Ambulance } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface HospitalProfileData {
  hospitalName: string;
  hospitalType: string;
  licenseNumber: string;
  registrationNumber: string;
  establishmentDate: string;
  phone: string;
  email: string;
  website: string;
  emergencyContact: string;
  emergencyPhone: string;
  ambulancePhone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  description: string;
  mission: string;
  vision: string;
  totalBeds: number;
  departments: number;
  staffCount: number;
  insuranceAccepted: string[];
  documents: Array<{
    type: string;
    title: string;
    file: File | null;
    fileUrl?: string;
    fileName?: string;
    uploadStatus?: 'pending' | 'uploading' | 'completed' | 'error';
    required: boolean;
  }>;
  
  // Additional professional fields
  facilities: string[];
  services: string[];
  specialties: string[];
  workingDays: string[];
  accreditations: string[];
  certifications: string[];
  qualityStandards: string[];
  paymentMethods: string[];
  
  // Operating hours
  operatingHours: {
    startTime: string;
    endTime: string;
    emergency24x7: boolean;
  };
  
  // Emergency services
  emergencyServices: {
    traumaCenter: boolean;
    strokeCenter: boolean;
    heartCenter: boolean;
    burnUnit: boolean;
    neonatalICU: boolean;
    pediatricICU: boolean;
    ambulanceService: boolean;
    helicopterService: boolean;
  };
  
  // Technology capabilities
  technology: {
    mri: boolean;
    ctScan: boolean;
    xray: boolean;
    ultrasound: boolean;
    endoscopy: boolean;
    laparoscopy: boolean;
    roboticSurgery: boolean;
    telemedicine: boolean;
  };
  
  // Medical staff breakdown
  medicalStaff: {
    doctors: number;
    nurses: number;
    specialists: number;
    technicians: number;
    supportStaff: number;
  };
  
  // Ambulance services
  ambulanceServices: {
    available: boolean;
    fleetSize: number;
    responseTime: string;
    coverageArea: string;
    specialEquipment: string[];
  };
}

interface HospitalProfileCompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

const HospitalProfileCompletionDialog: React.FC<HospitalProfileCompletionDialogProps> = ({
  open,
  onOpenChange,
  onComplete
}) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<HospitalProfileData>({
    hospitalName: '',
    hospitalType: '',
    licenseNumber: '',
    registrationNumber: '',
    establishmentDate: '',
    phone: '',
    email: '',
    website: '',
    emergencyContact: '',
    emergencyPhone: '',
    ambulancePhone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States'
    },
    description: '',
    mission: '',
    vision: '',
    totalBeds: 0,
    departments: 0,
    staffCount: 0,
    insuranceAccepted: [],
    documents: [
      { type: 'license', title: 'Hospital License', file: null, required: true },
      { type: 'registration', title: 'Hospital Registration Certificate', file: null, required: true },
       { type: 'accreditation', title: 'Accreditation Certificate', file: null, required: true },
      { type: 'insurance', title: 'Medical Malpractice Insurance', file: null, required: true },
      { type: 'fire', title: 'Fire Safety Certificate', file: null, required: true },
       { type: 'hygiene', title: 'Hygiene & Sanitation Certificate', file: null, required: true },
       { type: 'quality', title: 'Quality Management Certificate', file: null, required: true },
       { type: 'safety', title: 'Patient Safety Certificate', file: null, required: true },
       { type: 'infection', title: 'Infection Control Certificate', file: null, required: true },
       { type: 'emergency', title: 'Emergency Preparedness Certificate', file: null, required: true },
       { type: 'pharmacy', title: 'Pharmacy License', file: null, required: true },
       { type: 'laboratory', title: 'Laboratory Accreditation', file: null, required: true },
       { type: 'radiology', title: 'Radiology Department License', file: null, required: true },
       { type: 'bloodbank', title: 'Blood Bank License', file: null, required: true },
       { type: 'ambulance', title: 'Ambulance Service License', file: null, required: true },
       { type: 'biohazard', title: 'Biohazard Waste Management', file: null, required: true },
       { type: 'radiation', title: 'Radiation Safety Certificate', file: null, required: true },
       { type: 'cyber', title: 'Cybersecurity Compliance', file: null, required: true },
       { type: 'privacy', title: 'HIPAA Compliance Certificate', file: null, required: true },
       { type: 'disaster', title: 'Disaster Management Plan', file: null, required: true },
       { type: 'staffing', title: 'Staff Credentialing Records', file: null, required: true }
     ],
    
    // Additional professional fields
    facilities: [],
    services: [],
    specialties: [],
    workingDays: [],
    accreditations: [],
    certifications: [],
    qualityStandards: [],
    paymentMethods: [],
    
    // Operating hours
    operatingHours: {
      startTime: '08:00',
      endTime: '20:00',
      emergency24x7: true,
    },
    
    // Emergency services
    emergencyServices: {
      traumaCenter: false,
      strokeCenter: false,
      heartCenter: false,
      burnUnit: false,
      neonatalICU: false,
      pediatricICU: false,
      ambulanceService: false,
      helicopterService: false,
    },
    
    // Technology capabilities
    technology: {
      mri: false,
      ctScan: false,
      xray: false,
      ultrasound: false,
      endoscopy: false,
      laparoscopy: false,
      roboticSurgery: false,
      telemedicine: false,
    },
    
    // Medical staff breakdown
    medicalStaff: {
      doctors: 0,
      nurses: 0,
      specialists: 0,
      technicians: 0,
      supportStaff: 0,
    },
    
    // Ambulance services
    ambulanceServices: {
      available: false,
      fleetSize: 0,
      responseTime: '',
      coverageArea: '',
      specialEquipment: [],
    },
  });

  const totalSteps = 6;
  const progress = (currentStep / totalSteps) * 100;

  const steps = [
    { id: 1, title: 'Basic Information', description: 'Hospital name, type, and contact details' },
    { id: 2, title: 'Location & Address', description: 'Hospital address and location details' },
    { id: 3, title: 'Hospital Details', description: 'Description, capacity, and insurance' },
    { id: 4, title: 'Professional Info', description: 'Operating hours, staff, and services' },
    { id: 5, title: 'Ambulance Services', description: 'Ambulance configuration and equipment' },
    { id: 6, title: 'Document Upload', description: 'Required documents and certificates' }
  ];

  useEffect(() => {
    if (open) {
      loadExistingProfile();
    }
  }, [open]);

  const loadExistingProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/hospital/profile`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setProfileData(prev => ({
            ...prev,
            ...data.data,
            // Always ensure we have the default documents array
            documents: data.data.documents?.length > 0 ? data.data.documents : [
              { type: 'license', title: 'Hospital License', file: null, required: true },
              { type: 'registration', title: 'Hospital Registration Certificate', file: null, required: true },
              { type: 'accreditation', title: 'Accreditation Certificate', file: null, required: true },
              { type: 'insurance', title: 'Medical Malpractice Insurance', file: null, required: true },
              { type: 'fire', title: 'Fire Safety Certificate', file: null, required: true },
              { type: 'hygiene', title: 'Hygiene & Sanitation Certificate', file: null, required: true },
              { type: 'quality', title: 'Quality Management Certificate', file: null, required: true },
              { type: 'safety', title: 'Patient Safety Certificate', file: null, required: true },
              { type: 'infection', title: 'Infection Control Certificate', file: null, required: true },
              { type: 'emergency', title: 'Emergency Preparedness Certificate', file: null, required: true },
              { type: 'pharmacy', title: 'Pharmacy License', file: null, required: true },
              { type: 'laboratory', title: 'Laboratory Accreditation', file: null, required: true },
              { type: 'radiology', title: 'Radiology Department License', file: null, required: true },
              { type: 'bloodbank', title: 'Blood Bank License', file: null, required: true },
              { type: 'ambulance', title: 'Ambulance Service License', file: null, required: true },
              { type: 'biohazard', title: 'Biohazard Waste Management', file: null, required: true },
              { type: 'radiation', title: 'Radiation Safety Certificate', file: null, required: true },
              { type: 'cyber', title: 'Cybersecurity Compliance', file: null, required: true },
              { type: 'privacy', title: 'HIPAA Compliance Certificate', file: null, required: true },
              { type: 'disaster', title: 'Disaster Management Plan', file: null, required: true },
              { type: 'staffing', title: 'Staff Credentialing Records', file: null, required: true }
            ]
          }));
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (parent: string, field: string, value: string | number | boolean) => {
    setProfileData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof HospitalProfileData] as Record<string, unknown>),
        [field]: value
      }
    }));
  };

  const handleArrayChange = (field: string, value: string, action: 'add' | 'remove') => {
    setProfileData(prev => {
      const currentArray = (prev[field as keyof HospitalProfileData] as string[]) || [];
      return {
      ...prev,
      [field]: action === 'add' 
          ? [...currentArray, value]
          : currentArray.filter(item => item !== value)
      };
    });
  };

     const FileUploadArea = ({ doc, onUpload }: { doc: HospitalProfileData['documents'][0], onUpload: (file: File) => void }) => {
     const [isDragOver, setIsDragOver] = useState(false);
     const fileInputRef = useRef<HTMLInputElement>(null);
   
     const handleDragOver = (e: React.DragEvent) => {
       e.preventDefault();
       setIsDragOver(true);
     };
   
     const handleDragLeave = (e: React.DragEvent) => {
       e.preventDefault();
       setIsDragOver(false);
     };
   
     const handleDrop = (e: React.DragEvent) => {
       e.preventDefault();
       setIsDragOver(false);
       const files = e.dataTransfer.files;
       if (files.length > 0) {
         onUpload(files[0]);
       }
     };
   
     const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
       const files = e.target.files;
       if (files && files.length > 0) {
         onUpload(files[0]);
       }
     };
   
     return (
       <div
         className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
           isDragOver 
             ? 'border-blue-400 bg-blue-50' 
             : 'border-gray-300 hover:border-blue-400'
         }`}
         onDragOver={handleDragOver}
         onDragLeave={handleDragLeave}
         onDrop={handleDrop}
       >
         <div className="text-center">
           {!doc.fileName ? (
             <>
               <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
               <p className="text-sm text-gray-600 mb-2">
                 {isDragOver ? 'Drop your file here' : 'Click to upload or drag and drop'}
               </p>
               <p className="text-xs text-gray-500">
                 PDF, DOC, DOCX, JPG, JPEG, PNG (max 10MB)
               </p>
               <Input
                 ref={fileInputRef}
                 type="file"
                 onChange={handleFileSelect}
                 accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                 className="mt-3"
                 disabled={doc.uploadStatus === 'uploading'}
               />
             </>
           ) : (
             <div className="flex items-center justify-center space-x-2">
               <CheckCircle className="h-6 w-6 text-green-600" />
               <span className="text-green-700 font-medium">{doc.fileName}</span>
             </div>
           )}
         </div>
       </div>
     );
  };

  const handleFileUpload = async (type: string, file: File) => {
    try {
       // Validate file size (10MB limit)
       if (file.size > 10 * 1024 * 1024) {
         toast({
           title: 'File too large',
           description: 'File size must be less than 10MB.',
           variant: 'destructive'
         });
         return;
       }

       // Validate file type
       const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/jpg', 'image/png'];
       if (!allowedTypes.includes(file.type)) {
         toast({
           title: 'Invalid file type',
           description: 'Please upload PDF, DOC, DOCX, JPG, JPEG, or PNG files only.',
           variant: 'destructive'
         });
         return;
       }

       // Update document status to uploading
       setProfileData(prev => ({
         ...prev,
         documents: prev.documents.map(doc => 
           doc.type === type 
             ? { ...doc, uploadStatus: 'uploading' as const }
             : doc
         )
       }));

       console.log('Uploading file:', file.name, 'Type:', type, 'Size:', file.size);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
       formData.append('documentType', type);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/hospital/upload-document`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Upload successful:', data);
         
        setProfileData(prev => ({
          ...prev,
          documents: prev.documents.map(doc => 
            doc.type === type 
               ? { 
                   ...doc, 
                   fileName: file.name, 
                   fileUrl: data.fileUrl, 
                   uploadStatus: 'completed' as const 
                 }
              : doc
          )
        }));
         
        toast({
          title: 'Document uploaded successfully',
           description: `${file.name} has been uploaded to Cloudinary.`
        });
      } else {
        const errorData = await response.text();
        console.error('Upload failed:', errorData);
         
         setProfileData(prev => ({
           ...prev,
           documents: prev.documents.map(doc => 
             doc.type === type 
               ? { ...doc, uploadStatus: 'error' as const }
               : doc
           )
         }));
         
        toast({
          title: 'Upload failed',
           description: `Failed to upload ${file.name}. Please try again.`,
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error uploading document:', error);
       
       setProfileData(prev => ({
         ...prev,
         documents: prev.documents.map(doc => 
           doc.type === type 
             ? { ...doc, uploadStatus: 'error' as const }
             : doc
         )
       }));
       
      toast({
        title: 'Upload failed',
         description: 'Network error. Please check your connection and try again.',
        variant: 'destructive'
      });
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(profileData.hospitalName && profileData.hospitalType && profileData.licenseNumber && profileData.phone && profileData.emergencyContact);
      case 2:
        return !!(profileData.address.street && profileData.address.city && profileData.address.state);
      case 3:
        return !!(profileData.description && profileData.totalBeds > 0 && profileData.departments > 0);
      case 4:
        return true; // Professional info is optional
      case 5:
        return true; // Ambulance services are optional
             case 6:
         return profileData.documents.every(doc => doc.fileName);
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
         } else {
       if (currentStep === 6) {
         const uploadedCount = profileData.documents.filter(doc => doc.fileName).length;
         const totalCount = profileData.documents.length;
         toast({
           title: 'Please upload all required documents',
           description: `You have uploaded ${uploadedCount} of ${totalCount} required documents. All documents must be uploaded to complete your profile.`,
           variant: 'destructive'
         });
    } else {
      toast({
        title: 'Please complete all required fields',
        description: 'All fields marked with * are required.',
        variant: 'destructive'
      });
       }
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const saveProgress = async () => {
    try {
      setSaving(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/hospital/profile/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        toast({
          title: 'Progress saved',
          description: 'Your profile progress has been saved.'
        });
      }
    } catch (error) {
      console.error('Error saving progress:', error);
      toast({
        title: 'Save failed',
        description: 'Failed to save progress. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const completeProfile = async () => {
    try {
      setSaving(true);
      console.log('Sending profile data:', profileData);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/hospital/profile/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      console.log('Profile completion response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Profile completion response:', data);
        toast({
          title: 'Profile completed successfully',
          description: 'Your hospital profile has been completed.'
        });
        onComplete();
        onOpenChange(false);
      } else {
        const errorData = await response.text();
        console.error('Profile completion failed:', errorData);
        throw new Error(`Profile completion failed: ${errorData}`);
      }
    } catch (error) {
      console.error('Error completing profile:', error);
      toast({
        title: 'Profile completion failed',
        description: 'Failed to complete profile. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Building className="h-12 w-12 text-blue-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Step 1: Basic Information</h3>
        <p className="text-gray-600">Hospital name, type, and contact details</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="hospitalName">Hospital Name *</Label>
          <Input
            id="hospitalName"
            value={profileData.hospitalName}
            onChange={(e) => handleInputChange('hospitalName', e.target.value)}
            placeholder="Enter hospital name"
          />
        </div>
        
        <div>
          <Label htmlFor="hospitalType">Hospital Type *</Label>
          <Select value={profileData.hospitalType} onValueChange={(value) => handleInputChange('hospitalType', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select hospital type" />
            </SelectTrigger>
              <SelectContent>
               <SelectItem value="General Hospital">General Hospital</SelectItem>
               <SelectItem value="Specialty Hospital">Specialty Hospital</SelectItem>
               <SelectItem value="Teaching Hospital">Teaching Hospital</SelectItem>
               <SelectItem value="Research Hospital">Research Hospital</SelectItem>
               <SelectItem value="Private Hospital">Private Hospital</SelectItem>
               <SelectItem value="Public Hospital">Public Hospital</SelectItem>
             </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="licenseNumber">License Number *</Label>
          <Input
            id="licenseNumber"
            value={profileData.licenseNumber}
            onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
            placeholder="Enter license number"
          />
        </div>
        
        <div>
          <Label htmlFor="registrationNumber">Registration Number</Label>
          <Input
            id="registrationNumber"
            value={profileData.registrationNumber}
            onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
            placeholder="Enter registration number"
          />
        </div>
        
        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            value={profileData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="Enter phone number"
          />
        </div>
        
        <div>
          <Label htmlFor="emergencyContact">Emergency Contact *</Label>
          <Input
            id="emergencyContact"
            value={profileData.emergencyContact}
            onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
            placeholder="Enter emergency contact"
          />
        </div>
        
        <div>
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={profileData.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            placeholder="Enter website URL"
          />
        </div>
        
        <div>
          <Label htmlFor="establishmentDate">Establishment Date</Label>
          <Input
            id="establishmentDate"
            type="date"
            value={profileData.establishmentDate}
            onChange={(e) => handleInputChange('establishmentDate', e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <MapPin className="h-12 w-12 text-blue-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Step 2: Location & Address</h3>
        <p className="text-gray-600">Hospital address and location details</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="street">Street Address *</Label>
          <Input
            id="street"
            value={profileData.address.street}
            onChange={(e) => handleNestedChange('address', 'street', e.target.value)}
            placeholder="Enter street address"
          />
        </div>
        
        <div>
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            value={profileData.address.city}
            onChange={(e) => handleNestedChange('address', 'city', e.target.value)}
            placeholder="Enter city"
          />
        </div>
        
        <div>
          <Label htmlFor="state">State/Province *</Label>
          <Input
            id="state"
            value={profileData.address.state}
            onChange={(e) => handleNestedChange('address', 'state', e.target.value)}
            placeholder="Enter state/province"
          />
        </div>
        
        <div>
          <Label htmlFor="zipCode">ZIP/Postal Code</Label>
          <Input
            id="zipCode"
            value={profileData.address.zipCode}
            onChange={(e) => handleNestedChange('address', 'zipCode', e.target.value)}
            placeholder="Enter ZIP/postal code"
          />
        </div>
        
        <div>
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            value={profileData.address.country}
            onChange={(e) => handleNestedChange('address', 'country', e.target.value)}
            placeholder="Enter country"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <FileText className="h-12 w-12 text-blue-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Step 3: Hospital Details</h3>
        <p className="text-gray-600">Description, capacity, and insurance</p>
      </div>
      
      <div className="space-y-6">
        <div>
          <Label htmlFor="description">Hospital Description *</Label>
          <Textarea
            id="description"
            value={profileData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe your hospital"
            rows={4}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Label htmlFor="totalBeds">Total Beds *</Label>
            <Input
              id="totalBeds"
              type="number"
              value={profileData.totalBeds}
              onChange={(e) => handleInputChange('totalBeds', parseInt(e.target.value) || 0)}
              placeholder="Enter total beds"
            />
          </div>
          
          <div>
            <Label htmlFor="departments">Number of Departments *</Label>
            <Input
              id="departments"
              type="number"
              value={profileData.departments}
              onChange={(e) => handleInputChange('departments', parseInt(e.target.value) || 0)}
              placeholder="Enter number of departments"
            />
          </div>
          
          <div>
            <Label htmlFor="staffCount">Total Staff Count</Label>
            <Input
              id="staffCount"
              type="number"
              value={profileData.staffCount}
              onChange={(e) => handleInputChange('staffCount', parseInt(e.target.value) || 0)}
              placeholder="Enter total staff count"
            />
          </div>
        </div>
        
        <div>
          <Label>Insurance Accepted</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
            {['Medicare', 'Medicaid', 'Blue Cross', 'Aetna', 'Cigna', 'UnitedHealth'].map((insurance) => (
              <div key={insurance} className="flex items-center space-x-2">
                <Checkbox
                  id={insurance}
                                     checked={(profileData.insuranceAccepted || []).includes(insurance)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleArrayChange('insuranceAccepted', insurance, 'add');
                    } else {
                      handleArrayChange('insuranceAccepted', insurance, 'remove');
                    }
                  }}
                />
                <Label htmlFor={insurance}>{insurance}</Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Shield className="h-12 w-12 text-blue-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Step 4: Professional Information</h3>
        <p className="text-gray-600">Operating hours, staff breakdown, and services</p>
      </div>
      
      <div className="space-y-6">
        {/* Operating Hours */}
        <div>
          <Label className="text-lg font-medium mb-3 block">Operating Hours</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={profileData.operatingHours.startTime}
                onChange={(e) => handleNestedChange('operatingHours', 'startTime', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={profileData.operatingHours.endTime}
                onChange={(e) => handleNestedChange('operatingHours', 'endTime', e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="emergency24x7"
                checked={profileData.operatingHours.emergency24x7}
                onCheckedChange={(checked) => {
                  handleNestedChange('operatingHours', 'emergency24x7', checked as boolean);
                }}
              />
              <Label htmlFor="emergency24x7">24/7 Emergency Service</Label>
            </div>
          </div>
        </div>

        {/* Working Days */}
        <div>
          <Label className="text-lg font-medium mb-3 block">Working Days</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
              <div key={day} className="flex items-center space-x-2">
                <Checkbox
                  id={day}
                                     checked={(profileData.workingDays || []).includes(day)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleArrayChange('workingDays', day, 'add');
                    } else {
                      handleArrayChange('workingDays', day, 'remove');
                    }
                  }}
                />
                <Label htmlFor={day} className="capitalize">{day}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Medical Staff Breakdown */}
        <div>
          <Label className="text-lg font-medium mb-3 block">Medical Staff Breakdown</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="doctors">Doctors</Label>
              <Input
                id="doctors"
                type="number"
                value={profileData.medicalStaff.doctors}
                onChange={(e) => handleNestedChange('medicalStaff', 'doctors', parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="nurses">Nurses</Label>
              <Input
                id="nurses"
                type="number"
                value={profileData.medicalStaff.nurses}
                onChange={(e) => handleNestedChange('medicalStaff', 'nurses', parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="specialists">Specialists</Label>
              <Input
                id="specialists"
                type="number"
                value={profileData.medicalStaff.specialists}
                onChange={(e) => handleNestedChange('medicalStaff', 'specialists', parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="technicians">Technicians</Label>
              <Input
                id="technicians"
                type="number"
                value={profileData.medicalStaff.technicians}
                onChange={(e) => handleNestedChange('medicalStaff', 'technicians', parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="supportStaff">Support Staff</Label>
              <Input
                id="supportStaff"
                type="number"
                value={profileData.medicalStaff.supportStaff}
                onChange={(e) => handleNestedChange('medicalStaff', 'supportStaff', parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Medical Specialties */}
        <div>
          <Label className="text-lg font-medium mb-3 block">Medical Specialties</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Gynecology', 'Oncology', 'Dermatology', 'Psychiatry', 'Emergency Medicine', 'General Surgery', 'Internal Medicine', 'Radiology'].map((specialty) => (
              <div key={specialty} className="flex items-center space-x-2">
                <Checkbox
                  id={`specialty-${specialty}`}
                                     checked={(profileData.specialties || []).includes(specialty)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleArrayChange('specialties', specialty, 'add');
                    } else {
                      handleArrayChange('specialties', specialty, 'remove');
                    }
                  }}
                />
                <Label htmlFor={`specialty-${specialty}`}>{specialty}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Technology & Equipment */}
        <div>
          <Label className="text-lg font-medium mb-3 block">Technology & Equipment</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { key: 'mri', label: 'MRI Machine' },
              { key: 'ctScan', label: 'CT Scan' },
              { key: 'xray', label: 'X-Ray Machine' },
              { key: 'ultrasound', label: 'Ultrasound' },
              { key: 'endoscopy', label: 'Endoscopy' },
              { key: 'laparoscopy', label: 'Laparoscopy' },
              { key: 'roboticSurgery', label: 'Robotic Surgery' },
              { key: 'telemedicine', label: 'Telemedicine' }
            ].map((tech) => (
              <div key={tech.key} className="flex items-center space-x-2">
                <Checkbox
                  id={`tech-${tech.key}`}
                  checked={profileData.technology[tech.key as keyof typeof profileData.technology]}
                  onCheckedChange={(checked) => {
                    handleNestedChange('technology', tech.key, checked as boolean);
                  }}
                />
                <Label htmlFor={`tech-${tech.key}`}>{tech.label}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Services */}
        <div>
          <Label className="text-lg font-medium mb-3 block">Emergency Services</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { key: 'traumaCenter', label: 'Trauma Center' },
              { key: 'strokeCenter', label: 'Stroke Center' },
              { key: 'heartCenter', label: 'Heart Center' },
              { key: 'burnUnit', label: 'Burn Unit' },
              { key: 'neonatalICU', label: 'Neonatal ICU' },
              { key: 'pediatricICU', label: 'Pediatric ICU' },
              { key: 'ambulanceService', label: 'Ambulance Service' },
              { key: 'helicopterService', label: 'Helicopter Service' }
            ].map((service) => (
              <div key={service.key} className="flex items-center space-x-2">
                <Checkbox
                  id={`emergency-${service.key}`}
                  checked={profileData.emergencyServices[service.key as keyof typeof profileData.emergencyServices]}
                  onCheckedChange={(checked) => {
                    handleNestedChange('emergencyServices', service.key, checked as boolean);
                  }}
                />
                <Label htmlFor={`emergency-${service.key}`}>{service.label}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div>
          <Label className="text-lg font-medium mb-3 block">Payment Methods</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {['Cash', 'Credit Card', 'Debit Card', 'Insurance', 'Online Payment', 'Bank Transfer', 'Cheque', 'EMI'].map((method) => (
              <div key={method} className="flex items-center space-x-2">
                <Checkbox
                  id={`payment-${method}`}
                                     checked={(profileData.paymentMethods || []).includes(method)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleArrayChange('paymentMethods', method, 'add');
                    } else {
                      handleArrayChange('paymentMethods', method, 'remove');
                    }
                  }}
                />
                <Label htmlFor={`payment-${method}`}>{method}</Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Car className="h-12 w-12 text-blue-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Step 5: Ambulance Services</h3>
        <p className="text-gray-600">Ambulance configuration and equipment</p>
      </div>
      
      <div className="space-y-6">
        {/* Ambulance Availability */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox
              id="ambulanceAvailable"
              checked={profileData.ambulanceServices.available}
              onCheckedChange={(checked) => {
                handleNestedChange('ambulanceServices', 'available', checked as boolean);
              }}
            />
            <Label htmlFor="ambulanceAvailable" className="text-lg font-medium">Ambulance Service Available</Label>
          </div>
        </div>

        {profileData.ambulanceServices.available && (
          <>
            {/* Fleet Size */}
            <div>
              <Label htmlFor="fleetSize">Fleet Size</Label>
              <Input
                id="fleetSize"
                type="number"
                value={profileData.ambulanceServices.fleetSize}
                onChange={(e) => handleNestedChange('ambulanceServices', 'fleetSize', parseInt(e.target.value) || 0)}
                placeholder="Number of ambulances"
              />
            </div>

            {/* Response Time */}
            <div>
              <Label htmlFor="responseTime">Average Response Time</Label>
              <Input
                id="responseTime"
                value={profileData.ambulanceServices.responseTime}
                onChange={(e) => handleNestedChange('ambulanceServices', 'responseTime', e.target.value)}
                placeholder="e.g., 15 minutes"
              />
            </div>

            {/* Coverage Area */}
            <div>
              <Label htmlFor="coverageArea">Coverage Area</Label>
              <Textarea
                id="coverageArea"
                value={profileData.ambulanceServices.coverageArea}
                onChange={(e) => handleNestedChange('ambulanceServices', 'coverageArea', e.target.value)}
                placeholder="Describe coverage area"
                rows={2}
              />
            </div>

            {/* Special Equipment */}
            <div>
              <Label className="text-lg font-medium mb-3 block">Special Equipment</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {['Ventilator', 'Defibrillator', 'ECG Machine', 'Oxygen Supply', 'Stretcher', 'First Aid Kit', 'Neonatal Incubator', 'Cardiac Monitor'].map((equipment) => (
                  <div key={equipment} className="flex items-center space-x-2">
                                         <Checkbox
                       id={`equipment-${equipment}`}
                       checked={(profileData.ambulanceServices.specialEquipment || []).includes(equipment)}
                       onCheckedChange={(checked) => {
                         const currentEquipment = profileData.ambulanceServices.specialEquipment || [];
                         if (checked) {
                           setProfileData(prev => ({
                             ...prev,
                             ambulanceServices: {
                               ...prev.ambulanceServices,
                               specialEquipment: [...currentEquipment, equipment]
                             }
                           }));
                         } else {
                           setProfileData(prev => ({
                             ...prev,
                             ambulanceServices: {
                               ...prev.ambulanceServices,
                               specialEquipment: currentEquipment.filter(eq => eq !== equipment)
                             }
                           }));
                         }
                       }}
                     />
                    <Label htmlFor={`equipment-${equipment}`}>{equipment}</Label>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

     const renderStep6 = () => (
       <div className="space-y-6">
       <div className="text-center mb-6">
         <Upload className="h-12 w-12 text-blue-500 mx-auto mb-4" />
         <h3 className="text-lg font-semibold mb-2">Step 6: Document Upload</h3>
         <p className="text-gray-600">All professional documents are required for hospital registration</p>
       </div>
       
               {/* Upload Progress Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-blue-900">Upload Progress</span>
            <span className="text-sm text-blue-700">
              {profileData.documents.filter(doc => doc.fileName).length} / {profileData.documents.length} documents uploaded
            </span>
          </div>
          <Progress 
            value={(profileData.documents.filter(doc => doc.fileName).length / profileData.documents.length) * 100} 
            className="h-2" 
          />
          <div className="mt-2 text-xs text-blue-600">
            All documents will be securely uploaded to Cloudinary and stored in your hospital profile.
          </div>
        </div>
       
                       <div className="space-y-4 max-h-96 overflow-y-auto">
          {profileData.documents?.map((doc) => (
            <div key={doc.type} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <Label className="font-semibold text-gray-900">{doc.title}</Label>
                    <p className="text-sm text-gray-500">Upload your {doc.title.toLowerCase()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {doc.required && <Badge variant="destructive">Required</Badge>}
              {doc.fileName && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Uploaded
                    </Badge>
                  )}
                  {doc.uploadStatus === 'uploading' && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
                      Uploading
                    </Badge>
                  )}
                  {doc.uploadStatus === 'error' && (
                    <Badge variant="destructive">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Failed
                    </Badge>
                  )}
                </div>
              </div>
              
                             <div className="space-y-3">
                 {/* File Upload Area */}
                 <FileUploadArea 
                   doc={doc} 
                   onUpload={(file) => handleFileUpload(doc.type, file)} 
                 />
                
                {/* Upload Status and Actions */}
                {doc.fileName && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-green-700 font-medium">Successfully uploaded to Cloudinary</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Reset the document to allow re-upload
                          setProfileData(prev => ({
                            ...prev,
                            documents: prev.documents.map(d => 
                              d.type === doc.type 
                                ? { ...d, fileName: undefined, fileUrl: undefined, uploadStatus: undefined }
                                : d
                            )
                          }));
                        }}
                      >
                        Replace
                      </Button>
                    </div>
                    <p className="text-xs text-green-600 mt-1">
                      File: {doc.fileName} • Cloudinary URL: {doc.fileUrl}
                    </p>
                  </div>
                )}
                
                {doc.uploadStatus === 'error' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-red-700">Upload failed. Please try again.</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        // Reset error status
                        setProfileData(prev => ({
                          ...prev,
                          documents: prev.documents.map(d => 
                            d.type === doc.type 
                              ? { ...d, uploadStatus: undefined }
                              : d
                          )
                        }));
                      }}
                    >
                      Try Again
                    </Button>
                  </div>
                )}
                
                {doc.uploadStatus === 'uploading' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-blue-700">Uploading to Cloudinary...</span>
                    </div>
                  </div>
              )}
            </div>
          </div>
        ))}
      </div>
       
       {/* Upload Instructions */}
       <Alert>
         <AlertTriangle className="h-4 w-4" />
         <AlertDescription>
           <strong>Important:</strong> All documents must be uploaded to complete your hospital profile. 
           Supported formats: PDF, DOC, DOCX, JPG, JPEG, PNG. Maximum file size: 10MB per document.
         </AlertDescription>
       </Alert>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      case 6: return renderStep6();
      default: return renderStep1();
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5 text-blue-500" />
            <span>Complete Hospital Profile</span>
          </DialogTitle>
          <DialogDescription>
            Please provide complete information about your hospital to access all features.
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-gray-600">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2">
            {steps.map((step) => (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                  step.id < currentStep 
                    ? 'bg-green-500 text-white' 
                    : step.id === currentStep 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step.id < currentStep ? <CheckCircle className="h-4 w-4" /> : step.id}
                </div>
                <span className="text-xs mt-1 text-center max-w-16">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Current Step Content */}
        <div className="mb-6">
          {renderCurrentStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <div className="flex space-x-2">
            {currentStep > 1 && (
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
            )}
            <Button variant="outline" onClick={saveProgress} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Progress'}
            </Button>
          </div>

          <div className="flex space-x-2">
            {currentStep < totalSteps ? (
              <Button onClick={nextStep}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={completeProfile} disabled={saving}>
                <CheckCircle className="h-4 w-4 mr-2" />
                {saving ? 'Completing...' : 'Complete Profile'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HospitalProfileCompletionDialog; 