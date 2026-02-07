import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Settings, User, Bell, Lock, Key, Database, Code, FileText, Download, X } from 'lucide-react';

const ResearcherSettings = () => {
  const [notifications, setNotifications] = useState({
    email: true,
    inApp: true,
    queryCompletion: true,
    exportComplete: true,
    systemUpdates: false
  });
  
  const [privacy, setPrivacy] = useState({
    anonymizeResults: true,
    autoShare: false,
    saveHistory: true
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-montserrat font-bold text-health-teal">Settings</h1>
          <p className="text-health-charcoal mt-2">Manage your research account settings</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy & Data</TabsTrigger>
          <TabsTrigger value="api">API Access</TabsTrigger>
          <TabsTrigger value="export">Export Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Researcher Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" defaultValue="Dr. Emily Johnson" />
                  </div>
                  <div>
                    <Label htmlFor="institution">Institution</Label>
                    <Input id="institution" defaultValue="Medical Research Institute" />
                  </div>
                  <div>
                    <Label htmlFor="researcherId">Researcher ID</Label>
                    <div className="flex space-x-2">
                      <Input id="researcherId" defaultValue="RES-2024-01234" readOnly className="bg-health-light-gray" />
                      <Button variant="outline" size="sm">Copy</Button>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue="emily.johnson@research.org" />
                  </div>
                  <div>
                    <Label htmlFor="specialization">Research Specialization</Label>
                    <Select defaultValue="cardiology">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cardiology">Cardiology</SelectItem>
                        <SelectItem value="oncology">Oncology</SelectItem>
                        <SelectItem value="neurology">Neurology</SelectItem>
                        <SelectItem value="endocrinology">Endocrinology</SelectItem>
                        <SelectItem value="pediatrics">Pediatrics</SelectItem>
                        <SelectItem value="psychiatry">Psychiatry</SelectItem>
                        <SelectItem value="emergency">Emergency Medicine</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="publications">Publication Links</Label>
                    <Input id="publications" defaultValue="https://orcid.org/0000-0002-1234-5678" />
                    <p className="text-xs text-health-charcoal/70 mt-1">Enter your ORCID, Scopus ID, or other identifier</p>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Research Biography</Label>
                <textarea
                  id="bio"
                  className="w-full min-h-[100px] p-2 border rounded-md mt-1"
                  defaultValue="Cardiovascular researcher with 10+ years of experience specializing in preventive cardiology and risk factor identification. Currently leading studies on lifestyle interventions for heart disease prevention."
                />
              </div>

              <Button className="bg-health-teal hover:bg-health-teal/90 text-white">
                Save Profile Changes
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
                    <p className="text-sm text-health-charcoal/70">Receive notifications via email</p>
                  </div>
                  <Switch 
                    checked={notifications.email} 
                    onCheckedChange={(checked) => setNotifications({...notifications, email: checked})} 
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>In-App Notifications</Label>
                    <p className="text-sm text-health-charcoal/70">Show notifications in the dashboard</p>
                  </div>
                  <Switch 
                    checked={notifications.inApp} 
                    onCheckedChange={(checked) => setNotifications({...notifications, inApp: checked})} 
                  />
                </div>
                <Separator />
                <div className="space-y-3">
                  <Label>Notification Types</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Query completion</span>
                      <Switch 
                        checked={notifications.queryCompletion} 
                        onCheckedChange={(checked) => setNotifications({...notifications, queryCompletion: checked})} 
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Export ready</span>
                      <Switch 
                        checked={notifications.exportComplete} 
                        onCheckedChange={(checked) => setNotifications({...notifications, exportComplete: checked})} 
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">System updates and maintenance</span>
                      <Switch 
                        checked={notifications.systemUpdates} 
                        onCheckedChange={(checked) => setNotifications({...notifications, systemUpdates: checked})} 
                      />
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

        <TabsContent value="privacy">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="w-5 h-5" />
                  <span>Privacy Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Anonymize Query Results</Label>
                      <p className="text-sm text-health-charcoal/70">Remove all personally identifiable information from results</p>
                    </div>
                    <Switch 
                      checked={privacy.anonymizeResults} 
                      onCheckedChange={(checked) => setPrivacy({...privacy, anonymizeResults: checked})} 
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-Share Results</Label>
                      <p className="text-sm text-health-charcoal/70">Automatically share query results with your research team</p>
                    </div>
                    <Switch 
                      checked={privacy.autoShare} 
                      onCheckedChange={(checked) => setPrivacy({...privacy, autoShare: checked})} 
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Save Query History</Label>
                      <p className="text-sm text-health-charcoal/70">Save all queries for future reference</p>
                    </div>
                    <Switch 
                      checked={privacy.saveHistory} 
                      onCheckedChange={(checked) => setPrivacy({...privacy, saveHistory: checked})} 
                    />
                  </div>
                </div>
                <Button className="bg-health-teal hover:bg-health-teal/90 text-white">
                  Save Privacy Settings
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="w-5 h-5" />
                  <span>Data Access & Compliance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Research Consent</Label>
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">IRB Approval</p>
                        <p className="text-sm text-health-charcoal/70">Institutional Review Board Approval Number</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Input defaultValue="IRB-2023-896" className="max-w-[180px]" />
                        <Badge className="bg-health-success text-white">Verified</Badge>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Data Use Agreement</p>
                        <p className="text-sm text-health-charcoal/70">Terms for accessing and using medical data</p>
                      </div>
                      <div>
                        <Badge className="bg-health-success text-white">Signed</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Compliance Certifications</Label>
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">HIPAA Training</p>
                        <p className="text-sm text-health-charcoal/70">Health Insurance Portability and Accountability Act</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-health-success text-white">Completed</Badge>
                        <Badge variant="outline">1/15/2024</Badge>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Responsible Research Conduct</p>
                        <p className="text-sm text-health-charcoal/70">Ethics training for medical researchers</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-health-success text-white">Completed</Badge>
                        <Badge variant="outline">12/10/2023</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Code className="w-5 h-5" />
                <span>API Access & Integration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>API Keys</Label>
                <div className="space-y-4 mt-2">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Production API Key</p>
                    <div className="flex space-x-2">
                      <Input type="password" value="••••••••••••••••••••••••••••••••" readOnly className="font-mono" />
                      <Button variant="outline">Show</Button>
                      <Button variant="outline">Regenerate</Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Development API Key</p>
                    <div className="flex space-x-2">
                      <Input type="password" value="••••••••••••••••••••••••••••••••" readOnly className="font-mono" />
                      <Button variant="outline">Show</Button>
                      <Button variant="outline">Regenerate</Button>
                    </div>
                    <p className="text-xs text-health-charcoal/70">Use for testing and development. Limited to 100 calls per day.</p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <Label>API Usage Stats</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-health-charcoal/70">Calls Today</p>
                    <p className="text-xl font-bold text-health-teal">142</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-health-charcoal/70">Calls This Month</p>
                    <p className="text-xl font-bold text-health-teal">2,845</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-health-charcoal/70">Data Retrieved</p>
                    <p className="text-xl font-bold text-health-teal">24.5 MB</p>
                  </div>
                </div>
              </div>

              <Separator />
              
              <div>
                <Label>API Access Control</Label>
                <div className="space-y-3 mt-2">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">IP Whitelist</p>
                    <div className="flex space-x-2">
                      <Input placeholder="Enter IP address" />
                      <Button variant="outline">Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="secondary" className="flex items-center space-x-1">
                        <span>192.168.1.1</span>
                        <Button variant="ghost" size="sm" className="h-4 w-4 p-0 hover:bg-transparent">
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                      <Badge variant="secondary" className="flex items-center space-x-1">
                        <span>10.0.0.5</span>
                        <Button variant="ghost" size="sm" className="h-4 w-4 p-0 hover:bg-transparent">
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Rate Limiting</p>
                      <Select defaultValue="medium">
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low (500/day)</SelectItem>
                          <SelectItem value="medium">Medium (1000/day)</SelectItem>
                          <SelectItem value="high">High (5000/day)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <Button className="bg-health-teal hover:bg-health-teal/90 text-white">
                Save API Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="w-5 h-5" />
                <span>Export Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="defaultFormat">Default Export Format</Label>
                    <Select defaultValue="csv">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="exportNaming">Export File Naming</Label>
                    <Select defaultValue="timestamp">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="queryName">Query Name</SelectItem>
                        <SelectItem value="timestamp">Timestamp + Query Name</SelectItem>
                        <SelectItem value="custom">Custom Format</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Include Query Metadata</Label>
                      <p className="text-sm text-health-charcoal/70">Add query parameters in export files</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="exportLocation">Export Storage Location</Label>
                    <Select defaultValue="local">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="local">Local Storage</SelectItem>
                        <SelectItem value="cloud">Cloud Storage</SelectItem>
                        <SelectItem value="both">Both Local and Cloud</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="dataRetention">Data Retention Period</Label>
                    <Select defaultValue="30">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="custom">Custom Period</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-export Completed Queries</Label>
                      <p className="text-sm text-health-charcoal/70">Export results when queries complete</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <Separator />
              
              <div>
                <Label>Data Columns to Include</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="column1" defaultChecked />
                    <Label htmlFor="column1" className="text-sm">Patient Demographics</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="column2" defaultChecked />
                    <Label htmlFor="column2" className="text-sm">Diagnosis Codes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="column3" defaultChecked />
                    <Label htmlFor="column3" className="text-sm">Treatment Dates</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="column4" defaultChecked />
                    <Label htmlFor="column4" className="text-sm">Medications</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="column5" defaultChecked />
                    <Label htmlFor="column5" className="text-sm">Lab Results</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="column6" />
                    <Label htmlFor="column6" className="text-sm">Provider IDs</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="column7" defaultChecked />
                    <Label htmlFor="column7" className="text-sm">Outcomes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="column8" />
                    <Label htmlFor="column8" className="text-sm">Insurance Data</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="column9" defaultChecked />
                    <Label htmlFor="column9" className="text-sm">Statistical Analysis</Label>
                  </div>
                </div>
              </div>

              <Button className="bg-health-teal hover:bg-health-teal/90 text-white">
                Save Export Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResearcherSettings;
