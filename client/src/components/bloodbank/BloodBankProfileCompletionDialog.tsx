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
  
  // Blood Bank Info
  bloodBankName: string;
  bloodBankType: string;
  bloodBankLicense: string;
  bloodBankRegistration: string;
  bloodBankEstablishment: string;
  bloodBankWebsite: string;
  bloodBankDescription: string;
  bloodBankMission: string;
  bloodBankVision: string;
  
  // Location
  city: string;
  state: string;
  pincode: string;
  address: string;
  
  // Capacity & Staff
  bloodBankCapacity: {
    totalUnits: number;
    refrigeratedUnits: number;
    frozenUnits: number;
    plateletUnits: number;
    plasmaUnits: number;
  };
  bloodBankStaff: {
    medicalOfficers: number;
    technicians: number;
    nurses: number;
    supportStaff: number;
  };
  
  // Operating Hours
  bloodBankOperatingHours: {
    startTime: string;
    endTime: string;
    emergency24x7: boolean;
  };
  bloodBankWorkingDays: string[];
  
  // Services & Capabilities
  bloodBankFacilities: string[];
  bloodBankServices: string[];
  bloodBankTestingCapabilities: {
    bloodGrouping: boolean;
    crossMatching: boolean;
    infectiousDiseaseTesting: boolean;
    compatibilityTesting: boolean;
    antibodyScreening: boolean;
    dnaTesting: boolean;
    rareBloodTypeTesting: boolean;
  };
  bloodBankEmergencyServices: {
    emergencyBloodSupply: boolean;
    traumaCenterSupport: boolean;
    disasterResponse: boolean;
    helicopterService: boolean;
  };
  bloodBankTechnology: {
    automatedTesting: boolean;
    barcodeSystem: boolean;
    inventoryManagement: boolean;
    qualityControl: boolean;
    donorManagement: boolean;
    bloodTracking: boolean;
  };
  
  // Accreditations & Certifications
  bloodBankAccreditations: string[];
  bloodBankCertifications: string[];
  bloodBankQualityStandards: string[];
  
  // Documents
  documents: Array<{
    type: string;
    title: string;
    file: File | null;
    fileUrl?: string;
    fileName?: string;
    uploadStatus?: 'pending' | 'uploading' | 'completed' | 'error';
  }>;
}

interface BloodBankProfileCompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

