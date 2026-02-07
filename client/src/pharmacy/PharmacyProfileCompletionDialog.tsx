import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Upload, Save, ArrowRight, ArrowLeft, CheckCircle, AlertCircle, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PharmacyProfileData {
  businessName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  gstNumber: string;
  panNumber: string;
  pharmacyType: string;
  totalExperience: string;
  pharmacyServices: string;
  operatingHours: string;
  emergencyServices: string;
  workHistory: string;
  therapeuticSpecializations: string;
  medicationReview: boolean;
  patientCounseling: boolean;
  compounding: boolean;
  vaccinationServices: boolean;
  healthScreening: boolean;
  medicalEquipment: boolean;
  stateCouncil: string;
  registrationNumber: string;
  registrationDate: string;
  registrationExpiry: string;
  professionalAssociations: string;
  languagesSpoken: string;
  communicationStyle: string;
  consultationDuration: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  landmark: string;
  businessHours: string;
  emergencyContact: string;
  supportEmail: string;
  supportPhone: string;
  storeSize: string;
  parkingAvailable: string;
  waitingArea: boolean;
  consultationRoom: boolean;
  airConditioning: boolean;
  restroom: boolean;
  homeDelivery: boolean;
  deliveryRadiusKm: string;
  minOrderAmount: string;
  freeDeliveryAbove: string;
  expressDelivery: boolean;
  sameDayDelivery: boolean;
  acceptCOD: boolean;
  acceptUPI: boolean;
  acceptCards: boolean;
  acceptDigitalWallets: boolean;
  insuranceSupported: boolean;
  supportedInsurers: string;
  prescriptionReminders: boolean;
  medicationReviews: boolean;
  healthConsultations: boolean;
  specialServices: string;
  orderUpdates: boolean;
  prescriptionUpdates: boolean;
  inventoryAlerts: boolean;
  paymentNotifications: boolean;
  productUpdates: boolean;
  marketingEmails: boolean;
  analyticsData: boolean;
  documents: Array<{
    type: string;
    title: string;
    file: File | null;
    fileUrl?: string;
    fileName?: string;
    uploadStatus?: 'pending' | 'uploading' | 'completed' | 'error';
  }>;
}

interface PharmacyProfileCompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

