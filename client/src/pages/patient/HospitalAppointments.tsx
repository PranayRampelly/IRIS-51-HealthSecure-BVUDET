import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Calendar, Search, Filter, Star, MapPin, Phone, Clock,
  User, Hospital, Stethoscope, Heart, Brain, Eye, Baby,
  ChevronDown, ChevronUp, AlertTriangle, CheckCircle, XCircle,
  ArrowRight, Info, Plus, Minus, PhoneCall, Mail, MessageSquare,
  Navigation, Route, Timer, RefreshCw, Bell, BellOff,
  Edit, Trash2, Video, FileText, Shield, Award, TrendingUp,
  Users, Globe, Clock3, ShieldCheck, GraduationCap, BookOpen,
  Microscope, Pill, Activity, CheckSquare, Zap, Target
} from 'lucide-react';

interface HospitalAppointment {
  id: number;
  patientName: string;
  doctorName: string;
  doctorPhoto: string;
  specialty: string;
  subSpecialty: string;
  hospital: string;
  hospitalLogo: string;
  date: string;
  time: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  type: 'in-person' | 'virtual' | 'emergency';
  notes: string;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  insurance: boolean;
  copay: number;
  totalCost: number;
  location: string;
  duration: string;
  preparation: string[];
  documents: string[];
  doctorRating: number;
  doctorExperience: string;
  doctorEducation: string;
  hospitalRating: number;
  distance: string;
  waitTime: string;
  isFavorite: boolean;
  consultationType: 'initial' | 'follow-up' | 'emergency' | 'routine';
  emergencyAvailable: boolean;
  verified: boolean;
  responseTime: string;
  successRate: number;
  patientSatisfaction: number;
}

