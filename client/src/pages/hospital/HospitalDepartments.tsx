import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building, Users, Activity, Stethoscope, 
  Heart, Brain, AlertTriangle, Award
} from 'lucide-react';

const HospitalDepartments: React.FC = () => {
  const departments = [
    {
      id: 1,
      name: 'Cardiology',
      head: 'Dr. Sarah Johnson',
      staff: 15,
      patients: 23,
      beds: 25,
      occupancy: 92,
      status: 'active',
      specialties: ['Interventional Cardiology', 'Electrophysiology', 'Heart Failure'],
      equipment: ['ECG Machines', 'Echo Machines', 'Cath Lab']
    },
    {
      id: 2,
      name: 'Orthopedics',
      head: 'Dr. Michael Williams',
      staff: 12,
      patients: 18,
      beds: 20,
      occupancy: 90,
      status: 'active',
      specialties: ['Joint Replacement', 'Sports Medicine', 'Trauma'],
      equipment: ['X-Ray Machines', 'Surgical Tools', 'Rehabilitation Equipment']
    },
    {
      id: 3,
      name: 'Neurology',
      head: 'Dr. Lisa Brown',
      staff: 10,
      patients: 12,
      beds: 15,
      occupancy: 80,
      status: 'active',
      specialties: ['Stroke Care', 'Epilepsy', 'Movement Disorders'],
      equipment: ['MRI Machines', 'EEG Machines', 'Neurological Tools']
    },
    {
      id: 4,
      name: 'Emergency',
      head: 'Dr. David Wilson',
      staff: 20,
      patients: 8,
      beds: 12,
      occupancy: 67,
      status: 'active',
      specialties: ['Trauma Care', 'Critical Care', 'Emergency Medicine'],
      equipment: ['Ventilators', 'Defibrillators', 'Emergency Tools']
    },
    {
      id: 5,
      name: 'Pediatrics',
      head: 'Dr. Emma Davis',
      staff: 8,
      patients: 15,
      beds: 18,
      occupancy: 83,
      status: 'active',
      specialties: ['General Pediatrics', 'Neonatology', 'Pediatric Surgery'],
      equipment: ['Pediatric Monitors', 'Child-Sized Equipment', 'Play Areas']
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOccupancyColor = (occupancy: number) => {
    if (occupancy >= 90) return 'text-red-600';
    if (occupancy >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Department Management</h1>
          <p className="text-gray-600 mt-2">Manage hospital departments and their operations</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Activity className="w-4 h-4 mr-2" />
            Department Report
          </Button>
          <Button>
            <Building className="w-4 h-4 mr-2" />
            Add Department
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length}</div>
            <p className="text-xs text-muted-foreground">
              Active departments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {departments.reduce((sum, dept) => sum + dept.staff, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Medical staff across departments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {departments.reduce((sum, dept) => sum + dept.patients, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently admitted patients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Beds</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {departments.reduce((sum, dept) => sum + dept.beds, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Available hospital beds
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => (
          <Card key={dept.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  {dept.name === 'Cardiology' && <Heart className="w-5 h-5 mr-2 text-red-500" />}
                  {dept.name === 'Neurology' && <Brain className="w-5 h-5 mr-2 text-purple-500" />}
                  {dept.name === 'Emergency' && <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />}
                  {dept.name === 'Orthopedics' && <Award className="w-5 h-5 mr-2 text-blue-500" />}
                  {dept.name === 'Pediatrics' && <Users className="w-5 h-5 mr-2 text-green-500" />}
                  {dept.name}
                </CardTitle>
                <Badge className={getStatusColor(dept.status)}>
                  {dept.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Head of Department</p>
                  <p className="font-medium">{dept.head}</p>
                </div>
                <div>
                  <p className="text-gray-600">Staff</p>
                  <p className="font-medium">{dept.staff} members</p>
                </div>
                <div>
                  <p className="text-gray-600">Patients</p>
                  <p className="font-medium">{dept.patients}</p>
                </div>
                <div>
                  <p className="text-gray-600">Beds</p>
                  <p className="font-medium">{dept.beds}</p>
                </div>
              </div>
              
              <div>
                <p className="text-gray-600 text-sm">Occupancy Rate</p>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getOccupancyColor(dept.occupancy).replace('text-', 'bg-')}`}
                      style={{ width: `${dept.occupancy}%` }}
                    ></div>
                  </div>
                  <span className={`text-sm font-medium ${getOccupancyColor(dept.occupancy)}`}>
                    {dept.occupancy}%
                  </span>
                </div>
              </div>

              <div>
                <p className="text-gray-600 text-sm mb-2">Specialties</p>
                <div className="flex flex-wrap gap-1">
                  {dept.specialties.map((specialty, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button size="sm" variant="outline" className="flex-1">
                  View Details
                </Button>
                <Button size="sm" variant="outline">
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HospitalDepartments; 