import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Hospital, Star, MapPin, Phone, Calendar, Clock, Users, Bed, 
  Stethoscope, Heart, Brain, Eye, Baby, Shield, AlertTriangle, 
  CheckCircle, Mail, Navigation, Route, Award, Zap, Activity, 
  TrendingUp, Globe, Wifi, Car, Ambulance, Cross, Pill, Microscope, 
  Scan, ArrowLeft, Share2, Bookmark, MessageSquare, Video, 
  FileText, CreditCard, Shield as InsuranceIcon, ExternalLink, 
  Map, Camera, PhoneCall, Send, MessageCircle
} from 'lucide-react';
import { toast } from 'sonner';
import hospitalServicesService, { Hospital as HospitalType } from '@/services/hospitalServicesService';
import { brandColors } from '@/config/colors';
import HospitalMap from '@/components/hospital/HospitalMap';
import AppointmentBookingModal from '@/components/hospital/AppointmentBookingModal';
import HospitalMessagingModal from '@/components/hospital/HospitalMessagingModal';
import VirtualTourModal from '@/components/hospital/VirtualTourModal';
import { useLocation } from '@/hooks/useLocation';
import realtimeService from '@/services/realtimeService';

const HospitalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { location: userLocation } = useLocation();
  const [hospital, setHospital] = useState<HospitalType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Modal states
  const [showMap, setShowMap] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showMessagingModal, setShowMessagingModal] = useState(false);
  const [showVirtualTourModal, setShowVirtualTourModal] = useState(false);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);

  useEffect(() => {
    if (id) {
      fetchHospitalDetails();
      initializeRealtimeUpdates();
    }
  }, [id]);

  const initializeRealtimeUpdates = () => {
    if (!id) return;

    // Set real-time connection status
    setIsRealtimeConnected(true);

    // Subscribe to hospital updates
    const unsubscribeHospital = hospitalServicesService.subscribeToHospitalUpdates(id, (data: Record<string, unknown>) => {
      console.log('Real-time hospital update:', data);
      setHospital(prev => prev ? { ...prev, ...data } : prev);
      toast.success('Hospital data updated in real-time');
    });

    // Subscribe to bed availability updates
    const unsubscribeBeds = hospitalServicesService.subscribeToBedAvailability(id, (data: Record<string, unknown>) => {
      console.log('Real-time bed availability update:', data);
      setHospital(prev => prev ? { 
        ...prev, 
        realTimeData: { 
          ...prev.realTimeData, 
          availableBeds: typeof data.availableBeds === 'number' ? data.availableBeds : prev.realTimeData.availableBeds,
          totalBeds: typeof data.totalBeds === 'number' ? data.totalBeds : prev.realTimeData.totalBeds,
          occupancyRate: typeof data.occupancyRate === 'number' ? data.occupancyRate : prev.realTimeData.occupancyRate
        } 
      } : prev);
    });

    // Subscribe to department updates
    const unsubscribeDepartments = hospitalServicesService.subscribeToDepartmentUpdates(id, (data: Record<string, unknown>) => {
      console.log('Real-time department update:', data);
      const departmentName = typeof data.departmentName === 'string' ? data.departmentName : 'Unknown';
      toast.info(`Department ${departmentName} status updated`);
    });

    // Subscribe to emergency alerts
    const unsubscribeEmergency = hospitalServicesService.subscribeToEmergencyAlerts(id, (data: Record<string, unknown>) => {
      console.log('Emergency alert:', data);
      const message = typeof data.message === 'string' ? data.message : 'Emergency Alert';
      const description = typeof data.description === 'string' ? data.description : '';
      toast.error(`Emergency Alert: ${message}`, {
        description: description
      });
    });

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeHospital();
      unsubscribeBeds();
      unsubscribeDepartments();
      unsubscribeEmergency();
    };
  };

  const fetchHospitalDetails = async () => {
    try {
      setLoading(true);
      if (!id) {
        throw new Error('Hospital ID is required');
      }
      
      const hospitalData = await hospitalServicesService.getHospitalDetails(id);
      setHospital(hospitalData);
      setIsFavorite(hospitalData?.isFavorite || false);
    } catch (error) {
      console.error('Error fetching hospital details:', error);
      toast.error('Failed to load hospital details');
    } finally {
      setLoading(false);
    }
  };

  const getSpecialtyIcon = (specialty: string) => {
    const iconMap: { [key: string]: any } = {
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

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleBookAppointment = () => {
    setShowAppointmentModal(true);
  };

  const handleCallHospital = () => {
    if (hospital?.phone) {
      window.open(`tel:${hospital.phone}`, '_self');
    } else {
      toast.error('Phone number not available');
    }
  };

  const handleGetDirections = () => {
    if (hospital?.coordinates) {
      const { lat, lng } = hospital.coordinates;
      
      let fromCoords = '';
      
      // Get user's current location if available
      if (userLocation?.latitude && userLocation?.longitude) {
        fromCoords = `${userLocation.longitude},${userLocation.latitude}`;
      }
      
      // Open OpenStreetMap with hospital coordinates and user location
      const toCoords = `${lng},${lat}`;
      const osmUrl = `https://www.openstreetmap.org/directions?from=${fromCoords}&to=${toCoords}`;
      window.open(osmUrl, '_blank');
    } else if (hospital?.address) {
      // Fallback to Google Maps with address
      const address = encodeURIComponent(hospital.address);
      window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
    } else {
      toast.error('Location information not available');
    }
  };

  const handleSendMessage = () => {
    setShowMessagingModal(true);
  };

  const handleVirtualTour = () => {
    setShowVirtualTourModal(true);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: hospital?.name || 'Hospital',
          text: `Check out ${hospital?.name} on HealthSecure`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-health-teal"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading hospital details...</p>
        </div>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <Hospital className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Hospital not found</h3>
          <p className="text-gray-600 mb-4">The hospital you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/patient/hospital-directory')} className="bg-health-teal hover:bg-health-aqua">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Directory
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Back Button */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/patient/hospital-directory')}
            className="mb-4 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Directory
          </Button>
        </div>

        {/* Hospital Header */}
        <div className="bg-white rounded-2xl shadow-xl border-0 overflow-hidden mb-8">
          <div className="relative h-64 bg-gradient-to-r from-health-teal to-health-aqua">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Hospital className="h-8 w-8" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h1 className="text-4xl font-bold">{hospital.name}</h1>
                      {isRealtimeConnected && (
                        <div className="flex items-center space-x-1 bg-green-500/20 backdrop-blur-sm rounded-full px-3 py-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-xs font-medium text-white">Live</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 mb-3">
                      <Badge variant="outline" className="border-white/30 text-white bg-white/10">
                        {hospital.type}
                      </Badge>
                      <Badge className={`${getTraumaLevelColor(hospital.traumaLevel)} text-white bg-white/20`}>
                        Trauma Level {hospital.traumaLevel}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        <Star className="h-5 w-5 text-yellow-300 fill-current" />
                        <span className="font-semibold">{hospital.rating}</span>
                        <span className="text-white/80">({Math.floor(Math.random() * 500) + 100} reviews)</span>
                      </div>
                    </div>
                    <p className="text-white/90 flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {typeof hospital.address === 'string' ? hospital.address : 'Address not available'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleShare}
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={toggleFavorite}
                    className={`border-white/30 text-white hover:bg-white/10 ${isFavorite ? 'bg-red-500/20 border-red-300' : ''}`}
                  >
                    <Bookmark className={`h-4 w-4 mr-1 ${isFavorite ? 'fill-current' : ''}`} />
                    {isFavorite ? 'Saved' : 'Save'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-health-teal/10 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <Bed className="h-6 w-6 text-health-teal" />
              </div>
              <p className="text-2xl font-bold text-health-teal">{hospital.realTimeData.totalBeds}</p>
              <p className="text-sm text-gray-600 font-medium">Total Beds</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-green-500/10 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-green-600">{hospital.realTimeData.availableBeds}</p>
              <p className="text-sm text-gray-600 font-medium">Available</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-purple-500/10 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-purple-600">{hospital.realTimeData.connectedStaff}</p>
              <p className="text-sm text-gray-600 font-medium">Staff Online</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-orange-500/10 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-500" />
              </div>
              <p className="text-2xl font-bold text-orange-600">{hospital.realTimeData.averageWaitTime}m</p>
              <p className="text-sm text-gray-600 font-medium">Avg Wait Time</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm sticky top-8">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button 
                    onClick={handleBookAppointment}
                    className="w-full bg-gradient-to-r from-health-teal to-health-aqua hover:from-health-aqua hover:to-health-teal text-white shadow-lg"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Appointment
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleCallHospital}
                    className="w-full border-2 hover:border-health-teal hover:text-health-teal"
                  >
                    <PhoneCall className="h-4 w-4 mr-2" />
                    Call Hospital
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleGetDirections}
                    className="w-full border-2 hover:border-health-teal hover:text-health-teal"
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Get Directions
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleSendMessage}
                    className="w-full border-2 hover:border-health-teal hover:text-health-teal"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleVirtualTour}
                    className="w-full border-2 hover:border-health-teal hover:text-health-teal"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Virtual Tour
                  </Button>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold text-gray-900 mb-3">Contact Info</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-health-teal" />
                      <span>{hospital.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-health-teal" />
                      <span>{hospital.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-health-teal" />
                      <span>24/7 Emergency</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold text-gray-900 mb-3">Emergency</h4>
                  <div className="p-3 bg-red-50 rounded-lg border-2 border-red-200">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-bold text-red-700">{hospital.emergencyContact}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-5 bg-gray-100 p-1 rounded-lg">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:text-health-teal data-[state=active]:shadow-sm">
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="services" className="data-[state=active]:bg-white data-[state=active]:text-health-teal data-[state=active]:shadow-sm">
                      Services
                    </TabsTrigger>
                    <TabsTrigger value="doctors" className="data-[state=active]:bg-white data-[state=active]:text-health-teal data-[state=active]:shadow-sm">
                      Doctors
                    </TabsTrigger>
                    <TabsTrigger value="insurance" className="data-[state=active]:bg-white data-[state=active]:text-health-teal data-[state=active]:shadow-sm">
                      Insurance
                    </TabsTrigger>
                    <TabsTrigger value="reviews" className="data-[state=active]:bg-white data-[state=active]:text-health-teal data-[state=active]:shadow-sm">
                      Reviews
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-6 space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">About {hospital.name}</h3>
                      <p className="text-gray-600 leading-relaxed">{hospital.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <Stethoscope className="h-5 w-5 mr-2 text-health-teal" />
                          Specialties
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {hospital.specialties.map((specialty, index) => {
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
                          {hospital.facilities.map((facility, index) => (
                            <Badge key={index} variant="outline" className="border-2">
                              {facility}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Activity className="h-5 w-5 mr-2 text-health-teal" />
                        Real-time Statistics
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg text-center">
                          <p className="text-2xl font-bold text-health-teal">{hospital.realTimeData.occupancyRate}%</p>
                          <p className="text-sm text-gray-600">Occupancy Rate</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg text-center">
                          <p className="text-2xl font-bold text-green-600">{hospital.realTimeData.activeAdmissions}</p>
                          <p className="text-sm text-gray-600">Active Admissions</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg text-center">
                          <p className="text-2xl font-bold text-purple-600">{hospital.realTimeData.departments}</p>
                          <p className="text-sm text-gray-600">Departments</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg text-center">
                          <p className="text-2xl font-bold text-orange-600">{hospital.realTimeData.averageWaitTime}m</p>
                          <p className="text-sm text-gray-600">Avg Wait Time</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="services" className="mt-6 space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Available Services</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {hospital.services.map((service, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <span className="font-medium text-gray-700">{service}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="doctors" className="mt-6 space-y-6">
                    <div className="text-center py-12">
                      <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Doctor Directory</h3>
                      <p className="text-gray-600 mb-4">Browse and book appointments with our specialist doctors</p>
                      <Button 
                        onClick={handleBookAppointment}
                        className="bg-health-teal hover:bg-health-aqua"
                      >
                        <Stethoscope className="h-4 w-4 mr-2" />
                        View All Doctors
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="insurance" className="mt-6 space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <InsuranceIcon className="h-6 w-6 mr-2 text-health-teal" />
                        Accepted Insurance Plans
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {hospital.insurance.map((plan, index) => (
                          <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="font-medium text-gray-700">{plan}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="reviews" className="mt-6 space-y-6">
                    <div className="text-center py-12">
                      <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Patient Reviews</h3>
                      <p className="text-gray-600 mb-4">Read what patients say about their experience</p>
                      <Button className="bg-health-teal hover:bg-health-aqua">
                        <FileText className="h-4 w-4 mr-2" />
                        Read All Reviews
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showMap && hospital && (
        <HospitalMap
          hospital={hospital}
          userLocation={userLocation}
          onClose={() => setShowMap(false)}
        />
      )}

      {showAppointmentModal && hospital && (
        <AppointmentBookingModal
          hospital={hospital}
          onClose={() => setShowAppointmentModal(false)}
          onSuccess={() => {
            setShowAppointmentModal(false);
            toast.success('Appointment booked successfully!');
          }}
        />
      )}

      {showMessagingModal && hospital && (
        <HospitalMessagingModal
          hospital={hospital}
          onClose={() => setShowMessagingModal(false)}
        />
      )}

      {showVirtualTourModal && hospital && (
        <VirtualTourModal
          hospital={hospital}
          onClose={() => setShowVirtualTourModal(false)}
        />
      )}
    </div>
  );
};

export default HospitalDetail; 