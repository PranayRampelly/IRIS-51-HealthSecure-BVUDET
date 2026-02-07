import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Clock, 
  Navigation, 
  Car, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Plus,
  Search,
  Filter,
  RefreshCw,
  Settings,
  BarChart3,
  Route
} from 'lucide-react';

interface Route {
  id: string;
  name: string;
  startLocation: string;
  endLocation: string;
  distance: string;
  estimatedTime: string;
  trafficLevel: 'low' | 'medium' | 'high';
  status: 'active' | 'completed' | 'cancelled';
  driver: string;
  vehicle: string;
  createdAt: string;
  lastUpdated: string;
}

interface TrafficAlert {
  id: string;
  location: string;
  type: 'accident' | 'construction' | 'congestion' | 'weather';
  severity: 'low' | 'medium' | 'high';
  description: string;
  estimatedDelay: string;
  status: 'active' | 'resolved';
}

const RoutePlanning = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [trafficAlerts, setTrafficAlerts] = useState<TrafficAlert[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [trafficFilter, setTrafficFilter] = useState('all');
  const [isAddRouteOpen, setIsAddRouteOpen] = useState(false);
  const [isOptimizeOpen, setIsOptimizeOpen] = useState(false);

  useEffect(() => {
    fetchRoutes();
    fetchTrafficAlerts();
  }, []);

  const fetchRoutes = async () => {
    try {
      const response = await api.get('/hospital/ambulance/routes');
      const data = response.data;
      if (data.success && data.data) {
        const transformedRoutes: Route[] = data.data.map((route: any) => ({
          id: route._id || route.routeId,
          name: route.name || 'Unnamed Route',
          startLocation: route.startLocation?.name || route.startLocation?.address || 'Unknown',
          endLocation: route.endLocation?.name || route.endLocation?.address || 'Unknown',
          distance: `${route.distance?.value || 0} ${route.distance?.unit || 'km'}`,
          estimatedTime: `${route.estimatedTime?.value || 0} ${route.estimatedTime?.unit || 'min'}`,
          trafficLevel: route.trafficLevel || 'medium',
          status: route.status || 'planned',
          driver: route.assignedDriver ? `${route.assignedDriver.firstName} ${route.assignedDriver.lastName}` : 'Unassigned',
          vehicle: route.assignedVehicle?.vehicleNumber || route.assignedVehicle?.name || 'Unassigned',
          createdAt: new Date(route.createdAt).toLocaleString(),
          lastUpdated: new Date(route.updatedAt || route.createdAt).toLocaleString()
        }));
        setRoutes(transformedRoutes);
      } else {
        setRoutes([]);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
      setRoutes([]);
      toast.error('Failed to load routes');
    }
  };

  const fetchTrafficAlerts = async () => {
    try {
      const response = await api.get('/hospital/ambulance/routes/traffic-alerts');
      const data = response.data;
      if (data.success && data.data) {
        const transformedAlerts: TrafficAlert[] = data.data.map((alert: any) => ({
          id: alert._id || alert.alertId,
          location: alert.location?.address || 'Unknown Location',
          type: alert.type || 'other',
          severity: alert.severity || 'medium',
          description: alert.description || '',
          estimatedDelay: `${alert.estimatedDelay?.value || 0} ${alert.estimatedDelay?.unit || 'min'}`,
          status: alert.status || 'active'
        }));
        setTrafficAlerts(transformedAlerts);
      } else {
        setTrafficAlerts([]);
      }
    } catch (error) {
      console.error('Error fetching traffic alerts:', error);
      setTrafficAlerts([]);
    }
  };

  const getTrafficLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'accident': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'construction': return <Settings className="h-4 w-4 text-orange-500" />;
      case 'congestion': return <BarChart3 className="h-4 w-4 text-yellow-500" />;
      case 'weather': return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const [routeStats, setRouteStats] = useState({
    activeRoutes: 0,
    avgResponseTime: 0,
    trafficAlerts: 0,
    routeEfficiency: 0
  });

  useEffect(() => {
    fetchRouteStats();
  }, []);

  const fetchRouteStats = async () => {
    try {
      const response = await api.get('/hospital/ambulance/routes/stats');
      const data = response.data;
      if (data.success && data.data) {
        setRouteStats({
          activeRoutes: data.data.activeRoutes || 0,
          avgResponseTime: data.data.avgResponseTime || 0,
          trafficAlerts: trafficAlerts.filter(a => a.status === 'active').length,
          routeEfficiency: 87 // Can be calculated from actual data
        });
      }
    } catch (error) {
      console.error('Error fetching route stats:', error);
    }
  };

  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    try {
      const routeData = {
        name: formData.get('name') as string,
        startLocation: {
          address: formData.get('startLocation') as string,
          coordinates: { lat: 0, lng: 0 }
        },
        endLocation: {
          address: formData.get('endLocation') as string,
          coordinates: { lat: 0, lng: 0 }
        },
        priority: formData.get('priority') as string || 'medium'
      };

      const response = await api.post('/hospital/ambulance/routes', routeData);
      
      if (response.data.success) {
        toast.success('Route created successfully');
        setIsAddRouteOpen(false);
        form.reset();
        fetchRoutes();
      }
    } catch (error: any) {
      console.error('Error creating route:', error);
      toast.error(error.response?.data?.message || 'Failed to create route');
    }
  };

  const handleOptimizeRoutes = async (criteria: string[]) => {
    try {
      const response = await api.post('/hospital/ambulance/routes/optimize', { criteria });
      
      if (response.data.success) {
        toast.success(`Optimized ${response.data.data.routesOptimized} routes`);
        setIsOptimizeOpen(false);
        fetchRoutes();
      }
    } catch (error: any) {
      console.error('Error optimizing routes:', error);
      toast.error('Failed to optimize routes');
    }
  };

  const filteredRoutes = routes.filter(route => {
    const matchesSearch = route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         route.startLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         route.endLocation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || route.status === statusFilter;
    const matchesTraffic = trafficFilter === 'all' || route.trafficLevel === trafficFilter;
    return matchesSearch && matchesStatus && matchesTraffic;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Route Planning</h1>
          <p className="text-muted-foreground">
            Optimize ambulance routes and monitor traffic conditions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsOptimizeOpen(true)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Optimize Routes
          </Button>
          <Button onClick={() => setIsAddRouteOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Route
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Routes</CardTitle>
            <Route className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{routeStats.activeRoutes}</div>
            <p className="text-xs text-muted-foreground">
              Currently in progress
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{routeStats.avgResponseTime.toFixed(1)} min</div>
            <p className="text-xs text-muted-foreground">
              -2.1 min from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Traffic Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{routeStats.trafficAlerts}</div>
            <p className="text-xs text-muted-foreground">
              Active alerts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Route Efficiency</CardTitle>
            <Navigation className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{routeStats.routeEfficiency}%</div>
            <p className="text-xs text-muted-foreground">
              +5% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Routes Table */}
        <Card>
          <CardHeader>
            <CardTitle>Active Routes</CardTitle>
            <CardDescription>
              Monitor and manage ambulance routes in real-time
            </CardDescription>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search routes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={trafficFilter} onValueChange={setTrafficFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Traffic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Traffic</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route</TableHead>
                  <TableHead>Distance</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Traffic</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoutes.map((route) => (
                  <TableRow key={route.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{route.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {route.startLocation} → {route.endLocation}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{route.distance}</TableCell>
                    <TableCell>{route.estimatedTime}</TableCell>
                    <TableCell>
                      <Badge className={getTrafficLevelColor(route.trafficLevel)}>
                        {route.trafficLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(route.status)}>
                        {route.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Traffic Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Traffic Alerts</CardTitle>
            <CardDescription>
              Real-time traffic conditions affecting routes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trafficAlerts.filter(alert => alert.status === 'active').map((alert) => (
                <div key={alert.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    {getAlertTypeIcon(alert.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">{alert.location}</h4>
                      <Badge variant={alert.severity === 'high' ? 'destructive' : alert.severity === 'medium' ? 'secondary' : 'outline'}>
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {alert.description}
                    </p>
                    <div className="flex items-center mt-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      Delay: {alert.estimatedDelay}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Route Optimization Dialog */}
      <Dialog open={isOptimizeOpen} onOpenChange={setIsOptimizeOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Route Optimization</DialogTitle>
            <DialogDescription>
              Optimize routes based on current traffic conditions and priorities
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const formData = new FormData(form);
            const criteria: string[] = [];
            if (formData.get('traffic')) criteria.push('traffic');
            if (formData.get('priority')) criteria.push('priority');
            if (formData.get('distance')) criteria.push('distance');
            if (formData.get('time')) criteria.push('time');
            handleOptimizeRoutes(criteria);
          }}>
            <div className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Optimization Criteria</label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="traffic" name="traffic" defaultChecked />
                      <label htmlFor="traffic" className="text-sm">Consider traffic conditions</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="priority" name="priority" defaultChecked />
                      <label htmlFor="priority" className="text-sm">Prioritize emergency calls</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="distance" name="distance" />
                      <label htmlFor="distance" className="text-sm">Minimize total distance</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="time" name="time" defaultChecked />
                      <label htmlFor="time" className="text-sm">Minimize response time</label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsOptimizeOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Apply Optimization
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Route Dialog */}
      <Dialog open={isAddRouteOpen} onOpenChange={setIsAddRouteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Route</DialogTitle>
            <DialogDescription>
              Create a new ambulance route with start and end locations
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateRoute}>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Route Name *</label>
                <Input name="name" placeholder="Enter route name" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Location *</label>
                <Input name="startLocation" placeholder="Enter start location" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Location *</label>
                <Input name="endLocation" placeholder="Enter end location" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select name="priority" defaultValue="medium">
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddRouteOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Create Route
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoutePlanning; 