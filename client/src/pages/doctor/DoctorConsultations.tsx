import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Calendar,
  Clock,
  User,
  Video,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
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
  meetingLink?: string;
}

const DoctorConsultations = () => {
  const [consultations, setConsultations] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadConsultations();
  }, []);

  const loadConsultations = async () => {
    try {
      setLoading(true);
      // Load mock data from localStorage
      const storedAppointments = localStorage.getItem('doctor_appointments');
      if (storedAppointments) {
        const allAppointments = JSON.parse(storedAppointments);
        // Filter only online consultations that are scheduled or in-progress
        const onlineConsultations = allAppointments.filter((apt: Appointment) => 
          apt.type === 'online' && 
          (apt.status === 'scheduled' || apt.status === 'in-progress') &&
          new Date(apt.dateTime) >= new Date() // Only future or current consultations
        );
        
        // Sort by date
        onlineConsultations.sort((a: Appointment, b: Appointment) => 
          new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
        );
        
        setConsultations(onlineConsultations);
      } else {
        setConsultations([]);
      }
    } catch (error) {
      console.error('Error loading consultations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load consultations',
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
      case 'in-progress':
        return 'bg-health-teal text-white';
      default:
        return 'bg-health-blue-gray text-white';
    }
  };

  const handleStartConsultation = (appointmentId: string) => {
    navigate(`/doctor/consultation/${appointmentId}`);
  };

  const renderConsultationCard = (consultation: Appointment) => (
    <Card key={consultation.id} className="mb-4">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-5 w-5 text-health-teal" />
              <h3 className="font-semibold text-lg">{consultation.patientName}</h3>
              <Badge className={getStatusColor(consultation.status)}>
                {consultation.status === 'in-progress' ? 'In Progress' : 'Scheduled'}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-health-blue-gray" />
                <span className="text-sm">
                  {format(new Date(consultation.dateTime), 'MMM dd, yyyy')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-health-blue-gray" />
                <span className="text-sm">
                  {format(new Date(consultation.dateTime), 'hh:mm a')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-health-blue-gray" />
                <span className="text-sm">Online Consultation</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-health-blue-gray" />
                <span className="text-sm">{consultation.patientContact.phone}</span>
              </div>
            </div>

            <div className="mt-4 text-sm text-health-blue-gray">
              <strong>Reason:</strong> {consultation.reason}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              onClick={() => handleStartConsultation(consultation.id)}
              className="bg-health-teal hover:bg-health-teal/90"
            >
              <Video className="h-4 w-4 mr-2" />
              {consultation.status === 'in-progress' ? 'Join Consultation' : 'Start Consultation'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-health-teal mb-2">Online Consultations</h1>
          <p className="text-health-blue-gray">
            Manage your online consultations and video calls
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading consultations...</div>
      ) : consultations.length > 0 ? (
        <div className="space-y-4">
          {consultations.map(renderConsultationCard)}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <Video className="h-12 w-12 text-health-blue-gray/50 mx-auto mb-4" />
            <p className="text-health-blue-gray">No online consultations scheduled</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DoctorConsultations; 