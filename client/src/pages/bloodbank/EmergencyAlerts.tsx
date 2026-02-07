import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertTriangle, Bell, Clock, Activity, Users, Droplets,
  Eye, Plus, Search, Filter, Download, RefreshCw, TrendingUp,
  BarChart3, FileText, Thermometer, Calendar, User, Settings,
  ArrowLeft, Zap, Target, Award, Star, Clock3, AlertCircle,
  Truck, FileText as FileTextIcon, UserRound, Shield, Heart,
  Phone, Mail, MapPin, Info, CheckCircle, XCircle, Minus,
  ExternalLink, MessageSquare, PhoneCall, Video, Send
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface EmergencyAlert {
  id: string;
  type: 'critical_stock' | 'urgent_request' | 'quality_issue' | 'system_alert' | 'donor_emergency';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  bloodType?: string;
  componentType?: string;
  quantity?: number;
  hospital?: string;
  patient?: string;
  contactInfo?: {
    name: string;
    phone: string;
    email: string;
  };
  location?: string;
  status: 'active' | 'acknowledged' | 'resolved' | 'escalated';
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  assignedTo?: string;
  notes?: string;
  actions?: string[];
}

interface EmergencyStats {
  totalAlerts: number;
  activeAlerts: number;
  criticalAlerts: number;
  resolvedToday: number;
  averageResponseTime: number;
  bloodTypeDistribution: Record<string, number>;
  priorityDistribution: Record<string, number>;
}

