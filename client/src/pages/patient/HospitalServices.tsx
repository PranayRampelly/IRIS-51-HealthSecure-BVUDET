import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Hospital, Search, Filter, Star, MapPin, Phone, Calendar, Clock,
  Users, Bed, Stethoscope, Heart, Brain, Eye, Baby,
  ChevronDown, ChevronUp, AlertTriangle, CheckCircle, XCircle,
  ArrowRight, Info, Plus, Minus, PhoneCall, Mail, MessageSquare
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface HospitalService {
  id: number;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  features: string[];
  availability: string;
  waitTime: string;
  rating: number;
  reviews: number;
  price: string;
  insurance: boolean;
}

interface Hospital {
  id: number;
  name: string;
  type: string;
  address: string;
  phone: string;
  email: string;
  rating: number;
  reviews: number;
  specialties: string[];
  services: string[];
  insurance: string[];
  distance: string;
  waitTime: string;
  availability: 'available' | 'limited' | 'unavailable';
  coordinates: {
    lat: number;
    lng: number;
  };
  facilities: string[];
  operatingHours: string;
  emergencyContact: string;
}

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  hospital: string;
  experience: string;
  education: string;
  rating: number;
  reviews: number;
  availability: string;
  consultationFee: string;
  insurance: boolean;
  languages: string[];
  photo: string;
  bio: string;
  certifications: string[];
}

interface Appointment {
  id: number;
  doctorName: string;
  specialty: string;
  hospital: string;
  date: string;
  time: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  type: 'in-person' | 'virtual' | 'emergency';
  notes: string;
}

