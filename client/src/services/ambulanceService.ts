import api from '@/lib/api';

export interface AmbulanceService {
  _id: string;
  name: string;
  type: 'basic' | 'advanced' | 'cardiac' | 'neonatal' | 'trauma';
  available: boolean;
  contact: string;
  vehicleNumber: string;
  driver: {
    name: string;
    license: string;
    experience: number;
    contact: string;
  };
  equipment: string[];
  insuranceCovered: boolean;
  baseLocation: string;
  currentLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  responseTime: string;
  rating: number;
  reviews: number;
  price: {
    base: number;
    perKm: number;
    emergency: number;
  };
  capabilities: {
    oxygen: boolean;
    ventilator: boolean;
    cardiacMonitor: boolean;
    neonatal: boolean;
    bariatric: boolean;
    isolation: boolean;
    wheelchair: boolean;
    stretcher: boolean;
  };
  operatingHours: {
    start: string;
    end: string;
  };
  serviceAreas: string[];
  certifications: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface AmbulanceBooking {
  _id: string;
  bookingId: string;
  patient: string;
  ambulanceService: AmbulanceService;
  patientDetails: {
    name: string;
    age: string;
    weightKg: string;
    phone: string;
  };
  addresses: {
    pickup: string;
    dropoff: string;
  };
  emergencyDetails: {
    type: string;
    symptoms: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
  };
  medicalNeeds: {
    oxygen: boolean;
    ventilator: boolean;
    cardiacMonitor: boolean;
    neonatal: boolean;
    bariatric: boolean;
    isolation: boolean;
    wheelchair: boolean;
    stretcher: boolean;
  };
  scheduling: {
    type: 'immediate' | 'scheduled';
    scheduledDateTime?: string;
    estimatedDistance: number;
  };
  options: {
    shareLiveLocation: boolean;
    shareSms: boolean;
    notifyHospital: boolean;
    useInsurance: boolean;
  };
  insurance: {
    provider: string;
    memberId: string;
  };
  payment: {
    method: 'cash' | 'card' | 'insurance' | 'online';
    estimatedCost: number;
    finalCost?: number;
    status: 'pending' | 'paid' | 'failed' | 'refunded';
  };
  status: {
    current: 'pending' | 'confirmed' | 'dispatched' | 'en_route' | 'arrived' | 'in_transit' | 'completed' | 'cancelled';
    history: Array<{
      status: string;
      timestamp: string;
      note: string;
    }>;
  };
  driver: {
    assigned: boolean;
    contact: string;
    name: string;
    vehicleNumber: string;
  };
  tracking: {
    currentLocation?: {
      lat: number;
      lng: number;
      address: string;
    };
    estimatedArrival?: string;
    actualArrival?: string;
    pickupTime?: string;
    dropoffTime?: string;
  };
  notes: {
    patient: string;
    driver: string;
    admin: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BookingStats {
  total: number;
  pending: number;
  active: number;
  completed: number;
  cancelled: number;
  totalSpent: number;
}

export interface AmbulanceServicesResponse {
  success: boolean;
  data: AmbulanceService[];
  stats: {
    total: number;
    available: number;
    avgRating: number;
  };
}

export interface BookingResponse {
  success: boolean;
  data: AmbulanceBooking[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CostCalculationRequest {
  ambulanceServiceId: string;
  distance: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  medicalNeeds: {
    oxygen?: boolean;
    ventilator?: boolean;
    cardiacMonitor?: boolean;
    neonatal?: boolean;
    bariatric?: boolean;
    isolation?: boolean;
    wheelchair?: boolean;
    stretcher?: boolean;
  };
}

export interface CostCalculationResponse {
  success: boolean;
  data: {
    estimatedCost: number;
    breakdown: {
      base: number;
      distance: number;
      emergency: number;
      needs: number;
    };
  };
}

class AmbulanceService {
  // Get all ambulance services
  static async getServices(params?: {
    type?: string;
    available?: boolean;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<AmbulanceServicesResponse> {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.available !== undefined) queryParams.append('available', params.available.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await api.get(`/ambulance/services?${queryParams.toString()}`);
    return response.data;
  }

  // Get ambulance service by ID
  static async getServiceById(id: string): Promise<{ success: boolean; data: AmbulanceService }> {
    const response = await api.get(`/ambulance/services/${id}`);
    return response.data;
  }

  // Create ambulance booking
  static async createBooking(bookingData: {
    ambulanceServiceId: string;
    patientDetails: {
      name: string;
      age: string;
      weightKg: string;
      phone: string;
    };
    addresses: {
      pickup: string;
      dropoff: string;
    };
    emergencyDetails: {
      type: string;
      symptoms: string;
      urgency: 'low' | 'medium' | 'high' | 'critical';
    };
    medicalNeeds: {
      oxygen: boolean;
      ventilator: boolean;
      cardiacMonitor: boolean;
      neonatal: boolean;
      bariatric: boolean;
      isolation: boolean;
      wheelchair: boolean;
      stretcher: boolean;
    };
    scheduling: {
      type: 'immediate' | 'scheduled';
      scheduledDateTime?: string;
      estimatedDistance: number;
    };
    options: {
      shareLiveLocation: boolean;
      shareSms: boolean;
      notifyHospital: boolean;
      useInsurance: boolean;
    };
    insurance: {
      provider: string;
      memberId: string;
    };
    payment: {
      method: 'cash' | 'card' | 'insurance' | 'online';
    };
  }): Promise<{ success: boolean; message: string; data: AmbulanceBooking }> {
    const response = await api.post('/ambulance/bookings', bookingData);
    return response.data;
  }

  // Get user's bookings
  static async getUserBookings(params?: {
    status?: string;
    limit?: number;
    page?: number;
  }): Promise<BookingResponse> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.page) queryParams.append('page', params.page.toString());

    const response = await api.get(`/ambulance/bookings?${queryParams.toString()}`);
    return response.data;
  }

  // Get booking by ID
  static async getBookingById(id: string): Promise<{ success: boolean; data: AmbulanceBooking }> {
    const response = await api.get(`/ambulance/bookings/${id}`);
    return response.data;
  }

  // Cancel booking
  static async cancelBooking(id: string, reason?: string): Promise<{ success: boolean; message: string; data: AmbulanceBooking }> {
    const response = await api.delete(`/ambulance/bookings/${id}`, {
      data: { reason }
    });
    return response.data;
  }

  // Get booking statistics
  static async getBookingStats(): Promise<{ success: boolean; data: BookingStats }> {
    const response = await api.get('/ambulance/bookings/stats');
    return response.data;
  }

  // Calculate estimated cost
  static async calculateCost(request: CostCalculationRequest): Promise<CostCalculationResponse> {
    const response = await api.post('/ambulance/calculate-cost', request);
    return response.data;
  }
}

export default AmbulanceService;

