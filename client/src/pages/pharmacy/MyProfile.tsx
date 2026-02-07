import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  User, Briefcase, Building2, Plug, ShieldCheck, Bell, RefreshCw, Save, Globe2, Link2, Eye, Truck, Stethoscope,
  MapPin, Phone, Mail, Calendar, Clock, CreditCard, CheckCircle, AlertTriangle, Star, Award,
  Upload, Download, Settings, Shield, Zap, Heart, Package, Car, CreditCard as CreditCardIcon, Banknote,
  Smartphone, Monitor, FileText, Users, Hospital, Pill, Syringe, Microscope, Beaker, TestTube, GraduationCap, Languages, Plus
} from 'lucide-react';
import pharmacyService from '@/services/pharmacyService';

type ProfileForm = {
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  phone: string;
  bio: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  website: string;
  linkedin: string;
  twitter: string;
  businessName: string;
  licenseNumber: string;
  gstNumber: string;
  supportEmail: string;
  supportPhone: string;
  businessHours: string;
  qualifications: string;
  experienceYears: string;
  specialties: string;
  orderUpdates: boolean;
  prescriptionUpdates: boolean;
  inventoryAlerts: boolean;
  marketingEmails: boolean;
  avatarCloudinaryUrl?: string;
  // Services for patients
  homeDelivery?: boolean;
  deliveryRadiusKm?: string;
  minOrderAmount?: string;
  freeDeliveryAbove?: string;
  acceptCOD?: boolean;
  acceptUPI?: boolean;
  acceptCards?: boolean;
  insuranceSupported?: boolean;
  supportedInsurers?: string;
  // Doctor collaboration
  intakeEmail?: boolean;
  intakeUpload?: boolean;
  intakeErxApi?: boolean;
  prescriptionSlaMins?: string;
  doctorContactEmail?: string;
  doctorContactPhone?: string;
  // Hospital supply
  emergency247?: boolean;
  onAccountBilling?: boolean;
  hospitalLiaisonName?: string;
  hospitalLiaisonPhone?: string;
  hospitalLiaisonEmail?: string;
  // Integrations
  enablePatientRealtime?: boolean;
  webhookUrl?: string;
  apiKeyAlias?: string;
  // Professional Details
  university?: string;
  graduationYear?: string;
  academicScore?: string;
  additionalQualifications?: string;
  totalExperience?: string;
  retailExperience?: string;
  hospitalExperience?: string;
  workHistory?: string;
  areasOfExpertise?: string;
  achievements?: string;
  therapeuticSpecializations?: string;
  specializedServices?: string;
  medicationReview?: boolean;
  patientCounseling?: boolean;
  drugInteractionScreening?: boolean;
  compounding?: boolean;
  vaccinationServices?: boolean;
  healthScreening?: boolean;
  stateCouncil?: string;
  registrationNumber?: string;
  registrationDate?: string;
  registrationExpiry?: string;
  professionalAssociations?: string;
  continuingEducation?: string;
  languagesSpoken?: string;
  communicationStyle?: string;
  consultationDuration?: string;
  // Business Information
  establishmentYear?: string;
  staffCount?: string;
  dailyPrescriptions?: string;
  pharmacyServices?: string;
  operatingHours?: string;
  // Business Contact & Location
  emergencyContact?: string;
  landmark?: string;
  // Business Compliance
  panNumber?: string;
  drugLicenseExpiry?: string;
  gstRegistrationDate?: string;
  // Business Infrastructure
  storeSize?: string;
  waitingArea?: boolean;
  consultationRoom?: boolean;
  airConditioning?: boolean;
  restroom?: boolean;
  securitySystem?: boolean;
  cctv?: boolean;
  // Delivery Services
  expressDelivery?: boolean;
  sameDayDelivery?: boolean;
  scheduledDelivery?: boolean;
  officeDelivery?: boolean;
  hospitalDelivery?: boolean;
  emergencyDelivery?: boolean;
  // Payment Methods
  acceptDigitalWallets?: boolean;
  acceptNetBanking?: boolean;
  // Additional Services
  prescriptionReminders?: boolean;
  medicationReviews?: boolean;
  healthConsultations?: boolean;
  medicalEquipment?: boolean;
  telepharmacy?: boolean;
  mobilePharmacy?: boolean;
  specialServices?: string;
  // Settings
  paymentNotifications?: boolean;
  productUpdates?: boolean;
  industryNews?: boolean;
  analyticsData?: boolean;
  thirdPartyData?: boolean;
};

