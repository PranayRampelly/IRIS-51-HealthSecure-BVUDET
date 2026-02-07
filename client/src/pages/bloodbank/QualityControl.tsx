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
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, TestTube, AlertTriangle, CheckCircle, Clock, 
  XCircle, Eye, Plus, Search, Filter, Download, 
  RefreshCw, TrendingUp, BarChart3, FileText, 
  Thermometer, Droplets, Activity, Calendar, 
  User, Settings, Bell, ArrowLeft, Microscope,
  Zap, Target, Award, Star, Clock3, AlertCircle,
  Truck, FileText as FileTextIcon, UserRound
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface QualityControlData {
  id: string;
  unitId: string;
  bloodType: string;
  componentType: string;
  donorName: string;
  overallStatus: 'pending' | 'in_progress' | 'passed' | 'failed' | 'quarantine' | 'disposed';
  qualityScore: number;
  complianceStatus: 'compliant' | 'non_compliant' | 'pending_review';
  collectionDate: string;
  processingDate: string;
  expiryDate: string;
  daysUntilExpiry: number;
  testsCompleted: number;
  totalTests: number;
  lastTestDate: string;
  technician: string;
}

interface QualityTest {
  id: string;
  testType: string;
  testMethod: string;
  result: 'pass' | 'fail' | 'inconclusive' | 'pending';
  testDate: string;
  technician: string;
  notes?: string;
}

