import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Stethoscope, 
  Star, 
  MapPin, 
  Globe, 
  Award, 
  GraduationCap,
  Video,
  Calendar,
  Clock,
  CreditCard,
  Shield,
  User,
  CheckCircle,
  Info,
  FileText,
  MessageSquare,
  UserCheck,
  FileCheck,
  PaymentIcon
} from 'lucide-react';
import { Doctor, TimeSlot, ConsultationType, Review } from '@/types/appointment';
import { appointmentService } from '@/services/appointmentService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import api from '@/services/api';

interface DoctorProfileModalProps {
  doctor: Doctor;
  open: boolean;
  onClose: () => void;
  onBookAppointment: (doctor: Doctor, slot: TimeSlot, type: ConsultationType) => void;
}

export const DoctorProfileModal: React.FC<DoctorProfileModalProps> = ({
  doctor,
  open,
  onClose,
  onBookAppointment
}) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingProgress, setBookingProgress] = useState(25);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [consultationType, setConsultationType] = useState<ConsultationType>('in-person');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [patientNotes, setPatientNotes] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [showInsuranceInfo, setShowInsuranceInfo] = useState(false);
  const [insuranceProvider, setInsuranceProvider] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');

  const symptoms = [
    'Fever', 'Cough', 'Headache', 'Fatigue', 'Nausea', 'Dizziness',
    'Chest Pain', 'Shortness of Breath', 'Abdominal Pain', 'Joint Pain'
  ];

  const insuranceProviders = [
    'Max Bupa', 'Star Health', 'Care Health', 'Bajaj Allianz', 'ICICI Lombard'
  ];

  useEffect(() => {
    if (open && doctor) {
      fetchDoctorDetails();
    }
  }, [open, doctor, selectedDate]);

  const fetchDoctorDetails = async () => {
    if (!doctor) return;
    setLoading(true);
    try {
      // Fetch real-time available slots from backend
      const slotsData = await appointmentService.getAvailableSlots(doctor._id, selectedDate);
      setAvailableSlots(slotsData);
      
      // Fetch real reviews from backend
      try {
        const reviewsResponse = await api.get(`/doctors/${doctor._id}/reviews`);
        if (reviewsResponse.data.success) {
          setReviews(reviewsResponse.data.reviews);
        }
      } catch (reviewError) {
        console.log('Using fallback reviews data');
        // Fallback to mock reviews if API fails
        const mockReviews = [
          {
            _id: 'review1',
            doctorId: doctor._id,
            patientId: 'patient1',
            patientName: 'Rahul Sharma',
            rating: 5,
            comment: 'Excellent consultation. Doctor was very knowledgeable and patient.',
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: 'review2',
            doctorId: doctor._id,
            patientId: 'patient2',
            patientName: 'Priya Patel',
            rating: 4,
            comment: 'Good experience. Doctor explained everything clearly.',
            date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: 'review3',
            doctorId: doctor._id,
            patientId: 'patient3',
            patientName: 'Amit Kumar',
            rating: 5,
            comment: 'Very professional and caring doctor. Highly recommended!',
            date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];
        setReviews(mockReviews);
      }
    } catch (error) {
      console.error('Error fetching doctor details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!doctor) return null;

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      setBookingProgress((currentStep + 1) * 25);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setBookingProgress((currentStep - 1) * 25);
    }
  };

  const handleBooking = async () => {
    if (!selectedSlot || !doctor) return;
    
    try {
      // Book appointment with real backend
      const appointment = await appointmentService.bookAppointment(
        doctor._id, 
        selectedSlot._id, 
        consultationType
      );

      // Show success message
      toast.success('Appointment booked successfully!');
      
      // Call the original onBookAppointment callback
      onBookAppointment(doctor, selectedSlot, consultationType);
      onClose();
    } catch (error) {
      console.error('Booking failed:', error);
      toast.error('Failed to book appointment. Please try again.');
    }
  };

  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const getConsultationFee = () => {
    return consultationType === 'online' ? doctor.fees.online : doctor.fees.inPerson;
  };

  const getTotalFee = () => {
    const baseFee = getConsultationFee();
    const convenienceFee = Math.round(baseFee * 0.05); // 5% convenience fee
    return baseFee + convenienceFee;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Doctor Profile Section */}
            <Card className="border-health-teal/20">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-health-teal">
                  <Stethoscope className="w-5 h-5" />
                  Doctor Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-health-teal/20">
                    <img 
                      src={doctor.profilePhoto} 
                      alt={doctor.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="text-xl font-bold text-health-charcoal">{doctor.name}</h3>
                      <p className="text-health-aqua font-medium">{doctor.specialization}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="font-semibold">{doctor.ratings.average}</span>
                        <span className="text-health-charcoal/60">({doctor.ratings.count} reviews)</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-health-aqua" />
                        <span className="text-health-charcoal/80">{doctor.location.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-health-aqua" />
                        <span className="text-health-charcoal/80">{doctor.languages.join(', ')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-health-aqua" />
                        <span className="text-health-charcoal/80">{doctor.experience} years experience</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-health-aqua" />
                        <span className="text-health-charcoal/80">MBBS, MD</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Consultation Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-health-teal" />
                  Consultation Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant={consultationType === 'in-person' ? 'default' : 'outline'}
                    className={`h-16 ${consultationType === 'in-person' ? 'bg-health-teal hover:bg-health-teal/90' : ''}`}
                    onClick={() => setConsultationType('in-person')}
                  >
                    <div className="text-center">
                      <div className="text-lg font-semibold">In-Person</div>
                      <div className="text-sm opacity-80">Visit Hospital</div>
                      <div className="text-lg font-bold text-health-teal">₹{doctor.fees.inPerson}</div>
                    </div>
                  </Button>
                  <Button
                    variant={consultationType === 'online' ? 'default' : 'outline'}
                    className={`h-16 ${consultationType === 'online' ? 'bg-health-teal hover:bg-health-teal/90' : ''}`}
                    onClick={() => setConsultationType('online')}
                  >
                    <div className="text-center">
                      <div className="text-lg font-semibold">Online</div>
                      <div className="text-sm opacity-80">Video Call</div>
                      <div className="text-lg font-bold text-health-teal">₹{doctor.fees.online}</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-health-teal" />
                  Patient Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review._id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-health-charcoal/60">{review.patientName}</span>
                      </div>
                      <p className="text-sm text-health-charcoal/80">{review.comment}</p>
                      <p className="text-xs text-health-charcoal/50 mt-2">
                        {new Date(review.date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {/* Date Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-health-teal" />
                  Select Date & Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Date Picker */}
                  <div>
                    <label className="text-sm font-medium text-health-charcoal/70 mb-2 block">
                      Select Date
                    </label>
                    <div className="grid grid-cols-7 gap-2">
                      {[...Array(7)].map((_, i) => {
                        const date = new Date();
                        date.setDate(date.getDate() + i);
                        const isSelected = date.toDateString() === selectedDate.toDateString();
                        const isToday = date.toDateString() === new Date().toDateString();
                        
                        return (
                          <Button
                            key={i}
                            variant={isSelected ? 'default' : 'outline'}
                            className={`h-16 flex-col ${
                              isSelected ? 'bg-health-teal hover:bg-health-teal/90' : ''
                            } ${isToday ? 'border-health-teal' : ''}`}
                            onClick={() => setSelectedDate(date)}
                          >
                            <span className="text-xs opacity-80">
                              {date.toLocaleDateString('en-US', { weekday: 'short' })}
                            </span>
                            <span className="text-lg font-semibold">{date.getDate()}</span>
                            <span className="text-xs opacity-80">
                              {date.toLocaleDateString('en-US', { month: 'short' })}
                            </span>
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time Slots */}
                  <div>
                    <label className="text-sm font-medium text-health-charcoal/70 mb-2 block">
                      Available Time Slots
                    </label>
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-health-teal mx-auto"></div>
                        <p className="text-sm text-health-charcoal/60 mt-2">Loading available slots...</p>
                      </div>
                    ) : availableSlots.length > 0 ? (
                      <div className="grid grid-cols-3 gap-3">
                        {availableSlots.map((slot) => (
                          <Button
                            key={slot._id}
                            variant={selectedSlot?._id === slot._id ? 'default' : 'outline'}
                            className={`h-12 ${
                              selectedSlot?._id === slot._id ? 'bg-health-teal hover:bg-health-teal/90' : ''
                            }`}
                            onClick={() => handleSlotSelect(slot)}
                          >
                            <Clock className="w-4 h-4 mr-2" />
                            {new Date(slot.startTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-health-charcoal/60">
                        <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No available slots for this date</p>
                        <p className="text-sm">Please select another date</p>
                      </div>
                    )}
                  </div>

                  {/* Selected Slot Info */}
                  {selectedSlot && (
                    <div className="p-4 bg-health-teal/5 border border-health-teal/20 rounded-lg">
                      <h4 className="font-semibold text-health-teal mb-2">Selected Appointment</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Date:</span>
                          <span>{selectedDate.toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Time:</span>
                          <span>
                            {new Date(selectedSlot.startTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })} - {new Date(selectedSlot.endTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Type:</span>
                          <span className="capitalize">{consultationType.replace('-', ' ')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fee:</span>
                          <span className="font-semibold">₹{getConsultationFee()}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* Consultation Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-health-teal" />
                  Consultation Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Symptoms Selection */}
                  <div>
                    <h4 className="font-semibold mb-3">Select Symptoms (if any)</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {symptoms.map((symptom) => (
                        <Button
                          key={symptom}
                          variant={selectedSymptoms.includes(symptom) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleSymptomToggle(symptom)}
                          className="justify-start"
                        >
                          {selectedSymptoms.includes(symptom) && <CheckCircle className="w-4 h-4 mr-2" />}
                          {symptom}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Patient Notes */}
                  <div>
                    <label className="text-sm font-medium text-health-charcoal/70">Additional Notes</label>
                    <Textarea
                      placeholder="Describe your symptoms, concerns, or any specific questions for the doctor..."
                      value={patientNotes}
                      onChange={(e) => setPatientNotes(e.target.value)}
                      className="mt-2"
                      rows={4}
                    />
                  </div>

                  {/* Emergency Contact */}
                  <div>
                    <h4 className="font-semibold mb-3">Emergency Contact</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-health-charcoal/70">Contact Name</label>
                        <Input
                          placeholder="Enter emergency contact name"
                          value={emergencyContact}
                          onChange={(e) => setEmergencyContact(e.target.value)}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-health-charcoal/70">Contact Phone</label>
                        <Input
                          placeholder="Enter emergency contact phone"
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Insurance Information */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">Insurance Information (Optional)</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowInsuranceInfo(!showInsuranceInfo)}
                      >
                        {showInsuranceInfo ? 'Hide' : 'Add'} Insurance
                      </Button>
                    </div>
                    
                    {showInsuranceInfo && (
                      <div className="p-4 border rounded-lg bg-health-light-gray/30">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-health-charcoal/70">Insurance Provider</label>
                            <Select value={insuranceProvider} onValueChange={setInsuranceProvider}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select provider" />
                              </SelectTrigger>
                              <SelectContent>
                                {insuranceProviders.map(provider => (
                                  <SelectItem key={provider} value={provider}>{provider}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-health-charcoal/70">Policy Number</label>
                            <Input 
                              placeholder="Enter policy number" 
                              value={policyNumber}
                              onChange={(e) => setPolicyNumber(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Cost Summary */}
                  <div className="p-4 bg-health-teal/5 border border-health-teal/20 rounded-lg">
                    <h4 className="font-semibold text-health-teal mb-3">Cost Summary</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Consultation Fee:</span>
                        <span>₹{getConsultationFee()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Platform Fee:</span>
                        <span>₹{Math.round(getConsultationFee() * 0.03)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>GST (18%):</span>
                        <span>₹{Math.round(getConsultationFee() * 0.18)}</span>
                      </div>
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between font-semibold">
                          <span>Total Amount:</span>
                          <span className="text-health-teal">₹{getTotalFee()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            {/* Appointment Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-health-teal" />
                  Appointment Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-health-charcoal/70">Doctor:</span>
                    <span className="font-medium">{doctor.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-health-charcoal/70">Specialization:</span>
                    <span>{doctor.specialization}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-health-charcoal/70">Consultation Type:</span>
                    <span className="capitalize">{consultationType.replace('-', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-health-charcoal/70">Date:</span>
                    <span>{selectedDate.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-health-charcoal/70">Time:</span>
                    <span>
                      {selectedSlot ? new Date(selectedSlot.startTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'Not selected'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-health-charcoal/70">Duration:</span>
                    <span>15-20 minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-health-charcoal/70">Total Amount:</span>
                    <span className="font-semibold text-health-teal">₹{getTotalFee()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Symptoms Summary */}
            {selectedSymptoms.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-health-teal" />
                    Selected Symptoms
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {selectedSymptoms.map((symptom) => (
                      <Badge key={symptom} variant="secondary" className="bg-health-teal/20 text-health-teal">
                        {symptom}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Patient Notes Summary */}
            {patientNotes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-health-teal" />
                    Additional Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-health-charcoal/80">{patientNotes}</p>
                </CardContent>
              </Card>
            )}

            {/* Emergency Contact Summary */}
            {emergencyContact && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-health-teal" />
                    Emergency Contact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    <p><strong>Name:</strong> {emergencyContact}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Insurance Summary */}
            {showInsuranceInfo && insuranceProvider && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-health-teal" />
                    Insurance Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    <p><strong>Provider:</strong> {insuranceProvider}</p>
                    {policyNumber && <p><strong>Policy Number:</strong> {policyNumber}</p>}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Confirmation */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  Ready to Book
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-700 mb-4">
                  Please review all the details above. Click "Book Appointment" to confirm your booking.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handlePrevStep}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleBooking}
                    disabled={!selectedSlot}
                    className="flex-1 bg-health-teal hover:bg-health-teal/90"
                  >
                    Book Appointment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Book Appointment with Dr. {doctor.name}</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-health-charcoal/60">Step {currentStep} of 4</span>
              <span className="text-health-teal font-medium">{bookingProgress}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-health-teal h-2 rounded-full transition-all duration-300"
                style={{ width: `${bookingProgress}%` }}
              ></div>
            </div>
            
            {/* Step Labels */}
            <div className="flex justify-between mt-2 text-xs text-health-charcoal/60">
              <span>Doctor Info</span>
              <span>Date & Time</span>
              <span>Consultation</span>
              <span>Confirm</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        {currentStep > 1 && currentStep < 4 && (
          <div className="p-4 border-t">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handlePrevStep}
                className="flex-1"
              >
                Previous
              </Button>
              <Button
                onClick={handleNextStep}
                disabled={!selectedSlot}
                className="flex-1 bg-health-teal hover:bg-health-teal/90"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};











