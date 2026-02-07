import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, ArrowLeft, Send, Clock, MapPin, User, Hospital,
  Stethoscope, Heart, Brain, Eye, Baby, CheckCircle, AlertTriangle,
  Info, Plus, Minus, PhoneCall, Mail, MessageSquare, Shield,
  Award, TrendingUp, Users, FileText, Video, Globe, Clock3,
  ShieldCheck, GraduationCap, BookOpen, Microscope, Pill, Activity,
  Phone, MessageCircle, Video as VideoIcon, FileText as FileTextIcon,
  Zap
} from 'lucide-react';

interface Appointment {
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
  doctorEmail: string;
  doctorPhone: string;
  doctorAvailability: string;
}

const ContactDoctor: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [contactMethod, setContactMethod] = useState('message');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [urgency, setUrgency] = useState('normal');
  const [includeAppointmentDetails, setIncludeAppointmentDetails] = useState(true);
  
  const appointment = location.state?.appointment as Appointment;

  const contactMethods = [
    { id: 'message', label: 'Send Message', icon: MessageSquare, description: 'Send a secure message to the doctor' },
    { id: 'call', label: 'Request Call', icon: PhoneCall, description: 'Request the doctor to call you back' },
    { id: 'video', label: 'Video Consultation', icon: VideoIcon, description: 'Schedule a quick video consultation' },
    { id: 'file', label: 'Share Documents', icon: FileTextIcon, description: 'Share medical documents or reports' }
  ];

  const urgencyLevels = [
    { id: 'low', label: 'Low Priority', description: 'General questions or non-urgent matters' },
    { id: 'normal', label: 'Normal Priority', description: 'Standard appointment-related questions' },
    { id: 'high', label: 'High Priority', description: 'Urgent medical concerns or appointment changes' },
    { id: 'emergency', label: 'Emergency', description: 'Critical medical issues requiring immediate attention' }
  ];

  const subjectSuggestions = [
    'Appointment confirmation',
    'Reschedule request',
    'Preparation questions',
    'Medical concerns',
    'Document submission',
    'Insurance questions',
    'Prescription refill',
    'Follow-up questions',
    'Other'
  ];

  if (!appointment) {
    return (
      <div className="w-full min-h-[calc(100vh-80px)] px-2 md:px-6 py-8 bg-health-light-gray max-w-7xl mx-auto">
        <div className="text-center">
          <div className="p-4 bg-red-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <AlertTriangle className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-health-charcoal mb-2">Appointment Not Found</h2>
          <p className="text-health-charcoal/60 mb-4">The appointment information could not be loaded.</p>
          <Button onClick={() => navigate('/patient/hospital-appointments')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Appointments
          </Button>
        </div>
      </div>
    );
  }

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      alert('Please fill in all required fields');
      return;
    }
    
    setSending(true);
    // Simulate API call
    setTimeout(() => {
      setSending(false);
      navigate('/patient/hospital-appointments');
    }, 2000);
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

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'emergency':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] px-2 md:px-6 py-8 bg-health-light-gray max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/patient/hospital-appointments')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Appointments
        </Button>
        
        <h1 className="text-3xl font-montserrat font-bold text-health-teal mb-1">Contact Doctor</h1>
        <p className="text-health-charcoal">Get in touch with your doctor about your appointment</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Method Selection */}
          <Card className="shadow-lg rounded-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-health-aqua/10 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-health-aqua" />
                </div>
                Choose Contact Method
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contactMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <Button
                      key={method.id}
                      variant={contactMethod === method.id ? "default" : "outline"}
                      className={`h-auto p-4 justify-start ${
                        contactMethod === method.id 
                          ? "bg-health-aqua text-white" 
                          : "border-health-charcoal/20 hover:border-health-aqua"
                      }`}
                      onClick={() => setContactMethod(method.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <Icon className="h-5 w-5 mt-0.5" />
                        <div className="text-left">
                          <div className="font-medium">{method.label}</div>
                          <div className="text-xs opacity-80">{method.description}</div>
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Message Form */}
          <Card className="shadow-lg rounded-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-health-teal/10 rounded-lg">
                  <FileText className="h-5 w-5 text-health-teal" />
                </div>
                Message Details
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subject" className="text-sm font-medium text-health-charcoal">
                    Subject *
                  </Label>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger className="mt-1 border-health-charcoal/20">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjectSuggestions.map((suggestion) => (
                        <SelectItem key={suggestion} value={suggestion}>
                          {suggestion}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="urgency" className="text-sm font-medium text-health-charcoal">
                    Urgency Level
                  </Label>
                  <Select value={urgency} onValueChange={setUrgency}>
                    <SelectTrigger className="mt-1 border-health-charcoal/20">
                      <SelectValue placeholder="Select urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      {urgencyLevels.map((level) => (
                        <SelectItem key={level.id} value={level.id}>
                          <div className="flex items-center space-x-2">
                            <span>{level.label}</span>
                            <Badge className={getUrgencyColor(level.id)}>
                              {level.id}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="message" className="text-sm font-medium text-health-charcoal">
                  Message *
                </Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mt-1 border-health-charcoal/20 focus:border-health-aqua"
                  placeholder="Please describe your question or concern..."
                  rows={6}
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="includeAppointmentDetails"
                  checked={includeAppointmentDetails}
                  onChange={(e) => setIncludeAppointmentDetails(e.target.checked)}
                  className="rounded border-health-charcoal/20"
                />
                <Label htmlFor="includeAppointmentDetails" className="text-sm text-health-charcoal">
                  Include appointment details in the message
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Appointment Details */}
          <Card className="shadow-lg rounded-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-500" />
                </div>
                Appointment Details
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={appointment.doctorPhoto} />
                  <AvatarFallback className="bg-health-aqua/10 text-health-aqua">
                    {appointment.doctorName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-health-charcoal">{appointment.doctorName}</h3>
                  <p className="text-sm text-health-aqua font-medium">{appointment.specialty}</p>
                  <p className="text-xs text-health-charcoal/60">{appointment.subSpecialty}</p>
                  <p className="text-xs text-health-charcoal/60">{appointment.hospital}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-health-light-gray/50 rounded-lg text-center">
                  <p className="text-sm text-health-charcoal/60">Date</p>
                  <p className="font-semibold text-health-charcoal">{appointment.date}</p>
                </div>
                <div className="p-3 bg-health-light-gray/50 rounded-lg text-center">
                  <p className="text-sm text-health-charcoal/60">Time</p>
                  <p className="font-semibold text-health-charcoal">{appointment.time}</p>
                </div>
                <div className="p-3 bg-health-light-gray/50 rounded-lg text-center">
                  <p className="text-sm text-health-charcoal/60">Duration</p>
                  <p className="font-semibold text-health-charcoal">{appointment.duration}</p>
                </div>
                <div className="p-3 bg-health-light-gray/50 rounded-lg text-center">
                  <p className="text-sm text-health-charcoal/60">Type</p>
                  <Badge className={getTypeColor(appointment.type)}>
                    {appointment.type}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Doctor Information */}
          <Card className="shadow-lg rounded-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-health-aqua/10 rounded-lg">
                  <User className="h-5 w-5 text-health-aqua" />
                </div>
                Doctor Information
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={appointment.doctorPhoto} />
                  <AvatarFallback className="bg-health-aqua/10 text-health-aqua">
                    {appointment.doctorName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold text-health-charcoal">{appointment.doctorName}</h3>
                  <p className="text-sm text-health-aqua font-medium">{appointment.specialty}</p>
                  <p className="text-xs text-health-charcoal/60">{appointment.subSpecialty}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-health-charcoal/60">Experience:</span>
                  <span className="text-sm font-medium text-health-charcoal">{appointment.doctorExperience}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-health-charcoal/60">Rating:</span>
                  <span className="text-sm font-medium text-health-charcoal">{appointment.doctorRating}/5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-health-charcoal/60">Response Time:</span>
                  <span className="text-sm font-medium text-health-charcoal">{appointment.responseTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-health-charcoal/60">Success Rate:</span>
                  <span className="text-sm font-medium text-health-charcoal">{appointment.successRate}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="shadow-lg rounded-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-health-teal/10 rounded-lg">
                  <Phone className="h-5 w-5 text-health-teal" />
                </div>
                Contact Information
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-health-aqua" />
                  <span className="text-sm text-health-charcoal">{appointment.doctorEmail || 'doctor@hospital.com'}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-health-aqua" />
                  <span className="text-sm text-health-charcoal">{appointment.doctorPhone || '+91 98765 43210'}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-4 w-4 text-health-aqua" />
                  <span className="text-sm text-health-charcoal">{appointment.doctorAvailability || 'Mon-Fri, 9 AM - 6 PM'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-lg rounded-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Zap className="h-5 w-5 text-blue-500" />
                </div>
                Quick Actions
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full border-health-charcoal/20"
                onClick={() => window.open(`tel:${appointment.doctorPhone || '+91 98765 43210'}`)}
              >
                <Phone className="h-4 w-4 mr-2" />
                Call Now
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full border-health-charcoal/20"
                onClick={() => window.open(`mailto:${appointment.doctorEmail || 'doctor@hospital.com'}`)}
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full border-health-charcoal/20"
                onClick={() => navigate('/patient/reschedule-appointment/' + appointment.id, { state: { appointment } })}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Reschedule
              </Button>
            </CardContent>
          </Card>

          {/* Message Summary */}
          <Card className="shadow-lg rounded-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                Message Summary
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-health-charcoal/60">Method:</span>
                  <span className="text-sm font-medium text-health-charcoal block mt-1">
                    {contactMethods.find(m => m.id === contactMethod)?.label}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-health-charcoal/60">Subject:</span>
                  <span className="text-sm font-medium text-health-charcoal block mt-1">
                    {subject || 'Not specified'}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-health-charcoal/60">Urgency:</span>
                  <Badge className={`mt-1 ${getUrgencyColor(urgency)}`}>
                    {urgencyLevels.find(u => u.id === urgency)?.label}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm text-health-charcoal/60">Include Details:</span>
                  <span className="text-sm font-medium text-health-charcoal block mt-1">
                    {includeAppointmentDetails ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card className="shadow-lg rounded-xl border-0">
            <CardContent className="p-6 space-y-3">
              <Button 
                className="w-full bg-gradient-to-r from-health-aqua to-health-teal hover:from-health-teal hover:to-health-aqua text-white"
                onClick={handleSend}
                disabled={sending || !subject.trim() || !message.trim()}
              >
                {sending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send Message
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full border-health-charcoal/20"
                onClick={() => navigate('/patient/hospital-appointments')}
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContactDoctor;
