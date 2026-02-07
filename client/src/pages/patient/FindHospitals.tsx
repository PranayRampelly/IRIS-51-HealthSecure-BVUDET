import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Hospital, MapPin, Phone, Clock, Star, Filter, Search,
  Navigation, Info, Heart, Shield, Users, Calendar,
  CheckCircle, XCircle, AlertTriangle, Plus
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  operatingHours: string;
  emergencyContact: string;
  website: string;
  reviews: {
    rating: number;
    count: number;
    recent: Array<{
      user: string;
      rating: number;
      comment: string;
      date: string;
    }>;
  };
}

const FindHospitals = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [showHospitalDialog, setShowHospitalDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [selectedTraumaLevel, setSelectedTraumaLevel] = useState<string>('');
  const [selectedInsurance, setSelectedInsurance] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('distance');
  const [activeTab, setActiveTab] = useState('list');

  // Mock data
  const mockHospitals: Hospital[] = [
    {
      id: 1,
      name: 'City General Hospital',
      distance: '2.3 km',
      beds: 45,
      rating: 4.5,
      emergency: true,
      specialties: ['Emergency Medicine', 'Cardiology', 'Trauma', 'Neurology', 'Pediatrics'],
      waitTime: '15-30 minutes',
      contact: '+1-555-0101',
      address: '123 Main Street, City Center',
      coordinates: { lat: 40.7128, lng: -74.0060 },
      emergencyCapacity: 85,
      traumaLevel: 'I',
      insuranceAccepted: ['Blue Cross', 'Aetna', 'Cigna', 'Medicare', 'Medicaid'],
      facilities: ['CT Scan', 'MRI', 'ICU', 'Helipad', 'Burn Unit', 'Cardiac Cath Lab'],
      operatingHours: '24/7',
      emergencyContact: '+1-555-0101',
      website: 'https://citygeneral.com',
      reviews: {
        rating: 4.5,
        count: 128,
        recent: [
          { user: 'John D.', rating: 5, comment: 'Excellent emergency care', date: '2024-01-15' },
          { user: 'Sarah M.', rating: 4, comment: 'Good staff, clean facility', date: '2024-01-14' }
        ]
      }
    },
    {
      id: 2,
      name: 'Metro Medical Center',
      distance: '4.1 km',
      beds: 23,
      rating: 4.2,
      emergency: true,
      specialties: ['Emergency Medicine', 'Neurology', 'Pediatrics', 'Orthopedics'],
      waitTime: '20-45 minutes',
      contact: '+1-555-0102',
      address: '456 Oak Avenue, Metro District',
      coordinates: { lat: 40.7589, lng: -73.9851 },
      emergencyCapacity: 60,
      traumaLevel: 'II',
      insuranceAccepted: ['Blue Cross', 'Aetna', 'Medicare'],
      facilities: ['CT Scan', 'ICU', 'Pediatric Unit', 'Rehabilitation Center'],
      operatingHours: '24/7',
      emergencyContact: '+1-555-0102',
      website: 'https://metromedical.com',
      reviews: {
        rating: 4.2,
        count: 89,
        recent: [
          { user: 'Mike R.', rating: 4, comment: 'Professional staff', date: '2024-01-13' },
          { user: 'Lisa K.', rating: 5, comment: 'Great pediatric care', date: '2024-01-12' }
        ]
      }
    },
    {
      id: 3,
      name: 'Community Health Clinic',
      distance: '1.8 km',
      beds: 12,
      rating: 4.0,
      emergency: false,
      specialties: ['Primary Care', 'Urgent Care', 'Family Medicine'],
      waitTime: '10-20 minutes',
      contact: '+1-555-0103',
      address: '789 Pine Road, Community Area',
      coordinates: { lat: 40.7505, lng: -73.9934 },
      emergencyCapacity: 30,
      traumaLevel: 'V',
      insuranceAccepted: ['Medicare', 'Medicaid'],
      facilities: ['X-Ray', 'Lab Services', 'Pharmacy'],
      operatingHours: '8 AM - 8 PM',
      emergencyContact: '+1-555-0103',
      website: 'https://communityhealth.com',
      reviews: {
        rating: 4.0,
        count: 67,
        recent: [
          { user: 'David L.', rating: 4, comment: 'Convenient location', date: '2024-01-11' },
          { user: 'Anna P.', rating: 4, comment: 'Good primary care', date: '2024-01-10' }
        ]
      }
    },
    {
      id: 4,
      name: 'University Medical Center',
      distance: '6.2 km',
      beds: 67,
      rating: 4.8,
      emergency: true,
      specialties: ['Emergency Medicine', 'Cardiology', 'Neurology', 'Trauma', 'Burn Unit', 'Research'],
      waitTime: '25-40 minutes',
      contact: '+1-555-0104',
      address: '321 University Blvd, Academic District',
      coordinates: { lat: 40.7484, lng: -73.9857 },
      emergencyCapacity: 95,
      traumaLevel: 'I',
      insuranceAccepted: ['Blue Cross', 'Aetna', 'Cigna', 'Medicare', 'Medicaid'],
      facilities: ['CT Scan', 'MRI', 'ICU', 'Helipad', 'Burn Unit', 'Research Lab', 'Advanced Imaging'],
      operatingHours: '24/7',
      emergencyContact: '+1-555-0104',
      website: 'https://universitymedical.com',
      reviews: {
        rating: 4.8,
        count: 234,
        recent: [
          { user: 'Dr. Smith', rating: 5, comment: 'Excellent research facilities', date: '2024-01-16' },
          { user: 'Maria G.', rating: 5, comment: 'Top-notch medical care', date: '2024-01-15' }
        ]
      }
    }
  ];

  useEffect(() => {
    setHospitals(mockHospitals);
    setFilteredHospitals(mockHospitals);
  }, []);

  useEffect(() => {
    let filtered = hospitals;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(hospital =>
        hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hospital.specialties.some(specialty => 
          specialty.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Apply specialty filter
    if (selectedSpecialty) {
      filtered = filtered.filter(hospital =>
        hospital.specialties.includes(selectedSpecialty)
      );
    }

    // Apply trauma level filter
    if (selectedTraumaLevel) {
      filtered = filtered.filter(hospital =>
        hospital.traumaLevel === selectedTraumaLevel
      );
    }

    // Apply insurance filter
    if (selectedInsurance) {
      filtered = filtered.filter(hospital =>
        hospital.insuranceAccepted.includes(selectedInsurance)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return parseFloat(a.distance) - parseFloat(b.distance);
        case 'rating':
          return b.rating - a.rating;
        case 'waitTime':
          return parseInt(a.waitTime) - parseInt(b.waitTime);
        case 'beds':
          return b.beds - a.beds;
        default:
          return 0;
      }
    });

    setFilteredHospitals(filtered);
  }, [hospitals, searchQuery, selectedSpecialty, selectedTraumaLevel, selectedInsurance, sortBy]);

  const handleHospitalCall = (contact: string) => {
    window.open(`tel:${contact}`, '_self');
  };

  const handleGetDirections = (hospital: Hospital) => {
    const { lat, lng } = hospital.coordinates;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
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

  const getCapacityColor = (capacity: number) => {
    if (capacity >= 80) return 'text-health-success';
    if (capacity >= 60) return 'text-health-warning';
    return 'text-health-danger';
  };

  const allSpecialties = Array.from(new Set(hospitals.flatMap(h => h.specialties)));
  const allInsurance = Array.from(new Set(hospitals.flatMap(h => h.insuranceAccepted)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-health-teal to-health-aqua text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Hospital className="w-6 h-6" />
            Find Hospitals
          </CardTitle>
          <p className="text-health-light-gray">
            Locate nearby hospitals with real-time bed availability, wait times, and emergency services.
          </p>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <Input
                placeholder="Search hospitals by name or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger>
                <SelectValue placeholder="Specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {allSpecialties.map((specialty) => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedTraumaLevel} onValueChange={setSelectedTraumaLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Trauma Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="I">Level I</SelectItem>
                <SelectItem value="II">Level II</SelectItem>
                <SelectItem value="III">Level III</SelectItem>
                <SelectItem value="IV">Level IV</SelectItem>
                <SelectItem value="V">Level V</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="distance">Distance</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="waitTime">Wait Time</SelectItem>
                <SelectItem value="beds">Available Beds</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Hospitals ({filteredHospitals.length} found)</span>
            <div className="flex gap-2">
              <Button
                variant={activeTab === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('list')}
              >
                List View
              </Button>
              <Button
                variant={activeTab === 'map' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('map')}
              >
                Map View
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="list" className="space-y-4">
              {filteredHospitals.map((hospital) => (
                <Card key={hospital.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-semibold">{hospital.name}</h3>
                          <Badge variant={hospital.emergency ? "default" : "secondary"}>
                            {hospital.emergency ? 'Emergency' : 'Urgent Care'}
                          </Badge>
                          <Badge className={getTraumaLevelColor(hospital.traumaLevel)}>
                            Level {hospital.traumaLevel}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm">{hospital.rating}</span>
                            <span className="text-sm text-gray-500">({hospital.reviews.count})</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">{hospital.distance}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">{hospital.waitTime}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Heart className="w-4 h-4 text-gray-500" />
                            <span className={`text-sm ${getCapacityColor(hospital.emergencyCapacity)}`}>
                              {hospital.emergencyCapacity}% capacity
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">{hospital.beds} beds</span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <span className="font-medium text-sm">Specialties:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {hospital.specialties.slice(0, 3).map((specialty, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                            {hospital.specialties.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{hospital.specialties.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>{hospital.address}</span>
                          <span>•</span>
                          <span>{hospital.operatingHours}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <Button onClick={() => handleHospitalCall(hospital.contact)}>
                          <Phone className="w-4 h-4 mr-2" />
                          Call
                        </Button>
                        <Button variant="outline" onClick={() => handleGetDirections(hospital)}>
                          <Navigation className="w-4 h-4 mr-2" />
                          Directions
                        </Button>
                        <Button variant="outline" onClick={() => {
                          setSelectedHospital(hospital);
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
            </TabsContent>

            <TabsContent value="map" className="space-y-4">
              <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Map view coming soon</p>
                  <p className="text-sm text-gray-500">Interactive map with hospital locations</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Hospital Details Dialog */}
      <Dialog open={showHospitalDialog} onOpenChange={setShowHospitalDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Hospital className="w-5 h-5" />
              {selectedHospital?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedHospital && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Contact Information</h4>
                  <div className="space-y-2">
                    <p><strong>Phone:</strong> {selectedHospital.contact}</p>
                    <p><strong>Emergency:</strong> {selectedHospital.emergencyContact}</p>
                    <p><strong>Address:</strong> {selectedHospital.address}</p>
                    <p><strong>Website:</strong> <a href={selectedHospital.website} target="_blank" rel="noopener noreferrer" className="text-health-teal hover:underline">{selectedHospital.website}</a></p>
                    <p><strong>Hours:</strong> {selectedHospital.operatingHours}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Emergency Details</h4>
                  <div className="space-y-2">
                    <p><strong>Trauma Level:</strong> <Badge className={getTraumaLevelColor(selectedHospital.traumaLevel)}>Level {selectedHospital.traumaLevel}</Badge></p>
                    <p><strong>Emergency Capacity:</strong> <span className={getCapacityColor(selectedHospital.emergencyCapacity)}>{selectedHospital.emergencyCapacity}%</span></p>
                    <p><strong>Wait Time:</strong> {selectedHospital.waitTime}</p>
                    <p><strong>Available Beds:</strong> {selectedHospital.beds}</p>
                    <p><strong>Rating:</strong> {selectedHospital.rating} ⭐ ({selectedHospital.reviews.count} reviews)</p>
                  </div>
                </div>
              </div>

              {/* Specialties */}
              <div>
                <h4 className="font-semibold mb-3">Medical Specialties</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedHospital.specialties.map((specialty, index) => (
                    <Badge key={index} variant="outline">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Facilities */}
              <div>
                <h4 className="font-semibold mb-3">Facilities & Equipment</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedHospital.facilities.map((facility, index) => (
                    <Badge key={index} variant="outline">
                      {facility}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Insurance */}
              <div>
                <h4 className="font-semibold mb-3">Insurance Accepted</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedHospital.insuranceAccepted.map((insurance, index) => (
                    <Badge key={index} variant="outline">
                      {insurance}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Reviews */}
              <div>
                <h4 className="font-semibold mb-3">Recent Reviews</h4>
                <div className="space-y-3">
                  {selectedHospital.reviews.recent.map((review, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{review.user}</span>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{review.comment}</p>
                      <p className="text-xs text-gray-500 mt-1">{review.date}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button onClick={() => handleHospitalCall(selectedHospital.contact)}>
                  <Phone className="w-4 h-4 mr-2" />
                  Call Hospital
                </Button>
                <Button variant="outline" onClick={() => handleGetDirections(selectedHospital)}>
                  <Navigation className="w-4 h-4 mr-2" />
                  Get Directions
                </Button>
                <Button variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Appointment
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FindHospitals; 