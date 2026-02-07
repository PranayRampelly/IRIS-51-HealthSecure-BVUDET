import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Search, Filter, Star, MapPin, Phone, Calendar, Clock, User,
  Bed, Eye, ChevronDown, ChevronUp, ArrowRight, Info, Plus, Minus,
  PhoneCall, Mail, MessageSquare, Navigation, Route, Timer, RefreshCw,
  Bell, Award, CheckCircle, Building2, Shield, Zap, Target, TrendingUp,
  Users, FileText, Video, Globe, Clock3, ShieldCheck, GraduationCap,
  BookOpen, Microscope, Pill, Activity, AlertTriangle, CheckSquare
} from 'lucide-react';

interface BedData {
  id: number;
  hospitalName: string;
  location: string;
  bedType: string;
  price: number;
  rating: number;
  reviews: number;
  availableBeds: number;
  totalBeds: number;
  waitingTime: string;
  amenities: string[];
  services: string[];
  contactNumber: string;
  email: string;
  website: string;
  description: string;
  specialties: string[];
  emergencyAvailable: boolean;
  insuranceAccepted: boolean;
  coordinates: { lat: number; lng: number };
}

const BedAvailability: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBedType, setSelectedBedType] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [selectedRating, setSelectedRating] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mock data
  const mockBedData: BedData[] = [
    {
      id: 1,
      hospitalName: 'City General Hospital',
      location: 'Mumbai, Maharashtra',
      bedType: 'General Ward',
      price: 2500,
      rating: 4.5,
      reviews: 1247,
      availableBeds: 12,
      totalBeds: 50,
      waitingTime: '2-3 hours',
      amenities: ['24/7 Nursing', 'AC', 'TV', 'WiFi', 'Food Service'],
      services: ['Emergency Care', 'Pharmacy', 'Lab Services', 'Radiology', 'Physiotherapy'],
      contactNumber: '+91 98765 43210',
      email: 'info@citygeneral.com',
      website: 'www.citygeneral.com',
      description: 'Modern hospital with state-of-the-art facilities',
      specialties: ['Cardiology', 'Neurology', 'Orthopedics'],
      emergencyAvailable: true,
      insuranceAccepted: true,
      coordinates: { lat: 19.0760, lng: 72.8777 }
    },
    {
      id: 2,
      hospitalName: 'Metro Medical Center',
      location: 'Delhi, NCR',
      bedType: 'Semi-Private',
      price: 4500,
      rating: 4.8,
      reviews: 2156,
      availableBeds: 8,
      totalBeds: 30,
      waitingTime: '1-2 hours',
      amenities: ['Private Bathroom', 'AC', 'TV', 'WiFi', 'Room Service'],
      services: ['Cardiac Surgery', 'Cancer Treatment', 'Pediatric Care', 'Diagnostic Imaging', 'Blood Bank'],
      contactNumber: '+91 98765 43211',
      email: 'info@metromedical.com',
      website: 'www.metromedical.com',
      description: 'Premium healthcare facility with personalized care',
      specialties: ['Cardiology', 'Oncology', 'Pediatrics'],
      emergencyAvailable: true,
      insuranceAccepted: true,
      coordinates: { lat: 28.7041, lng: 77.1025 }
    },
    {
      id: 3,
      hospitalName: 'Community Health Hospital',
      location: 'Bangalore, Karnataka',
      bedType: 'ICU',
      price: 8500,
      rating: 4.7,
      reviews: 892,
      availableBeds: 3,
      totalBeds: 15,
      waitingTime: 'Immediate',
      amenities: ['Ventilator', 'Monitoring', '24/7 Doctor', 'AC', 'Private Room'],
      services: ['Critical Care', 'Ventilator Support', 'Dialysis', 'Trauma Care', 'Emergency Surgery'],
      contactNumber: '+91 98765 43212',
      email: 'info@communityhealth.com',
      website: 'www.communityhealth.com',
      description: 'Specialized ICU care with advanced medical equipment',
      specialties: ['Critical Care', 'Cardiology', 'Neurology'],
      emergencyAvailable: true,
      insuranceAccepted: true,
      coordinates: { lat: 12.9716, lng: 77.5946 }
    },
    {
      id: 4,
      hospitalName: 'Regional Medical Center',
      location: 'Chennai, Tamil Nadu',
      bedType: 'Private Room',
      price: 6500,
      rating: 4.6,
      reviews: 1534,
      availableBeds: 5,
      totalBeds: 25,
      waitingTime: '30 minutes',
      amenities: ['Private Bathroom', 'AC', 'TV', 'WiFi', 'Room Service', 'Balcony'],
      services: ['General Surgery', 'Maternity Care', 'Endoscopy', 'Ultrasound', 'Pathology Lab'],
      contactNumber: '+91 98765 43213',
      email: 'info@regionalmedical.com',
      website: 'www.regionalmedical.com',
      description: 'Luxury private rooms with premium amenities',
      specialties: ['General Medicine', 'Surgery', 'Gynecology'],
      emergencyAvailable: true,
      insuranceAccepted: true,
      coordinates: { lat: 13.0827, lng: 80.2707 }
    },
    {
      id: 5,
      hospitalName: 'Specialty Care Hospital',
      location: 'Hyderabad, Telangana',
      bedType: 'General Ward',
      price: 1800,
      rating: 4.3,
      reviews: 678,
      availableBeds: 20,
      totalBeds: 60,
      waitingTime: '4-5 hours',
      amenities: ['24/7 Nursing', 'AC', 'TV', 'WiFi'],
      services: ['General Medicine', 'Dental Care', 'Eye Care', 'ENT', 'Dermatology'],
      contactNumber: '+91 98765 43214',
      email: 'info@specialtycare.com',
      website: 'www.specialtycare.com',
      description: 'Affordable healthcare with quality medical services',
      specialties: ['Orthopedics', 'Dermatology', 'ENT'],
      emergencyAvailable: true,
      insuranceAccepted: false,
      coordinates: { lat: 17.3850, lng: 78.4867 }
    }
  ];

  const [beds, setBeds] = useState<BedData[]>([]);
  const [filters, setFilters] = useState<any>({});

  // Fetch bed availability data from API
  const fetchBedAvailability = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      if (searchQuery) params.append('city', searchQuery);
      if (selectedBedType !== 'all') params.append('bedType', selectedBedType);
      if (selectedLocation !== 'all') params.append('state', selectedLocation);
      if (selectedPriceRange !== 'all') params.append('priceRange', selectedPriceRange);
      if (selectedRating !== 'all') params.append('rating', selectedRating);
      params.append('sortBy', sortBy);

      const response = await axios.get(`/api/patient/bed-availability?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // Transform API data to match our interface
        const transformedData: BedData[] = response.data.data.hospitals.flatMap((hospital: any) => 
          hospital.bedAvailability.bedsByType.flatMap((bedType: any) => 
            bedType.beds.map((bed: any) => ({
              id: bed.bedId,
              hospitalName: hospital.hospitalName,
              location: `${hospital.location.city}, ${hospital.location.state}`,
              bedType: bedType.type,
              price: bed.price,
              rating: hospital.rating,
              reviews: hospital.reviews,
              availableBeds: bedType.count,
              totalBeds: hospital.bedAvailability.totalBeds,
              waitingTime: bedType.count > 5 ? 'Immediate' : bedType.count > 2 ? '1-2 hours' : '2-4 hours',
              amenities: hospital.facilities || [],
              services: hospital.services || [],
              contactNumber: hospital.contact.phone,
              email: hospital.contact.email || '',
              website: hospital.contact.website || '',
              description: hospital.description || '',
              specialties: hospital.specialties || [],
              emergencyAvailable: hospital.realTimeData?.availabilityStatus === 'Available',
              insuranceAccepted: hospital.insuranceAccepted?.length > 0,
              coordinates: {
                lat: hospital.location.coordinates?.lat || 0,
                lng: hospital.location.coordinates?.lng || 0
              }
            }))
          )
        );
        
        if (transformedData.length > 0) {
          setBeds(transformedData);
        } else {
          console.log('No bed data available yet. Using mock data as fallback.');
          setBeds(mockBedData);
        }
      }
          } catch (error) {
        console.error('Error fetching bed availability:', error);
        // Fallback to mock data if API fails
        setBeds(mockBedData);
        // Show user-friendly error message
        if (error.response?.status === 401) {
          alert('Please login to view bed availability');
        } else if (error.response?.status === 500) {
          alert('Server error. Using sample data for demonstration.');
        } else {
          alert('Network error. Using sample data for demonstration.');
        }
      } finally {
        setLoading(false);
      }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchBedAvailability();
  }, [searchQuery, selectedBedType, selectedLocation, selectedPriceRange, selectedRating, sortBy]);

  // Filter and sort beds
  const sortedBeds = useMemo(() => {
    let filtered = beds.filter(bed => {
      const matchesSearch = bed.hospitalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           bed.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBedType = selectedBedType === 'all' || bed.bedType === selectedBedType;
      const matchesLocation = selectedLocation === 'all' || bed.location.includes(selectedLocation);
      const matchesPrice = selectedPriceRange === 'all' || 
        (selectedPriceRange === 'low' && bed.price <= 3000) ||
        (selectedPriceRange === 'medium' && bed.price > 3000 && bed.price <= 6000) ||
        (selectedPriceRange === 'high' && bed.price > 6000);
      const matchesRating = selectedRating === 'all' || 
        (selectedRating === '4+' && bed.rating >= 4) ||
        (selectedRating === '3+' && bed.rating >= 3);

      return matchesSearch && matchesBedType && matchesLocation && matchesPrice && matchesRating;
    });

    // Sort beds
    switch (sortBy) {
      case 'price':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'availability':
        filtered.sort((a, b) => b.availableBeds - a.availableBeds);
        break;
      case 'waitTime':
        filtered.sort((a, b) => {
          const aTime = parseInt(a.waitingTime.split(' ')[0]);
          const bTime = parseInt(b.waitingTime.split(' ')[0]);
          return aTime - bTime;
        });
        break;
      default:
        break;
    }

    return filtered;
  }, [beds, searchQuery, selectedBedType, selectedLocation, selectedPriceRange, selectedRating, sortBy]);

  const handleBookBed = async (bed: BedData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`/api/patient/bed-availability/${bed.id}/book`, {
        admissionType: 'planned',
        department: 'General Medicine',
        primaryDiagnosis: 'General consultation',
        expectedStay: '2-3 days',
        emergencyContact: '+91 9876543210',
        specialRequirements: 'None',
        insuranceProvider: 'General Insurance',
        policyNumber: 'POL123456'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        alert('Bed booking request submitted successfully! You will be contacted by the hospital soon.');
        // Refresh the data
        fetchBedAvailability();
      }
    } catch (error) {
      console.error('Error booking bed:', error);
      alert('Failed to book bed. Please try again.');
    }
  };

  const handleViewDetails = (bed: BedData) => {
    navigate(`/patient/hospital/${bed.id}`, { state: { hospital: bed } });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const getAvailabilityBadge = (available: number, total: number) => {
    const percentage = (available / total) * 100;
    if (percentage >= 50) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">High Availability</Badge>;
    } else if (percentage >= 20) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Limited</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800 border-red-200">Low Availability</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-[calc(100vh-80px)] px-2 md:px-6 py-8 bg-health-light-gray max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-health-aqua"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-80px)] px-2 md:px-6 py-8 bg-health-light-gray max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-emerald-900 via-teal-800 to-teal-700 rounded-2xl overflow-hidden">
          <div className="p-6 sm:p-8">
            <h1 className="text-3xl font-montserrat font-bold text-white mb-2">Bed Availability</h1>
            <p className="text-teal-100">Find and book hospital beds across the country</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-lg rounded-xl border-0">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-health-aqua/10 rounded-lg">
                <Bed className="h-6 w-6 text-health-aqua" />
              </div>
              <div>
                <p className="text-2xl font-bold text-health-charcoal">{beds.reduce((sum, bed) => sum + bed.availableBeds, 0)}</p>
                <p className="text-sm text-health-charcoal/60">Available Beds</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg rounded-xl border-0">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-health-teal/10 rounded-lg">
                <Building2 className="h-6 w-6 text-health-teal" />
              </div>
              <div>
                <p className="text-2xl font-bold text-health-charcoal">{beds.length}</p>
                <p className="text-sm text-health-charcoal/60">Hospitals</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg rounded-xl border-0">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-health-charcoal">{beds.filter(bed => bed.emergencyAvailable).length}</p>
                <p className="text-sm text-health-charcoal/60">Emergency Ready</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg rounded-xl border-0">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Shield className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-health-charcoal">{beds.filter(bed => bed.insuranceAccepted).length}</p>
                <p className="text-sm text-health-charcoal/60">Insurance Accepted</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="shadow-lg rounded-xl border-0 mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-health-charcoal/40 h-4 w-4" />
                <Input
                  placeholder="Search hospitals by name or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-health-charcoal/20 focus:border-health-aqua"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 border-health-charcoal/20 hover:border-health-aqua"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48 border-health-charcoal/20">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="price">Lowest Price</SelectItem>
                <SelectItem value="availability">Most Available</SelectItem>
                <SelectItem value="waitTime">Shortest Wait</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
            <div className="flex border border-health-charcoal/20 rounded-lg overflow-hidden">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={`${viewMode === 'grid' ? 'bg-health-aqua text-white' : 'text-health-charcoal'}`}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={`${viewMode === 'list' ? 'bg-health-aqua text-white' : 'text-health-charcoal'}`}
              >
                List
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-health-charcoal mb-2 block">Bed Type</label>
                <Select value={selectedBedType} onValueChange={setSelectedBedType}>
                  <SelectTrigger className="border-health-charcoal/20">
                    <SelectValue placeholder="All Bed Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Bed Types</SelectItem>
                    <SelectItem value="General Ward">General Ward</SelectItem>
                    <SelectItem value="Semi-Private">Semi-Private</SelectItem>
                    <SelectItem value="Private Room">Private Room</SelectItem>
                    <SelectItem value="ICU">ICU</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-health-charcoal mb-2 block">Location</label>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="border-health-charcoal/20">
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="Mumbai">Mumbai</SelectItem>
                    <SelectItem value="Delhi">Delhi</SelectItem>
                    <SelectItem value="Bangalore">Bangalore</SelectItem>
                    <SelectItem value="Chennai">Chennai</SelectItem>
                    <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-health-charcoal mb-2 block">Price Range</label>
                <Select value={selectedPriceRange} onValueChange={setSelectedPriceRange}>
                  <SelectTrigger className="border-health-charcoal/20">
                    <SelectValue placeholder="All Prices" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="low">Under ₹3,000</SelectItem>
                    <SelectItem value="medium">₹3,000 - ₹6,000</SelectItem>
                    <SelectItem value="high">Over ₹6,000</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-health-charcoal mb-2 block">Rating</label>
                <Select value={selectedRating} onValueChange={setSelectedRating}>
                  <SelectTrigger className="border-health-charcoal/20">
                    <SelectValue placeholder="All Ratings" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ratings</SelectItem>
                    <SelectItem value="4+">4+ Stars</SelectItem>
                    <SelectItem value="3+">3+ Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-health-charcoal/60">
          Showing {sortedBeds.length} of {beds.length} hospitals
        </p>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="border-health-charcoal/20">
            <MapPin className="h-4 w-4 mr-1" />
            Map View
          </Button>
          <Button variant="outline" size="sm" className="border-health-charcoal/20">
            <ArrowRight className="h-4 w-4 mr-1" />
            Compare
          </Button>
        </div>
      </div>

      {/* Beds Grid/List */}
      <div>
        {sortedBeds.length > 0 && (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
            {sortedBeds.map((bed) => (
              <Card key={bed.id} className="group hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm border-health-blue-gray/20">
                <CardContent className="p-0">
                  {/* Hospital Image/Header */}
                  <div className="relative h-48 bg-gradient-to-br from-health-aqua/20 to-health-teal/20 rounded-t-xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    <div className="absolute top-4 right-4">
                      {getAvailabilityBadge(bed.availableBeds, bed.totalBeds)}
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-health-aqua transition-colors">
                        {bed.hospitalName}
                      </h3>
                      <div className="flex items-center gap-1 text-white/90">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{bed.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    {/* Price and Rating */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold text-health-aqua">₹{(bed.price || 0).toLocaleString()}</div>
                        <div className="text-sm text-health-charcoal/60">per day</div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          {renderStars(bed.rating)}
                        </div>
                        <div className="text-sm text-health-charcoal/60">({bed.rating}) • {bed.reviews} reviews</div>
                      </div>
                    </div>

                    {/* Bed Details */}
                    <div className="grid grid-cols-2 gap-4 py-3 border-t border-b border-health-charcoal/10">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-health-aqua/10 rounded-lg">
                          <Bed className="h-4 w-4 text-health-aqua" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-health-charcoal">{bed.bedType}</div>
                          <div className="text-xs text-health-charcoal/60">Room Type</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-health-teal/10 rounded-lg">
                          <Clock className="h-4 w-4 text-health-teal" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-health-charcoal">{bed.waitingTime}</div>
                          <div className="text-xs text-health-charcoal/60">Wait Time</div>
                        </div>
                      </div>
                    </div>

                    {/* Hospital Features */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-health-charcoal">Available Services</h4>
                      <div className="flex flex-wrap gap-2">
                        {bed.services?.slice(0, 3).map((service, index) => (
                          <span key={index} className="px-2 py-1 bg-health-blue-gray/10 text-xs text-health-charcoal rounded-full">
                            {service}
                          </span>
                        ))}
                        {bed.services && bed.services.length > 3 && (
                          <span className="px-2 py-1 bg-health-charcoal/10 text-xs text-health-charcoal rounded-full">
                            +{bed.services.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Insurance and Contact */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${bed.insuranceAccepted ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-health-charcoal/70">
                          {bed.insuranceAccepted ? 'Insurance Accepted' : 'Cash Only'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-health-aqua">
                        <Phone className="h-3 w-3" />
                        <span className="text-xs">Call Now</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        className="flex-1 bg-gradient-to-r from-health-aqua to-health-teal hover:from-health-teal hover:to-health-aqua text-white"
                        onClick={() => handleBookBed(bed)}
                      >
                        <Bed className="h-4 w-4 mr-2" />
                        Book Now
                      </Button>
                      <Button 
                        variant="outline"
                        className="flex-1 border-health-aqua/30 text-health-aqua hover:bg-health-aqua/5"
                        onClick={() => handleViewDetails(bed)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {sortedBeds.length === 0 && (
          <Card className="text-center py-12 bg-white/80 backdrop-blur-sm border-health-blue-gray/20">
            <CardContent>
              <Bed className="h-16 w-16 text-health-charcoal/40 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-health-charcoal mb-2">No beds available</h3>
              <p className="text-health-charcoal/60 mb-4">Try adjusting your search criteria or check back later.</p>
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedBedType('all');
                  setSelectedLocation('all');
                  setSelectedPriceRange('all');
                  setSelectedRating('all');
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BedAvailability;
