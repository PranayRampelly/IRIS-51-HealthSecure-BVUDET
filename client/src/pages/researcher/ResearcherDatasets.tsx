
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Database, Search, Filter, Download, Eye, Calendar, Shield, TrendingUp, Users, FileText, Activity } from 'lucide-react';

const ResearcherDatasets = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const datasets = [
    {
      id: 'cardiovascular',
      name: 'Cardiovascular Health Dataset',
      description: 'Comprehensive cardiovascular health data including blood pressure, cholesterol levels, ECG readings, and treatment outcomes.',
      category: 'Cardiology',
      records: 15420,
      patients: 8934,
      timeRange: '2020-2024',
      lastUpdated: '2024-01-20',
      size: '2.3 GB',
      privacy: 'high',
      access: 'approved',
      fields: ['blood_pressure', 'cholesterol', 'ecg', 'medications', 'outcomes'],
      collaborators: 12,
      publications: 8
    },
    {
      id: 'diabetes',
      name: 'Diabetes Management Dataset',
      description: 'Type 1 and Type 2 diabetes patient data including glucose levels, insulin usage, and lifestyle factors.',
      category: 'Endocrinology',
      records: 12350,
      patients: 6890,
      timeRange: '2019-2024',
      lastUpdated: '2024-01-19',
      size: '1.8 GB',
      privacy: 'high',
      access: 'approved',
      fields: ['glucose_levels', 'insulin_dosage', 'hba1c', 'diet', 'exercise'],
      collaborators: 8,
      publications: 5
    },
    {
      id: 'cancer',
      name: 'Cancer Research Dataset',
      description: 'Multi-cancer type dataset with diagnosis, staging, treatment protocols, and survival outcomes.',
      category: 'Oncology',
      records: 8960,
      patients: 4230,
      timeRange: '2018-2024',
      lastUpdated: '2024-01-18',
      size: '3.1 GB',
      privacy: 'high',
      access: 'pending',
      fields: ['diagnosis', 'staging', 'treatment', 'biomarkers', 'survival'],
      collaborators: 15,
      publications: 12
    },
    {
      id: 'mental-health',
      name: 'Mental Health Dataset',
      description: 'Depression, anxiety, and other mental health conditions with treatment responses and outcomes.',
      category: 'Psychiatry',
      records: 18730,
      patients: 11240,
      timeRange: '2019-2024',
      lastUpdated: '2024-01-17',
      size: '1.2 GB',
      privacy: 'high',
      access: 'approved',
      fields: ['diagnosis', 'severity_scores', 'medications', 'therapy', 'outcomes'],
      collaborators: 6,
      publications: 3
    },
    {
      id: 'pediatric',
      name: 'Pediatric Care Dataset',
      description: 'Child health data including growth metrics, vaccination records, and developmental milestones.',
      category: 'Pediatrics',
      records: 9840,
      patients: 5670,
      timeRange: '2020-2024',
      lastUpdated: '2024-01-16',
      size: '950 MB',
      privacy: 'high',
      access: 'restricted',
      fields: ['growth_metrics', 'vaccinations', 'development', 'conditions'],
      collaborators: 4,
      publications: 2
    },
    {
      id: 'emergency',
      name: 'Emergency Medicine Dataset',
      description: 'Emergency department visits, trauma cases, and critical care interventions.',
      category: 'Emergency Medicine',
      records: 22140,
      patients: 18920,
      timeRange: '2019-2024',
      lastUpdated: '2024-01-15',
      size: '4.2 GB',
      privacy: 'medium',
      access: 'approved',
      fields: ['triage_data', 'vitals', 'interventions', 'outcomes', 'discharge'],
      collaborators: 10,
      publications: 6
    }
  ];

  const getPrivacyColor = (privacy: string) => {
    switch (privacy) {
      case 'high': return 'bg-health-danger text-white';
      case 'medium': return 'bg-health-warning text-white';
      case 'low': return 'bg-health-success text-white';
      default: return 'bg-health-blue-gray text-white';
    }
  };

  const getAccessColor = (access: string) => {
    switch (access) {
      case 'approved': return 'bg-health-success text-white';
      case 'pending': return 'bg-health-warning text-white';
      case 'restricted': return 'bg-health-danger text-white';
      case 'denied': return 'bg-health-blue-gray text-white';
      default: return 'bg-health-blue-gray text-white';
    }
  };

  const filteredDatasets = datasets.filter(dataset => {
    const matchesSearch = dataset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dataset.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dataset.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || dataset.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(datasets.map(d => d.category))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-montserrat font-bold text-health-teal">Data Sets</h1>
          <p className="text-health-charcoal mt-2">Browse available research datasets and manage access permissions</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Catalog
        </Button>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-health-teal/10 rounded-lg">
                <Database className="w-6 h-6 text-health-teal" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Total Datasets</p>
                <p className="text-2xl font-bold text-health-teal">{datasets.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-health-success/10 rounded-lg">
                <FileText className="w-6 h-6 text-health-success" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Total Records</p>
                <p className="text-2xl font-bold text-health-teal">
                  {datasets.reduce((sum, d) => sum + d.records, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-health-aqua/10 rounded-lg">
                <Users className="w-6 h-6 text-health-aqua" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Unique Patients</p>
                <p className="text-2xl font-bold text-health-teal">
                  {datasets.reduce((sum, d) => sum + d.patients, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-health-warning/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-health-warning" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Publications</p>
                <p className="text-2xl font-bold text-health-teal">
                  {datasets.reduce((sum, d) => sum + d.publications, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-health-blue-gray w-4 h-4" />
                <Input
                  placeholder="Search datasets by name, description, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="md:w-48">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Datasets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDatasets.map((dataset) => (
          <Card key={dataset.id} className="h-full">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{dataset.name}</CardTitle>
                  <Badge variant="secondary" className="mt-1">{dataset.category}</Badge>
                </div>
                <div className="flex flex-col space-y-1">
                  <Badge className={getAccessColor(dataset.access)}>
                    {dataset.access}
                  </Badge>
                  <Badge className={getPrivacyColor(dataset.privacy)}>
                    {dataset.privacy} privacy
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-health-charcoal/70">{dataset.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-health-charcoal/70">Records:</span>
                  <span className="ml-2 font-medium">{dataset.records.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-health-charcoal/70">Patients:</span>
                  <span className="ml-2 font-medium">{dataset.patients.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-health-charcoal/70">Time Range:</span>
                  <span className="ml-2 font-medium">{dataset.timeRange}</span>
                </div>
                <div>
                  <span className="text-health-charcoal/70">Size:</span>
                  <span className="ml-2 font-medium">{dataset.size}</span>
                </div>
              </div>

              <div>
                <p className="text-xs text-health-charcoal/70 mb-2">Available Fields:</p>
                <div className="flex flex-wrap gap-1">
                  {dataset.fields.map(field => (
                    <Badge key={field} variant="outline" className="text-xs">
                      {field.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex space-x-4 text-xs text-health-charcoal/70">
                  <div className="flex items-center space-x-1">
                    <Users className="w-3 h-3" />
                    <span>{dataset.collaborators} collaborators</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FileText className="w-3 h-3" />
                    <span>{dataset.publications} publications</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4" />
                  </Button>
                  {dataset.access === 'approved' && (
                    <Button size="sm" className="bg-health-teal hover:bg-health-teal/90 text-white">
                      Access
                    </Button>
                  )}
                  {dataset.access === 'pending' && (
                    <Button size="sm" variant="outline" disabled>
                      Pending
                    </Button>
                  )}
                  {dataset.access === 'restricted' && (
                    <Button size="sm" variant="outline">
                      Request
                    </Button>
                  )}
                </div>
              </div>

              <div className="text-xs text-health-charcoal/50">
                Last updated: {dataset.lastUpdated}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Data Usage Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Dataset Usage Analytics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {datasets.slice(0, 4).map((dataset) => (
              <div key={dataset.id}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">{dataset.name}</span>
                  <span className="text-sm text-health-charcoal/70">
                    {Math.floor(Math.random() * 100)}% utilization
                  </span>
                </div>
                <Progress value={Math.floor(Math.random() * 100)} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Access Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Access Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="my-access">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="my-access">My Access</TabsTrigger>
              <TabsTrigger value="pending">Pending Requests</TabsTrigger>
              <TabsTrigger value="request-new">Request Access</TabsTrigger>
            </TabsList>
            
            <TabsContent value="my-access" className="mt-4">
              <div className="space-y-3">
                {datasets.filter(d => d.access === 'approved').map(dataset => (
                  <div key={dataset.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{dataset.name}</p>
                      <p className="text-sm text-health-charcoal/70">Access granted • Expires: Never</p>
                    </div>
                    <Badge className="bg-health-success text-white">Active</Badge>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="pending" className="mt-4">
              <div className="space-y-3">
                {datasets.filter(d => d.access === 'pending').map(dataset => (
                  <div key={dataset.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{dataset.name}</p>
                      <p className="text-sm text-health-charcoal/70">Requested on {dataset.lastUpdated}</p>
                    </div>
                    <Badge className="bg-health-warning text-white">Pending</Badge>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="request-new" className="mt-4">
              <div className="space-y-3">
                {datasets.filter(d => d.access === 'restricted').map(dataset => (
                  <div key={dataset.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{dataset.name}</p>
                      <p className="text-sm text-health-charcoal/70">High privacy dataset - requires approval</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Request Access
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResearcherDatasets;
