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
  BarChart3,
  Stethoscope,
  Activity,
  Users,
  VideoOff
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

import { appointmentService } from '@/services/appointmentService';
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

import { Appointment } from '@/types/appointment';

const DoctorAppointments = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [consultationTypeFilter, setConsultationTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    online: 0,
    offline: 0
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadAppointments();

  }, [statusFilter, consultationTypeFilter, searchTerm, pagination.currentPage]);

  const loadAppointments = async () => {
    try {
      setLoading(true);

      console.log('📋 Fetching doctor appointments from database...');
      
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      console.log('🔑 Token from localStorage:', token ? 'Present' : 'Missing');
      
      // Check user data
      const userData = localStorage.getItem('user');
      console.log('👤 User data from localStorage:', userData ? 'Present' : 'Missing');
      if (userData) {
        const user = JSON.parse(userData);
        console.log('👤 User role:', user.role);
        console.log('👤 User ID:', user._id || user.id);
      }
      
      // Fetch appointments from the database using the appointment service
      // The backend route automatically uses the logged-in doctor's ID
      const appointmentsData = await appointmentService.getDoctorAppointments({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        consultationType: consultationTypeFilter !== 'all' ? consultationTypeFilter : undefined,
        search: searchTerm || undefined,
        page: pagination.currentPage,
        limit: pagination.itemsPerPage
      });
      
      console.log('✅ Doctor appointments fetched:', appointmentsData);
      
      if (appointmentsData && appointmentsData.appointments) {
        console.log('📊 Raw appointments from backend:', appointmentsData.appointments.length);
        console.log('📋 Sample raw appointment:', appointmentsData.appointments[0]);
        console.log('🏥 Hospital data sample:', appointmentsData.appointments[0]?.hospital);
        console.log('📋 All raw appointments:', appointmentsData.appointments.map(apt => ({
          id: apt._id,
          date: apt.scheduledDate,
          status: apt.status,
          patient: apt.patient,
          consultationType: apt.consultationType,
          hospital: apt.hospital
        })));
        
        // Don't filter here - let the main component handle all filtering
        setAppointments(appointmentsData.appointments);
        setPagination(appointmentsData.pagination);
        setStatistics(appointmentsData.statistics);
      } else {
        setAppointments([]);

        console.log('📊 No appointments found for this doctor');
      }
    } catch (error) {

      console.error('❌ Error loading appointments:', error);
      toast({
        title: 'Error',

        description: 'Failed to load appointments from database',
        variant: 'destructive',
      });

      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {

      case 'pending':
        return 'bg-health-warning text-white';

      case 'confirmed':
        return 'bg-health-teal text-white';
      case 'completed':
        return 'bg-health-success text-white';
      case 'cancelled':
        return 'bg-health-danger text-white';
      case 'in-progress':

        return 'bg-health-aqua text-white';
      default:
        return 'bg-health-blue-gray text-white';
    }
  };


  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="w-4 h-4" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'in-progress':
        return <Activity className="w-4 h-4" />;
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

  const handleStartConsultation = (appointmentId: string) => {
    navigate(`/doctor/consultation/${appointmentId}`);
  };

  const handleViewDetails = (appointmentId: string) => {
    navigate(`/doctor/appointments/${appointmentId}`);
  };


  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      // Cancel appointment using the appointment service
      await appointmentService.updateAppointmentStatus(appointmentId, 'cancelled');
      
      // Reload appointments to get updated data
      loadAppointments();
      
      toast({
        title: 'Success',
        description: 'Appointment cancelled successfully',
      });
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel appointment',
        variant: 'destructive',
      });
    }
  };

  const AppointmentCard: React.FC<{ appointment: Appointment }> = ({ appointment }) => {
    const [expanded, setExpanded] = useState(false);
    const appointmentDate = new Date(appointment.scheduledDate);
    const isPast = appointmentDate < new Date();
    const isWithin15Minutes = appointment.consultationType === 'online' && ['pending', 'confirmed'].includes(appointment.status);

    // Extract patient information
    const patientName = typeof appointment.patient === 'object' 
      ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
      : 'Unknown Patient';
    
    const patientId = typeof appointment.patient === 'object' 
      ? appointment.patient._id 
      : appointment.patient || 'Unknown';

    const patientContact = {
      email: typeof appointment.patient === 'object' ? appointment.patient.email : 'No email',
      phone: typeof appointment.patient === 'object' ? appointment.patient.phone : 'No phone'
    };

    const reason = appointment.symptoms?.join(', ') || appointment.patientNotes || 'No reason specified';

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
                  {patientName}
                </h3>
                <p className="text-health-blue-gray text-sm">
                  Patient ID: {patientId}
                </p>
                <div className="flex items-center mt-1">
                  <Phone className="w-3 h-3 text-health-blue-gray mr-1" />
                  <span className="text-xs text-health-blue-gray">
                    {patientContact.phone}
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
              <span className="text-sm">{format(appointmentDate, 'MMM dd, yyyy')}</span>
            </div>
            <div className="flex items-center text-health-charcoal">
              <Clock className="w-4 h-4 mr-2 text-health-teal" />
              <span className="text-sm">{appointment.scheduledTime}</span>
            </div>
            <div className="flex items-center text-health-charcoal">
              {getConsultationTypeIcon(appointment.consultationType)}
              <span className="text-sm ml-2">
                {appointment.consultationType === 'online' ? 'Video Consultation' : 'In-Person Visit'}
              </span>
            </div>
          </div>


          {/* Reason */}
          <div className="bg-health-light-gray p-3 rounded-lg mb-4">
            <div className="flex items-center">
              <FileText className="w-4 h-4 text-health-teal mr-2" />
              <span className="text-sm font-medium text-health-charcoal">Reason for Visit</span>
            </div>
            <p className="text-sm text-health-charcoal mt-1">{reason}</p>
          </div>

          {/* Location for in-person */}
          {appointment.consultationType === 'in-person' && appointment.room && (
            <div className="bg-health-light-gray p-3 rounded-lg mb-4">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 text-health-teal mr-2" />
                <span className="text-sm font-medium text-health-charcoal">Location</span>
              </div>
              <p className="text-sm text-health-charcoal mt-1">{appointment.room}</p>
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
                        Patient Notes
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
                          `Scheduled for ${format(new Date(appointment.followUpDate), 'MMM dd, yyyy')}` : 
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
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="border-health-blue-gray text-health-blue-gray">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleViewDetails(appointment._id)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Appointment
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigator.share({ title: 'Appointment Details', text: `Appointment #${appointment.appointmentNumber}` })}>
                <Share2 className="w-4 h-4 mr-2" />
                Share Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => handleCancelAppointment(appointment._id)}
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

                  onClick={() => handleStartConsultation(appointment._id)}
                  className="bg-health-teal text-white hover:bg-health-aqua"
                  size="sm"
              >

                  <Video className="w-4 h-4 mr-1" />
                Start Consultation
              </Button>
            )}

              {appointment.consultationType === 'in-person' && ['pending', 'confirmed'].includes(appointment.status) && (
            <Button
              variant="outline"

                  size="sm"
                  onClick={() => handleStartConsultation(appointment._id)}
                  className="border-health-teal text-health-teal hover:bg-health-teal hover:text-white"
            >

                  <Stethoscope className="w-4 h-4 mr-1" />
                  Begin Session
            </Button>

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

    // Extract patient information
    const patientName = typeof appointment.patient === 'object' 
      ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
      : 'Unknown Patient';
    
    const patientId = typeof appointment.patient === 'object' 
      ? appointment.patient._id 
      : appointment.patient || 'Unknown';

  return (

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-health-charcoal">
              Appointment Details - #{appointment.appointmentNumber}
            </DialogTitle>
            <DialogDescription>
              Complete information about the appointment
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Patient Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-health-charcoal">Patient Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-health-teal/10 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-health-teal" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-health-charcoal">
                      {patientName}
                    </h3>
                    <p className="text-health-blue-gray">Patient ID: {patientId}</p>
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
                
                {/* Detailed Patient Info */}
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                  <div>
                    <label className="text-sm font-medium text-health-blue-gray">Email</label>
                    <p className="text-health-charcoal">
                      {typeof appointment.patient === 'object' ? appointment.patient.email : 'No email'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-health-blue-gray">Phone</label>
                    <p className="text-health-charcoal">
                      {typeof appointment.patient === 'object' ? appointment.patient.phone : 'No phone'}
                    </p>
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
                    <p className="text-health-charcoal">{format(appointmentDate, 'MMM dd, yyyy')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-health-blue-gray">Time</label>
                    <p className="text-health-charcoal">{appointment.scheduledTime}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-health-blue-gray">Type</label>
                    <p className="text-health-charcoal flex items-center">
                      {getConsultationTypeIcon(appointment.consultationType)}
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
                  <div>
                    <label className="text-sm font-medium text-health-blue-gray">Duration</label>
                    <p className="text-health-charcoal">{appointment.estimatedDuration} minutes</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-health-blue-gray">Priority</label>
                    <Badge variant="outline" className="border-health-warning text-health-warning">
                      {appointment.priority || 'normal'}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-health-blue-gray">Department</label>
                    <p className="text-health-charcoal">{appointment.department || 'General Medicine'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-health-blue-gray">Appointment Type</label>
                    <p className="text-health-charcoal">{appointment.appointmentType || 'consultation'}</p>
                  </div>
                  {appointment.room && (
                    <div>
                      <label className="text-sm font-medium text-health-blue-gray">Room/Location</label>
                      <p className="text-health-charcoal">{appointment.room}</p>
                    </div>
                  )}
                  {appointment.bed && (
                    <div>
                      <label className="text-sm font-medium text-health-blue-gray">Bed Number</label>
                      <p className="text-health-charcoal">{appointment.bed}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Hospital Information */}
            {appointment.hospital && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-health-charcoal">Hospital Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-health-blue-gray">Hospital Name</label>
                      <p className="text-health-charcoal">
                        {typeof appointment.hospital === 'object' ? appointment.hospital.hospitalName : appointment.hospital}
                      </p>
                    </div>
                    {typeof appointment.hospital === 'object' && appointment.hospital.address && (
                      <div>
                        <label className="text-sm font-medium text-health-blue-gray">Address</label>
                        <p className="text-health-charcoal">
                          {typeof appointment.hospital.address === 'object' ? 
                            `${appointment.hospital.address.street || ''} ${appointment.hospital.address.city || ''} ${appointment.hospital.address.state || ''} ${appointment.hospital.address.zipCode || ''} ${appointment.hospital.address.country || ''}`.trim() :
                            appointment.hospital.address
                          }
                        </p>
                      </div>
                    )}
                    {typeof appointment.hospital === 'object' && appointment.hospital.phone && (
                      <div>
                        <label className="text-sm font-medium text-health-blue-gray">Phone</label>
                        <p className="text-health-charcoal">{appointment.hospital.phone}</p>
                      </div>
                    )}
                    {typeof appointment.hospital === 'object' && appointment.hospital.email && (
                      <div>
                        <label className="text-sm font-medium text-health-blue-gray">Email</label>
                        <p className="text-health-charcoal">{appointment.hospital.email}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Medical Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-health-charcoal">Medical Information</CardTitle>
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
                    <h4 className="text-sm font-medium text-health-charcoal mb-2">Patient Notes</h4>
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
                
                {appointment.followUpRequired && (
                  <div>
                    <h4 className="text-sm font-medium text-health-charcoal mb-2">Follow-up Required</h4>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="border-health-success text-health-success">
                        Yes
                      </Badge>
                      {appointment.followUpDate && (
                        <span className="text-sm text-health-charcoal">
                          Scheduled for: {format(new Date(appointment.followUpDate), 'MMM dd, yyyy')}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {appointment.emergencyContact && (
        <div>

                    <h4 className="text-sm font-medium text-health-charcoal mb-2">Emergency Contact</h4>
                    <div className="bg-health-light-gray p-3 rounded">
                      <p className="text-sm text-health-charcoal">
                        <strong>Name:</strong> {appointment.emergencyContact.name}
                      </p>
                      <p className="text-sm text-health-charcoal">
                        <strong>Phone:</strong> {appointment.emergencyContact.phone}
                      </p>
                      <p className="text-sm text-health-charcoal">
                        <strong>Relationship:</strong> {appointment.emergencyContact.relationship}
          </p>
        </div>
      </div>

                )}
                
                {appointment.patientVitals && (
                  <div>
                    <h4 className="text-sm font-medium text-health-charcoal mb-2">Patient Vitals</h4>
                    <div className="grid grid-cols-2 gap-4 bg-health-light-gray p-3 rounded">
                      {appointment.patientVitals.bloodPressure && (
                        <div>
                          <label className="text-xs font-medium text-health-blue-gray">Blood Pressure</label>
                          <p className="text-sm text-health-charcoal">{appointment.patientVitals.bloodPressure}</p>
                        </div>
                      )}
                      {appointment.patientVitals.heartRate && (
                        <div>
                          <label className="text-xs font-medium text-health-blue-gray">Heart Rate</label>
                          <p className="text-sm text-health-charcoal">{appointment.patientVitals.heartRate}</p>
                        </div>
                      )}
                      {appointment.patientVitals.temperature && (
                        <div>
                          <label className="text-xs font-medium text-health-blue-gray">Temperature</label>
                          <p className="text-sm text-health-charcoal">{appointment.patientVitals.temperature}</p>
                        </div>
                      )}
                      {appointment.patientVitals.weight && (
                        <div>
                          <label className="text-xs font-medium text-health-blue-gray">Weight</label>
                          <p className="text-sm text-health-charcoal">{appointment.patientVitals.weight}</p>
                        </div>
                      )}
                      {appointment.patientVitals.height && (
                        <div>
                          <label className="text-xs font-medium text-health-blue-gray">Height</label>
                          <p className="text-sm text-health-charcoal">{appointment.patientVitals.height}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Payment & Financial Information */}
            {(appointment.paymentStatus || appointment.cost || appointment.bookingSource || appointment.emergencyPriority) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-health-charcoal">Payment & Financial</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {appointment.paymentStatus && (
                      <div>
                        <label className="text-sm font-medium text-health-blue-gray">Payment Status</label>
                        <Badge 
                          variant={appointment.paymentStatus === 'paid' ? 'default' : 'outline'}
                          className={appointment.paymentStatus === 'paid' ? 'bg-health-success text-white' : 'border-health-warning text-health-warning'}
                        >
                          {appointment.paymentStatus}
                        </Badge>
                      </div>
                    )}
                    {appointment.cost && (
                      <div>
                        <label className="text-sm font-medium text-health-blue-gray">Total Cost</label>
                        <p className="text-health-charcoal">
                          ₹{typeof appointment.cost === 'object' ? appointment.cost.totalAmount : appointment.cost}
                        </p>
                      </div>
                    )}
                    {appointment.bookingSource && (
                      <div>
                        <label className="text-sm font-medium text-health-blue-gray">Booking Source</label>
                        <p className="text-health-charcoal">{appointment.bookingSource}</p>
                      </div>
                    )}
                    {appointment.emergencyPriority && (
                      <div>
                        <label className="text-sm font-medium text-health-blue-gray">Emergency Priority</label>
                        <Badge variant="outline" className="border-health-danger text-health-danger">
                          {appointment.emergencyPriority}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Status History */}
            {appointment.statusHistory && appointment.statusHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-health-charcoal">Status History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {appointment.statusHistory.map((statusEntry, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-health-light-gray rounded-lg">
                        <div className="w-3 h-3 bg-health-teal rounded-full"></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <Badge className={`${getStatusColor(statusEntry.status)}`}>
                              {statusEntry.status}
                            </Badge>
                            <span className="text-xs text-health-blue-gray">
                              {statusEntry.timestamp ? format(new Date(statusEntry.timestamp), 'MMM dd, yyyy HH:mm') : 'N/A'}
                            </span>
                          </div>
                          {statusEntry.notes && (
                            <p className="text-sm text-health-charcoal mt-1">{statusEntry.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* System Information */}
            {(appointment.appointmentNumber || appointment.createdAt || appointment.updatedAt || appointment.preferredLanguage) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-health-charcoal">System Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {appointment.appointmentNumber && (
                      <div>
                        <label className="text-sm font-medium text-health-blue-gray">Appointment Number</label>
                        <p className="text-health-charcoal font-mono">#{appointment.appointmentNumber}</p>
                      </div>
                    )}
                    {appointment.createdAt && (
                      <div>
                        <label className="text-sm font-medium text-health-blue-gray">Created</label>
                        <p className="text-health-charcoal">
                          {format(new Date(appointment.createdAt), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    )}
                    {appointment.updatedAt && (
                      <div>
                        <label className="text-sm font-medium text-health-blue-gray">Last Updated</label>
                        <p className="text-health-charcoal">
                          {format(new Date(appointment.updatedAt), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    )}
                    {appointment.preferredLanguage && (
                      <div>
                        <label className="text-sm font-medium text-health-blue-gray">Preferred Language</label>
                        <p className="text-health-charcoal capitalize">{appointment.preferredLanguage}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Actions */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowDetailsDialog(false)}
                className="border-health-blue-gray text-health-blue-gray hover:bg-health-blue-gray hover:text-white"
              >
                Close
              </Button>
              {appointment.consultationType === 'online' && ['pending', 'confirmed'].includes(appointment.status) && (
                <Button
                  onClick={() => {
                    setShowDetailsDialog(false);
                    handleStartConsultation(appointment._id);
                  }}
                  className="bg-health-teal text-white hover:bg-health-aqua"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Start Consultation
                </Button>
              )}
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
            <p className="text-health-charcoal">Loading appointments...</p>
          </div>
        </div>
      </div>
    );
  }

  // Filter appointments based on search and filters
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = searchTerm === '' || 
      (typeof appointment.patient === 'object' && (
        appointment.patient.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.patient.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
      )) ||
      appointment.appointmentNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.symptoms?.some(symptom => symptom.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    const matchesType = consultationTypeFilter === 'all' || appointment.consultationType === consultationTypeFilter;
    
    // Debug filtering
    if (statusFilter !== 'all' || consultationTypeFilter !== 'all') {
      console.log('🔍 Filter debug:', {
        appointmentId: appointment._id,
        appointmentStatus: appointment.status,
        statusFilter,
        matchesStatus,
        appointmentType: appointment.consultationType,
        consultationTypeFilter,
        matchesType,
        finalResult: matchesSearch && matchesStatus && matchesType
      });
    }
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const upcomingAppointments = filteredAppointments.filter(
    a => {
      // Handle date comparison more robustly
      let aptDate: Date;
      if (typeof a.scheduledDate === 'string') {
        aptDate = new Date(a.scheduledDate);
      } else if (a.scheduledDate instanceof Date) {
        aptDate = a.scheduledDate;
      } else {
        console.warn('⚠️ Invalid scheduledDate:', a.scheduledDate, 'for appointment:', a._id);
        aptDate = new Date();
      }
      
      const now = new Date();
      // Reset time to start of day for fair comparison
      const aptDateOnly = new Date(aptDate.getFullYear(), aptDate.getMonth(), aptDate.getDate());
      const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const isUpcoming = aptDateOnly >= nowOnly && ['pending', 'confirmed'].includes(a.status);
      
      console.log('🔍 Appointment filtering:', {
        id: a._id,
        date: a.scheduledDate,
        aptDate: aptDate.toISOString(),
        aptDateOnly: aptDateOnly.toISOString(),
        now: now.toISOString(),
        nowOnly: nowOnly.toISOString(),
        status: a.status,
        isUpcoming,
        dateCheck: aptDateOnly >= nowOnly,
        statusCheck: ['pending', 'confirmed'].includes(a.status),
        dateDiff: aptDateOnly.getTime() - nowOnly.getTime(),
        dateDiffDays: Math.floor((aptDateOnly.getTime() - nowOnly.getTime()) / (1000 * 60 * 60 * 24))
      });
      
      return isUpcoming;
    }
  );
  
  const pastAppointments = filteredAppointments.filter(
    a => {
      // Handle date comparison more robustly
      let aptDate: Date;
      if (typeof a.scheduledDate === 'string') {
        aptDate = new Date(a.scheduledDate);
      } else if (a.scheduledDate instanceof Date) {
        aptDate = a.scheduledDate;
      } else {
        console.warn('⚠️ Invalid scheduledDate:', a.scheduledDate, 'for appointment:', a._id);
        aptDate = new Date();
      }
      
      const now = new Date();
      // Reset time to start of day for fair comparison
      const aptDateOnly = new Date(aptDate.getFullYear(), aptDate.getMonth(), aptDate.getDate());
      const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const isPast = aptDateOnly < nowOnly || !['pending', 'confirmed'].includes(a.status);
      
      console.log('🔍 Past appointment filtering:', {
        id: a._id,
        date: a.scheduledDate,
        aptDate: aptDate.toISOString(),
        aptDateOnly: aptDateOnly.toISOString(),
        now: now.toISOString(),
        nowOnly: nowOnly.toISOString(),
        status: a.status,
        isPast,
        dateCheck: aptDateOnly < nowOnly,
        statusCheck: !['pending', 'confirmed'].includes(a.status)
      });
      
      return isPast;
    }
  );

  const stats = {
    total: statistics.total,
    upcoming: upcomingAppointments.length,
    completed: statistics.completed,
    cancelled: statistics.cancelled,
    online: statistics.online,
    offline: statistics.offline,
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-health-charcoal">My Appointments</h1>
          <p className="text-health-blue-gray mt-1">Manage and track your patient appointments</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={loadAppointments} 
            variant="outline"
            disabled={loading}
            className="border-health-teal text-health-teal hover:bg-health-teal hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button 
            onClick={() => navigate('/doctor/schedule')}
            className="bg-health-teal text-white hover:bg-health-aqua"
          >
            <Plus className="w-4 h-4 mr-2" />
            Schedule Appointment
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
        <Card className="border-health-warning/20 bg-health-warning/5">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-health-warning">{stats.upcoming}</div>
            <div className="text-sm text-health-blue-gray">Upcoming</div>
          </CardContent>
        </Card>
        <Card className="border-health-success/20 bg-health-success/5">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-health-success">{stats.completed}</div>
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
                placeholder="Search by patient name, ID, or reason..."
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
                <option value="in-progress">In Progress</option>
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
      <Tabs defaultValue="upcoming" className="w-full" onValueChange={setActiveTab}>

        <TabsList className="grid w-full grid-cols-3 bg-health-light-gray">
          <TabsTrigger 
            value="upcoming" 
            className="data-[state=active]:bg-health-teal data-[state=active]:text-white"
          >
            Upcoming ({upcomingAppointments.length})
          </TabsTrigger>
          <TabsTrigger 
            value="completed" 
            className="data-[state=active]:bg-health-teal data-[state=active]:text-white"
          >
            Completed ({stats.completed})
          </TabsTrigger>
          <TabsTrigger 
            value="cancelled" 
            className="data-[state=active]:bg-health-teal data-[state=active]:text-white"
          >
            Cancelled ({stats.cancelled})
          </TabsTrigger>
        </TabsList>


        <TabsContent value="upcoming" className="mt-6">
          {upcomingAppointments.length === 0 ? (
            <Card>

              <CardContent className="text-center py-12">
                <Calendar className="w-16 h-16 text-health-blue-gray mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-health-charcoal mb-2">No upcoming appointments</h3>
                <p className="text-health-blue-gray mb-4">Your scheduled appointments will appear here!</p>
                <Button 
                  onClick={() => navigate('/doctor/schedule')} 
                  className="bg-health-teal text-white hover:bg-health-aqua"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Appointment
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


        <TabsContent value="completed" className="mt-6">
          {stats.completed === 0 ? (
            <Card>

              <CardContent className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-health-blue-gray mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-health-charcoal mb-2">No completed appointments</h3>
                <p className="text-health-blue-gray">Your completed appointments will appear here</p>
              </CardContent>
            </Card>

          ) : (
            <div className="space-y-4">
              {appointments.filter(a => a.status === 'completed').map(appointment => (
                <AppointmentCard key={appointment._id} appointment={appointment} />
              ))}
            </div>
          )}
        </TabsContent>


        <TabsContent value="cancelled" className="mt-6">
          {stats.cancelled === 0 ? (
            <Card>

              <CardContent className="text-center py-12">
                <XCircle className="w-16 h-16 text-health-blue-gray mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-health-charcoal mb-2">No cancelled appointments</h3>
                <p className="text-health-blue-gray">Your cancelled appointments will appear here</p>
              </CardContent>
            </Card>

          ) : (
            <div className="space-y-4">
              {appointments.filter(a => a.status === 'cancelled').map(appointment => (
                <AppointmentCard key={appointment._id} appointment={appointment} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>


      {/* Details Dialog */}
      <AppointmentDetailsDialog />
    </div>
  );
};


export default DoctorAppointments; 