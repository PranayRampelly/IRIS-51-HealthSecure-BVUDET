import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Plus, Users, Calendar, Clock, AlertTriangle, 
  CheckCircle, X, Activity
} from 'lucide-react';

const HospitalAdmissions: React.FC = () => {
  const admissions = [
    {
      id: 1,
      patientName: 'John Smith',
      age: 45,
      department: 'Cardiology',
      admissionDate: '2024-01-20',
      admissionTime: '09:30',
      status: 'pending',
      priority: 'high',
      reason: 'Chest pain and shortness of breath',
      assignedDoctor: 'Dr. Johnson',
      room: '301'
    },
    {
      id: 2,
      patientName: 'Sarah Wilson',
      age: 32,
      department: 'Orthopedics',
      admissionDate: '2024-01-20',
      admissionTime: '10:15',
      status: 'admitted',
      priority: 'medium',
      reason: 'Fractured ankle from fall',
      assignedDoctor: 'Dr. Williams',
      room: '205'
    },
    {
      id: 3,
      patientName: 'Mike Brown',
      age: 28,
      department: 'Emergency',
      admissionDate: '2024-01-20',
      admissionTime: '11:45',
      status: 'emergency',
      priority: 'critical',
      reason: 'Severe abdominal pain',
      assignedDoctor: 'Dr. Davis',
      room: 'ER-02'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'admitted': return 'bg-green-100 text-green-800';
      case 'emergency': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admissions Management</h1>
          <p className="text-gray-600 mt-2">Manage patient admissions and bed assignments</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Activity className="w-4 h-4 mr-2" />
            View Schedule
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Admission
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Admissions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{admissions.length}</div>
            <p className="text-xs text-muted-foreground">
              New admissions today
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
              {admissions.filter(a => a.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting admission
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emergency</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {admissions.filter(a => a.status === 'emergency').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Emergency cases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admitted</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {admissions.filter(a => a.status === 'admitted').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully admitted
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Admissions List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Admissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {admissions.map((admission) => (
              <div key={admission.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{admission.patientName}</h3>
                      <p className="text-sm text-gray-600">
                        {admission.age} years • {admission.department} • Room {admission.room}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{admission.reason}</p>
                      <p className="text-xs text-gray-600">{admission.assignedDoctor}</p>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <Badge className={getStatusColor(admission.status)}>
                        {admission.status}
                      </Badge>
                      <Badge className={getPriorityColor(admission.priority)}>
                        {admission.priority}
                      </Badge>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{admission.admissionDate}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{admission.admissionTime}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>{admission.assignedDoctor}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-gray-400" />
                    <span>Priority: {admission.priority}</span>
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

export default HospitalAdmissions; 