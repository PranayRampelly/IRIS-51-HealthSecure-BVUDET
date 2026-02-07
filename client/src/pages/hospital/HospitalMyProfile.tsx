import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  ShieldCheck, 
  MailCheck, 
  Lock, 
  Edit2, 
  Save, 
  X, 
  Upload, 
  Phone, 
  User as UserIcon, 
  Home, 
  Building,
  Stethoscope,
  FileText,
  MapPin,
  Globe,
  Calendar,
  Users,
  Bed,
  Shield,
  CheckCircle,
  AlertCircle,
  Ambulance
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getProfileImageUrl } from '@/lib/utils';

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
    fileUrl?: string;
    fileName?: string;
    required: boolean;
  }>;
  profileCompleted: boolean;
  profileCompletedAt?: string;
  profileImage?: string;
  isEmailVerified?: boolean;
  
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

const initialProfile: HospitalProfileData = {
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
    country: 'United States',
  },
  description: '',
  mission: '',
  vision: '',
  totalBeds: 0,
  departments: 0,
  staffCount: 0,
  insuranceAccepted: [],
  documents: [],
  profileCompleted: false,
  profileImage: '',
  isEmailVerified: false,
  
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
};

const tabs = [
  { key: 'profile', label: 'Profile', icon: Building },
  { key: 'contact', label: 'Contact', icon: Phone },
  { key: 'services', label: 'Services', icon: Stethoscope },
  { key: 'professional', label: 'Professional', icon: Shield },
  { key: 'ambulance', label: 'Ambulance', icon: Ambulance },
  { key: 'documents', label: 'Documents', icon: FileText },
];

const hospitalTypes = [
  'General Hospital',
  'Specialty Hospital', 
  'Teaching Hospital',
  'Research Hospital',
  'Private Hospital',
  'Public Hospital',
  'Emergency Hospital',
  'Rehabilitation Hospital'
];