const PharmacyProfileCompletionDialog: React.FC<PharmacyProfileCompletionDialogProps> = ({
  open,
  onOpenChange,
  onComplete
}) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<PharmacyProfileData>({
    businessName: '',
    email: '',
    phone: '',
    licenseNumber: '',
    gstNumber: '',
    panNumber: '',
    pharmacyType: '',
    totalExperience: '',
    pharmacyServices: '',
    operatingHours: '',
    emergencyServices: '',
    workHistory: '',
    therapeuticSpecializations: '',
    medicationReview: false,
    patientCounseling: false,
    compounding: false,
    vaccinationServices: false,
    healthScreening: false,
    medicalEquipment: false,
    stateCouncil: '',
    registrationNumber: '',
    registrationDate: '',
    registrationExpiry: '',
    professionalAssociations: '',
    languagesSpoken: '',
    communicationStyle: '',
    consultationDuration: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    landmark: '',
    businessHours: '',
    emergencyContact: '',
    supportEmail: '',
    supportPhone: '',
    storeSize: '',
    parkingAvailable: '',
    waitingArea: false,
    consultationRoom: false,
    airConditioning: false,
    restroom: false,
    homeDelivery: true,
    deliveryRadiusKm: '5',
    minOrderAmount: '0',
    freeDeliveryAbove: '',
    expressDelivery: false,
    sameDayDelivery: false,
    acceptCOD: true,
    acceptUPI: true,
    acceptCards: true,
    acceptDigitalWallets: false,
    insuranceSupported: true,
    supportedInsurers: '',
    prescriptionReminders: false,
    medicationReviews: false,
    healthConsultations: false,
    specialServices: '',
    orderUpdates: true,
    prescriptionUpdates: true,
    inventoryAlerts: true,
    paymentNotifications: true,
    productUpdates: true,
    marketingEmails: false,
    analyticsData: true,
    documents: []
  });

  const totalSteps = 6;
  const progress = (currentStep / totalSteps) * 100;

  const steps = [
    { id: 1, title: 'Business Information', description: 'Basic business details' },
    { id: 2, title: 'Professional Details', description: 'Pharmacy credentials and services' },
    { id: 3, title: 'Location & Contact', description: 'Business location and contact info' },
    { id: 4, title: 'Services & Delivery', description: 'Services offered and delivery options' },
    { id: 5, title: 'Payment & Settings', description: 'Payment methods and preferences' },
    { id: 6, title: 'Document Upload', description: 'Upload required documents' }
  ];

  useEffect(() => {
    if (open) {
      loadExistingProfile();
    }
  }, [open]);

  const loadExistingProfile = async () => {
    try {
      const pharmacyService = (await import('@/services/pharmacyService')).default;
      const data = await pharmacyService.getMyProfile();
      
      if (data && Object.keys(data).length > 0) {
        setProfileData(prev => ({
          ...prev,
          // Map database fields back to frontend fields
          businessName: data.businessName || '',
          email: data.email || '',
          phone: data.phone || '',
          licenseNumber: data.licenseNumber || '',
          gstNumber: data.gstNumber || '',
          panNumber: data.panNumber || '',
          pharmacyType: data.pharmacyType || '',
          totalExperience: data.establishmentYear ? (new Date().getFullYear() - data.establishmentYear).toString() : '',
          pharmacyServices: data.description || '',
          operatingHours: data.businessHours || '',
          emergencyServices: data.emergencyServices ? '24x7' : 'standard',
          workHistory: data.description || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          zipCode: data.pincode || '',
          country: data.country || 'India',
          landmark: '',
          businessHours: data.businessHours || '',
          emergencyContact: data.emergencyContact || '',
          homeDelivery: data.homeDelivery || false,
          deliveryRadiusKm: data.deliveryRadius?.toString() || '5',
          minOrderAmount: data.freeDeliveryThreshold?.toString() || '0',
          acceptCOD: data.acceptCOD || true,
          acceptUPI: data.acceptOnlinePayment || true,
          acceptCards: data.acceptOnlinePayment || true,
          insuranceSupported: data.services?.includes('Insurance Coverage') || false,
          orderUpdates: data.orderUpdates || true,
          prescriptionUpdates: data.emailNotifications || true,
          inventoryAlerts: data.smsNotifications || true,
          paymentNotifications: data.orderUpdates || true,
          productUpdates: data.emailNotifications || true,
          marketingEmails: data.emailNotifications || false,
          analyticsData: data.autoReorder || true,
          // Map services back to individual boolean fields
          medicationReview: data.prescriptionServices || false,
          patientCounseling: data.consultationServices || false,
          compounding: data.services?.includes('Compounding') || false,
          vaccinationServices: data.services?.includes('Vaccination') || false,
          healthScreening: data.services?.includes('Health Screening') || false,
          medicalEquipment: data.services?.includes('Medical Equipment') || false,
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

  const handleBoolChange = (field: string, value: boolean) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(profileData.businessName && profileData.email && profileData.phone && profileData.licenseNumber);
      case 2:
        return !!(profileData.pharmacyType && profileData.totalExperience && profileData.pharmacyServices);
      case 3:
        return !!(profileData.city && profileData.state && profileData.address);
      case 4:
        return true;
      case 5:
        return true;
      case 6:
        return true;
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
      const pharmacyService = (await import('@/services/pharmacyService')).default;
      await pharmacyService.saveProfileProgress(profileData);
      
      toast({
        title: 'Progress Saved',
        description: 'Your profile progress has been saved successfully.',
      });
    } catch (error) {
      console.error('Save progress error:', error);
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
      const pharmacyService = (await import('@/services/pharmacyService')).default;
      
      // Prepare documents for upload
      const documents: any = {};
      if (profileData.documents && Array.isArray(profileData.documents)) {
        profileData.documents.forEach((doc) => {
          if (doc.file) {
            documents[doc.type] = doc.file;
          }
        });
      }

      await pharmacyService.completeProfile(profileData, documents);
      
      toast({
        title: 'Profile Completed',
        description: 'Your pharmacy profile has been completed successfully!',
      });
      onComplete();
      onOpenChange(false);
    } catch (error) {
      console.error('Profile completion error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to complete profile. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="businessName">Business Name *</Label>
          <Input
            id="businessName"
            value={profileData.businessName}
            onChange={(e) => handleInputChange('businessName', e.target.value)}
            placeholder="Your Pharmacy Pvt Ltd"
          />
        </div>
        <div>
          <Label htmlFor="email">Contact Email *</Label>
          <Input
            id="email"
            type="email"
            value={profileData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="contact@pharmacy.com"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Contact Phone *</Label>
          <Input
            id="phone"
            value={profileData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="+91 9876543210"
          />
        </div>
        <div>
          <Label htmlFor="licenseNumber">License Number *</Label>
          <Input
            id="licenseNumber"
            value={profileData.licenseNumber}
            onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
            placeholder="DL-XXXX-YYYY"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="gstNumber">GST Number</Label>
          <Input
            id="gstNumber"
            value={profileData.gstNumber}
            onChange={(e) => handleInputChange('gstNumber', e.target.value)}
            placeholder="22AAAAA0000A1Z5"
          />
        </div>
        <div>
          <Label htmlFor="panNumber">PAN Number</Label>
          <Input
            id="panNumber"
            value={profileData.panNumber}
            onChange={(e) => handleInputChange('panNumber', e.target.value)}
            placeholder="ABCDE1234F"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="pharmacyType">Pharmacy Type *</Label>
          <Select value={profileData.pharmacyType} onValueChange={(value) => handleInputChange('pharmacyType', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select pharmacy type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="retail">Retail Pharmacy</SelectItem>
              <SelectItem value="hospital">Hospital Pharmacy</SelectItem>
              <SelectItem value="clinical">Clinical Pharmacy</SelectItem>
              <SelectItem value="compounding">Compounding Pharmacy</SelectItem>
              <SelectItem value="online">Online Pharmacy</SelectItem>
              <SelectItem value="chain">Chain Pharmacy</SelectItem>
              <SelectItem value="independent">Independent Pharmacy</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="totalExperience">Years in Business *</Label>
          <Input
            id="totalExperience"
            type="number"
            value={profileData.totalExperience}
            onChange={(e) => handleInputChange('totalExperience', e.target.value)}
            placeholder="5"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="pharmacyServices">Key Services *</Label>
        <Textarea
          id="pharmacyServices"
          value={profileData.pharmacyServices}
          onChange={(e) => handleInputChange('pharmacyServices', e.target.value)}
          placeholder="List your main services (e.g., prescription dispensing, home delivery, medical supplies, compounding)"
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="operatingHours">Operating Hours</Label>
          <Input
            id="operatingHours"
            value={profileData.operatingHours}
            onChange={(e) => handleInputChange('operatingHours', e.target.value)}
            placeholder="9 AM - 9 PM"
          />
        </div>
        <div>
          <Label htmlFor="emergencyServices">Emergency Services</Label>
          <Select value={profileData.emergencyServices} onValueChange={(value) => handleInputChange('emergencyServices', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24x7">24/7 Emergency Services</SelectItem>
              <SelectItem value="extended">Extended Hours</SelectItem>
              <SelectItem value="standard">Standard Hours Only</SelectItem>
              <SelectItem value="oncall">On-Call Emergency</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="workHistory">Business Description</Label>
        <Textarea
          id="workHistory"
          value={profileData.workHistory}
          onChange={(e) => handleInputChange('workHistory', e.target.value)}
          placeholder="Brief description of your pharmacy business and what makes you unique..."
          rows={3}
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            value={profileData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            placeholder="Mumbai"
          />
        </div>
        <div>
          <Label htmlFor="state">State *</Label>
          <Input
            id="state"
            value={profileData.state}
            onChange={(e) => handleInputChange('state', e.target.value)}
            placeholder="Maharashtra"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="zipCode">PIN Code</Label>
          <Input
            id="zipCode"
            value={profileData.zipCode}
            onChange={(e) => handleInputChange('zipCode', e.target.value)}
            placeholder="400001"
          />
        </div>
        <div>
          <Label htmlFor="landmark">Landmark</Label>
          <Input
            id="landmark"
            value={profileData.landmark}
            onChange={(e) => handleInputChange('landmark', e.target.value)}
            placeholder="Near Hospital, Opposite Bank"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="address">Complete Address *</Label>
        <Textarea
          id="address"
          value={profileData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          placeholder="123 Main Street, Building Name"
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="businessHours">Business Hours</Label>
          <Input
            id="businessHours"
            value={profileData.businessHours}
            onChange={(e) => handleInputChange('businessHours', e.target.value)}
            placeholder="Mon-Sat 9:00 AM - 9:00 PM"
          />
        </div>
        <div>
          <Label htmlFor="emergencyContact">Emergency Contact</Label>
          <Input
            id="emergencyContact"
            value={profileData.emergencyContact}
            onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
            placeholder="+91 90000 00000"
          />
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">Home Delivery</div>
          <div className="text-sm text-gray-500">Deliver medicines to patient locations.</div>
        </div>
        <Switch 
          checked={profileData.homeDelivery} 
          onCheckedChange={(value) => handleBoolChange('homeDelivery', value)} 
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="deliveryRadiusKm">Delivery Radius (km)</Label>
          <Input
            id="deliveryRadiusKm"
            value={profileData.deliveryRadiusKm}
            onChange={(e) => handleInputChange('deliveryRadiusKm', e.target.value)}
            placeholder="5"
          />
        </div>
        <div>
          <Label htmlFor="minOrderAmount">Minimum Order Amount (₹)</Label>
          <Input
            id="minOrderAmount"
            value={profileData.minOrderAmount}
            onChange={(e) => handleInputChange('minOrderAmount', e.target.value)}
            placeholder="0"
          />
        </div>
      </div>
      
      <div>
        <Label>Available Services</Label>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="flex items-center space-x-2">
            <Switch checked={profileData.medicationReview} onCheckedChange={(value) => handleBoolChange('medicationReview', value)} />
            <Label className="text-sm">Medication Review</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch checked={profileData.patientCounseling} onCheckedChange={(value) => handleBoolChange('patientCounseling', value)} />
            <Label className="text-sm">Patient Counseling</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch checked={profileData.compounding} onCheckedChange={(value) => handleBoolChange('compounding', value)} />
            <Label className="text-sm">Compounding</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch checked={profileData.vaccinationServices} onCheckedChange={(value) => handleBoolChange('vaccinationServices', value)} />
            <Label className="text-sm">Vaccination</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch checked={profileData.healthScreening} onCheckedChange={(value) => handleBoolChange('healthScreening', value)} />
            <Label className="text-sm">Health Screening</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch checked={profileData.medicalEquipment} onCheckedChange={(value) => handleBoolChange('medicalEquipment', value)} />
            <Label className="text-sm">Medical Equipment</Label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-4">
      <div>
        <Label>Payment Methods</Label>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Cash on Delivery</div>
              <div className="text-sm text-gray-500">Accept cash payments on delivery.</div>
            </div>
            <Switch checked={profileData.acceptCOD} onCheckedChange={(value) => handleBoolChange('acceptCOD', value)} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">UPI Payments</div>
              <div className="text-sm text-gray-500">Accept UPI transfers.</div>
            </div>
            <Switch checked={profileData.acceptUPI} onCheckedChange={(value) => handleBoolChange('acceptUPI', value)} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Credit/Debit Cards</div>
              <div className="text-sm text-gray-500">Accept card payments.</div>
            </div>
            <Switch checked={profileData.acceptCards} onCheckedChange={(value) => handleBoolChange('acceptCards', value)} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Insurance Coverage</div>
              <div className="text-sm text-gray-500">Accept insurance claims.</div>
            </div>
            <Switch checked={profileData.insuranceSupported} onCheckedChange={(value) => handleBoolChange('insuranceSupported', value)} />
          </div>
        </div>
      </div>
      
      <div>
        <Label htmlFor="supportedInsurers">Supported Insurance Providers</Label>
        <Textarea
          id="supportedInsurers"
          value={profileData.supportedInsurers}
          onChange={(e) => handleInputChange('supportedInsurers', e.target.value)}
          placeholder="List insurance companies you work with (e.g., Star Health, ICICI Lombard, HDFC ERGO)"
          rows={3}
        />
      </div>
      
      <Separator />
      
      <div>
        <Label>Notification Preferences</Label>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">New Orders</div>
              <div className="text-sm text-gray-500">Get notified for new orders.</div>
            </div>
            <Switch checked={profileData.orderUpdates} onCheckedChange={(value) => handleBoolChange('orderUpdates', value)} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Inventory Alerts</div>
              <div className="text-sm text-gray-500">Low stock reminders.</div>
            </div>
            <Switch checked={profileData.inventoryAlerts} onCheckedChange={(value) => handleBoolChange('inventoryAlerts', value)} />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please upload the following required documents to complete your pharmacy profile verification.
        </AlertDescription>
      </Alert>
      
      <div className="space-y-3">
        {[
          { type: 'license', title: 'Drug License', required: true },
          { type: 'gst', title: 'GST Certificate', required: true },
          { type: 'pan', title: 'PAN Card', required: false },
          { type: 'other', title: 'Other Documents', required: false }
        ].map((doc) => (
          <div key={doc.type} className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Label className="font-medium">{doc.title}</Label>
                  {doc.required && <span className="text-red-500">*</span>}
                </div>
                <p className="text-sm text-gray-600">Upload {doc.title.toLowerCase()} document</p>
                {profileData.documents?.find(d => d.type === doc.type)?.fileName && (
                  <p className="text-sm text-green-600 mt-1">
                    ✓ {profileData.documents.find(d => d.type === doc.type)?.fileName}
                  </p>
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.pdf,.jpg,.jpeg,.png';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      // Update the documents array
                      setProfileData(prev => ({
                        ...prev,
                        documents: [
                          ...(prev.documents || []).filter(d => d.type !== doc.type),
                          {
                            type: doc.type,
                            title: doc.title,
                            file: file,
                            fileName: file.name,
                            uploadStatus: 'pending'
                          }
                        ]
                      }));
                      
                      toast({
                        title: 'Document Upload',
                        description: `${doc.title} uploaded successfully.`,
                      });
                    }
                  };
                  input.click();
                }}
              >
                <Upload className="w-4 h-4 mr-2" />
                {profileData.documents?.find(d => d.type === doc.type)?.fileName ? 'Change' : 'Upload'}
              </Button>
            </div>
          </div>
        ))}
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
      case 6: return renderStep6();
      default: return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] sm:max-h-[85vh] overflow-y-auto mx-4">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Complete Your Pharmacy Profile</h2>
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

export default PharmacyProfileCompletionDialog;