const BloodBankProfileCompletionDialog: React.FC<BloodBankProfileCompletionDialogProps> = ({
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
    bloodBankName: '',
    bloodBankType: '',
    bloodBankLicense: '',
    bloodBankRegistration: '',
    bloodBankEstablishment: '',
    bloodBankWebsite: '',
    bloodBankDescription: '',
    bloodBankMission: '',
    bloodBankVision: '',
    city: '',
    state: '',
    pincode: '',
    address: '',
    bloodBankCapacity: {
      totalUnits: 0,
      refrigeratedUnits: 0,
      frozenUnits: 0,
      plateletUnits: 0,
      plasmaUnits: 0,
    },
    bloodBankStaff: {
      medicalOfficers: 0,
      technicians: 0,
      nurses: 0,
      supportStaff: 0,
    },
    bloodBankOperatingHours: {
      startTime: '08:00',
      endTime: '20:00',
      emergency24x7: true,
    },
    bloodBankWorkingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    bloodBankFacilities: [],
    bloodBankServices: [],
    bloodBankTestingCapabilities: {
      bloodGrouping: true,
      crossMatching: true,
      infectiousDiseaseTesting: true,
      compatibilityTesting: true,
      antibodyScreening: true,
      dnaTesting: false,
      rareBloodTypeTesting: false,
    },
    bloodBankEmergencyServices: {
      emergencyBloodSupply: true,
      traumaCenterSupport: true,
      disasterResponse: true,
      helicopterService: false,
    },
    bloodBankTechnology: {
      automatedTesting: false,
      barcodeSystem: true,
      inventoryManagement: true,
      qualityControl: true,
      donorManagement: true,
      bloodTracking: true,
    },
    bloodBankAccreditations: [],
    bloodBankCertifications: [],
    bloodBankQualityStandards: [],
    documents: [
      { type: 'bloodbank', title: 'Blood Bank License', file: null, required: true },
      { type: 'accreditation', title: 'Accreditation Certificate', file: null, required: true },
      { type: 'quality', title: 'Quality Management Certificate', file: null, required: true },
      { type: 'safety', title: 'Safety Certificate', file: null, required: true },
      { type: 'infection', title: 'Infection Control Certificate', file: null, required: true },
      { type: 'equipment', title: 'Equipment Certificates', file: null, required: false },
      { type: 'staff', title: 'Staff Certifications', file: null, required: false },
    ],
  });

  const totalSteps = 6;
  const progress = (currentStep / totalSteps) * 100;

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

  const handleDocumentUpload = async (documentIndex: number, file: File) => {
    const document = profileData.documents[documentIndex];
    setUploadingDocuments(prev => new Set(prev).add(document.title));
    
    try {
      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setProfileData(prev => ({
        ...prev,
        documents: prev.documents.map((doc, index) => 
          index === documentIndex 
            ? { ...doc, file, fileUrl: URL.createObjectURL(file), fileName: file.name, uploadStatus: 'completed' }
            : doc
        )
      }));
      
      toast({
        title: "Document uploaded successfully",
        description: `${document.title} has been uploaded.`,
      });
    } catch (error) {
      setProfileData(prev => ({
        ...prev,
        documents: prev.documents.map((doc, index) => 
          index === documentIndex 
            ? { ...doc, uploadStatus: 'error' }
            : doc
        )
      }));
      
      toast({
        title: "Upload failed",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingDocuments(prev => {
        const newSet = new Set(prev);
        newSet.delete(document.title);
        return newSet;
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Profile saved successfully",
        description: "Your blood bank profile has been updated.",
      });
      
      onComplete();
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={profileData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              placeholder="Enter first name"
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={profileData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              placeholder="Enter last name"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={profileData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Enter phone number"
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
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Blood Bank Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="bloodBankName">Blood Bank Name</Label>
            <Input
              id="bloodBankName"
              value={profileData.bloodBankName}
              onChange={(e) => handleInputChange('bloodBankName', e.target.value)}
              placeholder="Enter blood bank name"
            />
          </div>
          <div>
            <Label htmlFor="bloodBankType">Blood Bank Type</Label>
            <Select value={profileData.bloodBankType} onValueChange={(value) => handleInputChange('bloodBankType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select blood bank type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Hospital Blood Bank">Hospital Blood Bank</SelectItem>
                <SelectItem value="Standalone Blood Bank">Standalone Blood Bank</SelectItem>
                <SelectItem value="Mobile Blood Bank">Mobile Blood Bank</SelectItem>
                <SelectItem value="Regional Blood Center">Regional Blood Center</SelectItem>
                <SelectItem value="National Blood Center">National Blood Center</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="bloodBankLicense">License Number</Label>
            <Input
              id="bloodBankLicense"
              value={profileData.bloodBankLicense}
              onChange={(e) => handleInputChange('bloodBankLicense', e.target.value)}
              placeholder="Enter license number"
            />
          </div>
          <div>
            <Label htmlFor="bloodBankRegistration">Registration Number</Label>
            <Input
              id="bloodBankRegistration"
              value={profileData.bloodBankRegistration}
              onChange={(e) => handleInputChange('bloodBankRegistration', e.target.value)}
              placeholder="Enter registration number"
            />
          </div>
        </div>
        <div className="mt-4">
          <Label htmlFor="bloodBankDescription">Description</Label>
          <Textarea
            id="bloodBankDescription"
            value={profileData.bloodBankDescription}
            onChange={(e) => handleInputChange('bloodBankDescription', e.target.value)}
            placeholder="Describe your blood bank services and mission"
            rows={4}
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Location & Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={profileData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder="Enter city"
            />
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              value={profileData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              placeholder="Enter state"
            />
          </div>
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
        <div className="mt-4">
          <Label htmlFor="address">Complete Address</Label>
          <Textarea
            id="address"
            value={profileData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="Enter complete address"
            rows={3}
          />
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Capacity & Staff</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="totalUnits">Total Blood Units Capacity</Label>
            <Input
              id="totalUnits"
              type="number"
              value={profileData.bloodBankCapacity.totalUnits}
              onChange={(e) => handleNestedChange('bloodBankCapacity', 'totalUnits', parseInt(e.target.value) || 0)}
              placeholder="Enter total units capacity"
            />
          </div>
          <div>
            <Label htmlFor="refrigeratedUnits">Refrigerated Units</Label>
            <Input
              id="refrigeratedUnits"
              type="number"
              value={profileData.bloodBankCapacity.refrigeratedUnits}
              onChange={(e) => handleNestedChange('bloodBankCapacity', 'refrigeratedUnits', parseInt(e.target.value) || 0)}
              placeholder="Enter refrigerated units"
            />
          </div>
          <div>
            <Label htmlFor="medicalOfficers">Medical Officers</Label>
            <Input
              id="medicalOfficers"
              type="number"
              value={profileData.bloodBankStaff.medicalOfficers}
              onChange={(e) => handleNestedChange('bloodBankStaff', 'medicalOfficers', parseInt(e.target.value) || 0)}
              placeholder="Enter number of medical officers"
            />
          </div>
          <div>
            <Label htmlFor="technicians">Technicians</Label>
            <Input
              id="technicians"
              type="number"
              value={profileData.bloodBankStaff.technicians}
              onChange={(e) => handleNestedChange('bloodBankStaff', 'technicians', parseInt(e.target.value) || 0)}
              placeholder="Enter number of technicians"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Operating Hours</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startTime">Start Time</Label>
            <Input
              id="startTime"
              type="time"
              value={profileData.bloodBankOperatingHours.startTime}
              onChange={(e) => handleNestedChange('bloodBankOperatingHours', 'startTime', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="endTime">End Time</Label>
            <Input
              id="endTime"
              type="time"
              value={profileData.bloodBankOperatingHours.endTime}
              onChange={(e) => handleNestedChange('bloodBankOperatingHours', 'endTime', e.target.value)}
            />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="emergency24x7"
              checked={profileData.bloodBankOperatingHours.emergency24x7}
              onCheckedChange={(checked) => handleNestedChange('bloodBankOperatingHours', 'emergency24x7', checked)}
            />
            <Label htmlFor="emergency24x7">24/7 Emergency Services Available</Label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Documents & Certifications</h3>
        <div className="space-y-4">
          {profileData.documents.map((document, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Label className="font-medium">{document.title}</Label>
                {document.uploadStatus === 'completed' && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Uploaded
                  </Badge>
                )}
                {document.uploadStatus === 'error' && (
                  <Badge variant="destructive">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Failed
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleDocumentUpload(index, file);
                    }
                  }}
                  disabled={uploadingDocuments.has(document.title)}
                />
                {uploadingDocuments.has(document.title) && (
                  <div className="text-sm text-gray-500">Uploading...</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      case 6:
        return renderStep6();
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete Your Blood Bank Profile</DialogTitle>
          <DialogDescription>
            Please provide the following information to complete your blood bank profile setup.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>

          {/* Step Content */}
          {renderCurrentStep()}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="flex space-x-2">
              {currentStep < totalSteps ? (
                <Button onClick={nextStep}>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Profile
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BloodBankProfileCompletionDialog;
