import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Settings as SettingsIcon,
  User,
  Palette,
  Bell,
  Shield,
  Building,
  Globe,
  RefreshCw,
  Save,
  Image as ImageIcon,
} from 'lucide-react';
import pharmacyService from '@/services/pharmacyService';

const Settings: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<any>({
    pharmacyName: '', description: '', email: '', phone: '', address: '', operatingHours: '',
    deliverySameDay: false, deliveryNextDay: true, minOrderAmount: 0, taxPercent: 0,
    enableNotifications: true, lowStockAlertThreshold: 10,
  });

  const [logo, setLogo] = useState<File | undefined>();
  const [banner, setBanner] = useState<File | undefined>();
  const [activeTab, setActiveTab] = useState('profile');

  const load = async () => {
    setLoading(true);
    try {
      const data = await pharmacyService.getSettings();
      if (data) setForm((prev: any) => ({ ...prev, ...data }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    try {
      await pharmacyService.updateSettings(form, logo, banner);
      await load();
    } finally {
      setSaving(false);
      setLogo(undefined); setBanner(undefined);
    }
  };

  const bind = (key: string) => ({
    value: form[key] ?? '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f: any) => ({ ...f, [key]: e.target.value })),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-gray-600" />
          <h1 className="text-2xl font-bold text-health-charcoal">Settings</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button className="bg-health-aqua" onClick={save} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="w-5 h-5" />Pharmacy Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input placeholder="Pharmacy Name" {...bind('pharmacyName')} />
                <Input placeholder="Email" {...bind('email')} />
                <Input placeholder="Phone" {...bind('phone')} />
              </div>
              <Input placeholder="Address" {...bind('address')} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input placeholder="Operating Hours" {...bind('operatingHours')} />
                <Input placeholder="Min Order Amount" type="number" {...bind('minOrderAmount')} />
                <Input placeholder="Tax %" type="number" {...bind('taxPercent')} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Palette className="w-5 h-5" />Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <div className="flex items-center gap-2 p-2 border rounded">
                  <span className="text-sm">Enable Notifications</span>
                  <Switch checked={Boolean(form.enableNotifications)} onCheckedChange={(v) => setForm((f: any) => ({ ...f, enableNotifications: Boolean(v) }))} />
                </div>
                <Input placeholder="Low Stock Alert Threshold" type="number" value={form.lowStockAlertThreshold ?? 10} onChange={(e) => setForm((f: any) => ({ ...f, lowStockAlertThreshold: Number(e.target.value) }))} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5" />Delivery & Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="flex items-center justify-between p-2 border rounded">
                  <Label className="text-sm">Same-day Delivery</Label>
                  <Switch checked={Boolean(form.deliverySameDay)} onCheckedChange={(v) => setForm((f: any) => ({ ...f, deliverySameDay: Boolean(v) }))} />
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <Label className="text-sm">Next-day Delivery</Label>
                  <Switch checked={Boolean(form.deliveryNextDay)} onCheckedChange={(v) => setForm((f: any) => ({ ...f, deliveryNextDay: Boolean(v) }))} />
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <Label className="text-sm">Inventory Alerts</Label>
                  <Badge variant="outline">Threshold: {form.lowStockAlertThreshold ?? 10}</Badge>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="flex items-center justify-between p-2 border rounded">
                  <Label className="text-sm">Email Notifications</Label>
                  <Switch checked={Boolean(form.enableNotifications)} onCheckedChange={(v) => setForm((f: any) => ({ ...f, enableNotifications: Boolean(v) }))} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Building className="w-5 h-5" />Pharmacy Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input placeholder="Pharmacy Name" {...bind('pharmacyName')} />
                <Input placeholder="Email" {...bind('email')} />
                <Input placeholder="Phone" {...bind('phone')} />
              </div>
              <Input placeholder="Address" {...bind('address')} />
              <Textarea placeholder="Description" {...bind('description')} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding */}
        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ImageIcon className="w-5 h-5" />Branding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <div className="text-sm mb-1">Logo</div>
                  <Input type="file" onChange={(e) => setLogo(e.target.files?.[0])} />
                  {form.logoCloudinaryUrl && (
                    <a href={form.logoCloudinaryUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline">View Current</a>
                  )}
                </div>
                <div>
                  <div className="text-sm mb-1">Banner</div>
                  <Input type="file" onChange={(e) => setBanner(e.target.files?.[0])} />
                  {form.bannerCloudinaryUrl && (
                    <a href={form.bannerCloudinaryUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline">View Current</a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;


