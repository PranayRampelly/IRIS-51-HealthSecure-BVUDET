import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Settings, Shield, Bell, Clock, Users, 
  ArrowLeft, Save, Plus, Trash2, Eye,
  Lock, Globe, UserCheck, Zap, AlertTriangle,
  CheckCircle, XCircle, Info, Edit, Copy
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Mock settings data
const mockSettings = {
  general: {
    autoSave: true,
    autoSaveInterval: 30,
    defaultUrgency: 'normal',
    defaultResponseTime: '1-2 days',
    enableNotifications: true,
    enableAnalytics: true
  },
  permissions: {
    allowPublicSharing: false,
    allowTemplateImport: true,
    allowTemplateExport: true,
    requireApproval: true,
    allowCollaboration: false
  },
  automation: {
    enableAutoReminders: true,
    reminderInterval: 24,
    enableAutoEscalation: true,
    escalationThreshold: 48,
    enableSmartSuggestions: true
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    notificationTypes: ['template_created', 'template_updated', 'usage_analytics']
  },
  security: {
    requireTwoFactor: true,
    enableAuditLog: true,
    dataRetentionDays: 365,
    enableEncryption: true,
    allowApiAccess: false
  }
};

const mockAutomationRules = [
  {
    id: 'RULE-001',
    name: 'Auto-remind after 24 hours',
    description: 'Send automatic reminder if no response received within 24 hours',
    type: 'reminder',
    isActive: true,
    conditions: ['no_response_24h'],
    actions: ['send_email', 'send_push']
  },
  {
    id: 'RULE-002',
    name: 'Escalate urgent requests',
    description: 'Automatically escalate urgent requests after 12 hours',
    type: 'escalation',
    isActive: true,
    conditions: ['urgency_high', 'no_response_12h'],
    actions: ['notify_supervisor', 'send_sms']
  },
  {
    id: 'RULE-003',
    name: 'Smart field suggestions',
    description: 'Suggest relevant fields based on template category',
    type: 'suggestion',
    isActive: true,
    conditions: ['template_creation'],
    actions: ['suggest_fields']
  }
];

