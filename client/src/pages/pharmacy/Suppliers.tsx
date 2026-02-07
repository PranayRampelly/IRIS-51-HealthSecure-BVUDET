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
import { Search, Plus, Upload, Edit, Trash2, Package, RefreshCw, Image as ImageIcon, Tag, Phone, Mail, MapPin, Star } from 'lucide-react';
import pharmacyService from '@/services/pharmacyService';

type Supplier = {
  _id: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  deliveryAreas?: string[];
  minOrderQuantity?: number;
  leadTimeDays?: number;
  rating?: number;
  terms?: string;
  notes?: string;
  isPreferred?: boolean;
  logo?: {
    cloudinaryUrl?: string;
    cloudinaryId?: string;
  };
};

const Suppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // form state
  const [name, setName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryAreas, setDeliveryAreas] = useState('');
  const [minOrderQuantity, setMOQ] = useState<number>(0);
  const [leadTimeDays, setLeadTime] = useState<number>(0);
  const [rating, setRating] = useState<number>(0);
  const [terms, setTerms] = useState('');
  const [notes, setNotes] = useState('');
  const [isPreferred, setPreferred] = useState(false);
  const [image, setImage] = useState<File | undefined>(undefined);

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [preferredFilter, setPreferredFilter] = useState<'all' | 'preferred' | 'others'>('all');
  const [minRating, setMinRating] = useState<'all' | '3' | '4' | '5'>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selected, setSelected] = useState<Supplier | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await pharmacyService.listSuppliers();
      setSuppliers(data);
    } catch (error: any) {
      console.error('Failed to load suppliers:', error);
      if (error.response?.status === 401) {
        alert('Please log in as a pharmacy user to access suppliers.');
      } else if (error.response?.status === 500) {
        alert('Server error. Please check if you are logged in as a pharmacy user.');
      } else {
        alert('Failed to load suppliers. Please try again.');
      }
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    setCreating(true);
    try {
      await pharmacyService.createSupplier({
        name,
        contactName,
        email,
        phone,
        address,
        deliveryAreas: deliveryAreas.split(',').map(s => s.trim()).filter(Boolean),
        minOrderQuantity,
        leadTimeDays,
        rating,
        terms,
        notes,
        isPreferred,
      }, image);
      setName(''); setContactName(''); setEmail(''); setPhone(''); setAddress('');
      setDeliveryAreas(''); setMOQ(0); setLeadTime(0); setRating(0); setTerms(''); setNotes(''); setPreferred(false); setImage(undefined);
      await load();
    } finally {
      setCreating(false);
    }
  };

  const updateField = async (id: string, field: keyof Supplier, value: any) => {
    const payload: any = {};
    payload[field] = value;
    await pharmacyService.updateSupplier(id, payload);
    await load();
  };

  const updateImage = async (id: string, file?: File) => {
    if (!file) return;
    setUploadingLogo(id);
    try {
      await pharmacyService.uploadSupplierLogo(id, file);
      await load();
      alert('Logo uploaded successfully!');
    } catch (error: any) {
      console.error('Failed to upload logo:', error);
      if (error.response?.status === 401) {
        alert('Please log in as a pharmacy user to upload logos.');
      } else if (error.response?.status === 500) {
        alert('Server error. Please check if you are logged in as a pharmacy user.');
      } else {
        alert('Failed to upload logo. Please try again.');
      }
    } finally {
      setUploadingLogo(null);
    }
  };

  const remove = async (id: string) => {
    await pharmacyService.deleteSupplier(id);
    await load();
  };

  // derived filtered list
  const filtered = suppliers.filter((s) => {
    const q = searchQuery.trim().toLowerCase();
    const matches = !q || `${s.name} ${s.contactName} ${s.email} ${s.phone}`.toLowerCase().includes(q);
    const pref = preferredFilter === 'all' ? true : preferredFilter === 'preferred' ? Boolean(s.isPreferred) : !s.isPreferred;
    const ratingOk = minRating === 'all' ? true : (s.rating || 0) >= Number(minRating);
    return matches && pref && ratingOk;
  });

  return (
    <div className="space-y-4 bg-health-light-gray min-h-screen px-2 md:px-6 py-4 w-full">
      {/* Header */}
      <div className="bg-health-teal rounded-lg p-6 mb-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2"><Package className="w-7 h-7" /> Suppliers</h1>
            <p className="text-white/80 mt-2">Manage vendor details, contracts and service terms</p>
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
              <Plus className="w-4 h-4 mr-2" /> Add Supplier
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
                <Input placeholder="Search by name, contact, phone or email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
            </div>
            <Select value={preferredFilter} onValueChange={(v) => setPreferredFilter(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vendors</SelectItem>
                <SelectItem value="preferred">Preferred Only</SelectItem>
                <SelectItem value="others">Others</SelectItem>
              </SelectContent>
            </Select>
            <Select value={minRating} onValueChange={(v) => setMinRating(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Rating</SelectItem>
                <SelectItem value="3">3+ Stars</SelectItem>
                <SelectItem value="4">4+ Stars</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-health-charcoal">Supplier Directory</CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No suppliers found. Adjust filters or add a new supplier.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>MOQ</TableHead>
                  <TableHead>Lead Time</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Preferred</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => (
                  <TableRow key={s._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {s.logo?.cloudinaryUrl ? (
                          <img src={s.logo.cloudinaryUrl} alt={s.name} className="w-10 h-10 rounded object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded bg-health-light-gray flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-health-blue-gray" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-health-charcoal">{s.name}</div>
                          <div className="text-xs text-health-blue-gray flex items-center gap-2"><MapPin className="w-3 h-3" /> {s.address || '—'}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-health-charcoal flex items-center gap-3">
                        <span className="flex items-center gap-1"><Phone className="w-4 h-4 text-health-blue-gray" /> {s.phone || '—'}</span>
                        <span className="flex items-center gap-1"><Mail className="w-4 h-4 text-health-blue-gray" /> {s.email || '—'}</span>
                      </div>
                    </TableCell>
                    <TableCell>{s.minOrderQuantity ?? '—'}</TableCell>
                    <TableCell>{s.leadTimeDays ? `${s.leadTimeDays} days` : '—'}</TableCell>
                    <TableCell>
                      {s.rating ? (
                        <div className="flex items-center gap-1 text-health-charcoal">
                          <Star className="w-4 h-4 text-amber-500" /> {s.rating}
                        </div>
                      ) : '—'}
                    </TableCell>
                    <TableCell>{s.isPreferred ? <Badge className="bg-green-100 text-green-800">Preferred</Badge> : <Badge variant="outline">No</Badge>}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => { setSelected(s); setShowEditDialog(true); }}>
                          <Edit className="w-4 h-4 mr-2" /> Edit
                        </Button>
                        <div>
                          <label className="inline-flex">
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              onChange={(e) => updateImage(s._id, (e.target as HTMLInputElement).files?.[0])} 
                            />
                            <Button 
                              variant="outline" 
                              size="sm" 
                              type="button"
                              disabled={uploadingLogo === s._id}
                              className="cursor-pointer hover:bg-gray-50 transition-colors"
                            >
                              {uploadingLogo === s._id ? (
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Upload className="w-4 h-4 mr-2" />
                              )}
                              {uploadingLogo === s._id ? 'Uploading...' : 'Logo'}
                            </Button>
                          </label>
                        </div>
                        <Button variant="destructive" size="sm" onClick={() => remove(s._id)}>
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
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
        <DialogContent className="w-[95vw] md:w-auto sm:max-w-[95vw] md:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Supplier</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label>Contact Name</Label>
                <Input value={contactName} onChange={(e) => setContactName(e.target.value)} />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <Label>MOQ</Label>
                <Input type="number" value={minOrderQuantity} onChange={(e) => setMOQ(Number(e.target.value))} />
              </div>
              <div>
                <Label>Lead Time (days)</Label>
                <Input type="number" value={leadTimeDays} onChange={(e) => setLeadTime(Number(e.target.value))} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Address</Label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <div>
                <Label>Delivery Areas</Label>
                <Input placeholder="comma separated" value={deliveryAreas} onChange={(e) => setDeliveryAreas(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Terms</Label>
                <Textarea value={terms} onChange={(e) => setTerms(e.target.value)} />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 px-3 border rounded-md flex items-center gap-2">
                <Switch checked={isPreferred} onCheckedChange={(v) => setPreferred(Boolean(v))} />
                <span className="text-sm">Preferred Vendor</span>
              </div>
              <div>
                <Label>Rating</Label>
                <Input type="number" value={rating} onChange={(e) => setRating(Number(e.target.value))} />
              </div>
            </div>
            <div>
              <Label>Logo</Label>
              <Input type="file" onChange={(e) => setImage(e.target.files?.[0])} />
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
        <DialogContent className="w-[95vw] md:w-auto sm:max-w-[95vw] md:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label>Name</Label>
                  <Input defaultValue={selected.name} onBlur={(e) => updateField(selected._id, 'name', e.target.value)} />
                </div>
                <div>
                  <Label>Contact</Label>
                  <Input defaultValue={selected.contactName || ''} onBlur={(e) => updateField(selected._id, 'contactName', e.target.value)} />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input defaultValue={selected.phone || ''} onBlur={(e) => updateField(selected._id, 'phone', e.target.value)} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input defaultValue={selected.email || ''} onBlur={(e) => updateField(selected._id, 'email', e.target.value)} />
                </div>
                <div>
                  <Label>MOQ</Label>
                  <Input type="number" defaultValue={selected.minOrderQuantity || 0} onBlur={(e) => updateField(selected._id, 'minOrderQuantity', Number(e.target.value))} />
                </div>
                <div>
                  <Label>Lead Time</Label>
                  <Input type="number" defaultValue={selected.leadTimeDays || 0} onBlur={(e) => updateField(selected._id, 'leadTimeDays', Number(e.target.value))} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>Address</Label>
                  <Input defaultValue={selected.address || ''} onBlur={(e) => updateField(selected._id, 'address', e.target.value)} />
                </div>
                <div>
                  <Label>Delivery Areas</Label>
                  <Input defaultValue={(selected.deliveryAreas || []).join(', ')} onBlur={(e) => updateField(selected._id, 'deliveryAreas', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>Terms</Label>
                  <Textarea defaultValue={selected.terms || ''} onBlur={(e) => updateField(selected._id, 'terms', e.target.value)} />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea defaultValue={selected.notes || ''} onBlur={(e) => updateField(selected._id, 'notes', e.target.value)} />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 px-3 border rounded-md flex items-center gap-2">
                  <Switch checked={Boolean(selected.isPreferred)} onCheckedChange={(v) => updateField(selected._id, 'isPreferred', Boolean(v))} />
                  <span className="text-sm">Preferred Vendor</span>
                </div>
                <div>
                  <Label>Rating</Label>
                  <Input type="number" defaultValue={selected.rating || 0} onBlur={(e) => updateField(selected._id, 'rating', Number(e.target.value))} />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Suppliers;


