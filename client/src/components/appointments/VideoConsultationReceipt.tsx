import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  Phone, 
  Mail, 
  Download, 
  Share2, 
  ExternalLink,
  IndianRupee,
  CreditCard,
  User,
  Stethoscope,
  Building,
  FileText,
  Smartphone,
  Globe,
  Shield,
  QrCode,
  Wifi,
  Monitor,
  Headphones,
  Camera,
  Mic,
  AlertTriangle,
  Info,
  CheckSquare,
  ArrowRight,
  Copy,
  CalendarDays,
  Timer,
  Zap,
  Lock
} from 'lucide-react';
import { format } from 'date-fns';
import { appointmentService } from '@/services/appointmentService';
import { toast } from 'sonner';

interface VideoConsultationReceiptProps {
  open: boolean;
  onClose: () => void;
  data: {
    appointmentId?: string;
    appointmentNumber: string;
    doctor: {
      name: string;
      specialization: string;
      experience?: number;
      languages?: string[];
      location?: { address?: string };
    };
    patient: {
      name: string;
      email: string;
      phone: string;
    };
    scheduledDate: string | Date;
    scheduledTime: string;
    consultationType: 'online' | 'in-person';
    cost: {
      consultationFee: number;
      totalAmount: number;
    };
    status: string;
    videoCallLink?: string;
    videoCallDetails?: {
      platform?: string;
      roomId?: string;
      password?: string;
    };
    paymentDetails: {
      orderId: string;
      paymentId: string;
      razorpayPaymentId: string;
      amount: number;
      currency: string;
      status: string;
      paidAt: string;
    };
    verificationWarning?: string;
  };
}

