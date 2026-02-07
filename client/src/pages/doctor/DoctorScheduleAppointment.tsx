import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Calendar, Clock, User, Search, Plus, Check, X,
  ArrowLeft, ArrowRight, Phone, Mail, MapPin,
  AlertTriangle, CheckCircle, Clock as ClockIcon, Loader2,
  BarChart3
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import api from '@/lib/api';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  avatar?: string;
  lastVisit?: string;
}

interface TimeSlot {
  time: string;
  endTime: string;
  available: boolean;
  bookedBy?: string;
  appointmentId?: string;
}

interface Appointment {
  id: string;
  patientName: string;
  patientId: string;
  date: string;
  time: string;
  endTime: string;
  type: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  consultationType: string;
  estimatedDuration: number;
  cost?: any;
}

const DoctorScheduleAppointment: React.FC = () => {
  // Use a ref to track the actual selected date and prevent overrides
  const selectedDateRef = useRef<Date>(new Date(2025, 7, 23)); // August 23rd, 2025
  
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const testDate = new Date(2025, 7, 23); // August 23rd, 2025 (month is 0-indexed)
    selectedDateRef.current = testDate;
    console.log('🔍 Frontend - Initializing selectedDate:', {
      testDate: testDate.toISOString(),
      testDateString: testDate.toISOString().split('T')[0]
    });
    return testDate;
  });
  
  // Debug logging for selectedDate changes
  useEffect(() => {
    console.log('🔍 Frontend - selectedDate state updated:', {
      selectedDate: selectedDate.toISOString(),
      selectedDateString: selectedDate.toISOString().split('T')[0],
      selectedDateLocale: selectedDate.toLocaleDateString(),
      refDate: selectedDateRef.current.toISOString().split('T')[0]
    });
    
    // Ensure ref is always in sync
    selectedDateRef.current = selectedDate;
  }, [selectedDate]);
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [appointmentType, setAppointmentType] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for real data
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [existingAppointments, setExistingAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [consultationFilter] = useState<'all' | 'in-person' | 'online'>('all');

  const appointmentTypes = [
    { value: 'consultation', label: 'General Consultation' },
    { value: 'follow_up', label: 'Follow-up Visit' },
    { value: 'emergency', label: 'Emergency Visit' },
    { value: 'procedure', label: 'Medical Procedure' },
    { value: 'checkup', label: 'Routine Checkup' },
  ];

  // Fetch time slots for selected date
  const fetchTimeSlots = async (date: Date) => {
    try {
      setLoadingSlots(true);
      const dateString = date.toISOString().split('T')[0];
      console.log('🔍 Frontend - Fetching time slots for date:', dateString);
      
      const response = await api.get(`/doctor/schedule/time-slots/${dateString}`);
      
      if (response.data?.success) {
        console.log('🔍 Frontend - Received time slots:', response.data.data);
        setTimeSlots(response.data.data);
      } else {
        console.error('Failed to fetch time slots:', response.data?.message);
        toast({
          title: "Error",
          description: "Failed to fetch time slots",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching time slots:', error);
      toast({
        title: "Error",
        description: "Failed to fetch time slots",
        variant: "destructive",
      });
    } finally {
      setLoadingSlots(false);
    }
  };

  // Fetch appointments for selected date
  const fetchAppointments = async (date: Date) => {
    try {
      setLoading(true);
      const dateString = date.toISOString().split('T')[0];
      const response = await api.get(`/doctor/schedule/appointments/${dateString}`);
      
      if (response.data?.success) {
        setExistingAppointments(response.data.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch appointments",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch appointments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch patients
  const fetchPatients = async () => {
    try {
      setLoadingPatients(true);
      const response = await api.get('/doctor/schedule/patients');
      
      if (response.data?.success) {
        setPatients(response.data.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch patients",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast({
        title: "Error",
        description: "Failed to fetch patients",
        variant: "destructive",
      });
    } finally {
      setLoadingPatients(false);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    console.log('🔍 Frontend - Component mounted, initial selectedDate:', selectedDate.toISOString().split('T')[0]);
    fetchPatients();
  }, []);

  // Load data when selected date changes
  useEffect(() => {
    console.log('🔍 Frontend - Selected date changed:', {
      selectedDate: selectedDate.toISOString(),
      selectedDateString: selectedDate.toISOString().split('T')[0],
      selectedDateLocale: selectedDate.toLocaleDateString()
    });
    
    // Use setTimeout to ensure state is fully updated
    const timer = setTimeout(() => {
      fetchTimeSlots(selectedDateRef.current);
      fetchAppointments(selectedDateRef.current);
    }, 0);
    
    return () => clearTimeout(timer);
  }, [selectedDate]);

  // Debug effect to track selectedDate changes
  useEffect(() => {
    console.log('🔍 Debug - selectedDate state changed to:', selectedDate.toISOString().split('T')[0]);
  }, [selectedDate]);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-800">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getAppointmentTypeIcon = (type: string) => {
    switch (type) {
      case 'consultation': return <User className="w-4 h-4" />;
      case 'follow_up': return <Clock className="w-4 h-4" />;
      case 'emergency': return <AlertTriangle className="w-4 h-4" />;
      case 'procedure': return <CheckCircle className="w-4 h-4" />;
      case 'checkup': return <Check className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const handleScheduleAppointment = async () => {
    if (!selectedPatient || !selectedTime || !appointmentType) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const dateString = selectedDate.toISOString().split('T')[0];
      
      const response = await api.post('/doctor/schedule/schedule', {
        patientId: selectedPatient,
        date: dateString,
        startTime: selectedTime,
        appointmentType,
        consultationType: 'in-person', // Default to in-person for now
        notes,
        // estimatedDuration will be determined by doctor's availability settings
      });

      if (response.data?.success) {
        toast({
          title: "Success",
          description: "Appointment scheduled successfully",
        });
        setIsDialogOpen(false);
        // Reset form
        setSelectedPatient('');
        setSelectedTime('');
        setAppointmentType('');
        setNotes('');
        // Refresh data
        fetchTimeSlots(selectedDate);
        fetchAppointments(selectedDate);
      } else {
        toast({
          title: "Error",
          description: response.data?.message || "Failed to schedule appointment",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error scheduling appointment:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to schedule appointment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const days = getDaysInMonth(selectedDate);

  console.log('🔍 Frontend - Component rendering with selectedDate:', selectedDate.toISOString().split('T')[0]);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-health-charcoal">Schedule Appointment</h1>
          <p className="text-health-blue-gray mt-2">Schedule new appointments with patients</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsDialogOpen(true)} className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>New Appointment</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              const newDate = new Date(2025, 7, 23); // August 23rd
              console.log('🔍 Button - Setting date to Aug 23:', newDate.toISOString().split('T')[0]);
              setSelectedDate(newDate);
            }}
            className="flex items-center space-x-2"
          >
            <Calendar className="w-4 h-4" />
            <span>Go to Aug 23</span>
          </Button>
          <Button 
            variant="ghost"
            onClick={() => {
              const today = new Date(2025, 7, 17); // Test "today"
              setSelectedDate(today);
            }}
            className="flex items-center space-x-2"
          >
            <span>Today</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-2">
          <Card key={`calendar-${selectedDate.toISOString().split('T')[0]}`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-health-aqua" />
                  <span>Calendar</span>
                </span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-health-blue-gray">
                    {day}
                  </div>
                ))}
                {days.map((day, index) => {
                  // Use consistent date comparison - for testing, we'll use August 17th as "today"
                  const today = new Date(2025, 7, 17); // August 17th, 2025
                  const isToday = day && day.toISOString().split('T')[0] === today.toISOString().split('T')[0];
                  const isSelected = day && day.toISOString().split('T')[0] === selectedDateRef.current.toISOString().split('T')[0];
                  
                  // Debug logging for calendar highlighting
                  if (day && (isToday || isSelected)) {
                    console.log('🔍 Calendar - Day highlighting:', {
                      day: day.toISOString().split('T')[0],
                      isToday,
                      isSelected,
                      selectedDate: selectedDate.toISOString().split('T')[0],
                      refDate: selectedDateRef.current.toISOString().split('T')[0]
                    });
                  }
                  
                  return (
                    <div
                      key={`day-${day ? day.toISOString().split('T')[0] : index}`}
                      className={`p-2 text-center text-sm border rounded cursor-pointer hover:bg-gray-50 ${
                        isToday
                          ? 'bg-health-aqua text-white'
                          : isSelected
                          ? 'bg-health-aqua/20 border-health-aqua'
                          : 'border-gray-200'
                      }`}
                                            title={day ? `Select ${day.toLocaleDateString()} (Current: ${selectedDate.toLocaleDateString()})` : ''}
                      onClick={() => {
                        if (day) {
                          const newDate = new Date(day);
                                                  console.log('🔍 Calendar - Date clicked:', {
                          clickedDate: day.toISOString(),
                          clickedDateString: day.toISOString().split('T')[0],
                          currentSelectedDate: selectedDate.toISOString(),
                          currentRefDate: selectedDateRef.current.toISOString().split('T')[0],
                          newDate: newDate.toISOString(),
                          newDateString: newDate.toISOString().split('T')[0]
                        });
                          
                          // Force a clean date object
                          const cleanDate = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
                          console.log('🔍 Calendar - Setting clean date:', cleanDate.toISOString().split('T')[0]);
                          setSelectedDate(cleanDate);
                        }
                      }}
                    >
                      {day ? day.getDate() : ''}
                      {day && existingAppointments.some(apt => {
                        const aptDate = typeof apt.date === 'string' ? apt.date : 
                          (apt.date && typeof apt.date === 'object' && 'toISOString' in apt.date ? 
                           (apt.date as Date).toISOString().split('T')[0] : null);
                        return aptDate === day.toISOString().split('T')[0];
                      }) && (
                        <div className="w-2 h-2 bg-health-warning rounded-full mx-auto mt-1"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Time Slots */}
          <Card className="mt-6" key={`time-slots-${selectedDate.toISOString().split('T')[0]}`}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-health-aqua" />
                <span>Available Time Slots - {selectedDateRef.current.toISOString().split('T')[0]}</span>
                {loadingSlots && <Loader2 className="w-4 h-4 animate-spin" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingSlots ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-health-aqua" />
                  <span className="ml-2 text-health-blue-gray">Loading time slots...</span>
                </div>
              ) : timeSlots.length === 0 ? (
                <div className="text-center py-8 text-health-blue-gray">
                  No time slots available for this date
                </div>
              ) : (
                <div className="space-y-6">
                  {(() => {
                    // Group time slots for better readability
                    const groups: Record<'Morning' | 'Afternoon' | 'Evening', typeof timeSlots> = {
                      Morning: [],
                      Afternoon: [],
                      Evening: []
                    };
                    timeSlots.forEach(slot => {
                      const [hour] = slot.time.split(':').map(Number);
                      if (hour < 12) groups.Morning.push(slot);
                      else if (hour < 17) groups.Afternoon.push(slot);
                      else groups.Evening.push(slot);
                    });

                    const Section = (title: keyof typeof groups) => (
                      groups[title].length === 0 ? null : (
                        <div key={title}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-health-blue-gray">{title}</span>
                            <span className="text-xs text-gray-500">{groups[title].filter(s => s.available).length} available</span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {groups[title].map(slot => (
                              <Button
                                key={slot.time}
                                variant={slot.available ? 'outline' : 'destructive'}
                                className={`h-14 ${slot.available ? 'hover:bg-health-aqua hover:text-white border-health-aqua' : 'cursor-not-allowed bg-red-50 border-red-200 text-red-700'}`}
                                disabled={!slot.available}
                                onClick={() => slot.available && setSelectedTime(slot.time)}
                              >
                                <div className="text-center">
                                  <div className="font-medium">{slot.time}</div>
                                  {!slot.available && slot.bookedBy && (
                                    <div className="text-[10px] mt-1">
                                      <div className="text-red-600 font-medium">Booked</div>
                                      <div className="text-red-500">by {slot.bookedBy}</div>
                                    </div>
                                  )}
                                  {slot.available && (
                                    <div className="text-[10px] mt-1 text-green-600 font-medium">Available</div>
                                  )}
                                </div>
                              </Button>
                            ))}
                          </div>
                        </div>
                      )
                    );

                    return (
                      <>
                        {Section('Morning')}
                        {Section('Afternoon')}
                        {Section('Evening')}
                      </>
                    );
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Patient Selection & Appointment Details */}
        <div className="space-y-6 lg:sticky lg:top-24">
          {/* Scheduling Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-health-aqua" />
                <span>Scheduling Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-xs uppercase text-health-blue-gray">Total Slots</div>
                  <div className="text-xl font-semibold">{timeSlots.length}</div>
                </div>
                <div>
                  <div className="text-xs uppercase text-health-blue-gray">Available</div>
                  <div className="text-xl font-semibold text-green-600">{timeSlots.filter(s => s.available).length}</div>
                </div>
                <div>
                  <div className="text-xs uppercase text-health-blue-gray">Booked</div>
                  <div className="text-xl font-semibold text-health-warning">{timeSlots.filter(s => !s.available).length}</div>
                </div>
                <div>
                  <div className="text-xs uppercase text-health-blue-gray">Utilization</div>
                  <div className="text-xl font-semibold">{timeSlots.length ? Math.round((timeSlots.filter(s => !s.available).length / timeSlots.length) * 100) : 0}%</div>
                </div>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded">
                <div
                  className="h-2 bg-health-aqua rounded"
                  style={{ width: `${timeSlots.length ? Math.round((timeSlots.filter(s => !s.available).length / timeSlots.length) * 100) : 0}%` }}
                />
              </div>
            </CardContent>
          </Card>
          {/* Patient Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5 text-health-aqua" />
                <span>Select Patient</span>
                {loadingPatients && <Loader2 className="w-4 h-4 animate-spin" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              {loadingPatients ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-health-aqua" />
                  <span className="ml-2 text-health-blue-gray">Loading patients...</span>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50 ${
                        selectedPatient === patient.id ? 'border-health-aqua bg-health-aqua/10' : 'border-gray-200'
                      }`}
                      onClick={() => setSelectedPatient(patient.id)}
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={patient.avatar} />
                        <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-health-charcoal">{patient.name}</p>
                        <p className="text-sm text-health-blue-gray">{patient.age} years • {patient.gender}</p>
                      </div>
                      {selectedPatient === patient.id && (
                        <Check className="w-4 h-4 text-health-aqua" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Existing Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ClockIcon className="w-5 h-5 text-health-aqua" />
                <span>Today's Appointments</span>
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-health-aqua" />
                  <span className="ml-2 text-health-blue-gray">Loading appointments...</span>
                </div>
              ) : existingAppointments.length === 0 ? (
                <div className="text-center py-8 text-health-blue-gray">
                  No appointments scheduled for this date
                </div>
              ) : (
                <div className="space-y-3">
                  {existingAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className="flex-shrink-0">
                        {getAppointmentTypeIcon(appointment.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-health-charcoal truncate">{appointment.patientName}</p>
                        <p className="text-sm text-health-blue-gray">{appointment.time} - {appointment.endTime}</p>
                        <p className="text-xs text-health-blue-gray capitalize">{appointment.type} • {appointment.consultationType}</p>
                      </div>
                      <div className="flex-shrink-0">
                        {getStatusBadge(appointment.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Schedule Appointment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule New Appointment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-health-charcoal">Patient</label>
              <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a patient" />
                </SelectTrigger>
                <SelectContent>
                  {filteredPatients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-health-charcoal">Date</label>
              <div className="p-2 bg-gray-100 rounded border">
                {selectedDate.toLocaleDateString()}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-health-charcoal">Time</label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a time slot" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.filter(slot => slot.available).map((slot) => (
                    <SelectItem key={slot.time} value={slot.time}>
                      {slot.time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-health-charcoal">Appointment Type</label>
              <Select value={appointmentType} onValueChange={setAppointmentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select appointment type" />
                </SelectTrigger>
                <SelectContent>
                  {appointmentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-health-charcoal">Notes</label>
              <Textarea
                placeholder="Add appointment notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleScheduleAppointment}
                disabled={loading || !selectedPatient || !selectedTime || !appointmentType}
                className="flex-1"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Schedule Appointment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorScheduleAppointment; 