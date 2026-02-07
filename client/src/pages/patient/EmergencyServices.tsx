import React, { useState, useEffect } from 'react';
import emergencyServicesService from '@/services/emergencyServicesService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  AlertTriangle, Hospital, Ambulance, Phone, MapPin, 
  Clock, Star, Users, Shield, Heart, Activity,
  Navigation, Calendar, MessageSquare, Bell, Search,
  Filter, Plus, Info, Clock as ClockIcon, Phone as PhoneIcon
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Hospital {
  id: number;
  name: string;
  distance: string;
  beds: number;
  rating: number;
  emergency: boolean;
  specialties: string[];
  waitTime: string;
  contact: string;
  address: string;
  coordinates: { lat: number; lng: number };
  emergencyCapacity: number;
  traumaLevel: 'I' | 'II' | 'III' | 'IV' | 'V';
  insuranceAccepted: string[];
  facilities: string[];
}

interface AmbulanceService {
  id: number;
  name: string;
  eta: string;
  type: 'basic' | 'advanced' | 'cardiac' | 'neonatal' | 'trauma';
  available: boolean;
  contact: string;
  vehicleNumber: string;
  driver: string;
  equipment: string[];
  insuranceCovered: boolean;
  baseLocation: string;
  responseTime: string;
}

interface EmergencyContact {
  id: number;
  name: string;
  number: string;
  type: 'emergency' | 'doctor' | 'family' | 'hospital' | 'pharmacy';
  relationship?: string;
  notes?: string;
  isFavorite: boolean;
  lastContacted?: string;
}

