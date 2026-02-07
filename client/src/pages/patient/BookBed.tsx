import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Bed, 
  Calendar, 
  Clock, 
  MapPin, 
  Star, 
  Phone, 
  Mail, 
  Shield, 
  CreditCard,
  FileText,
  CheckCircle,
  AlertCircle,
  Info,
  User,
  Heart,
  Building2,
  Car,
  Wifi,
  Tv,
  AirVent,
  Coffee,
  Thermometer,
  Droplets,
  Zap,
  Lock,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

interface BookingFormData {
  patientName: string;
  patientAge: string;
  patientGender: string;
  contactNumber: string;
  email: string;
  emergencyContact: string;
  emergencyContactPhone: string;
  admissionDate: string;
  expectedDuration: string;
  medicalCondition: string;
  currentMedications: string;
  allergies: string;
  insuranceProvider: string;
  insuranceNumber: string;
  policyNumber: string;
  specialRequirements: string;
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
}

const BookBed: React.FC = () => {
  const { hospitalId } = useParams<{ hospitalId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const hospital = location.state?.hospital;

  const [formData, setFormData] = useState<BookingFormData>({
    patientName: '',
    patientAge: '',
    patientGender: '',
    contactNumber: '',
    email: '',
    emergencyContact: '',
    emergencyContactPhone: '',
    admissionDate: '',
    expectedDuration: '',
    medicalCondition: '',
    currentMedications: '',
    allergies: '',
    insuranceProvider: '',
    insuranceNumber: '',
    policyNumber: '',
    specialRequirements: '',
    agreeToTerms: false,
    agreeToPrivacy: false
  });

  const steps = [
    { id: 1, title: 'Patient Details', icon: User },
    { id: 2, title: 'Admission Info', icon: Calendar },
    { id: 3, title: 'Medical History', icon: Heart },
    { id: 4, title: 'Insurance', icon: Shield },
    { id: 5, title: 'Review & Confirm', icon: CheckCircle }
  ];

  const handleInputChange = (field: keyof BookingFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      navigate('/patient/booking-confirmation', { 
        state: { 
          bookingId: 'BK' + Date.now(),
          hospital,
          formData 
        } 
      });
    }, 2000);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (!hospital) {
    return (
      <div className="w-full min-h-[calc(100vh-80px)] px-2 md:px-6 py-8 bg-health-light-gray max-w-7xl mx-auto">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-health-charcoal mb-2">No Hospital Selected</h2>
          <p className="text-health-charcoal/60 mb-4">Please select a hospital from the bed availability page to proceed with booking.</p>
          <Button 
            onClick={() => navigate('/patient/bed-availability')}
            className="bg-gradient-to-r from-health-aqua to-health-teal hover:from-health-teal hover:to-health-aqua text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Browse Available Beds
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
          onClick={() => navigate('/patient/bed-availability')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Bed Availability
        </Button>
        
        <h1 className="text-3xl font-montserrat font-bold text-health-teal mb-1">Book Hospital Bed</h1>
        <p className="text-health-charcoal">Complete your booking for {hospital.hospitalName}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Booking Form */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg rounded-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-health-aqua/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-health-aqua" />
                </div>
                Booking Process
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              {/* Progress Steps */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                        currentStep >= step.id 
                          ? 'bg-health-aqua border-health-aqua text-white' 
                          : 'bg-white border-health-charcoal/20 text-health-charcoal/40'
                      }`}>
                        <step.icon className="h-5 w-5" />
                      </div>
                      {index < steps.length - 1 && (
                        <div className={`w-16 h-0.5 mx-2 transition-all duration-300 ${
                          currentStep > step.id ? 'bg-health-aqua' : 'bg-health-charcoal/20'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm font-medium text-health-charcoal">
                    Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
                  </p>
                </div>
              </div>

              {/* Step Content */}
              <div className="space-y-6">
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="patientName">Patient Full Name *</Label>
                        <Input
                          id="patientName"
                          value={formData.patientName}
                          onChange={(e) => handleInputChange('patientName', e.target.value)}
                          placeholder="Enter patient's full name"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="patientAge">Age *</Label>
                        <Input
                          id="patientAge"
                          type="number"
                          value={formData.patientAge}
                          onChange={(e) => handleInputChange('patientAge', e.target.value)}
                          placeholder="Enter age"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="patientGender">Gender *</Label>
                        <Select value={formData.patientGender} onValueChange={(value) => handleInputChange('patientGender', value)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="contactNumber">Contact Number *</Label>
                        <Input
                          id="contactNumber"
                          value={formData.contactNumber}
                          onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                          placeholder="Enter contact number"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="Enter email address"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="emergencyContact">Emergency Contact Name *</Label>
                        <Input
                          id="emergencyContact"
                          value={formData.emergencyContact}
                          onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                          placeholder="Enter emergency contact name"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="emergencyContactPhone">Emergency Contact Phone *</Label>
                        <Input
                          id="emergencyContactPhone"
                          value={formData.emergencyContactPhone}
                          onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                          placeholder="Enter emergency contact phone"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="admissionDate">Preferred Admission Date *</Label>
                        <Input
                          id="admissionDate"
                          type="date"
                          value={formData.admissionDate}
                          onChange={(e) => handleInputChange('admissionDate', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="expectedDuration">Expected Duration *</Label>
                        <Select value={formData.expectedDuration} onValueChange={(value) => handleInputChange('expectedDuration', value)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-3 days">1-3 days</SelectItem>
                            <SelectItem value="4-7 days">4-7 days</SelectItem>
                            <SelectItem value="1-2 weeks">1-2 weeks</SelectItem>
                            <SelectItem value="2+ weeks">2+ weeks</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="specialRequirements">Special Requirements</Label>
                      <Textarea
                        id="specialRequirements"
                        value={formData.specialRequirements}
                        onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
                        placeholder="Any special requirements or preferences..."
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="medicalCondition">Primary Medical Condition *</Label>
                      <Textarea
                        id="medicalCondition"
                        value={formData.medicalCondition}
                        onChange={(e) => handleInputChange('medicalCondition', e.target.value)}
                        placeholder="Describe the primary medical condition..."
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="currentMedications">Current Medications</Label>
                      <Textarea
                        id="currentMedications"
                        value={formData.currentMedications}
                        onChange={(e) => handleInputChange('currentMedications', e.target.value)}
                        placeholder="List current medications..."
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label htmlFor="allergies">Allergies</Label>
                      <Textarea
                        id="allergies"
                        value={formData.allergies}
                        onChange={(e) => handleInputChange('allergies', e.target.value)}
                        placeholder="List any allergies..."
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                        <Select value={formData.insuranceProvider} onValueChange={(value) => handleInputChange('insuranceProvider', value)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select insurance provider" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="icici">ICICI Lombard</SelectItem>
                            <SelectItem value="bajaj">Bajaj Allianz</SelectItem>
                            <SelectItem value="hdfc">HDFC Health</SelectItem>
                            <SelectItem value="max">Max Bupa</SelectItem>
                            <SelectItem value="reliance">Reliance Health</SelectItem>
                            <SelectItem value="star">Star Health</SelectItem>
                            <SelectItem value="none">No Insurance</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="insuranceNumber">Insurance Number</Label>
                        <Input
                          id="insuranceNumber"
                          value={formData.insuranceNumber}
                          onChange={(e) => handleInputChange('insuranceNumber', e.target.value)}
                          placeholder="Enter insurance number"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="policyNumber">Policy Number</Label>
                        <Input
                          id="policyNumber"
                          value={formData.policyNumber}
                          onChange={(e) => handleInputChange('policyNumber', e.target.value)}
                          placeholder="Enter policy number"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div className="p-4 bg-health-aqua/5 border border-health-aqua/20 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-health-aqua mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-health-charcoal mb-1">Insurance Information</p>
                          <p className="text-sm text-health-charcoal/60">
                            This hospital accepts the following insurance providers: {hospital.insuranceAccepted.join(', ')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div className="p-6 bg-health-success/5 border border-health-success/20 rounded-lg">
                      <div className="flex items-center gap-3 mb-4">
                        <CheckCircle className="h-6 w-6 text-health-success" />
                        <h3 className="text-lg font-semibold text-health-charcoal">Booking Summary</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-health-charcoal">Patient:</p>
                          <p className="text-health-charcoal/60">{formData.patientName}</p>
                        </div>
                        <div>
                          <p className="font-medium text-health-charcoal">Hospital:</p>
                          <p className="text-health-charcoal/60">{hospital.hospitalName}</p>
                        </div>
                        <div>
                          <p className="font-medium text-health-charcoal">Bed Type:</p>
                          <p className="text-health-charcoal/60">{hospital.bedType}</p>
                        </div>
                        <div>
                          <p className="font-medium text-health-charcoal">Admission Date:</p>
                          <p className="text-health-charcoal/60">{formData.admissionDate}</p>
                        </div>
                        <div>
                          <p className="font-medium text-health-charcoal">Duration:</p>
                          <p className="text-health-charcoal/60">{formData.expectedDuration}</p>
                        </div>
                        <div>
                          <p className="font-medium text-health-charcoal">Price per day:</p>
                          <p className="text-health-aqua font-semibold">₹{hospital.price.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="agreeToTerms"
                          checked={formData.agreeToTerms}
                          onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked as boolean)}
                        />
                        <Label htmlFor="agreeToTerms" className="text-sm">
                          I agree to the <a href="/terms" className="text-health-aqua hover:underline">Terms and Conditions</a>
                        </Label>
                      </div>
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="agreeToPrivacy"
                          checked={formData.agreeToPrivacy}
                          onCheckedChange={(checked) => handleInputChange('agreeToPrivacy', checked as boolean)}
                        />
                        <Label htmlFor="agreeToPrivacy" className="text-sm">
                          I agree to the <a href="/privacy" className="text-health-aqua hover:underline">Privacy Policy</a>
                        </Label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  
                  {currentStep < steps.length ? (
                    <Button
                      onClick={nextStep}
                      className="bg-gradient-to-r from-health-aqua to-health-teal hover:from-health-teal hover:to-health-aqua text-white"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={loading || !formData.agreeToTerms || !formData.agreeToPrivacy}
                      className="bg-gradient-to-r from-health-aqua to-health-teal hover:from-health-teal hover:to-health-aqua text-white"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Confirm Booking
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hospital Details Sidebar */}
        <div className="space-y-6">
          <Card className="shadow-lg rounded-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-health-aqua/10 rounded-lg">
                  <Building2 className="h-5 w-5 text-health-aqua" />
                </div>
                Hospital Details
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-health-charcoal mb-2">{hospital.hospitalName}</h3>
                <div className="flex items-center gap-1 mb-2">
                  {renderStars(hospital.rating)}
                  <span className="text-sm text-health-charcoal/60 ml-1">({hospital.rating})</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-health-charcoal/60 mb-3">
                  <MapPin className="h-4 w-4" />
                  {hospital.location}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-health-charcoal/60">Bed Type:</span>
                  <Badge variant="outline" className="text-health-aqua border-health-aqua/20">
                    {hospital.bedType}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-health-charcoal/60">Price per day:</span>
                  <span className="text-lg font-bold text-health-aqua">₹{hospital.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-health-charcoal/60">Availability:</span>
                  <span className={`text-sm font-semibold ${hospital.availableBeds > 5 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {hospital.availableBeds} beds
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-health-charcoal/60">Wait Time:</span>
                  <span className="text-sm text-health-charcoal/60">{hospital.waitingTime}</span>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium text-health-charcoal mb-2">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {hospital.amenities.slice(0, 4).map((amenity, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium text-health-charcoal mb-2">Contact Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-health-aqua" />
                    <span className="text-health-charcoal/60">{hospital.contactNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-health-aqua" />
                    <span className="text-health-charcoal/60">{hospital.email}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Card className="bg-gradient-to-r from-health-aqua/5 to-health-teal/5 border-health-aqua/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-health-aqua mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-health-charcoal mb-1">Secure Booking</p>
                  <p className="text-xs text-health-charcoal/60">
                    Your information is encrypted and secure. We use industry-standard security protocols to protect your data.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookBed;
