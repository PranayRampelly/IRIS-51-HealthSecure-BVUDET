import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ShieldCheck, 
  MailCheck, 
  Edit2, 
  Save, 
  X, 
  Upload, 
  Phone, 
  User as UserIcon, 
  MapPin, 
  Stethoscope,
  Clock,
  DollarSign,
  Languages,
  FileText,
  Award,
  Calendar,
  Star,
  Building,
  GraduationCap,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Sun,
  Coffee,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import apiService from '@/services/api';
import DoctorProfileCompletionDialog from '@/components/doctor/DoctorProfileCompletionDialog';
import { getProfileImageUrl } from '@/lib/utils';

interface DoctorProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  profileImage: string;
  isEmailVerified: boolean;
  
  // Professional Information
  licenseNumber: string;
  specialization: string;
  hospital: string;
  department: string;
  yearsOfExperience: string;
  bio: string;
  specialties: string[];
  
  // Location
  location: {
    city: string;
    state: string;
    pincode: string;
    address: string;
    lat?: number;
    lng?: number;
  };
  
  // Consultation Details
  languages: string[];
  consultationFees: {
    online: number;
    inPerson: number;
  };
  
  // Availability
  availability: {
    workingDays: string[];
    startTime: string;
    endTime: string;
    appointmentDuration: number;
    lunchBreakStart: string;
    lunchBreakEnd: string;
  };
  
  // Ratings
  ratings: {
    average: number;
    count: number;
  };
  
  // Emergency Availability
  emergencyAvailable: boolean;
  
  // Documents
  documents: Array<{
    type: string;
    title: string;
    fileUrl: string;
    fileName: string;
    uploadedAt: string;
    verified: boolean;
  }>;
  
  // Profile Completion
  profileComplete: boolean;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastLogin: string;
}

const tabs = [
  { key: 'overview', label: 'Overview', icon: UserIcon },
  { key: 'professional', label: 'Professional', icon: Stethoscope },
  { key: 'consultation', label: 'Consultation', icon: Clock },
  { key: 'documents', label: 'Documents', icon: FileText },
  { key: 'completion', label: 'Profile Completion', icon: CheckCircle },
];

