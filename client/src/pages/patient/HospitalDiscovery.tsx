import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, MapPin, Phone, Clock, Star, 
  Building, Stethoscope, Calendar, MessageCircle,
  Filter, Heart, Navigation, AlertTriangle
} from 'lucide-react';
import patientHospitalService, { 
  AvailableHospital, 
  HospitalDetails,
  AppointmentBookingData 
} from '@/services/patientHospitalService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const HospitalDiscovery: React.FC = () => {
  const { user } = useAuth();
  const [hospitals, setHospitals] = useState<AvailableHospital[]>([]);
  const [filteredHospitals, setFilteredHospitals] = useState<AvailableHospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<HospitalDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('rating');
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [bookingData, setBookingData] = useState<Partial<AppointmentBookingData>>({});

  // Load hospitals on component mount
  useEffect(() => {
    loadHospitals();
  }, []);

  // Filter hospitals when search or filters change
  useEffect(() => {
    filterHospitals();
  }, [hospitals, searchTerm, selectedType, selectedSpecialty, sortBy]);

  const loadHospitals = async () => {
    try {
      setIsLoading(true);
      const data = await patientHospitalService.getAvailableHospitals();
      setHospitals(data);
    } catch (error) {
      console.error('Failed to load hospitals:', error);
      toast.error('Failed to load hospitals');
    } finally {
      setIsLoading(false);
    }
  };

  const filterHospitals = () => {
    let filtered = [...hospitals];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(hospital =>
        hospital.hospitalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hospital.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hospital.specialties?.some(specialty => 
          specialty.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filter by hospital type
    if (selectedType !== 'all') {
      filtered = filtered.filter(hospital => hospital.hospitalType === selectedType);
    }

    // Filter by specialty
    if (selectedSpecialty !== 'all') {
      filtered = filtered.filter(hospital =>
        hospital.specialties?.includes(selectedSpecialty)
      );
    }

    // Sort hospitals
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'distance':
          return (a.distance || 0) - (b.distance || 0);
        case 'name':
          return a.hospitalName.localeCompare(b.hospitalName);
        case 'waitTime':
          return (a.waitTimes?.emergency || 0) - (b.waitTimes?.emergency || 0);
        default:
          return 0;
      }
    });

    setFilteredHospitals(filtered);
  };

  const handleHospitalSelect = async (hospitalId: string) => {
    try {
      const details = await patientHospitalService.getHospitalDetails(hospitalId);
      setSelectedHospital(details);
    } catch (error) {
      console.error('Failed to load hospital details:', error);
      toast.error('Failed to load hospital details');
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedHospital || !bookingData.appointmentType || !bookingData.scheduledDate || !bookingData.scheduledTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const appointmentData: AppointmentBookingData = {
        hospitalId: selectedHospital._id,
        appointmentType: bookingData.appointmentType!,
        department: bookingData.department!,
        scheduledDate: bookingData.scheduledDate!,
        scheduledTime: bookingData.scheduledTime!,
        symptoms: bookingData.symptoms,
        priority: bookingData.priority,
        estimatedDuration: bookingData.estimatedDuration,
        insuranceInfo: bookingData.insuranceInfo,
        emergencyContact: bookingData.emergencyContact
      };

      await patientHospitalService.bookHospitalAppointment(appointmentData);
      toast.success('Appointment booked successfully!');
      setShowBookingDialog(false);
      setBookingData({});
    } catch (error) {
      console.error('Failed to book appointment:', error);
      toast.error('Failed to book appointment');
    }
  };

  const handleEmergencyRequest = async () => {
    if (!selectedHospital) return;

    try {
      // This would typically open an emergency request form
      toast.info('Emergency request feature coming soon');
    } catch (error) {
      console.error('Failed to send emergency request:', error);
      toast.error('Failed to send emergency request');
    }
  };

  const renderHospitalCard = (hospital: AvailableHospital) => (
    <Card key={hospital._id} className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Building className="w-5 h-5 text-blue-600" />
              <span>{hospital.hospitalName}</span>
            </CardTitle>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="outline">{hospital.hospitalType}</Badge>
              {hospital.rating && (
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm">{hospital.rating.toFixed(1)}</span>
                  <span className="text-sm text-gray-500">({hospital.reviewCount} reviews)</span>
                </div>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleHospitalSelect(hospital._id)}
          >
            View Details
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{hospital.address}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Phone className="w-4 h-4" />
            <span>{hospital.phone}</span>
          </div>

          {hospital.operatingHours && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{hospital.operatingHours}</span>
            </div>
          )}

          {hospital.specialties && (
            <div className="flex flex-wrap gap-1">
              {hospital.specialties.slice(0, 3).map((specialty, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {specialty}
                </Badge>
              ))}
              {hospital.specialties.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{hospital.specialties.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {hospital.waitTimes && (
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center p-2 bg-blue-50 rounded">
                <div className="font-medium">Emergency</div>
                <div>{hospital.waitTimes.emergency} min</div>
              </div>
              <div className="text-center p-2 bg-green-50 rounded">
                <div className="font-medium">Outpatient</div>
                <div>{hospital.waitTimes.outpatient} min</div>
              </div>
              <div className="text-center p-2 bg-yellow-50 rounded">
                <div className="font-medium">Inpatient</div>
                <div>{hospital.waitTimes.inpatient} min</div>
              </div>
            </div>
          )}

          <div className="flex space-x-2 pt-2">
            <Button
              size="sm"
              className="flex-1"
              onClick={() => {
                setSelectedHospital(hospital as HospitalDetails);
                setShowBookingDialog(true);
              }}
            >
              <Calendar className="w-4 h-4 mr-1" />
              Book Appointment
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleHospitalSelect(hospital._id)}
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              Contact
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Find Hospitals</h1>
          <p className="text-gray-600 mt-2">Discover and connect with hospitals near you</p>
        </div>
        <Button variant="outline">
          <Navigation className="w-4 h-4 mr-2" />
          Use My Location
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search hospitals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Hospital Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="General">General Hospital</SelectItem>
                <SelectItem value="Specialty">Specialty Hospital</SelectItem>
                <SelectItem value="Emergency">Emergency Center</SelectItem>
                <SelectItem value="Clinic">Medical Clinic</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger>
                <SelectValue placeholder="Specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                <SelectItem value="Cardiology">Cardiology</SelectItem>
                <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                <SelectItem value="Neurology">Neurology</SelectItem>
                <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                <SelectItem value="Emergency Medicine">Emergency Medicine</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="distance">Distance</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="waitTime">Wait Time</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={loadHospitals}>
              <Filter className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {isLoading ? 'Loading hospitals...' : `${filteredHospitals.length} hospitals found`}
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredHospitals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHospitals.map(renderHospitalCard)}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hospitals found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or filters</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Hospital Details Dialog */}
      {selectedHospital && (
        <Dialog open={!!selectedHospital} onOpenChange={() => setSelectedHospital(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Building className="w-6 h-6 text-blue-600" />
                <span>{selectedHospital.hospitalName}</span>
              </DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="departments">Departments</TabsTrigger>
                <TabsTrigger value="appointments">Book Appointment</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Hospital Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span>{selectedHospital.address}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span>{selectedHospital.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>{selectedHospital.operatingHours}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Specialties</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedHospital.specialties?.map((specialty, index) => (
                        <Badge key={index} variant="secondary">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {selectedHospital.description && (
                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-sm text-gray-600">{selectedHospital.description}</p>
                  </div>
                )}

                {selectedHospital.facilities && (
                  <div>
                    <h4 className="font-semibold mb-2">Facilities</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedHospital.facilities.map((facility, index) => (
                        <Badge key={index} variant="outline">
                          {facility}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="departments" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedHospital.departments?.map((dept) => (
                    <Card key={dept._id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{dept.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-3">{dept.description}</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Wait Time:</span>
                            <span className="font-medium">{dept.currentWaitTime} min</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Available Beds:</span>
                            <span className="font-medium">{dept.capacity.available}/{dept.capacity.total}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Emergency Services:</span>
                            <Badge variant={dept.emergencyServices ? "default" : "secondary"}>
                              {dept.emergencyServices ? "Available" : "Not Available"}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="appointments" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Appointment Type</label>
                    <Select 
                      value={bookingData.appointmentType} 
                      onValueChange={(value) => setBookingData({...bookingData, appointmentType: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consultation">Consultation</SelectItem>
                        <SelectItem value="follow-up">Follow-up</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                        <SelectItem value="routine">Routine Check-up</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Department</label>
                    <Select 
                      value={bookingData.department} 
                      onValueChange={(value) => setBookingData({...bookingData, department: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedHospital.departments?.map((dept) => (
                          <SelectItem key={dept._id} value={dept.name}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Date</label>
                    <Input
                      type="date"
                      value={bookingData.scheduledDate}
                      onChange={(e) => setBookingData({...bookingData, scheduledDate: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Time</label>
                    <Input
                      type="time"
                      value={bookingData.scheduledTime}
                      onChange={(e) => setBookingData({...bookingData, scheduledTime: e.target.value})}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Symptoms (Optional)</label>
                    <Input
                      placeholder="Describe your symptoms..."
                      value={bookingData.symptoms}
                      onChange={(e) => setBookingData({...bookingData, symptoms: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={handleBookAppointment} className="flex-1">
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Appointment
                  </Button>
                  <Button variant="outline" onClick={handleEmergencyRequest}>
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Emergency Request
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="contact" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Contact Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span>{selectedHospital.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <span>Emergency: {selectedHospital.emergencyContact}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Quick Actions</h4>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Send Message
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Navigation className="w-4 h-4 mr-2" />
                        Get Directions
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default HospitalDiscovery; 