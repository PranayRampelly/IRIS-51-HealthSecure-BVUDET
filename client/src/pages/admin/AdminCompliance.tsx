
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  FileText, 
  Download,
  Calendar,
  Clock,
  Users,
  Database,
  Lock,
  Eye,
  Clipboard,
  AlertCircle
} from 'lucide-react';

const AdminCompliance = () => {
  const [selectedFramework, setSelectedFramework] = useState('hipaa');

  const complianceFrameworks = {
    hipaa: {
      name: 'HIPAA',
      fullName: 'Health Insurance Portability and Accountability Act',
      score: 92,
      status: 'compliant',
      lastAudit: '2024-03-15',
      nextAudit: '2024-09-15',
      requirements: [
        { id: 1, name: 'Administrative Safeguards', status: 'compliant', score: 95, items: 8 },
        { id: 2, name: 'Physical Safeguards', status: 'compliant', score: 98, items: 4 },
        { id: 3, name: 'Technical Safeguards', status: 'warning', score: 85, items: 6 },
        { id: 4, name: 'Privacy Rule', status: 'compliant', score: 94, items: 12 },
        { id: 5, name: 'Security Rule', status: 'compliant', score: 90, items: 10 },
        { id: 6, name: 'Breach Notification', status: 'compliant', score: 100, items: 3 }
      ]
    },
    gdpr: {
      name: 'GDPR',
      fullName: 'General Data Protection Regulation',
      score: 88,
      status: 'compliant',
      lastAudit: '2024-02-20',
      nextAudit: '2024-08-20',
      requirements: [
        { id: 1, name: 'Lawfulness of Processing', status: 'compliant', score: 92, items: 6 },
        { id: 2, name: 'Data Subject Rights', status: 'warning', score: 78, items: 8 },
        { id: 3, name: 'Data Protection by Design', status: 'compliant', score: 95, items: 5 },
        { id: 4, name: 'Records of Processing', status: 'compliant', score: 90, items: 4 },
        { id: 5, name: 'Data Breach Notification', status: 'compliant', score: 85, items: 3 },
        { id: 6, name: 'Data Protection Officer', status: 'compliant', score: 100, items: 2 }
      ]
    },
    sox: {
      name: 'SOX',
      fullName: 'Sarbanes-Oxley Act',
      score: 85,
      status: 'warning',
      lastAudit: '2024-01-10',
      nextAudit: '2024-07-10',
      requirements: [
        { id: 1, name: 'Internal Controls', status: 'compliant', score: 88, items: 15 },
        { id: 2, name: 'Financial Reporting', status: 'warning', score: 75, items: 8 },
        { id: 3, name: 'Audit Committee', status: 'compliant', score: 92, items: 5 },
        { id: 4, name: 'Management Assessment', status: 'warning', score: 80, items: 6 },
        { id: 5, name: 'External Auditor', status: 'compliant', score: 90, items: 4 }
      ]
    }
  };

  const recentAudits = [
    {
      date: '2024-03-15',
      framework: 'HIPAA',
      auditor: 'CyberSec Compliance',
      result: 'Passed',
      score: 92,
      findings: 3
    },
    {
      date: '2024-02-20',
      framework: 'GDPR',
      auditor: 'EU Compliance Partners',
      result: 'Passed',
      score: 88,
      findings: 5
    },
    {
      date: '2024-01-10',
      framework: 'SOX',
      auditor: 'Financial Audit Corp',
      result: 'Conditional',
      score: 85,
      findings: 8
    }
  ];

  const upcomingTasks = [
    {
      id: 1,
      task: 'Update Privacy Policy',
      framework: 'GDPR',
      dueDate: '2024-06-15',
      priority: 'high',
      assignee: 'Legal Team'
    },
    {
      id: 2,
      task: 'Quarterly Security Assessment',
      framework: 'HIPAA',
      dueDate: '2024-06-20',
      priority: 'medium',
      assignee: 'Security Team'
    },
    {
      id: 3,
      task: 'Financial Controls Review',
      framework: 'SOX',
      dueDate: '2024-06-25',
      priority: 'high',
      assignee: 'Finance Team'
    },
    {
      id: 4,
      task: 'Data Retention Policy Update',
      framework: 'HIPAA',
      dueDate: '2024-07-01',
      priority: 'low',
      assignee: 'Compliance Team'
    }
  ];

  const complianceMetrics = [
    { label: 'Overall Compliance Score', value: '88%', trend: '+2%', icon: Shield },
    { label: 'Active Frameworks', value: '3', trend: 'stable', icon: FileText },
    { label: 'Open Findings', value: '16', trend: '-4', icon: AlertTriangle },
    { label: 'Upcoming Audits', value: '2', trend: 'stable', icon: Calendar }
  ];

  const currentFramework = complianceFrameworks[selectedFramework];

  const getStatusColor = (status) => {
    switch (status) {
      case 'compliant': return 'bg-health-success text-white';
      case 'warning': return 'bg-health-warning text-white';
      case 'critical': return 'bg-health-danger text-white';
      default: return 'bg-health-blue-gray text-white';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-health-danger text-white';
      case 'medium': return 'bg-health-warning text-white';
      case 'low': return 'bg-health-success text-white';
      default: return 'bg-health-blue-gray text-white';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-montserrat font-bold text-health-teal">Compliance Dashboard</h1>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button size="sm">
            <Clipboard className="h-4 w-4 mr-2" />
            Schedule Audit
          </Button>
        </div>
      </div>

      {/* Compliance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {complianceMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-health-charcoal">{metric.label}</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-2xl font-bold text-health-teal">{metric.value}</p>
                      {metric.trend !== 'stable' && (
                        <Badge variant={metric.trend.startsWith('+') ? 'default' : 'secondary'} className="text-xs">
                          {metric.trend}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Icon className="h-8 w-8 text-health-teal" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="frameworks" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
          <TabsTrigger value="audits">Audit History</TabsTrigger>
          <TabsTrigger value="tasks">Compliance Tasks</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="frameworks" className="space-y-6">
          {/* Framework Selector */}
          <Card>
            <CardContent className="p-6">
              <div className="flex space-x-4">
                {Object.entries(complianceFrameworks).map(([key, framework]) => (
                  <Button
                    key={key}
                    variant={selectedFramework === key ? 'default' : 'outline'}
                    onClick={() => setSelectedFramework(key)}
                    className="flex-1"
                  >
                    {framework.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Framework Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-health-teal" />
                    {currentFramework.fullName}
                  </span>
                  <Badge className={getStatusColor(currentFramework.status)}>
                    {currentFramework.status.toUpperCase()}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-health-charcoal">Overall Compliance Score</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={currentFramework.score} className="w-24" />
                    <span className="text-sm font-bold text-health-teal">{currentFramework.score}%</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {currentFramework.requirements.map((req) => (
                    <div key={req.id} className="flex items-center justify-between p-3 rounded-lg border border-health-blue-gray/20">
                      <div className="flex items-center space-x-3">
                        {req.status === 'compliant' ? (
                          <CheckCircle className="h-5 w-5 text-health-success" />
                        ) : req.status === 'warning' ? (
                          <AlertTriangle className="h-5 w-5 text-health-warning" />
                        ) : (
                          <XCircle className="h-5 w-5 text-health-danger" />
                        )}
                        <div>
                          <p className="font-medium text-health-charcoal">{req.name}</p>
                          <p className="text-sm text-health-blue-gray">{req.items} items</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={req.score} className="w-16" />
                        <span className="text-sm font-medium text-health-teal">{req.score}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-health-teal" />
                  Audit Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm text-health-charcoal">Last Audit</Label>
                  <p className="font-medium text-health-teal">{currentFramework.lastAudit}</p>
                </div>
                <div>
                  <Label className="text-sm text-health-charcoal">Next Audit</Label>
                  <p className="font-medium text-health-teal">{currentFramework.nextAudit}</p>
                </div>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your next {currentFramework.name} audit is scheduled in 3 months.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clipboard className="h-5 w-5 mr-2 text-health-teal" />
                Recent Audit Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAudits.map((audit, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-health-blue-gray/20">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-health-charcoal">{audit.framework} Audit</h3>
                        <Badge className={audit.result === 'Passed' ? 'bg-health-success text-white' : 'bg-health-warning text-white'}>
                          {audit.result}
                        </Badge>
                      </div>
                      <p className="text-sm text-health-blue-gray">Auditor: {audit.auditor}</p>
                      <p className="text-sm text-health-blue-gray">Date: {audit.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-health-teal">{audit.score}%</p>
                      <p className="text-sm text-health-blue-gray">{audit.findings} findings</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-health-teal" />
                Upcoming Compliance Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 rounded-lg border border-health-blue-gray/20">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-health-charcoal">{task.task}</h3>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-health-blue-gray">Framework: {task.framework}</p>
                      <p className="text-sm text-health-blue-gray">Assignee: {task.assignee}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-health-teal">{task.dueDate}</p>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-health-teal" />
                Compliance Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button variant="outline" className="h-24 flex flex-col">
                  <FileText className="h-8 w-8 mb-2 text-health-teal" />
                  HIPAA Compliance Report
                </Button>
                <Button variant="outline" className="h-24 flex flex-col">
                  <FileText className="h-8 w-8 mb-2 text-health-teal" />
                  GDPR Assessment
                </Button>
                <Button variant="outline" className="h-24 flex flex-col">
                  <FileText className="h-8 w-8 mb-2 text-health-teal" />
                  SOX Controls Matrix
                </Button>
                <Button variant="outline" className="h-24 flex flex-col">
                  <Shield className="h-8 w-8 mb-2 text-health-teal" />
                  Security Assessment
                </Button>
                <Button variant="outline" className="h-24 flex flex-col">
                  <Users className="h-8 w-8 mb-2 text-health-teal" />
                  Access Review Report
                </Button>
                <Button variant="outline" className="h-24 flex flex-col">
                  <Database className="h-8 w-8 mb-2 text-health-teal" />
                  Data Flow Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminCompliance;
