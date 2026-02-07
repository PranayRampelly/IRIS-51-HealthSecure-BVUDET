
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Download, Search, Filter, FileText, Database, Calendar, Clock, CheckCircle, XCircle, Plus, Trash2 } from 'lucide-react';

const ResearcherExports = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const exports = [
    {
      id: 'EXP-001',
      name: 'Diabetes Study Results',
      query: 'Diabetes Treatment Outcomes',
      format: 'CSV',
      size: '2.3 MB',
      records: 1542,
      status: 'completed',
      created: '2024-01-20 14:30',
      completed: '2024-01-20 14:32',
      downloads: 3,
      expiresOn: '2024-02-20'
    },
    {
      id: 'EXP-002',
      name: 'Cardiovascular Risk Analysis',
      query: 'Cardiovascular Risk Factors',
      format: 'JSON',
      size: '4.1 MB',
      records: 856,
      status: 'processing',
      created: '2024-01-19 16:45',
      completed: null,
      downloads: 0,
      expiresOn: '2024-02-19'
    },
    {
      id: 'EXP-003',
      name: 'Mental Health Dataset',
      query: 'Mental Health Interventions',
      format: 'Excel',
      size: '8.7 MB',
      records: 2341,
      status: 'completed',
      created: '2024-01-18 10:20',
      completed: '2024-01-18 10:25',
      downloads: 8,
      expiresOn: '2024-02-18'
    },
    {
      id: 'EXP-004',
      name: 'Cancer Screening Data',
      query: 'Cancer Screening Effectiveness',
      format: 'PDF',
      size: '1.2 MB',
      records: 0,
      status: 'failed',
      created: '2024-01-17 09:15',
      completed: null,
      downloads: 0,
      expiresOn: '2024-02-17'
    },
    {
      id: 'EXP-005',
      name: 'Emergency Response Analysis',
      query: 'Emergency Response Times',
      format: 'CSV',
      size: '12.4 MB',
      records: 5432,
      status: 'scheduled',
      created: '2024-01-16 18:00',
      completed: null,
      downloads: 0,
      expiresOn: '2024-02-16'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-health-success text-white';
      case 'processing': return 'bg-health-aqua text-white';
      case 'scheduled': return 'bg-health-warning text-white';
      case 'failed': return 'bg-health-danger text-white';
      default: return 'bg-health-blue-gray text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'processing': return <Clock className="w-4 h-4 animate-spin" />;
      case 'scheduled': return <Calendar className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredExports = exports.filter(exp => {
    const matchesSearch = exp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exp.query.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exp.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || exp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-montserrat font-bold text-health-teal">Exports</h1>
          <p className="text-health-charcoal mt-2">Download and manage data exports</p>
        </div>
        <Button className="bg-health-teal hover:bg-health-teal/90 text-white">
          <Plus className="w-4 h-4 mr-2" />
          New Export
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-health-success/10 rounded-lg">
                <CheckCircle className="w-6 h-6 text-health-success" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Completed</p>
                <p className="text-2xl font-bold text-health-teal">{exports.filter(e => e.status === 'completed').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-health-aqua/10 rounded-lg">
                <Clock className="w-6 h-6 text-health-aqua" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Processing</p>
                <p className="text-2xl font-bold text-health-teal">{exports.filter(e => e.status === 'processing').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-health-warning/10 rounded-lg">
                <Calendar className="w-6 h-6 text-health-warning" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Scheduled</p>
                <p className="text-2xl font-bold text-health-teal">{exports.filter(e => e.status === 'scheduled').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-health-teal/10 rounded-lg">
                <Database className="w-6 h-6 text-health-teal" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Total Records</p>
                <p className="text-2xl font-bold text-health-teal">
                  {exports.reduce((sum, e) => sum + e.records, 0).toLocaleString()}
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
                  placeholder="Search exports by name, query, or ID..."
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
                  <SelectItem value="all">All Exports</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Export History</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All ({exports.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({exports.filter(e => e.status === 'completed').length})</TabsTrigger>
              <TabsTrigger value="processing">Processing ({exports.filter(e => e.status === 'processing').length})</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled ({exports.filter(e => e.status === 'scheduled').length})</TabsTrigger>
              <TabsTrigger value="failed">Failed ({exports.filter(e => e.status === 'failed').length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Export</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Records</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Downloads</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExports.map((exp) => (
                    <TableRow key={exp.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{exp.name}</p>
                          <p className="text-sm text-health-charcoal/70">{exp.query}</p>
                          <p className="text-xs text-health-charcoal/50 mt-1">{exp.id}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="px-2 py-1">
                          {exp.format}
                        </Badge>
                      </TableCell>
                      <TableCell>{exp.size}</TableCell>
                      <TableCell>{exp.records.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(exp.status)}>
                          {getStatusIcon(exp.status)}
                          <span className="ml-1">{exp.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>{exp.created}</TableCell>
                      <TableCell>{exp.downloads}</TableCell>
                      <TableCell>
                        {exp.expiresOn || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          {exp.status === 'completed' && (
                            <Button size="sm" className="bg-health-success hover:bg-health-success/90 text-white">
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                          {exp.status === 'processing' && (
                            <Button size="sm" variant="outline" disabled>
                              <Clock className="w-4 h-4" />
                            </Button>
                          )}
                          {exp.status === 'failed' && (
                            <Button size="sm" variant="outline">
                              Retry
                            </Button>
                          )}
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
            
            <TabsContent value="completed" className="mt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Export</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Records</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Downloads</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exports.filter(e => e.status === 'completed').map((exp) => (
                    <TableRow key={exp.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{exp.name}</p>
                          <p className="text-sm text-health-charcoal/70">{exp.query}</p>
                          <p className="text-xs text-health-charcoal/50 mt-1">{exp.id}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="px-2 py-1">
                          {exp.format}
                        </Badge>
                      </TableCell>
                      <TableCell>{exp.size}</TableCell>
                      <TableCell>{exp.records.toLocaleString()}</TableCell>
                      <TableCell>{exp.created}</TableCell>
                      <TableCell>{exp.downloads}</TableCell>
                      <TableCell>
                        {exp.expiresOn || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button size="sm" className="bg-health-success hover:bg-health-success/90 text-white">
                            <Download className="w-4 h-4" />
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
            
            <TabsContent value="processing" className="mt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Export</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Records</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exports.filter(e => e.status === 'processing').map((exp) => (
                    <TableRow key={exp.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{exp.name}</p>
                          <p className="text-sm text-health-charcoal/70">{exp.query}</p>
                          <p className="text-xs text-health-charcoal/50 mt-1">{exp.id}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="px-2 py-1">
                          {exp.format}
                        </Badge>
                      </TableCell>
                      <TableCell>{exp.records.toLocaleString()}</TableCell>
                      <TableCell>{exp.created}</TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-1">
                          <Progress value={65} className="h-2" />
                          <span className="text-xs text-health-charcoal/70">65% complete</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="outline">
                            Cancel
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

      {/* Export Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Export Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <FileText className="w-6 h-6" />
              <span className="text-sm">CSV Export</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <FileText className="w-6 h-6" />
              <span className="text-sm">Excel Report</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <FileText className="w-6 h-6" />
              <span className="text-sm">JSON Data</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <FileText className="w-6 h-6" />
              <span className="text-sm">PDF Summary</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <FileText className="w-6 h-6" />
              <span className="text-sm">Statistical Analysis</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <FileText className="w-6 h-6" />
              <span className="text-sm">Custom Format</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Storage Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>Export Storage Usage</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Used Storage</span>
              <span className="text-sm text-health-charcoal/70">18.2 MB of 1 GB</span>
            </div>
            <Progress value={1.82} className="h-2" />

            <div className="flex flex-col space-y-2 mt-6">
              <p className="text-sm font-medium text-health-teal">Export Storage Policy:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm text-health-charcoal/70">
                <li>Exports are stored for 30 days</li>
                <li>Maximum export size: 200MB</li>
                <li>Maximum storage quota: 1GB</li>
                <li>Only completed exports count towards your quota</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResearcherExports;
