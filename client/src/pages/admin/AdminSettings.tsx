
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Server, 
  Shield, 
  Mail, 
  Database, 
  Key, 
  Bell,
  Globe,
  Users,
  Lock,
  Eye,
  AlertTriangle,
  Save,
  RefreshCw
} from 'lucide-react';

const AdminSettings = () => {
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    autoBackup: true,
    emailNotifications: true,
    smsNotifications: false,
    twoFactorRequired: true,
    sessionTimeout: '30',
    maxLoginAttempts: '5',
    passwordExpiry: '90'
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpServer: 'smtp.healthtech.com',
    smtpPort: '587',
    smtpUsername: 'noreply@healthtech.com',
    smtpPassword: '••••••••',
    fromEmail: 'noreply@healthtech.com',
    fromName: 'HealthTech Platform'
  });

  const systemMetrics = [
    { label: 'Database Size', value: '2.4 GB', status: 'normal' },
    { label: 'Storage Used', value: '67%', status: 'warning' },
    { label: 'Memory Usage', value: '45%', status: 'normal' },
    { label: 'CPU Load', value: '23%', status: 'normal' },
    { label: 'Active Connections', value: '342', status: 'normal' },
    { label: 'Response Time', value: '124ms', status: 'normal' }
  ];

  const recentBackups = [
    { date: '2024-06-04 02:00:00', size: '2.4 GB', status: 'completed', type: 'automatic' },
    { date: '2024-06-03 02:00:00', size: '2.3 GB', status: 'completed', type: 'automatic' },
    { date: '2024-06-02 14:30:00', size: '2.3 GB', status: 'completed', type: 'manual' },
    { date: '2024-06-02 02:00:00', size: '2.3 GB', status: 'completed', type: 'automatic' },
    { date: '2024-06-01 02:00:00', size: '2.2 GB', status: 'failed', type: 'automatic' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-montserrat font-bold text-health-teal">System Settings</h1>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Status
          </Button>
          <Button size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save All Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2 text-health-teal" />
                General System Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="platform-name">Platform Name</Label>
                    <Input id="platform-name" defaultValue="HealthTech Platform" />
                  </div>
                  <div>
                    <Label htmlFor="platform-url">Platform URL</Label>
                    <Input id="platform-url" defaultValue="https://healthtech.lovable.app" />
                  </div>
                  <div>
                    <Label htmlFor="admin-email">Admin Email</Label>
                    <Input id="admin-email" defaultValue="admin@healthtech.com" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select defaultValue="utc">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="utc">UTC</SelectItem>
                        <SelectItem value="est">Eastern Time</SelectItem>
                        <SelectItem value="pst">Pacific Time</SelectItem>
                        <SelectItem value="cst">Central Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="language">Default Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                    <Input 
                      id="session-timeout" 
                      value={systemSettings.sessionTimeout}
                      onChange={(e) => setSystemSettings({...systemSettings, sessionTimeout: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              
              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-health-teal">System Toggles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Maintenance Mode</Label>
                      <p className="text-sm text-health-blue-gray">Temporarily disable access for maintenance</p>
                    </div>
                    <Switch 
                      checked={systemSettings.maintenanceMode}
                      onCheckedChange={(checked) => setSystemSettings({...systemSettings, maintenanceMode: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto Backup</Label>
                      <p className="text-sm text-health-blue-gray">Enable automatic daily backups</p>
                    </div>
                    <Switch 
                      checked={systemSettings.autoBackup}
                      onCheckedChange={(checked) => setSystemSettings({...systemSettings, autoBackup: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-health-blue-gray">Send system notifications via email</p>
                    </div>
                    <Switch 
                      checked={systemSettings.emailNotifications}
                      onCheckedChange={(checked) => setSystemSettings({...systemSettings, emailNotifications: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-health-blue-gray">Send critical alerts via SMS</p>
                    </div>
                    <Switch 
                      checked={systemSettings.smsNotifications}
                      onCheckedChange={(checked) => setSystemSettings({...systemSettings, smsNotifications: checked})}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-health-teal" />
                Security Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="max-login-attempts">Max Login Attempts</Label>
                    <Input 
                      id="max-login-attempts" 
                      value={systemSettings.maxLoginAttempts}
                      onChange={(e) => setSystemSettings({...systemSettings, maxLoginAttempts: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="password-expiry">Password Expiry (days)</Label>
                    <Input 
                      id="password-expiry" 
                      value={systemSettings.passwordExpiry}
                      onChange={(e) => setSystemSettings({...systemSettings, passwordExpiry: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="encryption-level">Encryption Level</Label>
                    <Select defaultValue="aes256">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aes256">AES-256</SelectItem>
                        <SelectItem value="aes192">AES-192</SelectItem>
                        <SelectItem value="aes128">AES-128</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Two-Factor Authentication Required</Label>
                      <p className="text-sm text-health-blue-gray">Require 2FA for all admin accounts</p>
                    </div>
                    <Switch 
                      checked={systemSettings.twoFactorRequired}
                      onCheckedChange={(checked) => setSystemSettings({...systemSettings, twoFactorRequired: checked})}
                    />
                  </div>
                  <div className="p-4 rounded-lg bg-health-light-gray/50">
                    <h4 className="font-semibold text-health-teal mb-2">Security Status</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">SSL Certificate</span>
                        <Badge className="bg-health-success text-white">Valid</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Firewall Status</span>
                        <Badge className="bg-health-success text-white">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Intrusion Detection</span>
                        <Badge className="bg-health-success text-white">Monitoring</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-health-teal" />
                Email Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="smtp-server">SMTP Server</Label>
                    <Input 
                      id="smtp-server" 
                      value={emailSettings.smtpServer}
                      onChange={(e) => setEmailSettings({...emailSettings, smtpServer: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtp-port">SMTP Port</Label>
                    <Input 
                      id="smtp-port" 
                      value={emailSettings.smtpPort}
                      onChange={(e) => setEmailSettings({...emailSettings, smtpPort: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtp-username">SMTP Username</Label>
                    <Input 
                      id="smtp-username" 
                      value={emailSettings.smtpUsername}
                      onChange={(e) => setEmailSettings({...emailSettings, smtpUsername: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="from-email">From Email</Label>
                    <Input 
                      id="from-email" 
                      value={emailSettings.fromEmail}
                      onChange={(e) => setEmailSettings({...emailSettings, fromEmail: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="from-name">From Name</Label>
                    <Input 
                      id="from-name" 
                      value={emailSettings.fromName}
                      onChange={(e) => setEmailSettings({...emailSettings, fromName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtp-password">SMTP Password</Label>
                    <Input 
                      id="smtp-password" 
                      type="password"
                      value={emailSettings.smtpPassword}
                      onChange={(e) => setEmailSettings({...emailSettings, smtpPassword: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <Button variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Test Email Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2 text-health-teal" />
                Backup Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-health-teal">Create Manual Backup</h3>
                  <p className="text-sm text-health-blue-gray">Create an immediate backup of all system data</p>
                </div>
                <Button>
                  <Database className="h-4 w-4 mr-2" />
                  Start Backup
                </Button>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-semibold text-health-teal mb-4">Recent Backups</h3>
                <div className="space-y-3">
                  {recentBackups.map((backup, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-health-blue-gray/20">
                      <div>
                        <p className="font-medium text-health-charcoal">{backup.date}</p>
                        <p className="text-sm text-health-blue-gray">Size: {backup.size} • Type: {backup.type}</p>
                      </div>
                      <Badge className={backup.status === 'completed' ? 'bg-health-success text-white' : 'bg-health-danger text-white'}>
                        {backup.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2 text-health-teal" />
                System Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {systemMetrics.map((metric, index) => (
                  <div key={index} className="p-4 rounded-lg border border-health-blue-gray/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-health-charcoal">{metric.label}</span>
                      <Badge className={
                        metric.status === 'normal' ? 'bg-health-success text-white' :
                        metric.status === 'warning' ? 'bg-health-warning text-white' :
                        'bg-health-danger text-white'
                      }>
                        {metric.status}
                      </Badge>
                    </div>
                    <p className="text-xl font-bold text-health-teal mt-2">{metric.value}</p>
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

export default AdminSettings;
