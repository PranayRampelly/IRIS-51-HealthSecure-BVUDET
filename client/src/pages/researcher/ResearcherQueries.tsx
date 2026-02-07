
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, Eye, Play, Pause, Copy, Trash2, Download, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';

const ResearcherQueries = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

  const queries = [
    {
      id: 'Q-001',
      name: 'Diabetes Treatment Outcomes',
      description: 'Analysis of treatment effectiveness for Type 2 diabetes patients',
      status: 'completed',
      records: 1542,
      created: '2024-01-20',
      lastRun: '2024-01-22',
      duration: '2m 34s',
      category: 'Clinical Research',
      datasets: ['diabetes', 'cardiovascular'],
      privacy: 'high'
    },
    {
      id: 'Q-002',
      name: 'Cardiovascular Risk Factors',
      description: 'Identifying key risk factors for heart disease',
      status: 'running',
      records: 856,
      created: '2024-01-19',
      lastRun: '2024-01-21',
      duration: '5m 12s',
      category: 'Epidemiological',
      datasets: ['cardiovascular'],
      privacy: 'medium'
    },
    {
      id: 'Q-003',
      name: 'Cancer Screening Effectiveness',
      description: 'Evaluating early detection programs',
      status: 'scheduled',
      records: 0,
      created: '2024-01-18',
      lastRun: null,
      duration: null,
      category: 'Quality Improvement',
      datasets: ['cancer', 'pediatric'],
      privacy: 'high'
    },
    {
      id: 'Q-004',
      name: 'Mental Health Interventions',
      description: 'Effectiveness of therapy and medication combinations',
      status: 'failed',
      records: 0,
      created: '2024-01-17',
      lastRun: '2024-01-20',
      duration: '1m 45s',
      category: 'Outcomes Research',
      datasets: ['mental-health'],
      privacy: 'high'
    },
    {
      id: 'Q-005',
      name: 'Emergency Response Times',
      description: 'Analysis of ER wait times and patient outcomes',
      status: 'draft',
      records: 0,
      created: '2024-01-16',
      lastRun: null,
      duration: null,
      category: 'Safety Analysis',
      datasets: ['emergency'],
      privacy: 'medium'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-health-success text-white';
      case 'running': return 'bg-health-aqua text-white';
      case 'scheduled': return 'bg-health-warning text-white';
      case 'failed': return 'bg-health-danger text-white';
      case 'draft': return 'bg-health-blue-gray text-white';
      default: return 'bg-health-blue-gray text-white';
    }
  };

  const getPrivacyColor = (privacy: string) => {
    switch (privacy) {
      case 'high': return 'bg-health-danger text-white';
      case 'medium': return 'bg-health-warning text-white';
      case 'low': return 'bg-health-success text-white';
      default: return 'bg-health-blue-gray text-white';
    }
  };

  const filteredQueries = queries.filter(query => {
    const matchesSearch = query.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         query.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         query.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || query.status === statusFilter;
    const matchesTab = activeTab === 'all' || query.status === activeTab;
    return matchesSearch && matchesStatus && matchesTab;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'running': return <Play className="w-4 h-4" />;
      case 'scheduled': return <Calendar className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      case 'draft': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-montserrat font-bold text-health-teal">My Queries</h1>
          <p className="text-health-charcoal mt-2">View and manage your research queries</p>
        </div>
        <Button className="bg-health-teal hover:bg-health-teal/90 text-white">
          New Query
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-health-success/10 rounded-lg">
                <CheckCircle className="w-4 h-4 text-health-success" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Completed</p>
                <p className="text-xl font-bold text-health-teal">{queries.filter(q => q.status === 'completed').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-health-aqua/10 rounded-lg">
                <Play className="w-4 h-4 text-health-aqua" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Running</p>
                <p className="text-xl font-bold text-health-teal">{queries.filter(q => q.status === 'running').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-health-warning/10 rounded-lg">
                <Calendar className="w-4 h-4 text-health-warning" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Scheduled</p>
                <p className="text-xl font-bold text-health-teal">{queries.filter(q => q.status === 'scheduled').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-health-danger/10 rounded-lg">
                <XCircle className="w-4 h-4 text-health-danger" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Failed</p>
                <p className="text-xl font-bold text-health-teal">{queries.filter(q => q.status === 'failed').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-health-blue-gray/10 rounded-lg">
                <Clock className="w-4 h-4 text-health-blue-gray" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Drafts</p>
                <p className="text-xl font-bold text-health-teal">{queries.filter(q => q.status === 'draft').length}</p>
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
                  placeholder="Search queries by name, description, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Queries</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="draft">Drafts</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Queries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Query History</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">All ({queries.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({queries.filter(q => q.status === 'completed').length})</TabsTrigger>
              <TabsTrigger value="running">Running ({queries.filter(q => q.status === 'running').length})</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled ({queries.filter(q => q.status === 'scheduled').length})</TabsTrigger>
              <TabsTrigger value="failed">Failed ({queries.filter(q => q.status === 'failed').length})</TabsTrigger>
              <TabsTrigger value="draft">Drafts ({queries.filter(q => q.status === 'draft').length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Query</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Records</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Run</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Privacy</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQueries.map((query) => (
                    <TableRow key={query.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{query.name}</p>
                          <p className="text-sm text-health-charcoal/70 truncate max-w-xs">{query.description}</p>
                          <div className="flex space-x-1 mt-1">
                            {query.datasets.map(dataset => (
                              <Badge key={dataset} variant="outline" className="text-xs">
                                {dataset}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{query.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(query.status)}>
                          {getStatusIcon(query.status)}
                          <span className="ml-1">{query.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {query.records > 0 ? query.records.toLocaleString() : '-'}
                      </TableCell>
                      <TableCell>{query.created}</TableCell>
                      <TableCell>{query.lastRun || '-'}</TableCell>
                      <TableCell>{query.duration || '-'}</TableCell>
                      <TableCell>
                        <Badge className={getPrivacyColor(query.privacy)}>
                          {query.privacy}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                          {query.status === 'completed' && (
                            <Button size="sm" variant="outline">
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                          {(query.status === 'draft' || query.status === 'failed') && (
                            <Button size="sm" variant="outline">
                              <Play className="w-4 h-4" />
                            </Button>
                          )}
                          {query.status === 'running' && (
                            <Button size="sm" variant="outline">
                              <Pause className="w-4 h-4" />
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Query Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Search className="w-6 h-6" />
              <span className="text-sm">Patient Outcomes</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Search className="w-6 h-6" />
              <span className="text-sm">Treatment Efficacy</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Search className="w-6 h-6" />
              <span className="text-sm">Risk Assessment</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Search className="w-6 h-6" />
              <span className="text-sm">Population Health</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Search className="w-6 h-6" />
              <span className="text-sm">Quality Metrics</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Search className="w-6 h-6" />
              <span className="text-sm">Cost Analysis</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResearcherQueries;
