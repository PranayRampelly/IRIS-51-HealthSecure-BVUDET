
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Settings, User, Bell, Shield, Key, Database, Clock, Mail } from 'lucide-react';
import insuranceSettingsService, { InsuranceSettings } from '@/services/insuranceSettingsService';
import { useToast } from '@/hooks/use-toast';

const InsuranceSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Partial<InsuranceSettings>>({});
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notification and other toggles (for demo, you can map these to settings fields)
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [autoValidation, setAutoValidation] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  useEffect(() => {
    setLoading(true);
    insuranceSettingsService.getSettings()
      .then((data) => {
        setSettings(data || {});
        if (data?.companyLogo?.url) setLogoPreview(data.companyLogo.url);
        // Optionally set toggles from backend data
        setEmailNotifications(!!data.notificationEmail);
        setAutoValidation(!!data.autoSaveReports);
      })
      .catch(() => toast({ title: 'Error', description: 'Failed to load settings', variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setSettings((prev) => ({ ...prev, [id]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updated = await insuranceSettingsService.updateSettings(settings, logoFile || undefined);
      setSettings(updated.settings);
      if (updated.settings.companyLogo?.url) setLogoPreview(updated.settings.companyLogo.url);
      toast({ title: 'Settings Saved', description: 'Your changes have been saved.' });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to save settings', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-montserrat font-bold text-health-teal">Settings</h1>
          <p className="text-health-charcoal mt-2">Manage your insurance account settings and preferences</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Profile Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input id="companyName" value={settings.companyName || ''} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="contactPerson">Contact Person</Label>
                    <Input id="contactPerson" value={settings.contactPerson || ''} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="contactEmail">Email Address</Label>
                    <Input id="contactEmail" type="email" value={settings.contactEmail || ''} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="contactPhone">Phone Number</Label>
                    <Input id="contactPhone" value={settings.contactPhone || ''} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="companyLogo">Company Logo</Label>
                    <div className="flex items-center space-x-4">
                      {logoPreview && <img src={logoPreview} alt="Logo" className="h-12 w-12 rounded border" />}
                      <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                        Upload Logo
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoChange}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address">Business Address</Label>
                    <Input id="address" value={settings.address || ''} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="exportFormat">Default Export Format</Label>
                    <Select value={settings.exportFormat || 'pdf'} onValueChange={(value) => setSettings((prev) => ({ ...prev, exportFormat: value as 'pdf' | 'csv' }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <Switch checked={!!settings.autoSaveReports} onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, autoSaveReports: checked }))} />
                    <Label>Auto-save Generated Reports</Label>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <Switch checked={!!settings.includeMetadata} onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, includeMetadata: checked }))} />
                    <Label>Include Metadata in Reports</Label>
                  </div>
                </div>
              </div>
              <Button className="bg-health-teal hover:bg-health-teal/90 text-white" onClick={handleSave} disabled={loading}>
                {loading ? 'Saving...' : 'Save Profile Changes'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
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
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-health-charcoal/70">Receive updates via email</p>
                  </div>
                  <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-health-charcoal/70">Receive updates via text message</p>
                  </div>
                  <Switch checked={smsNotifications} onCheckedChange={setSmsNotifications} />
                </div>
                <Separator />
                <div className="space-y-3">
                  <Label>Notification Types</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">New claim submissions</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Proof validation results</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">High-risk claims</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">System maintenance alerts</span>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Weekly reports</span>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
              <Button className="bg-health-teal hover:bg-health-teal/90 text-white">
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Security Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-health-charcoal/70">Add an extra layer of security</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch checked={twoFactorAuth} onCheckedChange={setTwoFactorAuth} />
                      {twoFactorAuth && <Badge className="bg-health-success text-white">Enabled</Badge>}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <Label>Session Timeout</Label>
                    <Select defaultValue="30">
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator />
                  <div>
                    <Label>Password Requirements</Label>
                    <div className="mt-2 space-y-2 text-sm text-health-charcoal/70">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-health-success rounded-full"></div>
                        <span>Minimum 12 characters</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-health-success rounded-full"></div>
                        <span>Include uppercase and lowercase letters</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-health-success rounded-full"></div>
                        <span>Include numbers and special characters</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Button className="bg-health-teal hover:bg-health-teal/90 text-white">
                  Update Security Settings
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Key className="w-5 h-5" />
                  <span>API Keys & Access</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Production API Key</Label>
                  <div className="flex space-x-2">
                    <Input type="password" value="••••••••••••••••••••••••••••••••" readOnly />
                    <Button variant="outline">Regenerate</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Test API Key</Label>
                  <div className="flex space-x-2">
                    <Input type="password" value="••••••••••••••••••••••••••••••••" readOnly />
                    <Button variant="outline">Regenerate</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="validation">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="w-5 h-5" />
                <span>Validation Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-Validation</Label>
                    <p className="text-sm text-health-charcoal/70">Automatically validate low-risk proofs</p>
                  </div>
                  <Switch checked={autoValidation} onCheckedChange={setAutoValidation} />
                </div>
                <Separator />
                <div>
                  <Label>AI Confidence Threshold</Label>
                  <Select defaultValue="85">
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="70">70% - More automation</SelectItem>
                      <SelectItem value="80">80% - Balanced</SelectItem>
                      <SelectItem value="85">85% - Recommended</SelectItem>
                      <SelectItem value="90">90% - More manual review</SelectItem>
                      <SelectItem value="95">95% - Highest security</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div>
                  <Label>Validation Rules</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Require blockchain verification</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Check provider credentials</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Validate document timestamps</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Cross-reference patient data</span>
                      <Switch />
                    </div>
                  </div>
                </div>
              </div>
              <Button className="bg-health-teal hover:bg-health-teal/90 text-white">
                Save Validation Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="w-5 h-5" />
                  <span>System Integrations</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-health-teal/10 rounded-lg flex items-center justify-center">
                        <Database className="w-5 h-5 text-health-teal" />
                      </div>
                      <div>
                        <h3 className="font-medium">Claims Management System</h3>
                        <p className="text-sm text-health-charcoal/70">Connected to CMS v2.1</p>
                      </div>
                    </div>
                    <Badge className="bg-health-success text-white">Connected</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-health-aqua/10 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-health-aqua" />
                      </div>
                      <div>
                        <h3 className="font-medium">Blockchain Network</h3>
                        <p className="text-sm text-health-charcoal/70">HealthChain Network</p>
                      </div>
                    </div>
                    <Badge className="bg-health-success text-white">Connected</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-health-warning/10 rounded-lg flex items-center justify-center">
                        <Mail className="w-5 h-5 text-health-warning" />
                      </div>
                      <div>
                        <h3 className="font-medium">Email Service</h3>
                        <p className="text-sm text-health-charcoal/70">SendGrid Integration</p>
                      </div>
                    </div>
                    <Badge className="bg-health-warning text-white">Pending</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Backup & Recovery</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Backup Frequency</Label>
                  <Select defaultValue="daily">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Every Hour</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Data Retention Period</Label>
                  <Select defaultValue="7years">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1year">1 Year</SelectItem>
                      <SelectItem value="3years">3 Years</SelectItem>
                      <SelectItem value="5years">5 Years</SelectItem>
                      <SelectItem value="7years">7 Years</SelectItem>
                      <SelectItem value="10years">10 Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" className="w-full">
                  Run Manual Backup
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InsuranceSettings;
