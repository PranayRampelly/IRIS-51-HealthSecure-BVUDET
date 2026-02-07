import React, { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, Star, MapPin, Phone, Calendar, Clock, User,
  Stethoscope, Heart, Brain, Eye, Baby, CheckCircle, Award,
  Building2, Shield, Zap, Target, TrendingUp, Users, FileText,
  Video, Globe, Clock3, ShieldCheck, GraduationCap, BookOpen,
  Microscope, Pill, Activity, AlertTriangle, CheckSquare, Mail,
  MessageSquare, PhoneCall, Navigation, Route, Timer, Info
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

interface DoctorReview {
  id: number;
  doctorId: number;
  patientName: string;
  rating: number;
  comment: string;
  date: string;
  service: string;
  visitType: string;
}

const DoctorDetails = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [consultationType, setConsultationType] = useState<'in-person' | 'virtual'>('in-person');
  const [reason, setReason] = useState('');
  
  const doctor = location.state?.doctor;

  // Mock reviews data
  const reviews: DoctorReview[] = [
    {
      id: 1,
      doctorId: 1,
      patientName: 'John D.',
      rating: 5,
      comment: 'Dr. Johnson is exceptional. She took the time to explain everything clearly and made me feel comfortable throughout the entire process.',
      date: '2024-01-15',
      service: 'Cardiac Consultation',
      visitType: 'In-person'
    },
    {
      id: 2,
      doctorId: 1,
      patientName: 'Maria S.',
      rating: 4,
      comment: 'Very professional and knowledgeable. The wait time was a bit long but worth it for the quality of care.',
      date: '2024-01-10',
      service: 'Follow-up',
      visitType: 'Virtual'
    }
  ];

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

  if (!doctor) {
    return (
      <div className="w-full min-h-[calc(100vh-80px)] px-2 md:px-6 py-8 bg-health-light-gray max-w-7xl mx-auto">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-health-charcoal mb-2">Doctor Not Found</h2>
          <p className="text-health-charcoal/60 mb-4">The doctor information could not be loaded.</p>
          <Button onClick={() => navigate('/patient/find-doctors')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Find Doctors
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-80px)] px-2 md:px-6 py-8 bg-health-light-gray max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/patient/find-doctors')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Find Doctors
        </Button>
        
        <div className="flex items-start space-x-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={doctor.photo} />
            <AvatarFallback className="bg-health-aqua/10 text-health-aqua text-2xl">
              {doctor.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-montserrat font-bold text-health-teal">{doctor.name}</h1>
              {doctor.verified && (
                <ShieldCheck className="h-6 w-6 text-green-500" />
              )}
            </div>
            <p className="text-lg text-health-aqua font-medium mb-1">{doctor.specialty}</p>
            <p className="text-sm text-health-charcoal/60 mb-2">{doctor.subSpecialty}</p>
            <p className="text-sm text-health-charcoal/60 mb-3">{doctor.hospital}</p>
            
            <div className="flex items-center space-x-4 text-sm text-health-charcoal/60">
              <div className="flex items-center space-x-1">
                {renderStars(doctor.rating)}
                <span className="ml-1">({doctor.reviews} reviews)</span>
              </div>
              <span>• {doctor.experience} experience</span>
              <span>• {doctor.distance}</span>
              <span>• {doctor.consultationFee}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Doctor Information Tabs */}
          <Card className="shadow-lg rounded-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-health-aqua/10 rounded-lg">
                  <Stethoscope className="h-5 w-5 text-health-aqua" />
                </div>
                Doctor Information
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="credentials">Credentials</TabsTrigger>
                  <TabsTrigger value="procedures">Procedures</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-6 mt-6">
                  <div>
                    <h3 className="text-lg font-semibold text-health-charcoal mb-4">About Dr. {doctor.name.split(' ')[1]}</h3>
                    <p className="text-health-charcoal/80 leading-relaxed">
                      {doctor.bio}
                    </p>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-health-charcoal mb-2">Education</h4>
                      <p className="text-sm text-health-charcoal/60">{doctor.education}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-health-charcoal mb-2">Languages</h4>
                      <div className="flex flex-wrap gap-2">
                        {doctor.languages.map((language, index) => (
                          <Badge key={index} variant="outline" className="text-health-aqua border-health-aqua/20">
                            {language}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-health-charcoal mb-2">Availability</h4>
                      <p className="text-sm text-health-charcoal/60">{doctor.availability}</p>
                      <p className="text-sm text-health-charcoal/60 mt-1">Next available: {doctor.nextAvailable}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-health-charcoal mb-2">Consultation Type</h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge className={getConsultationTypeColor(doctor.consultationType)}>
                          {doctor.consultationType}
                        </Badge>
                        {doctor.emergencyAvailable && (
                          <Badge className="bg-red-100 text-red-800 border-red-200">Emergency Available</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="credentials" className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-health-charcoal mb-2">Certifications</h4>
                      <div className="space-y-2">
                        {doctor.certifications.map((cert, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-health-charcoal/60">{cert}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-health-charcoal mb-2">Awards</h4>
                      <div className="space-y-2">
                        {doctor.awards.map((award, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Award className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm text-health-charcoal/60">{award}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="procedures" className="space-y-6 mt-6">
                  <div>
                    <h4 className="font-semibold text-health-charcoal mb-2">Procedures & Services</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {doctor.procedures.map((procedure, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-health-charcoal/60">{procedure}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="reviews" className="space-y-6 mt-6">
                  <div className="space-y-4">
                    {reviews.filter(review => review.doctorId === doctor.id).map((review) => (
                      <div key={review.id} className="border border-health-charcoal/20 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-health-charcoal">{review.patientName}</span>
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-health-charcoal/50">{review.date}</span>
                        </div>
                        <p className="text-sm text-health-charcoal/60 mb-2">{review.comment}</p>
                        <div className="flex items-center space-x-4 text-xs text-health-charcoal/50">
                          <span>Service: {review.service}</span>
                          <span>Type: {review.visitType}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Booking Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card className="shadow-lg rounded-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-health-aqua/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-health-aqua" />
                </div>
                Performance Stats
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-health-charcoal/60">Success Rate</span>
                <span className="font-bold text-health-aqua">{doctor.successRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-health-charcoal/60">Patient Satisfaction</span>
                <span className="font-bold text-health-aqua">{doctor.patientSatisfaction}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-health-charcoal/60">Response Time</span>
                <span className="font-bold text-health-aqua">{doctor.responseTime}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-health-charcoal/60">Publications</span>
                <span className="font-bold text-health-aqua">{doctor.publications}</span>
              </div>
            </CardContent>
          </Card>

          {/* Booking Form */}
          <Card className="shadow-lg rounded-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-health-aqua/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-health-aqua" />
                </div>
                Book Appointment
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="consultationType">Consultation Type</Label>
                <Select value={consultationType} onValueChange={(value: 'in-person' | 'virtual') => setConsultationType(value)}>
                  <SelectTrigger className="mt-1 border-health-charcoal/20">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-person">In-person</SelectItem>
                    <SelectItem value="virtual">Virtual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="date">Preferred Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="mt-1 border-health-charcoal/20"
                />
              </div>

              <div>
                <Label htmlFor="time">Preferred Time</Label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger className="mt-1 border-health-charcoal/20">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="09:00">9:00 AM</SelectItem>
                    <SelectItem value="10:00">10:00 AM</SelectItem>
                    <SelectItem value="11:00">11:00 AM</SelectItem>
                    <SelectItem value="14:00">2:00 PM</SelectItem>
                    <SelectItem value="15:00">3:00 PM</SelectItem>
                    <SelectItem value="16:00">4:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="reason">Reason for Visit</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Briefly describe your symptoms or reason for consultation..."
                  className="mt-1 border-health-charcoal/20"
                  rows={3}
                />
              </div>

              <Button 
                className="w-full bg-gradient-to-r from-health-aqua to-health-teal hover:from-health-teal hover:to-health-aqua text-white"
                onClick={() => navigate('/patient/booking-confirmation', { 
                  state: { 
                    bookingId: 'AP' + Date.now(),
                    doctor,
                    appointmentDetails: {
                      date: selectedDate,
                      time: selectedTime,
                      type: consultationType,
                      reason
                    }
                  } 
                })}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Book Appointment
              </Button>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="shadow-lg rounded-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-health-aqua/10 rounded-lg">
                  <Phone className="h-5 w-5 text-health-aqua" />
                </div>
                Contact Information
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-health-aqua" />
                <span className="text-sm text-health-charcoal">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-health-aqua" />
                <span className="text-sm text-health-charcoal">dr.{doctor.name.toLowerCase().replace(' ', '.')}@healthsecure.com</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-health-aqua" />
                <span className="text-sm text-health-charcoal">{doctor.hospital}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-health-aqua" />
                <span className="text-sm text-health-charcoal">{doctor.availability}</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-lg rounded-xl border-0">
            <CardContent className="p-4 space-y-3">
              <Button variant="outline" className="w-full border-health-charcoal/20">
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Message
              </Button>
              <Button variant="outline" className="w-full border-health-charcoal/20">
                <Video className="h-4 w-4 mr-2" />
                Video Call
              </Button>
              <Button variant="outline" className="w-full border-health-charcoal/20">
                <Navigation className="h-4 w-4 mr-2" />
                Get Directions
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetails;

