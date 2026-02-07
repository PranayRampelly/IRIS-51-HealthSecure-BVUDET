
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { User, Shield, Bell, Stethoscope, Calendar, Building, Save } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { getProfileImageUrl } from '@/lib/utils';

const DoctorSettings = () => {
  const [profile, setProfile] = useState({
    firstName: 'Dr. Sarah',
    lastName: 'Johnson',
    email: 'dr.sarah.johnson@cityhospital.com',
    phone: '+1 (555) 123-4567',
    specialty: 'Internal Medicine',
    licenseNumber: 'MD-123456789',
    hospital: 'City General Hospital',
    department: 'Internal Medicine',
    yearsOfExperience: '15',
    bio: 'Board-certified internist with extensive experience in preventive care and chronic disease management.',
    profileImage: ''
  });

  const [scheduleSettings, setScheduleSettings] = useState({
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    startTime: '09:00',
    endTime: '17:00',
    appointmentDuration: '30',
    lunchBreakStart: '12:00',
    lunchBreakEnd: '13:00'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    newPatientRequests: true,
    appointmentReminders: true,
    proofRequests: true,
    emergencyAlerts: true,
    weeklyReports: false
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    allowPatientMessages: true,
    shareResearchData: false,
    allowPeerConsultation: true
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:8080/api/doctor/settings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile({
          firstName: res.data.firstName || '',
          lastName: res.data.lastName || '',
          email: res.data.email || '',
          phone: res.data.phone || '',
          specialty: res.data.specialty || res.data.specialization || '',
          licenseNumber: res.data.licenseNumber || '',
          hospital: res.data.hospital || '',
          department: res.data.department || '',
          yearsOfExperience: res.data.yearsOfExperience || '',
          bio: res.data.bio || '',
          profileImage: res.data.profileImage || ''
        });
        setScheduleSettings(res.data.scheduleSettings || {
          workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          startTime: '09:00',
          endTime: '17:00',
          appointmentDuration: '30',
          lunchBreakStart: '12:00',
          lunchBreakEnd: '13:00'
        });
        setNotificationSettings(res.data.notificationSettings || {
          newPatientRequests: true,
          appointmentReminders: true,
          proofRequests: true,
          emergencyAlerts: true,
          weeklyReports: false
        });
        setPrivacySettings(res.data.privacySettings || {
          profileVisibility: 'public',
          allowPatientMessages: true,
          shareResearchData: false,
          allowPeerConsultation: true
        });
        setAvatarFile(null);
      } catch (e) {
        toast.error('Failed to load profile');
      }
      setLoading(false);
    }
    fetchProfile();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-montserrat font-bold text-health-teal">Settings</h1>
        <p className="text-health-charcoal mt-2">Manage your professional profile and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Professional Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={avatarFile ? URL.createObjectURL(avatarFile) : getProfileImageUrl(profile.profileImage) || "/placeholder.svg"} />
                    <AvatarFallback className="bg-health-teal text-white text-lg">
                      {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <input type="file" accept="image/*" style={{ display: 'none' }} id="avatar-upload" onChange={e => setAvatarFile(e.target.files?.[0] || null)} />
                    <Button variant="outline" onClick={() => document.getElementById('avatar-upload')?.click()}>Change Photo</Button>
                    <p className="text-sm text-health-charcoal/70 mt-2">
                      Professional headshot recommended. JPG, GIF or PNG. 1MB max.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profile.firstName}
                      onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profile.lastName}
                      onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="specialty">Medical Specialty</Label>
                    <Select value={profile.specialty} onValueChange={(value) => setProfile({...profile, specialty: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Internal Medicine">Internal Medicine</SelectItem>
                        <SelectItem value="Cardiology">Cardiology</SelectItem>
                        <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                        <SelectItem value="Neurology">Neurology</SelectItem>
                        <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                        <SelectItem value="Psychiatry">Psychiatry</SelectItem>
                        <SelectItem value="Family Medicine">Family Medicine</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="licenseNumber">Medical License Number</Label>
                    <Input
                      id="licenseNumber"
                      value={profile.licenseNumber}
                      onChange={(e) => setProfile({...profile, licenseNumber: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="hospital">Hospital/Clinic</Label>
                    <Input
                      id="hospital"
                      value={profile.hospital}
                      onChange={(e) => setProfile({...profile, hospital: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={profile.department}
                      onChange={(e) => setProfile({...profile, department: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                    <Input
                      id="yearsOfExperience"
                      value={profile.yearsOfExperience}
                      onChange={(e) => setProfile({...profile, yearsOfExperience: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Professional Bio</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => setProfile({...profile, bio: e.target.value})}
                    rows={4}
                    placeholder="Brief description of your medical background and areas of expertise..."
                  />
                </div>

                <Button className="bg-health-teal hover:bg-health-teal/90 text-white" onClick={async () => {
                  try {
                    const token = localStorage.getItem('token');
                    const formData = new FormData();
                    Object.entries(profile).forEach(([k, v]) => formData.append(k, v));
                    if (avatarFile) formData.append('avatar', avatarFile);
                    formData.append('scheduleSettings', JSON.stringify(scheduleSettings));
                    formData.append('notificationSettings', JSON.stringify(notificationSettings));
                    formData.append('privacySettings', JSON.stringify(privacySettings));
                    await axios.put('http://localhost:8080/api/doctor/settings', formData, {
                      headers: { Authorization: `Bearer ${token}` }
                    });
                    toast.success('Profile and settings updated!');
                  } catch (e) {
                    toast.error('Failed to update settings');
                  }
                }}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="schedule">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Working Schedule</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Working Days</Label>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={day}
                          checked={scheduleSettings.workingDays.includes(day)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setScheduleSettings({
                                ...scheduleSettings,
                                workingDays: [...scheduleSettings.workingDays, day]
                              });
                            } else {
                              setScheduleSettings({
                                ...scheduleSettings,
                                workingDays: scheduleSettings.workingDays.filter(d => d !== day)
                              });
                            }
                          }}
                          className="rounded border-health-blue-gray"
                        />
                        <Label htmlFor={day} className="capitalize">{day}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={scheduleSettings.startTime}
                      onChange={(e) => setScheduleSettings({...scheduleSettings, startTime: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={scheduleSettings.endTime}
                      onChange={(e) => setScheduleSettings({...scheduleSettings, endTime: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="appointmentDuration">Default Appointment Duration (minutes)</Label>
                    <Select 
                      value={scheduleSettings.appointmentDuration} 
                      onValueChange={(value) => setScheduleSettings({...scheduleSettings, appointmentDuration: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="lunchBreakStart">Lunch Break Start</Label>
                    <Input
                      id="lunchBreakStart"
                      type="time"
                      value={scheduleSettings.lunchBreakStart}
                      onChange={(e) => setScheduleSettings({...scheduleSettings, lunchBreakStart: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lunchBreakEnd">Lunch Break End</Label>
                    <Input
                      id="lunchBreakEnd"
                      type="time"
                      value={scheduleSettings.lunchBreakEnd}
                      onChange={(e) => setScheduleSettings({...scheduleSettings, lunchBreakEnd: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Notification Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">New Patient Requests</h3>
                      <p className="text-sm text-health-charcoal/70">
                        Get notified when patients request appointments
                      </p>
                    </div>
                    <Switch 
                      checked={notificationSettings.newPatientRequests} 
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, newPatientRequests: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Appointment Reminders</h3>
                      <p className="text-sm text-health-charcoal/70">
                        Receive reminders about upcoming appointments
                      </p>
                    </div>
                    <Switch 
                      checked={notificationSettings.appointmentReminders} 
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, appointmentReminders: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Proof Requests</h3>
                      <p className="text-sm text-health-charcoal/70">
                        Get notified when proof verification is needed
                      </p>
                    </div>
                    <Switch 
                      checked={notificationSettings.proofRequests} 
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, proofRequests: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Emergency Alerts</h3>
                      <p className="text-sm text-health-charcoal/70">
                        Urgent notifications for emergency situations
                      </p>
                    </div>
                    <Switch 
                      checked={notificationSettings.emergencyAlerts} 
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emergencyAlerts: checked})}
                      disabled
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Weekly Reports</h3>
                      <p className="text-sm text-health-charcoal/70">
                        Receive weekly summary of patient activities
                      </p>
                    </div>
                    <Switch 
                      checked={notificationSettings.weeklyReports} 
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, weeklyReports: checked})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="privacy">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Privacy & Professional Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label>Profile Visibility</Label>
                    <Select 
                      value={privacySettings.profileVisibility} 
                      onValueChange={(value) => setPrivacySettings({...privacySettings, profileVisibility: value})}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public - Visible to all patients</SelectItem>
                        <SelectItem value="hospital">Hospital Only - Visible to hospital network</SelectItem>
                        <SelectItem value="private">Private - Not visible in searches</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Allow Patient Messages</h3>
                      <p className="text-sm text-health-charcoal/70">
                        Let patients send you direct messages
                      </p>
                    </div>
                    <Switch 
                      checked={privacySettings.allowPatientMessages} 
                      onCheckedChange={(checked) => setPrivacySettings({...privacySettings, allowPatientMessages: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Share Research Data</h3>
                      <p className="text-sm text-health-charcoal/70">
                        Contribute anonymized data to medical research
                      </p>
                    </div>
                    <Switch 
                      checked={privacySettings.shareResearchData} 
                      onCheckedChange={(checked) => setPrivacySettings({...privacySettings, shareResearchData: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Allow Peer Consultation</h3>
                      <p className="text-sm text-health-charcoal/70">
                        Enable other doctors to request consultations
                      </p>
                    </div>
                    <Switch 
                      checked={privacySettings.allowPeerConsultation} 
                      onCheckedChange={(checked) => setPrivacySettings({...privacySettings, allowPeerConsultation: checked})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DoctorSettings;
