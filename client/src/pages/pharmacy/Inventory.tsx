import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Search, Plus, Upload, Edit, Trash2, Package, Filter, SortAsc, SortDesc, AlertTriangle, CheckCircle, Image as ImageIcon, Tag, RefreshCw } from 'lucide-react';
import pharmacyService from '@/services/pharmacyService';
import ProfileCompletionCheck from '@/components/pharmacy/ProfileCompletionCheck';

type Item = {
  _id: string;
  sku: string;
  name: string;
  stock: number;
  threshold: number;
  price: number;
  cloudinaryUrl?: string;
  generic?: string;
  dosage?: string;
  form?: string;
  manufacturer?: string;
  description?: string;
  category?: string;
  prescriptionRequired?: boolean;
  expiryDate?: string;
  storage?: string;
  dosageInstructions?: string;
  deliveryTime?: string;
  genericPrice?: number;
  brandPrice?: number;
  insuranceCovered?: boolean;
  insurancePrice?: number;
  rating?: number;
  reviews?: number;
  indications?: string[];
  mechanism?: string;
  onset?: string;
  halfLife?: string;
  pregnancyCategory?: string;
  lactationSafety?: string;
  alcoholWarning?: string;
  drivingWarning?: string;
  overdose?: string;
  brandNames?: string[];
  sideEffects?: string[];
  interactions?: string[];
  contraindications?: string[];
};