export const VideoConsultationReceipt: React.FC<VideoConsultationReceiptProps> = ({
  open,
  onClose,
  data
}) => {
  const formatDate = (date: string | Date) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return 'Date not specified';
      return format(dateObj, 'EEEE, dd MMMM yyyy');
    } catch {
      return 'Date not specified';
    }
  };

  const formatTime = (time: string) => {
    try {
      if (!time) return 'Time not specified';

      // Normalize various time formats: "HH:mm", "HH:mm:ss", or malformed like "HHmm:ss"
      let hour = 0;
      let minutes = '00';

      // Case 1: Standard ISO-like time
      const isoDate = new Date(`1970-01-01T${time}`);
      if (!Number.isNaN(isoDate.getTime())) {
        hour = isoDate.getHours();
        minutes = `${isoDate.getMinutes()}`.padStart(2, '0');
      } else {
        // Case 2: Try regex patterns
        // Pattern A: HH:mm(:ss)?
        const m1 = time.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
        if (m1) {
          hour = parseInt(m1[1], 10);
          minutes = m1[2];
        } else {
          // Pattern B: HHmm:ss (e.g., 2013:30 -> 20:13:30)
          const m2 = time.match(/^(\d{2})(\d{2}):(\d{2})$/);
          if (m2) {
            hour = parseInt(m2[1], 10);
            minutes = m2[2];
          } else {
            return 'Time not specified';
          }
        }
      }
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return 'Time not specified';
    }
  };

  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Video Consultation Receipt',
          text: `Appointment #${data.appointmentNumber} with Dr. ${data.doctor.name} on ${formatDate(data.scheduledDate)} at ${formatTime(data.scheduledTime)}`,
          url: window.location.href
        });
      } else {
        handleCopyToClipboard(
          `Appointment #${data.appointmentNumber} with Dr. ${data.doctor.name} on ${formatDate(data.scheduledDate)} at ${formatTime(data.scheduledTime)}`,
          'Appointment details'
        );
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const generatePDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      // Add header
      doc.setFontSize(20);
      doc.text('HealthSecure - Video Consultation Receipt', 20, 20);
      
      // Add appointment details
      doc.setFontSize(12);
      doc.text(`Appointment Number: ${data.appointmentNumber}`, 20, 40);
      doc.text(`Date: ${formatDate(data.scheduledDate)}`, 20, 50);
      doc.text(`Time: ${formatTime(data.scheduledTime)}`, 20, 60);
      doc.text(`Type: Video Consultation`, 20, 70);
      
      // Add doctor details
      doc.text(`Doctor: Dr. ${data.doctor.name}`, 20, 90);
      doc.text(`Specialization: ${data.doctor.specialization}`, 20, 100);
      if (data.doctor.experience) {
        doc.text(`Experience: ${data.doctor.experience} years`, 20, 110);
      }
      
      // Add patient details
      doc.text(`Patient: ${data.patient.name}`, 20, 130);
      doc.text(`Email: ${data.patient.email}`, 20, 140);
      doc.text(`Phone: ${data.patient.phone}`, 20, 150);
      
      // Add payment details
      doc.text(`Payment ID: ${data.paymentDetails.paymentId}`, 20, 170);
      doc.text(`Order ID: ${data.paymentDetails.orderId}`, 20, 180);
      doc.text(`Amount: ₹${data.paymentDetails.amount}`, 20, 190);
      doc.text(`Status: ${data.paymentDetails.status}`, 20, 200);
      
      doc.save(`video-consultation-receipt-${data.appointmentNumber}.pdf`);
      toast.success('Receipt downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  const handleJoinCall = async () => {
    try {
      if (data.appointmentId) {
        const url = await appointmentService.joinVideoConsultation(data.appointmentId);
        window.open(url || `/patient/video-consultation/${data.appointmentId}`, '_blank', 'width=1280,height=720,noopener,noreferrer');
        return;
      }
      if (data.videoCallLink) {
        window.open(data.videoCallLink, '_blank', 'width=1280,height=720,noopener,noreferrer');
        return;
      }
      toast.error('Join link not available yet. Please check your email/SMS closer to the appointment time.');
    } catch (error) {
      console.error('Error joining call:', error);
      toast.error('Failed to open the video consultation.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-3 text-health-charcoal">
            <div className="w-10 h-10 bg-health-teal rounded-lg flex items-center justify-center">
              <Video className="w-6 h-6 text-white" />
            </div>
            Video Consultation Receipt
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Success Banner */}
          <Card className="border-l-4 border-l-health-success bg-gradient-to-r from-health-success/10 to-health-success/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-health-success rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-health-success mb-2">
                    Video Consultation Booked Successfully!
                  </h3>
                  <p className="text-health-charcoal">
                    Your appointment has been confirmed and payment processed. Please read all instructions carefully.
                  </p>
                  {data.verificationWarning && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-700">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-sm font-medium">Note: {data.verificationWarning}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appointment & Doctor Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Appointment Details */}
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <CardTitle className="text-xl flex items-center gap-3 text-health-charcoal">
                  <div className="w-10 h-10 bg-health-teal rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  Appointment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Appointment #:</span>
                    <span className="font-mono font-semibold text-health-charcoal bg-gray-100 px-3 py-1 rounded">
                      {data.appointmentNumber}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Date:</span>
                    <span className="font-semibold text-health-charcoal">{formatDate(data.scheduledDate)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Time:</span>
                    <span className="font-semibold text-health-charcoal">{formatTime(data.scheduledTime)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Type:</span>
                    <Badge variant="default" className="bg-health-teal text-white capitalize">
                      <Video className="w-3 h-3 mr-1" />
                      Video Consultation
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-600 font-medium">Status:</span>
                    <Badge variant="default" className="bg-health-success text-white">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {data.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Doctor Information */}
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <CardTitle className="text-xl flex items-center gap-3 text-health-charcoal">
                  <div className="w-10 h-10 bg-health-teal rounded-lg flex items-center justify-center">
                    <Stethoscope className="w-5 h-5 text-white" />
                  </div>
                  Doctor Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Name:</span>
                    <span className="font-semibold text-health-charcoal">Dr. {data.doctor.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Specialization:</span>
                    <span className="font-semibold text-health-charcoal">{data.doctor.specialization}</span>
                  </div>
                  {data.doctor.experience && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Experience:</span>
                      <span className="font-semibold text-health-charcoal">{data.doctor.experience} years</span>
                    </div>
                  )}
                  {data.doctor.languages && data.doctor.languages.length > 0 && (
                    <div className="flex justify-between items-center py-3">
                      <span className="text-gray-600 font-medium">Languages:</span>
                      <span className="font-semibold text-health-charcoal">{data.doctor.languages.join(', ')}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Video Call Details */}
          {(data.videoCallLink || data.videoCallDetails) && (
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <CardTitle className="text-xl flex items-center gap-3 text-health-charcoal">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                    <Video className="w-5 h-5 text-white" />
                  </div>
                  Video Call Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-white rounded-lg border">
                      <h6 className="font-semibold text-gray-800 mb-2">Platform</h6>
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-purple-600" />
                        <span className="text-gray-700">{data.videoCallDetails?.platform || 'HealthSecure Video'}</span>
                      </div>
                    </div>
                    {(data.videoCallDetails?.roomId || data.videoCallDetails?.password) && (
                      <div className="p-4 bg-white rounded-lg border">
                        <h6 className="font-semibold text-gray-800 mb-2">Room Details</h6>
                        <div className="space-y-2 text-sm">
                          {data.videoCallDetails?.roomId && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Room ID:</span>
                              <span className="font-mono text-gray-800">{data.videoCallDetails.roomId}</span>
                            </div>
                          )}
                          {data.videoCallDetails?.password && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Password:</span>
                              <span className="font-mono text-gray-800">{data.videoCallDetails.password}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-white rounded-lg border">
                      <h6 className="font-semibold text-gray-800 mb-2">Join Link</h6>
                      {data.videoCallLink ? (
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm text-gray-700">{data.videoCallLink}</span>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={() => handleCopyToClipboard(data.videoCallLink!, 'Join link')}
                              className="h-8"
                            >
                              <Copy className="w-4 h-4 mr-1" /> Copy
                            </Button>
                            <Button onClick={handleJoinCall} className="bg-purple-600 hover:bg-purple-700 text-white h-8">
                              <ExternalLink className="w-4 h-4 mr-1" /> Join Now
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-600">
                          The join link will be sent via Email/SMS 15 minutes before the appointment.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Patient Information */}
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <CardTitle className="text-xl flex items-center gap-3 text-health-charcoal">
                <div className="w-10 h-10 bg-health-teal rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-gray-600 text-sm font-medium block mb-2">Full Name</span>
                  <p className="font-semibold text-health-charcoal text-lg">{data.patient.name}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-gray-600 text-sm font-medium block mb-2">Email Address</span>
                  <p className="font-semibold text-health-charcoal text-lg break-all">{data.patient.email}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-gray-600 text-sm font-medium block mb-2">Phone Number</span>
                  <p className="font-semibold text-health-charcoal text-lg">{data.patient.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Video Consultation Instructions */}
          <Card className="shadow-lg border-0 border-l-4 border-l-health-teal">
            <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <CardTitle className="text-xl flex items-center gap-3 text-health-charcoal">
                <div className="w-10 h-10 bg-health-teal rounded-lg flex items-center justify-center">
                  <Video className="w-5 h-5 text-white" />
                </div>
                Video Consultation Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Technical Requirements */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg text-health-charcoal mb-3 flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-health-teal" />
                    Technical Requirements
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-health-teal/20 rounded-full flex items-center justify-center mt-0.5">
                        <CheckSquare className="w-4 h-4 text-health-teal" />
                      </div>
                      <span className="text-health-charcoal">Stable internet connection (minimum 2 Mbps)</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-health-teal/20 rounded-full flex items-center justify-center mt-0.5">
                        <CheckSquare className="w-4 h-4 text-health-teal" />
                      </div>
                      <span className="text-health-charcoal">Working camera and microphone</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-health-teal/20 rounded-full flex items-center justify-center mt-0.5">
                        <CheckSquare className="w-4 h-4 text-health-teal" />
                      </div>
                      <span className="text-health-charcoal">Quiet, well-lit environment</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-health-teal/20 rounded-full flex items-center justify-center mt-0.5">
                        <CheckSquare className="w-4 h-4 text-health-teal" />
                      </div>
                      <span className="text-health-charcoal">Chrome, Firefox, or Safari browser</span>
                    </div>
                  </div>
                </div>

                {/* Preparation Steps */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg text-health-charcoal mb-3 flex items-center gap-2">
                    <Timer className="w-5 h-5 text-health-aqua" />
                    Preparation Steps
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-health-aqua/20 rounded-full flex items-center justify-center mt-0.5">
                        <ArrowRight className="w-4 h-4 text-health-aqua" />
                      </div>
                      <span className="text-health-charcoal">Join 10 minutes before scheduled time</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-health-aqua/20 rounded-full flex items-center justify-center mt-0.5">
                        <ArrowRight className="w-4 h-4 text-health-aqua" />
                      </div>
                      <span className="text-health-charcoal">Test your camera and microphone</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-health-aqua/20 rounded-full flex items-center justify-center mt-0.5">
                        <ArrowRight className="w-4 h-4 text-health-aqua" />
                      </div>
                      <span className="text-health-charcoal">Have your ID and medical history ready</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-health-aqua/20 rounded-full flex items-center justify-center mt-0.5">
                        <ArrowRight className="w-4 h-4 text-health-aqua" />
                      </div>
                      <span className="text-health-charcoal">Ensure privacy and quiet surroundings</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Important Notice */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-blue-800 mb-2">Important Notice</h5>
                    <p className="text-blue-700 text-sm">
                      You will receive a video call link via email and SMS 15 minutes before your appointment. 
                      Click the link to join your consultation. If you don't receive the link, please contact support.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <CardTitle className="text-xl flex items-center gap-3 text-health-charcoal">
                <div className="w-10 h-10 bg-health-teal rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Payment Details */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg text-health-charcoal mb-3">Payment Details</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Consultation Fee:</span>
                      <span className="font-semibold text-health-charcoal">₹{data.cost.consultationFee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Total Amount:</span>
                      <span className="font-semibold text-health-charcoal text-lg">₹{data.cost.totalAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Payment Status:</span>
                      <Badge variant="default" className="bg-health-success text-white">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {data.paymentDetails.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Transaction Details */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg text-health-charcoal mb-3">Transaction Details</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Order ID:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium text-health-charcoal bg-gray-100 px-2 py-1 rounded text-xs">
                          {data.paymentDetails.orderId}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyToClipboard(data.paymentDetails.orderId, 'Order ID')}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Payment ID:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium text-health-charcoal bg-gray-100 px-2 py-1 rounded text-xs">
                          {data.paymentDetails.paymentId}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyToClipboard(data.paymentDetails.paymentId, 'Payment ID')}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Transaction ID:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium text-health-charcoal bg-gray-100 px-2 py-1 rounded text-xs">
                          {data.paymentDetails.razorpayPaymentId}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyToClipboard(data.paymentDetails.razorpayPaymentId, 'Transaction ID')}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Paid At:</span>
                      <span className="font-medium text-health-charcoal text-sm">
                        {new Date(data.paymentDetails.paidAt).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Currency:</span>
                      <span className="font-medium text-health-charcoal text-sm">{data.paymentDetails.currency}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support Information */}
          <Card className="shadow-lg border-0 border-l-4 border-l-health-aqua">
            <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <CardTitle className="text-xl flex items-center gap-3 text-health-charcoal">
                <div className="w-10 h-10 bg-health-aqua rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h5 className="font-semibold text-health-charcoal">Technical Support</h5>
                  <div className="flex items-center gap-2 text-health-charcoal">
                    <Phone className="w-4 h-4 text-health-aqua" />
                    <span>+91-1800-123-4567</span>
                  </div>
                  <div className="flex items-center gap-2 text-health-charcoal">
                    <Mail className="w-4 h-4 text-health-aqua" />
                    <span>support@healthsecure.com</span>
                  </div>
                  <div className="flex items-center gap-2 text-health-charcoal">
                    <Globe className="w-4 h-4 text-health-aqua" />
                    <span>www.healthsecure.com/support</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <h5 className="font-semibold text-health-charcoal">Emergency Contact</h5>
                  <div className="flex items-center gap-2 text-health-charcoal">
                    <Phone className="w-4 h-4 text-health-danger" />
                    <span>+91-1800-123-4567</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Available 24/7 for urgent medical assistance
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-6 border-t">
          <div className="flex gap-2">
            {data.consultationType === 'online' && (
              <Button onClick={handleJoinCall} className="bg-purple-600 text-white hover:bg-purple-700">
                <ExternalLink className="w-4 h-4 mr-2" />
                Join Call
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleShare}
              className="border-health-teal text-health-teal hover:bg-health-teal hover:text-white"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Receipt
            </Button>
            <Button
              variant="outline"
              onClick={generatePDF}
              className="border-health-aqua text-health-aqua hover:bg-health-aqua hover:text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
          <Button
            onClick={onClose}
            className="bg-health-teal text-white hover:bg-health-aqua"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Got It, Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
