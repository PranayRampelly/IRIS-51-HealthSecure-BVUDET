import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Search, Filter, Star, MapPin, Phone, Calendar, Clock, User,
  Stethoscope, Heart, Brain, Eye, Baby, ChevronDown, ChevronUp,
  ArrowRight, Info, Plus, Minus, PhoneCall, Mail, MessageSquare,
  Navigation, Route, Timer, RefreshCw, Bell, Award, CheckCircle,
  Building2, Shield, Zap, Target, TrendingUp, Users, FileText,
  Video, Globe, Clock3, ShieldCheck, GraduationCap,
  BookOpen, Microscope, Pill, Activity, AlertTriangle, CheckSquare
} from 'lucide-react';

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  subSpecialty: string;
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
  awards: string[];
  publications: number;
  procedures: string[];
  coordinates: { lat: number; lng: number };
  distance: string;
  waitTime: string;
  isFavorite: boolean;
  nextAvailable: string;
  consultationType: 'in-person' | 'virtual' | 'both';
  emergencyAvailable: boolean;
  verified: boolean;
  responseTime: string;
  successRate: number;
  patientSatisfaction: number;
}

// Enhanced mock data - moved outside component to prevent recreation
const doctors: Doctor[] = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      specialty: 'Cardiology',
      subSpecialty: 'Interventional Cardiology',
      hospital: 'City General Hospital',
      experience: '15 years',
      education: 'Harvard Medical School, Johns Hopkins University',
      rating: 4.9,
      reviews: 234,
      availability: 'Mon-Fri 9AM-5PM',
      consultationFee: '₹2,500',
      insurance: true,
      languages: ['English', 'Spanish', 'Hindi'],
      photo: 'https://via.placeholder.com/150x150/4ade80/ffffff?text=Dr',
      bio: 'Board-certified cardiologist specializing in interventional cardiology and heart failure. Dr. Johnson has performed over 2,000 cardiac procedures and is recognized for her expertise in complex cardiac interventions.',
      certifications: ['American Board of Internal Medicine', 'Cardiovascular Disease', 'Interventional Cardiology'],
      awards: ['Top Cardiologist 2023', 'Excellence in Patient Care Award'],
      publications: 45,
      procedures: ['Angioplasty', 'Stent Placement', 'Cardiac Catheterization', 'Echocardiogram'],
      coordinates: { lat: 40.7128, lng: -74.0060 },
      distance: '0.5 km',
      waitTime: '1-2 weeks',
      isFavorite: true,
      nextAvailable: '2024-01-25 10:00 AM',
      consultationType: 'both',
      emergencyAvailable: true,
      verified: true,
      responseTime: '< 2 hours',
      successRate: 98,
      patientSatisfaction: 96
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      specialty: 'Neurology',
      subSpecialty: 'Stroke Neurology',
      hospital: 'Metro Medical Center',
      experience: '12 years',
      education: 'Stanford Medical School, UCLA Medical Center',
      rating: 4.8,
      reviews: 189,
      availability: 'Mon-Thu 8AM-4PM',
      consultationFee: '₹3,000',
      insurance: true,
      languages: ['English', 'Mandarin', 'Hindi'],
      photo: 'https://via.placeholder.com/150x150/4ade80/ffffff?text=Dr',
      bio: 'Neurologist with expertise in stroke treatment and neurological disorders. Dr. Chen leads the stroke team and has extensive experience in acute stroke management and rehabilitation.',
      certifications: ['American Board of Psychiatry and Neurology', 'Vascular Neurology'],
      awards: ['Stroke Care Excellence Award', 'Research Innovation Award'],
      publications: 32,
      procedures: ['Stroke Assessment', 'Neurological Examination', 'EEG', 'EMG'],
      coordinates: { lat: 40.7589, lng: -73.9851 },
      distance: '1.2 km',
      waitTime: '2-3 weeks',
      isFavorite: false,
      nextAvailable: '2024-01-28 2:30 PM',
      consultationType: 'both',
      emergencyAvailable: true,
      verified: true,
      responseTime: '< 4 hours',
      successRate: 95,
      patientSatisfaction: 94
    },
    {
      id: 3,
      name: 'Dr. Emily Rodriguez',
      specialty: 'Pediatrics',
      subSpecialty: 'General Pediatrics',
      hospital: 'Community Health Hospital',
      experience: '8 years',
      education: 'UCLA Medical School, Children\'s Hospital Los Angeles',
      rating: 4.7,
      reviews: 156,
      availability: 'Mon-Fri 8AM-6PM',
      consultationFee: '₹1,800',
      insurance: true,
      languages: ['English', 'Spanish', 'Hindi'],
      photo: 'https://via.placeholder.com/150x150/4ade80/ffffff?text=Dr',
      bio: 'Pediatrician dedicated to providing compassionate care for children of all ages. Dr. Rodriguez specializes in preventive care, vaccinations, and childhood development.',
      certifications: ['American Board of Pediatrics'],
      awards: ['Patient Choice Award', 'Community Service Recognition'],
      publications: 18,
      procedures: ['Well-child Visits', 'Vaccinations', 'Development Screening', 'Sick Visits'],
      coordinates: { lat: 40.7505, lng: -73.9934 },
      distance: '2.1 km',
      waitTime: 'Same day',
      isFavorite: false,
      nextAvailable: '2024-01-22 3:00 PM',
      consultationType: 'both',
      emergencyAvailable: false,
      verified: true,
      responseTime: '< 1 hour',
      successRate: 97,
      patientSatisfaction: 98
    }
];

