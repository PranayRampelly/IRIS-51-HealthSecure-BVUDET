import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Ambulance, Phone, MapPin, Clock, Star, Filter, Search,
  Navigation, Info, Heart, Shield, Users, Calendar,
  CheckCircle, XCircle, AlertTriangle, Plus, Truck, User,
  MessageSquare, Bell, Radio, Zap, Target, Activity
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import AmbulanceServiceAPI, { type AmbulanceService as AmbulanceServiceType, type AmbulanceBooking as AmbulanceBookingType } from '@/services/ambulanceService';
import { useToast } from '@/hooks/use-toast';

// Add Leaflet imports for mapping
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';
type ScheduleType = 'now' | 'scheduled';
type PaymentMethod = 'cash' | 'card' | 'upi' | 'insurance';

interface BookingForm {
  patientName: string;
  patientAge: string;
  weightKg: string;
  phone: string;
  address: string;
  pickupAddress: string;
  dropoffAddress: string;
  emergencyType: string;
  symptoms: string;
  urgency: UrgencyLevel;
  ambulanceType: string;
  attendants: number;
  scheduleType: ScheduleType;
  scheduledDateTime: string;
  shareLiveLocation: boolean;
  shareSms: string;
  notifyHospital: boolean;
  useInsurance: boolean;
  insuranceProvider: string;
  memberId: string;
  paymentMethod: PaymentMethod;
  needs: {
    oxygen: boolean;
    ventilator: boolean;
    cardiacMonitor: boolean;
    neonatal: boolean;
    bariatric: boolean;
    isolation: boolean;
    wheelchair: boolean;
    stretcher: boolean;
  };
}

// Using imported types from the service
type AmbulanceService = AmbulanceServiceType;
type BookingRequest = AmbulanceBookingType;