const HospitalServices = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<HospitalService | null>(null);
  const [showServiceDialog, setShowServiceDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  // Mock data for hospital services
  const hospitalServices: HospitalService[] = [
    {
      id: 1,
      name: 'Emergency Care',
      description: '24/7 emergency medical services with trauma centers and critical care units',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      features: ['Trauma Center', 'Critical Care', 'Emergency Surgery', 'Ambulance Service'],
      availability: '24/7',
      waitTime: 'Immediate',
      rating: 4.8,
      reviews: 1247,
      price: 'Varies by insurance',
      insurance: true
    },
    {
      id: 2,
      name: 'Cardiology',
      description: 'Comprehensive heart care including diagnostics, treatment, and surgery',
      icon: Heart,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      features: ['EKG/ECG', 'Echocardiogram', 'Cardiac Surgery', 'Rehabilitation'],
      availability: 'Mon-Fri 8AM-6PM',
      waitTime: '1-2 weeks',
      rating: 4.9,
      reviews: 892,
      price: '$150-500',
      insurance: true
    },
    {
      id: 3,
      name: 'Neurology',
      description: 'Specialized care for brain and nervous system disorders',
      icon: Brain,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      features: ['MRI/CT Scans', 'Neurological Surgery', 'Stroke Care', 'Epilepsy Treatment'],
      availability: 'Mon-Fri 9AM-5PM',
      waitTime: '2-3 weeks',
      rating: 4.7,
      reviews: 634,
      price: '$200-600',
      insurance: true
    },
    {
      id: 4,
      name: 'Ophthalmology',
      description: 'Eye care services including surgery and vision correction',
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      features: ['Eye Surgery', 'Vision Correction', 'Glaucoma Treatment', 'Retinal Care'],
      availability: 'Mon-Sat 8AM-6PM',
      waitTime: '1-2 weeks',
      rating: 4.6,
      reviews: 445,
      price: '$100-800',
      insurance: true
    },
    {
      id: 5,
      name: 'Dental Care',
      description: 'Comprehensive dental services and oral surgery',
      icon: Stethoscope,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      features: ['General Dentistry', 'Oral Surgery', 'Orthodontics', 'Emergency Dental'],
      availability: 'Mon-Fri 8AM-7PM',
      waitTime: '1-3 days',
      rating: 4.5,
      reviews: 567,
      price: '$50-300',
      insurance: true
    },
    {
      id: 6,
      name: 'Pediatrics',
      description: 'Specialized care for infants, children, and adolescents',
      icon: Baby,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      features: ['Well-child Visits', 'Vaccinations', 'Child Surgery', 'Development Screening'],
      availability: 'Mon-Fri 8AM-6PM',
      waitTime: 'Same day',
      rating: 4.8,
      reviews: 723,
      price: '$80-200',
      insurance: true
    }
  ];

  // Mock data for hospitals
  const hospitals: Hospital[] = [
    {
      id: 1,
      name: 'City General Hospital',
      type: 'General',
      address: '123 Medical Center Dr, City Center',
      phone: '+1-555-0101',
      email: 'info@citygeneral.com',
      rating: 4.7,
      reviews: 1247,
      specialties: ['Emergency Care', 'Cardiology', 'Neurology', 'Surgery'],
      services: ['24/7 Emergency', 'ICU', 'Laboratory', 'Radiology'],
      insurance: ['Blue Cross', 'Aetna', 'Cigna', 'Medicare'],
      distance: '0.5 km',
      waitTime: '15-30 min',
      availability: 'available',
      coordinates: { lat: 40.7128, lng: -74.0060 },
      facilities: ['Parking', 'Cafeteria', 'Pharmacy', 'Gift Shop'],
      operatingHours: '24/7',
      emergencyContact: '+1-555-9111'
    },
    {
      id: 2,
      name: 'Metro Medical Center',
      type: 'Specialized',
      address: '456 Health Blvd, Metro District',
      phone: '+1-555-0102',
      email: 'contact@metromedical.com',
      rating: 4.9,
      reviews: 892,
      specialties: ['Cardiology', 'Neurology', 'Oncology'],
      services: ['Cardiac Surgery', 'Neurological Care', 'Cancer Treatment'],
      insurance: ['Blue Cross', 'Aetna', 'UnitedHealth'],
      distance: '1.2 km',
      waitTime: '1-2 hours',
      availability: 'available',
      coordinates: { lat: 40.7589, lng: -73.9851 },
      facilities: ['Valet Parking', 'Fine Dining', 'Concierge Service'],
      operatingHours: 'Mon-Fri 7AM-8PM',
      emergencyContact: '+1-555-9112'
    },
    {
      id: 3,
      name: 'Community Health Hospital',
      type: 'Community',
      address: '789 Wellness Ave, Community District',
      phone: '+1-555-0103',
      email: 'hello@communityhealth.com',
      rating: 4.5,
      reviews: 634,
      specialties: ['Family Medicine', 'Pediatrics', 'Obstetrics'],
      services: ['Primary Care', 'Child Care', 'Maternity'],
      insurance: ['Medicaid', 'Medicare', 'Local Plans'],
      distance: '2.1 km',
      waitTime: '30-60 min',
      availability: 'limited',
      coordinates: { lat: 40.7505, lng: -73.9934 },
      facilities: ['Free Parking', 'Community Garden', 'Child Care'],
      operatingHours: 'Mon-Sat 8AM-6PM',
      emergencyContact: '+1-555-9113'
    }
  ];

  // Mock data for doctors
  const doctors: Doctor[] = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      specialty: 'Cardiology',
      hospital: 'City General Hospital',
      experience: '15 years',
      education: 'Harvard Medical School',
      rating: 4.9,
      reviews: 234,
      availability: 'Mon-Fri 9AM-5PM',
      consultationFee: '$200',
      insurance: true,
      languages: ['English', 'Spanish'],
      photo: '/api/placeholder/150/150',
      bio: 'Board-certified cardiologist specializing in interventional cardiology and heart failure.',
      certifications: ['American Board of Internal Medicine', 'Cardiovascular Disease']
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      specialty: 'Neurology',
      hospital: 'Metro Medical Center',
      experience: '12 years',
      education: 'Stanford Medical School',
      rating: 4.8,
      reviews: 189,
      availability: 'Mon-Thu 8AM-4PM',
      consultationFee: '$250',
      insurance: true,
      languages: ['English', 'Mandarin'],
      photo: '/api/placeholder/150/150',
      bio: 'Neurologist with expertise in stroke treatment and neurological disorders.',
      certifications: ['American Board of Psychiatry and Neurology']
    },
    {
      id: 3,
      name: 'Dr. Emily Rodriguez',
      specialty: 'Pediatrics',
      hospital: 'Community Health Hospital',
      experience: '8 years',
      education: 'UCLA Medical School',
      rating: 4.7,
      reviews: 156,
      availability: 'Mon-Fri 8AM-6PM',
      consultationFee: '$150',
      insurance: true,
      languages: ['English', 'Spanish'],
      photo: '/api/placeholder/150/150',
      bio: 'Pediatrician dedicated to providing compassionate care for children of all ages.',
      certifications: ['American Board of Pediatrics']
    }
  ];

  // Mock data for appointments
  const appointments: Appointment[] = [
    {
      id: 1,
      doctorName: 'Dr. Sarah Johnson',
      specialty: 'Cardiology',
      hospital: 'City General Hospital',
      date: '2024-01-25',
      time: '10:00 AM',
      status: 'scheduled',
      type: 'in-person',
      notes: 'Follow-up appointment for heart condition'
    },
    {
      id: 2,
      doctorName: 'Dr. Michael Chen',
      specialty: 'Neurology',
      hospital: 'Metro Medical Center',
      date: '2024-01-28',
      time: '2:30 PM',
      status: 'confirmed',
      type: 'virtual',
      notes: 'Initial consultation for headaches'
    }
  ];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'limited':
        return 'bg-yellow-100 text-yellow-800';
      case 'unavailable':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-health-teal"></div>
          <p className="mt-4 text-gray-600">Loading hospital services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Hospital Services</h1>
          <p className="text-gray-600 mt-2">Access comprehensive healthcare services and hospital resources</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Hospital className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{hospitals.length}</p>
                  <p className="text-sm text-gray-600">Hospitals</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Stethoscope className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{doctors.length}</p>
                  <p className="text-sm text-gray-600">Doctors</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
                  <p className="text-sm text-gray-600">Appointments</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Bed className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">24/7</p>
                  <p className="text-sm text-gray-600">Emergency Care</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="directory">Hospital Directory</TabsTrigger>
            <TabsTrigger value="doctors">Find Doctors</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hospitalServices.map((service) => (
                <Card key={service.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => {
                        setSelectedService(service);
                        setShowServiceDialog(true);
                      }}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${service.bgColor}`}>
                        <service.icon className={`h-6 w-6 ${service.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.name}</h3>
                        <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm text-gray-600">{service.rating}</span>
                            <span className="text-sm text-gray-500">({service.reviews})</span>
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            {service.availability}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Hospital Directory Tab */}
          <TabsContent value="directory" className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search hospitals..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="specialized">Specialized</SelectItem>
                  <SelectItem value="community">Community</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              {hospitals.map((hospital) => (
                <Card key={hospital.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <Hospital className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{hospital.name}</h3>
                            <Badge variant="outline">{hospital.type}</Badge>
                            <Badge className={getAvailabilityColor(hospital.availability)}>
                              {hospital.availability}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{hospital.address}</p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center space-x-2">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm text-gray-600">
                                {hospital.rating} ({hospital.reviews} reviews)
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-blue-500" />
                              <span className="text-sm text-gray-600">{hospital.distance}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-green-500" />
                              <span className="text-sm text-gray-600">{hospital.waitTime}</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {hospital.specialties.slice(0, 3).map((specialty, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2 ml-4">
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4 mr-1" />
                          Call
                        </Button>
                        <Button variant="outline" size="sm">
                          <MapPin className="h-4 w-4 mr-1" />
                          Directions
                        </Button>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          <ArrowRight className="h-4 w-4 mr-1" />
                          Book
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Find Doctors Tab */}
          <TabsContent value="doctors" className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search doctors by name or specialty..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specialties</SelectItem>
                  <SelectItem value="cardiology">Cardiology</SelectItem>
                  <SelectItem value="neurology">Neurology</SelectItem>
                  <SelectItem value="pediatrics">Pediatrics</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doctor) => (
                <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                        <Users className="h-8 w-8 text-gray-500" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
                      <p className="text-sm text-gray-600">{doctor.specialty}</p>
                      <p className="text-xs text-gray-500">{doctor.hospital}</p>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Experience:</span>
                        <span className="text-sm font-medium">{doctor.experience}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Rating:</span>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span className="text-sm font-medium">{doctor.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Fee:</span>
                        <span className="text-sm font-medium">{doctor.consultationFee}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        Book
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">My Hospital Appointments</h3>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Book New Appointment
              </Button>
            </div>

            <div className="space-y-4">
              {appointments.map((appointment) => (
                <Card key={appointment.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <Calendar className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{appointment.doctorName}</h4>
                          <p className="text-sm text-gray-600">{appointment.specialty} • {appointment.hospital}</p>
                          <p className="text-sm text-gray-600">
                            {appointment.date} at {appointment.time} • {appointment.type}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Calendar className="h-4 w-4 mr-1" />
                            Reschedule
                          </Button>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Contact
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Service Details Dialog */}
        <Dialog open={showServiceDialog} onOpenChange={setShowServiceDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                {selectedService && (
                  <div className={`p-2 rounded-lg ${selectedService.bgColor}`}>
                    <selectedService.icon className={`h-5 w-5 ${selectedService.color}`} />
                  </div>
                )}
                <span>{selectedService?.name}</span>
              </DialogTitle>
            </DialogHeader>
            {selectedService && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-600">{selectedService.description}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Features</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedService.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Availability</h4>
                    <p className="text-gray-600">{selectedService.availability}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Wait Time</h4>
                    <p className="text-gray-600">{selectedService.waitTime}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Rating</h4>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-gray-600">{selectedService.rating} ({selectedService.reviews} reviews)</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Price</h4>
                    <p className="text-gray-600">{selectedService.price}</p>
                  </div>
                </div>

                <div className="flex space-x-2 pt-4 border-t">
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Appointment
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Phone className="h-4 w-4 mr-2" />
                    Contact Hospital
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

export default HospitalServices; 