const QualityControl: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [qualityControls, setQualityControls] = useState<QualityControlData[]>([]);
  const [selectedQualityControl, setSelectedQualityControl] = useState<QualityControlData | null>(null);
  const [selectedTests, setSelectedTests] = useState<QualityTest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('all');
  const [componentFilter, setComponentFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Mock data for quality controls - removed, fetch from API instead

  // Mock tests data - removed, fetch from API instead

  // Statistics data - fetch from API
  const [statistics, setStatistics] = useState({
    totalUnits: 0,
    passedUnits: 0,
    failedUnits: 0,
    pendingUnits: 0,
    inProgressUnits: 0,
    quarantinedUnits: 0,
    disposedUnits: 0,
    qualityRate: 0,
    failureRate: 0,
    complianceRate: 0,
    avgQualityScore: 0
  });

  useEffect(() => {
    loadQualityControls();
  }, []);

  const loadQualityControls = async () => {
    try {
      setIsLoading(true);
      // Fetch from API - removed mock data
      // TODO: Replace with actual API call
      setQualityControls([]);
      setTotalPages(1);
      toast.success('Quality control data loaded');
    } catch (error) {
      console.error('Failed to load quality controls:', error);
      toast.error('Failed to load quality control data');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-health-success text-white';
      case 'failed': return 'bg-health-danger text-white';
      case 'pending': return 'bg-health-blue-gray text-white';
      case 'in_progress': return 'bg-health-warning text-white';
      case 'quarantine': return 'bg-orange-500 text-white';
      case 'disposed': return 'bg-gray-500 text-white';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-health-success text-white';
      case 'non_compliant': return 'bg-health-danger text-white';
      case 'pending_review': return 'bg-health-warning text-white';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const handleViewDetails = (qualityControl: QualityControlData) => {
    setSelectedQualityControl(qualityControl);
    // TODO: Fetch tests from API for this quality control
    setSelectedTests([]);
  };

  const handleAddTest = () => {
    toast.info('Add test functionality will be implemented');
  };

  const handleQuarantine = () => {
    toast.info('Quarantine functionality will be implemented');
  };

  const handleRelease = () => {
    toast.info('Release functionality will be implemented');
  };

  const handleDispose = () => {
    toast.info('Dispose functionality will be implemented');
  };

  const filteredQualityControls = qualityControls.filter(control => {
    const matchesSearch = control.unitId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         control.donorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || control.overallStatus === statusFilter;
    const matchesBloodType = bloodTypeFilter === 'all' || control.bloodType === bloodTypeFilter;
    const matchesComponent = componentFilter === 'all' || control.componentType === componentFilter;
    
    return matchesSearch && matchesStatus && matchesBloodType && matchesComponent;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/bloodbank/dashboard')}
              className="text-health-blue-gray hover:text-health-charcoal"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-health-charcoal mt-2">Quality Control</h1>
          <p className="text-health-blue-gray mt-1">
            Monitor and manage blood unit quality testing and compliance
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={loadQualityControls}
            disabled={isLoading}
            className="bg-white border-health-blue-gray/20 hover:bg-health-light-gray"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button className="bg-health-primary hover:bg-health-primary-dark">
            <Plus className="w-4 h-4 mr-2" />
            Add Quality Control
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-health-charcoal">Total Units</CardTitle>
            <Shield className="h-4 w-4 text-health-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-health-charcoal">{statistics.totalUnits}</div>
            <p className="text-xs text-health-blue-gray">Under quality control</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-health-charcoal">Quality Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-health-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-health-charcoal">{statistics.qualityRate}%</div>
            <p className="text-xs text-health-blue-gray">Passed quality tests</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-health-charcoal">Compliance Rate</CardTitle>
            <Award className="h-4 w-4 text-health-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-health-charcoal">{statistics.complianceRate}%</div>
            <p className="text-xs text-health-blue-gray">Regulatory compliance</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-health-charcoal">Avg Quality Score</CardTitle>
            <Target className="h-4 w-4 text-health-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-health-charcoal">{statistics.avgQualityScore}</div>
            <p className="text-xs text-health-blue-gray">Out of 100 points</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-health-charcoal">Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-health-blue-gray">Passed</span>
              <Badge className="bg-health-success text-white">{statistics.passedUnits}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-health-blue-gray">Failed</span>
              <Badge className="bg-health-danger text-white">{statistics.failedUnits}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-health-blue-gray">Pending</span>
              <Badge className="bg-health-blue-gray text-white">{statistics.pendingUnits}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-health-blue-gray">In Progress</span>
              <Badge className="bg-health-warning text-white">{statistics.inProgressUnits}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-health-blue-gray">Quarantined</span>
              <Badge className="bg-orange-500 text-white">{statistics.quarantinedUnits}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-health-blue-gray">Disposed</span>
              <Badge className="bg-gray-500 text-white">{statistics.disposedUnits}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-health-charcoal">Quality Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-health-blue-gray">Quality Rate</span>
                <span className="text-health-charcoal font-medium">{statistics.qualityRate}%</span>
              </div>
              <Progress value={statistics.qualityRate} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-health-blue-gray">Compliance Rate</span>
                <span className="text-health-charcoal font-medium">{statistics.complianceRate}%</span>
              </div>
              <Progress value={statistics.complianceRate} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-health-blue-gray">Failure Rate</span>
                <span className="text-health-charcoal font-medium">{statistics.failureRate}%</span>
              </div>
              <Progress value={statistics.failureRate} className="h-2 bg-red-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-health-charcoal">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" onClick={handleAddTest}>
              <TestTube className="w-4 h-4 mr-2" />
              Add Quality Test
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FileText className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Settings className="w-4 h-4 mr-2" />
              Quality Settings
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-health-charcoal">Quality Control Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-health-blue-gray w-4 h-4" />
                <Input
                  placeholder="Search by unit ID or donor name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="passed">Passed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="quarantine">Quarantine</SelectItem>
                <SelectItem value="disposed">Disposed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={bloodTypeFilter} onValueChange={setBloodTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by blood type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Blood Types</SelectItem>
                <SelectItem value="A+">A+</SelectItem>
                <SelectItem value="A-">A-</SelectItem>
                <SelectItem value="B+">B+</SelectItem>
                <SelectItem value="B-">B-</SelectItem>
                <SelectItem value="AB+">AB+</SelectItem>
                <SelectItem value="AB-">AB-</SelectItem>
                <SelectItem value="O+">O+</SelectItem>
                <SelectItem value="O-">O-</SelectItem>
              </SelectContent>
            </Select>
            <Select value={componentFilter} onValueChange={setComponentFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by component" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Components</SelectItem>
                <SelectItem value="Whole Blood">Whole Blood</SelectItem>
                <SelectItem value="Red Cells">Red Cells</SelectItem>
                <SelectItem value="Plasma">Plasma</SelectItem>
                <SelectItem value="Platelets">Platelets</SelectItem>
                <SelectItem value="Cryoprecipitate">Cryoprecipitate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quality Control Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unit ID</TableHead>
                  <TableHead>Blood Type</TableHead>
                  <TableHead>Component</TableHead>
                  <TableHead>Donor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Quality Score</TableHead>
                  <TableHead>Compliance</TableHead>
                  <TableHead>Tests</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQualityControls.map((control) => (
                  <TableRow key={control.id}>
                    <TableCell className="font-medium">{control.unitId}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-health-primary text-health-primary">
                        {control.bloodType}
                      </Badge>
                    </TableCell>
                    <TableCell>{control.componentType}</TableCell>
                    <TableCell>{control.donorName}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(control.overallStatus)}>
                        {control.overallStatus.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{control.qualityScore}%</span>
                        <Progress value={control.qualityScore} className="w-16 h-2" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getComplianceColor(control.complianceStatus)}>
                        {control.complianceStatus.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {control.testsCompleted}/{control.totalTests}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{control.daysUntilExpiry} days</div>
                        <div className="text-health-blue-gray">{control.expiryDate}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(control)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Quality Control Details - {control.unitId}</DialogTitle>
                            </DialogHeader>
                            <Tabs defaultValue="overview" className="w-full">
                              <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="tests">Quality Tests</TabsTrigger>
                                <TabsTrigger value="compliance">Compliance</TabsTrigger>
                                <TabsTrigger value="actions">Actions</TabsTrigger>
                              </TabsList>
                              
                              <TabsContent value="overview" className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium">Unit Information</Label>
                                    <div className="mt-2 space-y-2 text-sm">
                                      <div><span className="font-medium">Unit ID:</span> {control.unitId}</div>
                                      <div><span className="font-medium">Blood Type:</span> {control.bloodType}</div>
                                      <div><span className="font-medium">Component:</span> {control.componentType}</div>
                                      <div><span className="font-medium">Donor:</span> {control.donorName}</div>
                                    </div>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Quality Metrics</Label>
                                    <div className="mt-2 space-y-2 text-sm">
                                      <div><span className="font-medium">Overall Status:</span> 
                                        <Badge className={`ml-2 ${getStatusColor(control.overallStatus)}`}>
                                          {control.overallStatus.replace('_', ' ')}
                                        </Badge>
                                      </div>
                                      <div><span className="font-medium">Quality Score:</span> {control.qualityScore}%</div>
                                      <div><span className="font-medium">Compliance:</span> 
                                        <Badge className={`ml-2 ${getComplianceColor(control.complianceStatus)}`}>
                                          {control.complianceStatus.replace('_', ' ')}
                                        </Badge>
                                      </div>
                                      <div><span className="font-medium">Tests:</span> {control.testsCompleted}/{control.totalTests}</div>
                                    </div>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium">Dates</Label>
                                    <div className="mt-2 space-y-2 text-sm">
                                      <div><span className="font-medium">Collection:</span> {control.collectionDate}</div>
                                      <div><span className="font-medium">Processing:</span> {control.processingDate}</div>
                                      <div><span className="font-medium">Expiry:</span> {control.expiryDate}</div>
                                      <div><span className="font-medium">Days Until Expiry:</span> {control.daysUntilExpiry}</div>
                                    </div>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Testing Information</Label>
                                    <div className="mt-2 space-y-2 text-sm">
                                      <div><span className="font-medium">Last Test:</span> {control.lastTestDate}</div>
                                      <div><span className="font-medium">Technician:</span> {control.technician}</div>
                                    </div>
                                  </div>
                                </div>
                              </TabsContent>
                              
                              <TabsContent value="tests" className="space-y-4">
                                <div className="space-y-4">
                                  <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-semibold">Quality Tests</h3>
                                    <Button size="sm" onClick={handleAddTest}>
                                      <Plus className="w-4 h-4 mr-2" />
                                      Add Test
                                    </Button>
                                  </div>
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Test Type</TableHead>
                                        <TableHead>Method</TableHead>
                                        <TableHead>Result</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Technician</TableHead>
                                        <TableHead>Notes</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {selectedTests.map((test) => (
                                        <TableRow key={test.id}>
                                          <TableCell>{test.testType}</TableCell>
                                          <TableCell>{test.testMethod}</TableCell>
                                          <TableCell>
                                            <Badge className={
                                              test.result === 'pass' ? 'bg-health-success text-white' :
                                              test.result === 'fail' ? 'bg-health-danger text-white' :
                                              test.result === 'inconclusive' ? 'bg-health-warning text-white' :
                                              'bg-health-blue-gray text-white'
                                            }>
                                              {test.result}
                                            </Badge>
                                          </TableCell>
                                          <TableCell>{test.testDate}</TableCell>
                                          <TableCell>{test.technician}</TableCell>
                                          <TableCell>{test.notes || '-'}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </TabsContent>
                              
                              <TabsContent value="compliance" className="space-y-4">
                                <div className="space-y-4">
                                  <h3 className="text-lg font-semibold">Regulatory Compliance</h3>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-sm">Compliance Status</CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <Badge className={getComplianceColor(control.complianceStatus)}>
                                          {control.complianceStatus.replace('_', ' ')}
                                        </Badge>
                                      </CardContent>
                                    </Card>
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-sm">Quality Score</CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="text-2xl font-bold">{control.qualityScore}%</div>
                                      </CardContent>
                                    </Card>
                                  </div>
                                </div>
                              </TabsContent>
                              
                              <TabsContent value="actions" className="space-y-4">
                                <div className="space-y-4">
                                  <h3 className="text-lg font-semibold">Quality Control Actions</h3>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Button 
                                      variant="outline" 
                                      className="w-full justify-start"
                                      onClick={handleAddTest}
                                    >
                                      <TestTube className="w-4 h-4 mr-2" />
                                      Add Quality Test
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      className="w-full justify-start"
                                      onClick={handleQuarantine}
                                    >
                                      <AlertTriangle className="w-4 h-4 mr-2" />
                                      Quarantine Unit
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      className="w-full justify-start"
                                      onClick={handleRelease}
                                    >
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Release from Quarantine
                                    </Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button variant="outline" className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50">
                                          <XCircle className="w-4 h-4 mr-2" />
                                          Dispose Unit
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Dispose Unit</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Are you sure you want to dispose of unit {control.unitId}? This action cannot be undone.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction onClick={handleDispose} className="bg-red-600 hover:bg-red-700">
                                            Dispose
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </div>
                              </TabsContent>
                            </Tabs>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-health-blue-gray">
              Showing {filteredQualityControls.length} of {qualityControls.length} records
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QualityControl;
