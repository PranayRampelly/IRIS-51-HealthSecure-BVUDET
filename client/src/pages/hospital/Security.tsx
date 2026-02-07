import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Search, 
  Filter,
  Plus,
  Edit,
  Eye,
  Trash2,
  MapPin,
  Calendar,
  Activity,
  BarChart3,
  TrendingUp,
  Settings,
  Wrench,
  Zap,
  AlertCircle,
  Play,
  Square,
  Camera,
  Lock,
  Unlock,
  Users,
  Building2,
  Car,
  User
} from 'lucide-react';

interface SecurityIncident {
  id: string;
  type: 'unauthorized-access' | 'theft' | 'vandalism' | 'suspicious-activity' | 'medical-emergency' | 'fire-alarm' | 'system-breach';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  description: string;
  reportedBy: string;
  reportedAt: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  assignedTo?: string;
  resolution?: string;
  resolvedAt?: string;
  evidence?: string[];
  witnesses?: string[];
  notes?: string;
}

interface SecurityAccess {
  id: string;
  personName: string;
  personType: 'staff' | 'visitor' | 'vendor' | 'patient' | 'contractor';
  accessLevel: 'restricted' | 'limited' | 'standard' | 'elevated' | 'admin';
  badgeId: string;
  department: string;
  entryPoint: string;
  entryTime: string;
  exitTime?: string;
  status: 'active' | 'expired' | 'suspended' | 'revoked';
  validUntil: string;
  notes?: string;
}