const DoctorTemplateSettings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(mockSettings);
  const [automationRules, setAutomationRules] = useState(mockAutomationRules);
  const [showAddRule, setShowAddRule] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    type: 'reminder',
    conditions: [],
    actions: []
  });

  const handleSettingChange = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const handleSaveSettings = () => {
    // Mock save functionality
    console.log('Saving settings:', settings);
    // In real implementation, this would save to backend
  };

  const handleAddRule = () => {
    if (newRule.name && newRule.description) {
      const rule = {
        id: `RULE-${Date.now()}`,
        ...newRule,
        isActive: true
      };
      setAutomationRules(prev => [...prev, rule]);
      setNewRule({ name: '', description: '', type: 'reminder', conditions: [], actions: [] });
      setShowAddRule(false);
    }
  };

  const handleDeleteRule = (ruleId: string) => {
    setAutomationRules(prev => prev.filter(rule => rule.id !== ruleId));
  };

  const handleToggleRule = (ruleId: string) => {
    setAutomationRules(prev => 
      prev.map(rule => 
        rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
      )
    );
  };

  const getRuleTypeIcon = (type: string) => {
    switch (type) {
      case 'reminder': return <Bell className="w-4 h-4" />;
      case 'escalation': return <AlertTriangle className="w-4 h-4" />;
      case 'suggestion': return <Zap className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const getRuleTypeColor = (type: string) => {
    switch (type) {
      case 'reminder': return 'bg-blue-100 text-blue-800';
      case 'escalation': return 'bg-orange-100 text-orange-800';
      case 'suggestion': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-3xl font-montserrat font-bold text-health-teal">Template Settings</h1>
          </div>
          <p className="text-health-charcoal">Configure advanced settings for template management and automation</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveSettings}>
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
          <Button className="bg-health-teal hover:bg-health-teal/90">
            <Settings className="w-4 h-4 mr-2" />
            Reset to Default
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  General Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Auto-save templates</label>
                    <p className="text-xs text-health-charcoal/60">Automatically save template changes</p>
                  </div>
                  <Switch
                    checked={settings.general.autoSave}
                    onCheckedChange={(checked) => handleSettingChange('general', 'autoSave', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Auto-save interval (seconds)</label>
                    <p className="text-xs text-health-charcoal/60">How often to auto-save</p>
                  </div>
                  <Input
                    type="number"
                    value={settings.general.autoSaveInterval}
                    onChange={(e) => handleSettingChange('general', 'autoSaveInterval', parseInt(e.target.value))}
                    className="w-20"
                    min="10"
                    max="300"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Default urgency level</label>
                  <Select 
                    value={settings.general.defaultUrgency} 
                    onValueChange={(value) => handleSettingChange('general', 'defaultUrgency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Default response time</label>
                  <Select 
                    value={settings.general.defaultResponseTime} 
                    onValueChange={(value) => handleSettingChange('general', 'defaultResponseTime', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Immediate">Immediate</SelectItem>
                      <SelectItem value="1-2 hours">1-2 hours</SelectItem>
                      <SelectItem value="1 day">1 day</SelectItem>
                      <SelectItem value="1-2 days">1-2 days</SelectItem>
                      <SelectItem value="3-5 days">3-5 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Visibility & Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Enable notifications</label>
                    <p className="text-xs text-health-charcoal/60">Receive notifications for template events</p>
                  </div>
                  <Switch
                    checked={settings.general.enableNotifications}
                    onCheckedChange={(checked) => handleSettingChange('general', 'enableNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Enable analytics</label>
                    <p className="text-xs text-health-charcoal/60">Track template usage and performance</p>
                  </div>
                  <Switch
                    checked={settings.general.enableAnalytics}
                    onCheckedChange={(checked) => handleSettingChange('general', 'enableAnalytics', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Sharing Permissions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Allow public sharing</label>
                    <p className="text-xs text-health-charcoal/60">Share templates with the community</p>
                  </div>
                  <Switch
                    checked={settings.permissions.allowPublicSharing}
                    onCheckedChange={(checked) => handleSettingChange('permissions', 'allowPublicSharing', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Allow template import</label>
                    <p className="text-xs text-health-charcoal/60">Import templates from other doctors</p>
                  </div>
                  <Switch
                    checked={settings.permissions.allowTemplateImport}
                    onCheckedChange={(checked) => handleSettingChange('permissions', 'allowTemplateImport', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Allow template export</label>
                    <p className="text-xs text-health-charcoal/60">Export templates for backup</p>
                  </div>
                  <Switch
                    checked={settings.permissions.allowTemplateExport}
                    onCheckedChange={(checked) => handleSettingChange('permissions', 'allowTemplateExport', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5" />
                  Collaboration Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Require approval</label>
                    <p className="text-xs text-health-charcoal/60">Require approval for template changes</p>
                  </div>
                  <Switch
                    checked={settings.permissions.requireApproval}
                    onCheckedChange={(checked) => handleSettingChange('permissions', 'requireApproval', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Allow collaboration</label>
                    <p className="text-xs text-health-charcoal/60">Allow team members to edit templates</p>
                  </div>
                  <Switch
                    checked={settings.permissions.allowCollaboration}
                    onCheckedChange={(checked) => handleSettingChange('permissions', 'allowCollaboration', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Automation Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Auto-reminders</label>
                    <p className="text-xs text-health-charcoal/60">Send automatic reminders</p>
                  </div>
                  <Switch
                    checked={settings.automation.enableAutoReminders}
                    onCheckedChange={(checked) => handleSettingChange('automation', 'enableAutoReminders', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Reminder interval (hours)</label>
                    <p className="text-xs text-health-charcoal/60">How often to send reminders</p>
                  </div>
                  <Input
                    type="number"
                    value={settings.automation.reminderInterval}
                    onChange={(e) => handleSettingChange('automation', 'reminderInterval', parseInt(e.target.value))}
                    className="w-20"
                    min="1"
                    max="168"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Auto-escalation</label>
                    <p className="text-xs text-health-charcoal/60">Escalate overdue requests</p>
                  </div>
                  <Switch
                    checked={settings.automation.enableAutoEscalation}
                    onCheckedChange={(checked) => handleSettingChange('automation', 'enableAutoEscalation', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Escalation threshold (hours)</label>
                    <p className="text-xs text-health-charcoal/60">When to escalate requests</p>
                  </div>
                  <Input
                    type="number"
                    value={settings.automation.escalationThreshold}
                    onChange={(e) => handleSettingChange('automation', 'escalationThreshold', parseInt(e.target.value))}
                    className="w-20"
                    min="1"
                    max="168"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Smart suggestions</label>
                    <p className="text-xs text-health-charcoal/60">Suggest relevant fields and templates</p>
                  </div>
                  <Switch
                    checked={settings.automation.enableSmartSuggestions}
                    onCheckedChange={(checked) => handleSettingChange('automation', 'enableSmartSuggestions', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Email notifications</label>
                    <p className="text-xs text-health-charcoal/60">Receive email alerts</p>
                  </div>
                  <Switch
                    checked={settings.notifications.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'emailNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Push notifications</label>
                    <p className="text-xs text-health-charcoal/60">Receive push alerts</p>
                  </div>
                  <Switch
                    checked={settings.notifications.pushNotifications}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'pushNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">SMS notifications</label>
                    <p className="text-xs text-health-charcoal/60">Receive SMS alerts</p>
                  </div>
                  <Switch
                    checked={settings.notifications.smsNotifications}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'smsNotifications', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Require two-factor authentication</label>
                    <p className="text-xs text-health-charcoal/60">Enhanced security for template access</p>
                  </div>
                  <Switch
                    checked={settings.security.requireTwoFactor}
                    onCheckedChange={(checked) => handleSettingChange('security', 'requireTwoFactor', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Enable audit logging</label>
                    <p className="text-xs text-health-charcoal/60">Track all template activities</p>
                  </div>
                  <Switch
                    checked={settings.security.enableAuditLog}
                    onCheckedChange={(checked) => handleSettingChange('security', 'enableAuditLog', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Enable encryption</label>
                    <p className="text-xs text-health-charcoal/60">Encrypt sensitive template data</p>
                  </div>
                  <Switch
                    checked={settings.security.enableEncryption}
                    onCheckedChange={(checked) => handleSettingChange('security', 'enableEncryption', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Allow API access</label>
                    <p className="text-xs text-health-charcoal/60">Enable API for external integrations</p>
                  </div>
                  <Switch
                    checked={settings.security.allowApiAccess}
                    onCheckedChange={(checked) => handleSettingChange('security', 'allowApiAccess', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Data Retention
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Data retention period (days)</label>
                  <p className="text-xs text-health-charcoal/60 mb-2">How long to keep template data</p>
                  <Input
                    type="number"
                    value={settings.security.dataRetentionDays}
                    onChange={(e) => handleSettingChange('security', 'dataRetentionDays', parseInt(e.target.value))}
                    className="w-32"
                    min="30"
                    max="2555"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Automation Rules</h3>
            <Button onClick={() => setShowAddRule(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Rule
            </Button>
          </div>

          <div className="space-y-4">
            {automationRules.map(rule => (
              <Card key={rule.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${getRuleTypeColor(rule.type)}`}>
                          {getRuleTypeIcon(rule.type)}
                        </div>
                        <div>
                          <h4 className="font-medium">{rule.name}</h4>
                          <p className="text-sm text-health-charcoal/60">{rule.description}</p>
                        </div>
                        <Badge className={rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-health-charcoal/60">
                        <span>Type: {rule.type}</span>
                        <span>Conditions: {rule.conditions.length}</span>
                        <span>Actions: {rule.actions.length}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleRule(rule.id)}
                      >
                        {rule.isActive ? 'Disable' : 'Enable'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingRule(rule)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteRule(rule.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Rule Dialog */}
      <Dialog open={showAddRule} onOpenChange={setShowAddRule}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Automation Rule</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Rule Name</label>
              <Input
                placeholder="Enter rule name"
                value={newRule.name}
                onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Describe what this rule does"
                value={newRule.description}
                onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Rule Type</label>
              <Select value={newRule.type} onValueChange={(value) => setNewRule({ ...newRule, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reminder">Reminder</SelectItem>
                  <SelectItem value="escalation">Escalation</SelectItem>
                  <SelectItem value="suggestion">Suggestion</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleAddRule}>
                <Plus className="w-4 h-4 mr-2" />
                Add Rule
              </Button>
              <Button variant="outline" onClick={() => setShowAddRule(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorTemplateSettings;
