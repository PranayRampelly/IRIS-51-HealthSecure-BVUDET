import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CalendarIcon, Clock, User, Stethoscope, 
  Phone, Mail, MapPin, CheckCircle,
  Video, Building, Star, Globe, Award, GraduationCap,
  Brain, CreditCard, IndianRupee, Bell,
  ArrowLeft, ArrowRight, Loader2, AlertTriangle, FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { appointmentService, fetchDoctorAvailability } from '@/services/appointmentService';
import { paymentService, PaymentData } from '@/services/paymentService';
import { toast } from 'sonner';
import api from '@/lib/api';
// import { PaymentSuccessDialog } from './PaymentSuccessDialog';
import { DetailedReceipt } from './DetailedReceipt';
import { VideoConsultationReceipt } from './VideoConsultationReceipt';

interface DoctorLite {
  _id: string;
  name: string;
  profilePhoto: string;
  specialization: string;
  ratings: { average: number; count: number };
  location: { address: string };
  fees: { online: number; inPerson: number };
  experience: number;
  languages: string[];
  consultationFees?: { online: number; inPerson: number }; // Added for fallback
}

interface RealTimeUpdate {
  type: string;
  data: unknown;
  timestamp: Date;
}

type BookingEventDetail = {
  doctorId?: string;
  patientId?: string;
  appointmentId?: string;
  [key: string]: unknown;
};

interface DoctorProfileModalProps {
  doctor: DoctorLite | null;
  open: boolean;
  onClose: () => void;
  onBookAppointment: (doctor: DoctorLite, slot: TimeSlot | null, type: ConsultationType) => void;
}

interface TimeSlot {
  _id: string;
  doctorId: string; // Required to match the main types
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  isBooked: boolean;
  consultationType: 'online' | 'in-person';
}

interface Review {
  id: string;
  patientName: string;
  rating: number;
  comment: string;
  date: string;
}

type ConsultationType = 'online' | 'in-person';