const FindDoctors = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedHospital, setSelectedHospital] = useState('all');
  const [selectedConsultationType, setSelectedConsultationType] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setFilteredDoctors(doctors);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = doctors;

    if (searchQuery) {
      filtered = filtered.filter(doctor =>
        doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.hospital.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedSpecialty !== 'all') {
      filtered = filtered.filter(doctor => doctor.specialty.toLowerCase() === selectedSpecialty.toLowerCase());
    }

    if (selectedHospital !== 'all') {
      filtered = filtered.filter(doctor => doctor.hospital === selectedHospital);
    }

    if (selectedConsultationType !== 'all') {
      filtered = filtered.filter(doctor => doctor.consultationType === selectedConsultationType);
    }

    // Apply sorting
    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'distance':
        filtered.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
        break;
      case 'experience':
        filtered.sort((a, b) => parseInt(b.experience) - parseInt(a.experience));
        break;
      case 'waitTime':
        filtered.sort((a, b) => {
          const aTime = parseInt(a.waitTime.split(' ')[0]);
          const bTime = parseInt(b.waitTime.split(' ')[0]);
          return aTime - bTime;
        });
        break;
      default:
        break;
    }

    setFilteredDoctors(filtered);
  }, [searchQuery, selectedSpecialty, selectedHospital, selectedConsultationType, sortBy]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const getConsultationTypeColor = (type: string) => {
    switch (type) {
      case 'in-person':
        return 'bg-health-aqua/10 text-health-aqua border-health-aqua/20';
      case 'virtual':
        return 'bg-health-teal/10 text-health-teal border-health-teal/20';
      case 'both':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-[calc(100vh-80px)] px-2 md:px-6 py-8 bg-health-light-gray max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-health-teal mx-auto"></div>
            <p className="mt-4 text-health-charcoal/60">Finding the best doctors for you...</p>
          </div>
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
              <h1 className="text-3xl font-montserrat font-bold text-white mb-2">Find Doctors</h1>
              <p className="text-teal-100">Discover and connect with qualified healthcare professionals</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-lg rounded-xl border-0">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
              <div className="p-3 bg-health-aqua/10 rounded-lg">
                <Stethoscope className="h-6 w-6 text-health-aqua" />
                </div>
                <div>
                <p className="text-2xl font-bold text-health-charcoal">{doctors.length}</p>
                <p className="text-sm text-health-charcoal/60">Available Doctors</p>
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
                <p className="text-2xl font-bold text-health-charcoal">6</p>
                <p className="text-sm text-health-charcoal/60">Specialties</p>
              </div>
              </div>
            </CardContent>
          </Card>
        <Card className="shadow-lg rounded-xl border-0">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                <Star className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                <p className="text-2xl font-bold text-health-charcoal">4.8</p>
                <p className="text-sm text-health-charcoal/60">Avg Rating</p>
              </div>
              </div>
            </CardContent>
          </Card>
        <Card className="shadow-lg rounded-xl border-0">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <ShieldCheck className="h-6 w-6 text-green-600" />
                </div>
                <div>
                <p className="text-2xl font-bold text-health-charcoal">100%</p>
                <p className="text-sm text-health-charcoal/60">Verified</p>
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
                    placeholder="Search doctors by name, specialty, or hospital..."
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
                <SelectItem value="distance">Nearest First</SelectItem>
                <SelectItem value="experience">Most Experienced</SelectItem>
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
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                <label className="text-sm font-medium text-health-charcoal mb-2 block">Specialty</label>
                  <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                  <SelectTrigger className="border-health-charcoal/20">
                      <SelectValue placeholder="All Specialties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Specialties</SelectItem>
                      <SelectItem value="cardiology">Cardiology</SelectItem>
                      <SelectItem value="neurology">Neurology</SelectItem>
                      <SelectItem value="pediatrics">Pediatrics</SelectItem>
                      <SelectItem value="orthopedics">Orthopedics</SelectItem>
                      <SelectItem value="dermatology">Dermatology</SelectItem>
                      <SelectItem value="psychiatry">Psychiatry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                <label className="text-sm font-medium text-health-charcoal mb-2 block">Hospital</label>
                  <Select value={selectedHospital} onValueChange={setSelectedHospital}>
                  <SelectTrigger className="border-health-charcoal/20">
                      <SelectValue placeholder="All Hospitals" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Hospitals</SelectItem>
                      <SelectItem value="City General Hospital">City General Hospital</SelectItem>
                      <SelectItem value="Metro Medical Center">Metro Medical Center</SelectItem>
                      <SelectItem value="Community Health Hospital">Community Health Hospital</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                <label className="text-sm font-medium text-health-charcoal mb-2 block">Consultation Type</label>
                <Select value={selectedConsultationType} onValueChange={setSelectedConsultationType}>
                  <SelectTrigger className="border-health-charcoal/20">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="in-person">In-person</SelectItem>
                      <SelectItem value="virtual">Virtual</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
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
            Showing {filteredDoctors.length} of {doctors.length} doctors
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

      {/* Doctors Grid/List */}
            {filteredDoctors.length === 0 ? (
        <Card className="shadow-lg rounded-xl border-0">
                <CardContent className="p-8 text-center">
            <Search className="h-12 w-12 text-health-charcoal/40 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-health-charcoal mb-2">No doctors found</h3>
            <p className="text-health-charcoal/60">Try adjusting your search criteria or filters</p>
                </CardContent>
              </Card>
            ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredDoctors.map((doctor) => (
            <Card key={doctor.id} className="shadow-lg rounded-xl border-0 hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6">
                <div className="flex items-start space-x-4 mb-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={doctor.photo} />
                    <AvatarFallback className="bg-health-aqua/10 text-health-aqua">
                      {doctor.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-semibold text-health-charcoal">{doctor.name}</h3>
                      {doctor.verified && (
                        <ShieldCheck className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <p className="text-sm text-health-aqua font-medium">{doctor.specialty}</p>
                    <p className="text-xs text-health-charcoal/60">{doctor.subSpecialty}</p>
                    <p className="text-xs text-health-charcoal/60">{doctor.hospital}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between">
                    <span className="text-sm text-health-charcoal/60">Experience:</span>
                    <span className="text-sm font-medium text-health-charcoal">{doctor.experience}</span>
                        </div>
                        <div className="flex items-center justify-between">
                    <span className="text-sm text-health-charcoal/60">Rating:</span>
                          <div className="flex items-center space-x-1">
                      {renderStars(doctor.rating)}
                      <span className="text-sm font-medium text-health-charcoal">{doctor.rating}</span>
                      <span className="text-xs text-health-charcoal/60">({doctor.reviews})</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                    <span className="text-sm text-health-charcoal/60">Fee:</span>
                    <span className="text-sm font-medium text-health-aqua">{doctor.consultationFee}</span>
                        </div>
                        <div className="flex items-center justify-between">
                    <span className="text-sm text-health-charcoal/60">Wait Time:</span>
                    <span className="text-sm font-medium text-health-charcoal">{doctor.waitTime}</span>
                        </div>
                        <div className="flex items-center justify-between">
                    <span className="text-sm text-health-charcoal/60">Distance:</span>
                    <span className="text-sm font-medium text-health-charcoal">{doctor.distance}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge className={getConsultationTypeColor(doctor.consultationType)}>
                          {doctor.consultationType}
                        </Badge>
                        {doctor.insurance && (
                    <Badge className="bg-green-100 text-green-800 border-green-200">Insurance</Badge>
                        )}
                        {doctor.emergencyAvailable && (
                    <Badge className="bg-red-100 text-red-800 border-red-200">Emergency</Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                    <span className="text-xs text-health-charcoal/60">Next: {doctor.nextAvailable}</span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                  <Button 
                    className="flex-1 bg-gradient-to-r from-health-aqua to-health-teal hover:from-health-teal hover:to-health-aqua text-white"
                    onClick={() => navigate(`/patient/doctor-details/${doctor.id}`, { state: { doctor } })}
                  >
                          <Calendar className="h-3 w-3 mr-1" />
                          Book
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                    onClick={() => navigate(`/patient/doctor-profile/${doctor.id}`, { state: { doctor } })}
                    className="border-health-charcoal/20"
                  >
                    <User className="h-3 w-3" />
                        </Button>
                  <Button variant="outline" size="sm" className="border-health-charcoal/20">
                          <MessageSquare className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
    </div>
  );
};

export default FindDoctors; 