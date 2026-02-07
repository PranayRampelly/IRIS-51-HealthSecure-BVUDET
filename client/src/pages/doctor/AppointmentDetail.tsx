import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Calendar,
  Clock,
  User,
  Video,
  MapPin,
  Phone,
  Mail,
  FileText,
  AlertTriangle,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface Appointment {
  id: string;
  patientName: string;
  patientId: string;
  dateTime: string;
  type: 'online' | 'in-person';
  status: 'scheduled' | 'completed' | 'cancelled' | 'in-progress';
  duration: number;
  reason: string;
  patientContact: {
    email: string;
    phone: string;
  };
  location?: string;
  meetingLink?: string;
  notes?: string;
  medicalHistory?: {
    conditions: string[];
    allergies: string[];
    medications: string[];
  };
}

const AppointmentDetail = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAppointment();
  }, [appointmentId]);

  const loadAppointment = async () => {
    try {
      setLoading(true);
      // Load mock data from localStorage
      const storedAppointments = localStorage.getItem('doctor_appointments');
      if (storedAppointments) {
        const allAppointments = JSON.parse(storedAppointments);
        const appointment = allAppointments.find((apt: Appointment) => apt.id === appointmentId);
        if (appointment) {
          setAppointment(appointment);
        }
      }
    } catch (error) {
      console.error('Error loading appointment:', error);
      toast({
        title: 'Error',
        description: 'Failed to load appointment details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-health-warning text-white';
      case 'completed':
        return 'bg-health-success text-white';
      case 'cancelled':
        return 'bg-health-danger text-white';
      case 'in-progress':
        return 'bg-health-teal text-white';
      default:
        return 'bg-health-blue-gray text-white';
    }
  };

  const handleStartConsultation = () => {
    navigate(`/doctor/consultation/${appointmentId}`);
  };

  const handleCancelAppointment = async () => {
    try {
      // TODO: Replace with actual API call
      await fetch(`/api/doctor/appointments/${appointmentId}/cancel`, {
        method: 'POST',
      });

      toast({
        title: 'Appointment Cancelled',
        description: 'The appointment has been cancelled successfully',
      });

      navigate('/doctor/appointments');
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel appointment',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading appointment details...</div>;
  }

  if (!appointment) {
    return <div className="text-center py-8">Appointment not found</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-health-teal mb-2">
            Appointment Details
          </h1>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(appointment.status)}>
              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </Badge>
            {appointment.type === 'online' ? (
              <Badge variant="outline" className="border-health-teal text-health-teal">
                <Video className="h-3 w-3 mr-1" />
                Online Consultation
              </Badge>
            ) : (
              <Badge variant="outline" className="border-health-teal text-health-teal">
                <MapPin className="h-3 w-3 mr-1" />
                In-Person Visit
              </Badge>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {appointment.status === 'scheduled' && (
            <>
              {appointment.type === 'online' && (
                <Button
                  onClick={handleStartConsultation}
                  className="bg-health-teal hover:bg-health-teal/90"
                >
                  <Video className="h-4 w-4 mr-2" />
                  Start Consultation
                </Button>
              )}
              <Button
                variant="destructive"
                onClick={() => setShowCancelDialog(true)}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel Appointment
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Patient Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Patient Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-health-teal" />
                <span className="font-medium text-lg">{appointment.patientName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-health-blue-gray" />
                <span>{appointment.patientContact.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-health-blue-gray" />
                <span>{appointment.patientContact.email}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Appointment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-health-blue-gray" />
                <span>{format(new Date(appointment.dateTime), 'MMMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-health-blue-gray" />
                <span>{format(new Date(appointment.dateTime), 'h:mm a')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-health-blue-gray" />
                <span>Duration: {appointment.duration} minutes</span>
              </div>
              {appointment.type === 'in-person' && appointment.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-health-blue-gray" />
                  <span>{appointment.location}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Medical History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Medical History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Medical Conditions</h4>
                {appointment.medicalHistory?.conditions.length ? (
                  <ul className="list-disc list-inside">
                    {appointment.medicalHistory.conditions.map((condition, index) => (
                      <li key={index}>{condition}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-health-blue-gray">No known medical conditions</p>
                )}
              </div>
              <Separator />
              <div>
                <h4 className="font-medium mb-2">Allergies</h4>
                {appointment.medicalHistory?.allergies.length ? (
                  <ul className="list-disc list-inside">
                    {appointment.medicalHistory.allergies.map((allergy, index) => (
                      <li key={index}>{allergy}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-health-blue-gray">No known allergies</p>
                )}
              </div>
              <Separator />
              <div>
                <h4 className="font-medium mb-2">Current Medications</h4>
                {appointment.medicalHistory?.medications.length ? (
                  <ul className="list-disc list-inside">
                    {appointment.medicalHistory.medications.map((medication, index) => (
                      <li key={index}>{medication}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-health-blue-gray">No current medications</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointment Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Appointment Notes</CardTitle>
          </CardHeader>
          <CardContent>
            {appointment.notes ? (
              <div className="whitespace-pre-wrap">{appointment.notes}</div>
            ) : (
              <p className="text-health-blue-gray">No notes available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 py-3">
            <AlertTriangle className="h-5 w-5 text-health-warning" />
            <p className="text-sm text-health-blue-gray">
              The patient will be notified of this cancellation.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Appointment
            </Button>
            <Button variant="destructive" onClick={handleCancelAppointment}>
              Cancel Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentDetail; 