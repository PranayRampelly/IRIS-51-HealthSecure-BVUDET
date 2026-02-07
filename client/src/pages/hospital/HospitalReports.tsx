import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, Download, Calendar, BarChart3, 
  TrendingUp, Users, DollarSign, Activity, CheckCircle, Clock
} from 'lucide-react';

const HospitalReports: React.FC = () => {
  const reports = [
    {
      id: 1,
      name: 'Monthly Patient Report',
      type: 'patient',
      date: '2024-01-20',
      status: 'generated',
      size: '2.3 MB',
      description: 'Comprehensive patient statistics and demographics'
    },
    {
      id: 2,
      name: 'Financial Performance Report',
      type: 'financial',
      date: '2024-01-19',
      status: 'generated',
      size: '1.8 MB',
      description: 'Revenue, expenses, and financial metrics'
    },
    {
      id: 3,
      name: 'Quality Metrics Report',
      type: 'quality',
      date: '2024-01-18',
      status: 'pending',
      size: '0 MB',
      description: 'Patient outcomes and quality indicators'
    },
    {
      id: 4,
      name: 'Staff Performance Report',
      type: 'staff',
      date: '2024-01-17',
      status: 'generated',
      size: '1.2 MB',
      description: 'Staff productivity and performance metrics'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'generated': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'patient': return <Users className="w-4 h-4" />;
      case 'financial': return <DollarSign className="w-4 h-4" />;
      case 'quality': return <BarChart3 className="w-4 h-4" />;
      case 'staff': return <Activity className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hospital Reports</h1>
          <p className="text-gray-600 mt-2">Generate and manage hospital reports</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Report
          </Button>
          <Button>
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
            <p className="text-xs text-muted-foreground">
              Available reports
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Generated</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.filter(r => r.status === 'generated').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Ready for download
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.filter(r => r.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">
              In progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Size</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5.3 MB</div>
            <p className="text-xs text-muted-foreground">
              All reports combined
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Available Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      {getTypeIcon(report.type)}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{report.name}</h3>
                      <p className="text-sm text-gray-600">{report.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{report.size}</p>
                      <p className="text-xs text-gray-600">{report.date}</p>
                    </div>
                    
                    <Badge className={getStatusColor(report.status)}>
                      {report.status}
                    </Badge>
                    
                    <div className="flex space-x-2">
                      {report.status === 'generated' && (
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <FileText className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HospitalReports; 