import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { VideoConsultation } from '@/components/appointments/VideoConsultation';
import { appointmentService } from '@/services/appointmentService';
import api from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const VideoConsultationRoom: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!appointmentId) {
      toast.error('Invalid appointment ID');
      navigate('/patient/appointments');
      return;
    }

    const fetchAppointmentDetails = async () => {
      try {
        // Fetch appointment details via axios helper (handles baseURL + auth)
        const response = await api.get(`/appointments/${appointmentId}`);
        const payload = response.data?.data || response.data;
        setAppointment(payload);
        
        // Subscribe to video consultation events
        appointmentService.subscribeToVideoConsultation(appointmentId, handleVideoEvent);
      } catch (error) {
        console.error('Error fetching appointment details:', error);
        toast.error('Proceeding to join call with limited details');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointmentDetails();

    return () => {
      if (appointmentId) {
        appointmentService.unsubscribeFromVideoConsultation(appointmentId);
      }
    };
  }, [appointmentId, navigate]);

  const handleVideoEvent = (event: string, data: any) => {
    switch (event) {
      case 'ended':
        toast.info('Video consultation has ended');
        navigate('/patient/appointments');
        break;
      case 'participant-joined':
        toast.success(`${data.participantName} has joined the consultation`);
        break;
      case 'participant-left':
        toast.info(`${data.participantName} has left the consultation`);
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading consultation room...</span>
      </div>
    );
  }

  // Build safe display names with fallbacks
  const doctorName = appointment?.doctor
    ? `${appointment.doctor.firstName || ''} ${appointment.doctor.lastName || ''}`.trim() || 'Doctor'
    : 'Doctor';
  const patientName = appointment?.patient
    ? `${appointment.patient.firstName || ''} ${appointment.patient.lastName || ''}`.trim() || 'Patient'
    : 'Patient';

  return (
    <VideoConsultation
      appointmentId={appointmentId!}
      doctorName={doctorName}
      patientName={patientName}
      isDoctor={false}
    />
  );
}; 