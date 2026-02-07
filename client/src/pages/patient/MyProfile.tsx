import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ShieldCheck, MailCheck, Lock, Edit2, Save, X, Upload, Phone, User as UserIcon, Home, HeartPulse } from 'lucide-react';
import apiService from '@/services/api';
import { getProfileImageUrl } from '@/lib/utils';

const initialProfile = {
  firstName: 'Siddhesh',
  lastName: 'Harwande',
  email: 'siddheshharwande8@gmail.com',
  phone: '+91 9876543210',
  dateOfBirth: '1990-01-01',
  gender: 'Male',
  maritalStatus: 'Single',
  address: {
    street: '123 Main St',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    zipCode: '400001',
  },
  emergencyContacts: [
    { name: 'Jane Doe', relationship: 'Spouse', phone: '+91 9876543211', email: 'jane@example.com', isPrimary: true },
    { name: 'John Smith', relationship: 'Friend', phone: '+91 9876543212', email: 'john@example.com', isPrimary: false },
  ],
  bloodType: 'A+',
  height: 175,
  weight: 70,
  allergies: 'Penicillin',
  currentMedications: 'Metformin',
  medicalConditions: 'Diabetes',
  surgeries: 'Appendectomy',
  insurance: {
    provider: 'HealthCare Inc.',
    policyNumber: 'HC123456',
    groupNumber: 'GRP7890',
    primaryHolder: 'Siddhesh Harwande',
  },
  preferences: {
    preferredLanguage: 'English',
    preferredContactMethod: 'Email',
    allowResearchParticipation: true,
    allowMarketingEmails: false,
    emergencyNotifications: true,
  },
  isEmailVerified: true,
  isActive: true,
  lastLogin: '2024-07-13T10:00:00Z',
  createdAt: '2023-01-01T10:00:00Z',
  updatedAt: '2024-07-13T10:00:00Z',
  profileImage: '',
};

const tabs = [
  { key: 'profile', label: 'Profile', icon: UserIcon },
  { key: 'contact', label: 'Contact', icon: Home },
  { key: 'medical', label: 'Medical', icon: HeartPulse },
];

