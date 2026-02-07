import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { useLocation } from '@/hooks/useLocation';
import { DoctorCard } from '@/components/appointments/DoctorCard';
import { DoctorProfileModal } from '@/components/appointments/DoctorProfileModal';
import { ConfirmationModal } from '@/components/appointments/ConfirmationModal';
import { DetailedReceipt } from '@/components/appointments/DetailedReceipt';
import { VideoConsultationReceipt } from '@/components/appointments/VideoConsultationReceipt';

import { Doctor, TimeSlot, ConsultationType, Appointment } from '@/types/appointment';
import { appointmentService } from '@/services/appointmentService';
import apiService from '@/lib/api';
import { toast } from 'sonner';
import { 
  Search, Filter, MapPin, Users, Calendar, Heart, 
  AlertTriangle, Star, Clock, Globe, Award, 
  Phone, Mail, ExternalLink, Plus, Minus,
  ArrowLeft, ArrowRight, RefreshCw, BookOpen,
  Video, MapPin as MapPinIcon, CheckCircle, XCircle, Clock as ClockIcon,
  Eye, MoreHorizontal, CreditCard, BarChart3, Receipt, Edit, Share2, Trash2
} from 'lucide-react';

// Add DoctorLite type for compatibility with DoctorProfileModal
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
}

