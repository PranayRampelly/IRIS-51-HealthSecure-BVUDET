export interface Doctor {
  _id: string;
  name: string;
  profilePhoto: string;
  specialization: string;
  experience: number;
  languages: string[];
  ratings: {
    average: number;
    count: number;
  };
  fees: {
    online: number;
    inPerson: number;
  };
  location: {
    address: string;
    coordinates: [number, number]; // [longitude, latitude]
    pincode: string;
  };
  availableSlots?: TimeSlot[];
  reviews?: Review[];
  // Additional properties from the enhanced system
  hospital?: string;
  department?: string;
  bio?: string;
  emergencyAvailable?: boolean;
  specialties?: string[];
  
  // New availability fields from DoctorAvailability model
  availability?: {
    isWorkingToday: boolean;
    startTime: string;
    endTime: string;
    appointmentDuration: number;
    workingDays: string[];
    status: 'available' | 'unavailable' | 'busy' | 'away';
    isOnline: boolean;
  };
  nextAvailableSlot?: string | null;
  totalAvailableSlots?: number;
  workingHoursSummary?: string;
  
  // Legacy fields for backward compatibility
  firstName?: string;
  lastName?: string;
  yearsOfExperience?: number;
  consultationFees?: {
    online: number;
    inPerson: number;
  };
  profileImage?: string;
  licenseNumber?: string;
  address?: string;
  profileComplete?: boolean;
  isActive?: boolean;
}

export interface TimeSlot {
  _id: string;
  doctorId: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  isBooked: boolean;
  consultationType: 'online' | 'in-person' | 'both';
  date?: string; // Date for the slot
  realTimeStatus?: 'available' | 'locked' | 'booked' | 'unavailable';
  lastUpdated?: string;
}

export interface Review {
  _id: string;
  doctorId: string;
  patientId: string;
  patientName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Appointment {
  _id: string;
  appointmentNumber: string;
  patient: string | {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  doctor: string | {
    _id: string;
    firstName: string;
    lastName: string;
    specialization: string;
    profileImage?: string;
  };
  hospital: string | {
    _id: string;
    hospitalName: string;
    firstName: string;
    lastName: string;
    address?: string | {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
    phone?: string;
    email?: string;
  };
  
  // Appointment details
  appointmentType: 'consultation' | 'emergency' | 'follow-up' | 'surgery' | 'lab-test' | 'imaging' | 'therapy';
  department: string;
  
  // Scheduling
  scheduledDate: string | Date;
  scheduledTime: string;
  estimatedDuration: number;
  
  // Status tracking
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show' | 'rescheduled';
  statusHistory: Array<{
    status: string;
    timestamp: Date;
    updatedBy: string;
    notes?: string;
  }>;
  
  // Hospital-specific fields
  room?: string;
  bed?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent' | 'emergency';
  
  // Patient information
  symptoms: string[];
  patientNotes?: string;
  doctorNotes?: string;
  
  // Patient vitals
  patientVitals?: {
    bloodPressure?: string;
    heartRate?: string;
    temperature?: string;
    weight?: string;
    height?: string;
  };
  
  // Payment and insurance
  paymentStatus: 'pending' | 'paid' | 'partial' | 'waived' | 'insurance-pending';
  cost: {
    consultationFee: number;
    additionalCharges: number;
    totalAmount: number;
  };
  
  // Emergency information
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  
  // Follow-up
  followUpRequired: boolean;
  followUpDate?: Date;
  
  // Additional fields from backend
  bookingSource?: string;
  emergencyPriority?: string;
  preferredLanguage?: string;
  termsAccepted?: boolean;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  
  // Legacy fields for backward compatibility
  doctorId?: string;
  patientId?: string;
  slotId?: string;
  consultationType: 'online' | 'in-person';
  bookingDate?: string;
  appointmentDate?: string;
  videoCallLink?: string;
  documents?: {
    name: string;
    url: string;
  }[];
  rating?: {
    value: number;
    comment: string;
  };
  paymentData?: {
    orderId: string;
    amount: number;
    currency: string;
    key: string;
    paymentId: string;
  };
}

export interface Location {
  latitude: number;
  longitude: number;
  pincode?: string;
}

export type ConsultationType = 'online' | 'in-person';
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'; 