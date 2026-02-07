import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ShoppingCart, Search, Filter, Star, DollarSign, Truck, Plus, Minus,
  Heart, Share2, Info, Clock, Package, MapPin, Phone, MessageSquare,
  ChevronDown, ChevronUp, AlertTriangle, CheckCircle, XCircle, Calendar,
  User, Pill, RefreshCw, Download, Eye, Edit, Trash2, CreditCard,
  CheckCircle2, ArrowRight, ShoppingBag, Receipt, Truck as TruckIcon
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CartItem {
  id: number;
  medicineName: string;
  dosage: string;
  form: string;
  quantity: number;
  price: number;
  pharmacy: string;
  deliveryTime: string;
  insurancePrice?: number;
  savings: number;
}

interface Order {
  id: number;
  orderNumber: string;
  items: CartItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  estimatedDelivery: string;
  trackingNumber?: string;
  pharmacy: {
    name: string;
    address: string;
    phone: string;
    rating: number;
  };
  paymentMethod: string;
  deliveryAddress: string;
  deliveryInstructions?: string;
}

interface Medicine {
  id: number;
  name: string;
  generic: string;
  dosage: string;
  form: string;
  manufacturer: string;
  description: string;
  price: {
    generic: number;
    brand: number;
    insurancePrice?: number;
    savings: number;
  };
  availability: {
    inStock: boolean;
    quantity: number;
    deliveryTime: string;
    pharmacies: Array<{
      name: string;
      distance: string;
      rating: number;
      price: number;
    }>;
  };
  rating: number;
  reviews: number;
  category: string;
  prescriptionRequired: boolean;
}

