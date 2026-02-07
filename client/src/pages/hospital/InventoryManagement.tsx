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
  Package, 
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
  Building2,
  ShoppingCart,
  Truck,
  Archive,
  RefreshCw,
  Minus,
  Plus as PlusIcon
} from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  category: 'medication' | 'equipment' | 'supplies' | 'devices' | 'consumables';
  sku: string;
  description: string;
  quantity: number;
  minQuantity: number;
  maxQuantity: number;
  unit: string;
  location: string;
  supplier: string;
  cost: number;
  expiryDate?: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'expired' | 'on-order';
  lastUpdated: string;
  lastRestocked: string;
  notes?: string;
}

const InventoryManagement: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isRestockDialogOpen, setIsRestockDialogOpen] = useState(false);

  // Fetch inventory from API
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        // const response = await api.get('/hospital/inventory');
        // setInventory(response.data);
        setInventory([]);
      } catch (error) {
        console.error('Error fetching inventory:', error);
        setInventory([]);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock': return 'bg-green-100 text-green-800';
      case 'low-stock': return 'bg-yellow-100 text-yellow-800';
      case 'out-of-stock': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'on-order': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in-stock': return <CheckCircle className="w-4 h-4" />;
      case 'low-stock': return <AlertTriangle className="w-4 h-4" />;
      case 'out-of-stock': return <Minus className="w-4 h-4" />;
      case 'expired': return <AlertTriangle className="w-4 h-4" />;
      case 'on-order': return <Truck className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'medication': return <Package className="w-4 h-4" />;
      case 'equipment': return <Activity className="w-4 h-4" />;
      case 'supplies': return <ShoppingCart className="w-4 h-4" />;
      case 'devices': return <Building2 className="w-4 h-4" />;
      case 'consumables': return <Archive className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const stats = {
    total: inventory.length,
    inStock: inventory.filter(i => i.status === 'in-stock').length,
    lowStock: inventory.filter(i => i.status === 'low-stock').length,
    outOfStock: inventory.filter(i => i.status === 'out-of-stock').length,
    expired: inventory.filter(i => i.status === 'expired').length,
    onOrder: inventory.filter(i => i.status === 'on-order').length
  };

  const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.cost), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">Manage hospital inventory and supplies</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add New Item
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">In Stock</p>
                <p className="text-2xl font-bold text-green-600">{stats.inStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.lowStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Minus className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Truck className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">On Order</p>
                <p className="text-2xl font-bold text-blue-600">{stats.onOrder}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-purple-600">${totalValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search items, SKU, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="medication">Medication</SelectItem>
                <SelectItem value="equipment">Equipment</SelectItem>
                <SelectItem value="supplies">Supplies</SelectItem>
                <SelectItem value="devices">Devices</SelectItem>
                <SelectItem value="consumables">Consumables</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="low-stock">Low Stock</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="on-order">On Order</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Item</th>
                  <th className="text-left p-3 font-medium">Category</th>
                  <th className="text-left p-3 font-medium">SKU</th>
                  <th className="text-left p-3 font-medium">Quantity</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Location</th>
                  <th className="text-left p-3 font-medium">Cost</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-500">{item.description}</div>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className="capitalize flex items-center gap-1 w-fit">
                        {getCategoryIcon(item.category)}
                        {item.category}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="font-mono text-sm">{item.sku}</div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">
                        {item.quantity} {item.unit}
                      </div>
                      <div className="text-xs text-gray-500">
                        Min: {item.minQuantity} | Max: {item.maxQuantity}
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className={`${getStatusColor(item.status)} flex items-center gap-1 w-fit`}>
                        {getStatusIcon(item.status)}
                        {item.status.replace('-', ' ').charAt(0).toUpperCase() + item.status.replace('-', ' ').slice(1)}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">{item.location}</div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">${item.cost.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">
                        Total: ${(item.quantity * item.cost).toFixed(2)}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedItem(item);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedItem(item);
                            setIsRestockDialogOpen(true);
                          }}
                        >
                          <PlusIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedItem(item);
                            setIsEditDialogOpen(true);
                          }}
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

      {/* Add Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Inventory Item</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Item Name</Label>
              <Input id="name" placeholder="e.g., Paracetamol 500mg" />
            </div>
            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" placeholder="e.g., MED-001" />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medication">Medication</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="supplies">Supplies</SelectItem>
                  <SelectItem value="devices">Devices</SelectItem>
                  <SelectItem value="consumables">Consumables</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="unit">Unit</Label>
              <Input id="unit" placeholder="e.g., tablets, units, boxes" />
            </div>
            <div>
              <Label htmlFor="quantity">Initial Quantity</Label>
              <Input id="quantity" type="number" placeholder="e.g., 100" />
            </div>
            <div>
              <Label htmlFor="cost">Unit Cost</Label>
              <Input id="cost" type="number" step="0.01" placeholder="e.g., 0.25" />
            </div>
            <div>
              <Label htmlFor="minQuantity">Minimum Quantity</Label>
              <Input id="minQuantity" type="number" placeholder="e.g., 50" />
            </div>
            <div>
              <Label htmlFor="maxQuantity">Maximum Quantity</Label>
              <Input id="maxQuantity" type="number" placeholder="e.g., 500" />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="e.g., Pharmacy A" />
            </div>
            <div>
              <Label htmlFor="supplier">Supplier</Label>
              <Input id="supplier" placeholder="e.g., PharmaCorp" />
            </div>
            <div>
              <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
              <Input id="expiryDate" type="date" />
            </div>
            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Item description..." />
            </div>
            <div className="col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Additional notes..." />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Add Item
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Restock Dialog */}
      <Dialog open={isRestockDialogOpen} onOpenChange={setIsRestockDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Restock Item</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Item</Label>
                <p className="text-lg font-semibold">{selectedItem.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Current Quantity</Label>
                <p className="text-lg">{selectedItem.quantity} {selectedItem.unit}</p>
              </div>
              <div>
                <Label htmlFor="restockQuantity">Quantity to Add</Label>
                <Input id="restockQuantity" type="number" placeholder="Enter quantity" />
              </div>
              <div>
                <Label htmlFor="restockCost">Unit Cost</Label>
                <Input id="restockCost" type="number" step="0.01" defaultValue={selectedItem.cost.toString()} />
              </div>
              <div>
                <Label htmlFor="restockSupplier">Supplier</Label>
                <Input id="restockSupplier" defaultValue={selectedItem.supplier} />
              </div>
              <div>
                <Label htmlFor="restockNotes">Notes</Label>
                <Textarea id="restockNotes" placeholder="Restock notes..." />
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsRestockDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">
              Restock
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Item Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Item Details</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Item Name</Label>
                  <p className="text-lg font-semibold">{selectedItem.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">SKU</Label>
                  <p className="text-lg font-mono">{selectedItem.sku}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Category</Label>
                  <Badge variant="outline" className="capitalize">
                    {selectedItem.category}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <Badge className={`${getStatusColor(selectedItem.status)}`}>
                    {selectedItem.status.replace('-', ' ').charAt(0).toUpperCase() + selectedItem.status.replace('-', ' ').slice(1)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Quantity</Label>
                  <p className="text-lg">{selectedItem.quantity} {selectedItem.unit}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Unit Cost</Label>
                  <p className="text-lg">${selectedItem.cost.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Location</Label>
                  <p className="text-lg">{selectedItem.location}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Supplier</Label>
                  <p className="text-lg">{selectedItem.supplier}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <Label className="text-sm font-medium text-gray-600">Description</Label>
                <p className="text-lg">{selectedItem.description}</p>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Stock Levels</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Current</Label>
                    <p className="text-lg">{selectedItem.quantity}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Minimum</Label>
                    <p className="text-lg">{selectedItem.minQuantity}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Maximum</Label>
                    <p className="text-lg">{selectedItem.maxQuantity}</p>
                  </div>
                </div>
              </div>

              {selectedItem.expiryDate && (
                <div className="border-t pt-4">
                  <Label className="text-sm font-medium text-gray-600">Expiry Date</Label>
                  <p className="text-lg">{selectedItem.expiryDate}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">History</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Last Updated</Label>
                    <p className="text-lg">{selectedItem.lastUpdated}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Last Restocked</Label>
                    <p className="text-lg">{selectedItem.lastRestocked}</p>
                  </div>
                </div>
              </div>

              {selectedItem.notes && (
                <div className="border-t pt-4">
                  <Label className="text-sm font-medium text-gray-600">Notes</Label>
                  <p className="text-lg">{selectedItem.notes}</p>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryManagement; 