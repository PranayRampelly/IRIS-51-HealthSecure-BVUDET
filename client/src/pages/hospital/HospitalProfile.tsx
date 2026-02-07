import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building, 
  Phone, 
  Mail, 
  MapPin, 
  Globe, 
  Calendar, 
  Users, 
  Bed, 
  Shield, 
  FileText, 
  Upload, 
  Edit, 
  Save, 
  X,
  CheckCircle,
  AlertCircle,
  Download,
  Eye
} from 'lucide-react';
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
    fileUrl?: string;
    fileName?: string;
    required: boolean;
  }>;
  profileCompleted: boolean;
  profileCompletedAt?: string;
}

const HospitalProfile: React.FC = () => {
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<HospitalProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

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
        setProfileData(data.data);
      } else {
        toast({
          title: 'Error loading profile',
          description: 'Failed to load hospital profile.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: 'Error loading profile',
        description: 'Failed to load hospital profile.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (!profileData) return;
    setProfileData(prev => ({
      ...prev!,
      [field]: value
    }));
  };

  const handleNestedChange = (parent: string, field: string, value: string) => {
    if (!profileData) return;
    setProfileData(prev => ({
      ...prev!,
      [parent]: {
        ...(prev![parent as keyof HospitalProfileData] as Record<string, any>),
        [field]: value
      }
    }));
  };

  const handleArrayChange = (field: string, value: string, action: 'add' | 'remove') => {
    if (!profileData) return;
    setProfileData(prev => ({
      ...prev!,
      [field]: action === 'add' 
        ? [...(prev![field as keyof HospitalProfileData] as string[]), value]
        : (prev![field as keyof HospitalProfileData] as string[]).filter(item => item !== value)
    }));
  };

  const saveProfile = async () => {
    if (!profileData) return;
    
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
          title: 'Profile updated successfully',
          description: 'Your hospital profile has been updated.'
        });
        setEditing(false);
        await loadProfile(); // Reload to get updated data
      } else {
        const errorData = await response.text();
        toast({
          title: 'Update failed',
          description: `Failed to update profile. ${errorData}`,
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update failed',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const getCompletionPercentage = () => {
    if (!profileData) return 0;
    
    const requiredFields = [
      profileData.hospitalName,
      profileData.hospitalType,
      profileData.licenseNumber,
      profileData.phone,
      profileData.emergencyContact,
      profileData.address?.street,
      profileData.address?.city,
      profileData.address?.state,
      profileData.description,
      profileData.totalBeds,
      profileData.departments
    ];
    
    const completedFields = requiredFields.filter(field => field && field !== '' && field !== 0).length;
    return Math.round((completedFields / requiredFields.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load hospital profile. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const completionPercentage = getCompletionPercentage();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Building className="h-8 w-8 text-blue-500" />
              {profileData.hospitalName || 'Hospital Profile'}
            </h1>
            <p className="text-gray-600 mt-2">Manage your hospital information and settings</p>
          </div>
          <div className="flex gap-2">
            {editing ? (
              <>
                <Button variant="outline" onClick={() => setEditing(false)} disabled={saving}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={saveProfile} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            ) : (
              <Button onClick={() => setEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Profile Completion Status */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Profile Completion</span>
            <span className="text-sm text-gray-600">{completionPercentage}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          {completionPercentage < 100 && (
            <p className="text-sm text-orange-600 mt-2">
              Complete your profile to access all features
            </p>
          )}
        </div>
      </div>

      {/* Profile Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-blue-500" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Hospital Name</Label>
                  <p className="text-sm">{profileData.hospitalName || 'Not set'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Hospital Type</Label>
                  <p className="text-sm">{profileData.hospitalType || 'Not set'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">License Number</Label>
                  <p className="text-sm">{profileData.licenseNumber || 'Not set'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Registration Number</Label>
                  <p className="text-sm">{profileData.registrationNumber || 'Not set'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-green-500" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Phone</Label>
                  <p className="text-sm">{profileData.phone || 'Not set'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Email</Label>
                  <p className="text-sm">{profileData.email || 'Not set'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Website</Label>
                  <p className="text-sm">{profileData.website || 'Not set'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Emergency Contact</Label>
                  <p className="text-sm">{profileData.emergencyContact || 'Not set'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-red-500" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Address</Label>
                  <p className="text-sm">
                    {profileData.address?.street ? (
                      <>
                        {profileData.address.street}<br />
                        {profileData.address.city}, {profileData.address.state} {profileData.address.zipCode}<br />
                        {profileData.address.country}
                      </>
                    ) : 'Not set'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Capacity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bed className="h-5 w-5 text-purple-500" />
                  Capacity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Total Beds</Label>
                  <p className="text-sm">{profileData.totalBeds || 'Not set'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Departments</Label>
                  <p className="text-sm">{profileData.departments || 'Not set'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Staff Count</Label>
                  <p className="text-sm">{profileData.staffCount || 'Not set'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Insurance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-orange-500" />
                  Insurance Accepted
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profileData.insuranceAccepted && profileData.insuranceAccepted.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {profileData.insuranceAccepted.map((insurance) => (
                      <Badge key={insurance} variant="secondary">
                        {insurance}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No insurance providers listed</p>
                )}
              </CardContent>
            </Card>

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-500" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {profileData.documents && profileData.documents.length > 0 ? (
                    profileData.documents.map((doc) => (
                      <div key={doc.type} className="flex items-center justify-between">
                        <span className="text-sm">{doc.title}</span>
                        {doc.fileName ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No documents uploaded</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Information</CardTitle>
              <CardDescription>Complete hospital details and description</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {editing ? (
                <>
                  <div>
                    <Label htmlFor="description">Hospital Description</Label>
                    <Textarea
                      id="description"
                      value={profileData.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe your hospital"
                      rows={4}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="mission">Mission Statement</Label>
                    <Textarea
                      id="mission"
                      value={profileData.mission || ''}
                      onChange={(e) => handleInputChange('mission', e.target.value)}
                      placeholder="Enter mission statement"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="vision">Vision Statement</Label>
                    <Textarea
                      id="vision"
                      value={profileData.vision || ''}
                      onChange={(e) => handleInputChange('vision', e.target.value)}
                      placeholder="Enter vision statement"
                      rows={3}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Description</Label>
                    <p className="text-sm mt-1">{profileData.description || 'No description provided'}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Mission</Label>
                    <p className="text-sm mt-1">{profileData.mission || 'No mission statement provided'}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Vision</Label>
                    <p className="text-sm mt-1">{profileData.vision || 'No vision statement provided'}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hospital Documents</CardTitle>
              <CardDescription>Manage required and optional documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profileData.documents && profileData.documents.map((doc) => (
                  <div key={doc.type} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Label className="font-medium">{doc.title}</Label>
                        {doc.required && <Badge variant="destructive">Required</Badge>}
                      </div>
                      {doc.fileName && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-600">Uploaded</span>
                        </div>
                      )}
                    </div>
                    
                    {doc.fileName && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm text-gray-600">{doc.fileName}</span>
                        {doc.fileUrl && (
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {!doc.fileName && (
                      <p className="text-sm text-gray-500">No document uploaded</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Manage your profile settings and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-medium text-gray-600">Profile Completion Status</Label>
                <div className="flex items-center gap-2 mt-1">
                  {profileData.profileCompleted ? (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Complete
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Incomplete
                    </Badge>
                  )}
                </div>
              </div>
              
              {profileData.profileCompletedAt && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Completed On</Label>
                  <p className="text-sm mt-1">
                    {new Date(profileData.profileCompletedAt).toLocaleDateString()}
                  </p>
                </div>
              )}
              
              <div>
                <Label className="text-sm font-medium text-gray-600">Last Updated</Label>
                <p className="text-sm mt-1">
                  {profileData.profileCompletedAt 
                    ? new Date(profileData.profileCompletedAt).toLocaleString()
                    : 'Never updated'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HospitalProfile; 