const PatientBookAppointment: React.FC = () => {
  const navigate = useNavigate();
  const { 
    location, 
    loading: locationLoading, 
    error: locationError, 
    accuracy,
    lastUpdated,
    setLocationByPincode,
    refreshLocation 
  } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'nearby';
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | DoctorLite | null>(null);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [bookingDetails, setBookingDetails] = useState<{
    doctor: Doctor | DoctorLite;
    slot: any;
    type: ConsultationType;
  } | null>(null);

  // Appointments state
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentSearchTerm, setAppointmentSearchTerm] = useState('');
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const [selectedRating, setSelectedRating] = useState('all');
  const [selectedFee, setSelectedFee] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [searchRadius, setSearchRadius] = useState(5); // Default 5km radius

  // Specializations for filter
  const specializations = [
    'Cardiologist', 'Dermatologist', 'Neurologist', 'Orthopedist', 
    'Pediatrician', 'Psychiatrist', 'Gynecologist', 'Ophthalmologist',
    'ENT Specialist', 'General Physician', 'Dentist', 'Physiotherapist'
  ];

  useEffect(() => {
    fetchDoctors();
  }, [activeTab, location, searchRadius]);

  // Fetch appointments when bookings tab is active
  useEffect(() => {
    if (activeTab === 'bookings') {
      fetchAppointments();
    }
  }, [activeTab]);

  // Auto-refresh appointments when switching to bookings tab
  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
    if (value === 'bookings') {
      // Refresh appointments when switching to bookings tab
      fetchAppointments();
    }
  };

  // Listen for appointment booked events to refresh the list
  useEffect(() => {
    const handleAppointmentBooked = (event: CustomEvent) => {
      console.log('🎉 Appointment booked event received:', event.detail);
      // Refresh appointments list
      fetchAppointments();
      // Show success toast
      toast.success('Appointment booked successfully! Check your bookings tab.');
      // Switch to bookings tab to show the new appointment
      setSearchParams({ tab: 'bookings' });
    };

    window.addEventListener('appointment-booked', handleAppointmentBooked as EventListener);
    
    return () => {
      window.removeEventListener('appointment-booked', handleAppointmentBooked as EventListener);
    };
  }, []);

  // Additional effect to ensure "All Doctors" tab fetches data when selected
  useEffect(() => {
    if (activeTab === 'all') {
      console.log('🌐 All Doctors tab selected - ensuring data is loaded');
      console.log('📊 Current doctors count:', doctors.length);
      if (doctors.length === 0) {
        console.log('🔄 No doctors loaded yet, fetching from database...');
        fetchDoctors();
      } else {
        console.log('✅ Doctors already loaded, no need to fetch');
      }
    }
  }, [activeTab]);

  const fetchAppointments = async () => {
    setAppointmentsLoading(true);
    try {
      console.log('📋 Fetching patient appointments...');
      const appointmentsData = await appointmentService.getMyAppointments();
      console.log('✅ Appointments fetched:', appointmentsData);
      console.log('📊 Appointments count:', appointmentsData.length);
      console.log('📊 Appointments details:', appointmentsData.map(apt => ({
        id: apt._id,
        patient: apt.patient,
        doctor: apt.doctor,
        status: apt.status,
        scheduledDate: apt.scheduledDate
      })));
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('❌ Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setAppointmentsLoading(false);
    }
  };

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      let doctorsData: Doctor[] = [];
      
      console.log(`🔍 Fetching doctors for tab: ${activeTab}`);
      
      switch (activeTab) {
        case 'nearby':
      if (location?.pincode) {
            console.log('📍 Fetching doctors by pincode:', location.pincode);
            doctorsData = await appointmentService.getDoctorsByPincode(location.pincode);
      } else if (location?.latitude && location?.longitude) {
            console.log('📍 Fetching nearby doctors by coordinates:', {
              lat: location.latitude,
              lng: location.longitude,
              radius: searchRadius,
              accuracy: accuracy ? `${accuracy}m` : 'unknown'
            });
            doctorsData = await appointmentService.getNearbyDoctors({
          latitude: location.latitude,
              longitude: location.longitude,
              pincode: location.pincode,
              radius: searchRadius
            });
          } else {
            console.log('📍 No location data, fetching all doctors for nearby tab');
            doctorsData = await appointmentService.getAllDoctors();
          }
          break;
        case 'all':
          console.log('🌐 Fetching ALL doctors from database...');
          doctorsData = await appointmentService.getAllDoctors();
          console.log(`✅ All Doctors tab: Retrieved ${doctorsData.length} doctors`);
          break;
        case 'emergency':
          console.log('🚨 Fetching emergency doctors...');
          doctorsData = await appointmentService.getEmergencyDoctors();
          break;
        case 'saved':
          console.log('❤️ Fetching saved doctors...');
          doctorsData = await appointmentService.getSavedDoctors();
          break;
        case 'bookings':
          // This will be handled separately as it shows appointments, not doctors
          console.log('📅 Bookings tab - no doctors to fetch');
          break;
        case 'family':
          // This will be handled separately for family appointments
          console.log('👨‍👩‍👧‍👦 Family tab - no doctors to fetch');
          break;
        default:
          console.log('❓ Unknown tab, fetching all doctors');
          doctorsData = await appointmentService.getAllDoctors();
      }
      
      // Sort doctors based on selected criteria
      const sortedDoctors = [...doctorsData];
      switch (sortBy) {
        case 'distance':
          sortedDoctors.sort((a, b) => {
            const distA = (a as Doctor & { distance?: number }).distance || 999;
            const distB = (b as Doctor & { distance?: number }).distance || 999;
            return distA - distB;
          });
          break;
        case 'rating':
          sortedDoctors.sort((a, b) => b.ratings.average - a.ratings.average);
          break;
        case 'experience':
          sortedDoctors.sort((a, b) => b.experience - a.experience);
          break;
        case 'fee':
          sortedDoctors.sort((a, b) => {
            const feeA = (a as Doctor & { consultationFees?: { inPerson?: number } }).consultationFees?.inPerson || 0;
            const feeB = (b as Doctor & { consultationFees?: { inPerson?: number } }).consultationFees?.inPerson || 0;
            return feeA - feeB;
          });
          break;
        default:
          // Keep original order
          break;
      }
      
      setDoctors(sortedDoctors);
      console.log(`✅ Doctors loaded: ${sortedDoctors.length} total`);
      
      // Log distance information for nearby doctors
      if (activeTab === 'nearby' && location?.latitude && location?.longitude) {
        const doctorsWithDistance = sortedDoctors.filter(d => (d as Doctor & { distance?: number }).distance !== undefined);
        if (doctorsWithDistance.length > 0) {
          console.log('📍 Distance summary for nearby doctors:');
          doctorsWithDistance.forEach(doctor => {
            const distance = (doctor as Doctor & { distance?: number }).distance;
            if (distance !== undefined) {
              console.log(`  Dr. ${doctor.name}: ${distance.toFixed(2)}km`);
            }
          });
        }
      }
      
    } catch (error) {
      console.error('❌ Error fetching doctors:', error);
      // Fallback to empty array on error
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePincodeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const pincode = (e.currentTarget.elements.namedItem('pincode') as HTMLInputElement).value;
    setLocationByPincode(pincode);
  };

  const handleBookNow = async (doctor: Doctor | DoctorLite) => {
    try {
      // Fetch complete doctor profile with consultation fees
      const completeProfile = await appointmentService.getCompleteDoctorProfile(doctor._id);
      if (completeProfile) {
        setSelectedDoctor(completeProfile as Doctor | DoctorLite);
        setShowDoctorModal(true);
      } else {
        // Fallback to basic doctor data
        setSelectedDoctor(doctor);
        setShowDoctorModal(true);
      }
    } catch (error) {
      console.error('Error fetching complete doctor profile:', error);
      // Fallback to basic doctor data
      setSelectedDoctor(doctor);
      setShowDoctorModal(true);
    }
  };

  const handleViewProfile = async (doctor: Doctor | DoctorLite) => {
    navigate(`/doctors/${doctor._id}`);
  };

  const handleBookAppointment = async (doctor: Doctor | DoctorLite, slot: any, type: ConsultationType) => {
    try {
      const appointment = await appointmentService.bookAppointment(doctor._id, slot._id, type);
      setBookingDetails({ doctor, slot, type });
      setShowDoctorModal(false);
      setShowConfirmation(true);
      toast.success('Appointment booked successfully!');
      
      // IMPORTANT: Refresh the appointments list to show the new booking
      if (activeTab === 'bookings') {
        fetchAppointments();
      }
      
      // Also refresh if we're on a tab that shows appointments
      if (activeTab === 'all' || activeTab === 'nearby') {
        // Refresh doctors list to reflect updated availability
        fetchDoctors();
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error('Failed to book appointment');
    }
  };

  const handleJoinCall = async (appointmentId: string) => {
    try {
      console.log('🎥 Join Call clicked for appointment:', appointmentId);
      const roomUrl = await appointmentService.joinVideoConsultation(appointmentId);
      console.log('🎥 Opening video consultation at:', roomUrl);
      
      const consultationWindow = window.open(
        roomUrl || `/patient/video-consultation/${appointmentId}`,
        '_blank',
        'width=1280,height=720,noopener,noreferrer'
      );

      if (!consultationWindow) {
        toast.error('Please allow pop-ups to join video consultations');
      } else {
        toast.success('Opening video consultation...');
      }
    } catch (error) {
      console.error('❌ Error joining video consultation:', error);
      toast.error('Failed to join video consultation');
    }
  };

  const handleReschedule = (appointmentId: string) => {
    navigate(`/patient/appointments/${appointmentId}/reschedule`);
  };

  const handleCancel = async (appointmentId: string) => {
    try {
      await appointmentService.cancelAppointment(appointmentId);
      toast.success('Appointment cancelled successfully');
      fetchAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('Failed to cancel appointment');
    }
  };

  const handleShowReceipt = (appointment: Appointment) => {
    console.log('🔍 Generating receipt data for appointment:', appointment);
    
    // Convert appointment data to receipt format
    const patientObj = (typeof appointment.patient === 'object' ? appointment.patient : null) as any;
    const doctorObj = (typeof appointment.doctor === 'object' ? appointment.doctor : null) as any;
    const hospitalObj = (typeof appointment.hospital === 'object' ? appointment.hospital : null) as any;

    const receiptData = {
      appointmentId: (appointment as any)._id,
      appointmentNumber: appointment.appointmentNumber,
      scheduledDate: appointment.scheduledDate,
      scheduledTime: appointment.scheduledTime,
      consultationType: appointment.consultationType || 'online',
      doctor: {
        name: doctorObj ? `${doctorObj.firstName || ''} ${doctorObj.lastName || ''}`.trim() || 'Dr. Unknown' : 'Dr. Unknown',
        specialization: doctorObj?.specialization || '-',
        experience: doctorObj?.experience,
        languages: doctorObj?.languages,
        // Use doctor's location address if present; otherwise leave undefined
        location: doctorObj?.location ? { address: doctorObj.location.address || undefined } : undefined
      },
      // Patient details from populated patient - this should now have real data from database
      patient: {
        name: patientObj ? `${patientObj.firstName || ''} ${patientObj.lastName || ''}`.trim() || 'Patient' : 'Patient',
        email: patientObj?.email || '-',
        phone: patientObj?.phone || '-'
      },
      // Hospital details from populated hospital
      hospital: hospitalObj ? {
        name: hospitalObj.hospitalName || 'HealthSecure Hospital',
        address: hospitalObj.address || '-',
        phone: hospitalObj.phone || '+91-1800-123-4567',
        email: hospitalObj.email || 'support@healthsecure.com'
      } : {
        name: 'HealthSecure Hospital',
        address: '-',
        phone: '+91-1800-123-4567',
        email: 'support@healthsecure.com'
      },
      // Cost mapping: additionalCharges used as convenience fee
      cost: {
        consultationFee: appointment.cost?.consultationFee || 0,
        convenienceFee: appointment.cost?.additionalCharges || 0,
        totalAmount: appointment.cost?.totalAmount || 0
      },
      status: appointment.status,
      // Payment details from paymentData if available - this should have real Razorpay data
      paymentDetails: appointment.paymentData ? {
        orderId: (appointment.paymentData as any).orderId || '-',
        paymentId: (appointment.paymentData as any).paymentId || '-',
        razorpayPaymentId: (appointment.paymentData as any).paymentId || '-',
        amount: (appointment.paymentData as any).amount || appointment.cost?.totalAmount || 0,
        currency: (appointment.paymentData as any).currency || 'INR',
        status: appointment.paymentStatus || '-',
        paidAt: (appointment as any).updatedAt || (appointment as any).createdAt || new Date().toISOString()
      } : {
        // Fallback payment details if no paymentData
        orderId: '-',
        paymentId: '-',
        razorpayPaymentId: '-',
        amount: appointment.cost?.totalAmount || 0,
        currency: 'INR',
        status: appointment.paymentStatus || 'paid',
        paidAt: (appointment as any).updatedAt || (appointment as any).createdAt || new Date().toISOString()
      },
      verificationWarning: undefined
    } as any;

    console.log('🔍 Generated receipt data:', receiptData);
    setReceiptData(receiptData);
    setShowReceiptDialog(true);
  };

  // Helper functions for appointment display
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-health-success text-white';
      case 'completed':
        return 'bg-health-aqua text-white';
      case 'cancelled':
        return 'bg-health-danger text-white';
      case 'pending':
        return 'bg-health-warning text-white';
      default:
        return 'bg-health-blue-gray text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'pending':
        return <ClockIcon className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  const getConsultationTypeIcon = (type: string) => {
    return type === 'online' ? (
      <Video className="w-4 h-4 text-health-teal" />
    ) : (
      <MapPinIcon className="w-4 h-4 text-health-teal" />
    );
  };



  const handleAddToCalendar = () => {
    if (!bookingDetails) return;
    const { doctor, slot, type } = bookingDetails;
    const startTime = new Date(slot.startTime);
    const endTime = new Date(slot.endTime);
    const event = {
      title: `${type === 'online' ? 'Video' : 'In-Person'} Consultation with ${doctor.name}`,
      description: `${type === 'online' ? 'Video consultation' : 'In-person visit'} with ${doctor.name} (${doctor.specialization})`,
      location: type === 'online' ? 'Video Call' : doctor.location.address,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString()
    };
    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}&dates=${startTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
    window.open(googleUrl, '_blank');
  };

  // Filter and sort doctors
  const filteredAndSortedDoctors = doctors
    .filter(doctor => {
      const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doctor.hospital?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSpecialization = selectedSpecialization === 'all' || doctor.specialization === selectedSpecialization;
      const matchesRating = selectedRating === 'all' || 
                           (selectedRating === '4+' && doctor.ratings.average >= 4) ||
                           (selectedRating === '3+' && doctor.ratings.average >= 3);
      const matchesFee = selectedFee === 'all' ||
                        (selectedFee === 'low' && doctor.fees.online <= 500) ||
                        (selectedFee === 'medium' && doctor.fees.online > 500 && doctor.fees.online <= 1000) ||
                        (selectedFee === 'high' && doctor.fees.online > 1000);
      
      return matchesSearch && matchesSpecialization && matchesRating && matchesFee;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.ratings.average - a.ratings.average;
        case 'experience':
          return b.experience - a.experience;
        case 'fee':
          return a.fees.online - b.fees.online;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const renderDoctorList = () => {
    if (loading) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-health-teal mx-auto mb-4"></div>
          <p className="text-health-charcoal/60">Loading doctors...</p>
        </div>
      );
    }

    if (filteredAndSortedDoctors.length === 0) {
  return (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-health-charcoal/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-health-charcoal mb-2">No doctors found</h3>
          <p className="text-health-charcoal/60 mb-4">
            {activeTab === 'nearby' && locationError 
              ? 'Please enter your pincode to find nearby doctors'
              : 'Try adjusting your search criteria or filters'
            }
          </p>
          {activeTab === 'nearby' && locationError && (
            <form onSubmit={handlePincodeSubmit} className="max-w-sm mx-auto">
            <div className="flex gap-2">
              <Input
                name="pincode"
                placeholder="Enter pincode"
                className="flex-grow"
              />
              <Button type="submit">Find Doctors</Button>
            </div>
          </form>
          )}
        </div>
      );
    }

    return (
          <div className="space-y-4">
        {filteredAndSortedDoctors.map((doctor) => (
              <DoctorCard
                key={doctor._id}
                doctor={doctor}
                onBookNow={handleBookNow}
                onViewProfile={handleViewProfile}
              />
            ))}
          </div>
    );
  };

  const renderBookingsTab = () => {
    try {
      // SANITIZE: Clean up appointment data before processing
      const sanitizedAppointments = appointments.map(appointment => {
      // Create a clean copy to avoid mutating the original
      const cleanAppointment = { ...appointment };
      
      // Fix consultation type
      if (!cleanAppointment.consultationType) {
        console.warn('⚠️ Appointment missing consultation type:', cleanAppointment.appointmentNumber);
        cleanAppointment.consultationType = 'online'; // Default fallback
      }
      
      // Fix date format issues
      if (cleanAppointment.scheduledDate) {
        // Handle ISO date strings that might be malformed
        if (typeof cleanAppointment.scheduledDate === 'string') {
          // Remove any timezone info that might cause issues
          const dateOnly = cleanAppointment.scheduledDate.split('T')[0];
          if (dateOnly && dateOnly.match(/^\d{4}-\d{2}-\d{2}$/)) {
            cleanAppointment.scheduledDate = dateOnly;
          }
        }
      }
      
      // Fix time format issues
      if (cleanAppointment.scheduledTime) {
        // Ensure time is in HH:mm:ss format
        if (typeof cleanAppointment.scheduledTime === 'string') {
          const timeMatch = cleanAppointment.scheduledTime.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
          if (timeMatch) {
            const hours = timeMatch[1].padStart(2, '0');
            const minutes = timeMatch[2];
            const seconds = timeMatch[3] || '00';
            cleanAppointment.scheduledTime = `${hours}:${minutes}:${seconds}`;
          }
        }
      }
      
      return cleanAppointment;
    });

    // Filter appointments based on search and status
    const filteredAppointments = sanitizedAppointments.filter(appointment => {
      const doctorName = typeof appointment.doctor === 'object' ? 
        `${appointment.doctor.firstName} ${appointment.doctor.lastName}` : '';
      const doctorSpecialization = typeof appointment.doctor === 'object' ? 
        appointment.doctor.specialization : '';
      const hospitalName = typeof appointment.hospital === 'object' ? 
        appointment.hospital.hospitalName : '';

      const matchesSearch = appointmentSearchTerm === '' || 
        doctorName.toLowerCase().includes(appointmentSearchTerm.toLowerCase()) ||
        doctorSpecialization.toLowerCase().includes(appointmentSearchTerm.toLowerCase()) ||
        hospitalName.toLowerCase().includes(appointmentSearchTerm.toLowerCase()) ||
        appointment.appointmentNumber?.toLowerCase().includes(appointmentSearchTerm.toLowerCase());
      
      const matchesStatus = appointmentStatusFilter === 'all' || appointment.status === appointmentStatusFilter;
      
      // Debug consultation type
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Appointment consultation type debug:', {
          appointmentNumber: appointment.appointmentNumber,
          consultationType: appointment.consultationType,
          scheduledDate: appointment.scheduledDate,
          scheduledTime: appointment.scheduledTime,
          status: appointment.status
        });
      }
      
      return matchesSearch && matchesStatus;
    });

    // Separate upcoming and past appointments
    const upcomingAppointments = filteredAppointments.filter(
      a => {
        try {
          // Create a proper date object combining date and time
          let appointmentDateTime: Date;
          
          if (a.scheduledTime && a.scheduledDate) {
            // Validate the date string format
            const dateStr = a.scheduledDate;
            const timeStr = a.scheduledTime;
            
            // Check if date is valid
            if (!dateStr || dateStr === 'Invalid Date' || dateStr === 'null' || dateStr === 'undefined') {
              console.warn('⚠️ Invalid date for appointment:', a.appointmentNumber, dateStr);
              return false; // Skip invalid appointments
            }
            
            // Try to create a valid date
            const combinedDateTime = `${dateStr}T${timeStr}`;
            appointmentDateTime = new Date(combinedDateTime);
            
            // Check if the created date is valid
            if (isNaN(appointmentDateTime.getTime())) {
              console.warn('⚠️ Invalid datetime for appointment:', a.appointmentNumber, combinedDateTime);
              return false; // Skip invalid appointments
            }
          } else if (a.scheduledDate) {
            // If no time, use just the date (end of day)
            appointmentDateTime = new Date(a.scheduledDate);
            if (isNaN(appointmentDateTime.getTime())) {
              console.warn('⚠️ Invalid date for appointment:', a.appointmentNumber, a.scheduledDate);
              return false; // Skip invalid appointments
            }
            appointmentDateTime.setHours(23, 59, 59, 999);
          } else {
            console.warn('⚠️ Missing date for appointment:', a.appointmentNumber);
            return false; // Skip appointments without dates
          }
          
          const now = new Date();
          const isUpcoming = appointmentDateTime >= now;
          const isActiveStatus = ['pending', 'confirmed'].includes(a.status);
          
          console.log('🔍 Appointment date check:', {
            appointmentNumber: a.appointmentNumber,
            scheduledDate: a.scheduledDate,
            scheduledTime: a.scheduledTime,
            appointmentDateTime: appointmentDateTime.toISOString(),
            now: now.toISOString(),
            isUpcoming,
            isActiveStatus,
            status: a.status,
            consultationType: a.consultationType
          });
          
          return isUpcoming && isActiveStatus;
        } catch (error) {
          console.error('❌ Error processing appointment date:', a.appointmentNumber, error);
          return false; // Skip appointments with date processing errors
        }
      }
    );
    const pastAppointments = filteredAppointments.filter(
      a => {
        try {
          // Create a proper date object combining date and time
          let appointmentDateTime: Date;
          
          if (a.scheduledTime && a.scheduledDate) {
            // Validate the date string format
            const dateStr = a.scheduledDate;
            const timeStr = a.scheduledTime;
            
            // Check if date is valid
            if (!dateStr || dateStr === 'Invalid Date' || dateStr === 'null' || dateStr === 'undefined') {
              console.warn('⚠️ Invalid date for appointment:', a.appointmentNumber, dateStr);
              return false; // Skip invalid appointments
            }
            
            // Try to create a valid date
            const combinedDateTime = `${dateStr}T${timeStr}`;
            appointmentDateTime = new Date(combinedDateTime);
            
            // Check if the created date is valid
            if (isNaN(appointmentDateTime.getTime())) {
              console.warn('⚠️ Invalid datetime for appointment:', a.appointmentNumber, combinedDateTime);
              return false; // Skip invalid appointments
            }
          } else if (a.scheduledDate) {
            // If no time, use just the date (end of day)
            appointmentDateTime = new Date(a.scheduledDate);
            if (isNaN(appointmentDateTime.getTime())) {
              console.warn('⚠️ Invalid date for appointment:', a.appointmentNumber, a.scheduledDate);
              return false; // Skip invalid appointments
            }
            appointmentDateTime.setHours(23, 59, 59, 999);
          } else {
            console.warn('⚠️ Missing date for appointment:', a.appointmentNumber);
            return false; // Skip appointments without dates
          }
          
          const now = new Date();
          const isPast = appointmentDateTime < now;
          const isInactiveStatus = !['pending', 'confirmed'].includes(a.status);
          
          return isPast || isInactiveStatus;
        } catch (error) {
          console.error('❌ Error processing appointment date:', a.appointmentNumber, error);
          return false; // Skip appointments with date processing errors
        }
      }
    );

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'confirmed': return 'bg-health-success text-white';
        case 'completed': return 'bg-health-aqua text-white';
        case 'cancelled': return 'bg-health-danger text-white';
        case 'pending': return 'bg-health-warning text-white';
        default: return 'bg-health-blue-gray text-white';
      }
    };

    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'confirmed': return <CheckCircle className="w-4 h-4" />;
        case 'completed': return <CheckCircle className="w-4 h-4" />;
        case 'cancelled': return <XCircle className="w-4 h-4" />;
        case 'pending': return <ClockIcon className="w-4 h-4" />;
        default: return <ClockIcon className="w-4 h-4" />;
      }
    };

    const getConsultationTypeIcon = (type: string) => {
      return type === 'online' ? (
        <Video className="w-4 h-4 text-health-teal" />
      ) : (
        <MapPinIcon className="w-4 h-4 text-health-teal" />
      );
    };

    const getPaymentMethodText = (consultationType: string) => {
      return consultationType === 'online' ? 'Online Payment' : 'Offline Payment';
    };

    const getPaymentMethodIcon = (consultationType: string) => {
      return consultationType === 'online' ? (
        <CreditCard className="w-4 h-4 text-health-teal" />
      ) : (
        <Receipt className="w-4 h-4 text-health-teal" />
      );
    };

    // Calculate statistics
    const stats = {
      total: appointments.length,
      upcoming: upcomingAppointments.length,
      completed: appointments.filter(a => a.status === 'completed').length,
      cancelled: appointments.filter(a => a.status === 'cancelled').length,
      online: appointments.filter(a => a.consultationType === 'online').length,
      offline: appointments.filter(a => a.consultationType === 'in-person').length,
    };

    if (appointmentsLoading) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-health-teal mx-auto mb-4"></div>
          <p className="text-health-charcoal/60">Loading your appointments...</p>
        </div>
      );
    }

    if (appointments.length === 0) {
      return (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-health-charcoal/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-health-charcoal mb-2">My Bookings</h3>
          <p className="text-health-charcoal/60 mb-4">No appointments found. Book your first appointment to get started!</p>
                          <Button onClick={() => setSearchParams({ tab: 'all' })}>
            <BookOpen className="w-4 h-4 mr-2" />
            Book Appointment
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-health-charcoal">My Appointments</h1>
            <p className="text-health-blue-gray mt-1">Manage and track your healthcare appointments</p>
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={fetchAppointments} 
              variant="outline"
              disabled={appointmentsLoading}
              className="border-health-teal text-health-teal hover:bg-health-teal hover:text-white"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${appointmentsLoading ? 'animate-spin' : ''}`} />
              {appointmentsLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button 
              onClick={() => setSearchParams({ tab: 'all' })}
              className="bg-health-teal text-white hover:bg-health-aqua"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Book New
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
          <Card className="border-health-success/20 bg-health-success/5">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-health-success">{stats.upcoming}</div>
              <div className="text-sm text-health-blue-gray">Upcoming</div>
            </CardContent>
          </Card>
          <Card className="border-health-aqua/20 bg-health-aqua/5">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-health-aqua">{stats.completed}</div>
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
                  placeholder="Search by doctor, specialization, hospital, or appointment number..."
                  value={appointmentSearchTerm}
                  onChange={(e) => setAppointmentSearchTerm(e.target.value)}
                  className="pl-10 border-health-blue-gray/20 focus:border-health-teal"
                />
              </div>
              <div className="flex gap-2">
                <Select value={appointmentStatusFilter} onValueChange={setAppointmentStatusFilter}>
                  <SelectTrigger className="w-48 border-health-blue-gray/20 focus:border-health-teal">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  className="border-health-teal text-health-teal hover:bg-health-teal hover:text-white"
                >
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Upcoming and Past */}
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-health-light-gray">
            <TabsTrigger 
              value="upcoming" 
              className="data-[state=active]:bg-health-teal data-[state=active]:text-white"
            >
              Upcoming ({upcomingAppointments.length})
            </TabsTrigger>
            <TabsTrigger 
              value="past" 
              className="data-[state=active]:bg-health-teal data-[state=active]:text-white"
            >
              Past ({pastAppointments.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming" className="mt-6">
            {upcomingAppointments.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="w-16 h-16 text-health-blue-gray mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-health-charcoal mb-2">No upcoming appointments</h3>
                  <p className="text-health-blue-gray mb-4">Book your first appointment to get started!</p>
                  <Button 
                    onClick={() => setSearchParams({ tab: 'all' })} 
                    className="bg-health-teal text-white hover:bg-health-aqua"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Book Appointment
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <Card key={appointment._id} className="border border-gray-200 hover:border-health-teal/30 transition-all duration-200">
                    <CardContent className="p-6">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-health-teal/10 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-health-teal" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-health-charcoal">
                              {typeof appointment.doctor === 'object' ? 
                                `${appointment.doctor.firstName} ${appointment.doctor.lastName}` : 
                                'Doctor Name'
                              }
                            </h3>
                            <p className="text-health-blue-gray text-sm">
                              {typeof appointment.doctor === 'object' ? appointment.doctor.specialization : 'Specialization'}
                            </p>
                            <div className="flex items-center mt-1">
                              <MapPin className="w-3 h-3 text-health-blue-gray mr-1" />
                              <span className="text-xs text-health-blue-gray">
                                {typeof appointment.hospital === 'object' ? appointment.hospital.hospitalName : 'Hospital'}
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
                          <span className="text-sm">{new Date(appointment.scheduledDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center text-health-charcoal">
                          <Clock className="w-4 h-4 mr-2 text-health-teal" />
                          <span className="text-sm">{appointment.scheduledTime}</span>
                        </div>
                        <div className="flex items-center text-health-charcoal">
                          {getConsultationTypeIcon(appointment.consultationType || 'online')}
                          <span className="text-sm ml-2">
                            {appointment.consultationType === 'online' ? 'Video Consultation' : 'In-Person Visit'}
                          </span>
                        </div>
                      </div>

                      {/* Payment Info */}
                      {appointment.cost?.totalAmount && (
                        <div className="bg-health-light-gray p-3 rounded-lg mb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              {getPaymentMethodIcon(appointment.consultationType || 'online')}
                              <span className="text-sm font-medium text-health-charcoal ml-2">
                                {getPaymentMethodText(appointment.consultationType || 'online')}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold text-health-charcoal">
                                ₹{appointment.cost.totalAmount}
                              </div>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  appointment.paymentStatus === 'paid' 
                                    ? 'border-health-success text-health-success' 
                                    : 'border-health-warning text-health-warning'
                                }`}
                              >
                                {appointment.paymentStatus || 'pending'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      )}

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
                            View Details
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleShowReceipt(appointment)}
                            className="border-health-aqua text-health-aqua hover:bg-health-aqua hover:text-white"
                          >
                            <Receipt className="w-4 h-4 mr-1" />
                            Receipt
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-health-blue-gray text-health-blue-gray"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleReschedule(appointment._id)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Reschedule
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleShowReceipt(appointment)}>
                                <Receipt className="w-4 h-4 mr-2" />
                                View Receipt
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigator.share({ title: 'Appointment Details', text: `Appointment #${appointment.appointmentNumber}` })}>
                                <Share2 className="w-4 h-4 mr-2" />
                                Share Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleCancel(appointment._id)}
                                className="text-health-danger"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Cancel Appointment
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="flex space-x-2">
                          {appointment.consultationType === 'online' && (
                            <Button
                              className="bg-health-teal text-white hover:bg-health-aqua"
                              size="sm"
                            >
                              <Video className="w-4 h-4 mr-1" />
                              Join Call
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReschedule(appointment._id)}
                            className="border-health-teal text-health-teal hover:bg-health-teal hover:text-white"
                          >
                            Reschedule
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancel(appointment._id)}
                            className="border-health-danger text-health-danger hover:bg-health-danger hover:text-white"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-6">
            {pastAppointments.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-health-blue-gray mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-health-charcoal mb-2">No past appointments</h3>
                  <p className="text-health-blue-gray">Your appointment history will appear here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pastAppointments.map((appointment) => (
                  <Card key={appointment._id} className="border border-gray-200 hover:border-health-teal/30 transition-all duration-200">
                    <CardContent className="p-6">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-health-teal/10 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-health-teal" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-health-charcoal">
                              {typeof appointment.doctor === 'object' ? 
                                `${appointment.doctor.firstName} ${appointment.doctor.lastName}` : 
                                'Doctor Name'
                              }
                            </h3>
                            <p className="text-health-blue-gray text-sm">
                              {typeof appointment.doctor === 'object' ? appointment.doctor.specialization : 'Specialization'}
                            </p>
                            <div className="flex items-center mt-1">
                              <MapPin className="w-3 h-3 text-health-blue-gray mr-1" />
                              <span className="text-xs text-health-blue-gray">
                                {typeof appointment.hospital === 'object' ? appointment.hospital.hospitalName : 'Hospital'}
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
                          <span className="text-sm">{new Date(appointment.scheduledDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center text-health-charcoal">
                          <Clock className="w-4 h-4 mr-2 text-health-teal" />
                          <span className="text-sm">{appointment.scheduledTime}</span>
                        </div>
                        <div className="flex items-center text-health-charcoal">
                          {getConsultationTypeIcon(appointment.consultationType || 'online')}
                          <span className="text-sm ml-2">
                            {appointment.consultationType === 'online' ? 'Video Consultation' : 'In-Person Visit'}
                          </span>
                        </div>
                      </div>

                      {/* Payment Info */}
                      {appointment.cost?.totalAmount && (
                        <div className="bg-health-light-gray p-3 rounded-lg mb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <CreditCard className="w-4 h-4 text-health-teal mr-2" />
                              <span className="text-sm font-medium text-health-charcoal">Payment</span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold text-health-charcoal">
                                ₹{appointment.cost.totalAmount}
                              </div>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  appointment.paymentStatus === 'paid' 
                                    ? 'border-health-success text-health-success' 
                                    : 'border-health-warning text-health-warning'
                                }`}
                              >
                                {appointment.paymentStatus || 'pending'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="mt-4 flex justify-between items-center">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-health-teal text-health-teal hover:bg-health-teal hover:text-white"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-health-blue-gray text-health-blue-gray"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="flex space-x-2">
                          {appointment.status === 'completed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-health-aqua text-health-aqua hover:bg-health-aqua hover:text-white"
                            >
                              <Star className="w-4 h-4 mr-1" />
                              Rate & Review
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Past Appointments */}
        {pastAppointments.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-health-charcoal mb-4">Past Appointments</h3>
            <div className="space-y-4">
              {pastAppointments.map((appointment) => (
                <Card key={appointment._id} className="border-l-4 border-l-gray-300">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-semibold text-health-charcoal">
                            {typeof appointment.doctor === 'object' && appointment.doctor ? 
                              `${appointment.doctor.firstName} ${appointment.doctor.lastName}` : 
                              'Doctor Name'
                            }
                          </h4>
                          <Badge className={`${getStatusColor(appointment.status)} px-2 py-1 text-xs`}>
                            {getStatusIcon(appointment.status)}
                            <span className="ml-1">{appointment.status}</span>
                          </Badge>
                        </div>
                        <p className="text-health-charcoal/70 mb-2">
                          {typeof appointment.doctor === 'object' && appointment.doctor ? 
                            appointment.doctor.specialization : 
                            'Specialization'
                          }
                        </p>
                        <p className="text-sm text-health-charcoal/60 mb-3">
                          {typeof appointment.hospital === 'object' && appointment.hospital ? 
                            appointment.hospital.hospitalName : 
                            'Hospital'
                          }
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-health-charcoal/50" />
                            <span>{new Date(appointment.scheduledDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-health-charcoal/50" />
                            <span>{appointment.scheduledTime}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {appointment.consultationType === 'online' ? (
                              <Video className="w-4 h-4 text-health-charcoal/50" />
                            ) : (
                              <MapPinIcon className="w-4 h-4 text-health-charcoal/50" />
                            )}
                            <span>{appointment.consultationType === 'online' ? 'Video Consultation' : 'In-Person Visit'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-xs text-health-charcoal/50 mb-2">
                          #{appointment.appointmentNumber}
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleShowReceipt(appointment)}
                            className="border-health-aqua text-health-aqua hover:bg-health-aqua hover:text-white"
                          >
                            <Receipt className="w-4 h-4 mr-2" />
                            Receipt
                          </Button>
                          {appointment.status === 'completed' && (
                            <Button variant="outline" size="sm">
                              <Star className="w-4 h-4 mr-2" />
                              Rate & Review
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {filteredAppointments.length === 0 && appointments.length > 0 && (
          <div className="text-center py-8">
            <p className="text-health-charcoal/60">No appointments match your search criteria.</p>
          </div>
        )}
      </div>
    );
    } catch (error) {
      console.error('❌ Error rendering bookings tab:', error);
      return (
        <div className="text-center py-12">
          <AlertTriangle className="w-16 h-16 text-health-charcoal/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-health-charcoal mb-2">Error Loading Appointments</h3>
          <p className="text-health-charcoal/60 mb-4">There was an error loading your appointments. Please try refreshing the page.</p>
          <Button onClick={fetchAppointments} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      );
    }
  };

  const renderFamilyTab = () => {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 text-health-charcoal/30 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-health-charcoal mb-2">Family Appointments</h3>
        <p className="text-health-charcoal/60 mb-4">Book appointments for your family members</p>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Family Member
        </Button>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-3xl font-bold text-health-teal">Book Appointment</h1>
        </div>
        <p className="text-health-charcoal/70">Find and book appointments with healthcare professionals</p>
      </div>

      {/* Location Error Handler */}
      {locationError && activeTab === 'nearby' && (
        <Card className="mb-6 border-health-warning/20 bg-health-warning/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-health-warning" />
              <div>
                <h3 className="font-medium text-health-charcoal">Location Required</h3>
                <p className="text-sm text-health-charcoal/70">Please enter your pincode to find nearby doctors</p>
              </div>
            </div>
            <form onSubmit={handlePincodeSubmit} className="mt-3 max-w-sm">
              <div className="flex gap-2">
                <Input
                  name="pincode"
                  placeholder="Enter pincode"
                  className="flex-grow"
                />
                <Button type="submit" size="sm">Find Doctors</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
              <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="nearby" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span className="hidden sm:inline">Nearby</span>
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">All Doctors</span>
          </TabsTrigger>
          <TabsTrigger value="bookings" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">My Bookings</span>
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            <span className="hidden sm:inline">Saved</span>
          </TabsTrigger>
          <TabsTrigger value="emergency" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="hidden sm:inline">Emergency</span>
          </TabsTrigger>
          <TabsTrigger value="family" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Family</span>
          </TabsTrigger>
        </TabsList>

        {/* Search and Filters */}
        {(activeTab === 'nearby' || activeTab === 'all' || activeTab === 'emergency' || activeTab === 'saved') && (
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-health-charcoal/50 w-4 h-4" />
                  <Input
                    placeholder="Search doctors by name, specialization, or hospital..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
                    <SelectTrigger>
                      <SelectValue placeholder="Specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Specializations</SelectItem>
                      {specializations.map(spec => (
                        <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedRating} onValueChange={setSelectedRating}>
                    <SelectTrigger>
                      <SelectValue placeholder="Rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ratings</SelectItem>
                      <SelectItem value="4+">4+ Stars</SelectItem>
                      <SelectItem value="3+">3+ Stars</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedFee} onValueChange={setSelectedFee}>
                    <SelectTrigger>
                      <SelectValue placeholder="Fee Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Fees</SelectItem>
                      <SelectItem value="low">Under ₹500</SelectItem>
                      <SelectItem value="medium">₹500 - ₹1000</SelectItem>
                      <SelectItem value="high">Above ₹1000</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rating">Highest Rating</SelectItem>
                      <SelectItem value="experience">Most Experience</SelectItem>
                      <SelectItem value="fee">Lowest Fee</SelectItem>
                      <SelectItem value="name">Name A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Results Summary */}
                <div className="flex items-center justify-between text-sm text-health-charcoal/60">
                  <span>{filteredAndSortedDoctors.length} doctors found</span>
                  <Button variant="ghost" size="sm" onClick={fetchDoctors}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tab Content */}
        <TabsContent value="nearby" className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-health-teal" />
              <h2 className="text-xl font-semibold text-health-charcoal">
                {locationLoading ? 'Finding doctors near you...' : 'Nearby Doctors'}
              </h2>
              {location && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-health-teal border-health-teal">
                    {location.pincode || `${location.latitude?.toFixed(2)}, ${location.longitude?.toFixed(2)}`}
                  </Badge>
                  {accuracy && (
                    <Badge variant="secondary" className="text-xs">
                      ±{accuracy < 1000 ? `${accuracy}m` : `${(accuracy/1000).toFixed(1)}km`}
                    </Badge>
                  )}
                  {lastUpdated && (
                    <Badge variant="outline" className="text-xs text-health-blue-gray">
                      Updated: {lastUpdated.toLocaleTimeString()}
                    </Badge>
                  )}
                </div>
              )}
            </div>
            
            {/* Location Controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <label className="text-sm text-health-blue-gray">Radius:</label>
                <Select value={searchRadius.toString()} onValueChange={(value) => setSearchRadius(parseInt(value))}>
                  <SelectTrigger className="w-20 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1km</SelectItem>
                    <SelectItem value="2">2km</SelectItem>
                    <SelectItem value="5">5km</SelectItem>
                    <SelectItem value="10">10km</SelectItem>
                    <SelectItem value="20">20km</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshLocation}
                disabled={locationLoading}
                className="h-8 px-2"
              >
                <RefreshCw className={`w-4 h-4 ${locationLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          
          {/* Location Error Display */}
          {locationError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="w-5 h-5" />
                <div>
                  <p className="font-medium">Location Access Required</p>
                  <p className="text-sm">{locationError}</p>
                  <div className="mt-2 flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={refreshLocation}
                      className="h-8"
                    >
                      Try Again
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        const pincode = prompt('Enter your pincode:');
                        if (pincode) setLocationByPincode(pincode);
                      }}
                      className="h-8"
                    >
                      Enter Pincode
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {renderDoctorList()}
        </TabsContent>

        <TabsContent value="all" className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-health-teal" />
              <h2 className="text-xl font-semibold text-health-charcoal">All Doctors</h2>
              <Badge variant="outline" className="text-health-aqua border-health-aqua">
                {doctors.length} Available
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={async () => {
                  console.log('🧪 Testing database connection...');
                  const result = await appointmentService.testDatabaseConnection();
                  console.log('📊 Database test result:', result);
                  if (result.success) {
                    toast.success(`Database connected! Found ${result.databaseCount} doctors`);
                  } else {
                    toast.error(`Database error: ${result.error}`);
                  }
                }}
              >
                🧪 Test DB
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchDoctors}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Badge variant="secondary" className="text-xs">
                {activeTab === 'all' ? 'Database' : 'Cache'}
              </Badge>
            </div>
          </div>
          
          {/* Data Source Info */}
          <Card className="border-health-aqua/20 bg-health-aqua/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-health-charcoal/70">
                  <Globe className="w-4 h-4 text-health-aqua" />
                  <span>Showing all registered doctors from the HealthSecure database</span>
                  {loading && (
                    <Badge variant="outline" className="text-health-aqua border-health-aqua">
                      <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                      Loading...
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-health-charcoal/50">
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {renderDoctorList()}
        </TabsContent>

        <TabsContent value="bookings" className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-health-teal" />
              <h2 className="text-xl font-semibold text-health-charcoal">My Bookings</h2>
              <Badge variant="outline" className="text-health-teal border-health-teal">
                {appointments.length} Appointments
              </Badge>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchAppointments}
              disabled={appointmentsLoading}
              className="h-8 px-2"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${appointmentsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          {renderBookingsTab()}
        </TabsContent>

        <TabsContent value="saved" className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-health-teal" />
            <h2 className="text-xl font-semibold text-health-charcoal">Saved Doctors</h2>
            <Badge variant="outline" className="text-health-success border-health-success">
              {doctors.length} Saved
            </Badge>
          </div>
          {renderDoctorList()}
        </TabsContent>

        <TabsContent value="emergency" className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-health-warning" />
            <h2 className="text-xl font-semibold text-health-charcoal">Emergency Doctors</h2>
            <Badge variant="outline" className="text-health-warning border-health-warning">
              24/7 Available
            </Badge>
      </div>
          {renderDoctorList()}
        </TabsContent>

        <TabsContent value="family" className="space-y-6">
          {renderFamilyTab()}
        </TabsContent>
      </Tabs>

      {/* Enhanced Booking Modal */}
      <DoctorProfileModal
        doctor={selectedDoctor}
        open={showDoctorModal}
        onClose={() => setShowDoctorModal(false)}
        onBookAppointment={handleBookAppointment}
      />



      {/* Confirmation Modal */}
      {bookingDetails && (
        <ConfirmationModal
          open={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          doctor={bookingDetails.doctor}
          slot={bookingDetails.slot}
          type={bookingDetails.type}
          onAddToCalendar={handleAddToCalendar}
        />
      )}

      {/* Appointment Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-health-teal">Appointment Details</DialogTitle>
            <DialogDescription>
              Complete information about your appointment
            </DialogDescription>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="flex items-center justify-between p-4 bg-health-light-gray rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-health-teal rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {typeof selectedAppointment.doctor === 'object' && selectedAppointment.doctor ? 
                        `${selectedAppointment.doctor.firstName?.charAt(0)}${selectedAppointment.doctor.lastName?.charAt(0)}` : 
                        'DR'
                      }
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-health-charcoal">
                      {typeof selectedAppointment.doctor === 'object' && selectedAppointment.doctor ? 
                        `Dr. ${selectedAppointment.doctor.firstName} ${selectedAppointment.doctor.lastName}` : 
                        'Doctor Name'
                      }
                    </h3>
                    <p className="text-sm text-health-blue-gray">
                      {typeof selectedAppointment.doctor === 'object' && selectedAppointment.doctor ? 
                        selectedAppointment.doctor.specialization : 
                        'Specialization'
                      }
                    </p>
                  </div>
                </div>
                <Badge className={`${getStatusColor(selectedAppointment.status)}`}>
                  {selectedAppointment.status}
                </Badge>
              </div>

              {/* Appointment Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-health-blue-gray">Appointment ID</label>
                  <p className="text-health-charcoal">#{selectedAppointment.appointmentNumber}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-health-blue-gray">Consultation Type</label>
                  <div className="flex items-center">
                    {getConsultationTypeIcon(selectedAppointment.consultationType || 'online')}
                    <span className="ml-2 text-health-charcoal">
                      {selectedAppointment.consultationType === 'online' ? 'Video Consultation' : 'In-Person Visit'}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-health-blue-gray">Date</label>
                  <p className="text-health-charcoal">
                    {new Date(selectedAppointment.scheduledDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-health-blue-gray">Time</label>
                  <p className="text-health-charcoal">{selectedAppointment.scheduledTime}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-health-blue-gray">Hospital</label>
                  <p className="text-health-charcoal">
                    {typeof selectedAppointment.hospital === 'object' && selectedAppointment.hospital ? 
                      selectedAppointment.hospital.hospitalName : 
                      'Hospital Name'
                    }
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-health-blue-gray">Payment Status</label>
                  <Badge 
                    variant="outline" 
                    className={`${
                      selectedAppointment.paymentStatus === 'paid' 
                        ? 'border-health-success text-health-success' 
                        : 'border-health-warning text-health-warning'
                    }`}
                  >
                    {selectedAppointment.paymentStatus || 'pending'}
                  </Badge>
                </div>
              </div>

              {/* Payment Details */}
              {selectedAppointment.cost && (
                <div className="p-4 bg-health-light-gray rounded-lg">
                  <h4 className="font-medium text-health-charcoal mb-3">Payment Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-health-blue-gray">Consultation Fee</span>
                      <span className="text-health-charcoal">₹{selectedAppointment.cost.consultationFee}</span>
                    </div>
                    {selectedAppointment.cost.additionalCharges && (
                      <div className="flex justify-between">
                        <span className="text-health-blue-gray">Additional Charges</span>
                        <span className="text-health-charcoal">₹{selectedAppointment.cost.additionalCharges}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium border-t pt-2">
                      <span className="text-health-charcoal">Total Amount</span>
                      <span className="text-health-teal">₹{selectedAppointment.cost.totalAmount}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handleShowReceipt(selectedAppointment)}
                  className="border-health-aqua text-health-aqua hover:bg-health-aqua hover:text-white"
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  View Receipt
                </Button>
                {selectedAppointment.consultationType === 'online' && (
                  <Button
                    className="bg-health-teal text-white hover:bg-health-aqua"
                    onClick={() => handleJoinCall(selectedAppointment._id)}
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Join Call
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => handleReschedule(selectedAppointment._id)}
                  className="border-health-teal text-health-teal hover:bg-health-teal hover:text-white"
                >
                  Reschedule
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleCancel(selectedAppointment._id)}
                  className="border-health-danger text-health-danger hover:bg-health-danger hover:text-white"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      {receiptData && (
        <>
          {/* Render VideoConsultationReceipt for online consultations */}
          {receiptData.consultationType === 'online' ? (
            <VideoConsultationReceipt
              open={showReceiptDialog}
              data={receiptData}
              onClose={() => {
                setShowReceiptDialog(false);
                setReceiptData(null);
              }}
            />
          ) : (
            /* Render DetailedReceipt for in-person consultations */
            <DetailedReceipt
              open={showReceiptDialog}
              data={receiptData}
              onClose={() => {
                setShowReceiptDialog(false);
                setReceiptData(null);
              }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default PatientBookAppointment; 