const defaultForm: ProfileForm = {
  firstName: '',
  lastName: '',
  title: '',
  email: '',
  phone: '',
  bio: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'India',
  website: '',
  linkedin: '',
  twitter: '',
  businessName: '',
  licenseNumber: '',
  gstNumber: '',
  supportEmail: '',
  supportPhone: '',
  businessHours: '',
  qualifications: '',
  experienceYears: '',
  specialties: '',
  orderUpdates: true,
  prescriptionUpdates: true,
  inventoryAlerts: true,
  marketingEmails: false,
  homeDelivery: true,
  deliveryRadiusKm: '5',
  minOrderAmount: '0',
  freeDeliveryAbove: '',
  acceptCOD: true,
  acceptUPI: true,
  acceptCards: true,
  insuranceSupported: true,
  supportedInsurers: '',
  intakeEmail: true,
  intakeUpload: true,
  intakeErxApi: false,
  prescriptionSlaMins: '30',
  doctorContactEmail: '',
  doctorContactPhone: '',
  emergency247: false,
  onAccountBilling: false,
  hospitalLiaisonName: '',
  hospitalLiaisonPhone: '',
  hospitalLiaisonEmail: '',
  enablePatientRealtime: true,
  webhookUrl: '',
  apiKeyAlias: '',
  // Professional Details
  university: '',
  graduationYear: '',
  academicScore: '',
  additionalQualifications: '',
  totalExperience: '',
  retailExperience: '',
  hospitalExperience: '',
  workHistory: '',
  areasOfExpertise: '',
  achievements: '',
  therapeuticSpecializations: '',
  specializedServices: '',
  medicationReview: false,
  patientCounseling: false,
  drugInteractionScreening: false,
  compounding: false,
  vaccinationServices: false,
  healthScreening: false,
  stateCouncil: '',
  registrationNumber: '',
  registrationDate: '',
  registrationExpiry: '',
  professionalAssociations: '',
  continuingEducation: '',
  languagesSpoken: '',
  communicationStyle: '',
  consultationDuration: '',
  // Business Information
  establishmentYear: '',
  staffCount: '',
  dailyPrescriptions: '',
  pharmacyServices: '',
  operatingHours: '',
  // Business Contact & Location
  emergencyContact: '',
  landmark: '',
  // Business Compliance
  panNumber: '',
  drugLicenseExpiry: '',
  gstRegistrationDate: '',
  // Business Infrastructure
  storeSize: '',
  waitingArea: false,
  consultationRoom: false,
  airConditioning: false,
  restroom: false,
  securitySystem: false,
  cctv: false,
  // Delivery Services
  expressDelivery: false,
  sameDayDelivery: false,
  scheduledDelivery: false,
  officeDelivery: false,
  hospitalDelivery: false,
  emergencyDelivery: false,
  // Payment Methods
  acceptDigitalWallets: false,
  acceptNetBanking: false,
  // Additional Services
  prescriptionReminders: false,
  medicationReviews: false,
  healthConsultations: false,
  medicalEquipment: false,
  telepharmacy: false,
  mobilePharmacy: false,
  specialServices: '',
  // Settings
  paymentNotifications: true,
  productUpdates: true,
  industryNews: false,
  analyticsData: true,
  thirdPartyData: false,
};