const OrderMedicines = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [showMedicineDialog, setShowMedicineDialog] = useState(false);
  const [showCartDialog, setShowCartDialog] = useState(false);
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('browse');
  const [sortBy, setSortBy] = useState('relevance');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Test render to see if component loads
  console.log('OrderMedicines component is rendering');

  // Mock data
  const mockMedicines: Medicine[] = [
    {
      id: 1,
      name: 'Amoxicillin',
      generic: 'Amoxicillin',
      dosage: '500mg',
      form: 'Capsule',
      manufacturer: 'Generic Pharmaceuticals',
      description: 'Antibiotic used to treat bacterial infections',
      price: {
        generic: 12.50,
        brand: 45.00,
        insurancePrice: 8.75,
        savings: 32.50
      },
      availability: {
        inStock: true,
        quantity: 50,
        deliveryTime: '2-3 hours',
        pharmacies: [
          { name: 'City Pharmacy', distance: '0.5 km', rating: 4.5, price: 12.50 },
          { name: 'Metro Drugs', distance: '1.2 km', rating: 4.2, price: 13.00 },
          { name: 'Health Plus', distance: '2.1 km', rating: 4.8, price: 11.75 }
        ]
      },
      rating: 4.5,
      reviews: 128,
      category: 'Antibiotics',
      prescriptionRequired: true
    },
    {
      id: 2,
      name: 'Ibuprofen',
      generic: 'Ibuprofen',
      dosage: '400mg',
      form: 'Tablet',
      manufacturer: 'Pain Relief Inc.',
      description: 'Non-steroidal anti-inflammatory drug for pain relief',
      price: {
        generic: 8.75,
        brand: 28.00,
        savings: 19.25
      },
      availability: {
        inStock: true,
        quantity: 100,
        deliveryTime: '1-2 hours',
        pharmacies: [
          { name: 'Quick Pharmacy', distance: '0.3 km', rating: 4.3, price: 8.75 },
          { name: 'Express Drugs', distance: '0.8 km', rating: 4.1, price: 9.00 },
          { name: 'Neighborhood Pharmacy', distance: '1.5 km', rating: 4.6, price: 8.50 }
        ]
      },
      rating: 4.2,
      reviews: 89,
      category: 'Pain Relief',
      prescriptionRequired: false
    },
    {
      id: 3,
      name: 'Vitamin D3',
      generic: 'Cholecalciferol',
      dosage: '1000IU',
      form: 'Softgel',
      manufacturer: 'Health Supplements Co.',
      description: 'Vitamin D supplement for bone health',
      price: {
        generic: 15.00,
        brand: 35.00,
        insurancePrice: 12.00,
        savings: 20.00
      },
      availability: {
        inStock: true,
        quantity: 75,
        deliveryTime: '2-4 hours',
        pharmacies: [
          { name: 'Wellness Pharmacy', distance: '0.7 km', rating: 4.7, price: 15.00 },
          { name: 'Natural Health', distance: '1.3 km', rating: 4.4, price: 15.50 },
          { name: 'Organic Pharmacy', distance: '2.0 km', rating: 4.9, price: 14.25 }
        ]
      },
      rating: 4.8,
      reviews: 156,
      category: 'Vitamins',
      prescriptionRequired: false
    }
  ];

  const mockOrders: Order[] = [
    {
      id: 1,
      orderNumber: 'ORD-2024-001',
      items: [
        {
          id: 1,
          medicineName: 'Amoxicillin 500mg',
          dosage: '500mg',
          form: 'Capsule',
          quantity: 1,
          price: 12.50,
          pharmacy: 'City Pharmacy',
          deliveryTime: '2-3 hours',
          insurancePrice: 8.75,
          savings: 32.50
        },
        {
          id: 2,
          medicineName: 'Ibuprofen 400mg',
          dosage: '400mg',
          form: 'Tablet',
          quantity: 2,
          price: 8.75,
          pharmacy: 'Quick Pharmacy',
          deliveryTime: '1-2 hours',
          savings: 19.25
        }
      ],
      totalAmount: 30.00,
      status: 'shipped',
      orderDate: '2024-01-20',
      estimatedDelivery: '2024-01-22',
      trackingNumber: 'TRK123456',
      pharmacy: {
        name: 'City Pharmacy',
        address: '123 Main Street, City Center',
        phone: '+1-555-0301',
        rating: 4.5
      },
      paymentMethod: 'Credit Card',
      deliveryAddress: '456 Oak Avenue, Metro District'
    },
    {
      id: 2,
      orderNumber: 'ORD-2024-002',
      items: [
        {
          id: 3,
          medicineName: 'Vitamin D3 1000IU',
          dosage: '1000IU',
          form: 'Softgel',
          quantity: 1,
          price: 15.00,
          pharmacy: 'Wellness Pharmacy',
          deliveryTime: '2-4 hours',
          insurancePrice: 12.00,
          savings: 20.00
        }
      ],
      totalAmount: 15.00,
      status: 'processing',
      orderDate: '2024-01-21',
      estimatedDelivery: '2024-01-23',
      pharmacy: {
        name: 'Wellness Pharmacy',
        address: '789 Health Blvd, Wellness District',
        phone: '+1-555-0303',
        rating: 4.7
      },
      paymentMethod: 'Insurance',
      deliveryAddress: '456 Oak Avenue, Metro District'
    }
  ];

  useEffect(() => {
    // Simulate API call
    console.log('OrderMedicines useEffect running');
    setLoading(true);
    setTimeout(() => {
      console.log('Setting medicines data:', mockMedicines.length, 'items');
      setMedicines(mockMedicines);
      setFilteredMedicines(mockMedicines);
      setOrders(mockOrders);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = medicines;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(medicine =>
        medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        medicine.generic.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(medicine => medicine.category === selectedCategory);
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
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // Relevance - keep original order
        break;
    }

    setFilteredMedicines(filtered);
  }, [searchQuery, selectedCategory, sortBy, medicines]);

  const addToCart = (medicine: Medicine, pharmacy: { name: string; price: number }) => {
    const existingItem = cart.find(item => 
      item.id === medicine.id && item.pharmacy === pharmacy.name
    );

    if (existingItem) {
      setCart(prev => prev.map(item =>
        item.id === medicine.id && item.pharmacy === pharmacy.name
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      const newItem: CartItem = {
        id: medicine.id,
        medicineName: `${medicine.name} ${medicine.dosage}`,
        dosage: medicine.dosage,
        form: medicine.form,
        quantity: 1,
        price: pharmacy.price,
        pharmacy: pharmacy.name,
        deliveryTime: medicine.availability.deliveryTime,
        insurancePrice: medicine.price.insurancePrice,
        savings: medicine.price.savings
      };
      setCart(prev => [...prev, newItem]);
    }
  };

  const removeFromCart = (itemId: number, pharmacy: string) => {
    setCart(prev => prev.filter(item => 
      !(item.id === itemId && item.pharmacy === pharmacy)
    ));
  };

  const updateQuantity = (itemId: number, pharmacy: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId, pharmacy);
      return;
    }
    setCart(prev => prev.map(item =>
      item.id === itemId && item.pharmacy === pharmacy
        ? { ...item, quantity }
        : item
    ));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartSavings = () => {
    return cart.reduce((total, item) => total + item.savings, 0);
  };

  const handleCheckout = () => {
    // Simulate order creation
    const newOrder: Order = {
      id: orders.length + 1,
      orderNumber: `ORD-2024-${String(orders.length + 1).padStart(3, '0')}`,
      items: cart,
      totalAmount: getCartTotal(),
      status: 'pending',
      orderDate: new Date().toISOString().split('T')[0],
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      pharmacy: {
        name: cart[0]?.pharmacy || 'City Pharmacy',
        address: '123 Main Street, City Center',
        phone: '+1-555-0301',
        rating: 4.5
      },
      paymentMethod: 'Credit Card',
      deliveryAddress: '456 Oak Avenue, Metro District'
    };

    setOrders(prev => [newOrder, ...prev]);
    setCart([]);
    setShowCheckoutDialog(false);
    setShowCartDialog(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'confirmed':
      case 'processing':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'shipped':
        return <TruckIcon className="h-4 w-4 text-purple-500" />;
      case 'delivered':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-health-teal"></div>
          <p className="mt-4 text-gray-600">Loading medicines...</p>
        </div>
      </div>
    );
  }

  // Fallback render to ensure component always shows something
  if (!medicines.length && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Medicines</h1>
          <p className="text-gray-600">Loading medicines data...</p>
          <button 
            onClick={() => {
              setMedicines(mockMedicines);
              setFilteredMedicines(mockMedicines);
              setOrders(mockOrders);
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Load Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Order Medicines</h1>
          <p className="text-gray-600 mt-2">Browse and order medicines from local pharmacies</p>
        </div>

        {/* Cart Summary */}
        {cart.length > 0 && (
          <Card className="mb-6 bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <ShoppingCart className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">
                      {cart.length} item{cart.length !== 1 ? 's' : ''} in cart
                    </p>
                    <p className="text-sm text-green-600">
                      Total: ${getCartTotal().toFixed(2)} • Save: ${getCartSavings().toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCartDialog(true)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Cart
                  </Button>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => setShowCheckoutDialog(true)}
                  >
                    <ArrowRight className="h-4 w-4 mr-1" />
                    Checkout
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search medicines to order..."
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
                  <SelectItem value="name">Name: A to Z</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Price Range</label>
                  <Select value="all" onValueChange={() => {}}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Prices" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Prices</SelectItem>
                      <SelectItem value="under10">Under $10</SelectItem>
                      <SelectItem value="10-25">$10 - $25</SelectItem>
                      <SelectItem value="25-50">$25 - $50</SelectItem>
                      <SelectItem value="over50">Over $50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Delivery</label>
                  <Select value="all" onValueChange={() => {}}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Delivery" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Delivery</SelectItem>
                      <SelectItem value="sameDay">Same Day</SelectItem>
                      <SelectItem value="nextDay">Next Day</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="browse">Browse Medicines</TabsTrigger>
            <TabsTrigger value="cart">Shopping Cart</TabsTrigger>
            <TabsTrigger value="orders">My Orders</TabsTrigger>
          </TabsList>

          {/* Browse Medicines Tab */}
          <TabsContent value="browse" className="space-y-4">
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
              </div>

              {filteredMedicines.map((medicine) => (
                <Card key={medicine.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <Pill className="h-6 w-6 text-blue-600" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{medicine.name}</h3>
                            <Badge variant="outline">{medicine.dosage}</Badge>
                            {medicine.prescriptionRequired && (
                              <Badge className="bg-red-100 text-red-800">Prescription Required</Badge>
                            )}
                            <Badge className="bg-blue-100 text-blue-800">{medicine.category}</Badge>
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
                                From ${medicine.price.generic}
                              </span>
                              {medicine.price.insurancePrice && (
                                <Badge className="bg-green-100 text-green-800">Insurance</Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Truck className="h-4 w-4 text-blue-500" />
                              <span className="text-sm text-gray-600">
                                {medicine.availability.deliveryTime}
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
                                    <p className="text-sm font-medium">${pharmacy.price}</p>
                                    <div className="flex items-center space-x-1">
                                      <Star className="h-3 w-3 text-yellow-500" />
                                      <span className="text-xs">{pharmacy.rating}</span>
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => addToCart(medicine, pharmacy)}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
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
                          onClick={() => {
                            setSelectedMedicine(medicine);
                            setShowMedicineDialog(true);
                          }}
                        >
                          <Info className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => addToCart(medicine, medicine.availability.pharmacies[0])}
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </TabsContent>

        {/* Shopping Cart Tab */}
        <TabsContent value="cart" className="space-y-4">
          {cart.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-600">Add medicines to your cart to get started</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {cart.map((item, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-100 rounded">
                          <Pill className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{item.medicineName}</h4>
                          <p className="text-sm text-gray-600">{item.pharmacy}</p>
                          <p className="text-sm text-gray-600">Delivery: {item.deliveryTime}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.pharmacy, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.pharmacy, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                          {item.insurancePrice && (
                            <p className="text-xs text-green-600">Insurance: ${item.insurancePrice}</p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeFromCart(item.id, item.pharmacy)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-green-800">Order Summary</p>
                      <p className="text-sm text-green-600">
                        {cart.length} item{cart.length !== 1 ? 's' : ''} • Save: ${getCartSavings().toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-800">${getCartTotal().toFixed(2)}</p>
                      <p className="text-sm text-green-600">Total</p>
                    </div>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setCart([])}
                    >
                      Clear Cart
                    </Button>
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => setShowCheckoutDialog(true)}
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Proceed to Checkout
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* My Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          {orders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                <p className="text-gray-600">Your order history will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="p-3 bg-orange-100 rounded-lg">
                          <Package className="h-6 w-6 text-orange-600" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{order.orderNumber}</h3>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </div>

                          <p className="text-sm text-gray-600 mb-3">
                            {order.items.length} item{order.items.length !== 1 ? 's' : ''} • Total: ${order.totalAmount}
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-blue-500" />
                              <span className="text-sm text-gray-600">
                                Ordered: {order.orderDate}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Truck className="h-4 w-4 text-green-500" />
                              <span className="text-sm text-gray-600">
                                ETA: {order.estimatedDelivery}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-purple-500" />
                              <span className="text-sm text-gray-600">
                                {order.pharmacy.name}
                              </span>
                            </div>
                          </div>

                          {/* Order Items */}
                          <div className="border-t pt-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Items:</h4>
                            <div className="space-y-2">
                              {order.items.map((item, index) => (
                                <div key={index} className="flex justify-between items-center p-2 border rounded">
                                  <span className="text-sm">{item.medicineName}</span>
                                  <span className="text-sm text-gray-600">
                                    Qty: {item.quantity} • ${item.price}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                        {order.trackingNumber && (
                          <Button variant="outline" size="sm">
                            <TruckIcon className="h-4 w-4 mr-1" />
                            Track
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Contact
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        </Tabs>

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
                    <Pill className="h-10 w-10 text-blue-600" />
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

                {/* Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg bg-green-50">
                    <h4 className="font-semibold text-green-800 mb-2">Generic</h4>
                    <p className="text-2xl font-bold text-green-600">${selectedMedicine.price.generic}</p>
                    <p className="text-sm text-green-600">Best Value</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Brand</h4>
                    <p className="text-2xl font-bold text-gray-600">${selectedMedicine.price.brand}</p>
                    <p className="text-sm text-gray-600">Original</p>
                  </div>
                  {selectedMedicine.price.insurancePrice && (
                    <div className="p-4 border rounded-lg bg-blue-50">
                      <h4 className="font-semibold text-blue-800 mb-2">With Insurance</h4>
                      <p className="text-2xl font-bold text-blue-600">${selectedMedicine.price.insurancePrice}</p>
                      <p className="text-sm text-blue-600">Covered</p>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2 pt-4 border-t">
                  <Button className="flex-1 bg-green-600 hover:bg-green-700">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
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

        {/* Checkout Dialog */}
        <Dialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-green-500" />
                <span>Checkout</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Order Summary */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Order Summary</h4>
                <div className="space-y-2">
                  {cart.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <p className="font-medium">{item.medicineName}</p>
                        <p className="text-sm text-gray-600">{item.pharmacy}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-medium">Total</span>
                  <span className="text-2xl font-bold text-green-600">${getCartTotal().toFixed(2)}</span>
                </div>
                <p className="text-sm text-green-600">You save: ${getCartSavings().toFixed(2)}</p>
              </div>

              {/* Payment and Delivery */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Payment Method</h4>
                  <Select defaultValue="credit">
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit">Credit Card</SelectItem>
                      <SelectItem value="debit">Debit Card</SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                      <SelectItem value="cash">Cash on Delivery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Delivery Address</h4>
                  <Input placeholder="Enter delivery address" defaultValue="456 Oak Avenue, Metro District" />
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Delivery Instructions</h4>
                  <Input placeholder="Any special delivery instructions (optional)" />
                </div>
              </div>

              <div className="flex space-x-2 pt-4 border-t">
                <Button variant="outline" className="flex-1" onClick={() => setShowCheckoutDialog(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleCheckout}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Place Order
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default OrderMedicines; 