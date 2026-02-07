import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, TrendingDown, Users, DollarSign, 
  Activity, Calendar, BarChart3, PieChart
} from 'lucide-react';

const HospitalAnalytics: React.FC = () => {
  const analyticsData = {
    patientGrowth: { current: 1247, previous: 1189, change: 4.9 },
    revenueGrowth: { current: 284750, previous: 265000, change: 7.5 },
    bedOccupancy: { current: 78, previous: 72, change: 8.3 },
    avgStayDuration: { current: 4.2, previous: 4.8, change: -12.5 },
    readmissionRate: { current: 8.5, previous: 9.2, change: -7.6 },
    patientSatisfaction: { current: 4.6, previous: 4.4, change: 4.5 }
  };

  const monthlyData = [
    { month: 'Jan', patients: 1150, revenue: 265000, occupancy: 72 },
    { month: 'Feb', patients: 1189, revenue: 270000, occupancy: 75 },
    { month: 'Mar', patients: 1220, revenue: 275000, occupancy: 78 },
    { month: 'Apr', patients: 1247, revenue: 284750, occupancy: 82 },
  ];

  const departmentPerformance = [
    { name: 'Cardiology', patients: 156, revenue: 45000, satisfaction: 4.7 },
    { name: 'Orthopedics', patients: 134, revenue: 38000, satisfaction: 4.5 },
    { name: 'Neurology', patients: 98, revenue: 32000, satisfaction: 4.6 },
    { name: 'Emergency', patients: 245, revenue: 28000, satisfaction: 4.3 },
    { name: 'Pediatrics', patients: 187, revenue: 25000, satisfaction: 4.8 },
  ];

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hospital Analytics</h1>
          <p className="text-gray-600 mt-2">Comprehensive analytics and performance metrics</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Last 30 Days
          </Button>
          <Button>
            <BarChart3 className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patient Growth</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.patientGrowth.current.toLocaleString()}</div>
            <div className="flex items-center text-xs">
              {analyticsData.patientGrowth.change > 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={analyticsData.patientGrowth.change > 0 ? 'text-green-500' : 'text-red-500'}>
                {analyticsData.patientGrowth.change > 0 ? '+' : ''}{analyticsData.patientGrowth.change}%
              </span>
              <span className="text-muted-foreground ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Growth</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analyticsData.revenueGrowth.current.toLocaleString()}</div>
            <div className="flex items-center text-xs">
              {analyticsData.revenueGrowth.change > 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={analyticsData.revenueGrowth.change > 0 ? 'text-green-500' : 'text-red-500'}>
                {analyticsData.revenueGrowth.change > 0 ? '+' : ''}{analyticsData.revenueGrowth.change}%
              </span>
              <span className="text-muted-foreground ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bed Occupancy</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.bedOccupancy.current}%</div>
            <div className="flex items-center text-xs">
              {analyticsData.bedOccupancy.change > 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={analyticsData.bedOccupancy.change > 0 ? 'text-green-500' : 'text-red-500'}>
                {analyticsData.bedOccupancy.change > 0 ? '+' : ''}{analyticsData.bedOccupancy.change}%
              </span>
              <span className="text-muted-foreground ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Stay Duration</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.avgStayDuration.current} days</div>
            <div className="flex items-center text-xs">
              {analyticsData.avgStayDuration.change > 0 ? (
                <TrendingUp className="w-4 h-4 text-red-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
              )}
              <span className={analyticsData.avgStayDuration.change > 0 ? 'text-red-500' : 'text-green-500'}>
                {analyticsData.avgStayDuration.change > 0 ? '+' : ''}{analyticsData.avgStayDuration.change}%
              </span>
              <span className="text-muted-foreground ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Readmission Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.readmissionRate.current}%</div>
            <div className="flex items-center text-xs">
              {analyticsData.readmissionRate.change > 0 ? (
                <TrendingUp className="w-4 h-4 text-red-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
              )}
              <span className={analyticsData.readmissionRate.change > 0 ? 'text-red-500' : 'text-green-500'}>
                {analyticsData.readmissionRate.change > 0 ? '+' : ''}{analyticsData.readmissionRate.change}%
              </span>
              <span className="text-muted-foreground ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patient Satisfaction</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.patientSatisfaction.current}/5.0</div>
            <div className="flex items-center text-xs">
              {analyticsData.patientSatisfaction.change > 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={analyticsData.patientSatisfaction.change > 0 ? 'text-green-500' : 'text-red-500'}>
                {analyticsData.patientSatisfaction.change > 0 ? '+' : ''}{analyticsData.patientSatisfaction.change}%
              </span>
              <span className="text-muted-foreground ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyData.map((data, index) => (
              <div key={data.month} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <span className="font-medium">{data.month}</span>
                  <div className="flex space-x-6">
                    <div className="text-sm">
                      <span className="text-gray-600">Patients: </span>
                      <span className="font-medium">{data.patients}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Revenue: </span>
                      <span className="font-medium">${data.revenue.toLocaleString()}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Occupancy: </span>
                      <span className="font-medium">{data.occupancy}%</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {index < monthlyData.length - 1 && (
                    <>
                      <Badge variant="outline" className="text-xs">
                        {data.patients > monthlyData[index + 1]?.patients ? '↗' : '↘'} Patients
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {data.revenue > monthlyData[index + 1]?.revenue ? '↗' : '↘'} Revenue
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Department Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Department Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {departmentPerformance.map((dept) => (
              <div key={dept.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="font-medium">{dept.name}</span>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Patients</div>
                    <div className="font-medium">{dept.patients}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Revenue</div>
                    <div className="font-medium">${dept.revenue.toLocaleString()}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Satisfaction</div>
                    <div className="font-medium">{dept.satisfaction}/5.0</div>
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

export default HospitalAnalytics; 