import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, Search, Filter, Star, DollarSign, Truck, ShoppingCart,
  Heart, Share2, Info, Clock, Package, MapPin, Phone, MessageSquare,
  ChevronDown, ChevronUp, AlertTriangle, CheckCircle, XCircle, Calendar,
  User, Pill, RefreshCw, Download, Eye, Edit, Trash2, Plus, Shield
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Prescription {
  id: number;
  medicineName: string;
  genericName: string;
  dosage: string;
  form: string;
  frequency: string;
  duration: string;
  prescribedBy: string;
  prescribedDate: string;
  refills: number;
  status: 'active' | 'expired' | 'completed' | 'suspended';
  notes?: string;
  sideEffects: string[];
  interactions: string[];
  instructions: string;
  pharmacy: {
    name: string;
    address: string;
    phone: string;
    rating: number;
  };
  price: {
    generic: number;
    brand: number;
    insurancePrice?: number;
    savings: number;
  };
  lastFilled: string;
  nextRefillDate: string;
  quantity: number;
  remainingPills: number;
  isFavorite: boolean;
  category: string;
  prescriptionImage?: string;
  pharmacyLogo?: string;
}

const MyPrescriptions = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState<Prescription[]>([]);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [showPrescriptionDialog, setShowPrescriptionDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Mock data
  const mockPrescriptions: Prescription[] = [
    {
      id: 1,
      medicineName: 'Amoxicillin',
      genericName: 'Amoxicillin',
      dosage: '500mg',
      form: 'Capsule',
      frequency: 'Twice daily',
      duration: '10 days',
      prescribedBy: 'Dr. Sarah Johnson',
      prescribedDate: '2024-01-15',
      refills: 2,
      status: 'active',
      notes: 'Take with food to reduce stomach upset',
      sideEffects: ['Nausea', 'Diarrhea', 'Rash', 'Vomiting'],
      interactions: ['Blood thinners', 'Birth control pills', 'Probenecid'],
      instructions: 'Take 1 capsule every 8 hours with or without food. Complete the full course even if symptoms improve.',
      pharmacy: {
        name: 'City Pharmacy',
        address: '123 Main Street, City Center',
        phone: '+1-555-0301',
        rating: 4.5
      },
      price: {
        generic: 12.50,
        brand: 45.00,
        insurancePrice: 8.75,
        savings: 32.50
      },
      lastFilled: '2024-01-20',
      nextRefillDate: '2024-02-20',
      quantity: 30,
      remainingPills: 15,
      isFavorite: false,
      category: 'Antibiotics'
    },
    {
      id: 2,
      medicineName: 'Ibuprofen',
      genericName: 'Ibuprofen',
      dosage: '400mg',
      form: 'Tablet',
      frequency: 'As needed',
      duration: '30 days',
      prescribedBy: 'Dr. Michael Chen',
      prescribedDate: '2024-01-10',
      refills: 1,
      status: 'active',
      sideEffects: ['Stomach upset', 'Dizziness', 'Headache', 'Heartburn'],
      interactions: ['Blood pressure medications', 'Diuretics', 'Aspirin'],
      instructions: 'Take 1-2 tablets every 4-6 hours as needed for pain. Do not exceed 6 tablets in 24 hours.',
      pharmacy: {
        name: 'Quick Pharmacy',
        address: '456 Oak Avenue, Metro District',
        phone: '+1-555-0302',
        rating: 4.3
      },
      price: {
        generic: 8.75,
        brand: 28.00,
        savings: 19.25
      },
      lastFilled: '2024-01-12',
      nextRefillDate: '2024-02-12',
      quantity: 60,
      remainingPills: 45,
      isFavorite: true,
      category: 'Pain Relief'
    },
    {
      id: 3,
      medicineName: 'Vitamin D3',
      genericName: 'Cholecalciferol',
      dosage: '1000IU',
      form: 'Softgel',
      frequency: 'Once daily',
      duration: '90 days',
      prescribedBy: 'Dr. Emily Davis',
      prescribedDate: '2024-01-05',
      refills: 3,
      status: 'active',
      notes: 'Take with food for better absorption',
      sideEffects: ['Rare side effects', 'Nausea', 'Loss of appetite'],
      interactions: ['Calcium supplements', 'Steroids', 'Weight loss drugs'],
      instructions: 'Take 1 softgel daily with food. Best absorbed with fatty foods.',
      pharmacy: {
        name: 'Wellness Pharmacy',
        address: '789 Health Blvd, Wellness District',
        phone: '+1-555-0303',
        rating: 4.7
      },
      price: {
        generic: 15.00,
        brand: 35.00,
        insurancePrice: 12.00,
        savings: 20.00
      },
      lastFilled: '2024-01-08',
      nextRefillDate: '2024-04-08',
      quantity: 90,
      remainingPills: 75,
      isFavorite: false,
      category: 'Vitamins'
    },
    {
      id: 4,
      medicineName: 'Omeprazole',
      genericName: 'Omeprazole',
      dosage: '20mg',
      form: 'Capsule',
      frequency: 'Once daily',
      duration: '60 days',
      prescribedBy: 'Dr. Robert Wilson',
      prescribedDate: '2024-01-03',
      refills: 2,
      status: 'active',
      notes: 'Take before breakfast for best results',
      sideEffects: ['Headache', 'Diarrhea', 'Nausea', 'Stomach pain'],
      interactions: ['Iron supplements', 'Vitamin B12', 'Blood thinners'],
      instructions: 'Take 1 capsule daily before breakfast. Swallow whole, do not crush or chew.',
      pharmacy: {
        name: 'Digestive Care',
        address: '321 Gastro Street, Medical Center',
        phone: '+1-555-0304',
        rating: 4.6
      },
      price: {
        generic: 22.50,
        brand: 65.00,
        insurancePrice: 15.75,
        savings: 42.50
      },
      lastFilled: '2024-01-06',
      nextRefillDate: '2024-03-06',
      quantity: 60,
      remainingPills: 40,
      isFavorite: false,
      category: 'Gastrointestinal'
    },
    {
      id: 5,
      medicineName: 'Lisinopril',
      genericName: 'Lisinopril',
      dosage: '10mg',
      form: 'Tablet',
      frequency: 'Once daily',
      duration: '90 days',
      prescribedBy: 'Dr. Lisa Thompson',
      prescribedDate: '2023-12-15',
      refills: 0,
      status: 'expired',
      notes: 'Monitor blood pressure regularly',
      sideEffects: ['Dizziness', 'Cough', 'Fatigue', 'Headache'],
      interactions: ['Diuretics', 'NSAIDs', 'Lithium', 'Potassium supplements'],
      instructions: 'Take 1 tablet daily at the same time each day. Monitor blood pressure and report any significant changes.',
      pharmacy: {
        name: 'Heart Health Pharmacy',
        address: '654 Cardiac Lane, Health Plaza',
        phone: '+1-555-0305',
        rating: 4.8
      },
      price: {
        generic: 18.75,
        brand: 55.00,
        insurancePrice: 13.13,
        savings: 36.25
      },
      lastFilled: '2023-12-20',
      nextRefillDate: '2024-03-20',
      quantity: 90,
      remainingPills: 0,
      isFavorite: false,
      category: 'Cardiovascular'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setPrescriptions(mockPrescriptions);
      setFilteredPrescriptions(mockPrescriptions);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = prescriptions;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(prescription =>
        prescription.medicineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prescription.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prescription.prescribedBy.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (selectedStatus && selectedStatus !== 'all') {
      filtered = filtered.filter(prescription => prescription.status === selectedStatus);
    }

    // Apply tab filter
    if (activeTab && activeTab !== 'all') {
      switch (activeTab) {
        case 'active':
          filtered = filtered.filter(prescription => prescription.status === 'active');
          break;
        case 'expired':
          filtered = filtered.filter(prescription => prescription.status === 'expired');
          break;
        case 'completed':
          filtered = filtered.filter(prescription => prescription.status === 'completed');
          break;
        case 'favorites':
          filtered = filtered.filter(prescription => prescription.isFavorite);
          break;
        case 'refill':
          filtered = filtered.filter(prescription => 
            prescription.status === 'active' && prescription.refills > 0
          );
          break;
      }
    }

    // Apply sorting
    switch (sortBy) {
      case 'date':
        filtered.sort((a, b) => new Date(b.prescribedDate).getTime() - new Date(a.prescribedDate).getTime());
        break;
      case 'name':
        filtered.sort((a, b) => a.medicineName.localeCompare(b.medicineName));
        break;
      case 'doctor':
        filtered.sort((a, b) => a.prescribedBy.localeCompare(b.prescribedBy));
        break;
      case 'refills':
        filtered.sort((a, b) => b.refills - a.refills);
        break;
      case 'price':
        filtered.sort((a, b) => a.price.generic - b.price.generic);
        break;
    }

    setFilteredPrescriptions(filtered);
  }, [searchQuery, selectedStatus, activeTab, sortBy, prescriptions]);

  const toggleFavorite = (prescriptionId: number) => {
    setPrescriptions(prev => prev.map(prescription => 
      prescription.id === prescriptionId 
        ? { ...prescription, isFavorite: !prescription.isFavorite }
        : prescription
    ));
  };

  const handleRefill = (prescription: Prescription) => {
    // Handle prescription refill
    console.log('Ordering refill for prescription:', prescription.id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'expired':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'suspended':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRemainingPercentage = (prescription: Prescription) => {
    return Math.round((prescription.remainingPills / prescription.quantity) * 100);
  };

  const getRemainingColor = (percentage: number) => {
    if (percentage > 70) return 'text-green-600';
    if (percentage > 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-health-teal"></div>
          <p className="mt-4 text-gray-600">Loading prescriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-health-light-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header with Stats */}
        <div className="mb-8 rounded-2xl overflow-hidden shadow-xl">
          <div className="bg-gradient-to-r from-health-teal via-health-aqua to-health-aqua p-6 sm:p-8 relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">My Prescriptions</h1>
                  <p className="text-white/90 text-lg">Manage, refill, and track prescriptions with smart reminders</p>
                </div>
                <div className="mt-6 lg:mt-0 flex flex-wrap gap-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center min-w-[120px]">
                    <div className="text-2xl font-bold text-white">{prescriptions.length}</div>
                    <div className="text-white/80 text-sm">Total Prescriptions</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center min-w-[120px]">
                    <div className="text-2xl font-bold text-white">
                      {prescriptions.filter(p => p.status === 'active').length}
                    </div>
                    <div className="text-white/80 text-sm">Active</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center min-w-[120px]">
                    <div className="text-2xl font-bold text-white">
                      {prescriptions.filter(p => p.refills > 0).length}
                    </div>
                    <div className="text-white/80 text-sm">Refills Available</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search and Filters */}
        <Card className="mb-6 border-0 shadow-lg bg-white">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-health-aqua h-5 w-5" />
                  <Input
                    placeholder="Search prescriptions by medicine name, doctor, or pharmacy..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 border-health-blue-gray/30 focus:border-health-aqua focus:ring-health-aqua rounded-xl"
                  />
                </div>
              </div>

              {/* Advanced Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 h-12 px-6 border-health-blue-gray/30 text-health-charcoal hover:bg-health-aqua/10 rounded-xl"
              >
                <Filter className="h-4 w-4" />
                <span>Advanced Filters</span>
                {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 h-12 border-health-blue-gray/30 focus:border-health-aqua rounded-xl">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date Prescribed</SelectItem>
                  <SelectItem value="name">Medicine Name</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="refills">Refills Available</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="expiry">Expiry Date</SelectItem>
                </SelectContent>
              </Select>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-12 px-4 border-health-blue-gray/30 text-health-charcoal hover:bg-health-aqua/10 rounded-xl"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-12 px-4 border-health-blue-gray/30 text-health-charcoal hover:bg-health-aqua/10 rounded-xl"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Enhanced Advanced Filters */}
            {showFilters && (
              <div className="mt-6 p-6 bg-gradient-to-r from-health-light-gray to-health-light-gray/50 rounded-xl border border-health-blue-gray/20">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-health-charcoal mb-2 block">Status</label>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="border-health-blue-gray/30 focus:border-health-aqua rounded-lg">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-health-charcoal mb-2 block">Category</label>
                    <Select value="all" onValueChange={() => {}}>
                      <SelectTrigger className="border-health-blue-gray/30 focus:border-health-aqua rounded-lg">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="Antibiotics">Antibiotics</SelectItem>
                        <SelectItem value="Pain Relief">Pain Relief</SelectItem>
                        <SelectItem value="Vitamins">Vitamins</SelectItem>
                        <SelectItem value="Gastrointestinal">Gastrointestinal</SelectItem>
                        <SelectItem value="Cardiovascular">Cardiovascular</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-health-charcoal mb-2 block">Pharmacy</label>
                    <Select value="all" onValueChange={() => {}}>
                      <SelectTrigger className="border-health-blue-gray/30 focus:border-health-aqua rounded-lg">
                        <SelectValue placeholder="All Pharmacies" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Pharmacies</SelectItem>
                        <SelectItem value="city">City Pharmacy</SelectItem>
                        <SelectItem value="quick">Quick Pharmacy</SelectItem>
                        <SelectItem value="wellness">Wellness Pharmacy</SelectItem>
                        <SelectItem value="digestive">Digestive Care</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-health-charcoal mb-2 block">Date Range</label>
                    <Select value="all" onValueChange={() => {}}>
                      <SelectTrigger className="border-health-blue-gray/30 focus:border-health-aqua rounded-lg">
                        <SelectValue placeholder="All Time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="week">Last Week</SelectItem>
                        <SelectItem value="month">Last Month</SelectItem>
                        <SelectItem value="quarter">Last 3 Months</SelectItem>
                        <SelectItem value="year">Last Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowFilters(false)}
                    className="border-health-blue-gray/30 text-health-charcoal hover:bg-health-aqua/10"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Tabs with Counts */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-6 bg-white border border-health-blue-gray/20 rounded-xl shadow-sm">
            <TabsTrigger value="all" className="data-[state=active]:bg-health-aqua data-[state=active]:text-white data-[state=active]:border-health-aqua">
              <div className="flex items-center space-x-2">
                <span>All</span>
                <Badge variant="secondary" className="text-xs">{prescriptions.length}</Badge>
              </div>
            </TabsTrigger>
            <TabsTrigger value="active" className="data-[state=active]:bg-health-aqua data-[state=active]:text-white data-[state=active]:border-health-aqua">
              <div className="flex items-center space-x-2">
                <span>Active</span>
                <Badge variant="secondary" className="text-xs">{prescriptions.filter(p => p.status === 'active').length}</Badge>
              </div>
            </TabsTrigger>
            <TabsTrigger value="refill" className="data-[state=active]:bg-health-aqua data-[state=active]:text-white data-[state=active]:border-health-aqua">
              <div className="flex items-center space-x-2">
                <span>Ready for Refill</span>
                <Badge variant="secondary" className="text-xs">{prescriptions.filter(p => p.refills > 0).length}</Badge>
              </div>
            </TabsTrigger>
            <TabsTrigger value="expired" className="data-[state=active]:bg-health-aqua data-[state=active]:text-white data-[state=active]:border-health-aqua">
              <div className="flex items-center space-x-2">
                <span>Expired</span>
                <Badge variant="secondary" className="text-xs">{prescriptions.filter(p => p.status === 'expired').length}</Badge>
              </div>
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-health-aqua data-[state=active]:text-white data-[state=active]:border-health-aqua">
              <div className="flex items-center space-x-2">
                <span>Completed</span>
                <Badge variant="secondary" className="text-xs">{prescriptions.filter(p => p.status === 'completed').length}</Badge>
              </div>
            </TabsTrigger>
            <TabsTrigger value="favorites" className="data-[state=active]:bg-health-aqua data-[state=active]:text-white data-[state=active]:border-health-aqua">
              <div className="flex items-center space-x-2">
                <span>Favorites</span>
                <Badge variant="secondary" className="text-xs">{prescriptions.filter(p => p.isFavorite).length}</Badge>
              </div>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Results */}
        <div className="space-y-4">
          {filteredPrescriptions.length === 0 ? (
            <Card className="border-0 shadow-lg bg-white">
              <CardContent className="p-12 text-center">
                <div className="p-6 bg-gradient-to-br from-health-light-gray to-health-light-gray/50 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <FileText className="h-12 w-12 text-health-aqua" />
                </div>
                <h3 className="text-2xl font-bold text-health-charcoal mb-3">No prescriptions found</h3>
                <p className="text-health-blue-gray mb-6 max-w-md mx-auto">
                  We couldn't find any prescriptions matching your search criteria. Try adjusting your filters or search terms.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button 
                    onClick={() => setSearchQuery('')}
                    className="bg-health-aqua hover:bg-health-teal text-white"
                  >
                    Clear Search
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setShowFilters(false)}
                    className="border-health-blue-gray/30 text-health-charcoal hover:bg-health-aqua/10"
                  >
                    Reset Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Results Header with Bulk Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 p-4 bg-gradient-to-r from-health-light-gray to-health-light-gray/50 rounded-xl border border-health-blue-gray/20">
                <div className="flex items-center space-x-4">
                  <p className="text-sm font-medium text-health-charcoal">
                    Showing {filteredPrescriptions.length} of {prescriptions.length} prescriptions
                  </p>
                  <Badge variant="secondary" className="bg-health-aqua/10 text-health-charcoal">
                    {activeTab === 'all' ? 'All' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-health-blue-gray/30 text-health-charcoal hover:bg-health-aqua/10"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-health-blue-gray/30 text-health-charcoal hover:bg-health-aqua/10"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>

              {filteredPrescriptions.map((prescription) => (
                <Card key={prescription.id} className="hover:shadow-xl transition-all duration-300 border border-health-blue-gray/20 rounded-2xl bg-white group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="relative">
                          <div className="p-4 bg-gradient-to-br from-health-light-gray to-health-light-gray/50 rounded-xl ring-1 ring-health-blue-gray/20 overflow-hidden group-hover:ring-health-aqua/30 transition-all">
                            {prescription.prescriptionImage ? (
                              <img
                                src={prescription.prescriptionImage}
                                alt={prescription.medicineName}
                                className="h-14 w-14 object-cover rounded-lg"
                                loading="lazy"
                                onError={(e)=>{ (e.currentTarget as HTMLImageElement).style.display='none'; }}
                              />
                            ) : (
                              <FileText className="h-8 w-8 text-health-aqua" />
                            )}
                          </div>
                          {/* Status indicator */}
                          <div className="absolute -top-1 -right-1">
                            {getStatusIcon(prescription.status)}
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <h3 className="text-xl font-bold text-health-charcoal group-hover:text-health-aqua transition-colors">{prescription.medicineName}</h3>
                              <Badge variant="outline" className="border-health-blue-gray/30 text-health-charcoal">{prescription.dosage}</Badge>
                              <Badge className={getStatusColor(prescription.status)}>
                                {prescription.status}
                              </Badge>
                              <Badge className="bg-gradient-to-r from-chart-blue/10 to-chart-purple/10 text-chart-blue border-chart-blue/20">{prescription.category}</Badge>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleFavorite(prescription.id)}
                                className="hover:bg-rose-50 rounded-lg"
                              >
                                <Heart className={`h-4 w-4 ${prescription.isFavorite ? 'text-rose-500 fill-current' : 'text-health-blue-gray'}`} />
                              </Button>
                              <Button variant="ghost" size="sm" className="hover:bg-health-aqua/10 rounded-lg">
                                <Share2 className="h-4 w-4 text-health-blue-gray" />
                              </Button>
                              <Button variant="ghost" size="sm" className="hover:bg-health-aqua/10 rounded-lg">
                                <Edit className="h-4 w-4 text-health-blue-gray" />
                              </Button>
                            </div>
                          </div>

                          <p className="text-sm text-health-blue-gray mb-3">{prescription.genericName}</p>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div className="flex items-center space-x-2 p-2 bg-health-light-gray/50 rounded-lg">
                              <User className="h-4 w-4 text-health-aqua" />
                              <div>
                                <p className="text-xs text-health-aqua">Doctor</p>
                                <span className="text-sm font-medium text-health-charcoal">
                                  Dr. {prescription.prescribedBy.split(' ').slice(-1)[0]}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 p-2 bg-health-light-gray/50 rounded-lg">
                              <Clock className="h-4 w-4 text-health-aqua" />
                              <div>
                                <p className="text-xs text-health-aqua">Schedule</p>
                                <span className="text-sm font-medium text-health-charcoal">
                                  {prescription.frequency}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 p-2 bg-health-light-gray/50 rounded-lg">
                              <RefreshCw className="h-4 w-4 text-health-aqua" />
                              <div>
                                <p className="text-xs text-health-aqua">Refills</p>
                                <span className="text-sm font-medium text-health-charcoal">
                                  {prescription.refills} left
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 p-2 bg-health-light-gray/50 rounded-lg">
                              <DollarSign className="h-4 w-4 text-health-aqua" />
                              <div>
                                <p className="text-xs text-health-aqua">Price</p>
                                <div className="flex items-center space-x-1">
                                  <span className="text-sm font-bold text-health-aqua">
                                    ${prescription.price.generic}
                                  </span>
                                  {prescription.price.insurancePrice && (
                                    <Badge className="bg-chart-green/10 text-chart-green text-xs">Insurance</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Enhanced Progress Bar for Remaining Pills */}
                          <div className="mb-4 p-3 bg-gradient-to-r from-health-light-gray to-health-light-gray/50 rounded-lg border border-health-blue-gray/20">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-health-charcoal">Remaining Pills</span>
                              <span className={`text-sm font-bold ${getRemainingColor(getRemainingPercentage(prescription))}`}>
                                {prescription.remainingPills} / {prescription.quantity}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                              <div 
                                className={`h-3 rounded-full transition-all duration-500 ${
                                  getRemainingPercentage(prescription) > 70 ? 'bg-gradient-to-r from-chart-green to-chart-green' :
                                  getRemainingPercentage(prescription) > 30 ? 'bg-gradient-to-r from-chart-orange to-chart-orange' : 
                                  'bg-gradient-to-r from-chart-red to-chart-red'
                                }`}
                                style={{ width: `${getRemainingPercentage(prescription)}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs text-health-blue-gray mt-1">
                              <span>Low</span>
                              <span>Medium</span>
                              <span>High</span>
                            </div>
                          </div>

                          {/* Enhanced Pharmacy and Next Refill */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 border border-health-blue-gray/20 rounded-xl bg-gradient-to-r from-health-light-gray to-health-light-gray/50">
                              <div className="flex items-center space-x-3 mb-2">
                                {prescription.pharmacyLogo ? (
                                  <img src={prescription.pharmacyLogo} alt={prescription.pharmacy.name} className="h-6 w-6 rounded-lg object-cover ring-1 ring-health-blue-gray/20" loading="lazy" />
                                ) : (
                                  <div className="p-2 bg-health-aqua/20 rounded-lg">
                                    <MapPin className="h-4 w-4 text-health-aqua" />
                                  </div>
                                )}
                                <div className="flex-1">
                                  <span className="text-sm font-semibold text-health-charcoal">{prescription.pharmacy.name}</span>
                                  <div className="flex items-center space-x-1 mt-1">
                                    <Star className="h-3 w-3 text-chart-orange" />
                                    <span className="text-xs font-medium text-health-blue-gray">{prescription.pharmacy.rating}</span>
                                  </div>
                                </div>
                              </div>
                              <p className="text-xs text-health-blue-gray">{prescription.pharmacy.address}</p>
                            </div>
                            <div className="p-4 border border-chart-blue/20 rounded-xl bg-gradient-to-r from-chart-blue/5 to-chart-purple/5">
                              <div className="flex items-center space-x-3 mb-2">
                                <div className="p-2 bg-chart-blue/20 rounded-lg">
                                  <Calendar className="h-4 w-4 text-chart-blue" />
                                </div>
                                <div>
                                  <span className="text-sm font-semibold text-chart-blue">Next Refill</span>
                                  <p className="text-xs text-chart-blue/80 mt-1">{prescription.nextRefillDate}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-3 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedPrescription(prescription);
                            setShowPrescriptionDialog(true);
                          }}
                          className="border-health-blue-gray/30 text-health-charcoal hover:bg-health-aqua/10 rounded-lg h-10"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => handleRefill(prescription)}
                          disabled={prescription.status !== 'active' || prescription.refills === 0}
                          className="bg-health-aqua hover:bg-health-teal text-white rounded-lg h-10 disabled:opacity-50"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Order Refill
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-chart-blue/30 text-chart-blue hover:bg-chart-blue/10 rounded-lg h-10"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Quick Order
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-health-blue-gray hover:text-health-aqua hover:bg-health-aqua/10 rounded-lg h-8"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>

        {/* Prescription Details Dialog */}
        <Dialog open={showPrescriptionDialog} onOpenChange={setShowPrescriptionDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border-health-blue-gray/20">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2 text-health-charcoal">
                <FileText className="h-5 w-5 text-health-aqua" />
                <span>Prescription Details</span>
              </DialogTitle>
            </DialogHeader>
            {selectedPrescription && (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start space-x-4">
                  <div className="p-4 bg-health-light-gray rounded-xl ring-1 ring-health-blue-gray/20">
                    <FileText className="h-10 w-10 text-health-aqua" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-2xl font-bold text-health-charcoal">{selectedPrescription.medicineName}</h3>
                      <Badge variant="outline" className="border-health-blue-gray/30 text-health-charcoal">{selectedPrescription.dosage}</Badge>
                      <Badge className={getStatusColor(selectedPrescription.status)}>
                        {selectedPrescription.status}
                      </Badge>
                    </div>
                    <p className="text-health-blue-gray mb-2">{selectedPrescription.genericName}</p>
                    <p className="text-sm text-health-blue-gray">{selectedPrescription.instructions}</p>
                  </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 bg-white border border-health-blue-gray/20 rounded-xl">
                    <TabsTrigger value="details" className="data-[state=active]:bg-health-aqua data-[state=active]:text-white">Details</TabsTrigger>
                    <TabsTrigger value="pricing" className="data-[state=active]:bg-health-aqua data-[state=active]:text-white">Pricing</TabsTrigger>
                    <TabsTrigger value="safety" className="data-[state=active]:bg-health-aqua data-[state=active]:text-white">Safety</TabsTrigger>
                    <TabsTrigger value="history" className="data-[state=active]:bg-health-aqua data-[state=active]:text-white">History</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 border border-health-blue-gray/20 rounded-xl bg-health-light-gray/30">
                        <div className="flex items-center space-x-2 mb-2">
                          <User className="h-4 w-4 text-health-aqua" />
                          <p className="text-sm font-medium text-health-charcoal">Prescribed By</p>
                        </div>
                        <p className="font-semibold text-health-charcoal">{selectedPrescription.prescribedBy}</p>
                      </div>
                      <div className="p-4 border border-health-blue-gray/20 rounded-xl bg-health-light-gray/30">
                        <div className="flex items-center space-x-2 mb-2">
                          <Calendar className="h-4 w-4 text-health-aqua" />
                          <p className="text-sm font-medium text-health-charcoal">Prescribed Date</p>
                        </div>
                        <p className="font-semibold text-health-charcoal">{selectedPrescription.prescribedDate}</p>
                      </div>
                      <div className="p-4 border border-health-blue-gray/20 rounded-xl bg-health-light-gray/30">
                        <div className="flex items-center space-x-2 mb-2">
                          <Clock className="h-4 w-4 text-health-aqua" />
                          <p className="text-sm font-medium text-health-charcoal">Frequency</p>
                        </div>
                        <p className="font-semibold text-health-charcoal">{selectedPrescription.frequency}</p>
                      </div>
                      <div className="p-4 border border-health-blue-gray/20 rounded-xl bg-health-light-gray/30">
                        <div className="flex items-center space-x-2 mb-2">
                          <Calendar className="h-4 w-4 text-health-aqua" />
                          <p className="text-sm font-medium text-health-charcoal">Duration</p>
                        </div>
                        <p className="font-semibold text-health-charcoal">{selectedPrescription.duration}</p>
                      </div>
                      <div className="p-4 border border-health-blue-gray/20 rounded-xl bg-health-light-gray/30">
                        <div className="flex items-center space-x-2 mb-2">
                          <RefreshCw className="h-4 w-4 text-health-aqua" />
                          <p className="text-sm font-medium text-health-charcoal">Refills Available</p>
                        </div>
                        <p className="font-semibold text-health-charcoal">{selectedPrescription.refills}</p>
                      </div>
                      <div className="p-4 border border-health-blue-gray/20 rounded-xl bg-health-light-gray/30">
                        <div className="flex items-center space-x-2 mb-2">
                          <Calendar className="h-4 w-4 text-health-aqua" />
                          <p className="text-sm font-medium text-health-charcoal">Next Refill Date</p>
                        </div>
                        <p className="font-semibold text-health-charcoal">{selectedPrescription.nextRefillDate}</p>
                      </div>
                    </div>

                    {selectedPrescription.notes && (
                      <div className="p-4 border border-health-blue-gray/20 rounded-xl bg-health-light-gray/30">
                        <div className="flex items-center space-x-2 mb-2">
                          <FileText className="h-4 w-4 text-health-aqua" />
                          <h4 className="font-semibold text-health-charcoal">Notes</h4>
                        </div>
                        <p className="text-sm text-health-blue-gray">{selectedPrescription.notes}</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="pricing" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-6 border border-health-aqua/30 rounded-xl bg-gradient-to-br from-health-light-gray to-health-aqua/10 ring-1 ring-health-aqua/20">
                        <div className="flex items-center space-x-2 mb-3">
                          <DollarSign className="h-5 w-5 text-health-aqua" />
                          <h4 className="font-semibold text-health-charcoal">Generic</h4>
                        </div>
                        <p className="text-3xl font-bold text-health-aqua mb-1">${selectedPrescription.price.generic}</p>
                        <Badge className="bg-health-aqua/20 text-health-charcoal">Best Value</Badge>
                      </div>
                      <div className="p-6 border border-health-blue-gray/20 rounded-xl bg-health-light-gray/30">
                        <div className="flex items-center space-x-2 mb-3">
                          <DollarSign className="h-5 w-5 text-health-blue-gray" />
                          <h4 className="font-semibold text-health-charcoal">Brand</h4>
                        </div>
                        <p className="text-3xl font-bold text-health-blue-gray mb-1">${selectedPrescription.price.brand}</p>
                        <Badge variant="outline" className="text-health-blue-gray">Original</Badge>
                      </div>
                      {selectedPrescription.price.insurancePrice && (
                        <div className="p-6 border border-chart-blue/30 rounded-xl bg-gradient-to-br from-chart-blue/5 to-chart-blue/10 ring-1 ring-chart-blue/20">
                          <div className="flex items-center space-x-2 mb-3">
                            <Shield className="h-5 w-5 text-chart-blue" />
                            <h4 className="font-semibold text-chart-blue">With Insurance</h4>
                          </div>
                          <p className="text-3xl font-bold text-chart-blue mb-1">${selectedPrescription.price.insurancePrice}</p>
                          <Badge className="bg-chart-blue/20 text-chart-blue">Covered</Badge>
                        </div>
                      )}
                    </div>

                    <div className="p-6 bg-gradient-to-r from-health-light-gray to-health-aqua/10 rounded-xl border border-health-aqua/20 ring-1 ring-health-aqua/20">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 bg-health-aqua/20 rounded-lg">
                          <DollarSign className="h-5 w-5 text-health-aqua" />
                        </div>
                        <div>
                          <span className="text-lg font-bold text-health-charcoal">You Save ${selectedPrescription.price.savings}</span>
                          <p className="text-sm text-health-blue-gray">Choose generic to save money</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border border-health-blue-gray/20 rounded-xl bg-health-light-gray/30">
                      <div className="flex items-center space-x-2 mb-3">
                        <MapPin className="h-5 w-5 text-health-aqua" />
                        <h4 className="font-semibold text-health-charcoal">Pharmacy Information</h4>
                      </div>
                      <div className="p-4 border border-health-blue-gray/20 rounded-lg bg-white">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-health-charcoal">{selectedPrescription.pharmacy.name}</h5>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-chart-orange" />
                            <span className="text-sm font-medium">{selectedPrescription.pharmacy.rating}</span>
                          </div>
                        </div>
                        <p className="text-sm text-health-blue-gray mb-1">{selectedPrescription.pharmacy.address}</p>
                        <p className="text-sm text-health-blue-gray">{selectedPrescription.pharmacy.phone}</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="safety" className="space-y-4">
                    <div className="p-4 border border-red-200 rounded-xl bg-red-50/30">
                      <div className="flex items-center space-x-2 mb-3">
                        <AlertTriangle className="h-5 w-5 text-red-700" />
                        <h4 className="font-semibold text-red-800">Side Effects</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedPrescription.sideEffects.map((effect, index) => (
                          <Badge key={index} className="bg-red-100 text-red-800 border-red-200">
                            {effect}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 border border-yellow-200 rounded-xl bg-yellow-50/30">
                      <div className="flex items-center space-x-2 mb-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-700" />
                        <h4 className="font-semibold text-yellow-800">Drug Interactions</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedPrescription.interactions.map((interaction, index) => (
                          <Badge key={index} className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            {interaction}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200 ring-1 ring-amber-200">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-amber-200 rounded-lg flex-shrink-0">
                          <AlertTriangle className="h-5 w-5 text-amber-700" />
                        </div>
                        <div>
                          <span className="font-semibold text-amber-800 block mb-2">Important Safety Information</span>
                          <p className="text-sm text-amber-700">
                            Always consult with your healthcare provider before taking any medication. 
                            This information is for educational purposes only.
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="history" className="space-y-4">
                    <div className="space-y-4">
                      <div className="p-6 border border-emerald-200 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 ring-1 ring-emerald-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <div className="p-2 bg-emerald-200 rounded-lg">
                              <CheckCircle className="h-5 w-5 text-emerald-700" />
                            </div>
                            <h4 className="font-semibold text-emerald-800">Last Filled</h4>
                          </div>
                          <Badge className="bg-emerald-200 text-emerald-800">Completed</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-emerald-700" />
                            <div>
                              <p className="text-xs text-emerald-600">Date</p>
                              <p className="text-sm font-medium text-gray-900">{selectedPrescription.lastFilled}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Package className="h-4 w-4 text-emerald-700" />
                            <div>
                              <p className="text-xs text-emerald-600">Quantity</p>
                              <p className="text-sm font-medium text-gray-900">{selectedPrescription.quantity}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-emerald-700" />
                            <div>
                              <p className="text-xs text-emerald-600">Pharmacy</p>
                              <p className="text-sm font-medium text-gray-900">{selectedPrescription.pharmacy.name}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6 border border-blue-200 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 ring-1 ring-blue-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <div className="p-2 bg-blue-200 rounded-lg">
                              <FileText className="h-5 w-5 text-blue-700" />
                            </div>
                            <h4 className="font-semibold text-blue-800">Prescription Created</h4>
                          </div>
                          <Badge className="bg-blue-200 text-blue-800">Active</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-blue-700" />
                            <div>
                              <p className="text-xs text-blue-600">Date</p>
                              <p className="text-sm font-medium text-gray-900">{selectedPrescription.prescribedDate}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-blue-700" />
                            <div>
                              <p className="text-xs text-blue-600">Doctor</p>
                              <p className="text-sm font-medium text-gray-900">{selectedPrescription.prescribedBy}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-blue-700" />
                            <div>
                              <p className="text-xs text-blue-600">Duration</p>
                              <p className="text-sm font-medium text-gray-900">{selectedPrescription.duration}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex space-x-2 pt-4 border-t border-health-blue-gray/20">
                  <Button className="flex-1 bg-health-aqua hover:bg-health-teal text-white">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Order Refill
                  </Button>
                  <Button variant="outline" className="flex-1 border-health-blue-gray/30 text-health-charcoal hover:bg-health-aqua/10">
                    <Download className="h-4 w-4 mr-2" />
                    Download Prescription
                  </Button>
                  <Button variant="outline" className="flex-1 border-health-blue-gray/30 text-health-charcoal hover:bg-health-aqua/10">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact Doctor
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MyPrescriptions; 