const DoctorProfile = () => {
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [image, setImage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const [availabilityStatus, setAvailabilityStatus] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadProfile();
    fetchAvailability(); // Fetch availability from backend
  }, []);

  // Force refresh availability when profile changes
  useEffect(() => {
    if (profile) {
      fetchAvailability();
    }
  }, [profile?.availability?.startTime, profile?.availability?.endTime, profile?.availability?.appointmentDuration]);

  // Comprehensive sync function that updates both profile and availability
  const syncAllData = async () => {
    try {
      setLoading(true);
      
      // First, reload the main profile
      await loadProfile();
      
      // Then, fetch and sync availability
      await fetchAvailability();
      
      toast({
        title: "Full Sync Complete",
        description: "Profile and availability data synchronized",
      });
    } catch (error) {
      console.error('Error during full sync:', error);
      toast({
        title: "Sync Error",
        description: "Failed to sync all data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Test availability API endpoint
  const testAvailabilityAPI = async () => {
    try {
      console.log('🧪 Testing availability API endpoint...');
      
      // Test complete endpoint (this one works)
      const completeResponse = await apiService.get('/doctor-availability/me/complete');
      console.log('✅ GET /doctor-availability/me/complete response:', completeResponse.data);
      
      // Test the broken endpoint to see the error
      try {
        const getResponse = await apiService.get('/doctor-availability/me');
        console.log('✅ GET /doctor-availability/me response:', getResponse.data);
      } catch (error) {
        console.error('❌ GET /doctor-availability/me failed:', error.response?.data || error.message);
      }
      
      toast({
        title: "API Test Complete",
        description: "Check console for results",
      });
    } catch (error) {
      console.error('❌ API test failed:', error);
      toast({
        title: "API Test Failed",
        description: `Error: ${error.message}`,
        variant: "destructive"
      });
    }
  };



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

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await apiService.getCurrentUser();
      console.log('Doctor profile data received:', data);
      
      // Format the dateOfBirth for the date input
      const formattedData = {
        ...data,
        dateOfBirth: formatDateForInput(data.dateOfBirth)
      };
      
      setProfile(formattedData);
      
      // After loading profile, sync with availability backend
      setTimeout(() => {
        fetchAvailability();
      }, 500);
      
      // Remove the separate image state since we're using profile.profileImage directly
      // setImage(data.profileImage || '');
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (!profile) return;

    if (name.startsWith('location.')) {
      setProfile(prev => prev ? {
        ...prev,
        location: { ...prev.location, [name.split('.')[1]]: value }
      } : null);
    } else if (name.startsWith('consultationFees.')) {
      const feeValue = parseInt(value) || 0;
      if (feeValue < 0) {
        toast({
          title: "Invalid Fee",
          description: "Consultation fees cannot be negative",
          variant: "destructive"
        });
        return;
      }
      setProfile(prev => prev ? {
        ...prev,
        consultationFees: { ...prev.consultationFees, [name.split('.')[1]]: feeValue }
      } : null);
    } else if (name.startsWith('availability.')) {
      setProfile(prev => prev ? {
        ...prev,
        availability: { ...prev.availability, [name.split('.')[1]]: value }
      } : null);
    } else {
      setProfile(prev => prev ? { ...prev, [name]: value } : null);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImage(URL.createObjectURL(file));
    }
  };

  // Fetch complete data from backend (availability + profile)
  const fetchAvailability = async () => {
    try {
      // Try the complete endpoint first (this one works)
      const response = await apiService.get('/doctor-availability/me/complete');
      if (response.data?.success && response.data.data) {
        const data = response.data.data;
        
        // Update profile with complete backend data
        setProfile(prev => {
          if (!prev) return prev;
          
          const updatedProfile = {
            ...prev,
            // Update availability from DoctorAvailability model
            availability: {
              workingDays: data.availability?.workingDays?.filter((day: { day: string; isWorking: boolean }) => day.isWorking)?.map((day: { day: string; isWorking: boolean }) => day.day) || [],
              startTime: data.availability?.defaultStartTime || '09:00',
              endTime: data.availability?.defaultEndTime || '17:00',
              appointmentDuration: data.availability?.appointmentDuration || 30,
              // Get lunch break from the first working day's breaks
              lunchBreakStart: data.availability?.workingDays?.find((day: { day: string; isWorking: boolean }) => day.isWorking)?.breaks?.[0]?.startTime || '12:00',
              lunchBreakEnd: data.availability?.workingDays?.find((day: { day: string; isWorking: boolean }) => day.isWorking)?.breaks?.[0]?.endTime || '13:00'
            },
            // Update consultation fees from User model
            consultationFees: data.consultationFees || prev.consultationFees,
            // Update other profile fields
            languages: data.languages || prev.languages,
            specialties: data.specialties || prev.specialties
          };
          
          return updatedProfile;
        });
        
        console.log('Complete backend data:', data);
        console.log('🔍 Working Days Debug:', {
          rawWorkingDays: data.availability?.workingDays,
          filteredWorkingDays: data.availability?.workingDays?.filter((day: { day: string; isWorking: boolean }) => day.isWorking),
          finalWorkingDays: data.availability?.workingDays?.filter((day: { day: string; isWorking: boolean }) => day.isWorking)?.map((day: { day: string; isWorking: boolean }) => day.day)
        });
        console.log('Updated profile with:', {
          availability: data.availability,
          consultationFees: data.consultationFees,
          languages: data.languages,
          specialties: data.specialties
        });
        
        // Set last sync time
        setLastSyncTime(new Date().toLocaleTimeString());
        
        // Show success message
        toast({
          title: "Synced Successfully",
          description: "Profile updated with latest backend data",
        });
      }
    } catch (error) {
      console.error('Error fetching complete data:', error);
      
      // Fallback: try the regular endpoint
      try {
        console.log('🔄 Trying fallback endpoint...');
        const fallbackResponse = await apiService.get('/doctor-availability/me');
        if (fallbackResponse.data?.success && fallbackResponse.data.availability) {
          console.log('✅ Fallback endpoint worked');
          // Process fallback data...
        }
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
      }
      
      toast({
        title: "Error",
        description: "Failed to fetch backend data",
        variant: "destructive"
      });
    }
  };

  // Update availability in backend
  const updateAvailability = async (availabilityData: {
    workingDays: string[];
    startTime: string;
    endTime: string;
    appointmentDuration: number;
    lunchBreakStart: string;
    lunchBreakEnd: string;
  }) => {
    try {
      console.log('🔄 Updating availability with data:', availabilityData);
      
      // Validate required fields
      if (!availabilityData.workingDays || availabilityData.workingDays.length === 0) {
        console.error('❌ No working days selected');
        toast({
          title: "Validation Error",
          description: "Please select at least one working day",
          variant: "destructive"
        });
        return false;
      }
      
      if (!availabilityData.startTime || !availabilityData.endTime) {
        console.error('❌ Missing start or end time');
        toast({
          title: "Validation Error",
          description: "Please set working hours",
          variant: "destructive"
        });
        return false;
      }
      
      if (!availabilityData.appointmentDuration) {
        console.error('❌ Missing appointment duration');
        toast({
          title: "Validation Error",
          description: "Please set appointment duration",
          variant: "destructive"
        });
        return false;
      }
      
      // Check if end time is after start time (without changing it)
      const startHour = parseInt(availabilityData.startTime.split(':')[0]);
      const endHour = parseInt(availabilityData.endTime.split(':')[0]);
      
      if (endHour <= startHour) {
        console.error('❌ End time must be after start time');
        toast({
          title: "Validation Error",
          description: "End time must be after start time. Please check your working hours.",
          variant: "destructive"
        });
        return false;
      }
      
      // Create all 7 days with proper isWorking flags
      const allDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const workingDays = allDays.map((day: string) => ({
        day,
        isWorking: availabilityData.workingDays.includes(day),
        startTime: availabilityData.startTime,
        endTime: availabilityData.endTime,
        breaks: availabilityData.workingDays.includes(day) ? [{
          startTime: availabilityData.lunchBreakStart,
          endTime: availabilityData.lunchBreakEnd,
          type: 'lunch',
          description: 'Lunch Break'
        }] : []
      }));

      const updateData = {
        workingDays,
        defaultStartTime: availabilityData.startTime,
        defaultEndTime: availabilityData.endTime,
        appointmentDuration: availabilityData.appointmentDuration
      };

      console.log('📤 Sending availability update:', updateData);
      console.log('🔍 Working days breakdown:', {
        selectedDays: availabilityData.workingDays,
        allDays: allDays,
        workingDaysWithFlags: workingDays.map(wd => ({ day: wd.day, isWorking: wd.isWorking }))
      });

      const response = await apiService.put('/doctor-availability/me', updateData);
      console.log('📥 Availability update response:', response.data);
      
      // Check if the response is successful (either success flag or data presence)
      if (response.data?.success || response.data?.data || response.status === 200) {
        toast({
          title: "Success",
          description: "Availability settings updated successfully",
        });
        return true;
      } else {
        console.error('❌ Availability update failed:', response.data);
        return false;
      }
    } catch (error) {
      console.error('❌ Error updating availability:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      toast({
        title: "Error",
        description: `Failed to update availability: ${error.message}`,
        variant: "destructive"
      });
      return false;
    }
  };

  // Calculation functions for availability analytics
  const calculateWorkingHours = (startTime: string, endTime: string) => {
    if (!startTime || !endTime) return 0;
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return Math.round(diffHours * 10) / 10; // Round to 1 decimal place
  };

  const calculateSlotsPerDay = () => {
    if (!profile.availability?.startTime || !profile.availability?.endTime || !profile.availability?.appointmentDuration) {
      return 0;
    }
    
    const workingHours = calculateWorkingHours(profile.availability.startTime, profile.availability.endTime);
    
    // Calculate break time using lunch break times
    if (profile.availability.lunchBreakStart && profile.availability.lunchBreakEnd) {
      const breakStart = new Date(`2000-01-01T${profile.availability.lunchBreakStart}`);
      const breakEnd = new Date(`2000-01-01T${profile.availability.lunchBreakEnd}`);
      const workStart = new Date(`2000-01-01T${profile.availability.startTime}`);
      const workEnd = new Date(`2000-01-01T${profile.availability.endTime}`);
      
      // Calculate overlapping break time
      const overlapStart = new Date(Math.max(breakStart.getTime(), workStart.getTime()));
      const overlapEnd = new Date(Math.min(breakEnd.getTime(), workEnd.getTime()));
      const breakHours = overlapStart < overlapEnd ? (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60) : 0;
      
      const availableHours = workingHours - breakHours;
      return Math.floor((availableHours * 60) / profile.availability.appointmentDuration);
    }
    
    return Math.floor((workingHours * 60) / profile.availability.appointmentDuration);
  };

  // Memoize availability status to prevent infinite re-renders
  const currentAvailabilityStatus = useMemo(() => {
    if (!profile?.availability?.workingDays || !profile?.availability?.startTime || !profile?.availability?.endTime) {
      return false;
    }
    
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const currentTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    
    // Check if today is a working day
    const isWorkingToday = profile.availability.workingDays.includes(currentDay);
    if (!isWorkingToday) return false;
    
    // Check if current time is within working hours
    const isWithinWorkingHours = currentTime >= profile.availability.startTime && currentTime <= profile.availability.endTime;
    if (!isWithinWorkingHours) return false;
    
    // Check if current time conflicts with lunch break
    if (profile.availability.lunchBreakStart && profile.availability.lunchBreakEnd) {
      const isInLunchBreak = currentTime >= profile.availability.lunchBreakStart && currentTime <= profile.availability.lunchBreakEnd;
      if (isInLunchBreak) return false;
    }
    
    return true;
  }, [profile?.availability?.workingDays, profile?.availability?.startTime, profile?.availability?.endTime, profile?.availability?.lunchBreakStart, profile?.availability?.lunchBreakEnd]);

  const handleEdit = () => setEditMode(true);

  const handleCancel = () => {
    setEditMode(false);
    loadProfile();
    setImageFile(null);
  };

  const handleSave = async () => {
    if (!profile) return;
    
    // Validate consultation fees before saving
    if (!profile.consultationFees?.online || profile.consultationFees.online <= 0) {
      toast({
        title: "Validation Error",
        description: "Please set online consultation fees greater than 0",
        variant: "destructive"
      });
      return;
    }
    
    if (!profile.consultationFees?.inPerson || profile.consultationFees.inPerson <= 0) {
      toast({
        title: "Validation Error",
        description: "Please set in-person consultation fees greater than 0",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add profile data
      Object.keys(profile).forEach(key => {
        const value = profile[key];
        console.log(`🔍 Processing field: ${key}`, { value, type: typeof value });
        
        // Handle all nested objects and arrays by converting them to JSON strings
        if (value !== null && value !== undefined && typeof value === 'object') {
          try {
            const jsonString = JSON.stringify(value);
            formData.append(key, jsonString);
            console.log(`🔄 Object field ${key} converted to JSON:`, jsonString.substring(0, 100) + (jsonString.length > 100 ? '...' : ''));
          } catch (stringifyError) {
            console.warn(`⚠️ Failed to stringify field ${key}:`, stringifyError);
            // Skip this field if it can't be stringified
          }
        } else if (value !== undefined && value !== null) {
          formData.append(key, value);
          console.log(`✅ Field ${key} added with value:`, value);
        } else {
          console.log(`⏭️ Skipping field ${key} (undefined or null)`);
        }
      });
      
      // Add image file if selected
      if (imageFile) {
        formData.append('avatar', imageFile);
        console.log('📁 Adding image file to upload:', imageFile.name);
      }
      
      // Debug: Log FormData contents
      console.log('📋 FormData contents:');
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: [File] ${value.name} (${value.size} bytes)`);
        } else {
          console.log(`  ${key}: ${typeof value === 'string' && value.length > 100 ? value.substring(0, 100) + '...' : value}`);
        }
      }
      
      console.log('📤 Sending profile update with FormData');
      
      // Use the doctor-specific endpoint with FormData
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/doctor/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
          // Don't set Content-Type for FormData, let the browser set it with boundary
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update profile: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('✅ Profile update response:', result);
      
      setEditMode(false);
      setImageFile(null);
      
      // Update availability in backend if availability data changed
      if (profile.availability) {
        const availabilityUpdated = await updateAvailability(profile.availability);
        if (!availabilityUpdated) {
          console.warn('Profile updated but availability update failed');
        }
      }
      
      // Reload profile to get updated data
      await loadProfile();
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: `Failed to update profile: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatWorkingDays = (days: string[]) => {
    return days.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(', ');
  };

  const getProfileCompletionPercentage = () => {
    if (!profile) return 0;
    
    // Define all profile fields with their weights
    const fieldWeights = [
      // Personal Information (25%)
      { field: 'firstName', weight: 2.5, label: 'First Name' },
      { field: 'lastName', weight: 2.5, label: 'Last Name' },
      { field: 'phone', weight: 2.5, label: 'Phone Number' },
      { field: 'gender', weight: 2.5, label: 'Gender' },
      { field: 'dateOfBirth', weight: 2.5, label: 'Date of Birth' },
      
      // Professional Information (35%)
      { field: 'licenseNumber', weight: 5, label: 'License Number' },
      { field: 'specialization', weight: 5, label: 'Specialization' },
      { field: 'hospital', weight: 5, label: 'Hospital/Clinic' },
      { field: 'department', weight: 3, label: 'Department' },
      { field: 'yearsOfExperience', weight: 3, label: 'Years of Experience' },
      { field: 'bio', weight: 4, label: 'Bio' },
      { field: 'specialties', weight: 5, label: 'Specialties' },
      
      // Location Information (15%)
      { field: 'location.city', weight: 3, label: 'City' },
      { field: 'location.state', weight: 3, label: 'State' },
      { field: 'location.pincode', weight: 2, label: 'Pincode' },
      { field: 'location.address', weight: 2, label: 'Address' },
      
      // Consultation Details (25%)
      { field: 'languages', weight: 5, label: 'Languages' },
      { field: 'consultationFees.online', weight: 5, label: 'Online Consultation Fee' },
      { field: 'consultationFees.inPerson', weight: 5, label: 'In-Person Consultation Fee' },
      { field: 'availability.workingDays', weight: 5, label: 'Working Days' },
      { field: 'availability.startTime', weight: 2.5, label: 'Start Time' },
      { field: 'availability.endTime', weight: 2.5, label: 'End Time' },
      
      // Documents (Bonus - up to 10% extra)
      { field: 'documents', weight: 10, label: 'Documents', isBonus: true }
    ];
    
    let totalScore = 0;
    let maxScore = 90; // Base score without documents
    
    fieldWeights.forEach(({ field, weight, isBonus }) => {
      const value = field.split('.').reduce((obj, key) => obj?.[key], profile);
      let isCompleted = false;
      
      if (field === 'documents') {
        // Check if required documents are uploaded
        const requiredDocs = ['license', 'certificate'];
        const uploadedDocs = profile.documents?.filter(doc => 
          requiredDocs.includes(doc.type) && doc.fileUrl
        ) || [];
        isCompleted = uploadedDocs.length >= 2;
      } else if (Array.isArray(value)) {
        isCompleted = value.length > 0;
      } else {
        isCompleted = value !== undefined && value !== null && value !== '';
      }
      
      if (isCompleted) {
        totalScore += weight;
        if (isBonus) {
          maxScore += weight; // Add bonus weight to max score
        }
      }
    });
    
    return Math.min(Math.round((totalScore / maxScore) * 100), 100);
  };

  if (loading) {
    return (
      <div className="w-full min-h-[calc(100vh-80px)] px-2 md:px-6 py-8 bg-health-light-gray max-w-5xl mx-auto">
        <div className="text-center py-12 text-health-teal font-semibold text-lg">
          Loading profile...
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="w-full min-h-[calc(100vh-80px)] px-2 md:px-6 py-8 bg-health-light-gray max-w-5xl mx-auto">
        <div className="text-center py-12 text-red-600 font-semibold text-lg">
          Failed to load profile data
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-80px)] px-2 md:px-6 py-8 bg-health-light-gray max-w-5xl mx-auto">
      {/* Profile Completion Status */}
      {!profile.profileComplete && (
        <Card className="shadow-lg mb-6 border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <div className="flex-1">
                <div className="font-medium text-orange-800">
                  Profile Completion: {getProfileCompletionPercentage()}%
                </div>
                <div className="text-sm text-orange-700">
                  Complete your profile to access all features
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowProfileDialog(true)}
              >
                Complete Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
      {activeTab === 'overview' && (
        <>
          {/* Profile Header */}
          <Card className="shadow-lg mb-8 w-full rounded-xl border-0">
            <CardHeader className="flex flex-row items-center gap-6 pb-2">
              <div className="relative group">
                <Avatar className="h-24 w-24 border-2 border-health-teal shadow-sm">
                  <AvatarImage src={getProfileImageUrl(profile.profileImage)} />
                  <AvatarFallback className="bg-health-teal text-white text-3xl">
                    {profile.firstName[0]}
                  </AvatarFallback>
                </Avatar>
                {editMode && (
                  <label className="absolute bottom-0 right-0 bg-health-aqua p-2 rounded-full cursor-pointer shadow hover:bg-health-teal transition">
                    <Upload className="h-4 w-4 text-white" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-2xl md:text-3xl font-bold text-health-teal mb-2">
                  Dr. {profile.firstName} {profile.lastName}
                </CardTitle>
                <div className="flex items-center gap-2 text-health-blue-gray text-sm md:text-base mb-2">
                  <MailCheck className="h-4 w-4" />
                  <span>{profile.email}</span>
                  {profile.isEmailVerified && (
                    <ShieldCheck className="h-4 w-4 text-health-success ml-2" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-health-blue-gray text-sm mb-2">
                  <Phone className="h-4 w-4" />
                  <span>{profile.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-health-blue-gray text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.location?.city}, {profile.location?.state}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 ml-auto">
                {/* Real-time Availability Status */}
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={`px-3 py-1 text-sm font-medium ${
                    currentAvailabilityStatus 
                      ? 'bg-green-100 text-green-800 border-green-200' 
                      : 'bg-red-100 text-red-800 border-red-200'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      currentAvailabilityStatus ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    {currentAvailabilityStatus ? 'Available' : 'Unavailable'}
                  </Badge>
                </div>
                
                {!editMode ? (
                  <Button variant="outline" onClick={handleEdit} className="px-4 py-2">
                    <Edit2 className="h-4 w-4 mr-2" /> Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleSave} className="px-4 py-2">
                      <Save className="h-4 w-4 mr-2" /> Save
                    </Button>
                    <Button variant="destructive" onClick={handleCancel} className="px-4 py-2">
                      <X className="h-4 w-4 mr-2" /> Cancel
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
              <div>
                <label className="block text-health-blue-gray font-medium mb-2">First Name</label>
                <Input 
                  name="firstName" 
                  value={profile.firstName} 
                  onChange={handleChange} 
                  disabled={!editMode} 
                />
              </div>
              <div>
                <label className="block text-health-blue-gray font-medium mb-2">Last Name</label>
                <Input 
                  name="lastName" 
                  value={profile.lastName} 
                  onChange={handleChange} 
                  disabled={!editMode} 
                />
              </div>
              <div>
                <label className="block text-health-blue-gray font-medium mb-2">Email Address</label>
                <Input 
                  name="email" 
                  value={profile.email} 
                  onChange={handleChange} 
                  disabled={!editMode} 
                />
              </div>
              <div>
                <label className="block text-health-blue-gray font-medium mb-2">Phone Number</label>
                <Input 
                  name="phone" 
                  value={profile.phone} 
                  onChange={handleChange} 
                  disabled={!editMode} 
                />
              </div>
              <div>
                <label className="block text-health-blue-gray font-medium mb-2">Date of Birth</label>
                <Input 
                  type="date" 
                  name="dateOfBirth" 
                  value={profile.dateOfBirth} 
                  onChange={handleChange} 
                  disabled={!editMode} 
                />
              </div>
              <div>
                <label className="block text-health-blue-gray font-medium mb-2">Gender</label>
                <Input 
                  name="gender" 
                  value={profile.gender} 
                  onChange={handleChange} 
                  disabled={!editMode} 
                />
              </div>
            </CardContent>
          </Card>

          {/* Professional Summary */}
          <Card className="shadow-lg mb-8 w-full rounded-xl border-0">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-health-teal flex items-center gap-2">
                <Stethoscope className="w-5 h-5" /> Professional Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-health-blue-gray font-medium mb-2">License Number</label>
                  <Input 
                    name="licenseNumber" 
                    value={profile.licenseNumber} 
                    onChange={handleChange} 
                    disabled={!editMode} 
                  />
                </div>
                <div>
                  <label className="block text-health-blue-gray font-medium mb-2">Primary Specialization</label>
                  <Input 
                    name="specialization" 
                    value={profile.specialization} 
                    onChange={handleChange} 
                    disabled={!editMode} 
                  />
                </div>
                <div>
                  <label className="block text-health-blue-gray font-medium mb-2">Hospital/Clinic</label>
                  <Input 
                    name="hospital" 
                    value={profile.hospital} 
                    onChange={handleChange} 
                    disabled={!editMode} 
                  />
                </div>
                <div>
                  <label className="block text-health-blue-gray font-medium mb-2">Department</label>
                  <Input 
                    name="department" 
                    value={profile.department} 
                    onChange={handleChange} 
                    disabled={!editMode} 
                  />
                </div>
                <div>
                  <label className="block text-health-blue-gray font-medium mb-2">Years of Experience</label>
                  <Input 
                    name="yearsOfExperience" 
                    value={profile.yearsOfExperience} 
                    onChange={handleChange} 
                    disabled={!editMode} 
                  />
                </div>
                <div>
                  <label className="block text-health-blue-gray font-medium mb-2">Emergency Available</label>
                  <div className="flex items-center gap-2 mt-2">
                    {profile.emergencyAvailable ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className={profile.emergencyAvailable ? 'text-green-600' : 'text-red-600'}>
                      {profile.emergencyAvailable ? 'Available' : 'Not Available'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-health-blue-gray font-medium mb-2">Professional Bio</label>
                <textarea 
                  name="bio" 
                  value={profile.bio} 
                  onChange={handleChange} 
                  disabled={!editMode}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-health-teal disabled:bg-gray-100"
                />
              </div>

              {profile.specialties && profile.specialties.length > 0 && (
                <div>
                  <label className="block text-health-blue-gray font-medium mb-2">Additional Specialties</label>
                  <div className="flex flex-wrap gap-2">
                    {profile.specialties.map((specialty, index) => (
                      <Badge key={index} variant="secondary" className="bg-health-teal/10 text-health-teal">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {profile.ratings && (
                <div>
                  <label className="block text-health-blue-gray font-medium mb-2">Ratings</label>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    <span className="font-semibold">{profile.ratings.average.toFixed(1)}</span>
                    <span className="text-gray-600">({profile.ratings.count} reviews)</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === 'professional' && (
        <Card className="shadow-lg mb-8 w-full rounded-xl border-0">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-health-teal flex items-center gap-2">
              <Building className="w-5 h-5" /> Professional Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Location Information */}
            <div>
              <h3 className="text-lg font-semibold text-health-teal mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Location Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-health-blue-gray font-medium mb-2">City</label>
                  <Input 
                    name="location.city" 
                    value={profile.location?.city || ''} 
                    onChange={handleChange} 
                    disabled={!editMode} 
                  />
                </div>
                <div>
                  <label className="block text-health-blue-gray font-medium mb-2">State</label>
                  <Input 
                    name="location.state" 
                    value={profile.location?.state || ''} 
                    onChange={handleChange} 
                    disabled={!editMode} 
                  />
                </div>
                <div>
                  <label className="block text-health-blue-gray font-medium mb-2">Pincode</label>
                  <Input 
                    name="location.pincode" 
                    value={profile.location?.pincode || ''} 
                    onChange={handleChange} 
                    disabled={!editMode} 
                  />
                </div>
                <div>
                  <label className="block text-health-blue-gray font-medium mb-2">Full Address</label>
                  <Input 
                    name="location.address" 
                    value={profile.location?.address || ''} 
                    onChange={handleChange} 
                    disabled={!editMode} 
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Languages */}
            <div>
              <h3 className="text-lg font-semibold text-health-teal mb-4 flex items-center gap-2">
                <Languages className="w-4 h-4" /> Languages Spoken
              </h3>
              {profile.languages && profile.languages.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.languages.map((language, index) => (
                    <Badge key={index} variant="outline" className="border-health-teal text-health-teal">
                      {language}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No languages specified</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'consultation' && (
        <Card className="shadow-lg mb-8 w-full rounded-xl border-0">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-health-teal flex items-center gap-2">
              <Clock className="w-5 h-5" /> Consultation Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Consultation Fees */}
            <div>
              <h3 className="text-lg font-semibold text-health-teal mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> Consultation Fees
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-health-blue-gray font-medium mb-2">Online Consultation (₹)</label>
                  <Input 
                    name="consultationFees.online" 
                    type="number"
                    min="100"
                    step="50"
                    value={profile.consultationFees?.online || 0} 
                    onChange={handleChange} 
                    disabled={!editMode} 
                    placeholder="Enter fee (min: ₹100)"
                  />
                </div>
                <div>
                  <label className="block text-health-blue-gray font-medium mb-2">In-Person Consultation (₹)</label>
                  <Input 
                    name="consultationFees.inPerson" 
                    type="number"
                    min="100"
                    step="50"
                    value={profile.consultationFees?.inPerson || 0} 
                    onChange={handleChange} 
                    disabled={!editMode} 
                    placeholder="Enter fee (min: ₹100)"
                  />
                </div>
              </div>
              
              {/* Help text for consultation fees */}
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Setting Consultation Fees</p>
                    <ul className="space-y-1 text-xs">
                      <li>• <strong>Online Consultation:</strong> Set your fee for video/telephone consultations</li>
                      <li>• <strong>In-Person Consultation:</strong> Set your fee for physical consultations</li>
                      <li>• <strong>Minimum Fee:</strong> ₹100 recommended for both types</li>
                      <li>• <strong>Note:</strong> In-person consultations only charge a 5% convenience fee to patients</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Working Schedule */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-semibold text-health-teal flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Working Schedule & Availability
                  </h3>
                  
                  {/* Real-time Status Badge */}
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      currentAvailabilityStatus ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className={`text-sm font-medium ${
                      currentAvailabilityStatus ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {currentAvailabilityStatus ? 'Available Now' : 'Currently Unavailable'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchAvailability}
                    className="text-health-teal border-health-teal hover:bg-health-teal hover:text-white"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync Availability
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      fetchAvailability();
                      toast({
                        title: "Syncing",
                        description: "Forcing sync with backend data...",
                      });
                    }}
                    className="text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Force Sync
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={syncAllData}
                    className="text-purple-600 border-purple-600 hover:bg-purple-600 hover:text-white"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Full Sync
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={testAvailabilityAPI}
                    className="text-orange-600 border-orange-600 hover:bg-orange-600 hover:text-white"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Test API
                  </Button>
                </div>
              </div>
              
              {/* Sync Status */}
              {lastSyncTime && (
                <div className="text-sm text-gray-600 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Last synced: {lastSyncTime}
                </div>
              )}
              
              {/* Current Status Summary */}
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-800">
                      {profile.availability?.workingDays?.length || 0}/7
                    </div>
                    <div className="text-sm text-blue-600">Working Days</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-800">
                      {currentAvailabilityStatus ? 'Available' : 'Unavailable'}
                    </div>
                    <div className="text-sm text-green-600">Current Status</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-800">
                      {profile.availability?.startTime && profile.availability?.endTime 
                        ? `${profile.availability.startTime} - ${profile.availability.endTime}`
                        : 'Not Set'
                      }
                    </div>
                    <div className="text-sm text-purple-600">Working Hours</div>
                  </div>
                </div>
              </div>
              
              {/* Data Consistency Check */}
              {profile?.availability && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-blue-700">Data Consistency Check</span>
                  </div>
                                  <div className="text-xs text-blue-600 space-y-1">
                  <div>• Working Hours: {profile.availability.startTime} - {profile.availability.endTime}</div>
                  <div>• Appointment Duration: {profile.availability.appointmentDuration} minutes</div>
                  <div>• Working Days: {profile.availability.workingDays?.length || 0}/7 selected</div>
                  <div>• Consultation Fees: ₹{profile.consultationFees?.online || 0} (Online) / ₹{profile.consultationFees?.inPerson || 0} (In-Person)</div>
                  {(!profile.consultationFees?.online || profile.consultationFees.online <= 0 || !profile.consultationFees?.inPerson || profile.consultationFees.inPerson <= 0) && (
                    <div className="text-red-600 font-medium">⚠️ Please set consultation fees to complete your profile</div>
                  )}
                </div>
                </div>
              )}
              
              {/* Debug: Current Availability Status */}
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium text-yellow-700">Debug: Why "Unavailable"?</span>
                </div>
                <div className="text-xs text-yellow-600 space-y-1">
                  <div>• Current Day: {new Date().toLocaleDateString('en-US', { weekday: 'long' })}</div>
                  <div>• Current Time: {new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}</div>
                  <div>• Working Days: [{profile.availability?.workingDays?.join(', ') || 'None'}]</div>
                  <div>• Start Time: {profile.availability?.startTime || 'Not Set'}</div>
                  <div>• End Time: {profile.availability?.endTime || 'Not Set'}</div>
                  <div>• Lunch Break: {profile.availability?.lunchBreakStart || 'Not Set'} - {profile.availability?.lunchBreakEnd || 'Not Set'}</div>
                  <div>• Is Working Today: {profile.availability?.workingDays?.includes(new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()) ? 'Yes' : 'No'}</div>
                  <div>• Within Working Hours: {(() => {
                    if (!profile.availability?.startTime || !profile.availability?.endTime) return 'Cannot Check';
                    const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
                    const isWithin = currentTime >= profile.availability.startTime && currentTime <= profile.availability.endTime;
                    return isWithin ? 'Yes' : 'No';
                  })()}</div>
                </div>
              </div>
              
              {/* Availability Analytics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">Working Days</p>
                      <p className="text-2xl font-bold text-green-800">
                        {profile.availability?.workingDays?.length || 0}/7
                      </p>
                    </div>
                    <Calendar className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Daily Hours</p>
                      <p className="text-2xl font-bold text-blue-800">
                        {profile.availability?.startTime && profile.availability?.endTime 
                          ? calculateWorkingHours(profile.availability.startTime, profile.availability.endTime)
                          : 0}h
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Slots/Day</p>
                      <p className="text-2xl font-bold text-purple-800">
                        {calculateSlotsPerDay()}
                      </p>
                    </div>
                    <Stethoscope className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-600 font-medium">Appointment</p>
                      <p className="text-2xl font-bold text-orange-800">
                        {profile.availability?.appointmentDuration || 30}m
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-orange-600" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-health-blue-gray font-medium mb-2">Working Days</label>
                  <div className="p-3 bg-gray-50 rounded-md">
                    {editMode ? (
                      <div className="grid grid-cols-2 gap-2">
                        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                          <label key={day} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={profile.availability?.workingDays?.includes(day) || false}
                                                             onChange={(e) => {
                                 const currentDays = profile.availability?.workingDays || [];
                                 const newDays = e.target.checked
                                   ? [...currentDays, day]
                                   : currentDays.filter(d => d !== day);
                                 
                                 // Update the profile state directly
                                 setProfile(prev => ({
                                   ...prev,
                                   availability: {
                                     ...prev.availability,
                                     workingDays: newDays
                                   }
                                 }));
                               }}
                              className="rounded border-gray-300 text-health-teal focus:ring-health-teal"
                            />
                            <span className="text-sm font-medium capitalize">{day}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      profile.availability?.workingDays && profile.availability.workingDays.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {profile.availability.workingDays.map((day, index) => (
                            <Badge key={index} variant="secondary">
                              {day.charAt(0).toUpperCase() + day.slice(1)}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No working days specified</p>
                      )
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-health-blue-gray font-medium mb-2">Working Hours</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Start Time</label>
                      <Input 
                        name="availability.startTime" 
                        type="time"
                        value={profile.availability?.startTime || ''} 
                        onChange={handleChange} 
                        disabled={!editMode} 
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">End Time</label>
                      <Input 
                        name="availability.endTime" 
                        type="time"
                        value={profile.availability?.endTime || ''} 
                        onChange={handleChange} 
                        disabled={!editMode} 
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-health-blue-gray font-medium mb-2">Appointment Duration (minutes)</label>
                  <Input 
                    name="availability.appointmentDuration" 
                    type="number"
                    value={profile.availability?.appointmentDuration || 30} 
                    onChange={handleChange} 
                    disabled={!editMode} 
                  />
                </div>
                <div>
                  <label className="block text-health-blue-gray font-medium mb-2">Lunch Break</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Start</label>
                      <Input 
                        name="availability.lunchBreakStart" 
                        type="time"
                        value={profile.availability?.lunchBreakStart || ''} 
                        onChange={handleChange} 
                        disabled={!editMode} 
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">End</label>
                      <Input 
                        name="availability.lunchBreakEnd" 
                        type="time"
                        value={profile.availability?.lunchBreakEnd || ''} 
                        onChange={handleChange} 
                        disabled={!editMode} 
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Detailed Working Schedule */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-health-teal mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Weekly Working Schedule
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                    const isWorking = profile.availability?.workingDays?.includes(day);
                    const daySchedule = profile.availability?.workingDays?.find(d => d === day);
                    
                    return (
                      <div 
                        key={day} 
                        className={`p-4 rounded-lg border-2 ${
                          isWorking 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="text-center">
                          <div className={`text-sm font-semibold mb-2 ${
                            isWorking ? 'text-green-700' : 'text-gray-500'
                          }`}>
                            {day.charAt(0).toUpperCase() + day.slice(1)}
                          </div>
                          
                          {isWorking ? (
                            <div className="space-y-2">
                              <div className="text-xs text-green-600">
                                <div className="font-medium">Working Hours</div>
                                <div>{profile.availability?.startTime || '09:00'} - {profile.availability?.endTime || '17:00'}</div>
                              </div>
                              
                              {profile.availability?.lunchBreakStart && profile.availability?.lunchBreakEnd && (
                                <div className="text-xs text-orange-600">
                                  <div className="font-medium">Lunch Break</div>
                                  <div>{profile.availability.lunchBreakStart} - {profile.availability.lunchBreakEnd}</div>
                                </div>
                              )}
                              
                              <div className="text-xs text-blue-600">
                                <div className="font-medium">Slots Available</div>
                                <div>{calculateSlotsPerDay()} slots</div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs text-gray-500">
                              <div className="font-medium">Not Working</div>
                              <div>Day Off</div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Detailed Time Schedule */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-health-teal mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Daily Schedule Breakdown
                </h4>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                    {/* Working Hours */}
                    <div>
                      <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Sun className="w-4 h-4 text-yellow-500" />
                        Working Hours
                      </h5>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-600">Start Time</span>
                          <span className="text-lg font-bold text-green-700">
                            {profile.availability?.startTime || '09:00'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-600">End Time</span>
                          <span className="text-lg font-bold text-red-700">
                            {profile.availability?.endTime || '17:00'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-600">Total Hours</span>
                          <span className="text-lg font-bold text-blue-700">
                            {profile.availability?.startTime && profile.availability?.endTime 
                              ? calculateWorkingHours(profile.availability.startTime, profile.availability.endTime)
                              : 0}h
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Breaks & Appointments */}
                    <div>
                      <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Coffee className="w-4 h-4 text-orange-500" />
                        Breaks & Appointments
                      </h5>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-600">Lunch Break</span>
                          <span className="text-lg font-bold text-orange-700">
                            {profile.availability?.lunchBreakStart && profile.availability?.lunchBreakEnd
                              ? `${profile.availability.lunchBreakStart} - ${profile.availability.lunchBreakEnd}`
                              : 'Not Set'
                            }
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-600">Appointment Duration</span>
                          <span className="text-lg font-bold text-purple-700">
                            {profile.availability?.appointmentDuration || 30} minutes
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-600">Slots Per Day</span>
                          <span className="text-lg font-bold text-indigo-700">
                            {calculateSlotsPerDay()} slots
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = '/doctor/availability'}
                    className="text-health-teal border-health-teal hover:bg-health-teal hover:text-white"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Manage Availability
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const now = new Date();
                      const currentTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
                      const endTime = new Date(`2000-01-01T${currentTime}`);
                      endTime.setHours(endTime.getHours() + 2); // Add 2 hours
                      const newEndTime = endTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
                      
                      setProfile(prev => ({
                        ...prev,
                        availability: {
                          ...prev.availability,
                          endTime: newEndTime
                        }
                      }));
                    }}
                    className="text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Extend Today
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      if (profile.availability) {
                        const success = await updateAvailability(profile.availability);
                        if (success) {
                          await fetchAvailability(); // Refresh from backend
                        }
                      }
                    }}
                    className="text-green-600 border-green-600 hover:bg-green-600 hover:text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Availability
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'documents' && (
        <Card className="shadow-lg mb-8 w-full rounded-xl border-0">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-health-teal flex items-center gap-2">
              <FileText className="w-5 h-5" /> Professional Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profile.documents && profile.documents.length > 0 ? (
              <div className="space-y-4">
                {profile.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-health-teal/10 rounded-full">
                        <FileText className="h-5 w-5 text-health-teal" />
                      </div>
                      <div>
                        <div className="font-medium text-health-teal">{doc.title}</div>
                        <div className="text-sm text-gray-600">{doc.fileName}</div>
                        <div className="text-xs text-gray-500">
                          Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={doc.verified ? "default" : "secondary"}>
                        {doc.verified ? "Verified" : "Pending"}
                      </Badge>
                      <Button variant="outline" size="sm" asChild>
                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                          View
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No documents uploaded yet</p>
                <p className="text-sm">Upload your professional documents to build trust with patients</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'completion' && (
        <Card className="shadow-lg mb-8 w-full rounded-xl border-0">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-health-teal flex items-center gap-2">
              <CheckCircle className="w-5 h-5" /> Profile Completion Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall Progress */}
            <div className="bg-gradient-to-r from-health-teal/10 to-health-aqua/10 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-health-teal">Overall Progress</h3>
                <div className="text-right">
                  <div className="text-2xl font-bold text-health-teal">{getProfileCompletionPercentage()}%</div>
                  <div className="text-sm text-gray-600">Complete</div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-health-teal to-health-aqua h-3 rounded-full transition-all duration-300"
                  style={{ width: `${getProfileCompletionPercentage()}%` }}
                ></div>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                {profile.profileComplete ? 'Profile is fully completed!' : 'Complete all sections to unlock full features'}
              </div>
            </div>

            {/* Personal Information Section */}
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-health-teal mb-3 flex items-center gap-2">
                <UserIcon className="w-4 h-4" /> Personal Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">First Name</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{profile.firstName || 'Not provided'}</span>
                    {profile.firstName ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">Last Name</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{profile.lastName || 'Not provided'}</span>
                    {profile.lastName ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">Phone Number</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{profile.phone || 'Not provided'}</span>
                    {profile.phone ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">Gender</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{profile.gender || 'Not provided'}</span>
                    {profile.gender ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">Date of Birth</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{profile.dateOfBirth || 'Not provided'}</span>
                    {profile.dateOfBirth ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Information Section */}
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-health-teal mb-3 flex items-center gap-2">
                <Stethoscope className="w-4 h-4" /> Professional Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">License Number</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{profile.licenseNumber || 'Not provided'}</span>
                    {profile.licenseNumber ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">Specialization</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{profile.specialization || 'Not provided'}</span>
                    {profile.specialization ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">Hospital/Clinic</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{profile.hospital || 'Not provided'}</span>
                    {profile.hospital ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">Department</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{profile.department || 'Not provided'}</span>
                    {profile.department ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">Years of Experience</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{profile.yearsOfExperience || 'Not provided'}</span>
                    {profile.yearsOfExperience ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">Bio</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{profile.bio ? 'Provided' : 'Not provided'}</span>
                    {profile.bio ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">Specialties</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{profile.specialties?.length > 0 ? `${profile.specialties.length} selected` : 'Not provided'}</span>
                    {profile.specialties?.length > 0 ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                  </div>
                </div>
              </div>
            </div>

            {/* Location Information Section */}
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-health-teal mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Location Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">City</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{profile.location?.city || 'Not provided'}</span>
                    {profile.location?.city ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">State</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{profile.location?.state || 'Not provided'}</span>
                    {profile.location?.state ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">Pincode</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{profile.location?.pincode || 'Not provided'}</span>
                    {profile.location?.pincode ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">Address</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{profile.location?.address ? 'Provided' : 'Not provided'}</span>
                    {profile.location?.address ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                  </div>
                </div>
              </div>
            </div>

            {/* Consultation Details Section */}
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-health-teal mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Consultation Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">Languages</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{profile.languages?.length > 0 ? `${profile.languages.length} languages` : 'Not provided'}</span>
                    {profile.languages?.length > 0 ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">Online Consultation Fee</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{profile.consultationFees?.online && profile.consultationFees.online > 0 ? `₹${profile.consultationFees.online}` : 'Not set'}</span>
                    {profile.consultationFees?.online && profile.consultationFees.online > 0 ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">In-Person Consultation Fee</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{profile.consultationFees?.inPerson && profile.consultationFees.inPerson > 0 ? `₹${profile.consultationFees.inPerson}` : 'Not set'}</span>
                    {profile.consultationFees?.inPerson && profile.consultationFees.inPerson > 0 ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">Working Days</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{profile.availability?.workingDays?.length > 0 ? `${profile.availability.workingDays.length} days` : 'Not set'}</span>
                    {profile.availability?.workingDays?.length > 0 ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">Working Hours</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {profile.availability?.startTime && profile.availability?.endTime 
                        ? `${profile.availability.startTime} - ${profile.availability.endTime}` 
                        : 'Not set'}
                    </span>
                    {profile.availability?.startTime && profile.availability?.endTime ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">Emergency Available</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{profile.emergencyAvailable ? 'Yes' : 'No'}</span>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Documents Section */}
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-health-teal mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Professional Documents
              </h4>
              <div className="space-y-3">
                {profile.documents && profile.documents.length > 0 ? (
                  profile.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-health-teal" />
                        <div>
                          <div className="font-medium text-sm">{doc.title}</div>
                          <div className="text-xs text-gray-600">{doc.fileName}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={doc.verified ? "default" : "secondary"}>
                          {doc.verified ? "Verified" : "Pending"}
                        </Badge>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No documents uploaded</p>
                  </div>
                )}
              </div>
              <div className="mt-3 text-sm text-gray-600">
                Required: Medical License and Medical Certificate
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 pt-4">
              <Button 
                onClick={() => setShowProfileDialog(true)}
                className="bg-health-teal hover:bg-health-teal/90"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Complete Profile
              </Button>
              <Button 
                variant="outline"
                onClick={() => setActiveTab('overview')}
              >
                View Full Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Statistics */}
      <Card className="shadow-lg mb-8 w-full rounded-xl border-0">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-health-teal">Profile Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-health-teal/10 rounded-lg">
              <div className="text-2xl font-bold text-health-teal">
                {getProfileCompletionPercentage()}%
              </div>
              <div className="text-sm text-gray-600">Profile Complete</div>
            </div>
            <div className="text-center p-4 bg-health-aqua/10 rounded-lg">
              <div className="text-2xl font-bold text-health-aqua">
                {profile.ratings?.count || 0}
              </div>
              <div className="text-sm text-gray-600">Patient Reviews</div>
            </div>
            <div className="text-center p-4 bg-health-success/10 rounded-lg">
              <div className="text-2xl font-bold text-health-success">
                {profile.documents?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Documents</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {editMode && (
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" /> Save Changes
          </Button>
          <Button variant="destructive" onClick={handleCancel} disabled={loading}>
            <X className="h-4 w-4 mr-2" /> Cancel
          </Button>
        </div>
      )}

      {/* Profile Completion Dialog */}
      <DoctorProfileCompletionDialog
        open={showProfileDialog}
        onOpenChange={setShowProfileDialog}
        onComplete={() => {
          setShowProfileDialog(false);
          // Refresh the profile data
          loadProfile();
        }}
      />
    </div>
  );
};

export default DoctorProfile; 