import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Hospital, Search, Filter, Star, MapPin, Phone, Calendar, Clock,
  Users, Bed, Stethoscope, Heart, Brain, Eye, Baby, Shield,
  ChevronDown, ChevronUp, AlertTriangle, CheckCircle, XCircle,
  ArrowRight, Info, Plus, Minus, Mail, MessageSquare, Navigation,
  Route, Timer, Bell, BellOff, Award, Zap, Activity, TrendingUp,
  Globe, Wifi, Car, Ambulance, Cross, Pill, Microscope, Scan,
  RefreshCw, Settings
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import hospitalServicesService, { Hospital as HospitalType } from '@/services/hospitalServicesService';
import { brandColors } from '@/config/colors';

const HospitalDirectory = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHospital, setSelectedHospital] = useState<HospitalType | null>(null);
  const [showHospitalDialog, setShowHospitalDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('distance');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [hospitals, setHospitals] = useState<HospitalType[]>([]);
  const [filteredHospitals, setFilteredHospitals] = useState<HospitalType[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });



  // Enhanced filters
  const [selectedRating, setSelectedRating] = useState('all');
  const [selectedDistance, setSelectedDistance] = useState('all');
  const [selectedAvailability, setSelectedAvailability] = useState('all');
  const [selectedInsurance, setSelectedInsurance] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [wsConnected, setWsConnected] = useState(false);

  // Fetch hospitals data
  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchQuery || undefined,
        type: selectedType !== 'all' ? selectedType : undefined,
        specialty: selectedSpecialty !== 'all' ? selectedSpecialty : undefined,
        rating: selectedRating !== 'all' ? parseFloat(selectedRating) : undefined,
        distance: selectedDistance !== 'all' ? parseFloat(selectedDistance) : undefined,
        availability: selectedAvailability !== 'all' ? selectedAvailability : undefined,
        insurance: selectedInsurance !== 'all' ? selectedInsurance : undefined,
        sortBy,
        page: pagination.page,
        limit: pagination.limit
      };

      const response = await hospitalServicesService.getHospitalDirectory(params);

      setHospitals(response.hospitals);
      setFilteredHospitals(response.hospitals);
      setPagination(response.pagination);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      console.error('Error details:', error.response?.data);
      toast.error('Failed to fetch hospitals');
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchHospitals();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, searchQuery, selectedType, selectedSpecialty, selectedRating, selectedDistance, selectedAvailability, selectedInsurance, sortBy, pagination.page]);

  // Initial data fetch and real-time setup
  useEffect(() => {
    fetchHospitals();
    
    // Set up real-time updates
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');
    
    if (token && userId && userRole) {
      // Initialize real-time service for hospital updates
      import('@/services/realtimeService').then(({ default: realtimeService }) => {
                  realtimeService.initialize(token, userId, userRole).then(() => {
            console.log('Real-time service initialized for hospital directory');
            setWsConnected(true);
            
            // Listen for hospital updates
            realtimeService.onMessage('hospital:update', (data) => {
              console.log('Hospital update received:', data);
              fetchHospitals(); // Refresh data when updates come in
            });
            
            realtimeService.onMessage('hospital:bed-status', (data) => {
              console.log('Bed status update received:', data);
              fetchHospitals(); // Refresh data when bed status changes
            });
            
            realtimeService.onMessage('hospital:availability', (data) => {
              console.log('Availability update received:', data);
              fetchHospitals(); // Refresh data when availability changes
            });
          }).catch((error) => {
            console.error('Failed to initialize real-time service:', error);
            setWsConnected(false);
          });
      });
    }
  }, []);

  // Handle filter changes
  useEffect(() => {
    fetchHospitals();
  }, [searchQuery, selectedType, selectedSpecialty, selectedRating, selectedDistance, selectedAvailability, selectedInsurance, sortBy, pagination.page]);

  useEffect(() => {
    let filtered = hospitals;

    if (searchQuery) {
      filtered = filtered.filter(hospital =>
        hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hospital.specialties.some(specialty => 
          specialty.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
                                    (typeof hospital.address === 'string' ? hospital.address : '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedType && selectedType !== 'all') {
      filtered = filtered.filter(hospital => hospital.type.toLowerCase() === selectedType.toLowerCase());
    }

    if (selectedSpecialty && selectedSpecialty !== 'all') {
      filtered = filtered.filter(hospital => 
        hospital.specialties.some(specialty => 
          specialty.toLowerCase().includes(selectedSpecialty.toLowerCase())
        )
      );
    }

    setFilteredHospitals(filtered);
  }, [hospitals, searchQuery, selectedType, selectedSpecialty]);

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'limited':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'unavailable':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAvailabilityStatus = (occupancyRate: number) => {
    if (occupancyRate >= 95) return 'unavailable';
    if (occupancyRate >= 80) return 'limited';
    return 'available';
  };

  const getTraumaLevelColor = (level: string) => {
    switch (level) {
      case 'I':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'II':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'III':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'IV':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'V':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSpecialtyIcon = (specialty: string) => {
    const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
      'Cardiology': Heart,
      'Neurology': Brain,
      'Pediatrics': Baby,
      'Emergency Medicine': AlertTriangle,
      'General Surgery': Stethoscope,
      'Orthopedics': Shield,
      'Dermatology': Eye,
      'Oncology': Cross,
      'Radiology': Scan,
      'Laboratory': Microscope,
      'Pharmacy': Pill,
      'Ambulance': Ambulance
    };
    return iconMap[specialty] || Stethoscope;
  };

  const toggleFavorite = (hospitalId: string) => {
    setFilteredHospitals(prev => 
      prev.map(hospital => 
        hospital.id === hospitalId 
          ? { ...hospital, isFavorite: !hospital.isFavorite }
          : hospital
      )
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-health-teal"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading hospital directory...</p>
          <p className="text-sm text-gray-500">Connecting to real-time data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-health-teal to-health-aqua rounded-full mb-4">
            <Hospital className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Hospital Directory</h1>
          <p className="text-lg text-gray-600 mb-4">Find and compare hospitals with real-time availability</p>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Real-time data</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Live availability</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Instant booking</span>
            </div>
          </div>
        </div>

        {/* Enhanced Search and Filters */}
        <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Enhanced Search Input */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Search hospitals by name, specialty, or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 text-lg border-2 border-gray-200 focus:border-health-teal focus:ring-health-teal"
                  />
                </div>
              </div>

              {/* Enhanced Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 h-12 px-6 border-2 hover:border-health-teal hover:text-health-teal"
              >
                <Filter className="h-5 w-5" />
                <span>Advanced Filters</span>
                {showFilters ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </Button>

              {/* Enhanced Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 h-12 border-2">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="distance">Distance</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="waitTime">Wait Time</SelectItem>
                  <SelectItem value="availability">Availability</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Enhanced Advanced Filters */}
            {showFilters && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Hospital Type</label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="border-2">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="general">General Hospital</SelectItem>
                      <SelectItem value="specialized">Specialized Hospital</SelectItem>
                      <SelectItem value="community">Community Hospital</SelectItem>
                      <SelectItem value="academic">Academic Medical Center</SelectItem>
                      <SelectItem value="trauma">Trauma Center</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Specialty</label>
                  <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                    <SelectTrigger className="border-2">
                      <SelectValue placeholder="All Specialties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Specialties</SelectItem>
                      <SelectItem value="emergency">Emergency Care</SelectItem>
                      <SelectItem value="cardiology">Cardiology</SelectItem>
                      <SelectItem value="neurology">Neurology</SelectItem>
                      <SelectItem value="pediatrics">Pediatrics</SelectItem>
                      <SelectItem value="oncology">Oncology</SelectItem>
                      <SelectItem value="orthopedics">Orthopedics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Rating</label>
                  <Select value={selectedRating} onValueChange={setSelectedRating}>
                    <SelectTrigger className="border-2">
                      <SelectValue placeholder="All Ratings" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ratings</SelectItem>
                      <SelectItem value="4.5">4.5+ Stars</SelectItem>
                      <SelectItem value="4.0">4.0+ Stars</SelectItem>
                      <SelectItem value="3.5">3.5+ Stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Availability</label>
                  <Select value={selectedAvailability} onValueChange={setSelectedAvailability}>
                    <SelectTrigger className="border-2">
                      <SelectValue placeholder="All Availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Availability</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="limited">Limited</SelectItem>
                      <SelectItem value="unavailable">Unavailable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Results Summary */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center space-x-4">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold text-health-teal">{filteredHospitals.length}</span> of{' '}
              <span className="font-semibold text-health-teal">{pagination.total}</span> hospitals
            </p>
            {wsConnected && (
              <div className="flex items-center space-x-1 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium">Live</span>
              </div>
            )}

          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
              {autoRefresh && (
                <div className="flex items-center space-x-1 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium">Auto-refresh</span>
                </div>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchHospitals}
              disabled={loading}
              className="border-2 hover:border-health-teal hover:text-health-teal"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`border-2 ${autoRefresh ? 'border-green-500 text-green-600' : 'hover:border-health-teal hover:text-health-teal'}`}
            >
              <Settings className="h-4 w-4 mr-1" />
              {autoRefresh ? 'Auto ON' : 'Auto OFF'}
            </Button>
            <Button variant="outline" size="sm" className="border-2 hover:border-health-teal hover:text-health-teal">
              <MapPin className="h-4 w-4 mr-1" />
              Map View
            </Button>
            <Button variant="outline" size="sm" className="border-2 hover:border-health-teal hover:text-health-teal">
              <ArrowRight className="h-4 w-4 mr-1" />
              Compare
            </Button>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-2 bg-white shadow-sm border-2">
            <TabsTrigger value="list" className="data-[state=active]:bg-health-teal data-[state=active]:text-white">
              List View
            </TabsTrigger>
            <TabsTrigger value="map" className="data-[state=active]:bg-health-teal data-[state=active]:text-white">
              Map View
            </TabsTrigger>
          </TabsList>

          {/* Enhanced List View Tab */}
          <TabsContent value="list" className="space-y-4">
            {filteredHospitals.length === 0 ? (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No hospitals found</h3>
                  <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
                  <Button onClick={() => {
                    setSearchQuery('');
                    setSelectedType('all');
                    setSelectedSpecialty('all');
                  }} className="bg-health-teal hover:bg-health-aqua">
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredHospitals.map((hospital) => (
                <Card key={hospital.id} className="hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="p-4 bg-gradient-to-br from-health-teal to-health-aqua rounded-xl text-white shadow-lg">
                          <Hospital className="h-8 w-8" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-3">
                            <h3 
                              className="text-xl font-bold text-gray-900 group-hover:text-health-teal transition-colors cursor-pointer"
                              onClick={() => navigate(`/patient/hospital/${hospital.id}`)}
                            >
                              {hospital.name}
                            </h3>
                            <Badge variant="outline" className="border-2 font-medium">
                              {hospital.type}
                            </Badge>
                            <Badge className={`${getAvailabilityColor(hospital.realTimeData.availabilityStatus || getAvailabilityStatus(hospital.realTimeData.occupancyRate))} border-2 font-medium`}>
                              {hospital.realTimeData.availabilityStatus || getAvailabilityStatus(hospital.realTimeData.occupancyRate)}
                            </Badge>
                            <Badge className={`${getTraumaLevelColor(hospital.traumaLevel)} font-medium`}>
                              Trauma Level {hospital.traumaLevel}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleFavorite(hospital.id)}
                              className="ml-auto hover:bg-red-50"
                            >
                              {hospital.isFavorite ? (
                                <Heart className="h-5 w-5 text-red-500 fill-current" />
                              ) : (
                                <Heart className="h-5 w-5 text-gray-400 hover:text-red-500" />
                              )}
                            </Button>
                          </div>
                          <p className="text-gray-600 mb-4 flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-health-teal" />
                            {typeof hospital.address === 'string' ? hospital.address : 'Address not available'}
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm font-medium text-gray-700">
                                {hospital.rating} ({Math.floor(Math.random() * 500) + 100} reviews)
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                              <Clock className="h-4 w-4 text-green-500" />
                              <span className="text-sm font-medium text-gray-700">
                                {hospitalServicesService.formatWaitTime(hospital.realTimeData.averageWaitTime)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                              <Bed className="h-4 w-4 text-purple-500" />
                              <span className="text-sm font-medium text-gray-700">
                                {hospital.realTimeData.availableBeds}/{hospital.realTimeData.totalBeds} beds
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                              <Users className="h-4 w-4 text-blue-500" />
                              <span className="text-sm font-medium text-gray-700">
                                {hospital.realTimeData.connectedStaff} staff online
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {hospital.specialties.slice(0, 4).map((specialty, index) => {
                              const IconComponent = getSpecialtyIcon(specialty);
                              return (
                                <Badge key={index} variant="outline" className="text-xs border-2 hover:border-health-teal hover:text-health-teal">
                                  <IconComponent className="h-3 w-3 mr-1" />
                                  {specialty}
                                </Badge>
                              );
                            })}
                            {hospital.specialties.length > 4 && (
                              <Badge variant="outline" className="text-xs border-2">
                                +{hospital.specialties.length - 4} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2 ml-4">
                        <Button variant="outline" size="sm" className="border-2 hover:border-health-teal hover:text-health-teal">
                          <Phone className="h-4 w-4 mr-1" />
                          Call
                        </Button>
                        <Button variant="outline" size="sm" className="border-2 hover:border-health-teal hover:text-health-teal">
                          <MapPin className="h-4 w-4 mr-1" />
                          Directions
                        </Button>
                        <Button variant="outline" size="sm"
                                onClick={() => navigate(`/patient/hospital/${hospital.id}`)}
                                className="border-2 hover:border-health-teal hover:text-health-teal">
                          <Info className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                        <Button size="sm" className="bg-gradient-to-r from-health-teal to-health-aqua hover:from-health-aqua hover:to-health-teal text-white shadow-lg">
                          <ArrowRight className="h-4 w-4 mr-1" />
                          Book Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Enhanced Map View Tab */}
          <TabsContent value="map" className="space-y-4">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-health-teal to-health-aqua rounded-full mb-6">
                  <MapPin className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Interactive Hospital Map</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  View hospitals on an interactive map with real-time location, directions, and live availability updates
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button className="bg-gradient-to-r from-health-teal to-health-aqua hover:from-health-aqua hover:to-health-teal text-white shadow-lg">
                    <Navigation className="h-5 w-5 mr-2" />
                    Open Interactive Map
                  </Button>
                  <Button variant="outline" className="border-2 hover:border-health-teal hover:text-health-teal">
                    <Route className="h-5 w-5 mr-2" />
                    Get Directions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Enhanced Hospital Details Dialog */}
        <Dialog open={showHospitalDialog} onOpenChange={setShowHospitalDialog}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-health-teal to-health-aqua rounded-lg">
                  <Hospital className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold">{selectedHospital?.name}</span>
              </DialogTitle>
            </DialogHeader>
            {selectedHospital && (
              <div className="space-y-6">
                {/* Enhanced Header */}
                <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
                  <div className="p-4 bg-gradient-to-br from-health-teal to-health-aqua rounded-xl text-white shadow-lg">
                    <Hospital className="h-12 w-12" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-3">
                      <h3 className="text-2xl font-bold text-gray-900">{selectedHospital.name}</h3>
                      <Badge variant="outline" className="border-2 font-medium">
                        {selectedHospital.type}
                      </Badge>
                      <Badge className={`${getTraumaLevelColor(selectedHospital.traumaLevel)} font-medium`}>
                        Trauma Level {selectedHospital.traumaLevel}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-2 flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-health-teal" />
                                                  {typeof selectedHospital.address === 'string' ? selectedHospital.address : 'Address not available'}
                    </p>
                    <p className="text-sm text-gray-600">{selectedHospital.description}</p>
                  </div>
                </div>

                {/* Enhanced Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 border-2 border-gray-200 rounded-lg text-center hover:border-health-teal transition-colors">
                    <p className="text-3xl font-bold text-health-teal">{selectedHospital.realTimeData.totalBeds}</p>
                    <p className="text-sm text-gray-600 font-medium">Total Beds</p>
                  </div>
                  <div className="p-4 border-2 border-gray-200 rounded-lg text-center hover:border-green-500 transition-colors">
                    <p className="text-3xl font-bold text-green-600">{selectedHospital.realTimeData.availableBeds}</p>
                    <p className="text-sm text-gray-600 font-medium">Available</p>
                  </div>
                  <div className="p-4 border-2 border-gray-200 rounded-lg text-center hover:border-purple-500 transition-colors">
                    <p className="text-3xl font-bold text-purple-600">{selectedHospital.realTimeData.connectedStaff}</p>
                    <p className="text-sm text-gray-600 font-medium">Staff Online</p>
                  </div>
                  <div className="p-4 border-2 border-gray-200 rounded-lg text-center hover:border-orange-500 transition-colors">
                    <p className="text-3xl font-bold text-orange-600">{selectedHospital.realTimeData.departments}</p>
                    <p className="text-sm text-gray-600 font-medium">Departments</p>
                  </div>
                </div>

                {/* Enhanced Tabs for Details */}
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm border-2">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-health-teal data-[state=active]:text-white">
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="services" className="data-[state=active]:bg-health-teal data-[state=active]:text-white">
                      Services
                    </TabsTrigger>
                    <TabsTrigger value="contact" className="data-[state=active]:bg-health-teal data-[state=active]:text-white">
                      Contact
                    </TabsTrigger>
                    <TabsTrigger value="reviews" className="data-[state=active]:bg-health-teal data-[state=active]:text-white">
                      Reviews
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <Stethoscope className="h-5 w-5 mr-2 text-health-teal" />
                          Specialties
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedHospital.specialties.map((specialty, index) => {
                            const IconComponent = getSpecialtyIcon(specialty);
                            return (
                              <Badge key={index} variant="outline" className="border-2 hover:border-health-teal hover:text-health-teal">
                                <IconComponent className="h-3 w-3 mr-1" />
                                {specialty}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <Award className="h-5 w-5 mr-2 text-health-teal" />
                          Facilities
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedHospital.facilities.map((facility, index) => (
                            <Badge key={index} variant="outline" className="border-2">
                              {facility}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="services" className="space-y-4 mt-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2 text-health-teal" />
                        Available Services
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {selectedHospital.services.map((service, index) => (
                          <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-gray-700 font-medium">{service}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="contact" className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <Phone className="h-5 w-5 mr-2 text-health-teal" />
                          Contact Information
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                            <Phone className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium">{selectedHospital.phone}</span>
                          </div>
                          <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                            <Mail className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium">{selectedHospital.email}</span>
                          </div>
                          <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                            <MapPin className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium">{typeof selectedHospital.address === 'string' ? selectedHospital.address : 'Address not available'}</span>
                          </div>
                          <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium">{selectedHospital.operatingHours}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                          Emergency Contact
                        </h4>
                        <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border-2 border-red-200">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                          <span className="text-sm font-bold text-red-700">{selectedHospital.emergencyContact}</span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="reviews" className="space-y-4 mt-4">
                    <div className="text-center text-gray-500 py-8">
                      <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-lg font-medium">Reviews coming soon</p>
                      <p className="text-sm">Patient reviews and ratings will be available here</p>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex space-x-3 pt-4 border-t-2">
                  <Button className="flex-1 bg-gradient-to-r from-health-teal to-health-aqua hover:from-health-aqua hover:to-health-teal text-white shadow-lg">
                    <Calendar className="h-5 w-5 mr-2" />
                    Book Appointment
                  </Button>
                  <Button variant="outline" className="flex-1 border-2 hover:border-health-teal hover:text-health-teal">
                    <Phone className="h-5 w-5 mr-2" />
                    Call Hospital
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

export default HospitalDirectory; 