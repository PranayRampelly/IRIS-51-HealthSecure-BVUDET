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
  QrCode
} from 'lucide-react';
import { format } from 'date-fns';

interface PaymentSuccessDialogProps {
  open: boolean;
  onClose: () => void;
  appointmentData: {
    _id: string;
    appointmentNumber: string;
    doctor: {
      name: string;
      specialization: string;
      profilePhoto: string;
      experience: number;
      languages: string[];
      location: { address: string };
    };
    patient: {
      name: string;
      email: string;
      phone: string;
    };
    scheduledDate: string;
    scheduledTime: string;
    consultationType: 'online' | 'in-person';
    cost: {
      consultationFee: number;
      totalAmount: number;
    };
    status: string;
    videoCallLink?: string;
    videoCallDetails?: {
      platform: string;
      roomId: string;
      password: string;
    };
  };
  paymentData: {
    orderId: string;
    paymentId: string;
    razorpayPaymentId: string;
    amount: number;
    currency: string;
    status: string;
    paidAt: string;
    receiptUrl?: string;
  };
}

export const PaymentSuccessDialog: React.FC<PaymentSuccessDialogProps> = ({
  open,
  onClose,
  appointmentData,
  paymentData
}) => {
  // Add a callback to refresh appointments after dialog closes
  const handleClose = () => {
    // Trigger a custom event to refresh appointments
    window.dispatchEvent(new CustomEvent('appointment-booked', {
      detail: { appointmentData, paymentData }
    }));
    onClose();
  };
  const handleDownloadReceipt = () => {
    if (paymentData.receiptUrl) {
      window.open(paymentData.receiptUrl, '_blank');
    } else {
      // Generate and download receipt if no URL provided
      const receiptData = {
        appointmentNumber: appointmentData.appointmentNumber,
        doctorName: appointmentData.doctor.name,
        patientName: appointmentData.patient.name,
        date: appointmentData.scheduledDate,
        time: appointmentData.scheduledTime,
        amount: paymentData.amount / 100, // Convert from paise to rupees
        paymentId: paymentData.paymentId,
        orderId: paymentData.orderId,
        razorpayPaymentId: paymentData.razorpayPaymentId,
        paidAt: paymentData.paidAt
      };

      const blob = new Blob([JSON.stringify(receiptData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${appointmentData.appointmentNumber}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleAddToCalendar = () => {
    const event = {
      title: `Video Consultation with Dr. ${appointmentData.doctor.name}`,
      description: `Video consultation appointment with ${appointmentData.doctor.specialization}`,
      startTime: new Date(`${appointmentData.scheduledDate}T${appointmentData.scheduledTime}`),
      endTime: new Date(`${appointmentData.scheduledDate}T${appointmentData.scheduledTime}`).getTime() + (30 * 60 * 1000), // 30 minutes
      location: appointmentData.videoCallLink || 'Online Video Call'
    };

    // Create calendar event
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&details=${encodeURIComponent(event.description)}&dates=${event.startTime.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}/${new Date(event.endTime).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}&location=${encodeURIComponent(event.location)}`;
    
    window.open(calendarUrl, '_blank');
  };

  const handleJoinCall = () => {
    if (appointmentData.videoCallLink) {
      window.open(appointmentData.videoCallLink, '_blank', 'width=1280,height=720');
    }
  };

  const handleShareAppointment = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Appointment Confirmed',
        text: `I have a video consultation with Dr. ${appointmentData.doctor.name} on ${format(new Date(appointmentData.scheduledDate), 'PPP')} at ${appointmentData.scheduledTime}`,
        url: window.location.href
      });
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(`Appointment with Dr. ${appointmentData.doctor.name} on ${format(new Date(appointmentData.scheduledDate), 'PPP')} at ${appointmentData.scheduledTime}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-green-600">
            <CheckCircle className="w-8 h-8 text-green-500" />
            Payment Successful! 🎉
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Success Message */}
          <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-green-800 mb-2">
              Your Video Consultation is Confirmed!
            </h3>
            <p className="text-green-700">
              You will receive a confirmation email and SMS with all the details.
            </p>
          </div>

          {/* Appointment Summary Card */}
          <Card className="border-green-200 bg-green-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Calendar className="w-5 h-5" />
                Appointment Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Basic Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-green-200">
                      <img 
                        src={appointmentData.doctor.profilePhoto} 
                        alt={appointmentData.doctor.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        Dr. {appointmentData.doctor.name}
                      </h4>
                      <p className="text-green-700 font-medium">
                        {appointmentData.doctor.specialization}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Stethoscope className="w-4 h-4" />
                        {appointmentData.doctor.experience} years experience
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">
                        {format(new Date(appointmentData.scheduledDate), 'EEEE, MMMM do, yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">
                        {format(new Date(`2000-01-01T${appointmentData.scheduledTime}`), 'h:mm a')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Video className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">Video Consultation</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">{appointmentData.doctor.location.address}</span>
                    </div>
                  </div>
                </div>

                {/* Right Column - Additional Details */}
                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-lg border">
                    <h5 className="font-semibold text-gray-800 mb-3">Patient Details</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">{appointmentData.patient.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">{appointmentData.patient.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">{appointmentData.patient.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-lg border">
                    <h5 className="font-semibold text-gray-800 mb-3">Appointment Info</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Appointment #:</span>
                        <span className="font-mono font-medium text-gray-800">
                          {appointmentData.appointmentNumber}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                          {appointmentData.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="text-gray-800">30 minutes</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Details Card */}
          <Card className="border-blue-200 bg-blue-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <CreditCard className="w-5 h-5" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                    <span className="text-gray-600">Amount Paid:</span>
                    <span className="text-2xl font-bold text-green-600">
                      ₹{(paymentData.amount / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3 bg-white rounded-lg border">
                      <div className="text-gray-500">Order ID</div>
                      <div className="font-mono text-gray-800">{paymentData.orderId}</div>
                    </div>
                    <div className="p-3 bg-white rounded-lg border">
                      <div className="text-gray-500">Payment ID</div>
                      <div className="font-mono text-gray-800">{paymentData.razorpayPaymentId}</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="p-4 bg-white rounded-lg border">
                    <h6 className="font-semibold text-gray-800 mb-2">Payment Method</h6>
                    <div className="flex items-center gap-2">
                      <IndianRupee className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">Razorpay Online Payment</span>
                    </div>
                  </div>
                  <div className="p-4 bg-white rounded-lg border">
                    <h6 className="font-semibold text-gray-800 mb-2">Payment Status</h6>
                    <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                      {paymentData.status}
                    </Badge>
                    <div className="text-sm text-gray-600 mt-1">
                      Paid on {format(new Date(paymentData.paidAt), 'PPP')}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Video Call Details Card */}
          {appointmentData.videoCallLink && (
            <Card className="border-purple-200 bg-purple-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-800">
                  <Video className="w-5 h-5" />
                  Video Call Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-white rounded-lg border">
                      <h6 className="font-semibold text-gray-800 mb-2">Platform</h6>
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-purple-600" />
                        <span className="text-gray-700">{appointmentData.videoCallDetails?.platform || 'HealthSecure Video'}</span>
                      </div>
                    </div>
                    <div className="p-4 bg-white rounded-lg border">
                      <h6 className="font-semibold text-gray-800 mb-2">Room Details</h6>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Room ID:</span>
                          <span className="font-mono text-gray-800">{appointmentData.videoCallDetails?.roomId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Password:</span>
                          <span className="font-mono text-gray-800">{appointmentData.videoCallDetails?.password}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-white rounded-lg border">
                      <h6 className="font-semibold text-gray-800 mb-2">Instructions</h6>
                      <div className="space-y-2 text-sm text-gray-700">
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                          <span>Join 5 minutes before your scheduled time</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                          <span>Ensure stable internet connection</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                          <span>Test your camera and microphone</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                          <span>Have your ID ready for verification</span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={handleJoinCall}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Join Video Call
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-center">
            <Button onClick={handleAddToCalendar} variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
              <Calendar className="w-4 h-4 mr-2" />
              Add to Calendar
            </Button>
            <Button onClick={handleDownloadReceipt} variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
              <Download className="w-4 h-4 mr-2" />
              Download Receipt
            </Button>
            <Button onClick={handleShareAppointment} variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
              <Share2 className="w-4 h-4 mr-2" />
              Share Appointment
            </Button>
            <Button onClick={handleClose} className="bg-green-600 hover:bg-green-700 text-white">
              <CheckCircle className="w-4 h-4 mr-2" />
              Done
            </Button>
          </div>

          {/* Important Notes */}
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h6 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Important Notes
            </h6>
            <div className="space-y-2 text-sm text-yellow-700">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <span>Keep this confirmation for your records</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <span>You can reschedule up to 24 hours before the appointment</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <span>For any issues, contact our support team</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
