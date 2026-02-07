import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Upload, Save, ArrowRight, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
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
  }>;
}

const DoctorProfileCompletion: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
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
    // Load existing profile data if available
    loadExistingProfile();
  }, []);

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

  const handleFileUpload = (type: string, file: File) => {
    setProfileData(prev => ({
      ...prev,
      documents: [
        ...prev.documents.filter(doc => doc.type !== type),
        {
          type,
          title: `${type.charAt(0).toUpperCase() + type.slice(1)} Document`,
          file
        }
      ]
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(profileData.firstName && profileData.lastName && profileData.phone);
      case 2:
        return !!(profileData.licenseNumber && profileData.specialization && profileData.hospital && profileData.bio);
      case 3:
        return !!(profileData.city && profileData.state && profileData.pincode);
      case 4:
        return !!(profileData.languages.length > 0 && profileData.consultationFees.online > 0 && 
                 profileData.consultationFees.inPerson > 0 && profileData.workingDays.length > 0);
      case 5:
        return true; // Documents are optional for completion
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    } else {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields before proceeding.",
        variant: "destructive"
      });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
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
          title: "Progress Saved",
          description: "Your profile progress has been saved successfully.",
        });
      } else {
        throw new Error('Failed to save progress');
      }
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save your progress. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const completeProfile = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      
      // Add ALL profile data - Personal Information
      formData.append('firstName', profileData.firstName);
      formData.append('lastName', profileData.lastName);
      formData.append('phone', profileData.phone);
      formData.append('gender', profileData.gender);
      formData.append('dateOfBirth', profileData.dateOfBirth);
      
      // Professional Information
      formData.append('licenseNumber', profileData.licenseNumber);
      formData.append('specialization', profileData.specialization);
      formData.append('hospital', profileData.hospital);
      formData.append('department', profileData.department);
      formData.append('yearsOfExperience', profileData.yearsOfExperience);
      formData.append('bio', profileData.bio);
      
      // Location Information
      formData.append('location', JSON.stringify({
        city: profileData.city,
        state: profileData.state,
        pincode: profileData.pincode,
        address: profileData.address
      }));
      
      // Consultation Details
      formData.append('languages', JSON.stringify(profileData.languages));
      formData.append('consultationFees', JSON.stringify(profileData.consultationFees));
      formData.append('specialties', JSON.stringify(profileData.specialties));
      
      // Availability
      formData.append('availability', JSON.stringify({
        workingDays: profileData.workingDays,
        startTime: profileData.startTime,
        endTime: profileData.endTime,
        appointmentDuration: profileData.appointmentDuration,
        lunchBreakStart: profileData.lunchBreakStart,
        lunchBreakEnd: profileData.lunchBreakEnd
      }));
      
      // Emergency Availability
      formData.append('emergencyAvailable', profileData.emergencyAvailable.toString());

      // Add documents
      profileData.documents.forEach(doc => {
        if (doc.file) {
          formData.append(doc.type, doc.file);
        }
      });

      const response = await fetch('/api/doctor/complete-profile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        toast({
          title: "Profile Completed!",
          description: "Your profile has been completed successfully. You can now access all features.",
        });
        navigate('/doctor/dashboard');
      } else {
        throw new Error('Failed to complete profile');
      }
    } catch (error) {
      toast({
        title: "Completion Failed",
        description: "Failed to complete your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={profileData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            placeholder="Enter your first name"
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={profileData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            placeholder="Enter your last name"
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
            placeholder="Enter your phone number"
          />
        </div>
        <div>
          <Label htmlFor="gender">Gender</Label>
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
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="licenseNumber">Medical License Number *</Label>
          <Input
            id="licenseNumber"
            value={profileData.licenseNumber}
            onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
            placeholder="Enter your license number"
          />
        </div>
        <div>
          <Label htmlFor="specialization">Primary Specialization *</Label>
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
          <Label htmlFor="hospital">Hospital/Clinic Name *</Label>
          <Input
            id="hospital"
            value={profileData.hospital}
            onChange={(e) => handleInputChange('hospital', e.target.value)}
            placeholder="Enter hospital or clinic name"
          />
        </div>
        <div>
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            value={profileData.department}
            onChange={(e) => handleInputChange('department', e.target.value)}
            placeholder="Enter department name"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="yearsOfExperience">Years of Experience</Label>
        <Input
          id="yearsOfExperience"
          value={profileData.yearsOfExperience}
          onChange={(e) => handleInputChange('yearsOfExperience', e.target.value)}
          placeholder="e.g., 5 years"
        />
      </div>
      
      <div>
        <Label htmlFor="bio">Professional Bio *</Label>
        <Textarea
          id="bio"
          value={profileData.bio}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          placeholder="Tell patients about your experience, expertise, and approach to care..."
          rows={4}
        />
      </div>
      
      <div>
        <Label>Additional Specialties</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Dermatology', 'Psychiatry', 'Oncology', 'Surgery'].map(specialty => (
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
    <div className="space-y-6">
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
          <Label htmlFor="pincode">Pincode *</Label>
          <Input
            id="pincode"
            value={profileData.pincode}
            onChange={(e) => handleInputChange('pincode', e.target.value)}
            placeholder="Enter pincode"
          />
        </div>
        <div>
          <Label htmlFor="address">Full Address</Label>
          <Input
            id="address"
            value={profileData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="Enter complete address"
          />
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <Label>Languages Spoken *</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {['English', 'Hindi', 'Spanish', 'French', 'German', 'Chinese', 'Arabic', 'Portuguese'].map(language => (
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
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="onlineFee">Online Consultation Fee (₹) *</Label>
          <Input
            id="onlineFee"
            type="number"
            value={profileData.consultationFees.online}
            onChange={(e) => handleNestedChange('consultationFees', 'online', parseInt(e.target.value) || 0)}
            placeholder="Enter fee amount"
          />
        </div>
        <div>
          <Label htmlFor="inPersonFee">In-Person Consultation Fee (₹) *</Label>
          <Input
            id="inPersonFee"
            type="number"
            value={profileData.consultationFees.inPerson}
            onChange={(e) => handleNestedChange('consultationFees', 'inPerson', parseInt(e.target.value) || 0)}
            placeholder="Enter fee amount"
          />
        </div>
      </div>
      
      <div>
        <Label>Working Days *</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
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
              <SelectItem value="60">60 minutes</SelectItem>
            </SelectContent>
          </Select>
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
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Upload your medical documents for verification. This helps build trust with patients.
        </AlertDescription>
      </Alert>
      
      <div className="space-y-4">
        <div>
          <Label>Medical License</Label>
          <div className="mt-2">
            <Input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload('license', file);
              }}
            />
          </div>
        </div>
        
        <div>
          <Label>Medical Certificates</Label>
          <div className="mt-2">
            <Input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                files.forEach(file => handleFileUpload('certificate', file));
              }}
            />
          </div>
        </div>
        
        <div>
          <Label>Medical Degrees</Label>
          <div className="mt-2">
            <Input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                files.forEach(file => handleFileUpload('degree', file));
              }}
            />
          </div>
        </div>
      </div>
      
      {profileData.documents.length > 0 && (
        <div>
          <Label>Uploaded Documents</Label>
          <div className="mt-2 space-y-2">
            {profileData.documents.map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm">{doc.title}</span>
                <Badge variant="secondary">{doc.type}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
          <p className="text-gray-600">Please provide the following information to complete your doctor profile</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-500">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Steps Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  currentStep >= step.id 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'border-gray-300 text-gray-500'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-2 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((step) => (
              <div key={step.id} className="text-center flex-1">
                <div className={`text-xs font-medium ${
                  currentStep === step.id ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {step.title}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="mr-2">Step {currentStep}:</span>
              {steps[currentStep - 1].title}
            </CardTitle>
            <CardDescription>
              {steps[currentStep - 1].description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderCurrentStep()}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={saveProgress}
              disabled={saving}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Progress'}
            </Button>
          </div>
          
          <div className="flex items-center space-x-4">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={prevStep}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            )}
            
            {currentStep < totalSteps ? (
              <Button
                onClick={nextStep}
                disabled={!validateStep(currentStep)}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={completeProfile}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Completing...' : 'Complete Profile'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfileCompletion; 