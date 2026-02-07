import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Pill, 
  Calendar, 
  User, 
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Plus,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  TrendingUp,
  Activity
} from 'lucide-react';

interface Prescription {
  id: string;
  patientName: string;
  patientId: string;
  date: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }>;
  status: 'active' | 'completed' | 'discontinued' | 'expired';
  refills: number;
  totalRefills: number;
  nextRefillDate?: string;
  notes?: string;
  followUpDate?: string;
}

interface PrescriptionStats {
  totalPrescriptions: number;
  activePrescriptions: number;
  completedPrescriptions: number;
  averageRefills: number;
  topMedications: Array<{ name: string; count: number }>;
  monthlyTrends: Array<{ month: string; count: number }>;
}

const DoctorPrescriptionHistory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('30d');
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);

  const prescriptions: Prescription[] = [
    {
      id: '1',
      patientName: 'Sarah Johnson',
      patientId: 'P001',
      date: '2024-01-15',
      medications: [
        {
          name: 'Lisinopril',
          dosage: '10mg',
          frequency: 'Once daily',
          duration: '30 days',
          instructions: 'Take in the morning'
        },
        {
          name: 'Metformin',
          dosage: '500mg',
          frequency: 'Twice daily',
          duration: '30 days',
          instructions: 'Take with meals'
        }
      ],
      status: 'active',
      refills: 2,
      totalRefills: 3,
      nextRefillDate: '2024-02-15',
      notes: 'Patient reports good blood pressure control',
      followUpDate: '2024-02-15'
    },
    {
      id: '2',
      patientName: 'Michael Chen',
      patientId: 'P002',
      date: '2024-01-14',
      medications: [
        {
          name: 'Hydrocortisone cream',
          dosage: '1%',
          frequency: 'Twice daily',
          duration: '14 days',
          instructions: 'Apply to affected areas'
        }
      ],
      status: 'completed',
      refills: 0,
      totalRefills: 1,
      notes: 'Eczema resolved',
      followUpDate: '2024-01-28'
    },
    {
      id: '3',
      patientName: 'Emily Davis',
      patientId: 'P003',
      date: '2024-01-13',
      medications: [
        {
          name: 'Sertraline',
          dosage: '50mg',
          frequency: 'Once daily',
          duration: '30 days',
          instructions: 'Take in the morning'
        }
      ],
      status: 'active',
      refills: 1,
      totalRefills: 2,
      nextRefillDate: '2024-02-13',
      notes: 'Patient reports improved mood',
      followUpDate: '2024-02-13'
    },
    {
      id: '4',
      patientName: 'Robert Wilson',
      patientId: 'P004',
      date: '2024-01-12',
      medications: [
        {
          name: 'Ibuprofen',
          dosage: '400mg',
          frequency: 'As needed',
          duration: '7 days',
          instructions: 'Take for pain relief'
        }
      ],
      status: 'discontinued',
      refills: 0,
      totalRefills: 1,
      notes: 'Patient no longer needs pain medication'
    },
    {
      id: '5',
      patientName: 'Lisa Brown',
      patientId: 'P005',
      date: '2024-01-11',
      medications: [
        {
          name: 'Amoxicillin',
          dosage: '500mg',
          frequency: 'Three times daily',
          duration: '10 days',
          instructions: 'Take with food'
        }
      ],
      status: 'completed',
      refills: 0,
      totalRefills: 1,
      notes: 'Antibiotic course completed'
    }
  ];

  const stats: PrescriptionStats = {
    totalPrescriptions: 89,
    activePrescriptions: 45,
    completedPrescriptions: 38,
    averageRefills: 2.3,
    topMedications: [
      { name: 'Lisinopril', count: 15 },
      { name: 'Metformin', count: 12 },
      { name: 'Sertraline', count: 10 },
      { name: 'Hydrocortisone', count: 8 },
      { name: 'Ibuprofen', count: 6 }
    ],
    monthlyTrends: [
      { month: 'Jan', count: 25 },
      { month: 'Feb', count: 28 },
      { month: 'Mar', count: 22 },
      { month: 'Apr', count: 30 },
      { month: 'May', count: 35 },
      { month: 'Jun', count: 32 }
    ]
  };

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.medications.some(med => med.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || prescription.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      discontinued: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800'
    };
    return <Badge className={variants[status]}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prescription History</h1>
          <p className="text-gray-600 mt-1">View and manage patient prescriptions</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Prescription
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Pill className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Prescriptions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPrescriptions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activePrescriptions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Refills</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageRefills}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedPrescriptions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search prescriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="discontinued">Discontinued</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="prescriptions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="medications">Top Medications</TabsTrigger>
        </TabsList>

        <TabsContent value="prescriptions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Prescriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredPrescriptions.map((prescription) => (
                  <div key={prescription.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Pill className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{prescription.patientName}</h3>
                          <p className="text-sm text-gray-600">
                            {prescription.medications.length} medication(s)
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(prescription.date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            Refills: {prescription.refills}/{prescription.totalRefills}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(prescription.status)}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Prescription Details</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm font-medium text-gray-600">Patient</p>
                                    <p className="text-gray-900">{prescription.patientName}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-600">Date</p>
                                    <p className="text-gray-900">
                                      {new Date(prescription.date).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-600">Status</p>
                                    <p className="text-gray-900">{prescription.status}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-600">Refills</p>
                                    <p className="text-gray-900">
                                      {prescription.refills}/{prescription.totalRefills}
                                    </p>
                                  </div>
                                </div>
                                
                                <div>
                                  <p className="text-sm font-medium text-gray-600 mb-2">Medications</p>
                                  <div className="space-y-2">
                                    {prescription.medications.map((medication, index) => (
                                      <div key={index} className="p-3 bg-gray-50 rounded">
                                        <div className="flex items-center justify-between mb-2">
                                          <h4 className="font-medium">{medication.name}</h4>
                                          <Badge variant="outline">{medication.dosage}</Badge>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                          <div>
                                            <span className="text-gray-600">Frequency:</span>
                                            <span className="ml-1">{medication.frequency}</span>
                                          </div>
                                          <div>
                                            <span className="text-gray-600">Duration:</span>
                                            <span className="ml-1">{medication.duration}</span>
                                          </div>
                                        </div>
                                        {medication.instructions && (
                                          <p className="text-sm text-gray-600 mt-1">
                                            {medication.instructions}
                                          </p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                
                                {prescription.notes && (
                                  <div>
                                    <p className="text-sm font-medium text-gray-600">Notes</p>
                                    <p className="text-gray-900">{prescription.notes}</p>
                                  </div>
                                )}
                                
                                {prescription.followUpDate && (
                                  <div>
                                    <p className="text-sm font-medium text-gray-600">Follow-up Date</p>
                                    <p className="text-gray-900">
                                      {new Date(prescription.followUpDate).toLocaleDateString()}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.monthlyTrends.map((trend) => (
                    <div key={trend.month} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">{trend.month}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-health-aqua h-2 rounded-full" 
                            style={{ width: `${(trend.count / Math.max(...stats.monthlyTrends.map(t => t.count))) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{trend.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Prescription Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Active</span>
                    <span className="text-sm font-medium text-gray-900">{stats.activePrescriptions}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Completed</span>
                    <span className="text-sm font-medium text-gray-900">{stats.completedPrescriptions}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Discontinued</span>
                    <span className="text-sm font-medium text-gray-900">
                      {stats.totalPrescriptions - stats.activePrescriptions - stats.completedPrescriptions}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="medications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Most Prescribed Medications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.topMedications.map((medication, index) => (
                  <div key={medication.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                      <span className="text-sm font-medium text-gray-900">{medication.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-health-aqua h-2 rounded-full" 
                          style={{ width: `${(medication.count / Math.max(...stats.topMedications.map(m => m.count))) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{medication.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DoctorPrescriptionHistory; 