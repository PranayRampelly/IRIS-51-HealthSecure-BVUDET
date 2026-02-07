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
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Calendar, ArrowLeft, XCircle, Clock, MapPin, User, Hospital,
  Stethoscope, Heart, Brain, Eye, Baby, CheckCircle, AlertTriangle,
  Info, Plus, Minus, PhoneCall, Mail, MessageSquare, Shield,
  Award, TrendingUp, Users, FileText, Video, Globe, Clock3,
  ShieldCheck, GraduationCap, BookOpen, Microscope, Pill, Activity,
  AlertCircle, Settings
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
}

const CancelAppointment: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [reason, setReason] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [confirmCancellation, setConfirmCancellation] = useState(false);
  const [notifyDoctor, setNotifyDoctor] = useState(true);
  const [requestRefund, setRequestRefund] = useState(false);
  
  const appointment = location.state?.appointment as Appointment;

  const cancellationReasons = [
    'Schedule conflict',
    'Health improvement',
    'Found another doctor',
    'Financial reasons',
    'Transportation issues',
    'Personal emergency',
    'Weather conditions',
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

  const handleCancel = async () => {
    if (!confirmCancellation) {
      alert('Please confirm the cancellation');
      return;
    }
    
    setCancelling(true);
    // Simulate API call
    setTimeout(() => {
      setCancelling(false);
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
        
        <h1 className="text-3xl font-montserrat font-bold text-health-teal mb-1">Cancel Appointment</h1>
        <p className="text-health-charcoal">Cancel your appointment and provide feedback</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Warning Alert */}
          <Card className="shadow-lg rounded-xl border-0 border-l-4 border-l-red-500">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-red-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-600 mb-2">Cancellation Warning</h3>
                  <p className="text-health-charcoal/60 mb-3">
                    Cancelling this appointment will free up the time slot for other patients. 
                    Please ensure this is the right decision before proceeding.
                  </p>
                  <div className="space-y-2 text-sm text-health-charcoal/60">
                    <p>• Cancellation fees may apply based on hospital policy</p>
                    <p>• You may need to wait for a new appointment slot</p>
                    <p>• Consider rescheduling instead of cancelling</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appointment Details */}
          <Card className="shadow-lg rounded-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-health-aqua/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-health-aqua" />
                </div>
                Appointment to Cancel
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

          {/* Cancellation Reason */}
          <Card className="shadow-lg rounded-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Info className="h-5 w-5 text-orange-500" />
                </div>
                Reason for Cancellation
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-health-charcoal mb-3 block">
                  Select a reason for cancellation
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {cancellationReasons.map((reason) => (
                    <Button
                      key={reason}
                      variant={selectedReason === reason ? "default" : "outline"}
                      className={`justify-start h-auto p-3 ${
                        selectedReason === reason 
                          ? "bg-health-aqua text-white" 
                          : "border-health-charcoal/20 hover:border-health-aqua"
                      }`}
                      onClick={() => setSelectedReason(reason)}
                    >
                      {reason}
                    </Button>
                  ))}
                </div>
              </div>

              {selectedReason === 'Other' && (
                <div>
                  <Label htmlFor="customReason" className="text-sm font-medium text-health-charcoal">
                    Please specify the reason
                  </Label>
                  <Textarea
                    id="customReason"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className="mt-1 border-health-charcoal/20 focus:border-health-aqua"
                    placeholder="Please provide details about your cancellation reason..."
                    rows={3}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Options */}
          <Card className="shadow-lg rounded-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Settings className="h-5 w-5 text-blue-500" />
                </div>
                Additional Options
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="notifyDoctor"
                  checked={notifyDoctor}
                  onCheckedChange={(checked) => setNotifyDoctor(checked as boolean)}
                />
                <Label htmlFor="notifyDoctor" className="text-sm text-health-charcoal">
                  Notify the doctor about the cancellation
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="requestRefund"
                  checked={requestRefund}
                  onCheckedChange={(checked) => setRequestRefund(checked as boolean)}
                />
                <Label htmlFor="requestRefund" className="text-sm text-health-charcoal">
                  Request refund for any prepaid fees
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="confirmCancellation"
                  checked={confirmCancellation}
                  onCheckedChange={(checked) => setConfirmCancellation(checked as boolean)}
                />
                <Label htmlFor="confirmCancellation" className="text-sm text-health-charcoal font-medium">
                  I confirm that I want to cancel this appointment
                </Label>
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

          {/* Cancellation Policy */}
          <Card className="shadow-lg rounded-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                </div>
                Cancellation Policy
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm text-health-charcoal/60">
                <div className="flex items-start space-x-2">
                  <Clock className="h-4 w-4 text-yellow-500 mt-0.5" />
                  <p>24+ hours notice: No cancellation fee</p>
                </div>
                <div className="flex items-start space-x-2">
                  <Clock className="h-4 w-4 text-orange-500 mt-0.5" />
                  <p>2-24 hours notice: 25% cancellation fee</p>
                </div>
                <div className="flex items-start space-x-2">
                  <Clock className="h-4 w-4 text-red-500 mt-0.5" />
                  <p>Less than 2 hours: 50% cancellation fee</p>
                </div>
                <div className="flex items-start space-x-2">
                  <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                  <p>Emergency cancellations may be waived</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card className="shadow-lg rounded-xl border-0">
            <CardContent className="p-6 space-y-3">
              <Button 
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                onClick={handleCancel}
                disabled={cancelling || !confirmCancellation || !selectedReason}
              >
                {cancelling ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                Cancel Appointment
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full border-health-charcoal/20"
                onClick={() => navigate('/patient/reschedule-appointment/' + appointment.id, { state: { appointment } })}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Reschedule Instead
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full border-health-charcoal/20"
                onClick={() => navigate('/patient/hospital-appointments')}
              >
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CancelAppointment;
