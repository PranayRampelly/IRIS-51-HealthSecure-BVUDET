import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Upload, Edit, Trash2, User, RefreshCw, Image as ImageIcon, Phone as PhoneIcon, Mail as MailIcon, Calendar as CalendarIcon, Eye, MapPin, CreditCard, FileText, Heart, Shield, Package, Star, X } from 'lucide-react';
import pharmacyService from '@/services/pharmacyService';

type Customer = {
  _id: string;
  firstName?: string;
  lastName?: string;
  name?: string; // Computed from firstName + lastName
  email?: string;
  phone?: string;
  alternatePhone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };
  dateOfBirth?: string;
  gender?: string;
  membershipLevel?: 'standard' | 'silver' | 'gold' | 'platinum';
  customerType?: 'regular' | 'premium' | 'vip' | 'wholesale';
  status?: 'active' | 'inactive' | 'suspended' | 'deleted';
  isVerified?: boolean;
  orderStats?: {
    totalOrders?: number;
    totalSpent?: number;
    lastOrderDate?: string | Date;
    averageOrderValue?: number;
    loyaltyPoints?: number;
    favoriteCategories?: string[];
  };
  totalOrders?: number;
  totalSpent?: number;
  lastOrderDate?: string;
  notes?: string;
  profileImage?: {
    cloudinaryUrl?: string;
    cloudinaryId?: string;
  };
  cloudinaryUrl?: string;
  medicalInfo?: {
    bloodGroup?: string;
    allergies?: Array<{ allergen: string; severity: string; notes?: string }>;
    chronicConditions?: Array<{ condition: string; diagnosisDate?: string; notes?: string }>;
    currentMedications?: Array<{ medication: string; dosage: string; frequency: string; prescribedBy?: string }>;
  };
  insuranceInfo?: {
    provider?: string;
    policyNumber?: string;
    coverageDetails?: string;
    copay?: number;
    deductible?: number;
  };
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
    email?: string;
  };
  paymentMethods?: Array<{
    type: string;
    provider?: string;
    lastFourDigits?: string;
    isDefault?: boolean;
  }>;
  deliveryPreferences?: {
    preferredTimeSlot?: string;
    deliveryInstructions?: string;
    deliveryAddress?: {
      street?: string;
      city?: string;
      state?: string;
      pincode?: string;
    };
  };
  documents?: Array<{
    _id?: string;
    type: string;
    name: string;
    cloudinaryUrl: string;
    uploadedAt?: string | Date;
    description?: string;
  }>;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [pagination, setPagination] = useState<any>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedCustomerDetails, setSelectedCustomerDetails] = useState<Customer | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [dateOfBirth, setDob] = useState('');
  const [membershipLevel, setMembershipLevel] = useState<'standard'|'silver'|'gold'|'platinum'>('standard');
  const [isVerified, setVerified] = useState(false);
  const [notes, setNotes] = useState('');
  const [image, setImage] = useState<File | undefined>(undefined);

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [membershipFilter, setMembershipFilter] = useState<'all'|'standard'|'silver'|'gold'|'platinum'>('all');
  const [verifiedFilter, setVerifiedFilter] = useState<'all'|'verified'|'unverified'>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selected, setSelected] = useState<Customer | null>(null);

  const load = async (params?: any) => {
    setLoading(true);
    try {
      // Only pass search and status filters - backend handles pharmacy filtering
      const filterParams: any = {};
      if (searchQuery) filterParams.search = searchQuery;
      if (verifiedFilter !== 'all') {
        filterParams.status = verifiedFilter === 'verified' ? 'active' : 'inactive';
      }
      
      const response = await pharmacyService.listCustomers(filterParams);
      
      // Handle both response formats: { success, data: { customers, pagination } } or direct array
      let customersList: any[] = [];
      
      if (response?.success && response?.data) {
        customersList = response.data.customers || [];
        setPagination(response.data.pagination);
      } else if (Array.isArray(response)) {
        customersList = response;
      }
      
      // Ensure we only show customers for this pharmacy (backend should already filter, but double-check)
      const transformedCustomers = customersList
        .filter((c: any) => c) // Remove any null/undefined
        .map((c: any) => ({
          ...c,
          name: c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Unknown',
          cloudinaryUrl: c.profileImage?.cloudinaryUrl || c.cloudinaryUrl,
          totalOrders: c.orderStats?.totalOrders || c.totalOrders || 0,
          totalSpent: c.orderStats?.totalSpent || c.totalSpent || 0,
          lastOrderDate: c.orderStats?.lastOrderDate || c.lastOrderDate,
        }));
      
      setCustomers(transformedCustomers);
    } catch (error) {
      console.error('Failed to load customers:', error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerDetails = async (id: string) => {
    setLoadingDetails(true);
    try {
      const response = await pharmacyService.getCustomerById(id);
      const customer = response?.data || response;
      setSelectedCustomerDetails({
        ...customer,
        name: customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Unknown',
        cloudinaryUrl: customer.profileImage?.cloudinaryUrl || customer.cloudinaryUrl,
      });
    } catch (error) {
      console.error('Failed to load customer details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => { 
    load(); 
  }, []);

  // Reload when search or status filter changes (backend handles these)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery || verifiedFilter !== 'all') {
        load();
      }
    }, 300); // Debounce search
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery, verifiedFilter]);

  const create = async () => {
    setCreating(true);
    try {
      // Split name into firstName and lastName
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      await pharmacyService.createCustomer({
        firstName,
        lastName,
        email,
        phone,
        address: address ? { street: address } : undefined,
        dateOfBirth,
        customerType: membershipLevel === 'platinum' ? 'vip' : membershipLevel === 'gold' ? 'premium' : 'regular',
        status: isVerified ? 'active' : 'inactive',
        notes,
      }, image);
      setName(''); setEmail(''); setPhone(''); setAddress(''); setDob(''); setMembershipLevel('standard'); setVerified(false); setNotes(''); setImage(undefined);
      setShowCreateDialog(false);
      await load();
    } finally {
      setCreating(false);
    }
  };

  const updateField = async (id: string, field: keyof Customer, value: any) => {
    const payload: any = {};
    payload[field] = value;
    await pharmacyService.updateCustomer(id, payload);
    await load();
  };

  const updateImage = async (id: string, file?: File) => {
    if (!file) return;
    await pharmacyService.updateCustomer(id, {}, file);
    await load();
  };

  const remove = async (id: string) => {
    await pharmacyService.deleteCustomer(id);
    await load();
  };

  // Backend handles filtering, but we can do client-side membership filter if needed
  const filtered = customers.filter((c) => {
    // Only filter by membership type on client side if needed
    if (membershipFilter !== 'all') {
      const customerType = c.customerType || c.membershipLevel || 'regular';
      const filterMap: any = {
        'standard': 'regular',
        'silver': 'regular',
        'gold': 'premium',
        'platinum': 'vip'
      };
      return customerType === filterMap[membershipFilter] || customerType === membershipFilter;
    }
    return true;
  });

  return (
    <div className="space-y-4 bg-health-light-gray min-h-screen px-2 md:px-6 py-4 w-full">
      {/* Header */}
      <div className="bg-health-teal rounded-lg p-6 mb-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2"><User className="w-7 h-7" /> Customers</h1>
            <p className="text-white/80 mt-2">Manage pharmacy customers, memberships and verification status</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={load}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button className="bg-white text-health-teal hover:bg-white/90" onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" /> Add Customer
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input placeholder="Search by name, phone or email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
            </div>
            <Select value={membershipFilter} onValueChange={(v) => setMembershipFilter(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Memberships</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="silver">Silver</SelectItem>
                <SelectItem value="gold">Gold</SelectItem>
                <SelectItem value="platinum">Platinum</SelectItem>
              </SelectContent>
            </Select>
            <Select value={verifiedFilter} onValueChange={(v) => setVerifiedFilter(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-health-charcoal">Customer Directory</CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No customers found. Adjust filters or add a new customer.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {c.cloudinaryUrl ? (
                          <img src={c.cloudinaryUrl} alt={c.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-health-light-gray flex items-center justify-center">
                            <User className="w-5 h-5 text-health-blue-gray" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-health-charcoal">{c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Unknown'}</div>
                          {c.status && (
                            <Badge className={`text-xs mt-1 ${
                              c.status === 'active' ? 'bg-green-100 text-green-800' :
                              c.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {c.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-health-charcoal space-y-1">
                        {c.phone && (
                          <div className="flex items-center gap-1">
                            <PhoneIcon className="w-4 h-4 text-health-blue-gray" /> 
                            <span>{c.phone}</span>
                          </div>
                        )}
                        {c.email && (
                          <div className="flex items-center gap-1">
                            <MailIcon className="w-4 h-4 text-health-blue-gray" /> 
                            <span className="truncate max-w-[200px]">{c.email}</span>
                          </div>
                        )}
                        {!c.phone && !c.email && <span className="text-gray-400">—</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`capitalize ${
                        c.customerType === 'vip' ? 'bg-purple-100 text-purple-800' :
                        c.customerType === 'premium' ? 'bg-yellow-100 text-yellow-800' :
                        c.customerType === 'wholesale' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {c.customerType || 'regular'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-health-charcoal">{c.totalOrders ?? 0}</div>
                      {c.lastOrderDate && (
                        <div className="text-xs text-health-blue-gray">
                          Last: {new Date(c.lastOrderDate).toLocaleDateString()}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-health-charcoal">₹{(c.totalSpent || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => { loadCustomerDetails(c._id); setShowDetailsDialog(true); }}>
                          <Eye className="w-4 h-4 mr-1" /> View
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => { setSelected(c); setShowEditDialog(true); }}>
                          <Edit className="w-4 h-4 mr-1" /> Edit
                        </Button>
                        <div>
                          <label className="inline-flex">
                            <input type="file" className="hidden" onChange={(e) => updateImage(c._id, (e.target as HTMLInputElement).files?.[0])} />
                            <Button variant="outline" size="sm" type="button">
                              <Upload className="w-4 h-4" />
                            </Button>
                          </label>
                        </div>
                        <Button variant="destructive" size="sm" onClick={() => remove(c._id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="w-[95vw] md:w-auto sm:max-w-[95vw] md:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <Label>Address</Label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <div>
                <Label>DOB</Label>
                <Input type="date" value={dateOfBirth} onChange={(e) => setDob(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label>Membership</Label>
                <Select value={membershipLevel} onValueChange={(v) => setMembershipLevel(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="platinum">Platinum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={isVerified} onCheckedChange={(v) => setVerified(Boolean(v))} />
                <span className="text-sm">Verified</span>
              </div>
              <div>
                <Label>Photo</Label>
                <Input type="file" onChange={(e) => setImage(e.target.files?.[0])} />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
              <Button className="bg-health-aqua" onClick={async () => { await create(); setShowCreateDialog(false); }}>Create</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="w-[95vw] md:w-auto sm:max-w-[95vw] md:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label>Name</Label>
                  <Input defaultValue={selected.name} onBlur={(e) => updateField(selected._id, 'name', e.target.value)} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input defaultValue={selected.email || ''} onBlur={(e) => updateField(selected._id, 'email', e.target.value)} />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input defaultValue={selected.phone || ''} onBlur={(e) => updateField(selected._id, 'phone', e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <Label>Address</Label>
                  <Input defaultValue={selected.address || ''} onBlur={(e) => updateField(selected._id, 'address', e.target.value)} />
                </div>
                <div>
                  <Label>DOB</Label>
                  <Input type="date" defaultValue={selected.dateOfBirth ? String(selected.dateOfBirth).substring(0,10) : ''} onBlur={(e) => updateField(selected._id, 'dateOfBirth', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label>Membership</Label>
                  <Select defaultValue={selected.membershipLevel || 'standard'} onValueChange={(v) => updateField(selected._id, 'membershipLevel', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="silver">Silver</SelectItem>
                      <SelectItem value="gold">Gold</SelectItem>
                      <SelectItem value="platinum">Platinum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={Boolean(selected.isVerified)} onCheckedChange={(v) => updateField(selected._id, 'isVerified', Boolean(v))} />
                  <span className="text-sm">Verified</span>
                </div>
                <div>
                  <Label>Photo</Label>
                  <Input type="file" onChange={(e) => setImage(e.target.files?.[0])} />
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea defaultValue={selected.notes || ''} onBlur={(e) => updateField(selected._id, 'notes', e.target.value)} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Customer Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="w-[95vw] md:w-auto sm:max-w-[95vw] md:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Customer Details</span>
              <Button variant="ghost" size="sm" onClick={() => setShowDetailsDialog(false)}>
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          {loadingDetails ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-health-teal mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading customer details...</p>
            </div>
          ) : selectedCustomerDetails ? (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-start gap-4 pb-4 border-b">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-health-light-gray flex items-center justify-center">
                  {selectedCustomerDetails.cloudinaryUrl ? (
                    <img src={selectedCustomerDetails.cloudinaryUrl} alt={selectedCustomerDetails.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-health-blue-gray" />
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-health-charcoal">{selectedCustomerDetails.name}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={`capitalize ${
                      selectedCustomerDetails.customerType === 'vip' ? 'bg-purple-100 text-purple-800' :
                      selectedCustomerDetails.customerType === 'premium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedCustomerDetails.customerType || 'regular'}
                    </Badge>
                    <Badge className={`${
                      selectedCustomerDetails.status === 'active' ? 'bg-green-100 text-green-800' :
                      selectedCustomerDetails.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedCustomerDetails.status || 'active'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-5 h-5" /> Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-health-blue-gray">Email</Label>
                    <p className="text-sm font-medium">{selectedCustomerDetails.email || '—'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-health-blue-gray">Phone</Label>
                    <p className="text-sm font-medium">{selectedCustomerDetails.phone || '—'}</p>
                  </div>
                  {selectedCustomerDetails.alternatePhone && (
                    <div>
                      <Label className="text-xs text-health-blue-gray">Alternate Phone</Label>
                      <p className="text-sm font-medium">{selectedCustomerDetails.alternatePhone}</p>
                    </div>
                  )}
                  {selectedCustomerDetails.dateOfBirth && (
                    <div>
                      <Label className="text-xs text-health-blue-gray">Date of Birth</Label>
                      <p className="text-sm font-medium">{new Date(selectedCustomerDetails.dateOfBirth).toLocaleDateString()}</p>
                    </div>
                  )}
                  {selectedCustomerDetails.gender && (
                    <div>
                      <Label className="text-xs text-health-blue-gray">Gender</Label>
                      <p className="text-sm font-medium capitalize">{selectedCustomerDetails.gender}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Address */}
              {selectedCustomerDetails.address && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="w-5 h-5" /> Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      {selectedCustomerDetails.address.street && `${selectedCustomerDetails.address.street}, `}
                      {selectedCustomerDetails.address.city && `${selectedCustomerDetails.address.city}, `}
                      {selectedCustomerDetails.address.state && `${selectedCustomerDetails.address.state} `}
                      {selectedCustomerDetails.address.pincode && `- ${selectedCustomerDetails.address.pincode}`}
                      {selectedCustomerDetails.address.country && `, ${selectedCustomerDetails.address.country}`}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Order Statistics */}
              {selectedCustomerDetails.orderStats && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Package className="w-5 h-5" /> Order Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-xs text-health-blue-gray">Total Orders</Label>
                      <p className="text-2xl font-bold text-health-charcoal">{selectedCustomerDetails.orderStats.totalOrders || 0}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-health-blue-gray">Total Spent</Label>
                      <p className="text-2xl font-bold text-health-charcoal">₹{(selectedCustomerDetails.orderStats.totalSpent || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-health-blue-gray">Average Order</Label>
                      <p className="text-2xl font-bold text-health-charcoal">₹{(selectedCustomerDetails.orderStats.averageOrderValue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-health-blue-gray">Loyalty Points</Label>
                      <p className="text-2xl font-bold text-health-charcoal">{selectedCustomerDetails.orderStats.loyaltyPoints || 0}</p>
                    </div>
                    {selectedCustomerDetails.orderStats.lastOrderDate && (
                      <div className="md:col-span-4">
                        <Label className="text-xs text-health-blue-gray">Last Order Date</Label>
                        <p className="text-sm font-medium">{new Date(selectedCustomerDetails.orderStats.lastOrderDate).toLocaleDateString()}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Medical Information */}
              {selectedCustomerDetails.medicalInfo && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Heart className="w-5 h-5" /> Medical Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedCustomerDetails.medicalInfo.bloodGroup && (
                      <div>
                        <Label className="text-xs text-health-blue-gray">Blood Group</Label>
                        <p className="text-sm font-medium">{selectedCustomerDetails.medicalInfo.bloodGroup}</p>
                      </div>
                    )}
                    {selectedCustomerDetails.medicalInfo.allergies && selectedCustomerDetails.medicalInfo.allergies.length > 0 && (
                      <div>
                        <Label className="text-xs text-health-blue-gray">Allergies</Label>
                        <div className="space-y-2 mt-1">
                          {selectedCustomerDetails.medicalInfo.allergies.map((allergy, idx) => (
                            <div key={idx} className="p-2 bg-red-50 rounded">
                              <p className="text-sm font-medium">{allergy.allergen}</p>
                              <p className="text-xs text-gray-600">Severity: {allergy.severity}</p>
                              {allergy.notes && <p className="text-xs text-gray-600">{allergy.notes}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedCustomerDetails.medicalInfo.chronicConditions && selectedCustomerDetails.medicalInfo.chronicConditions.length > 0 && (
                      <div>
                        <Label className="text-xs text-health-blue-gray">Chronic Conditions</Label>
                        <div className="space-y-2 mt-1">
                          {selectedCustomerDetails.medicalInfo.chronicConditions.map((condition, idx) => (
                            <div key={idx} className="p-2 bg-yellow-50 rounded">
                              <p className="text-sm font-medium">{condition.condition}</p>
                              {condition.diagnosisDate && <p className="text-xs text-gray-600">Diagnosed: {new Date(condition.diagnosisDate).toLocaleDateString()}</p>}
                              {condition.notes && <p className="text-xs text-gray-600">{condition.notes}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedCustomerDetails.medicalInfo.currentMedications && selectedCustomerDetails.medicalInfo.currentMedications.length > 0 && (
                      <div>
                        <Label className="text-xs text-health-blue-gray">Current Medications</Label>
                        <div className="space-y-2 mt-1">
                          {selectedCustomerDetails.medicalInfo.currentMedications.map((med, idx) => (
                            <div key={idx} className="p-2 bg-blue-50 rounded">
                              <p className="text-sm font-medium">{med.medication}</p>
                              <p className="text-xs text-gray-600">{med.dosage} - {med.frequency}</p>
                              {med.prescribedBy && <p className="text-xs text-gray-600">Prescribed by: {med.prescribedBy}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Insurance Information */}
              {selectedCustomerDetails.insuranceInfo && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="w-5 h-5" /> Insurance Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedCustomerDetails.insuranceInfo.provider && (
                      <div>
                        <Label className="text-xs text-health-blue-gray">Provider</Label>
                        <p className="text-sm font-medium">{selectedCustomerDetails.insuranceInfo.provider}</p>
                      </div>
                    )}
                    {selectedCustomerDetails.insuranceInfo.policyNumber && (
                      <div>
                        <Label className="text-xs text-health-blue-gray">Policy Number</Label>
                        <p className="text-sm font-medium">{selectedCustomerDetails.insuranceInfo.policyNumber}</p>
                      </div>
                    )}
                    {selectedCustomerDetails.insuranceInfo.coverageDetails && (
                      <div className="md:col-span-2">
                        <Label className="text-xs text-health-blue-gray">Coverage Details</Label>
                        <p className="text-sm">{selectedCustomerDetails.insuranceInfo.coverageDetails}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Emergency Contact */}
              {selectedCustomerDetails.emergencyContact && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <PhoneIcon className="w-5 h-5" /> Emergency Contact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-health-blue-gray">Name</Label>
                      <p className="text-sm font-medium">{selectedCustomerDetails.emergencyContact.name || '—'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-health-blue-gray">Relationship</Label>
                      <p className="text-sm font-medium">{selectedCustomerDetails.emergencyContact.relationship || '—'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-health-blue-gray">Phone</Label>
                      <p className="text-sm font-medium">{selectedCustomerDetails.emergencyContact.phone || '—'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-health-blue-gray">Email</Label>
                      <p className="text-sm font-medium">{selectedCustomerDetails.emergencyContact.email || '—'}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Payment Methods */}
              {selectedCustomerDetails.paymentMethods && selectedCustomerDetails.paymentMethods.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CreditCard className="w-5 h-5" /> Payment Methods
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedCustomerDetails.paymentMethods.map((method, idx) => (
                        <div key={idx} className="p-3 border rounded flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium capitalize">{method.type.replace('_', ' ')}</p>
                            {method.provider && <p className="text-xs text-gray-600">{method.provider}</p>}
                            {method.lastFourDigits && <p className="text-xs text-gray-600">****{method.lastFourDigits}</p>}
                          </div>
                          {method.isDefault && <Badge>Default</Badge>}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Documents */}
              {selectedCustomerDetails.documents && selectedCustomerDetails.documents.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="w-5 h-5" /> Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedCustomerDetails.documents.map((doc, idx) => (
                        <div key={doc._id || idx} className="p-3 border rounded">
                          <p className="text-sm font-medium">{doc.name}</p>
                          <p className="text-xs text-gray-600 capitalize">{doc.type.replace('_', ' ')}</p>
                          {doc.uploadedAt && (
                            <p className="text-xs text-gray-600">Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                          )}
                          {doc.cloudinaryUrl && (
                            <a href={doc.cloudinaryUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-1 inline-block">
                              View Document
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notes */}
              {selectedCustomerDetails.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{selectedCustomerDetails.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No customer details available</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Customers;


