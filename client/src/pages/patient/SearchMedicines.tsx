import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Pill, Search, Filter, Star, DollarSign, Truck, ShoppingCart,
  Heart, Share2, Info, Clock, Package, MapPin, Phone, MessageSquare,
  ChevronDown, ChevronUp, ChevronRight, AlertTriangle, CheckCircle, XCircle
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

import patientPharmacyService from '@/services/patientPharmacyService';
import patientCartService from '@/services/patientCartService';
import { useToast } from '@/hooks/use-toast';

interface Medicine {
  id: string;
  _id?: string; // Keep original MongoDB _id for API calls
  name: string;
  generic: string;
  dosage: string;
  form: string;
  manufacturer: string;
  description: string;
  sideEffects: string[];
  interactions: string[];
  contraindications: string[];
  price: {
    generic: number;
    brand: number;
    savings: number;
    insuranceCovered: boolean;
    insurancePrice?: number;
  };
  availability: {
    inStock: boolean;
    quantity: number;
    deliveryTime: string;
    pharmacies: Array<{
      id: string;
      name: string;
      distance: string;
      rating: number;
      price: number;
    }>;
  };
  rating: number;
  reviews: number;
  isFavorite: boolean;
  category: string;
  prescriptionRequired: boolean;
  expiryDate: string;
  storage: string;
  dosageInstructions: string;
  // Optional extended clinical/label fields for deeper details
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
  cloudinaryUrl?: string;
  pharmacy?: string;
}