const BookAmbulance = () => {
  const { toast } = useToast();
  const [ambulanceServices, setAmbulanceServices] = useState<AmbulanceService[]>([]);
  const [filteredServices, setFilteredServices] = useState<AmbulanceService[]>([]);
  const [selectedService, setSelectedService] = useState<AmbulanceService | null>(null);
  const [showServiceDialog, setShowServiceDialog] = useState(false);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('rating');
  const [activeTab, setActiveTab] = useState('services');
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [isBooking, setIsBooking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Booking form state
  const initialBookingForm: BookingForm = {
    patientName: '',
    patientAge: '',
    weightKg: '',
    phone: '',
    address: '',
    pickupAddress: '',
    dropoffAddress: '',
    emergencyType: '',
    symptoms: '',
    urgency: 'medium',
    ambulanceType: '',
    attendants: 0,
    scheduleType: 'now',
    scheduledDateTime: '',
    shareLiveLocation: true,
    shareSms: '',
    notifyHospital: true,
    useInsurance: false,
    insuranceProvider: '',
    memberId: '',
    paymentMethod: 'cash',
    needs: {
      oxygen: false,
      ventilator: false,
      cardiacMonitor: false,
      neonatal: false,
      bariatric: false,
      isolation: false,
      wheelchair: false,
      stretcher: true,
    },
  };
  const [bookingForm, setBookingForm] = useState<BookingForm>(initialBookingForm);

  const [savedAddresses] = useState<Array<{ label: string; address: string }>>([
    { label: 'Home', address: '123 Main St, City Center' },
    { label: 'Work', address: '42 Industrial Park, Phase 2' },
    { label: 'Family', address: '9 Elm Avenue, Lakeside' },
  ]);

  const [estimatedDistanceKm, setEstimatedDistanceKm] = useState<number>(5);
  const [viewMode, setViewMode] = useState<'list' | 'compact'>('list');

  // Tracking state
  const [selectedBookingForTracking, setSelectedBookingForTracking] = useState<BookingRequest | null>(null);
  const [showTrackingDialog, setShowTrackingDialog] = useState(false);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [ambulanceMarker, setAmbulanceMarker] = useState<L.Marker | null>(null);
  const [routePolyline, setRoutePolyline] = useState<L.Polyline | null>(null);
  const [trackingInterval, setTrackingInterval] = useState<NodeJS.Timeout | null>(null);
  const [patientLocation, setPatientLocation] = useState<[number, number] | null>(null);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [pickupMarkerRef, setPickupMarkerRef] = useState<L.Marker | null>(null);
  const [geoWatchId, setGeoWatchId] = useState<number | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [pickupAccuracyCircleRef, setPickupAccuracyCircleRef] = useState<L.Circle | null>(null);
  const [locationSamples, setLocationSamples] = useState<Array<{ lat: number; lng: number; accuracy: number; ts: number }>>([]);

  // Leaflet map container id and guard to avoid reuse
  const [mapContainerId, setMapContainerId] = useState<string>('tracking-map');
  const mapInitGuardRef = React.useRef<boolean>(false);

  const stats = (() => {
    const total = filteredServices.length;
    const available = filteredServices.filter(s => s.available).length;
    const avgRating = total ? (filteredServices.reduce((acc, s) => acc + s.rating, 0) / total).toFixed(1) : '0.0';
    return { total, available, avgRating };
  })();

  // Load ambulance services from API
  useEffect(() => {
    const loadAmbulanceServices = async () => {
      try {
        setLoading(true);
        const response = await AmbulanceServiceAPI.getServices();
        if (response.success) {
          setAmbulanceServices(response.data as unknown as AmbulanceService[]);
          setFilteredServices(response.data as unknown as AmbulanceService[]);
        } else {
          setError('Failed to load ambulance services');
        }
      } catch (err) {
        setError('Error loading ambulance services');
        console.error('Error loading ambulance services:', err);
        // Fallback to mock data for development
        const mockServices = [
          {
            _id: '1',
            name: 'City Emergency Ambulance',
            type: 'advanced' as const,
            available: true,
            contact: '+1-555-0201',
            vehicleNumber: 'AMB-001',
            driver: { name: 'John Smith', license: 'DL-123456', experience: 8, contact: '+1-555-0201' },
            equipment: ['Defibrillator', 'Ventilator', 'ECG Monitor', 'Oxygen', 'IV Supplies'],
            insuranceCovered: true,
            baseLocation: 'Downtown Station',
            currentLocation: { lat: 40.7128, lng: -74.0060, address: 'Downtown Station, Main St' },
            responseTime: '8-12 minutes',
            rating: 4.8,
            reviews: 156,
            price: { base: 150, perKm: 5, emergency: 200 },
            capabilities: { oxygen: true, ventilator: true, cardiacMonitor: true, neonatal: false, bariatric: true, isolation: true, wheelchair: true, stretcher: true },
            operatingHours: { start: '00:00', end: '23:59' },
            serviceAreas: ['Downtown', 'Midtown'],
            certifications: ['ALS Certified', 'Paramedic Crew'],
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        setAmbulanceServices(mockServices);
        setFilteredServices(mockServices);
      } finally {
        setLoading(false);
      }
    };

    loadAmbulanceServices();
  }, []);

  // Load user bookings
  useEffect(() => {
    const loadUserBookings = async () => {
      try {
        const response = await AmbulanceServiceAPI.getUserBookings();
        if (response.success) {
          setBookingRequests(response.data);
        }
      } catch (err) {
        console.error('Error loading user bookings:', err);
        // Fallback to empty array
        setBookingRequests([]);
      }
    };

    loadUserBookings();
  }, []);

  useEffect(() => {
    let filtered = ambulanceServices;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.driver.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filter
    if (selectedType && selectedType !== 'all') {
      filtered = filtered.filter(service => service.type === selectedType);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'price':
          return a.price.base - b.price.base;
        case 'responseTime':
          return a.responseTime.localeCompare(b.responseTime);
        default:
          return b.rating - a.rating;
      }
    });

    setFilteredServices(filtered);
  }, [ambulanceServices, searchQuery, selectedType, sortBy]);

  // Auto-get location when booking dialog opens
  useEffect(() => {
    if (showBookingDialog && locationPermission === 'prompt') {
      handleLocationPermission();
    }
  }, [showBookingDialog, locationPermission]);

  const handleAmbulanceCall = (contact: string) => {
    window.open(`tel:${contact}`, '_self');
  };

  const handleBookAmbulance = (service: AmbulanceService) => {
    setSelectedService(service);
    setBookingForm(prev => ({
      ...prev,
      ambulanceType: service.type
    }));
    setShowBookingDialog(true);
  };

  // Get patient's current location using Geolocation API
  const getPatientLocation = (): Promise<[number, number]> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      setIsGettingLocation(true);
      setIsCalibrating(true);
      setLocationSamples([]);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location: [number, number] = [latitude, longitude];

          setPatientLocation(location);
          setLocationPermission('granted');
          setIsGettingLocation(false);
          setIsCalibrating(false);
          setGpsAccuracy(position.coords.accuracy ?? null);

          console.log('Patient location obtained:', location);
          resolve(location);
        },
        (error) => {
          setIsGettingLocation(false);
          setIsCalibrating(false);
          console.error('Error getting location:', error);

          switch (error.code) {
            case error.PERMISSION_DENIED:
              setLocationPermission('denied');
              reject(new Error('Location permission denied. Please enable location access.'));
              break;
            case error.POSITION_UNAVAILABLE:
              reject(new Error('Location information unavailable.'));
              break;
            case error.TIMEOUT:
              reject(new Error('Location request timed out.'));
              break;
            default:
              reject(new Error('Unknown error getting location.'));
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0 // force fresh fix
        }
      );
    });
  };

  // Auto-get location when booking dialog opens
  const handleLocationPermission = async () => {
    if (locationPermission === 'denied') {
      toast({
        title: "Location Access Required",
        description: "Please enable location access in your browser settings to use live location pickup.",
        variant: "destructive"
      });
      return;
    }

    try {
      const location = await getPatientLocation();
      // Update pickup address with current location
      setBookingForm(prev => ({
        ...prev,
        pickupAddress: `Live Location: ${location[0].toFixed(6)}, ${location[1].toFixed(6)}`
      }));

      toast({
        title: "Location Updated",
        description: "Your current location has been set as pickup point.",
      });
    } catch (error) {
      toast({
        title: "Location Error",
        description: error instanceof Error ? error.message : "Failed to get location",
        variant: "destructive"
      });
    }
  };

  const handleSubmitBooking = async () => {
    if (!selectedService) return;

    setIsBooking(true);

    try {
      const bookingData = {
        ambulanceServiceId: selectedService._id,
        patientDetails: {
          name: bookingForm.patientName,
          age: bookingForm.patientAge,
          weightKg: bookingForm.weightKg,
          phone: bookingForm.phone
        },
        addresses: {
          pickup: bookingForm.pickupAddress || bookingForm.address,
          dropoff: bookingForm.dropoffAddress
        },
        emergencyDetails: {
          type: bookingForm.emergencyType,
          symptoms: bookingForm.symptoms,
          urgency: bookingForm.urgency
        },
        medicalNeeds: bookingForm.needs,
        scheduling: {
          type: bookingForm.scheduleType === 'now' ? 'immediate' : 'scheduled',
          scheduledDateTime: bookingForm.scheduledDateTime,
          estimatedDistance: estimatedDistanceKm
        },
        options: {
          shareLiveLocation: bookingForm.shareLiveLocation,
          shareSms: bookingForm.shareSms === 'yes',
          notifyHospital: bookingForm.notifyHospital,
          useInsurance: bookingForm.useInsurance
        },
        insurance: {
          provider: bookingForm.insuranceProvider,
          memberId: bookingForm.memberId
        },
        payment: {
          method: bookingForm.paymentMethod
        }
      };

      const response = await AmbulanceServiceAPI.createBooking(bookingData as any);

      if (response.success) {
        setBookingRequests(prev => [response.data, ...prev]);
        setShowBookingDialog(false);
        setActiveTab('bookings');
        setBookingForm(initialBookingForm);
        toast({
          title: "Booking Created",
          description: "Your ambulance booking has been created successfully!",
          variant: "default",
        });
      } else {
        setError('Failed to create booking');
        toast({
          title: "Error",
          description: "Failed to create booking. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Error creating booking:', err);
      setError('Error creating booking');
    } finally {
      setIsBooking(false);
    }
  };

  const getAmbulanceTypeColor = (type: string) => {
    switch (type) {
      case 'advanced': return 'bg-health-success';
      case 'cardiac': return 'bg-health-danger';
      case 'neonatal': return 'bg-health-warning';
      case 'trauma': return 'bg-health-teal';
      default: return 'bg-health-blue-gray';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-health-danger';
      case 'high': return 'bg-health-warning';
      case 'medium': return 'bg-health-aqua';
      case 'low': return 'bg-health-success';
      default: return 'bg-health-blue-gray';
    }
  };

  // Tracking functions
  const initializeMap = (containerId: string, center: [number, number] = [20.5937, 78.9629]) => {
    // If an instance exists in state, remove it first
    if (mapInstance) {
      try { mapInstance.remove(); } catch { }
    }

    // Ensure the DOM container is clean (avoid "Map container is being reused" errors)
    const container = document.getElementById(containerId);
    if (container && (container as any)._leaflet_id) {
      // Replace the container with a fresh clone that preserves attributes (including id)
      const clone = container.cloneNode(false) as HTMLElement;
      container.parentNode?.replaceChild(clone, container);
    }

    const map = L.map(containerId).setView(center, 13);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    setMapInstance(map);
    return map;
  };

  const startTracking = (booking: BookingRequest) => {
    // Clean up previous map instance
    if (mapInstance) {
      try { mapInstance.remove(); } catch { }
      setMapInstance(null);
    }
    if (ambulanceMarker) {
      try { ambulanceMarker.remove(); } catch { }
      setAmbulanceMarker(null);
    }
    if (routePolyline) {
      try { routePolyline.remove(); } catch { }
      setRoutePolyline(null);
    }

    setSelectedBookingForTracking(booking);
    setShowTrackingDialog(true);
  };

  // Start watching patient's live location and update pickup marker/route
  const startLiveLocationWatch = (map: L.Map) => {
    if (!navigator.geolocation) return;
    // Clear any previous watch first
    if (geoWatchId !== null) {
      navigator.geolocation.clearWatch(geoWatchId);
      setGeoWatchId(null);
    }

    setIsCalibrating(true);
    setLocationSamples([]);

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const newLocation: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        const accuracy = pos.coords.accuracy ?? 9999;
        setGpsAccuracy(accuracy);

        // Keep a rolling window of the last 8 samples (10 sec typical)
        setLocationSamples((prev) => {
          const updated = [...prev, { lat: newLocation[0], lng: newLocation[1], accuracy, ts: Date.now() }];
          return updated.slice(-8);
        });

        // Compute weighted average by inverse accuracy (more accurate = higher weight)
        const samples = [...locationSamples, { lat: newLocation[0], lng: newLocation[1], accuracy, ts: Date.now() }].slice(-8);
        let sumW = 0;
        let sumLat = 0;
        let sumLng = 0;
        samples.forEach(s => {
          const w = 1 / Math.max(s.accuracy, 1);
          sumW += w;
          sumLat += s.lat * w;
          sumLng += s.lng * w;
        });
        const filteredLat = sumLat / (sumW || 1);
        const filteredLng = sumLng / (sumW || 1);

        const filteredLocation: [number, number] = [filteredLat, filteredLng];
        setPatientLocation(filteredLocation);

        // Update pickup marker position (prefer map-attached ref to avoid stale state closures)
        const markerRef: L.Marker | null = ((map as any)._pickupMarkerRef as L.Marker) || pickupMarkerRef;
        if (markerRef) {
          markerRef.setLatLng(filteredLocation as any);
        }

        // Update accuracy circle
        const circleRef: L.Circle | null = ((map as any)._pickupAccuracyCircleRef as L.Circle) || pickupAccuracyCircleRef;
        if (circleRef) {
          circleRef.setLatLng(filteredLocation as any);
          circleRef.setRadius(Math.max(accuracy, 10));
        } else if (map) {
          const circle = L.circle(filteredLocation as any, {
            radius: Math.max(accuracy, 10),
            color: '#10b981',
            fillColor: '#10b981',
            fillOpacity: 0.15,
            weight: 1
          }).addTo(map);
          setPickupAccuracyCircleRef(circle);
          (map as any)._pickupAccuracyCircleRef = circle;
        }

        // Recompute and redraw route if possible
        if (routePolyline) {
          // Keep ambulance and dropoff points the same; update first point to new pickup
          const latlngs = routePolyline.getLatLngs() as any[];
          if (latlngs && latlngs.length >= 3) {
            const updated = [L.latLng(filteredLocation[0], filteredLocation[1]), latlngs[1], latlngs[2]] as any;
            routePolyline.setLatLngs(updated);
          }
        }

        // Keep map view centered lightly around new location
        map.panTo(filteredLocation as any);

        // Stop calibrating once accuracy is good
        if (accuracy <= 20) {
          setIsCalibrating(false);
        }
      },
      (err) => {
        console.warn('Live location watch error:', err);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
    );

    setGeoWatchId(id);
  };

  const stopLiveLocationWatch = () => {
    if (geoWatchId !== null) {
      navigator.geolocation.clearWatch(geoWatchId);
      setGeoWatchId(null);
    }
    if (pickupAccuracyCircleRef) {
      pickupAccuracyCircleRef.remove();
      setPickupAccuracyCircleRef(null);
    }
  };

  // Initialize map when tracking dialog opens
  useEffect(() => {
    console.log('Tracking dialog effect triggered:', { showTrackingDialog, selectedBookingForTracking });

    if (showTrackingDialog && selectedBookingForTracking) {
      console.log('Starting map initialization...');

      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        console.log('Creating map instance...');

        // Use a unique container id to avoid reuse
        const freshId = `tracking-map-${Date.now()}`;
        const host = document.getElementById('tracking-map');
        if (host) {
          host.id = freshId;
        }
        // Ensure no previous Leaflet map attached to host
        const hostNode = document.getElementById(freshId);
        if (hostNode && (hostNode as any)._leaflet_id) {
          const clone = hostNode.cloneNode(false) as HTMLElement;
          hostNode.parentNode?.replaceChild(clone, hostNode);
        }
        const map = initializeMap(freshId);
        console.log('Map instance created:', map);

        if (map && selectedBookingForTracking) {
          // Set the map instance state first
          setMapInstance(map);
          console.log('Map instance state set, calling simulateAmbulanceMovement...');

          // Center map on patient location if available, otherwise use default
          if (patientLocation) {
            // Use slightly higher zoom for precision once GPS is good
            const zoom = gpsAccuracy && gpsAccuracy <= 30 ? 16 : 13;
            map.setView(patientLocation, zoom as any);
            console.log('Map centered on patient location:', patientLocation, 'zoom', zoom);
          }

          // Pass the map directly to avoid state timing issues
          simulateAmbulanceMovementWithMap(selectedBookingForTracking, map);
          // Begin watching live location and reflect on map
          startLiveLocationWatch(map);

          // Also add a simple test marker immediately to verify map is working
          const testMarker = L.marker([19.0760, 72.8777], {
            icon: L.divIcon({
              html: '<div style="background: #ff0000; color: white; padding: 20px; border-radius: 50%; font-size: 28px; border: 4px solid white; font-weight: bold; box-shadow: 0 8px 24px rgba(0,0,0,0.8);">TEST</div>',
              iconSize: [80, 80],
              iconAnchor: [40, 40]
            })
          }).addTo(map);
          console.log('Immediate test marker added:', testMarker);
        } else {
          console.log('Map or booking not ready:', { map: !!map, booking: !!selectedBookingForTracking });
        }
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [showTrackingDialog, selectedBookingForTracking]);

  // Add custom CSS for map
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      #tracking-map {
        width: 100% !important;
        height: 100% !important;
        min-height: 384px !important;
        z-index: 1;
      }
      .leaflet-container {
        width: 100% !important;
        height: 100% !important;
        min-height: 384px !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try { if (mapInstance) { mapInstance.off(); mapInstance.remove(); } } catch { }
      try { if (ambulanceMarker) { ambulanceMarker.remove(); } } catch { }
      try { if (routePolyline) { routePolyline.remove(); } } catch { }
    };
  }, [mapInstance, ambulanceMarker, routePolyline]);

  const stopTracking = () => {
    stopLiveLocationWatch();
    if (trackingInterval) {
      clearInterval(trackingInterval);
      setTrackingInterval(null);
    }
    if (ambulanceMarker) {
      try { ambulanceMarker.remove(); } catch { }
      setAmbulanceMarker(null);
    }
    if (routePolyline) {
      try { routePolyline.remove(); } catch { }
      setRoutePolyline(null);
    }
    if (mapInstance) {
      try { mapInstance.off(); mapInstance.remove(); } catch { }
      setMapInstance(null);
    }
    setSelectedBookingForTracking(null);
    setShowTrackingDialog(false);
  };

  const simulateAmbulanceMovementWithMap = (booking: BookingRequest, map: any) => {
    console.log('=== simulateAmbulanceMovementWithMap START ===');
    console.log('map parameter:', map);
    console.log('booking:', booking);

    if (!map || !booking) {
      console.log('Early return - missing map or booking');
      return;
    }

    console.log('Using map instance:', map);

    console.log('Adding markers to map:', map);

    // Create ambulance icon - make it HUGE and very visible
    const ambulanceIcon = L.divIcon({
      className: 'ambulance-marker',
      html: '<div style="background: #ef4444; color: white; padding: 20px; border-radius: 50%; font-size: 36px; border: 4px solid white; box-shadow: 0 8px 24px rgba(0,0,0,0.8); z-index: 1000; font-weight: bold;">🚑</div>',
      iconSize: [80, 80],
      iconAnchor: [40, 40]
    });

    // Remove existing marker
    if (ambulanceMarker) {
      ambulanceMarker.remove();
    }

    // Use real patient location if available, otherwise fallback to Mumbai coordinates
    let pickupLat: number, pickupLng: number;

    if (patientLocation) {
      // Use real patient location
      [pickupLat, pickupLng] = patientLocation;
      console.log('Using REAL patient location for pickup:', patientLocation);
    } else {
      // Fallback to Mumbai coordinates
      pickupLat = 19.0760;  // Mumbai
      pickupLng = 72.8777;
      console.log('Using fallback Mumbai coordinates for pickup');
    }

    const dropoffLat = 19.2183; // Thane
    const dropoffLng = 72.9781;

    // Make coordinates more spread out for better map view
    // IMPORTANT: do not offset real patient location; use exact coordinates for pickup
    const spreadFactor = 0.05; // Increase distance between points (used only for static demo coords)
    const adjustedPickupLat = patientLocation ? pickupLat : pickupLat - spreadFactor;
    const adjustedPickupLng = patientLocation ? pickupLng : pickupLng - spreadFactor;
    const adjustedDropoffLat = dropoffLat + spreadFactor;
    const adjustedDropoffLng = dropoffLng + spreadFactor;

    // Add new marker at ambulance location (between pickup and dropoff)
    const ambulanceLat = (adjustedPickupLat + adjustedDropoffLat) / 2;
    const ambulanceLng = (adjustedPickupLng + adjustedDropoffLng) / 2;

    const marker = L.marker([ambulanceLat, ambulanceLng], { icon: ambulanceIcon }).addTo(map);
    console.log('Ambulance marker added at:', [ambulanceLat, ambulanceLng]);

    setAmbulanceMarker(marker);

    // Add pickup and dropoff markers - make them HUGE and very visible
    const pickupIcon = L.divIcon({
      className: 'pickup-marker',
      html: '<div style="background: #10b981; color: white; padding: 18px; border-radius: 50%; font-size: 32px; border: 4px solid white; box-shadow: 0 8px 24px rgba(0,0,0,0.8); z-index: 1000; font-weight: bold;">📍</div>',
      iconSize: [72, 72],
      iconAnchor: [36, 36]
    });

    const dropoffIcon = L.divIcon({
      className: 'dropoff-marker',
      html: '<div style="background: #3b82ff; color: white; padding: 18px; border-radius: 50%; font-size: 32px; border: 4px solid white; box-shadow: 0 8px 24px rgba(0,0,0,0.8); z-index: 1000; font-weight: bold;">🏥</div>',
      iconSize: [72, 72],
      iconAnchor: [36, 36]
    });

    // Add pickup marker
    const pickupMarker = L.marker([adjustedPickupLat, adjustedPickupLng], {
      icon: pickupIcon,
      zIndexOffset: 1000
    }).addTo(map);
    pickupMarker.bindPopup('<strong>Pickup Location</strong><br>' + booking.addresses.pickup);
    console.log('Pickup marker added at:', [adjustedPickupLat, adjustedPickupLng]);
    console.log('Pickup marker on map:', map.hasLayer(pickupMarker));
    // Keep reference for live updates
    setPickupMarkerRef(pickupMarker);
    (map as any)._pickupMarkerRef = pickupMarker;

    // Add dropoff marker
    const dropoffMarker = L.marker([adjustedDropoffLat, adjustedDropoffLng], {
      icon: dropoffIcon,
      zIndexOffset: 1000
    }).addTo(map);
    dropoffMarker.bindPopup('<strong>Dropoff Location</strong><br>' + booking.addresses.dropoff);
    console.log('Dropoff marker added at:', [adjustedDropoffLat, adjustedDropoffLng]);
    console.log('Dropoff marker on map:', map.hasLayer(dropoffMarker));

    // Draw route line
    const route = [
      [adjustedPickupLat, adjustedPickupLng], // Pickup
      [ambulanceLat, ambulanceLng], // Ambulance current location
      [adjustedDropoffLat, adjustedDropoffLng]  // Dropoff
    ];

    if (routePolyline) {
      routePolyline.remove();
    }

    const polyline = L.polyline(route as any, { color: '#ef4444', weight: 10, opacity: 1.0, dashArray: '20, 10' }).addTo(map);

    setRoutePolyline(polyline);
    console.log('Route polyline added');

    // Fit map to show entire route with better zoom
    map.fitBounds(polyline.getBounds(), { padding: [50, 50] });

    // Set a minimum zoom level to ensure markers are visible
    if (map.getZoom() < 10) {
      map.setZoom(10);
    }

    // Force map refresh
    map.invalidateSize();

    // Add a simple test marker to verify map is working
    console.log('Adding test marker...');
    const testMarker = L.marker([19.0760, 72.8777], {
      icon: L.divIcon({
        html: '<div style="background: #ff0000; color: white; padding: 16px; border-radius: 50%; font-size: 24px; border: 3px solid white; font-weight: bold; box-shadow: 0 6px 20px rgba(0,0,0,0.7);">TEST</div>',
        iconSize: [64, 64],
        iconAnchor: [32, 32]
      })
    }).addTo(map);
    console.log('Test marker added:', testMarker);
    console.log('Test marker on map:', map.hasLayer(testMarker));

    // Also try a simple default marker
    const simpleMarker = L.marker([19.0760, 72.8777]).addTo(map);
    console.log('Simple marker added:', simpleMarker);

    console.log('=== simulateAmbulanceMovementWithMap END ===');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-health-warning';
      case 'confirmed': return 'bg-health-aqua';
      case 'dispatched': return 'bg-health-teal';
      case 'arrived': return 'bg-health-success';
      case 'completed': return 'bg-health-blue-gray';
      case 'cancelled': return 'bg-health-danger';
      default: return 'bg-health-blue-gray';
    }
  };

  // Progress tracking functions - Like Zepto
  const getProgressPercentage = (status: string) => {
    const statusOrder = ['pending', 'confirmed', 'dispatched', 'en_route', 'arrived', 'completed'];
    const currentIndex = statusOrder.indexOf(status);
    if (currentIndex === -1) return 0;
    return Math.round(((currentIndex + 1) / statusOrder.length) * 100);
  };

  const getStatusStepClass = (currentStatus: string, stepStatus: string) => {
    const statusOrder = ['pending', 'confirmed', 'dispatched', 'en_route', 'arrived', 'completed'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(stepStatus);

    if (stepIndex < currentIndex) {
      return 'bg-health-success text-white'; // Completed
    } else if (stepIndex === currentIndex) {
      return 'bg-health-teal text-white border-2 border-health-teal'; // Current
    } else {
      return 'bg-gray-200 text-gray-400'; // Pending
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '📋';
      case 'confirmed': return '✅';
      case 'dispatched': return '🚑';
      case 'en_route': return '🛣️';
      case 'arrived': return '📍';
      case 'completed': return '🎉';
      default: return '📋';
    }
  };

  const computeEstimatedCost = (): number => {
    const base = selectedService?.price.base ?? 160;
    const perKm = selectedService?.price.perKm ?? 5.5;
    const emergency = selectedService?.price.emergency ?? 220;
    const distanceComponent = perKm * estimatedDistanceKm;
    const needSurcharge =
      (bookingForm.needs.oxygen ? 40 : 0) +
      (bookingForm.needs.ventilator ? 90 : 0) +
      (bookingForm.needs.cardiacMonitor ? 35 : 0) +
      (bookingForm.needs.neonatal ? 60 : 0) +
      (bookingForm.needs.bariatric ? 50 : 0);
    const urgencyMultiplier = bookingForm.urgency === 'critical' ? 1.4 : bookingForm.urgency === 'high' ? 1.2 : 1;
    const scheduledDiscount = bookingForm.scheduleType === 'scheduled' ? 0.9 : 1;
    return Math.round((base + distanceComponent + emergency + needSurcharge) * urgencyMultiplier * scheduledDiscount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-health-teal to-health-aqua text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Ambulance className="w-6 h-6" />
            Book Ambulance
          </CardTitle>
          <p className="text-health-light-gray">
            Request emergency ambulance service with real-time tracking and professional medical care.
          </p>
        </CardHeader>
      </Card>

      {/* Emergency Alert */}
      <Card className="border-health-danger/20 bg-health-danger/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-health-danger rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-health-danger text-lg">Emergency Alert</h3>
              <p className="text-sm text-health-charcoal/70">
                For life-threatening emergencies, call 911 immediately. This service is for non-critical medical transport.
              </p>
            </div>
            <Button
              onClick={() => window.open('tel:911', '_self')}
              className="bg-health-danger text-white hover:bg-health-danger/90"
            >
              <Phone className="w-4 h-4 mr-2" />
              Call 911
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ambulance className="w-5 h-5" />
            Ambulance Services
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="services">Available Services</TabsTrigger>
              <TabsTrigger value="bookings">My Bookings</TabsTrigger>
              <TabsTrigger value="tracking">Live Tracking</TabsTrigger>
            </TabsList>

            <TabsContent value="services" className="space-y-4">
              {/* Filter Toolbar (non-sticky) */}
              <div className="-mx-6 px-6 py-3 bg-white border-b border-health-blue-gray/20 rounded-t-md">
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <div className="flex-1">
                    <Input
                      placeholder="Search by name, type, equipment..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Service Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="cardiac">Cardiac</SelectItem>
                        <SelectItem value="trauma">Trauma</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Sort" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="eta">ETA</SelectItem>
                        <SelectItem value="rating">Rating</SelectItem>
                        <SelectItem value="price">Price</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')}>Detailed</Button>
                    <Button variant={viewMode === 'compact' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('compact')}>Compact</Button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-3">
                  <div className="text-xs text-health-charcoal/70">Providers
                    <div className="text-lg font-semibold text-health-teal">{stats.total}</div>
                  </div>
                  <div className="text-xs text-health-charcoal/70">Available Now
                    <div className="text-lg font-semibold text-health-success">{stats.available}</div>
                  </div>
                  <div className="text-xs text-health-charcoal/70">Avg Rating
                    <div className="text-lg font-semibold text-yellow-500">{stats.avgRating}</div>
                  </div>
                </div>
              </div>

              {/* Services List */}
              <div className={viewMode === 'compact' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3' : 'space-y-4'}>
                {filteredServices.map((service) => (
                  <Card key={service._id} className="hover:shadow-md transition-shadow border border-health-blue-gray/20">
                    <CardContent className={viewMode === 'compact' ? 'p-4' : 'p-6'}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className={viewMode === 'compact' ? 'text-base font-semibold' : 'text-xl font-semibold'}>{service.name}</h3>
                            <Badge className={getAmbulanceTypeColor(service.type)}>
                              {service.type.toUpperCase()}
                            </Badge>
                            <Badge variant={service.available ? "default" : "secondary"}>
                              {service.available ? 'Available' : 'Unavailable'}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="text-sm">{service.rating}</span>
                              <span className="text-sm text-gray-500">({service.reviews})</span>
                            </div>
                          </div>

                          <div className={viewMode === 'compact' ? 'grid grid-cols-2 gap-3 mb-2' : 'grid grid-cols-2 md:grid-cols-4 gap-4 mb-4'}>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-500" />
                              <span className="text-sm">ETA: {service.responseTime}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              <span className="text-sm">{service.baseLocation}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-500" />
                              <span className="text-sm">{service.driver?.name || 'Not Assigned'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Truck className="w-4 h-4 text-gray-500" />
                              <span className="text-sm">{service.vehicleNumber}</span>
                            </div>
                          </div>

                          {viewMode === 'list' && (
                            <div className="mb-4">
                              <span className="font-medium text-sm">Capabilities:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {service.equipment.slice(0, 4).map((item, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {item}
                                  </Badge>
                                ))}
                                {service.equipment.length > 4 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{service.equipment.length - 4} more
                                  </Badge>
                                )}
                                <Badge variant="secondary" className="text-xs">Paramedic Crew</Badge>
                                <Badge variant="secondary" className="text-xs">ALS Certified</Badge>
                              </div>
                            </div>
                          )}

                          <div className="flex flex-wrap items-center gap-4 text-sm pt-3 border-t border-dashed border-health-blue-gray/30">
                            <span className="font-medium">Base: ${service.price.base}</span>
                            <span className="text-gray-600">Emergency: ${service.price.emergency}</span>
                            <span className="text-gray-600">Est. Fare (5km): ${Math.max(service.price.base + service.price.perKm * 5 + 60, service.price.emergency)}</span>
                            <span className={`${service.insuranceCovered ? 'text-health-success' : 'text-health-warning'}`}>
                              {service.insuranceCovered ? 'Insurance Covered' : 'Self Pay'}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          <Button
                            onClick={() => handleBookAmbulance(service)}
                            disabled={!service.available}
                          >
                            <Ambulance className="w-4 h-4 mr-2" />
                            Book Now
                          </Button>
                          <Button variant="outline" onClick={() => handleAmbulanceCall(service.contact)}>
                            <Phone className="w-4 h-4 mr-2" />
                            Call
                          </Button>
                          <Button variant="outline" onClick={() => {
                            setSelectedService(service);
                            setShowServiceDialog(true);
                          }}>
                            <Info className="w-4 h-4 mr-2" />
                            Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {filteredServices.length === 0 && (
                  <Card>
                    <CardContent className="py-10 text-center">
                      <h4 className="text-lg font-semibold text-health-charcoal">No services found</h4>
                      <p className="text-sm text-health-charcoal/70">Try adjusting your search or filter options.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="bookings" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">My Bookings</h3>
                <Button onClick={() => setActiveTab('services')}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Booking
                </Button>
              </div>

              <div className="space-y-4">
                {bookingRequests.map((booking) => (
                  <Card key={booking._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-lg font-semibold">Booking #{booking.bookingId}</h3>
                            <Badge className={getStatusColor(booking.status.current)}>
                              {booking.status.current.toUpperCase()}
                            </Badge>
                            <Badge className={getUrgencyColor(booking.emergencyDetails.urgency)}>
                              {booking.emergencyDetails.urgency.toUpperCase()}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <span className="font-medium text-sm">Patient:</span>
                              <p className="text-sm">{booking.patientDetails.name}</p>
                            </div>
                            <div>
                              <span className="font-medium text-sm">Emergency:</span>
                              <p className="text-sm">{booking.emergencyDetails.type}</p>
                            </div>
                            <div>
                              <span className="font-medium text-sm">ETA:</span>
                              <p className="text-sm">{booking.tracking?.estimatedArrival ? new Date(booking.tracking.estimatedArrival).toLocaleString() : 'Calculating...'}</p>
                            </div>
                            <div>
                              <span className="font-medium text-sm">Cost:</span>
                              <p className="text-sm">${booking.payment.estimatedCost}</p>
                            </div>
                          </div>

                          <div className="text-sm text-gray-600">
                            <p><strong>Pickup:</strong> {booking.addresses.pickup}</p>
                            <p><strong>Dropoff:</strong> {booking.addresses.dropoff}</p>
                            <p><strong>Symptoms:</strong> {booking.emergencyDetails.symptoms}</p>
                            {booking.driver?.contact && (
                              <p><strong>Driver Contact:</strong> {booking.driver.contact}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (booking.driver?.contact) {
                                window.open(`tel:${booking.driver.contact}`, '_self');
                              }
                            }}
                            disabled={!booking.driver?.contact}
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Contact Driver
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startTracking(booking)}
                          >
                            <Navigation className="w-4 h-4 mr-2" />
                            Track
                          </Button>
                          {booking.status.current === 'pending' && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={async () => {
                                try {
                                  // Ensure booking is in user's list (ownership hint)
                                  const exists = bookingRequests.some(b => b._id === booking._id);
                                  if (!exists) {
                                    toast({
                                      title: 'Not Authorized',
                                      description: 'This booking is not in your list and cannot be cancelled.',
                                      variant: 'destructive'
                                    });
                                    return;
                                  }
                                  const response = await AmbulanceServiceAPI.cancelBooking(booking._id);
                                  if (response.success) {
                                    // Update the booking in the list
                                    setBookingRequests(prev =>
                                      prev.map(b =>
                                        b._id === booking._id
                                          ? { ...b, status: { ...b.status, current: 'cancelled' } }
                                          : b
                                      )
                                    );
                                    toast({
                                      title: 'Booking Cancelled',
                                      description: 'Your ambulance booking has been cancelled successfully.',
                                      variant: 'default',
                                    });
                                  }
                                } catch (error) {
                                  console.error('Error cancelling booking:', error);
                                  toast({
                                    title: 'Error',
                                    description: 'Failed to cancel booking. Ensure this booking belongs to you.',
                                    variant: 'destructive',
                                  });
                                }
                              }}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="tracking" className="space-y-4">
              {bookingRequests.length > 0 ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Live Ambulance Tracking</h3>
                    <Badge variant="outline" className="text-sm">
                      {bookingRequests.filter(b => ['pending', 'confirmed', 'dispatched', 'en_route', 'arrived'].includes(b.status.current)).length} Active
                    </Badge>
                  </div>

                  {/* Individual Tracking Cards - Like Zepto */}
                  <div className="space-y-4">
                    {bookingRequests
                      .filter(booking => ['pending', 'confirmed', 'dispatched', 'en_route', 'arrived'].includes(booking.status.current))
                      .map((booking) => (
                        <Card key={booking._id} className="border-2 border-health-teal/20 hover:shadow-lg transition-all">
                          <CardContent className="p-6">
                            {/* Header with Status */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-health-teal rounded-full animate-pulse"></div>
                                <h4 className="font-semibold text-lg">Booking #{booking.bookingId}</h4>
                                <Badge className={getStatusColor(booking.status.current)}>
                                  {booking.status.current.replace('_', ' ').toUpperCase()}
                                </Badge>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => startTracking(booking)}
                              >
                                <Navigation className="w-4 h-4 mr-2" />
                                Full View
                              </Button>
                            </div>

                            {/* Progress Timeline - Like Zepto */}
                            <div className="mb-6">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-gray-600">Progress</span>
                                <span className="text-sm text-health-teal font-medium">
                                  {getProgressPercentage(booking.status.current)}% Complete
                                </span>
                              </div>
                              <div className="relative">
                                <div className="flex items-center justify-between">
                                  {['pending', 'confirmed', 'dispatched', 'en_route', 'arrived', 'completed'].map((status, index) => (
                                    <div key={status} className="flex flex-col items-center">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${getStatusStepClass(booking.status.current, status)
                                        }`}>
                                        {getStatusIcon(status)}
                                      </div>
                                      <span className="text-xs text-gray-500 mt-1 text-center max-w-16">
                                        {status.replace('_', ' ')}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                                {/* Progress Bar */}
                                <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200 -z-10">
                                  <div
                                    className="h-full bg-health-teal transition-all duration-500"
                                    style={{ width: `${getProgressPercentage(booking.status.current)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>

                            {/* Live Tracking Info */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                  <Clock className="w-4 h-4 text-health-teal" />
                                  <span className="text-sm font-medium">ETA</span>
                                </div>
                                <p className="text-lg font-bold text-health-teal">
                                  {booking.tracking?.estimatedArrival
                                    ? new Date(booking.tracking.estimatedArrival).toLocaleTimeString()
                                    : '8-12 min'
                                  }
                                </p>
                              </div>

                              <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                  <MapPin className="w-4 h-4 text-health-aqua" />
                                  <span className="text-sm font-medium">Distance</span>
                                </div>
                                <p className="text-lg font-bold text-health-aqua">
                                  {booking.scheduling.estimatedDistance || 5} km
                                </p>
                              </div>

                              <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                  <User className="w-4 h-4 text-health-blue" />
                                  <span className="text-sm font-medium">Driver</span>
                                </div>
                                <p className="text-lg font-semibold text-health-blue">
                                  {booking.driver?.name || 'Assigned'}
                                </p>
                              </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (booking.driver?.contact) {
                                    window.open(`tel:${booking.driver.contact}`, '_self');
                                  }
                                }}
                                disabled={!booking.driver?.contact}
                                className="flex-1"
                              >
                                <Phone className="w-4 h-4 mr-2" />
                                Call Driver
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (booking.driver?.contact) {
                                    window.open(`sms:${booking.driver.contact}`, '_self');
                                  }
                                }}
                                disabled={!booking.driver?.contact}
                                className="flex-1"
                              >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Send SMS
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>

                  {/* No Active Bookings Message */}
                  {bookingRequests.filter(booking =>
                    ['pending', 'confirmed', 'dispatched', 'en_route', 'arrived'].includes(booking.status.current)
                  ).length === 0 && (
                      <Card>
                        <CardContent className="flex items-center justify-center h-32">
                          <div className="text-center">
                            <Navigation className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600">No active bookings to track</p>
                            <p className="text-sm text-gray-500">Bookings will appear here when confirmed</p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                </div>
              ) : (
                <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Navigation className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No bookings available</p>
                    <p className="text-sm text-gray-500">Create a booking to start tracking</p>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Service Details Dialog */}
      <Dialog open={showServiceDialog} onOpenChange={setShowServiceDialog}>
        <DialogContent className="max-w-none w-[96vw] md:w-[92vw] lg:w-[85vw] xl:w-[75vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Ambulance className="w-5 h-5 text-health-teal" />{selectedService?.name}</DialogTitle>
          </DialogHeader>
          {selectedService && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="equipment">Equipment</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="policies">Policies</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader><CardTitle className="text-base">Contact & Crew</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <p><strong>Phone:</strong> {selectedService.contact}</p>
                      <p><strong>Driver:</strong> {selectedService.driver?.name || 'Not Assigned'} {selectedService.driver?.experience ? `(${selectedService.driver.experience} years exp.)` : ''}</p>
                      <p><strong>Vehicle:</strong> {selectedService.vehicleNumber}</p>
                      <p><strong>Base:</strong> {selectedService.baseLocation}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle className="text-base">Service Metrics</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-2 gap-3 text-sm">
                      <div><div className="text-xs text-gray-500">Type</div><div className="font-medium capitalize">{selectedService.type}</div></div>
                      <div><div className="text-xs text-gray-500">Response</div><div className="font-medium">{selectedService.responseTime}</div></div>
                      <div><div className="text-xs text-gray-500">Rating</div><div className="font-medium">{selectedService.rating} ⭐ ({selectedService.reviews})</div></div>
                      <div><div className="text-xs text-gray-500">Insurance</div><div className="font-medium">{selectedService.insuranceCovered ? 'Covered' : 'Not Covered'}</div></div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="equipment" className="space-y-4">
                <Card>
                  <CardHeader><CardTitle className="text-base">On-board Equipment</CardTitle></CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedService.equipment.map((item, index) => (
                        <Badge key={index} variant="outline">{item}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="pricing" className="space-y-4">
                <Card>
                  <CardHeader><CardTitle className="text-base">Pricing Breakdown</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 border rounded-lg"><p className="text-sm text-gray-600">Base</p><p className="text-xl font-bold">${selectedService.price.base}</p></div>
                    <div className="text-center p-3 border rounded-lg"><p className="text-sm text-gray-600">Per KM</p><p className="text-xl font-bold">${selectedService.price.perKm}</p></div>
                    <div className="text-center p-3 border rounded-lg"><p className="text-sm text-gray-600">Emergency</p><p className="text-xl font-bold">${selectedService.price.emergency}</p></div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="policies" className="space-y-4">
                <Card>
                  <CardHeader><CardTitle className="text-base">Policies & Notes</CardTitle></CardHeader>
                  <CardContent className="space-y-2 text-sm text-gray-700">
                    <p>• PPE and sanitation protocols followed for every transport.</p>
                    <p>• Additional surcharges may apply for ventilator/cardiac monitoring.</p>
                    <p>• Insurance coverage subject to provider verification.</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="max-w-none w-[96vw] md:w-[90vw] lg:w-[80vw] xl:w-[70vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Book Ambulance Service</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patientName">Patient Name</Label>
                <Input
                  id="patientName"
                  value={bookingForm.patientName}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, patientName: e.target.value }))}
                  placeholder="Enter patient name"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={bookingForm.phone}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={bookingForm.patientAge}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, patientAge: e.target.value }))}
                  placeholder="e.g., 45"
                />
              </div>
              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={bookingForm.weightKg}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, weightKg: e.target.value }))}
                  placeholder="e.g., 70"
                />
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Pickup Address</Label>
                <div className="flex gap-2">
                  <Input
                    value={bookingForm.pickupAddress}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, pickupAddress: e.target.value }))}
                    placeholder="Enter pickup address"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleLocationPermission}
                    disabled={isGettingLocation}
                    className="flex items-center gap-2"
                  >
                    {isGettingLocation ? (
                      <Activity className="w-4 h-4 animate-spin" />
                    ) : (
                      <MapPin className="w-4 h-4" />
                    )}
                    {isGettingLocation ? 'Getting...' : 'Live Location'}
                  </Button>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline">Saved</Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-2">
                      <div className="space-y-1">
                        {savedAddresses.map((s) => (
                          <Button key={s.label} variant="ghost" className="w-full justify-start"
                            onClick={() => setBookingForm(prev => ({ ...prev, pickupAddress: s.address }))}
                          >{s.label}: {s.address}</Button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div>
                <Label>Drop-off Address</Label>
                <Input
                  value={bookingForm.dropoffAddress}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, dropoffAddress: e.target.value }))}
                  placeholder="Enter destination hospital/address"
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={bookingForm.shareLiveLocation} onCheckedChange={(val) => setBookingForm(prev => ({ ...prev, shareLiveLocation: val }))} />
                <span className="text-sm">Share live location with provider</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={bookingForm.notifyHospital} onCheckedChange={(val) => setBookingForm(prev => ({ ...prev, notifyHospital: val }))} />
                <span className="text-sm">Notify destination hospital</span>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergencyType">Emergency Type</Label>
                <Input
                  id="emergencyType"
                  value={bookingForm.emergencyType}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, emergencyType: e.target.value }))}
                  placeholder="e.g., Chest pain, injury"
                />
              </div>
              <div>
                <Label>Urgency Level</Label>
                <RadioGroup
                  value={bookingForm.urgency}
                  onValueChange={(value) => setBookingForm(prev => ({ ...prev, urgency: value as any }))}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="low" id="low" />
                    <Label htmlFor="low">Low</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="medium" />
                    <Label htmlFor="medium">Medium</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="high" id="high" />
                    <Label htmlFor="high">High</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="critical" id="critical" />
                    <Label htmlFor="critical">Critical</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div>
              <Label htmlFor="symptoms">Symptoms/Description</Label>
              <Textarea
                id="symptoms"
                value={bookingForm.symptoms}
                onChange={(e) => setBookingForm(prev => ({ ...prev, symptoms: e.target.value }))}
                placeholder="Describe the symptoms or reason for transport"
              />
            </div>

            <div>
              <Label>Medical Requirements</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                <div className="flex items-center space-x-2"><Checkbox checked={bookingForm.needs.oxygen} onCheckedChange={(v) => setBookingForm(prev => ({ ...prev, needs: { ...prev.needs, oxygen: !!v } }))} id="need-oxygen" /><Label htmlFor="need-oxygen">Oxygen</Label></div>
                <div className="flex items-center space-x-2"><Checkbox checked={bookingForm.needs.ventilator} onCheckedChange={(v) => setBookingForm(prev => ({ ...prev, needs: { ...prev.needs, ventilator: !!v } }))} id="need-vent" /><Label htmlFor="need-vent">Ventilator</Label></div>
                <div className="flex items-center space-x-2"><Checkbox checked={bookingForm.needs.cardiacMonitor} onCheckedChange={(v) => setBookingForm(prev => ({ ...prev, needs: { ...prev.needs, cardiacMonitor: !!v } }))} id="need-card" /><Label htmlFor="need-card">Cardiac monitor</Label></div>
                <div className="flex items-center space-x-2"><Checkbox checked={bookingForm.needs.neonatal} onCheckedChange={(v) => setBookingForm(prev => ({ ...prev, needs: { ...prev.needs, neonatal: !!v } }))} id="need-neo" /><Label htmlFor="need-neo">Neonatal</Label></div>
                <div className="flex items-center space-x-2"><Checkbox checked={bookingForm.needs.bariatric} onCheckedChange={(v) => setBookingForm(prev => ({ ...prev, needs: { ...prev.needs, bariatric: !!v } }))} id="need-bar" /><Label htmlFor="need-bar">Bariatric</Label></div>
                <div className="flex items-center space-x-2"><Checkbox checked={bookingForm.needs.wheelchair} onCheckedChange={(v) => setBookingForm(prev => ({ ...prev, needs: { ...prev.needs, wheelchair: !!v } }))} id="need-wheel" /><Label htmlFor="need-wheel">Wheelchair</Label></div>
                <div className="flex items-center space-x-2"><Checkbox checked={bookingForm.needs.stretcher} onCheckedChange={(v) => setBookingForm(prev => ({ ...prev, needs: { ...prev.needs, stretcher: !!v } }))} id="need-str" /><Label htmlFor="need-str">Stretcher</Label></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="col-span-2">
                <Label>Estimated Distance: {estimatedDistanceKm} km</Label>
                <Slider value={[estimatedDistanceKm]} min={1} max={50} step={1} onValueChange={(v) => setEstimatedDistanceKm(v[0])} />
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Estimated Fare</div>
                <div className="text-2xl font-semibold">${computeEstimatedCost()}</div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Schedule</Label>
                <RadioGroup
                  value={bookingForm.scheduleType}
                  onValueChange={(v) => setBookingForm(prev => ({ ...prev, scheduleType: v as any }))}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2"><RadioGroupItem value="now" id="now" /><Label htmlFor="now">Now</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="scheduled" id="scheduled" /><Label htmlFor="scheduled">Schedule</Label></div>
                </RadioGroup>
              </div>
              {bookingForm.scheduleType === 'scheduled' && (
                <div className="md:col-span-2">
                  <Label>Date & Time</Label>
                  <Input type="datetime-local" value={bookingForm.scheduledDateTime} onChange={(e) => setBookingForm(prev => ({ ...prev, scheduledDateTime: e.target.value }))} />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Payment Method</Label>
                <Select value={bookingForm.paymentMethod} onValueChange={(v) => setBookingForm(prev => ({ ...prev, paymentMethod: v as any }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3 mt-6">
                <Switch checked={bookingForm.useInsurance} onCheckedChange={(v) => setBookingForm(prev => ({ ...prev, useInsurance: v }))} />
                <span className="text-sm">Use Insurance</span>
              </div>
            </div>
            {bookingForm.useInsurance && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Insurance Provider</Label>
                  <Input value={bookingForm.insuranceProvider} onChange={(e) => setBookingForm(prev => ({ ...prev, insuranceProvider: e.target.value }))} placeholder="Enter provider" />
                </div>
                <div>
                  <Label>Member ID</Label>
                  <Input value={bookingForm.memberId} onChange={(e) => setBookingForm(prev => ({ ...prev, memberId: e.target.value }))} placeholder="Policy / Member ID" />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Share Tracking via SMS (comma separated)</Label>
                <Input value={bookingForm.shareSms} onChange={(e) => setBookingForm(prev => ({ ...prev, shareSms: e.target.value }))} placeholder="e.g., +1-555-0101, +1-555-0102" />
              </div>
              <div>
                <Label>Number of Attendants</Label>
                <Input type="number" value={bookingForm.attendants} onChange={(e) => setBookingForm(prev => ({ ...prev, attendants: Number(e.target.value || 0) }))} />
              </div>
            </div>

            <Separator />

            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleSubmitBooking}
                disabled={
                  isBooking ||
                  !bookingForm.patientName ||
                  !bookingForm.phone ||
                  !(bookingForm.pickupAddress || bookingForm.address)
                }
                className="flex-1"
              >
                {isBooking ? (
                  <>
                    <Activity className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Ambulance className="w-4 h-4 mr-2" />
                    Confirm Booking
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowBookingDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Live Tracking Dialog */}
      <Dialog open={showTrackingDialog} onOpenChange={setShowTrackingDialog}>
        <DialogContent className="max-w-none w-[96vw] md:w-[95vw] lg:w-[90vw] xl:w-[85vw] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-health-teal" />
              Live Ambulance Tracking
            </DialogTitle>
          </DialogHeader>
          {selectedBookingForTracking && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold">Booking #{selectedBookingForTracking.bookingId}</h3>
                  <p className="text-sm text-gray-600">
                    {selectedBookingForTracking.patientDetails.name} • {selectedBookingForTracking.emergencyDetails.type}
                  </p>
                </div>
                <Badge variant="outline" className="capitalize">
                  {selectedBookingForTracking.status.current.replace('_', ' ')}
                </Badge>
              </div>

              {/* Location Status */}
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Pickup Location</span>
                </div>
                <div className="flex items-center gap-2">
                  {patientLocation ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-700">
                        {isCalibrating ? 'Calibrating GPS… ' : 'GPS Ready: '}
                        {patientLocation[0].toFixed(6)}, {patientLocation[1].toFixed(6)}
                        {gpsAccuracy ? ` • ±${Math.round(gpsAccuracy)}m` : ''}
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                      <span className="text-sm text-orange-700">Using default coordinates</span>
                    </>
                  )}
                </div>
              </div>

              {/* OpenStreetMap with Leaflet */}
              <div className="h-96 bg-gray-100 rounded-lg overflow-hidden relative">
                {!mapInstance && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-health-teal mx-auto mb-2"></div>
                      <p className="text-gray-600">Loading map...</p>
                    </div>
                  </div>
                )}
                <div
                  id="tracking-map"
                  className="w-full h-full relative"
                  style={{ minHeight: '384px' }}
                />
              </div>

              {/* Tracking Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-health-teal" />
                      <span className="font-medium">ETA</span>
                    </div>
                    <p className="text-2xl font-bold text-health-teal">
                      {selectedBookingForTracking.tracking?.estimatedArrival
                        ? new Date(selectedBookingForTracking.tracking.estimatedArrival).toLocaleTimeString()
                        : '8-12 min'
                      }
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-health-aqua" />
                      <span className="font-medium">Distance</span>
                    </div>
                    <p className="text-2xl font-bold text-health-aqua">
                      {selectedBookingForTracking.scheduling.estimatedDistance || 5} km
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-health-blue" />
                      <span className="font-medium">Driver</span>
                    </div>
                    <p className="text-lg font-semibold text-health-blue">
                      {selectedBookingForTracking.driver?.name || 'Assigned'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedBookingForTracking.driver?.contact || 'Contact info unavailable'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Location Actions */}
              <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Update Location</span>
                </div>
                <Button
                  onClick={handleLocationPermission}
                  variant="outline"
                  size="sm"
                  disabled={isGettingLocation}
                  className="flex items-center gap-2"
                >
                  {isGettingLocation ? (
                    <Activity className="w-4 h-4 animate-spin" />
                  ) : (
                    <Activity className="w-4 h-4" />
                  )}
                  {isGettingLocation ? 'Getting Location...' : 'Refresh GPS'}
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={() => window.open(`tel:${selectedBookingForTracking.driver?.contact || ''}`, '_self')}
                  className="flex-1 bg-health-teal text-white hover:bg-health-teal/90"
                  disabled={!selectedBookingForTracking.driver?.contact}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call Driver
                </Button>
                <Button
                  onClick={() => window.open(`sms:${selectedBookingForTracking.driver?.contact || ''}`, '_self')}
                  variant="outline"
                  className="flex-1"
                  disabled={!selectedBookingForTracking.driver?.contact}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send SMS
                </Button>
                <Button
                  onClick={stopTracking}
                  variant="destructive"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Stop Tracking
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookAmbulance; 