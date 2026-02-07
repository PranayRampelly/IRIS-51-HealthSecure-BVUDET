import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Settings, Building, Shield, Database, 
  Bell, Users, Activity, Cog
} from 'lucide-react';

const HospitalSettings: React.FC = () => {
  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hospital Settings</h1>
          <p className="text-gray-600 mt-2">Configure hospital system settings and preferences</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Activity className="w-4 h-4 mr-2" />
            System Status
          </Button>
          <Button>
            <Settings className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Settings Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Hospital Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="w-5 h-5 mr-2" />
              Hospital Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Hospital Name</label>
              <Input defaultValue="HealthSecure General Hospital" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Address</label>
              <Input defaultValue="123 Medical Center Dr, Healthcare City" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <Input defaultValue="+1-555-0123" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input defaultValue="info@healthsecure.com" className="mt-1" />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Two-Factor Authentication</span>
              <Badge className="bg-green-100 text-green-800">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Session Timeout</span>
              <Badge variant="outline">30 minutes</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Password Policy</span>
              <Badge className="bg-green-100 text-green-800">Strong</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Data Encryption</span>
              <Badge className="bg-green-100 text-green-800">AES-256</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Email Notifications</span>
              <Badge className="bg-green-100 text-green-800">On</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">SMS Alerts</span>
              <Badge variant="outline">Off</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Emergency Alerts</span>
              <Badge className="bg-green-100 text-green-800">On</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">System Updates</span>
              <Badge variant="outline">Weekly</Badge>
            </div>
          </CardContent>
        </Card>

        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Active Users</span>
              <Badge variant="outline">67</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Role-Based Access</span>
              <Badge className="bg-green-100 text-green-800">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">User Registration</span>
              <Badge variant="outline">Admin Only</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Session Management</span>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="w-5 h-5 mr-2" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Backup Frequency</span>
              <Badge variant="outline">Daily</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Data Retention</span>
              <Badge variant="outline">7 years</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Storage Used</span>
              <Badge variant="outline">45%</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Auto Cleanup</span>
              <Badge className="bg-green-100 text-green-800">Enabled</Badge>
            </div>
          </CardContent>
        </Card>

        {/* System Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Cog className="w-5 h-5 mr-2" />
              System Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">System Version</span>
              <Badge variant="outline">v2.1.4</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Maintenance Mode</span>
              <Badge variant="outline">Off</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">API Rate Limiting</span>
              <Badge className="bg-green-100 text-green-800">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Debug Mode</span>
              <Badge variant="outline">Disabled</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium">Performance Settings</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Cache Duration</span>
                  <select className="px-2 py-1 border rounded text-sm">
                    <option>1 hour</option>
                    <option>6 hours</option>
                    <option>24 hours</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Max Concurrent Users</span>
                  <Input type="number" defaultValue="100" className="w-20" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Session Storage</span>
                  <select className="px-2 py-1 border rounded text-sm">
                    <option>Database</option>
                    <option>Redis</option>
                    <option>Memory</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium">Integration Settings</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">HL7 Integration</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">DICOM Support</span>
                  <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Insurance APIs</span>
                  <Badge variant="outline">Configured</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Lab Integration</span>
                  <Badge className="bg-green-100 text-green-800">Connected</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HospitalSettings; 