const SearchMedicines = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [showMedicineDialog, setShowMedicineDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [timeRange, setTimeRange] = useState<'30' | '90' | '365' | 'all'>('90');
  const [compare, setCompare] = useState<string[]>([]);
  const [orderQty, setOrderQty] = useState<number>(1);
  const [packSize, setPackSize] = useState<number>(10);
  const [isCartOpen, setIsCartOpen] = useState(false);
  type CartVariant = 'generic' | 'brand';
  interface CartItem {
    key: string;
    medicine: Medicine;
    variant: CartVariant;
    unitPrice: number;
    quantity: number;
    packSize: number;
    pharmacy?: string;
    insuranceApplied?: boolean;
  }
  const [cart, setCart] = useState<CartItem[]>([]);
  const [deliveryOption, setDeliveryOption] = useState<'sameDay' | 'standard' | 'pickup'>('sameDay');
  const [deliverySlot, setDeliverySlot] = useState('Today, 4-6 PM');
  const [address, setAddress] = useState<'home' | 'work' | 'new'>('home');
  const [coupon, setCoupon] = useState('');
  const [instructions, setInstructions] = useState('');

  const formatINR = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n || 0);

  const addToCart = async (medicine: Medicine, options?: { variant?: CartVariant; qty?: number; pack?: number; pharmacy?: string; insurance?: boolean }) => {
    try {
      const variant: CartVariant = options?.variant || 'generic';
      const qty = options?.qty ?? 1;
      const pack = options?.pack ?? 10;
      // Prefer explicit selection, then backend-provided pharmacy owner on the item
      const chosenPharmacy = options?.pharmacy
        || (medicine as any).pharmacy
        || medicine.availability.pharmacies[0]?.id;
      if (!chosenPharmacy) {
        throw new Error('No pharmacy selected or available for this medicine');
      }

      console.log('Adding to cart with pharmacy ID:', chosenPharmacy);

      await patientCartService.addToCart({
        medicineId: medicine.id,
        variant,
        quantity: qty,
        packSize: pack,
        pharmacy: chosenPharmacy,
        insuranceApplied: options?.insurance || false,
      });

      // Show success message and navigate to cart
      toast({
        title: "Success",
        description: `${medicine.name} added to cart`,
      });
      navigate('/patient/pharmacy/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    }
  };

  const updateCartItem = (key: string, updates: Partial<CartItem>) => {
    setCart(prev => prev.map(ci => ci.key === key ? { ...ci, ...updates } : ci));
  };
  const removeCartItem = (key: string) => setCart(prev => prev.filter(ci => ci.key !== key));
  const cartSubtotal = cart.reduce((sum, it) => sum + it.unitPrice * it.packSize * it.quantity, 0);
  const deliveryFee = deliveryOption === 'sameDay' ? 49 : deliveryOption === 'standard' ? 0 : 0;
  const discount = coupon.trim().toUpperCase() === 'SAVE10' ? cartSubtotal * 0.10 : 0;
  const tax = (cartSubtotal - discount) * 0.05;
  const grandTotal = cartSubtotal - discount + tax + deliveryFee;

  const navigate = useNavigate();

  // Load data from backend inventory
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const items = await patientPharmacyService.searchMedicines();
        console.log('🔍 Raw API response:', items);
        console.log('🔍 Is array?', Array.isArray(items));
        console.log('🔍 Items length:', Array.isArray(items) ? items.length : 'Not an array');
        const mapped: Medicine[] = (Array.isArray(items) ? items : []).map((it: any) => {
          const genericPrice = Number(it.genericPrice ?? it.price ?? 0);
          const brandPrice = Number(it.brandPrice ?? it.price ?? genericPrice);
          return {
            id: String(it._id),
            _id: it._id, // Preserve original MongoDB _id
            name: it.name || 'Medicine',
            generic: it.generic || it.name || '',
            dosage: it.dosage || '',
            form: it.form || '',
            manufacturer: it.manufacturer || '',
            description: it.description || '',
            sideEffects: Array.isArray(it.sideEffects) ? it.sideEffects : [],
            interactions: Array.isArray(it.interactions) ? it.interactions : [],
            contraindications: Array.isArray(it.contraindications) ? it.contraindications : [],
            price: {
              generic: genericPrice,
              brand: brandPrice,
              savings: Math.max(0, brandPrice - genericPrice),
              insuranceCovered: !!it.insuranceCovered,
              insurancePrice: it.insurancePrice ? Number(it.insurancePrice) : undefined,
            },
            availability: {
              inStock: Number(it.stock || 0) > 0,
              quantity: Number(it.stock || 0),
              deliveryTime: it.deliveryTime || '2-4 hours',
              pharmacies: it.pharmacy ? [
                { id: String(it.pharmacy), name: 'Selected Pharmacy', distance: 'nearby', rating: Number(it.rating || 4.3), price: genericPrice },
              ] : [],
            } as any,
            // Keep raw pharmacy owner id on the medicine for add-to-cart
            pharmacy: it.pharmacy ? String(it.pharmacy) : undefined,
            rating: Number(it.rating || 4.3),
            reviews: Number(it.reviews || 0),
            isFavorite: false,
            category: it.category || 'General',
            prescriptionRequired: !!it.prescriptionRequired,
            expiryDate: it.expiryDate ? String(it.expiryDate).slice(0, 10) : '',
            storage: it.storage || '',
            dosageInstructions: it.dosageInstructions || '',
            indications: Array.isArray(it.indications) ? it.indications : [],
            mechanism: it.mechanism || '',
            onset: it.onset || '',
            halfLife: it.halfLife || '',
            pregnancyCategory: it.pregnancyCategory || '',
            lactationSafety: it.lactationSafety || '',
            alcoholWarning: it.alcoholWarning || '',
            drivingWarning: it.drivingWarning || '',
            overdose: it.overdose || '',
            brandNames: Array.isArray(it.brandNames) ? it.brandNames : [],
            cloudinaryUrl: it.cloudinaryUrl || undefined,
          };
        });
        console.log('🔍 Mapped medicines:', mapped);
        console.log('🔍 Mapped length:', mapped.length);
        setMedicines(mapped);
        setFilteredMedicines(mapped);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    let filtered = medicines;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(medicine =>
        medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        medicine.generic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        medicine.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(medicine => medicine.category === selectedCategory);
    }

    // Apply price range filter
    if (priceRange && priceRange !== 'all') {
      switch (priceRange) {
        case 'under10':
          filtered = filtered.filter(medicine => medicine.price.generic < 10);
          break;
        case '10-25':
          filtered = filtered.filter(medicine =>
            medicine.price.generic >= 10 && medicine.price.generic <= 25
          );
          break;
        case '25-50':
          filtered = filtered.filter(medicine =>
            medicine.price.generic > 25 && medicine.price.generic <= 50
          );
          break;
        case 'over50':
          filtered = filtered.filter(medicine => medicine.price.generic > 50);
          break;
      }
    }

    // Apply availability filter
    if (availabilityFilter && availabilityFilter !== 'all') {
      switch (availabilityFilter) {
        case 'inStock':
          filtered = filtered.filter(medicine => medicine.availability.inStock);
          break;
        case 'outOfStock':
          filtered = filtered.filter(medicine => !medicine.availability.inStock);
          break;
        case 'sameDay':
          filtered = filtered.filter(medicine =>
            medicine.availability.deliveryTime.includes('hours')
          );
          break;
      }
    }

    // Apply sorting
    switch (sortBy) {
      case 'priceLow':
        filtered.sort((a, b) => a.price.generic - b.price.generic);
        break;
      case 'priceHigh':
        filtered.sort((a, b) => b.price.generic - a.price.generic);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'reviews':
        filtered.sort((a, b) => b.reviews - a.reviews);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // Relevance - keep original order
        break;
    }

    setFilteredMedicines(filtered);
    setPage(1);
  }, [searchQuery, selectedCategory, priceRange, availabilityFilter, sortBy, medicines]);

  const toggleFavorite = (medicineId: string) => {
    setMedicines(prev => prev.map(medicine =>
      medicine.id === medicineId
        ? { ...medicine, isFavorite: !medicine.isFavorite }
        : medicine
    ));
  };

  const getStatusIcon = (medicine: Medicine) => {
    if (!medicine.availability.inStock) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    if (medicine.availability.deliveryTime.includes('hours')) {
      return <Clock className="h-4 w-4 text-green-500" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getStatusText = (medicine: Medicine) => {
    if (!medicine.availability.inStock) {
      return 'Out of Stock';
    }
    if (medicine.availability.deliveryTime.includes('hours')) {
      return 'Same Day Delivery';
    }
    return 'Available';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-health-teal"></div>
          <p className="mt-4 text-gray-600">Searching medicines...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-900 via-teal-800 to-teal-700">
              <div className="p-6 sm:p-8 flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white">Search Medicines</h1>
                  <p className="text-teal-100 mt-2">Find and compare medicines from local pharmacies</p>
                </div>
                <ToggleGroup type="single" value={timeRange} onValueChange={(v) => v && setTimeRange(v as any)} className="bg-white/90 rounded-md p-1">
                  <ToggleGroupItem value="30" className="px-2">30d</ToggleGroupItem>
                  <ToggleGroupItem value="90" className="px-2">90d</ToggleGroupItem>
                  <ToggleGroupItem value="365" className="px-2">1y</ToggleGroupItem>
                  <ToggleGroupItem value="all" className="px-2">All</ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search medicines by name, generic name, or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="priceLow">Price: Low to High</SelectItem>
                  <SelectItem value="priceHigh">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="reviews">Most Reviews</SelectItem>
                  <SelectItem value="name">Name: A to Z</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Antibiotics">Antibiotics</SelectItem>
                      <SelectItem value="Pain Relief">Pain Relief</SelectItem>
                      <SelectItem value="Vitamins">Vitamins</SelectItem>
                      <SelectItem value="Gastrointestinal">Gastrointestinal</SelectItem>
                      <SelectItem value="Cardiovascular">Cardiovascular</SelectItem>
                      <SelectItem value="Diabetes">Diabetes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Price Range</label>
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Prices" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Prices</SelectItem>
                      <SelectItem value="under10">Under ₹10</SelectItem>
                      <SelectItem value="10-25">₹10 - ₹25</SelectItem>
                      <SelectItem value="25-50">₹25 - ₹50</SelectItem>
                      <SelectItem value="over50">Over ₹50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Availability</label>
                  <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Availability</SelectItem>
                      <SelectItem value="inStock">In Stock</SelectItem>
                      <SelectItem value="outOfStock">Out of Stock</SelectItem>
                      <SelectItem value="sameDay">Same Day Delivery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Prescription</label>
                  <Select value={activeTab} onValueChange={setActiveTab}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="prescription">Prescription Required</SelectItem>
                      <SelectItem value="otc">Over the Counter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          {filteredMedicines.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No medicines found</h3>
                <p className="text-gray-600">Try adjusting your search criteria or filters</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-600">
                  Showing {filteredMedicines.length} of {medicines.length} medicines
                </p>
                {compare.length > 0 && (
                  <Button variant="outline" size="sm" onClick={() => navigate('/patient/pharmacy/price-comparison')}>
                    Compare {compare.length}
                  </Button>
                )}
              </div>

              {filteredMedicines.slice((page - 1) * pageSize, page * pageSize).map((medicine) => (
                <Card key={medicine.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          {medicine.cloudinaryUrl ? (
                            <img
                              src={medicine.cloudinaryUrl}
                              alt={medicine.name}
                              className="h-12 w-12 object-cover rounded-lg"
                              onError={(e) => {
                                const target = e.currentTarget as HTMLImageElement;
                                target.style.display = 'none';
                                const nextElement = target.nextElementSibling as HTMLElement;
                                if (nextElement) {
                                  nextElement.style.display = 'block';
                                }
                              }}
                            />
                          ) : null}
                          <Pill className={`h-6 w-6 text-blue-600 ${medicine.cloudinaryUrl ? 'hidden' : ''}`} />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <h3 className="text-lg font-semibold text-gray-900">{medicine.name}</h3>
                              <Badge variant="outline">{medicine.dosage}</Badge>
                              {medicine.prescriptionRequired && (
                                <Badge className="bg-red-100 text-red-800">Prescription Required</Badge>
                              )}
                              <Badge className="bg-blue-100 text-blue-800">{medicine.category}</Badge>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleFavorite(medicine.id)}
                              >
                                <Heart className={`h-4 w-4 ${medicine.isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setCompare(prev => prev.includes(medicine.id) ? prev.filter(id => id !== medicine.id) : [...prev, medicine.id])}
                              >
                                <CheckCircle className={`h-4 w-4 ${compare.includes(medicine.id) ? 'text-teal-600' : 'text-gray-400'}`} />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Share2 className="h-4 w-4 text-gray-400" />
                              </Button>
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 mb-3">{medicine.description}</p>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center space-x-2">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm text-gray-600">
                                {medicine.rating} ({medicine.reviews} reviews)
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <DollarSign className="h-4 w-4 text-green-500" />
                              <span className="text-sm font-medium text-green-600">
                                From {formatINR(medicine.price.generic)}
                              </span>
                              {medicine.price.insuranceCovered && (
                                <Badge className="bg-green-100 text-green-800">Insurance</Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(medicine)}
                              <span className="text-sm text-gray-600">
                                {getStatusText(medicine)}
                              </span>
                            </div>
                          </div>

                          {/* Pharmacy Options */}
                          <div className="border-t pt-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Available at:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {medicine.availability.pharmacies.map((pharmacy, index) => (
                                <div key={index} className="flex items-center justify-between p-2 border rounded">
                                  <div>
                                    <p className="text-sm font-medium">{pharmacy.name}</p>
                                    <p className="text-xs text-gray-500">{pharmacy.distance}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-medium">{formatINR(pharmacy.price)}</p>
                                    <div className="flex items-center space-x-1">
                                      <Star className="h-3 w-3 text-yellow-500" />
                                      <span className="text-xs">{pharmacy.rating}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            try {
                              // Use _id if available, otherwise fallback to id
                              const medicineId = medicine._id || medicine.id;
                              console.log('Fetching medicine details for ID:', medicineId);

                              // Fetch detailed medicine information from backend
                              const backendMedicine: any = await patientPharmacyService.getMedicineDetails(medicineId);
                              console.log('Fetched detailed medicine:', backendMedicine);

                              // Convert backend medicine format to frontend format
                              const detailedMedicine: Medicine = {
                                id: String(backendMedicine._id || backendMedicine.id || medicineId),
                                _id: backendMedicine._id,
                                name: backendMedicine.name || 'Medicine',
                                generic: backendMedicine.generic || '',
                                dosage: backendMedicine.dosage || '',
                                form: backendMedicine.form || '',
                                manufacturer: backendMedicine.manufacturer || '',
                                description: backendMedicine.description || '',
                                sideEffects: Array.isArray(backendMedicine.sideEffects) ? backendMedicine.sideEffects : [],
                                interactions: Array.isArray(backendMedicine.interactions) ? backendMedicine.interactions : [],
                                contraindications: Array.isArray(backendMedicine.contraindications) ? backendMedicine.contraindications : [],
                                price: {
                                  generic: Number(backendMedicine.genericPrice || backendMedicine.price || 0),
                                  brand: Number(backendMedicine.brandPrice || backendMedicine.price || 0),
                                  savings: Number(backendMedicine.brandPrice || 0) - Number(backendMedicine.genericPrice || backendMedicine.price || 0),
                                  insuranceCovered: Boolean(backendMedicine.insuranceCovered),
                                  insurancePrice: Number(backendMedicine.insurancePrice || 0)
                                },
                                availability: {
                                  inStock: Number(backendMedicine.stock || 0) > 0,
                                  quantity: Number(backendMedicine.stock || 0),
                                  deliveryTime: backendMedicine.deliveryTime || '2-3 days',
                                  pharmacies: [{
                                    id: String(backendMedicine.pharmacy || '1'),
                                    name: 'Selected Pharmacy',
                                    distance: 'nearby',
                                    rating: Number(backendMedicine.rating || 4.5),
                                    price: Number(backendMedicine.genericPrice || backendMedicine.price || 0)
                                  }]
                                },
                                pharmacy: backendMedicine.pharmacy ? String(backendMedicine.pharmacy) : undefined,
                                rating: Number(backendMedicine.rating || 0),
                                reviews: Number(backendMedicine.reviews || 0),
                                isFavorite: false,
                                category: backendMedicine.category || '',
                                prescriptionRequired: Boolean(backendMedicine.prescriptionRequired),
                                expiryDate: backendMedicine.expiryDate || '',
                                storage: backendMedicine.storage || '',
                                dosageInstructions: backendMedicine.dosageInstructions || '',
                                indications: Array.isArray(backendMedicine.indications) ? backendMedicine.indications : [],
                                mechanism: backendMedicine.mechanism || '',
                                onset: backendMedicine.onset || '',
                                halfLife: backendMedicine.halfLife || '',
                                pregnancyCategory: backendMedicine.pregnancyCategory || '',
                                lactationSafety: backendMedicine.lactationSafety || '',
                                alcoholWarning: backendMedicine.alcoholWarning || '',
                                drivingWarning: backendMedicine.drivingWarning || '',
                                overdose: backendMedicine.overdose || '',
                                brandNames: Array.isArray(backendMedicine.brandNames) ? backendMedicine.brandNames : [],
                                cloudinaryUrl: backendMedicine.cloudinaryUrl
                              };

                              setSelectedMedicine(detailedMedicine);
                              setShowMedicineDialog(true);
                            } catch (error) {
                              console.error('Error fetching medicine details:', error);
                              // Fallback to the basic medicine data
                              console.log('Using fallback medicine data:', medicine);
                              setSelectedMedicine(medicine);
                              setShowMedicineDialog(true);
                            }
                          }}
                        >
                          <Info className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                        <Button
                          size="sm"
                          disabled={!medicine.availability.inStock}
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => {
                            addToCart(medicine);
                            navigate('/patient/pharmacy/cart');
                          }}
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Add to Cart
                        </Button>
                        <Button variant="outline" size="sm">
                          <MapPin className="h-4 w-4 mr-1" />
                          Find Nearby
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Pagination */}
              <div className="flex justify-between items-center pt-2">
                <p className="text-xs text-gray-500">Page {page} of {Math.max(1, Math.ceil(filteredMedicines.length / pageSize))}</p>
                <div className="space-x-2">
                  <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</Button>
                  <Button variant="outline" size="sm" disabled={page * pageSize >= filteredMedicines.length} onClick={() => setPage(p => p + 1)}>Next</Button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Medicine Details Dialog */}
        <Dialog open={showMedicineDialog} onOpenChange={setShowMedicineDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Pill className="h-5 w-5 text-blue-500" />
                <span>Medicine Details</span>
              </DialogTitle>
            </DialogHeader>
            {selectedMedicine && (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start space-x-4">
                  <div className="p-4 bg-blue-100 rounded-lg">
                    {selectedMedicine.cloudinaryUrl ? (
                      <img
                        src={selectedMedicine.cloudinaryUrl}
                        alt={selectedMedicine.name}
                        className="h-16 w-16 object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          target.style.display = 'none';
                          const nextElement = target.nextElementSibling as HTMLElement;
                          if (nextElement) {
                            nextElement.style.display = 'block';
                          }
                        }}
                      />
                    ) : null}
                    <Pill className={`h-10 w-10 text-blue-600 ${selectedMedicine.cloudinaryUrl ? 'hidden' : ''}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-2xl font-bold text-gray-900">{selectedMedicine.name}</h3>
                      <Badge variant="outline">{selectedMedicine.dosage}</Badge>
                      <Badge className="bg-blue-100 text-blue-800">{selectedMedicine.category}</Badge>
                      {selectedMedicine.prescriptionRequired && (
                        <Badge className="bg-red-100 text-red-800">Prescription Required</Badge>
                      )}
                    </div>
                    <p className="text-gray-600 mb-2">{selectedMedicine.generic}</p>
                    <p className="text-sm text-gray-600">{selectedMedicine.description}</p>
                  </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="pricing">Pricing</TabsTrigger>
                    <TabsTrigger value="pharmacies">Pharmacies</TabsTrigger>
                    <TabsTrigger value="safety">Safety</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                    <TabsTrigger value="faq">FAQ</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 border rounded-lg">
                        <p className="text-sm text-gray-600">Manufacturer</p>
                        <p className="font-semibold">{selectedMedicine.manufacturer}</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <p className="text-sm text-gray-600">Form</p>
                        <p className="font-semibold">{selectedMedicine.form}</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <p className="text-sm text-gray-600">Storage</p>
                        <p className="font-semibold">{selectedMedicine.storage}</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <p className="text-sm text-gray-600">Expiry Date</p>
                        <p className="font-semibold">{selectedMedicine.expiryDate}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 border rounded-lg">
                        <p className="text-sm text-gray-600">Indications</p>
                        <p className="text-sm text-gray-700">
                          {selectedMedicine.indications && selectedMedicine.indications.length > 0
                            ? selectedMedicine.indications.join(', ')
                            : 'No indications information available'}
                        </p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <p className="text-sm text-gray-600">Mechanism</p>
                        <p className="text-sm text-gray-700">{selectedMedicine.mechanism || '—'}</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <p className="text-sm text-gray-600">Onset</p>
                        <p className="font-semibold">{selectedMedicine.onset || '—'}</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <p className="text-sm text-gray-600">Half-life</p>
                        <p className="font-semibold">{selectedMedicine.halfLife || '—'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="p-3 border rounded-lg">
                        <p className="text-sm text-gray-600">Pregnancy</p>
                        <p className="text-sm text-gray-700">{selectedMedicine.pregnancyCategory || '—'}</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <p className="text-sm text-gray-600">Lactation</p>
                        <p className="text-sm text-gray-700">{selectedMedicine.lactationSafety || '—'}</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Dosage Instructions</h4>
                      <p className="text-sm text-gray-600">{selectedMedicine.dosageInstructions}</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="pricing" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg bg-green-50">
                        <h4 className="font-semibold text-green-800 mb-2">Generic (per unit)</h4>
                        <p className="text-2xl font-bold text-green-600">{formatINR(selectedMedicine.price.generic)}</p>
                        <p className="text-sm text-green-600">Best Value</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-2">Brand (per unit)</h4>
                        <p className="text-2xl font-bold text-gray-600">{formatINR(selectedMedicine.price.brand)}</p>
                        <p className="text-sm text-gray-600">Original</p>
                      </div>
                      {selectedMedicine.price.insuranceCovered && (
                        <div className="p-4 border rounded-lg bg-blue-50">
                          <h4 className="font-semibold text-blue-800 mb-2">With Insurance (est.)</h4>
                          <p className="text-2xl font-bold text-blue-600">{formatINR(Number(selectedMedicine.price.insurancePrice || 0))}</p>
                          <p className="text-sm text-blue-600">Coverage varies by plan</p>
                        </div>
                      )}
                    </div>

                    {/* Pack size and quantity */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">Select Pack Size</p>
                        <Select value={String(packSize)} onValueChange={(v) => setPackSize(Number(v))}>
                          <SelectTrigger><SelectValue placeholder="Pack size" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="30">30</SelectItem>
                            <SelectItem value="90">90</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">Quantity</p>
                        <Select value={String(orderQty)} onValueChange={(v) => setOrderQty(Number(v))}>
                          <SelectTrigger><SelectValue placeholder="Qty" /></SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 6, 12].map(q => (<SelectItem key={q} value={String(q)}>{q}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="p-4 border rounded-lg bg-emerald-50">
                        <p className="text-sm text-emerald-700 mb-1">Estimated Total (Generic)</p>
                        <p className="text-2xl font-bold text-emerald-700">{formatINR(selectedMedicine.price.generic * packSize * orderQty)}</p>
                        <p className="text-xs text-emerald-700">{orderQty} × {packSize} units</p>
                      </div>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        <span className="font-semibold text-green-800">You Save {formatINR(selectedMedicine.price.savings)}</span>
                      </div>
                      <p className="text-sm text-green-600">Choose generic to save money</p>
                    </div>

                    {selectedMedicine.brandNames && selectedMedicine.brandNames.length > 0 && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 border rounded-lg">
                          <p className="text-sm text-gray-600">Common Brand Names</p>
                          <p className="text-sm text-gray-700">{selectedMedicine.brandNames.join(', ')}</p>
                        </div>
                        {selectedMedicine.price.insuranceCovered && (
                          <div className="p-3 border rounded-lg">
                            <p className="text-sm text-gray-600">Insurance Coverage</p>
                            <p className="text-sm text-gray-700">Eligible – estimated {selectedMedicine.price.insurancePrice ? `${formatINR(selectedMedicine.price.insurancePrice)}` : 'varies by plan'}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="pharmacies" className="space-y-4">
                    <div className="space-y-3">
                      {selectedMedicine.availability.pharmacies.map((pharmacy, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded">
                              <MapPin className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-medium">{pharmacy.name}</h4>
                              <p className="text-sm text-gray-600">{pharmacy.distance}</p>
                              <div className="flex items-center space-x-1">
                                <Star className="h-3 w-3 text-yellow-500" />
                                <span className="text-xs">{pharmacy.rating}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">{formatINR(pharmacy.price)}</p>
                            <div className="flex space-x-2 mt-2">
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                <ShoppingCart className="h-3 w-3 mr-1" />
                                Order
                              </Button>
                              <Button variant="outline" size="sm">
                                <Phone className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="safety" className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Side Effects</h4>
                      {selectedMedicine.sideEffects && selectedMedicine.sideEffects.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedMedicine.sideEffects.map((effect, index) => (
                            <Badge key={index} variant="outline" className="bg-red-50 text-red-700">
                              {effect}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No side effects information available</p>
                      )}
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Drug Interactions</h4>
                      {selectedMedicine.interactions && selectedMedicine.interactions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {selectedMedicine.interactions.map((interaction, index) => (
                            <div key={index} className="flex items-center justify-between p-2 border rounded">
                              <span className="text-sm">{interaction}</span>
                              <Badge className="bg-yellow-100 text-yellow-800">Moderate</Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No drug interactions information available</p>
                      )}
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Contraindications</h4>
                      {selectedMedicine.contraindications && selectedMedicine.contraindications.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedMedicine.contraindications.map((contraindication, index) => (
                            <Badge key={index} variant="outline" className="bg-red-50 text-red-700">
                              {contraindication}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No contraindications information available</p>
                      )}
                    </div>

                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <span className="font-semibold text-yellow-800">Important Safety Information</span>
                      </div>
                      <p className="text-sm text-yellow-700 mt-2">
                        Always consult with your healthcare provider before taking any medication.
                        This information is for educational purposes only.
                      </p>
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <div className="p-3 border rounded-lg">
                          <p className="text-sm text-gray-600">Alcohol</p>
                          <p className="text-sm text-gray-700">{selectedMedicine.alcoholWarning || '—'}</p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <p className="text-sm text-gray-600">Driving/Operating Machinery</p>
                          <p className="text-sm text-gray-700">{selectedMedicine.drivingWarning || '—'}</p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <p className="text-sm text-gray-600">Overdose</p>
                          <p className="text-sm text-gray-700">{selectedMedicine.overdose || '—'}</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="reviews" className="space-y-4">
                    <div className="space-y-3">
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">User A</div>
                          <div className="flex items-center gap-1 text-yellow-500"><Star className="h-4 w-4" /><span className="text-sm">4.5</span></div>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">Worked well with minimal side effects.</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">User B</div>
                          <div className="flex items-center gap-1 text-yellow-500"><Star className="h-4 w-4" /><span className="text-sm">4.0</span></div>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">Fast relief and affordable generic price.</p>
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="text-sm text-gray-700 mb-2">Write a review</p>
                      <Textarea placeholder="Share your experience (optional)" />
                      <div className="text-right mt-2"><Button size="sm">Submit</Button></div>
                    </div>
                  </TabsContent>

                  <TabsContent value="faq" className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <p className="font-medium">Can I take this with food?</p>
                      <p className="text-sm text-gray-700">Yes, following your doctor’s advice. Some medications are gentler with food.</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="font-medium">What if I miss a dose?</p>
                      <p className="text-sm text-gray-700">Take it as soon as you remember unless it’s close to the next dose. Do not double dose.</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="font-medium">Storage tips</p>
                      <p className="text-sm text-gray-700">Keep in a cool, dry place away from sunlight unless otherwise directed on label.</p>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex space-x-2 pt-4 border-t">
                  <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => {
                    if (selectedMedicine) {
                      addToCart(selectedMedicine, {
                        variant: 'generic',
                        qty: orderQty,
                        pack: packSize,
                        pharmacy: selectedMedicine.pharmacy,
                        insurance: selectedMedicine.price.insuranceCovered
                      });
                    }
                    navigate('/patient/pharmacy/cart');
                  }}>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart ({selectedMedicine ? formatINR(selectedMedicine.price.generic * packSize * orderQty) : ''})
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Ask Pharmacist
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
        {/* Cart Sheet */}
        <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
          <SheetContent side="right" className="w-full sm:max-w-xl p-0">
            <div className="bg-gradient-to-r from-emerald-900 via-teal-800 to-teal-700 p-5">
              <SheetHeader>
                <SheetTitle className="text-white">Your Cart</SheetTitle>
              </SheetHeader>
              <div className="text-teal-100 text-sm">Review items, choose delivery, apply offers, and checkout</div>
            </div>
            <div className="p-4">
              <Tabs defaultValue="summary" className="w-full">
                <TabsList className="grid grid-cols-4">
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="delivery">Delivery</TabsTrigger>
                  <TabsTrigger value="offers">Offers</TabsTrigger>
                  <TabsTrigger value="safety">Safety</TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="space-y-4">
                  {cart.length === 0 ? (
                    <Card><CardContent className="p-6 text-center text-sm text-gray-600">Your cart is empty.</CardContent></Card>
                  ) : (
                    <div className="space-y-3">
                      {cart.map(ci => (
                        <div key={ci.key} className="p-3 border rounded-lg flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-900">{ci.medicine.name}</span>
                              <Badge variant="outline">{ci.medicine.dosage}</Badge>
                              <Badge className="bg-blue-100 text-blue-800">{ci.variant}</Badge>
                            </div>
                            <div className="text-xs text-gray-600 mb-2">{ci.pharmacy || 'Selected pharmacy'}</div>
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <Label className="text-xs text-gray-600">Pack</Label>
                                <Select value={String(ci.packSize)} onValueChange={(v) => updateCartItem(ci.key, { packSize: Number(v) })}>
                                  <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    {[10, 30, 90].map(ps => <SelectItem key={ps} value={String(ps)}>{ps}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-xs text-gray-600">Qty</Label>
                                <Select value={String(ci.quantity)} onValueChange={(v) => updateCartItem(ci.key, { quantity: Number(v) })}>
                                  <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    {[1, 2, 3, 6, 12].map(q => <SelectItem key={q} value={String(q)}>{q}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-xs text-gray-600">Variant</Label>
                                <Select value={ci.variant} onValueChange={(v) => updateCartItem(ci.key, { variant: v as any, unitPrice: (v === 'generic' ? ci.medicine.price.generic : ci.medicine.price.brand) })}>
                                  <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="generic">Generic</SelectItem>
                                    <SelectItem value="brand">Brand</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">Unit</div>
                            <div className="text-base font-semibold text-gray-900">{formatINR(ci.unitPrice)}</div>
                            <div className="text-xs text-gray-500 mt-1">Line total</div>
                            <div className="text-base font-bold text-emerald-700">{formatINR(ci.unitPrice * ci.packSize * ci.quantity)}</div>
                            <Button variant="ghost" size="sm" className="mt-2 text-red-600" onClick={() => removeCartItem(ci.key)}>Remove</Button>
                          </div>
                        </div>
                      ))}

                      <div className="p-3 border rounded-lg bg-emerald-50">
                        <div className="flex items-center gap-2 text-emerald-800"><DollarSign className="h-4 w-4" /> Savings tip: choose Generic to reduce cost.</div>
                      </div>

                      <div className="p-4 border rounded-lg space-y-2">
                        <div className="flex justify-between text-sm"><span className="text-gray-600">Subtotal</span><span className="font-medium">{formatINR(cartSubtotal)}</span></div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Coupon</span>
                          <div className="flex gap-2">
                            <Input placeholder="Enter code" value={coupon} onChange={(e) => setCoupon(e.target.value)} className="h-8 w-28" />
                            <Button size="sm" variant="outline">Apply</Button>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm"><span className="text-gray-600">Discount</span><span className="text-green-700">-{formatINR(discount)}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-600">Tax (5%)</span><span>{formatINR(tax)}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-600">Delivery</span><span>{deliveryFee ? formatINR(deliveryFee) : 'Free'}</span></div>
                        <Separator />
                        <div className="flex justify-between text-base font-semibold"><span>Total</span><span className="text-emerald-700">{formatINR(grandTotal)}</span></div>
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700 mt-2">Proceed to Checkout</Button>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="delivery" className="space-y-4">
                  <Card>
                    <CardHeader><CardTitle className="text-base">Delivery Address</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      <RadioGroup value={address} onValueChange={(v) => setAddress(v as any)}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="home" id="addr-home" />
                          <Label htmlFor="addr-home">Home • 221B Baker Street, Mumbai</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="work" id="addr-work" />
                          <Label htmlFor="addr-work">Work • Tech Park, Andheri</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="new" id="addr-new" />
                          <Label htmlFor="addr-new">Add new address</Label>
                        </div>
                      </RadioGroup>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle className="text-base">Delivery Options</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      <RadioGroup value={deliveryOption} onValueChange={(v) => setDeliveryOption(v as any)}>
                        <div className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="sameDay" id="opt-same" />
                            <Label htmlFor="opt-same" className="cursor-pointer">Same-day (2-4 hrs)</Label>
                          </div>
                          <span className="text-sm">{formatINR(49)}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="standard" id="opt-std" />
                            <Label htmlFor="opt-std" className="cursor-pointer">Standard (Next day)</Label>
                          </div>
                          <span className="text-sm">Free</span>
                        </div>
                        <div className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="pickup" id="opt-pick" />
                            <Label htmlFor="opt-pick" className="cursor-pointer">Store Pickup</Label>
                          </div>
                          <span className="text-sm">Free</span>
                        </div>
                      </RadioGroup>

                      <div>
                        <Label className="text-sm">Preferred Slot</Label>
                        <Select value={deliverySlot} onValueChange={setDeliverySlot}>
                          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {['Today, 4-6 PM', 'Today, 6-8 PM', 'Tomorrow, 10-12 AM', 'Tomorrow, 2-4 PM'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm">Delivery Instructions</Label>
                        <Textarea className="mt-1" placeholder="e.g., Call on arrival, leave at security" value={instructions} onChange={(e) => setInstructions(e.target.value)} />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="offers" className="space-y-3">
                  <Card>
                    <CardHeader><CardTitle className="text-base">Available Offers</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="p-2 border rounded">Use code SAVE10 to get 10% off up to {formatINR(100)}.</div>
                      <div className="p-2 border rounded">Bank offer: 5% cashback on select cards.</div>
                      <div className="p-2 border rounded">Free delivery on orders above {formatINR(499)}.</div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="safety" className="space-y-3">
                  <Card>
                    <CardHeader><CardTitle className="text-base">Prescription</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="p-2 border rounded bg-yellow-50">Some items may require a valid prescription. Upload during checkout if needed.</div>
                      <Button variant="outline">Upload Prescription</Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle className="text-base">Important Notes</CardTitle></CardHeader>
                    <CardContent className="text-sm text-gray-700">
                      Always follow your doctor’s advice. Read labels carefully. This service does not replace professional medical consultation.
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default SearchMedicines; 