const HospitalAppointments: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<HospitalAppointment | null>(null);
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedHospital, setSelectedHospital] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Enhanced mock data
  const appointments: HospitalAppointment[] = [
    {
      id: 1,
      patientName: 'John Smith',
      doctorName: 'Dr. Sarah Johnson',
      doctorPhoto: '/api/doctor1.jpg',
      specialty: 'Cardiology',
      subSpecialty: 'Interventional Cardiology',
      hospital: 'City General Hospital',
      hospitalLogo: '/api/hospital1.jpg',
      date: '2024-01-25',
      time: '10:00 AM',
      status: 'confirmed',
      type: 'in-person',
      notes: 'Follow-up appointment for heart condition. Please bring recent test results.',
      urgency: 'medium',
      insurance: true,
      copay: 50,
      totalCost: 200,
      location: 'Cardiology Department, 2nd Floor',
      duration: '45 minutes',
      preparation: ['Fasting for 12 hours', 'Bring ID and insurance card', 'List of current medications'],
      documents: ['Recent blood work', 'ECG results', 'Insurance card'],
      doctorRating: 4.8,
      doctorExperience: '15 years',
      doctorEducation: 'MBBS, MD Cardiology',
      hospitalRating: 4.6,
      distance: '2.5 km',
      waitTime: '15 minutes',
      isFavorite: true,
      consultationType: 'follow-up',
      emergencyAvailable: true,
      verified: true,
      responseTime: '2 hours',
      successRate: 98,
      patientSatisfaction: 95
    },
    {
      id: 2,
      patientName: 'Sarah Johnson',
      doctorName: 'Dr. Michael Chen',
      doctorPhoto: '/api/doctor2.jpg',
      specialty: 'Neurology',
      subSpecialty: 'Movement Disorders',
      hospital: 'Metro Medical Center',
      hospitalLogo: '/api/hospital2.jpg',
      date: '2024-01-28',
      time: '2:30 PM',
      status: 'scheduled',
      type: 'virtual',
      notes: 'Initial consultation for headaches. Virtual appointment via secure platform.',
      urgency: 'low',
      insurance: true,
      copay: 75,
      totalCost: 250,
      location: 'Virtual Consultation',
      duration: '30 minutes',
      preparation: ['Test video call connection', 'Prepare symptom timeline', 'List of medications'],
      documents: ['Medical history', 'Symptom diary', 'Insurance card'],
      doctorRating: 4.9,
      doctorExperience: '12 years',
      doctorEducation: 'MBBS, MD Neurology',
      hospitalRating: 4.7,
      distance: '5.2 km',
      waitTime: '5 minutes',
      isFavorite: false,
      consultationType: 'initial',
      emergencyAvailable: true,
      verified: true,
      responseTime: '1 hour',
      successRate: 96,
      patientSatisfaction: 92
    },
    {
      id: 3,
      patientName: 'Emily Rodriguez',
      doctorName: 'Dr. Robert Wilson',
      doctorPhoto: '/api/doctor3.jpg',
      specialty: 'Orthopedics',
      subSpecialty: 'Joint Replacement',
      hospital: 'City General Hospital',
      hospitalLogo: '/api/hospital1.jpg',
      date: '2024-01-22',
      time: '3:00 PM',
      status: 'completed',
      type: 'in-person',
      notes: 'Post-surgery follow-up. Knee replacement recovery progressing well.',
      urgency: 'low',
      insurance: true,
      copay: 25,
      totalCost: 150,
      location: 'Orthopedics Department, 1st Floor',
      duration: '30 minutes',
      preparation: ['Bring X-ray results', 'Wear comfortable clothing', 'List of current medications'],
      documents: ['Post-surgery X-rays', 'Physical therapy notes', 'Insurance card'],
      doctorRating: 4.7,
      doctorExperience: '18 years',
      doctorEducation: 'MBBS, MS Orthopedics',
      hospitalRating: 4.6,
      distance: '2.5 km',
      waitTime: '10 minutes',
      isFavorite: true,
      consultationType: 'follow-up',
      emergencyAvailable: true,
      verified: true,
      responseTime: '3 hours',
      successRate: 97,
      patientSatisfaction: 94
    },
    {
      id: 4,
      patientName: 'David Wilson',
      doctorName: 'Dr. Lisa Thompson',
      doctorPhoto: '/api/doctor4.jpg',
      specialty: 'Dermatology',
      subSpecialty: 'Cosmetic Dermatology',
      hospital: 'Metro Medical Center',
      hospitalLogo: '/api/hospital2.jpg',
      date: '2024-01-26',
      time: '11:00 AM',
      status: 'scheduled',
      type: 'in-person',
      notes: 'Annual skin cancer screening. Please arrive 15 minutes early.',
      urgency: 'low',
      insurance: true,
      copay: 40,
      totalCost: 180,
      location: 'Dermatology Clinic, 3rd Floor',
      duration: '20 minutes',
      preparation: ['Remove makeup', 'Wear loose clothing', 'Bring list of skin concerns'],
      documents: ['Previous skin exam results', 'Insurance card', 'Photo ID'],
      doctorRating: 4.6,
      doctorExperience: '10 years',
      doctorEducation: 'MBBS, MD Dermatology',
      hospitalRating: 4.7,
      distance: '5.2 km',
      waitTime: '20 minutes',
      isFavorite: false,
      consultationType: 'routine',
      emergencyAvailable: false,
      verified: true,
      responseTime: '4 hours',
      successRate: 94,
      patientSatisfaction: 89
    }
  ];

  const [filteredAppointments, setFilteredAppointments] = useState<HospitalAppointment[]>(appointments);

  // Filter and sort appointments
  const sortedAppointments = useMemo(() => {
    let filtered = appointments.filter(appointment => {
      const matchesSearch = appointment.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           appointment.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           appointment.hospital.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || appointment.status === selectedStatus;
      const matchesType = selectedType === 'all' || appointment.type === selectedType;
      const matchesHospital = selectedHospital === 'all' || appointment.hospital === selectedHospital;

      return matchesSearch && matchesStatus && matchesType && matchesHospital;
    });

    // Apply tab filter
    switch (activeTab) {
      case 'upcoming':
        filtered = filtered.filter(appointment => 
          ['scheduled', 'confirmed'].includes(appointment.status)
        );
        break;
      case 'completed':
        filtered = filtered.filter(appointment => appointment.status === 'completed');
        break;
      case 'cancelled':
        filtered = filtered.filter(appointment => appointment.status === 'cancelled');
        break;
      default:
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case 'date':
        filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'time':
        filtered.sort((a, b) => a.time.localeCompare(b.time));
        break;
      case 'doctor':
        filtered.sort((a, b) => a.doctorName.localeCompare(b.doctorName));
        break;
      case 'hospital':
        filtered.sort((a, b) => a.hospital.localeCompare(b.hospital));
        break;
      case 'rating':
        filtered.sort((a, b) => b.doctorRating - a.doctorRating);
        break;
      default:
        break;
    }

    return filtered;
  }, [appointments, searchQuery, selectedStatus, selectedType, selectedHospital, activeTab, sortBy]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'rescheduled':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'emergency':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'in-person':
        return 'bg-health-aqua/10 text-health-aqua border-health-aqua/20';
      case 'virtual':
        return 'bg-health-teal/10 text-health-teal border-health-teal/20';
      case 'emergency':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const handleViewDetails = (appointment: HospitalAppointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentDialog(true);
  };

  const handleEditAppointment = (appointment: HospitalAppointment) => {
    navigate(`/patient/edit-appointment/${appointment.id}`, { state: { appointment } });
  };

  const handleRescheduleAppointment = (appointment: HospitalAppointment) => {
    navigate(`/patient/reschedule-appointment/${appointment.id}`, { state: { appointment } });
  };

  const handleCancelAppointment = (appointment: HospitalAppointment) => {
    navigate(`/patient/cancel-appointment/${appointment.id}`, { state: { appointment } });
  };

  const handleContactDoctor = (appointment: HospitalAppointment) => {
    navigate(`/patient/contact-doctor/${appointment.id}`, { state: { appointment } });
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
            <h1 className="text-3xl font-montserrat font-bold text-white mb-2">Hospital Appointments</h1>
            <p className="text-teal-100">Manage your hospital appointments and consultations</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-lg rounded-xl border-0">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-health-aqua/10 rounded-lg">
                <Calendar className="h-6 w-6 text-health-aqua" />
              </div>
              <div>
                <p className="text-2xl font-bold text-health-charcoal">{appointments.length}</p>
                <p className="text-sm text-health-charcoal/60">Total Appointments</p>
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
                <p className="text-2xl font-bold text-health-charcoal">
                  {appointments.filter(a => ['scheduled', 'confirmed'].includes(a.status)).length}
                </p>
                <p className="text-sm text-health-charcoal/60">Upcoming</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg rounded-xl border-0">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-health-teal/10 rounded-lg">
                <User className="h-6 w-6 text-health-teal" />
              </div>
              <div>
                <p className="text-2xl font-bold text-health-charcoal">
                  {appointments.filter(a => a.status === 'completed').length}
                </p>
                <p className="text-sm text-health-charcoal/60">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg rounded-xl border-0">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Hospital className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-health-charcoal">
                  {new Set(appointments.map(a => a.hospital)).size}
                </p>
                <p className="text-sm text-health-charcoal/60">Hospitals</p>
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
                  placeholder="Search appointments by doctor, specialty, or hospital..."
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
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="time">Time</SelectItem>
                <SelectItem value="doctor">Doctor</SelectItem>
                <SelectItem value="hospital">Hospital</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
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

            {/* New Appointment */}
            <Button 
              className="bg-gradient-to-r from-health-aqua to-health-teal hover:from-health-teal hover:to-health-aqua text-white"
              onClick={() => navigate('/patient/book-appointment')}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Appointment
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-health-charcoal mb-2 block">Status</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="border-health-charcoal/20">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-health-charcoal mb-2 block">Type</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="border-health-charcoal/20">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="in-person">In-person</SelectItem>
                    <SelectItem value="virtual">Virtual</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-health-charcoal/60">
          Showing {sortedAppointments.length} of {appointments.length} appointments
        </p>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="border-health-charcoal/20">
            <Calendar className="h-4 w-4 mr-1" />
            Calendar View
          </Button>
          <Button variant="outline" size="sm" className="border-health-charcoal/20">
            <ArrowRight className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-4 bg-white shadow-lg rounded-xl border-0">
          <TabsTrigger value="upcoming" className="data-[state=active]:bg-health-aqua data-[state=active]:text-white">
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-health-aqua data-[state=active]:text-white">
            Completed
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="data-[state=active]:bg-health-aqua data-[state=active]:text-white">
            Cancelled
          </TabsTrigger>
          <TabsTrigger value="all" className="data-[state=active]:bg-health-aqua data-[state=active]:text-white">
            All
          </TabsTrigger>
        </TabsList>

        {/* Appointments List */}
        <TabsContent value={activeTab} className="space-y-4">
          {sortedAppointments.length === 0 ? (
            <Card className="shadow-lg rounded-xl border-0">
              <CardContent className="p-8 text-center">
                <Calendar className="h-16 w-16 text-health-charcoal/40 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-health-charcoal mb-2">No appointments found</h3>
                <p className="text-health-charcoal/60 mb-4">Try adjusting your search criteria or filters</p>
                <Button 
                  className="bg-gradient-to-r from-health-aqua to-health-teal hover:from-health-teal hover:to-health-aqua text-white"
                  onClick={() => navigate('/patient/book-appointment')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Book New Appointment
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {sortedAppointments.map((appointment) => (
                <Card key={appointment.id} className="group hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm border-health-blue-gray/20">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4 mb-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={appointment.doctorPhoto} />
                        <AvatarFallback className="bg-health-aqua/10 text-health-aqua">
                          {appointment.doctorName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-health-charcoal">{appointment.doctorName}</h3>
                          {appointment.verified && (
                            <ShieldCheck className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <p className="text-sm text-health-aqua font-medium">{appointment.specialty}</p>
                        <p className="text-xs text-health-charcoal/60">{appointment.subSpecialty}</p>
                        <p className="text-xs text-health-charcoal/60">{appointment.hospital}</p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-health-charcoal/60">Date & Time:</span>
                        <span className="text-sm font-medium text-health-charcoal">
                          {appointment.date} at {appointment.time}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-health-charcoal/60">Duration:</span>
                        <span className="text-sm font-medium text-health-charcoal">{appointment.duration}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-health-charcoal/60">Rating:</span>
                        <div className="flex items-center space-x-1">
                          {renderStars(appointment.doctorRating)}
                          <span className="text-sm font-medium text-health-charcoal">{appointment.doctorRating}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-health-charcoal/60">Cost:</span>
                        <span className="text-sm font-medium text-health-aqua">₹{appointment.totalCost}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-health-charcoal/60">Location:</span>
                        <span className="text-sm font-medium text-health-charcoal">{appointment.location}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                      <Badge className={getTypeColor(appointment.type)}>
                        {appointment.type}
                      </Badge>
                      <Badge className={getUrgencyColor(appointment.urgency)}>
                        {appointment.urgency}
                      </Badge>
                      {appointment.insurance && (
                        <Badge className="bg-green-100 text-green-800 border-green-200">Insurance</Badge>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        className="flex-1 bg-gradient-to-r from-health-aqua to-health-teal hover:from-health-teal hover:to-health-aqua text-white"
                        onClick={() => handleViewDetails(appointment)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleContactDoctor(appointment)}
                        className="border-health-charcoal/20"
                      >
                        <MessageSquare className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRescheduleAppointment(appointment)}
                        className="border-health-charcoal/20"
                      >
                        <Calendar className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelAppointment(appointment)}
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Appointment Details Dialog */}
      <Dialog open={showAppointmentDialog} onOpenChange={setShowAppointmentDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-health-aqua" />
              <span>Appointment Details</span>
            </DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={selectedAppointment.doctorPhoto} />
                  <AvatarFallback className="bg-health-aqua/10 text-health-aqua text-xl">
                    {selectedAppointment.doctorName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-2xl font-bold text-health-charcoal">{selectedAppointment.doctorName}</h3>
                    {selectedAppointment.verified && (
                      <ShieldCheck className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <p className="text-lg text-health-aqua font-medium mb-1">{selectedAppointment.specialty}</p>
                  <p className="text-sm text-health-charcoal/60 mb-2">{selectedAppointment.subSpecialty}</p>
                  <p className="text-sm text-health-charcoal/60">{selectedAppointment.hospital}</p>
                  <div className="flex items-center space-x-1 mt-2">
                    {renderStars(selectedAppointment.doctorRating)}
                    <span className="text-sm text-health-charcoal/60 ml-1">({selectedAppointment.doctorRating})</span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gradient-to-r from-health-aqua/10 to-health-teal/10 border border-health-aqua/20 rounded-lg text-center">
                  <p className="text-2xl font-bold text-health-aqua">{selectedAppointment.date}</p>
                  <p className="text-sm text-health-charcoal/60">Date</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-health-aqua/10 to-health-teal/10 border border-health-aqua/20 rounded-lg text-center">
                  <p className="text-2xl font-bold text-health-aqua">{selectedAppointment.time}</p>
                  <p className="text-sm text-health-charcoal/60">Time</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-health-aqua/10 to-health-teal/10 border border-health-aqua/20 rounded-lg text-center">
                  <p className="text-2xl font-bold text-health-aqua">{selectedAppointment.duration}</p>
                  <p className="text-sm text-health-charcoal/60">Duration</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-health-aqua/10 to-health-teal/10 border border-health-aqua/20 rounded-lg text-center">
                  <p className="text-2xl font-bold text-health-aqua">₹{selectedAppointment.copay}</p>
                  <p className="text-sm text-health-charcoal/60">Copay</p>
                </div>
              </div>

              {/* Tabs for Details */}
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-white shadow-lg rounded-xl border-0">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-health-aqua data-[state=active]:text-white">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="preparation" className="data-[state=active]:bg-health-aqua data-[state=active]:text-white">
                    Preparation
                  </TabsTrigger>
                  <TabsTrigger value="documents" className="data-[state=active]:bg-health-aqua data-[state=active]:text-white">
                    Documents
                  </TabsTrigger>
                  <TabsTrigger value="actions" className="data-[state=active]:bg-health-aqua data-[state=active]:text-white">
                    Actions
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-health-charcoal mb-2">Appointment Details</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-health-charcoal/60">Type:</span>
                          <Badge className={getTypeColor(selectedAppointment.type)}>
                            {selectedAppointment.type}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-health-charcoal/60">Location:</span>
                          <span className="text-sm font-medium">{selectedAppointment.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-health-charcoal/60">Urgency:</span>
                          <Badge className={getUrgencyColor(selectedAppointment.urgency)}>
                            {selectedAppointment.urgency}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-health-charcoal/60">Insurance:</span>
                          <span className="text-sm font-medium">
                            {selectedAppointment.insurance ? 'Covered' : 'Not covered'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-health-charcoal/60">Experience:</span>
                          <span className="text-sm font-medium">{selectedAppointment.doctorExperience}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-health-charcoal/60">Education:</span>
                          <span className="text-sm font-medium">{selectedAppointment.doctorEducation}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-health-charcoal mb-2">Cost Information</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-health-charcoal/60">Total Cost:</span>
                          <span className="text-sm font-medium">₹{selectedAppointment.totalCost}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-health-charcoal/60">Copay:</span>
                          <span className="text-sm font-medium">₹{selectedAppointment.copay}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-health-charcoal/60">Insurance Coverage:</span>
                          <span className="text-sm font-medium">
                            ₹{selectedAppointment.totalCost - selectedAppointment.copay}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-health-charcoal/60">Success Rate:</span>
                          <span className="text-sm font-medium">{selectedAppointment.successRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-health-charcoal/60">Patient Satisfaction:</span>
                          <span className="text-sm font-medium">{selectedAppointment.patientSatisfaction}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-health-charcoal mb-2">Notes</h4>
                    <p className="text-sm text-health-charcoal/60">{selectedAppointment.notes}</p>
                  </div>
                </TabsContent>

                <TabsContent value="preparation" className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-health-charcoal mb-2">Preparation Instructions</h4>
                    <div className="space-y-2">
                      {selectedAppointment.preparation.map((item, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-health-charcoal/60">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="documents" className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-health-charcoal mb-2">Required Documents</h4>
                    <div className="space-y-2">
                      {selectedAppointment.documents.map((doc, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-health-aqua" />
                          <span className="text-sm text-health-charcoal/60">{doc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="actions" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      className="w-full bg-gradient-to-r from-health-aqua to-health-teal hover:from-health-teal hover:to-health-aqua text-white"
                      onClick={() => handleRescheduleAppointment(selectedAppointment)}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Reschedule
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full border-health-charcoal/20"
                      onClick={() => handleContactDoctor(selectedAppointment)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contact Doctor
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full border-health-charcoal/20"
                      onClick={() => handleEditAppointment(selectedAppointment)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Details
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => handleCancelAppointment(selectedAppointment)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel Appointment
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HospitalAppointments; 