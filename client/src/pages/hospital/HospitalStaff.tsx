import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, Stethoscope, Heart, Clock, 
  CheckCircle, AlertTriangle, Phone, Mail
} from 'lucide-react';

const HospitalStaff: React.FC = () => {
  const staff = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      role: 'Cardiologist',
      department: 'Cardiology',
      status: 'on-duty',
      phone: '+1-555-0101',
      email: 'sarah.johnson@hospital.com',
      experience: '8 years',
      patients: 12,
      schedule: 'Day Shift'
    },
    {
      id: 2,
      name: 'Dr. Michael Williams',
      role: 'Orthopedic Surgeon',
      department: 'Orthopedics',
      status: 'on-duty',
      phone: '+1-555-0102',
      email: 'michael.williams@hospital.com',
      experience: '12 years',
      patients: 8,
      schedule: 'Day Shift'
    },
    {
      id: 3,
      name: 'Nurse Lisa Brown',
      role: 'Registered Nurse',
      department: 'Emergency',
      status: 'on-duty',
      phone: '+1-555-0103',
      email: 'lisa.brown@hospital.com',
      experience: '5 years',
      patients: 15,
      schedule: 'Night Shift'
    },
    {
      id: 4,
      name: 'Dr. David Wilson',
      role: 'Emergency Physician',
      department: 'Emergency',
      status: 'off-duty',
      phone: '+1-555-0104',
      email: 'david.wilson@hospital.com',
      experience: '6 years',
      patients: 0,
      schedule: 'Day Shift'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-duty': return 'bg-green-100 text-green-800';
      case 'off-duty': return 'bg-gray-100 text-gray-800';
      case 'on-call': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600 mt-2">Manage hospital staff and their schedules</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Clock className="w-4 h-4 mr-2" />
            View Schedule
          </Button>
          <Button>
            <Users className="w-4 h-4 mr-2" />
            Add Staff
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staff.length}</div>
            <p className="text-xs text-muted-foreground">
              Medical professionals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Duty</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {staff.filter(s => s.status === 'on-duty').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently working
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doctors</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {staff.filter(s => s.role.includes('Dr.')).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Medical doctors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nurses</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {staff.filter(s => s.role.includes('Nurse')).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Nursing staff
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Staff List */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {staff.map((member) => (
              <div key={member.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      {member.role.includes('Dr.') ? (
                        <Stethoscope className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Heart className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{member.name}</h3>
                      <p className="text-sm text-gray-600">
                        {member.role} • {member.department}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{member.patients} patients</p>
                      <p className="text-xs text-gray-600">{member.schedule}</p>
                    </div>
                    
                    <Badge className={getStatusColor(member.status)}>
                      {member.status}
                    </Badge>
                    
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Mail className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{member.schedule}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-gray-400" />
                    <span>{member.experience} experience</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{member.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{member.email}</span>
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

export default HospitalStaff; 