const HospitalMyProfile = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<HospitalProfileData>(initialProfile);
  const [editMode, setEditMode] = useState(false);
  const [image, setImage] = useState(profile.profileImage);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/hospital/profile`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const profileData = data.data;
        
        // Format the establishment date for the date input
        const formattedData = {
          ...profileData,
          establishmentDate: formatDateForInput(profileData.establishmentDate)
        };
        
        setProfile(formattedData);
        setImage(profileData.profileImage || '');
        setLoading(false);
      } else {
        setError('Failed to load profile.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Failed to load profile.');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfile(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof HospitalProfileData] as Record<string, unknown>),
          [child]: value
        }
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfile(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof HospitalProfileData] as Record<string, unknown>),
          [child]: parseInt(value) || 0
        }
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        [name]: parseInt(value) || 0
      }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = () => setEditMode(true);

  const handleCancel = () => {
    setEditMode(false);
    loadProfile(); // Reload original data
    setImageFile(null);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Prepare the data for saving
      const saveData = {
        ...profile,
        establishmentDate: profile.establishmentDate ? new Date(profile.establishmentDate).toISOString() : undefined
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/hospital/profile/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(saveData)
      });

      if (response.ok) {
        setEditMode(false);
        setSuccess('Profile updated successfully!');
        toast({
          title: 'Success',
          description: 'Hospital profile updated successfully.',
        });
        await loadProfile(); // Reload to get updated data
      } else {
        const errorData = await response.text();
        setError(`Failed to update profile: ${errorData}`);
        toast({
          title: 'Error',
          description: 'Failed to update profile.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile.');
      toast({
        title: 'Error',
        description: 'Failed to update profile.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getCompletionPercentage = () => {
    // Only require essential fields for profile completion
    const requiredFields = [
      profile.hospitalName,
      profile.hospitalType,
      profile.licenseNumber,
      profile.phone,
      profile.emergencyContact,
      profile.address?.street,
      profile.address?.city,
      profile.address?.state,
      profile.description,
      profile.totalBeds,
      profile.departments
    ];
    
    const completedFields = requiredFields.filter(field => field && field !== '' && field !== 0).length;
    return Math.round((completedFields / requiredFields.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-health-teal"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-health-teal mb-2">Hospital Profile</h1>
        <p className="text-health-blue-gray">Manage your hospital information and settings</p>
        
        {/* Profile Completion Status */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-health-blue-gray">Profile Completion</span>
            <span className="text-sm text-health-blue-gray">{getCompletionPercentage()}% Complete</span>
          </div>
          <div className="w-full bg-health-light-gray rounded-full h-2">
            <div 
              className="bg-health-teal h-2 rounded-full transition-all duration-300"
              style={{ width: `${getCompletionPercentage()}%` }}
            ></div>
          </div>
          {getCompletionPercentage() < 100 && (
            <p className="text-sm text-orange-600 mt-2">
              Complete your profile to access all features
            </p>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-health-light-gray p-1 rounded-lg mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-health-teal shadow-sm'
                : 'text-health-blue-gray hover:text-health-teal'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <Card className="shadow-lg mb-8 w-full min-h-[340px] rounded-xl border-0">
          <CardHeader className="flex flex-row items-center gap-6 pb-2">
            <div className="relative group">
              <Avatar className="h-20 w-20 border-2 border-health-teal shadow-sm">
                <AvatarImage src={getProfileImageUrl(profile.profileImage)} />
                <AvatarFallback className="bg-health-teal text-white text-2xl">
                  {profile.hospitalName ? profile.hospitalName[0] : 'H'}
                </AvatarFallback>
              </Avatar>
              {editMode && (
                <label className="absolute bottom-0 right-0 bg-health-aqua p-1.5 rounded-full cursor-pointer shadow hover:bg-health-teal transition">
                  <Upload className="h-4 w-4 text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl md:text-2xl font-bold text-health-teal mb-1 truncate">
                {profile.hospitalName || 'Hospital Name'}
              </CardTitle>
              <div className="flex items-center gap-2 text-health-blue-gray text-sm md:text-base truncate">
                <MailCheck className="h-4 w-4" />
                <span className="truncate">{profile.email}</span>
                {profile.isEmailVerified && (
                  <ShieldCheck className="h-4 w-4 text-health-success ml-2" />
                )}
              </div>
              {profile.hospitalType && (
                <Badge variant="secondary" className="mt-1">
                  {profile.hospitalType}
                </Badge>
              )}
            </div>
            <div className="flex flex-col gap-2 ml-auto">
              {!editMode ? (
                <Button variant="outline" onClick={handleEdit} className="px-3 py-1 text-sm">
                  <Edit2 className="h-4 w-4 mr-1" /> Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleSave} className="px-3 py-1 text-sm" disabled={loading}>
                    <Save className="h-4 w-4 mr-1" /> {loading ? 'Saving...' : 'Save'}
                  </Button>
                  <Button variant="destructive" onClick={handleCancel} className="px-3 py-1 text-sm">
                    <X className="h-4 w-4 mr-1" /> Cancel
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div>
              <label className="block text-health-blue-gray font-medium mb-1">Hospital Name</label>
              <Input 
                name="hospitalName" 
                value={profile.hospitalName} 
                onChange={handleChange} 
                disabled={!editMode}
                placeholder="Enter hospital name"
              />
            </div>
            <div>
              <label className="block text-health-blue-gray font-medium mb-1">Hospital Type</label>
              {editMode ? (
                <Select value={profile.hospitalType} onValueChange={(value) => handleSelectChange('hospitalType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select hospital type" />
                  </SelectTrigger>
                  <SelectContent>
                    {hospitalTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input value={profile.hospitalType} disabled />
              )}
            </div>
            <div>
              <label className="block text-health-blue-gray font-medium mb-1">License Number</label>
              <Input 
                name="licenseNumber" 
                value={profile.licenseNumber} 
                onChange={handleChange} 
                disabled={!editMode}
                placeholder="Enter license number"
              />
            </div>
                         <div>
               <label className="block text-health-blue-gray font-medium mb-1">
                 Registration Number <span className="text-sm text-gray-500">(Optional)</span>
               </label>
               <Input 
                 name="registrationNumber" 
                 value={profile.registrationNumber} 
                 onChange={handleChange} 
                 disabled={!editMode}
                 placeholder="Enter registration number"
               />
             </div>
                         <div>
               <label className="block text-health-blue-gray font-medium mb-1">
                 Establishment Date <span className="text-sm text-gray-500">(Optional)</span>
               </label>
               <Input 
                 type="date" 
                 name="establishmentDate" 
                 value={profile.establishmentDate} 
                 onChange={handleChange} 
                 disabled={!editMode}
               />
             </div>
            <div>
              <label className="block text-health-blue-gray font-medium mb-1">Email Address</label>
              <Input 
                name="email" 
                value={profile.email} 
                onChange={handleChange} 
                disabled={!editMode}
                placeholder="Enter email address"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-health-blue-gray font-medium mb-1">Description</label>
              <Textarea 
                name="description" 
                value={profile.description} 
                onChange={handleChange} 
                disabled={!editMode}
                placeholder="Describe your hospital"
                rows={3}
              />
            </div>
                         <div className="md:col-span-2">
               <label className="block text-health-blue-gray font-medium mb-1">
                 Mission Statement <span className="text-sm text-gray-500">(Optional)</span>
               </label>
               <Textarea 
                 name="mission" 
                 value={profile.mission} 
                 onChange={handleChange} 
                 disabled={!editMode}
                 placeholder="Enter mission statement"
                 rows={2}
               />
             </div>
                         <div className="md:col-span-2">
               <label className="block text-health-blue-gray font-medium mb-1">
                 Vision Statement <span className="text-sm text-gray-500">(Optional)</span>
               </label>
               <Textarea 
                 name="vision" 
                 value={profile.vision} 
                 onChange={handleChange} 
                 disabled={!editMode}
                 placeholder="Enter vision statement"
                 rows={2}
               />
             </div>
          </CardContent>
        </Card>
      )}

      {/* Contact Tab */}
      {activeTab === 'contact' && (
        <Card className="shadow-lg mb-8 w-full min-h-[260px] rounded-xl border-0">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-health-teal flex items-center gap-2">
              <Phone className="w-5 h-5" /> Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div>
              <label className="block text-health-blue-gray font-medium mb-1">Phone Number</label>
              <Input 
                name="phone" 
                value={profile.phone} 
                onChange={handleChange} 
                disabled={!editMode}
                placeholder="Enter phone number"
              />
            </div>
                         <div>
               <label className="block text-health-blue-gray font-medium mb-1">
                 Website <span className="text-sm text-gray-500">(Optional)</span>
               </label>
               <Input 
                 name="website" 
                 value={profile.website} 
                 onChange={handleChange} 
                 disabled={!editMode}
                 placeholder="Enter website URL"
               />
             </div>
            <div>
              <label className="block text-health-blue-gray font-medium mb-1">Emergency Contact</label>
              <Input 
                name="emergencyContact" 
                value={profile.emergencyContact} 
                onChange={handleChange} 
                disabled={!editMode}
                placeholder="Enter emergency contact"
              />
            </div>
                         <div>
               <label className="block text-health-blue-gray font-medium mb-1">
                 Emergency Phone <span className="text-sm text-gray-500">(Optional)</span>
               </label>
               <Input 
                 name="emergencyPhone" 
                 value={profile.emergencyPhone} 
                 onChange={handleChange} 
                 disabled={!editMode}
                 placeholder="Enter emergency phone"
               />
             </div>
                         <div>
               <label className="block text-health-blue-gray font-medium mb-1">
                 Ambulance Phone <span className="text-sm text-gray-500">(Optional)</span>
               </label>
               <Input 
                 name="ambulancePhone" 
                 value={profile.ambulancePhone} 
                 onChange={handleChange} 
                 disabled={!editMode}
                 placeholder="Enter ambulance phone"
               />
             </div>
            <div>
              <label className="block text-health-blue-gray font-medium mb-1">Street Address</label>
              <Input 
                name="address.street" 
                value={profile.address.street} 
                onChange={handleChange} 
                disabled={!editMode}
                placeholder="Enter street address"
              />
            </div>
            <div>
              <label className="block text-health-blue-gray font-medium mb-1">City</label>
              <Input 
                name="address.city" 
                value={profile.address.city} 
                onChange={handleChange} 
                disabled={!editMode}
                placeholder="Enter city"
              />
            </div>
            <div>
              <label className="block text-health-blue-gray font-medium mb-1">State</label>
              <Input 
                name="address.state" 
                value={profile.address.state} 
                onChange={handleChange} 
                disabled={!editMode}
                placeholder="Enter state"
              />
            </div>
            <div>
              <label className="block text-health-blue-gray font-medium mb-1">Zip Code</label>
              <Input 
                name="address.zipCode" 
                value={profile.address.zipCode} 
                onChange={handleChange} 
                disabled={!editMode}
                placeholder="Enter zip code"
              />
            </div>
            <div>
              <label className="block text-health-blue-gray font-medium mb-1">Country</label>
              <Input 
                name="address.country" 
                value={profile.address.country} 
                onChange={handleChange} 
                disabled={!editMode}
                placeholder="Enter country"
              />
            </div>
          </CardContent>
        </Card>
      )}

             {/* Services Tab */}
       {activeTab === 'services' && (
         <Card className="shadow-lg mb-8 w-full min-h-[220px] rounded-xl border-0">
           <CardHeader>
             <CardTitle className="text-xl font-semibold text-health-teal flex items-center gap-2">
               <Stethoscope className="w-5 h-5" /> Hospital Services & Capacity
             </CardTitle>
           </CardHeader>
           <CardContent className="space-y-6">
             {/* Basic Capacity */}
             <div>
               <h3 className="text-lg font-medium text-health-blue-gray mb-3">Basic Capacity</h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div>
                   <label className="block text-health-blue-gray font-medium mb-1">Total Beds</label>
                   <Input 
                     type="number" 
                     name="totalBeds" 
                     value={profile.totalBeds} 
                     onChange={handleNumberChange} 
                     disabled={!editMode}
                     placeholder="Enter total beds"
                   />
                 </div>
                 <div>
                   <label className="block text-health-blue-gray font-medium mb-1">Number of Departments</label>
                   <Input 
                     type="number" 
                     name="departments" 
                     value={profile.departments} 
                     onChange={handleNumberChange} 
                     disabled={!editMode}
                     placeholder="Enter number of departments"
                   />
                 </div>
                 <div>
                   <label className="block text-health-blue-gray font-medium mb-1">
                     Staff Count <span className="text-sm text-gray-500">(Optional)</span>
                   </label>
                   <Input 
                     type="number" 
                     name="staffCount" 
                     value={profile.staffCount} 
                     onChange={handleNumberChange} 
                     disabled={!editMode}
                     placeholder="Enter staff count"
                   />
                 </div>
               </div>
             </div>

             {/* Medical Specialties */}
             <div>
               <h3 className="text-lg font-medium text-health-blue-gray mb-3">Medical Specialties</h3>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                 {['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Gynecology', 'Oncology', 'Dermatology', 'Psychiatry', 'Emergency Medicine', 'General Surgery', 'Internal Medicine', 'Radiology'].map((specialty) => (
                   <div key={specialty} className="flex items-center space-x-2">
                     <input 
                       type="checkbox" 
                       id={`specialty-${specialty}`}
                       checked={profile.specialties.includes(specialty)} 
                       disabled={!editMode}
                       onChange={(e) => {
                         if (e.target.checked) {
                           setProfile(prev => ({
                             ...prev,
                             specialties: [...prev.specialties, specialty]
                           }));
                         } else {
                           setProfile(prev => ({
                             ...prev,
                             specialties: prev.specialties.filter(s => s !== specialty)
                           }));
                         }
                       }}
                     />
                     <label htmlFor={`specialty-${specialty}`} className="text-sm text-health-blue-gray">{specialty}</label>
                   </div>
                 ))}
               </div>
             </div>

             {/* Technology & Equipment */}
             <div>
               <h3 className="text-lg font-medium text-health-blue-gray mb-3">Technology & Equipment</h3>
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
                     <input 
                       type="checkbox" 
                       id={`tech-${tech.key}`}
                       checked={profile.technology[tech.key as keyof typeof profile.technology]} 
                       disabled={!editMode}
                       onChange={(e) => {
                         setProfile(prev => ({
                           ...prev,
                           technology: {
                             ...prev.technology,
                             [tech.key]: e.target.checked
                           }
                         }));
                       }}
                     />
                     <label htmlFor={`tech-${tech.key}`} className="text-sm text-health-blue-gray">{tech.label}</label>
                   </div>
                 ))}
               </div>
             </div>

             {/* Emergency Services */}
             <div>
               <h3 className="text-lg font-medium text-health-blue-gray mb-3">Emergency Services</h3>
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
                     <input 
                       type="checkbox" 
                       id={`emergency-${service.key}`}
                       checked={profile.emergencyServices[service.key as keyof typeof profile.emergencyServices]} 
                       disabled={!editMode}
                       onChange={(e) => {
                         setProfile(prev => ({
                           ...prev,
                           emergencyServices: {
                             ...prev.emergencyServices,
                             [service.key]: e.target.checked
                           }
                         }));
                       }}
                     />
                     <label htmlFor={`emergency-${service.key}`} className="text-sm text-health-blue-gray">{service.label}</label>
                   </div>
                 ))}
               </div>
             </div>

             {/* Insurance Accepted */}
             <div>
               <label className="block text-health-blue-gray font-medium mb-1">
                 Insurance Accepted <span className="text-sm text-gray-500">(Optional)</span>
               </label>
               <div className="flex flex-wrap gap-2">
                 {profile.insuranceAccepted && profile.insuranceAccepted.length > 0 ? (
                   profile.insuranceAccepted.map((insurance, index) => (
                     <Badge key={index} variant="secondary">
                       {insurance}
                     </Badge>
                   ))
                 ) : (
                   <span className="text-sm text-health-blue-gray">No insurance providers listed (optional)</span>
                 )}
               </div>
             </div>
           </CardContent>
         </Card>
       )}

       {/* Professional Tab */}
       {activeTab === 'professional' && (
         <Card className="shadow-lg mb-8 w-full min-h-[220px] rounded-xl border-0">
           <CardHeader>
             <CardTitle className="text-xl font-semibold text-health-teal flex items-center gap-2">
               <Shield className="w-5 h-5" /> Professional Information
             </CardTitle>
           </CardHeader>
           <CardContent className="space-y-6">
             {/* Operating Hours */}
             <div>
               <h3 className="text-lg font-medium text-health-blue-gray mb-3">Operating Hours</h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div>
                   <label className="block text-health-blue-gray font-medium mb-1">Start Time</label>
                   <Input 
                     type="time" 
                     name="operatingHours.startTime" 
                     value={profile.operatingHours.startTime} 
                     onChange={handleChange} 
                     disabled={!editMode}
                   />
                 </div>
                 <div>
                   <label className="block text-health-blue-gray font-medium mb-1">End Time</label>
                   <Input 
                     type="time" 
                     name="operatingHours.endTime" 
                     value={profile.operatingHours.endTime} 
                     onChange={handleChange} 
                     disabled={!editMode}
                   />
                 </div>
                 <div className="flex items-center space-x-2">
                   <input 
                     type="checkbox" 
                     id="emergency24x7"
                     checked={profile.operatingHours.emergency24x7} 
                     disabled={!editMode}
                     onChange={(e) => {
                       setProfile(prev => ({
                         ...prev,
                         operatingHours: {
                           ...prev.operatingHours,
                           emergency24x7: e.target.checked
                         }
                       }));
                     }}
                   />
                   <label htmlFor="emergency24x7" className="text-sm text-health-blue-gray">24/7 Emergency Service</label>
                 </div>
               </div>
             </div>

             {/* Working Days */}
             <div>
               <h3 className="text-lg font-medium text-health-blue-gray mb-3">Working Days</h3>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                 {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                   <div key={day} className="flex items-center space-x-2">
                     <input 
                       type="checkbox" 
                       id={day}
                       checked={profile.workingDays.includes(day)} 
                       disabled={!editMode}
                       onChange={(e) => {
                         if (e.target.checked) {
                           setProfile(prev => ({
                             ...prev,
                             workingDays: [...prev.workingDays, day]
                           }));
                         } else {
                           setProfile(prev => ({
                             ...prev,
                             workingDays: prev.workingDays.filter(d => d !== day)
                           }));
                         }
                       }}
                     />
                     <label htmlFor={day} className="text-sm text-health-blue-gray capitalize">{day}</label>
                   </div>
                 ))}
               </div>
             </div>

             {/* Medical Staff Breakdown */}
             <div>
               <h3 className="text-lg font-medium text-health-blue-gray mb-3">Medical Staff Breakdown</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                 <div>
                   <label className="block text-health-blue-gray font-medium mb-1">Doctors</label>
                   <Input 
                     type="number" 
                     name="medicalStaff.doctors" 
                     value={profile.medicalStaff.doctors} 
                     onChange={handleChange} 
                     disabled={!editMode}
                     placeholder="0"
                   />
                 </div>
                 <div>
                   <label className="block text-health-blue-gray font-medium mb-1">Nurses</label>
                   <Input 
                     type="number" 
                     name="medicalStaff.nurses" 
                     value={profile.medicalStaff.nurses} 
                     onChange={handleChange} 
                     disabled={!editMode}
                     placeholder="0"
                   />
                 </div>
                 <div>
                   <label className="block text-health-blue-gray font-medium mb-1">Specialists</label>
                   <Input 
                     type="number" 
                     name="medicalStaff.specialists" 
                     value={profile.medicalStaff.specialists} 
                     onChange={handleChange} 
                     disabled={!editMode}
                     placeholder="0"
                   />
                 </div>
                 <div>
                   <label className="block text-health-blue-gray font-medium mb-1">Technicians</label>
                   <Input 
                     type="number" 
                     name="medicalStaff.technicians" 
                     value={profile.medicalStaff.technicians} 
                     onChange={handleChange} 
                     disabled={!editMode}
                     placeholder="0"
                   />
                 </div>
                 <div>
                   <label className="block text-health-blue-gray font-medium mb-1">Support Staff</label>
                   <Input 
                     type="number" 
                     name="medicalStaff.supportStaff" 
                     value={profile.medicalStaff.supportStaff} 
                     onChange={handleChange} 
                     disabled={!editMode}
                     placeholder="0"
                   />
                 </div>
               </div>
             </div>

             {/* Payment Methods */}
             <div>
               <h3 className="text-lg font-medium text-health-blue-gray mb-3">Payment Methods</h3>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                 {['Cash', 'Credit Card', 'Debit Card', 'Insurance', 'Online Payment', 'Bank Transfer', 'Cheque', 'EMI'].map((method) => (
                   <div key={method} className="flex items-center space-x-2">
                     <input 
                       type="checkbox" 
                       id={`payment-${method}`}
                       checked={profile.paymentMethods.includes(method)} 
                       disabled={!editMode}
                       onChange={(e) => {
                         if (e.target.checked) {
                           setProfile(prev => ({
                             ...prev,
                             paymentMethods: [...prev.paymentMethods, method]
                           }));
                         } else {
                           setProfile(prev => ({
                             ...prev,
                             paymentMethods: prev.paymentMethods.filter(m => m !== method)
                           }));
                         }
                       }}
                     />
                     <label htmlFor={`payment-${method}`} className="text-sm text-health-blue-gray">{method}</label>
                   </div>
                 ))}
               </div>
             </div>
           </CardContent>
         </Card>
       )}

       {/* Ambulance Tab */}
       {activeTab === 'ambulance' && (
         <Card className="shadow-lg mb-8 w-full min-h-[220px] rounded-xl border-0">
           <CardHeader>
             <CardTitle className="text-xl font-semibold text-health-teal flex items-center gap-2">
               <Ambulance className="w-5 h-5" /> Ambulance Services
             </CardTitle>
           </CardHeader>
           <CardContent className="space-y-6">
             {/* Ambulance Availability */}
             <div>
               <div className="flex items-center space-x-2 mb-4">
                 <input 
                   type="checkbox" 
                   id="ambulanceAvailable"
                   checked={profile.ambulanceServices.available} 
                   disabled={!editMode}
                   onChange={(e) => {
                     setProfile(prev => ({
                       ...prev,
                       ambulanceServices: {
                         ...prev.ambulanceServices,
                         available: e.target.checked
                       }
                     }));
                   }}
                 />
                 <label htmlFor="ambulanceAvailable" className="text-lg font-medium text-health-blue-gray">Ambulance Service Available</label>
               </div>
             </div>

             {profile.ambulanceServices.available && (
               <>
                 {/* Fleet Size */}
                 <div>
                   <label className="block text-health-blue-gray font-medium mb-1">Fleet Size</label>
                   <Input 
                     type="number" 
                     name="ambulanceServices.fleetSize" 
                     value={profile.ambulanceServices.fleetSize} 
                     onChange={handleChange} 
                     disabled={!editMode}
                     placeholder="Number of ambulances"
                   />
                 </div>

                 {/* Response Time */}
                 <div>
                   <label className="block text-health-blue-gray font-medium mb-1">Average Response Time</label>
                   <Input 
                     name="ambulanceServices.responseTime" 
                     value={profile.ambulanceServices.responseTime} 
                     onChange={handleChange} 
                     disabled={!editMode}
                     placeholder="e.g., 15 minutes"
                   />
                 </div>

                 {/* Coverage Area */}
                 <div>
                   <label className="block text-health-blue-gray font-medium mb-1">Coverage Area</label>
                   <Textarea 
                     name="ambulanceServices.coverageArea" 
                     value={profile.ambulanceServices.coverageArea} 
                     onChange={handleChange} 
                     disabled={!editMode}
                     placeholder="Describe coverage area"
                     rows={2}
                   />
                 </div>

                 {/* Special Equipment */}
                 <div>
                   <label className="block text-health-blue-gray font-medium mb-1">Special Equipment</label>
                   <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                     {['Ventilator', 'Defibrillator', 'ECG Machine', 'Oxygen Supply', 'Stretcher', 'First Aid Kit', 'Neonatal Incubator', 'Cardiac Monitor'].map((equipment) => (
                       <div key={equipment} className="flex items-center space-x-2">
                         <input 
                           type="checkbox" 
                           id={`equipment-${equipment}`}
                           checked={profile.ambulanceServices.specialEquipment.includes(equipment)} 
                           disabled={!editMode}
                           onChange={(e) => {
                             if (e.target.checked) {
                               setProfile(prev => ({
                                 ...prev,
                                 ambulanceServices: {
                                   ...prev.ambulanceServices,
                                   specialEquipment: [...prev.ambulanceServices.specialEquipment, equipment]
                                 }
                               }));
                             } else {
                               setProfile(prev => ({
                                 ...prev,
                                 ambulanceServices: {
                                   ...prev.ambulanceServices,
                                   specialEquipment: prev.ambulanceServices.specialEquipment.filter(eq => eq !== equipment)
                                 }
                               }));
                             }
                           }}
                         />
                         <label htmlFor={`equipment-${equipment}`} className="text-sm text-health-blue-gray">{equipment}</label>
                       </div>
                     ))}
                   </div>
                 </div>
               </>
             )}
           </CardContent>
         </Card>
       )}

       {/* Documents Tab */}
      {activeTab === 'documents' && (
        <Card className="shadow-lg mb-8 w-full min-h-[220px] rounded-xl border-0">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-health-teal flex items-center gap-2">
              <FileText className="w-5 h-5" /> Hospital Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.documents && profile.documents.length > 0 ? (
              profile.documents.map((doc, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{doc.title}</span>
                      {doc.required && <Badge variant="destructive">Required</Badge>}
                    </div>
                    {doc.fileName ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-health-success" />
                        <span className="text-sm text-health-success">Uploaded</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-health-danger" />
                        <span className="text-sm text-health-danger">Not Uploaded</span>
                      </div>
                    )}
                  </div>
                  {doc.fileName && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm text-health-blue-gray">{doc.fileName}</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-health-blue-gray mx-auto mb-4" />
                <p className="text-health-blue-gray">No documents uploaded</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {error && <div className="text-center text-health-danger font-semibold mb-4">{error}</div>}
      {success && <div className="text-center text-health-success font-semibold mb-4">{success}</div>}
    </div>
  );
};

export default HospitalMyProfile; 