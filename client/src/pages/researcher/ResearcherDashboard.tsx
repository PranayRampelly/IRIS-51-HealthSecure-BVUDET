
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Database, Search, FileText, TrendingUp, Users, Clock, CheckCircle, AlertTriangle, Download, Plus } from 'lucide-react';

const ResearcherDashboard = () => {
  const queryData = [
    { name: 'Jan', queries: 12, successful: 10, failed: 2 },
    { name: 'Feb', queries: 19, successful: 16, failed: 3 },
    { name: 'Mar', queries: 15, successful: 14, failed: 1 },
    { name: 'Apr', queries: 22, successful: 20, failed: 2 },
    { name: 'May', queries: 28, successful: 25, failed: 3 },
    { name: 'Jun', queries: 25, successful: 23, failed: 2 }
  ];

  const datasetUsage = [
    { name: 'Cardiovascular', value: 35, color: '#0EA5E9' },
    { name: 'Diabetes', value: 25, color: '#10B981' },
    { name: 'Cancer', value: 20, color: '#F59E0B' },
    { name: 'Mental Health', value: 15, color: '#EF4444' },
    { name: 'Other', value: 5, color: '#8B5CF6' }
  ];

  const trendData = [
    { name: 'Week 1', patients: 450, records: 1200 },
    { name: 'Week 2', patients: 520, records: 1350 },
    { name: 'Week 3', patients: 480, records: 1180 },
    { name: 'Week 4', patients: 620, records: 1580 }
  ];

  const recentQueries = [
    { id: 'Q-001', title: 'Diabetes Treatment Outcomes', status: 'completed', records: 1542, date: '2024-01-20' },
    { id: 'Q-002', title: 'Cardiovascular Risk Factors', status: 'running', records: 856, date: '2024-01-19' },
    { id: 'Q-003', title: 'Cancer Screening Effectiveness', status: 'pending', records: 0, date: '2024-01-18' },
    { id: 'Q-004', title: 'Mental Health Interventions', status: 'completed', records: 2341, date: '2024-01-17' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-health-success text-white';
      case 'running': return 'bg-health-aqua text-white';
      case 'pending': return 'bg-health-warning text-white';
      case 'failed': return 'bg-health-danger text-white';
      default: return 'bg-health-blue-gray text-white';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-montserrat font-bold text-health-teal">Research Dashboard</h1>
          <p className="text-health-charcoal mt-2">Access and analyze anonymized health data for research purposes</p>
        </div>
        <div className="flex space-x-2">
          <Button className="bg-health-teal hover:bg-health-teal/90 text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Query
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-health-charcoal">Active Queries</p>
                <p className="text-3xl font-bold text-health-teal">8</p>
                <p className="text-xs text-health-aqua">+2 from last week</p>
              </div>
              <div className="p-3 bg-health-teal/10 rounded-full">
                <Search className="w-6 h-6 text-health-teal" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-health-charcoal">Total Records</p>
                <p className="text-3xl font-bold text-health-teal">47.2K</p>
                <p className="text-xs text-health-success">+1.2K this month</p>
              </div>
              <div className="p-3 bg-health-success/10 rounded-full">
                <Database className="w-6 h-6 text-health-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-health-charcoal">Research Projects</p>
                <p className="text-3xl font-bold text-health-teal">15</p>
                <p className="text-xs text-health-charcoal/70">6 active</p>
              </div>
              <div className="p-3 bg-health-aqua/10 rounded-full">
                <FileText className="w-6 h-6 text-health-aqua" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-health-charcoal">Success Rate</p>
                <p className="text-3xl font-bold text-health-teal">94.2%</p>
                <p className="text-xs text-health-success">+2.1% improvement</p>
              </div>
              <div className="p-3 bg-health-warning/10 rounded-full">
                <TrendingUp className="w-6 h-6 text-health-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Query Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={queryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="successful" fill="#10B981" name="Successful" />
                <Bar dataKey="failed" fill="#EF4444" name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dataset Usage Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={datasetUsage}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {datasetUsage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Data Growth Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Data Growth Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="patients" stroke="#0EA5E9" name="Patient Count" strokeWidth={2} />
              <Line type="monotone" dataKey="records" stroke="#10B981" name="Health Records" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Queries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentQueries.map((query) => (
                <div key={query.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{query.title}</p>
                    <p className="text-sm text-health-charcoal/70">{query.id} • {query.date}</p>
                    {query.records > 0 && (
                      <p className="text-xs text-health-charcoal/50">{query.records.toLocaleString()} records</p>
                    )}
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(query.status)}>
                      {query.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Research Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 bg-health-success/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-health-success mt-0.5" />
                <div>
                  <p className="font-medium text-health-success">Data Quality Excellent</p>
                  <p className="text-sm text-health-charcoal/70">99.8% of records passed validation checks</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-health-aqua/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-health-aqua mt-0.5" />
                <div>
                  <p className="font-medium text-health-aqua">Growing Dataset</p>
                  <p className="text-sm text-health-charcoal/70">1,200+ new anonymized records this week</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-health-warning/10 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-health-warning mt-0.5" />
                <div>
                  <p className="font-medium text-health-warning">Query Optimization</p>
                  <p className="text-sm text-health-charcoal/70">Consider using indexed fields for better performance</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-health-teal/10 rounded-lg">
                <Users className="w-5 h-5 text-health-teal mt-0.5" />
                <div>
                  <p className="font-medium text-health-teal">Collaboration Ready</p>
                  <p className="text-sm text-health-charcoal/70">3 research teams available for collaboration</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Search className="w-6 h-6" />
              <span className="text-xs">Build Query</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Database className="w-6 h-6" />
              <span className="text-xs">Browse Data</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <FileText className="w-6 h-6" />
              <span className="text-xs">Export Results</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <TrendingUp className="w-6 h-6" />
              <span className="text-xs">View Analytics</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Users className="w-6 h-6" />
              <span className="text-xs">Collaborate</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Clock className="w-6 h-6" />
              <span className="text-xs">Schedule Query</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Research Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Current Research Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Cardiovascular Risk Study</span>
                <span className="text-sm text-health-charcoal/70">75%</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Diabetes Treatment Analysis</span>
                <span className="text-sm text-health-charcoal/70">45%</span>
              </div>
              <Progress value={45} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Mental Health Outcomes</span>
                <span className="text-sm text-health-charcoal/70">90%</span>
              </div>
              <Progress value={90} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Cancer Screening Efficacy</span>
                <span className="text-sm text-health-charcoal/70">20%</span>
              </div>
              <Progress value={20} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResearcherDashboard;
