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
import { 
  Calendar, ArrowLeft, Save, Clock, MapPin, User, Hospital,
  Stethoscope, Heart, Brain, Eye, Baby, CheckCircle, AlertTriangle,
  Info, Plus, Minus, PhoneCall, Mail, MessageSquare, Shield,
  Award, TrendingUp, Users, FileText, Video, Globe, Clock3,
  ShieldCheck, GraduationCap, BookOpen, Microscope, Pill, Activity
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

const EditAppointment: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const appointment = location.state?.appointment as Appointment;

  const [formData, setFormData] = useState({
    date: appointment?.date || '',
    time: appointment?.time || '',
    type: appointment?.type || 'in-person',
    urgency: appointment?.urgency || 'low',
    notes: appointment?.notes || '',
    location: appointment?.location || '',
    duration: appointment?.duration || '30 minutes',
    preparation: appointment?.preparation || [],
    documents: appointment?.documents || []
  });

  const [newPreparation, setNewPreparation] = useState('');
  const [newDocument, setNewDocument] = useState('');

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

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      navigate('/patient/hospital-appointments');
    }, 2000);
  };

  const addPreparation = () => {
    if (newPreparation.trim()) {
      setFormData(prev => ({
        ...prev,
        preparation: [...prev.preparation, newPreparation.trim()]
      }));
      setNewPreparation('');
    }
  };

  const removePreparation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      preparation: prev.preparation.filter((_, i) => i !== index)
    }));
  };

  const addDocument = () => {
    if (newDocument.trim()) {
      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, newDocument.trim()]
      }));
      setNewDocument('');
    }
  };

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
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
        
        <h1 className="text-3xl font-montserrat font-bold text-health-teal mb-1">Edit Appointment</h1>
        <p className="text-health-charcoal">Update your appointment details and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Appointment Details */}
          <Card className="shadow-lg rounded-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-health-aqua/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-health-aqua" />
                </div>
                Appointment Details
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date" className="text-sm font-medium text-health-charcoal">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="mt-1 border-health-charcoal/20 focus:border-health-aqua"
                  />
                </div>
                <div>
                  <Label htmlFor="time" className="text-sm font-medium text-health-charcoal">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                    className="mt-1 border-health-charcoal/20 focus:border-health-aqua"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type" className="text-sm font-medium text-health-charcoal">Appointment Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}>
                    <SelectTrigger className="mt-1 border-health-charcoal/20">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in-person">In-person</SelectItem>
                      <SelectItem value="virtual">Virtual</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="urgency" className="text-sm font-medium text-health-charcoal">Urgency Level</Label>
                  <Select value={formData.urgency} onValueChange={(value) => setFormData(prev => ({ ...prev, urgency: value as any }))}>
                    <SelectTrigger className="mt-1 border-health-charcoal/20">
                      <SelectValue placeholder="Select urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location" className="text-sm font-medium text-health-charcoal">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="mt-1 border-health-charcoal/20 focus:border-health-aqua"
                    placeholder="Appointment location"
                  />
                </div>
                <div>
                  <Label htmlFor="duration" className="text-sm font-medium text-health-charcoal">Duration</Label>
                  <Select value={formData.duration} onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}>
                    <SelectTrigger className="mt-1 border-health-charcoal/20">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15 minutes">15 minutes</SelectItem>
                      <SelectItem value="30 minutes">30 minutes</SelectItem>
                      <SelectItem value="45 minutes">45 minutes</SelectItem>
                      <SelectItem value="1 hour">1 hour</SelectItem>
                      <SelectItem value="1.5 hours">1.5 hours</SelectItem>
                      <SelectItem value="2 hours">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="notes" className="text-sm font-medium text-health-charcoal">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="mt-1 border-health-charcoal/20 focus:border-health-aqua"
                  placeholder="Additional notes or special requirements..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Preparation Instructions */}
          <Card className="shadow-lg rounded-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-health-teal/10 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-health-teal" />
                </div>
                Preparation Instructions
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {formData.preparation.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-health-light-gray/50 rounded-lg">
                    <span className="text-sm text-health-charcoal">{item}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePreparation(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Input
                  value={newPreparation}
                  onChange={(e) => setNewPreparation(e.target.value)}
                  placeholder="Add preparation instruction..."
                  className="flex-1 border-health-charcoal/20 focus:border-health-aqua"
                  onKeyPress={(e) => e.key === 'Enter' && addPreparation()}
                />
                <Button onClick={addPreparation} className="bg-health-aqua hover:bg-health-teal">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Required Documents */}
          <Card className="shadow-lg rounded-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-500" />
                </div>
                Required Documents
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {formData.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-health-light-gray/50 rounded-lg">
                    <span className="text-sm text-health-charcoal">{doc}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDocument(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Input
                  value={newDocument}
                  onChange={(e) => setNewDocument(e.target.value)}
                  placeholder="Add required document..."
                  className="flex-1 border-health-charcoal/20 focus:border-health-aqua"
                  onKeyPress={(e) => e.key === 'Enter' && addDocument()}
                />
                <Button onClick={addDocument} className="bg-health-aqua hover:bg-health-teal">
                  <Plus className="h-4 w-4" />
                </Button>
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
                  <span className="text-sm text-health-charcoal/60">Education:</span>
                  <span className="text-sm font-medium text-health-charcoal">{appointment.doctorEducation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-health-charcoal/60">Rating:</span>
                  <span className="text-sm font-medium text-health-charcoal">{appointment.doctorRating}/5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-health-charcoal/60">Success Rate:</span>
                  <span className="text-sm font-medium text-health-charcoal">{appointment.successRate}%</span>
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

          {/* Current Selection */}
          <Card className="shadow-lg rounded-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Info className="h-5 w-5 text-green-500" />
                </div>
                Current Selection
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-health-charcoal/60">Type:</span>
                  <Badge className={`mt-1 ${getTypeColor(formData.type)}`}>
                    {formData.type}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm text-health-charcoal/60">Urgency:</span>
                  <Badge className={`mt-1 ${getUrgencyColor(formData.urgency)}`}>
                    {formData.urgency}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm text-health-charcoal/60">Duration:</span>
                  <span className="text-sm font-medium text-health-charcoal block mt-1">{formData.duration}</span>
                </div>
                <div>
                  <span className="text-sm text-health-charcoal/60">Location:</span>
                  <span className="text-sm font-medium text-health-charcoal block mt-1">{formData.location}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card className="shadow-lg rounded-xl border-0">
            <CardContent className="p-6 space-y-3">
              <Button 
                className="w-full bg-gradient-to-r from-health-aqua to-health-teal hover:from-health-teal hover:to-health-aqua text-white"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
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

export default EditAppointment;
