import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  User, Bell, Shield, Database, Globe, Palette, Settings as SettingsIcon,
  Eye, Plus, Search, RefreshCw, ArrowLeft, Users, Droplets,
  Heart, AlertTriangle, Clock, DollarSign, Activity, Save,
  Trash2, Edit, Copy, Download, Upload, Key, Lock, Unlock,
  Mail, Phone, MapPin, Building, Calendar, FileText, CheckCircle,
  XCircle, Info, HelpCircle, ExternalLink, MessageSquare, PhoneCall,
  Video, Send, Printer, Share2, Mail as MailIcon, DownloadCloud,
  UploadCloud, KeyRound, ShieldCheck, EyeOff, Eye as EyeIcon,
  BellOff, BellRing, Volume2, VolumeX, Smartphone, Monitor,
  Tablet, Globe as GlobeIcon, Moon, Sun, Monitor as MonitorIcon,
  Award, Star, Target, TrendingUp, TrendingDown, Zap, Shield as ShieldIcon,
  UserCheck, UserX, CalendarDays, MapPin as MapPinIcon, GraduationCap,
  Briefcase, Home, CreditCard, Smartphone as SmartphoneIcon, Globe as GlobeIcon2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface UserProfile {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    gender: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    avatar?: string;
  };
  professionalInfo: {
    role: string;
    department: string;
    employeeId: string;
    hireDate: string;
    supervisor: string;
    certifications: Array<{
      name: string;
      issuingBody: string;
      issueDate: string;
      expiryDate: string;
      status: 'active' | 'expired' | 'pending';
    }>;
    specializations: string[];
    experience: number;
    education: Array<{
      degree: string;
      institution: string;
      year: string;
      field: string;
    }>;
  };
  accountInfo: {
    username: string;
    emailVerified: boolean;
    phoneVerified: boolean;
    twoFactorEnabled: boolean;
    lastLogin: string;
    accountCreated: string;
    status: 'active' | 'suspended' | 'pending';
    permissions: string[];
  };
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
      criticalAlerts: boolean;
      inventoryAlerts: boolean;
      donorAlerts: boolean;
      requestAlerts: boolean;
      qualityAlerts: boolean;
      systemAlerts: boolean;
    };
  };
  activity: {
    recentLogins: Array<{
      date: string;
      location: string;
      device: string;
      ip: string;
      status: 'success' | 'failed';
    }>;
    recentActions: Array<{
      action: string;
      timestamp: string;
      details: string;
      category: string;
    }>;
    statistics: {
      totalLogins: number;
      lastMonthLogins: number;
      totalActions: number;
      lastMonthActions: number;
    };
  };
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Mock data for profile
  const mockProfile: UserProfile = {
    personalInfo: {
      firstName: 'Dr. Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@bloodbank.com',
      phone: '+1-555-0123',
      dateOfBirth: '1985-03-15',
      gender: 'Female',
      address: '123 Medical Center Dr',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States',
      avatar: '/avatars/sarah-johnson.jpg'
    },
    professionalInfo: {
      role: 'Blood Bank Manager',
      department: 'Blood Bank Operations',
      employeeId: 'BB-EMP-2024-001',
      hireDate: '2020-06-15',
      supervisor: 'Dr. Michael Chen',
      certifications: [
        {
          name: 'Certified Blood Bank Specialist',
          issuingBody: 'American Association of Blood Banks',
          issueDate: '2021-03-15',
          expiryDate: '2026-03-15',
          status: 'active'
        },
        {
          name: 'Clinical Laboratory Scientist',
          issuingBody: 'American Society for Clinical Pathology',
          issueDate: '2019-08-20',
          expiryDate: '2024-08-20',
          status: 'active'
        }
      ],
      specializations: ['Blood Typing', 'Quality Control', 'Inventory Management', 'Donor Management'],
      experience: 8,
      education: [
        {
          degree: 'Master of Science',
          institution: 'Johns Hopkins University',
          year: '2017',
          field: 'Medical Laboratory Science'
        },
        {
          degree: 'Bachelor of Science',
          institution: 'University of Maryland',
          year: '2015',
          field: 'Biology'
        }
      ]
    },
    accountInfo: {
      username: 'sarah.johnson',
      emailVerified: true,
      phoneVerified: true,
      twoFactorEnabled: true,
      lastLogin: '2024-01-15T10:30:00Z',
      accountCreated: '2020-06-15T09:00:00Z',
      status: 'active',
      permissions: ['admin', 'blood_bank_manager', 'inventory_management', 'donor_management', 'quality_control']
    },
    preferences: {
      theme: 'system',
      language: 'English',
      timezone: 'America/New_York',
      notifications: {
        email: true,
        sms: false,
        push: true,
        criticalAlerts: true,
        inventoryAlerts: true,
        donorAlerts: false,
        requestAlerts: true,
        qualityAlerts: true,
        systemAlerts: false
      }
    },
    activity: {
      recentLogins: [
        {
          date: '2024-01-15T10:30:00Z',
          location: 'New York, NY',
          device: 'Chrome on Windows',
          ip: '192.168.1.100',
          status: 'success'
        },
        {
          date: '2024-01-14T16:45:00Z',
          location: 'New York, NY',
          device: 'Safari on iPhone',
          ip: '192.168.1.101',
          status: 'success'
        },
        {
          date: '2024-01-13T09:15:00Z',
          location: 'Unknown',
          device: 'Unknown',
          ip: '203.45.67.89',
          status: 'failed'
        }
      ],
      recentActions: [
        {
          action: 'Updated blood inventory',
          timestamp: '2024-01-15T10:25:00Z',
          details: 'Added 50 units of O+ blood',
          category: 'inventory'
        },
        {
          action: 'Approved donor request',
          timestamp: '2024-01-15T09:45:00Z',
          details: 'Approved donor ID: D-2024-001',
          category: 'donor'
        },
        {
          action: 'Generated quality report',
          timestamp: '2024-01-14T16:30:00Z',
          details: 'Monthly quality control report',
          category: 'quality'
        },
        {
          action: 'Updated system settings',
          timestamp: '2024-01-14T14:20:00Z',
          details: 'Modified notification preferences',
          category: 'settings'
        }
      ],
      statistics: {
        totalLogins: 1247,
        lastMonthLogins: 89,
        totalActions: 3456,
        lastMonthActions: 234
      }
    }
  };

  const [profile, setProfile] = useState<UserProfile>(mockProfile);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleNotification = (type: keyof UserProfile['preferences']['notifications']) => {
    setProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        notifications: {
          ...prev.preferences.notifications,
          [type]: !prev.preferences.notifications[type]
        }
      }
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'expired':
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <XCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'inventory': return <Droplets className="w-4 h-4 text-blue-500" />;
      case 'donor': return <Users className="w-4 h-4 text-green-500" />;
      case 'quality': return <Shield className="w-4 h-4 text-purple-500" />;
      case 'settings': return <SettingsIcon className="w-4 h-4 text-gray-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/bloodbank/dashboard')}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600">Manage your personal and professional information</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={loadProfile}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleSaveProfile}
                disabled={isLoading}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* Profile Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profile.personalInfo.avatar} alt={`${profile.personalInfo.firstName} ${profile.personalInfo.lastName}`} />
              <AvatarFallback className="text-2xl">
                {profile.personalInfo.firstName.charAt(0)}{profile.personalInfo.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-2xl font-bold">
                  {profile.personalInfo.firstName} {profile.personalInfo.lastName}
                </h2>
                <Badge className={getStatusColor(profile.accountInfo.status)}>
                  {getStatusIcon(profile.accountInfo.status)}
                  <span className="ml-1 capitalize">{profile.accountInfo.status}</span>
                </Badge>
              </div>
              <p className="text-lg text-gray-600 mb-2">{profile.professionalInfo.role}</p>
              <p className="text-gray-500 mb-4">{profile.professionalInfo.department}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{profile.personalInfo.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{profile.personalInfo.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPinIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{profile.personalInfo.city}, {profile.personalInfo.state}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Employee ID</div>
              <div className="font-semibold">{profile.professionalInfo.employeeId}</div>
              <div className="text-sm text-gray-500 mt-2">Experience</div>
              <div className="font-semibold">{profile.professionalInfo.experience} years</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="professional">Professional</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Logins</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{profile.activity.statistics.totalLogins.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +{profile.activity.statistics.lastMonthLogins} this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{profile.activity.statistics.totalActions.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +{profile.activity.statistics.lastMonthActions} this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Certifications</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{profile.professionalInfo.certifications.length}</div>
                <p className="text-xs text-muted-foreground">
                  {profile.professionalInfo.certifications.filter(c => c.status === 'active').length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Account Status</CardTitle>
                <ShieldIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Active</div>
                <p className="text-xs text-muted-foreground">
                  Last login: {new Date(profile.accountInfo.lastLogin).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profile.activity.recentActions.slice(0, 5).map((action, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0">
                      {getCategoryIcon(action.category)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{action.action}</p>
                      <p className="text-xs text-gray-500">{action.details}</p>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(action.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
                  <SettingsIcon className="w-5 h-5" />
                  <span className="text-sm">Settings</span>
                </Button>
                <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
                  <Shield className="w-5 h-5" />
                  <span className="text-sm">Security</span>
                </Button>
                <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
                  <Bell className="w-5 h-5" />
                  <span className="text-sm">Notifications</span>
                </Button>
                <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
                  <Download className="w-5 h-5" />
                  <span className="text-sm">Export Data</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Personal Tab */}
        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Personal Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profile.personalInfo.firstName}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, firstName: e.target.value }
                    }))}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profile.personalInfo.lastName}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, lastName: e.target.value }
                    }))}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.personalInfo.email}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, email: e.target.value }
                    }))}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={profile.personalInfo.phone}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, phone: e.target.value }
                    }))}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={profile.personalInfo.dateOfBirth}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, dateOfBirth: e.target.value }
                    }))}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={profile.personalInfo.gender}
                    onValueChange={(value) => setProfile(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, gender: value }
                    }))}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
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

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={profile.personalInfo.address}
                  onChange={(e) => setProfile(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, address: e.target.value }
                  }))}
                  disabled={!isEditing}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={profile.personalInfo.city}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, city: e.target.value }
                    }))}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={profile.personalInfo.state}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, state: e.target.value }
                    }))}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={profile.personalInfo.zipCode}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, zipCode: e.target.value }
                    }))}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={profile.personalInfo.country}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, country: e.target.value }
                    }))}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Professional Tab */}
        <TabsContent value="professional" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Briefcase className="w-5 h-5" />
                <span>Professional Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={profile.professionalInfo.role}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={profile.professionalInfo.department}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employeeId">Employee ID</Label>
                  <Input
                    id="employeeId"
                    value={profile.professionalInfo.employeeId}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hireDate">Hire Date</Label>
                  <Input
                    id="hireDate"
                    type="date"
                    value={profile.professionalInfo.hireDate}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supervisor">Supervisor</Label>
                  <Input
                    id="supervisor"
                    value={profile.professionalInfo.supervisor}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input
                    id="experience"
                    type="number"
                    value={profile.professionalInfo.experience}
                    disabled
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span>Certifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profile.professionalInfo.certifications.map((cert, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Award className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-medium">{cert.name}</p>
                        <p className="text-sm text-gray-500">{cert.issuingBody}</p>
                        <p className="text-xs text-gray-400">
                          Issued: {new Date(cert.issueDate).toLocaleDateString()} • 
                          Expires: {new Date(cert.expiryDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(cert.status)}>
                      {getStatusIcon(cert.status)}
                      <span className="ml-1 capitalize">{cert.status}</span>
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GraduationCap className="w-5 h-5" />
                <span>Education</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profile.professionalInfo.education.map((edu, index) => (
                  <div key={index} className="flex items-center space-x-3 p-4 border rounded-lg">
                    <GraduationCap className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-medium">{edu.degree} in {edu.field}</p>
                      <p className="text-sm text-gray-500">{edu.institution}</p>
                      <p className="text-xs text-gray-400">Graduated: {edu.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Specializations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Specializations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.professionalInfo.specializations.map((spec, index) => (
                  <Badge key={index} variant="secondary">
                    {spec}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          {/* Recent Logins */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Recent Login History</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profile.activity.recentLogins.map((login, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Globe className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">{login.device}</p>
                        <p className="text-xs text-gray-500">{login.location} • {login.ip}</p>
                        <p className="text-xs text-gray-400">{new Date(login.date).toLocaleString()}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(login.status)}>
                      {getStatusIcon(login.status)}
                      <span className="ml-1 capitalize">{login.status}</span>
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>Recent Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profile.activity.recentActions.map((action, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0">
                      {getCategoryIcon(action.category)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{action.action}</p>
                      <p className="text-xs text-gray-500">{action.details}</p>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(action.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Account Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={profile.accountInfo.username}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountCreated">Account Created</Label>
                  <Input
                    id="accountCreated"
                    value={new Date(profile.accountInfo.accountCreated).toLocaleDateString()}
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-blue-500" />
                    <div>
                      <Label className="text-sm font-medium">Email Verification</Label>
                      <p className="text-sm text-gray-500">Verify your email address</p>
                    </div>
                  </div>
                  <Badge className={profile.accountInfo.emailVerified ? getStatusColor('active') : getStatusColor('pending')}>
                    {profile.accountInfo.emailVerified ? 'Verified' : 'Pending'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-green-500" />
                    <div>
                      <Label className="text-sm font-medium">Phone Verification</Label>
                      <p className="text-sm text-gray-500">Verify your phone number</p>
                    </div>
                  </div>
                  <Badge className={profile.accountInfo.phoneVerified ? getStatusColor('active') : getStatusColor('pending')}>
                    {profile.accountInfo.phoneVerified ? 'Verified' : 'Pending'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-purple-500" />
                    <div>
                      <Label className="text-sm font-medium">Two-Factor Authentication</Label>
                      <p className="text-sm text-gray-500">Add an extra layer of security</p>
                    </div>
                  </div>
                  <Switch
                    checked={profile.accountInfo.twoFactorEnabled}
                    disabled
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="w-5 h-5" />
                <span>Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    value={profile.preferences.theme}
                    onValueChange={(value) => setProfile(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, theme: value as 'light' | 'dark' | 'system' }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={profile.preferences.language}
                    onValueChange={(value) => setProfile(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, language: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Spanish">Spanish</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Notification Preferences</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-blue-500" />
                      <Label className="text-sm">Email Notifications</Label>
                    </div>
                    <Switch
                      checked={profile.preferences.notifications.email}
                      onCheckedChange={() => handleToggleNotification('email')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <MessageSquare className="w-4 h-4 text-green-500" />
                      <Label className="text-sm">SMS Notifications</Label>
                    </div>
                    <Switch
                      checked={profile.preferences.notifications.sms}
                      onCheckedChange={() => handleToggleNotification('sms')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Bell className="w-4 h-4 text-purple-500" />
                      <Label className="text-sm">Push Notifications</Label>
                    </div>
                    <Switch
                      checked={profile.preferences.notifications.push}
                      onCheckedChange={() => handleToggleNotification('push')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <Label className="text-sm">Critical Alerts</Label>
                    </div>
                    <Switch
                      checked={profile.preferences.notifications.criticalAlerts}
                      onCheckedChange={() => handleToggleNotification('criticalAlerts')}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
