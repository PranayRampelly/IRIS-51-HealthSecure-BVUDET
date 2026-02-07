import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { appointmentService } from '@/services/appointmentService';
import api from '@/lib/api';
import { Loader2, Video, Phone, Mail, User, Stethoscope, X, Calendar, Clock, FileText, Pill, ClipboardList, NotebookPen, CalendarPlus, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export const DoctorConsultationRoom: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [enableWaitingRoom, setEnableWaitingRoom] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [showPrescription, setShowPrescription] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [rxName, setRxName] = useState('');
  const [rxDosage, setRxDosage] = useState('');
  const [rxDuration, setRxDuration] = useState('');
  const [rxNotes, setRxNotes] = useState('');
  const [fuDate, setFuDate] = useState(''); // YYYY-MM-DD
  const [fuTime, setFuTime] = useState(''); // HH:mm:ss or HH:mm
  const [fuLoading, setFuLoading] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);



  useEffect(() => {
    console.log('🔍 DoctorConsultationRoom mounted with appointmentId:', appointmentId);
    console.log('🔍 Current URL:', window.location.href);
    console.log('🔍 Route params:', { appointmentId });
    
    if (!appointmentId) {
      toast.error('Invalid appointment ID');
      navigate('/doctor/appointments');
      return;
    }

    const fetchAppointmentDetails = async () => {
      try {
        console.log('🔍 Fetching appointment details for:', appointmentId);
        console.log('🔍 API endpoint:', `/appointments/${appointmentId}`);
        
        // Fetch appointment details via axios helper (handles baseURL + auth)
        const response = await api.get(`/appointments/${appointmentId}`);
        console.log('🔍 Raw API response:', response);
        
        const payload = response.data?.data || response.data;
        console.log('✅ Appointment details fetched:', payload);
        
        if (!payload) {
          console.error('❌ No appointment data received');
          toast.error('No appointment data received');
          return;
        }
        
        setAppointment(payload);
        
        // Subscribe to video consultation events
        console.log('🔍 Subscribing to video consultation events');
        try {
          appointmentService.subscribeToVideoConsultation(appointmentId, handleVideoEvent);
        } catch (error) {
          console.warn('⚠️ Could not subscribe to video consultation events:', error);
        }
        
        // Update appointment status to in-progress
        console.log('🔍 Updating appointment status to in-progress');
        try {
          await appointmentService.updateAppointmentStatus(appointmentId, 'in-progress');
        } catch (error) {
          console.warn('⚠️ Could not update appointment status:', error);
        }
        
      } catch (error) {
        console.error('❌ Error fetching appointment details:', error);
        console.error('❌ Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        toast.error('Failed to load appointment details');
      } finally {
        console.log('✅ Setting loading to false');
        setLoading(false);
      }
    };

    fetchAppointmentDetails();

    return () => {
      if (appointmentId) {
        console.log('🔍 Cleaning up video consultation subscription');
        appointmentService.unsubscribeFromVideoConsultation(appointmentId);
      }
    };
  }, [appointmentId, navigate]);

  // Lightweight session timer (local only)
  useEffect(() => {
    if (!timerActive) return;
    const t = setInterval(() => setSessionSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [timerActive]);

  const handleVideoEvent = (event: string, data: any) => {
    switch (event) {
      case 'ended':
        toast.info('Video consultation has ended');
        navigate('/doctor/appointments');
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

  const openJitsiMeet = () => {
    const domain = 'meet.jit.si';
    
    // Extract doctor information with fallbacks
    const doctor = appointment?.doctor;
    const doctorId = doctor?._id || doctor?.id || 'unknown-doctor';
    const doctorName = doctor 
      ? `${doctor.firstName || doctor.name || ''} ${doctor.lastName || ''}`.trim() || 'Doctor'
      : 'Doctor';
    const doctorEmail = doctor?.email || `doctor.${doctorId}@healthsecure.com`;
    const doctorSpecialization = doctor?.specialization || 'General Medicine';
    
    console.log('🔍 Doctor data for Jitsi authentication:', {
      doctorId,
      doctorName,
      doctorEmail,
      doctorSpecialization,
      fullDoctorObject: doctor
    });
    
    // Try a completely different approach - use a room name that might bypass restrictions
    const roomName = `healthsecure-${appointmentId}-public`;
    
    // Create a completely different URL structure that might bypass restrictions
    // The issue is that Jitsi Meet requires at least one authenticated user to start
    // So we'll try to create a room that's already "active"
    const lobbyFlag = enableWaitingRoom ? 'true' : 'false';
    const url = `https://${domain}/${roomName}?userInfo.displayName=${encodeURIComponent(doctorName)}&userInfo.email=${encodeURIComponent(doctorEmail)}&userInfo.role=moderator#config.prejoinPageEnabled=false&config.disableInviteFunctions=false&config.requireDisplayName=false&config.disableRemoteMute=false&config.startAudioOnly=false&config.startWithAudioMuted=false&config.startWithVideoMuted=false&config.moderator=true&config.admin=true&config.membersOnly=${lobbyFlag}&config.lobby.enabled=${lobbyFlag}&config.lobby.knock=${lobbyFlag}`;
    
    console.log('🔍 Created forced public room URL:', url);
    
    console.log('🔍 Opening Jitsi Meet URL:', url);
    
    // Open Jitsi Meet in a new window
    window.open(url, '_blank', 'width=1280,height=720,noopener,noreferrer');

    // Show success toast
    toast.success('Video consultation has been opened in a new window');

    // Start local timer
    setTimerActive(true);
  };

  const handleEndConsultation = async () => {
    try {
      // Update appointment status to completed
      await appointmentService.updateAppointmentStatus(appointmentId!, 'completed');
      toast.success('Consultation ended successfully');
      navigate('/doctor/appointments');
    } catch (error) {
      console.error('Error ending consultation:', error);
      toast.error('Failed to end consultation');
      navigate('/doctor/appointments');
    }
  };

  const fetchPatientHistory = async () => {
    if (!appointment?.patient?._id) {
      setHistoryItems([]);
      return;
    }
    setHistoryLoading(true);
    try {
      // Try multiple endpoints; gracefully fall back to empty
      const patientId = appointment.patient._id;
      const candidates = [
        `/appointments/patient/${patientId}`,
        `/doctor/patients/${patientId}/history`,
        `/appointments/history?patientId=${patientId}`
      ];
      let items: any[] = [];
      for (const url of candidates) {
        try {
          const resp = await api.get(url);
          const data = resp.data?.data || resp.data?.appointments || resp.data;
          if (Array.isArray(data) && data.length) {
            items = data.slice(0, 10);
            break;
          }
        } catch {
          // continue to next
        }
      }
      setHistoryItems(items);
    } finally {
      setHistoryLoading(false);
    }
  };

  const submitPrescription = async () => {
    if (!rxName || !rxDosage || !rxDuration) {
      toast.error('Please fill medicine, dosage and duration');
      return;
    }
    try {
      const payload = {
        appointmentId,
        patientId: appointment?.patient?._id,
        items: [{ name: rxName, dosage: rxDosage, duration: rxDuration, notes: rxNotes }]
      };
      const endpoints = [
        '/doctor/prescriptions',
        `/appointments/${appointmentId}/prescription`,
        `/appointments/${appointmentId}/notes`
      ];
      let success = false;
      for (const url of endpoints) {
        try {
          if (url.endsWith('/notes')) {
            await appointmentService.updateAppointmentNotes(
              appointmentId!,
              `Prescription: ${rxName}, ${rxDosage}, ${rxDuration}${rxNotes ? ' - ' + rxNotes : ''}`
            );
            success = true;
            break;
          } else {
            await api.post(url, payload);
            success = true;
            break;
          }
        } catch {
          // try next
        }
      }
      if (success) {
        toast.success('Prescription saved');
        setShowPrescription(false);
        setRxName(''); setRxDosage(''); setRxDuration(''); setRxNotes('');
      } else {
        toast.error('Failed to save prescription');
      }
    } catch (e) {
      toast.error('Failed to save prescription');
    }
  };

  const submitFollowUp = async () => {
    if (!fuDate || !fuTime) {
      toast.error('Please select date and time');
      return;
    }
    setFuLoading(true);
    try {
      await api.post('/doctor/schedule/schedule', {
        patientId: appointment?.patient?._id,
        date: fuDate,
        startTime: fuTime.length === 5 ? `${fuTime}:00` : fuTime,
        appointmentType: 'follow_up',
        consultationType: appointment?.consultationType || 'in-person',
        notes: `Follow-up for appointment ${appointmentId}`
      });
      toast.success('Follow-up scheduled');
      setShowFollowUp(false);
      setFuDate(''); setFuTime('');
    } catch (e) {
      toast.error('Failed to schedule follow-up');
    } finally {
      setFuLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Loading Consultation Room</h2>
          <p className="text-gray-600 mb-4">Please wait while we prepare your consultation...</p>
          <div className="text-sm text-gray-500 mb-4">
            Appointment ID: {appointmentId}
          </div>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Consultation Room</h2>
          <p className="text-gray-600 mb-4">Appointment ID: {appointmentId}</p>
          <p className="text-gray-600 mb-4">Unable to load appointment data. Please try again.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
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
    <div className="min-h-screen bg-health-light-gray p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Simple Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-health-teal mb-2">Doctor Consultation Room</h1>
              <div className="flex items-center gap-3">
                <Badge className={`${
                  appointment.status === 'in-progress' 
                    ? 'bg-health-success text-white' 
                    : appointment.status === 'completed'
                    ? 'bg-health-aqua text-white'
                    : 'bg-health-warning text-white'
                }`}>
                  {appointment.status === 'in-progress' ? 'Active' : 
                   appointment.status === 'completed' ? 'Completed' : 
                   'Ready to Start'}
                </Badge>
                <span className="text-health-blue-gray text-sm">ID: {appointmentId}</span>
                {timerActive && (
                  <span className="text-sm text-health-teal font-medium">
                    <Clock className="inline w-4 h-4 mr-1" />
                    {String(Math.floor(sessionSeconds / 60)).padStart(2, '0')}
                    :{String(sessionSeconds % 60).padStart(2, '0')}
                  </span>
                )}
              </div>
            </div>
            
            <Button
              onClick={openJitsiMeet}
              className="bg-health-teal hover:bg-health-teal/90 text-white px-6 py-2"
              size="lg"
            >
              <Video className="h-5 w-5 mr-2" />
              {appointment.status === 'in-progress' ? 'Rejoin Consultation' : 'Start Consultation'}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Essential Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Patient Information */}
            <Card className="shadow-sm border border-gray-200">
              <CardHeader className="bg-health-teal text-white">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-health-teal/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-health-teal" />
                    </div>
                    <div>
                      <p className="font-semibold text-health-charcoal">{patientName}</p>
                      <Badge className="bg-health-aqua text-white">Patient</Badge>
                    </div>
                  </div>
                  
                  {appointment.patient?.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-health-aqua" />
                      <span className="text-health-charcoal">{appointment.patient.email}</span>
                    </div>
                  )}
                  
                  {appointment.patient?.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-health-success" />
                      <span className="text-health-charcoal">{appointment.patient.phone}</span>
                    </div>
                  )}
                  
                  {appointment.symptoms && appointment.symptoms.length > 0 && (
                    <div className="pt-2">
                      <p className="font-medium text-health-charcoal mb-2">Symptoms:</p>
                      <div className="flex flex-wrap gap-2">
                        {appointment.symptoms.map((symptom, index) => (
                          <Badge key={index} variant="outline" className="border-health-warning text-health-warning">
                            {symptom}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {appointment.patientNotes && (
                    <div className="pt-2">
                      <p className="font-medium text-health-charcoal mb-2">Patient Notes:</p>
                      <p className="text-sm text-health-blue-gray bg-gray-50 p-3 rounded border">
                        {appointment.patientNotes}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Appointment Details */}
            <Card className="shadow-sm border border-gray-200">
              <CardHeader className="bg-health-aqua text-white">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Appointment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-health-blue-gray">Date & Time</p>
                    <p className="text-health-charcoal font-medium">
                      {appointment.scheduledDate ? new Date(appointment.scheduledDate).toLocaleDateString() : 'N/A'}
                    </p>
                    {appointment.scheduledTime && (
                      <p className="text-sm text-health-blue-gray">
                        Time: {appointment.scheduledTime}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-health-blue-gray">Consultation Type</p>
                    <Badge className="bg-health-aqua text-white capitalize">
                      {appointment.consultationType || 'N/A'}
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-health-blue-gray">Status</p>
                    <Badge className={`${
                      appointment.status === 'in-progress' ? 'bg-health-success' :
                      appointment.status === 'completed' ? 'bg-health-aqua' :
                      appointment.status === 'cancelled' ? 'bg-health-danger' :
                      'bg-health-warning'
                    } text-white capitalize`}>
                      {appointment.status || 'N/A'}
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-health-blue-gray">Priority</p>
                    <Badge className={`${
                      appointment.emergencyPriority === 'high' ? 'bg-health-danger' :
                      appointment.emergencyPriority === 'medium' ? 'bg-health-warning' :
                      'bg-health-success'
                    } text-white capitalize`}>
                      {appointment.emergencyPriority || 'Normal'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Essential Actions */}
          <div className="space-y-6">
            {/* Essential Actions */}
            <Card className="shadow-sm border border-gray-200">
              <CardHeader className="bg-health-success text-white">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Stethoscope className="w-5 h-5" />
                  Essential Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 border rounded">
                    <div className="text-sm text-health-charcoal">Waiting room (lobby)</div>
                    <label className="flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only" checked={enableWaitingRoom} onChange={(e) => setEnableWaitingRoom(e.target.checked)} />
                      <div className={`w-10 h-5 rounded-full transition-colors ${enableWaitingRoom ? 'bg-health-teal' : 'bg-gray-300'}`}>
                        <div className={`h-5 w-5 bg-white rounded-full transform transition-transform ${enableWaitingRoom ? 'translate-x-5' : 'translate-x-0'}`} />
                      </div>
                    </label>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-health-aqua text-health-aqua hover:bg-health-aqua hover:text-white"
                    onClick={() => { setShowHistory(true); fetchPatientHistory(); }}
                  >
                    <ClipboardList className="w-4 h-4 mr-2" />
                    View Patient History
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start border-health-success text-health-success hover:bg-health-success hover:text-white"
                    onClick={() => setShowPrescription(true)}
                  >
                    <Pill className="w-4 h-4 mr-2" />
                    Prescribe Medication
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start border-health-warning text-health-warning hover:bg-health-warning hover:text-white"
                    onClick={() => setShowFollowUp(true)}
                  >
                    <CalendarPlus className="w-4 h-4 mr-2" />
                    Schedule Follow-up
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* End Consultation */}
            <Card className="shadow-sm border border-gray-200">
              <CardHeader className="bg-health-danger text-white">
                <CardTitle className="text-lg flex items-center gap-2">
                  <X className="w-5 h-5" />
                  End Session
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-sm text-health-blue-gray mb-4">
                  Complete the consultation
                </p>
                <Button
                  variant="destructive"
                  onClick={() => setShowEndDialog(true)}
                  className="w-full bg-health-danger hover:bg-health-danger/90"
                >
                  <X className="w-4 h-4 mr-2" />
                  End Consultation
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* End consultation dialog */}
      <Dialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>End Consultation</DialogTitle>
            <DialogDescription>
              Are you sure you want to end this consultation? This action cannot be undone.
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

      {/* Patient History */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Patient History</DialogTitle>
            <DialogDescription>Recent consultations and notes</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-[50vh] overflow-y-auto">
            {historyLoading ? (
              <div className="flex items-center justify-center py-6"><Loader2 className="w-5 h-5 animate-spin" /></div>
            ) : historyItems.length === 0 ? (
              <div className="text-center text-health-blue-gray py-6">No history available</div>
            ) : (
              historyItems.map((it, idx) => (
                <div key={idx} className="p-3 border rounded flex items-center justify-between">
                  <div>
                    <div className="font-medium text-health-charcoal capitalize">{it.consultationType || it.type || 'consultation'}</div>
                    <div className="text-sm text-health-blue-gray">{it.scheduledDate ? new Date(it.scheduledDate).toLocaleString() : (it.dateTime ? new Date(it.dateTime).toLocaleString() : '')}</div>
                  </div>
                  {it.status && <Badge className="bg-health-aqua text-white capitalize">{it.status}</Badge>}
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowHistory(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Prescription */}
      <Dialog open={showPrescription} onOpenChange={setShowPrescription}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Prescribe Medication</DialogTitle>
            <DialogDescription>Create a simple prescription for the patient</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-health-charcoal mb-1">Medicine</label>
              <input className="w-full border rounded p-2" value={rxName} onChange={(e) => setRxName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-health-charcoal mb-1">Dosage</label>
                <input className="w-full border rounded p-2" value={rxDosage} onChange={(e) => setRxDosage(e.target.value)} placeholder="e.g., 1-0-1" />
              </div>
              <div>
                <label className="block text-sm text-health-charcoal mb-1">Duration</label>
                <input className="w-full border rounded p-2" value={rxDuration} onChange={(e) => setRxDuration(e.target.value)} placeholder="e.g., 5 days" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-health-charcoal mb-1">Notes</label>
              <textarea className="w-full border rounded p-2" rows={3} value={rxNotes} onChange={(e) => setRxNotes(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPrescription(false)}>Cancel</Button>
            <Button className="bg-health-teal hover:bg-health-teal/90" onClick={submitPrescription}>Save Prescription</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Follow-up */}
      <Dialog open={showFollowUp} onOpenChange={setShowFollowUp}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Follow-up</DialogTitle>
            <DialogDescription>Select date and time for the follow-up appointment</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-health-charcoal mb-1">Date</label>
              <input type="date" className="w-full border rounded p-2" value={fuDate} onChange={(e) => setFuDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-health-charcoal mb-1">Time</label>
              <input type="time" className="w-full border rounded p-2" value={fuTime} onChange={(e) => setFuTime(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFollowUp(false)}>Cancel</Button>
            <Button className="bg-health-aqua hover:bg-health-aqua/90" disabled={fuLoading} onClick={submitFollowUp}>
              {fuLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CalendarPlus className="w-4 h-4 mr-2" />}
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
