import React, { useState, useEffect } from 'react';
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
import { Upload, Save, ArrowRight, ArrowLeft, CheckCircle, AlertCircle, X, FileText, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProfileData {
  // Personal Info
  firstName: string;
  lastName: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  
  // Professional Info
  licenseNumber: string;
  specialization: string;
  hospital: string;
  department: string;
  yearsOfExperience: string;
  bio: string;
  specialties: string[];
  
  // Location
  city: string;
  state: string;
  pincode: string;
  address: string;
  
  // Consultation Details
  languages: string[];
  consultationFees: {
    online: number;
    inPerson: number;
  };
  
  // Availability
  workingDays: string[];
  startTime: string;
  endTime: string;
  appointmentDuration: number;
  lunchBreakStart: string;
  lunchBreakEnd: string;
  emergencyAvailable: boolean;
  
  // Documents
  documents: Array<{
    type: string;
    title: string;
    file: File | null;
    fileUrl?: string; // Use fileUrl to match backend schema
    fileName?: string;
    uploadStatus?: 'pending' | 'uploading' | 'completed' | 'error';
  }>;
}

interface DoctorProfileCompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

const DoctorProfileCompletionDialog: React.FC<DoctorProfileCompletionDialogProps> = ({
  open,
  onOpenChange,
  onComplete
}) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingDocuments, setUploadingDocuments] = useState<Set<string>>(new Set());
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    licenseNumber: '',
    specialization: '',
    hospital: '',
    department: '',
    yearsOfExperience: '',
    bio: '',
    specialties: [],
    city: '',
    state: '',
    pincode: '',
    address: '',
    languages: [],
    consultationFees: {
      online: 0,
      inPerson: 0
    },
    workingDays: [],
    startTime: '09:00',
    endTime: '17:00',
    appointmentDuration: 30,
    lunchBreakStart: '12:00',
    lunchBreakEnd: '13:00',
    emergencyAvailable: false,
    documents: []
  });

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const steps = [
    { id: 1, title: 'Personal Information', description: 'Basic personal details' },
    { id: 2, title: 'Professional Details', description: 'Medical credentials and experience' },
    { id: 3, title: 'Location & Contact', description: 'Practice location and contact info' },
    { id: 4, title: 'Consultation Setup', description: 'Fees, languages, and availability' },
    { id: 5, title: 'Document Upload', description: 'Upload required documents' }
  ];

  useEffect(() => {
    if (open) {
      loadExistingProfile();
    }
  }, [open]);

  const loadExistingProfile = async () => {
    try {
      const response = await fetch('/api/doctor/settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProfileData(prev => ({
          ...prev,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phone: data.phone || '',
          gender: data.gender || '',
          licenseNumber: data.licenseNumber || '',
          specialization: data.specialization || '',
          hospital: data.hospital || '',
          department: data.department || '',
          yearsOfExperience: data.yearsOfExperience || '',
          bio: data.bio || '',
          specialties: data.specialties || [],
          city: data.location?.city || '',
          state: data.location?.state || '',
          pincode: data.location?.pincode || '',
          address: data.location?.address || '',
          languages: data.languages || [],
          consultationFees: data.consultationFees || { online: 0, inPerson: 0 },
          workingDays: data.availability?.workingDays || [],
          startTime: data.availability?.startTime || '09:00',
          endTime: data.availability?.endTime || '17:00',
          appointmentDuration: data.availability?.appointmentDuration || 30,
          lunchBreakStart: data.availability?.lunchBreakStart || '12:00',
          lunchBreakEnd: data.availability?.lunchBreakEnd || '13:00',
          emergencyAvailable: data.emergencyAvailable || false
        }));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof ProfileData],
        [field]: value
      }
    }));
  };

  const handleArrayChange = (field: string, value: string, action: 'add' | 'remove') => {
    setProfileData(prev => ({
      ...prev,
      [field]: action === 'add' 
        ? [...prev[field as keyof ProfileData] as string[], value]
        : (prev[field as keyof ProfileData] as string[]).filter(item => item !== value)
    }));
  };

  const handleWorkingDayToggle = (day: string) => {
    setProfileData(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day]
    }));
  };

  const handleLanguageToggle = (language: string) => {
    handleArrayChange('languages', language, 
      profileData.languages.includes(language) ? 'remove' : 'add'
    );
  };

  const handleSpecialtyToggle = (specialty: string) => {
    handleArrayChange('specialties', specialty, 
      profileData.specialties.includes(specialty) ? 'remove' : 'add'
    );
  };

  const handleFileUpload = async (type: string, file: File) => {
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'File size must be less than 10MB.',
        variant: 'destructive'
      });
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload PDF, JPG, or PNG files only.',
        variant: 'destructive'
      });
      return;
    }

    // Add document to state with pending status
    setProfileData(prev => ({
      ...prev,
      documents: [
        ...prev.documents.filter(doc => doc.type !== type),
        { 
          type, 
          title: `${type} Document`, 
          file,
          fileName: file.name,
          uploadStatus: 'pending' as const
        }
      ]
    }));

    // Start upload to Cloudinary
    setUploadingDocuments(prev => new Set(prev).add(type));
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch('/api/doctor/upload-document', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        
        // Update document with Cloudinary URL
        setProfileData(prev => ({
          ...prev,
          documents: prev.documents.map(doc => 
            doc.type === type 
              ? { 
                  ...doc, 
                  fileUrl: result.fileUrl, // Use fileUrl from backend
                  uploadStatus: 'completed' as const
                }
              : doc
          )
        }));

        toast({
          title: 'Upload Successful',
          description: `${type} document uploaded successfully.`,
        });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      
      // Update document with error status
      setProfileData(prev => ({
        ...prev,
        documents: prev.documents.map(doc => 
          doc.type === type 
            ? { ...doc, uploadStatus: 'error' as const }
            : doc
        )
      }));

      toast({
        title: 'Upload Failed',
        description: 'Failed to upload document. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setUploadingDocuments(prev => {
        const newSet = new Set(prev);
        newSet.delete(type);
        return newSet;
      });
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(profileData.firstName && profileData.lastName && profileData.phone && profileData.gender);
      case 2:
        return !!(profileData.licenseNumber && profileData.specialization && profileData.hospital);
      case 3:
        return !!(profileData.city && profileData.state && profileData.address);
      case 4:
        return !!(profileData.languages.length > 0 && profileData.consultationFees.online > 0);
      case 5:
        const requiredDocs = ['license', 'certificate'];
        const uploadedDocs = profileData.documents.filter(doc => 
          doc.uploadStatus === 'completed' && requiredDocs.includes(doc.type)
        );
        return uploadedDocs.length >= 2; // At least 2 required documents must be uploaded
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      } else {
        completeProfile();
      }
    } else {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields before proceeding.',
        variant: 'destructive'
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const saveProgress = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/doctor/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        toast({
          title: 'Progress Saved',
          description: 'Your profile progress has been saved successfully.',
        });
      } else {
        throw new Error('Failed to save progress');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save progress. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const completeProfile = async () => {
    setLoading(true);
    try {
      // Prepare documents data for backend
      const documentsForBackend = profileData.documents
        .filter(doc => doc.uploadStatus === 'completed')
        .map(doc => ({
          type: doc.type,
          title: doc.title,
          fileName: doc.fileName,
          fileUrl: doc.fileUrl, // Use fileUrl to match backend schema
          uploadedAt: new Date().toISOString()
        }));

      // Flatten the nested objects to match backend expectations
      const profileDataForBackend = {
        // Personal Information
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
        gender: profileData.gender,
        dateOfBirth: profileData.dateOfBirth,
        
        // Professional Information
        licenseNumber: profileData.licenseNumber,
        specialization: profileData.specialization,
        hospital: profileData.hospital,
        department: profileData.department,
        yearsOfExperience: profileData.yearsOfExperience,
        bio: profileData.bio,
        specialties: profileData.specialties,
        
        // Location Information - flatten nested location object
        location: {
          city: profileData.city,
          state: profileData.state,
          pincode: profileData.pincode,
          address: profileData.address
        },
        
        // Consultation Details
        languages: profileData.languages,
        consultationFees: profileData.consultationFees,
        
        // Availability - flatten nested availability object
        availability: {
          workingDays: profileData.workingDays,
          startTime: profileData.startTime,
          endTime: profileData.endTime,
          appointmentDuration: profileData.appointmentDuration,
          lunchBreakStart: profileData.lunchBreakStart,
          lunchBreakEnd: profileData.lunchBreakEnd
        },
        
        // Emergency Availability
        emergencyAvailable: profileData.emergencyAvailable,
        
        // Documents
        documents: documentsForBackend
      };

      console.log('Sending profile data to backend:', profileDataForBackend);

      const response = await fetch('/api/doctor/complete-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profileDataForBackend)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Profile completion response:', result);
        
        toast({
          title: 'Profile Completed',
          description: 'Your profile has been completed successfully! All data has been saved to the database.',
        });
        
        // Call onComplete to refresh the parent component's data
        onComplete();
        onOpenChange(false);
      } else {
        const errorData = await response.json();
        console.error('Profile completion error:', errorData);
        throw new Error(errorData.message || 'Failed to complete profile');
      }
    } catch (error) {
      console.error('Profile completion error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to complete profile. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={profileData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            placeholder="Enter first name"
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={profileData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            placeholder="Enter last name"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
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
          <Label htmlFor="gender">Gender *</Label>
          <Select value={profileData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
              <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="dateOfBirth">Date of Birth</Label>
        <Input
          id="dateOfBirth"
          type="date"
          value={profileData.dateOfBirth}
          onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="licenseNumber">Medical License Number *</Label>
          <Input
            id="licenseNumber"
            value={profileData.licenseNumber}
            onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
            placeholder="Enter license number"
          />
        </div>
        <div>
          <Label htmlFor="specialization">Specialization *</Label>
          <Input
            id="specialization"
            value={profileData.specialization}
            onChange={(e) => handleInputChange('specialization', e.target.value)}
            placeholder="e.g., Cardiology, Neurology"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="hospital">Hospital/Clinic *</Label>
          <Input
            id="hospital"
            value={profileData.hospital}
            onChange={(e) => handleInputChange('hospital', e.target.value)}
            placeholder="Enter hospital name"
          />
        </div>
        <div>
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            value={profileData.department}
            onChange={(e) => handleInputChange('department', e.target.value)}
            placeholder="Enter department"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="yearsOfExperience">Years of Experience</Label>
        <Select value={profileData.yearsOfExperience} onValueChange={(value) => handleInputChange('yearsOfExperience', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select experience" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0-2">0-2 years</SelectItem>
            <SelectItem value="3-5">3-5 years</SelectItem>
            <SelectItem value="6-10">6-10 years</SelectItem>
            <SelectItem value="10+">10+ years</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={profileData.bio}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          placeholder="Tell us about your medical background and expertise..."
          rows={3}
        />
      </div>
      
      <div>
        <Label>Specialties</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Dermatology', 'Psychiatry', 'Oncology', 'Emergency Medicine'].map((specialty) => (
            <div key={specialty} className="flex items-center space-x-2">
              <Checkbox
                id={specialty}
                checked={profileData.specialties.includes(specialty)}
                onCheckedChange={() => handleSpecialtyToggle(specialty)}
              />
              <Label htmlFor={specialty} className="text-sm">{specialty}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            value={profileData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            placeholder="Enter city"
          />
        </div>
        <div>
          <Label htmlFor="state">State *</Label>
          <Input
            id="state"
            value={profileData.state}
            onChange={(e) => handleInputChange('state', e.target.value)}
            placeholder="Enter state"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="pincode">Pincode</Label>
          <Input
            id="pincode"
            value={profileData.pincode}
            onChange={(e) => handleInputChange('pincode', e.target.value)}
            placeholder="Enter pincode"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="address">Complete Address *</Label>
        <Textarea
          id="address"
          value={profileData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          placeholder="Enter complete address"
          rows={3}
        />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-3">
      <div>
        <Label>Languages Spoken</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {['English', 'Hindi', 'Spanish', 'French', 'German', 'Chinese', 'Arabic', 'Portuguese'].map((language) => (
            <div key={language} className="flex items-center space-x-2">
              <Checkbox
                id={language}
                checked={profileData.languages.includes(language)}
                onCheckedChange={() => handleLanguageToggle(language)}
              />
              <Label htmlFor={language} className="text-sm">{language}</Label>
            </div>
          ))}
        </div>
      </div>
      
      <Separator />
      
      <div>
        <Label>Consultation Fees</Label>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <Label htmlFor="onlineFee">Online Consultation ($)</Label>
            <Input
              id="onlineFee"
              type="number"
              value={profileData.consultationFees.online}
              onChange={(e) => handleNestedChange('consultationFees', 'online', parseInt(e.target.value) || 0)}
              placeholder="0"
            />
          </div>
          <div>
            <Label htmlFor="inPersonFee">In-Person Consultation ($)</Label>
            <Input
              id="inPersonFee"
              type="number"
              value={profileData.consultationFees.inPerson}
              onChange={(e) => handleNestedChange('consultationFees', 'inPerson', parseInt(e.target.value) || 0)}
              placeholder="0"
            />
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <Label>Working Days</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
            <div key={day} className="flex items-center space-x-2">
              <Checkbox
                id={day}
                checked={profileData.workingDays.includes(day)}
                onCheckedChange={() => handleWorkingDayToggle(day)}
              />
              <Label htmlFor={day} className="text-sm capitalize">{day}</Label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startTime">Start Time</Label>
          <Input
            id="startTime"
            type="time"
            value={profileData.startTime}
            onChange={(e) => handleInputChange('startTime', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="endTime">End Time</Label>
          <Input
            id="endTime"
            type="time"
            value={profileData.endTime}
            onChange={(e) => handleInputChange('endTime', e.target.value)}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="appointmentDuration">Appointment Duration (minutes)</Label>
          <Select value={profileData.appointmentDuration.toString()} onValueChange={(value) => handleInputChange('appointmentDuration', parseInt(value))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="45">45 minutes</SelectItem>
              <SelectItem value="60">1 hour</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="emergencyAvailable"
          checked={profileData.emergencyAvailable}
          onCheckedChange={(checked) => handleInputChange('emergencyAvailable', checked)}
        />
        <Label htmlFor="emergencyAvailable">Available for Emergency Consultations</Label>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-3">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please upload the following required documents to complete your profile verification.
        </AlertDescription>
      </Alert>
      
      <div className="space-y-3">
        {[
          { type: 'license', title: 'Medical License', required: true },
          { type: 'certificate', title: 'Medical Certificate', required: true },
          { type: 'degree', title: 'Medical Degree', required: false },
          { type: 'other', title: 'Other Documents', required: false }
        ].map((doc) => {
          const documentData = profileData.documents.find(d => d.type === doc.type);
          const isUploading = uploadingDocuments.has(doc.type);
          
          return (
            <div key={doc.type} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Label className="font-medium">{doc.title}</Label>
                    {doc.required && <span className="text-red-500">*</span>}
                  </div>
                  <p className="text-sm text-gray-600">Upload {doc.title.toLowerCase()} document</p>
                  
                  {/* File Info */}
                  {documentData?.fileName && (
                    <div className="flex items-center gap-2 mt-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{documentData.fileName}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Upload Status */}
                  {documentData?.uploadStatus === 'completed' && (
                    <Badge variant="secondary" className="text-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Uploaded
                    </Badge>
                  )}
                  
                  {documentData?.uploadStatus === 'error' && (
                    <Badge variant="destructive" className="text-red-600">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Failed
                    </Badge>
                  )}
                  
                  {isUploading && (
                    <Badge variant="secondary" className="text-blue-600">
                      <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-1" />
                      Uploading...
                    </Badge>
                  )}
                  
                  {/* Upload Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isUploading}
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = '.pdf,.jpg,.jpeg,.png';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          handleFileUpload(doc.type, file);
                        }
                      };
                      input.click();
                    }}
                  >
                    {isUploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        {documentData?.file ? 'Replace' : 'Upload'}
                      </>
                    )}
                  </Button>
                  
                  {/* View Button for uploaded documents */}
                  {documentData?.fileUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(documentData.fileUrl, '_blank')}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      default: return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] sm:max-h-[85vh] overflow-y-auto mx-4">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Complete Your Profile</h2>
              <p className="text-sm text-gray-600 mt-1">
                Step {currentStep} of {totalSteps}: {steps[currentStep - 1]?.title}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            {steps[currentStep - 1]?.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-1">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Content */}
          <div className="max-h-[45vh] sm:max-h-[50vh] overflow-y-auto">
            {renderCurrentStep()}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 pb-2 border-t sticky bottom-0 bg-white">
            <div className="flex space-x-2">
              {currentStep > 1 && (
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
              )}
              <Button variant="outline" onClick={saveProgress} disabled={saving}>
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Progress
                  </>
                )}
              </Button>
            </div>
            
            <Button 
              onClick={nextStep}
              disabled={loading}
              className="bg-health-teal hover:bg-health-teal/90"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Completing...
                </>
              ) : currentStep === totalSteps ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Profile
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DoctorProfileCompletionDialog; 