const MyProfile: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [avatar, setAvatar] = useState<File | undefined>();
  const [docs, setDocs] = useState<{ licenseDoc?: File; gstCertificate?: File; panCard?: File }>({});
  const [form, setForm] = useState<ProfileForm>(defaultForm);

  const load = async () => {
    setLoading(true);
    try {
      const data = await pharmacyService.getMyProfile();
      if (data) setForm((f) => ({ ...f, ...data }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    try {
      await pharmacyService.updateMyProfile(form, avatar, { licenseDoc: docs.licenseDoc, gstCertificate: docs.gstCertificate, panCard: docs.panCard });
      await load();
    } finally {
      setSaving(false);
      setAvatar(undefined);
      setDocs({});
    }
  };

  const bind = (key: keyof ProfileForm) => ({
    value: (form[key] as string) ?? '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  const setBool = (key: keyof ProfileForm) => (value: boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  const initials = useMemo(() => {
    const fn = form.firstName?.[0] ?? '';
    const ln = form.lastName?.[0] ?? '';
    return `${fn}${ln}`.toUpperCase() || 'P';
  }, [form.firstName, form.lastName]);

  return (
    <div className="w-full min-h-[calc(100vh-80px)] px-2 md:px-6 py-8 bg-health-light-gray max-w-5xl mx-auto">
      {/* Tabs */}
      <div className="flex justify-between items-center mb-6 bg-white rounded-xl shadow p-1 w-full max-w-4xl mx-auto">
        <button
          className={`flex-1 flex flex-col items-center py-2 px-1 rounded-lg transition font-semibold text-base md:text-lg focus:outline-none ${
            activeTab === 'overview'
              ? 'bg-health-teal text-white shadow'
              : 'text-health-blue-gray hover:bg-health-teal/10'
          }`}
          onClick={() => setActiveTab('overview')}
        >
          <User className="w-5 h-5 mb-1" />
          Overview
        </button>
        <button
          className={`flex-1 flex flex-col items-center py-2 px-1 rounded-lg transition font-semibold text-base md:text-lg focus:outline-none ${
            activeTab === 'professional'
              ? 'bg-health-teal text-white shadow'
              : 'text-health-blue-gray hover:bg-health-teal/10'
          }`}
          onClick={() => setActiveTab('professional')}
        >
          <Briefcase className="w-5 h-5 mb-1" />
          Professional
        </button>
        <button
          className={`flex-1 flex flex-col items-center py-2 px-1 rounded-lg transition font-semibold text-base md:text-lg focus:outline-none ${
            activeTab === 'business'
              ? 'bg-health-teal text-white shadow'
              : 'text-health-blue-gray hover:bg-health-teal/10'
          }`}
          onClick={() => setActiveTab('business')}
        >
          <Building2 className="w-5 h-5 mb-1" />
          Business
        </button>
        <button
          className={`flex-1 flex flex-col items-center py-2 px-1 rounded-lg transition font-semibold text-base md:text-lg focus:outline-none ${
            activeTab === 'services'
              ? 'bg-health-teal text-white shadow'
              : 'text-health-blue-gray hover:bg-health-teal/10'
          }`}
          onClick={() => setActiveTab('services')}
        >
          <Truck className="w-5 h-5 mb-1" />
          Services
        </button>
        <button
          className={`flex-1 flex flex-col items-center py-2 px-1 rounded-lg transition font-semibold text-base md:text-lg focus:outline-none ${
            activeTab === 'settings'
              ? 'bg-health-teal text-white shadow'
              : 'text-health-blue-gray hover:bg-health-teal/10'
          }`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings className="w-5 h-5 mb-1" />
          Settings
        </button>
      </div>

      {/* Tab Content */}
      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <Card className="shadow-lg mb-8 w-full rounded-xl border-0">
        <CardHeader className="flex flex-row items-center gap-6 pb-2">
          <div className="relative group">
            <Avatar className="h-24 w-24 border-2 border-health-teal shadow-sm">
              <AvatarImage src={form.avatarCloudinaryUrl} />
              <AvatarFallback className="bg-health-teal text-white text-3xl">
                {initials}
              </AvatarFallback>
          </Avatar>
            <label className="absolute bottom-0 right-0 bg-health-aqua p-2 rounded-full cursor-pointer shadow hover:bg-health-teal transition">
              <Upload className="h-4 w-4 text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setAvatar(e.target.files?.[0])} />
            </label>
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-2xl md:text-3xl font-bold text-health-teal mb-2">
              {form.businessName || 'Pharmacy Business'}
            </CardTitle>
            <div className="flex items-center gap-2 text-health-blue-gray text-sm md:text-base mb-2">
              <Mail className="h-4 w-4" />
              <span>{form.email || 'email@pharmacy.com'}</span>
              <CheckCircle className="h-4 w-4 text-health-success ml-2" />
        </div>
            <div className="flex items-center gap-2 text-health-blue-gray text-sm mb-2">
              <Phone className="h-4 w-4" />
              <span>{form.phone || '+91 9876543210'}</span>
        </div>
            <div className="flex items-center gap-2 text-health-blue-gray text-sm mb-2">
              <MapPin className="h-4 w-4" />
              <span>{form.city && form.state ? `${form.city}, ${form.state}` : 'Location not set'}</span>
      </div>
                </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
              Available
            </Badge>
            <Button variant="outline" size="sm" className="border-gray-300" onClick={save} disabled={saving}>
              <Settings className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
                </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Business Name</Label>
              <Input 
                placeholder="Your Pharmacy Pvt Ltd" 
                {...bind('businessName')} 
                className="border-gray-200 focus:border-health-teal focus:ring-health-teal h-10 rounded-md"
              />
                </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Contact Email</Label>
              <Input 
                type="email" 
                placeholder="contact@pharmacy.com" 
                {...bind('email')} 
                className="border-gray-200 focus:border-health-teal focus:ring-health-teal h-10 rounded-md"
              />
                </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Contact Phone</Label>
              <Input 
                placeholder="+91 9876543210" 
                {...bind('phone')} 
                className="border-gray-200 focus:border-health-teal focus:ring-health-teal h-10 rounded-md"
              />
              </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">License Number</Label>
              <Input 
                placeholder="DL-XXXX-YYYY" 
                {...bind('licenseNumber')} 
                className="border-gray-200 focus:border-health-teal focus:ring-health-teal h-10 rounded-md"
              />
                </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">GST Number</Label>
              <Input 
                placeholder="22AAAAA0000A1Z5" 
                {...bind('gstNumber')} 
                className="border-gray-200 focus:border-health-teal focus:ring-health-teal h-10 rounded-md"
              />
                </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Business Logo</Label>
              <Input 
                type="file" 
                onChange={(e) => setAvatar(e.target.files?.[0])} 
                className="border-gray-200 focus:border-health-teal focus:ring-health-teal h-10 rounded-md"
              />
              </div>
          </div>
        </CardContent>
      </Card>
      )}

      {/* Professional Tab */}
      {activeTab === 'professional' && (
        <>
          {/* Pharmacy Business Information */}
          <Card className="shadow-lg mb-6 w-full rounded-xl border-0">
            <CardHeader>
              <CardTitle className="text-health-teal flex items-center gap-2">
                <Building2 className="h-5 w-5" /> Pharmacy Business Information
              </CardTitle>
              <CardDescription>Essential business details and operational information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Pharmacy Type</Label>
                  <Select>
                    <SelectTrigger className="border-gray-200 focus:border-health-teal focus:ring-health-teal h-10 rounded-md">
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
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Years in Business</Label>
                  <Input type="number" placeholder="5" {...bind('totalExperience')} className="border-gray-200 focus:border-health-teal focus:ring-health-teal h-10 rounded-md" />
                </div>
                </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Key Services</Label>
                <Textarea 
                  placeholder="List your main services (e.g., prescription dispensing, home delivery, medical supplies, compounding)" 
                  {...bind('pharmacyServices')} 
                  className="border-gray-200 focus:border-health-teal focus:ring-health-teal rounded-md min-h-[80px]" 
                />
                </div>
            </CardContent>
          </Card>

          {/* Pharmacy Business Operations */}
          <Card className="shadow-lg mb-6 w-full rounded-xl border-0">
            <CardHeader>
              <CardTitle className="text-health-teal flex items-center gap-2">
                <Briefcase className="h-5 w-5" /> Pharmacy Business Operations
              </CardTitle>
              <CardDescription>Essential operational details and capabilities.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Operating Hours</Label>
                  <Input placeholder="9 AM - 9 PM" {...bind('operatingHours')} className="border-gray-200 focus:border-health-teal focus:ring-health-teal h-10 rounded-md" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Emergency Services</Label>
                  <Select>
                    <SelectTrigger className="border-gray-200 focus:border-health-teal focus:ring-health-teal h-10 rounded-md">
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

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Business Description</Label>
                <Textarea 
                  placeholder="Brief description of your pharmacy business and what makes you unique..." 
                  {...bind('workHistory')} 
                  className="border-gray-200 focus:border-health-teal focus:ring-health-teal rounded-md min-h-[80px]" 
                />
              </div>
            </CardContent>
          </Card>

          {/* Pharmacy Specializations & Services */}
          <Card className="shadow-lg mb-6 w-full rounded-xl border-0">
            <CardHeader>
              <CardTitle className="text-health-teal flex items-center gap-2">
                <Pill className="h-5 w-5" /> Pharmacy Specializations & Services
              </CardTitle>
              <CardDescription>Essential pharmacy services and specializations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Specializations</Label>
                <Textarea 
                  placeholder="e.g., Diabetes care, Pediatric medications, Geriatric care, Pain management, Women's health" 
                  {...bind('therapeuticSpecializations')} 
                  className="border-gray-200 focus:border-health-teal focus:ring-health-teal rounded-md min-h-[80px]" 
                />
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-semibold text-gray-700">Available Services</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch checked={!!form.medicationReview} onCheckedChange={setBool('medicationReview')} />
                    <Label className="text-sm">Medication Review</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch checked={!!form.patientCounseling} onCheckedChange={setBool('patientCounseling')} />
                    <Label className="text-sm">Patient Counseling</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch checked={!!form.compounding} onCheckedChange={setBool('compounding')} />
                    <Label className="text-sm">Compounding</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch checked={!!form.vaccinationServices} onCheckedChange={setBool('vaccinationServices')} />
                    <Label className="text-sm">Vaccination</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch checked={!!form.healthScreening} onCheckedChange={setBool('healthScreening')} />
                    <Label className="text-sm">Health Screening</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch checked={!!form.medicalEquipment} onCheckedChange={setBool('medicalEquipment')} />
                    <Label className="text-sm">Medical Equipment</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pharmacy Regulatory & Memberships */}
          <Card className="shadow-lg mb-6 w-full rounded-xl border-0">
            <CardHeader>
              <CardTitle className="text-health-teal flex items-center gap-2">
                <Shield className="h-5 w-5" /> Pharmacy Regulatory & Memberships
              </CardTitle>
              <CardDescription>Essential regulatory compliance information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">State Pharmacy Council</Label>
                  <Input placeholder="e.g., Delhi Pharmacy Council" {...bind('stateCouncil')} className="border-gray-200 focus:border-health-teal focus:ring-health-teal h-10 rounded-md" />
              </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Registration Number</Label>
                  <Input placeholder="e.g., DPC/2020/12345" {...bind('registrationNumber')} className="border-gray-200 focus:border-health-teal focus:ring-health-teal h-10 rounded-md" />
              </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Registration Date</Label>
                  <Input type="date" {...bind('registrationDate')} className="border-gray-200 focus:border-health-teal focus:ring-health-teal h-10 rounded-md" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Registration Expiry</Label>
                  <Input type="date" {...bind('registrationExpiry')} className="border-gray-200 focus:border-health-teal focus:ring-health-teal h-10 rounded-md" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Professional Memberships</Label>
                <Textarea 
                  placeholder="e.g., Indian Pharmaceutical Association (IPA), State Pharmacy Associations" 
                  {...bind('professionalAssociations')} 
                  className="border-gray-200 focus:border-health-teal focus:ring-health-teal rounded-md min-h-[80px]" 
                />
              </div>
            </CardContent>
          </Card>

          {/* Patient Communication & Languages */}
          <Card className="shadow-lg mb-6 w-full rounded-xl border-0">
            <CardHeader>
              <CardTitle className="text-health-teal flex items-center gap-2">
                <Languages className="h-5 w-5" /> Patient Communication & Languages
              </CardTitle>
              <CardDescription>Essential communication preferences for patient interactions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Languages Spoken</Label>
                <Textarea 
                  placeholder="e.g., English (Fluent), Hindi (Native), Punjabi (Conversational), Gujarati (Basic)" 
                  {...bind('languagesSpoken')} 
                  className="border-gray-200 focus:border-health-teal focus:ring-health-teal rounded-md min-h-[80px]" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Communication Style</Label>
                  <Select>
                    <SelectTrigger className="border-gray-200 focus:border-health-teal focus:ring-health-teal h-10 rounded-md">
                      <SelectValue placeholder="Select communication style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="friendly">Friendly and Approachable</SelectItem>
                      <SelectItem value="professional">Professional and Formal</SelectItem>
                      <SelectItem value="educational">Educational and Informative</SelectItem>
                      <SelectItem value="empathetic">Empathetic and Caring</SelectItem>
                      <SelectItem value="direct">Direct and Clear</SelectItem>
                    </SelectContent>
                  </Select>
              </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Consultation Duration</Label>
                  <Select>
                    <SelectTrigger className="border-gray-200 focus:border-health-teal focus:ring-health-teal h-10 rounded-md">
                      <SelectValue placeholder="Select consultation duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5-10">5-10 minutes</SelectItem>
                      <SelectItem value="10-15">10-15 minutes</SelectItem>
                      <SelectItem value="15-20">15-20 minutes</SelectItem>
                      <SelectItem value="20-30">20-30 minutes</SelectItem>
                      <SelectItem value="30+">30+ minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Business Tab */}
      {activeTab === 'business' && (
        <>
          {/* Business Contact & Location */}
          <Card className="shadow-lg mb-6 w-full rounded-xl border-0">
              <CardHeader>
              <CardTitle className="text-health-teal flex items-center gap-2">
                <MapPin className="h-5 w-5" /> Business Contact & Location
              </CardTitle>
              <CardDescription>Essential contact information and location details.</CardDescription>
              </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Business Hours</Label>
                  <Input placeholder="Mon-Sat 9:00 AM - 9:00 PM" {...bind('businessHours')} className="border-gray-200 focus:border-health-teal focus:ring-health-teal h-10 rounded-md" />
                  </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Emergency Contact</Label>
                  <Input placeholder="+91 90000 00000" {...bind('emergencyContact')} className="border-gray-200 focus:border-health-teal focus:ring-health-teal h-10 rounded-md" />
                  </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Support Email</Label>
                  <Input placeholder="support@pharmacy.com" {...bind('supportEmail')} className="border-gray-200 focus:border-health-teal focus:ring-health-teal h-10 rounded-md" />
                  </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Support Phone</Label>
                  <Input placeholder="+91 90000 00000" {...bind('supportPhone')} className="border-gray-200 focus:border-health-teal focus:ring-health-teal h-10 rounded-md" />
                  </div>
                </div>

              <div className="space-y-4">
                <Label className="text-sm font-semibold text-gray-700">Complete Address</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Street Address</Label>
                    <Input placeholder="123 Main Street, Building Name" {...bind('address')} className="border-gray-200 focus:border-health-teal focus:ring-health-teal h-10 rounded-md" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Landmark</Label>
                    <Input placeholder="Near Hospital, Opposite Bank" {...bind('landmark')} className="border-gray-200 focus:border-health-teal focus:ring-health-teal h-10 rounded-md" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">City</Label>
                    <Input placeholder="Mumbai" {...bind('city')} className="border-gray-200 focus:border-health-teal focus:ring-health-teal h-10 rounded-md" />
                </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">State</Label>
                    <Input placeholder="Maharashtra" {...bind('state')} className="border-gray-200 focus:border-health-teal focus:ring-health-teal h-10 rounded-md" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">PIN Code</Label>
                    <Input placeholder="400001" {...bind('zipCode')} className="border-gray-200 focus:border-health-teal focus:ring-health-teal h-10 rounded-md" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Country</Label>
                    <Input placeholder="India" {...bind('country')} className="border-gray-200 focus:border-health-teal focus:ring-health-teal h-10 rounded-md" />
                  </div>
                </div>
                </div>
              </CardContent>
            </Card>

          {/* Business Details & Compliance */}
          <Card className="shadow-lg mb-6 w-full rounded-xl border-0">
              <CardHeader>
              <CardTitle className="text-health-teal flex items-center gap-2">
                <FileText className="h-5 w-5" /> Business Details & Compliance
              </CardTitle>
              <CardDescription>Essential legal and regulatory information.</CardDescription>
              </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">License Number</Label>
                  <Input placeholder="DL-XXXX-YYYY" {...bind('licenseNumber')} className="border-gray-200 focus:border-health-teal focus:ring-health-teal h-10 rounded-md" />
                  </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">GST Number</Label>
                  <Input placeholder="22AAAAA0000A1Z5" {...bind('gstNumber')} className="border-gray-200 focus:border-health-teal focus:ring-health-teal h-10 rounded-md" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">PAN Number</Label>
                  <Input placeholder="ABCDE1234F" {...bind('panNumber')} className="border-gray-200 focus:border-health-teal focus:ring-health-teal h-10 rounded-md" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">License Expiry</Label>
                  <Input type="date" {...bind('drugLicenseExpiry')} className="border-gray-200 focus:border-health-teal focus:ring-health-teal h-10 rounded-md" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Business Description</Label>
                <Textarea 
                  placeholder="Brief description of your pharmacy business and services..." 
                  {...bind('bio')} 
                  className="border-gray-200 focus:border-health-teal focus:ring-health-teal rounded-md min-h-[80px]" 
                />
                </div>
              </CardContent>
            </Card>

          {/* Business Infrastructure */}
          <Card className="shadow-lg mb-6 w-full rounded-xl border-0">
            <CardHeader>
              <CardTitle className="text-health-teal flex items-center gap-2">
                <Building2 className="h-5 w-5" /> Business Infrastructure
              </CardTitle>
              <CardDescription>Essential physical infrastructure and facilities.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Store Size (sq ft)</Label>
                  <Input type="number" placeholder="500" {...bind('storeSize')} className="border-gray-200 focus:border-health-teal focus:ring-health-teal h-10 rounded-md" />
          </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Parking Available</Label>
                  <Select>
                    <SelectTrigger className="border-gray-200 focus:border-health-teal focus:ring-health-teal h-10 rounded-md">
                      <SelectValue placeholder="Select parking availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="limited">Limited</SelectItem>
                      <SelectItem value="street">Street Parking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-semibold text-gray-700">Available Facilities</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch checked={!!form.waitingArea} onCheckedChange={setBool('waitingArea')} />
                    <Label className="text-sm">Waiting Area</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch checked={!!form.consultationRoom} onCheckedChange={setBool('consultationRoom')} />
                    <Label className="text-sm">Consultation Room</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch checked={!!form.airConditioning} onCheckedChange={setBool('airConditioning')} />
                    <Label className="text-sm">Air Conditioning</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch checked={!!form.restroom} onCheckedChange={setBool('restroom')} />
                    <Label className="text-sm">Restroom</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Services Tab */}
      {activeTab === 'services' && (
        <>
          {/* Delivery Services */}
          <Card className="shadow-lg mb-6 w-full rounded-xl border-0">
            <CardHeader>
              <CardTitle className="text-health-teal flex items-center gap-2">
                <Truck className="h-5 w-5" /> Delivery Services
              </CardTitle>
              <CardDescription>Essential delivery service configuration.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Home Delivery</div>
                    <div className="text-sm text-gray-500">Deliver medicines to patient locations.</div>
                  </div>
                  <Switch checked={!!form.homeDelivery} onCheckedChange={setBool('homeDelivery')} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Delivery Radius (km)</Label>
                  <Input placeholder="e.g. 5" {...bind('deliveryRadiusKm')} className="border-gray-200 focus:border-health-teal focus:ring-health-teal h-10 rounded-md" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Minimum Order Amount (₹)</Label>
                  <Input placeholder="0" {...bind('minOrderAmount')} className="border-gray-200 focus:border-health-teal focus:ring-health-teal h-10 rounded-md" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Free Delivery Above (₹)</Label>
                  <Input placeholder="500" {...bind('freeDeliveryAbove')} className="border-gray-200 focus:border-health-teal focus:ring-health-teal h-10 rounded-md" />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-semibold text-gray-700">Delivery Options</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch checked={!!form.expressDelivery} onCheckedChange={setBool('expressDelivery')} />
                    <Label className="text-sm">Express Delivery</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch checked={!!form.sameDayDelivery} onCheckedChange={setBool('sameDayDelivery')} />
                    <Label className="text-sm">Same Day Delivery</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card className="shadow-lg mb-6 w-full rounded-xl border-0">
            <CardHeader>
              <CardTitle className="text-health-teal flex items-center gap-2">
                <CreditCard className="h-5 w-5" /> Payment Methods
              </CardTitle>
              <CardDescription>Essential payment method configuration.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Cash on Delivery</div>
                    <div className="text-sm text-gray-500">Accept cash payments on delivery.</div>
                  </div>
                  <Switch checked={!!form.acceptCOD} onCheckedChange={setBool('acceptCOD')} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">UPI Payments</div>
                    <div className="text-sm text-gray-500">Accept UPI transfers.</div>
                  </div>
                  <Switch checked={!!form.acceptUPI} onCheckedChange={setBool('acceptUPI')} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Credit/Debit Cards</div>
                    <div className="text-sm text-gray-500">Accept card payments.</div>
                  </div>
                  <Switch checked={!!form.acceptCards} onCheckedChange={setBool('acceptCards')} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Digital Wallets</div>
                    <div className="text-sm text-gray-500">Paytm, PhonePe, etc.</div>
                  </div>
                  <Switch checked={!!form.acceptDigitalWallets} onCheckedChange={setBool('acceptDigitalWallets')} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Insurance Coverage</div>
                    <div className="text-sm text-gray-500">Accept insurance claims.</div>
                  </div>
                  <Switch checked={!!form.insuranceSupported} onCheckedChange={setBool('insuranceSupported')} />
                </div>
                </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Supported Insurance Providers</Label>
                <Textarea 
                  placeholder="List insurance companies you work with (e.g., Star Health, ICICI Lombard, HDFC ERGO)" 
                  {...bind('supportedInsurers')} 
                  className="border-gray-200 focus:border-health-teal focus:ring-health-teal rounded-md min-h-[80px]" 
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Services */}
          <Card className="shadow-lg mb-6 w-full rounded-xl border-0">
            <CardHeader>
              <CardTitle className="text-health-teal flex items-center gap-2">
                <Plus className="h-5 w-5" /> Additional Services
              </CardTitle>
              <CardDescription>Value-added services to enhance patient experience.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch checked={!!form.prescriptionReminders} onCheckedChange={setBool('prescriptionReminders')} />
                  <Label className="text-sm">Prescription Reminders</Label>
                  </div>
                <div className="flex items-center space-x-2">
                  <Switch checked={!!form.medicationReviews} onCheckedChange={setBool('medicationReviews')} />
                  <Label className="text-sm">Medication Reviews</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch checked={!!form.healthConsultations} onCheckedChange={setBool('healthConsultations')} />
                  <Label className="text-sm">Health Consultations</Label>
                  </div>
                <div className="flex items-center space-x-2">
                  <Switch checked={!!form.vaccinationServices} onCheckedChange={setBool('vaccinationServices')} />
                  <Label className="text-sm">Vaccination Services</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch checked={!!form.healthScreening} onCheckedChange={setBool('healthScreening')} />
                  <Label className="text-sm">Health Screening</Label>
                  </div>
                <div className="flex items-center space-x-2">
                  <Switch checked={!!form.medicalEquipment} onCheckedChange={setBool('medicalEquipment')} />
                  <Label className="text-sm">Medical Equipment</Label>
                </div>
                </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Special Services Description</Label>
                <Textarea 
                  placeholder="Describe any unique or specialized services your pharmacy offers..." 
                  {...bind('specialServices')} 
                  className="border-gray-200 focus:border-health-teal focus:ring-health-teal rounded-md min-h-[80px]" 
                />
                </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <>
          {/* Notification Preferences */}
          <Card className="shadow-lg mb-6 w-full rounded-xl border-0">
            <CardHeader>
              <CardTitle className="text-health-teal flex items-center gap-2">
                <Bell className="h-5 w-5" /> Notification Preferences
              </CardTitle>
              <CardDescription>Configure when and how you want to be notified.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label className="text-sm font-semibold text-gray-700">Business Notifications</Label>
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="font-medium">New Orders</div>
                      <div className="text-sm text-gray-500">Get notified for new orders and status changes.</div>
                </div>
                    <Switch checked={form.orderUpdates} onCheckedChange={setBool('orderUpdates')} />
              </div>
                  <div className="flex items-center justify-between gap-4">
                  <div>
                      <div className="font-medium">Prescription Updates</div>
                      <div className="text-sm text-gray-500">When doctors or patients upload new prescriptions.</div>
                  </div>
                    <Switch checked={form.prescriptionUpdates} onCheckedChange={setBool('prescriptionUpdates')} />
                </div>
                  <div className="flex items-center justify-between gap-4">
                  <div>
                      <div className="font-medium">Inventory Alerts</div>
                      <div className="text-sm text-gray-500">Low stock and expiry reminders.</div>
                  </div>
                    <Switch checked={form.inventoryAlerts} onCheckedChange={setBool('inventoryAlerts')} />
                </div>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="font-medium">Payment Notifications</div>
                      <div className="text-sm text-gray-500">Payment confirmations and failed transactions.</div>
                </div>
                    <Switch checked={form.paymentNotifications} onCheckedChange={setBool('paymentNotifications')} />
                </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label className="text-sm font-semibold text-gray-700">Marketing & Updates</Label>
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                <div>
                      <div className="font-medium">Product Updates</div>
                      <div className="text-sm text-gray-500">New features and platform improvements.</div>
                </div>
                    <Switch checked={form.productUpdates} onCheckedChange={setBool('productUpdates')} />
              </div>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="font-medium">Marketing Emails</div>
                      <div className="text-sm text-gray-500">Promotional offers and business tips.</div>
                </div>
                    <Switch checked={form.marketingEmails} onCheckedChange={setBool('marketingEmails')} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card className="shadow-lg mb-6 w-full rounded-xl border-0">
            <CardHeader>
              <CardTitle className="text-health-teal flex items-center gap-2">
                <Shield className="h-5 w-5" /> Privacy & Security
              </CardTitle>
              <CardDescription>Manage your account security and privacy settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Two-Factor Authentication</Label>
                  <Select>
                    <SelectTrigger className="border-gray-200 focus:border-health-teal focus:ring-health-teal h-10 rounded-md">
                      <SelectValue placeholder="Select 2FA method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Disabled</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="app">Authenticator App</SelectItem>
                    </SelectContent>
                  </Select>
              </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Session Timeout</Label>
                  <Select>
                    <SelectTrigger className="border-gray-200 focus:border-health-teal focus:ring-health-teal h-10 rounded-md">
                      <SelectValue placeholder="Select timeout duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="240">4 hours</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
              </div>
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-semibold text-gray-700">Data Sharing Preferences</Label>
                <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                      <div className="font-medium">Analytics Data</div>
                      <div className="text-sm text-gray-500">Share anonymous usage data for platform improvement.</div>
                </div>
                    <Switch checked={form.analyticsData} onCheckedChange={setBool('analyticsData')} />
              </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Management */}
          <Card className="shadow-lg mb-6 w-full rounded-xl border-0">
            <CardHeader>
              <CardTitle className="text-health-teal flex items-center gap-2">
                <Settings className="h-5 w-5" /> Account Management
              </CardTitle>
              <CardDescription>Manage your account settings and preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Language Preference</Label>
                  <Select>
                    <SelectTrigger className="border-gray-200 focus:border-health-teal focus:ring-health-teal h-10 rounded-md">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                      <SelectItem value="gu">Gujarati</SelectItem>
                      <SelectItem value="mr">Marathi</SelectItem>
                      <SelectItem value="bn">Bengali</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Time Zone</Label>
                  <Select>
                    <SelectTrigger className="border-gray-200 focus:border-health-teal focus:ring-health-teal h-10 rounded-md">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IST">India Standard Time (IST)</SelectItem>
                      <SelectItem value="GMT">Greenwich Mean Time (GMT)</SelectItem>
                      <SelectItem value="EST">Eastern Standard Time (EST)</SelectItem>
                      <SelectItem value="PST">Pacific Standard Time (PST)</SelectItem>
                    </SelectContent>
                  </Select>
              </div>
                </div>

              <div className="space-y-4">
                <Label className="text-sm font-semibold text-gray-700">Account Actions</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-50">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                  <Button variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-50">
                    <Eye className="h-4 w-4 mr-2" />
                    View Activity Log
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default MyProfile;
