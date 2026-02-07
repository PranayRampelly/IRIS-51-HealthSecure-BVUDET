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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  User,
  Video,
  Phone,
  Mail,
  Building,
  Stethoscope,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface Appointment {
  id: string;
  doctorName: string;
  doctorId: string;
  dateTime: string;
  type: 'online' | 'in-person';
  status: 'scheduled' | 'completed' | 'cancelled' | 'in-progress';
  duration: number;
  reason: string;
  doctorDetails: {
    specialization: string;
    experience: number;
    email: string;
    phone: string;
    practiceLocation: {
      name: string;
      address: {
        street: string;
        city: string;
        state: string;
        pincode: string;
      };
    };
  };
}

const PatientConsultation = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAppointment();
  }, [appointmentId]);

  const loadAppointment = async () => {
    try {
      setLoading(true);
      // Load mock data from localStorage
      const storedAppointments = localStorage.getItem('patient_appointments');
      if (storedAppointments) {
        const allAppointments = JSON.parse(storedAppointments);
        const appointment = allAppointments.find((apt: Appointment) => apt.id === appointmentId);
        if (appointment) {
          setAppointment(appointment);
          // If it's a scheduled appointment, open Jitsi Meet immediately
          if (appointment.status === 'scheduled' || appointment.status === 'in-progress') {
            openJitsiMeet();
          }
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

  const openJitsiMeet = () => {
    const domain = 'meet.jit.si';
    // Join the same exact room pattern used by the doctor side to avoid moderator/auth wait
    const roomName = `healthsecure-${appointmentId}-public`;
    const patientName = 'Patient'; // TODO: Replace with actual patient name
    // If the doctor enabled lobby, patient will show "Ask to join"; if not, they join directly
    const url = `https://${domain}/${roomName}?userInfo.displayName=${encodeURIComponent(patientName)}#config.prejoinPageEnabled=true`;
    
    // Open Jitsi Meet in a new window
    window.open(url, '_blank', 'width=1280,height=720,noopener,noreferrer');

    // Update appointment status to in-progress
    const storedAppointments = localStorage.getItem('patient_appointments');
    if (storedAppointments) {
      const allAppointments = JSON.parse(storedAppointments);
      const updatedAppointments = allAppointments.map((apt: Appointment) =>
        apt.id === appointmentId ? { ...apt, status: 'in-progress' } : apt
      );
      localStorage.setItem('patient_appointments', JSON.stringify(updatedAppointments));
      
      // Update local state
      setAppointment(prev => prev ? { ...prev, status: 'in-progress' } : null);
    }

    // Show success toast
    toast({
      title: 'Consultation Started',
      description: 'Video consultation has been opened in a new window',
    });
  };

  const handleEndConsultation = async () => {
    try {
      // Update appointment status in localStorage
      const storedAppointments = localStorage.getItem('patient_appointments');
      if (storedAppointments) {
        const allAppointments = JSON.parse(storedAppointments);
        const updatedAppointments = allAppointments.map((apt: Appointment) =>
          apt.id === appointmentId ? { ...apt, status: 'completed' } : apt
        );
        localStorage.setItem('patient_appointments', JSON.stringify(updatedAppointments));
      }

      toast({
        title: 'Consultation Ended',
        description: 'Your consultation has been completed',
      });

      navigate('/patient/appointments');
    } catch (error) {
      console.error('Error ending consultation:', error);
      toast({
        title: 'Error',
        description: 'Failed to end consultation',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading consultation...</div>;
  }

  if (!appointment) {
    return <div className="text-center py-8">Appointment not found</div>;
  }

  return (
    <div className="min-h-screen bg-health-light-gray p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-health-teal mb-2">Online Consultation</h1>
            <div className="flex items-center gap-2">
              <Badge className={appointment.status === 'in-progress' ? 'bg-health-teal' : 'bg-health-warning'}>
                {appointment.status === 'in-progress' ? 'In Progress' : 'Scheduled'}
              </Badge>
              <span className="text-health-blue-gray">
                {format(new Date(appointment.dateTime), 'MMMM d, yyyy h:mm a')}
              </span>
            </div>
          </div>
          <Button
            onClick={openJitsiMeet}
            className="bg-health-teal hover:bg-health-teal/90"
          >
            <Video className="h-4 w-4 mr-2" />
            {appointment.status === 'in-progress' ? 'Rejoin Consultation' : 'Start Consultation'}
          </Button>
        </div>

        {/* Doctor Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Doctor Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-health-teal" />
                <span className="font-medium">Dr. {appointment.doctorName}</span>
                <Badge>{appointment.doctorDetails.specialization}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-health-blue-gray" />
                <span>{appointment.doctorDetails.experience} years experience</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-health-blue-gray" />
                <span>{appointment.doctorDetails.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-health-blue-gray" />
                <span>{appointment.doctorDetails.email}</span>
              </div>
              <div className="flex items-start gap-2">
                <Building className="h-4 w-4 text-health-blue-gray mt-1" />
                <div>
                  <p className="font-medium">{appointment.doctorDetails.practiceLocation.name}</p>
                  <p className="text-sm text-health-blue-gray">
                    {appointment.doctorDetails.practiceLocation.address.street},
                    {appointment.doctorDetails.practiceLocation.address.city},
                    {appointment.doctorDetails.practiceLocation.address.state} - 
                    {appointment.doctorDetails.practiceLocation.address.pincode}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                variant="destructive"
                onClick={() => setShowEndDialog(true)}
              >
                <X className="h-4 w-4 mr-2" />
                End Consultation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* End consultation dialog */}
      <Dialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>End Consultation</DialogTitle>
            <DialogDescription>
              Are you sure you want to end this consultation?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEndDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleEndConsultation}>
              End Consultation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientConsultation; 