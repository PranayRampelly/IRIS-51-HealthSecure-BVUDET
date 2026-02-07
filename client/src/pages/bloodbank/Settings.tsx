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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import {
  Settings as SettingsIcon, User, Bell, Shield, Database, Globe, Palette,
  Eye, Plus, Search, RefreshCw, ArrowLeft, Users, Droplets,
  Heart, AlertTriangle, Clock, DollarSign, Activity, Save,
  Trash2, Edit, Copy, Download, Upload, Key, Lock, Unlock,
  Mail, Phone, MapPin, Building, Calendar, FileText, CheckCircle,
  XCircle, Info, HelpCircle, ExternalLink, MessageSquare, PhoneCall,
  Video, Send, Printer, Share2, Mail as MailIcon, DownloadCloud,
  UploadCloud, KeyRound, ShieldCheck, EyeOff, Eye as EyeIcon,
  BellOff, BellRing, Volume2, VolumeX, Smartphone, Monitor,
  Tablet, Globe as GlobeIcon, Moon, Sun, Monitor as MonitorIcon
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface UserSettings {
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
    department: string;
    avatar?: string;
  };
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
    dateFormat: string;
    currency: string;
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
  security: {
    twoFactorEnabled: boolean;
    lastPasswordChange: string;
    loginHistory: Array<{
      date: string;
      location: string;
      device: string;
      ip: string;
    }>;
    activeSessions: Array<{
      id: string;
      device: string;
      location: string;
      lastActive: string;
    }>;
  };
}

