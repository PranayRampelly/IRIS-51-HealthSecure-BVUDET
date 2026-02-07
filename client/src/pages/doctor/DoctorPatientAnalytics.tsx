import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, TrendingUp, Calendar, Activity, Heart, Brain,
  ArrowUp, ArrowDown, Eye, Download, Filter,
  BarChart, PieChart, LineChart, Target, Award,
  MapPin, Clock, Star, MessageSquare, FileText
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface PatientAnalytics {
  totalPatients: number;
  newPatients: number;
  activePatients: number;
  averageAge: number;
  genderDistribution: { male: number; female: number; other: number };
  topConditions: Array<{ condition: string; count: number; trend: number }>;
  ageGroups: Array<{ group: string; count: number; percentage: number }>;
  visitFrequency: Array<{ month: string; visits: number }>;
  treatmentOutcomes: Array<{ outcome: string; count: number; percentage: number }>;
  patientSatisfaction: number;
  averageWaitTime: number;
}

const DoctorPatientAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');

  const analyticsData: PatientAnalytics = {
    totalPatients: 1247,
    newPatients: 89,
    activePatients: 1156,
    averageAge: 42.3,
    genderDistribution: { male: 45, female: 52, other: 3 },
    topConditions: [
      { condition: 'Hypertension', count: 234, trend: 12.5 },
      { condition: 'Diabetes', count: 189, trend: 8.3 },
      { condition: 'Cardiovascular Disease', count: 156, trend: 15.2 },
      { condition: 'Respiratory Issues', count: 134, trend: 6.7 },
      { condition: 'Mental Health', count: 98, trend: 9.1 },
    ],
    ageGroups: [
      { group: '18-25', count: 156, percentage: 12.5 },
      { group: '26-35', count: 234, percentage: 18.8 },
      { group: '36-45', count: 312, percentage: 25.0 },
      { group: '46-55', count: 298, percentage: 23.9 },
      { group: '56-65', count: 156, percentage: 12.5 },
      { group: '65+', count: 91, percentage: 7.3 },
    ],
    visitFrequency: [
      { month: 'Jan', visits: 245 },
      { month: 'Feb', visits: 267 },
      { month: 'Mar', visits: 289 },
      { month: 'Apr', visits: 312 },
      { month: 'May', visits: 298 },
      { month: 'Jun', visits: 324 },
    ],
    treatmentOutcomes: [
      { outcome: 'Excellent', count: 456, percentage: 36.6 },
      { outcome: 'Good', count: 523, percentage: 42.0 },
      { outcome: 'Fair', count: 189, percentage: 15.2 },
      { outcome: 'Poor', count: 79, percentage: 6.2 },
    ],
    patientSatisfaction: 4.6,
    averageWaitTime: 12.3,
  };

  const metrics = [
    {
      title: 'Total Patients',
      value: analyticsData.totalPatients,
      icon: Users,
      growth: 8.5,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'New Patients',
      value: analyticsData.newPatients,
      icon: TrendingUp,
      growth: 12.3,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Active Patients',
      value: analyticsData.activePatients,
      icon: Activity,
      growth: 5.7,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Average Age',
      value: `${analyticsData.averageAge} years`,
      icon: Calendar,
      growth: -2.1,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Satisfaction',
      value: `${analyticsData.patientSatisfaction}/5`,
      icon: Star,
      growth: 3.2,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Wait Time',
      value: `${analyticsData.averageWaitTime} min`,
      icon: Clock,
      growth: -8.5,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  const topPatients = [
    {
      id: '1',
      name: 'John Doe',
      age: 35,
      visits: 12,
      lastVisit: '2024-01-15',
      condition: 'Hypertension',
      satisfaction: 4.8,
      avatar: '/placeholder.svg'
    },
    {
      id: '2',
      name: 'Jane Smith',
      age: 28,
      visits: 8,
      lastVisit: '2024-01-10',
      condition: 'Diabetes',
      satisfaction: 4.6,
      avatar: '/placeholder.svg'
    },
    {
      id: '3',
      name: 'Mike Johnson',
      age: 42,
      visits: 15,
      lastVisit: '2024-01-08',
      condition: 'Cardiovascular',
      satisfaction: 4.9,
      avatar: '/placeholder.svg'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-health-charcoal">Patient Analytics</h1>
          <p className="text-health-blue-gray mt-2">Analyze patient demographics and health trends</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Specialty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specialties</SelectItem>
              <SelectItem value="cardiology">Cardiology</SelectItem>
              <SelectItem value="dermatology">Dermatology</SelectItem>
              <SelectItem value="orthopedics">Orthopedics</SelectItem>
              <SelectItem value="neurology">Neurology</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const isPositive = metric.growth >= 0;
          
          return (
            <Card key={metric.title} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-health-blue-gray">{metric.title}</p>
                    <p className="text-2xl font-bold text-health-charcoal mt-1">{metric.value}</p>
                    <div className="flex items-center mt-2">
                      {isPositive ? (
                        <ArrowUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <ArrowDown className="w-4 h-4 text-red-600" />
                      )}
                      <span className={`text-sm font-medium ml-1 ${
                        isPositive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {Math.abs(metric.growth)}%
                      </span>
                      <span className="text-sm text-health-blue-gray ml-1">vs last period</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-full ${metric.bgColor}`}>
                    <Icon className={`w-6 h-6 ${metric.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="demographics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="conditions">Conditions</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
          <TabsTrigger value="top-patients">Top Patients</TabsTrigger>
        </TabsList>

        <TabsContent value="demographics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gender Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-health-aqua" />
                  <span>Gender Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span>Male</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{analyticsData.genderDistribution.male}%</span>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${analyticsData.genderDistribution.male}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-pink-500 rounded"></div>
                      <span>Female</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{analyticsData.genderDistribution.female}%</span>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-pink-500 h-2 rounded-full" style={{ width: `${analyticsData.genderDistribution.female}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-purple-500 rounded"></div>
                      <span>Other</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{analyticsData.genderDistribution.other}%</span>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${analyticsData.genderDistribution.other}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Age Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-health-success" />
                  <span>Age Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.ageGroups.map((group) => (
                    <div key={group.group} className="flex items-center justify-between">
                      <span className="text-sm text-health-blue-gray">{group.group}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{group.count}</span>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-health-success h-2 rounded-full" style={{ width: `${group.percentage}%` }} />
                        </div>
                        <span className="text-sm text-health-blue-gray">{group.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conditions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-health-warning" />
                <span>Top Medical Conditions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.topConditions.map((condition, index) => (
                  <div key={condition.condition} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-health-warning rounded-full flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-health-charcoal">{condition.condition}</p>
                        <p className="text-sm text-health-blue-gray">{condition.count} patients</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-green-600 font-medium">+{condition.trend}%</span>
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Visit Frequency */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-health-aqua" />
                  <span>Visit Frequency Trend</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between space-x-2">
                  {analyticsData.visitFrequency.map((item, index) => (
                    <div key={index} className="flex flex-col items-center space-y-2">
                      <div 
                        className="w-8 bg-health-aqua rounded-t"
                        style={{ height: `${(item.visits / 400) * 200}px` }}
                      />
                      <span className="text-xs text-health-blue-gray">{item.month}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Patient Growth */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-health-success" />
                  <span>Patient Growth</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-health-blue-gray">New Patients</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-health-success h-2 rounded-full" style={{ width: '75%' }} />
                      </div>
                      <span className="text-sm font-medium">+12.3%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-health-blue-gray">Returning Patients</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-health-aqua h-2 rounded-full" style={{ width: '88%' }} />
                      </div>
                      <span className="text-sm font-medium">+8.7%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-health-blue-gray">Active Patients</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-health-warning h-2 rounded-full" style={{ width: '92%' }} />
                      </div>
                      <span className="text-sm font-medium">+5.2%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="outcomes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-health-aqua" />
                <span>Treatment Outcomes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.treatmentOutcomes.map((outcome) => (
                  <div key={outcome.outcome} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${
                        outcome.outcome === 'Excellent' ? 'bg-green-500' :
                        outcome.outcome === 'Good' ? 'bg-blue-500' :
                        outcome.outcome === 'Fair' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <span className="font-medium text-health-charcoal">{outcome.outcome}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{outcome.count} patients</span>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className={`h-2 rounded-full ${
                          outcome.outcome === 'Excellent' ? 'bg-green-500' :
                          outcome.outcome === 'Good' ? 'bg-blue-500' :
                          outcome.outcome === 'Fair' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} style={{ width: `${outcome.percentage}%` }} />
                      </div>
                      <span className="text-sm text-health-blue-gray">{outcome.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="top-patients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-health-aqua" />
                <span>Top Patients by Engagement</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPatients.map((patient, index) => (
                  <div key={patient.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-health-aqua rounded-full flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={patient.avatar} />
                        <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-health-charcoal">{patient.name}</p>
                        <p className="text-sm text-health-blue-gray">{patient.age} years • {patient.condition}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className="text-sm text-health-blue-gray">Visits</p>
                        <p className="font-medium text-health-charcoal">{patient.visits}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-health-blue-gray">Satisfaction</p>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="font-medium">{patient.satisfaction}</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-health-blue-gray">Last Visit</p>
                        <p className="font-medium text-health-charcoal">{new Date(patient.lastVisit).toLocaleDateString()}</p>
                      </div>
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

export default DoctorPatientAnalytics; 