export const DoctorProfileModal: React.FC<DoctorProfileModalProps> = ({
  doctor,
  open,
  onClose,
  onBookAppointment
}) => {
  // Configurable constants (only convenience fee rate is hardcoded as requested)
  const CONVENIENCE_FEE_RATE = 0.05; // 5% - can be made configurable per doctor/hospital
  
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Debug logging for date selection
  useEffect(() => {
    console.log('🔍 selectedDate changed:', selectedDate, 'to:', selectedDate?.toDateString());
  }, [selectedDate]);

  // Component re-render debugging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 DoctorProfileModal re-rendered, selectedDate:', selectedDate?.toDateString());
    }
  });

  // Handle date selection with proper logging
  const handleDateSelection = (date: Date | undefined) => {
    if (date) {
      console.log('🔍 Date selected by user:', date.toDateString());
      setSelectedDate(date);
    }
  };
  const [consultationType, setConsultationType] = useState<ConsultationType>('online');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingProgress, setBookingProgress] = useState(20);
  const [patientNotes, setPatientNotes] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [preferredLanguage, setPreferredLanguage] = useState('english');
  const [policyNumber, setPolicyNumber] = useState('');
  const [groupNumber, setGroupNumber] = useState('');
  const [memberId, setMemberId] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const [appointmentData, setAppointmentData] = useState<any>(null);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [slotLocked, setSlotLocked] = useState(false);
  const [realTimeUpdates, setRealTimeUpdates] = useState<RealTimeUpdate[]>([]);
  // const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [successAppointmentData, setSuccessAppointmentData] = useState<any>(null);
  const [successPaymentData, setSuccessPaymentData] = useState<any>(null);
  const [showDetailedReceipt, setShowDetailedReceipt] = useState(false);

  const socketRef = useRef<null | unknown>(null);

  const setupRealTimeConnection = useCallback(async () => {
    try {
      if (doctor?._id) {
        await appointmentService.joinDoctorCalendar(doctor._id);
      }
      if (appointmentId) {
        appointmentService.subscribeToAppointment(appointmentId, (event, data) => {
          setRealTimeUpdates(prev => [...prev, { type: event, data, timestamp: new Date() }]);
        });
      }
    } catch (error) {
      console.error('Failed to setup real-time connection:', error);
    }
  }, [doctor?._id, appointmentId]);

  const fetchTimeSlots = useCallback(async () => {
    try {
      if (!doctor?._id) return;
      
      setLoading(true);
      console.log('🔍 Fetching real availability slots for doctor:', doctor._id, 'on date:', selectedDate);
      
      // Fetch real availability data for the specific doctor and date
      const availabilityData = await fetchDoctorAvailability(doctor._id, selectedDate.toISOString().split('T')[0]);
      
      if (availabilityData && availabilityData.slots) {
        // Transform the real availability data to match our interface
        const realTimeSlots = availabilityData.slots.map((slot: any) => ({
          _id: slot._id,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isAvailable: slot.isAvailable,
          isBooked: slot.isBooked,
          consultationType: slot.consultationType === 'both' ? 'online' : slot.consultationType, // Map 'both' to 'online' for now
          date: slot.date,
          realTimeStatus: slot.realTimeStatus
        }));
        
        console.log('✅ Real availability slots loaded:', realTimeSlots);
        setAvailableSlots(realTimeSlots);
        
        // Note: Doctor availability data is already available in the component
      } else {
        console.log('⚠️ No availability data found for this date');
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error('❌ Error fetching real availability slots:', error);
      setAvailableSlots([]);
      toast.error('Failed to fetch available time slots. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [doctor?._id, selectedDate]);

  // Use real availability data when component mounts or doctor/date changes
  useEffect(() => {
    if (doctor?._id && selectedDate) {
      fetchTimeSlots();
      // Clear selected slot when date changes to prevent date mismatch
      setSelectedSlot(null);
      setSlotLocked(false);
    }
  }, [doctor?._id, selectedDate, fetchTimeSlots]);

  const handleNextStep = useCallback(async () => {
    if (currentStep === 2 && !selectedSlot) {
      toast.error('Please select a time slot first');
      return;
    }
    if (currentStep === 3 && !agreedToTerms) {
      toast.error('Please accept the terms and conditions');
      return;
    }
    if (currentStep < 5) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      setBookingProgress(newStep * 20);
      if (appointmentId && appointmentId.startsWith('temp-') === false) {
        try {
          await appointmentService.updateAppointmentProgress(appointmentId, newStep, newStep * 25);
        } catch (e) {
          console.error('Progress update failed', e);
        }
      }
    }
  }, [currentStep, selectedSlot, agreedToTerms, appointmentId]);

  const handlePreviousStep = useCallback(() => {
    if (currentStep > 1) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      setBookingProgress(newStep * 20);
    }
  }, [currentStep]);

  useEffect(() => {
    if (open) {
      fetchDoctorDetails();
      setupRealTimeConnection();
    }

    // Event handlers for real-time updates
    const handleSlotLocked = (event: Event) => {
      const data = (event as CustomEvent<BookingEventDetail>).detail;
      if (data?.doctorId === doctor?._id) {
        setRealTimeUpdates(prev => [...prev, { type: 'slot-locked', data, timestamp: new Date() }]);
      }
    };

    const handleSlotUnlocked = (event: Event) => {
      const data = (event as CustomEvent<BookingEventDetail>).detail;
      if (data?.doctorId === doctor?._id) {
        setRealTimeUpdates(prev => [...prev, { type: 'slot-unlocked', data, timestamp: new Date() }]);
        if (data?.slotId === selectedSlot?._id) {
          setSlotLocked(false);
          setSelectedSlot(null);
          toast.info('Selected time slot was unlocked by another user. Please select a different slot.');
        }
      }
    };

    const handlePaymentInitiated = (event: Event) => {
      const data = (event as CustomEvent<BookingEventDetail>).detail;
      if (data?.doctorId === doctor?._id) {
        setRealTimeUpdates(prev => [...prev, { type: 'payment-initiated', data, timestamp: new Date() }]);
      }
    };

    const handlePaymentVerified = (event: Event) => {
      const data = (event as CustomEvent<BookingEventDetail>).detail;
      if (data?.doctorId === doctor?._id) {
        setRealTimeUpdates(prev => [...prev, { type: 'payment-verified', data, timestamp: new Date() }]);
        if (data?.appointmentId === appointmentId) {
          handleNextStep();
        }
      }
    };

    const handleAppointmentConfirmed = (event: Event) => {
      const data = (event as CustomEvent<BookingEventDetail>).detail;
      if (data?.appointmentId === appointmentId) {
        setRealTimeUpdates(prev => [...prev, { type: 'appointment-confirmed', data, timestamp: new Date() }]);
        onClose();
      }
    };

    window.addEventListener('slot-locked', handleSlotLocked);
    window.addEventListener('slot-unlocked', handleSlotUnlocked);
    window.addEventListener('payment-initiated', handlePaymentInitiated);
    window.addEventListener('payment-verified', handlePaymentVerified);
    window.addEventListener('appointment-confirmed', handleAppointmentConfirmed);

    return () => {
      window.removeEventListener('slot-locked', handleSlotLocked);
      window.removeEventListener('slot-unlocked', handleSlotUnlocked);
      window.removeEventListener('payment-initiated', handlePaymentInitiated);
      window.removeEventListener('payment-verified', handlePaymentVerified);
      window.removeEventListener('appointment-confirmed', handleAppointmentConfirmed);
    };
  }, [doctor?._id, appointmentId, user?._id, handleNextStep, onClose]);

  const fetchDoctorDetails = async () => { setLoading(true); try { await new Promise(r => setTimeout(r, 500)); } finally { setLoading(false); } };

  const handleSlotSelection = async (slot: TimeSlot) => {
    try {
      if (!doctor?._id) return;
      const locked = await appointmentService.lockSlot(doctor._id, selectedDate, new Date(slot.startTime).toTimeString().split(' ')[0], (user as { _id?: string } | null)?._id || 'anonymous');
      if (locked) {
        setSelectedSlot(slot);
        // Don't override consultation type with slot value if it's invalid
        // Keep the current consultation type that user selected
        setSlotLocked(true);
        toast.success('Time slot locked successfully!');
      }
    } catch (error) { toast.error('Failed to lock time slot. Please try again.'); }
  };

  const handleConfirmBooking = async () => {
    if (!agreedToTerms) {
      toast.error('Please accept the terms and conditions to proceed.');
      return;
    }
    if (!selectedSlot || !doctor?._id) {
      toast.error('Please select a time slot first.');
      return;
    }

    try {
      setLoading(true);
      console.log('🔍 Preparing appointment data for payment confirmation');

      // Prepare appointment data locally (NOT saved to database yet)
      const appointmentData = {
        doctorId: doctor._id,
        scheduledDate: selectedDate,
        scheduledTime: selectedSlot.startTime,
        consultationType,
        paymentMethod: 'online',
        symptoms: selectedSymptoms,
        notes: patientNotes,
        emergencyContact: emergencyContact,
        selectedSlot,
        slotStartTime: new Date(selectedSlot.startTime),
        // estimatedDuration will be determined by doctor's availability settings
        appointmentType: 'consultation',
        department: doctor?.specialization || 'General',
        followUpRequired: false,
        followUpDate: null,
        cost: {
          consultationFee: getDisplayConsultationFee(),
          convenienceFee: getConvenienceFee(),
          additionalCharges: 0,
          totalAmount: getTotalFee()
        }
      };

      // Store appointment data locally (NOT in database)
      setAppointmentData(appointmentData);

      // Create payment order for Razorpay (this will create the appointment in database)
      try {
        console.log('🔍 Creating payment order for appointment');
        // Clear any stale payment data to prevent mismatched amounts
        setPaymentData(null);
        // For in-person consultations, pass the FULL consultation fee amount
        // The backend will calculate the convenience fee (configurable rate) from this
        // For online consultations, pass the consultation fee amount (₹2500)
        let amountToPass: number;
        if (consultationType === 'in-person') {
          amountToPass = getDisplayConsultationFee(); // Full consultation fee
          console.log(`🔍 In-person consultation: Passing FULL consultation fee ₹${amountToPass} to backend (backend will calculate ${(CONVENIENCE_FEE_RATE * 100).toFixed(0)}% convenience fee)`);
        } else {
          amountToPass = getConsultationFee(); // Full consultation fee for online
          console.log(`🔍 Online consultation: Passing consultation fee ₹${amountToPass} to backend`);
        }
        
        console.log('🔍 Stepper calculated amounts:', {
          consultationType,
          totalAmount: getTotalFee(),
          convenienceFee: getConvenienceFee(),
          consultationFee: getDisplayConsultationFee(),
          displayConsultationFee: getDisplayConsultationFee(),
          paymentConsultationFee: getConsultationFee(),
          amountToPass: amountToPass
        });
        
        console.log(`🔍 Final amount being sent to backend: ₹${amountToPass}`);
        
        // Validate the amount before sending to backend
        if (consultationType === 'in-person' && amountToPass !== getDisplayConsultationFee()) {
          console.error(`❌ Amount validation failed: Expected full consultation fee ₹${getDisplayConsultationFee()}, but got ₹${amountToPass}`);
          toast.error('Fee calculation error. Please try again.');
          return;
        }
        
        if (consultationType === 'online' && amountToPass !== getDisplayConsultationFee()) {
          console.error(`❌ Amount validation failed: Expected consultation fee ₹${getDisplayConsultationFee()}, but got ₹${amountToPass}`);
          toast.error('Fee calculation error. Please try again.');
          return;
        }
        
        console.log(`✅ Amount validation passed: ₹${amountToPass} is correct for ${consultationType} consultation`);
        
        const appointmentResponse = await appointmentService.bookAppointment(
          doctor._id,
          selectedSlot._id,
          consultationType,
          selectedDate,
          'online', // Always use online payment for both consultation types
          amountToPass, // Pass the calculated amount
          selectedSlot.startTime // Pass the selected slot time
        );

        if (appointmentResponse && (appointmentResponse as any).paymentData) {
          console.log('✅ Payment data received:', (appointmentResponse as any).paymentData);
          
          // Validate that the backend returned the correct amount
          const returnedAmount = (appointmentResponse as any).paymentData.amount;
          // For in-person: backend returns convenience fee, for online: backend returns consultation fee
          const expectedAmount = consultationType === 'in-person' ? getConvenienceFee() * 100 : getDisplayConsultationFee() * 100; // Backend returns paise
          
          if (returnedAmount !== expectedAmount) {
            console.error(`❌ Backend amount mismatch: Expected ${expectedAmount} paise (₹${expectedAmount/100}), but got ${returnedAmount} paise (₹${returnedAmount/100})`);
            console.error(`❌ This will cause Razorpay to show the wrong amount!`);
            toast.error('Payment amount mismatch. Please contact support.');
            return;
          }
          
          console.log(`✅ Backend amount validation passed: ${returnedAmount} paise (₹${returnedAmount/100})`);
          
          setPaymentData((appointmentResponse as any).paymentData);
          setAppointmentId(appointmentResponse._id);
          
          // Move to payment step
          setCurrentStep(4);
          setBookingProgress(100);
          toast.success('Appointment prepared! Please complete payment to confirm.');
        } else {
          console.log('❌ No payment data in response:', appointmentResponse);
          toast.error('Failed to create payment order. Please try again.');
        }
      } catch (error) {
        console.error('Failed to create payment order:', error);
        toast.error('Failed to create payment order. Please try again.');
        return;
      }
    } catch (error: any) {
      console.error('❌ Error preparing appointment:', error);
      toast.error('Failed to prepare appointment details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentProcessing = async () => {
    if (!appointmentId || !paymentData) {
      console.error('❌ No appointment ID or payment data found');
      toast.error('Payment is not initialized. Please go back and try booking again.');
      return;
    }
    
    console.log('🔍 Starting payment processing with:', {
      appointmentId,
      paymentData,
      doctor: doctor?.name,
      user
    });
    
    setPaymentProcessing(true);
    try {
      const paymentResult = await paymentService.initializePayment(
        paymentData,
        doctor?.name || 'Doctor',
        {
          firstName: (user as { firstName?: string } | null)?.firstName || '',
          lastName: (user as { lastName?: string } | null)?.lastName || '',
          email: (user as { email?: string } | null)?.email || '',
          phone: (user as { phone?: string } | null)?.phone || ''
        }
      );
      
      setPaymentProcessing(false);
      
      console.log('✅ Payment completed successfully:', paymentResult);
      
      // Show payment success dialog with appointment and payment details
      if (appointmentData && paymentData) {
        const successData = {
          _id: appointmentId,
          appointmentNumber: appointmentData.appointmentNumber || `APT-${Date.now()}`,
          doctor: {
            name: doctor?.name || '',
            specialization: doctor?.specialization || '',
            profilePhoto: doctor?.profilePhoto || '',
            experience: doctor?.experience || 0,
            languages: doctor?.languages || [],
            location: { address: doctor?.location?.address || '' }
          },
          patient: {
            name: `${(user as any)?.firstName || ''} ${(user as any)?.lastName || ''}`.trim() || 'Patient',
            email: (user as any)?.email || '',
            phone: (user as any)?.phone || ''
          },
          scheduledDate: appointmentData.scheduledDate,
          scheduledTime: appointmentData.scheduledTime,
          consultationType: appointmentData.consultationType,
          cost: {
            consultationFee: appointmentData.cost.consultationFee,
            convenienceFee: appointmentData.cost.convenienceFee,
            totalAmount: appointmentData.cost.totalAmount
          },
          status: 'confirmed',
          videoCallLink: appointmentData.videoCallLink || `https://meet.healthsecure.com/${appointmentData.appointmentNumber}`,
          videoCallDetails: {
            platform: 'HealthSecure Video',
            roomId: appointmentData.appointmentNumber || `APT-${Date.now()}`,
            password: Math.random().toString(36).substr(2, 8)
          }
        };

        const successPaymentData = {
          orderId: paymentData.orderId || 'N/A',
          paymentId: paymentData.paymentId || 'N/A',
          razorpayPaymentId: (paymentResult as any)?.razorpay_payment_id || 'N/A',
          razorpayOrderId: (paymentResult as any)?.razorpay_order_id || 'N/A',
          amount: paymentData.amount || 0,
          currency: paymentData.currency || 'INR',
          status: 'completed',
          paidAt: new Date().toISOString(),
          receiptUrl: undefined
        };

        console.log('🎉 Setting success data and showing dialog:', { successData, successPaymentData });
        
        setSuccessAppointmentData(successData);
        setSuccessPaymentData(successPaymentData);
        
        // Check if there was a verification warning
        if ((paymentResult as any)?.verificationWarning) {
          console.warn('⚠️ Payment verification warning:', (paymentResult as any).verificationWarning);
          toast.warning('Payment successful but verification pending. Your appointment is confirmed.');
        } else {
          toast.success('Payment successful! Your appointment has been confirmed.');
        }
        
        console.log('🔍 Payment successful - automatically opening detailed receipt');
        
        // For in-person consultations, automatically open the detailed receipt dialog
        // This ensures the receipt is visible even when the stepper background disappears
        if (appointmentData.consultationType === 'in-person') {
          console.log('🔍 In-person consultation - auto-opening detailed receipt');
          
          // Store verification warning in success data for display in receipt
          if ((paymentResult as any)?.verificationWarning) {
            (successData as any).verificationWarning = (paymentResult as any).verificationWarning;
          }
          
          setShowDetailedReceipt(true);
        } else {
          console.log('🔍 Online consultation - auto-opening detailed video consultation receipt');
          
          // Store verification warning in success data for display in receipt
          if ((paymentResult as any)?.verificationWarning) {
            (successData as any).verificationWarning = (paymentResult as any).verificationWarning;
          }
          
          // For video consultations, show the detailed receipt directly
          setShowDetailedReceipt(true);
        }
        
        // Close the main modal after a short delay to show the receipt
        setTimeout(() => {
          onClose();
        }, 500);
      } else {
        toast.success('Payment processed successfully!');
        handleNextStep();
      }
    } catch (error) {
      console.error('❌ Payment processing failed:', error);
      setPaymentProcessing(false);
      
      // Better error handling with specific messages
      let errorMessage = 'Payment processing failed. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('cancelled')) {
          errorMessage = 'Payment was cancelled. You can try again.';
        } else if (error.message.includes('failed')) {
          errorMessage = 'Payment failed. Please check your payment method and try again.';
        } else if (error.message.includes('verification')) {
          errorMessage = 'Payment verification failed. Please contact support.';
        }
      }
      
      toast.error(errorMessage);
      
      // For development, show more details
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Detailed payment error:', {
          error,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : 'No stack trace'
        });
      }
    }
  };

  const handleSymptomToggle = (symptom: string) => { setSelectedSymptoms(prev => prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]); };

  // Helper function to get doctor fees dynamically
  const getDoctorFees = useMemo(() => {
    let fees = { online: 0, inPerson: 0 };
    
    // Debug: Log the actual doctor data
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Raw Doctor Data:', {
        doctorId: doctor?._id,
        doctorName: doctor?.name,
        consultationFees: doctor?.consultationFees,
        fees: doctor?.fees,
        doctorObject: doctor
      });
    }
    
    // Priority 1: Use consultationFees field (legacy but most reliable)
    if (doctor?.consultationFees && doctor.consultationFees.online && doctor.consultationFees.inPerson) {
      fees = {
        online: Number(doctor.consultationFees.online) || 0,
        inPerson: Number(doctor.consultationFees.inPerson) || 0
      };
      console.log('✅ Using consultationFees:', fees);
    }
    // Priority 2: Fallback to fees field
    else if (doctor?.fees && doctor.fees.online && doctor.fees.inPerson) {
      fees = {
        online: Number(doctor.fees.online) || 0,
        inPerson: Number(doctor.fees.inPerson) || 0
      };
      console.log('✅ Using fees field:', fees);
    }
    // Priority 3: Use individual fields if available
    else if (doctor?.consultationFees) {
      fees = {
        online: Number(doctor.consultationFees.online) || 0,
        inPerson: Number(doctor.consultationFees.inPerson) || 0
      };
      console.log('✅ Using consultationFees (partial):', fees);
    }
    else if (doctor?.fees) {
      fees = {
        online: Number(doctor.fees.online) || 0,
        inPerson: Number(doctor.fees.inPerson) || 0
      };
      console.log('✅ Using fees field (partial):', fees);
    }
    // Priority 4: No fallback - fees must be configured
    else {
      fees = { online: 0, inPerson: 0 }; // No fallback - fees must be configured
      console.log('❌ No doctor fees configured. Please set consultation fees in doctor profile.');
    }
    
    // Ensure fees are numbers and validate minimum amounts
    const minFee = 100; // Minimum consultation fee
    fees.online = Math.max(Number(fees.online) || 0, minFee);
    fees.inPerson = Math.max(Number(fees.inPerson) || 0, minFee);
    
    // Final debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Final Calculated Fees:', {
        doctorId: doctor?._id,
        doctorName: doctor?.name,
        consultationFees: doctor?.consultationFees,
        fees: doctor?.fees,
        calculatedFees: fees,
        consultationType
      });
    }
    
    return fees;
  }, [doctor, consultationType]);

  // Get consultation fee for a specific consultation type (for display purposes)
  const getFeeForType = (type: ConsultationType) => {
    const fees = getDoctorFees;
    const fee = type === 'online' ? fees.online : fees.inPerson;
    console.log(`🔍 getFeeForType: ${type} = ₹${fee}`);
    return fee;
  };

  // Get consultation fee for display purposes (always show actual doctor fee, not payment data)
  const getDisplayConsultationFee = () => {
    const fees = getDoctorFees;
    const fee = consultationType === 'online' ? fees.online : fees.inPerson;
    console.log(`🔍 getDisplayConsultationFee: ${consultationType} = ₹${fee}`);
    return fee;
  };

  // Get consultation fee for payment calculations (always use configured doctor fee)
  // Ignore any existing paymentData to avoid stale/incorrect amounts leaking into flows
  const getConsultationFee = () => {
    const fees = getDoctorFees;
    const fee = consultationType === 'online' ? fees.online : fees.inPerson;
    console.log(`🔍 getConsultationFee (${consultationType}): Using configured fee ₹${fee}`);
    return fee;
  };

  // Calculate convenience fee for in-person consultations (configurable rate of consultation fee)
  const getConvenienceFee = () => {
    if (consultationType === 'in-person') {
      const fees = getDoctorFees;
      const baseFee = fees.inPerson;
      
      // Add validation for minimum fee
      const minRecommendedFee = 500; // Minimum recommended consultation fee
      if (baseFee < minRecommendedFee) {
        console.warn(`⚠️ Doctor's in-person fee is very low: ₹${baseFee}. This will result in a very small convenience fee.`);
        console.warn(`⚠️ Please update the doctor's consultation fee to a reasonable amount (₹${minRecommendedFee}+ recommended).`);
      }
      
      const convenienceFee = Math.round(baseFee * CONVENIENCE_FEE_RATE); // Configurable convenience fee rate
      
      // Debug logging
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Convenience Fee Calculation:', {
          baseFee,
          convenienceFee,
          doctorFees: doctor?.fees,
          consultationFees: doctor?.consultationFees,
          parsedFees: getDoctorFees,
          consultationType,
          calculation: `${baseFee} * ${CONVENIENCE_FEE_RATE} = ${baseFee * CONVENIENCE_FEE_RATE} = ${convenienceFee}`,
          warning: baseFee < minRecommendedFee ? `Low fee warning: ₹${baseFee} will result in ₹${convenienceFee} convenience fee` : null
        });
      }
      
      return convenienceFee;
    }
    return 0;
  };

  // Calculate total fee - for in-person: only convenience fee, for online: consultation fee
  const getTotalFee = () => {
    if (consultationType === 'in-person') {
      const totalFee = getConvenienceFee(); // Only convenience fee for in-person
      
      // Debug logging
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Total Fee Calculation (In-Person):', {
          consultationFee: getConsultationFee(),
          convenienceFee: getConvenienceFee(),
          totalFee,
          doctorFees: doctor?.fees
        });
      }
      
      return totalFee;
    }
    
    const totalFee = getConsultationFee(); // Full consultation fee for online
    
    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Total Fee Calculation (Online):', {
        consultationFee: getConsultationFee(),
        totalFee,
        doctorFees: doctor?.fees
      });
    }
    
    return totalFee;
  };

  // Monitor doctor data changes and log fees
  useEffect(() => {
    if (doctor && process.env.NODE_ENV === 'development') {
      console.log('🔍 Doctor Data Changed:', {
        doctorId: doctor._id,
        doctorName: doctor.name,
        consultationFees: doctor.consultationFees,
        fees: doctor.fees,
        calculatedFees: getDoctorFees
      });
    }
  }, [doctor]);

  // Monitor consultation type changes and log fee calculations
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Consultation Type Changed:', {
        consultationType,
        onlineFee: getDoctorFees.online,
        inPersonFee: getDoctorFees.inPerson,
        displayFee: getDisplayConsultationFee(),
        convenienceFee: getConvenienceFee()
      });
    }
  }, [consultationType]);

  // Monitor convenience fee changes
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && consultationType === 'in-person') {
      console.log('🔍 Convenience Fee Changed:', {
        consultationType,
        inPersonFee: getDoctorFees.inPerson,
        convenienceFee: getConvenienceFee(),
        calculation: `${getDoctorFees.inPerson} × ${CONVENIENCE_FEE_RATE} = ${Math.round(getDoctorFees.inPerson * CONVENIENCE_FEE_RATE)}`,
        currentStep
      });
    }
  }, [consultationType, currentStep]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
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
                    <img src={doctor?.profilePhoto || ''} alt={doctor?.name || ''} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="text-xl font-bold text-health-charcoal">{doctor?.name}</h3>
                      <p className="text-health-aqua font-medium">{doctor?.specialization}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="font-semibold">{doctor?.ratings.average}</span>
                        <span className="text-health-charcoal/60">({doctor?.ratings.count} reviews)</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-health-aqua" /><span className="text-health-charcoal/80">{doctor?.location.address}</span></div>
                      <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-health-aqua" /><span className="text-health-charcoal/80">{doctor?.languages.join(', ')}</span></div>
                      <div className="flex items-center gap-2"><Award className="w-4 h-4 text-health-aqua" /><span className="text-health-charcoal/80">{doctor?.experience} years experience</span></div>
                      <div className="flex items-center gap-2"><GraduationCap className="w-4 h-4 text-health-aqua" /><span className="text-health-charcoal/80">MBBS, MD</span></div>
                    </div>
                  </div>
                </div>
                
              </CardContent>
            </Card>

            <Card className="border-health-teal/20">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-health-teal">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-health-teal text-white rounded-full flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <Video className="w-5 h-5" />
                    <span>Select Consultation Type</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Current Selection Indicator */}
                <div className="mb-4 p-3 bg-gradient-to-r from-health-teal/5 to-blue-50 rounded-lg border border-health-teal/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-health-charcoal">Currently Selected:</span>
                      <Badge variant="outline" className="bg-health-teal/10 text-health-teal border-health-teal/20">
                        {consultationType === 'online' ? 'Video Consultation' : 'In-Person Visit'}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-health-charcoal/60 block">Fee Structure</span>
                      <span className="text-sm font-semibold text-health-teal">
                        {consultationType === 'online' 
                          ? `₹${getFeeForType('online')} (Full Payment)`
                          : `₹${Math.round(getFeeForType('in-person') * CONVENIENCE_FEE_RATE)} (Convenience Fee Only)`
                        }
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className={`cursor-pointer transition-all ${consultationType === 'online' ? 'border-health-teal bg-health-teal/5' : 'border-gray-200 hover:border-health-teal/30'}`} onClick={() => setConsultationType('online')}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2 rounded-full ${consultationType === 'online' ? 'bg-health-teal text-white' : 'bg-gray-100'}`}>
                          <Video className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Video Consultation</h4>
                          <p className="text-sm text-health-charcoal/60">Consult from anywhere</p>
                        </div>
                      </div>
                      
                      {/* Prominent Fee Display */}
                      <div className="mb-4 p-3 bg-gradient-to-r from-health-teal/10 to-health-teal/5 rounded-lg border border-health-teal/20">
                        <div className="text-center">
                          <span className="text-xs text-health-charcoal/60 block mb-1">Consultation Fee</span>
                          <span className="text-2xl font-bold text-health-teal">₹{getFeeForType('online')}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-health-charcoal/70">Duration:</span>
                          <span className="font-medium">15-20 minutes</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-health-charcoal/70">Platform:</span>
                          <span className="font-medium">Secure Video Call</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-health-charcoal/70">Payment:</span>
                          <span className="font-medium text-health-teal">Online Payment</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className={`cursor-pointer transition-all ${consultationType === 'in-person' ? 'border-health-teal bg-health-teal/5' : 'border-gray-200 hover:border-health-teal/30'}`} onClick={() => setConsultationType('in-person')}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2 rounded-full ${consultationType === 'in-person' ? 'bg-health-teal text-white' : 'bg-gray-100'}`}>
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold">In-Person Visit</h4>
                          <p className="text-sm text-health-charcoal/60">Visit the clinic</p>
                        </div>
                      </div>
                      
                      {/* Prominent Fee Display */}
                      <div className="mb-4 p-3 bg-gradient-to-r from-health-teal/10 to-health-teal/5 rounded-lg border border-health-teal/20">
                        <div className="text-center">
                          <span className="text-xs text-health-charcoal/60 block mb-1">Consultation Fee</span>
                          <span className="text-2xl font-bold text-health-teal">₹{getFeeForType('in-person')}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-health-charcoal/70">Convenience Fee ({(CONVENIENCE_FEE_RATE * 100).toFixed(0)}%):</span>
                          <span className="font-semibold text-health-teal">₹{Math.round(getFeeForType('in-person') * CONVENIENCE_FEE_RATE)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-health-charcoal/70">Duration:</span>
                          <span className="font-medium">20-30 minutes</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-health-charcoal/70">Location:</span>
                          <span className="font-medium text-right max-w-[120px] truncate">{doctor?.location.address}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-health-charcoal/70">Payment:</span>
                          <span className="font-medium text-health-teal">Convenience Fee Only</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                        <strong>Note:</strong> Convenience fee required to unlock receipt & payment processing.
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Brain className="w-5 h-5 text-health-teal" />Specializations & Services</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{['Cardiology','Preventive Care','Diagnosis','Treatment Planning'].map((s) => (<Badge key={s} variant="outline" className="text-center py-2">{s}</Badge>))}</div>
              </CardContent>
            </Card>
            
            {/* Consultation Fee Information */}
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <IndianRupee className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-blue-900">About Consultation Fees</h4>
                    <div className="text-sm text-blue-800 space-y-1">
                      <p><strong>Video Consultation:</strong> Full consultation fee is charged upfront for online consultations.</p>
                      <p><strong>In-Person Visit:</strong> Only a convenience fee (5% of consultation fee) is charged online. The full consultation fee is paid directly at the clinic.</p>
                      <p><strong>Note:</strong> Consultation fees are set by the doctor and may vary based on specialization and experience.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Debug Information - Remove in production */}
            {process.env.NODE_ENV === 'development' && (
              <Card className="border-orange-200 bg-orange-50/50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-orange-900">Debug: Fee Calculation Data</h4>
                      <div className="text-sm text-orange-800 space-y-1">
                        <p><strong>Doctor ID:</strong> {doctor?._id || 'N/A'}</p>
                        <p><strong>Consultation Fees:</strong> {JSON.stringify(doctor?.consultationFees) || 'N/A'}</p>
                        <p><strong>Fees Field:</strong> {JSON.stringify(doctor?.fees) || 'N/A'}</p>
                        <p><strong>Calculated Fees:</strong> {JSON.stringify(getDoctorFees)}</p>
                        <p><strong>Current Type:</strong> {consultationType}</p>
                        <p><strong>Online Fee:</strong> ₹{getFeeForType('online')}</p>
                        <p><strong>In-Person Fee:</strong> ₹{getFeeForType('in-person')}</p>
                        <p><strong>Display Fee (Current):</strong> ₹{getDisplayConsultationFee()}</p>
                        <p><strong>Convenience Fee:</strong> ₹{Math.round(getFeeForType('in-person') * CONVENIENCE_FEE_RATE)}</p>
                        <p><strong>Step 1 vs Step 4 Comparison:</strong></p>
                        <p>• Step 1 Convenience Fee: ₹{Math.round(getFeeForType('in-person') * CONVENIENCE_FEE_RATE)}</p>
                        <p>• Step 4 Convenience Fee: ₹{getConvenienceFee()}</p>
                        <p>• Difference: ₹{Math.round(getFeeForType('in-person') * CONVENIENCE_FEE_RATE) - getConvenienceFee()}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><CalendarIcon className="w-5 h-5 text-health-teal" />Select Date & Time</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div><h4 className="font-semibold mb-3">Select Date</h4>
                    <Calendar 
                      mode="single" 
                      selected={selectedDate} 
                      onSelect={handleDateSelection} 
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0); // Reset time to start of day
                        const isDisabled = date < today;
                        // Only log when debugging is enabled
                        if (process.env.NODE_ENV === 'development' && isDisabled) {
                          console.log('🔍 Date disabled:', date.toDateString(), 'Reason: Before today');
                        }
                        return isDisabled;
                      }} 
                      className="rounded-md border" 
                    />
                    {/* Debug: Show selected date */}
                    <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                      <strong>Selected Date:</strong> {selectedDate?.toDateString() || 'None'}
                    </div>
                    {/* Debug: Test button to manually set date */}
                    <div className="mt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          const testDate = new Date(2025, 7, 22); // August 22, 2025 (month is 0-indexed)
                          console.log('🔍 Manually setting date to:', testDate.toDateString());
                          setSelectedDate(testDate);
                        }}
                        className="text-xs"
                      >
                        Test: Set to Aug 22, 2025
                      </Button>
                    </div>
                  </div>
                  <div><h4 className="font-semibold mb-3">Available Time Slots</h4>
                    {availableSlots.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
                        <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p>No available time slots for this date</p>
                        <p className="text-sm">Please select a different date or try again later</p>
                      </div>
                    ) : (
                      <>
                                                <div className="mb-3 text-sm text-gray-600">
                          <p>Available slots: {availableSlots.filter(slot => slot.isAvailable && !slot.isBooked).length}</p>
                          <p>Booked slots: {availableSlots.filter(slot => slot.isBooked).length}</p>
                        </div>
                        <div className="mb-3 flex gap-4 text-xs">
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                            <span>Available</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
                            <span>Booked</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-health-teal rounded"></div>
                            <span>Selected</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {availableSlots.map((slot) => {
                          // Safe date formatting with validation
                          const formatTime = (timeString: string) => {
                            try {
                              const date = new Date(timeString);
                              if (isNaN(date.getTime())) {
                                return timeString; // Return original string if invalid date
                              }
                              return format(date, 'HH:mm');
                            } catch (error) {
                              return timeString; // Return original string if formatting fails
                            }
                          };

                          return (
                            <Button 
                              key={slot._id} 
                              variant={selectedSlot?._id === slot._id ? 'default' : (slot.isBooked ? 'destructive' : 'outline')} 
                              className={`w-full justify-start h-16 ${
                                selectedSlot?._id === slot._id ? 'bg-health-teal hover:bg-health-teal/90' : 
                                slot.isBooked ? 'cursor-not-allowed bg-red-50 border-red-200 text-red-700 hover:bg-red-50' : 
                                !slot.isAvailable ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''
                              }`} 
                              onClick={() => handleSlotSelection(slot)} 
                              disabled={!slot.isAvailable || slot.isBooked}
                            >
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center">
                                  <Clock className={`w-4 h-4 mr-2 ${slot.isBooked ? 'text-red-500' : !slot.isAvailable ? 'text-gray-400' : ''}`} />
                                  <span className="font-medium">{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</span>
                                </div>
                                {slot.isBooked ? (
                                  <div className="text-right">
                                    <div className="text-red-600 font-medium text-xs">Booked</div>
                                    <div className="text-red-500 text-xs">by another patient</div>
                                  </div>
                                ) : (
                                  <Badge 
                                    variant={!slot.isAvailable ? 'outline' : 'secondary'} 
                                    className={`ml-auto ${!slot.isAvailable ? 'text-gray-400 border-gray-300' : ''}`}
                                  >
                                    {slot.consultationType}
                                  </Badge>
                                )}
                              </div>
                            </Button>
                          );
                        })}
                        </div>
                      </>
                    )}
                    {slotLocked && (<Alert className="mt-4"><CheckCircle className="h-4 w-4" /><AlertDescription>Time slot locked successfully! You have 5 minutes to complete the booking.</AlertDescription></Alert>)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            {/* Appointment Summary and Confirmation */}
              <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-health-teal" />
                  Confirm Appointment Details
                </CardTitle>
              </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                  {/* Appointment Summary */}
                    <div className="p-4 border rounded-lg bg-gray-50">
                    <h5 className="font-medium mb-3">Appointment Summary</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Doctor:</span>
                        <p className="font-medium">{doctor?.name}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Specialization:</span>
                        <p className="font-medium">{doctor?.specialization}</p>
                    </div>
                      <div>
                        <span className="text-gray-600">Date & Time:</span>
                        <p className="font-medium">{selectedDate?.toLocaleDateString()} at {selectedSlot ? (() => {
                          try {
                            const startTime = new Date(selectedSlot.startTime);
                            const endTime = new Date(selectedSlot.endTime);
                            return `${startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
                          } catch (error) {
                            return selectedSlot.startTime;
                          }
                        })() : 'N/A'}</p>
                    </div>
                      <div>
                        <span className="text-gray-600">Consultation Type:</span>
                        <p className="font-medium capitalize">{consultationType}</p>
                  </div>
                      <div>
                        <span className="text-gray-600">Consultation Fee:</span>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">₹{getDisplayConsultationFee()}</p>
                          {consultationType === 'in-person' && (
                            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">(pay at offline)</span>
                          )}
                      </div>
                    </div>
                      {consultationType === 'in-person' && (
                        <div>
                          <span className="text-gray-600">Convenience Fee (5%):</span>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">₹{getConvenienceFee()}</p>
                            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">(to unlock receipt pay with razorpay)</span>
                        </div>
                        </div>
                      )}
                      <div className="md:col-span-2">
                        <span className="text-gray-600">Total Amount:</span>
                        <p className="font-medium text-lg text-health-teal">₹{getTotalFee()}</p>
                        </div>
                      </div>
                    </div>

                  {/* Terms and Conditions */}
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="terms" 
                      checked={agreedToTerms} 
                      onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                    />
                    <Label htmlFor="terms" className="text-sm">
                      I agree to the terms and conditions and understand the cancellation policy
                    </Label>
                        </div>

                  {/* Confirm Booking Button */}
                  <Button 
                    onClick={handleConfirmBooking} 
                    disabled={!agreedToTerms || loading}
                    className="w-full bg-health-teal hover:bg-health-teal/90 text-white"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h4 mr-2" />
                        Confirm Booking
                      </>
                    )}
                  </Button>
                  </div>
                </CardContent>
              </Card>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 relative z-50">
            {/* Razorpay Payment Integration */}
            <Card className="relative z-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-health-teal" />
                  {consultationType === 'online' ? 'Online Payment (Razorpay)' : 'In-Person Payment (Razorpay)'}
                </CardTitle>
              </CardHeader>
              <CardContent>
          <div className="space-y-6">
                  {/* Payment Summary */}
                  <div className="p-6 border rounded-lg bg-gray-50/50 border-gray-200">
                    <h5 className="font-semibold mb-4 text-gray-900 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-health-teal" />
                      Payment Summary
                    </h5>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Consultation Fee:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">₹{getDisplayConsultationFee()}</span>
                          {consultationType === 'in-person' && (
                            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">(pay at offline)</span>
                          )}
                </div>
              </div>
                      {consultationType === 'in-person' && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">Convenience Fee (5%):</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">₹{getConvenienceFee()}</span>
                            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">(to unlock receipt pay with razorpay)</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Debug info for step 4 - Remove in production */}
                      {process.env.NODE_ENV === 'development' && consultationType === 'in-person' && (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="text-xs text-yellow-800 space-y-1">
                            <p><strong>Debug - Step 4 Fee Calculation:</strong></p>
                            <p>Doctor In-Person Fee: ₹{getDoctorFees.inPerson}</p>
                            <p>Consultation Fee (Display): ₹{getDisplayConsultationFee()}</p>
                            <p>Consultation Fee (Payment): ₹{getConsultationFee()}</p>
                                                          <p>Convenience Fee ({(CONVENIENCE_FEE_RATE * 100).toFixed(0)}%): ₹{getConvenienceFee()}</p>
                            <p>Total Fee: ₹{getTotalFee()}</p>
                            <p>Calculation: ₹{getDoctorFees.inPerson} × {CONVENIENCE_FEE_RATE} = ₹{Math.round(getDoctorFees.inPerson * CONVENIENCE_FEE_RATE)}</p>
                            <p><strong>Razorpay Amount Debug:</strong></p>
                            <p>• Amount sent to backend: ₹{getConvenienceFee()} (convenience fee)</p>
                            <p>• Amount returned by backend: ₹{paymentData ? Math.round(Number(paymentData.amount) / 100) : 'N/A'}</p>
                            <p>• Expected Razorpay amount: ₹{getConvenienceFee()}</p>
                            <p>• Actual Razorpay amount: ₹{paymentData ? Math.round(Number(paymentData.amount) / 100) : 'N/A'}</p>
                            <p><strong>Raw Data:</strong></p>
                            <p>• Doctor Object: {JSON.stringify(doctor, null, 2).substring(0, 200)}...</p>
                            <p>• Payment Data: {JSON.stringify(paymentData, null, 2).substring(0, 200)}...</p>
                            <p>• Current Step: {currentStep}</p>
                            <p>• Consultation Type: {consultationType}</p>
                            <p><strong>Fix Applied:</strong></p>
                            <p>• In-person consultations now always show actual consultation fee (₹{getDoctorFees.inPerson})</p>
                            <p>• Payment data amount (₹{paymentData ? Math.round(Number(paymentData.amount) / 100) : 'N/A'}) is ignored for in-person</p>
                            <p>• Convenience fee remains 5% of actual consultation fee</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Warning for low doctor fees */}
                      {consultationType === 'in-person' && getDisplayConsultationFee() < 500 && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                            <span className="text-sm text-red-800 font-medium">Low Consultation Fee Warning</span>
                          </div>
                          <p className="text-xs text-red-700 mt-1">
                            Doctor's in-person consultation fee is ₹{getDisplayConsultationFee()}. 
                            This results in a very small convenience fee of ₹{getConvenienceFee()}. 
                            Please contact support to update the doctor's consultation fee.
                          </p>
                        </div>
                      )}
                      <div className="flex items-center justify-between font-medium border-t pt-3">
                        <span className="text-gray-900">Total Amount:</span>
                        <span className="text-health-teal font-semibold text-lg">₹{getTotalFee()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Razorpay Payment Button */}
                  {paymentData ? (
                    <div className="space-y-4">
                      <div className="text-center space-y-3">
                        {consultationType === 'in-person' && (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-700 font-medium">Pay convenience fee to book the in-person unlock receipt</p>
                          </div>
                        )}
                        <p className="text-sm text-gray-600">Click below to proceed with payment</p>
                        <Button 
                          onClick={handlePaymentProcessing}
                          disabled={paymentProcessing}
                          className="w-full bg-health-teal hover:bg-health-teal/90 text-white relative z-50 py-3 text-base font-medium"
                        >
                          {paymentProcessing ? (
                            <>
                              <Loader2 className="w-4 h4 mr-2 animate-spin" />
                              Processing Payment...
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-4 h4 mr-2" />
                              {consultationType === 'in-person' ? `Pay Convenience Fee ₹{getTotalFee()} via Razorpay` : `Pay ₹{getTotalFee()} via Razorpay`}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-4">
                      <Loader2 className="w-4 h4 mx-auto mb-2 animate-spin" />
                      <p>Preparing payment...</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );
              case 5:
          console.log('🔍 Rendering Step 5 - Success & Receipt');
          console.log('🔍 Step 5 data:', { appointmentData, successAppointmentData, successPaymentData });
          return (
            <div className="space-y-6">
              <Card className="border-health-teal/20">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-health-teal">
                    <CheckCircle className="w-5 h-5" />
                    Payment Successful!
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-green-600 mb-2">Appointment Confirmed!</h3>
                      <p className="text-gray-600">
                        Your {consultationType === 'in-person' ? 'in-person' : 'online'} consultation has been successfully booked.
                      </p>
                    </div>
                    
                    {consultationType === 'in-person' && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-700">
                          <strong>Important:</strong> You have paid the convenience fee. 
                          The full consultation fee (₹{getDisplayConsultationFee()}) will be collected at the clinic.
                        </p>
                      </div>
                    )}
                    
                    <div className="space-y-3 text-left">
                      <div className="flex justify-between">
                        <span className="font-medium">Appointment Number:</span>
                        <span className="text-health-teal font-semibold">{appointmentData?.appointmentNumber || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Doctor:</span>
                        <span>{doctor?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Date:</span>
                        <span>{selectedDate?.toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Time:</span>
                        <span>{selectedSlot?.startTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Amount Paid:</span>
                        <span className="text-green-600 font-semibold">₹{getTotalFee()}</span>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => {
                        console.log('🔍 Receipt button clicked, setting showDetailedReceipt to true');
                        console.log('🔍 Success appointment data:', successAppointmentData);
                        console.log('🔍 Success payment data:', successPaymentData);
                        setShowDetailedReceipt(true);
                      }}
                      className="w-full bg-health-teal hover:bg-health-teal/90 text-white"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      View Detailed Receipt
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        default:
          console.log('🔍 Default case reached - Current step:', currentStep);
          return (
            <div className="p-8 text-center">
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Step {currentStep}</h3>
              <p className="text-gray-500">This step is not yet implemented.</p>
            </div>
          );
      }
    };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="text-2xl font-bold text-health-teal flex items-center gap-2"><CalendarIcon className="w-6 h-6" />Book Appointment</DialogTitle></DialogHeader>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-health-charcoal/70">Step {currentStep} of 5</span>
            <span className="text-sm font-medium text-health-teal">{bookingProgress}% Complete</span>
          </div>
          
          {/* Enhanced Step Progress Bar */}
          <Progress value={bookingProgress} className="h-3" />
          
          {/* Step Labels with Visual Indicators */}
          <div className="flex justify-between mt-3">
            <div className={`flex flex-col items-center ${currentStep >= 1 ? 'text-health-teal' : 'text-health-charcoal/30'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                currentStep >= 1 ? 'bg-health-teal text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                1
              </div>
              <span className="text-xs font-medium text-center">Consultation<br/>Type</span>
            </div>
            <div className={`flex flex-col items-center ${currentStep >= 2 ? 'text-health-teal' : 'text-health-charcoal/30'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                currentStep >= 2 ? 'bg-health-teal text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                2
              </div>
              <span className="text-xs font-medium text-center">Date &<br/>Time</span>
            </div>
            <div className={`flex flex-col items-center ${currentStep >= 3 ? 'text-health-teal' : 'text-health-charcoal/30'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                currentStep >= 3 ? 'bg-health-teal text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                3
              </div>
              <span className="text-xs font-medium text-center">{consultationType === 'online' ? 'Payment' : 'Setup'}</span>
            </div>
            <div className={`flex flex-col items-center ${currentStep >= 4 ? 'text-health-teal' : 'text-health-charcoal/30'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                currentStep >= 4 ? 'bg-health-teal text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                4
              </div>
              <span className="text-xs font-medium text-center">Confirm</span>
            </div>
            <div className={`flex flex-col items-center ${currentStep >= 5 ? 'text-health-teal' : 'text-health-charcoal/30'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                currentStep >= 5 ? 'bg-health-teal text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                5
              </div>
              <span className="text-xs font-medium text-center">Receipt</span>
            </div>
          </div>
          
          {/* Current Step Highlight */}
          {currentStep === 1 && (
            <div className="mt-3 p-2 bg-health-teal/10 border border-health-teal/20 rounded-lg">
              <div className="flex items-center gap-2 text-health-teal">
                <span className="w-2 h-2 bg-health-teal rounded-full animate-pulse"></span>
                <span className="text-sm font-medium">Step 1: Select your preferred consultation type and view fees</span>
              </div>
            </div>
          )}
          {currentStep === 5 && (
            <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-600">
                <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                <span className="text-sm font-medium">Step 5: View your appointment confirmation and receipt</span>
              </div>
            </div>
          )}
        </div>
        <div className="mb-6">{renderStepContent()}</div>
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={handlePreviousStep} disabled={currentStep === 1} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            {currentStep === 1 && (
              <Button onClick={handleNextStep} className="bg-health-teal hover:bg-health-teal/90 text-white flex items-center gap-2">
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
            {currentStep === 2 && (
              <Button onClick={handleNextStep} disabled={!selectedSlot} className="bg-health-teal hover:bg-health-teal/90 text-white flex items-center gap-2">
                {consultationType === 'online' ? 'Continue to Payment' : 'Continue to Setup'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
            {currentStep === 5 && (
              <Button onClick={onClose} className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Done
              </Button>
            )}
            {/* Step 3 has Confirm Booking button in the content, Step 4 has payment processing */}
          </div>
        </div>
      </DialogContent>

      {/* Payment Success Dialog - No longer used, replaced with detailed receipts */}
      {/* {showPaymentSuccess && successAppointmentData && successPaymentData && (
        <PaymentSuccessDialog
          open={showPaymentSuccess}
          appointmentData={successAppointmentData}
          paymentData={successPaymentData}
          onClose={() => setShowPaymentSuccess(false)}
        />
      )} */}

      {/* Receipt Unlock Modal for In-Person Consultations - REMOVED */}
      {/* We now show the receipt directly after payment success */}

      {/* Medical Receipt for All Consultations */}
      {showDetailedReceipt && successAppointmentData && successPaymentData && (
        <>
          {console.log('🔍 Rendering receipt component with data:', {
            showDetailedReceipt,
            successAppointmentData,
            successPaymentData,
            consultationType: successAppointmentData.consultationType
          })}
          
          {/* Render VideoConsultationReceipt for online consultations */}
          {successAppointmentData.consultationType === 'online' ? (
            <VideoConsultationReceipt
              open={showDetailedReceipt}
              data={{
                appointmentId,
                appointmentNumber: successAppointmentData.appointmentNumber,
                doctor: successAppointmentData.doctor,
                patient: successAppointmentData.patient,
                scheduledDate: new Date(successAppointmentData.scheduledDate),
                scheduledTime: successAppointmentData.scheduledTime,
                consultationType: successAppointmentData.consultationType,
                cost: successAppointmentData.cost,
                status: successAppointmentData.status,
                videoCallLink: successAppointmentData.videoCallLink,
                videoCallDetails: successAppointmentData.videoCallDetails,
                paymentDetails: successPaymentData,
                verificationWarning: (successAppointmentData as any).verificationWarning
              }}
              onClose={() => {
                console.log('🔍 VideoConsultationReceipt closed by user');
                setShowDetailedReceipt(false);
                // After closing receipt, show a final success message
                toast.success('Video consultation booked successfully!');
              }}
            />
          ) : (
            /* Render DetailedReceipt for in-person consultations */
            <DetailedReceipt
              open={showDetailedReceipt}
              data={{
                appointmentNumber: successAppointmentData.appointmentNumber,
                doctor: successAppointmentData.doctor,
                patient: successAppointmentData.patient,
                scheduledDate: new Date(successAppointmentData.scheduledDate),
                scheduledTime: successAppointmentData.scheduledTime,
                consultationType: successAppointmentData.consultationType,
                cost: successAppointmentData.cost,
                status: successAppointmentData.status,
                paymentDetails: successPaymentData,
                verificationWarning: (successAppointmentData as any).verificationWarning
              }}
              onClose={() => {
                console.log('🔍 DetailedReceipt closed by user');
                setShowDetailedReceipt(false);
                // After closing receipt, show a final success message
                toast.success('In-person appointment booked successfully!');
              }}
            />
          )}
        </>
      )}
      
      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white p-2 rounded text-xs z-50">
          <div>Receipt Dialog: {showDetailedReceipt ? 'Open' : 'Closed'}</div>
          <div>Appointment Data: {successAppointmentData ? 'Set' : 'Not Set'}</div>
          <div>Payment Data: {successPaymentData ? 'Set' : 'Not Set'}</div>
        </div>
      )}
    </Dialog>
  );
};