const MyProfile = () => {
  const [profile, setProfile] = useState(initialProfile);
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
    setLoading(true);
    apiService.getCurrentUser()
      .then((data) => {
        // Format the dateOfBirth for the date input and ensure all required fields exist
        const formattedData = {
          ...initialProfile, // Start with default values
          ...data, // Override with actual data
          dateOfBirth: formatDateForInput(data.dateOfBirth),
          // Ensure nested objects exist with defaults
          address: {
            ...initialProfile.address,
            ...(data.address || {})
          },
          insurance: {
            ...initialProfile.insurance,
            ...(data.insurance || {})
          },
          preferences: {
            ...initialProfile.preferences,
            ...(data.preferences || {})
          },
          emergencyContacts: data.emergencyContacts || initialProfile.emergencyContacts
        };
        setProfile(formattedData);
        setImage(data.profileImage || '');
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load profile.');
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      setProfile((prev) => ({
        ...prev,
        address: { ...prev.address, [name.split('.')[1]]: value },
      }));
    } else if (name.startsWith('emergencyContacts.')) {
      const [listName, idx, subName] = name.split('.');
      const index = parseInt(idx, 10);
      setProfile((prev) => ({
        ...prev,
        [listName]: prev[listName].map((item, i) =>
          i === index ? { ...item, [subName]: value } : item
        ),
      }));
    } else if (name.startsWith('insurance.')) {
      setProfile((prev) => ({
        ...prev,
        insurance: { ...prev.insurance, [name.split('.')[1]]: value },
      }));
    } else if (name.startsWith('preferences.')) {
      setProfile((prev) => ({
        ...prev,
        preferences: { ...prev.preferences, [name.split('.')[1]]: value },
      }));
    } else {
      setProfile((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImage(URL.createObjectURL(file));
    }
  };

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => {
    setEditMode(false);
    setLoading(true);
    apiService.getCurrentUser()
      .then((data) => {
        setProfile(data);
        setImage(data.profileImage || '');
        setLoading(false);
      })
      .catch(() => setLoading(false));
    setImageFile(null);
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // TODO: handle image upload if needed
      const updated = await apiService.updateProfile(profile);
      setProfile(updated);
      setEditMode(false);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-health-teal font-semibold text-lg">Loading profile...</div>;
  if (error) return <div className="text-center py-12 text-red-600 font-semibold text-lg">{error}</div>;

  return (
    <div className="w-full min-h-[calc(100vh-80px)] px-2 md:px-6 py-8 bg-health-light-gray max-w-5xl mx-auto">
      {/* Tabs */}
      <div className="flex justify-between items-center mb-6 bg-white rounded-xl shadow p-1 w-full max-w-4xl mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`flex-1 flex flex-col items-center py-2 px-1 rounded-lg transition font-semibold text-base md:text-lg focus:outline-none ${
              activeTab === tab.key
                ? 'bg-health-teal text-white shadow'
                : 'text-health-blue-gray hover:bg-health-teal/10'
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            <tab.icon className="w-5 h-5 mb-1" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <Card className="shadow-lg mb-8 w-full min-h-[340px] rounded-xl border-0">
          <CardHeader className="flex flex-row items-center gap-6 pb-2">
            <div className="relative group">
              <Avatar className="h-20 w-20 border-2 border-health-teal shadow-sm">
                <AvatarImage src={getProfileImageUrl(profile.profileImage)} />
                <AvatarFallback className="bg-health-teal text-white text-2xl">
                  {profile.firstName[0]}
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
                {profile.firstName} {profile.lastName}
              </CardTitle>
              <div className="flex items-center gap-2 text-health-blue-gray text-sm md:text-base truncate">
                <MailCheck className="h-4 w-4" />
                <span className="truncate">{profile.email}</span>
                {profile.isEmailVerified && (
                  <ShieldCheck className="h-4 w-4 text-health-success ml-2" />
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2 ml-auto">
              {!editMode ? (
                <Button variant="outline" onClick={handleEdit} className="px-3 py-1 text-sm">
                  <Edit2 className="h-4 w-4 mr-1" /> Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleSave} className="px-3 py-1 text-sm">
                    <Save className="h-4 w-4 mr-1" /> Save
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
              <label className="block text-health-blue-gray font-medium mb-1">First Name</label>
              <Input name="firstName" value={profile.firstName} onChange={handleChange} disabled={!editMode} />
            </div>
            <div>
              <label className="block text-health-blue-gray font-medium mb-1">Last Name</label>
              <Input name="lastName" value={profile.lastName} onChange={handleChange} disabled={!editMode} />
            </div>
            <div>
              <label className="block text-health-blue-gray font-medium mb-1">Email Address</label>
              <Input name="email" value={profile.email} onChange={handleChange} disabled={!editMode} />
            </div>
            <div>
              <label className="block text-health-blue-gray font-medium mb-1">Date of Birth</label>
              <Input type="date" name="dateOfBirth" value={profile.dateOfBirth} onChange={handleChange} disabled={!editMode} />
            </div>
            <div>
              <label className="block text-health-blue-gray font-medium mb-1">Gender</label>
              <Input name="gender" value={profile.gender} onChange={handleChange} disabled={!editMode} />
            </div>
            <div>
              <label className="block text-health-blue-gray font-medium mb-1">Marital Status</label>
              <Input name="maritalStatus" value={profile.maritalStatus} onChange={handleChange} disabled={!editMode} />
            </div>
          </CardContent>
        </Card>
      )}
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
              <Input name="phone" value={profile.phone} onChange={handleChange} disabled={!editMode} />
            </div>
            <div>
              <label className="block text-health-blue-gray font-medium mb-1">Emergency Contacts</label>
              <div className="space-y-2">
                {profile.emergencyContacts.map((c, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row md:items-center gap-2 bg-health-light-gray/60 rounded p-2">
                    <span className="font-semibold text-health-teal">{c.name}</span>
                    <span className="text-xs text-health-blue-gray">{c.relationship}</span>
                    <span className="text-xs text-health-blue-gray">{c.phone}</span>
                    <span className="text-xs text-health-blue-gray">{c.email}</span>
                    {c.isPrimary && <span className="text-xs text-health-success font-bold ml-2">Primary</span>}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-health-blue-gray font-medium mb-1">Street</label>
              <Input name="address.street" value={profile.address?.street || ''} onChange={handleChange} disabled={!editMode} />
            </div>
            <div>
              <label className="block text-health-blue-gray font-medium mb-1">City</label>
              <Input name="address.city" value={profile.address?.city || ''} onChange={handleChange} disabled={!editMode} />
            </div>
            <div>
              <label className="block text-health-blue-gray font-medium mb-1">State</label>
              <Input name="address.state" value={profile.address?.state || ''} onChange={handleChange} disabled={!editMode} />
            </div>
            <div>
              <label className="block text-health-blue-gray font-medium mb-1">Country</label>
              <Input name="address.country" value={profile.address?.country || ''} onChange={handleChange} disabled={!editMode} />
            </div>
            <div>
              <label className="block text-health-blue-gray font-medium mb-1">Zip Code</label>
              <Input name="address.zipCode" value={profile.address?.zipCode || ''} onChange={handleChange} disabled={!editMode} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-health-blue-gray font-medium mb-1">Insurance</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Input name="insurance.provider" value={profile.insurance?.provider || ''} onChange={handleChange} disabled={!editMode} placeholder="Provider" />
                <Input name="insurance.policyNumber" value={profile.insurance?.policyNumber || ''} onChange={handleChange} disabled={!editMode} placeholder="Policy Number" />
                <Input name="insurance.groupNumber" value={profile.insurance?.groupNumber || ''} onChange={handleChange} disabled={!editMode} placeholder="Group Number" />
                <Input name="insurance.primaryHolder" value={profile.insurance?.primaryHolder || ''} onChange={handleChange} disabled={!editMode} placeholder="Primary Holder" />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-health-blue-gray font-medium mb-1">Preferences</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Input name="preferences.preferredLanguage" value={profile.preferences?.preferredLanguage || ''} onChange={handleChange} disabled={!editMode} placeholder="Preferred Language" />
                <Input name="preferences.preferredContactMethod" value={profile.preferences?.preferredContactMethod || ''} onChange={handleChange} disabled={!editMode} placeholder="Contact Method" />
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={profile.preferences?.allowResearchParticipation || false} disabled={!editMode} readOnly />
                  <span className="text-xs">Allow Research Participation</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={profile.preferences?.allowMarketingEmails || false} disabled={!editMode} readOnly />
                  <span className="text-xs">Allow Marketing Emails</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={profile.preferences?.emergencyNotifications || false} disabled={!editMode} readOnly />
                  <span className="text-xs">Emergency Notifications</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {activeTab === 'medical' && (
        <Card className="shadow-lg mb-8 w-full min-h-[220px] rounded-xl border-0">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-health-teal flex items-center gap-2">
              <HeartPulse className="w-5 h-5" /> Medical Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div>
              <label className="block text-health-blue-gray font-medium mb-1">Blood Type</label>
              <Input name="bloodType" value={profile.bloodType} onChange={handleChange} disabled={!editMode} />
            </div>
            <div>
              <label className="block text-health-blue-gray font-medium mb-1">Height (cm)</label>
              <Input name="height" value={profile.height} onChange={handleChange} disabled={!editMode} />
            </div>
            <div>
              <label className="block text-health-blue-gray font-medium mb-1">Weight (kg)</label>
              <Input name="weight" value={profile.weight} onChange={handleChange} disabled={!editMode} />
            </div>
            <div>
              <label className="block text-health-blue-gray font-medium mb-1">Allergies</label>
              <Input name="allergies" value={profile.allergies} onChange={handleChange} disabled={!editMode} />
            </div>
            <div>
              <label className="block text-health-blue-gray font-medium mb-1">Current Medications</label>
              <Input name="currentMedications" value={profile.currentMedications} onChange={handleChange} disabled={!editMode} />
            </div>
            <div>
              <label className="block text-health-blue-gray font-medium mb-1">Medical Conditions</label>
              <Input name="medicalConditions" value={profile.medicalConditions} onChange={handleChange} disabled={!editMode} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-health-blue-gray font-medium mb-1">Surgeries</label>
              <Input name="surgeries" value={profile.surgeries} onChange={handleChange} disabled={!editMode} />
            </div>
          </CardContent>
        </Card>
      )}

      {editMode && (
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" /> Save Changes
          </Button>
          <Button variant="destructive" onClick={handleCancel}>
            <X className="h-4 w-4 mr-2" /> Cancel
          </Button>
        </div>
      )}
      {success && <div className="text-center text-green-600 font-semibold mb-4">{success}</div>}
    </div>
  );
};

export default MyProfile; 