const Inventory: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [stock, setStock] = useState<number>(0);
  const [threshold, setThreshold] = useState<number>(10);
  const [price, setPrice] = useState<number>(0);
  const [image, setImage] = useState<File | undefined>(undefined);
  const [generic, setGeneric] = useState('');
  const [dosage, setDosage] = useState('');
  const [form, setForm] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [prescriptionRequired, setPrescriptionRequired] = useState(false);
  const [expiryDate, setExpiryDate] = useState('');
  const [storage, setStorage] = useState('');
  const [dosageInstructions, setDosageInstructions] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [genericPrice, setGenericPrice] = useState<number | undefined>(undefined);
  const [brandPrice, setBrandPrice] = useState<number | undefined>(undefined);
  const [insuranceCovered, setInsuranceCovered] = useState(false);
  const [insurancePrice, setInsurancePrice] = useState<number | undefined>(undefined);
  const [rating, setRating] = useState<number | undefined>(undefined);
  const [reviews, setReviews] = useState<number | undefined>(undefined);
  const [indications, setIndications] = useState('');
  const [mechanism, setMechanism] = useState('');
  const [onset, setOnset] = useState('');
  const [halfLife, setHalfLife] = useState('');
  const [pregnancyCategory, setPregnancyCategory] = useState('');
  const [lactationSafety, setLactationSafety] = useState('');
  const [alcoholWarning, setAlcoholWarning] = useState('');
  const [drivingWarning, setDrivingWarning] = useState('');
  const [overdose, setOverdose] = useState('');
  const [brandNames, setBrandNames] = useState('');
  const [sideEffects, setSideEffects] = useState('');
  const [interactions, setInteractions] = useState('');
  const [contraindications, setContraindications] = useState('');

  // UI state - dialogs
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [formFilter, setFormFilter] = useState('all');
  const [rxFilter, setRxFilter] = useState<'all' | 'rx' | 'otc'>('all');
  const [stockStatus, setStockStatus] = useState<'all' | 'low' | 'in' | 'out'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'name-asc' | 'stock-asc' | 'stock-desc' | 'price-asc' | 'price-desc'>('recent');

  const load = async () => {
    setLoading(true);
    try {
      const data = await pharmacyService.listInventory();
      setItems(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    setCreating(true);
    try {
      await pharmacyService.createInventoryItem({
        sku,
        name,
        stock,
        threshold,
        price,
        generic,
        dosage,
        form,
        manufacturer,
        description,
        category,
        prescriptionRequired,
        expiryDate,
        storage,
        dosageInstructions,
        deliveryTime,
        genericPrice,
        brandPrice,
        insuranceCovered,
        insurancePrice,
        rating,
        reviews,
        indications,
        mechanism,
        onset,
        halfLife,
        pregnancyCategory,
        lactationSafety,
        alcoholWarning,
        drivingWarning,
        overdose,
        brandNames,
        sideEffects,
        interactions,
        contraindications,
      }, image);
      setSku(''); setName(''); setStock(0); setThreshold(10); setPrice(0); setImage(undefined);
      setGeneric(''); setDosage(''); setForm(''); setManufacturer(''); setDescription(''); setCategory('');
      setPrescriptionRequired(false); setExpiryDate(''); setStorage(''); setDosageInstructions(''); setDeliveryTime('');
      setGenericPrice(undefined); setBrandPrice(undefined); setInsuranceCovered(false); setInsurancePrice(undefined);
      setRating(undefined); setReviews(undefined);
      setIndications(''); setMechanism(''); setOnset(''); setHalfLife(''); setPregnancyCategory(''); setLactationSafety(''); setAlcoholWarning(''); setDrivingWarning(''); setOverdose(''); setBrandNames(''); setSideEffects(''); setInteractions(''); setContraindications('');
      await load();
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (it: Item) => {
    setSelectedItem(it);
    setSku(it.sku || '');
    setName(it.name || '');
    setGeneric(it.generic || '');
    setDosage(it.dosage || '');
    setForm(it.form || '');
    setManufacturer(it.manufacturer || '');
    setDescription(it.description || '');
    setCategory(it.category || '');
    setPrescriptionRequired(Boolean(it.prescriptionRequired));
    setExpiryDate(it.expiryDate || '');
    setStorage(it.storage || '');
    setDosageInstructions(it.dosageInstructions || '');
    setDeliveryTime(it.deliveryTime || '');
    setGenericPrice(it.genericPrice);
    setBrandPrice(it.brandPrice);
    setInsuranceCovered(Boolean(it.insuranceCovered));
    setInsurancePrice(it.insurancePrice);
    setStock(it.stock);
    setThreshold(it.threshold);
    setPrice(it.price);
    setRating(it.rating);
    setReviews(it.reviews);
    setIndications((it.indications || []).join(', '));
    setMechanism(it.mechanism || '');
    setOnset(it.onset || '');
    setHalfLife(it.halfLife || '');
    setPregnancyCategory(it.pregnancyCategory || '');
    setLactationSafety(it.lactationSafety || '');
    setAlcoholWarning(it.alcoholWarning || '');
    setDrivingWarning(it.drivingWarning || '');
    setOverdose(it.overdose || '');
    setBrandNames((it.brandNames || []).join(', '));
    setSideEffects((it.sideEffects || []).join(', '));
    setInteractions((it.interactions || []).join(', '));
    setContraindications((it.contraindications || []).join(', '));
    setImage(undefined);
    setImagePreview(undefined);
    setShowEditDialog(true);
  };

  const saveEdit = async () => {
    if (!selectedItem) return;
    await pharmacyService.updateInventoryItem(selectedItem._id, {
      name,
      stock,
      threshold,
      price,
      generic,
      dosage,
      form,
      manufacturer,
      description,
      category,
      prescriptionRequired,
      expiryDate,
      storage,
      dosageInstructions,
      deliveryTime,
      genericPrice,
      brandPrice,
      insuranceCovered,
      insurancePrice,
      rating,
      reviews,
      indications,
      mechanism,
      onset,
      halfLife,
      pregnancyCategory,
      lactationSafety,
      alcoholWarning,
      drivingWarning,
      overdose,
      brandNames,
      sideEffects,
      interactions,
      contraindications,
    }, image);
    setShowEditDialog(false);
    await load();
  };

  const updateField = async (id: string, field: keyof Item, value: string) => {
    const payload: any = {};
    payload[field] = field === 'stock' || field === 'threshold' || field === 'price' ? Number(value) : value;
    await pharmacyService.updateInventoryItem(id, payload);
    await load();
  };

  const updateImage = async (id: string, file?: File) => {
    if (!file) return;
    await pharmacyService.updateInventoryItem(id, {}, file);
    await load();
  };

  const remove = async (id: string) => {
    await pharmacyService.deleteInventoryItem(id);
    await load();
  };

  // Derived options and filtered list
  const categoryOptions = ['all', ...Array.from(new Set((Array.isArray(items) ? items : []).map(i => i.category).filter(Boolean))) as string[]];
  const formOptions = ['all', ...Array.from(new Set((Array.isArray(items) ? items : []).map(i => i.form).filter(Boolean))) as string[]];

  const filteredItems = (Array.isArray(items) ? items : [])
    .filter((it) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q || `${it.name} ${it.generic} ${it.sku} ${it.manufacturer}`.toLowerCase().includes(q);
      const matchesCategory = categoryFilter === 'all' ? true : (it.category || '') === categoryFilter;
      const matchesForm = formFilter === 'all' ? true : (it.form || '') === formFilter;
      const matchesRx = rxFilter === 'all' ? true : rxFilter === 'rx' ? Boolean(it.prescriptionRequired) : !it.prescriptionRequired;
      const currentStockStatus = it.stock <= 0 ? 'out' : it.stock <= it.threshold ? 'low' : 'in';
      const matchesStock = stockStatus === 'all' ? true : stockStatus === currentStockStatus;
      return matchesSearch && matchesCategory && matchesForm && matchesRx && matchesStock;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'stock-asc':
          return a.stock - b.stock;
        case 'stock-desc':
          return b.stock - a.stock;
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-4 bg-health-light-gray min-h-screen px-2 md:px-6 py-4 w-full">
      {/* Profile Completion Check */}
      <ProfileCompletionCheck />
      
      {/* Header */}
      <div className="bg-health-teal rounded-lg p-6 mb-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2"><Package className="w-7 h-7" /> Pharmacy Inventory</h1>
            <p className="text-white/80 mt-2">Manage medicines, stock levels, pricing and visibility across services</p>
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
            <Button
              className="bg-white text-health-teal hover:bg-white/90"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Medicine
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
                <Input placeholder="Search by name, SKU, manufacturer..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((c) => (
                  <SelectItem key={c} value={c}>{c === 'all' ? 'All Categories' : c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={formFilter} onValueChange={setFormFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Form" />
              </SelectTrigger>
              <SelectContent>
                {formOptions.map((f) => (
                  <SelectItem key={f} value={f}>{f === 'all' ? 'All Forms' : f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={rxFilter} onValueChange={(v) => setRxFilter(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="rx">Rx Required</SelectItem>
                <SelectItem value="otc">OTC</SelectItem>
              </SelectContent>
            </Select>
            <Select value={stockStatus} onValueChange={(v) => setStockStatus(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock</SelectItem>
                <SelectItem value="in">In Stock</SelectItem>
                <SelectItem value="low">Low Stock</SelectItem>
                <SelectItem value="out">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recently Added</SelectItem>
                <SelectItem value="name-asc">Name A→Z</SelectItem>
                <SelectItem value="stock-asc">Stock ↑</SelectItem>
                <SelectItem value="stock-desc">Stock ↓</SelectItem>
                <SelectItem value="price-asc">Price ↑</SelectItem>
                <SelectItem value="price-desc">Price ↓</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-health-charcoal">Inventory Items</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No items found. Adjust filters or add a new medicine.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Rx</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((it) => {
                  const isLow = it.stock <= it.threshold && it.stock > 0;
                  const isOut = it.stock <= 0;
                  const percentage = Math.max(0, Math.min(100, Math.round((it.stock / Math.max(1, it.threshold)) * 100)));
                  return (
                    <TableRow key={it._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {it.cloudinaryUrl ? (
                            <img src={it.cloudinaryUrl} alt={it.name} className="w-10 h-10 rounded object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded bg-health-light-gray flex items-center justify-center">
                              <ImageIcon className="w-5 h-5 text-health-blue-gray" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-health-charcoal">{it.name}</div>
                            <div className="text-xs text-health-blue-gray">{it.generic || '—'} {it.dosage ? `• ${it.dosage}` : ''} {it.form ? `• ${it.form}` : ''}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-health-blue-gray">{it.sku}</TableCell>
                      <TableCell className="text-sm">
                        {it.category ? <Badge variant="outline" className="capitalize"><Tag className="w-3 h-3 mr-1" />{it.category}</Badge> : '—'}
                      </TableCell>
                      <TableCell>₹{it.price.toFixed(2)}</TableCell>
                      <TableCell className="w-64">
                        <div className="flex items-center gap-2">
                          {isOut ? (
                            <Badge className="bg-red-100 text-red-800">Out</Badge>
                          ) : isLow ? (
                            <Badge className="bg-yellow-100 text-yellow-800">Low</Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-800">In</Badge>
                          )}
                          <span className="text-sm text-health-charcoal">{it.stock}</span>
                        </div>
                        <Progress value={percentage} className="mt-2" />
                      </TableCell>
                      <TableCell>
                        {it.prescriptionRequired ? (
                          <div className="flex items-center text-health-charcoal"><AlertTriangle className="w-4 h-4 mr-1 text-amber-600" /> Rx</div>
                        ) : (
                          <div className="flex items-center text-health-charcoal"><CheckCircle className="w-4 h-4 mr-1 text-emerald-600" /> OTC</div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEdit(it)}>
                            <Edit className="w-4 h-4 mr-2" /> Edit
                          </Button>
                          <div>
                            <label className="inline-flex">
                              <input type="file" className="hidden" onChange={(e) => updateImage(it._id, (e.target as HTMLInputElement).files?.[0])} />
                              <Button variant="outline" size="sm" type="button">
                                <Upload className="w-4 h-4 mr-2" /> Image
                              </Button>
                            </label>
                          </div>
                          <Button variant="destructive" size="sm" onClick={() => remove(it._id)}>
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="w-[95vw] md:w-auto sm:max-w-[95vw] md:max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Medicine</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label>SKU</Label>
                <Input placeholder="SKU" value={sku} onChange={(e) => setSku(e.target.value)} />
              </div>
              <div>
                <Label>Name</Label>
                <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label>Generic</Label>
                <Input placeholder="Generic" value={generic} onChange={(e) => setGeneric(e.target.value)} />
              </div>
              <div>
                <Label>Dosage</Label>
                <Input placeholder="e.g., 500mg" value={dosage} onChange={(e) => setDosage(e.target.value)} />
              </div>
              <div>
                <Label>Form</Label>
                <Input placeholder="e.g., Tablet" value={form} onChange={(e) => setForm(e.target.value)} />
              </div>
              <div>
                <Label>Manufacturer</Label>
                <Input placeholder="Manufacturer" value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} />
              </div>
              <div>
                <Label>Category</Label>
                <Input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
              </div>
              <div>
                <Label>Expiry Date</Label>
                <Input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
              </div>
              <div>
                <Label>Rx Required</Label>
                <div className="h-10 px-3 border rounded-md flex items-center gap-2">
                  <Switch checked={prescriptionRequired} onCheckedChange={(v) => setPrescriptionRequired(Boolean(v))} />
                  <span className="text-sm">Prescription</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <Label>Stock</Label>
                <Input type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} />
              </div>
              <div>
                <Label>Threshold</Label>
                <Input type="number" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} />
              </div>
              <div>
                <Label>Base Price</Label>
                <Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
              </div>
              <div>
                <Label>Delivery Time</Label>
                <Input placeholder="e.g., 2-3 hours" value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)} />
              </div>
              <div>
                <Label>Generic Price</Label>
                <Input type="number" value={genericPrice ?? ''} onChange={(e) => setGenericPrice(e.target.value ? Number(e.target.value) : undefined)} />
              </div>
              <div>
                <Label>Brand Price</Label>
                <Input type="number" value={brandPrice ?? ''} onChange={(e) => setBrandPrice(e.target.value ? Number(e.target.value) : undefined)} />
              </div>
              <div>
                <Label>Insurance</Label>
                <div className="h-10 px-3 border rounded-md flex items-center gap-2">
                  <Switch checked={insuranceCovered} onCheckedChange={(v) => setInsuranceCovered(Boolean(v))} />
                  <span className="text-sm">Covered</span>
                </div>
              </div>
              <div>
                <Label>Insurance Price</Label>
                <Input type="number" value={insurancePrice ?? ''} onChange={(e) => setInsurancePrice(e.target.value ? Number(e.target.value) : undefined)} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Storage</Label>
                <Input value={storage} onChange={(e) => setStorage(e.target.value)} />
              </div>
              <div>
                <Label>Dosage Instructions</Label>
                <Input value={dosageInstructions} onChange={(e) => setDosageInstructions(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Indications (comma separated)</Label>
                <Textarea value={indications} onChange={(e) => setIndications(e.target.value)} />
              </div>
              <div>
                <Label>Mechanism</Label>
                <Textarea value={mechanism} onChange={(e) => setMechanism(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <Label>Onset</Label>
                <Input value={onset} onChange={(e) => setOnset(e.target.value)} />
              </div>
              <div>
                <Label>Half-life</Label>
                <Input value={halfLife} onChange={(e) => setHalfLife(e.target.value)} />
              </div>
              <div>
                <Label>Pregnancy Category</Label>
                <Input value={pregnancyCategory} onChange={(e) => setPregnancyCategory(e.target.value)} />
              </div>
              <div>
                <Label>Lactation Safety</Label>
                <Input value={lactationSafety} onChange={(e) => setLactationSafety(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label>Alcohol Warning</Label>
                <Input value={alcoholWarning} onChange={(e) => setAlcoholWarning(e.target.value)} />
              </div>
              <div>
                <Label>Driving Warning</Label>
                <Input value={drivingWarning} onChange={(e) => setDrivingWarning(e.target.value)} />
              </div>
              <div>
                <Label>Overdose</Label>
                <Input value={overdose} onChange={(e) => setOverdose(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label>Brand Names (comma separated)</Label>
                <Textarea value={brandNames} onChange={(e) => setBrandNames(e.target.value)} />
              </div>
              <div>
                <Label>Side Effects (comma separated)</Label>
                <Textarea value={sideEffects} onChange={(e) => setSideEffects(e.target.value)} />
              </div>
              <div>
                <Label>Interactions (comma separated)</Label>
                <Textarea value={interactions} onChange={(e) => setInteractions(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Contraindications (comma separated)</Label>
              <Textarea value={contraindications} onChange={(e) => setContraindications(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Indications (comma separated)</Label>
                <Textarea value={indications} onChange={(e) => setIndications(e.target.value)} />
              </div>
              <div>
                <Label>Mechanism</Label>
                <Textarea value={mechanism} onChange={(e) => setMechanism(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <Label>Onset</Label>
                <Input value={onset} onChange={(e) => setOnset(e.target.value)} />
              </div>
              <div>
                <Label>Half-life</Label>
                <Input value={halfLife} onChange={(e) => setHalfLife(e.target.value)} />
              </div>
              <div>
                <Label>Pregnancy Category</Label>
                <Input value={pregnancyCategory} onChange={(e) => setPregnancyCategory(e.target.value)} />
              </div>
              <div>
                <Label>Lactation Safety</Label>
                <Input value={lactationSafety} onChange={(e) => setLactationSafety(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label>Alcohol Warning</Label>
                <Input value={alcoholWarning} onChange={(e) => setAlcoholWarning(e.target.value)} />
              </div>
              <div>
                <Label>Driving Warning</Label>
                <Input value={drivingWarning} onChange={(e) => setDrivingWarning(e.target.value)} />
              </div>
              <div>
                <Label>Overdose</Label>
                <Input value={overdose} onChange={(e) => setOverdose(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label>Brand Names (comma separated)</Label>
                <Textarea value={brandNames} onChange={(e) => setBrandNames(e.target.value)} />
              </div>
              <div>
                <Label>Side Effects (comma separated)</Label>
                <Textarea value={sideEffects} onChange={(e) => setSideEffects(e.target.value)} />
              </div>
              <div>
                <Label>Interactions (comma separated)</Label>
                <Textarea value={interactions} onChange={(e) => setInteractions(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Contraindications (comma separated)</Label>
              <Textarea value={contraindications} onChange={(e) => setContraindications(e.target.value)} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Rating</Label>
                <Input type="number" value={rating ?? ''} onChange={(e) => setRating(e.target.value ? Number(e.target.value) : undefined)} />
              </div>
              <div>
                <Label>Reviews</Label>
                <Input type="number" value={reviews ?? ''} onChange={(e) => setReviews(e.target.value ? Number(e.target.value) : undefined)} />
              </div>
            </div>
            <div>
              <Label>Image</Label>
              <div className="flex items-center gap-3">
                <Input type="file" onChange={(e) => {
                  const f = e.target.files?.[0];
                  setImage(f);
                  if (f) {
                    const url = URL.createObjectURL(f);
                    setImagePreview(url);
                  } else {
                    setImagePreview(undefined);
                  }
                }} />
                {imagePreview && <img src={imagePreview} alt="preview" className="w-12 h-12 rounded object-cover" />}
              </div>
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
        <DialogContent className="w-[95vw] md:w-auto sm:max-w-[95vw] md:max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Medicine</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label>SKU</Label>
                <Input value={sku} onChange={(e) => setSku(e.target.value)} />
              </div>
              <div>
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label>Generic</Label>
                <Input value={generic} onChange={(e) => setGeneric(e.target.value)} />
              </div>
              <div>
                <Label>Dosage</Label>
                <Input value={dosage} onChange={(e) => setDosage(e.target.value)} />
              </div>
              <div>
                <Label>Form</Label>
                <Input value={form} onChange={(e) => setForm(e.target.value)} />
              </div>
              <div>
                <Label>Manufacturer</Label>
                <Input value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} />
              </div>
              <div>
                <Label>Category</Label>
                <Input value={category} onChange={(e) => setCategory(e.target.value)} />
              </div>
              <div>
                <Label>Expiry Date</Label>
                <Input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
              </div>
              <div>
                <Label>Rx Required</Label>
                <div className="h-10 px-3 border rounded-md flex items-center gap-2">
                  <Switch checked={prescriptionRequired} onCheckedChange={(v) => setPrescriptionRequired(Boolean(v))} />
                  <span className="text-sm">Prescription</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <Label>Stock</Label>
                <Input type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} />
              </div>
              <div>
                <Label>Threshold</Label>
                <Input type="number" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} />
              </div>
              <div>
                <Label>Base Price</Label>
                <Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
              </div>
              <div>
                <Label>Delivery Time</Label>
                <Input value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)} />
              </div>
              <div>
                <Label>Generic Price</Label>
                <Input type="number" value={genericPrice ?? ''} onChange={(e) => setGenericPrice(e.target.value ? Number(e.target.value) : undefined)} />
              </div>
              <div>
                <Label>Brand Price</Label>
                <Input type="number" value={brandPrice ?? ''} onChange={(e) => setBrandPrice(e.target.value ? Number(e.target.value) : undefined)} />
              </div>
              <div>
                <Label>Insurance</Label>
                <div className="h-10 px-3 border rounded-md flex items-center gap-2">
                  <Switch checked={insuranceCovered} onCheckedChange={(v) => setInsuranceCovered(Boolean(v))} />
                  <span className="text-sm">Covered</span>
                </div>
              </div>
              <div>
                <Label>Insurance Price</Label>
                <Input type="number" value={insurancePrice ?? ''} onChange={(e) => setInsurancePrice(e.target.value ? Number(e.target.value) : undefined)} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Storage</Label>
                <Input value={storage} onChange={(e) => setStorage(e.target.value)} />
              </div>
              <div>
                <Label>Dosage Instructions</Label>
                <Input value={dosageInstructions} onChange={(e) => setDosageInstructions(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
              <Label>Update Image</Label>
              <Input type="file" onChange={(e) => setImage(e.target.files?.[0])} />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
              <Button className="bg-health-aqua" onClick={saveEdit}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inventory;


