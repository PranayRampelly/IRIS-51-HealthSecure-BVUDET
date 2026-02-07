import React, { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, Star, MapPin, Phone, Calendar, Clock, User,
  Stethoscope, Heart, Brain, Eye, Baby, CheckCircle, Award,
  Building2, Shield, Zap, Target, TrendingUp, Users, FileText,
  Video, Globe, Clock3, ShieldCheck, GraduationCap, BookOpen,
  Microscope, Pill, Activity, AlertTriangle, CheckSquare, Mail,
  MessageSquare, PhoneCall, Navigation, Route, Timer, Info,
  BarChart3, CalendarDays, Clock4, Trophy, Users2
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

interface DoctorAchievement {
  id: number;
  title: string;
  description: string;
  year: number;
  category: 'award' | 'certification' | 'publication' | 'achievement';
  icon: string;
}

interface DoctorStat {
  label: string;
  value: number;
  unit: string;
  icon: React.ReactNode;
  color: string;
}

const DoctorProfile = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
  const doctor = location.state?.doctor;

  // Mock achievements data
  const achievements: DoctorAchievement[] = [
    {
      id: 1,
      title: 'Top Cardiologist 2023',
      description: 'Recognized as one of the top cardiologists in the region',
      year: 2023,
      category: 'award',
      icon: 'Trophy'
    },
    {
      id: 2,
      title: 'Excellence in Patient Care',
      description: 'Award for outstanding patient care and satisfaction',
      year: 2022,
      category: 'award',
      icon: 'Award'
    },
    {
      id: 3,
      title: 'Board Certification - Interventional Cardiology',
      description: 'Advanced certification in interventional cardiology procedures',
      year: 2021,
      category: 'certification',
      icon: 'ShieldCheck'
    },
    {
      id: 4,
      title: 'Research Publication - Cardiac Interventions',
      description: 'Published research on innovative cardiac intervention techniques',
      year: 2023,
      category: 'publication',
      icon: 'BookOpen'
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

  const getAchievementIcon = (iconName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      Trophy: <Trophy className="h-5 w-5" />,
      Award: <Award className="h-5 w-5" />,
      ShieldCheck: <ShieldCheck className="h-5 w-5" />,
      BookOpen: <BookOpen className="h-5 w-5" />
    };
    return iconMap[iconName] || <Award className="h-5 w-5" />;
  };

  const getAchievementColor = (category: string) => {
    switch (category) {
      case 'award':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'certification':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'publication':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'achievement':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
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
          <Avatar className="h-32 w-32">
            <AvatarImage src={doctor.photo} />
            <AvatarFallback className="bg-health-aqua/10 text-health-aqua text-3xl">
              {doctor.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-4xl font-montserrat font-bold text-health-teal">{doctor.name}</h1>
              {doctor.verified && (
                <ShieldCheck className="h-8 w-8 text-green-500" />
              )}
            </div>
            <p className="text-xl text-health-aqua font-medium mb-1">{doctor.specialty}</p>
            <p className="text-lg text-health-charcoal/60 mb-2">{doctor.subSpecialty}</p>
            <p className="text-lg text-health-charcoal/60 mb-3">{doctor.hospital}</p>
            
            <div className="flex items-center space-x-6 text-sm text-health-charcoal/60">
              <div className="flex items-center space-x-1">
                {renderStars(doctor.rating)}
                <span className="ml-1 font-medium">({doctor.reviews} reviews)</span>
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
          {/* Performance Overview */}
          <Card className="shadow-lg rounded-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-health-aqua/10 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-health-aqua" />
                </div>
                Performance Overview
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="p-3 bg-health-aqua/10 rounded-lg w-fit mx-auto mb-2">
                    <Target className="h-6 w-6 text-health-aqua" />
                  </div>
                  <p className="text-2xl font-bold text-health-charcoal">{doctor.successRate}%</p>
                  <p className="text-sm text-health-charcoal/60">Success Rate</p>
                </div>
                <div className="text-center">
                  <div className="p-3 bg-health-teal/10 rounded-lg w-fit mx-auto mb-2">
                    <Heart className="h-6 w-6 text-health-teal" />
                  </div>
                  <p className="text-2xl font-bold text-health-charcoal">{doctor.patientSatisfaction}%</p>
                  <p className="text-sm text-health-charcoal/60">Patient Satisfaction</p>
                </div>
                <div className="text-center">
                  <div className="p-3 bg-purple-100 rounded-lg w-fit mx-auto mb-2">
                    <BookOpen className="h-6 w-6 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-health-charcoal">{doctor.publications}</p>
                  <p className="text-sm text-health-charcoal/60">Publications</p>
                </div>
                <div className="text-center">
                  <div className="p-3 bg-green-100 rounded-lg w-fit mx-auto mb-2">
                    <Users2 className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-health-charcoal">{doctor.reviews}</p>
                  <p className="text-sm text-health-charcoal/60">Patient Reviews</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Information Tabs */}
          <Card className="shadow-lg rounded-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-health-aqua/10 rounded-lg">
                  <User className="h-5 w-5 text-health-aqua" />
                </div>
                Professional Profile
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="achievements">Achievements</TabsTrigger>
                  <TabsTrigger value="procedures">Procedures</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-6 mt-6">
                  <div>
                    <h3 className="text-lg font-semibold text-health-charcoal mb-4">About Dr. {doctor.name.split(' ')[1]}</h3>
                    <p className="text-health-charcoal/80 leading-relaxed text-lg">
                      {doctor.bio}
                    </p>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-health-charcoal mb-3 flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-health-aqua" />
                        Education
                      </h4>
                      <p className="text-sm text-health-charcoal/60">{doctor.education}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-health-charcoal mb-3 flex items-center gap-2">
                        <Globe className="h-5 w-5 text-health-aqua" />
                        Languages
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {doctor.languages.map((language, index) => (
                          <Badge key={index} variant="outline" className="text-health-aqua border-health-aqua/20">
                            {language}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-health-charcoal mb-3 flex items-center gap-2">
                        <Clock className="h-5 w-5 text-health-aqua" />
                        Availability
                      </h4>
                      <p className="text-sm text-health-charcoal/60">{doctor.availability}</p>
                      <p className="text-sm text-health-charcoal/60 mt-1">Next available: {doctor.nextAvailable}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-health-charcoal mb-3 flex items-center gap-2">
                        <Stethoscope className="h-5 w-5 text-health-aqua" />
                        Consultation Type
                      </h4>
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

                <TabsContent value="achievements" className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {achievements.map((achievement) => (
                      <Card key={achievement.id} className="border-health-charcoal/20">
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg ${getAchievementColor(achievement.category)}`}>
                              {getAchievementIcon(achievement.icon)}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-health-charcoal mb-1">{achievement.title}</h4>
                              <p className="text-sm text-health-charcoal/60 mb-2">{achievement.description}</p>
                              <Badge variant="outline" className="text-xs">
                                {achievement.year}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="procedures" className="space-y-6 mt-6">
                  <div>
                    <h4 className="font-semibold text-health-charcoal mb-4 flex items-center gap-2">
                      <Microscope className="h-5 w-5 text-health-aqua" />
                      Procedures & Services
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {doctor.procedures.map((procedure, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-health-aqua/5 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span className="text-health-charcoal">{procedure}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="timeline" className="space-y-6 mt-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-3 h-3 bg-health-aqua rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-health-charcoal">2023 - Present</h4>
                        <p className="text-sm text-health-charcoal/60">Senior Cardiologist at {doctor.hospital}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-3 h-3 bg-health-teal rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-health-charcoal">2021 - 2023</h4>
                        <p className="text-sm text-health-charcoal/60">Cardiologist at Metro Medical Center</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-health-charcoal">2018 - 2021</h4>
                        <p className="text-sm text-health-charcoal/60">Residency at Johns Hopkins University</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-health-charcoal">2014 - 2018</h4>
                        <p className="text-sm text-health-charcoal/60">Medical School at Harvard University</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card className="shadow-lg rounded-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-health-aqua/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-health-aqua" />
                </div>
                Key Metrics
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-health-charcoal/60">Success Rate</span>
                  <span className="text-sm font-medium text-health-charcoal">{doctor.successRate}%</span>
                </div>
                <Progress value={doctor.successRate} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-health-charcoal/60">Patient Satisfaction</span>
                  <span className="text-sm font-medium text-health-charcoal">{doctor.patientSatisfaction}%</span>
                </div>
                <Progress value={doctor.patientSatisfaction} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-health-charcoal/60">Response Time</span>
                  <span className="text-sm font-medium text-health-charcoal">{doctor.responseTime}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div className="h-2 bg-health-aqua rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card className="shadow-lg rounded-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-health-aqua/10 rounded-lg">
                  <ShieldCheck className="h-5 w-5 text-health-aqua" />
                </div>
                Certifications
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {doctor.certifications.map((cert, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-health-charcoal/60">{cert}</span>
                </div>
              ))}
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
              <Button 
                className="w-full bg-gradient-to-r from-health-aqua to-health-teal hover:from-health-teal hover:to-health-aqua text-white"
                onClick={() => navigate(`/patient/doctor-details/${doctor.id}`, { state: { doctor } })}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Book Appointment
              </Button>
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

export default DoctorProfile;
