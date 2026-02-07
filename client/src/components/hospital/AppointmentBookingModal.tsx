import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Calendar as CalendarIcon, Clock, User, Stethoscope, 
  Phone, Mail, MapPin, CheckCircle, X, AlertCircle,
  Video, Monitor, Building, Users, Star
} from 'lucide-react';
import { format } from 'date-fns';
import { Hospital } from '@/services/hospitalServicesService';
import { toast } from 'sonner';
import hospitalServicesService from '@/services/hospitalServicesService';

interface AppointmentBookingModalProps {
  hospital: Hospital;
  onClose: () => void;
  onSuccess: () => void;
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  rating: number;
  yearsOfExperience: number;
  profileImage?: string;
  realTimeData: {
    isOnline: boolean;
    todayAppointments: number;
    availableSlots: number;
    availabilityPercentage: number;
    nextAvailableSlot: string;
  };
}

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  type: 'online' | 'in-person';
}

const AppointmentBookingModal: React.FC<AppointmentBookingModalProps> = ({
  hospital,
  onClose,
  onSuccess
}) => {
  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [consultationType, setConsultationType] = useState<'online' | 'in-person'>('in-person');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      fetchTimeSlots();
    }
  }, [selectedDoctor, selectedDate]);

  const fetchDoctors = async () => {
    setLoadingDoctors(true);
    try {
      const response = await hospitalServicesService.findDoctors({
        hospitalId: hospital.id,
        limit: 20
      });
      setDoctors(response.doctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error('Failed to load doctors');
    } finally {
      setLoadingDoctors(false);
    }
  };

  const fetchTimeSlots = async () => {
    if (!selectedDoctor || !selectedDate) return;
    
    setLoadingSlots(true);
    try {
      // Generate mock time slots for demonstration
      const slots: TimeSlot[] = [];
      const startHour = 9;
      const endHour = 17;
      
      for (let hour = startHour; hour < endHour; hour++) {
        const startTime = new Date(selectedDate);
        startTime.setHours(hour, 0, 0, 0);
        
        const endTime = new Date(selectedDate);
        endTime.setHours(hour + 1, 0, 0, 0);
        
        slots.push({
          id: `slot-${hour}`,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          isAvailable: Math.random() > 0.3, // 70% availability
          type: consultationType
        });
      }
      
      setTimeSlots(slots);
    } catch (error) {
      console.error('Error fetching time slots:', error);
      toast.error('Failed to load time slots');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setStep(2);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setStep(3);
  };

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedDate || !selectedSlot) {
      toast.error('Please complete all selections');
      return;
    }

    setLoading(true);
    try {
      const appointmentData = {
        hospitalId: hospital.id,
        doctorId: selectedDoctor.id,
        scheduledDate: selectedDate.toISOString(),
        type: consultationType,
        notes: notes.trim() || undefined
      };

      await hospitalServicesService.bookHospitalAppointment(appointmentData);
      onSuccess();
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error('Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'h:mm a');
  };

  const formatDate = (date: Date) => {
    return format(date, 'EEEE, MMMM d, yyyy');
  };

  const getAvailabilityColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-health-teal" />
              <span>Book Appointment</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber 
                    ? 'bg-health-teal text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-12 h-0.5 mx-2 ${
                    step > stepNumber ? 'bg-health-teal' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Select Doctor */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Select a Doctor</h3>
              <p className="text-gray-600 mb-6">Choose from our team of specialist doctors at {hospital.name}</p>
            </div>

            {loadingDoctors ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-health-teal mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading doctors...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {doctors.map((doctor) => (
                  <Card 
                    key={doctor.id} 
                    className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-health-teal"
                    onClick={() => handleDoctorSelect(doctor)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 bg-health-teal/10 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-health-teal" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{doctor.name}</h4>
                          <p className="text-gray-600 text-sm mb-2">{doctor.specialization}</p>
                          <div className="flex items-center space-x-2 mb-2">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-medium">{doctor.rating}</span>
                            <span className="text-sm text-gray-500">({doctor.yearsOfExperience} years exp.)</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant={doctor.realTimeData.isOnline ? 'default' : 'secondary'}
                              className={doctor.realTimeData.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                            >
                              {doctor.realTimeData.isOnline ? 'Online' : 'Offline'}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {doctor.realTimeData.availableSlots} slots available
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Select Date and Time */}
        {step === 2 && selectedDoctor && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Select Date & Time</h3>
                <p className="text-gray-600">Choose your preferred appointment time</p>
              </div>
              <Button variant="outline" onClick={() => setStep(1)}>
                <X className="h-4 w-4 mr-2" />
                Change Doctor
              </Button>
            </div>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-health-teal/10 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-health-teal" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{selectedDoctor.name}</h4>
                    <p className="text-sm text-gray-600">{selectedDoctor.specialization}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Date Selection */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Select Date</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={(date) => date < new Date() || date.getDay() === 0} // Disable past dates and Sundays
                  className="rounded-md border"
                />
              </div>

              {/* Time Slots */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Select Time</Label>
                <div className="space-y-2">
                  {selectedDate ? (
                    loadingSlots ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-health-teal mx-auto"></div>
                        <p className="mt-2 text-sm text-gray-600">Loading time slots...</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {timeSlots.map((slot) => (
                          <Button
                            key={slot.id}
                            variant={slot.isAvailable ? 'outline' : 'ghost'}
                            disabled={!slot.isAvailable}
                            onClick={() => slot.isAvailable && handleSlotSelect(slot)}
                            className={`h-12 ${
                              slot.isAvailable 
                                ? 'hover:border-health-teal hover:text-health-teal' 
                                : 'text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            {formatTime(slot.startTime)}
                          </Button>
                        ))}
                      </div>
                    )
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <CalendarIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>Please select a date first</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && selectedDoctor && selectedDate && selectedSlot && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">Confirm Appointment</h3>
              <p className="text-gray-600">Review your appointment details</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Appointment Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Appointment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-health-teal/10 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-health-teal" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{selectedDoctor.name}</h4>
                      <p className="text-sm text-gray-600">{selectedDoctor.specialization}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{formatDate(selectedDate)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {consultationType === 'online' ? (
                        <Video className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Building className="h-4 w-4 text-gray-500" />
                      )}
                      <span className="text-sm capitalize">{consultationType} Consultation</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Hospital Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Hospital Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-health-teal" />
                    <span className="font-medium">{hospital.name}</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-health-teal mt-0.5" />
                    <span className="text-sm text-gray-600">{hospital.address}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-health-teal" />
                    <span className="text-sm">{hospital.phone}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Consultation Type Selection */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Consultation Type</Label>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant={consultationType === 'in-person' ? 'default' : 'outline'}
                  onClick={() => setConsultationType('in-person')}
                  className="h-16 flex-col space-y-1"
                >
                  <Building className="h-5 w-5" />
                  <span className="text-sm">In-Person</span>
                </Button>
                <Button
                  variant={consultationType === 'online' ? 'default' : 'outline'}
                  onClick={() => setConsultationType('online')}
                  className="h-16 flex-col space-y-1"
                >
                  <Video className="h-5 w-5" />
                  <span className="text-sm">Video Call</span>
                </Button>
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes" className="text-sm font-medium mb-2 block">
                Additional Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Any specific symptoms, concerns, or information you'd like to share..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                Back
              </Button>
              <Button 
                onClick={handleBookAppointment}
                disabled={loading}
                className="flex-1 bg-health-teal hover:bg-health-aqua"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Booking...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm Booking
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentBookingModal; 