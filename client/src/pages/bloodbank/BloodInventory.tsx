import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, Search, Filter, Eye, Edit, Trash, AlertTriangle, 
  Clock, CheckCircle, XCircle, Droplets, Users, Activity,
  BarChart3, PieChart, LineChart, Download, RefreshCw,
  Calendar, MapPin, TestTube, Shield, Truck, FileText,
  ArrowUpDown, MoreHorizontal, PlusCircle, MinusCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  bloodInventoryAPI, 
  BloodUnit, 
  InventorySummary,
  bloodbankUtils 
} from '@/services/bloodbankService';



const BloodInventory: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [bloodUnits, setBloodUnits] = useState<BloodUnit[]>([]);
  const [inventorySummary, setInventorySummary] = useState<InventorySummary[]>([]);
  const [filteredUnits, setFilteredUnits] = useState<BloodUnit[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBloodType, setSelectedBloodType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedComponent, setSelectedComponent] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddUnitDialog, setShowAddUnitDialog] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<BloodUnit | null>(null);

  // Load inventory data from API
  useEffect(() => {
    loadInventoryData();
  }, []);

  const loadInventoryData = async () => {
    try {
      setIsLoading(true);
      
      // Load inventory summary
      const summary = await bloodInventoryAPI.getSummary();
      setInventorySummary([{ _id: 'summary', ...summary }]);
      
      // Load blood units
      const response = await bloodInventoryAPI.getUnits({
        page: currentPage,
        limit: 10,
        bloodType: selectedBloodType !== 'all' ? selectedBloodType : undefined,
        componentType: selectedComponent !== 'all' ? selectedComponent : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        search: searchTerm || undefined,
        sortBy,
        sortOrder
      });
      
      setBloodUnits(response.data);
      setFilteredUnits(response.data);
      setTotalPages(response.pagination.totalPages);
      
      toast.success('Inventory data loaded successfully');
    } catch (error) {
      console.error('Error loading inventory data:', error);
      toast.error('Failed to load inventory data');
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    filterAndSortUnits();
  }, [bloodUnits, searchTerm, selectedBloodType, selectedStatus, selectedComponent, sortBy, sortOrder]);

  const filterAndSortUnits = () => {
    let filtered = [...bloodUnits];

    // Apply filters
    if (searchTerm) {
      filtered = filtered.filter(unit => 
        unit.unitId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.donor.donorId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedBloodType !== 'all') {
      filtered = filtered.filter(unit => unit.bloodType === selectedBloodType);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(unit => unit.status === selectedStatus);
    }

    if (selectedComponent !== 'all') {
      filtered = filtered.filter(unit => unit.componentType === selectedComponent);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'unitId':
          aValue = a.unitId;
          bValue = b.unitId;
          break;
        case 'bloodType':
          aValue = a.bloodType;
          bValue = b.bloodType;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'expiry':
          aValue = a.expiry.daysUntilExpiry;
          bValue = b.expiry.daysUntilExpiry;
          break;
        default:
          aValue = a.unitId;
          bValue = b.unitId;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredUnits(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'reserved':
        return 'bg-blue-100 text-blue-800';
      case 'testing':
        return 'bg-yellow-100 text-yellow-800';
      case 'quarantine':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      case 'disposed':
        return 'bg-gray-100 text-gray-800';
      case 'transfused':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getExpiryColor = (days: number) => {
    if (days <= 3) return 'text-red-600';
    if (days <= 7) return 'text-orange-600';
    if (days <= 14) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getComponentTypeLabel = (type: string) => {
    switch (type) {
      case 'whole_blood':
        return 'Whole Blood';
      case 'red_blood_cells':
        return 'Red Blood Cells';
      case 'plasma':
        return 'Plasma';
      case 'platelets':
        return 'Platelets';
      case 'cryoprecipitate':
        return 'Cryoprecipitate';
      default:
        return type;
    }
  };

  const handleRefresh = () => {
    loadInventoryData();
  };

  const handleExport = () => {
    // Implement export functionality
    toast.info('Export functionality coming soon');
  };

  const handleAddUnit = () => {
    setShowAddUnitDialog(true);
  };

  const handleViewUnit = (unit: BloodUnit) => {
    setSelectedUnit(unit);
  };

  const handleEditUnit = (unit: BloodUnit) => {
    // Implement edit functionality
    toast.info('Edit functionality coming soon');
  };

  const handleDeleteUnit = (unit: BloodUnit) => {
    // Implement delete functionality
    toast.info('Delete functionality coming soon');
  };

  const totalUnits = inventorySummary.reduce((sum, item) => sum + item.total, 0);
  const availableUnits = inventorySummary.reduce((sum, item) => sum + item.available, 0);
  const reservedUnits = inventorySummary.reduce((sum, item) => sum + item.reserved, 0);
  const testingUnits = inventorySummary.reduce((sum, item) => sum + item.testing, 0);
  const expiredUnits = inventorySummary.reduce((sum, item) => sum + item.expired, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-health-charcoal">Blood Inventory Management</h1>
          <p className="text-health-blue-gray mt-1">
            Manage blood units, track quality tests, and monitor inventory levels
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
            className="bg-white border-health-blue-gray/20 hover:bg-health-light-gray"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" className="bg-white border-health-blue-gray/20 hover:bg-health-light-gray">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleAddUnit} className="bg-health-danger hover:bg-red-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Blood Unit
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-health-charcoal">Total Units</CardTitle>
            <Droplets className="h-4 w-4 text-health-danger" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-health-charcoal">{totalUnits}</div>
            <p className="text-xs text-health-blue-gray">All blood types</p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-health-charcoal">Available</CardTitle>
            <CheckCircle className="h-4 w-4 text-health-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-health-success">{availableUnits}</div>
            <p className="text-xs text-health-blue-gray">Ready for use</p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-health-charcoal">Reserved</CardTitle>
            <Users className="h-4 w-4 text-chart-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-blue">{reservedUnits}</div>
            <p className="text-xs text-health-blue-gray">Held for patients</p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-health-charcoal">Testing</CardTitle>
            <TestTube className="h-4 w-4 text-health-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-health-warning">{testingUnits}</div>
            <p className="text-xs text-health-blue-gray">Quality checks</p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-health-charcoal">Expired</CardTitle>
            <Clock className="h-4 w-4 text-health-danger" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-health-danger">{expiredUnits}</div>
            <p className="text-xs text-health-blue-gray">Past expiry date</p>
          </CardContent>
        </Card>
      </div>

      {/* Blood Type Distribution */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center text-lg text-health-charcoal">
            <PieChart className="w-5 h-5 mr-2" />
            Blood Type Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {inventorySummary.map((type) => (
              <div key={type._id} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-health-charcoal">{type._id}</span>
                  <span className="text-health-blue-gray">{type.total} units</span>
                </div>
                <Progress value={(type.total / totalUnits) * 100} className="h-2" />
                <div className="flex justify-between text-xs text-health-blue-gray">
                  <span>Available: {type.available}</span>
                  <span>Reserved: {type.reserved}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center text-lg text-health-charcoal">
            <Filter className="w-5 h-5 mr-2" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-health-blue-gray" />
                <Input
                  id="search"
                  placeholder="Unit ID, Donor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bloodType">Blood Type</Label>
              <Select value={selectedBloodType} onValueChange={setSelectedBloodType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Blood Types" />
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="testing">Testing</SelectItem>
                  <SelectItem value="quarantine">Quarantine</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="disposed">Disposed</SelectItem>
                  <SelectItem value="transfused">Transfused</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="component">Component</Label>
              <Select value={selectedComponent} onValueChange={setSelectedComponent}>
                <SelectTrigger>
                  <SelectValue placeholder="All Components" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Components</SelectItem>
                  <SelectItem value="whole_blood">Whole Blood</SelectItem>
                  <SelectItem value="red_blood_cells">Red Blood Cells</SelectItem>
                  <SelectItem value="plasma">Plasma</SelectItem>
                  <SelectItem value="platelets">Platelets</SelectItem>
                  <SelectItem value="cryoprecipitate">Cryoprecipitate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sort">Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unitId">Unit ID</SelectItem>
                  <SelectItem value="bloodType">Blood Type</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="expiry">Expiry Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedBloodType('all');
                setSelectedStatus('all');
                setSelectedComponent('all');
                setSortBy('createdAt');
                setSortOrder('desc');
              }}
              className="border-health-blue-gray/20 text-health-blue-gray hover:bg-health-light-gray"
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Blood Units Table */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-lg text-health-charcoal">
            <span>Blood Units ({filteredUnits.length})</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="border-health-blue-gray/20 text-health-blue-gray hover:bg-health-light-gray"
            >
              <ArrowUpDown className="w-4 h-4 mr-2" />
              {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unit ID</TableHead>
                  <TableHead>Blood Type</TableHead>
                  <TableHead>Component</TableHead>
                  <TableHead>Donor</TableHead>
                  <TableHead>Collection Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Storage</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUnits.map((unit) => (
                  <TableRow key={unit._id}>
                    <TableCell className="font-medium">{unit.unitId}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {unit.bloodType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {getComponentTypeLabel(unit.componentType)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{unit.donor.name}</div>
                        <div className="text-health-blue-gray">ID: {unit.donor.donorId}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(unit.collection.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${getStatusColor(unit.status)}`}>
                        {unit.status.charAt(0).toUpperCase() + unit.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="text-health-blue-gray">
                        {unit.storage.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`text-sm font-medium ${getExpiryColor(unit.expiry.daysUntilExpiry)}`}>
                        {unit.expiry.daysUntilExpiry} days
                      </div>
                      <div className="text-xs text-health-blue-gray">
                        {new Date(unit.expiry.expiryDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewUnit(unit)}
                          className="border-health-aqua/20 text-health-aqua hover:bg-health-aqua/5"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditUnit(unit)}
                          className="border-health-success/20 text-health-success hover:bg-health-success/5"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteUnit(unit)}
                          className="border-health-danger/20 text-health-danger hover:bg-health-danger/5"
                        >
                          <Trash className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredUnits.length === 0 && (
            <div className="text-center py-8 text-health-blue-gray">
              <TestTube className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No blood units found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-health-blue-gray">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Add Blood Unit Dialog */}
      <Dialog open={showAddUnitDialog} onOpenChange={setShowAddUnitDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Blood Unit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-health-blue-gray">
              Add a new blood unit to the inventory. This will create a new record for tracking.
            </p>
            {/* Add form components here */}
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowAddUnitDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => setShowAddUnitDialog(false)}>
                Add Unit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Blood Unit Dialog */}
      <Dialog open={!!selectedUnit} onOpenChange={() => setSelectedUnit(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Blood Unit Details - {selectedUnit?.unitId}</DialogTitle>
          </DialogHeader>
          {selectedUnit && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-health-charcoal mb-3">Basic Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-health-blue-gray">Unit ID:</span>
                      <span className="font-medium">{selectedUnit.unitId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-health-blue-gray">Blood Type:</span>
                      <span className="font-medium">{selectedUnit.bloodType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-health-blue-gray">Component:</span>
                      <span className="font-medium">{getComponentTypeLabel(selectedUnit.componentType)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-health-blue-gray">Status:</span>
                      <Badge className={`text-xs ${getStatusColor(selectedUnit.status)}`}>
                        {selectedUnit.status.charAt(0).toUpperCase() + selectedUnit.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-health-charcoal mb-3">Donor Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-health-blue-gray">Name:</span>
                      <span className="font-medium">{selectedUnit.donor.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-health-blue-gray">Donor ID:</span>
                      <span className="font-medium">{selectedUnit.donor.donorId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-health-blue-gray">Age:</span>
                      <span className="font-medium">{selectedUnit.donor.age}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-health-blue-gray">Gender:</span>
                      <span className="font-medium">{selectedUnit.donor.gender}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-health-charcoal mb-3">Collection Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-health-blue-gray">Date:</span>
                      <span className="font-medium">
                        {new Date(selectedUnit.collection.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-health-blue-gray">Location:</span>
                      <span className="font-medium">{selectedUnit.collection.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-health-blue-gray">Volume:</span>
                      <span className="font-medium">{selectedUnit.collection.volume} ml</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-health-charcoal mb-3">Storage & Expiry</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-health-blue-gray">Location:</span>
                      <span className="font-medium">{selectedUnit.storage.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-health-blue-gray">Shelf:</span>
                      <span className="font-medium">{selectedUnit.storage.shelf}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-health-blue-gray">Expiry Date:</span>
                      <span className={`font-medium ${getExpiryColor(selectedUnit.expiry.daysUntilExpiry)}`}>
                        {new Date(selectedUnit.expiry.expiryDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-health-blue-gray">Days Until Expiry:</span>
                      <span className={`font-medium ${getExpiryColor(selectedUnit.expiry.daysUntilExpiry)}`}>
                        {selectedUnit.expiry.daysUntilExpiry} days
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedUnit.qualityTests.length > 0 && (
                <div>
                  <h3 className="font-semibold text-health-charcoal mb-3">Quality Tests</h3>
                  <div className="space-y-2">
                    {selectedUnit.qualityTests.map((test, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-health-light-gray rounded-lg">
                        <div className="flex items-center space-x-3">
                          <TestTube className="w-4 h-4 text-health-blue-gray" />
                          <div>
                            <div className="font-medium text-sm">{test.testType}</div>
                            <div className="text-xs text-health-blue-gray">
                              {new Date(test.testDate).toLocaleDateString()} • {test.technician}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={test.result === 'pass' ? 'default' : 
                                   test.result === 'fail' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {test.result}
                          </Badge>
                          {test.qualityScore > 0 && (
                            <span className="text-sm font-medium text-health-success">
                              {test.qualityScore}%
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedUnit.reservation?.isReserved && (
                <div>
                  <h3 className="font-semibold text-health-charcoal mb-3">Reservation Details</h3>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-health-blue-gray">Hospital:</span>
                        <span className="font-medium ml-2">{selectedUnit.reservation.reservedBy.hospital}</span>
                      </div>
                      <div>
                        <span className="text-health-blue-gray">Patient:</span>
                        <span className="font-medium ml-2">{selectedUnit.reservation.reservedBy.patient}</span>
                      </div>
                      <div>
                        <span className="text-health-blue-gray">Reserved Until:</span>
                        <span className="font-medium ml-2">
                          {new Date(selectedUnit.reservation.reservedUntil).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedUnit(null)}
                >
                  Close
                </Button>
                <Button onClick={() => handleEditUnit(selectedUnit)}>
                  Edit Unit
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BloodInventory;
