import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Shield, Bell, Key, Smartphone, Globe, Lock, Save, LogOut, Download, Trash2, RefreshCw, Loader2, CheckCircle, XCircle, Eye, EyeOff, Monitor } from 'lucide-react';
import apiService from '@/services/api';
import BiometricRegistrationModal from '@/components/auth/BiometricRegistrationModal';
import { getProfileImageUrl } from '@/lib/utils';

const initialProfile = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  profileImage: '',
  emergencyContacts: [],
};

const initialPrivacy = {
  dataSharing: false,
  researchParticipation: false,
  marketingEmails: false,
  analyticsTracking: false,
};

const initialNotifications = {
  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: false,
  securityAlerts: true,
};

const tabs = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'security', label: 'Security', icon: Shield },
  { key: 'privacy', label: 'Privacy', icon: Globe },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'account', label: 'Account', icon: Key }
];

const AccountSettings = () => {
  // Profile
  const [profile, setProfile] = useState(initialProfile);
  const [editProfile, setEditProfile] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [image, setImage] = useState('');
  const [imageFile, setImageFile] = useState(null);

  // Security
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [twoFASecret, setTwoFASecret] = useState('');
  const [twoFACode, setTwoFACode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [passwordFields, setPasswordFields] = useState({ current: '', new: '', confirm: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionError, setSessionError] = useState('');
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [biometricError, setBiometricError] = useState<string | null>(null);
  const [biometricSuccess, setBiometricSuccess] = useState<string | null>(null);

  // Privacy
  const [privacy, setPrivacy] = useState(initialPrivacy);
  const [privacyLoading, setPrivacyLoading] = useState(false);
  const [privacySuccess, setPrivacySuccess] = useState('');

  // Notifications
  const [notifications, setNotifications] = useState(initialNotifications);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsSuccess, setNotificationsSuccess] = useState('');

  // Account actions
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountError, setAccountError] = useState('');
  const [accountSuccess, setAccountSuccess] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState('profile');

  // Fetch profile and settings on mount
  useEffect(() => {
    setProfileLoading(true);
    apiService.getCurrentUser()
      .then((data) => {
        setProfile({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phone || '',
          dateOfBirth: data.dateOfBirth || '',
          gender: data.gender || '',
          profileImage: data.profileImage || '',
          emergencyContacts: data.emergencyContacts || [],
        });
        setImage(data.profileImage || '');
        setPrivacy({
          dataSharing: data.preferences?.dataSharing ?? false,
          researchParticipation: data.preferences?.researchParticipation ?? false,
          marketingEmails: data.preferences?.marketingEmails ?? false,
          analyticsTracking: data.preferences?.analyticsTracking ?? false,
        });
        setNotifications({
          emailNotifications: data.preferences?.emailNotifications ?? true,
          smsNotifications: data.preferences?.smsNotifications ?? false,
          pushNotifications: data.preferences?.pushNotifications ?? false,
          securityAlerts: true,
        });
        setTwoFactorEnabled(data.twoFactorEnabled || false);
        setProfileLoading(false);
      })
      .catch(() => {
        setProfileError('Failed to load profile.');
        setProfileLoading(false);
      });
    // Fetch sessions (for session management)
    setSessionsLoading(true);
    apiService.getSessions()
      .then((data) => {
        setSessions(data.sessions || []);
        setSessionsLoading(false);
      })
      .catch(() => setSessionsLoading(false));
  }, []);

  // Profile handlers
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImage(URL.createObjectURL(file));
    }
  };
  const handleProfileSave = async () => {
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');
    try {
      // TODO: handle image upload if needed
      const updated = await apiService.updateProfile(profile);
      setProfile(updated);
      setEditProfile(false);
      setProfileSuccess('Profile updated successfully!');
    } catch (err) {
      setProfileError('Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  // Security handlers
  const handle2FASetup = async () => {
    setTwoFactorLoading(true);
    setSessionError('');
    try {
      const data = await apiService.setup2FA();
      setQrCode(data.qrCodeDataURL);
      setTwoFASecret(data.secret);
      setShow2FASetup(true);
    } catch (err) {
      setSessionError('Failed to start 2FA setup. Please try again.');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handle2FAVerify = async () => {
    setTwoFactorLoading(true);
    setSessionError('');
    try {
      const data = await apiService.verify2FA(twoFACode);
      setBackupCodes(data.backupCodes);
      setShowBackupCodes(true);
      setShow2FASetup(false);
      setTwoFactorEnabled(true);
      setProfileSuccess('2FA enabled successfully!');
    } catch (err) {
      setSessionError('Invalid 2FA code. Please try again.');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess('');
    try {
      await apiService.changePassword(passwordFields.current, passwordFields.new);
      setPasswordSuccess('Password changed successfully!');
      setPasswordFields({ current: '', new: '', confirm: '' });
    } catch (err) {
      setPasswordError('Failed to change password. Please check your current password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSessionRevoke = async (sessionId: string) => {
    setSessionsLoading(true);
    setSessionError('');
    try {
      await apiService.revokeSession(sessionId);
      setSessions(sessions.filter(s => s._id !== sessionId));
      setProfileSuccess('Session revoked successfully!');
    } catch (err) {
      setSessionError('Failed to revoke session.');
    } finally {
      setSessionsLoading(false);
    }
  };

  const handleLogoutAll = async () => {
    setAccountLoading(true);
    setAccountError('');
    try {
      await apiService.logoutAll();
      // Redirect to login page
      window.location.href = '/login';
    } catch (err) {
      setAccountError('Failed to logout from all devices.');
    } finally {
      setAccountLoading(false);
    }
  };

  // Privacy handlers
  const handlePrivacyChange = (key, value) => {
    setPrivacy((prev) => ({ ...prev, [key]: value }));
    setPrivacyLoading(true);
    apiService.updateProfile({ preferences: { ...privacy, [key]: value } })
      .then(() => {
        setPrivacySuccess('Privacy settings updated!');
        setTimeout(() => setPrivacySuccess(''), 2000);
      })
      .catch(() => setPrivacySuccess('Failed to update privacy.'))
      .finally(() => setPrivacyLoading(false));
  };

  // Notifications handlers
  const handleNotificationsChange = (key, value) => {
    setNotifications((prev) => ({ ...prev, [key]: value }));
    setNotificationsLoading(true);
    apiService.updateProfile({ preferences: { ...notifications, [key]: value } })
      .then(() => {
        setNotificationsSuccess('Notification preferences updated!');
        setTimeout(() => setNotificationsSuccess(''), 2000);
      })
      .catch(() => setNotificationsSuccess('Failed to update notifications.'))
      .finally(() => setNotificationsLoading(false));
  };

  // Account actions
  const handleDownloadData = async () => {
    setAccountLoading(true);
    try {
      const response = await apiService.downloadHealthData('zip');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'health-data.zip';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setAccountSuccess('Data download started!');
      setTimeout(() => setAccountSuccess(''), 2000);
    } catch (err) {
      setAccountError('Failed to download data.');
    } finally {
      setAccountLoading(false);
    }
  };
  const handleDeleteAccount = async () => {
    setAccountLoading(true);
    try {
      await apiService.deleteAccount();
      setAccountSuccess('Account deleted!');
      // Optionally redirect to goodbye page or login
    } catch (err) {
      setAccountError('Failed to delete account.');
    } finally {
      setAccountLoading(false);
    }
  };

  // Utility to format ISO date to yyyy-MM-dd
  function formatDateForInput(dateString) {
    if (!dateString) return '';
    return dateString.split('T')[0];
  }

  // UI
  return (
    <div className="w-full min-h-[calc(100vh-80px)] px-2 md:px-6 py-8 bg-health-light-gray max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-montserrat font-bold text-health-teal mb-1">Account Settings</h1>
        <p className="text-health-charcoal">Manage your account, security, privacy, and notifications in one place.</p>
      </div>

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

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <Card className="shadow-lg mb-8 w-full min-h-[340px] rounded-xl border-0">
          <CardHeader className="flex flex-row items-center gap-6 pb-2">
            <div className="relative group">
              <Avatar className="h-20 w-20 border-2 border-health-teal shadow-sm">
                <AvatarImage src={getProfileImageUrl(profile.profileImage)} />
                <AvatarFallback className="bg-health-teal text-white text-2xl">
                  {profile.firstName?.[0]}
                </AvatarFallback>
              </Avatar>
              {editProfile && (
                <label className="absolute bottom-0 right-0 bg-health-aqua p-1.5 rounded-full cursor-pointer shadow hover:bg-health-teal transition">
                  <Save className="h-4 w-4 text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl md:text-2xl font-bold text-health-teal mb-1 truncate">
                {profile.firstName} {profile.lastName}
              </CardTitle>
              <div className="flex items-center gap-2 text-health-blue-gray text-sm md:text-base truncate">
                <User className="h-4 w-4" />
                <span className="truncate">{profile.email}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 ml-auto">
              {!editProfile ? (
                <Button variant="outline" onClick={() => setEditProfile(true)} className="px-3 py-1 text-sm">
                  <Save className="h-4 w-4 mr-1" /> Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleProfileSave} className="px-3 py-1 text-sm">
                    <Save className="h-4 w-4 mr-1" /> Save
                  </Button>
                  <Button variant="destructive" onClick={() => setEditProfile(false)} className="px-3 py-1 text-sm">
                    <XCircle className="h-4 w-4 mr-1" /> Cancel
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div>
              <label className="block text-health-blue-gray font-medium mb-1">First Name</label>
              <Input name="firstName" value={profile.firstName} onChange={handleProfileChange} disabled={!editProfile} />
            </div>
            <div>
              <label className="block text-health-blue-gray font-medium mb-1">Last Name</label>
              <Input name="lastName" value={profile.lastName} onChange={handleProfileChange} disabled={!editProfile} />
            </div>
            <div>
              <label className="block text-health-blue-gray font-medium mb-1">Email Address</label>
              <Input name="email" value={profile.email} onChange={handleProfileChange} disabled={!editProfile} />
            </div>
            <div>
              <label className="block text-health-blue-gray font-medium mb-1">Date of Birth</label>
              <Input type="date" name="dateOfBirth" value={formatDateForInput(profile.dateOfBirth)} onChange={handleProfileChange} disabled={!editProfile} />
            </div>
            <div>
              <label className="block text-health-blue-gray font-medium mb-1">Gender</label>
              <Input name="gender" value={profile.gender} onChange={handleProfileChange} disabled={!editProfile} />
            </div>
            <div>
              <label className="block text-health-blue-gray font-medium mb-1">Phone</label>
              <Input name="phone" value={profile.phone} onChange={handleProfileChange} disabled={!editProfile} />
            </div>
          </CardContent>
          {profileError && <div className="text-center text-red-600 font-semibold mb-2">{profileError}</div>}
          {profileSuccess && <div className="text-center text-green-600 font-semibold mb-2">{profileSuccess}</div>}
          {profileLoading && <div className="text-center py-4"><Loader2 className="animate-spin mx-auto text-health-teal" /></div>}
        </Card>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <Card className="shadow-lg mb-8 w-full min-h-[340px] rounded-xl border-0">
          <CardHeader className="flex flex-row items-center gap-6 pb-2">
            <Lock className="w-8 h-8 text-health-teal mr-2" />
            <CardTitle className="text-xl md:text-2xl font-bold text-health-teal mb-1">Security Settings</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Two-Factor Authentication</h3>
                <p className="text-sm text-health-charcoal/70">
                  Add an extra layer of security to your account
                </p>
              </div>
              {!twoFactorEnabled ? (
                <Button onClick={handle2FASetup} disabled={twoFactorLoading}>
                  {twoFactorLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <Smartphone className="w-4 h-4 mr-2" />} Enable 2FA
                </Button>
              ) : (
                <Button variant="destructive" onClick={() => setShow2FASetup(true)} disabled={twoFactorLoading}>
                  Disable 2FA
                </Button>
              )}
            </div>
            {show2FASetup && (
              <div className="bg-health-light-gray p-4 rounded-lg flex flex-col items-center">
                <div className="mb-2 font-semibold">Scan this QR code with your authenticator app:</div>
                {qrCode && <img src={qrCode} alt="2FA QR Code" className="mb-2 w-40 h-40" />}
                <Input
                  placeholder="Enter code from app"
                  value={twoFACode}
                  onChange={e => setTwoFACode(e.target.value)}
                  className="mb-2 w-60 text-center"
                />
                <Button onClick={handle2FAVerify} disabled={twoFactorLoading || !twoFACode}>
                  {twoFactorLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <CheckCircle className="w-4 h-4 mr-2" />} Verify & Enable
                </Button>
              </div>
            )}
            {showBackupCodes && backupCodes.length > 0 && (
              <div className="mt-3 space-y-1 bg-white p-4 rounded shadow">
                <div className="font-semibold text-health-teal mb-2">Backup Codes:</div>
                {backupCodes.map((code, idx) => (
                  <div key={idx} className="text-xs bg-health-light-gray rounded px-2 py-1 border inline-block mr-2 mb-1">{code}</div>
                ))}
                <div className="text-xs text-health-charcoal/70 mt-2">Store these codes securely. Each can be used once if you lose access to your authenticator app.</div>
              </div>
            )}
            <div className="space-y-4 mt-8">
              <h3 className="font-medium">Change Password</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" value={passwordFields.current} onChange={e => setPasswordFields(f => ({ ...f, current: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" value={passwordFields.new} onChange={e => setPasswordFields(f => ({ ...f, new: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" value={passwordFields.confirm} onChange={e => setPasswordFields(f => ({ ...f, confirm: e.target.value }))} />
                </div>
              </div>
              <Button variant="outline" onClick={handlePasswordChange} disabled={passwordLoading}>
                <Lock className="w-4 h-4 mr-2" />
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </Button>
              {passwordError && <div className="text-red-600 text-sm mt-1">{passwordError}</div>}
              {passwordSuccess && <div className="text-green-600 text-sm mt-1">{passwordSuccess}</div>}
            </div>
            <div className="mt-8">
              <h3 className="font-medium mb-2 flex items-center gap-2"><Monitor className="w-4 h-4" /> Active Sessions</h3>
              {sessionsLoading ? (
                <Loader2 className="animate-spin text-health-teal" />
              ) : (
                <div className="space-y-2">
                  {sessions.length === 0 && <div className="text-sm text-gray-500">No active sessions.</div>}
                  {sessions.map((session) => (
                    <div key={session._id} className="flex items-center justify-between bg-white rounded p-2 border">
                      <div>
                        <div className="font-medium">{session.device || 'Device'}</div>
                        <div className="text-xs text-gray-500">{session.ip || 'IP'} | {session.lastActive || 'Last Active'}</div>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => handleSessionRevoke(session._id)}>
                        <LogOut className="w-4 h-4 mr-1" /> Revoke
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              {sessionError && <div className="text-red-600 text-sm mt-1">{sessionError}</div>}
            </div>
            <Button
              className="w-fit bg-health-teal text-white font-semibold"
              onClick={() => { setShowBiometricModal(true); setBiometricError(null); setBiometricSuccess(null); }}
            >
              Register New Biometric
            </Button>
            {biometricSuccess && <div className="text-green-600 font-semibold mt-2">{biometricSuccess}</div>}
            {biometricError && <div className="text-red-500 font-semibold mt-2">{biometricError}</div>}
            <BiometricRegistrationModal
              open={showBiometricModal}
              onSuccess={() => { setShowBiometricModal(false); setBiometricSuccess('Biometric device registered successfully!'); }}
              onError={err => setBiometricError(err)}
              error={biometricError}
              onClose={() => setShowBiometricModal(false)}
            />
          </CardContent>
        </Card>
      )}

      {/* Privacy Tab */}
      {activeTab === 'privacy' && (
        <Card className="shadow-lg mb-8 w-full min-h-[340px] rounded-xl border-0">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-health-teal flex items-center gap-2">
              <Globe className="w-5 h-5" /> Privacy Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Data Sharing</h3>
                  <p className="text-sm text-health-charcoal/70">
                    Allow sharing of anonymized data for healthcare improvements
                  </p>
                </div>
                <Switch checked={privacy.dataSharing} onCheckedChange={v => handlePrivacyChange('dataSharing', v)} disabled={privacyLoading} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Research Participation</h3>
                  <p className="text-sm text-health-charcoal/70">
                    Participate in medical research studies
                  </p>
                </div>
                <Switch checked={privacy.researchParticipation} onCheckedChange={v => handlePrivacyChange('researchParticipation', v)} disabled={privacyLoading} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Marketing Emails</h3>
                  <p className="text-sm text-health-charcoal/70">
                    Receive updates about new features and services
                  </p>
                </div>
                <Switch checked={privacy.marketingEmails} onCheckedChange={v => handlePrivacyChange('marketingEmails', v)} disabled={privacyLoading} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Analytics Tracking</h3>
                  <p className="text-sm text-health-charcoal/70">
                    Help improve our platform with usage analytics
                  </p>
                </div>
                <Switch checked={privacy.analyticsTracking} onCheckedChange={v => handlePrivacyChange('analyticsTracking', v)} disabled={privacyLoading} />
              </div>
            </div>
            {privacySuccess && <div className="text-green-600 text-sm mt-1">{privacySuccess}</div>}
          </CardContent>
        </Card>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <Card className="shadow-lg mb-8 w-full min-h-[340px] rounded-xl border-0">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-health-teal flex items-center gap-2">
              <Bell className="w-5 h-5" /> Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Email Notifications</h3>
                  <p className="text-sm text-health-charcoal/70">
                    Receive notifications via email
                  </p>
                </div>
                <Switch checked={notifications.emailNotifications} onCheckedChange={v => handleNotificationsChange('emailNotifications', v)} disabled={notificationsLoading} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">SMS Notifications</h3>
                  <p className="text-sm text-health-charcoal/70">
                    Receive important updates via SMS
                  </p>
                </div>
                <Switch checked={notifications.smsNotifications} onCheckedChange={v => handleNotificationsChange('smsNotifications', v)} disabled={notificationsLoading} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Push Notifications</h3>
                  <p className="text-sm text-health-charcoal/70">
                    Receive browser push notifications
                  </p>
                </div>
                <Switch checked={notifications.pushNotifications} onCheckedChange={v => handleNotificationsChange('pushNotifications', v)} disabled={notificationsLoading} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Security Alerts</h3>
                  <p className="text-sm text-health-charcoal/70">
                    Always receive security-related notifications
                  </p>
                </div>
                <Switch checked={notifications.securityAlerts} disabled />
              </div>
            </div>
            {notificationsSuccess && <div className="text-green-600 text-sm mt-1">{notificationsSuccess}</div>}
          </CardContent>
        </Card>
      )}

      {/* Account Tab */}
      {activeTab === 'account' && (
        <Card className="shadow-lg mb-8 w-full min-h-[340px] rounded-xl border-0">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-health-teal flex items-center gap-2">
              <Key className="w-5 h-5" /> Account Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <Button variant="outline" onClick={handleDownloadData} disabled={accountLoading}>
                <Download className="w-4 h-4 mr-2" /> Download My Data
              </Button>
              <Button variant="outline" onClick={handleLogoutAll} disabled={accountLoading}>
                <LogOut className="w-4 h-4 mr-2" /> Logout All Devices
              </Button>
              <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)} disabled={accountLoading}>
                <Trash2 className="w-4 h-4 mr-2" /> Delete Account
              </Button>
            </div>
            {accountSuccess && <div className="text-green-600 text-sm mt-1">{accountSuccess}</div>}
            {accountError && <div className="text-red-600 text-sm mt-1">{accountError}</div>}
            {accountLoading && <Loader2 className="animate-spin text-health-teal" />}
            {showDeleteConfirm && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded p-4">
                <div className="font-semibold text-red-600 mb-2">Are you sure you want to delete your account? This action cannot be undone.</div>
                <div className="flex gap-4">
                  <Button variant="destructive" onClick={handleDeleteAccount} disabled={accountLoading}>
                    <Trash2 className="w-4 h-4 mr-2" /> Yes, Delete
                  </Button>
                  <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} disabled={accountLoading}>
                    <XCircle className="w-4 h-4 mr-2" /> Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Success/Error Messages */}
      {accountSuccess && <div className="text-center text-green-600 font-semibold mb-4">{accountSuccess}</div>}
      {accountError && <div className="text-center text-red-600 font-semibold mb-4">{accountError}</div>}
    </div>
  );
};

export default AccountSettings; 