import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  Download, 
  Share2, 
  QrCode, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Building2,
  Bed,
  User,
  Shield,
  FileText,
  ArrowLeft,
  Home,
  Printer,
  MessageCircle,
  Star,
  Heart,
  Award,
  TrendingUp
} from 'lucide-react';

const BookingConfirmation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);
  
  const { bookingId, hospital, formData } = location.state || {};

  if (!bookingId || !hospital || !formData) {
    return (
      <div className="w-full min-h-[calc(100vh-80px)] px-2 md:px-6 py-8 bg-health-light-gray max-w-7xl mx-auto">
        <div className="text-center">
          <div className="p-4 bg-red-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-health-charcoal mb-2">Booking Not Found</h2>
          <p className="text-health-charcoal/60 mb-4">The booking information could not be loaded.</p>
          <Button onClick={() => navigate('/patient/bed-availability')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Bed Availability
          </Button>
        </div>
      </div>
    );
  }

  const handleDownload = () => {
    setDownloading(true);
    // Simulate download
    setTimeout(() => {
      setDownloading(false);
      // In a real app, this would generate and download a PDF
      alert('Booking confirmation downloaded successfully!');
    }, 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

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
        
        <div className="text-center mb-8">
          <div className="p-4 bg-health-success/10 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-health-success" />
          </div>
          <h1 className="text-3xl font-montserrat font-bold text-health-teal mb-1">Booking Confirmed!</h1>
          <p className="text-health-charcoal/60">Your hospital bed has been successfully booked</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Booking Details */}
          <Card className="shadow-lg rounded-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-health-aqua/10 rounded-lg">
                  <FileText className="h-5 w-5 text-health-aqua" />
                </div>
                Booking Details
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Booking ID */}
              <div className="p-4 bg-gradient-to-r from-health-aqua/10 to-health-teal/10 border border-health-aqua/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-health-charcoal/60">Booking ID</p>
                    <p className="text-xl font-bold text-health-charcoal">{bookingId}</p>
                  </div>
                  <Badge className="bg-health-success/10 text-health-success border-health-success/20">
                    Confirmed
                  </Badge>
                </div>
              </div>

              {/* Patient Information */}
              <div>
                <h3 className="text-lg font-semibold text-health-charcoal mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-health-aqua" />
                  Patient Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-health-charcoal/60">Patient Name</p>
                    <p className="font-medium text-health-charcoal">{formData.patientName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-health-charcoal/60">Age</p>
                    <p className="font-medium text-health-charcoal">{formData.patientAge} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-health-charcoal/60">Gender</p>
                    <p className="font-medium text-health-charcoal capitalize">{formData.patientGender}</p>
                  </div>
                  <div>
                    <p className="text-sm text-health-charcoal/60">Contact Number</p>
                    <p className="font-medium text-health-charcoal">{formData.contactNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-health-charcoal/60">Emergency Contact</p>
                    <p className="font-medium text-health-charcoal">{formData.emergencyContact}</p>
                  </div>
                  <div>
                    <p className="text-sm text-health-charcoal/60">Emergency Phone</p>
                    <p className="font-medium text-health-charcoal">{formData.emergencyContactPhone}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Hospital Information */}
              <div>
                <h3 className="text-lg font-semibold text-health-charcoal mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-health-aqua" />
                  Hospital Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-health-charcoal/60">Hospital Name</p>
                    <p className="font-medium text-health-charcoal">{hospital.hospitalName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-health-charcoal/60">Location</p>
                    <p className="font-medium text-health-charcoal">{hospital.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-health-charcoal/60">Bed Type</p>
                    <Badge variant="outline" className="text-health-aqua border-health-aqua/20">
                      {hospital.bedType}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-health-charcoal/60">Rating</p>
                    <div className="flex items-center gap-1">
                      {renderStars(hospital.rating)}
                      <span className="text-sm text-health-charcoal/60 ml-1">({hospital.rating})</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Admission Details */}
              <div>
                <h3 className="text-lg font-semibold text-health-charcoal mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-health-aqua" />
                  Admission Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-health-charcoal/60">Admission Date</p>
                    <p className="font-medium text-health-charcoal">{formData.admissionDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-health-charcoal/60">Expected Duration</p>
                    <p className="font-medium text-health-charcoal">{formData.expectedDuration}</p>
                  </div>
                  <div>
                    <p className="text-sm text-health-charcoal/60">Price per Day</p>
                    <p className="font-bold text-health-aqua">₹{hospital.price.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-health-charcoal/60">Wait Time</p>
                    <p className="font-medium text-health-charcoal">{hospital.waitingTime}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Medical Information */}
              <div>
                <h3 className="text-lg font-semibold text-health-charcoal mb-4 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-health-aqua" />
                  Medical Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-health-charcoal/60">Medical Condition</p>
                    <p className="font-medium text-health-charcoal">{formData.medicalCondition || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-health-charcoal/60">Current Medications</p>
                    <p className="font-medium text-health-charcoal">{formData.currentMedications || 'None'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-health-charcoal/60">Allergies</p>
                    <p className="font-medium text-health-charcoal">{formData.allergies || 'None'}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Insurance Information */}
              <div>
                <h3 className="text-lg font-semibold text-health-charcoal mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-health-aqua" />
                  Insurance Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-health-charcoal/60">Insurance Provider</p>
                    <p className="font-medium text-health-charcoal">{formData.insuranceProvider || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-health-charcoal/60">Insurance Number</p>
                    <p className="font-medium text-health-charcoal">{formData.insuranceNumber || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Action Buttons */}
          <Card className="shadow-lg rounded-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-health-aqua/10 rounded-lg">
                  <Download className="h-5 w-5 text-health-aqua" />
                </div>
                Quick Actions
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <Button 
                className="w-full bg-gradient-to-r from-health-aqua to-health-teal hover:from-health-teal hover:to-health-aqua text-white"
                onClick={handleDownload}
                disabled={downloading}
              >
                {downloading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Download Confirmation
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handlePrint}
              >
                <Printer className="h-4 w-4 mr-2" />
                Print Confirmation
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/patient/bed-availability')}
              >
                <Home className="h-4 w-4 mr-2" />
                Back to Bed Availability
              </Button>
            </CardContent>
          </Card>

          {/* QR Code */}
          <Card className="shadow-lg rounded-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-health-aqua/10 rounded-lg">
                  <QrCode className="h-5 w-5 text-health-aqua" />
                </div>
                Booking QR Code
              </CardTitle>
            </CardHeader>
            
            <CardContent className="text-center">
              <div className="p-4 bg-white border-2 border-health-aqua/20 rounded-lg inline-block mb-4">
                <div className="w-32 h-32 bg-gray-100 rounded flex items-center justify-center">
                  <QrCode className="h-20 w-20 text-health-charcoal/40" />
                </div>
              </div>
              <p className="text-sm text-health-charcoal/60">
                Show this QR code at the hospital for quick check-in
              </p>
            </CardContent>
          </Card>

          {/* Hospital Contact */}
          <Card className="shadow-lg rounded-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-health-aqua/10 rounded-lg">
                  <Phone className="h-5 w-5 text-health-aqua" />
                </div>
                Hospital Contact
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-health-aqua" />
                <span className="text-sm text-health-charcoal">{hospital.contactNumber}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-health-aqua" />
                <span className="text-sm text-health-charcoal">{hospital.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-health-aqua" />
                <span className="text-sm text-health-charcoal">{hospital.location}</span>
              </div>
              
              <Separator />
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.open(`tel:${hospital.contactNumber}`)}
              >
                <Phone className="h-4 w-4 mr-2" />
                Call Hospital
              </Button>
            </CardContent>
          </Card>

          {/* Important Information */}
          <Card className="bg-gradient-to-r from-health-aqua/5 to-health-teal/5 border-health-aqua/20">
            <CardContent className="p-4">
              <h4 className="font-medium text-health-charcoal mb-3">Important Information</h4>
              <div className="space-y-3 text-sm text-health-charcoal/60">
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-health-aqua mt-0.5" />
                  <p>Arrive 30 minutes before your admission time</p>
                </div>
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-health-aqua mt-0.5" />
                  <p>Bring your ID proof and insurance documents</p>
                </div>
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-health-aqua mt-0.5" />
                  <p>Your booking is secure and confirmed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Success Stats */}
          <Card className="bg-gradient-to-r from-health-success/5 to-health-success/10 border-health-success/20">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Award className="h-5 w-5 text-health-success" />
                <span className="text-sm font-medium text-health-charcoal">Booking Successful</span>
              </div>
              <p className="text-xs text-health-charcoal/60">
                You're all set! Your bed is reserved and ready for your admission.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
