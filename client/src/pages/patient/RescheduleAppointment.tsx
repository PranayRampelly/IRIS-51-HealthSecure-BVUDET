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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Calendar as CalendarIcon, ArrowLeft, Save, Clock, MapPin, User, Hospital,
  Stethoscope, Heart, Brain, Eye, Baby, CheckCircle, AlertTriangle,
  Info, Plus, Minus, PhoneCall, Mail, MessageSquare, Shield,
  Award, TrendingUp, Users, FileText, Video, Globe, Clock3,
  ShieldCheck, GraduationCap, BookOpen, Microscope, Pill, Activity,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

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
}

interface TimeSlot {
  time: string;
  available: boolean;
  recommended: boolean;
}

const RescheduleAppointment: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [reason, setReason] = useState('');
  
  const appointment = location.state?.appointment as Appointment;

  // Mock available time slots
  const availableTimeSlots: TimeSlot[] = [
    { time: '09:00 AM', available: true, recommended: false },
    { time: '09:30 AM', available: true, recommended: true },
    { time: '10:00 AM', available: false, recommended: false },
    { time: '10:30 AM', available: true, recommended: false },
    { time: '11:00 AM', available: true, recommended: false },
    { time: '11:30 AM', available: false, recommended: false },
    { time: '02:00 PM', available: true, recommended: true },
    { time: '02:30 PM', available: true, recommended: false },
    { time: '03:00 PM', available: true, recommended: false },
    { time: '03:30 PM', available: false, recommended: false },
    { time: '04:00 PM', available: true, recommended: false },
    { time: '04:30 PM', available: true, recommended: true },
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

  const handleReschedule = async () => {
    if (!selectedDate || !selectedTime) {
      alert('Please select a date and time');
      return;
    }
    
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
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
        
        <h1 className="text-3xl font-montserrat font-bold text-health-teal mb-1">Reschedule Appointment</h1>
        <p className="text-health-charcoal">Choose a new date and time for your appointment</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Appointment */}
          <Card className="shadow-lg rounded-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-health-aqua/10 rounded-lg">
                  <CalendarIcon className="h-5 w-5 text-health-aqua" />
                </div>
                Current Appointment
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
                  <p className="text-sm text-health-charcoal/60">Current Date</p>
                  <p className="font-semibold text-health-charcoal">{appointment.date}</p>
                </div>
                <div className="p-3 bg-health-light-gray/50 rounded-lg text-center">
                  <p className="text-sm text-health-charcoal/60">Current Time</p>
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

          {/* New Date Selection */}
          <Card className="shadow-lg rounded-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-health-teal/10 rounded-lg">
                  <CalendarIcon className="h-5 w-5 text-health-teal" />
                </div>
                Select New Date
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  disabled={(date) => date < new Date()}
                />
              </div>
              
              {selectedDate && (
                <div className="text-center">
                  <p className="text-sm text-health-charcoal/60">Selected Date:</p>
                  <p className="font-semibold text-health-charcoal">
                    {format(selectedDate, 'EEEE, MMMM do, yyyy')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Time Slot Selection */}
          {selectedDate && (
            <Card className="shadow-lg rounded-xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-500" />
                  </div>
                  Select Time Slot
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableTimeSlots.map((slot, index) => (
                    <Button
                      key={index}
                      variant={selectedTime === slot.time ? "default" : "outline"}
                      className={cn(
                        "h-12 justify-start",
                        selectedTime === slot.time 
                          ? "bg-health-aqua text-white" 
                          : slot.available 
                            ? "border-health-charcoal/20 hover:border-health-aqua" 
                            : "border-gray-200 text-gray-400 cursor-not-allowed"
                      )}
                      onClick={() => slot.available && setSelectedTime(slot.time)}
                      disabled={!slot.available}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      {slot.time}
                      {slot.recommended && (
                        <Badge className="ml-2 bg-green-100 text-green-800 text-xs">
                          Recommended
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
                
                {selectedTime && (
                  <div className="text-center p-4 bg-health-aqua/10 rounded-lg">
                    <p className="text-sm text-health-charcoal/60">Selected Time:</p>
                    <p className="font-semibold text-health-aqua">{selectedTime}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Reason for Rescheduling */}
          <Card className="shadow-lg rounded-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Info className="h-5 w-5 text-orange-500" />
                </div>
                Reason for Rescheduling
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="reason" className="text-sm font-medium text-health-charcoal">
                  Please provide a reason for rescheduling (optional)
                </Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-1 border-health-charcoal/20 focus:border-health-aqua"
                  placeholder="Enter the reason for rescheduling..."
                  rows={3}
                />
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
                  <span className="text-sm text-health-charcoal/60">Success Rate:</span>
                  <span className="text-sm font-medium text-health-charcoal">{appointment.successRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-health-charcoal/60">Response Time:</span>
                  <span className="text-sm font-medium text-health-charcoal">{appointment.responseTime}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hospital Information */}
          <Card className="shadow-lg rounded-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-health-teal/10 rounded-lg">
                  <Hospital className="h-5 w-5 text-health-teal" />
                </div>
                Hospital Information
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-health-teal/10 rounded-lg">
                  <Hospital className="h-8 w-8 text-health-teal" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-health-charcoal">{appointment.hospital}</h3>
                  <p className="text-sm text-health-charcoal/60">{appointment.distance} away</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-health-charcoal/60">Rating:</span>
                  <span className="text-sm font-medium text-health-charcoal">{appointment.hospitalRating}/5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-health-charcoal/60">Wait Time:</span>
                  <span className="text-sm font-medium text-health-charcoal">{appointment.waitTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-health-charcoal/60">Emergency:</span>
                  <span className="text-sm font-medium text-health-charcoal">
                    {appointment.emergencyAvailable ? 'Available' : 'Not Available'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reschedule Summary */}
          <Card className="shadow-lg rounded-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                Reschedule Summary
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-health-charcoal/60">New Date:</span>
                  <span className="text-sm font-medium text-health-charcoal block mt-1">
                    {selectedDate ? format(selectedDate, 'MMM dd, yyyy') : 'Not selected'}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-health-charcoal/60">New Time:</span>
                  <span className="text-sm font-medium text-health-charcoal block mt-1">
                    {selectedTime || 'Not selected'}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-health-charcoal/60">Duration:</span>
                  <span className="text-sm font-medium text-health-charcoal block mt-1">{appointment.duration}</span>
                </div>
                <div>
                  <span className="text-sm text-health-charcoal/60">Type:</span>
                  <Badge className={`mt-1 ${getTypeColor(appointment.type)}`}>
                    {appointment.type}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card className="shadow-lg rounded-xl border-0">
            <CardContent className="p-6 space-y-3">
              <Button 
                className="w-full bg-gradient-to-r from-health-aqua to-health-teal hover:from-health-teal hover:to-health-aqua text-white"
                onClick={handleReschedule}
                disabled={saving || !selectedDate || !selectedTime}
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <CalendarIcon className="h-4 w-4 mr-2" />
                )}
                Reschedule Appointment
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

export default RescheduleAppointment;
