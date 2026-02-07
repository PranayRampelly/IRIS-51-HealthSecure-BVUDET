import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  Video, 
  Phone, 
  MessageSquare,
  Search,
  Filter,
  Download,
  Eye,
  BarChart3,
  TrendingUp,
  Users,
  Activity
} from 'lucide-react';

interface Consultation {
  id: string;
  patientName: string;
  patientId: string;
  date: string;
  time: string;
  duration: number;
  type: 'video' | 'phone' | 'in-person';
  status: 'completed' | 'cancelled' | 'no-show';
  specialty: string;
  diagnosis?: string;
  prescription?: string;
  notes?: string;
  followUpDate?: string;
  rating?: number;
}

interface ConsultationStats {
  totalConsultations: number;
  completedConsultations: number;
  cancelledConsultations: number;
  averageRating: number;
  totalDuration: number;
  topSpecialties: Array<{ specialty: string; count: number }>;
  monthlyTrends: Array<{ month: string; count: number }>;
}

const DoctorConsultationHistory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('30d');
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);

  const consultations: Consultation[] = [
    {
      id: '1',
      patientName: 'Sarah Johnson',
      patientId: 'P001',
      date: '2024-01-15',
      time: '10:00 AM',
      duration: 30,
      type: 'video',
      status: 'completed',
      specialty: 'Cardiology',
      diagnosis: 'Hypertension',
      prescription: 'Lisinopril 10mg daily',
      notes: 'Patient reports improved blood pressure readings. Continue current medication.',
      followUpDate: '2024-02-15',
      rating: 5
    },
    {
      id: '2',
      patientName: 'Michael Chen',
      patientId: 'P002',
      date: '2024-01-14',
      time: '2:30 PM',
      duration: 45,
      type: 'in-person',
      status: 'completed',
      specialty: 'Dermatology',
      diagnosis: 'Eczema',
      prescription: 'Hydrocortisone cream 1%',
      notes: 'Patient has mild eczema on arms. Prescribed topical treatment.',
      followUpDate: '2024-01-28',
      rating: 4
    },
    {
      id: '3',
      patientName: 'Emily Davis',
      patientId: 'P003',
      date: '2024-01-13',
      time: '11:15 AM',
      duration: 20,
      type: 'phone',
      status: 'cancelled',
      specialty: 'General Medicine',
      diagnosis: '',
      prescription: '',
      notes: 'Patient cancelled due to emergency',
      rating: undefined
    },
    {
      id: '4',
      patientName: 'Robert Wilson',
      patientId: 'P004',
      date: '2024-01-12',
      time: '3:00 PM',
      duration: 60,
      type: 'video',
      status: 'completed',
      specialty: 'Psychiatry',
      diagnosis: 'Anxiety Disorder',
      prescription: 'Sertraline 50mg daily',
      notes: 'Patient reports improved mood and reduced anxiety symptoms.',
      followUpDate: '2024-02-12',
      rating: 5
    },
    {
      id: '5',
      patientName: 'Lisa Brown',
      patientId: 'P005',
      date: '2024-01-11',
      time: '9:00 AM',
      duration: 30,
      type: 'in-person',
      status: 'no-show',
      specialty: 'Gynecology',
      diagnosis: '',
      prescription: '',
      notes: 'Patient did not show up for appointment',
      rating: undefined
    }
  ];

  const stats: ConsultationStats = {
    totalConsultations: 156,
    completedConsultations: 142,
    cancelledConsultations: 8,
    averageRating: 4.6,
    totalDuration: 4680,
    topSpecialties: [
      { specialty: 'General Medicine', count: 45 },
      { specialty: 'Cardiology', count: 32 },
      { specialty: 'Dermatology', count: 28 },
      { specialty: 'Psychiatry', count: 25 },
      { specialty: 'Gynecology', count: 20 }
    ],
    monthlyTrends: [
      { month: 'Jan', count: 45 },
      { month: 'Feb', count: 52 },
      { month: 'Mar', count: 48 },
      { month: 'Apr', count: 55 },
      { month: 'May', count: 61 },
      { month: 'Jun', count: 58 }
    ]
  };

  const filteredConsultations = consultations.filter(consultation => {
    const matchesSearch = consultation.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consultation.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || consultation.status === statusFilter;
    const matchesType = typeFilter === 'all' || consultation.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      'no-show': 'bg-yellow-100 text-yellow-800'
    };
    return <Badge className={variants[status]}>{status}</Badge>;
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      video: <Video className="w-4 h-4" />,
      phone: <Phone className="w-4 h-4" />,
      'in-person': <User className="w-4 h-4" />
    };
    return icons[type];
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, string> = {
      video: 'bg-blue-100 text-blue-800',
      phone: 'bg-purple-100 text-purple-800',
      'in-person': 'bg-green-100 text-green-800'
    };
    return <Badge className={variants[type]}>{type}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Consultation History</h1>
          <p className="text-gray-600 mt-1">View and manage your past consultations</p>
        </div>
        <div className="flex items-center space-x-2">
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
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Consultations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalConsultations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedConsultations}</p>
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
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageRating}/5</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round(stats.totalDuration / 60)}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search consultations..."
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
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="no-show">No Show</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="in-person">In-Person</SelectItem>
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
      <Tabs defaultValue="consultations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="consultations">Consultations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="specialties">Top Specialties</TabsTrigger>
        </TabsList>

        <TabsContent value="consultations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Consultations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredConsultations.map((consultation) => (
                  <div key={consultation.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(consultation.type)}
                          {getTypeBadge(consultation.type)}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{consultation.patientName}</h3>
                          <p className="text-sm text-gray-600">{consultation.specialty}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(consultation.date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">{consultation.time}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">{consultation.duration} min</p>
                          {consultation.rating && (
                            <p className="text-sm text-yellow-600">★ {consultation.rating}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(consultation.status)}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Consultation Details</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm font-medium text-gray-600">Patient</p>
                                    <p className="text-gray-900">{consultation.patientName}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-600">Date & Time</p>
                                    <p className="text-gray-900">
                                      {new Date(consultation.date).toLocaleDateString()} at {consultation.time}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-600">Duration</p>
                                    <p className="text-gray-900">{consultation.duration} minutes</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-600">Type</p>
                                    <p className="text-gray-900">{consultation.type}</p>
                                  </div>
                                </div>
                                
                                {consultation.diagnosis && (
                                  <div>
                                    <p className="text-sm font-medium text-gray-600">Diagnosis</p>
                                    <p className="text-gray-900">{consultation.diagnosis}</p>
                                  </div>
                                )}
                                
                                {consultation.prescription && (
                                  <div>
                                    <p className="text-sm font-medium text-gray-600">Prescription</p>
                                    <p className="text-gray-900">{consultation.prescription}</p>
                                  </div>
                                )}
                                
                                {consultation.notes && (
                                  <div>
                                    <p className="text-sm font-medium text-gray-600">Notes</p>
                                    <p className="text-gray-900">{consultation.notes}</p>
                                  </div>
                                )}
                                
                                {consultation.followUpDate && (
                                  <div>
                                    <p className="text-sm font-medium text-gray-600">Follow-up Date</p>
                                    <p className="text-gray-900">
                                      {new Date(consultation.followUpDate).toLocaleDateString()}
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
                <CardTitle>Consultation Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Video Consultations</span>
                    <span className="text-sm font-medium text-gray-900">65%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">In-Person</span>
                    <span className="text-sm font-medium text-gray-900">25%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Phone</span>
                    <span className="text-sm font-medium text-gray-900">10%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="specialties" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Specialties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.topSpecialties.map((specialty, index) => (
                  <div key={specialty.specialty} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                      <span className="text-sm font-medium text-gray-900">{specialty.specialty}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-health-aqua h-2 rounded-full" 
                          style={{ width: `${(specialty.count / Math.max(...stats.topSpecialties.map(s => s.count))) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{specialty.count}</span>
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

export default DoctorConsultationHistory; 