interface SystemSettings {
  bloodBank: {
    name: string;
    license: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    operatingHours: string;
    emergencyContact: string;
  };
  inventory: {
    criticalStockThreshold: number;
    expiryWarningDays: number;
    autoReorderEnabled: boolean;
    reorderThreshold: number;
    maxStorageCapacity: number;
  };
  quality: {
    testingRequired: boolean;
    quarantinePeriod: number;
    complianceReporting: boolean;
    qualityMetrics: boolean;
  };
  notifications: {
    emailServer: string;
    smsProvider: string;
    webhookUrl: string;
    alertFrequency: string;
  };
  integrations: {
    hospitalSystems: Array<{
      name: string;
      status: 'connected' | 'disconnected' | 'error';
      lastSync: string;
    }>;
    labSystems: Array<{
      name: string;
      status: 'connected' | 'disconnected' | 'error';
      lastSync: string;
    }>;
    governmentSystems: Array<{
      name: string;
      status: 'connected' | 'disconnected' | 'error';
      lastSync: string;
    }>;
  };
}

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Mock data for settings
  const mockUserSettings: UserSettings = {
    profile: {
      firstName: 'Dr. Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@bloodbank.com',
      phone: '+1-555-0123',
      role: 'Blood Bank Manager',
      department: 'Blood Bank Operations',
      avatar: '/avatars/sarah-johnson.jpg'
    },
    preferences: {
      theme: 'system',
      language: 'English',
      timezone: 'America/New_York',
      dateFormat: 'MM/DD/YYYY',
      currency: 'USD',
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
    security: {
      twoFactorEnabled: true,
      lastPasswordChange: '2024-01-10T14:30:00Z',
      loginHistory: [
        {
          date: '2024-01-15T10:30:00Z',
          location: 'New York, NY',
          device: 'Chrome on Windows',
          ip: '192.168.1.100'
        },
        {
          date: '2024-01-14T16:45:00Z',
          location: 'New York, NY',
          device: 'Safari on iPhone',
          ip: '192.168.1.101'
        }
      ],
      activeSessions: [
        {
          id: 'session-1',
          device: 'Chrome on Windows',
          location: 'New York, NY',
          lastActive: '2024-01-15T10:30:00Z'
        }
      ]
    }
  };

  const mockSystemSettings: SystemSettings = {
    bloodBank: {
      name: 'City General Blood Bank',
      license: 'BB-2024-001',
      address: '123 Medical Center Dr, New York, NY 10001',
      phone: '+1-555-0100',
      email: 'info@citygeneralbloodbank.com',
      website: 'https://citygeneralbloodbank.com',
      operatingHours: '24/7',
      emergencyContact: '+1-555-9999'
    },
    inventory: {
      criticalStockThreshold: 10,
      expiryWarningDays: 7,
      autoReorderEnabled: true,
      reorderThreshold: 20,
      maxStorageCapacity: 5000
    },
    quality: {
      testingRequired: true,
      quarantinePeriod: 24,
      complianceReporting: true,
      qualityMetrics: true
    },
    notifications: {
      emailServer: 'smtp.bloodbank.com',
      smsProvider: 'Twilio',
      webhookUrl: 'https://api.bloodbank.com/webhooks',
      alertFrequency: 'immediate'
    },
    integrations: {
      hospitalSystems: [
        {
          name: 'City General Hospital',
          status: 'connected',
          lastSync: '2024-01-15T10:00:00Z'
        },
        {
          name: 'Metro Medical Center',
          status: 'connected',
          lastSync: '2024-01-15T09:30:00Z'
        }
      ],
      labSystems: [
        {
          name: 'Central Lab Network',
          status: 'connected',
          lastSync: '2024-01-15T10:15:00Z'
        }
      ],
      governmentSystems: [
        {
          name: 'FDA Blood Safety',
          status: 'connected',
          lastSync: '2024-01-15T08:00:00Z'
        },
        {
          name: 'State Health Department',
          status: 'error',
          lastSync: '2024-01-14T16:00:00Z'
        }
      ]
    }
  };

  const [userSettings, setUserSettings] = useState<UserSettings>(mockUserSettings);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(mockSystemSettings);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async (section: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`${section} settings saved successfully`);
    } catch (error) {
      toast.error(`Failed to save ${section} settings`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleNotification = (type: keyof UserSettings['preferences']['notifications']) => {
    setUserSettings(prev => ({
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

  const handleToggleSystemSetting = (section: keyof SystemSettings, setting: string) => {
    setSystemSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [setting]: !(prev[section] as any)[setting]
      }
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800 border-green-200';
      case 'disconnected': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'disconnected': return <XCircle className="w-4 h-4 text-gray-500" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <XCircle className="w-4 h-4 text-gray-500" />;
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
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Manage your account and system preferences</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={loadSettings}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => handleSaveSettings(activeTab)}
            disabled={isLoading}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
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
                    value={userSettings.profile.firstName}
                    onChange={(e) => setUserSettings(prev => ({
                      ...prev,
                      profile: { ...prev.profile, firstName: e.target.value }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={userSettings.profile.lastName}
                    onChange={(e) => setUserSettings(prev => ({
                      ...prev,
                      profile: { ...prev.profile, lastName: e.target.value }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userSettings.profile.email}
                    onChange={(e) => setUserSettings(prev => ({
                      ...prev,
                      profile: { ...prev.profile, email: e.target.value }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={userSettings.profile.phone}
                    onChange={(e) => setUserSettings(prev => ({
                      ...prev,
                      profile: { ...prev.profile, phone: e.target.value }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={userSettings.profile.role}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={userSettings.profile.department}
                    onChange={(e) => setUserSettings(prev => ({
                      ...prev,
                      profile: { ...prev.profile, department: e.target.value }
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="w-5 h-5" />
                <span>Change Password</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? 'text' : 'password'}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Key className="w-4 h-4 mr-2" />
                Update Password
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="w-5 h-5" />
                <span>Display & Language</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    value={userSettings.preferences.theme}
                    onValueChange={(value) => setUserSettings(prev => ({
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
                    value={userSettings.preferences.language}
                    onValueChange={(value) => setUserSettings(prev => ({
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
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={userSettings.preferences.timezone}
                    onValueChange={(value) => setUserSettings(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, timezone: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={userSettings.preferences.currency}
                    onValueChange={(value) => setUserSettings(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, currency: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Notification Channels</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-blue-500" />
                    <div>
                      <Label className="text-sm font-medium">Email Notifications</Label>
                      <p className="text-sm text-gray-500">Receive notifications via email</p>
                    </div>
                  </div>
                  <Switch
                    checked={userSettings.preferences.notifications.email}
                    onCheckedChange={() => handleToggleNotification('email')}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="w-5 h-5 text-green-500" />
                    <div>
                      <Label className="text-sm font-medium">SMS Notifications</Label>
                      <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                    </div>
                  </div>
                  <Switch
                    checked={userSettings.preferences.notifications.sms}
                    onCheckedChange={() => handleToggleNotification('sms')}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Bell className="w-5 h-5 text-purple-500" />
                    <div>
                      <Label className="text-sm font-medium">Push Notifications</Label>
                      <p className="text-sm text-gray-500">Receive push notifications in browser</p>
                    </div>
                  </div>
                  <Switch
                    checked={userSettings.preferences.notifications.push}
                    onCheckedChange={() => handleToggleNotification('push')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5" />
                <span>Alert Types</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <Label className="text-sm">Critical Alerts</Label>
                  </div>
                  <Switch
                    checked={userSettings.preferences.notifications.criticalAlerts}
                    onCheckedChange={() => handleToggleNotification('criticalAlerts')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    <Label className="text-sm">Inventory Alerts</Label>
                  </div>
                  <Switch
                    checked={userSettings.preferences.notifications.inventoryAlerts}
                    onCheckedChange={() => handleToggleNotification('inventoryAlerts')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Users className="w-4 h-4 text-green-500" />
                    <Label className="text-sm">Donor Alerts</Label>
                  </div>
                  <Switch
                    checked={userSettings.preferences.notifications.donorAlerts}
                    onCheckedChange={() => handleToggleNotification('donorAlerts')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Heart className="w-4 h-4 text-red-500" />
                    <Label className="text-sm">Request Alerts</Label>
                  </div>
                  <Switch
                    checked={userSettings.preferences.notifications.requestAlerts}
                    onCheckedChange={() => handleToggleNotification('requestAlerts')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-4 h-4 text-purple-500" />
                    <Label className="text-sm">Quality Alerts</Label>
                  </div>
                  <Switch
                    checked={userSettings.preferences.notifications.qualityAlerts}
                    onCheckedChange={() => handleToggleNotification('qualityAlerts')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                                         <SettingsIcon className="w-4 h-4 text-gray-500" />
                     <Label className="text-sm">System Alerts</Label>
                  </div>
                  <Switch
                    checked={userSettings.preferences.notifications.systemAlerts}
                    onCheckedChange={() => handleToggleNotification('systemAlerts')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Two-Factor Authentication</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                </div>
                <Switch
                  checked={userSettings.security.twoFactorEnabled}
                  onCheckedChange={(checked) => setUserSettings(prev => ({
                    ...prev,
                    security: { ...prev.security, twoFactorEnabled: checked }
                  }))}
                />
              </div>
              {userSettings.security.twoFactorEnabled && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium text-green-800">Two-factor authentication is enabled</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Active Sessions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userSettings.security.activeSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Monitor className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">{session.device}</p>
                        <p className="text-xs text-gray-500">{session.location} • Last active: {new Date(session.lastActive).toLocaleString()}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Recent Login History</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userSettings.security.loginHistory.map((login, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Globe className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">{login.device}</p>
                        <p className="text-xs text-gray-500">{login.location} • {login.ip} • {new Date(login.date).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="w-5 h-5" />
                <span>Blood Bank Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Blood Bank Name</Label>
                  <Input
                    id="bankName"
                    value={systemSettings.bloodBank.name}
                    onChange={(e) => setSystemSettings(prev => ({
                      ...prev,
                      bloodBank: { ...prev.bloodBank, name: e.target.value }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license">License Number</Label>
                  <Input
                    id="license"
                    value={systemSettings.bloodBank.license}
                    onChange={(e) => setSystemSettings(prev => ({
                      ...prev,
                      bloodBank: { ...prev.bloodBank, license: e.target.value }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={systemSettings.bloodBank.address}
                    onChange={(e) => setSystemSettings(prev => ({
                      ...prev,
                      bloodBank: { ...prev.bloodBank, address: e.target.value }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={systemSettings.bloodBank.phone}
                    onChange={(e) => setSystemSettings(prev => ({
                      ...prev,
                      bloodBank: { ...prev.bloodBank, phone: e.target.value }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={systemSettings.bloodBank.email}
                    onChange={(e) => setSystemSettings(prev => ({
                      ...prev,
                      bloodBank: { ...prev.bloodBank, email: e.target.value }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={systemSettings.bloodBank.website}
                    onChange={(e) => setSystemSettings(prev => ({
                      ...prev,
                      bloodBank: { ...prev.bloodBank, website: e.target.value }
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Droplets className="w-5 h-5" />
                <span>Inventory Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="criticalThreshold">Critical Stock Threshold</Label>
                  <Input
                    id="criticalThreshold"
                    type="number"
                    value={systemSettings.inventory.criticalStockThreshold}
                    onChange={(e) => setSystemSettings(prev => ({
                      ...prev,
                      inventory: { ...prev.inventory, criticalStockThreshold: parseInt(e.target.value) }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiryWarning">Expiry Warning (Days)</Label>
                  <Input
                    id="expiryWarning"
                    type="number"
                    value={systemSettings.inventory.expiryWarningDays}
                    onChange={(e) => setSystemSettings(prev => ({
                      ...prev,
                      inventory: { ...prev.inventory, expiryWarningDays: parseInt(e.target.value) }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxCapacity">Maximum Storage Capacity</Label>
                  <Input
                    id="maxCapacity"
                    type="number"
                    value={systemSettings.inventory.maxStorageCapacity}
                    onChange={(e) => setSystemSettings(prev => ({
                      ...prev,
                      inventory: { ...prev.inventory, maxStorageCapacity: parseInt(e.target.value) }
                    }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Auto Reorder</Label>
                    <p className="text-sm text-gray-500">Automatically reorder when stock is low</p>
                  </div>
                  <Switch
                    checked={systemSettings.inventory.autoReorderEnabled}
                    onCheckedChange={() => handleToggleSystemSetting('inventory', 'autoReorderEnabled')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Quality Control Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Testing Required</Label>
                    <p className="text-sm text-gray-500">Require quality testing for all units</p>
                  </div>
                  <Switch
                    checked={systemSettings.quality.testingRequired}
                    onCheckedChange={() => handleToggleSystemSetting('quality', 'testingRequired')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Compliance Reporting</Label>
                    <p className="text-sm text-gray-500">Enable regulatory compliance reporting</p>
                  </div>
                  <Switch
                    checked={systemSettings.quality.complianceReporting}
                    onCheckedChange={() => handleToggleSystemSetting('quality', 'complianceReporting')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quarantinePeriod">Quarantine Period (Hours)</Label>
                  <Input
                    id="quarantinePeriod"
                    type="number"
                    value={systemSettings.quality.quarantinePeriod}
                    onChange={(e) => setSystemSettings(prev => ({
                      ...prev,
                      quality: { ...prev.quality, quarantinePeriod: parseInt(e.target.value) }
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="w-5 h-5" />
                <span>Hospital Systems</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemSettings.integrations.hospitalSystems.map((system, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Building className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-medium">{system.name}</p>
                        <p className="text-sm text-gray-500">Last sync: {new Date(system.lastSync).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(system.status)}>
                        {getStatusIcon(system.status)}
                        <span className="ml-1">{system.status}</span>
                      </Badge>
                      <Button variant="outline" size="sm">
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="w-5 h-5" />
                <span>Lab Systems</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemSettings.integrations.labSystems.map((system, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Database className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-medium">{system.name}</p>
                        <p className="text-sm text-gray-500">Last sync: {new Date(system.lastSync).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(system.status)}>
                        {getStatusIcon(system.status)}
                        <span className="ml-1">{system.status}</span>
                      </Badge>
                      <Button variant="outline" size="sm">
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Government Systems</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemSettings.integrations.governmentSystems.map((system, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="font-medium">{system.name}</p>
                        <p className="text-sm text-gray-500">Last sync: {new Date(system.lastSync).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(system.status)}>
                        {getStatusIcon(system.status)}
                        <span className="ml-1">{system.status}</span>
                      </Badge>
                      <Button variant="outline" size="sm">
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
