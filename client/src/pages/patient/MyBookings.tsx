import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Video, 
  MapPin, 
  Star, 
  Calendar, 
  Clock, 
  Search, 
  Filter, 
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  FileText,
  Download,
  Share2,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Plus,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  User,
  Building,
  CreditCard,
  Receipt,
  MessageSquare,
  CalendarDays,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { Appointment } from '@/types/appointment';
import { appointmentService } from '@/services/appointmentService';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { DetailedReceipt } from '@/components/appointments/DetailedReceipt';
import { VideoConsultationReceipt } from '@/components/appointments/VideoConsultationReceipt';

const MyBookings: React.FC = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [consultationTypeFilter, setConsultationTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const data = await appointmentService.getMyAppointments();
      console.log('📋 Fetched appointments:', data);
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (appointmentId: string) => {
    try {
      await appointmentService.cancelAppointment(appointmentId);
      toast.success('Appointment cancelled successfully');
      fetchAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('Failed to cancel appointment');
    }
  };

  const handleReschedule = (appointmentId: string) => {
    navigate(`/patient/appointments/${appointmentId}/reschedule`);
  };

  const handleShowReceipt = (appointment: Appointment) => {
    console.log('🔍 Generating receipt data for appointment:', appointment);
    
    // Convert appointment data to receipt format
    const patientObj = (typeof appointment.patient === 'object' ? appointment.patient : null) as any;
    const doctorObj = (typeof appointment.doctor === 'object' ? appointment.doctor : null) as any;
    const hospitalObj = (typeof appointment.hospital === 'object' ? appointment.hospital : null) as any;

    const receiptData = {
      appointmentId: (appointment as any)._id,
      appointmentNumber: appointment.appointmentNumber,
      scheduledDate: appointment.scheduledDate,
      scheduledTime: appointment.scheduledTime,
      consultationType: appointment.consultationType || 'online',
      doctor: {
        name: doctorObj ? `${doctorObj.firstName || ''} ${doctorObj.lastName || ''}`.trim() || 'Dr. Unknown' : 'Dr. Unknown',
        specialization: doctorObj?.specialization || '-',
        experience: typeof doctorObj?.experience === 'number'
          ? doctorObj.experience
          : (doctorObj?.yearsOfExperience ? Number(doctorObj.yearsOfExperience) : undefined),
        languages: doctorObj?.languages,
        // Use doctor's location address if present; otherwise leave undefined
        location: doctorObj?.location ? { address: doctorObj.location.address || undefined } : undefined
      },
      // Patient details from populated patient - this should now have real data from database
      patient: {
        name: patientObj ? `${patientObj.firstName || ''} ${patientObj.lastName || ''}`.trim() || 'Patient' : 'Patient',
        email: patientObj?.email || '-',
        phone: patientObj?.phone || '-'
      },
      // Hospital details from populated hospital
      hospital: hospitalObj ? {
        name: hospitalObj.hospitalName || 'HealthSecure Hospital',
        address: hospitalObj.address || '-',
        phone: hospitalObj.phone || '+91-1800-123-4567',
        email: hospitalObj.email || 'support@healthsecure.com'
      } : {
        name: 'HealthSecure Hospital',
        address: '-',
        phone: '+91-1800-123-4567',
        email: 'support@healthsecure.com'
      },
      // Cost mapping: additionalCharges used as convenience fee
      cost: {
        consultationFee: appointment.cost?.consultationFee || 0,
        convenienceFee: appointment.cost?.additionalCharges || 0,
        totalAmount: appointment.cost?.totalAmount || 0
      },
      status: appointment.status,
      // Payment details from paymentData if available - real Razorpay data only
      paymentDetails: appointment.paymentData ? {
        orderId: (appointment.paymentData as any).orderId || '-',
        paymentId: (appointment.paymentData as any).paymentId || '-',
        razorpayPaymentId: (appointment.paymentData as any).paymentId || '-',
        amount: (appointment.paymentData as any).amount || appointment.cost?.totalAmount || 0,
        currency: (appointment.paymentData as any).currency || 'INR',
        status: (appointment.paymentData as any).status || appointment.paymentStatus || '-',
        paidAt: (appointment.paymentData as any).paidAt || (appointment as any).updatedAt || (appointment as any).createdAt || new Date().toISOString()
      } : undefined,
      verificationWarning: undefined
    } as any;

    console.log('🔍 Generated receipt data:', receiptData);
    setReceiptData(receiptData);
    setShowReceiptDialog(true);
  };

  const handleJoinCall = async (appointmentId: string) => {
    try {
      console.log('🎥 Join Call clicked for appointment:', appointmentId);
      const roomUrl = await appointmentService.joinVideoConsultation(appointmentId);
      console.log('🎥 Opening video consultation at:', roomUrl);
      
      const consultationWindow = window.open(
        roomUrl || `/patient/video-consultation/${appointmentId}`,
        '_blank',
        'width=1280,height=720,noopener,noreferrer'
      );

      if (!consultationWindow) {
        toast.error('Please allow pop-ups to join video consultations');
      } else {
        toast.success('Opening video consultation...');
      }
    } catch (error) {
      console.error('❌ Error joining video consultation:', error);
      toast.error('Failed to join video consultation');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-health-success text-white';
      case 'completed':
        return 'bg-health-aqua text-white';
      case 'cancelled':
        return 'bg-health-danger text-white';
      case 'pending':
        return 'bg-health-warning text-white';
      default:
        return 'bg-health-blue-gray text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'pending':
        return <ClockIcon className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getConsultationTypeIcon = (type: string) => {
    return type === 'online' ? (
      <Video className="w-4 h-4 text-health-teal" />
    ) : (
      <MapPin className="w-4 h-4 text-health-teal" />
    );
  };

  const AppointmentCard: React.FC<{ appointment: Appointment }> = ({ appointment }) => {
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const appointmentDate = new Date(appointment.scheduledDate);
    const isPast = appointmentDate < new Date();
    // For testing: allow Join Call button to appear for all online consultations
    // In production, use: const isWithin15Minutes = Math.abs(appointmentDate.getTime() - new Date().getTime()) <= 15 * 60 * 1000;
    const isWithin15Minutes = appointment.consultationType === 'online' && ['pending', 'confirmed'].includes(appointment.status);

    return (
      <Card className="mb-4 border border-gray-200 hover:border-health-teal/30 transition-all duration-200">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-health-teal/10 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-health-teal" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-health-charcoal">
                  {typeof appointment.doctor === 'object' ? 
                    `${appointment.doctor.firstName} ${appointment.doctor.lastName}` : 
                    'Doctor Name'
                  }
                </h3>
                <p className="text-health-blue-gray text-sm">
                  {typeof appointment.doctor === 'object' ? appointment.doctor.specialization : 'Specialization'}
                </p>
                <div className="flex items-center mt-1">
                  <Building className="w-3 h-3 text-health-blue-gray mr-1" />
                  <span className="text-xs text-health-blue-gray">
                    {typeof appointment.hospital === 'object' ? appointment.hospital.hospitalName : 'Hospital'}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <Badge className={`${getStatusColor(appointment.status)} mb-2 flex items-center gap-1`}>
                {getStatusIcon(appointment.status)}
                {appointment.status}
              </Badge>
              <div className="text-xs text-health-blue-gray">
                #{appointment.appointmentNumber}
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center text-health-charcoal">
              <Calendar className="w-4 h-4 mr-2 text-health-teal" />
              <span className="text-sm">{appointmentDate.toLocaleDateString()}</span>
            </div>
            <div className="flex items-center text-health-charcoal">
              <Clock className="w-4 h-4 mr-2 text-health-teal" />
              <span className="text-sm">{appointment.scheduledTime}</span>
            </div>
            <div className="flex items-center text-health-charcoal">
              {getConsultationTypeIcon(appointment.consultationType || 'online')}
              <span className="text-sm ml-2">
                {appointment.consultationType === 'online' ? 'Video Consultation' : 'In-Person Visit'}
              </span>
            </div>
          </div>

          {/* Payment Info */}
          {appointment.cost?.totalAmount && (
            <div className="bg-health-light-gray p-3 rounded-lg mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CreditCard className="w-4 h-4 text-health-teal mr-2" />
                  <span className="text-sm font-medium text-health-charcoal">Payment</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-health-charcoal">
                    ₹{appointment.cost.totalAmount}
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      appointment.paymentStatus === 'paid' 
                        ? 'border-health-success text-health-success' 
                        : 'border-health-warning text-health-warning'
                    }`}
                  >
                    {appointment.paymentStatus || 'pending'}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Expandable Details */}
          <Accordion type="single" collapsible>
            <AccordionItem value="details" className="border-none">
              <AccordionTrigger className="text-sm text-health-teal hover:text-health-aqua py-2">
                <span className="flex items-center">
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </span>
              </AccordionTrigger>
              <AccordionContent className="pt-2">
                <div className="space-y-4">
                  {/* Symptoms */}
                  {appointment.symptoms && appointment.symptoms.length > 0 && (
                    <div className="bg-health-light-gray p-3 rounded-lg">
                      <h4 className="text-sm font-medium text-health-charcoal mb-2 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2 text-health-warning" />
                        Symptoms
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {appointment.symptoms.map((symptom, index) => (
                          <Badge key={index} variant="outline" className="text-xs border-health-warning text-health-warning">
                            {symptom}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Patient Notes */}
                  {appointment.patientNotes && (
                    <div className="bg-health-light-gray p-3 rounded-lg">
                      <h4 className="text-sm font-medium text-health-charcoal mb-2 flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-health-teal" />
                        Your Notes
                      </h4>
                      <p className="text-sm text-health-charcoal">{appointment.patientNotes}</p>
                    </div>
                  )}

                  {/* Doctor Notes */}
                  {appointment.doctorNotes && (
                    <div className="bg-health-light-gray p-3 rounded-lg">
                      <h4 className="text-sm font-medium text-health-charcoal mb-2 flex items-center">
                        <MessageSquare className="w-4 h-4 mr-2 text-health-aqua" />
                        Doctor Notes
                      </h4>
                      <p className="text-sm text-health-charcoal">{appointment.doctorNotes}</p>
                    </div>
                  )}

                  {/* Emergency Contact */}
                  {appointment.emergencyContact?.name && (
                    <div className="bg-health-light-gray p-3 rounded-lg">
                      <h4 className="text-sm font-medium text-health-charcoal mb-2 flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-health-danger" />
                        Emergency Contact
                      </h4>
                      <p className="text-sm text-health-charcoal">
                        {appointment.emergencyContact.name} - {appointment.emergencyContact.phone}
                        {appointment.emergencyContact.relationship && ` (${appointment.emergencyContact.relationship})`}
                      </p>
                    </div>
                  )}

                  {/* Follow-up */}
                  {appointment.followUpRequired && (
                    <div className="bg-health-light-gray p-3 rounded-lg">
                      <h4 className="text-sm font-medium text-health-charcoal mb-2 flex items-center">
                        <CalendarDays className="w-4 h-4 mr-2 text-health-aqua" />
                        Follow-up Required
                      </h4>
                      <p className="text-sm text-health-charcoal">
                        {appointment.followUpDate ? 
                          `Scheduled for ${new Date(appointment.followUpDate).toLocaleDateString()}` : 
                          'Date to be determined'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Actions */}
          <div className="mt-4 flex justify-between items-center">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedAppointment(appointment);
                  setShowDetailsDialog(true);
                }}
                className="border-health-teal text-health-teal hover:bg-health-teal hover:text-white"
              >
                <Eye className="w-4 h-4 mr-1" />
                Details
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShowReceipt(appointment)}
                className="border-health-aqua text-health-aqua hover:bg-health-aqua hover:text-white"
              >
                <Receipt className="w-4 h-4 mr-1" />
                Receipt
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="border-health-blue-gray text-health-blue-gray">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleReschedule(appointment._id)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Reschedule
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShowReceipt(appointment)}>
                    <Receipt className="w-4 h-4 mr-2" />
                    View Receipt
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigator.share({ title: 'Appointment Details', text: `Appointment #${appointment.appointmentNumber}` })}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Details
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => handleCancel(appointment._id)}
                    className="text-health-danger"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Cancel Appointment
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex space-x-2">
              {appointment.consultationType === 'online' && ['pending', 'confirmed'].includes(appointment.status) && (
                <Button
                  onClick={() => handleJoinCall(appointment._id)}
                  className="bg-health-teal text-white hover:bg-health-aqua"
                  size="sm"
                >
                  <Video className="w-4 h-4 mr-1" />
                  Join Call
                </Button>
              )}
              {isPast && appointment.status === 'completed' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShowReceipt(appointment)}
                    className="border-health-aqua text-health-aqua hover:bg-health-aqua hover:text-white"
                  >
                    <Receipt className="w-4 h-4 mr-1" />
                    Receipt
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowReviewForm(true)}
                    className="border-health-aqua text-health-aqua hover:bg-health-aqua hover:text-white"
                  >
                    <Star className="w-4 h-4 mr-1" />
                    Rate & Review
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const AppointmentDetailsDialog: React.FC = () => {
    if (!selectedAppointment) return null;

    const appointment = selectedAppointment;
    const appointmentDate = new Date(appointment.scheduledDate);

    return (
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-health-charcoal">
              Appointment Details - #{appointment.appointmentNumber}
            </DialogTitle>
            <DialogDescription>
              Complete information about your appointment
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Doctor Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-health-charcoal">Doctor Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-health-teal/10 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-health-teal" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-health-charcoal">
                      {typeof appointment.doctor === 'object' ? 
                        `${appointment.doctor.firstName} ${appointment.doctor.lastName}` : 
                        'Doctor Name'
                      }
                    </h3>
                    <p className="text-health-blue-gray">
                      {typeof appointment.doctor === 'object' ? appointment.doctor.specialization : 'Specialization'}
                    </p>
                    <div className="flex items-center mt-2 space-x-4">
                      <Button variant="outline" size="sm" className="border-health-teal text-health-teal">
                        <Phone className="w-4 h-4 mr-1" />
                        Call
                      </Button>
                      <Button variant="outline" size="sm" className="border-health-teal text-health-teal">
                        <Mail className="w-4 h-4 mr-1" />
                        Message
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Appointment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-health-charcoal">Appointment Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-health-blue-gray">Date</label>
                    <p className="text-health-charcoal">{appointmentDate.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-health-blue-gray">Time</label>
                    <p className="text-health-charcoal">{appointment.scheduledTime}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-health-blue-gray">Type</label>
                    <p className="text-health-charcoal flex items-center">
                      {getConsultationTypeIcon(appointment.consultationType || 'online')}
                      <span className="ml-2">
                        {appointment.consultationType === 'online' ? 'Video Consultation' : 'In-Person Visit'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-health-blue-gray">Status</label>
                    <Badge className={`${getStatusColor(appointment.status)}`}>
                      {getStatusIcon(appointment.status)}
                      <span className="ml-1">{appointment.status}</span>
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            {appointment.cost && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-health-charcoal">Payment Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-health-blue-gray">Consultation Fee</span>
                      <span className="text-health-charcoal">₹{appointment.cost.consultationFee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-health-blue-gray">Additional Charges</span>
                      <span className="text-health-charcoal">₹{appointment.cost.additionalCharges}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span className="text-health-charcoal">Total Amount</span>
                      <span className="text-health-charcoal">₹{appointment.cost.totalAmount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-health-blue-gray">Payment Status</span>
                      <Badge 
                        variant="outline" 
                        className={`${
                          appointment.paymentStatus === 'paid' 
                            ? 'border-health-success text-health-success' 
                            : 'border-health-warning text-health-warning'
                        }`}
                      >
                        {appointment.paymentStatus || 'pending'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Additional Information */}
            {(appointment.symptoms?.length > 0 || appointment.patientNotes || appointment.doctorNotes) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-health-charcoal">Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {appointment.symptoms && appointment.symptoms.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-health-charcoal mb-2">Symptoms</h4>
                      <div className="flex flex-wrap gap-1">
                        {appointment.symptoms.map((symptom, index) => (
                          <Badge key={index} variant="outline" className="border-health-warning text-health-warning">
                            {symptom}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {appointment.patientNotes && (
                    <div>
                      <h4 className="text-sm font-medium text-health-charcoal mb-2">Your Notes</h4>
                      <p className="text-sm text-health-charcoal bg-health-light-gray p-3 rounded">
                        {appointment.patientNotes}
                      </p>
                    </div>
                  )}
                  
                  {appointment.doctorNotes && (
                    <div>
                      <h4 className="text-sm font-medium text-health-charcoal mb-2">Doctor Notes</h4>
                      <p className="text-sm text-health-charcoal bg-health-light-gray p-3 rounded">
                        {appointment.doctorNotes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Actions */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => handleShowReceipt(appointment)}
                className="border-health-aqua text-health-aqua hover:bg-health-aqua hover:text-white"
              >
                <Receipt className="w-4 h-4 mr-2" />
                View Receipt
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDetailsDialog(false)}
                className="border-health-blue-gray text-health-blue-gray hover:bg-health-blue-gray hover:text-white"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-health-teal mx-auto mb-4"></div>
            <p className="text-health-charcoal">Loading your appointments...</p>
          </div>
        </div>
      </div>
    );
  }

  // Filter appointments based on search and filters
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = searchTerm === '' || 
      (typeof appointment.doctor === 'object' && (
        appointment.doctor.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.doctor.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
      )) ||
      (typeof appointment.hospital === 'object' && 
        appointment.hospital.hospitalName?.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      appointment.appointmentNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    const matchesType = consultationTypeFilter === 'all' || appointment.consultationType === consultationTypeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const upcomingAppointments = filteredAppointments.filter(
    a => new Date(a.scheduledDate) >= new Date() && ['pending', 'confirmed'].includes(a.status)
  );
  const pastAppointments = filteredAppointments.filter(
    a => new Date(a.scheduledDate) < new Date() || !['pending', 'confirmed'].includes(a.status)
  );

  const stats = {
    total: appointments.length,
    upcoming: upcomingAppointments.length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
    online: appointments.filter(a => a.consultationType === 'online').length,
    offline: appointments.filter(a => a.consultationType === 'in-person').length,
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-health-charcoal">My Appointments</h1>
          <p className="text-health-blue-gray mt-1">Manage and track your healthcare appointments</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={fetchAppointments} 
            variant="outline"
            disabled={loading}
            className="border-health-teal text-health-teal hover:bg-health-teal hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button 
            onClick={() => navigate('/patient/book-appointment')}
            className="bg-health-teal text-white hover:bg-health-aqua"
          >
            <Plus className="w-4 h-4 mr-2" />
            Book New
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <Card className="border-health-teal/20 bg-health-teal/5">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-health-teal">{stats.total}</div>
            <div className="text-sm text-health-blue-gray">Total</div>
          </CardContent>
        </Card>
        <Card className="border-health-success/20 bg-health-success/5">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-health-success">{stats.upcoming}</div>
            <div className="text-sm text-health-blue-gray">Upcoming</div>
          </CardContent>
        </Card>
        <Card className="border-health-aqua/20 bg-health-aqua/5">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-health-aqua">{stats.completed}</div>
            <div className="text-sm text-health-blue-gray">Completed</div>
          </CardContent>
        </Card>
        <Card className="border-health-danger/20 bg-health-danger/5">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-health-danger">{stats.cancelled}</div>
            <div className="text-sm text-health-blue-gray">Cancelled</div>
          </CardContent>
        </Card>
        <Card className="border-health-teal/20 bg-health-teal/5">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-health-teal">{stats.online}</div>
            <div className="text-sm text-health-blue-gray">Online</div>
          </CardContent>
        </Card>
        <Card className="border-health-blue-gray/20 bg-health-blue-gray/5">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-health-blue-gray">{stats.offline}</div>
            <div className="text-sm text-health-blue-gray">In-Person</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-health-blue-gray w-4 h-4" />
              <Input
                placeholder="Search by doctor, specialization, hospital, or appointment number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-health-blue-gray/20 focus:border-health-teal"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-health-blue-gray/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-health-teal focus:border-health-teal"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={consultationTypeFilter}
                onChange={(e) => setConsultationTypeFilter(e.target.value)}
                className="px-3 py-2 border border-health-blue-gray/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-health-teal focus:border-health-teal"
              >
                <option value="all">All Types</option>
                <option value="online">Online</option>
                <option value="in-person">In-Person</option>
              </select>
              <Button
                variant="outline"
                onClick={() => setViewMode(viewMode === 'card' ? 'list' : 'card')}
                className="border-health-teal text-health-teal hover:bg-health-teal hover:text-white"
              >
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-health-light-gray">
          <TabsTrigger 
            value="upcoming" 
            className="data-[state=active]:bg-health-teal data-[state=active]:text-white"
          >
            Upcoming ({upcomingAppointments.length})
          </TabsTrigger>
          <TabsTrigger 
            value="past" 
            className="data-[state=active]:bg-health-teal data-[state=active]:text-white"
          >
            Past ({pastAppointments.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="mt-6">
          {upcomingAppointments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="w-16 h-16 text-health-blue-gray mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-health-charcoal mb-2">No upcoming appointments</h3>
                <p className="text-health-blue-gray mb-4">Book your first appointment to get started!</p>
                <Button 
                  onClick={() => navigate('/patient/book-appointment')} 
                  className="bg-health-teal text-white hover:bg-health-aqua"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Book Appointment
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map(appointment => (
                <AppointmentCard key={appointment._id} appointment={appointment} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          {pastAppointments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-health-blue-gray mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-health-charcoal mb-2">No past appointments</h3>
                <p className="text-health-blue-gray">Your appointment history will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pastAppointments.map(appointment => (
                <AppointmentCard key={appointment._id} appointment={appointment} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Details Dialog */}
      <AppointmentDetailsDialog />

      {/* Receipt Dialog */}
      {receiptData && (
        <>
          {/* Render VideoConsultationReceipt for online consultations */}
          {receiptData.consultationType === 'online' ? (
            <VideoConsultationReceipt
              open={showReceiptDialog}
              data={receiptData}
              onClose={() => {
                setShowReceiptDialog(false);
                setReceiptData(null);
              }}
            />
          ) : (
            /* Render DetailedReceipt for in-person consultations */
            <DetailedReceipt
              open={showReceiptDialog}
              data={receiptData}
              onClose={() => {
                setShowReceiptDialog(false);
                setReceiptData(null);
              }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default MyBookings; 