const EmergencyAlerts: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [emergencyAlerts, setEmergencyAlerts] = useState<EmergencyAlert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<EmergencyAlert | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('all');

  // Mock data for emergency alerts
  const mockEmergencyAlerts: EmergencyAlert[] = [
    {
      id: '1',
      type: 'critical_stock',
      priority: 'critical',
      title: 'Critical Stock Alert - O+ Blood',
      description: 'O+ blood stock has fallen below critical levels. Only 3 units remaining.',
      bloodType: 'O+',
      componentType: 'Red Cells',
      quantity: 3,
      status: 'active',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      expiresAt: '2024-01-15T18:00:00Z',
      assignedTo: 'Dr. Sarah Johnson',
      notes: 'Need immediate donor recruitment and external blood bank coordination.',
      actions: ['Contact Donors', 'Request External Supply', 'Update Inventory']
    },
    {
      id: '2',
      type: 'urgent_request',
      priority: 'high',
      title: 'Emergency Blood Request - Trauma Case',
      description: 'Urgent request for 6 units of A+ blood for emergency trauma surgery.',
      bloodType: 'A+',
      componentType: 'Whole Blood',
      quantity: 6,
      hospital: 'City General Hospital',
      patient: 'John Doe (Trauma Case)',
      contactInfo: {
        name: 'Dr. Michael Chen',
        phone: '+1-555-0123',
        email: 'mchen@citygeneral.com'
      },
      location: 'Emergency Department, Floor 2',
      status: 'active',
      createdAt: '2024-01-15T09:15:00Z',
      updatedAt: '2024-01-15T09:15:00Z',
      expiresAt: '2024-01-15T12:00:00Z',
      assignedTo: 'Blood Bank Team',
      notes: 'Patient in critical condition, surgery scheduled in 2 hours.',
      actions: ['Allocate Blood Units', 'Prepare Delivery', 'Contact Hospital']
    },
    {
      id: '3',
      type: 'quality_issue',
      priority: 'high',
      title: 'Quality Control Alert - Batch Contamination',
      description: 'Potential contamination detected in blood batch B-2024-001. Quarantine required.',
      bloodType: 'B-',
      componentType: 'Plasma',
      quantity: 12,
      status: 'acknowledged',
      createdAt: '2024-01-15T08:45:00Z',
      updatedAt: '2024-01-15T09:00:00Z',
      assignedTo: 'Quality Control Team',
      notes: 'Samples sent for retesting. Awaiting results.',
      actions: ['Quarantine Units', 'Retest Samples', 'Investigate Source']
    },
    {
      id: '4',
      type: 'donor_emergency',
      priority: 'medium',
      title: 'Donor Emergency - Allergic Reaction',
      description: 'Donor experienced allergic reaction during donation. Medical attention required.',
      status: 'resolved',
      createdAt: '2024-01-15T07:30:00Z',
      updatedAt: '2024-01-15T08:00:00Z',
      contactInfo: {
        name: 'Maria Rodriguez',
        phone: '+1-555-0456',
        email: 'mrodriguez@email.com'
      },
      assignedTo: 'Medical Team',
      notes: 'Donor treated and discharged. No serious complications.',
      actions: ['Medical Assessment', 'Document Incident', 'Follow-up Care']
    },
    {
      id: '5',
      type: 'system_alert',
      priority: 'low',
      title: 'System Maintenance Alert',
      description: 'Scheduled system maintenance in 2 hours. Brief service interruption expected.',
      status: 'active',
      createdAt: '2024-01-15T06:00:00Z',
      updatedAt: '2024-01-15T06:00:00Z',
      expiresAt: '2024-01-15T14:00:00Z',
      assignedTo: 'IT Team',
      notes: 'Maintenance window: 2-4 hours. Backup systems will be active.',
      actions: ['Notify Staff', 'Prepare Backup', 'Monitor Systems']
    }
  ];

  const mockStats: EmergencyStats = {
    totalAlerts: 25,
    activeAlerts: 3,
    criticalAlerts: 1,
    resolvedToday: 8,
    averageResponseTime: 12.5,
    bloodTypeDistribution: {
      'O+': 8,
      'A+': 6,
      'B+': 4,
      'AB+': 2,
      'O-': 3,
      'A-': 1,
      'B-': 1
    },
    priorityDistribution: {
      'critical': 1,
      'high': 8,
      'medium': 12,
      'low': 4
    }
  };

  useEffect(() => {
    loadEmergencyAlerts();
  }, []);

  const loadEmergencyAlerts = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEmergencyAlerts(mockEmergencyAlerts);
      setTotalPages(1);
    } catch (error) {
      toast.error('Failed to load emergency alerts');
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'critical_stock': return <Droplets className="w-4 h-4" />;
      case 'urgent_request': return <Heart className="w-4 h-4" />;
      case 'quality_issue': return <Shield className="w-4 h-4" />;
      case 'donor_emergency': return <Users className="w-4 h-4" />;
      case 'system_alert': return <AlertTriangle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800 border-red-200';
      case 'acknowledged': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'escalated': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleViewDetails = (alert: EmergencyAlert) => {
    setSelectedAlert(alert);
  };

  const handleAcknowledge = (alertId: string) => {
    setEmergencyAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: 'acknowledged' as const, updatedAt: new Date().toISOString() }
          : alert
      )
    );
    toast.success('Alert acknowledged');
  };

  const handleResolve = (alertId: string) => {
    setEmergencyAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: 'resolved' as const, updatedAt: new Date().toISOString() }
          : alert
      )
    );
    toast.success('Alert resolved');
  };

  const handleEscalate = (alertId: string) => {
    setEmergencyAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: 'escalated' as const, updatedAt: new Date().toISOString() }
          : alert
      )
    );
    toast.success('Alert escalated');
  };

  const filteredAlerts = emergencyAlerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || alert.type === typeFilter;
    const matchesPriority = priorityFilter === 'all' || alert.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
    
    return matchesSearch && matchesType && matchesPriority && matchesStatus;
  });

  const getFilteredAlertsByTab = () => {
    switch (activeTab) {
      case 'active':
        return filteredAlerts.filter(alert => alert.status === 'active');
      case 'critical':
        return filteredAlerts.filter(alert => alert.priority === 'critical');
      case 'urgent':
        return filteredAlerts.filter(alert => alert.type === 'urgent_request');
      default:
        return filteredAlerts;
    }
  };

  const displayAlerts = getFilteredAlertsByTab();

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/bloodbank/dashboard')}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Emergency Alerts</h1>
            <p className="text-gray-600">Monitor and manage critical alerts and emergencies</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={loadEmergencyAlerts}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button className="bg-red-600 hover:bg-red-700">
            <Plus className="w-4 h-4 mr-2" />
            New Alert
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalAlerts}</div>
            <p className="text-xs text-muted-foreground">
              +2 from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <Bell className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{mockStats.activeAlerts}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{mockStats.criticalAlerts}</div>
            <p className="text-xs text-muted-foreground">
              Highest priority
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.averageResponseTime}m</div>
            <p className="text-xs text-muted-foreground">
              Target: 10 minutes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Alerts</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="critical">Critical</TabsTrigger>
          <TabsTrigger value="urgent">Urgent Requests</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search alerts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="critical_stock">Critical Stock</SelectItem>
                  <SelectItem value="urgent_request">Urgent Request</SelectItem>
                  <SelectItem value="quality_issue">Quality Issue</SelectItem>
                  <SelectItem value="donor_emergency">Donor Emergency</SelectItem>
                  <SelectItem value="system_alert">System Alert</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="acknowledged">Acknowledged</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Emergency Alerts Table */}
          <Card>
            <CardHeader>
              <CardTitle>Emergency Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Priority</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Blood Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayAlerts.map((alert) => (
                    <TableRow key={alert.id} className="hover:bg-gray-50">
                      <TableCell>
                        <Badge className={getPriorityColor(alert.priority)}>
                          {alert.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(alert.type)}
                          <span className="capitalize">{alert.type.replace('_', ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{alert.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {alert.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {alert.bloodType ? (
                          <Badge variant="outline">{alert.bloodType}</Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(alert.status)}>
                          {alert.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(alert.createdAt).toLocaleDateString()}</div>
                          <div className="text-gray-500">
                            {new Date(alert.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(alert)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {alert.status === 'active' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAcknowledge(alert.id)}
                              >
                                <CheckCircle className="w-4 h-4 text-yellow-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleResolve(alert.id)}
                              >
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              </Button>
                            </>
                          )}
                          {alert.status === 'acknowledged' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEscalate(alert.id)}
                            >
                              <AlertTriangle className="w-4 h-4 text-purple-600" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Alert Details Dialog */}
      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedAlert && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  {getTypeIcon(selectedAlert.type)}
                  <span>{selectedAlert.title}</span>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Alert Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Priority</Label>
                    <Badge className={getPriorityColor(selectedAlert.priority)}>
                      {selectedAlert.priority}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge className={getStatusColor(selectedAlert.status)}>
                      {selectedAlert.status}
                    </Badge>
                  </div>
                  {selectedAlert.bloodType && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Blood Type</Label>
                      <Badge variant="outline">{selectedAlert.bloodType}</Badge>
                    </div>
                  )}
                  {selectedAlert.quantity && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Quantity</Label>
                      <span className="text-lg font-semibold">{selectedAlert.quantity} units</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-gray-700">{selectedAlert.description}</p>
                </div>

                {/* Contact Information */}
                {selectedAlert.contactInfo && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Contact Information</Label>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span>{selectedAlert.contactInfo.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span>{selectedAlert.contactInfo.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span>{selectedAlert.contactInfo.email}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Location */}
                {selectedAlert.location && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Location</Label>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span>{selectedAlert.location}</span>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedAlert.notes && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Notes</Label>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedAlert.notes}</p>
                  </div>
                )}

                {/* Actions */}
                {selectedAlert.actions && selectedAlert.actions.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Recommended Actions</Label>
                    <div className="space-y-2">
                      {selectedAlert.actions.map((action, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-gray-400" />
                          <span>{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    {selectedAlert.status === 'active' && (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => handleAcknowledge(selectedAlert.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Acknowledge
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleResolve(selectedAlert.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Resolve
                        </Button>
                      </>
                    )}
                    {selectedAlert.status === 'acknowledged' && (
                      <Button
                        variant="outline"
                        onClick={() => handleEscalate(selectedAlert.id)}
                      >
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Escalate
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="outline">
                      <PhoneCall className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                    <Button variant="outline">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    <Button variant="outline">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmergencyAlerts;