const EmergencyServices = () => {
  const [nearbyHospitals, setNearbyHospitals] = useState<Hospital[]>([]);
  const [ambulanceServices, setAmbulanceServices] = useState<AmbulanceService[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [selectedAmbulance, setSelectedAmbulance] = useState<AmbulanceService | null>(null);
  const [showHospitalDialog, setShowHospitalDialog] = useState(false);
  const [showAmbulanceDialog, setShowAmbulanceDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const formatAddress = (addr: any): string => {
    if (!addr) return '';
    if (typeof addr === 'string') return addr;
    const a = addr || {};
    const parts = [a.street, a.city, a.state, a.zipCode, a.country].filter(Boolean);
    return parts.join(', ');
  };

  // Mock data
  const mockHospitals: Hospital[] = [
    {
      id: 1,
      name: 'City General Hospital',
      distance: '2.3 km',
      beds: 45,
      rating: 4.5,
      emergency: true,
      specialties: ['Emergency Medicine', 'Cardiology', 'Trauma', 'Neurology'],
      waitTime: '15-30 minutes',
      contact: '+1-555-0101',
      address: '123 Main Street, City Center',
      coordinates: { lat: 40.7128, lng: -74.0060 },
      emergencyCapacity: 85,
      traumaLevel: 'I',
      insuranceAccepted: ['Blue Cross', 'Aetna', 'Cigna', 'Medicare'],
      facilities: ['CT Scan', 'MRI', 'ICU', 'Helipad', 'Burn Unit']
    },
    {
      id: 2,
      name: 'Metro Medical Center',
      distance: '4.1 km',
      beds: 23,
      rating: 4.2,
      emergency: true,
      specialties: ['Emergency Medicine', 'Neurology', 'Pediatrics'],
      waitTime: '20-45 minutes',
      contact: '+1-555-0102',
      address: '456 Oak Avenue, Metro District',
      coordinates: { lat: 40.7589, lng: -73.9851 },
      emergencyCapacity: 60,
      traumaLevel: 'II',
      insuranceAccepted: ['Blue Cross', 'Aetna', 'Medicare'],
      facilities: ['CT Scan', 'ICU', 'Pediatric Unit']
    },
    {
      id: 3,
      name: 'Community Health Clinic',
      distance: '1.8 km',
      beds: 12,
      rating: 4.0,
      emergency: false,
      specialties: ['Primary Care', 'Urgent Care'],
      waitTime: '10-20 minutes',
      contact: '+1-555-0103',
      address: '789 Pine Road, Community Area',
      coordinates: { lat: 40.7505, lng: -73.9934 },
      emergencyCapacity: 30,
      traumaLevel: 'V',
      insuranceAccepted: ['Medicare', 'Medicaid'],
      facilities: ['X-Ray', 'Lab Services']
    },
    {
      id: 4,
      name: 'University Medical Center',
      distance: '6.2 km',
      beds: 67,
      rating: 4.8,
      emergency: true,
      specialties: ['Emergency Medicine', 'Cardiology', 'Neurology', 'Trauma', 'Burn Unit'],
      waitTime: '25-40 minutes',
      contact: '+1-555-0104',
      address: '321 University Blvd, Academic District',
      coordinates: { lat: 40.7484, lng: -73.9857 },
      emergencyCapacity: 95,
      traumaLevel: 'I',
      insuranceAccepted: ['Blue Cross', 'Aetna', 'Cigna', 'Medicare', 'Medicaid'],
      facilities: ['CT Scan', 'MRI', 'ICU', 'Helipad', 'Burn Unit', 'Research Lab']
    }
  ];

  const mockAmbulances: AmbulanceService[] = [
    {
      id: 1,
      name: 'City Emergency Ambulance',
      eta: '8-12 minutes',
      type: 'advanced',
      available: true,
      contact: '+1-555-0201',
      vehicleNumber: 'AMB-001',
      driver: 'John Smith',
      equipment: ['Defibrillator', 'Ventilator', 'ECG Monitor', 'Oxygen'],
      insuranceCovered: true,
      baseLocation: 'Downtown Station',
      responseTime: '8-12 minutes'
    },
    {
      id: 2,
      name: 'Metro Medical Transport',
      eta: '10-15 minutes',
      type: 'cardiac',
      available: true,
      contact: '+1-555-0202',
      vehicleNumber: 'AMB-002',
      driver: 'Sarah Johnson',
      equipment: ['Cardiac Monitor', 'Defibrillator', 'Ventilator', 'ECG'],
      insuranceCovered: true,
      baseLocation: 'Metro Station',
      responseTime: '10-15 minutes'
    },
    {
      id: 3,
      name: 'Community Ambulance Service',
      eta: '5-8 minutes',
      type: 'basic',
      available: false,
      contact: '+1-555-0203',
      vehicleNumber: 'AMB-003',
      driver: 'Mike Davis',
      equipment: ['Basic First Aid', 'Oxygen', 'Stretcher'],
      insuranceCovered: false,
      baseLocation: 'Community Center',
      responseTime: '5-8 minutes'
    }
  ];

  const mockContacts: EmergencyContact[] = [
    {
      id: 1,
      name: 'Dr. Sarah Wilson',
      number: '+1-555-0301',
      type: 'doctor',
      relationship: 'Primary Care Physician',
      notes: 'Available 24/7 for emergencies',
      isFavorite: true,
      lastContacted: '2024-01-15'
    },
    {
      id: 2,
      name: 'Emergency Services',
      number: '911',
      type: 'emergency',
      notes: 'General emergency number',
      isFavorite: true
    },
    {
      id: 3,
      name: 'Mom',
      number: '+1-555-0303',
      type: 'family',
      relationship: 'Mother',
      notes: 'Emergency contact',
      isFavorite: true,
      lastContacted: '2024-01-10'
    },
    {
      id: 4,
      name: 'City General Hospital',
      number: '+1-555-0101',
      type: 'hospital',
      notes: 'Nearest emergency hospital',
      isFavorite: false
    }
  ];

  useEffect(() => {
    // Fetch from backend; fall back to mocks if fails
    (async () => {
      try {
        const hospitalsRes = await emergencyServicesService.listHospitals();
        const hospitals = (hospitalsRes.data?.hospitals || hospitalsRes.data || hospitalsRes?.data?.data || []) as any[];
        const mappedHospitals: Hospital[] = hospitals.map((h: any, idx: number) => ({
          id: h.id || h._id || idx + 1,
          name: h.hospitalName || h.name || 'Hospital',
          distance: h.distance || '—',
          beds: h.beds || h.bedCount || 0,
          rating: h.rating || 0,
          emergency: true,
          specialties: h.specialties || [],
          waitTime: h.waitTime || '—',
          contact: h.phone || h.emergencyContact || '',
          address: formatAddress(h.address || h.location?.address || h.location),
          coordinates: { lat: h.location?.coordinates?.latitude || 0, lng: h.location?.coordinates?.longitude || 0 },
          emergencyCapacity: h.emergencyCapacity || 0,
          traumaLevel: (h.traumaLevel || 'II') as any,
          insuranceAccepted: h.insuranceAccepted || [],
          facilities: h.facilities || [],
        }));
        setNearbyHospitals(mappedHospitals.length ? mappedHospitals : mockHospitals);
      } catch {
        setNearbyHospitals(mockHospitals);
      }

      try {
        const ambRes = await emergencyServicesService.listAmbulances({ available: true });
        const services = ambRes.data || ambRes.data?.data || [];
        const mappedAmb: AmbulanceService[] = services.map((s: any, idx: number) => ({
          id: s._id || idx + 1,
          name: s.name,
          eta: s.responseTime || s.eta || '—',
          type: (s.type || 'basic') as any,
          available: s.available !== false,
          contact: s.contact || s.phone || '',
          vehicleNumber: s.vehicleNumber || s.vehicleNo || '',
          driver: s.driver?.name || s.driver || '',
          equipment: s.equipment || [],
          insuranceCovered: !!s.insuranceCovered,
          baseLocation: s.baseLocation || '',
          responseTime: s.responseTime || '—',
        }));
        setAmbulanceServices(mappedAmb.length ? mappedAmb : mockAmbulances);
      } catch {
        setAmbulanceServices(mockAmbulances);
      }

      // Reuse emergency contacts already saved on user
      try {
        // This endpoint exists and is used by the contacts page
        const res = await (await import('@/services/emergencyContactsService')).default.list();
        const contacts = (res.contacts || []) as any[];
        const mappedContacts: EmergencyContact[] = contacts.map((c: any, idx: number) => ({
          id: c._id || idx + 1,
          name: c.name,
          number: c.phone || c.number,
          type: (c.type || 'family') as any,
          relationship: c.relationship,
          notes: c.notes,
          isFavorite: !!c.isFavorite,
          lastContacted: c.lastContacted,
        }));
        setEmergencyContacts(mappedContacts.length ? mappedContacts : mockContacts);
      } catch {
        setEmergencyContacts(mockContacts);
      }
    })();
  }, []);

  const handleEmergencyCall = () => {
    window.open('tel:911', '_self');
  };

  const handleHospitalCall = (contact: string) => {
    window.open(`tel:${contact}`, '_self');
  };

  const handleAmbulanceCall = (contact: string) => {
    window.open(`tel:${contact}`, '_self');
  };

  const handleContactCall = (number: string) => {
    window.open(`tel:${number}`, '_self');
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

  const getContactTypeColor = (type: string) => {
    switch (type) {
      case 'emergency': return 'bg-health-danger';
      case 'doctor': return 'bg-health-teal';
      case 'family': return 'bg-health-success';
      case 'hospital': return 'bg-health-warning';
      case 'pharmacy': return 'bg-health-aqua';
      default: return 'bg-health-blue-gray';
    }
  };

  const getTraumaLevelColor = (level: string) => {
    switch (level) {
      case 'I': return 'bg-health-danger';
      case 'II': return 'bg-health-warning';
      case 'III': return 'bg-health-success';
      case 'IV': return 'bg-health-aqua';
      case 'V': return 'bg-health-blue-gray';
      default: return 'bg-health-blue-gray';
    }
  };

  return (
    <div className="space-y-6">
      {/* Emergency Alert */}
      <Card className="border-health-danger/20 bg-health-danger/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-health-danger rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-health-danger text-lg">Emergency Services</h3>
              <p className="text-sm text-health-charcoal/70">
                Quick access to emergency medical services, hospitals, and ambulance services.
              </p>
            </div>
            <Button 
              onClick={handleEmergencyCall}
              className="bg-health-danger text-white hover:bg-health-danger/90"
            >
              <Phone className="w-4 h-4 mr-2" />
              Call 911
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Hospital className="w-8 h-8 mx-auto mb-3 text-health-teal" />
            <h3 className="font-semibold text-health-charcoal">Find Hospitals</h3>
            <p className="text-sm text-health-charcoal/70 mt-1">Locate nearby hospitals</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Ambulance className="w-8 h-8 mx-auto mb-3 text-health-aqua" />
            <h3 className="font-semibold text-health-charcoal">Book Ambulance</h3>
            <p className="text-sm text-health-charcoal/70 mt-1">Request emergency transport</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Phone className="w-8 h-8 mx-auto mb-3 text-health-success" />
            <h3 className="font-semibold text-health-charcoal">Emergency Contacts</h3>
            <p className="text-sm text-health-charcoal/70 mt-1">Manage emergency contacts</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <MapPin className="w-8 h-8 mx-auto mb-3 text-health-warning" />
            <h3 className="font-semibold text-health-charcoal">My Location</h3>
            <p className="text-sm text-health-charcoal/70 mt-1">Share your location</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-health-danger" />
            Emergency Services
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="hospitals">Hospitals</TabsTrigger>
              <TabsTrigger value="ambulance">Ambulance</TabsTrigger>
              <TabsTrigger value="contacts">Contacts</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nearby Hospitals Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Hospital className="w-5 h-5" />
                      Nearby Hospitals
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {nearbyHospitals.slice(0, 3).map((hospital) => (
                        <div key={hospital.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <div className="font-medium truncate">{hospital.name}</div>
                              <Badge variant="outline" className="text-xs">{hospital.distance}</Badge>
                              {hospital.rating ? (
                                <Badge className="bg-health-warning text-white text-xs">{hospital.rating.toFixed ? hospital.rating.toFixed(1) : hospital.rating} ⭐</Badge>
                              ) : null}
                            </div>
                            <div className="text-sm text-gray-600 flex flex-wrap gap-2 mt-1">
                              <span>{hospital.waitTime || '—'}</span>
                              <span>•</span>
                              <span>{hospital.beds ? `${hospital.beds} beds` : 'Beds: —'}</span>
                            </div>
                            {hospital.address && (
                              <div className="text-xs text-gray-500 mt-1 truncate flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate">{hospital.address}</span>
                              </div>
                            )}
                          </div>
                          <Button size="sm" onClick={() => handleHospitalCall(hospital.contact)}>
                            <Phone className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Available Ambulances */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Ambulance className="w-5 h-5" />
                      Available Ambulances
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {ambulanceServices.filter(a => a.available).slice(0, 3).map((ambulance) => (
                        <div key={ambulance.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <div className="font-medium truncate">{ambulance.name}</div>
                              <Badge className={getAmbulanceTypeColor(ambulance.type)}>{ambulance.type.toUpperCase()}</Badge>
                            </div>
                            <div className="text-sm text-gray-600 flex flex-wrap gap-2 mt-1">
                              <span>{ambulance.eta}</span>
                              {ambulance.baseLocation && (
                                <>
                                  <span>•</span>
                                  <span>{ambulance.baseLocation}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <Button size="sm" onClick={() => handleAmbulanceCall(ambulance.contact)}>
                            <Phone className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="hospitals" className="space-y-4">
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search hospitals..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>

              <div className="space-y-4">
                {nearbyHospitals.map((hospital) => (
                  <Card key={hospital.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{hospital.name}</h3>
                            <Badge variant={hospital.emergency ? "default" : "secondary"}>
                              {hospital.emergency ? 'Emergency' : 'Urgent Care'}
                            </Badge>
                            <Badge className={getTraumaLevelColor(hospital.traumaLevel)}>
                              Level {hospital.traumaLevel}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Distance:</span> {hospital.distance}
                            </div>
                            <div>
                              <span className="font-medium">Wait Time:</span> {hospital.waitTime}
                            </div>
                            <div>
                              <span className="font-medium">Available Beds:</span> {hospital.beds}
                            </div>
                            <div>
                              <span className="font-medium">Rating:</span> {hospital.rating} ⭐
                            </div>
                          </div>
                          <div className="mt-3">
                            <div className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                              <MapPin className="w-3 h-3" />
                              <span>{hospital.address || '—'}</span>
                            </div>
                            <span className="font-medium">Specialties:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {hospital.specialties.map((specialty, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {specialty}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button onClick={() => handleHospitalCall(hospital.contact)}>
                            <Phone className="w-4 h-4 mr-2" />
                            Call
                          </Button>
                          <Button variant="outline" onClick={async () => {
                            try {
                              const res = await emergencyServicesService.getHospitalDetails(String(hospital.id));
                              const d = res.data?.data || res.data || {};
                              const enriched = {
                                ...hospital,
                                address: formatAddress(d.address || hospital.address),
                                specialties: d.specialties || hospital.specialties,
                                facilities: d.facilities || [],
                                insuranceAccepted: d.insuranceAccepted || [],
                                beds: d.bedCapacity?.total || hospital.beds,
                                rating: d.rating || hospital.rating,
                                emergencyCapacity: d.emergencyCapacity || hospital.emergencyCapacity,
                              } as Hospital;
                              setSelectedHospital(enriched);
                            } catch {
                              setSelectedHospital(hospital);
                            }
                            setShowHospitalDialog(true);
                          }}>
                            <Info className="w-4 h-4 mr-2" />
                            Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="ambulance" className="space-y-4">
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search ambulance services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>

              <div className="space-y-4">
                {ambulanceServices.map((ambulance) => (
                  <Card key={ambulance.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{ambulance.name}</h3>
                            <Badge className={getAmbulanceTypeColor(ambulance.type)}>
                              {ambulance.type.toUpperCase()}
                            </Badge>
                            <Badge variant={ambulance.available ? "default" : "secondary"}>
                              {ambulance.available ? 'Available' : 'Unavailable'}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-medium">ETA:</span> {ambulance.eta}
                            </div>
                            <div>
                              <span className="font-medium">Vehicle:</span> {ambulance.vehicleNumber}
                            </div>
                            <div>
                              <span className="font-medium">Driver:</span> {ambulance.driver}
                            </div>
                            <div>
                              <span className="font-medium">Insurance:</span> {ambulance.insuranceCovered ? 'Covered' : 'Not Covered'}
                            </div>
                          </div>
                          <div className="mt-3">
                            <span className="font-medium">Equipment:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {ambulance.equipment.map((item, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {item}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button 
                            onClick={() => handleAmbulanceCall(ambulance.contact)}
                            disabled={!ambulance.available}
                          >
                            <Phone className="w-4 h-4 mr-2" />
                            Book Now
                          </Button>
                          <Button variant="outline" onClick={() => {
                            setSelectedAmbulance(ambulance);
                            setShowAmbulanceDialog(true);
                          }}>
                            <Info className="w-4 h-4 mr-2" />
                            Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="contacts" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Emergency Contacts</h3>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Contact
                </Button>
              </div>

              <div className="space-y-4">
                {emergencyContacts.map((contact) => (
                  <Card key={contact.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getContactTypeColor(contact.type)}`}>
                            <span className="text-white font-medium">
                              {contact.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{contact.name}</h3>
                              <Badge variant="outline" className="text-xs">
                                {contact.type}
                              </Badge>
                              {contact.isFavorite && (
                                <Badge className="bg-health-warning text-white text-xs">
                                  Favorite
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{contact.number}</p>
                            {contact.relationship && (
                              <p className="text-xs text-gray-500">{contact.relationship}</p>
                            )}
                            {contact.notes && (
                              <p className="text-xs text-gray-500 mt-1">{contact.notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleContactCall(contact.number)}>
                            <Phone className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Hospital Details Dialog */}
      <Dialog open={showHospitalDialog} onOpenChange={setShowHospitalDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedHospital?.name}</DialogTitle>
          </DialogHeader>
          {selectedHospital && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Contact Information</h4>
                  <p><strong>Phone:</strong> {selectedHospital.contact}</p>
                  <p><strong>Address:</strong> {selectedHospital.address}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Emergency Details</h4>
                  <p><strong>Trauma Level:</strong> {selectedHospital.traumaLevel}</p>
                  <p><strong>Emergency Capacity:</strong> {selectedHospital.emergencyCapacity}%</p>
                  <p><strong>Wait Time:</strong> {selectedHospital.waitTime}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Specialties</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedHospital.specialties.map((specialty, index) => (
                    <Badge key={index} variant="outline">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Facilities</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedHospital.facilities.map((facility, index) => (
                    <Badge key={index} variant="outline">
                      {facility}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Insurance Accepted</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedHospital.insuranceAccepted.map((insurance, index) => (
                    <Badge key={index} variant="outline">
                      {insurance}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Ambulance Details Dialog */}
      <Dialog open={showAmbulanceDialog} onOpenChange={setShowAmbulanceDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedAmbulance?.name}</DialogTitle>
          </DialogHeader>
          {selectedAmbulance && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Contact Information</h4>
                  <p><strong>Phone:</strong> {selectedAmbulance.contact}</p>
                  <p><strong>Vehicle:</strong> {selectedAmbulance.vehicleNumber}</p>
                  <p><strong>Driver:</strong> {selectedAmbulance.driver}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Service Details</h4>
                  <p><strong>Type:</strong> {selectedAmbulance.type}</p>
                  <p><strong>Response Time:</strong> {selectedAmbulance.responseTime}</p>
                  <p><strong>Base Location:</strong> {selectedAmbulance.baseLocation}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Equipment</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedAmbulance.equipment.map((item, index) => (
                    <Badge key={index} variant="outline">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleAmbulanceCall(selectedAmbulance.contact)}>
                  <Phone className="w-4 h-4 mr-2" />
                  Book Now
                </Button>
                <Button variant="outline">
                  <MapPin className="w-4 h-4 mr-2" />
                  Track Location
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmergencyServices; 