const Security: React.FC = () => {
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [accessLogs, setAccessLogs] = useState<SecurityAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedIncident, setSelectedIncident] = useState<SecurityIncident | null>(null);
  const [selectedAccess, setSelectedAccess] = useState<SecurityAccess | null>(null);
  const [isAddIncidentDialogOpen, setIsAddIncidentDialogOpen] = useState(false);
  const [isAddAccessDialogOpen, setIsAddAccessDialogOpen] = useState(false);
  const [isViewIncidentDialogOpen, setIsViewIncidentDialogOpen] = useState(false);
  const [isViewAccessDialogOpen, setIsViewAccessDialogOpen] = useState(false);

  // Mock data
  useEffect(() => {
    const mockIncidents: SecurityIncident[] = [
      {
        id: '1',
        type: 'unauthorized-access',
        severity: 'high',
        location: 'ICU Wing - Room 205',
        description: 'Unauthorized person attempting to access restricted area',
        reportedBy: 'Nurse Sarah Johnson',
        reportedAt: '2024-01-22 14:30',
        status: 'investigating',
        assignedTo: 'Security Officer Mike Wilson',
        evidence: ['CCTV footage', 'Badge swipe records'],
        witnesses: ['Nurse Sarah Johnson', 'Dr. Robert Smith'],
        notes: 'Person claimed to be visiting patient but had no valid visitor pass'
      },
      {
        id: '2',
        type: 'suspicious-activity',
        severity: 'medium',
        location: 'Parking Lot A',
        description: 'Suspicious vehicle parked for extended period',
        reportedBy: 'Security Guard Tom Davis',
        reportedAt: '2024-01-22 10:15',
        status: 'open',
        assignedTo: 'Security Officer Lisa Brown',
        evidence: ['Vehicle registration', 'CCTV footage'],
        notes: 'Vehicle has been parked for 48 hours without movement'
      },
      {
        id: '3',
        type: 'medical-emergency',
        severity: 'critical',
        location: 'Emergency Department',
        description: 'Aggressive patient causing disturbance',
        reportedBy: 'Dr. Emily Chen',
        reportedAt: '2024-01-22 16:45',
        status: 'resolved',
        assignedTo: 'Security Officer David Lee',
        resolution: 'Patient calmed down with medical intervention',
        resolvedAt: '2024-01-22 17:30',
        witnesses: ['Dr. Emily Chen', 'Nurse John Smith', 'Security Officer David Lee']
      },
      {
        id: '4',
        type: 'system-breach',
        severity: 'critical',
        location: 'IT Department',
        description: 'Attempted unauthorized access to patient database',
        reportedBy: 'IT Manager Alex Rodriguez',
        reportedAt: '2024-01-22 09:20',
        status: 'investigating',
        assignedTo: 'Security Officer Sarah Wilson',
        evidence: ['System logs', 'IP address tracking'],
        notes: 'Multiple failed login attempts from unknown IP address'
      }
    ];

    const mockAccessLogs: SecurityAccess[] = [
      {
        id: '1',
        personName: 'Dr. Sarah Johnson',
        personType: 'staff',
        accessLevel: 'elevated',
        badgeId: 'EMP-001',
        department: 'Cardiology',
        entryPoint: 'Main Entrance',
        entryTime: '2024-01-22 08:00',
        status: 'active',
        validUntil: '2024-12-31'
      },
      {
        id: '2',
        personName: 'John Smith',
        personType: 'visitor',
        accessLevel: 'limited',
        badgeId: 'VIS-001',
        department: 'General Medicine',
        entryPoint: 'Visitor Entrance',
        entryTime: '2024-01-22 14:30',
        exitTime: '2024-01-22 16:45',
        status: 'active',
        validUntil: '2024-01-22'
      },
      {
        id: '3',
        personName: 'Mike Wilson',
        personType: 'vendor',
        accessLevel: 'restricted',
        badgeId: 'VND-001',
        department: 'Maintenance',
        entryPoint: 'Service Entrance',
        entryTime: '2024-01-22 10:00',
        exitTime: '2024-01-22 12:30',
        status: 'active',
        validUntil: '2024-01-22'
      },
      {
        id: '4',
        personName: 'Emily Davis',
        personType: 'patient',
        accessLevel: 'limited',
        badgeId: 'PAT-001',
        department: 'Oncology',
        entryPoint: 'Patient Entrance',
        entryTime: '2024-01-22 09:15',
        status: 'active',
        validUntil: '2024-01-25'
      }
    ];

    setIncidents(mockIncidents);
    setAccessLogs(mockAccessLogs);
    setLoading(false);
  }, []);

  const getIncidentTypeColor = (type: string) => {
    switch (type) {
      case 'unauthorized-access': return 'bg-red-100 text-red-800';
      case 'theft': return 'bg-orange-100 text-orange-800';
      case 'vandalism': return 'bg-yellow-100 text-yellow-800';
      case 'suspicious-activity': return 'bg-blue-100 text-blue-800';
      case 'medical-emergency': return 'bg-purple-100 text-purple-800';
      case 'fire-alarm': return 'bg-red-100 text-red-800';
      case 'system-breach': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'restricted': return 'bg-red-100 text-red-800';
      case 'limited': return 'bg-yellow-100 text-yellow-800';
      case 'standard': return 'bg-blue-100 text-blue-800';
      case 'elevated': return 'bg-orange-100 text-orange-800';
      case 'admin': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPersonTypeIcon = (type: string) => {
    switch (type) {
      case 'staff': return <Users className="w-4 h-4" />;
      case 'visitor': return <User className="w-4 h-4" />;
      case 'vendor': return <Building2 className="w-4 h-4" />;
      case 'patient': return <User className="w-4 h-4" />;
      case 'contractor': return <Wrench className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.reportedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || incident.type === typeFilter;
    const matchesSeverity = severityFilter === 'all' || incident.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || incident.status === statusFilter;
    return matchesSearch && matchesType && matchesSeverity && matchesStatus;
  });

  const stats = {
    totalIncidents: incidents.length,
    openIncidents: incidents.filter(i => i.status === 'open').length,
    investigatingIncidents: incidents.filter(i => i.status === 'investigating').length,
    resolvedIncidents: incidents.filter(i => i.status === 'resolved').length,
    criticalIncidents: incidents.filter(i => i.severity === 'critical').length,
    activeAccess: accessLogs.filter(a => a.status === 'active').length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Security Management</h1>
          <p className="text-gray-600">Monitor security incidents and access control</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setIsAddIncidentDialogOpen(true)} className="bg-red-600 hover:bg-red-700">
            <Plus className="w-4 h-4 mr-2" />
            Report Incident
          </Button>
          <Button onClick={() => setIsAddAccessDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Grant Access
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Incidents</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalIncidents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Open Incidents</p>
                <p className="text-2xl font-bold text-red-600">{stats.openIncidents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Investigating</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.investigatingIncidents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolvedIncidents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-red-600">{stats.criticalIncidents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Active Access</p>
                <p className="text-2xl font-bold text-purple-600">{stats.activeAccess}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="incidents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="incidents">Security Incidents</TabsTrigger>
          <TabsTrigger value="access">Access Control</TabsTrigger>
        </TabsList>

        <TabsContent value="incidents" className="space-y-4">
          {/* Incident Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search incidents, location, or reporter..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="unauthorized-access">Unauthorized Access</SelectItem>
                    <SelectItem value="theft">Theft</SelectItem>
                    <SelectItem value="vandalism">Vandalism</SelectItem>
                    <SelectItem value="suspicious-activity">Suspicious Activity</SelectItem>
                    <SelectItem value="medical-emergency">Medical Emergency</SelectItem>
                    <SelectItem value="fire-alarm">Fire Alarm</SelectItem>
                    <SelectItem value="system-breach">System Breach</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Incidents Table */}
          <Card>
            <CardHeader>
              <CardTitle>Security Incidents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Incident</th>
                      <th className="text-left p-3 font-medium">Type</th>
                      <th className="text-left p-3 font-medium">Severity</th>
                      <th className="text-left p-3 font-medium">Location</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Reported</th>
                      <th className="text-left p-3 font-medium">Assigned To</th>
                      <th className="text-left p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIncidents.map((incident) => (
                      <tr key={incident.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="font-medium">{incident.description}</div>
                          <div className="text-sm text-gray-500">Reported by {incident.reportedBy}</div>
                        </td>
                        <td className="p-3">
                          <Badge className={`${getIncidentTypeColor(incident.type)} capitalize`}>
                            {incident.type.replace('-', ' ')}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge className={`${getSeverityColor(incident.severity)} capitalize`}>
                            {incident.severity}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="text-sm">{incident.location}</div>
                        </td>
                        <td className="p-3">
                          <Badge className={`${getStatusColor(incident.status)} capitalize`}>
                            {incident.status}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="text-sm">{incident.reportedAt}</div>
                        </td>
                        <td className="p-3">
                          <div className="text-sm">{incident.assignedTo || 'Unassigned'}</div>
                        </td>
                        <td className="p-3">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedIncident(incident);
                                setIsViewIncidentDialogOpen(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="space-y-4">
          {/* Access Control Table */}
          <Card>
            <CardHeader>
              <CardTitle>Access Control Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Person</th>
                      <th className="text-left p-3 font-medium">Type</th>
                      <th className="text-left p-3 font-medium">Access Level</th>
                      <th className="text-left p-3 font-medium">Badge ID</th>
                      <th className="text-left p-3 font-medium">Department</th>
                      <th className="text-left p-3 font-medium">Entry</th>
                      <th className="text-left p-3 font-medium">Exit</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accessLogs.map((access) => (
                      <tr key={access.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="font-medium">{access.personName}</div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="capitalize flex items-center gap-1 w-fit">
                            {getPersonTypeIcon(access.personType)}
                            {access.personType}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge className={`${getAccessLevelColor(access.accessLevel)} capitalize`}>
                            {access.accessLevel}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="font-mono text-sm">{access.badgeId}</div>
                        </td>
                        <td className="p-3">
                          <div className="text-sm">{access.department}</div>
                        </td>
                        <td className="p-3">
                          <div className="text-sm">{access.entryTime}</div>
                          <div className="text-xs text-gray-500">{access.entryPoint}</div>
                        </td>
                        <td className="p-3">
                          <div className="text-sm">{access.exitTime || 'Active'}</div>
                        </td>
                        <td className="p-3">
                          <Badge className={`${getStatusColor(access.status)} capitalize`}>
                            {access.status}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedAccess(access);
                                setIsViewAccessDialogOpen(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Lock className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Incident Dialog */}
      <Dialog open={isAddIncidentDialogOpen} onOpenChange={setIsAddIncidentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Report Security Incident</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="incidentType">Incident Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unauthorized-access">Unauthorized Access</SelectItem>
                  <SelectItem value="theft">Theft</SelectItem>
                  <SelectItem value="vandalism">Vandalism</SelectItem>
                  <SelectItem value="suspicious-activity">Suspicious Activity</SelectItem>
                  <SelectItem value="medical-emergency">Medical Emergency</SelectItem>
                  <SelectItem value="fire-alarm">Fire Alarm</SelectItem>
                  <SelectItem value="system-breach">System Breach</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="severity">Severity</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="e.g., ICU Wing - Room 205" />
            </div>
            <div>
              <Label htmlFor="reportedBy">Reported By</Label>
              <Input id="reportedBy" placeholder="e.g., Nurse Sarah Johnson" />
            </div>
            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Detailed description of the incident..." />
            </div>
            <div className="col-span-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea id="notes" placeholder="Any additional information..." />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsAddIncidentDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-red-600 hover:bg-red-700">
              Report Incident
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Access Dialog */}
      <Dialog open={isAddAccessDialogOpen} onOpenChange={setIsAddAccessDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Grant Access</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="personName">Person Name</Label>
              <Input id="personName" placeholder="e.g., John Smith" />
            </div>
            <div>
              <Label htmlFor="personType">Person Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="visitor">Visitor</SelectItem>
                  <SelectItem value="vendor">Vendor</SelectItem>
                  <SelectItem value="patient">Patient</SelectItem>
                  <SelectItem value="contractor">Contractor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="accessLevel">Access Level</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="restricted">Restricted</SelectItem>
                  <SelectItem value="limited">Limited</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="elevated">Elevated</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="badgeId">Badge ID</Label>
              <Input id="badgeId" placeholder="e.g., EMP-001" />
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Input id="department" placeholder="e.g., Cardiology" />
            </div>
            <div>
              <Label htmlFor="entryPoint">Entry Point</Label>
              <Input id="entryPoint" placeholder="e.g., Main Entrance" />
            </div>
            <div>
              <Label htmlFor="validUntil">Valid Until</Label>
              <Input id="validUntil" type="date" />
            </div>
            <div className="col-span-2">
              <Label htmlFor="accessNotes">Notes</Label>
              <Textarea id="accessNotes" placeholder="Additional notes..." />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsAddAccessDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Grant Access
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Incident Dialog */}
      <Dialog open={isViewIncidentDialogOpen} onOpenChange={setIsViewIncidentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Incident Details</DialogTitle>
          </DialogHeader>
          {selectedIncident && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Type</Label>
                  <Badge className={`${getIncidentTypeColor(selectedIncident.type)} capitalize`}>
                    {selectedIncident.type.replace('-', ' ')}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Severity</Label>
                  <Badge className={`${getSeverityColor(selectedIncident.severity)} capitalize`}>
                    {selectedIncident.severity}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Location</Label>
                  <p className="text-lg">{selectedIncident.location}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <Badge className={`${getStatusColor(selectedIncident.status)} capitalize`}>
                    {selectedIncident.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Reported By</Label>
                  <p className="text-lg">{selectedIncident.reportedBy}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Reported At</Label>
                  <p className="text-lg">{selectedIncident.reportedAt}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Assigned To</Label>
                  <p className="text-lg">{selectedIncident.assignedTo || 'Unassigned'}</p>
                </div>
                {selectedIncident.resolvedAt && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Resolved At</Label>
                    <p className="text-lg">{selectedIncident.resolvedAt}</p>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <Label className="text-sm font-medium text-gray-600">Description</Label>
                <p className="text-lg">{selectedIncident.description}</p>
              </div>

              {selectedIncident.resolution && (
                <div className="border-t pt-4">
                  <Label className="text-sm font-medium text-gray-600">Resolution</Label>
                  <p className="text-lg">{selectedIncident.resolution}</p>
                </div>
              )}

              {selectedIncident.evidence && selectedIncident.evidence.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Evidence</h4>
                  <div className="space-y-2">
                    {selectedIncident.evidence.map((item, index) => (
                      <div key={index} className="p-2 bg-gray-50 rounded">
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedIncident.witnesses && selectedIncident.witnesses.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Witnesses</h4>
                  <div className="space-y-2">
                    {selectedIncident.witnesses.map((witness, index) => (
                      <div key={index} className="p-2 bg-gray-50 rounded">
                        <span className="text-sm">{witness}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedIncident.notes && (
                <div className="border-t pt-4">
                  <Label className="text-sm font-medium text-gray-600">Notes</Label>
                  <p className="text-lg">{selectedIncident.notes}</p>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setIsViewIncidentDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Access Dialog */}
      <Dialog open={isViewAccessDialogOpen} onOpenChange={setIsViewAccessDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Access Details</DialogTitle>
          </DialogHeader>
          {selectedAccess && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Person Name</Label>
                  <p className="text-lg font-semibold">{selectedAccess.personName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Person Type</Label>
                  <Badge variant="outline" className="capitalize">
                    {selectedAccess.personType}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Access Level</Label>
                  <Badge className={`${getAccessLevelColor(selectedAccess.accessLevel)} capitalize`}>
                    {selectedAccess.accessLevel}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Badge ID</Label>
                  <p className="text-lg font-mono">{selectedAccess.badgeId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Department</Label>
                  <p className="text-lg">{selectedAccess.department}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <Badge className={`${getStatusColor(selectedAccess.status)} capitalize`}>
                    {selectedAccess.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Entry Point</Label>
                  <p className="text-lg">{selectedAccess.entryPoint}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Entry Time</Label>
                  <p className="text-lg">{selectedAccess.entryTime}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Exit Time</Label>
                  <p className="text-lg">{selectedAccess.exitTime || 'Active'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Valid Until</Label>
                  <p className="text-lg">{selectedAccess.validUntil}</p>
                </div>
              </div>

              {selectedAccess.notes && (
                <div className="border-t pt-4">
                  <Label className="text-sm font-medium text-gray-600">Notes</Label>
                  <p className="text-lg">{selectedAccess.notes}</p>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setIsViewAccessDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Security; 