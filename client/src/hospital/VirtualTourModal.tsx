import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Camera, X, Play, Pause, RotateCcw, Maximize2, 
  MapPin, Info, Users, Bed, Stethoscope, 
  Building, Phone, Mail, Clock, ArrowLeft, ArrowRight,
  Home, Heart, Brain, Eye, Baby, Shield, AlertTriangle
} from 'lucide-react';
import { Hospital } from '@/services/hospitalServicesService';
import { toast } from 'sonner';

interface VirtualTourModalProps {
  hospital: Hospital;
  onClose: () => void;
}

interface TourLocation {
  id: string;
  name: string;
  description: string;
  image: string;
  type: 'entrance' | 'lobby' | 'emergency' | 'cardiology' | 'neurology' | 'pediatrics' | 'surgery' | 'icu' | 'pharmacy' | 'cafeteria';
  coordinates: { x: number; y: number };
  hotspots: Hotspot[];
  facilities: string[];
  staffCount: number;
  capacity: number;
}

interface Hotspot {
  id: string;
  title: string;
  description: string;
  position: { x: number; y: number };
  type: 'info' | 'facility' | 'staff' | 'equipment';
}

const VirtualTourModal: React.FC<VirtualTourModalProps> = ({ hospital, onClose }) => {
  const [currentLocation, setCurrentLocation] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHotspots, setShowHotspots] = useState(true);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const tourRef = useRef<HTMLDivElement>(null);

  // Mock tour locations for demonstration
  const tourLocations: TourLocation[] = [
    {
      id: 'entrance',
      name: 'Main Entrance',
      description: 'Welcome to our hospital. This is the main entrance where patients and visitors are greeted by our friendly staff.',
      image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&h=600&fit=crop',
      type: 'entrance',
      coordinates: { x: 0, y: 0 },
      hotspots: [
        {
          id: 'reception',
          title: 'Reception Desk',
          description: 'Our reception staff is available 24/7 to assist you with check-ins, appointments, and general inquiries.',
          position: { x: 50, y: 30 },
          type: 'info'
        },
        {
          id: 'security',
          title: 'Security Checkpoint',
          description: 'For your safety, all visitors must pass through our security checkpoint.',
          position: { x: 80, y: 60 },
          type: 'facility'
        }
      ],
      facilities: ['Reception', 'Security', 'Information Desk', 'Wheelchair Access'],
      staffCount: 8,
      capacity: 50
    },
    {
      id: 'lobby',
      name: 'Main Lobby',
      description: 'Our spacious lobby provides a comfortable waiting area with modern amenities and clear signage.',
      image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=600&fit=crop',
      type: 'lobby',
      coordinates: { x: 0, y: 0 },
      hotspots: [
        {
          id: 'waiting',
          title: 'Waiting Area',
          description: 'Comfortable seating areas with charging stations and free Wi-Fi for patients and visitors.',
          position: { x: 30, y: 40 },
          type: 'facility'
        },
        {
          id: 'cafe',
          title: 'Hospital Café',
          description: 'Fresh coffee, snacks, and light meals available for patients and visitors.',
          position: { x: 70, y: 20 },
          type: 'facility'
        }
      ],
      facilities: ['Waiting Areas', 'Café', 'Gift Shop', 'ATM', 'Restrooms'],
      staffCount: 12,
      capacity: 100
    },
    {
      id: 'emergency',
      name: 'Emergency Department',
      description: 'Our state-of-the-art emergency department is equipped to handle all types of medical emergencies 24/7.',
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop',
      type: 'emergency',
      coordinates: { x: 0, y: 0 },
      hotspots: [
        {
          id: 'triage',
          title: 'Triage Area',
          description: 'Patients are assessed and prioritized based on the severity of their condition.',
          position: { x: 40, y: 50 },
          type: 'info'
        },
        {
          id: 'trauma',
          title: 'Trauma Room',
          description: 'Fully equipped trauma rooms for critical care and emergency procedures.',
          position: { x: 60, y: 30 },
          type: 'equipment'
        }
      ],
      facilities: ['Triage', 'Trauma Rooms', 'Observation Units', 'Fast Track'],
      staffCount: 25,
      capacity: 20
    },
    {
      id: 'cardiology',
      name: 'Cardiology Department',
      description: 'Advanced cardiac care with the latest diagnostic and treatment technologies.',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600&fit=crop',
      type: 'cardiology',
      coordinates: { x: 0, y: 0 },
      hotspots: [
        {
          id: 'cath-lab',
          title: 'Catheterization Lab',
          description: 'State-of-the-art cardiac catheterization laboratory for diagnostic and interventional procedures.',
          position: { x: 50, y: 40 },
          type: 'equipment'
        },
        {
          id: 'cardiac-icu',
          title: 'Cardiac ICU',
          description: 'Specialized intensive care unit for cardiac patients with continuous monitoring.',
          position: { x: 30, y: 60 },
          type: 'facility'
        }
      ],
      facilities: ['Cath Lab', 'Cardiac ICU', 'Echo Lab', 'Stress Testing'],
      staffCount: 18,
      capacity: 15
    },
    {
      id: 'surgery',
      name: 'Operating Rooms',
      description: 'Modern operating suites equipped with advanced surgical technology and robotics.',
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop',
      type: 'surgery',
      coordinates: { x: 0, y: 0 },
      hotspots: [
        {
          id: 'or-1',
          title: 'Operating Room 1',
          description: 'Main operating room equipped with robotic surgery capabilities.',
          position: { x: 40, y: 50 },
          type: 'equipment'
        },
        {
          id: 'pre-op',
          title: 'Pre-Operative Area',
          description: 'Preparation area where patients are prepared for surgery.',
          position: { x: 60, y: 30 },
          type: 'facility'
        }
      ],
      facilities: ['Operating Rooms', 'Pre-Op Area', 'Post-Op Recovery', 'Sterile Processing'],
      staffCount: 30,
      capacity: 8
    }
  ];

  useEffect(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  const handleLocationChange = (direction: 'next' | 'prev') => {
    if (direction === 'next') {
      setCurrentLocation(prev => (prev + 1) % tourLocations.length);
    } else {
      setCurrentLocation(prev => (prev - 1 + tourLocations.length) % tourLocations.length);
    }
    setProgress(0);
    setSelectedHotspot(null);
  };

  const handleHotspotClick = (hotspot: Hotspot) => {
    setSelectedHotspot(hotspot);
    toast.info(hotspot.title);
  };

  const handleFullscreen = () => {
    if (tourRef.current) {
      if (!isFullscreen) {
        tourRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'entrance':
        return <Home className="h-4 w-4" />;
      case 'emergency':
        return <AlertTriangle className="h-4 w-4" />;
      case 'cardiology':
        return <Heart className="h-4 w-4" />;
      case 'neurology':
        return <Brain className="h-4 w-4" />;
      case 'pediatrics':
        return <Baby className="h-4 w-4" />;
      case 'surgery':
        return <Stethoscope className="h-4 w-4" />;
      default:
        return <Building className="h-4 w-4" />;
    }
  };

  const currentTourLocation = tourLocations[currentLocation];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-health-teal/10 rounded-full flex items-center justify-center">
                <Camera className="h-5 w-5 text-health-teal" />
              </div>
              <div>
                <h3 className="font-semibold">Virtual Tour - {hospital.name}</h3>
                <p className="text-sm text-gray-500">Explore our facilities</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex h-[600px]">
          {/* Tour Viewer */}
          <div className="flex-1 relative bg-black" ref={tourRef}>
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-health-teal"></div>
              </div>
            ) : (
              <>
                {/* 360° Image */}
                <div className="relative w-full h-full">
                  <img
                    src={currentTourLocation.image}
                    alt={currentTourLocation.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Hotspots */}
                  {showHotspots && currentTourLocation.hotspots.map((hotspot) => (
                    <button
                      key={hotspot.id}
                      className="absolute w-6 h-6 bg-health-teal/80 hover:bg-health-teal rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                      style={{
                        left: `${hotspot.position.x}%`,
                        top: `${hotspot.position.y}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                      onClick={() => handleHotspotClick(hotspot)}
                    >
                      <Info className="h-3 w-3 text-white" />
                    </button>
                  ))}
                </div>

                {/* Tour Controls */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 bg-black/50 backdrop-blur-sm rounded-lg p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLocationChange('prev')}
                    className="text-white hover:bg-white/20"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="text-white hover:bg-white/20"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setProgress(0);
                      setIsPlaying(false);
                    }}
                    className="text-white hover:bg-white/20"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleFullscreen}
                    className="text-white hover:bg-white/20"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <Progress value={progress} className="h-1" />
                </div>

                {/* Location Indicator */}
                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-2 text-white">
                  <div className="flex items-center space-x-2">
                    {getLocationIcon(currentTourLocation.type)}
                    <span className="text-sm font-medium">{currentTourLocation.name}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Information Panel */}
          <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Current Location Info */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  {getLocationIcon(currentTourLocation.type)}
                  <h3 className="font-semibold text-lg">{currentTourLocation.name}</h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {currentTourLocation.description}
                </p>
              </div>

              {/* Location Stats */}
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="flex items-center justify-center w-8 h-8 bg-health-teal/10 rounded-full mx-auto mb-2">
                        <Users className="h-4 w-4 text-health-teal" />
                      </div>
                      <p className="text-2xl font-bold text-health-teal">{currentTourLocation.staffCount}</p>
                      <p className="text-xs text-gray-600">Staff</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center w-8 h-8 bg-green-500/10 rounded-full mx-auto mb-2">
                        <Bed className="h-4 w-4 text-green-500" />
                      </div>
                      <p className="text-2xl font-bold text-green-600">{currentTourLocation.capacity}</p>
                      <p className="text-xs text-gray-600">Capacity</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Facilities */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <Building className="h-4 w-4 mr-2 text-health-teal" />
                  Facilities
                </h4>
                <div className="flex flex-wrap gap-2">
                  {currentTourLocation.facilities.map((facility, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {facility}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Hotspots */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-health-teal" />
                  Points of Interest
                </h4>
                <div className="space-y-2">
                  {currentTourLocation.hotspots.map((hotspot) => (
                    <button
                      key={hotspot.id}
                      className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-health-teal hover:bg-health-teal/5 transition-colors"
                      onClick={() => handleHotspotClick(hotspot)}
                    >
                      <div className="flex items-start space-x-2">
                        <Info className="h-4 w-4 text-health-teal mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm">{hotspot.title}</p>
                          <p className="text-xs text-gray-600 mt-1">{hotspot.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tour Navigation */}
              <div>
                <h4 className="font-semibold mb-3">Tour Locations</h4>
                <div className="space-y-2">
                  {tourLocations.map((location, index) => (
                    <button
                      key={location.id}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        index === currentLocation
                          ? 'border-health-teal bg-health-teal/10'
                          : 'border-gray-200 hover:border-health-teal hover:bg-health-teal/5'
                      }`}
                      onClick={() => setCurrentLocation(index)}
                    >
                      <div className="flex items-center space-x-2">
                        {getLocationIcon(location.type)}
                        <span className="font-medium text-sm">{location.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Hospital Contact */}
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-3">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-health-teal" />
                      <span>{hospital.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-health-teal" />
                      <span>{hospital.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-health-teal" />
                      <span>24/7 Emergency</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Hotspot Detail Modal */}
        {selectedHotspot && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="max-w-md mx-4">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Info className="h-5 w-5 text-health-teal" />
                  <span>{selectedHotspot.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{selectedHotspot.description}</p>
                <Button onClick={() => setSelectedHotspot(null)} className="w-full">
                  Close
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VirtualTourModal; 